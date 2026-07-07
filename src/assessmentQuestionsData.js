// Helper to generate custom assessmentQuestions for 4 ages x 5 levels
export const assessmentQuestions = {
  child_level_1: {
    title: {
    English: "Level 1 Assessment (CHILD)",
    Hindi: "स्तर 1 आकलन (बच्चे)",
    Kannada: "ಹಂತ 1 ಮೌಲ್ಯಮಾಪನ (ಮಕ್ಕಳು)",
    Telugu: "స్థాయి 1 అంచనా (పిల్లలు)",
    Tamil: "நிலை 1 மதிப்பீடு (குழந்தைகள்)"
    },
    description: {
    English: "Test checking capability at Level 1 for child learners.",
    Hindi: "बाल शिक्षार्थियों के लिए स्तर 1 क्षमता का परीक्षण।",
    Kannada: "ಕಲಿಯುವವರಿಗೆ ಹಂತ 1 ಸಾಮರ್ಥ್ಯವನ್ನು ಪರಿಶೀಲಿಸುವ ಪರೀಕ್ಷೆ.",
    Telugu: "అభ్యాసకుల కోసం స్థాయి 1 సామర్థ్య పరీక్ష.",
    Tamil: "கற்பவர்களுக்கான நிலை 1 திறனைச் சோதிக்கும் மதிப்பீடு."
    },
    questions: [
    {
      id: "child_l1_1",
      question: {
      English: "Which letter matches the shape of uppercase 'A'?",
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
      id: "child_l1_2",
      question: {
      English: "Find the lowercase letter that matches 'b'.",
      Hindi: "छोटे अक्षर 'b' से मेल खाने वाला अक्षर खोजें।",
      Kannada: "ಸಣ್ಣ ಅಕ್ಷರ 'b' ಗೆ ಹೊಂದಿಕೆಯಾಗುವ ಅಕ್ಷರವನ್ನು ಹುಡುಕಿ.",
      Telugu: "చిన్న అక్షరం 'b' కి సరిపోయే అక్షరాన్ని కనుగొనండి.",
      Tamil: "'b' என்ற சிறிய எழுத்துடன் பொருந்தும் எழுத்தைக் கண்டறியவும்."
      },
      options: {
      English: ["q", "p", "b", "d"],
      Hindi: ["q", "p", "b", "d"],
      Kannada: ["q", "p", "b", "d"],
      Telugu: ["q", "p", "b", "d"],
      Tamil: ["q", "p", "b", "d"]
      },
      correctIndex: 2
    },
    {
      id: "child_l1_3",
      question: {
      English: "Which is the letter 'S'?",
      Hindi: "अक्षर 'S' कौन सा है?",
      Kannada: "'S' ಅಕ್ಷರ ಯಾವುದು?",
      Telugu: "'S' అక్షరం ఏది?",
      Tamil: "இதில் 'S' என்ற எழுத்து எது?"
      },
      options: {
      English: ["Z", "O", "C", "S"],
      Hindi: ["Z", "O", "C", "S"],
      Kannada: ["Z", "O", "C", "S"],
      Telugu: ["Z", "O", "C", "S"],
      Tamil: ["Z", "O", "C", "S"]
      },
      correctIndex: 3
    },
    {
      id: "child_l1_4",
      question: {
      English: "Find the capital letter 'T'.",
      Hindi: "बड़ा अक्षर 'T' खोजें।",
      Kannada: "ದೊಡ್ಡ ಅಕ್ಷರ 'T' ಅನ್ನು ಹುಡುಕಿ.",
      Telugu: "క్యాపిటల్ అక్షరం 'T'ని కనుగొనండి.",
      Tamil: "பெரிய எழுத்து 'T'-ஐக் கண்டறியவும்."
      },
      options: {
      English: ["I", "L", "T", "F"],
      Hindi: ["I", "L", "T", "F"],
      Kannada: ["I", "L", "T", "F"],
      Telugu: ["I", "L", "T", "F"],
      Tamil: ["I", "L", "T", "F"]
      },
      correctIndex: 2
    },
    {
      id: "child_l1_5",
      question: {
      English: "Which letter is different from the others?",
      Hindi: "कौन सा अक्षर दूसरों से अलग है?",
      Kannada: "ಯಾವ ಅಕ್ಷರವು ಇತರ ಅಕ್ಷರಗಳಿಗಿಂತ ಭಿನ್ನವಾಗಿದೆ?",
      Telugu: "ఏ అక్షరం మిగతా వాటికంటే భిన్నంగా ఉంది?",
      Tamil: "மற்ற எழுத்துக்களிலிருந்து வேறுபட்ட எழுத்து எது?"
      },
      options: {
      English: ["C", "C", "C", "O"],
      Hindi: ["C", "C", "C", "O"],
      Kannada: ["C", "C", "C", "O"],
      Telugu: ["C", "C", "C", "O"],
      Tamil: ["C", "C", "C", "O"]
      },
      correctIndex: 3
    },
    {
      id: "child_l1_6",
      question: {
      English: "Identify the letter 'M'.",
      Hindi: "अक्षर 'M' की पहचान करें।",
      Kannada: "'M' ಅಕ್ಷರವನ್ನು ಗುರುತಿಸಿ.",
      Telugu: "'M' అక్షరాన్ని గుర్తించండి.",
      Tamil: "'M' என்ற எழுத்தை அடையாளம் காணவும்."
      },
      options: {
      English: ["W", "V", "N", "M"],
      Hindi: ["W", "V", "N", "M"],
      Kannada: ["W", "V", "N", "M"],
      Telugu: ["W", "V", "N", "M"],
      Tamil: ["W", "V", "N", "M"]
      },
      correctIndex: 3
    },
    {
      id: "child_l1_7",
      question: {
      English: "Complete the sequence: A, B, C, __",
      Hindi: "क्रम पूरा करें: A, B, C, __",
      Kannada: "ಅನುಕ್ರಮವನ್ನು ಪೂರ್ಣಗೊಳಿಸಿ: A, B, C, __",
      Telugu: "క్రమాన్ని పూర్తి చేయండి: A, B, C, __",
      Tamil: "வரிசையை நிரப்புக: A, B, C, __"
      },
      options: {
      English: ["F", "E", "D", "G"],
      Hindi: ["F", "E", "D", "G"],
      Kannada: ["F", "E", "D", "G"],
      Telugu: ["F", "E", "D", "G"],
      Tamil: ["F", "E", "D", "G"]
      },
      correctIndex: 2
    },
    {
      id: "child_l1_8",
      question: {
      English: "Which letter shape matches 'O'?",
      Hindi: "कौन सा अक्षर 'O' के आकार से मेल खाता है?",
      Kannada: "ಯಾವ ಅಕ್ಷರದ ಆಕಾರವು 'O' ಗೆ ಹೊಂದಿಕೆಯಾಗುತ್ತದೆ?",
      Telugu: "ఏ అಕ್ಷర ఆకారం 'O'తో సరిపోలుతుంది?",
      Tamil: "எந்த எழுத்தின் வடிவம் 'O'-உடன் ஒத்துப்போகிறது?"
      },
      options: {
      English: ["Q", "U", "O", "D"],
      Hindi: ["Q", "U", "O", "D"],
      Kannada: ["Q", "U", "O", "D"],
      Telugu: ["Q", "U", "O", "D"],
      Tamil: ["Q", "U", "O", "D"]
      },
      correctIndex: 2
    },
    {
      id: "child_l1_9",
      question: {
      English: "Find the matching lowercase letter for 'r'.",
      Hindi: "'r' के लिए मेल खाता छोटा अक्षर खोजें।",
      Kannada: "'r' ಗೆ ಹೊಂದಿಕೆಯಾಗುವ ಸಣ್ಣ ಅಕ್ಷರವನ್ನು ಹುಡುಕಿ.",
      Telugu: "'r' కి సరిపోయే చిన్న అక్షరాన్ని కనుగొనండి.",
      Tamil: "'r' என்ற எழுத்துக்குரிய சிறிய எழுத்தைக் கண்டறியவும்."
      },
      options: {
      English: ["r", "m", "n", "h"],
      Hindi: ["r", "m", "n", "h"],
      Kannada: ["r", "m", "n", "h"],
      Telugu: ["r", "m", "n", "h"],
      Tamil: ["r", "m", "n", "h"]
      },
      correctIndex: 0
    },
    {
      id: "child_l1_10",
      question: {
      English: "Which letter looks like a straight line?",
      Hindi: "कौन सा अक्षर एक सीधी रेखा जैसा दिखता है?",
      Kannada: "ಯಾವ ಅಕ್ಷರವು ಸರಳ ರೇಖೆಯಂತೆ ಕಾಣುತ್ತದೆ?",
      Telugu: "ఏ అక్షరం నిలువు గీతలా ఉంటుంది?",
      Tamil: "நேர் கோடு போல இருக்கும் எழுத்து எது?"
      },
      options: {
      English: ["C", "S", "I", "O"],
      Hindi: ["C", "S", "I", "O"],
      Kannada: ["C", "S", "I", "O"],
      Telugu: ["C", "S", "I", "O"],
      Tamil: ["C", "S", "I", "O"]
      },
      correctIndex: 2
    }
    ]
  },
  child_level_2: {
    title: {
    English: "Level 2 Assessment (CHILD)",
    Hindi: "स्तर 2 आकलन (बच्चे)",
    Kannada: "ಹಂತ 2 ಮೌಲ್ಯಮಾಪನ (ಮಕ್ಕಳು)",
    Telugu: "స్థాయి 2 అంచనా (పిల్లలు)",
    Tamil: "நிலை 2 மதிப்பீடு (குழந்தைகள்)"
    },
    description: {
    English: "Test checking capability at Level 2 for child learners.",
    Hindi: "बाल शिक्षार्थियों के लिए स्तर 2 क्षमता का परीक्षण।",
    Kannada: "ಕಲಿಯುವವರಿಗೆ ಹಂತ 2 ಸಾಮರ್ಥ್ಯವನ್ನು ಪರಿಶೀಲಿಸುವ ಪರೀಕ್ಷೆ.",
    Telugu: "అభ్యాసకుల కోసం స్థాయి 2 సామర్థ్య పరీక్ష.",
    Tamil: "கற்பவர்களுக்கான நிலை 2 திறனைச் சோதிக்கும் மதிப்பீடு."
    },
    questions: [
    {
      id: "child_l2_1",
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
      id: "child_l2_2",
      question: {
      English: "Identify the missing letter in the word: 'D_g'.",
      Hindi: "शब्द में छूटा हुआ अक्षर पहचानें: 'D_g'।",
      Kannada: "ಪದದಲ್ಲಿ ಬಿಟ್ಟುಹೋದ ಅಕ್ಷರವನ್ನು ಗುರುತಿಸಿ: 'D_g'.",
      Telugu: "పదంలో లేని అక్షరాన్ని గుర్తించండి: 'D_g'.",
      Tamil: "வார்த்தையில் விடுபட்ட எழுத்தைக் கண்டறியவும்: 'D_g'."
      },
      options: {
      English: ["i", "e", "a", "o"],
      Hindi: ["i", "e", "a", "o"],
      Kannada: ["i", "e", "a", "o"],
      Telugu: ["i", "e", "a", "o"],
      Tamil: ["i", "e", "a", "o"]
      },
      correctIndex: 3
    },
    {
      id: "child_l2_3",
      question: {
      English: "Which word rhymes with the sound of 'Toy'?",
      Hindi: "कौन सा शब्द 'Toy' (खिलौना) की ध्वनि के साथ तुकबंदी (rhyme) करता है?",
      Kannada: "ಯಾವ ಪದವು 'Toy' ಧ್ವನಿಯೊಂದಿಗೆ ಪ್ರಾಸಬದ್ಧವಾಗಿದೆ?",
      Telugu: "'Toy' ధ్వనితో ప్రాస కలిసే పదం ఏది?",
      Tamil: "'Toy' என்ற ஒலியுடன் ஒத்துப்போகும் வார்த்தை எது?"
      },
      options: {
      English: ["Bus", "Bag", "Boy", "Bed"],
      Hindi: ["Bus (बस)", "Bag (बस्ता)", "Boy (लड़का)", "Bed (बिस्तर)"],
      Kannada: ["Bus (ಬಸ್ಸು)", "Bag (ಚೀಲ)", "Boy (ಬಾಲಕ)", "Bed (ಹಾಸಿಗೆ)"],
      Telugu: ["Bus (బస్సు)", "Bag (సంచీ)", "Boy (బాలుడు)", "Bed (మంచం)"],
      Tamil: ["Bus (பேருந்து)", "Bag (பைய்)", "Boy (சிறுவன்)", "Bed (படுக்கை)"]
      },
      correctIndex: 2
    },
    {
      id: "child_l2_4",
      question: {
      English: "What sound does the letter 'B' make?",
      Hindi: "अक्षर 'B' की ध्वनि क्या है?",
      Kannada: "'B' ಅಕ್ಷರವು ಯಾವ ಧ್ವನಿಯನ್ನು ಮಾಡುತ್ತದೆ?",
      Telugu: "'B' అక్షరం చేసే శబ్దం ఏది?",
      Tamil: "'B' என்ற எழுத்து எழுப்பும் ஒலி என்ன?"
      },
      options: {
      English: ["kuh", "duh", "suh", "buh"],
      Hindi: ["क (kuh)", "ड (duh)", "स (suh)", "ब (buh)"],
      Kannada: ["ಕ (kuh)", "ಡ (duh)", "ಸ (suh)", "ಬ (buh)"],
      Telugu: ["క (kuh)", "డ (duh)", "స (suh)", "బ (buh)"],
      Tamil: ["க (kuh)", "ட (duh)", "ஸ (suh)", "ப (buh)"]
      },
      correctIndex: 3
    },
    {
      id: "child_l2_5",
      question: {
      English: "Which letter starts the word 'Apple'?",
      Hindi: "कौन सा अक्षर 'Apple' (सेब) शब्द शुरू करता है?",
      Kannada: "ಯಾವ ಅಕ್ಷರವು 'Apple' ಪದವನ್ನು ಪ್ರಾರಂಭಿಸುತ್ತದೆ?",
      Telugu: "'Apple' పదం ఏ అಕ್ಷరంతో ప్రారంభమవుతుంది?",
      Tamil: "'Apple' என்ற வார்த்தை எந்த எழுத்தில் தொடங்குகிறது?"
      },
      options: {
      English: ["A", "E", "O", "I"],
      Hindi: ["A", "E", "O", "I"],
      Kannada: ["A", "E", "O", "I"],
      Telugu: ["A", "E", "O", "I"],
      Tamil: ["A", "E", "O", "I"]
      },
      correctIndex: 0
    },
    {
      id: "child_l2_6",
      question: {
      English: "Which word starts with the 'F' sound?",
      Hindi: "कौन सा शब्द 'F' की ध्वनि से शुरू होता है?",
      Kannada: "ಯಾವ ಪದವು 'F' ಧ್ವನಿಯಿಂದ ಪ್ರಾರಂಭವಾಗುತ್ತದೆ?",
      Telugu: "ఏ పదం 'F' శబ్దంతో ప్రారంభమవుతుంది?",
      Tamil: "எந்த வார்த்தை 'F' ஒலியில் தொடங்குகிறது?"
      },
      options: {
      English: ["Cow", "Fish", "Cat", "Dog"],
      Hindi: ["Cow (गाय)", "Fish (मछली)", "Cat (बिल्ली)", "Dog (कुत्ता)"],
      Kannada: ["Cow (ಹಸು)", "Fish (ಮೀನು)", "Cat (ಬೆಕ್ಕು)", "Dog (ನಾಯಿ)"],
      Telugu: ["Cow (ఆవు)", "Fish (చేప)", "Cat (పిల్లి)", "Dog (కుక్క)"],
      Tamil: ["Cow (பசு)", "Fish (மீன்)", "Cat (பூனை)", "Dog (நாய்)"]
      },
      correctIndex: 1
    },
    {
      id: "child_l2_7",
      question: {
      English: "Find the word with the double 'o' sound.",
      Hindi: "दोहरे 'o' ध्वनि वाला शब्द खोजें।",
      Kannada: "ಡಬಲ್ 'o' ಧ್ವನಿ ಇರುವ ಪದವನ್ನು ಹುಡುಕಿ.",
      Telugu: "డబుల్ 'o' శబ్దం ఉన్న పదాన్ని కనుగొనండి.",
      Tamil: "இரட்டை 'o' ஒலி கொண்ட வார்த்தையைக் கண்டறியவும்."
      },
      options: {
      English: ["Back", "Bus", "Bell", "Book"],
      Hindi: ["Back (पीठ)", "Bus (बस)", "Bell (घंटी)", "Book (किताब)"],
      Kannada: ["Back (ಬೆನ್ನು)", "Bus (ಬಸ್ಸು)", "Bell (ಗಂಟೆ)", "Book (ಪುಸ್ತಕ)"],
      Telugu: ["Back (వెనుక)", "Bus (బస్సు)", "Bell (గంట)", "Book (పుస్తకం)"],
      Tamil: ["Back (முதுகு)", "Bus (பேருந்து)", "Bell (மணி)", "Book (புத்தகம்)"]
      },
      correctIndex: 3
    },
    {
      id: "child_l2_8",
      question: {
      English: "Which word rhyms with 'Sun'?",
      Hindi: "कौन सा शब्द 'Sun' के साथ तुकबंदी करता है?",
      Kannada: "ಯಾವ ಪದವು 'Sun' ನೊಂದಿಗೆ ಪ್ರಾಸಬದ್ಧವಾಗಿದೆ?",
      Telugu: "'Sun' తో ప్రాస కలిసే పదం ఏది?",
      Tamil: "'Sun' என்ற ஒலியுடன் ஒத்துப்போகும் வார்த்தை எது?"
      },
      options: {
      English: ["Red", "Row", "Run", "Rat"],
      Hindi: ["Red (लाल)", "Row (पंक्ति)", "Run (दौड़ना)", "Rat (चूहा)"],
      Kannada: ["Red (ಕೆಂಪು)", "Row (ಸಾಲಿನ)", "Run (ಓಡು)", "Rat (ಇಲಿ)"],
      Telugu: ["Red (ఎరుపు)", "Row (వరుస)", "Run (పరుగెత్తు)", "Rat (ఎలుక)"],
      Tamil: ["Red (சிவப்பு)", "Row (வரிசை)", "Run (ஓடு)", "Rat (எலி)"]
      },
      correctIndex: 2
    },
    {
      id: "child_l2_9",
      question: {
      English: "Identify the missing letter: 'P_n'.",
      Hindi: "छूटा हुआ अक्षर पहचानें: 'P_n' (कलम)।",
      Kannada: "ಬಿಟ್ಟುಹೋದ ಅಕ್ಷರವನ್ನು ಗುರುತಿಸಿ: 'P_n'.",
      Telugu: "లేని అักษరాన్ని గుర్తించండి: 'P_n'.",
      Tamil: "விடுபட்ட எழுத்தைக் கண்டறியவும்: 'P_n'."
      },
      options: {
      English: ["a", "u", "o", "e"],
      Hindi: ["a", "u", "o", "e"],
      Kannada: ["a", "u", "o", "e"],
      Telugu: ["a", "u", "o", "e"],
      Tamil: ["a", "u", "o", "e"]
      },
      correctIndex: 3
    },
    {
      id: "child_l2_10",
      question: {
      English: "Which letter matches the ending sound of the word 'Ball'?",
      Hindi: "कौन सा अक्षर 'Ball' (गेंद) शब्द की अंतिम ध्वनि से मेल खाता है?",
      Kannada: "ಯಾವ ಅಕ್ಷರವು 'Ball' ಪದದ ಕೊನೆಯ ಧ್ವನಿಗೆ ಹೊಂದಿಕೆಯಾಗುತ್ತದೆ?",
      Telugu: "'Ball' పదానికి చివరి శబ్దం ఏ అక్షరం చేస్తుంది?",
      Tamil: "'Ball' என்ற வார்த்தையின் இறுதி ஒலியுடன் பொருந்தும் எழுத்து எது?"
      },
      options: {
      English: ["L", "B", "T", "S"],
      Hindi: ["L", "B", "T", "S"],
      Kannada: ["L", "B", "T", "S"],
      Telugu: ["L", "B", "T", "S"],
      Tamil: ["L", "B", "T", "S"]
      },
      correctIndex: 0
    }
    ]
  },
  child_level_3: {
    title: {
    English: "Level 3 Assessment (CHILD)",
    Hindi: "स्तर 3 आकलन (बच्चे)",
    Kannada: "ಹಂತ 3 ಮೌಲ್ಯಮಾಪನ (ಮಕ್ಕಳು)",
    Telugu: "స్థాయి 3 అంచనా (పిల్లలు)",
    Tamil: "நிலை 3 மதிப்பீடு (குழந்தைகள்)"
    },
    description: {
    English: "Test checking capability at Level 3 for child learners.",
    Hindi: "बाल शिक्षार्थियों के लिए स्तर 3 क्षमता का परीक्षण।",
    Kannada: "ಕಲಿಯುವವರಿಗೆ ಹಂತ 3 ಸಾಮರ್ಥ್ಯವನ್ನು ಪರಿಶೀಲಿಸುವ ಪರೀಕ್ಷೆ.",
    Telugu: "అభ్యాసకుల కోసం స్థాయి 3 సామర్థ్య పరీక్ష.",
    Tamil: "கற்பவர்களுக்கான நிலை 3 திறனைச் சோதிக்கும் மதிப்பீடு."
    },
    questions: [
    {
      id: "child_l3_1",
      question: {
      English: "Choose the correct spelling for this common animal:",
      Hindi: "इस सामान्य जानवर के लिए सही वर्तनी (spelling) चुनें:",
      Kannada: "ಈ ಸಾಮಾನ್ಯ ಪ್ರಾಣಿಯ ಸರಿಯಾದ ಕಾಗುಣಿತವನ್ನು ಆರಿಸಿ:",
      Telugu: "ఈ సాధారణ జంతువు యొక్క సరైన స్పెల్లింగ్‌ను ఎంచుకోండి:",
      Tamil: "இந்த விலங்கின் சரியான எழுத்துப்பிழையைத் தேர்ந்தெடுக்கவும்:"
      },
      options: {
      English: ["Rabbit", "Rabbet", "Rabut", "Rabit"],
      Hindi: ["Rabbit", "Rabbet", "Rabut", "Rabit"],
      Kannada: ["Rabbit", "Rabbet", "Rabut", "Rabit"],
      Telugu: ["Rabbit", "Rabbet", "Rabut", "Rabit"],
      Tamil: ["Rabbit", "Rabbet", "Rabut", "Rabit"]
      },
      correctIndex: 0
    },
    {
      id: "child_l3_2",
      question: {
      English: "What is the spelling of the object you use to write?",
      Hindi: "लिखने के लिए इस्तेमाल की जाने वाली वस्तु की वर्तनी क्या है?",
      Kannada: "ಬರೆಯಲು ನೀವು ಬಳಸುವ ವಸ್ತುವಿನ ಕಾಗುಣಿತವೇನು?",
      Telugu: "మీరు రాయడానికి ఉపయోగించే వస్తువు స్పెల్లింగ్ ఏది?",
      Tamil: "எழுதப் பயன்படும் பொருளின் சரியான எழுத்துப்பிழை என்ன?"
      },
      options: {
      English: ["Pencil", "Pensil", "Pencile", "Pencel"],
      Hindi: ["Pencil", "Pensil", "Pencile", "Pencel"],
      Kannada: ["Pencil", "Pensil", "Pencile", "Pencel"],
      Telugu: ["Pencil", "Pensil", "Pencile", "Pencel"],
      Tamil: ["Pencil", "Pensil", "Pencile", "Pencel"]
      },
      correctIndex: 0
    },
    {
      id: "child_l3_3",
      question: {
      English: "Identify the word for this color:",
      Hindi: "इस रंग के शब्द को पहचानें (लाल):",
      Kannada: "ಈ ಬಣ್ಣದ ಪದವನ್ನು ಗುರುತಿಸಿ (ಕೆಂಪು):",
      Telugu: "ఈ రంగు యొక్క పదాన్ని గుర్తించండి (ఎరుపు):",
      Tamil: "இந்த வண்ணத்திற்கான வார்த்தையை அடையாளம் காணவும் (சிவப்பு):"
      },
      options: {
      English: ["Rad", "Rid", "Rud", "Red"],
      Hindi: ["Rad", "Rid", "Rud", "Red"],
      Kannada: ["Rad", "Rid", "Rud", "Red"],
      Telugu: ["Rad", "Rid", "Rud", "Red"],
      Tamil: ["Rad", "Rid", "Rud", "Red"]
      },
      correctIndex: 3
    },
    {
      id: "child_l3_4",
      question: {
      English: "Find the correct spelling of the vehicle that takes you to school:",
      Hindi: "स्कूल ले जाने वाले वाहन की सही वर्तनी खोजें:",
      Kannada: "ನಿಮ್ಮನ್ನು ಶಾಲೆಗೆ ಕರೆದೊಯ್ಯುವ ವಾಹನದ ಸರಿಯಾದ ಕಾಗುಣಿತವನ್ನು ಹುಡುಕಿ:",
      Telugu: "మిమ్మల్ని పాఠశాలకు తీసుకెళ్లే వాహనం యొక్క సరైన స్పెల్లింగ్ కనుగొనండి:",
      Tamil: "உங்களைப் பள்ளிக்கு அழைத்துச் செல்லும் வாகனத்தின் சரியான எழுத்துப்பிழையைக் கண்டறியவும்:"
      },
      options: {
      English: ["Shool Bus", "School Bas", "School Bus", "Scol Bus"],
      Hindi: ["Shool Bus", "School Bas", "School Bus", "Scol Bus"],
      Kannada: ["Shool Bus", "School Bas", "School Bus", "Scol Bus"],
      Telugu: ["Shool Bus", "School Bas", "School Bus", "Scol Bus"],
      Tamil: ["Shool Bus", "School Bas", "School Bus", "Scol Bus"]
      },
      correctIndex: 2
    },
    {
      id: "child_l3_5",
      question: {
      English: "Select the correct spelling of the person who teaches you:",
      Hindi: "आपको पढ़ाने वाले व्यक्ति की सही वर्तनी चुनें:",
      Kannada: "ನಿಮಗೆ ಪಾಠ ಕಲಿಸುವ ವ್ಯಕ್ತಿಯ ಸರಿಯಾದ ಕಾಗುಣಿತವನ್ನು ಆರಿಸಿ:",
      Telugu: "మీకు పాఠాలు చెప్పే వ్యక్తి యొక్క సరైన స్పెల్లింగ్‌ను ఎంచుకోండి:",
      Tamil: "உங்களுக்குக் கற்பிக்கும் நபரின் சரியான எழுத்துப்பிழையைத் தேர்ந்தெடுக்கவும்:"
      },
      options: {
      English: ["Teachur", "Teacher", "Techer", "Teecher"],
      Hindi: ["Teachur", "Teacher", "Techer", "Teecher"],
      Kannada: ["Teachur", "Teacher", "Techer", "Teecher"],
      Telugu: ["Teachur", "Teacher", "Techer", "Teecher"],
      Tamil: ["Teachur", "Teacher", "Techer", "Teecher"]
      },
      correctIndex: 1
    },
    {
      id: "child_l3_6",
      question: {
      English: "What is the opposite word for 'Big'?",
      Hindi: "'Big' (बड़ा) का विपरीत शब्द क्या है?",
      Kannada: "'Big' ಪದದ ವಿರುದ್ಧ ಪದ ಯಾವುದು?",
      Telugu: "'Big' అనే పదానికి వ్యతిరేక పదం ఏది?",
      Tamil: "'Big' என்ற வார்த்தையின் எதிர்ச்சொல் எது?"
      },
      options: {
      English: ["Tall", "Fat", "Small", "Short"],
      Hindi: ["Tall (लंबा)", "Fat (मोटा)", "Small (छोटा)", "Short (ठिंगना)"],
      Kannada: ["Tall (ಎತ್ತರ)", "Fat (ದಪ್ಪ)", "Small (ಸಣ್ಣ)", "Short (ಗಿಡ್ಡ)"],
      Telugu: ["Tall (పొడవు)", "Fat (లావు)", "Small (చిన్న)", "Short (పొట్టి)"],
      Tamil: ["Tall (உயரமான)", "Fat (குண்டான)", "Small (சிறிய)", "Short (குட்டையான)"]
      },
      correctIndex: 2
    },
    {
      id: "child_l3_7",
      question: {
      English: "Find the correct spelling of this body part:",
      Hindi: "शरीर के इस अंग की सही वर्तनी खोजें (हाथ):",
      Kannada: "ದೇಹದ ಈ ಭಾಗದ ಸರಿಯಾದ ಕಾಗುಣಿತವನ್ನು ಹುಡುಕಿ (ಕೈ):",
      Telugu: "శరీరంలోని ఈ భాగం యొక్క సరైన స్పెల్లింగ్ కనుగొనండి (చేయి):",
      Tamil: "உடலின் இந்த உறுப்பின் சரியான எழுத்துப்பிழையைக் கண்டறியவும் (கை):"
      },
      options: {
      English: ["Hund", "Hond", "Hend", "Hand"],
      Hindi: ["Hund", "Hond", "Hend", "Hand"],
      Kannada: ["Hund", "Hond", "Hend", "Hand"],
      Telugu: ["Hund", "Hond", "Hend", "Hand"],
      Tamil: ["Hund", "Hond", "Hend", "Hand"]
      },
      correctIndex: 3
    },
    {
      id: "child_l3_8",
      question: {
      English: "Which word describes the action of reading a book?",
      Hindi: "कौन सा शब्द किताब पढ़ने की क्रिया को दर्शाता है?",
      Kannada: "ಯಾವ ಪದವು ಪುಸ್ತಕವನ್ನು ಓದುವ ಕ್ರಿಯೆಯನ್ನು ವಿವರಿಸುತ್ತದೆ?",
      Telugu: "ఏ పదం పుస్తకం చదివే క్రియను సూచిస్తుంది?",
      Tamil: "புத்தகம் படிக்கும் செயலைக் குறிக்கும் வார்த்தை எது?"
      },
      options: {
      English: ["Run", "Play", "Read", "Eat"],
      Hindi: ["Run (दौड़ना)", "Play (खेलना)", "Read (पढ़ना)", "Eat (खाना)"],
      Kannada: ["Run (ಓಡು)", "Play (ಆಟವಾಡು)", "Read (ಓದು)", "Eat (ತಿನ್ನು)"],
      Telugu: ["Run (పరుగెత్తడం)", "Play (ఆడుకోవడం)", "Read (చదవడం)", "Eat (తినడం)"],
      Tamil: ["Run (ஓடுதல்)", "Play (விளையாடுதல்)", "Read (படித்தல்)", "Eat (உண்ணுதல்)"]
      },
      correctIndex: 2
    },
    {
      id: "child_l3_9",
      question: {
      English: "Find the spelling of the day after Friday:",
      Hindi: "शुक्रवार के बाद के दिन की वर्तनी खोजें:",
      Kannada: "ಶುಕ್ರವಾರದ ನಂತರದ ದಿನದ ಕಾಗುಣಿತವನ್ನು ಹುಡುಕಿ:",
      Telugu: "శుక్రవారం తర్వాత వచ్చే రోజు స్పెల్లింగ్ కనుగొనండి:",
      Tamil: "வெள்ளிக்கிழமைக்கு அடுத்த நாளின் எழுத்துப்பிழையைக் கண்டறியவும்:"
      },
      options: {
      English: ["Satarday", "Saterday", "Saturday", "Saturdae"],
      Hindi: ["Satarday", "Saterday", "Saturday", "Saturdae"],
      Kannada: ["Satarday", "Saterday", "Saturday", "Saturdae"],
      Telugu: ["Satarday", "Saterday", "Saturday", "Saturdae"],
      Tamil: ["Satarday", "Saterday", "Saturday", "Saturdae"]
      },
      correctIndex: 2
    },
    {
      id: "child_l3_10",
      question: {
      English: "Choose the correct spelling of the place where we live:",
      Hindi: "हम जहां रहते हैं उस स्थान की सही वर्तनी चुनें (घर):",
      Kannada: "ನಾವು ವಾಸಿಸುವ ಸ್ಥಳದ ಸರಿಯಾದ ಕಾಗುಣಿತವನ್ನು ಆರಿಸಿ (ಮನೆ):",
      Telugu: "మనం నివసించే స్థలం యొక్క సరైన స్పెల్లింగ్‌ను ఎంచుకోండి (ఇల్లు):",
      Tamil: "நாம் வாழும் இடத்தின் சரியான எழுத்துப்பிழையைத் தேர்ந்தெடுக்கவும் (வீடு):"
      },
      options: {
      English: ["House", "Hose", "Howse", "Hause"],
      Hindi: ["House", "Hose", "Howse", "Hause"],
      Kannada: ["House", "Hose", "Howse", "Hause"],
      Telugu: ["House", "Hose", "Howse", "Hause"],
      Tamil: ["House", "Hose", "Howse", "Hause"]
      },
      correctIndex: 0
    }
    ]
  },
  child_level_4: {
    title: {
    English: "Level 4 Assessment (CHILD)",
    Hindi: "स्तर 4 आकलन (बच्चे)",
    Kannada: "ಹಂತ 4 ಮೌಲ್ಯಮಾಪನ (ಮಕ್ಕಳು)",
    Telugu: "స్థాయి 4 అంచనా (పిల్లలు)",
    Tamil: "நிலை 4 மதிப்பீடு (குழந்தைகள்)"
    },
    description: {
    English: "Test checking capability at Level 4 for child learners.",
    Hindi: "बाल शिक्षार्थियों के लिए स्तर 4 क्षमता का परीक्षण।",
    Kannada: "ಕಲಿಯುವವರಿಗೆ ಹಂತ 4 ಸಾಮರ್ಥ್ಯವನ್ನು ಪರಿಶೀಲಿಸುವ ಪರೀಕ್ಷೆ.",
    Telugu: "అభ్యాసకుల కోసం స్థాయి 4 సామర్థ్య పరీక్ష.",
    Tamil: "கற்பவர்களுக்கான நிலை 4 திறனைச் சோதிக்கும் மதிப்பீடு."
    },
    questions: [
    {
      id: "child_l4_1",
      question: {
      English: "Complete: 'The dog chases the ______.'",
      Hindi: "पूरा करें: 'The dog chases the ______.'",
      Kannada: "ಪೂರ್ಣಗೊಳಿಸಿ: 'The dog chases the ______.'",
      Telugu: "పూర్తి చేయండి: 'The dog chases the ______.'",
      Tamil: "வாக்கியத்தை நிரப்புக: 'The dog chases the ______.'"
      },
      options: {
      English: ["sky", "cat", "book", "car"],
      Hindi: ["sky (आसमान)", "cat (बिल्ली)", "book (किताब)", "car (गाड़ी)"],
      Kannada: ["sky (ಆಕಾಶ)", "cat (ಬೆಕ್ಕು)", "book (ಪುಸ್ತಕ)", "car (ಕಾರು)"],
      Telugu: ["sky (ఆకాశం)", "cat (పిల్లి)", "book (పుస్తకం)", "car (కారు)"],
      Tamil: ["sky (வானம்)", "cat (பூனை)", "book (புத்தகம்)", "car (கார்)"]
      },
      correctIndex: 1
    },
    {
      id: "child_l4_2",
      question: {
      English: "Read the school sign: 'QUIET'. What should you do?",
      Hindi: "स्कूल का बोर्ड पढ़ें: 'QUIET' (शांत रहें)। आपको क्या करना चाहिए?",
      Kannada: "ಶಾಲೆಯ ಬೋರ್ಡ್ ಓದಿ: 'QUIET'. ನೀವು ಏನು ಮಾಡಬೇಕು?",
      Telugu: "పాఠశాల బోర్డు చదవండి: 'QUIET'. మీరు ఏమి చేయాలి?",
      Tamil: "பள்ளிப் பலகையைப் படிக்கவும்: 'QUIET'. நீங்கள் என்ன செய்ய வேண்டும்?"
      },
      options: {
      English: ["Talk softly", "Run fast", "Play games", "Shout loud"],
      Hindi: ["धीमे से बोलें", "तेज़ दौड़ें", "खेल खेलें", "ज़ोर से चिल्लाएं"],
      Kannada: ["ಮೆಲ್ಲಗೆ ಮಾತನಾಡಿ", "ವೇಗವಾಗಿ ಓಡು", "ಆಟವಾಡು", "ಜೋರಾಗಿ ಕಿರುಚು"],
      Telugu: ["నెమ్మదిగా మాట్లాడాలి", "వేగంగా పరుగెత్తాలి", "ఆడుకోవాలి", "గట్టిగా అరవాలి"],
      Tamil: ["மெதுவாகப் பேசவும்", "வேகமாக ஓடவும்", "விளையாடவும்", "சத்தமாக கத்தவும்"]
      },
      correctIndex: 0
    },
    {
      id: "child_l4_3",
      question: {
      English: "Complete: 'My book is on the ______.'",
      Hindi: "पूरा करें: 'My book is on the ______.'",
      Kannada: "ಪೂರ್ಣಗೊಳಿಸಿ: 'My book is on the ______.'",
      Telugu: "పూర్తి చేయండి: 'My book is on the ______.'",
      Tamil: "வாக்கியத்தை நிரப்புக: 'My book is on the ______.'"
      },
      options: {
      English: ["table", "water", "tree", "river"],
      Hindi: ["table (मेज़)", "water (पानी)", "tree (पेड़)", "river (नदी)"],
      Kannada: ["table (ಮೇಜು)", "water (ನೀರು)", "tree (ಮರ)", "river (ನದಿ)"],
      Telugu: ["table (బల్ల)", "water (నీరు)", "tree (చెట్టు)", "river (నది)"],
      Tamil: ["table (மேஜை)", "water (தண்ணீர்)", "tree (மரம்)", "river (நதி)"]
      },
      correctIndex: 0
    },
    {
      id: "child_l4_4",
      question: {
      English: "Read the sign: 'EXIT'. Where does it lead?",
      Hindi: "बोर्ड पढ़ें: 'EXIT' (निकास)। यह कहाँ ले जाता है?",
      Kannada: "ಚಿಹ್ನೆಯನ್ನು ಓದಿ: 'EXIT'. ಇದು ಎಲ್ಲಿಗೆ ಕರೆದೊಯ್ಯುತ್ತದೆ?",
      Telugu: "'EXIT' బోర్డు చదవండి. ఇది ఎటు దారి తీస్తుంది?",
      Tamil: "'EXIT' பலகையைப் படிக்கவும். இது எங்கு வழிநடத்துகிறது?"
      },
      options: {
      English: ["Way in", "Office", "Way out", "Restroom"],
      Hindi: ["अंदर आने का रास्ता", "कार्यालय", "बाहर जाने का रास्ता", "शौचालय"],
      Kannada: ["ಒಳಗೆ ಬರುವ ದಾರಿ", "ಕಚೇರಿ", "ಹೊರಹೋಗುವ ದಾರಿ", "ವಿಶ್ರಾಂತಿ ಕೊಠಡಿ"],
      Telugu: ["లోపలికి వచ్చే దారి", "కార్యాలయం", "బయటకు వెళ్లే దారి", "విశ్రాంతి గది"],
      Tamil: ["உள்ளே செல்லும் வழி", "அலுவலகம்", "வெளியேறும் வழி", "கழிவறை"]
      },
      correctIndex: 2
    },
    {
      id: "child_l4_5",
      question: {
      English: "Complete: 'Birds fly in the ______.'",
      Hindi: "पूरा करें: 'Birds fly in the ______.'",
      Kannada: "ಪೂರ್ಣಗೊಳಿಸಿ: 'Birds fly in the ______.'",
      Telugu: "పూర్తి చేయండి: 'Birds fly in the ______.'",
      Tamil: "வாக்கியத்தை நிரப்புக: 'Birds fly in the ______.'"
      },
      options: {
      English: ["sea", "ground", "sky", "house"],
      Hindi: ["sea (समुद्र)", "ground (ज़मीन)", "sky (आसमान)", "house (घर)"],
      Kannada: ["sea (ಸಮುದ್ರ)", "ground (ನೆಲ)", "sky (ಆಕಾಶ)", "house (ಮನೆ)"],
      Telugu: ["sea (సముద్రం)", "ground (నేల)", "sky (ఆకాశం)", "house (ఇల్లు)"],
      Tamil: ["sea (கடல்)", "ground (தரை)", "sky (வானம்)", "house (வீடு)"]
      },
      correctIndex: 2
    },
    {
      id: "child_l4_6",
      question: {
      English: "Read the sign: 'DANGER'. What does it tell you?",
      Hindi: "संकेत पढ़ें: 'DANGER' (खतरा)। यह आपको क्या बताता है?",
      Kannada: "ಚಿಹ್ನೆಯನ್ನು ಓದಿ: 'DANGER'. ಇದು ನಿಮಗೆ ಏನನ್ನು ತಿಳಿಸುತ್ತದೆ?",
      Telugu: "'DANGER' బోర్డు చదవండి. ఇది మీకు ఏం చెబుతుంది?",
      Tamil: "'DANGER' பலகையைப் படிக்கவும். இது உங்களுக்கு என்ன சொல்கிறது?"
      },
      options: {
      English: ["Welcome in", "Free toys", "No water", "Be careful"],
      Hindi: ["अंदर आएं", "मुफ़्त खिलौने", "पानी नहीं", "सावधान रहें"],
      Kannada: ["ಒಳಗೆ ಬನ್ನಿ", "ಉಚಿತ ಆಟಿಕೆಗಳು", "ನೀರಿಲ್ಲ", "ಎಚ್ಚರಿಕೆಯಿಂದಿರಿ"],
      Telugu: ["స్వాగతం", "ఉచిత ఆటబొమ్మలు", "నీరు లేదు", "జాగ్రత్తగా ఉండండి"],
      Tamil: ["வரவேற்கிறோம்", "இலவச பொம்மைகள்", "தண்ணீர் இல்லை", "கவனமாக இருக்கவும்"]
      },
      correctIndex: 3
    },
    {
      id: "child_l4_7",
      question: {
      English: "Complete: 'I brush my ______ every morning.'",
      Hindi: "पूरा करें: 'I brush my ______ every morning.'",
      Kannada: "ಪೂರ್ಣಗೊಳಿಸಿ: 'I brush my ______ every morning.'",
      Telugu: "పూర్తి చేయండి: 'I brush my ______ every morning.'",
      Tamil: "வாக்கியத்தை நிரப்புக: 'I brush my ______ every morning.'"
      },
      options: {
      English: ["hair", "teeth", "shoes", "toys"],
      Hindi: ["hair (बाल)", "teeth (दांत)", "shoes (जूते)", "toys (खिलौने)"],
      Kannada: ["hair (ಕೂದಲು)", "teeth (ಹಲ್ಲು)", "shoes (ಶೂಗಳು)", "toys (ಆಟಿಕೆಗಳು)"],
      Telugu: ["hair (జుట్టు)", "teeth (పళ్లు)", "shoes (షూలు)", "toys (బొమ్మలు)"],
      Tamil: ["hair (தலைமுடி)", "teeth (பற்கள்)", "shoes (காலணிகள்)", "toys (பொம்மைகள்)"]
      },
      correctIndex: 1
    },
    {
      id: "child_l4_8",
      question: {
      English: "Read the library sign: 'SILENCE'. What does it mean?",
      Hindi: "पुस्तकालय का बोर्ड पढ़ें: 'SILENCE' (मौन)। इसका क्या अर्थ है?",
      Kannada: "ಗ್ರಂಥಾಲಯದ ಬೋರ್ಡ್ ಓದಿ: 'SILENCE'. ಇದರ ಅರ್ಥವೇನು?",
      Telugu: "లైబ్రరీ బోర్డు చదవండి: 'SILENCE'. దీని అర్థం ఏమిటి?",
      Tamil: "நூலகப் பலகையைப் படிக்கவும்: 'SILENCE'. இதன் பொருள் என்ன?"
      },
      options: {
      English: ["Do not make noise", "Eat food", "Shout and sing", "Sleep here"],
      Hindi: ["शोर न मचाएं", "खाना खाएं", "चिल्लाएं और गाएं", "यहाँ सोएं"],
      Kannada: ["ಶಬ್ದ ಮಾಡಬೇಡಿ", "ಊಟ ಮಾಡು", "ಕಿರುಚು ಮತ್ತು ಹಾಡು", "ಇಲ್ಲಿ ಮಲಗು"],
      Telugu: ["శబ్దం చేయకూడదు", "ఆహారం తినడం", "అరవడం మరియు పాడటం", "ఇక్కడ పడుకోవడం"],
      Tamil: ["சத்தம் போடக் கூடாது", "உணவு சாப்பிடவும்", "கத்தவும் பாடவும்", "இங்கு தூங்கவும்"]
      },
      correctIndex: 0
    },
    {
      id: "child_l4_9",
      question: {
      English: "Complete: 'My teacher writes on the ______.'",
      Hindi: "पूरा करें: 'My teacher writes on the ______.'",
      Kannada: "ಪೂರ್ಣಗೊಳಿಸಿ: 'My teacher writes on the ______.'",
      Telugu: "పూర్తి చేయండి: 'My teacher writes on the ______.'",
      Tamil: "வாக்கியத்தை நிரப்புக: 'My teacher writes on the ______.'"
      },
      options: {
      English: ["floor", "board", "door", "window"],
      Hindi: ["floor (फर्श)", "board (बोर्ड)", "door (दरवाजा)", "window (खिड़की)"],
      Kannada: ["floor (ನೆಲ)", "board (ಬೋರ್ಡ್)", "door (ಬಾಗಿಲು)", "window (ಕಿಟಕಿ)"],
      Telugu: ["floor (నేల)", "board (బోర్డు)", "door (తలుపు)", "window (కిటికీ)"],
      Tamil: ["floor (தரை)", "board (கரும்பலகை)", "door (கதவு)", "window (ஜன்னல்)"]
      },
      correctIndex: 1
    },
    {
      id: "child_l4_10",
      question: {
      English: "Read the school gate sign: 'NO ENTRY'. Who can go in?",
      Hindi: "स्कूल के गेट का बोर्ड पढ़ें: 'NO ENTRY' (प्रवेश निषेध)। कौन अंदर जा सकता है?",
      Kannada: "ಶಾಲೆಯ ಗೇಟ್ ಚಿಹ್ನೆಯನ್ನು ಓದಿ: 'NO ENTRY'. ಯಾರು ಒಳಗೆ ಹೋಗಬಹುದು?",
      Telugu: "బడి గేటు వద్ద ఉన్న బోర్డు చదవండి: 'NO ENTRY'. ఎవరు లోపలికి వెళ్ళవచ్చు?",
      Tamil: "பள்ளி வாசலில் உள்ள பலகையைப் படிக்கவும்: 'NO ENTRY'. யார் உள்ளே செல்லலாம்?"
      },
      options: {
      English: ["Only cars", "Anyone freely", "Only animals", "Nobody without permission"],
      Hindi: ["केवल कार", "कोई भी स्वतंत्र रूप से", "केवल जानवर", "बिना अनुमति के कोई नहीं"],
      Kannada: ["ಕೇವಲ ಕಾರುಗಳು", "ಯಾರು ಬೇಕಾದರೂ ಹೋಗಬಹುದು", "ಕೇವಲ ಪ್ರಾಣಿಗಳು", "ಅನುಮತಿ ಇಲ್ಲದೆ ಯಾರೂ ಇಲ್ಲ"],
      Telugu: ["కార్లు మాత్రమే", "ఎవరైనా ఉచితంగా వెళ్ళవచ్చు", "జంతువులు మాత్రమే", "అనుమతి లేనిదే ఎవరూ వెళ్ళకూడదు"],
      Tamil: ["கார்கள் மட்டும்", "யாரும் தடையின்றி செல்லலாம்", "விலங்குகள் மட்டும்", "அனுமதி இல்லாமல் யாரும் செல்லக் கூடாது"]
      },
      correctIndex: 3
    }
    ]
  },
  child_level_5: {
    title: {
    English: "Level 5 Assessment (CHILD)",
    Hindi: "स्तर 5 आकलन (बच्चे)",
    Kannada: "ಹಂತ 5 ಮೌಲ್ಯಮಾಪನ (ಮಕ್ಕಳು)",
    Telugu: "స్థాయి 5 అంచనా (పిల్లలు)",
    Tamil: "நிலை 5 மதிப்பீடு (குழந்தைகள்)"
    },
    description: {
    English: "Test checking capability at Level 5 for child learners.",
    Hindi: "बाल शिक्षार्थियों के लिए स्तर 5 क्षमता का परीक्षण।",
    Kannada: "ಕಲಿಯುವವರಿಗೆ ಹಂತ 5 ಸಾಮರ್ಥ್ಯವನ್ನು ಪರಿಶೀಲಿಸುವ ಪರೀಕ್ಷೆ.",
    Telugu: "అభ్యాసకుల కోసం స్థాయి 5 సామర్థ్య పరీక్ష.",
    Tamil: "கற்பவர்களுக்கான நிலை 5 திறனைச் சோதிக்கும் மதிப்பீடு."
    },
    questions: [
    {
      id: "child_l5_1",
      question: {
      English: "Read this short story:\n\nBobby has a little puppy named Bruno. Bruno likes to chew on soft toys. Yesterday, Bruno chewed Bobby's red ball.\n\nWhat is the name of Bobby's puppy?",
      Hindi: "इस कहानी को पढ़ें:\n\nबॉबी के पास ब्रूनो नाम का एक छोटा पिल्ला है। ब्रूनो को सॉफ्ट टॉय चबाना पसंद है। कल ब्रूनो ने बॉबी की लाल गेंद चबा ली।\n\nबॉबी के पिल्ले का नाम क्या है?",
      Kannada: "ಈ ಸಣ್ಣ ಕಥೆಯನ್ನು ಓದಿ:\n\nಬಾಬಿ ಬಳಿ ಬ್ರೂನೋ ಎಂಬ ಸಣ್ಣ ನಾಯಿಮರಿ ಇದೆ. ಬ್ರೂನೋಗೆ ಆಟಿಕೆಗಳನ್ನು ಕಚ್ಚುವುದು ಇಷ್ಟ. ನಿನ್ನೆ, ಬ್ರೂನೋ ಬಾಬಿಯ ಕೆಂಪು ಚೆಂಡನ್ನು ಕಚ್ಚಿ ಹಾಳುಮಾಡಿತು.\n\nಬಾಬಿಯ ನಾಯಿಮರಿಯ ಹೆಸರೇನು?",
      Telugu: "ఈ చిన్న కథను చదవండి:\n\nబాబీకి బ్రూనో అనే చిన్న కుక్కపిల్ల ఉంది. బ్రూనోకు మెత్తటి బొమ్మలను కొరకడం ఇష్టం. నిన్న బ్రూనో బాబీ ఎరుపు బంతిని కొరికింది.\n\nబాబీ కుక్కపిల్ల పేరు ఏమిటి?",
      Tamil: "இந்தக் கதையைப் படிக்கவும்:\n\nபாபியிடம் புரூனோ என்ற சிறிய நாய்க்குட்டி இருந்தது. புரூனோவுக்கு மென்மையான பொம்மைகளை மெல்ல பிடிக்கும். நேற்று, புரூனோ பாபியின் சிவப்பு பந்தை மென்றது.\n\nபாபியின் நாய்க்குட்டியின் பெயர் என்ன?"
      },
      options: {
      English: ["Max", "Bobby", "Bruno", "Rex"],
      Hindi: ["मैक्स", "बॉबी", "ब्रूनो", "रेक्स"],
      Kannada: ["ಮ್ಯಾಕ್ಸ್", "ಬಾಬಿ", "ಬ್ರೂನೋ", "ರೆಕ್ಸ್"],
      Telugu: ["మాక్స్", "బాబీ", "బ్రూనో", "రెక్స్"],
      Tamil: ["மேக்ஸ்", "பாபி", "புரூனோ", "ரெக்ஸ்"]
      },
      correctIndex: 2
    },
    {
      id: "child_l5_2",
      question: {
      English: "Read the story above again. What object did the puppy chew?",
      Hindi: "ऊपर दी गई कहानी को दोबारा पढ़ें। पिल्ले ने किस वस्तु को चबाया?",
      Kannada: "ಮೇಲಿನ ಕಥೆಯನ್ನು ಮತ್ತೆ ಓದಿ. ನಾಯಿಮರಿ ಯಾವ ವಸ್ತುವನ್ನು ಕಚ್ಚಿತು?",
      Telugu: "పై కథను మళ్లీ చదవండి. కుక్కపిల్ల ఏ వస్తువును కొరికింది?",
      Tamil: "மேலே உள்ள கதையை மீண்டும் படிக்கவும். நாய்க்குட்டி எந்தப் பொருளை மென்றது?"
      },
      options: {
      English: ["Shoes", "Soft doll", "Red ball", "Spoon"],
      Hindi: ["जूते", "नरम गुड़िया", "लाल गेंद", "चम्मच"],
      Kannada: ["ಶೂಗಳು", "ಮೆತ್ತಗಿನ ಗೊಂಬೆ", "ಕೆಂಪು ಚೆಂಡು", "ಚಮಚ"],
      Telugu: ["షూలు", "మెత్తటి బొమ్మ", "ఎరుపు బంతి", "స్పూన్"],
      Tamil: ["காலணி", "மென்மையான பொம்மை", "சிவப்பு பந்து", "கரண்டி"]
      },
      correctIndex: 2
    },
    {
      id: "child_l5_3",
      question: {
      English: "Read this warning box:\n\nChildren must wash their hands before lunch. Do not play with soil after washing.\n\nWhen should children wash their hands?",
      Hindi: "इस चेतावनी बॉक्स को पढ़ें:\n\nबच्चों को दोपहर के भोजन से पहले अपने हाथ धोने चाहिए। हाथ धोने के बाद मिट्टी से न खेलें।\n\nबच्चों को हाथ कब धोना चाहिए?",
      Kannada: "ಈ ಎಚ್ಚರಿಕೆಯನ್ನು ಓದಿ:\n\nಮಕ್ಕಳು ಊಟಕ್ಕೆ ಮುನ್ನ ಕೈಗಳನ್ನು ತೊಳೆದುಕೊಳ್ಳಬೇಕು. ತೊಳೆದ ನಂತರ ಮಣ್ಣಿನಲ್ಲಿ ಆಟವಾಡಬಾರದು.\n\nಮಕ್ಕಳು ಯಾವಾಗ ಕೈ ತೊಳೆಯಬೇಕು?",
      Telugu: "ఈ హెచ్చరికను చదవండి:\n\nపిల్లలు భోజనానికి ముందు చేతులు కడుక్కోవాలి. కడుక్కున్న తర్వాత మట్టితో ఆడకూడదు.\n\nపిల్లలు ఎప్పుడు చేతులు కడుక్కోవాలి?",
      Tamil: "இந்த எச்சரிக்கையைப் படிக்கவும்:\n\nகுழந்தைகள் மதிய உணவுக்கு முன் கைகளைக் கழுவ வேண்டும். கழுவிய பின் மண்ணில் விளையாடக் கூடாது.\n\nகுழந்தைகள் எப்போது கைகளைக் கழுவ வேண்டும்?"
      },
      options: {
      English: ["Only at night", "After lunch", "Before sleeping", "Before lunch"],
      Hindi: ["केवल रात में", "दोपहर के भोजन के बाद", "सोने से पहले", "दोपहर के भोजन से पहले"],
      Kannada: ["ರಾತ್ರಿ ಮಾತ್ರ", "ಊಟದ ನಂತರ", "ಮಲಗುವ ಮುನ್ನ", "ಊಟಕ್ಕೆ ಮುನ್ನ"],
      Telugu: ["రాత్రి మాత్రమే", "భోజనం తర్వాత", "పడుకునే ముందు", "భోజనానికి ముందు"],
      Tamil: ["இரவில் மட்டும்", "மதிய உணவுக்கு பின்", "தூங்குவதற்கு முன்", "மதிய உணவுக்கு முன்"]
      },
      correctIndex: 3
    },
    {
      id: "child_l5_4",
      question: {
      English: "Read this classroom schedule:\n\nDrawing class starts at 10 AM. Story hour starts at 11 AM. Playground play starts at 12 PM.\n\nAt what time does Story hour start?",
      Hindi: "इस कक्षा कार्यक्रम को पढ़ें:\n\nड्राइंग क्लास सुबह 10 बजे शुरू होती है। कहानी का समय (Story hour) सुबह 11 बजे शुरू होता है। खेल का मैदान दोपहर 12 बजे शुरू होता है।\n\nकहानी का समय किस समय शुरू होता है?",
      Kannada: "ಈ ತರಗತಿ ವೇಳಾಪಟ್ಟಿಯನ್ನು ಓದಿ:\n\nಚಿತ್ರಕಲೆ ತರಗತಿ ಬೆಳಿಗ್ಗೆ 10 ಕ್ಕೆ ಪ್ರಾರಂಭವಾಗುತ್ತದೆ. ಕಥೆ ಹೇಳುವ ಸಮಯ ಬೆಳಿಗ್ಗೆ 11 ಕ್ಕೆ ಪ್ರಾರಂಭವಾಗುತ್ತದೆ. ಆಟದ ಮೈದಾನ ಆಟ ಮಧ್ಯಾಹ್ನ 12 ಕ್ಕೆ ಪ್ರಾರಂಭವಾಗುತ್ತದೆ.\n\nಕಥೆ ಹೇಳುವ ಸಮಯ ಯಾವಾಗ ಪ್ರಾರಂಭವಾಗುತ್ತದೆ?",
      Telugu: "ఈ తరగతి సమయ పట్టికను చదవండి:\n\nడ్రాయింగ్ క్లాస్ ఉదయం 10 గంటలకు ప్రారంభమవుతుంది. స్టోరీ అవర్ ఉదయం 11 గంటలకు ప్రారంభమవుతుంది. ఆటస్థలానికి వెళ్లే సమయం మధ్యాహ్నం 12 గంటలకు.\n\nస్టోరీ అవర్ ఏ సమయానికి ప్రారంభమవుతుంది?",
      Tamil: "இந்த வகுப்பு அட்டவணையைப் படிக்கவும்:\n\nஓவிய வகுப்பு காலை 10 மணிக்குத் தொடங்குகிறது. கதை நேரம் காலை 11 மணிக்குத் தொடங்குகிறது. விளையாட்டு நேரம் மதியம் 12 மணிக்குத் தொடங்குகிறது.\n\nகதை நேரம் எத்தனை மணிக்குத் தொடங்குகிறது?"
      },
      options: {
      English: ["9 AM", "11 AM", "12 PM", "10 AM"],
      Hindi: ["सुबह 9 बजे", "सुबह 11 बजे", "दोपहर 12 बजे", "सुबह 10 बजे"],
      Kannada: ["ಬೆಳಿಗ್ಗೆ 9", "ಬೆಳಿಗ್ಗೆ 11", "ಮಧ್ಯಾಹ್ನ 12", "ಬೆಳಿಗ್ಗೆ 10"],
      Telugu: ["ఉదయం 9 గంటలకు", "ఉదయం 11 గంటలకు", "మధ్యాహ్నం 12 గంటలకు", "ఉదయం 10 గంటలకు"],
      Tamil: ["காலை 9 மணி", "காலை 11 மணி", "மதியம் 12 மணி", "காலை 10 மணி"]
      },
      correctIndex: 1
    },
    {
      id: "child_l5_5",
      question: {
      English: "Read this announcement:\n\nToday is very rainy. All students must stay inside the classroom during recess.\n\nWhy must students stay inside?",
      Hindi: "इस घोषणा को पढ़ें:\n\nआज बहुत बारिश हो रही है। आधी छुट्टी (recess) के दौरान सभी छात्रों को कक्षा के भीतर रहना होगा।\n\nछात्रों को अंदर क्यों रहना चाहिए?",
      Kannada: "ಈ ಪ್ರಕಟಣೆಯನ್ನು ಓದಿ:\n\nಇಂದು ಭಾರಿ ಮಳೆಯಾಗುತ್ತಿದೆ. ವಿರಾಮದ ಸಮಯದಲ್ಲಿ ಎಲ್ಲಾ ವಿದ್ಯಾರ್ಥಿಗಳು ತರಗತಿಯೊಳಗೆ ಇರಬೇಕು.\n\nವಿದ್ಯಾರ್ಥಿಗಳು ಏಕೆ ಒಳಗೆ ಇರಬೇಕು?",
      Telugu: "ఈ ప్రకటనను చదవండి:\n\nఈ రోజు బాగా వర్షం పడుతోంది. విరామ సమయంలో విద్యార్థులందరూ తరగతి గదిలోనే ఉండాలి.\n\nవిద్యార్థులు ఎందుకు లోపలే ఉండాలి?",
      Tamil: "இந்த அறிவிப்பைப் படிக்கவும்:\n\nஇன்று அதிக மழை பெய்கிறது. இடைவேளையின் போது மாணவர்கள் அனைவரும் வகுப்பறைக்குள் இருக்க வேண்டும்.\n\nமாணவர்கள் ஏன் உள்ளே இருக்க வேண்டும்?"
      },
      options: {
      English: ["Because it is hot", "Because it is rainy", "Because the school is closed", "To study math"],
      Hindi: ["क्योंकि गर्मी है", "क्योंकि बारिश हो रही है", "क्योंकि स्कूल बंद है", "गणित पढ़ने के लिए"],
      Kannada: ["ಬಿಸಿಲು ಇರುವುದರಿಂದ", "ಮಳೆಯಾಗುತ್ತಿರುವುದರಿಂದ", "ಶಾಲೆ ಮುಚ್ಚಿರುವುದರಿಂದ", "ಗಣಿತ ಕಲಿಯಲು"],
      Telugu: ["ఎండగా ఉన్నందున", "వర్షం పడుతున్నందున", "బడి మూసి ఉన్నందున", "గణితం చదువుకోవడానికి"],
      Tamil: ["வெப்பமாக இருப்பதால்", "மழை பெய்வதால்", "பள்ளி மூடப்பட்டிருப்பதால்", "கணிதம் படிக்க"]
      },
      correctIndex: 1
    },
    {
      id: "child_l5_6",
      question: {
      English: "Read this diary entry:\n\nMonday: Planted a sunflower seed. Wednesday: Sprout came out. Friday: Two small leaves appeared.\n\nOn which day did the sprout come out?",
      Hindi: "इस डायरी प्रविष्टि को पढ़ें:\n\nसोमवार: सूरजमुखी का बीज बोया। बुधवार: अंकुर बाहर आया। शुक्रवार: दो छोटी पत्तियां दिखाई दीं।\n\nअंकुर किस दिन बाहर आया?",
      Kannada: "ಈ ಡೈರಿ ಬರವಣಿಗೆಯನ್ನು ಓದಿ:\n\nಸೋಮವಾರ: ಸೂರ್ಯಕಾಂತಿ ಬೀಜ ನೆಟ್ಟೆ. ಬುಧವಾರ: ಮೊಳಕೆ ಬಂದಿತು. ಶುಕ್ರವಾರ: ಎರಡು ಸಣ್ಣ ಎಲೆಗಳು ಕಾಣಿಸಿಕೊಂಡವು.\n\nಯಾವ ದಿನ ಮೊಳಕೆ ಬಂದಿತು?",
      Telugu: "ఈ డైరీ రాతను చదవండి:\n\nసోమవారం: పొద్దుతిరుగుడు విత్తనం నాటాను. బుధవారం: మొలక వచ్చింది. శుక్రవారం: రెండు చిన్న ఆకులు కనిపించాయి.\n\nమొలక ఏ రోజున వచ్చింది?",
      Tamil: "இந்த நாட்குறிப்பைப் படிக்கவும்:\n\nதிங்கள்: சூரியகாந்தி விதை நடப்பட்டது. புதன்: முளை வெளிவந்தது. வெள்ளி: இரண்டு சிறிய இலைகள் தோன்றின.\n\nஎந்த நாளில் முளை வெளிவந்தது?"
      },
      options: {
      English: ["Friday", "Wednesday", "Sunday", "Monday"],
      Hindi: ["शुक्रवार", "बुधवार", "रविवार", "सोमवार"],
      Kannada: ["ಶುಕ್ರವಾರ", "ಬುಧವಾರ", "ಭಾನುವಾರ", "ಸೋಮವಾರ"],
      Telugu: ["శుక్రవారం", "బుధవారం", "ఆదివారం", "సోమవారం"],
      Tamil: ["வெள்ளிக்கிழமை", "புதன்கிழமை", "ஞாயிற்றுக்கிழமை", "திங்கட்கிழமை"]
      },
      correctIndex: 1
    },
    {
      id: "child_l5_7",
      question: {
      English: "Read the diary entry again. What plant seed was planted?",
      Hindi: "डायरी प्रविष्टि को दोबारा पढ़ें। किस पौधे का बीज बोया गया था?",
      Kannada: "ಡೈರಿ ಬರವಣಿಗೆಯನ್ನು ಮತ್ತೆ ಓದಿ. ಯಾವ ಸಸ್ಯದ ಬೀಜವನ್ನು ನೆಡಲಾಗಿತ್ತು?",
      Telugu: "డైరీ రాతను మళ్లీ చదవండి. ఏ మొక్క విత్తనం నాటబడింది?",
      Tamil: "நாட்குறிப்பை மீண்டும் படிக்கவும். எந்தத் தாவரத்தின் விதை நடப்பட்டது?"
      },
      options: {
      English: ["Tulip", "Rose", "Mango", "Sunflower"],
      Hindi: ["ट्यूलिप", "गुलाब", "आम", "सूरजमुखी"],
      Kannada: ["ತುಲಿಪ್", "ಗುಲಾಬ", "ಮಾವು", "ಸೂರ್ಯಕಾಂತಿ"],
      Telugu: ["ట్యులిప్", "గులాబీ", "మామిడి", "పొద్దుతిరుగుడు"],
      Tamil: ["துலிப்", "ரோஜா", "மாம்பழம்", "சூரியகாந்தி"]
      },
      correctIndex: 3
    },
    {
      id: "child_l5_8",
      question: {
      English: "Read this library instruction:\n\nPut books back on the shelf after reading. Do not leave books on the table.\n\nWhere should you put books after reading?",
      Hindi: "पुस्तकालय के इस निर्देश को पढ़ें:\n\nपढ़ने के बाद किताबों को वापस शेल्फ पर रखें। किताबों को मेज पर न छोड़ें।\n\nपढ़ने के बाद आपको पुस्तकें कहाँ रखनी चाहिए?",
      Kannada: "ಗ್ರಂಥಾಲಯದ ಈ ಸೂಚನೆಯನ್ನು ಓದಿ:\n\nಓದಿದ ನಂತರ ಪುಸ್ತಕಗಳನ್ನು ಮತ್ತೆ ಶೆಲ್ಫ್‌ನಲ್ಲಿ ಇರಿಸಿ. ಪುಸ್ತಕಗಳನ್ನು ಮೇಜಿನ ಮೇಲೆ ಬಿಡಬೇಡಿ.\n\nಓದಿದ ನಂತರ ಪುಸ್ತಕಗಳನ್ನು ಎಲ್ಲಿ ಇಡಬೇಕು?",
      Telugu: "ఈ లైబ్రరీ సూచనను చదవండి:\n\nచదివిన తర్వాత పుస్తకాలను తిరిగి అరలో పెట్టండి. బల్లపై వదిలివేయవద్దు.\n\nచదివిన తర్వాత పుస్తకాలను ఎక్కడ పెట్టాలి?",
      Tamil: "இந்த நூலக அறிவுறுத்தலைப் படிக்கவும்:\n\nபடித்த பிறகு புத்தகங்களை மீண்டும் அலமாரியில் வைக்கவும். புத்தகங்களை மேஜை மேல் வைக்கக் கூடாது.\n\nபடித்த பிறகு புத்தகங்களை எங்கு வைக்க வேண்டும்?"
      },
      options: {
      English: ["On the table", "On the chair", "On the shelf", "On the floor"],
      Hindi: ["मेज पर", "कुर्सी पर", "शेल्फ पर", "फर्श पर"],
      Kannada: ["ಮೇಜಿನ ಮೇಲೆ", "ಕುರ್ಚಿಯ ಮೇಲೆ", "ಶೆಲ್ಫ್‌ನಲ್ಲಿ", "ನೆಲದ ಮೇಲೆ"],
      Telugu: ["బల్లపై", "కుర్చీపై", "అరలో (షెల్ఫ్ లో)", "నేలపై"],
      Tamil: ["மேஜை மேல்", "நாற்காலியில்", "அலமாரியில்", "தரையில்"]
      },
      correctIndex: 2
    },
    {
      id: "child_l5_9",
      question: {
      English: "Read this classroom poster:\n\nOur class has 12 boys and 14 girls. We have a pet turtle named Shelly.\n\nWhat pet does the class have?",
      Hindi: "इस कक्षा पोस्टर को पढ़ें:\n\nहमारी कक्षा में 12 लड़के और 14 लड़कियां हैं। हमारे पास शेली नाम का एक पालतू कछुआ है।\n\nकक्षा में कौन सा पालतू जानवर है?",
      Kannada: "ಈ ಪೋಸ್ಟರ್ ಓದಿ:\n\nನಮ್ಮ ತರಗತಿಯಲ್ಲಿ 12 ಹುಡುಗರು ಮತ್ತು 14 ಹುಡುಗಿಯರಿದ್ದಾರೆ. ನಮ್ಮ ಬಳಿ ಶೆಲ್ಲಿ ಎಂಬ ಸಾಕು ಆಮೆ ಇದೆ.\n\nತರಗತಿಯಲ್ಲಿ ಯಾವ ಸಾಕು ಪ್ರಾಣಿ ಇದೆ?",
      Telugu: "ఈ క్లాస్ రూమ్ పోస్టర్ చదవండి:\n\nమా క్లాసులో 12 మంది అబ్బాయిలు, 14 మంది అమ్మాయిలు ఉన్నారు. మాకు షెల్లీ అనే పెంపుడు తాబేలు ఉంది.\n\nక్లాసులో ఉన్న పెంపుడు జంతువు ఏది?",
      Tamil: "இந்த வகுப்பறை சுவரொட்டியைப் படிக்கவும்:\n\nஎங்கள் வகுப்பில் 12 சிறுவர்களும் 14 சிறுமிகளும் உள்ளனர். எங்களிடம் ஷெல்லி என்ற செல்லப் பிராணி ஆமை உள்ளது.\n\nவகுப்பில் என்ன செல்லப் பிராணி உள்ளது?"
      },
      options: {
      English: ["Rabbit", "Turtle", "Cat", "Dog"],
      Hindi: ["खरगोश", "कछुआ (Turtle)", "बिल्ली", "कुत्ता"],
      Kannada: ["ಮೊಲ", "ಆಮೆ (Turtle)", "ಬೆಕ್ಕು", "ನಾಯಿ"],
      Telugu: ["కుందేలు", "తాబేలు (Turtle)", "పిల్లి", "కుక్క"],
      Tamil: ["முயல்", "ஆமை (Turtle)", "பூனை", "நாய்"]
      },
      correctIndex: 1
    },
    {
      id: "child_l5_10",
      question: {
      English: "Read the classroom poster again. How many boys are in the class?",
      Hindi: "कक्षा पोस्टर को दोबारा पढ़ें। कक्षा में कितने लड़के हैं?",
      Kannada: "ಪೋಸ್ಟರ್ ಅನ್ನು ಮತ್ತೆ ಓದಿ. ತರಗತಿಯಲ್ಲಿ ಎಷ್ಟು ಹುಡುಗರಿದ್ದಾರೆ?",
      Telugu: "పోస్టర్ ను మళ్లీ చదవండి. క్లాసులో ఎంతమంది అబ్బాయిలు ఉన్నారు?",
      Tamil: "சுவரொட்டியை மீண்டும் படிக்கவும். வகுப்பில் எத்தனை சிறுவர்கள் உள்ளனர்?"
      },
      options: {
      English: ["14", "26", "10", "12"],
      Hindi: ["14", "26", "10", "12"],
      Kannada: ["14", "26", "10", "12"],
      Telugu: ["14", "26", "10", "12"],
      Tamil: ["14", "26", "10", "12"]
      },
      correctIndex: 3
    }
    ]
  },
  teen_level_1: {
    title: {
    English: "Level 1 Assessment (TEEN)",
    Hindi: "स्तर 1 आकलन (किशोर)",
    Kannada: "ಹಂತ 1 ಮೌಲ್ಯಮಾಪನ (ಕಿಶೋರರು)",
    Telugu: "స్థాయి 1 అంచనా (టీనేజర్స్)",
    Tamil: "நிலை 1 மதிப்பீடு (பதின்ம வயதினர்)"
    },
    description: {
    English: "Test checking capability at Level 1 for teen learners.",
    Hindi: "किशोर शिक्षार्थियों के लिए स्तर 1 क्षमता का परीक्षण।",
    Kannada: "ಕಲಿಯುವವರಿಗೆ ಹಂತ 1 ಸಾಮರ್ಥ್ಯವನ್ನು ಪರಿಶೀಲಿಸುವ ಪರೀಕ್ಷೆ.",
    Telugu: "అభ్యాసకుల కోసం స్థాయి 1 సామర్థ్య పరీక్ష.",
    Tamil: "கற்பவர்களுக்கான நிலை 1 திறனைச் சோதிக்கும் மதிப்பீடு."
    },
    questions: [
    {
      id: "teen_l1_1",
      question: {
      English: "Which letter matches the shape of capital 'B'?",
      Hindi: "कौन सा अक्षर बड़े अक्षर 'B' के आकार से मेल खाता है?",
      Kannada: "ಯಾವ ಅಕ್ಷರವು ದೊಡ್ಡ ಅಕ್ಷರ 'B' ನ ಆಕಾರಕ್ಕೆ ಹೊಂದಿಕೆಯಾಗುತ್ತದೆ?",
      Telugu: "ఏ అక్షరం క్యాపిటల్ 'B' ఆకారంతో సరిపోలుతుంది?",
      Tamil: "எந்த எழுத்து பெரிய எழுத்து 'B'-இன் வடிவத்துடன் ஒத்துப்போகிறது?"
      },
      options: {
      English: ["D", "P", "R", "B"],
      Hindi: ["D", "P", "R", "B"],
      Kannada: ["D", "P", "R", "B"],
      Telugu: ["D", "P", "R", "B"],
      Tamil: ["D", "P", "R", "B"]
      },
      correctIndex: 3
    },
    {
      id: "teen_l1_2",
      question: {
      English: "Identify the lowercase shape for the letter 'g'.",
      Hindi: "अक्षर 'g' के लिए छोटा आकार पहचानें।",
      Kannada: "'g' ಅಕ್ಷರದ ಸಣ್ಣ ರೂಪವನ್ನು ಗುರುತಿಸಿ.",
      Telugu: "'g' అక్షరానికి చిన్న రూపం గుర్తించండి.",
      Tamil: "'g' என்ற எழுத்தின் சிறிய வடிவத்தை அடையாளம் காணவும்."
      },
      options: {
      English: ["q", "y", "p", "g"],
      Hindi: ["q", "y", "p", "g"],
      Kannada: ["q", "y", "p", "g"],
      Telugu: ["q", "y", "p", "g"],
      Tamil: ["q", "y", "p", "g"]
      },
      correctIndex: 3
    },
    {
      id: "teen_l1_3",
      question: {
      English: "Find the capital letter 'E'.",
      Hindi: "बड़ा अक्षर 'E' खोजें।",
      Kannada: "ದೊಡ್ಡ ಅಕ್ಷರ 'E' ಅನ್ನು ಹುಡುಕಿ.",
      Telugu: "క్యాపిటల్ అక్షరం 'E'ని కనుగొనండి.",
      Tamil: "பெரிய எழுத்து 'E'-ஐக் கண்டறியவும்."
      },
      options: {
      English: ["E", "T", "L", "F"],
      Hindi: ["E", "T", "L", "F"],
      Kannada: ["E", "T", "L", "F"],
      Telugu: ["E", "T", "L", "F"],
      Tamil: ["E", "T", "L", "F"]
      },
      correctIndex: 0
    },
    {
      id: "teen_l1_4",
      question: {
      English: "Which letter is different?",
      Hindi: "कौन सा अक्षर अलग है?",
      Kannada: "ಯಾವ ಅಕ್ಷರ ಭಿನ್ನವಾಗಿದೆ?",
      Telugu: "ఏ అక్షరం భిన్నంగా ఉంది?",
      Tamil: "வேறுபட்ட எழுத்து எது?"
      },
      options: {
      English: ["X", "Y", "Y", "Y"],
      Hindi: ["X", "Y", "Y", "Y"],
      Kannada: ["X", "Y", "Y", "Y"],
      Telugu: ["X", "Y", "Y", "Y"],
      Tamil: ["X", "Y", "Y", "Y"]
      },
      correctIndex: 0
    },
    {
      id: "teen_l1_5",
      question: {
      English: "Identify the letter 'R'.",
      Hindi: "अक्षर 'R' पहचानें।",
      Kannada: "'R' ಅಕ್ಷರವನ್ನು ಗುರುತಿಸಿ.",
      Telugu: "'R' అక్షరాన్ని గుర్తించండి.",
      Tamil: "'R' என்ற எழுத்தை அடையாளம் காணவும்."
      },
      options: {
      English: ["K", "R", "B", "P"],
      Hindi: ["K", "R", "B", "P"],
      Kannada: ["K", "R", "B", "P"],
      Telugu: ["K", "R", "B", "P"],
      Tamil: ["K", "R", "B", "P"]
      },
      correctIndex: 1
    },
    {
      id: "teen_l1_6",
      question: {
      English: "Complete the sequence: K, L, M, __",
      Hindi: "क्रम पूरा करें: K, L, M, __",
      Kannada: "ಅನುಕ್ರಮವನ್ನು ಪೂರ್ಣಗೊಳಿಸಿ: K, L, M, __",
      Telugu: "క్రమాన్ని పూర్తి చేయండి: K, L, M, __",
      Tamil: "வரிசையை நிரப்புக: K, L, M, __"
      },
      options: {
      English: ["N", "Q", "O", "P"],
      Hindi: ["N", "Q", "O", "P"],
      Kannada: ["N", "Q", "O", "P"],
      Telugu: ["N", "Q", "O", "P"],
      Tamil: ["N", "Q", "O", "P"]
      },
      correctIndex: 0
    },
    {
      id: "teen_l1_7",
      question: {
      English: "Identify lowercase shape matching 'h'.",
      Hindi: "'h' से मेल खाने वाला छोटा आकार पहचानें।",
      Kannada: "'h' ಗೆ ಹೊಂದಿಕೆಯಾಗುವ ಸಣ್ಣ ಅಕ್ಷರವನ್ನು ಗುರುತಿಸಿ.",
      Telugu: "'h' కి సరిపోయే చిన్న ఆకారాన్ని గుర్తించండి.",
      Tamil: "'h' என்ற எழுத்துக்குரிய சிறிய வடிவத்தைக் கண்டறியவும்."
      },
      options: {
      English: ["h", "n", "u", "r"],
      Hindi: ["h", "n", "u", "r"],
      Kannada: ["h", "n", "u", "r"],
      Telugu: ["h", "n", "u", "r"],
      Tamil: ["h", "n", "u", "r"]
      },
      correctIndex: 0
    },
    {
      id: "teen_l1_8",
      question: {
      English: "Find the matching capital letter for 'd'.",
      Hindi: "'d' के लिए मेल खाता बड़ा अक्षर खोजें।",
      Kannada: "'d' ಗೆ ಹೊಂದಿಕೆಯಾಗುವ ದೊಡ್ಡ ಅಕ್ಷರವನ್ನು ಹುಡುಕಿ.",
      Telugu: "'d' కి సరిపోయే క్యాపిటల్ అక్షరాన్ని కనుగొనండి.",
      Tamil: "'d' என்ற எழுத்துக்குரிய பெரிய எழுத்தைக் கண்டறியவும்."
      },
      options: {
      English: ["B", "P", "Q", "D"],
      Hindi: ["B", "P", "Q", "D"],
      Kannada: ["B", "P", "Q", "D"],
      Telugu: ["B", "P", "Q", "D"],
      Tamil: ["B", "P", "Q", "D"]
      },
      correctIndex: 3
    },
    {
      id: "teen_l1_9",
      question: {
      English: "Which letter has a circular curve?",
      Hindi: "किस अक्षर में वृत्ताकार वक्र है?",
      Kannada: "ಯಾವ ಅಕ್ಷರವು ವೃತ್ತಾಕಾರದ ತಿರುವನ್ನು ಹೊಂದಿದೆ?",
      Telugu: "ఏ అక్షరంలో గుండ్రటి వంపు ఉంటుంది?",
      Tamil: "வட்ட வடிவம் கொண்ட எழுத்து எது?"
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
      id: "teen_l1_10",
      question: {
      English: "Find the capital letter 'Z'.",
      Hindi: "बड़ा अक्षर 'Z' खोजें।",
      Kannada: "ದೊಡ್ಡ ಅಕ್ಷರ 'Z' ಅನ್ನು ಹುಡುಕಿ.",
      Telugu: "క్యాపిటల్ అక్షరం 'Z'ని కనుగొనండి.",
      Tamil: "பெரிய எழுத்து 'Z'-ஐக் கண்டறியவும்."
      },
      options: {
      English: ["W", "Z", "M", "N"],
      Hindi: ["W", "Z", "M", "N"],
      Kannada: ["W", "Z", "M", "N"],
      Telugu: ["W", "Z", "M", "N"],
      Tamil: ["W", "Z", "M", "N"]
      },
      correctIndex: 1
    }
    ]
  },
  teen_level_2: {
    title: {
    English: "Level 2 Assessment (TEEN)",
    Hindi: "स्तर 2 आकलन (किशोर)",
    Kannada: "ಹಂತ 2 ಮೌಲ್ಯಮಾಪನ (ಕಿಶೋರರು)",
    Telugu: "స్థాయి 2 అంచనా (టీనేజర్స్)",
    Tamil: "நிலை 2 மதிப்பீடு (பதின்ம வயதினர்)"
    },
    description: {
    English: "Test checking capability at Level 2 for teen learners.",
    Hindi: "किशोर शिक्षार्थियों के लिए स्तर 2 क्षमता का परीक्षण।",
    Kannada: "ಕಲಿಯುವವರಿಗೆ ಹಂತ 2 ಸಾಮರ್ಥ್ಯವನ್ನು ಪರಿಶೀಲಿಸುವ ಪರೀಕ್ಷೆ.",
    Telugu: "అభ్యాసకుల కోసం స్థాయి 2 సామర్థ్య పరీక్ష.",
    Tamil: "கற்பவர்களுக்கான நிலை 2 திறனைச் சோதிக்கும் மதிப்பீடு."
    },
    questions: [
    {
      id: "teen_l2_1",
      question: {
      English: "Which letter starts the sound of the word 'Game'?",
      Hindi: "कौन सा अक्षर 'Game' (खेल) शब्द की ध्वनि शुरू करता है?",
      Kannada: "ಯಾವ ಅಕ್ಷರವು 'Game' ಪದದ ಧ್ವನಿಯನ್ನು ಪ್ರಾರಂಭಿಸುತ್ತದೆ?",
      Telugu: "'Game' పదం ఏ అక్షరంతో ప్రారంభమవుతుంది?",
      Tamil: "'Game' என்ற வார்த்தையின் தொடக்க ஒலியை எந்த எழுத்து உருவாக்குகிறது?"
      },
      options: {
      English: ["J", "K", "Y", "G"],
      Hindi: ["J", "K", "Y", "G"],
      Kannada: ["J", "K", "Y", "G"],
      Telugu: ["J", "K", "Y", "G"],
      Tamil: ["J", "K", "Y", "G"]
      },
      correctIndex: 3
    },
    {
      id: "teen_l2_2",
      question: {
      English: "Identify the missing letter in 'Pl_y'.",
      Hindi: "शब्द में छूटा हुआ अक्षर पहचानें: 'Pl_y'।",
      Kannada: "ಪದದಲ್ಲಿ ಬಿಟ್ಟುಹೋದ ಅಕ್ಷರವನ್ನು ಗುರುತಿಸಿ: 'Pl_y'.",
      Telugu: "పదంలో లేని అక్షరాన్ని గుర్తించండి: 'Pl_y'.",
      Tamil: "வார்த்தையில் விடுபட்ட எழுத்தைக் கண்டறியவும்: 'Pl_y'."
      },
      options: {
      English: ["u", "o", "a", "e"],
      Hindi: ["u", "o", "a", "e"],
      Kannada: ["u", "o", "a", "e"],
      Telugu: ["u", "o", "a", "e"],
      Tamil: ["u", "o", "a", "e"]
      },
      correctIndex: 2
    },
    {
      id: "teen_l2_3",
      question: {
      English: "Which word rhymes with 'Ball'?",
      Hindi: "कौन सा शब्द 'Ball' (गेंद) के साथ तुकबंदी करता है?",
      Kannada: "ಯಾವ ಪದವು 'Ball' ನೊಂದಿಗೆ ಪ್ರಾಸಬದ್ಧವಾಗಿದೆ?",
      Telugu: "'Ball' తో ప్రాస కలిసే పదం ఏది?",
      Tamil: "'Ball' என்ற ஒலியுடன் ஒத்துப்போகும் வார்த்தை எது?"
      },
      options: {
      English: ["Bell", "Bull", "Tall", "Bill"],
      Hindi: ["Bell (घंटी)", "Bull (सांड)", "Tall (लंबा)", "Bill (बिल)"],
      Kannada: ["Bell (ಗಂಟೆ)", "Bull (ಗೂಳಿ)", "Tall (ಎತ್ತರ)", "Bill (ಬಿಲ್ಲು)"],
      Telugu: ["Bell (గంట)", "Bull (ఎద్దు)", "Tall (పొడవు)", "Bill (బిల్లు)"],
      Tamil: ["Bell (மணி)", "Bull (காளை)", "Tall (உயரமான)", "Bill (கட்டணம்)"]
      },
      correctIndex: 2
    },
    {
      id: "teen_l2_4",
      question: {
      English: "What starting sound does 'Sports' make?",
      Hindi: "'Sports' शब्द की शुरुआती ध्वनि क्या है?",
      Kannada: "'Sports' ಪದದ ಆರಂಭಿಕ ಧ್ವನಿ ಯಾವುದು?",
      Telugu: "'Sports' పదం ఏ ధ్వనితో ప్రారంభమవుతుంది?",
      Tamil: "'Sports' என்ற வார்த்தையின் தொடக்க ஒலி என்ன?"
      },
      options: {
      English: ["S", "P", "R", "T"],
      Hindi: ["S", "P", "R", "T"],
      Kannada: ["S", "P", "R", "T"],
      Telugu: ["S", "P", "R", "T"],
      Tamil: ["S", "P", "R", "T"]
      },
      correctIndex: 0
    },
    {
      id: "teen_l2_5",
      question: {
      English: "Identify the missing vowel: 'Fr_nd'.",
      Hindi: "छूटा हुआ स्वर पहचानें: 'Fr_nd' (मित्र)।",
      Kannada: "ಬಿಟ್ಟುಹೋದ ಸ್ವರವನ್ನು ಗುರುತಿಸಿ: 'Fr_nd'.",
      Telugu: "లేని అచ్చును గుర్తించండి: 'Fr_nd'.",
      Tamil: "விடுபட்ட உயிர் எழுத்தைக் கண்டறியவும்: 'Fr_nd'."
      },
      options: {
      English: ["u", "i", "o", "a"],
      Hindi: ["u", "i", "o", "a"],
      Kannada: ["u", "i", "o", "a"],
      Telugu: ["u", "i", "o", "a"],
      Tamil: ["u", "i", "o", "a"]
      },
      correctIndex: 1
    },
    {
      id: "teen_l2_6",
      question: {
      English: "Which word ends with the 'k' sound?",
      Hindi: "कौन सा शब्द 'k' की ध्वनि पर समाप्त होता है?",
      Kannada: "ಯಾವ ಪದವು 'k' ಧ್ವನಿಯೊಂದಿಗೆ ಕೊನೆಗೊಳ್ಳುತ್ತದೆ?",
      Telugu: "ఏ పదం 'k' శబ్దంతో ముగుస్తుంది?",
      Tamil: "எந்த வார்த்தை 'k' ஒலியில் முடிகிறது?"
      },
      options: {
      English: ["Boy", "Bag", "Book", "Bat"],
      Hindi: ["Boy (लड़का)", "Bag (बस्ता)", "Book (किताब)", "Bat (बल्ला)"],
      Kannada: ["Boy (ಬಾಲಕ)", "Bag (ಚೀಲ)", "Book (ಪುಸ್ತಕ)", "Bat (ಬ್ಯಾಟ್)"],
      Telugu: ["Boy (బాలుడు)", "Bag (సంచీ)", "Book (పుస్తకం)", "Bat (బ్యాట్)"],
      Tamil: ["Boy (சிறுவன்)", "Bag (பைய்)", "Book (புத்தகம்)", "Bat (மட்டை)"]
      },
      correctIndex: 2
    },
    {
      id: "teen_l2_7",
      question: {
      English: "Find the word with the long 'ee' sound.",
      Hindi: "लंबी 'ee' ध्वनि वाला शब्द खोजें।",
      Kannada: "ದೀರ್ಘ 'ee' ಧ್ವನಿ ಇರುವ ಪದವನ್ನು ಹುಡುಕಿ.",
      Telugu: "దీర్ఘ 'ee' శబ్దం ఉన్న పదాన్ని కనుగొనండి.",
      Tamil: "நெடில் 'ee' ஒலி கொண்ட வார்த்தையைக் கண்டறியவும்."
      },
      options: {
      English: ["Great", "Get", "Green", "Grip"],
      Hindi: ["Great (महान)", "Get (पाना)", "Green (हरा)", "Grip (पकड़)"],
      Kannada: ["Great (ದೊಡ್ಡ)", "Get (ಪಡೆಯಿರಿ)", "Green (ಹಸಿರು)", "Grip (ಹಿಡಿತ)"],
      Telugu: ["Great (గొప్ప)", "Get (పొందడం)", "Green (ఆకుపచ్చ)", "Grip (పట్టు)"],
      Tamil: ["Great (சிறந்த)", "Get (பெறு)", "Green (பச்சை)", "Grip (பிடி)"]
      },
      correctIndex: 2
    },
    {
      id: "teen_l2_8",
      question: {
      English: "Which word starts with the sound of 'Ch'?",
      Hindi: "कौन सा शब्द 'Ch' की ध्वनि से शुरू होता है?",
      Kannada: "ಯಾವ ಪದವು 'Ch' ಧ್ವನಿಯಿಂದ ಪ್ರಾರಂಭವಾಗುತ್ತದೆ?",
      Telugu: "ఏ పదం 'Ch' శబ్దంతో ప్రారంభమవుతుంది?",
      Tamil: "எந்த வார்த்தை 'Ch' ஒலியில் தொடங்குகிறது?"
      },
      options: {
      English: ["Cow", "Car", "Cat", "Chair"],
      Hindi: ["Cow (गाय)", "Car (गाड़ी)", "Cat (बिल्ली)", "Chair (कुर्सी)"],
      Kannada: ["Cow (ಹಸು)", "Car (ಕಾರು)", "Cat (ಬೆಕ್ಕು)", "Chair (ಕುರ್ಚಿ)"],
      Telugu: ["Cow (ఆవు)", "Car (కారు)", "Cat (పిల్లి)", "Chair (కుర్చీ)"],
      Tamil: ["Cow (பசு)", "Car (கார்)", "Cat (பூனை)", "Chair (நாற்காலி)"]
      },
      correctIndex: 3
    },
    {
      id: "teen_l2_9",
      question: {
      English: "Identify the missing letter: 'L_brary'.",
      Hindi: "छूटा हुआ अक्षर पहचानें: 'L_brary' (पुस्तकालय)।",
      Kannada: "ಬಿಟ್ಟುಹೋದ ಅಕ್ಷರವನ್ನು ಗುರುತಿಸಿ: 'L_brary'.",
      Telugu: "లేని అక్షరాన్ని గుర్తించండి: 'L_brary'.",
      Tamil: "விடுபட்ட எழுத்தைக் கண்டறியவும்: 'L_brary'."
      },
      options: {
      English: ["i", "a", "e", "o"],
      Hindi: ["i", "a", "e", "o"],
      Kannada: ["i", "a", "e", "o"],
      Telugu: ["i", "a", "e", "o"],
      Tamil: ["i", "a", "e", "o"]
      },
      correctIndex: 0
    },
    {
      id: "teen_l2_10",
      question: {
      English: "Which word rhymes with 'School'?",
      Hindi: "कौन सा शब्द 'School' के साथ तुकबंदी करता है?",
      Kannada: "ಯಾವ ಪದವು 'School' ನೊಂದಿಗೆ ಪ್ರಾಸಬದ್ಧವಾಗಿದೆ?",
      Telugu: "'School' తో ప్రాస కలిసే పదం ఏది?",
      Tamil: "'School' என்ற ஒலியுடன் ஒத்துப்போகும் வார்த்தை எது?"
      },
      options: {
      English: ["Call", "Cool", "Coal", "Cold"],
      Hindi: ["Call (बुलाना)", "Cool (ठंडा)", "Coal (कोयला)", "Cold (सर्दी)"],
      Kannada: ["Call (ಕರೆ)", "Cool (ತಂಪಾದ)", "Coal (ಕಲ್ಲಿದ್ದಲು)", "Cold (ಶೀತ)"],
      Telugu: ["Call (పిలవడం)", "Cool (చల్లని)", "Coal (బొగ్గు)", "Cold (చలి)"],
      Tamil: ["Call (அழைப்பு)", "Cool (குளுமையான)", "Coal (நிலக்கரி)", "Cold (குளிர்)"]
      },
      correctIndex: 1
    }
    ]
  },
  teen_level_3: {
    title: {
    English: "Level 3 Assessment (TEEN)",
    Hindi: "स्तर 3 आकलन (किशोर)",
    Kannada: "ಹಂತ 3 ಮೌಲ್ಯಮಾಪನ (ಕಿಶೋರರು)",
    Telugu: "స్థాయి 3 అంచనా (టీనేజర్స్)",
    Tamil: "நிலை 3 மதிப்பீடு (பதின்ம வயதினர்)"
    },
    description: {
    English: "Test checking capability at Level 3 for teen learners.",
    Hindi: "किशोर शिक्षार्थियों के लिए स्तर 3 क्षमता का परीक्षण।",
    Kannada: "ಕಲಿಯುವವರಿಗೆ ಹಂತ 3 ಸಾಮರ್ಥ್ಯವನ್ನು ಪರಿಶೀಲಿಸುವ ಪರೀಕ್ಷೆ.",
    Telugu: "అభ్యాసకుల కోసం స్థాయి 3 సామర్థ్య పరీక్ష.",
    Tamil: "கற்பவர்களுக்கான நிலை 3 திறனைச் சோதிக்கும் மதிப்பீடு."
    },
    questions: [
    {
      id: "teen_l3_1",
      question: {
      English: "Choose the correct spelling of this stationery item:",
      Hindi: "इस स्टेशनरी वस्तु की सही वर्तनी (spelling) चुनें:",
      Kannada: "ಈ ಲೇಖನ ಸಾಮಗ್ರಿಯ ಸರಿಯಾದ ಕಾಗುಣಿತವನ್ನು ಆರಿಸಿ:",
      Telugu: "ఈ స్టేషనరీ వస్తువు యొక్క సరైన స్పెల్లింగ్‌ను ఎంచుకోండి:",
      Tamil: "இந்த எழுதுபொருளின் சரியான எழுத்துப்பிழையைத் தேர்ந்தெடுக்கவும்:"
      },
      options: {
      English: ["Eracer", "Erasur", "Erasir", "Eraser"],
      Hindi: ["Eracer", "Erasur", "Erasir", "Eraser"],
      Kannada: ["Eracer", "Erasur", "Erasir", "Eraser"],
      Telugu: ["Eracer", "Erasur", "Erasir", "Eraser"],
      Tamil: ["Eracer", "Erasur", "Erasir", "Eraser"]
      },
      correctIndex: 3
    },
    {
      id: "teen_l3_2",
      question: {
      English: "Find the spelling of the place where students borrow books:",
      Hindi: "छात्रों द्वारा किताबें उधार लेने के स्थान की वर्तनी खोजें:",
      Kannada: "ವಿದ್ಯಾರ್ಥಿಗಳು ಪುಸ್ತಕಗಳನ್ನು ಎರವಲು ಪಡೆಯುವ ಸ್ಥಳದ ಕಾಗುಣಿತವನ್ನು ಹುಡುಕಿ:",
      Telugu: "విద్యార్థులు పుస్తకాలు తీసుకునే స్థలం యొక్క సరైన స్పెల్లింగ్ కనుగొనండి:",
      Tamil: "மாணவர்கள் புத்தகம் இரவல் வாங்கும் இடத்தின் சரியான எழுத்துப்பிழையைக் கண்டறியவும்:"
      },
      options: {
      English: ["Librery", "Librari", "Library", "Libray"],
      Hindi: ["Librery", "Librari", "Library", "Libray"],
      Kannada: ["Librery", "Librari", "Library", "Libray"],
      Telugu: ["Librery", "Librari", "Library", "Libray"],
      Tamil: ["Librery", "Librari", "Library", "Libray"]
      },
      correctIndex: 2
    },
    {
      id: "teen_l3_3",
      question: {
      English: "Identify the word for this subject:",
      Hindi: "इस विषय के शब्द को पहचानें (विज्ञान):",
      Kannada: "ಈ ವಿಷಯದ ಪದವನ್ನು ಗುರುತಿಸಿ (ವಿಜ್ಞಾನ):",
      Telugu: "ఈ సబ్జెక్ట్ యొక్క పదాన్ని గుర్తించండి (సైన్స్/విజ్ఞానశాస్త్రం):",
      Tamil: "இந்தப் பாடத்திற்கான வார்த்தையை அடையாளம் காணவும் (அறிவியல்):"
      },
      options: {
      English: ["Sience", "Scence", "Science", "Sciense"],
      Hindi: ["Sience", "Scence", "Science", "Sciense"],
      Kannada: ["Sience", "Scence", "Science", "Sciense"],
      Telugu: ["Sience", "Scence", "Science", "Sciense"],
      Tamil: ["Sience", "Scence", "Science", "Sciense"]
      },
      correctIndex: 2
    },
    {
      id: "teen_l3_4",
      question: {
      English: "Find the correct spelling of the game played with a bat and ball:",
      Hindi: "बल्ले और गेंद से खेले जाने वाले खेल की सही वर्तनी खोजें:",
      Kannada: "ಬ್ಯಾಟ್ ಮತ್ತು ಚೆಂಡಿನಿಂದ ಆಡುವ ಆಟದ ಸರಿಯಾದ ಕಾಗುಣಿತವನ್ನು ಹುಡುಕಿ:",
      Telugu: "బ్యాట్ మరియు బంతితో ఆడే ఆట యొక్క సరైన స్పెల్లింగ్ కనుగొనండి:",
      Tamil: "மட்டை மற்றும் பந்தால் விளையாடப்படும் விளையாட்டின் சரியான எழுத்துப்பிழையைக் கண்டறியவும்:"
      },
      options: {
      English: ["Crickut", "Cricket", "Crickit", "Criket"],
      Hindi: ["Crickut", "Cricket", "Crickit", "Criket"],
      Kannada: ["Crickut", "Cricket", "Crickit", "Criket"],
      Telugu: ["Crickut", "Cricket", "Crickit", "Criket"],
      Tamil: ["Crickut", "Cricket", "Crickit", "Criket"]
      },
      correctIndex: 1
    },
    {
      id: "teen_l3_5",
      question: {
      English: "Select the correct spelling of a close companion:",
      Hindi: "एक करीबी साथी की सही वर्तनी चुनें (मित्र):",
      Kannada: "ಆಪ್ತ ಸ್ನೇಹಿತನ ಸರಿಯಾದ ಕಾಗುಣಿತವನ್ನು ಆರಿಸಿ:",
      Telugu: "ఆప్త మిత్రుడు యొక్క సరైన స్పెల్లింగ్‌ను ఎంచుకోండి:",
      Tamil: "நெருங்கிய நண்பனின் சரியான எழுத்துப்பிழையைத் தேர்ந்தெடுக்கவும்:"
      },
      options: {
      English: ["Frend", "Friend", "Freind", "Frind"],
      Hindi: ["Frend", "Friend", "Freind", "Frind"],
      Kannada: ["Frend", "Friend", "Freind", "Frind"],
      Telugu: ["Frend", "Friend", "Freind", "Frind"],
      Tamil: ["Frend", "Friend", "Freind", "Frind"]
      },
      correctIndex: 1
    },
    {
      id: "teen_l3_6",
      question: {
      English: "What is the opposite word for 'Start'?",
      Hindi: "'Start' (शुरू) का विपरीत शब्द क्या है?",
      Kannada: "'Start' ಪದದ ವಿರುದ್ಧ ಪದ ಯಾವುದು?",
      Telugu: "'Start' అనే పదానికి వ్యతిరేక పదం ఏది?",
      Tamil: "'Start' என்ற வார்த்தையின் எதிர்ச்சொல் எது?"
      },
      options: {
      English: ["Open", "Go", "Begin", "Finish"],
      Hindi: ["Open (खोलें)", "Go (जाएं)", "Begin (शुरू)", "Finish (समाप्त)"],
      Kannada: ["Open (ತೆರೆಯಿರಿ)", "Go (ಹೋಗು)", "Begin (ಪ್ರಾರಂಭ)", "Finish (ಮುಕ್ತಾಯ)"],
      Telugu: ["Open (తెరవడం)", "Go (వెళ్లడం)", "Begin (మొదలు పెట్టడం)", "Finish (ముగించడం)"],
      Tamil: ["Open (திற)", "Go (செல்)", "Begin (தொடக்கம்)", "Finish (முடிவு)"]
      },
      correctIndex: 3
    },
    {
      id: "teen_l3_7",
      question: {
      English: "Find the correct spelling of the place where we study:",
      Hindi: "हम जहां पढ़ते हैं उस स्थान की सही वर्तनी खोजें:",
      Kannada: "ನಾವು ಕಲಿಯುವ ಸ್ಥಳದ ಸರಿಯಾದ ಕಾಗುಣಿತವನ್ನು ಹುಡುಕಿ:",
      Telugu: "మనం చదువుకునే స్థలం యొక్క సరైన స్పెల్లింగ్ కనుగొనండి:",
      Tamil: "நாம் படிக்கும் இடத்தின் சரியான எழுத்துப்பிழையைக் கண்டறியவும்:"
      },
      options: {
      English: ["Scol", "Schoole", "Shool", "School"],
      Hindi: ["Scol", "Schoole", "Shool", "School"],
      Kannada: ["Scol", "Schoole", "Shool", "School"],
      Telugu: ["Scol", "Schoole", "Shool", "School"],
      Tamil: ["Scol", "Schoole", "Shool", "School"]
      },
      correctIndex: 3
    },
    {
      id: "teen_l3_8",
      question: {
      English: "Which word describes the action of going quickly on foot?",
      Hindi: "कौन सा शब्द पैरों पर तेजी से जाने की क्रिया को दर्शाता है?",
      Kannada: "ಯಾವ ಪದವು ವೇಗವಾಗಿ ಕಾಲಿನಿಂದ ಹೋಗುವ ಕ್ರಿಯೆಯನ್ನು ವಿವರಿಸುತ್ತದೆ?",
      Telugu: "ఏ పదం వేగంగా పరుగెత్తే క్రియను సూచిస్తుంది?",
      Tamil: "வேகமாக ஓடும் செயலைக் குறிக்கும் வார்த்தை எது?"
      },
      options: {
      English: ["Walk", "Sit", "Sleep", "Run"],
      Hindi: ["Walk (चलना)", "Sit (बैठना)", "Sleep (सोना)", "Run (दौड़ना)"],
      Kannada: ["Walk (ನಡೆ)", "Sit (ಕುಳಿತುಕೊ)", "Sleep (ಮಲಗು)", "Run (ಓಡು)"],
      Telugu: ["Walk (నడవడం)", "Sit (కూర్చోవడం)", "Sleep (పడుకోవడం)", "Run (పరుగెత్తడం)"],
      Tamil: ["Walk (நடத்தல்)", "Sit (அமர்தல்)", "Sleep (தூங்குதல்)", "Run (ஓடுதல்)"]
      },
      correctIndex: 3
    },
    {
      id: "teen_l3_9",
      question: {
      English: "Find the spelling of the fifth month of the year:",
      Hindi: "वर्ष के पांचवें महीने की वर्तनी खोजें:",
      Kannada: "ವರ್ಷದ ಐದನೇ ತಿಂಗಳ ಕಾಗುಣಿತವನ್ನು ಹುಡುಕಿ:",
      Telugu: "సంవత్సరంలో ఐదవ నెల స్పెల్లింగ్ కనుగొనండి:",
      Tamil: "வருடத்தின் ஐந்தாவது மாதத்தின் எழுத்துப்பிழையைக் கண்டறியவும்:"
      },
      options: {
      English: ["May", "Mey", "Mai", "Mae"],
      Hindi: ["May", "Mey", "Mai", "Mae"],
      Kannada: ["May", "Mey", "Mai", "Mae"],
      Telugu: ["May", "Mey", "Mai", "Mae"],
      Tamil: ["May", "Mey", "Mai", "Mae"]
      },
      correctIndex: 0
    },
    {
      id: "teen_l3_10",
      question: {
      English: "Choose the correct spelling of the device we use to call people:",
      Hindi: "लोगों को कॉल करने के लिए इस्तेमाल किए जाने वाले उपकरण की सही वर्तनी चुनें:",
      Kannada: "ಜನರಿಗೆ ಕರೆ ಮಾಡಲು ನಾವು ಬಳಸುವ ಸಾಧನದ ಸರಿಯಾದ ಕಾಗುಣಿತವನ್ನು ಆರಿಸಿ:",
      Telugu: "ప్రజలకు కాల్ చేయడానికి మనం ఉపయోగించే పరికరం యొక్క సరైన స్పెల్లింగ్‌ను ఎంచుకోండి:",
      Tamil: "மக்களுக்கு அழைக்கப் பயன்படும் சாதனத்தின் சரியான எழுத்துப்பிழையைத் தேர்ந்தெடுக்கவும்:"
      },
      options: {
      English: ["Mobile Phon", "Mobile Phone", "Mobile Fone", "Mobil Phone"],
      Hindi: ["Mobile Phon", "Mobile Phone", "Mobile Fone", "Mobil Phone"],
      Kannada: ["Mobile Phon", "Mobile Phone", "Mobile Fone", "Mobil Phone"],
      Telugu: ["Mobile Phon", "Mobile Phone", "Mobile Fone", "Mobil Phone"],
      Tamil: ["Mobile Phon", "Mobile Phone", "Mobile Fone", "Mobil Phone"]
      },
      correctIndex: 1
    }
    ]
  },
  teen_level_4: {
    title: {
    English: "Level 4 Assessment (TEEN)",
    Hindi: "स्तर 4 आकलन (किशोर)",
    Kannada: "ಹಂತ 4 ಮೌಲ್ಯಮಾಪನ (ಕಿಶೋರರು)",
    Telugu: "స్థాయి 4 అంచనా (టీనేజర్స్)",
    Tamil: "நிலை 4 மதிப்பீடு (பதின்ம வயதினர்)"
    },
    description: {
    English: "Test checking capability at Level 4 for teen learners.",
    Hindi: "किशोर शिक्षार्थियों के लिए स्तर 4 क्षमता का परीक्षण।",
    Kannada: "ಕಲಿಯುವವರಿಗೆ ಹಂತ 4 ಸಾಮರ್ಥ್ಯವನ್ನು ಪರಿಶೀಲಿಸುವ ಪರೀಕ್ಷೆ.",
    Telugu: "అభ్యాసకుల కోసం స్థాయి 4 సామర్థ్య పరీక్ష.",
    Tamil: "கற்பவர்களுக்கான நிலை 4 திறனைச் சோதிக்கும் மதிப்பீடு."
    },
    questions: [
    {
      id: "teen_l4_1",
      question: {
      English: "Complete: 'I borrow books from the ______.'",
      Hindi: "पूरा करें: 'I borrow books from the ______.'",
      Kannada: "ಪೂರ್ಣಗೊಳಿಸಿ: 'I borrow books from the ______.'",
      Telugu: "పూర్తి చేయండి: 'I borrow books from the ______.'",
      Tamil: "வாக்கியத்தை நிரப்புக: 'I borrow books from the ______.'"
      },
      options: {
      English: ["bank", "library", "park", "market"],
      Hindi: ["bank (बैंक)", "library (पुस्तकालय)", "park (पार्क)", "market (बाज़ार)"],
      Kannada: ["bank (ಬ್ಯಾಂಕ್)", "library (ಗ್ರಂಥಾಲಯ)", "park (ಉದ್ಯಾನವನ)", "market (ಮಾರುಕಟ್ಟೆ)"],
      Telugu: ["bank (బ్యాంకు)", "library (లైబ్రరీ)", "park (పార్క్)", "market (మార్కెట్)"],
      Tamil: ["bank (வங்கி)", "library (நூலகம்)", "park (பூங்கா)", "market (சந்தை)"]
      },
      correctIndex: 1
    },
    {
      id: "teen_l4_2",
      question: {
      English: "Read the road sign: 'NO CYCLING'. What does it mean?",
      Hindi: "सड़क का चिन्ह पढ़ें: 'NO CYCLING' (साइकिल चलाना मना है)। इसका क्या अर्थ है?",
      Kannada: "ರಸ್ತೆ ಚಿಹ್ನೆಯನ್ನು ಓದಿ: 'NO CYCLING'. ಇದರ ಅರ್ಥವೇನು?",
      Telugu: "'NO CYCLING' బోర్డు చదవండి. దీని అర్థం ఏమిటి?",
      Tamil: "'NO CYCLING' பலகையைப் படிக்கவும். இதன் பொருள் என்ன?"
      },
      options: {
      English: ["Do not ride cycles here", "Buy a cycle", "Cycles are allowed", "Cycle parking"],
      Hindi: ["यहाँ साइकिल न चलाएं", "साइकिल खरीदें", "साइकिल की अनुमति है", "साइकिल पार्किंग"],
      Kannada: ["ಇಲ್ಲಿ ಸೈಕಲ್ ತುಳಿಯಬೇಡಿ", "ಸೈಕಲ್ ಖರೀದಿಸಿ", "ಸೈಕಲ್‌ಗೆ ಅನುಮತಿ ಇದೆ", "ಸೈಕಲ್ ಪಾರ್ಕಿಂಗ್"],
      Telugu: ["ఇక్కడ సైకిల్ తొక్కకూడదు", "సైకిల్ కొనండి", "సైకిళ్లకు అనుమతి ఉంది", "సైకిల్ పార్కింగ్"],
      Tamil: ["இங்கு சைக்கிள் ஓட்டக் கூடாது", "சைக்கிள் வாங்கவும்", "சைக்கிள் ஓட்டலாம்", "சைக்கிள் நிறுத்துமிடம்"]
      },
      correctIndex: 0
    },
    {
      id: "teen_l4_3",
      question: {
      English: "Complete: 'We play football in the ______.'",
      Hindi: "पूरा करें: 'We play football in the ______.'",
      Kannada: "ಪೂರ್ಣಗೊಳಿಸಿ: 'We play football in the ______.'",
      Telugu: "పూర్తి చేయండి: 'We play football in the ______.'",
      Tamil: "வாக்கியத்தை நிரப்புக: 'We play football in the ______.'"
      },
      options: {
      English: ["playground", "office", "classroom", "kitchen"],
      Hindi: ["playground (खेल का मैदान)", "office (दफ्तर)", "classroom (कक्षा)", "kitchen (रसोई)"],
      Kannada: ["playground (ಆಟದ ಮೈದಾನ)", "office (ಕಚೇರಿ)", "classroom (ತರಗತಿ)", "kitchen (ಅಡುಗೆಮನೆ)"],
      Telugu: ["playground (ఆటస్థలం)", "office (కార్యాలయం)", "classroom (తరగతి గది)", "kitchen (వంటగది)"],
      Tamil: ["playground (விளையாட்டு மைதானம்)", "office (அலுவலகம்)", "classroom (வகுப்பறை)", "kitchen (சமையலறை)"]
      },
      correctIndex: 0
    },
    {
      id: "teen_l4_4",
      question: {
      English: "Read the sign: 'NO SMOKING'. What does it mean?",
      Hindi: "संकेत पढ़ें: 'NO SMOKING' (धूम्रपान निषेध)। इसका क्या अर्थ है?",
      Kannada: "ಚಿಹ್ನೆಯನ್ನು ಓದಿ: 'NO SMOKING'. ಇದರ ಅರ್ಥವೇನು?",
      Telugu: "'NO SMOKING' బోర్డు చదవండి. దీని అర్థం ఏమిటి?",
      Tamil: "'NO SMOKING' பலகையைப் படிக்கவும். இதன் பொருள் என்ன?"
      },
      options: {
      English: ["Cigarette shop", "Fire alarm", "Do not light cigarettes", "Smoke is allowed"],
      Hindi: ["सिगरेट की दुकान", "अग्निशामक यंत्र", "सिगरेट न जलाएं", "धूम्रपान की अनुमति है"],
      Kannada: ["ಸಿಗರೇಟ್ ಅಂಗಡಿ", "ಫೈರ್ ಅಲಾರಾಂ", "ಸಿಗರೇಟ್ ಹಚ್ಚಬೇಡಿ", "ಧೂಮಪಾನಕ್ಕೆ ಅನುಮತಿ ಇದೆ"],
      Telugu: ["సిగరెట్ దుకాణం", "ఫైర్ అలారం", "సిగరెట్లు కాల్చకూడదు", "పొగ త్రాగడానికి అనుమతి ఉంది"],
      Tamil: ["சிகரெட் கடை", "தீ எச்சரிக்கை", "புகைபிடிக்கக் கூடாது", "புகைபிடிக்கலாம்"]
      },
      correctIndex: 2
    },
    {
      id: "teen_l4_5",
      question: {
      English: "Complete: 'I need to study for my ______ tomorrow.'",
      Hindi: "पूरा करें: 'I need to study for my ______ tomorrow.'",
      Kannada: "ಪೂರ್ಣಗೊಳಿಸಿ: 'I need to study for my ______ tomorrow.'",
      Telugu: "పూర్తి చేయండి: 'I need to study for my ______ tomorrow.'",
      Tamil: "வாக்கியத்தை நிரப்புக: 'I need to study for my ______ tomorrow.'"
      },
      options: {
      English: ["food", "sleep", "exam", "game"],
      Hindi: ["food (भोजन)", "sleep (नींद)", "exam (परीक्षा)", "game (खेल)"],
      Kannada: ["food (ಆಹಾರ)", "sleep (ನಿದ್ರೆ)", "exam (ಪರೀಕ್ಷೆ)", "game (ಆಟ)"],
      Telugu: ["food (ఆహారం)", "sleep (నిద్ర)", "exam (పరీక్ష)", "game (ఆట)"],
      Tamil: ["food (உணவு)", "sleep (தூக்கம்)", "exam (தேர்வு)", "game (விளையாட்டு)"]
      },
      correctIndex: 2
    },
    {
      id: "teen_l4_6",
      question: {
      English: "Read the sign: 'NO TRASHING'. What should you do?",
      Hindi: "संकेत पढ़ें: 'NO TRASHING' (कचरा न फैलाएं)। आपको क्या करना चाहिए?",
      Kannada: "ಚಿಹ್ನೆಯನ್ನು ಓದಿ: 'NO TRASHING'. ನೀವು ಏನು ಮಾಡಬೇಕು?",
      Telugu: "'NO TRASHING' బోర్డు చదవండి. మీరు ఏమి చేయాలి?",
      Tamil: "'NO TRASHING' பலகையைப் படிக்கவும். நீங்கள் என்ன செய்ய வேண்டும்?"
      },
      options: {
      English: ["Throw trash here", "Keep bags here", "Do not throw garbage", "Clean the floor"],
      Hindi: ["यहाँ कचरा फेंकें", "बैग यहाँ रखें", "कचरा न फेंकें", "फर्श साफ करें"],
      Kannada: ["ಕಸವನ್ನು ಇಲ್ಲೇ ಹಾಕಿ", "ಬ್ಯಾಗ್‌ಗಳನ್ನು ಇಲ್ಲಿ ಇರಿಸಿ", "ಕಸ ಹಾಕಬೇಡಿ", "ನೆಲ ಸ್ವಚ್ಛಗೊಳಿಸಿ"],
      Telugu: ["చెత్త ఇక్కడే వేయాలి", "సంచులు ఇక్కడ పెట్టాలి", "చెత్త వేయకూడదు", "నేల శుభ್ರం చేయాలి"],
      Tamil: ["இங்கு குப்பை போடலாம்", "பைகளை இங்கு வைக்கவும்", "குப்பை போடக் கூடாது", "தரையை சுத்தம் செய்ய"]
      },
      correctIndex: 2
    },
    {
      id: "teen_l4_7",
      question: {
      English: "Complete: 'Can you show me the ______ to the lab?'",
      Hindi: "पूरा करें: 'Can you show me the ______ to the lab?'",
      Kannada: "ಪೂರ್ಣಗೊಳಿಸಿ: 'Can you show me the ______ to the lab?'",
      Telugu: "పూర్తి చేయండి: 'Can you show me the ______ to the lab?'",
      Tamil: "வாக்கியத்தை நிரப்புக: 'Can you show me the ______ to the lab?'"
      },
      options: {
      English: ["door", "way", "window", "roof"],
      Hindi: ["door (दरवाजा)", "way (रास्ता)", "window (खिड़की)", "roof (छत)"],
      Kannada: ["door (ಬಾಗಿಲು)", "way (ದಾರಿ)", "window (ಕಿಟಕಿ)", "roof (ಛಾವಣಿ)"],
      Telugu: ["door (తలుపు)", "way (దారి)", "window (కిటికీ)", "roof (కప్పు)"],
      Tamil: ["door (கதவு)", "way (வழி)", "window (ஜன்னல்)", "roof (கூரை)"]
      },
      correctIndex: 1
    },
    {
      id: "teen_l4_8",
      question: {
      English: "Read the school gate notice: 'VISITORS REPORT TO OFFICE'. What should a visitor do?",
      Hindi: "स्कूल के गेट का नोटिस पढ़ें: 'VISITORS REPORT TO OFFICE'। आगंतुक को क्या करना चाहिए?",
      Kannada: "ಶಾಲೆಯ ಗೇಟ್ ನೋಟಿಸ್ ಓದಿ: 'VISITORS REPORT TO OFFICE'. ಸಂದರ್ಶಕರು ಏನು ಮಾಡಬೇಕು?",
      Telugu: "బడి గేటు వద్ద నోటీసు చదవండి: 'VISITORS REPORT TO OFFICE'. సందర్శకులు ఏమి చేయాలి?",
      Tamil: "பள்ளி நுழைவாயில் அறிவிப்பைப் படிக்கவும்: 'VISITORS REPORT TO OFFICE'. பார்வையாளர் என்ன செய்ய வேண்டும்?"
      },
      options: {
      English: ["Walk inside freely", "Wait outside", "Go home", "Go to the office first"],
      Hindi: ["स्वतंत्र रूप से अंदर घूमें", "बाहर प्रतीक्षा करें", "घर जाएं", "पहले कार्यालय जाएं"],
      Kannada: ["ಒಳಗೆ ಮುಕ್ತವಾಗಿ ಓಡಾಡಿ", "ಹೊರಗೆ ಕಾಯಿರಿ", "ಮನೆಗೆ ಹೋಗಿ", "ಮೊದಲು ಕಚೇರಿಗೆ ಹೋಗಿ"],
      Telugu: ["లోపలికి స్వేచ్ఛగా వెళ్లవచ్చు", "బయట వేచి ఉండాలి", "ఇంటికి వెళ్లాలి", "మొదట కార్యాలయానికి వెళ్లాలి"],
      Tamil: ["உள்ளே தடையின்றி செல்லலாம்", "வெளியே காத்திருக்கவும்", "வீட்டிற்குச் செல்லவும்", "முதலில் அலுவலகத்திற்குச் செல்லவும்"]
      },
      correctIndex: 3
    },
    {
      id: "teen_l4_9",
      question: {
      English: "Complete: 'My friend is ______ a bicycle.'",
      Hindi: "पूरा करें: 'My friend is ______ a bicycle.'",
      Kannada: "ಪೂರ್ಣಗೊಳಿಸಿ: 'My friend is ______ a bicycle.'",
      Telugu: "పూర్తి చేయండి: 'My friend is ______ a bicycle.'",
      Tamil: "வாக்கியத்தை நிரப்புக: 'My friend is ______ a bicycle.'"
      },
      options: {
      English: ["reading", "eating", "riding", "flying"],
      Hindi: ["reading (पढ़ रहा है)", "eating (खा रहा है)", "riding (चला रहा है)", "flying (उड़ा रहा है)"],
      Kannada: ["reading (ಓದುತ್ತಿದ್ದಾನೆ)", "eating (ತಿನ್ನುತ್ತಿದ್ದಾನೆ)", "riding (ಸವಾರಿ ಮಾಡುತ್ತಿದ್ದಾನೆ)", "flying (ಹಾರಿಸುತ್ತಿದ್ದಾನೆ)"],
      Telugu: ["reading (చదవడం)", "eating (తినడం)", "riding (తొక్కడం)", "flying (ఎగరడం)"],
      Tamil: ["reading (படிக்கிறான்)", "eating (உண்கிறான்)", "riding (ஓட்டுகிறான்)", "flying (பறக்கிறான்)"]
      },
      correctIndex: 2
    },
    {
      id: "teen_l4_10",
      question: {
      English: "Read the computer lab notice: 'NO FOOD OR DRINKS'. What can you bring inside?",
      Hindi: "कंप्यूटर लैब का नोटिस पढ़ें: 'NO FOOD OR DRINKS' (भोजन या पेय नहीं)। आप अंदर क्या ला सकते हैं?",
      Kannada: "ಕಂಪ್ಯೂಟರ್ ಲ್ಯಾಬ್ ನೋಟಿಸ್ ಓದಿ: 'NO FOOD OR DRINKS'. ನೀವು ಒಳಗೆ ಏನನ್ನು ತರಬಹುದು?",
      Telugu: "కంప్యూటర్ ల్యాబ్ నోటీసు చదవండి: 'NO FOOD OR DRINKS'. మీరు లోపలికి ఏమి తీసుకురావచ్చు?",
      Tamil: "கணினி அறை அறிவிப்பைப் படிக்கவும்: 'NO FOOD OR DRINKS'. நீங்கள் உள்ளே எதை எடுத்துச் செல்லலாம்?"
      },
      options: {
      English: ["Only drinks", "Neither food nor drinks", "Anything", "Only food"],
      Hindi: ["केवल पेय", "न भोजन न पेय", "कुछ भी", "केवल भोजन"],
      Kannada: ["ಪಾನೀಯ ಮಾತ್ರ", "ಆಹಾರವೂ ಇಲ್ಲ ಪಾನೀಯವೂ ಇಲ್ಲ", "ಏನನ್ನಾದರೂ", "ಆಹಾರ ಮಾತ್ರ"],
      Telugu: ["పానీయాలు మాత్రమే", "ఆహారం కానీ పానీయాలు కానీ ఏవీ తీసుకురాకూడదు", "ఏదైనా", "ఆహారం మాత్రమే"],
      Tamil: ["பானங்கள் மட்டும்", "உணவோ பானங்களோ கொண்டு செல்லக் கூடாது", "எதையும்", "உணவு மட்டும்"]
      },
      correctIndex: 1
    }
    ]
  },
  teen_level_5: {
    title: {
    English: "Level 5 Assessment (TEEN)",
    Hindi: "स्तर 5 आकलन (किशोर)",
    Kannada: "ಹಂತ 5 ಮೌಲ್ಯಮಾಪನ (ಕಿಶೋರರು)",
    Telugu: "స్థాయి 5 అంచనా (టీనేజర్స్)",
    Tamil: "நிலை 5 மதிப்பீடு (பதின்ம வயதினர்)"
    },
    description: {
    English: "Test checking capability at Level 5 for teen learners.",
    Hindi: "किशोर शिक्षार्थियों के लिए स्तर 5 क्षमता का परीक्षण।",
    Kannada: "ಕಲಿಯುವವರಿಗೆ ಹಂತ 5 ಸಾಮರ್ಥ್ಯವನ್ನು ಪರಿಶೀಲಿಸುವ ಪರೀಕ್ಷೆ.",
    Telugu: "అభ్యాసకుల కోసం స్థాయి 5 సామర్థ్య పరీక్ష.",
    Tamil: "கற்பவர்களுக்கான நிலை 5 திறனைச் சோதிக்கும் மதிப்பீடு."
    },
    questions: [
    {
      id: "teen_l5_1",
      question: {
      English: "Read this library warning:\n\nLibrary books must be returned within 7 days. A fine of 5 rupees per day is charged for late returns.\n\nHow many days can you keep a book without a fine?",
      Hindi: "पुस्तकालय की इस चेतावनी को पढ़ें:\n\nपुस्तकालय की पुस्तकें 7 दिनों के भीतर वापस की जानी चाहिए। देर से वापसी पर 5 रुपये प्रति दिन का जुर्माना लगाया जाता है।\n\nजुर्माने के बिना आप कितने दिनों तक पुस्तक रख सकते हैं?",
      Kannada: "ಗ್ರಂಥಾಲಯದ ಈ ಎಚ್ಚರಿಕೆಯನ್ನು ಓದಿ:\n\nಗ್ರಂಥಾಲಯದ ಪುಸ್ತಕಗಳನ್ನು 7 ದಿನಗಳ ಒಳಗೆ ಹಿಂದಿರುಗಿಸಬೇಕು. ತಡವಾಗಿ ಹಿಂದಿರುಗಿಸಿದರೆ ದಿನಕ್ಕೆ 5 ರೂಪಾಯಿ ದಂಡ ವಿಧಿಸಲಾಗುತ್ತದೆ.\n\nದಂಡವಿಲ್ಲದೆ ನೀವು ಎಷ್ಟು ದಿನ ಪುಸ್ತಕವನ್ನು ಇಟ್ಟುಕೊಳ್ಳಬಹುದು?",
      Telugu: "ఈ లైబ్రరీ హెచ్చరికను చదవండి:\n\nలైబ్రరీ పుస్తకాలను 7 రోజుల్లోగా తిరిగి ఇవ్వాలి. ఆలస్యంగా ఇస్తే రోజుకు 5 రూపాయల జరిమానా విధించబడుతుంది.\n\nజరిమానా లేకుండా మీరు ఎన్ని రోజులు పుస్తకాన్ని ఉంచుకోవచ్చు?",
      Tamil: "நூலகத்தின் இந்த எச்சரிக்கையைப் படிக்கவும்:\n\nநூலகப் புத்தகங்கள் 7 நாட்களுக்குள் திருப்பித் தரப்பட வேண்டும். தாமதமாகத் தந்தால் ஒரு நாளைக்கு 5 ரூபாய் அபராதம் விதிக்கப்படும்.\n\nஅபராதம் இல்லாமல் நீங்கள் எத்தனை நாட்களுக்குப் புத்தகத்தை வைத்திருக்கலாம்?"
      },
      options: {
      English: ["2 days", "7 days", "10 days", "5 days"],
      Hindi: ["2 दिन", "7 दिन", "10 दिन", "5 दिन"],
      Kannada: ["2 ದಿನಗಳು", "7 ದಿನಗಳು", "10 ದಿನಗಳು", "5 ದಿನಗಳು"],
      Telugu: ["2 రోజులు", "7 రోజులు", "10 రోజులు", "5 రోజులు"],
      Tamil: ["2 நாட்கள்", "7 நாட்கள்", "10 நாட்கள்", "5 நாட்கள்"]
      },
      correctIndex: 1
    },
    {
      id: "teen_l5_2",
      question: {
      English: "Read the library warning again. What is the fine per day for late returns?",
      Hindi: "पुस्तकालय की चेतावनी को दोबारा पढ़ें। देर से वापसी पर प्रतिदिन कितना जुर्माना है?",
      Kannada: "ಗ್ರಂಥಾಲಯದ ಎಚ್ಚರಿಕೆಯನ್ನು ಮತ್ತೆ ಓದಿ. ತಡವಾಗಿ ಹಿಂದಿರುಗಿಸಿದರೆ ದಿನಕ್ಕೆ ಎಷ್ಟು ದಂಡ?",
      Telugu: "లైబ్రరీ హెచ్చరికను మళ్లీ చదవండి. ఆలస్యంగా ఇస్తే రోజుకు జరిమానా ఎంత?",
      Tamil: "நூலக எச்சரிக்கையை மீண்டும் படிக்கவும். தாமதமாகத் தந்தால் ஒரு நாளைக்கு எவ்வளவு அபராதம்?"
      },
      options: {
      English: ["2 rupees", "10 rupees", "7 rupees", "5 rupees"],
      Hindi: ["2 रुपये", "10 रुपये", "7 रुपये", "5 रुपये"],
      Kannada: ["2 ರೂಪಾಯಿ", "10 ರೂಪಾಯಿ", "7 ರೂಪಾಯಿ", "5 ರೂಪಾಯಿ"],
      Telugu: ["2 రూపాయలు", "10 రూపాయలు", "7 రూపాయలు", "5 రూపాయలు"],
      Tamil: ["2 ரூபாய்", "10 ரூபாய்", "7 ரூபாய்", "5 ரூபாய்"]
      },
      correctIndex: 3
    },
    {
      id: "teen_l5_3",
      question: {
      English: "Read this school announcement:\n\nThe school sports day is scheduled for Friday. In case of heavy rain, it will be moved to Monday.\n\nOn which day is the sports day scheduled first?",
      Hindi: "इस स्कूल घोषणा को पढ़ें:\n\nस्कूल का खेल दिवस (sports day) शुक्रवार को निर्धारित है। भारी बारिश के मामले में, इसे सोमवार को स्थानांतरित कर दिया जाएगा।\n\nखेल दिवस पहले किस दिन निर्धारित किया गया है?",
      Kannada: "ಶಾಲೆಯ ಈ ಪ್ರಕಟಣೆಯನ್ನು ಓದಿ:\n\nಶಾಲೆಯ ಕ್ರೀಡಾಕೂಟವನ್ನು ಶುಕ್ರವಾರ ನಿಗದಿಪಡಿಸಲಾಗಿದೆ. ಭಾರಿ ಮಳೆಯಾದರೆ, ಅದನ್ನು ಸೋಮವಾರಕ್ಕೆ ಮುಂದೂಡಲಾಗುವುದು.\n\nಕ್ರೀಡಾಕೂಟವನ್ನು ಮೊದಲು ಯಾವ ದಿನ ನಿಗದಿಪಡಿಸಲಾಗಿದೆ?",
      Telugu: "ఈ పాఠశాల ప్రకటనను చదవండి:\n\nపాఠశాల స్పోర్ట్స్ డే శుక్రవారం నాడు నిర్వహించబడుతుంది. భారీ వర్షం పడితే, దానిని సోమవారానికి మారుస్తారు.\n\nస్పోర్ట్స్ డే మొదట ఏ రోజున నిర్ణయించారు?",
      Tamil: "இந்தப் பள்ளி அறிவிப்பைப் படிக்கவும்:\n\nபள்ளி விளையாட்டு விழா வெள்ளிக்கிழமை திட்டமிடப்பட்டுள்ளது. அதிக மழை பெய்தால், அது திங்கட்கிழமைக்கு மாற்றப்படும்.\n\nவிளையாட்டு விழா முதலில் எந்த நாளில் திட்டமிடப்பட்டுள்ளது?"
      },
      options: {
      English: ["Wednesday", "Monday", "Friday", "Saturday"],
      Hindi: ["बुधवार", "सोमवार", "शुक्रवार", "शनिवार"],
      Kannada: ["ಬುಧವಾರ", "ಸೋಮವಾರ", "ಶುಕ್ರವಾರ", "ಶನಿವಾರ"],
      Telugu: ["బుధవారం", "సోమవారం", "శుక్రవారం", "శనివారం"],
      Tamil: ["புதன்கிழமை", "திங்கட்கிழமை", "வெள்ளிக்கிழமை", "சனிக்கிழமை"]
      },
      correctIndex: 2
    },
    {
      id: "teen_l5_4",
      question: {
      English: "Read the announcement again. When will the sports day move to Monday?",
      Hindi: "घोषणा को दोबारा पढ़ें। खेल दिवस सोमवार को कब स्थानांतरित किया जाएगा?",
      Kannada: "ಪ್ರಕಟಣೆಯನ್ನು ಮತ್ತೆ ಓದಿ. ಕ್ರೀಡಾಕೂಟವನ್ನು ಸೋಮವಾರಕ್ಕೆ ಯಾವಾಗ ಮುಂದೂಡಲಾಗುತ್ತದೆ?",
      Telugu: "ప్రకటనను మళ్లీ చదవండి. స్పోర్ట్స్ డే సోమవారానికి ఎప్పుడు మారుస్తారు?",
      Tamil: "அறிவிப்பை மீண்டும் படிக்கவும். விளையாட்டு விழா எப்போது திங்கட்கிழமைக்கு மாற்றப்படும்?"
      },
      options: {
      English: ["In case of heavy rain", "If teachers are busy", "Every week", "If students want"],
      Hindi: ["भारी बारिश के मामले में", "अगर शिक्षक व्यस्त हैं", "हर हफ्ते", "अगर छात्र चाहते हैं"],
      Kannada: ["ಭಾರಿ ಮಳೆಯಾದರೆ", "ಶಿಕ್ಷಕರು ಕಾರ್ಯನಿರತರಾಗಿದ್ದರೆ", "ಪ್ರತಿ ವಾರ", "ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಇಷ್ಟವಿದ್ದರೆ"],
      Telugu: ["భారీ వర్షం పడితే", "ఉపాధ్యಾಯులు బిజీగా ఉంటే", "ప్రతి వారం", "విద్యార్థులు కోరుకుంటే"],
      Tamil: ["அதிக மழை பெய்தால்", "ஆசிரியர்கள் பிஸியாக இருந்தால்", "ஒவ்வொரு வாரமும்", "மாணவர்கள் விரும்பினால்"]
      },
      correctIndex: 0
    },
    {
      id: "teen_l5_5",
      question: {
      English: "Read this computer instruction:\n\nAlways shut down the computer properly after use. Do not turn off the power switch directly.\n\nWhat should you do after using the computer?",
      Hindi: "कंप्यूटर के इस निर्देश को पढ़ें:\n\nउपयोग के बाद हमेशा कंप्यूटर को ठीक से बंद (shut down) करें। सीधे पावर स्विच बंद न करें।\n\nकंप्यूटर का उपयोग करने के बाद आपको क्या करना चाहिए?",
      Kannada: "ಕಂಪ್ಯೂಟರ್‌ನ ಈ ಸೂಚನೆಯನ್ನು ಓದಿ:\n\nಬಳಸಿದ ನಂತರ ಕಂಪ್ಯೂಟರ್ ಅನ್ನು ಸರಿಯಾಗಿ ಶಟ್‌ಡೌನ್ ಮಾಡಿ. ನೇರವಾಗಿ ಪವರ್ ಸ್ವಿಚ್ ಆಫ್ ಮಾಡಬೇಡಿ.\n\nಕಂಪ್ಯೂಟರ್ ಬಳಸಿದ ನಂತರ ನೀವು ಏನು ಮಾಡಬೇಕು?",
      Telugu: "ఈ కంప్యూటర్ సూచనను చదవండి:\n\nఉపయోగించిన తర్వాత ఎల్లప్పుడూ కంప్యూటర్‌ను సరిగ్గా షట్ డౌన్ చేయండి. నేరుగా పవర్ స్విచ్ ఆర్పకూడదు.\n\nకంప్యూటర్ ఉపయోగించిన తర్వాత మీరు ఏమి చేయాలి?",
      Tamil: "இந்த கணினி அறிவுறுத்தலைப் படிக்கவும்:\n\nபயன்பாட்டிற்குப் பிறகு கணினியை எப்போதும் சரியாக அணைக்கவும். மின்சார சுவிட்சை நேரடியாக அணைக்கக் கூடாது.\n\nகணினியைப் பயன்படுத்திய பிறகு நீங்கள் என்ன செய்ய வேண்டும்?"
      },
      options: {
      English: ["Shut down properly", "Call a teacher", "Leave it open", "Turn off power switch directly"],
      Hindi: ["ठीक से बंद करें", "शिक्षक को बुलाएं", "इसे खुला छोड़ दें", "सीधे पावर स्विच बंद करें"],
      Kannada: ["ಸರಿಯಾಗಿ ಶಟ್‌ಡೌನ್ ಮಾಡಿ", "ಶಿಕ್ಷಕರನ್ನು ಕರೆಯಿರಿ", "ಹಾಗೆಯೇ ಬಿಡಿ", "ನೇರವಾಗಿ ಪವರ್ ಸ್ವಿಚ್ ಆಫ್ ಮಾಡಿ"],
      Telugu: ["సరిగ్గా షట్ డౌన్ చేయాలి", "టీచర్‌ను పిలవాలి", "అలాగే వదిలేయాలి", "నేరుగా పవర్ స్ವಿచ్ ఆర్పాలి"],
      Tamil: ["சரியாக அணைக்கவும்", "ஆசிரியரை அழைக்கவும்", "அப்படியே விட்டுவிடவும்", "மின்சார சுவிட்சை நேரடியாக அணைக்கவும்"]
      },
      correctIndex: 0
    },
    {
      id: "teen_l5_6",
      question: {
      English: "Read this timetable entry:\n\nMath Class: Room 101. Physics Lab: Room 204. Chemistry Lab: Room 305. All classes start on time.\n\nWhere is the Physics Lab located?",
      Hindi: "इस समय सारणी को पढ़ें:\n\nगणित कक्षा: कमरा 101। भौतिकी लैब: कमरा 204। रसायन विज्ञान लैब: कमरा 305। सभी कक्षाएं समय पर शुरू होती हैं।\n\nभौतिकी (Physics) लैब कहाँ स्थित है?",
      Kannada: "ಈ ವೇಳಾಪಟ್ಟಿಯನ್ನು ಓದಿ:\n\nಗಣಿತ ತರಗತಿ: ಕೊಠಡಿ 101. ಭೌತಶಾಸ್ತ್ರ ಪ್ರಯೋಗಾಲಯ: ಕೊಠಡಿ 204. ರಸಾಯನಶಾಸ್ತ್ರ ಪ್ರಯೋಗಾಲಯ: ಕೊಠಡಿ 305. ಎಲ್ಲಾ ತರಗತಿಗಳು ಸಮಯಕ್ಕೆ ಪ್ರಾರಂಭವಾಗುತ್ತವೆ.\n\nಭೌತಶಾಸ್ತ್ರ ಪ್ರಯೋಗಾಲಯ ಎಲ್ಲಿದೆ?",
      Telugu: "ఈ సమయ పట్టికను చదవండి:\n\nగణిత క్లాస్: రూమ్ 101. ఫిజిక్స్ ల్యాబ్: రూమ్ 204. కెమిస్ట్రీ ల్యాబ్: రూమ్ 305. అన్ని క్లాసులు సమయానికి ప్రారంభమవుతాయి.\n\nఫిజిక్స్ ల్యాబ్ ఎక్కడ ఉంది?",
      Tamil: "இந்த அட்டவணையைப் படிக்கவும்:\n\nகணித வகுப்பு: அறை 101. இயற்பியல் ஆய்வகம்: அறை 204. வேதியியல் ஆய்வகம்: அறை 305. அனைத்து வகுப்புகளும் சரியான நேரத்தில் தொடங்கும்.\n\nஇயற்பியல் ஆய்வகம் எங்குள்ளது?"
      },
      options: {
      English: ["Room 305", "Room 204", "Room 101", "Room 100"],
      Hindi: ["कमरा 305", "कमरा 204", "कमरा 101", "कमरा 100"],
      Kannada: ["ಕೊಠಡಿ 305", "ಕೊಠಡಿ 204", "ಕೊಠಡಿ 101", "ಕೊಠಡಿ 100"],
      Telugu: ["రూమ్ 305", "రూమ్ 204", "రూమ్ 101", "రూమ్ 100"],
      Tamil: ["அறை 305", "அறை 204", "அறை 101", "அறை 100"]
      },
      correctIndex: 1
    },
    {
      id: "teen_l5_7",
      question: {
      English: "Read this student identity card:\n\nName: Rahul Sharma. Age: 16. School: Model High School. Roll No: 24.\n\nHow old is Rahul Sharma?",
      Hindi: "इस छात्र पहचान पत्र को पढ़ें:\n\nनाम: राहुल शर्मा। उम्र: 16। स्कूल: मॉडल हाई स्कूल। रोल नंबर: 24।\n\nराहुल शर्मा की उम्र कितनी है?",
      Kannada: "ಈ ವಿದ್ಯಾರ್ಥಿ ಗುರುತಿನ ಚೀಟಿಯನ್ನು ಓದಿ:\n\nಹೆಸರು: ರಾಹುಲ್ ಶರ್ಮಾ. ವಯಸ್ಸು: 16. ಶಾಲೆ: ಮಾಡೆಲ್ ಹೈ ಸ್ಕೂಲ್. ರೋಲ್ ನಂಬರ್: 24.\n\nರಾಹುಲ್ ಶರ್ಮಾ ವಯಸ್ಸು ಎಷ್ಟು?",
      Telugu: "ఈ విద్యార్థి గుర్తింపు కార్డు చదవండి:\n\nపేరు: రాహుల్ శర్మ. వయస్సు: 16. పాఠశాల: మోడల్ హై స్కూల్. రోల్ నంబర్: 24.\n\nరాహుల్ శర్మ వయస్సు ఎంత?",
      Tamil: "இந்த மாணவர் அடையாள அட்டையைப் படிக்கவும்:\n\nபெயர்: ராகுல் சர்மா. வயது: 16. பள்ளி: மாடல் உயர்நிலைப் பள்ளி. பதிவு எண்: 24.\n\nராகுல் சர்மாவின் வயது என்ன?"
      },
      options: {
      English: ["18", "15", "24", "16"],
      Hindi: ["18", "15", "24", "16"],
      Kannada: ["18", "15", "24", "16"],
      Telugu: ["18", "15", "24", "16"],
      Tamil: ["18", "15", "24", "16"]
      },
      correctIndex: 3
    },
    {
      id: "teen_l5_8",
      question: {
      English: "Read the student identity card again. What is the roll number of Rahul?",
      Hindi: "छात्र पहचान पत्र को दोबारा पढ़ें। राहुल का रोल नंबर क्या है?",
      Kannada: "ಗುರುತಿನ ಚೀಟಿಯನ್ನು ಮತ್ತೆ ಓದಿ. ರಾಹುಲ್ ರೋಲ್ ನಂಬರ್ ಎಷ್ಟು?",
      Telugu: "గుర్తింపు కార్డు మళ్లీ చదవండి. రాహుల్ రోల్ నంబర్ ఎంత?",
      Tamil: "மாணவர் அடையாள அட்டையை மீண்டும் படிக்கவும். ராகுலின் பதிவு எண் என்ன?"
      },
      options: {
      English: ["16", "30", "12", "24"],
      Hindi: ["16", "30", "12", "24"],
      Kannada: ["16", "30", "12", "24"],
      Telugu: ["16", "30", "12", "24"],
      Tamil: ["16", "30", "12", "24"]
      },
      correctIndex: 3
    },
    {
      id: "teen_l5_9",
      question: {
      English: "Read this exam notice:\n\nBring a blue pen and a ruler for the exam. Calculators are strictly prohibited.\n\nWhat object can you NOT bring to the exam?",
      Hindi: "इस परीक्षा सूचना को पढ़ें:\n\nपरीक्षा के लिए एक नीला पेन और एक रूलर लाएं। कैलकुलेटर सख्त वर्जित हैं।\n\nआप परीक्षा में कौन सी वस्तु नहीं ला सकते हैं?",
      Kannada: "ಈ ಪರೀಕ್ಷಾ ನೋಟಿಸ್ ಓದಿ:\n\nಪರೀಕ್ಷೆಗೆ ನೀಲಿ ಪೆನ್ನು ಮತ್ತು ರೂಲರ್ ತನ್ನಿ. ಕ್ಯಾಲ್ಕುಲೇಟರ್‌ಗಳನ್ನು ಕಟ್ಟುನಿಟ್ಟಾಗಿ ನಿಷೇಧಿಸಲಾಗಿದೆ.\n\nಪರೀಕ್ಷೆಗೆ ನೀವು ಯಾವ ವಸ್ತುವನ್ನು ತರಬಾರದು?",
      Telugu: "ఈ పరీక్ష నోటీసు చదవండి:\n\nపరీక్షకు నీలి రంగు కలం మరియు స్కేల్ తీసుకురండి. క్యాలిక్యులేటర్లు ఖచ్చితంగా నిషేధించబడ్డాయి.\n\nపరీక్షకు మీరు ఏ వస్తువును తీసుకురాకూడదు?",
      Tamil: "இந்தத் தேர்வு அறிவிப்பைப் படிக்கவும்:\n\nதேர்விற்கு நீல நிற பேனா மற்றும் அளவுகோல் கொண்டு வரவும். கால்குலேட்டர்கள் கண்டிப்பாக அனுமதிக்கப்படாது.\n\nதேர்விற்கு நீங்கள் எந்தப் பொருளைக் கொண்டு வரக் கூடாது?"
      },
      options: {
      English: ["Pencil", "Blue pen", "Calculator", "Ruler"],
      Hindi: ["पेंसिल", "नीला पेन", "कैलकुलेटर", "रूलर"],
      Kannada: ["ಪೆನ್ಸಿಲ್", "ನೀಲಿ ಪೆನ್ನು", "ಕ್ಯಾಲ್ಕುಲೇಟರ್", "ರೂಲರ್"],
      Telugu: ["పెన్సిల్", "నీలి రంగు కలం", "క్యాలిక్యులేటర్", "స్కేల్"],
      Tamil: ["பென்சில்", "நீல பேனா", "கால்குலேட்டர்", "அளவுகோல்"]
      },
      correctIndex: 2
    },
    {
      id: "teen_l5_10",
      question: {
      English: "Read this playground schedule:\n\nThe football field is reserved for the senior team from 4 PM to 6 PM daily.\n\nWho is the football field reserved for between 4 PM and 6 PM?",
      Hindi: "खेल के मैदान का यह कार्यक्रम पढ़ें:\n\nफुटबॉल मैदान रोजाना शाम 4 बजे से शाम 6 बजे तक सीनियर टीम के लिए आरक्षित है।\n\nशाम 4 से 6 बजे के बीच फुटबॉल मैदान किसके लिए आरक्षित है?",
      Kannada: "ಆಟದ ಮೈದಾನದ ಈ ವೇಳಾಪಟ್ಟಿಯನ್ನು ಓದಿ:\n\nಫುಟ್‌ಬಾಲ್ ಮೈದಾನವು ಪ್ರತಿದಿನ ಸಂಜೆ 4 ರಿಂದ 6 ರವರೆಗೆ ಹಿರಿಯ ತಂಡಕ್ಕೆ ಮೀಸಲಾಗಿದೆ.\n\nಸಂಜೆ 4 ರಿಂದ 6 ರವರೆಗೆ ಫುಟ್‌ಬಾಲ್ ಮೈದಾನ ಯಾರಿಗೆ ಮೀಸಲಾಗಿದೆ?",
      Telugu: "ఈ మైదాన సమయ పట్టికను చదవండి:\n\nఫుట్ బాల్ మైదానం ప్రతిరోజూ సాయంత్రం 4 నుండి 6 గంటల వరకు సీనియర్ టీమ్ కొరకు కేటాయించబడింది.\n\nసాయంత్రం 4 నుండి 6 గంటల వరకు ఫుట్ బాల్ మైదానం ఎవరి కోసం కేటాయించారు?",
      Tamil: "இந்த விளையாட்டு மைதான அட்டவணையைப் படிக்கவும்:\n\nகால்பந்து மைதானம் தினமும் மாலை 4 மணி முதல் மாலை 6 மணி வரை மூத்த அணிக்காக ஒதுக்கப்பட்டுள்ளது.\n\nமாலை 4 மணி முதல் மாலை 6 மணி வரை கால்பந்து மைதானம் யாருக்காக ஒதுக்கப்பட்டுள்ளது?"
      },
      options: {
      English: ["All students", "Junior team", "Visitors", "Senior team"],
      Hindi: ["सभी छात्र", "जूनियर टीम", "आगंतुक", "सीनियर टीम"],
      Kannada: ["ಎಲ್ಲಾ ವಿದ್ಯಾರ್ಥಿಗಳು", "ಕಿರಿಯ ತಂಡ", "ಸಂದರ್ಶಕರು", "ಹಿರಿಯ ತಂಡ"],
      Telugu: ["విద్యార్థులందరూ", "జూనియర్ టీమ్", "సందర్శకులు", "సీనియర్ టీమ్"],
      Tamil: ["அனைத்து மாணவர்கள்", "இளைய அணி", "பார்வையாளர்கள்", "மூத்த அணி"]
      },
      correctIndex: 3
    }
    ]
  },
  adult_level_1: {
    title: {
    English: "Level 1 Assessment (ADULT)",
    Hindi: "स्तर 1 आकलन (वयस्क)",
    Kannada: "ಹಂತ 1 ಮೌಲ್ಯಮಾಪನ (ವಯಸ್ಕರು)",
    Telugu: "స్థాయి 1 అంచనా (వయోజనులు)",
    Tamil: "நிலை 1 மதிப்பீடு (பெரியவர்கள்)"
    },
    description: {
    English: "Test checking capability at Level 1 for adult learners.",
    Hindi: "वयस्क शिक्षार्थियों के लिए स्तर 1 क्षमता का परीक्षण।",
    Kannada: "ಕಲಿಯುವವರಿಗೆ ಹಂತ 1 ಸಾಮರ್ಥ್ಯವನ್ನು ಪರಿಶೀಲಿಸುವ ಪರೀಕ್ಷೆ.",
    Telugu: "అభ్యాసకుల కోసం స్థాయి 1 సామర్థ్య పరీక్ష.",
    Tamil: "கற்பவர்களுக்கான நிலை 1 திறனைச் சோதிக்கும் மதிப்பீடு."
    },
    questions: [
    {
      id: "adult_l1_1",
      question: {
      English: "Which letter matches the shape of uppercase 'D'?",
      Hindi: "कौन सा अक्षर बड़े अक्षर 'D' के आकार से मेल खाता है?",
      Kannada: "ಯಾವ ಅಕ್ಷರವು ದೊಡ್ಡ ಅಕ್ಷರ 'D' ನ ಆಕಾರಕ್ಕೆ ಹೊಂದಿಕೆಯಾಗುತ್ತದೆ?",
      Telugu: "ఏ అక్షరం క్యాపిటల్ 'D' ఆకారంతో సరిపోలుతుంది?",
      Tamil: "எந்த எழுத்து பெரிய எழுத்து 'D'-இன் வடிவத்துடன் ஒத்துப்போகிறது?"
      },
      options: {
      English: ["Q", "O", "D", "C"],
      Hindi: ["Q", "O", "D", "C"],
      Kannada: ["Q", "O", "D", "C"],
      Telugu: ["Q", "O", "D", "C"],
      Tamil: ["Q", "O", "D", "C"]
      },
      correctIndex: 2
    },
    {
      id: "adult_l1_2",
      question: {
      English: "Find the lowercase letter shape for 'p'.",
      Hindi: "छोटे अक्षर 'p' के लिए आकार खोजें।",
      Kannada: "'p' ಅಕ್ಷರದ ಸಣ್ಣ ರೂಪವನ್ನು ಹುಡುಕಿ.",
      Telugu: "'p' అక్షరానికి చిన్న రూపం కనుగొనండి.",
      Tamil: "'p' என்ற சிறிய எழுத்தின் வடிவத்தைக் கண்டறியவும்."
      },
      options: {
      English: ["q", "p", "d", "b"],
      Hindi: ["q", "p", "d", "b"],
      Kannada: ["q", "p", "d", "b"],
      Telugu: ["q", "p", "d", "b"],
      Tamil: ["q", "p", "d", "b"]
      },
      correctIndex: 1
    },
    {
      id: "adult_l1_3",
      question: {
      English: "Identify the capital letter 'H'.",
      Hindi: "बड़ा अक्षर 'H' पहचानें।",
      Kannada: "ದೊಡ್ಡ ಅಕ್ಷರ 'H' ಅನ್ನು ಗುರುತಿಸಿ.",
      Telugu: "క్యాపిటల్ అక్షరం 'H'ని గుర్తించండి.",
      Tamil: "பெரிய எழுத்து 'H'-ஐ அடையாளம் காணவும்."
      },
      options: {
      English: ["I", "H", "M", "N"],
      Hindi: ["I", "H", "M", "N"],
      Kannada: ["I", "H", "M", "N"],
      Telugu: ["I", "H", "M", "N"],
      Tamil: ["I", "H", "M", "N"]
      },
      correctIndex: 1
    },
    {
      id: "adult_l1_4",
      question: {
      English: "Which shape is different from the others?",
      Hindi: "कौन सा आकार दूसरों से अलग है?",
      Kannada: "ಯಾವ ಆಕಾರವು ಇತರ ಆಕಾರಗಳಿಗಿಂತ ಭिನ್ನವಾಗಿದೆ?",
      Telugu: "ఏ ఆకారం మిగతా వాటికంటే భిన్నంగా ఉంది?",
      Tamil: "மற்றவைகளிலிருந்து வேறுபட்ட வடிவம் எது?"
      },
      options: {
      English: ["V", "W", "V", "V"],
      Hindi: ["V", "W", "V", "V"],
      Kannada: ["V", "W", "V", "V"],
      Telugu: ["V", "W", "V", "V"],
      Tamil: ["V", "W", "V", "V"]
      },
      correctIndex: 1
    },
    {
      id: "adult_l1_5",
      question: {
      English: "Identify the letter 'L'.",
      Hindi: "अक्षर 'L' पहचानें।",
      Kannada: "'L' ಅಕ್ಷರವನ್ನು ಗುರುತಿಸಿ.",
      Telugu: "'L' అక్షరాన్ని గుర్తించండి.",
      Tamil: "'L' என்ற எழுத்தை அடையாளம் காணவும்."
      },
      options: {
      English: ["I", "F", "T", "L"],
      Hindi: ["I", "F", "T", "L"],
      Kannada: ["I", "F", "T", "L"],
      Telugu: ["I", "F", "T", "L"],
      Tamil: ["I", "F", "T", "L"]
      },
      correctIndex: 3
    },
    {
      id: "adult_l1_6",
      question: {
      English: "Complete the sequence: O, P, Q, __",
      Hindi: "क्रम पूरा करें: O, P, Q, __",
      Kannada: "ಅನುಕ್ರಮವನ್ನು ಪೂರ್ಣಗೊಳಿಸಿ: O, P, Q, __",
      Telugu: "క్రమాన్ని పూర్తి చేయండి: O, P, Q, __",
      Tamil: "வரிசையை நிரப்புக: O, P, Q, __"
      },
      options: {
      English: ["U", "R", "S", "T"],
      Hindi: ["U", "R", "S", "T"],
      Kannada: ["U", "R", "S", "T"],
      Telugu: ["U", "R", "S", "T"],
      Tamil: ["U", "R", "S", "T"]
      },
      correctIndex: 1
    },
    {
      id: "adult_l1_7",
      question: {
      English: "Find the lowercase shape matching 'n'.",
      Hindi: "'n' से मेल खाने वाला छोटा आकार खोजें।",
      Kannada: "'n' ಗೆ ಹೊಂದಿಕೆಯಾಗುವ ಸಣ್ಣ ಅಕ್ಷರವನ್ನು ಹುಡುಕಿ.",
      Telugu: "'n' కి సరిపోయే చిన్న ఆకారాన్ని కనుగొనండి.",
      Tamil: "'n' என்ற எழுத்துக்குரிய சிறிய வடிவத்தைக் கண்டறியவும்."
      },
      options: {
      English: ["h", "u", "n", "m"],
      Hindi: ["h", "u", "n", "m"],
      Kannada: ["h", "u", "n", "m"],
      Telugu: ["h", "u", "n", "m"],
      Tamil: ["h", "u", "n", "m"]
      },
      correctIndex: 2
    },
    {
      id: "adult_l1_8",
      question: {
      English: "Which letter looks like a cross shape?",
      Hindi: "कौन सा अक्षर क्रॉस (cross) जैसा दिखता है?",
      Kannada: "ಯಾವ ಅಕ್ಷರವು ಕ್ರಾಸ್ (+) ಆಕಾರದಲ್ಲಿದೆ?",
      Telugu: "ఏ అక్షరం గుణకారం గుర్తు (cross) లాగా ఉంటుంది?",
      Tamil: "கூட்டல் குறி (+) போல இருக்கும் எழுத்து எது?"
      },
      options: {
      English: ["L", "X", "T", "H"],
      Hindi: ["L", "X", "T", "H"],
      Kannada: ["L", "X", "T", "H"],
      Telugu: ["L", "X", "T", "H"],
      Tamil: ["L", "X", "T", "H"]
      },
      correctIndex: 1
    },
    {
      id: "adult_l1_9",
      question: {
      English: "Find the capital letter 'G'.",
      Hindi: "बड़ा अक्षर 'G' खोजें।",
      Kannada: "ದೊಡ್ಡ ಅಕ್ಷರ 'G' ಅನ್ನು ಹುಡುಕಿ.",
      Telugu: "క్యాపిటల్ అಕ್ಷరం 'G'ని కనుగొనండి.",
      Tamil: "பெரிய எழுத்து 'G'-ஐக் கண்டறியவும்."
      },
      options: {
      English: ["Q", "C", "O", "G"],
      Hindi: ["Q", "C", "O", "G"],
      Kannada: ["Q", "C", "O", "G"],
      Telugu: ["Q", "C", "O", "G"],
      Tamil: ["Q", "C", "O", "G"]
      },
      correctIndex: 3
    },
    {
      id: "adult_l1_10",
      question: {
      English: "Find the lowercase letter 't'.",
      Hindi: "छोटा अक्षर 't' खोजें।",
      Kannada: "ಸಣ್ಣ ಅಕ್ಷರ 't' ಅನ್ನು ಹುಡುಕಿ.",
      Telugu: "చిన్న అక్షరం 't'ని కనుగొనండి.",
      Tamil: "சிறிய எழுத்து 't'-ஐக் கண்டறியவும்."
      },
      options: {
      English: ["l", "i", "t", "f"],
      Hindi: ["l", "i", "t", "f"],
      Kannada: ["l", "i", "t", "f"],
      Telugu: ["l", "i", "t", "f"],
      Tamil: ["l", "i", "t", "f"]
      },
      correctIndex: 2
    }
    ]
  },
  adult_level_2: {
    title: {
    English: "Level 2 Assessment (ADULT)",
    Hindi: "स्तर 2 आकलन (वयस्क)",
    Kannada: "ಹಂತ 2 ಮೌಲ್ಯಮಾಪನ (ವಯಸ್ಕರು)",
    Telugu: "స్థాయి 2 అంచనా (వయోజనులు)",
    Tamil: "நிலை 2 மதிப்பீடு (பெரியவர்கள்)"
    },
    description: {
    English: "Test checking capability at Level 2 for adult learners.",
    Hindi: "वयस्क शिक्षार्थियों के लिए स्तर 2 क्षमता का परीक्षण।",
    Kannada: "ಕಲಿಯುವವರಿಗೆ ಹಂತ 2 ಸಾಮರ್ಥ್ಯವನ್ನು ಪರಿಶೀಲಿಸುವ ಪರೀಕ್ಷೆ.",
    Telugu: "అభ్యాసకుల కోసం స్థాయి 2 సామర్థ్య పరీక్ష.",
    Tamil: "கற்பவர்களுக்கான நிலை 2 திறனைச் சோதிக்கும் மதிப்பீடு."
    },
    questions: [
    {
      id: "adult_l2_1",
      question: {
      English: "Which letter starting sound matches the word 'Market'?",
      Hindi: "कौन सा शुरुआती अक्षर 'Market' (बाज़ार) शब्द से मेल खाता है?",
      Kannada: "ಯಾವ ಆರಂಭಿಕ ಅಕ್ಷರವು 'Market' ಪದಕ್ಕೆ ಹೊಂದಿಕೆಯಾಗುತ್ತದೆ?",
      Telugu: "'Market' పదానికి ప్రారంభ శబ్దం ఏ అక్షరం చేస్తుంది?",
      Tamil: "'Market' என்ற வார்த்தையின் தொடக்க ஒலியுடன் பொருந்தும் எழுத்து எது?"
      },
      options: {
      English: ["V", "N", "M", "W"],
      Hindi: ["V", "N", "M", "W"],
      Kannada: ["V", "N", "M", "W"],
      Telugu: ["V", "N", "M", "W"],
      Tamil: ["V", "N", "M", "W"]
      },
      correctIndex: 2
    },
    {
      id: "adult_l2_2",
      question: {
      English: "Identify the missing vowel: 'B_nk'.",
      Hindi: "छूटा हुआ स्वर पहचानें: 'B_nk' (बैंक)।",
      Kannada: "ಬಿಟ್ಟುಹೋದ ಸ್ವರವನ್ನು ಗುರುತಿಸಿ: 'B_nk'.",
      Telugu: "పదంలో లేని అచ్చును గుర్తించండి: 'B_nk'.",
      Tamil: "விடுபட்ட உயிர் எழுத்தைக் கண்டறியவும்: 'B_nk'."
      },
      options: {
      English: ["a", "i", "o", "e"],
      Hindi: ["a", "i", "o", "e"],
      Kannada: ["a", "i", "o", "e"],
      Telugu: ["a", "i", "o", "e"],
      Tamil: ["a", "i", "o", "e"]
      },
      correctIndex: 0
    },
    {
      id: "adult_l2_3",
      question: {
      English: "Which word rhymes with 'Shop'?",
      Hindi: "कौन सा शब्द 'Shop' (दुकान) के साथ तुकबंदी करता है?",
      Kannada: "ಯಾವ ಪದವು 'Shop' ಪದದೊಂದಿಗೆ ಪ್ರಾಸಬದ್ಧವಾಗಿದೆ?",
      Telugu: "'Shop' తో ప్రాస కలిసే పదం ఏది?",
      Tamil: "'Shop' என்ற ஒலியுடன் ஒத்துப்போகும் வார்த்தை எது?"
      },
      options: {
      English: ["Ship", "Crop", "Soap", "Shut"],
      Hindi: ["Ship", "Crop", "Soap", "Shut"],
      Kannada: ["Ship", "Crop", "Soap", "Shut"],
      Telugu: ["Ship", "Crop", "Soap", "Shut"],
      Tamil: ["Ship", "Crop", "Soap", "Shut"]
      },
      correctIndex: 1
    },
    {
      id: "adult_l2_4",
      question: {
      English: "What sound does the letter 'W' make in 'Water'?",
      Hindi: "'Water' (पानी) में अक्षर 'W' की ध्वनि क्या है?",
      Kannada: "'Water' ಪದದಲ್ಲಿ 'W' ಅಕ್ಷರವು ಯಾವ ಧ್ವನಿಯನ್ನು ಮಾಡುತ್ತದೆ?",
      Telugu: "'Water' లో 'W' అక్షరం చేసే శబ్దం ఏది?",
      Tamil: "'Water' என்ற வார்த்தையில் 'W' என்ற எழுத்து எழுப்பும் ஒலி என்ன?"
      },
      options: {
      English: ["vah", "sah", "kah", "wah"],
      Hindi: ["व (vah)", "स (sah)", "क (kah)", "व (wah)"],
      Kannada: ["ವ (vah)", "ಸ (sah)", "ಕ (kah)", "ವ (wah)"],
      Telugu: ["వ (vah)", "స (sah)", "క (kah)", "వ (wah)"],
      Tamil: ["வ (vah)", "ஸ (sah)", "க (kah)", "வ (wah)"]
      },
      correctIndex: 3
    },
    {
      id: "adult_l2_5",
      question: {
      English: "Which word starts with the 'O' sound?",
      Hindi: "कौन सा शब्द 'O' की ध्वनि से शुरू होता है?",
      Kannada: "ಯಾವ ಪದವು 'O' ಧ್ವನಿಯಿಂದ ಪ್ರಾರಂಭವಾಗುತ್ತದೆ?",
      Telugu: "ఏ పదం 'O' శబ్దంతో ప్రారంభమవుతుంది?",
      Tamil: "எந்த வார்த்தை 'O' ஒலியில் தொடங்குகிறது?"
      },
      options: {
      English: ["Bank", "Market", "Home", "Office"],
      Hindi: ["Bank (बैंक)", "Market (बाज़ार)", "Home (घर)", "Office (दफ्तर)"],
      Kannada: ["Bank (ಬ್ಯಾಂಕ್)", "Market (ಮಾರುಕಟ್ಟೆ)", "Home (ಮನೆ)", "Office (ಕಚೇರಿ)"],
      Telugu: ["Bank (బ్యాంకు)", "Market (మార్కెట్)", "Home (ఇల్లు)", "Office (కార్యాలయం)"],
      Tamil: ["Bank (வங்கி)", "Market (சந்தை)", "Home (வீடு)", "Office (அலுவலகம்)"]
      },
      correctIndex: 3
    },
    {
      id: "adult_l2_6",
      question: {
      English: "Which word ends with the 's' sound?",
      Hindi: "कौन सा शब्द 's' की ध्वनि पर समाप्त होता है?",
      Kannada: "ಯಾವ ಪದವು 's' ಧ್ವನಿಯೊಂದಿಗೆ ಕೊನೆಗೊಳ್ಳುತ್ತದೆ?",
      Telugu: "ఏ పదం 's' శబ్దంతో ముగుస్తుంది?",
      Tamil: "எந்த வார்த்தை 's' ஒலியில் முடிகிறது?"
      },
      options: {
      English: ["Bag", "Car", "Bus", "Van"],
      Hindi: ["Bag (बस्ता)", "Car (कार)", "Bus (बस)", "Van (वैन)"],
      Kannada: ["Bag (ಚೀಲ)", "Car (ಕಾರು)", "Bus (ಬಸ್ಸು)", "Van (ವ್ಯಾನ್)"],
      Telugu: ["Bag (సంచీ)", "Car (కారు)", "Bus (బస్సు)", "Van (వ్యాన్)"],
      Tamil: ["Bag (பைய்)", "Car (கார்)", "Bus (பேருந்து)", "Van (வேன்)"]
      },
      correctIndex: 2
    },
    {
      id: "adult_l2_7",
      question: {
      English: "Identify the missing vowel: 'M_lk'.",
      Hindi: "छूटा हुआ स्वर पहचानें: 'M_lk' (दूध)।",
      Kannada: "ಬಿಟ್ಟುಹೋದ ಸ್ವರವನ್ನು ಗುರುತಿಸಿ: 'M_lk'.",
      Telugu: "పదంలో లేని అచ్చును గుర్తించండి: 'M_lk'.",
      Tamil: "விடுபட்ட உயிர் எழுத்தைக் கண்டறியவும்: 'M_lk'."
      },
      options: {
      English: ["a", "i", "e", "o"],
      Hindi: ["a", "i", "e", "o"],
      Kannada: ["a", "i", "e", "o"],
      Telugu: ["a", "i", "e", "o"],
      Tamil: ["a", "i", "e", "o"]
      },
      correctIndex: 1
    },
    {
      id: "adult_l2_8",
      question: {
      English: "Which word starts with the 'Tr' blend sound?",
      Hindi: "कौन सा शब्द 'Tr' की संयुक्त ध्वनि से शुरू होता है?",
      Kannada: "ಯಾವ ಪದವು 'Tr' ಧ್ವನಿಯಿಂದ ಪ್ರಾರಂಭವಾಗುತ್ತದೆ?",
      Telugu: "ఏ పదం 'Tr' శబ్దంతో ప్రారంభమవుతుంది?",
      Tamil: "எந்த வார்த்தை 'Tr' ஒலியில் தொடங்குகிறது?"
      },
      options: {
      English: ["Ticket", "Town", "Train", "Tax"],
      Hindi: ["Ticket (टिकट)", "Town (कस्बा)", "Train (ट्रेन)", "Tax (कर)"],
      Kannada: ["Ticket (ಟಿಕೆಟ್)", "Town (ಪಟ್ಟಣ)", "Train (ರೈಲು)", "Tax (ತೆರಿಗೆ)"],
      Telugu: ["Ticket (టికెట్)", "Town (పట్టణం)", "Train (రైలు)", "Tax (పన్ను)"],
      Tamil: ["Ticket (சீட்டு)", "Town (நகரம்)", "Train (ரயில்)", "Tax (வரி)"]
      },
      correctIndex: 2
    },
    {
      id: "adult_l2_9",
      question: {
      English: "What sound does the double 'o' make in 'Food'?",
      Hindi: "'Food' (भोजन) में दोहरे 'o' की ध्वनि क्या है?",
      Kannada: "'Food' ಪದದಲ್ಲಿ ಡಬಲ್ 'o' ಯಾವ ಧ್ವನಿಯನ್ನು ಮಾಡುತ್ತದೆ?",
      Telugu: "'Food' లో డబుల్ 'o' చేసే శబ్దం ఏది?",
      Tamil: "'Food' என்ற வார்த்தையில் இரட்டை 'o' எழுப்பும் ஒலி என்ன?"
      },
      options: {
      English: ["ah", "oh", "ee", "oo"],
      Hindi: ["आ (ah)", "ओ (oh)", "ई (ee)", "ऊ (oo)"],
      Kannada: ["ಆ (ah)", "ಓ (oh)", "ಈ (ee)", "ಊ (oo)"],
      Telugu: ["ఆ (ah)", "ఓ (oh)", "ఈ (ee)", "ఊ (oo)"],
      Tamil: ["ஆ (ah)", "ஓ (oh)", "ஈ (ee)", "ஊ (oo)"]
      },
      correctIndex: 3
    },
    {
      id: "adult_l2_10",
      question: {
      English: "Which word rhymes with 'Pay'?",
      Hindi: "कौन सा शब्द 'Pay' के साथ तुकबंदी करता है?",
      Kannada: "ಯಾವ ಪದವು 'Pay' ನೊಂದಿಗೆ ಪ್ರಾಸಬದ್ಧವಾಗಿದೆ?",
      Telugu: "'Pay' తో ప్రాస కలిసే పదం ఏది?",
      Tamil: "'Pay' என்ற ஒலியுடன் ஒத்துப்போகும் வார்த்தை எது?"
      },
      options: {
      English: ["Den", "Dig", "Day", "Dog"],
      Hindi: ["Den (गुफा)", "Dig (खोदना)", "Day (दिन)", "Dog (कुत्ता)"],
      Kannada: ["Den (ಗುಹೆ)", "Dig (ಅಗೆಯು)", "Day (ದಿನ)", "Dog (ನಾಯಿ)"],
      Telugu: ["Den (గుహ)", "Dig (తవ్వడం)", "Day (రోజు)", "Dog (కుక్క)"],
      Tamil: ["Den (குகை)", "Dig (தோண்டு)", "Day (நாள்)", "Dog (நாய்)"]
      },
      correctIndex: 2
    }
    ]
  },
  adult_level_3: {
    title: {
    English: "Level 3 Assessment (ADULT)",
    Hindi: "स्तर 3 आकलन (वयस्क)",
    Kannada: "ಹಂತ 3 ಮೌಲ್ಯಮಾಪನ (ವಯಸ್ಕರು)",
    Telugu: "స్థాయి 3 అంచనా (వయోజనులు)",
    Tamil: "நிலை 3 மதிப்பீடு (பெரியவர்கள்)"
    },
    description: {
    English: "Test checking capability at Level 3 for adult learners.",
    Hindi: "वयस्क शिक्षार्थियों के लिए स्तर 3 क्षमता का परीक्षण।",
    Kannada: "ಕಲಿಯುವವರಿಗೆ ಹಂತ 3 ಸಾಮರ್ಥ್ಯವನ್ನು ಪರಿಶೀಲಿಸುವ ಪರೀಕ್ಷೆ.",
    Telugu: "అభ్యాసకుల కోసం స్థాయి 3 సామర్థ్య పరీక్ష.",
    Tamil: "கற்பவர்களுக்கான நிலை 3 திறனைச் சோதிக்கும் மதிப்பீடு."
    },
    questions: [
    {
      id: "adult_l3_1",
      question: {
      English: "Choose the correct spelling for the daily workplace place:",
      Hindi: "दैनिक कार्यस्थल के लिए सही वर्तनी (spelling) चुनें:",
      Kannada: "ದೈನಂದಿನ ಕೆಲಸದ ಸ್ಥಳದ ಸರಿಯಾದ ಕಾಗುಣಿತವನ್ನು ಆರಿಸಿ:",
      Telugu: "కార్యాలయం యొక్క సరైన స్పెల్లింగ్‌ను ఎంచుకోండి:",
      Tamil: "பணிபுரியும் இடத்தின் சரியான எழுத்துப்பிழையைத் தேர்ந்தெடுக்கவும்:"
      },
      options: {
      English: ["Ofice", "Office", "Officce", "Offise"],
      Hindi: ["Ofice", "Office", "Officce", "Offise"],
      Kannada: ["Ofice", "Office", "Officce", "Offise"],
      Telugu: ["Ofice", "Office", "Officce", "Offise"],
      Tamil: ["Ofice", "Office", "Officce", "Offise"]
      },
      correctIndex: 1
    },
    {
      id: "adult_l3_2",
      question: {
      English: "Find the spelling of the monthly money earned:",
      Hindi: "हर महीने अर्जित किए जाने वाले धन (वेतन) की वर्तनी खोजें:",
      Kannada: "ಪ್ರತಿ ತಿಂಗಳು ಗಳಿಸುವ ಹಣದ (ಸಂಬಳ) ಪದವನ್ನು ಹುಡುಕಿ:",
      Telugu: "నెలవారీ సంపాదన (జీతం) యొక్క సరైన స్పెల్లింగ్ కనుగొనండి:",
      Tamil: "மாதாந்திர வருமானத்தின் (சம்பளம்) சரியான எழுத்துப்பிழையைக் கண்டறியவும்:"
      },
      options: {
      English: ["Salary", "Salarie", "Salari", "Salery"],
      Hindi: ["Salary", "Salarie", "Salari", "Salery"],
      Kannada: ["Salary", "Salarie", "Salari", "Salery"],
      Telugu: ["Salary", "Salarie", "Salari", "Salery"],
      Tamil: ["Salary", "Salarie", "Salari", "Salery"]
      },
      correctIndex: 0
    },
    {
      id: "adult_l3_3",
      question: {
      English: "Identify the correct spelling of the place where we buy groceries:",
      Hindi: "किराने का सामान खरीदने के स्थान की सही वर्तनी पहचानें:",
      Kannada: "ನಾವು ದಿನಸಿ ಖರೀದಿಸುವ ಸ್ಥಳದ ಸರಿಯಾದ ಕಾಗುಣಿತವನ್ನು ಗುರುತಿಸಿ:",
      Telugu: "మనం నిత్యావసరాలు కొనే స్థలం యొక్క సరైన స్పెల్లింగ్ కనుగొనండి:",
      Tamil: "நாம் மளிகைப் பொருட்கள் வாங்கும் இடத்தின் சரியான எழுத்துப்பிழையைக் கண்டறியவும்:"
      },
      options: {
      English: ["Markut", "Market", "Marquet", "Markit"],
      Hindi: ["Markut", "Market", "Marquet", "Markit"],
      Kannada: ["Markut", "Market", "Marquet", "Markit"],
      Telugu: ["Markut", "Market", "Marquet", "Markit"],
      Tamil: ["Markut", "Market", "Marquet", "Markit"]
      },
      correctIndex: 1
    },
    {
      id: "adult_l3_4",
      question: {
      English: "Choose the correct spelling of the paper that tells us the price of goods:",
      Hindi: "सामान की कीमत बताने वाले कागज (बिल) की सही वर्तनी चुनें:",
      Kannada: "ವಸ್ತುಗಳ ಬೆಲೆಯನ್ನು ತಿಳಿಸುವ ಕಾಗದದ (ಬಿಲ್ಲು) ಸರಿಯಾದ ಕಾಗುಣಿತವನ್ನು ಆರಿಸಿ:",
      Telugu: "వస్తువుల ధరను తెలిపే కాగితం (బిల్లు) యొక్క సరైన స్పెల్లింగ్ ఎంచుకోండి:",
      Tamil: "பொருட்களின் விலையைக் கூறும் சீட்டின் (பற்றுச்சீட்டு) சரியான எழுத்துப்பிழையைத் தேர்ந்தெடுக்கவும்:"
      },
      options: {
      English: ["Reciept", "Receipte", "Receipt", "Recipt"],
      Hindi: ["Reciept", "Receipte", "Receipt", "Recipt"],
      Kannada: ["Reciept", "Receipte", "Receipt", "Recipt"],
      Telugu: ["Reciept", "Receipte", "Receipt", "Recipt"],
      Tamil: ["Reciept", "Receipte", "Receipt", "Recipt"]
      },
      correctIndex: 2
    },
    {
      id: "adult_l3_5",
      question: {
      English: "Find the spelling of the place where we deposit money:",
      Hindi: "पैसे जमा करने के स्थान की वर्तनी खोजें (बैंक):",
      Kannada: "ನಾವು ಹಣವನ್ನು ಠೇವಣಿ ಮಾಡುವ ಸ್ಥಳದ ಕಾಗುಣಿತವನ್ನು ಹುಡುಕಿ (ಬ್ಯಾಂಕ್):",
      Telugu: "మనం డబ్బులు దాచుకునే స్థలం యొక్క సరైన స్పెల్లింగ్ కనుగొనండి (బ్యాంకు):",
      Tamil: "பணம் சேமிக்கும் இடத்தின் சரியான எழுத்துப்பிழையைக் கண்டறியவும் (வங்கி):"
      },
      options: {
      English: ["Benk", "Benc", "Bank", "Banc"],
      Hindi: ["Benk", "Benc", "Bank", "Banc"],
      Kannada: ["Benk", "Benc", "Bank", "Banc"],
      Telugu: ["Benk", "Benc", "Bank", "Banc"],
      Tamil: ["Benk", "Benc", "Bank", "Banc"]
      },
      correctIndex: 2
    },
    {
      id: "adult_l3_6",
      question: {
      English: "What is the opposite word for 'Buy'?",
      Hindi: "'Buy' (खरीदना) का विपरीत शब्द क्या है?",
      Kannada: "'Buy' ಪದದ ವಿರುದ್ಧ ಪದ ಯಾವುದು?",
      Telugu: "'Buy' అనే పదానికి వ్యతిరేక పదం ఏది?",
      Tamil: "'Buy' என்ற வார்த்தையின் எதிர்ச்சொல் எது?"
      },
      options: {
      English: ["Take", "Keep", "Sell", "Pay"],
      Hindi: ["Take (लेना)", "Keep (रखना)", "Sell (बेचना)", "Pay (भुगतान)"],
      Kannada: ["Take (ತೆಗೆದುಕೋ)", "Keep (ಇರಿಸಿಕೋ)", "Sell (ಮಾರು)", "Pay (ಪಾವತಿಸು)"],
      Telugu: ["Take (తీసుకోవడం)", "Keep (ఉంచుకోవడం)", "Sell (అమ్మడం)", "Pay (చెల్లించడం)"],
      Tamil: ["Take (எடு)", "Keep (வை)", "Sell (விற்பனை)", "Pay (செலுத்து)"]
      },
      correctIndex: 2
    },
    {
      id: "adult_l3_7",
      question: {
      English: "Find the correct spelling of the vehicle used for public travel:",
      Hindi: "सार्वजनिक यात्रा के लिए उपयोग किए जाने वाले वाहन की सही वर्तनी खोजें (बस):",
      Kannada: "ಸಾರ್ವಜನಿಕ ಪ್ರಯಾಣಕ್ಕೆ ಬಳಸುವ ವಾಹನದ ಸರಿಯಾದ ಕಾಗುಣಿತವನ್ನು ಹುಡುಕಿ (ಬಸ್ಸು):",
      Telugu: "ప్రజా రవాణాకు ఉపయోగించే వాహనం యొక్క సరైన స్పెల్లింగ్ కనుగొనండి (బస్సు):",
      Tamil: "பொதுப் போக்குவரத்திற்குப் பயன்படும் வாகனத்தின் சரியான எழுத்துப்பிழையைக் கண்டறியவும் (பேருந்து):"
      },
      options: {
      English: ["Bis", "Bus", "Bas", "Bos"],
      Hindi: ["Bis", "Bus", "Bas", "Bos"],
      Kannada: ["Bis", "Bus", "Bas", "Bos"],
      Telugu: ["Bis", "Bus", "Bas", "Bos"],
      Tamil: ["Bis", "Bus", "Bas", "Bos"]
      },
      correctIndex: 1
    },
    {
      id: "adult_l3_8",
      question: {
      English: "Which word describes the action of giving money for goods?",
      Hindi: "कौन सा शब्द माल के लिए पैसे देने की क्रिया को दर्शाता है?",
      Kannada: "ಯಾವ ಪದವು ವಸ್ತುಗಳಿಗೆ ಹಣವನ್ನು ಪಾವತಿಸುವ ಕ್ರಿಯೆಯನ್ನು ವಿವರಿಸುತ್ತದೆ?",
      Telugu: "వస్తువులకు డబ్బులు ఇచ్చే క్రియను ఏ పదం సూచిస్తుంది?",
      Tamil: "பொருட்களுக்குப் பணம் செலுத்தும் செயலைக் குறிக்கும் வார்த்தை எது?"
      },
      options: {
      English: ["Lose", "Get", "Pay", "Sell"],
      Hindi: ["Lose (खोना)", "Get (पाना)", "Pay (भुगतान)", "Sell (बेचना)"],
      Kannada: ["Lose (ಕಳೆದುಕೋ)", "Get (ಪಡೆ)", "Pay (ಪಾವತಿಸು)", "Sell (ಮಾರು)"],
      Telugu: ["Lose (పోగొట్టుకోవడం)", "Get (పొందడం)", "Pay (చెల్లించడం)", "Sell (అమ్మడం)"],
      Tamil: ["Lose (இழத்தல்)", "Get (பெறுதல்)", "Pay (பணம் செலுத்துதல்)", "Sell (விற்பனை செய்தல்)"]
      },
      correctIndex: 2
    },
    {
      id: "adult_l3_9",
      question: {
      English: "Find the spelling of the day we receive weekly off:",
      Hindi: "साप्ताहिक अवकाश वाले दिन की वर्तनी खोजें (रविवार):",
      Kannada: "ವಾರದ ರಜಾದಿನದ ಕಾಗುಣಿತವನ್ನು ಹುಡುಕಿ (ಭಾನುವಾರ):",
      Telugu: "వారపు సెలవు దినం యొక్క సరైన స్పెల్లింగ్ కనుగొనండి (ఆదివారం):",
      Tamil: "வாராந்திர விடுமுறை நாளின் சரியான எழுத்துப்பிழையைக் கண்டறியவும் (ஞாயிற்றுக்கிழமை):"
      },
      options: {
      English: ["Sunday", "Sonday", "Sundae", "Sanday"],
      Hindi: ["Sunday", "Sonday", "Sundae", "Sanday"],
      Kannada: ["Sunday", "Sonday", "Sundae", "Sanday"],
      Telugu: ["Sunday", "Sonday", "Sundae", "Sanday"],
      Tamil: ["Sunday", "Sonday", "Sundae", "Sanday"]
      },
      correctIndex: 0
    },
    {
      id: "adult_l3_10",
      question: {
      English: "Choose the correct spelling of the place where we catch a train:",
      Hindi: "हम जहां ट्रेन पकड़ते हैं उस स्थान की सही वर्तनी चुनें (स्टेशन):",
      Kannada: "ನಾವು ರೈಲು ಹತ್ತುವ ಸ್ಥಳದ ಸರಿಯಾದ ಕಾಗುಣಿತವನ್ನು ಆರಿಸಿ (ನಿಲ್ದಾಣ):",
      Telugu: "మనం రైలు ఎక్కే స్థలం యొక్క సరైన స్పెల్లింగ్‌ను ఎంచుకోండి (స్టేషన్):",
      Tamil: "நாம் ரயில் ஏறும் இடத்தின் சரியான எழுத்துப்பிழையைத் தேர்ந்தெடுக்கவும் (நிலையம்):"
      },
      options: {
      English: ["Stashun", "Statian", "Stasion", "Station"],
      Hindi: ["Stashun", "Statian", "Stasion", "Station"],
      Kannada: ["Stashun", "Statian", "Stasion", "Station"],
      Telugu: ["Stashun", "Statian", "Stasion", "Station"],
      Tamil: ["Stashun", "Statian", "Stasion", "Station"]
      },
      correctIndex: 3
    }
    ]
  },
  adult_level_4: {
    title: {
    English: "Level 4 Assessment (ADULT)",
    Hindi: "स्तर 4 आकलन (वयस्क)",
    Kannada: "ಹಂತ 4 ಮೌಲ್ಯಮಾಪನ (ವಯಸ್ಕರು)",
    Telugu: "స్థాయి 4 అంచనా (వయోజనులు)",
    Tamil: "நிலை 4 மதிப்பீடு (பெரியவர்கள்)"
    },
    description: {
    English: "Test checking capability at Level 4 for adult learners.",
    Hindi: "वयस्क शिक्षार्थियों के लिए स्तर 4 क्षमता का परीक्षण।",
    Kannada: "ಕಲಿಯುವವರಿಗೆ ಹಂತ 4 ಸಾಮರ್ಥ್ಯವನ್ನು ಪರಿಶೀಲಿಸುವ ಪರೀಕ್ಷೆ.",
    Telugu: "అభ్యాసకుల కోసం స్థాయి 4 సామర్థ్య పరీక్ష.",
    Tamil: "கற்பவர்களுக்கான நிலை 4 திறனைச் சோதிக்கும் மதிப்பீடு."
    },
    questions: [
    {
      id: "adult_l4_1",
      question: {
      English: "Complete: 'Please sign this form at the ______.'",
      Hindi: "पूरा करें: 'Please sign this form at the ______.'",
      Kannada: "ಪೂರ್ಣಗೊಳಿಸಿ: 'Please sign this form at the ______.'",
      Telugu: "పూర్తి చేయండి: 'Please sign this form at the ______.'",
      Tamil: "வாக்கியத்தை நிரப்புக: 'Please sign this form at the ______.'"
      },
      options: {
      English: ["bottom", "top", "back", "middle"],
      Hindi: ["bottom (नीचे)", "top (ऊपर)", "back (पीछे)", "middle (बीच)"],
      Kannada: ["bottom (ಕೆಳಗೆ)", "top (ಮೇಲೆ)", "back (ಹಿಂದೆ)", "middle (ಮಧ್ಯೆ)"],
      Telugu: ["bottom (కింద)", "top (పైన)", "back (వెనుక)", "middle (మధ్య)"],
      Tamil: ["bottom (கீழே)", "top (மேலே)", "back (பின்னால்)", "middle (நடுவில்)"]
      },
      correctIndex: 0
    },
    {
      id: "adult_l4_2",
      question: {
      English: "Read the sign: 'NO PARKING'. What should you do?",
      Hindi: "बोर्ड पढ़ें: 'NO PARKING' (पार्किंग निषेध)। आपको क्या करना चाहिए?",
      Kannada: "ಚಿಹ್ನೆಯನ್ನು ಓದಿ: 'NO PARKING'. ನೀವು ಏನು ಮಾಡಬೇಕು?",
      Telugu: "'NO PARKING' బోర్డు చదవండి. మీరు ఏమి చేయాలి?",
      Tamil: "'NO PARKING' பலகையைப் படிக்கவும். நீங்கள் என்ன செய்ய வேண்டும்?"
      },
      options: {
      English: ["Wash your car here", "Park your vehicle here", "Speed up", "Do not leave your vehicle here"],
      Hindi: ["अपनी कार यहाँ धोएँ", "अपना वाहन यहाँ पार्क करें", "गति बढ़ाएँ", "अपना वाहन यहाँ न छोड़ें"],
      Kannada: ["ಇಲ್ಲಿ ಕಾರು ತೊಳೆಯಿರಿ", "ಇಲ್ಲೇ ವಾಹನ ನಿಲ್ಲಿಸಿ", "ವೇಗವನ್ನು ಹೆಚ್ಚಿಸಿ", "ಇಲ್ಲಿ ನಿಮ್ಮ ವಾಹನವನ್ನು ನಿಲ್ಲಿಸಬೇಡಿ"],
      Telugu: ["ఇక్కడ కారు కడగాలి", "మీ వాహనాన్ని ఇక్కడే నిలపాలి", "వేగం పెంచాలి", "మీ వాహనాన్ని ఇక్కడ నిలపకూడదు"],
      Tamil: ["இங்கு காரைக் கழுவலாம்", "வாகனத்தை இங்கு நிறுத்தலாம்", "வேகமாகச் செல்லவும்", "உங்கள் வாகனத்தை இங்கு நிறுத்தக் கூடாது"]
      },
      correctIndex: 3
    },
    {
      id: "adult_l4_3",
      question: {
      English: "Complete: 'The office hours are 9 AM to 5 ______.'",
      Hindi: "पूरा करें: 'The office hours are 9 AM to 5 ______.'",
      Kannada: "ಪೂರ್ಣಗೊಳಿಸಿ: 'The office hours are 9 AM to 5 ______.'",
      Telugu: "పూర్తి చేయండి: 'The office hours are 9 AM to 5 ______.'",
      Tamil: "வாக்கியத்தை நிரப்புக: 'The office hours are 9 AM to 5 ______.'"
      },
      options: {
      English: ["PM", "Night", "O'clock", "AM"],
      Hindi: ["PM (शाम)", "Night (रात)", "O'clock (बजे)", "AM (सुबह)"],
      Kannada: ["PM (ಸಂಜೆ)", "Night (ರಾತ್ರಿ)", "O'clock (ಗಂಟೆ)", "AM (ಬೆಳಿಗ್ಗೆ)"],
      Telugu: ["PM (సాయంత్రం)", "Night (రాత్రి)", "O'clock (గంటలు)", "AM (ఉదయం)"],
      Tamil: ["PM (மாலை)", "Night (இரவு)", "O'clock (மணி)", "AM (காலை)"]
      },
      correctIndex: 0
    },
    {
      id: "adult_l4_4",
      question: {
      English: "Read the sign: 'PUSH'. What does it mean on a glass door?",
      Hindi: "संकेत पढ़ें: 'PUSH' (धकेलें)। कांच के दरवाजे पर इसका क्या अर्थ है?",
      Kannada: "ಚಿಹ್ನೆಯನ್ನು ಓದಿ: 'PUSH'. ಬಾಗಿಲಿನ ಮೇಲೆ ಇದರ ಅರ್ಥವೇನು?",
      Telugu: "'PUSH' బోర్డు చదవండి. తలుపు మీద దీని అర్థం ఏమిటి?",
      Tamil: "'PUSH' பலகையைப் படிக்கவும். கதவில் இதன் பொருள் என்ன?"
      },
      options: {
      English: ["Do not open", "Pull towards you", "Slide to side", "Push away from you"],
      Hindi: ["न खोलें", "अपनी ओर खींचें", "किनारे खिसकाएं", "अपने से दूर धकेलें"],
      Kannada: ["ತೆರೆಯಬೇಡಿ", "ಹಿಂದಕ್ಕೆ ಎಳೆಯಿರಿ", "ಪಕ್ಕಕ್ಕೆ ಸರಿಸಿ", "ಮುಂದಕ್ಕೆ ತಳ್ಳಿರಿ"],
      Telugu: ["తెరవకూడదు", "వెనుకకు లాగాలి", "పక్కకు జరపాలి", "ముందుకు నెట్టాలి"],
      Tamil: ["திறக்கக் கூடாது", "பின்னால் இழுக்கவும்", "பக்கவாட்டில் நகர்த்தவும்", "முன்னால் தள்ளவும்"]
      },
      correctIndex: 3
    },
    {
      id: "adult_l4_5",
      question: {
      English: "Complete: 'Please pay the bill at the ______.'",
      Hindi: "पूरा करें: 'Please pay the bill at the ______.'",
      Kannada: "ಪೂರ್ಣಗೊಳಿಸಿ: 'Please pay the bill at the ______.'",
      Telugu: "పూర్తి చేయండి: 'Please pay the bill at the ______.'",
      Tamil: "வாக்கியத்தை நிரப்புக: 'Please pay the bill at the ______.'"
      },
      options: {
      English: ["counter", "table", "floor", "chair"],
      Hindi: ["counter (काउंटर)", "table (मेज़)", "floor (फर्श)", "chair (कुर्सी)"],
      Kannada: ["counter (ಕೌಂಟರ್)", "table (ಮೇಜು)", "floor (ನೆಲ)", "chair (ಕುರ್ಚಿ)"],
      Telugu: ["counter (కౌంటర్)", "table (బల్ల)", "floor (నేల)", "chair (కుర్చీ)"],
      Tamil: ["counter (கவுண்டர்)", "table (மேஜை)", "floor (தரை)", "chair (நாற்காலி)"]
      },
      correctIndex: 0
    },
    {
      id: "adult_l4_6",
      question: {
      English: "Read the sign: 'NO SMOKING'. Where is this usually placed?",
      Hindi: "संकेत पढ़ें: 'NO SMOKING' (धूम्रपान निषेध)। यह आमतौर पर कहाँ रखा जाता है?",
      Kannada: "ಚಿಹ್ನೆಯನ್ನು ಓದಿ: 'NO SMOKING'. ಇದನ್ನು ಸಾಮಾನ್ಯವಾಗಿ ಎಲ್ಲಿ ಇರಿಸಲಾಗುತ್ತದೆ?",
      Telugu: "'NO SMOKING' బోర్డు చదవండి. సాధారణంగా దీనిని ఎక్కడ పెడతారు?",
      Tamil: "'NO SMOKING' பலகையைப் படிக்கவும். இது பொதுவாக எங்கு வைக்கப்பட்டிருக்கும்?"
      },
      options: {
      English: ["Inside a kitchen", "Public places", "On a road crossing", "Inside a stadium only"],
      Hindi: ["रसोई के भीतर", "सार्वजनिक स्थानों पर", "सड़क चौराहे पर", "केवल स्टेडियम के भीतर"],
      Kannada: ["ಅಡುಗೆಮನೆಯ ಒಳಗೆ", "ಸಾರ್ವಜನಿಕ ಸ್ಥಳಗಳಲ್ಲಿ", "ರಸ್ತೆ ದಾಟುವ ಸ್ಥಳದಲ್ಲಿ", "ಕ್ರೀಡಾಂಗಣದ ಒಳಗೆ ಮಾತ್ರ"],
      Telugu: ["వంటగది లోపల", "పబ్లిక్ ప్రదేశాలలో", "రహదారి కూడలి వద్ద", "స్టేడియం లోపల మాత్రమే"],
      Tamil: ["சமையலறையின் உள்ளே", "பொது இடங்களில்", "சாலை சந்திப்பில்", "விளையாட்டு அரங்கில் மட்டும்"]
      },
      correctIndex: 1
    },
    {
      id: "adult_l4_7",
      question: {
      English: "Complete: 'The bus leaves from platform number ______.'",
      Hindi: "पूरा करें: 'The bus leaves from platform number ______.'",
      Kannada: "ಪೂರ್ಣಗೊಳಿಸಿ: 'The bus leaves from platform number ______.'",
      Telugu: "పూర్తి చేయండి: 'The bus leaves from platform number ______.'",
      Tamil: "வாக்கியத்தை நிரப்புக: 'The bus leaves from platform number ______.'"
      },
      options: {
      English: ["blue", "three", "bus", "road"],
      Hindi: ["blue (नीला)", "three (तीन)", "bus (बस)", "road (सड़क)"],
      Kannada: ["blue (ಕೆಂಪು)", "three (ಮೂರು)", "bus (ಬಸ್ಸು)", "road (ರಸ್ತೆ)"],
      Telugu: ["blue (నీలం)", "three (మూడు)", "bus (బస్సు)", "road (రోడ్డు)"],
      Tamil: ["blue (நீலம்)", "three (மூன்று)", "bus (பேருந்து)", "road (சாலை)"]
      },
      correctIndex: 1
    },
    {
      id: "adult_l4_8",
      question: {
      English: "Read the sign: 'AUTHORIZED PERSONNEL ONLY'. Who can enter?",
      Hindi: "संकेत पढ़ें: 'AUTHORIZED PERSONNEL ONLY' (केवल अधिकृत कर्मचारी)। कौन प्रवेश कर सकता है?",
      Kannada: "ಚಿಹ್ನೆಯನ್ನು ಓದಿ: 'AUTHORIZED PERSONNEL ONLY'. ಯಾರು ಪ್ರವೇಶಿಸಬಹುದು?",
      Telugu: "'AUTHORIZED PERSONNEL ONLY' బోర్డు చదవండి. ఎవరు లోపలికి వెళ్ళవచ్చు?",
      Tamil: "'AUTHORIZED PERSONNEL ONLY' பலகையைப் படிக்கவும். யார் உள்ளே செல்லலாம்?"
      },
      options: {
      English: ["Nobody at all", "Any customer", "Only staff with permission", "Children only"],
      Hindi: ["कोई भी नहीं", "कोई भी ग्राहक", "केवल अनुमति प्राप्त कर्मचारी", "केवल बच्चे"],
      Kannada: ["ಯಾರೂ ಇಲ್ಲ", "ಯಾವ ಗ್ರಾಹಕರಾದರೂ", "ಅನುಮತಿ ಪಡೆದ ಸಿಬ್ಬಂದಿ ಮಾತ್ರ", "ಮಕ್ಕಳು ಮಾತ್ರ"],
      Telugu: ["ఎవరూ వెళ్లకూడదు", "ఏ వినియోగదారుడైనా", "అనుమతి పొందిన సిబ్బంది మాత్రమే", "పిల్లలు మాత్రమే"],
      Tamil: ["யாரும் செல்லக் கூடாது", "அனைத்து வாடிக்கையாளர்கள்", "அனுமதி பெற்ற ஊழியர்கள் மட்டும்", "குழந்தைகள் மட்டும்"]
      },
      correctIndex: 2
    },
    {
      id: "adult_l4_9",
      question: {
      English: "Complete: 'To withdraw money, visit the ______.'",
      Hindi: "पूरा करें: 'To withdraw money, visit the ______.'",
      Kannada: "ಪೂರ್ಣಗೊಳಿಸಿ: 'To withdraw money, visit the ______.'",
      Telugu: "పూర్తి చేయండి: 'To withdraw money, visit the ______.'",
      Tamil: "வாக்கியத்தை நிரப்புக: 'To withdraw money, visit the ______.'"
      },
      options: {
      English: ["shop", "park", "school", "bank"],
      Hindi: ["shop (दुकान)", "park (पार्क)", "school (स्कूल)", "bank (बैंक)"],
      Kannada: ["shop (ಅಂಗಡಿ)", "park (ಉದ್ಯಾನವನ)", "school (ಶಾಲೆ)", "bank (ಬ್ಯಾಂಕ್)"],
      Telugu: ["shop (దుకాణం)", "park (పార్క్)", "school (బడి)", "bank (బ్యాంకు)"],
      Tamil: ["shop (கடை)", "park (பூங்கா)", "school (பள்ளி)", "bank (வங்கி)"]
      },
      correctIndex: 3
    },
    {
      id: "adult_l4_10",
      question: {
      English: "Read the sign: 'KEEP LEFT'. What should a driver do?",
      Hindi: "संकेत पढ़ें: 'KEEP LEFT' (बाएं रहें)। चालक को क्या करना चाहिए?",
      Kannada: "ಚಿಹ್ನೆಯನ್ನು ಓದಿ: 'KEEP LEFT'. ಚಾಲಕ ಏನು ಮಾಡಬೇಕು?",
      Telugu: "'KEEP LEFT' బోర్డు చదవండి. డ్రైవర్ ఏమి చేయాలి?",
      Tamil: "'KEEP LEFT' பலகையைப் படிக்கவும். ஓட்டுநர் என்ன செய்ய வேண்டும்?"
      },
      options: {
      English: ["Stop driving", "Drive on left side", "Drive on right side", "Turn around"],
      Hindi: ["ड्राइविंग बंद करें", "बाईं ओर ड्राइव करें", "दाईं ओर ड्राइव करें", "वापस मुड़ें"],
      Kannada: ["ಚಾಲನೆ ನಿಲ್ಲಿಸಿ", "ಎಡಭಾಗದಲ್ಲಿ ಚಲಿಸಿ", "ಬಲಭಾಗದಲ್ಲಿ ಚಲಿಸಿ", "ಹಿಂದಕ್ಕೆ ತಿರುಗಿ"],
      Telugu: ["వాహనం ఆపాలి", "ఎడమ వైపున ప్రయాణించాలి", "కుడి వైపున ప్రయాణించాలి", "వెనుకకు తిరగాలి"],
      Tamil: ["வாகனம் ஓட்டுவதை நிறுத்தவும்", "இடது பக்கமாக ஓட்டவும்", "வலது பக்கமாக ஓட்டவும்", "திரும்பிச் செல்லவும்"]
      },
      correctIndex: 1
    }
    ]
  },
  adult_level_5: {
    title: {
    English: "Level 5 Assessment (ADULT)",
    Hindi: "स्तर 5 आकलन (वयस्क)",
    Kannada: "ಹಂತ 5 ಮೌಲ್ಯಮಾಪನ (ವಯಸ್ಕರು)",
    Telugu: "స్థాయి 5 అంచనా (వయోజనులు)",
    Tamil: "நிலை 5 மதிப்பீடு (பெரியவர்கள்)"
    },
    description: {
    English: "Test checking capability at Level 5 for adult learners.",
    Hindi: "वयस्क शिक्षार्थियों के लिए स्तर 5 क्षमता का परीक्षण।",
    Kannada: "ಕಲಿಯುವವರಿಗೆ ಹಂತ 5 ಸಾಮರ್ಥ್ಯವನ್ನು ಪರಿಶೀಲಿಸುವ ಪರೀಕ್ಷೆ.",
    Telugu: "అభ్యాసకుల కోసం స్థాయి 5 సామర్థ్య పరీక్ష.",
    Tamil: "கற்பவர்களுக்கான நிலை 5 திறனைச் சோதிக்கும் மதிப்பீடு."
    },
    questions: [
    {
      id: "adult_l5_1",
      question: {
      English: "Read this office instruction:\n\nAll employees must log their attendance before 9:30 AM. Late arrivals will be marked as half-day leave unless approved.\n\nWhat is the latest time to log attendance without being marked late?",
      Hindi: "इस कार्यालय निर्देश को पढ़ें:\n\nसभी कर्मचारियों को सुबह 9:30 बजे से पहले अपनी उपस्थिति दर्ज करनी होगी। देर से आने वालों को आधे दिन की छुट्टी माना जाएगा जब तक कि मंजूरी न दी गई हो।\n\nदेर से माने बिना उपस्थिति दर्ज करने का नवीनतम समय क्या है?",
      Kannada: "ಕಚೇರಿಯ ಈ ಸೂಚನೆಯನ್ನು ಓದಿ:\n\nಎಲ್ಲಾ ಉದ್ಯೋಗಿಗಳು ಬೆಳಿಗ್ಗೆ 9:30 ರ ಒಳಗೆ ಹಾಜರಾತಿಯನ್ನು ದಾಖಲಿಸಬೇಕು. ತಡವಾಗಿ ಬಂದರೆ ಅರ್ಧ ದಿನದ ರಜೆ ಎಂದು ಪರಿಗಣಿಸಲಾಗುವುದು.\n\nತಡವಾಗದಂತೆ ಹಾಜರಾತಿ ದಾಖಲಿಸಲು ಕೊನೆಯ ಸಮಯ ಯಾವುದು?",
      Telugu: "ఈ కార్యాలయ సూచనను చదవండి:\n\nఉద్యోగులందరూ ఉదయం 9:30 గంటల లోపు తమ హాజరును నమోదు చేయాలి. ఆలస్యంగా వస్తే హాఫ్ డే లీవ్ గా పరిగణించబడుతుంది.\n\nఆలస్యం కాకుండా హాజరు నమోదు చేయడానికి చివరి సమయం ఏది?",
      Tamil: "இந்த அலுவலக அறிவுறுத்தலைப் படிக்கவும்:\n\nஅனைத்து ஊழியர்களும் காலை 9:30 மணிக்குள் தங்கள் வருகையைப் பதிவு செய்ய வேண்டும். தாமதமாக வந்தால் அரை நாள் விடுப்பாகக் கருதப்படும்.\n\nதாமதமாக வருகை தராமல் பதிவு செய்வதற்கான கடைசி நேரம் என்ன?"
      },
      options: {
      English: ["9:30 AM", "9:00 AM", "9:45 AM", "10:00 AM"],
      Hindi: ["सुबह 9:30 बजे", "सुबह 9:00 बजे", "सुबह 9:45 बजे", "सुबह 10:00 बजे"],
      Kannada: ["ಬೆಳಿಗ್ಗೆ 9:30", "ಬೆಳಿಗ್ಗೆ 9:00", "ಬೆಳಿಗ್ಗೆ 9:45", "ಬೆಳಿಗ್ಗೆ 10:00"],
      Telugu: ["ఉదయం 9:30 గంటలకు", "ఉదయం 9:00 గంటలకు", "ఉదయం 9:45 గంటలకు", "ఉదయం 10:00 గంటలకు"],
      Tamil: ["காலை 9:30 மணி", "காலை 9:00 மணி", "காலை 9:45 மணி", "காலை 10:00 மணி"]
      },
      correctIndex: 0
    },
    {
      id: "adult_l5_2",
      question: {
      English: "Read the office instruction again. What happens if an employee arrives late without approval?",
      Hindi: "कार्यालय के निर्देश को दोबारा पढ़ें। यदि कोई कर्मचारी बिना मंजूरी के देर से आता है तो क्या होता है?",
      Kannada: "ಕಚೇರಿ ಸೂಚನೆಯನ್ನು ಮತ್ತೆ ಓದಿ. ಅನುಮತಿ ಇಲ್ಲದೆ ತಡವಾಗಿ ಬಂದರೆ ಏನಾಗುತ್ತದೆ?",
      Telugu: "కార్యాలయ సూచనను మళ్లీ చదవండి. అనుమతి లేకుండా ఆలస్యంగా వస్తే ఏం జరుగుతుంది?",
      Tamil: "அலுவலக அறிவுறுத்தலை மீண்டும் படிக்கவும். அனுமதியின்றி தாமதமாக வந்தால் என்ன நடக்கும்?"
      },
      options: {
      English: ["Salary is increased", "Marked as present", "Suspended from work", "Marked as half-day leave"],
      Hindi: ["वेतन बढ़ाया जाएगा", "उपस्थित माना जाएगा", "काम से निलंबित", "आधे दिन की छुट्टी माना जाएगा"],
      Kannada: ["ಸಂಬಳ ಹೆಚ್ಚಿಸಲಾಗುವುದು", "ಹಾಜರಿದ್ದಾರೆ ಎಂದು ಗುರುತಿಸಲಾಗುವುದು", "ಕೆಲಸದಿಂದ ಅಮಾನತು", "ಅರ್ಧ ದಿನದ ರಜೆ ಎಂದು ಪರಿಗಣಿಸಲಾಗುವುದು"],
      Telugu: ["జీతం పెరుగుతుంది", "హాజరైనట్లు గుర్తించబడుతుంది", "పని నుండి తొలగిస్తారు", "హాఫ్ డే లీవ్ గా పరిగణించబడుతుంది"],
      Tamil: ["சம்பளம் உயர்த்தப்படும்", "வந்ததாகப் பதிவு செய்யப்படும்", "வேலை நீக்கம் செய்யப்படுவார்", "அரை நாள் விடுப்பாகக் கருதப்படும்"]
      },
      correctIndex: 3
    },
    {
      id: "adult_l5_3",
      question: {
      English: "Read this store refund policy:\n\nRefunds are only given within 14 days of purchase. The original bill must be presented for all refunds.\n\nWithin how many days can you request a refund?",
      Hindi: "इस स्टोर रिफंड नीति को पढ़ें:\n\nरिफंड केवल खरीद के 14 दिनों के भीतर दिया जाता है। सभी रिफंड के लिए मूल बिल प्रस्तुत किया जाना चाहिए।\n\nआप कितने दिनों के भीतर रिफंड का अनुरोध कर सकते हैं?",
      Kannada: "ಅಂಗಡಿಯ ಈ ಮರುಪಾವತಿ ನೀತಿಯನ್ನು ಓದಿ:\n\nಖರೀದಿಸಿದ 14 ದಿನಗಳ ಒಳಗೆ ಮಾತ್ರ ಹಣ ಮರುಪಾವತಿ ಮಾಡಲಾಗುತ್ತದೆ. ಮರುಪಾವತಿಗೆ ಅಸಲಿ ಬಿಲ್ಲು ನೀಡಬೇಕು.\n\nಎಷ್ಟು ದಿನಗಳ ಒಳಗೆ ನೀವು ಮರುಪಾವತಿ ಕೋರಬಹುದು?",
      Telugu: "ఈ స్టోర్ రీఫండ్ పాలసీ చదవండి:\n\nకొనుగోలు చేసిన 14 రోజులలోపు మాత్రమే రీఫండ్ ఇవ్వబడుతుంది. రీఫండ్ల కోసం అసలు బిల్లు సమర్పించాలి.\n\nఎన్ని రోజులలోపు మీరు రీఫండ్ కోరవచ్చు?",
      Tamil: "இந்தக் கடை ரீஃபண்ட் கொள்கையைப் படிக்கவும்:\n\nவாங்கிய 14 நாட்களுக்குள் மட்டுமே பணம் திருப்பித் தரப்படும். அசல் பில் கண்டிப்பாக சமர்ப்பிக்கப்பட வேண்டும்.\n\nஎத்தனை நாட்களுக்குள் நீங்கள் பணத்தைத் திரும்பக் கேட்கலாம்?"
      },
      options: {
      English: ["14 days", "7 days", "10 days", "30 days"],
      Hindi: ["14 दिन", "7 दिन", "10 दिन", "30 दिन"],
      Kannada: ["14 ದಿನಗಳು", "7 ದಿನಗಳು", "10 ದಿನಗಳು", "30 ದಿನಗಳು"],
      Telugu: ["14 రోజులు", "7 రోజులు", "10 రోజులు", "30 రోజులు"],
      Tamil: ["14 நாட்கள்", "7 நாட்கள்", "10 நாட்கள்", "30 நாட்கள்"]
      },
      correctIndex: 0
    },
    {
      id: "adult_l5_4",
      question: {
      English: "Read the store refund policy again. What document must you present to get a refund?",
      Hindi: "स्टोर रिफंड नीति को दोबारा पढ़ें। रिफंड पाने के लिए आपको कौन सा दस्तावेज प्रस्तुत करना होगा?",
      Kannada: "ಮರುಪಾವತಿ ನೀತಿಯನ್ನು ಮತ್ತೆ ಓದಿ. ಮರುಪಾವತಿ ಪಡೆಯಲು ಯಾವ ದಾಖಲೆ ನೀಡಬೇಕು?",
      Telugu: "రీఫండ్ పాలసీ మళ్లీ చదవండి. రీఫండ్ పొందడానికి ఏ పత్రం సమర్పించాలి?",
      Tamil: "ரீஃபண்ட் கொள்கையை மீண்டும் படிக்கவும். பணத்தைத் திரும்பப் பெற எந்த ஆவணத்தைச் சமர்ப்பிக்க வேண்டும்?"
      },
      options: {
      English: ["Original bill", "Visiting card", "Identity card", "Bank passbook"],
      Hindi: ["मूल बिल (Original bill)", "विज़िटिंग कार्ड", "पहचान पत्र", "बैंक पासबुक"],
      Kannada: ["ಅಸಲಿ ಬಿಲ್ಲು (Original bill)", "ಭೇಟಿ ಕಾರ್ಡ್", "ಗುರುತಿನ ಚೀಟಿ", "ಬ್ಯಾಂಕ್ ಪಾಸ್‌ಬುಕ್"],
      Telugu: ["అసలు బిల్లు (Original bill)", "విజిటింగ్ కార్డ్", "గుర్తింపు కార్డు", "బ్యాంకు పాస్ బుక్"],
      Tamil: ["அசல் பில் (Original bill)", "விசிட்டிங் கார்டு", "அடையாள அட்டை", "வங்கி கணக்கு புத்தகம்"]
      },
      correctIndex: 0
    },
    {
      id: "adult_l5_5",
      question: {
      English: "Read this electricity board warning:\n\nPlease pay the electricity bill before the 20th of this month to avoid power disconnection.\n\nBefore which date should you pay the bill?",
      Hindi: "बिजली बोर्ड की इस चेतावनी को पढ़ें:\n\nबिजली कटौती से बचने के लिए कृपया इस महीने की 20 तारीख से पहले बिजली बिल का भुगतान करें।\n\nआपको किस तारीख से पहले बिल का भुगतान करना चाहिए?",
      Kannada: "ವಿದ್ಯುತ್ ಮಂಡಳಿಯ ಈ ಎಚ್ಚರಿಕೆಯನ್ನು ಓದಿ:\n\nವಿದ್ಯುತ್ ಸಂಪರ್ಕ ಕಡಿತ ತಪ್ಪಿಸಲು ದಯವಿಟ್ಟು ಈ ತಿಂಗಳ 20 ನೇ ತಾರೀಖಿನೊಳಗೆ ವಿದ್ಯುತ್ ಬಿಲ್ ಪಾವತಿಸಿ.\n\nಯಾವ ದಿನಾಂಕದ ಒಳಗೆ ನೀವು ಬಿಲ್ ಪಾವತಿಸಬೇಕು?",
      Telugu: "ఈ విద్యుత్ బోర్డు హెచ్చరికను చదవండి:\n\nవిద్యుత్ సరఫరా నిలిపివేయకుండా ఉండటానికి దయచేసి ఈ నెల 20వ తేదీ లోపు కరెంట్ బిల్లు చెల్లించండి.\n\nఏ తేదీ లోపు మీరు బిల్లు చెల్లించాలి?",
      Tamil: "இந்த மின்சார வாரிய எச்சரிக்கையைப் படிக்கவும்:\n\nமின் இணைப்பு துண்டிக்கப்படுவதைத் தவிர்க்க இந்த மாதம் 20-ஆம் தேதிக்குள் மின் கட்டணத்தைச் செலுத்தவும்.\n\nஎந்தத் தேதிக்குள் நீங்கள் மின் கட்டணத்தைச் செலுத்த வேண்டும்?"
      },
      options: {
      English: ["30th of this month", "15th of this month", "20th of this month", "10th of this month"],
      Hindi: ["इस महीने की 30 तारीख", "इस महीने की 15 तारीख", "इस महीने की 20 तारीख", "इस महीने की 10 तारीख"],
      Kannada: ["ಈ ತಿಂಗಳ 30 ನೇ ತಾರೀಖು", "ಈ ತಿಂಗಳ 15 ನೇ ತಾರೀಖು", "ಈ ತಿಂಗಳ 20 ನೇ ತಾರೀಖು", "ಈ ತಿಂಗಳ 10 ನೇ ತಾರೀಖು"],
      Telugu: ["ఈ నెల 30వ తేదీ", "ఈ నెల 15వ తేదీ", "ఈ నెల 20వ తేదీ", "ఈ నెల 10వ తేదీ"],
      Tamil: ["இந்த மாதம் 30-ஆம் தேதி", "இந்த மாதம் 15-ஆம் தேதி", "இந்த மாதம் 20-ஆம் தேதி", "இந்த மாதம் 10-ஆம் தேதி"]
      },
      correctIndex: 2
    },
    {
      id: "adult_l5_6",
      question: {
      English: "Read this doctor notice:\n\nTake two spoons of cough syrup three times a day. Shake the bottle well before use.\n\nHow many times a day should you take the medicine?",
      Hindi: "डॉक्टर के इस पर्चे को पढ़ें:\n\nदिन में तीन बार दो चम्मच कफ सिरप लें। उपयोग करने से पहले बोतल को अच्छी तरह हिलाएं।\n\nआपको दिन में कितनी बार दवा लेनी चाहिए?",
      Kannada: "ವೈದ್ಯರ ಈ ಸೂಚನೆಯನ್ನು ಓದಿ:\n\nದಿನಕ್ಕೆ ಮೂರು ಬಾರಿಯಂತೆ ಎರಡು ಚಮಚ ಕೆಮ್ಮಿನ ಸಿರಪ್ ತೆಗೆದುಕೊಳ್ಳಿ. ಬಳಸುವ ಮುನ್ನ ಬಾಟಲಿಯನ್ನು ಚೆನ್ನಾಗಿ ಅಲುಗಾಡಿಸಿ.\n\nದಿನಕ್ಕೆ ಎಷ್ಟು ಬಾರಿ ಔಷಧ ತೆಗೆದುಕೊಳ್ಳಬೇಕು?",
      Telugu: "ఈ వైద్యుడి సూచనను చదవండి:\n\nరోజుకు మూడు సార్లు రెండు స్పూన్ల దగ్గు సిరప్ తీసుకోండి. ఉపయోగించే ముందు సీసాను బాగా ఊపండి.\n\nరోజుకు ఎన్నిసార్లు ఈ మందు తీసుకోవాలి?",
      Tamil: "இந்த மருத்துவரின் சீட்டைப் படிக்கவும்:\n\nஇருமல் மருந்தை ஒரு நாளைக்கு மூன்று முறை இரண்டு கரண்டி வீதம் சாப்பிடவும். பயன்படுத்துவதற்கு முன் பாட்டிலை நன்கு குலுக்கவும்.\n\nஒரு நாளைக்கு எத்தனை முறை மருந்து சாப்பிட வேண்டும்?"
      },
      options: {
      English: ["Two times", "Three times", "Four times", "Once daily"],
      Hindi: ["दो बार", "तीन बार", "चार बार", "रोजाना एक बार"],
      Kannada: ["ಎರಡು ಬಾರಿ", "ಮೂರು ಬಾರಿ", "ನಾಲ್ಕು ಬಾರಿ", "ದಿನಕ್ಕೊಮ್ಮೆ"],
      Telugu: ["రెండు సార్లు", "మూడు సార్లు", "నాలుగు సార్లు", "రోజుకు ఒకసారి"],
      Tamil: ["இரண்டு முறை", "மூன்று முறை", "நான்கு முறை", "ஒரு நாளைக்கு ஒரு முறை"]
      },
      correctIndex: 1
    },
    {
      id: "adult_l5_7",
      question: {
      English: "Read the doctor notice again. What should you do before taking the cough syrup?",
      Hindi: "डॉक्टर के पर्चे को दोबारा पढ़ें। कफ सिरप लेने से पहले आपको क्या करना चाहिए?",
      Kannada: "ವೈದ್ಯರ ಸೂಚನೆಯನ್ನು ಮತ್ತೆ ಓದಿ. ಸಿರಪ್ ತೆಗೆದುಕೊಳ್ಳುವ ಮುನ್ನ ನೀವು ಏನು ಮಾಡಬೇಕು?",
      Telugu: "వైద్యుడి సూచనను మళ్లీ చదవండి. సిరప్ వేసుకునే ముందు మీరు ఏమి చేయాలి?",
      Tamil: "மருத்துவரின் சீட்டை மீண்டும் படிக்கவும். இருமல் மருந்து சாப்பிடும் முன் நீங்கள் என்ன செய்ய வேண்டும்?"
      },
      options: {
      English: ["Boil the syrup", "Shake the bottle well", "Drink cold water", "Keep it in sun"],
      Hindi: ["सिरप को उबालें", "बोतल को अच्छी तरह हिलाएं", "ठंडा पानी पिएं", "इसे धूप में रखें"],
      Kannada: ["ಸಿರಪ್ ಕುದಿಸಿ", "ಬಾಟಲಿಯನ್ನು ಚೆನ್ನಾಗಿ ಅಲುಗಾಡಿಸಿ", "ತಣ್ಣೀರು ಕುಡಿಯಿರಿ", "ಬಿಸಿಲಿನಲ್ಲಿ ಇರಿಸಿ"],
      Telugu: ["సిరప్ మరిగించాలి", "సీసాను బాగా ఊపాలి", "చల్లటి నీరు త్రాగాలి", "ఎండలో ఉంచాలి"],
      Tamil: ["மருந்தை சூடாக்கவும்", "பாட்டிலை நன்கு குலுக்கவும்", "குளிர்ந்த நீர் குடிக்கவும்", "வெயிலில் வைக்கவும்"]
      },
      correctIndex: 1
    },
    {
      id: "adult_l5_8",
      question: {
      English: "Read this banking notice:\n\nNever share your 4-digit PIN with anyone. The bank staff will never ask for your PIN.\n\nWhat should you never share?",
      Hindi: "बैंक के इस नोटिस को पढ़ें:\n\nअपना 4 अंकों का पिन (PIN) कभी किसी के साथ साझा न करें। बैंक कर्मचारी कभी भी आपका पिन नहीं मांगेंगे।\n\nआपको क्या कभी साझा नहीं करना चाहिए?",
      Kannada: "ಬ್ಯಾಂಕಿನ ಈ ಸೂಚನೆಯನ್ನು ಓದಿ:\n\nನಿಮ್ಮ 4 ಅಂಕಿಯ ಪಿನ್ ಅನ್ನು ಯಾರೊಂದಿಗೂ ಹಂಚಿಕೊಳ್ಳಬೇಡಿ. ಬ್ಯಾಂಕ್ ಸಿಬ್ಬಂದಿ ನಿಮ್ಮ ಪಿನ್ ಕೇಳುವುದಿಲ್ಲ.\n\nನೀವೂ ಯಾವುದನ್ನು ಯಾರೊಂದಿಗೂ ಹಂಚಿಕೊಳ್ಳಬಾರದು?",
      Telugu: "ఈ బ్యాంకు నోటీసు చదవండి:\n\nమీ 4 అంకెల పిన్ (PIN) ను ఎవరితోనూ పంచుకోకండి. బ్యాంకు సిబ్బంది ఎన్నడూ మీ పిన్ అడగరు.\n\nదేనిని ఎవరితోనూ పంచుకోకూడదు?",
      Tamil: "இந்த வங்கி அறிவிப்பைப் படிக்கவும்:\n\nஉங்கள் 4 இலக்க பின் (PIN) எண்ணை யாருடனும் பகிர வேண்டாம். வங்கி ஊழியர்கள் ஒருபோதும் உங்கள் பின் எண்ணைக் கேட்க மாட்டார்கள்.\n\nஎதை நீங்கள் யாருடனும் பகிரக் கூடாது?"
      },
      options: {
      English: ["Mobile brand", "4-digit PIN", "Your name", "Bank address"],
      Hindi: ["मोबाइल ब्रांड", "4 अंकों का पिन (PIN)", "आपका नाम", "बैंक का पता"],
      Kannada: ["ಮೊಬೈಲ್ ಬ್ರ್ಯಾಂಡ್", "4 ಅಂಕಿಯ ಪಿನ್ (PIN)", "ನಿಮ್ಮ ಹೆಸರು", "ಬ್ಯಾಂಕ್ ವಿಳಾಸ"],
      Telugu: ["మొబైల్ బ్రాండ్", "4 అంకెల పిన్ (PIN)", "మీ పేరు", "బ్యాంకు చిరునామా"],
      Tamil: ["கைப்பேசி வகை", "4 இலக்க பின் (PIN) எண்", "உங்கள் பெயர்", "வங்கி முகவரி"]
      },
      correctIndex: 1
    },
    {
      id: "adult_l5_9",
      question: {
      English: "Read this railway announcement:\n\nThe train to Mumbai is delayed by two hours due to fog. It will now arrive at 11:00 AM.\n\nWhy is the train delayed?",
      Hindi: "रेलवे की इस घोषणा को पढ़ें:\n\nकोहरे के कारण मुंबई जाने वाली ट्रेन दो घंटे लेट है। यह अब सुबह 11:00 बजे पहुंचेगी।\n\nट्रेन लेट क्यों है?",
      Kannada: "ರೈಲ್ವೆಯ ಈ ಪ್ರಕಟಣೆಯನ್ನು ಓದಿ:\n\nದಟ್ಟ ಮಂಜಿನ ಕಾರಣ ಮುಂಬೈಗೆ ಹೋಗುವ ರೈಲು ಎರಡು ಗಂಟೆ ತಡವಾಗಿದೆ. ಅದು ಈಗ ಬೆಳಿಗ್ಗೆ 11:00 ಕ್ಕೆ ಬರಲಿದೆ.\n\nರೈಲು ತಡವಾಗಲು ಕಾರಣವೇನು?",
      Telugu: "ఈ రైల్వే ప్రకటనను చదవండి:\n\nపొగమంచు కారణంగా ముంబై వెళ్లే రైలు రెండు గంటలు ఆలస్యంగా నడుస్తోంది. ఇది ఇప్పుడు ఉదయం 11:00 గంటలకు చేరుకుంటుంది.\n\nరైలు ఆలస్యానికి కారణం ఏమిటి?",
      Tamil: "இந்த ரயில்வே அறிவிப்பைப் படிக்கவும்:\n\nபனிமூட்டம் காரணமாக மும்பை செல்லும் ரயில் இரண்டு மணி நேரம் தாமதமாகிறது. அது இப்போது காலை 11:00 மணிக்கு வரும்.\n\nரயில் ஏன் தாமதமாகிறது?"
      },
      options: {
      English: ["Due to fog", "Due to rain", "Due to engine issue", "Due to strike"],
      Hindi: ["कोहरे के कारण", "बारिश के कारण", "इंजन की खराबी के कारण", "हड़ताल के कारण"],
      Kannada: ["ದಟ್ಟ ಮಂಜಿನ ಕಾರಣ", "ಮಳೆಯ ಕಾರಣ", "ಎಂಜಿನ್ ಸಮಸ್ಯೆಯ ಕಾರಣ", "ಮುಷ್ಕರದ ಕಾರಣ"],
      Telugu: ["పొగమంచు కారణంగా", "వర్షం కారణంగా", "ఇంజన్ సమస్య వల్ల", "సమ్మె వల్ల"],
      Tamil: ["பனிமூட்டம் காரணமாக", "மழை காரணமாக", "எஞ்சின் கோளாறு காரணமாக", "வேலைநிறுத்தம் காரணமாக"]
      },
      correctIndex: 0
    },
    {
      id: "adult_l5_10",
      question: {
      English: "Read the railway announcement again. What is the new arrival time of the train?",
      Hindi: "रेलवे घोषणा को दोबारा पढ़ें। ट्रेन के पहुंचने का नया समय क्या है?",
      Kannada: "ಪ್ರಕಟಣೆಯನ್ನು ಮತ್ತೆ ಓದಿ. ರೈಲು ಬರುವ ಹೊಸ ಸಮಯ ಯಾವುದು?",
      Telugu: "రైల్వే ప్రకటనను మళ్లీ చదవండి. రైలు వచ్చే కొత్త సమయం ఏది?",
      Tamil: "ரயில்வே அறிவிப்பை மீண்டும் படிக்கவும். ரயில் வரும் புதிய நேரம் என்ன?"
      },
      options: {
      English: ["11:00 AM", "12:00 PM", "9:00 AM", "10:30 AM"],
      Hindi: ["सुबह 11:00 बजे", "दोपहर 12:00 बजे", "सुबह 9:00 बजे", "सुबह 10:30 बजे"],
      Kannada: ["ಬೆಳಿಗ್ಗೆ 11:00", "ಮಧ್ಯಾಹ್ನ 12:00", "ಬೆಳಿಗ್ಗೆ 9:00", "ಬೆಳಿಗ್ಗೆ 10:30"],
      Telugu: ["ఉదయం 11:00 గంటలకు", "మధ్యాహ్నం 12:00 గంటలకు", "ఉదయం 9:00 గంటలకు", "ఉదయం 10:30 గంటలకు"],
      Tamil: ["காலை 11:00 மணி", "மதியம் 12:00 மணி", "காலை 9:00 மணி", "காலை 10:30 மணி"]
      },
      correctIndex: 0
    }
    ]
  },
  senior_level_1: {
    title: {
    English: "Level 1 Assessment (SENIOR)",
    Hindi: "स्तर 1 आकलन (वरिष्ठ नागरिक)",
    Kannada: "ಹಂತ 1 ಮೌಲ್ಯಮಾಪನ (ಹಿರಿಯ ನಾಗರಿಕರು)",
    Telugu: "స్థాయి 1 అంచనా (వృద్ధులు)",
    Tamil: "நிலை 1 மதிப்பீடு (முதியவர்கள்)"
    },
    description: {
    English: "Test checking capability at Level 1 for senior learners.",
    Hindi: "वरिष्ठ शिक्षार्थियों के लिए स्तर 1 क्षमता का परीक्षण।",
    Kannada: "ಕಲಿಯುವವರಿಗೆ ಹಂತ 1 ಸಾಮರ್ಥ್ಯವನ್ನು ಪರಿಶೀಲಿಸುವ ಪರೀಕ್ಷೆ.",
    Telugu: "అభ్యాసకుల కోసం స్థాయి 1 సామర్థ్య పరీక్ష.",
    Tamil: "கற்பவர்களுக்கான நிலை 1 திறனைச் சோதிக்கும் மதிப்பீடு."
    },
    questions: [
    {
      id: "senior_l1_1",
      question: {
      English: "Which letter matches the shape of capital 'C'?",
      Hindi: "कौन सा अक्षर बड़े अक्षर 'C' के आकार से मेल खाता है?",
      Kannada: "ಯಾವ ಅಕ್ಷರವು ದೊಡ್ಡ ಅಕ್ಷರ 'C' ನ ಆಕಾರಕ್ಕೆ ಹೊಂದಿಕೆಯಾಗುತ್ತದೆ?",
      Telugu: "ఏ అక్షరం క్యాపిటль 'C' ఆకారంతో సరిపోలుతుంది?",
      Tamil: "எந்த எழுத்து பெரிய எழுத்து 'C'-இன் வடிவத்துடன் ஒத்துப்போகிறது?"
      },
      options: {
      English: ["C", "Q", "O", "G"],
      Hindi: ["C", "Q", "O", "G"],
      Kannada: ["C", "Q", "O", "G"],
      Telugu: ["C", "Q", "O", "G"],
      Tamil: ["C", "Q", "O", "G"]
      },
      correctIndex: 0
    },
    {
      id: "senior_l1_2",
      question: {
      English: "Find the lowercase shape that matches 'h'.",
      Hindi: "छोटे अक्षर 'h' से मेल खाने वाला आकार खोजें।",
      Kannada: "ಸಣ್ಣ ಅಕ್ಷರ 'h' ಗೆ ಹೊಂದಿಕೆಯಾಗುವ ಅಕ್ಷರವನ್ನು ಹುಡುಕಿ.",
      Telugu: "చిన్న అక్షరం 'h' కి సరిపోయే అక్షరాన్ని కనుగొనండి.",
      Tamil: "'h' என்ற சிறிய எழுத்துடன் பொருந்தும் வடிவத்தைக் கண்டறியவும்."
      },
      options: {
      English: ["u", "h", "m", "n"],
      Hindi: ["u", "h", "m", "n"],
      Kannada: ["u", "h", "m", "n"],
      Telugu: ["u", "h", "m", "n"],
      Tamil: ["u", "h", "m", "n"]
      },
      correctIndex: 1
    },
    {
      id: "senior_l1_3",
      question: {
      English: "Identify the capital letter 'T'.",
      Hindi: "बड़ा अक्षर 'T' पहचानें।",
      Kannada: "ದೊಡ್ಡ ಅಕ್ಷರ 'T' ಅನ್ನು ಗುರುತಿಸಿ.",
      Telugu: "క్యాపిటల్ అక్షరం 'T'ని గుర్తించండి.",
      Tamil: "பெரிய எழுத்து 'T'-ஐ அடையாளம் காணவும்."
      },
      options: {
      English: ["T", "I", "L", "F"],
      Hindi: ["T", "I", "L", "F"],
      Kannada: ["T", "I", "L", "F"],
      Telugu: ["T", "I", "L", "F"],
      Tamil: ["T", "I", "L", "F"]
      },
      correctIndex: 0
    },
    {
      id: "senior_l1_4",
      question: {
      English: "Which letter is different from others?",
      Hindi: "कौन सा अक्षर दूसरों से भिन्न है?",
      Kannada: "ಯಾವ ಅಕ್ಷರ ಇತರ ಅಕ್ಷರಗಳಿಗಿಂತ ಭಿನ್ನವಾಗಿದೆ?",
      Telugu: "ఏ అక్షరం భిన్నంగా ఉంది?",
      Tamil: "வேறுபட்ட எழுத்து எது?"
      },
      options: {
      English: ["Q", "Q", "Q", "O"],
      Hindi: ["Q", "Q", "Q", "O"],
      Kannada: ["Q", "Q", "Q", "O"],
      Telugu: ["Q", "Q", "Q", "O"],
      Tamil: ["Q", "Q", "Q", "O"]
      },
      correctIndex: 3
    },
    {
      id: "senior_l1_5",
      question: {
      English: "Identify the letter 'V'.",
      Hindi: "अक्षर 'V' पहचानें।",
      Kannada: "'V' ಅಕ್ಷರವನ್ನು ಗುರುತಿಸಿ.",
      Telugu: "'V' అక్షరాన్ని గుర్తించండి.",
      Tamil: "'V' என்ற எழுத்தை அடையாளம் காணவும்."
      },
      options: {
      English: ["Y", "W", "V", "U"],
      Hindi: ["Y", "W", "V", "U"],
      Kannada: ["Y", "W", "V", "U"],
      Telugu: ["Y", "W", "V", "U"],
      Tamil: ["Y", "W", "V", "U"]
      },
      correctIndex: 2
    },
    {
      id: "senior_l1_6",
      question: {
      English: "Complete the sequence: E, F, G, __",
      Hindi: "क्रम पूरा करें: E, F, G, __",
      Kannada: "ಅನುಕ್ರಮವನ್ನು ಪೂರ್ಣಗೊಳಿಸಿ: E, F, G, __",
      Telugu: "క్రమాన్ని పూర్తి చేయండి: E, F, G, __",
      Tamil: "வரிசையை நிரப்புக: E, F, G, __"
      },
      options: {
      English: ["I", "J", "K", "H"],
      Hindi: ["I", "J", "K", "H"],
      Kannada: ["I", "J", "K", "H"],
      Telugu: ["I", "J", "K", "H"],
      Tamil: ["I", "J", "K", "H"]
      },
      correctIndex: 3
    },
    {
      id: "senior_l1_7",
      question: {
      English: "Find lowercase shape matching 'm'.",
      Hindi: "'m' से मेल खाने वाला छोटा आकार खोजें।",
      Kannada: "'m' ಗೆ ಹೊಂದಿಕೆಯಾಗುವ ಸಣ್ಣ ಅಕ್ಷರವನ್ನು ಹುಡುಕಿ.",
      Telugu: "'m' కి సరిపోయే చిన్న ఆకారాన్ని కనుగొనండి.",
      Tamil: "'m' என்ற எழுத்துக்குரிய சிறிய வடிவத்தைக் கண்டறியவும்."
      },
      options: {
      English: ["w", "m", "n", "u"],
      Hindi: ["w", "m", "n", "u"],
      Kannada: ["w", "m", "n", "u"],
      Telugu: ["w", "m", "n", "u"],
      Tamil: ["w", "m", "n", "u"]
      },
      correctIndex: 1
    },
    {
      id: "senior_l1_8",
      question: {
      English: "Which letter looks like a vertical post?",
      Hindi: "कौन सा अक्षर एक सीधे खंभे जैसा दिखता है?",
      Kannada: "ಯಾವ ಅಕ್ಷರವು ಕಂಬದಂತೆ ಕಾಣುತ್ತದೆ?",
      Telugu: "నిలువు స్తంభంలా ఉండే అక్షరం ఏది?",
      Tamil: "நேராக இருக்கும் கம்பம் போல தோற்றமளிக்கும் எழுத்து எது?"
      },
      options: {
      English: ["O", "I", "S", "X"],
      Hindi: ["O", "I", "S", "X"],
      Kannada: ["O", "I", "S", "X"],
      Telugu: ["O", "I", "S", "X"],
      Tamil: ["O", "I", "S", "X"]
      },
      correctIndex: 1
    },
    {
      id: "senior_l1_9",
      question: {
      English: "Find the capital letter 'U'.",
      Hindi: "बड़ा अक्षर 'U' खोजें।",
      Kannada: "ದೊಡ್ಡ ಅಕ್ಷರ 'U' ಅನ್ನು ಹುಡುಕಿ.",
      Telugu: "క్యాపిటల్ అక్షరం 'U'ని కనుగొనండి.",
      Tamil: "பெரிய எழுத்து 'U'-ஐக் கண்டறியவும்."
      },
      options: {
      English: ["U", "O", "V", "D"],
      Hindi: ["U", "O", "V", "D"],
      Kannada: ["U", "O", "V", "D"],
      Telugu: ["U", "O", "V", "D"],
      Tamil: ["U", "O", "V", "D"]
      },
      correctIndex: 0
    },
    {
      id: "senior_l1_10",
      question: {
      English: "Find the lowercase letter 'a'.",
      Hindi: "छोटा अक्षर 'a' खोजें।",
      Kannada: "ಸಣ್ಣ ಅಕ್ಷರ 'a' ಅನ್ನು ಹುಡುಕಿ.",
      Telugu: "చిన్న అక్షరం 'a'ని కనుగొనండి.",
      Tamil: "சிறிய எழுத்து 'a'-ஐக் கண்டறியவும்."
      },
      options: {
      English: ["d", "c", "a", "o"],
      Hindi: ["d", "c", "a", "o"],
      Kannada: ["d", "c", "a", "o"],
      Telugu: ["d", "c", "a", "o"],
      Tamil: ["d", "c", "a", "o"]
      },
      correctIndex: 2
    }
    ]
  },
  senior_level_2: {
    title: {
    English: "Level 2 Assessment (SENIOR)",
    Hindi: "स्तर 2 आकलन (वरिष्ठ नागरिक)",
    Kannada: "ಹಂತ 2 ಮೌಲ್ಯಮಾಪನ (ಹಿರಿಯ ನಾಗರಿಕರು)",
    Telugu: "స్థాయి 2 అంచనా (వృద్ధులు)",
    Tamil: "நிலை 2 மதிப்பீடு (முதியவர்கள்)"
    },
    description: {
    English: "Test checking capability at Level 2 for senior learners.",
    Hindi: "वरिष्ठ शिक्षार्थियों के लिए स्तर 2 क्षमता का परीक्षण।",
    Kannada: "ಕಲಿಯುವವರಿಗೆ ಹಂತ 2 ಸಾಮರ್ಥ್ಯವನ್ನು ಪರಿಶೀಲಿಸುವ ಪರೀಕ್ಷೆ.",
    Telugu: "అభ్యాసకుల కోసం స్థాయి 2 సామర్థ్య పరీక్ష.",
    Tamil: "கற்பவர்களுக்கான நிலை 2 திறனைச் சோதிக்கும் மதிப்பீடு."
    },
    questions: [
    {
      id: "senior_l2_1",
      question: {
      English: "Which letter starts the sound of the word 'Home'?",
      Hindi: "कौन सा अक्षर 'Home' (घर) शब्द की ध्वनि शुरू करता है?",
      Kannada: "ಯಾವ ಅಕ್ಷರವು 'Home' ಪದದ ಧ್ವನಿಯನ್ನು ಪ್ರಾರಂಭಿಸುತ್ತದೆ?",
      Telugu: "'Home' పదం ఏ అక్షరంతో ప్రారంభమవుతుంది?",
      Tamil: "'Home' என்ற வார்த்தையின் தொடக்க ஒலியை எந்த எழுத்து உருவாக்குகிறது?"
      },
      options: {
      English: ["N", "O", "M", "H"],
      Hindi: ["N", "O", "M", "H"],
      Kannada: ["N", "O", "M", "H"],
      Telugu: ["N", "O", "M", "H"],
      Tamil: ["N", "O", "M", "H"]
      },
      correctIndex: 3
    },
    {
      id: "senior_l2_2",
      question: {
      English: "Identify the missing letter: 'T_me'.",
      Hindi: "शब्द में छूटा हुआ अक्षर पहचानें: 'T_me' (समय)।",
      Kannada: "ಪದದಲ್ಲಿ ಬಿಟ್ಟುಹೋದ ಅಕ್ಷರವನ್ನು ಗುರುತಿಸಿ: 'T_me'.",
      Telugu: "పదంలో లేని అక్షరాన్ని గుర్తించండి: 'T_me'.",
      Tamil: "வார்த்தையில் விடுபட்ட எழுத்தைக் கண்டறியவும்: 'T_me'."
      },
      options: {
      English: ["i", "a", "o", "e"],
      Hindi: ["i", "a", "o", "e"],
      Kannada: ["i", "a", "o", "e"],
      Telugu: ["i", "a", "o", "e"],
      Tamil: ["i", "a", "o", "e"]
      },
      correctIndex: 0
    },
    {
      id: "senior_l2_3",
      question: {
      English: "Which word rhymes with 'Clock'?",
      Hindi: "कौन सा शब्द 'Clock' (घड़ी) के साथ तुकबंदी करता है?",
      Kannada: "ಯಾವ ಪದವು 'Clock' ನೊಂದಿಗೆ ಪ್ರಾಸಬದ್ಧವಾಗಿದೆ?",
      Telugu: "'Clock' తో ప్రాస కలిసే పదం ఏది?",
      Tamil: "'Clock' என்ற ஒலியுடன் ஒத்துப்போகும் வார்த்தை எது?"
      },
      options: {
      English: ["Lake", "Look", "Like", "Lock"],
      Hindi: ["Lake (झील)", "Look (देखना)", "Like (पसंद)", "Lock (ताला)"],
      Kannada: ["Lake (ಕೆರೆ)", "Look (ನೋಡು)", "Like (ಇಷ್ಟ)", "Lock (ಬೀಗ)"],
      Telugu: ["Lake (సరస్సు)", "Look (చూడడం)", "Like (ఇష్టం)", "Lock (తాళం)"],
      Tamil: ["Lake (ஏரி)", "Look (பார்", "Like (விருப்பம்)", "Lock (பூட்டு)"]
      },
      correctIndex: 3
    },
    {
      id: "senior_l2_4",
      question: {
      English: "What sound does the letter 'M' make in 'Medicine'?",
      Hindi: "'Medicine' (दवा) में अक्षर 'M' की ध्वनि क्या है?",
      Kannada: "'Medicine' ಪದದಲ್ಲಿ 'M' ಅಕ್ಷರವು ಯಾವ ಧ್ವನಿಯನ್ನು ಮಾಡುತ್ತದೆ?",
      Telugu: "'Medicine' లో 'M' అక్షరం చేసే శబ్దం ఏది?",
      Tamil: "'Medicine' என்ற வார்த்தையில் 'M' என்ற எழுத்து எழுப்பும் ஒலி என்ன?"
      },
      options: {
      English: ["kuh", "duh", "suh", "muh"],
      Hindi: ["क (kuh)", "ड (duh)", "स (suh)", "म (muh)"],
      Kannada: ["ಕ (kuh)", "ಡ (duh)", "ಸ (suh)", "ಮ (muh)"],
      Telugu: ["క (kuh)", "డ (duh)", "స (suh)", "మ (muh)"],
      Tamil: ["க (kuh)", "ட (duh)", "ஸ (suh)", "ம (muh)"]
      },
      correctIndex: 3
    },
    {
      id: "senior_l2_5",
      question: {
      English: "Which word starts with the 'N' sound?",
      Hindi: "कौन सा शब्द 'N' की ध्वनि से शुरू होता है?",
      Kannada: "ಯಾವ ಪದವು 'N' ಧ್ವನಿಯಿಂದ ಪ್ರಾರಂಭವಾಗುತ್ತದೆ?",
      Telugu: "ఏ పదం 'N' శబ్దంతో ప్రారంభమవుతుంది?",
      Tamil: "எந்த வார்த்தை 'N' ஒலியில் தொடங்குகிறது?"
      },
      options: {
      English: ["Name", "Home", "Book", "Time"],
      Hindi: ["Name (नाम)", "Home (घर)", "Book (किताब)", "Time (समय)"],
      Kannada: ["Name (ಹೆಸರು)", "Home (ಮನೆ)", "Book (ಪುಸ್ತಕ)", "Time (ಸಮಯ)"],
      Telugu: ["Name (పేరు)", "Home (ఇల్లు)", "Book (పుస్తకం)", "Time (సమయం)"],
      Tamil: ["Name (பெயர்)", "Home (வீடு)", "Book (புத்தகம்)", "Time (நேரம்)"]
      },
      correctIndex: 0
    },
    {
      id: "senior_l2_6",
      question: {
      English: "Which word ends with the 'd' sound?",
      Hindi: "कौन सा शब्द 'd' की ध्वनि पर समाप्त होता है?",
      Kannada: "ಯಾವ ಪದವು 'd' ಧ್ವನಿಯೊಂದಿಗೆ ಕೊನೆಗೊಳ್ಳುತ್ತದೆ?",
      Telugu: "ఏ పదం 'd' శబ్దంతో ముగుస్తుంది?",
      Tamil: "எந்த வார்த்தை 'd' ஒலியில் முடிகிறது?"
      },
      options: {
      English: ["Food", "Foot", "Four", "Full"],
      Hindi: ["Food (भोजन)", "Foot (पैर)", "Four (चार)", "Full (पूरा)"],
      Kannada: ["Food (ಆಹಾರ)", "Foot (ಪಾದ)", "Four (ನಾಲ್ಕು)", "Full (ತುಂಬಿದ)"],
      Telugu: ["Food (ఆహారం)", "Foot (పాదం)", "Four (నాలుగు)", "Full (నిండిన)"],
      Tamil: ["Food (உணவு)", "Foot (பாதம்)", "Four (நான்கு)", "Full (முழு)"]
      },
      correctIndex: 0
    },
    {
      id: "senior_l2_7",
      question: {
      English: "Identify the missing vowel: 'S_n'.",
      Hindi: "छूटा हुआ स्वर पहचानें: 'S_n' (पुत्र)।",
      Kannada: "ಬಿಟ್ಟುಹೋದ ಸ್ವರವನ್ನು ಗುರುತಿಸಿ: 'S_n'.",
      Telugu: "పదంలో లేని అచ్చును గుర్తించండి: 'S_n'.",
      Tamil: "விடுபட்ட உயிர் எழுத்தைக் கண்டறியவும்: 'S_n'."
      },
      options: {
      English: ["e", "a", "o", "i"],
      Hindi: ["e", "a", "o", "i"],
      Kannada: ["e", "a", "o", "i"],
      Telugu: ["e", "a", "o", "i"],
      Tamil: ["e", "a", "o", "i"]
      },
      correctIndex: 2
    },
    {
      id: "senior_l2_8",
      question: {
      English: "Which word starts with the 'Sp' sound blend?",
      Hindi: "कौन सा शब्द 'Sp' की संयुक्त ध्वनि से शुरू होता है?",
      Kannada: "ಯಾವ ಪದವು 'Sp' ಧ್ವನಿಯಿಂದ ಪ್ರಾರಂಭವಾಗುತ್ತದೆ?",
      Telugu: "ఏ పదం 'Sp' శబ్దంతో ప్రారంభమవుతుంది?",
      Tamil: "எந்த வார்த்தை 'Sp' ஒலியில் தொடங்குகிறது?"
      },
      options: {
      English: ["Sun", "Spoon", "Soon", "Soap"],
      Hindi: ["Sun (सूरज)", "Spoon (चम्मच)", "Soon (जल्द)", "Soap (साबुन)"],
      Kannada: ["Sun (ಸೂರ್ಯ)", "Spoon (ಚಮಚ)", "Soon (ಶೀಘ್ರದಲ್ಲೇ)", "Soap (ಸಾಬೂನು)"],
      Telugu: ["Sun (సూర్యుడు)", "Spoon (స్పూన్)", "Soon (త్వరలో)", "Soap (సబ్బు)"],
      Tamil: ["Sun (சூரியன்)", "Spoon (கரண்டி)", "Soon (விரைவில்)", "Soap (சோப்பு)"]
      },
      correctIndex: 1
    },
    {
      id: "senior_l2_9",
      question: {
      English: "What sound does double 'e' make in 'Seed'?",
      Hindi: "'Seed' (बीज) में दोहरे 'e' की ध्वनि क्या है?",
      Kannada: "'Seed' ಪದದಲ್ಲಿ ಡಬಲ್ 'e' ಯಾವ ಧ್ವನಿಯನ್ನು ಮಾಡುತ್ತದೆ?",
      Telugu: "'Seed' లో డబుల్ 'e' చేసే శబ్దం ఏది?",
      Tamil: "'Seed' என்ற வார்த்தையில் இரட்டை 'e' எழுப்பும் ஒலி என்ன?"
      },
      options: {
      English: ["ee", "oo", "ah", "oh"],
      Hindi: ["ई (ee)", "ऊ (oo)", "आ (ah)", "ओ (oh)"],
      Kannada: ["ಈ (ee)", "ಊ (oo)", "ಆ (ah)", "ಓ (oh)"],
      Telugu: ["ఈ (ee)", "ఊ (oo)", "ఆ (ah)", "ఓ (oh)"],
      Tamil: ["ஈ (ee)", "ஊ (oo)", "ஆ (ah)", "ஓ (oh)"]
      },
      correctIndex: 0
    },
    {
      id: "senior_l2_10",
      question: {
      English: "Which word rhymes with 'Day'?",
      Hindi: "कौन सा शब्द 'Day' के साथ तुकबंदी करता है?",
      Kannada: "ಯಾವ ಪದವು 'Day' ನೊಂದಿಗೆ ಪ್ರಾಸಬದ್ಧವಾಗಿದೆ?",
      Telugu: "'Day' తో ప్రాస కలిసే పదం ఏది?",
      Tamil: "'Day' என்ற ஒலியுடன் ஒத்துப்போகும் வார்த்தை எது?"
      },
      options: {
      English: ["May", "Map", "Mug", "Men"],
      Hindi: ["May (मई)", "Map (नक्शा)", "Mug (मग)", "Men (पुरुष)"],
      Kannada: ["May (ಮೇ)", "Map (ನಕ್ಷೆ)", "Mug (ಮಗ್)", "Men (ಪುರುಷರು)"],
      Telugu: ["May (మే)", "Map (మ్యాప్)", "Mug (మగ్)", "Men (పురుషులు)"],
      Tamil: ["May (மே)", "Map (வரைபடம்)", "Mug (கோப்பை)", "Men (மனிதர்கள்)"]
      },
      correctIndex: 0
    }
    ]
  },
  senior_level_3: {
    title: {
    English: "Level 3 Assessment (SENIOR)",
    Hindi: "स्तर 3 आकलन (वरिष्ठ नागरिक)",
    Kannada: "ಹಂತ 3 ಮೌಲ್ಯಮಾಪನ (ಹಿರಿಯ ನಾಗರಿಕರು)",
    Telugu: "స్థాయి 3 అంచనా (వృద్ధులు)",
    Tamil: "நிலை 3 மதிப்பீடு (முதியவர்கள்)"
    },
    description: {
    English: "Test checking capability at Level 3 for senior learners.",
    Hindi: "वरिष्ठ शिक्षार्थियों के लिए स्तर 3 क्षमता का परीक्षण।",
    Kannada: "ಕಲಿಯುವವರಿಗೆ ಹಂತ 3 ಸಾಮರ್ಥ್ಯವನ್ನು ಪರಿಶೀಲಿಸುವ ಪರೀಕ್ಷೆ.",
    Telugu: "అభ్యాసకుల కోసం స్థాయి 3 సామర్థ్య పరీక్ష.",
    Tamil: "கற்பவர்களுக்கான நிலை 3 திறனைச் சோதிக்கும் மதிப்பீடு."
    },
    questions: [
    {
      id: "senior_l3_1",
      question: {
      English: "Choose the correct spelling of the substance used to cure illness:",
      Hindi: "बीमारी को ठीक करने के लिए इस्तेमाल किए जाने वाले पदार्थ की सही वर्तनी चुनें (दवा):",
      Kannada: "ಕಾಯಿಲೆ ವಾಸಿ ಮಾಡಲು ಬಳಸುವ ಔಷಧದ ಸರಿಯಾದ ಕಾಗುಣಿತವನ್ನು ಆರಿಸಿ:",
      Telugu: "మందుల యొక్క సరైన స్పెల్లింగ్‌ను ఎంచుకోండి:",
      Tamil: "நோயைக் குணப்படுத்தும் மருந்தின் சரியான எழுத்துப்பிழையைத் தேர்ந்தெடுக்கவும்:"
      },
      options: {
      English: ["Medicinee", "Medicin", "Medecine", "Medicine"],
      Hindi: ["Medicinee", "Medicin", "Medecine", "Medicine"],
      Kannada: ["Medicinee", "Medicin", "Medecine", "Medicine"],
      Telugu: ["Medicinee", "Medicin", "Medecine", "Medicine"],
      Tamil: ["Medicinee", "Medicin", "Medecine", "Medicine"]
      },
      correctIndex: 3
    },
    {
      id: "senior_l3_2",
      question: {
      English: "Find the spelling of the son of your child:",
      Hindi: "अपने बच्चे के बेटे (पोते) की सही वर्तनी खोजें:",
      Kannada: "ನಿಮ್ಮ ಮಗನ ಅಥವಾ ಮಗಳ ಮಗನ (ಮೊಮ್ಮಗ) ಕಾಗುಣಿತವನ್ನು ಹುಡುಕಿ:",
      Telugu: "మీ మనవడి యొక్క సరైన స్పెల్లింగ్ కనుగొనండి:",
      Tamil: "உங்கள் பேரனின் சரியான எழுத்துப்பிழையைக் கண்டறியவும்:"
      },
      options: {
      English: ["Grandson", "Grand-son", "Gran-son", "Grandsun"],
      Hindi: ["Grandson", "Grand-son", "Gran-son", "Grandsun"],
      Kannada: ["Grandson", "Grand-son", "Gran-son", "Grandsun"],
      Telugu: ["Grandson", "Grand-son", "Gran-son", "Grandsun"],
      Tamil: ["Grandson", "Grand-son", "Gran-son", "Grandsun"]
      },
      correctIndex: 0
    },
    {
      id: "senior_l3_3",
      question: {
      English: "Identify the correct spelling of the place where we go for treatment:",
      Hindi: "इलाज के लिए जाने वाले स्थान की सही वर्तनी पहचानें (अस्पताल):",
      Kannada: "ನಾವು ಚಿಕಿತ್ಸೆಗೆ ಹೋಗುವ ಸ್ಥಳದ ಸರಿಯಾದ ಕಾಗುಣಿತವನ್ನು ಗುರುತಿಸಿ (ಆಸ್ಪತ್ರೆ):",
      Telugu: "మనం చికిత్స కోసం వెళ్లే స్థలం యొక్క సరైన స్పెల్లింగ్ కనుగొనండి (ఆసుపత్రి):",
      Tamil: "நாம் சிகிச்சைக்குச் செல்லும் இடத்தின் சரியான எழுத்துப்பிழையைக் கண்டறியவும் (மருத்துவமனை):"
      },
      options: {
      English: ["Hospitel", "Hospital", "Hospitil", "Hospitall"],
      Hindi: ["Hospitel", "Hospital", "Hospitil", "Hospitall"],
      Kannada: ["Hospitel", "Hospital", "Hospitil", "Hospitall"],
      Telugu: ["Hospitel", "Hospital", "Hospitil", "Hospitall"],
      Tamil: ["Hospitel", "Hospital", "Hospitil", "Hospitall"]
      },
      correctIndex: 1
    },
    {
      id: "senior_l3_4",
      question: {
      English: "Choose the correct spelling of the device that shows us the time:",
      Hindi: "समय दिखाने वाले उपकरण की सही वर्तनी चुनें (घड़ी):",
      Kannada: "ಸಮಯವನ್ನು ತೋರಿಸುವ ಸಾಧನದ ಸರಿಯಾದ ಕಾಗುಣಿತವನ್ನು ಆರಿಸಿ (ಗಡಿಯಾರ):",
      Telugu: "సమయాన్ని చూపే పరికరం యొక్క సరైన స్పెల్లింగ్ ఎంచుకోండి (గడియారం):",
      Tamil: "நேரத்தைக் காட்டும் கடிகாரத்தின் சரியான எழுத்துப்பிழையைத் தேர்ந்தெடுக்கவும்:"
      },
      options: {
      English: ["Cloke", "Clook", "Clock", "Clok"],
      Hindi: ["Cloke", "Clook", "Clock", "Clok"],
      Kannada: ["Cloke", "Clook", "Clock", "Clok"],
      Telugu: ["Cloke", "Clook", "Clock", "Clok"],
      Tamil: ["Cloke", "Clook", "Clock", "Clok"]
      },
      correctIndex: 2
    },
    {
      id: "senior_l3_5",
      question: {
      English: "Find the spelling of the daughter of your child:",
      Hindi: "अपने बच्चे की बेटी (पोती) की सही वर्तनी खोजें:",
      Kannada: "ನಿಮ್ಮ ಮಗನ ಅಥವಾ ಮಗಳ ಮಗಳ (ಮೊಮ್ಮಗಳು) ಕಾಗುಣಿತವನ್ನು ಹುಡುಕಿ:",
      Telugu: "మీ మనవరాలి యొక్క సరైన స్పెల్లింగ్ కనుగొనండి:",
      Tamil: "உங்கள் பேத்தியின் சரியான எழுத்துப்பிழையைக் கண்டறியவும்:"
      },
      options: {
      English: ["Granddauter", "Granddaughter", "Grand-daughter", "Grandoter"],
      Hindi: ["Granddauter", "Granddaughter", "Grand-daughter", "Grandoter"],
      Kannada: ["Granddauter", "Granddaughter", "Grand-daughter", "Grandoter"],
      Telugu: ["Granddauter", "Granddaughter", "Grand-daughter", "Grandoter"],
      Tamil: ["Granddauter", "Granddaughter", "Grand-daughter", "Grandoter"]
      },
      correctIndex: 1
    },
    {
      id: "senior_l3_6",
      question: {
      English: "What is the opposite word for 'Morning'?",
      Hindi: "'Morning' (सुबह) का विपरीत शब्द क्या है?",
      Kannada: "'Morning' ಪದದ ವಿರುದ್ಧ ಪದ ಯಾವುದು?",
      Telugu: "'Morning' అనే పదానికి వ్యతిరేక పదం ఏది?",
      Tamil: "'Morning' என்ற வார்த்தையின் எதிர்ச்சொல் எது?"
      },
      options: {
      English: ["Afternoon", "Day", "Evening", "Night"],
      Hindi: ["Afternoon (दोपहर)", "Day (दिन)", "Evening (शाम)", "Night (रात)"],
      Kannada: ["Afternoon (ಮಧ್ಯಾಹ್ನ)", "Day (ದಿನ)", "Evening (ಸಂಜೆ)", "Night (ರಾತ್ರಿ)"],
      Telugu: ["Afternoon (మధ్యాహ్నం)", "Day (పగలు)", "Evening (సాయంత్రం)", "Night (రాత్రి)"],
      Tamil: ["Afternoon (மதியம்)", "Day (பகல்)", "Evening (மாலை)", "Night (இரவு)"]
      },
      correctIndex: 2
    },
    {
      id: "senior_l3_7",
      question: {
      English: "Find the correct spelling of the liquid we drink to survive:",
      Hindi: "पीने वाले तरल की सही वर्तनी खोजें (पानी):",
      Kannada: "ಕುಡಿಯುವ ದ್ರವದ ಸರಿಯಾದ ಕಾಗುಣಿತವನ್ನು ಹುಡುಕಿ (ನೀರು):",
      Telugu: "మనం త్రాగే ద్రవం యొక్క సరైన స్పెల్లింగ్ కనుగొనండి (నీరు):",
      Tamil: "நாம் குடிக்கும் திரவத்தின் சரியான எழுத்துப்பிழையைக் கண்டறியவும் (தண்ணீர்):"
      },
      options: {
      English: ["Water", "Woter", "Watar", "Watir"],
      Hindi: ["Water", "Woter", "Watar", "Watir"],
      Kannada: ["Water", "Woter", "Watar", "Watir"],
      Telugu: ["Water", "Woter", "Watar", "Watir"],
      Tamil: ["Water", "Woter", "Watar", "Watir"]
      },
      correctIndex: 0
    },
    {
      id: "senior_l3_8",
      question: {
      English: "Which word describes the action of resting with closed eyes at night?",
      Hindi: "कौन सा शब्द रात में बंद आँखों से विश्राम करने की क्रिया को दर्शाता है?",
      Kannada: "ಯಾವ ಪದವು ರಾತ್ರಿ ಕಣ್ಣು ಮುಚ್ಚಿ ವಿಶ್ರಾಂತಿ ಪಡೆಯುವ ಕ್ರಿಯೆಯನ್ನು ವಿವರಿಸುತ್ತದೆ?",
      Telugu: "రాత్రి పూట కళ్లు మూసుకుని విశ్రాంతి తీసుకునే క్రియను ఏ పదం సూచిస్తుంది?",
      Tamil: "இரவில் கண்கள் மூடி ஓய்வெடுக்கும் செயலைக் குறிக்கும் வார்த்தை எது?"
      },
      options: {
      English: ["Walk", "Read", "Sleep", "Talk"],
      Hindi: ["Walk (चलना)", "Read (पढ़ना)", "Sleep (सोना)", "Talk (बातचीत)"],
      Kannada: ["Walk (ನಡೆ)", "Read (ಓದು)", "Sleep (ನಿದ್ರೆ)", "Talk (ಮಾತನಾಡು)"],
      Telugu: ["Walk (నడవడం)", "Read (చదవడం)", "Sleep (నిద్రించడం)", "Talk (మాట్లాడడం)"],
      Tamil: ["Walk (நடத்தல்)", "Read (படித்தல்)", "Sleep (தூங்குதல்)", "Talk (பேசுதல்)"]
      },
      correctIndex: 2
    },
    {
      id: "senior_l3_9",
      question: {
      English: "Find the spelling of the day before Friday:",
      Hindi: "शुक्रवार से पहले वाले दिन की वर्तनी खोजें (गुरुवार):",
      Kannada: "ಶುಕ್ರವಾರದ ಹಿಂದಿನ ದಿನದ ಕಾಗುಣಿತವನ್ನು ಹುಡುಕಿ (ಗುರುವಾರ):",
      Telugu: "శుక్రవారం ముందు వచ్చే రోజు స్పెల్లింగ్ కనుగొనండి (గురువారం):",
      Tamil: "வெள்ளிக்கிழமைக்கு முந்தைய நாளின் சரியான எழுத்துப்பிழையைக் கண்டறியவும் (வியாழக்கிழமை):"
      },
      options: {
      English: ["Thursdey", "Thursday", "Thursdae", "Thurseday"],
      Hindi: ["Thursdey", "Thursday", "Thursdae", "Thurseday"],
      Kannada: ["Thursdey", "Thursday", "Thursdae", "Thurseday"],
      Telugu: ["Thursdey", "Thursday", "Thursdae", "Thurseday"],
      Tamil: ["Thursdey", "Thursday", "Thursdae", "Thurseday"]
      },
      correctIndex: 1
    },
    {
      id: "senior_l3_10",
      question: {
      English: "Choose the correct spelling of the food eaten in the morning:",
      Hindi: "सुबह खाए जाने वाले भोजन की सही वर्तनी चुनें (नाश्ता):",
      Kannada: "ಬೆಳಿಗ್ಗೆ ಸೇವಿಸುವ ಆಹಾರದ ಸರಿಯಾದ ಕಾಗುಣಿತವನ್ನು ಆರಿಸಿ (ಉಪಹಾರ):",
      Telugu: "ఉదయం తినే ఆహారం యొక్క సరైన స్పెల్లింగ్‌ను ఎంచుకోండి (అల్పాహారం):",
      Tamil: "காலையில் சாப்பிடும் உணவின் சரியான எழுத்துப்பிழையைத் தேர்ந்தெடுக்கவும் (காலை உணவு):"
      },
      options: {
      English: ["Break-fast", "Breakfast", "Brekfast", "Brakfast"],
      Hindi: ["Break-fast", "Breakfast", "Brekfast", "Brakfast"],
      Kannada: ["Break-fast", "Breakfast", "Brekfast", "Brakfast"],
      Telugu: ["Break-fast", "Breakfast", "Brekfast", "Brakfast"],
      Tamil: ["Break-fast", "Breakfast", "Brekfast", "Brakfast"]
      },
      correctIndex: 1
    }
    ]
  },
  senior_level_4: {
    title: {
    English: "Level 4 Assessment (SENIOR)",
    Hindi: "स्तर 4 आकलन (वरिष्ठ नागरिक)",
    Kannada: "ಹಂತ 4 ಮೌಲ್ಯಮಾಪನ (ಹಿರಿಯ ನಾಗರಿಕರು)",
    Telugu: "స్థాయి 4 అంచనా (వృద్ధులు)",
    Tamil: "நிலை 4 மதிப்பீடு (முதியவர்கள்)"
    },
    description: {
    English: "Test checking capability at Level 4 for senior learners.",
    Hindi: "वरिष्ठ शिक्षार्थियों के लिए स्तर 4 क्षमता का परीक्षण।",
    Kannada: "ಕಲಿಯುವವರಿಗೆ ಹಂತ 4 ಸಾಮರ್ಥ್ಯವನ್ನು ಪರಿಶೀಲಿಸುವ ಪರೀಕ್ಷೆ.",
    Telugu: "అభ్యాసకుల కోసం స్థాయి 4 సామర్థ్య పరీక్ష.",
    Tamil: "கற்பவர்களுக்கான நிலை 4 திறனைச் சோதிக்கும் மதிப்பீடு."
    },
    questions: [
    {
      id: "senior_l4_1",
      question: {
      English: "Complete: 'My grandson helps me read the ______.'",
      Hindi: "पूरा करें: 'My grandson helps me read the ______.'",
      Kannada: "ಪೂರ್ಣಗೊಳಿಸಿ: 'My grandson helps me read the ______.'",
      Telugu: "పూర్తి చేయండి: 'My grandson helps me read the ______.'",
      Tamil: "வாக்கியத்தை நிரப்புக: 'My grandson helps me read the ______.'"
      },
      options: {
      English: ["paper", "floor", "water", "river"],
      Hindi: ["paper (अखबार)", "floor (फर्श)", "water (पानी)", "river (नदी)"],
      Kannada: ["paper (ಪತ್ರಿಕೆ)", "floor (ನೆಲ)", "water (ನೀರು)", "river (ನದಿ)"],
      Telugu: ["paper (న్యూస్ పేపర్)", "floor (నేల)", "water (నీరు)", "river (నది)"],
      Tamil: ["paper (செய்தித்தாள்)", "floor (தரை)", "water (தண்ணீர்)", "river (நதி)"]
      },
      correctIndex: 0
    },
    {
      id: "senior_l4_2",
      question: {
      English: "Read the hospital sign: 'SILENCE PLEASE'. What should you do?",
      Hindi: "अस्पताल का बोर्ड पढ़ें: 'SILENCE PLEASE' (कृपया शांत रहें)। आपको क्या करना चाहिए?",
      Kannada: "ಆಸ್ಪತ್ರೆಯ ಬೋರ್ಡ್ ಓದಿ: 'SILENCE PLEASE'. ನೀವು ಏನು ಮಾಡಬೇಕು?",
      Telugu: "ఆసుపత్రి బోర్డు చదవండి: 'SILENCE PLEASE'. మీరు ఏమి చేయాలి?",
      Tamil: "மருத்துவமனைப் பலகையைப் படிக்கவும்: 'SILENCE PLEASE'. நீங்கள் என்ன செய்ய வேண்டும்?"
      },
      options: {
      English: ["Shout for help", "Do not talk loudly", "Sing a song", "Run around"],
      Hindi: ["मदद के लिए चिल्लाएं", "ज़ोर से बात न करें", "गाना गाएं", "चारों ओर दौड़ें"],
      Kannada: ["ಸಹಾಯಕ್ಕಾಗಿ ಕಿರುಚು", "ಜೋರಾಗಿ ಮಾತನಾಡಬೇಡಿ", "ಹಾಡು ಹಾಡು", "ಇತ್ತ ಅತ್ತ ಓಡು"],
      Telugu: ["సహాయం కోసం గట్టిగా అరవాలి", "గట్టిగా మాట్లాడకూడదు", "పాటలు పాడాలి", "అటు ఇటు పరుగెత్తాలి"],
      Tamil: ["உதவிக்காகக் கத்தவும்", "சத்தமாகப் பேசக் கூடாது", "பாடல் பாடவும்", "இங்குமங்கும் ஓடவும்"]
      },
      correctIndex: 1
    },
    {
      id: "senior_l4_3",
      question: {
      English: "Complete: 'I take my pills after ______.'",
      Hindi: "पूरा करें: 'I take my pills after ______.'",
      Kannada: "ಪೂರ್ಣಗೊಳಿಸಿ: 'I take my pills after ______.'",
      Telugu: "పూర్తి చేయండి: 'I take my pills after ______.'",
      Tamil: "வாக்கியத்தை நிரப்புக: 'I take my pills after ______.'"
      },
      options: {
      English: ["sleep", "bath", "food", "play"],
      Hindi: ["sleep (नींद)", "bath (स्नान)", "food (भोजन)", "play (खेल)"],
      Kannada: ["sleep (ನಿದ್ರೆ)", "bath (ಸ್ನಾನ)", "food (ಆಹಾರ)", "play (ಆಟ)"],
      Telugu: ["sleep (నిద్ర)", "bath (స్నానం)", "food (ఆహారం)", "play (ఆట)"],
      Tamil: ["sleep (தூக்கம்)", "bath (குளியல்)", "food (உணவு)", "play (விளையாட்டு)"]
      },
      correctIndex: 2
    },
    {
      id: "senior_l4_4",
      question: {
      English: "Read the sign: 'WET FLOOR'. What does it tell you?",
      Hindi: "संकेत पढ़ें: 'WET FLOOR' (गीला फर्श)। यह आपको क्या बताता है?",
      Kannada: "ಚಿಹ್ನೆಯನ್ನು ಓದಿ: 'WET FLOOR'. ಇದು ನಿಮಗೆ ಏನನ್ನು ತಿಳಿಸುತ್ತದೆ?",
      Telugu: "'WET FLOOR' బోర్డు చదవండి. ఇది మీకు ఏం చెబుతుంది?",
      Tamil: "'WET FLOOR' பலகையைப் படிக்கவும். இது உங்களுக்கு என்ன சொல்கிறது?"
      },
      options: {
      English: ["Sit down here", "Walk carefully", "Run fast", "No entry"],
      Hindi: ["यहाँ बैठें", "सावधानी से चलें", "तेज़ दौड़ें", "प्रवेश निषेध"],
      Kannada: ["ಇಲ್ಲೇ ಕುಳಿತುಕೊಳ್ಳಿ", "ಎಚ್ಚರಿಕೆಯಿಂದ ನಡೆಯಿರಿ", "ವೇಗವಾಗಿ ಓಡಿ", "ಪ್ರವೇಶವಿಲ್ಲ"],
      Telugu: ["ఇక్కడే కూర్చోవాలి", "జాగ్రత్తగా నడవాలి", "వేగంగా పరుగెత్తాలి", "ప్రవేశం లేదు"],
      Tamil: ["இங்கு அமரவும்", "கவனமாக நடக்கவும்", "வேகமாக ஓடவும்", "உள்ளே நுழையக் கூடாது"]
      },
      correctIndex: 1
    },
    {
      id: "senior_l4_5",
      question: {
      English: "Complete: 'My medicine bottle is in the ______.'",
      Hindi: "पूरा करें: 'My medicine bottle is in the ______.'",
      Kannada: "ಪೂರ್ಣಗೊಳಿಸಿ: 'My medicine bottle is in the ______.'",
      Telugu: "పూర్తి చేయండి: 'My medicine bottle is in the ______.'",
      Tamil: "வாக்கியத்தை நிரப்புக: 'My medicine bottle is in the ______.'"
      },
      options: {
      English: ["cabinet", "garden", "water", "street"],
      Hindi: ["cabinet (अलमारी)", "garden (बगीचा)", "water (पानी)", "street (सड़क)"],
      Kannada: ["cabinet (ಕಬೋರ್ಡ್)", "garden (ತೋಟ)", "water (ನೀರು)", "street (ರಸ್ತೆ)"],
      Telugu: ["cabinet (అలమర)", "garden (తోట)", "water (నీరు)", "street (వీధి)"],
      Tamil: ["cabinet (அலமாரி)", "garden (தோட்டம்)", "water (தண்ணீர்)", "street (தெரு)"]
      },
      correctIndex: 0
    },
    {
      id: "senior_l4_6",
      question: {
      English: "Read the sign: 'PUSH'. What should you do to the door?",
      Hindi: "संकेत पढ़ें: 'PUSH' (धकेलें)। आपको दरवाजे के साथ क्या करना चाहिए?",
      Kannada: "ಚಿಹ್ನೆಯನ್ನು ಓದಿ: 'PUSH'. ನೀವು ಬಾಗಿಲನ್ನು ಏನು ಮಾಡಬೇಕು?",
      Telugu: "'PUSH' బోర్డు చదవండి. మీరు తలుపును ఏం చేయాలి?",
      Tamil: "'PUSH' பலகையைப் படிக்கவும். நீங்கள் கதவை என்ன செய்ய வேண்டும்?"
      },
      options: {
      English: ["Lock the door", "Push it forward", "Do not touch", "Pull it back"],
      Hindi: ["दरवाजा बंद करें", "इसे आगे धकेलें", "स्पर्श न करें", "इसे पीछे खींचें"],
      Kannada: ["ಬಾಗಿಲು ಲಾಕ್ ಮಾಡಿ", "ಅದನ್ನು ಮುಂದಕ್ಕೆ ತಳ್ಳಿ", "ಮುಟ್ಟಬೇಡಿ", "ಹಿಂದಕ್ಕೆ ಎಳೆಯಿರಿ"],
      Telugu: ["తలుపు లాక్ చేయాలి", "ముందుకు నెట్టాలి", "తాకకూడదు", "వెనుకకు లాగాలి"],
      Tamil: ["கதவை பூட்டவும்", "முன்னால் தள்ளவும்", "தொடக் கூடாது", "பின்னால் இழுக்கவும்"]
      },
      correctIndex: 1
    },
    {
      id: "senior_l4_7",
      question: {
      English: "Complete: 'I go to the park for a ______.'",
      Hindi: "पूरा करें: 'I go to the park for a ______.'",
      Kannada: "ಪೂರ್ಣಗೊಳಿಸಿ: 'I go to the park for a ______.'",
      Telugu: "పూర్తి చేయండి: 'I go to the park for a ______.'",
      Tamil: "வாக்கியத்தை நிரப்புக: 'I go to the park for a ______.'"
      },
      options: {
      English: ["sleep", "drink", "bath", "walk"],
      Hindi: ["sleep (नींद)", "drink (पेय)", "bath (स्नान)", "walk (सैर)"],
      Kannada: ["sleep (ನಿದ್ರೆ)", "drink (ಪಾನೀಯ)", "bath (ಸ್ನಾನ)", "walk (ನಡಿಗೆ)"],
      Telugu: ["sleep (నిద్ర)", "drink (త్రాగడం)", "bath (స్నానం)", "walk (నడక)"],
      Tamil: ["sleep (தூக்கம்)", "drink (குடிப்பதற்கு)", "bath (குளியல்)", "walk (நடைப்பயிற்சி)"]
      },
      correctIndex: 3
    },
    {
      id: "senior_l4_8",
      question: {
      English: "Read the clinic sign: 'WAITING ROOM'. What is this place for?",
      Hindi: "क्लिनिक का बोर्ड पढ़ें: 'WAITING ROOM' (प्रतीक्षा कक्ष)। यह स्थान किस लिए है?",
      Kannada: "ಕ್ಲಿನಿಕ್ ಬೋರ್ಡ್ ಓದಿ: 'WAITING ROOM'. ಇದು ಯಾವುದಕ್ಕಾಗಿ ಇರುವ ಸ್ಥಳ?",
      Telugu: "క్లినిక్ బోర్డు చదవండి: 'WAITING ROOM'. ఈ స్థలం దేనికి ఉపయోగపడుతుంది?",
      Tamil: "மருத்துவமனைப் பலகையைப் படிக்கவும்: 'WAITING ROOM'. இந்த இடம் எதற்கானது?"
      },
      options: {
      English: ["Eating lunch", "Buying medicines", "Sleeping at night", "Waiting for doctor"],
      Hindi: ["दोपहर का भोजन खाने के लिए", "दवाएं खरीदने के लिए", "रात में सोने के लिए", "डॉक्टर की प्रतीक्षा करने के लिए"],
      Kannada: ["ಊಟ ಮಾಡಲು", "ಔಷಧ ಖರೀದಿಸಲು", "ರಾತ್ರಿ ಮಲಗಲು", "ವೈದ್ಯರಿಗಾಗಿ ಕಾಯಲು"],
      Telugu: ["భోజనం చేయడానికి", "మందులు కొనడానికి", "రాత్రి పడుకోవడానికి", "వైద్యుడి కోసం వేచి ఉండటానికి"],
      Tamil: ["மதிய உணவு சாப்பிட", "மருந்து வாங்க", "இரவில் தூங்க", "மருத்துவருக்காகக் காத்திருக்க"]
      },
      correctIndex: 3
    },
    {
      id: "senior_l4_9",
      question: {
      English: "Complete: 'A clock shows us the ______.'",
      Hindi: "पूरा करें: 'A clock shows us the ______.'",
      Kannada: "ಪೂರ್ಣಗೊಳಿಸಿ: 'A clock shows us the ______.'",
      Telugu: "పూర్తి చేయండి: 'A clock shows us the ______.'",
      Tamil: "வாக்கியத்தை நிரப்புக: 'A clock shows us the ______.'"
      },
      options: {
      English: ["food", "time", "road", "water"],
      Hindi: ["food (भोजन)", "time (समय)", "road (सड़क)", "water (पानी)"],
      Kannada: ["food (ಆಹಾರ)", "time (ಸಮಯ)", "road (ರಸ್ತೆ)", "water (ನೀರು)"],
      Telugu: ["food (ఆహారం)", "time (సమయం)", "road (రోడ్డు)", "water (నీరు)"],
      Tamil: ["food (உணவு)", "time (நேரம்)", "road (சாலை)", "water (தண்ணீர்)"]
      },
      correctIndex: 1
    },
    {
      id: "senior_l4_10",
      question: {
      English: "Read the bus stand sign: 'QUEUE UP'. What should you do?",
      Hindi: "बस स्टैंड का बोर्ड पढ़ें: 'QUEUE UP' (कतार लगाएं)। आपको क्या करना चाहिए?",
      Kannada: "ಬಸ್ ಸ್ಟ್ಯಾಂಡ್ ಬೋರ್ಡ್ ಓದಿ: 'QUEUE UP'. ನೀವು ಏನು ಮಾಡಬೇಕು?",
      Telugu: "బస్సు స్టాండ్ వద్ద బోర్డు చదవండి: 'QUEUE UP'. మీరు ఏమి చేయాలి?",
      Tamil: "பேருந்து நிலையப் பலகையைப் படிக்கவும்: 'QUEUE UP'. நீங்கள் என்ன செய்ய வேண்டும்?"
      },
      options: {
      English: ["Shout loud", "Sit on the floor", "Run to the door", "Stand in a line"],
      Hindi: ["ज़ोर से चिल्लाएं", "फर्श पर बैठें", "दरवाजे की ओर दौड़ें", "एक पंक्ति में खड़े रहें"],
      Kannada: ["ಜೋರಾಗಿ ಕಿರುಚಿ", "ನೆಲದ ಮೇಲೆ ಕುಳಿತುಕೊಳ್ಳಿ", "ಬಾಗಿಲಿಗೆ ಓಡಿ", "ಸಾಲಿನಲ್ಲಿ ನಿಲ್ಲಿ"],
      Telugu: ["గట్టిగా అరవాలి", "నేలపై కూర్చోవాలి", "తలుపు వైపు పరుగెత్తాలి", "వరుసలో నిలబడాలి"],
      Tamil: ["சத்தமாக கத்தவும்", "தரையில் அமரவும்", "கதவை நோக்கி ஓடவும்", "வரிசையில் நிற்கவும்"]
      },
      correctIndex: 3
    }
    ]
  },
  senior_level_5: {
    title: {
    English: "Level 5 Assessment (SENIOR)",
    Hindi: "स्तर 5 आकलन (वरिष्ठ नागरिक)",
    Kannada: "ಹಂತ 5 ಮೌಲ್ಯಮಾಪನ (ಹಿರಿಯ ನಾಗರಿಕರು)",
    Telugu: "స్థాయి 5 అంచనా (వృద్ధులు)",
    Tamil: "நிலை 5 மதிப்பீடு (முதியவர்கள்)"
    },
    description: {
    English: "Test checking capability at Level 5 for senior learners.",
    Hindi: "वरिष्ठ शिक्षार्थियों के लिए स्तर 5 क्षमता का परीक्षण।",
    Kannada: "ಕಲಿಯುವವರಿಗೆ ಹಂತ 5 ಸಾಮರ್ಥ್ಯವನ್ನು ಪರಿಶೀಲಿಸುವ ಪರೀಕ್ಷೆ.",
    Telugu: "అభ్యాసకుల కోసం స్థాయి 5 సామర్థ్య పరీక్ష.",
    Tamil: "கற்பவர்களுக்கான நிலை 5 திறனைச் சோதிக்கும் மதிப்பீடு."
    },
    questions: [
    {
      id: "senior_l5_1",
      question: {
      English: "Read this medical label:\n\nTake 1 capsule twice daily, once in the morning and once at night after food.\n\nHow many capsules should you take in one day?",
      Hindi: "इस मेडिकल लेबल को पढ़ें:\n\nदिन में दो बार 1 कैप्सूल लें, एक बार सुबह और एक बार रात को भोजन के बाद।\n\nआपको एक दिन में कितने कैप्सूल लेने चाहिए?",
      Kannada: "ಈ ಔಷಧ ಚೀಟಿಯನ್ನು ಓದಿ:\n\nದಿನಕ್ಕೆ ಎರಡು ಬಾರಿ 1 ಕ್ಯಾಪ್ಸುಲ್ ತೆಗೆದುಕೊಳ್ಳಿ, ಒಮ್ಮೆ ಬೆಳಿಗ್ಗೆ ಮತ್ತು ಒಮ್ಮೆ ರಾತ್ರಿ ಊಟದ ನಂತರ.\n\nದಿನಕ್ಕೆ ಎಷ್ಟು ಕ್ಯಾಪ್ಸುಲ್ ತೆಗೆದುಕೊಳ್ಳಬೇಕು?",
      Telugu: "ఈ మందుల చీటిని చదవండి:\n\nరోజుకు రెండు సార్లు 1 క్యాప్సూల్ వేసుకోండి, ఉదయం ఒకసారి మరియు రాత్రి భోజనం తర్వాత ఒకసారి.\n\nరోజుకు ఎన్ని క్యాప్సూల్స్ వేసుకోవాలి?",
      Tamil: "இந்த மருத்துவச் சீட்டைப் படிக்கவும்:\n\nஒரு நாளைக்கு இரண்டு முறை 1 மாத்திரை வீதம், காலையில் ஒரு முறையும் இரவில் உணவுக்குப் பின் ஒரு முறையும் சாப்பிடவும்.\n\nஒரு நாளைக்கு எத்தனை மாத்திரைகள் சாப்பிட வேண்டும்?"
      },
      options: {
      English: ["Four capsules", "One capsule", "Two capsules", "Three capsules"],
      Hindi: ["चार कैप्सूल", "एक कैप्सूल", "दो कैप्सूल", "तीन कैप्सूल"],
      Kannada: ["ನಾಲ್ಕು ಕ್ಯಾಪ್ಸುಲ್", "ಒಂದು ಕ್ಯಾಪ್ಸುಲ್", "ಎರಡು ಕ್ಯಾಪ್ಸುಲ್", "ಮೂರು ಕ್ಯಾಪ್ಸುಲ್"],
      Telugu: ["నాలుగు క్యాప్సూల్స్", "ఒక క్యాప్సూల్", "రెండు క్యాప్సూల్స్", "మూడు క్యాప్సూల్స్"],
      Tamil: ["நான்கு மாத்திரைகள்", "ஒரு மாத்திரை", "இரண்டு மாத்திரைகள்", "மூன்று மாத்திரைகள்"]
      },
      correctIndex: 2
    },
    {
      id: "senior_l5_2",
      question: {
      English: "Read the medical label again. When should you take the capsules?",
      Hindi: "मेडिकल लेबल को दोबारा पढ़ें। आपको कैप्सूल कब लेने चाहिए?",
      Kannada: "ಔಷಧ ಚೀಟಿಯನ್ನು ಮತ್ತೆ ಓದಿ. ಕ್ಯಾಪ್ಸುಲ್ ಅನ್ನು ಯಾವಾಗ ತೆಗೆದುಕೊಳ್ಳಬೇಕು?",
      Telugu: "మందుల చీటిని మళ్లీ చదవండి. క్యాప్సూల్స్ ఎప్పుడు వేసుకోవాలి?",
      Tamil: "மருத்துவச் சீட்டை மீண்டும் படிக்கவும். மாத்திரைகளை எப்போது சாப்பிட வேண்டும்?"
      },
      options: {
      English: ["After food", "Before bath", "Before food", "Empty stomach"],
      Hindi: ["भोजन के बाद", "स्नान से पहले", "भोजन से पहले", "खाली पेट"],
      Kannada: ["ಊಟದ ನಂತರ", "ಸ್ನಾನಕ್ಕೆ ಮುನ್ನ", "ಊಟಕ್ಕೆ ಮುನ್ನ", "ಖಾಲಿ ಹೊಟ್ಟೆಯಲ್ಲಿ"],
      Telugu: ["భోజనం తర్వాత", "స్నానానికి ముందు", "భోజనానికి ముందు", "పరగడుపున"],
      Tamil: ["உணவுக்குப் பின்", "குளிப்பதற்கு முன்", "உணவுக்கு முன்", "வெறும் வயிற்றில்"]
      },
      correctIndex: 0
    },
    {
      id: "senior_l5_3",
      question: {
      English: "Read this family letter:\n\nDear Grandpa, I will visit you on Saturday evening at 4 PM. Please keep the gate unlocked.\n\nOn which day is the grandchild visiting?",
      Hindi: "इस पारिवारिक पत्र को पढ़ें:\n\nप्रिय दादाजी, मैं शनिवार शाम 4 बजे आपसे मिलने आऊंगा। कृपया गेट खुला रखें।\n\nपोता/पोती किस दिन मिलने आ रहा/रही है?",
      Kannada: "ಈ ಪತ್ರವನ್ನು ಓದಿ:\n\nಪ್ರೀತಿಯ ತಾತ, ನಾನು ಶನಿವಾರ ಸಂಜೆ 4 ಗಂಟೆಗೆ ನಿಮ್ಮನ್ನು ಭೇಟಿ ಮಾಡಲು ಬರುತ್ತೇನೆ. ದಯವಿಟ್ಟು ಗೇಟ್ ಲಾಕ್ ಮಾಡಬೇಡಿ.\n\nಮೊಮ್ಮಕ್ಕಳು ಯಾವ ದಿನ ಬರುತ್ತಿದ್ದಾರೆ?",
      Telugu: "ఈ కుటుంబ లేఖను చదవండి:\n\nప్రియమైన తాతయ్య, నేను శనివారం సాయంత్రం 4 గంటలకు నిన్ను కలవడానికి వస్తాను. దయచేసి గేటుకు తాళం వేయకుండా ఉంచండి.\n\nమనవడు/మనవరాలు ఏ రోజున వస్తున్నారు?",
      Tamil: "இந்தக் குடும்பக் கடிதத்தைப் படிக்கவும்:\n\nஅன்புள்ள தாத்தா, நான் சனிக்கிழமை மாலை 4 மணிக்கு உங்களைப் பார்க்க வருவேன். கதவைப் பூட்டாமல் வைத்திருக்கவும்.\n\nபேரன்/பேத்தி எந்த நாளில் பார்க்க வருகிறார்?"
      },
      options: {
      English: ["Saturday", "Monday", "Sunday", "Friday"],
      Hindi: ["शनिवार", "सोमवार", "रविवार", "शुक्रवार"],
      Kannada: ["ಶನಿವಾರ", "ಸೋಮವಾರ", "ಭಾನುವಾರ", "ಶುಕ್ರವಾರ"],
      Telugu: ["శనివారం", "సోమవారం", "ఆదివారం", "శుక్రవారం"],
      Tamil: ["சனிக்கிழமை", "திங்கட்கிழமை", "ஞாயிற்றுக்கிழமை", "வெள்ளிக்கிழமை"]
      },
      correctIndex: 0
    },
    {
      id: "senior_l5_4",
      question: {
      English: "Read the letter again. What time is the visitor arriving?",
      Hindi: "पत्र दोबारा पढ़ें। आगंतुक किस समय पहुंच रहा है?",
      Kannada: "ಪತ್ರವನ್ನು ಮತ್ತೆ ಓದಿ. ಬರುವವರು ಯಾವ ಸಮಯಕ್ಕೆ ಬರುತ್ತಾರೆ?",
      Telugu: "లేఖను మళ్లీ చదవండి. వారు ఏ సమయానికి వస్తున్నారు?",
      Tamil: "கடிதத்தை மீண்டும் படிக்கவும். வருபவர் எத்தனை மணிக்கு வருகிறார்?"
      },
      options: {
      English: ["6 PM", "10 AM", "2 PM", "4 PM"],
      Hindi: ["शाम 6 बजे", "सुबह 10 बजे", "दोपहर 2 बजे", "शाम 4 बजे"],
      Kannada: ["ಸಂಜೆ 6 ಕ್ಕೆ", "ಬೆಳಿಗ್ಗೆ 10 ಕ್ಕೆ", "ಮಧ್ಯಾಹ್ನ 2 ಕ್ಕೆ", "ಸಂಜೆ 4 ಕ್ಕೆ"],
      Telugu: ["సాయంత్రం 6 గంటలకు", "ఉదయం 10 గంటలకు", "మధ్యాహ్నం 2 గంటలకు", "సాయంత్రం 4 గంటలకు"],
      Tamil: ["மாலை 6 மணி", "காலை 10 மணி", "மதியம் 2 மணி", "மாலை 4 மணி"]
      },
      correctIndex: 3
    },
    {
      id: "senior_l5_5",
      question: {
      English: "Read this park notice:\n\nThe senior citizen walking track is open from 6:00 AM to 9:00 AM daily. Please do not run on this track.\n\nWhat is the track used for?",
      Hindi: "इस पार्क नोटिस को पढ़ें:\n\nवरिष्ठ नागरिक वॉकिंग ट्रैक रोजाना सुबह 6:00 बजे से सुबह 9:00 बजे तक खुला रहता है। कृपया इस ट्रैक पर न दौड़ें।\n\nइस ट्रैक का उपयोग किस लिए किया जाता है?",
      Kannada: "ಉದ್ಯಾನವನದ ಈ ಸೂಚನೆಯನ್ನು ಓದಿ:\n\nಹಿರಿಯ ನಾಗರಿಕರ ವಾಕಿಂಗ್ ಟ್ರ್ಯಾಕ್ ಪ್ರತಿದಿನ ಬೆಳಿಗ್ಗೆ 6:00 ರಿಂದ 9:00 ರವರೆಗೆ ತೆರೆದಿರುತ್ತದೆ. ದಯವಿಟ್ಟು ಈ ಹಾದಿಯಲ್ಲಿ ಓಡಬೇಡಿ.\n\nಈ ಹಾದಿಯನ್ನು ಯಾವುದಕ್ಕಾಗಿ ಬಳಸಲಾಗುತ್ತದೆ?",
      Telugu: "ఈ పార్క్ నోటీసు చదవండి:\nడైలీ ఉదయం 6:00 నుండి 9:00 వరకు సీనియర్ సిటిజన్స్ నడక దారి తెరిచి ఉంటుంది. దయచేసి ఈ దారిపై పరుగెత్తకండి.\n\nఈ దారి దేనికి ఉపయోగించబడుతుంది?",
      Tamil: "இந்த பூங்கா அறிவிப்பைப் படிக்கவும்:\n\nமுதியோர்களுக்கான நடைபயிற்சி பாதை தினமும் காலை 6:00 மணி முதல் காலை 9:00 மணி வரை திறந்திருக்கும். இந்தப் பாதையில் ஓட வேண்டாம்.\n\nஇந்தப் பாதை எதற்காகப் பயன்படுத்தப்படுகிறது?"
      },
      options: {
      English: ["Cycling", "Playing football", "Running", "Walking"],
      Hindi: ["साइकिल चलाने के लिए", "फुटबॉल खेलने के लिए", "दौड़ने के लिए", "टहलने (Walking) के लिए"],
      Kannada: ["ಸೈಕಲ್ ತುಳಿಯಲು", "ಫುಟ್‌ಬಾಲ್ ಆಡಲು", "ಓಡಲು", "ನಡೆಯಲು (Walking)"],
      Telugu: ["సైకిల్ తొక్కడానికి", "ఫుట్ బాల్ ఆడటానికి", "పరుగెత్తడానికి", "నడవడానికి (Walking)"],
      Tamil: ["சைக்கிள் ஓட்ட", "கால்பந்து விளையாட", "ஓடுவதற்கு", "நடைபயிற்சிக்கு (Walking)"]
      },
      correctIndex: 3
    },
    {
      id: "senior_l5_6",
      question: {
      English: "Read the park notice again. When does the track close in the morning?",
      Hindi: "पार्क नोटिस को दोबारा पढ़ें। सुबह ट्रैक किस समय बंद होता है?",
      Kannada: "ಸೂಚನೆಯನ್ನು ಮತ್ತೆ ಓದಿ. ಬೆಳಿಗ್ಗೆ ಈ ಹಾದಿ ಯಾವಾಗ ಮುಚ್ಚುತ್ತದೆ?",
      Telugu: "పార్క్ నోటీసు మళ్లీ చదవండి. ఉదయం నడక దారి ఏ సమయానికి మూసివేస్తారు?",
      Tamil: "பூங்கா அறிவிப்பை மீண்டும் படிக்கவும். காலையில் இந்த பாதை எப்போது மூடப்படும்?"
      },
      options: {
      English: ["6:00 AM", "8:00 AM", "10:00 AM", "9:00 AM"],
      Hindi: ["सुबह 6:00 बजे", "सुबह 8:00 बजे", "सुबह 10:00 बजे", "सुबह 9:00 बजे"],
      Kannada: ["ಬೆಳಿಗ್ಗೆ 6:00", "ಬೆಳಿಗ್ಗೆ 8:00", "ಬೆಳಿಗ್ಗೆ 10:00", "ಬೆಳಿಗ್ಗೆ 9:00"],
      Telugu: ["ఉదయం 6:00 గంటలకు", "ఉదయం 8:00 గంటలకు", "ఉదయం 10:00 గంటలకు", "ఉదయం 9:00 గంటలకు"],
      Tamil: ["காலை 6:00 மணி", "காலை 8:00 மணி", "காலை 10:00 மணி", "காலை 9:00 மணி"]
      },
      correctIndex: 3
    },
    {
      id: "senior_l5_7",
      question: {
      English: "Read this doctor recipe:\n\nUse three drops of eye drops in left eye. Do it before going to sleep.\n\nWhere should you use the eye drops?",
      Hindi: "डॉक्टर के इस नुस्खे को पढ़ें:\n\nबाँयी आँख में आई ड्रॉप की तीन बूंदें डालें। सोने जाने से पहले ऐसा करें।\n\nआपको आई ड्रॉप का उपयोग कहाँ करना चाहिए?",
      Kannada: "ವೈದ್ಯರ ಈ ಸೂಚನೆಯನ್ನು ಓದಿ:\n\nಎಡಗಣ್ಣಿಗೆ ಮೂರು ಹನಿ ಐ ಡ್ರಾಪ್ಸ್ ಹಾಕಿ. ಮಲಗುವ ಮುನ್ನ ಇದನ್ನು ಮಾಡಿ.\n\nಐ ಡ್ರಾಪ್ಸ್ ಅನ್ನು ಎಲ್ಲಿ ಹಾಕಬೇಕು?",
      Telugu: "ఈ డాక్టర్ సూచన చదవండి:\n\nఎడమ కంటిలో మూడు చుక్కల ఐ డ్రాప్స్ వేయండి. నిద్రపోయే ముందు ఇలా చేయండి.\n\nఐ డ్రాప్స్ ఎక్కడ వేయాలి?",
      Tamil: "மருத்துவரின் இந்த குறிப்பைப் படிக்கவும்:\n\nஇடது கண்ணில் மூன்று சொட்டுகள் மருந்து ஊற்றவும். தூங்குவதற்கு முன் இதைச் செய்யவும்.\n\nகண் மருந்தை எங்கு ஊற்ற வேண்டும்?"
      },
      options: {
      English: ["Right eye", "Both eyes", "Ears", "Left eye"],
      Hindi: ["दाँयी आँख", "दोनों आँखें", "कान", "बाँयी आँख (Left eye)"],
      Kannada: ["ಬಲಗಣ್ಣು", "ಎರಡೂ ಕಣ್ಣುಗಳು", "ಕಿವಿಗಳು", "ಎಡಗಣ್ಣು (Left eye)"],
      Telugu: ["కుడి కన్ను", "రెండు కళ్లు", "చెవులు", "ఎడమ కన్ను (Left eye)"],
      Tamil: ["வலது கண்", "இரு கண்கள்", "காதுகள்", "இடது கண் (Left eye)"]
      },
      correctIndex: 3
    },
    {
      id: "senior_l5_8",
      question: {
      English: "Read the doctor recipe again. How many drops should you use?",
      Hindi: "डॉक्टर के नुस्खे को दोबारा पढ़ें। आपको कितनी बूंदें इस्तेमाल करनी चाहिए?",
      Kannada: "ವೈದ್ಯರ ಸೂಚನೆಯನ್ನು ಮತ್ತೆ ಓದಿ. ಎಷ್ಟು ಹನಿಗಳನ್ನು ಹಾಕಬೇಕು?",
      Telugu: "వైద్యుడి సూచనను మళ్లీ చదవండి. ఎన్ని చుక్కలు వేసుకోవాలి?",
      Tamil: "மருத்துவரின் குறிப்பை மீண்டும் படிக்கவும். எத்தனை சொட்டுகள் ஊற்ற வேண்டும்?"
      },
      options: {
      English: ["One drop", "Four drops", "Two drops", "Three drops"],
      Hindi: ["एक बूंद", "चार बूंदें", "दो बूंदें", "तीन बूंदें"],
      Kannada: ["ಒಂದು ಹನಿ", "ನಾಲ್ಕು ಹನಿಗಳು", "ಎರಡು ಹನಿಗಳು", "ಮೂರು ಹನಿಗಳು"],
      Telugu: ["ఒక చుక్క", "నాలుగు చుక్కలు", "రెండు చుక్కలు", "మూడు చుక్కలు"],
      Tamil: ["ஒரு சொட்டு", "நான்கு சொட்டுகள்", "இரண்டு சொட்டுகள்", "மூன்று சொட்டுகள்"]
      },
      correctIndex: 3
    },
    {
      id: "senior_l5_9",
      question: {
      English: "Read this news bulletin:\n\nThe local market will remain closed on Wednesday for cleanliness drive. It will reopen on Thursday.\n\nOn which day is the market closed?",
      Hindi: "इस समाचार बुलेटिन को पढ़ें:\n\nस्वच्छता अभियान के लिए स्थानीय बाजार बुधवार को बंद रहेगा। यह गुरुवार को फिर से खुलेगा।\n\nबाजार किस दिन बंद रहता है?",
      Kannada: "ಈ ಸುದ್ದಿ ಓದಿ:\n\nಸ್ವಚ್ಛತಾ ಅಭಿಯಾನಕ್ಕಾಗಿ ಸ್ಥಳೀಯ ಮಾರುಕಟ್ಟೆ ಬುಧವಾರ ಮುಚ್ಚಿರುತ್ತದೆ. ಅದು ಗುರುವಾರ ಮತ್ತೆ ತೆರೆಯುತ್ತದೆ.\n\nಮಾರುಕಟ್ಟೆ ಯಾವ ದಿನ ಮುಚ್ಚಿರುತ್ತದೆ?",
      Telugu: "ఈ వార్తను చదవండి:\n\nపరిశుభ్రత కార్యక్రమం కోసం స్థానిక మార్కెట్ బుధవారం మూసివేయబడుతుంది. ఇది గురువారం తిరిగి తెరవబడుతుంది.\n\nమార్కెట్ ఏ రోజున మూసివేస్తారు?",
      Tamil: "இந்த செய்தி அறிவிப்பைப் படிக்கவும்:\n\nதுப்புரவுப் பணி காரணமாக உள்ளூர் சந்தை புதன்கிழமை மூடப்பட்டிருக்கும். இது வியாழக்கிழமை மீண்டும் திறக்கப்படும்.\n\nசந்தை எந்த நாளில் மூடப்பட்டிருக்கும்?"
      },
      options: {
      English: ["Monday", "Friday", "Wednesday", "Thursday"],
      Hindi: ["सोमवार", "शुक्रवार", "बुधवार", "गुरुवार"],
      Kannada: ["ಸೋಮವಾರ", "ಶುಕ್ರವಾರ", "ಬುಧವಾರ", "ಗುರುವಾರ"],
      Telugu: ["సోమవారం", "శుక్రవారం", "బుధవారం", "గురువారం"],
      Tamil: ["திங்கட்கிழமை", "வெள்ளிக்கிழமை", "புதன்கிழமை", "வியாழக்கிழமை"]
      },
      correctIndex: 2
    },
    {
      id: "senior_l5_10",
      question: {
      English: "Read the news bulletin again. Why is the market closed?",
      Hindi: "समाचार बुलेटिन को दोबारा पढ़ें। बाजार क्यों बंद है?",
      Kannada: "ಸುದ್ದಿಯನ್ನು ಮತ್ತೆ ಓದಿ. ಮಾರುಕಟ್ಟೆ ಏಕೆ ಮುಚ್ಚಿರುತ್ತದೆ?",
      Telugu: "వార్తను మళ్లీ చదవండి. మార్కెట్ ఎందుకు మూసివేస్తున్నారు?",
      Tamil: "செய்தியை மீண்டும் படிக்கவும். சந்தை ஏன் மூடப்பட்டுள்ளது?"
      },
      options: {
      English: ["Rain warning", "Holiday festival", "Strike", "Cleanliness drive"],
      Hindi: ["बारिश की चेतावनी", "छुट्टी का त्योहार", "हड़ताल", "स्वच्छता अभियान (Cleanliness drive)"],
      Kannada: ["ಮಳೆ ಎಚ್ಚರಿಕೆ", "ಹಬ್ಬದ ರಜೆ", "ಮುಷ್ಕರ", "ಸ್ವಚ್ಛತಾ ಅಭಿಯಾನ (Cleanliness drive)"],
      Telugu: ["వర్షం హెచ్చరిక", "పండుగ సెలవు", "సమ్మె", "పరిశుభ్రత కార్యక్రమం (Cleanliness drive)"],
      Tamil: ["மழை எச்சரிக்கை", "பண்டிகை விடுமுறை", "வேலைநிறுத்தம்", "துப்புரவுப் பணி (Cleanliness drive)"]
      },
      correctIndex: 3
    }
    ]
  }
};
