/**
 * Supported network types
 */
export type NetworkType = 'testnet' | 'mainnet';

/**
 * Supported chain types
 */
export type ChainType = 'stellar' | 'base' | 'solana';

/**
 * Chain configuration
 */
export interface ChainConfig {
  chain: ChainType;
  network: NetworkType;
  rpcUrl?: string;
  contracts?: ContractAddresses;
}

/**
 * Contract addresses for a chain
 */
export interface ContractAddresses {
  badges?: string;
  pets?: string;
  items?: string;
  revival?: string;
}

/**
 * Transaction result
 */
export interface TxResult {
  success: boolean;
  txHash: string;
  network: string;
  blockNumber?: number;
  error?: string;
}

/**
 * Badge data
 */
export interface Badge {
  id: string;
  name: string;
  description: string;
  imageUri: string;
  moduleId: string;
  earnedAt: number;
}

/**
 * Pet NFT data
 */
export interface PetNFT {
  tokenId: string;
  owner: string;
  petType: number;
  generation: number;
  parents?: [string, string];
  traits: number[];
  createdAt: number;
}

/**
 * Item NFT data
 */
export interface ItemNFT {
  tokenId: string;
  owner: string;
  itemType: number;
  rarity: number;
  metadataUri: string;
}

/**
 * Chain adapter interface
 * All chain implementations must follow this interface
 */
export interface ChainAdapter {
  readonly chain: ChainType;
  readonly network: NetworkType;
  readonly isConnected: boolean;

  // Connection
  connect(address?: string): Promise<boolean>;
  disconnect(): void;
  getAddress(): string | null;

  // Badges
  mintBadge(userId: string, badgeId: string): Promise<TxResult>;
  getBadges(userId: string): Promise<Badge[]>;
  hasBadge(userId: string, badgeId: string): Promise<boolean>;

  // Pets
  mintPet(owner: string, petType: number): Promise<TxResult>;
  transferPet(from: string, to: string, tokenId: string): Promise<TxResult>;
  getPet(tokenId: string): Promise<PetNFT | null>;
  getUserPets(owner: string): Promise<PetNFT[]>;

  // Items
  mintItem(owner: string, itemType: number): Promise<TxResult>;
  transferItem(from: string, to: string, tokenId: string): Promise<TxResult>;
  getItem(tokenId: string): Promise<ItemNFT | null>;
  getUserItems(owner: string): Promise<ItemNFT[]>;

  // Utilities
  getExplorerUrl(txHash: string): string;
  getNativeBalance(address: string): Promise<string>;
}

/**
 * Wallet connection options
 */
export interface WalletOptions {
  walletType: 'privy' | 'freighter' | 'walletconnect';
  autoConnect?: boolean;
}

/**
 * Contract interaction options
 */
export interface ContractOptions {
  gasLimit?: number;
  gasPrice?: string;
  sponsor?: boolean; // For gasless transactions
}
