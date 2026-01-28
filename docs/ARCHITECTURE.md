# CryptoPet Architecture

## Overview

CryptoPet follows a modern mobile-first architecture designed for:
- **Scalability**: Multi-chain support, modular components
- **Performance**: Optimized for mobile, efficient state management
- **Security**: Clear separation of concerns, on-chain verification
- **Developer Experience**: TypeScript, monorepo, shared code

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENTE (React Native)                         │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Screens   │  │ Components  │  │   Hooks     │  │   State     │        │
│  │  (Expo      │  │ (UI shared) │  │ (lógica)    │  │  (Zustand)  │        │
│  │   Router)   │  │             │  │             │  │             │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────┐       │
│  │                    Services Layer                                │       │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │       │
│  │  │ API      │  │ Wallet   │  │ Contracts│  │ Storage  │        │       │
│  │  │ Service  │  │ Service  │  │ Service  │  │ Service  │        │       │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │       │
│  └─────────────────────────────────────────────────────────────────┘       │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────┐       │
│  │                    Chain Adapters (Multi-chain)                  │       │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐                       │       │
│  │  │ Stellar  │  │  Base    │  │  Future  │                       │       │
│  │  │ Adapter  │  │ Adapter  │  │ Adapters │                       │       │
│  │  └──────────┘  └──────────┘  └──────────┘                       │       │
│  └─────────────────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              BACKEND (Hono)                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Auth      │  │  Pet State  │  │  Missions   │  │  Rewards    │        │
│  │  (Privy)    │  │  Scheduler  │  │  Validator  │  │  Distributor│        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
            ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐
            │  Supabase   │ │   Redis     │ │   Blockchains       │
            │  (Postgres) │ │  (optional) │ │  Stellar/Base/etc   │
            └─────────────┘ └─────────────┘ └─────────────────────┘
```

## Mobile App Structure

### Navigation

```
App
├── (tabs)              # Bottom tab navigator
│   ├── index           # Home - Pet view
│   ├── learn           # Learning modules
│   ├── play            # Minigames
│   ├── wardrobe        # Customization
│   └── profile         # User & wallet
├── onboarding/         # First-time user flow
├── module/[id]         # Individual module view
└── game/[id]           # Individual game view
```

### State Management (Zustand)

```typescript
// Pet state - persisted locally
usePetStore: {
  pet: Pet,
  feed(), play(), rest(), heal(),
  updateStats(), revive(), addXp()
}

// Modules state - persisted locally
useModulesStore: {
  modules: Module[],
  progress: ModuleProgress[],
  completeLesson(), completeQuiz(), mintBadge()
}

// Wallet state - partially persisted
useWalletStore: {
  isConnected, address, network,
  connect(), disconnect(), switchNetwork()
}
```

### Services Layer

```typescript
// API Service - communicates with backend
apiService.pet.feed(petId)
apiService.missions.completeLesson(moduleId, lessonId)
apiService.rewards.mintBadge(badgeId)

// Wallet Service - abstraction over wallet connections
walletService.connect(type: 'privy' | 'freighter')
walletService.signTransaction(tx)

// Contracts Service - uses chain adapters
contractsService.badges.mint(userId, badgeId)
contractsService.pets.transfer(from, to, tokenId)
```

## Backend Architecture

### API Routes

```
/api
├── /auth
│   ├── POST /wallet    # Wallet signature auth
│   ├── POST /privy     # Privy callback
│   ├── GET /me         # Current user
│   └── POST /logout    # Logout
├── /pet
│   ├── GET /           # Get pet
│   ├── POST /          # Create pet
│   ├── POST /feed      # Feed action
│   ├── POST /play      # Play action
│   ├── POST /rest      # Rest action
│   ├── POST /revive    # Revive
│   └── POST /equip     # Equip item
├── /missions
│   ├── GET /modules    # All modules
│   ├── GET /modules/:id # Module detail
│   ├── GET /progress   # User progress
│   ├── POST /complete-lesson
│   ├── POST /submit-quiz
│   └── POST /complete-practice
├── /rewards
│   ├── GET /badges     # User badges
│   ├── POST /mint-badge
│   ├── GET /inventory  # User items
│   ├── POST /claim-daily
│   └── GET /leaderboard
└── /webhooks
    ├── POST /privy     # Privy events
    ├── POST /stellar   # Chain events
    └── POST /scheduler # Cron tasks
```

### Database Schema (Supabase)

```
users
├── id, address, email, wallet_type
├── level, xp, streak
└── created_at, updated_at

pets
├── id, user_id, name, type
├── hunger, energy, happiness, health
├── equipped_skin, equipped_environment
├── is_dead, free_revival_used
└── nft_token_id, created_at

modules / lessons / quizzes / practice_tasks
├── Content for learning

module_progress
├── user_id, module_id
├── lessons_completed[], quiz_score
├── practice_completed, badge_minted
└── timestamps

items / user_items
├── Item definitions and ownership

badges / user_badges
├── Badge definitions and minted badges
└── tx_hash, network

game_sessions
├── user_id, game_id, score
└── xp_earned, duration
```

## Multi-Chain Architecture

### Chain Adapter Pattern

All chain interactions go through a common interface:

```typescript
interface ChainAdapter {
  // Connection
  connect(address?: string): Promise<boolean>
  disconnect(): void
  getAddress(): string | null

  // Badges
  mintBadge(userId: string, badgeId: string): Promise<TxResult>
  getBadges(userId: string): Promise<Badge[]>
  hasBadge(userId: string, badgeId: string): Promise<boolean>

  // Pets
  mintPet(owner: string, petType: number): Promise<TxResult>
  transferPet(from: string, to: string, tokenId: string): Promise<TxResult>
  // ...

  // Items
  mintItem(owner: string, itemType: number): Promise<TxResult>
  transferItem(from: string, to: string, tokenId: string): Promise<TxResult>
  // ...
}
```

### Adding a New Chain

1. Create adapter in `packages/sdk/src/chains/newchain.ts`
2. Implement `ChainAdapter` interface
3. Deploy contracts to new chain
4. Register in `packages/sdk/src/index.ts`
5. Add network config to `SUPPORTED_CHAINS`

## Smart Contracts

### Contract Overview

| Contract | Purpose | Soroban | EVM |
|----------|---------|---------|-----|
| Badges | Soulbound learning achievements | ✅ | 🔜 |
| Pets | Tradeable pet NFTs (level 10+) | 🔜 | 🔜 |
| Items | Skins, environments, accessories | 🔜 | 🔜 |
| Revival | Consumable revival tokens | 🔜 | 🔜 |

### On-Chain vs Off-Chain

| Data | Storage | Reason |
|------|---------|--------|
| Badges | On-chain | Proof of learning, portable |
| Pet NFTs | On-chain | Tradeable, breeding |
| Item NFTs | On-chain | Ownership verification |
| Pet stats | Off-chain | Frequent updates, gas cost |
| Progress | Off-chain | Privacy, volume |
| Inventory | Off-chain | Frequent use |

## Security Considerations

### Wallet Safety
- Never store seed phrases
- Use Privy/Freighter for key management
- Always confirm transactions in external wallet
- Validate addresses before sending

### User Protection
- Sandbox mode for new users
- Testnet-only until security module complete
- Rate limiting on actions
- Anti-cheat validation on backend

### Smart Contract Security
- Soulbound badges (no transfers)
- Admin functions require auth
- Event logging for transparency
- Emergency revoke capability

## Performance Optimizations

### Mobile
- Zustand for lightweight state
- React Native Reanimated for smooth animations
- Lazy loading for modules
- Image caching for assets

### Backend
- Edge-ready (Hono)
- Connection pooling (Supabase)
- Caching for static content
- Batch operations where possible

### Blockchain
- Batch badge mints (future)
- Gasless transactions option
- Efficient storage patterns
