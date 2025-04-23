import { format, isAfter, isSameDay, parseISO, subDays } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import React, { useContext, useEffect, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { AppContext } from '../contexts/AppContext';
import { ThemeContext } from '../contexts/ThemeContext';

const StatsScreen = () => {
  const { practices, records } = useContext(AppContext);
  const { colors } = useContext(ThemeContext);
  
  // 状态管理
  const [activeTab, setActiveTab] = useState('overview'); // overview, details
  const [selectedPeriod, setSelectedPeriod] = useState('week'); // week, month, all
  const [weeklyData, setWeeklyData] = useState([]);
  const [streakDays, setStreakDays] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  
  // 计算统计数据
  useEffect(() => {
    calculateStats();
  }, [records, practices, selectedPeriod]);
  
  // 计算统计数据
  const calculateStats = () => {
    // 1. 计算连续修行天数
    calculateStreak();
    
    // 2. 计算总念诵次数
    calculateTotalCount();
    
    // 3. 计算每日数据
    calculateDailyData();
  };
  
  // 计算连续修行天数
  const calculateStreak = () => {
    if (records.length === 0) {
      setStreakDays(0);
      return;
    }
    
    // 获取所有不同的记录日期并排序
    const recordDates = [...new Set(records.map(record => record.date))].sort();
    if (recordDates.length === 0) {
      setStreakDays(0);
      return;
    }
    
    // 检查今天是否有记录
    const today = format(new Date(), 'yyyy-MM-dd');
    const hasTodayRecord = recordDates.includes(today);
    
    // 从今天或最后一条记录开始往前检查
    let streak = hasTodayRecord ? 1 : 0;
    let currentDate = hasTodayRecord ? today : recordDates[recordDates.length - 1];
    
    for (let i = 1; i <= 366; i++) { // 最多检查一年
      const prevDate = format(subDays(parseISO(currentDate), 1), 'yyyy-MM-dd');
      
      if (recordDates.includes(prevDate)) {
        streak++;
        currentDate = prevDate;
      } else {
        break;
      }
    }
    
    setStreakDays(streak);
  };
  
  // 计算总念诵次数
  const calculateTotalCount = () => {
    const total = records.reduce((sum, record) => sum + record.count, 0);
    setTotalCount(total);
  };
  
  // 计算每日数据
  const calculateDailyData = () => {
    // 确定日期范围
    const today = new Date();
    let startDate;
    
    if (selectedPeriod === 'week') {
      startDate = subDays(today, 6); // 最近一周
    } else if (selectedPeriod === 'month') {
      startDate = subDays(today, 29); // 最近一个月
    } else {
      // 获取第一条记录的日期作为起始日期
      if (records.length > 0) {
        const recordDates = records.map(record => parseISO(record.date));
        startDate = new Date(Math.min(...recordDates));
      } else {
        startDate = subDays(today, 6); // 默认显示一周
      }
    }
    
    // 准备数据
    const dailyData = [];
    let currentDate = startDate;
    
    // 生成每一天的数据
    while (isAfter(today, currentDate) || isSameDay(today, currentDate)) {
      const dateString = format(currentDate, 'yyyy-MM-dd');
      
      // 该日期的所有记录
      const dayRecords = records.filter(record => record.date === dateString);
      
      // 该日期的总计数
      const dayCount = dayRecords.reduce((sum, record) => sum + record.count, 0);
      
      // 获取显示日期（如周一、周二等）
      const displayDate = format(currentDate, 'E', { locale: zhCN });
      
      // 添加到数据数组
      dailyData.push({
        date: dateString,
        displayDate,
        count: dayCount,
      });
      
      // 移至下一天
      currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
    }
    
    // 如果是周视图，只取最近7天
    const weekData = selectedPeriod === 'week' 
      ? dailyData.slice(-7) 
      : dailyData;
    
    setWeeklyData(weekData);
  };
  
  // 计算每个练习的最大完成度
  const getMaxProgress = () => {
    return practices.reduce((max, practice) => {
      const progress = (practice.completed / practice.totalTarget) * 100;
      return progress > max ? progress : max;
    }, 0);
  };
  
  // 渲染图表
  const renderChart = () => {
    // 找出最大值用于缩放
    const maxCount = Math.max(...weeklyData.map(day => day.count), 1);
    
    return (
      <View style={styles.chartContainer}>
        {weeklyData.map((day, index) => {
          // 计算高度百分比
          const heightPercent = (day.count / maxCount) * 100;
          
          return (
            <View key={day.date} style={styles.chartColumn}>
              <View style={styles.barContainer}>
                <View 
                  style={[
                    styles.bar, 
                    { 
                      backgroundColor: colors.primary,
                      height: `${heightPercent}%`,
                    }
                  ]}
                />
              </View>
              <Text style={[styles.dayLabel, { color: colors.textSecondary }]}>
                {day.displayDate}
              </Text>
            </View>
          );
        })}
      </View>
    );
  };
  
  // 渲染概览标签页
  const renderOverviewTab = () => (
    <View style={styles.overviewContainer}>
      {/* 总览信息卡片 */}
      <View style={[styles.statsCard, { backgroundColor: colors.card }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>修行总览</Text>
        
        <View style={styles.statsGrid}>
          <View style={[styles.statBox, { backgroundColor: colors.primary + '20' }]}>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {streakDays}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              连续修行天数
            </Text>
          </View>
          
          <View style={[styles.statBox, { backgroundColor: colors.secondary + '20' }]}>
            <Text style={[styles.statValue, { color: colors.secondary }]}>
              {totalCount.toLocaleString()}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              总念诵次数
            </Text>
          </View>
          
          <View style={[styles.statBox, { backgroundColor: colors.highlight + '20' }]}>
            <Text style={[styles.statValue, { color: colors.highlight }]}>
              {practices.length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              念诵项目
            </Text>
          </View>
          
          <View style={[styles.statBox, { backgroundColor: colors.success + '20' }]}>
            <Text style={[styles.statValue, { color: colors.success }]}>
              {Math.round(getMaxProgress())}%
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              最高完成度
            </Text>
          </View>
        </View>
      </View>
      
      {/* 近期记录图表 */}
      <View style={[styles.chartCard, { backgroundColor: colors.card }]}>
        <View style={styles.chartHeader}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>近期记录</Text>
          
          <View style={[styles.periodSelector, { backgroundColor: colors.background }]}>
            <TouchableOpacity 
              style={[
                styles.periodButton, 
                selectedPeriod === 'week' && {
                  backgroundColor: colors.primary,
                  borderRadius: 4,
                }
              ]}
              onPress={() => setSelectedPeriod('week')}
            >
              <Text style={[
                styles.periodButtonText, 
                { color: selectedPeriod === 'week' ? colors.background : colors.text }
              ]}>
                周
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.periodButton, 
                selectedPeriod === 'month' && {
                  backgroundColor: colors.primary,
                  borderRadius: 4,
                }
              ]}
              onPress={() => setSelectedPeriod('month')}
            >
              <Text style={[
                styles.periodButtonText, 
                { color: selectedPeriod === 'month' ? colors.background : colors.text }
              ]}>
                月
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.periodButton, 
                selectedPeriod === 'all' && {
                  backgroundColor: colors.primary,
                  borderRadius: 4,
                }
              ]}
              onPress={() => setSelectedPeriod('all')}
            >
              <Text style={[
                styles.periodButtonText, 
                { color: selectedPeriod === 'all' ? colors.background : colors.text }
              ]}>
                全部
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {renderChart()}
      </View>
    </View>
  );
  
  // 渲染明细标签页
  const renderDetailsTab = () => (
    <View style={styles.detailsContainer}>
      {/* 念诵项目明细 */}
      <View style={[styles.detailsCard, { backgroundColor: colors.card }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>念诵明细</Text>
        
        {practices.length > 0 ? (
          practices.map(practice => {
            const progress = (practice.completed / practice.totalTarget) * 100;
            
            return (
              <View key={practice.id} style={styles.practiceItem}>
                <View style={styles.practiceHeader}>
                  <Text style={[styles.practiceName, { color: colors.text }]}>
                    {practice.name}
                  </Text>
                  <Text style={[styles.practiceCount, { color: colors.primary }]}>
                    {practice.completed.toLocaleString()} / {practice.totalTarget.toLocaleString()}
                  </Text>
                </View>
                
                <View style={[styles.progressBg, { backgroundColor: colors.background }]}>
                  <View 
                    style={[
                      styles.progressBar, 
                      { 
                        backgroundColor: colors.primary,
                        width: `${Math.min(100, progress)}%`,
                      }
                    ]}
                  />
                </View>
                
                <Text style={[styles.progressText, { color: colors.textSecondary }]}>
                  完成进度 {Math.round(progress)}%
                </Text>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              暂无念诵项目
            </Text>
          </View>
        )}
      </View>
      
      {/* 最近记录 */}
      <View style={[styles.detailsCard, { backgroundColor: colors.card }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>最近记录</Text>
        
        {records.length > 0 ? (
          // 显示最近10条记录
          [...records]
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 10)
            .map(record => {
              const practice = practices.find(p => p.id === record.practiceId);
              const recordDate = format(
                parseISO(record.timestamp), 
                'MM-dd HH:mm'
              );
              
              return (
                <View key={record.id} style={styles.recordItem}>
                  <View style={styles.recordInfo}>
                    <Text style={[styles.recordName, { color: colors.text }]}>
                      {practice ? practice.name : '未知项目'}
                    </Text>
                    <Text style={[styles.recordTime, { color: colors.textSecondary }]}>
                      {recordDate}
                    </Text>
                  </View>
                  <Text style={[styles.recordCount, { color: colors.primary }]}>
                    +{record.count}
                  </Text>
                </View>
              );
            })
        ) : (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              暂无念诵记录
            </Text>
          </View>
        )}
      </View>
    </View>
  );
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* 标签切换 */}
      <View style={[styles.tabContainer, { backgroundColor: colors.card }]}>
        <TouchableOpacity 
          style={[
            styles.tab, 
            activeTab === 'overview' && { 
              backgroundColor: colors.primary,
              borderTopLeftRadius: 8,
              borderBottomLeftRadius: 8,
            }
          ]}
          onPress={() => setActiveTab('overview')}
        >
          <Text style={[
            styles.tabText, 
            { color: activeTab === 'overview' ? colors.background : colors.text }
          ]}>
            总览
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.tab, 
            activeTab === 'details' && { 
              backgroundColor: colors.primary,
              borderTopRightRadius: 8,
              borderBottomRightRadius: 8,
            }
          ]}
          onPress={() => setActiveTab('details')}
        >
          <Text style={[
            styles.tabText, 
            { color: activeTab === 'details' ? colors.background : colors.text }
          ]}>
            明细
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
      >
        {activeTab === 'overview' ? renderOverviewTab() : renderDetailsTab()}
      </ScrollView>
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
  tabContainer: {
    flexDirection: 'row',
    margin: 16,
    marginBottom: 0,
    borderRadius: 8,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabText: {
    fontWeight: 'bold',
  },
  overviewContainer: {
    marginBottom: 20,
  },
  detailsContainer: {
    marginBottom: 20,
  },
  statsCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  chartCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  detailsCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statBox: {
    width: '48%',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  periodSelector: {
    flexDirection: 'row',
    borderRadius: 6,
    overflow: 'hidden',
  },
  periodButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  periodButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 200,
  },
  chartColumn: {
    flex: 1,
    alignItems: 'center',
  },
  barContainer: {
    width: 16,
    height: 160,
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    minHeight: 4,
  },
  dayLabel: {
    fontSize: 12,
    marginTop: 8,
  },
  practiceItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  practiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  practiceName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  practiceCount: {
    fontSize: 14,
  },
  progressBg: {
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    textAlign: 'right',
  },
  recordItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  recordInfo: {
    flex: 1,
  },
  recordName: {
    fontSize: 16,
    marginBottom: 4,
  },
  recordTime: {
    fontSize: 12,
  },
  recordCount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
});

export default StatsScreen;
