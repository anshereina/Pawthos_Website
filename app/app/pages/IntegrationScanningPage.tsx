import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, Animated } from 'react-native';
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
  const scanAnimation = useState(new Animated.Value(0))[0];

  // Scanning animation effect
  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.timing(scanAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanAnimation, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]).start(() => animate());
    };
    animate();
  }, []);

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
        let errorData;
        try {
          errorData = await response.json();
          console.log('🔍 Scanning error data:', errorData);
        } catch {
          errorData = {};
        }
        
        // Check for NO_CAT_DETECTED error (FastAPI wraps in detail)
        if (response.status === 400) {
          const detail = errorData.detail;
          
          // Check if it's the NO_CAT_DETECTED error
          if (detail && typeof detail === 'object' && detail.error_type === 'NO_CAT_DETECTED') {
            // Pass the error to result page instead of showing alert
            onDone({
              error: true,
              error_type: 'NO_CAT_DETECTED',
              error_message: detail.error_message || 'No cat face detected in the image',
              error_guidance: detail.error_guidance || 'Please upload a clear photo of a cat\'s face for pain assessment.'
            }, imageUri);
            return;
          }
          
          // Fallback for other 400 errors
          Alert.alert(
            'Invalid Image',
            'Please upload a clear photo of a cat\'s face for pain assessment.',
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
      
      // Check if result itself contains an error (in case AI service returns error without HTTP error status)
      if (result.error && result.error_type === 'NO_CAT_DETECTED') {
        // Pass the error to result page to show the error modal
        onDone({
          error: true,
          error_type: 'NO_CAT_DETECTED',
          error_message: result.error_message || 'No cat face detected in the image',
          error_guidance: result.error_guidance || 'Please upload a clear photo of a cat\'s face for pain assessment.'
        }, imageUri);
        return;
      }
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

  // Scanning line animation
  const scanLineTranslateY = scanAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 300], // Adjust based on your image height
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Analyzing</Text>
      </View>
      
      <View style={styles.content}>
        {/* Image with Scanning Box */}
        {imageUri && (
          <View style={styles.scanningContainer}>
            <View style={styles.imageContainer}>
              <Image 
                source={{ uri: imageUri }} 
                style={styles.catImage}
                resizeMode="contain"
              />
              
              {/* Scanning overlay effect */}
              <View style={styles.scanningOverlay}>
                <Animated.View 
                  style={[
                    styles.scanLine,
                    {
                      transform: [{ translateY: scanLineTranslateY }],
                    }
                  ]}
                />
              </View>
              
              {/* Scanning border animation */}
              <View style={styles.scanningBorder}>
                <View style={[styles.corner, styles.topLeft]} />
                <View style={[styles.corner, styles.topRight]} />
                <View style={[styles.corner, styles.bottomLeft]} />
                <View style={[styles.corner, styles.bottomRight]} />
              </View>
            </View>
            
            {/* Status Messages */}
            <View style={styles.statusContainer}>
              <View style={styles.statusItem}>
                <MaterialIcons 
                  name={statusText === 'Preparing image...' ? 'radio-button-checked' : 'radio-button-unchecked'} 
                  size={16} 
                  color={statusText === 'Preparing image...' ? '#045b26' : '#ccc'} 
                />
                <Text style={[
                  styles.statusText,
                  statusText === 'Preparing image...' && styles.activeStatus
                ]}>
                  Preparing image...
                </Text>
              </View>
              
              <View style={styles.statusItem}>
                <MaterialIcons 
                  name={statusText === 'Uploading image...' ? 'radio-button-checked' : 'radio-button-unchecked'} 
                  size={16} 
                  color={statusText === 'Uploading image...' ? '#045b26' : '#ccc'} 
                />
                <Text style={[
                  styles.statusText,
                  statusText === 'Uploading image...' && styles.activeStatus
                ]}>
                  Uploading image...
                </Text>
              </View>
              
              <View style={styles.statusItem}>
                <MaterialIcons 
                  name={statusText === 'Analyzing cat features...' ? 'radio-button-checked' : 'radio-button-unchecked'} 
                  size={16} 
                  color={statusText === 'Analyzing cat features...' ? '#045b26' : '#ccc'} 
                />
                <Text style={[
                  styles.statusText,
                  statusText === 'Analyzing cat features...' && styles.activeStatus
                ]}>
                  Analyzing cat features...
                </Text>
              </View>
              
              <View style={styles.statusItem}>
                <MaterialIcons 
                  name={statusText === 'Processing results...' ? 'radio-button-checked' : 'radio-button-unchecked'} 
                  size={16} 
                  color={statusText === 'Processing results...' ? '#045b26' : '#ccc'} 
                />
                <Text style={[
                  styles.statusText,
                  statusText === 'Processing results...' && styles.activeStatus
                ]}>
                  Processing results...
                </Text>
              </View>
              
              <View style={styles.statusItem}>
                <MaterialIcons 
                  name={statusText === 'Analysis complete!' ? 'check-circle' : 'radio-button-unchecked'} 
                  size={16} 
                  color={statusText === 'Analysis complete!' ? '#4CAF50' : '#ccc'} 
                />
                <Text style={[
                  styles.statusText,
                  statusText === 'Analysis complete!' && styles.activeStatus
                ]}>
                  Analysis complete!
                </Text>
              </View>
            </View>
            
            {/* Progress Bar */}
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
              <Text style={styles.progressText}>{progress}%</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f7f7f7' 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  backButton: { 
    marginRight: 16 
  },
  title: { 
    fontSize: 20, 
    fontWeight: 'bold' 
  },
  content: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20 
  },
  scanningContainer: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    position: 'relative',
    marginBottom: 24,
  },
  catImage: {
    width: '100%',
    height: '100%',
  },
  scanningOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#045b26',
    opacity: 0.8,
    shadowColor: '#045b26',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  scanningBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#045b26',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 16,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 16,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 16,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 16,
  },
  statusContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusText: {
    fontSize: 14,
    color: '#999',
    marginLeft: 12,
    fontFamily: 'System',
  },
  activeStatus: {
    color: '#045b26',
    fontWeight: '600',
  },
  progressBarContainer: {
    width: '100%',
    marginTop: 8,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#045b26',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#045b26',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
