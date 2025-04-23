import React, { useContext } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ThemeContext } from '../../contexts/ThemeContext';

const CardItem = ({ card, onPress, onShare, onDelete }) => {
  const { colors } = useContext(ThemeContext);
  
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
    >
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: card.imageUri }}
          style={styles.image}
        />
        <View style={[
          styles.textOverlay,
          card.textShadow && styles.textShadow
        ]}>
          <Text style={[
            styles.cardText,
            { 
              color: card.textColor,
              fontSize: card.fontSize,
            }
          ]}>
            {card.text}
          </Text>
        </View>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={onShare}
        >
          <Text style={[styles.actionText, { color: colors.secondary }]}>分享</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={onDelete}
        >
          <Text style={[styles.actionText, { color: colors.error }]}>删除</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '48%',
    marginBottom: 16,
    marginHorizontal: '1%',
  },
  imageContainer: {
    height: 150,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 4,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  textOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  textShadow: {
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  cardText: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    padding: 4,
  },
  actionText: {
    fontSize: 12,
  },
});

export default CardItem;
