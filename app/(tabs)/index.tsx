import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, StyleSheet, RefreshControl } from 'react-native';
import { useFocusEffect } from 'expo-router';

const API_BASE = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';

export default function HomeScreen() {
  const [connected, setConnected] = useState(false);
  const [mode, setMode] = useState<'proxy' | 'direct' | 'global'>('proxy');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [traffic, setTraffic] = useState({ up: 0, down: 0 });
  const [nodes, setNodes] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [nodesRes, trafficRes] = await Promise.all([
        fetch(`${API_BASE}/api/v1/nodes`).then(r => r.json()),
        fetch(`${API_BASE}/api/v1/connections/traffic`).then(r => r.json())
      ]);
      if (nodesRes.nodes) {
        setNodes(nodesRes.nodes);
        if (!selectedNode && nodesRes.nodes.length > 0) {
          setSelectedNode(nodesRes.nodes[0].id);
        }
      }
      if (trafficRes.data) {
        setTraffic(trafficRes.data);
      }
    } catch (e) {
      console.error('Fetch error:', e);
    }
  }, [selectedNode]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const toggleConnection = () => {
    setConnected(!connected);
  };

  const changeMode = (newMode: 'proxy' | 'direct' | 'global') => {
    setMode(newMode);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00F0FF" />}>
      <View style={styles.header}>
        <View style={styles.statusIndicator}>
          <View style={[styles.statusDot, { backgroundColor: connected ? '#00FF88' : '#FF4444' }]} />
          <Text style={styles.statusText}>{connected ? '已连接' : '未连接'}</Text>
        </View>
        <TouchableOpacity style={[styles.powerButton, { backgroundColor: connected ? '#FF4444' : '#00F0FF' }]} onPress={toggleConnection}>
          <Text style={styles.powerIcon}>{connected ? '⏻' : '⏻'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.modeSelector}>
        {(['proxy', 'direct', 'global'] as const).map((m) => (
          <TouchableOpacity
            key={m}
            style={[styles.modeButton, mode === m && styles.modeButtonActive]}
            onPress={() => changeMode(m)}
          >
            <Text style={[styles.modeText, mode === m && styles.modeTextActive]}>
              {m === 'proxy' ? '代理' : m === 'direct' ? '直连' : '全局'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedNode && (
        <View style={styles.nodeInfo}>
          <Text style={styles.nodeLabel}>当前节点</Text>
          <Text style={styles.nodeName}>
            {nodes.find(n => n.id === selectedNode)?.name || '未选择'}
          </Text>
        </View>
      )}

      <View style={styles.trafficCard}>
        <Text style={styles.cardTitle}>实时流量</Text>
        <View style={styles.trafficRow}>
          <View style={styles.trafficItem}>
            <Text style={styles.trafficIcon}>↑</Text>
            <Text style={styles.trafficValue}>{formatBytes(traffic.up)}</Text>
            <Text style={styles.trafficLabel}>上传</Text>
          </View>
          <View style={styles.trafficDivider} />
          <View style={styles.trafficItem}>
            <Text style={styles.trafficIcon}>↓</Text>
            <Text style={styles.trafficValue}>{formatBytes(traffic.down)}</Text>
            <Text style={styles.trafficLabel}>下载</Text>
          </View>
        </View>
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.cardTitle}>快速操作</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionButton}><Text style={styles.actionText}>测延迟</Text></TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}><Text style={styles.actionText}>切换节点</Text></TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}><Text style={styles.actionText}>分享</Text></TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 60 },
  statusIndicator: { flexDirection: 'row', alignItems: 'center' },
  statusDot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  statusText: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
  powerButton: { width: 70, height: 70, borderRadius: 35, justifyContent: 'center', alignItems: 'center', shadowColor: '#00F0FF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 10 },
  powerIcon: { fontSize: 30, color: '#0A0A0F' },
  modeSelector: { flexDirection: 'row', justifyContent: 'center', marginHorizontal: 20, marginBottom: 20, backgroundColor: '#1a1a2e', borderRadius: 12, padding: 4 },
  modeButton: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  modeButtonActive: { backgroundColor: '#00F0FF' },
  modeText: { color: '#9CA3AF', fontWeight: '600' },
  modeTextActive: { color: '#0A0A0F' },
  nodeInfo: { backgroundColor: '#1a1a2e', marginHorizontal: 20, padding: 16, borderRadius: 12, marginBottom: 20 },
  nodeLabel: { color: '#6B7280', fontSize: 12, marginBottom: 4 },
  nodeName: { color: '#00F0FF', fontSize: 16, fontWeight: '600' },
  trafficCard: { backgroundColor: '#1a1a2e', marginHorizontal: 20, padding: 16, borderRadius: 12, marginBottom: 20 },
  cardTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginBottom: 16 },
  trafficRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  trafficItem: { alignItems: 'center' },
  trafficIcon: { fontSize: 24, color: '#00F0FF', marginBottom: 4 },
  trafficValue: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
  trafficLabel: { color: '#6B7280', fontSize: 12, marginTop: 4 },
  trafficDivider: { width: 1, height: 50, backgroundColor: '#374151' },
  quickActions: { backgroundColor: '#1a1a2e', marginHorizontal: 20, padding: 16, borderRadius: 12, marginBottom: 100 },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  actionButton: { flex: 1, backgroundColor: '#0A0A0F', padding: 12, borderRadius: 8, marginHorizontal: 4, alignItems: 'center' },
  actionText: { color: '#00F0FF', fontSize: 12, fontWeight: '600' }
});
