import Link from "next/link";
import { createBanner } from "../actions";

const bannerTypes = ["hero", "horizontal", "vertical", "square"];

const placements = [
  "homepage_top",
  "homepage_top_right_top",
  "homepage_top_right_bottom",
  "homepage_middle_strip",
  "homepage_lower_box",
  "store_page",
  "category_page",
];

export default function NewBannerPage() {
  return (
    <div className="adminPage">
      <div className="adminPageHeader">
        <div>
          <h1>Add Banner</h1>
          <p>Create a new homepage, category, store, or promotional banner.</p>
        </div>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <Link href="/admin/banners" className="adminButton">
            Back to Banners
          </Link>
          <Link href="/admin" className="adminButton">
            Dashboard
          </Link>
        </div>
      </div>

      <section
        className="adminTableCard"
        style={{
          marginTop: "24px",
          padding: "24px",
          borderRadius: "20px",
          background: "#fff",
        }}
      >
        <form action={createBanner} className="adminBannerForm">
          <div className="adminFormGrid">
            <div className="adminFormField">
              <label htmlFor="title">Title</label>
              <input id="title" name="title" type="text" required />
            </div>

            <div className="adminFormField">
              <label htmlFor="subtitle">Subtitle</label>
              <input id="subtitle" name="subtitle" type="text" />
            </div>

            <div className="adminFormField adminFormFieldFull">
              <label htmlFor="imageFile">Upload Banner Image</label>
              <input
                id="imageFile"
                name="imageFile"
                type="file"
                accept="image/*"
              />
              <small className="adminFieldHelp">
                Upload a banner image directly, or use the image URL field below.
              </small>
            </div>

            <div className="adminFormField adminFormFieldFull">
              <label htmlFor="imageUrl">Image URL or Local Path</label>
              <input
                id="imageUrl"
                name="imageUrl"
                type="text"
                placeholder="/uploads/banners/flipkart-sale.jpg"
              />
              <small className="adminFieldHelp">
                Example: /uploads/banners/flipkart-sale.jpg
              </small>
            </div>

            <div className="adminFormField adminFormFieldFull">
              <label htmlFor="mobileImageFile">Upload Mobile Banner Image</label>
              <input
                id="mobileImageFile"
                name="mobileImageFile"
                type="file"
                accept="image/*"
              />
            </div>

            <div className="adminFormField adminFormFieldFull">
              <label htmlFor="mobileImageUrl">Mobile Image URL or Local Path</label>
              <input
                id="mobileImageUrl"
                name="mobileImageUrl"
                type="text"
                placeholder="/uploads/banners/mobile-banner.jpg"
              />
            </div>

            <div className="adminFormField">
              <label htmlFor="ctaText">CTA Text</label>
              <input
                id="ctaText"
                name="ctaText"
                type="text"
                placeholder="Shop Now"
              />
            </div>

            <div className="adminFormField">
              <label htmlFor="ctaUrl">CTA URL</label>
              <input
                id="ctaUrl"
                name="ctaUrl"
                type="text"
                placeholder="/stores/flipkart"
              />
            </div>

            <div className="adminFormField">
              <label htmlFor="bannerType">Banner Type</label>
              <select
                id="bannerType"
                name="bannerType"
                defaultValue="hero"
                required
              >
                {bannerTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <small className="adminFieldHelp">
                hero = main hero banner, horizontal = strip, vertical = tall,
                square = promo box.
              </small>
            </div>

            <div className="adminFormField">
              <label htmlFor="placement">Placement</label>
              <select
                id="placement"
                name="placement"
                defaultValue="homepage_top"
                required
              >
                {placements.map((placement) => (
                  <option key={placement} value={placement}>
                    {placement}
                  </option>
                ))}
              </select>

              <small className="adminFieldHelp">
                homepage_top → Main hero slider banner
                <br />
                homepage_top_right_top → Hero right top
                <br />
                homepage_top_right_bottom → Hero right bottom
                <br />
                homepage_middle_strip → Banner below top brands
                <br />
                homepage_lower_box → Bottom promo banner
              </small>
            </div>

            <div className="adminFormField">
              <label htmlFor="storeSlug">Store Slug</label>
              <input
                id="storeSlug"
                name="storeSlug"
                type="text"
                placeholder="flipkart"
              />
            </div>

            <div className="adminFormField">
              <label htmlFor="category">Category</label>
              <input
                id="category"
                name="category"
                type="text"
                placeholder="Electronics"
              />
            </div>

            <div className="adminFormField">
              <label htmlFor="source">Source</label>
              <input
                id="source"
                name="source"
                type="text"
                defaultValue="manual"
                placeholder="manual"
              />
            </div>

            <div className="adminFormField">
              <label htmlFor="externalId">External ID</label>
              <input id="externalId" name="externalId" type="text" />
            </div>

            <div className="adminFormField">
              <label htmlFor="priority">Priority</label>
              <input
                id="priority"
                name="priority"
                type="number"
                defaultValue={10}
                min={0}
              />
              <small className="adminFieldHelp">
                Higher priority shows first when multiple banners use the same
                placement.
              </small>
            </div>

            <div className="adminFormField">
              <label htmlFor="startsAt">Starts At</label>
              <input id="startsAt" name="startsAt" type="datetime-local" />
            </div>

            <div className="adminFormField">
              <label htmlFor="endsAt">Ends At</label>
              <input id="endsAt" name="endsAt" type="datetime-local" />
            </div>

            <div className="adminFormField adminFormCheckboxField">
              <label htmlFor="isActive">Active Banner</label>
              <input
                id="isActive"
                name="isActive"
                type="checkbox"
                defaultChecked
              />
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "24px",
              flexWrap: "wrap",
            }}
          >
            <button type="submit" className="adminButton">
              Save Banner
            </button>

            <Link
              href="/admin/banners"
              className="adminButton adminButtonSecondary"
            >
              Cancel
            </Link>
          </div>
        </form>
      </section>
    </div>
  );
}