"use client";

import { useState } from "react";
import AddCouponModal from "./AddCouponModal";

type StoreOption = {
  id: string;
  name: string;
};

type CouponRow = {
  id: string;
  title: string;
  storeName: string;
  code: string | null;
  type: string;
  source: string;
  discount: string | null;
  category: string | null;
  affiliateUrl: string | null;
  isFeatured: boolean;
  verified: boolean;
};

type Props = {
  coupons: CouponRow[];
  stores: StoreOption[];
};

export default function CouponsPageClient({ coupons, stores }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="adminPage">
        <div className="adminPageHeader">
          <div>
            <h1>Coupons</h1>
            <p>Manage coupon and deal entries.</p>
          </div>

          <button
            type="button"
            className="adminButton"
            onClick={() => setIsModalOpen(true)}
          >
            Add Coupon
          </button>
        </div>

        <div className="adminTableWrap">
          <table className="adminTable">
            <thead>
              <tr>
                <th>Title</th>
                <th>Store</th>
                <th>Code</th>
                <th>Type</th>
                <th>Source</th>
              </tr>
            </thead>
            <tbody>
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={5}>No coupons found.</td>
                </tr>
              ) : (
                coupons.map((coupon) => (
                  <tr key={coupon.id}>
                    <td>{coupon.title}</td>
                    <td>{coupon.storeName}</td>
                    <td>{coupon.code || "-"}</td>
                    <td>{coupon.type}</td>
                    <td>{coupon.source}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddCouponModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        stores={stores}
      />
    </>
  );
}