"use client";

import { useTransition } from "react";
import { moveHomepageSection, toggleHomepageSection } from "./actions";

export type HomepageSectionRow = {
  id: string;
  sectionKey: string;
  title: string;
  isActive: boolean;
  sortOrder: number;
};

type Props = {
  sections: HomepageSectionRow[];
};

function prettyKey(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function HomepageControlClient({ sections }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = (id: string) => {
    const formData = new FormData();
    formData.append("id", id);

    startTransition(async () => {
      await toggleHomepageSection(formData);
    });
  };

  const handleMove = (id: string, direction: "up" | "down") => {
    const formData = new FormData();
    formData.append("id", id);
    formData.append("direction", direction);

    startTransition(async () => {
      await moveHomepageSection(formData);
    });
  };

  return (
    <div className="adminPage">
      <div className="adminPageHeader">
        <div>
          <h1>Homepage Control</h1>
          <p>
            Enable, disable, and reorder homepage sections with a cleaner admin
            layout.
          </p>
        </div>
      </div>

      <section className="adminHomeControlHero">
        <div className="adminHomeControlHeroText">
          <span className="adminHomeControlEyebrow">Homepage Layout</span>
          <h2>Manage visible sections</h2>
          <p>
            Turn sections on or off and adjust display order for the public
            homepage.
          </p>
        </div>

        <div className="adminHomeControlSummary">
          <div className="adminHomeSummaryCard">
            <span>Total Sections</span>
            <strong>{sections.length}</strong>
          </div>

          <div className="adminHomeSummaryCard">
            <span>Active</span>
            <strong>{sections.filter((item) => item.isActive).length}</strong>
          </div>

          <div className="adminHomeSummaryCard">
            <span>Hidden</span>
            <strong>{sections.filter((item) => !item.isActive).length}</strong>
          </div>
        </div>
      </section>

      <section className="adminHomeControlGrid">
        {sections.length > 0 ? (
          sections.map((section, index) => {
            const isFirst = index === 0;
            const isLast = index === sections.length - 1;

            return (
              <article key={section.id} className="adminHomeSectionCard">
                <div className="adminHomeSectionLeft">
                  <div className="adminHomeSectionOrder">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <div className="adminHomeSectionInfo">
                    <div className="adminHomeSectionTop">
                      <h3>{section.title}</h3>
                      <span
                        className={`adminStatusPill ${
                          section.isActive
                            ? "adminStatusPillActive"
                            : "adminStatusPillMuted"
                        }`}
                      >
                        {section.isActive ? "Active" : "Hidden"}
                      </span>
                    </div>

                    <p>{prettyKey(section.sectionKey)}</p>
                  </div>
                </div>

                <div className="adminHomeSectionRight">
                  <button
                    type="button"
                    className={`adminSwitch ${section.isActive ? "isOn" : ""}`}
                    onClick={() => handleToggle(section.id)}
                    disabled={isPending}
                    aria-label={
                      section.isActive
                        ? `Disable ${section.title}`
                        : `Enable ${section.title}`
                    }
                  >
                    <span className="adminSwitchKnob" />
                  </button>

                  <div className="adminHomeMoveGroup">
                    <button
                      type="button"
                      className="adminMoveBtn"
                      onClick={() => handleMove(section.id, "up")}
                      disabled={isPending || isFirst}
                    >
                      ↑
                    </button>

                    <button
                      type="button"
                      className="adminMoveBtn"
                      onClick={() => handleMove(section.id, "down")}
                      disabled={isPending || isLast}
                    >
                      ↓
                    </button>
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <div className="adminEmptyStateCard">
            <h3>No homepage sections found</h3>
            <p>Add section records in the database to manage homepage layout.</p>
          </div>
        )}
      </section>
    </div>
  );
}