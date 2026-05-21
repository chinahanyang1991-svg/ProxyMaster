import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const [darkMode, setDarkMode] = useState(true);
  const [autoStart, setAutoStart] = useState(false);
  const [udpForward, setUdpForward] = useState(true);
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [tunMode, setTunMode] = useState(false);

  const handleBackup = async () => {
    try {
      const data = { darkMode, autoStart, udpForward, autoUpdate, tunMode };
      await AsyncStorage.setItem('backup', JSON.stringify(data));
      Alert.alert('成功', '配置已备份');
    } catch (e) {
      Alert.alert('错误', '备份失败');
    }
  };

  const handleRestore = async () => {
    try {
      const data = await AsyncStorage.getItem('backup');
      if (data) {
        const parsed = JSON.parse(data);
        setDarkMode(parsed.darkMode);
        setAutoStart(parsed.autoStart);
        setUdpForward(parsed.udpForward);
        setAutoUpdate(parsed.autoUpdate);
        setTunMode(parsed.tunMode);
        Alert.alert('成功', '配置已恢复');
      } else {
        Alert.alert('提示', '没有找到备份');
      }
    } catch (e) {
      Alert.alert('错误', '恢复失败');
    }
  };

  const handleClearCache = () => {
    Alert.alert('确认', '确定清除缓存？', [
      { text: '取消', style: 'cancel' },
      { text: '确定', onPress: () => Alert.alert('成功', '缓存已清除') }
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>设置</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>显示设置</Text>
        <View style={styles.settingItem}>
          <View>
            <Text style={styles.settingLabel}>暗黑模式</Text>
            <Text style={styles.settingDesc}>使用深色主题界面</Text>
          </View>
          <Switch value={darkMode} onValueChange={setDarkMode} trackColor={{ false: '#374151', true: '#00F0FF' }} thumbColor="#FFFFFF" />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>系统设置</Text>
        <View style={styles.settingItem}>
          <View>
            <Text style={styles.settingLabel}>开机自启</Text>
            <Text style={styles.settingDesc}>应用启动时自动连接</Text>
          </View>
          <Switch value={autoStart} onValueChange={setAutoStart} trackColor={{ false: '#374151', true: '#00F0FF' }} thumbColor="#FFFFFF" />
        </View>
        <View style={styles.settingItem}>
          <View>
            <Text style={styles.settingLabel}>TUN 模式</Text>
            <Text style={styles.settingDesc}>系统级代理（需重启）</Text>
          </View>
          <Switch value={tunMode} onValueChange={setTunMode} trackColor={{ false: '#374151', true: '#00F0FF' }} thumbColor="#FFFFFF" />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>网络设置</Text>
        <View style={styles.settingItem}>
          <View>
            <Text style={styles.settingLabel}>UDP 转发</Text>
            <Text style={styles.settingDesc}>支持 UDP 流量转发</Text>
          </View>
          <Switch value={udpForward} onValueChange={setUdpForward} trackColor={{ false: '#374151', true: '#00F0FF' }} thumbColor="#FFFFFF" />
        </View>
        <View style={styles.settingItem}>
          <View>
            <Text style={styles.settingLabel}>自动更新订阅</Text>
            <Text style={styles.settingDesc}>定时检查并更新订阅</Text>
          </View>
          <Switch value={autoUpdate} onValueChange={setAutoUpdate} trackColor={{ false: '#374151', true: '#00F0FF' }} thumbColor="#FFFFFF" />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>数据管理</Text>
        <TouchableOpacity style={styles.actionBtn} onPress={handleBackup}>
          <Text style={styles.actionBtnText}>备份配置</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={handleRestore}>
          <Text style={styles.actionBtnText}>恢复配置</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, { borderColor: '#FF4444' }]} onPress={handleClearCache}>
          <Text style={[styles.actionBtnText, { color: '#FF4444' }]}>清除缓存</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>关于</Text>
        <View style={styles.aboutItem}>
          <Text style={styles.aboutLabel}>版本</Text>
          <Text style={styles.aboutValue}>1.0.0</Text>
        </View>
        <View style={styles.aboutItem}>
          <Text style={styles.aboutLabel}>构建</Text>
          <Text style={styles.aboutValue}>2024.05.21</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F' },
  header: { padding: 20, paddingTop: 60 },
  title: { color: '#FFFFFF', fontSize: 24, fontWeight: '700' },
  section: { marginHorizontal: 20, marginBottom: 24 },
  sectionTitle: { color: '#00F0FF', fontSize: 14, fontWeight: '600', marginBottom: 12 },
  settingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1a1a2e', padding: 16, borderRadius: 12, marginBottom: 8 },
  settingLabel: { color: '#FFFFFF', fontSize: 15, fontWeight: '500' },
  settingDesc: { color: '#6B7280', fontSize: 12, marginTop: 2 },
  actionBtn: { backgroundColor: '#1a1a2e', padding: 16, borderRadius: 12, marginBottom: 8, alignItems: 'center', borderWidth: 1, borderColor: '#00F0FF' },
  actionBtnText: { color: '#00F0FF', fontSize: 15, fontWeight: '600' },
  aboutItem: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#1a1a2e', padding: 16, borderRadius: 12, marginBottom: 8 },
  aboutLabel: { color: '#6B7280', fontSize: 14 },
  aboutValue: { color: '#FFFFFF', fontSize: 14 }
});
