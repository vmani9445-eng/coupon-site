"use client";

import { useEffect, useMemo, useState } from "react";
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
  isActive: boolean;
  createdAt?: string;
  cashbackPercentToUser?: number;
};

type Props = {
  stores: StoreRow[];
};

function getPaginationItems(current: number, total: number) {
  const items: (number | string)[] = [];

  if (total <= 7) {
    for (let i = 1; i <= total; i++) items.push(i);
    return items;
  }

  if (current <= 4) {
    return [1, 2, 3, 4, 5, "...", total];
  }

  if (current >= total - 3) {
    return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  }

  return [1, "...", current - 1, current, current + 1, "...", total];
}

export default function StoresPageClient({ stores }: Props) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<StoreRow | null>(null);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 40;

  const [cashbackInputs, setCashbackInputs] = useState<Record<string, number>>(
    {}
  );
  const [savingId, setSavingId] = useState("");

  useEffect(() => {
    const mapped: Record<string, number> = {};
    for (const store of stores) {
      mapped[store.id] = store.cashbackPercentToUser ?? 70;
    }
    setCashbackInputs(mapped);
  }, [stores]);

  const filteredStores = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return stores;

    return stores.filter((store) => {
      return (
        store.name.toLowerCase().includes(q) ||
        store.slug.toLowerCase().includes(q) ||
        (store.description || "").toLowerCase().includes(q)
      );
    });
  }, [stores, search]);

  const totalPages = Math.max(Math.ceil(filteredStores.length / pageSize), 1);

  const paginatedStores = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredStores.slice(start, start + pageSize);
  }, [filteredStores, page]);

  const paginationItems = useMemo(() => {
    return getPaginationItems(page, totalPages);
  }, [page, totalPages]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const updateCashbackRule = async (storeId: string) => {
    try {
      setSavingId(storeId);

      const cashbackPercentToUser = Number(cashbackInputs[storeId] ?? 0);

      const res = await fetch(`/api/admin/stores/${storeId}/cashback`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cashbackPercentToUser,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        alert(json?.error || "Failed to update cashback control.");
        return;
      }

      alert("Cashback control updated successfully.");
    } catch (error) {
      console.error(error);
      alert("Something went wrong while updating cashback control.");
    } finally {
      setSavingId("");
    }
  };

  return (
    <>
      <div className="adminPage">
        <div className="adminPageHeader">
          <div>
            <h1>Stores</h1>
            <p>Manage all store listings and cashback commission control.</p>
          </div>

          <button
            type="button"
            className="adminButton"
            onClick={() => setIsAddModalOpen(true)}
          >
            Add Store
          </button>
        </div>

        <div className="adminToolbar">
          <input
            type="text"
            className="adminSearchInput"
            placeholder="Search store name, slug, description..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />

          <div className="adminToolbarMeta">
            <span>
              Total: <strong>{filteredStores.length}</strong>
            </span>
            <span>
              Page: <strong>{page}</strong> / <strong>{totalPages}</strong>
            </span>
          </div>
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
                <th>Active</th>
                <th>User Cashback %</th>
                <th>Admin Margin %</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginatedStores.length > 0 ? (
                paginatedStores.map((store) => {
                  const userPercent = Number(cashbackInputs[store.id] ?? 70);
                  const adminPercent = Math.max(0, 100 - userPercent);

                  return (
                    <tr key={store.id}>
                      <td>{store.name}</td>
                      <td>{store.slug}</td>
                      <td>{store.couponsCount}</td>
                      <td>{store.cashbackCount}</td>
                      <td>{store.isFeatured ? "Yes" : "No"}</td>
                      <td>{store.isActive ? "Yes" : "No"}</td>

                      <td>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          className="adminPercentInput"
                          value={cashbackInputs[store.id] ?? 70}
                          onChange={(e) =>
                            setCashbackInputs((prev) => ({
                              ...prev,
                              [store.id]: Number(e.target.value),
                            }))
                          }
                        />
                      </td>

                      <td>{adminPercent}%</td>

                      <td>
                        <div className="adminTableActions">
                          <button
                            type="button"
                            className="adminTableActionBtn"
                            onClick={() => setEditingStore(store)}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="adminTableActionBtn"
                            disabled={savingId === store.id}
                            onClick={() => updateCashbackRule(store.id)}
                          >
                            {savingId === store.id ? "Saving..." : "Save %"}
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
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9}>No stores found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="adminPagination">
          <button
            type="button"
            className="adminPageBtn"
            disabled={page <= 1}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          >
            Prev
          </button>

          {paginationItems.map((item, index) =>
            item === "..." ? (
              <span key={`dots-${index}`} className="adminPageDots">
                ...
              </span>
            ) : (
              <button
                type="button"
                key={item}
                className={`adminPageBtn ${page === item ? "active" : ""}`}
                onClick={() => setPage(Number(item))}
              >
                {item}
              </button>
            )
          )}

          <button
            type="button"
            className="adminPageBtn"
            disabled={page >= totalPages}
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
          >
            Next
          </button>
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