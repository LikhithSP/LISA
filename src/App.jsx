import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

const languages = ["English", "Hindi", "Kannada", "Telugu", "Tamil", "Other"];
const levelNames = {
  English: [
    "Level 1: Cannot read letters.",
    "Level 2: Can read letters but not words.",
    "Level 3: Can read words but not sentences.",
    "Level 4: Can read sentences but struggles with understanding.",
    "Level 5: Can read and understand basic content."
  ],
  Hindi: [
    "स्तर 1: अक्षरों को नहीं पढ़ सकते।",
    "स्तर 2: अक्षर पढ़ सकते हैं लेकिन शब्द नहीं।",
    "स्तर 3: शब्द पढ़ सकते हैं लेकिन वाक्य नहीं।",
    "स्तर 4: वाक्य पढ़ सकते हैं लेकिन समझने में कठिनाई होती है।",
    "स्तर 5: बुनियादी सामग्री को पढ़ और समझ सकते हैं।"
  ],
  Kannada: [
    "ಹಂತ 1: ಅಕ್ಷರಗಳನ್ನು ಓದಲು ಸಾಧ್ಯವಿಲ್ಲ.",
    "ಹಂತ 2: ಅಕ್ಷರಗಳನ್ನು ಓದಬಹುದು ಆದರೆ ಪದಗಳಲ್ಲ.",
    "ಹಂತ 3: ಪದಗಳನ್ನು ಓದಬಹುದು ಆದರೆ ವಾಕ್ಯಗಳಲ್ಲ.",
    "ಹಂತ 4: ವಾಕ್ಯಗಳನ್ನು ಓದಬಹುದು ಆದರೆ ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲು ಕಷ್ಟಪಡುತ್ತಾರೆ.",
    "ಹಂತ 5: ಮೂಲ ವಿಷಯವನ್ನು ಓದಬಹುದು ಮತ್ತು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಬಹುದು."
  ],
  Telugu: [
    "స్థాయి 1: అక్షరాలు చదవలేరు.",
    "స్థాయి 2: అక్షరాలు చదవగలరు కానీ పదాలు చదవలేరు.",
    "స్థాయి 3: పదాలు చదవగలరు కానీ వాక్యాలు చదవలేరు.",
    "స్థాయి 4: వాక్యాలు చదవగలరు కానీ అర్థం చేసుకోవడంలో ఇబ్బంది పడతారు.",
    "స్థాయి 5: ప్రాథమిక విషయాలను చదవగలరు మరియు అర్థం చేసుకోగలరు."
  ],
  Tamil: [
    "நிலை 1: எழுத்துக்களைப் படிக்க முடியாது.",
    "நிலை 2: எழுத்துக்களைப் படிக்க முடியும் ஆனால் சொற்களை அல்ல.",
    "நிலை 3: சொற்களைப் படிக்க முடியும் ஆனால் வாக்கியங்களை அல்ல.",
    "நிலை 4: வாக்கியங்களைப் படிக்க முடியும் ஆனால் புரிந்து கொள்ளக் கடினப்படும்.",
    "நிலை 5: அடிப்படை உள்ளடக்கத்தைப் படித்துப் புரிந்து கொள்ள முடியும்."
  ]
};

const getLocalizedLevelName = (level, lang) => {
  const currentLang = lang || "English";
  const list = levelNames[currentLang] || levelNames["English"];
  return list[level - 1] || `Level ${level}`;
};

const getLevelCategoryAndDescription = (level, lang) => {
  const currentLang = lang || "English";
  const list = levelNames[currentLang] || levelNames["English"];
  const fullStr = list[level - 1] || `Level ${level}`;
  const parts = fullStr.split(":");
  if (parts.length >= 2) {
    const category = parts[0].trim();
    const description = parts.slice(1).join(":").trim();
    return { category, description };
  }
  return { category: `Level ${level}`, description: "" };
};

const getPasswordStrength = (pass) => {
  if (!pass) return null;
  let score = 0;
  if (pass.length >= 6) score++;
  if (pass.length >= 8) score++;
  if (/[A-Z]/.test(pass)) score++;
  if (/[0-9]/.test(pass)) score++;
  if (/[^A-Za-z0-9]/.test(pass)) score++;

  if (score <= 2) {
    return { labelKey: "passwordWeak", color: "#ef4444", pct: 33 };
  } else if (score <= 4) {
    return { labelKey: "passwordMedium", color: "#f97316", pct: 66 };
  } else {
    return { labelKey: "passwordStrong", color: "#22c55e", pct: 100 };
  }
};

const getLiteracyLevel = (userProfile) => {
  if (userProfile?.literacy_level) return Number(userProfile.literacy_level);
  const ed = userProfile?.education_level;
  if (ed) {
    if (ed.includes("Level 1")) return 1;
    if (ed.includes("Level 2")) return 2;
    if (ed.includes("Level 3")) return 3;
    if (ed.includes("Level 4")) return 4;
    if (ed.includes("Level 5")) return 5;
  }
  return null;
};

const educationLevels = [
  "No formal education",
  "Primary",
  "Secondary",
  "Higher secondary",
];

const translations = {
  English: {
    initialAssessmentDesc: "Welcome to your personalized learning space! Let's start with a quick 15-question initial assessment. This helps us customize future material.",
    heroTitle: "Your AI companion for personalized literacy learning.",
    heroCopy: "Built for first-generation learners, senior citizens, and regional language users. The assistant adapts learning, gives simple feedback, and supports voice-based interaction.",
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
    personalizationHelp: "This information helps the assistant personalize content, voice, and feedback.",
    resetPasswordTitle: "Reset Password",
    enterEmailForLink: "Enter your email to receive a password reset link.",
    sendResetLink: "Send Reset Link",
    backToLogin: "Back to Login",
    resetAccountPassword: "Reset your account password.",
    regainAccessCopy: "Please enter your new password to regain access to your learning dashboard.",
    createNewPassword: "Create New Password",
    typeSecurePassword: "Type in your secure new password.",
    newPassword: "New Password",
    updatePassword: "Update Password",
    hello: "Hello",
    logout: "Log Out",
    welcomeToLisa: "Welcome to LISA",
    dashboardUnderConstruction: "Your personalized literacy learning dashboard is under construction.",
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
    // Placeholders
    emailPlaceholder: "Enter your Email Address",
    passwordPlaceholder: "Enter your password",
    fullNamePlaceholder: "Your name",
    agePlaceholder: "Age",
    emailRegisterPlaceholder: "Example: ramesh@gmail.com",
    passwordRegisterPlaceholder: "Create a password",
    newPasswordPlaceholder: "Enter new password",
    // Language Dropdown Options
    EnglishOption: "English",
    HindiOption: "Hindi",
    KannadaOption: "Kannada",
    TeluguOption: "Telugu",
    TamilOption: "Tamil",
    OtherOption: "Other",
    // Education Dropdown Options
    "No formal educationOption": "No formal education",
    PrimaryOption: "Primary education",
    SecondaryOption: "Secondary education",
    "Higher secondaryOption": "Higher secondary education",
    "Senior citizenOption": "Senior citizen",
    assessmentHistory: "Assessment History",
    noAttemptsYet: "No assessment attempts completed yet.",
    takeAssessmentBtn: "Take Assessment",
    retakeAssessmentBtn: "Retake Assessment",
    questionProgress: "Question {current} of {total}",
    submitAssessmentBtn: "Submit Assessment",
    submittingAssessment: "Submitting assessment...",
    resultsTitle: "Assessment Results",
    correctAnswers: "Correct Answers",
    percentageScore: "Percentage Score",
    summaryLabel: "Summary",
    backToDashboardBtn: "Back to Dashboard",
    categoryLabel: "Category",
    dateLabel: "Date",
    answerAllPrompt: "Please answer all questions before submitting.",
    passwordWeak: "Weak",
    passwordMedium: "Medium",
    passwordStrong: "Strong",
  },
  Hindi: {
    initialAssessmentDesc: "आपके व्यक्तिगत शिक्षण क्षेत्र में आपका स्वागत है! आइए एक त्वरित 15-प्रश्नों के प्रारंभिक आकलन के साथ शुरुआत करें। यह हमें भविष्य की सामग्री को अनुकूलित करने में मदद करता है।",
    heroTitle: "व्यक्तिगत साक्षरता सीखने के लिए आपका एआई साथी।",
    heroCopy: "पहली पीढ़ी के शिक्षार्थियों, वरिष्ठ नागरिकों और क्षेत्रीय भाषा उपयोगकर्ताओं के लिए निर्मित। सहायक सीखने को अनुकूलित करता है, सरल प्रतिक्रिया देता है, और आवाज-आधारित बातचीत का समर्थन करता है।",
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
    personalizationHelp: "यह जानकारी सहायक को सामग्री, आवाज़ और प्रतिक्रिया को व्यक्तिगत बनाने में मदद करती है।",
    resetPasswordTitle: "पासवर्ड रीसेट करें",
    enterEmailForLink: "पासवर्ड रीसेट लिंक प्राप्त करने के लिए अपना ईमेल दर्ज करें।",
    sendResetLink: "रीसेट लिंक भेजें",
    backToLogin: "लॉगिन पर वापस जाएं",
    resetAccountPassword: "अपने खाते का पासवर्ड रीसेट करें।",
    regainAccessCopy: "अपने सीखने के डैशबोर्ड तक पहुंच पुनः प्राप्त करने के लिए कृपया अपना नया पासवर्ड दर्ज करें।",
    createNewPassword: "नया पासवर्ड बनाएं",
    typeSecurePassword: "अपना सुरक्षित नया पासवर्ड टाइप करें।",
    newPassword: "नया पासवर्ड",
    updatePassword: "पासवर्ड अपडेट करें",
    hello: "नमस्ते",
    logout: "लॉग आउट",
    welcomeToLisa: "LISA में आपका स्वागत है",
    dashboardUnderConstruction: "आपका व्यक्तिगत साक्षरता शिक्षण डैशबोर्ड अभी निर्माणाधीन है।",
    loadingMessage: "आपके सीखने के अनुभव को लोड किया जा रहा है...",
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
    checkEmailConfirm: "पंजीकरण सफल! अपने खाते की पुष्टि करने के लिए कृपया अपना ईमेल जांचें।",
    successSignOut: "सफलतापूर्वक लॉग आउट हो गया।",
    // Placeholders
    emailPlaceholder: "अपना ईमेल पता दर्ज करें",
    passwordPlaceholder: "अपना पासवर्ड दर्ज करें",
    fullNamePlaceholder: "आपका नाम",
    agePlaceholder: "उम्र",
    emailRegisterPlaceholder: "उदाहरण: ramesh@gmail.com",
    passwordRegisterPlaceholder: "एक पासवर्ड बनाएं",
    newPasswordPlaceholder: "नया पासवर्ड दर्ज करें",
    // Language Dropdown Options
    EnglishOption: "अंग्रेज़ी",
    HindiOption: "हिन्दी",
    KannadaOption: "कन्नड़",
    TeluguOption: "तेलुगु",
    TamilOption: "तमिल",
    OtherOption: "अन्य",
    // Education Dropdown Options
    "No formal educationOption": "कोई औपचारिक शिक्षा नहीं",
    PrimaryOption: "प्राथमिक शिक्षा",
    SecondaryOption: "माध्यमिक शिक्षा",
    "Higher secondaryOption": "उच्चतर माध्यमिक शिक्षा",
    "Senior citizenOption": "वरिष्ठ नागरिक",
    assessmentHistory: "आकलन इतिहास",
    noAttemptsYet: "अभी तक कोई आकलन पूरा नहीं किया गया है।",
    takeAssessmentBtn: "आकलन शुरू करें",
    retakeAssessmentBtn: "फिर से आकलन लें",
    questionProgress: "प्रश्न {current} का {total}",
    submitAssessmentBtn: "आकलन सबमिट करें",
    submittingAssessment: "आकलन सबमिट किया जा रहा है...",
    resultsTitle: "आकलन के परिणाम",
    correctAnswers: "सही उत्तर",
    percentageScore: "प्रतिशत स्कोर",
    summaryLabel: "सारांश",
    backToDashboardBtn: "डैशबोर्ड पर वापस जाएं",
    categoryLabel: "श्रेणी",
    dateLabel: "तिथि",
    answerAllPrompt: "कृपया सबमिट करने से पहले सभी प्रश्नों के उत्तर दें।",
    passwordWeak: "कमज़ोर",
    passwordMedium: "मध्यम",
    passwordStrong: "मजबूत",
  },
  Kannada: {
    initialAssessmentDesc: "ನಿಮ್ಮ ವೈಯಕ್ತೀಕರಿಸಿದ ಕಲಿಕಾ ಜಾಗಕ್ಕೆ ಸುಸ್ವಾಗತ! 15-ಪ್ರಶ್ನೆಗಳ ತ್ವರಿತ ಆರಂಭಿಕ ಮೌಲ್ಯಮಾಪನದೊಂದಿಗೆ ಪ್ರಾರಂಭಿಸೋಣ. ಇದು ಭವಿಷ್ಯದ ವಿಷಯವನ್ನು ಕಸ್ಟಮೈಸ್ ಮಾಡಲು ನಮಗೆ ಸಹಾಯ ಮಾಡುತ್ತದೆ।",
    heroTitle: "ವೈಯಕ್ತಿಕಗೊಳಿಸಿದ ಸಾಕ್ಷರತಾ ಕಲಿಕೆಗಾಗಿ ನಿಮ್ಮ AI ಒಡನಾಡಿ.",
    heroCopy: "ಮೊದಲ ತಲೆಮಾರಿನ ಕಲಿಯುವವರು, ಹಿರಿಯ ನಾಗರಿಕರು ಮತ್ತು ಪ್ರಾದೇಶಿಕ ಭಾಷಾ ಬಳಕೆದಾರರಿಗಾಗಿ ನಿರ್ಮಿಸಲಾಗಿದೆ. ಕಲಿಕೆಯನ್ನು ಅಸಿಸ್ಟೆಂಟ್ ಹೊಂದಿಸುತ್ತದೆ, ಸರಳ ಪ್ರತಿಕ್ರಿಯೆ ನೀಡುತ್ತದೆ ಮತ್ತು ಧ್ವನಿ ಆಧಾರಿತ ಸಂವಹನವನ್ನು ಬೆಂಬಲಿಸುತ್ತದೆ.",
    login: "ಲಾಗಿನ್",
    register: "ನೋಂದಣಿ",
    welcomeBack: "ಸ್ವಾಗತ",
    signInToContinue: "ನಿಮ್ಮ ಕಲಿಕೆಯ ಪ್ರಯಾಣವನ್ನು ಮುಂದುವರಿಸಲು ಸೈನ್ ಇನ್ ಮಾಡಿ.",
    email: "ಇಮೇಲ್",
    password: "ಪಾಸ್‌ವರ್ಡ್",
    forgotPasswordLink: "ಪಾಸ್‌ವರ್ಡ್ ಮರೆತಿರಾ?",
    newLearnerPrompt: "ಹೊಸ ಕಲಿಯುವವರೇ? ಪ್ರೊಫೈಲ್ ರಚಿಸಲು ನೋಂದಣಿಗೆ ಬದಲಿಸಿ.",
    createProfile: "ನಿಮ್ಮ ಕಲಿಯುವವರ ಪ್ರೊಫೈಲ್ ರಚಿಸಿ",
    fullName: "ಪೂರ್ಣ ಹೆಸರು",
    age: "ವಯಸ್ಸು",
    preferredLanguage: "ಆದ್ಯತೆಯ ಭಾಷೆ",
    selectLanguage: "ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    educationLevel: "ಶಿಕ್ಷಣದ ಮಟ್ಟ",
    selectEducation: "ಶಿಕ್ಷಣದ ಮಟ್ಟವನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    personalizationHelp: "ಈ ಮಾಹಿತಿಯು ವಿಷಯ, ಧ್ವನಿ ಮತ್ತು ಪ್ರತಿಕ್ರಿಯೆಯನ್ನು ವೈಯಕ್ತಿಕಗೊಳಿಸಲು ಅಸಿಸ್ಟೆಂಟ್‌ಗೆ ಸಹಾಯ ಮಾಡುತ್ತದೆ.",
    resetPasswordTitle: "ಪಾಸ್‌ವರ್ಡ್ ಮರುಹೊಂದಿಸಿ",
    enterEmailForLink: "ಪಾಸ್‌ವರ್ಡ್ ಮರುಹೊಂದಿಸುವ ಲಿಂಕ್ ಪಡೆಯಲು ಇಮೇಲ್ ನಮೂದಿಸಿ.",
    sendResetLink: "ಮರುಹೊಂದಿಸುವ ಲಿಂಕ್ ಕಳುಹಿಸಿ",
    backToLogin: "ಲಾಗಿನ್‌ಗೆ ಹಿಂತಿರುಗಿ",
    resetAccountPassword: "ನಿಮ್ಮ ಖಾತೆಯ ಪಾಸ್‌ವರ್ಡ್ ಮರುಹೊಂದಿಸಿ.",
    regainAccessCopy: "ನಿಮ್ಮ ಕಲಿಕೆಯ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಪ್ರವೇಶವನ್ನು ಪಡೆಯಲು ದಯವಿಟ್ಟು ಹೊಸ ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ.",
    createNewPassword: "ಹೊಸ ಪಾಸ್‌ವರ್ಡ್ ರಚಿಸಿ",
    typeSecurePassword: "ನಿಮ್ಮ ಸುರಕ್ಷಿತ ಹೊಸ ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ.",
    newPassword: "ಹೊಸ ಪಾಸ್‌ವರ್ಡ್",
    updatePassword: "ಪಾಸ್‌ವರ್ಡ್ ನವೀಕರಿಸಿ",
    hello: "ನಮಸ್ಕಾರ",
    logout: "ಲಾಗ್ ಔಟ್",
    welcomeToLisa: "LISA ಗೆ ಸ್ವಾಗತ",
    dashboardUnderConstruction: "ನಿಮ್ಮ ವೈಯಕ್ತಿಕಗೊಳಿಸಿದ ಸಾಕ್ಷರತಾ ಕಲಿಕೆಯ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಪ್ರಗತಿಯಲ್ಲಿದೆ.",
    loadingMessage: "ನಿಮ್ಮ ಕಲಿಕೆಯ ಅನುಭವವನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...",
    signingIn: "ಸೈನ್ ಇನ್ ಮಾಡಲಾಗುತ್ತಿದೆ...",
    creatingAccount: "ಖಾತೆ ರಚಿಸಲಾಗುತ್ತಿದೆ...",
    sendingLink: "ಲಿಂಕ್ ಕಳುಹಿಸಲಾಗುತ್ತಿದೆ...",
    resettingPassword: "ಪಾಸ್‌ವರ್ಡ್ ಮರುಹೊಂದಿಸಲಾಗುತ್ತಿದೆ...",
    signingOut: "ಲಾಗ್ ಔಟ್ ಮಾಡಲಾಗುತ್ತಿದೆ...",
    chooseLanguage: "ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    selectLanguagePrompt: "ಇಂಟರ್ಫೇಸ್ಗಾಗಿ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
    changeLanguageBtn: "ಭಾಷೆ ಬದಲಾಯಿಸಿ",
    successLogin: "ಲಾಗಿನ್ ಯಶಸ್ವಿಯಾಗಿದೆ!",
    successAccountCreated: "ಖಾತೆಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ರಚಿಸಲಾಗಿದೆ!",
    checkEmailConfirm: "ನೋಂದಣಿ ಯಶಸ್ವಿಯಾಗಿದೆ! ನಿಮ್ಮ ಖಾತೆಯನ್ನು ಖಚಿತಪಡಿಸಲು ದಯವಿಟ್ಟು ನಿಮ್ಮ ಇಮೇಲ್ ಪರಿಶೀಲಿಸಿ.",
    successSignOut: "ಯಶಸ್ವಿಯಾಗಿ ಲಾಗ್ ಔಟ್ ಮಾಡಲಾಗಿದೆ.",
    // Placeholders
    emailPlaceholder: "ನಿಮ್ಮ ಇಮೇಲ್ ವಿಳಾಸವನ್ನು ನಮೂದಿಸಿ",
    passwordPlaceholder: "ನಿಮ್ಮ ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ",
    fullNamePlaceholder: "ನಿಮ್ಮ ಹೆಸರು",
    agePlaceholder: "ವಯಸ್ಸು",
    emailRegisterPlaceholder: "ಉದಾಹರಣೆ: ramesh@gmail.com",
    passwordRegisterPlaceholder: "ಪಾಸ್‌ವರ್ಡ್ ರಚಿಸಿ",
    newPasswordPlaceholder: "ಹೊಸ ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ",
    // Language Dropdown Options
    EnglishOption: "ಇಂಗ್ಲಿಷ್",
    HindiOption: "ಹಿಂದಿ",
    KannadaOption: "ಕನ್ನಡ",
    TeluguOption: "ತೆలుಗು",
    TamilOption: "ತಮಿಳು",
    OtherOption: "ಇತರೆ",
    // Education Dropdown Options
    "No formal educationOption": "ಯಾವುದೇ ಔಪಚಾರಿಕ ಶಿಕ್ಷಣವಿಲ್ಲ",
    PrimaryOption: "ಪ್ರಾಥಮಿಕ ಶಿಕ್ಷಣ",
    SecondaryOption: "ದ್ವಿತೀಯ ಶಿಕ್ಷಣ",
    "Higher secondaryOption": "ಉನ್ನತ ಮಾಧ್ಯಮಿಕ ಶಿಕ್ಷಣ",
    "Senior citizenOption": "ಹಿರಿಯ ನಾಗರಿಕ",
    assessmentHistory: "ಮೌಲ್ಯಮಾಪನ ಇತಿಹಾಸ",
    noAttemptsYet: "ಇನ್ನೂ ಯಾವುದೇ ಮೌಲ್ಯಮಾಪನ ಪೂರ್ಣಗೊಂಡಿಲ್ಲ.",
    takeAssessmentBtn: "ಮೌಲ್ಯಮಾಪನ ಪ್ರಾರಂಭಿಸಿ",
    retakeAssessmentBtn: "ಮತ್ತೆ ಮೌಲ್ಯಮಾಪನ ತೆಗೆದುಕೊಳ್ಳಿ",
    questionProgress: "ಪ್ರಶ್ನೆ {current} ರ {total}",
    submitAssessmentBtn: "ಮೌಲ್ಯಮಾಪನವನ್ನು ಸಲ್ಲಿಸಿ",
    submittingAssessment: "ಮೌಲ್ಯಮಾಪನವನ್ನು ಸಲ್ಲಿಸಲಾಗುತ್ತಿದೆ...",
    resultsTitle: "ಮೌಲ್ಯಮಾಪನ ಫಲಿತಾಂಶಗಳು",
    correctAnswers: "ಸರಿಯಾದ ಉತ್ತರಗಳು",
    percentageScore: "ಶೇಕಡಾವಾರು ಅಂಕ",
    summaryLabel: "ಸಾರಾಂಶ",
    backToDashboardBtn: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹಿಂತಿರುಗಿ",
    categoryLabel: "ವರ್ಗ",
    dateLabel: "ದಿನಾಂక",
    answerAllPrompt: "ದಯವಿಟ್ಟು ಸಲ್ಲಿಸುವ ಮುನ್ನ ಎಲ್ಲಾ ಪ್ರಶ್ನೆಗಳಿಗೆ ಉತ್ತರಿಸಿ.",
    passwordWeak: "ದುರ್ಬಲ",
    passwordMedium: "ಮಧ್ಯಮ",
    passwordStrong: "ಬಲವಾದ",
  },
  Telugu: {
    initialAssessmentDesc: "మీ వ్యక్తిగతీకరించిన అభ్యాస స్థలానికి స్వాగతం! శీఘ్ర 15-ప్రశ్నల ప్రాథమిక అంచనాతో ప్రారంభిద్దాం. ఇది భవిష్యత్ కంటెంట్‌ని అనుకూలీకరించడానికి మాకు సహాయపడుతుంది।",
    heroTitle: "వ్యక్తిగతీకరించిన అక్షరాస్యత అభ్యాసం కోసం మీ AI సహచరుడు.",
    heroCopy: "మొదటి తరం అభ్యాసకులు, వృద్ధులు మరియు ప్రాంతీయ భాషా వినియోగదారుల కోసం రూపొందించబడింది. అసిస్టెంట్ అభ్యాసాన్ని అనుకూలిస్తుంది, సరళమైన అభిప్రాయాన్ని ఇస్తుంది మరియు వాయిస్ ఆధారిత పరస్పర చర్యకు మద్దతు ఇస్తుంది.",
    login: "లాగిన్",
    register: "నమోదు",
    welcomeBack: "స్వాగతం",
    signInToContinue: "మీ అభ్యాస ప్రయాణాన్ని కొనసాగించడానికి సైన్ ఇన్ చేయండి.",
    email: "ఈమెయిల్",
    password: "పాస్‌వర్డ్",
    forgotPasswordLink: "పాస్‌వర్డ్ మర్చిపోయారా?",
    newLearnerPrompt: "కొత్త అభ్యాసకులా? ప్రొఫైల్ సృష్టించడానికి నమోదుకు మారండి.",
    createProfile: "మీ అభ్యాస ప్రొఫైల్‌ను సృష్టించండి",
    fullName: "పూర్తి పేరు",
    age: "వయస్సు",
    preferredLanguage: "ప్రాధాన్యత కలిగిన భాష",
    selectLanguage: "భాషను ఎంచుకోండి",
    educationLevel: "విద్యా స్థాయి",
    selectEducation: "విద్యా స్థాయిని ఎంచుకోండి",
    personalizationHelp: "ఈ సమాచారం కంటెంట్, వాయిస్ మరియు ఫీడ్‌బ్యాక్‌ను వ్యక్తిగతీకరించడంలో సహాయపడుతుంది.",
    resetPasswordTitle: "పాస్‌వర్డ్ రీసెట్",
    enterEmailForLink: "పాస్‌వర్డ్ రీసెట్ లింక్‌ను స్వీకరించడానికి మీ ఇమెయిల్‌ను నమోదు చేయండి.",
    sendResetLink: "రీసెట్ లింక్ పంపండి",
    backToLogin: "లాగిన్‌కి తిరిగి వెళ్ళండి",
    resetAccountPassword: "మీ ఖాతా పాస్‌వర్డ్‌ను రీసెట్ చేయండి.",
    regainAccessCopy: "మీ అభ్యాస డాష్‌బోర్డ్‌ను యాక్సెస్ చేయడానికి దయచేసి కొత్త పాస్‌వర్డ్‌ను నమోదు చేయండి.",
    createNewPassword: "కొత్త పాస్‌వర్డ్‌ను సృష్టించండి",
    typeSecurePassword: "మీ సురక్షితమైన కొత్త పాస్‌వర్డ్‌ను టైప్ చేయండి.",
    newPassword: "కొత్త పాస్‌వర్డ్",
    updatePassword: "పాస్‌వర్డ్ నవీకరించు",
    hello: "నమస్కారం",
    logout: "లాగ్ అవుట్",
    welcomeToLisa: "LISAకు స్వాగతం",
    dashboardUnderConstruction: "మీ వ్యక్తిగతీకరించిన అక్షరాస్యత అభ్యాస డాష్‌బోర్డ్ నిర్మాణంలో ఉంది.",
    loadingMessage: "మీ అభ్యాస అనుభవాన్ని లోడ్ చేస్తోంది...",
    signingIn: "లాగిన్ అవుతోంది...",
    creatingAccount: "ఖాతాను సృష్టిస్తోంది...",
    sendingLink: "లింక్ పంపుతోంది...",
    resettingPassword: "పాస్‌వర్డ్ రీసెట్ చేస్తోంది...",
    signingOut: "లాగ్ అవుట్ అవుతోంది...",
    chooseLanguage: "మీ భాషను ఎంచుకోండి",
    selectLanguagePrompt: "ఇంటర్‌ఫేస్ కోసం ఒక భాషను ఎంచుకోండి.",
    changeLanguageBtn: "భాష మార్చండి",
    successLogin: "లాగిన్ విజయవంతమైంది!",
    successAccountCreated: "ఖాతా విజయవంతంగా సృష్టించబడింది!",
    checkEmailConfirm: "నమోదు విజయవంతమైంది! మీ ఖాతాను నిర్ధారించడానికి దయచేసి మీ ఇమెయిల్‌ను తనిఖీ చేయండి.",
    successSignOut: "విజయవంతంగా లాగ్ అవుట్ అయ్యారు.",
    // Placeholders
    emailPlaceholder: "మీ ఇమెయిల్ చిరునామాను నమోదు చేయండి",
    passwordPlaceholder: "మీ పాస్‌వర్డ్‌ను నమోదు చేయండి",
    fullNamePlaceholder: "మీ పేరు",
    agePlaceholder: "వయస్సు",
    emailRegisterPlaceholder: "ఉదాహరణ: ramesh@gmail.com",
    passwordRegisterPlaceholder: "పాస్‌వర్డ్‌ను సృష్టించండి",
    newPasswordPlaceholder: "కొత్త పాస్‌వర్డ్‌ను నమోదు చేయండి",
    // Language Dropdown Options
    EnglishOption: "ఇంగ్లీష్",
    HindiOption: "హిందీ",
    KannadaOption: "కన్నడ",
    TeluguOption: "తెలుగు",
    TamilOption: "తమిళం",
    OtherOption: "ఇతర",
    // Education Dropdown Options
    "No formal educationOption": "అధికారిక విద్య లేదు",
    PrimaryOption: "ప్రాథమిక విద్య",
    SecondaryOption: "ద్వితీయ విద్య",
    "Higher secondaryOption": "ఉన్నత మాధ్యమిక విద్య",
    "Senior citizenOption": "సీనియర్ సిటిజన్",
    assessmentHistory: "అంచనా చరిత్ర",
    noAttemptsYet: "ఇంకా ఎలాంటి అంచనాలు పూర్తి కాలేదు.",
    takeAssessmentBtn: "అంచనా ప్రారంభించండి",
    retakeAssessmentBtn: "మళ్లీ అంచనా వేయండి",
    questionProgress: "ప్రశ్న {current} యొక్క {total}",
    submitAssessmentBtn: "అంచనా సమర్పించండి",
    submittingAssessment: "అంచనా సమర్పించబడుతోంది...",
    resultsTitle: "అంచనా ఫలితాలు",
    correctAnswers: "సరైన సమాధానాలు",
    percentageScore: "శాతం స్కోరు",
    summaryLabel: "సారాంశం",
    backToDashboardBtn: "డాష్‌బోర్డ్‌కు తిరిగి వెళ్ళండి",
    categoryLabel: "వర్గం",
    dateLabel: "తేదీ",
    answerAllPrompt: "దయచేసి సమర్పించే ముందు అన్ని ప్రశ్నలకు సమాధానం ఇవ్వండి.",
    passwordWeak: "బలహీనమైనది",
    passwordMedium: "మధ్యస్థంగా ఉంది",
    passwordStrong: "బలంగా ఉంది",
  },
  Tamil: {
    initialAssessmentDesc: "உங்கள் தனிப்பயனாக்கப்பட்ட கற்றல் இடத்திற்கு வரவேற்கிறோம்! 15-கேள்விகள் கொண்ட விரைவான ஆரம்ப மதிப்பீட்டுடன் தொடங்குவோம். இது எதிர்கால பாடங்களை வடிவமைக்க நமக்கு உதவும்।",
    heroTitle: "தனிப்பயனாக்கப்பட்ட எழுத்தறிவு கற்றலுக்கான உங்கள் AI துணை.",
    heroCopy: "முதல் தலைமுறை கற்பவர்கள், முதியவர்கள் மற்றும் பிராந்திய மொழி பயனர்களுக்காக உருவாக்கப்பட்டது. உதவியாளர் கற்றலை மாற்றியமைத்து, எளிய கருத்துக்களை வழங்கி, குரல் வழி தொடர்புகளை ஆதரிக்கிறது.",
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
    personalizationHelp: "இந்தத் தகவல் உள்ளடக்கம், குரல் மற்றும் கருத்துக்களைத் தனிப்பயனாக்க உதவுகிறது.",
    resetPasswordTitle: "கடவுச்சொல்லை மீட்டமை",
    enterEmailForLink: "கடவுச்சொல் மீட்பு இணைப்பைப் பெற உங்கள் மின்னஞ்சலை உள்ளிடவும்.",
    sendResetLink: "மீட்பு இணைப்பை அனுப்பு",
    backToLogin: "உள்நுழைவுக்குத் திரும்பு",
    resetAccountPassword: "உங்கள் கணக்கின் கடவுச்சொல்லை மீட்டமைக்கவும்.",
    regainAccessCopy: "உங்கள் கற்றல் டாஷ்போர்டை அணுக புதிய கடவுச்சொல்லை உள்ளிடவும்.",
    createNewPassword: "புதிய கடவுச்சொல்லை உருவாக்கவும்",
    typeSecurePassword: "உங்கள் புதிய கடவுச்சொல்லை உள்ளிடவும்.",
    newPassword: "புதிய கடவுச்சொல்",
    updatePassword: "கடவுச்சொல்லை புதுப்பி",
    hello: "வணக்கம்",
    logout: "வெளியேறு",
    welcomeToLisa: "LISA-விற்கு வரவேற்கிறோம்",
    dashboardUnderConstruction: "உங்கள் தனிப்பயனாக்கப்பட்ட எழுத்தறிவு கற்றல் டாஷ்போர்டு தயாராகி வருகிறது.",
    loadingMessage: "உங்கள் கற்றல் அனுபவத்தை ஏற்றுகிறது...",
    signingIn: "உள்நுழைகிறது...",
    creatingAccount: "சுயவிவரம் உருவாக்கப்படுகிறது...",
    sendingLink: "இணைப்பு அனுப்பப்படுகிறது...",
    resettingPassword: "கடவுச்சொல் மீட்டமைக்கப்படுகிறது...",
    signingOut: "வெளியேறுகிறது...",
    chooseLanguage: "உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்",
    selectLanguagePrompt: "இடைமுகத்திற்கான மொழியைத் தேர்ந்தெடுக்கவும்.",
    changeLanguageBtn: "மொழியை மாற்று",
    successLogin: "உள்நுழைவு வெற்றிகரமாக முடிந்தது!",
    successAccountCreated: "சுயவிவரம் வெற்றிகரமாக உருவாக்கப்பட்டது!",
    checkEmailConfirm: "பதிவு வெற்றிகரமாக முடிந்தது! உங்கள் கணக்கை உறுதிப்படுத்த மின்னஞ்சலைச் சரிபார்க்கவும்.",
    successSignOut: "வெற்றிகரமாக வெளியேறப்பட்டது.",
    // Placeholders
    emailPlaceholder: "உங்கள் மின்னஞ்சல் முகவரியை உள்ளிடவும்",
    passwordPlaceholder: "உங்கள் கடவுச்சொல்லை உள்ளிடவும்",
    fullNamePlaceholder: "உங்கள் பெயர்",
    agePlaceholder: "வயது",
    emailRegisterPlaceholder: "உதாரணம்: ramesh@gmail.com",
    passwordRegisterPlaceholder: "கடவுச்சொல்லை உருவாக்கவும்",
    newPasswordPlaceholder: "புதிய கடவுச்சொல்லை உள்ளிடவும்",
    // Language Dropdown Options
    EnglishOption: "ஆங்கிலம்",
    HindiOption: "இந்தி",
    KannadaOption: "கன்னடம்",
    TeluguOption: "தெலுங்கு",
    TamilOption: "தமிழ்",
    OtherOption: "மற்றவை",
    // Education Dropdown Options
    "No formal educationOption": "முறையான கல்வி இல்லை",
    PrimaryOption: "தொடக்கக் கல்வி",
    SecondaryOption: "இடைநிலைக் கல்வி",
    "Higher secondaryOption": "மேல்நிலைக் கல்வி",
    "Senior citizenOption": "முதியவர் / மூத்த குடிமகன்",
    assessmentHistory: "மதிப்பீட்டு வரலாறு",
    noAttemptsYet: "இன்னும் மதிப்பீடுகள் எதுவும் செய்யப்படவில்லை.",
    takeAssessmentBtn: "மதிப்பீட்டைத் தொடங்கு",
    retakeAssessmentBtn: "மீண்டும் மதிப்பிடுக",
    questionProgress: "கேள்வி {current}-ல் {total}",
    submitAssessmentBtn: "மதிப்பீட்டை சமர்ப்பி",
    submittingAssessment: "மதிப்பீடு சமர்ப்பிக்கப்படுகிறது...",
    resultsTitle: "மதிப்பீட்டு முடிவுகள்",
    correctAnswers: "சரியான பதில்கள்",
    percentageScore: "சதவீத மதிப்பெண்",
    summaryLabel: "சுருக்கம்",
    backToDashboardBtn: "டாஷ்போர்டுக்குத் திரும்பு",
    categoryLabel: "வகை",
    dateLabel: "தேதி",
    answerAllPrompt: "சமர்ப்பிக்கும் முன் அனைத்து கேள்விகளுக்கும் பதிலளிக்கவும்.",
    passwordWeak: "பலவீனமானது",
    passwordMedium: "நடுத்தரமானது",
    passwordStrong: "வலிமையானது",
  },
};


// Helper to generate custom assessmentQuestions for 4 ages x 5 levels
const assessmentQuestions = {
  general_assessment: {
    title: {
      English: "Initial Literacy Assessment",
      Hindi: "प्रारंभिक साक्षरता आकलन",
      Kannada: "ಆರಂಭಿಕ ಸಾಕ್ಷರತಾ ಮೌಲ್ಯಮಾಪನ",
      Telugu: "ప్రారంభ అక్షరాస్యత అంచనా",
      Tamil: "ஆరம்ப எழுத்தறிவு மதிப்பீடு"
    },
    description: {
      English: "15 questions spanning Levels 1 to 5 to evaluate your current literacy baseline.",
      Hindi: "आपके वर्तमान साक्षरता स्तर का मूल्यांकन करने के लिए स्तर 1 से 5 तक के 15 प्रश्न।",
      Kannada: "ನಿಮ್ಮ ಪ್ರಸ್ತುತ ಸಾಕ್ಷರತಾ ಮಟ್ಟವನ್ನು ಮೌಲ್ಯಮಾಪನ ಮಾಡಲು ಹಂತ 1 ರಿಂದ 5 ರವರೆಗಿನ 15 ಪ್ರಶ್ನೆಗಳು.",
      Telugu: "మీ ప్రస్తుత అక్షరాస్యత స్థాయిని అంచనా వేయడానికి స్థాయి 1 నుండి 5 వరకు 15 ప్రశ్నలు.",
      Tamil: "உங்கள் தற்போதைய எழுத்தறிவு நிலையை மதிப்பிட நிலை 1 முதல் 5 வரையிலான 15 கேள்விகள்."
    },
    questions: [
      {
        id: "gen_q_1",
        question: {
          English: "Which letter matches the shape of capital 'A'?",
          Hindi: "कौन सा अक्षर बड़े अक्षर 'A' के आकार से मेल खाता है?",
          Kannada: "ಯಾವ ಅಕ್ಷರವು ದೊಡ್ಡ ಅಕ್ಷರ 'A' ನ ಆಕಾರಕ್ಕೆ ಹೊಂದಿಕೆಯಾಗುತ್ತದೆ?",
          Telugu: "ఏ అక్షరం క్యాపిటల్ 'A' ఆకారంతో సరిపోలుతుంది?",
          Tamil: "எந்த எழுத்து பெரிய எழுத்து 'A'-இன் வடிவத்துடன் ஒத்துப்போகிறது?"
        },
        options: {
          English: ["V", "H", "M", "A"],
          Hindi: ["V", "H", "M", "A"],
          Kannada: ["V", "H", "M", "A"],
          Telugu: ["V", "H", "M", "A"],
          Tamil: ["V", "H", "M", "A"]
        },
        correctIndex: 3
      },
      {
        id: "gen_q_2",
        question: {
          English: "Find the lowercase letter that matches 'b'.",
          Hindi: "छोटे अक्षर 'b' से मेल खाने वाला अक्षर खोजें।",
          Kannada: "ಸಣ್ಣ ಅಕ್ಷರ 'b' ಗೆ ಹೊಂದಿಕೆಯಾಗುವ ಅಕ್ಷರವನ್ನು ಹುಡುಕಿ.",
          Telugu: "చిన్న అక్షరం 'b' కి సరిపోయే అక్షరాన్ని కనుగొనండి.",
          Tamil: "'b' என்ற சிறிய எழுத்துடன் பொருந்தும் எழுத்தைக் கண்டறியவும்."
        },
        options: {
          English: ["p", "d", "q", "b"],
          Hindi: ["p", "d", "q", "b"],
          Kannada: ["p", "d", "q", "b"],
          Telugu: ["p", "d", "q", "b"],
          Tamil: ["p", "d", "q", "b"]
        },
        correctIndex: 3
      },
      {
        id: "gen_q_3",
        question: {
          English: "Which letter looks like a circular ring?",
          Hindi: "कौन सा अक्षर एक वृत्ताकार रिंग (गोले) जैसा दिखता है?",
          Kannada: "ಯಾವ ಅಕ್ಷರವು ವೃತ್ತಾಕಾರದ ಬಳೆಯಂತೆ ಕಾಣುತ್ತದೆ?",
          Telugu: "ఏ అಕ್ಷరం గుండ్రటి వలయంలా ఉంటుంది?",
          Tamil: "வட்ட வளையம் போல இருக்கும் எழுத்து எது?"
        },
        options: {
          English: ["L", "X", "T", "O"],
          Hindi: ["L", "X", "T", "O"],
          Kannada: ["L", "X", "T", "O"],
          Telugu: ["L", "X", "T", "O"],
          Tamil: ["L", "X", "T", "O"]
        },
        correctIndex: 3
      },
      {
        id: "gen_q_4",
        question: {
          English: "Which letter makes the starting sound of the word 'Cat'?",
          Hindi: "कौन सा अक्षर 'Cat' (बिल्ली) शब्द की शुरुआती ध्वनि बनाता है?",
          Kannada: "ಯಾವ ಅಕ್ಷರವು 'Cat' ಪದದ ಆರಂಭಿಕ ಧ್ವನಿಯನ್ನು ಮಾಡುತ್ತದೆ?",
          Telugu: "'Cat' పదానికి ప్రారంభ ధ్వనిని ఏ అక్షరం చేస్తుంది?",
          Tamil: "'Cat' என்ற வார்த்தையின் தொடக்க ஒலியை எந்த எழுத்து உருவாக்குகிறது?"
        },
        options: {
          English: ["S", "K", "G", "C"],
          Hindi: ["S", "K", "G", "C"],
          Kannada: ["S", "K", "G", "C"],
          Telugu: ["S", "K", "G", "C"],
          Tamil: ["S", "K", "G", "C"]
        },
        correctIndex: 3
      },
      {
        id: "gen_q_5",
        question: {
          English: "Identify the missing letter in the word: 'D_g'.",
          Hindi: "शब्द में छूटा हुआ अक्षर पहचानें: 'D_g'।",
          Kannada: "ಪದದಲ್ಲಿ ಬಿಟ್ಟುಹೋದ ಅಕ್ಷರವನ್ನು ಗುರುತಿಸಿ: 'D_g'.",
          Telugu: "పదంలో లేని అక్షరాన్ని గుర్తించండి: 'D_g'.",
          Tamil: "வார்த்தையில் விடுபட்ட எழுத்தைக் கண்டறியவும்: 'D_g'."
        },
        options: {
          English: ["e", "a", "i", "o"],
          Hindi: ["e", "a", "i", "o"],
          Kannada: ["e", "a", "i", "o"],
          Telugu: ["e", "a", "i", "o"],
          Tamil: ["e", "a", "i", "o"]
        },
        correctIndex: 3
      },
      {
        id: "gen_q_6",
        question: {
          English: "Choose the correct word for the picture of something we read:",
          Hindi: "हम जो पढ़ते हैं उसके चित्र के लिए सही शब्द चुनें:",
          Kannada: "ನಾವು ಓದುವ ವಸ್ತುವಿನ ಚಿತ್ರಕ್ಕೆ ಸರಿಯಾದ ಪದವನ್ನು ಆರಿಸಿ:",
          Telugu: "మనం చదివే వస్తువు కోసం సరైన పదాన్ని ఎంచుకోండి:",
          Tamil: "நாம் படிக்கும் பொருளுக்கான சரியான வார்த்தையைத் தேர்ந்தெடுக்கவும்:"
        },
        options: {
          English: ["Bed", "Bag", "Bus", "Book"],
          Hindi: ["Bed (बिस्तर)", "Bag (बस्ता)", "Bus (बस)", "Book (किताब)"],
          Kannada: ["Bed (ಹಾಸಿಗೆ)", "Bag (ಚೀಲ)", "Bus (ಬಸ್ಸು)", "Book (ಪುಸ್ತಕ)"],
          Telugu: ["Bed (మంచం)", "Bag (సంచీ)", "Bus (బస్సు)", "Book (పుస్తకం)"],
          Tamil: ["Bed (படுக்கை)", "Bag (பைய்)", "Bus (பேருந்து)", "Book (புத்தகம்)"]
        },
        correctIndex: 3
      },
      {
        id: "gen_q_7",
        question: {
          English: "Complete the sentence: 'The sun shines in the ______.'",
          Hindi: "वाक्य पूरा करें: 'The sun shines in the ______.'",
          Kannada: "ವಾಕ್ಯ ಪೂರ್ಣಗೊಳಿಸಿ: 'The sun shines in the ______.'",
          Telugu: "వాక్యాన్ని పూర్తి చేయండి: 'The sun shines in the ______.'",
          Tamil: "வாக்கியத்தை நிரப்புக: 'The sun shines in the ______.'"
        },
        options: {
          English: ["ground", "water", "house", "sky"],
          Hindi: ["ground (ज़मीन)", "water (पानी)", "house (घर)", "sky (आसमान)"],
          Kannada: ["ground (ನೆಲ)", "water (ನೀರು)", "house (ಮನೆ)", "sky (ಆಕಾಶ)"],
          Telugu: ["ground (నేల)", "water (నీరు)", "house (ఇల్లు)", "sky (ఆకాశం)"],
          Tamil: ["ground (தரை)", "water (தண்ணீர்)", "house (வீடு)", "sky (வானம்)"]
        },
        correctIndex: 3
      },
      {
        id: "gen_q_8",
        question: {
          English: "Complete the sentence: 'I write on paper with a ______.'",
          Hindi: "वाक्य पूरा करें: 'I write on paper with a ______.'",
          Kannada: "ವಾಕ್ಯ ಪೂರ್ಣಗೊಳಿಸಿ: 'I write on paper with a ______.'",
          Telugu: "వాక్యాన్ని పూర్తి చేయండి: 'I write on paper with a ______.'",
          Tamil: "வாக்கியத்தை நிரப்புக: 'I write on paper with a ______.'"
        },
        options: {
          English: ["shoe", "cup", "spoon", "pen"],
          Hindi: ["shoe (जूता)", "cup (कप)", "spoon (चम्मच)", "pen (कलम)"],
          Kannada: ["shoe (ಶೂ)", "cup (ಕಪ್)", "spoon (ಚಮಚ)", "pen (ಪೆನ್ನು)"],
          Telugu: ["shoe (షూ)", "cup (కప్పు)", "spoon (స్పూన్)", "pen (కలం)"],
          Tamil: ["shoe (காலணி)", "cup (கோப்பை)", "spoon (கரண்டி)", "pen (பேನಾ)"]
        },
        correctIndex: 3
      },
      {
        id: "gen_q_9",
        question: {
          English: "Complete the sentence: 'Fish live in the ______.'",
          Hindi: "वाक्य पूरा करें: 'Fish live in the ______.'",
          Kannada: "ವಾಕ್ಯ ಪೂರ್ಣಗೊಳಿಸಿ: 'Fish live in the ______.'",
          Telugu: "వాక్యాన్ని పూర్తి చేయండి: 'Fish live in the ______.'",
          Tamil: "வாக்கியத்தை நிரப்புக: 'Fish live in the ______.'"
        },
        options: {
          English: ["forest", "sky", "desert", "water"],
          Hindi: ["forest (जंगल)", "sky (आसमान)", "desert (रेगिस्तान)", "water (पानी)"],
          Kannada: ["forest (ಕಾಡು)", "sky (ಆಕಾಶ)", "desert (ಮರುಭೂಮಿ)", "water (ನೀರು)"],
          Telugu: ["forest (అడవి)", "sky (ఆకాశం)", "desert (ఎడారి)", "water (నీరు)"],
          Tamil: ["forest (காடு)", "sky (வானம்)", "desert (பாலைவனம்)", "water (தண்ணீர்)"]
        },
        correctIndex: 3
      },
      {
        id: "gen_q_10",
        question: {
          English: "Read the road sign: 'STOP'. What should a driver do?",
          Hindi: "सड़क का बोर्ड पढ़ें: 'STOP' (रुकें)। चालक को क्या करना चाहिए?",
          Kannada: "ರಸ್ತೆ ಚಿಹ್ನೆಯನ್ನು ಓದಿ: 'STOP'. ಚಾಲಕ ಏನು ಮಾಡಬೇಕು?",
          Telugu: "రహదారి బోర్డు చదవండి: 'STOP'. డ్రైవర్ ఏమి చేయాలి?",
          Tamil: "சாலைப் பலகையைப் படிக்கவும்: 'STOP'. ஓட்டுநர் என்ன செய்ய வேண்டும்?"
        },
        options: {
          English: ["Turn left", "Run fast", "Speed up", "Stop moving"],
          Hindi: ["बाएं मुड़ें", "तेज़ दौड़ें", "गति बढ़ाएं", "रुकें"],
          Kannada: ["ಎಡಕ್ಕೆ ತಿರುಗಿ", "ವೇಗವಾಗಿ ಓಡಿ", "ವೇಗವನ್ನು ಹೆಚ್ಚಿಸಿ", "ಚಲಿಸುವುದನ್ನು ನಿಲ್ಲಿಸಿ"],
          Telugu: ["ఎడమ వైపు తిరగాలి", "వేగంగా వెళ్లాలి", "వేగం పెంచాలి", "వాహనం ఆపాలి"],
          Tamil: ["இடதுபுறம் திரும்பவும்", "வேகமாக ஓடவும்", "வேகமாகச் செல்லவும்", "செல்வதை நிறுத்தவும்"]
        },
        correctIndex: 3
      },
      {
        id: "gen_q_11",
        question: {
          English: "Read the instruction: 'Take one pill after dinner every night.' When should you take the pill?",
          Hindi: "निर्देश पढ़ें: 'Take one pill after dinner every night.' आपको गोली कब लेनी चाहिए?",
          Kannada: "ಸೂಚನೆಯನ್ನು ಓದಿ: 'Take one pill after dinner every night.' ನೀವು ಮಾತ್ರೆಯನ್ನು ಯಾವಾಗ ತೆಗೆದುಕೊಳ್ಳಬೇಕು?",
          Telugu: "ఈ సూచనను చదవండి: 'Take one pill after dinner every night.' మీరు టాబ్లెట్ ఎప్పుడు వేసుకోవాలి?",
          Tamil: "அறிவுறுத்தலைப் படிக்கவும்: 'Take one pill after dinner every night.' மாத்திரையை எப்போது சாப்பிட வேண்டும்?"
        },
        options: {
          English: ["Empty stomach", "Before lunch", "In the morning", "After dinner"],
          Hindi: ["खाली पेट", "दोपहर के भोजन से पहले", "सुबह में", "रात के खाने के बाद"],
          Kannada: ["ಖಾಲಿ ಹೊಟ್ಟೆಯಲ್ಲಿ", "ಮಧ್ಯಾಹ್ನದ ಊಟಕ್ಕೆ ಮುನ್ನ", "ಬೆಳಿಗ್ಗೆ", "ರಾತ್ರಿ ಊಟದ ನಂತರ"],
          Telugu: ["పరగడుపున", "మధ్యాహ్నం భోజనానికి ముందు", "ఉదయం", "రాత్రి భోజనం తర్వాత"],
          Tamil: ["வெறும் வயிற்றில்", "మதிய உணவுக்கு முன்", "காலையில்", "இரவு உணவுக்குப் பின்"]
        },
        correctIndex: 3
      },
      {
        id: "gen_q_12",
        question: {
          English: "Read the sign: 'ENTRANCE'. What does it mean?",
          Hindi: "संकेत पढ़ें: 'ENTRANCE' (प्रवेश)। इसका क्या अर्थ है?",
          Kannada: "ಚಿಹ್ನೆಯನ್ನು ಓದಿ: 'ENTRANCE'. ಇದರ ಅರ್ಥವೇನು?",
          Telugu: "'ENTRANCE' బోర్డు చదవండి. దీని అర్థం ఏమిటి?",
          Tamil: "'ENTRANCE' பலகையைப் படிக்கவும். இதன் பொருள் என்ன?"
        },
        options: {
          English: ["Closed area", "Way to go out", "No entry", "Way to go inside"],
          Hindi: ["बंद क्षेत्र", "बाहर जाने का रास्ता", "प्रवेश निषेध", "अंदर जाने का रास्ता"],
          Kannada: ["ಮುಚ್ಚಿದ ಪ್ರದೇಶ", "ಹೊರಹೋಗುವ ದಾರಿ", "ಪ್ರವೇಶವಿಲ್ಲ", "ಒಳಗೆ ಹೋಗುವ ದಾರಿ"],
          Telugu: ["మూసి ఉన్న ప్రాంతం", "బయటకు వెళ్లే దారి", "ప్రవేశం లేదు", "లోపలికి వెళ్లే దారి"],
          Tamil: ["மூடப்பட்ட பகுதி", "வெளியேறும் வழி", "நுழையக் கூடாது", "உள்ளே செல்லும் வழி"]
        },
        correctIndex: 3
      },
      {
        id: "gen_q_13",
        question: {
          English: "Read the message: 'The train is delayed by two hours and will arrive at 11 AM.' What time will the train arrive?",
          Hindi: "संदेश पढ़ें: 'The train is delayed by two hours and will arrive at 11 AM.' ट्रेन किस समय पहुंचेगी?",
          Kannada: "ಸಂದೇಶವನ್ನು ಓದಿ: 'The train is delayed by two hours and will arrive at 11 AM.' ರೈಲು ಯಾವ 시간ಕ್ಕೆ ಬರಲಿದೆ?",
          Telugu: "ఈ సందేశాన్ని చదవండి: 'The train is delayed by two hours and will arrive at 11 AM.' రైలు ఏ సమయానికి చేరుకుంటుంది?",
          Tamil: "செய்தியைப் படிக்கவும்: 'The train is delayed by two hours and will arrive at 11 AM.' ரயில் எத்தனை மணிக்கு வரும்?"
        },
        options: {
          English: ["12 PM", "9 AM", "10 AM", "11 AM"],
          Hindi: ["दोपहर 12 बजे", "सुबह 9 बजे", "सुबह 10 बजे", "सुबह 11 बजे"],
          Kannada: ["ಮಧ್ಯಾಹ್ನ 12 ಕ್ಕೆ", "ಬೆಳಿಗ್ಗೆ 9 ಕ್ಕೆ", "ಬೆಳಿಗ್ಗೆ 10 ಕ್ಕೆ", "ಬೆಳಿಗ್ಗೆ 11 ಕ್ಕೆ"],
          Telugu: ["మధ్యాహ్నం 12 గంటలకు", "ఉదయం 9 గంటలకు", "ఉదయం 10 గంటలకు", "ఉదయం 11 గంటలకు"],
          Tamil: ["மதியம் 12 மணி", "காலை 9 மணி", "காலை 10 மணி", "காலை 11 மணி"]
        },
        correctIndex: 3
      },
      {
        id: "gen_q_14",
        question: {
          English: "Complete the sentence: 'To withdraw money safely, visit the ______.'",
          Hindi: "वाक्य पूरा करें: 'To withdraw money safely, visit the ______.'",
          Kannada: "ವಾಕ್ಯ ಪೂರ್ಣಗೊಳಿಸಿ: 'To withdraw money safely, visit the ______.'",
          Telugu: "వాక్యాన్ని పూర్తి చేయండి: 'To withdraw money safely, visit the ______.'",
          Tamil: "வாக்கியத்தை நிரப்புக: 'To withdraw money safely, visit the ______.'"
        },
        options: {
          English: ["park", "school", "market", "bank"],
          Hindi: ["park (पार्क)", "school (स्कूल)", "market (बाज़ार)", "bank (बैंक)"],
          Kannada: ["park (ಉದ್ಯಾನವನ)", "school (ಶಾಲೆ)", "market (ಮಾರುಕಟ್ಟೆ)", "bank (ಬ್ಯಾಂಕ್)"],
          Telugu: ["park (పార్క్)", "school (బడి)", "market (మార్కెట్)", "bank (బ్యాంకు)"],
          Tamil: ["park (பூங்கா)", "school (பள்ளி)", "market (சந்தை)", "bank (வங்கி)"]
        },
        correctIndex: 3
      },
      {
        id: "gen_q_15",
        question: {
          English: "Read the park notice: 'The walking track is open from 6 AM to 9 AM.' What is the track used for?",
          Hindi: "पार्क का नोटिस पढ़ें: 'The walking track is open from 6 AM to 9 AM.' ट्रैक का उपयोग किस लिए किया जाता है?",
          Kannada: "ಪಾರ್ಕ್ ಸೂಚನೆಯನ್ನು ಓದಿ: 'The walking track is open from 6 AM to 9 AM.' ಈ ಹಾದಿಯನ್ನು ಯಾವುದಕ್ಕೆ ಬಳಸಲಾಗುತ್ತದೆ?",
          Telugu: "పార్క్ నోటీసు చదవండి: 'The walking track is open from 6 AM to 9 AM.' ఈ దారి దేనికి ఉపయోగించబడుతుంది?",
          Tamil: "பூங்கா அறிவிப்பைப் படிக்கவும்: 'The walking track is open from 6 AM to 9 AM.' இந்தப் பாதை எதற்குப் பயன்படுகிறது?"
        },
        options: {
          English: ["Cycling", "Running", "Playing football", "Walking"],
          Hindi: ["साइकिल चलाने के लिए", "दौड़ने के लिए", "फुटबॉल खेलने के लिए", "टहलने (Walking) के लिए"],
          Kannada: ["ಸೈಕಲ್ ತುಳಿಯಲು", "ಓಡಲು", "ಫುಟ್‌ಬಾಲ್ ಆಡಲು", "ನಡೆಯಲು (Walking)"],
          Telugu: ["సైకిల్ తొక్కడానికి", "పరుగెత్తడానికి", "ఫుట్ బాల్ ఆడటానికి", "నడవడానికి (Walking)"],
          Tamil: ["சைக்கிள் ஓட்ட", "ஓடுவதற்கு", "கால்பந்து விளையாட", "நடைபயிற்சிக்கு (Walking)"]
        },
        correctIndex: 3
      }
    ]
  }
};

function App() {
  const getLocalizedText = (value) => {
    if (!value) return "";
    if (typeof value === "object") {
      return value[selectedLanguage] || value["English"] || "";
    }
    return value;
  };

  const getLocalizedOptions = (optionsObj) => {
    if (!optionsObj) return [];
    if (typeof optionsObj === "object" && !Array.isArray(optionsObj)) {
      return optionsObj[selectedLanguage] || optionsObj["English"] || [];
    }
    return optionsObj;
  };

  const [selectedLanguage, setSelectedLanguage] = useState(
    localStorage.getItem("lisa_lang") || null
  );
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("login"); // "login", "register", or "forgot"
  const [message, setMessage] = useState("");
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [registerPassword, setRegisterPassword] = useState("");

  // Assessment related states
  const [assessmentState, setAssessmentState] = useState("not_started"); // "not_started" | "answering" | "submitting" | "results"
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [currentAttemptResult, setCurrentAttemptResult] = useState(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editAge, setEditAge] = useState("");
  const [editEdLevel, setEditEdLevel] = useState("");

  const handleStartEditProfile = () => {
    setEditAge(profile?.age || "");
    setEditEdLevel(profile?.education_level || "");
    setEditingProfile(true);
  };

  const handleSaveProfile = async () => {
    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .update({
          age: parseInt(editAge, 10),
          education_level: editEdLevel
        })
        .eq("id", session.user.id)
        .select()
        .single();
      if (error) {
        console.error("Error updating profile:", error.message);
        alert("Failed to update profile: " + error.message);
      } else {
        setProfile(data);
        setEditingProfile(false);
      }
    } catch (err) {
      console.error("Unexpected error updating profile:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const getCategory = () => {
    return "general_assessment";
  };

  useEffect(() => {
    // Check initial session
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

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.warn("Could not fetch profile:", error.message);
      } else {
        setProfile(data);
        const localLang = localStorage.getItem("lisa_lang") || selectedLanguage;
        if (localLang && data.preferred_language !== localLang) {
          // Sync database with the locally selected language
          supabase
            .from("profiles")
            .update({ preferred_language: localLang })
            .eq("id", userId)
            .then(({ error: updateErr }) => {
              if (!updateErr) {
                setProfile(prev => prev ? { ...prev, preferred_language: localLang } : null);
              }
            });
        } else if (data.preferred_language) {
          setSelectedLanguage(data.preferred_language);
          localStorage.setItem("lisa_lang", data.preferred_language);
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
        if (error) {
          console.warn("Could not update database profile language:", error.message);
        } else {
          setProfile(prev => prev ? { ...prev, preferred_language: lang } : null);
        }
      } catch (err) {
        console.error("Error updating profile language in DB:", err);
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

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

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
    const fullName = formData.get("fullName");
    const age = parseInt(formData.get("age"), 10);
    const language = formData.get("language");
    const educationLevel = formData.get("educationLevel");

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

    const user = data.user;
    if (user) {
      if (data.session) {
        setMessage(t("successAccountCreated"));
        setProfile({
          full_name: fullName,
          age,
          preferred_language: language,
          education_level: educationLevel,
        });
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

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setMessage(`Error resetting password: ${error.message}`);
    } else {
      // Sign out first to clear the session so we don't flash the dashboard
      await supabase.auth.signOut();
      setRecoveryMode(false);
      setActiveTab("login");
      setMessage(t("successResetPassword"));
    }
    setSubmitting(false);
  };

  const handleSignOut = async () => {
    setSubmitting(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      setMessage(`Sign out error: ${error.message}`);
    } else {
      setMessage(t("successSignOut"));
      setTimeout(() => {
        setMessage("");
      }, 3000);
    }
    setSubmitting(false);
  };

  const getLangAbbrev = (lang) => {
    switch (lang) {
      case "Hindi": return "HI";
      case "Kannada": return "KN";
      case "Telugu": return "TE";
      case "Tamil": return "TA";
      case "English":
      default:
        return "EN";
    }
  };

  // Helper to translate strings
  const t = (key) => {
    const lang = selectedLanguage || "English";
    const dict = translations[lang] || translations["English"];

    if (key === "successForgotPasswordLink") {
      return lang === "Hindi" ? "पासवर्ड रीसेट लिंक भेजा गया! कृपया अपना ईमेल जांचें।" :
        lang === "Kannada" ? "ಪಾಸ್‌ವರ್ಡ್ ಮರುಹೊಂದಿಸುವ ಲಿಂಕ್ ಕಳುಹಿಸಲಾಗಿದೆ! ನಿಮ್ಮ ಇಮೇಲ್ ಪರಿಶೀಲಿಸಿ." :
          lang === "Telugu" ? "పాస్‌వర్డ్ రీసెట్ లింక్ పంపబడింది! దయచేసి మీ ఇమెయిల్ తనిఖీ చేయండి." :
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

  // 2. Initial Loading Screen
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

  // Language Dropdown Selector Component
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

  // 3. Recovery Mode (Reset Password Form)
  if (recoveryMode) {
    return (
      <main className="shell">
        <div className="brand-logo-top">LISA</div>
        {renderLanguageDropdown()}
        <section className="hero-panel">
          <h1>{t("resetAccountPassword")}</h1>
          <p className="hero-copy">{t("regainAccessCopy")}</p>
        </section>

        <section className="auth-panel" aria-label="Reset Password">
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

  const getSummary = (score, lang) => {
    if (score >= 9) {
      switch (lang) {
        case "Hindi": return "उत्कृष्ट! इस क्षेत्र में आपके पास मजबूत कौशल हैं। आप उन्नत मॉड्यूल पर आगे बढ़ने के लिए तैयार हैं।";
        case "Kannada": return "ಅತ್ಯುತ್ತಮ! ಈ ಕ್ಷೇತ್ರದಲ್ಲಿ ನೀವು ಬಲವಾದ ಕೌಶಲ್ಯಗಳನ್ನು ಹೊಂದಿದ್ದೀರಿ. ನೀವು ಸುಧಾರಿತ ಮಾಡ್ಯೂಲ್‌ಗಳಿಗೆ ಮುಂದುವರಿಯಲು ಸಿದ್ಧರಿದ್ದೀರಿ.";
        case "Telugu": return "అద్భుతమైనది! ఈ రంగంలో మీకు బలమైన నైపుణ్యాలు ఉన్నాయి. మీరు అధునాతన మాడ్యూల్స్‌కు వెళ్ళడానికి సిద్ధంగా ఉన్నారు.";
        case "Tamil": return "மிகச்சிறப்பு! இந்தத் துறையில் உங்களுக்கு வலுவான திறன்கள் உள்ளன. நீங்கள் மேம்பட்ட பாடங்களுக்குச் செல்லத் தயாராக உள்ளீர்கள்.";
        default: return "Excellent! You have strong skills in this area. You're ready to proceed to advanced modules.";
      }
    } else if (score >= 6) {
      switch (lang) {
        case "Hindi": return "अच्छा काम किया! आपका आधार मजबूत है। हम कुछ विषयों को दोहराने में आपकी मदद करेंगे।";
        case "Kannada": return "ಉತ್ತಮ ಕೆಲಸ! ನಿಮ್ಮ ಬುನಾದಿ ಗಟ್ಟಿಯಾಗಿದೆ. ಕೆಲವು ವಿಷಯಗಳನ್ನು ಪುನರಾವರ್ತಿಸಲು ನಾವು ನಿಮಗೆ ಸಹಾಯ ಮಾಡುತ್ತೇವೆ.";
        case "Telugu": return "మంచి ప్రయత్నం! మీ పునాది బలంగా ఉంది. కొన్ని అంశాలను పునశ్చరణ చేయడానికి మేము మీకు సహాయం చేస్తాము.";
        case "Tamil": return "நல்ல முயற்சி! உங்களுக்கு நல்ல அடிப்படை அறிவு உள்ளது. சில தலைப்புகளை மீண்டும் பயிற்சி செய்ய நாங்கள் உதவுவோம்.";
        default: return "Good job! You've got a solid foundation. We'll help you brush up on a few topics.";
      }
    } else {
      switch (lang) {
        case "Hindi": return "शानदार प्रयास! आपके आत्मविश्वास और कौशल को बढ़ाने के लिए हम बुनियादी अवधारणाओं से शुरू करेंगे।";
        case "Kannada": return "ಉತ್ತಮ ಪ್ರಯತ್ನ! ನಿಮ್ಮ ಆತ್ಮವಿಶ್ವಾಸ ಮತ್ತು ಕೌಶಲ್ಯಗಳನ್ನು ಬೆಳೆಸಲು ನಾವು ಮೂಲಭೂತ ಪರಿಕಲ್ಪನೆಗಳಿಂದ ಪ್ರಾರಂಭಿಸುತ್ತೇವೆ.";
        case "Telugu": return "గొప్ప ప్రయత్నం! మీ విశ్వాసాన్ని మరియు నైపుణ్యాలను పెంచడానికి మేము ప్రాథమిక భావనలతో ప్రారంభిస్తాము.";
        case "Tamil": return "அருமையான முயற்சி! உங்களின் தன்னம்பிக்கையையும் திறமையையும் வளர்க்க அடிப்படை கருத்துகளிலிருந்து தொடங்குவோம்.";
        default: return "Great effort! We'll start with fundamental concepts to build up your confidence and skills.";
      }
    }
  };

  const diagnoseLevel = (score) => {
    if (score >= 13) return 5;
    if (score >= 10) return 4;
    if (score >= 7) return 3;
    if (score >= 4) return 2;
    return 1;
  };

  const handleSubmitAssessment = async (e) => {
    e.preventDefault();
    const categoryKey = getCategory(profile?.age, profile?.education_level);
    const currentSet = assessmentQuestions[categoryKey] || assessmentQuestions.adult;

    const answeredCount = Object.keys(selectedAnswers).length;
    if (answeredCount < 15) {
      alert(t("answerAllPrompt"));
      return;
    }

    setSubmitting(true);
    let score = 0;
    for (let i = 0; i < 15; i++) {
      if (selectedAnswers[i] === currentSet.questions[i].correctIndex) {
        score++;
      }
    }

    const diagnosedLevel = diagnoseLevel(score);
    const percentage = Math.round((score / 15) * 100);
    const lang = selectedLanguage || "English";
    const { description: levelDesc } = getLevelCategoryAndDescription(diagnosedLevel, lang);
    const summary = `${levelDesc} ${getSummary(score, lang)}`;

    try {
      // Save diagnosed literacy level to user profile: update both education_level and literacy_level
      const { error: edErr } = await supabase
        .from("profiles")
        .update({ education_level: getLocalizedLevelName(diagnosedLevel, "English") })
        .eq("id", session.user.id);
      if (!edErr) {
        setProfile(prev => prev ? { ...prev, education_level: getLocalizedLevelName(diagnosedLevel, "English") } : null);
      }



      const ageGroup = categoryKey.split("_")[0];
      const diagnosedCategoryKey = `${ageGroup}_level_${diagnosedLevel}`;
      setCurrentAttemptResult({
        score,
        percentage,
        summary,
        category: categoryKey,
        diagnosedCategory: diagnosedCategoryKey
      });
      setAssessmentState("results");
      setSelectedAnswers({});
    } catch (err) {
      console.error("Unexpected error submitting assessment:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // 4. Logged-in Dashboard Page
  if (session) {
    const categoryKey = getCategory(profile?.age, profile?.education_level);
    const currentSet = assessmentQuestions[categoryKey] || assessmentQuestions.adult;
    const answeredCount = Object.keys(selectedAnswers).length;

    return (
      <div className="dashboard-container">
        <header className="dashboard-header">
          <div className="dashboard-logo">LISA</div>
          <div className="dashboard-user">
            <span style={{ fontWeight: 600 }}>
              {t("hello")}, {profile?.full_name || session.user.email}
            </span>
            <button
              type="button"
              className="logout-btn"
              disabled={submitting}
              onClick={handleSignOut}
            >
              {submitting ? t("signingOut") : t("logout")}
            </button>
            {renderLanguageDropdown(true)}
          </div>
        </header>

        <main className="dashboard-main">
          {assessmentState === "answering" && (
            <div className="assessment-card">
              <div className="assessment-card-header">
                <h2>{getLocalizedText(currentSet.title)}</h2>
                <p className="assessment-desc">{getLocalizedText(currentSet.description)}</p>
                <div className="progress-container">
                  <div className="progress-text">
                    {t("questionProgress")
                      .replace("{current}", answeredCount)
                      .replace("{total}", 15)}
                  </div>
                  <div className="progress-bar-bg">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${(answeredCount / 15) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmitAssessment} className="assessment-form">
                <div className="questions-list">
                  {currentSet.questions.map((q, idx) => (
                    <div key={q.id} className="question-item-card">
                      <p className="question-text">
                        <span className="question-number">{idx + 1}.</span> {getLocalizedText(q.question)}
                      </p>
                      <div className="options-grid">
                        {getLocalizedOptions(q.options).map((opt, optIdx) => {
                          const isSelected = selectedAnswers[idx] === optIdx;
                          return (
                            <button
                              key={optIdx}
                              type="button"
                              className={`option-btn ${isSelected ? "selected" : ""}`}
                              onClick={() => {
                                setSelectedAnswers(prev => ({
                                  ...prev,
                                  [idx]: optIdx,
                                }));
                              }}
                            >
                              <span className="option-indicator">
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <span className="option-label">{opt}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="assessment-submit-bar">
                  <button
                    type="submit"
                    className="primary-btn submit-btn"
                    disabled={answeredCount < 15 || submitting}
                  >
                    {submitting ? t("submittingAssessment") : t("submitAssessmentBtn")}
                  </button>
                </div>
              </form>
            </div>
          )}

          {assessmentState === "results" && currentAttemptResult && (
            <div className="results-card">
              <h2>{t("resultsTitle")}</h2>
              <div className="results-score-container">
                <div className="results-percentage-circle">
                  <span className="percent-val">{currentAttemptResult.percentage}%</span>
                </div>
                <div className="results-score-details">
                  <p className="score-count">
                    <strong>{t("correctAnswers")}:</strong> {currentAttemptResult.score} / 10
                  </p>
                  <p className="score-category">
                    <strong>{t("categoryLabel")}:</strong>{" "}
                    {getLocalizedText((assessmentQuestions[currentAttemptResult.diagnosedCategory] || currentSet).title)}
                  </p>
                </div>
              </div>

              <div className="summary-section">
                <h3>{t("summaryLabel")}</h3>
                <p className="summary-text">
                  {(() => {
                    const lang = selectedLanguage || "English";
                    const { description: levelDesc } = getLevelCategoryAndDescription(currentAttemptResult.diagnosedLevel, lang);
                    const feedback = getSummary(currentAttemptResult.score, lang);
                    return `${levelDesc} ${feedback}`;
                  })()}
                </p>
              </div>

              <button
                type="button"
                className="primary-btn back-btn"
                onClick={() => setAssessmentState("not_started")}
              >
                {t("backToDashboardBtn")}
              </button>
            </div>
          )}

          {assessmentState === "not_started" && (
            <div className="dashboard-home-card">
              <div className="welcome-banner" style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                <h1>{t("welcomeToLisa")}</h1>
              </div>

              <div className="empty-state-assessment" style={{ textAlign: "center", padding: "2.5rem 1.5rem", background: "var(--card-bg)", borderRadius: "12px", border: "1px solid var(--border)", maxWidth: "600px", margin: "0 auto" }}>
                <p className="intro-copy" style={{ fontSize: "1.15rem", marginBottom: "1.5rem", lineHeight: "1.6" }}>
                  {t("initialAssessmentDesc")}
                </p>
                <button
                  type="button"
                  className="primary-btn start-assessment-btn"
                  onClick={() => {
                    setSelectedAnswers({});
                    setAssessmentState("answering");
                  }}
                >
                  {t("takeAssessmentBtn")}
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  // 5. Login / Register / Forgot Password Forms
  return (
    <main className="shell">
      <div className="brand-logo-top">LISA</div>
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
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
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
                {registerPassword && (() => {
                  const strength = getPasswordStrength(registerPassword);
                  return (
                    <div style={{ marginTop: "6px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8rem", marginBottom: "4px" }}>
                        <span style={{ color: "var(--muted)" }}>Password Strength:</span>
                        <span style={{ color: strength.color, fontWeight: "600" }}>{t(strength.labelKey)}</span>
                      </div>
                      <div style={{ height: "4px", background: "var(--line)", borderRadius: "2px", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${strength.pct}%`, background: strength.color, transition: "width 0.2s ease" }}></div>
                      </div>
                    </div>
                  );
                })()}
              </label>

              <div className="two-col">
                <label>
                  {t("preferredLanguage")}
                  <select
                    name="language"
                    required
                    value={selectedLanguage || ""}
                    onChange={(e) => handleLanguageSelect(e.target.value)}
                    disabled={submitting}
                  >
                    <option value="" disabled>
                      {t("selectLanguage")}
                    </option>
                    {languages.map((language) => (
                      <option key={language} value={language}>
                        {t(language + "Option")}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label>
                {t("educationLevel")}
                <select name="educationLevel" required defaultValue="" disabled={submitting}>
                  <option value="" disabled>
                    {t("selectEducation")}
                  </option>
                  {educationLevels.map((educationLevel) => (
                    <option key={educationLevel} value={educationLevel}>
                      {t(educationLevel + "Option")}
                    </option>
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
              <button className="lang-btn" onClick={() => handleLanguageSelect("English")}>
                <span className="native">English</span>
                <span style={{ fontSize: "0.85rem", opacity: 0.7 }}>English</span>
              </button>
              <button className="lang-btn" onClick={() => handleLanguageSelect("Hindi")}>
                <span className="native">हिन्दी</span>
                <span style={{ fontSize: "0.85rem", opacity: 0.7 }}>Hindi</span>
              </button>
              <button className="lang-btn" onClick={() => handleLanguageSelect("Kannada")}>
                <span className="native">ಕನ್ನಡ</span>
                <span style={{ fontSize: "0.85rem", opacity: 0.7 }}>Kannada</span>
              </button>
              <button className="lang-btn" onClick={() => handleLanguageSelect("Telugu")}>
                <span className="native">తెలుగు</span>
                <span style={{ fontSize: "0.85rem", opacity: 0.7 }}>Telugu</span>
              </button>
              <button className="lang-btn" onClick={() => handleLanguageSelect("Tamil")}>
                <span className="native">தமிழ்</span>
                <span style={{ fontSize: "0.85rem", opacity: 0.7 }}>Tamil</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default App;