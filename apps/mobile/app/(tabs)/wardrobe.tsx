import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

type TabType = 'skins' | 'environments' | 'accessories';

type Item = {
  id: string;
  name: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  isOwned: boolean;
  isEquipped: boolean;
  isNFT: boolean;
  imageUrl?: string;
};

// Mock data - will come from store later
const MOCK_SKINS: Item[] = [
  { id: 'skin-1', name: 'Classic', rarity: 'common', isOwned: true, isEquipped: true, isNFT: false },
  { id: 'skin-2', name: 'Space Explorer', rarity: 'rare', isOwned: true, isEquipped: false, isNFT: false },
  { id: 'skin-3', name: 'DeFi Wizard', rarity: 'epic', isOwned: false, isEquipped: false, isNFT: true },
  { id: 'skin-4', name: 'Golden Hodler', rarity: 'legendary', isOwned: false, isEquipped: false, isNFT: true },
];

const RARITY_COLORS = {
  common: '#8b8b8b',
  rare: '#3498db',
  epic: '#9b59b6',
  legendary: '#f39c12',
};

export default function WardrobeScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('skins');

  const tabs: { key: TabType; label: string; icon: string }[] = [
    { key: 'skins', label: 'Skins', icon: 'color-palette' },
    { key: 'environments', label: 'Worlds', icon: 'planet' },
    { key: 'accessories', label: 'Items', icon: 'sparkles' },
  ];

  const handleEquip = (itemId: string) => {
    console.log('Equip item:', itemId);
    // TODO: implement equip logic
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Wardrobe</Text>
        <Text style={styles.subtitle}>Customize your pet</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {tabs.map((tab) => (
          <Pressable
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Ionicons
              name={tab.icon as keyof typeof Ionicons.glyphMap}
              size={20}
              color={activeTab === tab.key ? '#e94560' : '#8b8b8b'}
            />
            <Text
              style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Grid */}
      <FlatList
        data={MOCK_SKINS}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <Pressable
            style={[
              styles.itemCard,
              item.isEquipped && styles.itemCardEquipped,
              !item.isOwned && styles.itemCardLocked,
            ]}
            onPress={() => item.isOwned && handleEquip(item.id)}
          >
            {/* Placeholder for item image */}
            <View
              style={[
                styles.itemImage,
                { borderColor: RARITY_COLORS[item.rarity] },
              ]}
            >
              <Ionicons
                name="paw"
                size={40}
                color={item.isOwned ? RARITY_COLORS[item.rarity] : '#444'}
              />
              {item.isNFT && (
                <View style={styles.nftBadge}>
                  <Text style={styles.nftText}>NFT</Text>
                </View>
              )}
            </View>
            <Text style={[styles.itemName, !item.isOwned && styles.textLocked]}>
              {item.name}
            </Text>
            <Text
              style={[
                styles.itemRarity,
                { color: RARITY_COLORS[item.rarity] },
              ]}
            >
              {item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1)}
            </Text>
            {item.isEquipped && (
              <View style={styles.equippedBadge}>
                <Text style={styles.equippedText}>Equipped</Text>
              </View>
            )}
            {!item.isOwned && (
              <View style={styles.lockOverlay}>
                <Ionicons name="lock-closed" size={24} color="#fff" />
              </View>
            )}
          </Pressable>
        )}
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
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#16213e',
    borderRadius: 12,
    gap: 6,
  },
  tabActive: {
    backgroundColor: '#0f3460',
    borderWidth: 1,
    borderColor: '#e94560',
  },
  tabText: {
    fontSize: 13,
    color: '#8b8b8b',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#e94560',
  },
  grid: {
    padding: 20,
    paddingTop: 0,
  },
  row: {
    gap: 16,
  },
  itemCard: {
    flex: 1,
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  itemCardEquipped: {
    borderColor: '#e94560',
  },
  itemCardLocked: {
    opacity: 0.7,
  },
  itemImage: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  nftBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#e94560',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  nftText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  textLocked: {
    color: '#666',
  },
  itemRarity: {
    fontSize: 11,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  equippedBadge: {
    marginTop: 8,
    backgroundColor: '#e94560',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  equippedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
