const routerData = {}
function Router(path,ele) {
  if (routerData[path]) return ;
  routerData[path] = ele
}

function Link(linkpath) {
  function handlePopState(event) {
    let path = window.location.pathname
    return routerData[path]
  }


  function linkClick() {
    window.history.pushState({}, "", linkpath);
  }
  window.addEventListener("popstate", handlePopState);
  return (
    <a>link</a>
  );
}

export {Router,Link}
