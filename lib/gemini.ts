import { GoogleGenAI } from "@google/genai";
import { estimateSuggestedResaleRange } from "@/lib/pricing";
import { AppraisalSource, DonationInput, ItemAppraisal, SuggestedRange } from "@/lib/types";
import { toTitleCase } from "@/lib/utils";

const defaultGeminiModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";

export class DonationReviewError extends Error {
  fieldErrors: Record<string, string>;

  constructor(message: string, fieldErrors: Record<string, string>) {
    super(message);
    this.name = "DonationReviewError";
    this.fieldErrors = fieldErrors;
  }
}

function extractJsonText(rawText: string) {
  const trimmed = rawText.trim();

  if (trimmed.startsWith("```")) {
    return trimmed.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "");
  }

  const objectStart = trimmed.indexOf("{");
  const objectEnd = trimmed.lastIndexOf("}");

  if (objectStart !== -1 && objectEnd !== -1 && objectEnd > objectStart) {
    return trimmed.slice(objectStart, objectEnd + 1);
  }

  return trimmed;
}

function parseImageDataUrl(dataUrl: string) {
  const match = dataUrl.match(/^data:(.+?)(;base64)?,(.*)$/);

  if (!match) {
    throw new Error("Unsupported image data format.");
  }

  const [, mimeType, base64Marker, rawData] = match;
  const data = base64Marker ? rawData : Buffer.from(decodeURIComponent(rawData)).toString("base64");

  return {
    mimeType,
    data
  };
}

function dedupeSources(sources: AppraisalSource[]) {
  const seen = new Set<string>();

  return sources.filter((source) => {
    if (!source.uri || seen.has(source.uri)) {
      return false;
    }

    seen.add(source.uri);
    return true;
  });
}

function buildFallbackAppraisal(
  input: DonationInput,
  summary: string
): { suggestedResaleRange: SuggestedRange; appraisal: ItemAppraisal } {
  const suggestedResaleRange = estimateSuggestedResaleRange(input);

  return {
    suggestedResaleRange,
    appraisal: {
      pricingMethod: "rules",
      pricingModel: "local-rules-v1",
      summary,
      conditionAssessment: `Using the donor-selected ${toTitleCase(input.condition)} condition and ${toTitleCase(input.category)} category.`,
      detectedCategory: toTitleCase(input.category),
      categoryMatch: true,
      validationNote: "The local fallback accepted this item without AI image validation.",
      searchQueries: [],
      sources: [],
      analyzedAt: new Date().toISOString()
    }
  };
}

function getFriendlyGeminiFailureSummary() {
  return "Live Gemini pricing was unavailable for this item, so DonateSmart used the local pricing fallback to prepare a suggested resale range.";
}

function getAiValidationUnavailableError() {
  return new DonationReviewError(
    "AI image validation is unavailable right now. Please check the Gemini API configuration and try again.",
    {
      imageDataUrl:
        "We could not validate this image right now. Verify the Gemini API key in .env.local and resubmit.",
      itemName: "Automatic item verification is temporarily unavailable."
    }
  );
}

export async function appraiseDonationItem(
  input: DonationInput
): Promise<{ suggestedResaleRange: SuggestedRange; appraisal: ItemAppraisal }> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw getAiValidationUnavailableError();
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const imagePart = parseImageDataUrl(input.imageDataUrl);
    const prompt = `
      You are helping a thrift store estimate a suggested resale range for a donated item in the United States.

      Use the uploaded item image and the donor-provided details below. When helpful, use Google Search grounding to look for current resale comps or category-level pricing signals.

      Donor-provided details:
      - Item name: ${input.itemName}
      - Category: ${input.category}
      - Bulk clothing donation: ${input.category === "clothing" ? (input.isBulkClothing ? "Yes" : "No") : "Not applicable"}
      - Bulk clothing quantity range: ${input.bulkClothingRange || "Not provided"}
      - Condition: ${input.condition}
      - Brand: ${input.brand || "Not provided"}
      - Size: ${input.size || "Not provided"}
      - Description: ${input.description || "Not provided"}

      Rules:
      - First decide whether the uploaded image is usable for intake.
      - Reject if the image is blurry, blank, unrelated, contains multiple unclear items, or does not reasonably match the submitted category.
      - Reject if the typed item name does not reasonably match the item shown in the image.
      - Compare all three signals together: item name, selected category, and the visual content of the image.
      - If the image appears to show clothing, do not accept item names like lamp, table, home decor, or other unrelated product types.
      - If the image appears to show clothing/apparel but the submitted category is home, reject it.
      - If the category is clothing and the donor says it is a bulk donation, bagged or wrapped clothing photos are acceptable.
      - For bulk clothing, estimate the suggested resale range for the whole donated bag or bundle, not for a single clothing item.
      - Use the selected clothing quantity range as a strong signal when pricing bulk donations.
      - If you reject the item, explain what is wrong in plain language for a donor.
      - Return a broad suggested resale range, not an exact price.
      - Base the range on the item image, the stated condition, the category, and brand if relevant.
      - Keep the range realistic for a thrift / resale context.
      - Return exactly one JSON object and nothing else.
      - Do not use markdown fences.
      - Use this exact shape:
        {
          "accepted": boolean,
          "rejectionReason": string,
          "low": number,
          "high": number,
          "summary": string,
          "conditionAssessment": string,
          "detectedCategory": string,
          "categoryMatch": boolean,
          "validationNote": string
        }
    `.trim();

    const response = await ai.models.generateContent({
      model: defaultGeminiModel,
      contents: [
        { text: prompt },
        {
          inlineData: {
            mimeType: imagePart.mimeType,
            data: imagePart.data
          }
        }
      ],
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const rawText = typeof response.text === "string" ? response.text : "";

    if (!rawText) {
      throw new Error("Gemini returned an empty appraisal.");
    }

    const parsed = JSON.parse(extractJsonText(rawText)) as {
      accepted: boolean;
      rejectionReason: string;
      low: number;
      high: number;
      summary: string;
      conditionAssessment: string;
      detectedCategory: string;
      categoryMatch: boolean;
      validationNote: string;
    };

    if (!parsed.accepted || !parsed.categoryMatch) {
      const detectedCategory = parsed.detectedCategory?.trim();
      const categoryError =
        detectedCategory && detectedCategory.toLowerCase() !== input.category.toLowerCase()
          ? `The uploaded image looks more like ${detectedCategory} than ${toTitleCase(input.category)}.`
          : "The uploaded image does not appear to match the selected category.";

      throw new DonationReviewError(parsed.rejectionReason || "Please upload a clearer image or choose the correct category.", {
        category: categoryError,
        imageDataUrl: parsed.validationNote || "Please upload a clearer photo of the item.",
        itemName: parsed.rejectionReason || "The item name does not appear to match the uploaded image."
      });
    }

    const low = Math.max(4, Math.round(Number(parsed.low)));
    const high = Math.max(low + 4, Math.round(Number(parsed.high)));
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const sources = dedupeSources(
      (groundingMetadata?.groundingChunks || [])
        .map((chunk) => chunk.web || chunk.retrievedContext)
        .filter((chunk): chunk is { title?: string; uri?: string } => Boolean(chunk?.uri))
        .map((chunk) => ({
          title: chunk.title || "Web source",
          uri: chunk.uri || ""
        }))
    );

    return {
      suggestedResaleRange: {
        low,
        high,
        label: `${low}-${high}`
      },
      appraisal: {
        pricingMethod: sources.length > 0 ? "gemini-grounded" : "gemini",
        pricingModel: defaultGeminiModel,
        summary: parsed.summary,
        conditionAssessment: parsed.conditionAssessment,
        detectedCategory: parsed.detectedCategory,
        categoryMatch: parsed.categoryMatch,
        validationNote: parsed.validationNote,
        searchQueries: groundingMetadata?.webSearchQueries || [],
        sources,
        analyzedAt: new Date().toISOString()
      }
    };
  } catch (error) {
    if (error instanceof DonationReviewError) {
      throw error;
    }

    if (error instanceof Error) {
      console.error("Gemini appraisal failed:", error.message);
    } else {
      console.error("Gemini appraisal failed with an unknown error.");
    }

    throw getAiValidationUnavailableError();
  }
}
