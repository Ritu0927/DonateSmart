import QRCode from "qrcode";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function generateItemQrCodeDataUrl(
  itemUrl: string,
  footerLines: string[]
) {
  const qrSvg = await QRCode.toString(itemUrl, {
    type: "svg",
    margin: 1,
    width: 280,
    color: {
      dark: "#204333",
      light: "#FFFDF8"
    }
  });

  const footerHeight = 78 + footerLines.length * 22;
  const svgHeight = 320 + footerHeight;
  const qrSvgBase64 = Buffer.from(qrSvg).toString("base64");

  const footerText = footerLines
    .map(
      (line, index) =>
        `<text x="160" y="${342 + index * 22}" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#475569">${escapeXml(line)}</text>`
    )
    .join("");

  const compositeSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="320" height="${svgHeight}" viewBox="0 0 320 ${svgHeight}">
      <rect width="320" height="${svgHeight}" rx="30" fill="#FFFDF8"/>
      <rect x="14" y="14" width="292" height="292" rx="28" fill="#FFFFFF" stroke="#DCEBDF"/>
      <image x="20" y="20" width="280" height="280" href="data:image/svg+xml;base64,${qrSvgBase64}" />
      <text x="160" y="328" text-anchor="middle" font-family="Arial, sans-serif" font-size="15" font-weight="700" fill="#204333">DonateSmart Item QR</text>
      ${footerText}
    </svg>
  `.trim();

  return `data:image/svg+xml;base64,${Buffer.from(compositeSvg).toString("base64")}`;
}
