import { useEffect, useState } from "react";
import type { TocHeading } from "utils/markdownToHtml";

type Props = {
  headings: TocHeading[];
  variant?: "sidebar" | "mobile";
};

const TableOfContents: React.FC<Props> = ({
  headings,
  variant = "sidebar",
}) => {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter(Boolean) as HTMLElement[];

    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: [0, 0.25, 0.5, 1] }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [headings]);

  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveId(id);
  };

  if (!headings.length) return null;

  const list = (
    <ul className="space-y-1">
      {headings.map((heading) => (
        <li
          key={heading.id}
          className={heading.depth === 3 ? "pl-3" : undefined}
        >
          <button
            type="button"
            onClick={() => handleClick(heading.id)}
            className={`text-left w-full text-sm leading-snug transition-colors ${
              activeId === heading.id
                ? "text-marrsgreen dark:text-carrigreen font-medium"
                : "text-slate-600 dark:text-slate-300 hover:text-marrsgreen dark:hover:text-carrigreen"
            }`}
          >
            {heading.text}
          </button>
        </li>
      ))}
    </ul>
  );

  if (variant === "mobile") {
    return (
      <details className="xl:hidden mb-6 rounded-lg border border-slate-200 dark:border-slate-700 bg-cardlight dark:bg-carddark">
        <summary className="cursor-pointer px-4 py-3 text-sm font-medium">
          章节目录
        </summary>
        <nav
          aria-label="章节目录"
          className="px-4 pb-4 max-h-60 overflow-y-auto"
        >
          {list}
        </nav>
      </details>
    );
  }

  return (
    <nav aria-label="章节目录" className="sticky top-24">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-3">
        目录
      </p>
      <div className="max-h-[calc(100vh-8rem)] overflow-y-auto pr-2">
        {list}
      </div>
    </nav>
  );
};

export default TableOfContents;
