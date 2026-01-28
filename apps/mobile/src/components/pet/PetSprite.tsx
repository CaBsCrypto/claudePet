import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import type { PetMood, PetType } from '@/stores/petStore';

interface PetSpriteProps {
  mood: PetMood;
  type: PetType;
  skinId: string | null;
  size?: 'small' | 'medium' | 'large';
}

// Placeholder colors for different moods
const MOOD_COLORS: Record<PetMood, string> = {
  happy: '#2ecc71',
  neutral: '#3498db',
  sad: '#9b59b6',
  hungry: '#f39c12',
  tired: '#95a5a6',
  sick: '#e74c3c',
  dead: '#7f8c8d',
};

// Placeholder icons for different pet types (will be replaced with 3D models)
const PET_EMOJIS: Record<PetType, string> = {
  dog: '🐕',
  cat: '🐱',
  dragon: '🐉',
  robot: '🤖',
};

export function PetSprite({ mood, type, skinId, size = 'large' }: PetSpriteProps) {
  // Animation values
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  useEffect(() => {
    // Different animations based on mood
    switch (mood) {
      case 'happy':
        // Bouncy animation
        translateY.value = withRepeat(
          withSequence(
            withTiming(-10, { duration: 300, easing: Easing.ease }),
            withTiming(0, { duration: 300, easing: Easing.ease })
          ),
          -1,
          false
        );
        scale.value = withRepeat(
          withSequence(
            withTiming(1.05, { duration: 300 }),
            withTiming(1, { duration: 300 })
          ),
          -1,
          false
        );
        break;

      case 'sad':
        // Slow, droopy animation
        translateY.value = withRepeat(
          withSequence(
            withTiming(5, { duration: 2000, easing: Easing.ease }),
            withTiming(0, { duration: 2000, easing: Easing.ease })
          ),
          -1,
          false
        );
        scale.value = withTiming(0.95, { duration: 500 });
        break;

      case 'hungry':
        // Shaking animation
        rotation.value = withRepeat(
          withSequence(
            withTiming(-3, { duration: 100 }),
            withTiming(3, { duration: 100 }),
            withTiming(0, { duration: 100 })
          ),
          -1,
          false
        );
        break;

      case 'tired':
        // Slow breathing animation
        scale.value = withRepeat(
          withSequence(
            withTiming(1.02, { duration: 1500, easing: Easing.ease }),
            withTiming(0.98, { duration: 1500, easing: Easing.ease })
          ),
          -1,
          false
        );
        break;

      case 'sick':
        // Wobble animation
        rotation.value = withRepeat(
          withSequence(
            withTiming(-5, { duration: 500 }),
            withTiming(5, { duration: 500 })
          ),
          -1,
          true
        );
        scale.value = withTiming(0.9, { duration: 500 });
        break;

      case 'dead':
        // No animation, just rotated
        rotation.value = withTiming(90, { duration: 1000 });
        scale.value = withTiming(0.8, { duration: 1000 });
        break;

      default:
        // Subtle idle animation
        translateY.value = withRepeat(
          withSequence(
            withTiming(-3, { duration: 1000, easing: Easing.ease }),
            withTiming(0, { duration: 1000, easing: Easing.ease })
          ),
          -1,
          false
        );
        break;
    }

    // Cleanup
    return () => {
      translateY.value = 0;
      scale.value = 1;
      rotation.value = 0;
    };
  }, [mood]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const sizeStyles = {
    small: { width: 80, height: 80, fontSize: 40 },
    medium: { width: 150, height: 150, fontSize: 80 },
    large: { width: 250, height: 250, fontSize: 120 },
  };

  const currentSize = sizeStyles[size];

  return (
    <View style={[styles.container, { width: currentSize.width, height: currentSize.height }]}>
      {/* Background glow based on mood */}
      <View
        style={[
          styles.glow,
          {
            backgroundColor: MOOD_COLORS[mood],
            opacity: mood === 'happy' ? 0.3 : 0.15,
          },
        ]}
      />

      {/* Pet sprite (placeholder - will be replaced with 3D model) */}
      <Animated.View style={[styles.petContainer, animatedStyle]}>
        <View
          style={[
            styles.petPlaceholder,
            {
              width: currentSize.width * 0.8,
              height: currentSize.height * 0.8,
              borderColor: MOOD_COLORS[mood],
            },
          ]}
        >
          {/* Placeholder emoji - replace with actual 3D pet later */}
          <Animated.Text style={[styles.petEmoji, { fontSize: currentSize.fontSize }]}>
            {PET_EMOJIS[type]}
          </Animated.Text>
        </View>
      </Animated.View>

      {/* Mood indicator */}
      <View style={[styles.moodIndicator, { backgroundColor: MOOD_COLORS[mood] }]}>
        <MoodIcon mood={mood} />
      </View>
    </View>
  );
}

function MoodIcon({ mood }: { mood: PetMood }) {
  const icons: Record<PetMood, string> = {
    happy: '😊',
    neutral: '😐',
    sad: '😢',
    hungry: '🍖',
    tired: '😴',
    sick: '🤒',
    dead: '💀',
  };

  return (
    <Animated.Text style={styles.moodIcon}>{icons[mood]}</Animated.Text>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 999,
  },
  petContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  petPlaceholder: {
    borderRadius: 999,
    borderWidth: 4,
    backgroundColor: '#16213e',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  petEmoji: {
    textAlign: 'center',
  },
  moodIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#1a1a2e',
  },
  moodIcon: {
    fontSize: 20,
  },
});
