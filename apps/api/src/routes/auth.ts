import { Hono } from 'hono';
import { z } from 'zod';

const authRoutes = new Hono();

// Schema for wallet authentication
const walletAuthSchema = z.object({
  address: z.string().min(1),
  signature: z.string().min(1),
  message: z.string().min(1),
  walletType: z.enum(['privy', 'freighter']),
});

// Schema for Privy webhook
const privyWebhookSchema = z.object({
  userId: z.string(),
  walletAddress: z.string().optional(),
  email: z.string().email().optional(),
});

/**
 * POST /api/auth/wallet
 * Authenticate user with wallet signature
 */
authRoutes.post('/wallet', async (c) => {
  try {
    const body = await c.req.json();
    const { address, signature, message, walletType } = walletAuthSchema.parse(body);

    // TODO: Verify signature based on wallet type
    // For Stellar: verify using stellar-sdk
    // For EVM: verify using ethers/viem

    // Create or get user from database
    const user = {
      id: `user_${Date.now()}`,
      address,
      walletType,
      createdAt: new Date().toISOString(),
    };

    // Generate session token
    const token = `session_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    return c.json({
      success: true,
      user,
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Invalid request', details: error.errors }, 400);
    }
    throw error;
  }
});

/**
 * POST /api/auth/privy
 * Handle Privy authentication callback
 */
authRoutes.post('/privy', async (c) => {
  try {
    const body = await c.req.json();
    const { userId, walletAddress, email } = privyWebhookSchema.parse(body);

    // Create or update user in database
    const user = {
      id: userId,
      address: walletAddress,
      email,
      walletType: 'privy' as const,
      createdAt: new Date().toISOString(),
    };

    return c.json({
      success: true,
      user,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Invalid request', details: error.errors }, 400);
    }
    throw error;
  }
});

/**
 * GET /api/auth/me
 * Get current user info
 */
authRoutes.get('/me', async (c) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const token = authHeader.slice(7);

  // TODO: Verify token and get user from database
  // For now, return mock user
  return c.json({
    user: {
      id: 'user_mock',
      address: '0x1234...5678',
      walletType: 'privy',
      createdAt: new Date().toISOString(),
    },
  });
});

/**
 * POST /api/auth/logout
 * Invalidate session
 */
authRoutes.post('/logout', async (c) => {
  // TODO: Invalidate session token in database/cache
  return c.json({ success: true });
});

export { authRoutes };
