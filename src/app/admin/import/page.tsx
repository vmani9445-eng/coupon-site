"use client";

import { useState } from "react";

type PreviewRow = {
  store: string;
  title: string;
  description: string | null;
  discount: string | null;
  code: string | null;
  category: string;
  affiliateUrl: string;
  networkCashback?: number | null;
  logoUrl?: string | null;
};

type DebugNormalizedRow = {
  store: string;
  title: string;
  description: string | null;
  discount: string | null;
  code: string | null;
  category: string;
  affiliateUrl: string;
  networkCashback?: number | null;
  logoUrl?: string | null;
};

type SkippedSample = {
  rowNumber: number;
  normalized: DebugNormalizedRow;
  errors: string[];
};

type ImportResult = {
  ok: boolean;
  previewOnly?: boolean;
  totalRows?: number;
  created?: number;
  updated?: number;
  skipped?: number;
  preview?: PreviewRow[];
  errors?: string[];
  error?: string;
  debugFirstRow?: Record<string, string | undefined> | null;
  debugFirstNormalizedRow?: DebugNormalizedRow | null;
  skippedSamples?: SkippedSample[];
  debugKeys?: string[];
};

export default function ImportCsvPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [loadingImport, setLoadingImport] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  async function upload(previewOnly: boolean) {
    if (!file) {
      setResult({ ok: false, error: "Please select a CSV file" });
      return;
    }

    try {
      if (previewOnly) setLoadingPreview(true);
      else setLoadingImport(true);

      setResult(null);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("previewOnly", String(previewOnly));

      const res = await fetch("/api/admin/import-csv", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ ok: false, error: "Something went wrong" });
    } finally {
      setLoadingPreview(false);
      setLoadingImport(false);
    }
  }

  return (
    <main style={{ padding: "32px" }}>
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 24,
          padding: 24,
        }}
      >
        <h1 style={{ marginBottom: 8, fontSize: 42, lineHeight: 1.05 }}>
          Import Coupons CSV
        </h1>

        <p style={{ marginBottom: 20, color: "#6b7280" }}>
          Upload stores, offers, coupon links, cashback rate, and logo URLs in
          bulk. Preview first, then import.
        </p>

        <div
          style={{
            padding: 16,
            borderRadius: 16,
            background: "#f9fafb",
            border: "1px solid #e5e7eb",
            marginBottom: 20,
          }}
        >
          <p style={{ margin: 0, fontWeight: 700 }}>Supported headers</p>
      <p suppressHydrationWarning style={{ marginTop: 8, color: "#6b7280", lineHeight: 1.6 }}>
            store / store_name, title / offer_title, description, discount,
            code / coupon_code, category / categories / type, affiliateUrl /
            affiliate_url / url / link, network_cashback / cashback /
            commission / payout, logo / logo_url / image / image_url /
            store_logo
          </p>
        </div>

        <input
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 16,
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            onClick={() => upload(true)}
            disabled={loadingPreview || loadingImport}
            style={{
              padding: "12px 18px",
              borderRadius: 12,
              border: "1px solid #d1d5db",
              background: "#fff",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            {loadingPreview ? "Previewing..." : "Preview CSV"}
          </button>

          <button
            type="button"
            onClick={() => upload(false)}
            disabled={loadingPreview || loadingImport}
            style={{
              padding: "12px 18px",
              borderRadius: 12,
              border: "none",
              background: "#111827",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            {loadingImport ? "Importing..." : "Import CSV"}
          </button>
        </div>

        {result && (
          <div
            style={{
              marginTop: 24,
              padding: 16,
              borderRadius: 16,
              background: "#f9fafb",
              border: "1px solid #e5e7eb",
            }}
          >
            {!result.ok ? (
              <p style={{ color: "#b91c1c", margin: 0 }}>{result.error}</p>
            ) : (
              <>
                <p>
                  <strong>Total Rows:</strong> {result.totalRows}
                </p>

                {!result.previewOnly && (
                  <>
                    <p>
                      <strong>Created:</strong> {result.created}
                    </p>
                    <p>
                      <strong>Updated:</strong> {result.updated}
                    </p>
                    <p>
                      <strong>Skipped:</strong> {result.skipped}
                    </p>
                    {result.errors && result.errors.length > 0 && (
                      <p>
                        <strong>Error Rows:</strong> {result.errors.length}
                      </p>
                    )}
                    {result.skippedSamples &&
                      result.skippedSamples.length > 0 && (
                        <p>
                          <strong>Skipped Samples:</strong>{" "}
                          {result.skippedSamples.length}
                        </p>
                      )}
                  </>
                )}

                {result.debugKeys && result.debugKeys.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <p style={{ fontWeight: 700 }}>Detected CSV Headers</p>
                    <pre
                      style={{
                        background: "#fff",
                        padding: 12,
                        border: "1px solid #e5e7eb",
                        borderRadius: 12,
                        overflowX: "auto",
                        fontSize: 12,
                        lineHeight: 1.5,
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                    >
                      {JSON.stringify(result.debugKeys, null, 2)}
                    </pre>
                  </div>
                )}

                {result.debugFirstRow && (
                  <div style={{ marginTop: 16 }}>
                    <p style={{ fontWeight: 700 }}>Debug First Raw Row</p>
                    <pre
                      style={{
                        background: "#fff",
                        padding: 12,
                        border: "1px solid #e5e7eb",
                        borderRadius: 12,
                        overflowX: "auto",
                        fontSize: 12,
                        lineHeight: 1.5,
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                    >
                      {JSON.stringify(result.debugFirstRow, null, 2)}
                    </pre>
                  </div>
                )}

                {result.debugFirstNormalizedRow && (
                  <div style={{ marginTop: 16 }}>
                    <p style={{ fontWeight: 700 }}>Debug First Normalized Row</p>
                    <pre
                      style={{
                        background: "#fff",
                        padding: 12,
                        border: "1px solid #e5e7eb",
                        borderRadius: 12,
                        overflowX: "auto",
                        fontSize: 12,
                        lineHeight: 1.5,
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                    >
                      {JSON.stringify(result.debugFirstNormalizedRow, null, 2)}
                    </pre>
                  </div>
                )}

                {result.skippedSamples && result.skippedSamples.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <p style={{ fontWeight: 700, color: "#b91c1c" }}>
                      Skipped Sample Rows
                    </p>

                    <div style={{ display: "grid", gap: 12 }}>
                      {result.skippedSamples.map((sample, index) => (
                        <div
                          key={`${sample.rowNumber}-${index}`}
                          style={{
                            background: "#fff",
                            border: "1px solid #fecaca",
                            borderRadius: 12,
                            padding: 12,
                          }}
                        >
                          <p
                            style={{
                              margin: "0 0 8px 0",
                              fontWeight: 700,
                              color: "#991b1b",
                            }}
                          >
                            Row {sample.rowNumber}
                          </p>

                          <div style={{ marginBottom: 10 }}>
                            <p
                              style={{
                                margin: "0 0 6px 0",
                                fontWeight: 600,
                                color: "#b91c1c",
                              }}
                            >
                              Errors
                            </p>
                            <ul style={{ margin: 0, paddingLeft: 18 }}>
                              {sample.errors.map((err, errIndex) => (
                                <li
                                  key={errIndex}
                                  style={{
                                    color: "#b91c1c",
                                    marginBottom: 4,
                                  }}
                                >
                                  {err}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <p
                            style={{
                              margin: "0 0 6px 0",
                              fontWeight: 600,
                              color: "#111827",
                            }}
                          >
                            Normalized Row
                          </p>

                          <pre
                            style={{
                              background: "#f9fafb",
                              padding: 12,
                              border: "1px solid #e5e7eb",
                              borderRadius: 12,
                              overflowX: "auto",
                              fontSize: 12,
                              lineHeight: 1.5,
                              whiteSpace: "pre-wrap",
                              wordBreak: "break-word",
                              margin: 0,
                            }}
                          >
                            {JSON.stringify(sample.normalized, null, 2)}
                          </pre>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.preview && result.preview.length > 0 && (
                  <div style={{ marginTop: 16, overflowX: "auto" }}>
                    <p style={{ fontWeight: 700 }}>Preview</p>

                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: 14,
                        minWidth: 1100,
                        background: "#fff",
                        borderRadius: 12,
                        overflow: "hidden",
                      }}
                    >
                      <thead>
                        <tr>
                          {[
                            "Store",
                            "Title",
                            "Description",
                            "Discount",
                            "Code",
                            "Category",
                            "Affiliate URL",
                            "Network Cashback",
                            "Logo URL",
                          ].map((head) => (
                            <th
                              key={head}
                              style={{
                                textAlign: "left",
                                padding: "12px 10px",
                                borderBottom: "1px solid #e5e7eb",
                                background: "#f3f4f6",
                                fontWeight: 700,
                                whiteSpace: "nowrap",
                              }}
                            >
                              {head}
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody>
                        {result.preview.map((row, index) => (
                          <tr key={index}>
                            <td
                              style={{
                                padding: "10px",
                                borderBottom: "1px solid #f3f4f6",
                                verticalAlign: "top",
                              }}
                            >
                              {row.store}
                            </td>

                            <td
                              style={{
                                padding: "10px",
                                borderBottom: "1px solid #f3f4f6",
                                verticalAlign: "top",
                                minWidth: 220,
                              }}
                            >
                              {row.title}
                            </td>

                            <td
                              style={{
                                padding: "10px",
                                borderBottom: "1px solid #f3f4f6",
                                verticalAlign: "top",
                                minWidth: 220,
                              }}
                            >
                              {row.description || "-"}
                            </td>

                            <td
                              style={{
                                padding: "10px",
                                borderBottom: "1px solid #f3f4f6",
                                verticalAlign: "top",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {row.discount || "-"}
                            </td>

                            <td
                              style={{
                                padding: "10px",
                                borderBottom: "1px solid #f3f4f6",
                                verticalAlign: "top",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {row.code || "-"}
                            </td>

                            <td
                              style={{
                                padding: "10px",
                                borderBottom: "1px solid #f3f4f6",
                                verticalAlign: "top",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {row.category}
                            </td>

                            <td
                              style={{
                                padding: "10px",
                                borderBottom: "1px solid #f3f4f6",
                                verticalAlign: "top",
                                minWidth: 250,
                                wordBreak: "break-all",
                              }}
                            >
                              {row.affiliateUrl}
                            </td>

                            <td
                              style={{
                                padding: "10px",
                                borderBottom: "1px solid #f3f4f6",
                                verticalAlign: "top",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {typeof row.networkCashback === "number"
                                ? `${row.networkCashback}%`
                                : "-"}
                            </td>

                            <td
                              style={{
                                padding: "10px",
                                borderBottom: "1px solid #f3f4f6",
                                verticalAlign: "top",
                                minWidth: 220,
                                wordBreak: "break-all",
                              }}
                            >
                              {row.logoUrl || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {result.errors && result.errors.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <p style={{ fontWeight: 700, color: "#b91c1c" }}>
                      Errors
                    </p>
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                      {result.errors.map((err, index) => (
                        <li
                          key={index}
                          style={{ color: "#b91c1c", marginBottom: 6 }}
                        >
                          {err}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}