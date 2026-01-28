# CryptoPet 🐾

A virtual pet game that teaches cryptocurrency and blockchain through interactive learning, minigames, and on-chain achievements.

## Overview

CryptoPet is a gamified crypto education platform where users care for a virtual pet while learning about wallets, transactions, DeFi, and security. Progress is verified on-chain through soulbound badges, and pets can eventually become tradeable NFTs.

## Features

- 🐕 **Virtual Pet Care** - Feed, play, and nurture your digital companion
- 📚 **Learn Crypto** - Interactive modules covering wallets, transactions, DeFi, and security
- 🎮 **Mini Games** - Crypto Quiz, Trading Simulator, Crypto 2048
- 🏆 **On-Chain Badges** - Proof of learning as soulbound NFTs
- 👕 **Customization** - Skins, environments, and accessories (some as NFTs)
- 🌐 **Multi-Chain** - Built for Stellar, with architecture ready for Base, Solana

## Tech Stack

- **Mobile App**: React Native (Expo)
- **Backend**: Hono (TypeScript)
- **Database**: Supabase (PostgreSQL)
- **Smart Contracts**: Soroban (Stellar), Solidity (EVM)
- **Auth**: Privy + Freighter
- **State**: Zustand

## Project Structure

\`\`\`
cryptopet/
├── apps/
│   ├── mobile/          # React Native app
│   └── api/             # Hono backend
├── packages/
│   ├── contracts/       # Smart contracts
│   │   ├── stellar/     # Soroban contracts
│   │   └── evm/         # Solidity contracts (future)
│   ├── sdk/             # Multi-chain SDK
│   └── ui/              # Shared UI components
└── docs/                # Documentation
\`\`\`

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+
- Expo CLI
- Rust (for Soroban contracts)

### Installation

\`\`\`bash
# Clone the repository
git clone https://github.com/cryptopet/cryptopet.git
cd cryptopet

# Install dependencies
pnpm install

# Start the mobile app
pnpm mobile dev

# Start the API server
pnpm api dev
\`\`\`

### Environment Variables

Create \`.env.local\` files in \`apps/mobile\` and \`apps/api\`:

\`\`\`bash
# apps/api/.env.local
DATABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
PRIVY_APP_ID=your_privy_app_id
SCHEDULER_SECRET=your_scheduler_secret

# apps/mobile/.env.local
EXPO_PUBLIC_API_URL=http://localhost:3001
EXPO_PUBLIC_PRIVY_APP_ID=your_privy_app_id
\`\`\`

## Development

### Running the Mobile App

\`\`\`bash
# iOS Simulator
pnpm mobile ios

# Android Emulator
pnpm mobile android

# Expo Go (development)
pnpm mobile dev
\`\`\`

### Running the API

\`\`\`bash
pnpm api dev
\`\`\`

### Building Contracts

\`\`\`bash
cd packages/contracts/stellar/badges
cargo build --release --target wasm32-unknown-unknown
\`\`\`

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed architecture documentation.

## Contributing

1. Fork the repository
2. Create a feature branch (\`git checkout -b feat/amazing-feature\`)
3. Commit your changes (\`git commit -m 'feat: add amazing feature'\`)
4. Push to the branch (\`git push origin feat/amazing-feature\`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) for details.

## Links

- [Documentation](docs/)
- [Game Design](docs/GAME_DESIGN.md)
- [API Reference](docs/API.md)
- [Contract Specs](docs/CONTRACTS.md)
