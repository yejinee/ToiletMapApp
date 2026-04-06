import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';



export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#A0522D',
        tabBarInactiveTintColor: '#D2B48C',
        tabBarStyle: {
          backgroundColor: '#1C1917',
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: '#1C1917',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.3,
          shadowRadius: 6,
        },
      }}
    >
      <Tabs.Screen
        name="restroom_finder"
        options={{
          title: '홈',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="restroom_details"
        options={{
          title: '상세정보',
          tabBarButton: () => null, // Hide this tab from the tab bar
        }}
      />
      {/*
      <Tabs.Screen
        name="review"
        options={{
          title: '리뷰쓰기',
          tabBarIcon: ({ color }) => <FontAwesome name="pencil" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '마이페이지',
          tabBarIcon: ({ color }) => <Ionicons name="person-circle" size={24} color={color} />,
        }}
      />
      */}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  // Add any specific styles here
});
