import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

export default function SignOfRabiesPage({ onBack }: { onBack?: () => void }) {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
      </View>
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Info Box */}
        <View style={styles.infoBox}>
          {/* Introduction */}
          <Text style={styles.introText}>
            Rabies is a dangerous disease of animals transmissible to humans through bites of an infected animal.
          </Text>
          
          {/* Canine Rabies */}
          <Text style={styles.sectionTitle}>Signs of Canine Rabies</Text>
          <Text style={styles.subHeader}>A. Furious Type:</Text>
          <Text style={styles.bulletText}>• A change from a friendly disposition into wild, vicious behavior.</Text>
          <Text style={styles.bulletText}>• Whining, as if in pain.</Text>
          <Text style={styles.bulletText}>• Foaming of the mouth.</Text>
          <Text style={styles.bulletText}>• If on a leash, biting objects within its reach; if caged, biting even the cage.</Text>
          <Text style={styles.bulletText}>• Difficulty in eating or drinking.</Text>
          <Text style={styles.bulletText}>• Restlessness.</Text>
          <Text style={styles.bulletText}>• Running aimlessly, snapping at imaginary objects, and biting anyone or anything in its path.</Text>
          
          <Text style={styles.subHeader}>B. Dumb Type:</Text>
          <Text style={styles.bulletText}>• Becoming lethargic and depressed.</Text>
          <Text style={styles.bulletText}>• Hiding in dark, quiet places; sluggish or sleepy.</Text>
          <Text style={styles.bulletText}>• Refusing to eat.</Text>
          <Text style={styles.bulletText}>• Appearing to be staring at a distant object.</Text>
          <Text style={styles.bulletText}>• The lower jaw drops, the tongue hangs out, and the dog salivates continuously.</Text>
          <Text style={styles.bulletText}>• Difficulty in swallowing/drinking.</Text>
          <Text style={styles.bulletText}>• Lameness.</Text>
          <Text style={styles.bulletText}>• Difficulty in breathing.</Text>
          <Text style={styles.bulletText}>• Dying suddenly without any preceding signs.</Text>
          
          {/* Feline Rabies */}
          <Text style={styles.sectionTitle}>Signs of Feline Rabies</Text>
          <Text style={styles.subHeader}>A. Prodromal Stage (Early Stage):</Text>
          <Text style={styles.bulletText}>• Personality Changes: The cat's usual behavior flips. A friendly cat might become withdrawn or irritable, while a shy cat might become unusually clingy.</Text>
          <Text style={styles.bulletText}>• They might lose their appetite, hide, or act restless or overly tired.</Text>
          
          <Text style={styles.subHeader}>B. Furious Type:</Text>
          <Text style={styles.bulletText}>• Extreme Aggression: Cats become very aggressive, attacking without warning using both teeth and claws.</Text>
          <Text style={styles.bulletText}>• They become easily agitated by light, sound, or touch.</Text>
          <Text style={styles.bulletText}>• They might make strange, excessive meows or cries.</Text>
          <Text style={styles.bulletText}>• They can become disoriented, wander aimlessly, and have seizures.</Text>
          <Text style={styles.bulletText}>• Drooling/Foaming: They struggle to swallow, leading to a lot of drooling or foamy saliva.</Text>
          <Text style={styles.bulletText}>• They may bite or scratch at nothing in particular.</Text>
          <Text style={styles.bulletText}>• Unusually, they might lose their fear of people or other animals.</Text>
          
          <Text style={styles.subHeader}>C. Dumb (Paralytic) Type:</Text>
          <Text style={styles.bulletText}>• Quiet and Withdrawn: Cats become very lethargic, depressed, and seek out dark, quiet places to hide.</Text>
          <Text style={styles.bulletText}>• They refuse to eat or drink.</Text>
          <Text style={styles.bulletText}>• Difficulty Swallowing: Their lower jaw might drop, and they drool continuously because they can't swallow.</Text>
          <Text style={styles.bulletText}>• Paralysis: Weakness starts in one area (like a limb) and spreads, eventually making them unable to move or stand.</Text>
          <Text style={styles.bulletText}>• They might stare blankly.</Text>
          <Text style={styles.bulletText}>• Eventually, they struggle to breathe, fall into a coma, and die suddenly.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  infoBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  introText: {
    color: '#333',
    fontSize: 15,
    marginBottom: 6,
    lineHeight: 22,
  },
  sectionTitle: {
    color: '#045b26',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
    marginTop: 18,
  },
  subHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#045b26',
    marginTop: 12,
    marginBottom: 6,
  },
  sectionText: {
    color: '#333',
    fontSize: 15,
    marginBottom: 6,
    lineHeight: 22,
  },
  bulletText: {
    color: '#333',
    fontSize: 15,
    marginLeft: 16,
    marginBottom: 4,
    lineHeight: 22,
  },
}); 