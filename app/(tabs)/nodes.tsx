import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Modal, TextInput } from 'react-native';
import { useFocusEffect } from 'expo-router';

const API_BASE = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';

interface Node {
  id: string;
  name: string;
  type: string;
  host: string;
  port: number;
  group: string;
  delay: number;
  enabled: boolean;
}

export default function NodesScreen() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingNode, setEditingNode] = useState<Node | null>(null);
  const [formData, setFormData] = useState({ name: '', type: 'ss', host: '', port: '', group: 'default' });

  const fetchNodes = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/nodes`);
      const data = await res.json();
      if (data.nodes) setNodes(data.nodes);
    } catch (e) {
      console.error('Fetch nodes error:', e);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchNodes(); }, [fetchNodes]));

  const handleAdd = () => {
    setEditingNode(null);
    setFormData({ name: '', type: 'ss', host: '', port: '', group: 'default' });
    setModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const method = editingNode ? 'PUT' : 'POST';
      const url = editingNode ? `${API_BASE}/api/v1/nodes/${editingNode.id}` : `${API_BASE}/api/v1/nodes`;
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, port: parseInt(formData.port) })
      });
      setModalVisible(false);
      fetchNodes();
    } catch (e) {
      console.error('Save error:', e);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`${API_BASE}/api/v1/nodes/${id}`, { method: 'DELETE' });
      fetchNodes();
    } catch (e) {
      console.error('Delete error:', e);
    }
  };

  const renderNode = ({ item }: { item: Node }) => (
    <View style={styles.nodeCard}>
      <View style={styles.nodeInfo}>
        <Text style={styles.nodeName}>{item.name}</Text>
        <Text style={styles.nodeType}>{item.type.toUpperCase()} | {item.group}</Text>
        <Text style={styles.nodeHost}>{item.host}:{item.port}</Text>
      </View>
      <View style={styles.nodeActions}>
        <View style={[styles.delayBadge, { backgroundColor: item.delay < 200 ? '#00FF88' : item.delay < 500 ? '#FFB800' : '#FF4444' }]}>
          <Text style={styles.delayText}>{item.delay}ms</Text>
        </View>
        <TouchableOpacity onPress={() => { setEditingNode(item); setFormData({ name: item.name, type: item.type, host: item.host, port: item.port.toString(), group: item.group }); setModalVisible(true); }}>
          <Text style={styles.editBtn}>编辑</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id)}>
          <Text style={styles.deleteBtn}>删除</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>节点管理</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <Text style={styles.addButtonText}>+ 添加节点</Text>
        </TouchableOpacity>
      </View>
      <FlatList data={nodes} renderItem={renderNode} keyExtractor={item => item.id} contentContainerStyle={styles.list} />

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingNode ? '编辑节点' : '添加节点'}</Text>
            <TextInput style={styles.input} placeholder="节点名称" value={formData.name} onChangeText={t => setFormData({ ...formData, name: t })} placeholderTextColor="#6B7280" />
            <TextInput style={styles.input} placeholder="服务器地址" value={formData.host} onChangeText={t => setFormData({ ...formData, host: t })} placeholderTextColor="#6B7280" />
            <TextInput style={styles.input} placeholder="端口" value={formData.port} onChangeText={t => setFormData({ ...formData, port: t })} keyboardType="numeric" placeholderTextColor="#6B7280" />
            <TextInput style={styles.input} placeholder="分组" value={formData.group} onChangeText={t => setFormData({ ...formData, group: t })} placeholderTextColor="#6B7280" />
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
  nodeCard: { backgroundColor: '#1a1a2e', borderRadius: 12, padding: 16, marginBottom: 12 },
  nodeInfo: { marginBottom: 12 },
  nodeName: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  nodeType: { color: '#00F0FF', fontSize: 12, marginTop: 4 },
  nodeHost: { color: '#6B7280', fontSize: 12, marginTop: 2 },
  nodeActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  delayBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  delayText: { color: '#0A0A0F', fontSize: 12, fontWeight: '600' },
  editBtn: { color: '#00F0FF', fontSize: 12, marginRight: 12 },
  deleteBtn: { color: '#FF4444', fontSize: 12 },
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
