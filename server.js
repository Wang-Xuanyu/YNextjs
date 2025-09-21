// import http from 'http';
// import fs from 'fs';
// import path from 'path';
//
// const server = http.createServer((req, res) => {
//   let urlPath = decodeURIComponent(req.url);
//
//   if (urlPath === '/') urlPath = '/index';
//
//   const htmlPath = path.join('dist/pages', urlPath + '.html');
//
//   if (fs.existsSync(htmlPath)) {
//     const html = fs.readFileSync(htmlPath, 'utf-8');
//     res.writeHead(200, { 'Content-Type': 'text/html' });
//     res.end(html);
//   } else {
//     res.writeHead(404);
//     res.end('Not Found');
//   }
// });
//
// server.listen(3000, () => {
//   console.log('🔧 Server running at http://localhost:3000');
// });
