import React, { useContext, useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { ThemeContext } from '../../contexts/ThemeContext';
import Button from '../common/Button';

/**
 * 提醒表单组件
 * 用于创建和编辑提醒
 * 
 * @param {Object} initialValues - 初始值（编辑模式）
 * @param {Function} onSubmit - 提交回调
 * @param {Function} onCancel - 取消回调
 */
const ReminderForm = ({ initialValues = {}, onSubmit, onCancel }) => {
  const { colors } = useContext(ThemeContext);
  
  // 提醒表单状态
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [time, setTime] = useState('08:00');
  const [useCard, setUseCard] = useState(false);
  const [cardId, setCardId] = useState(null);
  const [isRepeating, setIsRepeating] = useState(false);
  const [repeatType, setRepeatType] = useState('day');
  const [isActive, setIsActive] = useState(true);
  
  // 编辑模式时，使用初始值
  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length > 0) {
      setTitle(initialValues.title || '');
      setMessage(initialValues.message || '');
      setTime(initialValues.time || '08:00');
      setUseCard(!!initialValues.cardId);
      setCardId(initialValues.cardId || null);
      setIsRepeating(!!initialValues.repeatType);
      setRepeatType(initialValues.repeatType || 'day');
      setIsActive(initialValues.isActive !== false);
    }
  }, [initialValues]);
  
  // 选择时间
  const handleTimeSelect = () => {
    // 简化版时间选择
    Alert.alert(
      '选择提醒时间',
      '请选择提醒时间',
      [
        { text: '早上 6:00', onPress: () => setTime('06:00') },
        { text: '早上 8:00', onPress: () => setTime('08:00') },
        { text: '中午 12:00', onPress: () => setTime('12:00') },
        { text: '晚上 19:00', onPress: () => setTime('19:00') },
        { text: '晚上 21:00', onPress: () => setTime('21:00') },
        { text: '取消', style: 'cancel' },
      ]
    );
  };
  
  // 选择重复类型
  const handleRepeatTypeSelect = () => {
    Alert.alert(
      '选择重复类型',
      '请选择提醒重复周期',
      [
        { text: '每天', onPress: () => setRepeatType('day') },
        { text: '每周', onPress: () => setRepeatType('week') },
        { text: '每月', onPress: () => setRepeatType('month') },
        { text: '取消', style: 'cancel' },
      ]
    );
  };
  
  // 处理表单提交
  const handleSubmit = () => {
    // 验证表单
    if (!message.trim()) {
      Alert.alert('提示', '请输入提醒内容');
      return;
    }
    
    // 构建提醒数据
    const reminderData = {
      title: title.trim() || '修行提醒',
      message: message.trim(),
      time,
      isActive,
    };
    
    // 添加卡片ID（如果启用）
    if (useCard && cardId) {
      reminderData.cardId = cardId;
    }
    
    // 添加重复类型（如果启用）
    if (isRepeating) {
      reminderData.repeatType = repeatType;
    }
    
    // 调用提交回调
    onSubmit(reminderData);
  };
  
  // 获取重复类型显示文本
  const getRepeatTypeText = () => {
    switch (repeatType) {
      case 'day':
        return '每天';
      case 'week':
        return '每周';
      case 'month':
        return '每月';
      default:
        return '每天';
    }
  };
  
  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* 标题输入 */}
      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: colors.text }]}>标题（可选）</Text>
        <TextInput
          style={[
            styles.input,
            { 
              borderColor: colors.border,
              color: colors.text,
              backgroundColor: colors.card 
            }
          ]}
          placeholder="输入提醒标题"
          placeholderTextColor={colors.textSecondary}
          value={title}
          onChangeText={setTitle}
        />
      </View>
      
      {/* 内容输入 */}
      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: colors.text }]}>内容</Text>
        <TextInput
          style={[
            styles.input,
            styles.textArea,
            { 
              borderColor: colors.border,
              color: colors.text,
              backgroundColor: colors.card 
            }
          ]}
          placeholder="输入提醒内容"
          placeholderTextColor={colors.textSecondary}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          value={message}
          onChangeText={setMessage}
        />
      </View>
      
      {/* 时间选择 */}
      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: colors.text }]}>提醒时间</Text>
        <TouchableOpacity
          style={[
            styles.selectButton,
            { 
              borderColor: colors.border,
              backgroundColor: colors.card 
            }
          ]}
          onPress={handleTimeSelect}
        >
          <Text style={[styles.selectButtonText, { color: colors.text }]}>
            {time}
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* 重复开关 */}
      <View style={styles.switchContainer}>
        <Text style={[styles.switchLabel, { color: colors.text }]}>重复提醒</Text>
        <Switch
          value={isRepeating}
          onValueChange={setIsRepeating}
          trackColor={{ false: colors.border, true: colors.secondary }}
          thumbColor={isRepeating ? colors.primary : colors.background}
        />
      </View>
      
      {/* 重复类型选择 */}
      {isRepeating && (
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.text }]}>重复类型</Text>
          <TouchableOpacity
            style={[
              styles.selectButton,
              { 
                borderColor: colors.border,
                backgroundColor: colors.card 
              }
            ]}
            onPress={handleRepeatTypeSelect}
          >
            <Text style={[styles.selectButtonText, { color: colors.text }]}>
              {getRepeatTypeText()}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* 使用卡片作为背景开关 */}
      <View style={styles.switchContainer}>
        <Text style={[styles.switchLabel, { color: colors.text }]}>使用卡片作为背景</Text>
        <Switch
          value={useCard}
          onValueChange={setUseCard}
          trackColor={{ false: colors.border, true: colors.secondary }}
          thumbColor={useCard ? colors.primary : colors.background}
        />
      </View>
      
      {/* 卡片选择 */}
      {useCard && (
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.text }]}>选择卡片</Text>
          <TouchableOpacity
            style={[
              styles.selectButton,
              { 
                borderColor: colors.border,
                backgroundColor: colors.card 
              }
            ]}
            onPress={() => {
              // 卡片选择逻辑
              Alert.alert('提示', '卡片选择功能开发中');
            }}
          >
            <Text style={[styles.selectButtonText, { color: colors.text }]}>
              {cardId ? '已选择卡片' : '选择卡片'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* 激活状态开关 */}
      <View style={styles.switchContainer}>
        <Text style={[styles.switchLabel, { color: colors.text }]}>激活</Text>
        <Switch
          value={isActive}
          onValueChange={setIsActive}
          trackColor={{ false: colors.border, true: colors.secondary }}
          thumbColor={isActive ? colors.primary : colors.background}
        />
      </View>
      
      {/* 按钮区域 */}
      <View style={styles.buttonContainer}>
        <Button 
          title="取消" 
          type="outline" 
          onPress={onCancel}
          style={styles.button}
        />
        <Button 
          title="保存" 
          type="primary" 
          onPress={handleSubmit}
          style={styles.button}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
  },
  selectButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  selectButtonText: {
    fontSize: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
});

export default ReminderForm;
