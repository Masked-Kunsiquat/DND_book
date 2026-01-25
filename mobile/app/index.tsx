import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>DND Book</Text>
      <Text style={styles.subtitle}>Campaign Management</Text>
      <View style={styles.status}>
        <Text style={styles.statusText}>Phase 1 Complete</Text>
        <Text style={styles.statusDetail}>Expo Router configured</Text>
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
});
