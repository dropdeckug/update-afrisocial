// Minimal static file server. Ignores any extra CLI args (harness appends --port).
const http = require('http');
const fs = require('fs');
const path = require('path');
const PORT = 8080;
const ROOT = __dirname;
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.webp': 'image/webp',
  '.mp3':  'audio/mpeg',
  '.mp4':  'video/mp4',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf'
};
http.createServer((req, res) => {
  try {
    let urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
    if (urlPath === '/') urlPath = '/index.html';
    const filePath = path.normalize(path.join(ROOT, urlPath));
    if (!filePath.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
    fs.stat(filePath, (err, stat) => {
      if (err || !stat.isFile()) {
        // SPA-friendly fallback: try .html
        const htmlPath = filePath.endsWith('.html') ? filePath : filePath + '.html';
        fs.stat(htmlPath, (err2, stat2) => {
          if (err2 || !stat2.isFile()) { res.writeHead(404); return res.end('Not found'); }
          serve(htmlPath);
        });
        return;
      }
      serve(filePath);
    });
    function serve(p) {
      const ext = path.extname(p).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
      fs.createReadStream(p).pipe(res);
    }
  } catch (e) { res.writeHead(500); res.end(String(e)); }
}).listen(PORT, '0.0.0.0', () => console.log('dev server on :' + PORT));
