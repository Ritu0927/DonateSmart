"use client";

export function DownloadQrButton({
  qrCodeDataUrl,
  itemId
}: {
  qrCodeDataUrl: string;
  itemId: string;
}) {
  function handleDownload() {
    const link = document.createElement("a");
    link.href = qrCodeDataUrl;
    link.download = `donatesmart-qr-${itemId}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      className="inline-flex w-full items-center justify-center rounded-full bg-sage-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sage-700"
    >
      Download QR
    </button>
  );
}
