import React, { useState, useEffect, useRef } from "react";
import { supabase } from "./supabaseClient";
import {
  getRandomAssessment, computeSkillScores, generateLearningPath, getOrderedSections,
  classifyProficiency, getProficiencyName, getWeakSkills, getStrongSkills, getStrongSkillKeys, getWeakSkillKeys, SKILL_TRANSLATION_KEYS,
  SKILL_CATEGORIES, CURRICULUM_SECTIONS, PROFICIENCY_LEVELS, lessonsData
} from "./curriculumData";
import { generateLessonContent, fetchWordOfDay } from "./geminiClient";

const languages = ["English", "Hindi", "Kannada", "Telugu", "Tamil"];
const educationLevels = ["No formal education", "Primary", "Secondary", "Higher secondary", "Graduate"];

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

const BrainIcon = ({ className, style }) => (
  <svg className={className} style={{ verticalAlign: "middle", ...style }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1 0-3.12 3 3 0 0 1 0-4.88 2.5 2.5 0 0 1 0-3.12A2.5 2.5 0 0 1 9.5 2Z" />
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 0-3.12 3 3 0 0 0 0-4.88 2.5 2.5 0 0 0 0-3.12A2.5 2.5 0 0 0 14.5 2Z" />
  </svg>
);

const EditIcon = ({ className, style }) => (
  <svg className={className} style={{ verticalAlign: "middle", ...style }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
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

// Translation dictionary for regional languages
const translations = {
  English: {
    heroTitle: "LISA: AI-Powered Literacy Companion",
    heroCopy: "Personalized reading, writing, and comprehension diagnostic assessment in regional languages, featuring speech analysis and dynamic feedback.",
    login: "Login",
    register: "Register",
    welcomeBack: "Welcome back",
    signInToContinue: "Sign in to continue your learning journey.",
    email: "Email",
    password: "Password",
    forgotPasswordLink: "Forgot Password?",
    newLearnerPrompt: "New learner? Switch to Register to create your profile.",
    createProfile: "Create your learner profile",
    fullName: "Full Name",
    age: "Age",
    preferredLanguage: "Preferred Language",
    selectLanguage: "Select language",
    educationLevel: "Education Level",
    selectEducation: "Select education level",
    personalizationHelp: "This profile data helps LISA customize assessment difficulty and voice interactions.",
    resetPasswordTitle: "Reset Password",
    enterEmailForLink: "Enter your email to receive a password reset link.",
    sendResetLink: "Send Reset Link",
    backToLogin: "Back to Login",
    resetAccountPassword: "Reset your account password.",
    regainAccessCopy: "Please enter your new password to regain access to your dashboard.",
    createNewPassword: "Create New Password",
    typeSecurePassword: "Type in your secure new password.",
    newPassword: "New Password",
    updatePassword: "Update Password",
    hello: "Hello",
    logout: "Log Out",
    welcomeToLisa: "Welcome to LISA",
    loadingMessage: "Loading your learning experience...",
    signingIn: "Signing In...",
    creatingAccount: "Creating Account...",
    sendingLink: "Sending Link...",
    resettingPassword: "Resetting Password...",
    signingOut: "Signing Out...",
    chooseLanguage: "Choose Your Language",
    selectLanguagePrompt: "Select a language for the interface.",
    changeLanguageBtn: "Change Language",
    successLogin: "Login successful!",
    successAccountCreated: "Account created successfully!",
    checkEmailConfirm: "Registration successful! Please check your email to confirm your account.",
    successSignOut: "Signed out successfully.",
    emailPlaceholder: "Enter your Email Address",
    passwordPlaceholder: "Enter your password",
    fullNamePlaceholder: "Your name",
    agePlaceholder: "Age",
    emailRegisterPlaceholder: "Example: ramesh@gmail.com",
    passwordRegisterPlaceholder: "Create a password",
    newPasswordPlaceholder: "Enter new password",
    EnglishOption: "English",
    HindiOption: "Hindi (हिन्दी)",
    KannadaOption: "Kannada (ಕನ್ನಡ)",
    TeluguOption: "Telugu (తెలుగు)",
    TamilOption: "Tamil (தமிழ்)",
    "No formal educationOption": "No formal education",
    PrimaryOption: "Primary education",
    SecondaryOption: "Secondary education",
    "Higher secondaryOption": "Higher secondary education",
    confirmPassword: "Confirm Password",
    confirmPasswordPlaceholder: "Confirm your password",
    passwordsDoNotMatch: "Passwords do not match.",

    // Assessment Flow
    initialAssessmentDesc: "To diagnose your reading, writing, and comprehension skills, please start with the Initial Assessment.",
    takeAssessmentBtn: "Start Initial Assessment",
    stepTitle: "Step {current} of {total}",
    questionOf: "Question {current} of {total}",
    readingSecTitle: "Reading Section (Voice)",
    compSecTitle: "Comprehension Section (MCQ)",
    writingSecTitle: "Writing Section (Dictation)",
    micBtnStart: "CLICK TO SPEAK",
    home: "Home",
    profileSettings: "Profile Settings",
    takeAssessment: "Take Assessment",
    micBtnListening: "Listening... Read now!",
    micBtnStopped: "Speech Stopped",
    monkeyTypeTip: "Instructions: Click the button and read the sentence below clearly. Correct words turn green, incorrect words turn red.",
    nextQuestion: "Next Question",
    submitAssessmentBtn: "Submit Assessment",
    resultsTitle: "Assessment Completed!",
    overallScore: "Overall Score",
    percentage: "Percentage",
    diagnosedLevelTitle: "Diagnosed Literacy Level",
    readingSkill: "Reading Skill",
    writingSkill: "Writing Skill",
    compSkill: "Comprehension Skill",
    diagnosticPassed: "Assessment analyzed! Based on your performance, you are diagnosed at:",
    continueToDashboard: "Back to Dashboard",
    skipVoiceBtn: "Manual Match",
    skipVoicePrompt: "Voice recognition issue? Type the exact text instead:",
    writeInEnglishPrompt: "(Please write your response in English)",
    listenBtn: "Listen",
    dictationTip: "Press play and write the sentence you hear.",
    myProfile: "My Profile",
    dashboard: "Dashboard",
    prevBtn: "Previous",

    // Dashboard tabs
    tabProgress: "📊 My Performance",
    tabProfile: "👤 Profile Settings",

    // Progress Dashboard
    overallLevel: "Diagnosed Literacy Level",
    skillBreakdown: "Core Skills Proficiency",
    badgesEarned: "Achievement Badges",
    attemptHistory: "Assessment Result Details",
    historyDate: "Date",
    historyScore: "Score",
    historyType: "Type",
    historyStatus: "Result",

    personalizedInsights: "Your Personalized Insights",
    strongAreas: "Strong Areas",
    areasToImprove: "Areas to Improve",
    dailyCommitment: "Recommended Daily Commitment",
    noAreasToImprove: "None - Keep practicing to maintain excellence!",
    skillLetterRecognition: "Letter Recognition",
    skillWordRecognition: "Word Recognition",
    skillSentenceReading: "Sentence Reading",
    skillComprehension: "Comprehension",
    skillWriting: "Writing",
    skillPronunciation: "Pronunciation",
    daily10min: "10 Minutes/Day",
    daily15min: "15 Minutes/Day",
    daily25min: "25 Minutes/Day",
    viewLearningPath: "View Learning Path"
  },
  Hindi: {
    heroTitle: "लिसा: एआई-संचालित साक्षरता साथी",
    heroCopy: "क्षेत्रीय भाषाओं में व्यक्तिगत रूप से पढ़ने, लिखने और समझने का विकास। तत्काल ध्वनि विश्लेषण और प्रतिक्रिया के साथ।",
    login: "लॉगिन",
    register: "पंजीकरण",
    welcomeBack: "आपका स्वागत है",
    signInToContinue: "अपनी सीखने की यात्रा जारी रखने के लिए साइन इन करें।",
    email: "ईमेल",
    password: "पासवर्ड",
    forgotPasswordLink: "पासवर्ड भूल गए?",
    newLearnerPrompt: "नए शिक्षार्थी? अपना प्रोफ़ाइल बनाने के लिए पंजीकरण पर जाएँ।",
    createProfile: "अपना शिक्षार्थी प्रोफ़ाइल बनाएं",
    fullName: "पूरा नाम",
    age: "उम्र",
    preferredLanguage: "पसंदीदा भाषा",
    selectLanguage: "भाषा चुनें",
    educationLevel: "शिक्षा का स्तर",
    selectEducation: "शिक्षा का स्तर चुनें",
    personalizationHelp: "यह जानकारी लिसा को आकलन कठिनाई और आवाज़ को अनुकूलित करने में मदद करती है।",
    resetPasswordTitle: "पासवर्ड रीसेट करें",
    enterEmailForLink: "पासवर्ड रीसेट लिंक प्राप्त करने के लिए अपना ईमेल दर्ज करें।",
    sendResetLink: "रीसेट लिंक भेजें",
    backToLogin: "लॉगिन पर वापस जाएं",
    resetAccountPassword: "अपने खाते का पासवर्ड रीसेट करें।",
    regainAccessCopy: "डैशबोर्ड तक पहुंच पुनः प्राप्त करने के लिए कृपया अपना नया पासवर्ड दर्ज करें।",
    createNewPassword: "नया पासवर्ड बनाएं",
    typeSecurePassword: "अपना सुरक्षित नया पासवर्ड टाइप करें।",
    newPassword: "नया पासवर्ड",
    updatePassword: "पासवर्ड अपडेट करें",
    hello: "नमस्ते",
    logout: "लॉग आउट",
    welcomeToLisa: "लिसा में आपका स्वागत है",
    loadingMessage: "लोड हो रहा है...",
    signingIn: "लॉगिन किया जा रहा है...",
    creatingAccount: "खाता बनाया जा रहा है...",
    sendingLink: "लिंक भेजा जा रहा है...",
    resettingPassword: "पासवर्ड रीसेट किया जा रहा है...",
    signingOut: "लॉग आउट किया जा रहा है...",
    chooseLanguage: "अपनी भाषा चुनें",
    selectLanguagePrompt: "इंटरफ़ेस के लिए एक भाषा चुनें।",
    changeLanguageBtn: "भाषा बदलें",
    successLogin: "लॉगिन सफल रहा!",
    successAccountCreated: "खाता सफलतापूर्वक बन गया!",
    checkEmailConfirm: "पंजीकरण सफल! पुष्टि करने के लिए अपना ईमेल जांचें।",
    successSignOut: "सफलतापूर्वक लॉग आउट हो गया।",
    emailPlaceholder: "ईमेल पता दर्ज करें",
    passwordPlaceholder: "पासवर्ड दर्ज करें",
    fullNamePlaceholder: "आपका नाम",
    agePlaceholder: "उम्र",
    emailRegisterPlaceholder: "रमेश@gmail.com",
    passwordRegisterPlaceholder: "एक पासवर्ड बनाएं",
    newPasswordPlaceholder: "नया पासवर्ड दर्ज करें",
    EnglishOption: "अंग्रेज़ी",
    HindiOption: "हिन्दी",
    KannadaOption: "कन्नड़",
    TeluguOption: "तेलुगु",
    TamilOption: "तमिल",
    "No formal educationOption": "कोई औपचारिक शिक्षा नहीं",
    PrimaryOption: "प्राथमिक शिक्षा",
    SecondaryOption: "माध्यमिक शिक्षा",
    "Higher secondaryOption": "उच्चतर माध्यमिक शिक्षा",
    confirmPassword: "पासवर्ड की पुष्टि करें",
    confirmPasswordPlaceholder: "पासवर्ड की पुष्टि करें",
    passwordsDoNotMatch: "पासवर्ड मेल नहीं खाते हैं।",

    // Initial Assessment Flow
    initialAssessmentDesc: "आपके पढ़ने, लिखने और समझने के कौशल का आकलन करने के लिए कृपया प्रारंभिक आकलन से शुरुआत करें।",
    takeAssessmentBtn: "प्रारंभिक आकलन शुरू करें",
    stepTitle: "कदम {current} का {total}",
    questionOf: "प्रश्न {current} का {total}",
    readingSecTitle: "पठन अनुभाग (आवाज़)",
    compSecTitle: "समझ अनुभाग (एमसीक्यू)",
    writingSecTitle: "लेखन अनुभाग (डिक्टेशन)",
    micBtnStart: "पढ़ना शुरू करें",
    home: "होम",
    profileSettings: "प्रोफ़ाइल सेटिंग्स",
    takeAssessment: "आकलन लें",
    micBtnListening: "सुन रहा है... अब पढ़ें!",
    micBtnStopped: "बोलना बंद हुआ",
    monkeyTypeTip: "निर्देश: बटन दबाएं और नीचे लिखे वाक्य को स्पष्ट रूप से पढ़ें। सही शब्द हरे और गलत शब्द लाल हो जाएंगे।",
    nextQuestion: "अगला प्रश्न",
    submitAssessmentBtn: "आकलन सबमिट करें",
    resultsTitle: "आकलन पूरा हुआ!",
    overallScore: "कुल स्कोर",
    percentage: "प्रतिशत",
    diagnosedLevelTitle: "निर्धारित साक्षरता स्तर",
    readingSkill: "पढ़ने का कौशल",
    writingSkill: "लिखने का कौशल",
    compSkill: "समझने का कौशल",
    diagnosticPassed: "मूल्यांकन पूरा! आपके प्रदर्शन के आधार पर, आपका स्तर है:",
    continueToDashboard: "डैशबोर्ड पर वापस जाएं",
    skipVoiceBtn: "मैनुअल मिलान",
    skipVoicePrompt: "आवाज़ पहचानने में समस्या? इसके बजाय टेक्स्ट टाइप करें:",
    writeInEnglishPrompt: "(कृपया अपना उत्तर अंग्रेजी में लिखें)",
    listenBtn: "सुनें",
    dictationTip: "प्ले दबाएं और जो वाक्य सुनें वह लिखें।",
    myProfile: "मेरी प्रोफ़ाइल",
    dashboard: "डैशबोर्ड",
    prevBtn: "पिछला",

    // Dashboard tabs
    tabProgress: "📊 मेरा प्रदर्शन",
    tabProfile: "👤 प्रोफ़ाइल सेटिंग्स",

    // Progress Dashboard
    overallLevel: "निर्धारित साक्षरता स्तर",
    skillBreakdown: "मुख्य कौशल दक्षता",
    badgesEarned: "उपलब्धि बैज",
    attemptHistory: "आकलन परिणाम विवरण",
    historyDate: "तिथि",
    historyScore: "स्कोर",
    historyType: "प्रकार",
    historyStatus: "परिणाम",

    personalizedInsights: "आपकी व्यक्तिगत अंतर्दृष्टि",
    strongAreas: "मजबूत क्षेत्र",
    areasToImprove: "सुधार के क्षेत्र",
    dailyCommitment: "अनुशंसित दैनिक प्रतिबद्धता",
    noAreasToImprove: "कोई नहीं - उत्कृष्टता बनाए रखने के लिए अभ्यास जारी रखें!",
    skillLetterRecognition: "अक्षर पहचान",
    skillWordRecognition: "शब्द पहचान",
    skillSentenceReading: "वाक्य पठन",
    skillComprehension: "समझ",
    skillWriting: "लेखन",
    skillPronunciation: "उच्चारण",
    daily10min: "10 मिनट/दिन",
    daily15min: "15 मिनट/दिन",
    daily25min: "25 मिनट/दिन",
    viewLearningPath: "सीखने का मार्ग देखें"
  },
  Kannada: {
    heroTitle: "ಲಿಸಾ: ವೈಯಕ್ತೀಕರಿಸಿದ ಸಾಕ್ಷರತಾ ಸಹಾಯಕಿ",
    heroCopy: "ಪ್ರಾದೇಶಿಕ ಭಾಷೆಗಳಲ್ಲಿ ಓದುವಿಕೆ, ಬರೆಯುವಿಕೆ ಮತ್ತು ಗ್ರಹಿಕೆಯ ಮೌಲ್ಯಮಾಪನ. ತಕ್ಷಣದ ಧ್ವನಿ ವಿಶ್ಲೇಷಣೆ ಮತ್ತು ಪ್ರತಿಕ್ರಿಯೆಯೊಂದಿಗೆ.",
    login: "ಲಾಗಿನ್",
    register: "ನೋಂದಣಿ",
    welcomeBack: "ಸ್ವಾಗತ",
    signInToContinue: "ಕಲಿಕೆಯನ್ನು ಮುಂದುವರಿಸಲು ಸೈನ್ ಇನ್ ಮಾಡಿ.",
    email: "ಇಮೇಲ್",
    password: "ಪಾಸ್‌ವರ್ಡ್",
    forgotPasswordLink: "ಪಾಸ್‌ವರ್ಡ್ ಮರೆತಿರಾ?",
    newLearnerPrompt: "ಹೊಸ ಕಲಿಯುವವರೇ? ಪ್ರೊಫೈಲ್ ರಚಿಸಲು ನೋಂದಣಿಗೆ ಬದಲಿಸಿ.",
    createProfile: "ಕಲಿಯುವವರ ಪ್ರೊಫೈಲ್ ರಚಿಸಿ",
    fullName: "ಪೂರ್ಣ ಹೆಸರು",
    age: "ವಯಸ್ಸು",
    preferredLanguage: "ಆದ್ಯತೆಯ ಭಾಷೆ",
    selectLanguage: "ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ",
    educationLevel: "ಶಿಕ್ಷಣದ ಮಟ್ಟ",
    selectEducation: "ಶಿಕ್ಷಣದ ಮಟ್ಟ ಆಯ್ಕೆಮಾಡಿ",
    personalizationHelp: "ಈ ಮಾಹಿತಿಯು ಮೌಲ್ಯಮಾಪನ ಮತ್ತು ಧ್ವನಿ ಸಂವಹನಗಳನ್ನು ಕಸ್ಟಮೈಸ್ ಮಾಡಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ.",
    resetPasswordTitle: "ಪಾಸ್‌ವರ್ಡ್ ಮರುಹೊಂದಿಸಿ",
    enterEmailForLink: "ಇಮೇಲ್ ಲಿಂಕ್ ಪಡೆಯಲು ಇಮೇಲ್ ನಮೂದಿಸಿ.",
    sendResetLink: "ಮರುಹೊಂದಿಸುವ ಲಿಂಕ್ ಕಳುಹಿಸಿ",
    backToLogin: "ಲಾಗಿನ್‌ಗೆ ಹಿಂತಿರುಗಿ",
    resetAccountPassword: "ನಿಮ್ಮ ಖಾತೆಯ ಪಾಸ್‌ವರ್ಡ್ ಮರುಹೊಂದಿಸಿ.",
    regainAccessCopy: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಪ್ರವೇಶ ಪಡೆಯಲು ದಯವಿಟ್ಟು ಹೊಸ ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ.",
    createNewPassword: "ಹೊಸ ಪಾಸ್‌ವರ್ಡ್ ರಚಿಸಿ",
    typeSecurePassword: "ನಿಮ್ಮ ಸುರಕ್ಷಿತ ಹೊಸ ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ.",
    newPassword: "ಹೊಸ ಪಾಸ್‌ವರ್ಡ್",
    updatePassword: "ಪಾಸ್‌ವರ್ಡ್ ನವೀಕರಿಸಿ",
    hello: "ನಮಸ್ಕಾರ",
    logout: "ಲಾಗ್ ಔಟ್",
    welcomeToLisa: "ಲಿಸಾಗೆ ಸುಸ್ವಾಗತ",
    loadingMessage: "ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
    signingIn: "ಸೈನ್ ಇನ್ ಮಾಡಲಾಗುತ್ತಿದೆ...",
    creatingAccount: "ಖಾತೆ ರಚಿಸಲಾಗುತ್ತಿದೆ...",
    sendingLink: "ಲಿಂಕ್ ಕಳುಹಿಸಲಾಗುತ್ತಿದೆ...",
    resettingPassword: "ಪಾಸ್‌ವರ್ಡ್ ಮರುಹೊಂದಿಸಲಾಗುತ್ತಿದೆ...",
    signingOut: "ಲಾಗ್ ಔಟ್ ಮಾಡಲಾಗುತ್ತಿದೆ...",
    chooseLanguage: "ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    selectLanguagePrompt: "ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
    changeLanguageBtn: "ಭಾಷೆ ಬದಲಾಯಿಸಿ",
    successLogin: "ಲಾಗಿನ್ ಯಶಸ್ವಿಯಾಗಿದೆ!",
    successAccountCreated: "ಖಾತೆಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ರಚಿಸಲಾಗಿದೆ!",
    checkEmailConfirm: "ನೋಂದಣಿ ಯಶಸ್ವಿಯಾಗಿದೆ! ನಿಮ್ಮ ಖಾತೆಯನ್ನು ಖಚಿತಪಡಿಸಲು ಇಮೇಲ್ ಪರಿಶೀಲಿಸಿ.",
    successSignOut: "ಯಶಸ್ವಿಯಾಗಿ ಲಾಗ್ ಔಟ್ ಮಾಡಲಾಗಿದೆ.",
    emailPlaceholder: "ನಿಮ್ಮ ಇಮೇಲ್ ವಿಳಾಸ",
    passwordPlaceholder: "ನಿಮ್ಮ ಪಾಸ್‌ವರ್ಡ್",
    fullNamePlaceholder: "ನಿಮ್ಮ ಹೆಸರು",
    agePlaceholder: "ವಯಸ್ಸು",
    emailRegisterPlaceholder: "ramesh@gmail.com",
    passwordRegisterPlaceholder: "ಪಾಸ್‌ವರ್ಡ್ ರಚಿಸಿ",
    newPasswordPlaceholder: "ಹೊಸ ಪಾಸ್‌ವರ್ಡ್",
    EnglishOption: "ಇಂಗ್ಲಿಷ್",
    HindiOption: "ಹಿಂದಿ",
    KannadaOption: "ಕನ್ನಡ",
    TeluguOption: "ತೆಲುಗು",
    TamilOption: "ತಮಿಳು",
    "No formal educationOption": "ಯಾವುದೇ ಔಪಚಾರಿಕ ಶಿಕ್ಷಣವಿಲ್ಲ",
    PrimaryOption: "ಪ್ರಥಮಿಕ ಶಿಕ್ಷಣ",
    SecondaryOption: "ದ್ವಿತೀಯ ಶಿಕ್ಷಣ",
    "Higher secondaryOption": "ಉನ್ನತ ಮಾಧ್ಯಮಿಕ ಶಿಕ್ಷಣ",
    confirmPassword: "ಪಾಸ್‌ವರ್ಡ್ ದೃಢೀಕರಿಸಿ",
    confirmPasswordPlaceholder: "ಪಾಸ್‌ವರ್ಡ್ ದೃಢೀಕರಿಸಿ",
    passwordsDoNotMatch: "ಪಾಸ್‌ವರ್ಡ್‌ಗಳು ಹೊಂದಿಕೆಯಾಗುತ್ತಿಲ್ಲ.",

    // Initial Assessment Flow
    initialAssessmentDesc: "ನಿಮ್ಮ ಓದುವ, ಬರೆಯುವ ಮತ್ತು ಗ್ರಹಿಸುವ ಕೌಶಲ್ಯಗಳನ್ನು ನಿರ್ಣಯಿಸಲು ದಯವಿಟ್ಟು ಆರಂಭಿಕ ಮೌಲ್ಯಮಾಪನದೊಂದಿಗೆ ಪ್ರಾರಂಭಿಸಿ।",
    takeAssessmentBtn: "ಆರಂಭಿಕ ಮೌಲ್ಯಮಾಪನ ಪ್ರಾರಂಭಿಸಿ",
    stepTitle: "ಹಂತ {current} ರ {total}",
    questionOf: "ಪ್ರಶ್ನೆ {current} ರಲ್ಲಿ {total}",
    readingSecTitle: "ಓದುವಿಕೆ ವಿಭಾಗ (ಧ್ವನಿ)",
    compSecTitle: "ಗ್ರಹಿಕೆ ವಿಭಾಗ (MCQ)",
    writingSecTitle: "ಬರವಣಿಗೆ ವಿಭಾಗ (ಡಿಕ್ಟೇಷನ್)",
    micBtnStart: "ಓದಲು ಪ್ರಾರಂಭಿಸಿ",
    home: "ಮುಖಪುಟ",
    profileSettings: "ಪ್ರೊಫೈಲ್ ಸೆಟ್ಟಿಂಗ್ಸ್",
    takeAssessment: "ಮೌಲ್ಯಮಾಪನ ತೆಗೆದುಕೊಳ್ಳಿ",
    micBtnListening: "ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದೆ... ಈಗ ಓದಿ!",
    micBtnStopped: "ಮಾತು ನಿಂತಿದೆ",
    monkeyTypeTip: "ಸೂಚನೆಗಳು: ಬಟನ್ ಕ್ಲಿಕ್ ಮಾಡಿ ಕೆಳಗಿನ ವಾಕ್ಯವನ್ನು ಸ್ಪಷ್ಟವಾಗಿ ಓದಿ. ಸರಿಯಾದ ಪದಗಳು ಹಸಿರು ಬಣ್ಣಕ್ಕೆ ಮತ್ತು ತಪ್ಪಾದ ಪದಗಳು ಕೆಂಪು ಬಣ್ಣಕ್ಕೆ ತಿರುಗುತ್ತವೆ.",
    nextQuestion: "ಮುಂದಿನ ಪ್ರಶ್ನೆ",
    submitAssessmentBtn: "ಮೌಲ್ಯಮಾಪನ ಸಲ್ಲಿಸಿ",
    resultsTitle: "ಮೌಲ್ಯಮಾಪನ ಪೂರ್ಣಗೊಂಡಿದೆ!",
    overallScore: "ಒಟ್ಟು ಅಂಕಗಳು",
    percentage: "ಶೇಕಡಾವಾರು",
    diagnosedLevelTitle: "ನಿರ್ಣಯಿಸಿದ ಸಾಕ್ಷರತಾ ಮಟ್ಟ",
    readingSkill: "ಓದುವ ಕೌಶಲ್ಯ",
    writingSkill: "ಬರೆಯುವ ಕೌಶಲ್ಯ",
    compSkill: "ಗ್ರಹಿಕೆಯ ಕೌಶಲ್ಯ",
    diagnosticPassed: "ಮೌಲ್ಯಮಾಪನ ವಿಶ್ಲೇಷಿಸಲಾಗಿದೆ! ನಿಮ್ಮ ಪ್ರದರ್ಶನದ ಆಧಾರದ ಮೇಲೆ, ನೀವು ಇಲ್ಲಿಂದ ಪ್ರಾರಂಭಿಸುತ್ತೀರಿ:",
    continueToDashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹಿಂತಿರುಗಿ",
    skipVoiceBtn: "ಹಸ್ತಚಾಲಿತ ಹೊಂದಾಣಿಕೆ",
    skipVoicePrompt: "ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ ಸಮಸ್ಯೆಯೇ? ಬದಲಿಗೆ ಪಠ್ಯವನ್ನು ಟೈಪ್ ಮಾಡಿ:",
    writeInEnglishPrompt: "(ದಯವಿಟ್ಟು ನಿಮ್ಮ ಉತ್ತರವನ್ನು ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ಬರೆಯಿರಿ)",
    listenBtn: "ಆಲಿಸಿ",
    dictationTip: "ಪ್ಲೇ ಒತ್ತಿ ಮತ್ತು ನೀವು ಕೇಳಿದ ವಾಕ್ಯವನ್ನು ಬರೆಯಿರಿ.",
    myProfile: "ನನ್ನ ಪ್ರೊಫೈಲ್",
    dashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    prevBtn: "ಹಿಂದಿನ",

    // Dashboard tabs
    tabProgress: "📊 ನನ್ನ ಪ್ರದರ್ಶನ",
    tabProfile: "👤 ಪ್ರೊಫೈಲ್ ಸೆಟ್ಟಿಂಗ್ಸ್",

    // Progress Dashboard
    overallLevel: "ನಿರ್ಣಯಿಸಿದ ಸಾಕ್ಷರತಾ ಮಟ್ಟ",
    skillBreakdown: "ಮೂಲ ಕೌಶಲ್ಯ ಪ್ರಾವೀಣ್ಯತೆ",
    badgesEarned: "ಸಾಧನೆ ಬ್ಯಾಡ್ಜ್‌ಗಳು",
    attemptHistory: "ಮೌಲ್ಯಮಾಪನ ಫಲಿತಾಂಶದ ವಿವರಗಳು",
    historyDate: "ದಿನಾಂಕ",
    historyScore: "ಅಂಕಗಳು",
    historyType: "ಮಾದರಿ",
    historyStatus: "ಫಲಿತಾಂಶ",

    personalizedInsights: "ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಒಳನೋಟಗಳು",
    strongAreas: "ಬಲವಾದ ಕ್ಷೇತ್ರಗಳು",
    areasToImprove: "ಸುಧಾರಿಸಬೇಕಾದ ಕ್ಷೇತ್ರಗಳು",
    dailyCommitment: "ಶಿಫಾರಸು ಮಾಡಿದ ದೈನಂದಿನ ಬದ್ಧತೆ",
    noAreasToImprove: "ಯಾವುದೇ ಇಲ್ಲ - ಉತ್ಕೃಷ್ಟತೆ ಕಾಯ್ದುಕೊಳ್ಳಲು ಅಭ್ಯಾಸ ಮಾಡುತ್ತಿರಿ!",
    skillLetterRecognition: "ಅಕ್ಷರ ಗುರುತಿಸುವಿಕೆ",
    skillWordRecognition: "ಪದ ಗುರುತಿಸುವಿಕೆ",
    skillSentenceReading: "ವಾಕ್ಯ ಓದುವಿಕೆ",
    skillComprehension: "ಅರ್ಥಗ್ರಹಣ",
    skillWriting: "ಬರವಣಿಗೆ",
    skillPronunciation: "ಉಚ್ಚಾರಣೆ",
    daily10min: "10 ನಿಮಿಷ/ದಿನ",
    daily15min: "15 ನಿಮಿಷ/ದಿನ",
    daily25min: "25 ನಿಮಿಷ/ದಿನ",
    viewLearningPath: "ಕಲಿಕೆಯ ಮಾರ್ಗ ವೀಕ್ಷಿಸಿ"
  },
  Telugu: {
    heroTitle: "లిసా: మీ వ్యక్తిగతీకరించిన అక్షరాస్యత తోడు",
    heroCopy: "ప్రాంతీయ భాషలలో చదవడం, రాయడం మరియు గ్రహణశక్తి అంచనా. తక్షణ వాయిస్ విశ్లేషణ మరియు ఫీడ్‌బ్యాక్‌తో.",
    login: "లాగిన్",
    register: "నమోదు",
    welcomeBack: "స్వాగతం",
    signInToContinue: "మీ అభ్యాస ప్రయాణాన్ని కొనసాగించడానికి సైన్ ఇన్ చేయండి.",
    email: "ఈమెయిల్",
    password: "పాస్‌వర్డ్",
    forgotPasswordLink: "పాస్‌వర్డ్ మర్చిపోయాడా?",
    newLearnerPrompt: "కొత్త అభ్యాసకులా? ప్రొఫైల్ సృష్టించడానికి నమోదుకు మారండి.",
    createProfile: "మీ అభ్యాస ప్రొఫైల్‌ను సృష్టించండి",
    fullName: "పూర్తి పేరు",
    age: "వయస్సు",
    preferredLanguage: "ప్రాధాన్యత కలిగిన భాష",
    selectLanguage: "భాషను ఎంచుకోండి",
    educationLevel: "విద్యా స్థాయి",
    selectEducation: "విద్యా స్థాయిని ఎంచుకోండి",
    personalizationHelp: "ఈ సమాచారం కంటెంట్, వాయిస్ మరియు అసెస్‌మెంట్‌ను వ్యక్తిగతీకరించడంలో సహాయపడుతుంది.",
    resetPasswordTitle: "పాస్‌వర్డ్ రీసెట్",
    enterEmailForLink: "లింక్ పొందడానికి మీ ఇమెయిల్‌ను నమోదు చేయండి.",
    sendResetLink: "రీసెట్ లింక్ పంపండి",
    backToLogin: "లాగిన్‌కి తిరిగి వెళ్ళండి",
    resetAccountPassword: "మీ ఖాతా పాస్‌వర్డ్‌ను రీసెట్ చేయండి.",
    regainAccessCopy: "డాష్‌బోర్డ్ యాక్సెస్ చేయడానికి దయచేసి కొత్త పాస్‌వర్డ్‌ను నమోదు చేయండి.",
    createNewPassword: "కొత్త పాస్‌వర్డ్‌ను సృష్టించండి",
    typeSecurePassword: "మీ సురక్షితమైన కొత్త పాస్‌వర్డ్‌ను టైప్ చేయండి.",
    newPassword: "కొత్త పాస్‌వర్డ్",
    updatePassword: "పాస్‌వర్డ్ నవీకరించు",
    hello: "నమస్కారం",
    logout: "లాగ్ అవుట్",
    welcomeToLisa: "లిసాకు స్వాగతం",
    loadingMessage: "లోడ్ అవుతోంది...",
    signingIn: "లాగిన్ అవుతోంది...",
    creatingAccount: "ఖాతాను సృష్టిస్తోంది...",
    sendingLink: "లింక్ పంపుతోంది...",
    resettingPassword: "పాస్‌వర్డ్ రీసెట్ చేస్తోంది...",
    signingOut: "Log Out అవుతోంది...",
    chooseLanguage: "మీ భాషను ఎంచుకోండి",
    selectLanguagePrompt: "ఇంటర్‌ఫేస్ కోసం ఒక భాషను ఎంచుకోండి.",
    changeLanguageBtn: "భాష మార్చండి",
    successLogin: "లాగిన్ విజయవంతమైంది!",
    successAccountCreated: "ఖాతా విజయవంతంగా సృష్టించబడింది!",
    checkEmailConfirm: "నమోదు విజయవంతమైంది! మీ ఇమెయిల్‌ను తనిఖీ చేయండి.",
    successSignOut: "విజయవంతంగా లాగ్ అవుట్ అయ్యారు.",
    emailPlaceholder: "మీ ఇమెయిల్ చిరునామా",
    passwordPlaceholder: "మీ పాస్‌వర్డ్",
    fullNamePlaceholder: "మీ పేరు",
    agePlaceholder: "వయస్సు",
    emailRegisterPlaceholder: "ramesh@gmail.com",
    passwordRegisterPlaceholder: "పాస్‌వర్డ్‌ను సృష్టించండి",
    newPasswordPlaceholder: "కొత్త పాస్‌వర్డ్",
    EnglishOption: "ఇంగ్లీష్",
    HindiOption: "హిందీ",
    KannadaOption: "కన్నడ",
    TeluguOption: "తెలుగు",
    TamilOption: "తమిళం",
    "No formal educationOption": "అధికారిక విద్య లేదు",
    PrimaryOption: "ప్రాథమిక విద్య",
    SecondaryOption: "ద్వితీయ విద్య",
    "Higher secondaryOption": "ఉన్నత మాధ్యమిక విద్య",
    confirmPassword: "పాస్‌వర్డ్‌ను నిర్ధారించండి",
    confirmPasswordPlaceholder: "పాస్‌వర్డ్‌ను నిర్ధారించండి",
    passwordsDoNotMatch: "పాస్‌వర్డ్‌లు సరిపోలడం లేదు.",

    // Initial Assessment Flow
    initialAssessmentDesc: "మీ చదవడం, రాయడం మరియు గ్రహించే నైపుణ్యాలను అంచనా వేయడానికి దయచేసి ప్రారంభ అంచనాతో ప్రారంభించండి.",
    takeAssessmentBtn: "ప్రారంభ అంచనాను ప్రారంభించండి",
    stepTitle: "ప్రశ్న {current} యొక్క {total}",
    questionOf: "ప్రశ్న {current} / {total}",
    readingSecTitle: "పఠనం విభాగం (వాయిస్)",
    compSecTitle: "గ్రహణశక్తి విభాగం (MCQ)",
    writingSecTitle: "రాయడం విభాగం (డిక్టేషన్)",
    micBtnStart: "చదవడం ప్రారంభించండి",
    home: "హోమ్",
    profileSettings: "ప్రొఫైల్ సెట్టింగ్స్",
    takeAssessment: "అంచనా తీసుకోండి",
    micBtnListening: "వింటోంది... ఇప్పుడు చదవండి!",
    micBtnStopped: "సంభాషణ ఆగిపోయింది",
    monkeyTypeTip: "సూచనలు: బటన్‌ను క్లిక్ చేసి కింద ఉన్న వాక్యాన్ని స్పష్టంగా చదవండి. సరైన పదాలు ఆకుపచ్చగా, తప్పు పదాలు ఎరుపుగా మారుతాయి.",
    nextQuestion: "తదుపరి ప్రశ్న",
    submitAssessmentBtn: "అంచనా సమర్పించండి",
    resultsTitle: "అంచనా పూర్తయింది!",
    overallScore: "మొత్తం స్కోరు",
    percentage: "శాతం",
    diagnosedLevelTitle: "నిర్ధారించిన అక్షరాస్యత స్థాయి",
    readingSkill: "చదవడం నైపుణ్యం",
    writingSkill: "రాయడం నైపుణ్యం",
    compSkill: "గ్రహణశక్తి నైపుణ్యం",
    diagnosticPassed: "అంచనా విశ్లేషించబడింది! మీ ప్రదర్శన ఆధారంగా మీ స్థాయి:",
    continueToDashboard: "డాష్‌బోర్డ్‌కు తిరిగి వెళ్లండి",
    skipVoiceBtn: "మాన్యువల్ మ్యాచ్",
    skipVoicePrompt: "వాయిస్ గుర్తింపు సమస్య ఉందా? బదులుగా టెక్స్ట్ టైప్ చేయండి:",
    writeInEnglishPrompt: "(దయచేసి మీ సమాధానాన్ని ఇంగ్లీషులో రాయండి)",
    listenBtn: "వినండి",
    dictationTip: "ప్లే నొక్కి, మీరు విన్న వాక్యాన్ని రాయండి.",
    myProfile: "నా ప్రొఫైల్",
    dashboard: "డాష్‌బోర్డ్",
    prevBtn: "మునుపటి",

    // Dashboard tabs
    tabProgress: "📊 నా ప్రదర్శన",
    tabProfile: "👤 ప్రొఫైల్ సెట్టింగ్స్",

    // Progress Dashboard
    overallLevel: "నిర్ధారించిన అక్షరాస్యత స్థాయి",
    skillBreakdown: "మూల నైపుణ్యాల ప్రగతి",
    badgesEarned: "సాధించిన బ్యాడ్జ్‌లు",
    attemptHistory: "అంచనా ఫలితాల వివరాలు",
    historyDate: "తేదీ",
    historyScore: "అంకెలు",
    historyType: "రకం",
    historyStatus: "ఫలితం",

    personalizedInsights: "మీ వ్యక్తిగత అంతర్దృష్టులు",
    strongAreas: "బలమైన ప్రాంతాలు",
    areasToImprove: "మెరుగుపరచాల్సిన ప్రాంతాలు",
    dailyCommitment: "సిఫార్సు చేసిన రోజువారీ బాధ్యత",
    noAreasToImprove: "ఏదీ లేదు - ఉత్తమత్వాన్ని కొనసాగించడానికి అభ్యాసం చేయండి!",
    skillLetterRecognition: "అక్షర గుర్తింపు",
    skillWordRecognition: "పద గుర్తింపు",
    skillSentenceReading: "వాక్య పఠనం",
    skillComprehension: "అవగాహన",
    skillWriting: "రచన",
    skillPronunciation: "ఉచ్చారణ",
    daily10min: "10 నిమిషాలు/రోజు",
    daily15min: "15 నిమిషాలు/రోజు",
    daily25min: "25 నిమిషాలు/రోజు",
    viewLearningPath: "అభ్యాస మార్గాన్ని చూడండి"
  },
  Tamil: {
    heroTitle: "லிசா: உங்களது தனிப்பயனாக்கப்பட்ட எழுத்தறிவுத் தோழி",
    heroCopy: "பிராந்திய மொழிகளில் வாசிப்பு, எழுதுதல் மற்றும் புரிதல் திறன் மதிப்பீடு. குரல் பகுப்பாய்வு மற்றும் உடனடி பின்னூட்டத்துடன்.",
    login: "உள்நுழைவு",
    register: "பதிவு",
    welcomeBack: "வரவேற்கிறோம்",
    signInToContinue: "உங்கள் கற்றல் பயணத்தைத் தொடர உள்நுழையவும்.",
    email: "மின்னஞ்சல்",
    password: "கடவுச்சொல்",
    forgotPasswordLink: "கடவுச்சொல்லை மறந்துவிட்டீர்களா?",
    newLearnerPrompt: "புதிய கற்பவரா? சுயவிவரத்தை உருவாக்க பதிவுக்கு மாறவும்.",
    createProfile: "உங்கள் கற்றல் சுயவிவரத்தை உருவாக்கவும்",
    fullName: "முழு பெயர்",
    age: "வயது",
    preferredLanguage: "விருப்பமான மொழி",
    selectLanguage: "மொழியைத் தேர்ந்தெடுக்கவும்",
    educationLevel: "கல்வி தகுதி",
    selectEducation: "கல்வி தகுதியைத் தேர்ந்தெடுக்கவும்",
    personalizationHelp: "இந்தத் தகவல் மதிப்பீட்டைத் தனிப்பயனாக்க உதவுகிறது.",
    resetPasswordTitle: "கடவுச்சொல்லை மீட்டமை",
    enterEmailForLink: "கடவுச்சொல் மீட்பு இணைப்பைப் பெற மின்னஞ்சலை உள்ளிடவும்.",
    sendResetLink: "மீட்பு இணைப்பு அனுப்பு",
    backToLogin: "உள்நுழைவுக்குத் திரும்பு",
    resetAccountPassword: "உங்கள் கணக்கின் கடவுச்சொல்லை மீட்டமைக்கவும்.",
    regainAccessCopy: "டாஷ்போர்டை அணுக புதிய கடவுச்சொல்லை உள்ளிடவும்.",
    createNewPassword: "புதிய கடவுச்சொல்லை உருவாக்கவும்",
    typeSecurePassword: "உங்கள் புதிய கடவுச்சொல்லை உள்ளிடவும்.",
    newPassword: "புதிய கடவுச்சொல்",
    updatePassword: "கடவுச்சொல்லை புதுப்பி",
    hello: "வணக்கம்",
    logout: "வெளியேறு",
    welcomeToLisa: "லிசாவிற்கு வரவேற்கிறோம்",
    loadingMessage: "ஏற்றுகிறது...",
    signingIn: "உள்நுழைகிறது...",
    creatingAccount: "பதிவு செய்யப்படுகிறது...",
    sendingLink: "இணைப்பு அனுப்பப்படுகிறது...",
    resettingPassword: "கடவுச்சொல் மீட்டமைக்கப்படுகிறது...",
    signingOut: "வெளியேறுகிறது...",
    chooseLanguage: "உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்",
    selectLanguagePrompt: "இடைமுகத்திற்கான மொழியைத் தேர்ந்தெடுக்கவும்.",
    changeLanguageBtn: "மொழியை மாற்று",
    successLogin: "உள்நுழைவு வெற்றிகரமாக முடிந்தது!",
    successAccountCreated: "சுயவிவரம் வெற்றிகரமாக உருவாக்கப்பட்டது!",
    checkEmailConfirm: "பதிவு வெற்றிகரமாக முடிந்தது! மின்னஞ்சலைச் சரிபார்க்கவும்.",
    successSignOut: "வெற்றிகரமாக வெளியேறப்பட்டது.",
    emailPlaceholder: "மின்னஞ்சல் முகவரி",
    passwordPlaceholder: "கடவுச்சொல்",
    fullNamePlaceholder: "உங்கள் பெயர்",
    agePlaceholder: "வயது",
    emailRegisterPlaceholder: "ramesh@gmail.com",
    passwordRegisterPlaceholder: "கடவுச்சொல்லை உருவாக்கவும்",
    newPasswordPlaceholder: "புதிய கடவுச்சொல்",
    EnglishOption: "ஆங்கிலம்",
    HindiOption: "இந்தி",
    KannadaOption: "கன்னடம்",
    TeluguOption: "தெலுங்கு",
    TamilOption: "தமிழ்",
    "No formal educationOption": "முறையான கல்வி இல்லை",
    PrimaryOption: "தொடக்கக் கல்வி",
    SecondaryOption: "இடைநிலைக் கல்வி",
    "Higher secondaryOption": "மேல்நிலைக் கல்வி",
    confirmPassword: "கடவுச்சொல்லை உறுதிப்படுத்தவும்",
    confirmPasswordPlaceholder: "கடவுச்சொல்லை உறுதிப்படுத்தவும்",
    passwordsDoNotMatch: "கடவுச்சொற்கள் பொருந்தவில்லை.",

    // Initial Assessment Flow
    initialAssessmentDesc: "உங்கள் வாசிப்பு, எழுதுதல் மற்றும் புரிதல் திறனை மதிப்பிடுவதற்கு தயவுசெய்து ஆரம்ப மதிப்பீட்டுடன் தொடங்குங்கள்.",
    takeAssessmentBtn: "ஆரம்ப மதிப்பீட்டைத் தொடங்கு",
    stepTitle: "கேள்வி {current}-ல் {total}",
    questionOf: "கேள்வி {current} / {total}",
    readingSecTitle: "வாசிப்புப் பிரிவு (குரல்)",
    compSecTitle: "புரிதல் பிரிவு (MCQ)",
    writingSecTitle: "எழுதுதல் பிரிவு (டிக்டேஷன்)",
    micBtnStart: "வாசிக்கத் தொடங்குங்கள்",
    home: "முகப்பு",
    profileSettings: "சுயவிவர அமைப்புகள்",
    takeAssessment: "மதிப்பீடு செய்ய",
    micBtnListening: "கேட்கிறது... இப்போது வாசியுங்கள்!",
    micBtnStopped: "பேச்சு நிறுத்தப்பட்டது",
    monkeyTypeTip: "வழிமுறைகள்: பொத்தானைக் கிளிக் செய்து கீழே உள்ள வாக்கியத்தைத் தெளிவாக வாசிக்கவும். சரியான வார்த்தைகள் பச்சையாகவும், தவறானவை சிவப்பாகவும் மாறும்.",
    nextQuestion: "அடுத்த கேள்வி",
    submitAssessmentBtn: "மதிப்பீட்டை சமர்ப்பி",
    resultsTitle: "மதிப்பீடு முடிந்தது!",
    overallScore: "ஒட்டுமொத்த மதிப்பெண்",
    percentage: "சதவீதம்",
    diagnosedLevelTitle: "கண்டறியப்பட்ட எழுத்தறிவு நிலை",
    readingSkill: "வாசிப்புத் திறன்",
    writingSkill: "எழுதும் திறன்",
    compSkill: "புரிதல் திறன்",
    diagnosticPassed: "மதிப்பீடு பகுப்பாய்வு செய்யப்பட்டது! உங்கள் திறமையின் அடிப்படையில் உங்களது நிலை:",
    continueToDashboard: "டாஷ்போர்டுக்குத் திரும்பு",
    skipVoiceBtn: "கைமுறை பொருத்தம்",
    skipVoicePrompt: "குரல் ஏற்பிப் பிரச்சனையா? அதற்குப் பதிலாக டைப் செய்யவும் செய்தி:",
    writeInEnglishPrompt: "(தயவுசெய்து உங்கள் பதிலை ஆங்கிலத்தில் எழுதவும்)",
    listenBtn: "கேளுங்கள்",
    dictationTip: "பிளேயை அழுத்தி, நீங்கள் கேட்ட வாக்கியத்தை எழுதுங்கள்.",
    myProfile: "என் சுயவிவரம்",
    dashboard: "டாஷ்போர்டு",
    prevBtn: "முந்தைய",

    // Dashboard tabs
    tabProgress: "📊 எனது செயல்பாடு",
    tabProfile: "👤 சுயவிவர அமைப்புகள்",

    // Progress Dashboard
    overallLevel: "கண்டறியப்பட்ட எழுத்தறிவு நிலை",
    skillBreakdown: "அடிப்படைத் திறன்களின் தேர்ச்சி",
    badgesEarned: "சாதனை பேட்ஜ்கள்",
    attemptHistory: "மதிப்பீட்டு முடிவுகளின் விவரங்கள்",
    historyDate: "தேதி",
    historyScore: "மதிப்பெண்",
    historyType: "வகை",
    historyStatus: "முடிவு",

    personalizedInsights: "உங்கள் தனிப்பட்ட நுண்ணறிவுகள்",
    strongAreas: "வலுவான பகுதிகள்",
    areasToImprove: "மேம்படுத்த வேண்டிய பகுதிகள்",
    dailyCommitment: "பரிந்துரைக்கப்பட்ட தினசரி உறுதிப்பாடு",
    noAreasToImprove: "எதுவுமில்லை - சிறப்பைத் தொடர பயிற்சி செய்யுங்கள்!",
    skillLetterRecognition: "எழுத்தறிதல்",
    skillWordRecognition: "சொல் அறிதல்",
    skillSentenceReading: "வாக்கிய வாசிப்பு",
    skillComprehension: "புரிதல்",
    skillWriting: "எழுத்து",
    skillPronunciation: "உச்சரிப்பு",
    daily10min: "10 நிமிடங்கள்/நாள்",
    daily15min: "15 நிமிடங்கள்/நாள்",
    daily25min: "25 நிமிடங்கள்/நாள்",
    viewLearningPath: "கற்றல் பாதையைக் காண்க"
  }
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

const hasCompletedAssessment = (userProfile) => {
  return userProfile?.assessment_completed === true || getLiteracyLevel(userProfile) !== null;
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

const levelBadgeColor = (level) => {
  const colors = {
    1: "#10b981",
    2: "#3b82f6",
    3: "#f59e0b",
    4: "#a855f7",
    5: "#ef4444"
  };
  return colors[level] || "#6b7280";
};

const levelBadgeIcon = (level) => {
  const icons = {
    1: "🌱",
    2: "📖",
    3: "✍️",
    4: "🧠",
    5: "👑"
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

function App() {
  const [selectedLanguage, setSelectedLanguage] = useState(
    localStorage.getItem("lisa_lang") || null
  );
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);

  const [streakPopupOpen, setStreakPopupOpen] = useState(false);
  const streakPopupRef = useRef(null);

  const [activeLessonPopup, setActiveLessonPopup] = useState(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileDropdownOpen && profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
      if (streakPopupOpen && streakPopupRef.current && !streakPopupRef.current.contains(e.target)) {
        setStreakPopupOpen(false);
      }
      if (activeLessonPopup && !e.target.closest('.duo-node-container')) {
        setActiveLessonPopup(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileDropdownOpen, streakPopupOpen, activeLessonPopup]);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profileBg, setProfileBg] = useState("#e86b6b");
  const [profileAvatar, setProfileAvatar] = useState("/as1.png");
  const [isEditingCover, setIsEditingCover] = useState(false);
  const [activeTab, setActiveTab] = useState("login"); // "login", "register", "forgot"
  const [dashboardTab, setDashboardTab] = useState("dashboard"); // "dashboard", "learn", "practice", "profile"
  const [activeSection, setActiveSection] = useState(0); // paginated section in learn tab
  const learnJourneyRef = useRef(null);
  const activeNodeRef = useRef(null);

  const [userXp, setUserXp] = useState(0);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [lessonSession, setLessonSession] = useState(null);
  const [streakCount, setStreakCount] = useState(0);
  const [wordOfDay, setWordOfDay] = useState({ word: "Diligent", example: "A diligent student practices reading a little every day." });

  const [dailyXp, setDailyXp] = useState(0);
  const [dailyTimeSpent, setDailyTimeSpent] = useState(0); // in seconds
  const [dailyLessons, setDailyLessons] = useState(0);
  const [activeQuests, setActiveQuests] = useState([]);
  const [timeLeftStr, setTimeLeftStr] = useState("24h 00m 00s");

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
        displayProgress: `${dailyLessons}/${quest.target} ${quest.target === 1 ? 'lesson' : 'lessons'}`
      };
    }
    return { current: 0, target: 1, completed: false, percent: 0, displayProgress: '0/1' };
  };

  useEffect(() => {
    if (!session?.user?.id) return;
    const userId = session.user.id;
    const today = new Date().toLocaleDateString("en-CA");
    
    const storedDailyXp = localStorage.getItem(`lisa_daily_xp_${userId}_${today}`);
    const storedDailyTime = localStorage.getItem(`lisa_daily_time_${userId}_${today}`);
    const storedDailyLessons = localStorage.getItem(`lisa_daily_lessons_${userId}_${today}`);
    
    setDailyXp(storedDailyXp ? parseInt(storedDailyXp, 10) : 0);
    setDailyTimeSpent(storedDailyTime ? parseInt(storedDailyTime, 10) : 0);
    setDailyLessons(storedDailyLessons ? parseInt(storedDailyLessons, 10) : 0);

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
  }, [session?.user?.id]);

  useEffect(() => {
    if (!session?.user?.id) return;
    const userId = session.user.id;
    
    const timer = setInterval(() => {
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
      const res = await fetchWordOfDay(selectedLanguage || "English");
      if (active && res) {
        setWordOfDay(res);
      }
    };
    loadWordOfDay();
    return () => { active = false; };
  }, [selectedLanguage]);

  useEffect(() => {
    if (profile?.avatar_url) {
      setProfileAvatar(profile.avatar_url);
    }
  }, [profile?.avatar_url]);

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
      } catch {}
      if (!activeDates.includes(today)) {
        activeDates.push(today);
        localStorage.setItem(`lisa_active_dates_${userId}`, JSON.stringify(activeDates));
      }

      setStreakCount(newStreak);

      await supabase
        .from("profiles")
        .update({
          streak: newStreak,
          last_active_date: today
        })
        .eq("id", userId);

      setProfile(prev => prev ? { ...prev, streak: newStreak, last_active_date: today } : null);
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

    const todayStr = new Date().toLocaleDateString("en-CA");
    const lastActiveLocal = localStorage.getItem(`lisa_last_active_date_${userId}`);
    if (lastActiveLocal === todayStr && !activeDates.includes(todayStr)) {
      activeDates.push(todayStr);
      try {
        localStorage.setItem(`lisa_active_dates_${userId}`, JSON.stringify(activeDates));
      } catch {}
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
        isCompleted: activeDates.includes(dateStr),
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
      const av = localStorage.getItem(`lisa_profile_avatar_${userId}`) || "/as1.png";
      setProfileBg(bg);
      setProfileAvatar(av);
    } else {
      setUserXp(0);
      setCompletedLessons([]);
      setStreakCount(0);
      setProfileBg("#e86b6b");
      setProfileAvatar("/as1.png");
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

  const completeLesson = async (lessonId, xpAwarded) => {

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

    // Update completed lessons
    let newLessons = completedLessons;
    if (!completedLessons.includes(lessonId)) {
      newLessons = [...completedLessons, lessonId];
      setCompletedLessons(newLessons);
      localStorage.setItem(`lisa_completed_lessons_${userId}`, JSON.stringify(newLessons));
    }

    // Update daily lessons completed
    const storedDailyLessons = localStorage.getItem(`lisa_daily_lessons_${userId}_${todayStr}`);
    const nextDailyLessons = (storedDailyLessons ? parseInt(storedDailyLessons, 10) : 0) + 1;
    setDailyLessons(nextDailyLessons);
    localStorage.setItem(`lisa_daily_lessons_${userId}_${todayStr}`, nextDailyLessons);

    // Save active dates
    const today = new Date().toLocaleDateString("en-CA");
    let activeDates = [];
    try {
      const stored = localStorage.getItem(`lisa_active_dates_${userId}`);
      activeDates = stored ? JSON.parse(stored) : [];
    } catch {}
    if (!activeDates.includes(today)) {
      activeDates.push(today);
      localStorage.setItem(`lisa_active_dates_${userId}`, JSON.stringify(activeDates));
    }

    // Refresh day streak in real-time
    updateStreak(userId, profile);

    // Sync XP and completed lessons list to the database
    try {
      await supabase
        .from("profiles")
        .update({
          xp: newXp,
          completed_lessons: newLessons
        })
        .eq("id", userId);
    } catch (dbErr) {
      console.warn("Could not sync lesson progress to Supabase:", dbErr);
    }
  };

  // AI-powered lesson session starter
  const startLessonSession = async (lesson, sectionInfo, unitInfo) => {
    setLessonLoading(true);
    setLessonStep(0);
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
    setLessonSession({
      lessonId: lesson.id,
      title: lesson.title,
      sectionNum: sectionInfo?.num || 1,
      sectionTitle: sectionInfo?.title || "",
      unitNum: unitInfo?.num || 1,
      unitTitle: unitInfo?.title || "",
      lessonNum: lesson.num || 1,
      status: "loading",
      feedback: null
    });

    const storedSkillScores = (() => {
      try {
        const stored = getStoredAssessmentState(session?.user?.id);
        return stored?.skill_scores || profile?.skill_scores || {};
      } catch { return {}; }
    })();
    const weakAreas = getWeakSkills(storedSkillScores);
    const currentLevelNum = getLiteracyLevel(profile) || 1;
    const profInfo = getProficiencyName(currentLevelNum, "English");

    const aiContent = await generateLessonContent({
      age: profile?.age || 25,
      educationLevel: profile?.education_level || "No formal education",
      language: selectedLanguage || "English",
      literacyLevel: currentLevelNum,
      literacyLevelName: profInfo?.name || "Beginner",
      weakAreas,
      sectionNum: sectionInfo?.num || 1,
      sectionTitle: sectionInfo?.title || "",
      unitNum: unitInfo?.num || 1,
      unitTitle: unitInfo?.title || "",
      lessonNum: lesson.num || 1,
      lessonTitle: lesson.title || "",
      difficulty: currentLevelNum <= 2 ? "beginner" : currentLevelNum <= 4 ? "intermediate" : "advanced"
    });

    setLessonAiContent(aiContent);
    setLessonSession(prev => prev ? ({ ...prev, status: "active" }) : null);
    setLessonLoading(false);
  };


  // AI Lesson step handlers
  const advanceLessonStep = () => {
    const totalSteps = 5; // 0=explanation, 1=MCQs, 2=fillBlanks, 3=reading+writing, 4=complete
    if (lessonStep < totalSteps - 1) {
      setLessonStep(prev => prev + 1);
    } else {
      // Complete the lesson
      const isExam = lessonSession?.lessonId?.endsWith("l5");
      completeLesson(lessonSession?.lessonId, isExam ? 60 : 15);
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
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
    localStorage.setItem("lisa_theme", isDark ? "dark" : "light");
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  // Initial Assessment states
  const [assessmentState, setAssessmentState] = useState("not_started"); // "not_started" | "answering" | "results"
  const [assessmentQuestionsList, setAssessmentQuestionsList] = useState([]);
  const [currentStep, setCurrentStep] = useState(0); // 0-4
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { index: optionIndex }
  const [writingAnswers, setWritingAnswers] = useState({}); // { index: "user text" }
  const [readingAttempts, setReadingAttempts] = useState({}); // { index: { matchedCount, totalWords, transcript, scores } }

  // Voice speech states
  const [isListening, setIsListening] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState("");
  const [micError, setMicError] = useState("");
  const [manualTextFallback, setManualTextFallback] = useState("");
  const recognitionRef = useRef(null);

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
  const [editEdLevel, setEditEdLevel] = useState("");

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
    setEditEdLevel(profile.education_level || "No formal education");
  }, [profile]);

  const t = (key) => {
    const lang = selectedLanguage || "English";
    const dict = translations[lang] || translations["English"];
    if (key === "successForgotPasswordLink") {
      return lang === "Hindi" ? "पासवर्ड रीसेट लिंक भेजा गया! कृपया अपना ईमेल जांचें।" :
        lang === "Kannada" ? "ಪಾಸ್‌ವರ್ಡ್ ಮರುಹೊಂದಿಸುವ ಲಿಂಕ್ ಕಳುಹಿಸಲಾಗಿದೆ! ಇಮೇಲ್ ಪರಿಶೀಲಿಸಿ." :
          lang === "Telugu" ? "పాస్‌వర్డ్ రీసెట్ లింక్ పంపబడింది! దయచేసి ఇమెయిల్ తనిఖీ చేయండి." :
            lang === "Tamil" ? "கடவுச்சொல் மீட்பு இணைப்பு அனுப்பப்பட்டது! மின்னஞ்சலைச் சரிபார்க்கவும்." :
              "Password reset link sent! Please check your email.";
    }
    if (key === "successResetPassword") {
      return lang === "Hindi" ? "पासवर्ड रीसेट सफल रहा! अब आप लॉगिन कर सकते हैं।" :
        lang === "Kannada" ? "ಪಾಸ್‌ವರ್ಡ್ ಮರುಹೊಂದಿಕೆ ಯಶಸ್ವಿಯಾಗಿದೆ! ನೀವು ಈಗ ಲಾಗಿನ್ ಮಾಡಬಹುದು." :
          lang === "Telugu" ? "పాస్‌వర్డ్ రీసెట్ విజయవంతమైంది! మీరు ఇప్పుడు లాగిన్ చేయవచ్చు." :
            lang === "Tamil" ? "கடவுச்சொல் மீட்டமைக்கப்பட்டது! நீங்கள் இப்போது உள்நுழையலாம்." :
              "Password reset successfully! You can now log in.";
    }
    return dict[key] || translations["English"][key] || key;
  };

  useEffect(() => {
    // Load ResponsiveVoice client script on initial mount
    if (!window.responsiveVoice) {
      const script = document.createElement("script");
      script.src = "https://code.responsivevoice.org/responsivevoice.js?key=8Q7W8t4L";
      script.async = true;
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
          default:
            document.title = "LISA | AI Literacy Companion";
        }
      }
    }
  }, [session, selectedLanguage, recoveryMode, activeTab, assessmentState, lessonSession, dashboardTab]);

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
  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.warn("Could not fetch profile, setting default session:", error.message);
        const storedAssessment = getStoredAssessmentState(userId);
        // Fallback for demo users
        const defaultProfile = {
          id: userId,
          full_name: session?.user?.user_metadata?.full_name || session?.user?.email || "Learner",
          age: session?.user?.user_metadata?.age || 20,
          preferred_language: session?.user?.user_metadata?.preferred_language || selectedLanguage || "English",
          education_level: session?.user?.user_metadata?.education_level || "No formal education",
          literacy_level: storedAssessment?.literacy_level ?? null,
          assessment_completed: storedAssessment?.assessment_completed ?? false,
          xp: 0,
          completed_lessons: [],
          attempts_history: []
        };
        setProfile(defaultProfile);
        updateStreak(userId, defaultProfile);
      } else {
        const storedAssessment = getStoredAssessmentState(userId);
        const mergedProfile = storedAssessment
          ? {
            ...data,
            literacy_level: data.literacy_level ?? storedAssessment.literacy_level ?? null,
            assessment_completed: data.assessment_completed ?? storedAssessment.assessment_completed ?? false
          }
          : data;

        setProfile(mergedProfile);
        updateStreak(userId, mergedProfile);

        // Load progress and preferences from the database, updating both React state and localStorage cache
        if (mergedProfile.xp !== undefined && mergedProfile.xp !== null) {
          setUserXp(Number(mergedProfile.xp));
          localStorage.setItem(`lisa_user_xp_${userId}`, mergedProfile.xp);
        }
        if (mergedProfile.completed_lessons) {
          const lessonsList = Array.isArray(mergedProfile.completed_lessons) ? mergedProfile.completed_lessons : [];
          setCompletedLessons(lessonsList);
          localStorage.setItem(`lisa_completed_lessons_${userId}`, JSON.stringify(lessonsList));
        }
        if (mergedProfile.attempts_history) {
          const historyList = Array.isArray(mergedProfile.attempts_history) ? mergedProfile.attempts_history : [];
          setHistoryAttempts(historyList);
          localStorage.setItem("lisa_attempts_history", JSON.stringify(historyList));
        }
        if (mergedProfile.profile_bg) {
          setProfileBg(mergedProfile.profile_bg);
          localStorage.setItem(`lisa_profile_bg_${userId}`, mergedProfile.profile_bg);
        }
        if (mergedProfile.avatar_url) {
          setProfileAvatar(mergedProfile.avatar_url);
          localStorage.setItem(`lisa_profile_avatar_${userId}`, mergedProfile.avatar_url);
        }

        // Sync locally selected language from login screen to database profile
        const localLang = localStorage.getItem("lisa_lang") || selectedLanguage || "English";
        if (localLang && mergedProfile.preferred_language !== localLang) {
          await supabase.from("profiles").update({ preferred_language: localLang }).eq("id", userId);
          setProfile(prev => prev ? { ...prev, preferred_language: localLang } : null);
          setSelectedLanguage(localLang);
        } else if (mergedProfile.preferred_language) {
          setSelectedLanguage(mergedProfile.preferred_language);
          localStorage.setItem("lisa_lang", mergedProfile.preferred_language);
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
        console.error("Error saving profile language preference:", err);
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
    const language = formData.get("language");
    const educationLevel = formData.get("educationLevel");

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
          preferred_language: language,
          education_level: educationLevel,
        },
      },
    });

    if (error) {
      setMessage(`Registration error: ${error.message}`);
      setSubmitting(false);
      return;
    }

    if (data.user) {
      if (data.session) {
        setMessage(t("successAccountCreated"));
        const newProfile = {
          id: data.user.id,
          full_name: fullName,
          age,
          preferred_language: language,
          education_level: educationLevel,
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
    await supabase.auth.signOut();
    setMessage(t("successSignOut"));
    setTimeout(() => setMessage(""), 3000);
    setSubmitting(false);
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
    const assessment = getRandomAssessment(
      profile?.age || 20,
      profile?.education_level || "No formal education",
      selectedLanguage || "English"
    );
    setAssessmentQuestionsList(assessment.questions);
    setCurrentStep(0);
    setAssessmentState("answering");
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

      // Always use English (en-US) for speech recognition in the English reading assessment
      let locale = "en-US";
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

  const speakText = (text) => {
    const lang = selectedLanguage || "English";

    if (window.responsiveVoice) {
      let voiceName = "US English Female";
      if (lang === "Hindi") voiceName = "Hindi Female";
      else if (lang === "Kannada") voiceName = "Kannada Female";
      else if (lang === "Telugu") voiceName = "Telugu Female";
      else if (lang === "Tamil") voiceName = "Tamil Female";

      console.log(`Speaking using ResponsiveVoice: "${text}" with voice "${voiceName}"`);
      window.responsiveVoice.speak(text, voiceName, {
        pitch: 1,
        rate: 0.9,
        onerror: (e) => {
          console.error("ResponsiveVoice error, trying fallback:", e);
          fallbackSpeechSynthesis(text, getLocale(lang));
        }
      });
    } else {
      console.warn("ResponsiveVoice not loaded yet, falling back to native SpeechSynthesis.");
      fallbackSpeechSynthesis(text, getLocale(lang));
    }
  };

  const fallbackSpeechSynthesis = (text, locale) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = locale;

      const voices = window.speechSynthesis.getVoices();
      const matchingVoice = voices.find(v =>
        v.lang.toLowerCase() === locale.toLowerCase() ||
        v.lang.toLowerCase().replace("_", "-") === locale.toLowerCase() ||
        v.lang.toLowerCase().startsWith(locale.split("-")[0].toLowerCase())
      );
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }

      utterance.onerror = (e) => console.error("TTS SpeechSynthesisUtterance Error:", e);
      window.speechSynthesis.speak(utterance);
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

  const evaluateSpeechText = (transcript, targetText) => {
    const targetWords = targetText.split(/\s+/).filter(Boolean);
    const spokenWords = transcript.split(/\s+/).filter(Boolean).map(cleanWord);

    let matchedCount = 0;
    const scores = targetWords.map((word) => {
      const cleaned = cleanWord(word);
      const isMatched = spokenWords.includes(cleaned);
      if (isMatched) matchedCount++;
      return isMatched;
    });

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

    // Classify proficiency level (1-5) from skill averages
    const diagnosedLevel = classifyProficiency(skillScores);
    const profInfo = getProficiencyName(diagnosedLevel, "English");
    const levelString = profInfo.name;

    // Generate learning path from weak skills
    const learningPath = generateLearningPath(skillScores);
    const weakAreas = getWeakSkills(skillScores);
    const strongAreas = getStrongSkills(skillScores);
    const strongSkillKeys = getStrongSkillKeys(skillScores);
    const weakSkillKeys = getWeakSkillKeys(skillScores);

    // Compute marks out of 30: 10 comprehension MCQ (1 mark each) + 10 reading + 10 writing
    let compMarks = 0;
    let readingMarks = 0;
    let writingMarks = 0;
    assessmentQuestionsList.forEach((q, idx) => {
      if (q.type === "comprehension") {
        if (selectedAnswers[idx] === q.correctIndex) compMarks += 1;
      } else if (q.type === "reading") {
        const attempt = readingAttempts[idx];
        const ratio = (attempt && attempt.totalWords > 0) ? attempt.matchedCount / attempt.totalWords : 0;
        readingMarks = Math.round(ratio * 10);
      } else if (q.type === "writing") {
        const text = writingAnswers[idx] || "";
        const res = q.evaluator ? q.evaluator(text) : { score: 0 };
        writingMarks = res.score;
      }
    });
    const totalMarks = compMarks + readingMarks + writingMarks;
    const overallPercent = Math.round((totalMarks / 30) * 100);

    try {
      // Save to history
      const attemptResult = {
        date: new Date().toLocaleDateString(),
        type: "Diagnostic Evaluation",
        score: totalMarks,
        maxScore: 30,
        percentage: overallPercent,
        level: diagnosedLevel,
        skills: {
          reading: skillScores.sentence_reading || 0,
          comprehension: skillScores.comprehension || 0,
          writing: skillScores.writing || 0,
          letter_recognition: skillScores.letter_recognition || 0,
          word_recognition: skillScores.word_recognition || 0,
          pronunciation: skillScores.pronunciation || 0,
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
      await supabase.from("profiles").update({
        education_level: levelString,
        literacy_level: diagnosedLevel,
        assessment_completed: true,
        attempts_history: updatedHistory
      }).eq("id", session.user.id);

      // Update local state
      setProfile(prev => ({
        ...prev,
        education_level: levelString,
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
          education_level: editEdLevel
        })
        .eq("id", session.user.id);

      if (error) {
        console.warn("DB profile save error, caching:", error.message);
      }

      setProfile(prev => ({
        ...prev,
        full_name: editFullName,
        age: parseInt(editAge, 10),
        preferred_language: editPreferredLang,
        education_level: editEdLevel
      }));
      setSelectedLanguage(editPreferredLang);
      localStorage.setItem("lisa_lang", editPreferredLang);
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
    setEditEdLevel(profile?.education_level || "No formal education");
    setEditingProfile(true);
  };

  const handleResetAssessmentStatus = async () => {
    try {
      const primaryUpdate = await supabase
        .from("profiles")
        .update({
          education_level: "No formal education",
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
          .update({ education_level: "No formal education" })
          .eq("id", session.user.id);
        error = retry.error;
      }

      if (error) throw error;

      setProfile(prev => prev ? {
        ...prev,
        education_level: "No formal education",
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
        <div className="lang-selector-dropdown">
          {[
            { key: "English", native: "English" },
            { key: "Hindi", native: "हिन्दी" },
            { key: "Kannada", native: "ಕನ್ನಡ" },
            { key: "Telugu", native: "తెలుగు" },
            { key: "Tamil", native: "தமிழ்" },
          ].map((lang) => (
            <button
              key={lang.key}
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
        setEditEdLevel(profile?.education_level || "No formal education");
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
            fontWeight: '800'
          }}>
            {getUserInitials(profile?.full_name)}
          </span>
          <span className="profile-trigger-text">{t("myProfile") || "My Profile"}</span>
          <span className="dropdown-arrow" style={{ fontSize: '0.8rem', opacity: 0.7 }}>▼</span>
        </button>
        {profileDropdownOpen && (
          <div className="profile-dropdown-menu profile-dropdown-card" style={{ right: 0, padding: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 16px 0', color: 'var(--text)' }}>
              Update Profile Settings
            </h3>
            <form onSubmit={(e) => {
              handleSaveProfileEdit(e);
              setProfileDropdownOpen(false);
            }} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label className="profile-dropdown-label">
                Full Name
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  style={{ width: "100%", boxSizing: "border-box" }}
                />
              </label>
              
              <label className="profile-dropdown-label">
                Age
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
                Preferred Language
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
                Current Education Status
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

              <button
                type="submit"
                className="primary-btn"
                style={{ width: '100%', padding: '10px', borderRadius: '12px', background: 'var(--accent)', color: '#fff', border: 'none', fontWeight: '700', cursor: 'pointer', marginTop: '4px' }}
                disabled={submitting}
              >
                {submitting ? "Saving..." : "Save Changes"}
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
              🚪 {t("logout") || "Log Out"}
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
        {renderThemeToggle()}
        {renderLanguageDropdown()}
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
    const hasDiagnosed = hasCompletedAssessment(profile);
    const currentLevelNum = getLiteracyLevel(profile) || 1;
    const currentLang = selectedLanguage || "English";

    const currentLevelSections = lessonsData[currentLevelNum] || [];
    const currentLevelLessons = currentLevelSections.flatMap((s) => s.units.flatMap((u) => u.lessons));
    const startingLessonId = (() => {
      const level = currentLevelNum;
      if (level === 2) return "s2u1l1";
      if (level === 3) return "s3u1l1";
      if (level === 4) return "s5u1l1";
      if (level === 5) return "s7u1l1";
      return "s1u1l1";
    })();
    const startingLessonIndex = currentLevelLessons.findIndex(l => l.id === startingLessonId);

    const currentUnitIdx = (() => {
      const startSearchIdx = startingLessonIndex !== -1 ? startingLessonIndex : 0;
      const firstIncomplete = currentLevelLessons.slice(startSearchIdx).findIndex((l) => !completedLessons.includes(l.id));
      if (firstIncomplete === -1) {
        return Math.max(currentLevelLessons.length - 1, 0);
      }
      return startSearchIdx + firstIncomplete;
    })();
    const currentUnit = currentLevelLessons[currentUnitIdx];

    const currentUnitPos = (() => {
      let remaining = currentUnitIdx;
      for (let s = 0; s < currentLevelSections.length; s++) {
        const units = currentLevelSections[s].units;
        const sectionLessonCount = units.reduce((a, u) => a + u.lessons.length, 0);
        if (remaining < sectionLessonCount) {
          let r2 = remaining;
          for (let u = 0; u < units.length; u++) {
            const len = units[u].lessons.length;
            if (r2 < len) return { sectionIdx: s, unitIdx: u, lessonIdx: r2 };
            r2 -= len;
          }
        }
        remaining -= sectionLessonCount;
      }
      return { sectionIdx: 0, unitIdx: 0, lessonIdx: 0 };
    })();



    const speakWord = (text) => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        const u = new SpeechSynthesisUtterance(text);
        u.lang = getLocale(selectedLanguage);
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(u);
      }
    };

    if (!hasDiagnosed || assessmentState !== "not_started") {
      return (
        <div className="dashboard-container">
          {/* Navigation Top Bar Header */}
          <header className="dashboard-header" style={{ background: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '16px 32px', borderBottom: '1px solid var(--line)' }}>
            {/* Brand Logo & Info (same design as login page) */}
            <div className="brand-logo-top dashboard-brand">
              LISA
              <span className="brand-logo-tagline">Literacy Intelligence Support Assistant</span>
            </div>

            {/* Right User Actions Area */}
            <div className="dashboard-user-actions" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              {renderThemeToggle()}
              {renderLanguageDropdown(true)}
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
                const readIdx = typeIndices.reading[0];
                const writeIdx = typeIndices.writing[0];

                const currentSectionNum = isWriting ? 3 : isVoiceReading ? 2 : 1;

                const compCompleted = compIdx.length > 0 && compIdx.every((i) => selectedAnswers[i] !== undefined);
                const readCompleted = !!readingAttempts[readIdx];
                const writeCompleted = !!(writingAnswers[writeIdx] || "").trim();

                const sectionMeta = [
                  { num: 1, title: t("compSecTitle"), done: compCompleted },
                  { num: 2, title: t("readingSecTitle"), done: readCompleted },
                  { num: 3, title: t("writingSecTitle"), done: writeCompleted },
                ];

                // 1. Resolve reading targetText
                const readingTargetText = isVoiceReading
                  ? (q.rawQuestion?.reading?.["English"] || "Read this text aloud.")
                  : "";

                // 2. Resolve comprehension question & options
                const compQuestionText = isCompMCQ
                  ? (q.rawQuestion?.question?.[selectedLanguage] || q.rawQuestion?.question?.["English"] || "")
                  : "";

                const optionTranslationMap = {
                  Ship: { Hindi: "जहाज", Kannada: "ಹಡಗು", Telugu: "ఓడ", Tamil: "கப்பல்" },
                  Crop: { Hindi: "फसल", Kannada: "ಬೆಳೆ", Telugu: "పంట", Tamil: "பயிர்" },
                  Soap: { Hindi: "साबुन", Kannada: "ಸೋಪು", Telugu: "సబ్బు", Tamil: "சோப்பு" },
                  Shut: { Hindi: "बंद", Kannada: "ಮುಚ್ಚು", Telugu: "మూసిವೇయి", Tamil: "மூடு" },
                  Shop: { Hindi: "दुकान", Kannada: "ಅಂಗಡಿ", Telugu: "ದುಕಾణం", Tamil: "கடை" },
                  Book: { Hindi: "किताब", Kannada: "ಪುಸ್ತಕ", Telugu: "ಪುಸ್ತಕಂ", Tamil: "புத்தகம்" },
                  Pen: { Hindi: "कलम", Kannada: "ಪೇನಾ", Telugu: "పెన్ను", Tamil: "பேனா" },
                  Read: { Hindi: "पढ़ना", Kannada: "ಓದು", Telugu: "చదవడం", Tamil: "வாசி" },
                  Write: { Hindi: "लिखना", Kannada: "ಬರೆ", Telugu: "రాయడం", Tamil: "எழுது" },
                  Speak: { Hindi: "बोलना", Kannada: "ಮಾತನಾಡು", Telugu: "ಮಾట్లాಡటం", Tamil: "பேசு" },
                  Listen: { Hindi: "सुनना", Kannada: "ಕೇಳು", Telugu: "వినడం", Tamil: "கேள்" },
                  Word: { Hindi: "शब्द", Kannada: "ಪದ", Telugu: "పదం", Tamil: "வார்த்தை" },
                  Letter: { Hindi: "अक्षर", Kannada: "ಅಕ್ಷರ", Telugu: "అక్షరం", Tamil: "எழுத்து" },
                  Sentence: { Hindi: "वाक्य", Kannada: "ವಾಕ್ಯ", Telugu: "వాక్యం", Tamil: "வாக்கியம்" },
                  Name: { Hindi: "नाम", Kannada: "ಹೆಸರು", Telugu: "పేరు", Tamil: "பெயர்" },
                  Day: { Hindi: "दिन", Kannada: "ದಿನ", Telugu: "రోజు", Tamil: "நாள்" },
                  Night: { Hindi: "रात", Kannada: "ರಾತ್ರಿ", Telugu: "రాత్రి", Tamil: "இரவு" },
                  Food: { Hindi: "भोजन", Kannada: "आहार", Telugu: "ఆహారం", Tamil: "உணவு" },
                  Water: { Hindi: "पानी", Kannada: "ನೀರು", Telugu: "నీరు", Tamil: "தண்ணீர்" },
                  Milk: { Hindi: "दूध", Kannada: "ಹಾಲು", Telugu: "పాలు", Tamil: "பால்" }
                };

                const compOptions = isCompMCQ
                  ? q.shuffledIndices.map((originalIdx) => {
                    const engOpt = q.rawQuestion?.options?.["English"]?.[originalIdx] || "";
                    const transOpt = q.rawQuestion?.options?.[selectedLanguage]?.[originalIdx] || "";

                    if (selectedLanguage === "English") return engOpt;

                    // If transOpt already includes regional translations like "Lose (ಕಳೆದುಕೋ)", just use it directly
                    if (transOpt && engOpt !== transOpt) {
                      return transOpt;
                    }

                    // Otherwise check our translation fallback
                    const cleanKey = engOpt.trim();
                    const fallbackTrans = optionTranslationMap[cleanKey]?.[selectedLanguage];
                    if (fallbackTrans) {
                      return `${engOpt} (${fallbackTrans})`;
                    }
                    return engOpt;
                  })
                  : [];

                // 3. Resolve writing prompt + dictation sentence
                const writingPromptText = isWriting
                  ? (q.rawQuestion?.writing?.[selectedLanguage] || q.rawQuestion?.writing?.["English"] || "")
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
                              🔊 {t("listenBtn") || "Listen"}
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
                            <p className="comprehension-question" style={{ margin: 0, flex: 1, fontWeight: 700, fontSize: "1.2rem" }}>{compQuestionText}</p>
                            <button
                              type="button"
                              className="tts-btn"
                              onClick={() => speakText(compQuestionText)}
                              title="Listen to question"
                            >
                              🔊 {t("listenBtn") || "Listen"}
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
                                  onClick={() => setSelectedAnswers({ ...selectedAnswers, [currentStep]: idx })}
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
                              <p className="writing-prompt" style={{ margin: 0, fontWeight: 700, fontSize: "1.2rem" }}>{writingPromptText}</p>
                              <p className="helper-text" style={{ margin: '8px 0 0' }}>{t("dictationTip") || "Press play and write the sentence you hear."}</p>
                            </div>
                            <button
                              type="button"
                              className="tts-btn dictation-play"
                              onClick={() => speakText(dictationText)}
                              title="Listen to the sentence"
                            >
                              🔊 {t("listenBtn") || "Listen"}
                            </button>
                          </div>
                          <textarea
                            className="writing-textarea"
                            placeholder="Write the sentence you heard here..."
                            rows={6}
                            value={writingAnswers[currentStep] || ""}
                            onChange={(e) => setWritingAnswers({ ...writingAnswers, [currentStep]: e.target.value })}
                          />
                          <div className="text-counter">
                            Characters: {(writingAnswers[currentStep] || "").length} | Words: {(writingAnswers[currentStep] || "").split(/\s+/).filter(Boolean).length}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="assessment-nav-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: '12px' }}>
                      <div>
                        {currentStep > 0 && (
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

                // New 6-skill analysis
                const strongKeys = latestAttempt?.strongSkillKeys || getStrongSkillKeys(skillScores);
                const weakKeys = latestAttempt?.weakSkillKeys || getWeakSkillKeys(skillScores);

                // Recommend Daily Practice Time
                let dailyPracticeTime = t("daily15min");
                if (overallPercent >= 90) dailyPracticeTime = t("daily10min");
                else if (overallPercent < 50) dailyPracticeTime = t("daily25min");

                const skillOrder = [
                  { key: "letter_recognition", label: "Letter Recognition", color: "#f59e0b", icon: "🔤" },
                  { key: "word_recognition",   label: "Word Recognition",   color: "#3b82f6", icon: "📝" },
                  { key: "sentence_reading",   label: "Sentence Reading",   color: "#10b981", icon: "📖" },
                  { key: "comprehension",       label: "Comprehension",       color: "#8b5cf6", icon: "🧠" },
                  { key: "writing",             label: "Writing",             color: "#ef4444", icon: "✍️" },
                  { key: "pronunciation",       label: "Pronunciation",       color: "#06b6d4", icon: "🎤" },
                ];


                return (
                  <div className="results-card" style={{ maxWidth: '800px', margin: '20px auto' }}>
                    <h2 className="results-completed-title">{t("resultsTitle")}</h2>
                    <div className="results-hero-section">
                      <div className="results-hero-left">
                        <div className="results-percentage-circle">
                          <span className="percent-val">{latestAttempt?.percentage ? latestAttempt.percentage : 0}%</span>
                        </div>
                        <span className="results-percent-text">{t("percentage")}</span>
                      </div>

                      <div className="results-hero-center-score">
                        <span className="hero-score-label">{t("overallScore")}</span>
                        <span className="hero-score-val">{latestAttempt?.score || 0} / {latestAttempt?.maxScore || 30}</span>
                      </div>

                      <div className="results-hero-right">
                        <img
                          src="/as3.png"
                          alt="LISA mascot"
                          className="assessment-mascot results-mascot-medium"
                        />
                      </div>
                    </div>

                    <div className="results-detail-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div className="benchmark-card" style={{ margin: 0 }}>
                        <div className="benchmark-badge-icon">🎖️</div>
                        <h3 className="benchmark-title">{getLevelCategoryAndDescription(currentLevelIndex, currentLang).category}</h3>
                        <p className="benchmark-desc">
                          {getLevelCategoryAndDescription(currentLevelIndex, currentLang).description}
                        </p>
                      </div>

                      <div className="skill-breakdowns-box" style={{ margin: 0 }}>
                        <h3>{t("skillBreakdown")}</h3>
                        <div className="skill-progress-bar">
                          <div className="skill-progress-label">
                            <span>{t("readingSkill")}</span>
                            <span>{latestAttempt?.skills?.reading || 0}%</span>
                          </div>
                          <div className="bar-bg">
                            <div className="bar-fill reading" style={{ width: `${latestAttempt?.skills?.reading || 0}%` }}></div>
                          </div>
                        </div>
                        <div className="skill-progress-bar">
                          <div className="skill-progress-label">
                            <span>{t("compSkill")}</span>
                            <span>{latestAttempt?.skills?.comprehension || 0}%</span>
                          </div>
                          <div className="bar-bg">
                            <div className="bar-fill comprehension" style={{ width: `${latestAttempt?.skills?.comprehension || 0}%` }}></div>
                          </div>
                        </div>
                        <div className="skill-progress-bar">
                          <div className="skill-progress-label">
                            <span>{t("writingSkill")}</span>
                            <span>{latestAttempt?.skills?.writing || 0}%</span>
                          </div>
                          <div className="bar-bg">
                            <div className="bar-fill writing" style={{ width: `${latestAttempt?.skills?.writing || 0}%` }}></div>
                          </div>
                        </div>
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
                          <ul>
                            {strongKeys.map((k) => <li key={k}>{t(SKILL_TRANSLATION_KEYS[k])}</li>)}
                          </ul>
                        </div>

                        <div className="insight-box insight-improve">
                          <div className="insight-badge">⚠️</div>
                          <h4>{t("areasToImprove")}</h4>
                          <ul>
                            {weakKeys.length > 0
                              ? weakKeys.map((k) => <li key={k}>{t(SKILL_TRANSLATION_KEYS[k])}</li>)
                              : <li>{t("noAreasToImprove")}</li>}
                          </ul>
                        </div>

                        <div className="insight-box insight-time">
                          <div className="insight-badge">🕒</div>
                          <h4>{t("dailyCommitment")}</h4>
                          <p className="insight-time-val">{dailyPracticeTime}</p>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '32px' }}>
                      <button
                        type="button"
                        className="primary-btn"
                        style={{ background: 'var(--accent)', border: 'none', color: 'white', padding: '12px 24px', borderRadius: '12px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', flex: 1, maxWidth: '300px' }}
                        onClick={() => {
                          setDashboardTab("learn");
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
        {/* Left Navigation Sidebar */}
        <aside className="dashboard-sidebar">
          <div className="sidebar-logo" style={{ color: 'var(--accent)', cursor: 'default' }}>
            LISA
          </div>
          <div className="sidebar-menu">
            <button
              type="button"
              className={`sidebar-item ${dashboardTab === "dashboard" ? "active" : ""}`}
              onClick={() => setDashboardTab("dashboard")}
            >
              <DashboardIcon /> Dashboard
            </button>
            <button
              type="button"
              className={`sidebar-item ${dashboardTab === "learn" ? "active" : ""}`}
              onClick={() => setDashboardTab("learn")}
            >
              <LearnIcon /> Learn
            </button>
            <button
              type="button"
              className={`sidebar-item ${dashboardTab === "practice" ? "active" : ""}`}
              onClick={() => setDashboardTab("practice")}
            >
              <PracticeIcon /> Practice
            </button>
            <button
              type="button"
              className={`sidebar-item ${dashboardTab === "profile" ? "active" : ""}`}
              onClick={() => setDashboardTab("profile")}
              style={{ display: 'flex', alignItems: 'center' }}
            >
              {profileAvatar && profileAvatar.startsWith("http") ? (
                <img 
                  src={profileAvatar} 
                  alt="Profile" 
                  style={{ 
                    width: "28px", 
                    height: "28px", 
                    borderRadius: "50%", 
                    objectFit: "cover", 
                    marginRight: "10px" 
                  }} 
                />
              ) : (
                <ProfileIcon />
              )}
              Profile
            </button>
          </div>
          <div className="sidebar-footer">
            <button
              type="button"
              className="sidebar-item"
              style={{ color: '#ef4444' }}
              onClick={() => handleSignOut()}
            >
              <LogoutIcon /> {t("logout")}
            </button>
          </div>
        </aside>

        {/* Main Content Column */}
        <div className="dashboard-main-content">
          {/* Topbar */}
          <div className="dashboard-topbar">
            <div className="topbar-indicators" style={{ position: 'relative' }}>
              <div 
                className="indicator-pill streak" 
                onClick={() => setStreakPopupOpen(!streakPopupOpen)}
                style={{ cursor: 'pointer', position: 'relative' }}
                ref={streakPopupRef}
              >
                <FlameIcon style={{ color: '#ff4d00' }} /> {streakCount}

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
                            {day.isCompleted ? '🔥' : ''}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="indicator-pill xp"><StarIcon style={{ color: '#f59e0b' }} /> {userXp} XP</div>
            </div>
            {renderThemeToggle()}
            {renderLanguageDropdown(true)}
          </div>

          {/* Main View Area */}
          <main className="dashboard-main-view">
            {/* Dashboard / Home - overview widgets */}
            {dashboardTab === "dashboard" && (
              <div className="dashboard-overview">
                <div className="dashboard-col dashboard-col-left">
                  <div className="dashboard-greeting">
                    <h1>Hello, {profile?.full_name || "Learner"}</h1>
                    <p>Welcome back! Pick up right where you left off.</p>
                  </div>

                  <div className="resume-card">
                    <div className="resume-card-info">
                      <span className="resume-card-label">Continue learning</span>
                      <h3 className="resume-card-title">{currentUnit?.title}</h3>
                      <div className="resume-card-sub" style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.85rem' }}>
                          Section: {currentLevelSections[currentUnitPos.sectionIdx]?.title || `Section ${currentUnitPos.sectionIdx + 1}`}
                        </span>
                        <span style={{ 
                          fontSize: '0.78rem', 
                          marginTop: '10px', 
                          whiteSpace: 'nowrap'
                        }}>
                          Unit: {currentLevelSections[currentUnitPos.sectionIdx]?.units[currentUnitPos.unitIdx]?.title || `Unit ${currentUnitPos.unitIdx + 1}`}
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
                      ▶ Resume
                    </button>
                  </div>

                  <div className="word-of-day-card">
                    <div className="word-of-day-head">
                      <span className="word-of-day-label">Word of the Day</span>
                      <button
                        type="button"
                        className="word-of-day-speak"
                        onClick={() => speakWord(wordOfDay.word)}
                        aria-label="Listen to word"
                      >
                        🔊
                      </button>
                    </div>
                    <h3 className="word-of-day-word">{wordOfDay.word}</h3>
                    <p className="word-of-day-example">"{wordOfDay.example}"</p>
                  </div>
                </div>

                <div className="dashboard-col dashboard-col-right">
                  <div className="current-level-card" style={{ margin: 0 }}>
                    <div className="current-level-header">
                      <h3 className="current-level-title">Current Level</h3>
                    </div>
                    <div className="current-level-body">
                      <div className="current-level-badge" style={{ background: levelBadgeColor(currentLevelNum) }}>
                        <span className="current-level-badge-icon">{levelBadgeIcon(currentLevelNum)}</span>
                        <span className="current-level-badge-level">LEVEL {currentLevelNum}</span>
                      </div>
                      <div className="current-level-info">
                        <p className="current-level-name">{getLevelCategoryAndDescription(currentLevelNum, selectedLanguage).category}</p>
                        <p className="current-level-msg">Keep it up! Good Work</p>
                      </div>
                    </div>
                  </div>

                  <div className="dashboard-overview-row">
                    <div className="streak-widget-card streak-society-card" style={{ margin: 0 }}>
                      <div className="streak-society-header">
                        <span className="streak-society-badge">STREAK SOCIETY</span>
                        <div className="streak-society-icon"><FlameIcon style={{ width: "36px", height: "36px", color: '#ff4d00', marginRight: 0 }} /></div>
                      </div>
                      <h4 className="streak-society-title">{streakCount} day streak</h4>
                      <p className="streak-society-message">{getStreakMessage(streakCount)}</p>
                    </div>

                    <div className="daily-quests-card" style={{ margin: 0 }}>
                      <div className="daily-quests-header">
                        <h3>Daily Quests</h3>
                        {activeQuests.length > 0 && activeQuests.every(q => getQuestProgress(q).completed) ? (
                          <span className="daily-quests-timer" style={{ background: '#d1fae5', color: '#10b981' }}>✓ ALL COMPLETED</span>
                        ) : (
                          <span className="daily-quests-timer">{timeLeftStr.toUpperCase()} LEFT</span>
                        )}
                      </div>
                      <div className="quest-list" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {activeQuests.map((quest) => {
                          const prog = getQuestProgress(quest);
                          return (
                            <div key={quest.id} className="quest-item" style={{ 
                              gap: '10px', 
                              padding: '12px',
                              opacity: prog.completed ? 0.65 : 1,
                              background: prog.completed ? 'var(--line)' : '#fafafa',
                              borderColor: prog.completed ? 'transparent' : 'rgba(0, 0, 0, 0.04)'
                            }}>
                              <div className="quest-icon" style={{ width: '32px', height: '32px', borderRadius: '8px' }}>
                                {quest.type === 'xp' && (
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle' }}>
                                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
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
                                    {quest.title}
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

                  <div className="achievements-card" style={{ margin: 0 }}>
                    <div className="achievements-card-header">
                      <h4>Achievements</h4>
                    </div>
                    <div className="achievements-list">
                      {[
                        { id: 1, title: "First Steps", desc: "Complete your first assessment", icon: <StarIcon style={{ marginRight: 0 }} />, earned: true, color: "#f59e0b" },
                        { id: 2, title: "Reading Star", desc: "Score 75% or higher in reading", icon: <BookIcon style={{ marginRight: 0 }} />, earned: calculateSkillProficiency("reading") >= 75, color: "#3b82f6" },
                        { id: 3, title: "Comprehension Pro", desc: "Score 75% or higher in comprehension", icon: <BrainIcon style={{ marginRight: 0 }} />, earned: calculateSkillProficiency("comprehension") >= 75, color: "#10b981" },
                        { id: 4, title: "Wordsmith", desc: "Score 75% or higher in writing", icon: <EditIcon style={{ marginRight: 0 }} />, earned: calculateSkillProficiency("writing") >= 75, color: "#a855f7" },
                      ].map((a) => (
                        <div key={a.id} className={`achievement-row ${a.earned ? "earned" : ""}`}>
                          <div className="achievement-badge-box" style={{ background: a.color }}>
                            <span className="achievement-badge-icon">{a.icon}</span>
                          </div>
                          <div className="achievement-info">
                            <div className="achievement-info-header">
                              <span className="achievement-title">{a.title}</span>
                            </div>
                            <p className="achievement-desc">{a.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3.1. Learn Tab — Duolingo-style Continuous Curriculum Path */}
            {dashboardTab === "learn" && (() => {
              const storedSkills = (() => { try { const s = getStoredAssessmentState(session?.user?.id); return s?.skill_scores || profile?.skill_scores || {}; } catch { return {}; } })();
              const weakSkillLabels = getWeakSkills(storedSkills);

              // Render all sections sequentially in standard order (1 to 7) per spec
              const orderedSections = CURRICULUM_SECTIONS; 

              // Build a flat ordered list of all lessons in the curriculum for chain unlocking
              const allLessonsList = [];
              orderedSections.forEach((sec) => {
                sec.units.forEach((uni) => {
                  uni.lessons.forEach((les) => {
                    allLessonsList.push(les.id);
                  });
                });
              });

              // Determine starting lesson index based on diagnosed literacy level (per Spec mapping 1-5 levels)
              const startingLessonId = (() => {
                const level = profile?.literacy_level || 1;
                if (level === 2) return "s2u1l1";
                if (level === 3) return "s3u1l1";
                if (level === 4) return "s5u1l1";
                if (level === 5) return "s7u1l1";
                return "s1u1l1"; // Default/Level 1
              })();

              const startingLessonIndex = allLessonsList.indexOf(startingLessonId);

              let unitCounter = 0;

              return (
                <div className="duo-learn-container" ref={learnJourneyRef}>
                  {orderedSections.map((section, secIdx) => {
                    const isSectionRecommended = weakSkillLabels.some(w => w.toLowerCase().includes(section.skillTarget?.replace("_", " ") || ""));

                    return (
                      <div key={section.id} className="duo-section-block">
                        {/* Section Checkpoint Header */}
                        <div className="duo-section-banner" style={{ background: `linear-gradient(135deg, ${section.color} 0%, ${section.color}cc 100%)`, boxShadow: `0 8px 24px ${section.color}33` }}>
                          <span className="duo-section-banner-icon">{section.icon}</span>
                          <div className="duo-section-banner-text">
                            <span className="duo-section-banner-meta">Section {section.num} of {orderedSections.length}</span>
                            <h2 className="duo-section-banner-title">{section.title}</h2>
                          </div>
                          {isSectionRecommended && (
                            <span className="duo-section-badge">⭐ Recommended</span>
                          )}
                        </div>

                        {section.units.map((unit) => {
                          const unitLessons = unit.lessons;
                          const completedInUnit = unitLessons.filter(l => completedLessons.includes(l.id)).length;
                          const currentUnitIndex = unitCounter++;
                          const mascotNum = (currentUnitIndex % 4) + 1;
                          const sideClass = currentUnitIndex % 2 === 0 ? "mascot-left" : "mascot-right";

                          return (
                            <div key={unit.id} className="duo-unit-block">
                              <div className="duo-unit-header">
                                <h3 className="duo-unit-title">Unit {unit.num}</h3>
                                <span className="duo-unit-topic">{unit.title}</span>
                                <span className="duo-unit-progress">{completedInUnit}/{unitLessons.length} Done</span>
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
                                  const lessonIndexInCurriculum = allLessonsList.indexOf(lesson.id);
                                  const isUnlocked = lessonIndexInCurriculum <= startingLessonIndex || completedLessons.includes(allLessonsList[lessonIndexInCurriculum - 1]);
                                  const status = isCompleted ? "completed" : isUnlocked ? "unlocked" : "locked";
                                  const lessonXp = lIdx === 4 ? 60 : 15;

                                  // Calculate snaking offset class
                                  // Path: Center -> Right -> Center -> Left -> Repeat
                                  const snakePositions = ["snake-center", "snake-right", "snake-center", "snake-left"];
                                  const snakeClass = snakePositions[lIdx % 4];

                                  const isPopupOpen = activeLessonPopup === lesson.id;

                                  // Find the active resumed lesson ID (starting from their diagnosed level)
                                  const currentActiveLessonId = allLessonsList.slice(startingLessonIndex).find(id => !completedLessons.includes(id)) || allLessonsList[0];
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
                                              {status === "completed" ? "✓ Done" : status === "unlocked" ? "Ready" : "🔒 Locked"}
                                            </span>
                                            <span className="duo-popover-xp">+{lessonXp} XP</span>
                                          </div>
                                          <h4 className="duo-popover-title">{unit.title} — {lIdx === 4 ? "Unit Exam" : `Lesson ${lIdx + 1}`}</h4>
                                          <p className="duo-popover-desc">
                                            {lIdx === 4 
                                              ? "A comprehensive unit exam testing skills from the first 4 lessons." 
                                              : "Personalized AI lesson targeting your curriculum goals."}
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
                                              ? (status === "completed" ? "Review Exam" : "Start Exam") 
                                              : (status === "completed" ? "Review Lesson" : "Start Lesson")}
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
              <div className="practice-grid-layout">
                {/* Left/Center Column - Custom Practice Sections */}
                <div className="practice-content-column">

                  {/* Today's Review Section */}
                  <div className="practice-section">
                    <h2 className="practice-section-title">Today's Review</h2>
                    <div className="perfect-pronunciation-card" onClick={() => startLessonSession({ id: `l${currentLevelNum}_read_practice`, title: "Perfect Pronunciation", desc: "Speak out sentences aloud" })}>
                      <div className="perfect-pronunciation-info">
                        <h3 className="perfect-pronunciation-title">Perfect Pronunciation</h3>
                        <p className="perfect-pronunciation-desc">Finish this session to build confidence with speaking!</p>
                        <button type="button" className="perfect-pronunciation-btn">START</button>
                      </div>
                      <img src="/as4.png" alt="Mascot" className="perfect-pronunciation-mascot" />
                    </div>
                  </div>

                  {/* Conversation Section */}
                  <div className="practice-section">
                    <h2 className="practice-section-title">Conversation</h2>
                    <div className="practice-row-cards">
                      <div className="practice-row-card" onClick={() => startLessonSession({ id: `l${currentLevelNum}_read_practice`, title: "Speak Practice", desc: "Improve your speaking skills with these phrases" })}>
                        <div className="practice-row-card-content">
                          <h3 className="practice-row-card-title">Speak</h3>
                          <p className="practice-row-card-desc">Improve your speaking skills with these phrases</p>
                        </div>
                        <div className="practice-row-card-icon speak-icon">🎙️</div>
                      </div>
                      <div className="practice-row-card" onClick={() => startLessonSession({ id: `l${currentLevelNum}_write_practice`, title: "Listen Practice", desc: "Boost your listening skills with an audio-only session" })}>
                        <div className="practice-row-card-content">
                          <h3 className="practice-row-card-title">Listen</h3>
                          <p className="practice-row-card-desc">Boost your listening skills with an audio-only session</p>
                        </div>
                        <div className="practice-row-card-icon listen-icon">🎧</div>
                      </div>
                    </div>
                  </div>

                  {/* Your collections Section */}
                  <div className="practice-section">
                    <h2 className="practice-section-title">Your collections</h2>
                    <div className="practice-row-cards">
                      <div className="practice-row-card" onClick={() => startLessonSession({ id: `l${currentLevelNum}_write_practice`, title: "Mistakes Practice", desc: "Start a personalized lesson to practice your mistakes" })}>
                        <div className="practice-row-card-content">
                          <h3 className="practice-row-card-title">
                            Mistakes
                            <span className="practice-badge">7</span>
                          </h3>
                          <p className="practice-row-card-desc">Start a personalized lesson to practice your mistakes</p>
                        </div>
                        <div className="practice-row-card-icon mistakes-icon">🔄</div>
                      </div>

                      <div className="practice-row-card" onClick={() => startLessonSession({ id: `l${currentLevelNum}_write_practice`, title: "Words Practice", desc: "Review your vocabulary at any time" })}>
                        <div className="practice-row-card-content">
                          <h3 className="practice-row-card-title">
                            Words
                            <span className="practice-badge">30+</span>
                          </h3>
                          <p className="practice-row-card-desc">Review your {selectedLanguage || "English"} vocabulary at any time</p>
                        </div>
                        <div className="practice-row-card-icon words-icon">✨</div>
                      </div>

                      <div className="practice-row-card" onClick={() => startLessonSession({ id: `l${currentLevelNum}_comp_practice`, title: "Stories Practice", desc: "Reread a story to review words in context" })}>
                        <div className="practice-row-card-content">
                          <h3 className="practice-row-card-title">Stories</h3>
                          <p className="practice-row-card-desc">Reread a story to review words in context</p>
                        </div>
                        <div className="practice-row-card-icon stories-icon">📖</div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* 3.3. Profile Tab */}
            {dashboardTab === "profile" && (
              <div className="profile-view-container">
                <div className="profile-card-large">
                  <div 
                    className="profile-avatar-large" 
                    style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center", 
                      overflow: "hidden",
                      position: "relative",
                      border: "4px solid var(--accent)",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.12)"
                    }}
                  >
                    {profileAvatar && profileAvatar.startsWith("http") ? (
                      <img src={profileAvatar} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      getUserInitials(profile?.full_name)
                    )}

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
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        background: "var(--accent)",
                        color: "white",
                        display: "grid",
                        placeItems: "center",
                        cursor: "pointer",
                        fontSize: "0.75rem",
                        boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
                        transition: "all 0.15s ease",
                        border: "none"
                      }}
                      title={submitting ? "Uploading image..." : "Upload Profile Picture"}
                      className="profile-avatar-edit-badge"
                    >
                      {submitting ? "⏳" : "✏️"}
                    </label>
                  </div>
                  <div className="profile-info-large">
                    <h2>{profile?.full_name || "Learner"}</h2>
                    <p>{session.user.email}</p>
                    <div style={{ display: "flex", gap: "16px", marginTop: "12px" }}>
                      <span style={{ fontWeight: 700 }}>Age: {profile?.age || "N/A"}</span>
                      <span style={{ fontWeight: 700 }}>Education: {profile?.education_level || "N/A"}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
                  <div className="achievements-card" style={{ margin: 0, padding: "24px" }}>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "20px" }}>Update Profile Settings</h3>
                    <form onSubmit={handleSaveProfileEdit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      <label className="profile-dropdown-label">
                        Full Name
                        <input
                          type="text"
                          required
                          value={editFullName}
                          onChange={(e) => setEditFullName(e.target.value)}
                          style={{ width: "100%", boxSizing: "border-box" }}
                        />
                      </label>
                      <label className="profile-dropdown-label">
                        Age
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
                        Preferred Language
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
                        Current Education Status
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
                      <button type="submit" className="primary-btn" disabled={submitting}>
                        {submitting ? "Saving..." : "Save Changes"}
                      </button>
                    </form>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    <div className="current-level-card" style={{ margin: 0, padding: "24px" }}>
                      <h3 className="current-level-title">Diagnostic & Dev Control</h3>
                      <p style={{ fontSize: "0.85rem", color: "#ffffff", marginBottom: "16px" }}>Manage diagnostic state or clear developer progress milestones.</p>
                      <button
                        type="button"
                        className="secondary-btn"
                        style={{ borderColor: "#ff1a1a", color: "#ff1a1a", width: "100%", marginBottom: "12px" }}
                        onClick={() => handleResetAssessmentStatus()}
                      >
                        Reset Assessment Status
                      </button>
                      <button
                        type="button"
                        className="secondary-btn"
                        style={{ borderColor: "#e67e22", color: "#e67e22", width: "100%" }}
                        onClick={() => handleResetLessons()}
                      >
                        Reset Completed Lessons (Dev)
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>

        {/* 4. AI Lesson Session Overlay */}
        {(lessonLoading || lessonSession) && (
          <div className="lesson-overlay-screen">
            <div className="lesson-overlay-header">
              <div className="lesson-overlay-header-content">
                <button className="lesson-overlay-close" onClick={() => { setLessonSession(null); setLessonAiContent(null); setLessonLoading(false); setLessonStep(0); }}>✕</button>
                <div className="lesson-progress-container">
                  <div className="lesson-progress-bar" style={{ width: lessonSession?.status === "completed" ? "100%" : `${(lessonStep / 4) * 100}%` }}></div>
                </div>
                <div className="lesson-overlay-controls">
                  <div style={{ fontWeight: 800, whiteSpace: "nowrap" }}>XP +15</div>
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
                <div style={{ textAlign: "center", maxWidth: "480px", padding: "32px" }}>
                  <div style={{ fontSize: "4rem", marginBottom: "16px" }}>🎉</div>
                  <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "#10b981", marginBottom: "12px" }}>Lesson Complete!</h2>
                  <p style={{ fontSize: "1.1rem", color: "var(--muted)", marginBottom: "8px" }}>{lessonAiContent?.aiFeedbackPositive || "Great job! You earned 15 XP!"}</p>
                  <p style={{ fontSize: "0.9rem", color: "var(--muted)", marginBottom: "28px" }}>Section: {lessonSession.sectionTitle} · Unit: {lessonSession.unitTitle}</p>
                  <button className="primary-btn" style={{ width: "100%", padding: "14px", marginBottom: "12px" }} onClick={() => { setLessonSession(null); setLessonAiContent(null); setLessonStep(0); }}>
                    ✓ Continue Learning
                  </button>
                </div>
              )}

              {/* Active Lesson Steps */}
              {!lessonLoading && lessonSession && lessonSession.status !== "completed" && lessonAiContent && (() => {
                const ai = lessonAiContent;

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
                        {ai.examples?.length > 0 && (
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
                            <span className="ai-step-badge">🎯 Multiple Choice (Question {lessonMcqIndex + 1} of {ai.mcqs.length})</span>
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
                                    if (lessonMcqIndex < ai.mcqs.length - 1) {
                                      setLessonMcqIndex(lessonMcqIndex + 1);
                                    } else {
                                      setLessonStep(2);
                                    }
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
                            <span className="ai-step-badge">✍️ Fill in the Blank (Question {lessonFillIndex + 1} of {ai.fillBlanks.length})</span>
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
                                    if (lessonFillIndex < ai.fillBlanks.length - 1) {
                                      setLessonFillIndex(lessonFillIndex + 1);
                                    } else {
                                      setLessonStep(3);
                                    }
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
                              <button type="button" className="tts-btn" onClick={() => speakText(ai.readingPassage)}>🔊 Listen</button>
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
                                  setLessonTotalQuestions(t => t + 1);
                                  setLessonCorrectCount(c => c + 1);
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
                              setLessonTotalQuestions(t => t + 1);
                              setLessonCorrectCount(c => c + 1);
                              setLessonStep(5);
                            }}
                            disabled={!lessonWritingText.trim()}
                          >
                            Complete Activity
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
                          rec.lang = selectedLanguage === "Kannada" ? "kn-IN" :
                                     selectedLanguage === "Hindi" ? "hi-IN" :
                                     selectedLanguage === "Telugu" ? "te-IN" :
                                     selectedLanguage === "Tamil" ? "ta-IN" : "en-US";
                                     
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
                            
                            setLessonTotalQuestions(t => t + 1);
                            if (isCorrect) setLessonCorrectCount(c => c + 1);
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
                            <img src="/as1.png" alt="LISA Mascot" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
                            <div style={{
                              flexGrow: 1,
                              background: 'var(--panel)',
                              border: '2px solid var(--line)',
                              borderRadius: '20px',
                              padding: '24px',
                              position: 'relative',
                              fontSize: '1.4rem',
                              fontWeight: '700',
                              textAlign: 'center',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '12px'
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
                                <button type="button" className="tts-btn" style={{ borderRadius: '50%', width: '40px', height: '40px', padding: 0 }} onClick={() => speakText(sentence)}>🔊</button>
                                <span style={{ color: 'var(--text)' }}>{sentence}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', margin: '30px 0' }}>
                            <button
                              type="button"
                              onClick={startSpeaking}
                              disabled={lessonSpeakIsListening || isChecked}
                              style={{
                                background: lessonSpeakIsListening ? '#ef4444' : 'var(--accent)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '16px',
                                padding: '16px 32px',
                                fontSize: '1.2rem',
                                fontWeight: '800',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                              }}
                            >
                              <span>{lessonSpeakIsListening ? "🛑 RECORDING..." : "🎙️ CLICK TO SPEAK"}</span>
                            </button>
                            
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
                      const mq = ai.meaningQuestion || { phrase: "Thank you", options: ["Dhanyavadagalu", "Namaskara", "Hogi baruttene"], correctIndex: 0 };
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
                                  setLessonTotalQuestions(t => t + 1);
                                  if (correct) setLessonCorrectCount(c => c + 1);
                                  setLessonMeaningFeedback({
                                    isCorrect: correct,
                                    correctAnswer: mq.options[mq.correctIndex]
                                  });
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
                      const tt = ai.translationTask || { sentence: "Namaskara", englishTranslation: "Hello", tiles: ["Hello", "Bye", "Thank", "You"] };
                      const isChecked = lessonTranslationFeedback !== null;
                      
                      return (
                        <div className="ai-lesson-step" style={{ paddingBottom: '120px' }}>
                          <div className="ai-lesson-step-header" style={{ marginBottom: '16px' }}>
                            <span className="ai-step-badge">✍️ Write this in English</span>
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
                              <p style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>"{tt.sentence}"</p>
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
                            {tt.tiles.map((word, wIdx) => {
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
                                  
                                  setLessonTotalQuestions(t => t + 1);
                                  if (correct) setLessonCorrectCount(c => c + 1);
                                  setLessonTranslationFeedback({
                                    isCorrect: correct,
                                    correctAnswer: tt.englishTranslation
                                  });
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
                        { left: "Shale", right: "School" },
                        { left: "Pustaka", right: "Book" },
                        { left: "Huduga", right: "Boy" },
                        { left: "Neeru", right: "Water" }
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
                            setLessonTotalQuestions(t => t + 1);
                            setLessonCorrectCount(c => c + 1);
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
                            setLessonTotalQuestions(t => t + 1);
                            setLessonCorrectCount(c => c + 1);
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
                                      ['justify' + 'Content']: 'space-between',
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
                                      ['justify' + 'Content']: 'space-between',
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
                                width: '80px',
                                height: '80px',
                                borderRadius: '24px',
                                background: '#38bdf8',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                ['justify' + 'Content']: 'center',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                              }}
                            >
                              <span style={{ fontSize: '2.5rem' }}>🔊</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => speakText(lt.audioText, 0.5)}
                              style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '18px',
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
                              <span style={{ fontSize: '1.8rem' }}>🐢</span>
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

                                  setLessonTotalQuestions(t => t + 1);
                                  if (correct) setLessonCorrectCount(c => c + 1);
                                  setLessonListeningFeedback({
                                    isCorrect: correct,
                                    correctAnswer: lt.audioText
                                  });
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
                                    advanceLessonStep();
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

                  </div>
                );
              })()}
            </div>
          </div>
        )}


      </div>
    );
  }

  // LOGIN / REGISTER SCREENS (Not Logged In)
  return (
    <main className="shell">
      <div className="brand-logo-top">
        LISA
        <span className="brand-logo-tagline">Literacy Intelligence Support Assistant</span>
      </div>
      {renderThemeToggle()}
      {renderLanguageDropdown()}
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
                  {t("preferredLanguage")}
                  <select name="language" required value={selectedLanguage || ""} onChange={(e) => handleLanguageSelect(e.target.value)} disabled={submitting}>
                    <option value="" disabled>{t("selectLanguage")}</option>
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