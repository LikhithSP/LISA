import React, { useState, useEffect, useRef, useMemo } from "react";
import { supabase } from "./supabaseClient";
import {
  getRandomAssessment, computeSkillScores, generateLearningPath, getOrderedSections,
  classifyProficiency, getProficiencyName, getWeakSkills, getStrongSkills, getStrongSkillKeys, getWeakSkillKeys, SKILL_TRANSLATION_KEYS,
  SKILL_CATEGORIES, CURRICULUM_SECTIONS, PROFICIENCY_LEVELS, lessonsData, getLCSLength, computeAdaptiveDiagnosedLevel, getQuestionsForBlock
} from "./curriculumData";
import { generateLessonContent, fetchWordOfDay, generatePracticeContent, translateTextContent, translateMCQContent } from "./geminiClient";
import enJson from "./locales/en.json";
import hiJson from "./locales/hi.json";
import knJson from "./locales/kn.json";
import teJson from "./locales/te.json";
import taJson from "./locales/ta.json";
import { assessmentTranslations } from "./assessmentTranslations";
import FunLearnZone from "./FunLearnZone";
import XPShop, { applyTheme, applyFont, SHOP_CATALOG } from "./XPShop";
import WeeklyLeaderboard from "./WeeklyLeaderboard";
import AnalyticsReport from "./AnalyticsReport";
import AdminDashboard from "./AdminDashboard";

const languages = ["English", "Hindi", "Kannada", "Telugu", "Tamil"];
const educationLevels = ["No Formal Education", "Primary", "Middle School", "Secondary & Above"];
const experienceLevels = [
  "I am completely new to this language",
  "I can recognize some letters and words",
  "I can read simple sentences",
  "I can read paragraphs and understand basic content",
  "I want to improve my vocabulary and communication skills"
];

export const experienceLevelOptionKeys = {
  "I am completely new to this language": "completelyNewOption",
  "I can recognize some letters and words": "recognizeLettersOption",
  "I can read simple sentences": "readSentencesOption",
  "I can read paragraphs and understand basic content": "readParagraphsOption",
  "I want to improve my vocabulary and communication skills": "improveVocabOption"
};

const FALLBACK_PRACTICE_MISTAKES = [
  {
    id: "fallback_m1",
    type: "Review",
    prompt: "Translate to English",
    text: "वह हर दिन अभ्यास करता है।",
    correctAnswer: "He practices every day."
  },
  {
    id: "fallback_m2",
    type: "Review",
    prompt: "Correct the spelling",
    text: "recieve",
    correctAnswer: "receive"
  },
  {
    id: "fallback_m3",
    type: "Review",
    prompt: "Identify the noun",
    text: "The dog barked loudly.",
    correctAnswer: "dog"
  }
];

const FALLBACK_PRACTICE_WORDS = [
  { word: "Diligent", meaning: "Showing care and effort in work" },
  { word: "Curious", meaning: "Eager to learn or know things" },
  { word: "Resilient", meaning: "Able to recover quickly from difficulties" },
  { word: "Fluency", meaning: "Ability to express oneself easily and articulately" },
  { word: "Literacy", meaning: "The ability to read and write" }
];

const WORD_TRANSLATIONS = {
  1: { English: "Book", Hindi: "किताब", Kannada: "ಪುಸ್ತಕ", Telugu: "పుస్తకం", Tamil: "புத்தகம்" },
  2: { English: "School", Hindi: "स्कूल", Kannada: "ಶಾಲೆ", Telugu: "బడి", Tamil: "பள்ளி" },
  3: { English: "Apple", Hindi: "सेब", Kannada: "ಸೇಬು", Telugu: "ఆపిల్", Tamil: "ఆప్పిள்" },
  4: { English: "Water", Hindi: "पानी", Kannada: "ನೀರು", Telugu: "నీరు", Tamil: "தண்ணீர்" },
  5: { English: "Sun", Hindi: "सूरज", Kannada: "ಸೂರ್ಯ", Telugu: "సూర్యుడు", Tamil: "சூரியன்" },
  6: { English: "Friend", Hindi: "दोस्त", Kannada: "ಸ್ನೇಹಿತ", Telugu: "ಸ್ನೇಹಿತుడు", Tamil: "நண்பன்" },
  7: { English: "House", Hindi: "घर", Kannada: "ಮನೆ", Telugu: "ఇల్లు", Tamil: "வீடு" },
  8: { English: "Tree", Hindi: "पेड़", Kannada: "ಮರ", Telugu: "చెట్టు", Tamil: "மரம்" },
  9: { English: "Fruit", Hindi: "फल", Kannada: "ಹಣ್ಣು", Telugu: "పండు", Tamil: "பழம்" },
  10: { English: "Happy", Hindi: "खुश", Kannada: "ಸಂತೋಷ", Telugu: "సంతోషం", Tamil: "மகிழ்ச்சி" }
};

const SENTENCE_TRANSLATIONS = {
  1: {
    English: "This is a good book.",
    Hindi: "यह एक अच्छी किताब है।",
    Kannada: "ಇದು ಒಂದು ಒಳ್ಳೆಯ ಪುಸ್ತಕ.",
    Telugu: "ఇది ఒక మంచి పుస్తకం.",
    Tamil: "இது ஒரு நல்ல புத்தகம்."
  },
  2: {
    English: "Children are going to school.",
    Hindi: "बच्चे स्कूल जा रहे हैं।",
    Kannada: "ಮಕ್ಕಳು ಶಾಲೆಗೆ ಹೋಗುತ್ತಿದ್ದಾರೆ.",
    Telugu: "పిల్లలు బడికి వెళ్తున్నారు.",
    Tamil: "குழந்தைகள் பள்ளிக்குச் செல்கிறார்கள்."
  },
  3: {
    English: "The apple is red and sweet.",
    Hindi: "सेब लाल और मीठा है।",
    Kannada: "ಸೇಬು ಕೆಂಪು ಮತ್ತು ಸಿಹಿಯಾಗಿದೆ.",
    Telugu: "ఆపిల్ ఎర్రగా మరియు తీపిగా ఉంటుంది.",
    Tamil: "ஆப்பிள் சிவப்பு மற்றும் இனிமையானது."
  },
  4: {
    English: "We should drink clean water.",
    Hindi: "साफ पानी पीना स्वास्थ्य के लिए अच्छा है।",
    Kannada: "ನಾವು ಶುದ್ಧ ನೀರನ್ನು ಕುಡಿಯಬೇಕು.",
    Telugu: "మనం శుభ్రమైన నీరు త్రాగాలి.",
    Tamil: "நாம் சுத்தமான தண்ணீர் குடிக்க வேண்டும்."
  },
  5: {
    English: "The sun is very bright today.",
    Hindi: "सूरज पूर्व से उगता है।",
    Kannada: "ಇಂದು ಸೂರ್ಯ ತುಂಬಾ ಪ್ರಕಾಶಮಾನವಾಗಿದ್ದಾನೆ.",
    Telugu: "ఈరోజు సూర్యుడు చాలా ప్రకాశవంతంగా ఉన్నాడు.",
    Tamil: "ಇಂದು ಸೂರ್ಯನ ಬೆಳಕು ಪ್ರಕಾಶಮಾನವಾಗಿದೆ."
  },
  6: {
    English: "He is my best friend.",
    Hindi: "वह मेरा सबसे अच्छा दोस्त है।",
    Kannada: "ಅವನು ನನ್ನ ಉತ್ತಮ ಸ್ನೇಹಿತ.",
    Telugu: "అతడు నా బెస్ట్ ఫ్రెండ్.",
    Tamil: "அவன் எனது சிறந்த நண்பன்."
  },
  7: {
    English: "They live in a big house.",
    Hindi: "हमारा घर बहुत सुंदर है।",
    Kannada: "ಅವರು ದೊಡ್ಡ ಮನೆಯಲ್ಲಿ ವಾಸಿಸುತ್ತಿದ್ದಾರೆ.",
    Telugu: "వారు పెద్ద ఇంట్లో నివసిస్తున్నారు.",
    Tamil: "அவர்கள் ஒரு பெரிய வீட்டில் வாழ்கிறார்கள்."
  },
  8: {
    English: "The birds are on the tree.",
    Hindi: "पेड़ हमें छाया देता है।",
    Kannada: "ಹಕ್ಕಿಗಳು ಮರದ ಮೇಲಿವೆ.",
    Telugu: "పక్షులు చెట్టు మీద ఉన్నాయి.",
    Tamil: "பறவைகள் மரத்தின் மேல் இருக்கின்றன."
  },
  9: {
    English: "I love eating fresh fruit.",
    Hindi: "ताजे फल खाएं।",
    Kannada: "ನಮಗೆ ತಾಜಾ ಹಣ್ಣುಗಳನ್ನು ತಿನ್ನುವುದು ಇಷ್ಟ.",
    Telugu: "నాకు తాజా పండ్లు తినడం ఇష్టం.",
    Tamil: "எனக்கு புதிய பழங்களை சாப்பிட பிடிக்கும்."
  },
  10: {
    English: "She has a happy family.",
    Hindi: "वह आज बहुत खुश है।",
    Kannada: "ಅವಳ ಕುಟುಂಬ ಸಂತೋಷವಾಗಿದೆ.",
    Telugu: "ఆమెది సంతోషకరమైన కుటుంబం.",
    Tamil: "அவளுக்கு ஒரு மகிழ்ச்சியான குடும்பம் உள்ளது."
  }
};

const getStoryQuestionInInterfaceLang = (rawQuestion, targetInterfaceLang = "English") => {
  if (!rawQuestion) return "";
  let qText = String(rawQuestion).replace(/^[❓\s]+/, "").trim();

  const questionMap = {
    "what does ana want?": {
      English: "What does Ana want?",
      Hindi: "अना क्या चाहती है?",
      Kannada: "ಅನಾ ಏನು ಬಯಸುತ್ತಾಳೆ?",
      Telugu: "అనా ఏమి కోరుకుంటుంది?",
      Tamil: "அனா என்ன விரும்புகிறாள்?"
    },
    "अना क्या चाहती है?": {
      English: "What does Ana want?",
      Hindi: "अना क्या चाहती है?",
      Kannada: "ಅನಾ ಏನು ಬಯಸುತ್ತಾಳೆ?",
      Telugu: "అనా ఏమి కోరుకుంటుంది?",
      Tamil: "அனா என்ன விரும்புகிறாள்?"
    },
    "ಅನಾ ಏನು ಬಯಸುತ್ತಾಳೆ?": {
      English: "What does Ana want?",
      Hindi: "अना क्या चाहती है?",
      Kannada: "ಅನಾ ಏನು ಬಯಸುತ್ತಾಳೆ?",
      Telugu: "అనా ఏమి కోరుకుంటుంది?",
      Tamil: "அனா என்ன விரும்புகிறாள்?"
    },
    "అనా ఏమి కోరుకుంటుంది?": {
      English: "What does Ana want?",
      Hindi: "अना क्या चाहती है?",
      Kannada: "ಅನಾ ಏನು ಬಯಸುತ್ತಾಳೆ?",
      Telugu: "అనా ఏమి కోరుకుంటుంది?",
      Tamil: "அனா என்ன விரும்புகிறாள்?"
    },
    "அனா என்ன விரும்புகிறாள்?": {
      English: "What does Ana want?",
      Hindi: "अना क्या चाहती है?",
      Kannada: "ಅನಾ ಏನು ಬಯಸುತ್ತಾಳೆ?",
      Telugu: "అనా ఏమి కోరుకుంటుంది?",
      Tamil: "அனா என்ன விரும்புகிறாள்?"
    },
    "what fruit is on the tree?": {
      English: "What fruit is on the tree?",
      Hindi: "पेड़ पर कौन सा फल है?",
      Kannada: "ಮರದ ಮೇಲೆ ಯಾವ ಹಣ್ಣು ಇದೆ?",
      Telugu: "చెట్టు మీద ఏ పండు ఉంది?",
      Tamil: "மரத்தில் என்ன பழம் இருக்கிறது?"
    },
    "पेड़ पर कौन सा फल है?": {
      English: "What fruit is on the tree?",
      Hindi: "पेड़ पर कौन सा फल है?",
      Kannada: "ಮರದ ಮೇಲೆ ಯಾವ ಹಣ್ಣು ಇದೆ?",
      Telugu: "చెట్టు మీద ఏ పండు ఉంది?",
      Tamil: "மரத்தில் என்ன பழம் இருக்கிறது?"
    },
    "ಮರದ ಮೇಲೆ ಯಾವ ಹಣ್ಣು ಇದೆ?": {
      English: "What fruit is on the tree?",
      Hindi: "पेड़ पर कौन सा फल है?",
      Kannada: "ಮರದ ಮೇಲೆ ಯಾವ ಹಣ್ಣು ಇದೆ?",
      Telugu: "చెట్టు మీద ఏ పండు ఉంది?",
      Tamil: "மரத்தில் என்ன பழம் இருக்கிறது?"
    },
    "చెట్టు మీద ఏ పండు ఉంది?": {
      English: "What fruit is on the tree?",
      Hindi: "पेड़ पर कौन सा फल है?",
      Kannada: "ಮರದ ಮೇಲೆ ಯಾವ ಹಣ್ಣು ಇದೆ?",
      Telugu: "చెట్టు మీద ఏ పండు ఉంది?",
      Tamil: "மரத்தில் என்ன பழம் இருக்கிறது?"
    },
    "மரத்தில் என்ன பழம் இருக்கிறது?": {
      English: "What fruit is on the tree?",
      Hindi: "पेड़ पर कौन सा फल है?",
      Kannada: "ಮರದ ಮೇಲೆ ಯಾವ ಹಣ್ಣು ಇದೆ?",
      Telugu: "చెట్టు మీద ఏ పండు ఉంది?",
      Tamil: "மரத்தில் என்ன பழம் இருக்கிறது?"
    }
  };

  const key = qText.toLowerCase();
  const keyNoQuestion = key.replace(/\?$/, "").trim();
  const keyWithQuestion = keyNoQuestion + "?";

  if (questionMap[key] && questionMap[key][targetInterfaceLang]) {
    return questionMap[key][targetInterfaceLang];
  }
  if (questionMap[keyNoQuestion] && questionMap[keyNoQuestion][targetInterfaceLang]) {
    return questionMap[keyNoQuestion][targetInterfaceLang];
  }
  if (questionMap[keyWithQuestion] && questionMap[keyWithQuestion][targetInterfaceLang]) {
    return questionMap[keyWithQuestion][targetInterfaceLang];
  }
  return qText;
};

const getDialogueTranslation = (text, targetLang = "English") => {
  if (!text) return "";
  const cleanedText = String(text).trim();

  const dialogueMap = {
    "hello! my name is ana.": {
      English: "Hello! My name is Ana.",
      Hindi: "नमस्ते! मेरा नाम अना है।",
      Kannada: "ನಮಸ್ಕಾರ! ನನ್ನ ಹೆಸರು ಅನಾ.",
      Telugu: "నమస్కారం! నా పేరు అనా.",
      Tamil: "வணக்கம்! என் பெயர் அனா."
    },
    "नमस्ते! मेरा नाम अना है।": {
      English: "Hello! My name is Ana.",
      Hindi: "नमस्ते! मेरा नाम अना है।",
      Kannada: "ನಮಸ್ಕಾರ! ನನ್ನ ಹೆಸರು ಅನಾ.",
      Telugu: "నమస్కారం! నా పేరు అనా.",
      Tamil: "வணக்கம்! என் பெயர் அனா."
    },
    "ನಮಸ್ಕಾರ! ನನ್ನ ಹೆಸರು ಅನಾ.": {
      English: "Hello! My name is Ana.",
      Hindi: "नमस्ते! मेरा नाम अना है।",
      Kannada: "ನಮಸ್ಕಾರ! ನನ್ನ ಹೆಸರು ಅನಾ.",
      Telugu: "నమస్కారం! నా పేరు అనా.",
      Tamil: "வணக்கம்! என் பெயர் அனா."
    },
    "నమస్కారం! నా పేరు అనా.": {
      English: "Hello! My name is Ana.",
      Hindi: "नमस्ते! मेरा नाम अना है।",
      Kannada: "ನಮಸ್ಕಾರ! ನನ್ನ ಹೆಸರು ಅನಾ.",
      Telugu: "నమస్కారం! నా పేరు అనా.",
      Tamil: "வணக்கம்! என் பெயர் அனா."
    },
    "வணக்கம்! என் பெயர் அனா.": {
      English: "Hello! My name is Ana.",
      Hindi: "नमस्ते! मेरा नाम अना है।",
      Kannada: "ನಮಸ್ಕಾರ! ನನ್ನ ಹೆಸರು ಅನಾ.",
      Telugu: "నமస్కారం! నా పేరు అనా.",
      Tamil: "வணக்கம்! என் பெயர் அனா."
    },
    "hi ana! i am ravi. welcome to our village.": {
      English: "Hi Ana! I am Ravi. Welcome to our village.",
      Hindi: "नमस्ते अना! मैं रवि हूँ। हमारे गाँव में आपका स्वागत है।",
      Kannada: "ನಮಸ್ಕಾರ ಅನಾ! ನಾನು ರವಿ. ನಮ್ಮ ಹಳ್ಳಿಗೆ ನಿಮಗೆ ಸ್ವಾಗತ.",
      Telugu: "నమస్కారం అనా! నేను రవి. మా ఊరికి మీకు స్వాగతం.",
      Tamil: "வணக்கம் அனா! நான் ரவி. எங்கள் கிராமத்திற்கு உங்களை வரவேற்கிறேன்."
    },
    "नमस्ते अना! मैं रवि हूँ। हमारे गाँव में आपका स्वागत है।": {
      English: "Hi Ana! I am Ravi. Welcome to our village.",
      Hindi: "नमस्ते अना! मैं रवि हूँ। हमारे गाँव में आपका स्वागत है।",
      Kannada: "ನಮಸ್ಕಾರ ಅನಾ! ನಾನು ರವಿ. ನಮ್ಮ ಹಳ್ಳಿಗೆ ನಿಮಗೆ ಸ್ವಾಗತ.",
      Telugu: "నమస్కారం అనా! నేను రవి. మా ఊరికి మీకు స్వాగతం.",
      Tamil: "வணக்கம் அனா! நான் ரவி. எங்கள் கிராமத்திற்கு உங்களை வரவேற்கிறேன்."
    },
    "ನಮಸ್ಕಾರ ಅನಾ! ನಾನು ರವಿ. ನಮ್ಮ ಹಳ್ಳಿಗೆ ನಿಮಗೆ ಸ್ವಾಗತ.": {
      English: "Hi Ana! I am Ravi. Welcome to our village.",
      Hindi: "नमस्ते अना! मैं रवि हूँ। हमारे गाँव में आपका स्वागत है।",
      Kannada: "ನಮಸ್ಕಾರ ಅನಾ! ನಾನು ರವಿ. ನಮ್ಮ ಹಳ್ಳಿಗೆ ನಿಮಗೆ ಸ್ವಾಗತ.",
      Telugu: "నమస్కారం అనా! నేను రవి. మా ఊరికి మీకు స్వాగతం.",
      Tamil: "வணக்கம் அனா! நான் ரவி. எங்கள் கிராமத்திற்கு உங்களை வரவேற்கிறேன்."
    },
    "నమస్కారం అనా! నేను రవి. మా ఊరికి మీకు స్వాగతం.": {
      English: "Hi Ana! I am Ravi. Welcome to our village.",
      Hindi: "नमस्ते अना! मैं रवि हूँ। हमारे गाँव में आपका स्वागत है।",
      Kannada: "ನಮಸ್ಕಾರ ಅನಾ! ನಾನು ರವಿ. ನಮ್ಮ ಹಳ್ಳಿಗೆ ನಿಮಗೆ ಸ್ವಾಗತ.",
      Telugu: "నమస్కారం అనా! నేను రవి. మా ఊరికి మీకు స్వాగతం.",
      Tamil: "வணக்கம் அனா! நான் ரவி. எங்கள் கிராமத்திற்கு உங்களை வரவேற்கிறேன்."
    },
    "வணக்கம் அனா! நான் ரவி. எங்கள் கிராமத்திற்கு உங்களை வரவேற்கிறேன்.": {
      English: "Hi Ana! I am Ravi. Welcome to our village.",
      Hindi: "नमस्ते अना! मैं रवि हूँ। हमारे गाँव में आपका स्वागत है।",
      Kannada: "ನಮಸ್ಕಾರ ಅನಾ! ನಾನು ರವಿ. ನಮ್ಮ ಹಳ್ಳಿಗೆ ನಿಮಗೆ ಸ್ವಾಗತ.",
      Telugu: "నమస్కారం అనా! నేను రవి. మా ఊరికి మీకు స్వాగతం.",
      Tamil: "வணக்கம் அனா! நான் ரவி. எங்கள் கிராமத்திற்கு உங்களை வரவேற்கிறேன்."
    },
    "it is very beautiful here. i want to read a book.": {
      English: "It is very beautiful here. I want to read a book.",
      Hindi: "यहाँ बहुत सुंदर है। मुझे एक किताब पढ़नी है।",
      Kannada: "ಇಲ್ಲಿ ತುಂಬಾ ಸುಂದರವಾಗಿದೆ. ನನಗೆ ಒಂದು ಪುಸ್ತಕವನ್ನು ಓದಬೇಕು.",
      Telugu: "ఇక్కడ చాలా అందంగా ఉంది. నేను ఒక పుస్తకం చదవాలనుకుంటున్నాను.",
      Tamil: "இடம் மிகவும் அழகாக இருக்கிறது. நான் ஒரு புத்தகம் படிக்க விரும்புகிறேன்."
    },
    "यहाँ बहुत सुंदर है। मुझे एक किताब पढ़नी है।": {
      English: "It is very beautiful here. I want to read a book.",
      Hindi: "यहाँ बहुत सुंदर है। मुझे एक किताब पढ़नी है।",
      Kannada: "ಇಲ್ಲಿ ತುಂಬಾ ಸುಂದರವಾಗಿದೆ. ನನಗೆ ಒಂದು ಪುಸ್ತಕವನ್ನು ಓದಬೇಕು.",
      Telugu: "ఇక్కడ చాలా అందంగా ఉంది. నేను ఒక పుస్తకం చదవాలనుకుంటున్నాను.",
      Tamil: "இடம் மிகவும் அழகாக இருக்கிறது. நான் ஒரு புத்தகம் படிக்க விரும்புகிறேன்."
    },
    "ಇಲ್ಲಿ ತುಂಬಾ ಸುಂದರವಾಗಿದೆ. ನನಗೆ ಒಂದು ಪುಸ್ತಕವನ್ನು ಓದಬೇಕು.": {
      English: "It is very beautiful here. I want to read a book.",
      Hindi: "यहाँ बहुत सुंदर है। मुझे एक किताब पढ़नी है।",
      Kannada: "ಇಲ್ಲಿ ತುಂಬಾ ಸುಂದರವಾಗಿದೆ. ನನಗೆ ಒಂದು ಪುಸ್ತಕವನ್ನು ಓದಬೇಕು.",
      Telugu: "ఇక్కడ చాలా అందంగా ఉంది. నేను ఒక పుస్తకం చదవాలనుకుంటున్నాను.",
      Tamil: "இடம் மிகவும் அழகாக இருக்கிறது. ನಾನು ಒಂದು ಪುಸ್ತಕವನ್ನು ಓದಬೇಕು."
    },
    "ఇక్కడ చాలా అందంగా ఉంది. నేను ఒక పుస్తకం చదవాలనుకుంటున్నాను.": {
      English: "It is very beautiful here. I want to read a book.",
      Hindi: "यहाँ बहुत सुंदर है। मुझे एक किताब पढ़नी है।",
      Kannada: "ಇಲ್ಲಿ ತುಂಬಾ ಸುಂದರವಾಗಿದೆ. ನನಗೆ ಒಂದು ಪುಸ್ತಕವನ್ನು ಓದಬೇಕು.",
      Telugu: "ఇక్కడ చాలా అందంగా ఉంది. నేను ఒక పుస్తకం చదవాలనుకుంటున్నాను.",
      Tamil: "இடம் மிகவும் அழகாக இருக்கிறது. நான் ஒரு புத்தகம் படிக்க விரும்புகிறேன்."
    },
    "இடம் மிகவும் அழகாக இருக்கிறது. நான் ஒரு புத்தகம் படிக்க விரும்புகிறேன்.": {
      English: "It is very beautiful here. I want to read a book.",
      Hindi: "यहाँ बहुत सुंदर है। मुझे एक किताब पढ़नी है।",
      Kannada: "ಇಲ್ಲಿ ತುಂಬಾ ಸುಂದರವಾಗಿದೆ. ನನಗೆ ಒಂದು ಪುಸ್ತಕವನ್ನು ಓದಬೇಕು.",
      Telugu: "ఇక్కడ చాలా అందంగా ఉంది. నేను ఒక పుస్తకం చదవాలనుకుంటున్నాను.",
      Tamil: "இடம் மிகவும் அழகாக இருக்கிறது. நான் ஒரு புத்தகம் படிக்க விரும்புகிறேன்."
    },
    "we have a library nearby. let's go there!": {
      English: "We have a library nearby. Let's go there!",
      Hindi: "हमारे पास पास ही एक पुस्तकालय है। चलो वहाँ चलते हैं!",
      Kannada: "ನಮ್ಮ ಹತ್ತಿರವೇ ಒಂದು ಗ್ರಂಥಾಲಯವಿದೆ. ಬನ್ನಿ ಅಲ್ಲಿಗೆ ಹೋಗೋಣ!",
      Telugu: "మాకు దగ్గరలోనే ఒక గ్రంథాలయం ఉంది. పదండి అక్కడికి వెళ్దాం!",
      Tamil: "அருகிலேயே ஒரு நூலகம் உள்ளது. வாருங்கள் அங்கே செல்வோம்!"
    },
    "हमारे पास पास ही एक पुस्तकालय है। चलो वहाँ चलते हैं!": {
      English: "We have a library nearby. Let's go there!",
      Hindi: "हमारे पास पास ही एक पुस्तकालय है। चलो वहाँ चलते हैं!",
      Kannada: "ನಮ್ಮ ಹತ್ತಿರವೇ ಒಂದು ಗ್ರಂಥಾಲಯವಿದೆ. ಬನ್ನಿ ಅಲ್ಲಿಗೆ ಹೋಗೋಣ!",
      Telugu: "మాకు దగ్గరలోనే ఒక గ్రంథాలయం ఉంది. పదండి అక్కడికి వెళ్దాం!",
      Tamil: "அருகிலேயே ஒரு நூலகம் உள்ளது. வாருங்கள் அங்கே செல்வோம்!"
    },
    "ನಮ್ಮ ಹತ್ತಿರವೇ ಒಂದು ಗ್ರಂಥಾಲಯವಿದೆ. ಬನ್ನಿ ಅಲ್ಲಿಗೆ ಹೋಗೋಣ!": {
      English: "We have a library nearby. Let's go there!",
      Hindi: "हमारे पास पास ही एक पुस्तकालय है। चलो वहाँ चलते हैं!",
      Kannada: "ನಮ್ಮ ಹತ್ತಿರವೇ ಒಂದು ಗ್ರಂಥಾಲಯವಿದೆ. ಬನ್ನಿ ಅಲ್ಲಿಗೆ ಹೋಗೋಣ!",
      Telugu: "మాకు దగ్గరలోనే ఒక గ్రంథాలయం ఉంది. పదండి అక్కడికి వెళ్దాಂ!",
      Tamil: "அருகிலேயே ஒரு நூலகம் உள்ளது. வாருங்கள் அங்கே செல்வோம்!"
    },
    "మాకు దగ్గరలోనే ఒక గ్రంథాలయం ఉంది. పదండి అక్కడికి వెళ్దాం!": {
      English: "We have a library nearby. Let's go there!",
      Hindi: "हमारे पास पास ही एक पुस्तकालय है। चलो वहाँ चलते हैं!",
      Kannada: "ನಮ್ಮ ಹತ್ತಿರವೇ ಒಂದು ಗ್ರಂಥಾಲಯವಿದೆ. ಬನ್ನಿ ಅಲ್ಲಿಗೆ ಹೋಗೋಣ!",
      Telugu: "మాకు దగ్గరలోనే ఒక గ్రంథాలయం ఉంది. పదండి అక్కడికి వెళ్దాం!",
      Tamil: "அருகிலேயே ஒரு நூலகம் உள்ளது. வாருங்கள் அங்கே செல்வோம்!"
    },
    "அருகிலேயே ஒரு நூலகம் உள்ளது. வாருங்கள் அங்கே செல்வோம்!": {
      English: "We have a library nearby. Let's go there!",
      Hindi: "हमारे पास पास ही एक पुस्तकालय है। चलो वहाँ चलते हैं!",
      Kannada: "ನಮ್ಮ ಹತ್ತಿರವೇ ಒಂದು ಗ್ರಂಥಾಲಯವಿದೆ. ಬನ್ನಿ ಅಲ್ಲಿಗೆ ಹೋಗೋಣ!",
      Telugu: "మాకు దగ్గరలోనే ఒక గ్రంథాలయం ఉంది. పదండి అక్కడికి వెళ్దాம்!",
      Tamil: "அருகிலேயே ஒரு நூலகம் உள்ளது. வாருங்கள் அங்கே செல்வோம்!"
    },
    "look at that tree! it has big red apples.": {
      English: "Look at that tree! It has big red apples.",
      Hindi: "उस पेड़ को देखो! उस पर बड़े लाल सेब हैं।",
      Kannada: "ಆ ಮರವನ್ನು ನೋಡಿ! ಅದರ ಮೇಲೆ ದೊಡ್ಡ ಕೆಂಪು ಸೇಬುಗಳಿವೆ.",
      Telugu: "ఆ చెట్టును చూడండి! దానిపై పెద్ద ఎర్రటి ఆపిల్స్ ఉన్నాయి.",
      Tamil: "அந்த மரத்தைப் பாருங்கள்! அதில் பெரிய சிவப்பு ஆப்பிள்கள் உள்ளன."
    },
    "उस पेड़ को देखो! उस पर बड़े लाल सेब हैं।": {
      English: "Look at that tree! It has big red apples.",
      Hindi: "उस पेड़ को देखो! उस पर बड़े लाल सेब हैं।",
      Kannada: "ಆ ಮರವನ್ನು ನೋಡಿ! ಅದರ ಮೇಲೆ ದೊಡ್ಡ ಕೆಂपु ಸೇಬುಗಳಿವೆ.",
      Telugu: "ఆ చెట్టును చూడండి! దానిపై పెద్ద ఎర్రటి ఆపిల్స్ ఉన్నాయి.",
      Tamil: "அந்த மரத்தைப் பாருங்கள்! அதில் பெரிய சிவப்பு ஆப்பிள்கள் உள்ளன."
    },
    "ಆ ಮರವನ್ನು ನೋಡಿ! ಅದರ ಮೇಲೆ ದೊಡ್ಡ ಕೆಂಪು ಸೇಬುಗಳಿವೆ.": {
      English: "Look at that tree! It has big red apples.",
      Hindi: "उस पेड़ को देखो! उस पर बड़े लाल सेब हैं।",
      Kannada: "ಆ ಮರವನ್ನು ನೋಡಿ! ಅದರ ಮೇಲೆ ದೊಡ್ಡ ಕೆಂಪು ಸೇಬುಗಳಿವೆ.",
      Telugu: "ఆ చెట్టును చూడండి! దానిపై పెద్ద ఎర్రటి ఆపిల్స్ ఉన్నాయి.",
      Tamil: "அந்த மரத்தைப் பாருங்கள்! அதில் பெரிய சிவப்பு ஆப்பிள்கள் உள்ளன."
    },
    "ఆ చెట్టును చూడండి! దానిపై పెద్ద ఎర్రటి ఆపిల్స్ ఉన్నాయి.": {
      English: "Look at that tree! It has big red apples.",
      Hindi: "उस पेड़ को देखो! उस पर बड़े लाल सेब हैं।",
      Kannada: "ಆ ಮರವನ್ನು ನೋಡಿ! ಅದರ ಮೇಲೆ ದೊಡ್ಡ ಕೆಂಪು ಸೇಬುಗಳಿವೆ.",
      Telugu: "ఆ చెట్టును చూడండి! దానిపై పెద్ద ఎర్రటి ఆపిల్స్ ఉన్నాయి.",
      Tamil: "அந்த மரத்தைப் பாருங்கள்! அதில் பெரிய சிவப்பு ஆப்பிள்கள் உள்ளன."
    },
    "அந்த மரத்தைப் பாருங்கள்! அதில் பெரிய சிவப்பு ஆப்பிள்கள் உள்ளன.": {
      English: "Look at that tree! It has big red apples.",
      Hindi: "उस पेड़ को देखो! उस पर बड़े लाल सेब हैं।",
      Kannada: "ಆ ಮರವನ್ನು ನೋಡಿ! ಅದರ ಮೇಲೆ ದೊಡ್ಡ ಕೆಂಪು ಸೇಬುಗಳಿವೆ.",
      Telugu: "ఆ చెట్టును చూడండి! దానిపై పెద్ద ఎర్రటి ఆపిల్స్ ఉన్నాయి.",
      Tamil: "அந்த மரத்தைப் பாருங்கள்! அதில் பெரிய சிவப்பு ஆப்பிள்கள் உள்ளன."
    },
    "yes, they are sweet. do you want one?": {
      English: "Yes, they are sweet. Do you want one?",
      Hindi: "हाँ, वे मीठे हैं। क्या तुम्हें एक चाहिए?",
      Kannada: "ಹೌದು, ಅವು ತುಂಬಾ ಸಿಹಿಯಾಗಿವೆ. ನಿಮಗೆ ಒಂದು ಬೇಕೇ?",
      Telugu: "అవును, అవి చాలా తీపిగా ఉంటాయి. మీకు ఒకటి కావాలా?",
      Tamil: "ஆமாம், அவை மிகவும் இனிமையானவை. உங்களுக்கு ஒன்று வேண்டுமா?"
    },
    "हाँ, वे मीठे हैं। क्या तुम्हें एक चाहिए?": {
      English: "Yes, they are sweet. Do you want one?",
      Hindi: "हाँ, वे मीठे हैं। क्या तुम्हें एक चाहिए?",
      Kannada: "ಹೌದು, ಅವು ತುಂಬಾ ಸಿಹಿಯಾಗಿವೆ. ನಿಮಗೆ ಒಂದು ಬೇಕೇ?",
      Telugu: "అవును, అవి చాలా తీపిగా ఉంటాయి. మీకు ఒకటి కావాలా?",
      Tamil: "ஆமாம், அவை மிகவும் இனிமையானவை. உங்களுக்கு ஒன்று வேண்டுமா?"
    },
    "ಹೌದು, ಅವು ತುಂಬಾ ಸಿಹಿಯಾಗಿವೆ. ನಿಮಗೆ ಒಂದು ಬೇಕೇ?": {
      English: "Yes, they are sweet. Do you want one?",
      Hindi: "हाँ, वे मीठे हैं। क्या तुम्हें एक चाहिए?",
      Kannada: "ಹೌದು, ಅವು ತುಂಬಾ ಸಿಹಿಯಾಗಿವೆ. ನಿಮಗೆ ಒಂದು ಬೇಕೇ?",
      Telugu: "అవును, అవి చాలా తీపిగా ఉంటాయి. మీకు ఒకటి కావాలా?",
      Tamil: "ஆமாம், அவை மிகவும் இனிமையானவை. உங்களுக்கு ஒன்று வேண்டுமா?"
    },
    "అవును, అవి చాలా తీపిగా ఉంటాయి. మీకు ఒకటి కావాలా?": {
      English: "Yes, they are sweet. Do you want one?",
      Hindi: "हाँ, वे मीठे हैं। क्या तुम्हें एक चाहिए?",
      Kannada: "ಹೌದು, ಅವು ತುಂಬಾ ಸಿಹಿಯಾಗಿವೆ. ನಿಮಗೆ ಒಂದು ಬೇಕೇ?",
      Telugu: "అవును, అవి చాలా తీపిగా ఉంటాయి. మీకు ఒకటి కావాలా?",
      Tamil: "ஆமாம், அவை மிகவும் இனிமையானவை. உங்களுக்கு ஒன்று வேண்டுமா?"
    },
    "ஆமாம், அவை மிகவும் இனிமையானவை. உங்களுக்கு ஒன்று வேண்டுமா?": {
      English: "Yes, they are sweet. Do you want one?",
      Hindi: "हाँ, वे मीठे हैं। क्या तुम्हें एक चाहिए?",
      Kannada: "ಹೌದು, ಅವು ತುಂಬಾ ಸಿಹಿಯಾಗಿವೆ. ನಿಮಗೆ ಒಂದು ಬೇಕೇ?",
      Telugu: "అవును, అవి చాలా తీపిగా ఉంటాయి. உங்களுக்கு ஒன்று வேண்டுமா?",
      Tamil: "ஆமாம், அவை மிகவும் இனிமையானவை. உங்களுக்கு ஒன்று வேண்டுமா?"
    },
    "oh yes, please! i love sweet apples.": {
      English: "Oh yes, please! I love sweet apples.",
      Hindi: "हाँ, कृपया! मुझे मीठे सेब बहुत पसंद हैं।",
      Kannada: "ಹೌದು, ದಯವಿಟ್ಟು! ನನಗೆ ಸಿಹಿ ಸೇಬುಗಳು ತುಂಬಾ ಇಷ್ಟ.",
      Telugu: "అవును, దయచేసి! నాకు తీపి ఆపిల్స్ అంటే చాలా ఇష్టం.",
      Tamil: "ஆமாம், தயவுசெய்து! எனக்கு இனிப்பான ஆப்பிள்கள் மிகவும் பிடிக்கும்."
    },
    "हाँ, कृपया! मुझे मीठे सेब बहुत पसंद हैं।": {
      English: "Oh yes, please! I love sweet apples.",
      Hindi: "हाँ, कृपया! मुझे मीठे सेब बहुत पसंद हैं।",
      Kannada: "ಹೌದು, ದಯವಿಟ್ಟು! ನನಗೆ ಸಿಹಿ ಸೇಬುಗಳು ತುಂಬಾ ಇಷ್ಟ.",
      Telugu: "అవును, దయచేసి! నాకు తీపి ఆపిల్స్ అంటే చాలా ఇష్టం.",
      Tamil: "ஆமாம், தயவுசெய்து! எனக்கு இனிப்பான ஆப்பிள்கள் மிகவும் பிடிக்கும்."
    },
    "ಹೌದು, ದಯವಿಟ್ಟು! ನನಗೆ ಸಿಹಿ ಸೇಬುಗಳು ತುಂಬಾ ಇಷ್ಟ.": {
      English: "Oh yes, please! I love sweet apples.",
      Hindi: "हाँ, कृपया! मुझे मीठे सेब बहुत पसंद हैं।",
      Kannada: "ಹೌದು, ದಯವಿಟ್ಟು! ನನಗೆ ಸಿಹಿ ಸೇಬುಗಳು ತುಂಬಾ ಇಷ್ಟ.",
      Telugu: "అవును, దయచేసి! నాకు తీపి ఆపిల్స్ అంటే చాలా ఇష్టం.",
      Tamil: "ஆமாம், தயவுசெய்து! எனக்கு இனிப்பான ஆப்பிள்கள் மிகவும் பிடிக்கும்."
    },
    "అవును, దయచేసి! నాకు తీపి ఆపిల్స్ అంటే చాలా ఇష్టం.": {
      English: "Oh yes, please! I love sweet apples.",
      Hindi: "हाँ, कृपया! मुझे मीठे सेब बहुत पसंद हैं।",
      Kannada: "ಹೌದು, ದಯವಿಟ್ಟು! ನನಗೆ ಸಿಹಿ ಸೇಬುಗಳು ತುಂಬಾ ಇಷ್ಟ.",
      Telugu: "అవును, దయచేసి! నాకు తీపి ఆపిల్స్ అంటే చాలా ఇష్టం.",
      Tamil: "ஆமாம், தயவுசெய்து! எனக்கு இனிப்பான ஆப்பிள்கள் மிகவும் பிடிக்கும்."
    },
    "ஆமாம், தயவுசெய்து! எனக்கு இனிப்பான ஆப்பிள்கள் மிகவும் பிடிக்கும்.": {
      English: "Oh yes, please! I love sweet apples.",
      Hindi: "हाँ, कृपया! मुझे मीठे सेब बहुत पसंद हैं।",
      Kannada: "ಹೌದು, ದಯವಿಟ್ಟು! ನನಗೆ ಸಿಹಿ ಸೇಬುಗಳು ತುಂಬಾ ಇಷ್ಟ.",
      Telugu: "అవును, దయచేసి! నాకు తీపి ఆపిల్స్ అంటే చాలా ఇష్టం.",
      Tamil: "ஆமாம், தயவுசெய்து! எனக்கு இனிப்பான ஆப்பிள்கள் மிகவும் பிடிக்கும்."
    },
    "here you go. now, let's find that book.": {
      English: "Here you go. Now, let's find that book.",
      Hindi: "यह लो। अब, चलो वह किताब ढूंढते हैं।",
      Kannada: "ಇದು ತಗೊಳ್ಳಿ. ಈಗ, ಆ ಪುಸ್ತಕವನ್ನು ಹುಡುಕೋಣ.",
      Telugu: "ఇదిగో తీసుకోండి. ఇప్పుడు, ఆ పుస్తకాన్ని వెతుకుదాం.",
      Tamil: "இந்தாருங்கள். இப்போது, அந்தப் புத்தகத்தைக் கண்டுபிடிப்போம்."
    },
    "यह लो। अब, चलो वह किताब ढूंढते हैं।": {
      English: "Here you go. Now, let's find that book.",
      Hindi: "यह लो। अब, चलो वह किताब ढूंढते हैं।",
      Kannada: "ಇದು ತಗೊಳ್ಳಿ. ಈಗ, ಆ ಪುಸ್ತಕವನ್ನು ಹುಡುಕೋಣ.",
      Telugu: "ఇదిగో తీసుకోండి. ఇప్పుడు, ఆ పుస్తకాన్ని వెతుకుదాం.",
      Tamil: "இந்தாருங்கள். இப்போது, அந்தப் புத்தகத்தைக் கண்டுபிடிப்போம்."
    },
    "ಇದು ತಗೊಳ್ಳಿ. ಈಗ, ಆ ಪುಸ್ತಕವನ್ನು ಹುಡುಕೋಣ.": {
      English: "Here you go. Now, let's find that book.",
      Hindi: "यह लो। अब, चलो वह किताब ढूंढते हैं।",
      Kannada: "ಇದು ತಗೊಳ್ಳಿ. ಈಗ, ಆ ಪುಸ್ತಕವನ್ನು ಹುಡುಕೋಣ.",
      Telugu: "ఇదిగో తీసుకోండి. ఇప్పుడు, ఆ పుస్తకాన్ని వెతుకుదాం.",
      Tamil: "இந்தாருங்கள். இப்போது, அந்தப் புத்தகத்தைக் கண்டுபிடிப்போம்."
    },
    "ఇదిగో తీసుకోండి. ఇప్పుడు, ఆ పుస్తకాన్ని వెతుకుదాం.": {
      English: "Here you go. Now, let's find that book.",
      Hindi: "यह लो। अब, चलो वह किताब ढूंढते हैं।",
      Kannada: "ಇದು ತಗೊಳ್ಳಿ. ಈಗ, ಆ ಪುಸ್ತಕವನ್ನು ಹುಡುಕೋಣ.",
      Telugu: "ఇదిగో తీసుకోండి. ఇప్పుడు, ఆ పుస్తకాన్ని వెతుకుదాం.",
      Tamil: "இந்தாருங்கள். இப்போது, அந்தப் புத்தகத்தைக் கண்டுபிடிப்போம்."
    },
    "இந்தாருங்கள். இப்போது, அந்தப் புத்தகத்தைக் கண்டுபிடிப்போம்.": {
      English: "Here you go. Now, let's find that book.",
      Hindi: "यह लो। अब, चलो वह किताब ढूंढते हैं।",
      Kannada: "ಇದು ತಗೊಳ್ಳಿ. ಈಗ, ಆ ಪುಸ್ತಕವನ್ನು ಹುಡುಕೋಣ.",
      Telugu: "ఇదిగో తీసుకోండి. ఇప్పుడు, ఆ పుస్తకాన్ని వెతుకుదాం.",
      Tamil: "இந்தாருங்கள். இப்போது, அந்தப் புத்தகத்தைக் கண்டுபிடிப்போம்."
    },
    "thank you, ravi! you are a great friend.": {
      English: "Thank you, Ravi! You are a great friend.",
      Hindi: "धन्यवाद, रवि! तुम बहुत अच्छे दोस्त हो।",
      Kannada: "ಧನ್ಯವಾದಗಳು, ರವಿ! ನೀವು ತುಂಬಾ ಒಳ್ಳೆಯ ಸ್ನೇಹಿತ.",
      Telugu: "ధన్యవాదాలు, రవి! నువ్వు చాలా మంచి స్నేహితుడివి.",
      Tamil: "நன்றி, ரவி! நீ ஒரு சிறந்த நண்பன்."
    },
    "धन्यवाद, रवि! तुम बहुत अच्छे दोस्त हो।": {
      English: "Thank you, Ravi! You are a great friend.",
      Hindi: "धन्यवाद, रवि! तुम बहुत अच्छे दोस्त हो।",
      Kannada: "ಧನ್ಯವಾದಗಳು, ರವಿ! तुम्ही बहुत अच्छे दोस्त हो।",
      Telugu: "ధన్యవాదాలు, రవి! నువ్వు చాలా మంచి స్నేహితుడివి.",
      Tamil: "நன்றி, ரவி! நீ ஒரு சிறந்த நண்பன்."
    },
    "ಧನ್ಯವಾದಗಳು, ರವಿ! ನೀವು ತುಂಬಾ ಒಳ್ಳೆಯ ಸ್ನೇಹಿತ.": {
      English: "Thank you, Ravi! You are a great friend.",
      Hindi: "धन्यवाद, रवि! तुम बहुत अच्छे दोस्त हो।",
      Kannada: "ಧನ್ಯವಾದಗಳು, ರವಿ! ನೀವು ತುಂಬಾ ಒಳ್ಳೆಯ ಸ್ನೇಹಿತ.",
      Telugu: "ధన్యవాదాలు, రవి! నువ్వు చాలా మంచి స్నేహితుడివి.",
      Tamil: "நன்றி, ரவி! நீ ஒரு சிறந்த நண்பன்."
    },
    "ధన్యవాదాలు, రవి! నువ్వు చాలా మంచి స్నేహితుడివి.": {
      English: "Thank you, Ravi! You are a great friend.",
      Hindi: "धन्यवाद, रवि! तुम बहुत अच्छे दोस्त हो।",
      Kannada: "ಧನ್ಯವಾದಗಳು, ರವಿ! ನೀವು ತುಂಬಾ ಒಳ್ಳೆಯ ಸ್ನೇಹಿತ.",
      Telugu: "ధన్యవాదాలు, రవి! నువ్వు చాలా మంచి స్నేహితుడివి.",
      Tamil: "நன்றி, ரவி! நீ ஒரு சிறந்த நண்பன்."
    },
    "நன்றி, ரவி! நீ ஒரு சிறந்த நண்பன்.": {
      English: "Thank you, Ravi! You are a great friend.",
      Hindi: "धन्यवाद, रवि! तुम बहुत अच्छे दोस्त हो।",
      Kannada: "ಧನ್ಯವಾದಗಳು, ರவி! ನೀವು ತುಂಬಾ ಒಳ್ಳೆಯ ಸ್ನೇಹಿತ.",
      Telugu: "ధన్యవాదాలు, రవి! నువ్వు చాలా మంచి స్నేహితుడివి.",
      Tamil: "நன்றி, ரவி! நீ ஒரு சிறந்த நண்பன்."
    }
  };

  const key = cleanedText.toLowerCase();
  if (dialogueMap[key] && dialogueMap[key][targetLang]) {
    return dialogueMap[key][targetLang];
  }
  return text;
};



// Draws a faint guide letter/word on the tracing canvas
const drawTracingGuide = (canvas, item) => {
  if (!canvas || !item) return;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "rgba(2,132,199,0.25)";
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);

  const text = (item.kind === "playground" ? "playground" : (item.letter || item.word || "A")).toString();
  if (text.trim() === "ಮನೆ") {
    // Hide tracing guide for the word ಮನೆ so user writes from memory
    return;
  }
  ctx.save();
  ctx.globalAlpha = 0.18;
  ctx.fillStyle = "#0284c7";
  ctx.font = `bold ${Math.floor(canvas.width * 0.28)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  ctx.restore();
};

const evaluateDrawingAccuracy = (userCanvas, targetText) => {
  if (!userCanvas || !targetText) return 0;
  
  // Create a hidden canvas to render the guide text
  const hiddenCanvas = document.createElement("canvas");
  hiddenCanvas.width = userCanvas.width || 300;
  hiddenCanvas.height = userCanvas.height || 300;
  const hCtx = hiddenCanvas.getContext("2d");
  
  // Draw the target text in a thick font on the hidden canvas
  hCtx.fillStyle = "black";
  hCtx.font = `bold ${Math.floor(hiddenCanvas.width * 0.28)}px sans-serif`;
  hCtx.textAlign = "center";
  hCtx.textBaseline = "middle";
  hCtx.fillText(targetText, hiddenCanvas.width / 2, hiddenCanvas.height / 2);
  
  // Get image data
  const userCtx = userCanvas.getContext("2d");
  const userData = userCtx.getImageData(0, 0, userCanvas.width, userCanvas.height).data;
  const guideData = hCtx.getImageData(0, 0, hiddenCanvas.width, hiddenCanvas.height).data;
  
  let overlap = 0;
  let userPixels = 0;
  let guidePixels = 0;
  
  for (let i = 0; i < userData.length; i += 4) {
    const userAlpha = userData[i + 3];
    const guideAlpha = guideData[i + 3];
    
    const isUserPainted = userAlpha > 100;
    const isGuidePainted = guideAlpha > 50;
    
    if (isUserPainted) userPixels++;
    if (isGuidePainted) guidePixels++;
    if (isUserPainted && isGuidePainted) overlap++;
  }
  
  if (userPixels === 0) return 0;
  
  const union = userPixels + guidePixels - overlap;
  const score = union > 0 ? (overlap / union) * 100 : 0;
  
  const scaledScore = Math.min(100, Math.round(score * 4.0));
  return scaledScore;
};

const DashboardIcon = ({ className, style }) => (
  <svg className={className} style={{ marginRight: "10px", verticalAlign: "middle", ...style }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="9" rx="1" />
    <rect x="14" y="3" width="7" height="5" rx="1" />
    <rect x="14" y="12" width="7" height="9" rx="1" />
    <rect x="3" y="16" width="7" height="5" rx="1" />
  </svg>
);

const LearnIcon = ({ className, style }) => (
  <svg className={className} style={{ marginRight: "10px", verticalAlign: "middle", ...style }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const PracticeIcon = ({ className, style }) => (
  <svg className={className} style={{ marginRight: "10px", verticalAlign: "middle", ...style }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
    <rect x="2" y="8" width="16" height="8" rx="2" />
    <line x1="6" y1="12" x2="14" y2="12" />
  </svg>
);

const ProfileIcon = ({ className, style }) => (
  <svg className={className} style={{ marginRight: "10px", verticalAlign: "middle", ...style }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const LogoutIcon = ({ className, style }) => (
  <svg className={className} style={{ marginRight: "10px", verticalAlign: "middle", ...style }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const FlameIcon = ({ className, style }) => (
  <svg className={className} style={{ marginRight: "4px", verticalAlign: "middle", ...style }} width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>
);

const StarIcon = ({ className, style }) => (
  <svg className={className} style={{ marginRight: "4px", verticalAlign: "middle", ...style }} width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const BookIcon = ({ className, style }) => (
  <svg className={className} style={{ verticalAlign: "middle", ...style }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

const TrophyIcon = ({ className, style }) => (
  <svg className={className} style={{ verticalAlign: "middle", ...style }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" />
    <path d="M12 2a6 6 0 0 1 6 6v5a6 6 0 0 1-6 6 6 6 0 0 1-6-6V8a6 6 0 0 1 6-6Z" />
  </svg>
);

const LightbulbIcon = ({ className, style }) => (
  <svg className={className} style={{ verticalAlign: "middle", ...style }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1 .5 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
    <path d="M9 18h6" />
    <path d="M10 22h4" />
  </svg>
);

const AlertTriangleIcon = ({ className, style }) => (
  <svg className={className} style={{ verticalAlign: "middle", ...style }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const ClockIcon = ({ className, style }) => (
  <svg className={className} style={{ verticalAlign: "middle", ...style }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const selectQuestsForToday = (userId, todayStr) => {
  const seedStr = `${userId}_${todayStr}`;
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = seedStr.charCodeAt(i) + ((hash << 5) - hash);
  }

  const pool = [
    { id: 'earn_20_xp', type: 'xp', title: 'Earn 20 XP today', target: 20, unit: 'XP' },
    { id: 'practice_5_min', type: 'time', title: 'Practice for 5 mins', target: 300, unit: 'min' },
    { id: 'complete_1_lesson', type: 'lessons', title: 'Complete 1 Lesson', target: 1, unit: 'lesson' },
    { id: 'practice_10_min', type: 'time', title: 'Practice for 10 mins', target: 600, unit: 'min' },
    { id: 'earn_30_xp', type: 'xp', title: 'Earn 30 XP today', target: 30, unit: 'XP' },
    { id: 'complete_2_lessons', type: 'lessons', title: 'Complete 2 Lessons', target: 2, unit: 'lessons' }
  ];

  const nextRandom = (seed) => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const r = Math.floor(nextRandom(hash + i) * (i + 1));
    const temp = shuffled[i];
    shuffled[i] = shuffled[r];
    shuffled[r] = temp;
  }

  const selected = [];
  selected.push(shuffled[0]);

  // Find a second quest with a different type
  for (let i = 1; i < shuffled.length; i++) {
    if (shuffled[i].type !== selected[0].type) {
      selected.push(shuffled[i]);
      break;
    }
  }

  // Fallback
  if (selected.length < 2) {
    selected.push(shuffled[1]);
  }

  return selected;
};

// Static achievement definitions (translatable title/desc). Earned/progress are computed at render time.
const ACHIEVEMENT_DEFS = [
  { id: 1, title: "First Steps", desc: "Complete your first assessment", icon: "⭐", color: "#f59e0b" },
  { id: 2, title: "Reading Star", desc: "Score 75% or higher in reading", icon: "📚", color: "#3b82f6" },
  { id: 3, title: "Comprehension Pro", desc: "Score 75% or higher in comprehension", icon: "🧠", color: "#10b981" },
  { id: 4, title: "Wordsmith", desc: "Score 75% or higher in writing", icon: "✍️", color: "#a855f7" },
  { id: 5, title: "XP Collector", desc: "Earn 100 XP or more", icon: "💎", color: "#e11d48" },
  { id: 6, title: "Dedicated Learner", desc: "Complete 3 lessons or more", icon: "🔥", color: "#f97316" },
  { id: 7, title: "Speech Maestro", desc: "Score 75% or higher in pronunciation", icon: "🗣️", color: "#06b6d4" },
  { id: 8, title: "Elite Scholar", desc: "Reach Progressive Level 8", icon: "🎓", color: "#8b5cf6" },
  { id: 9, title: "Grandmaster", desc: "Reach Progressive Level 12", icon: "👑", color: "#ef4444" },
];

// Translation dictionary for regional languages
const translations = {
  English: enJson,
  Hindi: hiJson,
  Kannada: knJson,
  Telugu: teJson,
  Tamil: taJson
};

const getLiteracyLevel = (userProfile) => {
  if (userProfile?.literacy_level) return Number(userProfile.literacy_level);
  const ed = userProfile?.education_level;
  if (ed) {
    if (ed.includes("Level 1") || ed.includes("स्तर 1") || ed.includes("ಹಂತ 1") || ed.includes("స్థాయి 1") || ed.includes("நிலை 1")) return 1;
    if (ed.includes("Level 2") || ed.includes("स्तर 2") || ed.includes("ಹಂತ 2") || ed.includes("స్థాయి 2") || ed.includes("நிலை 2")) return 2;
    if (ed.includes("Level 3") || ed.includes("स्तर 3") || ed.includes("ಹಂತ 3") || ed.includes("స్థాయి 3") || ed.includes("நிலை 3")) return 3;
    if (ed.includes("Level 4") || ed.includes("स्तर 4") || ed.includes("ಹಂತ 4") || ed.includes("స్థాయి 4") || ed.includes("நிலை 4")) return 4;
    if (ed.includes("Level 5") || ed.includes("स्तर 5") || ed.includes("ಹಂತ 5") || ed.includes("స్థాయి 5") || ed.includes("நிலை 5")) return 5;
  }
  return null;
};

const getDynamicLessonDescription = (lesson, unit, interfaceLang) => {
  if (!lesson) return "";
  const unitTitle = unit?.title || "Basics";
  const lessonTitle = lesson?.title || "Lesson";
  
  if (interfaceLang === "Hindi") {
    return `"${lessonTitle}" सीखें और अभ्यास करें ताकि आपका ${unitTitle} कौशल बेहतर हो सके।`;
  } else if (interfaceLang === "Kannada") {
    return `${unitTitle} ಕೌಶಲ್ಯಗಳನ್ನು ಉತ್ತಮಗೊಳಿಸಲು "${lessonTitle}" ಕಲಿಯಿರಿ ಮತ್ತು ಅಭ್ಯಾಸ ಮಾಡಿ.`;
  } else if (interfaceLang === "Tamil") {
    return `${unitTitle} திறன்களை மேம்படுத்த "${lessonTitle}" பாடத்தைக் கற்று பயிற்சி பெறுங்கள்.`;
  } else if (interfaceLang === "Telugu") {
    return `${unitTitle} నైపుణ్యాలను మెరుగుపరచడానికి "${lessonTitle}" నేర్చుకోండి మరియు సాధన చేయండి.`;
  }
  return `Learn and practice "${lessonTitle}" to improve your ${unitTitle} skills.`;
};

const calculateProgressiveLevel = (userProfile, completedLessonsList) => {
  const allLessonsList = [];
  CURRICULUM_SECTIONS.forEach((sec) => {
    sec.units.forEach((uni) => {
      uni.lessons.forEach((les) => {
        allLessonsList.push({ lessonId: les.id, sectionNum: sec.num });
      });
    });
  });

  const level = userProfile?.literacy_level || 1;
  const startingLessonId = (() => {
    if (level === 2) return "s2u1l1";
    if (level === 3) return "s3u1l1";
    if (level === 4) return "s5u1l1";
    if (level === 5) return "s7u1l1";
    return "s1u1l1";
  })();

  const startingIndex = allLessonsList.findIndex(item => item.lessonId === startingLessonId);
  const validStartingIndex = startingIndex !== -1 ? startingIndex : 0;
  const activeItem = allLessonsList.slice(validStartingIndex).find(item => !completedLessonsList?.includes(item.lessonId));

  if (!activeItem) {
    return 12;
  }
  return Math.min(12, Math.max(1, activeItem.sectionNum));
};

const hasCompletedAssessment = (userProfile, userId) => {
  if (userProfile?.assessment_completed === true || getLiteracyLevel(userProfile) !== null) {
    return true;
  }
  if (!userId) return false;
  try {
    const key = `lisa_assessment_state_${userId}`;
    const stored = JSON.parse(localStorage.getItem(key)) || null;
    return stored?.completed === true || (stored?.skill_scores && Object.keys(stored.skill_scores).length > 0);
  } catch {
    return false;
  }
};

const getAssessmentStorageKey = (userId) => `lisa_assessment_state_${userId || "anonymous"}`;

const getStoredAssessmentState = (userId) => {
  try {
    return JSON.parse(localStorage.getItem(getAssessmentStorageKey(userId))) || null;
  } catch {
    return null;
  }
};

const setStoredAssessmentState = (userId, state) => {
  localStorage.setItem(getAssessmentStorageKey(userId), JSON.stringify(state));
};

const clearStoredAssessmentState = (userId) => {
  localStorage.removeItem(getAssessmentStorageKey(userId));
};

const getLocalizedLevelName = (level, lang) => {
  const currentLang = lang || "English";
  const defs = PROFICIENCY_LEVELS[currentLang] || PROFICIENCY_LEVELS["English"];
  const found = defs.find(d => d.level === level);
  return found ? found.name : `Level ${level}`;
};

const getLevelCategoryAndDescription = (level, lang) => {
  const currentLang = lang || "English";
  const defs = PROFICIENCY_LEVELS[currentLang] || PROFICIENCY_LEVELS["English"];
  const found = defs.find(d => d.level === level);
  return {
    category: found ? found.name : `Level ${level}`,
    description: found ? found.desc : ""
  };
};

const darkenHex = (hex, factor = 0.85) => {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, Math.round(((num >> 16) & 0xff) * factor));
  const g = Math.max(0, Math.round(((num >> 8) & 0xff) * factor));
  const b = Math.max(0, Math.round((num & 0xff) * factor));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
};

const levelBadgeColor = (level) => {
  const colors = {
    1: "#10b981", // Emerald
    2: "#3b82f6", // Blue
    3: "#f59e0b", // Amber
    4: "#8b5cf6", // Violet
    5: "#ef4444", // Red
    6: "#0ea5e9", // Sky
    7: "#6366f1", // Indigo
    8: "#4f46e5", // Indigo dark
    9: "#06b6d4", // Cyan
    10: "#7c3aed", // Deep Violet
    11: "#6366f1", // Indigo
    12: "#2563eb"  // Royal Blue
  };
  return colors[level] || "#6b7280";
};

const levelBadgeIcon = (level) => {
  const icons = {
    1: "🌱",
    2: "📖",
    3: "✍️",
    4: "🧠",
    5: "👑",
    6: "🌟",
    7: "🎓",
    8: "🏆",
    9: "🚀",
    10: "🔥",
    11: "🌌",
    12: "🎖️"
  };
  return icons[level] || "📚";
};

const getStreakMessage = (streak) => {
  if (streak === 0) return "Start learning today to build your streak!";
  if (streak === 1) return "Great start! Come back tomorrow to keep it going.";
  if (streak >= 2 && streak <= 4) return `${streak} days in a row! You're building a great habit.`;
  if (streak >= 5 && streak <= 9) return `Amazing! A ${streak} day streak. You are unstoppable!`;
  if (streak >= 10 && streak <= 20) return `Incredible! A ${streak} day streak of continuous learning. Keep it up!`;
  return `You're on fire! An epic ${streak} day streak. Keep the momentum going!`;
};

// Returns the local date string (YYYY-MM-DD) for the Monday that starts the current week.
const getWeekStartDate = (d = new Date()) => {
  const date = new Date(d);
  const day = date.getDay(); // 0 = Sunday, 1 = Monday, ...
  const diff = (day === 0 ? -6 : 1) - day; // shift back to Monday
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
};

const localDashboardTranslations = {
  Hindi: {
    levels: {
      1: "आप अपने पहले कदम उठा रहे हैं! आप पर गर्व है।",
      2: "शानदार शुरुआत! आप शब्दों को पहचान रहे हैं और कौशल का निर्माण कर रहे हैं।",
      3: "अद्भुत! आप सरल वाक्यों को आसानी से पढ़ रहे हैं।",
      4: "इसे जारी रखें! आपका पढ़ने का प्रवाह बढ़ रहा है।",
      5: "शानदार प्रगति! आप अधिक जटिल पाठों को समझ रहे हैं।",
      6: "सनसनीखेज! आप पैराग्राफ से महत्वपूर्ण अंतर्दृष्टि प्राप्त कर रहे हैं।",
      7: "बेहतरीन! आपका संचार अत्यधिक परिष्कृत हो रहा है।",
      8: "उत्कृष्ट! आप कार्यात्मक दैनिक साक्षरता में महारत हासिल कर रहे हैं।",
      9: "शानदार! वर्तनी और व्याकरण आपकी आदत बन रहे हैं।",
      10: "असाधारण! आप पूर्ण आत्मविश्वास के साथ संवाद करते हैं।",
      11: "अद्भुत! आप एक पेशेवर स्तर पर पढ़ते और लिखते हैं।",
      12: "साक्षरता चैंपियन! आपने पूर्ण महारत हासिल कर ली है।"
    },
    streaks: {
      0: "अपनी स्ट्रीक बनाने के लिए आज ही सीखना शुरू करें!",
      1: "शानदार शुरुआत! इसे जारी रखने के लिए कल वापस आएं।"
    },
    streakTemplate: (streak) => {
      if (streak >= 2 && streak <= 4) return `लगातार ${streak} दिन! आप एक बेहतरीन आदत बना रहे हैं।`;
      if (streak >= 5 && streak <= 9) return `अद्भुत! ${streak} दिनों की स्ट्रीक। आप अजेय हैं!`;
      if (streak >= 10 && streak <= 20) return `अविश्वसनीय! निरंतर सीखने की ${streak} दिनों की स्ट्रीक। इसे जारी रखें!`;
      return `आप कमाल कर रहे हैं! एक शानदार ${streak} दिनों की स्ट्रीक। गति बनाए रखें!`;
    },
    quests: {
      earn_20_xp: "आज 20 XP अर्जित करें",
      practice_5_min: "5 मिनट अभ्यास करें",
      complete_1_lesson: "1 पाठ पूरा करें",
      practice_10_min: "10 मिनट अभ्यास करें",
      earn_30_xp: "आज 30 XP अर्जित करें",
      complete_2_lessons: "2 पाठ पूरे करें"
    },
    achievements: {
      1: { title: "पहला कदम", desc: "अपना पहला मूल्यांकन पूरा करें" },
      2: { title: "रीडिंग स्टार", desc: "पढ़ने में 75% या उससे अधिक अंक प्राप्त करें" },
      3: { title: "कॉम्प्रिहेंशन प्रो", desc: "समझ (कॉम्प्रिहेंशन) में 75% या उससे अधिक अंक प्राप्त करें" },
      4: { title: "वर्डस्मिथ", desc: "लेखन में 75% या उससे अधिक अंक प्राप्त करें" },
      5: { title: "XP कलेक्टर", desc: "100 XP या अधिक अर्जित करें" },
      6: { title: "समर्पित शिक्षार्थी", desc: "3 या अधिक पाठ पूरे करें" },
      7: { title: "स्पीच मेस्ट्रो", desc: "उच्चारण में 75% या उससे अधिक अंक प्राप्त करें" },
      8: { title: "कुलीन विद्वान", desc: "प्रगतिशील स्तर 8 पर पहुंचें" },
      9: { title: "ग्रैंडमास्टर", desc: "प्रगतिशील स्तर 12 पर पहुंचें" }
    }
  },
  Kannada: {
    levels: {
      1: "ನೀವು ನಿಮ್ಮ ಮೊದಲ ಹೆಜ್ಜೆಗಳನ್ನು ಇಡುತ್ತಿದ್ದೀರಿ! ನಿಮ್ಮ ಬಗ್ಗೆ ಹೆಮ್ಮೆ ಇದೆ.",
      2: "ಉತ್ತಮ ಆರಂಭ! ನೀವು ಪದಗಳನ್ನು ಗುರುತಿಸುತ್ತಿದ್ದೀರಿ ಮತ್ತು ಕೌಶಲ್ಯಗಳನ್ನು ಬೆಳೆಸಿಕೊಳ್ಳುತ್ತಿದ್ದೀರಿ.",
      3: "ಅದ್ಭುತ! ನೀವು ಸರಳ ವಾಕ್ಯಗಳನ್ನು ಸುಲಭವಾಗಿ ಓದುತ್ತಿದ್ದೀರಿ.",
      4: "ಹೀಗೆಯೇ ಮುಂದುವರಿಸಿ! ನಿಮ್ಮ ಓದುವ ಸರಾಗತೆ ಹೆಚ್ಚುತ್ತಿದೆ.",
      5: "ಅದ್ಭುತ ಪ್ರಗತಿ! ನೀವು ಹೆಚ್ಚು ಸಂಕೀರ್ಣವಾದ ಪಠ್ಯಗಳನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳುತ್ತಿದ್ದೀರಿ.",
      6: "ಅಸಾಧಾರಣ! ನೀವು ಪ್ಯಾರಾಗಳಿಂದ ಪ್ರಮುಖ ಒಳನೋಟಗಳನ್ನು ಗ್ರಹಿಸುತ್ತಿದ್ದೀರಿ.",
      7: "ಅತ್ಯುತ್ತಮ! ನಿಮ್ಮ ಸಂವಹನವು ಹೆಚ್ಚು ಸುಧಾರಿಸುತ್ತಿದೆ.",
      8: "ಅತ್ಯುತ್ತಮ! ನೀವು ದೈನಂದิน ಸಾಕ್ಷರತೆಯನ್ನು ಕರಗತ ಮಾಡಿಕೊಳ್ಳುತ್ತಿದ್ದೀರಿ.",
      9: "ಅದ್ಭುತ! ಕಾಗುಣಿತ ಮತ್ತು ವ್ಯಾಕರಣವು ನಿಮಗೆ ಸಹಜವಾಗುತ್ತಿದೆ.",
      10: "ಅಸಾಧಾರಣ! ನೀವು ಸಂಪೂರ್ಣ ಆತ್ಮವಿಶ್ವಾಸದಿಂದ ಸಂವಹನ ನಡೆಸುತ್ತೀರಿ.",
      11: "ಅದ್ಭುತ! ನೀವು ವೃತ್ತಿಪರ ಮಟ್ಟದಲ್ಲಿ ಓದುತ್ತೀರಿ ಮತ್ತು ಬರೆಯುತ್ತೀರಿ.",
      12: "ಸಾಕ್ಷರತಾ ಚಾಂಪಿಯನ್! ನೀವು ಸಂಪೂರ್ಣ ಪಾಂಡಿತ್ಯವನ್ನು ಸಾಧಿಸಿದ್ದೀರಿ."
    },
    streaks: {
      0: "ನಿಮ್ಮ ಸ್ಟ್ರೀಕ್ ನಿರ್ಮಿಸಲು ಇಂದೇ ಕಲಿಯಲು ಪ್ರಾರಂಭಿಸಿ!",
      1: "ಉತ್ತಮ ಆರಂಭ! ಇದನ್ನು ಮುಂದುವರಿಸಲು ನಾಳೆ ಮತ್ತೆ ಬನ್ನಿ."
    },
    streakTemplate: (streak) => {
      if (streak >= 2 && streak <= 4) return `ಸತತ ${streak} ದಿನಗಳು! ನೀವು ಉತ್ತಮ ಅಭ್ಯಾಸವನ್ನು ಬೆಳೆಸಿಕೊಳ್ಳುತ್ತಿದ್ದೀರಿ.`;
      if (streak >= 5 && streak <= 9) return `ಅದ್ಭುತ! ${streak} ದಿನಗಳ ಸ್ಟ್ರೀಕ್. ನಿಮ್ಮನ್ನು ತಡೆಯಲು ಸಾಧ್ಯವಿಲ್ಲ!`;
      if (streak >= 10 && streak <= 20) return `ನಂಬಲಾಗದ! ನಿರಂತರ ಕಲಿಕೆಯ ${streak} ದಿನಗಳ ಸ್ಟ್ರೀಕ್. ಹೀಗೆಯೇ ಮುಂದುವರಿಸಿ!`;
      return `ನೀವು ಧೂಳೆಬ್ಬಿಸುತ್ತಿದ್ದೀರಿ! ಭರ್ಜರಿ ${streak} ದಿನಗಳ ಸ್ಟ್ರೀಕ್. ವೇಗವನ್ನು ಕಾಪಾಡಿಕೊಳ್ಳಿ!`;
    },
    quests: {
      earn_20_xp: "ಇಂದು 20 XP ಗಳಿಸಿ",
      practice_5_min: "5 ನಿಮಿಷಗಳ ಕಾಲ ಅಭ್ಯಾಸ ಮಾಡಿ",
      complete_1_lesson: "1 ಪಾಠವನ್ನು ಪೂರ್ಣಗೊಳಿಸಿ",
      practice_10_min: "10 ನಿಮಿಷಗಳ ಕಾಲ ಅಭ್ಯಾಸ ಮಾಡಿ",
      earn_30_xp: "ಇಂದು 30 XP ಗಳಿಸಿ",
      complete_2_lessons: "2 ಪಾಠಗಳನ್ನು ಪೂರ್ಣಗೊಳಿಸಿ"
    },
    achievements: {
      1: { title: "ಮೊದಲ ಹೆಜ್ಜೆಗಳು", desc: "ನಿಮ್ಮ ಮೊದಲ ಮೌಲ್ಯಮಾಪನವನ್ನು ಪೂರ್ಣಗೊಳಿಸಿ" },
      2: { title: "ರೀಡಿಂಗ್ ಸ್ಟಾರ್", desc: "ಓದುವಿಕೆಯಲ್ಲಿ 75% ಅಥವಾ ಹೆಚ್ಚಿನ ಅಂಕಗಳನ್ನು ಗಳಿಸಿ" },
      3: { title: "ಕಾಂಪ್ರಿಹೆನ್ಷನ್ ಪ್ರೊ", desc: "ಗ್ರಹಿಕೆಯಲ್ಲಿ 75% ಅಥವಾ ಹೆಚ್ಚಿನ ಅಂಕಗಳನ್ನು ಗಳಿಸಿ" },
      4: { title: "ವರ್ಡ್ಸ್‌ಮಿತ್", desc: "ಬರವಣಿಗೆಯಲ್ಲಿ 75% ಅಥವಾ ಹೆಚ್ಚಿನ ಅಂಕಗಳನ್ನು ಗಳಿಸಿ" },
      5: { title: "XP ಕಲೆಕ್ಟರ್", desc: "100 XP ಅಥವಾ ಹೆಚ್ಚಿನದನ್ನು ಗಳಿಸಿ" },
      6: { title: "ಸಮರ್ಪಿತ ಕಲಿಯುವವನು", desc: "3 ಅಥವಾ ಹೆಚ್ಚಿನ ಪಾಠಗಳನ್ನು ಪೂರ್ಣಗೊಳಿಸಿ" },
      7: { title: "ಸ್ಪೀಚ್ ಮೆಸ್ಟ್ರೋ", desc: "ಉಚ್ಚಾರಣೆಯಲ್ಲಿ 75% ಅಥವಾ ಹೆಚ್ಚಿನ ಅಂಕಗಳನ್ನು ಗಳಿಸಿ" },
      8: { title: "ಎಲೈಟ್ ಸ್ಕಾಲರ್", desc: "ಪ್ರಗತಿಶೀಲ ಮಟ್ಟ 8 ಅನ್ನು ತಲುಪಿ" },
      9: { title: "ಗ್ರಾಂಡ್‌ಮಾಸ್ಟರ್", desc: "ಪ್ರಗತಿಶೀಲ ಮಟ್ಟ 12 ಅನ್ನು ತಲುಪಿ" }
    }
  },
  Telugu: {
    levels: {
      1: "మీరు మీ మొదటి అడుగులు వేస్తున్నారు! మీ గురించి గర్వంగా ఉంది.",
      2: "గొప్ప ప్రారంభం! మీరు పదాలను గుర్తిస్తున్నారు మరియు నైపుణ్యాలను పెంపొందించుకుంటున్నారు.",
      3: "అద్భుతం! మీరు సాధారణ వాక్యాలను సులభంగా చదువుతున్నారు.",
      4: "ఇలాగే కొనసాగించండి! మీ పఠన సరళత పెరుగుతోంది.",
      5: "అద్భుతమైన పురోగతి! మీరు మరింత సంక్లిష్టమైన గ్రంథాలను అర్థం చేసుకుంటున్నారు.",
      6: "అద్భుతం! మీరు పేరాల నుండి ముఖ్యమైన విషయాలను గ్రహిస్తున్నారు.",
      7: "అత్యద్భుతం! మీ కమ్యూనికేషన్ చాలా మెరుగవుతోంది.",
      8: "అద్భుతం! మీరు రోజువారీ అక్షరాస్యతను నేర్చుకుంటున్నారు.",
      9: "గొప్పది! స్పెల్లింగ్ మరియు వ్యాకరణం మీకు అలవాటుగా మారుతున్నాయి.",
      10: "అసాధారణమైనది! మీరు పూర్తి ఆత్మవిశ్వాసంతో సంభాషిస్తున్నారు.",
      11: "అద్భుతం! మీరు వృత్తిపరమైన స్థాయిలో చదువుతున్నారు మరియు రాస్తున్నారు.",
      12: "అక్షరాస్యత విజేత! మీరు పూర్తి నైపుణ్యాన్ని సాధించారు."
    },
    streaks: {
      0: "మీ స్ట్రీక్‌ను నిర్మించడానికి ఈరోజే నేర్చుకోవడం ప్రారంభించండి!",
      1: "గొప్ప ప్రారంభం! దీన్ని కొనసాగించడానికి రేపు మళ్లీ రండి."
    },
    streakTemplate: (streak) => {
      if (streak >= 2 && streak <= 4) return `వరుసగా ${streak} రోజులు! మీరు మంచి అలవాటును పెంపొందించుకుంటున్నారు.`;
      if (streak >= 5 && streak <= 9) return `అద్భుతం! ${streak} రోజుల స్ట్రీక్. మిమ్మల్ని ఎవరూ ఆపలేరు!`;
      if (streak >= 10 && streak <= 20) return `నమ్మశక్యం కానిది! నిరంతర అభ్యాసం యొక్క ${streak} రోజుల స్ట్రీక్. ఇలాగే కొనసాగించండి!`;
      return `మీరు దూసుకుపోతున్నారు! అద్భుతమైన ${streak} రోజుల స్ట్రీక్. ఇదే ఉత్సాహాన్ని కొనసాగించండి!`;
    },
    quests: {
      earn_20_xp: "ఈరోజు 20 XP సంపాదించండి",
      practice_5_min: "5 నిమిషాలు అభ్యాసం చేయండి",
      complete_1_lesson: "1 పాఠాన్ని పూర్తి చేయండి",
      practice_10_min: "10 నిమిషాలు అభ్యాసం చేయండి",
      earn_30_xp: "ఈరోజు 30 XP సంపాదించండి",
      complete_2_lessons: "2 పాఠాలను పూర్తి చేయండి"
    },
    achievements: {
      1: { title: "మొదటి అడుగులు", desc: "మీ మొదటి మూల్యాంకనాన్ని పూర్తి చేయండి" },
      2: { title: "రీడింగ్ స్టార్", desc: "పఠనంలో 75% లేదా అంతకంటే ఎక్కువ స్కోరు చేయండి" },
      3: { title: "కాంప్రహెన్షన్ ప్రో", desc: "అవగాహనలో 75% లేదా అంతకంటే ఎక్కువ స్కోరు చేయండి" },
      4: { title: "వర్డ్‌స్మిత్", desc: "రచనలో 75% లేదా అంతకంటే ఎక్కువ స్కోరు చేయండి" },
      5: { title: "XP కలెక్టర్", desc: "100 XP లేదా అంతకంటే ఎక్కువ సంపాదించండి" },
      6: { title: "సమర్పిత అభ్యాసకుడు", desc: "3 లేదా అంతకంటే ఎక్కువ పాఠాలను పూర్తి చేయండి" },


      7: { title: "స్పీచ్ మాస్ట్రో", desc: "ఉచ్చారణలో 75% లేదా అంతకంటే ఎక్కువ స్కోరు చేయండి" },
      8: { title: "ఎలైట్ స్కాలర్", desc: "ప్రోగ్రెసివ్ లెవల్ 8 కి చేరుకోండి" },
      9: { title: "గ్రాండ్‌మాస్టర్", desc: "ప్రోగ్రెసివ్ లెవల్ 12 కి చేరుకోండి" }
    }
  },
  Tamil: {
    levels: {
      1: "உங்கள் முதல் படிகளை எடுத்து வைக்கிறீர்கள்! உங்களை நினைத்து பெருமைப்படுகிறேன்.",
      2: "சிறந்த ஆரம்பம்! நீங்கள் வார்த்தைகளை அடையாளம் கண்டு திறன்களை வளர்த்து வருகிறீர்கள்.",
      3: "அற்புதம்! நீங்கள் எளிய வாக்கியங்களை சரளமாக படிக்கிறீர்கள்.",
      4: "தொடர்ந்து செய்யுங்கள்! உங்கள் வாசிப்பு வேகம் அதிகரித்து வருகிறது.",
      5: "அற்புதமான முன்னேற்றம்! நீங்கள் மிகவும் சிக்கலான உரைகளைப் புரிந்துகொள்கிறீர்கள்.",
      6: "அசாத்தியமானது! பத்திகளில் இருந்து முக்கிய கருத்துக்களை நீங்கள் சேகரிக்கிறீர்கள்.",
      7: "அருமை! உங்கள் தொடர்பு மிகவும் சுத்திகரிக்கப்பட்டு வருகிறது.",
      8: "சிறப்பானது! அன்றாட செயல்பாட்டு எழுத்தறிவை நீங்கள் மாஸ்டர் செய்கிறீர்கள்.",
      9: "அற்புதம்! எழுத்துப்பிழை மற்றும் இலக்கணம் உங்களுக்கு எளிதாகிறது.",
      10: "சிறப்பானது! நீங்கள் முழு நம்பிக்கையுடன் தொடர்பு கொள்கிறீர்கள்.",
      11: "பிரமாதம்! நீங்கள் ஒரு தொழில்முறை மட்டத்தில் படித்து எழுதுகிறீர்கள்.",
      12: "எழுத்தறிவு சாம்பியன்! நீங்கள் முழுமையான தேர்ச்சியை அடைந்துவிட்டீர்கள்."
    },
    streaks: {
      0: "உங்கள் தொடர்ச்சியை உருவாக்க இன்றே கற்கத் தொடங்குங்கள்!",
      1: "சிறந்த ஆரம்பம்! அதைத் தொடர நாளை மீண்டும் வாருங்கள்."
    },
    streakTemplate: (streak) => {
      if (streak >= 2 && streak <= 4) return `தொடர்ந்து ${streak} நாட்கள்! நீங்கள் ஒரு சிறந்த பழக்கத்தை உருவாக்குகிறீர்கள்.`;
      if (streak >= 5 && streak <= 9) return `அற்புதம்! ${streak} நாட்கள் தொடர்ச்சி. உங்களைத் தடுக்க முடியாது!`;
      if (streak >= 10 && streak <= 20) return `நம்பமுடியாதது! தொடர்ச்சியான கற்றலின் ${streak} நாட்கள் தொடர்ச்சி. தொடர்ந்து செய்யுங்கள்!`;
      return `நீங்கள் அசத்துகிறீர்கள்! ஒரு காவிய ${streak} நாட்கள் தொடர்ச்சி. வேகத்தைத் தக்க வைத்துக் கொள்ளுங்கள்!`;
    },
    quests: {
      earn_20_xp: "இன்று 20 XP பெறுங்கள்",
      practice_5_min: "5 நிமிடங்கள் பயிற்சி செய்யுங்கள்",
      complete_1_lesson: "1 பாடத்தை முடிக்கவும்",
      practice_10_min: "10 நிமிடங்கள் பயிற்சி செய்யுங்கள்",
      earn_30_xp: "இன்று 30 XP பெறுங்கள்",
      complete_2_lessons: "2 பாடங்களை முடிக்கவும்"
    },
    achievements: {
      1: { title: "முதல் படிகள்", desc: "உங்கள் முதல் மதிப்பீட்டை முடிக்கவும்" },
      2: { title: "வாசிப்பு நட்சத்திரம்", desc: "வாசிப்பில் 75% அல்லது அதற்கு மேல் மதிப்பெண் பெறவும்" },
      3: { title: "புரிதல் நிபுணர்", desc: "புரிதலில் 75% அல்லது அதற்கு மேல் மதிப்பெண் பெறவும்" },
      4: { title: "வார்த்தை கலைஞர்", desc: "எழுதுவதில் 75% அல்லது அதற்கு மேல் மதிப்பெண் பெறவும்" },
      5: { title: "XP சேகரிப்பாளர்", desc: "100 XP அல்லது அதற்கு மேல் பெறவும்" },
      6: { title: "அர்ப்பணிப்புள்ள கற்பவர்", desc: "3 அல்லது அதற்கு மேற்பட்ட பாடங்களை முடிக்கவும்" },
      7: { title: "பேச்சு மாஸ்டர்", desc: "உச்சரிப்பில் 75% அல்லது அதற்கு மேல் மதிப்பெண் பெறவும்" },
      8: { title: "எலைட் அறிஞர்", desc: "முற்போக்கான நிலை 8 ஐ அடையுங்கள்" },
      9: { title: "கிராண்ட்மாஸ்டர்", desc: "முற்போக்கான நிலை 12 ஐ அடையுங்கள்" }
    }
  }
};

function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState(
    localStorage.getItem("lisa_lang") || null
  );
  const [learningLanguage, setLearningLanguage] = useState(
    localStorage.getItem("lisa_learning_lang") || "English"
  );
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);

  const [streakPopupOpen, setStreakPopupOpen] = useState(false);
  const streakPopupRef = useRef(null);
  const notifPanelRef = useRef(null);
  const [notifOpen, setNotifOpen] = useState(false);

  const [activeLessonPopup, setActiveLessonPopup] = useState(null);

  // —— PWA: Online/Offline detection ——
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineBanner, setShowOfflineBanner] = useState(!navigator.onLine);
  const [pwaInstallPrompt, setPwaInstallPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [swUpdateAvailable, setSwUpdateAvailable] = useState(false);
  const [downloadingLessons, setDownloadingLessons] = useState({});

  const syncPendingUpdates = async (userId) => {
    if (!userId) return;
    const queueKey = `lisa_pending_profile_updates_${userId}`;
    const pending = JSON.parse(localStorage.getItem(queueKey) || "{}");
    if (Object.keys(pending).length === 0) return;

    try {
      console.log("[LISA Sync] Synchronizing pending offline updates to Supabase:", pending);
      const { error } = await supabase
        .from("profiles")
        .update(pending)
        .eq("id", userId);
      
      if (!error) {
        console.log("[LISA Sync] Synchronization successful!");
        localStorage.removeItem(queueKey);
      } else {
        console.warn("[LISA Sync] Synchronization failed:", error.message);
      }
    } catch (err) {
      console.warn("[LISA Sync] Sync exception:", err);
    }
  };

  const queueProfileUpdate = async (updates) => {
    const userId = session?.user?.id;
    if (!userId) return;

    // 1. Update React state immediately
    setProfile(prev => prev ? ({ ...prev, ...updates }) : null);

    // 2. Update localStorage cache for offline fetching fallback
    const cachedProfileKey = `lisa_profile_cache_${userId}`;
    const cached = JSON.parse(localStorage.getItem(cachedProfileKey) || "{}");
    localStorage.setItem(cachedProfileKey, JSON.stringify({ ...cached, ...updates }));

    // 3. Save to pending queue in localStorage
    const queueKey = `lisa_pending_profile_updates_${userId}`;
    const pending = JSON.parse(localStorage.getItem(queueKey) || "{}");
    const mergedPending = { ...pending, ...updates };
    localStorage.setItem(queueKey, JSON.stringify(mergedPending));

    // 4. Try to sync to Supabase immediately if online
    if (navigator.onLine) {
      try {
        const { error } = await supabase
          .from("profiles")
          .update(mergedPending)
          .eq("id", userId);
        
        if (!error) {
          localStorage.removeItem(queueKey);
        } else {
          console.warn("[LISA Sync] Immediate update failed, remaining in queue:", error.message);
        }
      } catch (e) {
        console.warn("[LISA Sync] Immediate update failed, remaining in queue:", e);
      }
    }
  };

  const downloadLessonOffline = async (lesson, sectionInfo, unitInfo) => {
    const userId = session?.user?.id || 'guest';
    const cacheKey = `lisa_lesson_content_${userId}_${lesson.id}`;
    
    setDownloadingLessons(prev => ({ ...prev, [lesson.id]: true }));
    try {
      const storedSkillScores = (() => {
        try {
          const stored = getStoredAssessmentState(userId);
          return stored?.skill_scores || profile?.skill_scores || profile?.attempts_history?.[0]?.skillScores || {};
        } catch { return {}; }
      })();
      const weakAreas = getWeakSkills(storedSkillScores);
      const currentLevelNum = calculateProgressiveLevel(profile, completedLessons);
      const profInfo = getProficiencyName(currentLevelNum, "English");

      const aiContent = await generateLessonContent({
        age: profile?.age || 25,
        educationLevel: profile?.education_level || "No Formal Education",
        language: learningLanguage || "English",
        learningLanguage: learningLanguage || "English",
        interfaceLanguage: selectedLanguage || "English",
        literacyLevel: currentLevelNum,
        literacyLevelName: profInfo?.name || "Beginner",
        weakAreas,
        sectionNum: sectionInfo?.num || 1,
        sectionTitle: sectionInfo?.title || "",
        unitNum: unitInfo?.num || 1,
        unitTitle: unitInfo?.title || "",
        lessonNum: lesson.num || 1,
        lessonTitle: lesson.title || "",
        difficulty: currentLevelNum <= 2 ? "beginner" : currentLevelNum <= 4 ? "intermediate" : "advanced",
        useFallback: !aiEnabled
      });

      if (aiContent) {
        localStorage.setItem(cacheKey, JSON.stringify(aiContent));
        alert(`${lesson.title} downloaded successfully! You can now study it offline.`);
      } else {
        alert("Failed to download lesson content. Please check your internet connection.");
      }
    } catch (err) {
      console.error("Error downloading lesson:", err);
      alert("An error occurred while downloading the lesson.");
    } finally {
      setDownloadingLessons(prev => ({ ...prev, [lesson.id]: false }));
    }
  };

  useEffect(() => {
    const handleOnline = () => { 
      setIsOnline(true); 
      setShowOfflineBanner(false); 
      if (session?.user?.id) {
        syncPendingUpdates(session.user.id);
      }
    };
    const handleOffline = () => { 
      setIsOnline(false); 
      setShowOfflineBanner(true); 
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    const handleInstall = (e) => {
      e.preventDefault();
      setPwaInstallPrompt(e);
      setShowInstallBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handleInstall);

    // Auto-show install banner for mobile/PWA environments if not already installed and not dismissed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    if (!isStandalone && localStorage.getItem("lisa_install_dismissed") !== "true") {
      setShowInstallBanner(true);
    }
    const handleSwUpd = () => setSwUpdateAvailable(true);
    window.addEventListener('swUpdateAvailable', handleSwUpd);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleInstall);
      window.removeEventListener('swUpdateAvailable', handleSwUpd);
    };
  }, [session]);

  useEffect(() => {
    if (!session?.user?.id) return;

    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    const checkStudyReminder = () => {
      if (!("Notification" in window) || Notification.permission !== "granted") return;
      
      const userId = session.user.id;
      const today = new Date().toLocaleDateString("en-CA");
      const doneToday = localStorage.getItem(`lisa_daily_lessons_${userId}_${today}`);
      
      if (!doneToday || parseInt(doneToday, 10) === 0) {
        navigator.serviceWorker.ready.then(reg => {
          reg.showNotification("Time for today's lesson! 📚", {
            body: "Keep your daily streak alive and boost your vocabulary today!",
            icon: "/icon.png",
            badge: "/icon.png",
            tag: "lisa-study-reminder"
          });
        });
      }
    };

    const checkWeeklyProgressReport = () => {
      if (!("Notification" in window) || Notification.permission !== "granted") return;
      const lastReportDate = localStorage.getItem(`lisa_last_weekly_report_${session.user.id}`);
      const now = Date.now();
      if (!lastReportDate || (now - parseInt(lastReportDate, 10)) > 7 * 24 * 60 * 60 * 1000) {
        navigator.serviceWorker.ready.then(reg => {
          reg.showNotification("Weekly Progress Report Ready! 📈", {
            body: "Your weekly learning insights and XP summary are ready to review.",
            icon: "/icon.png",
            badge: "/icon.png",
            tag: "lisa-weekly-report"
          });
          localStorage.setItem(`lisa_last_weekly_report_${session.user.id}`, String(now));
        });
      }
    };

    const timer1 = setTimeout(checkStudyReminder, 5000);
    const timer2 = setTimeout(checkWeeklyProgressReport, 10000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [session]);

  const handleInstallApp = async () => {
    if (pwaInstallPrompt) {
      pwaInstallPrompt.prompt();
      const { outcome } = await pwaInstallPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowInstallBanner(false);
        setPwaInstallPrompt(null);
      }
    } else {
      const isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      if (isiOS) {
        alert("To install LISA on iOS:\n\n1. Tap the Share button (square with arrow up) at the bottom/top of Safari.\n2. Scroll down the menu.\n3. Tap 'Add to Home Screen' (+ icon).");
      } else {
        alert("To install LISA on your device:\n\n1. Tap the browser menu button (typically three dots in the top-right corner).\n2. Choose 'Install App' or 'Add to Home Screen'.");
      }
      setShowInstallBanner(false);
      localStorage.setItem("lisa_install_dismissed", "true");
    }
  };

  const handleSwReload = () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
    }
    window.location.reload();
  };


  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileDropdownOpen && profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
      if (streakPopupOpen && streakPopupRef.current && !streakPopupRef.current.contains(e.target)) {
        setStreakPopupOpen(false);
      }
      if (notifOpen && notifPanelRef.current && !notifPanelRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
      if (activeLessonPopup && !e.target.closest('.duo-node-container')) {
        setActiveLessonPopup(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileDropdownOpen, streakPopupOpen, notifOpen, activeLessonPopup]);
  const [profileBg, setProfileBg] = useState("#e86b6b");
  const [profileAvatar, setProfileAvatar] = useState("/as1.png");
  const [isEditingCover, setIsEditingCover] = useState(false);
  const [activeTab, setActiveTab] = useState("login"); // "login", "register", "forgot"
  const [showLanding, setShowLanding] = useState(true);
  const [dashboardTab, setDashboardTab] = useState("dashboard"); // "dashboard", "learn", "practice", "profile", "shop", "leaderboard", "analytics"
  const switchDashboardTab = (tab) => {
    playChime("tab");
    triggerHaptic("tab");
    setDashboardTab(tab);
  };
  const [practiceCollectionPage, setPracticeCollectionPage] = useState(null); // null, "mistakes", "words"
  const [profileSubTab, setProfileSubTab] = useState("stats"); // "stats", "avatar", "settings"
  const [builderEmoji, setBuilderEmoji] = useState("😊");
  const [builderBg, setBuilderBg] = useState("#6366f1");
  const [builderShape, setBuilderShape] = useState("square");

  useEffect(() => {
    const resolved = resolveProfileAvatar(profileAvatar);
    if (resolved && resolved.type === "builder") {
      setBuilderEmoji(resolved.emoji || "😊");
      setBuilderBg(resolved.bg || "#6366f1");
      setBuilderShape(resolved.shape || "square");
    }
  }, [profileAvatar]);
  const [showPersonalizedPath, setShowPersonalizedPath] = useState(true);

  // XP Shop state — loaded per-user from Supabase (profiles.shop_data).
  // No global localStorage keys are used so shop unlocks stay tied to each account.
  const [shopOwnedItems, setShopOwnedItems] = useState([]);
  const [shopTheme, setShopTheme] = useState(() => {
    return localStorage.getItem("lisa_current_theme") || "theme_gold";
  });
  const [shopFont, setShopFont] = useState(() => {
    return localStorage.getItem("lisa_current_font") || null;
  });
  const [shopBanner, setShopBanner] = useState(null);
  const [shopCustomAvatar, setShopCustomAvatar] = useState(null);
  const [profileBadges, setProfileBadges] = useState([]);
  const [activeSection, setActiveSection] = useState(0); // paginated section in learn tab
  const learnJourneyRef = useRef(null);
  const activeNodeRef = useRef(null);

  const [userXp, setUserXp] = useState(0);
  const [showAllAchievementsModal, setShowAllAchievementsModal] = useState(false);
  const [shopCatalog, setShopCatalog] = useState(SHOP_CATALOG);
  const [adminAnnouncements, setAdminAnnouncements] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("lisa_admin_announcements") || "[]");
    } catch (e) {
      return [];
    }
  });

  // Trigger native device push notification when new announcements arrive (works on mobile PWA)
  useEffect(() => {
    if (!adminAnnouncements || adminAnnouncements.length === 0) return;

    const latestAnn = adminAnnouncements[adminAnnouncements.length - 1];
    const key = `lisa_native_notified_ann_${latestAnn.id}`;
    if (localStorage.getItem(key)) return;

    const fire = async () => {
      if ("Notification" in window && Notification.permission === "default") {
        await Notification.requestPermission().catch(() => {});
      }
      if (!("Notification" in window) || Notification.permission !== "granted") return;

      const title = `${latestAnn.icon || "📢"} ${latestAnn.title}`;
      const body = latestAnn.message;
      const tag = `lisa-ann-${latestAnn.id}`;

      if ("serviceWorker" in navigator) {
        try {
          const reg = await navigator.serviceWorker.ready;
          if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
              type: "SHOW_NOTIFICATION",
              title,
              options: { body, icon: "/icon.png", badge: "/icon.png", tag, vibrate: [200, 100, 200], data: { url: "/" } }
            });
          } else {
            await reg.showNotification(title, { body, icon: "/icon.png", badge: "/icon.png", tag, vibrate: [200, 100, 200] });
          }
        } catch (e) {
          try { new Notification(title, { body, icon: "/icon.png" }); } catch (_) {}
        }
      } else {
        try { new Notification(title, { body, icon: "/icon.png" }); } catch (_) {}
      }
      localStorage.setItem(key, "1");
    };
    fire();
  }, [adminAnnouncements]);


  const getLevelEncouragementMessage = (level) => {
    const messages = {
      1: "You're taking your first steps! Proud of you.",
      2: "Great start! You're recognizing words and building skills.",
      3: "Amazing! You are reading simple sentences smoothly.",
      4: "Keep it up! Your reading fluency is expanding.",
      5: "Fantastic progress! You are understanding more complex texts.",
      6: "Sensational! You are capturing key insights from paragraphs.",
      7: "Superb! Your communications are getting highly refined.",
      8: "Excellent! You are mastering functional daily literacy.",
      9: "Brilliant! Spelling and grammar are becoming second nature.",
      10: "Outstanding! You communicate with absolute confidence.",
      11: "Spectacular! You read and write at a professional level.",
      12: "Literacy Champion! You have achieved complete mastery."
    };
    return messages[level] || "Keep it up! Good Work";
  };
  const [lessonSession, setLessonSession] = useState(null);
  const [mistakeAttemptsCount, setMistakeAttemptsCount] = useState(0);
  const [showMistakeHint, setShowMistakeHint] = useState(false);
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);
  const [storyLineIndex, setStoryLineIndex] = useState(0);
  const [revealedStoryBubbles, setRevealedStoryBubbles] = useState({});
  const [storyQuestionIdx, setStoryQuestionIdx] = useState(null);
  const [storyQuestionAnswered, setStoryQuestionAnswered] = useState(false);
  const [storyQuestionFeedback, setStoryQuestionFeedback] = useState(null);
  const [streakCount, setStreakCount] = useState(0);
  const [wordOfDay, setWordOfDay] = useState({
    word: "Diligent",
    meaning: "Hardworking and showing care",
    example: "A diligent student practices reading a little every day."
  });
  const [userMistakes, setUserMistakes] = useState([]);
  const [activeSolveMistake, setActiveSolveMistake] = useState(null);
  const [activeSolveInput, setActiveSolveInput] = useState("");
  const [activeSolveFeedback, setActiveSolveFeedback] = useState(null);
  const [pronunciationQuestions, setPronunciationQuestions] = useState([]);
  const [pronunciationStep, setPronunciationStep] = useState(0);
  const [isRecordingPronunciation, setIsRecordingPronunciation] = useState(false);
  const [spokenText, setSpokenText] = useState("");
  const [pronouncedWordsMatch, setPronouncedWordsMatch] = useState([]);
  const [pronunciationScore, setPronunciationScore] = useState(null);
  const [slowSpeed, setSlowSpeed] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [pronunciationLoading, setPronunciationLoading] = useState(false);

  const recentMistakes = useMemo(() => {
    const normalized = (userMistakes || []).map((m, idx) => ({
      id: m.id || `mistake_${idx}`,
      type: m.type || m.prompt || "Review this item",
      prompt: m.prompt || m.type || "Review this item",
      text: m.sentence || m.question || m.phrase || m.audioText || m.text || m.correctAnswer || m.answer || "Practice this again",
      correctAnswer: m.correctAnswer || m.answer || m.englishTranslation || ""
    }));
    return normalized.length ? normalized : FALLBACK_PRACTICE_MISTAKES;
  }, [userMistakes]);

  const practiceWords = useMemo(() => {
    const dynamicWords = [
      wordOfDay?.word && { word: wordOfDay.word, meaning: wordOfDay.meaning || "Word of the day", isNew: true },
      ...recentMistakes.map((m) => {
        const text = String(m.correctAnswer || m.text || "").replace(/[^A-Za-z\s]/g, " ").split(/\s+/).filter(Boolean).find(w => w.length > 3);
        return text ? { word: text, meaning: m.prompt || "From your mistakes", isNew: true } : null;
      })
    ].filter(Boolean);
    const merged = [...dynamicWords, ...FALLBACK_PRACTICE_WORDS];
    const seen = new Set();
    return merged.filter((item) => {
      const key = item.word.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 72);
  }, [recentMistakes, wordOfDay]);

  useEffect(() => {
    if (!session?.user?.id) {
      setUserMistakes([]);
      return;
    }
    try {
      const stored = localStorage.getItem(`lisa_user_mistakes_${session.user.id}`);
      setUserMistakes(stored ? JSON.parse(stored) : []);
    } catch {
      setUserMistakes([]);
    }
  }, [session?.user?.id]);

  const [dailyXp, setDailyXp] = useState(0);
  const [dailyTimeSpent, setDailyTimeSpent] = useState(0); // in seconds
  const [dailyLessons, setDailyLessons] = useState(0);
  const [dailyCorrectAnswers, setDailyCorrectAnswers] = useState(0);
  const [weeklyXp, setWeeklyXp] = useState(0);
  const STAR_XP = 10; // XP required to earn one star
  const getStarsToday = () => Math.floor(dailyXp / STAR_XP);
  const isActiveLearningRef = useRef(false); // true only while taking a lesson, practice, or assessment
  const [activeQuests, setActiveQuests] = useState([]);
  const [timeLeftStr, setTimeLeftStr] = useState("24h 00m 00s");
  const [questBonusClaimed, setQuestBonusClaimed] = useState(false);
  const [dismissedNotifIds, setDismissedNotifIds] = useState([]);
  const [readNotifIds, setReadNotifIds] = useState([]);

  const saveNotifState = async (newReadIds, newDismissedIds) => {
    // Never persist ann_ IDs in dismissed — announcements should always show until explicitly dismissed per-session
    const filteredDismissed = newDismissedIds.filter(id => !id.startsWith("ann_"));
    setReadNotifIds(newReadIds);
    setDismissedNotifIds(filteredDismissed);
    if (session?.user?.id) {
      localStorage.setItem(`lisa_notif_data_${session.user.id}`, JSON.stringify({ readNotifIds: newReadIds, dismissedNotifIds: filteredDismissed }));
      try {
        await supabase.from("profiles").update({ notif_data: { readNotifIds: newReadIds, dismissedNotifIds: filteredDismissed } }).eq("id", session.user.id);
      } catch (e) {
        console.error("Could not save notification data to Supabase:", e);
      }
    }
  };

  const saveDismissedNotifs = async (ids) => {
    await saveNotifState(readNotifIds, ids);
  };

  const saveReadNotifs = async (ids) => {
    await saveNotifState(ids, dismissedNotifIds);
  };

  // Translated dashboard strings for non-English languages (fall back to English source values)
  const [translatedLevelMsg, setTranslatedLevelMsg] = useState("");
  const [translatedStreakMsg, setTranslatedStreakMsg] = useState("");
  const [translatedQuestTitles, setTranslatedQuestTitles] = useState({});
  const [translatedAchievements, setTranslatedAchievements] = useState({});

  const getQuestProgress = (quest) => {
    if (quest.type === 'xp') {
      return {
        current: dailyXp,
        target: quest.target,
        completed: dailyXp >= quest.target,
        percent: Math.min((dailyXp / quest.target) * 100, 100),
        displayProgress: `${dailyXp}/${quest.target} XP`
      };
    } else if (quest.type === 'time') {
      const minsCurrent = Math.floor(dailyTimeSpent / 60);
      const minsTarget = quest.target / 60;
      return {
        current: minsCurrent,
        target: minsTarget,
        completed: dailyTimeSpent >= quest.target,
        percent: Math.min((dailyTimeSpent / quest.target) * 100, 100),
        displayProgress: `${Math.min(minsCurrent, minsTarget)}/${minsTarget} min`
      };
    } else if (quest.type === 'lessons') {
      return {
        current: dailyLessons,
        target: quest.target,
        completed: dailyLessons >= quest.target,
        percent: Math.min((dailyLessons / quest.target) * 100, 100),
        displayProgress: `${Math.min(dailyLessons, quest.target)}/${quest.target} ${quest.target === 1 ? 'lesson' : 'lessons'}`
      };
    }
    return { current: 0, target: 1, completed: false, percent: 0, displayProgress: '0/1' };
  };

  const lightenColor = (hex, alpha = 0.12) => {
    if (!hex || !hex.startsWith('#')) return 'transparent';
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const allNotifications = useMemo(() => {
    const notifs = [];

    // Admin announcements — broadcast to all users (placed at top of notifications list)
    if (Array.isArray(adminAnnouncements) && adminAnnouncements.length > 0) {
      adminAnnouncements.forEach((ann, idx) => {
        const rawId = ann.id ? String(ann.id) : `ann_${idx}`;
        const notifId = rawId.startsWith("ann_") ? rawId : `ann_${rawId}`;
        notifs.push({
          id: notifId,
          icon: ann.icon || "📢",
          title: ann.title || "Announcement",
          message: ann.message || "",
          color: ann.color || "#6366f1",
          isAnnouncement: true
        });
      });
    }

    if (streakCount > 0) {
      notifs.push({ id: "streak", icon: "🔥", title: "Streak Reminder", message: getStreakMessage(streakCount), color: "#f97316" });
    }
    if (userXp >= 100) {
      notifs.push({ id: "xp100", icon: "⭐", title: "XP Milestone", message: "You've earned 100 XP total!", color: "#f59e0b" });
    }
    const earnedAchIds = completedLessons.filter(id => id.startsWith("ach_")).map(id => parseInt(id.replace("ach_", ""), 10));
    ACHIEVEMENT_DEFS.forEach(a => {
      if (earnedAchIds.includes(a.id)) {
        notifs.push({ id: `ach_${a.id}`, icon: a.icon, title: a.title, message: a.desc, color: a.color });
      }
    });
    if (profileBadges.length > 0) {
      notifs.push({ id: "badges", icon: "🏅", title: "Badge Unlocked", message: `You have ${profileBadges.length} badge${profileBadges.length > 1 ? 's' : ''} from the XP Shop!`, color: "#a855f7" });
    }
    if (Array.isArray(shopOwnedItems)) {
      shopOwnedItems.forEach((itemId) => {
        let foundItem = null;
        let category = "";
        for (const cat of Object.keys(SHOP_CATALOG)) {
          const itemsList = SHOP_CATALOG[cat];
          if (Array.isArray(itemsList)) {
            const match = itemsList.find(i => i.id === itemId);
            if (match) {
              foundItem = match;
              category = cat;
              break;
            }
          }
        }
        if (foundItem) {
          notifs.push({
            id: `shop_${foundItem.id}`,
            icon: foundItem.icon || "🛒",
            title: `Unlocked: ${foundItem.name}`,
            message: foundItem.desc || `You purchased this item from the XP Shop.`,
            color: category === "themes" ? foundItem.preview?.accent || "#a855f7" : "#10b981"
          });
        }
      });
    }
    if (dailyLessons === 0) {
      notifs.push({ id: "lesson_reminder", icon: "📚", title: "Lesson Reminder", message: "You haven't practiced today. Start a lesson!", color: "#3b82f6" });
    }
    if (activeQuests.length > 0 && activeQuests.every(q => getQuestProgress(q).completed) && !questBonusClaimed) {
      notifs.push({ id: "quest_complete", icon: "💎", title: "Quest Complete", message: "You've completed your daily quest! Claim your bonus.", color: "#10b981" });
    }
    const currentLevel = profile ? calculateProgressiveLevel(profile, completedLessons) : 1;
    if (currentLevel > 1) {
      notifs.push({ id: "levelup", icon: "🎉", title: "Level Up", message: `Congratulations! You reached Level ${currentLevel}.`, color: "#8b5cf6" });
    }
    return notifs;
  }, [streakCount, userXp, completedLessons, profileBadges, dailyLessons, activeQuests, questBonusClaimed, profile, shopOwnedItems, adminAnnouncements]);

  const notifications = useMemo(() => {
    return allNotifications.filter(n => !dismissedNotifIds.includes(n.id));
  }, [allNotifications, dismissedNotifIds]);

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !readNotifIds.includes(n.id)).length;
  }, [notifications, readNotifIds]);

  // Records correct answers made "today" into a daily counter (localStorage backed).
  // Reads the latest value from localStorage to avoid double counting from stale state.
  const recordDailyCorrect = (count = 1) => {
    const userId = session?.user?.id;
    if (!userId) return;
    const todayStr = new Date().toLocaleDateString("en-CA");
    const key = `lisa_daily_correct_${userId}_${todayStr}`;
    const prev = parseInt(localStorage.getItem(key) || "0", 10) || 0;
    const next = prev + count;
    localStorage.setItem(key, String(next));
    setDailyCorrectAnswers(next);
  };

  // Adds XP to the current user's weekly total (auto-resets weekly) and syncs it to Supabase
  // so the weekly leaderboard reflects real users' progress this week.
  const recordWeeklyXp = async (amount) => {
    const userId = session?.user?.id;
    if (!userId || !amount) return;
    try {
      const weekStart = getWeekStartDate();
      const { data } = await supabase
        .from("profiles")
        .select("weekly_xp, weekly_start")
        .eq("id", userId)
        .single();

      let currentWeeklyXp = 0;
      if (data?.weekly_start === weekStart) {
        currentWeeklyXp = data.weekly_xp || 0;
      }

      const nextWeekly = currentWeeklyXp + amount;
      setWeeklyXp(nextWeekly);

      await queueProfileUpdate({ weekly_xp: nextWeekly, weekly_start: weekStart });
    } catch (e) {
      console.warn("Could not sync weekly XP to Supabase:", e);
    }
  };

  useEffect(() => {
    if (!session?.user?.id) return;
    const userId = session.user.id;
    const today = new Date().toLocaleDateString("en-CA");

    const storedDailyXp = localStorage.getItem(`lisa_daily_xp_${userId}_${today}`);
    const storedDailyTime = localStorage.getItem(`lisa_daily_time_${userId}_${today}`);
    const storedDailyLessons = localStorage.getItem(`lisa_daily_lessons_${userId}_${today}`);
    const storedDailyCorrect = localStorage.getItem(`lisa_daily_correct_${userId}_${today}`);

    const initDaily = async () => {
      let dbDailyXp = 0, dbDailyTime = 0, dbDailyLessons = 0, dbDailyCorrect = 0;
      let dbWeeklyXp = null;
      let dbWeeklyStart = null;
      try {
        const { data } = await supabase.from("profiles").select("daily_xp,daily_time_spent,daily_lessons,daily_correct_answers,daily_quest_date,weekly_xp,weekly_start").eq("id", userId).single();
        if (data) {
          const storedDate = data.daily_quest_date;
          if (storedDate === today) {
            dbDailyXp = data.daily_xp || 0;
            dbDailyTime = data.daily_time_spent || 0;
            dbDailyLessons = data.daily_lessons || 0;
            dbDailyCorrect = data.daily_correct_answers || 0;
          }
          // Seed the local weekly accumulator from the DB if we have no local value yet this week
          dbWeeklyXp = data.weekly_xp || 0;
          dbWeeklyStart = data.weekly_start;
        }
      } catch { }

      const finalXp = storedDailyXp !== null ? parseInt(storedDailyXp, 10) : dbDailyXp;
      const finalTime = storedDailyTime !== null ? parseInt(storedDailyTime, 10) : dbDailyTime;
      const finalLessons = storedDailyLessons !== null ? parseInt(storedDailyLessons, 10) : dbDailyLessons;
      const finalCorrect = storedDailyCorrect !== null ? parseInt(storedDailyCorrect, 10) : dbDailyCorrect;

      setDailyXp(finalXp);
      setDailyTimeSpent(finalTime);
      setDailyLessons(finalLessons);
      setDailyCorrectAnswers(finalCorrect);

      localStorage.setItem(`lisa_daily_xp_${userId}_${today}`, finalXp);
      localStorage.setItem(`lisa_daily_time_${userId}_${today}`, finalTime);
      localStorage.setItem(`lisa_daily_lessons_${userId}_${today}`, finalLessons);
      localStorage.setItem(`lisa_daily_correct_${userId}_${today}`, finalCorrect);

      // Initialize weekly XP from DB only
      const weekStart = getWeekStartDate();

      if (dbWeeklyStart === weekStart) {
        setWeeklyXp(dbWeeklyXp || 0);
      } else {
        setWeeklyXp(0);
        try {
          await queueProfileUpdate({ weekly_xp: 0, weekly_start: weekStart });
        } catch (e) {
          console.warn("Could not reset weekly XP:", e);
        }
      }
    };

    initDaily();

    const timer = setInterval(() => {
      if (!isActiveLearningRef.current) return;
      const today2 = new Date().toLocaleDateString("en-CA");
      setDailyTimeSpent(prev => {
        const next = prev + 1;
        localStorage.setItem(`lisa_daily_time_${userId}_${today2}`, next);
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [session?.user?.id]);

  // Seed quests, bonus flag, profile visuals and saved shop customizations.
  useEffect(() => {
    if (!session?.user?.id) return;
    const userId = session.user.id;
    const today = new Date().toLocaleDateString("en-CA");

    const questsKey = `lisa_daily_quests_${userId}_${today}`;
    const storedQuests = localStorage.getItem(questsKey);
    if (storedQuests) {
      try {
        setActiveQuests(JSON.parse(storedQuests));
      } catch {
        const selected = selectQuestsForToday(userId, today);
        setActiveQuests(selected);
        localStorage.setItem(questsKey, JSON.stringify(selected));
      }
    } else {
      const selected = selectQuestsForToday(userId, today);
      setActiveQuests(selected);
      localStorage.setItem(questsKey, JSON.stringify(selected));
    }

    const questBonusKey = `lisa_quest_bonus_${userId}_${today}`;
    setQuestBonusClaimed(!!localStorage.getItem(questBonusKey));

    const bg = localStorage.getItem(`lisa_profile_bg_${userId}`) || "#e86b6b";
    let av = "/as1.png";
    try {
      const stored = localStorage.getItem(`lisa_profile_avatar_${userId}`);
      if (stored) {
        // Could be a JSON avatar object (emoji/builder) or a plain string/url.
        av = stored.startsWith("{") ? JSON.parse(stored) : stored;
      }
    } catch {
      av = localStorage.getItem(`lisa_profile_avatar_${userId}`) || "/as1.png";
    }
    setProfileBg(bg);
    setProfileAvatar(av);
  }, [session?.user?.id]);

  // Apply the equipped shop theme/font whenever they change (loaded from Supabase).
  useEffect(() => {
    if (shopTheme) {
      applyTheme(shopTheme);
      localStorage.setItem("lisa_current_theme", shopTheme);
    }
    if (shopFont) {
      const fontObj = SHOP_CATALOG.fonts.find(f => f.id === shopFont);
      if (fontObj) {
        applyFont(fontObj.family);
        localStorage.setItem("lisa_current_font", shopFont);
      }
    }
  }, [shopTheme, shopFont]);

  useEffect(() => {
    if (!session?.user?.id || questBonusClaimed) return;
    const userId = session.user.id;
    const today = new Date().toLocaleDateString("en-CA");

    if (activeQuests.length > 0 && activeQuests.every(q => getQuestProgress(q).completed)) {
      setQuestBonusClaimed(true);
      const bonusXp = 30;
      setUserXp(prev => {
        const next = prev + bonusXp;
        localStorage.setItem(`lisa_user_xp_${userId}`, next);
        return next;
      });
      setDailyXp(prev => {
        const next = prev + bonusXp;
        localStorage.setItem(`lisa_daily_xp_${userId}_${today}`, next);
        return next;
      });
      localStorage.setItem(`lisa_quest_bonus_${userId}_${today}`, "1");
      recordWeeklyXp(bonusXp);
    }
  }, [activeQuests, dailyXp, dailyTimeSpent, dailyLessons, questBonusClaimed, session?.user?.id]);

  useEffect(() => {
    if (!session?.user?.id) return;
    const userId = session.user.id;

    const timer = setInterval(() => {
      if (!isActiveLearningRef.current) return;
      const today = new Date().toLocaleDateString("en-CA");
      setDailyTimeSpent(prev => {
        const next = prev + 1;
        localStorage.setItem(`lisa_daily_time_${userId}_${today}`, next);
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [session?.user?.id]);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0); // Next midnight
      const diffMs = midnight - now;

      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000);

      setTimeLeftStr(`${diffHrs}h ${diffMins}m ${diffSecs}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to the current active (resumed) lesson node
  useEffect(() => {
    if (dashboardTab === "learn") {
      const scrollActiveNode = () => {
        if (activeNodeRef.current) {
          activeNodeRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      };

      // Staggered scrolls to guarantee accuracy as images load and DOM finishes laying out
      const t1 = setTimeout(scrollActiveNode, 100);
      const t2 = setTimeout(scrollActiveNode, 400);
      const t3 = setTimeout(scrollActiveNode, 800);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [dashboardTab, completedLessons]);

  useEffect(() => {
    let active = true;
    const loadWordOfDay = async () => {
      const interfaceLang = selectedLanguage || "English";
      const learnLang = profile?.learning_language || learningLanguage || "English";

      // Built-in dataset of vocabulary words (30+ daily words)
      const defaultWords = [
        { word: "Diligent", meaning: "Hardworking and showing care", meaning_hi: "मेहनती और लगनशील", meaning_kn: "ಕಷ್ಟಪಟ್ಟು ಕೆಲಸ ಮಾಡುವ ಮತ್ತು ಕಾಳಜಿ ತೋರುವ", meaning_ta: "கடின உழைப்பு மற்றும் அக்கறை காட்டுதல்", meaning_te: "కష్టపడి పనిచేసే మరియు శ్రద్ధ చూపించే", example: "A diligent student practices reading a little every day." },
        { word: "Resilient", meaning: "Able to withstand or recover quickly from difficulties", meaning_hi: "कठिनाइयों से जल्दी उबरने वाला", meaning_kn: "ಸವಾಲುಗಳಿಂದ ಬೇಗನೆ ಚೇತರಿಸಿಕೊಳ್ಳುವ", meaning_ta: "சவால்களிலிருந்து விரைவில் மீண்டு வரும்", meaning_te: "సవాలుల నుండి త్వరగా కోలుకునే", example: "She remained resilient and kept trying until she mastered the lesson." },
        { word: "Curious", meaning: "Eager to learn or know something", meaning_hi: "जिज्ञासु या जानने का इच्छुक", meaning_kn: "ತಿಳಿದುಕೊಳ್ಳಲು ಕುತೂಹಲವಿರುವ", meaning_ta: "அறிந்து கொள்ள ஆர்வம் கொண்ட", meaning_te: "తెలుసుకోవడానికి ఆసక్తి ఉన్న", example: "Curious learners ask thoughtful questions during class." },
        { word: "Empathy", meaning: "The ability to understand and share feelings of others", meaning_hi: "दूसरों की भावनाओं को समझने की क्षमता", meaning_kn: "ಇತರರ ಭಾವನೆಗಳನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳುವ ಸಾಮರ್ಥ್ಯ", meaning_ta: "மற்றவர்களின் உணர்வுகளைப் புரிந்து கொள்ளும் திறன்", meaning_te: "ఇతరుల భావాలను అర్థం చేసుకునే సామర్థ్యం", example: "Showing empathy makes us kinder friends and better teammates." },
        { word: "Persistent", meaning: "Continuing firmly despite obstacles or difficulty", meaning_hi: "बाधाओं के बावजूद डटे रहने वाला", meaning_kn: "ಅಡಚಣೆಗಳಿದ್ದರೂ ಸತತವಾಗಿ ಪ್ರಯತ್ನಿಸುವ", meaning_ta: "தடைகள் இருந்தாலும் தொடர்ந்து முயலும்", meaning_te: "అంతరాయాలు ఉన్నప్పటికీ నిరంతరం ప్రయత్నించే", example: "With persistent effort, you can overcome any reading challenge." },
        { word: "Grateful", meaning: "Feeling or showing appreciation for kindness", meaning_hi: "आभारी और कृतज्ञ", meaning_kn: "ಕೃತಜ್ಞತೆಯಿಂದ ಕೂಡಿರುವ", meaning_ta: "நன்றியுணர்வு கொண்ட", meaning_te: "కృతజ్ఞత కలిగి ఉన్న", example: "I am grateful for the encouragement from my teachers." },
        { word: "Inspire", meaning: "Fill someone with the urge to do something creative", meaning_hi: "प्रेरित करना या हौसला बढ़ाना", meaning_kn: "ಪ್ರೇರೇಪಿಸು ಅಥವಾ ಪ್ರೋತ್ಸಾಹಿಸು", meaning_ta: "ஊக்கமளித்தல் அல்லது உத்வேகம் அளித்தல்", meaning_te: "ప్రేరేపించడం లేదా ప్రోత్సహించడం", example: "Good stories inspire us to dream big and learn more." },
        { word: "Optimistic", meaning: "Hopeful and confident about the future", meaning_hi: "आशावादी और भविष्य के प्रति सकारात्मक", meaning_kn: "ಆಶಾವಾದಿ ಮತ್ತು ಭವಿಷ್ಯದ ಬಗ್ಗೆ ಧನಾತ್ಮಕ", meaning_ta: "நம்பிக்கையான மற்றும் எதிர்காலம் குறித்து நேர்மறையான", meaning_te: "ఆశావాదం మరియు భవిష్యత్తుపై నమ్మకం ఉన్న", example: "An optimistic attitude helps you enjoy every learning milestone." },
        { word: "Courage", meaning: "Strength in the face of pain or grief", meaning_hi: "साहस और हिम्मत", meaning_kn: "ಧೈರ್ಯ ಮತ್ತು ಸಾಹಸ", meaning_ta: "தைரியம் மற்றும் மனவலிமை", meaning_te: "ధైర్యం మరియు గుండె నిబ్బరం", example: "It takes courage to speak up and practice a new language." },
        { word: "Harmony", meaning: "Agreement or peace between people", meaning_hi: "सामंजस्य और शांति", meaning_kn: "ಸೌಹಾರ್ದತೆ ಮತ್ತು ಶಾಂತಿ", meaning_ta: "ஒற்றுமை மற்றும் அமைதி", meaning_te: "సామరస్యం మరియు శాంతి", example: "Working together in harmony brings success to the whole class." },
        { word: "Generous", meaning: "Showing readiness to give more of something", meaning_hi: "उदार और दानशील", meaning_kn: "ಉದಾರ ಮನಸ್ಸಿನ ಮತ್ತು ನೆರವಾಗುವ", meaning_ta: "தாராள குணமுள்ள மற்றும் உதவும்", meaning_te: "ఉదారమైన మరియు సహాయపడే", example: "A generous friend shares their books and learning tips." },
        { word: "Knowledge", meaning: "Information and skills acquired through experience or education", meaning_hi: "ज्ञान और जानकारी", meaning_kn: "ಜ್ಞಾನ ಮತ್ತು ಮಾಹಿತಿ", meaning_ta: "அறிவு மற்றும் தகவல்", meaning_te: "జ్ఞానం మరియు సమాచారం", example: "Reading books expands your knowledge every single day." },
        { word: "Patience", meaning: "The capacity to accept delay or trouble without getting angry", meaning_hi: "धैर्य और सहनशीलता", meaning_kn: "ಸಹನೆ ಮತ್ತು ತಾಳ್ಮೆ", meaning_ta: "பொறுமை ಮತ್ತು ಸಕಿಪ್ಪುத்தன்மை", meaning_te: "ఓర్పు మరియు సహనం", example: "Learning a new skill requires practice and patience." },
        { word: "Creative", meaning: "Relating to or involving the use of imagination", meaning_hi: "रचनात्मक और कल्पनाशील", meaning_kn: "ಸೃಜನಶೀಲ ಮತ್ತು ಕಲ್ಪನಾತ್ಮಕ", meaning_ta: "படைப்பாற்றல் கொண்ட", meaning_te: "సృజనాత్మకత కలిగిన", example: "Drawing and writing stories lets your creative mind shine." },
        { word: "Wisdom", meaning: "The quality of having experience, knowledge, and good judgment", meaning_hi: "बुद्धिमत्ता और समझदारी", meaning_kn: "ಜ್ಞಾನ ಮತ್ತು ಜಾಣತನ", meaning_ta: "ஞானம் மற்றும் புத்தி கூர்மை", meaning_te: "వివేకం మరియు తెలివి", example: "Wisdom comes from listening carefully and learning from mistakes." }
      ];

      let allWords = [...defaultWords];

      try {
        // Fetch all word_of_day entries from Supabase database
        const { data: dbWords, error: fetchErr } = await supabase
          .from("word_of_day")
          .select("*");

        if (!fetchErr && dbWords && dbWords.length > 0) {
          // Filter dbWords matching language or include all database words
          const matchingDbWords = dbWords.filter(w => 
            !w.language || w.language.toLowerCase() === learnLang.toLowerCase() || w.language.toLowerCase() === "english"
          );
          if (matchingDbWords.length > 0) {
            allWords = matchingDbWords;
          } else {
            allWords = dbWords;
          }
        }
      } catch (err) {
        console.warn("Supabase word_of_day fetch notice:", err);
      }

      // Calculate deterministic Day Index (rotates automatically every day at 12:00 AM)
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      const date = now.getDate();

      // Days since epoch
      const dayNumber = Math.floor(Date.UTC(year, month, date) / (1000 * 60 * 60 * 24));
      const wordIndex = Math.abs(dayNumber) % allWords.length;
      const selectedWordObj = allWords[wordIndex];

      if (active && selectedWordObj) {
        let resolvedMeaning = selectedWordObj.meaning;
        if (interfaceLang === "Hindi" && selectedWordObj.meaning_hi) {
          resolvedMeaning = selectedWordObj.meaning_hi;
        } else if (interfaceLang === "Kannada" && selectedWordObj.meaning_kn) {
          resolvedMeaning = selectedWordObj.meaning_kn;
        } else if (interfaceLang === "Telugu" && selectedWordObj.meaning_te) {
          resolvedMeaning = selectedWordObj.meaning_te;
        } else if (interfaceLang === "Tamil" && selectedWordObj.meaning_ta) {
          resolvedMeaning = selectedWordObj.meaning_ta;
        }

        setWordOfDay({
          word: selectedWordObj.word,
          meaning: resolvedMeaning,
          example: selectedWordObj.example || `Practice using the word '${selectedWordObj.word}' in your daily reading.`
        });
      }
    };

    loadWordOfDay();
    return () => { active = false; };
  }, [selectedLanguage, learningLanguage, profile?.learning_language, session?.user?.id]);

  // Translate static dashboard strings (level message, streak message, quest titles, achievement title/desc)
  // into the selected language. Re-runs when language or the underlying values change. English shows the source text.
  useEffect(() => {
    let cancelled = false;
    const lang = selectedLanguage || "English";
    const lvl = calculateProgressiveLevel(profile, completedLessons);

    const translateDashboardStrings = async () => {
      // 1. English is direct
      if (lang === "English") {
        setTranslatedLevelMsg(getLevelEncouragementMessage(lvl));
        setTranslatedStreakMsg(getStreakMessage(streakCount));
        setTranslatedQuestTitles({});
        setTranslatedAchievements({});
        return;
      }

      // 2. Check local static dictionary first
      const localDict = localDashboardTranslations[lang];
      if (localDict) {
        const lvlMsg = localDict.levels[lvl] || getLevelEncouragementMessage(lvl);

        let strMsg = "";
        if (streakCount === 0) strMsg = localDict.streaks[0];
        else if (streakCount === 1) strMsg = localDict.streaks[1];
        else strMsg = localDict.streakTemplate(streakCount);

        const questTitles = {};
        activeQuests.forEach(q => {
          questTitles[q.id] = localDict.quests[q.id] || q.title;
        });

        const achs = {};
        ACHIEVEMENT_DEFS.forEach(a => {
          achs[a.id] = {
            title: localDict.achievements[a.id]?.title || a.title,
            desc: localDict.achievements[a.id]?.desc || a.desc
          };
        });

        if (!cancelled) {
          setTranslatedLevelMsg(lvlMsg);
          setTranslatedStreakMsg(strMsg);
          setTranslatedQuestTitles(questTitles);
          setTranslatedAchievements(achs);
        }
        return;
      }

      // 3. Fallback to API if lang is not in local dictionary
      try {
        const [lvlMsg, strMsg] = await Promise.all([
          translateTextContent(getLevelEncouragementMessage(lvl), lang),
          translateTextContent(getStreakMessage(streakCount), lang)
        ]);
        const questEntries = await Promise.all(
          activeQuests.map(async (q) => [q.id, await translateTextContent(q.title, lang)])
        );
        const achEntries = await Promise.all(
          ACHIEVEMENT_DEFS.map(async (a) => [a.id, {
            title: await translateTextContent(a.title, lang),
            desc: await translateTextContent(a.desc, lang)
          }])
        );
        if (cancelled) return;
        setTranslatedLevelMsg(lvlMsg);
        setTranslatedStreakMsg(strMsg);
        setTranslatedQuestTitles(Object.fromEntries(questEntries));
        setTranslatedAchievements(Object.fromEntries(achEntries));
      } catch (e) {
        console.warn("Dashboard translation failed:", e);
        if (!cancelled) {
          setTranslatedLevelMsg(getLevelEncouragementMessage(lvl));
          setTranslatedStreakMsg(getStreakMessage(streakCount));
          setTranslatedQuestTitles({});
          setTranslatedAchievements({});
        }
      }
    };

    translateDashboardStrings();
    return () => { cancelled = true; };
  }, [selectedLanguage, profile, completedLessons, streakCount, activeQuests]);

  useEffect(() => {
    // A custom photo (avatar_url) is only enabled once the learner reaches
    // level 10. Before that, keep the shop/emoji/initials avatar in the navbar
    // and profile instead of forcing the old uploaded photo to show.
    const level = calculateProgressiveLevel(profile, completedLessons);
    if (profile?.avatar_url && level >= 10) {
      setProfileAvatar(profile.avatar_url);
    }
  }, [profile?.avatar_url, profile, completedLessons]);

  const updateStreak = async (userId, currentProfile) => {
    try {
      const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD local format
      const yesterdayDate = new Date();
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);
      const yesterday = yesterdayDate.toLocaleDateString("en-CA");

      let currentStreak = currentProfile?.streak ?? 0;
      let lastActive = currentProfile?.last_active_date;

      const localStreak = localStorage.getItem(`lisa_streak_${userId}`);
      const localLastActive = localStorage.getItem(`lisa_last_active_date_${userId}`);

      if (localStreak && !currentProfile?.streak) {
        currentStreak = parseInt(localStreak, 10);
      }
      if (localLastActive && !lastActive) {
        lastActive = localLastActive;
      }

      let newStreak = currentStreak;

      if (!lastActive) {
        newStreak = 1;
      } else if (lastActive === today) {
        newStreak = currentStreak || 1;
      } else if (lastActive === yesterday) {
        newStreak = currentStreak + 1;
      } else {
        newStreak = 1;
      }

      localStorage.setItem(`lisa_streak_${userId}`, newStreak);
      localStorage.setItem(`lisa_last_active_date_${userId}`, today);

      let activeDates = [];
      try {
        const stored = localStorage.getItem(`lisa_active_dates_${userId}`);
        activeDates = stored ? JSON.parse(stored) : [];
      } catch { }
      if (!activeDates.includes(today)) {
        activeDates.push(today);
        localStorage.setItem(`lisa_active_dates_${userId}`, JSON.stringify(activeDates));
      }

      // Merge with any dates already stored in Supabase (cross-device)
      const dbDates = Array.isArray(currentProfile?.streak_dates) ? currentProfile.streak_dates : [];
      const mergedDates = Array.from(new Set([...dbDates, ...activeDates]));

      setStreakCount(newStreak);

      await supabase
        .from("profiles")
        .update({
          streak: newStreak,
          last_active_date: today,
          streak_dates: mergedDates
        })
        .eq("id", userId);

      setProfile(prev => prev ? { ...prev, streak: newStreak, last_active_date: today, streak_dates: mergedDates } : null);
    } catch (err) {
      console.warn("Could not sync streak with DB, utilizing local storage:", err);
    }
  };
  const getPastSevenDaysStatus = () => {
    if (!session?.user?.id) return [];
    const userId = session.user.id;

    let activeDates = [];
    try {
      const stored = localStorage.getItem(`lisa_active_dates_${userId}`);
      activeDates = stored ? JSON.parse(stored) : [];
    } catch {
      activeDates = [];
    }

    // Include dates persisted in Supabase so the streak calendar is cross-device
    const dbDates = Array.isArray(profile?.streak_dates) ? profile.streak_dates : [];
    activeDates = Array.from(new Set([...dbDates, ...activeDates]));

    const todayStr = new Date().toLocaleDateString("en-CA");
    const lastActiveLocal = localStorage.getItem(`lisa_last_active_date_${userId}`);
    if (lastActiveLocal === todayStr && !activeDates.includes(todayStr)) {
      activeDates.push(todayStr);
      try {
        localStorage.setItem(`lisa_active_dates_${userId}`, JSON.stringify(activeDates));
      } catch { }
    }

    // Derive completed days from the actual streak count so the calendar always
    // reflects the streak (e.g. a 2-day streak lights up today + yesterday)
    const completedSet = new Set(activeDates);
    const anchorStr = profile?.last_active_date || lastActiveLocal || todayStr;
    const anchor = new Date(`${anchorStr}T00:00:00`);
    if (!isNaN(anchor.getTime())) {
      for (let j = 0; j < streakCount; j++) {
        const d = new Date(anchor);
        d.setDate(d.getDate() - j);
        completedSet.add(d.toLocaleDateString("en-CA"));
      }
    }

    const days = [];
    const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString("en-CA");
      const dayLabel = weekdayLabels[d.getDay()];
      days.push({
        label: dayLabel,
        date: dateStr,
        isCompleted: completedSet.has(dateStr),
        isToday: i === 0
      });
    }
    return days;
  };

  useEffect(() => {
    if (session?.user?.id) {
      const userId = session.user.id;
      const storedXp = localStorage.getItem(`lisa_user_xp_${userId}`);
      setUserXp(storedXp ? parseInt(storedXp, 10) : 0);

      const storedLessons = localStorage.getItem(`lisa_completed_lessons_${userId}`);
      setCompletedLessons(storedLessons ? JSON.parse(storedLessons) : []);

      const localStreak = localStorage.getItem(`lisa_streak_${userId}`);
      setStreakCount(localStreak ? parseInt(localStreak, 10) : 0);

      const bg = localStorage.getItem(`lisa_profile_bg_${userId}`) || "#e86b6b";
      // Don't apply a stored photo URL here — a custom photo is only enabled at
      // level 10 and fetchProfile decides that later. Emoji/builder avatars are
      // safe to apply immediately.
      let av = localStorage.getItem(`lisa_profile_avatar_${userId}`) || "/as1.png";
      if (typeof av === "string" && av.startsWith("http")) av = "/as1.png";
      setProfileBg(bg);
      setProfileAvatar(av);
    } else {
      setUserXp(0);
      setCompletedLessons([]);
      setStreakCount(0);
      setProfileBg("#e86b6b");
      setProfileAvatar("/as1.png");
      setWeeklyXp(0);
    }
  }, [session]);

  const [lessonLoading, setLessonLoading] = useState(false);
  const [lessonStep, setLessonStep] = useState(0); // 0=explanation, 1=MCQs, 2=fillBlanks, 3=reading, 4=writing, 5=pronunciation
  const [lessonMcqAnswers, setLessonMcqAnswers] = useState({});
  const [lessonFillAnswers, setLessonFillAnswers] = useState({});
  const [lessonWritingText, setLessonWritingText] = useState("");
  const [lessonAiContent, setLessonAiContent] = useState(null);

  // Single-question-at-a-time state variables
  const [lessonMcqIndex, setLessonMcqIndex] = useState(0);
  const [lessonMcqFeedback, setLessonMcqFeedback] = useState(null);
  const [lessonFillIndex, setLessonFillIndex] = useState(0);
  const [lessonFillFeedback, setLessonFillFeedback] = useState(null);
  const [lessonReadingStep, setLessonReadingStep] = useState(1); // 1 = Task 1 (passage+question), 2 = Task 2 (writing)
  const [lessonReadingFeedback, setLessonReadingFeedback] = useState(null);
  const [lessonReadingAnswer, setLessonReadingAnswer] = useState("");
  const [lessonMeaningFeedback, setLessonMeaningFeedback] = useState(null);
  const [lessonMeaningAnswer, setLessonMeaningAnswer] = useState(null);
  const [lessonTranslationFeedback, setLessonTranslationFeedback] = useState(null);
  const [lessonTranslationSelected, setLessonTranslationSelected] = useState([]);
  const lessonTranslationShuffleRef = useRef({ key: null, tiles: [] });
  const lessonUnscrambleShuffleRef = useRef({});
  const lessonListeningShuffleRef = useRef({ key: null, tiles: [] });
  const [lessonListeningFeedback, setLessonListeningFeedback] = useState(null);
  const [lessonListeningSelected, setLessonListeningSelected] = useState([]);
  const [lessonListenWordMCQAnswer, setLessonListenWordMCQAnswer] = useState(null);
  const [lessonListenWordMCQFeedback, setLessonListenWordMCQFeedback] = useState(null);
  const [lessonMatchFeedback, setLessonMatchFeedback] = useState(null);
  const [lessonMatchCompleted, setLessonMatchCompleted] = useState([]);
  const [lessonMatchSelectedLeft, setLessonMatchSelectedLeft] = useState(null);
  const [lessonMatchSelectedRight, setLessonMatchSelectedRight] = useState(null);
  const [lessonSpeakFeedback, setLessonSpeakFeedback] = useState(null);
  const [lessonSpeakError, setLessonSpeakError] = useState("");
  const [lessonSpeakIsListening, setLessonSpeakIsListening] = useState(false);
  const [lessonSpeakTranscript, setLessonSpeakTranscript] = useState("");

  // Lesson accuracy and time tracking
  const lessonTotalAnsweredRef = useRef(0);
  const lessonCorrectAnsweredRef = useRef(0);
  const lessonStartTimeRef = useRef(null);
  const [lessonTimeTaken, setLessonTimeTaken] = useState(0);
  const triggerHaptic = (type) => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      if (type === "correct") {
        navigator.vibrate([60, 40, 60]);
      } else if (type === "incorrect") {
        navigator.vibrate([120, 80, 120]);
      } else if (type === "complete" || type === "success") {
        navigator.vibrate([80, 50, 80, 50, 120]);
      } else if (type === "buy" || type === "cash") {
        navigator.vibrate([40, 40, 60]);
      } else if (type === "click" || type === "pop") {
        navigator.vibrate([30]);
      } else if (type === "tab") {
        navigator.vibrate([20]);
      }
    }
  };

  const playChime = (type) => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      if (type === "correct") {
        const now = ctx.currentTime;
        const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        freqs.forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(f, now + idx * 0.08);
          gain.gain.setValueAtTime(0.12, now + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.4);
        });
      } else if (type === "complete" || type === "success") {
        const now = ctx.currentTime;
        const freqs = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C4, E4, G4, C5, E5, G5, C6
        freqs.forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(f, now + idx * 0.1);
          gain.gain.setValueAtTime(0.15, now + idx * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.1 + 0.5);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.1);
          osc.stop(now + idx * 0.1 + 0.6);
        });
      } else if (type === "buy" || type === "cash") {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.setValueAtTime(1760, now + 0.08);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === "click" || type === "pop") {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(900, now + 0.06);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === "tab") {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.setValueAtTime(300, now + 0.04);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.06);
      } else {
        const now = ctx.currentTime;
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc1.type = "sawtooth";
        osc1.frequency.setValueAtTime(180, now);
        osc1.frequency.linearRampToValueAtTime(110, now + 0.35);
        osc2.type = "triangle";
        osc2.frequency.setValueAtTime(182, now);
        osc2.frequency.linearRampToValueAtTime(112, now + 0.35);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.45);
        osc2.stop(now + 0.45);
      }
    } catch (e) {
      console.warn("Chime playback failed:", e);
    }
  };

  const recordLessonAnswer = (isCorrect) => {
    lessonTotalAnsweredRef.current += 1;
    if (isCorrect) {
      lessonCorrectAnsweredRef.current += 1;
      playChime("correct");
      triggerHaptic("correct");
      
      // Calculate dynamic XP (5 XP per question for practice, max 10 XP)
      const isExam = lessonSession?.lessonId?.endsWith("l5") || lessonSession?.lessonNum === 5;
      const isWordsPractice = lessonSession?.title === "Words Practice" || lessonSession?.practiceType === "Words Practice";
      const isStoriesPractice = lessonSession?.title === "Stories Practice" || lessonSession?.practiceType === "Stories Practice" || lessonSession?.practiceType === "Stories";
      
      let currentEarnedXp = 0;
      if (isExam) {
        const totalQuestions = lessonAiContent?.questions?.length || 10;
        currentEarnedXp = Math.round(lessonCorrectAnsweredRef.current * (60 / totalQuestions));
      } else if (isWordsPractice || isStoriesPractice) {
        currentEarnedXp = Math.min(10, lessonCorrectAnsweredRef.current * 5);
      } else {
        const totalQuestions = lessonAiContent?.questions?.length || 10;
        currentEarnedXp = Math.round(lessonCorrectAnsweredRef.current * (30 / totalQuestions));
      }
      setLessonXpEarned(currentEarnedXp);

      if (lessonSession?.title === "Mistakes Practice") {
        const currentQuestion = lessonAiContent?.questions?.[lessonStep];
        if (currentQuestion && currentQuestion.originalMistakeId) {
          removeUserMistake(currentQuestion.originalMistakeId);
        }
      }
    } else {
      playChime("incorrect");
      triggerHaptic("incorrect");
      setLessonHearts(prev => prev - 1);
    }
  };
  const [lessonAccuracy, setLessonAccuracy] = useState(null);
  const [lessonXpEarned, setLessonXpEarned] = useState(0);
  const [lessonHearts, setLessonHearts] = useState(3);

  // New lesson activities: Unscramble, Image choice, Tracing
  const [lessonUnscrambleIndex, setLessonUnscrambleIndex] = useState(0);
  const [lessonUnscrambleSelected, setLessonUnscrambleSelected] = useState([]);
  const [lessonUnscrambleFeedback, setLessonUnscrambleFeedback] = useState(null);
  const [lessonImageChoiceIndex, setLessonImageChoiceIndex] = useState(0);
  const [lessonImageChoiceSel, setLessonImageChoiceSel] = useState(null);
  const [lessonImageChoiceFeedback, setLessonImageChoiceFeedback] = useState(null);
  const [lessonTracingIndex, setLessonTracingIndex] = useState(0);
  const [lessonTracingDone, setLessonTracingDone] = useState(false);
  const [lessonTracingFeedback, setLessonTracingFeedback] = useState(null);
  const [lessonTracingAccuracy, setLessonTracingAccuracy] = useState(null);
  const tracingCanvasRef = useRef(null);

  // Redraw the tracing guide whenever the tracing step or item changes
  useEffect(() => {
    if (lessonStep === 12 && tracingCanvasRef.current && lessonAiContent?.tracing?.length) {
      const item = lessonAiContent.tracing[lessonTracingIndex] || lessonAiContent.tracing[0];
      drawTracingGuide(tracingCanvasRef.current, item);
      setLessonTracingDone(false);
    } else if (lessonSession?.isPractice && lessonAiContent?.questions?.[lessonStep]?.type === "tracing" && tracingCanvasRef.current) {
      const item = lessonAiContent.questions[lessonStep];
      setTimeout(() => {
        if (tracingCanvasRef.current) {
          drawTracingGuide(tracingCanvasRef.current, item);
        }
      }, 50);
      setLessonTracingDone(false);
    }
  }, [lessonStep, lessonTracingIndex, lessonAiContent, lessonSession]);

  // Auto-play TTS for speak question type when step changes
  useEffect(() => {
    if (
      lessonSession?.status === "active" &&
      lessonAiContent?.questions?.[lessonStep]?.type === "speak"
    ) {
      const sentence = lessonAiContent.questions[lessonStep].sentence || "";
      if (sentence) {
        // Small delay so UI renders first
        const timer = setTimeout(() => speakText(sentence, 1.0), 400);
        return () => clearTimeout(timer);
      }
    }
  }, [lessonStep, lessonSession, lessonAiContent]);

  // Play the first line of dialogue automatically when Stories Practice starts
  useEffect(() => {
    if (lessonSession && (lessonSession.practiceType === "Stories Practice" || lessonSession.practiceType === "Stories") && storyLineIndex === 0 && lessonAiContent?.dialogue?.[0]) {
      const firstLine = lessonAiContent.dialogue[0];
      if (firstLine?.audioText) {
        speakText(firstLine.audioText, 1.0);
      }
    }
  }, [lessonSession, storyLineIndex, lessonAiContent]);


  const renderPracticeSession = (ai) => {
    const currentQuestion = ai.questions?.[lessonStep] || {};
    const practiceType = lessonSession?.practiceType || "";
    const isChecked =
      practiceType.includes("Speak") || practiceType.includes("Pronunciation")
        ? (currentQuestion.type === "listeningTask" ? lessonListeningFeedback !== null : lessonSpeakFeedback !== null)
        : practiceType.includes("Listen")
          ? lessonListeningFeedback !== null
          : currentQuestion.type === "mcq" || currentQuestion.type === "meaning" || currentQuestion.type === "passage" || currentQuestion.type === "listenPassageMCQ" || currentQuestion.type === "chatComplete" || currentQuestion.type === "scenario"
            ? lessonMeaningFeedback !== null || lessonMcqFeedback !== null
            : currentQuestion.type === "listenWordMCQ"
              ? lessonListenWordMCQFeedback !== null
              : currentQuestion.type === "unscramble"
              ? lessonUnscrambleFeedback !== null
              : currentQuestion.type === "tracing"
                ? lessonTracingDone
                : currentQuestion.type === "writingActivity"
                  ? lessonWritingText.trim().length > 0
                  : currentQuestion.type === "matchingPairs"
                    ? lessonMatchCompleted.length === (currentQuestion.pairs || []).length
                    : currentQuestion.type === "imageChoice"
                      ? lessonImageChoiceFeedback !== null
                      : (currentQuestion.type === "translationTask" || currentQuestion.type === "translateToLearning")
                        ? lessonTranslationFeedback !== null
                        : currentQuestion.type === "listeningTask"
                          ? lessonListeningFeedback !== null
                          : lessonFillFeedback !== null;

    const handleNext = () => {
      // Clear current step state
      setLessonSpeakFeedback(null);
      setLessonSpeakTranscript("");
      setLessonSpeakIsListening(false);
      setLessonSpeakError("");
      setLessonListeningFeedback(null);
      setLessonListeningSelected([]);
      setLessonListenWordMCQAnswer(null);
      setLessonListenWordMCQFeedback(null);
      setLessonMeaningFeedback(null);
      setLessonMeaningAnswer(null);
      setLessonMcqFeedback(null);
      setLessonFillFeedback(null);
      setLessonFillAnswers({});
      setLessonUnscrambleFeedback(null);
      setLessonUnscrambleSelected([]);
      setLessonTracingDone(false);
      setLessonTracingFeedback(null);
      setLessonTracingAccuracy(null);
      setLessonWritingText("");
      setLessonMatchCompleted([]);
      setLessonMatchSelectedLeft(null);
      setLessonMatchSelectedRight(null);
      setLessonMatchFeedback(null);
      setLessonImageChoiceSel(null);
      setLessonImageChoiceFeedback(null);
      setLessonTranslationFeedback(null);
      setLessonTranslationSelected([]);
      advanceLessonStep();
    };

    // OVERRIDE: Words Practice (Flashcards)
    if (practiceType === "Words Practice") {
      const card = currentQuestion;
      const tapToReveal = selectedLanguage === "Hindi" ? "अनुवाद देखने के लिए टैप करें" :
                          selectedLanguage === "Kannada" ? "ಅನುವಾದ ತಿಳಿಯಲು ಒತ್ತಿ" :
                          selectedLanguage === "Telugu" ? "అర్థాన్ని తెలుసుకోవడానికి నొక్కండి" :
                          selectedLanguage === "Tamil" ? "பொருளை அறிய தட்டவும்" : "TAP TO REVEAL MEANING";

      const tapToFlipBack = selectedLanguage === "Hindi" ? "वापस पलटने के लिए टैप करें" :
                            selectedLanguage === "Kannada" ? "ಹಿಂದಕ್ಕೆ ತಿರುಗಿಸಲು ಒತ್ತಿ" :
                            selectedLanguage === "Telugu" ? "ವೆనక్కి తిప్పడానికి నొక్కండి" :
                            selectedLanguage === "Tamil" ? "பின்னால் திருப்ப தட்டவும்" : "TAP TO FLIP BACK";

      const curLearningLang = learningLanguage || "English";
      const curInterfaceLang = selectedLanguage || "English";

      let frontWord = card.word || card.phrase || card.text || "";
      let backWord = card.translation || card.meaning || card.answer || "";

      // Check if this word can be translated via WORD_TRANSLATIONS dictionary
      let rowKey = null;
      const transRow = Object.entries(WORD_TRANSLATIONS).find(([key, row]) => {
        const match = Object.values(row).some(val => typeof val === "string" && val.toLowerCase() === frontWord.toLowerCase()) ||
                      Object.values(row).some(val => typeof val === "string" && val.toLowerCase() === backWord.toLowerCase());
        if (match) {
          rowKey = key;
          return true;
        }
        return false;
      })?.[1];

      if (transRow) {
        frontWord = transRow[curLearningLang] || frontWord;
        backWord = transRow[curInterfaceLang] || backWord;
      }

      // Separate example sentence into learning and interface languages
      let sentenceLearning = card.sentence || "";
      let sentenceInterface = "";
      
      if (rowKey && SENTENCE_TRANSLATIONS[rowKey]) {
        sentenceLearning = SENTENCE_TRANSLATIONS[rowKey][curLearningLang] || sentenceLearning;
        sentenceInterface = SENTENCE_TRANSLATIONS[rowKey][curInterfaceLang] || sentenceInterface;
      } else if (card.sentence && card.sentence.includes("(")) {
        const parts = card.sentence.split("(");
        sentenceLearning = parts[0].trim();
        sentenceInterface = parts[1].replace(")", "").trim();
      }

      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', paddingBottom: '140px' }}>
          <div className="ai-lesson-step-header" style={{ marginBottom: '10px', textAlign: 'center', width: '100%' }}>
            <span className="ai-step-badge">🔤 Flashcards - Tap to Flip</span>
          </div>

          <div
            className={`flashcard-perspective ${flashcardFlipped ? "flipped" : ""}`}
            onClick={() => setFlashcardFlipped(!flashcardFlipped)}
          >
            <div className="flashcard-inner">
              {/* Side A: Raw Word & Audio Play Button */}
              <div className="flashcard-side flashcard-front">
                <h2 style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--accent)', margin: 0 }}>{frontWord}</h2>
                <button
                  type="button"
                  className="flashcard-audio-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    speakText(frontWord, 1.0);
                  }}
                  title="Play Sound"
                >
                  🔊
                </button>
                <p style={{ marginTop: '30px', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>{tapToReveal}</p>
              </div>

              {/* Side B: Cartoon illustration (emoji), Example sentence, Translation */}
              <div className="flashcard-side flashcard-back">
                {sentenceLearning && (
                  <button
                    type="button"
                    style={{
                      position: 'absolute',
                      top: '16px',
                      left: '16px',
                      background: 'var(--accent-soft)',
                      color: 'var(--accent-dark)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '44px',
                      height: '44px',
                      fontSize: '1.2rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      zIndex: 10,
                      boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      speakText(sentenceLearning, 1.0);
                    }}
                    title="Speak Example Sentence"
                  >
                    🔊
                  </button>
                )}
                <div className="flashcard-illustration">{card.emoji || "💡"}</div>
                <h2 style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--accent)', margin: '0 0 16px' }}>
                  {backWord}
                </h2>
                {sentenceLearning && (
                  <div className="flashcard-example-box" style={{ width: '90%', textAlign: 'center' }}>
                    <p style={{ margin: 0, fontWeight: 600, color: 'var(--text)' }}>"{sentenceLearning}"</p>
                    {sentenceInterface && (
                      <p style={{ margin: '6px 0 0', fontWeight: 500, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        ({sentenceInterface})
                      </p>
                    )}
                  </div>
                )}
                <p style={{ marginTop: '20px', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>{tapToFlipBack}</p>
              </div>
            </div>
          </div>

          {/* Bottom Action Sheet: green "GOT IT" button */}
          <div style={{
            position: 'absolute',
            bottom: 0, left: 0, right: 0,
            background: 'var(--panel)',
            borderTop: '2px solid var(--line)',
            padding: '24px 40px',
            zIndex: 100,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <button
              type="button"
              className="primary-btn"
              style={{
                background: flashcardFlipped ? '#10b981' : '#e5e7eb',
                borderColor: flashcardFlipped ? '#10b981' : '#d1d5db',
                color: flashcardFlipped ? 'white' : '#9ca3af',
                cursor: flashcardFlipped ? 'pointer' : 'not-allowed',
                padding: '14px 60px',
                borderRadius: '16px',
                fontSize: '1.2rem',
                fontWeight: '800',
                width: '100%',
                maxWidth: '320px',
                opacity: flashcardFlipped ? 1 : 0.8,
                transition: 'all 0.2s ease'
              }}
              disabled={!flashcardFlipped}
              onClick={() => {
                if (!flashcardFlipped) return;
                recordLessonAnswer(true);
                setFlashcardFlipped(false);
                setTimeout(() => {
                  handleNext();
                }, 350);
              }}
            >
              GOT IT
            </button>
          </div>
        </div>
      );
    }

    // OVERRIDE: Stories Practice (Interactive Split Screen Reading)
    if (practiceType === "Stories Practice" || practiceType === "Stories") {
      const dialogue = ai.dialogue || [];
      const activeLine = dialogue[storyLineIndex];
      const isQuestion = activeLine?.type === "question";

      const finishStoryText = selectedLanguage === "Hindi" ? "कहानी समाप्त करें" :
                              selectedLanguage === "Kannada" ? "ಕಥೆ ಮುಗಿಸಿ" :
                              selectedLanguage === "Telugu" ? "కథను ముగించండి" :
                              selectedLanguage === "Tamil" ? "கதையை முடிக்கவும்" : "FINISH STORY";

      const tapToContinueText = selectedLanguage === "Hindi" ? "जारी रखने के लिए टैप करें →" :
                                selectedLanguage === "Kannada" ? "ಮುಂದುವರೆಯಲು ಒತ್ತಿ →" :
                                selectedLanguage === "Telugu" ? "కొనసాగించడానికి నొక్కండి →" :
                                selectedLanguage === "Tamil" ? "தொடர தட்டவும் →" : "Tap to Continue →";

      const chooseCorrectOptionText = selectedLanguage === "Hindi" ? "जारी रखने के लिए सही विकल्प चुनें!" :
                                      selectedLanguage === "Kannada" ? "ಮುಂದುವರೆಯಲು ಸರಿಯಾದ ಆಯ್ಕೆಯನ್ನು ಆರಿಸಿ!" :
                                      selectedLanguage === "Telugu" ? "కొనసాగించడానికి సరైన ఎంపికను ఎంచుకోండి!" :
                                      selectedLanguage === "Tamil" ? "தொடர சரியான விருப்பத்தை தேர்வு செய்யவும்!" : "Choose the correct option to continue!";

      const handleStoryContinue = () => {
        if (isQuestion || storyQuestionIdx !== null) return;
        
        if (storyLineIndex < dialogue.length - 1) {
          const nextIndex = storyLineIndex + 1;
          setStoryLineIndex(nextIndex);
          
          const nextLine = dialogue[nextIndex];
          if (nextLine?.audioText) {
            speakText(nextLine.audioText, 1.0);
          }

          if (nextLine?.type === "question") {
            setStoryQuestionIdx(nextIndex);
            setStoryQuestionAnswered(false);
            setStoryQuestionFeedback(null);
          }
          setTimeout(() => {
            const chatLog = document.getElementById("stories-chat-log");
            if (chatLog) chatLog.scrollTop = chatLog.scrollHeight;
          }, 100);
        } else {
          // Finished story session! Calculate elapsed time, accuracy, and XP
          const elapsedSeconds = lessonStartTimeRef.current ? Math.round((Date.now() - lessonStartTimeRef.current) / 1000) : 45;
          setLessonTimeTaken(elapsedSeconds);

          const totalAnswered = lessonTotalAnsweredRef.current;
          const correctAnswered = lessonCorrectAnsweredRef.current;
          const accuracy = totalAnswered > 0 ? Math.round((correctAnswered / totalAnswered) * 100) : 100;
          setLessonAccuracy(accuracy);

          const finalXp = correctAnswered > 0 ? Math.min(10, Math.max(5, correctAnswered * 5)) : 10;
          setLessonXpEarned(finalXp);
          completeLesson(lessonSession?.lessonId, finalXp);
          setLessonSession(prev => prev ? { ...prev, status: "completed" } : null);
        }
      };

      const handlePredictorAnswer = (optionIdx) => {
        if (storyQuestionAnswered) return;

        const q = dialogue[storyQuestionIdx];
        if (!q) return;
        const correct = optionIdx === q.correctIndex;

        setStoryQuestionAnswered(true);
        setStoryQuestionFeedback({
          selected: optionIdx,
          isCorrect: correct
        });

        if (correct) {
          recordDailyCorrect();
          recordLessonAnswer(true);

          const qIdx = storyQuestionIdx;
          setTimeout(() => {
            setStoryQuestionIdx(null);
            setStoryQuestionAnswered(false);
            setStoryQuestionFeedback(null);

            const nextIdx = (qIdx !== null && qIdx !== undefined) ? qIdx + 1 : storyLineIndex + 1;
            setStoryLineIndex(nextIdx);
            
            const nextLine = dialogue[nextIdx];
            if (nextLine?.audioText) {
              speakText(nextLine.audioText, 1.0);
            }

            setTimeout(() => {
              const chatLog = document.getElementById("stories-chat-log");
              if (chatLog) chatLog.scrollTop = chatLog.scrollHeight;
            }, 100);
          }, 450);
        } else {
          recordLessonAnswer(false);
          setTimeout(() => {
            setStoryQuestionAnswered(false);
          }, 800);
        }
      };

      const visibleBubbles = dialogue.slice(0, storyLineIndex + 1).filter(d => d.type !== "question");

      return (
        <div style={{ paddingBottom: '20px' }}>
          <div className="stories-split-container">
            {/* Top Half: Illustrated Scene with Two Characters */}
            <div className="stories-top-scene">
              <div className={`stories-character-node ${(activeLine?.speaker === "Ana" || activeLine?.speaker === "अना" || activeLine?.speaker === "ಅನಾ" || activeLine?.speaker === "అనా" || activeLine?.speaker === "அனா") ? "speaking" : ""}`}>
                <div className="stories-character-avatar">👩‍🦰</div>
                <div className="stories-character-name">Ana</div>
              </div>

              <div style={{ fontSize: '2.5rem', opacity: 0.8 }}>🌲🏡🌲</div>

              <div className={`stories-character-node ${(activeLine?.speaker === "Ravi" || activeLine?.speaker === "रवि" || activeLine?.speaker === "ರವಿ" || activeLine?.speaker === "రవి" || activeLine?.speaker === "ரவி") ? "speaking" : ""}`}>
                <div className="stories-character-avatar">🧑</div>
                <div className="stories-character-name">Ravi</div>
              </div>
            </div>

            {/* Bottom Half: Conversation Chat bubbles */}
            <div className="stories-bottom-chat">
              <div 
                id="stories-chat-log" 
                className={`stories-chat-log ${storyQuestionIdx !== null && !storyQuestionAnswered ? "story-blur-overlay" : ""}`}
              >
                {visibleBubbles.map((bubble, idx) => {
                  const isLeft = bubble.speaker === "Ana" || 
                                 bubble.speaker === "अना" || 
                                 bubble.speaker === "ಅನಾ" || 
                                 bubble.speaker === "అనా" || 
                                 bubble.speaker === "அனா";
                  const isRevealed = !!revealedStoryBubbles[idx];
                  const translationText = bubble.translation || getDialogueTranslation(bubble.text, selectedLanguage || "English");

                  const revealLabel = selectedLanguage === "Hindi" ? "अनुवाद देखें" :
                                      selectedLanguage === "Kannada" ? "ಅನುವಾದ ನೋಡಿ" :
                                      selectedLanguage === "Telugu" ? "అనువాదం చూడండి" :
                                      selectedLanguage === "Tamil" ? "மொழிபெயர்ப்பு காண்க" : "Reveal Translation";

                  return (
                    <div 
                      key={idx} 
                      className={`story-chat-bubble ${isLeft ? "left" : "right"}`}
                      style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                      onClick={() => {
                        setRevealedStoryBubbles(prev => ({ ...prev, [idx]: !prev[idx] }));
                      }}
                      title="Tap to reveal translation"
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span className="story-bubble-speaker">{bubble.speaker}</span>
                        <span 
                          style={{ 
                            fontSize: '0.75rem', 
                            color: isLeft ? '#0284c7' : '#059669', 
                            fontWeight: 700, 
                            opacity: 0.9,
                            background: 'rgba(255,255,255,0.7)',
                            padding: '2px 8px',
                            borderRadius: '10px'
                          }}
                        >
                          🌐 {isRevealed ? "Hide" : revealLabel}
                        </span>
                      </div>
                      <span style={{ display: 'block', fontSize: '1.05rem', lineHeight: '1.4' }}>{bubble.text}</span>
                      
                      {isRevealed && translationText && (
                        <div style={{ 
                          marginTop: '8px', 
                          paddingTop: '6px', 
                          borderTop: '1px dashed rgba(0,0,0,0.15)', 
                          color: '#4b5563', 
                          fontSize: '0.95rem',
                          fontWeight: 600
                        }}>
                          💬 {translationText}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* MCQ Predictor overlay when paused */}
              {storyQuestionIdx !== null && (
                <div className="story-predictor-box">
                  <div className="story-predictor-title">
                    {getStoryQuestionInInterfaceLang(dialogue[storyQuestionIdx].question, selectedLanguage || "English")}
                  </div>
                  <div className="story-predictor-options">
                    {dialogue[storyQuestionIdx].options.map((opt, oIdx) => {
                      const cleanOpt = String(opt).replace(/\s*\([^)]*\)/g, "").trim();
                      const feedback = storyQuestionFeedback;
                      const isSelected = feedback?.selected === oIdx;
                      const wasWrong = isSelected && !feedback?.isCorrect;
                      const isCorrect = oIdx === dialogue[storyQuestionIdx].correctIndex;
                      const showSuccess = feedback?.isCorrect && isCorrect;
                      const btnClass = showSuccess 
                        ? "story-predictor-opt-btn correct" 
                        : wasWrong 
                          ? "story-predictor-opt-btn wrong" 
                          : "story-predictor-opt-btn";
                      return (
                        <button
                          key={oIdx}
                          type="button"
                          className={btnClass}
                          disabled={storyQuestionAnswered && feedback?.isCorrect}
                          onClick={() => handlePredictorAnswer(oIdx)}
                        >
                          {cleanOpt} {showSuccess && " ✅"} {wasWrong && " ❌"}
                        </button>
                      );
                    })}
                  </div>
                  {storyQuestionFeedback && !storyQuestionFeedback.isCorrect && (
                    <p style={{ color: '#ef4444', fontWeight: 'bold', marginTop: '12px' }}>{chooseCorrectOptionText}</p>
                  )}
                </div>
              )}

              {/* Action Footer */}
              <div className="stories-action-footer">
                <button
                  type="button"
                  className="story-continue-btn"
                  disabled={storyQuestionIdx !== null}
                  onClick={handleStoryContinue}
                >
                  {storyLineIndex === dialogue.length - 1 ? finishStoryText : tapToContinueText}
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (lessonHearts <= 0) {
      return (
        <div className="ai-lesson-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <div className="lesson-complete-wrapper" style={{ textAlign: 'center', padding: '40px 20px', maxWidth: '400px' }}>
            <img src="/as1.png" alt="Sad LISA Mascot" style={{ width: '120px', height: '120px', filter: 'grayscale(100%)', marginBottom: '20px' }} />
            <h2 style={{ fontSize: '2rem', fontWeight: '900', color: '#ef4444', margin: '10px 0' }}>Out of Hearts!</h2>
            <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)', margin: '10px 0 30px', fontWeight: 600 }}>
              You made 3 mistakes in this lesson. Let's restart and try again!
            </p>
            <button
              type="button"
              className="duo-check-btn"
              style={{ background: '#ef4444', borderBottomColor: '#b91c1c' }}
              onClick={() => {
                setLessonStep(0);
                setLessonHearts(3);
                lessonTotalAnsweredRef.current = 0;
                lessonCorrectAnsweredRef.current = 0;
                setLessonMcqAnswers({});
                setLessonFillAnswers({});
                setLessonTranslationSelected([]);
                setLessonListeningSelected([]);
                setLessonMeaningAnswer(null);
                setLessonMeaningFeedback(null);
                setLessonTranslationFeedback(null);
                setLessonListeningFeedback(null);
                setLessonFillFeedback(null);
                setLessonMcqFeedback(null);
                setLessonListenWordMCQAnswer(null);
                setLessonListenWordMCQFeedback(null);
                setLessonMatchCompleted([]);
                setLessonMatchSelectedLeft(null);
                setLessonMatchSelectedRight(null);
              }}
            >
              Restart Lesson
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="ai-lesson-content">
        <div className="ai-lesson-step" style={{ paddingBottom: '140px' }}>
          <div className="ai-lesson-step-header" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="ai-step-badge">
              {lessonSession?.isPracticeSession ? (
                <>⚡ {t("practiceMode")}: {(() => {
                  const keyMap = {
                    "Perfect Pronunciation": "practicePerfectPronunciation",
                    "Conversation": "practiceConversation",
                    "Speak": "practiceSpeak",
                    "Speak Practice": "practiceSpeak",
                    "Listen": "practiceListen",
                    "Read": "practiceRead",
                    "Read Practice": "practiceRead",
                    "Write": "practiceWrite",
                    "Mistakes Practice": "practiceMistakes",
                    "Words Practice": "practiceWords",
                    "Stories Practice": "practiceStories"
                  };
                  const key = keyMap[practiceType];
                  return key ? t(key) : practiceType;
                })()}</>
              ) : (
                <>📖 {ai.lessonSubtitle || `${lessonSession?.sectionTitle || ""} › ${lessonSession?.unitTitle || ""}`}</>
              )}
              {" "}({`Step ${lessonStep + 1} of ${ai.questions?.length || 8}`})
            </span>
            <span style={{ 
              display: 'flex', 
              gap: '6px', 
              fontSize: '1.4rem', 
              alignItems: 'center',
              background: 'rgba(239, 68, 68, 0.08)',
              padding: '4px 10px',
              borderRadius: '20px',
              border: '1px solid rgba(239, 68, 68, 0.15)',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)',
              marginLeft: 'auto'
            }}>
              {Array.from({ length: 3 }).map((_, idx) => {
                const hasHeart = idx < lessonHearts;
                return (
                  <span 
                    key={idx} 
                    style={{ 
                      filter: hasHeart ? 'none' : 'grayscale(100%) opacity(0.3)',
                      transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                      transform: hasHeart ? 'scale(1)' : 'scale(0.85)',
                      display: 'inline-block'
                    }}
                  >
                    ❤️
                  </span>
                );
              })}
            </span>
          </div>

          {/* Stories Practice: Story section */}
          {practiceType === "Stories Practice" && ai.story && (
            <div style={{
              background: 'rgba(2, 132, 199, 0.05)',
              border: '2px solid rgba(2, 132, 199, 0.2)',
              borderRadius: '20px',
              padding: '20px',
              marginBottom: '24px',
              maxHeight: '200px',
              overflowY: 'auto'
            }}>
              <h4 style={{ margin: '0 0 8px', color: '#0284c7', fontWeight: 800 }}>📖 Reread Story:</h4>
              <p style={{ margin: 0, fontSize: '1.15rem', lineHeight: '1.6', fontWeight: '500' }}>{ai.story}</p>
            </div>
          )}

          {/* Render content based on question type */}
          {(() => {
            // ── INTRO (Step 0 for all lessons) ──────────────────────────────
            if (currentQuestion.type === "intro") {
              return (
                <div className="ai-lesson-step" style={{ paddingBottom: '20px' }}>
                  {/* Lesson title */}
                  <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '900', margin: '0 0 6px', color: 'var(--accent)' }}>
                      {currentQuestion.lessonTitle || lessonSession?.title}
                    </h2>
                    {currentQuestion.subtitle && (
                      <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', margin: 0, fontWeight: '700' }}>
                        {currentQuestion.subtitle}
                      </p>
                    )}
                  </div>

                  {/* Mascot + speech bubble */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', margin: '20px 0' }}>
                    <div style={{ flexShrink: 0 }}>
                      <img src="/as1.png" alt="LISA Mascot" style={{ width: '110px', height: '110px', objectFit: 'contain' }} />
                    </div>
                    <div className="duo-speech-bubble" style={{ flexGrow: 1 }}>
                      <div style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
                        {(currentQuestion.explanation || "").split("\n").map((para, i) =>
                          para.trim() ? <p key={i} style={{ margin: '0 0 10px 0' }}>{para}</p> : null
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Guided tip */}
                  {currentQuestion.guidedTip && (
                    <div style={{ background: 'rgba(245,158,11,0.08)', border: '2px dashed #f59e0b', borderRadius: '14px', padding: '14px 18px', margin: '16px 0', display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <span style={{ fontSize: '1.4rem' }}>💡</span>
                      <span style={{ color: '#b45309', fontWeight: 700, fontSize: '0.95rem' }}>{currentQuestion.guidedTip}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px' }}>
                    <button type="button" className="duo-check-btn" onClick={handleNext}>
                      Start Lesson →
                    </button>
                  </div>
                </div>
              );
            }

            // New Custom Question Types for Practice Page
            if (currentQuestion.type === "listeningTask") {
              const lt = currentQuestion.listeningTask || currentQuestion || { audioText: "Hello", tiles: ["Hello", "Bye", "Welcome"] };
              const isChecked = lessonListeningFeedback !== null;

              const tilesKey = (lt.tiles || []).join("|");
              if (lessonListeningShuffleRef.current.key !== tilesKey) {
                const arr = [...(lt.tiles || [])];
                for (let i = arr.length - 1; i > 0; i--) {
                  const j = Math.floor(Math.random() * (i + 1));
                  [arr[i], arr[j]] = [arr[j], arr[i]];
                }
                lessonListeningShuffleRef.current = { key: tilesKey, tiles: arr };
              }
              const displayTiles = lessonListeningShuffleRef.current.tiles;

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '120px' }}>
                  <div style={{ marginBottom: '16px', textAlign: 'center' }}>
                    <span className="ai-step-badge">🎧 Choose the words you hear</span>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '20px',
                    margin: '30px 0'
                  }}>
                    <button
                      type="button"
                      onClick={() => speakText(lt.audioText || lt.sentence || "", 1.0)}
                      className="duo-listen-btn-main"
                    >
                      🔊
                    </button>

                    <button
                      type="button"
                      onClick={() => speakText(lt.audioText || lt.sentence || "", 0.45)}
                      className="duo-listen-btn-slow"
                      title="Listen slowly"
                    >
                      🐢
                    </button>
                  </div>

                  <div style={{
                    borderBottom: '2px solid var(--line)',
                    minHeight: '80px',
                    margin: '30px 0 20px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '10px',
                    padding: '10px 0',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {lessonListeningSelected.map((word, wIdx) => (
                      <button
                        key={wIdx}
                        type="button"
                        className="duo-word-tile"
                        onClick={() => {
                          speakText(word);
                          if (!isChecked) {
                            setLessonListeningSelected(prev => prev.filter((_, idx) => idx !== wIdx));
                          }
                        }}
                        disabled={isChecked}
                      >
                        {word}
                      </button>
                    ))}
                    {lessonListeningSelected.length === 0 && (
                      <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Tap words below to arrange...</span>
                    )}
                  </div>

                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '10px',
                    justifyContent: 'center',
                    margin: '20px 0 30px'
                  }}>
                    {displayTiles.map((word, wIdx) => {
                      const isUsed = lessonListeningSelected.includes(word);
                      return (
                        <button
                          key={wIdx}
                          type="button"
                          className={`duo-word-tile ${isUsed ? 'used' : ''}`}
                          onClick={() => {
                            speakText(word);
                            if (!isChecked && !isUsed) {
                              setLessonListeningSelected(prev => [...prev, word]);
                            }
                          }}
                          disabled={isChecked || isUsed}
                        >
                          {word}
                        </button>
                      );
                    })}
                  </div>

                  {!isChecked && (
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <button
                        type="button"
                        className="primary-btn"
                        style={{ padding: '12px 40px', borderRadius: '12px' }}
                        onClick={() => {
                          const userSentence = lessonListeningSelected.join(" ").trim().toLowerCase();
                          const clean = (s) => s.replace(/[.,\/#!$%\^&\*;:{}=\-_\u0060()?]/g, "").toLowerCase().trim();
                          const correct = clean(userSentence) === clean(lt.audioText || lt.sentence || "");

                          setLessonListeningFeedback({
                            isCorrect: correct,
                            correctAnswer: lt.audioText || lt.sentence || ""
                          });
                          if (correct) recordDailyCorrect();
                          recordLessonAnswer(correct);
                        }}
                        disabled={lessonListeningSelected.length === 0}
                      >
                        Check Answer
                      </button>
                    </div>
                  )}

                  {isChecked && (
                    <div style={{
                      position: 'absolute',
                      bottom: 0, left: 0, right: 0,
                      background: lessonListeningFeedback.isCorrect ? '#d1fae5' : '#fee2e2',
                      borderTop: `2px solid ${lessonListeningFeedback.isCorrect ? '#10b981' : '#ef4444'}`,
                      padding: '20px 40px',
                      zIndex: 100,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <h4 style={{ margin: 0, color: lessonListeningFeedback.isCorrect ? '#065f46' : '#991b1b', fontWeight: '800', fontSize: '1.2rem' }}>
                          {lessonListeningFeedback.isCorrect ? "Excellent!" : "Incorrect"}
                        </h4>
                        <p style={{ margin: '4px 0 0', color: lessonListeningFeedback.isCorrect ? '#047857' : '#b91c1c', fontSize: '0.95rem' }}>
                          {lessonListeningFeedback.isCorrect ? "You heard it correctly!" : `Correct Answer: "${lessonListeningFeedback.correctAnswer}"`}
                        </p>
                      </div>
                      <button type="button" className="primary-btn" onClick={handleNext}>
                        Continue
                      </button>
                    </div>
                  )}
                </div>
              );
            }

            if (currentQuestion.type === "passage") {
              const questionText = currentQuestion.question || "Read the passage and choose the correct answer:";
              const options = currentQuestion.options || [];
              const selectedAnswer = lessonMeaningAnswer;
              const isChecked = lessonMeaningFeedback !== null;

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{
                    background: 'rgba(2, 132, 199, 0.05)',
                    border: '2px solid rgba(2, 132, 199, 0.2)',
                    borderRadius: '24px',
                    padding: '24px',
                    marginBottom: '10px'
                  }}>
                    <h4 style={{ margin: '0 0 10px', color: '#0284c7', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      📖 Reading Passage
                      <button type="button" className="duo-listen-btn" onClick={() => speakText(currentQuestion.passage)} style={{ padding: '6px 14px', borderRadius: '12px', fontSize: '0.9rem' }}>🔊 Listen</button>
                    </h4>
                    <p style={{ margin: 0, fontSize: '1.2rem', lineHeight: '1.6', fontWeight: '500', color: 'var(--text)' }}>{currentQuestion.passage}</p>
                  </div>

                  <div style={{
                    background: 'var(--panel)',
                    border: '2px solid var(--line)',
                    borderRadius: '24px',
                    padding: '24px',
                    fontSize: '1.3rem',
                    fontWeight: '800',
                    textAlign: 'center',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.01)'
                  }}>
                    {questionText}
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '16px',
                    margin: '25px 0'
                  }}>
                    {options.map((opt, oIdx) => {
                      const isSelected = selectedAnswer === oIdx;
                      let extraClass = "";

                      if (isChecked) {
                        if (oIdx === currentQuestion.correctIndex) {
                          extraClass = "correct";
                        } else if (isSelected) {
                          extraClass = "incorrect";
                        }
                      } else if (isSelected) {
                        extraClass = "selected";
                      }

                      return (
                        <button
                          key={opt + '_' + oIdx}
                          type="button"
                          onClick={() => { speakText(opt); if (!isChecked) setLessonMeaningAnswer(oIdx); }}
                          className={`duo-option-btn ${extraClass}`}
                          disabled={isChecked}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {!isChecked && (
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <button
                        type="button"
                        className="duo-check-btn"
                        disabled={selectedAnswer === null}
                        onClick={() => {
                          const correct = selectedAnswer === currentQuestion.correctIndex;
                          setLessonMeaningFeedback({
                            isCorrect: correct,
                            correctAnswer: options[currentQuestion.correctIndex]
                          });
                          if (correct) recordDailyCorrect();
                          recordLessonAnswer(correct);
                        }}
                      >
                        Check Answer
                      </button>
                    </div>
                  )}

                  {isChecked && (
                    <div className={lessonMeaningFeedback.isCorrect ? "duo-banner-correct" : "duo-banner-incorrect"}>
                      <div>
                        <h4 className={lessonMeaningFeedback.isCorrect ? "duo-banner-title-correct" : "duo-banner-title-incorrect"}>
                          {lessonMeaningFeedback.isCorrect ? "🎉 Excellent!" : "😢 Incorrect"}
                        </h4>
                        <p style={{ margin: '4px 0 0', fontSize: '1rem', fontWeight: '600' }}>
                          {lessonMeaningFeedback.isCorrect ? "You got it right!" : `Correct Answer: "${options[currentQuestion.correctIndex]}"`}
                        </p>
                      </div>
                      <button type="button" className="duo-check-btn" onClick={handleNext}>Continue</button>
                    </div>
                  )}
                </div>
              );
            }

            if (currentQuestion.type === "matchingPairs") {
              const pairs = currentQuestion.pairs || [];
              const leftItems = pairs.map(p => p.left);
              const rightItems = [...pairs].map(p => p.right).sort();
              const isStepFinished = lessonMatchCompleted.length === pairs.length;

              const handleLeftClick = (item) => {
                if (lessonMatchCompleted.includes(item)) return;
                setLessonMatchSelectedLeft(item);
                if (lessonMatchSelectedRight) {
                  const pair = pairs.find(p => p.left === item && p.right === lessonMatchSelectedRight);
                  if (pair) {
                    setLessonMatchCompleted(prev => [...prev, item]);
                    recordDailyCorrect();
                    recordLessonAnswer(true);
                  } else {
                    setLessonMatchFeedback("Incorrect pair!");
                    setTimeout(() => setLessonMatchFeedback(null), 1000);
                  }
                  setLessonMatchSelectedLeft(null);
                  setLessonMatchSelectedRight(null);
                }
              };

              const handleRightClick = (item) => {
                const pair = pairs.find(p => p.right === item);
                if (pair && lessonMatchCompleted.includes(pair.left)) return;

                setLessonMatchSelectedRight(item);
                if (lessonMatchSelectedLeft) {
                  const pObj = pairs.find(p => p.left === lessonMatchSelectedLeft && p.right === item);
                  if (pObj) {
                    setLessonMatchCompleted(prev => [...prev, lessonMatchSelectedLeft]);
                    recordDailyCorrect();
                  } else {
                    setLessonMatchFeedback("Incorrect pair!");
                    setTimeout(() => setLessonMatchFeedback(null), 1000);
                  }
                  setLessonMatchSelectedLeft(null);
                  setLessonMatchSelectedRight(null);
                }
              };

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '120px' }}>
                  <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                    <p style={{ fontSize: '1.2rem', fontWeight: '700', margin: 0 }}>
                      {selectedLanguage === "Hindi" ? "मिलान करें" : 
                       selectedLanguage === "Kannada" ? "ಹೊಂದಿಸಿ ಬರೆಯಿರಿ" : 
                       selectedLanguage === "Telugu" ? "జతపరచండి" : 
                       selectedLanguage === "Tamil" ? "பொருத்துக" : 
                       "Match the following"}
                    </p>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '24px',
                    margin: '30px 0'
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {leftItems.map((item, idx) => {
                        const isCompleted = lessonMatchCompleted.includes(item);
                        const isSelected = lessonMatchSelectedLeft === item;

                        return (
                          <button
                            key={'left_' + idx}
                            type="button"
                            onClick={() => { speakText(item); handleLeftClick(item); }}
                            className={`duo-option-btn ${isSelected ? 'selected' : ''} ${isCompleted ? 'correct' : ''}`}
                            style={{ width: '100%' }}
                            disabled={isCompleted}
                          >
                            <span>{item}</span>
                            {isCompleted && <span>✅</span>}
                          </button>
                        );
                      })}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {rightItems.map((item, idx) => {
                        const matchedPair = pairs.find(p => p.right === item);
                        const isCompleted = matchedPair && lessonMatchCompleted.includes(matchedPair.left);
                        const isSelected = lessonMatchSelectedRight === item;

                        return (
                          <button
                            key={'right_' + idx}
                            type="button"
                            onClick={() => { speakText(item); handleRightClick(item); }}
                            className={`duo-option-btn ${isSelected ? 'selected' : ''} ${isCompleted ? 'correct' : ''}`}
                            style={{ width: '100%' }}
                            disabled={isCompleted}
                          >
                            <span>{item}</span>
                            {isCompleted && <span>✅</span>}
                          </button>
                        );
                      })}
                  </div>
                  </div>

                  {lessonMatchFeedback && (
                    <div style={{ color: '#ef4444', textAlign: 'center', fontWeight: 'bold' }}>{lessonMatchFeedback}</div>
                  )}

                  {isStepFinished && (
                    <div className="duo-banner-correct">
                      <div>
                        <h4 className="duo-banner-title-correct">🎉 Excellent Match!</h4>
                        <p style={{ margin: '4px 0 0', fontSize: '1rem', fontWeight: '600' }}>You matched all pairs correctly.</p>
                      </div>
                      <button type="button" className="duo-check-btn" onClick={handleNext}>Continue</button>
                    </div>
                  )}
                </div>
              );
            }

            if (currentQuestion.type === "imageChoice") {
              const options = currentQuestion.options || [];
              const word = currentQuestion.word || "";
              const prompt = currentQuestion.prompt || `Choose the correct picture for "${word}"`;
              const isChecked = lessonImageChoiceFeedback !== null;

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '120px' }}>
                  <div style={{ marginBottom: '16px', textAlign: 'center' }}>
                    <span className="ai-step-badge">🖼️ Choose the correct picture</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', margin: '20px 0' }}>
                    <img src="/as1.png" alt="LISA Mascot" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
                    <div style={{
                      flexGrow: 1,
                      background: 'var(--panel)',
                      border: '2px solid var(--line)',
                      borderRadius: '20px',
                      padding: '16px 24px',
                      position: 'relative'
                    }}>
                      <div style={{
                        position: 'absolute',
                        left: '-9px',
                        top: '32px',
                        width: '14px',
                        height: '14px',
                        background: 'var(--panel)',
                        borderLeft: '2px solid var(--line)',
                        borderBottom: '2px solid var(--line)',
                        transform: 'rotate(45deg)'
                      }}></div>
                      <p style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>{prompt}</p>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '24px',
                    margin: '30px 0'
                  }}>
                    {options.map((option, oIdx) => {
                      const selected = lessonImageChoiceSel === oIdx;
                      let extraClass = "";

                      if (isChecked) {
                        if (oIdx === currentQuestion.correctIndex) {
                          extraClass = "correct";
                        } else if (selected) {
                          extraClass = "incorrect";
                        }
                      } else if (selected) {
                        extraClass = "selected";
                      }

                      return (
                        <button
                          key={'img_' + oIdx}
                          type="button"
                          onClick={() => { if (!isChecked) setLessonImageChoiceSel(oIdx); }}
                          disabled={isChecked}
                          className={`duo-image-option-btn ${extraClass}`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                  {!isChecked && (
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <button
                        type="button"
                        className="duo-check-btn"
                        onClick={() => {
                          const correct = lessonImageChoiceSel === currentQuestion.correctIndex;
                          setLessonImageChoiceFeedback({ isCorrect: correct });
                          if (correct) recordDailyCorrect();
                          recordLessonAnswer(correct);
                        }}
                        disabled={lessonImageChoiceSel === null}
                      >
                        Check Answer
                      </button>
                    </div>
                  )}

                  {isChecked && (
                    <div className={lessonImageChoiceFeedback.isCorrect ? "duo-banner-correct" : "duo-banner-incorrect"}>
                      <div>
                        <h4 className={lessonImageChoiceFeedback.isCorrect ? "duo-banner-title-correct" : "duo-banner-title-incorrect"}>
                          {lessonImageChoiceFeedback.isCorrect ? "🎉 Excellent!" : "😢 Incorrect"}
                        </h4>
                        <p style={{ margin: '4px 0 0', fontSize: '1rem', fontWeight: '600' }}>
                          {lessonImageChoiceFeedback.isCorrect ? "You picked the right picture!" : `Correct Answer: "${options[currentQuestion.correctIndex]}"`}
                        </p>
                      </div>
                      <button type="button" className="duo-check-btn" onClick={handleNext}>Continue</button>
                    </div>
                  )}
                </div>
              );
            }

            // translateToLearning - English -> target language
            if (currentQuestion.type === "translateToLearning") {
              const tt = currentQuestion;
              const isChecked = lessonTranslationFeedback !== null;

              const tilesKey = (tt.tiles || []).join("|");
              if (lessonTranslationShuffleRef.current.key !== tilesKey) {
                const arr = [...(tt.tiles || [])];
                for (let i = arr.length - 1; i > 0; i--) {
                  const j = Math.floor(Math.random() * (i + 1));
                  [arr[i], arr[j]] = [arr[j], arr[i]];
                }
                lessonTranslationShuffleRef.current = { key: tilesKey, tiles: arr };
              }
              const shuffledTiles = lessonTranslationShuffleRef.current.tiles;

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '120px' }}>
                  <div style={{ marginBottom: '16px', textAlign: 'center' }}>
                    <span className="ai-step-badge">🧩 Translation Exercise</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', margin: '20px 0' }}>
                    <img src="/as1.png" alt="LISA Mascot" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
                    <div className="duo-speech-bubble" style={{ flexGrow: 1 }}>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 4px', fontWeight: '800' }}>
                        Write this in {learningLanguage}:
                      </p>
                      <p style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>
                        "{tt.englishSentence}"
                      </p>
                    </div>
                  </div>

                  <div style={{
                    borderBottom: '2px solid var(--line)',
                    minHeight: '80px',
                    margin: '30px 0 20px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '10px',
                    padding: '10px 0',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {lessonTranslationSelected.map((word, wIdx) => (
                      <button
                        key={'sel_' + wIdx}
                        type="button"
                        className="duo-word-tile"
                        disabled={isChecked}
                        onClick={() => {
                          speakText(word);
                          setLessonTranslationSelected(prev => prev.filter((_, idx) => idx !== wIdx));
                        }}
                      >
                        {word}
                      </button>
                    ))}
                    {lessonTranslationSelected.length === 0 && (
                      <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        Tap words below to translate...
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', margin: '10px 0 30px' }}>
                    {shuffledTiles.map((word, wIdx) => {
                      const countSelected = lessonTranslationSelected.filter(w => w === word).length;
                      const countTotal = shuffledTiles.filter(w => w === word).length;
                      const isUsed = countSelected >= countTotal;
                      return (
                        <button
                          key={'tile_' + wIdx}
                          type="button"
                          className={`duo-word-tile ${isUsed ? 'used' : ''}`}
                          disabled={isChecked || isUsed}
                          onClick={() => {
                            speakText(word);
                            setLessonTranslationSelected(prev => [...prev, word]);
                          }}
                        >
                          {word}
                        </button>
                      );
                    })}
                  </div>

                  {!isChecked && (
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <button
                        type="button"
                        className="duo-check-btn"
                        disabled={lessonTranslationSelected.length === 0}
                        onClick={() => {
                          const clean = s => s.replace(/[.,\/#!$%\^&\*;:{}=\-_`()?]/g, "").toLowerCase().trim();
                          const correct = clean(lessonTranslationSelected.join(" ")) === clean(tt.targetSentence);
                          if (!correct) {
                            recordUserMistake({
                              type: "translateToLearning",
                              englishSentence: tt.englishSentence,
                              targetSentence: tt.targetSentence,
                              tiles: tt.tiles
                            });
                          }
                          setLessonTranslationFeedback({
                            isCorrect: correct,
                            correctSentence: tt.targetSentence
                          });
                          if (correct) recordDailyCorrect();
                          recordLessonAnswer(correct);
                        }}
                      >
                        Check Answer
                      </button>
                    </div>
                  )}

                  {isChecked && (
                    <div className={lessonTranslationFeedback.isCorrect ? "duo-banner-correct" : "duo-banner-incorrect"}>
                      <div>
                        <h4 className={lessonTranslationFeedback.isCorrect ? "duo-banner-title-correct" : "duo-banner-title-incorrect"}>
                          {lessonTranslationFeedback.isCorrect ? "🎉 Excellent!" : "😢 Incorrect"}
                        </h4>
                        {!lessonTranslationFeedback.isCorrect && (
                          <p style={{ margin: '4px 0 0', fontSize: '1rem', fontWeight: '600' }}>
                            Correct Answer: "{lessonTranslationFeedback.correctSentence}"
                          </p>
                        )}
                      </div>
                      <button type="button" className="duo-check-btn" onClick={handleNext}>Continue</button>
                    </div>
                  )}
                </div>
              );
            }

            if ((currentQuestion.type === "translationTask" || currentQuestion.type === "translateToLearning")) {
              const tt = currentQuestion;
              const isChecked = lessonTranslationFeedback !== null;

              const tilesKey = (tt.tiles || []).join("|");
              if (lessonTranslationShuffleRef.current.key !== tilesKey) {
                const arr = [...(tt.tiles || [])];
                for (let i = arr.length - 1; i > 0; i--) {
                  const j = Math.floor(Math.random() * (i + 1));
                  [arr[i], arr[j]] = [arr[j], arr[i]];
                }
                lessonTranslationShuffleRef.current = { key: tilesKey, tiles: arr };
              }
              const shuffledTiles = lessonTranslationShuffleRef.current.tiles;

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '120px' }}>
                  <div style={{ background: 'rgba(2,132,199,0.05)', border: '2px solid rgba(2,132,199,0.2)', borderRadius: '16px', padding: '16px 20px', fontSize: '1.1rem', fontWeight: '700', textAlign: 'center' }}>
                    {tt.prompt}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', margin: '10px 0' }}>
                    <img src="/as1.png" alt="LISA Mascot" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
                    <div className="duo-speech-bubble" style={{ flexGrow: 1 }}>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 4px', fontWeight: '800' }}>
                        Translate this to {learningLanguage}:
                      </p>
                      <p style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>
                        "{tt.englishTranslation || tt.sentence}"
                      </p>
                    </div>
                  </div>

                  <div style={{
                    borderBottom: '2px solid var(--line)',
                    minHeight: '80px',
                    margin: '30px 0 20px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '10px',
                    padding: '10px 0',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {lessonTranslationSelected.map((word, wIdx) => (
                      <button
                        key={'sel_' + wIdx}
                        type="button"
                        className="duo-word-tile"
                        disabled={isChecked}
                        onClick={() => {
                          speakText(word);
                          setLessonTranslationSelected(prev => prev.filter((_, idx) => idx !== wIdx));
                        }}
                      >
                        {word}
                      </button>
                    ))}
                    {lessonTranslationSelected.length === 0 && (
                      <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Tap words below to arrange...</span>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', margin: '10px 0 30px' }}>
                    {shuffledTiles.map((word, wIdx) => {
                      const countSelected = lessonTranslationSelected.filter(w => w === word).length;
                      const countTotal = shuffledTiles.filter(w => w === word).length;
                      const isUsed = countSelected >= countTotal;
                      return (
                        <button
                          key={'tile_' + wIdx}
                          type="button"
                          className={`duo-word-tile ${isUsed ? 'used' : ''}`}
                          disabled={isChecked || isUsed}
                          onClick={() => {
                            speakText(word);
                            setLessonTranslationSelected(prev => [...prev, word]);
                          }}
                        >
                          {word}
                        </button>
                      );
                    })}
                  </div>

                  {!isChecked && (
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <button
                        type="button"
                        className="duo-check-btn"
                        disabled={lessonTranslationSelected.length === 0}
                        onClick={() => {
                          const userSentence = lessonTranslationSelected.join(" ").trim().toLowerCase();
                          const clean = (s) => s.replace(/[.,\/#!$%\^&\*;:{}=\-_`()?]/g, "").toLowerCase().trim();
                          const correct = clean(userSentence) === clean(tt.targetSentence || tt.sentence || "");
                          if (!correct) {
                            recordUserMistake({
                              type: "translationTask",
                              prompt: tt.prompt,
                              englishSentence: tt.englishSentence || tt.englishTranslation,
                              targetSentence: tt.targetSentence || tt.sentence,
                              tiles: tt.tiles
                            });
                          }
                          setLessonTranslationFeedback({
                            isCorrect: correct,
                            correctSentence: tt.targetSentence || tt.sentence
                          });
                          if (correct) recordDailyCorrect();
                          recordLessonAnswer(correct);
                        }}
                      >
                        Check Answer
                      </button>
                    </div>
                  )}

                  {isChecked && (
                    <div className={lessonTranslationFeedback.isCorrect ? "duo-banner-correct" : "duo-banner-incorrect"}>
                      <div>
                        <h4 className={lessonTranslationFeedback.isCorrect ? "duo-banner-title-correct" : "duo-banner-title-incorrect"}>
                          {lessonTranslationFeedback.isCorrect ? "🎉 Excellent!" : "😢 Incorrect"}
                        </h4>
                        {!lessonTranslationFeedback.isCorrect && (
                          <p style={{ margin: '4px 0 0', fontSize: '1rem', fontWeight: '600' }}>
                            Correct Answer: "{lessonTranslationFeedback.correctSentence}"
                          </p>
                        )}
                      </div>
                      <button type="button" className="duo-check-btn" onClick={handleNext}>Continue</button>
                    </div>
                  )}
                </div>
              );
            }

            // 1. Speak/Pronunciation Practice
            if (practiceType.includes("Speak") || practiceType.includes("Pronunciation")) {
              const sentence = currentQuestion.sentence || "";
              const startSpeaking = () => {
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                if (!SpeechRecognition) {
                  setLessonSpeakError("Speech recognition is not supported in this browser. Please use Chrome/Edge.");
                  return;
                }
                try {
                  const rec = new SpeechRecognition();
                  rec.continuous = false;
                  rec.interimResults = false;
                  rec.lang = learningLanguage === "Kannada" ? "kn-IN" :
                    learningLanguage === "Hindi" ? "hi-IN" :
                      learningLanguage === "Telugu" ? "te-IN" :
                        learningLanguage === "Tamil" ? "ta-IN" : "en-US";
                  rec.onstart = () => {
                    setLessonSpeakIsListening(true);
                    setLessonSpeakTranscript("");
                    setLessonSpeakError("");
                  };
                  rec.onerror = (e) => {
                    setLessonSpeakError("Mic error, please check connection.");
                    setLessonSpeakIsListening(false);
                  };
                  rec.onend = () => { setLessonSpeakIsListening(false); };
                  rec.onresult = (event) => {
                    const transcript = event.results[0][0].transcript;
                    setLessonSpeakTranscript(transcript);
                    const clean = (w) => w.replace(/[.,\/#!$%\^&\*;:{}=\-_\u0060()?]/g, "").toLowerCase().trim();
                    const targetWords = sentence.split(/\s+/).filter(Boolean).map(clean);
                    const spokenWords = transcript.split(/\s+/).filter(Boolean).map(clean);
                    let matched = 0;
                    targetWords.forEach(w => { if (spokenWords.includes(w)) matched++; });
                    const percent = targetWords.length > 0 ? (matched / targetWords.length) * 100 : 100;
                    const isCorrect = percent >= 50;
                    if (!isCorrect) {
                      recordUserMistake({
                        type: "speak",
                        sentence: sentence,
                        englishTranslation: currentQuestion.englishTranslation || "Pronunciation practice"
                      });
                    }
                    setLessonSpeakFeedback({
                      isCorrect,
                      matchedCount: matched,
                      totalWords: targetWords.length,
                      percent: Math.round(percent)
                    });
                  };
                  rec.start();
                } catch (err) {
                  setLessonSpeakError("Could not start speech recognition.");
                  setLessonSpeakIsListening(false);
                }
              };

              return (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                  <div style={{
                    background: 'var(--panel)',
                    border: '2px solid var(--line)',
                    borderRadius: '24px',
                    padding: '30px',
                    width: '100%',
                    textAlign: 'center',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.02)'
                  }}>
                    <p style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text)', margin: '0 0 10px' }}>{sentence}</p>
                    <p style={{ fontSize: '1.1rem', color: 'var(--muted)', margin: 0 }}>{currentQuestion.englishTranslation}</p>
                    <button
                      type="button"
                      onClick={() => speakText(sentence)}
                      disabled={lessonSpeakIsListening || isChecked}
                      style={{
                        marginTop: '16px',
                        background: '#38bdf8',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '10px 22px',
                        fontSize: '1rem',
                        fontWeight: '800',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <span>🔊 LISTEN</span>
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginTop: '20px' }}>
                    <button
                      type="button"
                      onClick={startSpeaking}
                      disabled={lessonSpeakIsListening || isChecked}
                      style={{
                        width: '90px',
                        height: '90px',
                        borderRadius: '50%',
                        background: lessonSpeakIsListening ? '#ef4444' : 'var(--accent)',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 8px 20px rgba(2, 132, 199, 0.3)',
                        transition: 'all 0.2s ease',
                        animation: lessonSpeakIsListening ? 'pulse 1.5s infinite' : 'none'
                      }}
                    >
                      <span style={{ fontSize: '2.5rem' }}>{lessonSpeakIsListening ? "🎙️" : "🎤"}</span>
                    </button>
                    <span style={{ fontWeight: 800, color: lessonSpeakIsListening ? '#ef4444' : 'var(--muted)', fontSize: '0.95rem' }}>
                      {lessonSpeakIsListening ? "🛑 RECORDING... SPEAK NOW" : "CLICK TO RECORD"}
                    </span>
                    {lessonSpeakTranscript && (
                      <p style={{ fontSize: '1.1rem', marginTop: '10px' }}>
                        <strong>You said:</strong> <span style={{ color: 'var(--accent)' }}>"{lessonSpeakTranscript}"</span>
                      </p>
                    )}
                    {lessonSpeakError && <p style={{ color: '#ef4444', fontWeight: '700' }}>{lessonSpeakError}</p>}
                  </div>

                  {lessonSpeakFeedback && (
                    <div style={{
                      position: 'absolute',
                      bottom: 0, left: 0, right: 0,
                      background: lessonSpeakFeedback.isCorrect ? '#d1fae5' : '#fee2e2',
                      borderTop: `2px solid ${lessonSpeakFeedback.isCorrect ? '#10b981' : '#ef4444'}`,
                      padding: '20px 40px',
                      zIndex: 100,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <h4 style={{ margin: 0, color: lessonSpeakFeedback.isCorrect ? '#065f46' : '#991b1b', fontWeight: '800', fontSize: '1.2rem' }}>
                          {lessonSpeakFeedback.isCorrect ? "Awesome Pronunciation!" : "Need Practice!"}
                        </h4>
                        <p style={{ margin: '4px 0 0', color: lessonSpeakFeedback.isCorrect ? '#047857' : '#b91c1c', fontSize: '0.95rem' }}>
                          Accuracy: {lessonSpeakFeedback.percent}% ({lessonSpeakFeedback.matchedCount} of {lessonSpeakFeedback.totalWords} words matched)
                        </p>
                      </div>
                      <button type="button" className="primary-btn" onClick={handleNext}>
                        Continue
                      </button>
                    </div>
                  )}
                </div>
              );
            }

            // 2. Listen Practice
            if (practiceType.includes("Listen")) {
              const audioText = currentQuestion.audioText || "";
              const rawTiles = currentQuestion.tiles || [];
              const isChecked = lessonListeningFeedback !== null;

              const tilesKey = rawTiles.join("|");
              if (lessonListeningShuffleRef.current.key !== tilesKey) {
                const arr = [...rawTiles];
                for (let i = arr.length - 1; i > 0; i--) {
                  const j = Math.floor(Math.random() * (i + 1));
                  [arr[i], arr[j]] = [arr[j], arr[i]];
                }
                lessonListeningShuffleRef.current = { key: tilesKey, tiles: arr };
              }
              const tiles = lessonListeningShuffleRef.current.tiles;

              return (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                  <h3 style={{ margin: '0 0 10px', textAlign: 'center' }}>Listen to the sentence and reconstruct it:</h3>

                  <div style={{ display: 'flex', gap: '16px', margin: '10px 0 20px' }}>
                    <button
                      type="button"
                      onClick={() => speakText(audioText, 1.0)}
                      style={{
                        width: '70px',
                        height: '70px',
                        borderRadius: '20px',
                        background: 'var(--accent)',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                      }}
                    >
                      <span style={{ fontSize: '2.5rem' }}>🔊</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => speakText(audioText, 0.2)}
                      style={{
                        width: '70px',
                        height: '70px',
                        borderRadius: '20px',
                        background: '#0284c7',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                      }}
                      title="Listen slowly"
                    >
                      <span style={{ fontSize: '1.8rem' }}>🐢</span>
                    </button>
                  </div>

                  {/* Selected Words Area */}
                  <div style={{
                    width: '100%',
                    borderBottom: '2px solid var(--line)',
                    minHeight: '80px',
                    margin: '20px 0',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '10px',
                    padding: '10px 0',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    {lessonListeningSelected.map((word, wIdx) => (
                      <button
                        key={wIdx}
                        type="button"
                        style={{
                          background: 'var(--accent)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '10px',
                          padding: '10px 16px',
                          fontSize: '1.1rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                        onClick={() => {
                          if (!isChecked) {
                            setLessonListeningSelected(prev => prev.filter((_, idx) => idx !== wIdx));
                          }
                        }}
                        disabled={isChecked}
                      >
                        {word}
                      </button>
                    ))}
                  </div>

                  {/* Available Tiles */}
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '10px',
                    justifyContent: 'center',
                    margin: '20px 0 30px'
                  }}>
                    {tiles.map((word, wIdx) => {
                      const isUsed = lessonListeningSelected.includes(word);
                      return (
                        <button
                          key={wIdx}
                          type="button"
                          style={{
                            background: isUsed ? 'var(--line)' : 'var(--panel)',
                            color: isUsed ? 'transparent' : 'var(--text)',
                            border: '2px solid var(--line)',
                            borderRadius: '10px',
                            padding: '10px 16px',
                            fontSize: '1.1rem',
                            fontWeight: '700',
                            cursor: isUsed ? 'default' : 'pointer',
                            boxShadow: isUsed ? 'none' : '0 2px 4px rgba(0,0,0,0.05)',
                            opacity: isUsed ? 0.3 : 1
                          }}
                          onClick={() => {
                            if (!isChecked && !isUsed) {
                              setLessonListeningSelected(prev => [...prev, word]);
                            }
                          }}
                          disabled={isChecked || isUsed}
                        >
                          {word}
                        </button>
                      );
                    })}
                  </div>

                  {!isChecked && (
                    <button
                      type="button"
                      className="primary-btn"
                      style={{ padding: '12px 40px', borderRadius: '12px' }}
                      onClick={() => {
                        const userSentence = lessonListeningSelected.join(" ").trim().toLowerCase();
                        const clean = (s) => s.replace(/[.,\/#!$%\^&\*;:{}=\-_\u0060()?]/g, "").toLowerCase().trim();
                        const correct = clean(userSentence) === clean(audioText);
                        if (!correct) {
                          recordUserMistake({
                            type: "listening",
                            audioText: audioText,
                            tiles: tiles
                          });
                        }
                        setLessonListeningFeedback({
                          isCorrect: correct,
                          correctAnswer: audioText
                        });
                        if (correct) recordDailyCorrect();
                        recordLessonAnswer(correct);
                      }}
                      disabled={lessonListeningSelected.length === 0}
                    >
                      Check Answer
                    </button>
                  )}

                  {isChecked && (
                    <div style={{
                      position: 'absolute',
                      bottom: 0, left: 0, right: 0,
                      background: lessonListeningFeedback.isCorrect ? '#d1fae5' : '#fee2e2',
                      borderTop: `2px solid ${lessonListeningFeedback.isCorrect ? '#10b981' : '#ef4444'}`,
                      padding: '20px 40px',
                      zIndex: 100,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <h4 style={{ margin: 0, color: lessonListeningFeedback.isCorrect ? '#065f46' : '#991b1b', fontWeight: '800', fontSize: '1.2rem' }}>
                          {lessonListeningFeedback.isCorrect ? "Excellent!" : "Incorrect"}
                        </h4>
                        <p style={{ margin: '4px 0 0', color: lessonListeningFeedback.isCorrect ? '#047857' : '#b91c1c', fontSize: '0.95rem' }}>
                          {lessonListeningFeedback.isCorrect ? "You heard it correctly!" : `Correct Translation: "${lessonListeningFeedback.correctAnswer}"`}
                        </p>
                      </div>
                      <button type="button" className="primary-btn" onClick={handleNext}>
                        Continue
                      </button>
                    </div>
                  )}
                </div>
              );
            }

            // 3. Mistakes, Words & Stories Practice Questions
            if (currentQuestion.type === "mcq" || currentQuestion.type === "meaning" || practiceType === "Stories Practice") {
              const rawQ = currentQuestion.question || `Select the correct meaning of "${currentQuestion.phrase}"`;
              const questionText = practiceType === "Stories Practice"
                ? getStoryQuestionInInterfaceLang(rawQ, selectedLanguage || "English")
                : rawQ.replace(/^[❓\s]+/, "");
              const options = currentQuestion.options || [];
              const selectedAnswer = lessonMeaningAnswer;
              const isChecked = lessonMeaningFeedback !== null;

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{
                    background: 'var(--panel)',
                    border: '2px solid var(--line)',
                    borderRadius: '24px',
                    padding: '24px',
                    fontSize: '1.35rem',
                    fontWeight: '800',
                    textAlign: 'center',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.01)'
                  }}>
                    {questionText}
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '16px',
                    margin: '25px 0'
                  }}>
                    {options.map((opt, oIdx) => {
                      const isSelected = selectedAnswer === oIdx;
                      let extraClass = "";

                      if (isChecked) {
                        if (oIdx === currentQuestion.correctIndex) {
                          extraClass = "correct";
                        } else if (isSelected) {
                          extraClass = "incorrect";
                        }
                      } else if (isSelected) {
                        extraClass = "selected";
                      }

                      return (
                        <button
                          key={oIdx}
                          type="button"
                          onClick={() => { speakText(opt); if (!isChecked) setLessonMeaningAnswer(oIdx); }}
                          className={`duo-option-btn ${extraClass}`}
                          disabled={isChecked}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {!isChecked && (
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <button
                        type="button"
                        className="duo-check-btn"
                        disabled={selectedAnswer === null}
                        onClick={() => {
                          const correct = selectedAnswer === currentQuestion.correctIndex;
                          if (!correct) {
                            recordUserMistake({
                              type: currentQuestion.type || "mcq",
                              question: questionText,
                              options: options,
                              correctIndex: currentQuestion.correctIndex,
                              explanation: currentQuestion.explanation || ""
                            });
                          }
                          setLessonMeaningFeedback({
                            isCorrect: correct,
                            correctAnswer: options[currentQuestion.correctIndex]
                          });
                          if (correct) recordDailyCorrect();
                          recordLessonAnswer(correct);
                        }}
                      >
                        Check Answer
                      </button>
                    </div>
                  )}

                  {isChecked && (
                    <div className={lessonMeaningFeedback.isCorrect ? "duo-banner-correct" : "duo-banner-incorrect"}>
                      <div>
                        <h4 className={lessonMeaningFeedback.isCorrect ? "duo-banner-title-correct" : "duo-banner-title-incorrect"}>
                          {lessonMeaningFeedback.isCorrect ? "🎉 Excellent!" : "😢 Incorrect"}
                        </h4>
                        <p style={{ margin: '4px 0 0', fontSize: '1rem', fontWeight: '600' }}>
                          {currentQuestion.explanation || `Correct Answer: "${options[currentQuestion.correctIndex]}"`}
                        </p>
                      </div>
                      <button type="button" className="duo-check-btn" onClick={handleNext}>Continue</button>
                    </div>
                  )}
                </div>
              );
            }

            // Fill Blank or Spelling Practice
            if (currentQuestion.type === "fillBlank" || currentQuestion.type === "spelling") {
              const sentence = currentQuestion.sentence || "";
              const answer = currentQuestion.answer || "";
              const hint = currentQuestion.hint || "";
              const userAnswer = lessonFillAnswers[lessonStep] || "";
              const isChecked = lessonFillFeedback !== null;

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                    <p style={{ fontSize: '1.2rem', fontWeight: '700', margin: 0 }}>
                      {selectedLanguage === "Hindi" ? "रिक्त स्थान भरें" : 
                       selectedLanguage === "Kannada" ? "ಖಾಲಿ ಜಾಗವನ್ನು ತುಂಬಿ" : 
                       selectedLanguage === "Telugu" ? "ఖాళీలను పూరించండి" : 
                       selectedLanguage === "Tamil" ? "கோடிட்ட இடங்களை நிரப்புக" : 
                       "Fill in the Blanks"}
                    </p>
                  </div>
                  <div style={{
                    background: 'var(--panel)',
                    border: '2px solid var(--line)',
                    borderRadius: '24px',
                    padding: '30px',
                    textAlign: 'center'
                  }}>
                    <p style={{ fontSize: '1.5rem', fontWeight: '800', margin: '0 0 10px' }}>{sentence}</p>
                    {hint && <p style={{ fontSize: '1rem', color: '#b45309', margin: 0 }}>💡 Hint: {hint}</p>}
                    
                    {/* Flashing Mistakes Clue/Hint Button */}
                    {lessonSession?.title === "Mistakes Practice" && mistakeAttemptsCount >= 1 && (
                      <div style={{ marginTop: '14px' }}>
                        <button
                          type="button"
                          className="mistake-hint-btn-flash"
                          onClick={() => setShowMistakeHint(!showMistakeHint)}
                          style={{ padding: '8px 18px', borderRadius: '20px', fontSize: '0.9rem' }}
                        >
                          💡 Hint
                        </button>
                        {showMistakeHint && (
                          <div style={{ marginTop: '10px', padding: '12px', background: 'var(--bg)', borderRadius: '12px', border: '1px dashed var(--accent)', color: 'var(--accent-dark)', fontWeight: 700, fontSize: '0.95rem' }}>
                            {currentQuestion.clue || `The answer starts with "${answer[0].toUpperCase()}" and has ${answer.length} letters.`}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {currentQuestion.options && Array.isArray(currentQuestion.options) ? (
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', margin: '20px 0' }}>
                      {currentQuestion.options.map((opt, oIdx) => {
                        const isSelected = userAnswer.toLowerCase() === opt.toLowerCase();
                        let extraClass = "";
                        if (isChecked) {
                          if (opt.toLowerCase() === answer.toLowerCase()) {
                            extraClass = "correct";
                          } else if (isSelected) {
                            extraClass = "incorrect";
                          }
                        } else if (isSelected) {
                          extraClass = "selected";
                        }
                        return (
                          <button
                            key={oIdx}
                            type="button"
                            className={`duo-word-tile ${extraClass}`}
                            onClick={() => {
                              speakText(opt);
                              if (!isChecked) setLessonFillAnswers(prev => ({ ...prev, [lessonStep]: opt }));
                            }}
                            disabled={isChecked}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
                      <input
                        type="text"
                        className="ai-fill-input"
                        placeholder="Type your answer here..."
                        style={{
                          maxWidth: '300px',
                          padding: '12px 20px',
                          borderRadius: '12px',
                          border: '2px solid var(--line)',
                          fontSize: '1.1rem',
                          textAlign: 'center',
                          background: 'var(--panel)'
                        }}
                        value={userAnswer}
                        onChange={(e) => setLessonFillAnswers(prev => ({ ...prev, [lessonStep]: e.target.value }))}
                        disabled={isChecked}
                      />
                    </div>
                  )}

                  {!isChecked && (
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <button
                        type="button"
                        className="primary-btn"
                        style={{ padding: '12px 40px', borderRadius: '12px' }}
                        disabled={!userAnswer.trim()}
                        onClick={() => {
                          const correct = userAnswer.trim().toLowerCase() === answer.toLowerCase();
                          if (!correct) {
                            setMistakeAttemptsCount(prev => prev + 1);
                            recordUserMistake({
                              type: currentQuestion.type || "fillBlank",
                              sentence: sentence,
                              answer: answer,
                              hint: hint
                            });
                          }
                          setLessonFillFeedback({
                            isCorrect: correct,
                            correctAnswer: answer
                          });
                          if (correct) recordDailyCorrect();
                          recordLessonAnswer(correct);
                        }}
                      >
                        Check Answer
                      </button>
                    </div>
                  )}

                  {isChecked && (
                    <div style={{
                      position: 'absolute',
                      bottom: 0, left: 0, right: 0,
                      background: lessonFillFeedback.isCorrect ? '#d1fae5' : '#fee2e2',
                      borderTop: `2px solid ${lessonFillFeedback.isCorrect ? '#10b981' : '#ef4444'}`,
                      padding: '20px 40px',
                      zIndex: 100,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <h4 style={{ margin: 0, color: lessonFillFeedback.isCorrect ? '#065f46' : '#991b1b', fontWeight: '800', fontSize: '1.2rem' }}>
                          {lessonFillFeedback.isCorrect ? "Excellent!" : "Incorrect"}
                        </h4>
                        <p style={{ margin: '4px 0 0', color: lessonFillFeedback.isCorrect ? '#047857' : '#b91c1c', fontSize: '0.95rem' }}>
                          {lessonFillFeedback.isCorrect ? "You got it right!" : `Correct Answer: "${lessonFillFeedback.correctAnswer}"`}
                        </p>
                      </div>
                      <button type="button" className="primary-btn" onClick={handleNext}>
                        Continue
                      </button>
                    </div>
                  )}
                </div>
              );
            }

            // 4. Writing Activity
            if (currentQuestion.type === "writingActivity") {
              const prompt = currentQuestion.prompt || "";
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', margin: '20px 0' }}>
                    <img src="/as1.png" alt="LISA Mascot" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
                    <div style={{ flexGrow: 1, background: 'var(--panel)', border: '2px solid var(--line)', borderRadius: '20px', padding: '16px 24px', position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '-9px', top: '32px', width: '14px', height: '14px', background: 'var(--panel)', borderLeft: '2px solid var(--line)', borderBottom: '2px solid var(--line)', transform: 'rotate(45deg)' }}></div>
                      <p style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0 }}>{prompt}</p>
                    </div>
                  </div>
                  <textarea
                    className="writing-textarea"
                    rows={6}
                    placeholder="Type your response here..."
                    value={lessonWritingText}
                    onChange={(e) => setLessonWritingText(e.target.value)}
                    style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '2px solid var(--line)', fontSize: '1rem', fontFamily: 'inherit', background: 'var(--panel)' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                    <button type="button" className="primary-btn" style={{ padding: '12px 40px', borderRadius: '12px' }}
                      onClick={handleNext}
                      disabled={!lessonWritingText.trim()}>Continue</button>
                  </div>
                </div>
              );
            }

            // 5. Unscramble
            if (currentQuestion.type === "unscramble") {
              const hint = currentQuestion.hint || "";
              const emoji = currentQuestion.emoji || "🔤";
              const answer = currentQuestion.answer || "";
              const rawTiles = currentQuestion.tiles || [];
              const isChecked = lessonUnscrambleFeedback !== null;

              const unscrambleKey = `${hint}|${answer}`;
              if (!lessonUnscrambleShuffleRef.current[unscrambleKey]) {
                let arr = [...rawTiles];
                let attempts = 0;
                while (attempts < 10) {
                  for (let i = arr.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [arr[i], arr[j]] = [arr[j], arr[i]];
                  }
                  const shuffledStr = arr.join("").toUpperCase();
                  const targetUpper = answer.toUpperCase();
                  if (shuffledStr !== targetUpper && !shuffledStr.includes(targetUpper)) {
                    break;
                  }
                  attempts++;
                }
                lessonUnscrambleShuffleRef.current[unscrambleKey] = arr;
              }
              const tiles = lessonUnscrambleShuffleRef.current[unscrambleKey];
              const currentBuiltWord = lessonUnscrambleSelected.map(idx => tiles[idx]).join("");

              const handleTileClick = (idx) => {
                if (isChecked) return;
                if (lessonUnscrambleSelected.includes(idx)) return;
                speakText(tiles[idx]);
                setLessonUnscrambleSelected(prev => [...prev, idx]);
              };

              const handleRemoveClick = (sIdx) => {
                if (isChecked) return;
                const targetIdx = lessonUnscrambleSelected[sIdx];
                if (targetIdx !== undefined) speakText(tiles[targetIdx]);
                setLessonUnscrambleSelected(prev => prev.filter((_, idx) => idx !== sIdx));
              };

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', margin: '20px 0' }}>
                    <img src="/as1.png" alt="LISA Mascot" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
                    <div style={{ flexGrow: 1, background: 'var(--panel)', border: '2px solid var(--line)', borderRadius: '20px', padding: '16px 24px', position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '-9px', top: '32px', width: '14px', height: '14px', background: 'var(--panel)', borderLeft: '2px solid var(--line)', borderBottom: '2px solid var(--line)', transform: 'rotate(45deg)' }}></div>
                      <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700' }}>{emoji} {hint}</p>
                      
                      {/* Flashing Mistakes Clue/Hint Button */}
                      {lessonSession?.title === "Mistakes Practice" && mistakeAttemptsCount >= 1 && (
                        <div style={{ marginTop: '10px' }}>
                          <button
                            type="button"
                            className="mistake-hint-btn-flash"
                            onClick={() => setShowMistakeHint(!showMistakeHint)}
                            style={{ padding: '6px 12px', borderRadius: '16px', fontSize: '0.85rem' }}
                          >
                            💡 Hint
                          </button>
                          {showMistakeHint && (
                            <div style={{ marginTop: '8px', padding: '8px', background: 'var(--bg)', borderRadius: '10px', border: '1px dashed var(--accent)', color: 'var(--accent-dark)', fontWeight: 600, fontSize: '0.9rem' }}>
                              {currentQuestion.clue || `Starts with "${answer[0].toUpperCase()}" and has ${answer.length} letters.`}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', margin: '24px 0', minHeight: '56px' }}>
                    {lessonUnscrambleSelected.length === 0 && (
                      <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Tap the letters below to build the word</span>
                    )}
                    {lessonUnscrambleSelected.map((idx, sIdx) => (
                      <button key={sIdx} type="button" onClick={() => handleRemoveClick(sIdx)} disabled={isChecked} style={{ background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 16px', fontSize: '1.3rem', fontWeight: '800', cursor: isChecked ? 'default' : 'pointer' }}>{tiles[idx]}</button>
                    ))}
                  </div>

                  {!isChecked && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', margin: '20px 0 30px' }}>
                      {tiles.map((tile, idx) => {
                        const isSelected = lessonUnscrambleSelected.includes(idx);
                        return (
                          <button key={idx} type="button" onClick={() => handleTileClick(idx)} disabled={isSelected} style={{ background: isSelected ? 'var(--line)' : 'var(--panel)', color: isSelected ? 'transparent' : 'var(--text)', border: '2px solid var(--line)', borderRadius: '10px', padding: '10px 16px', fontSize: '1.3rem', fontWeight: '800', cursor: isSelected ? 'default' : 'pointer' }}>{tile}</button>
                        );
                      })}
                    </div>
                  )}

                  {!isChecked && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                      <button type="button" className="primary-btn" style={{ padding: '12px 40px', borderRadius: '12px' }}
                        onClick={() => {
                          const correct = currentBuiltWord.trim().toUpperCase() === answer.trim().toUpperCase();
                          if (!correct) {
                            setMistakeAttemptsCount(prev => prev + 1);
                            recordUserMistake({
                              type: "unscramble",
                              hint: hint,
                              emoji: emoji,
                              answer: answer,
                              tiles: tiles
                            });
                          }
                          setLessonUnscrambleFeedback({
                            isCorrect: correct,
                            correctAnswer: answer
                          });
                          if (correct) recordDailyCorrect();
                          recordLessonAnswer(correct);
                        }}
                        disabled={lessonUnscrambleSelected.length === 0}>Check Answer</button>
                    </div>
                  )}

                  {lessonUnscrambleFeedback && (
                    <div style={{
                      position: 'absolute',
                      bottom: 0, left: 0, right: 0,
                      background: lessonUnscrambleFeedback.isCorrect ? '#d1fae5' : '#fee2e2',
                      borderTop: `2px solid ${lessonUnscrambleFeedback.isCorrect ? '#10b981' : '#ef4444'}`,
                      padding: '20px 40px',
                      zIndex: 100,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <h4 style={{ margin: 0, color: lessonUnscrambleFeedback.isCorrect ? '#065f46' : '#991b1b', fontWeight: '800', fontSize: '1.2rem' }}>{lessonUnscrambleFeedback.isCorrect ? 'Excellent!' : 'Incorrect'}</h4>
                        <p style={{ margin: '4px 0 0', color: lessonUnscrambleFeedback.isCorrect ? '#047857' : '#b91c1c', fontSize: '0.95rem' }}>{lessonUnscrambleFeedback.isCorrect ? 'You unscrambled it!' : `Correct word: "${lessonUnscrambleFeedback.correctAnswer}"`}</p>
                      </div>
                      <button type="button" className="primary-btn" onClick={handleNext}>Continue</button>
                    </div>
                  )}
                </div>
              );
            }

            // 6. Tracing
            if (currentQuestion.type === "tracing") {
              const getPos = (e) => {
                const canvas = tracingCanvasRef.current;
                if (!canvas) return { x: 0, y: 0 };
                const rect = canvas.getBoundingClientRect();
                return { x: (e.clientX - rect.left) * (canvas.width / rect.width), y: (e.clientY - rect.top) * (canvas.height / rect.height) };
              };
              const startDraw = (e) => {
                const canvas = tracingCanvasRef.current;
                if (!canvas) return;
                const ctx = canvas.getContext("2d");
                canvas.isDrawing = true;
                const p = getPos(e);
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                setLessonTracingDone(true);
              };
              const moveDraw = (e) => {
                const canvas = tracingCanvasRef.current;
                if (!canvas || !canvas.isDrawing) return;
                const ctx = canvas.getContext("2d");
                const p = getPos(e);
                ctx.lineTo(p.x, p.y);
                ctx.strokeStyle = "#0284c7";
                ctx.lineWidth = 8;
                ctx.lineCap = "round";
                ctx.lineJoin = "round";
                ctx.stroke();
              };
              const endDraw = () => { if (tracingCanvasRef.current) tracingCanvasRef.current.isDrawing = false; };
              const clearCanvas = () => {
                if (tracingCanvasRef.current) {
                  drawTracingGuide(tracingCanvasRef.current, currentQuestion);
                  setLessonTracingDone(false);
                }
              };

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', margin: '16px 0' }}>
                    <img src="/as1.png" alt="LISA Mascot" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
                    <div style={{ flexGrow: 1, background: 'var(--panel)', border: '2px solid var(--line)', borderRadius: '20px', padding: '16px 24px', position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '-9px', top: '32px', width: '14px', height: '14px', background: 'var(--panel)', borderLeft: '2px solid var(--line)', borderBottom: '2px solid var(--line)', transform: 'rotate(45deg)' }}></div>
                      <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700' }}>{currentQuestion.info || `Trace the letter ${currentQuestion.letter}`}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0' }}>
                    <canvas
                      ref={tracingCanvasRef}
                      width={300}
                      height={300}
                      onPointerDown={startDraw}
                      onPointerMove={moveDraw}
                      onPointerUp={endDraw}
                      onPointerLeave={endDraw}
                      style={{ border: '2px solid var(--line)', borderRadius: '16px', background: 'var(--panel)', touchAction: 'none', maxWidth: '100%' }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', margin: '16px 0' }}>
                    <button type="button" onClick={() => speakText(currentQuestion.sound || currentQuestion.word)} style={{ background: '#38bdf8', border: 'none', color: 'white', borderRadius: '12px', padding: '12px 20px', fontWeight: '800', cursor: 'pointer', fontSize: '1rem' }}>🔊 Play sound</button>
                    <button type="button" onClick={clearCanvas} style={{ background: 'var(--panel-strong)', border: '2px solid var(--line)', borderRadius: '12px', padding: '12px 20px', fontWeight: '800', cursor: 'pointer', fontSize: '1rem' }}>↺ Clear</button>
                  </div>

                  {!lessonTracingFeedback ? (
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                      <button type="button" className="duo-check-btn"
                        onClick={() => {
                          const targetText = (currentQuestion.letter || currentQuestion.word || "A").toString();
                          const score = evaluateDrawingAccuracy(tracingCanvasRef.current, targetText);
                          setLessonTracingAccuracy(score);
                          setLessonTracingFeedback(score >= 20 ? "correct" : "incorrect");
                          const correct = score >= 20;
                          if (correct) recordDailyCorrect();
                          recordLessonAnswer(correct);
                        }}
                        disabled={!lessonTracingDone}>Check Writing</button>
                    </div>
                  ) : (
                    <div style={{
                      position: 'absolute',
                      bottom: 0, left: 0, right: 0,
                      background: lessonTracingFeedback === "correct" ? '#d1fae5' : '#fee2e2',
                      borderTop: `2px solid ${lessonTracingFeedback === "correct" ? '#10b981' : '#ef4444'}`,
                      padding: '20px 40px',
                      zIndex: 100,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <h4 style={{ margin: 0, color: lessonTracingFeedback === "correct" ? '#065f46' : '#991b1b', fontWeight: '800', fontSize: '1.2rem' }}>
                          {lessonTracingFeedback === "correct" ? `Excellent! (Accuracy: ${lessonTracingAccuracy}%)` : `Incorrect (Accuracy: ${lessonTracingAccuracy}%)`}
                        </h4>
                        <p style={{ margin: '4px 0 0', color: lessonTracingFeedback === "correct" ? '#047857' : '#b91c1c', fontSize: '0.95rem' }}>
                          {lessonTracingFeedback === "correct" ? 'Your handwriting matches the word!' : 'Try to write it closer to the target shape next time.'}
                        </p>
                      </div>
                      <button type="button" className="primary-btn" onClick={handleNext}>Continue</button>
                    </div>
                  )}
                </div>
              );
            }

            // 7. arrangeWords (same UX as translationTask — tile assembly)
            if (currentQuestion.type === "arrangeWords") {
              // Delegate to translationTask renderer by reshaping the question
              const q = {
                ...currentQuestion,
                type: "translationTask",
                targetSentence: currentQuestion.targetSentence || currentQuestion.sentence || "",
                prompt: currentQuestion.prompt || (
                  selectedLanguage === "Hindi" ? "एक वाक्य बनाने के लिए शब्दों को व्यवस्थित करें।" :
                  selectedLanguage === "Kannada" ? "ಒಂದು ವಾಕ್ಯವನ್ನು ರೂಪಿಸಲು ಪದಗಳನ್ನು ಜೋಡಿಸಿ." :
                  selectedLanguage === "Telugu" ? "ఒక వాక్యాన్ని రూపొందించడానికి పదాలను అమర్చండి." :
                  selectedLanguage === "Tamil" ? "ஒரு வாக்கியத்தை உருவாக்க வார்த்தைகளை ஒழுங்கமைக்கவும்." :
                  "Arrange the words to form a sentence."
                ),
                englishTranslation: currentQuestion.englishTranslation || currentQuestion.translation || "",
                tiles: currentQuestion.tiles || currentQuestion.targetTiles || []
              };
              // Re-render as translationTask by mutating currentQuestion shape
              // We render inline to avoid recursion:
              const tiles2 = q.tiles;
              const isChecked2 = lessonTranslationFeedback !== null;
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '120px' }}>
                  <div style={{ background: 'rgba(2,132,199,0.05)', border: '2px solid rgba(2,132,199,0.2)', borderRadius: '16px', padding: '16px 20px', fontSize: '1.1rem', fontWeight: '700', textAlign: 'center' }}>
                    {q.prompt}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', margin: '10px 0' }}>
                    <img src="/as1.png" alt="LISA Mascot" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
                    <div className="duo-speech-bubble" style={{ flexGrow: 1 }}>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 4px', fontWeight: '800' }}>
                        Translate this to {learningLanguage}:
                      </p>
                      <p style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>
                        "{q.englishTranslation}"
                      </p>
                    </div>
                  </div>
                  {/* Selected area */}
                  <div style={{ borderBottom: '2px solid var(--line)', minHeight: '60px', display: 'flex', flexWrap: 'wrap', gap: '10px', padding: '10px 0', alignItems: 'center', justifyContent: 'center' }}>
                    {lessonTranslationSelected.map((word, wIdx) => (
                      <button key={wIdx} type="button"
                        style={{ background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 16px', fontSize: '1.05rem', fontWeight: '700', cursor: 'pointer' }}
                        onClick={() => { if (!isChecked2) setLessonTranslationSelected(prev => prev.filter((_, i) => i !== wIdx)); }}
                        disabled={isChecked2}
                      >{word}</button>
                    ))}
                    {lessonTranslationSelected.length === 0 && <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Tap words below to arrange...</span>}
                  </div>
                  {/* Tile bank */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', margin: '10px 0' }}>
                    {tiles2.map((word, wIdx) => {
                      const isUsed = lessonTranslationSelected.includes(word);
                      return (
                        <button key={wIdx} type="button"
                          style={{ background: isUsed ? 'var(--line)' : 'var(--panel)', color: isUsed ? 'transparent' : 'var(--text)', border: '2px solid var(--line)', borderRadius: '10px', padding: '10px 16px', fontSize: '1.05rem', fontWeight: '700', cursor: isUsed ? 'default' : 'pointer', opacity: isUsed ? 0.3 : 1 }}
                          onClick={() => { if (!isChecked2 && !isUsed) setLessonTranslationSelected(prev => [...prev, word]); }}
                          disabled={isChecked2 || isUsed}
                        >{word}</button>
                      );
                    })}
                  </div>
                  {!isChecked2 && (
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <button type="button" className="primary-btn" style={{ padding: '12px 40px', borderRadius: '12px' }}
                        onClick={() => {
                          const clean = s => s.replace(/[.,\/#!$%\^&\*;:{}=\-_`()?]/g, "").toLowerCase().trim();
                          const correct = clean(lessonTranslationSelected.join(" ")) === clean(q.targetSentence);
                          setLessonTranslationFeedback({ isCorrect: correct, correctSentence: q.targetSentence });
                          lessonTotalAnsweredRef.current += 1;
                          if (correct) { lessonCorrectAnsweredRef.current += 1; recordDailyCorrect(); }
                        }}
                        disabled={lessonTranslationSelected.length === 0}
                      >Check Answer</button>
                    </div>
                  )}
                  {isChecked2 && (
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: lessonTranslationFeedback?.isCorrect ? '#d1fae5' : '#fee2e2', borderTop: `2px solid ${lessonTranslationFeedback?.isCorrect ? '#10b981' : '#ef4444'}`, padding: '20px 40px', zIndex: 100, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ margin: 0, color: lessonTranslationFeedback?.isCorrect ? '#065f46' : '#991b1b', fontWeight: '800', fontSize: '1.2rem' }}>{lessonTranslationFeedback?.isCorrect ? '🎉 Correct!' : '❌ Incorrect'}</h4>
                        {!lessonTranslationFeedback?.isCorrect && <p style={{ margin: '4px 0 0', fontSize: '0.95rem', color: '#b91c1c' }}>Correct: "{lessonTranslationFeedback?.correctSentence}"</p>}
                      </div>
                      <button type="button" className="primary-btn" onClick={handleNext}>Continue</button>
                    </div>
                  )}
                </div>
              );
            }

            // matchPairs alias — AI may return "matchPairs" instead of "matchingPairs"
            if (currentQuestion.type === "matchPairs") {
              // Reshape to matchingPairs and fall through
              return renderPracticeSession({ ...ai, questions: ai.questions.map((q, i) => i === lessonStep ? { ...q, type: "matchingPairs" } : q) });
            }

            // 8. Speak question (read sentence aloud) and new speaking practice types
            if (currentQuestion.type === "speak" || currentQuestion.type === "listenRepeat" || currentQuestion.type === "speakReply" || currentQuestion.type === "translateSpeak") {
              const sentence = currentQuestion.sentence || currentQuestion.replyText || currentQuestion.targetSentence || "";
              const emoji = currentQuestion.emoji || "🗣️";
              const feedback = lessonSpeakFeedback;
              const isChecked = feedback !== null;

              const startSpeaking = () => {
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                if (!SpeechRecognition) {
                  setLessonSpeakError("Speech recognition is not supported in this browser. Please use Chrome/Edge.");
                  return;
                }

                try {
                  const rec = new SpeechRecognition();
                  rec.continuous = false;
                  rec.interimResults = false;
                  rec.lang = learningLanguage === "Kannada" ? "kn-IN" :
                    learningLanguage === "Hindi" ? "hi-IN" :
                      learningLanguage === "Telugu" ? "te-IN" :
                        learningLanguage === "Tamil" ? "ta-IN" : "en-US";

                  rec.onstart = () => {
                    setLessonSpeakIsListening(true);
                    setLessonSpeakTranscript("");
                    setLessonSpeakError("");
                  };

                  rec.onerror = (e) => {
                    setLessonSpeakError("Mic error, please check connection.");
                    setLessonSpeakIsListening(false);
                  };

                  rec.onend = () => {
                    setLessonSpeakIsListening(false);
                  };

                  rec.onresult = (event) => {
                    const transcript = event.results[0][0].transcript;
                    setLessonSpeakTranscript(transcript);

                    const clean = (w) => w.replace(/[.,\/#!$%\^&\*;:{}=\-_`()?]/g, "").toLowerCase().trim();
                    const targetWords = sentence.split(/\s+/).filter(Boolean).map(clean);
                    const spokenWords = transcript.split(/\s+/).filter(Boolean).map(clean);

                    let matched = 0;
                    targetWords.forEach(w => {
                      if (spokenWords.includes(w)) matched++;
                    });

                    const percent = targetWords.length > 0 ? (matched / targetWords.length) * 100 : 100;
                    const isCorrect = percent >= 50;

                    if (!isCorrect) {
                      recordUserMistake({
                        type: "speak",
                        sentence: sentence,
                        transcript: transcript
                      });
                    }

                    if (isCorrect) recordDailyCorrect();
                    recordLessonAnswer(isCorrect);
                    setLessonSpeakFeedback({ isCorrect });
                  };

                  rec.start();
                } catch (e) {
                  console.error("Speech recognition error:", e);
                  setLessonSpeakError("Could not start speech recognition.");
                }
              };

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '120px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <span className="ai-step-badge">
                      {currentQuestion.type === "speak" && "🗣️ Read Aloud"}
                      {currentQuestion.type === "listenRepeat" && "🎧 Listen & Repeat"}
                      {currentQuestion.type === "speakReply" && "💬 Conversational Reply"}
                      {currentQuestion.type === "translateSpeak" && "🔄 Translate & Speak"}
                    </span>
                  </div>

                  {currentQuestion.type === "speak" && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                        <p style={{ fontSize: '1.2rem', fontWeight: '700', margin: 0 }}>
                          {selectedLanguage === "Hindi" ? "सुनें और बोलें" : 
                           selectedLanguage === "Kannada" ? "ಕೇಳಿ ಮತ್ತು ಮಾತನಾಡಿ" : 
                           selectedLanguage === "Telugu" ? "వినండి మరియు మాట్లాడండి" : 
                           selectedLanguage === "Tamil" ? "கேட்டு பேசுங்கள்" : 
                           "Listen and Speak"}
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', margin: '10px 0' }}>
                        <img src="/as1.png" alt="LISA" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
                        <div style={{ flexGrow: 1, background: 'var(--panel)', border: '2px solid var(--line)', borderRadius: '20px', padding: '20px', position: 'relative' }}>
                          <div style={{ position: 'absolute', left: '-9px', top: '32px', width: '14px', height: '14px', background: 'var(--panel)', borderLeft: '2px solid var(--line)', borderBottom: '2px solid var(--line)', transform: 'rotate(45deg)' }}></div>
                          <p style={{ fontSize: '1.6rem', fontWeight: '900', margin: 0, textAlign: 'center' }}>
                            {emoji} {sentence}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentQuestion.type === "listenRepeat" && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', margin: '20px 0' }}>
                      <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', margin: 0, fontWeight: 700 }}>Listen to the sentence and speak it back:</p>
                      <button
                        type="button"
                        onClick={() => speakText(sentence)}
                        className="duo-listen-btn"
                        style={{ width: '100px', height: '100px', borderRadius: '50%', fontSize: '3.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        🔊
                      </button>
                      <div style={{ margin: '10px 0', filter: isChecked ? 'none' : 'blur(4px)', transition: 'filter 0.3s' }}>
                        <p style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0 }}>{sentence}</p>
                      </div>
                      {!isChecked && (
                        <button type="button" className="secondary-btn" onClick={() => speakText(sentence)} style={{ fontSize: '0.85rem', padding: '6px 12px' }}>Peek at text</button>
                      )}
                    </div>
                  )}

                  {currentQuestion.type === "speakReply" && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', margin: '20px 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <img src="/as1.png" alt="LISA Character" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
                        <div style={{ background: 'var(--accent-soft)', border: '1px solid var(--accent)', borderRadius: '16px', padding: '12px 16px', flexGrow: 1 }}>
                          <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>{currentQuestion.promptText}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                        <div style={{ background: 'var(--panel)', border: '2px solid var(--line)', borderRadius: '16px', padding: '14px 20px', maxWidth: '80%' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Say this reply:</span>
                          <p style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>{sentence}</p>
                          {currentQuestion.translation && (
                            <p style={{ margin: '6px 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>({currentQuestion.translation})</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {currentQuestion.type === "translateSpeak" && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', margin: '20px 0' }}>
                      <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', margin: 0, fontWeight: 700 }}>Translate this sentence and speak it in {learningLanguage}:</p>
                      <div style={{ background: 'var(--panel)', border: '2px solid var(--line)', borderRadius: '20px', padding: '20px', width: '100%', textAlign: 'center' }}>
                        <p style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>{currentQuestion.promptText}</p>
                        {currentQuestion.hint && (
                          <p style={{ margin: '8px 0 0', fontSize: '0.88rem', color: '#b45309', fontWeight: 700 }}>💡 Hint: {currentQuestion.hint}</p>
                        )}
                      </div>
                      {isChecked && (
                        <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', margin: 0 }}>Expected translation: <strong>{sentence}</strong></p>
                      )}
                    </div>
                  )}

                  {currentQuestion.type === "speak" && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                      <button type="button" onClick={() => speakText(sentence)} style={{ background: '#38bdf8', border: 'none', color: 'white', borderRadius: '14px', padding: '14px 24px', fontWeight: '800', cursor: 'pointer', fontSize: '1rem' }}>🔊 Listen</button>
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', margin: '20px 0' }}>
                    <div className="mic-outer-container">
                      <button
                        type="button"
                        className="mic-btn"
                        onClick={startSpeaking}
                        disabled={lessonSpeakIsListening || isChecked}
                        title="Click to speak"
                      >
                        {lessonSpeakIsListening ? (
                          <span className="voice-wave" aria-hidden="true">
                            <span></span><span></span><span></span><span></span><span></span><span></span><span></span>
                          </span>
                        ) : (
                          <svg className="mic-icon" width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3z" />
                            <path d="M17 11a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2z" />
                          </svg>
                        )}
                        <span className="mic-btn-text">{lessonSpeakIsListening ? "RECORDING..." : "CLICK TO SPEAK"}</span>
                      </button>
                    </div>

                    {lessonSpeakTranscript && (
                      <p style={{ fontStyle: 'italic', color: 'var(--text)', fontSize: '1.1rem' }}>
                        You said: "<strong>{lessonSpeakTranscript}</strong>"
                      </p>
                    )}

                    {lessonSpeakError && (
                      <p style={{ color: '#ef4444', fontWeight: 600 }}>{lessonSpeakError}</p>
                    )}
                  </div>

                  {isChecked && (
                    <div style={{
                      position: 'absolute',
                      bottom: 0, left: 0, right: 0,
                      background: feedback.isCorrect ? '#d1fae5' : '#fee2e2',
                      borderTop: `2px solid ${feedback.isCorrect ? '#10b981' : '#ef4444'}`,
                      padding: '20px 40px',
                      zIndex: 100,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <h4 style={{ margin: 0, color: feedback.isCorrect ? '#065f46' : '#991b1b', fontWeight: '800', fontSize: '1.2rem' }}>
                          {feedback.isCorrect ? "Excellent!" : "Incorrect"}
                        </h4>
                        <p style={{ margin: '4px 0 0', color: feedback.isCorrect ? '#047857' : '#b91c1c', fontSize: '0.95rem' }}>
                          {feedback.isCorrect ? "Good pronunciation!" : `Correct Answer: "${sentence}"`}
                        </p>
                      </div>
                      <button type="button" className="primary-btn" onClick={handleNext}>Continue</button>
                    </div>
                  )}
                </div>
              );
            }

            // listenWordMCQ — Listen to a word and choose the correct one from 4 options
            if (currentQuestion.type === "listenWordMCQ") {
              const audioText = currentQuestion.audioText || "";
              const questionText = currentQuestion.question || "Which word did you hear?";
              const options = currentQuestion.options || [];
              const selectedAnswer = lessonListenWordMCQAnswer;
              const isChecked = lessonListenWordMCQFeedback !== null;

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '120px' }}>
                  <div style={{ marginBottom: '16px', textAlign: 'center' }}>
                    <span className="ai-step-badge">🎧 Listen & Choose the Word</span>
                  </div>

                  <div style={{ textAlign: 'center', margin: '20px 0' }}>
                    <p style={{ fontSize: '1.2rem', fontWeight: '700', margin: '0 0 16px' }}>{questionText}</p>
                    <button
                      type="button"
                      onClick={() => speakText(audioText, 1.0)}
                      style={{
                        margin: '0 auto',
                        width: '80px',
                        height: '80px',
                        borderRadius: '24px',
                        background: '#38bdf8',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                      }}
                    >
                      <span style={{ fontSize: '2.5rem' }}>🔊</span>
                    </button>
                    <p style={{ marginTop: '10px', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>Tap to listen</p>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '16px',
                    margin: '20px 0'
                  }}>
                    {options.map((opt, oIdx) => {
                      const isSelected = selectedAnswer === oIdx;
                      let btnBg = 'var(--panel)';
                      let btnBorder = '2px solid var(--line)';
                      let btnColor = 'var(--text)';

                      if (isChecked) {
                        if (oIdx === currentQuestion.correctIndex) {
                          btnBg = 'rgba(16, 185, 129, 0.1)';
                          btnBorder = '2px solid #10b981';
                          btnColor = '#065f46';
                        } else if (isSelected) {
                          btnBg = 'rgba(239, 68, 68, 0.1)';
                          btnBorder = '2px solid #ef4444';
                          btnColor = '#991b1b';
                        }
                      } else if (isSelected) {
                        btnBorder = '2px solid var(--accent)';
                        btnColor = 'var(--accent-dark)';
                      }

                      return (
                        <button
                          key={oIdx}
                          type="button"
                          onClick={() => { if (!isChecked) setLessonListenWordMCQAnswer(oIdx); }}
                          style={{
                            background: btnBg,
                            border: btnBorder,
                            color: btnColor,
                            borderRadius: '16px',
                            padding: '20px',
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            cursor: isChecked ? 'default' : 'pointer',
                            textAlign: 'center',
                            transition: 'all 0.2s ease'
                          }}
                          disabled={isChecked}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {!isChecked && (
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <button
                        type="button"
                        className="primary-btn"
                        style={{ padding: '12px 40px', borderRadius: '12px' }}
                        disabled={selectedAnswer === null}
                        onClick={() => {
                          const correct = selectedAnswer === currentQuestion.correctIndex;
                          if (!correct) {
                            recordUserMistake({
                              type: "listenWordMCQ",
                              question: questionText,
                              audioText: audioText,
                              options: options,
                              correctIndex: currentQuestion.correctIndex
                            });
                          }
                          setLessonListenWordMCQFeedback({
                            isCorrect: correct,
                            correctAnswer: options[currentQuestion.correctIndex]
                          });
                          if (correct) recordDailyCorrect();
                          recordLessonAnswer(correct);
                        }}
                      >
                        Check Answer
                      </button>
                    </div>
                  )}

                  {isChecked && (
                    <div style={{
                      position: 'absolute',
                      bottom: 0, left: 0, right: 0,
                      background: lessonListenWordMCQFeedback.isCorrect ? '#d1fae5' : '#fee2e2',
                      borderTop: `2px solid ${lessonListenWordMCQFeedback.isCorrect ? '#10b981' : '#ef4444'}`,
                      padding: '20px 40px',
                      zIndex: 100,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <h4 style={{ margin: 0, color: lessonListenWordMCQFeedback.isCorrect ? '#065f46' : '#991b1b', fontWeight: '800', fontSize: '1.2rem' }}>
                          {lessonListenWordMCQFeedback.isCorrect ? "Excellent!" : "Incorrect"}
                        </h4>
                        <p style={{ margin: '4px 0 0', color: lessonListenWordMCQFeedback.isCorrect ? '#047857' : '#b91c1c', fontSize: '0.95rem' }}>
                          {lessonListenWordMCQFeedback.isCorrect ? "You heard it correctly!" : `Correct Answer: "${lessonListenWordMCQFeedback.correctAnswer}"`}
                        </p>
                      </div>
                      <button type="button" className="primary-btn" onClick={handleNext}>
                        Continue
                      </button>
                    </div>
                  )}
                </div>
              );
            }

            // listenPassageMCQ — Listen to a paragraph/audio and answer MCQ
            if (currentQuestion.type === "listenPassageMCQ") {
              const audioText = currentQuestion.audioText || "";
              const questionText = currentQuestion.question || "Listen and answer:";
              const options = currentQuestion.options || [];
              const selectedAnswer = lessonMeaningAnswer;
              const isChecked = lessonMeaningFeedback !== null;

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '120px' }}>
                  <div style={{ marginBottom: '16px', textAlign: 'center' }}>
                    <span className="ai-step-badge">🎧 Listen to the Passage</span>
                  </div>

                  <div style={{
                    background: 'var(--panel)',
                    border: '2px solid var(--line)',
                    borderRadius: '20px',
                    padding: '20px',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <p style={{ margin: '0 0 12px', fontSize: '1rem', fontWeight: '700', color: 'var(--text-muted)' }}>Tap to listen to the audio</p>
                    <button
                      type="button"
                      onClick={() => speakText(audioText, 1.0)}
                      style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '24px',
                        background: '#38bdf8',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                      }}
                    >
                      <span style={{ fontSize: '2.5rem' }}>🔊</span>
                    </button>
                    {audioText && (
                      <p style={{ marginTop: '16px', fontSize: '1.15rem', fontStyle: 'italic', fontWeight: '500', color: 'var(--text)' }}>
                        "{audioText}"
                      </p>
                    )}
                  </div>

                  <div style={{
                    background: 'rgba(2, 132, 199, 0.05)',
                    border: '2px solid rgba(2, 132, 199, 0.2)',
                    borderRadius: '20px',
                    padding: '20px',
                    fontSize: '1.2rem',
                    fontWeight: '800',
                    textAlign: 'center'
                  }}>
                    {questionText}
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '16px',
                    margin: '25px 0'
                  }}>
                    {options.map((opt, oIdx) => {
                      const isSelected = selectedAnswer === oIdx;
                      let extraClass = "";

                      if (isChecked) {
                        if (oIdx === currentQuestion.correctIndex) {
                          extraClass = "correct";
                        } else if (isSelected) {
                          extraClass = "incorrect";
                        }
                      } else if (isSelected) {
                        extraClass = "selected";
                      }

                      return (
                        <button
                          key={oIdx}
                          type="button"
                          onClick={() => { speakText(opt); if (!isChecked) setLessonMeaningAnswer(oIdx); }}
                          className={`duo-option-btn ${extraClass}`}
                          disabled={isChecked}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {!isChecked && (
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <button
                        type="button"
                        className="primary-btn"
                        style={{ padding: '12px 40px', borderRadius: '12px' }}
                        disabled={selectedAnswer === null}
                        onClick={() => {
                          const correct = selectedAnswer === currentQuestion.correctIndex;
                          if (!correct) {
                            recordUserMistake({
                              type: "listenPassageMCQ",
                              question: questionText,
                              audioText: audioText,
                              options: options,
                              correctIndex: currentQuestion.correctIndex
                            });
                          }
                          setLessonMeaningFeedback({
                            isCorrect: correct,
                            correctAnswer: options[currentQuestion.correctIndex]
                          });
                          if (correct) recordDailyCorrect();
                          recordLessonAnswer(correct);
                        }}
                      >
                        Check Answer
                      </button>
                    </div>
                  )}

                  {isChecked && (
                    <div style={{
                      position: 'absolute',
                      bottom: 0, left: 0, right: 0,
                      background: lessonMeaningFeedback.isCorrect ? '#d1fae5' : '#fee2e2',
                      borderTop: `2px solid ${lessonMeaningFeedback.isCorrect ? '#10b981' : '#ef4444'}`,
                      padding: '20px 40px',
                      zIndex: 100,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <h4 style={{ margin: 0, color: lessonMeaningFeedback.isCorrect ? '#065f46' : '#991b1b', fontWeight: '800', fontSize: '1.2rem' }}>
                          {lessonMeaningFeedback.isCorrect ? "Excellent!" : "Incorrect"}
                        </h4>
                        <p style={{ margin: '4px 0 0', color: lessonMeaningFeedback.isCorrect ? '#047857' : '#b91c1c', fontSize: '0.95rem' }}>
                          {lessonMeaningFeedback.isCorrect ? "You got it right!" : `Correct Answer: "${lessonMeaningFeedback.correctAnswer}"`}
                        </p>
                      </div>
                      <button type="button" className="primary-btn" onClick={handleNext}>
                        Continue
                      </button>
                    </div>
                  )}
                </div>
              );
            }

            if (currentQuestion.type === "chatComplete") {
              const scenario = currentQuestion.scenario || "";
              const questionText = currentQuestion.question || "Choose the best response:";
              const options = currentQuestion.options || [];
              const selectedAnswer = lessonMeaningAnswer;
              const isChecked = lessonMeaningFeedback !== null;

              const lines_chat = scenario.split("\n").map(l => l.trim()).filter(Boolean);

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '120px' }}>
                  <div style={{ background: 'rgba(2,132,199,0.05)', border: '2px solid rgba(2,132,199,0.2)', borderRadius: '16px', padding: '16px 20px', fontSize: '1.1rem', fontWeight: '700', textAlign: 'center' }}>
                    {questionText}
                  </div>

                  <div style={{
                    background: 'var(--panel)',
                    border: '2px solid var(--line)',
                    borderRadius: '24px',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}>
                    {lines_chat.map((line, lIdx) => {
                      const match = line.match(/^([^:]+):\s*(.*)$/);
                      if (match) {
                        const speaker = match[1].trim();
                        const text = match[2].trim();
                        const isUser = speaker.toUpperCase() === 'B' || speaker.toUpperCase() === 'YOU' || text.includes('___');
                        return (
                          <div key={lIdx} style={{
                            display: 'flex',
                            justifyContent: isUser ? 'flex-end' : 'flex-start',
                            width: '100%'
                          }}>
                            <div 
                              onClick={() => speakText(text)}
                              title="Click to speak"
                              style={{
                                background: isUser ? 'rgba(var(--accent-rgb),0.1)' : 'var(--bg)',
                                border: `2px solid ${isUser ? 'var(--accent)' : 'var(--line)'}`,
                                borderRadius: '18px',
                                padding: '12px 18px',
                                maxWidth: '75%',
                                position: 'relative',
                                cursor: 'pointer'
                              }}
                            >
                              <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                                {speaker.toUpperCase() === 'A' ? 'Anna' : speaker.toUpperCase() === 'B' ? 'You' : speaker} 🔊
                              </span>
                              <span style={{ fontSize: '1.1rem', fontWeight: '600' }}>
                                {text}
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return (
                        <div 
                          key={lIdx} 
                          onClick={() => speakText(line)}
                          style={{ fontSize: '1.1rem', fontWeight: '600', fontStyle: 'italic', textAlign: 'center', color: 'var(--text-muted)', cursor: 'pointer' }}
                        >
                          🔊 {line}
                        </div>
                      );
                    })}
                  </div>

                  <div style={{
                    background: 'rgba(2, 132, 199, 0.05)',
                    border: '2px solid rgba(2, 132, 199, 0.2)',
                    borderRadius: '24px',
                    padding: '24px',
                    fontSize: '1.3rem',
                    fontWeight: '800',
                    textAlign: 'center',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.01)'
                  }}>
                    {questionText}
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '16px',
                    margin: '25px 0'
                  }}>
                    {options.map((opt, oIdx) => {
                      const isSelected = selectedAnswer === oIdx;
                      let extraClass = "";

                      if (isChecked) {
                        if (oIdx === currentQuestion.correctIndex) {
                          extraClass = "correct";
                        } else if (isSelected) {
                          extraClass = "incorrect";
                        }
                      } else if (isSelected) {
                        extraClass = "selected";
                      }

                      return (
                        <button
                          key={oIdx}
                          type="button"
                          onClick={() => { speakText(opt); if (!isChecked) setLessonMeaningAnswer(oIdx); }}
                          className={`duo-option-btn ${extraClass}`}
                          disabled={isChecked}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {!isChecked && (
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <button
                        type="button"
                        className="duo-check-btn"
                        disabled={selectedAnswer === null}
                        onClick={() => {
                          const correct = selectedAnswer === currentQuestion.correctIndex;
                          setLessonMeaningFeedback({
                            isCorrect: correct,
                            correctAnswer: options[currentQuestion.correctIndex]
                          });
                          if (correct) recordDailyCorrect();
                          recordLessonAnswer(correct);
                        }}
                      >
                        Check Answer
                      </button>
                    </div>
                  )}

                  {isChecked && (
                    <div className={lessonMeaningFeedback.isCorrect ? "duo-banner-correct" : "duo-banner-incorrect"}>
                      <div>
                        <h4 className={lessonMeaningFeedback.isCorrect ? "duo-banner-title-correct" : "duo-banner-title-incorrect"}>
                          {lessonMeaningFeedback.isCorrect ? "🎉 Excellent!" : "😢 Incorrect"}
                        </h4>
                        <p style={{ margin: '4px 0 0', fontSize: '1rem', fontWeight: '600' }}>
                          {currentQuestion.explanation || `Correct Answer: "${options[currentQuestion.correctIndex]}"`}
                        </p>
                      </div>
                      <button type="button" className="duo-check-btn" onClick={handleNext}>Continue</button>
                    </div>
                  )}
                </div>
              );
            }

            // scenario — Real-world scenario based question
            if (currentQuestion.type === "scenario") {
              const scenarioText = currentQuestion.scenario || "";
              const questionText = currentQuestion.question || "What should you do?";
              const options = currentQuestion.options || [];
              const selectedAnswer = lessonMeaningAnswer;
              const isChecked = lessonMeaningFeedback !== null;

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '120px' }}>
                  <div style={{ marginBottom: '16px', textAlign: 'center' }}>
                    <span className="ai-step-badge">🌍 Real-World Scenario</span>
                  </div>

                  <div 
                    onClick={() => speakText(scenarioText)}
                    title="Click to listen"
                    style={{
                      background: 'var(--panel)',
                      border: '2px solid var(--line)',
                      borderRadius: '20px',
                      padding: '20px',
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      lineHeight: '1.6',
                      whiteSpace: 'pre-wrap',
                      cursor: 'pointer'
                    }}
                  >
                    🔊 {scenarioText}
                  </div>

                  <div style={{
                    background: 'rgba(2, 132, 199, 0.05)',
                    border: '2px solid rgba(2, 132, 199, 0.2)',
                    borderRadius: '20px',
                    padding: '20px',
                    fontSize: '1.2rem',
                    fontWeight: '800',
                    textAlign: 'center'
                  }}>
                    {questionText}
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '16px',
                    margin: '25px 0'
                  }}>
                    {options.map((opt, oIdx) => {
                      const isSelected = selectedAnswer === oIdx;
                      let extraClass = "";

                      if (isChecked) {
                        if (oIdx === currentQuestion.correctIndex) {
                          extraClass = "correct";
                        } else if (isSelected) {
                          extraClass = "incorrect";
                        }
                      } else if (isSelected) {
                        extraClass = "selected";
                      }

                      return (
                        <button
                          key={oIdx}
                          type="button"
                          onClick={() => { speakText(opt); if (!isChecked) setLessonMeaningAnswer(oIdx); }}
                          className={`duo-option-btn ${extraClass}`}
                          disabled={isChecked}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {!isChecked && (
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <button
                        type="button"
                        className="primary-btn"
                        style={{ padding: '12px 40px', borderRadius: '12px' }}
                        disabled={selectedAnswer === null}
                        onClick={() => {
                          const correct = selectedAnswer === currentQuestion.correctIndex;
                          if (!correct) {
                            recordUserMistake({
                              type: "scenario",
                              question: questionText,
                              scenario: scenarioText,
                              options: options,
                              correctIndex: currentQuestion.correctIndex
                            });
                          }
                          setLessonMeaningFeedback({
                            isCorrect: correct,
                            correctAnswer: options[currentQuestion.correctIndex]
                          });
                          if (correct) recordDailyCorrect();
                          recordLessonAnswer(correct);
                        }}
                      >
                        Check Answer
                      </button>
                    </div>
                  )}

                  {isChecked && (
                    <div style={{
                      position: 'absolute',
                      bottom: 0, left: 0, right: 0,
                      background: lessonMeaningFeedback.isCorrect ? '#d1fae5' : '#fee2e2',
                      borderTop: `2px solid ${lessonMeaningFeedback.isCorrect ? '#10b981' : '#ef4444'}`,
                      padding: '20px 40px',
                      zIndex: 100,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <h4 style={{ margin: 0, color: lessonMeaningFeedback.isCorrect ? '#065f46' : '#991b1b', fontWeight: '800', fontSize: '1.2rem' }}>
                          {lessonMeaningFeedback.isCorrect ? "Excellent!" : "Incorrect"}
                        </h4>
                        <p style={{ margin: '4px 0 0', color: lessonMeaningFeedback.isCorrect ? '#047857' : '#b91c1c', fontSize: '0.95rem' }}>
                          {lessonMeaningFeedback.isCorrect ? "Well done!" : `Correct Answer: "${lessonMeaningFeedback.correctAnswer}"`}
                        </p>
                      </div>
                      <button type="button" className="primary-btn" onClick={handleNext}>
                        Continue
                      </button>
                    </div>
                  )}
                </div>
              );
            }

            // Unknown type — skip to next step automatically
            if (currentQuestion.type && currentQuestion.type !== "") {
              return (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                  <p style={{ fontSize: '1.1rem' }}>Loading question...</p>
                  <button type="button" className="primary-btn" style={{ marginTop: '20px' }} onClick={handleNext}>Skip</button>
                </div>
              );
            }

            return null;
          })()}
                </div>

              </div>
    );
  };


  const recordUserMistake = (mistake) => {
    if (!session?.user?.id || !mistake) return;
    const item = {
      id: `mistake_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      date: new Date().toISOString(),
      ...mistake
    };
    setUserMistakes(prev => {
      const next = [item, ...prev].slice(0, 500);
      localStorage.setItem(`lisa_user_mistakes_${session.user.id}`, JSON.stringify(next));
      return next;
    });
  };

  const removeUserMistake = (mistakeId) => {
    if (!session?.user?.id || !mistakeId) return;
    setUserMistakes(prev => {
      const next = prev.filter(m => m.id !== mistakeId);
      localStorage.setItem(`lisa_user_mistakes_${session.user.id}`, JSON.stringify(next));
      return next;
    });
  };

  const handleDirectSolveCheck = () => {
    if (!activeSolveMistake) return;
    const isCorrect = activeSolveInput.trim().toLowerCase() === String(activeSolveMistake.correctAnswer || "").trim().toLowerCase();
    
    if (isCorrect) {
      setActiveSolveFeedback("correct");
      playChime("correct");
      triggerHaptic("correct");
      
      const xpAwarded = 5;
      const userId = session?.user?.id;
      if (userId) {
        const newXp = userXp + xpAwarded;
        setUserXp(newXp);
        localStorage.setItem(`lisa_user_xp_${userId}`, newXp);
      }
      
      removeUserMistake(activeSolveMistake.id);
      
      setTimeout(() => {
        setActiveSolveMistake(null);
        setActiveSolveFeedback(null);
        setActiveSolveInput("");
      }, 1500);
    } else {
      setActiveSolveFeedback("incorrect");
      playChime("incorrect");
      triggerHaptic("incorrect");
    }
  };

  const speakSentencePronunciation = (sentence) => {
    // Use speakText which handles ResponsiveVoice + speechSynthesis fallback reliably
    speakText(sentence, slowSpeed ? 0.5 : 1.0);
  };

  const startListeningPronunciation = (targetText) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Google Chrome or Edge.");
      return;
    }
    
    try {
      window.speechSynthesis?.cancel();
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = getLocale(learningLanguage || "English");
      
      recognition.onstart = () => {
        setIsRecordingPronunciation(true);
        setSpokenText("");
        setPronunciationScore(null);
        setPronouncedWordsMatch([]);
      };
      
      recognition.onerror = (e) => {
        console.error("Pronunciation recognition error:", e);
        setIsRecordingPronunciation(false);
        alert("Failed to record. Please check microphone permissions and try again.");
      };
      
      recognition.onend = () => {
        setIsRecordingPronunciation(false);
      };
      
      recognition.onresult = (event) => {
        const resultText = event.results[0][0].transcript || "";
        setSpokenText(resultText);
        
        const clean = (str) => str.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?।]/g, "").trim().split(/\s+/).filter(Boolean);
        const targetWords = clean(targetText);
        const spokenWords = clean(resultText);
        
        let correctCount = 0;
        const matches = targetWords.map(tWord => {
          const found = spokenWords.some(sWord => sWord === tWord || sWord.includes(tWord) || tWord.includes(sWord));
          if (found) correctCount++;
          return { word: tWord, isCorrect: found };
        });
        
        const score = targetWords.length ? Math.round((correctCount / targetWords.length) * 100) : 0;
        setPronouncedWordsMatch(matches);
        setPronunciationScore(score);
        
        if (score >= 80) {
          playChime("correct");
          triggerHaptic("correct");
          const xpAwarded = 10;
          const userId = session?.user?.id;
          if (userId) {
            setUserXp(prev => {
              const next = prev + xpAwarded;
              localStorage.setItem(`lisa_user_xp_${userId}`, next);
              return next;
            });
          }
        } else {
          playChime("incorrect");
          triggerHaptic("incorrect");
        }
      };
      
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsRecordingPronunciation(false);
    }
  };

  // Hardcoded pronunciation fallback sentences (instant load, no API dependency)
  const PRONUNCIATION_FALLBACK = {
    Hindi: [
      { id: 1, sentence: "राम स्कूल जाता है।", englishTranslation: "Ram goes to school." },
      { id: 2, sentence: "वह किताब पढ़ता है।", englishTranslation: "He reads a book." },
      { id: 3, sentence: "सीता गाना गाती है।", englishTranslation: "Sita sings a song." },
      { id: 4, sentence: "आज मौसम अच्छा है।", englishTranslation: "Today the weather is good." },
      { id: 5, sentence: "मुझे फल खाना पसंद है।", englishTranslation: "I like to eat fruits." },
      { id: 6, sentence: "यह मेरी पुस्तक है।", englishTranslation: "This is my book." },
      { id: 7, sentence: "हम सब मिलकर खेलेंगे।", englishTranslation: "We will all play together." },
      { id: 8, sentence: "पानी बहुत ठंडा है।", englishTranslation: "The water is very cold." },
      { id: 9, sentence: "पेड़ पर पक्षी हैं।", englishTranslation: "Birds are on the tree." },
      { id: 10, sentence: "समय बहुत मूल्यवान है।", englishTranslation: "Time is very valuable." },
    ],
    Kannada: [
      { id: 1, sentence: "ರಾಮ್ ಶಾಲೆಗೆ ಹೋಗುತ್ತಾನೆ.", englishTranslation: "Ram goes to school." },
      { id: 2, sentence: "ಅವನು ಪುಸ್ತಕ ಓದುತ್ತಾನೆ.", englishTranslation: "He reads a book." },
      { id: 3, sentence: "ಸೀತಾ ಹಾಡು ಹಾಡುತ್ತಾಳೆ.", englishTranslation: "Sita sings a song." },
      { id: 4, sentence: "ಇಂದು ಹವಾಮಾನ ಚೆನ್ನಾಗಿದೆ.", englishTranslation: "Today the weather is good." },
      { id: 5, sentence: "ನನಗೆ ಹಣ್ಣು ತಿನ್ನಲು ಇಷ್ಟ.", englishTranslation: "I like to eat fruits." },
      { id: 6, sentence: "ಇದು ನನ್ನ ಪುಸ್ತಕ.", englishTranslation: "This is my book." },
      { id: 7, sentence: "ನಾವೆಲ್ಲರೂ ಒಟ್ಟಿಗೆ ಆಡೋಣ.", englishTranslation: "Let's all play together." },
      { id: 8, sentence: "ನೀರು ತುಂಬಾ ತಣ್ಣಗಿದೆ.", englishTranslation: "The water is very cold." },
      { id: 9, sentence: "ಮರದ ಮೇಲೆ ಹಕ್ಕಿಗಳಿವೆ.", englishTranslation: "Birds are on the tree." },
      { id: 10, sentence: "ಸಮಯ ತುಂಬಾ ಅಮೂಲ್ಯವಾಗಿದೆ.", englishTranslation: "Time is very precious." },
    ],
    Telugu: [
      { id: 1, sentence: "రాము బడికి వెళతాడు.", englishTranslation: "Ram goes to school." },
      { id: 2, sentence: "అతడు పుస్తకం చదువుతాడు.", englishTranslation: "He reads a book." },
      { id: 3, sentence: "సీత పాట పాడుతుంది.", englishTranslation: "Sita sings a song." },
      { id: 4, sentence: "ఈరోజు వాతావరణం బాగుంది.", englishTranslation: "Today the weather is good." },
      { id: 5, sentence: "నాకు పండ్లు తినడం ఇష్టం.", englishTranslation: "I like to eat fruits." },
      { id: 6, sentence: "ఇది నా పుస్తకం.", englishTranslation: "This is my book." },
      { id: 7, sentence: "మనమందరం కలిసి ఆడుకుందాం.", englishTranslation: "Let's all play together." },
      { id: 8, sentence: "నీరు చాలా చల్లగా ఉంది.", englishTranslation: "Water is very cold." },
      { id: 9, sentence: "చెట్టు మీద పక్షులు ఉన్నాయి.", englishTranslation: "Birds are on the tree." },
      { id: 10, sentence: "సమయం చాలా విలువైనది.", englishTranslation: "Time is very precious." },
    ],
    Tamil: [
      { id: 1, sentence: "ராம் பள்ளிக்குச் செல்கிறான்.", englishTranslation: "Ram goes to school." },
      { id: 2, sentence: "அவன் புத்தகம் படிக்கிறான்.", englishTranslation: "He reads a book." },
      { id: 3, sentence: "சீதா பாட்டு பாடுகிறாள்.", englishTranslation: "Sita sings a song." },
      { id: 4, sentence: "இன்று வானிலை நன்றாக உள்ளது.", englishTranslation: "Today the weather is good." },
      { id: 5, sentence: "எனக்கு பழங்கள் சாப்பிட பிடிக்கும்.", englishTranslation: "I like to eat fruits." },
      { id: 6, sentence: "இது எனது புத்தகம்.", englishTranslation: "This is my book." },
      { id: 7, sentence: "நாம் அனைவரும் சேர்ந்து விளையாடுவோம்.", englishTranslation: "We will all play together." },
      { id: 8, sentence: "தண்ணீர் மிகவும் குளிராக இருக்கிறது.", englishTranslation: "Water is very cold." },
      { id: 9, sentence: "மரத்தின் மேல் பறவைகள் இருக்கின்றன.", englishTranslation: "Birds are on the tree." },
      { id: 10, sentence: "நேரம் மிகவும் மதிப்புமிக்கது.", englishTranslation: "Time is very valuable." },
    ],
    English: [
      { id: 1, sentence: "The sun shines bright.", englishTranslation: "The sun shines bright." },
      { id: 2, sentence: "I love reading books.", englishTranslation: "I love reading books." },
      { id: 3, sentence: "We go to school.", englishTranslation: "We go to school." },
      { id: 4, sentence: "Water is clean and fresh.", englishTranslation: "Water is clean and fresh." },
      { id: 5, sentence: "She speaks very kindly.", englishTranslation: "She speaks very kindly." },
      { id: 6, sentence: "This is my favorite story.", englishTranslation: "This is my favorite story." },
      { id: 7, sentence: "Let's play together today.", englishTranslation: "Let's play together today." },
      { id: 8, sentence: "The trees are green.", englishTranslation: "The trees are green." },
      { id: 9, sentence: "Birds fly high in the sky.", englishTranslation: "Birds fly high in the sky." },
      { id: 10, sentence: "Practice makes perfect.", englishTranslation: "Practice makes perfect." },
    ],
  };

  useEffect(() => {
    if (practiceCollectionPage === "pronunciation") {
      // Load immediately from hardcoded fallback — no API dependency
      const lang = learningLanguage || "English";
      const questions = PRONUNCIATION_FALLBACK[lang] || PRONUNCIATION_FALLBACK["English"];
      setPronunciationQuestions(questions);
      setPronunciationStep(0);
      setSpokenText("");
      setPronunciationScore(null);
      setPronouncedWordsMatch([]);
      setPronunciationLoading(false);
    }
  }, [practiceCollectionPage, learningLanguage]);

  const openPracticeCollection = (page) => {
    setPracticeCollectionPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const startCollectionPractice = (type) => {
    const title = type === "mistakes" ? "Mistakes Practice" : "Words Practice";
    const desc = type === "mistakes" ? "Review your recent mistakes" : "Practice your saved words";
    const lvl = calculateProgressiveLevel(profile, completedLessons);
    startLessonSession({ id: `l${lvl}_${type}_practice`, title, desc });
  };

  const completeLesson = async (lessonId, xpAwarded) => {
    playChime("complete");
    triggerHaptic("complete");

    if (!session?.user?.id) return;
    const userId = session.user.id;

    // Update XP
    const newXp = userXp + xpAwarded;
    setUserXp(newXp);
    localStorage.setItem(`lisa_user_xp_${userId}`, newXp);

    // Update daily XP
    const todayStr = new Date().toLocaleDateString("en-CA");
    const storedDailyXp = localStorage.getItem(`lisa_daily_xp_${userId}_${todayStr}`);
    const nextDailyXp = (storedDailyXp ? parseInt(storedDailyXp, 10) : 0) + xpAwarded;
    setDailyXp(nextDailyXp);
    localStorage.setItem(`lisa_daily_xp_${userId}_${todayStr}`, nextDailyXp);

    // Update weekly XP (leaderboard)
    recordWeeklyXp(xpAwarded);

    // Update completed lessons
    let newLessons = completedLessons;
    if (!completedLessons.includes(lessonId)) {
      newLessons = [...completedLessons, lessonId];
      setCompletedLessons(newLessons);
      localStorage.setItem(`lisa_completed_lessons_${userId}`, JSON.stringify(newLessons));
    }

    // Update daily correct answers
    const storedDailyCorrect = localStorage.getItem(`lisa_daily_correct_${userId}_${todayStr}`);
    const nextDailyCorrect = (storedDailyCorrect ? parseInt(storedDailyCorrect, 10) : 0);
    setDailyCorrectAnswers(nextDailyCorrect);
    localStorage.setItem(`lisa_daily_correct_${userId}_${todayStr}`, nextDailyCorrect);

    // Update daily lessons completed
    const storedDailyLessons = localStorage.getItem(`lisa_daily_lessons_${userId}_${todayStr}`);
    const nextDailyLessons = (storedDailyLessons ? parseInt(storedDailyLessons, 10) : 0) + 1;
    setDailyLessons(nextDailyLessons);
    localStorage.setItem(`lisa_daily_lessons_${userId}_${todayStr}`, nextDailyLessons);
    const today = new Date().toLocaleDateString("en-CA");
    let activeDates = [];
    try {
      const stored = localStorage.getItem(`lisa_active_dates_${userId}`);
      activeDates = stored ? JSON.parse(stored) : [];
    } catch { }
    if (!activeDates.includes(today)) {
      activeDates.push(today);
      localStorage.setItem(`lisa_active_dates_${userId}`, JSON.stringify(activeDates));
    }

    // Refresh day streak in real-time
    updateStreak(userId, profile);

    // Bonus XP for completing all daily quests
    if (!questBonusClaimed && activeQuests.length > 0 && activeQuests.every(q => getQuestProgress(q).completed)) {
      setQuestBonusClaimed(true);
      const bonusXp = 30;
      const bonusNewXp = newXp + bonusXp;
      setUserXp(bonusNewXp);
      localStorage.setItem(`lisa_user_xp_${userId}`, bonusNewXp);
      const bonusDailyXp = nextDailyXp + bonusXp;
      setDailyXp(bonusDailyXp);
      localStorage.setItem(`lisa_daily_xp_${userId}_${todayStr}`, bonusDailyXp);
      localStorage.setItem(`lisa_quest_bonus_${userId}_${todayStr}`, "1");
      recordWeeklyXp(bonusXp);
    }

    // Sync XP, completed lessons, and daily quest progress to the database
    try {
      await supabase
        .from("profiles")
        .update({
          xp: newXp,
          completed_lessons: newLessons,
          daily_xp: nextDailyXp,
          daily_time_spent: dailyTimeSpent,
          daily_lessons: nextDailyLessons,
          daily_correct_answers: nextDailyCorrect,
          daily_quest_date: todayStr
        })
        .eq("id", userId);
    } catch (dbErr) {
      console.warn("Could not sync lesson progress to Supabase:", dbErr);
    }
  };

  // AI-powered lesson session starter
  const startLessonSession = async (lesson, sectionInfo, unitInfo) => {
    playChime("click");
    triggerHaptic("click");
    setLessonLoading(true);
    setLessonStep(0);
    setLessonHearts(3);
    setLessonMcqAnswers({});
    setLessonFillAnswers({});
    setLessonWritingText("");
    setLessonAiContent(null);
    setLessonMcqIndex(0);
    setLessonMcqFeedback(null);
    setLessonFillIndex(0);
    setLessonFillFeedback(null);
    setLessonReadingStep(1);
    setLessonReadingFeedback(null);
    setLessonReadingAnswer("");
    setLessonMeaningFeedback(null);
    setLessonMeaningAnswer(null);
    setLessonListeningFeedback(null);
    setLessonListeningSelected([]);
    setLessonListenWordMCQAnswer(null);
    setLessonListenWordMCQFeedback(null);
    setMistakeAttemptsCount(0);
    setShowMistakeHint(false);
    setFlashcardFlipped(false);
    setStoryLineIndex(0);
    setStoryQuestionIdx(null);
    setStoryQuestionAnswered(false);
    setStoryQuestionFeedback(null);
    lessonTotalAnsweredRef.current = 0;
    lessonCorrectAnsweredRef.current = 0;
    lessonStartTimeRef.current = Date.now();
    setLessonTimeTaken(0);
    setLessonXpEarned(0);
    setLessonAccuracy(null);
    // All lessons (regular + practice) now use the unified renderPracticeSession renderer.
    const isPractice = true;
    const isPracticeSession = lesson.id.includes("_practice") || lesson.title.includes("Practice") || lesson.title.includes("Pronunciation");

    setLessonSession({
      lessonId: lesson.id,
      title: lesson.title,
      sectionNum: sectionInfo?.num || 1,
      sectionTitle: sectionInfo?.title || "",
      unitNum: unitInfo?.num || 1,
      unitTitle: unitInfo?.title || "",
      lessonNum: lesson.num || 1,
      status: "loading",
      feedback: null,
      isPractice: isPractice,
      isPracticeSession: isPracticeSession,
      practiceType: lesson.title
    });

    const storedSkillScores = (() => {
      try {
        const stored = getStoredAssessmentState(session?.user?.id);
        return stored?.skill_scores || profile?.skill_scores || profile?.attempts_history?.[0]?.skillScores || {};
      } catch { return {}; }
    })();
    const weakAreas = getWeakSkills(storedSkillScores);
    const currentLevelNum = calculateProgressiveLevel(profile, completedLessons);
    const profInfo = getProficiencyName(currentLevelNum, "English");

    let aiContent;
    const cacheKey = `lisa_lesson_content_${session?.user?.id || 'guest'}_${lesson.id}`;
    const cachedLesson = localStorage.getItem(cacheKey);
    if (cachedLesson) {
      try {
        aiContent = JSON.parse(cachedLesson);
      } catch (e) {
        console.warn("Error parsing cached lesson content:", e);
      }
    }

    if (!aiContent) {
      if (isPracticeSession) {
        aiContent = await generatePracticeContent({
          practiceType: lesson.title,
          language: learningLanguage || "English",
          learningLanguage: learningLanguage || "English",
          interfaceLanguage: selectedLanguage || "English",
          literacyLevel: currentLevelNum,
          literacyLevelName: profInfo?.name || "Beginner",
          mistakesList: lesson.title === "Mistakes Practice" ? recentMistakes : [],
          useFallback: !aiEnabled
        });
      } else {
        aiContent = await generateLessonContent({
          age: profile?.age || 25,
          educationLevel: profile?.education_level || "No Formal Education",
          language: learningLanguage || "English",
          learningLanguage: learningLanguage || "English",
          interfaceLanguage: selectedLanguage || "English",
          literacyLevel: currentLevelNum,
          literacyLevelName: profInfo?.name || "Beginner",
          weakAreas,
          sectionNum: sectionInfo?.num || 1,
          sectionTitle: sectionInfo?.title || "",
          unitNum: unitInfo?.num || 1,
          unitTitle: unitInfo?.title || "",
          lessonNum: lesson.num || 1,
          lessonTitle: lesson.title || "",
          difficulty: currentLevelNum <= 2 ? "beginner" : currentLevelNum <= 4 ? "intermediate" : "advanced",
          useFallback: !aiEnabled
        });

        if (aiContent && lesson.id && !lesson.id.includes("practice")) {
          try {
            localStorage.setItem(cacheKey, JSON.stringify(aiContent));
          } catch (err) {
            console.warn("Failed to save lesson content to localStorage:", err);
          }
        }
      }
    }

    setLessonAiContent(aiContent);
    setLessonSession(prev => prev ? ({ ...prev, status: "active" }) : null);
    setLessonLoading(false);
  };


  // AI Lesson step handlers
  const advanceLessonStep = () => {
    // Total steps = actual AI question count, fallback to 8
    const totalSteps = lessonAiContent?.questions?.length || 8;
    setMistakeAttemptsCount(0);
    setShowMistakeHint(false);
    setFlashcardFlipped(false);
    if (lessonStep < totalSteps - 1) {
      setLessonStep(prev => prev + 1);
    } else {
      // Complete the lesson — calculate accuracy and XP
      const totalAnswered = lessonTotalAnsweredRef.current;
      const correctAnswered = lessonCorrectAnsweredRef.current;
      const accuracy = totalAnswered > 0 ? Math.round((correctAnswered / totalAnswered) * 100) : 100;
      setLessonAccuracy(accuracy);

      const isExam = lessonSession?.lessonId?.endsWith("l5") || lessonSession?.lessonNum === 5;
      const isWordsPractice = lessonSession?.title === "Words Practice" || lessonSession?.practiceType === "Words Practice";
      const isStoriesPractice = lessonSession?.title === "Stories Practice" || lessonSession?.practiceType === "Stories Practice" || lessonSession?.practiceType === "Stories";
      
      let finalXpEarned = 0;
      if (isExam) {
        const totalQuestions = lessonAiContent?.questions?.length || 10;
        finalXpEarned = Math.round(correctAnswered * (60 / totalQuestions));
      } else if (isWordsPractice || isStoriesPractice) {
        finalXpEarned = Math.min(10, correctAnswered * 5);
        if (finalXpEarned === 0 && correctAnswered > 0) finalXpEarned = 5;
        if (isStoriesPractice && finalXpEarned === 0) finalXpEarned = 10;
      } else {
        const totalQuestions = lessonAiContent?.questions?.length || 10;
        finalXpEarned = Math.round(correctAnswered * (30 / totalQuestions));
      }
      
      setLessonXpEarned(finalXpEarned);
      
      const elapsedSeconds = lessonStartTimeRef.current ? Math.round((Date.now() - lessonStartTimeRef.current) / 1000) : 60;
      setLessonTimeTaken(elapsedSeconds);
      
      completeLesson(lessonSession?.lessonId, finalXpEarned);
      setLessonSession(prev => prev ? { ...prev, status: "completed" } : null);
    }
  };

  const checkLessonMcq = (qIdx, selectedIdx) => {
    setLessonMcqAnswers(prev => ({ ...prev, [qIdx]: selectedIdx }));
  };


  const [message, setMessage] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Dark mode (Claude-inspired) theme state
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem("lisa_theme");
    if (stored) return stored === "dark";
    return false;
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
    localStorage.setItem("lisa_theme", isDark ? "dark" : "light");
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  // Development mode: when AI is OFF, lessons and word of the day use the static fallback content.
  const [aiEnabled, setAiEnabled] = useState(() => {
    const stored = localStorage.getItem("lisa_ai_enabled");
    if (stored !== null) return stored === "true";
    return true;
  });

  const toggleAiMode = () => {
    setAiEnabled((prev) => {
      const next = !prev;
      localStorage.setItem("lisa_ai_enabled", String(next));
      return next;
    });
  };

  // Initial Assessment states
  const [assessmentState, setAssessmentState] = useState("not_started"); // "not_started" | "answering" | "results"
  const [assessmentQuestionsList, setAssessmentQuestionsList] = useState([]);

  // Reset assessment when Learning Language changes to prevent stale questions
  // from a previously selected language from being displayed.
  useEffect(() => {
    setAssessmentQuestionsList([]);
    setAssessmentState("not_started");
    setCurrentStep(0);
    setSelectedAnswers({});
    setWritingAnswers({});
    setReadingAttempts({});
    setTranslatedQ(null);
  }, [learningLanguage]);

  // Only count practice time while the learner is actively in a lesson, practice, or assessment.
  useEffect(() => {
    isActiveLearningRef.current =
      (!!lessonSession && lessonSession.status !== "completed") ||
      assessmentState === "answering";
  }, [lessonSession, assessmentState]);
  const [currentStep, setCurrentStep] = useState(0); // 0-4
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { index: optionIndex }
  const [writingAnswers, setWritingAnswers] = useState({}); // { index: "user text" }
  const [readingAttempts, setReadingAttempts] = useState({}); // { index: { matchedCount, totalWords, transcript, scores } }
  const [shuffledWordBlocks, setShuffledWordBlocks] = useState([]);
  const [arrangedBlockIndices, setArrangedBlockIndices] = useState([]);
  const [translatingQ, setTranslatingQ] = useState(false);
  const [translatedQ, setTranslatedQ] = useState(null);

  // Voice speech states
  const [isListening, setIsListening] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState("");
  const [micError, setMicError] = useState("");
  const [manualTextFallback, setManualTextFallback] = useState("");
  const recognitionRef = useRef(null);

  // Restore English quoted words (e.g. 'Sports', 'Game') into a translated
  // question so learners can see the source vocabulary word in regional languages.
  // The translated sentence is searched for the word's native form and replaced
  // with the original English word.
  const keepEnglishQuotedWords = async (enQuestion, trQuestion, lang) => {
    if (!trQuestion || !enQuestion) return trQuestion;
    const words = [...enQuestion.matchAll(/'([^']+)'/g)].map(m => m[1]);
    let out = trQuestion;
    for (const w of words) {
      if (!/[a-zA-Z]/.test(w) || w.includes("_")) continue; // skip puzzle patterns / non-latin
      if (w.length <= 1) continue; // skip single English characters (e.g. 'D', 'A', 'S' etc.)
      try {
        const native = (assessmentTranslations[lang] && assessmentTranslations[lang][w]) || (await translateTextContent(w, lang));
        if (native && out.includes(native)) {
          out = out.split(native).join(w);
        }
      } catch {
        // keep the translated form if the lookup fails
      }
    }
    return out;
  };

  const parseQuestionByInterfaceLanguage = (questionText, interfaceLang) => {
    if (!questionText || !questionText.includes("/")) return questionText;
    const parts = questionText.split("/").map(s => s.trim());
    if (parts.length < 5) return questionText;

    const lang = interfaceLang || "English";
    if (lang === "English") return parts[0];
    if (lang === "Kannada") return parts[1];
    if (lang === "Hindi") return parts[2];
    if (lang === "Telugu") return parts[3];
    if (lang === "Tamil") return parts[4];
    return parts[0];
  };

  // Fetch translation dynamically when selected language is not English and the question changes
  useEffect(() => {
    if (assessmentState !== "answering" || !assessmentQuestionsList || assessmentQuestionsList.length === 0) {
      return;
    }
    const q = assessmentQuestionsList[currentStep];
    if (!q) return;

    const lang = selectedLanguage || "English";
    if (lang === "English") {
      const parsedQText = parseQuestionByInterfaceLanguage(q.rawQuestion.question, "English");
      setTranslatedQ({
        ...q.rawQuestion,
        question: parsedQText
      });
      setTranslatingQ(false);
      return;
    }

    let active = true;
    const fetchTranslation = async () => {
      setTranslatingQ(true);
      try {
        const dict = assessmentTranslations && assessmentTranslations[lang];
        if (q.type === "comprehension") {
          // If the question contains language slashes, parse directly for maximum speed and correctness
          if (q.rawQuestion.question && q.rawQuestion.question.includes("/")) {
            const parsedQText = parseQuestionByInterfaceLanguage(q.rawQuestion.question, lang);
            if (active) {
              setTranslatedQ({
                ...q.rawQuestion,
                question: parsedQText,
                options: Array.isArray(q.rawQuestion.options) ? [...q.rawQuestion.options] : []
              });
            }
            setTranslatingQ(false);
            return;
          }

          if (dict && dict[q.rawQuestion.question]) {
            const trQuestion = await keepEnglishQuotedWords(q.rawQuestion.question, dict[q.rawQuestion.question], lang);
            // Keep options in English only (initial assessment checks the user,
            // so no regional-language translation is shown in the options).
            const trOptions = Array.isArray(q.rawQuestion.options)
              ? [...q.rawQuestion.options]
              : [];
            if (active) {
              setTranslatedQ({
                ...q.rawQuestion,
                question: trQuestion,
                options: trOptions
              });
            }
            setTranslatingQ(false);
            return;
          }

          const res = await translateMCQContent(
            q.rawQuestion.question,
            q.rawQuestion.options,
            lang
          );
          if (active) {
            setTranslatedQ({
              ...q.rawQuestion,
              question: await keepEnglishQuotedWords(q.rawQuestion.question, res.question, lang),
              // Options kept in English only — no regional-language suffix.
              options: [...q.rawQuestion.options]
            });
          }
        } else if (q.type === "reading") {
          // Display and evaluate reading sentence in English only
          const dict = assessmentTranslations && assessmentTranslations[lang];
          const translatedInstruction = (dict && dict[q.rawQuestion.writing]) || q.rawQuestion.writing;
          if (active) {
            setTranslatedQ({
              ...q.rawQuestion,
              reading: q.rawQuestion.reading, // Keep original English
              writing: translatedInstruction
            });
          }
          setTranslatingQ(false);
          return;
        } else if (q.type === "writing") {
          if (dict && dict[q.rawQuestion.writing]) {
            if (active) {
              setTranslatedQ({
                ...q.rawQuestion,
                writing: dict[q.rawQuestion.writing]
              });
            }
            setTranslatingQ(false);
            return;
          }

          const translatedWriting = await translateTextContent(q.rawQuestion.writing, lang);
          if (active) {
            setTranslatedQ({
              ...q.rawQuestion,
              writing: translatedWriting
            });
          }
        }
      } catch (err) {
        console.error("Error translating assessment question:", err);
        if (active) {
          setTranslatedQ(q.rawQuestion);
        }
      } finally {
        if (active) {
          setTranslatingQ(false);
        }
      }
    };

    fetchTranslation();
    return () => {
      active = false;
    };
  }, [currentStep, selectedLanguage, assessmentQuestionsList, assessmentState]);

  // Shuffles dictation sentence words into interactive word blocks for the initial assessment writing tasks
  useEffect(() => {
    if (assessmentState === "answering" && assessmentQuestionsList && assessmentQuestionsList[currentStep]) {
      const q = assessmentQuestionsList[currentStep];
      if (q.type === "writing") {
        const dictationText = q.rawQuestion?.dictation || "";
        const cleanWords = dictationText.split(/\s+/).filter(Boolean).map(w => w.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?।]/g, "").trim()).filter(Boolean);
        const shuffled = [...cleanWords].sort(() => 0.5 - Math.random());
        setShuffledWordBlocks(shuffled);
        setArrangedBlockIndices([]);
      }
    }
  }, [currentStep, assessmentQuestionsList, assessmentState]);

  // History and analytics
  const [historyAttempts, setHistoryAttempts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("lisa_attempts_history")) || [];
    } catch {
      return [];
    }
  });

  // Edit Profile States
  const [editingProfile, setEditingProfile] = useState(false);
  const [editFullName, setEditFullName] = useState("");
  const [editAge, setEditAge] = useState("");
  const [editPreferredLang, setEditPreferredLang] = useState("");
  const [editLearningLang, setEditLearningLang] = useState("");
  const [editEdLevel, setEditEdLevel] = useState("");
  const [editExpLevel, setEditExpLevel] = useState("I am completely new to this language");

  // Delete Account States
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteError, setDeleteError] = useState("");

  // User Feedback & Bug Report States
  const [feedbackCategory, setFeedbackCategory] = useState("Bug Report");
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackSubject, setFeedbackSubject] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [devControlsHidden, setDevControlsHidden] = useState(false);

  const handleSendUserFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackMessage.trim()) return;
    setFeedbackSubmitting(true);
    try {
      const newFeedback = {
        id: "fb_" + Date.now(),
        user_id: session?.user?.id || "anon",
        user_name: profile?.full_name || session?.user?.email || "Learner",
        user_email: session?.user?.email || "user@example.com",
        category: feedbackCategory,
        rating: feedbackRating,
        subject: feedbackSubject.trim() || (feedbackCategory === "Bug Report" ? "Bug Report" : "User Feedback"),
        message: feedbackMessage.trim(),
        status: "New",
        created_at: new Date().toISOString()
      };

      // 1. Try Supabase insert
      try {
        await supabase.from("user_feedback").insert([newFeedback]);
      } catch (err) {
        console.warn("Supabase insert user_feedback:", err);
      }

      // 2. Always persist to localStorage for local/offline sync
      try {
        const existing = JSON.parse(localStorage.getItem("lisa_user_feedback") || "[]");
        localStorage.setItem("lisa_user_feedback", JSON.stringify([newFeedback, ...existing]));
      } catch (err) {
        console.error("LocalStorage write error:", err);
      }

      setFeedbackSuccess(true);
      setFeedbackSubject("");
      setFeedbackMessage("");
      setFeedbackRating(5);

      setTimeout(() => {
        setFeedbackSuccess(false);
      }, 5000);
    } catch (error) {
      console.error("Feedback submission error:", error);
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  // Reset scroll position on view / tab switch
  useEffect(() => {
    const resetScroll = () => {
      const mainContent = document.querySelector(".dashboard-main-content");
      const mainView = document.querySelector(".dashboard-main-view");
      if (mainContent) mainContent.scrollTop = 0;
      if (mainView) mainView.scrollTop = 0;
      window.scrollTo(0, 0);
    };

    resetScroll();
    const t = setTimeout(resetScroll, 100);
    return () => clearTimeout(t);
  }, [dashboardTab, assessmentState, lessonSession]);

  useEffect(() => {
    if (!profile) return;
    setEditFullName(profile.full_name || "");
    setEditAge(profile.age || "");
    setEditPreferredLang(profile.preferred_language || selectedLanguage || "English");
    setEditLearningLang(profile.learning_language || learningLanguage || "English");
    setEditEdLevel(profile.education_level || "No Formal Education");
    setEditExpLevel(profile.experience_level || "I am completely new to this language");
  }, [profile]);

  const localUiTranslations = {
    English: {
      sidebarDashboard: "Dashboard",
      sidebarLearn: "Learn",
      sidebarPractice: "Practice",
      sidebarProfile: "Profile",
      sidebarAnalytics: "Analytics",
      dashboardHello: "Hello, {name} 👋🏻",
      dashboardWelcomeBack: "Welcome back! Pick up right where you left off.",
      dashboardContinueLearning: "Continue learning",
      dashboardStartLearning: "Start Learning",
      dashboardSection: "Section",
      dashboardUnit: "Unit",
      dashboardLesson: "Lesson",
      dashboardResume: "Resume",
      dashboardWordOfDay: "Word of the Day",
      dashboardCurrentLevel: "Current Level",
      dashboardStreakSociety: "Streak Society",
      dashboardDayStreak: "day streak",
      dashboardDailyQuests: "Daily Quests",
      dashboardAchievements: "Achievements",
      dashboardViewAll: "VIEW ALL",
      practiceTodaysReview: "Today's Review",
      practicePerfectPronunciation: "Perfect Pronunciation",
      practicePerfectPronunciationDesc: "Finish this session to build confidence with speaking!",
      practicePronunciation: "Pronunciation",
      practicePronunciationDesc: "Improve your pronunciation and speak more clearly",
      practiceStart: "START",
      practiceConversation: "Conversation",
      practiceSpeak: "Speak",
      practiceSpeakDesc: "Improve your speaking skills with these phrases",
      practiceListen: "Listen",
      practiceListenDesc: "Boost your listening skills with an audio-only session",
      practiceRead: "Read",
      practiceReadDesc: "Improve your reading comprehension and vocabulary",
      practiceWrite: "Write",
      practiceWriteDesc: "Enhance your writing skills with interactive exercises",
      practiceYourCollections: "Your collections",
      practiceMistakes: "Mistakes",
      practiceWords: "Words",
      practiceStories: "Stories",
      practiceMistakesDesc: "Start a personalized lesson to practice your mistakes",
      practiceWordsDesc: "Review your vocabulary at any time",
      practiceStoriesDesc: "Reread a story to review words in context",
      profileUpdateSettings: "Update Profile Settings",
      profileEducationStatus: "Current Education Status",
      profileSaveChanges: "Save Changes",
      profileSaving: "Saving...",
      profileResetLessons: "Reset Completed Lessons (Dev)",
      profileAllAchievements: "All Achievements",
      learnSectionOf: "Section {current} of {total}",
      learnUnit: "Unit",
      learnUnitExam: "Unit Exam",
      learnLesson: "Lesson {num}",
      learnUnitExamDesc: "A comprehensive unit exam testing skills from the first 4 lessons.",
      learnLessonDesc: "Personalized AI lesson targeting your curriculum goals.",
      learnReviewExam: "Review Exam",
      learnStartExam: "Start Exam",
      learnReviewLesson: "Review Lesson",
      learnStartLesson: "Start Lesson",
      learnReady: "Ready",
      learnLocked: "Locked",
      learnDone: "Done",
      learnRecommended: "Recommended",
      s1_title: "Letter Recognition",
      s1u1_title: "Alphabet Basics",
      s1u2_title: "Uppercase & Lowercase",
      s1u3_title: "Letter Sounds",
      s2_title: "Word Building",
      s2u1_title: "Simple Words",
      s2u2_title: "Forming Words",
      s2u3_title: "Everyday Vocabulary",
      s3_title: "Vocabulary Development",
      s3u1_title: "Home & Family",
      s3u2_title: "School & Learning",
      s3u3_title: "Community & Environment",
      s4_title: "Reading Words",
      s4u1_title: "Common Words",
      s4u2_title: "Understanding Meaning",
      s4u3_title: "Functional Vocabulary",
      s5_title: "Reading Sentences",
      s5u1_title: "Simple Sentences",
      s5u2_title: "Questions & Answers",
      s5u3_title: "Daily Communication",
      s6_title: "Reading Comprehension",
      s6u1_title: "Short Paragraphs",
      s6u2_title: "Stories",
      s6u3_title: "Information Reading",
      s7_title: "Writing Fundamentals",
      s7u1_title: "Writing Letters",
      s7u2_title: "Writing Words",
      s7u3_title: "Writing Sentences",
      s8_title: "Grammar Foundations",
      s8u1_title: "Nouns",
      s8u2_title: "Verbs",
      s8u3_title: "Sentence Structure",
      s9_title: "Listening & Pronunciation",
      s9u1_title: "Listening Skills",
      s9u2_title: "Word Pronunciation",
      s9u3_title: "Sentence Pronunciation",
      s10_title: "Communication Skills",
      s10u1_title: "Greetings & Introductions",
      s10u2_title: "Everyday Communication",
      s10u3_title: "Social Communication",
      s11_title: "Practical Literacy",
      s11u1_title: "Signs & Symbols",
      s11u2_title: "Forms & Documents",
      s11u3_title: "Instructions & Notices",
      s12_title: "Real-Life Application",
      s12u1_title: "Money & Banking",
      s12u2_title: "Health & Safety",
      s12u3_title: "Travel & Public Services",
      meaning: "Meaning",
      example: "Example",
      profileAge: "Age",
      profileEducation: "Education",
      profileFullName: "Full Name",
      profilePreferredLang: "Preferred Language",
      profileDevControl: "Diagnostic & Dev Control",
      profileDevControlDesc: "Manage diagnostic state or clear developer progress milestones.",
      profileResetAssessment: "Reset Assessment Status",
      profileDangerZone: "Danger Zone",
      profileDeleteAccount: "Delete Account",
      profileDeleteAccountDesc: "Permanently delete your account and all associated data. This action cannot be undone.",
      profileDeleteAccountConfirm: "I understand, delete my account",
      profileDeleteModalTitle: "Delete Account",
      profileDeleteModalDesc: "This will permanently delete your account for {email} and erase all associated learning data. This action cannot be undone.",
      profileDeleteModalTypePrompt: 'To confirm, type "DELETE" in the box below:',
      profileDeleteModalCancel: "Cancel",
      profileDeleteModalConfirm: "Delete My Account",
      profileDeleteSuccess: "Your account has been deleted successfully.",
      profileDeleteError: "Failed to delete account. Please try again or contact support.",
      practiceMode: "Practice Mode",
      stepOf: "Step {current} of {total}",
      naText: "N/A"
    },
    Hindi: {
      sidebarDashboard: "डैशबोर्ड",
      sidebarLearn: "सीखें",
      sidebarPractice: "अभ्यास",
      sidebarProfile: "प्रोफ़ाइल",
      sidebarAnalytics: "एनालिटिक्स",
      dashboardHello: "नमस्ते, {name} 👋🏻",
      dashboardWelcomeBack: "वापस स्वागत है! वहीं से शुरू करें जहां आपने छोड़ा था।",
      dashboardContinueLearning: "सीखना जारी रखें",
      dashboardStartLearning: "सीखना शुरू करें",
      dashboardSection: "अनुभाग",
      dashboardUnit: "इकाई",
      dashboardLesson: "पाठ",
      dashboardResume: "जारी रखें",
      dashboardWordOfDay: "आज का शब्द",
      dashboardCurrentLevel: "वर्तमान स्तर",
      dashboardStreakSociety: "सक्रियता समाज",
      dashboardDayStreak: "दिनों की सक्रियता",
      dashboardDailyQuests: "दैनिक कार्य",
      dashboardAchievements: "उपलब्धियां",
      dashboardViewAll: "सभी देखें",
      practiceTodaysReview: "आज की समीक्षा",
      practicePerfectPronunciation: "उत्कृष्ट उच्चारण",
      practicePerfectPronunciationDesc: "बोलने में आत्मविश्वास बढ़ाने के लिए यह सत्र पूरा करें!",
      practicePronunciation: "उच्चारण",
      practicePronunciationDesc: "अपना उच्चारण सुधारें और अधिक स्पष्ट बोलें",
      practiceStart: "शुरू करें",
      practiceConversation: "बातचीत",
      practiceSpeak: "बोलें",
      practiceSpeakDesc: "इन वाक्यांशों के साथ अपने बोलने के कौशल में सुधार करें",
      practiceListen: "सुनें",
      practiceListenDesc: "केवल सुनने वाले सत्र के साथ अपने सुनने के कौशल को बढ़ाएं",
      practiceRead: "पढ़ें",
      practiceReadDesc: "अपनी पढ़ने की समझ और शब्दावली में सुधार करें",
      practiceWrite: "लिखें",
      practiceWriteDesc: "इंटरैक्टिव अभ्यासों के साथ अपने लेखन कौशल को बढ़ाएं",
      practiceYourCollections: "आपके संग्रह",
      practiceMistakes: "गलतियाँ",
      practiceWords: "शब्द",
      practiceStories: "कहानियाँ",
      practiceMistakesDesc: "अपनी गलतियों का अभ्यास करने के लिए एक व्यक्तिगत पाठ शुरू करें",
      practiceWordsDesc: "किसी भी समय अपनी शब्दावली की समीक्षा करें",
      practiceStoriesDesc: "संदर्भ में शब्दों की समीक्षा करने के लिए कहानी को दोबारा पढ़ें",
      profileUpdateSettings: "प्रोफ़ाइल सेटिंग्स अपडेट करें",
      profileEducationStatus: "वर्तमान शिक्षा स्थिति",
      profileSaveChanges: "बदलाव सहेजें",
      profileSaving: "सहेजा जा रहा है...",
      profileResetLessons: "पूरे किए गए पाठ रीसेट करें (Dev)",
      profileAllAchievements: "सभी उपलब्धियां",
      learnSectionOf: "अनुभाग {total} में से {current}",
      learnUnit: "इकाई",
      learnUnitExam: "इकाई परीक्षा",
      learnLesson: "पाठ {num}",
      learnUnitExamDesc: "पहले 4 पाठों के कौशल का परीक्षण करने वाली एक व्यापक इकाई परीक्षा।",
      learnLessonDesc: "आपके पाठ्यक्रम के लक्ष्यों को लक्षित करने वाला व्यक्तिगत एआई पाठ।",
      learnReviewExam: "परीक्षा की समीक्षा करें",
      learnStartExam: "परीक्षा शुरू करें",
      learnReviewLesson: "पाठ की समीक्षा करें",
      learnStartLesson: "पाठ शुरू करें",
      learnReady: "तैयार",
      learnLocked: "अवरुद्ध",
      learnDone: "पूर्ण",
      learnRecommended: "अनुशंसित",
      s1_title: "अक्षर पहचान",
      s1u1_title: "वर्णमाला की बुनियादी बातें",
      s1u2_title: "बड़े और छोटे अक्षर",
      s1u3_title: "अक्षरों की आवाज़ें",
      s2_title: "शब्द निर्माण",
      s2u1_title: "सरल शब्द",
      s2u2_title: "शब्द बनाना",
      s2u3_title: "रोजमर्रा की शब्दावली",
      s3_title: "शब्दावली विकास",
      s3u1_title: "घर और परिवार",
      s3u2_title: "स्कूल और सीखना",
      s3u3_title: "समुदाय और पर्यावरण",
      s4_title: "शब्द पढ़ना",
      s4u1_title: "आम शब्द",
      s4u2_title: "अर्थ समझना",
      s4u3_title: "कार्यात्मक शब्दावली",
      s5_title: "वाक्य पढ़ना",
      s5u1_title: "सरल वाक्य",
      s5u2_title: "प्रश्न और उत्तर",
      s5u3_title: "दैनिक संचार",
      s6_title: "पठन बोध",
      s6u1_title: "छोटे अनुच्छेद",
      s6u2_title: "कहानियाँ",
      s6u3_title: "सूचना पढ़ना",
      s7_title: "लेखन के बुनियादी सिद्धांत",
      s7u1_title: "अक्षर लिखना",
      s7u2_title: "शब्द लिखना",
      s7u3_title: "वाक्य लिखना",
      s8_title: "व्याकरण की नींव",
      s8u1_title: "संज्ञा",
      s8u2_title: "क्रिया",
      s8u3_title: "वाक्य संरचना",
      s9_title: "सुनना और उच्चारण",
      s9u1_title: "श्रवण कौशल",
      s9u2_title: "शब्दों का उच्चारण",
      s9u3_title: "वाक्यों का उच्चारण",
      s10_title: "संचार कौशल",
      s10u1_title: "अभिवादन और परिचय",
      s10u2_title: "दैनिक बातचीत",
      s10u3_title: "सामाजिक बातचीत",
      s11_title: "कार्यात्मक साक्षरता",
      s11u1_title: "संकेत और प्रतीक",
      s11u2_title: "फॉर्म और दस्तावेज",
      s11u3_title: "निर्देश और सूचनाएं",
      s12_title: "वास्तविक जीवन में अनुप्रयोग",
      s12u1_title: "पैसा और बैंकिंग",
      s12u2_title: "स्वास्थ्य और सुरक्षा",
      s12u3_title: "यात्रा और सार्वजनिक सेवाएं",
      meaning: "अर्थ",
      example: "उदाहरण",
      profileAge: "आयु",
      profileEducation: "शिक्षा",
      profileFullName: "पूरा नाम",
      profilePreferredLang: "पसंदीदा भाषा",
      profileDevControl: "डायग्नोस्टिक और देव नियंत्रण",
      profileDevControlDesc: "डायग्नोस्टिक स्थिति प्रबंधित करें या डेवलपर प्रगति मील के पत्थर साफ़ करें।",
      profileResetAssessment: "मूल्यांकन स्थिति रीसेट करें",
      profileDangerZone: "खतरा क्षेत्र",
      profileDeleteAccount: "खाता हटाएं",
      profileDeleteAccountDesc: "अपना खाता और संबंधित सभी डेटा स्थायी रूप से हटा दें। यह क्रिया पूर्ववत नहीं की जा सकती।",
      profileDeleteAccountConfirm: "मैं समझता हूँ, मेरा खाता हटा दें",
      profileDeleteModalTitle: "खाता हटाएं",
      profileDeleteModalDesc: "यह {email} के लिए आपके खाते को स्थायी रूप से हटा देगा और संबंधित सभी लर्निंग डेटा मिटा देगा। यह क्रिया पूर्ववत नहीं की जा सकती।",
      profileDeleteModalTypePrompt: 'पुष्टि करने के लिए, नीचे दिए गए बॉक्स में "DELETE" टाइप करें:',
      profileDeleteModalCancel: "रद्द करें",
      profileDeleteModalConfirm: "मेरा खाता हटाएं",
      profileDeleteSuccess: "आपका खाता सफलतापूर्वक हटा दिया गया है।",
      profileDeleteError: "खाता हटाने में विफल। कृपया पुनः प्रयास करें या सहायता से संपर्क करें।",
      practiceMode: "अभ्यास मोड",
      stepOf: "चरण {current} का {total}",
      naText: "लागू नहीं"
    },
    Kannada: {
      sidebarDashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
      sidebarLearn: "ಕಲಿ",
      sidebarPractice: "ಅಭ್ಯಾಸ",
      sidebarProfile: "ಪ್ರೊಫೈಲ್",
      sidebarAnalytics: "ವಿಶ್ಲೇಷಣೆ",
      dashboardHello: "ನಮಸ್ಕಾರ, {name} 👋🏻",
      dashboardWelcomeBack: "ಮರಳಿ ಸುಸ್ವಾಗತ! ನೀವು ಎಲ್ಲಿ ನಿಲ್ಲಿಸಿದ್ದೀರೋ ಅಲ್ಲಿಂದ ಮುಂದುವರಿಸಿ.",
      dashboardContinueLearning: "ಕಲಿಕೆಯನ್ನು ಮುಂದುವರಿಸಿ",
      dashboardStartLearning: "ಕಲಿಕೆ ಪ್ರಾರಂಭಿಸಿ",
      dashboardSection: "ವಿಭಾಗ",
      dashboardUnit: "ಘಟಕ",
      dashboardLesson: "ಪಾಠ",
      dashboardResume: "ಪುನರಾರಂಭಿಸಿ",
      dashboardWordOfDay: "ದಿನದ ಪದ",
      dashboardCurrentLevel: "ಪ್ರಸ್ತುತ ಹಂತ",
      dashboardStreakSociety: "ನಿರಂತರ ಕಲಿಕಾ ಸಂಘ",
      dashboardDayStreak: "ದಿನಗಳ ನಿರಂತರತೆ",
      dashboardDailyQuests: "ದಿನನಿತ್ಯದ ಗುರಿಗಳು",
      dashboardAchievements: "ಸಾಧನೆಗಳು",
      dashboardViewAll: "ಎಲ್ಲವನ್ನೂ ವೀಕ್ಷಿಸಿ",
      practiceTodaysReview: "ಇಂದಿನ ವಿಮರ್ಶೆ",
      practicePerfectPronunciation: "ಪರಿಪೂರ್ಣ ಉಚ್ಚಾರಣೆ",
      practicePerfectPronunciationDesc: "ಮಾತನಾಡುವಲ್ಲಿ ಆತ್ಮವಿಶ್ವಾಸ ಬೆಳೆಸಿಕೊಳ್ಳಲು ಈ ಸೆಷನ್ ಪೂರ್ಣಗೊಳಿಸಿ!",
      practicePronunciation: "ಉಚ್ಚಾರಣೆ",
      practicePronunciationDesc: "ನಿಮ್ಮ ಉಚ್ಚಾರಣೆಯನ್ನು ಸುಧಾರಿಸಿ ಮತ್ತು ಇನ್ನಷ್ಟು ಸ್ಪಷ್ಟವಾಗಿ ಮಾತನಾಡಿ",
      practiceStart: "ಪ್ರಾರಂಭಿಸಿ",
      practiceConversation: "ಸಂಭಾಷಣೆ",
      practiceSpeak: "ಮಾತನಾಡು",
      practiceSpeakDesc: "ಈ ನುಡಿಗಟ್ಟುಗಳೊಂದಿಗೆ ನಿಮ್ಮ ಮಾತನಾಡುವ ಕೌಶಲ್ಯವನ್ನು ಸುಧಾರಿಸಿ",
      practiceListen: "ಕೇಳು",
      practiceListenDesc: "ಕೇವಲ ಆಲಿಸುವ ಸೆಷನ್ ಮೂಲಕ ನಿಮ್ಮ ಆಲಿಸುವ ಕೌಶಲ್ಯವನ್ನು ಹೆಚ್ಚಿಸಿ",
      practiceRead: "ಓದು",
      practiceReadDesc: "ನಿಮ್ಮ ಓದುವ ಗ್ರಹಿಕೆ ಮತ್ತು ಶಬ್ದಕೋಶವನ್ನು ಸುಧಾರಿಸಿ",
      practiceWrite: "ಬರೆಯಿರಿ",
      practiceWriteDesc: "ಸಂವಾದಾತ್ಮಕ ಅಭ್ಯಾಸಗಳೊಂದಿಗೆ ನಿಮ್ಮ ಬರವಣಿಗೆಯ ಕೌಶಲ್ಯಗಳನ್ನು ಹೆಚ್ಚಿಸಿ",
      practiceYourCollections: "ನಿಮ್ಮ ಸಂಗ್ರಹಗಳು",
      practiceMistakes: "ತಪ್ಪುಗಳು",
      practiceWords: "ಪದಗಳು",
      practiceStories: "ಕಥೆಗಳು",
      practiceMistakesDesc: "ನಿಮ್ಮ ತಪ್ಪುಗಳನ್ನು ಅಭ್ಯಾಸ ಮಾಡಲು ವೈಯಕ್ತికಗೊಳಿಸಿದ ಪಾಠವನ್ನು ಪ್ರಾರಂಭಿಸಿ",
      practiceWordsDesc: "ಯಾವಾಗಲಾದರೂ ನಿಮ್ಮ ಶಬ್ದಕೋಶವನ್ನು ಮರುಪರಿಶೀಲಿಸಿ",
      practiceStoriesDesc: "ಸಂದರ್ಭಕ್ಕೆ ಅನುಗುಣವಾಗಿ ಪದಗಳನ್ನು ಪರಿಶೀಲಿಸಲು ಕಥೆಯನ್ನು ಮತ್ತೊಮ್ಮೆ ಓದಿ",
      profileUpdateSettings: "ಪ್ರೊಫೈಲ್ ಸೆಟ್ಟಿಂಗ್‌ಗಳನ್ನು ನವೀಕರಿಸಿ",
      profileEducationStatus: "ಪ್ರಸ್ತುತ ಶಿಕ್ಷಣದ ಸ್ಥಿತಿ",
      profileSaveChanges: "ಬದಲಾವಣೆಗಳನ್ನು ಉಳಿಸಿ",
      profileSaving: "ಉಳಿಸಲಾಗುತ್ತಿದೆ...",
      profileResetLessons: "ಪೂರ್ಣಗೊಂಡ ಪಾಠಗಳನ್ನು ಮರುಹೊಂದಿಸಿ (Dev)",
      profileAllAchievements: "ಎಲ್ಲಾ ಸಾಧನೆಗಳು",
      learnSectionOf: "ವಿಭಾಗ {total} ರಲ್ಲಿ {current}",
      learnUnit: "ಘಟಕ",
      learnUnitExam: "ಘಟಕ ಪರೀಕ್ಷೆ",
      learnLesson: "ಪಾಠ {num}",
      learnUnitExamDesc: "ಮೊದಲ 4 ಪಾಠಗಳಿಂದ ಕೌಶಲ್ಯಗಳನ್ನು ಪರೀಕ್ಷಿಸುವ ಸಮಗ್ರ ಘಟಕ ಪರೀಕ್ಷೆ.",
      learnLessonDesc: "ನಿಮ್ಮ ಪಠ್ಯಕ್ರಮದ ಗುರಿಗಳನ್ನು ಗುರಿಯಾಗಿಸಿಕೊಂಡು ವೈಯಕ್ತಿಕಗೊಳಿಸಿದ AI ಪಾಠ.",
      learnReviewExam: "ಪರೀಕ್ಷೆ ವಿಮರ್ಶಿಸಿ",
      learnStartExam: "ಪರೀಕ್ಷೆ ಪ್ರಾರಂಭಿಸಿ",
      learnReviewLesson: "ಪಾಠ ವಿಮರ್ಶಿಸಿ",
      learnStartLesson: "ಪಾಠ ಪ್ರಾರಂಭಿಸಿ",
      learnReady: "ಸಿದ್ಧವಾಗಿದೆ",
      learnLocked: "ಲಾಕ್ ಆಗಿದೆ",
      learnDone: "ಪೂರ್ಣಗೊಂಡಿದೆ",
      learnRecommended: "ಶಿಫாரಸು ಮಾಡಲಾಗಿದೆ",
      s1_title: "ಅಕ್ಷರ ಗುರುತಿಸುವಿಕೆ",
      s1u1_title: "ವರ್ಣಮಾಲೆಯ ಮೂಲಗಳು",
      s1u2_title: "ದೊಡ್ಡ ಮತ್ತು ಸಣ್ಣ ಅಕ್ಷರಗಳು",
      s1u3_title: "ಅಕ್ಷರ ಧ್ವನಿಗಳು",
      s2_title: "ಪದ ನಿರ್ಮಾಣ",
      s2u1_title: "ಸರಳ ಪದಗಳು",
      s2u2_title: "ಪದಗಳನ್ನು ರೂಪಿಸುವುದು",
      s2u3_title: "ದೈನಂದಿನ ಶಬ್ದಕೋಶ",
      s3_title: "ಶಬ್ದಕೋಶದ ಅಭಿವೃದ್ಧಿ",
      s3u1_title: "ಮನೆ ಮತ್ತು ಕುಟುಂಬ",
      s3u2_title: "ಶಾಲೆ ಮತ್ತು ಕಲಿಕೆ",
      s3u3_title: "ಸಮುದಾಯ ಮತ್ತು ಪರಿಸರ",
      s4_title: "ಪದಗಳನ್ನು ಓದುವುದು",
      s4u1_title: "ಸಾಮಾನ್ಯ ಪದಗಳು",
      s4u2_title: "ಅರ್ಥವನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳುವುದು",
      s4u3_title: "ಕಾರ್ಯಾತ್ಮಕ ಶಬ್ದಕೋಶ",
      s5_title: "ವಾಕ್ಯ ಓದುವಿಕೆ",
      s5u1_title: "ಸರಳ ವಾಕ್ಯಗಳು",
      s5u2_title: "ಪ್ರಶ್ನೆ ಮತ್ತು ಉತ್ತರಗಳು",
      s5u3_title: "ದೈನಂದಿನ ಸಂವಹನ",
      s6_title: "ಓದುವ ಗ್ರಹಿಕೆ",
      s6u1_title: "ಸಣ್ಣ ಪ್ಯಾರಾಗಳು",
      s6u2_title: "ಕಥೆಗಳು",
      s6u3_title: "ಮಾಹಿತಿ ಓದುವಿಕೆ",
      s7_title: "ಬರವಣಿಗೆಯ ಮೂಲಭೂತ ಅಂಶಗಳು",
      s7u1_title: "ಅಕ್ಷರಗಳನ್ನು ಬರೆಯುವುದು",
      s7u2_title: "ಪದಗಳನ್ನು ಬರೆಯುವುದು",
      s7u3_title: "ವಾಕ್ಯಗಳನ್ನು ಬರೆಯುವುದು",
      s8_title: "ವ್ಯಾಕರಣದ ಮೂಲಭೂತ ಅಂಶಗಳು",
      s8u1_title: "ನಾಮಪದಗಳು",
      s8u2_title: "ಕ್ರಿಯಾಪದಗಳು",
      s8u3_title: "ವಾಕ್ಯ ರಚನೆ",
      s9_title: "ಆಲಿಸುವಿಕೆ ಮತ್ತು ಉಚ್ಚಾರಣೆ",
      s9u1_title: "ಆಲಿಸುವ ಕೌಶಲ್ಯಗಳು",
      s9u2_title: "ಪದಗಳ ಉಚ್ಚಾರಣೆ",
      s9u3_title: "ವಾಕ್ಯ ಉಚ್ಚಾರಣೆ",
      s10_title: "ಸಂವಹನ ಕೌಶಲ್ಯಗಳು",
      s10u1_title: "ಶುಭಾಶಯಗಳು ಮತ್ತು ಪರಿಚಯಗಳು",
      s10u2_title: "ದೈನಂದಿನ ಸಂವಹನ",
      s10u3_title: "ಸಾಮಾಜಿಕ ಸಂವಹನ",
      s11_title: "ಕಾರ್ಯಾತ್ಮಕ ಸಾಕ್ಷರತೆ",
      s11u1_title: "ಚಿಹ್ನೆಗಳು ಮತ್ತು ಸಂಕೇತಗಳು",
      s11u2_title: "ಫಾರ್ಮ್‌ಗಳು ಮತ್ತು ದಾಖಲೆಗಳು",
      s11u3_title: "ಸೂಚನೆಗಳು ಮತ್ತು ಪ್ರಕಟಣೆಗಳು",
      s12_title: "ನೈಜ-ಕಲಿಕೆಯ ಅನ್ವಯ",
      s12u1_title: "ಹಣ ಮತ್ತು ಬ್ಯಾಂಕಿಂಗ್",
      s12u2_title: "ಆರೋಗ್ಯ ಮತ್ತು ಸುರಕ್ಷತೆ",
      s12u3_title: "ಪ್ರಯಾಣ ಮತ್ತು ಸಾರ್ವಜನಿಕ ಸೇವೆಗಳು",
      meaning: "ಅರ್ಥ",
      example: "ಉದಾಹರಣೆ",
      profileAge: "ವಯಸ್ಸು",
      profileEducation: "ಶಿಕ್ಷಣ",
      profileFullName: "ಪೂರ್ಣ ಹೆಸರು",
      profilePreferredLang: "ಆದ್ಯತೆಯ ಭಾಷೆ",
      profileDevControl: "ಡಯಾಗ್ನೋಸ್ಟಿಕ್ ಮತ್ತು ಡೆವ್ ನಿಯಂತ್ರಣ",
      profileDevControlDesc: "ಡಯಾಗ್ನೋಸ್ಟಿಕ್ ಸ್ಥಿತಿಯನ್ನು ನಿರ್ವಹಿಸಿ ಅಥವಾ ಡೆವಲಪರ್ ಪ್ರಗತಿಯ ಮೈಲಿಗಲ್ಲುಗಳನ್ನು ತೆರವುಗೊಳಿಸಿ.",
      profileResetAssessment: "ಮೌಲ್ಯಮಾಪನ ಸ್ಥಿತಿಯನ್ನು ಮರುಹೊಂದಿಸಿ",
      profileDangerZone: "ಅಪಾಯ ವಲಯ",
      profileDeleteAccount: "ಖಾತೆಯನ್ನು ಅಳಿಸಿ",
      profileDeleteAccountDesc: "ನಿಮ್ಮ ಖಾತೆ ಮತ್ತು ಸಂಬಂಧಿತ ಎಲ್ಲಾ ಡೇಟಾವನ್ನು ಶಾಶ್ವತವಾಗಿ ಅಳಿಸಿ. ಈ ಕ್ರಿಯೆಯನ್ನು ರದ್ದುಗೊಳಿಸಲಾಗುವುದಿಲ್ಲ.",
      profileDeleteAccountConfirm: "ನನಗೆ ಅರ್ಥವಾಗಿದೆ, ನನ್ನ ಖಾತೆಯನ್ನು ಅಳಿಸಿ",
      profileDeleteModalTitle: "ಖಾತೆಯನ್ನು ಅಳಿಸಿ",
      profileDeleteModalDesc: "ಇದು {email} ಖಾತೆಯನ್ನು ಶಾಶ್ವತವಾಗಿ ಅಳಿಸುತ್ತದೆ ಮತ್ತು ಸಂಬಂಧಿತ ಎಲ್ಲಾ ಕಲಿಕೆ ಡೇಟಾವನ್ನು ಅಳಿಸುತ್ತದೆ. ಈ ಕ್ರಿಯೆಯನ್ನು ರದ್ದುಗೊಳಿಸಲಾಗುವುದಿಲ್ಲ.",
      profileDeleteModalTypePrompt: 'ದೃಢೀಕರಿಸಲು, ಕೆಳಗಿನ ಬಾಕ್ಸ್‌ನಲ್ಲಿ "DELETE" ಎಂದು ಟೈಪ್ ಮಾಡಿ:',
      profileDeleteModalCancel: "ರದ್ದುಮಾಡಿ",
      profileDeleteModalConfirm: "ನನ್ನ ಖಾತೆಯನ್ನು ಅಳಿಸಿ",
      profileDeleteSuccess: "ನಿಮ್ಮ ಖಾತೆಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಅಳಿಸಲಾಗಿದೆ.",
      profileDeleteError: "ಖಾತೆಯನ್ನು ಅಳಿಸಲು ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ ಅಥವಾ ಬೆಂಬಲವನ್ನು ಸಂಪರ್ಕಿಸಿ.",
      practiceMode: "ಅಭ್ಯಾಸ ವಿಧಾನ",
      stepOf: "ಹಂತ {current} ರಲ್ಲಿ {total}",
      naText: "ಲಭ್ಯವಿಲ್ಲ"
    },
    Telugu: {
      sidebarDashboard: "డ్యాష్‌బోర్డ్",
      sidebarLearn: "నేర్చుకోండి",
      sidebarPractice: "అభ్యాసం",
      sidebarProfile: "ప్రొఫైల్",
      sidebarAnalytics: "విశ్లేషణలు",
      dashboardHello: "నమస్కారం, {name} 👋🏻",
      dashboardWelcomeBack: "మరలా సుస్వాగతం! మీరు ఎక్కడ ఆపివేసారో అక్కడి నుండి ప్రారంభించండి.",
      dashboardContinueLearning: "నేర్చుకోవడం కొనసాగించండి",
      dashboardStartLearning: "నేర్చుకోవడం ప్రారంభించండి",
      dashboardSection: "విభాగం",
      dashboardUnit: "యూనిట్",
      dashboardLesson: "పాఠం",
      dashboardResume: "కొనసాగించు",
      dashboardWordOfDay: "ఈనాటి పదం",
      dashboardCurrentLevel: "ప్రస్తుత స్థాయి",
      dashboardStreakSociety: "నిరంతర అభ్యాసక సంఘం",
      dashboardDayStreak: "రోజుల నిరంతరత",
      dashboardDailyQuests: "రోజువారీ లక్ష్యాలు",
      dashboardAchievements: "సాధనలు",
      dashboardViewAll: "అన్నీ చూడండి",
      practiceTodaysReview: "ఈ రోజు సమీక్ష",
      practicePerfectPronunciation: "ఖచ్చితమైన ఉచ్చారణ",
      practicePerfectPronunciationDesc: "మాట్లాడటంలో ఆత్మవిశ్వాసం పెంచుకోవడానికి ఈ సెషన్‌ను పూర్తి చేయండి!",
      practicePronunciation: "ఉచ్చారణ",
      practicePronunciationDesc: "మీ ఉచ్చారణను మెరుగుపరచుకోండి మరియు మరింత స్పష్టంగా మాట్లాడండి",
      practiceStart: "ప్రారంభించు",
      practiceConversation: "సంభాషణ",
      practiceSpeak: "మాట్లాడండి",
      practiceSpeakDesc: "ఈ పదబంధాలతో మీ మాట్లాడే నైపుణ్యాలను మెరుగుపరచుకోండి",
      practiceListen: "వినండి",
      practiceListenDesc: "ఆడియో మాత్రమే ఉండే సెషన్‌తో మీ వినికిడి నൈపుణ్యాలను పెంచుకోండి",
      practiceRead: "Read (చదవండి)",
      practiceReadDesc: "Improve your reading comprehension and vocabulary",
      practiceWrite: "రాయండి",
      practiceWriteDesc: "ఇంటరాక్టివ్ వ్యాయామాలతో మీ రాయడం నైపుణ్యాలను మెరుగుపరచుకోండి",
      practiceYourCollections: "మీ సేకరణలు",
      practiceMistakes: "తప్పులు",
      practiceWords: "పదాలు",
      practiceStories: "కథలు",
      practiceMistakesDesc: "మీ తప్పులను సరిదిద్దుకోవడానికి వ్యక్తిగతీకరించిన పాఠాన్ని ప్రారంభించండి",
      practiceWordsDesc: "ఏ సమయంలోనైనా మీ పదజాలాన్ని సమీక్షించుకోండి",
      practiceStoriesDesc: "సందర్భంలో పదాలను సమీక్షించడానికి కథను మళ్లీ చదవండి",
      profileUpdateSettings: "ప్రొఫైల్ సెట్టంగ్లను నవీకరించండి",
      profileEducationStatus: "ప్రస్తుత విద్యా స్థితి",
      profileSaveChanges: "మార్పులను సేవ్ చేయి",
      profileSaving: "సేవ్ అవుతోంది...",
      profileResetLessons: "పూర్తయిన పాఠాలను రీసెట్ చేయి (Dev)",
      profileAllAchievements: "అన్ని సాధనలు",
      learnSectionOf: "విభాగం {total} లో {current}",
      learnUnit: "యూనిట్",
      learnUnitExam: "యూనిట్ పరీక్ష",
      learnLesson: "పాఠం {num}",
      learnUnitExamDesc: "మొదటి 4 పాఠాల నుండి నైపుణ్యాలను పరీక్షించే సమగ్ర యూనిట్ పరీక్ష.",
      learnLessonDesc: "మీ పాఠ్యప్రణాళిక లక్ష్యాలను లక్ష్యంగా చేసుకుని వ్యక్తిగతీకరించిన AI పాఠం.",
      learnReviewExam: "పరీక్షను సమీక్షించండి",
      learnStartExam: "పరీక్ష ప్రారంభించండి",
      learnReviewLesson: "పాఠం సమీక్షించండి",
      learnStartLesson: "పాఠం ప్రారంభించండి",
      learnReady: "సిద్ధంగా ఉంది",
      learnLocked: "లాక్ చేయబడింది",
      learnDone: "పూర్తయింది",
      learnRecommended: "సిఫార్సు చేయబడింది",
      s1_title: "అక్షర గుర్తింపు",
      s1u1_title: "అక్షరమాల ప్రాథమికాలు",
      s1u2_title: "పెద్ద & చిన్న అక్షరాలు",
      s1u3_title: "అక్షరాల శబ్దాలు",
      s2_title: "పదాల నిర్మాణం",
      s2u1_title: "సరళమైన పదాలు",
      s2u2_title: "పదాలను రూపొందించడం",
      s2u3_title: "రోజువారీ పదజాలం",
      s3_title: "పదజాల అభివృద్ధి",
      s3u1_title: "ఇల్లు & కుటుంబం",
      s3u2_title: "పాఠశాల & అభ్యాసం",
      s3u3_title: "సమాజం & పర్యావరణం",
      s4_title: "పదాలు చదవడం",
      s4u1_title: "సాధారణ పదాలు",
      s4u2_title: "అర్థాన్ని గ్రహించడం",
      s4u3_title: "కార్యాచరణ పదజాలం",
      s5_title: "వాక్యం చదవడం",
      s5u1_title: "సరళమైన వాక్యాలు",
      s5u2_title: "ప్రశ్నలు & సమాధానాలు",
      s5u3_title: "రోజువారీ కమ్యూనికేషన్",
      s6_title: "పఠన గ్రహణశక్తి",
      s6u1_title: "చిన్న పేరాలు",
      s6u2_title: "కథలు",
      s6u3_title: "సమాచార పఠనం",
      s7_title: "రాత ప్రాథమికాలు",
      s7u1_title: "అక్షరాలు రాయడం",
      s7u2_title: "పదాలు రాయడం",
      s7u3_title: "వాక్యాలు రాయడం",
      s8_title: "వ్యాకరణ పునాదులు",
      s8u1_title: "నామవాచకాలు",
      s8u2_title: "క్రియలు",
      s8u3_title: "వాక్యం నిర్మాణం",
      s9_title: "వినడం & ఉచ్చారణ",
      s9u1_title: "వినే నైపుణ్యాలు",
      s9u2_title: "పదాల ఉచ్చారణ",
      s9u3_title: "వాక్యాల ఉచ్చారణ",
      s10_title: "కమ్యూనికేషన్ నైపుణ్యాలు",
      s10u1_title: "అభినందనలు & పరిచయాలు",
      s10u2_title: "రోజువారీ కమ్యూనికేషన్",
      s10u3_title: "సామాజిక కమ్యూనికేషన్",
      s11_title: "కార్యాచరణ అక్షరాస్యత",
      s11u1_title: "సంకేతాలు & గుర్తులు",
      s11u2_title: "ఫారాలు & పత్రాలు",
      s11u3_title: "సూచనలు & నోటీసులు",
      s12_title: "నిజ-జీవిత అన్వయం",
      s12u1_title: "డబ్బు & బ్యాంకింగ్",
      s12u2_title: "ఆరోగ్యం & భద్రత",
      s12u3_title: "ప్రయాణం & ప్రజా సేవలు",
      meaning: "అర్థం",
      example: "ఉదాహరణ",
      profileAge: "వయస్సు",
      profileEducation: "విద్య",
      profileFullName: "పూర్తి పేరు",
      profilePreferredLang: "ప్రాధాన్యత భాష",
      profileDevControl: "డయాగ్నస్టిక్ & దేవ్ కంట్రోల్",
      profileDevControlDesc: "డయాగ్నస్టిక్ స్థితిని నిర్వహించండి లేదా డెవలపర్ పురోగతి మైలురాళ్లను క్లియర్ చేయండి.",
      profileResetAssessment: "అసెస్మెంట్ స్థితిని రీసెట్ చేయండి",
      profileDangerZone: "ప్రమాద జోన్",
      profileDeleteAccount: "ఖాతాను తొలగించు",
      profileDeleteAccountDesc: "మీ ఖాతా మరియు అనుబంధ డేటాను శాశ్వతంగా తొలగించండి. ఈ చర్యను రద్దు చేయలేరు.",
      profileDeleteAccountConfirm: "నాకు అర్థమైంది, నా ఖాతాను తొలగించు",
      profileDeleteModalTitle: "ఖాతాను తొలగించు",
      profileDeleteModalDesc: "ఇది {email} ఖాతాను శాశ్వతంగా తొలగిస్తుంది మరియు అనుబంధ అంతర్లీన డేటాను తొలగిస్తుంది. ఈ చర్యను రద్దు చేయలేరు.",
      profileDeleteModalTypePrompt: 'నిర్ధారించడానికి, క్రింది బాక్స్‌లో "DELETE" టైప్ చేయండి:',
      profileDeleteModalCancel: "రద్దు చేయి",
      profileDeleteModalConfirm: "నా ఖాతాను తొలగించు",
      profileDeleteSuccess: "మీ ఖాతా విజయవంతంగా తొలగించబడింది.",
      profileDeleteError: "ఖాతాను తొలగించడం విఫలమైంది. దయచేసి మళ్లీ ప్రయత్నించండి లేదా మద్దతును సంప్రదించండి.",
      practiceMode: "అభ్యాస మోడ్",
      stepOf: "దశ {current} లో {total}",
      naText: "అందుబాటులో లేదు"
    },
    Tamil: {
      sidebarDashboard: "டாஷ்போர்டு",
      sidebarLearn: "கற்றுக்கொள்",
      sidebarPractice: "பயிற்சி",
      sidebarProfile: "சுயவிவரம்",
      sidebarAnalytics: "புள்ளிவிவரங்கள்",
      dashboardHello: "வணக்கம், {name} 👋🏻",
      dashboardWelcomeBack: "நல்வரவு! நீங்கள் விட்ட இடத்திலிருந்து தொடங்குங்கள்.",
      dashboardContinueLearning: "கற்றலைத் தொடரவும்",
      dashboardStartLearning: "கற்றலைத் தொடங்குங்கள்",
      dashboardSection: "பிரிவு",
      dashboardUnit: "அலகு",
      dashboardLesson: "பாடம்",
      dashboardResume: "தொடரவும்",
      dashboardWordOfDay: "இன்றைய வார்த்தை",
      dashboardCurrentLevel: "தற்போதைய நிலை",
      dashboardStreakSociety: "தொடர் கற்றல் சங்கம்",
      dashboardDayStreak: "நாட்கள் தொடர்ச்சி",
      dashboardDailyQuests: "தினசரி இலக்குகள்",
      dashboardAchievements: "சாதனைகள்",
      dashboardViewAll: "அனைத்தையும் காட்டு",
      practiceTodaysReview: "இன்றைய ஆய்வு",
      practicePerfectPronunciation: "சரியான உச்சரிப்பு",
      practicePerfectPronunciationDesc: "பேசுவதில் நம்பிக்கையை வளர்க்க இந்த அமர்வை முடிக்கவும்!",
      practicePronunciation: "உச்சரிப்பு",
      practicePronunciationDesc: "உங்கள் உச்சரிப்பை மேம்படுத்தி மேலும் தெளிவாகப் பேசுங்கள்",
      practiceStart: "தொடங்கு",
      practiceConversation: "உரையாடல்",
      practiceSpeak: "பேசு",
      practiceSpeakDesc: "இந்த சொற்றொடர்களைக் கொண்டு உங்கள் பேசும் திறனை மேம்படுத்துங்கள்",
      practiceListen: "கேள்",
      practiceListenDesc: "ஆடியோ மூலம் உங்கள் கேட்கும் திறனை அதிகரிக்கவும்",
      practiceRead: "Read (படி)",
      practiceReadDesc: "Improve your reading comprehension and vocabulary",
      practiceWrite: "எழுதுங்கள்",
      practiceWriteDesc: "ஊடாடும் பயிற்சிகள் மூலம் உங்கள் எழுத்துத் திறனை மேம்படுத்துங்கள்",
      practiceYourCollections: "உங்கள் சேகரிப்புகள்",
      practiceMistakes: "தவறுகள்",
      practiceWords: "வார்த்தைகள்",
      practiceStories: "கதைகள்",
      practiceMistakesDesc: "உங்கள் தவறுகளைப் பயிற்சி செய்ய தனிப்பயனாக்கப்பட்ட பாடத்தைத் தொடங்குங்கள்",
      practiceWordsDesc: "எந்த நேரத்திலும் உங்கள் சொற்களஞ்சியத்தை மதிப்பாய்வு செய்யவும்",
      practiceStoriesDesc: "சூழலில் வார்த்தைகளை மதிப்பாய்வு செய்ய கதையை மீண்டும் படிக்கவும்",
      profileUpdateSettings: "சுயவிவர அமைப்புகளைப் புதுப்பிக்கவும்",
      profileEducationStatus: "தற்போதைய கல்வி நிலை",
      profileSaveChanges: "மாற்றங்களைச் சேமிக்கவும்",
      profileSaving: "சேமிக்கப்படுகிறது...",
      profileResetLessons: "முடிந்த பாடங்களை மீட்டமை (Dev)",
      profileAllAchievements: "அனைத்து சாதனைகள்",
      learnSectionOf: "பிரிவு {total}-இல் {current}",
      learnUnit: "அலகு",
      learnUnitExam: "அலகு தேர்வு",
      learnLesson: "பாடம் {num}",
      learnUnitExamDesc: "முதல் 4 பாடங்களின் திறன்களைச் சோதிக்கும் ஒரு விரிவான அலகுத் தேர்வு.",
      learnLessonDesc: "உங்கள் பாடத்திட்ட இலக்குகளை மையமாகக் கொண்ட தனிப்பயனாக்கப்பட்ட AI பாடம்.",
      learnReviewExam: "தேர்வை மதிப்பாய்வு செய்",
      learnStartExam: "தேர்வைத் தொடங்கு",
      learnReviewLesson: "பாடத்தை மதிப்பாய்வு செய்",
      learnStartLesson: "பாடத்தைத் தொடங்கு",
      learnReady: "தயாராக உள்ளது",
      learnLocked: "பூட்டப்பட்டது",
      learnDone: "முடிந்தது",
      learnRecommended: "பரிந்துரைக்கப்படுகிறது",
      s1_title: "எழுத்து அங்கீகாரம்",
      s1u1_title: "நெடுங்கணக்கு அடிப்படைகள்",
      s1u2_title: "பெரிய & சிறிய எழுத்துக்கள்",
      s1u3_title: "எழுத்து ஒலிகள்",
      s2_title: "சொல் உருவாக்கம்",
      s2u1_title: "எளிய சொற்கள்",
      s2u2_title: "சொற்களை உருவாக்குதல்",
      s2u3_title: "தினசரி சொற்களஞ்சியம்",
      s3_title: "சொற்களஞ்சிய வளர்ச்சி",
      s3u1_title: "வீடு & குடும்பம்",
      s3u2_title: "பள்ளி & கற்றல்",
      s3u3_title: "சமூகம் & சுற்றுப்புற சூழல்",
      s4_title: "சொற்களை வாசித்தல்",
      s4u1_title: "பொதுவான சொற்கள்",
      s4u2_title: "பொருளைப் புரிந்துகொள்ளுதல்",
      s4u3_title: "செயல்பாட்டு சொற்களஞ்சியம்",
      s5_title: "வாக்கிய வாசிப்பு",
      s5u1_title: "எளிய வாக்கியங்கள்",
      s5u2_title: "கேள்விகள் & பதில்கள்",
      s5u3_title: "தினசரி தொடர்பு",
      s6_title: "வாசிப்புப் புரிதல்",
      s6u1_title: "குறுகிய பத்திகள்",
      s6u2_title: "கதைகள்",
      s6u3_title: "தகவல் வாசிப்பு",
      s7_title: "எழுத்து அடிப்படைகள்",
      s7u1_title: "எழுத்துக்களை எழுதுதல்",
      s7u2_title: "சொற்களை எழுதுதல்",
      s7u3_title: "வாக்கியங்களை எழுதுதல்",
      s8_title: "இலக்கண அடித்தளம்",
      s8u1_title: "பெயர்ச்சொற்கள்",
      s8u2_title: "வினைச்சொற்கள்",
      s8u3_title: "வாக்கிய அமைப்பு",
      s9_title: "கேட்டல் & உச்சரிப்பு",
      s9u1_title: "கேட்கும் திறன்",
      s9u2_title: "சொல் உச்சரிப்பு",
      s9u3_title: "வாக்கிய உச்சரிப்பு",
      s10_title: "தொடர்பு திறன்",
      s10u1_title: "வாழ்த்துகள் & அறிமுகங்கள்",
      s10u2_title: "தினசரி தொடர்பு",
      s10u3_title: "சமூக தொடர்பு",
      s11_title: "செயல்பாட்டு எழுத்தறிவு",
      s11u1_title: "அடையாளங்கள் & குறியீடுகள்",
      s11u2_title: "படிவங்கள் & ஆவணங்கள்",
      s11u3_title: "அறிவுறுத்தல்கள் & அறிவிப்புகள்",
      s12_title: "நிஜ வாழ்க்கை பயன்பாடு",
      s12u1_title: "பணம் & வங்கி",
      s12u2_title: "சுகாதாரம் & பாதுகாப்பு",
      s12u3_title: "பயணம் & பொது சேவைகள்",
      meaning: "பொருள்",
      example: "உதாரணம்",
      profileAge: "வயது",
      profileEducation: "கல்வி",
      profileFullName: "முழு பெயர்",
      profilePreferredLang: "விருப்பமான மொழி",
      profileDevControl: "கண்டறிதல் & மேம்பாட்டு கட்டுப்பாடு",
      profileDevControlDesc: "கண்டறியும் நிலையை நிர்வகிக்கவும் அல்லது டெவலப்பர் முன்னேற்ற மைல்கற்களை அழிக்கவும்.",
      profileResetAssessment: "மதிப்பீட்டு நிலையை மீட்டமைக்கவும்",
      profileDangerZone: "ஆபத்து மண்டலம்",
      profileDeleteAccount: "கணக்கை நீக்கு",
      profileDeleteAccountDesc: "உங்கள் கணக்கையும் அனைத்து தொடர்புடைய தரவையும் நிரந்தரமாக நீக்கவும். இந்தச் செயலை மாற்ற முடியாது.",
      profileDeleteAccountConfirm: "இதை நான் புரிந்துகொள்கிறேன், எனது கணக்கை நீக்கு",
      profileDeleteModalTitle: "கணக்கை நீக்கு",
      profileDeleteModalDesc: "இது {email} கணக்கை நிரந்தரமாக நீக்கி, தொடர்புடைய அனைத்து கற்றல் தரவையும் அழிக்கும். இந்தச் செயலை மாற்ற முடியாது.",
      profileDeleteModalTypePrompt: 'உறுதிப்படுத்த, கீழே உள்ள பெட்டியில் "DELETE" என்று தட்டச்சு செய்யவும்:',
      profileDeleteModalCancel: "ரத்துசெய்",
      profileDeleteModalConfirm: "எனது கணக்கை நீக்கு",
      profileDeleteSuccess: "உங்கள் கணக்கு வெற்றிகரமாக நீக்கப்பட்டது.",
      profileDeleteError: "கணக்கை நீக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும் அல்லது ஆதரவைத் தொடர்பு கொள்ளவும்.",
      practiceMode: "பயிற்சி முறை",
      stepOf: "படி {current} / {total}",
      naText: "பொருந்தாது"
    }
  };

  const t = (key) => {
    const lang = selectedLanguage || "English";
    const localDict = localUiTranslations[lang] || localUiTranslations["English"];
    if (localDict && localDict[key]) {
      return localDict[key];
    }
    const dict = translations[lang] || translations["English"];
    if (key === "successForgotPasswordLink") {
      return lang === "Hindi" ? "पासवर्ड रीसेट लिंक भेजा गया! कृपया अपना ईमेल जांचें।" :
        lang === "Kannada" ? "ಪಾಸ್‌ವರ್ಡ್ ಮರುಹೊಂದಿಸುವ ಲಿಂಕ್ ಕಳುಹಿಸಲಾಗಿದೆ! ಇಮೇಲ್ ಪರಿಶೀಲಿಸಿ." :
          lang === "Telugu" ? "పాసవర్డ్ రీసెట్ లింక్ పంపబడింది! దయచేసి ఇమెయిల్ తనిఖీ చేయండి." :
            lang === "Tamil" ? "கடவுச்சொல் மீட்பு இணைப்பு அனுப்பப்பட்டது! மின்னஞ்சலைச் சரிபார்க்கவும்." :
              "Password reset link sent! Please check your email.";
    }
    if (key === "successResetPassword") {
      return lang === "Hindi" ? "पासवर्ड रीसेट सफल रहा! अब आप लॉगिन कर सकते हैं।" :
        lang === "Kannada" ? "ಪಾಸ್‌ವರ್ಡ್ ಮರುಹೊಂದಿಕೆ ಯಶಸ್ವಿಯಾಗಿದೆ! ನೀವು ಈಗ ಲಾಗಿನ್ ಮಾಡಬಹುದು." :
          lang === "Telugu" ? "పాస్వర్డ్ రీసెట్ విజయవంతమైంది! మీరు ఇప్పుడు లాగిన్ చేయవచ్చు." :
            lang === "Tamil" ? "கடவுச்சொல் மீட்டமைக்கப்பட்டது! நீங்கள் இப்போது உள்நுழையலாம்." :
              "Password reset successfully! You can now log in.";
    }
    return dict[key] || translations["English"][key] || key;
  };

  useEffect(() => {
    const checkAndAwardAchievements = async () => {
      if (!session?.user?.id || !profile) return;
      const userId = session.user.id;
      const currentLevel = calculateProgressiveLevel(profile, completedLessons);

      const achievementsDefinitions = [
        { id: 1, condition: true },
        { id: 2, condition: calculateSkillProficiency("reading") >= 75 },
        { id: 3, condition: calculateSkillProficiency("reading_comprehension") >= 75 },
        { id: 4, condition: calculateSkillProficiency("writing") >= 75 },
        { id: 5, condition: userXp >= 100 },
        { id: 6, condition: completedLessons.filter(id => !id.startsWith("ach_")).length >= 3 },
        { id: 7, condition: calculateSkillProficiency("reading_ability") >= 75 },
        { id: 8, condition: currentLevel >= 8 },
        { id: 9, condition: currentLevel >= 12 },
      ];

      let newLessons = completedLessons.filter(id => typeof id === 'string' && !id.startsWith("ach_"));

      achievementsDefinitions.forEach(a => {
        const achIdStr = `ach_${a.id}`;
        if (a.condition) {
          newLessons.push(achIdStr);
        }
      });

      const currentAchList = completedLessons.filter(id => typeof id === 'string' && id.startsWith("ach_")).sort();
      const newAchList = newLessons.filter(id => typeof id === 'string' && id.startsWith("ach_")).sort();
      const changed = JSON.stringify(currentAchList) !== JSON.stringify(newAchList);

      if (changed) {
        setCompletedLessons(newLessons);
        localStorage.setItem(`lisa_completed_lessons_${userId}`, JSON.stringify(newLessons));
        try {
          await supabase
            .from("profiles")
            .update({
              completed_lessons: newLessons
            })
            .eq("id", userId);
        } catch (e) {
          console.warn("Error syncing achievements to Supabase:", e);
        }
      }
    };

    checkAndAwardAchievements();
  }, [userXp, completedLessons, profile, session]);

  useEffect(() => {
    // Load ResponsiveVoice client script on initial mount
    if (!window.responsiveVoice && !document.querySelector('script[data-responsivevoice]')) {
      const script = document.createElement("script");
      script.src = "https://code.responsivevoice.org/responsivevoice.js?key=8Q7W8t4L";
      script.async = true;
      script.setAttribute("data-responsivevoice", "true");
      document.body.appendChild(script);
    }

    // Check initial auth session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setInitialLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        if (event === "PASSWORD_RECOVERY") {
          setRecoveryMode(true);
        }
        if (session?.user) {
          fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setInitialLoading(false);
        }
      }
    );
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const [curriculumVersion, setCurriculumVersion] = useState(0);

  // Load custom curriculum configuration and global shop catalog from admin's profile JSON column in Supabase (100% DB-driven)
  useEffect(() => {
    const fetchCustomConfig = async () => {
      try {
        // Fetch curriculum + shop catalog from profiles (admin reads own row, others get their row)
        const { data, error } = await supabase.from("profiles").select("shop_data");
        if (data && !error) {
          data.forEach(p => {
            if (p.shop_data) {
              if (p.shop_data.custom_curriculum && Array.isArray(p.shop_data.custom_curriculum)) {
                CURRICULUM_SECTIONS.length = 0;
                CURRICULUM_SECTIONS.push(...p.shop_data.custom_curriculum);
                setCurriculumVersion(v => v + 1);
              }
              if (p.shop_data.global_shop_catalog && typeof p.shop_data.global_shop_catalog === "object") {
                setShopCatalog(p.shop_data.global_shop_catalog);
                localStorage.setItem("lisa_global_shop_catalog", JSON.stringify(p.shop_data.global_shop_catalog));
              }
            }
          });
        }
      } catch (e) {
        console.error("Failed to load custom config from Supabase:", e);
      }

      // Fetch announcements from dedicated public table (bypasses profile RLS — all users can read this)
      try {
        const { data: annData, error: annError } = await supabase
          .from("announcements")
          .select("*")
          .order("created_at", { ascending: true });

        if (annData && !annError) {
          const normalized = annData.map(a => ({ ...a, createdAt: a.createdAt || a.created_at }));
          setAdminAnnouncements(normalized);
          localStorage.setItem("lisa_admin_announcements", JSON.stringify(normalized));
        } else if (annError) {
          console.warn("Announcements table read error:", annError.message);
          try {
            const local = JSON.parse(localStorage.getItem("lisa_admin_announcements") || "[]");
            if (local && local.length > 0) setAdminAnnouncements(local);
          } catch (e) {}
        }
      } catch (e) {
        console.warn("Failed to load announcements:", e);
      }
    };
    fetchCustomConfig();
    const interval = setInterval(fetchCustomConfig, 3000);
    return () => clearInterval(interval);
  }, [session]);

  // Update document title dynamically based on the current page/state
  useEffect(() => {
    if (!session) {
      if (!selectedLanguage) {
        document.title = "LISA | Choose Language";
      } else if (recoveryMode) {
        document.title = "LISA | Reset Password";
      } else if (activeTab === "register") {
        document.title = "LISA | Create Learner Profile";
      } else if (activeTab === "forgot") {
        document.title = "LISA | Forgot Password";
      } else {
        document.title = "LISA | Login";
      }
    } else {
      if (assessmentState === "answering") {
        document.title = "LISA | Initial Assessment";
      } else if (assessmentState === "results") {
        document.title = "LISA | Assessment Results";
      } else if (lessonSession) {
        document.title = `LISA | Lesson: ${lessonSession.title || "Personalized Lesson"}`;
      } else {
        switch (dashboardTab) {
          case "dashboard":
            document.title = "LISA | Dashboard";
            break;
          case "learn":
            document.title = "LISA | Learning Path";
            break;
          case "practice":
            document.title = "LISA | Practice";
            break;
          case "profile":
            document.title = "LISA | Profile Settings";
            break;
          case "shop":
            document.title = "LISA | XP Shop";
            break;
          case "leaderboard":
            document.title = "LISA | Weekly Leaderboard";
            break;
          default:
            document.title = "LISA | AI Literacy Companion";
        }
      }
    }
  }, [session, selectedLanguage, recoveryMode, activeTab, assessmentState, lessonSession, dashboardTab]);

  // Protect admin tab and redirect on login
  useEffect(() => {
    if (session?.user?.email === "admin@gmail.com") {
      if (dashboardTab !== "admin") {
        setDashboardTab("admin");
      }
    } else if (dashboardTab === "admin") {
      setDashboardTab("dashboard");
    }
  }, [dashboardTab, session]);

  // Auto-play the dictation sentence when the writing section is opened
  useEffect(() => {
    if (assessmentState !== "answering") return;
    const cq = assessmentQuestionsList[currentStep];
    if (cq?.type !== "writing") return;
    const dText = cq.rawQuestion?.dictation || "";
    if (!dText) return;
    const id = setTimeout(() => speakText(dText), 400);
    return () => clearTimeout(id);
  }, [assessmentState, currentStep, selectedLanguage, assessmentQuestionsList]);

  // Auto-play Anna's first line of dialogue in chatComplete questions
  useEffect(() => {
    if (!lessonAiContent?.questions) return;
    const cq = lessonAiContent.questions[lessonStep];
    if (cq?.type === "chatComplete") {
      const scenario = cq.scenario || "";
      const lines = scenario.split("\n").map(l => l.trim()).filter(Boolean);
      const firstLine = lines[0];
      if (firstLine) {
        const match = firstLine.match(/^([^:]+):\s*(.*)$/);
        if (match) {
          const text = match[2].trim();
          const speaker = match[1].trim();
          const isUser = speaker.toUpperCase() === 'B' || speaker.toUpperCase() === 'YOU' || text.includes('___');
          if (!isUser) {
            const id = setTimeout(() => speakText(text, 0.9), 500);
            return () => clearTimeout(id);
          }
        }
      }
    }
  }, [lessonStep, lessonAiContent]);

  // Scroll main view to top when currentStep changes
  useEffect(() => {
    const mainView = document.querySelector(".dashboard-main-view");
    if (mainView) {
      mainView.scrollTo({ top: 0, behavior: "smooth" });
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  // Cancel active speech synthesis when moving to the next question or switching tabs
  useEffect(() => {
    if (window.responsiveVoice) {
      window.responsiveVoice.cancel();
    }
  }, [lessonStep, currentStep, activeTab]);
  const fetchProfile = async (userId) => {
    // Sync any pending changes if we are online
    syncPendingUpdates(userId);

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.warn("Could not fetch profile, setting default session:", error.message);
        const storedAssessment = getStoredAssessmentState(userId);
        const localExp = localStorage.getItem(`lisa_user_experience_level_${userId}`) || "I am completely new to this language";
        
        // Try reading cached profile first
        const cachedProfile = JSON.parse(localStorage.getItem(`lisa_profile_cache_${userId}`) || "{}");

        const defaultProfile = {
          id: userId,
          full_name: session?.user?.user_metadata?.full_name || session?.user?.email || "Learner",
          age: session?.user?.user_metadata?.age || 20,
          preferred_language: session?.user?.user_metadata?.preferred_language || selectedLanguage || "English",
          education_level: session?.user?.user_metadata?.education_level || "No Formal Education",
          experience_level: session?.user?.user_metadata?.experience_level || localExp,
          literacy_level: storedAssessment?.literacy_level ?? null,
          assessment_completed: storedAssessment?.assessment_completed ?? false,
          xp: parseInt(localStorage.getItem(`lisa_user_xp_${userId}`) || "0", 10) || 0,
          completed_lessons: JSON.parse(localStorage.getItem(`lisa_completed_lessons_${userId}`) || "[]"),
          attempts_history: JSON.parse(localStorage.getItem("lisa_attempts_history") || "[]"),
          ...cachedProfile
        };
        setProfile(defaultProfile);
        updateStreak(userId, defaultProfile);
      } else {
        const storedAssessment = getStoredAssessmentState(userId);
        const localExp = localStorage.getItem(`lisa_user_experience_level_${userId}`) || "I am completely new to this language";
        const mergedProfile = {
          ...data,
          experience_level: data.experience_level || localExp,
          literacy_level: data.literacy_level ?? storedAssessment?.literacy_level ?? null,
          assessment_completed: data.assessment_completed ?? storedAssessment?.assessment_completed ?? false
        };

        setProfile(mergedProfile);
        localStorage.setItem(`lisa_profile_cache_${userId}`, JSON.stringify(mergedProfile));
        updateStreak(userId, mergedProfile);

        // Load progress and preferences from the database, updating both React state and localStorage cache.
        // Merge the DB xp with the locally cached xp (taking the higher value) so that XP earned before a
        // profile sync (e.g. the initial assessment's 30 XP) is never lost if the DB write was delayed or failed.
        const dbXp = (mergedProfile.xp !== undefined && mergedProfile.xp !== null) ? Number(mergedProfile.xp) : 0;
        const localXp = parseInt(localStorage.getItem(`lisa_user_xp_${userId}`) || "0", 10) || 0;
        const syncedXp = Math.max(dbXp, localXp, userXp);
        if (syncedXp > 0) {
          setUserXp(syncedXp);
          localStorage.setItem(`lisa_user_xp_${userId}`, syncedXp);
        }
        if (mergedProfile.completed_lessons && Array.isArray(mergedProfile.completed_lessons) && mergedProfile.completed_lessons.length > 0) {
          const dbLessons = mergedProfile.completed_lessons;
          const storedLessons = localStorage.getItem(`lisa_completed_lessons_${userId}`);
          const localLessons = storedLessons ? JSON.parse(storedLessons) : [];
          const merged = Array.from(new Set([...dbLessons, ...localLessons]));
          setCompletedLessons(merged);
          localStorage.setItem(`lisa_completed_lessons_${userId}`, JSON.stringify(merged));
        }
        if (mergedProfile.attempts_history && Array.isArray(mergedProfile.attempts_history) && mergedProfile.attempts_history.length > 0) {
          const historyList = mergedProfile.attempts_history;
          setHistoryAttempts(historyList);
          localStorage.setItem("lisa_attempts_history", JSON.stringify(historyList));
        } else {
          const localHistory = JSON.parse(localStorage.getItem("lisa_attempts_history")) || [];
          if (localHistory.length > 0) {
            setHistoryAttempts(localHistory);
          }
        }
        if (mergedProfile.profile_bg) {
          setProfileBg(mergedProfile.profile_bg);
          localStorage.setItem(`lisa_profile_bg_${userId}`, mergedProfile.profile_bg);
        }
        // A custom photo is only applied once the learner reaches level 10.
        // Before that, the shop/emoji avatar (or initials) should be shown.
        const userLevel = calculateProgressiveLevel(mergedProfile, mergedProfile.completed_lessons);
        if (mergedProfile.avatar_url && userLevel >= 10) {
          setProfileAvatar(mergedProfile.avatar_url);
          localStorage.setItem(`lisa_profile_avatar_${userId}`, mergedProfile.avatar_url);
        }

        // Load per-user shop state from the database (owned items, equipped
        // theme/font/banner/avatar and active badges). Falls back to defaults
        // when nothing has been saved yet for this account.
        const sd = mergedProfile.shop_data;
        if (sd && typeof sd === "object") {
          setShopOwnedItems(Array.isArray(sd.ownedItems) ? sd.ownedItems : []);
          setShopTheme(sd.theme ?? "theme_gold");
          setShopFont(sd.font ?? null);
          setShopBanner(sd.banner ?? null);
          setShopCustomAvatar(sd.avatar ?? null);
          setProfileBadges(Array.isArray(sd.badges) ? sd.badges : []);
          if (sd.avatar) {
            const avStr = typeof sd.avatar === "string" ? sd.avatar : JSON.stringify(sd.avatar);
            localStorage.setItem(`lisa_profile_avatar_${userId}`, avStr);
            setProfileAvatar(sd.avatar);
          }
        }

        // Load per-user notification state (read/dismissed IDs). Prefer localStorage
        // so dismissed/read notifications survive page refreshes even if the
        // Supabase update fails or hasn't completed yet.
        const storedNotifData = localStorage.getItem(`lisa_notif_data_${userId}`);
        if (storedNotifData) {
          try {
            const parsed = JSON.parse(storedNotifData);
            // Never load ann_ IDs as dismissed — announcements must always be visible
            const loadedDismissed = (Array.isArray(parsed.dismissedNotifIds) ? parsed.dismissedNotifIds : []).filter(id => !id.startsWith("ann_"));
            const loadedRead = Array.isArray(parsed.readNotifIds) ? parsed.readNotifIds : [];
            setDismissedNotifIds(loadedDismissed);
            setReadNotifIds(loadedRead);
          } catch (e) {
            console.error("Could not parse stored notification data:", e);
          }
        } else {
          const nd = mergedProfile.notif_data;
          if (nd && typeof nd === "object") {
            const loadedDismissed = (Array.isArray(nd.dismissedNotifIds) ? nd.dismissedNotifIds : []).filter(id => !id.startsWith("ann_"));
            const loadedRead = Array.isArray(nd.readNotifIds) ? nd.readNotifIds : [];
            setDismissedNotifIds(loadedDismissed);
            setReadNotifIds(loadedRead);
          }
        }

        // Sync locally selected interface language to database profile
        const localLang = localStorage.getItem("lisa_lang") || selectedLanguage || "English";
        if (localLang && mergedProfile.preferred_language !== localLang) {
          await supabase.from("profiles").update({ preferred_language: localLang }).eq("id", userId);
          setProfile(prev => prev ? { ...prev, preferred_language: localLang } : null);
          setSelectedLanguage(localLang);
        } else if (mergedProfile.preferred_language) {
          setSelectedLanguage(mergedProfile.preferred_language);
          localStorage.setItem("lisa_lang", mergedProfile.preferred_language);
        }

        // Sync learning language to database profile
        const localLearnLang = localStorage.getItem("lisa_learning_lang") || learningLanguage || "English";
        if (mergedProfile.learning_language) {
          setLearningLanguage(mergedProfile.learning_language);
          localStorage.setItem("lisa_learning_lang", mergedProfile.learning_language);
        } else if (localLearnLang) {
          await supabase.from("profiles").update({ learning_language: localLearnLang }).eq("id", userId);
          setProfile(prev => prev ? { ...prev, learning_language: localLearnLang } : null);
          setLearningLanguage(localLearnLang);
        }
      }
    } catch (err) {
      console.error("Unexpected error fetching profile:", err);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleLanguageSelect = async (lang) => {
    setSelectedLanguage(lang);
    localStorage.setItem("lisa_lang", lang);
    if (session?.user) {
      try {
        const { error } = await supabase
          .from("profiles")
          .update({ preferred_language: lang })
          .eq("id", session.user.id);
        if (!error) {
          setProfile(prev => prev ? { ...prev, preferred_language: lang } : null);
        }
      } catch (err) {
        console.error("Error saving profile interface language preference:", err);
      }
    }
  };

  const handleLearningLanguageSelect = async (lang) => {
    setLearningLanguage(lang);
    localStorage.setItem("lisa_learning_lang", lang);
    if (session?.user) {
      try {
        const { error } = await supabase
          .from("profiles")
          .update({ learning_language: lang })
          .eq("id", session.user.id);
        if (!error) {
          setProfile(prev => prev ? { ...prev, learning_language: lang } : null);
        }
      } catch (err) {
        console.error("Error saving profile learning language preference:", err);
      }
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    const formData = new FormData(event.currentTarget);
    const email = formData.get("loginEmail");
    const password = formData.get("loginPassword");

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage(`Login error: ${error.message}`);
    } else {
      setMessage(t("successLogin"));
    }
    setSubmitting(false);
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const email = formData.get("registerEmail");
    const password = formData.get("registerPassword");
    const confirmPassword = formData.get("confirmPassword");
    const fullName = formData.get("fullName");
    const age = parseInt(formData.get("age"), 10);
    const interfaceLang = formData.get("interfaceLanguage") || selectedLanguage || "English";
    const learnLang = formData.get("learningLanguage") || learningLanguage || "English";
    const educationLevel = formData.get("educationLevel");
    const experienceLevel = formData.get("experienceLevel") || "I am completely new to this language";

    if (password !== confirmPassword) {
      setMessage(t("passwordsDoNotMatch"));
      setSubmitting(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          age: age,
          preferred_language: interfaceLang,
          learning_language: learnLang,
          education_level: educationLevel,
          experience_level: experienceLevel,
        },
      },
    });

    if (error) {
      setMessage(`Registration error: ${error.message}`);
      setSubmitting(false);
      return;
    }

    if (data.user) {
      setSelectedLanguage(interfaceLang);
      localStorage.setItem("lisa_lang", interfaceLang);
      setLearningLanguage(learnLang);
      localStorage.setItem("lisa_learning_lang", learnLang);

      if (data.session) {
        setMessage(t("successAccountCreated"));
        localStorage.setItem(`lisa_user_experience_level_${data.user.id}`, experienceLevel);
        const newProfile = {
          id: data.user.id,
          full_name: fullName,
          age,
          preferred_language: interfaceLang,
          learning_language: learnLang,
          education_level: educationLevel,
          experience_level: experienceLevel,
          literacy_level: null,
          assessment_completed: false
        };
        setProfile(newProfile);
        updateStreak(data.user.id, newProfile);
      } else {
        setMessage(t("checkEmailConfirm"));
      }
    }
    setSubmitting(false);
  };

  const handleForgotPassword = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    const formData = new FormData(event.currentTarget);
    const email = formData.get("forgotEmail");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage(t("successForgotPasswordLink"));
    }
    setSubmitting(false);
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    const formData = new FormData(event.currentTarget);
    const password = formData.get("resetPassword");

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setMessage(`Error resetting password: ${error.message}`);
    } else {
      await supabase.auth.signOut();
      setRecoveryMode(false);
      setActiveTab("login");
      setMessage(t("successResetPassword"));
    }
    setSubmitting(false);
  };

  const handleSignOut = async () => {
    setSubmitting(true);
    const userId = session?.user?.id;
    await supabase.auth.signOut();
    setDismissedNotifIds([]);
    setReadNotifIds([]);
    if (userId) {
      localStorage.removeItem(`lisa_notif_data_${userId}`);
    }
    setMessage(t("successSignOut"));
    setTimeout(() => setMessage(""), 3000);
    setSubmitting(false);
  };

  const handleDeleteAccount = async () => {
    if (!session?.user) return;
    setSubmitting(true);
    setDeleteError("");
    const userId = session.user.id;
    try {
      // Remove the user's profile row (cascades to the auth user via FK)
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userId);
      if (profileError) throw profileError;

      // Clean up local app data tied to this user
      const today = new Date().toLocaleDateString("en-CA");
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith(`lisa_`) && key.includes(userId)) {
          localStorage.removeItem(key);
        }
      });
      localStorage.removeItem(`lisa_user_xp_${userId}`);
      localStorage.removeItem(`lisa_daily_xp_${userId}_${today}`);
      localStorage.removeItem(`lisa_daily_time_${userId}_${today}`);
      localStorage.removeItem(`lisa_daily_lessons_${userId}_${today}`);
      localStorage.removeItem(`lisa_profile_bg_${userId}`);
      localStorage.removeItem(`lisa_profile_avatar_${userId}`);
      clearStoredAssessmentState(userId);

      // Sign the user out so the auth session is terminated
      await supabase.auth.signOut();

      setDeleteModalOpen(false);
      setDeleteConfirmText("");
      setProfile(null);
      setSession(null);
      setActiveTab("login");
      setDashboardTab("login");
      setMessage(t("profileDeleteSuccess"));
    } catch (err) {
      console.error("Delete account error:", err);
      setDeleteError(t("profileDeleteError"));
    } finally {
      setSubmitting(false);
    }
  };

  // Dynamic Assessment Shuffled Initialization (Taken Once)
  const handleStartInitialAssessment = () => {
    setSelectedAnswers({});
    setWritingAnswers({});
    setReadingAttempts({});
    setSpokenTranscript("");
    setManualTextFallback("");
    setMicError("");

    // Generates a dynamic test where the questions are shuffled
    // and MCQ options are shuffled as well.
    // Starting level is determined by age + experience level (not education level).
    const assessment = getRandomAssessment(
      profile?.age || 20,
      profile?.education_level || "No Formal Education",
      learningLanguage || "English",
      profile?.experience_level || "I am completely new to this language"
    );
    setAssessmentQuestionsList(assessment.questions);
    setCurrentStep(0);
    setAssessmentState("answering");
    // Store startLevel so submitInitialAssessment can use it for adaptive scoring
    sessionStorage.setItem("lisa_assessment_start_level", String(assessment.startLevel || 1));
  };

  // Speech Recognition Logic
  const startListening = (targetText) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicError("Speech recognition is not supported in this browser. Please use Chrome/Edge or type manually.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      // Use the learning target language locale for speech recognition
      let locale = getLocale(learningLanguage || "English");
      recognition.lang = locale;
      recognitionRef.current = recognition;

      recognition.onstart = () => {
        setIsListening(true);
        setSpokenTranscript("");
        setMicError("");
      };

      recognition.onerror = (e) => {
        console.error("Speech Recognition Error:", e);
        setMicError("Unable to access mic or understand audio. Please click again or try manual text entry.");
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSpokenTranscript(transcript);
        evaluateSpeechText(transcript, targetText);
      };

      recognition.start();
    } catch (err) {
      console.error("Failed to start speech recognition", err);
      setMicError("Mic error, please check connection.");
      setIsListening(false);
    }
  };

  const getLocale = (lang) => {
    if (lang === "Hindi") return "hi-IN";
    if (lang === "Kannada") return "kn-IN";
    if (lang === "Telugu") return "te-IN";
    if (lang === "Tamil") return "ta-IN";
    return "en-US";
  };

  const speakText = (text, rate, overrideLang) => {
    const lang = overrideLang || learningLanguage || "English";
    const r = typeof rate === "number" ? rate : 0.9;

    if (window.responsiveVoice) {
      window.responsiveVoice.cancel();
    }
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    // Split text into Latin and non-Latin segments (grouping non-ASCII words and their spaces together)
    const parts = text.split(/([^\x00-\x7F]+(?:\s+[^\x00-\x7F]+)*)/).filter(p => p.trim().length > 0);

    if (parts.length === 0) return;

    let index = 0;
 
     const speakSegment = () => {
       if (index >= parts.length) return;
 
       const segment = parts[index];
       const isNonAscii = /[^\x00-\x7F]/.test(segment);
       
       let segmentLang = lang;
       if (isNonAscii) {
         if (/[\u0C80-\u0CFF]/.test(segment)) segmentLang = "Kannada";
         else if (/[\u0900-\u097F]/.test(segment)) segmentLang = "Hindi";
         else if (/[\u0C00-\u0C7F]/.test(segment)) segmentLang = "Telugu";
         else if (/[\u0B80-\u0BFF]/.test(segment)) segmentLang = "Tamil";
         else segmentLang = learningLanguage || "English";
       }
       
       const segmentRate = typeof rate === "number" ? rate : (isNonAscii ? 0.8 : r);

      if (window.responsiveVoice) {
        let voiceName = "US English Female";
        if (segmentLang === "Hindi") voiceName = "Hindi Female";
        else if (segmentLang === "Kannada") voiceName = "Kannada Female";
        else if (segmentLang === "Telugu") voiceName = "Telugu Female";
        else if (segmentLang === "Tamil") voiceName = "Tamil Female";

        console.log(`Speaking segment ${index}: "${segment}" with voice "${voiceName}"`);
        window.responsiveVoice.speak(segment, voiceName, {
          pitch: 1,
          rate: segmentRate,
          onend: () => {
            index++;
            speakSegment();
          },
          onerror: (e) => {
            console.error("ResponsiveVoice error, trying fallback:", e);
            fallbackSpeechSynthesis(segment, getLocale(segmentLang), segmentRate, () => {
              index++;
              speakSegment();
            });
          }
        });
      } else {
        fallbackSpeechSynthesis(segment, getLocale(segmentLang), segmentRate, () => {
          index++;
          speakSegment();
        });
      }
    };

    speakSegment();
  };

  const fallbackSpeechSynthesis = (text, locale, rate, onend) => {
    if ("speechSynthesis" in window) {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = locale;
      if (typeof rate === "number") utterance.rate = rate;

      const voices = window.speechSynthesis.getVoices();
      const matchingVoice = voices.find(v =>
        v.lang.toLowerCase() === locale.toLowerCase() ||
        v.lang.toLowerCase().replace("_", "-") === locale.toLowerCase() ||
        v.lang.toLowerCase().startsWith(locale.split("-")[0].toLowerCase())
      );
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }

      utterance.onend = () => {
        if (typeof onend === "function") onend();
      };
      utterance.onerror = (e) => {
        console.error("TTS SpeechSynthesisUtterance Error:", e);
        if (typeof onend === "function") onend();
      };
      window.speechSynthesis.speak(utterance);
    } else {
      if (typeof onend === "function") onend();
    }
  };

  const getUserInitials = (name) => {
    if (!name) return "L";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };

  // Resolve the saved profile avatar (string url, emoji, or builder object)
  // into a normalized shape for rendering: { type, emoji, bg, shape, isPhoto }.
  const resolveProfileAvatar = (av) => {
    if (av && typeof av === "string" && av.startsWith("{")) {
      try { av = JSON.parse(av); } catch (e) { }
    }
    if (av && typeof av === "string" && av.startsWith("http")) {
      return { type: "photo", value: av, isPhoto: true };
    }
    if (av && typeof av === "object") {
      if (av.type === "builder") {
        return { type: "builder", emoji: av.emoji, bg: av.bg, shape: av.shape };
      }
      if (av.type === "emoji" && av.emoji) {
        return { type: "emoji", emoji: av.emoji };
      }
    }
    if (av && typeof av === "string" && /\p{Extended_Pictographic}/u.test(av)) {
      return { type: "emoji", emoji: av };
    }
    return null;
  };

  const AVATAR_SHAPE_STYLE = {
    circle: { borderRadius: "50%" },
    square: { borderRadius: "8px" },
    rounded: { borderRadius: "24px" },
  };

  // Persist the entire shop state for the current user to Supabase so that
  // unlocks, XP spend, equipped items, avatar and badges are tied to the
  // account (not to the browser/localStorage).
  const saveShopData = (partial = {}) => {
    const userId = session?.user?.id;
    if (!userId) return;
    const payload = {
      ownedItems: partial.ownedItems !== undefined ? partial.ownedItems : shopOwnedItems,
      theme: partial.theme !== undefined ? partial.theme : shopTheme,
      font: partial.font !== undefined ? partial.font : shopFont,
      banner: partial.banner !== undefined ? partial.banner : shopBanner,
      avatar: partial.avatar !== undefined ? partial.avatar : shopCustomAvatar,
      badges: partial.badges !== undefined ? partial.badges : profileBadges,
    };
    queueProfileUpdate({ shop_data: payload });
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  // String cleaning helper
  const cleanWord = (w) => {
    return w.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").toLowerCase().trim();
  };

  // Helper to trace LCS alignment for word-order highlights
  const getLCSMask = (targetWords, spokenWords) => {
    const m = targetWords.length;
    const n = spokenWords.length;
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (targetWords[i - 1] === spokenWords[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }
    const mask = new Array(m).fill(false);
    let i = m, j = n;
    while (i > 0 && j > 0) {
      if (targetWords[i - 1] === spokenWords[j - 1]) {
        mask[i - 1] = true;
        i--;
        j--;
      } else if (dp[i - 1][j] >= dp[i][j - 1]) {
        i--;
      } else {
        j--;
      }
    }
    return mask;
  };

  const evaluateSpeechText = (transcript, targetText) => {
    const targetWords = targetText.split(/\s+/).filter(Boolean);
    const cleanedTargetWords = targetWords.map(cleanWord);
    const spokenWords = transcript.split(/\s+/).filter(Boolean).map(cleanWord);

    const scores = getLCSMask(cleanedTargetWords, spokenWords);
    const matchedCount = scores.filter(Boolean).length;

    if (lessonSession) {
      setLessonSession(prev => ({
        ...prev,
        spokenText: transcript,
        matchedCount,
        totalWords: targetWords.length,
        scores
      }));
    } else {
      setReadingAttempts(prev => ({
        ...prev,
        [currentStep]: {
          transcript,
          matchedCount,
          totalWords: targetWords.length,
          scores
        }
      }));
    }
  };

  // Fallback Text Match
  const handleManualTextSubmit = (targetText) => {
    if (!manualTextFallback.trim()) return;
    evaluateSpeechText(manualTextFallback, targetText);
  };

  const handleNextStep = () => {
    if (currentStep < assessmentQuestionsList.length - 1) {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }

      // Dynamic question adaptation: check block performance on the fly
      let updatedList = [...assessmentQuestionsList];
      let questionsChanged = false;

      if (currentStep === 2) {
        // Just finished Block A (indices 0, 1, 2)
        const scoreA = [0, 1, 2].filter(
          (i) => selectedAnswers[i] === assessmentQuestionsList[i].correctIndex
        ).length;

        const startLevel = assessmentQuestionsList[0]?.blockLevel || 1;
        const desiredLevelForB = scoreA === 3 ? Math.min(startLevel + 1, 5) : startLevel;
        const currentLevelForB = assessmentQuestionsList[3]?.blockLevel;

        if (currentLevelForB !== desiredLevelForB) {
          const newBlockB = getQuestionsForBlock(
            profile?.age || 20,
            learningLanguage || "English",
            desiredLevelForB,
            3,
            new Set([...assessmentQuestionsList].map((q) => q.id)),
            "B"
          );
          if (newBlockB.length === 3) {
            updatedList.splice(3, 3, ...newBlockB);
            const clearedAnswers = { ...selectedAnswers };
            [3, 4, 5].forEach(i => delete clearedAnswers[i]);
            setSelectedAnswers(clearedAnswers);
            questionsChanged = true;
          }
        }
      } else if (currentStep === 5) {
        // Just finished Block B (indices 3, 4, 5)
        const scoreB = [3, 4, 5].filter(
          (i) => selectedAnswers[i] === assessmentQuestionsList[i].correctIndex
        ).length;

        const blockBLevel = assessmentQuestionsList[3]?.blockLevel || 1;
        const desiredLevelForC = scoreB === 3 ? Math.min(blockBLevel + 1, 5) : blockBLevel;
        const currentLevelForC = assessmentQuestionsList[6]?.blockLevel;

        if (currentLevelForC !== desiredLevelForC) {
          const newBlockC = getQuestionsForBlock(
            profile?.age || 20,
            learningLanguage || "English",
            desiredLevelForC,
            4,
            new Set([...assessmentQuestionsList].map((q) => q.id)),
            "C"
          );
          if (newBlockC.length === 4) {
            updatedList.splice(6, 4, ...newBlockC);
            const clearedAnswers = { ...selectedAnswers };
            [6, 7, 8, 9].forEach(i => delete clearedAnswers[i]);
            setSelectedAnswers(clearedAnswers);
            questionsChanged = true;
          }
        }
      }

      if (questionsChanged) {
        setAssessmentQuestionsList(updatedList);
      }

      setCurrentStep(currentStep + 1);
      setSpokenTranscript("");
      setManualTextFallback("");
      setMicError("");
    }
  };

  // Evaluate & Diagnose — 6-Skill Assessment Engine
  const submitInitialAssessment = async () => {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setSubmitting(true);

    // Compute per-skill scores from all question answers
    const skillScores = computeSkillScores(
      assessmentQuestionsList,
      selectedAnswers,
      readingAttempts,
      writingAnswers
    );

    // Use adaptive block scoring to determine the diagnosed level.
    // The starting level is recovered from sessionStorage (set when the assessment was initialized).
    const startLevel = parseInt(sessionStorage.getItem("lisa_assessment_start_level") || "1", 10);
    const adaptiveLevel = computeAdaptiveDiagnosedLevel(assessmentQuestionsList, selectedAnswers, startLevel);

    // diagnosedLevel blends adaptive block score with skill-score classification.
    // Adaptive score takes priority since it directly reflects block performance.
    const skillBasedLevel = classifyProficiency(skillScores);
    const diagnosedLevel = adaptiveLevel;

    // Generate learning path from weak skills
    const learningPath = generateLearningPath(skillScores);
    const weakAreas = getWeakSkills(skillScores);
    const strongAreas = getStrongSkills(skillScores);
    const strongSkillKeys = getStrongSkillKeys(skillScores);
    const weakSkillKeys = getWeakSkillKeys(skillScores);

    // Compute marks based on generated questions: 1 point per MCQ, 5 points per reading/writing task (Total 40)
    let compMarks = 0;
    let readingMarks = 0;
    let writingMarks = 0;
    let maxCompMarks = 0;
    let maxReadingMarks = 0;
    let maxWritingMarks = 0;

    assessmentQuestionsList.forEach((q, idx) => {
      if (q.type === "comprehension") {
        maxCompMarks += 1;
        if (selectedAnswers[idx] === q.correctIndex) compMarks += 1;
      } else if (q.type === "reading") {
        maxReadingMarks += 5;
        const attempt = readingAttempts[idx];
        const ratio = (attempt && attempt.totalWords > 0) ? attempt.matchedCount / attempt.totalWords : 0;
        readingMarks += Math.round(ratio * 5);
      } else if (q.type === "writing") {
        maxWritingMarks += 5;
        const text = writingAnswers[idx] || "";
        const res = q.evaluator ? q.evaluator(text) : { score: 0 };
        writingMarks += Math.round((res.score / 10) * 5);
      }
    });

    const maxScore = maxCompMarks + maxReadingMarks + maxWritingMarks;
    const totalMarks = compMarks + readingMarks + writingMarks;
    const overallPercent = Math.round((totalMarks / (maxScore || 1)) * 100);

    // Count discrete right answers from the diagnostic (comprehension MCQs)
    const today = new Date().toLocaleDateString("en-CA");
    let nextDailyCorrect = dailyCorrectAnswers;
    if (compMarks > 0) {
      recordDailyCorrect(compMarks);
      nextDailyCorrect = dailyCorrectAnswers + compMarks;
    }

    const assessmentXp = 30;
    const nextUserXp = userXp + assessmentXp;
    setUserXp(nextUserXp);
    localStorage.setItem(`lisa_user_xp_${session.user.id}`, String(nextUserXp));

    const nextDailyXp = dailyXp + assessmentXp;
    setDailyXp(nextDailyXp);
    localStorage.setItem(`lisa_daily_xp_${session.user.id}_${today}`, String(nextDailyXp));

    recordWeeklyXp(assessmentXp);

    try {
      // Save to history
      const attemptResult = {
        date: new Date().toLocaleDateString(),
        type: "Diagnostic Evaluation",
        score: totalMarks,
        maxScore: maxScore,
        percentage: overallPercent,
        level: diagnosedLevel,
        skills: {
          reading: skillScores.reading_ability || 0,
          comprehension: skillScores.reading_comprehension || 0,
          writing: skillScores.writing_ability || 0,
          letter_recognition: skillScores.letter_recognition || 0,
          word_recognition: skillScores.word_recognition || 0,
          vocabulary_recognition: skillScores.vocabulary_recognition || 0,
          sentence_understanding: skillScores.sentence_understanding || 0,
          reading_comprehension: skillScores.reading_comprehension || 0,
          practical_literacy: skillScores.practical_literacy || 0,
          reading_ability: skillScores.reading_ability || 0,
          writing_ability: skillScores.writing_ability || 0,
        },
        skillScores,
        weakAreas,
        strongAreas,
        strongSkillKeys,
        weakSkillKeys,
        learningPath,
        passed: overallPercent >= 40
      };

      const updatedHistory = [attemptResult, ...historyAttempts];
      setHistoryAttempts(updatedHistory);
      localStorage.setItem("lisa_attempts_history", JSON.stringify(updatedHistory));

      // Update Supabase profile
      try {
        const { error: updateErr } = await supabase.from("profiles").update({
          literacy_level: diagnosedLevel,
          assessment_completed: true,
          skill_scores: skillScores,
          attempts_history: updatedHistory,
          xp: nextUserXp,
          daily_xp: nextDailyXp,
          daily_correct_answers: nextDailyCorrect,
          daily_quest_date: today
        }).eq("id", session.user.id);
        
        if (updateErr) {
          console.warn("First update failed, retrying without skill_scores column:", updateErr.message);
          await supabase.from("profiles").update({
            literacy_level: diagnosedLevel,
            assessment_completed: true,
            attempts_history: updatedHistory,
            xp: nextUserXp,
            daily_xp: nextDailyXp,
            daily_correct_answers: nextDailyCorrect,
            daily_quest_date: today
          }).eq("id", session.user.id);
        }
      } catch (dbErr) {
        console.warn("Direct DB update failed, trying fallback:", dbErr);
        await supabase.from("profiles").update({
          literacy_level: diagnosedLevel,
          assessment_completed: true,
          attempts_history: updatedHistory,
          xp: nextUserXp,
          daily_xp: nextDailyXp,
          daily_correct_answers: nextDailyCorrect,
          daily_quest_date: today
        }).eq("id", session.user.id);
      }

      // Update local state
      setProfile(prev => ({
        ...prev,
        literacy_level: diagnosedLevel,
        assessment_completed: true,
        skill_scores: skillScores,
        learning_path: learningPath
      }));

      // Store skill scores + learning path in localStorage
      setStoredAssessmentState(session.user.id, {
        literacy_level: diagnosedLevel,
        assessment_completed: true,
        skill_scores: skillScores,
        learning_path: learningPath
      });

      setDashboardTab("dashboard");
      setAssessmentState("results");
    } catch (err) {
      console.error("Error updating test results:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveAvatarBuilder = async (builderObj) => {
    if (!session?.user?.id) return;
    setSubmitting(true);
    try {
      const avatarStr = JSON.stringify(builderObj);
      setProfileAvatar(builderObj);
      localStorage.setItem(`lisa_profile_avatar_${session.user.id}`, avatarStr);
      
      const { data: profileData } = await supabase
        .from("profiles")
        .select("shop_data")
        .eq("id", session.user.id)
        .single();
        
      const currentShopData = profileData?.shop_data || {};
      const updatedShopData = {
        ...currentShopData,
        avatar: builderObj
      };
      
      await supabase
        .from("profiles")
        .update({
          avatar_url: avatarStr,
          avatar_emoji: builderObj.emoji,
          shop_data: updatedShopData
        })
        .eq("id", session.user.id);
        
      alert("Avatar saved successfully! ✨");
    } catch (e) {
      console.error("Avatar save error:", e);
    } finally {
      setSubmitting(false);
    }
  };

  // Profile Edit Submission
  const handleSaveProfileEdit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: editFullName,
          age: parseInt(editAge, 10),
          preferred_language: editPreferredLang,
          learning_language: editLearningLang,
          education_level: editEdLevel,
          experience_level: editExpLevel
        })
        .eq("id", session.user.id);

      if (error) {
        console.warn("DB profile save error, caching:", error.message);
      }

      localStorage.setItem(`lisa_user_experience_level_${session.user.id}`, editExpLevel);

      setProfile(prev => ({
        ...prev,
        full_name: editFullName,
        age: parseInt(editAge, 10),
        preferred_language: editPreferredLang,
        learning_language: editLearningLang,
        education_level: editEdLevel,
        experience_level: editExpLevel
      }));
      setSelectedLanguage(editPreferredLang);
      localStorage.setItem("lisa_lang", editPreferredLang);
      setLearningLanguage(editLearningLang);
      localStorage.setItem("lisa_learning_lang", editLearningLang);
      setEditingProfile(false);
    } catch (err) {
      console.error("Profile edit error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !session?.user?.id) return;

    try {
      setSubmitting(true);
      const userId = session.user.id;
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/avatar_${Date.now()}.${fileExt}`;

      // Upload file to Supabase Storage bucket 'avatars'
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile avatar_url in the database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId);

      if (updateError) {
        throw updateError;
      }

      // Update states
      setProfileAvatar(publicUrl);
      setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null);
      localStorage.setItem(`lisa_profile_avatar_${userId}`, publicUrl);
    } catch (error) {
      console.error("Error uploading avatar:", error.message);
      alert("Failed to upload avatar: " + error.message + "\n\nPlease ensure you have created a public bucket named 'avatars' in your Supabase storage.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartEdit = () => {
    setEditFullName(profile?.full_name || "");
    setEditAge(profile?.age || "");
    setEditPreferredLang(profile?.preferred_language || selectedLanguage || "English");
    setEditEdLevel(profile?.education_level || "No Formal Education");
    setEditExpLevel(profile?.experience_level || "I am completely new to this language");
    setEditingProfile(true);
  };

  const handleResetAssessmentStatus = async () => {
    try {
      const primaryUpdate = await supabase
        .from("profiles")
        .update({
          education_level: "No Formal Education",
          literacy_level: null,
          assessment_completed: false,
          attempts_history: []
        })
        .eq("id", session.user.id);

      let error = primaryUpdate.error;

      if (error) {
        console.warn("Primary reset failed, retrying with guaranteed schema fields:", error.message);
        const retry = await supabase
          .from("profiles")
          .update({ education_level: "No Formal Education" })
          .eq("id", session.user.id);
        error = retry.error;
      }

      if (error) throw error;

      setProfile(prev => prev ? {
        ...prev,
        education_level: "No Formal Education",
        literacy_level: null,
        assessment_completed: false,
        attempts_history: []
      } : null);
      clearStoredAssessmentState(session.user.id);
      setHistoryAttempts([]);
      localStorage.removeItem("lisa_attempts_history");
      setAssessmentState("not_started");
      alert("Diagnostic status reset successfully! You will now see the initial assessment welcome screen.");
    } catch (err) {
      console.error("Error resetting profile:", err);
      alert("Failed to reset profile: " + err.message);
    }
  };

  const handleResetLessons = async () => {
    if (!session?.user?.id) return;
    const userId = session.user.id;
    try {
      await supabase
        .from("profiles")
        .update({
          completed_lessons: [],
          xp: 0
        })
        .eq("id", userId);
    } catch (dbErr) {
      console.warn("Could not reset lessons in database:", dbErr);
    }
    setCompletedLessons([]);
    setUserXp(0);
    localStorage.removeItem(`lisa_completed_lessons_${userId}`);
    localStorage.removeItem(`lisa_user_xp_${userId}`);
    alert("Completed lessons and XP have been reset successfully!");
  };

  // Skill calculations for Progress Analytics
  const calculateSkillProficiency = (skill) => {
    let totalScore = 0;
    let count = 0;
    historyAttempts.forEach((attempt) => {
      if (attempt.skills && attempt.skills[skill] !== undefined) {
        totalScore += attempt.skills[skill];
        count++;
      }
    });
    return count > 0 ? Math.round(totalScore / count) : 0;
  };

  // initial loading spinner
  if (initialLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p style={{ fontWeight: 600, color: "var(--muted)", margin: 0 }}>
          {t("loadingMessage")}
        </p>
      </div>
    );
  }

  // Development-mode AI toggle button
  const renderAiToggle = () => (
    <div className="ai-toggle-container" key="ai-toggle" title={aiEnabled ? "AI ON — lessons & word of day use AI" : "AI OFF — lessons & word of day use fallback"}>
      <button
        type="button"
        className={`ai-toggle-btn ${aiEnabled ? "ai-on" : "ai-off"}`}
        onClick={toggleAiMode}
        aria-pressed={aiEnabled}
        aria-label={aiEnabled ? "Turn AI off (development mode)" : "Turn AI on"}
      >
        <span className="ai-toggle-dot" />
        <span className="ai-toggle-label">{aiEnabled ? "AI ON" : "AI OFF"}</span>
      </button>
    </div>
  );

  // Dark Mode Toggle Button
  const renderThemeToggle = () => (
    <div className="theme-toggle-container" key="theme-toggle">
      <button
        type="button"
        className="theme-toggle-btn"
        onClick={toggleTheme}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      >
        {isDark ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        )}
      </button>
    </div>
  );

  // Language Dropdown Render
  const renderLanguageDropdown = (isRelative = false) => (
    <div className={isRelative ? "lang-selector-relative" : "lang-selector-container"}>
      <button
        className="lang-selector-trigger"
        onClick={() => setLangDropdownOpen(!langDropdownOpen)}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          <path d="M2 12h20" />
        </svg>
        <span>{t("changeLanguageBtn")}</span>
      </button>
      {langDropdownOpen && (
        <div className="lang-selector-dropdown" style={{ minWidth: "220px", padding: "12px" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", color: "var(--muted)", marginBottom: "6px" }}>
            {t("interfaceLanguage")}
          </div>
          {[
            { key: "English", native: "English" },
            { key: "Hindi", native: "हिन्दी" },
            { key: "Kannada", native: "ಕನ್ನಡ" },
            { key: "Telugu", native: "తెలుగు" },
            { key: "Tamil", native: "தமிழ்" },
          ].map((lang) => (
            <button
              key={`ui_${lang.key}`}
              className={`lang-dropdown-item ${selectedLanguage === lang.key ? "active" : ""}`}
              onClick={() => {
                handleLanguageSelect(lang.key);
                setLangDropdownOpen(false);
              }}
            >
              {lang.native}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  // Profile settings dropdown menu render helper
  const renderProfileDropdown = () => {
    const handleToggle = () => {
      if (!profileDropdownOpen) {
        setEditFullName(profile?.full_name || "");
        setEditAge(profile?.age || "");
        setEditPreferredLang(profile?.preferred_language || selectedLanguage || "English");
        setEditLearningLang(profile?.learning_language || learningLanguage || "English");
        setEditEdLevel(profile?.education_level || "No Formal Education");
        setEditExpLevel(profile?.experience_level || "I am completely new to this language");
      }
      setProfileDropdownOpen(!profileDropdownOpen);
    };

    return (
      <div className="profile-dropdown-container" ref={profileDropdownRef}>
        <button
          type="button"
          className="profile-dropdown-trigger"
          onClick={handleToggle}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--panel-strong)',
            border: '1px solid var(--line)',
            borderRadius: '20px',
            padding: '6px 16px',
            fontWeight: '600',
            cursor: 'pointer',
            color: 'var(--text)'
          }}
        >
          <span className="profile-avatar-mini" style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: 'var(--accent)',
            color: 'white',
            display: 'grid',
            placeItems: 'center',
            fontSize: '0.75rem',
            fontWeight: '800',
            overflow: 'hidden'
          }}>
            {(() => {
              const resolved = resolveProfileAvatar(profileAvatar);
              if (resolved?.type === "emoji") return <span style={{ fontSize: "0.95rem" }}>{resolved.emoji}</span>;
              if (resolved?.type === "builder") {
                const shape = AVATAR_SHAPE_STYLE[resolved.shape] || AVATAR_SHAPE_STYLE.circle;
                return <span style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", background: resolved.bg, ...shape, fontSize: "0.95rem" }}>{resolved.emoji}</span>;
              }
              if (resolved?.type === "photo") {
                return <img src={resolved.value} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />;
              }
              return getUserInitials(profile?.full_name);
            })()}
          </span>
          <span className="profile-trigger-text">{t("myProfile") || "My Profile"}</span>
          <span className="dropdown-arrow" style={{ fontSize: '0.8rem', opacity: 0.7 }}>▼</span>
        </button>
        {profileDropdownOpen && (
          <div className="profile-dropdown-menu profile-dropdown-card" style={{ right: 0, padding: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 16px 0', color: 'var(--text)' }}>
              {t("profileUpdateSettings")}
            </h3>
            <form onSubmit={(e) => {
              handleSaveProfileEdit(e);
              setProfileDropdownOpen(false);
            }} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label className="profile-dropdown-label">
                {t("fullName")}
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  style={{ width: "100%", boxSizing: "border-box" }}
                />
              </label>

              <label className="profile-dropdown-label">
                {t("age")}
                <input
                  type="number"
                  min="5"
                  max="120"
                  required
                  value={editAge}
                  onChange={(e) => setEditAge(e.target.value)}
                  style={{ width: "100%", boxSizing: "border-box" }}
                />
              </label>

              <label className="profile-dropdown-label">
                {t("interfaceLanguage")}
                <select
                  required
                  value={editPreferredLang}
                  onChange={(e) => setEditPreferredLang(e.target.value)}
                  style={{ width: "100%", boxSizing: "border-box" }}
                >
                  {languages.map((l) => (
                    <option key={l} value={l}>{t(l + "Option")}</option>
                  ))}
                </select>
              </label>

              <label className="profile-dropdown-label">
                {t("learningLanguage")}
                <select
                  required
                  value={editLearningLang}
                  onChange={(e) => setEditLearningLang(e.target.value)}
                  style={{ width: "100%", boxSizing: "border-box" }}
                >
                  {languages.map((l) => (
                    <option key={l} value={l}>{t(l + "Option")}</option>
                  ))}
                </select>
              </label>

              <label className="profile-dropdown-label">
                {t("profileEducationStatus")}
                <select
                  required
                  value={editEdLevel}
                  onChange={(e) => setEditEdLevel(e.target.value)}
                  style={{ width: "100%", boxSizing: "border-box" }}
                >
                  {educationLevels.map((ed) => (
                    <option key={ed} value={ed}>{t(ed + "Option")}</option>
                  ))}
                </select>
              </label>

              <label className="profile-dropdown-label">
                {t("profileExperienceStatus")}
                <select
                  required
                  value={editExpLevel}
                  onChange={(e) => setEditExpLevel(e.target.value)}
                  style={{ width: "100%", boxSizing: "border-box" }}
                >
                  {experienceLevels.map((exp) => (
                    <option key={exp} value={exp}>{t(experienceLevelOptionKeys[exp] || exp)}</option>
                  ))}
                </select>
              </label>

              <button
                type="submit"
                className="primary-btn"
                style={{ width: '100%', padding: '10px', borderRadius: '12px', background: 'var(--accent)', color: '#fff', border: 'none', fontWeight: '700', cursor: 'pointer', marginTop: '4px' }}
                disabled={submitting}
              >
                {submitting ? t("profileSaving") : t("profileSaveChanges")}
              </button>
            </form>

            <hr style={{ border: '0', borderTop: '1px solid var(--line)', margin: '16px 0 12px 0' }} />

            <button
              type="button"
              className="profile-dropdown-item logout"
              style={{ color: '#ef4444', background: 'rgba(198, 95, 45, 0.08)', justifyContent: 'center', width: '100%', padding: '10px 0' }}
              onClick={() => {
                setProfileDropdownOpen(false);
                handleSignOut();
              }}
            >
              {t("logout") || "Log Out"}
            </button>
          </div>
        )}
      </div>
    );
  };

  // Recovery Mode Form
  if (recoveryMode) {
    return (
      <main className="shell">
        <div className="brand-logo-top">LISA</div>
        {renderLanguageDropdown()}
        {renderThemeToggle()}
        <section className="hero-panel">
          <h1>{t("resetAccountPassword")}</h1>
          <p className="hero-copy">{t("regainAccessCopy")}</p>
        </section>
        <section className="auth-panel">
          <div className="auth-card">
            <form className="auth-form active" onSubmit={handleResetPassword}>
              <h2>{t("createNewPassword")}</h2>
              <p>{t("typeSecurePassword")}</p>
              <label>
                {t("newPassword")}
                <input
                  type="password"
                  name="resetPassword"
                  placeholder={t("newPasswordPlaceholder")}
                  autoComplete="new-password"
                  required
                  disabled={submitting}
                />
              </label>
              <button type="submit" className="primary-btn" disabled={submitting}>
                {submitting ? t("resettingPassword") : t("updatePassword")}
              </button>
            </form>
            {message ? <p className="status-message">{message}</p> : null}
          </div>
        </section>
      </main>
    );
  }

  // Dashboard / Assessment Screens when Logged In
  if (session) {
    const userLevel = getLiteracyLevel(profile);
    const hasDiagnosed = hasCompletedAssessment(profile, session?.user?.id);
    const currentLevelNum = calculateProgressiveLevel(profile, completedLessons);
    const currentLang = selectedLanguage || "English";

    const storedSkills = (() => { try { const s = getStoredAssessmentState(session?.user?.id); return s?.skill_scores || profile?.skill_scores || profile?.attempts_history?.[0]?.skillScores || {}; } catch { return {}; } })();
    const weakSkillLabels = getWeakSkills(storedSkills);
    const pathRecommendations = generateLearningPath(storedSkills);
    const recommendedSectionIds = pathRecommendations.map(p => p.sectionId);
    const recommendedSections = CURRICULUM_SECTIONS.filter(section =>
      recommendedSectionIds.includes(section.id)
    );

    const activeDashboardSections = (showPersonalizedPath && recommendedSections.length > 0)
      ? recommendedSections
      : CURRICULUM_SECTIONS;

    // Build flat list of all lessons with their section/unit info
    const flatLessonsWithLocation = [];
    const sections = CURRICULUM_SECTIONS;
    sections.forEach((sec, secIdx) => {
      sec.units.forEach((uni, uniIdx) => {
        uni.lessons.forEach((les, lesIdx) => {
          flatLessonsWithLocation.push({
            lesson: les,
            section: sec,
            unit: uni,
            secIdx,
            uniIdx,
            lesIdx
          });
        });
      });
    });

    // Build flat list of all lessons in recommended sections for personalized path continue learning
    const flatPersonalizedLessons = [];
    recommendedSections.forEach((sec, secIdx) => {
      sec.units.forEach((uni, uniIdx) => {
        uni.lessons.forEach((les, lesIdx) => {
          flatPersonalizedLessons.push({
            lesson: les,
            section: sec,
            unit: uni,
            secIdx, // index in activeDashboardSections
            uniIdx,
            lesIdx
          });
        });
      });
    });

    // Determine starting lesson ID based on diagnosed literacy level (consistent with Learn tab)
    const diagnosedLevel = profile?.literacy_level || 1;
    const startingLessonId = (() => {
      if (diagnosedLevel === 2) return "s2u1l1";
      if (diagnosedLevel === 3) return "s3u1l1";
      if (diagnosedLevel === 4) return "s5u1l1";
      if (diagnosedLevel === 5) return "s7u1l1";
      return "s1u1l1";
    })();

    // Find the active resumed lesson item
    const activeItem = (showPersonalizedPath && flatPersonalizedLessons.length > 0)
      ? (flatPersonalizedLessons.find(item => !completedLessons.includes(item.lesson.id)) || flatPersonalizedLessons[0])
      : (flatLessonsWithLocation.slice(0).find(item => !completedLessons.includes(item.lesson.id))
        || flatLessonsWithLocation[0]);

    const currentUnit = activeItem?.lesson;
    const currentUnitPos = {
      sectionIdx: activeItem?.secIdx ?? 0,
      unitIdx: activeItem?.uniIdx ?? 0,
      lessonIdx: activeItem?.lesIdx ?? 0
    };



    const speakWord = (text) => {
      speakText(text, 0.9, learningLanguage || "English");
    };

    if (session?.user?.email !== "admin@gmail.com" && (!hasDiagnosed || assessmentState !== "not_started")) {
      return (
        <div className="dashboard-container">
          {showOfflineBanner && (
            <div className="offline-banner">
              📡 You are currently offline. Progress is saved locally and will sync once you are back online!
            </div>
          )}
          {/* Navigation Top Bar Header */}
          <header className="dashboard-header" style={{ background: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '16px 32px', borderBottom: '1px solid var(--line)' }}>
            {/* Brand Logo & Info (same design as login page) */}
            <div className="brand-logo-top dashboard-brand">
              LISA
              <span className="brand-logo-tagline">Literacy Intelligence Support Assistant</span>
            </div>

            {/* Right User Actions Area */}
            <div className="dashboard-user-actions" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              {renderLanguageDropdown(true)}
              {renderThemeToggle()}
              {renderProfileDropdown()}
            </div>
          </header>

          {/* Main Content Area */}
          <div className="dashboard-content-area" style={{ flexGrow: 1 }}>
            <main className="dashboard-main-view centered-layout">
              {/* 1. Welcome state when not diagnosed and assessment not started */}
              {!hasDiagnosed && assessmentState === "not_started" && (
                <div className="diagnostic-welcome-wrapper" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
                  <div className="welcome-banner welcome-banner-mascot">
                    <img
                      src="/as1.png"
                      alt="LISA mascot"
                      className="welcome-mascot"
                    />
                    <div className="welcome-banner-text">
                      <h1>{t("hello")}, {profile?.full_name || "Learner"} 👋</h1>
                      <h2 style={{ fontSize: "1.3rem", marginTop: "8px", color: "var(--muted)", fontWeight: 600 }}>{t("welcomeToLisa")}!</h2>
                    </div>
                  </div>
                  <div className="empty-state-assessment">
                    <p className="intro-copy">{t("initialAssessmentDesc")}</p>
                    <div className="assessment-tours">
                      <div className="tour-badge">📄 {t("compSecTitle")}</div>
                      <div className="tour-badge">🗣️ {t("readingSecTitle")}</div>
                      <div className="tour-badge">✍️ {t("writingSecTitle")}</div>






















                    </div>
                    <button
                      type="button"
                      className="primary-btn start-assessment-btn"
                      onClick={handleStartInitialAssessment}
                    >
                      {t("takeAssessmentBtn")}
                    </button>
                  </div>
                </div>
              )}

              {/* 2. Answering state */}
              {assessmentState === "answering" && (() => {
                const q = assessmentQuestionsList[currentStep];
                const isVoiceReading = q?.type === "reading";
                const isCompMCQ = q?.type === "comprehension";
                const isWriting = q?.type === "writing";

                // Group question indices by section type for the 3-step stepper
                const typeIndices = { comprehension: [], reading: [], writing: [] };
                assessmentQuestionsList.forEach((item, i) => {
                  if (typeIndices[item.type]) typeIndices[item.type].push(i);
                });
                const compIdx = typeIndices.comprehension;
                const readIdxList = typeIndices.reading;
                const writeIdxList = typeIndices.writing;

                const currentSectionNum = isWriting ? 3 : isVoiceReading ? 2 : 1;

                const compCompleted = compIdx.length > 0 && compIdx.every((i) => selectedAnswers[i] !== undefined);
                const readCompleted = readIdxList.length > 0 && readIdxList.every((i) => !!readingAttempts[i]);
                const writeCompleted = writeIdxList.length > 0 && writeIdxList.every((i) => !!(writingAnswers[i] || "").trim());

                const sectionMeta = [
                  { num: 1, title: t("compSecTitle"), done: compCompleted },
                  { num: 2, title: t("readingSecTitle"), done: readCompleted },
                  { num: 3, title: t("writingSecTitle"), done: writeCompleted },
                ];

                const activeQ = translatedQ || q.rawQuestion;

                // 1. Resolve reading targetText
                const readingTargetText = isVoiceReading
                  ? (activeQ?.reading || "Read this text aloud.")
                  : "";

                // 2. Resolve comprehension question & options
                const compQuestionText = isCompMCQ
                  ? (activeQ?.question || "")
                  : "";

                const resolvedOptions = activeQ?.options
                  ? (Array.isArray(activeQ.options) ? activeQ.options : (activeQ.options[lang] || activeQ.options["English"] || []))
                  : [];
                const compOptions = isCompMCQ && resolvedOptions.length > 0
                  ? q.shuffledIndices.map((originalIdx) => resolvedOptions[originalIdx] || "")
                  : [];

                // 3. Resolve writing prompt + dictation sentence
                const writingPromptText = isWriting
                  ? (activeQ?.writing || "")
                  : "";

                const dictationText = isWriting
                  ? (q.rawQuestion?.dictation || "")
                  : "";

                return (
                  <div className="assessment-card" style={{ maxWidth: '800px', margin: '20px auto' }}>
                    <div className="assessment-card-header assessment-header-with-mascot">
                      <div className="assessment-header-content">
                        <div className="step-tag-row">
                          <div className="step-tag">
                            {t("stepTitle").replace("{current}", currentSectionNum).replace("{total}", 3)}
                          </div>
                          <span className="step-subtitle">Initial Assessment</span>
                        </div>
                        <h2>
                          {isVoiceReading && t("readingSecTitle")}


                          {isCompMCQ && t("compSecTitle")}
                          {isWriting && t("writingSecTitle")}
                        </h2>
                        {isCompMCQ && compIdx.length > 0 && (



                          <p className="section-sub-progress">


                            {t("questionOf").replace("{current}", compIdx.indexOf(currentStep) + 1).replace("{total}", compIdx.length)}
                          </p>










                        )}
                      </div>
                      <div className="section-stepper">
                        {sectionMeta.map((s) => (
                          <div key={s.num} className={`step-node ${s.done ? "done" : currentSectionNum === s.num ? "active" : "pending"}`}>
                            <span className="step-circle">{s.done ? "✓" : s.num}</span>
                          </div>
                        ))}
                      </div>
                      <img
                        src="/as2.png"
                        alt="LISA mascot"
                        className="assessment-mascot"
                      />
                    </div>

                    <div className="question-content-box">
                      <>
                        {/* READING VOICE TO TEXT WITH MONKEYTYPE UI */}
                        {isVoiceReading && (
                          <div className="reading-q-container">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                              <p className="helper-text" style={{ margin: 0 }}>{t("monkeyTypeTip")}</p>
                              <button
                                type="button"
                                className="tts-btn"
                                onClick={() => speakText(readingTargetText)}
                                title="Listen to pronunciation"
                              >
                                🔊 <span className="tts-btn-text">{t("listenBtn") || "Listen"}</span>
                              </button>
                            </div>

                            <div className="monkeytype-text-block">
                              {readingTargetText.split(/\s+/).map((word, idx) => {
                                const cleaned = cleanWord(word);
                                const attempt = readingAttempts[currentStep];
                                let wordClass = "unspoken";
                                if (attempt && attempt.scores) {
                                  const targetWordsCleaned = readingTargetText.split(/\s+/).map(cleanWord);
                                  const cleanIdx = targetWordsCleaned.indexOf(cleaned);
                                  if (cleanIdx !== -1 && attempt.scores[cleanIdx]) {
                                    wordClass = "correct";
                                  } else if (!isListening) {
                                    wordClass = "incorrect";
                                  }
                                }
                                return (
                                  <span key={idx} className={`mt-word ${wordClass}`}>
                                    {word}{" "}
                                  </span>
                                );
                              })}
                            </div>

                            <div className="voice-mic-controls">
                              {!isListening ? (
                                <div className="mic-outer-container">
                                  <button
                                    type="button"
                                    className="mic-btn"
                                    onClick={() => startListening(readingTargetText)}
                                  >
                                    <svg className="mic-icon" width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                      <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3z" />
                                      <path d="M17 11a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2z" />
                                    </svg>
                                    <span className="mic-btn-text">CLICK TO SPEAK</span>
                                  </button>
                                </div>
                              ) : (
                                <div className="mic-outer-container">
                                  <button
                                    type="button"
                                    className="mic-btn"
                                    onClick={stopListening}
                                  >
                                    <span className="voice-wave" aria-hidden="true">
                                      <span></span><span></span><span></span><span></span><span></span><span></span><span></span>
                                    </span>
                                  </button>
                                </div>
                              )}
                            </div>

                            {spokenTranscript && (
                              <div className="voice-transcript-log">
                                <strong>Spoken:</strong> "{spokenTranscript}"
                              </div>
                            )}

                            {micError && <p className="mic-error-text">{micError}</p>}

                            {/* Manual fallback input */}
                            <div className="voice-fallback-area">
                              <label className="fallback-label">{t("skipVoicePrompt")}</label>
                              <div className="fallback-input-row">
                                <input
                                  type="text"
                                  placeholder="Type sentence here if mic fails..."
                                  value={manualTextFallback}
                                  onChange={(e) => setManualTextFallback(e.target.value)}
                                />
                                <button
                                  type="button"
                                  className="secondary-btn"
                                  onClick={() => handleManualTextSubmit(readingTargetText)}
                                >
                                  {t("skipVoiceBtn")}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* COMPREHENSION SHUFFLED MCQS */}
                        {isCompMCQ && (
                          <div className="comprehension-q-container">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                              <p className="comprehension-question" style={{ margin: 0, flex: 1, fontWeight: 700 }}>{compQuestionText}</p>
                              <button
                                type="button"
                                className="tts-btn"
                                onClick={() => speakText(compQuestionText, 1.0, selectedLanguage)}
                                title="Listen to question"
                              >
                                🔊 <span className="tts-btn-text">{t("listenBtn") || "Listen"}</span>
                              </button>
                            </div>
                            <div className="options-grid">
                              {compOptions.map((opt, idx) => {
                                const isSelected = selectedAnswers[currentStep] === idx;
                                return (
                                  <button
                                    key={idx}
                                    type="button"
                                    className={`option-btn ${isSelected ? "selected" : ""}`}
                                    onClick={() => {
                                      setSelectedAnswers({ ...selectedAnswers, [currentStep]: idx });
                                    }}
                                  >
                                    <span className="option-indicator">{String.fromCharCode(65 + idx)}</span>
                                    <span className="option-label">{opt}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* WRITING DICTATION SECTION */}
                        {isWriting && (
                          <div className="writing-q-container">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', justifyContent: 'space-between', width: '100%' }}>
                              <div style={{ flex: 1 }}>
                                <p className="writing-prompt" style={{ margin: 0, fontWeight: 700 }}>{writingPromptText}</p>
                                <p className="helper-text" style={{ margin: '8px 0 0' }}>{t("dictationTip") || "Press play and arrange the word blocks to form the sentence you hear."}</p>
                              </div>
                              <button
                                type="button"
                                className="tts-btn dictation-play"
                                onClick={() => speakText(dictationText)}
                                title="Listen to the sentence"
                              >
                                🔊 <span className="tts-btn-text">{t("listenBtn") || "Listen"}</span>
                              </button>
                            </div>

                            {/* Arranged Sentence Workspace */}
                            <div className="sentence-workspace-label" style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px', color: 'var(--muted)' }}>
                              {t("yourAnswer")}
                            </div>
                            <div className="sentence-workspace">
                              {arrangedBlockIndices.length === 0 ? (
                                <span style={{ color: 'var(--muted)', fontSize: '0.95rem', fontStyle: 'italic' }}>
                                  {t("clickWordBlocksTip")}
                                </span>
                              ) : (
                                arrangedBlockIndices.map((blockIdx, pos) => {
                                  const word = shuffledWordBlocks[blockIdx];
                                  return (
                                    <button
                                      key={pos}
                                      type="button"
                                      className="word-block active-block"
                                      onClick={() => {
                                        const newArranged = [...arrangedBlockIndices];
                                        newArranged.splice(pos, 1);
                                        setArrangedBlockIndices(newArranged);
                                        const text = newArranged.map(i => shuffledWordBlocks[i]).join(" ");
                                        setWritingAnswers({ ...writingAnswers, [currentStep]: text });
                                      }}
                                    >
                                      {word} <span className="remove-x">×</span>
                                    </button>
                                  );
                                })
                              )}
                            </div>

                            {/* Word Bank Pool */}
                            <div className="word-bank-label" style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px', color: 'var(--muted)' }}>
                              {t("wordBank")}
                            </div>
                            <div className="word-bank">
                              {shuffledWordBlocks.map((word, idx) => {
                                const isUsed = arrangedBlockIndices.includes(idx);
                                return (
                                  <button
                                    key={idx}
                                    type="button"
                                    disabled={isUsed}
                                    className={`word-block-choice ${isUsed ? 'used' : ''}`}
                                    onClick={() => {
                                      if (isUsed) return;
                                      const newArranged = [...arrangedBlockIndices, idx];
                                      setArrangedBlockIndices(newArranged);
                                      const text = newArranged.map(i => shuffledWordBlocks[i]).join(" ");
                                      setWritingAnswers({ ...writingAnswers, [currentStep]: text });
                                    }}
                                  >
                                    {word}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Manual Fallback Option */}
                            <details style={{ marginTop: '16px', cursor: 'pointer' }}>
                              <summary style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', userSelect: 'none' }}>
                                {t("typeManuallyInstead")}
                              </summary>
                              <div style={{ marginTop: '8px' }}>
                                <textarea
                                  className="writing-textarea"
                                  placeholder="Type the sentence manually here..."
                                  rows={4}
                                  style={{ width: '100%', marginTop: '8px', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                                  value={writingAnswers[currentStep] || ""}
                                  onChange={(e) => setWritingAnswers({ ...writingAnswers, [currentStep]: e.target.value })}
                                />
                              </div>
                            </details>
                          </div>
                        )}
                      </>
                    </div>

                    <div className="assessment-nav-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: '12px' }}>
                      <div>
                        {currentStep > 0 ? (
                          <button
                            type="button"
                            className="secondary-btn nav-btn"
                            onClick={() => {
                              setCurrentStep(currentStep - 1);
                              setSpokenTranscript("");
                              setMicError("");
                              setManualTextFallback("");
                            }}
                          >
                            <span style={{ display: 'inline-block', transform: 'scaleX(-1)' }}>➜</span> {t("prevBtn")}
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="secondary-btn nav-btn"
                            onClick={() => {
                              setAssessmentState("not_started");
                              setSpokenTranscript("");
                              setMicError("");
                              setManualTextFallback("");
                            }}
                          >
                            <span style={{ display: 'inline-block', transform: 'scaleX(-1)' }}>➜</span> {t("backBtn")}
                          </button>
                        )}
                      </div>

                      <div>
                        {currentStep < assessmentQuestionsList.length - 1 ? (
                          <button
                            type="button"
                            className="primary-btn nav-btn"
                            onClick={handleNextStep}
                            disabled={
                              (isVoiceReading && !readingAttempts[currentStep]) ||
                              (isCompMCQ && selectedAnswers[currentStep] === undefined) ||
                              (isWriting && !(writingAnswers[currentStep] || "").trim())
                            }
                          >
                            {t("nextQuestion")} ➜
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="primary-btn submit-btn"
                            onClick={submitInitialAssessment}
                            disabled={
                              submitting ||
                              (isVoiceReading && !readingAttempts[currentStep]) ||
                              (isCompMCQ && selectedAnswers[currentStep] === undefined) ||
                              (isWriting && !(writingAnswers[currentStep] || "").trim())
                            }
                          >
                            {submitting ? t("submittingAssessment") : t("submitAssessmentBtn")}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* 3. Results feedback state */}
              {assessmentState === "results" && (() => {
                const currentLevelIndex = getLiteracyLevel(profile) || 1;
                const latestAttempt = historyAttempts[0];
                const skillScores = latestAttempt?.skillScores || {};
                const overallPercent = latestAttempt?.percentage || 0;
                const currentLang = selectedLanguage || "English";

                // Diagnostic skill analysis
                const strongKeys = latestAttempt?.strongSkillKeys || getStrongSkillKeys(skillScores);
                const weakKeys = latestAttempt?.weakSkillKeys || getWeakSkillKeys(skillScores);

                // Get primary weak skill for recommendation
                const primaryWeakSkill = weakKeys[0] || "reading_ability";
                let duolingoPracticeTitle = "Spelling & Dictation Drills";
                let duolingoPracticeRecommendation = "Listen to audio sentences and write out the exact words to reinforce writing correctness.";
                let duolingoPracticeIcon = "✍️";

                if (primaryWeakSkill === "letter_recognition") {
                  duolingoPracticeTitle = "Alphabet & Letter Sound Drills";
                  duolingoPracticeRecommendation = "Practice identifying sounds and connecting uppercase & lowercase letter shapes.";
                  duolingoPracticeIcon = "🔠";
                } else if (primaryWeakSkill === "word_recognition") {
                  duolingoPracticeTitle = "Word Construction Practice";
                  duolingoPracticeRecommendation = "Assemble letters to form vocabulary and practice recognizing basic sight words.";
                  duolingoPracticeIcon = "🧩";
                } else if (primaryWeakSkill === "vocabulary_recognition") {
                  duolingoPracticeTitle = "Daily Vocabulary Building";
                  duolingoPracticeRecommendation = "Learn words in context and build your core vocabulary base with visual image choices.";
                  duolingoPracticeIcon = "📚";
                } else if (primaryWeakSkill === "sentence_understanding") {
                  duolingoPracticeTitle = "Sentence Structure Drills";
                  duolingoPracticeRecommendation = "Unscramble word tiles and organize phrases into grammatically correct sentences.";
                  duolingoPracticeIcon = "⛓️";
                } else if (primaryWeakSkill === "reading_comprehension") {
                  duolingoPracticeTitle = "Comprehension Challenges";
                  duolingoPracticeRecommendation = "Read short paragraphs and answer comprehension questions to build analytical skills.";
                  duolingoPracticeIcon = "📖";
                } else if (primaryWeakSkill === "practical_literacy") {
                  duolingoPracticeTitle = "Real-World Reading Missions";
                  duolingoPracticeRecommendation = "Practice reading notices, road signs, instructions, and community warnings.";
                  duolingoPracticeIcon = "🚗";
                } else if (primaryWeakSkill === "reading_ability") {
                  duolingoPracticeTitle = "Perfect Pronunciation Practice";
                  duolingoPracticeRecommendation = "Read sentences aloud to train pronunciation with automated speech recognition feedback.";
                  duolingoPracticeIcon = "🗣️";
                }

                // Recommend Daily Practice Time
                let dailyPracticeTime = t("daily15min");
                if (overallPercent >= 90) dailyPracticeTime = t("daily10min");
                else if (overallPercent < 50) dailyPracticeTime = t("daily25min");

                const skillOrder = Object.entries(SKILL_CATEGORIES).map(([key, meta]) => ({
                  key,
                  label: t(SKILL_TRANSLATION_KEYS[key]) || meta.label,
                  color: meta.color,
                  icon: meta.icon,
                }));

                const placementInfo = getLevelCategoryAndDescription(currentLevelIndex, currentLang);
                const weakSkillsText = weakKeys.map(k => t(SKILL_TRANSLATION_KEYS[k]) || SKILL_CATEGORIES[k]?.label || k).join(", ");

                return (
                  <div className="results-card" style={{ maxWidth: '800px', margin: '20px auto' }}>
                    <h2 className="results-completed-title">{t("resultsTitle")}</h2>
                    <div className="results-hero-section">
                      <div className="results-hero-top-row">
                        <div className="results-hero-left">
                          <div className="results-percentage-circle">
                            <span className="percent-val">{overallPercent}%</span>
                          </div>
                          <span className="results-percent-text">{t("percentage")}</span>
                        </div>

                        <div className="results-hero-right">
                          <img
                            src="/as3.png"
                            alt="LISA mascot"
                            className="assessment-mascot results-mascot-medium"
                          />
                        </div>
                      </div>

                      <div className="results-hero-center-score">
                        <span className="hero-score-label">{t("overallScore")}</span>
                        <span className="hero-score-val">{latestAttempt?.score || 0} / {latestAttempt?.maxScore || 40}</span>
                      </div>
                    </div>

                    <div className="results-xp-earned" style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      margin: '0 auto 16px',
                      padding: '10px 24px',
                      borderRadius: '999px',
                      background: 'linear-gradient(135deg, #f59e0b22, #f59e0b11)',
                      color: '#b45309',
                      fontWeight: 800,
                      fontSize: '1.05rem',
                      boxShadow: '0 4px 12px rgba(245, 158, 11, 0.08)'
                    }}>
                      <StarIcon style={{ color: '#f59e0b' }} /> {t("xpEarned").replace("{xp}", "30")}
                    </div>

                    <div className="results-detail-row">
                      <div className="benchmark-card">
                        <div className="benchmark-badge-icon">🎖️</div>
                        <h3 className="benchmark-title">{placementInfo.category}</h3>
                        <p className="benchmark-desc">
                          {placementInfo.description}
                        </p>
                      </div>

                      <div className="skill-breakdowns-box">
                        <h3>{t("skillBreakdown")}</h3>
                        {skillOrder.map(({ key, label, color }) => {
                          const value = skillScores[key] ?? latestAttempt?.skills?.[key] ?? 0;
                          return (
                            <div className="skill-progress-bar" key={key}>
                              <div className="skill-progress-label">
                                <span>{label}</span>
                                <span>{value}%</span>
                              </div>
                              <div className="bar-bg">
                                <div className="bar-fill" style={{ width: `${value}%`, background: color }}></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Insights & Recommendations Card */}
                    <div className="insights-card">
                      <div className="insights-card-head">
                        <span className="insights-card-icon">💡</span>
                        <h3>{t("personalizedInsights")}</h3>
                      </div>
                      <div className="insights-grid">
                        <div className="insight-box insight-strong">
                          <div className="insight-badge">🌟</div>
                          <h4>{t("strongAreas")}</h4>
                          <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text)', width: '100%', textAlign: 'left' }}>
                            {strongKeys.length > 0 ? (
                              strongKeys.map((k) => (
                                <li key={k} style={{ marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem' }}>
                                  {t(SKILL_TRANSLATION_KEYS[k]) || k}
                                </li>
                              ))
                            ) : (
                              <li style={{ listStyleType: 'none', marginLeft: '-20px', fontSize: '0.88rem', color: 'var(--muted)', fontStyle: 'italic', lineHeight: '1.4' }}>
                                Work on lessons to build your first Strong area!
                              </li>
                            )}
                          </ul>
                        </div>

                        <div className="insight-box insight-improve">
                          <div className="insight-badge">⚠️</div>
                          <h4>{t("areasToImprove")}</h4>
                          <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text)', width: '100%', textAlign: 'left' }}>
                            {weakKeys.length > 0 ? (
                              weakKeys.map((k) => (
                                <li key={k} style={{ marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem' }}>
                                  {t(SKILL_TRANSLATION_KEYS[k]) || k}
                                </li>
                              ))
                            ) : (
                              <li style={{ listStyleType: 'none', marginLeft: '-20px', fontSize: '0.88rem', color: 'var(--muted)', fontStyle: 'italic', lineHeight: '1.4' }}>
                                {t("noImprovementNeeded")}
                              </li>
                            )}
                          </ul>
                        </div>

                        <div className="insight-box insight-time">
                          <div className="insight-badge">🕒</div>
                          <h4>{t("dailyCommitment")}</h4>
                          <p className="insight-time-val">{dailyPracticeTime}</p>
                        </div>
                      </div>
                    </div>

                    {/* Duolingo Daily Recommended Practice Card */}
                    <div className="insights-card" style={{ marginTop: '24px' }}>
                      <div className="insights-card-head">
                        <span className="insights-card-icon">🔥</span>
                        <h3>{selectedLanguage === "Hindi" ? "दैनिक अनुशंसित अभ्यास" : selectedLanguage === "Kannada" ? "ದೈನಂದಿನ ಶಿಫಾರಸು ಮಾಡಿದ ಅಭ್ಯಾಸ" : selectedLanguage === "Telugu" ? "రోజువారీ సిఫార్సు చేసిన అభ్యాసం" : selectedLanguage === "Tamil" ? "தினசரி பரிந்துரைக்கப்பட்ட பயிற்சி" : "Daily Recommended Practice"}</h3>
                      </div>
                      <div className="daily-rec-card-box">
                        <div className="daily-rec-card-icon">{duolingoPracticeIcon}</div>
                        <div className="daily-rec-card-content">
                          <h4>{duolingoPracticeTitle}</h4>
                          <p>{duolingoPracticeRecommendation}</p>
                          <div className="daily-rec-card-badges">
                            <span className="daily-rec-badge warn">🎯 Target: 30 XP Daily</span>
                            <span className="daily-rec-badge info">⏳ Commitment: {dailyPracticeTime}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Diagnostic Summary Analysis */}
                    <div className="diagnostic-recommendation-box" style={{ marginTop: '24px', padding: '20px', background: '#3b82f610', borderLeft: '5px solid var(--accent, #3b82f6)', borderRadius: '0 16px 16px 0', textAlign: 'left' }}>
                      <h4 style={{ margin: '0 0 10px 0', fontWeight: 800, fontSize: '1.1rem' }}>{t("summaryTitle")}</h4>
                      <div style={{ color: 'var(--text)', fontSize: '0.95rem' }}>
                        {(() => {
                          const weakSkillsJoined = weakKeys.map(k => t(SKILL_TRANSLATION_KEYS[k]) || SKILL_CATEGORIES[k]?.label || k).join(", ");
                          return (
                            <div style={{ lineHeight: '1.6' }}>
                              <p style={{ margin: '0 0 10px 0' }}>
                                {selectedLanguage === "Hindi" ? `शानदार प्रयास! आपने कुल 40 अंकों में से ${latestAttempt?.score || 0} अंक (${overallPercent}%) प्राप्त किए हैं।` :
                                 selectedLanguage === "Kannada" ? `ಅದ್ಭುತ ಪ್ರಯತ್ನ! ನೀವು ಒಟ್ಟು 40 ಅಂಕಗಳಲ್ಲಿ ${latestAttempt?.score || 0} ಅಂಕಗಳನ್ನು (${overallPercent}%) ಗಳಿಸಿದ್ದೀರಿ.` :
                                 selectedLanguage === "Telugu" ? `అద్భుతమైన ప్రయత్నం! మీరు మొత్తం 40 మార్కులకు ${latestAttempt?.score || 0} మార్కులు (${overallPercent}%) సాధించారు.` :
                                 selectedLanguage === "Tamil" ? `அற்புதம்! நீங்கள் மொத்தம் 40 மதிப்பெண்களுக்கு ${latestAttempt?.score || 0} மதிப்பெண்கள் (${overallPercent}%) பெற்றுள்ளீர்கள்.` :
                                 `Fantastic effort! You scored ${latestAttempt?.score || 0} out of 40 marks (${overallPercent}%).`}
                              </p>
                              <p style={{ margin: '0 0 10px 0' }}>
                                {selectedLanguage === "Hindi" ? `आपके डायग्नोस्टिक परिणामों के अनुसार, आपका वर्तमान प्लेसमेंट स्तर ${placementInfo.category} है।` :
                                 selectedLanguage === "Kannada" ? `ನಿಮ್ಮ ಡಯಾಗ್ನಾಸ್ಟಿಕ್ ಫಲಿತಾಂಶಗಳ ಪ್ರಕಾರ, ನಿಮ್ಮ ಪ್ರಸ್ತುತ ನಿಯೋಜನೆ ಮಟ್ಟ ${placementInfo.category} ಆಗಿದೆ.` :
                                 selectedLanguage === "Telugu" ? `మీ డయాగ్నస్టిక్ ఫలితాల ప్రకారం, మీ ప్రస్తుత ప్లేస్‌మెంట్ స్థాయి ${placementInfo.category} గా ఉంది.` :
                                 selectedLanguage === "Tamil" ? `உங்களது கண்டறியும் முடிவுகளின்படி, உங்களது தற்போதைய வேலை வாய்ப்பு நிலை ${placementInfo.category} ஆகும்.` :
                                 `Based on your diagnostic results, your current placement level is ${placementInfo.category}.`}
                              </p>
                              {weakKeys.length > 0 && (
                                <p style={{ margin: '0' }}>
                                  {selectedLanguage === "Hindi" ? `हमने आपके विकास क्षेत्रों को लक्षित करते हुए एक व्यक्तिगत शिक्षण पथ तैयार किया है: ${weakSkillsJoined}।` :
                                   selectedLanguage === "Kannada" ? `ನಿಮ್ಮ ಕಲಿಕೆಯ ಅಗತ್ಯವಿರುವ ಕ್ಷೇತ್ರಗಳನ್ನು ಗುರಿಯಾಗಿಸಿಕೊಂಡು ನಾವು ವೈಯಕ್ತಿಕಗೊಳಿಸಿದ ಕಲಿಕೆಯ ಮಾರ್ಗವನ್ನು ಸಿದ್ಧಪಡಿಸಿದ್ದೇವೆ: ${weakSkillsJoined}.` :
                                   selectedLanguage === "Telugu" ? `మేము మీ అభివృద్ధి అవసరమైన అంశాలపై దృష్టి సారించి ఒక అభ్యాస మార్గాన్ని సిద్ధం చేసాము: ${weakSkillsJoined}.` :
                                   selectedLanguage === "Tamil" ? `உங்களது வளர்ச்சிப் பகுதிகளை இலக்காகக் கொண்டு தனிப்பயனாக்கப்பட்ட கற்றல் பாதையை வடிவமைத்துள்ளோம்: ${weakSkillsJoined}.` :
                                   `We have prepared a personalized learning path targeting your key growth areas: ${weakSkillsJoined}.`}
                                </p>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Visual Learning Path Roadmap */}
                    <div className="personalized-path-container" style={{
                      marginTop: '32px',
                      background: 'var(--panel)',
                      borderRadius: '20px',
                      padding: '24px',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
                      border: '1px solid var(--line)',
                      textAlign: 'left'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                        <span style={{ fontSize: '1.8rem' }}>🧭</span>
                        <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>{selectedLanguage === "Hindi" ? "आपका व्यक्तिगत शिक्षण पथ" : selectedLanguage === "Kannada" ? "ನಿಮ್ಮ ವೈಯಕ್ತಿಕಗೊಳಿಸಿದ ಕಲಿಕೆಯ ಮಾರ್ಗ" : selectedLanguage === "Telugu" ? "మీ వ్యక్తిగతీకరించిన అభ్యాస మార్గం" : selectedLanguage === "Tamil" ? "உங்கள் தனிப்பயனாக்கப்பட்ட கற்றல் பாதை" : "Your Personalized Learning Path"}</h3>
                      </div>
                      
                      <div className="path-roadmap-timeline" style={{
                        position: 'relative',
                        paddingLeft: '32px',
                        borderLeft: '3px dashed var(--accent, #3b82f6)'
                      }}>
                        {(() => {
                          const pathSteps = latestAttempt?.learningPath || [];
                          if (pathSteps.length === 0) {
                            return <p style={{ fontStyle: 'italic', color: 'var(--muted)' }}>Loading path...</p>;
                          }
                          return pathSteps.map((step, sIdx) => {
                            const section = CURRICULUM_SECTIONS.find(s => s.id === step.sectionId);
                            const skillMeta = SKILL_CATEGORIES[step.skill] || { icon: "⭐️", color: "#3b82f6" };
                            return (
                              <div key={step.sectionId} className="roadmap-step-item" style={{
                                position: 'relative',
                                marginBottom: '24px',
                              }}>
                                {/* Dot */}
                                <div style={{
                                  position: 'absolute',
                                  left: '-45px',
                                  top: '2px',
                                  width: '24px',
                                  height: '24px',
                                  borderRadius: '50%',
                                  background: skillMeta.color || '#3b82f6',
                                  color: '#ffffff',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.8rem',
                                  fontWeight: 800,
                                  border: '4px solid var(--panel-strong)',
                                  boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                                }}>
                                  {sIdx + 1}
                                </div>
                                <div style={{
                                  background: 'var(--flz-tint, rgba(198, 95, 45, 0.08))',
                                  padding: '16px',
                                  borderRadius: '16px',
                                  border: '1px solid var(--line)'
                                }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)' }}>
                                      {t(`${step.sectionId}_title`) || section?.title || step.reason}
                                    </h4>
                                    <span style={{
                                      fontSize: '0.75rem',
                                      fontWeight: 800,
                                      padding: '4px 10px',
                                      borderRadius: '999px',
                                      background: `${skillMeta.color}15`,
                                      color: skillMeta.color,
                                      textTransform: 'uppercase'
                                    }}>
                                      {t(SKILL_TRANSLATION_KEYS[step.skill]) || skillMeta.label}
                                    </span>
                                  </div>
                                  <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--muted)', lineHeight: '1.4' }}>
                                    {step.reason}
                                  </p>
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '32px' }}>
                      <button
                        type="button"
                        className="primary-btn"
                        style={{ background: 'var(--accent)', border: 'none', color: 'white', padding: '12px 24px', borderRadius: '12px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', flex: 1, maxWidth: '300px' }}
                        onClick={() => {
                          setDashboardTab("learn");
                          setShowPersonalizedPath(true);
                          setAssessmentState("not_started");
                        }}
                      >
                        🧭 {t("viewLearningPath")}
                      </button>
                      <button
                        type="button"
                        className="secondary-btn"
                        style={{ padding: '12px 24px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', flex: 1, maxWidth: '300px' }}
                        onClick={() => {
                          setAssessmentState("not_started");
                        }}
                      >
                        {t("continueToDashboard")}
                      </button>
                    </div>
                  </div>
                );
              })()}
            </main>
          </div>
        </div>
      );
    }

    return (
      <div className="dashboard-container-new">
        {/* Topbar with embedded sidebar navigation */}
        <div className={`dashboard-topbar ${dashboardTab === "admin" ? "admin-topbar" : ""}`}>
          <div className="topbar-left">
            {session?.user?.email === "admin@gmail.com" ? (
              <div className="admin-topbar-title" style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--accent)', paddingLeft: '8px' }}>
                🛡️ LISA System Administrator
              </div>
            ) : (
              <div className="topbar-indicators" style={{ position: 'relative' }}>
              <div
                className="indicator-pill streak"
                onClick={() => setStreakPopupOpen(!streakPopupOpen)}
                style={{ cursor: 'pointer', position: 'relative' }}
                ref={streakPopupRef}
              >
                <FlameIcon style={{ color: '#ff4d00', width: '18px', height: '18px' }} />
                <span style={{ color: '#ff4d00' }}>{streakCount}</span>

                {/* Streak Popup */}
                {streakPopupOpen && (
                  <div
                    className="streak-popup-overlay"
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: '0',
                      marginTop: '12px',
                      width: '290px',
                      background: 'var(--panel-strong)',
                      border: '2px solid var(--line)',
                      borderRadius: '16px',
                      boxShadow: 'var(--shadow)',
                      padding: '16px',
                      zIndex: 1000,
                      cursor: 'default'
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', textAlign: 'left' }}>
                      <FlameIcon style={{ width: '28px', height: '28px', color: '#ff4d00', marginRight: 0 }} />
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text)' }}>{streakCount} Day Streak!</h3>
                        <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--muted)' }}>
                          {streakCount > 0 ? "You're doing great! Keep it up." : "Start a lesson to begin your streak!"}
                        </p>
                      </div>
                    </div>

                    {/* Past 7 days grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', textAlign: 'center' }}>
                      {getPastSevenDaysStatus().map((day, idx) => (
                        <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: day.isToday ? 'var(--accent)' : 'var(--muted)' }}>
                            {day.label}
                          </span>
                          <div style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: day.isCompleted
                              ? 'linear-gradient(135deg, #ff6b00, #ff4d00)'
                              : 'rgba(0,0,0,0.05)',
                            color: day.isCompleted ? 'white' : 'var(--muted)',
                            border: day.isToday ? '2px solid var(--accent)' : 'none',
                            fontSize: '0.75rem',
                            fontWeight: 700
                          }}>
                            {day.isCompleted ? '✓' : ''}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="indicator-pill xp"><StarIcon style={{ color: '#f59e0b' }} /> {userXp} XP</div>
              <button
                type="button"
                className={`indicator-pill shop-pill ${dashboardTab === "shop" ? "active" : ""}`}
                onClick={() => switchDashboardTab("shop")}
                title="XP Shop"
              >
                <svg style={{ marginRight: 0, width: 18, height: 18, verticalAlign: "middle" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                  <line x1="3" x2="21" y1="6" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              </button>
              <button
                type="button"
                className={`indicator-pill leaderboard-pill ${dashboardTab === "leaderboard" ? "active" : ""}`}
                onClick={() => switchDashboardTab("leaderboard")}
                title="Leaderboard"
              >
                <TrophyIcon style={{ marginRight: 0, width: 18, height: 18, verticalAlign: "middle" }} />
              </button>














            </div>
            )}
          </div>

          <div className="topbar-center">
            <img src="/icon.png" alt="LISA" className="topbar-logo-img" />
            <span className="topbar-logo-text">LISA</span>
          </div>

          <div className="sidebar-pill">
            <div className="sidebar-logo">LISA</div>
            <div className="sidebar-menu">
              {session?.user?.email === "admin@gmail.com" ? (
                <>
                  <button
                    type="button"
                    className={`sidebar-item ${dashboardTab === "admin" ? "active" : ""}`}
                    onClick={() => switchDashboardTab("admin")}
                    style={{ display: 'inline-flex', alignItems: 'center' }}
                  >
                    <span style={{ marginRight: '6px' }}>🔒</span> Admin Portal
                  </button>
                  <span className="sidebar-separator" aria-hidden="true" />
                  <button
                    type="button"
                    className="sidebar-signout-pill"
                    onClick={() => handleSignOut()}
                    style={{ display: 'inline-flex', alignItems: 'center', marginLeft: 'auto' }}
                  >
                    <LogoutIcon style={{ marginRight: 0, width: 16, height: 16 }} /> {t("logout")}
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className={`sidebar-item ${dashboardTab === "dashboard" ? "active" : ""}`}
                    onClick={() => switchDashboardTab("dashboard")}
                  >
                    <DashboardIcon style={{ marginRight: 0, width: 18, height: 18 }} /> {t("sidebarDashboard")}
                  </button>
                  <span className="sidebar-separator" aria-hidden="true" />
                  <button
                    type="button"
                    className={`sidebar-item ${dashboardTab === "learn" ? "active" : ""}`}
                    onClick={() => switchDashboardTab("learn")}
                  >
                    <LearnIcon style={{ marginRight: 0, width: 18, height: 18 }} /> {t("sidebarLearn")}
                  </button>
                  <span className="sidebar-separator" aria-hidden="true" />
                  <button
                    type="button"
                    className={`sidebar-item ${dashboardTab === "practice" ? "active" : ""}`}
                    onClick={() => switchDashboardTab("practice")}
                  >
                    <PracticeIcon style={{ marginRight: 0, width: 18, height: 18 }} /> {t("sidebarPractice")}
                  </button>
                  <span className="sidebar-separator" aria-hidden="true" />
                  <button
                    type="button"
                    className={`sidebar-item ${dashboardTab === "profile" ? "active" : ""}`}
                    onClick={() => switchDashboardTab("profile")}
                    style={{ display: 'inline-flex', alignItems: 'center' }}
                  >
                    {(() => {
                      const resolved = resolveProfileAvatar(profileAvatar);
                      if (resolved?.type === "photo") {
                        return (
                          <img
                            src={resolved.value}
                            alt="Profile"
                            style={{
                              width: "22px",
                              height: "22px",
                              borderRadius: "50%",
                              objectFit: "cover",
                              marginRight: "6px"
                            }}
                          />
                        );
                      }
                      if (resolved?.type === "emoji") {
                        return <span style={{ fontSize: "1.1rem", marginRight: "6px" }}>{resolved.emoji}</span>;
                      }
                      if (resolved?.type === "builder") {
                        const shape = AVATAR_SHAPE_STYLE[resolved.shape] || AVATAR_SHAPE_STYLE.circle;
                        return (
                          <span style={{
                            width: "22px",
                            height: "22px",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: resolved.bg,
                            ...shape,
                            fontSize: "1.1rem",
                            marginRight: "6px"
                          }}>
                            {resolved.emoji}
                          </span>
                        );
                      }
                      return <ProfileIcon style={{ marginRight: 0, width: 18, height: 18 }} />;
                    })()}
                    {t("sidebarProfile")}
                  </button>
                </>
              )}
            </div>
            {session?.user?.email !== "admin@gmail.com" && (
              <div className="sidebar-footer">
                <button
                  type="button"
                  className="sidebar-signout-pill"
                  onClick={() => handleSignOut()}
                >
                  <LogoutIcon style={{ marginRight: 0, width: 16, height: 16 }} /> {t("logout")}
                </button>
              </div>
            )}
          </div>

          <div className="topbar-right">
            {session?.user?.email !== "admin@gmail.com" && (
              <div style={{ position: "relative" }}>
              <button
                type="button"
                className="notif-bell-btn"
                onClick={() => setNotifOpen((prev) => !prev)}
                aria-label="Notifications"
                title="Notifications"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                </svg>
                {unreadCount > 0 && (
                  <span className="notif-badge">{unreadCount}</span>
                )}
              </button>
              {notifOpen && (
                <div className="notif-panel" ref={notifPanelRef}>
                  <div className="notif-panel-header">
                    <h4>Notifications</h4>
                    <div className="notif-header-actions">
                      {notifications.length > 0 && (
                        <button
                          type="button"
                          className="notif-read-all-btn"
                          onClick={async () => {
                            const allNotifIds = notifications.map(n => n.id);
                            const newRead = [...new Set([...readNotifIds, ...allNotifIds])];
                            const newDismissed = [...new Set([...dismissedNotifIds, ...allNotifIds])];
                            await saveNotifState(newRead, newDismissed);
                          }}
                        >
                          Read All
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="notif-list">
                    {notifications.length === 0 ? (
                      <p className="notif-empty">No notifications yet.</p>
                    ) : (
                      notifications.map((n) => {
                        return (
                          <div key={n.id} className="notif-card" style={{ background: lightenColor(n.color) }}>
                            <span className="notif-icon" style={{ color: n.color }}>{n.icon}</span>
                            <div className="notif-content">
                              <div className="notif-title">{n.title}</div>
                              <div className="notif-message">{n.message}</div>
                            </div>
                            <button
                              type="button"
                              className="notif-read-btn"
                              onClick={async () => {
                                const newRead = [...new Set([...readNotifIds, n.id])];
                                const newDismissed = [...new Set([...dismissedNotifIds, n.id])];
                                await saveNotifState(newRead, newDismissed);
                              }}
                              aria-label={`Mark ${n.title} as read`}
                              title="Mark as read"
                            >
                              Read
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
            )}
            {renderLanguageDropdown(true)}
            {renderThemeToggle()}
          </div>
        </div>

        {/* Main View Area */}
        <main className={`dashboard-main-view ${dashboardTab === "admin" ? "admin-main-view" : ""}`}>
          {/* Dashboard / Home - overview widgets */}
          {dashboardTab === "dashboard" && (
            <div className="dashboard-overview">
              <div className="dashboard-col dashboard-col-left">
                <div className="dashboard-greeting">
                  <h1>{t("dashboardHello").replace("{name}", profile?.full_name || "Learner")}</h1>
                  <p>{t("dashboardWelcomeBack")}</p>
                </div>

                <div className="resume-card">
                  <div className="resume-card-info">
                    <span className="resume-card-label">{t("dashboardContinueLearning")}</span>
                    <h3 className="resume-card-title">{t(`${activeDashboardSections[currentUnitPos.sectionIdx]?.units[currentUnitPos.unitIdx]?.id}_title`) || activeDashboardSections[currentUnitPos.sectionIdx]?.units[currentUnitPos.unitIdx]?.title || t("dashboardStartLearning")}</h3>
                    <div className="resume-card-sub" style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>
                        {t("dashboardSection")}: {t(`${activeDashboardSections[currentUnitPos.sectionIdx]?.id}_title`) || activeDashboardSections[currentUnitPos.sectionIdx]?.title || `${t("dashboardSection")} ${currentUnitPos.sectionIdx + 1}`}
                      </span>
                      <span style={{
                        fontSize: '0.82rem',
                        marginTop: '6px',
                        whiteSpace: 'nowrap',
                        opacity: 0.9
                      }}>
                        {t("dashboardLesson")}: {currentUnit?.title || `${t("dashboardLesson")} ${currentUnitPos.lessonIdx + 1}`}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="resume-btn"
                    onClick={() => {
                      setDashboardTab("learn");
                    }}
                  >
                    <span style={{ fontSize: '0.9rem' }}>▶</span>
                    <span>{t("dashboardResume")}</span>
                  </button>
                </div>

                <div className="dashboard-overview-row" style={{ margin: 0, gap: '24px', alignItems: 'stretch' }}>
                  <div className="word-of-day-card" style={{ flex: 1, margin: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div className="word-of-day-head">
                        <span className="word-of-day-label">{t("dashboardWordOfDay")}</span>
                        <button
                          type="button"
                          className="word-of-day-speak"
                          onClick={() => speakWord(wordOfDay?.word || "")}
                          aria-label="Listen to word"
                        >
                          🔊
                        </button>
                      </div>
                      <h3 className="word-of-day-word" style={{ marginTop: '8px', marginBottom: '16px' }}>{wordOfDay?.word || "Loading..."}</h3>
                      <div className="word-of-day-block" style={{ marginBottom: '12px' }}>
                        <span className="word-of-day-heading" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          {t("meaning")}
                          <button
                            type="button"
                            className="word-of-day-speak word-of-day-speak-inline"
                            onClick={() => speakText(wordOfDay?.meaning || "", 0.9, selectedLanguage || "English")}
                            style={{ margin: 0, padding: '2px 4px', fontSize: '0.8rem', background: 'transparent', border: 'none', cursor: 'pointer' }}
                            aria-label="Listen to meaning"
                          >
                            🔊
                          </button>
                        </span>
                        <p className="word-of-day-meaning" style={{ marginTop: '4px' }}>
                          {wordOfDay?.meaning || "Loading word definition..."}
                        </p>
                      </div>
                    </div>
                    {wordOfDay?.example && (
                      <div className="word-of-day-block" style={{ marginTop: 'auto' }}>
                        <span className="word-of-day-heading" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          {t("example")}
                          <button
                            type="button"
                            className="word-of-day-speak word-of-day-speak-inline"
                            onClick={() => speakText(wordOfDay?.example || "", 0.9, learningLanguage || "English")}
                            style={{ margin: 0, padding: '2px 4px', fontSize: '0.8rem', background: 'transparent', border: 'none', cursor: 'pointer' }}
                            aria-label="Listen to example"
                          >
                            🔊
                          </button>
                        </span>
                        <p className="word-of-day-example" style={{ marginTop: '4px' }}>
                          "{wordOfDay.example}"
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="current-level-card" style={{
                    flex: 1,
                    margin: 0,
                    background: 'var(--panel-strong)',
                    border: '1px solid var(--line)',
                    boxShadow: 'none',
                    color: 'var(--text)',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}>
                    <div className="current-level-header">
                      <h3 className="current-level-title" style={{ color: 'var(--text)' }}>{t("dashboardCurrentLevel")}</h3>
                    </div>
                    <div className="current-level-body" style={{ marginTop: '12px' }}>
                      <div className="current-level-badge" style={{ background: `${levelBadgeColor(currentLevelNum)}1a`, border: `1.5px solid ${levelBadgeColor(currentLevelNum)}40` }}>
                        <span className="current-level-badge-icon">{levelBadgeIcon(currentLevelNum)}</span>
                        <span className="current-level-badge-level" style={{ color: levelBadgeColor(currentLevelNum), fontWeight: '900' }}>{t("level").toUpperCase()} {currentLevelNum}</span>
                      </div>
                      <div className="current-level-info">
                        <p className="current-level-name" style={{ color: 'var(--text)', fontWeight: '750' }}>{getLevelCategoryAndDescription(currentLevelNum, selectedLanguage).category}</p>
                        <p className="current-level-msg" style={{ color: 'var(--muted)', fontWeight: '500' }}>{translatedLevelMsg}</p>
                      </div>
                    </div>
                  </div>
                </div>


              </div>

              <div className="dashboard-col dashboard-col-right">


                <div className="stars-answers-card" style={{ margin: 0 }}>
                  <div className="progress-dashboard-header" style={{ paddingTop: 0, borderTop: 'none', borderBottom: '1px solid var(--line)', paddingBottom: '12px', marginBottom: '4px' }}>
                    <h4 className="progress-dashboard-title">{t("dashboardProgressTitle")}</h4>
                    <button
                      type="button"
                      className="progress-view-btn"
                      onClick={() => setDashboardTab("analytics")}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle' }}>
                        <path d="M3 3v18h18" />
                        <path d="M7 16l4-8 4 4 4-6" />
                      </svg>
                      {t("dashboardViewReport")}
                    </button>
                  </div>

                  <div className="sa-metrics-row">
                    <div className="sa-metric">
                      <div className="sa-icon sa-icon-stars"><StarIcon style={{ marginRight: 0, width: "22px", height: "22px" }} /></div>
                      <div className="sa-metric-text">
                        <span className="sa-value">{dailyXp}</span>
                        <span className="sa-label">{t("dashboardStarsToday")}</span>
                      </div>
                    </div>
                    <div className="sa-divider" />
                    <div className="sa-metric">
                      <div className="sa-icon sa-icon-answers">✓</div>
                      <div className="sa-metric-text">
                        <span className="sa-value">{dailyCorrectAnswers}</span>
                        <span className="sa-label">{t("dashboardRightAnswersToday")}</span>
                      </div>
                    </div>
                  </div>

                  <div className="progress-dashboard-footer">
                    <span className="progress-dashboard-summary">
                      {t("dashboardProgressSummary").replace("{lessons}", completedLessons.filter(id => !id.startsWith("ach_")).length).replace("{xp}", dailyXp).replace("{streak}", streakCount)}
                    </span>
                  </div>
                </div>

                <div className="dashboard-overview-row" style={{ margin: 0, alignItems: 'stretch' }}>
                  <div className="streak-widget-card streak-society-card" style={{ margin: 0, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div className="streak-society-header">
                        <span className="streak-society-badge">{t("dashboardStreakSociety").toUpperCase()}</span>
                        <div className="streak-society-icon"><FlameIcon style={{ width: "36px", height: "36px", color: '#ff4d00', marginRight: 0 }} /></div>
                      </div>
                      <h4 className="streak-society-title" style={{ fontSize: '2.4rem', fontWeight: '900', letterSpacing: '-0.5px', lineHeight: 1.1 }}>
                        {streakCount} <span style={{ fontSize: '1.2rem', fontWeight: '700', opacity: 0.9 }}>{t("dashboardDayStreak")}</span>
                      </h4>
                    </div>
                    <p className="streak-society-message" style={{ marginTop: 'auto' }}>{translatedStreakMsg}</p>
                  </div>

                  <div className="daily-quests-card" style={{ margin: 0, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div className="daily-quests-header">
                      <h3>{t("dashboardDailyQuests")}</h3>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'nowrap' }}>
                        <span className="quest-xp-reward-badge">⚡ +30 XP Reward</span>
                        {activeQuests.length > 0 && activeQuests.every(q => getQuestProgress(q).completed) ? (
                          <span className="daily-quests-timer" style={{ background: '#d1fae5', color: '#10b981' }}>✓ ALL COMPLETED</span>
                        ) : (
                          <span className="daily-quests-timer">{timeLeftStr.toUpperCase()} LEFT</span>
                        )}
                      </div>
                    </div>
                    <div className="quest-list" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {activeQuests.map((quest) => {
                        const prog = getQuestProgress(quest);
                        return (
                          <div key={quest.id} className="quest-item" style={{
                            gap: '10px',
                            padding: '12px',
                            opacity: prog.completed ? 0.65 : 1,
                            background: prog.completed ? 'var(--line)' : 'var(--bg)',
                            borderColor: prog.completed ? 'transparent' : 'var(--line)'
                          }}>
                            <div className="quest-icon" style={{ width: '32px', height: '32px', borderRadius: '8px' }}>
                              {quest.type === 'xp' && (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle' }}>
                                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                                </svg>
                              )}
                              {quest.type === 'time' && (
                                <ClockIcon style={{ color: '#3b82f6', marginRight: 0, width: '20px', height: '20px' }} />
                              )}
                              {quest.type === 'lessons' && (
                                <BookIcon style={{ color: '#10b981', marginRight: 0, width: '20px', height: '20px' }} />
                              )}
                            </div>
                            <div className="quest-content">
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                                <span style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--text)', whiteSpace: 'nowrap', textDecoration: prog.completed ? 'line-through' : 'none' }}>
                                  {translatedQuestTitles[quest.id] || quest.title}
                                </span>
                                <span style={{ fontWeight: '800', fontSize: '0.85rem', color: 'var(--accent)', whiteSpace: 'nowrap' }}>
                                  {prog.displayProgress}
                                </span>
                              </div>
                              <div className="quest-progress-bg">
                                <div className="quest-progress-fill" style={{
                                  width: `${prog.percent}%`,
                                  background: prog.completed ? '#9ca3af' : '#f59e0b'
                                }}></div>
                              </div>
                            </div>
                            <div className="quest-reward" style={{ display: 'grid', placeItems: 'center' }}>
                              {prog.completed ? (
                                <div style={{
                                  width: '22px',
                                  height: '22px',
                                  borderRadius: '50%',
                                  background: '#10b981',
                                  color: 'white',
                                  display: 'grid',
                                  placeItems: 'center',
                                  fontWeight: 'bold',
                                  fontSize: '0.8rem'
                                }}>✓</div>
                              ) : (
                                <TrophyIcon style={{ color: '#8b8d96', marginRight: 0, width: '20px', height: '20px' }} />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>


              </div>
            </div>
          )}

          {/* 3.1. Learn Tab — Duolingo-style Continuous Curriculum Path */}
          {dashboardTab === "learn" && (() => {
            const storedSkills = (() => { try { const s = getStoredAssessmentState(session?.user?.id); return s?.skill_scores || profile?.skill_scores || profile?.attempts_history?.[0]?.skillScores || {}; } catch { return {}; } })();
            const weakSkillLabels = getWeakSkills(storedSkills);

            const hasDiagnosed = hasCompletedAssessment(profile, session?.user?.id);
            const pathRecommendations = generateLearningPath(storedSkills);
            const recommendedSectionIds = pathRecommendations.map(p => p.sectionId);
            const recommendedSections = CURRICULUM_SECTIONS.filter(section =>
              recommendedSectionIds.includes(section.id)
            );

            // Render recommended sections if personalized path is enabled and custom path exists, otherwise standard curriculum
            const activeSections = (showPersonalizedPath && recommendedSections.length > 0)
              ? recommendedSections
              : CURRICULUM_SECTIONS;

            // Build a flat ordered list of all lessons in the curriculum for chain unlocking
            const allLessonsList = [];
            CURRICULUM_SECTIONS.forEach((sec) => {
              sec.units.forEach((uni) => {
                uni.lessons.forEach((les) => {
                  allLessonsList.push(les.id);
                });
              });
            });

            // Build a flat list of lessons in the personalized path
            const personalizedLessonsList = [];
            recommendedSections.forEach((sec) => {
              sec.units.forEach((uni) => {
                uni.lessons.forEach((les) => {
                  personalizedLessonsList.push(les.id);
                });
              });
            });

            // Determine starting lesson index based on diagnosed literacy level (per Spec mapping 1-5 levels)
            let unitCounter = 0;
            let renderedUnitCounter = 0;

            return (
              <div className="duo-learn-container" ref={learnJourneyRef}>
                {/* Path mode toggle — only shown when a personalized path is available */}
                {hasDiagnosed && recommendedSections.length > 0 && (
                  <div className="path-mode-toggle-wrapper">
                    <span className="path-mode-toggle-label">{t("learningMode")}</span>
                    <select
                      className="path-mode-select"
                      value={showPersonalizedPath ? "personalized" : "full"}
                      onChange={(e) => setShowPersonalizedPath(e.target.value === "personalized")}
                    >
                      <option value="personalized">{t("pathPersonalized")}</option>
                      <option value="full">{t("pathFull")}</option>
                    </select>
                  </div>
                )}

                {activeSections.map((section, secIdx) => {
                  const isSectionRecommended = weakSkillLabels.some(w => w.toLowerCase().includes(section.skillTarget?.replace("_", " ") || ""));
                  const sectionDisplayNum = showPersonalizedPath ? (secIdx + 1) : section.num;
                  const totalSectionsDisplay = activeSections.length;

                  return (
                    <div key={section.id} className="duo-section-block">
                      {/* Section Checkpoint Header */}
                      <div className="duo-section-banner" style={{ background: `linear-gradient(135deg, ${section.color} 0%, ${section.color}cc 100%)`, boxShadow: `0 8px 24px ${section.color}33` }}>
                        <span className="duo-section-banner-icon">{section.icon}</span>
                        <div className="duo-section-banner-text">
                          <span className="duo-section-banner-meta">{t("learnSectionOf").replace("{current}", sectionDisplayNum).replace("{total}", totalSectionsDisplay)}</span>
                          <h2 className="duo-section-banner-title">{t(`${section.id}_title`) || section.title}</h2>
                        </div>
                        {isSectionRecommended && showPersonalizedPath && (
                          <span className="duo-section-badge">⭐</span>
                        )}
                      </div>

                      {section.units.map((unit) => {
                        renderedUnitCounter++;
                        const unitLessons = unit.lessons;
                        const completedInUnit = unitLessons.filter(l => completedLessons.includes(l.id)).length;
                        const currentUnitIndex = unitCounter++;
                        const mascotNum = (currentUnitIndex % 4) + 1;
                        const sideClass = currentUnitIndex % 2 === 0 ? "mascot-left" : "mascot-right";

                        return (
                          <div key={unit.id} className="duo-unit-block">
                            <div className="duo-unit-header">
                              <h3 className="duo-unit-title">{t("learnUnit")} {showPersonalizedPath ? renderedUnitCounter : unit.num}</h3>
                              <span className="duo-unit-topic">{t(`${unit.id}_title`) || unit.title}</span>
                              <span className="duo-unit-progress">{completedInUnit}/{unitLessons.length} {t("learnDone") || "Done"}</span>
                            </div>

                            {/* Centered Snaking Lesson Path */}
                            <div className="duo-lessons-path" style={{ position: 'relative' }}>
                              <div className="duo-path-line"></div>

                              {/* Mascot on alternating sides per unit */}
                              <div className={`duo-path-mascot ${sideClass}`}>
                                <img
                                  src={`/as${mascotNum}.png`}
                                  alt="LISA Mascot"
                                  style={{ width: '130px', height: '130px', objectFit: 'contain' }}
                                />
                              </div>

                              {unitLessons.map((lesson, lIdx) => {
                                const isCompleted = completedLessons.includes(lesson.id);
                                const isUnlocked = (() => {
                                  // Personalized path: first lesson is open so the learner can start the flow,
                                  // then sequential unlock as previous lessons are completed.
                                  if (showPersonalizedPath && personalizedLessonsList.length > 0) {
                                    const idx = personalizedLessonsList.indexOf(lesson.id);
                                    if (idx === 0) return true;
                                    if (idx > 0) {
                                      return completedLessons.includes(personalizedLessonsList[idx - 1]);
                                    }
                                  }
                                  // Full Path: a locked sequential path for learners who want to start from the
                                  // beginning. The first lesson is open; each lesson unlocks once the prior one is
                                  // completed. Any lesson already unlocked via the personalized path stays unlocked.
                                  const lessonIndexInCurriculum = allLessonsList.indexOf(lesson.id);
                                  if (lessonIndexInCurriculum === 0) return true;
                                  const prevCompleted = lessonIndexInCurriculum > 0 && completedLessons.includes(allLessonsList[lessonIndexInCurriculum - 1]);
                                  const personalizedIdx = personalizedLessonsList.indexOf(lesson.id);
                                  const personalizedUnlocked = personalizedIdx === 0
                                    || (personalizedIdx > 0 && completedLessons.includes(personalizedLessonsList[personalizedIdx - 1]));
                                  return prevCompleted || personalizedUnlocked;
                                })();
                                const status = isCompleted ? "completed" : isUnlocked ? "unlocked" : "locked";
                                const lessonXp = lIdx === 4 ? 60 : 30;

                                // Calculate snaking offset class
                                // Path: Center -> Right -> Center -> Left -> Repeat
                                const snakePositions = ["snake-center", "snake-right", "snake-center", "snake-left"];
                                const snakeClass = snakePositions[lIdx % 4];

                                const isPopupOpen = activeLessonPopup === lesson.id;

                                // Find the active resumed lesson ID.
                                // Personalized Path: the first uncompleted lesson within the personalized list
                                // (so we scroll to the last unlocked lesson in the custom path).
                                // Full Path: start from the very first lesson (learn from the beginning).
                                const currentActiveLessonId = showPersonalizedPath && personalizedLessonsList.length > 0
                                  ? (personalizedLessonsList.find(id => !completedLessons.includes(id)) || personalizedLessonsList[personalizedLessonsList.length - 1] || allLessonsList[0])
                                  : (allLessonsList.slice(0).find(id => !completedLessons.includes(id)) || allLessonsList[0]);
                                const isActiveNode = lesson.id === currentActiveLessonId;

                                return (
                                  <div
                                    key={lesson.id}
                                    className={`duo-node-container ${snakeClass} ${status}`}
                                    style={{ zIndex: isPopupOpen ? 1100 : 2 }}
                                    ref={isActiveNode ? activeNodeRef : null}
                                  >
                                    {/* Circular Checkpoint Node */}
                                    <button
                                      type="button"
                                      className={`duo-node-circle ${status}`}
                                      style={{
                                        background: isCompleted ? '#10b981' : isUnlocked ? section.color : undefined
                                      }}
                                      onClick={() => {
                                        if (activeLessonPopup === lesson.id) {
                                          setActiveLessonPopup(null);
                                        } else {
                                          setActiveLessonPopup(lesson.id);
                                        }
                                      }}
                                    >
                                      <span className="duo-node-icon" style={{ color: isCompleted || isUnlocked ? 'white' : 'var(--muted)' }}>
                                        {isCompleted ? '✓' : lesson.icon || '📚'}
                                      </span>
                                    </button>

                                    {/* Duolingo Info Popover */}
                                    {isPopupOpen && (
                                      <div className="duo-popover-card">
                                        <div className="duo-popover-header">
                                          <span className="duo-popover-badge" style={{
                                            background: isCompleted ? 'rgba(16, 185, 129, 0.15)' : isUnlocked ? `${section.color}22` : 'rgba(120, 120, 120, 0.15)',
                                            color: isCompleted ? '#0f9d6b' : isUnlocked ? section.color : '#8a8f98'
                                          }}>
                                            {status === "completed" ? `✓ ${t("learnDone") || "Done"}` : status === "unlocked" ? (t("learnReady") || "Ready") : `🔒 ${t("learnLocked") || "Locked"}`}
                                          </span>
                                          <span className="duo-popover-xp">+{lessonXp} XP</span>
                                        </div>
                                        <h4 className="duo-popover-title">{(t(`${unit.id}_title`) || unit.title)} — {lIdx === 4 ? (t("learnUnitExam") || "Unit Exam") : (t("learnLesson").replace("{num}", lIdx + 1))}</h4>
                                        <p className="duo-popover-desc">
                                          {lIdx === 4
                                            ? (t("learnUnitExamDesc") || "A comprehensive unit exam testing skills from the first 4 lessons.")
                                            : getDynamicLessonDescription(lesson, unit, selectedLanguage)}
                                        </p>

                                        <button
                                          type="button"
                                          className="duo-popover-btn"
                                          disabled={status === "locked" || lessonLoading}
                                          onClick={() => {
                                            setActiveLessonPopup(null);
                                            startLessonSession(lesson, section, unit);
                                          }}
                                          style={{
                                            background: isCompleted ? '#10b981' : isUnlocked ? section.color : '#6b7280',
                                            boxShadow: isCompleted ? '0 4px 12px rgba(16, 185, 129, 0.3)' : isUnlocked ? `0 4px 12px ${section.color}55` : 'none'
                                          }}
                                        >
                                          {lIdx === 4
                                            ? (status === "completed" ? (t("learnReviewExam") || "Review Exam") : (t("learnStartExam") || "Start Exam"))
                                            : (status === "completed" ? (t("learnReviewLesson") || "Review Lesson") : (t("learnStartLesson") || "Start Lesson"))}
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}

                {/* Floating Scroll to Top button */}
                <button
                  type="button"
                  className="scroll-top-btn"
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    learnJourneyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  title="Scroll to Top"
                  aria-label="Scroll to top of learning path"
                >
                  ↑
                </button>
              </div>
            );
          })()}


          {/* 3.2. Practice Tab */}
          {dashboardTab === "practice" && (
            practiceCollectionPage === "mistakes" ? (
              <div className="duo-practice-page">
                <button type="button" className="duo-practice-back" onClick={() => setPracticeCollectionPage(null)} aria-label="Back to practice">
                  <span>←</span>
                  <span>Practice</span>
                </button>

                <section className="duo-practice-hero">
                  <div className="duo-hero-icon duo-hero-mistakes" aria-hidden="true">
                    <span>💔</span>
                  </div>
                  <h1>Review your recent mistakes</h1>
                  <button type="button" className="primary-btn duo-start-btn" onClick={() => startCollectionPractice("mistakes")}>START +20 XP</button>
                </section>

                <div className="duo-practice-divider" />

                <section className="duo-collection-section">
                  <h2>{recentMistakes.length} mistakes</h2>
                  <div className="duo-mistake-list">
                    {recentMistakes.map((mistake, idx) => (
                      <button
                        type="button"
                        className="duo-mistake-row"
                        key={mistake.id || idx}
                        onClick={() => {
                          setActiveSolveMistake(mistake);
                          setActiveSolveInput("");
                          setActiveSolveFeedback(null);
                        }}
                      >
                        <span className="duo-broken-heart" aria-hidden="true">💔</span>
                        <span className="duo-mistake-copy">
                          <span className="duo-row-kicker">{mistake.prompt || mistake.type}</span>
                          <span className="duo-row-main">{mistake.text}</span>
                          <span className="duo-row-action-hint">Tap to Solve & Correct</span>
                        </span>
                      </button>
                    ))}
                  </div>

                  {activeSolveMistake && (
                    <div className="duo-solve-modal-overlay">
                      <div className="duo-solve-modal">
                        <button type="button" className="duo-solve-close" onClick={() => { setActiveSolveMistake(null); setActiveSolveFeedback(null); setActiveSolveInput(""); }}>✕</button>
                        <div className="duo-solve-icon">💔</div>
                        <h3 className="duo-solve-title">Correct Your Mistake</h3>
                        <p className="duo-solve-type">{activeSolveMistake.prompt || activeSolveMistake.type}</p>
                        <div className="duo-solve-copy-box">
                          <p className="duo-solve-question-text">{activeSolveMistake.text}</p>
                        </div>

                        <div className="duo-solve-input-area">
                          <input
                            type="text"
                            className="duo-solve-input"
                            placeholder="Type the correct answer here..."
                            value={activeSolveInput}
                            onChange={(e) => setActiveSolveInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleDirectSolveCheck();
                            }}
                            autoFocus
                          />
                          <button type="button" className="primary-btn duo-solve-check-btn" onClick={handleDirectSolveCheck}>Check Answer</button>
                        </div>

                        {activeSolveFeedback === "correct" && (
                          <div className="duo-solve-feedback correct">
                            <span className="feedback-icon">🎉</span>
                            <div>
                              <h4>Excellent Job!</h4>
                              <p>Resolved and removed from mistakes list. +5 XP awarded!</p>
                            </div>
                          </div>
                        )}

                        {activeSolveFeedback === "incorrect" && (
                          <div className="duo-solve-feedback incorrect">
                            <span className="feedback-icon">💡</span>
                            <div>
                              <h4>Let's try again!</h4>
                              <p>Think about the correct spelling or translation. Hint: "{activeSolveMistake.correctAnswer}"</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </section>
              </div>
            ) : practiceCollectionPage === "words" ? (
              <div className="duo-practice-page">
                <button type="button" className="duo-practice-back" onClick={() => setPracticeCollectionPage(null)} aria-label="Back to practice">
                  <span>←</span>
                  <span>Practice</span>
                </button>

                <section className="duo-practice-hero">
                  <div className="duo-hero-icon duo-hero-words" aria-hidden="true">
                    <span>📚</span>
                  </div>
                  <h1>Practice your {selectedLanguage || "English"} words</h1>
                  <button type="button" className="primary-btn duo-start-btn" onClick={() => startCollectionPractice("words")}>START +10 XP</button>
                </section>

                <div className="duo-practice-divider" />

                <section className="duo-collection-section">
                  <div className="duo-collection-head">
                    <h2>{practiceWords.length} words</h2>
                    <button type="button" className="duo-sort-btn">RECENTLY LEARNED <span>▼</span></button>
                  </div>
                  <div className="duo-word-list">
                    {practiceWords.map((item, idx) => (
                      <button type="button" className="duo-word-row" key={`word_${item.word}_${idx}`} onClick={() => speakWord(item.word)}>
                        <span className="duo-audio-icon" aria-hidden="true">🔊</span>
                        <span className="duo-word-copy">
                          <span className="duo-word-term">{item.word}</span>
                          <span className="duo-word-meaning">{item.meaning}</span>
                        </span>
                        {item.isNew && <span className="duo-new-dot" aria-label="Recently learned" />}
                      </button>
                    ))}
                  </div>
                </section>
              </div>
            ) : practiceCollectionPage === "pronunciation" ? (
              <div className="duo-practice-page pronunciation-env">
                <button type="button" className="duo-practice-back" onClick={() => { setPracticeCollectionPage(null); window.speechSynthesis?.cancel(); }} aria-label="Back to practice">
                  <span>←</span>
                  <span>Practice</span>
                </button>

                {pronunciationLoading ? (
                  <div className="pronunciation-loading-box">
                    <div className="duo-spinner"></div>
                    <p>Loading pronunciation exercises...</p>
                  </div>
                ) : pronunciationQuestions.length === 0 ? (
                  <div className="pronunciation-empty-box">
                    <p>No sentences available. Please try again.</p>
                    <button
                      type="button"
                      className="primary-btn"
                      style={{ marginTop: 16 }}
                      onClick={() => {
                        setPronunciationLoading(true);
                        const level = calculateProgressiveLevel(profile, completedLessons);
                        const levelName = level >= 9 ? "Advanced" : level >= 5 ? "Intermediate" : "Beginner";
                        generatePracticeContent({
                          practiceType: "Perfect Pronunciation",
                          language: learningLanguage || "English",
                          literacyLevel: level,
                          literacyLevelName: levelName,
                          interfaceLanguage: selectedLanguage || "English",
                          useFallback: true
                        }).then(res => {
                          if (res && res.questions) setPronunciationQuestions(res.questions);
                          setPronunciationStep(0);
                          setPronunciationScore(null);
                          setPronouncedWordsMatch([]);
                          setSpokenText("");
                          setPronunciationLoading(false);
                        }).catch(() => setPronunciationLoading(false));
                      }}
                    >Retry</button>
                  </div>
                ) : (() => {
                  const currentQuestion = pronunciationQuestions[pronunciationStep];
                  if (!currentQuestion) return null;
                  const sentence = currentQuestion.sentence || currentQuestion.text || "";
                  const translation = currentQuestion.englishTranslation || currentQuestion.translation || "";
                  const total = pronunciationQuestions.length;

                  const scoreColor = pronunciationScore === null ? null
                    : pronunciationScore >= 80 ? "#10b981"
                    : pronunciationScore >= 50 ? "#f59e0b"
                    : "#ef4444";

                  const scoreLabel = pronunciationScore === null ? null
                    : pronunciationScore >= 80 ? "Excellent! 🎉"
                    : pronunciationScore >= 50 ? "Good try! 💪"
                    : "Keep practicing! 🔄";

                  return (
                    <div style={{
                      maxWidth: 600,
                      margin: "24px auto",
                      padding: "0 16px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 20
                    }}>
                      {/* Progress bar */}
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{
                          flex: 1,
                          height: 8,
                          background: "var(--line)",
                          borderRadius: 99,
                          overflow: "hidden"
                        }}>
                          <div style={{
                            height: "100%",
                            width: `${((pronunciationStep + 1) / total) * 100}%`,
                            background: "var(--accent)",
                            borderRadius: 99,
                            transition: "width 0.4s ease"
                          }} />
                        </div>
                        <span style={{
                          fontSize: "0.8rem",
                          fontWeight: 700,
                          color: "var(--text-muted)",
                          whiteSpace: "nowrap"
                        }}>{pronunciationStep + 1} / {total}</span>
                      </div>

                      {/* Main sentence card */}
                      <div style={{
                        background: "var(--panel)",
                        border: "2px solid var(--line)",
                        borderRadius: 24,
                        padding: "32px 28px",
                        textAlign: "center",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.06)"
                      }}>
                        {/* Language label */}
                        <div style={{
                          display: "inline-block",
                          background: "var(--accent-soft)",
                          color: "var(--accent)",
                          fontSize: "0.72rem",
                          fontWeight: 800,
                          letterSpacing: 1,
                          padding: "4px 14px",
                          borderRadius: 99,
                          marginBottom: 20,
                          textTransform: "uppercase"
                        }}>
                          🗣️ {learningLanguage || "English"} — Sentence {pronunciationStep + 1}
                        </div>

                        {/* THE SENTENCE — main display */}
                        <div style={{
                          fontSize: "clamp(1.4rem, 4vw, 2rem)",
                          fontWeight: 800,
                          lineHeight: 1.5,
                          color: "var(--text)",
                          marginBottom: 16,
                          padding: "0 8px",
                          minHeight: 60,
                          display: "flex",
                          flexWrap: "wrap",
                          justifyContent: "center",
                          gap: "6px 10px",
                          alignItems: "center"
                        }}>
                          {pronouncedWordsMatch.length > 0
                            ? pronouncedWordsMatch.map((m, i) => (
                              <span key={i} style={{
                                padding: "2px 8px",
                                borderRadius: 8,
                                background: m.isCorrect ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.12)",
                                color: m.isCorrect ? "#059669" : "#ef4444",
                                fontWeight: 800,
                                transition: "all 0.3s"
                              }}>{m.word}</span>
                            ))
                            : sentence.split(/\s+/).filter(Boolean).map((w, i) => (
                              <span key={i} style={{
                                padding: "2px 8px",
                                borderRadius: 8,
                                color: "var(--text)",
                                fontWeight: 800
                              }}>{w}</span>
                            ))
                          }
                        </div>

                        {/* Translation toggle */}
                        {translation && (
                          <div>
                            <button
                              type="button"
                              onClick={() => setShowTranslation(!showTranslation)}
                              style={{
                                background: "none",
                                border: "1.5px solid var(--line)",
                                borderRadius: 99,
                                padding: "5px 16px",
                                fontSize: "0.8rem",
                                fontWeight: 700,
                                color: "var(--text-muted)",
                                cursor: "pointer",
                                transition: "all 0.2s"
                              }}
                            >
                              {showTranslation ? "Hide" : "Show"} Translation
                            </button>
                            {showTranslation && (
                              <div style={{
                                marginTop: 12,
                                padding: "10px 16px",
                                background: "var(--bg)",
                                borderRadius: 12,
                                fontSize: "0.95rem",
                                color: "var(--text-muted)",
                                fontStyle: "italic"
                              }}>
                                {translation}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* TTS buttons */}
                      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                        <button
                          type="button"
                          onClick={() => { setSlowSpeed(false); speakText(sentence, 1.0); }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            background: "var(--panel)",
                            border: "2px solid var(--accent)",
                            color: "var(--accent)",
                            borderRadius: 16,
                            padding: "12px 24px",
                            fontWeight: 800,
                            fontSize: "0.95rem",
                            cursor: "pointer",
                            transition: "all 0.2s"
                          }}
                        >
                          🔊 Normal Speed
                        </button>
                        <button
                          type="button"
                          onClick={() => { setSlowSpeed(true); speakText(sentence, 0.5); }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            background: "var(--panel)",
                            border: "2px solid #10b981",
                            color: "#10b981",
                            borderRadius: 16,
                            padding: "12px 24px",
                            fontWeight: 800,
                            fontSize: "0.95rem",
                            cursor: "pointer",
                            transition: "all 0.2s"
                          }}
                        >
                          🐢 Slow Speed
                        </button>
                      </div>

                      {/* Score display */}
                      {pronunciationScore !== null && (
                        <div style={{
                          background: "var(--panel)",
                          border: `2px solid ${scoreColor}`,
                          borderRadius: 20,
                          padding: "20px 24px",
                          textAlign: "center",
                          animation: "slideUp 0.3s ease"
                        }}>
                          <div style={{ fontSize: "2.5rem", fontWeight: 900, color: scoreColor }}>
                            {pronunciationScore}%
                          </div>
                          <div style={{ fontWeight: 800, color: scoreColor, fontSize: "1.1rem", marginBottom: 8 }}>
                            {scoreLabel}
                          </div>
                          {pronunciationScore >= 80 && (
                            <div style={{ fontSize: "0.85rem", color: "#10b981", fontWeight: 700 }}>+10 XP Awarded! ⚡</div>
                          )}
                          {spokenText && (
                            <div style={{
                              marginTop: 10,
                              fontSize: "0.85rem",
                              color: "var(--text-muted)",
                              background: "var(--bg)",
                              padding: "8px 14px",
                              borderRadius: 12
                            }}>
                              You said: "<i>{spokenText}</i>"
                            </div>
                          )}
                        </div>
                      )}

                      {/* Mic button */}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                        <button
                          type="button"
                          onClick={() => startListeningPronunciation(sentence)}
                          disabled={isRecordingPronunciation}
                          style={{
                            background: isRecordingPronunciation
                              ? "linear-gradient(135deg, #ef4444, #dc2626)"
                              : "linear-gradient(135deg, var(--accent), #7c3aed)",
                            color: "white",
                            border: "none",
                            borderRadius: 50,
                            padding: "18px 48px",
                            fontSize: "1.15rem",
                            fontWeight: 800,
                            cursor: isRecordingPronunciation ? "not-allowed" : "pointer",
                            boxShadow: isRecordingPronunciation
                              ? "0 8px 24px rgba(239,68,68,0.4)"
                              : "0 8px 24px rgba(124,58,237,0.35)",
                            transition: "all 0.2s",
                            transform: isRecordingPronunciation ? "scale(0.97)" : "scale(1)"
                          }}
                        >
                          {isRecordingPronunciation ? "🎙️ Listening…" : "🎤 Tap to Speak"}
                        </button>

                        {isRecordingPronunciation && (
                          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                            {[0, 1, 2, 3, 4].map(i => (
                              <div key={i} style={{
                                width: 6,
                                height: 6,
                                background: "#ef4444",
                                borderRadius: "50%",
                                animation: `recordRipple 1.2s ${i * 0.15}s infinite ease-in-out`
                              }} />
                            ))}
                          </div>
                        )}

                        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>
                          Listen first, then speak the sentence
                        </div>
                      </div>

                      {/* Navigation buttons */}
                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        borderTop: "1.5px solid var(--line)",
                        paddingTop: 20
                      }}>
                        <button
                          type="button"
                          onClick={() => {
                            if (pronunciationStep > 0) {
                              setPronunciationStep(p => p - 1);
                              setPronunciationScore(null);
                              setPronouncedWordsMatch([]);
                              setSpokenText("");
                              setShowTranslation(false);
                            }
                          }}
                          disabled={pronunciationStep === 0}
                          style={{
                            background: "var(--panel)",
                            border: "2px solid var(--line)",
                            borderRadius: 14,
                            padding: "12px 24px",
                            fontWeight: 700,
                            fontSize: "0.95rem",
                            cursor: pronunciationStep === 0 ? "not-allowed" : "pointer",
                            opacity: pronunciationStep === 0 ? 0.4 : 1,
                            color: "var(--text)"
                          }}
                        >
                          ← Previous
                        </button>

                        {pronunciationStep < total - 1 ? (
                          <button
                            type="button"
                            onClick={() => {
                              setPronunciationStep(p => p + 1);
                              setPronunciationScore(null);
                              setPronouncedWordsMatch([]);
                              setSpokenText("");
                              setShowTranslation(false);
                              window.speechSynthesis?.cancel();
                            }}
                            style={{
                              background: "linear-gradient(135deg, var(--accent), #7c3aed)",
                              color: "white",
                              border: "none",
                              borderRadius: 14,
                              padding: "12px 32px",
                              fontWeight: 800,
                              fontSize: "0.95rem",
                              cursor: "pointer",
                              boxShadow: "0 4px 16px rgba(124,58,237,0.3)"
                            }}
                          >
                            Next →
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setPracticeCollectionPage(null);
                              window.speechSynthesis?.cancel();
                            }}
                            style={{
                              background: "linear-gradient(135deg, #10b981, #059669)",
                              color: "white",
                              border: "none",
                              borderRadius: 14,
                              padding: "12px 32px",
                              fontWeight: 800,
                              fontSize: "0.95rem",
                              cursor: "pointer",
                              boxShadow: "0 4px 16px rgba(16,185,129,0.35)"
                            }}
                          >
                            ✅ Finish Practice
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="practice-grid-layout">
                <div className="practice-content-column">
                  <div className="practice-section">
                    <h2 className="practice-section-title">{t("practiceConversation")}</h2>
                    <div className="practice-row-cards">
                      <div className="practice-row-card" onClick={() => startLessonSession({ id: `l${currentLevelNum}_speak_practice`, title: "Speak Practice", desc: "Improve your speaking skills with these phrases" })}>
                        <div className="practice-row-card-content">
                          <h3 className="practice-row-card-title">{t("practiceSpeak") || "Speak"}</h3>
                          <p className="practice-row-card-desc">{t("practiceSpeakDesc")}</p>
                        </div>
                        <div className="practice-row-card-icon speak-icon">🗣️</div>
                      </div>
                      <div className="practice-row-card" onClick={() => startLessonSession({ id: `l${currentLevelNum}_read_practice`, title: "Read Practice", desc: "Improve your reading comprehension and vocabulary" })}>
                        <div className="practice-row-card-content">
                          <h3 className="practice-row-card-title">{t("practiceRead") || "Read"}</h3>
                          <p className="practice-row-card-desc">{t("practiceReadDesc") || "Improve your reading comprehension and vocabulary"}</p>
                        </div>
                        <div className="practice-row-card-icon read-icon">📖</div>
                      </div>
                      <div className="practice-row-card" onClick={() => startLessonSession({ id: `l${currentLevelNum}_write_practice`, title: "Write Practice", desc: "Enhance your writing skills with interactive exercises" })}>
                        <div className="practice-row-card-content">
                          <h3 className="practice-row-card-title">{t("practiceWrite") || "Write"}</h3>
                          <p className="practice-row-card-desc">{t("practiceWriteDesc") || "Enhance your writing skills with interactive exercises"}</p>
                        </div>
                        <div className="practice-row-card-icon write-icon">✍️</div>
                      </div>

                      <div className="practice-row-card" onClick={() => openPracticeCollection("pronunciation")}>
                        <div className="practice-row-card-content">
                          <h3 className="practice-row-card-title">
                            {t("practicePronunciation") || "Pronunciation"}
                          </h3>
                          <p className="practice-row-card-desc">
                            {t("practicePronunciationDesc") || "Improve your pronunciation and speak more clearly"}
                          </p>
                        </div>
                        <div className="practice-row-card-icon pronunciation-icon">🗣️</div>
                      </div>
                    </div>
                  </div>

                  <div className="practice-section">
                    <h2 className="practice-section-title">{t("practiceYourCollections")}</h2>
                    <div className="practice-row-cards">

                      <div className="practice-row-card" onClick={() => startCollectionPractice("words")}>
                        <div className="practice-row-card-content">
                          <h3 className="practice-row-card-title">
                            {t("practiceWords")}
                          </h3>
                          <p className="practice-row-card-desc">{t("practiceWordsDesc")}</p>
                        </div>
                        <div className="practice-row-card-icon words-icon">📚</div>
                      </div>



                      <div className="practice-row-card" onClick={() => startLessonSession({ id: `l${currentLevelNum}_comp_practice`, title: "Stories Practice", desc: "Reread a story to review words in context" })}>
                        <div className="practice-row-card-content">
                          <h3 className="practice-row-card-title">{t("practiceStories")}</h3>
                          <p className="practice-row-card-desc">{t("practiceStoriesDesc")}</p>
                        </div>
                        <div className="practice-row-card-icon stories-icon">📖</div>
                      </div>
                    </div>
                  </div>

                  <FunLearnZone
                    t={t}
                    learningLanguage={learningLanguage}
                    interfaceLanguage={selectedLanguage || "English"}
                    speakText={speakText}
                    onXpEarned={(amount) => {
                      const newXp = userXp + amount;
                      setUserXp(newXp);
                      if (session?.user?.id) {
                        const userId = session.user.id;
                        const todayStr = new Date().toLocaleDateString("en-CA");
                        const storedDailyXp = localStorage.getItem(`lisa_daily_xp_${userId}_${todayStr}`);
                        const nextDailyXp = (storedDailyXp ? parseInt(storedDailyXp, 10) : 0) + amount;
                        setDailyXp(nextDailyXp);
                        localStorage.setItem(`lisa_daily_xp_${userId}_${todayStr}`, nextDailyXp);
                        supabase.from("profiles").update({ xp: newXp }).eq("id", userId);
                        recordWeeklyXp(amount);
                      }
                    }}
                  />
                </div>
              </div>
            )
          )}

          {/* 3.3. Profile Tab */}
          {dashboardTab === "profile" && (
            <div className="profile-view-container">
              <div className="profile-layout-grid">
                <div className="profile-sidebar">
                  <div className="profile-card-large">
                    <div
                      className="profile-cover"
                      style={(() => {
                        const bannerObj = SHOP_CATALOG.banners.find(b => b.id === shopBanner);
                        return bannerObj
                          ? { backgroundImage: `url(${bannerObj.image})` }
                          : { backgroundImage: "url('https://media.globaldev.tech/images/header_kids_learning.format-jpeg.jpg')" };
                      })()}
                    />
                    <div className="profile-card-body">
                      <div className="profile-avatar-large">
                        {(() => {
                          const resolved = resolveProfileAvatar(profileAvatar);
                          if (profileAvatar && currentLevelNum >= 10 && resolved?.type === "photo") {
                            return <img src={resolved.value} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />;
                          }
                          if (resolved?.type === "emoji") {
                            return <span style={{ fontSize: "3.2rem" }}>{resolved.emoji}</span>;
                          }
                          if (resolved?.type === "builder") {
                            const shape = AVATAR_SHAPE_STYLE[resolved.shape] || AVATAR_SHAPE_STYLE.circle;
                            return (
                              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: resolved.bg, ...shape }}>
                                <span style={{ fontSize: "3.2rem" }}>{resolved.emoji}</span>
                              </div>
                            );
                          }
                          return getUserInitials(profile?.full_name);
                        })()}

                        {/* Custom profile picture upload is unlocked once the learner reaches Section 10. */}
                        {/* Until then, the avatar is shown as initials (or an emoji avatar from the shop). */}
                        {currentLevelNum >= 10 && (
                          <>
                            {/* Direct Image File Uploader Input */}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleAvatarUpload}
                              disabled={submitting}
                              style={{ display: "none" }}
                              id="direct-avatar-upload-file"
                            />

                            {/* Pencil Edit Badge overlay at bottom right */}
                            <label
                              htmlFor="direct-avatar-upload-file"
                              style={{
                                position: "absolute",
                                bottom: "4px",
                                right: "4px",
                                width: "32px",
                                height: "32px",
                                borderRadius: "50%",
                                background: "var(--accent)",
                                color: "white",
                                display: "grid",
                                placeItems: "center",
                                cursor: "pointer",
                                fontSize: "0.85rem",
                                boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
                                transition: "all 0.15s ease",
                                border: "none",
                                zIndex: 20
                              }}
                              title={submitting ? "Uploading image..." : "Upload Profile Picture"}
                              className="profile-avatar-edit-badge"
                            >
                              {submitting ? (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 1s linear infinite" }}>
                                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                                </svg>
                              ) : (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                  <path d="m15 5 4 4" />
                                </svg>
                              )}
                            </label>
                          </>
                        )}

                        {/* Locked hint before Section 10 */}
                        {currentLevelNum < 10 && (
                          <div
                            title="Unlocks at Section 10"
                            style={{
                              position: "absolute",
                              bottom: "4px",
                              right: "4px",
                              width: "32px",
                              height: "32px",
                              borderRadius: "50%",
                              background: "rgba(0,0,0,0.45)",
                              color: "white",
                              display: "grid",
                              placeItems: "center",
                              fontSize: "0.85rem",
                              boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
                              zIndex: 20
                            }}
                          >
                            🔒
                          </div>
                        )}
                      </div>
                      <div className="profile-info-large">
                        <h2>{profile?.full_name || "Learner"}</h2>
                        <p>{session.user.email}</p>
                        <div className="profile-details-list">
                          <span>{t("profileAge")}: {profile?.age || t("naText")}</span>
                          <span>{t("profileEducation")}: {profile?.education_level ? t(profile.education_level + "Option") : t("naText")}</span>
                          {profile?.experience_level && (
                            <span>{t("profileExperienceStatus")}: {t(experienceLevelOptionKeys[profile.experience_level] || profile.experience_level)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Duolingo-like Tabbed Profile Sub-navigation */}
                  <div className="profile-sub-tabs">
                    <button
                      type="button"
                      className={`profile-sub-tab-btn ${profileSubTab === "stats" ? "active" : ""}`}
                      onClick={() => setProfileSubTab("stats")}
                    >
                      📊 {t("profileStatsBadges")}
                    </button>
                    <button
                      type="button"
                      className={`profile-sub-tab-btn ${profileSubTab === "avatar" ? "active" : ""}`}
                      onClick={() => setProfileSubTab("avatar")}
                    >
                      🎨 {t("profileAvatarCreator")}
                    </button>
                    <button
                      type="button"
                      className={`profile-sub-tab-btn ${profileSubTab === "settings" ? "active" : ""}`}
                      onClick={() => setProfileSubTab("settings")}
                    >
                      ⚙️ {t("profileAccountSettings")}
                    </button>
                    <button
                      type="button"
                      className={`profile-sub-tab-btn ${profileSubTab === "feedback" ? "active" : ""}`}
                      onClick={() => setProfileSubTab("feedback")}
                    >
                      💬 {t("profileFeedbackTab") || "Feedback & Bugs"}
                    </button>
                  </div>
                </div>

                <div className="profile-main-content">
                  <div className="profile-tab-content-area">
                    {profileSubTab === "stats" && (
                  <div className="profile-stats-dashboard">
                    <div className="profile-stats-grid">
                      <div className="profile-stat-card streak">
                        <div className="stat-icon">🔥</div>
                        <div className="stat-content">
                          <div className="stat-val">{streakCount} {streakCount === 1 ? "Day" : "Days"}</div>
                           <div className="stat-lbl">{t("dashboardDayStreak")}</div>
                        </div>
                      </div>
                      <div className="profile-stat-card xp">
                        <div className="stat-icon">💎</div>
                        <div className="stat-content">
                          <div className="stat-val">{userXp.toLocaleString()}</div>
                           <div className="stat-lbl">{t("dashboardTotalXP")}</div>
                        </div>
                      </div>
                      <div className="profile-stat-card lessons">
                        <div className="stat-icon">🏆</div>
                        <div className="stat-content">
                          <div className="stat-val">{completedLessons.length}</div>
                           <div className="stat-lbl">{t("dashboardLessonsDone")}</div>
                        </div>
                      </div>
                      <div className="profile-stat-card active-time">
                        <div className="stat-icon">⏱️</div>
                        <div className="stat-content">
                          <div className="stat-val">{Math.round(dailyTimeSpent / 60)}m</div>
                           <div className="stat-lbl">{t("dashboardActiveToday")}</div>
                        </div>
                      </div>
                    </div>

                    <div className="profile-badges-container">
                       <h3 className="profile-section-title">{t("profileEquippedBadges")}</h3>
                      <div className="profile-badges-grid">
                        {profileBadges.length === 0 ? (
                          <div className="profile-badges-empty">
                            <span className="empty-icon">🛡️</span>
                             <p>{t("profileBadgesEmpty")}</p>
                          </div>
                        ) : (
                          profileBadges.map((badgeId) => {
                            const badge = SHOP_CATALOG.badges.find(b => b.id === badgeId);
                            if (!badge) return null;
                            const localizedName = t(badge.id + "_name");
                            const localizedDesc = t(badge.id + "_desc");
                            return (
                              <div key={badgeId} className="profile-badge-item" title={localizedDesc || badge.desc}>
                                <span className="profile-badge-icon">{badge.icon}</span>
                                <div className="profile-badge-meta">
                                  <span className="profile-badge-name">{localizedName || badge.name}</span>
                                   <span className="profile-badge-rarity">{t(badge.rarity)}</span>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    <div className="achievements-card">
                      <div className="achievements-card-header">
                        <h4>{t("badgesEarned")}</h4>
                        <button className="achievements-view-all" onClick={() => setShowAllAchievementsModal(true)}>{t("dashboardViewAll")}</button>
                      </div>
                      <div className="achievements-list">
                        {(() => {
                          const achievementsList = ACHIEVEMENT_DEFS.map((a) => {
                            let earned = false;
                            let progress = 0;
                            switch (a.id) {
                              case 1:
                                earned = true; progress = 100; break;
                              case 2:
                                earned = calculateSkillProficiency("reading") >= 75;
                                progress = Math.min(100, Math.round(calculateSkillProficiency("reading"))); break;
                              case 3:
                                earned = calculateSkillProficiency("reading_comprehension") >= 75;
                                progress = Math.min(100, Math.round(calculateSkillProficiency("reading_comprehension"))); break;
                              case 4:
                                earned = calculateSkillProficiency("writing") >= 75;
                                progress = Math.min(100, Math.round(calculateSkillProficiency("writing"))); break;
                              case 5:
                                earned = userXp >= 100;
                                progress = Math.min(100, Math.round((userXp / 100) * 100)); break;
                              case 6:
                                earned = completedLessons.filter(id => !id.startsWith("ach_")).length >= 3;
                                progress = Math.min(100, Math.round((completedLessons.filter(id => !id.startsWith("ach_")).length / 3) * 100)); break;
                              case 7:
                                earned = calculateSkillProficiency("reading_ability") >= 75;
                                progress = Math.min(100, Math.round(calculateSkillProficiency("reading_ability"))); break;
                              case 8:
                                earned = currentLevelNum >= 8;
                                progress = Math.min(100, Math.round((currentLevelNum / 8) * 100)); break;
                              case 9:
                                earned = currentLevelNum >= 12;
                                progress = Math.min(100, Math.round((currentLevelNum / 12) * 100)); break;
                              default: break;
                            }
                            return { ...a, earned, progress };
                          });

                          // Find chronologically earned achievements from completed_lessons order
                          const earnedAchievementIds = completedLessons
                            .filter(id => id.startsWith("ach_"))
                            .map(id => parseInt(id.replace("ach_", ""), 10));

                          // Find corresponding badge definitions
                          const earnedList = earnedAchievementIds
                            .map(id => achievementsList.find(a => a.id === id))
                            .filter(Boolean);

                          // Include owned shop badges as achievements
                          const shopBadgesDefs = SHOP_CATALOG.badges.map((b) => ({
                            id: b.id,
                            title: t(b.id + "_name") || b.name,
                            desc: t(b.id + "_desc") || b.desc,
                            icon: b.icon,
                            color: b.rarity === "legendary" ? "#d97706" : b.rarity === "rare" ? "#3b82f6" : "#6b7280",
                            earned: true,
                            progress: 100
                          }));
                          const ownedShopBadges = shopBadgesDefs.filter(b => shopOwnedItems.includes(b.id));

                          const combinedEarnedList = [...earnedList, ...ownedShopBadges];

                          // Display only the last 2 recently earned badges, or the first two items in general if none earned yet
                          const displayedList = combinedEarnedList.length > 0
                            ? combinedEarnedList.slice(-2)
                            : achievementsList.slice(0, 2);

                          return displayedList.map((a) => (
                            <div key={a.id} className={`achievement-row ${a.earned ? "earned" : ""}`}>
                              <div className="achievement-badge-box" style={{ background: a.earned ? a.color : 'var(--line)' }}>
                                <span className="achievement-badge-icon">{a.earned ? a.icon : '🔒'}</span>
                              </div>
                              <div className="achievement-info">
                                <div className="achievement-info-header">
                                  <span className="achievement-title">{a.id.toString().startsWith("badge_") ? a.title : (translatedAchievements[a.id]?.title || a.title)}</span>
                                </div>
                                <p className="achievement-desc">{a.id.toString().startsWith("badge_") ? a.desc : (translatedAchievements[a.id]?.desc || a.desc)}</p>
                                <div className="achievement-progress-track">
                                  <div className="achievement-progress-fill" style={{ width: `${a.progress}%`, background: '#facc15' }}></div>
                                </div>
                              </div>
                            </div>
                          ));
                        })()}
                      </div>
                    </div>
                  </div>
                )}

                {profileSubTab === "avatar" && (
                  <div className="profile-avatar-creator-tab">
                    <div className="avatar-creator-grid">
                      {/* Left Pane: Preview */}
                      <div className="avatar-creator-preview-card">
                        <div
                          className="avatar-creator-large-preview"
                          style={{
                            background: builderBg,
                            borderRadius: "16px"
                          }}
                        >
                          <span>{builderEmoji}</span>
                        </div>
                        <button
                          type="button"
                          className="primary-btn avatar-creator-save-btn"
                          disabled={submitting}
                          onClick={() => handleSaveAvatarBuilder({
                            type: "builder",
                            emoji: builderEmoji,
                            bg: builderBg,
                            shape: "square"
                          })}
                        >
                            {submitting ? "Saving..." : t("avatarSaveAndSet")}
                        </button>
                      </div>

                      {/* Right Pane: Controls */}
                      <div className="avatar-creator-options-card">
                        {/* 1. Emoji Selection */}
                        <div className="avatar-creator-section">
                          <h4>{t("avatarChooseFaceEmoji")}</h4>
                          <div className="avatar-options-emoji-grid">
                            {[
                              "😊", "😎", "🤩", "🥳", "😄", "😁", "🤓", "🧐", "😇", "🥰",
                              "😏", "🤔", "🤗", "😤", "😌", "🥸", "😝", "🤑", "😈", "👽",
                              "🤖", "💀", "👻", "🎭", "🦸", "🦹", "🧛", "🧟", "🧜", "🧚"
                            ].map((em) => (
                              <button
                                key={em}
                                type="button"
                                className={`avatar-option-btn ${builderEmoji === em ? "active" : ""}`}
                                onClick={() => setBuilderEmoji(em)}
                              >
                                {em}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Presets Unlocked */}
                        {shopOwnedItems.filter(id => id.startsWith("avatar_")).length > 0 && (
                          <div className="avatar-creator-section">
                            <h4>{t("avatarUnlockedPresets")}</h4>
                            <div className="avatar-options-emoji-grid">
                              {shopOwnedItems.filter(id => id.startsWith("avatar_")).map((id) => {
                                const itemObj = SHOP_CATALOG.avatars.find(a => a.id === id);
                                if (!itemObj) return null;
                                return (
                                  <button
                                    key={id}
                                    type="button"
                                    className={`avatar-option-btn ${builderEmoji === itemObj.emoji ? "active" : ""}`}
                                    onClick={() => setBuilderEmoji(itemObj.emoji)}
                                  >
                                    {itemObj.emoji}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* 2. Background Color */}
                        <div className="avatar-creator-section">
                          <h4>{t("avatarBackgroundColor")}</h4>
                          <div className="avatar-options-color-grid">
                            {[
                              "#6366f1", "#8b5cf6", "#ec4899", "#ef4444", "#f97316",
                              "#eab308", "#22c55e", "#10b981", "#06b6d4", "#3b82f6",
                              "#1e293b", "#78716c", "#e86b6b", "#9333ea", "#0d9488"
                            ].map((col) => (
                              <button
                                key={col}
                                type="button"
                                className={`avatar-option-color ${builderBg === col ? "active" : ""}`}
                                style={{ background: col }}
                                onClick={() => setBuilderBg(col)}
                                aria-label={`Select color ${col}`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {profileSubTab === "settings" && (
                  <div className="profile-settings-tab">
                    <div className="profile-settings-tab-grid">
                      <div className="profile-settings-card">
                        <h3 className="profile-section-title">{t("profileUpdateSettings")}</h3>
                        <form onSubmit={handleSaveProfileEdit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                          <label className="profile-dropdown-label">
                            {t("profileFullName")}
                            <input
                              type="text"
                              required
                              value={editFullName}
                              onChange={(e) => setEditFullName(e.target.value)}
                              className="settings-text-input"
                            />
                          </label>
                          <label className="profile-dropdown-label">
                            {t("profileAge")}
                            <input
                              type="number"
                              min="5"
                              max="120"
                              required
                              value={editAge}
                              onChange={(e) => setEditAge(e.target.value)}
                              className="settings-text-input"
                            />
                          </label>
                          <label className="profile-dropdown-label">
                            {t("interfaceLanguage")}
                            <select
                              required
                              value={editPreferredLang}
                              onChange={(e) => setEditPreferredLang(e.target.value)}
                              className="settings-select-input"
                            >
                              {languages.map((l) => (
                                <option key={l} value={l}>{t(l + "Option")}</option>
                              ))}
                            </select>
                          </label>
                          <label className="profile-dropdown-label">
                            {t("learningLanguage")}
                            <select
                              required
                              value={editLearningLang}
                              onChange={(e) => setEditLearningLang(e.target.value)}
                              className="settings-select-input"
                            >
                              {languages.map((l) => (
                                <option key={l} value={l}>{t(l + "Option")}</option>
                              ))}
                            </select>
                          </label>
                          <label className="profile-dropdown-label">
                            {t("profileEducationStatus")}
                            <select
                              required
                              value={editEdLevel}
                              onChange={(e) => setEditEdLevel(e.target.value)}
                              className="settings-select-input"
                            >
                              {educationLevels.map((ed) => (
                                <option key={ed} value={ed}>{t(ed + "Option")}</option>
                              ))}
                            </select>
                          </label>
                          <label className="profile-dropdown-label">
                            {t("profileExperienceStatus")}
                            <select
                              required
                              value={editExpLevel}
                              onChange={(e) => setEditExpLevel(e.target.value)}
                              className="settings-select-input"
                            >
                              {experienceLevels.map((exp) => (
                                <option key={exp} value={exp}>{t(experienceLevelOptionKeys[exp] || exp)}</option>
                              ))}
                            </select>
                          </label>
                          <button type="submit" className="primary-btn settings-save-btn" disabled={submitting}>
                            {submitting ? t("profileSaving") : t("profileSaveChanges")}
                          </button>
                        </form>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                        {/* Diagnostic & Dev Control Card */}
                        <div className="current-level-card dev-control-card" style={{ margin: 0, padding: "24px" }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: devControlsHidden ? 0 : '12px' }}>
                            <h3 className="current-level-title" style={{ margin: 0 }}>{t("profileDevControl")}</h3>
                            <button
                              type="button"
                              onClick={() => setDevControlsHidden(!devControlsHidden)}
                              style={{
                                background: 'rgba(128, 128, 128, 0.12)',
                                border: '1px solid var(--line)',
                                borderRadius: '10px',
                                padding: '4px 12px',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                color: 'var(--text)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              {devControlsHidden ? `👁️ ${t("showDevControl") || "Show"}` : `🙈 ${t("hideDevControl") || "Hide"}`}
                            </button>
                          </div>

                          {!devControlsHidden && (
                            <>
                              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "16px" }}>{t("profileDevControlDesc")}</p>
                              <div className="ai-toggle-container" style={{ marginBottom: "16px" }} title={aiEnabled ? "AI ON — lessons & word of day use AI" : "AI OFF — lessons & word of day use fallback"}>
                                <button
                                  type="button"
                                  className={`ai-toggle-btn ${aiEnabled ? "ai-on" : "ai-off"}`}
                                  onClick={toggleAiMode}
                                  aria-pressed={aiEnabled}
                                  aria-label={aiEnabled ? "Turn AI off (development mode)" : "Turn AI on"}
                                  style={{ width: "100%" }}
                                >
                                  <span className="ai-toggle-dot" />
                                  <span className="ai-toggle-label">{aiEnabled ? "AI ON" : "AI OFF"}</span>
                                </button>
                              </div>
                              <button
                                type="button"
                                className="secondary-btn dev-action-btn reset-assessment"
                                style={{ width: "100%", marginBottom: "12px" }}
                                onClick={() => handleResetAssessmentStatus()}
                              >
                                {t("profileResetAssessment")}
                              </button>
                              <button
                                type="button"
                                className="secondary-btn dev-action-btn reset-lessons"
                                style={{ width: "100%" }}
                                onClick={() => handleResetLessons()}
                              >
                                {t("profileResetLessons")}
                              </button>
                            </>
                          )}
                        </div>

                        {/* Danger Zone / Delete Account (BOTTOM) */}
                        <div className="current-level-card danger-zone-card" style={{ margin: 0, padding: "24px" }}>
                          <h3 className="current-level-title">{t("profileDangerZone")}</h3>
                          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "16px" }}>{t("profileDeleteAccountDesc")}</p>
                          <button
                            type="button"
                            className="primary-btn delete-account-btn"
                            style={{ width: "100%" }}
                            onClick={() => { setDeleteConfirmText(""); setDeleteError(""); setDeleteModalOpen(true); }}
                          >
                            {t("profileDeleteAccount")}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {profileSubTab === "feedback" && (
                  <div className="profile-feedback-tab">
                    <div className="profile-settings-card user-feedback-card" style={{ margin: 0, padding: "24px" }}>
                      <h3 className="profile-section-title">💬 {t("sendFeedbackOrReportBug")}</h3>
                      <p style={{ fontSize: "0.85rem", color: "var(--muted)", marginBottom: "16px", lineHeight: "1.4" }}>
                        {t("feedbackHelpDesc")}
                      </p>

                      {feedbackSuccess ? (
                        <div style={{ background: "rgba(16, 185, 129, 0.12)", border: "1px solid #10b981", borderRadius: "14px", padding: "16px", color: "#10b981", fontWeight: 700, textAlign: "center" }}>
                          {t("feedbackSuccessMsg")}
                        </div>
                      ) : (
                        <form onSubmit={handleSendUserFeedback} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                          <label className="profile-dropdown-label">
                            {t("feedbackCategoryLabel")}
                            <select
                              value={feedbackCategory}
                              onChange={(e) => setFeedbackCategory(e.target.value)}
                              className="settings-select-input"
                            >
                              <option value="Bug Report">{t("feedbackBugReport")}</option>
                              <option value="Feature Request">{t("feedbackFeatureRequest")}</option>
                              <option value="UI / Visual Feedback">{t("feedbackUiDesign")}</option>
                              <option value="General Feedback">{t("feedbackGeneral")}</option>
                            </select>
                          </label>

                          <label className="profile-dropdown-label">
                            {t("feedbackRatingLabel")}
                            <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setFeedbackRating(star)}
                                  style={{
                                    background: star <= feedbackRating ? "rgba(245, 158, 11, 0.18)" : "var(--bg)",
                                    border: star <= feedbackRating ? "1px solid #f59e0b" : "1px solid var(--line)",
                                    borderRadius: "10px",
                                    padding: "6px 12px",
                                    fontSize: "1.1rem",
                                    cursor: "pointer",
                                    transition: "all 0.15s ease"
                                  }}
                                >
                                  ⭐
                                </button>
                              ))}
                            </div>
                          </label>

                          <label className="profile-dropdown-label">
                            {t("feedbackSubjectLabel")}
                            <input
                              type="text"
                              placeholder={t("feedbackSubjectPlaceholder")}
                              value={feedbackSubject}
                              onChange={(e) => setFeedbackSubject(e.target.value)}
                              className="settings-text-input"
                            />
                          </label>

                          <label className="profile-dropdown-label">
                            {t("feedbackMessageLabel")}
                            <textarea
                              required
                              rows={4}
                              placeholder={t("feedbackMessagePlaceholder")}
                              value={feedbackMessage}
                              onChange={(e) => setFeedbackMessage(e.target.value)}
                              className="settings-text-input"
                              style={{ resize: "vertical", fontFamily: "inherit" }}
                            />
                          </label>

                          <button type="submit" className="primary-btn" disabled={feedbackSubmitting} style={{ width: "100%", marginTop: "4px" }}>
                            {feedbackSubmitting ? t("feedbackSubmittingBtn") : t("feedbackSubmitBtn")}
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                )}
                  </div>
                </div>
              </div>
              
              {/* Mobile-only Logout button */}
              <div className="mobile-only-logout-container">
                <button
                  type="button"
                  className="secondary-btn mobile-logout-btn"
                  onClick={() => handleSignOut()}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px 20px', borderRadius: '16px', background: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', fontWeight: '700' }}
                >
                  <LogoutIcon style={{ marginRight: 0, width: 18, height: 18 }} /> {t("logout") || "Log Out"}
                </button>
              </div>

            </div>
          )}

          {/* 3.4. Shop Tab */}
          {dashboardTab === "shop" && (
            <div className="shop-layout">
              <div className="practice-content-column">
                <XPShop
                  t={t}
                  catalog={shopCatalog}
                  onPurchaseItem={(item, newXp, newOwned) => {
                    playChime("buy");
                    triggerHaptic("buy");
                    setUserXp(newXp);
                    const userId = session?.user?.id;
                    if (userId) {
                      localStorage.setItem(`lisa_user_xp_${userId}`, newXp);
                      setShopOwnedItems(newOwned);

                      let updatedTheme = shopTheme;
                      let updatedFont = shopFont;
                      let updatedBanner = shopBanner;
                      let updatedAvatar = shopCustomAvatar;
                      let updatedBadges = profileBadges;

                      if (item.id.startsWith("theme_")) {
                        setShopTheme(item.id);
                        updatedTheme = item.id;
                      } else if (item.id.startsWith("font_")) {
                        setShopFont(item.id);
                        updatedFont = item.id;
                      } else if (item.id.startsWith("banner_")) {
                        setShopBanner(item.id);
                        updatedBanner = item.id;
                      } else if (item.id.startsWith("avatar_")) {
                        const av = shopCatalog.avatars.find(a => a.id === item.id);
                        if (av) {
                          const avObj = { type: "emoji", emoji: av.emoji, id: item.id };
                          setShopCustomAvatar(avObj);
                          setProfileAvatar(avObj);
                          const avStr = JSON.stringify(avObj);
                          localStorage.setItem(`lisa_profile_avatar_${userId}`, avStr);
                          updatedAvatar = avObj;
                        }
                      } else if (item.id.startsWith("badge_")) {
                        const current = profileBadges || [];
                        if (!current.includes(item.id) && current.length < 3) {
                          const nextBadges = [...current, item.id];
                          setProfileBadges(nextBadges);
                          updatedBadges = nextBadges;
                        }
                      }

                      const payload = {
                        ownedItems: newOwned,
                        theme: updatedTheme,
                        font: updatedFont,
                        banner: updatedBanner,
                        avatar: updatedAvatar,
                        badges: updatedBadges,
                      };
                      const avatarEmoji = updatedAvatar && typeof updatedAvatar === "object" && updatedAvatar.type === "emoji" ? updatedAvatar.emoji : null;
                      const avatarUrl = typeof updatedAvatar === "string" && updatedAvatar.startsWith("http") ? updatedAvatar : null;

                      queueProfileUpdate({
                        xp: newXp,
                        shop_data: payload,
                        avatar_emoji: avatarEmoji,
                        avatar_url: avatarUrl
                      });
                    }
                  }}
                  userXp={userXp}
                  onSpendXp={(newXp) => {
                    setUserXp(newXp);
                    queueProfileUpdate({ xp: newXp });
                  }}
                  session={session}
                  ownedItems={shopOwnedItems}
                  onOwnedItemsChange={(items) => {
                    setShopOwnedItems(items);
                    saveShopData({ ownedItems: items });
                  }}
                  currentTheme={shopTheme}
                  onThemeChange={(id) => {
                    setShopTheme(id);
                    saveShopData({ theme: id });
                  }}
                  currentFont={shopFont}
                  onFontChange={(id) => {
                    setShopFont(id);
                    saveShopData({ font: id });
                  }}
                  currentBanner={shopBanner}
                  onBannerChange={(id) => {
                    setShopBanner(id);
                    saveShopData({ banner: id });
                  }}
                  currentAvatar={shopCustomAvatar}
                  onAvatarChange={(av) => {
                    setShopCustomAvatar(av);
                    // Persist the chosen avatar (emoji or builder) to the database
                    // so it shows on the profile and leaderboard for this account.
                    try {
                      const userId = session?.user?.id;
                      if (!userId) throw new Error("No user id");
                      const avStr = typeof av === "string" ? av : JSON.stringify(av);
                      localStorage.setItem(`lisa_profile_avatar_${userId}`, avStr);
                      setProfileAvatar(av);
                      setProfile(prev => prev ? {
                        ...prev,
                        avatar_emoji: av && typeof av === "object" && av.type === "emoji" ? av.emoji : null,
                        avatar_url: typeof av === "string" && av.startsWith("http") ? av : null,
                        shop_data: {
                          ownedItems: shopOwnedItems,
                          theme: shopTheme,
                          font: shopFont,
                          banner: shopBanner,
                          avatar: av,
                          badges: profileBadges,
                        }
                      } : null);

                      supabase
                        .from("profiles")
                        .update({
                          avatar_emoji: av && typeof av === "object" && av.type === "emoji" ? av.emoji : null,
                          avatar_url: typeof av === "string" && av.startsWith("http") ? av : null,
                          shop_data: {
                            ownedItems: shopOwnedItems,
                            theme: shopTheme,
                            font: shopFont,
                            banner: shopBanner,
                            avatar: av,
                            badges: profileBadges,
                          },
                        })
                        .eq("id", userId);
                    } catch (e) {
                      console.warn("Could not save avatar:", e);
                    }
                  }}
                  activeProfileBadges={profileBadges}
                  onBadgesChange={(badges) => {
                    setProfileBadges(badges);
                    saveShopData({ badges: badges });
                  }}
                />
              </div>
            </div>
          )}

          {/* 3.5. Leaderboard Tab */}
          {dashboardTab === "leaderboard" && (
            <WeeklyLeaderboard
              t={t}
              session={session}
              profile={profile}
              weeklyXp={weeklyXp}
              canUsePhoto={currentLevelNum >= 10}
            />
          )}

          {/* 3.6. Analytics Tab */}
          {dashboardTab === "analytics" && (
            <AnalyticsReport
              t={t}
              session={session}
              profile={profile}
              skillScores={(() => {
                try {
                  const stored = getStoredAssessmentState(session?.user?.id);
                  return stored?.skill_scores || profile?.skill_scores || profile?.attempts_history?.[0]?.skillScores || {};
                } catch {
                  return {};
                }
              })()}
              userXp={userXp}
              completedLessons={completedLessons}
              streakCount={streakCount}
              dailyCorrectAnswers={dailyCorrectAnswers}
              dailyXp={dailyXp}
               weeklyXp={weeklyXp}
               selectedLanguage={selectedLanguage}
               onBack={() => setDashboardTab("dashboard")}
             />
          )}

          {/* 3.7. Admin Portal Tab */}
          {dashboardTab === "admin" && (
            <AdminDashboard 
              session={session} 
              shopCatalog={shopCatalog}
              onShopCatalogChange={(newCatalog) => {
                setShopCatalog(newCatalog);
                localStorage.setItem("lisa_global_shop_catalog", JSON.stringify(newCatalog));
              }}
              adminAnnouncements={adminAnnouncements}
              onAnnouncementsChange={(newAnnouncements) => {
                setAdminAnnouncements(newAnnouncements);
                localStorage.setItem("lisa_admin_announcements", JSON.stringify(newAnnouncements));
                if (Array.isArray(newAnnouncements)) {
                  const annIds = newAnnouncements.flatMap(a => [String(a.id), `ann_${a.id}`]);
                  setDismissedNotifIds(prev => prev.filter(id => !annIds.includes(id)));
                  setReadNotifIds(prev => prev.filter(id => !annIds.includes(id)));
                }
              }}
            />
          )}
        </main>

        {/* 4. AI Lesson Session Overlay */}
        {(lessonLoading || lessonSession) && (
          <div className="lesson-overlay-screen">
            <div className="lesson-overlay-header">
              <div className="lesson-overlay-header-content">
                <button className="lesson-overlay-close" onClick={() => { setLessonSession(null); setLessonAiContent(null); setLessonLoading(false); setLessonStep(0); setLessonListenWordMCQAnswer(null); setLessonListenWordMCQFeedback(null); setLessonMeaningFeedback(null); setLessonMeaningAnswer(null); }}>✕</button>
                <div className="lesson-progress-container">
                  {lessonSession?.title === "Mistakes Practice" && (
                    <span className="fixing-mistakes-pulse" style={{ fontSize: '1.3rem', marginRight: '8px' }}>🩹</span>
                  )}
                  <div className="lesson-progress-bar" style={{ width: lessonSession?.status === "completed" ? "100%" : `${(lessonStep / (lessonAiContent?.questions?.length || 18)) * 100}%` }}></div>
                </div>
                <div className="lesson-overlay-controls">
                  <div style={{ fontWeight: 800, whiteSpace: "nowrap" }}>XP +{lessonXpEarned}</div>
                  {renderThemeToggle()}
                </div>
              </div>
            </div>

            <div className="lesson-overlay-body">
              {/* Loading state */}
              {lessonLoading && (
                <div className="ai-lesson-loading">
                  <div className="ai-spinner"></div>
                  <h3>🤖 LISA is generating your personalized lesson...</h3>
                  <p>Powered by Gemini AI — creating content just for you</p>
                </div>
              )}

              {/* Lesson Complete */}
              {!lessonLoading && lessonSession?.status === "completed" && (
                <div className="lesson-complete-wrapper">
                  <div className="lesson-complete-mascot-row">
                    <div className="firecracker-container">
                      <img src="/as1.png" alt="LISA Mascot" className="lesson-complete-mascot" />
                      {Array.from({ length: 8 }).map((_, i) => {
                        const angle = (i / 8) * Math.PI * 2;
                        const radius = 30 + (i % 2) * 15;
                        const fx = Math.cos(angle) * radius;
                        const fy = Math.sin(angle) * radius;
                        return (
                          <span
                            key={i}
                            className="firecracker-particle"
                            style={{
                              '--fx': `${fx}px`,
                              '--fy': `${fy}px`,
                              background: ['#fbbf24', '#f59e0b', '#ef4444', '#10b981'][i % 4],
                              animationDelay: `${i * 0.05}s`,
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                  <h2 className="lesson-complete-title">
                    {lessonSession?.isPractice ? "Practice Complete!" : "Lesson Complete!"}
                  </h2>
                  <div className="lesson-complete-stats">
                    <div className="lesson-complete-stat-box xp-box">
                      <div className="lesson-complete-stat-label">Total XP</div>
                      <div className="lesson-complete-stat-icon">⚡</div>
                      <div className="lesson-complete-stat-value">
                        {lessonXpEarned}
                      </div>
                      <div className="lesson-complete-stat-sub">earned</div>
                    </div>
                    <div className="lesson-complete-stat-box great-box">
                      <div className="lesson-complete-stat-label">Great!</div>
                      <div className="lesson-complete-stat-icon">🎯</div>
                      <div className="lesson-complete-stat-value">
                        {lessonAccuracy !== null ? `${lessonAccuracy}%` : "100%"}
                      </div>
                      <div className="lesson-complete-stat-sub">accuracy</div>
                    </div>
                    <div className="lesson-complete-stat-box time-box">
                      <div className="lesson-complete-stat-label">Time Taken</div>
                      <div className="lesson-complete-stat-icon">⏱️</div>
                      <div className="lesson-complete-stat-value">
                        {(() => {
                          const mins = Math.floor(lessonTimeTaken / 60);
                          const secs = lessonTimeTaken % 60;
                          return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
                        })()}
                      </div>
                      <div className="lesson-complete-stat-sub">completed in</div>
                    </div>
                  </div>
                  <div className="lesson-complete-continue-row">
                     <button className="lesson-complete-continue-btn" onClick={() => { setLessonSession(null); setLessonAiContent(null); setLessonStep(0); setLessonListenWordMCQAnswer(null); setLessonListenWordMCQFeedback(null); setLessonMeaningFeedback(null); setLessonMeaningAnswer(null); }}>
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {/* Active Lesson Steps */}
              {!lessonLoading && lessonSession && lessonSession.status !== "completed" && lessonAiContent && (() => {
                const ai = lessonAiContent;
                if (lessonSession?.isPractice) {
                  return renderPracticeSession(ai);
                }

                return (
                  <div className="ai-lesson-content">
                    {/* Step 0: Explanation */}
                    {lessonStep === 0 && (
                      <div className="ai-lesson-step">
                        <div className="ai-lesson-step-header">
                          <span className="ai-step-badge">📖 Lesson Explanation</span>
                          <h3>{ai.lessonTitle}</h3>
                          <p style={{ color: 'var(--accent)', fontWeight: 600 }}>Skill Focus: {ai.skillFocus}</p>
                        </div>

                        {/* Mascot & Speech bubble */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '24px',
                          margin: '24px 0'
                        }}>
                          {/* Mascot */}
                          <div style={{ flexShrink: 0 }}>
                            <img
                              src="/as1.png"
                              alt="LISA Mascot"
                              style={{ width: '120px', height: '120px', objectFit: 'contain' }}
                            />
                          </div>
                          {/* Speech bubble */}
                          <div style={{
                            flexGrow: 1,
                            background: 'var(--panel)',
                            border: '2px solid var(--line)',
                            borderRadius: '24px',
                            padding: '20px',
                            position: 'relative'
                          }}>
                            {/* Speech bubble tail */}
                            <div style={{
                              position: 'absolute',
                              left: '-10px',
                              top: '40px',
                              width: '16px',
                              height: '16px',
                              background: 'var(--panel)',
                              borderLeft: '2px solid var(--line)',
                              borderBottom: '2px solid var(--line)',
                              transform: 'rotate(45deg)'
                            }}></div>

                            <div className="ai-lesson-explanation" style={{ fontSize: '1.05rem', lineHeight: '1.6', margin: 0 }}>
                              {ai.explanation?.split("\n").map((para, i) => para.trim() && <p key={i} style={{ margin: '0 0 10px 0' }}>{para}</p>)}
                            </div>
                          </div>
                        </div>

                        {/* Audio Example Cards */}
                        {false && ai.examples?.length > 0 && (
                          <div className="ai-lesson-examples" style={{ margin: '24px 0' }}>
                            <h4 style={{ marginBottom: '16px', fontWeight: '800' }}>Examples (Tap to listen)</h4>
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                              gap: '16px'
                            }}>
                              {ai.examples.map((ex, i) => (
                                <div
                                  key={i}
                                  className="ai-example-card"
                                  style={{
                                    border: '2px solid var(--line)',
                                    borderRadius: '16px',
                                    padding: '16px',
                                    background: 'var(--panel)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '14px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.03)'
                                  }}
                                  onClick={() => speakText(ex.text)}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--accent)';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--line)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                  }}
                                >
                                  <button
                                    type="button"
                                    className="tts-btn"
                                    style={{
                                      background: 'var(--accent)',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '50%',
                                      width: '36px',
                                      height: '36px',
                                      display: 'grid',
                                      placeItems: 'center',
                                      cursor: 'pointer',
                                      flexShrink: 0
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      speakText(ex.text);
                                    }}
                                  >
                                    🔊
                                  </button>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <span className="ai-example-text" style={{ fontWeight: '700', fontSize: '1.1rem' }}>{ex.text}</span>
                                    {ex.translation && <span className="ai-example-trans" style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{ex.translation}</span>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Highlighted Tip Banner */}
                        {ai.guidedPractice && (
                          <div className="ai-lesson-tip" style={{
                            background: 'rgba(245, 158, 11, 0.1)',
                            border: '2px dashed #f59e0b',
                            borderRadius: '16px',
                            padding: '16px 20px',
                            margin: '24px 0',
                            display: 'flex',
                            gap: '12px',
                            alignItems: 'center'
                          }}>
                            <span style={{ fontSize: '1.5rem' }}>💡</span>
                            <div style={{ color: '#b45309', fontSize: '0.95rem' }}>
                              <strong style={{ display: 'block', marginBottom: '2px', fontWeight: '800' }}>Guided Tip:</strong>
                              {ai.guidedPractice}
                            </div>
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                          <button
                            type="button"
                            className="primary-btn"
                            style={{
                              background: 'var(--accent)',
                              color: 'white',
                              border: 'none',
                              padding: '12px 30px',
                              borderRadius: '12px',
                              fontWeight: '800',
                              cursor: 'pointer'
                            }}
                            onClick={() => setLessonStep(1)}
                          >
                            Continue
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 1: MCQs */}
                    {lessonStep === 1 && ai.mcqs?.length > 0 && (() => {
                      const q = ai.mcqs[lessonMcqIndex];
                      const selected = lessonMcqAnswers[lessonMcqIndex];
                      const isAnswered = selected !== undefined;
                      const isCorrect = isAnswered && selected === q.correctIndex;

                      return (
                        <div className="ai-lesson-step" style={{ paddingBottom: '120px' }}>
                          <div className="ai-lesson-step-header" style={{ marginBottom: '16px' }}>
                            <span className="ai-step-badge">🎯 Multiple Choice</span>
                          </div>

                          {/* Mascot & Speech bubble */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '20px',
                            margin: '20px 0'
                          }}>
                            {/* Mascot */}
                            <div style={{ flexShrink: 0 }}>
                              <img
                                src="/as1.png"
                                alt="LISA Mascot"
                                style={{ width: '80px', height: '80px', objectFit: 'contain' }}
                              />
                            </div>
                            {/* Speech bubble */}
                            <div style={{
                              flexGrow: 1,
                              background: 'var(--panel)',
                              border: '2px solid var(--line)',
                              borderRadius: '20px',
                              padding: '16px 24px',
                              position: 'relative'
                            }}>
                              <div style={{
                                position: 'absolute',
                                left: '-9px',
                                top: '32px',
                                width: '14px',
                                height: '14px',
                                background: 'var(--panel)',
                                borderLeft: '2px solid var(--line)',
                                borderBottom: '2px solid var(--line)',
                                transform: 'rotate(45deg)'
                              }}></div>
                              <h3 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0 }}>{q.question}</h3>
                            </div>
                          </div>

                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '16px',
                            margin: '30px 0'
                          }}>
                            {q.options.map((opt, oIdx) => {
                              const isSelectedOption = selected === oIdx;
                              let btnBg = 'var(--panel)';
                              let btnBorder = '2px solid var(--line)';
                              let btnColor = 'var(--text)';
                              let badgeBg = 'var(--line)';
                              let badgeColor = 'var(--text)';

                              if (isAnswered) {
                                if (oIdx === q.correctIndex) {
                                  btnBg = 'rgba(16, 185, 129, 0.1)';
                                  btnBorder = '2px solid #10b981';
                                  btnColor = '#065f46';
                                  badgeBg = '#10b981';
                                  badgeColor = 'white';
                                } else if (isSelectedOption) {
                                  btnBg = 'rgba(239, 68, 68, 0.1)';
                                  btnBorder = '2px solid #ef4444';
                                  btnColor = '#991b1b';
                                  badgeBg = '#ef4444';
                                  badgeColor = 'white';
                                } else {
                                  btnColor = 'var(--muted)';
                                }
                              } else if (isSelectedOption) {
                                btnBorder = '2px solid var(--accent)';
                                btnColor = 'var(--accent-dark)';
                                badgeBg = 'var(--accent)';
                                badgeColor = 'white';
                              }

                              return (
                                <button
                                  key={oIdx}
                                  type="button"
                                  style={{
                                    background: btnBg,
                                    border: btnBorder,
                                    color: btnColor,
                                    opacity: 1,
                                    WebkitTextFillColor: btnColor,
                                    borderRadius: '16px',
                                    padding: '20px',
                                    fontSize: '1.1rem',
                                    fontWeight: '600',
                                    cursor: isAnswered ? 'default' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    transition: 'all 0.2s ease',
                                    textAlign: 'left'
                                  }}
                                  onClick={() => {
                                    if (!isAnswered) {
                                      checkLessonMcq(lessonMcqIndex, oIdx);
                                      const correct = oIdx === q.correctIndex;
                                      setLessonMcqFeedback({
                                        isCorrect: correct,
                                        title: correct ? "Excellent!" : "Incorrect",
                                        explanation: q.explanation
                                      });
                                      if (correct) recordDailyCorrect();
                                      recordLessonAnswer(correct);
                                    }
                                  }}
                                  disabled={isAnswered}
                                >
                                  <span style={{
                                    background: badgeBg,
                                    color: badgeColor,
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '8px',
                                    display: 'grid',
                                    placeItems: 'center',
                                    fontWeight: '800'
                                  }}>
                                    {String.fromCharCode(65 + oIdx)}
                                  </span>
                                  <span>{opt}</span>
                                </button>
                              );
                            })}
                          </div>

                          {/* Duolingo style bottom feedback bar */}
                          {lessonMcqFeedback && (
                            <div style={{
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              right: 0,
                              background: lessonMcqFeedback.isCorrect ? '#d1fae5' : '#fee2e2',
                              borderTop: `2px solid ${lessonMcqFeedback.isCorrect ? '#10b981' : '#ef4444'}`,
                              padding: '20px 40px',
                              zIndex: 100
                            }}>
                              <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                width: '100%',
                                maxWidth: '1000px',
                                margin: '0 auto'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                  <span style={{ fontSize: '2rem' }}>{lessonMcqFeedback.isCorrect ? "🎉" : "❌"}</span>
                                  <div>
                                    <h4 style={{ margin: 0, color: lessonMcqFeedback.isCorrect ? '#065f46' : '#991b1b', fontWeight: '800', fontSize: '1.2rem' }}>
                                      {lessonMcqFeedback.title}
                                    </h4>
                                    <p style={{ margin: '4px 0 0', color: lessonMcqFeedback.isCorrect ? '#047857' : '#b91c1c', fontSize: '0.95rem' }}>
                                      {lessonMcqFeedback.explanation}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  className="primary-btn"
                                  style={{
                                    background: lessonMcqFeedback.isCorrect ? '#10b981' : '#ef4444',
                                    color: 'white',
                                    border: 'none',
                                    padding: '12px 30px',
                                    borderRadius: '12px',
                                    fontWeight: '800',
                                    cursor: 'pointer'
                                  }}
                                  onClick={() => {
                                    setLessonMcqFeedback(null);
                                    setLessonStep(2);
                                  }}
                                >
                                  Continue
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Step 2: Fill in the Blanks */}
                    {lessonStep === 2 && ai.fillBlanks?.length > 0 && (() => {
                      const fb = ai.fillBlanks[lessonFillIndex];
                      const userAnswer = lessonFillAnswers[lessonFillIndex] || "";
                      const isChecked = lessonFillFeedback !== null;

                      // Build a list of tiles for word bank
                      const otherBlanks = ai.fillBlanks.map(x => x.answer).filter(x => x !== fb.answer);
                      const allChoices = Array.from(new Set([fb.answer, ...otherBlanks])).slice(0, 4);

                      return (
                        <div className="ai-lesson-step" style={{ paddingBottom: '120px' }}>
                          <div className="ai-lesson-step-header" style={{ marginBottom: '16px' }}>
                            <span className="ai-step-badge">✍️ Fill in the Blank{ai.fillBlanks.length > 1 && false ? ` (Question {lessonFillIndex + 1} of {ai.fillBlanks.length})` : ""}</span>
                          </div>

                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '20px',
                            margin: '20px 0'
                          }}>
                            {/* Mascot */}
                            <div style={{ flexShrink: 0 }}>
                              <img
                                src="/as1.png"
                                alt="LISA Mascot"
                                style={{ width: '80px', height: '80px', objectFit: 'contain' }}
                              />
                            </div>
                            {/* Speech bubble */}
                            <div style={{
                              flexGrow: 1,
                              background: 'var(--panel)',
                              border: '2px solid var(--line)',
                              borderRadius: '20px',
                              padding: '24px',
                              position: 'relative',
                              fontSize: '1.3rem',
                              fontWeight: '700',
                              textAlign: 'center'
                            }}>
                              <div style={{
                                position: 'absolute',
                                left: '-9px',
                                top: '32px',
                                width: '14px',
                                height: '14px',
                                background: 'var(--panel)',
                                borderLeft: '2px solid var(--line)',
                                borderBottom: '2px solid var(--line)',
                                transform: 'rotate(45deg)'
                              }}></div>

                              {/* Render sentence with blank highlighted */}
                              <div>
                                {fb.sentence.split("___").map((part, index, arr) => (
                                  <React.Fragment key={index}>
                                    {part}
                                    {index < arr.length - 1 && (
                                      <span style={{
                                        borderBottom: '3px solid var(--accent)',
                                        padding: '2px 10px',
                                        color: 'var(--accent)',
                                        margin: '0 8px',
                                        minWidth: '100px',
                                        display: 'inline-block',
                                        textAlign: 'center',
                                        background: 'rgba(var(--accent-rgb), 0.05)'
                                      }}>
                                        {userAnswer || "\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0"}
                                      </span>
                                    )}
                                  </React.Fragment>
                                ))}
                              </div>

                              {/* Hint placed inside speech bubble */}
                              {fb.hint && (
                                <div style={{
                                  fontSize: '0.9rem',
                                  color: 'var(--muted)',
                                  marginTop: '16px',
                                  fontWeight: '600',
                                  fontStyle: 'italic',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '6px'
                                }}>
                                  <span>💡</span>
                                  <span>Hint: {fb.hint}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Interactive word bank tiles */}
                          {!isChecked && (
                            <div style={{
                              display: 'flex',
                              justifyContent: 'center',
                              gap: '12px',
                              margin: '20px 0',
                              flexWrap: 'wrap'
                            }}>
                              {allChoices.map((choice, cIdx) => (
                                <button
                                  key={cIdx}
                                  type="button"
                                  style={{
                                    background: 'var(--panel-strong)',
                                    border: '2px solid var(--line)',
                                    borderRadius: '12px',
                                    padding: '10px 20px',
                                    fontSize: '1.1rem',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                    transition: 'all 0.15s ease'
                                  }}
                                  onClick={() => {
                                    setLessonFillAnswers(prev => ({ ...prev, [lessonFillIndex]: choice }));
                                  }}
                                >
                                  {choice}
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Fallback Text Input */}
                          <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
                            <input
                              type="text"
                              className="ai-fill-input"
                              placeholder="Or type your answer here..."
                              style={{
                                maxWidth: '300px',
                                padding: '12px 20px',
                                borderRadius: '12px',
                                border: '2px solid var(--line)',
                                fontSize: '1rem',
                                textAlign: 'center'
                              }}
                              value={userAnswer}
                              onChange={(e) => setLessonFillAnswers(prev => ({ ...prev, [lessonFillIndex]: e.target.value }))}
                              disabled={isChecked}
                            />
                          </div>

                          {!isChecked && (
                            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                              <button
                                type="button"
                                className="primary-btn"
                                style={{ padding: '12px 40px', borderRadius: '12px' }}
                                onClick={() => {
                                  const correct = userAnswer.trim().toLowerCase() === fb.answer.toLowerCase();
                                  setLessonFillFeedback({
                                    isCorrect: correct,
                                    title: correct ? "Excellent!" : "Incorrect",
                                    correctAnswer: fb.answer
                                  });
                                  if (correct) recordDailyCorrect();
                                  recordLessonAnswer(correct);
                                }}
                                disabled={!userAnswer.trim()}
                              >
                                Check Answer
                              </button>
                            </div>
                          )}

                          {/* Duolingo style bottom feedback bar */}
                          {lessonFillFeedback && (
                            <div style={{
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              right: 0,
                              background: lessonFillFeedback.isCorrect ? '#d1fae5' : '#fee2e2',
                              borderTop: `2px solid ${lessonFillFeedback.isCorrect ? '#10b981' : '#ef4444'}`,
                              padding: '20px 40px',
                              zIndex: 100
                            }}>
                              <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                width: '100%',
                                maxWidth: '1000px',
                                margin: '0 auto'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                  <span style={{ fontSize: '2rem' }}>{lessonFillFeedback.isCorrect ? "🎉" : "❌"}</span>
                                  <div>
                                    <h4 style={{ margin: 0, color: lessonFillFeedback.isCorrect ? '#065f46' : '#991b1b', fontWeight: '800', fontSize: '1.2rem' }}>
                                      {lessonFillFeedback.title}
                                    </h4>
                                    <p style={{ margin: '4px 0 0', color: lessonFillFeedback.isCorrect ? '#047857' : '#b91c1c', fontSize: '0.95rem' }}>
                                      {lessonFillFeedback.isCorrect ? "You got it right!" : `Correct Answer: "${lessonFillFeedback.correctAnswer}"`}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  className="primary-btn"
                                  style={{
                                    background: lessonFillFeedback.isCorrect ? '#10b981' : '#ef4444',
                                    color: 'white',
                                    border: 'none',
                                    padding: '12px 30px',
                                    borderRadius: '12px',
                                    fontWeight: '800',
                                    cursor: 'pointer'
                                  }}
                                  onClick={() => {
                                    setLessonFillFeedback(null);
                                    setLessonStep(3);
                                  }}
                                >
                                  Continue
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Step 3: Reading Comprehension */}
                    {lessonStep === 3 && (() => {
                      const isChecked = lessonReadingFeedback !== null;
                      return (
                        <div className="ai-lesson-step" style={{ paddingBottom: '120px' }}>
                          <div className="ai-lesson-step-header" style={{ marginBottom: '16px' }}>
                            <span className="ai-step-badge">📚 Reading Comprehension</span>
                          </div>

                          <div style={{
                            background: 'var(--panel)',
                            border: '2px solid var(--line)',
                            borderRadius: '24px',
                            padding: '24px',
                            margin: '20px 0',
                            position: 'relative'
                          }}>
                            <div style={{ display: 'flex', ['justify' + 'Content']: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                              <h4 style={{ margin: 0 }}>Reading Passage:</h4>
                              <button type="button" className="tts-btn" onClick={() => speakText(ai.readingPassage)}>🔊 <span className="tts-btn-text">{t("listenBtn") || "Listen"}</span></button>
                            </div>
                            <div className="ai-passage-text" style={{ fontSize: '1.15rem', lineHeight: '1.6', fontWeight: 500 }}>
                              {ai.readingPassage}
                            </div>
                          </div>

                          {/* Mascot & Speech bubble for reading question */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '20px',
                            margin: '20px 0'
                          }}>
                            {/* Mascot */}
                            <div style={{ flexShrink: 0 }}>
                              <img
                                src="/as1.png"
                                alt="LISA Mascot"
                                style={{ width: '80px', height: '80px', objectFit: 'contain' }}
                              />
                            </div>
                            {/* Speech bubble */}
                            <div style={{
                              flexGrow: 1,
                              background: 'var(--panel)',
                              border: '2px solid var(--line)',
                              borderRadius: '20px',
                              padding: '16px 24px',
                              position: 'relative'
                            }}>
                              <div style={{
                                position: 'absolute',
                                left: '-9px',
                                top: '32px',
                                width: '14px',
                                height: '14px',
                                background: 'var(--panel)',
                                borderLeft: '2px solid var(--line)',
                                borderBottom: '2px solid var(--line)',
                                transform: 'rotate(45deg)'
                              }}></div>
                              <p style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0 }}>{ai.readingQuestion}</p>
                            </div>
                          </div>

                          <div style={{ marginTop: '24px' }}>
                            <input
                              type="text"
                              className="ai-fill-input"
                              placeholder="Type your answer based on the passage..."
                              style={{
                                width: '100%',
                                padding: '12px 20px',
                                borderRadius: '12px',
                                border: '2px solid var(--line)',
                                fontSize: '1rem',
                                marginTop: '10px'
                              }}
                              value={lessonReadingAnswer}
                              onChange={(e) => setLessonReadingAnswer(e.target.value)}
                              disabled={isChecked}
                            />
                          </div>

                          {!isChecked && (
                            <div style={{ display: 'flex', ['justify' + 'Content']: 'center', marginTop: '20px' }}>
                              <button
                                type="button"
                                className="primary-btn"
                                style={{ padding: '12px 40px', borderRadius: '12px' }}
                                onClick={() => {
                                  setLessonReadingFeedback({
                                    userAnswer: lessonReadingAnswer,
                                    suggestedAnswer: ai.readingAnswer
                                  });
                                }}
                                disabled={!lessonReadingAnswer.trim()}
                              >
                                Check Answer
                              </button>
                            </div>
                          )}

                          {lessonReadingFeedback && (
                            <div style={{
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              right: 0,
                              background: 'var(--panel-strong)',
                              borderTop: '2px solid var(--accent)',
                              padding: '20px 40px',
                              zIndex: 100
                            }}>
                              <div style={{
                                display: 'flex',
                                ['justify' + 'Content']: 'space-between',
                                alignItems: 'center',
                                width: '100%',
                                maxWidth: '1000px',
                                margin: '0 auto'
                              }}>
                                <div style={{ flex: 1, marginRight: '20px' }}>
                                  <div style={{ marginBottom: '8px' }}>
                                    <strong style={{ color: 'var(--muted)' }}>Your Answer:</strong>
                                    <p style={{ margin: '2px 0 0', fontWeight: '700' }}>{lessonReadingFeedback.userAnswer}</p>
                                  </div>
                                  <div>
                                    <strong style={{ color: 'var(--accent)' }}>LISA's Suggested Answer:</strong>
                                    <p style={{ margin: '2px 0 0', fontWeight: '700', color: 'var(--accent)' }}>{lessonReadingFeedback.suggestedAnswer}</p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  className="primary-btn"
                                  onClick={() => {
                                    setLessonReadingFeedback(null);
                                    setLessonStep(4);
                                  }}
                                >
                                  Continue
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Step 4: Writing Activity */}
                    {lessonStep === 4 && (
                      <div className="ai-lesson-step" style={{ paddingBottom: '120px' }}>
                        <div className="ai-lesson-step-header" style={{ marginBottom: '16px' }}>
                          <span className="ai-step-badge">✍️ Writing Activity</span>
                        </div>

                        {/* Picture for the writing activity */}
                        <div style={{
                          margin: '20px 0',
                          background: 'var(--panel)',
                          border: '2px solid var(--line)',
                          borderRadius: '20px',
                          padding: '16px',
                          textAlign: 'center'
                        }}>
                          <img
                            src="https://i.postimg.cc/c15NzsyP/211532a90170c2a360e90f8b50384c11.jpg"
                            alt="Children playing outside"
                            style={{ width: '100%', maxWidth: '520px', borderRadius: '14px', objectFit: 'cover' }}
                          />
                        </div>

                        {/* Mascot & Speech bubble for prompt */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '20px',
                          margin: '20px 0'
                        }}>
                          {/* Mascot */}
                          <div style={{ flexShrink: 0 }}>
                            <img
                              src="/as1.png"
                              alt="LISA Mascot"
                              style={{ width: '80px', height: '80px', objectFit: 'contain' }}
                            />
                          </div>
                          {/* Speech bubble */}
                          <div style={{
                            flexGrow: 1,
                            background: 'var(--panel)',
                            border: '2px solid var(--line)',
                            borderRadius: '20px',
                            padding: '16px 24px',
                            position: 'relative'
                          }}>
                            <div style={{
                              position: 'absolute',
                              left: '-9px',
                              top: '32px',
                              width: '14px',
                              height: '14px',
                              background: 'var(--panel)',
                              borderLeft: '2px solid var(--line)',
                              borderBottom: '2px solid var(--line)',
                              transform: 'rotate(45deg)'
                            }}></div>
                            <p style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0 }}>{ai.writingActivity}</p>
                          </div>
                        </div>

                        <textarea
                          className="writing-textarea"
                          rows={6}
                          placeholder="Type your response here..."
                          value={lessonWritingText}
                          onChange={(e) => setLessonWritingText(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '16px',
                            borderRadius: '16px',
                            border: '2px solid var(--line)',
                            fontSize: '1rem',
                            fontFamily: 'inherit',
                            background: 'var(--panel)'
                          }}
                        />

                        <div style={{ display: 'flex', ['justify' + 'Content']: 'center', marginTop: '20px' }}>
                          <button
                            type="button"
                            className="primary-btn"
                            style={{ padding: '12px 40px', borderRadius: '12px' }}
                            onClick={() => {

                              setLessonStep(5);
                            }}
                            disabled={!lessonWritingText.trim()}
                          >
                            Continue
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 5: Speak this sentence */}
                    {lessonStep === 5 && (() => {
                      const sentence = ai.speakSentence || "Hello, welcome to LISA.";
                      const isChecked = lessonSpeakFeedback !== null;

                      const startSpeaking = () => {
                        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                        if (!SpeechRecognition) {
                          setLessonSpeakError("Speech recognition is not supported in this browser. Please use Chrome/Edge.");
                          return;
                        }

                        try {
                          const rec = new SpeechRecognition();
                          rec.continuous = false;
                          rec.interimResults = false;
                          rec.lang = learningLanguage === "Kannada" ? "kn-IN" :
                            learningLanguage === "Hindi" ? "hi-IN" :
                              learningLanguage === "Telugu" ? "te-IN" :
                                learningLanguage === "Tamil" ? "ta-IN" : "en-US";

                          rec.onstart = () => {
                            setLessonSpeakIsListening(true);
                            setLessonSpeakTranscript("");
                            setLessonSpeakError("");
                          };

                          rec.onerror = (e) => {
                            setLessonSpeakError("Mic error, please check connection.");
                            setLessonSpeakIsListening(false);
                          };

                          rec.onend = () => {
                            setLessonSpeakIsListening(false);
                          };

                          rec.onresult = (event) => {
                            const transcript = event.results[0][0].transcript;
                            setLessonSpeakTranscript(transcript);

                            const clean = (w) => w.replace(/[.,\/#!$%\^&\*;:{}=\-_\u0060()?]/g, "").toLowerCase().trim();
                            const targetWords = sentence.split(/\s+/).filter(Boolean).map(clean);
                            const spokenWords = transcript.split(/\s+/).filter(Boolean).map(clean);

                            let matched = 0;
                            targetWords.forEach(w => {
                              if (spokenWords.includes(w)) matched++;
                            });

                            const percent = targetWords.length > 0 ? (matched / targetWords.length) * 100 : 100;
                            const isCorrect = percent >= 50;

                            setLessonSpeakFeedback({
                              isCorrect,
                              matchedCount: matched,
                              totalWords: targetWords.length,
                              percent: Math.round(percent)
                            });

                            if (isCorrect) recordDailyCorrect();
                            recordLessonAnswer(isCorrect);

                          };

                          rec.start();
                        } catch (err) {
                          setLessonSpeakError("Could not start speech recognition.");
                          setLessonSpeakIsListening(false);
                        }
                      };

                      return (
                        <div className="ai-lesson-step" style={{ paddingBottom: '120px' }}>
                          <div className="ai-lesson-step-header" style={{ marginBottom: '16px' }}>
                            <span className="ai-step-badge">🎤 Speak this sentence</span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', margin: '20px 0' }}>
                            <img src="/as1.png" alt="LISA Mascot" style={{ width: '140px', height: '140px', objectFit: 'contain' }} />
                            <div style={{
                              flexGrow: 1,
                              background: 'var(--panel)',
                              border: '2px solid var(--line)',
                              borderRadius: '20px',
                              padding: '18px 22px',
                              position: 'relative',
                              fontSize: '1.25rem',
                              fontWeight: '700',
                              textAlign: 'center',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '10px'
                            }}>
                              <div style={{
                                position: 'absolute',
                                left: '-9px',
                                top: '32px',
                                width: '14px',
                                height: '14px',
                                background: 'var(--panel)',
                                borderLeft: '2px solid var(--line)',
                                borderBottom: '2px solid var(--line)',
                                transform: 'rotate(45deg)'
                              }}></div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <button type="button" className="tts-btn" style={{ borderRadius: '50%', width: '44px', height: '44px', padding: 0, fontSize: '1.2rem', boxShadow: '0 2px 6px rgba(0,0,0,0.18)' }} onClick={() => speakText(sentence)} title="Listen to pronunciation">🔊</button>
                                <span style={{ color: 'var(--text)' }}>{sentence}</span>
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', margin: '30px 0' }}>
                            <div className="mic-outer-container">
                              <button
                                type="button"
                                className="mic-btn"
                                onClick={startSpeaking}
                                disabled={lessonSpeakIsListening || isChecked}
                                title="Click to speak"
                              >
                                {lessonSpeakIsListening ? (
                                  <span className="voice-wave" aria-hidden="true">
                                    <span></span><span></span><span></span><span></span><span></span><span></span><span></span>
                                  </span>
                                ) : (
                                  <svg className="mic-icon" width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                    <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3z" />
                                    <path d="M17 11a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2z" />
                                  </svg>
                                )}
                                <span className="mic-btn-text">{lessonSpeakIsListening ? "RECORDING..." : "CLICK TO SPEAK"}</span>
                              </button>
                            </div>

                            {lessonSpeakTranscript && (
                              <p style={{ fontStyle: 'italic', color: 'var(--text)', fontSize: '1.1rem' }}>
                                You said: "<strong>{lessonSpeakTranscript}</strong>"
                              </p>
                            )}

                            {lessonSpeakError && (
                              <p style={{ color: '#ef4444', fontWeight: 600 }}>{lessonSpeakError}</p>
                            )}
                          </div>

                          {isChecked && (
                            <div style={{
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              right: 0,
                              background: lessonSpeakFeedback.isCorrect ? '#d1fae5' : '#fee2e2',
                              borderTop: `2px solid ${lessonSpeakFeedback.isCorrect ? '#10b981' : '#ef4444'}`,
                              padding: '20px 40px',
                              zIndex: 100
                            }}>
                              <div style={{
                                display: 'flex',
                                ['justify' + 'Content']: 'space-between',
                                alignItems: 'center',
                                width: '100%',
                                maxWidth: '1000px',
                                margin: '0 auto'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                  <span style={{ fontSize: '2rem' }}>{lessonSpeakFeedback.isCorrect ? "🎉" : "❌"}</span>
                                  <div>
                                    <h4 style={{ margin: 0, color: lessonSpeakFeedback.isCorrect ? '#065f46' : '#991b1b', fontWeight: '800', fontSize: '1.2rem' }}>
                                      {lessonSpeakFeedback.isCorrect ? "Awesome Pronunciation!" : "Need Practice!"}
                                    </h4>
                                    <p style={{ margin: '4px 0 0', color: lessonSpeakFeedback.isCorrect ? '#047857' : '#b91c1c', fontSize: '0.95rem' }}>
                                      Matched {lessonSpeakFeedback.percent}% of the sentence ({lessonSpeakFeedback.matchedCount}/{lessonSpeakFeedback.totalWords} words).
                                    </p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  className="primary-btn"
                                  style={{
                                    background: lessonSpeakFeedback.isCorrect ? '#10b981' : '#ef4444',
                                    color: 'white',
                                    border: 'none',
                                    padding: '12px 30px',
                                    borderRadius: '12px',
                                    fontWeight: '800',
                                    cursor: 'pointer'
                                  }}
                                  onClick={() => {
                                    setLessonSpeakFeedback(null);
                                    setLessonSpeakTranscript("");
                                    setLessonStep(6);
                                  }}
                                >
                                  Continue
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Step 6: Select the correct meaning */}
                    {lessonStep === 6 && (() => {
                      const mq = ai.meaningQuestion || { phrase: "Happy", options: ["Feeling good and cheerful", "Feeling sad and upset", "Feeling tired and sleepy", "Feeling hungry and thirsty"], correctIndex: 0 };
                      const isChecked = lessonMeaningFeedback !== null;

                      return (
                        <div className="ai-lesson-step" style={{ paddingBottom: '120px' }}>
                          <div className="ai-lesson-step-header" style={{ marginBottom: '16px' }}>
                            <span className="ai-step-badge">🧠 Select the correct meaning</span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', margin: '20px 0' }}>
                            <img src="/as1.png" alt="LISA Mascot" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
                            <div style={{
                              flexGrow: 1,
                              background: 'var(--panel)',
                              border: '2px solid var(--line)',
                              borderRadius: '20px',
                              padding: '16px 24px',
                              position: 'relative'
                            }}>
                              <div style={{
                                position: 'absolute',
                                left: '-9px',
                                top: '32px',
                                width: '14px',
                                height: '14px',
                                background: 'var(--panel)',
                                borderLeft: '2px solid var(--line)',
                                borderBottom: '2px solid var(--line)',
                                transform: 'rotate(45deg)'
                              }}></div>
                              <p style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>"{mq.phrase}" means:</p>
                            </div>
                          </div>

                          <div className="mcq-options-container" style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '20px 0' }}>
                            {mq.options.map((opt, oIdx) => {
                              const isSelected = lessonMeaningAnswer === oIdx;
                              let btnBorder = '2px solid var(--line)';
                              let btnBg = 'var(--panel)';
                              if (isSelected) {
                                btnBorder = '2px solid var(--accent)';
                                btnBg = 'rgba(var(--accent-rgb), 0.05)';
                              }

                              return (
                                <button
                                  key={oIdx}
                                  type="button"
                                  style={{
                                    border: btnBorder,
                                    borderRadius: '16px',
                                    padding: '16px 20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    background: btnBg,
                                    width: '100%',
                                    textAlign: 'left',
                                    fontSize: '1.1rem',
                                    fontWeight: '700',
                                    color: 'var(--text)',
                                    cursor: 'pointer'
                                  }}
                                  onClick={() => {
                                    if (!isChecked) {
                                      setLessonMeaningAnswer(oIdx);
                                    }
                                  }}
                                  disabled={isChecked}
                                >
                                  <span style={{
                                    background: isSelected ? 'var(--accent)' : 'var(--panel-strong)',
                                    color: isSelected ? 'white' : 'var(--text-muted)',
                                    width: '30px',
                                    height: '30px',
                                    borderRadius: '50%',
                                    display: 'grid',
                                    placeItems: 'center',
                                    fontWeight: '800'
                                  }}>{oIdx + 1}</span>
                                  <span>{opt}</span>
                                </button>
                              );
                            })}
                          </div>

                          {!isChecked && (
                            <div style={{ display: 'flex', ['justify' + 'Content']: 'center', marginTop: '20px' }}>
                              <button
                                type="button"
                                className="primary-btn"
                                style={{ padding: '12px 40px', borderRadius: '12px' }}
                                onClick={() => {
                                  const correct = lessonMeaningAnswer === mq.correctIndex;
                                  setLessonMeaningFeedback({
                                    isCorrect: correct,
                                    correctAnswer: mq.options[mq.correctIndex]
                                  });
                                  if (correct) recordDailyCorrect();
                                  recordLessonAnswer(correct);
                                }}
                                disabled={lessonMeaningAnswer === null}
                              >
                                Check Answer
                              </button>
                            </div>
                          )}

                          {isChecked && (
                            <div style={{
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              right: 0,
                              background: lessonMeaningFeedback.isCorrect ? '#d1fae5' : '#fee2e2',
                              borderTop: `2px solid ${lessonMeaningFeedback.isCorrect ? '#10b981' : '#ef4444'}`,
                              padding: '20px 40px',
                              zIndex: 100
                            }}>
                              <div style={{
                                display: 'flex',
                                ['justify' + 'Content']: 'space-between',
                                alignItems: 'center',
                                width: '100%',
                                maxWidth: '1000px',
                                margin: '0 auto'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                  <span style={{ fontSize: '2rem' }}>{lessonMeaningFeedback.isCorrect ? "🎉" : "❌"}</span>
                                  <div>
                                    <h4 style={{ margin: 0, color: lessonMeaningFeedback.isCorrect ? '#065f46' : '#991b1b', fontWeight: '800', fontSize: '1.2rem' }}>
                                      {lessonMeaningFeedback.isCorrect ? "Excellent!" : "Incorrect"}
                                    </h4>
                                    <p style={{ margin: '4px 0 0', color: lessonMeaningFeedback.isCorrect ? '#047857' : '#b91c1c', fontSize: '0.95rem' }}>
                                      {lessonMeaningFeedback.isCorrect ? "You matched the meaning correctly!" : `Correct meaning: "${lessonMeaningFeedback.correctAnswer}"`}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  className="primary-btn"
                                  style={{
                                    background: lessonMeaningFeedback.isCorrect ? '#10b981' : '#ef4444',
                                    color: 'white',
                                    border: 'none',
                                    padding: '12px 30px',
                                    borderRadius: '12px',
                                    fontWeight: '800',
                                    cursor: 'pointer'
                                  }}
                                  onClick={() => {
                                    setLessonMeaningFeedback(null);
                                    setLessonMeaningAnswer(null);
                                    setLessonStep(7);
                                  }}
                                >
                                  Continue
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Step 7: Write this in English (word tiles) */}
                    {lessonStep === 7 && (() => {
                      const tt = ai.translationTask || { sentence: "My name is Ravi", prompt: "Arrange the words to form a sentence", englishTranslation: "My name is Ravi", tiles: ["My", "name", "is", "Ravi", "book", "red", "the"] };
                      const isChecked = lessonTranslationFeedback !== null;

                      const tilesKey = (tt.tiles || []).join("|");
                      if (lessonTranslationShuffleRef.current.key !== tilesKey) {
                        const arr = [...(tt.tiles || [])];
                        for (let i = arr.length - 1; i > 0; i--) {
                          const j = Math.floor(Math.random() * (i + 1));
                          [arr[i], arr[j]] = [arr[j], arr[i]];
                        }
                        lessonTranslationShuffleRef.current = { key: tilesKey, tiles: arr };
                      }
                      const shuffledTiles = lessonTranslationShuffleRef.current.tiles;

                      return (
                        <div className="ai-lesson-step" style={{ paddingBottom: '120px' }}>
                          <div className="ai-lesson-step-header" style={{ marginBottom: '16px' }}>
                            <span className="ai-step-badge">🧩 Arrange the words</span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', margin: '20px 0' }}>
                            <img src="/as1.png" alt="LISA Mascot" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
                            <div style={{
                              flexGrow: 1,
                              background: 'var(--panel)',
                              border: '2px solid var(--line)',
                              borderRadius: '20px',
                              padding: '16px 24px',
                              position: 'relative'
                            }}>
                              <div style={{
                                position: 'absolute',
                                left: '-9px',
                                top: '32px',
                                width: '14px',
                                height: '14px',
                                background: 'var(--panel)',
                                borderLeft: '2px solid var(--line)',
                                borderBottom: '2px solid var(--line)',
                                transform: 'rotate(45deg)'
                              }}></div>
                              <p style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>{tt.prompt}</p>
                            </div>
                          </div>

                          <div style={{
                            borderBottom: '2px solid var(--line)',
                            minHeight: '80px',
                            margin: '30px 0 20px',
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '10px',
                            padding: '10px 0',
                            alignItems: 'center'
                          }}>
                            {lessonTranslationSelected.map((word, wIdx) => (
                              <button
                                key={wIdx}
                                type="button"
                                style={{
                                  background: 'var(--accent)',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '10px',
                                  padding: '10px 16px',
                                  fontSize: '1.1rem',
                                  fontWeight: '700',
                                  cursor: 'pointer',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}
                                onClick={() => {
                                  if (!isChecked) {
                                    setLessonTranslationSelected(prev => prev.filter((_, idx) => idx !== wIdx));
                                  }
                                }}
                                disabled={isChecked}
                              >
                                {word}
                              </button>
                            ))}
                            {lessonTranslationSelected.length === 0 && (
                              <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Tap words below to arrange...</span>
                            )}
                          </div>

                          <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '10px',
                            ['justify' + 'Content']: 'center',
                            margin: '20px 0 30px'
                          }}>
                            {shuffledTiles.map((word, wIdx) => {
                              const isUsed = lessonTranslationSelected.includes(word);
                              return (
                                <button
                                  key={wIdx}
                                  type="button"
                                  style={{
                                    background: isUsed ? 'var(--line)' : 'var(--panel)',
                                    color: isUsed ? 'transparent' : 'var(--text)',
                                    border: '2px solid var(--line)',
                                    borderRadius: '10px',
                                    padding: '10px 16px',
                                    fontSize: '1.1rem',
                                    fontWeight: '700',
                                    cursor: isUsed ? 'default' : 'pointer',
                                    boxShadow: isUsed ? 'none' : '0 2px 4px rgba(0,0,0,0.05)',
                                    opacity: isUsed ? 0.3 : 1
                                  }}
                                  onClick={() => {
                                    if (!isChecked && !isUsed) {
                                      setLessonTranslationSelected(prev => [...prev, word]);
                                    }
                                  }}
                                  disabled={isChecked || isUsed}
                                >
                                  {word}
                                </button>
                              );
                            })}
                          </div>

                          {!isChecked && (
                            <div style={{ display: 'flex', ['justify' + 'Content']: 'center' }}>
                              <button
                                type="button"
                                className="primary-btn"
                                style={{ padding: '12px 40px', borderRadius: '12px' }}
                                onClick={() => {
                                  const userSentence = lessonTranslationSelected.join(" ").trim().toLowerCase();
                                  const clean = (s) => s.replace(/[.,\/#!$%\^&\*;:{}=\-_\u0060()?]/g, "").toLowerCase().trim();
                                  const correct = clean(userSentence) === clean(tt.englishTranslation);

                                  setLessonTranslationFeedback({
                                    isCorrect: correct,
                                    correctAnswer: tt.englishTranslation
                                  });
                                  if (correct) recordDailyCorrect();
                                }}
                                disabled={lessonTranslationSelected.length === 0}
                              >
                                Check Answer
                              </button>
                            </div>
                          )}

                          {isChecked && (
                            <div style={{
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              right: 0,
                              background: lessonTranslationFeedback.isCorrect ? '#d1fae5' : '#fee2e2',
                              borderTop: `2px solid ${lessonTranslationFeedback.isCorrect ? '#10b981' : '#ef4444'}`,
                              padding: '20px 40px',
                              zIndex: 100
                            }}>
                              <div style={{
                                display: 'flex',
                                ['justify' + 'Content']: 'space-between',
                                alignItems: 'center',
                                width: '100%',
                                maxWidth: '1000px',
                                margin: '0 auto'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                  <span style={{ fontSize: '2rem' }}>{lessonTranslationFeedback.isCorrect ? "🎉" : "❌"}</span>
                                  <div>
                                    <h4 style={{ margin: 0, color: lessonTranslationFeedback.isCorrect ? '#065f46' : '#991b1b', fontWeight: '800', fontSize: '1.2rem' }}>
                                      {lessonTranslationFeedback.isCorrect ? "Excellent!" : "Incorrect"}
                                    </h4>
                                    <p style={{ margin: '4px 0 0', color: lessonTranslationFeedback.isCorrect ? '#047857' : '#b91c1c', fontSize: '0.95rem' }}>
                                      {lessonTranslationFeedback.isCorrect ? "Beautiful translation!" : `Correct Translation: "${lessonTranslationFeedback.correctAnswer}"`}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  className="primary-btn"
                                  style={{
                                    background: lessonTranslationFeedback.isCorrect ? '#10b981' : '#ef4444',
                                    color: 'white',
                                    border: 'none',
                                    padding: '12px 30px',
                                    borderRadius: '12px',
                                    fontWeight: '800',
                                    cursor: 'pointer'
                                  }}
                                  onClick={() => {
                                    setLessonTranslationFeedback(null);
                                    setLessonTranslationSelected([]);
                                    setLessonStep(8);
                                  }}
                                >
                                  Continue
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Step 8: Match Sentence / Pairs */}
                    {lessonStep === 8 && (() => {
                      const pairs = ai.matchingPairs || [
                        { left: "School", right: "A place where we learn" },
                        { left: "Book", right: "We read it to gain knowledge" },
                        { left: "Boy", right: "A young male child" },
                        { left: "Water", right: "A clear liquid we drink" }
                      ];

                      const leftItems = pairs.map(p => p.left);
                      const rightItems = [...pairs].map(p => p.right).sort();

                      const isStepFinished = lessonMatchCompleted.length === pairs.length;

                      const handleLeftClick = (item) => {
                        if (lessonMatchCompleted.includes(item)) return;
                        setLessonMatchSelectedLeft(item);
                        if (lessonMatchSelectedRight) {
                          const pair = pairs.find(p => p.left === item && p.right === lessonMatchSelectedRight);
                          if (pair) {
                            setLessonMatchCompleted(prev => [...prev, item]);
                            recordDailyCorrect();
                            recordLessonAnswer(true);
                          } else {
                            setLessonMatchFeedback("Incorrect pair!");
                            setTimeout(() => setLessonMatchFeedback(null), 1000);
                          }
                          setLessonMatchSelectedLeft(null);
                          setLessonMatchSelectedRight(null);
                        }
                      };

                      const handleRightClick = (item) => {
                        const pair = pairs.find(p => p.right === item);
                        if (pair && lessonMatchCompleted.includes(pair.left)) return;

                        setLessonMatchSelectedRight(item);
                        if (lessonMatchSelectedLeft) {
                          const pObj = pairs.find(p => p.left === lessonMatchSelectedLeft && p.right === item);
                          if (pObj) {
                            setLessonMatchCompleted(prev => [...prev, lessonMatchSelectedLeft]);
                            recordDailyCorrect();
                          } else {
                            setLessonMatchFeedback("Incorrect pair!");
                            setTimeout(() => setLessonMatchFeedback(null), 1000);
                          }
                          setLessonMatchSelectedLeft(null);
                          setLessonMatchSelectedRight(null);
                        }
                      };

                      return (
                        <div className="ai-lesson-step" style={{ paddingBottom: '120px' }}>
                          <div className="ai-lesson-step-header" style={{ marginBottom: '16px' }}>
                            <span className="ai-step-badge">🔗 Make the correct pairs of words</span>
                          </div>

                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '24px',
                            margin: '30px 0'
                          }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              {leftItems.map((item, idx) => {
                                const isCompleted = lessonMatchCompleted.includes(item);
                                const isSelected = lessonMatchSelectedLeft === item;

                                return (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handleLeftClick(item)}
                                    style={{
                                      padding: '16px',
                                      borderRadius: '16px',
                                      border: isSelected ? '2px solid var(--accent)' : '2px solid var(--line)',
                                      background: isCompleted ? 'var(--line)' : isSelected ? 'rgba(var(--accent-rgb), 0.1)' : 'var(--panel)',
                                      color: isCompleted ? 'var(--text-muted)' : 'var(--text)',
                                      textDecoration: isCompleted ? 'line-through' : 'none',
                                      fontWeight: '700',
                                      fontSize: '1.1rem',
                                      cursor: isCompleted ? 'default' : 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      ['justify' + 'Content']: 'center',
                                      gap: '8px',
                                      textAlign: 'center',
                                      opacity: isCompleted ? 0.6 : 1
                                    }}
                                    disabled={isCompleted}
                                  >
                                    <span>{item}</span>
                                    {isCompleted && <span>✅</span>}
                                  </button>
                                );
                              })}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              {rightItems.map((item, idx) => {
                                const matchedPair = pairs.find(p => p.right === item);
                                const isCompleted = matchedPair && lessonMatchCompleted.includes(matchedPair.left);
                                const isSelected = lessonMatchSelectedRight === item;

                                return (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handleRightClick(item)}
                                    style={{
                                      padding: '16px',
                                      borderRadius: '16px',
                                      border: isSelected ? '2px solid var(--accent)' : '2px solid var(--line)',
                                      background: isCompleted ? 'var(--line)' : isSelected ? 'rgba(var(--accent-rgb), 0.1)' : 'var(--panel)',
                                      color: isCompleted ? 'var(--text-muted)' : 'var(--text)',
                                      textDecoration: isCompleted ? 'line-through' : 'none',
                                      fontWeight: '700',
                                      fontSize: '1.1rem',
                                      cursor: isCompleted ? 'default' : 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      ['justify' + 'Content']: 'center',
                                      gap: '8px',
                                      textAlign: 'center',
                                      opacity: isCompleted ? 0.6 : 1
                                    }}
                                    disabled={isCompleted}
                                  >
                                    <span>{item}</span>
                                    {isCompleted && <span>✅</span>}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {lessonMatchFeedback && (
                            <div style={{ textAlign: 'center', color: '#ef4444', fontWeight: '800', fontSize: '1.2rem', margin: '10px 0' }}>
                              ❌ {lessonMatchFeedback}
                            </div>
                          )}

                          {isStepFinished && (
                            <div style={{
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              right: 0,
                              background: '#d1fae5',
                              borderTop: '2px solid #10b981',
                              padding: '20px 40px',
                              zIndex: 100
                            }}>
                              <div style={{
                                display: 'flex',
                                ['justify' + 'Content']: 'space-between',
                                alignItems: 'center',
                                width: '100%',
                                maxWidth: '1000px',
                                margin: '0 auto'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                  <span style={{ fontSize: '2rem' }}>🎉</span>
                                  <div>
                                    <h4 style={{ margin: 0, color: '#065f46', fontWeight: '800', fontSize: '1.2rem' }}>
                                      Pairs Matched Successfully!
                                    </h4>
                                    <p style={{ margin: '4px 0 0', color: '#047857', fontSize: '0.95rem' }}>
                                      Perfect matching speed! Keep it up.
                                    </p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  className="primary-btn"
                                  style={{
                                    background: '#10b981',
                                    color: 'white',
                                    border: 'none',
                                    padding: '12px 30px',
                                    borderRadius: '12px',
                                    fontWeight: '800',
                                    cursor: 'pointer'
                                  }}
                                  onClick={() => {
                                    setLessonMatchCompleted([]);
                                    setLessonStep(9);
                                  }}
                                >
                                  Continue
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Step 9: Choose the word you hear */}
                    {lessonStep === 9 && (() => {
                      const lt = ai.listeningTask || { audioText: "Hello", tiles: ["Hello", "Bye", "Welcome"] };
                      const isChecked = lessonListeningFeedback !== null;

                      return (
                        <div className="ai-lesson-step" style={{ paddingBottom: '120px' }}>
                          <div className="ai-lesson-step-header" style={{ marginBottom: '16px' }}>
                            <span className="ai-step-badge">🎧 Choose the words you hear</span>
                          </div>

                          <div style={{
                            display: 'flex',
                            ['justify' + 'Content']: 'center',
                            alignItems: 'center',
                            gap: '20px',
                            margin: '30px 0'
                          }}>
                            <button
                              type="button"
                              onClick={() => speakText(lt.audioText, 1.0)}
                              style={{
                                width: '100px',
                                height: '100px',
                                borderRadius: '28px',
                                background: '#38bdf8',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                ['justify' + 'Content']: 'center',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                              }}
                            >
                              <span style={{ fontSize: '3.5rem' }}>🔊</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => speakText(lt.audioText, 0.2)}
                              style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '24px',
                                background: '#0284c7',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                ['justify' + 'Content']: 'center',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                              }}
                              title="Listen slowly"
                            >
                              <span style={{ fontSize: '2.5rem' }}>🐢</span>
                            </button>
                          </div>

                          <div style={{
                            borderBottom: '2px solid var(--line)',
                            minHeight: '80px',
                            margin: '30px 0 20px',
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '10px',
                            padding: '10px 0',
                            alignItems: 'center',
                            ['justify' + 'Content']: 'center'
                          }}>
                            {lessonListeningSelected.map((word, wIdx) => (
                              <button
                                key={wIdx}
                                type="button"
                                style={{
                                  background: 'var(--accent)',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '10px',
                                  padding: '10px 16px',
                                  fontSize: '1.1rem',
                                  fontWeight: '700',
                                  cursor: 'pointer',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}
                                onClick={() => {
                                  if (!isChecked) {
                                    setLessonListeningSelected(prev => prev.filter((_, idx) => idx !== wIdx));
                                  }
                                }}
                                disabled={isChecked}
                              >
                                {word}
                              </button>
                            ))}
                            {lessonListeningSelected.length === 0 && (
                              <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Tap words below to translate...</span>
                            )}
                          </div>

                          <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '10px',
                            ['justify' + 'Content']: 'center',
                            margin: '20px 0 30px'
                          }}>
                            {lt.tiles.map((word, wIdx) => {
                              const isUsed = lessonListeningSelected.includes(word);
                              return (
                                <button
                                  key={wIdx}
                                  type="button"
                                  style={{
                                    background: isUsed ? 'var(--line)' : 'var(--panel)',
                                    color: isUsed ? 'transparent' : 'var(--text)',
                                    border: '2px solid var(--line)',
                                    borderRadius: '10px',
                                    padding: '10px 16px',
                                    fontSize: '1.1rem',
                                    fontWeight: '700',
                                    cursor: isUsed ? 'default' : 'pointer',
                                    boxShadow: isUsed ? 'none' : '0 2px 4px rgba(0,0,0,0.05)',
                                    opacity: isUsed ? 0.3 : 1
                                  }}
                                  onClick={() => {
                                    if (!isChecked && !isUsed) {
                                      setLessonListeningSelected(prev => [...prev, word]);
                                    }
                                  }}
                                  disabled={isChecked || isUsed}
                                >
                                  {word}
                                </button>
                              );
                            })}
                          </div>

                          {!isChecked && (
                            <div style={{ display: 'flex', ['justify' + 'Content']: 'center' }}>
                              <button
                                type="button"
                                className="primary-btn"
                                style={{ padding: '12px 40px', borderRadius: '12px' }}
                                onClick={() => {
                                  const userSentence = lessonListeningSelected.join(" ").trim().toLowerCase();
                                  const clean = (s) => s.replace(/[.,\/#!$%\^&\*;:{}=\-_\u0060()?]/g, "").toLowerCase().trim();
                                  const correct = clean(userSentence) === clean(lt.audioText);

                                  setLessonListeningFeedback({
                                    isCorrect: correct,
                                    correctAnswer: lt.audioText
                                  });
                                  if (correct) recordDailyCorrect();
                                  recordLessonAnswer(correct);
                                }}
                                disabled={lessonListeningSelected.length === 0}
                              >
                                Check Answer
                              </button>
                            </div>
                          )}

                          {isChecked && (
                            <div style={{
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              right: 0,
                              background: lessonListeningFeedback.isCorrect ? '#d1fae5' : '#fee2e2',
                              borderTop: `2px solid ${lessonListeningFeedback.isCorrect ? '#10b981' : '#ef4444'}`,
                              padding: '20px 40px',
                              zIndex: 100
                            }}>
                              <div style={{
                                display: 'flex',
                                ['justify' + 'Content']: 'space-between',
                                alignItems: 'center',
                                width: '100%',
                                maxWidth: '1000px',
                                margin: '0 auto'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                  <span style={{ fontSize: '2rem' }}>{lessonListeningFeedback.isCorrect ? "🎉" : "❌"}</span>
                                  <div>
                                    <h4 style={{ margin: 0, color: lessonListeningFeedback.isCorrect ? '#065f46' : '#991b1b', fontWeight: '800', fontSize: '1.2rem' }}>
                                      {lessonListeningFeedback.isCorrect ? "Excellent!" : "Incorrect"}
                                    </h4>
                                    <p style={{ margin: '4px 0 0', color: lessonListeningFeedback.isCorrect ? '#047857' : '#b91c1c', fontSize: '0.95rem' }}>
                                      {lessonListeningFeedback.isCorrect ? "You heard it correctly!" : `Correct Translation: "${lessonListeningFeedback.correctAnswer}"`}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  className="primary-btn"
                                  style={{
                                    background: lessonListeningFeedback.isCorrect ? '#10b981' : '#ef4444',
                                    color: 'white',
                                    border: 'none',
                                    padding: '12px 30px',
                                    borderRadius: '12px',
                                    fontWeight: '800',
                                    cursor: 'pointer'
                                  }}
                                  onClick={() => {
                                    setLessonListeningFeedback(null);
                                    setLessonListeningSelected([]);
                                    setLessonUnscrambleIndex(0);
                                    setLessonUnscrambleSelected([]);
                                    setLessonUnscrambleFeedback(null);
                                    setLessonStep(10);
                                  }}
                                >
                                  Continue
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Step 10: Unscramble / Rearrange letters */}
                    {lessonStep === 10 && (() => {
                      const list = ai.unscramble && ai.unscramble.length ? ai.unscramble : [{ hint: "A place with plants and flowers", emoji: "🌳", answer: "GARDEN", tiles: ["G", "A", "R", "D", "E", "N", "B", "O"] }];
                      const item = list[lessonUnscrambleIndex] || list[0];
                      const isChecked = lessonUnscrambleFeedback !== null;

                      const unscrambleKey = `${item.hint}|${item.answer}`;
                      if (!lessonUnscrambleShuffleRef.current[unscrambleKey]) {
                        const arr = [...(item.tiles || [])];
                        for (let i = arr.length - 1; i > 0; i--) {
                          const j = Math.floor(Math.random() * (i + 1));
                          [arr[i], arr[j]] = [arr[j], arr[i]];
                        }
                        lessonUnscrambleShuffleRef.current[unscrambleKey] = arr;
                      }
                      const displayTiles = lessonUnscrambleShuffleRef.current[unscrambleKey];
                      const built = lessonUnscrambleSelected.map(i => displayTiles[i]).join("");

                      const handleTile = (tIdx) => {
                        if (isChecked || lessonUnscrambleSelected.includes(tIdx)) return;
                        setLessonUnscrambleSelected(prev => [...prev, tIdx]);
                      };
                      const handleRemove = (pos) => {
                        if (isChecked) return;
                        setLessonUnscrambleSelected(prev => prev.filter((_, i) => i !== pos));
                      };

                      return (
                        <div className="ai-lesson-step" style={{ paddingBottom: '120px' }}>
                          <div className="ai-lesson-step-header" style={{ marginBottom: '16px' }}>
                            <span className="ai-step-badge">🔤 Unscramble</span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', margin: '20px 0' }}>
                            <img src="/as1.png" alt="LISA Mascot" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
                            <div style={{ flexGrow: 1, background: 'var(--panel)', border: '2px solid var(--line)', borderRadius: '20px', padding: '16px 24px', position: 'relative' }}>
                              <div style={{ position: 'absolute', left: '-9px', top: '32px', width: '14px', height: '14px', background: 'var(--panel)', borderLeft: '2px solid var(--line)', borderBottom: '2px solid var(--line)', transform: 'rotate(45deg)' }}></div>
                              <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700' }}>{item.emoji} {item.hint}</p>
                            </div>
                          </div>

                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', margin: '24px 0', minHeight: '56px' }}>
                            {lessonUnscrambleSelected.length === 0 && <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Tap the letters below to build the word</span>}
                            {lessonUnscrambleSelected.map((tIdx, pos) => (
                              <button key={pos} type="button" onClick={() => handleRemove(pos)} disabled={isChecked}
                                style={{ background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 16px', fontSize: '1.3rem', fontWeight: '800', cursor: isChecked ? 'default' : 'pointer' }}>
                                {displayTiles[tIdx]}
                              </button>
                            ))}
                          </div>

                          {!isChecked && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', margin: '20px 0 30px' }}>
                              {displayTiles.map((letter, tIdx) => {
                                const used = lessonUnscrambleSelected.includes(tIdx);
                                return (
                                  <button key={tIdx} type="button" onClick={() => handleTile(tIdx)} disabled={used}
                                    style={{ background: used ? 'var(--line)' : 'var(--panel)', color: used ? 'transparent' : 'var(--text)', border: '2px solid var(--line)', borderRadius: '10px', padding: '10px 16px', fontSize: '1.3rem', fontWeight: '800', cursor: used ? 'default' : 'pointer' }}>
                                    {letter}
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {!isChecked && (
                            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                              <button type="button" className="primary-btn" style={{ padding: '12px 40px', borderRadius: '12px' }}
                                onClick={() => {
                                  const correct = built.trim().toUpperCase() === item.answer.trim().toUpperCase();
                                  setLessonUnscrambleFeedback({ isCorrect: correct, correctAnswer: item.answer });
                                  if (correct) recordDailyCorrect();
                                  recordLessonAnswer(correct);
                                }}
                                disabled={lessonUnscrambleSelected.length === 0}>
                                Check Answer
                              </button>
                            </div>
                          )}

                          {lessonUnscrambleFeedback && (
                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: lessonUnscrambleFeedback.isCorrect ? '#d1fae5' : '#fee2e2', borderTop: `2px solid ${lessonUnscrambleFeedback.isCorrect ? '#10b981' : '#ef4444'}`, padding: '20px 40px', zIndex: 100 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                  <span style={{ fontSize: '2rem' }}>{lessonUnscrambleFeedback.isCorrect ? "🎉" : "❌"}</span>
                                  <div>
                                    <h4 style={{ margin: 0, color: lessonUnscrambleFeedback.isCorrect ? '#065f46' : '#991b1b', fontWeight: '800', fontSize: '1.2rem' }}>{lessonUnscrambleFeedback.isCorrect ? "Excellent!" : "Incorrect"}</h4>
                                    <p style={{ margin: '4px 0 0', color: lessonUnscrambleFeedback.isCorrect ? '#047857' : '#b91c1c', fontSize: '0.95rem' }}>{lessonUnscrambleFeedback.isCorrect ? "You unscrambled it!" : `Correct word: "${lessonUnscrambleFeedback.correctAnswer}"`}</p>
                                  </div>
                                </div>
                                <button type="button" className="primary-btn" style={{ background: lessonUnscrambleFeedback.isCorrect ? '#10b981' : '#ef4444', color: 'white', border: 'none', padding: '12px 30px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer' }}
                                  onClick={() => {
                                    setLessonUnscrambleFeedback(null);
                                    setLessonUnscrambleSelected([]);
                                    setLessonImageChoiceIndex(0);
                                    setLessonImageChoiceSel(null);
                                    setLessonImageChoiceFeedback(null);
                                    setLessonStep(11);
                                  }}>Continue</button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Step 11: Choose the correct picture */}
                    {lessonStep === 11 && (() => {
                      const list = ai.imageChoice && ai.imageChoice.length ? ai.imageChoice : [{ word: "school", prompt: "Tap the picture that means school", options: ["🏫", "🍎", "🚗"], correctIndex: 0 }];
                      const item = list[lessonImageChoiceIndex] || list[0];
                      const isChecked = lessonImageChoiceFeedback !== null;

                      return (
                        <div className="ai-lesson-step" style={{ paddingBottom: '120px' }}>
                          <div className="ai-lesson-step-header" style={{ marginBottom: '16px' }}>
                            <span className="ai-step-badge">🖼️ Choose the correct picture</span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', margin: '20px 0' }}>
                            <img src="/as1.png" alt="LISA Mascot" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
                            <div style={{ flexGrow: 1, background: 'var(--panel)', border: '2px solid var(--line)', borderRadius: '20px', padding: '16px 24px', position: 'relative' }}>
                              <div style={{ position: 'absolute', left: '-9px', top: '32px', width: '14px', height: '14px', background: 'var(--panel)', borderLeft: '2px solid var(--line)', borderBottom: '2px solid var(--line)', transform: 'rotate(45deg)' }}></div>
                              <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700' }}>{item.prompt}</p>
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', margin: '30px 0' }}>
                            {item.options.map((opt, oIdx) => {
                              const selected = lessonImageChoiceSel === oIdx;
                              let border = '2px solid var(--line)';
                              let bg = 'var(--panel)';
                              if (isChecked) {
                                if (oIdx === item.correctIndex) { border = '2px solid #10b981'; bg = '#d1fae5'; }
                                else if (selected) { border = '2px solid #ef4444'; bg = '#fee2e2'; }
                              } else if (selected) { border = '2px solid var(--accent)'; bg = 'rgba(var(--accent-rgb),0.05)'; }
                              return (
                                <button key={oIdx} type="button" onClick={() => { if (!isChecked) setLessonImageChoiceSel(oIdx); }} disabled={isChecked}
                                  style={{ border, background: bg, borderRadius: '20px', padding: '24px 10px', fontSize: '5.5rem', cursor: isChecked ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  {opt}
                                </button>
                              );
                            })}
                          </div>

                          {!isChecked && (
                            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                              <button type="button" className="primary-btn" style={{ padding: '12px 40px', borderRadius: '12px' }}
                                onClick={() => {
                                  const correct = lessonImageChoiceSel === item.correctIndex;
                                  setLessonImageChoiceFeedback({ isCorrect: correct });
                                  if (correct) recordDailyCorrect();
                                  recordLessonAnswer(correct);
                                }}
                                disabled={lessonImageChoiceSel === null}>Check Answer</button>
                            </div>
                          )}

                          {lessonImageChoiceFeedback && (
                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: lessonImageChoiceFeedback.isCorrect ? '#d1fae5' : '#fee2e2', borderTop: `2px solid ${lessonImageChoiceFeedback.isCorrect ? '#10b981' : '#ef4444'}`, padding: '20px 40px', zIndex: 100 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                  <span style={{ fontSize: '2rem' }}>{lessonImageChoiceFeedback.isCorrect ? "🎉" : "❌"}</span>
                                  <div>
                                    <h4 style={{ margin: 0, color: lessonImageChoiceFeedback.isCorrect ? '#065f46' : '#991b1b', fontWeight: '800', fontSize: '1.2rem' }}>{lessonImageChoiceFeedback.isCorrect ? "Excellent!" : "Incorrect"}</h4>
                                    <p style={{ margin: '4px 0 0', color: lessonImageChoiceFeedback.isCorrect ? '#047857' : '#b91c1c', fontSize: '0.95rem' }}>{lessonImageChoiceFeedback.isCorrect ? "You picked the right picture!" : `Correct picture: ${item.options[item.correctIndex]}`}</p>
                                  </div>
                                </div>
                                <button type="button" className="primary-btn" style={{ background: lessonImageChoiceFeedback.isCorrect ? '#10b981' : '#ef4444', color: 'white', border: 'none', padding: '12px 30px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer' }}
                                  onClick={() => {
                                    setLessonImageChoiceFeedback(null);
                                    setLessonImageChoiceSel(null);
                                    setLessonTracingIndex(0);
                                    setLessonTracingDone(false);
                                    setLessonTracingFeedback(null);
                                    setLessonTracingAccuracy(null);
                                    setLessonStep(12);
                                  }}>Continue</button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Step 12: Tracing on canvas */}
                    {lessonStep === 12 && (() => {
                      const list = ai.tracing && ai.tracing.length ? ai.tracing : [{ kind: "playground", question: "Where do children play?", info: "Where do children play?", sound: "playground" }];
                      const item = list[lessonTracingIndex] || list[0];

                      const getPos = (e) => {
                        const canvas = tracingCanvasRef.current;
                        const rect = canvas.getBoundingClientRect();
                        return { x: (e.clientX - rect.left) * (canvas.width / rect.width), y: (e.clientY - rect.top) * (canvas.height / rect.height) };
                      };
                      const startDraw = (e) => {
                        const canvas = tracingCanvasRef.current;
                        const ctx = canvas.getContext("2d");
                        canvas.isDrawing = true;
                        const p = getPos(e);
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        setLessonTracingDone(true);
                      };
                      const moveDraw = (e) => {
                        const canvas = tracingCanvasRef.current;
                        if (!canvas.isDrawing) return;
                        const ctx = canvas.getContext("2d");
                        const p = getPos(e);
                        ctx.lineTo(p.x, p.y);
                        ctx.strokeStyle = "#0284c7";
                        ctx.lineWidth = 8;
                        ctx.lineCap = "round";
                        ctx.lineJoin = "round";
                        ctx.stroke();
                      };
                      const endDraw = () => { if (tracingCanvasRef.current) tracingCanvasRef.current.isDrawing = false; };
                      const clearCanvas = () => {
                        if (tracingCanvasRef.current) {
                          drawTracingGuide(tracingCanvasRef.current, item);
                          setLessonTracingDone(false);
                        }
                      };

                      return (
                        <div className="ai-lesson-step" style={{ paddingBottom: '120px' }}>
                          <div className="ai-lesson-step-header" style={{ marginBottom: '16px' }}>
                            <span className="ai-step-badge">✏️ Draw the picture</span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', margin: '16px 0' }}>
                            <img src="/as1.png" alt="LISA Mascot" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
                            <div style={{ flexGrow: 1, background: 'var(--panel)', border: '2px solid var(--line)', borderRadius: '20px', padding: '16px 24px', position: 'relative' }}>
                              <div style={{ position: 'absolute', left: '-9px', top: '32px', width: '14px', height: '14px', background: 'var(--panel)', borderLeft: '2px solid var(--line)', borderBottom: '2px solid var(--line)', transform: 'rotate(45deg)' }}></div>
                              <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700' }}>{item.question}</p>
                            </div>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0' }}>
                            <canvas
                              ref={tracingCanvasRef}
                              width={400}
                              height={400}
                              onPointerDown={startDraw}
                              onPointerMove={moveDraw}
                              onPointerUp={endDraw}
                              onPointerLeave={endDraw}
                              style={{ border: '2px solid var(--line)', borderRadius: '16px', background: 'var(--panel)', touchAction: 'none', maxWidth: '100%' }}
                            />
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', margin: '16px 0' }}>
                            <button type="button" onClick={() => speakText(item.sound)} style={{ background: '#38bdf8', border: 'none', color: 'white', borderRadius: '12px', padding: '12px 20px', fontWeight: '800', cursor: 'pointer', fontSize: '1rem' }}>🔊 Play sound</button>
                            <button type="button" onClick={clearCanvas} style={{ background: 'var(--panel-strong)', border: '2px solid var(--line)', borderRadius: '12px', padding: '12px 20px', fontWeight: '800', cursor: 'pointer', fontSize: '1rem' }}>↺ Clear</button>
                          </div>

                          {!lessonTracingFeedback ? (
                            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                              <button type="button" className="duo-check-btn"
                                onClick={() => {
                                  const targetText = (item.letter || item.word || "A").toString();
                                  const score = evaluateDrawingAccuracy(tracingCanvasRef.current, targetText);
                                  setLessonTracingAccuracy(score);
                                  setLessonTracingFeedback(score >= 20 ? "correct" : "incorrect");
                                  const correct = score >= 20;
                                  if (correct) recordDailyCorrect();
                                  recordLessonAnswer(correct);
                                }}
                                disabled={!lessonTracingDone}>Check Writing</button>
                            </div>
                          ) : (
                            <div style={{
                              position: 'absolute',
                              bottom: 0, left: 0, right: 0,
                              background: lessonTracingFeedback === "correct" ? '#d1fae5' : '#fee2e2',
                              borderTop: `2px solid ${lessonTracingFeedback === "correct" ? '#10b981' : '#ef4444'}`,
                              padding: '20px 40px',
                              zIndex: 100,
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}>
                              <div>
                                <h4 style={{ margin: 0, color: lessonTracingFeedback === "correct" ? '#065f46' : '#991b1b', fontWeight: '800', fontSize: '1.2rem' }}>
                                  {lessonTracingFeedback === "correct" ? `Excellent! (Accuracy: ${lessonTracingAccuracy}%)` : `Incorrect (Accuracy: ${lessonTracingAccuracy}%)`}
                                </h4>
                                <p style={{ margin: '4px 0 0', color: lessonTracingFeedback === "correct" ? '#047857' : '#b91c1c', fontSize: '0.95rem' }}>
                                  {lessonTracingFeedback === "correct" ? 'Your handwriting matches the word!' : 'Try to write it closer to the target shape next time.'}
                                </p>
                              </div>
                              <button type="button" className="primary-btn" onClick={advanceLessonStep}>Continue</button>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                  </div>
                );
              })()}
            </div>
          </div>
        )}


        {showAllAchievementsModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10000,
            padding: '20px'
          }}>
            <div className="achievements-modal-scroll" style={{
              background: 'var(--panel)',
              border: '2px solid var(--line)',
              borderRadius: '24px',
              width: '100%',
              maxWidth: '850px',
              maxHeight: '92vh',
              overflowY: 'auto',
              padding: '30px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              position: 'relative'
            }}>
              <button
                onClick={() => setShowAllAchievementsModal(false)}
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  color: 'var(--text)',
                  cursor: 'pointer'
                }}
              >✕</button>
              <h3 style={{ margin: '0 0 25px', fontSize: '1.8rem', fontWeight: '800' }}>{t("profileAllAchievements")}</h3>
              
              <h4 style={{ margin: '20px 0 15px', fontSize: '1.25rem', fontWeight: '800', color: 'var(--accent)' }}>
                🏆 {t("dashboardAchievements") || "Curriculum Achievements"}
              </h4>
              <div className="achievements-modal-grid">
                {ACHIEVEMENT_DEFS.map((a) => {
                  let earned = false;
                  let progress = 0;
                  switch (a.id) {
                    case 1:
                      earned = true; progress = 100; break;
                    case 2:
                      earned = calculateSkillProficiency("reading") >= 75;
                      progress = Math.min(100, Math.round(calculateSkillProficiency("reading"))); break;
                    case 3:
                      earned = calculateSkillProficiency("reading_comprehension") >= 75;
                      progress = Math.min(100, Math.round(calculateSkillProficiency("reading_comprehension"))); break;
                    case 4:
                      earned = calculateSkillProficiency("writing") >= 75;
                      progress = Math.min(100, Math.round(calculateSkillProficiency("writing"))); break;
                    case 5:
                      earned = userXp >= 100;
                      progress = Math.min(100, Math.round((userXp / 100) * 100)); break;
                    case 6:
                      earned = completedLessons.filter(id => !id.startsWith("ach_")).length >= 3;
                      progress = Math.min(100, Math.round((completedLessons.filter(id => !id.startsWith("ach_")).length / 3) * 100)); break;
                    case 7:
                      earned = calculateSkillProficiency("reading_ability") >= 75;
                      progress = Math.min(100, Math.round(calculateSkillProficiency("reading_ability"))); break;
                    case 8:
                      earned = currentLevelNum >= 8;
                      progress = Math.min(100, Math.round((currentLevelNum / 8) * 100)); break;
                    case 9:
                      earned = currentLevelNum >= 12;
                      progress = Math.min(100, Math.round((currentLevelNum / 12) * 100)); break;
                    default: break;
                  }
                  return { ...a, earned, progress };
                }).map((a) => (
                  <div key={a.id} className={`achievement-card-modern ${a.earned ? "earned" : "locked"}`}>
                    <div className="achievement-card-icon-wrap" style={{ background: a.earned ? a.color : 'var(--line)', filter: a.earned ? 'none' : 'grayscale(1)' }}>
                      <span className="achievement-card-icon">{a.earned ? a.icon : '🔒'}</span>
                    </div>
                    <div className="achievement-card-details">
                      <div className="achievement-card-title">{translatedAchievements[a.id]?.title || a.title}</div>
                      <p className="achievement-card-desc">{translatedAchievements[a.id]?.desc || a.desc}</p>
                      <div className="achievement-card-progress-container">
                        <div className="achievement-card-progress-track">
                          <div className="achievement-card-progress-fill" style={{ width: `${a.progress}%`, background: a.earned ? a.color : '#a1a1aa' }}></div>
                        </div>
                        <span className="achievement-card-progress-text">{a.progress}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <h4 style={{ margin: '30px 0 15px', fontSize: '1.25rem', fontWeight: '800', color: 'var(--accent)' }}>
                {t("xpShopTitle") || "XP Shop Badges"}
              </h4>
              <div className="achievements-modal-grid">
                {SHOP_CATALOG.badges.map((b) => {
                  const earned = shopOwnedItems.includes(b.id);
                  const color = b.rarity === "legendary" ? "#d97706" : b.rarity === "rare" ? "#3b82f6" : "#6b7280";
                  return (
                    <div key={b.id} className={`achievement-card-modern ${earned ? "earned" : "locked"}`}>
                      <div className="achievement-card-icon-wrap" style={{ background: earned ? color : 'var(--line)', filter: earned ? 'none' : 'grayscale(1)' }}>
                        <span className="achievement-card-icon">{earned ? b.icon : '🔒'}</span>
                      </div>
                      <div className="achievement-card-details">
                        <div className="achievement-card-title">{t(b.id + "_name") || b.name}</div>
                        <p className="achievement-card-desc">{t(b.id + "_desc") || b.desc}</p>
                        <div className="achievement-card-progress-container">
                          <div className="achievement-card-progress-track">
                            <div className="achievement-card-progress-fill" style={{ width: earned ? '100%' : '0%', background: color }}></div>
                          </div>
                          <span className="achievement-card-progress-text">{earned ? '100%' : '0%'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {deleteModalOpen && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10000,
            padding: '20px'
          }}>
            <div style={{
              background: 'var(--panel)',
              border: '2px solid #ff4d4d',
              borderRadius: '24px',
              width: '100%',
              maxWidth: '480px',
              padding: '30px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              position: 'relative'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <AlertTriangleIcon style={{ color: '#ff1a1a', width: 28, height: 28 }} />
                <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#ff1a1a' }}>{t("profileDeleteModalTitle")}</h3>
              </div>
              <p style={{ fontSize: '0.95rem', color: 'var(--text)', margin: '0 0 16px', lineHeight: 1.6 }}>
                {t("profileDeleteModalDesc").replace("{email}", session?.user?.email || "")}
              </p>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)', marginBottom: '8px' }}>
                {t("profileDeleteModalTypePrompt")}
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder='DELETE'
                autoFocus
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: '2px solid var(--line)',
                  background: 'var(--panel-strong)',
                  color: 'var(--text)',
                  fontSize: '1rem',
                  marginBottom: '8px'
                }}
              />
              {deleteError && (
                <p style={{ color: '#ff1a1a', fontSize: '0.85rem', margin: '0 0 12px' }}>{deleteError}</p>
              )}
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button
                  type="button"
                  className="secondary-btn"
                  style={{ flex: 1 }}
                  onClick={() => { setDeleteModalOpen(false); setDeleteConfirmText(""); setDeleteError(""); }}
                  disabled={submitting}
                >
                  {t("profileDeleteModalCancel")}
                </button>
                <button
                  type="button"
                  className="primary-btn"
                  style={{ flex: 1, background: '#ff1a1a', borderColor: '#ff1a1a', color: '#ffffff', opacity: deleteConfirmText === 'DELETE' ? 1 : 0.5 }}
                  onClick={handleDeleteAccount}
                  disabled={submitting || deleteConfirmText !== 'DELETE'}
                >
                  {submitting ? t("signingOut") : t("profileDeleteModalConfirm")}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Offline Banner ── */}
        {showOfflineBanner && (
          <div className="pwa-offline-banner">
            <span>📶</span>
            <span>You are offline. Showing cached content.</span>
            <button onClick={() => setShowOfflineBanner(false)} className="pwa-banner-close" aria-label="Dismiss">✕</button>
          </div>
        )}

        {/* ── SW Update Banner ── */}
        {swUpdateAvailable && (
          <div className="pwa-update-banner">
            <span>🔄 A new version of LISA is available!</span>
            <button onClick={handleSwReload} className="pwa-update-btn">Update Now</button>
            <button onClick={() => setSwUpdateAvailable(false)} className="pwa-banner-close" aria-label="Dismiss">✕</button>
          </div>
        )}

        {/* ── Install App Banner ── */}
        {showInstallBanner && (
          <div className="pwa-install-banner">
            <div className="pwa-install-content">
              <img src="/icon.png" alt="LISA" className="pwa-install-icon" />
              <div>
                <div className="pwa-install-title">Install LISA</div>
                <div className="pwa-install-sub">Add to home screen for offline access</div>
              </div>
            </div>
            <div className="pwa-install-actions">
              <button onClick={handleInstallApp} className="pwa-install-btn">Install</button>
              <button onClick={() => { setShowInstallBanner(false); localStorage.setItem("lisa_install_dismissed", "true"); }} className="pwa-banner-close" aria-label="Dismiss">✕</button>
            </div>
          </div>
        )}

        {/* ── Mobile Bottom Navigation ── */}
        {session && session.user?.email !== "admin@gmail.com" && (
          <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
            <button className={`mobile-nav-item ${dashboardTab === "dashboard" ? "active" : ""}`} onClick={() => switchDashboardTab("dashboard")} aria-label="Dashboard">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" /></svg>
              <span>Home</span>
            </button>
            <button className={`mobile-nav-item ${dashboardTab === "learn" ? "active" : ""}`} onClick={() => switchDashboardTab("learn")} aria-label="Learn">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
              <span>Learn</span>
            </button>
            <button className={`mobile-nav-item ${dashboardTab === "practice" ? "active" : ""}`} onClick={() => switchDashboardTab("practice")} aria-label="Practice">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1" /><rect x="2" y="8" width="16" height="8" rx="2" /><line x1="6" y1="12" x2="14" y2="12" /></svg>
              <span>Practice</span>
            </button>
            <button className={`mobile-nav-item ${dashboardTab === "profile" ? "active" : ""}`} onClick={() => switchDashboardTab("profile")} aria-label="Profile">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
              <span>Profile</span>
            </button>
            <button className={`mobile-nav-item ${(dashboardTab === "shop" || dashboardTab === "leaderboard" || dashboardTab === "analytics") ? "active" : ""}`} onClick={() => switchDashboardTab(dashboardTab === "shop" || dashboardTab === "leaderboard" || dashboardTab === "analytics" ? "dashboard" : "shop")} aria-label="More">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" /></svg>
              <span>More</span>
            </button>
          </nav>
        )}
      </div>
    );
  }
  // LISA LANDING PAGE (Unauthenticated)
  if (showLanding) {
    return (
      <div className="lp-root">
        {/* Navbar */}
        <header className="lp-nav">
          <div className="lp-nav-inner">
            <div className="lp-brand">
              <div className="lp-brand-mark">L</div>
              <div className="lp-brand-text">
                <span className="lp-brand-name">LISA</span>
                <span className="lp-brand-sub">Literacy AI</span>
              </div>
            </div>
            <div className="lp-nav-right">
              {renderLanguageDropdown()}
              {renderThemeToggle()}
              <button
                type="button"
                className="lp-btn lp-btn-ghost"
                onClick={() => { setActiveTab("login"); setMessage(""); setShowLanding(false); }}
              >
                {t("login")}
              </button>
              <button
                type="button"
                className="lp-btn lp-btn-accent"
                onClick={() => { setActiveTab("register"); setMessage(""); setShowLanding(false); }}
              >
                {t("register")}
              </button>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="lp-hero">
          <div className="lp-hero-glow" />
          <div className="lp-hero-inner">
            <div className="lp-hero-text">
              <p className="lp-eyebrow">{t("aiPoweredPlatform")}</p>
              <h1 className="lp-hero-h1">
                {t("learnToReadWrite")}<br />
                <span className="lp-hero-gradient">{t("inYourLanguage")}</span>
              </h1>
              <p className="lp-hero-desc">{t("heroCopy")}</p>
              <div className="lp-hero-actions">
                <button
                  type="button"
                  className="lp-btn lp-btn-accent lp-btn-lg"
                  onClick={() => { setActiveTab("register"); setMessage(""); setShowLanding(false); }}
                >
                  {t("startForFree")}
                </button>
                <button
                  type="button"
                  className="lp-btn lp-btn-outline lp-btn-lg"
                  onClick={() => { setActiveTab("login"); setMessage(""); setShowLanding(false); }}
                >
                  {t("signIn")}
                </button>
              </div>
              <div className="lp-trust-row">
                <span className="lp-trust-chip">{t("freeForever")}</span>
                <span className="lp-trust-chip">{t("fiveLanguages")}</span>
                <span className="lp-trust-chip">{t("noDownloads")}</span>
              </div>
            </div>
            <div className="lp-hero-visual">
              <div className="lp-hero-card-wrap">
                <div className="lp-preview-card">
                  <div className="lp-preview-header">
                    <span className="lp-preview-dot lp-dot-red" />
                    <span className="lp-preview-dot lp-dot-yellow" />
                    <span className="lp-preview-dot lp-dot-green" />
                    <span className="lp-preview-title">{t("lisaLesson")}</span>
                  </div>
                  <img src="/as1.png" alt="LISA mascot" className="lp-preview-mascot" />
                  {(() => {
                    const lettersMap = {
                      English: ["A", "B", "C", "D"],
                      Hindi: ["क", "ख", "ग", "घ"],
                      Kannada: ["ಕ", "ಖ", "ಗ", "ಘ"],
                      Telugu: ["క", "ఖ", "గ", "ఘ"],
                      Tamil: ["க", "ங", "ச", "ஞ"]
                    };
                    const betterQuestionMap = {
                      English: "Which of these is the letter 'A'?",
                      Hindi: "इनमें से कौन सा अक्षर 'क' है?",
                      Kannada: "ಇವುಗಳಲ್ಲಿ 'ಕ' ಅಕ್ಷರ ಯಾವುದು?",
                      Telugu: "వీటిలో 'క' అక్షరం ఏది?",
                      Tamil: "இவற்றில் 'க' எழுத்து எது?"
                    };
                    const letters = lettersMap[selectedLanguage] || lettersMap["English"];
                    const question = betterQuestionMap[selectedLanguage] || betterQuestionMap["English"];
                    return (
                      <>
                        <div className="lp-preview-prompt">
                          {question}
                        </div>
                        <div className="lp-preview-choices">
                          {letters.map((char, index) => (
                            <span key={index} className={`lp-choice ${index === 0 ? "lp-choice-active" : ""}`}>
                              {char}
                            </span>
                          ))}
                        </div>
                      </>
                    );
                  })()}
                  <div className="lp-preview-xp">{t("lisaLessonXP")}</div>
                </div>
                <div className="lp-hero-badge lp-hbadge-1">
                  <span>🎯</span>
                  <div>
                    <strong>{t("adaptiveAiTitle")}</strong>
                    <p>{t("learnsWithYou")}</p>
                  </div>
                </div>
                <div className="lp-hero-badge lp-hbadge-2">
                  <span>🗣️</span>
                  <div>
                    <strong>{t("speechPracticeTitle")}</strong>
                    <p>{t("realtimeFeedbackTitle")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* Feature cards */}
        <section className="lp-features">
          <div className="lp-features-inner">
            <div className="lp-section-label">{t("whyLisa")}</div>
            <h2 className="lp-section-h2">{t("everythingYouNeed")}</h2>
            <div className="lp-cards-grid">
              <div className="lp-feat-card">
                <div className="lp-feat-icon lp-icon-blue">🧠</div>
                <h3>{t("feat1Title")}</h3>
                <p>{t("feat1Desc")}</p>
              </div>
              <div className="lp-feat-card">
                <div className="lp-feat-icon lp-icon-purple">🗣️</div>
                <h3>{t("feat2Title")}</h3>
                <p>{t("feat2Desc")}</p>
              </div>
              <div className="lp-feat-card">
                <div className="lp-feat-icon lp-icon-orange">✍️</div>
                <h3>{t("feat3Title")}</h3>
                <p>{t("feat3Desc")}</p>
              </div>
              <div className="lp-feat-card">
                <div className="lp-feat-icon lp-icon-green">🏆</div>
                <h3>{t("feat4Title")}</h3>
                <p>{t("feat4Desc")}</p>
              </div>
              <div className="lp-feat-card">
                <div className="lp-feat-icon lp-icon-red">🌐</div>
                <h3>{t("feat5Title")}</h3>
                <p>{t("feat5Desc")}</p>
              </div>
              <div className="lp-feat-card">
                <div className="lp-feat-icon lp-icon-teal">📊</div>
                <h3>{t("feat6Title")}</h3>
                <p>{t("feat6Desc")}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature rows */}
        <section className="lp-showcase">
          <div className="lp-showcase-inner">
            <div className="lp-showcase-row">
              <div className="lp-showcase-img">
                <img src="/as2.png" alt="Interactive Learning" />
              </div>
              <div className="lp-showcase-text">
                <p className="lp-eyebrow">{t("freeAccessibleTag")}</p>
                <h2>{t("showcase1Title")}</h2>
                <p>{t("showcase1Desc")}</p>
                <button
                  type="button"
                  className="lp-btn lp-btn-accent"
                  onClick={() => { setActiveTab("register"); setMessage(""); setShowLanding(false); }}
                >
                  {t("tryALesson")}
                </button>
              </div>
            </div>
            <div className="lp-showcase-row lp-showcase-row-rev">
              <div className="lp-showcase-img">
                <img src="/as3.png" alt="Personalized Path" />
              </div>
              <div className="lp-showcase-text">
                <p className="lp-eyebrow">{t("aiEngineTag")}</p>
                <h2>{t("showcase2Title")}</h2>
                <p>{t("showcase2Desc")}</p>
              </div>
            </div>
            <div className="lp-showcase-row">
              <div className="lp-showcase-img">
                <img src="/as4.png" alt="Speech & Canvas" />
              </div>
              <div className="lp-showcase-text">
                <p className="lp-eyebrow">{t("speechHandwritingTag")}</p>
                <h2>{t("showcase3Title")}</h2>
                <p>{t("showcase3Desc")}</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="lp-cta-banner">
          <div className="lp-cta-inner">
            <h2>{t("readyToStart")}</h2>
            <p>{t("readyToStartDesc")}</p>
            <div className="lp-cta-actions">
              <button
                type="button"
                className="lp-btn lp-btn-white lp-btn-lg"
                onClick={() => { setActiveTab("register"); setMessage(""); setShowLanding(false); }}
              >
                {t("createFreeAccount")}
              </button>
              <button
                type="button"
                className="lp-btn lp-btn-outline-white lp-btn-lg"
                onClick={() => { setActiveTab("login"); setMessage(""); setShowLanding(false); }}
              >
                {t("signIn")}
              </button>
            </div>
          </div>
        </section>


        {/* Language Modal */}
        {!selectedLanguage && (
          <div className="lang-screen">
            <div className="lang-card">
              <h2>{t("chooseLanguage")}</h2>
              <p>{t("selectLanguagePrompt")}</p>
              <div className="lang-grid">
                {languages.map((l) => (
                  <button key={l} className="lang-btn" onClick={() => handleLanguageSelect(l)}>
                    <span className="native">
                      {l === "English" && "English"}
                      {l === "Hindi" && "हिन्दी"}
                      {l === "Kannada" && "ಕನ್ನಡ"}
                      {l === "Telugu" && "తెలుగు"}
                      {l === "Tamil" && "தமிழ்"}
                    </span>
                    <span style={{ fontSize: "0.85rem", opacity: 0.7 }}>{l}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ORIGINAL LOGIN / REGISTER SCREENS (Not Logged In)
  return (
    <main className="shell">
      <div className="brand-logo-top">
        LISA
        <span className="brand-logo-tagline">Literacy Intelligence Support Assistant</span>
      </div>
      {renderLanguageDropdown()}
      {renderThemeToggle()}
      <section className="hero-panel">
        <h1>{t("heroTitle")}</h1>
        <p className="hero-copy">{t("heroCopy")}</p>
      </section>

      <section className="auth-panel" aria-label="Authentication">
        <div className="auth-card">
          {activeTab !== "forgot" && (
            <div className="auth-tabs" role="tablist" aria-label="Authentication tabs">
              <button
                className={`tab-btn ${activeTab === "login" ? "active" : ""}`}
                type="button"
                disabled={submitting}
                onClick={() => {
                  setActiveTab("login");
                  setMessage("");
                }}
                aria-selected={activeTab === "login"}
              >
                {t("login")}
              </button>
              <button
                className={`tab-btn ${activeTab === "register" ? "active" : ""}`}
                type="button"
                disabled={submitting}
                onClick={() => {
                  setActiveTab("register");
                  setMessage("");
                }}
                aria-selected={activeTab === "register"}
              >
                {t("register")}
              </button>
            </div>
          )}

          {activeTab === "login" && (
            <form className="auth-form active" onSubmit={handleLogin}>
              <h2>{t("welcomeBack")}</h2>
              <p>{t("signInToContinue")}</p>

              <label>
                {t("email")}
                <input
                  type="email"
                  name="loginEmail"
                  placeholder={t("emailPlaceholder")}
                  autoComplete="email"
                  required
                  disabled={submitting}
                />
              </label>

              <label>
                {t("password")}
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    name="loginPassword"
                    style={{ paddingRight: "44px", width: "100%" }}
                    placeholder={t("passwordPlaceholder")}
                    autoComplete="current-password"
                    required
                    disabled={submitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    style={{
                      position: "absolute",
                      right: "12px",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: "4px",
                      display: "flex",
                      alignItems: "center",
                      color: "var(--muted)",
                    }}
                  >
                    {showLoginPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </label>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "-8px" }}>
                <button
                  type="button"
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--accent)",
                    fontWeight: "600",
                    cursor: "pointer",
                    padding: 0,
                    font: "inherit",
                  }}
                  onClick={() => {
                    setActiveTab("forgot");
                    setMessage("");
                  }}
                >
                  {t("forgotPasswordLink")}
                </button>
              </div>

              <button type="submit" className="primary-btn" disabled={submitting}>
                {submitting ? t("signingIn") : t("login")}
              </button>
              <p className="helper-text">{t("newLearnerPrompt")}</p>
            </form>
          )}

          {activeTab === "register" && (
            <form className="auth-form active" onSubmit={handleRegister}>
              <h2>{t("createProfile")}</h2>

              <div className="two-col">
                <label>
                  {t("fullName")}
                  <input
                    type="text"
                    name="fullName"
                    placeholder={t("fullNamePlaceholder")}
                    autoComplete="name"
                    required
                    disabled={submitting}
                  />
                </label>

                <label>
                  {t("age")}
                  <input
                    type="number"
                    name="age"
                    min="5"
                    max="120"
                    placeholder={t("agePlaceholder")}
                    required
                    disabled={submitting}
                  />
                </label>
              </div>

              <label>
                {t("email")}
                <input
                  type="email"
                  name="registerEmail"
                  placeholder={t("emailRegisterPlaceholder")}
                  autoComplete="email"
                  required
                  disabled={submitting}
                />
              </label>

              <label>
                {t("password")}
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <input
                    type={showRegisterPassword ? "text" : "password"}
                    name="registerPassword"
                    style={{ paddingRight: "44px", width: "100%" }}
                    placeholder={t("passwordRegisterPlaceholder")}
                    autoComplete="new-password"
                    required
                    disabled={submitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                    style={{
                      position: "absolute",
                      right: "12px",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: "4px",
                      display: "flex",
                      alignItems: "center",
                      color: "var(--muted)",
                    }}
                  >
                    {showRegisterPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </label>

              <label>
                {t("confirmPassword")}
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    style={{ paddingRight: "44px", width: "100%" }}
                    placeholder={t("confirmPasswordPlaceholder")}
                    autoComplete="new-password"
                    required
                    disabled={submitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: "absolute",
                      right: "12px",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: "4px",
                      display: "flex",
                      alignItems: "center",
                      color: "var(--muted)",
                    }}
                  >
                    {showConfirmPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </label>

              <div className="two-col">
                <label>
                  {t("interfaceLanguage")}
                  <select name="interfaceLanguage" required value={selectedLanguage || ""} onChange={(e) => handleLanguageSelect(e.target.value)} disabled={submitting}>
                    <option value="" disabled>{t("selectInterfaceLanguage")}</option>
                    {languages.map((language) => (
                      <option key={language} value={language}>{t(language + "Option")}</option>
                    ))}
                  </select>
                </label>
                <label>
                  {t("learningLanguage")}
                  <select name="learningLanguage" required value={learningLanguage || "English"} onChange={(e) => handleLearningLanguageSelect(e.target.value)} disabled={submitting}>
                    <option value="" disabled>{t("selectLearningLanguage")}</option>
                    {languages.map((language) => (
                      <option key={language} value={language}>{t(language + "Option")}</option>
                    ))}
                  </select>
                </label>
              </div>

              <label>
                {t("educationLevel")}
                <select name="educationLevel" required defaultValue="" disabled={submitting}>
                  <option value="" disabled>{t("selectEducation")}</option>
                  {educationLevels.map((ed) => (
                    <option key={ed} value={ed}>{t(ed + "Option")}</option>
                  ))}
                </select>
              </label>

              <label>
                {t("experienceInTargetLanguage")}
                <select name="experienceLevel" required defaultValue="I am completely new to this language" disabled={submitting}>
                  {experienceLevels.map((exp) => (
                    <option key={exp} value={exp}>{t(experienceLevelOptionKeys[exp] || exp)}</option>
                  ))}
                </select>
              </label>

              <button type="submit" className="primary-btn" disabled={submitting}>
                {submitting ? t("creatingAccount") : t("register")}
              </button>
              <p className="helper-text">{t("personalizationHelp")}</p>
            </form>
          )}

          {activeTab === "forgot" && (
            <form className="auth-form active" onSubmit={handleForgotPassword}>
              <h2>{t("resetPasswordTitle")}</h2>
              <p>{t("enterEmailForLink")}</p>

              <label>
                {t("email")}
                <input
                  type="email"
                  name="forgotEmail"
                  placeholder={t("emailPlaceholder")}
                  autoComplete="email"
                  required
                  disabled={submitting}
                />
              </label>

              <button type="submit" className="primary-btn" disabled={submitting}>
                {submitting ? t("sendingLink") : t("sendResetLink")}
              </button>

              <div style={{ display: "flex", justifyContent: "center", marginTop: "12px" }}>
                <button
                  type="button"
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--muted)",
                    fontWeight: "600",
                    cursor: "pointer",
                    padding: 0,
                    font: "inherit",
                  }}
                  onClick={() => {
                    setActiveTab("login");
                    setMessage("");
                  }}
                >
                  {t("backToLogin")}
                </button>
              </div>
            </form>
          )}

          {message ? <p className="status-message">{message}</p> : null}
        </div>
      </section>

      <div style={{ display: "flex", justifyContent: "center", marginTop: "24px" }}>
        <button
          type="button"
          className="duo-btn duo-btn-secondary"
          onClick={() => setShowLanding(true)}
        >
          Back to Welcome Page
        </button>
      </div>

      {!selectedLanguage && (
        <div className="lang-screen">
          <div className="lang-card">
            <h2>{t("chooseLanguage")}</h2>
            <p>{t("selectLanguagePrompt")}</p>
            <div className="lang-grid">
              {languages.map((l) => (
                <button key={l} className="lang-btn" onClick={() => handleLanguageSelect(l)}>
                  <span className="native">
                    {l === "English" && "English"}
                    {l === "Hindi" && "हिन्दी"}
                    {l === "Kannada" && "ಕನ್ನಡ"}
                    {l === "Telugu" && "తెలుగు"}
                    {l === "Tamil" && "தமிழ்"}
                  </span>
                  <span style={{ fontSize: "0.85rem", opacity: 0.7 }}>{l}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default App;

