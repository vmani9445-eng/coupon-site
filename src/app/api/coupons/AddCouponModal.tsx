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
          <h2>Add Coupon / Deal</h2>
          <p>Create a new coupon or offer. Leave code empty for a deal.</p>
        </div>

        <form action={handleSubmit} className="adminForm">
          <div className="adminFormGrid">
            <div className="adminField">
              <label htmlFor="storeId">Store</label>
              <select id="storeId" name="storeId" required>
                <option value="">Select store</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="adminField">
              <label htmlFor="title">Title</label>
              <input id="title" name="title" type="text" required />
            </div>

            <div className="adminField adminFieldFull">
              <label htmlFor="description">Description</label>
              <textarea id="description" name="description" rows={4} />
            </div>

            <div className="adminField">
              <label htmlFor="code">Coupon Code</label>
              <input id="code" name="code" type="text" placeholder="Leave empty for deal" />
            </div>

            <div className="adminField">
              <label htmlFor="discount">Discount / Offer Text</label>
              <input id="discount" name="discount" type="text" placeholder="20% OFF" />
            </div>

            <div className="adminField">
              <label htmlFor="category">Category</label>
              <input id="category" name="category" type="text" />
            </div>

            <div className="adminField">
              <label htmlFor="bank">Bank Offer</label>
              <input id="bank" name="bank" type="text" />
            </div>

            <div className="adminField adminFieldFull">
              <label htmlFor="affiliateUrl">Affiliate URL</label>
              <input id="affiliateUrl" name="affiliateUrl" type="text" />
            </div>

            <div className="adminField">
              <label htmlFor="expiresAt">Expiry Date</label>
              <input id="expiresAt" name="expiresAt" type="date" />
            </div>

            <div className="adminField adminCheckboxField">
              <label className="adminCheckboxRow">
                <input name="isFeatured" type="checkbox" />
                <span>Featured</span>
              </label>

              <label className="adminCheckboxRow">
                <input name="isActive" type="checkbox" defaultChecked />
                <span>Active</span>
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