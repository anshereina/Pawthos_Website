import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getAuthToken } from '../../utils/auth.utils';
import { API_BASE_URL } from '../../utils/config';

interface IntegrationScanningPageProps {
  imageUri?: string;
  onDone: (result: any, imageUri?: string) => void;
  onCancel: () => void;
}

export default function IntegrationScanningPage({ imageUri, onDone, onCancel }: IntegrationScanningPageProps) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Preparing image...');

  useEffect(() => {
    if (imageUri) {
      analyzeCatImage();
    } else {
      Alert.alert('Error', 'No image provided for analysis', [
        { text: 'OK', onPress: onCancel }
      ]);
    }
  }, [imageUri]);

  const analyzeCatImage = async () => {
    try {
      setProgress(20);
      setStatusText('Uploading image...');

      const token = await getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        name: 'cat_photo.jpg',
        type: 'image/jpeg',
      } as any);

      setProgress(40);
      setStatusText('Analyzing cat features...');

      const response = await fetch(`${API_BASE_URL}/predict-eld`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      setProgress(70);
      setStatusText('Processing results...');

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 400) {
          Alert.alert(
            'Cat Face Not Detected',
            'Please take a clear photo of your cat\'s face in good lighting.',
            [{ text: 'OK', onPress: onCancel }]
          );
          return;
        }
        
        if (response.status === 503) {
          Alert.alert(
            'Service Unavailable',
            'The AI pain assessment service is temporarily unavailable. Please try again later.',
            [{ text: 'OK', onPress: onCancel }]
          );
          return;
        }

        throw new Error(errorData.message || 'Analysis failed');
      }

      const result = await response.json();
      setProgress(100);
      setStatusText('Analysis complete!');

      // Wait a moment to show completion
      setTimeout(() => {
        onDone(result, imageUri);
      }, 500);

    } catch (error: any) {
      console.error('Error analyzing cat image:', error);
      Alert.alert(
        'Analysis Failed',
        error.message || 'Failed to analyze the image. Please try again.',
        [{ text: 'OK', onPress: onCancel }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Analyzing</Text>
      </View>
      <View style={styles.content}>
        <ActivityIndicator size="large" color="#045b26" />
        <Text style={styles.text}>{statusText}</Text>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>{progress}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: { marginRight: 16 },
  title: { fontSize: 20, fontWeight: 'bold' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  text: { fontSize: 16, color: '#666', marginTop: 20, marginBottom: 30 },
  progressBarContainer: {
    width: '80%',
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 10,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#045b26',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#045b26',
    marginTop: 10,
    fontWeight: 'bold',
  },
});













