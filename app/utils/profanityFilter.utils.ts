/**
 * Profanity filter utility for filtering inappropriate words
 */

// Common profanity words list (basic set - can be expanded)
const PROFANITY_WORDS = [
    // Explicit profanity (common words)
    'fuck', 'shit', 'damn', 'bitch', 'ass', 'bastard', 'crap', 'piss',
    // Variations
    'f*ck', 'f**k', 'sh*t', 's**t', 'b*tch', 'a**', 'a*s',
    // Offensive terms
    'idiot', 'stupid', 'dumb', 'retard', 'moron',
    // Add more as needed
];

/**
 * Check if text contains profanity
 * @param text - Text to check
 * @returns true if profanity is detected, false otherwise
 */
export const containsProfanity = (text: string): boolean => {
    if (!text || typeof text !== 'string') {
        return false;
    }

    const normalizedText = text.toLowerCase().trim();
    
    // Check against profanity list
    for (const word of PROFANITY_WORDS) {
        // Use word boundaries to avoid false positives (e.g., "class" containing "ass")
        const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        if (regex.test(normalizedText)) {
            return true;
        }
    }

    return false;
};

/**
 * Filter profanity from text (replaces with asterisks)
 * @param text - Text to filter
 * @returns Filtered text with profanity replaced
 */
export const filterProfanity = (text: string): string => {
    if (!text || typeof text !== 'string') {
        return text;
    }

    let filteredText = text;
    
    for (const word of PROFANITY_WORDS) {
        const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        filteredText = filteredText.replace(regex, '*'.repeat(word.length));
    }

    return filteredText;
};

/**
 * Validate text and return error message if profanity is detected
 * @param text - Text to validate
 * @returns Error message if profanity found, null otherwise
 */
export const validateTextForProfanity = (text: string): string | null => {
    if (containsProfanity(text)) {
        return 'Please use appropriate language. Inappropriate words are not allowed.';
    }
    return null;
};

