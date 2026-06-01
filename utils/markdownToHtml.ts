import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import { visit } from "unist-util-visit";
import { toString } from "mdast-util-to-string";
import GithubSlugger from "github-slugger";
import type { Root as MdastRoot } from "mdast";
import type { Root as HastRoot, Element } from "hast";
import type { VFile } from "vfile";

export type TocHeading = {
  id: string;
  text: string;
  depth: 2 | 3;
};

export type MarkdownResult = {
  html: string;
  headings: TocHeading[];
};

function remarkExtractHeadings() {
  return (tree: MdastRoot, file: VFile) => {
    const slugger = new GithubSlugger();
    const headings: TocHeading[] = [];

    visit(tree, "heading", (node) => {
      if (node.depth !== 2 && node.depth !== 3) return;
      const text = toString(node);
      headings.push({
        id: slugger.slug(text),
        text,
        depth: node.depth as 2 | 3,
      });
    });

    file.data.headings = headings;
  };
}

function rehypeWrapTables() {
  return (tree: HastRoot) => {
    visit(tree, "element", (node: Element, index, parent) => {
      if (
        node.tagName !== "table" ||
        !parent ||
        typeof index !== "number"
      ) {
        return;
      }

      parent.children[index] = {
        type: "element",
        tagName: "div",
        properties: { className: ["table-wrapper"] },
        children: [node],
      };
    });
  };
}

export default async function markdownToHtml(
  markdown: string
): Promise<MarkdownResult> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkExtractHeadings)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlug)
    .use(rehypeWrapTables)
    .use(rehypeStringify)
    .process(markdown);

  return {
    html: file.toString(),
    headings: (file.data.headings as TocHeading[]) || [],
  };
}
