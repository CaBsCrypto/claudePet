import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  category: 'basics' | 'wallets' | 'defi' | 'security' | 'trading' | 'blockchain';
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface GameSession {
  id: string;
  gameType: string;
  score: number;
  xpEarned: number;
  timestamp: number;
  details?: Record<string, any>;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  date: number;
}

interface GameState {
  // Daily play limits
  dailyPlays: Record<string, number>;
  lastPlayDate: string;

  // Game history
  sessions: GameSession[];

  // High scores
  highScores: Record<string, number>;

  // Leaderboard (simulated)
  leaderboard: LeaderboardEntry[];

  // Actions
  canPlay: (gameId: string, maxPlays: number) => boolean;
  recordPlay: (gameId: string) => void;
  addSession: (session: Omit<GameSession, 'id' | 'timestamp'>) => void;
  updateHighScore: (gameId: string, score: number) => boolean;
  getHighScore: (gameId: string) => number;
  getTodayPlays: (gameId: string) => number;
  resetDailyPlays: () => void;
}

// Check if it's a new day
const isNewDay = (lastDate: string): boolean => {
  const today = new Date().toDateString();
  return lastDate !== today;
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      dailyPlays: {},
      lastPlayDate: new Date().toDateString(),
      sessions: [],
      highScores: {},
      leaderboard: [
        { rank: 1, name: 'CryptoKing', score: 2850, date: Date.now() - 86400000 },
        { rank: 2, name: 'StellarPro', score: 2720, date: Date.now() - 172800000 },
        { rank: 3, name: 'DeFiMaster', score: 2650, date: Date.now() - 259200000 },
        { rank: 4, name: 'BlockWizard', score: 2480, date: Date.now() - 345600000 },
        { rank: 5, name: 'TokenHunter', score: 2350, date: Date.now() - 432000000 },
        { rank: 6, name: 'ChainGuru', score: 2200, date: Date.now() - 518400000 },
        { rank: 7, name: 'WalletNinja', score: 2100, date: Date.now() - 604800000 },
        { rank: 8, name: 'CoinSage', score: 1950, date: Date.now() - 691200000 },
        { rank: 9, name: 'HashMaster', score: 1800, date: Date.now() - 777600000 },
        { rank: 10, name: 'LedgerLord', score: 1650, date: Date.now() - 864000000 },
      ],

      canPlay: (gameId: string, maxPlays: number) => {
        const state = get();

        // Reset if new day
        if (isNewDay(state.lastPlayDate)) {
          get().resetDailyPlays();
          return true;
        }

        const plays = state.dailyPlays[gameId] || 0;
        return plays < maxPlays;
      },

      recordPlay: (gameId: string) => {
        set((state) => {
          // Reset if new day
          if (isNewDay(state.lastPlayDate)) {
            return {
              dailyPlays: { [gameId]: 1 },
              lastPlayDate: new Date().toDateString(),
            };
          }

          return {
            dailyPlays: {
              ...state.dailyPlays,
              [gameId]: (state.dailyPlays[gameId] || 0) + 1,
            },
          };
        });
      },

      addSession: (session) => {
        const newSession: GameSession = {
          ...session,
          id: `session-${Date.now()}`,
          timestamp: Date.now(),
        };

        set((state) => ({
          sessions: [newSession, ...state.sessions].slice(0, 50), // Keep last 50
        }));
      },

      updateHighScore: (gameId: string, score: number) => {
        const currentHigh = get().highScores[gameId] || 0;

        if (score > currentHigh) {
          set((state) => ({
            highScores: {
              ...state.highScores,
              [gameId]: score,
            },
          }));
          return true;
        }
        return false;
      },

      getHighScore: (gameId: string) => {
        return get().highScores[gameId] || 0;
      },

      getTodayPlays: (gameId: string) => {
        const state = get();
        if (isNewDay(state.lastPlayDate)) {
          return 0;
        }
        return state.dailyPlays[gameId] || 0;
      },

      resetDailyPlays: () => {
        set({
          dailyPlays: {},
          lastPlayDate: new Date().toDateString(),
        });
      },
    }),
    {
      name: 'cryptopet-game-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Extensive question bank for Crypto Quiz
export const QUIZ_QUESTIONS: QuizQuestion[] = [
  // BASICS - Easy
  {
    id: 'b1',
    question: 'What does "HODL" mean in crypto?',
    options: ['Hold On for Dear Life', 'High Order Digital Ledger', 'Hash Output Data Link', 'Honest Open Decentralized Ledger'],
    correctIndex: 0,
    category: 'basics',
    difficulty: 'easy',
  },
  {
    id: 'b2',
    question: 'What is the maximum supply of Bitcoin?',
    options: ['21 million', '100 million', 'Unlimited', '18 million'],
    correctIndex: 0,
    category: 'basics',
    difficulty: 'easy',
  },
  {
    id: 'b3',
    question: 'Who created Bitcoin?',
    options: ['Satoshi Nakamoto', 'Vitalik Buterin', 'Charlie Lee', 'Elon Musk'],
    correctIndex: 0,
    category: 'basics',
    difficulty: 'easy',
  },
  {
    id: 'b4',
    question: 'What year was Bitcoin launched?',
    options: ['2009', '2008', '2010', '2011'],
    correctIndex: 0,
    category: 'basics',
    difficulty: 'easy',
  },
  {
    id: 'b5',
    question: 'What does "ATH" stand for?',
    options: ['All Time High', 'Average Trading Hour', 'Automated Token Handler', 'Asset Transfer Hash'],
    correctIndex: 0,
    category: 'basics',
    difficulty: 'easy',
  },
  {
    id: 'b6',
    question: 'What is a "whale" in crypto?',
    options: ['Someone with large holdings', 'A type of token', 'A trading algorithm', 'A blockchain network'],
    correctIndex: 0,
    category: 'basics',
    difficulty: 'easy',
  },
  {
    id: 'b7',
    question: 'What does FOMO stand for?',
    options: ['Fear Of Missing Out', 'First On Market Offer', 'Forward Operating Market Order', 'Full On Money Opportunity'],
    correctIndex: 0,
    category: 'basics',
    difficulty: 'easy',
  },
  {
    id: 'b8',
    question: 'What is a "bear market"?',
    options: ['Declining prices', 'Rising prices', 'Stable prices', 'Volatile prices'],
    correctIndex: 0,
    category: 'basics',
    difficulty: 'easy',
  },

  // WALLETS - Easy/Medium
  {
    id: 'w1',
    question: 'What is a seed phrase?',
    options: ['Backup words for wallet recovery', 'Password for exchanges', 'A type of token', 'Mining software'],
    correctIndex: 0,
    category: 'wallets',
    difficulty: 'easy',
  },
  {
    id: 'w2',
    question: 'What is a "hot wallet"?',
    options: ['Connected to internet', 'Stored offline', 'A hardware device', 'A paper wallet'],
    correctIndex: 0,
    category: 'wallets',
    difficulty: 'easy',
  },
  {
    id: 'w3',
    question: 'What is a private key used for?',
    options: ['Signing transactions', 'Receiving crypto', 'Mining blocks', 'Creating tokens'],
    correctIndex: 0,
    category: 'wallets',
    difficulty: 'easy',
  },
  {
    id: 'w4',
    question: 'How many words are typically in a seed phrase?',
    options: ['12 or 24', '6 or 8', '32 or 64', '100'],
    correctIndex: 0,
    category: 'wallets',
    difficulty: 'medium',
  },
  {
    id: 'w5',
    question: 'What is a "cold wallet"?',
    options: ['Offline storage', 'Online wallet', 'Mobile app', 'Browser extension'],
    correctIndex: 0,
    category: 'wallets',
    difficulty: 'easy',
  },
  {
    id: 'w6',
    question: 'Which is the safest way to store large amounts?',
    options: ['Hardware wallet', 'Exchange', 'Mobile wallet', 'Browser extension'],
    correctIndex: 0,
    category: 'wallets',
    difficulty: 'medium',
  },
  {
    id: 'w7',
    question: 'What is Freighter wallet used for?',
    options: ['Stellar blockchain', 'Bitcoin', 'Ethereum', 'Solana'],
    correctIndex: 0,
    category: 'wallets',
    difficulty: 'medium',
  },
  {
    id: 'w8',
    question: 'Should you share your private key?',
    options: ['Never', 'Only with support', 'With trusted friends', 'On social media'],
    correctIndex: 0,
    category: 'wallets',
    difficulty: 'easy',
  },

  // DEFI - Medium/Hard
  {
    id: 'd1',
    question: 'What does DEX stand for?',
    options: ['Decentralized Exchange', 'Digital Exchange', 'Direct Exchange', 'Distributed Exchange'],
    correctIndex: 0,
    category: 'defi',
    difficulty: 'easy',
  },
  {
    id: 'd2',
    question: 'What is a liquidity pool?',
    options: ['Tokens locked for trading', 'A type of wallet', 'Mining equipment', 'A blockchain network'],
    correctIndex: 0,
    category: 'defi',
    difficulty: 'medium',
  },
  {
    id: 'd3',
    question: 'What is "yield farming"?',
    options: ['Earning rewards by providing liquidity', 'Mining cryptocurrency', 'Day trading', 'Staking tokens'],
    correctIndex: 0,
    category: 'defi',
    difficulty: 'medium',
  },
  {
    id: 'd4',
    question: 'What is an AMM?',
    options: ['Automated Market Maker', 'Advanced Mining Machine', 'Asset Management Module', 'Automatic Money Mover'],
    correctIndex: 0,
    category: 'defi',
    difficulty: 'medium',
  },
  {
    id: 'd5',
    question: 'What is "slippage" in trading?',
    options: ['Price difference during trade', 'Trading fee', 'Network delay', 'Wallet error'],
    correctIndex: 0,
    category: 'defi',
    difficulty: 'medium',
  },
  {
    id: 'd6',
    question: 'What is TVL in DeFi?',
    options: ['Total Value Locked', 'Token Verification Layer', 'Trading Volume Limit', 'Transfer Validation Log'],
    correctIndex: 0,
    category: 'defi',
    difficulty: 'hard',
  },
  {
    id: 'd7',
    question: 'What is impermanent loss?',
    options: ['Loss from price changes in LP', 'Transaction fees', 'Network congestion cost', 'Wallet hack loss'],
    correctIndex: 0,
    category: 'defi',
    difficulty: 'hard',
  },
  {
    id: 'd8',
    question: 'What is Soroswap?',
    options: ['DEX on Stellar', 'Bitcoin wallet', 'Ethereum bridge', 'NFT marketplace'],
    correctIndex: 0,
    category: 'defi',
    difficulty: 'medium',
  },

  // SECURITY - All levels
  {
    id: 's1',
    question: 'What is 2FA?',
    options: ['Two-Factor Authentication', 'Two-File Archive', 'Transfer Fee Amount', 'Token Format Address'],
    correctIndex: 0,
    category: 'security',
    difficulty: 'easy',
  },
  {
    id: 's2',
    question: 'What is a phishing attack?',
    options: ['Fake site stealing info', 'Mining attack', 'Network spam', 'Token duplication'],
    correctIndex: 0,
    category: 'security',
    difficulty: 'easy',
  },
  {
    id: 's3',
    question: 'What should you do before connecting wallet to a site?',
    options: ['Verify the URL', 'Share seed phrase', 'Disable 2FA', 'Clear cache'],
    correctIndex: 0,
    category: 'security',
    difficulty: 'easy',
  },
  {
    id: 's4',
    question: 'What is a rug pull?',
    options: ['Developers abandoning project', 'Price increase', 'Network upgrade', 'Token airdrop'],
    correctIndex: 0,
    category: 'security',
    difficulty: 'medium',
  },
  {
    id: 's5',
    question: 'Where should you store your seed phrase?',
    options: ['Written on paper offline', 'In email draft', 'Screenshot on phone', 'Cloud storage'],
    correctIndex: 0,
    category: 'security',
    difficulty: 'easy',
  },
  {
    id: 's6',
    question: 'What is a honeypot scam?',
    options: ['Token you can buy but not sell', 'Free crypto giveaway', 'Mining pool', 'Staking reward'],
    correctIndex: 0,
    category: 'security',
    difficulty: 'hard',
  },
  {
    id: 's7',
    question: 'How can you verify a token contract?',
    options: ['Check on block explorer', 'Ask on social media', 'Trust the website', 'Google the name'],
    correctIndex: 0,
    category: 'security',
    difficulty: 'medium',
  },
  {
    id: 's8',
    question: 'What is social engineering in crypto?',
    options: ['Manipulating people for info', 'Building DApps', 'Creating tokens', 'Network development'],
    correctIndex: 0,
    category: 'security',
    difficulty: 'medium',
  },

  // TRADING - Medium/Hard
  {
    id: 't1',
    question: 'What is a limit order?',
    options: ['Buy/sell at specific price', 'Buy at market price', 'Automatic trading', 'Margin trade'],
    correctIndex: 0,
    category: 'trading',
    difficulty: 'medium',
  },
  {
    id: 't2',
    question: 'What is DCA?',
    options: ['Dollar Cost Averaging', 'Digital Currency Asset', 'Decentralized Crypto App', 'Direct Chain Access'],
    correctIndex: 0,
    category: 'trading',
    difficulty: 'medium',
  },
  {
    id: 't3',
    question: 'What is a market order?',
    options: ['Buy/sell at current price', 'Scheduled purchase', 'Limit trade', 'Stop loss'],
    correctIndex: 0,
    category: 'trading',
    difficulty: 'easy',
  },
  {
    id: 't4',
    question: 'What does "long" mean in trading?',
    options: ['Betting price will rise', 'Betting price will fall', 'Holding forever', 'Quick trade'],
    correctIndex: 0,
    category: 'trading',
    difficulty: 'medium',
  },
  {
    id: 't5',
    question: 'What is a stop-loss order?',
    options: ['Auto-sell to limit losses', 'Buy order', 'Profit target', 'Mining command'],
    correctIndex: 0,
    category: 'trading',
    difficulty: 'medium',
  },
  {
    id: 't6',
    question: 'What is leverage trading?',
    options: ['Trading with borrowed funds', 'Long-term investing', 'Staking tokens', 'Providing liquidity'],
    correctIndex: 0,
    category: 'trading',
    difficulty: 'hard',
  },
  {
    id: 't7',
    question: 'What is arbitrage?',
    options: ['Profiting from price differences', 'Day trading', 'Swing trading', 'Position trading'],
    correctIndex: 0,
    category: 'trading',
    difficulty: 'hard',
  },
  {
    id: 't8',
    question: 'What is a trading pair?',
    options: ['Two assets traded together', 'Two traders', 'Double transaction', 'Backup wallet'],
    correctIndex: 0,
    category: 'trading',
    difficulty: 'easy',
  },

  // BLOCKCHAIN - All levels
  {
    id: 'bc1',
    question: 'What is a blockchain?',
    options: ['Distributed ledger', 'Cryptocurrency', 'Wallet type', 'Trading platform'],
    correctIndex: 0,
    category: 'blockchain',
    difficulty: 'easy',
  },
  {
    id: 'bc2',
    question: 'What is a block in blockchain?',
    options: ['Group of transactions', 'Single transaction', 'Wallet address', 'Private key'],
    correctIndex: 0,
    category: 'blockchain',
    difficulty: 'easy',
  },
  {
    id: 'bc3',
    question: 'What is gas in Ethereum?',
    options: ['Transaction fee unit', 'Token type', 'Wallet feature', 'Mining reward'],
    correctIndex: 0,
    category: 'blockchain',
    difficulty: 'medium',
  },
  {
    id: 'bc4',
    question: 'What is a smart contract?',
    options: ['Self-executing code on chain', 'Legal agreement', 'Wallet backup', 'Trading strategy'],
    correctIndex: 0,
    category: 'blockchain',
    difficulty: 'medium',
  },
  {
    id: 'bc5',
    question: 'What is Stellar known for?',
    options: ['Fast, low-cost transfers', 'NFT marketplace', 'Gaming', 'Social media'],
    correctIndex: 0,
    category: 'blockchain',
    difficulty: 'medium',
  },
  {
    id: 'bc6',
    question: 'What is a hash function?',
    options: ['One-way encryption', 'Decryption tool', 'Wallet type', 'Token standard'],
    correctIndex: 0,
    category: 'blockchain',
    difficulty: 'hard',
  },
  {
    id: 'bc7',
    question: 'What is consensus mechanism?',
    options: ['How network agrees on state', 'Trading algorithm', 'Wallet security', 'Token distribution'],
    correctIndex: 0,
    category: 'blockchain',
    difficulty: 'hard',
  },
  {
    id: 'bc8',
    question: 'What is XLM?',
    options: ['Stellar native token', 'Exchange name', 'Wallet brand', 'Trading tool'],
    correctIndex: 0,
    category: 'blockchain',
    difficulty: 'easy',
  },
  {
    id: 'bc9',
    question: 'What is a validator?',
    options: ['Node that verifies transactions', 'Wallet type', 'Token holder', 'Exchange'],
    correctIndex: 0,
    category: 'blockchain',
    difficulty: 'medium',
  },
  {
    id: 'bc10',
    question: 'What makes Stellar eco-friendly?',
    options: ['No mining required', 'Uses solar power', 'Plants trees', 'Carbon credits'],
    correctIndex: 0,
    category: 'blockchain',
    difficulty: 'medium',
  },
];

// Helper to get random questions
export function getRandomQuestions(count: number, difficulty?: 'easy' | 'medium' | 'hard'): QuizQuestion[] {
  let questions = [...QUIZ_QUESTIONS];

  if (difficulty) {
    questions = questions.filter(q => q.difficulty === difficulty);
  }

  // Shuffle
  for (let i = questions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [questions[i], questions[j]] = [questions[j], questions[i]];
  }

  return questions.slice(0, count);
}
