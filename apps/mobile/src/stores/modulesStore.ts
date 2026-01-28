import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  type: 'text' | 'video' | 'interactive';
  content: string;
  duration: number; // minutes
  order: number;
}

export interface Quiz {
  id: string;
  moduleId: string;
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface PracticeTask {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  type: 'transaction' | 'swap' | 'wallet-setup';
  instructions: string[];
  validationCriteria: string;
}

export interface Module {
  id: string;
  name: string;
  description: string;
  icon: string;
  requiredLevel: number;
  xpReward: number;
  badgeId: string;
  lessons: Lesson[];
  quiz: Quiz;
  practiceTask: PracticeTask | null;
  order: number;
}

export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  completedAt: number | null;
}

export interface ModuleProgress {
  moduleId: string;
  lessonsCompleted: string[];
  quizScore: number | null;
  quizCompletedAt: number | null;
  practiceCompleted: boolean;
  practiceCompletedAt: number | null;
  badgeMinted: boolean;
  badgeMintedAt: number | null;
}

interface ModulesState {
  modules: Module[];
  progress: ModuleProgress[];
  isLoading: boolean;

  // Getters
  getModule: (moduleId: string) => Module | undefined;
  getModuleProgress: (moduleId: string) => number;
  isModuleCompleted: (moduleId: string) => boolean;
  isLessonCompleted: (moduleId: string, lessonId: string) => boolean;

  // Actions
  completeLesson: (moduleId: string, lessonId: string) => void;
  completeQuiz: (moduleId: string, score: number) => void;
  completePractice: (moduleId: string) => void;
  mintBadge: (moduleId: string) => void;
  initializeModules: () => void;
}

// Initial modules data
const INITIAL_MODULES: Module[] = [
  {
    id: 'wallet-basics',
    name: 'Your First Wallet',
    description: 'Learn what a crypto wallet is and how to keep it safe',
    icon: 'wallet',
    requiredLevel: 1,
    xpReward: 150,
    badgeId: 'badge-wallet-master',
    order: 1,
    lessons: [
      {
        id: 'wb-1',
        moduleId: 'wallet-basics',
        title: 'What is a Crypto Wallet?',
        description: 'Understanding the basics of digital wallets',
        type: 'text',
        content: 'A crypto wallet is like a digital safe for your cryptocurrencies...',
        duration: 5,
        order: 1,
      },
      {
        id: 'wb-2',
        moduleId: 'wallet-basics',
        title: 'Seed Phrases Explained',
        description: 'Your wallet\'s master key',
        type: 'text',
        content: 'A seed phrase is a series of 12-24 words that serves as your wallet\'s backup...',
        duration: 7,
        order: 2,
      },
      {
        id: 'wb-3',
        moduleId: 'wallet-basics',
        title: 'Security Best Practices',
        description: 'Keep your crypto safe',
        type: 'text',
        content: 'Never share your seed phrase with anyone, not even support staff...',
        duration: 6,
        order: 3,
      },
    ],
    quiz: {
      id: 'wb-quiz',
      moduleId: 'wallet-basics',
      questions: [
        {
          id: 'wb-q1',
          question: 'What is a seed phrase used for?',
          options: [
            'To recover your wallet',
            'To send transactions faster',
            'To earn more crypto',
            'To change your wallet address',
          ],
          correctIndex: 0,
          explanation: 'A seed phrase is your wallet\'s backup that allows you to recover access if you lose your device.',
        },
        {
          id: 'wb-q2',
          question: 'Who should you share your seed phrase with?',
          options: [
            'Customer support',
            'Close friends',
            'No one, ever',
            'Your bank',
          ],
          correctIndex: 2,
          explanation: 'You should NEVER share your seed phrase with anyone. No legitimate service will ever ask for it.',
        },
        {
          id: 'wb-q3',
          question: 'Where is the safest place to store your seed phrase?',
          options: [
            'In a screenshot on your phone',
            'In a notes app',
            'Written on paper, stored offline',
            'In an email to yourself',
          ],
          correctIndex: 2,
          explanation: 'The safest storage is offline, on paper or metal, in a secure location.',
        },
      ],
    },
    practiceTask: null,
  },
  {
    id: 'first-transaction',
    name: 'Send & Receive',
    description: 'Make your first crypto transaction on testnet',
    icon: 'swap-horizontal',
    requiredLevel: 1,
    xpReward: 200,
    badgeId: 'badge-first-tx',
    order: 2,
    lessons: [
      {
        id: 'ft-1',
        moduleId: 'first-transaction',
        title: 'How Transactions Work',
        description: 'Understanding blockchain transfers',
        type: 'text',
        content: 'When you send crypto, you\'re creating a message that gets recorded on the blockchain...',
        duration: 8,
        order: 1,
      },
      {
        id: 'ft-2',
        moduleId: 'first-transaction',
        title: 'Addresses & Fees',
        description: 'The basics of sending and receiving',
        type: 'text',
        content: 'Every wallet has a unique address, like an email address for money...',
        duration: 6,
        order: 2,
      },
    ],
    quiz: {
      id: 'ft-quiz',
      moduleId: 'first-transaction',
      questions: [
        {
          id: 'ft-q1',
          question: 'What do you need to send crypto to someone?',
          options: [
            'Their phone number',
            'Their wallet address',
            'Their email',
            'Their name',
          ],
          correctIndex: 1,
          explanation: 'You need the recipient\'s wallet address to send them crypto.',
        },
        {
          id: 'ft-q2',
          question: 'What are transaction fees used for?',
          options: [
            'To pay the company that made the blockchain',
            'To pay validators who process transactions',
            'To pay the government',
            'Fees don\'t exist in crypto',
          ],
          correctIndex: 1,
          explanation: 'Transaction fees compensate the validators or miners who process and secure transactions.',
        },
      ],
    },
    practiceTask: {
      id: 'ft-practice',
      moduleId: 'first-transaction',
      title: 'Send Your First Transaction',
      description: 'Practice sending testnet tokens',
      type: 'transaction',
      instructions: [
        'Connect your testnet wallet',
        'Request testnet tokens from the faucet',
        'Send 1 test token to the practice address',
        'Wait for confirmation',
      ],
      validationCriteria: 'tx_confirmed',
    },
  },
  {
    id: 'defi-intro',
    name: 'What is a Swap?',
    description: 'Learn about decentralized exchanges and make your first swap',
    icon: 'repeat',
    requiredLevel: 2,
    xpReward: 250,
    badgeId: 'badge-defi-beginner',
    order: 3,
    lessons: [
      {
        id: 'di-1',
        moduleId: 'defi-intro',
        title: 'DEX vs CEX',
        description: 'Decentralized vs Centralized exchanges',
        type: 'text',
        content: 'A DEX is a decentralized exchange where you trade directly from your wallet...',
        duration: 10,
        order: 1,
      },
      {
        id: 'di-2',
        moduleId: 'defi-intro',
        title: 'How Swaps Work',
        description: 'Understanding liquidity pools',
        type: 'text',
        content: 'When you swap tokens on a DEX, you\'re trading with a liquidity pool...',
        duration: 12,
        order: 2,
      },
      {
        id: 'di-3',
        moduleId: 'defi-intro',
        title: 'Slippage & Price Impact',
        description: 'Important concepts for trading',
        type: 'text',
        content: 'Slippage is the difference between expected and actual price...',
        duration: 8,
        order: 3,
      },
    ],
    quiz: {
      id: 'di-quiz',
      moduleId: 'defi-intro',
      questions: [
        {
          id: 'di-q1',
          question: 'What is a DEX?',
          options: [
            'A type of cryptocurrency',
            'A decentralized exchange',
            'A digital wallet',
            'A blockchain network',
          ],
          correctIndex: 1,
          explanation: 'A DEX is a Decentralized Exchange where you can trade crypto without an intermediary.',
        },
        {
          id: 'di-q2',
          question: 'What is slippage?',
          options: [
            'A transaction error',
            'The difference between expected and actual price',
            'A type of fee',
            'A security feature',
          ],
          correctIndex: 1,
          explanation: 'Slippage occurs when the price changes between when you submit a trade and when it executes.',
        },
      ],
    },
    practiceTask: {
      id: 'di-practice',
      moduleId: 'defi-intro',
      title: 'Make Your First Swap',
      description: 'Swap testnet tokens on Soroswap',
      type: 'swap',
      instructions: [
        'Connect to Soroswap testnet',
        'Select tokens to swap',
        'Review the quote and fees',
        'Execute the swap',
        'View transaction on explorer',
      ],
      validationCriteria: 'swap_confirmed',
    },
  },
];

export const useModulesStore = create<ModulesState>()(
  persist(
    (set, get) => ({
      modules: INITIAL_MODULES,
      progress: [],
      isLoading: false,

      getModule: (moduleId: string) => {
        return get().modules.find((m) => m.id === moduleId);
      },

      getModuleProgress: (moduleId: string) => {
        const module = get().modules.find((m) => m.id === moduleId);
        const moduleProgress = get().progress.find((p) => p.moduleId === moduleId);

        if (!module || !moduleProgress) return 0;

        const totalSteps = module.lessons.length + 1 + (module.practiceTask ? 1 : 0); // lessons + quiz + practice
        let completedSteps = moduleProgress.lessonsCompleted.length;
        if (moduleProgress.quizScore !== null && moduleProgress.quizScore >= 70) completedSteps++;
        if (moduleProgress.practiceCompleted) completedSteps++;

        return Math.round((completedSteps / totalSteps) * 100);
      },

      isModuleCompleted: (moduleId: string) => {
        const progress = get().getModuleProgress(moduleId);
        return progress === 100;
      },

      isLessonCompleted: (moduleId: string, lessonId: string) => {
        const moduleProgress = get().progress.find((p) => p.moduleId === moduleId);
        return moduleProgress?.lessonsCompleted.includes(lessonId) ?? false;
      },

      completeLesson: (moduleId: string, lessonId: string) => {
        set((state) => {
          const existingProgress = state.progress.find((p) => p.moduleId === moduleId);

          if (existingProgress) {
            if (existingProgress.lessonsCompleted.includes(lessonId)) {
              return state; // Already completed
            }

            return {
              progress: state.progress.map((p) =>
                p.moduleId === moduleId
                  ? {
                      ...p,
                      lessonsCompleted: [...p.lessonsCompleted, lessonId],
                    }
                  : p
              ),
            };
          }

          // Create new progress entry
          const newProgress: ModuleProgress = {
            moduleId,
            lessonsCompleted: [lessonId],
            quizScore: null,
            quizCompletedAt: null,
            practiceCompleted: false,
            practiceCompletedAt: null,
            badgeMinted: false,
            badgeMintedAt: null,
          };

          return {
            progress: [...state.progress, newProgress],
          };
        });
      },

      completeQuiz: (moduleId: string, score: number) => {
        set((state) => {
          const existingProgress = state.progress.find((p) => p.moduleId === moduleId);

          if (existingProgress) {
            return {
              progress: state.progress.map((p) =>
                p.moduleId === moduleId
                  ? {
                      ...p,
                      quizScore: score,
                      quizCompletedAt: Date.now(),
                    }
                  : p
              ),
            };
          }

          const newProgress: ModuleProgress = {
            moduleId,
            lessonsCompleted: [],
            quizScore: score,
            quizCompletedAt: Date.now(),
            practiceCompleted: false,
            practiceCompletedAt: null,
            badgeMinted: false,
            badgeMintedAt: null,
          };

          return {
            progress: [...state.progress, newProgress],
          };
        });
      },

      completePractice: (moduleId: string) => {
        set((state) => ({
          progress: state.progress.map((p) =>
            p.moduleId === moduleId
              ? {
                  ...p,
                  practiceCompleted: true,
                  practiceCompletedAt: Date.now(),
                }
              : p
          ),
        }));
      },

      mintBadge: (moduleId: string) => {
        set((state) => ({
          progress: state.progress.map((p) =>
            p.moduleId === moduleId
              ? {
                  ...p,
                  badgeMinted: true,
                  badgeMintedAt: Date.now(),
                }
              : p
          ),
        }));
      },

      initializeModules: () => {
        // Load modules from API or use defaults
        set({ modules: INITIAL_MODULES });
      },
    }),
    {
      name: 'cryptopet-modules-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
