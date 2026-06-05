import Link from "next/link";
import slugify from "utils/slugify";
import DateTime from "@/components/DateTime";

type Post = {
  slug: string;
  title: string;
  excerpt: string;
  datetime: string;
  category?: string;
  featured?: boolean;
};

type Props = {
  post: Post;
  variant?: "list" | "card";
  className?: string;
};

const BlogCard: React.FC<Props> = ({
  post,
  variant = "list",
  className = "",
}) => {
  const { title, slug, excerpt, datetime, category, featured } = post;
  const categorySlug = category ? slugify(category) : "";

  if (variant === "card") {
    return (
      <article
        className={`group flex h-full min-h-[220px] flex-col rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-marrsgreen/40 hover:shadow-md dark:border-slate-700/80 dark:bg-carddark dark:hover:border-carrigreen/40 ${className}`}
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          {category ? (
            <Link
              href={`/blog/categories/${categorySlug}`}
              className="rounded-full bg-marrsgreen/10 px-2.5 py-0.5 text-xs font-medium text-marrsdark dark:bg-carrigreen/15 dark:text-carrilight"
            >
              {category}
            </Link>
          ) : (
            <span />
          )}
          {featured && (
            <span className="text-xs font-medium uppercase tracking-wide text-marrsgreen dark:text-carrigreen">
              Featured
            </span>
          )}
        </div>

        <Link
          href={`/blog/posts/${slug}`}
          className="link outline-none focus-within:underline"
        >
          <h3 className="line-clamp-2 text-lg font-semibold leading-snug text-slate-900 dark:text-slate-50">
            {title}
          </h3>
        </Link>

        <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-600 dark:text-gray-300">
          {excerpt}
        </p>

        <div className="mt-4 flex items-center text-xs italic text-carddark dark:text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mr-1.5 h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <DateTime datetime={datetime} />
        </div>
      </article>
    );
  }

  return (
    <li
      className={`group border-b border-slate-200/80 py-6 last:border-b-0 dark:border-slate-700/60 ${className}`}
    >
      <div className="flex flex-wrap items-center gap-2 text-sm">
        {category && (
          <Link
            href={`/blog/categories/${categorySlug}`}
            className="rounded-full bg-marrsgreen/10 px-2.5 py-0.5 text-xs font-medium text-marrsdark dark:bg-carrigreen/15 dark:text-carrilight"
          >
            {category}
          </Link>
        )}
        {featured && (
          <span className="text-xs font-medium uppercase tracking-wide text-marrsgreen dark:text-carrigreen">
            Featured
          </span>
        )}
        <span className="ml-auto italic text-carddark dark:text-gray-400">
          <DateTime datetime={datetime} />
        </span>
      </div>

      <Link
        href={`/blog/posts/${slug}`}
        className="link mt-2 inline-block outline-none focus-within:underline"
      >
        <h3 className="text-xl font-semibold leading-snug text-slate-900 transition group-hover:text-marrsgreen dark:text-slate-50 dark:group-hover:text-carrigreen">
          {title}
        </h3>
      </Link>

      <p className="mt-2 max-w-3xl text-base leading-relaxed text-slate-600 dark:text-gray-300">
        {excerpt}
      </p>
    </li>
  );
};

export default BlogCard;
