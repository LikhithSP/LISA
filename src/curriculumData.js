// LISA Multilingual Curriculum & Shuffled Diagnostic Assessment Pools
import { assessmentQuestions } from "./assessmentQuestionsData.js";
import { assessmentReadingWriting } from "./assessmentReadingWritingData.js";


export const levelDefinitions = {
  English: [
    { level: 1, name: "Emerging Reader", desc: "Identify letter shapes, basic vowel/consonant sounds, and animal/object naming." },
    { level: 2, name: "Developing Reader", desc: "Form 2-3 letter words, basic nouns, spelling structures, and common daily verbs." },
    { level: 3, name: "Sentence Constructor", desc: "Construct short sentences, simple commands, pronouns, and basic greetings." },
    { level: 4, name: "Practical Comprehender", desc: "Understand street signs, warnings, shopping bills, and simple instruction cards." },
    { level: 5, name: "Independent Reader", desc: "Read mobile alerts, utility bills, fill registration forms, and type basic replies." }
  ],
  Hindi: [
    { level: 1, name: "उभरता पाठक (Emerging)", desc: "अक्षरों (स्वर/व्यंजन) की आकृतियों, उनकी ध्वनियों और बुनियादी वस्तुओं के नामों की पहचान।" },
    { level: 2, name: "विकासशील पाठक (Developing)", desc: "बिना मात्रा और मात्रा वाले दो से तीन अक्षरों के सरल शब्द बनाना।" },
    { level: 3, name: "वाक्य निर्माता (Constructor)", desc: "छोटे वाक्यों, सर्वनामों, आम क्रियाओं और सरल अभिवादनों का अभ्यास।" },
    { level: 4, name: "व्यावहारिक समझ (Comprehender)", desc: "सड़क के संकेत, चेतावनी निर्देश, रसीदें और सरल नियमों को पढ़ना।" },
    { level: 5, name: "स्वतंत्र पाठक (Independent)", desc: "मोबाइल संदेश पढ़ना, बुनियादी फॉर्म भरना और सरल डिजिटल कार्य करना।" }
  ],
  Kannada: [
    { level: 1, name: "ಉದಯೋನ್ಮುಖ ಓದುಗ (Emerging)", desc: "ಅಕ್ಷರಗಳ ಆಕಾರಗಳು, ಸ್ವರ/ವ್ಯಂಜನಗಳು ಮತ್ತು ಮೂಲ ವಸ್ತುಗಳ ಹೆಸರುಗಳ ಗುರುತಿಸುವಿಕೆ." },
    { level: 2, name: "ಬೆಳೆಯುತ್ತಿರುವ ಓದುಗ (Developing)", desc: "ಸರಳವಾದ ಎರಡು ಮತ್ತು ಮೂರು ಅಕ್ಷರಗಳ ಪದಗಳ ಓದುವಿಕೆ ಮತ್ತು ಬರೆಯುವಿಕೆ." },
    { level: 3, name: "ವಾಕ್ಯ ರಚನೆಗಾರ (Constructor)", desc: "ಸಣ್ಣ ವಾಕ್ಯಗಳು, ಸರ್ವನಾಮಗಳು, ದೈನಂದಿನ ಆಜ್ಞೆಗಳು ಮತ್ತು ಶುಭಾಶಯಗಳು." },
    { level: 4, name: "ಪ್ರಾಯೋಗಿಕ ಗ್ರಹಿಕೆ (Comprehender)", desc: "ರಸ್ತೆ ಚಿಹ್ನೆಗಳು, ಎಚ್ಚರಿಕೆ ಫಲಕಗಳು, ಖರೀದಿ ಬಿಲ್‌ಗಳು ಮತ್ತು ಸರಳ ಸೂಚನೆಗಳ ಗ್ರಹಿಕೆ." },
    { level: 5, name: "ಸ್ವತಂತ್ರ ಓದುಗ (Independent)", desc: "ಮೊಬೈಲ್ ಸಂದೇಶಗಳನ್ನು ಓದುವುದು, ಸರಳ ಅರ್ಜಿಗಳನ್ನು ತುಂಬುವುದು ಮತ್ತು ದಿನ ಬಳಕೆಯ ವಿವರಗಳನ್ನು ಅರ್ಥೈಸಿಕೊಳ್ಳುವುದು." }
  ],
  Telugu: [
    { level: 1, name: "ఎదుగుతున్న పాఠకుడు (Emerging)", desc: "అక్షరాల ఆకారాలు, అచ్చులు/హల్లులు మరియు ప్రాథమిక వస్తువుల పేర్ల గుర్తింపు." },
    { level: 2, name: "అభివృద్ధి చెందుతున్న పాఠకుడు (Developing)", desc: "సరళమైన రెండు మరియు మూడు అక్షరాల పదాలు, గుణింతాల పరిచయం." },
    { level: 3, name: "వాక్య నిర్మాత (Constructor)", desc: "చిన్న వాక్యాలు, సర్వనామాలు, ప్రాథమిక సంభాషణలు మరియు శుభాకాంక్షలు." },
    { level: 4, name: "ఆచరణాత్మక అవగాహన (Comprehender)", desc: "రహదారి సంకేతాలు, హెచ్చరికలు, షాపింగ్ బిల్లులు మరియు సాధారణ నోటీసులను అర్థం చేసుకోవడం." },
    { level: 5, name: "స్వతంత్ర పాఠకుడు (Independent)", desc: "ఫోన్ మెసేజ్లు చదవడం, సాధారణ ఫారమ్లను నింపడం మరియు బిల్లుల వివరాలు చదవడం." }
  ],
  Tamil: [
    { level: 1, name: "உருவாகும் வாசகர் (Emerging)", desc: "உயிர்/மெய் எழுத்துக்களின் வடிவங்கள், உச்சரிப்பு மற்றும் எளிய பொருள்களின் பெயர்கள் அறிதல்." },
    { level: 2, name: "வளரும் வாசகர் (Developing)", desc: "இரண்டு மற்றும் மூன்று எழுத்துக்களைக் கொண்ட எளிய சொற்கள், பெயர்கள் மற்றும் வினைகளை உருவாக்குதல்." },
    { level: 3, name: "வாக்கியம் அமைப்பவர் (Constructor)", desc: "சிறு சொற்றொடர்கள், எளிய கட்டளைகள், பிரதிபெயர்கள் மற்றும் வாழ்த்துகள்." },
    { level: 4, name: "நடைமுறைப் புரிதல் (Comprehender)", desc: "சாலைக் குறியீடுகள், எச்சரிக்கைப் பலகைகள், பில்கள் மற்றும் எளிய விளம்பரங்களைப் புரிந்துகொள்ளுதல்." },
    { level: 5, name: "சுயாதீன வாசகர் (Independent)", desc: "மெசேஜ்களை வாசித்தல், விண்ணப்பப் படிவங்களை நிரப்புதல் மற்றும் பயன்பாட்டுக் கட்டணங்களைப் புரிந்துகொள்ளுதல்." }
  ]
};

export const initialAssessmentPool = {
  English: {
    tier1_emerging: {
      reading: [
        { id: "en_r_t1_1", targetText: "English reading sample for level 1" },
        { id: "en_r_t1_2", targetText: "English reading sample two for level 1" }
      ],
      comprehension: [
        {
          id: "en_c_t1_1",
          question: "Level 1 comprehension question for English?",
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctOption: "Option A"
        },
        {
          id: "en_c_t1_2",
          question: "Second level 1 comprehension question for English?",
          options: ["Option 1", "Option 2", "Option 3", "Option 4"],
          correctOption: "Option 2"
        }
      ],
      writing: [
        {
          id: "en_w_t1_1",
          prompt: "Write a sentence appropriate for level 1 English.",
          evaluator: (text) => {
            if (text.length > 5) return { score: 10, feedback: "Good effort!" };
            return { score: 5, feedback: "Please write more." };
          }
        }
      ]
    },
    tier2_developing: {
      reading: [
        { id: "en_r_t2_1", targetText: "English reading sample for level 2" },
        { id: "en_r_t2_2", targetText: "English reading sample two for level 2" }
      ],
      comprehension: [
        {
          id: "en_c_t2_1",
          question: "Level 2 comprehension question for English?",
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctOption: "Option A"
        },
        {
          id: "en_c_t2_2",
          question: "Second level 2 comprehension question for English?",
          options: ["Option 1", "Option 2", "Option 3", "Option 4"],
          correctOption: "Option 2"
        }
      ],
      writing: [
        {
          id: "en_w_t2_1",
          prompt: "Write a sentence appropriate for level 2 English.",
          evaluator: (text) => {
            if (text.length > 5) return { score: 10, feedback: "Good effort!" };
            return { score: 5, feedback: "Please write more." };
          }
        }
      ]
    },
    tier3_constructor: {
      reading: [
        { id: "en_r_t3_1", targetText: "English reading sample for level 3" },
        { id: "en_r_t3_2", targetText: "English reading sample two for level 3" }
      ],
      comprehension: [
        {
          id: "en_c_t3_1",
          question: "Level 3 comprehension question for English?",
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctOption: "Option A"
        },
        {
          id: "en_c_t3_2",
          question: "Second level 3 comprehension question for English?",
          options: ["Option 1", "Option 2", "Option 3", "Option 4"],
          correctOption: "Option 2"
        }
      ],
      writing: [
        {
          id: "en_w_t3_1",
          prompt: "Write a sentence appropriate for level 3 English.",
          evaluator: (text) => {
            if (text.length > 5) return { score: 10, feedback: "Good effort!" };
            return { score: 5, feedback: "Please write more." };
          }
        }
      ]
    },
    tier4_comprehender: {
      reading: [
        { id: "en_r_t4_1", targetText: "English reading sample for level 4" },
        { id: "en_r_t4_2", targetText: "English reading sample two for level 4" }
      ],
      comprehension: [
        {
          id: "en_c_t4_1",
          question: "Level 4 comprehension question for English?",
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctOption: "Option A"
        },
        {
          id: "en_c_t4_2",
          question: "Second level 4 comprehension question for English?",
          options: ["Option 1", "Option 2", "Option 3", "Option 4"],
          correctOption: "Option 2"
        }
      ],
      writing: [
        {
          id: "en_w_t4_1",
          prompt: "Write a sentence appropriate for level 4 English.",
          evaluator: (text) => {
            if (text.length > 5) return { score: 10, feedback: "Good effort!" };
            return { score: 5, feedback: "Please write more." };
          }
        }
      ]
    },
    tier5_independent: {
      reading: [
        { id: "en_r_t5_1", targetText: "English reading sample for level 5" },
        { id: "en_r_t5_2", targetText: "English reading sample two for level 5" }
      ],
      comprehension: [
        {
          id: "en_c_t5_1",
          question: "Level 5 comprehension question for English?",
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctOption: "Option A"
        },
        {
          id: "en_c_t5_2",
          question: "Second level 5 comprehension question for English?",
          options: ["Option 1", "Option 2", "Option 3", "Option 4"],
          correctOption: "Option 2"
        }
      ],
      writing: [
        {
          id: "en_w_t5_1",
          prompt: "Write a sentence appropriate for level 5 English.",
          evaluator: (text) => {
            if (text.length > 5) return { score: 10, feedback: "Good effort!" };
            return { score: 5, feedback: "Please write more." };
          }
        }
      ]
    }
  },
  Hindi: {
    tier1_emerging: {
      reading: [
        { id: "hi_r_t1_1", targetText: "Hindi reading sample for level 1" },
        { id: "hi_r_t1_2", targetText: "Hindi reading sample two for level 1" }
      ],
      comprehension: [
        {
          id: "hi_c_t1_1",
          question: "Level 1 comprehension question for Hindi?",
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctOption: "Option A"
        },
        {
          id: "hi_c_t1_2",
          question: "Second level 1 comprehension question for Hindi?",
          options: ["Option 1", "Option 2", "Option 3", "Option 4"],
          correctOption: "Option 2"
        }
      ],
      writing: [
        {
          id: "hi_w_t1_1",
          prompt: "Write a sentence appropriate for level 1 Hindi.",
          evaluator: (text) => {
            if (text.length > 5) return { score: 10, feedback: "Good effort!" };
            return { score: 5, feedback: "Please write more." };
          }
        }
      ]
    },
    tier2_developing: {
      reading: [
        { id: "hi_r_t2_1", targetText: "Hindi reading sample for level 2" },
        { id: "hi_r_t2_2", targetText: "Hindi reading sample two for level 2" }
      ],
      comprehension: [
        {
          id: "hi_c_t2_1",
          question: "Level 2 comprehension question for Hindi?",
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctOption: "Option A"
        },
        {
          id: "hi_c_t2_2",
          question: "Second level 2 comprehension question for Hindi?",
          options: ["Option 1", "Option 2", "Option 3", "Option 4"],
          correctOption: "Option 2"
        }
      ],
      writing: [
        {
          id: "hi_w_t2_1",
          prompt: "Write a sentence appropriate for level 2 Hindi.",
          evaluator: (text) => {
            if (text.length > 5) return { score: 10, feedback: "Good effort!" };
            return { score: 5, feedback: "Please write more." };
          }
        }
      ]
    },
    tier3_constructor: {
      reading: [
        { id: "hi_r_t3_1", targetText: "Hindi reading sample for level 3" },
        { id: "hi_r_t3_2", targetText: "Hindi reading sample two for level 3" }
      ],
      comprehension: [
        {
          id: "hi_c_t3_1",
          question: "Level 3 comprehension question for Hindi?",
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctOption: "Option A"
        },
        {
          id: "hi_c_t3_2",
          question: "Second level 3 comprehension question for Hindi?",
          options: ["Option 1", "Option 2", "Option 3", "Option 4"],
          correctOption: "Option 2"
        }
      ],
      writing: [
        {
          id: "hi_w_t3_1",
          prompt: "Write a sentence appropriate for level 3 Hindi.",
          evaluator: (text) => {
            if (text.length > 5) return { score: 10, feedback: "Good effort!" };
            return { score: 5, feedback: "Please write more." };
          }
        }
      ]
    },
    tier4_comprehender: {
      reading: [
        { id: "hi_r_t4_1", targetText: "Hindi reading sample for level 4" },
        { id: "hi_r_t4_2", targetText: "Hindi reading sample two for level 4" }
      ],
      comprehension: [
        {
          id: "hi_c_t4_1",
          question: "Level 4 comprehension question for Hindi?",
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctOption: "Option A"
        },
        {
          id: "hi_c_t4_2",
          question: "Second level 4 comprehension question for Hindi?",
          options: ["Option 1", "Option 2", "Option 3", "Option 4"],
          correctOption: "Option 2"
        }
      ],
      writing: [
        {
          id: "hi_w_t4_1",
          prompt: "Write a sentence appropriate for level 4 Hindi.",
          evaluator: (text) => {
            if (text.length > 5) return { score: 10, feedback: "Good effort!" };
            return { score: 5, feedback: "Please write more." };
          }
        }
      ]
    },
    tier5_independent: {
      reading: [
        { id: "hi_r_t5_1", targetText: "Hindi reading sample for level 5" },
        { id: "hi_r_t5_2", targetText: "Hindi reading sample two for level 5" }
      ],
      comprehension: [
        {
          id: "hi_c_t5_1",
          question: "Level 5 comprehension question for Hindi?",
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctOption: "Option A"
        },
        {
          id: "hi_c_t5_2",
          question: "Second level 5 comprehension question for Hindi?",
          options: ["Option 1", "Option 2", "Option 3", "Option 4"],
          correctOption: "Option 2"
        }
      ],
      writing: [
        {
          id: "hi_w_t5_1",
          prompt: "Write a sentence appropriate for level 5 Hindi.",
          evaluator: (text) => {
            if (text.length > 5) return { score: 10, feedback: "Good effort!" };
            return { score: 5, feedback: "Please write more." };
          }
        }
      ]
    }
  },
  Kannada: {
    tier1_emerging: {
      reading: [
        { id: "ka_r_t1_1", targetText: "Kannada reading sample for level 1" },
        { id: "ka_r_t1_2", targetText: "Kannada reading sample two for level 1" }
      ],
      comprehension: [
        {
          id: "ka_c_t1_1",
          question: "Level 1 comprehension question for Kannada?",
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctOption: "Option A"
        },
        {
          id: "ka_c_t1_2",
          question: "Second level 1 comprehension question for Kannada?",
          options: ["Option 1", "Option 2", "Option 3", "Option 4"],
          correctOption: "Option 2"
        }
      ],
      writing: [
        {
          id: "ka_w_t1_1",
          prompt: "Write a sentence appropriate for level 1 Kannada.",
          evaluator: (text) => {
            if (text.length > 5) return { score: 10, feedback: "Good effort!" };
            return { score: 5, feedback: "Please write more." };
          }
        }
      ]
    },
    tier2_developing: {
      reading: [
        { id: "ka_r_t2_1", targetText: "Kannada reading sample for level 2" },
        { id: "ka_r_t2_2", targetText: "Kannada reading sample two for level 2" }
      ],
      comprehension: [
        {
          id: "ka_c_t2_1",
          question: "Level 2 comprehension question for Kannada?",
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctOption: "Option A"
        },
        {
          id: "ka_c_t2_2",
          question: "Second level 2 comprehension question for Kannada?",
          options: ["Option 1", "Option 2", "Option 3", "Option 4"],
          correctOption: "Option 2"
        }
      ],
      writing: [
        {
          id: "ka_w_t2_1",
          prompt: "Write a sentence appropriate for level 2 Kannada.",
          evaluator: (text) => {
            if (text.length > 5) return { score: 10, feedback: "Good effort!" };
            return { score: 5, feedback: "Please write more." };
          }
        }
      ]
    },
    tier3_constructor: {
      reading: [
        { id: "ka_r_t3_1", targetText: "Kannada reading sample for level 3" },
        { id: "ka_r_t3_2", targetText: "Kannada reading sample two for level 3" }
      ],
      comprehension: [
        {
          id: "ka_c_t3_1",
          question: "Level 3 comprehension question for Kannada?",
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctOption: "Option A"
        },
        {
          id: "ka_c_t3_2",
          question: "Second level 3 comprehension question for Kannada?",
          options: ["Option 1", "Option 2", "Option 3", "Option 4"],
          correctOption: "Option 2"
        }
      ],
      writing: [
        {
          id: "ka_w_t3_1",
          prompt: "Write a sentence appropriate for level 3 Kannada.",
          evaluator: (text) => {
            if (text.length > 5) return { score: 10, feedback: "Good effort!" };
            return { score: 5, feedback: "Please write more." };
          }
        }
      ]
    },
    tier4_comprehender: {
      reading: [
        { id: "ka_r_t4_1", targetText: "Kannada reading sample for level 4" },
        { id: "ka_r_t4_2", targetText: "Kannada reading sample two for level 4" }
      ],
      comprehension: [
        {
          id: "ka_c_t4_1",
          question: "Level 4 comprehension question for Kannada?",
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctOption: "Option A"
        },
        {
          id: "ka_c_t4_2",
          question: "Second level 4 comprehension question for Kannada?",
          options: ["Option 1", "Option 2", "Option 3", "Option 4"],
          correctOption: "Option 2"
        }
      ],
      writing: [
        {
          id: "ka_w_t4_1",
          prompt: "Write a sentence appropriate for level 4 Kannada.",
          evaluator: (text) => {
            if (text.length > 5) return { score: 10, feedback: "Good effort!" };
            return { score: 5, feedback: "Please write more." };
          }
        }
      ]
    },
    tier5_independent: {
      reading: [
        { id: "ka_r_t5_1", targetText: "Kannada reading sample for level 5" },
        { id: "ka_r_t5_2", targetText: "Kannada reading sample two for level 5" }
      ],
      comprehension: [
        {
          id: "ka_c_t5_1",
          question: "Level 5 comprehension question for Kannada?",
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctOption: "Option A"
        },
        {
          id: "ka_c_t5_2",
          question: "Second level 5 comprehension question for Kannada?",
          options: ["Option 1", "Option 2", "Option 3", "Option 4"],
          correctOption: "Option 2"
        }
      ],
      writing: [
        {
          id: "ka_w_t5_1",
          prompt: "Write a sentence appropriate for level 5 Kannada.",
          evaluator: (text) => {
            if (text.length > 5) return { score: 10, feedback: "Good effort!" };
            return { score: 5, feedback: "Please write more." };
          }
        }
      ]
    }
  },
  Telugu: {
    tier1_emerging: {
      reading: [
        { id: "te_r_t1_1", targetText: "Telugu reading sample for level 1" },
        { id: "te_r_t1_2", targetText: "Telugu reading sample two for level 1" }
      ],
      comprehension: [
        {
          id: "te_c_t1_1",
          question: "Level 1 comprehension question for Telugu?",
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctOption: "Option A"
        },
        {
          id: "te_c_t1_2",
          question: "Second level 1 comprehension question for Telugu?",
          options: ["Option 1", "Option 2", "Option 3", "Option 4"],
          correctOption: "Option 2"
        }
      ],
      writing: [
        {
          id: "te_w_t1_1",
          prompt: "Write a sentence appropriate for level 1 Telugu.",
          evaluator: (text) => {
            if (text.length > 5) return { score: 10, feedback: "Good effort!" };
            return { score: 5, feedback: "Please write more." };
          }
        }
      ]
    },
    tier2_developing: {
      reading: [
        { id: "te_r_t2_1", targetText: "Telugu reading sample for level 2" },
        { id: "te_r_t2_2", targetText: "Telugu reading sample two for level 2" }
      ],
      comprehension: [
        {
          id: "te_c_t2_1",
          question: "Level 2 comprehension question for Telugu?",
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctOption: "Option A"
        },
        {
          id: "te_c_t2_2",
          question: "Second level 2 comprehension question for Telugu?",
          options: ["Option 1", "Option 2", "Option 3", "Option 4"],
          correctOption: "Option 2"
        }
      ],
      writing: [
        {
          id: "te_w_t2_1",
          prompt: "Write a sentence appropriate for level 2 Telugu.",
          evaluator: (text) => {
            if (text.length > 5) return { score: 10, feedback: "Good effort!" };
            return { score: 5, feedback: "Please write more." };
          }
        }
      ]
    },
    tier3_constructor: {
      reading: [
        { id: "te_r_t3_1", targetText: "Telugu reading sample for level 3" },
        { id: "te_r_t3_2", targetText: "Telugu reading sample two for level 3" }
      ],
      comprehension: [
        {
          id: "te_c_t3_1",
          question: "Level 3 comprehension question for Telugu?",
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctOption: "Option A"
        },
        {
          id: "te_c_t3_2",
          question: "Second level 3 comprehension question for Telugu?",
          options: ["Option 1", "Option 2", "Option 3", "Option 4"],
          correctOption: "Option 2"
        }
      ],
      writing: [
        {
          id: "te_w_t3_1",
          prompt: "Write a sentence appropriate for level 3 Telugu.",
          evaluator: (text) => {
            if (text.length > 5) return { score: 10, feedback: "Good effort!" };
            return { score: 5, feedback: "Please write more." };
          }
        }
      ]
    },
    tier4_comprehender: {
      reading: [
        { id: "te_r_t4_1", targetText: "Telugu reading sample for level 4" },
        { id: "te_r_t4_2", targetText: "Telugu reading sample two for level 4" }
      ],
      comprehension: [
        {
          id: "te_c_t4_1",
          question: "Level 4 comprehension question for Telugu?",
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctOption: "Option A"
        },
        {
          id: "te_c_t4_2",
          question: "Second level 4 comprehension question for Telugu?",
          options: ["Option 1", "Option 2", "Option 3", "Option 4"],
          correctOption: "Option 2"
        }
      ],
      writing: [
        {
          id: "te_w_t4_1",
          prompt: "Write a sentence appropriate for level 4 Telugu.",
          evaluator: (text) => {
            if (text.length > 5) return { score: 10, feedback: "Good effort!" };
            return { score: 5, feedback: "Please write more." };
          }
        }
      ]
    },
    tier5_independent: {
      reading: [
        { id: "te_r_t5_1", targetText: "Telugu reading sample for level 5" },
        { id: "te_r_t5_2", targetText: "Telugu reading sample two for level 5" }
      ],
      comprehension: [
        {
          id: "te_c_t5_1",
          question: "Level 5 comprehension question for Telugu?",
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctOption: "Option A"
        },
        {
          id: "te_c_t5_2",
          question: "Second level 5 comprehension question for Telugu?",
          options: ["Option 1", "Option 2", "Option 3", "Option 4"],
          correctOption: "Option 2"
        }
      ],
      writing: [
        {
          id: "te_w_t5_1",
          prompt: "Write a sentence appropriate for level 5 Telugu.",
          evaluator: (text) => {
            if (text.length > 5) return { score: 10, feedback: "Good effort!" };
            return { score: 5, feedback: "Please write more." };
          }
        }
      ]
    }
  },
  Tamil: {
    tier1_emerging: {
      reading: [
        { id: "ta_r_t1_1", targetText: "Tamil reading sample for level 1" },
        { id: "ta_r_t1_2", targetText: "Tamil reading sample two for level 1" }
      ],
      comprehension: [
        {
          id: "ta_c_t1_1",
          question: "Level 1 comprehension question for Tamil?",
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctOption: "Option A"
        },
        {
          id: "ta_c_t1_2",
          question: "Second level 1 comprehension question for Tamil?",
          options: ["Option 1", "Option 2", "Option 3", "Option 4"],
          correctOption: "Option 2"
        }
      ],
      writing: [
        {
          id: "ta_w_t1_1",
          prompt: "Write a sentence appropriate for level 1 Tamil.",
          evaluator: (text) => {
            if (text.length > 5) return { score: 10, feedback: "Good effort!" };
            return { score: 5, feedback: "Please write more." };
          }
        }
      ]
    },
    tier2_developing: {
      reading: [
        { id: "ta_r_t2_1", targetText: "Tamil reading sample for level 2" },
        { id: "ta_r_t2_2", targetText: "Tamil reading sample two for level 2" }
      ],
      comprehension: [
        {
          id: "ta_c_t2_1",
          question: "Level 2 comprehension question for Tamil?",
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctOption: "Option A"
        },
        {
          id: "ta_c_t2_2",
          question: "Second level 2 comprehension question for Tamil?",
          options: ["Option 1", "Option 2", "Option 3", "Option 4"],
          correctOption: "Option 2"
        }
      ],
      writing: [
        {
          id: "ta_w_t2_1",
          prompt: "Write a sentence appropriate for level 2 Tamil.",
          evaluator: (text) => {
            if (text.length > 5) return { score: 10, feedback: "Good effort!" };
            return { score: 5, feedback: "Please write more." };
          }
        }
      ]
    },
    tier3_constructor: {
      reading: [
        { id: "ta_r_t3_1", targetText: "Tamil reading sample for level 3" },
        { id: "ta_r_t3_2", targetText: "Tamil reading sample two for level 3" }
      ],
      comprehension: [
        {
          id: "ta_c_t3_1",
          question: "Level 3 comprehension question for Tamil?",
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctOption: "Option A"
        },
        {
          id: "ta_c_t3_2",
          question: "Second level 3 comprehension question for Tamil?",
          options: ["Option 1", "Option 2", "Option 3", "Option 4"],
          correctOption: "Option 2"
        }
      ],
      writing: [
        {
          id: "ta_w_t3_1",
          prompt: "Write a sentence appropriate for level 3 Tamil.",
          evaluator: (text) => {
            if (text.length > 5) return { score: 10, feedback: "Good effort!" };
            return { score: 5, feedback: "Please write more." };
          }
        }
      ]
    },
    tier4_comprehender: {
      reading: [
        { id: "ta_r_t4_1", targetText: "Tamil reading sample for level 4" },
        { id: "ta_r_t4_2", targetText: "Tamil reading sample two for level 4" }
      ],
      comprehension: [
        {
          id: "ta_c_t4_1",
          question: "Level 4 comprehension question for Tamil?",
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctOption: "Option A"
        },
        {
          id: "ta_c_t4_2",
          question: "Second level 4 comprehension question for Tamil?",
          options: ["Option 1", "Option 2", "Option 3", "Option 4"],
          correctOption: "Option 2"
        }
      ],
      writing: [
        {
          id: "ta_w_t4_1",
          prompt: "Write a sentence appropriate for level 4 Tamil.",
          evaluator: (text) => {
            if (text.length > 5) return { score: 10, feedback: "Good effort!" };
            return { score: 5, feedback: "Please write more." };
          }
        }
      ]
    },
    tier5_independent: {
      reading: [
        { id: "ta_r_t5_1", targetText: "Tamil reading sample for level 5" },
        { id: "ta_r_t5_2", targetText: "Tamil reading sample two for level 5" }
      ],
      comprehension: [
        {
          id: "ta_c_t5_1",
          question: "Level 5 comprehension question for Tamil?",
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctOption: "Option A"
        },
        {
          id: "ta_c_t5_2",
          question: "Second level 5 comprehension question for Tamil?",
          options: ["Option 1", "Option 2", "Option 3", "Option 4"],
          correctOption: "Option 2"
        }
      ],
      writing: [
        {
          id: "ta_w_t5_1",
          prompt: "Write a sentence appropriate for level 5 Tamil.",
          evaluator: (text) => {
            if (text.length > 5) return { score: 10, feedback: "Good effort!" };
            return { score: 5, feedback: "Please write more." };
          }
        }
      ]
    }
  }
};

// Shuffle arrays helper
const shuffleArray = (arr) => {
  return [...arr].sort(() => 0.5 - Math.random());
};

// Map age + education level to the correct assessmentQuestions key (ageGroup_level_N)
const getAgeGroup = (ageNum) => {
  if (ageNum < 13) return "child";
  if (ageNum < 18) return "teen";
  if (ageNum < 60) return "adult";
  return "senior";
};

const getLevel = (educationLevel, ageNum) => {
  const eduStr = (educationLevel || "").toLowerCase();
  if (eduStr.includes("higher secondary") || eduStr.includes("secondary") || eduStr.includes("college")) {
    return 5;
  } else if (eduStr.includes("primary")) {
    return 3;
  } else {
    if (ageNum < 10) return 1;
    if (ageNum < 15) return 2;
    if (ageNum < 25) return 3;
    if (ageNum < 40) return 4;
    return 5;
  }
};

// Returns a randomized diagnostic assessment:
// - 10 comprehension MCQs (age+level appropriate, shuffled, multilingual)
// - 1 reading question (user reads text aloud — voice-to-text)
// - 1 writing question (user writes a short response)
// All sections are matched to the user's age group, education level, and language.
export const getRandomAssessment = (age, educationLevel, language = "English") => {
  const ageNum = parseInt(age, 10) || 20;

  const ageGroup = getAgeGroup(ageNum);
  const level = getLevel(educationLevel, ageNum);
  const key = `${ageGroup}_level_${level}`;

  // ── Comprehension MCQs ──────────────────────────────────────────
  // Fallback chain: exact key → same group level 1 → child_level_1
  const compPool =
    assessmentQuestions[key] ||
    assessmentQuestions[`${ageGroup}_level_1`] ||
    assessmentQuestions["child_level_1"];

  const rawQuestions = compPool?.questions || [];

  // Pick up to 10 questions (shuffle + cycle if fewer than 10)
  const shuffled = [...rawQuestions].sort(() => 0.5 - Math.random());
  const sampled = [];
  for (let i = 0; i < 10; i++) {
    sampled.push(shuffled[i % shuffled.length]);
  }

  const comprehensionQuestions = sampled.map((q) => {
    const rawOptionsEnglish = (q.options && q.options["English"]) || [];
    const correctIdx = typeof q.correctIndex === "number" ? q.correctIndex : 0;

    // Create a shuffled indices array: e.g. [0, 1, 2, 3] -> [2, 0, 1, 3]
    const indices = rawOptionsEnglish.map((_, idx) => idx);
    const shuffledIndices = [...indices].sort(() => 0.5 - Math.random());
    const newCorrectIndex = shuffledIndices.indexOf(correctIdx);

    return {
      id: q.id,
      type: "comprehension",
      rawQuestion: q,
      shuffledIndices,
      correctIndex: newCorrectIndex,
    };
  });

  // ── Reading & Writing ───────────────────────────────────────────
  // Fallback chain: exact key → same group level 1 → adult_level_1
  const rwPool =
    assessmentReadingWriting[key] ||
    assessmentReadingWriting[`${ageGroup}_level_1`] ||
    assessmentReadingWriting["adult_level_1"];

  const readingQuestion = {
    id: `${key}_reading`,
    type: "reading",
    rawQuestion: rwPool,
  };

  const writingQuestion = {
    id: `${key}_writing`,
    type: "writing",
    rawQuestion: rwPool,
    evaluator: (text) => {
      const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
      if (wordCount >= 5) return { score: 10, feedback: "Great effort!" };
      if (wordCount >= 2) return { score: 6, feedback: "Good start, try writing a bit more." };
      return { score: 3, feedback: "Please write at least a few words." };
    },
  };

  return {
    tier: `${ageGroup}_level_${level}`,
    questions: [...comprehensionQuestions, readingQuestion, writingQuestion],
  };
};
