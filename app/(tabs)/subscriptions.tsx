import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Modal, TextInput, Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';

const API_BASE = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';

interface Subscription {
  id: string;
  name: string;
  url: string;
  type: string;
  autoUpdate: boolean;
  lastUpdate: string;
  nodeCount: number;
  enabled: boolean;
}

export default function SubscriptionsScreen() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({ name: '', url: '', type: 'clash', autoUpdate: true });

  const fetchSubscriptions = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/subscriptions`);
      const data = await res.json();
      if (data.subscriptions) setSubscriptions(data.subscriptions);
    } catch (e) {
      console.error('Fetch error:', e);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchSubscriptions(); }, [fetchSubscriptions]));

  const handleAdd = () => {
    setFormData({ name: '', url: '', type: 'clash', autoUpdate: true });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.url) {
      Alert.alert('错误', '请填写完整信息');
      return;
    }
    try {
      await fetch(`${API_BASE}/api/v1/subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      setModalVisible(false);
      fetchSubscriptions();
    } catch (e) {
      console.error('Save error:', e);
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      await fetch(`${API_BASE}/api/v1/subscription/${id}/update`, { method: 'POST' });
      Alert.alert('成功', '订阅已更新');
      fetchSubscriptions();
    } catch (e) {
      Alert.alert('错误', '更新失败');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`${API_BASE}/api/v1/subscription/${id}`, { method: 'DELETE' });
      fetchSubscriptions();
    } catch (e) {
      console.error('Delete error:', e);
    }
  };

  const renderItem = ({ item }: { item: Subscription }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardType}>{item.type.toUpperCase()} | {item.nodeCount} 节点</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: item.enabled ? '#00FF88' : '#FF4444' }]}>
          <Text style={styles.badgeText}>{item.enabled ? '已启用' : '已禁用'}</Text>
        </View>
      </View>
      <Text style={styles.cardUrl} numberOfLines={1}>{item.url}</Text>
      <Text style={styles.cardMeta}>上次更新: {item.lastUpdate || '从未更新'}</Text>
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.updateBtn} onPress={() => handleUpdate(item.id)}>
          <Text style={styles.updateBtnText}>立即更新</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
          <Text style={styles.deleteBtnText}>删除</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>订阅管理</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <Text style={styles.addButtonText}>+ 添加订阅</Text>
        </TouchableOpacity>
      </View>
      <FlatList data={subscriptions} renderItem={renderItem} keyExtractor={item => item.id} contentContainerStyle={styles.list} />

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>添加订阅</Text>
            <TextInput style={styles.input} placeholder="订阅名称" value={formData.name} onChangeText={t => setFormData({ ...formData, name: t })} placeholderTextColor="#6B7280" />
            <TextInput style={styles.input} placeholder="订阅链接" value={formData.url} onChangeText={t => setFormData({ ...formData, url: t })} autoCapitalize="none" placeholderTextColor="#6B7280" />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}><Text style={styles.cancelBtnText}>取消</Text></TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}><Text style={styles.saveBtnText}>保存</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 60 },
  title: { color: '#FFFFFF', fontSize: 24, fontWeight: '700' },
  addButton: { backgroundColor: '#00F0FF', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  addButtonText: { color: '#0A0A0F', fontWeight: '600' },
  list: { padding: 20 },
  card: { backgroundColor: '#1a1a2e', borderRadius: 12, padding: 16, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  cardTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  cardType: { color: '#00F0FF', fontSize: 12, marginTop: 4 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  badgeText: { color: '#0A0A0F', fontSize: 10, fontWeight: '600' },
  cardUrl: { color: '#6B7280', fontSize: 12, marginBottom: 8 },
  cardMeta: { color: '#9CA3AF', fontSize: 11, marginBottom: 12 },
  cardActions: { flexDirection: 'row', justifyContent: 'space-between' },
  updateBtn: { flex: 1, backgroundColor: '#00F0FF', padding: 10, borderRadius: 8, marginRight: 8, alignItems: 'center' },
  updateBtnText: { color: '#0A0A0F', fontWeight: '600' },
  deleteBtn: { flex: 1, borderWidth: 1, borderColor: '#FF4444', padding: 10, borderRadius: 8, alignItems: 'center' },
  deleteBtnText: { color: '#FF4444', fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#1a1a2e', borderRadius: 16, padding: 24 },
  modalTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '700', marginBottom: 20, textAlign: 'center' },
  input: { backgroundColor: '#0A0A0F', color: '#FFFFFF', padding: 12, borderRadius: 8, marginBottom: 12 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  cancelBtn: { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#374151', marginRight: 8 },
  cancelBtnText: { color: '#9CA3AF', textAlign: 'center' },
  saveBtn: { flex: 1, padding: 12, borderRadius: 8, backgroundColor: '#00F0FF', marginLeft: 8 },
  saveBtnText: { color: '#0A0A0F', textAlign: 'center', fontWeight: '600' }
});
