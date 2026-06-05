import Head from "next/head";
import { siteConfig } from "@/constants/site";

export interface Meta {
  description?: string;
  author?: string;
  siteName?: string;
  ogImage?: string;
  ogImageAlt?: string;
  type?: string;
}

type Props = {
  title: string;
  meta?: Meta;
  url?: string;
};

const AppHead: React.FC<Props> = ({
  title,
  url = `${process.env.NEXT_PUBLIC_URL}/blog`,
  meta,
}) => {
  let author = siteConfig.name;
  let description = siteConfig.blogDescription;
  let siteName = `${siteConfig.name}'s Blog`;
  let type = "article";
  let ogImage: string | undefined;
  let ogImageAlt: string | undefined;

  if (meta) {
    author = meta.author ? meta.author : author;
    description = meta.description ? meta.description : description;
    siteName = meta.siteName ? meta.siteName : siteName;
    type = meta.type ? meta.type : type;
    ogImage = meta.ogImage && meta.ogImage;
    ogImageAlt = meta.ogImageAlt && meta.ogImageAlt;
  }

  let appOgImage = `${process.env.NEXT_PUBLIC_URL}${siteConfig.ogImages.blog}`;
  let appOgImageAlt = `${siteConfig.name}'s Blog`;

  if (ogImage) {
    appOgImage = ogImage.startsWith("http")
      ? ogImage
      : `${process.env.NEXT_PUBLIC_URL}${ogImage}`;
  }

  if (ogImageAlt) {
    appOgImageAlt = ogImageAlt;
  }

  return (
    <Head>
      <title>{title}</title>
      <meta name="author" content={author} />
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={appOgImage} />
      <meta property="og:image:alt" content={appOgImageAlt} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={siteName} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:image:alt" content={appOgImageAlt} />
      <meta property="og:type" content={type} />
    </Head>
  );
};

export default AppHead;
