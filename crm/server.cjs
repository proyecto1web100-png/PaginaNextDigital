// Servidor local del CRM. Solo escucha en tu computadora (127.0.0.1).
// GET  /api/data   -> chats leídos de WhatsApp + estado del CRM
// POST /api/state  -> guarda etapas, notas, etiquetas y prospectos
// GET  /api/qr     -> código QR actual para vincular WhatsApp (si el lector está corriendo)
const http = require('http')
const fs = require('fs')
const path = require('path')

const PORT = Number(process.env.PORT || 4100)
const DATA = path.join(__dirname, 'data')
const PUB = path.join(__dirname, 'public')
fs.mkdirSync(DATA, { recursive: true })

const readJSON = (f, d) => {
  try { return JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf8')) } catch { return d }
}
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml' }

http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x')
  if (url.pathname === '/api/data') {
    const wa = readJSON('chats.json', { chats: [], updatedAt: null })
    const state = readJSON('crm-state.json', {})
    res.writeHead(200, { 'content-type': 'application/json' })
    return res.end(JSON.stringify({ wa, state }))
  }
  if (url.pathname === '/api/state' && req.method === 'POST') {
    let body = ''
    req.on('data', (c) => (body += c))
    req.on('end', () => {
      try {
        JSON.parse(body)
        fs.writeFileSync(path.join(DATA, 'crm-state.json'), body)
        res.writeHead(204).end()
      } catch {
        res.writeHead(400).end('JSON inválido')
      }
    })
    return
  }
  if (url.pathname === '/api/qr') {
    const f = path.join(DATA, 'qr.png')
    if (!fs.existsSync(f)) return res.writeHead(404).end()
    res.writeHead(200, { 'content-type': 'image/png', 'cache-control': 'no-store' })
    return fs.createReadStream(f).pipe(res)
  }
  const file = path.join(PUB, url.pathname === '/' ? 'index.html' : path.normalize(url.pathname))
  if (!file.startsWith(PUB) || !fs.existsSync(file)) return res.writeHead(404).end('No encontrado')
  res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' })
  fs.createReadStream(file).pipe(res)
}).listen(PORT, '127.0.0.1', () => console.log(`CRM listo en http://localhost:${PORT}`))
