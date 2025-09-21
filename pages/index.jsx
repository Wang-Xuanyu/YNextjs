import React from 'react'
export async function getStaticProps() {
  let data = {title:'Title'}

  return {
    props: {
      title: data.title || '',
      date: data.date ? new Date(data.date).toISOString() : null, // ✅ 转成字符串
    },
  };
}

export default function Index(){
  return (
    <div>
      This is Index Page
    </div>
  );
}
