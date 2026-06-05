import Link from "next/link";
import slugify from "utils/slugify";
import DateTime from "@/components/DateTime";
import Tag from "@/components/blog/Tag";

type Props = {
  title: string;
  excerpt?: string;
  datetime: string;
  category: string;
  tags?: string[];
};

const BlogPostHeader: React.FC<Props> = ({
  title,
  excerpt,
  datetime,
  category,
  tags,
}) => {
  const categorySlug = slugify(category);

  return (
    <header className="blog-post-header mb-8 pb-8 border-b border-slate-200 dark:border-slate-700/80">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-carddark dark:text-gray-400">
        <Link
          href={
            categorySlug
              ? `/blog/categories/${categorySlug}`
              : "/blog/categories"
          }
          className="inline-flex items-center rounded-full bg-marrsgreen/10 dark:bg-carrigreen/15 px-3 py-1 font-medium text-marrsdark dark:text-carrilight hover:text-marrsgreen dark:hover:text-carrigreen transition-colors"
        >
          {category || "Uncategorized"}
        </Link>
        <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">
          ·
        </span>
        <time className="italic">
          <DateTime datetime={datetime} />
        </time>
      </div>

      <h1 className="mt-4 text-3xl md:text-4xl font-semibold tracking-tight leading-tight text-slate-900 dark:text-slate-50">
        {title}
      </h1>

      {excerpt && (
        <p className="mt-4 text-lg leading-relaxed text-slate-600 dark:text-slate-300 max-w-3xl">
          {excerpt}
        </p>
      )}

      {tags && tags.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Tag tag={tag} key={tag} />
          ))}
        </div>
      )}
    </header>
  );
};

export default BlogPostHeader;
