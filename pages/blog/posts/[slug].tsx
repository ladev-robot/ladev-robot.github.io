import Image from "next/image";
import { GetStaticPaths, GetStaticProps } from "next";

import BlogHeader from "@/components/blog/BlogHeader";
import SkipToMain from "@/components/SkipToMain";
import SocialLinks from "@/components/SocialLinks";
import AppHead, { Meta } from "@/components/AppHead";
import Footer from "@/components/Footer";
import markdownToHtml, { TocHeading } from "utils/markdownToHtml";
import { getAllPosts, getPostBySlug } from "utils/api";
import PostBody from "@/components/blog/PostBody";
import TableOfContents from "@/components/blog/TableOfContents";
import Tag from "@/components/blog/Tag";
import DateTime from "@/components/DateTime";
import HeadCategory from "@/components/blog/HeadCategory";
import { siteConfig } from "@/constants/site";

export interface MdxMeta extends Meta {
  title: string;
  datetime: string;
  excerpt: string;
  slug: string;
  category: string;
  coverImage?: string;
  tags?: string[];
  content: string;
  coverImageWidth?: string;
  coverImageHeight?: string;
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
    <>
      <h1 className="text-2xl md:text-3xl font-semibold tracking-tight leading-snug">
        {post.title}
      </h1>
      <div className="mt-2 mb-1 italic text-marrsdark dark:text-carrigreen">
        <DateTime datetime={post.datetime} />
      </div>
      <HeadCategory category={post.category} />
      {post.tags && (
        <div className="my-2">
          {post.tags.map((tag: string) => (
            <Tag tag={tag} key={tag} />
          ))}
        </div>
      )}
      {post.coverImage && (
        <div className="bg-cardlight dark:bg-carddark">
          <Image
            src={post.coverImage}
            alt={post.coverImageAlt || "Picture"}
            sizes="100vw"
            style={{ width: "100%", height: "auto" }}
            priority
            width={Number(post.coverImageWidth) || 1200}
            height={Number(post.coverImageHeight) || 700}
          />
        </div>
      )}
    </>
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
    "slug",
    "author",
    "content",
    "ogImage",
    "ogImageAlt",
    "coverImage",
    "coverImageWidth",
    "coverImageHeight",
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
