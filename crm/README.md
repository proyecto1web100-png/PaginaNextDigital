# NextDigital CRM (local)

CRM de WhatsApp Business que corre en tu computadora: panel de análisis, contactos con filtros,
embudo de ventas, seguimientos sugeridos con el mensaje listo y generación de prospectos.
Tus chats y tus notas se guardan solo en `crm/data/` (no se suben al repositorio).

## Uso

```bash
cd crm
npm install
npm start            # abre http://localhost:4100
```

### Traer tus chats

**Opción 1 · Código QR** (en otra terminal, dentro de `crm`):

```bash
npm run whatsapp
```

Abre WhatsApp Web real en tu Chrome o Edge (sin ventana) y muestra el QR en la terminal y en la
sección *Conectar WhatsApp* del CRM. Escanéalo desde WhatsApp Business → Dispositivos vinculados.
El lector **solo lee**: nunca envía mensajes. Lee tus chats individuales (hasta 300 mensajes por chat)
y vuelve a leer cada 10 minutos mientras la ventana esté abierta. Para desconectarlo, quita el
dispositivo en tu teléfono y borra `crm/data/whatsapp-web-auth`.

Si no encuentra tu navegador: `$env:CHROME_PATH="C:\ruta\chrome.exe"; npm run whatsapp`.

Automatizar WhatsApp Web no es una vía oficial; por eso este CRM nunca envía nada por sí solo.

**Opción 2 · Chats exportados**: en cada chat, Exportar chat → Sin archivos, y arrastra los `.txt`
a la sección *Conectar WhatsApp*.

### Enviar seguimientos

En *Seguimiento* cada contacto trae un mensaje sugerido que puedes editar. *Abrir en WhatsApp*
abre el chat con el texto escrito; tú lo revisas y lo envías desde tu teléfono o WhatsApp Web.
