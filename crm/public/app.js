/* NextDigital CRM: todo corre en tu navegador y en tu computadora. */
const DAY = 86400
const now = () => Math.floor(Date.now() / 1000)
const $ = (s, el = document) => el.querySelector(s)
const $$ = (s, el = document) => [...el.querySelectorAll(s)]
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

const STAGES = [
  { id: 'nuevo', label: 'Nuevo' },
  { id: 'interesado', label: 'Interesado' },
  { id: 'cotizado', label: 'Cotizado' },
  { id: 'negociacion', label: 'Negociación' },
  { id: 'ganado', label: 'Ganado' },
  { id: 'perdido', label: 'Perdido' },
]
const stageLabel = (id) => STAGES.find((s) => s.id === id)?.label || id

const TOPICS = [
  { id: 'Página web', re: /pagina|web|sitio|landing|dominio/ },
  { id: 'Catálogo', re: /catalogo|tienda en linea|productos|carrito/ },
  { id: 'Dentico', re: /dentico|odontolog|dental|clinica|consultorio|pacientes/ },
  { id: 'Sistema / facturación', re: /sistema|factura|inventario|caja|punto de venta/ },
  { id: 'Precio', re: /precio|cuanto|costo|cuesta|vale|cotiza|presupuesto/ },
  { id: 'Mantenimiento', re: /mantenimiento|actualiza|cambio|soporte|error/ },
]
const RE_ASK = /precio|cuanto|costo|cuesta|cotiza|presupuesto|info|informacion|me interesa|quisiera|quiero|necesito/
const RE_QUOTE = /l\.?\s?\d|lps|lempiras|cotizacion|propuesta|el precio es|cuesta|plan (basico|intermedio|avanzado|negocios)/
const RE_PAID = /comprobante|transferencia|deposito|ya pague|pagado|anticipo|recibimos el pago|gracias por su compra/
const RE_NO = /no gracias|no me interesa|muy caro|ya tengo|despues|mas adelante|por ahora no/

let DATA = { chats: [], updatedAt: null }
let S = { contacts: {}, prospects: [], done: {}, imported: [], me: '' }
let DEMO = false
let WA = { state: 'apagado' }
const canSend = (c) => WA.state === 'conectado' && /@(c\.us|lid)$/.test(c.jid) && c.messages.some((m) => !m.fromMe)
let view = 'panel'

/* ── Persistencia ───────────────────────────────────── */
let saveT
function save() {
  clearTimeout(saveT)
  saveT = setTimeout(() => fetch('/api/state', { method: 'POST', body: JSON.stringify(S) }).catch(() => {}), 300)
}

/* ── Análisis de cada chat ──────────────────────────── */
function analyze(c) {
  const msgs = c.messages || []
  const last = msgs[msgs.length - 1]
  const theirs = msgs.filter((m) => !m.fromMe)
  const mine = msgs.filter((m) => m.fromMe)
  const all = norm(msgs.map((m) => m.text).join(' \n '))
  const topics = TOPICS.filter((t) => t.re.test(all)).map((t) => t.id)
  const asked = theirs.some((m) => RE_ASK.test(norm(m.text)))
  const quoted = mine.some((m) => RE_QUOTE.test(norm(m.text)))
  const paid = msgs.some((m) => RE_PAID.test(norm(m.text)))
  const declined = theirs.slice(-3).some((m) => RE_NO.test(norm(m.text)))
  let auto = 'nuevo'
  if (asked) auto = 'interesado'
  if (quoted) auto = 'cotizado'
  if (quoted && theirs.length && theirs[theirs.length - 1].ts > (mine.filter((m) => RE_QUOTE.test(norm(m.text))).pop()?.ts || 0)) auto = 'negociacion'
  if (paid) auto = 'ganado'
  if (declined && !paid) auto = 'perdido'

  // tiempo de respuesta: del mensaje del cliente a mi siguiente mensaje
  const resp = []
  for (let i = 1; i < msgs.length; i++) if (msgs[i].fromMe && !msgs[i - 1].fromMe) resp.push(msgs[i].ts - msgs[i - 1].ts)

  const saved = S.contacts[c.jid] || {}
  const stage = saved.stage || auto
  const age = last ? (now() - last.ts) / DAY : 999
  // interés 0–100: preguntó, temas de venta, actividad reciente, conversación de ida y vuelta
  let score = 0
  if (asked) score += 30
  if (topics.some((t) => t !== 'Mantenimiento')) score += 15
  if (topics.includes('Dentico')) score += 10
  if (quoted) score += 15
  score += Math.max(0, 20 - age / 3)
  score += Math.min(10, theirs.length)
  if (stage === 'perdido') score = Math.min(score, 15)
  if (stage === 'ganado') score = Math.max(score, 60)
  return {
    ...c,
    name: c.name || (c.phone ? '+' + c.phone : 'Contacto sin nombre'),
    last, age, topics, asked, quoted, paid, stage, auto,
    lastFromMe: !!last?.fromMe,
    unanswered: last && !last.fromMe,
    respTimes: resp,
    score: Math.round(Math.min(100, score)),
    tags: saved.tags || [],
    notes: saved.notes || '',
  }
}

function contacts() {
  const map = new Map()
  for (const c of [...(DATA.chats || []), ...(S.imported || [])]) {
    const prev = map.get(c.jid)
    if (!prev) map.set(c.jid, { ...c, messages: [...c.messages] })
    else {
      const seen = new Set(prev.messages.map((m) => m.ts + m.text))
      prev.messages.push(...c.messages.filter((m) => !seen.has(m.ts + m.text)))
      prev.messages.sort((a, b) => a.ts - b.ts)
      prev.name ||= c.name
    }
  }
  return [...map.values()].filter((c) => c.messages?.length).map(analyze).sort((a, b) => (b.last?.ts || 0) - (a.last?.ts || 0))
}

/* ── Seguimiento: a quién escribir y qué decir ───────── */
function firstName(n) { return String(n || '').replace(/^\+\d+$/, '').replace(/^.*·\s*/, '').split(' ')[0] || '' }
function followUps(list) {
  const out = []
  for (const c of list) {
    if (S.done[c.jid] && S.done[c.jid] >= (c.last?.ts || 0)) continue
    const hi = firstName(c.name) ? `Hola, ${firstName(c.name)}` : 'Hola'
    const topic = c.topics.find((t) => t !== 'Precio' && t !== 'Mantenimiento') || 'tu página web'
    const d = Math.round(c.age)
    if (c.unanswered && c.stage !== 'perdido' && c.age < 120) {
      out.push({ c, prio: c.age < 3 ? 'alta' : 'media', why: `Te escribió hace ${d} día${d === 1 ? '' : 's'} y no le respondiste.`,
        msg: `${hi}, disculpa la demora en responderte. Sobre lo que me consultaste de ${topic.toLowerCase()}: ¿te parece si te paso una propuesta con el precio y lo que incluye? Así lo revisas con calma.` })
    } else if (['cotizado', 'negociacion'].includes(c.stage) && c.lastFromMe && c.age >= 3 && c.age < 90) {
      out.push({ c, prio: c.age < 14 ? 'alta' : 'media', why: `Le enviaste precio hace ${d} días y no ha respondido.`,
        msg: `${hi}, ¿pudiste revisar la propuesta de ${topic.toLowerCase()}? Si te sirve, la podemos ajustar a lo que necesitas ahora y dejar lo demás para después. Este mes además tenemos 20% de descuento.` })
    } else if (c.stage === 'interesado' && c.age >= 2 && c.age < 120) {
      out.push({ c, prio: c.age < 21 ? 'alta' : 'media', why: `Mostró interés en ${topic.toLowerCase()} hace ${d} días y no llegó a cotizar.`,
        msg: `${hi}, hace unos días hablamos de ${topic.toLowerCase()}. Te preparé una idea rápida de cómo quedaría para tu negocio, ¿te la mando por aquí?` })
    } else if (c.stage === 'ganado' && c.age >= 45) {
      out.push({ c, prio: 'baja', why: `Es cliente y no hablan hace ${d} días.`,
        msg: `${hi}, ¿cómo va todo con tu página? Si necesitas cambiar fotos, precios o agregar algo nuevo, te ayudo. Y si conoces a alguien que necesite una web, te lo agradecería mucho.` })
    } else if (c.stage === 'nuevo' && !c.lastFromMe && c.age < 60) {
      out.push({ c, prio: 'media', why: 'Conversación sin seguimiento.', msg: `${hi}, ¿en qué te puedo ayudar con tu negocio?` })
    }
  }
  const w = { alta: 0, media: 1, baja: 2 }
  return out.sort((a, b) => w[a.prio] - w[b.prio] || b.c.score - a.c.score)
}
const waLink = (phone, text) => `https://wa.me/${String(phone).replace(/\D/g, '')}?text=${encodeURIComponent(text)}`

/* ── Vistas ─────────────────────────────────────────── */
let LIST = []
function render() {
  LIST = contacts()
  const fu = followUps(LIST)
  $('#b-follow').textContent = fu.length || ''
  $('#demo-banner').hidden = !DEMO
  $('#sync').innerHTML = waBadge()
  $('#b-chats').textContent = LIST.filter((c) => c.unanswered && c.age < 30).length || ''
  ;({ panel: renderPanel, chats: renderChats, seguimiento: () => renderFollow(fu), contactos: renderTable, embudo: renderBoard, prospectos: renderProspects, conectar: () => {} })[view]()
}

function renderPanel() {
  const L = LIST
  const active30 = L.filter((c) => c.age <= 30).length
  const pending = L.filter((c) => c.unanswered && c.stage !== 'perdido').length
  const won = L.filter((c) => c.stage === 'ganado').length
  const open = L.filter((c) => ['interesado', 'cotizado', 'negociacion'].includes(c.stage)).length
  const conv = L.length ? Math.round((won / L.length) * 100) : 0
  $('#kpis').innerHTML = [
    ['Contactos', L.length, `${active30} activos en 30 días`],
    ['Oportunidades abiertas', open, 'interesados, cotizados y en negociación'],
    ['Sin responder', pending, 'el cliente escribió último'],
    ['Clientes ganados', won, `${conv}% de los contactos`],
    ['Interés promedio', L.length ? Math.round(L.reduce((n, c) => n + c.score, 0) / L.length) : 0, 'de 100'],
  ].map(([l, v, d]) => `<div class="kpi"><div class="l">${l}</div><div class="v">${v}</div><div class="d">${d}</div></div>`).join('')

  // mensajes por semana
  const weeks = 12, start = now() - weeks * 7 * DAY
  const inW = Array(weeks).fill(0), outW = Array(weeks).fill(0)
  for (const c of L) for (const m of c.messages) if (m.ts >= start) { const i = Math.min(weeks - 1, Math.floor((m.ts - start) / (7 * DAY))); (m.fromMe ? outW : inW)[i]++ }
  const max = Math.max(1, ...inW, ...outW), W = 560, H = 170, bw = W / weeks
  let svg = `<svg viewBox="0 0 ${W} ${H + 22}" width="100%" role="img" aria-label="Mensajes por semana">`
  for (let k = 0; k <= 4; k++) { const y = H - (H * k) / 4; svg += `<line x1="0" x2="${W}" y1="${y}" y2="${y}" stroke="#222226"/>` }
  inW.forEach((v, i) => {
    const h1 = (v / max) * (H - 10), h2 = (outW[i] / max) * (H - 10), x = i * bw + bw * 0.18
    svg += `<rect x="${x}" y="${H - h1}" width="${bw * 0.3}" height="${h1}" rx="3" fill="#ededee"><title>${v} recibidos</title></rect>`
    svg += `<rect x="${x + bw * 0.34}" y="${H - h2}" width="${bw * 0.3}" height="${h2}" rx="3" fill="#55555d"><title>${outW[i]} enviados</title></rect>`
    if (i % 2 === 0) svg += `<text x="${x + bw * 0.3}" y="${H + 16}" text-anchor="middle">${new Date((start + i * 7 * DAY) * 1000).toLocaleDateString('es-HN', { day: 'numeric', month: 'short' })}</text>`
  })
  $('#chart-weeks').innerHTML = svg + `<text x="${W}" y="12" text-anchor="end">máx ${max}</text></svg><div class="legend"><span><i style="background:#ededee"></i>Recibidos</span><span><i style="background:#55555d"></i>Enviados</span></div>`

  const bars = (rows) => `<div class="bars">${rows.map(([l, n, tot]) => `<div class="bar"><span>${esc(l)}</span><span class="t"><i style="width:${tot ? (n / tot) * 100 : 0}%"></i></span><span class="n">${n}</span></div>`).join('')}</div>`
  const fmax = Math.max(1, ...STAGES.map((s) => L.filter((c) => c.stage === s.id).length))
  $('#chart-funnel').innerHTML = bars(STAGES.map((s) => [s.label, L.filter((c) => c.stage === s.id).length, fmax]))
  const tmax = Math.max(1, ...TOPICS.map((t) => L.filter((c) => c.topics.includes(t.id)).length))
  $('#chart-topics').innerHTML = bars(TOPICS.map((t) => [t.id, L.filter((c) => c.topics.includes(t.id)).length, tmax]).sort((a, b) => b[1] - a[1]))
  const rt = L.flatMap((c) => c.respTimes)
  const buckets = [['< 15 min', 900], ['< 1 hora', 3600], ['< 6 horas', 21600], ['< 1 día', DAY], ['Más de 1 día', Infinity]]
  let prev = 0
  const counts = buckets.map(([l, lim]) => { const n = rt.filter((t) => t >= prev && t < lim).length; prev = lim; return [l, n] })
  const rmax = Math.max(1, ...counts.map((c) => c[1]))
  const med = rt.length ? [...rt].sort((a, b) => a - b)[Math.floor(rt.length / 2)] : 0
  $('#chart-resp').innerHTML = bars(counts.map(([l, n]) => [l, n, rmax])) + `<p class="hint" style="margin-top:12px">Mediana: <b style="color:var(--fg)">${med < 3600 ? Math.round(med / 60) + ' min' : (med / 3600).toFixed(1) + ' h'}</b>. Responder en menos de 1 hora suele marcar la diferencia en WhatsApp.</p>`
}

function renderFollow(fu) {
  if (!fu.length) { $('#follow').innerHTML = '<div class="card empty">No hay seguimientos pendientes. Revisa la sección Prospectos para contactar negocios nuevos.</div>'; return }
  $('#follow').innerHTML = fu.map((f, i) => `
    <div class="fu" data-i="${i}">
      <div><span class="prio ${f.prio}">Prioridad ${f.prio}</span><h3 style="margin-top:4px"><a href="#" data-open="${esc(f.c.jid)}" style="color:inherit">${esc(f.c.name)}</a></h3>
        <div class="why">${esc(f.why)}</div><div style="margin-top:8px"><span class="pill s-${f.c.stage}">${stageLabel(f.c.stage)}</span> ${f.c.topics.map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</div>
        <div class="why" style="margin-top:8px">Último: “${esc((f.c.last?.text || '').slice(0, 120))}”</div></div>
      <textarea aria-label="Mensaje sugerido">${esc(f.msg)}</textarea>
      <div class="acts">${canSend(f.c) ? '<button class="btn" type="button" data-crm>Enviar desde el CRM</button><a class="btn ghost" target="_blank" rel="noopener" data-send>Abrir en WhatsApp</a>' : '<a class="btn" target="_blank" rel="noopener" data-send>Abrir en WhatsApp</a>'}<button class="btn ghost" data-done type="button">Marcar enviado</button></div>
    </div>`).join('')
  $$('#follow .fu').forEach((el) => {
    const f = fu[+el.dataset.i], ta = $('textarea', el), a = $('[data-send]', el)
    const upd = () => (a.href = waLink(f.c.phone, ta.value))
    upd(); ta.addEventListener('input', upd)
    $('[data-done]', el).onclick = () => { S.done[f.c.jid] = now(); if (f.c.stage === 'nuevo') setStage(f.c.jid, 'interesado'); save(); render() }
    const b = $('[data-crm]', el)
    if (b) b.onclick = async () => { if (await sendText(f.c.jid, ta.value, b)) { S.done[f.c.jid] = now(); save(); render() } }
  })
}

function fillSelect(sel, opts) { const v = sel.value; sel.innerHTML = sel.options[0].outerHTML + opts.map((o) => `<option value="${esc(o[0])}">${esc(o[1])}</option>`).join(''); sel.value = v }
function renderTable() {
  fillSelect($('#f-stage'), STAGES.map((s) => [s.id, s.label]))
  fillSelect($('#f-topic'), TOPICS.map((t) => [t.id, t.id]))
  const q = norm($('#f-q').value), st = $('#f-stage').value, tp = $('#f-topic').value, lw = $('#f-last').value, ag = $('#f-age').value
  const rows = LIST.filter((c) =>
    (!q || norm(c.name + ' ' + c.phone + ' ' + c.messages.map((m) => m.text).join(' ')).includes(q)) &&
    (!st || c.stage === st) && (!tp || c.topics.includes(tp)) &&
    (!lw || (lw === 'cliente' ? c.unanswered : c.lastFromMe)) &&
    (!ag || (ag === '90' ? c.age > 90 : c.age <= +ag)))
  $('#tbl tbody').innerHTML = rows.length ? rows.map((c) => `<tr data-open="${esc(c.jid)}">
      <td class="who"><b>${esc(c.name)}</b><span>${c.phone ? '+' + esc(c.phone) : 'sin número'}</span></td>
      <td><span class="pill s-${c.stage}">${stageLabel(c.stage)}</span></td>
      <td><span class="score"><i><b style="width:${c.score}%"></b></i>${c.score}</span></td>
      <td>${c.topics.map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</td>
      <td class="last">${c.lastFromMe ? '<span style="color:var(--dim)">Tú: </span>' : ''}${esc(c.last?.text)}</td>
      <td class="num">${ago(c.age)}</td></tr>`).join('') : '<tr><td colspan="6" class="empty">Ningún contacto coincide con los filtros.</td></tr>'
}
const ago = (d) => (d < 1 ? 'hoy' : d < 2 ? 'ayer' : d < 60 ? Math.round(d) + ' d' : Math.round(d / 30) + ' meses')

function renderBoard() {
  $('#board').innerHTML = STAGES.map((s) => {
    const cs = LIST.filter((c) => c.stage === s.id)
    return `<div class="col" data-stage="${s.id}"><h4>${s.label} <b>${cs.length}</b></h4>${cs.map((c) => `<div class="kc" draggable="true" data-jid="${esc(c.jid)}" data-open="${esc(c.jid)}"><b>${esc(c.name)}</b><span>${c.topics.slice(0, 2).join(' · ') || 'Sin tema'} · ${ago(c.age)}</span></div>`).join('')}</div>`
  }).join('')
  $$('.kc').forEach((k) => k.addEventListener('dragstart', (e) => e.dataTransfer.setData('text', k.dataset.jid)))
  $$('.col').forEach((col) => {
    col.addEventListener('dragover', (e) => { e.preventDefault(); col.classList.add('over') })
    col.addEventListener('dragleave', () => col.classList.remove('over'))
    col.addEventListener('drop', (e) => { e.preventDefault(); setStage(e.dataTransfer.getData('text'), col.dataset.stage); render() })
  })
}
function setStage(jid, stage) { S.contacts[jid] = { ...(S.contacts[jid] || {}), stage }; save() }

/* ── Prospectos (generación de leads) ───────────────── */
const CAT_VALUE = { 'Clínica dental': 30, 'Clínica médica': 20, 'Legal / profesional': 15, 'Salón / barbería': 15, 'Tienda / ropa': 15, Restaurante: 10, Otro: 5 }
const WEB_VALUE = { 'sin web': 40, 'solo redes': 40, 'web vieja': 25, 'tiene web': 5 }
function pScore(p) { return Math.min(100, (CAT_VALUE[p.cat] || 5) + (WEB_VALUE[p.web] || 0) + (p.phone ? 20 : 0) + (p.zone ? 5 : 0)) }
function pMsg(p) {
  if (/dental|médica/i.test(p.cat)) return `Buen día. Desarrollamos Dentico, un sistema para clínicas hecho en Honduras: agenda con recordatorios por WhatsApp, expediente, odontograma y firma de consentimientos en tablet. ¿Le puedo mandar un video de 25 segundos para que lo vea?`
  if (p.web === 'tiene web') return `Hola, revisé la página de ${p.name}. Tengo 3 ideas concretas para que reciba más mensajes desde el celular. ¿Se las mando por aquí?`
  return `Hola, vi el perfil de ${p.name} y se nota el buen trabajo que hacen. Cuando alguien los busca en Google solo aparecen las redes. Armé 3 ideas cortas de cómo podrían recibir citas y pedidos sin responder uno por uno. ¿Se las mando por aquí?`
}
function renderProspects() {
  const cats = [...new Set(S.prospects.map((p) => p.cat))]
  fillSelect($('#p-cat'), cats.map((c) => [c, c]))
  const fc = $('#p-cat').value, fs = $('#p-status').value
  const rows = S.prospects.map((p, i) => ({ ...p, i, score: pScore(p) })).filter((p) => (!fc || p.cat === fc) && (!fs || p.status === fs)).sort((a, b) => b.score - a.score)
  $('#ptbl tbody').innerHTML = rows.length ? rows.map((p) => `<tr>
    <td><span class="score"><i><b style="width:${p.score}%"></b></i>${p.score}</span></td>
    <td class="who"><b>${esc(p.name)}</b><span>${p.phone ? '+' + esc(p.phone) : 'sin número'}</span></td>
    <td>${esc(p.cat)}</td><td>${esc(p.web)}</td><td>${esc(p.zone)}</td>
    <td><select data-ps="${p.i}">${['pendiente', 'contactado', 'respondió', 'descartado'].map((s) => `<option ${s === p.status ? 'selected' : ''}>${s}</option>`).join('')}</select></td>
    <td>${p.phone ? `<a class="btn ghost" target="_blank" rel="noopener" href="${waLink(p.phone, pMsg(p))}" data-pc="${p.i}">Escribir</a>` : ''}</td></tr>`).join('')
    : '<tr><td colspan="7" class="empty">Aún no tienes prospectos. Agrega negocios de Google Maps que solo tengan redes sociales: son los que más necesitan una web.</td></tr>'
  $$('[data-ps]').forEach((s) => (s.onchange = () => { S.prospects[+s.dataset.ps].status = s.value; save() }))
  $$('[data-pc]').forEach((a) => a.addEventListener('click', () => { const p = S.prospects[+a.dataset.pc]; if (p.status === 'pendiente') { p.status = 'contactado'; save(); setTimeout(render, 300) } }))
}
$('#lead-form').addEventListener('submit', (e) => {
  e.preventDefault()
  S.prospects.push({ name: $('#l-name').value.trim(), cat: $('#l-cat').value, phone: $('#l-phone').value.replace(/\D/g, ''), web: $('#l-web').value, zone: $('#l-zone').value.trim(), status: 'pendiente', added: now() })
  e.target.reset(); save(); render()
})
$('#l-import').onclick = () => {
  const lines = $('#l-csv').value.split('\n').map((l) => l.split(',').map((x) => x.trim())).filter((r) => r[0])
  for (const [name, cat = 'Otro', phone = '', web = 'sin web', zone = ''] of lines) S.prospects.push({ name, cat, phone: phone.replace(/\D/g, ''), web: web.toLowerCase(), zone, status: 'pendiente', added: now() })
  $('#l-csv').value = ''; save(); render()
}

/* ── Detalle de contacto ────────────────────────────── */
function openContact(jid) {
  const c = LIST.find((x) => x.jid === jid); if (!c) return
  $('#drawer').hidden = false
  $('#d-name').textContent = c.name
  $('#d-phone').textContent = `${c.phone ? '+' + c.phone : 'sin número'} · interés ${c.score}/100 · etapa detectada: ${stageLabel(c.auto)}`
  $('#d-stage').innerHTML = STAGES.map((s) => `<option value="${s.id}" ${s.id === c.stage ? 'selected' : ''}>${s.label}</option>`).join('')
  $('#d-stage').onchange = (e) => { setStage(jid, e.target.value); render(); openContact(jid) }
  $('#d-tags').value = c.tags.join(', ')
  $('#d-tags').onchange = (e) => { S.contacts[jid] = { ...(S.contacts[jid] || {}), tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) }; save() }
  $('#d-notes').value = c.notes
  $('#d-notes').oninput = (e) => { S.contacts[jid] = { ...(S.contacts[jid] || {}), notes: e.target.value }; save() }
  const f = followUps([c])[0]
  $('#d-suggest').innerHTML = f ? `<div class="card"><span class="prio ${f.prio}">Seguimiento sugerido</span><div class="why">${esc(f.why)}</div><textarea id="d-msg" rows="3">${esc(f.msg)}</textarea><a class="btn" id="d-send" target="_blank" rel="noopener">Abrir en WhatsApp</a></div>` : ''
  if (f) { const u = () => ($('#d-send').href = waLink(c.phone, $('#d-msg').value)); u(); $('#d-msg').oninput = u }
  $('#d-compose').hidden = !canSend(c)
  $('#d-compose-note').textContent = WA.state === 'conectado' ? (canSend(c) ? '' : 'Este contacto aún no te ha escrito. Por seguridad, el primer mensaje envíalo desde tu teléfono.') : 'Conecta WhatsApp para responder desde aquí.'
  $('#d-send-btn').onclick = async () => { if (await sendText(jid, $('#d-text').value, $('#d-send-btn'))) $('#d-text').value = '' }
  $('#d-text').onkeydown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); $('#d-send-btn').click() } }
  OPEN = jid
  let lastDay = ''
  $('#d-chat').innerHTML = c.messages.map((m) => {
    const d = new Date(m.ts * 1000), day = d.toLocaleDateString('es-HN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
    const sep = day !== lastDay ? `<div class="day">${day}</div>` : ''; lastDay = day
    return sep + `<div class="msg ${m.fromMe ? 'me' : ''}">${esc(m.text)}<small>${d.toLocaleTimeString('es-HN', { hour: '2-digit', minute: '2-digit' })}</small></div>`
  }).join('')
  $('#d-chat').scrollTop = 1e9
}
$('#d-close').onclick = () => { $('#drawer').hidden = true; OPEN = null }
document.addEventListener('keydown', (e) => e.key === 'Escape' && ($('#drawer').hidden = true))
document.addEventListener('click', (e) => { const t = e.target.closest('[data-open]'); if (t) { e.preventDefault(); openContact(t.dataset.open) } })

/* ── Importar chats exportados (.txt) ───────────────── */
const LINE = /^\[?(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4}),?\s+(\d{1,2}):(\d{2})(?::\d{2})?\s*([ap]\.?\s?m\.?)?\]?\s*(?:-\s*)?([^:]+?):\s([\s\S]*)$/i
function parseExport(txt, fileName) {
  const out = []
  for (const raw of txt.replace(/‎| /g, ' ').split(/\r?\n/)) {
    const m = raw.match(LINE)
    if (m) {
      let [, d, mo, y, h, mi, ap, who, text] = m
      y = +y < 100 ? 2000 + +y : +y; h = +h
      if (ap) { const pm = /p/i.test(ap); if (pm && h < 12) h += 12; if (!pm && h === 12) h = 0 }
      out.push({ who: who.trim(), ts: Math.floor(new Date(y, +mo - 1, +d, h, +mi).getTime() / 1000), text: text.trim() })
    } else if (out.length && raw.trim()) out[out.length - 1].text += '\n' + raw
  }
  return out.filter((m) => m.text && !/cifrado de extremo|end-to-end|<multimedia omitido>|<media omitted>/i.test(m.text))
}
async function importFiles(files) {
  const parsed = []
  for (const f of files) parsed.push({ file: f.name, msgs: parseExport(await f.text(), f.name) })
  // quién eres tú: el nombre que aparece en todos los archivos (o el que escribas)
  let me = $('#me-name').value.trim() || S.me
  if (!me) {
    const count = {}
    parsed.forEach((p) => new Set(p.msgs.map((m) => m.who)).forEach((w) => (count[w] = (count[w] || 0) + 1)))
    me = Object.entries(count).sort((a, b) => b[1] - a[1])[0]?.[0] || ''
    if (parsed.length === 1) me = ''
  }
  S.me = me
  let n = 0
  for (const p of parsed) {
    const other = p.msgs.find((m) => m.who !== me)?.who || p.file.replace(/^Chat de WhatsApp con |^WhatsApp Chat with |\.txt$/gi, '')
    const phone = (other.match(/\+?[\d\s-]{8,}/)?.[0] || '').replace(/\D/g, '') || 'sin-numero-' + norm(other).replace(/\W+/g, '-')
    const jid = phone + '@import'
    S.imported = S.imported.filter((c) => c.jid !== jid)
    S.imported.push({ jid, phone, name: /^\+?[\d\s-]+$/.test(other) ? null : other, messages: p.msgs.map((m) => ({ fromMe: me ? m.who === me : false, ts: m.ts, text: m.text })) })
    n++
  }
  if (S.imported.length && DEMO) { DEMO = false; DATA = { chats: [], updatedAt: null } }
  save(); render()
  $('#import-msg').textContent = `${n} chat${n === 1 ? '' : 's'} importado${n === 1 ? '' : 's'}.` + (me ? ` Te detecté como “${me}”.` : ' Escribe tu nombre arriba para separar tus mensajes de los del cliente y vuelve a importar.')
}
$('#files').onchange = (e) => importFiles([...e.target.files])
const drop = $('#drop')
drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('over') })
drop.addEventListener('dragleave', () => drop.classList.remove('over'))
drop.addEventListener('drop', (e) => { e.preventDefault(); drop.classList.remove('over'); importFiles([...e.dataTransfer.files]) })

/* ── Chats (estilo WhatsApp) ───────────────────────── */
let CHAT = null, CF = ''
const hhmm = (ts) => {
  const d = new Date(ts * 1000), t = (now() - ts) / DAY
  if (t < 1 && d.getDate() === new Date().getDate()) return d.toLocaleTimeString('es-HN', { hour: '2-digit', minute: '2-digit' })
  return t < 7 ? d.toLocaleDateString('es-HN', { weekday: 'short' }) : d.toLocaleDateString('es-HN', { day: 'numeric', month: 'short' })
}
const initial = (n) => (String(n || '#').replace(/^.*·\s*/, '').trim()[0] || '#').toUpperCase()
function renderChats() {
  const q = norm($('#c-q').value)
  const rows = LIST.filter((c) => (!q || norm(c.name + ' ' + c.phone).includes(q)) && (!CF || (CF === 'pend' ? c.unanswered : ['interesado', 'cotizado', 'negociacion'].includes(c.stage))))
  if (!CHAT && rows[0]) CHAT = rows[0].jid
  $('#c-list').innerHTML = rows.map((c) => `<button class="wa-item ${c.jid === CHAT ? 'on' : ''}" data-chat="${esc(c.jid)}" type="button">
      <span class="av">${esc(initial(c.name))}</span>
      <span class="wi"><span class="wt"><b>${esc(c.name)}</b><small>${c.last ? hhmm(c.last.ts) : ''}</small></span>
      <span class="wt"><span class="wl">${c.lastFromMe ? 'Tú: ' : ''}${esc(c.last?.text || '')}</span>${c.unanswered ? '<i class="dot" title="Sin responder"></i>' : ''}</span></span></button>`).join('') || '<p class="hint" style="padding:16px">Sin chats.</p>'
  $$('[data-chat]').forEach((b) => (b.onclick = () => { CHAT = b.dataset.chat; renderChats(); $('#c-text').focus() }))
  const c = LIST.find((x) => x.jid === CHAT)
  if (!c) { $('#c-head').innerHTML = '<p class="hint">Elige un chat</p>'; $('#c-msgs').innerHTML = ''; $('#c-compose').hidden = true; $('#c-note').textContent = ''; return }
  $('#c-head').innerHTML = `<div><b>${esc(c.name)}</b><span class="hint"> ${c.phone ? '+' + esc(c.phone) : ''}</span></div><div class="wh-r"><span class="pill s-${c.stage}">${stageLabel(c.stage)}</span><button class="btn ghost" type="button" data-open="${esc(c.jid)}">Ficha</button></div>`
  const box = $('#c-msgs')
  const stick = box.dataset.jid !== c.jid || box.scrollHeight - box.scrollTop - box.clientHeight < 80
  let lastDay = ''
  box.innerHTML = c.messages.map((m) => {
    const d = new Date(m.ts * 1000), day = d.toLocaleDateString('es-HN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    const sep = day !== lastDay ? `<div class="day">${day}</div>` : ''
    lastDay = day
    return sep + `<div class="msg ${m.fromMe ? 'me' : ''}">${esc(m.text)}<small>${d.toLocaleTimeString('es-HN', { hour: '2-digit', minute: '2-digit' })}</small></div>`
  }).join('')
  box.dataset.jid = c.jid
  if (stick) box.scrollTop = box.scrollHeight
  const ok = canSend(c)
  $('#c-compose').hidden = !ok
  $('#c-note').textContent = ok ? '' : WA.state === 'conectado' ? 'Este contacto aún no te ha escrito. Por seguridad, el primer mensaje envíalo desde tu teléfono.' : 'Conecta WhatsApp para responder desde aquí.'
  $('#c-send').onclick = async () => { if (await sendText(c.jid, $('#c-text').value, $('#c-send'))) { $('#c-text').value = ''; $('#c-text').focus() } }
}
$('#c-text').addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); $('#c-send').click() } })
$('#c-q').addEventListener('input', () => view === 'chats' && renderChats())
$$('[data-cf]').forEach((b) => (b.onclick = () => { CF = b.dataset.cf; $$('[data-cf]').forEach((x) => x.classList.toggle('on', x === b)); renderChats() }))

/* ── WhatsApp en vivo ───────────────────────────────── */
let OPEN = null
function waBadge() {
  const m = { apagado: 'WhatsApp apagado', iniciando: 'Abriendo WhatsApp Web…', qr: 'Escanea el QR para conectar', autenticado: 'Conectando…', sincronizando: 'Leyendo chats' + (WA.progress ? ' ' + WA.progress : '') + '…', conectado: '● En vivo', desconectado: 'WhatsApp desconectado', error: 'Error de WhatsApp' }
  const t = DEMO ? 'Datos de ejemplo' : (m[WA.state] || WA.state)
  return `<span class="${WA.state === 'conectado' ? 'live' : ''}">${t}</span>`
}
function renderConnect() {
  const box = $('#qr-box')
  if (WA.state === 'qr' && WA.qr) box.innerHTML = `<img alt="Código QR de WhatsApp" src="${WA.qr}">`
  else if (WA.state === 'conectado') box.innerHTML = `<p class="hint"><b class="live">● En vivo</b>${WA.me ? ' como +' + esc(WA.me) : ''}. Los mensajes nuevos aparecen solos.</p>`
  else if (WA.state === 'error' || WA.state === 'desconectado') box.innerHTML = `<p class="hint" style="color:var(--bad)">${esc(WA.error || 'Error')}</p>`
  else if (WA.state === 'apagado') box.innerHTML = '<p class="hint">WhatsApp no está activo. Inicia el CRM con <code>npm start</code>.</p>'
  else box.innerHTML = `<p class="hint">${esc(waBadge().replace(/<[^>]+>/g, ''))}</p>`
}
async function sendText(jid, text, btn) {
  text = String(text || '').trim()
  if (!text) return false
  const old = btn.textContent
  btn.disabled = true; btn.textContent = 'Enviando…'
  try {
    const r = await fetch('/api/send', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ jid, text }) })
    const j = await r.json().catch(() => ({}))
    if (!r.ok) throw new Error(j.error || 'No se pudo enviar.')
    toast('Mensaje enviado')
    return true
  } catch (e) { toast(e.message, true); return false } finally { btn.disabled = false; btn.textContent = old }
}
function toast(t, bad) {
  const el = document.createElement('div'); el.className = 'toast' + (bad ? ' bad' : ''); el.textContent = t
  document.body.append(el); setTimeout(() => el.remove(), 3800)
}
async function reconnect(fresh) {
  try { await fetch('/api/reconnect' + (fresh ? '?nueva=1' : ''), { method: 'POST' }); toast(fresh ? 'Generando un QR nuevo…' : 'Reconectando…') } catch { toast('No se pudo reconectar', true) }
}
$('#wa-retry').onclick = () => reconnect(false)
$('#wa-fresh').onclick = () => reconnect(true)
async function reload() {
  try { const j = await (await fetch('/api/data')).json(); if (j.wa?.chats?.length) { DEMO = false; DATA = j.wa } if (j.status) WA = j.status; render(); if (OPEN) openContact(OPEN) } catch {}
}
function live() {
  const es = new EventSource('/api/events')
  es.addEventListener('status', (e) => { const prev = WA.state; WA = JSON.parse(e.data); $('#sync').innerHTML = waBadge(); if (view === 'conectar') renderConnect(); if (prev !== WA.state && (WA.state === 'conectado' || prev === 'conectado')) { render(); if (OPEN) openContact(OPEN) } })
  es.addEventListener('reload', reload)
  es.addEventListener('message', (e) => {
    const ev = JSON.parse(e.data)
    if (DEMO) { DEMO = false; DATA = { chats: [], updatedAt: Date.now() } }
    let c = DATA.chats.find((x) => x.jid === ev.jid)
    if (!c) { c = { jid: ev.jid, phone: ev.phone, name: ev.name, messages: [] }; DATA.chats.push(c) }
    if (!c.messages.some((m) => m.id && m.id === ev.message.id)) c.messages.push(ev.message)
    if (!ev.message.fromMe && OPEN !== ev.jid) toast(`${ev.name || (ev.phone ? '+' + ev.phone : 'Nuevo mensaje')}: ${ev.message.text.slice(0, 60)}`)
    render()
    if (OPEN === ev.jid) openContact(ev.jid)
  })
}

/* ── Navegación y arranque ──────────────────────────── */
function go(v) {
  view = v
  $$('#nav button').forEach((b) => b.classList.toggle('on', b.dataset.view === v))
  $$('.view').forEach((s) => (s.hidden = s.id !== 'v-' + v))
  location.hash = v
  render(); if (v === 'conectar') renderConnect()
}
$$('#nav button').forEach((b) => (b.onclick = () => go(b.dataset.view)))
;['#f-q', '#f-stage', '#f-topic', '#f-last', '#f-age', '#p-cat', '#p-status'].forEach((s) => $(s).addEventListener('input', render))

function demoData() {
  const t = now(), h = 3600
  const mk = (jid, name, conv) => ({ jid, phone: jid.split('@')[0], name, messages: conv.map(([fromMe, ago, text]) => ({ fromMe, ts: t - ago, text })) })
  return [
    mk('50490000001@demo', 'Ejemplo · Clínica Sonrisa', [[0, 9 * DAY, 'Buenas, ¿cuánto cuesta el sistema para la clínica?'], [1, 9 * DAY - 2 * h, 'Hola, Dentico Estándar cuesta L. 17,500 y Premium L. 21,000. ¿Le mando el video?'], [0, 8 * DAY, 'Sí, mándelo'], [1, 8 * DAY - h, 'Aquí está el video. Puede pagarlo en hasta 3 meses.']]),
    mk('50490000002@demo', 'Ejemplo · Barbería Norte', [[0, 2 * DAY, 'Hola, quiero una página para mi barbería, ¿qué precio tiene?']]),
    mk('50490000003@demo', 'Ejemplo · Boutique Ana', [[0, 20 * DAY, 'Me interesa un catálogo para mi tienda'], [1, 20 * DAY - 3 * h, 'Claro, el plan Intermedio es desde L. 5,000 e incluye catálogo y panel.'], [0, 19 * DAY, 'Ok lo voy a pensar']]),
    mk('50490000004@demo', 'Ejemplo · Despacho Mejía', [[0, 70 * DAY, 'Ya hice la transferencia del anticipo'], [1, 70 * DAY - h, 'Recibimos el pago, gracias por su compra. Empezamos hoy.']]),
    mk('50490000005@demo', 'Ejemplo · Pizzería Roma', [[0, 5 * DAY, 'Info de páginas web por favor'], [1, 5 * DAY - 20 * 60, 'Hola, con gusto. ¿Qué tipo de negocio tienes?'], [0, 4 * DAY, 'Restaurante, quiero que vean el menú'], [1, 4 * DAY - 30 * 60, 'Te recomiendo el plan Básico, desde L. 2,500, con menú y botón de WhatsApp.']]),
    mk('50490000006@demo', 'Ejemplo · Gym Fuerza', [[0, 40 * DAY, '¿Cuánto cuesta?'], [1, 39 * DAY, 'Desde L. 2,500'], [0, 39 * DAY, 'No gracias, muy caro por ahora']]),
  ]
}

async function boot() {
  try {
    const r = await fetch('/api/data'); const j = await r.json()
    DATA = j.wa || DATA
    S = { contacts: {}, prospects: [], done: {}, imported: [], me: '', ...(j.state || {}) }
    if (j.status) WA = j.status
  } catch {}
  if (!(DATA.chats || []).length && !(S.imported || []).length) { DEMO = true; DATA = { chats: demoData(), updatedAt: null } }
  go((location.hash || '#panel').slice(1) || 'panel')
  live()
}
boot()
window.addEventListener('hashchange', () => { const v = location.hash.slice(1); if (v && v !== view && $('#v-' + v)) go(v) })
