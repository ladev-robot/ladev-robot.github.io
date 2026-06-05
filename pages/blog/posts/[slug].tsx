import { GetStaticPaths, GetStaticProps } from "next";

import BlogHeader from "@/components/blog/BlogHeader";
import BlogPostHeader from "@/components/blog/BlogPostHeader";
import SkipToMain from "@/components/SkipToMain";
import SocialLinks from "@/components/SocialLinks";
import AppHead, { Meta } from "@/components/AppHead";
import Footer from "@/components/Footer";
import markdownToHtml, { TocHeading } from "utils/markdownToHtml";
import { getAllPosts, getPostBySlug } from "utils/api";
import PostBody from "@/components/blog/PostBody";
import TableOfContents from "@/components/blog/TableOfContents";
import { siteConfig } from "@/constants/site";

export interface MdxMeta extends Meta {
  title: string;
  datetime: string;
  excerpt: string;
  slug: string;
  category: string;
  tags?: string[];
  content: string;
  featured: boolean;
  language: "English" | "Myanmar" | "Chinese";
  toc?: boolean;
}

type Props = {
  post: MdxMeta;
  headings: TocHeading[];
};

const BlogLayout: React.FC<Props> = ({ post, headings }) => {
  const showToc = post.toc && headings.length > 0;

  const metaBlock = (
    <BlogPostHeader
      title={post.title}
      excerpt={post.excerpt}
      datetime={post.datetime}
      category={post.category}
      tags={post.tags}
    />
  );

  return (
    <>
      <AppHead
        title={`${post.title} - ${siteConfig.name}`}
        url={`${process.env.NEXT_PUBLIC_URL}/blog/posts/${post.slug}`}
        meta={post}
      />
      <div className="bg-bglight dark:bg-bgdark">
        <div className="selection:bg-marrsgreen selection:text-bglight dark:selection:bg-carrigreen dark:selection:text-bgdark">
          <SkipToMain />
          <BlogHeader />
          <SocialLinks />
          <main id="main" className="blog-main">
            {showToc ? (
              <div className="blog-section-wide">
                <article className="min-w-0">
                  {metaBlock}
                  <TableOfContents headings={headings} variant="mobile" />
                  <PostBody content={post.content} />
                </article>
                <aside className="hidden xl:block w-56 shrink-0">
                  <TableOfContents headings={headings} />
                </aside>
              </div>
            ) : (
              <article className="blog-section">
                {metaBlock}
                <PostBody content={post.content} />
              </article>
            )}
          </main>
          <Footer />
        </div>
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const post = getPostBySlug(params!.slug as string, [
    "title",
    "datetime",
    "description",
    "excerpt",
    "slug",
    "author",
    "content",
    "ogImage",
    "ogImageAlt",
    "category",
    "tags",
    "type",
    "toc",
  ]);
  const { html, headings } = await markdownToHtml(
    (post.content as string) || ""
  );

  return {
    props: {
      post: {
        ...post,
        content: html,
      },
      headings,
    },
  };
};

export const getStaticPaths: GetStaticPaths = () => {
  const posts = getAllPosts(["slug"]);

  return {
    paths: posts.map((post) => {
      return {
        params: {
          slug: post.slug,
        },
      };
    }),
    fallback: false,
  };
};

export default BlogLayout;
