import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

const languages = ["English", "Hindi", "Kannada", "Telugu", "Tamil", "Other"];
const educationLevels = [
  "No formal education",
  "Primary",
  "Secondary",
  "Higher secondary",
  "Graduate",
];

const translations = {
  English: {
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
    preferredLanguage: "Language to learn or improve",
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
    emailRegisterPlaceholder: "learner@example.com",
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
    GraduateOption: "Graduate degree",
  },
  Hindi: {
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
    preferredLanguage: "सीखने या सुधारने की भाषा",
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
    emailRegisterPlaceholder: "learner@example.com",
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
    GraduateOption: "स्नातक",
  },
  Kannada: {
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
    preferredLanguage: "ಕಲಿಯಲು ಅಥವಾ ಸುಧಾರಿಸಲು ಭಾಷೆ",
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
    emailRegisterPlaceholder: "learner@example.com",
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
    GraduateOption: "ಪದವೀಧರ",
  },
  Telugu: {
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
    preferredLanguage: "నేర్చుకోవడానికి లేదా మెరుగుపరచడానికి భాష",
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
    emailRegisterPlaceholder: "learner@example.com",
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
    GraduateOption: "గ్రాడ్యుయేట్",
  },
  Tamil: {
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
    preferredLanguage: "கற்க அல்லது மேம்படுத்த வேண்டிய மொழி",
    selectLanguage: "மொழியைத் தேர்ந்தெடுக்கவும்",
    educationLevel: "கல்வி நிலை",
    selectEducation: "கல்வி நிலையைத் தேர்ந்தெடுக்கவும்",
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
    emailRegisterPlaceholder: "learner@example.com",
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
    GraduateOption: "பட்டதாரி",
  }
};

function App() {
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
        if (data.preferred_language && !localStorage.getItem("lisa_lang")) {
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

  const handleLanguageSelect = (lang) => {
    setSelectedLanguage(lang);
    localStorage.setItem("lisa_lang", lang);
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
  const renderLanguageDropdown = () => (
    <div className="lang-selector-container">
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

  // 4. Logged-in Dashboard Page
  if (session) {
    return (
      <div className="dashboard-container">
        {renderLanguageDropdown()}
        <header className="dashboard-header">
          <div className="dashboard-logo">LISA</div>
          <div className="dashboard-user" style={{ paddingRight: "70px" }}>
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
          </div>
        </header>
        <main className="dashboard-main">
          <div className="empty-state-card">
            <h2>{t("welcomeToLisa")}</h2>
            <p>{t("dashboardUnderConstruction")}</p>
          </div>
        </main>
      </div>
    );
  }

  // 5. Login / Register / Forgot Password Forms
  return (
    <main className="shell">
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
                <input
                  type="password"
                  name="loginPassword"
                  placeholder={t("passwordPlaceholder")}
                  autoComplete="current-password"
                  required
                  disabled={submitting}
                />
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
                <input
                  type="password"
                  name="registerPassword"
                  placeholder={t("passwordRegisterPlaceholder")}
                  autoComplete="new-password"
                  required
                  disabled={submitting}
                />
              </label>

              <div className="two-col">
                <label>
                  {t("preferredLanguage")}
                  <select name="language" required defaultValue={selectedLanguage || ""} disabled={submitting}>
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