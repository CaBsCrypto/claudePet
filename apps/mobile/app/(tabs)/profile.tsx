import { View, Text, StyleSheet, ScrollView, Pressable, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { usePetStore } from '../../src/stores/petStore';
import { useModulesStore } from '../../src/stores/modulesStore';
import { useGameStore } from '../../src/stores/gameStore';
import { useWalletStore } from '../../src/stores/walletStore';

const XP_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500];

// Achievement definitions
const ACHIEVEMENTS = [
  { id: 'first-lesson', name: 'First Steps', desc: 'Complete your first lesson', icon: 'book', requirement: 'lesson' },
  { id: 'first-quiz', name: 'Quiz Taker', desc: 'Pass your first quiz', icon: 'checkmark-circle', requirement: 'quiz' },
  { id: 'first-badge', name: 'Badge Collector', desc: 'Earn your first badge', icon: 'ribbon', requirement: 'badge' },
  { id: 'quiz-master', name: 'Quiz Master', desc: 'Score 100% on any quiz', icon: 'trophy', requirement: 'perfect-quiz' },
  { id: 'game-player', name: 'Gamer', desc: 'Play your first minigame', icon: 'game-controller', requirement: 'game' },
  { id: 'high-scorer', name: 'High Scorer', desc: 'Score over 1000 in Crypto Quiz', icon: 'star', requirement: 'high-score' },
  { id: 'combo-king', name: 'Combo King', desc: 'Get a 5x combo in quiz', icon: 'flash', requirement: 'combo' },
  { id: 'pet-carer', name: 'Pet Lover', desc: 'Keep your pet happy for 3 days', icon: 'heart', requirement: 'pet-care' },
  { id: 'level-5', name: 'Rising Star', desc: 'Reach level 5', icon: 'trending-up', requirement: 'level-5' },
  { id: 'level-10', name: 'Expert', desc: 'Reach level 10', icon: 'medal', requirement: 'level-10' },
  { id: 'all-modules', name: 'Scholar', desc: 'Complete all learning modules', icon: 'school', requirement: 'all-modules' },
  { id: 'streak-7', name: 'Dedicated', desc: 'Maintain a 7-day streak', icon: 'flame', requirement: 'streak-7' },
];

export default function ProfileScreen() {
  const { pet } = usePetStore();
  const { modules, progress: moduleProgress } = useModulesStore();
  const { sessions, highScores, leaderboard } = useGameStore();
  const { address, isConnected, network } = useWalletStore();

  const [showBadgesModal, setShowBadgesModal] = useState(false);
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);

  // Calculate stats
  const currentLevelXP = XP_THRESHOLDS[pet.level - 1] || 0;
  const nextLevelXP = XP_THRESHOLDS[pet.level] || XP_THRESHOLDS[XP_THRESHOLDS.length - 1];
  const xpProgress = ((pet.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

  // Count badges earned
  const badgesEarned = moduleProgress.filter(p => p.badgeMinted).length;
  const totalBadges = modules.length;

  // Calculate achievements
  const earnedAchievements = calculateEarnedAchievements();

  // Game stats
  const totalGamesPlayed = sessions.length;
  const quizHighScore = highScores['crypto-quiz'] || 0;
  const totalXPFromGames = sessions.reduce((sum, s) => sum + s.xpEarned, 0);

  function calculateEarnedAchievements(): string[] {
    const earned: string[] = [];

    // First lesson
    if (moduleProgress.some(p => p.lessonsCompleted.length > 0)) {
      earned.push('first-lesson');
    }

    // First quiz passed
    if (moduleProgress.some(p => p.quizScore !== null && p.quizScore >= 70)) {
      earned.push('first-quiz');
    }

    // First badge
    if (badgesEarned > 0) {
      earned.push('first-badge');
    }

    // Perfect quiz
    if (moduleProgress.some(p => p.quizScore === 100)) {
      earned.push('quiz-master');
    }

    // Played a game
    if (sessions.length > 0) {
      earned.push('game-player');
    }

    // High score > 1000
    if (quizHighScore >= 1000) {
      earned.push('high-scorer');
    }

    // Combo 5x
    if (sessions.some(s => s.details?.maxCombo >= 5)) {
      earned.push('combo-king');
    }

    // Level 5
    if (pet.level >= 5) {
      earned.push('level-5');
    }

    // Level 10
    if (pet.level >= 10) {
      earned.push('level-10');
    }

    // All modules completed
    if (badgesEarned >= totalBadges && totalBadges > 0) {
      earned.push('all-modules');
    }

    return earned;
  }

  // Format wallet address
  const formatAddress = (addr: string) => {
    if (!addr) return 'Not connected';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header with Pet Info */}
        <View style={styles.header}>
          <View style={styles.petAvatar}>
            <Text style={styles.petEmoji}>
              {pet.type === 'dog' ? '🐕' : pet.type === 'cat' ? '🐱' : pet.type === 'dragon' ? '🐉' : '🤖'}
            </Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.petName}>{pet.name}</Text>
            <View style={styles.levelBadge}>
              <Ionicons name="star" size={14} color="#ffd700" />
              <Text style={styles.levelText}>Level {pet.level}</Text>
            </View>
          </View>
        </View>

        {/* XP Progress */}
        <View style={styles.xpCard}>
          <View style={styles.xpHeader}>
            <Text style={styles.xpLabel}>Experience Points</Text>
            <Text style={styles.xpValue}>{pet.xp} XP</Text>
          </View>
          <View style={styles.xpBar}>
            <View style={[styles.xpFill, { width: `${Math.min(xpProgress, 100)}%` }]} />
          </View>
          <Text style={styles.xpSubtext}>
            {nextLevelXP - pet.xp} XP to Level {pet.level + 1}
          </Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          <Pressable style={styles.statCard} onPress={() => setShowBadgesModal(true)}>
            <Ionicons name="ribbon" size={28} color="#e94560" />
            <Text style={styles.statValue}>{badgesEarned}/{totalBadges}</Text>
            <Text style={styles.statLabel}>Badges</Text>
          </Pressable>

          <Pressable style={styles.statCard} onPress={() => setShowAchievementsModal(true)}>
            <Ionicons name="trophy" size={28} color="#ffd700" />
            <Text style={styles.statValue}>{earnedAchievements.length}/{ACHIEVEMENTS.length}</Text>
            <Text style={styles.statLabel}>Achievements</Text>
          </Pressable>

          <Pressable style={styles.statCard} onPress={() => setShowStatsModal(true)}>
            <Ionicons name="game-controller" size={28} color="#3498db" />
            <Text style={styles.statValue}>{totalGamesPlayed}</Text>
            <Text style={styles.statLabel}>Games</Text>
          </Pressable>
        </View>

        {/* Wallet Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Wallet</Text>
          <View style={styles.walletCard}>
            <View style={styles.walletIcon}>
              <Ionicons name="wallet" size={24} color={isConnected ? '#2ecc71' : '#8b8b8b'} />
            </View>
            <View style={styles.walletInfo}>
              <Text style={styles.walletAddress}>
                {isConnected && address ? formatAddress(address) : 'No wallet connected'}
              </Text>
              {isConnected && (
                <View style={styles.networkBadge}>
                  <View style={[styles.networkDot, { backgroundColor: '#2ecc71' }]} />
                  <Text style={styles.networkText}>{network || 'Stellar Testnet'}</Text>
                </View>
              )}
            </View>
            <Pressable style={styles.walletButton}>
              <Text style={styles.walletButtonText}>
                {isConnected ? 'Manage' : 'Connect'}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Recent Achievements */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Achievements</Text>
            <Pressable onPress={() => setShowAchievementsModal(true)}>
              <Text style={styles.seeAllText}>See All</Text>
            </Pressable>
          </View>
          <View style={styles.achievementsList}>
            {earnedAchievements.length > 0 ? (
              earnedAchievements.slice(0, 3).map(id => {
                const achievement = ACHIEVEMENTS.find(a => a.id === id);
                if (!achievement) return null;
                return (
                  <View key={id} style={styles.achievementItem}>
                    <View style={styles.achievementIcon}>
                      <Ionicons
                        name={achievement.icon as keyof typeof Ionicons.glyphMap}
                        size={20}
                        color="#ffd700"
                      />
                    </View>
                    <View style={styles.achievementInfo}>
                      <Text style={styles.achievementName}>{achievement.name}</Text>
                      <Text style={styles.achievementDesc}>{achievement.desc}</Text>
                    </View>
                    <Ionicons name="checkmark-circle" size={20} color="#4ade80" />
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="trophy-outline" size={32} color="#444" />
                <Text style={styles.emptyText}>Complete tasks to earn achievements!</Text>
              </View>
            )}
          </View>
        </View>

        {/* Leaderboard Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quiz Leaderboard</Text>
          <View style={styles.leaderboardCard}>
            {leaderboard.slice(0, 5).map((entry, index) => (
              <View key={index} style={styles.leaderboardItem}>
                <Text style={[
                  styles.leaderboardRank,
                  index === 0 && styles.rankGold,
                  index === 1 && styles.rankSilver,
                  index === 2 && styles.rankBronze,
                ]}>
                  #{index + 1}
                </Text>
                <Text style={styles.leaderboardName}>{entry.name}</Text>
                <Text style={styles.leaderboardScore}>{entry.score}</Text>
              </View>
            ))}
            {quizHighScore > 0 && (
              <View style={styles.yourScore}>
                <Text style={styles.yourScoreLabel}>Your Best</Text>
                <Text style={styles.yourScoreValue}>{quizHighScore}</Text>
              </View>
            )}
          </View>
        </View>

        <Text style={styles.version}>CryptoPet v0.1.0 (MVP)</Text>
      </ScrollView>

      {/* Badges Modal */}
      <Modal
        visible={showBadgesModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowBadgesModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Your Badges</Text>
              <Pressable onPress={() => setShowBadgesModal(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </Pressable>
            </View>
            <ScrollView style={styles.modalScroll}>
              <View style={styles.badgesGrid}>
                {modules.map(module => {
                  const prog = moduleProgress.find(p => p.moduleId === module.id);
                  const earned = prog?.badgeMinted;
                  return (
                    <View key={module.id} style={styles.badgeItem}>
                      <View style={[styles.badgeIcon, !earned && styles.badgeIconLocked]}>
                        <Ionicons
                          name={module.icon as keyof typeof Ionicons.glyphMap}
                          size={32}
                          color={earned ? '#ffd700' : '#444'}
                        />
                      </View>
                      <Text style={[styles.badgeName, !earned && styles.badgeNameLocked]}>
                        {module.name}
                      </Text>
                      <Text style={styles.badgeStatus}>
                        {earned ? 'Earned' : 'Locked'}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Achievements Modal */}
      <Modal
        visible={showAchievementsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAchievementsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Achievements</Text>
              <Pressable onPress={() => setShowAchievementsModal(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </Pressable>
            </View>
            <ScrollView style={styles.modalScroll}>
              {ACHIEVEMENTS.map(achievement => {
                const earned = earnedAchievements.includes(achievement.id);
                return (
                  <View key={achievement.id} style={[styles.achievementRow, !earned && styles.achievementRowLocked]}>
                    <View style={[styles.achievementIconLarge, !earned && styles.achievementIconLocked]}>
                      <Ionicons
                        name={achievement.icon as keyof typeof Ionicons.glyphMap}
                        size={24}
                        color={earned ? '#ffd700' : '#555'}
                      />
                    </View>
                    <View style={styles.achievementDetails}>
                      <Text style={[styles.achievementTitle, !earned && styles.textLocked]}>
                        {achievement.name}
                      </Text>
                      <Text style={[styles.achievementDescLarge, !earned && styles.textLocked]}>
                        {achievement.desc}
                      </Text>
                    </View>
                    {earned ? (
                      <Ionicons name="checkmark-circle" size={24} color="#4ade80" />
                    ) : (
                      <Ionicons name="lock-closed" size={20} color="#555" />
                    )}
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Game Stats Modal */}
      <Modal
        visible={showStatsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowStatsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Game Statistics</Text>
              <Pressable onPress={() => setShowStatsModal(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </Pressable>
            </View>
            <ScrollView style={styles.modalScroll}>
              <View style={styles.statsSection}>
                <Text style={styles.statsSectionTitle}>Crypto Quiz</Text>
                <View style={styles.statsRow}>
                  <Text style={styles.statsLabel}>High Score</Text>
                  <Text style={styles.statsValue}>{quizHighScore}</Text>
                </View>
                <View style={styles.statsRow}>
                  <Text style={styles.statsLabel}>Games Played</Text>
                  <Text style={styles.statsValue}>
                    {sessions.filter(s => s.gameType === 'crypto-quiz').length}
                  </Text>
                </View>
                <View style={styles.statsRow}>
                  <Text style={styles.statsLabel}>Total XP Earned</Text>
                  <Text style={styles.statsValue}>{totalXPFromGames}</Text>
                </View>
                <View style={styles.statsRow}>
                  <Text style={styles.statsLabel}>Best Accuracy</Text>
                  <Text style={styles.statsValue}>
                    {Math.max(...sessions.filter(s => s.gameType === 'crypto-quiz').map(s => s.details?.accuracy || 0), 0)}%
                  </Text>
                </View>
                <View style={styles.statsRow}>
                  <Text style={styles.statsLabel}>Best Combo</Text>
                  <Text style={styles.statsValue}>
                    x{Math.max(...sessions.filter(s => s.gameType === 'crypto-quiz').map(s => s.details?.maxCombo || 0), 0)}
                  </Text>
                </View>
              </View>

              <View style={styles.statsSection}>
                <Text style={styles.statsSectionTitle}>Learning Progress</Text>
                <View style={styles.statsRow}>
                  <Text style={styles.statsLabel}>Lessons Completed</Text>
                  <Text style={styles.statsValue}>
                    {moduleProgress.reduce((sum, p) => sum + p.lessonsCompleted.length, 0)}
                  </Text>
                </View>
                <View style={styles.statsRow}>
                  <Text style={styles.statsLabel}>Quizzes Passed</Text>
                  <Text style={styles.statsValue}>
                    {moduleProgress.filter(p => p.quizScore !== null && p.quizScore >= 70).length}
                  </Text>
                </View>
                <View style={styles.statsRow}>
                  <Text style={styles.statsLabel}>Badges Earned</Text>
                  <Text style={styles.statsValue}>{badgesEarned}</Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  petAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#16213e',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#e94560',
    marginRight: 16,
  },
  petEmoji: {
    fontSize: 36,
  },
  headerInfo: {
    flex: 1,
  },
  petName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213e',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 6,
    gap: 4,
  },
  levelText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffd700',
  },
  xpCard: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  xpLabel: {
    fontSize: 14,
    color: '#8b8b8b',
  },
  xpValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e94560',
  },
  xpBar: {
    height: 10,
    backgroundColor: '#0f3460',
    borderRadius: 5,
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    backgroundColor: '#e94560',
    borderRadius: 5,
  },
  xpSubtext: {
    fontSize: 12,
    color: '#8b8b8b',
    marginTop: 8,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#8b8b8b',
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    color: '#e94560',
  },
  walletCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  walletIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#0f3460',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  walletInfo: {
    flex: 1,
  },
  walletAddress: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  networkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  networkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  networkText: {
    fontSize: 12,
    color: '#8b8b8b',
  },
  walletButton: {
    backgroundColor: '#0f3460',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  walletButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e94560',
  },
  achievementsList: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#0f3460',
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  achievementDesc: {
    fontSize: 12,
    color: '#8b8b8b',
    marginTop: 2,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
    textAlign: 'center',
  },
  leaderboardCard: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#0f3460',
  },
  leaderboardRank: {
    width: 32,
    fontSize: 14,
    fontWeight: '600',
    color: '#8b8b8b',
  },
  rankGold: {
    color: '#ffd700',
  },
  rankSilver: {
    color: '#c0c0c0',
  },
  rankBronze: {
    color: '#cd7f32',
  },
  leaderboardName: {
    flex: 1,
    fontSize: 15,
    color: '#fff',
  },
  leaderboardScore: {
    fontSize: 15,
    fontWeight: '600',
    color: '#e94560',
  },
  yourScore: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: '#e94560',
  },
  yourScoreLabel: {
    fontSize: 14,
    color: '#e94560',
    fontWeight: '600',
  },
  yourScoreValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: '#444',
    marginTop: 20,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1a1a2e',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#0f3460',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalScroll: {
    padding: 20,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  badgeItem: {
    width: '30%',
    alignItems: 'center',
  },
  badgeIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffd700',
    marginBottom: 8,
  },
  badgeIconLocked: {
    backgroundColor: '#16213e',
    borderColor: '#333',
  },
  badgeName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  badgeNameLocked: {
    color: '#666',
  },
  badgeStatus: {
    fontSize: 10,
    color: '#8b8b8b',
    marginTop: 2,
  },
  achievementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  achievementRowLocked: {
    opacity: 0.6,
  },
  achievementIconLarge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  achievementIconLocked: {
    backgroundColor: '#0f3460',
  },
  achievementDetails: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  achievementDescLarge: {
    fontSize: 13,
    color: '#8b8b8b',
    marginTop: 2,
  },
  textLocked: {
    color: '#555',
  },
  statsSection: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  statsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e94560',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#0f3460',
  },
  statsLabel: {
    fontSize: 14,
    color: '#8b8b8b',
  },
  statsValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
