import { View, Text, StyleSheet, ScrollView, Pressable, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState, useRef } from 'react';
import { Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PetSprite } from '../../src/components/pet/PetSprite';
import { PetStats } from '../../src/components/pet/PetStats';
import { PetActions } from '../../src/components/pet/PetActions';
import { usePetStore } from '../../src/stores/petStore';

const XP_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500];

export default function HomeScreen() {
  const { pet, feed, play, rest, heal, updateStats, revive } = usePetStore();
  const [showReviveModal, setShowReviveModal] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const feedbackOpacity = useRef(new Animated.Value(0)).current;

  // Update stats periodically
  useEffect(() => {
    updateStats(); // Initial update

    const interval = setInterval(() => {
      updateStats();
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Show revive modal when pet dies
  useEffect(() => {
    if (pet.isDead && !showReviveModal) {
      setShowReviveModal(true);
    }
  }, [pet.isDead]);

  // Show action feedback animation
  const showFeedback = (message: string) => {
    setActionFeedback(message);
    feedbackOpacity.setValue(1);
    Animated.sequence([
      Animated.delay(1000),
      Animated.timing(feedbackOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => setActionFeedback(null));
  };

  const handleFeed = () => {
    feed();
    showFeedback('+25 Hunger, +5 Happiness');
  };

  const handlePlay = () => {
    if (pet.energy < 20) {
      showFeedback('Too tired to play!');
      return;
    }
    play();
    showFeedback('+20 Happiness, -15 Energy');
  };

  const handleRest = () => {
    rest();
    showFeedback('+30 Energy');
  };

  const handleHeal = () => {
    if (pet.health >= 100) {
      showFeedback('Already at full health!');
      return;
    }
    heal();
    showFeedback('+30 Health');
  };

  const handleRevive = (useFree: boolean) => {
    const success = revive(useFree);
    if (success) {
      setShowReviveModal(false);
      showFeedback(useFree ? 'Pet revived! (Free revival used)' : 'Pet revived with NFT!');
    } else {
      showFeedback('Free revival already used!');
    }
  };

  // Calculate XP progress
  const currentLevelXP = XP_THRESHOLDS[pet.level - 1] || 0;
  const nextLevelXP = XP_THRESHOLDS[pet.level] || XP_THRESHOLDS[XP_THRESHOLDS.length - 1];
  const xpProgress = ((pet.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.petInfo}>
            <Text style={styles.petName}>{pet.name}</Text>
            <View style={styles.levelBadge}>
              <Ionicons name="star" size={14} color="#ffd700" />
              <Text style={styles.levelText}>Level {pet.level}</Text>
            </View>
          </View>

          {/* XP Progress */}
          <View style={styles.xpContainer}>
            <View style={styles.xpBar}>
              <View style={[styles.xpFill, { width: `${Math.min(xpProgress, 100)}%` }]} />
            </View>
            <Text style={styles.xpText}>
              {pet.xp - currentLevelXP} / {nextLevelXP - currentLevelXP} XP
            </Text>
          </View>
        </View>

        {/* Action Feedback */}
        {actionFeedback && (
          <Animated.View style={[styles.feedbackContainer, { opacity: feedbackOpacity }]}>
            <Text style={styles.feedbackText}>{actionFeedback}</Text>
          </Animated.View>
        )}

        {/* Pet Display */}
        <View style={styles.petContainer}>
          <PetSprite
            mood={pet.mood}
            type={pet.type}
            skinId={pet.equippedSkin}
          />

          {/* Mood Status */}
          <View style={styles.moodStatus}>
            <Text style={styles.moodLabel}>Mood:</Text>
            <Text style={[styles.moodValue, { color: getMoodColor(pet.mood) }]}>
              {pet.mood.charAt(0).toUpperCase() + pet.mood.slice(1)}
            </Text>
          </View>
        </View>

        {/* Stats */}
        <PetStats
          hunger={pet.hunger}
          energy={pet.energy}
          happiness={pet.happiness}
          health={pet.health}
        />

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Actions</Text>
          <View style={styles.actionsGrid}>
            <ActionButton
              icon="fast-food"
              label="Feed"
              color="#2ecc71"
              onPress={handleFeed}
              disabled={pet.hunger >= 100 || pet.isDead}
              stat={`${Math.round(pet.hunger)}%`}
            />
            <ActionButton
              icon="game-controller"
              label="Play"
              color="#e91e63"
              onPress={handlePlay}
              disabled={pet.energy < 20 || pet.isDead}
              stat={`-15 ⚡`}
            />
            <ActionButton
              icon="bed"
              label="Rest"
              color="#3498db"
              onPress={handleRest}
              disabled={pet.energy >= 100 || pet.isDead}
              stat={`${Math.round(pet.energy)}%`}
            />
            <ActionButton
              icon="medkit"
              label="Heal"
              color="#9b59b6"
              onPress={handleHeal}
              disabled={pet.health >= 100 || pet.isDead}
              stat={`${Math.round(pet.health)}%`}
            />
          </View>
        </View>

        {/* Quick Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Tips</Text>
          {pet.hunger < 30 && (
            <TipBadge icon="warning" color="#f39c12" text="Your pet is getting hungry!" />
          )}
          {pet.energy < 30 && (
            <TipBadge icon="battery-dead" color="#e74c3c" text="Your pet needs rest!" />
          )}
          {pet.happiness < 30 && (
            <TipBadge icon="sad" color="#9b59b6" text="Play with your pet to cheer them up!" />
          )}
          {pet.health < 50 && (
            <TipBadge icon="fitness" color="#e74c3c" text="Your pet's health is low!" />
          )}
          {pet.hunger >= 70 && pet.energy >= 70 && pet.happiness >= 70 && pet.health >= 70 && (
            <TipBadge icon="happy" color="#2ecc71" text="Your pet is doing great!" />
          )}
        </View>
      </ScrollView>

      {/* Revive Modal */}
      <Modal
        visible={showReviveModal}
        transparent
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.deathIcon}>
              <Text style={styles.deathEmoji}>💀</Text>
            </View>

            <Text style={styles.modalTitle}>Oh no!</Text>
            <Text style={styles.modalMessage}>
              Your pet has passed away due to neglect. But don't worry, you can bring them back!
            </Text>

            <View style={styles.reviveOptions}>
              {!pet.freeRevivalUsed && (
                <Pressable
                  style={styles.reviveButton}
                  onPress={() => handleRevive(true)}
                >
                  <Ionicons name="heart" size={24} color="#fff" />
                  <View style={styles.reviveButtonText}>
                    <Text style={styles.reviveTitle}>Free Revival</Text>
                    <Text style={styles.reviveDesc}>One-time use, 50% stats</Text>
                  </View>
                </Pressable>
              )}

              <Pressable
                style={[styles.reviveButton, styles.reviveButtonNFT]}
                onPress={() => handleRevive(false)}
              >
                <Ionicons name="diamond" size={24} color="#ffd700" />
                <View style={styles.reviveButtonText}>
                  <Text style={styles.reviveTitle}>NFT Revival</Text>
                  <Text style={styles.reviveDesc}>Full stats, requires Revival NFT</Text>
                </View>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function ActionButton({
  icon,
  label,
  color,
  onPress,
  disabled,
  stat,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  onPress: () => void;
  disabled: boolean;
  stat: string;
}) {
  return (
    <Pressable
      style={[
        styles.actionButton,
        disabled && styles.actionButtonDisabled,
        { borderColor: disabled ? '#333' : color },
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <View
        style={[
          styles.actionIconContainer,
          { backgroundColor: disabled ? '#222' : `${color}20` },
        ]}
      >
        <Ionicons name={icon} size={28} color={disabled ? '#555' : color} />
      </View>
      <Text style={[styles.actionLabel, disabled && styles.actionLabelDisabled]}>
        {label}
      </Text>
      <Text style={[styles.actionStat, disabled && styles.actionStatDisabled]}>
        {stat}
      </Text>
    </Pressable>
  );
}

function TipBadge({
  icon,
  color,
  text,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  text: string;
}) {
  return (
    <View style={[styles.tipBadge, { borderLeftColor: color }]}>
      <Ionicons name={icon} size={16} color={color} />
      <Text style={styles.tipText}>{text}</Text>
    </View>
  );
}

function getMoodColor(mood: string): string {
  const colors: Record<string, string> = {
    happy: '#2ecc71',
    neutral: '#3498db',
    sad: '#9b59b6',
    hungry: '#f39c12',
    tired: '#95a5a6',
    sick: '#e74c3c',
    dead: '#7f8c8d',
  };
  return colors[mood] || '#fff';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 16,
  },
  petInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  petName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213e',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  levelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffd700',
  },
  xpContainer: {
    gap: 4,
  },
  xpBar: {
    height: 8,
    backgroundColor: '#0f3460',
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    backgroundColor: '#e94560',
    borderRadius: 4,
  },
  xpText: {
    fontSize: 12,
    color: '#8b8b8b',
    textAlign: 'right',
  },
  feedbackContainer: {
    position: 'absolute',
    top: 140,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(233, 69, 96, 0.9)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    zIndex: 100,
    alignItems: 'center',
  },
  feedbackText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  petContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  moodStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  moodLabel: {
    fontSize: 14,
    color: '#8b8b8b',
  },
  moodValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionsContainer: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    width: '47%',
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  actionLabelDisabled: {
    color: '#555',
  },
  actionStat: {
    fontSize: 12,
    color: '#8b8b8b',
    marginTop: 4,
  },
  actionStatDisabled: {
    color: '#444',
  },
  tipsContainer: {
    marginTop: 24,
    gap: 8,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  tipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213e',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderLeftWidth: 4,
    gap: 10,
  },
  tipText: {
    fontSize: 13,
    color: '#d1d1d1',
    flex: 1,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#16213e',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
  },
  deathIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#0f3460',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  deathEmoji: {
    fontSize: 48,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 16,
    color: '#8b8b8b',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  reviveOptions: {
    width: '100%',
    gap: 12,
  },
  reviveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e94560',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    gap: 16,
  },
  reviveButtonNFT: {
    backgroundColor: '#0f3460',
    borderWidth: 2,
    borderColor: '#ffd700',
  },
  reviveButtonText: {
    flex: 1,
  },
  reviveTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  reviveDesc: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
});
