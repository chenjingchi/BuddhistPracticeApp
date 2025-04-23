import React, { useContext, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { AppContext } from '../contexts/AppContext';
import { ThemeContext } from '../contexts/ThemeContext';
import notificationService from '../services/notification';
import sharingService from '../services/sharing';
import storageService from '../services/storage';

/**
 * 设置屏幕
 * 提供应用设置管理界面
 */
const Settings = ({ navigation }) => {
  const { settings, updateSettings, clearAllData } = useContext(AppContext);
  const { theme, colors, toggleTheme } = useContext(ThemeContext);
  
  // 状态管理
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('');
  const [backupPassword, setBackupPassword] = useState('');
  
  // 打开导出备份模态框
  const openExportModal = () => {
    setModalType('export');
    setBackupPassword('');
    setModalVisible(true);
  };
  
  // 打开导入备份模态框
  const openImportModal = () => {
    setModalType('import');
    setBackupPassword('');
    setModalVisible(true);
  };
  
  // 导出数据备份
  const exportBackup = async () => {
    try {
      setIsLoading(true);
      
      // 获取所有数据
      const allData = await storageService.getAllData();
      
      // 可以在这里加入加密逻辑
      // 如果有设置密码的话
      
      // 将数据转为JSON字符串
      const backupJson = JSON.stringify(allData);
      
      // 导出备份
      await sharingService.exportBackup(backupJson);
      
      setIsLoading(false);
      setModalVisible(false);
    } catch (error) {
      setIsLoading(false);
      console.error('导出备份失败:', error);
      Alert.alert('错误', '导出备份失败，请重试');
    }
  };
  
  // 导入数据备份
  const importBackup = async () => {
    // 这里应该有从文件选择器获取备份文件的逻辑
    // 然后解析并导入数据
    // 由于React Native不直接支持文件选择，这个功能需要特定的库支持
    
    Alert.alert(
      '功能开发中',
      '导入备份功能正在开发中，请等待后续版本更新。'
    );
    
    setModalVisible(false);
  };
  
  // 清除所有数据
  const handleClearData = () => {
    Alert.alert(
      '确认清除数据',
      '此操作将清除所有应用数据，包括修行记录、教言卡片和设置。此操作不可撤销！',
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '清除', 
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              
              // 清除所有数据
              await storageService.clearAllData();
              
              // 重置应用状态
              clearAllData();
              
              setIsLoading(false);
              
              Alert.alert('成功', '所有数据已清除');
            } catch (error) {
              setIsLoading(false);
              console.error('清除数据失败:', error);
              Alert.alert('错误', '清除数据失败，请重试');
            }
          }
        }
      ]
    );
  };
  
  // 更新通知设置
  const handleNotificationToggle = (value) => {
    updateSettings({ dailyNotification: value });
    
    if (value) {
      // 开启通知
      notificationService.requestPermissions();
    } else {
      // 关闭通知
      notificationService.cancelAllNotifications();
    }
  };
  
  // 设置通知时间
  const handleNotificationTimeChange = (time) => {
    updateSettings({ notificationTime: time });
    
    // 重新设置通知
    if (settings.dailyNotification) {
      // 取消现有通知
      notificationService.cancelAllNotifications();
      
      // 设置新的提醒
      // 这里应该有重新设置所有提醒的逻辑
    }
  };
  
  // 渲染模态框内容
  const renderModalContent = () => {
    if (modalType === 'export') {
      return (
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>导出数据备份</Text>
          
          <Text style={[styles.modalText, { color: colors.textSecondary }]}>
            导出的备份文件将包含所有应用数据，包括修行记录、教言卡片和设置。
          </Text>
          
          <TextInput 
            style={[
              styles.passwordInput, 
              { 
                borderColor: colors.border,
                color: colors.text,
                backgroundColor: colors.background 
              }
            ]}
            placeholder="设置备份密码（可选）"
            placeholderTextColor={colors.textSecondary}
            value={backupPassword}
            onChangeText={setBackupPassword}
            secureTextEntry
          />
          
          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={[styles.cancelButton, { borderColor: colors.border }]}
              onPress={() => setModalVisible(false)}
              disabled={isLoading}
            >
              <Text style={[styles.buttonText, { color: colors.text }]}>取消</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={exportBackup}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={colors.background} />
              ) : (
                <Text style={[styles.buttonText, { color: colors.background }]}>导出</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      );
    } else if (modalType === 'import') {
      return (
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>导入数据备份</Text>
          
          <Text style={[styles.modalText, { color: colors.textSecondary }]}>
            导入备份将覆盖当前的所有应用数据。请确保备份文件的有效性。
          </Text>
          
          <TextInput 
            style={[
              styles.passwordInput, 
              { 
                borderColor: colors.border,
                color: colors.text,
                backgroundColor: colors.background 
              }
            ]}
            placeholder="输入备份密码（如果有）"
            placeholderTextColor={colors.textSecondary}
            value={backupPassword}
            onChangeText={setBackupPassword}
            secureTextEntry
          />
          
          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={[styles.cancelButton, { borderColor: colors.border }]}
              onPress={() => setModalVisible(false)}
              disabled={isLoading}
            >
              <Text style={[styles.buttonText, { color: colors.text }]}>取消</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={importBackup}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={colors.background} />
              ) : (
                <Text style={[styles.buttonText, { color: colors.background }]}>导入</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    
    return null;
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollContainer}>
        {/* 主题设置 */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>外观</Text>
          
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>暗色模式</Text>
            <Switch
              value={theme === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.secondary }}
              thumbColor={theme === 'dark' ? colors.primary : colors.background}
            />
          </View>
        </View>
        
        {/* 通知设置 */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>通知</Text>
          
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>每日提醒</Text>
            <Switch
              value={settings.dailyNotification}
              onValueChange={handleNotificationToggle}
              trackColor={{ false: colors.border, true: colors.secondary }}
              thumbColor={settings.dailyNotification ? colors.primary : colors.background}
            />
          </View>
          
          {settings.dailyNotification && (
            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>提醒时间</Text>
              <TouchableOpacity
                style={[styles.timeButton, { backgroundColor: colors.background }]}
                onPress={() => {
                  // 这里应该有时间选择器
                  // 简化为几个预设时间
                  Alert.alert(
                    '选择提醒时间',
                    '请选择每日提醒时间',
                    [
                      { text: '早上 6:00', onPress: () => handleNotificationTimeChange('06:00') },
                      { text: '早上 8:00', onPress: () => handleNotificationTimeChange('08:00') },
                      { text: '中午 12:00', onPress: () => handleNotificationTimeChange('12:00') },
                      { text: '晚上 19:00', onPress: () => handleNotificationTimeChange('19:00') },
                      { text: '晚上 21:00', onPress: () => handleNotificationTimeChange('21:00') },
                      { text: '取消', style: 'cancel' },
                    ]
                  );
                }}
              >
                <Text style={[styles.timeText, { color: colors.text }]}>
                  {settings.notificationTime || '08:00'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>声音</Text>
            <Switch
              value={settings.soundEnabled !== false}
              onValueChange={(value) => updateSettings({ soundEnabled: value })}
              trackColor={{ false: colors.border, true: colors.secondary }}
              thumbColor={settings.soundEnabled !== false ? colors.primary : colors.background}
            />
          </View>
          
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>震动</Text>
            <Switch
              value={settings.vibrationEnabled !== false}
              onValueChange={(value) => updateSettings({ vibrationEnabled: value })}
              trackColor={{ false: colors.border, true: colors.secondary }}
              thumbColor={settings.vibrationEnabled !== false ? colors.primary : colors.background}
            />
          </View>
        </View>
        
        {/* 数据备份 */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>数据</Text>
          
          <TouchableOpacity
            style={[styles.settingButton, { borderColor: colors.border }]}
            onPress={openExportModal}
          >
            <Text style={[styles.buttonLabel, { color: colors.text }]}>导出数据备份</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.settingButton, { borderColor: colors.border }]}
            onPress={openImportModal}
          >
            <Text style={[styles.buttonLabel, { color: colors.text }]}>导入数据备份</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.settingButton, { borderColor: colors.error }]}
            onPress={handleClearData}
          >
            <Text style={[styles.buttonLabel, { color: colors.error }]}>清除所有数据</Text>
          </TouchableOpacity>
        </View>
        
        {/* 关于 */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>关于</Text>
          
          <View style={styles.aboutRow}>
            <Text style={[styles.aboutLabel, { color: colors.text }]}>版本</Text>
            <Text style={[styles.aboutValue, { color: colors.textSecondary }]}>1.0.0</Text>
          </View>
          
          <View style={styles.aboutRow}>
            <Text style={[styles.aboutLabel, { color: colors.text }]}>开发者</Text>
            <Text style={[styles.aboutValue, { color: colors.textSecondary }]}>佛法学修团队</Text>
          </View>
          
          <TouchableOpacity
            style={[styles.settingButton, { borderColor: colors.border }]}
            onPress={() => {
              // 这里应该有反馈邮件功能
              Alert.alert('功能开发中', '反馈功能正在开发中，请等待后续版本更新。');
            }}
          >
            <Text style={[styles.buttonLabel, { color: colors.text }]}>意见反馈</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* 模态框 */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          {renderModalContent()}
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
  section: {
    borderRadius: 12,
    margin: 16,
    marginBottom: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 4,
  },
  settingLabel: {
    fontSize: 16,
  },
  timeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  timeText: {
    fontSize: 16,
  },
  settingButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  buttonLabel: {
    fontSize: 16,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  aboutLabel: {
    fontSize: 16,
  },
  aboutValue: {
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
    marginBottom: 16,
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 16,
    lineHeight: 20,
  },
  passwordInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  actionButton: {
    flex: 2,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: 'bold',
  },
});

export default Settings;
