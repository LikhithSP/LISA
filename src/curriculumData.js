// LISA — Curriculum Data + Assessment Engine
// Fixed 7-section curriculum per spec. Lesson content generated dynamically via Gemini AI.

import { assessmentQuestions } from "./assessmentQuestionsData.js";
import { assessmentReadingWriting } from "./assessmentReadingWritingData.js";

// ─────────────────────────────────────────────────────────────────────────────
// SKILL CATEGORY DEFINITIONS
// ─────────────────────────────────────────────────────────────────────────────
export const SKILL_CATEGORIES = {
  letter_recognition: { label: "Letter Recognition", icon: "LR", color: "#f59e0b" },
  word_recognition: { label: "Word Recognition", icon: "WR", color: "#3b82f6" },
  vocabulary_recognition: { label: "Vocabulary Recognition", icon: "VR", color: "#14b8a6" },
  sentence_understanding: { label: "Sentence Understanding", icon: "SU", color: "#10b981" },
  reading_comprehension: { label: "Reading Comprehension", icon: "RC", color: "#8b5cf6" },
  practical_literacy: { label: "Practical Literacy", icon: "PL", color: "#f97316" },
  reading_ability: { label: "Reading Ability", icon: "RA", color: "#06b6d4" },
  writing_ability: { label: "Writing Ability", icon: "WA", color: "#ef4444" },
};

// Maps each skill key to its i18n translation key (see translations in App.jsx)
export const SKILL_TRANSLATION_KEYS = {
  letter_recognition: "skillLetterRecognition",
  word_recognition: "skillWordRecognition",
  vocabulary_recognition: "skillVocabularyRecognition",
  sentence_understanding: "skillSentenceUnderstanding",
  reading_comprehension: "skillReadingComprehension",
  practical_literacy: "skillPracticalLiteracy",
  reading_ability: "skillReadingAbility",
  writing_ability: "skillWritingAbility",
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
    title: "Letter Recognition",
    icon: "🔤",
    skillTarget: "letter_recognition",
    color: "#f59e0b",
    units: [
      {
        id: "s1u1", num: 1, title: "Alphabet Basics", skill: "letter_recognition",
        lessons: [
          { id: "s1u1l1", num: 1, title: "Identifying Letters", icon: "🔤" },
          { id: "s1u1l2", num: 2, title: "Matching Letters", icon: "🅰️" },
          { id: "s1u1l3", num: 3, title: "Letter Sequencing", icon: "📚" },
          { id: "s1u1l4", num: 4, title: "Finding Missing Letters", icon: "🎯" },
          { id: "s1u1l5", num: 5, title: "Unit Assessment", icon: "⭐" }
        ]
      },
      {
        id: "s1u2", num: 2, title: "Uppercase & Lowercase", skill: "letter_recognition",
        lessons: [
          { id: "s1u2l1", num: 1, title: "Uppercase Letters", icon: "🔠" },
          { id: "s1u2l2", num: 2, title: "Lowercase Letters", icon: "🔡" },
          { id: "s1u2l3", num: 3, title: "Matching Cases", icon: "🧩" },
          { id: "s1u2l4", num: 4, title: "Mixed Letter Practice", icon: "🎯" },
          { id: "s1u2l5", num: 5, title: "Unit Assessment", icon: "⭐" }
        ]
      },
      {
        id: "s1u3", num: 3, title: "Letter Sounds", skill: "letter_recognition",
        lessons: [
          { id: "s1u3l1", num: 1, title: "Vowel Sounds", icon: "🔊" },
          { id: "s1u3l2", num: 2, title: "Consonant Sounds", icon: "🗣️" },
          { id: "s1u3l3", num: 3, title: "Beginning Sounds", icon: "🎵" },
          { id: "s1u3l4", num: 4, title: "Ending Sounds", icon: "🎶" },
          { id: "s1u3l5", num: 5, title: "Unit Assessment", icon: "⭐" }
        ]
      }
    ]
  },
  {
    id: "s2", num: 2,
    title: "Word Building",
    icon: "🧱",
    skillTarget: "word_recognition",
    color: "#3b82f6",
    units: [
      {
        id: "s2u1", num: 1, title: "Simple Words", skill: "word_recognition",
        lessons: [
          { id: "s2u1l1", num: 1, title: "Two-Letter Words", icon: "✌️" },
          { id: "s2u1l2", num: 2, title: "Three-Letter Words", icon: "🤟" },
          { id: "s2u1l3", num: 3, title: "Four-Letter Words", icon: "🍀" },
          { id: "s2u1l4", num: 4, title: "Common Words", icon: "✨" },
          { id: "s2u1l5", num: 5, title: "Unit Assessment", icon: "⭐" }
        ]
      },
      {
        id: "s2u2", num: 2, title: "Forming Words", skill: "word_recognition",
        lessons: [
          { id: "s2u2l1", num: 1, title: "Combining Letters", icon: "➕" },
          { id: "s2u2l2", num: 2, title: "Rearranging Letters", icon: "🔄" },
          { id: "s2u2l3", num: 3, title: "Missing Letters", icon: "🔍" },
          { id: "s2u2l4", num: 4, title: "Complete the Word", icon: "✅" },
          { id: "s2u2l5", num: 5, title: "Unit Assessment", icon: "⭐" }
        ]
      },
      {
        id: "s2u3", num: 3, title: "Everyday Vocabulary", skill: "word_recognition",
        lessons: [
          { id: "s2u3l1", num: 1, title: "Family Words", icon: "👨‍👩‍👧‍👦" },
          { id: "s2u3l2", num: 2, title: "Food Words", icon: "🍎" },
          { id: "s2u3l3", num: 3, title: "Object Names", icon: "📦" },
          { id: "s2u3l4", num: 4, title: "Place Names", icon: "📍" },
          { id: "s2u3l5", num: 5, title: "Unit Assessment", icon: "⭐" }
        ]
      }
    ]
  },
  {
    id: "s3", num: 3,
    title: "Vocabulary Development",
    icon: "📚",
    skillTarget: "word_recognition",
    color: "#10b981",
    units: [
      {
        id: "s3u1", num: 1, title: "Home & Family", skill: "word_recognition",
        lessons: [
          { id: "s3u1l1", num: 1, title: "Family Members", icon: "🏠" },
          { id: "s3u1l2", num: 2, title: "Household Objects", icon: "🛋️" },
          { id: "s3u1l3", num: 3, title: "Daily Activities", icon: "📅" },
          { id: "s3u1l4", num: 4, title: "Rooms & Spaces", icon: "🚪" },
          { id: "s3u1l5", num: 5, title: "Unit Assessment", icon: "⭐" }
        ]
      },
      {
        id: "s3u2", num: 2, title: "School & Learning", skill: "word_recognition",
        lessons: [
          { id: "s3u2l1", num: 1, title: "School Objects", icon: "🎒" },
          { id: "s3u2l2", num: 2, title: "Classroom Vocabulary", icon: "🏫" },
          { id: "s3u2l3", num: 3, title: "Learning Activities", icon: "📝" },
          { id: "s3u2l4", num: 4, title: "Educational Terms", icon: "🎓" },
          { id: "s3u2l5", num: 5, title: "Unit Assessment", icon: "⭐" }
        ]
      },
      {
        id: "s3u3", num: 3, title: "Community & Environment", skill: "word_recognition",
        lessons: [
          { id: "s3u3l1", num: 1, title: "Community Helpers", icon: "🧑‍🚒" },
          { id: "s3u3l2", num: 2, title: "Transportation", icon: "🚌" },
          { id: "s3u3l3", num: 3, title: "Nature & Environment", icon: "🌳" },
          { id: "s3u3l4", num: 4, title: "Public Places", icon: "🏢" },
          { id: "s3u3l5", num: 5, title: "Unit Assessment", icon: "⭐" }
        ]
      }
    ]
  },
  {
    id: "s4", num: 4,
    title: "Reading Words",
    icon: "📖",
    skillTarget: "word_recognition",
    color: "#6366f1",
    units: [
      {
        id: "s4u1", num: 1, title: "Common Words", skill: "word_recognition",
        lessons: [
          { id: "s4u1l1", num: 1, title: "Sight Words", icon: "👁️" },
          { id: "s4u1l2", num: 2, title: "Action Words", icon: "🏃" },
          { id: "s4u1l3", num: 3, title: "Describing Words", icon: "🎨" },
          { id: "s4u1l4", num: 4, title: "Everyday Words", icon: "☕" },
          { id: "s4u1l5", num: 5, title: "Unit Assessment", icon: "⭐" }
        ]
      },
      {
        id: "s4u2", num: 2, title: "Understanding Meaning", skill: "word_recognition",
        lessons: [
          { id: "s4u2l1", num: 1, title: "Word Matching", icon: "🧩" },
          { id: "s4u2l2", num: 2, title: "Picture Matching", icon: "🖼️" },
          { id: "s4u2l3", num: 3, title: "Similar Meanings", icon: "👯" },
          { id: "s4u2l4", num: 4, title: "Opposite Meanings", icon: "🌗" },
          { id: "s4u2l5", num: 5, title: "Unit Assessment", icon: "⭐" }
        ]
      },
      {
        id: "s4u3", num: 3, title: "Functional Vocabulary", skill: "word_recognition",
        lessons: [
          { id: "s4u3l1", num: 1, title: "Signs", icon: "🪧" },
          { id: "s4u3l2", num: 2, title: "Labels", icon: "🏷️" },
          { id: "s4u3l3", num: 3, title: "Warnings", icon: "⚠️" },
          { id: "s4u3l4", num: 4, title: "Instructions", icon: "📋" },
          { id: "s4u3l5", num: 5, title: "Unit Assessment", icon: "⭐" }
        ]
      }
    ]
  },
  {
    id: "s5", num: 5,
    title: "Reading Sentences",
    icon: "📖",
    skillTarget: "sentence_understanding",
    color: "#8b5cf6",
    units: [
      {
        id: "s5u1", num: 1, title: "Simple Sentences", skill: "sentence_understanding",
        lessons: [
          { id: "s5u1l1", num: 1, title: "Subject & Action", icon: "👤" },
          { id: "s5u1l2", num: 2, title: "Reading Statements", icon: "📄" },
          { id: "s5u1l3", num: 3, title: "Everyday Sentences", icon: "💬" },
          { id: "s5u1l4", num: 4, title: "Understanding Meaning", icon: "🧠" },
          { id: "s5u1l5", num: 5, title: "Unit Assessment", icon: "⭐" }
        ]
      },
      {
        id: "s5u2", num: 2, title: "Questions & Answers", skill: "sentence_understanding",
        lessons: [
          { id: "s5u2l1", num: 1, title: "Reading Questions", icon: "❓" },
          { id: "s5u2l2", num: 2, title: "Finding Answers", icon: "💡" },
          { id: "s5u2l3", num: 3, title: "Yes/No Questions", icon: "✔️" },
          { id: "s5u2l4", num: 4, title: "WH Questions", icon: "🗣️" },
          { id: "s5u2l5", num: 5, title: "Unit Assessment", icon: "⭐" }
        ]
      },
      {
        id: "s5u3", num: 3, title: "Daily Communication", skill: "sentence_understanding",
        lessons: [
          { id: "s5u3l1", num: 1, title: "Greetings", icon: "👋" },
          { id: "s5u3l2", num: 2, title: "Requests", icon: "🙏" },
          { id: "s5u3l3", num: 3, title: "Directions", icon: "🧭" },
          { id: "s5u3l4", num: 4, title: "Conversations", icon: "💬" },
          { id: "s5u3l5", num: 5, title: "Unit Assessment", icon: "⭐" }
        ]
      }
    ]
  },
  {
    id: "s6", num: 6,
    title: "Reading Comprehension",
    icon: "🧠",
    skillTarget: "reading_comprehension",
    color: "#14b8a6",
    units: [
      {
        id: "s6u1", num: 1, title: "Short Paragraphs", skill: "reading_comprehension",
        lessons: [
          { id: "s6u1l1", num: 1, title: "Reading Short Texts", icon: "📄" },
          { id: "s6u1l2", num: 2, title: "Finding Main Ideas", icon: "💡" },
          { id: "s6u1l3", num: 3, title: "Key Details", icon: "🔍" },
          { id: "s6u1l4", num: 4, title: "Sequencing Events", icon: "🔢" },
          { id: "s6u1l5", num: 5, title: "Unit Assessment", icon: "⭐" }
        ]
      },
      {
        id: "s6u2", num: 2, title: "Stories", skill: "reading_comprehension",
        lessons: [
          { id: "s6u2l1", num: 1, title: "Characters", icon: "👥" },
          { id: "s6u2l2", num: 2, title: "Events", icon: "🎭" },
          { id: "s6u2l3", num: 3, title: "Problems & Solutions", icon: "🛠️" },
          { id: "s6u2l4", num: 4, title: "Story Understanding", icon: "📖" },
          { id: "s6u2l5", num: 5, title: "Unit Assessment", icon: "⭐" }
        ]
      },
      {
        id: "s6u3", num: 3, title: "Information Reading", skill: "reading_comprehension",
        lessons: [
          { id: "s6u3l1", num: 1, title: "Notices", icon: "📢" },
          { id: "s6u3l2", num: 2, title: "Announcements", icon: "📣" },
          { id: "s6u3l3", num: 3, title: "Instructions", icon: "📋" },
          { id: "s6u3l4", num: 4, title: "Information Extraction", icon: "📥" },
          { id: "s6u3l5", num: 5, title: "Unit Assessment", icon: "⭐" }
        ]
      }
    ]
  },
  {
    id: "s7", num: 7,
    title: "Writing Fundamentals",
    icon: "✍️",
    skillTarget: "writing",
    color: "#ef4444",
    units: [
      {
        id: "s7u1", num: 1, title: "Writing Letters", skill: "writing_ability",
        lessons: [
          { id: "s7u1l1", num: 1, title: "Letter Formation", icon: "✏️" },
          { id: "s7u1l2", num: 2, title: "Tracing Letters", icon: "🖊️" },
          { id: "s7u1l3", num: 3, title: "Copying Letters", icon: "📝" },
          { id: "s7u1l4", num: 4, title: "Independent Writing", icon: "✍️" },
          { id: "s7u1l5", num: 5, title: "Unit Assessment", icon: "⭐" }
        ]
      },
      {
        id: "s7u2", num: 2, title: "Writing Words", skill: "writing_ability",
        lessons: [
          { id: "s7u2l1", num: 1, title: "Copy Words", icon: "🖋️" },
          { id: "s7u2l2", num: 2, title: "Complete Words", icon: "🧩" },
          { id: "s7u2l3", num: 3, title: "Dictation Practice", icon: "🎙️" },
          { id: "s7u2l4", num: 4, title: "Everyday Vocabulary", icon: "📓" },
          { id: "s7u2l5", num: 5, title: "Unit Assessment", icon: "⭐" }
        ]
      },
      {
        id: "s7u3", num: 3, title: "Writing Sentences", skill: "writing_ability",
        lessons: [
          { id: "s7u3l1", num: 1, title: "Simple Sentences", icon: "💬" },
          { id: "s7u3l2", num: 2, title: "Sentence Completion", icon: "📝" },
          { id: "s7u3l3", num: 3, title: "Sentence Creation", icon: "💡" },
          { id: "s7u3l4", num: 4, title: "Daily Writing", icon: "📅" },
          { id: "s7u3l5", num: 5, title: "Unit Assessment", icon: "⭐" }
        ]
      }
    ]
  },
  {
    id: "s8", num: 8,
    title: "Grammar Foundations",
    icon: "🏛️",
    skillTarget: "sentence_understanding",
    color: "#ec4899",
    units: [
      {
        id: "s8u1", num: 1, title: "Nouns", skill: "sentence_understanding",
        lessons: [
          { id: "s8u1l1", num: 1, title: "People", icon: "🧑" },
          { id: "s8u1l2", num: 2, title: "Places", icon: "🏢" },
          { id: "s8u1l3", num: 3, title: "Objects", icon: "📦" },
          { id: "s8u1l4", num: 4, title: "Naming Words Practice", icon: "✍️" },
          { id: "s8u1l5", num: 5, title: "Unit Assessment", icon: "⭐" }
        ]
      },
      {
        id: "s8u2", num: 2, title: "Verbs", skill: "sentence_understanding",
        lessons: [
          { id: "s8u2l1", num: 1, title: "Action Words", icon: "🏃" },
          { id: "s8u2l2", num: 2, title: "Daily Actions", icon: "📅" },
          { id: "s8u2l3", num: 3, title: "Verb Usage", icon: "📝" },
          { id: "s8u2l4", num: 4, title: "Sentence Practice", icon: "🗣️" },
          { id: "s8u2l5", num: 5, title: "Unit Assessment", icon: "⭐" }
        ]
      },
      {
        id: "s8u3", num: 3, title: "Sentence Structure", skill: "sentence_understanding",
        lessons: [
          { id: "s8u3l1", num: 1, title: "Subject", icon: "👤" },
          { id: "s8u3l2", num: 2, title: "Verb", icon: "⚡" },
          { id: "s8u3l3", num: 3, title: "Complete Sentences", icon: "✅" },
          { id: "s8u3l4", num: 4, title: "Sentence Correction", icon: "🛠️" },
          { id: "s8u3l5", num: 5, title: "Unit Assessment", icon: "⭐" }
        ]
      }
    ]
  },
  {
    id: "s9", num: 9,
    title: "Listening & Pronunciation",
    icon: "🎤",
    skillTarget: "reading_ability",
    color: "#06b6d4",
    units: [
      {
        id: "s9u1", num: 1, title: "Listening Skills", skill: "reading_ability",
        lessons: [
          { id: "s9u1l1", num: 1, title: "Listening to Words", icon: "👂" },
          { id: "s9u1l2", num: 2, title: "Identifying Sounds", icon: "🔔" },
          { id: "s9u1l3", num: 3, title: "Following Instructions", icon: "📋" },
          { id: "s9u1l4", num: 4, title: "Listening Comprehension", icon: "🧠" },
          { id: "s9u1l5", num: 5, title: "Unit Assessment", icon: "⭐" }
        ]
      },
      {
        id: "s9u2", num: 2, title: "Word Pronunciation", skill: "reading_ability",
        lessons: [
          { id: "s9u2l1", num: 1, title: "Pronouncing Letters", icon: "🗣️" },
          { id: "s9u2l2", num: 2, title: "Pronouncing Words", icon: "🗣️" },
          { id: "s9u2l3", num: 3, title: "Difficult Sounds", icon: "📢" },
          { id: "s9u2l4", num: 4, title: "Common Vocabulary", icon: "💬" },
          { id: "s9u2l5", num: 5, title: "Unit Assessment", icon: "⭐" }
        ]
      },
      {
        id: "s9u3", num: 3, title: "Sentence Pronunciation", skill: "reading_ability",
        lessons: [
          { id: "s9u3l1", num: 1, title: "Speaking Sentences", icon: "🎙️" },
          { id: "s9u3l2", num: 2, title: "Stress & Rhythm", icon: "🥁" },
          { id: "s9u3l3", num: 3, title: "Everyday Communication", icon: "💬" },
          { id: "s9u3l4", num: 4, title: "Speaking Practice", icon: "🗣️" },
          { id: "s9u3l5", num: 5, title: "Unit Assessment", icon: "⭐" }
        ]
      }
    ]
  },
  {
    id: "s10", num: 10,
    title: "Greetings & Introductions",
    icon: "👋",
    skillTarget: "reading_ability",
    color: "#f43f5e",
    units: [
      {
        id: "s10u1", num: 1, title: "Greetings & Introductions", skill: "reading_ability",
        lessons: [
          { id: "s10u1l1", num: 1, title: "Greetings", icon: "👋" },
          { id: "s10u1l2", num: 2, title: "Introducing Yourself", icon: "👤" },
          { id: "s10u1l3", num: 3, title: "Introducing Others", icon: "👥" },
          { id: "s10u1l4", num: 4, title: "Basic Conversations", icon: "💬" },
          { id: "s10u1l5", num: 5, title: "Unit Assessment", icon: "⭐" }
        ]
      },
      {
        id: "s10u2", num: 2, title: "Everyday Communication", skill: "reading_ability",
        lessons: [
          { id: "s10u2l1", num: 1, title: "Asking Questions", icon: "❓" },
          { id: "s10u2l2", num: 2, title: "Giving Answers", icon: "💡" },
          { id: "s10u2l3", num: 3, title: "Seeking Help", icon: "🆘" },
          { id: "s10u2l4", num: 4, title: "Expressing Needs", icon: "🙋" },
          { id: "s10u2l5", num: 5, title: "Unit Assessment", icon: "⭐" }
        ]
      },
      {
        id: "s10u3", num: 3, title: "Social Communication", skill: "reading_ability",
        lessons: [
          { id: "s10u3l1", num: 1, title: "Polite Expressions", icon: "😊" },
          { id: "s10u3l2", num: 2, title: "Thank You & Apologies", icon: "🙏" },
          { id: "s10u3l3", num: 3, title: "Requests & Responses", icon: "💬" },
          { id: "s10u3l4", num: 4, title: "Simple Discussions", icon: "🗣️" },
          { id: "s10u3l5", num: 5, title: "Unit Assessment", icon: "⭐" }
        ]
      }
    ]
  },
  {
    id: "s11", num: 11,
    title: "Practical Literacy",
    icon: "📋",
    skillTarget: "reading_comprehension",
    color: "#f97316",
    units: [
      {
        id: "s11u1", num: 1, title: "Signs & Symbols", skill: "reading_comprehension",
        lessons: [
          { id: "s11u1l1", num: 1, title: "Road Signs", icon: "🛑" },
          { id: "s11u1l2", num: 2, title: "Safety Signs", icon: "⚠️" },
          { id: "s11u1l3", num: 3, title: "Public Signs", icon: "🪧" },
          { id: "s11u1l4", num: 4, title: "Symbol Recognition", icon: "🔍" },
          { id: "s11u1l5", num: 5, title: "Unit Assessment", icon: "⭐" }
        ]
      },
      {
        id: "s11u2", num: 2, title: "Forms & Documents", skill: "reading_comprehension",
        lessons: [
          { id: "s11u2l1", num: 1, title: "Personal Information", icon: "📝" },
          { id: "s11u2l2", num: 2, title: "Registration Forms", icon: "📋" },
          { id: "s11u2l3", num: 3, title: "Application Forms", icon: "📄" },
          { id: "s11u2l4", num: 4, title: "Reading Documents", icon: "📖" },
          { id: "s11u2l5", num: 5, title: "Unit Assessment", icon: "⭐" }
        ]
      },
      {
        id: "s11u3", num: 3, title: "Instructions & Notices", skill: "reading_comprehension",
        lessons: [
          { id: "s11u3l1", num: 1, title: "Product Labels", icon: "🏷️" },
          { id: "s11u3l2", num: 2, title: "Medicine Labels", icon: "💊" },
          { id: "s11u3l3", num: 3, title: "Public Notices", icon: "📢" },
          { id: "s11u3l4", num: 4, title: "Safety Instructions", icon: "🛡️" },
          { id: "s11u3l5", num: 5, title: "Unit Assessment", icon: "⭐" }
        ]
      }
    ]
  },
  {
    id: "s12", num: 12,
    title: "Real-Life Application",
    icon: "💼",
    skillTarget: "reading_comprehension",
    color: "#059669",
    units: [
      {
        id: "s12u1", num: 1, title: "Money & Banking", skill: "reading_comprehension",
        lessons: [
          { id: "s12u1l1", num: 1, title: "Currency Recognition", icon: "💵" },
          { id: "s12u1l2", num: 2, title: "Prices & Bills", icon: "🧾" },
          { id: "s12u1l3", num: 3, title: "Banking Basics", icon: "🏦" },
          { id: "s12u1l4", num: 4, title: "Digital Payments", icon: "📱" },
          { id: "s12u1l5", num: 5, title: "Unit Assessment", icon: "⭐" }
        ]
      },
      {
        id: "s12u2", num: 2, title: "Health & Safety", skill: "reading_comprehension",
        lessons: [
          { id: "s12u2l1", num: 1, title: "Hospital Information", icon: "🏥" },
          { id: "s12u2l2", num: 2, title: "Health Instructions", icon: "🩺" },
          { id: "s12u2l3", num: 3, title: "Emergency Contacts", icon: "🚨" },
          { id: "s12u2l4", num: 4, title: "Safety Messages", icon: "🛡️" },
          { id: "s12u2l5", num: 5, title: "Unit Assessment", icon: "⭐" }
        ]
      },
      {
        id: "s12u3", num: 3, title: "Travel & Public Services", skill: "reading_comprehension",
        lessons: [
          { id: "s12u3l1", num: 1, title: "Bus & Train Information", icon: "🚌" },
          { id: "s12u3l2", num: 2, title: "Tickets & Schedules", icon: "🎟️" },
          { id: "s12u3l3", num: 3, title: "Government Services", icon: "🏛️" },
          { id: "s12u3l4", num: 4, title: "Community Services", icon: "🤝" },
          { id: "s12u3l5", num: 5, title: "Unit Assessment", icon: "⭐" }
        ]
      }
    ]
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// LEARNING PATH GENERATOR
// Maps weak skill scores → recommended section start points (per spec rules)
// ─────────────────────────────────────────────────────────────────────────────
export const generateLearningPath = (skillScores) => {
  const path = [];
  const scores = skillScores || {};
  const add = (skill, sectionId, unitId, lessonId, reason) => {
    if ((scores[skill] ?? 100) < 50) path.push({ skill, sectionId, unitId, lessonId, reason });
  };

  add("letter_recognition", "s1", "s1u1", "s1u1l1", "Letter Recognition needs improvement");
  add("word_recognition", "s2", "s2u1", "s2u1l1", "Word Recognition needs improvement");
  add("vocabulary_recognition", "s3", "s3u1", "s3u1l1", "Vocabulary Recognition needs improvement");
  add("sentence_understanding", "s5", "s5u1", "s5u1l1", "Sentence Understanding needs improvement");
  add("reading_comprehension", "s6", "s6u1", "s6u1l1", "Reading Comprehension needs improvement");
  add("writing_ability", "s7", "s7u1", "s7u1l1", "Writing Ability needs improvement");
  add("reading_ability", "s9", "s9u1", "s9u1l1", "Reading Ability needs improvement");
  add("practical_literacy", "s11", "s11u1", "s11u1l1", "Practical Literacy needs improvement");

  if (path.length === 0) {
    path.push({ skill: "vocabulary_recognition", sectionId: "s3", unitId: "s3u1", lessonId: "s3u1l1", reason: "Vocabulary enrichment" });
    path.push({ skill: "practical_literacy", sectionId: "s11", unitId: "s11u1", lessonId: "s11u1l1", reason: "Practical literacy extension" });
  }

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
  if (avg >= 95) return 12;
  if (avg >= 88) return 11;
  if (avg >= 82) return 10;
  if (avg >= 76) return 9;
  if (avg >= 70) return 8;
  if (avg >= 64) return 7;
  if (avg >= 58) return 6;
  if (avg >= 50) return 5;
  if (avg >= 40) return 4;
  if (avg >= 30) return 3;
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
  if (Array.isArray(question?.skills) && question.skills.length > 0) return question.skills[0];
  if (question?.skill) return question.skill;

  const id = question?.id || "";
  const text = String(question?.question || "").toLowerCase();
  if (id.includes("_l1_")) return "letter_recognition";
  if (id.includes("_l2_")) return "word_recognition";
  if (id.includes("_l3_")) return "vocabulary_recognition";
  if (text.includes("sign") || text.includes("notice") || text.includes("timetable") || text.includes("instruction") || text.includes("danger") || text.includes("exit")) {
    return "practical_literacy";
  }
  if (id.includes("_l4_")) return "sentence_understanding";
  if (id.includes("_l5_")) return "reading_comprehension";

  const skills = [
    "letter_recognition",
    "word_recognition",
    "vocabulary_recognition",
    "sentence_understanding",
    "reading_comprehension",
    "practical_literacy",
  ];
  return skills[questionIdx % skills.length] || "reading_comprehension";
};

// Main assessment generator — returns 12 questions (10 MCQ + 1 reading + 1 writing)
export const getRandomAssessment = (age, educationLevel, language = "English") => {
  const ageNum = parseInt(age, 10) || 20;
  const ageGroup = getAgeGroup(ageNum);
  const level = getLevel(educationLevel, ageNum);
  const key = `${ageGroup}_level_${level}`;

  // Comprehension MCQ Pool — sample 2 random questions from EACH of the 5 levels
  // of the user's age group to increase difficulty spread across the assessment.
  const levelQuestions = [];
  for (let lvl = 1; lvl <= 5; lvl++) {
    const levelPool =
      assessmentQuestions[`${ageGroup}_level_${lvl}`] ||
      assessmentQuestions[key] ||
      assessmentQuestions[`${ageGroup}_level_1`] ||
      assessmentQuestions["child_level_1"];

    const poolQuestions = levelPool?.questions || [];
    const shuffledLevel = [...poolQuestions].sort(() => 0.5 - Math.random());
    for (let i = 0; i < 2 && i < shuffledLevel.length; i++) {
      levelQuestions.push(shuffledLevel[i]);
    }
  }

  // 10 MCQs in ascending difficulty: 2 from level 1 ... 2 from level 5.
  const sampled = levelQuestions;

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
    skill: "reading_ability",
    rawQuestion: { reading: text },
  }));

  const writingQuestions = writings.slice(0, 3).map((w, i) => {
    const dictation = (w?.dictation || "").trim();
    return {
      id: `${key}_writing_${i + 1}`,
      type: "writing",
      skill: "writing_ability",
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
    const skill = q.skill || "reading_comprehension";
    if (!skillBuckets[skill]) skillBuckets[skill] = { correct: 0, total: 0 };

    if (q.type === "comprehension") {
      const isCorrect = selectedAnswers[idx] === q.correctIndex ? 1 : 0;
      skillBuckets[skill].total += 1;
      skillBuckets[skill].correct += isCorrect;
    } else if (q.type === "reading") {
      const attempt = readingAttempts[idx];
      const ratio = (attempt && attempt.totalWords > 0) ? attempt.matchedCount / attempt.totalWords : 0;
      skillBuckets.reading_ability.total += 1;
      skillBuckets.reading_ability.correct += ratio;
    } else if (q.type === "writing") {
      const text = writingAnswers[idx] || "";
      const result = q.evaluator ? q.evaluator(text) : { score: 0 };
      skillBuckets.writing_ability.total += 1;
      skillBuckets.writing_ability.correct += result.score / 10;
    }
  });

  const scores = {};
  Object.entries(skillBuckets).forEach(([skill, { correct, total }]) => {
    scores[skill] = total > 0 ? Math.round((correct / total) * 100) : null;
  });

  const assessedScores = Object.values(scores).filter(v => typeof v === "number");
  const avgAssessed = assessedScores.length > 0
    ? Math.round(assessedScores.reduce((a, b) => a + b, 0) / assessedScores.length)
    : 0;

  Object.keys(scores).forEach(k => {
    if (scores[k] === null) scores[k] = avgAssessed;
    scores[k] = Math.max(0, Math.min(100, scores[k]));
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
