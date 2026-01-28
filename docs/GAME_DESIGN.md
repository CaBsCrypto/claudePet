# CryptoPet Game Design Document

## Core Concept

CryptoPet is a virtual pet game that teaches cryptocurrency through care mechanics, educational modules, and minigames. Users nurture their pet while learning, with progress verified on-chain.

## Core Loop

```
User Opens App
      │
      ▼
Check Pet Stats ──► Low? ──► Feed/Care ──► Stats Improved
      │                                          │
      ▼                                          │
Choose Activity                                  │
      │                                          │
      ├──► Learn (modules) ──► XP + Progress ───►│
      │                                          │
      ├──► Play (games) ──► XP + Items ─────────►│
      │                                          │
      └──► Customize ──► Equip items ───────────►│
                                                 │
                                                 ▼
                                          Level Up?
                                                 │
                                    YES ─────────┴────────── NO
                                     │                        │
                                     ▼                        ▼
                              Unlock Rewards           Continue Playing
                              (skins, badges)
```

## Pet System

### Stats

| Stat | Range | Decay Rate | Effect at 0 |
|------|-------|------------|-------------|
| Hunger | 0-100 | -5/hour | Cannot play |
| Energy | 0-100 | -3/hour | Actions limited |
| Happiness | 0-100 | -2/hour | Less XP gained |
| Health | 0-100 | -1/hour (if hungry) | DEATH |

### Pet Types

| Type | Personality | Stat Modifiers |
|------|-------------|----------------|
| Dog | Loyal, playful | +Energy regen, -Hunger |
| Cat | Independent | Balanced |
| Dragon | Powerful | +XP gain, +Hunger drain |
| Robot | Efficient | -Hunger, +Energy drain |

### Moods

Based on stats combination:
- **Happy**: High all stats
- **Neutral**: Average stats
- **Hungry**: Hunger < 20
- **Tired**: Energy < 20
- **Sad**: Happiness < 30
- **Sick**: Health < 20
- **Dead**: Health = 0

## Progression System

### XP Sources

| Action | XP | Limit |
|--------|-----|-------|
| Complete lesson | +20-50 | - |
| Pass quiz (70%+) | +50 | - |
| Practice task | +100 | - |
| Perfect quiz | +30 bonus | - |
| Minigame | +10-30 | 3-10/day |
| Daily login | +5-25 | 1/day |
| 7-day streak | +50 | weekly |

### Level Progression

| Level | XP Required | Unlocks |
|-------|-------------|---------|
| 1 | 0 | Basic pet, home environment |
| 2 | 100 | Skin: Space Explorer |
| 3 | 300 | Environment: Wallet World |
| 4 | 600 | Skin: Cyber Punk |
| 5 | 1000 | Environment: DeFi Dimension |
| 6 | 1500 | Accessory: Bitcoin Hat |
| 7 | 2200 | Breeding enabled |
| 8 | 3000 | Environment: Security Fortress |
| 9 | 4000 | Skin: DeFi Wizard |
| 10 | 5500 | Pet becomes NFT! |

## Learning Modules

### Module Structure

```
Module
├── 3-4 Lessons (text/video)
├── Quiz (5-10 questions)
├── Practice Task (optional, on-chain)
└── Badge (on-chain reward)
```

### MVP Modules

#### 1. Your First Wallet
- What is a crypto wallet?
- Seed phrases explained
- Security best practices
- Quiz: Security fundamentals
- Badge: "Wallet Master"

#### 2. Send & Receive
- How transactions work
- Addresses and fees
- Quiz: Transaction basics
- Practice: Send testnet tokens
- Badge: "First Transaction"

#### 3. What is a Swap?
- DEX vs CEX
- How swaps work
- Slippage and price impact
- Quiz: DeFi basics
- Practice: Swap on Soroswap testnet
- Badge: "DeFi Beginner"

### Future Modules
- Security Deep Dive
- NFTs Explained
- Yield Farming Basics
- DAO Governance
- Cross-chain Bridges

## Minigames

### Crypto Quiz
- Rapid-fire questions
- 15 seconds per question
- Pool of 50+ questions
- Rewards: XP based on score
- Limit: 3 plays/day

### Trading Simulator
- Fake tokens, real concepts
- Buy/sell based on "news"
- Learn market dynamics
- Rewards: XP + food items
- Limit: 5 plays/day

### Crypto 2048
- Classic 2048 with crypto tokens
- Merge tokens: BTC → ETH → SOL...
- Rewards: XP based on highest tile
- Limit: 10 plays/day

## Items & Economy

### Consumables (Off-chain)

| Item | Effect | Acquisition |
|------|--------|-------------|
| Basic Food | +20 hunger | Minigames, daily |
| Premium Food | +50 hunger, +10 happiness | Achievements |
| Energy Drink | +30 energy | Minigames |
| Medicine | +30 health | Shop (future) |
| Toy | +20 happiness | Minigames |

### Skins (NFT option)

| Rarity | Examples | NFT? |
|--------|----------|------|
| Common | Classic | No |
| Rare | Space Explorer | No |
| Epic | DeFi Wizard, Cyber Punk | Yes |
| Legendary | Golden Hodler | Yes |

### Environments (NFT option)

| Rarity | Examples | NFT? |
|--------|----------|------|
| Common | Cozy Home | No |
| Rare | Wallet World, Security Fortress | No |
| Epic | DeFi Dimension | Yes |
| Legendary | Moon Base | Yes |

## Death & Revival

### Death Trigger
- Health reaches 0
- Occurs from prolonged neglect

### Revival Options

| Option | Cost | Result |
|--------|------|--------|
| Free Revival | Once per account | 50% stats, -1 level |
| Wait 24h | Time | 30% stats, -2 levels |
| Revival Token | NFT (consumed) | 100% stats, no penalty |
| New Pet | - | Start over, keep badges |

## Breeding (Level 7+)

### Requirements
- Both pets level 7+
- 7-day cooldown between breeds
- Both pets must be alive

### Offspring
- Inherits traits from parents
- 10% mutation chance
- Higher generation = higher rarity
- New pet starts at level 1

## On-Chain Elements

### Badges (Soulbound)
- Proof of completed modules
- Cannot be transferred
- Verifiable on-chain
- Portable to other apps

### Pet NFTs (Level 10+)
- Tradeable on marketplace
- Breeding mechanics
- Traits stored on-chain
- Generation tracking

### Item NFTs
- Epic/Legendary skins
- Epic/Legendary environments
- Revival tokens
- Tradeable

## Retention Mechanics

### Daily Login
- Streak system (1-7+ days)
- Increasing rewards
- Streak lost after 48h inactivity

### Push Notifications
- "Your pet is hungry!"
- "New module available!"
- "Streak about to end!"

### Social (Future)
- Leaderboards
- Badge showcasing
- Pet battles
- Guild/teams
