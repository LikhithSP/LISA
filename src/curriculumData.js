// LISA — Curriculum Data + Assessment Engine
// Fixed 7-section curriculum per spec. Lesson content generated dynamically via Gemini AI.

import { assessmentQuestions } from "./assessmentQuestionsData.js";
import { assessmentReadingWriting } from "./assessmentReadingWritingData.js";

// ─────────────────────────────────────────────────────────────────────────────
// SKILL CATEGORY DEFINITIONS
// ─────────────────────────────────────────────────────────────────────────────
export const SKILL_CATEGORIES = {
  letter_recognition: { label: "Letter Recognition", icon: "🔤", color: "#f59e0b" },
  word_recognition:   { label: "Word Recognition",   icon: "📝", color: "#3b82f6" },
  sentence_reading:   { label: "Sentence Reading",   icon: "📖", color: "#10b981" },
  comprehension:      { label: "Comprehension",       icon: "🧠", color: "#8b5cf6" },
  writing:            { label: "Writing",             icon: "✍️", color: "#ef4444" },
  pronunciation:      { label: "Pronunciation",       icon: "🎤", color: "#06b6d4" },
};

// Maps each skill key to its i18n translation key (see translations in App.jsx)
export const SKILL_TRANSLATION_KEYS = {
  letter_recognition: "skillLetterRecognition",
  word_recognition: "skillWordRecognition",
  sentence_reading: "skillSentenceReading",
  comprehension: "skillComprehension",
  writing: "skillWriting",
  pronunciation: "skillPronunciation",
};

export const getStrongSkillKeys = (skillScores, threshold = 50) =>
  Object.entries(skillScores || {})
    .filter(([_, v]) => typeof v === "number" && v >= threshold)
    .map(([k]) => k);

export const getWeakSkillKeys = (skillScores, threshold = 50) =>
  Object.entries(skillScores || {})
    .filter(([_, v]) => typeof v === "number" && v < threshold)
    .map(([k]) => k);

// ─────────────────────────────────────────────────────────────────────────────
// PROFICIENCY LEVELS (5-level system per spec)
// ─────────────────────────────────────────────────────────────────────────────
export const PROFICIENCY_LEVELS = {
  English: [
    { level: 1, name: "Absolute Beginner",    desc: "Cannot recognize letters or read words. Needs foundational support." },
    { level: 2, name: "Beginner",             desc: "Recognizes letters and reads simple words. Building basic vocabulary." },
    { level: 3, name: "Elementary",           desc: "Reads words and simple sentences. Developing reading fluency." },
    { level: 4, name: "Upper Elementary",     desc: "Reads compound sentences and basic paragraphs." },
    { level: 5, name: "Intermediate",         desc: "Reads paragraphs with limited comprehension. Expanding vocabulary." },
    { level: 6, name: "Upper Intermediate",   desc: "Reads longer passages and extracts key information easily." },
    { level: 7, name: "Advanced Foundation",  desc: "Strong literacy skills. Needs communication and expression refinement." },
    { level: 8, name: "Advanced",             desc: "Reads functional texts, forms, and instructions. Expresses thoughts clearly." },
    { level: 9, name: "Fluent Learner",       desc: "Demonstrates high fluency in daily reading, spelling, and grammar." },
    { level: 10, name: "Proficient Communicator", desc: "Speaks and writes with correct grammar, tone, and confidence." },
    { level: 11, name: "Professional Scholar", desc: "Reads professional, educational, and legal documents with full comprehension." },
    { level: 12, name: "Literacy Champion",    desc: "Complete mastery of functional literacy, expression, and critical thinking." },
  ],
  Hindi: [
    { level: 1, name: "पूर्ण शुरुआती",        desc: "अक्षर पहचानने और पढ़ने में असमर्थ। मूल सहायता की आवश्यकता।" },
    { level: 2, name: "प्रारंभिक",             desc: "अक्षर पहचानता है और सरल शब्द पढ़ता है।" },
    { level: 3, name: "प्राथमिक",              desc: "शब्द और सरल वाक्य पढ़ सकता है।" },
    { level: 4, name: "उच्च प्राथमिक",        desc: "संयुक्त वाक्यों और बुनियादी अनुच्छेदों को पढ़ता है।" },
    { level: 5, name: "मध्यवर्ती",             desc: "सीमित समझ के साथ अनुच्छेद पढ़ता है।" },
    { level: 6, name: "उच्च मध्यवर्ती",        desc: "लंबे गद्यांशों को पढ़ता है और मुख्य जानकारी आसानी से निकालता है।" },
    { level: 7, name: "उन्नत आधार",            desc: "मजबूत साक्षरता कौशल। संचार परिष्कार की आवश्यकता।" },
    { level: 8, name: "उन्नत",                desc: "कार्यात्मक पाठ, प्रपत्र और निर्देश पढ़ता है। विचारों को स्पष्ट रूप से व्यक्त करता है।" },
    { level: 9, name: "धाराप्रवाह शिक्षार्थी",     desc: "दैनिक पढ़ने, वर्तनी और व्याकरण में उच्च प्रवाह प्रदर्शित करता है।" },
    { level: 10, name: "कुशल संचारक",       desc: "सही व्याकरण, स्वर और आत्मविश्वास के साथ बोलता और लिखता है।" },
    { level: 11, name: "व्यावसायिक विद्वान",     desc: "पूर्ण समझ के साथ पेशेवर, शैक्षिक और कानूनी दस्तावेजों को पढ़ता है।" },
    { level: 12, name: "साक्षरता चैंपियन",       desc: "कार्यात्मक साक्षरता, अभिव्यक्ति और महत्वपूर्ण सोच में पूर्ण महारत।" },
  ],
  Kannada: [
    { level: 1, name: "ಸಂಪೂರ್ಣ ಆರಂಭಿಕ",     desc: "ಅಕ್ಷರ ಗುರುತಿಸಲು ಅಥವಾ ಪದ ಓದಲು ಸಾಧ್ಯವಿಲ್ಲ." },
    { level: 2, name: "ಪ್ರಾರಂಭಿಕ",            desc: "ಅಕ್ಷರ ಗುರುತಿಸುತ್ತದೆ ಮತ್ತು ಸರಳ ಪದ ಓದುತ್ತದೆ." },
    { level: 3, name: "ಪ್ರಾಥಮಿಕ",             desc: "ಪದ ಮತ್ತು ಸರಳ ವಾಕ್ಯ ಓದಬಲ್ಲದು." },
    { level: 4, name: "ಉನ್ನತ ಪ್ರಾಥಮಿಕ",       desc: "ಸಂಯುಕ್ತ ವಾಕ್ಯಗಳನ್ನು ಮತ್ತು ಮೂಲ ಪ್ಯಾರಾಗ್ರಾಫ್‌ಗಳನ್ನು ಓದಬಲ್ಲದು." },
    { level: 5, name: "ಮಧ್ಯವರ್ತಿ",            desc: "ಸೀಮಿತ ಗ್ರಹಿಕೆಯೊಂದಿಗೆ ಪ್ಯಾರಾಗ್ರಾಫ್ ಓದುತ್ತದೆ." },
    { level: 6, name: "ಉನ್ನತ ಮಧ್ಯವರ್ತಿ",       desc: "ದೀರ್ಘ ಪ್ಯಾರಾಗ್ರಾಫ್‌ಗಳನ್ನು ಓದುತ್ತದೆ ಮತ್ತು ಪ್ರಮುಖ ಮಾಹಿತಿಯನ್ನು ಸುಲಭವಾಗಿ ಪಡೆಯುತ್ತದೆ." },
    { level: 7, name: "ಮುಂದುವರಿದ ಆಧಾರ",      desc: "ಬಲವಾದ ಸಾಕ್ಷರತಾ ಕೌಶಲ್ಯ. ಸಂವಹನ ಸುಧಾರಣೆ ಅಗತ್ಯ." },
    { level: 8, name: "ಮುಂದುವರಿದ",           desc: "ಕಾರ್ಯಾತ್ಮಕ ಪಠ್ಯಗಳು, ನಮೂನೆಗಳು ಮತ್ತು ಸೂಚನೆಗಳನ್ನು ಓದುತ್ತದೆ. ಆಲೋಚನೆಗಳನ್ನು ಸ್ಪಷ್ಟವಾಗಿ ವ್ಯಕ್ತಪಡಿಸುತ್ತದೆ." },
    { level: 9, name: "ಸರಾಗ ಕಲಿಯುವವನು",      desc: "ದೈನಂದಿನ ಓದುವಿಕೆ, ಕಾಗುಣಿತ ಮತ್ತು ವ್ಯಾಕರಣದಲ್ಲಿ ಹೆಚ್ಚಿನ ಸರಾಗತೆಯನ್ನು ಪ್ರದರ್ಶಿಸುತ್ತದೆ." },
    { level: 10, name: "ನುರಿತ ಸಂವಹನಕಾರ",     desc: "ಸರಿಯಾದ ವ್ಯಾಕರಣ, ಧ್ವನಿ ಮತ್ತು ಆತ್ಮವಿಶ್ವಾಸದೊಂದಿಗೆ ಮಾತನಾಡುತ್ತದೆ ಮತ್ತು bರೆಯುತ್ತದೆ." },
    { level: 11, name: "ವೃತ್ತಿಪರ ವಿದ್ವಾಂಸ",     desc: "ಸಂಪೂರ್ಣ ಗ್ರಹಿಕೆಯೊಂದಿಗೆ ವೃತ್ತಿಪರ, ಶೈಕ್ಷಣಿಕ ಮತ್ತು ಕಾನೂನು ದಾಖಲೆಗಳನ್ನು ಓದುತ್ತದೆ." },
    { level: 12, name: "ಸಾಕ್ಷರತಾ ಚಾಂಪಿಯನ್",      desc: "ಕಾರ್ಯಾತ್ಮಕ ಸಾಕ್ಷರತೆ, ಅಭಿವ್ಯಕ್ತಿ ಮತ್ತು ವಿಮರ್ಶಾತ್ಮಕ ಚಿಂತನೆಯಲ್ಲಿ ಸಂಪೂರ್ಣ ಪಾಂಡಿತ್ಯ." },
  ],
  Telugu: [
    { level: 1, name: "సంపూర్ణ ప్రారంభకుడు",  desc: "అక్షరాలు గుర్తించలేరు లేదా పదాలు చదవలేరు." },
    { level: 2, name: "ప్రారంభకుడు",           desc: "అక్షరాలు గుర్తిస్తారు మరియు సాధారణ పదాలు చదువుతారు." },
    { level: 3, name: "ప్రాథమిక",              desc: "పదాలు మరియు సాధారణ వాక్యాలు చదవగలరు." },
    { level: 4, name: "ఎగువ ప్రాథమిక",         desc: "సంయుక్త వాక్యాలు మరియు ప్రాథమిక పేరాలను చదువుతారు." },
    { level: 5, name: "మధ్యస్థాయి",            desc: "పరిమిత అవగాహనతో పేరాలు చదువుతారు." },
    { level: 6, name: "ఎగువ మధ్యస్థాయి",        desc: "పెద్ద పేరాలను చదివి ముఖ్యమైన విషయాలను సులభంగా గ్రహిస్తారు." },
    { level: 7, name: "అడ్వాన్స్డ్ ఫౌండేషన్", desc: "బలమైన అక్షరాస్యత నైపుణ్యాలు. కమ్యూనికేషన్ మెరుగు అవసరం." },
    { level: 8, name: "అడ్వాన్స్డ్",             desc: "నిత్య జీవిత పత్రాలు, ఫారాలు మరియు సూచనలు చదువుతారు. ఆలోచనలను స్పష్టంగా వ్యక్తపరుస్తారు." },
    { level: 9, name: "సరళమైన అభ్యాసకుడు",    desc: "రోజువారీ పఠనం, స్పెల్లింగ్ మరియు వ్యాకరణంలో అధిక సరళతను ప్రదర్శిస్తారు." },
    { level: 10, name: "నైపుణ్యం గల సంభాషణకర్త", desc: "సరైన వ్యాకరణం, స్వరం మరియు ఆత్మవిశ్వాసంతో మాట్లాడతారు మరియు రాస్తారు." },
    { level: 11, name: "ప్రొఫెషనల్ స్కాలర్",     desc: "వృత్తిపరమైన, విద్యా మరియు చట్టపరమైన పత్రాలను పూర్తి అవగాహనతో చదువుతారు." },
    { level: 12, name: "లిటరసీ ఛాంపియన్",      desc: "కార్యాచరణ అక్షరాస్యత, వ్యక్తీకరణ మరియు విమర్శనాత్మక ఆలోచనలో పూర్తి నైపుణ్యం." },
  ],
  Tamil: [
    { level: 1, name: "முற்றிலும் தொடக்கநிலை", desc: "எழுத்துக்களை அடையாளம் காண முடியாது." },
    { level: 2, name: "தொடக்கநிலை",           desc: "எழுத்துக்களை அடையாளம் காண்கிறார், எளிய சொற்கள் படிக்கிறார்." },
    { level: 3, name: "அடிப்படைநிலை",          desc: "சொற்கள் மற்றும் எளிய வாக்கியங்கள் படிக்கலாம்." },
    { level: 4, name: "மேல் அடிப்படைநிலை",      desc: "கூட்டு வாக்கியங்கள் மற்றும் எளிய பத்திகளை படிக்கலாம்." },
    { level: 5, name: "இடைநிலை",              desc: "குறைந்த புரிதலுடன் பத்திகள் படிக்கிறார்." },
    { level: 6, name: "மேல் இடைநிலை",          desc: "நீண்ட பத்திகளைப் படித்து, முக்கியத் தகவல்களை எளிதாகப் பெறலாம்." },
    { level: 7, name: "மேம்பட்ட அடித்தளம்",  desc: "வலுவான எழுத்தறிவு திறன்கள். தொடர்பாடல் மேம்பாடு தேவை." },
    { level: 8, name: "மேம்பட்ட நிலை",          desc: "செயல்பாட்டு நூல்கள், படிவங்கள் மற்றும் வழிமுறைகளைப் படிக்கிறார். எண்ணங்களைத் தெளிவாக வெளிப்படுத்துகிறார்." },
    { level: 9, name: "சரளமாக கற்பவர்",         desc: "தினசரி வாசிப்பு, எழுத்துப்பிழை மற்றும் இலக்கணத்தில் அதிக சரளத்தைக் காட்டுகிறார்." },
    { level: 10, name: "திறமையான தொடர்பாளர்",    desc: "சரியான இலக்கணம், தொனி மற்றும் நம்பிக்கையுடன் பேசுகிறார் மற்றும் எழுதுகிறார்." },
    { level: 11, name: "தொழில்முறை அறிஞர்",     desc: "தொழில்முறை, கல்வி மற்றும் சட்ட ஆவணங்களை முழுமையான புரிதலுடன் படிக்கிறார்." },
    { level: 12, name: "எழுத்தறிவுக் சாம்பியன்",    desc: "செயல்பாட்டு எழுத்தறிவு, வெளிப்பாடு மற்றும் விமர்சன சிந்தனையில் முழுமையான தேர்ச்சி." },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// FIXED 7-SECTION CURRICULUM (same for all learners — content from AI)
// ─────────────────────────────────────────────────────────────────────────────
export const CURRICULUM_SECTIONS = [
  {
    id: "s1", num: 1,
    title: "Letter & Sound Recognition",
    icon: "🔤",
    skillTarget: "letter_recognition",
    color: "#f59e0b",
    units: [
      { id: "s1u1", num: 1, title: "Alphabet Basics",   skill: "letter_recognition",
        lessons: Array.from({ length: 5 }, (_, i) => ({ id: `s1u1l${i+1}`, num: i+1, title: `Lesson ${i+1}`, icon: ["🔤","🅰️","📚","🎯","⭐"][i] })) },
      { id: "s1u2", num: 2, title: "Basic Sound Matches", skill: "letter_recognition",
        lessons: Array.from({ length: 5 }, (_, i) => ({ id: `s1u2l${i+1}`, num: i+1, title: `Lesson ${i+1}`, icon: ["🔊","🎵","🗣️","🎶","📢"][i] })) },
    ]
  },
  {
    id: "s2", num: 2,
    title: "Phonics & Syllables",
    icon: "🔊",
    skillTarget: "letter_recognition",
    color: "#ec4899",
    units: [
      { id: "s2u1", num: 1, title: "Phonetics", skill: "letter_recognition",
        lessons: Array.from({ length: 5 }, (_, i) => ({ id: `s2u1l${i+1}`, num: i+1, title: `Lesson ${i+1}`, icon: ["🗣️","👂","📣","🎙️","🔔"][i] })) },
      { id: "s2u2", num: 2, title: "Syllable Counting", skill: "letter_recognition",
        lessons: Array.from({ length: 5 }, (_, i) => ({ id: `s2u2l${i+1}`, num: i+1, title: `Lesson ${i+1}`, icon: ["🔢","💬","🥁","🎶","🔤"][i] })) },
    ]
  },
  {
    id: "s3", num: 3,
    title: "Word Recognition",
    icon: "📝",
    skillTarget: "word_recognition",
    color: "#3b82f6",
    units: [
      { id: "s3u1", num: 1, title: "Sight Words", skill: "word_recognition",
        lessons: Array.from({ length: 5 }, (_, i) => ({ id: `s3u1l${i+1}`, num: i+1, title: `Lesson ${i+1}`, icon: ["👁️","📖","🏷️","🔍","✨"][i] })) },
      { id: "s3u2", num: 2, title: "Word Blends", skill: "word_recognition",
        lessons: Array.from({ length: 5 }, (_, i) => ({ id: `s3u2l${i+1}`, num: i+1, title: `Lesson ${i+1}`, icon: ["🧩","🔤","🔗","✍️","🎯"][i] })) },
    ]
  },
  {
    id: "s4", num: 4,
    title: "Basic Vocabulary",
    icon: "🍎",
    skillTarget: "word_recognition",
    color: "#10b981",
    units: [
      { id: "s4u1", num: 1, title: "Nouns & Objects", skill: "word_recognition",
        lessons: Array.from({ length: 5 }, (_, i) => ({ id: `s4u1l${i+1}`, num: i+1, title: `Lesson ${i+1}`, icon: ["🏠","🍎","🌞","🚗","👕"][i] })) },
      { id: "s4u2", num: 2, title: "Action Verbs", skill: "word_recognition",
        lessons: Array.from({ length: 5 }, (_, i) => ({ id: `s4u2l${i+1}`, num: i+1, title: `Lesson ${i+1}`, icon: ["🏃","🚶","🏊","🍽️","🛌"][i] })) },
    ]
  },
  {
    id: "s5", num: 5,
    title: "Sentence Reading",
    icon: "📖",
    skillTarget: "sentence_reading",
    color: "#8b5cf6",
    units: [
      { id: "s5u1", num: 1, title: "Simple Sentences", skill: "sentence_reading",
        lessons: Array.from({ length: 5 }, (_, i) => ({ id: `s5u1l${i+1}`, num: i+1, title: `Lesson ${i+1}`, icon: ["💬","📖","📝","📋","🌟"][i] })) },
      { id: "s5u2", num: 2, title: "Compound Sentences", skill: "sentence_reading",
        lessons: Array.from({ length: 5 }, (_, i) => ({ id: `s5u2l${i+1}`, num: i+1, title: `Lesson ${i+1}`, icon: ["🔗","💬","📄","📓","🏆"][i] })) },
    ]
  },
  {
    id: "s6", num: 6,
    title: "Sentence Writing",
    icon: "✍️",
    skillTarget: "writing",
    color: "#ef4444",
    units: [
      { id: "s6u1", num: 1, title: "Basic Structure", skill: "writing",
        lessons: Array.from({ length: 5 }, (_, i) => ({ id: `s6u1l${i+1}`, num: i+1, title: `Lesson ${i+1}`, icon: ["✏️","🖊️","✍️","📝","🔏"][i] })) },
      { id: "s6u2", num: 2, title: "Punctuation Rules", skill: "writing",
        lessons: Array.from({ length: 5 }, (_, i) => ({ id: `s6u2l${i+1}`, num: i+1, title: `Lesson ${i+1}`, icon: ["❓","❗","💬","🖋️","📓"][i] })) },
    ]
  },
  {
    id: "s7", num: 7,
    title: "Daily Communication",
    icon: "💬",
    skillTarget: "pronunciation",
    color: "#06b6d4",
    units: [
      { id: "s7u1", num: 1, title: "Greetings & Polite Words", skill: "pronunciation",
        lessons: Array.from({ length: 5 }, (_, i) => ({ id: `s7u1l${i+1}`, num: i+1, title: `Lesson ${i+1}`, icon: ["👋","😊","🙏","🤝","🌟"][i] })) },
      { id: "s7u2", num: 2, title: "Asking Directions", skill: "pronunciation",
        lessons: Array.from({ length: 5 }, (_, i) => ({ id: `s7u2l${i+1}`, num: i+1, title: `Lesson ${i+1}`, icon: ["🗺️","🧭","📍","🚶","🚗"][i] })) },
    ]
  },
  {
    id: "s8", num: 8,
    title: "Reading Comprehension",
    icon: "🧠",
    skillTarget: "comprehension",
    color: "#14b8a6",
    units: [
      { id: "s8u1", num: 1, title: "Main Idea", skill: "comprehension",
        lessons: Array.from({ length: 5 }, (_, i) => ({ id: `s8u1l${i+1}`, num: i+1, title: `Lesson ${i+1}`, icon: ["💡","🧠","🔍","📄","📜"][i] })) },
      { id: "s8u2", num: 2, title: "Details Extraction", skill: "comprehension",
        lessons: Array.from({ length: 5 }, (_, i) => ({ id: `s8u2l${i+1}`, num: i+1, title: `Lesson ${i+1}`, icon: ["🔎","📋","🗂️","📊","📈"][i] })) },
    ]
  },
  {
    id: "s9", num: 9,
    title: "Expressive Writing",
    icon: "📓",
    skillTarget: "writing",
    color: "#6366f1",
    units: [
      { id: "s9u1", num: 1, title: "Personal Notes", skill: "writing",
        lessons: Array.from({ length: 5 }, (_, i) => ({ id: `s9u1l${i+1}`, num: i+1, title: `Lesson ${i+1}`, icon: ["📓","🖊️","✉️","🗒️","✏️"][i] })) },
      { id: "s9u2", num: 2, title: "Short Paragraphs", skill: "writing",
        lessons: Array.from({ length: 5 }, (_, i) => ({ id: `s9u2l${i+1}`, num: i+1, title: `Lesson ${i+1}`, icon: ["📄","📃","📓","📝","🗂️"][i] })) },
    ]
  },
  {
    id: "s10", num: 10,
    title: "Conversational Fluency",
    icon: "🗣️",
    skillTarget: "pronunciation",
    color: "#f43f5e",
    units: [
      { id: "s10u1", num: 1, title: "Social Interaction", skill: "pronunciation",
        lessons: Array.from({ length: 5 }, (_, i) => ({ id: `s10u1l${i+1}`, num: i+1, title: `Lesson ${i+1}`, icon: ["👥","💬","🤝","☕","📱"][i] })) },
      { id: "s10u2", num: 2, title: "Expression & Tone", skill: "pronunciation",
        lessons: Array.from({ length: 5 }, (_, i) => ({ id: `s10u2l${i+1}`, num: i+1, title: `Lesson ${i+1}`, icon: ["🎙️","🎭","📢","📣","🔔"][i] })) },
    ]
  },
  {
    id: "s11", num: 11,
    title: "Real-World Literacy",
    icon: "📋",
    skillTarget: "comprehension",
    color: "#f97316",
    units: [
      { id: "s11u1", num: 1, title: "Forms & Bills", skill: "comprehension",
        lessons: Array.from({ length: 5 }, (_, i) => ({ id: `s11u1l${i+1}`, num: i+1, title: `Lesson ${i+1}`, icon: ["📋","🏦","🧾","🏥","📄"][i] })) },
      { id: "s11u2", num: 2, title: "Public Signboards", skill: "sentence_reading",
        lessons: Array.from({ length: 5 }, (_, i) => ({ id: `s11u2l${i+1}`, num: i+1, title: `Lesson ${i+1}`, icon: ["🚦","🛑","⚠️","🚧","🚏"][i] })) },
    ]
  },
  {
    id: "s12", num: 12,
    title: "Digital Literacy",
    icon: "💻",
    skillTarget: "sentence_reading",
    color: "#059669",
    units: [
      { id: "s12u1", num: 1, title: "Keyboard & Typing", skill: "sentence_reading",
        lessons: Array.from({ length: 5 }, (_, i) => ({ id: `s12u1l${i+1}`, num: i+1, title: `Lesson ${i+1}`, icon: ["⌨️","💻","🖱️","📧","🌐"][i] })) },
      { id: "s12u2", num: 2, title: "Mobile & Messaging", skill: "sentence_reading",
        lessons: Array.from({ length: 5 }, (_, i) => ({ id: `s12u2l${i+1}`, num: i+1, title: `Lesson ${i+1}`, icon: ["📱","💬","🔔","👤","📩"][i] })) },
    ]
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// LEARNING PATH GENERATOR
// Maps weak skill scores → recommended section start points (per spec rules)
// ─────────────────────────────────────────────────────────────────────────────
export const generateLearningPath = (skillScores) => {
  const path = [];
  const {
    letter_recognition = 100,
    word_recognition = 100,
    sentence_reading = 100,
    writing = 100,
    comprehension = 100,
    pronunciation = 100,
  } = skillScores || {};

  // Spec rules — add sections for weak skills (< 50%)
  if (letter_recognition < 50) path.push({ sectionId: "s1", unitId: "s1u1", reason: "Letter Recognition needs improvement" });
  if (word_recognition < 50)   path.push({ sectionId: "s1", unitId: "s1u3", reason: "Word Recognition needs improvement" });
  if (sentence_reading < 50)   path.push({ sectionId: "s2", unitId: "s2u2", reason: "Sentence Reading needs improvement" });
  if (writing < 50)            path.push({ sectionId: "s3", unitId: "s3u1", reason: "Writing needs improvement" });
  if (comprehension < 50)      path.push({ sectionId: "s5", unitId: "s5u1", reason: "Comprehension needs improvement" });
  if (pronunciation < 50)      path.push({ sectionId: "s6", unitId: "s6u1", reason: "Pronunciation needs improvement" });

  // Always include vocabulary and practical literacy at the end
  path.push({ sectionId: "s4", unitId: "s4u1", reason: "Vocabulary development" });
  path.push({ sectionId: "s7", unitId: "s7u1", reason: "Practical literacy skills" });

  // Deduplicate
  const seen = new Set();
  return path.filter(p => { if (seen.has(p.sectionId)) return false; seen.add(p.sectionId); return true; });
};

// Get section display order for Learn tab (weak sections first, then rest)
export const getOrderedSections = (skillScores) => {
  const path = generateLearningPath(skillScores);
  const pathSectionIds = path.map(p => p.sectionId);
  const restSections = CURRICULUM_SECTIONS.filter(s => !pathSectionIds.includes(s.id));
  const orderedSections = [
    ...pathSectionIds.map(id => CURRICULUM_SECTIONS.find(s => s.id === id)).filter(Boolean),
    ...restSections
  ];
  return orderedSections;
};

// ─────────────────────────────────────────────────────────────────────────────
// PROFICIENCY CLASSIFICATION — from skill scores
// ─────────────────────────────────────────────────────────────────────────────
export const classifyProficiency = (skillScores) => {
  const scores = Object.values(skillScores || {}).filter(v => typeof v === "number");
  if (scores.length === 0) return 1;
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  if (avg >= 80) return 5;
  if (avg >= 60) return 4;
  if (avg >= 40) return 3;
  if (avg >= 20) return 2;
  return 1;
};

export const getProficiencyName = (level, language = "English") => {
  const levels = PROFICIENCY_LEVELS[language] || PROFICIENCY_LEVELS["English"];
  return levels.find(l => l.level === level) || levels[0];
};

export const getWeakSkills = (skillScores, threshold = 50) => {
  return Object.entries(skillScores || {})
    .filter(([_, v]) => typeof v === "number" && v < threshold)
    .map(([k]) => SKILL_CATEGORIES[k]?.label || k);
};

export const getStrongSkills = (skillScores, threshold = 50) => {
  return Object.entries(skillScores || {})
    .filter(([_, v]) => typeof v === "number" && v >= threshold)
    .map(([k]) => SKILL_CATEGORIES[k]?.label || k);
};

// ─────────────────────────────────────────────────────────────────────────────
// ASSESSMENT ENGINE — skill-tagged question selection + per-skill scoring
// ─────────────────────────────────────────────────────────────────────────────

// Determine age group for question selection
const getAgeGroup = (ageNum) => {
  if (ageNum <= 12) return "child";
  if (ageNum <= 18) return "teen";
  if (ageNum <= 59) return "adult";
  return "senior";
};

// Map education level → approximate literacy level (1–5)
const getLevel = (educationLevel, ageNum) => {
  const eduStr = (educationLevel || "").toLowerCase();
  if (eduStr.includes("no formal")) return 1;
  if (eduStr.includes("primary")) return 2;
  if (eduStr.includes("middle")) return 3;
  if (eduStr.includes("secondary")) return 4;
  return 2; // Default fallback to Beginner questions
};

// Map question ID prefix to skill category
const inferSkillFromQuestion = (question, questionIdx, totalQuestions) => {
  const id = question?.id || "";
  // Level 1 questions → letter recognition
  if (id.includes("_l1_")) return "letter_recognition";
  // Level 2 → word recognition
  if (id.includes("_l2_")) return "word_recognition";
  // Level 3-4 → sentence reading / comprehension  
  if (id.includes("_l3_")) return "sentence_reading";
  if (id.includes("_l4_")) return "comprehension";
  if (id.includes("_l5_")) return "comprehension";

  // Fallback: distribute skills across 10 MCQs
  const skills = ["letter_recognition", "word_recognition", "sentence_reading", "comprehension", "comprehension",
                  "word_recognition", "sentence_reading", "comprehension", "letter_recognition", "word_recognition"];
  return skills[questionIdx % skills.length] || "comprehension";
};

// Main assessment generator — returns 12 questions (10 MCQ + 1 reading + 1 writing)
export const getRandomAssessment = (age, educationLevel, language = "English") => {
  const ageNum = parseInt(age, 10) || 20;
  const ageGroup = getAgeGroup(ageNum);
  const level = getLevel(educationLevel, ageNum);
  const key = `${ageGroup}_level_${level}`;

  // Comprehension MCQ Pool
  const compPool =
    assessmentQuestions[key] ||
    assessmentQuestions[`${ageGroup}_level_1`] ||
    assessmentQuestions["child_level_1"];

  const rawQuestions = compPool?.questions || [];

  // Sample up to 10 questions
  const shuffled = [...rawQuestions].sort(() => 0.5 - Math.random());
  const sampled = [];
  for (let i = 0; i < 10; i++) {
    sampled.push(shuffled[i % shuffled.length]);
  }

  const comprehensionQuestions = sampled.map((q, idx) => {
    const rawOptionsEnglish = Array.isArray(q.options) ? q.options : ((q.options && q.options["English"]) || []);
    const correctIdx = typeof q.correctIndex === "number" ? q.correctIndex : 0;
    const indices = rawOptionsEnglish.map((_, i) => i);
    const shuffledIndices = [...indices].sort(() => 0.5 - Math.random());
    const newCorrectIndex = shuffledIndices.indexOf(correctIdx);
    const skill = inferSkillFromQuestion(q, idx, sampled.length);

    return {
      id: q.id,
      type: "comprehension",
      skill,
      rawQuestion: q,
      shuffledIndices,
      correctIndex: newCorrectIndex,
    };
  });

  // Reading + Writing from assessmentReadingWriting (3 of each)
  const rwPool =
    assessmentReadingWriting[key] ||
    assessmentReadingWriting[`${ageGroup}_level_1`] ||
    assessmentReadingWriting["adult_level_1"];

  const readings = Array.isArray(rwPool?.readings) ? rwPool.readings : [];
  const writings = Array.isArray(rwPool?.writings) ? rwPool.writings : [];

  const readingQuestions = readings.slice(0, 3).map((text, i) => ({
    id: `${key}_reading_${i + 1}`,
    type: "reading",
    skill: "pronunciation",
    rawQuestion: { reading: text },
  }));

  const writingQuestions = writings.slice(0, 3).map((w, i) => {
    const dictation = (w?.dictation || "").trim();
    return {
      id: `${key}_writing_${i + 1}`,
      type: "writing",
      skill: "writing",
      rawQuestion: { writing: w?.prompt || "Listen to the sentence and write exactly what you hear (in English).", dictation },
      evaluator: (text) => {
        const targetWords = dictation.toLowerCase().split(/\s+/).filter(Boolean);
        const userWords = text.trim().toLowerCase().split(/\s+/).filter(Boolean);
        if (userWords.length === 0) return { score: 0, feedback: "Please write the sentence you heard." };
        if (targetWords.length === 0) return { score: 5, feedback: "Thanks for writing!" };
        const userSet = new Set(userWords);
        const matched = targetWords.filter(word => userSet.has(word)).length;
        const ratio = matched / targetWords.length;
        if (ratio >= 0.8) return { score: 10, feedback: "Excellent! You wrote the sentence accurately." };
        if (ratio >= 0.5) return { score: 7, feedback: "Good, but some words are missing or incorrect." };
        if (ratio >= 0.25) return { score: 4, feedback: "You caught some words. Listen again and try more." };
        return { score: 2, feedback: "Try to write what you hear more carefully." };
      },
    };
  });

  return {
    tier: key,
    questions: [...comprehensionQuestions, ...readingQuestions, ...writingQuestions],
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// SKILL SCORING ENGINE — computes per-skill percentages from assessment results
// ─────────────────────────────────────────────────────────────────────────────
export const computeSkillScores = (questions, selectedAnswers, readingAttempts, writingAnswers) => {
  const skillBuckets = {};
  Object.keys(SKILL_CATEGORIES).forEach(s => {
    skillBuckets[s] = { correct: 0, total: 0 };
  });

  questions.forEach((q, idx) => {
    const skill = q.skill || "comprehension";
    if (!skillBuckets[skill]) skillBuckets[skill] = { correct: 0, total: 0 };

    if (q.type === "comprehension") {
      const isCorrect = selectedAnswers[idx] === q.correctIndex ? 1 : 0;
      skillBuckets["comprehension"].total += 1;
      skillBuckets["comprehension"].correct += isCorrect;
      if (skill === "letter_recognition" || skill === "word_recognition") {
        skillBuckets[skill].total += 1;
        skillBuckets[skill].correct += isCorrect;
      }

    } else if (q.type === "reading") {
      const attempt = readingAttempts[idx];
      const ratio = (attempt && attempt.totalWords > 0) ? attempt.matchedCount / attempt.totalWords : 0;
      skillBuckets["pronunciation"].total += 1;
      skillBuckets["pronunciation"].correct += ratio;
      skillBuckets["sentence_reading"].total += 1;
      skillBuckets["sentence_reading"].correct += ratio;

    } else if (q.type === "writing") {
      const text = writingAnswers[idx] || "";
      const result = q.evaluator ? q.evaluator(text) : { score: 0 };
      skillBuckets["writing"].total += 1;
      skillBuckets["writing"].correct += result.score / 10;
    }
  });

  // Convert to percentages
  const scores = {};
  Object.entries(skillBuckets).forEach(([skill, { correct, total }]) => {
    scores[skill] = total > 0 ? Math.round((correct / total) * 100) : null;
  });

  // Fill any null skills with smart defaults based on other scores
  const nonNullScores = Object.values(scores).filter(v => v !== null);
  const avgNonNull = nonNullScores.length > 0
    ? Math.round(nonNullScores.reduce((a, b) => a + b, 0) / nonNullScores.length)
    : 50;

  // Skills not directly assessed get estimated from adjacent skills
  if (scores.letter_recognition === null) {
    scores.letter_recognition = scores.word_recognition !== null ? Math.round(scores.word_recognition * 1.1) : avgNonNull;
  }
  if (scores.word_recognition === null) scores.word_recognition = avgNonNull;
  if (scores.sentence_reading === null) scores.sentence_reading = scores.comprehension !== null ? Math.round(scores.comprehension * 0.9) : avgNonNull;

  // Clamp all to 0-100
  Object.keys(scores).forEach(k => {
    if (scores[k] !== null) scores[k] = Math.max(0, Math.min(100, scores[k]));
  });

  return scores;
};

// ─────────────────────────────────────────────────────────────────────────────
// LEGACY EXPORTS (kept for compatibility)
// ─────────────────────────────────────────────────────────────────────────────
export const levelDefinitions = PROFICIENCY_LEVELS;

export const lessonsData = (() => {
  const data = {};
  for (let i = 1; i <= 12; i++) {
    data[i] = CURRICULUM_SECTIONS.map(s => ({
      id: s.id,
      title: s.title,
      units: s.units.map(u => ({
        id: u.id,
        title: u.title,
        lessons: u.lessons
      }))
    }));
  }
  return data;
})();

export const initialAssessmentPool = {};
