import { Hono } from 'hono';
import { z } from 'zod';

const rewardsRoutes = new Hono();

/**
 * GET /api/rewards/badges
 * Get user's badges
 */
rewardsRoutes.get('/badges', async (c) => {
  // TODO: Get user from auth middleware
  const userId = 'user_mock';

  // TODO: Fetch badges from on-chain + database
  const badges = [
    {
      id: 'badge-wallet-master',
      name: 'Wallet Master',
      description: 'Completed the wallet basics module',
      imageUrl: '/badges/wallet-master.png',
      earnedAt: Date.now() - 86400000 * 3, // 3 days ago
      onChain: true,
      txHash: '0x1234...5678',
    },
  ];

  return c.json({ badges });
});

/**
 * POST /api/rewards/mint-badge
 * Mint a badge on-chain
 */
rewardsRoutes.post('/mint-badge', async (c) => {
  try {
    const body = await c.req.json();
    const { badgeId, moduleId } = z
      .object({
        badgeId: z.string(),
        moduleId: z.string(),
      })
      .parse(body);

    // TODO: Get user from auth middleware
    const userId = 'user_mock';
    const userAddress = '0x1234...5678';

    // TODO: Validate user has completed the module
    // TODO: Check badge hasn't been minted already
    // TODO: Call smart contract to mint badge

    // Mock response
    return c.json({
      success: true,
      badge: {
        id: badgeId,
        name: 'Wallet Master',
        txHash: `0x${Date.now().toString(16)}`,
        network: 'stellar-testnet',
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Invalid request', details: error.errors }, 400);
    }
    throw error;
  }
});

/**
 * GET /api/rewards/inventory
 * Get user's items inventory
 */
rewardsRoutes.get('/inventory', async (c) => {
  // TODO: Get user from auth middleware
  const userId = 'user_mock';

  // TODO: Fetch inventory from database + on-chain NFTs
  const inventory = {
    consumables: [
      { id: 'basic-food', name: 'Basic Food', quantity: 10, effect: '+20 hunger' },
      { id: 'premium-food', name: 'Premium Food', quantity: 3, effect: '+50 hunger, +10 happiness' },
      { id: 'energy-drink', name: 'Energy Drink', quantity: 5, effect: '+30 energy' },
    ],
    skins: [
      { id: 'skin-classic', name: 'Classic', rarity: 'common', isEquipped: true, isNFT: false },
      { id: 'skin-space', name: 'Space Explorer', rarity: 'rare', isEquipped: false, isNFT: false },
    ],
    environments: [
      { id: 'env-home', name: 'Cozy Home', rarity: 'common', isEquipped: true, isNFT: false },
    ],
    revivalTokens: 0,
  };

  return c.json({ inventory });
});

/**
 * POST /api/rewards/claim-daily
 * Claim daily login reward
 */
rewardsRoutes.post('/claim-daily', async (c) => {
  // TODO: Get user from auth middleware
  const userId = 'user_mock';

  // TODO: Check if user has already claimed today
  // TODO: Calculate streak bonus
  // TODO: Add rewards to user's inventory/XP

  const streak = 5;
  const baseXp = 10;
  const streakBonus = Math.min(streak * 2, 20);

  return c.json({
    success: true,
    rewards: {
      xp: baseXp + streakBonus,
      items: [{ id: 'basic-food', quantity: 2 }],
    },
    streak: streak + 1,
    nextMilestone: {
      day: 7,
      reward: 'Premium Food x5',
    },
  });
});

/**
 * GET /api/rewards/leaderboard
 * Get leaderboard data
 */
rewardsRoutes.get('/leaderboard', async (c) => {
  const type = c.req.query('type') || 'xp'; // xp, badges, streak

  // TODO: Fetch leaderboard from database
  const leaderboard = [
    { rank: 1, userId: 'user_1', name: 'CryptoKing', value: 5500, address: '0x1234...1111' },
    { rank: 2, userId: 'user_2', name: 'DeFiQueen', value: 4800, address: '0x1234...2222' },
    { rank: 3, userId: 'user_3', name: 'HODLer', value: 4200, address: '0x1234...3333' },
  ];

  // TODO: Get current user's rank
  const currentUserRank = {
    rank: 42,
    value: 450,
  };

  return c.json({
    type,
    leaderboard,
    currentUser: currentUserRank,
  });
});

export { rewardsRoutes };
