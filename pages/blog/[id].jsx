// pages/blog/[id].js

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import React from 'react'
const postsDirectory = path.join(process.cwd(), 'posts');

export async function getStaticPaths() {
  const filenames = fs.readdirSync(postsDirectory);

  const paths = filenames.map((filename) => {
    return {
      params: {
        id: filename.replace(/\.md$/, ''),
      },
    };
  });

  return {
    paths,
    fallback: 'blocking',
  };
}

export async function getStaticProps({ params }) {
  const postPath = path.join(process.cwd(), 'posts', `${params.id}.md`);
  const fileContent = fs.readFileSync(postPath, 'utf8');

  const { data, content } = matter(fileContent);
  return {
    props: {
      title: data.title || '',
      date: data.date ? new Date(data.date).toISOString() : null, // ✅ 转成字符串
      content,
    },
  };
}


export default function BlogPost({ id, title, date,content, contentHtml }) {
  // console.log(id, title, date, content);
  return (
    <article>
      <h1>{title}</h1>
      <p><i>{date}</i></p>
      <p>{content}</p>
      <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
    </article>
  );
}
