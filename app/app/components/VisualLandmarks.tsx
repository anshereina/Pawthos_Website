import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

interface VisualLandmarksProps {
  landmarks?: any;
  imageUri?: string;
  fgsBreakdown?: any;
}

export default function VisualLandmarks({ landmarks, imageUri, fgsBreakdown }: VisualLandmarksProps) {
  // This component would display visual landmarks on an image
  // For now, it's a placeholder that can be enhanced later
  return (
    <View style={styles.container}>
      {landmarks && (
        <View style={styles.landmarksContainer}>
          <Text style={styles.label}>Landmarks Detected</Text>
          <Text style={styles.count}>{landmarks.length || 0} points</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  landmarksContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 8,
  },
  label: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  count: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
});

