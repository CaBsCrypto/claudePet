/**
 * Item NFT contract interface and utilities
 * Works across all supported chains
 */

import type { ItemNFT, TxResult } from '../chains/types';

/**
 * Item types
 */
export enum ItemType {
  SKIN = 1,
  ENVIRONMENT = 2,
  ACCESSORY = 3,
  REVIVAL_TOKEN = 4,
}

/**
 * Item rarity
 */
export enum ItemRarity {
  COMMON = 1,
  RARE = 2,
  EPIC = 3,
  LEGENDARY = 4,
}

/**
 * Item definition
 */
export interface ItemDefinition {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  rarity: ItemRarity;
  imageUri: string;
  isNFT: boolean;
  maxSupply?: number; // undefined = unlimited
  attributes?: Record<string, string | number>;
}

/**
 * All available items in the game
 */
export const ITEM_DEFINITIONS: Record<string, ItemDefinition> = {
  // ============================================
  // SKINS
  // ============================================
  'skin-classic': {
    id: 'skin-classic',
    name: 'Classic',
    description: 'The default look for your pet.',
    type: ItemType.SKIN,
    rarity: ItemRarity.COMMON,
    imageUri: '/skins/classic.png',
    isNFT: false,
  },
  'skin-space-explorer': {
    id: 'skin-space-explorer',
    name: 'Space Explorer',
    description: 'Ready to explore the crypto cosmos!',
    type: ItemType.SKIN,
    rarity: ItemRarity.RARE,
    imageUri: '/skins/space-explorer.png',
    isNFT: false,
  },
  'skin-defi-wizard': {
    id: 'skin-defi-wizard',
    name: 'DeFi Wizard',
    description: 'Master of decentralized magic.',
    type: ItemType.SKIN,
    rarity: ItemRarity.EPIC,
    imageUri: '/skins/defi-wizard.png',
    isNFT: true,
    maxSupply: 1000,
  },
  'skin-golden-hodler': {
    id: 'skin-golden-hodler',
    name: 'Golden Hodler',
    description: 'Diamond hands, golden appearance.',
    type: ItemType.SKIN,
    rarity: ItemRarity.LEGENDARY,
    imageUri: '/skins/golden-hodler.png',
    isNFT: true,
    maxSupply: 100,
  },
  'skin-cyber-punk': {
    id: 'skin-cyber-punk',
    name: 'Cyber Punk',
    description: 'High-tech rebel from the future.',
    type: ItemType.SKIN,
    rarity: ItemRarity.EPIC,
    imageUri: '/skins/cyber-punk.png',
    isNFT: true,
    maxSupply: 500,
  },

  // ============================================
  // ENVIRONMENTS
  // ============================================
  'env-cozy-home': {
    id: 'env-cozy-home',
    name: 'Cozy Home',
    description: 'A comfortable starting place.',
    type: ItemType.ENVIRONMENT,
    rarity: ItemRarity.COMMON,
    imageUri: '/environments/cozy-home.png',
    isNFT: false,
  },
  'env-wallet-world': {
    id: 'env-wallet-world',
    name: 'Wallet World',
    description: 'A digital realm of wallets and keys.',
    type: ItemType.ENVIRONMENT,
    rarity: ItemRarity.RARE,
    imageUri: '/environments/wallet-world.png',
    isNFT: false,
  },
  'env-defi-dimension': {
    id: 'env-defi-dimension',
    name: 'DeFi Dimension',
    description: 'Where liquidity pools shimmer and yields grow.',
    type: ItemType.ENVIRONMENT,
    rarity: ItemRarity.EPIC,
    imageUri: '/environments/defi-dimension.png',
    isNFT: true,
    maxSupply: 500,
  },
  'env-security-fortress': {
    id: 'env-security-fortress',
    name: 'Security Fortress',
    description: 'An impenetrable bastion of crypto safety.',
    type: ItemType.ENVIRONMENT,
    rarity: ItemRarity.RARE,
    imageUri: '/environments/security-fortress.png',
    isNFT: false,
  },
  'env-moon-base': {
    id: 'env-moon-base',
    name: 'Moon Base',
    description: 'We finally made it. The view is incredible.',
    type: ItemType.ENVIRONMENT,
    rarity: ItemRarity.LEGENDARY,
    imageUri: '/environments/moon-base.png',
    isNFT: true,
    maxSupply: 50,
  },

  // ============================================
  // ACCESSORIES
  // ============================================
  'acc-bitcoin-hat': {
    id: 'acc-bitcoin-hat',
    name: 'Bitcoin Hat',
    description: 'Show your OG status.',
    type: ItemType.ACCESSORY,
    rarity: ItemRarity.RARE,
    imageUri: '/accessories/bitcoin-hat.png',
    isNFT: false,
  },
  'acc-laser-eyes': {
    id: 'acc-laser-eyes',
    name: 'Laser Eyes',
    description: 'Activated when you truly believe.',
    type: ItemType.ACCESSORY,
    rarity: ItemRarity.EPIC,
    imageUri: '/accessories/laser-eyes.png',
    isNFT: true,
    maxSupply: 1000,
  },

  // ============================================
  // REVIVAL TOKENS
  // ============================================
  'revival-basic': {
    id: 'revival-basic',
    name: 'Revival Token',
    description: 'Brings your pet back with 50% stats.',
    type: ItemType.REVIVAL_TOKEN,
    rarity: ItemRarity.RARE,
    imageUri: '/items/revival-basic.png',
    isNFT: true,
    attributes: {
      revivalPower: 50,
      levelPenalty: 1,
    },
  },
  'revival-premium': {
    id: 'revival-premium',
    name: 'Premium Revival Token',
    description: 'Brings your pet back at full power!',
    type: ItemType.REVIVAL_TOKEN,
    rarity: ItemRarity.LEGENDARY,
    imageUri: '/items/revival-premium.png',
    isNFT: true,
    maxSupply: 500,
    attributes: {
      revivalPower: 100,
      levelPenalty: 0,
    },
  },
};

/**
 * Get item definition by ID
 */
export function getItemDefinition(itemId: string): ItemDefinition | null {
  return ITEM_DEFINITIONS[itemId] || null;
}

/**
 * Get all items of a specific type
 */
export function getItemsByType(type: ItemType): ItemDefinition[] {
  return Object.values(ITEM_DEFINITIONS).filter((item) => item.type === type);
}

/**
 * Get all skins
 */
export function getAllSkins(): ItemDefinition[] {
  return getItemsByType(ItemType.SKIN);
}

/**
 * Get all environments
 */
export function getAllEnvironments(): ItemDefinition[] {
  return getItemsByType(ItemType.ENVIRONMENT);
}

/**
 * Get all accessories
 */
export function getAllAccessories(): ItemDefinition[] {
  return getItemsByType(ItemType.ACCESSORY);
}

/**
 * Get rarity name
 */
export function getItemRarityName(rarity: ItemRarity): string {
  const names: Record<ItemRarity, string> = {
    [ItemRarity.COMMON]: 'Common',
    [ItemRarity.RARE]: 'Rare',
    [ItemRarity.EPIC]: 'Epic',
    [ItemRarity.LEGENDARY]: 'Legendary',
  };
  return names[rarity];
}

/**
 * Get rarity color
 */
export function getItemRarityColor(rarity: ItemRarity): string {
  const colors: Record<ItemRarity, string> = {
    [ItemRarity.COMMON]: '#8b8b8b',
    [ItemRarity.RARE]: '#3498db',
    [ItemRarity.EPIC]: '#9b59b6',
    [ItemRarity.LEGENDARY]: '#f39c12',
  };
  return colors[rarity];
}

/**
 * Get type name
 */
export function getItemTypeName(type: ItemType): string {
  const names: Record<ItemType, string> = {
    [ItemType.SKIN]: 'Skin',
    [ItemType.ENVIRONMENT]: 'Environment',
    [ItemType.ACCESSORY]: 'Accessory',
    [ItemType.REVIVAL_TOKEN]: 'Revival Token',
  };
  return names[type];
}

/**
 * Format item for display
 */
export function formatItem(item: ItemNFT): {
  tokenId: string;
  owner: string;
  name: string;
  description: string;
  type: string;
  rarity: string;
  rarityColor: string;
  imageUri: string;
  isNFT: boolean;
} {
  const definition = getItemDefinition(item.metadataUri) || {
    name: 'Unknown Item',
    description: '',
    type: item.itemType,
    rarity: item.rarity,
    imageUri: '',
    isNFT: true,
  };

  return {
    tokenId: item.tokenId,
    owner: item.owner,
    name: definition.name,
    description: definition.description,
    type: getItemTypeName(item.itemType as ItemType),
    rarity: getItemRarityName(item.rarity as ItemRarity),
    rarityColor: getItemRarityColor(item.rarity as ItemRarity),
    imageUri: definition.imageUri,
    isNFT: definition.isNFT,
  };
}

/**
 * Check if an item can be transferred
 * Revival tokens can only be used, not transferred after use
 */
export function canTransferItem(item: ItemDefinition): boolean {
  // All items can be transferred
  return true;
}

/**
 * Get initial unlocked items for new users
 */
export function getStarterItems(): string[] {
  return ['skin-classic', 'env-cozy-home'];
}

/**
 * Get items unlocked at each level
 */
export function getUnlocksAtLevel(level: number): string[] {
  const unlocks: Record<number, string[]> = {
    2: ['skin-space-explorer'],
    3: ['env-wallet-world'],
    5: ['env-defi-dimension'],
    7: ['acc-bitcoin-hat'],
    8: ['env-security-fortress'],
    10: [], // Pet becomes NFT at level 10
  };

  return unlocks[level] || [];
}
