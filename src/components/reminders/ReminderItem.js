import React, { useContext } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ThemeContext } from '../../contexts/ThemeContext';

const ReminderItem = ({ reminder, onPress, onComplete }) => {
  const { colors } = useContext(ThemeContext);
  
  return (
    <TouchableOpacity 
      onPress={onPress}
      style={[
        styles.container, 
        { 
          backgroundColor: colors.card,
          borderLeftColor: reminder.type === 'quote' ? colors.highlight : colors.primary,
        }
      ]}
    >
      <View style={styles.content}>
        <Text style={[styles.message, { color: colors.text }]}>
          {reminder.message}
        </Text>
        <Text style={[styles.time, { color: colors.textSecondary }]}>
          {reminder.time}
        </Text>
      </View>
      
      <TouchableOpacity 
        style={[styles.completeButton, { borderColor: colors.primary }]}
        onPress={onComplete}
      >
        <Text style={[styles.completeText, { color: colors.primary }]}>完成</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
  },
  message: {
    fontSize: 16,
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
  },
  completeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
  },
  completeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default ReminderItem;
