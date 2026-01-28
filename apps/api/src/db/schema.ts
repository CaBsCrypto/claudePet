import { pgTable, text, integer, boolean, timestamp, jsonb, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================
// USERS
// ============================================

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  address: text('address').unique(),
  email: text('email'),
  walletType: text('wallet_type'), // 'privy' | 'freighter'
  privyUserId: text('privy_user_id'),
  level: integer('level').default(1),
  xp: integer('xp').default(0),
  streak: integer('streak').default(0),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  pet: one(pets),
  progress: many(moduleProgress),
  inventory: many(userItems),
  badges: many(userBadges),
}));

// ============================================
// PETS
// ============================================

export const pets = pgTable('pets', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'dog' | 'cat' | 'dragon' | 'robot'
  hunger: integer('hunger').default(100),
  energy: integer('energy').default(100),
  happiness: integer('happiness').default(100),
  health: integer('health').default(100),
  equippedSkin: text('equipped_skin'),
  equippedEnvironment: text('equipped_environment'),
  isDead: boolean('is_dead').default(false),
  freeRevivalUsed: boolean('free_revival_used').default(false),
  nftTokenId: text('nft_token_id'), // Once converted to NFT (level 10+)
  lastUpdated: timestamp('last_updated').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const petsRelations = relations(pets, ({ one }) => ({
  owner: one(users, {
    fields: [pets.userId],
    references: [users.id],
  }),
}));

// ============================================
// LEARNING MODULES
// ============================================

export const modules = pgTable('modules', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  icon: text('icon'),
  requiredLevel: integer('required_level').default(1),
  xpReward: integer('xp_reward').default(100),
  badgeId: text('badge_id'),
  order: integer('order').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const lessons = pgTable('lessons', {
  id: text('id').primaryKey(),
  moduleId: text('module_id').references(() => modules.id).notNull(),
  title: text('title').notNull(),
  description: text('description'),
  type: text('type').default('text'), // 'text' | 'video' | 'interactive'
  content: text('content'),
  contentUrl: text('content_url'), // For video content
  duration: integer('duration').default(5), // minutes
  order: integer('order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

export const quizzes = pgTable('quizzes', {
  id: text('id').primaryKey(),
  moduleId: text('module_id').references(() => modules.id).notNull(),
  questions: jsonb('questions').notNull(), // Array of QuizQuestion
  passingScore: integer('passing_score').default(70),
  createdAt: timestamp('created_at').defaultNow(),
});

export const practiceTasks = pgTable('practice_tasks', {
  id: text('id').primaryKey(),
  moduleId: text('module_id').references(() => modules.id).notNull(),
  title: text('title').notNull(),
  description: text('description'),
  type: text('type').notNull(), // 'transaction' | 'swap' | 'wallet-setup'
  instructions: jsonb('instructions'), // Array of strings
  validationCriteria: text('validation_criteria'),
  createdAt: timestamp('created_at').defaultNow(),
});

// ============================================
// USER PROGRESS
// ============================================

export const moduleProgress = pgTable('module_progress', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  moduleId: text('module_id').references(() => modules.id).notNull(),
  lessonsCompleted: jsonb('lessons_completed').default([]), // Array of lesson IDs
  quizScore: integer('quiz_score'),
  quizCompletedAt: timestamp('quiz_completed_at'),
  practiceCompleted: boolean('practice_completed').default(false),
  practiceCompletedAt: timestamp('practice_completed_at'),
  practiceTxHash: text('practice_tx_hash'),
  badgeMinted: boolean('badge_minted').default(false),
  badgeMintedAt: timestamp('badge_minted_at'),
  badgeTxHash: text('badge_tx_hash'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ============================================
// ITEMS & INVENTORY
// ============================================

export const items = pgTable('items', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type').notNull(), // 'consumable' | 'skin' | 'environment' | 'revival'
  rarity: text('rarity').default('common'), // 'common' | 'rare' | 'epic' | 'legendary'
  effect: jsonb('effect'), // { stat: 'hunger', value: 20 }
  imageUrl: text('image_url'),
  isNFT: boolean('is_nft').default(false),
  nftContractId: text('nft_contract_id'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const userItems = pgTable('user_items', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  itemId: text('item_id').references(() => items.id).notNull(),
  quantity: integer('quantity').default(1),
  nftTokenId: text('nft_token_id'), // If this is an NFT
  acquiredAt: timestamp('acquired_at').defaultNow(),
});

// ============================================
// BADGES (ON-CHAIN)
// ============================================

export const badges = pgTable('badges', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  imageUrl: text('image_url'),
  moduleId: text('module_id').references(() => modules.id),
  contractId: text('contract_id'), // Smart contract address
  createdAt: timestamp('created_at').defaultNow(),
});

export const userBadges = pgTable('user_badges', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  badgeId: text('badge_id').references(() => badges.id).notNull(),
  txHash: text('tx_hash'),
  network: text('network'), // 'stellar-testnet' | 'stellar-mainnet' | etc
  mintedAt: timestamp('minted_at').defaultNow(),
});

// ============================================
// GAME SESSIONS
// ============================================

export const gameSessions = pgTable('game_sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  gameId: text('game_id').notNull(), // 'crypto-quiz' | 'trading-sim' | 'crypto-2048'
  score: integer('score'),
  xpEarned: integer('xp_earned'),
  duration: integer('duration'), // seconds
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// ============================================
// DAILY REWARDS
// ============================================

export const dailyRewards = pgTable('daily_rewards', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  day: integer('day').notNull(), // Day in streak
  rewards: jsonb('rewards'), // { xp: 10, items: [...] }
  claimedAt: timestamp('claimed_at').defaultNow(),
});

// ============================================
// ANALYTICS EVENTS
// ============================================

export const analyticsEvents = pgTable('analytics_events', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  eventType: text('event_type').notNull(),
  eventData: jsonb('event_data'),
  createdAt: timestamp('created_at').defaultNow(),
});
