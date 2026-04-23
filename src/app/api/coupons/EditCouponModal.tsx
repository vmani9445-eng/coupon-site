"use client";

import { useEffect, useState, useTransition } from "react";
import { updateCoupon } from "./actions";

type StoreOption = {
  id: string;
  name: string;
};

export type CouponRow = {
  id: string;
  storeId: string;
  title: string;
  description?: string | null;
  code?: string | null;
  discount?: string | null;
  category?: string | null;
  bank?: string | null;
  affiliateUrl?: string | null;
  expiresAt?: string | null;
  isFeatured: boolean;
  isActive: boolean;
};

type Props = {
  coupon: CouponRow | null;
  onClose: () => void;
  stores: StoreOption[];
};

export default function EditCouponModal({ coupon, onClose, stores }: Props) {
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const [storeId, setStoreId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState("");
  const [category, setCategory] = useState("");
  const [bank, setBank] = useState("");
  const [affiliateUrl, setAffiliateUrl] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!coupon) return;

    setStoreId(coupon.storeId || "");
    setTitle(coupon.title || "");
    setDescription(coupon.description || "");
    setCode(coupon.code || "");
    setDiscount(coupon.discount || "");
    setCategory(coupon.category || "");
    setBank(coupon.bank || "");
    setAffiliateUrl(coupon.affiliateUrl || "");
    setExpiresAt(coupon.expiresAt || "");
    setIsFeatured(coupon.isFeatured);
    setIsActive(coupon.isActive);
    setError("");
  }, [coupon]);

  if (!coupon) return null;

  const handleSubmit = (formData: FormData) => {
    setError("");

    startTransition(async () => {
      const result = await updateCoupon(formData);

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
          <h2>Edit Coupon / Deal</h2>
          <p>Update coupon or offer details.</p>
        </div>

        <form action={handleSubmit} className="adminForm">
          <input type="hidden" name="id" value={coupon.id} />

          <div className="adminFormGrid">
            <div className="adminField">
              <label htmlFor="edit-storeId">Store</label>
              <select
                id="edit-storeId"
                name="storeId"
                value={storeId}
                onChange={(e) => setStoreId(e.target.value)}
                required
              >
                <option value="">Select store</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="adminField">
              <label htmlFor="edit-title">Title</label>
              <input
                id="edit-title"
                name="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="adminField adminFieldFull">
              <label htmlFor="edit-description">Description</label>
              <textarea
                id="edit-description"
                name="description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="adminField">
              <label htmlFor="edit-code">Coupon Code</label>
              <input
                id="edit-code"
                name="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>

            <div className="adminField">
              <label htmlFor="edit-discount">Discount / Offer Text</label>
              <input
                id="edit-discount"
                name="discount"
                type="text"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
              />
            </div>

            <div className="adminField">
              <label htmlFor="edit-category">Category</label>
              <input
                id="edit-category"
                name="category"
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>

            <div className="adminField">
              <label htmlFor="edit-bank">Bank Offer</label>
              <input
                id="edit-bank"
                name="bank"
                type="text"
                value={bank}
                onChange={(e) => setBank(e.target.value)}
              />
            </div>

            <div className="adminField adminFieldFull">
              <label htmlFor="edit-affiliateUrl">Affiliate URL</label>
              <input
                id="edit-affiliateUrl"
                name="affiliateUrl"
                type="text"
                value={affiliateUrl}
                onChange={(e) => setAffiliateUrl(e.target.value)}
              />
            </div>

            <div className="adminField">
              <label htmlFor="edit-expiresAt">Expiry Date</label>
              <input
                id="edit-expiresAt"
                name="expiresAt"
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </div>

            <div className="adminField adminCheckboxField">
              <label className="adminCheckboxRow">
                <input
                  name="isFeatured"
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                />
                <span>Featured</span>
              </label>

              <label className="adminCheckboxRow">
                <input
                  name="isActive"
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
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
              {isPending ? "Saving..." : "Update Coupon"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}