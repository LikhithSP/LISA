import React, { useState, useEffect, useRef } from "react";
import { supabase } from "./supabaseClient";
import { levelDefinitions, initialAssessmentPool, getRandomAssessment } from "./curriculumData";

const languages = ["English", "Hindi", "Kannada", "Telugu", "Tamil"];
const educationLevels = ["No formal education", "Primary", "Secondary", "Higher secondary"];

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
    readingSecTitle: "Reading Section (Voice)",
    compSecTitle: "Comprehension Section (MCQ)",
    writingSecTitle: "Writing Section (Text)",
    micBtnStart: "Start Reading Aloud",
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
    diagnosedLevelTitle: "Diagnosed Literacy Level",
    readingSkill: "Reading Skill",
    writingSkill: "Writing Skill",
    compSkill: "Comprehension Skill",
    diagnosticPassed: "Assessment analyzed! Based on your performance, you are diagnosed at:",
    continueToDashboard: "Back to Dashboard",
    skipVoiceBtn: "Skip / Manual Match",
    skipVoicePrompt: "Voice recognition issue? Type the exact text instead:",
    writeInEnglishPrompt: "(Please write your response in English)",
    listenBtn: "Listen",
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
    historyStatus: "Result"
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
    readingSecTitle: "पठन अनुभाग (आवाज़)",
    compSecTitle: "समझ अनुभाग (एमसीक्यू)",
    writingSecTitle: "लेखन अनुभाग (पाठ)",
    micBtnStart: "जोर से पढ़ना शुरू करें",
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
    diagnosedLevelTitle: "निर्धारित साक्षरता स्तर",
    readingSkill: "पढ़ने का कौशल",
    writingSkill: "लिखने का कौशल",
    compSkill: "समझने का कौशल",
    diagnosticPassed: "मूल्यांकन पूरा! आपके प्रदर्शन के आधार पर, आपका स्तर है:",
    continueToDashboard: "डैशबोर्ड पर वापस जाएं",
    skipVoiceBtn: "छोड़ें / मैनुअल मिलान",
    skipVoicePrompt: "आवाज़ पहचानने में समस्या? इसके बजाय टेक्स्ट टाइप करें:",
    writeInEnglishPrompt: "(कृपया अपना उत्तर अंग्रेजी में लिखें)",
    listenBtn: "सुनें",
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
    historyStatus: "परिणाम"
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
    readingSecTitle: "ಓದುವಿಕೆ ವಿಭಾಗ (ಧ್ವನಿ)",
    compSecTitle: "ಗ್ರಹಿಕೆ ವಿಭಾಗ (MCQ)",
    writingSecTitle: "ಬರವಣಿಗೆ ವಿಭಾಗ (ಪಠ್ಯ)",
    micBtnStart: "ಜೋರಾಗಿ ಓದಲು ಪ್ರಾರಂಭಿಸಿ",
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
    diagnosedLevelTitle: "ನಿರ್ಣಯಿಸಿದ ಸಾಕ್ಷರತಾ ಮಟ್ಟ",
    readingSkill: "ಓದುವ ಕೌಶಲ್ಯ",
    writingSkill: "ಬರೆಯುವ ಕೌಶಲ್ಯ",
    compSkill: "ಗ್ರಹಿಕೆಯ ಕೌಶಲ್ಯ",
    diagnosticPassed: "ಮೌಲ್ಯಮಾಪನ ವಿಶ್ಲೇಷಿಸಲಾಗಿದೆ! ನಿಮ್ಮ ಪ್ರದರ್ಶನದ ಆಧಾರದ ಮೇಲೆ, ನೀವು ಇಲ್ಲಿಂದ ಪ್ರಾರಂಭಿಸುತ್ತೀರಿ:",
    continueToDashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹಿಂತಿರುಗಿ",
    skipVoiceBtn: "ಹೊರಗುಳಿಯಿರಿ / ಹಸ್ತಚಾಲಿತ ಹೊಂದಾಣಿಕೆ",
    skipVoicePrompt: "ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ ಸಮಸ್ಯೆಯೇ? ಬದಲಿಗೆ ಪಠ್ಯವನ್ನು ಟೈಪ್ ಮಾಡಿ:",
    writeInEnglishPrompt: "(ದಯವಿಟ್ಟು ನಿಮ್ಮ ಉತ್ತರವನ್ನು ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ಬರೆಯಿರಿ)",
    listenBtn: "ಆಲಿಸಿ",
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
    historyStatus: "ಫಲಿತಾಂಶ"
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
    readingSecTitle: "పఠనం విభాగం (వాయిస్)",
    compSecTitle: "గ్రహణశక్తి విభాగం (MCQ)",
    writingSecTitle: "రాయడం విభాగం (టెక్స్ట్)",
    micBtnStart: "గట్టిగా చదవడం ప్రారంభించండి",
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
    diagnosedLevelTitle: "నిర్ధారించిన అక్షరాస్యత స్థాయి",
    readingSkill: "చదవడం నైపుణ్యం",
    writingSkill: "రాయడం నైపుణ్యం",
    compSkill: "గ్రహణశక్తి నైపుణ్యం",
    diagnosticPassed: "అంచనా విశ్లేషించబడింది! మీ ప్రదర్శన ఆధారంగా మీ స్థాయి:",
    continueToDashboard: "డాష్‌బోర్డ్‌కు తిరిగి వెళ్లండి",
    skipVoiceBtn: "దాటవేయి / మాన్యువల్ మ్యాచ్",
    skipVoicePrompt: "వాయిస్ గుర్తింపు సమస్య ఉందా? బదులుగా టెక్స్ట్ టైప్ చేయండి:",
    writeInEnglishPrompt: "(దయచేసి మీ సమాధానాన్ని ఇంగ్లీషులో రాయండి)",
    listenBtn: "వినండి",
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
    historyStatus: "ఫలితం"
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
    readingSecTitle: "வாசிப்புப் பிரிவு (குரல்)",
    compSecTitle: "புரிதல் பிரிவு (MCQ)",
    writingSecTitle: "எழுதுதல் பிரிவு (உரை)",
    micBtnStart: "சத்தமாக வாசிக்கத் தொடங்குங்கள்",
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
    diagnosedLevelTitle: "கண்டறியப்பட்ட எழுத்தறிவு நிலை",
    readingSkill: "வாசிப்புத் திறன்",
    writingSkill: "எழுதும் திறன்",
    compSkill: "புரிதல் திறன்",
    diagnosticPassed: "மதிப்பீடு பகுப்பாய்வு செய்யப்பட்டது! உங்கள் திறமையின் அடிப்படையில் உங்களது நிலை:",
    continueToDashboard: "டாஷ்போர்டுக்குத் திரும்பு",
    skipVoiceBtn: "தவிர்க்கவும் / கைமுறை பொருத்தம்",
    skipVoicePrompt: "குரல் ஏற்பிப் பிரச்சனையா? அதற்குப் பதிலாக டைப் செய்யவும் செய்தி:",
    writeInEnglishPrompt: "(தயவுசெய்து உங்கள் பதிலை ஆங்கிலத்தில் எழுதவும்)",
    listenBtn: "கேளுங்கள்",
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
    historyStatus: "முடிவு"
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
  const defs = levelDefinitions[currentLang] || levelDefinitions["English"];
  const found = defs.find(d => d.level === level);
  return found ? found.name : `Level ${level}`;
};

const getLevelCategoryAndDescription = (level, lang) => {
  const currentLang = lang || "English";
  const defs = levelDefinitions[currentLang] || levelDefinitions["English"];
  const found = defs.find(d => d.level === level);
  return {
    category: found ? found.name : `Level ${level}`,
    description: found ? found.desc : ""
  };
};

function App() {
  const [selectedLanguage, setSelectedLanguage] = useState(
    localStorage.getItem("lisa_lang") || null
  );
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("login"); // "login", "register", "forgot"
  const [dashboardTab, setDashboardTab] = useState("home"); // "home", "profile"
  const [message, setMessage] = useState("");
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
        setProfile({
          id: userId,
          full_name: session?.user?.user_metadata?.full_name || session?.user?.email || "Learner",
          age: session?.user?.user_metadata?.age || 20,
          preferred_language: session?.user?.user_metadata?.preferred_language || selectedLanguage || "English",
          education_level: session?.user?.user_metadata?.education_level || "No formal education",
          literacy_level: storedAssessment?.literacy_level ?? null,
          assessment_completed: storedAssessment?.assessment_completed ?? false
        });
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
        setProfile({
          id: data.user.id,
          full_name: fullName,
          age,
          preferred_language: language,
          education_level: educationLevel,
          literacy_level: null,
          assessment_completed: false
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

    setReadingAttempts(prev => ({
      ...prev,
      [currentStep]: {
        transcript,
        matchedCount,
        totalWords: targetWords.length,
        scores
      }
    }));
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

  // Evaluate & Diagnose Literacy Level
  const submitInitialAssessment = async () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setSubmitting(true);
    let totalScore = 0; // max 120 points (10 comp + 1 read + 1 write)

    assessmentQuestionsList.forEach((q, idx) => {
      if (q.type === "reading") {
        const attempt = readingAttempts[idx];
        if (attempt) {
          const ratio = attempt.matchedCount / attempt.totalWords;
          totalScore += Math.round(ratio * 10);
        }
      } else if (q.type === "comprehension") {
        const answer = selectedAnswers[idx];
        if (answer === q.correctIndex) {
          totalScore += 10;
        }
      } else if (q.type === "writing") {
        const text = writingAnswers[idx] || "";
        const result = q.evaluator(text);
        totalScore += result.score;
      }
    });

    const scaledScore = Math.round((totalScore / 120) * 50);

    // Diagnose initial level 1 to 5 based on scaledScore (0 to 50)
    let diagnosedLevel = 1;
    if (scaledScore >= 43) diagnosedLevel = 5;
    else if (scaledScore >= 32) diagnosedLevel = 4;
    else if (scaledScore >= 22) diagnosedLevel = 3;
    else if (scaledScore >= 12) diagnosedLevel = 2;

    const levelString = getLocalizedLevelName(diagnosedLevel, "English");

    // Profile updates in Supabase
    try {
      const primaryUpdate = await supabase
        .from("profiles")
        .update({
          education_level: levelString,
          literacy_level: diagnosedLevel,
          assessment_completed: true
        })
        .eq("id", session.user.id);

      let error = primaryUpdate.error;

      if (error && (error.message.includes("literacy_level") || error.message.includes("assessment_completed") || error.code === "PGRST204" || error.message.includes("column"))) {
        const fallbackUpdate = {
          education_level: levelString
        };

        if (!error.message.includes("literacy_level")) {
          fallbackUpdate.literacy_level = diagnosedLevel;
        }
        if (!error.message.includes("assessment_completed")) {
          fallbackUpdate.assessment_completed = true;
        }

        const retry = await supabase
          .from("profiles")
          .update(fallbackUpdate)
          .eq("id", session.user.id);

        error = retry.error;
      }

      if (error) {
        console.warn("DB update failed, caching locally:", error.message);
      }

      // Update UI state profile
      setProfile(prev => ({
        ...prev,
        education_level: levelString,
        literacy_level: diagnosedLevel,
        assessment_completed: true
      }));
      setStoredAssessmentState(session.user.id, {
        literacy_level: diagnosedLevel,
        assessment_completed: true
      });

      // Calculate separate stats
      let readPoints = 0, compPoints = 0, writePoints = 0;
      assessmentQuestionsList.forEach((q, idx) => {
        const points = q.type === "reading" ? (readingAttempts[idx]?.matchedCount / readingAttempts[idx]?.totalWords) * 10 || 0
          : q.type === "comprehension" ? (selectedAnswers[idx] === q.correctIndex ? 10 : 0)
            : q.evaluator(writingAnswers[idx] || "").score;

        if (q.type === "reading") readPoints += points;
        if (q.type === "comprehension") compPoints += points;
        if (q.type === "writing") writePoints += points;
      });

      const attemptResult = {
        date: new Date().toLocaleDateString(),
        type: "Diagnostic Evaluation",
        score: scaledScore,
        maxScore: 50,
        level: diagnosedLevel,
        skills: {
          reading: Math.round((readPoints / 10) * 100),
          comprehension: Math.round((compPoints / 100) * 100),
          writing: Math.round((writePoints / 10) * 100)
        },
        passed: true
      };

      const updatedHistory = [attemptResult, ...historyAttempts];
      setHistoryAttempts(updatedHistory);
      localStorage.setItem("lisa_attempts_history", JSON.stringify(updatedHistory));

      setDashboardTab("home");
      setAssessmentState("not_started");
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

  const handleStartEdit = () => {
    setEditFullName(profile?.full_name || "");
    setEditAge(profile?.age || "");
    setEditPreferredLang(profile?.preferred_language || selectedLanguage || "English");
    setEditEdLevel(profile?.education_level || "No formal education");
    setEditingProfile(true);
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

  // Recovery Mode Form
  if (recoveryMode) {
    return (
      <main className="shell">
        <div className="brand-logo-top">LISA</div>
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

    return (
      <div className="dashboard-container">
        {/* Navigation Top Bar Header */}
        <header className="dashboard-header" style={{ background: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '16px 32px', borderBottom: '1px solid var(--line)' }}>
          {/* Brand Logo & Info */}
          <div className="sidebar-brand-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="brand-logo-circle">L</div>
            <div className="brand-text-block">
              <div className="brand-title" style={{ color: 'var(--text)', fontWeight: '800' }}>LISA</div>
              <div className="brand-subtitle" style={{ color: 'var(--muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.2px', fontWeight: 500 }}>Literacy Intelligence Support Assistant</div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="top-nav-menu" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <button
              className={`menu-item ${dashboardTab === "home" ? "active" : ""}`}
              onClick={() => setDashboardTab("home")}
              style={{
                background: dashboardTab === 'home' ? 'rgba(198, 95, 45, 0.08)' : 'none',
                color: dashboardTab === 'home' ? 'var(--accent)' : 'var(--text)',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              <span>🏠 {t("home")}</span>
            </button>
          </nav>

          {/* Right User Actions Area */}
          <div className="dashboard-user-actions" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {renderLanguageDropdown(true)}

            {/* Clickable Profile Button with Dropdown */}
            <div className="profile-dropdown-container" style={{ position: 'relative' }}>
              <button
                type="button"
                className={`profile-nav-pill ${dashboardTab === "profile" ? "active" : ""}`}
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: dashboardTab === 'profile' ? 'rgba(198, 95, 45, 0.08)' : 'rgba(0, 0, 0, 0.03)',
                  color: dashboardTab === 'profile' ? 'var(--accent)' : 'var(--text)',
                  border: '1px solid var(--line)',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.2s ease'
                }}
              >
                <div className="user-avatar-initials" style={{ width: '28px', height: '28px', fontSize: '0.8rem', margin: 0 }}>
                  {getUserInitials(profile?.full_name)}
                </div>
                <span style={{ fontSize: '0.9rem' }}>
                  {t("myProfile")}
                </span>
                <span style={{ fontSize: '0.6rem', marginLeft: '4px', opacity: 0.7 }}>▼</span>
              </button>

              {profileDropdownOpen && (
                <div className="profile-dropdown-menu">
                  <button
                    type="button"
                    className="profile-dropdown-item"
                    onClick={() => {
                      setDashboardTab("profile");
                      setProfileDropdownOpen(false);
                    }}
                  >
                    👤 {t("myProfile")}
                  </button>

                  <button
                    type="button"
                    className="profile-dropdown-item"
                    style={{ color: '#ef4444' }}
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      handleSignOut();
                    }}
                  >
                    🚪 {t("logout")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="dashboard-content-area" style={{ flexGrow: 1 }}>

          <main className={`dashboard-main-view ${(!hasDiagnosed && dashboardTab === "home") || assessmentState !== "not_started" ? "centered-layout" : ""}`}>
            {/* 1. Welcome state when not diagnosed and assessment not started */}
            {!hasDiagnosed && assessmentState === "not_started" && dashboardTab === "home" && (
              <div className="diagnostic-welcome-wrapper" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
                <div className="welcome-banner" style={{ textAlign: "center" }}>
                  <h1>{t("hello")}, {profile?.full_name || "Learner"} 👋</h1>
                  <h2 style={{ fontSize: "1.3rem", marginTop: "8px", color: "var(--muted)", fontWeight: 600 }}>{t("welcomeToLisa")}!</h2>
                </div>
                <div className="empty-state-assessment">
                  <p className="intro-copy">{t("initialAssessmentDesc")}</p>
                  <div className="assessment-tours">
                    <div className="tour-badge">📃 {t("compSecTitle")}</div>
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

              // 3. Resolve writing prompt
              const writingPromptText = isWriting
                ? (q.rawQuestion?.writing?.[selectedLanguage] || q.rawQuestion?.writing?.["English"] || "")
                : "";

              return (
                <div className="assessment-card" style={{ maxWidth: '800px', margin: '20px auto' }}>
                  <div className="assessment-card-header">
                    <div className="step-tag">
                      {t("stepTitle").replace("{current}", currentStep + 1).replace("{total}", assessmentQuestionsList.length)}
                    </div>
                    <h2>
                      {isVoiceReading && t("readingSecTitle")}
                      {isCompMCQ && t("compSecTitle")}
                      {isWriting && t("writingSecTitle")}
                    </h2>
                    <div className="progress-bar-bg">
                      <div className="progress-bar-fill" style={{ width: `${((currentStep + 1) / assessmentQuestionsList.length) * 100}%` }}></div>
                    </div>
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
                            <button
                              type="button"
                              className="mic-btn"
                              onClick={() => startListening(readingTargetText)}
                            >
                              <span className="mic-icon">🎤</span>
                              {t("micBtnStart")}
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="mic-btn listening"
                              onClick={stopListening}
                            >
                              <div className="pulse-ring"></div>
                              <span className="mic-icon">🔴</span>
                              {t("micBtnListening")}
                            </button>
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

                    {/* WRITING PROMPT SECTION */}
                    {isWriting && (
                      <div className="writing-q-container">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', justifyContent: 'space-between', width: '100%' }}>
                          <div style={{ flex: 1 }}>
                            <p className="writing-prompt" style={{ margin: 0, fontWeight: 700, fontSize: "1.2rem" }}>{writingPromptText}</p>
                          </div>
                          <button
                            type="button"
                            className="tts-btn"
                            onClick={() => speakText(writingPromptText)}
                            title="Listen to prompt"
                          >
                            🔊 {t("listenBtn") || "Listen"}
                          </button>
                        </div>
                        <textarea
                          className="writing-textarea"
                          placeholder="Start typing your response here..."
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
                          ⬅️ {t("prevBtn")}
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

              return (
                <div className="results-card" style={{ maxWidth: '800px', margin: '20px auto' }}>
                  <h2>{t("resultsTitle")}</h2>

                  <div className="results-percentage-circle">
                    <span className="percent-val">{latestAttempt?.score ? Math.round((latestAttempt.score / 50) * 100) : 0}%</span>
                  </div>

                  <div className="score-summary-grid" style={{ gridTemplateColumns: "1fr", justifyContent: "center" }}>
                    <div className="score-item" style={{ textAlign: "center" }}>
                      <span className="score-label">{t("overallScore")}</span>
                      <span className="score-val" style={{ fontSize: "1.8rem" }}>{latestAttempt?.score} / 50</span>
                    </div>
                  </div>

                  <div className="benchmark-card">
                    <div className="benchmark-badge-icon">🎖️</div>
                    <h3 className="benchmark-title">{getLevelCategoryAndDescription(currentLevelIndex, currentLang).category}</h3>
                    <p className="benchmark-desc">
                      {getLevelCategoryAndDescription(currentLevelIndex, currentLang).description}
                    </p>
                  </div>

                  <div className="skill-breakdowns-box">
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

                  <button
                    type="button"
                    className="primary-btn dashboard-enter-btn"
                    onClick={() => {
                      setAssessmentState("not_started");
                    }}
                  >
                    {t("continueToDashboard")}
                  </button>
                </div>
              );
            })()}

            {/* 4. Normal Dashboard View (only rendered when diagnosed and not in assessment) */}
            {assessmentState === "not_started" && (
              <>
                {(dashboardTab === "dashboard" || (dashboardTab === "home" && hasDiagnosed)) && (
                  <div className="home-tab-wrapper">
                    {/* Tutor Announcement Bar */}
                    <div className="tutor-announcement-bar">
                      <div className="tutor-icon-box">🤖</div>
                      <div className="tutor-text-wrapper">
                        <h5>LISA AI Tutor</h5>
                        <p>Keep your streak going! You are doing an amazing job learning foundational literacy.</p>
                      </div>
                    </div>

                    {/* Premium Hero Banner Card */}
                    {(() => {
                      const overallProgress = historyAttempts[0]?.score ? Math.round((historyAttempts[0].score / 50) * 100) : 0;
                      const strokeDashoffset = 251.2 - (overallProgress / 100) * 251.2;

                      return (
                        <div className="premium-hero-card">
                          <div className="hero-left-content">
                            <span className="hero-tag">LISA PLATFORM</span>
                            <h1>Your Literacy Journey</h1>
                            <p className="hero-subtext">You have completed your initial diagnostic assessment. Keep practicing to build your skills!</p>

                            <div className="hero-actions">
                              <span className="hero-streak-text">
                                🔥 {historyAttempts.length > 0 ? "3 day streak" : "0 day streak"}
                              </span>
                            </div>
                          </div>

                          <div className="hero-right-progress">
                            <svg width="100" height="100" className="progress-ring-svg">
                              <circle cx="50" cy="50" r="40" strokeWidth="8" fill="transparent" className="progress-ring-circle-bg" />
                              <circle
                                cx="50"
                                cy="50"
                                r="40"
                                strokeWidth="8"
                                fill="transparent"
                                className="progress-ring-circle-fill"
                                strokeDashoffset={strokeDashoffset}
                              />
                              <text x="50" y="55" textAnchor="middle" fill="white" fontWeight="900" fontSize="1.1rem">{overallProgress}%</text>
                            </svg>
                            <span className="progress-percentage-label">
                              {getLevelCategoryAndDescription(getLiteracyLevel(profile) || 1, selectedLanguage).category}
                            </span>
                          </div>
                        </div>
                      );
                    })()}

                    {/* 4-Metric Statistics Grid */}
                    {(() => {
                      const achievementsCount = 1 +
                        (calculateSkillProficiency("reading") >= 75 ? 1 : 0) +
                        (calculateSkillProficiency("comprehension") >= 75 ? 1 : 0) +
                        (calculateSkillProficiency("writing") >= 75 ? 1 : 0);
                      const hoursLearned = (historyAttempts.length * 0.5).toFixed(1);

                      return (
                        <div className="metric-stats-grid">
                          <div className="metric-stat-box">
                            <div className="metric-icon-circle" style={{ background: '#eff6ff', color: '#3b82f6' }}>📖</div>
                            <div className="metric-text-wrapper">
                              <span className="metric-number">{historyAttempts.length}</span>
                              <span className="metric-label">Evaluations Done</span>
                            </div>
                          </div>
                          <div className="metric-stat-box">
                            <div className="metric-icon-circle" style={{ background: '#fef3c7', color: '#d97706' }}>🏆</div>
                            <div className="metric-text-wrapper">
                              <span className="metric-number">
                                {achievementsCount} <span className="badge-new-tag">New</span>
                              </span>
                              <span className="metric-label">Achievements</span>
                            </div>
                          </div>
                          <div className="metric-stat-box">
                            <div className="metric-icon-circle" style={{ background: '#ecfdf5', color: '#059669' }}>⏱️</div>
                            <div className="metric-text-wrapper">
                              <span className="metric-number">{hoursLearned}h</span>
                              <span className="metric-label">Hours Learned</span>
                            </div>
                          </div>
                          <div className="metric-stat-box">
                            <div className="metric-icon-circle" style={{ background: '#fff5f5', color: '#e53e3e' }}>🔥</div>
                            <div className="metric-text-wrapper">
                              <span className="metric-number">{historyAttempts.length > 0 ? "3" : "0"}</span>
                              <span className="metric-label">Day Streak</span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Day Streak Widget Tracker */}
                    <div className="streak-widget-card">
                      <div className="streak-card-header">
                        <h4>🔥 Day Streak</h4>
                        <span style={{ fontWeight: '800', color: '#f59e0b', fontSize: '1.1rem' }}>
                          {historyAttempts.length > 0 ? "3" : "0"} Days Active
                        </span>
                      </div>
                      <div className="streak-days-list">
                        {["S", "M", "T", "W", "T", "F", "S"].map((day, idx) => {
                          const isActive = historyAttempts.length > 0 && [1, 2, 3].includes(idx);
                          return (
                            <div key={idx} className={`streak-day-bubble ${isActive ? "active" : ""}`}>
                              {isActive ? "✓" : day}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Lessons Section Grid */}
                    <div className="lessons-section-header">
                      <h3>📚 Practice Modules</h3>
                    </div>
                    <div className="lessons-card-grid">
                      <div className="lesson-card-item active" onClick={() => alert("Practice modules are under development. Keep practicing with your current level!")}>
                        <div className="lesson-card-header">
                          <div className="lesson-card-icon-box" style={{ background: '#eff6ff', color: '#3b82f6' }}>🎤</div>
                          <span className="lesson-active-badge">Active</span>
                        </div>
                        <div>
                          <h4 className="lesson-card-title">Reading Foundations</h4>
                          <p className="lesson-card-desc">Practice sentence articulation and clear regional speaking.</p>
                        </div>
                        <div className="lesson-card-footer">
                          <div className="bar-bg" style={{ height: '6px' }}>
                            <div className="bar-fill reading" style={{ width: `${calculateSkillProficiency("reading")}%` }}></div>
                          </div>
                          <span className="lesson-card-duration">⏱ 15 min | {calculateSkillProficiency("reading")}% Mastery</span>
                        </div>
                      </div>

                      <div className="lesson-card-item" onClick={() => alert("Practice modules are under development. Keep practicing with your current level!")}>
                        <div className="lesson-card-header">
                          <div className="lesson-card-icon-box" style={{ background: '#fef3c7', color: '#d97706' }}>❓</div>
                        </div>
                        <div>
                          <h4 className="lesson-card-title">Comprehension Practice</h4>
                          <p className="lesson-card-desc">Answer interactive MCQs on everyday warnings, signs, and texts.</p>
                        </div>
                        <div className="lesson-card-footer">
                          <div className="bar-bg" style={{ height: '6px' }}>
                            <div className="bar-fill comprehension" style={{ width: `${calculateSkillProficiency("comprehension")}%` }}></div>
                          </div>
                          <span className="lesson-card-duration">⏱ 12 min | {calculateSkillProficiency("comprehension")}% Mastery</span>
                        </div>
                      </div>

                      <div className="lesson-card-item" onClick={() => alert("Practice modules are under development. Keep practicing with your current level!")}>
                        <div className="lesson-card-header">
                          <div className="lesson-card-icon-box" style={{ background: '#ecfdf5', color: '#059669' }}>✍️</div>
                        </div>
                        <div>
                          <h4 className="lesson-card-title">Writing & Literacy</h4>
                          <p className="lesson-card-desc">Write short descriptive texts about prompts and daily routines.</p>
                        </div>
                        <div className="lesson-card-footer">
                          <div className="bar-bg" style={{ height: '6px' }}>
                            <div className="bar-fill writing" style={{ width: `${calculateSkillProficiency("writing")}%` }}></div>
                          </div>
                          <span className="lesson-card-duration">⏱ 10 min | {calculateSkillProficiency("writing")}% Mastery</span>
                        </div>
                      </div>

                      <div className="lesson-card-item" onClick={() => alert("Practice modules are under development. Keep practicing with your current level!")}>
                        <div className="lesson-card-header">
                          <div className="lesson-card-icon-box" style={{ background: '#f5f3ff', color: '#8b5cf6' }}>🎓</div>
                        </div>
                        <div>
                          <h4 className="lesson-card-title">Language Practice</h4>
                          <p className="lesson-card-desc">Combine elements of syntax and vocabulary structures.</p>
                        </div>
                        <div className="lesson-card-footer">
                          <div className="bar-bg" style={{ height: '6px' }}>
                            <div className="bar-fill reading" style={{ width: '0%', background: '#a78bfa' }}></div>
                          </div>
                          <span className="lesson-card-duration">⏱ 18 min | 0% Mastery</span>
                        </div>
                      </div>
                    </div>

                    {/* Achievements Badges Section */}
                    <div className="badges-gallery-card" style={{ background: 'white', border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 4px 16px rgba(0,0,0,0.02)', borderRadius: '24px' }}>
                      <h4>🏆 Achievements & Badges</h4>
                      <div className="badges-grid" style={{ marginTop: '20px' }}>
                        <div className="badge-item unlocked">
                          <div className="badge-art">🏁</div>
                          <h6>First Attempt</h6>
                          <p>Completed the initial diagnostic assessment.</p>
                        </div>

                        <div className={`badge-item ${calculateSkillProficiency("reading") >= 75 ? "unlocked" : "locked"}`}>
                          <div className="badge-art">🎤</div>
                          <h6>Voice Pioneer</h6>
                          <p>Achieved 75% or higher in Reading Speech matching.</p>
                        </div>

                        <div className={`badge-item ${calculateSkillProficiency("comprehension") >= 75 ? "unlocked" : "locked"}`}>
                          <div className="badge-art">❓</div>
                          <h6>Comprehension Pro</h6>
                          <p>Achieved 75% or higher in MCQ evaluation.</p>
                        </div>

                        <div className={`badge-item ${calculateSkillProficiency("writing") >= 75 ? "unlocked" : "locked"}`}>
                          <div className="badge-art">✍️</div>
                          <h6>Spelling Guru</h6>
                          <p>Achieved 75% or higher in prompt writing assessment.</p>
                        </div>
                      </div>
                    </div>

                    {/* History list */}
                    <div className="history-table-wrapper" style={{ background: 'white', border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 4px 16px rgba(0,0,0,0.02)', borderRadius: '24px', padding: '28px' }}>
                      <h4>📝 Diagnostic Evaluation History</h4>
                      {historyAttempts.length === 0 ? (
                        <p style={{ padding: "20px", color: "var(--muted)", margin: 0 }}>No evaluations recorded yet.</p>
                      ) : (
                        <table className="history-table" style={{ margin: 0 }}>
                          <thead>
                            <tr>
                              <th>{t("historyDate")}</th>
                              <th>{t("historyType")}</th>
                              <th>{t("historyScore")}</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {historyAttempts.map((h, i) => (
                              <tr key={i}>
                                <td>{h.date}</td>
                                <td>{h.type}</td>
                                <td>{h.score} / 50</td>
                                <td>
                                  <span className={`score-badge ${h.passed ? "high" : "low"}`}>
                                    Evaluated
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                )}

                {/* TABS: PROFILE EDITING */}
                {dashboardTab === "profile" && (
                  <div className="profile-tab-wrapper">
                    {!editingProfile ? (
                      <div className="profile-info-card">
                        <div className="profile-avatar">👤</div>
                        <h3>{profile?.full_name}</h3>
                        <p><strong>Email:</strong> {session.user.email}</p>
                        <p><strong>Age:</strong> {profile?.age || "N/A"}</p>
                        <p><strong>Preferred Language:</strong> {profile?.preferred_language}</p>

                        <button
                          type="button"
                          className="primary-btn edit-profile-trigger"
                          onClick={handleStartEdit}
                        >
                          Update Profile
                        </button>

                        <div style={{ marginTop: '30px', padding: '20px', background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '16px' }}>
                          <h4 style={{ margin: '0 0 10px 0', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>🔧</span> Developer Testing Options
                          </h4>
                          <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: '#7f1d1d', lineHeight: '1.5' }}>
                            Use this tool to reset your profile's diagnostic status in Supabase so you can test the initial assessment welcome screen, questionnaire flow, and feedback page from the beginning.
                          </p>
                          <button
                            type="button"
                            className="secondary-btn"
                            style={{ background: '#ef4444', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '12px', cursor: 'pointer', fontWeight: '600' }}
                            onClick={async () => {
                              try {
                                const primaryUpdate = await supabase
                                  .from("profiles")
                                  .update({
                                    education_level: "No formal education",
                                    literacy_level: null,
                                    assessment_completed: false
                                  })
                                  .eq("id", session.user.id);

                                let error = primaryUpdate.error;

                                if (error) {
                                  console.warn("Primary reset failed, retrying with guaranteed schema fields:", error.message);
                                  // Retry using only the guaranteed education_level column
                                  const retry = await supabase
                                    .from("profiles")
                                    .update({
                                      education_level: "No formal education"
                                    })
                                    .eq("id", session.user.id);
                                  error = retry.error;
                                }

                                if (error) throw error;

                                setProfile(prev => prev ? {
                                  ...prev,
                                  education_level: "No formal education",
                                  literacy_level: null,
                                  assessment_completed: false
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
                            }}
                          >
                            Reset Assessment Status
                          </button>
                        </div>
                      </div>
                    ) : (
                      <form className="auth-form active editing-profile-form" onSubmit={handleSaveProfileEdit}>
                        <h3>Update Profile Info</h3>
                        <label>
                          Full Name
                          <input
                            type="text"
                            required
                            value={editFullName}
                            onChange={(e) => setEditFullName(e.target.value)}
                          />
                        </label>
                        <label>
                          Age
                          <input
                            type="number"
                            min="5"
                            max="120"
                            required
                            value={editAge}
                            onChange={(e) => setEditAge(e.target.value)}
                          />
                        </label>
                        <label>
                          Preferred Language
                          <select
                            required
                            value={editPreferredLang}
                            onChange={(e) => setEditPreferredLang(e.target.value)}
                          >
                            {languages.map((l) => (
                              <option key={l} value={l}>{t(l + "Option")}</option>
                            ))}
                          </select>
                        </label>
                        <label>
                          Current Education Status
                          <select
                            required
                            value={editEdLevel}
                            onChange={(e) => setEditEdLevel(e.target.value)}
                          >
                            {educationLevels.map((ed) => (
                              <option key={ed} value={ed}>{t(ed + "Option")}</option>
                            ))}
                          </select>
                        </label>

                        <div className="two-col" style={{ marginTop: "14px" }}>
                          <button type="submit" className="primary-btn" disabled={submitting}>
                            {submitting ? "Saving..." : "Save Changes"}
                          </button>
                          <button
                            type="button"
                            className="secondary-btn"
                            onClick={() => setEditingProfile(false)}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </>
            )}
          </main>
        </div>
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