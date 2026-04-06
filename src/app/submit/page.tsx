export default function SubmitPage() {
  return (
    <main className="pageContainer">
      <section className="submitCard">
        <h1>Submit Coupon</h1>
        <form action="/api/submit-coupon" method="POST" className="submitForm">
          <input name="storeName" placeholder="Store name" required />
          <input name="storeSlug" placeholder="Store slug (optional)" />
          <input name="title" placeholder="Coupon title" required />
          <input name="discount" placeholder="Discount" />
          <input name="code" placeholder="Coupon code" />
          <input name="category" placeholder="Category" />
          <input name="affiliateUrl" placeholder="Affiliate or destination URL" />
          <textarea name="description" placeholder="Description" rows={5} />
          <input name="submitter" placeholder="Your name or email" />
          <button type="submit">Submit Coupon</button>
        </form>
      </section>
    </main>
  );
}