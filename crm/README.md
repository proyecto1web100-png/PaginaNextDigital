# NextDigital CRM (local, en vivo)

CRM de WhatsApp Business que corre en tu computadora: panel de análisis, contactos con filtros,
embudo de ventas, seguimientos sugeridos, generación de prospectos y chat en vivo para responder
desde el CRM. Tus chats y tus notas se guardan solo en `crm/data/` (no se suben al repositorio).

Requisitos: Node.js 18 o más nuevo y Google Chrome o Microsoft Edge instalados.

## Uso

```bash
cd crm
npm install
npm start            # abre http://localhost:4100
```

`npm start` abre WhatsApp Web en tu Chrome o Edge (sin ventana) y muestra un QR en la terminal y en
*Conectar WhatsApp*. Escanéalo desde WhatsApp Business → Dispositivos vinculados. La primera vez lee
tus chats individuales (hasta 300 mensajes por chat) y después cada mensaje nuevo aparece en vivo.

Si no encuentra tu navegador (PowerShell): `$env:CHROME_PATH="C:\ruta\chrome.exe"; npm start`.
Para usar el CRM sin conectar WhatsApp: `npm run sin-whatsapp`.

## Responder desde el CRM

Abre un contacto y escribe abajo (Enter envía). Para proteger tu número:

- Solo puedes responder a contactos que ya te escribieron antes. El primer mensaje a un prospecto
  nuevo envíalo desde tu teléfono con el botón *Abrir en WhatsApp*.
- Se envía un mensaje a la vez, solo cuando presionas *Enviar*, con al menos 8 segundos entre envíos.
- No hay envíos masivos ni automáticos.

Automatizar WhatsApp Web no es una vía oficial de WhatsApp; úsalo como lo harías en tu teléfono.
Para desconectar el CRM, quítalo en Dispositivos vinculados y borra `crm/data/whatsapp-web-auth`.

### Importar chats exportados (opcional)

En cada chat: Exportar chat → Sin archivos, y arrastra los `.txt` a *Conectar WhatsApp*.
