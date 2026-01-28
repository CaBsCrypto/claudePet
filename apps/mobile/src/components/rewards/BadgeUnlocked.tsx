import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface BadgeUnlockedProps {
  visible: boolean;
  badgeName: string;
  badgeIcon: string;
  xpReward: number;
  onClose: () => void;
}

export function BadgeUnlocked({
  visible,
  badgeName,
  badgeIcon,
  xpReward,
  onClose,
}: BadgeUnlockedProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;
  const particlesAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset animations
      scaleAnim.setValue(0);
      rotateAnim.setValue(0);
      glowAnim.setValue(0);
      textFadeAnim.setValue(0);
      particlesAnim.setValue(0);

      // Start animation sequence
      Animated.sequence([
        // Badge appears with bounce
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
        // Rotate and glow
        Animated.parallel([
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 600,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(particlesAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
        // Text fades in
        Animated.timing(textFadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const glowScale = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.3],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.8, 0.4],
  });

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Particles */}
          {[...Array(12)].map((_, i) => {
            const angle = (i / 12) * 2 * Math.PI;
            const translateX = particlesAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, Math.cos(angle) * 120],
            });
            const translateY = particlesAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, Math.sin(angle) * 120],
            });
            const particleOpacity = particlesAnim.interpolate({
              inputRange: [0, 0.2, 0.8, 1],
              outputRange: [0, 1, 1, 0],
            });

            return (
              <Animated.View
                key={i}
                style={[
                  styles.particle,
                  {
                    transform: [{ translateX }, { translateY }],
                    opacity: particleOpacity,
                    backgroundColor: i % 2 === 0 ? '#ffd700' : '#e94560',
                  },
                ]}
              />
            );
          })}

          {/* Glow effect */}
          <Animated.View
            style={[
              styles.glow,
              {
                transform: [{ scale: glowScale }],
                opacity: glowOpacity,
              },
            ]}
          />

          {/* Badge */}
          <Animated.View
            style={[
              styles.badgeContainer,
              {
                transform: [{ scale: scaleAnim }, { rotate }],
              },
            ]}
          >
            <View style={styles.badge}>
              <Ionicons
                name={badgeIcon as keyof typeof Ionicons.glyphMap}
                size={48}
                color="#ffd700"
              />
            </View>
          </Animated.View>

          {/* Text */}
          <Animated.View style={{ opacity: textFadeAnim }}>
            <Text style={styles.title}>Badge Unlocked!</Text>
            <Text style={styles.badgeName}>{badgeName}</Text>

            <View style={styles.rewards}>
              <View style={styles.rewardItem}>
                <Ionicons name="star" size={20} color="#ffd700" />
                <Text style={styles.rewardText}>+{xpReward} XP</Text>
              </View>
            </View>

            <Pressable style={styles.button} onPress={onClose}>
              <Text style={styles.buttonText}>Awesome!</Text>
            </Pressable>
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    alignItems: 'center',
    padding: 40,
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  glow: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#ffd700',
  },
  badgeContainer: {
    marginBottom: 24,
  },
  badge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#16213e',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#ffd700',
    shadowColor: '#ffd700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  badgeName: {
    fontSize: 20,
    color: '#ffd700',
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '600',
  },
  rewards: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  rewardText: {
    color: '#ffd700',
    fontSize: 16,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#e94560',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
