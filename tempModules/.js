import React from "react";
async function getStaticProps() {
  let data = { title: "Title" };
  return {
    props: {
      title: data.title || "",
      date: data.date ? new Date(data.date).toISOString() : null
      // ✅ 转成字符串
    }
  };
}
function Index() {
  return /* @__PURE__ */ React.createElement("div", null, "This is Index Page");
}
export {
  Index as default,
  getStaticProps
};
