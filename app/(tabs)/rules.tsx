import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, Switch, StyleSheet, SectionList } from 'react-native';
import { useFocusEffect } from 'expo-router';

const API_BASE = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';

interface Rule {
  id: string;
  name: string;
  type: string;
  pattern: string;
  action: 'proxy' | 'direct' | 'reject';
  enabled: boolean;
  category: string;
}

const SECTIONS = [
  {
    title: '学术资源',
    data: [
      { id: '1', name: 'Google Scholar', type: 'domain', pattern: 'scholar.google.com', action: 'proxy', category: 'academic' },
      { id: '2', name: 'IEEE Xplore', type: 'domain', pattern: 'ieeexplore.ieee.org', action: 'proxy', category: 'academic' },
      { id: '3', name: 'ScienceDirect', type: 'domain', pattern: 'sciencedirect.com', action: 'proxy', category: 'academic' },
      { id: '4', name: 'PubMed', type: 'domain', pattern: 'pubmed.ncbi.nlm.nih.gov', action: 'proxy', category: 'academic' },
      { id: '5', name: 'arXiv', type: 'domain', pattern: 'arxiv.org', action: 'proxy', category: 'academic' },
      { id: '6', name: 'Web of Science', type: 'domain', pattern: 'webofscience.com', action: 'proxy', category: 'academic' },
      { id: '7', name: 'Springer', type: 'domain', pattern: 'springer.com', action: 'proxy', category: 'academic' },
      { id: '8', name: 'Nature', type: 'domain', pattern: 'nature.com', action: 'proxy', category: 'academic' },
    ]
  },
  {
    title: 'AI 工具',
    data: [
      { id: '9', name: 'OpenAI', type: 'domain', pattern: 'openai.com', action: 'proxy', category: 'ai' },
      { id: '10', name: 'Claude', type: 'domain', pattern: 'anthropic.com', action: 'proxy', category: 'ai' },
      { id: '11', name: 'Gemini', type: 'domain', pattern: 'gemini.google.com', action: 'proxy', category: 'ai' },
      { id: '12', name: 'Perplexity', type: 'domain', pattern: 'perplexity.ai', action: 'proxy', category: 'ai' },
      { id: '13', name: 'GitHub Copilot', type: 'domain', pattern: 'github.com', action: 'proxy', category: 'ai' },
    ]
  },
  {
    title: '国内网站直连',
    data: [
      { id: '14', name: '百度', type: 'domain', pattern: 'baidu.com', action: 'direct', category: 'china' },
      { id: '15', name: '腾讯', type: 'domain', pattern: 'qq.com', action: 'direct', category: 'china' },
      { id: '16', name: '阿里巴巴', type: 'domain', pattern: 'alibaba.com', action: 'direct', category: 'china' },
      { id: '17', name: '京东', type: 'domain', pattern: 'jd.com', action: 'direct', category: 'china' },
      { id: '18', name: '淘宝', type: 'domain', pattern: 'taobao.com', action: 'direct', category: 'china' },
      { id: '19', name: 'Bilibili', type: 'domain', pattern: 'bilibili.com', action: 'direct', category: 'china' },
      { id: '20', name: '微信', type: 'domain', pattern: 'weixin.qq.com', action: 'direct', category: 'china' },
    ]
  }
];

export default function RulesScreen() {
  const [enabledRules, setEnabledRules] = useState<Set<string>>(new Set(SECTIONS.flatMap(s => s.data).map(r => r.id)));
  const [mode, setMode] = useState<'rule' | 'global'>('rule');

  const toggleRule = (id: string) => {
    const newSet = new Set(enabledRules);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setEnabledRules(newSet);
  };

  const enableAll = () => {
    setEnabledRules(new Set(SECTIONS.flatMap(s => s.data).map(r => r.id)));
  };

  const disableAll = () => {
    setEnabledRules(new Set());
  };

  const renderRule = ({ item }: { item: any }) => (
    <View style={styles.ruleCard}>
      <View style={styles.ruleInfo}>
        <Text style={styles.ruleName}>{item.name}</Text>
        <Text style={styles.rulePattern}>{item.pattern}</Text>
      </View>
      <View style={styles.ruleActions}>
        <View style={[styles.actionBadge, { backgroundColor: item.action === 'proxy' ? '#BF00FF' : item.action === 'direct' ? '#00FF88' : '#FF4444' }]}>
          <Text style={styles.actionText}>{item.action === 'proxy' ? '代理' : item.action === 'direct' ? '直连' : '拒绝'}</Text>
        </View>
        <Switch
          value={enabledRules.has(item.id)}
          onValueChange={() => toggleRule(item.id)}
          trackColor={{ false: '#374151', true: '#00F0FF' }}
          thumbColor="#FFFFFF"
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>规则配置</Text>
      </View>

      <View style={styles.modeSelector}>
        <TouchableOpacity style={[styles.modeBtn, mode === 'rule' && styles.modeBtnActive]} onPress={() => setMode('rule')}>
          <Text style={[styles.modeBtnText, mode === 'rule' && styles.modeBtnTextActive]}>规则模式</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.modeBtn, mode === 'global' && styles.modeBtnActive]} onPress={() => setMode('global')}>
          <Text style={[styles.modeBtnText, mode === 'global' && styles.modeBtnTextActive]}>全局模式</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickBtn} onPress={enableAll}>
          <Text style={styles.quickBtnText}>全部启用</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.quickBtn, { borderColor: '#FF4444' }]} onPress={disableAll}>
          <Text style={[styles.quickBtnText, { color: '#FF4444' }]}>全部禁用</Text>
        </TouchableOpacity>
      </View>

      <SectionList
        sections={SECTIONS}
        keyExtractor={item => item.id}
        renderItem={renderRule}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
          </View>
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F' },
  header: { padding: 20, paddingTop: 60 },
  title: { color: '#FFFFFF', fontSize: 24, fontWeight: '700' },
  modeSelector: { flexDirection: 'row', marginHorizontal: 20, backgroundColor: '#1a1a2e', borderRadius: 12, padding: 4, marginBottom: 16 },
  modeBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  modeBtnActive: { backgroundColor: '#00F0FF' },
  modeBtnText: { color: '#9CA3AF', fontWeight: '600' },
  modeBtnTextActive: { color: '#0A0A0F' },
  quickActions: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 16 },
  quickBtn: { flex: 1, paddingVertical: 10, borderWidth: 1, borderColor: '#00F00F', borderRadius: 8, alignItems: 'center', marginHorizontal: 4 },
  quickBtnText: { color: '#00F0FF', fontWeight: '600' },
  list: { paddingHorizontal: 20, paddingBottom: 100 },
  sectionHeader: { backgroundColor: '#0A0A0F', paddingVertical: 12 },
  sectionTitle: { color: '#00F0FF', fontSize: 14, fontWeight: '600' },
  ruleCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1a1a2e', padding: 12, borderRadius: 10, marginBottom: 8 },
  ruleInfo: { flex: 1 },
  ruleName: { color: '#FFFFFF', fontSize: 14, fontWeight: '500' },
  rulePattern: { color: '#6B7280', fontSize: 11, marginTop: 2 },
  ruleActions: { flexDirection: 'row', alignItems: 'center' },
  actionBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, marginRight: 12 },
  actionText: { color: '#0A0A0F', fontSize: 10, fontWeight: '600' }
});
