# CryptoPet API Reference

Base URL: `http://localhost:3001/api`

## Authentication

### POST /auth/wallet
Authenticate with wallet signature.

**Request:**
```json
{
  "address": "G...",
  "signature": "...",
  "message": "Sign in to CryptoPet: ...",
  "walletType": "freighter"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_123",
    "address": "G...",
    "walletType": "freighter"
  },
  "token": "session_..."
}
```

### POST /auth/privy
Handle Privy authentication callback.

### GET /auth/me
Get current user (requires Authorization header).

### POST /auth/logout
Invalidate current session.

---

## Pet

### GET /pet
Get user's pet data.

**Response:**
```json
{
  "pet": {
    "id": "pet_123",
    "name": "Buddy",
    "type": "dog",
    "level": 3,
    "xp": 450,
    "hunger": 75,
    "energy": 60,
    "happiness": 80,
    "health": 100,
    "equippedSkin": null,
    "equippedEnvironment": null,
    "isDead": false,
    "freeRevivalUsed": false
  }
}
```

### POST /pet
Create a new pet.

**Request:**
```json
{
  "name": "Buddy",
  "type": "dog"
}
```

### POST /pet/feed
Feed the pet.

**Request:**
```json
{
  "petId": "pet_123"
}
```

**Response:**
```json
{
  "success": true,
  "pet": {
    "hunger": 100,
    "happiness": 85
  },
  "itemUsed": "basic_food",
  "itemsRemaining": 5
}
```

### POST /pet/play
Play with the pet.

### POST /pet/rest
Rest the pet.

### POST /pet/revive
Revive a dead pet.

**Request:**
```json
{
  "petId": "pet_123",
  "useFreeRevival": true
}
```

### POST /pet/equip
Equip a skin or environment.

**Request:**
```json
{
  "petId": "pet_123",
  "itemId": "skin-space",
  "itemType": "skin"
}
```

---

## Missions

### GET /missions/modules
Get all learning modules.

**Response:**
```json
{
  "modules": [
    {
      "id": "wallet-basics",
      "name": "Your First Wallet",
      "description": "Learn wallet basics",
      "icon": "wallet",
      "requiredLevel": 1,
      "xpReward": 150,
      "lessonsCount": 3
    }
  ]
}
```

### GET /missions/modules/:id
Get specific module with lessons.

### GET /missions/progress
Get user's progress on all modules.

### POST /missions/complete-lesson
Mark a lesson as completed.

**Request:**
```json
{
  "moduleId": "wallet-basics",
  "lessonId": "wb-1"
}
```

**Response:**
```json
{
  "success": true,
  "xpGained": 20,
  "moduleProgress": {
    "lessonsCompleted": ["wb-1"],
    "quizUnlocked": false
  }
}
```

### POST /missions/submit-quiz
Submit quiz answers.

**Request:**
```json
{
  "moduleId": "wallet-basics",
  "answers": [
    { "questionId": "wb-q1", "answerIndex": 0 },
    { "questionId": "wb-q2", "answerIndex": 2 }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "score": 80,
  "passed": true,
  "correctAnswers": 4,
  "totalQuestions": 5,
  "xpGained": 50,
  "practiceUnlocked": true
}
```

### POST /missions/complete-practice
Complete a practice task.

**Request:**
```json
{
  "moduleId": "first-transaction",
  "txHash": "...",
  "taskType": "transaction"
}
```

---

## Rewards

### GET /rewards/badges
Get user's badges.

**Response:**
```json
{
  "badges": [
    {
      "id": "badge-wallet-master",
      "name": "Wallet Master",
      "imageUrl": "/badges/wallet.png",
      "earnedAt": 1704067200000,
      "onChain": true,
      "txHash": "..."
    }
  ]
}
```

### POST /rewards/mint-badge
Mint a badge on-chain.

**Request:**
```json
{
  "badgeId": "badge-wallet-master",
  "moduleId": "wallet-basics"
}
```

### GET /rewards/inventory
Get user's item inventory.

### POST /rewards/claim-daily
Claim daily login reward.

**Response:**
```json
{
  "success": true,
  "rewards": {
    "xp": 15,
    "items": [{ "id": "basic-food", "quantity": 2 }]
  },
  "streak": 5,
  "nextMilestone": {
    "day": 7,
    "reward": "Premium Food x5"
  }
}
```

### GET /rewards/leaderboard
Get leaderboard data.

**Query params:** `type=xp|badges|streak`

---

## Webhooks

### POST /webhooks/privy
Privy authentication events.

### POST /webhooks/stellar
Stellar transaction confirmations.

### POST /webhooks/scheduler
Scheduled tasks (requires Bearer token).

**Request:**
```json
{
  "task": "update-pet-stats"
}
```

Available tasks:
- `update-pet-stats` - Calculate stat decay
- `check-dead-pets` - Mark dead pets
- `reset-daily-limits` - Reset daily plays/rewards
- `cleanup-sessions` - Remove expired sessions

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error type",
  "message": "Human readable message",
  "details": [] // Optional, for validation errors
}
```

Common status codes:
- `400` - Bad request / validation error
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not found
- `500` - Internal server error

---

## External APIs Required

### Stellar

- **Horizon API**: Balance queries, transaction submission
- **Soroban RPC**: Smart contract interactions
- **URLs**:
  - Testnet: `https://horizon-testnet.stellar.org`
  - Soroban Testnet: `https://soroban-testnet.stellar.org`

### Soroswap

- **Router Contract**: Swap execution
- **Factory Contract**: Pool queries
- **Documentation**: [Soroswap Docs](https://docs.soroswap.finance)

### Privy

- **Auth SDK**: User authentication
- **Webhook Events**: User lifecycle
- **Documentation**: [Privy Docs](https://docs.privy.io)

### Supabase

- **Database**: PostgreSQL
- **Auth**: Session management
- **Realtime**: Live updates (future)
- **Storage**: Asset storage (future)
