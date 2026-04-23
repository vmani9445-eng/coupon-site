"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { createBanner } from "../actions";

const bannerTypes = ["hero", "horizontal", "vertical", "square"];

const placements = [
  "homepage_top",
  "homepage_top_right_top",
  "homepage_top_right_bottom",
  "homepage_middle_strip",
  "homepage_lower_box",
];

export default function NewBannerPage() {
  const [imageUrl, setImageUrl] = useState("");
  const [mobileImageUrl, setMobileImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [mobilePreview, setMobilePreview] = useState("");

  const desktopPreview = useMemo(() => imagePreview || imageUrl, [imagePreview, imageUrl]);
  const mobilePreviewSrc = useMemo(
    () => mobilePreview || mobileImageUrl,
    [mobilePreview, mobileImageUrl]
  );

  const handleFilePreview = (
    file: File | null,
    setPreview: (value: string) => void
  ) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  return (
    <div className="adminPage">
      <div className="adminPageHeader">
        <div>
          <h1>Add Banner</h1>
          <p>Upload banner images and preview before saving.</p>
        </div>

        <Link href="/admin/banners" className="adminButton">
          Back
        </Link>
      </div>

      <div className="adminTableCard" style={{ padding: 24 }}>
        <form action={createBanner} className="adminForm">
          <div className="adminFormGrid">
            <div className="adminField adminFieldFull">
              <label htmlFor="imageFile">Upload Banner Image</label>
              <input
                id="imageFile"
                name="imageFile"
                type="file"
                accept="image/*"
                onChange={(e) =>
                  handleFilePreview(e.target.files?.[0] || null, setImagePreview)
                }
              />
            </div>

            <div className="adminField adminFieldFull">
              <label htmlFor="imageUrl">Image URL or Local Path</label>
              <input
                id="imageUrl"
                name="imageUrl"
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>

            <div className="adminField adminFieldFull">
              <label htmlFor="mobileImageFile">Upload Mobile Banner Image</label>
              <input
                id="mobileImageFile"
                name="mobileImageFile"
                type="file"
                accept="image/*"
                onChange={(e) =>
                  handleFilePreview(e.target.files?.[0] || null, setMobilePreview)
                }
              />
            </div>

            <div className="adminField adminFieldFull">
              <label htmlFor="mobileImageUrl">Mobile Image URL or Local Path</label>
              <input
                id="mobileImageUrl"
                name="mobileImageUrl"
                type="text"
                value={mobileImageUrl}
                onChange={(e) => setMobileImageUrl(e.target.value)}
              />
            </div>

            <div className="adminField">
              <label htmlFor="ctaText">CTA Text</label>
              <input id="ctaText" name="ctaText" placeholder="Shop Now" />
            </div>

            <div className="adminField">
              <label htmlFor="ctaUrl">CTA URL</label>
              <input id="ctaUrl" name="ctaUrl" placeholder="/stores/amazon" />
            </div>

            <div className="adminField">
              <label htmlFor="bannerType">Banner Type</label>
              <select id="bannerType" name="bannerType" defaultValue="hero">
                {bannerTypes.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="adminField">
              <label htmlFor="placement">Placement</label>
              <select id="placement" name="placement" defaultValue="homepage_top">
                {placements.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>

            <div className="adminField">
              <label htmlFor="priority">Priority</label>
              <input id="priority" name="priority" type="number" defaultValue={10} />
            </div>

            <div className="adminField adminCheckboxField">
              <label className="adminCheckboxRow" htmlFor="isActive">
                <input id="isActive" name="isActive" type="checkbox" defaultChecked />
                <span>Active Banner</span>
              </label>
            </div>
          </div>

          <div className="adminBannerPreviewGrid">
            <div className="adminBannerPreviewCard">
              <span className="adminBannerPreviewLabel">Desktop Preview</span>
              {desktopPreview ? <img src={desktopPreview} alt="" /> : <div>No image</div>}
            </div>

            <div className="adminBannerPreviewCard">
              <span className="adminBannerPreviewLabel">Mobile Preview</span>
              {mobilePreviewSrc ? (
                <img src={mobilePreviewSrc} alt="" />
              ) : (
                <div>No image</div>
              )}
            </div>
          </div>

          <div style={{ marginTop: 24 }}>
            <button type="submit" className="adminButton">
              Save Banner
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}