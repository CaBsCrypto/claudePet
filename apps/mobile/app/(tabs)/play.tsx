import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useGameStore } from '../../src/stores/gameStore';

type Game = {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  maxPlaysPerDay: number;
  available: boolean;
};

const GAMES: Game[] = [
  {
    id: 'crypto-quiz',
    name: 'Crypto Quiz',
    description: 'Test your knowledge with rapid-fire questions',
    icon: 'help-circle',
    xpReward: 30,
    maxPlaysPerDay: 3,
    available: true,
  },
  {
    id: 'trading-sim',
    name: 'Trading Simulator',
    description: 'Practice trading with fake tokens',
    icon: 'trending-up',
    xpReward: 20,
    maxPlaysPerDay: 5,
    available: false,
  },
  {
    id: 'crypto-2048',
    name: 'Crypto 2048',
    description: 'Merge tokens to reach the moon!',
    icon: 'grid',
    xpReward: 15,
    maxPlaysPerDay: 10,
    available: false,
  },
];

export default function PlayScreen() {
  const router = useRouter();
  const { getTodayPlays, getHighScore } = useGameStore();

  const handleGamePress = (gameId: string) => {
    router.push(`/game/${gameId}` as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Play</Text>
        <Text style={styles.subtitle}>Have fun and earn XP!</Text>
      </View>

      <FlatList
        data={GAMES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const playsToday = getTodayPlays(item.id);
          const canPlay = item.available && playsToday < item.maxPlaysPerDay;
          const highScore = getHighScore(item.id);

          return (
            <Pressable
              style={[styles.gameCard, (!canPlay || !item.available) && styles.gameCardDisabled]}
              onPress={() => canPlay && handleGamePress(item.id)}
              disabled={!canPlay}
            >
              <View style={styles.gameIcon}>
                <Ionicons
                  name={item.icon as keyof typeof Ionicons.glyphMap}
                  size={36}
                  color={canPlay ? '#e94560' : '#666'}
                />
              </View>
              <View style={styles.gameInfo}>
                <Text style={[styles.gameName, !canPlay && styles.textDisabled]}>
                  {item.name}
                  {!item.available && ' (Coming Soon)'}
                </Text>
                <Text style={[styles.gameDesc, !canPlay && styles.textDisabled]}>
                  {item.description}
                </Text>
                <View style={styles.gameStats}>
                  <View style={styles.statBadge}>
                    <Ionicons name="star" size={12} color="#ffd700" />
                    <Text style={styles.statText}>+{item.xpReward} XP</Text>
                  </View>
                  {item.available ? (
                    <Text style={styles.playsText}>
                      {playsToday}/{item.maxPlaysPerDay} plays today
                    </Text>
                  ) : (
                    <Text style={styles.playsText}>Locked</Text>
                  )}
                  {highScore > 0 && (
                    <View style={styles.highScoreBadge}>
                      <Ionicons name="trophy" size={12} color="#ffd700" />
                      <Text style={styles.highScoreText}>{highScore}</Text>
                    </View>
                  )}
                </View>
              </View>
              <Ionicons
                name={item.available ? "chevron-forward" : "lock-closed"}
                size={24}
                color={canPlay ? '#8b8b8b' : '#444'}
              />
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#8b8b8b',
    marginTop: 4,
  },
  list: {
    padding: 20,
    paddingTop: 10,
  },
  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  gameCardDisabled: {
    opacity: 0.5,
  },
  gameIcon: {
    width: 70,
    height: 70,
    borderRadius: 14,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  gameInfo: {
    flex: 1,
  },
  gameName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  gameDesc: {
    fontSize: 13,
    color: '#8b8b8b',
    marginTop: 4,
  },
  textDisabled: {
    color: '#666',
  },
  gameStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 12,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f3460',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#ffd700',
    fontWeight: '600',
  },
  playsText: {
    fontSize: 12,
    color: '#8b8b8b',
  },
  highScoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  highScoreText: {
    fontSize: 12,
    color: '#ffd700',
    fontWeight: '600',
  },
});
