import React, { useState } from 'react';
import {
  Linking,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type TipKey = 'healthy' | 'fearful' | 'aggressive' | 'sick';

type TipSection = { title?: string; bullets: string[] };
type TipDetail = { id: TipKey; label: string; sections: TipSection[] };

const sourceUrl =
  'https://www.petfinder.com/adopt-or-get-involved/animal-shelters-rescues/starting/animal-handling-safety-tips/';

const tips: TipDetail[] = [
  {
    id: 'healthy',
    label: 'Handling Healthy, Even-Tempered Animals',
    sections: [
      {
        title: 'Signs',
        bullets: [
          'No signs of illness or injury. Animal is at the front of the cage with relaxed body postures.',
          'Head-bumping and scent marking with glands in the chin and above the eyes (cats).',
          'Wiggly body, bouncing up and down, tail wagging, licking, and nose nudging (dogs).',
        ],
      },
      {
        bullets: [
          'Before opening the cage, speak to the animal in a pleasant, upbeat voice.',
          'Let the animal sniff at your fingers through the bars and review the kennel card if new to you.',
        ],
      },
      {
        title: 'For Dogs',
        bullets: [
          'Prepare a kennel rope or lead and slip it on through a small cage opening without letting the dog loose.',
          'Use your knee/leg or hip/shoulder to control the door so both hands stay free if needed.',
          'Keep the slip lead taut enough that the dog cannot back out if startled, then allow the dog to exit.',
          'To return a dog: open the door wide, gesture forward with “go in,” toss a treat if needed, close quickly, and remove the lead through a crack.',
          'Do not enter the cage unless you truly know the dog; some become territorial in their space.',
          'For small dogs in higher cages: keep one hand behind the head on the lead, cradle the chest/abdomen with the other, lift and hold close, keeping the head away if needed.',
        ],
      },
      {
        title: 'For Cats',
        bullets: [
          'Similar to small dogs: keep the cat facing away by placing the crook of your hand at the base of the skull.',
          'Support the chest and abdomen with your other arm, cradling the cat against your body (football carry).',
          'Move to another cage or carrier; avoid long-distance carrying as cats can startle quickly.',
        ],
      },
    ],
  },
  {
    id: 'fearful',
    label: 'Handling Fearful Animals',
    sections: [
      {
        title: 'Signs',
        bullets: [
          'Dilated pupils, tense posture, staying at the rear of the cage.',
          'Facing the back corner while glancing over the shoulder; ears pulled back.',
          'Tucked tail in dogs; agitated tail swishing in cats.',
        ],
      },
      {
        bullets: [
          'Speak softly in an upbeat tone and avoid looming head-on; stand sideways or crouch.',
          'Avoid direct eye contact; offer a treat without staring and let the animal approach at its pace.',
          'Whenever possible, allow 12–48 hours to acclimate before removing a fearful animal from its cage.',
          'Cover fearful cats’ cage fronts and house fearful dogs in the quietest area available.',
        ],
      },
      {
        title: 'For Dogs',
        bullets: [
          'For mildly fearful dogs, slip on a lead without entering far into the cage, then gently coax out.',
          'Allow extra leash (3–5 feet) so the dog can move slightly away; muzzle before treatment if needed.',
          'Use an animal control pole for excessively fearful dogs only when movement is required.',
        ],
      },
      {
        title: 'For Cats',
        bullets: [
          'Move slowly and quietly; mildly fearful cats can be handled by scruffing and holding forepaws while securing the body against your side.',
          'For very fearful cats, use a towel or blanket to scoop into a carrier; to move to a cage, tilt the carrier and close the cage door swiftly.',
          'For feral cats, use a squeeze cage or net for inoculations.',
        ],
      },
    ],
  },
  {
    id: 'aggressive',
    label: 'Handling Aggressive Animals',
    sections: [
      {
        title: 'Signs',
        bullets: [
          'Growling, snarling, snapping, charging the front of the cage.',
          'Hard staring, ferocious barking, lunging, or frozen stance at the front.',
        ],
      },
      {
        bullets: [
          'If handling is not essential, do not proceed. When necessary, take every precaution.',
          'Use an animal control pole with dogs and cat graspers or a net with cats (never a pole on cats).',
          'Have a second experienced handler when possible; consider double leashing aggressive dogs.',
          'If attacked on lead, move the leash arm up and away; “hanging” a dog is only for self-defense to stop an attack.',
        ],
      },
    ],
  },
  {
    id: 'sick',
    label: 'Handling Sick Injured Animals',
    sections: [
      {
        title: 'Signs',
        bullets: [
          'Labored breathing; blood, mucous, or open wounds.',
          'Limbs at odd angles, limping, whimpering, lethargy, or not eating.',
        ],
      },
      {
        bullets: [
          'Even the sweetest animal can bite in pain; ask medical staff to assess before moving if possible.',
          'If an animal arrives in a box or carrier, keep it confined until a medical exam when circumstances allow.',
          'After treatment, be gentle and avoid pressure on injured areas; provide body harnesses if neck injuries are present.',
          'Soft bedding helps animals with splints or casts; e-collars may be needed to protect bandages.',
          'House animals with e-collars in the quietest possible spot; reduced noise helps with recovery.',
        ],
      },
      {
        bullets: ['By assessing behavior and responding accordingly, you protect both ends of the lead.'],
      },
    ],
  },
];

export default function SafeHandlingTipsPage() {
  const [selectedTip, setSelectedTip] = useState<TipDetail | null>(null);

  const openSource = () => Linking.openURL(sourceUrl).catch(() => null);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.infoBox}>
          <Text style={styles.sectionTitle}>Pet Safety Guidelines</Text>
          <TouchableOpacity onPress={openSource} activeOpacity={0.8}>
            <Text style={styles.linkText}>
              Source: https://www.petfinder.com/adopt-or-get-involved/animal-shelters-rescues/starting/animal-handling-safety-tips/
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonGrid}>
          {tips.map((tip) => (
            <TouchableOpacity
              key={tip.id}
              style={styles.tipButton}
              activeOpacity={0.9}
              onPress={() => setSelectedTip(tip)}
            >
              <Text style={styles.tipButtonText}>{tip.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <Modal
        visible={!!selectedTip}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedTip(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScroll}
            >
              <Text style={styles.modalTitle}>{selectedTip?.label}</Text>
              {selectedTip?.sections.map((section, index) => (
                <View key={index} style={styles.sectionBlock}>
                  {section.title ? (
                    <Text style={styles.subHeader}>{section.title}</Text>
                  ) : null}
                  {section.bullets.map((bullet, bulletIndex) => (
                    <Text key={bulletIndex} style={styles.bulletText}>
                      • {bullet}
                    </Text>
                  ))}
                </View>
              ))}
            </ScrollView>
            <Pressable style={styles.closeButton} onPress={() => setSelectedTip(null)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 32 },
  infoBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  sectionTitle: {
    color: '#045b26',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10,
  },
  linkText: {
    color: '#0a7cd4',
    fontSize: 14,
    lineHeight: 20,
    textDecorationLine: 'underline',
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  tipButton: {
    backgroundColor: '#045b26',
    paddingVertical: 18,
    paddingHorizontal: 14,
    borderRadius: 14,
    flexBasis: '48%',
    minHeight: 110,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  tipButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    maxHeight: '90%',
  },
  modalScroll: {
    paddingBottom: 12,
  },
  modalTitle: {
    color: '#045b26',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 8,
  },
  sectionBlock: { marginBottom: 12 },
  subHeader: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#045b26',
    marginBottom: 6,
  },
  bulletText: {
    color: '#333',
    fontSize: 14,
    lineHeight: 21,
    marginLeft: 12,
    marginBottom: 4,
  },
  closeButton: {
    backgroundColor: '#045b26',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
});













