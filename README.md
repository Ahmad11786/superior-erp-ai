# Superior ERP AI Assistant — v0.1.0 (Phase 1: Foundation)

## Install (Chrome / Edge)
1. Open chrome://extensions (Edge: edge://extensions).
2. Turn Developer mode ON.
3. Click "Load unpacked" and select the `superior-erp-ai` folder (the one containing manifest.json).

## Test
1. Open https://erp.superior.edu.pk/ and click the extension icon: status should read "ERP detected".
2. On another site the popup should read "Not on Superior ERP".
3. Click "Test background": expect "Background OK".
4. Click Settings, toggle an option, Save, reopen: the value persists.
5. F12 Console on the ERP page should show "[SEA][INFO] ERP detected".

Automation, AI and submission are intentionally not implemented yet.
