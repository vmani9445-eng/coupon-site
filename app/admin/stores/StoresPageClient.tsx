"use client";

import { useState } from "react";
import AddStoreModal from "./AddStoreModal";
import EditStoreModal from "./EditStoreModal";
import DeleteStoreButton from "./DeleteStoreButton";

export type StoreRow = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  websiteUrl?: string | null;
  logo?: string | null;
  couponsCount: number;
  cashbackCount: number;
  isFeatured: boolean;
};

type Props = {
  stores: StoreRow[];
};

export default function StoresPageClient({ stores }: Props) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<StoreRow | null>(null);

  return (
    <>
      <div className="adminPage">
        <div className="adminPageHeader">
          <div>
            <h1>Stores</h1>
            <p>Manage all store listings.</p>
          </div>

          <button
            type="button"
            className="adminButton"
            onClick={() => setIsAddModalOpen(true)}
          >
            Add Store
          </button>
        </div>

        <div className="adminTableWrap">
          <table className="adminTable">
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Coupons</th>
                <th>Cashback</th>
                <th>Featured</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stores.map((store) => (
                <tr key={store.id}>
                  <td>{store.name}</td>
                  <td>{store.slug}</td>
                  <td>{store.couponsCount}</td>
                  <td>{store.cashbackCount}</td>
                  <td>{store.isFeatured ? "Yes" : "No"}</td>
                  <td>
                    <div className="adminTableActions">
                      <button
                        type="button"
                        className="adminTableActionBtn"
                        onClick={() => setEditingStore(store)}
                      >
                        Edit
                      </button>

                      <DeleteStoreButton
                        id={store.id}
                        name={store.name}
                        disabled={
                          store.couponsCount > 0 || store.cashbackCount > 0
                        }
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AddStoreModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      <EditStoreModal
        store={editingStore}
        onClose={() => setEditingStore(null)}
      />
    </>
  );
}