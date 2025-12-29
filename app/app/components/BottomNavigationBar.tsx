import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface BottomNavigationBarProps {
  activeTab: string;
  onTabPress: (tab: string) => void;
  userData?: any;
}

export default function BottomNavigationBar({ 
  activeTab, 
  onTabPress 
}: BottomNavigationBarProps) {
  const tabs = [
    { id: 'home', icon: 'home', label: 'Home' },
    { id: 'pets', icon: 'pets', label: 'Pets' },
    { id: 'appointment', icon: 'event', label: 'Appointments' },
    { id: 'account', icon: 'person', label: 'Account' },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={styles.tab}
          onPress={() => onTabPress(tab.id)}
        >
          <MaterialIcons
            name={tab.icon as any}
            size={24}
            color={activeTab === tab.id ? '#007AFF' : '#666'}
          />
          <Text
            style={[
              styles.label,
              activeTab === tab.id && styles.activeLabel,
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingVertical: 8,
    paddingHorizontal: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  label: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
  },
  activeLabel: {
    color: '#007AFF',
    fontWeight: '600',
  },
});













