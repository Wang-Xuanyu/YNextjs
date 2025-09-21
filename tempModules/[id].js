import { jsx, jsxs } from "react/jsx-runtime";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
const postsDirectory = path.join(process.cwd(), "posts");
async function getStaticPaths() {
  const filenames = fs.readdirSync(postsDirectory);
  const paths = filenames.map((filename) => {
    return {
      params: {
        id: filename.replace(/\.md$/, "")
      }
    };
  });
  return {
    paths,
    fallback: "blocking"
  };
}
async function getStaticProps({ params }) {
  const postPath = path.join(process.cwd(), "posts", `${params.id}.md`);
  const fileContent = fs.readFileSync(postPath, "utf8");
  const { data, content } = matter(fileContent);
  return {
    props: {
      title: data.title || "",
      date: data.date ? new Date(data.date).toISOString() : null,
      // ✅ 转成字符串
      content
    }
  };
}
function BlogPost({ id, title, date, content, contentHtml }) {
  return /* @__PURE__ */ jsxs("article", { children: [
    /* @__PURE__ */ jsx("h1", { children: title }),
    /* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsx("i", { children: date }) }),
    /* @__PURE__ */ jsx("p", { children: content }),
    /* @__PURE__ */ jsx("div", { dangerouslySetInnerHTML: { __html: contentHtml } })
  ] });
}
export {
  BlogPost as default,
  getStaticPaths,
  getStaticProps
};
