/**
 * Badge contract interface and utilities
 * Works across all supported chains
 */

import type { Badge, TxResult } from '../chains/types';

/**
 * Badge metadata structure
 */
export interface BadgeMetadata {
  id: string;
  name: string;
  description: string;
  imageUri: string;
  moduleId: string;
  attributes: {
    traitType: string;
    value: string | number;
  }[];
}

/**
 * Badge contract configuration
 */
export interface BadgeContractConfig {
  contractId: string;
  network: string;
  minterAddress?: string;
}

/**
 * Available badges in the system
 */
export const BADGE_DEFINITIONS: Record<string, Omit<BadgeMetadata, 'id'>> = {
  'badge-wallet-master': {
    name: 'Wallet Master',
    description: 'Successfully completed the wallet basics module and demonstrated understanding of seed phrase security.',
    imageUri: 'ipfs://QmWalletMasterBadge',
    moduleId: 'wallet-basics',
    attributes: [
      { traitType: 'Category', value: 'Security' },
      { traitType: 'Difficulty', value: 'Beginner' },
      { traitType: 'XP Reward', value: 150 },
    ],
  },
  'badge-first-tx': {
    name: 'First Transaction',
    description: 'Completed your first blockchain transaction on testnet.',
    imageUri: 'ipfs://QmFirstTxBadge',
    moduleId: 'first-transaction',
    attributes: [
      { traitType: 'Category', value: 'Transactions' },
      { traitType: 'Difficulty', value: 'Beginner' },
      { traitType: 'XP Reward', value: 200 },
    ],
  },
  'badge-defi-beginner': {
    name: 'DeFi Beginner',
    description: 'Learned the basics of decentralized finance and executed your first swap.',
    imageUri: 'ipfs://QmDeFiBeginnerBadge',
    moduleId: 'defi-intro',
    attributes: [
      { traitType: 'Category', value: 'DeFi' },
      { traitType: 'Difficulty', value: 'Intermediate' },
      { traitType: 'XP Reward', value: 250 },
    ],
  },
  'badge-security-aware': {
    name: 'Security Aware',
    description: 'Demonstrated knowledge of crypto security best practices and common scams.',
    imageUri: 'ipfs://QmSecurityAwareBadge',
    moduleId: 'security-basics',
    attributes: [
      { traitType: 'Category', value: 'Security' },
      { traitType: 'Difficulty', value: 'Beginner' },
      { traitType: 'XP Reward', value: 175 },
    ],
  },
};

/**
 * Get badge metadata by ID
 */
export function getBadgeMetadata(badgeId: string): BadgeMetadata | null {
  const definition = BADGE_DEFINITIONS[badgeId];
  if (!definition) return null;

  return {
    id: badgeId,
    ...definition,
  };
}

/**
 * Get all available badge IDs
 */
export function getAllBadgeIds(): string[] {
  return Object.keys(BADGE_DEFINITIONS);
}

/**
 * Check if a badge ID is valid
 */
export function isValidBadgeId(badgeId: string): boolean {
  return badgeId in BADGE_DEFINITIONS;
}

/**
 * Format badge for display
 */
export function formatBadge(badge: Badge): {
  id: string;
  name: string;
  description: string;
  imageUri: string;
  earnedDate: string;
  timeAgo: string;
} {
  const metadata = getBadgeMetadata(badge.id);
  const earnedDate = new Date(badge.earnedAt);

  const timeAgo = getTimeAgo(badge.earnedAt);

  return {
    id: badge.id,
    name: metadata?.name || badge.name,
    description: metadata?.description || badge.description,
    imageUri: metadata?.imageUri || badge.imageUri,
    earnedDate: earnedDate.toLocaleDateString(),
    timeAgo,
  };
}

/**
 * Get relative time string
 */
function getTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return new Date(timestamp).toLocaleDateString();
}

/**
 * Badge verification result
 */
export interface BadgeVerification {
  isValid: boolean;
  badge: Badge | null;
  owner: string | null;
  txHash: string | null;
  verifiedAt: number;
}

/**
 * Verify a badge on-chain
 * This checks that the badge was actually minted and belongs to the claimed owner
 */
export async function verifyBadge(
  badgeId: string,
  claimedOwner: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  chainAdapter: any
): Promise<BadgeVerification> {
  try {
    const hasBadge = await chainAdapter.hasBadge(claimedOwner, badgeId);

    if (!hasBadge) {
      return {
        isValid: false,
        badge: null,
        owner: null,
        txHash: null,
        verifiedAt: Date.now(),
      };
    }

    const badges = await chainAdapter.getBadges(claimedOwner);
    const badge = badges.find((b: Badge) => b.id === badgeId);

    return {
      isValid: true,
      badge: badge || null,
      owner: claimedOwner,
      txHash: null, // TODO: Get from chain
      verifiedAt: Date.now(),
    };
  } catch (error) {
    return {
      isValid: false,
      badge: null,
      owner: null,
      txHash: null,
      verifiedAt: Date.now(),
    };
  }
}
