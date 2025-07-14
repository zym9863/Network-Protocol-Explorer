# Network Protocol Explorer (网络协议探险家)

[中文 | Chinese](./README.md)

A network protocol learning and analysis tool based on Express + Vue, providing OSI/TCP-IP model visualization simulation and PCAP file parsing features.

## Features

### 1. OSI/TCP-IP Reference Model Visual Simulator
- 🔄 Dynamically display data encapsulation and decapsulation processes
- 📊 Visualize protocol processing at each layer
- 🎯 Support for multiple application scenario simulations
- 📋 Detailed protocol header information display

### 2. Network Packet Capture (PCAP) Parsing & Analysis Tool
- 📁 Supports .pcap and .pcapng file uploads
- 📊 Clear packet list display
- 🔍 Detailed protocol layer structure analysis
- 🔎 Search and filter functionality
- 📈 Hexadecimal raw data viewer

## Tech Stack

- **Backend**: Express.js + Node.js
- **Frontend**: Vue 3 + Vite
- **Package Manager**: pnpm
- **PCAP Parsing**: node-pcap-parser
- **UI Components**: Element Plus

## Project Structure

```
network-protocol-explorer/
├── server/                 # Express backend
│   ├── src/
│   │   ├── controllers/    # Controllers
│   │   ├── services/       # Business logic
│   │   ├── models/         # Data models
│   │   ├── routes/         # Route definitions
│   │   └── utils/          # Utility functions
│   ├── uploads/            # File upload directory
│   └── package.json
├── client/                 # Vue frontend
│   ├── src/
│   │   ├── components/     # Components
│   │   ├── views/          # Pages
│   │   ├── stores/         # State management
│   │   └── utils/          # Utility functions
│   └── package.json
└── package.json           # Root config
```

## Quick Start

### Install Dependencies
```bash
# Install all dependencies
npm run install:all
```

### Development Mode
```bash
# Start both frontend and backend dev servers
npm run dev
```

### Production Build
```bash
# Build frontend
npm run client:build

# Start backend server
npm run server:start
```

## API Endpoints

### OSI Model Simulation
- `POST /api/protocol/encapsulate` - Data encapsulation simulation
- `POST /api/protocol/decapsulate` - Data decapsulation simulation
- `GET /api/protocol/layers` - Get protocol layer info

### PCAP File Analysis
- `POST /api/pcap/upload` - Upload PCAP file
- `GET /api/pcap/packets/:fileId` - Get packet list
- `GET /api/pcap/packet/:fileId/:packetId` - Get packet details

## Development Notes

This project uses a frontend-backend separation architecture:
- Backend provides RESTful API services
- Frontend handles UI and interaction
- Uses pnpm as the package manager
- Supports hot-reload development mode

## License

MIT License
