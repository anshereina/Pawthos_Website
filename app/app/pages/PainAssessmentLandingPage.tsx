import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView, Modal, Animated, Dimensions } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'react-native';

const { width, height } = Dimensions.get('window');

interface PainAssessmentLandingPageProps {
  onGetStarted: () => void;
  onBack: () => void;
  onViewHistory: () => void;
}

export default function PainAssessmentLandingPage({ 
  onGetStarted, 
  onBack, 
  onViewHistory 
}: PainAssessmentLandingPageProps) {
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [termsModalVisible, setTermsModalVisible] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(8)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const floatingAnim = useRef(new Animated.Value(0)).current;
  const scrollAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatingAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(floatingAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
      ])
    ).start();

    // Scrolling banner animation - continuous loop
    const itemWidth = 160; // Approximate width per item (including margins)
    const moveDistance = itemWidth * 3; // Distance to move for 3 items
    
    const animate = () => {
      scrollAnim.setValue(0);
      Animated.timing(scrollAnim, {
        toValue: -moveDistance,
        duration: 5000,
        useNativeDriver: true,
      }).start(() => {
        animate(); // Restart for seamless loop
      });
    };
    animate();
  }, []);

  const handleCheckboxPress = () => {
    if (!checkboxChecked) {
      setTermsModalVisible(true);
    } else {
      setCheckboxChecked(false);
      setTermsAgreed(false);
    }
  };

  const handleTermsAgree = () => {
    setTermsAgreed(true);
    setCheckboxChecked(true);
    setTermsModalVisible(false);
  };

  const handleTermsCancel = () => {
    setTermsModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient 
        colors={['#f8fffe', '#f0fdf4', '#e8f5e8']} 
        style={StyleSheet.absoluteFillObject}
      />
      
      {/* Floating Background Elements */}
      <Animated.View style={[
        styles.backgroundElement1,
        {
          transform: [{
            translateY: floatingAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -20]
            })
          }]
        }
      ]}>
        <MaterialIcons name="pets" size={24} color="rgba(4, 91, 38, 0.1)" />
      </Animated.View>
      
      <Animated.View style={[
        styles.backgroundElement2,
        {
          transform: [{
            translateY: floatingAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 15]
            })
          }]
        }
      ]}>
        <MaterialCommunityIcons name="heart-pulse" size={20} color="rgba(4, 91, 38, 0.08)" />
      </Animated.View>

      <Animated.View style={{ 
        flex: 1, 
        opacity: fadeAnim, 
        transform: [
          { translateY: slideAnim },
          { scale: scaleAnim }
        ] 
      }}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Hero Section */}
          <Animated.View style={[
            styles.heroCard,
            {
              transform: [{
                translateY: floatingAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -5]
                })
              }]
            }
          ]}>
            <LinearGradient 
              colors={['rgba(255, 255, 255, 0.95)', 'rgba(240, 253, 244, 0.95)', 'rgba(232, 245, 232, 0.95)']} 
              start={{ x: 0, y: 0 }} 
              end={{ x: 1, y: 1 }} 
              style={styles.heroBg} 
            />
            
            <View style={styles.heroContent}>
              <View style={styles.heroLeft}>
                <Animated.View style={[
                  styles.mascotWrap,
                  {
                    transform: [{
                      translateY: floatingAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -8]
                      })
                    }]
                  }
                ]}>
                  <LinearGradient 
                    colors={['#E8F5E8', '#D1F3DA', '#B8E6C1']} 
                    style={styles.mascotGradient}
                  />
                  <Image source={require('../../assets/images/pawtho.png')} style={styles.mascotImage} resizeMode="cover" />
                  <View style={styles.mascotGlow} />
                </Animated.View>
              </View>
              <View style={styles.heroRight}>
                <Text style={styles.heroTitle}>AI Pain Assessment</Text>
                <Text style={styles.heroSubtitle}>Know your pet's pain level in a minute</Text>
              </View>
            </View>
          </Animated.View>

          {/* Scrolling Banner */}
          <View style={styles.bannerContainer}>
            <Animated.View style={[styles.bannerContent, { transform: [{ translateX: scrollAnim }] }]}>
              <LinearGradient
                colors={['#045b26', '#0a7c3a', '#10b981']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.bannerItem}
              >
                <MaterialIcons name="psychology" size={18} color="#fff" style={styles.bannerIcon} />
                <Text style={styles.bannerText}>AI-powered</Text>
              </LinearGradient>
              <LinearGradient
                colors={['#045b26', '#0a7c3a', '#10b981']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.bannerItem}
              >
                <MaterialIcons name="flash-on" size={18} color="#fff" style={styles.bannerIcon} />
                <Text style={styles.bannerText}>Instant Results</Text>
              </LinearGradient>
              <LinearGradient
                colors={['#045b26', '#0a7c3a', '#10b981']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.bannerItem}
              >
                <MaterialIcons name="verified" size={18} color="#fff" style={styles.bannerIcon} />
                <Text style={styles.bannerText}>Vet Approved</Text>
              </LinearGradient>
              {/* Duplicate for seamless loop */}
              <LinearGradient
                colors={['#045b26', '#0a7c3a', '#10b981']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.bannerItem}
              >
                <MaterialIcons name="psychology" size={18} color="#fff" style={styles.bannerIcon} />
                <Text style={styles.bannerText}>AI-powered</Text>
              </LinearGradient>
              <LinearGradient
                colors={['#045b26', '#0a7c3a', '#10b981']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.bannerItem}
              >
                <MaterialIcons name="flash-on" size={18} color="#fff" style={styles.bannerIcon} />
                <Text style={styles.bannerText}>Instant Results</Text>
              </LinearGradient>
              <LinearGradient
                colors={['#045b26', '#0a7c3a', '#10b981']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.bannerItem}
              >
                <MaterialIcons name="verified" size={18} color="#fff" style={styles.bannerIcon} />
                <Text style={styles.bannerText}>Vet Approved</Text>
              </LinearGradient>
            </Animated.View>
          </View>

          {/* Steps Section */}
          <View style={styles.stepsContainer}>
            <Text style={styles.stepsTitle}>Simple step process</Text>
            {/* Step Numbers with Connectors */}
            <View style={styles.stepsRow}>
              <View style={styles.stepItem}>
                <LinearGradient 
                  colors={['#045b26', '#0a7c3a']} 
                  style={styles.stepNumberCircle}
                >
                  <Text style={styles.stepNumberText}>1</Text>
                </LinearGradient>
                <Text style={styles.stepLabel}>Choose Pet</Text>
              </View>
              <View style={styles.connectorLine}>
                <View style={styles.line} />
              </View>
              <View style={styles.stepItem}>
                <LinearGradient 
                  colors={['#0a7c3a', '#10b981']} 
                  style={styles.stepNumberCircle}
                >
                  <Text style={styles.stepNumberText}>2</Text>
                </LinearGradient>
                <Text style={styles.stepLabel}>Scan Image</Text>
              </View>
              <View style={styles.connectorLine}>
                <View style={styles.line} />
              </View>
              <View style={styles.stepItem}>
                <LinearGradient 
                  colors={['#10b981', '#A1D998']} 
                  style={styles.stepNumberCircle}
                >
                  <Text style={styles.stepNumberText}>3</Text>
                </LinearGradient>
                <Text style={styles.stepLabel}>Answer</Text>
              </View>
              <View style={styles.connectorLine}>
                <View style={styles.line} />
              </View>
              <View style={styles.stepItem}>
                <LinearGradient 
                  colors={['#A1D998', '#B8E6C1']} 
                  style={styles.stepNumberCircle}
                >
                  <Text style={[styles.stepNumberText, styles.stepNumberTextLight]}>4</Text>
                </LinearGradient>
                <Text style={styles.stepLabel}>Results</Text>
              </View>
            </View>

            {/* Checkbox Section */}
            <TouchableOpacity 
              style={styles.checkboxContainer}
              onPress={handleCheckboxPress}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, checkboxChecked && styles.checkboxChecked]}>
                {checkboxChecked && (
                  <MaterialIcons name="check" size={20} color="#fff" />
                )}
              </View>
              <Text style={styles.checkboxText}>
                I understand this is not a substitute for veterinary care.
              </Text>
            </TouchableOpacity>

            {/* Start Assessment Button */}
            <TouchableOpacity
              style={[
                styles.startButton,
                !termsAgreed && styles.startButtonDisabled
              ]}
              onPress={onGetStarted}
              disabled={!termsAgreed}
              activeOpacity={0.8}
            >
              <LinearGradient 
                colors={termsAgreed ? ['#045b26', '#0a7c3a', '#10b981'] : ['#d1d5db', '#9ca3af']} 
                style={styles.buttonGradient}
              >
                <Text style={styles.startButtonText}>Start Assessment</Text>
                <MaterialIcons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>

      {/* Terms & Conditions Modal */}
      <Modal
        visible={termsModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleTermsCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.termsModalBox}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={handleTermsCancel}
            >
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
            
            <Text style={styles.termsModalTitle}>Terms & Conditions</Text>
            
            <ScrollView style={styles.termsContent} showsVerticalScrollIndicator={true}>
              <View style={styles.termItem}>
                <MaterialIcons name="info" size={20} color="#045b26" style={styles.termIcon} />
                <Text style={styles.termText}>This is a preliminary tool only</Text>
              </View>
              
              <View style={styles.termItem}>
                <MaterialIcons name="warning" size={20} color="#045b26" style={styles.termIcon} />
                <Text style={styles.termText}>Results should not replace professional veterinary care</Text>
              </View>
              
              <View style={styles.termItem}>
                <MaterialIcons name="medical-services" size={20} color="#045b26" style={styles.termIcon} />
                <Text style={styles.termText}>Always consult a licensed veterinarian for proper diagnosis</Text>
              </View>
              
              <View style={styles.termItem}>
                <MaterialIcons name="emergency" size={20} color="#F44336" style={styles.termIcon} />
                <Text style={styles.termText}>Seek immediate veterinary attention for emergency situations</Text>
              </View>
            </ScrollView>

            <View style={styles.termsButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleTermsCancel}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.agreeButton}
                onPress={handleTermsAgree}
                activeOpacity={0.7}
              >
                <LinearGradient 
                  colors={['#045b26', '#0a7c3a']} 
                  style={styles.agreeButtonGradient}
                >
                  <Text style={styles.agreeButtonText}>I Agree</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  backgroundElement1: {
    position: 'absolute',
    top: height * 0.15,
    right: width * 0.1,
    zIndex: 0,
  },
  backgroundElement2: {
    position: 'absolute',
    top: height * 0.7,
    left: width * 0.08,
    zIndex: 0,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  heroCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 24,
    marginBottom: 24,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(4, 91, 38, 0.1)',
  },
  heroBg: {
    ...StyleSheet.absoluteFillObject as any,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 32,
  },
  heroLeft: {
    flex: 0.35,
    alignItems: 'center',
  },
  heroRight: {
    flex: 0.65,
    paddingLeft: 32,
  },
  mascotWrap: {
    width: 90,
    height: 90,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    elevation: 8,
    shadowColor: '#045b26',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  mascotGradient: {
    ...StyleSheet.absoluteFillObject as any,
  },
  mascotImage: {
    width: '100%',
    height: '100%',
    zIndex: 2,
  },
  mascotGlow: {
    ...StyleSheet.absoluteFillObject as any,
    backgroundColor: 'rgba(4, 91, 38, 0.1)',
    borderRadius: 24,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1f2937',
    fontFamily: 'Jumper',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    fontFamily: 'Flink',
    lineHeight: 22,
  },
  bannerContainer: {
    height: 50,
    overflow: 'hidden',
    marginBottom: 24,
    marginTop: 8,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerItem: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginHorizontal: 8,
    minWidth: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerIcon: {
    marginRight: 8,
  },
  bannerText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Jumper',
    letterSpacing: 0.5,
  },
  stepsContainer: {
    marginTop: 8,
    marginBottom: 24,
    alignItems: 'center',
  },
  stepsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    fontFamily: 'Jumper',
    marginBottom: 24,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 16,
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  stepNumberCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#045b26',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    marginBottom: 12,
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Jumper',
  },
  stepNumberTextLight: {
    color: '#045b26',
  },
  connectorLine: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    width: 32,
    marginTop: 28,
  },
  line: {
    width: '100%',
    height: 2,
    backgroundColor: '#A1D998',
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
    fontFamily: 'Flink',
    textAlign: 'center',
    marginBottom: 30
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(4, 91, 38, 0.1)',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#045b26',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#045b26',
    borderColor: '#045b26',
  },
  checkboxText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    fontFamily: 'Flink',
    lineHeight: 20,
  },
  startButton: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#045b26',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  startButtonDisabled: {
    elevation: 1,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Jumper',
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  termsModalBox: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 24,
    padding: 28,
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(4, 91, 38, 0.1)',
    maxHeight: '80%',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
    zIndex: 1,
  },
  termsModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#045b26',
    textAlign: 'center',
    marginBottom: 24,
    marginTop: 8,
    fontFamily: 'Jumper',
    letterSpacing: 0.3,
  },
  termsContent: {
    maxHeight: 300,
    marginBottom: 24,
  },
  termItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(4, 91, 38, 0.1)',
  },
  termIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  termText: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
    fontFamily: 'Flink',
    lineHeight: 22,
  },
  termsButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Jumper',
  },
  agreeButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#045b26',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  agreeButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  agreeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Jumper',
    letterSpacing: 0.5,
  },
});
