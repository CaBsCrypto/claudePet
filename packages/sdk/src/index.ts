// CryptoPet SDK
// Multi-chain SDK for interacting with CryptoPet contracts

export * from './chains/types';
export * from './chains/stellar';
export * from './contracts/badges';
export * from './contracts/pets';
export * from './contracts/items';

// Chain registry
import { StellarAdapter } from './chains/stellar';
import type { ChainAdapter, ChainConfig, NetworkType } from './chains/types';

const adapters: Map<string, ChainAdapter> = new Map();

/**
 * Initialize a chain adapter
 */
export function initChain(config: ChainConfig): ChainAdapter {
  const key = `${config.chain}-${config.network}`;

  if (adapters.has(key)) {
    return adapters.get(key)!;
  }

  let adapter: ChainAdapter;

  switch (config.chain) {
    case 'stellar':
      adapter = new StellarAdapter(config);
      break;
    // case 'base':
    //   adapter = new BaseAdapter(config);
    //   break;
    // case 'solana':
    //   adapter = new SolanaAdapter(config);
    //   break;
    default:
      throw new Error(`Unsupported chain: ${config.chain}`);
  }

  adapters.set(key, adapter);
  return adapter;
}

/**
 * Get an initialized chain adapter
 */
export function getChain(chain: string, network: NetworkType): ChainAdapter | undefined {
  return adapters.get(`${chain}-${network}`);
}

/**
 * Get all initialized adapters
 */
export function getAllChains(): ChainAdapter[] {
  return Array.from(adapters.values());
}

/**
 * Supported chains configuration
 */
export const SUPPORTED_CHAINS = {
  stellar: {
    testnet: {
      name: 'Stellar Testnet',
      rpcUrl: 'https://soroban-testnet.stellar.org',
      explorerUrl: 'https://stellar.expert/explorer/testnet',
      nativeCurrency: 'XLM',
    },
    mainnet: {
      name: 'Stellar Mainnet',
      rpcUrl: 'https://soroban.stellar.org',
      explorerUrl: 'https://stellar.expert/explorer/public',
      nativeCurrency: 'XLM',
    },
  },
  base: {
    testnet: {
      name: 'Base Sepolia',
      rpcUrl: 'https://sepolia.base.org',
      explorerUrl: 'https://sepolia.basescan.org',
      nativeCurrency: 'ETH',
      chainId: 84532,
    },
    mainnet: {
      name: 'Base Mainnet',
      rpcUrl: 'https://mainnet.base.org',
      explorerUrl: 'https://basescan.org',
      nativeCurrency: 'ETH',
      chainId: 8453,
    },
  },
} as const;
