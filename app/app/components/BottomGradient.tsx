import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function BottomGradient() {
  return (
    <LinearGradient
      colors={['transparent', 'rgba(0,0,0,0.1)']}
      style={styles.gradient}
      pointerEvents="none"
    />
  );
}

const styles = StyleSheet.create({
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 20,
  },
});













