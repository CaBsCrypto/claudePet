import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type Game = {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  playsToday: number;
  maxPlaysPerDay: number;
};

const GAMES: Game[] = [
  {
    id: 'crypto-quiz',
    name: 'Crypto Quiz',
    description: 'Test your knowledge with rapid-fire questions',
    icon: 'help-circle',
    xpReward: 30,
    playsToday: 0,
    maxPlaysPerDay: 3,
  },
  {
    id: 'trading-sim',
    name: 'Trading Simulator',
    description: 'Practice trading with fake tokens',
    icon: 'trending-up',
    xpReward: 20,
    playsToday: 0,
    maxPlaysPerDay: 5,
  },
  {
    id: 'crypto-2048',
    name: 'Crypto 2048',
    description: 'Merge tokens to reach the moon!',
    icon: 'grid',
    xpReward: 15,
    playsToday: 0,
    maxPlaysPerDay: 10,
  },
];

export default function PlayScreen() {
  const router = useRouter();

  const handleGamePress = (gameId: string) => {
    router.push(`/game/${gameId}`);
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
          const canPlay = item.playsToday < item.maxPlaysPerDay;

          return (
            <Pressable
              style={[styles.gameCard, !canPlay && styles.gameCardDisabled]}
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
                </Text>
                <Text style={[styles.gameDesc, !canPlay && styles.textDisabled]}>
                  {item.description}
                </Text>
                <View style={styles.gameStats}>
                  <View style={styles.statBadge}>
                    <Ionicons name="star" size={12} color="#ffd700" />
                    <Text style={styles.statText}>+{item.xpReward} XP</Text>
                  </View>
                  <Text style={styles.playsText}>
                    {item.playsToday}/{item.maxPlaysPerDay} plays today
                  </Text>
                </View>
              </View>
              <Ionicons
                name="chevron-forward"
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
});
