import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PetSprite } from '../../src/components/pet/PetSprite';
import { PetStats } from '../../src/components/pet/PetStats';
import { PetActions } from '../../src/components/pet/PetActions';
import { usePetStore } from '../../src/stores/petStore';

export default function HomeScreen() {
  const { pet, feed, play, rest } = usePetStore();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.petName}>{pet.name}</Text>
          <Text style={styles.level}>Level {pet.level}</Text>
        </View>

        {/* Pet Display */}
        <View style={styles.petContainer}>
          <PetSprite
            mood={pet.mood}
            type={pet.type}
            skinId={pet.equippedSkin}
          />
        </View>

        {/* Stats */}
        <PetStats
          hunger={pet.hunger}
          energy={pet.energy}
          happiness={pet.happiness}
          health={pet.health}
        />

        {/* Actions */}
        <PetActions
          onFeed={feed}
          onPlay={play}
          onRest={rest}
          canFeed={pet.hunger < 100}
          canPlay={pet.energy > 20}
          canRest={pet.energy < 100}
        />
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
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  petName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  level: {
    fontSize: 16,
    color: '#e94560',
    marginTop: 4,
  },
  petContainer: {
    width: '100%',
    aspectRatio: 1,
    maxWidth: 300,
    marginBottom: 20,
  },
});
