// Lector de SOLO LECTURA usando WhatsApp Web real en tu Chrome o Edge (whatsapp-web.js).
// Muestra un QR, lee tus chats individuales y los guarda en data/chats.json para el CRM.
// No envía mensajes: este archivo nunca llama a sendMessage.
const fs = require('fs')
const path = require('path')

let Client, LocalAuth, QR
try {
  ;({ Client, LocalAuth } = require('whatsapp-web.js'))
  QR = require('qrcode')
} catch {
  console.error('\nFaltan dependencias. Corre esto dentro de la carpeta crm:\n\n  npm install\n\nY luego: npm run whatsapp\n')
  process.exit(1)
}

const OUT = path.join(__dirname, '..', 'data')
fs.mkdirSync(OUT, { recursive: true })
const PER_CHAT = Number(process.env.MENSAJES_POR_CHAT || 300)

// Busca un navegador instalado (Chrome o Edge) para no descargar uno.
function findBrowser() {
  if (process.env.CHROME_PATH && fs.existsSync(process.env.CHROME_PATH)) return process.env.CHROME_PATH
  const pf = process.env['PROGRAMFILES'] || 'C:\\Program Files'
  const pf86 = process.env['PROGRAMFILES(X86)'] || 'C:\\Program Files (x86)'
  const local = process.env.LOCALAPPDATA || ''
  const list = [
    path.join(pf, 'Google', 'Chrome', 'Application', 'chrome.exe'),
    path.join(pf86, 'Google', 'Chrome', 'Application', 'chrome.exe'),
    path.join(local, 'Google', 'Chrome', 'Application', 'chrome.exe'),
    path.join(pf86, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
    path.join(pf, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
  ]
  return list.find((p) => p && fs.existsSync(p))
}

const label = (m) => {
  if (m.body) return m.body
  return { image: '[imagen]', video: '[video]', audio: '[audio]', ptt: '[nota de voz]', sticker: '[sticker]', document: '[documento]', location: '[ubicación]', vcard: '[contacto]' }[m.type] || null
}

async function dump(client) {
  const chats = (await client.getChats()).filter((c) => !c.isGroup && c.id.server === 'c.us')
  console.log(`[leyendo] ${chats.length} chats individuales…`)
  const out = []
  for (const [i, c] of chats.entries()) {
    try {
      const msgs = await c.fetchMessages({ limit: PER_CHAT })
      const contact = await c.getContact().catch(() => null)
      const messages = msgs.map((m) => ({ fromMe: m.fromMe, ts: m.timestamp, text: label(m) })).filter((m) => m.text)
      if (messages.length) out.push({ jid: c.id._serialized, phone: c.id.user, name: contact?.name || contact?.pushname || c.name || null, messages })
    } catch (e) {
      console.log(`[aviso] no se pudo leer un chat: ${e.message}`)
    }
    if ((i + 1) % 20 === 0) console.log(`[leyendo] ${i + 1}/${chats.length}`)
  }
  fs.writeFileSync(path.join(OUT, 'chats.json'), JSON.stringify({ updatedAt: Date.now(), chats: out }, null, 1))
  console.log(`[guardado] ${out.length} chats, ${out.reduce((n, c) => n + c.messages.length, 0)} mensajes. Abre el CRM: http://localhost:4100`)
}

const browser = findBrowser()
if (!browser) {
  console.error('\nNo encontré Chrome ni Edge instalados. Instala Google Chrome o indica la ruta así (PowerShell):\n\n  $env:CHROME_PATH="C:\\ruta\\a\\chrome.exe"; npm run whatsapp\n')
  process.exit(1)
}
console.log('[info] usando navegador:', browser)

const client = new Client({
  authStrategy: new LocalAuth({ dataPath: path.join(OUT, 'whatsapp-web-auth') }),
  puppeteer: { executablePath: browser, headless: true, args: ['--no-sandbox'] },
})

client.on('qr', async (qr) => {
  await QR.toFile(path.join(OUT, 'qr.png'), qr, { width: 640, margin: 2 })
  console.log(await QR.toString(qr, { type: 'terminal', small: true }))
  console.log('Escanea con WhatsApp Business → Dispositivos vinculados → Vincular dispositivo')
})
client.on('authenticated', () => console.log('[conectado] sesión iniciada'))
client.on('auth_failure', (m) => console.log('[error] no se pudo iniciar sesión:', m))
client.on('ready', async () => {
  fs.rmSync(path.join(OUT, 'qr.png'), { force: true })
  console.log('[listo] WhatsApp Web cargado')
  await dump(client)
  // vuelve a leer cada 10 minutos mientras la ventana esté abierta
  setInterval(() => dump(client).catch((e) => console.log('[aviso]', e.message)), 10 * 60 * 1000)
})
client.on('disconnected', (r) => { console.log('[desconectado]', r); process.exit(0) })

client.initialize().catch((e) => {
  console.error('[error] no se pudo abrir WhatsApp Web:', e.message)
  process.exit(1)
})
