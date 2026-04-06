"use client";

import { useState, useTransition } from "react";
import { createCoupon } from "./actions";

type StoreOption = {
  id: string;
  name: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  stores: StoreOption[];
};

export default function AddCouponModal({ isOpen, onClose, stores }: Props) {
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  const handleSubmit = (formData: FormData) => {
    setError("");

    startTransition(async () => {
      const result = await createCoupon(formData);

      if (!result.ok) {
        setError(result.error || "Failed to save coupon.");
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
          <h2>Add Coupon / Deal</h2>
          <p>Save all details exactly as you want them to appear on the store page.</p>
        </div>

        <form action={handleSubmit} className="adminForm">
          <div className="adminFormGrid">
            <div className="adminField">
              <label htmlFor="storeId">Store</label>
              <select id="storeId" name="storeId" defaultValue="" required>
                <option value="" disabled>
                  Select store
                </option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="adminField">
              <label htmlFor="title">Title</label>
              <input
                id="title"
                name="title"
                type="text"
                placeholder="Flat 20% Off on Fashion"
                required
              />
            </div>

            <div className="adminField">
              <label htmlFor="discount">Discount</label>
              <input
                id="discount"
                name="discount"
                type="text"
                placeholder="20% OFF"
              />
            </div>

            <div className="adminField">
              <label htmlFor="code">Coupon Code</label>
              <input
                id="code"
                name="code"
                type="text"
                placeholder="STYLE20"
              />
            </div>

            <div className="adminField">
              <label htmlFor="category">Category</label>
              <input
                id="category"
                name="category"
                type="text"
                placeholder="Fashion"
              />
            </div>

            <div className="adminField">
              <label htmlFor="bank">Bank Offer</label>
              <input
                id="bank"
                name="bank"
                type="text"
                placeholder="10% Instant Discount on ICICI Card"
              />
            </div>

            <div className="adminField">
              <label htmlFor="usesToday">Used Today</label>
              <input
                id="usesToday"
                name="usesToday"
                type="number"
                min="0"
                placeholder="34"
              />
            </div>

            <div className="adminField">
              <label htmlFor="expiresAt">Expires At</label>
              <input
                id="expiresAt"
                name="expiresAt"
                type="datetime-local"
              />
            </div>

            <div className="adminField adminFieldFull">
              <label htmlFor="affiliateUrl">Affiliate URL</label>
              <input
                id="affiliateUrl"
                name="affiliateUrl"
                type="text"
                placeholder="https://example.com"
              />
            </div>

            <div className="adminField adminFieldFull">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                rows={3}
                placeholder="Extra style savings on selected fashion items."
              />
            </div>

            <div className="adminField adminFieldFull">
              <label htmlFor="terms">Terms (one per line)</label>
              <textarea
                id="terms"
                name="terms"
                rows={5}
                placeholder={`Offer valid for a limited time only.
Applicable on selected products.
Final discount may vary at checkout.`}
              />
            </div>

            <div className="adminField adminCheckboxField">
              <label className="adminCheckboxRow">
                <input name="verified" type="checkbox" defaultChecked />
                <span>Verified</span>
              </label>
            </div>

            <div className="adminField adminCheckboxField">
              <label className="adminCheckboxRow">
                <input name="isFeatured" type="checkbox" />
                <span>Best / Featured</span>
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
              {isPending ? "Saving..." : "Save Coupon"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}