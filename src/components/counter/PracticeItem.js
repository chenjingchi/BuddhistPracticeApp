import React, { useContext } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ThemeContext } from '../../contexts/ThemeContext';

const PracticeItem = ({ 
  practice, 
  todayCount, 
  onIncrement, 
  onDecrement, 
  onComplete,
  onEdit,
  onDelete
}) => {
  const { colors } = useContext(ThemeContext);
  
  // 计算进度
  const dailyProgress = (todayCount / practice.dailyTarget) * 100;
  const totalProgress = (practice.completed / practice.totalTarget) * 100;
  
  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={styles.header}>
        <Text style={[styles.name, { color: colors.text }]}>
          {practice.name}
        </Text>
        
        <View style={styles.headerRight}>
          <Text style={[styles.count, { color: colors.primary }]}>
            {todayCount}/{practice.dailyTarget}
          </Text>
          
          <TouchableOpacity 
            style={styles.editButton}
            onPress={onEdit}
          >
            <Text style={[styles.editText, { color: colors.textSecondary }]}>编辑</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* 每日进度 */}
      <View style={[styles.progressBg, { backgroundColor: colors.background }]}>
        <View 
          style={[
            styles.progressBar, 
            { 
              backgroundColor: colors.primary,
              width: `${Math.min(100, dailyProgress)}%`,
            }
          ]}
        />
      </View>
      
      {/* 总进度 */}
      <View style={styles.totalProgress}>
        <Text style={[styles.totalText, { color: colors.textSecondary }]}>
          总目标: {practice.completed.toLocaleString()}/{practice.totalTarget.toLocaleString()} 
          ({Math.round(totalProgress)}%)
        </Text>
      </View>
      
      {/* 操作按钮 */}
      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.background }]}
          onPress={onDecrement}
        >
          <Text style={[styles.actionText, { color: colors.text }]}>-1</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={onIncrement}
        >
          <Text style={[styles.actionText, { color: colors.background }]}>+1</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.background }]}
          onPress={onComplete}
        >
          <Text style={[styles.actionText, { color: colors.text }]}>完成今日</Text>
        </TouchableOpacity>
      </View>
      
      {/* 删除按钮 */}
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={onDelete}
      >
        <Text style={[styles.deleteText, { color: colors.error }]}>删除</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  count: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  editButton: {
    padding: 4,
  },
  editText: {
    fontSize: 12,
  },
  progressBg: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  totalProgress: {
    marginBottom: 12,
  },
  totalText: {
    fontSize: 12,
    textAlign: 'right',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  actionText: {
    fontWeight: 'bold',
  },
  deleteButton: {
    alignSelf: 'flex-end',
    padding: 8,
  },
  deleteText: {
    fontSize: 12,
  },
});

export default PracticeItem;
