"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { updateBanner } from "./actions";

export type BannerRow = {
  id: string;
  imageUrl: string;
  mobileImageUrl?: string | null;
  ctaText?: string | null;
  ctaUrl?: string | null;
  bannerType: string;
  placement: string;
  storeSlug?: string | null;
  category?: string | null;
  source?: string | null;
  externalId?: string | null;
  priority: number;
  isActive: boolean;
};

type Props = {
  banner: BannerRow | null;
  onClose: () => void;
};

const bannerTypes = ["hero", "horizontal", "vertical", "square"];

const placements = [
  "homepage_top",
  "homepage_top_right_top",
  "homepage_top_right_bottom",
  "homepage_middle_strip",
  "homepage_lower_box",
];

export default function EditBannerModal({ banner, onClose }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const [imageUrl, setImageUrl] = useState("");
  const [mobileImageUrl, setMobileImageUrl] = useState("");
  const [ctaText, setCtaText] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [bannerType, setBannerType] = useState("hero");
  const [placement, setPlacement] = useState("homepage_top");
  const [storeSlug, setStoreSlug] = useState("");
  const [category, setCategory] = useState("");
  const [source, setSource] = useState("manual");
  const [externalId, setExternalId] = useState("");
  const [priority, setPriority] = useState(10);
  const [isActive, setIsActive] = useState(true);

  const [imagePreview, setImagePreview] = useState("");
  const [mobilePreview, setMobilePreview] = useState("");

  useEffect(() => {
    if (!banner) return;

    setImageUrl(banner.imageUrl || "");
    setMobileImageUrl(banner.mobileImageUrl || "");
    setCtaText(banner.ctaText || "");
    setCtaUrl(banner.ctaUrl || "");
    setBannerType(banner.bannerType || "hero");
    setPlacement(banner.placement || "homepage_top");
    setStoreSlug(banner.storeSlug || "");
    setCategory(banner.category || "");
    setSource(banner.source || "manual");
    setExternalId(banner.externalId || "");
    setPriority(banner.priority ?? 10);
    setIsActive(banner.isActive ?? true);
    setImagePreview(banner.imageUrl || "");
    setMobilePreview(banner.mobileImageUrl || "");
    setError("");
  }, [banner]);

  const previewImage = useMemo(() => imagePreview || imageUrl, [imagePreview, imageUrl]);
  const previewMobile = useMemo(
    () => mobilePreview || mobileImageUrl,
    [mobilePreview, mobileImageUrl]
  );

  if (!banner) return null;

  const handleFilePreview = (
    file: File | null,
    setPreview: (value: string) => void
  ) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  const handleSubmit = (formData: FormData) => {
    setError("");

    startTransition(async () => {
      try {
        await updateBanner(formData);
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update banner.");
      }
    });
  };

  return (
    <div className="adminModalOverlay" onClick={onClose}>
      <div className="adminModal" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="adminModalClose"
          onClick={onClose}
          disabled={isPending}
        >
          ×
        </button>

        <div className="adminModalHeader">
          <h2>Edit Banner</h2>
          <p>Update banner details and preview images before saving.</p>
        </div>

        <form action={handleSubmit} className="adminForm">
          <input type="hidden" name="id" value={banner.id} />
          <input type="hidden" name="currentImageUrl" value={banner.imageUrl || ""} />
          <input
            type="hidden"
            name="currentMobileImageUrl"
            value={banner.mobileImageUrl || ""}
          />

          <div className="adminFormGrid">
            <div className="adminField adminFieldFull">
              <label htmlFor="edit-imageFile">Upload Banner Image</label>
              <input
                id="edit-imageFile"
                name="imageFile"
                type="file"
                accept="image/*"
                onChange={(e) =>
                  handleFilePreview(e.target.files?.[0] || null, setImagePreview)
                }
              />
            </div>

            <div className="adminField adminFieldFull">
              <label htmlFor="edit-imageUrl">Image URL or Local Path</label>
              <input
                id="edit-imageUrl"
                name="imageUrl"
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>

            <div className="adminField adminFieldFull">
              <label htmlFor="edit-mobileImageFile">Upload Mobile Banner Image</label>
              <input
                id="edit-mobileImageFile"
                name="mobileImageFile"
                type="file"
                accept="image/*"
                onChange={(e) =>
                  handleFilePreview(e.target.files?.[0] || null, setMobilePreview)
                }
              />
            </div>

            <div className="adminField adminFieldFull">
              <label htmlFor="edit-mobileImageUrl">Mobile Image URL or Local Path</label>
              <input
                id="edit-mobileImageUrl"
                name="mobileImageUrl"
                type="text"
                value={mobileImageUrl}
                onChange={(e) => setMobileImageUrl(e.target.value)}
              />
            </div>

            <div className="adminField">
              <label htmlFor="edit-ctaText">CTA Text</label>
              <input
                id="edit-ctaText"
                name="ctaText"
                type="text"
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
              />
            </div>

            <div className="adminField">
              <label htmlFor="edit-ctaUrl">CTA URL</label>
              <input
                id="edit-ctaUrl"
                name="ctaUrl"
                type="text"
                value={ctaUrl}
                onChange={(e) => setCtaUrl(e.target.value)}
              />
            </div>

            <div className="adminField">
              <label htmlFor="edit-bannerType">Banner Type</label>
              <select
                id="edit-bannerType"
                name="bannerType"
                value={bannerType}
                onChange={(e) => setBannerType(e.target.value)}
              >
                {bannerTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="adminField">
              <label htmlFor="edit-placement">Placement</label>
              <select
                id="edit-placement"
                name="placement"
                value={placement}
                onChange={(e) => setPlacement(e.target.value)}
              >
                {placements.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="adminField">
              <label htmlFor="edit-storeSlug">Store Slug</label>
              <input
                id="edit-storeSlug"
                name="storeSlug"
                type="text"
                value={storeSlug}
                onChange={(e) => setStoreSlug(e.target.value)}
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
              <label htmlFor="edit-source">Source</label>
              <input
                id="edit-source"
                name="source"
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
              />
            </div>

            <div className="adminField">
              <label htmlFor="edit-externalId">External ID</label>
              <input
                id="edit-externalId"
                name="externalId"
                type="text"
                value={externalId}
                onChange={(e) => setExternalId(e.target.value)}
              />
            </div>

            <div className="adminField">
              <label htmlFor="edit-priority">Priority</label>
              <input
                id="edit-priority"
                name="priority"
                type="number"
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
              />
            </div>

            <div className="adminField adminCheckboxField">
              <label className="adminCheckboxRow" htmlFor="edit-isActive">
                <input
                  id="edit-isActive"
                  name="isActive"
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                <span>Active Banner</span>
              </label>
            </div>
          </div>

          <div className="adminBannerPreviewGrid">
            <div className="adminBannerPreviewCard">
              <span className="adminBannerPreviewLabel">Desktop Preview</span>
              {previewImage ? <img src={previewImage} alt="" /> : <div>No image</div>}
            </div>

            <div className="adminBannerPreviewCard">
              <span className="adminBannerPreviewLabel">Mobile Preview</span>
              {previewMobile ? <img src={previewMobile} alt="" /> : <div>No image</div>}
            </div>
          </div>

          {error ? <p className="adminFormError">{error}</p> : null}

          <div className="adminModalActions">
            <button
              type="button"
              className="adminButton adminButtonGhost"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </button>

            <button type="submit" className="adminButton" disabled={isPending}>
              {isPending ? "Saving..." : "Update Banner"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}