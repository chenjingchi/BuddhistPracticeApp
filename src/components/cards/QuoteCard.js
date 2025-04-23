import React, { useContext } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ThemeContext } from '../../contexts/ThemeContext';

/**
 * 引用卡片组件
 * 用于在首页显示今日智慧语录
 * 
 * @param {String} quote - 引用文本
 * @param {String} source - 来源
 * @param {Function} onPress - 点击事件处理函数
 */
const QuoteCard = ({ quote, source, onPress }) => {
  const { colors } = useContext(ThemeContext);
  
  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.card }]}
      onPress={onPress}
    >
      <View style={[styles.quoteDecoration, { backgroundColor: colors.highlight }]} />
      
      <Text style={[styles.quoteText, { color: colors.text }]}>
        {quote}
      </Text>
      
      {source && (
        <Text style={[styles.sourceText, { color: colors.textSecondary }]}>
          —— {source}
        </Text>
      )}
      
      <View style={styles.footer}>
        <Text style={[styles.tipText, { color: colors.textSecondary }]}>
          点击创建卡片
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  quoteDecoration: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 4,
    height: '100%',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  quoteText: {
    fontSize: 16,
    lineHeight: 24,
    fontStyle: 'italic',
    marginBottom: 12,
    paddingLeft: 8,
  },
  sourceText: {
    fontSize: 14,
    textAlign: 'right',
    marginBottom: 8,
  },
  footer: {
    alignItems: 'flex-end',
  },
  tipText: {
    fontSize: 12,
  },
});

export default QuoteCard;
