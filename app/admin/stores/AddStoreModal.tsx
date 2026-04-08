"use client";

import { useState, useTransition } from "react";
import { createStore } from "./actions";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function AddStoreModal({ isOpen, onClose }: Props) {
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  const handleSubmit = (formData: FormData) => {
    setError("");

    startTransition(async () => {
      const result = await createStore(formData);

      if (!result.ok) {
        setError(result.error || "Something went wrong.");
        return;
      }

      onClose();
    });
  };

  return (
    <div className="adminModalOverlay" onClick={onClose}>
      <div className="adminModal" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="adminModalClose"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        <div className="adminModalHeader">
          <h2>Add Store</h2>
          <p>Create a new store for coupons and cashback offers.</p>
        </div>

        <form action={handleSubmit} className="adminForm">
          <div className="adminFormGrid">
            <div className="adminField">
              <label htmlFor="name">Store Name</label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Amazon"
                required
              />
            </div>

            <div className="adminField">
              <label htmlFor="websiteUrl">Website URL</label>
              <input
                id="websiteUrl"
                name="websiteUrl"
                type="url"
                placeholder="https://www.amazon.in"
              />
            </div>

            <div className="adminField adminFieldFull">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                rows={4}
                placeholder="Latest store offers, verified coupon codes, and deals."
              />
            </div>

            <div className="adminField adminFieldFull">
              <label htmlFor="logoFile">Upload Logo</label>
              <input
                id="logoFile"
                name="logoFile"
                type="file"
                accept="image/*"
              />
            </div>

            <div className="adminField adminFieldFull">
              <label htmlFor="logo">Logo URL or Local Path</label>
              <input
                id="logo"
                name="logo"
                type="text"
                placeholder="/uploads/stores/amazon.png or https://example.com/logo.png"
              />
            </div>

            <div className="adminField adminCheckboxField">
              <label className="adminCheckboxRow">
                <input name="isFeatured" type="checkbox" />
                <span>Featured Store</span>
              </label>
            </div>

            <div className="adminField adminCheckboxField">
              <label className="adminCheckboxRow">
                <input name="isActive" type="checkbox" defaultChecked />
                <span>Active Store</span>
              </label>
            </div>
          </div>

          {error ? <p className="adminFormError">{error}</p> : null}

          <div className="adminModalActions">
            <button
              type="button"
              className="adminButton adminButtonGhost"
              onClick={onClose}
            >
              Cancel
            </button>

            <button type="submit" className="adminButton" disabled={isPending}>
              {isPending ? "Saving..." : "Save Store"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}