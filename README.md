# FRAME Web Player

![Preview #1](https://i.imgur.com/AEtT4Gw.png)

FRAME is an open-source, BYOC (Bring Your Own Content) media player built with Next.js and Electron. It allows users to play their own network media links (such as M3U/M3U8 playlists) through a modern web and desktop interface. 

> **Disclaimer:** FRAME is purely a client-side media player, similar to VLC Media Player or MPC-HC. It does **not** provide, host, or distribute any media content, channels, or subscriptions. Users are solely responsible for the content they choose to play using this software. The project is strictly for personal and educational use.

## Features

- **BYOC Philosophy:** Completely isolated from external media distribution; you bring your own content.
- **Client-Side Processing:** No centralized database or external servers are used to process your media links.
- **Modern UI/UX:** Built with Next.js 14, React, and Tailwind CSS for a seamless experience.
- **Desktop Application:** Packaged with Electron and utilizes MPV (libmpv) via C++ native addons for high-performance local video rendering.
- **Open Source:** Transparent, verifiable codebase.

## Getting Started

![Preview #2](https://i.imgur.com/2rW4lej.png)

![Preview #3](https://i.imgur.com/kickpzh.jpeg)

### Prerequisites

- Node.js (v20 or higher recommended)
- npm, yarn, or pnpm
- Windows environment with Visual Studio build tools (required for compiling the `libmpv` C++ addon)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/FrknKoseoglu/frame-web-player.git
cd frame-web-player
```

2. Install dependencies (this will also compile the native addon if on Windows):
```bash
npm install
```

3. Run the Next.js development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the web interface.

### Running as Desktop App (Electron)

To run the application as a standalone desktop player with MPV support:
```bash
npm run electron-dev
```

To build and package the application for distribution:
```bash
npm run electron-build
```

## Architecture

- **Next.js 16 (App Router):** The core frontend framework.
- **Electron:** Used to package the web app as a desktop application.
- **libmpv & Node-addon-api:** A custom C++ native module (`mpv_renderer`) handles robust video playback on the desktop client.
- **Zustand:** For fast, client-side state management without the need for external databases.

## Legal & Terms of Use

By using this software, you agree to the Terms of Service outlined in the application. This project is not affiliated with any commercial "IPTV" service or reseller panel. It is forbidden to sell this software as part of a commercial product or subscription package.

## License

This project is licensed under the CC BY-NC 4.0 License - see the LICENSE file for details.
