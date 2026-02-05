import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Modal, Pressable, Alert, Image, Animated, Dimensions } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../utils/config';

const { width, height } = Dimensions.get('window');

export default function IntegrationPage({ onSelect }: { onSelect: (label: string) => void }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [showSecondModal, setShowSecondModal] = useState(false);
  const [selectedPet, setSelectedPet] = useState<string | null>(null);
  const [selectedRegisteredPet, setSelectedRegisteredPet] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownPressed, setDropdownPressed] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(8)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const dogCardScale = useRef(new Animated.Value(1)).current;
  const catCardScale = useRef(new Animated.Value(1)).current;
  const dogCardRotate = useRef(new Animated.Value(0)).current;
  const catCardRotate = useRef(new Animated.Value(0)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;
  const floatingAnim = useRef(new Animated.Value(0)).current;
  
  // In real app, this would be fetched from your database
  const [registeredPets, setRegisteredPets] = useState<any[]>([]);
  const [loadingPets, setLoadingPets] = useState(false);
  
  // Function to fetch registered pets from API
  const fetchRegisteredPets = async (petTypeOverride?: 'DOG' | 'CAT' | null) => {
    console.log('fetchRegisteredPets called');
    try {
      setLoadingPets(true);
      setRegisteredPets([]);
      // Get auth token from storage
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        console.error('No auth token found');
        setRegisteredPets([]);
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/pets`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const pets = await response.json();
        console.log('API call successful, pets received:', pets.length);
        console.log('All pets from API:', pets.map((pet: any) => ({ name: pet.name, species: pet.species })));
        console.log('Selected pet type:', selectedPet);
        
        // Filter pets based on selected pet type (cat/dog)
        const effectiveType = petTypeOverride || selectedPet;
        const filteredPets = pets.filter((pet: any) => {
          const petSpecies = (pet.species || '').toLowerCase();
          console.log(`Checking pet ${pet.name}: species="${pet.species}" (lowercase: "${petSpecies}"), selectedPet="${selectedPet}"`);
          
          if (effectiveType === 'DOG') {
            // Show dogs - check for "dog", "canine", "puppy", etc.
            // Also exclude cats explicitly
            const isDog = (petSpecies.includes('dog') || petSpecies.includes('canine') || petSpecies.includes('puppy')) 
                         && !petSpecies.includes('cat') && !petSpecies.includes('feline') && !petSpecies.includes('kitten');
            console.log(`  Is dog? ${isDog}`);
            return isDog;
          } else if (effectiveType === 'CAT') {
            // Show cats - check for "cat", "feline", "kitten", etc.
            // Also exclude dogs explicitly
            const isCat = (petSpecies.includes('cat') || petSpecies.includes('feline') || petSpecies.includes('kitten'))
                         && !petSpecies.includes('dog') && !petSpecies.includes('canine') && !petSpecies.includes('puppy');
            console.log(`  Is cat? ${isCat}`);
            return isCat;
          }
          return false; // Don't show any pets if pet type is not selected
        });
        setRegisteredPets(filteredPets);
        console.log('Filtered pets for', selectedPet, ':', filteredPets);
        console.log('Current selectedRegisteredPet state:', selectedRegisteredPet);
        
        // If no pets found, show a helpful message
        if (filteredPets.length === 0 && pets.length > 0) {
          console.log('No pets matched the filter, but pets exist. Available species:', [...new Set(pets.map((p: any) => p.species))]);
          console.log(`You selected ${selectedPet} but only have pets with species: ${[...new Set(pets.map((p: any) => p.species))].join(', ')}`);
        }
      } else {
        console.error('Failed to fetch pets:', response.status, response.statusText);
        setRegisteredPets([]);
      }
    } catch (error) {
      console.error('Error fetching pets:', error);
      setRegisteredPets([]);
    } finally {
      setLoadingPets(false);
    }
  };

  const handlePetSelect = async (pet: string) => {
    setSelectedPet(pet);
    
    // Normalize pet type: CAT -> Feline, DOG -> Canine
    const normalizePetType = (petType: string): string => {
      const normalized = petType.toUpperCase();
      if (normalized === 'CAT' || normalized.includes('CAT') || normalized.includes('FELINE')) {
        return 'Feline';
      }
      if (normalized === 'DOG' || normalized.includes('DOG') || normalized.includes('CANINE')) {
        return 'Canine';
      }
      return petType;
    };
    
    // Store assessment data locally instead of creating in database
    const assessmentData = {
      pet_id: 1, // Default pet ID - will be updated when user selects specific pet
      pet_name: "Pet", // Default name - will be updated when user selects specific pet
      pet_type: normalizePetType(pet),  // Normalize to Feline or Canine
      pain_level: "Pending Assessment",
      assessment_date: new Date().toISOString().split('T')[0],
      recommendations: "Assessment in progress...",
      basic_answers: null,
      assessment_answers: null,
      questions_completed: false
    };
    
    // Store the assessment data in AsyncStorage
    await AsyncStorage.setItem('currentAssessmentData', JSON.stringify(assessmentData));
    console.log('Assessment data stored locally:', assessmentData);

    // For DOG, skip the "Pet already registered?" modal and go straight to selection
    if (pet === 'DOG') {
      try {
        const assessmentDataString = await AsyncStorage.getItem('currentAssessmentData');
        if (assessmentDataString) {
          const updated = JSON.parse(assessmentDataString);
          updated.pet_registered = 'yes';
          await AsyncStorage.setItem('currentAssessmentData', JSON.stringify(updated));
        }
      } catch (e) {
        console.log('Failed to mark pet_registered=yes for DOG:', e);
      }
      try {
        await fetchRegisteredPets('DOG');
      } catch (e) {
        console.log('Failed to prefetch registered pets:', e);
      }
      setSelectedRegisteredPet(null);
      setShowSecondModal(true);
      return;
    }
    
    // For CAT, show the modal asking if pet is already registered
    setModalVisible(true);
  };

  const handleModalOption = async (option: string) => {
    console.log('Modal option clicked:', option);
    setModalVisible(false);
    
    if (option === 'No') {
      // Mark pet as not registered in local assessment data
      try {
        const assessmentDataString = await AsyncStorage.getItem('currentAssessmentData');
        if (assessmentDataString) {
          const assessmentData = JSON.parse(assessmentDataString);
          assessmentData.pet_registered = 'no';
          await AsyncStorage.setItem('currentAssessmentData', JSON.stringify(assessmentData));
        }
      } catch (e) {
        console.log('Failed to mark pet_registered=no:', e);
      }
      // Navigate based on pet type
      console.log('Navigating based on pet type:', selectedPet);
      if (selectedPet === 'CAT') {
        onSelect('IntegrationPicture');
      } else if (selectedPet === 'DOG') {
        onSelect('CanineIntegration');
      }
    } else {
      // Mark pet as registered (user will select which one next)
      try {
        const assessmentDataString = await AsyncStorage.getItem('currentAssessmentData');
        if (assessmentDataString) {
          const assessmentData = JSON.parse(assessmentDataString);
          assessmentData.pet_registered = 'yes';
          await AsyncStorage.setItem('currentAssessmentData', JSON.stringify(assessmentData));
        }
      } catch (e) {
        console.log('Failed to mark pet_registered=yes:', e);
      }
      // Fetch registered pets when "Yes" is clicked
      console.log('Fetching registered pets...');
      await fetchRegisteredPets(selectedPet === 'DOG' ? 'DOG' : 'CAT');
      console.log('Setting showSecondModal to true');
      console.log('Current showSecondModal state before setTimeout:', showSecondModal);
      setTimeout(() => {
        console.log('Inside setTimeout - showing second modal');
        setSelectedRegisteredPet(null); // Reset selection when modal opens
        setShowSecondModal(true);
        console.log('showSecondModal set to true');
      }, 300); // slight delay for smooth transition
    }
  };

  const handleNext = async () => {
    setShowSecondModal(false);
    
    if (selectedRegisteredPet) {
      // Update the local assessment data with the selected pet's information
      try {
        const assessmentDataString = await AsyncStorage.getItem('currentAssessmentData');
        console.log('Updating local assessment data with selected pet ID:', selectedRegisteredPet);
        
        if (assessmentDataString) {
          const assessmentData = JSON.parse(assessmentDataString);
          const selectedPetId = typeof selectedRegisteredPet === 'string'
            ? parseInt(selectedRegisteredPet as string, 10)
            : selectedRegisteredPet;
          const selectedPetData = registeredPets.find((pet: any) => pet.id === selectedPetId);
          console.log('Selected pet data:', selectedPetData);
          
          if (selectedPetData) {
            // Update the assessment data with the selected pet's details
            assessmentData.pet_id = selectedPetData.id;
            assessmentData.pet_name = selectedPetData.name;
            assessmentData.pet_type = selectedPetData.species === 'Canine' ? 'Canine' : selectedPetData.species === 'Feline' ? 'Feline' : selectedPetData.species;
            
            console.log('Updated assessment data:', assessmentData);
            
            // Store the updated assessment data back to AsyncStorage
            await AsyncStorage.setItem('currentAssessmentData', JSON.stringify(assessmentData));
            console.log('Successfully updated local assessment data with pet details');
          } else {
            console.error('Selected pet data not found for ID:', selectedRegisteredPet);
          }
        }
      } catch (error) {
        console.error('Error updating local assessment data with pet details:', error);
      }
    }
    
    setSelectedRegisteredPet(null);
    // Navigate to the correct integration questions page
    if (selectedPet === 'DOG') {
      // Route dogs into the canine flow instead of the cat questionnaire
      onSelect('CanineIntegration');
    } else if (selectedPet === 'CAT') {
      onSelect('IntegrationQuestionsCat');
    }
  };

  const getModalPrompt = () => {
    return selectedPet === 'DOG' ? "Select your registered Dog" : "Select your registered Cat";
  };

  const getDropdownPlaceholder = () => {
    return selectedPet === 'DOG' ? 'Choose a registered dog' : 'Choose a registered cat';
  };

  // Clear registered pets when pet type changes
  useEffect(() => {
    setRegisteredPets([]);
    setSelectedRegisteredPet(null);
  }, [selectedPet]);

  useEffect(() => {
    // Initial page animations - super fast
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();

    // Continuous sparkle animation - super fast
    Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(sparkleAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
      ])
    ).start();

    // Floating animation for mascot - super fast
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatingAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(floatingAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, [fadeAnim, slideAnim, scaleAnim, sparkleAnim, floatingAnim]);

  const animateCardPress = (cardType: 'dog' | 'cat') => {
    const scaleRef = cardType === 'dog' ? dogCardScale : catCardScale;
    const rotateRef = cardType === 'dog' ? dogCardRotate : catCardRotate;
    
    Animated.parallel([
      Animated.sequence([
        Animated.timing(scaleRef, { toValue: 0.95, duration: 50, useNativeDriver: true }),
        Animated.timing(scaleRef, { toValue: 1.05, duration: 80, useNativeDriver: true }),
        Animated.timing(scaleRef, { toValue: 1, duration: 50, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.timing(rotateRef, { toValue: 1, duration: 80, useNativeDriver: true }),
        Animated.timing(rotateRef, { toValue: 0, duration: 80, useNativeDriver: true }),
      ])
    ]).start();
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
        {/* Enhanced Hero Section */}
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
          
          {/* Sparkle Effects */}
          <Animated.View style={[
            styles.sparkleContainer,
            {
              opacity: sparkleAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0.3, 1, 0.3]
              })
            }
          ]}>
            <MaterialIcons name="auto-awesome" size={16} color="#FFD700" style={styles.sparkle1} />
            <MaterialIcons name="auto-awesome" size={12} color="#FFB347" style={styles.sparkle2} />
            <MaterialIcons name="auto-awesome" size={14} color="#FFD700" style={styles.sparkle3} />
            <MaterialIcons name="auto-awesome" size={10} color="#FFA500" style={styles.sparkle4} />
          </Animated.View>
          
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
              <Text style={styles.heroTitle}>Choose Your Companion</Text>
              <Text style={styles.heroSubtitle}>AI-powered pain assessment for your beloved pet</Text>
              <View style={styles.badgeContainer}>
                <LinearGradient colors={['#045b26', '#0a7c3a', '#10b981']} style={styles.heroBadge}>
                  <MaterialCommunityIcons name="brain" size={18} color="#FFFFFF" />
                  <Text style={styles.heroBadgeText}>AI Powered</Text>
                  <Ionicons name="sparkles" size={14} color="#FFD700" style={{ marginLeft: 4 }} />
                </LinearGradient>
                <View style={styles.trustBadge}>
                  <FontAwesome5 name="shield-alt" size={12} color="#045b26" />
                  <Text style={styles.trustText}>Veterinary Approved</Text>
                </View>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Enhanced Selection Cards */}
        <View style={styles.cardsContainer}>
          <Text style={styles.selectionPrompt}>Select your pet type to begin</Text>
          
          <View style={styles.cardsRow}>
            {/* Dog Card */}
            <Animated.View style={[
              styles.cardWrapper,
              {
                transform: [
                  { 
                    scale: dogCardScale.interpolate({
                      inputRange: [0.95, 1, 1.05],
                      outputRange: [0.95, 1, 1.05]
                    })
                  },
                  { 
                    rotate: dogCardRotate.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '2deg']
                    })
                  }
                ]
              }
            ]}>
              <TouchableOpacity 
                activeOpacity={0.8} 
                style={styles.selectCard} 
                onPress={() => {
                  animateCardPress('dog');
                  setTimeout(() => handlePetSelect('DOG'), 100);
                }}
              >
                <LinearGradient 
                  colors={['rgba(220, 252, 231, 0.9)', 'rgba(187, 247, 208, 0.9)', 'rgba(134, 239, 172, 0.9)']} 
                  start={{ x: 0, y: 0 }} 
                  end={{ x: 1, y: 1 }} 
                  style={styles.cardBg} 
                />
                
                <View style={styles.cardIconContainer}>
                  <View style={styles.iconCircle}>
                    <MaterialCommunityIcons name="dog" size={36} color="#065f46" />
                  </View>
                  <View style={styles.pawPrints}>
                    <MaterialIcons name="pets" size={12} color="rgba(6, 95, 70, 0.3)" style={styles.paw1} />
                    <MaterialIcons name="pets" size={10} color="rgba(6, 95, 70, 0.3)" style={styles.paw2} />
                    <MaterialIcons name="pets" size={9} color="rgba(6, 95, 70, 0.3)" style={styles.paw3} />
                  </View>
                </View>
                
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>Dog</Text>
                  <Text style={styles.cardSubtitle}>Canine Pain Assessment</Text>
                  <View style={styles.cardFeatures}>
                    <View style={styles.feature}>
                      <Ionicons name="camera" size={11} color="#065f46" />
                      <Text style={styles.featureText}>Photo Analysis</Text>
                    </View>
                    <View style={styles.feature}>
                      <MaterialCommunityIcons name="clipboard-check" size={11} color="#065f46" />
                      <Text style={styles.featureText}>Behavioral Assessment</Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.cardArrow}>
                  <MaterialIcons name="arrow-forward" size={20} color="#065f46" />
                </View>
              </TouchableOpacity>
            </Animated.View>

            {/* Cat Card */}
            <Animated.View style={[
              styles.cardWrapper,
              {
                transform: [
                  { 
                    scale: catCardScale.interpolate({
                      inputRange: [0.95, 1, 1.05],
                      outputRange: [0.95, 1, 1.05]
                    })
                  },
                  { 
                    rotate: catCardRotate.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '-2deg']
                    })
                  }
                ]
              }
            ]}>
              <TouchableOpacity 
                activeOpacity={0.8} 
                style={styles.selectCard} 
                onPress={() => {
                  animateCardPress('cat');
                  setTimeout(() => handlePetSelect('CAT'), 100);
                }}
              >
                <LinearGradient 
                  colors={['rgba(240, 253, 244, 0.9)', 'rgba(220, 252, 231, 0.9)', 'rgba(187, 247, 208, 0.9)']} 
                  start={{ x: 0, y: 0 }} 
                  end={{ x: 1, y: 1 }} 
                  style={styles.cardBg} 
                />
                
                <View style={styles.cardIconContainer}>
                  <View style={styles.iconCircle}>
                    <MaterialCommunityIcons name="cat" size={36} color="#047857" />
                  </View>
                  <View style={styles.pawPrints}>
                    <MaterialIcons name="pets" size={12} color="rgba(4, 120, 87, 0.3)" style={styles.paw1} />
                    <MaterialIcons name="pets" size={10} color="rgba(4, 120, 87, 0.3)" style={styles.paw2} />
                    <MaterialIcons name="pets" size={9} color="rgba(4, 120, 87, 0.3)" style={styles.paw3} />
                  </View>
                </View>
                
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>Cat</Text>
                  <Text style={styles.cardSubtitle}>Feline Pain Assessment</Text>
                  <View style={styles.cardFeatures}>
                    <View style={styles.feature}>
                      <Ionicons name="camera" size={11} color="#047857" />
                      <Text style={styles.featureText}>Photo Analysis</Text>
                    </View>
                    <View style={styles.feature}>
                      <MaterialCommunityIcons name="clipboard-check" size={11} color="#047857" />
                      <Text style={styles.featureText}>Behavioral Assessment</Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.cardArrow}>
                  <MaterialIcons name="arrow-forward" size={20} color="#047857" />
                </View>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </Animated.View>
      {/* First Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.modalPrompt}>Pet already registered?</Text>
            <View style={styles.modalOptions}>
              <Pressable onPress={() => handleModalOption('Yes')} style={styles.modalOptionBtn}>
                <Text style={styles.modalOptionText}>Yes</Text>
              </Pressable>
              <Pressable onPress={() => handleModalOption('No')} style={styles.modalOptionBtn}>
                <Text style={styles.modalOptionText}>No</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      {/* Second Modal */}
      <Modal
        visible={showSecondModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSecondModal(false)}
        onShow={() => console.log('Second modal is now visible')}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.secondModalBox}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowSecondModal(false)}
            >
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.secondModalPrompt}>{getModalPrompt()}</Text>
            <View style={styles.dropdownContainer}>
              <Pressable
                style={[
                  styles.dropdown,
                  dropdownPressed && styles.dropdownPressed
                ]}
                onPress={() => setDropdownOpen(!dropdownOpen)}
                onPressIn={() => setDropdownPressed(true)}
                onPressOut={() => setDropdownPressed(false)}
              >
                <MaterialIcons 
                  name={dropdownOpen ? "expand-less" : "expand-more"} 
                  size={28} 
                  color="#045b26" 
                  style={{ marginRight: 8 }} 
                />
                <Text style={[
                  styles.dropdownText,
                  !selectedRegisteredPet && styles.placeholderText
                ]}>
                  {selectedRegisteredPet && registeredPets.find(pet => pet.id === selectedRegisteredPet) ? 
                    registeredPets.find(pet => pet.id === selectedRegisteredPet)?.name : 
                    getDropdownPlaceholder()}
                </Text>
              </Pressable>
              {/* Dropdown list - only show when dropdown is open */}
              {dropdownOpen && (
                <View style={styles.dropdownList}>
                  {loadingPets ? (
                    <View style={styles.dropdownItem}>
                      <Text style={styles.dropdownItemText}>Loading pets...</Text>
                    </View>
                  ) : registeredPets.length > 0 ? (
                    registeredPets.map((pet: any) => (
                      <Pressable
                        key={pet.id}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setSelectedRegisteredPet(pet.id);
                          setDropdownOpen(false);
                        }}
                      >
                        <Text style={styles.dropdownItemText}>{pet.name}</Text>
                      </Pressable>
                    ))
                  ) : (
                    <View style={styles.dropdownItem}>
                      <Text style={styles.dropdownItemText}>
                        {loadingPets ? 'Loading pets...' : 'No registered pets found'}
                      </Text>
                      {!loadingPets && registeredPets.length === 0 && (
                        <Text style={[styles.dropdownItemText, { fontSize: 12, color: '#666', marginTop: 4 }]}>
                          You don't have any {selectedPet === 'DOG' ? 'dogs' : 'cats'} registered yet.
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              )}
            </View>
            <TouchableOpacity 
              style={[
                styles.nextButton, 
                !selectedRegisteredPet && styles.nextButtonDisabled
              ]} 
              onPress={handleNext}
              disabled={!selectedRegisteredPet}
            >
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
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
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  
  // Background Elements
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
  
  // Enhanced Hero Section
  heroCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 24,
    marginTop: 56,
    marginBottom: 12,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    overflow: 'hidden',
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(4, 91, 38, 0.1)',
  },
  heroBg: {
    ...StyleSheet.absoluteFillObject as any,
  },
  sparkleContainer: {
    ...StyleSheet.absoluteFillObject as any,
    zIndex: 1,
  },
  sparkle1: { position: 'absolute', top: 16, right: 20 },
  sparkle2: { position: 'absolute', top: 30, right: 40 },
  sparkle3: { position: 'absolute', bottom: 50, left: 30 },
  sparkle4: { position: 'absolute', bottom: 30, left: 50 },
  
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 32,
    zIndex: 2,
  },
  heroLeft: { flex: 0.35, alignItems: 'center' },
  heroRight: { flex: 0.65, paddingLeft: 32 },
  
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
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#1f2937', 
    fontFamily: 'Jumper', 
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  heroSubtitle: { 
    fontSize: 13, 
    color: '#6b7280', 
    fontFamily: 'Flink', 
    marginBottom: 12,
    lineHeight: 18,
  },
  
  badgeContainer: {
    flexDirection: 'column',
    gap: 8,
  },
  heroBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    alignSelf: 'flex-start', 
    borderRadius: 12, 
    paddingHorizontal: 10, 
    paddingVertical: 6,
    elevation: 3,
    shadowColor: '#045b26',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  heroBadgeText: { 
    color: '#FFFFFF', 
    fontSize: 11, 
    fontWeight: 'bold', 
    fontFamily: 'Jumper', 
    marginLeft: 6,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(4, 91, 38, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  trustText: {
    color: '#045b26',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
    fontFamily: 'Flink',
  },

  // Enhanced Selection Cards
  cardsContainer: {
    marginTop: 16,
    marginBottom: 8,
  },
  selectionPrompt: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'Jumper',
    letterSpacing: 0.2,
  },
  cardsRow: { 
    flexDirection: 'column', 
    gap: 12,
    marginHorizontal: 16,
    paddingBottom: 20,
  },
  cardWrapper: {
    width: '100%',
    marginBottom: 0,
  },
  selectCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 18,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    minHeight: 110,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardBg: { 
    ...StyleSheet.absoluteFillObject as any,
  },
  
  cardIconContainer: {
    position: 'relative',
    marginRight: 16,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  pawPrints: {
    position: 'absolute',
    top: -10,
    right: -15,
    width: 40,
    height: 40,
  },
  paw1: { position: 'absolute', top: 5, right: 8 },
  paw2: { position: 'absolute', top: 15, right: 20 },
  paw3: { position: 'absolute', top: 25, right: 5 },
  
  cardContent: {
    flex: 1,
  },
  cardTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#1f2937', 
    fontFamily: 'Jumper', 
    marginBottom: 3,
    letterSpacing: 0.3,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'Flink',
    marginBottom: 8,
  },
  cardFeatures: {
    flexDirection: 'column',
    gap: 4,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featureText: {
    fontSize: 10,
    color: '#6b7280',
    fontFamily: 'Flink',
    fontWeight: '500',
  },
  
  cardArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  // Enhanced Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalBox: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: 'rgba(255, 255, 255, 0.98)', 
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(4, 91, 38, 0.1)',
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
  modalPrompt: {
    fontSize: 20,
    color: '#1f2937',
    fontWeight: 'bold',
    marginBottom: 24,
    marginTop: 8,
    textAlign: 'center',
    fontFamily: 'Jumper',
    letterSpacing: 0.3,
  },
  modalOptions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalOptionBtn: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: '#045b26',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#045b26',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modalOptionText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Jumper',
    letterSpacing: 0.5,
  },
  
  // Enhanced Second Modal
  secondModalBox: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(4, 91, 38, 0.1)',
  },
  secondModalPrompt: {
    fontSize: 20,
    color: '#1f2937',
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 8,
    textAlign: 'center',
    fontFamily: 'Jumper',
    letterSpacing: 0.3,
  },

  nextButton: {
    width: '100%',
    maxWidth: 160,
    paddingVertical: 14,
    backgroundColor: '#045b26',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    elevation: 4,
    shadowColor: '#045b26',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    fontFamily: 'Jumper',
  },
  dropdownContainer: {
    position: 'relative',
    width: '100%',
    maxWidth: 280,
    marginBottom: 24,
    zIndex: 1000,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(240, 253, 244, 0.8)',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 2,
    borderColor: 'rgba(4, 91, 38, 0.2)',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  dropdownPressed: {
    backgroundColor: 'rgba(232, 245, 232, 0.9)',
    borderColor: 'rgba(4, 91, 38, 0.3)',
    elevation: 1,
  },
  dropdownText: {
    fontSize: 15,
    color: '#1f2937',
    flex: 1,
    fontFamily: 'Flink',
    fontWeight: '500',
  },
  placeholderText: {
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  dropdownList: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 16,
    marginTop: 4,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    zIndex: 1000,
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    borderWidth: 1,
    borderColor: 'rgba(4, 91, 38, 0.1)',
    maxHeight: 200,
  },
  dropdownItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(4, 91, 38, 0.05)',
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#1f2937',
    fontFamily: 'Flink',
    fontWeight: '500',
  },
  nextButtonDisabled: {
    backgroundColor: '#d1d5db',
    elevation: 1,
  },
}); 