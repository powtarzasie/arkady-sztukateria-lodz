/**
 * ARKADY — Sztukateria Łódź: production-grade static server.
 * - gzip compression for text assets
 * - correct MIME types + cache headers
 * - clean /guide route
 * - proper 404 handling (404.html with status 404)
 * Run: node server.js  [PORT=4321 by default]
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const ROOT = path.join(__dirname, 'site');
const PORT = process.env.PORT || 4321;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.woff2': 'font/woff2',
};

const COMPRESSIBLE = new Set(['.html', '.css', '.js', '.json', '.xml', '.txt', '.svg']);

function cacheHeader(ext) {
  if (ext === '.html' || ext === '.xml' || ext === '.txt') return 'no-cache';
  return 'public, max-age=31536000, immutable';
}

function send(req, res, filePath, status) {
  const ext = path.extname(filePath).toLowerCase();
  const mime = MIME[ext] || 'application/octet-stream';
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(500); res.end('500'); return; }
    const headers = {
      'Content-Type': mime,
      'Cache-Control': cacheHeader(ext),
      'X-Content-Type-Options': 'nosniff',
    };
    const acceptsGzip = /\bgzip\b/.test(req.headers['accept-encoding'] || '');
    if (acceptsGzip && COMPRESSIBLE.has(ext)) {
      zlib.gzip(data, { level: 8 }, (gzErr, gz) => {
        if (gzErr) { res.writeHead(status, headers); res.end(data); return; }
        headers['Content-Encoding'] = 'gzip';
        headers['Vary'] = 'Accept-Encoding';
        res.writeHead(status, headers);
        res.end(gz);
      });
    } else {
      res.writeHead(status, headers);
      res.end(data);
    }
  });
}

const server = http.createServer((req, res) => {
  let urlPath;
  try {
    urlPath = decodeURIComponent(new URL(req.url, `http://${req.headers.host}`).pathname);
  } catch {
    res.writeHead(400); res.end('400'); return;
  }

  // Normalize: /guide and /guide/ -> guide/index.html
  if (urlPath.endsWith('/')) urlPath += 'index.html';
  if (!path.extname(urlPath)) {
    const asDir = path.join(ROOT, urlPath, 'index.html');
    if (fs.existsSync(asDir)) urlPath = path.posix.join(urlPath, 'index.html');
    else urlPath += '.html';
  }

  const filePath = path.normalize(path.join(ROOT, urlPath));
  if (!filePath.startsWith(ROOT)) { res.writeHead(403); res.end('403'); return; }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    send(req, res, filePath, 200);
  } else {
    send(req, res, path.join(ROOT, '404.html'), 404);
  }
});

server.listen(PORT, () => {
  console.log(`ARKADY — sztukateria Łódź`);
  console.log(`  http://localhost:${PORT}`);
  console.log(`  http://localhost:${PORT}/guide`);
});
