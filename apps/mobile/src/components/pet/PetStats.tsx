import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

interface StatBarProps {
  label: string;
  value: number;
  maxValue: number;
  icon: keyof typeof Ionicons.glyphMap;
  colorLow: string;
  colorHigh: string;
}

function StatBar({ label, value, maxValue, icon, colorLow, colorHigh }: StatBarProps) {
  const percentage = (value / maxValue) * 100;

  // Determine color based on value
  const getColor = () => {
    if (percentage <= 20) return colorLow;
    if (percentage <= 50) return '#f39c12';
    return colorHigh;
  };

  const animatedBarStyle = useAnimatedStyle(() => ({
    width: withTiming(`${percentage}%`, { duration: 500 }),
    backgroundColor: withTiming(getColor(), { duration: 500 }),
  }));

  return (
    <View style={styles.statRow}>
      <View style={styles.statHeader}>
        <View style={styles.labelContainer}>
          <Ionicons name={icon} size={16} color={getColor()} />
          <Text style={styles.label}>{label}</Text>
        </View>
        <Text style={[styles.value, { color: getColor() }]}>
          {Math.round(value)}/{maxValue}
        </Text>
      </View>
      <View style={styles.barContainer}>
        <Animated.View style={[styles.barFill, animatedBarStyle]} />
      </View>
    </View>
  );
}

interface PetStatsProps {
  hunger: number;
  energy: number;
  happiness: number;
  health: number;
}

export function PetStats({ hunger, energy, happiness, health }: PetStatsProps) {
  const stats = [
    {
      label: 'Hunger',
      value: hunger,
      icon: 'fast-food' as const,
      colorLow: '#e74c3c',
      colorHigh: '#2ecc71',
    },
    {
      label: 'Energy',
      value: energy,
      icon: 'flash' as const,
      colorLow: '#e74c3c',
      colorHigh: '#f1c40f',
    },
    {
      label: 'Happiness',
      value: happiness,
      icon: 'heart' as const,
      colorLow: '#9b59b6',
      colorHigh: '#e91e63',
    },
    {
      label: 'Health',
      value: health,
      icon: 'fitness' as const,
      colorLow: '#e74c3c',
      colorHigh: '#2ecc71',
    },
  ];

  return (
    <View style={styles.container}>
      {stats.map((stat) => (
        <StatBar
          key={stat.label}
          label={stat.label}
          value={stat.value}
          maxValue={100}
          icon={stat.icon}
          colorLow={stat.colorLow}
          colorHigh={stat.colorHigh}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  statRow: {
    gap: 6,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  value: {
    fontSize: 12,
    fontWeight: '600',
  },
  barContainer: {
    height: 8,
    backgroundColor: '#0f3460',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
});
