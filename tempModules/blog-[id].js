import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import React from "react";
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
  return /* @__PURE__ */ React.createElement("article", null, /* @__PURE__ */ React.createElement("h1", null, title), /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("i", null, date)), /* @__PURE__ */ React.createElement("p", null, content), /* @__PURE__ */ React.createElement("div", { dangerouslySetInnerHTML: { __html: contentHtml } }));
}
export {
  BlogPost as default,
  getStaticPaths,
  getStaticProps
};
