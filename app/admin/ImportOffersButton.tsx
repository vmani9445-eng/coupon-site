"use client";

import { useState } from "react";

export default function ImportOffersButton({
  source,
}: {
  source: "amazon" | "flipkart";
}) {
  const [loading, setLoading] = useState(false);

  const handleImport = async () => {
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/sync/${source}`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "Import failed");
      }

      alert(
        `Imported ${data.importedCoupons || 0} coupons and ${
          data.importedCashback || 0
        } cashback offers from ${source}`
      );

      window.location.reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Import failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button className="adminButton" onClick={handleImport} disabled={loading}>
      {loading ? "Importing..." : `Import ${source}`}
    </button>
  );
}