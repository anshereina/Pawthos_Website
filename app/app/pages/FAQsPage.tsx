import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

const FAQS = [
    {
        question: 'How does the Pain Assessment work?',
        answer: 'The Pain Assessment is a comprehensive tool designed to help you identify and understand your pet\'s discomfort levels. This assessment uses scientifically validated methods to evaluate pain in both cats and dogs.\n\nHow it works:\n1) Answer a detailed checklist about your pet\'s behavior, posture, and daily activities\n2) For dogs, complete the BEAP (Behavioral Assessment of Pain) questionnaire\n3) For cats, optionally take or upload a clear photo of your cat\'s face for facial expression analysis\n4) Our system analyzes the responses using veterinary-informed scoring algorithms\n5) You\'ll receive a detailed result with pain level classification and actionable recommendations\n\nPain Level Classifications:\n• For Cats: Level 0 (No Pain), Level 1 (Moderate Pain), Level 2 (Severe Pain)\n• For Dogs: Levels 0–4 (ranging from No Pain to Severe Pain)\n\nFor Cats (Feline Grimace Scale–inspired):\nThe assessment evaluates facial expressions and behaviors:\n• Facial Features: narrowed eyes, ears turned sideways or back, whiskers pulled forward, tense muzzle\n• Behavioral Changes: hiding more than usual, reduced grooming, reluctance to jump or climb\n• Activity & Appetite: decreased activity levels, reduced appetite or water intake, changes in sleep patterns\n\nFor Dogs (BEAP - Behavioral Assessment of Pain):\nThe assessment focuses on behavioral and postural indicators:\n• Postural Changes: hunched back, limping, stiffness when moving, guarding a specific body part\n• Behavioral Signs: restlessness, whining or vocalizing, growling when touched, avoiding play or interaction\n• Activity & Appetite: reduced activity levels, changes in appetite or drinking habits, reluctance to exercise\n\nImportant Notes:\n• This tool is designed to support—but does not replace—professional veterinary examination\n• Always seek immediate veterinary care for emergencies such as: collapse, seizures, severe bleeding, persistent vomiting, difficulty breathing, or sudden behavioral changes\n• Regular pain assessments can help track your pet\'s condition over time\n• Consult with your veterinarian for persistent or worsening symptoms'
    },
    {
        question: 'How do I book an appointment?',
        answer: 'Booking an appointment is simple and straightforward:\n\n1) Navigate to the Appointment section from the main menu\n2) Select your preferred date and time from the available slots\n3) Choose the type of service you need (consultation, vaccination, check-up, etc.)\n4) Select the pet for the appointment (if you have multiple pets registered)\n5) Review your appointment details and confirm the booking\n\nYou will receive a confirmation notification once your appointment is successfully booked. You can also view, modify, or cancel your appointments from the Appointment section.'
    },
    {
        question: 'How do I add a new pet profile?',
        answer: 'Adding a new pet profile helps you manage all your pet\'s information in one place:\n\n1) Navigate to Pet Information > Pet Profile from the main menu\n2) Tap the "Add Pet" button (located at the top right of the screen)\n3) Fill in all required information including:\n   • Pet\'s name\n   • Species (Canine or Feline)\n   • Breed\n   • Color\n   • Date of birth\n   • Gender\n   • Reproductive status\n4) Optionally upload a photo of your pet\n5) Review all information and submit\n\nOnce added, you can access your pet\'s complete profile, medical records, vaccination history, and more from the Pet Profile section.'
    },
    {
        question: 'How can I view my pet\'s vaccine records?',
        answer: 'Accessing your pet\'s vaccination records is easy:\n\n1) Navigate to Pet Information > Vaccine Records from the main menu\n2) You\'ll see a list of all your registered pets\n3) Select a pet to view their complete vaccination history\n4) The records will show:\n   • Vaccine type and name\n   • Date of administration\n   • Next due date (if applicable)\n   • Veterinarian who administered the vaccine\n   • Batch number and other relevant details\n\nYou can also access vaccination records directly from your pet\'s profile page. These records are important for maintaining your pet\'s health and may be required for travel permits or other services.'
    },
    {
        question: 'How do I get a shipping permit?',
        answer: 'To obtain a shipping permit for your pet:\n\n1) Navigate to Pet Information or Other Services from the main menu\n2) Select "Shipping Permit" from the available options\n3) Fill out all required information including:\n   • Pet details (name, species, breed, etc.)\n   • Owner information\n   • Destination details\n   • Travel dates\n   • Health certificate information (if required)\n4) Upload any necessary documents (vaccination records, health certificates)\n5) Review and submit your application\n\nProcessing times may vary, so it\'s recommended to apply well in advance of your travel date. You\'ll receive notifications about the status of your permit application.'
    },
    {
        question: 'How do I reset my password?',
        answer: 'If you\'ve forgotten your password, you can reset it easily:\n\n1) Go to the login page\n2) Tap the "Forgot password?" link (usually located below the password field)\n3) Enter your registered email address\n4) Check your email for a password reset link\n5) Click the link in the email to open the password reset page\n6) Enter your new password (make sure it meets the security requirements)\n7) Confirm your new password and submit\n\nIf you don\'t receive the email, check your spam folder. The reset link is typically valid for a limited time (usually 24 hours).'
    },
];

const styles = StyleSheet.create({
    container: { flex: 1, padding: 24, backgroundColor: '#f7f7f7' },

    notificationBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#4CAF50',
        borderRadius: 14,
        padding: 18,
        marginBottom: 16,
        elevation: 2,
    },
    iconCol: {
        marginRight: 14,
        marginTop: 2,
    },
    eventTitle: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 17,
        marginBottom: 6,
    },
    eventDetail: {
        color: '#fff',
        fontSize: 12,
        marginBottom: 4,
        fontWeight: 'bold',
    },
    location: {
        color: '#fff',
        fontSize: 12,
        marginBottom: 4,
        fontWeight: 'bold',
    },
    reminder: {
        color: '#fff',
        fontSize: 12,
        fontStyle: 'italic',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 18,
        marginBottom: 14,
        elevation: 1,
    },
    questionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    question: { fontSize: 16, fontWeight: 'bold', color: '#045b26', flex: 1 },
    answer: { fontSize: 15, color: '#333', marginLeft: 28 },
    linkContainer: {
        marginTop: 12,
        marginLeft: 28,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    linkButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E8',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#045b26',
    },
    linkText: {
        fontSize: 14,
        color: '#045b26',
        fontWeight: '600',
        marginLeft: 6,
    },
});

export default function FAQsPage({ isDarkMode = false }: { isDarkMode?: boolean }) {
    const [open, setOpen] = React.useState<number | null>(null);
    
    const dynamicStyles = {
        container: { ...styles.container, backgroundColor: isDarkMode ? '#121212' : '#f7f7f7' },
        card: { ...styles.card, backgroundColor: isDarkMode ? '#1e1e1e' : '#fff' },
        question: { ...styles.question, color: isDarkMode ? '#4CAF50' : '#045b26' },
        answer: { ...styles.answer, color: isDarkMode ? '#e0e0e0' : '#333' },
        linkButton: { ...styles.linkButton, backgroundColor: isDarkMode ? '#2d2d2d' : '#E8F5E8', borderColor: isDarkMode ? '#4CAF50' : '#045b26' },
        linkText: { ...styles.linkText, color: isDarkMode ? '#4CAF50' : '#045b26' },
    };
    
    return (
        <ScrollView style={dynamicStyles.container}>
            
            
            {/* Event Notification Box */}
            <View style={styles.notificationBox}>
                <View style={styles.iconCol}>
                    <MaterialCommunityIcons name="needle" size={28} color="#fff" />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.eventTitle}>FREE CONSULTATION & VACCINATION</Text>
                    <Text style={styles.eventDetail}>Every Wednesday and Friday</Text>
                    <Text style={styles.location}>Location: 2nd floor of the New City Hall Building</Text>
                    <Text style={styles.reminder}>Reminder: Bring your Pet VacCard or Ready your Pawthos App.</Text>
                </View>
            </View>
            {FAQS.map((faq, idx) => (
                <TouchableOpacity key={faq.question} style={dynamicStyles.card} onPress={() => setOpen(open === idx ? null : idx)} activeOpacity={0.9}>
                    <View style={styles.questionRow}>
                        <MaterialIcons name="help-outline" size={22} color={isDarkMode ? '#4CAF50' : '#045b26'} style={{ marginRight: 8 }} />
                        <Text style={dynamicStyles.question}>{faq.question}</Text>
                        <MaterialIcons name={open === idx ? 'expand-less' : 'expand-more'} size={22} color={isDarkMode ? '#4CAF50' : '#045b26'} />
                    </View>
                    {open === idx && (
                        <View>
                            <Text style={dynamicStyles.answer}>{faq.answer}</Text>
                            {idx === 0 && (
                                <View style={styles.linkContainer}>
                                    <TouchableOpacity
                                        style={dynamicStyles.linkButton}
                                        onPress={() => Linking.openURL('https://mnpets.com/2024/03/08/beap-pain-scales-for-cats-and-dogs/')}
                                    >
                                        <MaterialCommunityIcons name="book-open-variant" size={18} color={isDarkMode ? '#4CAF50' : '#045b26'} />
                                        <Text style={dynamicStyles.linkText}>Learn More About BEAP</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={dynamicStyles.linkButton}
                                        onPress={() => Linking.openURL('https://www.felinegrimacescale.com/')}
                                    >
                                        <MaterialCommunityIcons name="book-open-variant" size={18} color={isDarkMode ? '#4CAF50' : '#045b26'} />
                                        <Text style={dynamicStyles.linkText}>Learn More About FGS</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    )}
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
}
