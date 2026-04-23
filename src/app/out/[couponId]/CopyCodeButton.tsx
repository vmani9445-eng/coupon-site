"use client";

import { useState } from "react";

type Props = {
  code: string;
};

export default function CopyCodeButton({ code }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      className={`activationCopyBtn ${copied ? "copied" : ""}`}
      onClick={handleCopy}
    >
      {copied ? "COPIED" : "COPY"}
    </button>
  );
}