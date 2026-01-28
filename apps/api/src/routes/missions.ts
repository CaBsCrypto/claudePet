import { Hono } from 'hono';
import { z } from 'zod';

const missionsRoutes = new Hono();

/**
 * GET /api/missions/modules
 * Get all learning modules
 */
missionsRoutes.get('/modules', async (c) => {
  // TODO: Fetch modules from database
  const modules = [
    {
      id: 'wallet-basics',
      name: 'Your First Wallet',
      description: 'Learn what a crypto wallet is and how to keep it safe',
      icon: 'wallet',
      requiredLevel: 1,
      xpReward: 150,
      badgeId: 'badge-wallet-master',
      lessonsCount: 3,
      order: 1,
    },
    {
      id: 'first-transaction',
      name: 'Send & Receive',
      description: 'Make your first crypto transaction on testnet',
      icon: 'swap-horizontal',
      requiredLevel: 1,
      xpReward: 200,
      badgeId: 'badge-first-tx',
      lessonsCount: 2,
      order: 2,
    },
    {
      id: 'defi-intro',
      name: 'What is a Swap?',
      description: 'Learn about decentralized exchanges and make your first swap',
      icon: 'repeat',
      requiredLevel: 2,
      xpReward: 250,
      badgeId: 'badge-defi-beginner',
      lessonsCount: 3,
      order: 3,
    },
  ];

  return c.json({ modules });
});

/**
 * GET /api/missions/modules/:id
 * Get a specific module with all lessons
 */
missionsRoutes.get('/modules/:id', async (c) => {
  const moduleId = c.req.param('id');

  // TODO: Fetch module from database
  const module = {
    id: moduleId,
    name: 'Your First Wallet',
    description: 'Learn what a crypto wallet is and how to keep it safe',
    icon: 'wallet',
    requiredLevel: 1,
    xpReward: 150,
    badgeId: 'badge-wallet-master',
    lessons: [
      {
        id: 'wb-1',
        title: 'What is a Crypto Wallet?',
        description: 'Understanding the basics of digital wallets',
        type: 'text',
        duration: 5,
        order: 1,
      },
      {
        id: 'wb-2',
        title: 'Seed Phrases Explained',
        description: "Your wallet's master key",
        type: 'text',
        duration: 7,
        order: 2,
      },
      {
        id: 'wb-3',
        title: 'Security Best Practices',
        description: 'Keep your crypto safe',
        type: 'text',
        duration: 6,
        order: 3,
      },
    ],
    quiz: {
      id: 'wb-quiz',
      questionsCount: 3,
    },
    practiceTask: null,
  };

  return c.json({ module });
});

/**
 * GET /api/missions/progress
 * Get user's progress on all modules
 */
missionsRoutes.get('/progress', async (c) => {
  // TODO: Get user from auth middleware
  const userId = 'user_mock';

  // TODO: Fetch progress from database
  const progress = [
    {
      moduleId: 'wallet-basics',
      lessonsCompleted: ['wb-1', 'wb-2'],
      quizScore: null,
      practiceCompleted: false,
      badgeMinted: false,
    },
  ];

  return c.json({ progress });
});

/**
 * POST /api/missions/complete-lesson
 * Mark a lesson as completed
 */
missionsRoutes.post('/complete-lesson', async (c) => {
  try {
    const body = await c.req.json();
    const { moduleId, lessonId } = z
      .object({
        moduleId: z.string(),
        lessonId: z.string(),
      })
      .parse(body);

    // TODO: Get user from auth middleware
    const userId = 'user_mock';

    // TODO: Validate lesson exists and user hasn't completed it
    // TODO: Update progress in database
    // TODO: Check if all lessons completed to unlock quiz

    return c.json({
      success: true,
      xpGained: 20,
      lessonId,
      moduleProgress: {
        lessonsCompleted: ['wb-1', 'wb-2', lessonId],
        quizUnlocked: true,
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
 * POST /api/missions/submit-quiz
 * Submit quiz answers
 */
missionsRoutes.post('/submit-quiz', async (c) => {
  try {
    const body = await c.req.json();
    const { moduleId, answers } = z
      .object({
        moduleId: z.string(),
        answers: z.array(
          z.object({
            questionId: z.string(),
            answerIndex: z.number(),
          })
        ),
      })
      .parse(body);

    // TODO: Get user from auth middleware
    const userId = 'user_mock';

    // TODO: Fetch quiz questions and validate answers
    // TODO: Calculate score
    // TODO: Update progress in database

    const correctAnswers = 2;
    const totalQuestions = 3;
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = score >= 70;

    return c.json({
      success: true,
      score,
      passed,
      correctAnswers,
      totalQuestions,
      xpGained: passed ? 50 : 10,
      practiceUnlocked: passed,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Invalid request', details: error.errors }, 400);
    }
    throw error;
  }
});

/**
 * POST /api/missions/complete-practice
 * Validate and complete a practice task
 */
missionsRoutes.post('/complete-practice', async (c) => {
  try {
    const body = await c.req.json();
    const { moduleId, txHash, taskType } = z
      .object({
        moduleId: z.string(),
        txHash: z.string().optional(),
        taskType: z.enum(['transaction', 'swap', 'wallet-setup']),
      })
      .parse(body);

    // TODO: Get user from auth middleware
    const userId = 'user_mock';

    // TODO: Validate the transaction on-chain if txHash provided
    // TODO: Update progress in database
    // TODO: Check if module is now complete

    return c.json({
      success: true,
      xpGained: 100,
      moduleCompleted: true,
      badgeReady: true,
      badgeId: 'badge-wallet-master',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Invalid request', details: error.errors }, 400);
    }
    throw error;
  }
});

export { missionsRoutes };
