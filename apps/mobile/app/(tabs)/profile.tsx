import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const router = useRouter();

  // Mock data - will come from stores
  const user = {
    address: '0x1234...5678',
    network: 'Stellar Testnet',
    level: 3,
    xp: 450,
    xpToNextLevel: 600,
    badges: 2,
    totalBadges: 10,
    streak: 5,
  };

  const menuItems = [
    { id: 'wallet', label: 'Wallet', icon: 'wallet', onPress: () => {} },
    { id: 'badges', label: 'Badges', icon: 'ribbon', onPress: () => {} },
    { id: 'achievements', label: 'Achievements', icon: 'trophy', onPress: () => {} },
    { id: 'settings', label: 'Settings', icon: 'settings', onPress: () => {} },
    { id: 'help', label: 'Help & FAQ', icon: 'help-circle', onPress: () => {} },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        {/* Wallet Card */}
        <View style={styles.walletCard}>
          <View style={styles.walletHeader}>
            <View style={styles.walletIcon}>
              <Ionicons name="wallet" size={24} color="#e94560" />
            </View>
            <View style={styles.walletInfo}>
              <Text style={styles.walletAddress}>{user.address}</Text>
              <View style={styles.networkBadge}>
                <View style={styles.networkDot} />
                <Text style={styles.networkText}>{user.network}</Text>
              </View>
            </View>
          </View>
          <Pressable style={styles.connectButton}>
            <Text style={styles.connectButtonText}>Manage Wallet</Text>
          </Pressable>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{user.level}</Text>
            <Text style={styles.statLabel}>Level</Text>
            <View style={styles.xpBar}>
              <View
                style={[
                  styles.xpFill,
                  { width: `${(user.xp / user.xpToNextLevel) * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.xpText}>
              {user.xp}/{user.xpToNextLevel} XP
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{user.badges}</Text>
            <Text style={styles.statLabel}>Badges</Text>
            <Text style={styles.statSubtext}>of {user.totalBadges} total</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.streakIcon}>
              <Ionicons name="flame" size={20} color="#f39c12" />
            </View>
            <Text style={styles.statValue}>{user.streak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
        </View>

        {/* Menu */}
        <View style={styles.menu}>
          {menuItems.map((item) => (
            <Pressable
              key={item.id}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuItemIcon}>
                <Ionicons
                  name={item.icon as keyof typeof Ionicons.glyphMap}
                  size={22}
                  color="#e94560"
                />
              </View>
              <Text style={styles.menuItemText}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={20} color="#8b8b8b" />
            </Pressable>
          ))}
        </View>

        {/* Version */}
        <Text style={styles.version}>CryptoPet v0.1.0</Text>
      </ScrollView>
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
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  walletCard: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  walletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  walletIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  walletInfo: {
    flex: 1,
  },
  walletAddress: {
    fontSize: 16,
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
    backgroundColor: '#2ecc71',
    marginRight: 6,
  },
  networkText: {
    fontSize: 13,
    color: '#8b8b8b',
  },
  connectButton: {
    backgroundColor: '#0f3460',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  connectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e94560',
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
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: '#8b8b8b',
    marginTop: 2,
  },
  statSubtext: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
  },
  xpBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#0f3460',
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    backgroundColor: '#e94560',
    borderRadius: 2,
  },
  xpText: {
    fontSize: 10,
    color: '#8b8b8b',
    marginTop: 4,
  },
  streakIcon: {
    marginBottom: 4,
  },
  menu: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#0f3460',
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#0f3460',
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: '#666',
  },
});
