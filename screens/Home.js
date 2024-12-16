import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import GroupChat from './home/GroupChat';
import List_Profil from './home/List_Profile';
import Myaccount from './home/Myaccount';

const Tab = createMaterialBottomTabNavigator();

function Home(props) {
  const currentId = props.route.params.currentId;
  console.log('Home', currentId);

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#1E1E2C', 
          paddingBottom: 5,
          paddingTop: 5,
          height: 65, 
          borderTopWidth: 1,
          borderTopColor: '#333',
        },
        tabBarActiveTintColor: '#FFD700', 
        tabBarInactiveTintColor: '#888', 
        tabBarLabelStyle: {
          fontSize: 20,
          fontWeight: '600',
          letterSpacing: 0.5,
        },
        tabBarIconStyle: {
          marginBottom: -5,
        },
      }}
      barStyle={{
        backgroundColor: '#1E1E2C', 
      }}
    >
      <Tab.Screen
        name="Chats"
        component={List_Profil}
        initialParams={{ currentId }}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="chatbubbles-outline" color={color} size={22} />
          ),
          tabBarLabel: 'Chats',
        }}
      />
      <Tab.Screen
        name="My Profile"
        component={Myaccount}
        initialParams={{ currentId }}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="person-circle-outline" color={color} size={22} />
          ),
          tabBarLabel: 'Profile',
        }}
      />
      <Tab.Screen
        name="Group Chat"
        component={GroupChat}
        initialParams={{ currentId }}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="people-outline" color={color} size={22} />
          ),
          tabBarLabel: 'Groups',
        }}
      />
    </Tab.Navigator>
  );
}

export default Home;