/**
 * Pet NFT contract interface and utilities
 * Works across all supported chains
 */

import type { PetNFT, TxResult } from '../chains/types';

/**
 * Pet types available in the game
 */
export enum PetType {
  DOG = 1,
  CAT = 2,
  DRAGON = 3,
  ROBOT = 4,
}

/**
 * Pet type metadata
 */
export const PET_TYPE_METADATA: Record<
  PetType,
  {
    name: string;
    description: string;
    baseStats: {
      hungerDecay: number;
      energyDecay: number;
      happinessDecay: number;
    };
  }
> = {
  [PetType.DOG]: {
    name: 'Dog',
    description: 'A loyal companion who loves to play and learn.',
    baseStats: {
      hungerDecay: 5,
      energyDecay: 4,
      happinessDecay: 2,
    },
  },
  [PetType.CAT]: {
    name: 'Cat',
    description: 'An independent thinker who learns at their own pace.',
    baseStats: {
      hungerDecay: 4,
      energyDecay: 3,
      happinessDecay: 3,
    },
  },
  [PetType.DRAGON]: {
    name: 'Dragon',
    description: 'A mythical creature with exceptional learning abilities.',
    baseStats: {
      hungerDecay: 6,
      energyDecay: 5,
      happinessDecay: 1,
    },
  },
  [PetType.ROBOT]: {
    name: 'Robot',
    description: 'An efficient learner powered by crypto knowledge.',
    baseStats: {
      hungerDecay: 3, // Less hunger (uses energy)
      energyDecay: 6, // More energy consumption
      happinessDecay: 2,
    },
  },
};

/**
 * Pet rarity based on generation
 */
export enum PetRarity {
  COMMON = 1, // Gen 0 - original minted pets
  UNCOMMON = 2, // Gen 1 - first bred generation
  RARE = 3, // Gen 2
  EPIC = 4, // Gen 3
  LEGENDARY = 5, // Gen 4+
}

/**
 * Get pet rarity from generation
 */
export function getPetRarity(generation: number): PetRarity {
  if (generation === 0) return PetRarity.COMMON;
  if (generation === 1) return PetRarity.UNCOMMON;
  if (generation === 2) return PetRarity.RARE;
  if (generation === 3) return PetRarity.EPIC;
  return PetRarity.LEGENDARY;
}

/**
 * Get rarity name
 */
export function getRarityName(rarity: PetRarity): string {
  const names: Record<PetRarity, string> = {
    [PetRarity.COMMON]: 'Common',
    [PetRarity.UNCOMMON]: 'Uncommon',
    [PetRarity.RARE]: 'Rare',
    [PetRarity.EPIC]: 'Epic',
    [PetRarity.LEGENDARY]: 'Legendary',
  };
  return names[rarity];
}

/**
 * Pet trait system
 * Traits are inherited/mutated during breeding
 */
export interface PetTraits {
  // Visual traits
  color: number; // 0-255 hue value
  pattern: number; // 0-10 pattern types
  accessory: number; // 0-20 accessory types

  // Stat modifiers
  learningSpeed: number; // -20 to +20
  hungerResistance: number; // -20 to +20
  energyEfficiency: number; // -20 to +20
  happinessBoost: number; // -20 to +20
}

/**
 * Decode traits from contract storage (array of u8)
 */
export function decodeTraits(traitsArray: number[]): PetTraits {
  if (traitsArray.length < 7) {
    // Return default traits if array is incomplete
    return {
      color: 180,
      pattern: 0,
      accessory: 0,
      learningSpeed: 0,
      hungerResistance: 0,
      energyEfficiency: 0,
      happinessBoost: 0,
    };
  }

  return {
    color: traitsArray[0],
    pattern: traitsArray[1],
    accessory: traitsArray[2],
    learningSpeed: traitsArray[3] - 128, // Convert from 0-255 to -128 to 127
    hungerResistance: traitsArray[4] - 128,
    energyEfficiency: traitsArray[5] - 128,
    happinessBoost: traitsArray[6] - 128,
  };
}

/**
 * Encode traits for contract storage
 */
export function encodeTraits(traits: PetTraits): number[] {
  return [
    traits.color,
    traits.pattern,
    traits.accessory,
    traits.learningSpeed + 128,
    traits.hungerResistance + 128,
    traits.energyEfficiency + 128,
    traits.happinessBoost + 128,
  ];
}

/**
 * Generate random traits for a new pet
 */
export function generateRandomTraits(): PetTraits {
  return {
    color: Math.floor(Math.random() * 256),
    pattern: Math.floor(Math.random() * 11),
    accessory: 0, // No accessory by default
    learningSpeed: Math.floor(Math.random() * 21) - 10, // -10 to +10
    hungerResistance: Math.floor(Math.random() * 21) - 10,
    energyEfficiency: Math.floor(Math.random() * 21) - 10,
    happinessBoost: Math.floor(Math.random() * 21) - 10,
  };
}

/**
 * Breed two pets to create offspring traits
 * Simple genetic algorithm
 */
export function breedTraits(parent1: PetTraits, parent2: PetTraits): PetTraits {
  const inheritOrMutate = (val1: number, val2: number, isStat: boolean): number => {
    // 50% chance to inherit from either parent
    const inherited = Math.random() < 0.5 ? val1 : val2;

    // 10% chance of mutation
    if (Math.random() < 0.1) {
      const mutation = Math.floor(Math.random() * 11) - 5; // -5 to +5
      const mutated = inherited + mutation;

      if (isStat) {
        return Math.max(-20, Math.min(20, mutated));
      }
      return Math.max(0, mutated);
    }

    return inherited;
  };

  return {
    color: Math.floor((parent1.color + parent2.color) / 2 + (Math.random() * 20 - 10)),
    pattern: inheritOrMutate(parent1.pattern, parent2.pattern, false) % 11,
    accessory: inheritOrMutate(parent1.accessory, parent2.accessory, false) % 21,
    learningSpeed: inheritOrMutate(parent1.learningSpeed, parent2.learningSpeed, true),
    hungerResistance: inheritOrMutate(parent1.hungerResistance, parent2.hungerResistance, true),
    energyEfficiency: inheritOrMutate(parent1.energyEfficiency, parent2.energyEfficiency, true),
    happinessBoost: inheritOrMutate(parent1.happinessBoost, parent2.happinessBoost, true),
  };
}

/**
 * Format pet NFT for display
 */
export function formatPetNFT(pet: PetNFT): {
  tokenId: string;
  owner: string;
  typeName: string;
  rarity: string;
  generation: number;
  traits: PetTraits;
  age: string;
} {
  const petTypeInfo = PET_TYPE_METADATA[pet.petType as PetType];
  const rarity = getPetRarity(pet.generation);

  const ageMs = Date.now() - pet.createdAt;
  const ageDays = Math.floor(ageMs / 86400000);

  return {
    tokenId: pet.tokenId,
    owner: pet.owner,
    typeName: petTypeInfo?.name || 'Unknown',
    rarity: getRarityName(rarity),
    generation: pet.generation,
    traits: decodeTraits(pet.traits),
    age: ageDays === 0 ? 'Born today' : `${ageDays} days old`,
  };
}

/**
 * Check if a pet can breed
 */
export function canBreed(pet: PetNFT, lastBreedTime?: number): {
  canBreed: boolean;
  reason?: string;
  cooldownRemaining?: number;
} {
  const BREEDING_COOLDOWN = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

  if (lastBreedTime) {
    const timeSinceBreed = Date.now() - lastBreedTime;
    if (timeSinceBreed < BREEDING_COOLDOWN) {
      return {
        canBreed: false,
        reason: 'Pet is on breeding cooldown',
        cooldownRemaining: BREEDING_COOLDOWN - timeSinceBreed,
      };
    }
  }

  return { canBreed: true };
}
