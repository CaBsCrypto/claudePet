import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useModulesStore } from '../../src/stores/modulesStore';

export default function LearnScreen() {
  const router = useRouter();
  const { modules, getModuleProgress } = useModulesStore();

  const handleModulePress = (moduleId: string) => {
    router.push(`/module/${moduleId}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Learn</Text>
        <Text style={styles.subtitle}>Master crypto one lesson at a time</Text>
      </View>

      <FlatList
        data={modules}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const progress = getModuleProgress(item.id);
          const isLocked = item.requiredLevel > 1; // TODO: check user level

          return (
            <Pressable
              style={[styles.moduleCard, isLocked && styles.moduleCardLocked]}
              onPress={() => !isLocked && handleModulePress(item.id)}
              disabled={isLocked}
            >
              <View style={styles.moduleIcon}>
                <Ionicons
                  name={item.icon as keyof typeof Ionicons.glyphMap}
                  size={32}
                  color={isLocked ? '#666' : '#e94560'}
                />
              </View>
              <View style={styles.moduleInfo}>
                <Text style={[styles.moduleName, isLocked && styles.textLocked]}>
                  {item.name}
                </Text>
                <Text style={[styles.moduleDesc, isLocked && styles.textLocked]}>
                  {item.description}
                </Text>
                <View style={styles.progressBar}>
                  <View
                    style={[styles.progressFill, { width: `${progress}%` }]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {progress}% complete
                </Text>
              </View>
              {isLocked && (
                <View style={styles.lockBadge}>
                  <Ionicons name="lock-closed" size={16} color="#fff" />
                </View>
              )}
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
  moduleCard: {
    flexDirection: 'row',
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  moduleCardLocked: {
    opacity: 0.6,
  },
  moduleIcon: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  moduleInfo: {
    flex: 1,
  },
  moduleName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  moduleDesc: {
    fontSize: 13,
    color: '#8b8b8b',
    marginTop: 4,
  },
  textLocked: {
    color: '#666',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#0f3460',
    borderRadius: 2,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#e94560',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 11,
    color: '#8b8b8b',
    marginTop: 4,
  },
  lockBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#e94560',
    borderRadius: 12,
    padding: 4,
  },
});
