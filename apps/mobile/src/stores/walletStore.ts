import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type WalletType = 'privy' | 'freighter';
export type NetworkType = 'stellar-testnet' | 'stellar-mainnet' | 'base-testnet' | 'base-mainnet';

export interface WalletState {
  // Connection state
  isConnected: boolean;
  walletType: WalletType | null;
  address: string | null;
  publicKey: string | null;

  // Network
  network: NetworkType;
  isTestnet: boolean;

  // Balances
  balances: Record<string, string>;
  isLoadingBalances: boolean;

  // Actions
  connect: (type: WalletType) => Promise<boolean>;
  disconnect: () => void;
  switchNetwork: (network: NetworkType) => void;
  refreshBalances: () => Promise<void>;

  // Privy specific
  privyUser: any | null;
  setPrivyUser: (user: any) => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      // Initial state
      isConnected: false,
      walletType: null,
      address: null,
      publicKey: null,
      network: 'stellar-testnet',
      isTestnet: true,
      balances: {},
      isLoadingBalances: false,
      privyUser: null,

      connect: async (type: WalletType) => {
        try {
          // This will be implemented with actual wallet SDKs
          // For now, mock the connection
          if (type === 'privy') {
            // Privy handles its own connection flow
            // This will be triggered after Privy login callback
            return true;
          }

          if (type === 'freighter') {
            // Check if Freighter is installed (web only)
            // For React Native, we'll use deep linking or WalletConnect
            set({
              isConnected: true,
              walletType: type,
              address: 'G...' + Math.random().toString(36).substring(7).toUpperCase(),
            });
            return true;
          }

          return false;
        } catch (error) {
          console.error('Wallet connection error:', error);
          return false;
        }
      },

      disconnect: () => {
        set({
          isConnected: false,
          walletType: null,
          address: null,
          publicKey: null,
          balances: {},
          privyUser: null,
        });
      },

      switchNetwork: (network: NetworkType) => {
        const isTestnet = network.includes('testnet');
        set({ network, isTestnet });
      },

      refreshBalances: async () => {
        const state = get();
        if (!state.isConnected || !state.address) return;

        set({ isLoadingBalances: true });

        try {
          // Fetch balances from Stellar/other networks
          // Mock for now
          const mockBalances: Record<string, string> = {
            XLM: '100.00',
            USDC: '50.00',
          };

          set({ balances: mockBalances, isLoadingBalances: false });
        } catch (error) {
          console.error('Failed to fetch balances:', error);
          set({ isLoadingBalances: false });
        }
      },

      setPrivyUser: (user: any) => {
        if (user) {
          // Extract wallet info from Privy user
          const walletAddress = user.wallet?.address;
          set({
            privyUser: user,
            isConnected: true,
            walletType: 'privy',
            address: walletAddress,
          });
        } else {
          set({ privyUser: null });
        }
      },
    }),
    {
      name: 'cryptopet-wallet-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        network: state.network,
        isTestnet: state.isTestnet,
        // Don't persist connection state for security
      }),
    }
  )
);
