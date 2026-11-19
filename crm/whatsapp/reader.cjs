// Lector de SOLO LECTURA para WhatsApp Business.
// Vincula por QR, recibe el historial que WhatsApp sincroniza y lo guarda en data/chats.json.
// No envía mensajes: este archivo nunca llama a sendMessage.
const fs = require('fs')
const path = require('path')
try { require.resolve('qrcode'); require.resolve('pino') ; fs.accessSync(path.join(__dirname, '..', 'node_modules', '@whiskeysockets', 'baileys')) } catch {
  console.error('\nFaltan dependencias. Corre esto dentro de la carpeta crm:\n\n  npm install\n\nY luego: npm run whatsapp\n')
  process.exit(1)
}
const QR = require('qrcode')
const pino = require('pino')
const { HttpsProxyAgent } = require('https-proxy-agent')
const PROXY = process.env.HTTPS_PROXY || process.env.https_proxy
const agent = PROXY ? new HttpsProxyAgent(PROXY) : undefined
let makeWASocket, useMultiFileAuthState, Browsers, DisconnectReason, fetchLatestWaWebVersion, fetchLatestBaileysVersion
let fails = 0

const OUT = path.join(__dirname, '..', 'data')
const AUTH = path.join(OUT, 'whatsapp-auth')
fs.mkdirSync(OUT, { recursive: true })

const contacts = {}
const chats = {}
const messages = {} // jid -> {id -> msg}

const text = (m) => {
  const x = m.message || {}
  return (
    x.conversation ||
    x.extendedTextMessage?.text ||
    x.imageMessage?.caption ||
    x.videoMessage?.caption ||
    x.documentMessage?.fileName ||
    (x.imageMessage && '[imagen]') ||
    (x.audioMessage && '[audio]') ||
    (x.videoMessage && '[video]') ||
    (x.stickerMessage && '[sticker]') ||
    (x.documentMessage && '[documento]') ||
    (x.locationMessage && '[ubicación]') ||
    null
  )
}

function addMsg(m) {
  const jid = m.key?.remoteJid
  if (!jid || jid === 'status@broadcast' || jid.endsWith('@g.us') || jid.endsWith('@newsletter')) return
  const t = text(m)
  if (!t) return
  const ts = Number(m.messageTimestamp?.low ?? m.messageTimestamp ?? 0)
  messages[jid] ??= {}
  messages[jid][m.key.id] = { fromMe: !!m.key.fromMe, ts, text: t }
  if (m.pushName && !m.key.fromMe) contacts[jid] = { ...(contacts[jid] || {}), pushName: m.pushName }
}

let dirty = false
function save() {
  if (!dirty) return
  dirty = false
  const out = Object.keys(messages).map((jid) => {
    const msgs = Object.values(messages[jid]).sort((a, b) => a.ts - b.ts)
    const c = contacts[jid] || {}
    return { jid, phone: jid.split('@')[0], name: c.name || c.notify || c.pushName || chats[jid]?.name || null, messages: msgs }
  })
  fs.writeFileSync(path.join(OUT, 'chats.json'), JSON.stringify({ updatedAt: Date.now(), chats: out }, null, 1))
  console.log(`[guardado] ${out.length} chats, ${out.reduce((n, c) => n + c.messages.length, 0)} mensajes`)
}
setInterval(save, 5000)

async function start() {
  if (!makeWASocket) {
    const B = await import('@whiskeysockets/baileys')
    makeWASocket = B.default?.default || B.default || B.makeWASocket
    ;({ useMultiFileAuthState, Browsers, DisconnectReason, fetchLatestWaWebVersion, fetchLatestBaileysVersion } = B)
  }
  const { state, saveCreds } = await useMultiFileAuthState(AUTH)
  let version
  try {
    const v = await (fetchLatestWaWebVersion || fetchLatestBaileysVersion)({})
    version = v.version
    console.log('[info] versión de WhatsApp Web:', version.join('.'))
  } catch (e) {
    console.log('[info] no se pudo consultar la versión de WhatsApp Web, uso la predeterminada')
  }
  const sock = makeWASocket({
    ...(version ? { version } : {}),
    auth: state,
    browser: Browsers.macOS('Desktop'),
    syncFullHistory: true,
    agent,
    fetchAgent: agent,
    markOnlineOnConnect: false,
    logger: pino({ level: 'silent' }),
  })
  sock.ev.on('creds.update', saveCreds)
  sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      await QR.toFile(path.join(OUT, 'qr.png'), qr, { width: 640, margin: 2 })
      console.log(await QR.toString(qr, { type: 'terminal', small: true }))
      console.log('[qr] Escanea el código: ábrelo en el CRM (http://localhost:4100) o en data/qr.png')
    }
    if (connection === 'open') { fails = 0; fs.rmSync(path.join(OUT, 'qr.png'), { force: true }); console.log('[conectado] Leyendo historial… deja esta ventana abierta unos minutos.') }
    if (connection === 'close') {
      const code = lastDisconnect?.error?.output?.statusCode
      fails++
      console.log('[cerrado]', code, lastDisconnect?.error?.message)
      if (fails === 3) console.log('[detalle]', lastDisconnect?.error?.data || lastDisconnect?.error?.stack || lastDisconnect?.error)
      if (code === DisconnectReason.loggedOut) { console.log('Sesión cerrada desde el teléfono. Borra data/whatsapp-auth y vuelve a correr npm run whatsapp.'); return }
      if (fails >= 6) { console.log('\nWhatsApp sigue cortando la conexión. Copia lo de arriba (sobre todo la línea [detalle]) y envíalo.\n'); process.exit(1) }
      setTimeout(start, 4000)
    }
  })
  sock.ev.on('messaging-history.set', ({ chats: cs, contacts: ct, messages: ms, isLatest, progress }) => {
    for (const c of ct || []) contacts[c.id] = { ...(contacts[c.id] || {}), ...c }
    for (const c of cs || []) chats[c.id] = c
    for (const m of ms || []) addMsg(m)
    dirty = true
    console.log(`[historial] +${(ms || []).length} mensajes progreso=${progress ?? '-'} final=${!!isLatest}`)
  })
  sock.ev.on('contacts.upsert', (ct) => { for (const c of ct) contacts[c.id] = { ...(contacts[c.id] || {}), ...c }; dirty = true })
  sock.ev.on('messages.upsert', ({ messages: ms }) => { for (const m of ms) addMsg(m); dirty = true })
}
start()
