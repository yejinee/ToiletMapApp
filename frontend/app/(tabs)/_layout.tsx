import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';



export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FF8C00',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          elevation: 5,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
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
