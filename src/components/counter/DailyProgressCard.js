import React, { useContext } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ThemeContext } from '../../contexts/ThemeContext';

/**
 * 每日进度卡片组件
 * 用于显示每日修行进度
 * 
 * @param {Object} practice - 修行项目数据
 * @param {Function} onPress - 点击事件处理函数
 */
const DailyProgressCard = ({ practice, onPress }) => {
  const { colors } = useContext(ThemeContext);
  
  // 计算进度百分比
  const progressPercent = (practice.todayCount / practice.dailyTarget) * 100;
  
  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: colors.card }]}
      onPress={onPress}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          {practice.name}
        </Text>
        <Text style={[styles.count, { color: colors.primary }]}>
          {practice.todayCount}/{practice.dailyTarget}
        </Text>
      </View>
      
      <View style={[styles.progressBg, { backgroundColor: colors.background }]}>
        <View 
          style={[
            styles.progressBar, 
            { 
              backgroundColor: colors.primary,
              width: `${Math.min(100, progressPercent)}%`
            }
          ]} 
        />
      </View>
      
      <View style={styles.footer}>
        <Text style={[styles.totalText, { color: colors.textSecondary }]}>
          总进度: {practice.completed}/{practice.totalTarget}
        </Text>
        <Text style={[styles.percentText, { color: colors.secondary }]}>
          {Math.round((practice.completed/practice.totalTarget) * 100)}%
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  count: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressBg: {
    height: 6,
    borderRadius: 3,
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalText: {
    fontSize: 12,
  },
  percentText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default DailyProgressCard;
