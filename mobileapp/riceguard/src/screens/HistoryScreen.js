import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, FlatList, Alert, ImageBackground } from 'react-native';
import { fonts } from '../theme/typography';
import Button from '../components/Button';
import { fetchHistory, clearHistory, deleteHistoryByTimestamps } from '../api';

export default function HistoryScreen({ navigation }) {
  const [history, setHistory] = useState([]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(new Set());

  const load = async () => {
    try {
      const data = await fetchHistory();
      setHistory(data.history || []);
    } catch (e) {
      // Show empty if failed to fetch
      setHistory([]);
    }
  };

  useEffect(() => { load(); }, []);

  const visibleHistory = useMemo(() => {
    const q = query.trim().toLowerCase();
    return history.slice().reverse().filter((item) => {
      if (!q) return true;
      const hay = `${item.disease || ''} ${item.recommendation || ''} ${item.timestamp || ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [history, query]);

  const toggleSelect = (ts) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(ts)) next.delete(ts); else next.add(ts);
      return next;
    });
  };

  const toggleSelectAllVisible = () => {
    const allSelected = visibleHistory.length > 0 && visibleHistory.every((it) => selected.has(it.timestamp));
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) visibleHistory.forEach((it) => next.delete(it.timestamp));
      else visibleHistory.forEach((it) => next.add(it.timestamp));
      return next;
    });
  };

  const confirmDeleteSelected = () => {
    const count = selected.size;
    if (count === 0) return;
    Alert.alert('Delete selected', `Delete ${count} selected scan(s)?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          const toDelete = Array.from(selected);
          await deleteHistoryByTimestamps(toDelete);
          setHistory((prev) => prev.filter((it) => !selected.has(it.timestamp)));
          setSelected(new Set());
        }
      }
    ]);
  };

  const confirmDeleteAll = () => {
    if (history.length === 0) return;
    Alert.alert('Delete all', 'This will permanently delete all scans.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete All', style: 'destructive', onPress: async () => {
          await clearHistory();
          setHistory([]);
          setSelected(new Set());
        }
      }
    ]);
  };

  return (
    <ImageBackground source={require('../../assets/bg.png')} resizeMode="cover" style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../../assets/logo.png')} style={styles.headerLogo} />
        <View style={styles.navRow}>
          <TouchableOpacity onPress={() => navigation.replace('Login')}><Text style={styles.navLink}>Log Out</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Scan')}><Text style={styles.navLink}>Scan</Text></TouchableOpacity>
          <Text style={[styles.navLink, styles.navActive]}>History</Text>
        </View>
      </View>

      <View style={styles.toolbar}>
        <Text style={styles.title}>Scan History</Text>
        <View style={styles.controls}>
          <TextInput
            placeholder="Search history..."
            value={query}
            onChangeText={setQuery}
            style={styles.search}
          />
          <TouchableOpacity onPress={toggleSelectAllVisible}><Text style={styles.action}>Select all</Text></TouchableOpacity>
          <TouchableOpacity disabled={selected.size === 0} onPress={confirmDeleteSelected}>
            <Text style={[styles.action, selected.size === 0 && styles.disabled]}>Delete Selected</Text>
          </TouchableOpacity>
          <TouchableOpacity disabled={history.length === 0} onPress={confirmDeleteAll}>
            <Text style={[styles.action, history.length === 0 && styles.disabled]}>Delete All</Text>
          </TouchableOpacity>
        </View>
      </View>

      {history.length === 0 ? (
        <Text style={styles.noHistory}>No history records found.</Text>
      ) : (
        <FlatList
          contentContainerStyle={styles.list}
          data={visibleHistory}
          keyExtractor={(item) => String(item.timestamp)}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <TouchableOpacity onPress={() => toggleSelect(item.timestamp)}>
                  <Text style={styles.checkbox}>{selected.has(item.timestamp) ? '☑' : '☐'}</Text>
                </TouchableOpacity>
              </View>
              {/* If backend serves images over LAN, you can show them with an Image component using the absolute URL */}
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{item.disease}</Text>
                <Text><Text style={styles.bold}>Confidence:</Text> {item.confidence}%</Text>
                <Text><Text style={styles.bold}>Recommendation:</Text> {item.recommendation}</Text>
                <Text><Text style={styles.bold}>Date:</Text> {item.timestamp}</Text>
              </View>
            </View>
          )}
        />
      )}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 54, paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#e5e7eb' },
  headerLogo: { width: 70, height: 70, marginBottom: 8 },
  navRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16 },
  navLink: { marginLeft: 16, color: '#dbcacaff' },
  navActive: { color: '#ffffffff', fontFamily: fonts.bold },
  toolbar: { paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#ffffffff' },
  title: { fontSize: 30, fontFamily: fonts.bold, marginBottom: 20, color:'#fff', textAlign: 'center' },
  controls: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  search: { flexGrow: 1, minWidth: 160, borderWidth: 1, borderColor: '#ffffffff', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginRight: 8 },
  action: { marginLeft: 12, color: '#ffffffff', fontFamily: fonts.semi, marginTop:10 },
  disabled: { color: '#ff1717ff' },
  noHistory: { padding: 24, textAlign: 'center', color: '#e5ecf9ff' },
  list: { padding: 16 },
  card: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12, marginBottom: 12, backgroundColor: '#f9fafb' },
  cardHeader: { flexDirection: 'row', justifyContent: 'flex-end' },
  checkbox: { fontSize: 18 },
  cardBody: { marginTop: 8 },
  cardTitle: { fontSize: 16, fontFamily: fonts.bold, marginBottom: 4 },
  bold: { fontFamily: fonts.bold },
});
