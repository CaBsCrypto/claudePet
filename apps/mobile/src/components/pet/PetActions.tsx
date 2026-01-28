import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

interface ActionButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  color: string;
}

function ActionButton({ icon, label, onPress, disabled, color }: ActionButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!disabled) {
      scale.value = withSpring(0.95);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        style={[
          styles.actionButton,
          disabled && styles.actionButtonDisabled,
          { borderColor: disabled ? '#444' : color },
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
      >
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: disabled ? '#333' : `${color}20` },
          ]}
        >
          <Ionicons
            name={icon}
            size={24}
            color={disabled ? '#666' : color}
          />
        </View>
        <Text style={[styles.actionLabel, disabled && styles.actionLabelDisabled]}>
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

interface PetActionsProps {
  onFeed: () => void;
  onPlay: () => void;
  onRest: () => void;
  canFeed: boolean;
  canPlay: boolean;
  canRest: boolean;
}

export function PetActions({
  onFeed,
  onPlay,
  onRest,
  canFeed,
  canPlay,
  canRest,
}: PetActionsProps) {
  const actions = [
    {
      icon: 'fast-food' as const,
      label: 'Feed',
      onPress: onFeed,
      disabled: !canFeed,
      color: '#2ecc71',
    },
    {
      icon: 'game-controller' as const,
      label: 'Play',
      onPress: onPlay,
      disabled: !canPlay,
      color: '#e91e63',
    },
    {
      icon: 'bed' as const,
      label: 'Rest',
      onPress: onRest,
      disabled: !canRest,
      color: '#3498db',
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Actions</Text>
      <View style={styles.actionsRow}>
        {actions.map((action) => (
          <ActionButton
            key={action.label}
            icon={action.icon}
            label={action.label}
            onPress={action.onPress}
            disabled={action.disabled}
            color={action.color}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  actionLabelDisabled: {
    color: '#666',
  },
});
