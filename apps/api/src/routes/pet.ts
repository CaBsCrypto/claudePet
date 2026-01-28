import { Hono } from 'hono';
import { z } from 'zod';

const petRoutes = new Hono();

// Schemas
const createPetSchema = z.object({
  name: z.string().min(1).max(20),
  type: z.enum(['dog', 'cat', 'dragon', 'robot']),
});

const actionSchema = z.object({
  petId: z.string(),
});

/**
 * GET /api/pet
 * Get user's pet data
 */
petRoutes.get('/', async (c) => {
  // TODO: Get user from auth middleware
  const userId = 'user_mock';

  // TODO: Fetch pet from database
  const pet = {
    id: 'pet_123',
    userId,
    name: 'Buddy',
    type: 'dog',
    level: 3,
    xp: 450,
    hunger: 75,
    energy: 60,
    happiness: 80,
    health: 100,
    equippedSkin: null,
    equippedEnvironment: null,
    isDead: false,
    freeRevivalUsed: false,
    lastUpdated: Date.now(),
    createdAt: Date.now() - 86400000 * 7, // 7 days ago
  };

  return c.json({ pet });
});

/**
 * POST /api/pet
 * Create a new pet
 */
petRoutes.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const { name, type } = createPetSchema.parse(body);

    // TODO: Get user from auth middleware
    const userId = 'user_mock';

    // Create pet in database
    const pet = {
      id: `pet_${Date.now()}`,
      userId,
      name,
      type,
      level: 1,
      xp: 0,
      hunger: 100,
      energy: 100,
      happiness: 100,
      health: 100,
      equippedSkin: null,
      equippedEnvironment: null,
      isDead: false,
      freeRevivalUsed: false,
      lastUpdated: Date.now(),
      createdAt: Date.now(),
    };

    return c.json({ success: true, pet }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Invalid request', details: error.errors }, 400);
    }
    throw error;
  }
});

/**
 * POST /api/pet/feed
 * Feed the pet
 */
petRoutes.post('/feed', async (c) => {
  try {
    const body = await c.req.json();
    const { petId } = actionSchema.parse(body);

    // TODO: Validate user owns this pet
    // TODO: Check if user has food items
    // TODO: Update pet stats in database

    const updatedPet = {
      id: petId,
      hunger: Math.min(100, 75 + 25), // +25 hunger
      happiness: Math.min(100, 80 + 5), // +5 happiness
      lastUpdated: Date.now(),
    };

    return c.json({
      success: true,
      pet: updatedPet,
      itemUsed: 'basic_food',
      itemsRemaining: 5,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Invalid request', details: error.errors }, 400);
    }
    throw error;
  }
});

/**
 * POST /api/pet/play
 * Play with the pet
 */
petRoutes.post('/play', async (c) => {
  try {
    const body = await c.req.json();
    const { petId } = actionSchema.parse(body);

    // TODO: Check if pet has enough energy
    // TODO: Update pet stats in database

    const updatedPet = {
      id: petId,
      energy: Math.max(0, 60 - 15), // -15 energy
      happiness: Math.min(100, 80 + 20), // +20 happiness
      hunger: Math.max(0, 75 - 10), // -10 hunger
      lastUpdated: Date.now(),
    };

    return c.json({
      success: true,
      pet: updatedPet,
      xpGained: 5,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Invalid request', details: error.errors }, 400);
    }
    throw error;
  }
});

/**
 * POST /api/pet/rest
 * Rest the pet
 */
petRoutes.post('/rest', async (c) => {
  try {
    const body = await c.req.json();
    const { petId } = actionSchema.parse(body);

    // TODO: Update pet stats in database

    const updatedPet = {
      id: petId,
      energy: Math.min(100, 60 + 30), // +30 energy
      lastUpdated: Date.now(),
    };

    return c.json({
      success: true,
      pet: updatedPet,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Invalid request', details: error.errors }, 400);
    }
    throw error;
  }
});

/**
 * POST /api/pet/revive
 * Revive a dead pet
 */
petRoutes.post('/revive', async (c) => {
  try {
    const body = await c.req.json();
    const { petId } = actionSchema.parse(body);
    const useFreeRevival = body.useFreeRevival ?? true;

    // TODO: Validate pet is dead
    // TODO: Check if free revival is available
    // TODO: If not free, check for revival token

    const updatedPet = {
      id: petId,
      isDead: false,
      hunger: useFreeRevival ? 50 : 100,
      energy: useFreeRevival ? 50 : 100,
      happiness: useFreeRevival ? 50 : 100,
      health: useFreeRevival ? 50 : 100,
      level: useFreeRevival ? 2 : 3, // Lose 1 level if free revival
      freeRevivalUsed: useFreeRevival ? true : false,
      lastUpdated: Date.now(),
    };

    return c.json({
      success: true,
      pet: updatedPet,
      revivalType: useFreeRevival ? 'free' : 'token',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Invalid request', details: error.errors }, 400);
    }
    throw error;
  }
});

/**
 * POST /api/pet/equip
 * Equip a skin or environment
 */
petRoutes.post('/equip', async (c) => {
  try {
    const body = await c.req.json();
    const { petId, itemId, itemType } = z
      .object({
        petId: z.string(),
        itemId: z.string(),
        itemType: z.enum(['skin', 'environment']),
      })
      .parse(body);

    // TODO: Validate user owns the item
    // TODO: Update pet in database

    return c.json({
      success: true,
      equipped: {
        itemId,
        itemType,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Invalid request', details: error.errors }, 400);
    }
    throw error;
  }
});

export { petRoutes };
