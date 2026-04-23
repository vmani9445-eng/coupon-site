"use client";

import { useMemo, useState, useTransition } from "react";
import { deleteBanner, reorderBanners } from "./actions";
import EditBannerModal, { type BannerRow } from "./EditBannerModal";

type Props = {
  banners: BannerRow[];
};

function formatPlacement(value: string) {
  return value.replaceAll("_", " ");
}

export default function BannersPageClient({ banners }: Props) {
  const [items, setItems] = useState<BannerRow[]>(banners);
  const [editingBanner, setEditingBanner] = useState<BannerRow | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => b.priority - a.priority),
    [items]
  );

  const handleDrop = (targetId: string) => {
    if (!draggedId || draggedId === targetId) return;

    const list = [...sortedItems];
    const draggedIndex = list.findIndex((item) => item.id === draggedId);
    const targetIndex = list.findIndex((item) => item.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const [moved] = list.splice(draggedIndex, 1);
    list.splice(targetIndex, 0, moved);

    const updated = list.map((item, index) => ({
      ...item,
      priority: list.length - index,
    }));

    setItems(updated);
    setDraggedId(null);

    startTransition(async () => {
      await reorderBanners(
        updated.map((item) => ({
          id: item.id,
          priority: item.priority,
        }))
      );
    });
  };

  return (
    <>
      <section className="adminTableCard">
        <div className="adminTableWrap">
          <table className="adminTable">
            <thead>
              <tr>
                <th>Preview</th>
                <th>Placement</th>
                <th>Type</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {sortedItems.length > 0 ? (
                sortedItems.map((banner) => (
                  <tr
                    key={banner.id}
                    draggable
                    onDragStart={() => setDraggedId(banner.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(banner.id)}
                    className="adminDraggableRow"
                  >
                    <td>
                      <div className="adminBannerThumb">
                        <img src={banner.imageUrl} alt="" />
                      </div>
                    </td>

                    <td>
                      <span className="adminPill adminPillNeutral">
                        {formatPlacement(banner.placement)}
                      </span>
                    </td>

                    <td>
                      <span className="adminPill adminPillBlue">
                        {banner.bannerType}
                      </span>
                    </td>

                    <td>{banner.priority}</td>

                    <td>
                      {banner.isActive ? (
                        <span className="adminPill adminPillGreen">Active</span>
                      ) : (
                        <span className="adminPill adminPillRed">Inactive</span>
                      )}
                    </td>

                    <td>
                      <div className="adminTableActions">
                        <button
                          type="button"
                          className="adminTableActionBtn"
                          onClick={() => setEditingBanner(banner)}
                        >
                          Edit
                        </button>

                        <form action={deleteBanner}>
                          <input type="hidden" name="id" value={banner.id} />
                          <button
                            type="submit"
                            className="adminTableActionBtn adminTableActionBtnDanger"
                            disabled={isPending}
                          >
                            Delete
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6}>No banners found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="adminDragHint">Drag and drop rows to reorder banners.</p>
      </section>

      <EditBannerModal
        banner={editingBanner}
        onClose={() => setEditingBanner(null)}
      />
    </>
  );
}