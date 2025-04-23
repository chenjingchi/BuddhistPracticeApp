import React, { useContext } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ThemeContext } from '../../contexts/ThemeContext';

/**
 * 统计图表组件
 * 显示修行数据的柱状图
 * 
 * @param {Array} data - 图表数据
 * @param {String} valueKey - 数值键名
 * @param {String} labelKey - 标签键名
 * @param {Number} maxValue - 最大值（可选）
 * @param {String} title - 图表标题（可选）
 * @param {Object} style - 自定义样式（可选）
 */
const StatsChart = ({ 
  data, 
  valueKey, 
  labelKey, 
  maxValue = null, 
  title = null, 
  style = {} 
}) => {
  const { colors } = useContext(ThemeContext);
  
  // 验证数据
  if (!data || !data.length) {
    return (
      <View style={[styles.container, { backgroundColor: colors.card }, style]}>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          暂无数据
        </Text>
      </View>
    );
  }
  
  // 计算最大值
  const calculatedMax = maxValue || Math.max(...data.map(item => item[valueKey]), 1);
  
  return (
    <View style={[styles.container, { backgroundColor: colors.card }, style]}>
      {title && (
        <Text style={[styles.title, { color: colors.text }]}>
          {title}
        </Text>
      )}
      
      <View style={styles.chartContainer}>
        {data.map((item, index) => {
          // 计算高度百分比
          const value = item[valueKey];
          const heightPercent = (value / calculatedMax) * 100;
          
          // 显示标签
          const label = item[labelKey];
          
          return (
            <View key={index} style={styles.barColumn}>
              <View style={styles.barWrapper}>
                <View 
                  style={[
                    styles.bar, 
                    { 
                      backgroundColor: colors.primary,
                      height: `${Math.max(1, heightPercent)}%`
                    }
                  ]}
                />
              </View>
              <Text style={[styles.barLabel, { color: colors.textSecondary }]}>
                {label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    margin: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    padding: 20,
  },
  chartContainer: {
    height: 160,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
  },
  barWrapper: {
    height: 140,
    width: 16,
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    minHeight: 1,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  barLabel: {
    fontSize: 12,
    marginTop: 6,
  },
});

export default StatsChart;
