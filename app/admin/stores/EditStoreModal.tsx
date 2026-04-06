"use client";

import { useEffect, useState, useTransition } from "react";
import { updateStore } from "./actions";
import type { StoreRow } from "./StoresPageClient";

type Props = {
  store: StoreRow | null;
  onClose: () => void;
};

export default function EditStoreModal({ store, onClose }: Props) {
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [description, setDescription] = useState("");
  const [logo, setLogo] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);

  useEffect(() => {
    if (!store) return;
    setName(store.name || "");
    setWebsiteUrl(store.websiteUrl || "");
    setDescription(store.description || "");
    setLogo(store.logo || "");
    setIsFeatured(store.isFeatured);
    setError("");
  }, [store]);

  if (!store) return null;

  const handleSubmit = (formData: FormData) => {
    setError("");

    startTransition(async () => {
      const result = await updateStore(formData);

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
          <h2>Edit Store</h2>
          <p>Update store details.</p>
        </div>

        <form action={handleSubmit} className="adminForm">
          <input type="hidden" name="id" value={store.id} />

          <div className="adminFormGrid">
            <div className="adminField">
              <label htmlFor="edit-name">Store Name</label>
              <input
                id="edit-name"
                name="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Amazon"
                required
              />
            </div>

            <div className="adminField">
              <label htmlFor="edit-websiteUrl">Website URL</label>
              <input
                id="edit-websiteUrl"
                name="websiteUrl"
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://www.amazon.in"
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
                placeholder="Latest store offers, verified coupon codes, and deals."
              />
            </div>

            <div className="adminField">
              <label htmlFor="edit-logo">Logo URL</label>
              <input
                id="edit-logo"
                name="logo"
                type="text"
                value={logo}
                onChange={(e) => setLogo(e.target.value)}
                placeholder="https://example.com/logo.png"
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
                <span>Featured Store</span>
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
              {isPending ? "Saving..." : "Update Store"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}