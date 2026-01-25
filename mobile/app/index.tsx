import { View, Text, StyleSheet } from 'react-native';
import { useStore } from '../src/store';

export default function Home() {
  const store = useStore();
  const deviceId = store.getValue('deviceId') as string;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>DND Book</Text>
      <Text style={styles.subtitle}>Campaign Management</Text>
      <View style={styles.status}>
        <Text style={styles.statusText}>Phase 2 Complete</Text>
        <Text style={styles.statusDetail}>Store + Persistence + P2P Sync</Text>
        <Text style={styles.deviceId}>Device: {deviceId?.slice(0, 8)}...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1f2937',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#9ca3af',
    marginBottom: 40,
  },
  status: {
    backgroundColor: '#374151',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10b981',
    marginBottom: 4,
  },
  statusDetail: {
    fontSize: 14,
    color: '#9ca3af',
  },
  deviceId: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
    fontFamily: 'monospace',
  },
});
