import { ApproveItemButton } from "@/components/dashboard/approve-item-button";
import { DonationItem } from "@/lib/types";
import { CategoryBadge } from "@/components/ui/category-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatCurrency, formatDate, getSafeAppraisalSummary, toTitleCase } from "@/lib/utils";

export function ItemDetailCard({ item, canApprove = false }: { item: DonationItem; canApprove?: boolean }) {
  return (
    <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/85 shadow-card backdrop-blur">
        <img src={item.imageDataUrl} alt={item.itemName} className="h-full min-h-[420px] w-full object-cover" />
      </div>

      <div className="space-y-6 rounded-[2rem] border border-white/80 bg-white/85 p-6 shadow-card backdrop-blur sm:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <CategoryBadge label={toTitleCase(item.category)} />
          <StatusBadge status={item.status} />
          {canApprove && item.status === "waiting-approval" ? <ApproveItemButton itemId={item.id} /> : null}
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sage-700">Item Record</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-900">{item.itemName}</h1>
          <p className="mt-3 text-base leading-7 text-slate-600">
            {item.description || "No additional description was submitted for this item."}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <InfoTile label="Item ID" value={item.id} />
          <InfoTile label="QR Code ID" value={item.qrCodeId} />
          <InfoTile label="Condition" value={toTitleCase(item.condition)} />
          <InfoTile label="Brand" value={item.brand || "Not provided"} />
          <InfoTile label="Size" value={item.size || "Not provided"} />
          <InfoTile label="Submitted" value={formatDate(item.createdAt)} />
        </div>

        <div className="rounded-[1.5rem] border border-peach-100 bg-peach-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-peach-500">Donor Impact</p>
          <p className="mt-3 text-base font-semibold text-slate-900">{item.donorImpactMessage}</p>
          <p className="mt-2 text-sm text-slate-600">
            {item.isAnonymousDonation ? (
              <>Anonymous donation. No loyalty points are attached to this item.</>
            ) : item.status === "waiting-approval" ? (
              <>
                Loyalty points incoming: <span className="font-semibold">{item.loyaltyPointsAwarded}</span>
              </>
            ) : (
              <>
                Loyalty points awarded: <span className="font-semibold">{item.loyaltyPointsAwarded}</span>
              </>
            )}
          </p>
        </div>

        <div className="rounded-[1.5rem] bg-sage-900 p-5 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sage-100">
            Suggested resale range
          </p>
          <p className="mt-3 text-3xl font-semibold">
            {formatCurrency(item.suggestedResaleRange.low)}-{formatCurrency(item.suggestedResaleRange.high)}
          </p>
          <p className="mt-2 text-sm text-sage-100">{getSafeAppraisalSummary(item.appraisal.summary)}</p>
        </div>

        <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-800">Pricing analysis</p>
              <p className="mt-1 text-sm text-slate-500">
                {item.appraisal.pricingMethod === "gemini-grounded"
                  ? `Analyzed with ${item.appraisal.pricingModel} and Google Search grounding.`
                  : item.appraisal.pricingMethod === "gemini"
                    ? `Analyzed with ${item.appraisal.pricingModel}.`
                    : "Generated with the local rules fallback."}
              </p>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-sage-800 ring-1 ring-inset ring-sage-200">
              {formatDate(item.appraisal.analyzedAt)}
            </span>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <InfoTile label="Detected category" value={item.appraisal.detectedCategory} />
            <InfoTile label="Condition note" value={item.appraisal.conditionAssessment} />
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Search queries</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {item.appraisal.searchQueries.length > 0 ? (
                item.appraisal.searchQueries.map((query) => (
                  <span
                    key={query}
                    className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-200"
                  >
                    {query}
                  </span>
                ))
              ) : (
                <span className="text-sm text-slate-500">No live search queries were stored for this item.</span>
              )}
            </div>
          </div>
          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Sources</p>
            <div className="mt-3 space-y-3">
              {item.appraisal.sources.length > 0 ? (
                item.appraisal.sources.map((source) => (
                  <a
                    key={source.uri}
                    href={source.uri}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-2xl bg-white px-4 py-3 text-sm transition hover:bg-slate-100"
                  >
                    <p className="font-semibold text-slate-800">{source.title}</p>
                    <p className="mt-1 break-all text-slate-500">{source.uri}</p>
                  </a>
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  No grounded web sources were stored. If Gemini was unavailable, the app used the rules fallback.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-semibold text-slate-800">QR Code</p>
          <p className="mt-1 text-sm text-slate-500">
            Staff can scan this code to open this record directly. The QR footer includes the submitted category and condition.
          </p>
          <div className="mt-4 flex justify-center rounded-[1.25rem] bg-white p-4">
            <img src={item.qrCodeDataUrl} alt={`QR code for ${item.itemName}`} className="h-52 w-52" />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-2 text-base font-semibold text-slate-800">{value}</p>
    </div>
  );
}
