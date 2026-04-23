"use client";

import { useState } from "react";
import AddCouponModal from "./AddCouponModal";
import EditCouponModal, { type CouponRow } from "./EditCouponModal";
import DeleteCouponButton from "./DeleteCouponButton";

type StoreOption = {
  id: string;
  name: string;
};

type Props = {
  coupons: CouponRow[];
  stores: StoreOption[];
};

export default function CouponsPageClient({ coupons, stores }: Props) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponRow | null>(null);

  return (
    <>
      <div className="adminPage">
        <div className="adminPageHeader">
          <div>
            <h1>Coupons</h1>
            <p>Manage coupon codes and deals.</p>
          </div>

          <button
            type="button"
            className="adminButton"
            onClick={() => setIsAddModalOpen(true)}
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
                <th>Discount</th>
                <th>Type</th>
                <th>Featured</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon.id}>
                  <td>{coupon.title}</td>
                  <td>{stores.find((s) => s.id === coupon.storeId)?.name || "-"}</td>
                  <td>{coupon.code || "-"}</td>
                  <td>{coupon.discount || "-"}</td>
                  <td>{coupon.code ? "Coupon" : "Deal"}</td>
                  <td>{coupon.isFeatured ? "Yes" : "No"}</td>
                  <td>{coupon.isActive ? "Yes" : "No"}</td>
                  <td>
                    <div className="adminTableActions">
                      <button
                        type="button"
                        className="adminTableActionBtn"
                        onClick={() => setEditingCoupon(coupon)}
                      >
                        Edit
                      </button>

                      <DeleteCouponButton id={coupon.id} title={coupon.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AddCouponModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        stores={stores}
      />

      <EditCouponModal
        coupon={editingCoupon}
        onClose={() => setEditingCoupon(null)}
        stores={stores}
      />
    </>
  );
}