import { format } from 'date-fns';
import React, { useContext, useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import PracticeItem from '../components/counter/PracticeItem';
import { AppContext } from '../contexts/AppContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { generateUniqueId } from '../utils/idUtils';

const CounterScreen = ({ navigation, route }) => {
  const { practices, records, addItem, updateItem, removeItem, updateData } = useContext(AppContext);
  const { colors } = useContext(ThemeContext);
  
  // 状态管理
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingPractice, setEditingPractice] = useState(null);
  const [practiceName, setPracticeName] = useState('');
  const [totalTarget, setTotalTarget] = useState('');
  const [dailyTarget, setDailyTarget] = useState('');
  
  // 获取今日日期
  const today = format(new Date(), 'yyyy-MM-dd');
  
  // 处理路由参数
  useEffect(() => {
    if (route.params?.action === 'add') {
      openAddModal();
    }
    
    if (route.params?.practiceId) {
      const practice = practices.find(p => p.id === route.params.practiceId);
      if (practice) {
        // 滚动到指定的练习项目
      }
    }
  }, [route.params]);
  
  // 今日记录
  const getTodayCount = (practiceId) => {
    return records
      .filter(record => record.date === today && record.practiceId === practiceId)
      .reduce((sum, record) => sum + record.count, 0);
  };
  
  // 打开添加模态框
  const openAddModal = () => {
    setEditMode(false);
    setEditingPractice(null);
    setPracticeName('');
    setTotalTarget('');
    setDailyTarget('');
    setModalVisible(true);
  };
  
  // 打开编辑模态框
  const openEditModal = (practice) => {
    setEditMode(true);
    setEditingPractice(practice);
    setPracticeName(practice.name);
    setTotalTarget(practice.totalTarget.toString());
    setDailyTarget(practice.dailyTarget.toString());
    setModalVisible(true);
  };
  
  // 保存练习
  const savePractice = () => {
    if (!practiceName.trim()) {
      Alert.alert('提示', '请输入念诵名称');
      return;
    }
    
    if (!totalTarget || isNaN(parseInt(totalTarget)) || parseInt(totalTarget) <= 0) {
      Alert.alert('提示', '请输入有效的总目标数');
      return;
    }
    
    if (!dailyTarget || isNaN(parseInt(dailyTarget)) || parseInt(dailyTarget) <= 0) {
      Alert.alert('提示', '请输入有效的每日目标数');
      return;
    }
    
    const practiceData = {
      name: practiceName.trim(),
      totalTarget: parseInt(totalTarget),
      dailyTarget: parseInt(dailyTarget),
    };
    
    if (editMode && editingPractice) {
      // 更新现有练习
      updateItem('practices', editingPractice.id, practiceData);
      Alert.alert('成功', '修改已保存');
    } else {
      // 创建新练习
      const newPractice = {
        id: generateUniqueId(),
        ...practiceData,
        completed: 0,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      };
      
      addItem('practices', newPractice);
      Alert.alert('成功', '已添加新的念诵项目');
    }
    
    setModalVisible(false);
  };
  
  // 删除练习
  const deletePractice = (id) => {
    Alert.alert(
      '确认删除',
      '确定要删除这个念诵项目吗？\n所有相关记录也将被删除。',
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '删除', 
          style: 'destructive',
          onPress: () => {
            // 删除练习和相关记录
            removeItem('practices', id);
            
            // 过滤出需要保留的记录
            const updatedRecords = records.filter(record => record.practiceId !== id);
            updateData('records', updatedRecords);
            
            Alert.alert('成功', '念诵项目已删除');
          }
        }
      ]
    );
  };
  
  // 增加计数
  const incrementCount = (practiceId) => {
    // 查找练习
    const practice = practices.find(p => p.id === practiceId);
    if (!practice) return;
    
    // 创建新记录
    const newRecord = {
      id: generateUniqueId(),
      practiceId,
      date: today,
      count: 1,
      timestamp: new Date().toISOString(),
    };
    
    // 添加记录
    addItem('records', newRecord);
    
    // 更新练习完成数
    updateItem('practices', practiceId, {
      completed: practice.completed + 1,
      lastUpdated: new Date().toISOString(),
    });
  };
  
  // 减少计数
  const decrementCount = (practiceId) => {
    // 查找练习
    const practice = practices.find(p => p.id === practiceId);
    if (!practice) return;
    
    // 获取今日记录
    const todayRecords = records.filter(
      record => record.date === today && record.practiceId === practiceId
    );
    
    if (todayRecords.length === 0) return;
    
    // 按时间排序，找到最新的记录
    todayRecords.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const latestRecord = todayRecords[0];
    
    // 删除最新记录
    removeItem('records', latestRecord.id);
    
    // 更新练习完成数
    if (practice.completed > 0) {
      updateItem('practices', practiceId, {
        completed: practice.completed - 1,
        lastUpdated: new Date().toISOString(),
      });
    }
  };
  
  // 完成今日目标
  const completeDaily = (practiceId) => {
    // 查找练习
    const practice = practices.find(p => p.id === practiceId);
    if (!practice) return;
    
    // 获取今日已完成数量
    const todayCount = getTodayCount(practiceId);
    
    // 计算需要添加的数量
    const remaining = practice.dailyTarget - todayCount;
    
    if (remaining <= 0) {
      Alert.alert('提示', '今日目标已完成');
      return;
    }
    
    // 创建新记录
    const newRecord = {
      id: generateUniqueId(),
      practiceId,
      date: today,
      count: remaining,
      timestamp: new Date().toISOString(),
    };
    
    // 添加记录
    addItem('records', newRecord);
    
    // 更新练习完成数
    updateItem('practices', practiceId, {
      completed: practice.completed + remaining,
      lastUpdated: new Date().toISOString(),
    });
    
    Alert.alert('成功', '已完成今日目标');
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
      >
        {/* 念诵项目列表 */}
        {practices.length > 0 ? (
          practices.map(practice => {
            const todayCount = getTodayCount(practice.id);
            return (
              <PracticeItem 
                key={practice.id}
                practice={practice}
                todayCount={todayCount}
                onIncrement={() => incrementCount(practice.id)}
                onDecrement={() => decrementCount(practice.id)}
                onComplete={() => completeDaily(practice.id)}
                onEdit={() => openEditModal(practice)}
                onDelete={() => deletePractice(practice.id)}
              />
            );
          })
        ) : (
          <View style={[styles.emptyState, { borderColor: colors.border }]}>
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
              暂无念诵项目
            </Text>
            <Text style={[styles.emptyStateDesc, { color: colors.textSecondary }]}>
              点击下方按钮添加念诵项目
            </Text>
          </View>
        )}
        
        {/* 添加按钮 */}
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={openAddModal}
        >
          <Text style={[styles.addButtonText, { color: colors.background }]}>
            + 添加念诵项目
          </Text>
        </TouchableOpacity>
      </ScrollView>
      
      {/* 添加/编辑模态框 */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {editMode ? '编辑念诵项目' : '添加念诵项目'}
            </Text>
            
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>念诵名称</Text>
              <TextInput 
                style={[
                  styles.textInput, 
                  { 
                    borderColor: colors.border,
                    color: colors.text,
                    backgroundColor: colors.background 
                  }
                ]}
                value={practiceName}
                onChangeText={setPracticeName}
                placeholder="如：大悲咒、心经..."
                placeholderTextColor={colors.textSecondary}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>总目标数量</Text>
              <TextInput 
                style={[
                  styles.textInput, 
                  { 
                    borderColor: colors.border,
                    color: colors.text,
                    backgroundColor: colors.background 
                  }
                ]}
                value={totalTarget}
                onChangeText={setTotalTarget}
                placeholder="如：10000"
                placeholderTextColor={colors.textSecondary}
                keyboardType="number-pad"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>每日目标数量</Text>
              <TextInput 
                style={[
                  styles.textInput, 
                  { 
                    borderColor: colors.border,
                    color: colors.text,
                    backgroundColor: colors.background 
                  }
                ]}
                value={dailyTarget}
                onChangeText={setDailyTarget}
                placeholder="如：21"
                placeholderTextColor={colors.textSecondary}
                keyboardType="number-pad"
              />
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.cancelButton, { borderColor: colors.border }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.cancelButtonText, { color: colors.text }]}>取消</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.saveButton, { backgroundColor: colors.primary }]}
                onPress={savePractice}
              >
                <Text style={[styles.saveButtonText, { color: colors.background }]}>保存</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  emptyState: {
    padding: 24,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyStateDesc: {
    textAlign: 'center',
  },
  addButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  addButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    fontWeight: 'bold',
  },
  saveButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  saveButtonText: {
    fontWeight: 'bold',
  },
});

export default CounterScreen;