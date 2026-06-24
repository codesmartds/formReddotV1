'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0';
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  response.end(JSON.stringify(payload));
}

function resolvePublicPath(urlPath) {
  let decodedPath;

  try {
    decodedPath = decodeURIComponent(urlPath.split('?')[0]);
  } catch {
    return null;
  }

  const requestedPath = decodedPath === '/' ? '/index.html' : decodedPath;
  const safeRelativePath = path.normalize(requestedPath).replace(/^(\.\.[/\\])+/, '');
  const absolutePath = path.join(PUBLIC_DIR, safeRelativePath);

  if (!absolutePath.startsWith(PUBLIC_DIR + path.sep) && absolutePath !== PUBLIC_DIR) {
    return null;
  }

  return absolutePath;
}

const server = http.createServer((request, response) => {
  if (request.url === '/health' || request.url?.startsWith('/health?')) {
    return sendJson(response, 200, {
      ok: true,
      service: 'form-share-claro',
      timestamp: new Date().toISOString(),
    });
  }

  if (!['GET', 'HEAD'].includes(request.method || '')) {
    response.setHeader('Allow', 'GET, HEAD');
    return sendJson(response, 405, { ok: false, error: 'Method Not Allowed' });
  }

  const filePath = resolvePublicPath(request.url || '/');
  if (!filePath) {
    return sendJson(response, 400, { ok: false, error: 'Invalid path' });
  }

  fs.stat(filePath, (statError, stats) => {
    if (statError || !stats.isFile()) {
      return sendJson(response, 404, { ok: false, error: 'Not Found' });
    }

    const extension = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[extension] || 'application/octet-stream';
    const isHtml = extension === '.html';

    response.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Cache-Control': isHtml ? 'no-cache' : 'public, max-age=86400',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    });

    if (request.method === 'HEAD') {
      return response.end();
    }

    const stream = fs.createReadStream(filePath);
    stream.on('error', () => {
      if (!response.headersSent) {
        sendJson(response, 500, { ok: false, error: 'Internal Server Error' });
      } else {
        response.destroy();
      }
    });
    stream.pipe(response);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`[SERVER] Landing disponible en http://${HOST}:${PORT}`);
  console.log(`[SERVER] Health check: http://${HOST}:${PORT}/health`);
});

function shutdown(signal) {
  console.log(`[SERVER] ${signal} recibido. Cerrando servidor...`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
