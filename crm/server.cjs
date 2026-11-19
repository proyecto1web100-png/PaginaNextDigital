// Servidor local del CRM. Solo escucha en tu computadora (127.0.0.1).
// Con WhatsApp conectado: los mensajes llegan en vivo (/api/events) y puedes responder desde el CRM.
// Sin WhatsApp (SIN_WHATSAPP=1): funciona con chats importados.
const http = require('http')
const fs = require('fs')
const path = require('path')

const PORT = Number(process.env.PORT || 4100)
const DATA = path.join(__dirname, 'data')
const PUB = path.join(__dirname, 'public')
fs.mkdirSync(DATA, { recursive: true })

const readJSON = (f, d) => { try { return JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf8')) } catch { return d } }
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml' }

let wa = null

// Eventos en vivo hacia el navegador (Server-Sent Events)
const clients = new Set()
const broadcast = (type, data) => { for (const res of clients) res.write(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`) }

const json = (res, code, obj) => { res.writeHead(code, { 'content-type': 'application/json' }); res.end(JSON.stringify(obj)) }
const body = (req) => new Promise((ok) => { let b = ''; req.on('data', (c) => (b += c)); req.on('end', () => ok(b)) })

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x')
  if (url.pathname === '/api/data') {
    return json(res, 200, { wa: wa ? wa.getStore() : readJSON('chats.json', { chats: [], updatedAt: null }), state: readJSON('crm-state.json', {}), status: wa ? wa.status : { state: 'apagado' } })
  }
  if (url.pathname === '/api/state' && req.method === 'POST') {
    const b = await body(req)
    try { JSON.parse(b); fs.writeFileSync(path.join(DATA, 'crm-state.json'), b); res.writeHead(204).end() } catch { res.writeHead(400).end('JSON inválido') }
    return
  }
  if (url.pathname === '/api/events') {
    res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-store', connection: 'keep-alive' })
    res.write(`event: status\ndata: ${JSON.stringify(wa ? wa.status : { state: 'apagado' })}\n\n`)
    clients.add(res)
    const ping = setInterval(() => res.write(': ping\n\n'), 25000)
    req.on('close', () => { clearInterval(ping); clients.delete(res) })
    return
  }
  if (url.pathname === '/api/reconnect' && req.method === 'POST') {
    if (!wa) return json(res, 400, { error: 'WhatsApp no está activo en este CRM.' })
    wa.reconnect(url.searchParams.get('nueva') === '1')
    return json(res, 200, { ok: true })
  }
  if (url.pathname === '/api/send' && req.method === 'POST') {
    if (!wa) return json(res, 400, { error: 'WhatsApp no está activo en este CRM.' })
    try {
      const { jid, text } = JSON.parse(await body(req))
      return json(res, 200, await wa.send(jid, text))
    } catch (e) {
      return json(res, 400, { error: e.message })
    }
  }
  const file = path.join(PUB, url.pathname === '/' ? 'index.html' : path.normalize(url.pathname))
  if (!file.startsWith(PUB) || !fs.existsSync(file)) return res.writeHead(404).end('No encontrado')
  res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' })
  fs.createReadStream(file).pipe(res)
})
server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.error(`\nEl CRM ya está abierto en otra ventana (puerto ${PORT}).\nUsa esa ventana y abre http://localhost:${PORT}, o ciérrala (Ctrl + C) antes de volver a correr npm start.\nSi no la encuentras, en PowerShell: Get-Process node | Stop-Process -Force\n`)
    process.exit(1)
  }
  throw e
})
server.listen(PORT, '127.0.0.1', () => {
  console.log(`CRM listo en http://localhost:${PORT}`)
  // WhatsApp arranca solo después de confirmar que este es el único CRM abierto
  if (!process.env.SIN_WHATSAPP) {
    wa = require('./whatsapp/live.cjs').startWhatsApp(DATA)
    wa.bus.on('message', (m) => broadcast('message', m))
    wa.bus.on('status', (s) => broadcast('status', s))
    wa.bus.on('reload', () => broadcast('reload', {}))
  }
})
