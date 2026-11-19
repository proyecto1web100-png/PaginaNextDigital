// WhatsApp Web en vivo para el CRM (whatsapp-web.js sobre tu Chrome o Edge).
// - Lee tus chats individuales y los mantiene al día con cada mensaje nuevo.
// - Envía SOLO cuando tú presionas "Enviar" en el CRM, a contactos que ya te escribieron antes,
//   con una pausa mínima entre envíos. Nunca envía mensajes masivos ni automáticos.
const fs = require('fs')
const path = require('path')
const { EventEmitter } = require('events')

const MIN_GAP_MS = 8000 // pausa mínima entre dos envíos
const MAX_LEN = 2000
const PER_CHAT = Number(process.env.MENSAJES_POR_CHAT || 300)

function findBrowser() {
  if (process.env.CHROME_PATH && fs.existsSync(process.env.CHROME_PATH)) return process.env.CHROME_PATH
  const pf = process.env['PROGRAMFILES'] || 'C:\\Program Files'
  const pf86 = process.env['PROGRAMFILES(X86)'] || 'C:\\Program Files (x86)'
  const local = process.env.LOCALAPPDATA || ''
  return [
    path.join(pf, 'Google', 'Chrome', 'Application', 'chrome.exe'),
    path.join(pf86, 'Google', 'Chrome', 'Application', 'chrome.exe'),
    path.join(local, 'Google', 'Chrome', 'Application', 'chrome.exe'),
    path.join(pf86, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
    path.join(pf, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
  ].find((p) => p && fs.existsSync(p))
}

const label = (m) =>
  m.body ||
  { image: '[imagen]', video: '[video]', audio: '[audio]', ptt: '[nota de voz]', sticker: '[sticker]', document: '[documento]', location: '[ubicación]', vcard: '[contacto]' }[m.type] ||
  null

function startWhatsApp(DATA) {
  const bus = new EventEmitter()
  const status = { state: 'iniciando', qr: null, error: null, me: null }
  const file = path.join(DATA, 'chats.json')
  let store = { updatedAt: null, chats: [] }
  try { store = JSON.parse(fs.readFileSync(file, 'utf8')) } catch {}
  const byJid = new Map(store.chats.map((c) => [c.jid, c]))
  let lastSend = 0

  const setStatus = (patch) => { Object.assign(status, patch); bus.emit('status', { ...status }) }
  let saveT
  const persist = () => {
    clearTimeout(saveT)
    saveT = setTimeout(() => {
      store = { updatedAt: Date.now(), chats: [...byJid.values()] }
      fs.writeFileSync(file, JSON.stringify(store, null, 1))
    }, 500)
  }

  let Client, LocalAuth, QR
  try {
    ;({ Client, LocalAuth } = require('whatsapp-web.js'))
    QR = require('qrcode')
  } catch {
    setStatus({ state: 'error', error: 'Faltan dependencias: corre "npm install" dentro de la carpeta crm.' })
    return { bus, status, getStore: () => store, send: async () => { throw new Error(status.error) } }
  }
  const browser = findBrowser()
  if (!browser) {
    setStatus({ state: 'error', error: 'No encontré Chrome ni Edge. Instala Google Chrome o define CHROME_PATH con la ruta del navegador.' })
    return { bus, status, getStore: () => store, send: async () => { throw new Error(status.error) } }
  }
  console.log('[whatsapp] navegador:', browser)

  const client = new Client({
    authStrategy: new LocalAuth({ dataPath: path.join(DATA, 'whatsapp-web-auth') }),
    puppeteer: { executablePath: browser, headless: true, args: ['--no-sandbox'] },
  })

  function addMessage(m) {
    const jid = m.fromMe ? m.to : m.from
    if (!jid || !jid.endsWith('@c.us')) return null
    const text = label(m)
    if (!text) return null
    const c = byJid.get(jid) || { jid, phone: jid.split('@')[0], name: null, messages: [] }
    if (!m.fromMe && m._data?.notifyName && !c.name) c.name = m._data.notifyName
    const msg = { id: m.id?._serialized, fromMe: m.fromMe, ts: m.timestamp, text }
    if (msg.id && c.messages.some((x) => x.id === msg.id)) return null
    c.messages.push(msg)
    byJid.set(jid, c)
    persist()
    return { jid, phone: c.phone, name: c.name, message: msg }
  }

  async function dumpAll() {
    setStatus({ state: 'sincronizando' })
    const chats = (await client.getChats()).filter((c) => !c.isGroup && c.id.server === 'c.us')
    for (const c of chats) {
      try {
        const msgs = await c.fetchMessages({ limit: PER_CHAT })
        const contact = await c.getContact().catch(() => null)
        const messages = msgs.map((m) => ({ id: m.id?._serialized, fromMe: m.fromMe, ts: m.timestamp, text: label(m) })).filter((m) => m.text)
        if (!messages.length) continue
        const prev = byJid.get(c.id._serialized)
        const seen = new Set(messages.map((m) => m.id))
        const extra = (prev?.messages || []).filter((m) => m.id && !seen.has(m.id))
        byJid.set(c.id._serialized, {
          jid: c.id._serialized,
          phone: c.id.user,
          name: contact?.name || contact?.pushname || c.name || prev?.name || null,
          messages: [...messages, ...extra].sort((a, b) => a.ts - b.ts),
        })
      } catch (e) {
        console.log('[whatsapp] no se pudo leer un chat:', e.message)
      }
    }
    persist()
    setTimeout(() => bus.emit('reload'), 600)
    setStatus({ state: 'conectado' })
    console.log(`[whatsapp] ${byJid.size} chats sincronizados`)
  }

  client.on('qr', async (qr) => {
    const png = await QR.toDataURL(qr, { width: 520, margin: 2 })
    setStatus({ state: 'qr', qr: png })
    console.log(await QR.toString(qr, { type: 'terminal', small: true }))
    console.log('Escanea con WhatsApp Business → Dispositivos vinculados (o desde el CRM: http://localhost:4100/#conectar)')
  })
  client.on('authenticated', () => setStatus({ state: 'autenticado', qr: null }))
  client.on('auth_failure', (m) => setStatus({ state: 'error', error: 'No se pudo iniciar sesión: ' + m }))
  client.on('ready', async () => {
    setStatus({ me: client.info?.wid?.user || null })
    console.log('[whatsapp] conectado como', status.me)
    await dumpAll().catch((e) => setStatus({ state: 'conectado', error: e.message }))
  })
  // message_create incluye los que recibes y los que envías (desde el teléfono o desde el CRM)
  client.on('message_create', (m) => {
    const ev = addMessage(m)
    if (ev) bus.emit('message', ev)
  })
  client.on('disconnected', (r) => setStatus({ state: 'desconectado', error: 'WhatsApp se desconectó: ' + r }))

  client.initialize().catch((e) => setStatus({ state: 'error', error: 'No se pudo abrir WhatsApp Web: ' + e.message }))

  async function send(jid, text) {
    if (status.state !== 'conectado') throw new Error('WhatsApp no está conectado.')
    text = String(text || '').trim()
    if (!text) throw new Error('El mensaje está vacío.')
    if (text.length > MAX_LEN) throw new Error(`El mensaje es muy largo (máximo ${MAX_LEN} caracteres).`)
    if (!/^\d+@c\.us$/.test(jid)) throw new Error('Solo se puede escribir a chats individuales.')
    const c = byJid.get(jid)
    if (!c || !c.messages.some((m) => !m.fromMe)) throw new Error('Por seguridad solo puedes responder desde el CRM a contactos que ya te escribieron. A los demás escríbeles desde tu teléfono.')
    const wait = lastSend + MIN_GAP_MS - Date.now()
    if (wait > 0) throw new Error(`Espera ${Math.ceil(wait / 1000)} s antes de enviar otro mensaje.`)
    lastSend = Date.now()
    const m = await client.sendMessage(jid, text)
    return { id: m.id?._serialized }
  }

  const shutdown = () => client.destroy().catch(() => {}).finally(() => process.exit(0))
  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)

  return { bus, status, getStore: () => ({ updatedAt: store.updatedAt || Date.now(), chats: [...byJid.values()] }), send }
}

module.exports = { startWhatsApp }
