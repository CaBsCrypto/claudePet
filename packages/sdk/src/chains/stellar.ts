import * as StellarSdk from '@stellar/stellar-sdk';
import type {
  ChainAdapter,
  ChainConfig,
  NetworkType,
  TxResult,
  Badge,
  PetNFT,
  ItemNFT,
} from './types';

const HORIZON_URLS = {
  testnet: 'https://horizon-testnet.stellar.org',
  mainnet: 'https://horizon.stellar.org',
};

const SOROBAN_URLS = {
  testnet: 'https://soroban-testnet.stellar.org',
  mainnet: 'https://soroban.stellar.org',
};

const EXPLORER_URLS = {
  testnet: 'https://stellar.expert/explorer/testnet',
  mainnet: 'https://stellar.expert/explorer/public',
};

/**
 * Stellar/Soroban chain adapter
 */
export class StellarAdapter implements ChainAdapter {
  readonly chain = 'stellar' as const;
  readonly network: NetworkType;

  private server: StellarSdk.Horizon.Server;
  private sorobanServer: StellarSdk.SorobanRpc.Server;
  private address: string | null = null;
  private _isConnected = false;

  // Contract addresses (to be set after deployment)
  private contracts: {
    badges?: string;
    pets?: string;
    items?: string;
    revival?: string;
  } = {};

  constructor(config: ChainConfig) {
    this.network = config.network;

    const horizonUrl = config.rpcUrl || HORIZON_URLS[config.network];
    const sorobanUrl = SOROBAN_URLS[config.network];

    this.server = new StellarSdk.Horizon.Server(horizonUrl);
    this.sorobanServer = new StellarSdk.SorobanRpc.Server(sorobanUrl);

    if (config.contracts) {
      this.contracts = config.contracts;
    }
  }

  get isConnected(): boolean {
    return this._isConnected;
  }

  async connect(address?: string): Promise<boolean> {
    if (address) {
      // Validate address
      try {
        StellarSdk.Keypair.fromPublicKey(address);
        this.address = address;
        this._isConnected = true;
        return true;
      } catch {
        console.error('Invalid Stellar address');
        return false;
      }
    }

    // If no address provided, we'll wait for wallet connection
    return false;
  }

  disconnect(): void {
    this.address = null;
    this._isConnected = false;
  }

  getAddress(): string | null {
    return this.address;
  }

  // ============================================
  // BADGES
  // ============================================

  async mintBadge(userId: string, badgeId: string): Promise<TxResult> {
    if (!this.contracts.badges) {
      return {
        success: false,
        txHash: '',
        network: this.network,
        error: 'Badges contract not configured',
      };
    }

    try {
      // TODO: Implement actual Soroban contract call
      // This is a placeholder for the contract interaction

      // const contract = new StellarSdk.Contract(this.contracts.badges);
      // const tx = await contract.call('mint_badge', userId, badgeId);
      // const result = await this.sorobanServer.sendTransaction(tx);

      // Mock successful result for now
      const mockTxHash = `${Date.now().toString(16)}${Math.random().toString(16).slice(2, 10)}`;

      return {
        success: true,
        txHash: mockTxHash,
        network: this.network,
      };
    } catch (error) {
      return {
        success: false,
        txHash: '',
        network: this.network,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getBadges(userId: string): Promise<Badge[]> {
    if (!this.contracts.badges) {
      return [];
    }

    try {
      // TODO: Implement actual contract read
      // const contract = new StellarSdk.Contract(this.contracts.badges);
      // const badges = await contract.call('get_badges', userId);

      // Mock data for now
      return [
        {
          id: 'badge-wallet-master',
          name: 'Wallet Master',
          description: 'Completed wallet basics module',
          imageUri: 'ipfs://...',
          moduleId: 'wallet-basics',
          earnedAt: Date.now() - 86400000,
        },
      ];
    } catch (error) {
      console.error('Failed to get badges:', error);
      return [];
    }
  }

  async hasBadge(userId: string, badgeId: string): Promise<boolean> {
    const badges = await this.getBadges(userId);
    return badges.some((b) => b.id === badgeId);
  }

  // ============================================
  // PETS
  // ============================================

  async mintPet(owner: string, petType: number): Promise<TxResult> {
    if (!this.contracts.pets) {
      return {
        success: false,
        txHash: '',
        network: this.network,
        error: 'Pets contract not configured',
      };
    }

    try {
      // TODO: Implement actual contract call
      const mockTxHash = `${Date.now().toString(16)}${Math.random().toString(16).slice(2, 10)}`;

      return {
        success: true,
        txHash: mockTxHash,
        network: this.network,
      };
    } catch (error) {
      return {
        success: false,
        txHash: '',
        network: this.network,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async transferPet(from: string, to: string, tokenId: string): Promise<TxResult> {
    if (!this.contracts.pets) {
      return {
        success: false,
        txHash: '',
        network: this.network,
        error: 'Pets contract not configured',
      };
    }

    try {
      // TODO: Implement actual contract call
      const mockTxHash = `${Date.now().toString(16)}${Math.random().toString(16).slice(2, 10)}`;

      return {
        success: true,
        txHash: mockTxHash,
        network: this.network,
      };
    } catch (error) {
      return {
        success: false,
        txHash: '',
        network: this.network,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getPet(tokenId: string): Promise<PetNFT | null> {
    if (!this.contracts.pets) {
      return null;
    }

    try {
      // TODO: Implement actual contract read
      return null;
    } catch (error) {
      console.error('Failed to get pet:', error);
      return null;
    }
  }

  async getUserPets(owner: string): Promise<PetNFT[]> {
    if (!this.contracts.pets) {
      return [];
    }

    try {
      // TODO: Implement actual contract read
      return [];
    } catch (error) {
      console.error('Failed to get user pets:', error);
      return [];
    }
  }

  // ============================================
  // ITEMS
  // ============================================

  async mintItem(owner: string, itemType: number): Promise<TxResult> {
    if (!this.contracts.items) {
      return {
        success: false,
        txHash: '',
        network: this.network,
        error: 'Items contract not configured',
      };
    }

    try {
      // TODO: Implement actual contract call
      const mockTxHash = `${Date.now().toString(16)}${Math.random().toString(16).slice(2, 10)}`;

      return {
        success: true,
        txHash: mockTxHash,
        network: this.network,
      };
    } catch (error) {
      return {
        success: false,
        txHash: '',
        network: this.network,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async transferItem(from: string, to: string, tokenId: string): Promise<TxResult> {
    if (!this.contracts.items) {
      return {
        success: false,
        txHash: '',
        network: this.network,
        error: 'Items contract not configured',
      };
    }

    try {
      // TODO: Implement actual contract call
      const mockTxHash = `${Date.now().toString(16)}${Math.random().toString(16).slice(2, 10)}`;

      return {
        success: true,
        txHash: mockTxHash,
        network: this.network,
      };
    } catch (error) {
      return {
        success: false,
        txHash: '',
        network: this.network,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getItem(tokenId: string): Promise<ItemNFT | null> {
    if (!this.contracts.items) {
      return null;
    }

    try {
      // TODO: Implement actual contract read
      return null;
    } catch (error) {
      console.error('Failed to get item:', error);
      return null;
    }
  }

  async getUserItems(owner: string): Promise<ItemNFT[]> {
    if (!this.contracts.items) {
      return [];
    }

    try {
      // TODO: Implement actual contract read
      return [];
    } catch (error) {
      console.error('Failed to get user items:', error);
      return [];
    }
  }

  // ============================================
  // UTILITIES
  // ============================================

  getExplorerUrl(txHash: string): string {
    return `${EXPLORER_URLS[this.network]}/tx/${txHash}`;
  }

  async getNativeBalance(address: string): Promise<string> {
    try {
      const account = await this.server.loadAccount(address);
      const xlmBalance = account.balances.find(
        (b) => b.asset_type === 'native'
      );
      return xlmBalance ? xlmBalance.balance : '0';
    } catch (error) {
      console.error('Failed to get balance:', error);
      return '0';
    }
  }

  // ============================================
  // SOROSWAP INTEGRATION
  // ============================================

  /**
   * Get a swap quote from Soroswap
   */
  async getSwapQuote(
    tokenIn: string,
    tokenOut: string,
    amountIn: string
  ): Promise<{ amountOut: string; priceImpact: string } | null> {
    try {
      // TODO: Implement Soroswap Router contract call
      // This will use the Soroswap Router contract to get quotes

      // Mock response
      return {
        amountOut: (parseFloat(amountIn) * 0.98).toString(),
        priceImpact: '0.5',
      };
    } catch (error) {
      console.error('Failed to get swap quote:', error);
      return null;
    }
  }

  /**
   * Execute a swap on Soroswap
   */
  async executeSwap(
    tokenIn: string,
    tokenOut: string,
    amountIn: string,
    minAmountOut: string,
    userAddress: string
  ): Promise<TxResult> {
    try {
      // TODO: Implement Soroswap Router swap call

      const mockTxHash = `${Date.now().toString(16)}${Math.random().toString(16).slice(2, 10)}`;

      return {
        success: true,
        txHash: mockTxHash,
        network: this.network,
      };
    } catch (error) {
      return {
        success: false,
        txHash: '',
        network: this.network,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
