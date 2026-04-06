"use client";

import { useState, useTransition } from "react";
import { deleteCoupon } from "./actions";

type Props = {
  id: string;
  title: string;
};

export default function DeleteCouponButton({ id, title }: Props) {
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    const confirmed = window.confirm(`Delete "${title}"?`);

    if (!confirmed) return;

    const formData = new FormData();
    formData.append("id", id);

    setError("");

    startTransition(async () => {
      const result = await deleteCoupon(formData);

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
        disabled={isPending}
      >
        {isPending ? "Deleting..." : "Delete"}
      </button>

      {error ? <p className="adminInlineError">{error}</p> : null}
    </div>
  );
}