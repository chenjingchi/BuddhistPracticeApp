import React, { useContext, useEffect, useRef, useState } from 'react';
import {
    Alert,
    Dimensions,
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Share from 'react-native-share';
import ViewShot from 'react-native-view-shot';
import CardItem from '../components/cards/CardItem';
import ImageSelector from '../components/cards/ImageSelector';
import { AppContext } from '../contexts/AppContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { generateUniqueId } from '../utils/idUtils';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2;

const CardsScreen = ({ navigation, route }) => {
  const { cards, images, teachings, addItem, updateItem, removeItem } = useContext(AppContext);
  const { colors } = useContext(ThemeContext);
  
  // 用于生成卡片截图的引用
  const cardRef = useRef(null);
  
  // 从路由参数中获取初始教言
  const initialQuote = route.params?.initialQuote?.content || '';
  
  // 状态管理
  const [cardText, setCardText] = useState(initialQuote);
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [fontSize, setFontSize] = useState(18);
  const [textColor, setTextColor] = useState('#ffffff');
  const [textShadow, setTextShadow] = useState(true);
  const [activeTab, setActiveTab] = useState('create');

  // 选择背景图片
  useEffect(() => {
    if (images.length > 0 && !selectedImageId) {
      setSelectedImageId(images[0].id);
    }
  }, [images]);

  // 找到当前选中的图片
  const selectedImage = images.find(img => img.id === selectedImageId) || images[0];

  // 保存卡片
  const saveCard = async () => {
    if (!cardText.trim()) {
      Alert.alert('提示', '请输入教言内容');
      return;
    }

    if (!selectedImageId) {
      Alert.alert('提示', '请选择背景图片');
      return;
    }

    try {
      // 捕获卡片视图截图
      const uri = await cardRef.current.capture();
      
      // 创建新卡片对象
      const newCard = {
        id: generateUniqueId(),
        text: cardText,
        imageId: selectedImageId,
        imageUri: uri,
        fontSize,
        textColor,
        textShadow,
        createdAt: new Date().toISOString(),
      };
      
      // 添加到卡片集合
      addItem('cards', newCard);
      
      // 提示保存成功
      Alert.alert('成功', '卡片已保存');
      
      // 清空输入
      setCardText('');
    } catch (error) {
      console.error('保存卡片出错:', error);
      Alert.alert('错误', '保存卡片失败，请重试');
    }
  };

  // 设置为壁纸
  const setAsWallpaper = async () => {
    try {
      const uri = await cardRef.current.capture();
      
      // 分享图片
      await Share.open({
        url: uri,
        type: 'image/jpeg',
        title: '设置为壁纸',
        message: '长按图片并选择"设为壁纸"',
      });
    } catch (error) {
      console.error('设置壁纸出错:', error);
      if (error.message !== 'User did not share') {
        Alert.alert('错误', '设置壁纸失败，请重试');
      }
    }
  };

  // 删除卡片
  const deleteCard = (id) => {
    Alert.alert(
      '确认删除',
      '确定要删除这张卡片吗？',
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '删除', 
          style: 'destructive',
          onPress: () => {
            removeItem('cards', id);
            Alert.alert('成功', '卡片已删除');
          }
        }
      ]
    );
  };

  // 分享卡片
  const shareCard = async (id) => {
    const card = cards.find(c => c.id === id);
    if (!card || !card.imageUri) return;
    
    try {
      await Share.open({
        url: card.imageUri,
        type: 'image/jpeg',
      });
    } catch (error) {
      console.error('分享卡片出错:', error);
      if (error.message !== 'User did not share') {
        Alert.alert('错误', '分享卡片失败，请重试');
      }
    }
  };

  // 渲染创建卡片标签页
  const renderCreateTab = () => (
    <View style={styles.createContainer}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>创建新卡片</Text>
      
      {/* 文本输入 */}
      <TextInput 
        style={[
          styles.textInput, 
          { 
            borderColor: colors.border,
            color: colors.text,
            backgroundColor: colors.card 
          }
        ]}
        placeholder="输入教言内容..."
        placeholderTextColor={colors.textSecondary}
        multiline
        value={cardText}
        onChangeText={setCardText}
        maxLength={100}
      />
      
      {/* 字数统计 */}
      <Text style={[styles.charCount, { color: colors.textSecondary }]}>
        {cardText.length}/100
      </Text>
      
      {/* 图片选择器 */}
      <Text style={[styles.subTitle, { color: colors.text }]}>选择背景图片</Text>
      <ImageSelector 
        images={images}
        selectedImageId={selectedImageId}
        onSelect={setSelectedImageId}
      />
      
      {/* 卡片预览 */}
      <Text style={[styles.subTitle, { color: colors.text }]}>卡片预览</Text>
      <View style={styles.previewContainer}>
        <ViewShot ref={cardRef} style={styles.cardPreview}>
          <Image 
            source={{ uri: selectedImage?.url || 'https://placeholder.com/300x200' }}
            style={styles.previewImage}
          />
          <View style={[
            styles.textOverlay,
            textShadow && styles.textShadow
          ]}>
            <Text style={[
              styles.previewText,
              { 
                color: textColor,
                fontSize: fontSize
              }
            ]}>
              {cardText || '教言将显示在这里'}
            </Text>
          </View>
        </ViewShot>
      </View>
      
      {/* 文本样式设置 */}
      <View style={styles.textSettingsContainer}>
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>字体大小</Text>
          <View style={styles.sizeButtons}>
            <TouchableOpacity 
              style={[styles.sizeButton, { backgroundColor: colors.secondary }]}
              onPress={() => setFontSize(Math.max(12, fontSize - 2))}
            >
              <Text style={{ color: colors.background }}>-</Text>
            </TouchableOpacity>
            <Text style={[styles.fontSize, { color: colors.text }]}>{fontSize}</Text>
            <TouchableOpacity 
              style={[styles.sizeButton, { backgroundColor: colors.secondary }]}
              onPress={() => setFontSize(Math.min(30, fontSize + 2))}
            >
              <Text style={{ color: colors.background }}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>文字阴影</Text>
          <TouchableOpacity 
            style={[
              styles.toggleButton, 
              { 
                backgroundColor: textShadow 
                  ? colors.secondary 
                  : colors.background,
                borderColor: colors.border
              }
            ]}
            onPress={() => setTextShadow(!textShadow)}
          >
            <View style={[
              styles.toggleIndicator, 
              { 
                backgroundColor: textShadow 
                  ? colors.background 
                  : colors.secondary,
                transform: [{ translateX: textShadow ? 20 : 0 }]
              }
            ]} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.colorRow}>
          {['#ffffff', '#f8ebd9', '#fbbf24', '#f59e0b', '#b45309'].map(color => (
            <TouchableOpacity 
              key={color}
              style={[
                styles.colorButton, 
                { 
                  backgroundColor: color,
                  borderColor: textColor === color ? colors.secondary : 'transparent',
                  borderWidth: textColor === color ? 2 : 0,
                }
              ]}
              onPress={() => setTextColor(color)}
            />
          ))}
        </View>
      </View>
      
      {/* 操作按钮 */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.saveButton, { backgroundColor: colors.primary }]}
          onPress={saveCard}
        >
          <Text style={[styles.buttonText, { color: colors.background }]}>保存卡片</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.wallpaperButton, { backgroundColor: colors.secondary }]}
          onPress={setAsWallpaper}
        >
          <Text style={[styles.buttonText, { color: colors.background }]}>设为壁纸</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // 渲染我的卡片标签页
  const renderMyCardsTab = () => (
    <View style={styles.myCardsContainer}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>我的卡片</Text>
      
      {cards.length > 0 ? (
        <FlatList
          data={cards}
          numColumns={2}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <CardItem 
              card={item}
              onPress={() => {}}
              onShare={() => shareCard(item.id)}
              onDelete={() => deleteCard(item.id)}
            />
          )}
          contentContainerStyle={styles.cardsGrid}
        />
      ) : (
        <View style={[styles.emptyState, { borderColor: colors.border }]}>
          <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
            您还没有创建卡片
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* 标签切换 */}
      <View style={[styles.tabContainer, { backgroundColor: colors.card }]}>
        <TouchableOpacity 
          style={[
            styles.tab, 
            activeTab === 'create' && { 
              backgroundColor: colors.primary,
              borderTopLeftRadius: 8,
              borderBottomLeftRadius: 8,
            }
          ]}
          onPress={() => setActiveTab('create')}
        >
          <Text style={[
            styles.tabText, 
            { color: activeTab === 'create' ? colors.background : colors.text }
          ]}>
            创建卡片
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.tab, 
            activeTab === 'mycards' && { 
              backgroundColor: colors.primary,
              borderTopRightRadius: 8,
              borderBottomRightRadius: 8,
            }
          ]}
          onPress={() => setActiveTab('mycards')}
        >
          <Text style={[
            styles.tabText, 
            { color: activeTab === 'mycards' ? colors.background : colors.text }
          ]}>
            我的卡片
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
      >
        {activeTab === 'create' ? renderCreateTab() : renderMyCardsTab()}
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
  createContainer: {
    marginBottom: 20,
  },
  myCardsContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    height: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    textAlign: 'right',
    fontSize: 12,
    marginTop: 4,
  },
  previewContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  cardPreview: {
    width: width - 32,
    height: (width - 32) * 0.6,
    borderRadius: 12,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  textOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  textShadow: {
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  previewText: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
  textSettingsContainer: {
    marginTop: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  settingLabel: {
    fontSize: 16,
  },
  sizeButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sizeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fontSize: {
    marginHorizontal: 12,
    fontSize: 16,
  },
  toggleButton: {
    width: 50,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    padding: 4,
  },
  toggleIndicator: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  colorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  colorButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 24,
  },
  saveButton: {
    flex: 3,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  wallpaperButton: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: 'bold',
  },
  cardsGrid: {
    paddingVertical: 8,
  },
  emptyState: {
    padding: 24,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 16,
  },
});

export default CardsScreen;
