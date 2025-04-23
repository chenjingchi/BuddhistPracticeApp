import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import React, { useContext, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import QuoteCard from '../components/cards/QuoteCard';
import DailyProgressCard from '../components/counter/DailyProgressCard';
import ReminderItem from '../components/reminders/ReminderItem';
import { AppContext } from '../contexts/AppContext';
import { ThemeContext } from '../contexts/ThemeContext';

const HomeScreen = ({ navigation }) => {
  const { reminders, cards, practices, records, teachings } = useContext(AppContext);
  const { colors } = useContext(ThemeContext);
  const [todayQuote, setTodayQuote] = useState(null);
  const [todayRecords, setTodayRecords] = useState([]);

  // 获取今日日期
  const today = format(new Date(), 'yyyy-MM-dd');

  // 设置今日智慧语句
  useEffect(() => {
    if (teachings.length > 0) {
      // 根据日期选择一句教言
      const day = new Date().getDate();
      const index = day % teachings.length;
      setTodayQuote(teachings[index]);
    }
  }, [teachings]);

  // 获取今日念诵记录
  useEffect(() => {
    const getTodayRecords = () => {
      // 筛选出今日的记录
      const filteredRecords = records.filter(record => record.date === today);
      
      // 计算每个实践的今日进度
      const practiceProgress = practices.map(practice => {
        const todayCount = filteredRecords
          .filter(record => record.practiceId === practice.id)
          .reduce((sum, record) => sum + record.count, 0);
        
        return {
          ...practice,
          todayCount,
          progress: todayCount / practice.dailyTarget
        };
      });
      
      setTodayRecords(practiceProgress);
    };
    
    getTodayRecords();
  }, [practices, records, today]);

  // 筛选今日提醒
  const todayReminders = reminders.filter(reminder => {
    // 判断提醒是否应该今天显示
    // 简化版：所有提醒都显示，实际应用中需要更复杂的逻辑
    return true;
  });

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* 日期显示 */}
      <View style={styles.dateContainer}>
        <Text style={[styles.dateText, { color: colors.text }]}>
          {format(new Date(), 'yyyy年MM月dd日', { locale: zhCN })}
        </Text>
        <Text style={[styles.weekdayText, { color: colors.textSecondary }]}>
          {format(new Date(), 'EEEE', { locale: zhCN })}
        </Text>
      </View>

      {/* 今日智慧 */}
      {todayQuote && (
        <QuoteCard 
          quote={todayQuote.content} 
          source={todayQuote.source}
          onPress={() => {
            // 创建一个基于此教言的新卡片
            navigation.navigate('Cards', { initialQuote: todayQuote });
          }}
        />
      )}

      {/* 提醒事项 */}
      <View style={styles.sectionContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>提醒事项</Text>
        {todayReminders.length > 0 ? (
          todayReminders.map(reminder => (
            <ReminderItem 
              key={reminder.id} 
              reminder={reminder} 
              onPress={() => {
                // 处理提醒点击
              }}
            />
          ))
        ) : (
          <View style={[styles.emptyState, { borderColor: colors.border }]}>
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
              今日没有提醒事项
            </Text>
            <TouchableOpacity 
              style={[styles.addButton, { backgroundColor: colors.primary }]}
              onPress={() => {
                // 跳转到添加提醒界面
              }}
            >
              <Text style={[styles.addButtonText, { color: colors.background }]}>添加提醒</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* 今日进度 */}
      <View style={styles.sectionContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>今日修行进度</Text>
        {todayRecords.length > 0 ? (
          todayRecords.map(practice => (
            <DailyProgressCard 
              key={practice.id} 
              practice={practice} 
              onPress={() => {
                // 跳转到计数界面
                navigation.navigate('Counter', { practiceId: practice.id });
              }}
            />
          ))
        ) : (
          <View style={[styles.emptyState, { borderColor: colors.border }]}>
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
              暂无念诵项目
            </Text>
            <TouchableOpacity 
              style={[styles.addButton, { backgroundColor: colors.primary }]}
              onPress={() => {
                // 跳转到添加念诵界面
                navigation.navigate('Counter', { action: 'add' });
              }}
            >
              <Text style={[styles.addButtonText, { color: colors.background }]}>添加念诵</Text>
            </TouchableOpacity>
          </View>
        )}
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
  dateContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  weekdayText: {
    fontSize: 16,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  emptyState: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    marginBottom: 12,
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  addButtonText: {
    fontWeight: 'bold',
  },
});

export default HomeScreen;
