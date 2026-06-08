type Props = {
  content: string;
};

const PostBody = ({ content }: Props) => {
  return (
    <div
      id="post-content"
      className="blog-prose prose prose-img:mx-auto prose-headings:font-sans prose-h2:scroll-mt-24 prose-h3:scroll-mt-24 [&_[id]]:scroll-mt-24 prose-h2:text-xl md:prose-h2:text-2xl prose-h2:font-semibold prose-h2:mt-10 prose-h2:mb-4 prose-h3:text-lg prose-h3:font-semibold prose-h3:mt-6 prose-h3:mb-2 prose-h3:text-marrsgreen dark:prose-h3:text-carrigreen prose-p:my-3 prose-table:text-sm prose-th:px-3 prose-th:py-2 prose-td:px-3 prose-td:py-2 prose-th:border prose-td:border prose-th:border-slate-200 dark:prose-th:border-slate-600 prose-td:border-slate-200 dark:prose-td:border-slate-600 prose-th:bg-cardlight dark:prose-th:bg-carddark dark:prose-invert max-w-none"
    >
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
};

export default PostBody;
