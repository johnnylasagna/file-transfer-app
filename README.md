# FilezTransfer

An Electron desktop app for sharing a local folder over your LAN and letting other devices browse, preview, and download selected files as a ZIP archive from a browser.

## Features

- Share any local folder from the desktop app
- Automatic server discovery on local network using Bonjour/mDNS
- Basic authentication for all hosted routes
- Browser-based file explorer for receivers
- Preview files directly in the browser
- Add multiple files/folders to a download cart and download as `download.zip`
- Dynamic port selection starting from `8000`

## Tech Stack

- Electron (desktop shell)
- Express (HTTP server)
- Bonjour (service discovery)
- express-basic-auth (route protection)
- Archiver (ZIP creation)
- Fluent UI Web Components (UI)

## Project Structure

```text
.
├─ main.js
├─ package.json
├─ renderer/
│  ├─ index.html
│  ├─ renderer.js
│  └─ styles.css
└─ scripts/
   ├─ findServers.js
   ├─ ipcHandler.js
   ├─ preload.js
   ├─ server.js
   ├─ window.js
   └─ public/
      ├─ index.html
      ├─ script.js
      └─ styles.css
```

## Prerequisites

- Node.js 18+ (recommended)
- npm
- Devices on the same local network (for discovery and access)

## Installation

```bash
npm install
```

## Run

```bash
npm start
```

This launches the Electron app.

## How To Use

### On the host device (desktop app)

1. Open the app.
2. In **Server Settings**, click **Open a folder** and choose what you want to share.
3. In **Host Settings**, optionally set a broadcast name.
4. In **Authentication Settings**, set a username and password.
5. Turn on **Start folder transfer server**.

### On receiver devices

You can connect in either of these ways:

- Use the app's **Find Servers** tab and click **Open <ip>** for a discovered server.
- Or open `http://<host-ip>:<port>` manually in a browser.

When prompted, enter the host's username and password.

After login, receivers can:

- Browse shared folders recursively
- Preview individual files
- Add files/folders to the cart
- Download selected items as one ZIP

## Security Notes

- Access is protected with HTTP Basic Auth.
- The server validates requested paths to prevent parent-directory traversal.
- Use only on trusted networks.

## Known Limitations

- Host IP detection currently looks for adapter names containing `Wi-Fi` or `WLAN`.
- No upload support (download-only flow).
- No automated tests configured yet (`npm test` is a placeholder).

## Useful Scripts

- `npm start` - run the Electron app
- `npm test` - placeholder test script
