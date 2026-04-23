"use client";

import { useState, useTransition } from "react";
import { deleteStore } from "./actions";

type Props = {
  id: string;
  name: string;
  disabled?: boolean;
};

export default function DeleteStoreButton({
  id,
  name,
  disabled = false,
}: Props) {
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (disabled) return;

    const confirmed = window.confirm(
      `Delete "${name}"? This cannot be undone.`
    );

    if (!confirmed) return;

    const formData = new FormData();
    formData.append("id", id);

    setError("");

    startTransition(async () => {
      const result = await deleteStore(formData);

      if (!result.ok) {
        setError(result.error || "Delete failed.");
      }
    });
  };

  return (
    <div className="adminDeleteWrap">
      <button
        type="button"
        className="adminTableActionBtn adminTableActionBtnDanger"
        onClick={handleDelete}
        disabled={disabled || isPending}
        title={
          disabled
            ? "Remove coupons and cashback first before deleting this store."
            : "Delete store"
        }
      >
        {isPending ? "Deleting..." : "Delete"}
      </button>

      {error ? <p className="adminInlineError">{error}</p> : null}
    </div>
  );
}