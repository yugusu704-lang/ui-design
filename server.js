const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

function createGalleryServer() {
  return http.createServer((req, res) => {
    const fail = (status, message) => {
      res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(message);
    };
    if (!/^(localhost|127\.0\.0\.1)(:\d{1,5})?$/i.test(req.headers.host || '')) {
      return fail(403, 'Local requests only');
    }
    if (!['GET', 'HEAD'].includes(req.method)) return fail(405, 'Method Not Allowed');
    const pathname = (req.url || '').split('?')[0];
    // The gallery is self-contained; internal project files are never served.
    if (!['/', '/index.html'].includes(pathname)) return fail(404, 'Not Found');
    fs.readFile(path.join(__dirname, 'index.html'), (error, content) => {
      if (error) return fail(500, 'Unable to load the gallery');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'X-Content-Type-Options': 'nosniff' });
      res.end(req.method === 'HEAD' ? undefined : content);
    });
  });
}

module.exports = { createGalleryServer };

if (require.main === module) {
  createGalleryServer().listen(3000, '127.0.0.1', () => {
    console.log('UI 风格展厅：http://127.0.0.1:3000');
  });
}
