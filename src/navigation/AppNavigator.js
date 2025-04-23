import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, { useContext } from 'react';
import { Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { ThemeContext } from '../contexts/ThemeContext';

// 导入屏幕
import CardsScreen from '../screens/Cards';
import CounterScreen from '../screens/Counter';
import HomeScreen from '../screens/Home';
import LibraryScreen from '../screens/Library';
import StatsScreen from '../screens/Stats';

// 创建底部标签导航器
const Tab = createBottomTabNavigator();

// 自定义图标组件
const HomeIcon = ({ color }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <Path d="M9 22V12h6v10" />
  </Svg>
);

const CardIcon = ({ color }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" />
  </Svg>
);

const CounterIcon = ({ color }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
  </Svg>
);

const StatsIcon = ({ color }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M18 20V10M12 20V4M6 20v-6" />
  </Svg>
);

const LibraryIcon = ({ color }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
    <Path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
  </Svg>
);

// 图标和标签组件
const TabBarIcon = ({ Icon, focused, color, label }) => {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Icon color={color} />
      <Text style={{ fontSize: 10, color, marginTop: 2 }}>{label}</Text>
    </View>
  );
};

// 应用导航组件
const AppNavigator = () => {
  const { colors } = useContext(ThemeContext);

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: colors.primary,
          paddingBottom: 5,
          height: 60,
        },
        tabBarActiveTintColor: colors.highlight,
        tabBarInactiveTintColor: colors.background,
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.background,
        headerTitleAlign: 'center',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          title: '首页',
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon 
              Icon={HomeIcon} 
              focused={focused} 
              color={color} 
              label="首页"
            />
          ),
        }}
      />
      <Tab.Screen 
        name="Cards" 
        component={CardsScreen}
        options={{
          title: '教言卡',
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon 
              Icon={CardIcon} 
              focused={focused} 
              color={color} 
              label="教言卡"
            />
          ),
        }}
      />
      <Tab.Screen 
        name="Counter" 
        component={CounterScreen}
        options={{
          title: '念诵',
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon 
              Icon={CounterIcon} 
              focused={focused} 
              color={color} 
              label="念诵"
            />
          ),
        }}
      />
      <Tab.Screen 
        name="Stats" 
        component={StatsScreen}
        options={{
          title: '统计',
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon 
              Icon={StatsIcon} 
              focused={focused} 
              color={color} 
              label="统计"
            />
          ),
        }}
      />
      <Tab.Screen 
        name="Library" 
        component={LibraryScreen}
        options={{
          title: '资源库',
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon 
              Icon={LibraryIcon} 
              focused={focused} 
              color={color} 
              label="资源库"
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default AppNavigator;
