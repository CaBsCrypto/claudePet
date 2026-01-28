import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type PetMood = 'happy' | 'neutral' | 'sad' | 'hungry' | 'tired' | 'sick' | 'dead';
export type PetType = 'dog' | 'cat' | 'dragon' | 'robot';

export interface Pet {
  id: string;
  name: string;
  type: PetType;
  level: number;
  xp: number;
  hunger: number; // 0-100
  energy: number; // 0-100
  happiness: number; // 0-100
  health: number; // 0-100
  mood: PetMood;
  equippedSkin: string | null;
  equippedEnvironment: string | null;
  isDead: boolean;
  freeRevivalUsed: boolean;
  lastUpdated: number;
  createdAt: number;
}

interface PetState {
  pet: Pet;
  isLoading: boolean;
  error: string | null;

  // Actions
  initializePet: (name: string, type: PetType) => void;
  feed: () => void;
  play: () => void;
  rest: () => void;
  heal: () => void;
  updateStats: () => void;
  equipSkin: (skinId: string) => void;
  equipEnvironment: (envId: string) => void;
  revive: (useFreeRevival: boolean) => boolean;
  addXp: (amount: number) => void;
  reset: () => void;
}

const DEFAULT_PET: Pet = {
  id: '',
  name: 'My Pet',
  type: 'dog',
  level: 1,
  xp: 0,
  hunger: 100,
  energy: 100,
  happiness: 100,
  health: 100,
  mood: 'happy',
  equippedSkin: null,
  equippedEnvironment: null,
  isDead: false,
  freeRevivalUsed: false,
  lastUpdated: Date.now(),
  createdAt: Date.now(),
};

// XP thresholds for each level
const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500];

function calculateMood(pet: Pet): PetMood {
  if (pet.isDead) return 'dead';
  if (pet.health < 20) return 'sick';
  if (pet.hunger < 20) return 'hungry';
  if (pet.energy < 20) return 'tired';
  if (pet.happiness < 30) return 'sad';
  if (pet.happiness > 70 && pet.hunger > 50 && pet.energy > 50) return 'happy';
  return 'neutral';
}

function calculateLevel(xp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      return i + 1;
    }
  }
  return 1;
}

export const usePetStore = create<PetState>()(
  persist(
    (set, get) => ({
      pet: DEFAULT_PET,
      isLoading: false,
      error: null,

      initializePet: (name: string, type: PetType) => {
        const newPet: Pet = {
          ...DEFAULT_PET,
          id: `pet_${Date.now()}`,
          name,
          type,
          lastUpdated: Date.now(),
          createdAt: Date.now(),
        };
        set({ pet: newPet });
      },

      feed: () => {
        set((state) => {
          const newHunger = Math.min(state.pet.hunger + 25, 100);
          const newHappiness = Math.min(state.pet.happiness + 5, 100);
          const pet = {
            ...state.pet,
            hunger: newHunger,
            happiness: newHappiness,
            lastUpdated: Date.now(),
          };
          return { pet: { ...pet, mood: calculateMood(pet) } };
        });
      },

      play: () => {
        set((state) => {
          if (state.pet.energy < 20) return state;
          const newEnergy = Math.max(state.pet.energy - 15, 0);
          const newHappiness = Math.min(state.pet.happiness + 20, 100);
          const newHunger = Math.max(state.pet.hunger - 10, 0);
          const pet = {
            ...state.pet,
            energy: newEnergy,
            happiness: newHappiness,
            hunger: newHunger,
            lastUpdated: Date.now(),
          };
          return { pet: { ...pet, mood: calculateMood(pet) } };
        });
      },

      rest: () => {
        set((state) => {
          const newEnergy = Math.min(state.pet.energy + 30, 100);
          const pet = {
            ...state.pet,
            energy: newEnergy,
            lastUpdated: Date.now(),
          };
          return { pet: { ...pet, mood: calculateMood(pet) } };
        });
      },

      heal: () => {
        set((state) => {
          const newHealth = Math.min(state.pet.health + 30, 100);
          const pet = {
            ...state.pet,
            health: newHealth,
            lastUpdated: Date.now(),
          };
          return { pet: { ...pet, mood: calculateMood(pet) } };
        });
      },

      updateStats: () => {
        set((state) => {
          const now = Date.now();
          const hoursPassed = (now - state.pet.lastUpdated) / (1000 * 60 * 60);

          // Decay rates per hour
          const hungerDecay = 5 * hoursPassed;
          const energyDecay = 3 * hoursPassed;
          const happinessDecay = 2 * hoursPassed;

          let newHunger = Math.max(state.pet.hunger - hungerDecay, 0);
          let newEnergy = Math.max(state.pet.energy - energyDecay, 0);
          let newHappiness = Math.max(state.pet.happiness - happinessDecay, 0);

          // Health decays if hunger is very low
          let newHealth = state.pet.health;
          if (newHunger < 20) {
            const healthDecay = 1 * hoursPassed;
            newHealth = Math.max(newHealth - healthDecay, 0);
          }

          const isDead = newHealth <= 0;

          const pet = {
            ...state.pet,
            hunger: newHunger,
            energy: newEnergy,
            happiness: newHappiness,
            health: newHealth,
            isDead,
            lastUpdated: now,
          };

          return { pet: { ...pet, mood: calculateMood(pet) } };
        });
      },

      equipSkin: (skinId: string) => {
        set((state) => ({
          pet: { ...state.pet, equippedSkin: skinId },
        }));
      },

      equipEnvironment: (envId: string) => {
        set((state) => ({
          pet: { ...state.pet, equippedEnvironment: envId },
        }));
      },

      revive: (useFreeRevival: boolean) => {
        const state = get();

        if (useFreeRevival && state.pet.freeRevivalUsed) {
          return false; // Already used free revival
        }

        set((state) => {
          const statsMultiplier = useFreeRevival ? 0.5 : 1;
          const levelPenalty = useFreeRevival ? 1 : 0;

          const pet = {
            ...state.pet,
            hunger: 50 * statsMultiplier,
            energy: 50 * statsMultiplier,
            happiness: 50 * statsMultiplier,
            health: 100 * statsMultiplier,
            isDead: false,
            level: Math.max(state.pet.level - levelPenalty, 1),
            freeRevivalUsed: useFreeRevival ? true : state.pet.freeRevivalUsed,
            lastUpdated: Date.now(),
          };

          return { pet: { ...pet, mood: calculateMood(pet) } };
        });

        return true;
      },

      addXp: (amount: number) => {
        set((state) => {
          const newXp = state.pet.xp + amount;
          const newLevel = calculateLevel(newXp);
          const leveledUp = newLevel > state.pet.level;

          return {
            pet: {
              ...state.pet,
              xp: newXp,
              level: newLevel,
            },
          };
        });
      },

      reset: () => {
        set({ pet: DEFAULT_PET, error: null });
      },
    }),
    {
      name: 'cryptopet-pet-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
