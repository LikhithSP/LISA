// LISA — Gemini AI Lesson Generator
// Uses Gemini 2.0 Flash REST API to generate personalized lesson content

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_KEY = GEMINI_API_KEY || import.meta.env.VITE_OPENROUTER_API_KEY;
const USE_GEMINI = !!GEMINI_API_KEY;
const API_URL = USE_GEMINI 
  ? "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions"
  : "https://openrouter.ai/api/v1/chat/completions";
const MODEL_NAME = USE_GEMINI
  ? (import.meta.env.VITE_GEMINI_MODEL || "gemini-3.5-flash")
  : (import.meta.env.VITE_OPENROUTER_MODEL || "google/gemma-4-31b-it:free");

const extractJSON = (text) => {
  if (!text) throw new Error("Empty text input for JSON parsing");
  
  // Try to find the JSON block
  const startIdx = text.indexOf("{");
  const endIdx = text.lastIndexOf("}");
  
  let jsonStr = "";
  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    jsonStr = text.substring(startIdx, endIdx + 1);
  } else {
    jsonStr = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
  }

  // Helper to clean common JSON issues
  const clean = (str) => {
    return str
      // Remove single-line comments // ... (but do not match URLs)
      .replace(/(?:^|[^:])\/\/.*$/gm, "")
      // Remove multi-line comments /* ... */
      .replace(/\/\*[\s\S]*?\*\//g, "")
      // Remove trailing commas before closing braces/brackets
      .replace(/,\s*([\]}])/g, "$1")
      .trim();
  };

  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    try {
      const cleaned = clean(jsonStr);
      return JSON.parse(cleaned);
    } catch (err2) {
      console.warn("Failed to parse cleaned JSON, trying raw cleaning on original text:", err2);
      try {
        const cleanedRaw = clean(text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim());
        return JSON.parse(cleanedRaw);
      } catch (err3) {
        throw new Error("Could not parse JSON even after extensive cleaning: " + err3.message);
      }
    }
  }
};

// Age group label for context adaptation
const getAgeContext = (age) => {
  const a = parseInt(age, 10) || 25;
  if (a <= 12) return { group: "child", contextName: "a child", contextExample: "Tom has a red ball." };
  if (a <= 18) return { group: "teen", contextName: "a teenager", contextExample: "Sara reads her school textbook." };
  if (a <= 59) return { group: "adult", contextName: "an adult", contextExample: "Ravi needs to submit a bank form." };
  return { group: "senior", contextName: "a senior citizen", contextExample: "Lakshmi visits the hospital for a check-up." };
};

const buildPrompt = (params) => {
  const {
    age, educationLevel, language, learningLanguage: paramLearningLang, interfaceLanguage: paramInterfaceLang,
    literacyLevel, literacyLevelName, weakAreas, sectionNum, sectionTitle, unitNum, unitTitle,
    lessonNum, lessonTitle, difficulty
  } = params;

  const learningLanguage = paramLearningLang || language || "English";
  const interfaceLanguage = paramInterfaceLang || language || "English";

  const ageCtx = getAgeContext(age);
  const weakList = (weakAreas || []).join(", ") || "general literacy";

  return `You are LISA, an expert AI literacy tutor. Generate a complete, structured lesson for a learner with the following profile:

LEARNER PROFILE:
- Age: ${age} (${ageCtx.contextName})
- Education Level: ${educationLevel}
- Interface Language (Site UI & Instructions): ${interfaceLanguage}
- Learning Language (Target Language to Learn): ${learningLanguage}
- Literacy Level: Level ${literacyLevel} — ${literacyLevelName}
- Weak Areas: ${weakList}

LESSON DETAILS:
- Section ${sectionNum}: ${sectionTitle}
- Unit ${unitNum}: ${unitTitle}
- Lesson ${lessonNum}: ${lessonTitle}
- Difficulty: ${difficulty}

IMPORTANT RULES:
1. Target literacy content (target words, letters, sentences, reading passages, dictation sentences, unscramble tiles) MUST be in ${learningLanguage}.
2. Instructions, explanations, hints, guidance, and question prompts MUST be given in ${interfaceLanguage} so the learner understands what to do while learning ${learningLanguage}.
3. Adapt ALL context examples to be age-appropriate. Example for this learner's age: "${ageCtx.contextExample}"
4. Keep language simple and encouraging. Do not use jargon.
5. The lesson must directly target the weak skill: ${weakList}.
6. For "unscramble": "tiles" must be the individual letters of "answer" shuffled into a random order, written in the ${learningLanguage} script.
7. For "imageChoice": provide exactly 3 emoji options where "correctIndex" points to the emoji that matches "word".
8. For "tracing": provide a letter/word to practice writing in ${learningLanguage}, a short "info" fact in ${interfaceLanguage}, and the "sound" text in ${learningLanguage}.

Return ONLY valid JSON with this exact structure (no markdown, no backticks):
{
  "lessonTitle": "string",
  "skillFocus": "string",
  "explanation": "string (2-3 paragraphs explaining the concept clearly in ${interfaceLanguage})",
  "examples": [
    {"text": "string", "translation": "string (English translation if not English)"},
    {"text": "string", "translation": "string"},
    {"text": "string", "translation": "string"}
  ],
  "guidedPractice": "string (step-by-step guided exercise description)",
  "mcqs": [
    {"question": "string", "options": ["A", "B", "C", "D"], "correctIndex": 0, "explanation": "string"},
    {"question": "string", "options": ["A", "B", "C", "D"], "correctIndex": 0, "explanation": "string"},
    {"question": "string", "options": ["A", "B", "C", "D"], "correctIndex": 0, "explanation": "string"},
    {"question": "string", "options": ["A", "B", "C", "D"], "correctIndex": 0, "explanation": "string"},
    {"question": "string", "options": ["A", "B", "C", "D"], "correctIndex": 0, "explanation": "string"}
  ],
  "fillBlanks": [
    {"sentence": "string with ___ for blank", "answer": "string", "hint": "string"},
    {"sentence": "string with ___ for blank", "answer": "string", "hint": "string"},
    {"sentence": "string with ___ for blank", "answer": "string", "hint": "string"}
  ],
  "readingPassage": "string (short reading text of 3-5 sentences in ${language})",
  "readingQuestion": "string (one comprehension question about the passage)",
  "readingAnswer": "string (correct answer)",
  "writingActivity": "string (clear writing prompt or task instruction in ${language})",
  "pronunciationWords": ["word1", "word2", "word3", "word4", "word5"],
  "pronunciationTip": "string (pronunciation guidance in ${language})",
  "speakSentence": "string (a full sentence in ${language} for the user to practice speaking)",
  "meaningQuestion": {
    "phrase": "string (a simple common English word, e.g. 'Happy')",
    "options": ["correct meaning as a short English sentence", "incorrect meaning sentence distractor 1", "incorrect meaning sentence distractor 2", "incorrect meaning sentence distractor 3"],
    "correctIndex": 0
  },
  "translationTask": {
    "sentence": "string (a sentence in ${language})",
    "prompt": "string (a short instruction telling the learner to arrange the word tiles into a sentence, e.g. 'Arrange the words to form a sentence'. DO NOT reveal the answer or the exact sentence in the prompt)",
    "englishTranslation": "string (correct English translation)",
    "tiles": ["array of 6-8 English words containing all words from englishTranslation plus 2-3 distractor words, in any shuffled (non sentence) order. The distractors must NOT be able to form another valid/grammatical English sentence with the given words, so only one correct arrangement exists."]
  },
  "matchingPairs": [
    {"left": "an English word 1", "right": "its simple English meaning or definition 1"},
    {"left": "an English word 2", "right": "its simple English meaning or definition 2"},
    {"left": "an English word 3", "right": "its simple English meaning or definition 3"},
    {"left": "an English word 4", "right": "its simple English meaning or definition 4"},
    {"left": "an English word 5", "right": "its simple English meaning or definition 5"}
  ],
  "listeningTask": {
    "audioText": "string (a simple sentence or phrase in ${language} for the user to listen to)",
    "tiles": ["array of 6-8 words in ${language} containing all words from audioText plus 2-3 distractor words"]
  },
  "unscramble": [
    {"hint": "string (a clue in ${language}, e.g. 'A place with plants and flowers')", "emoji": "string (a single emoji hint, e.g. 🌳)", "answer": "GARDEN", "tiles": ["array of letter tiles for GARDEN in any shuffled (non answer) order, e.g. ['N','G','A','O','R','D','E','B']"]},
    {"hint": "string (another clue in ${language})", "emoji": "string (an emoji hint)", "answer": "APPLE", "tiles": ["array of shuffled letter tiles for APPLE"]}
  ],
  "imageChoice": [
    {"word": "string (the target word in ${language})", "prompt": "string (instruction in ${language}, e.g. 'Tap the picture that means school')", "options": ["🏫","🍎","🚗"], "correctIndex": 0},
    {"word": "string (another target word in ${language})", "prompt": "string (instruction in ${language})", "options": ["🍎","🏫","🌞"], "correctIndex": 0}
  ],
  "tracing": [
    {"kind": "playground", "question": "string (a simple question in ${language}, e.g. 'Where do children play?')", "sound": "playground"},
    {"kind": "playground", "question": "string (another simple question in ${language})", "sound": "playground"}
  ],
  "aiFeedbackPositive": "string (encouraging message for correct answers in ${language})",
  "aiFeedbackNegative": "string (gentle corrective message in ${language})"
}`;
};

// Cache lesson content by lesson ID to avoid re-fetching
const lessonCache = new Map();

export const generateLessonContent = async (params) => {
  const cacheKey = `${params.sectionNum}_${params.unitNum}_${params.lessonNum}_${params.language}_${params.literacyLevel}`;
  
  // Development mode OFF: skip the AI call and return the static fallback content.
  if (params.useFallback) {
    return getFallbackLesson(params);
  }

  if (lessonCache.has(cacheKey)) {
    return lessonCache.get(cacheKey);
  }

  const prompt = buildPrompt(params);

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 4096,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Gemini/OpenRouter API error:", err);
      return getFallbackLesson(params);
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content || "";

    const lesson = extractJSON(text);

    lessonCache.set(cacheKey, lesson);
    return lesson;
  } catch (err) {
    console.error("Failed to generate lesson:", err);
    return getFallbackLesson(params);
  }
};

// Fallback static lesson if Gemini is unavailable
const getFallbackLesson = (params) => {
  const { language, sectionTitle, unitTitle, lessonTitle } = params;
  return {
    lessonTitle: lessonTitle || "Literacy Lesson",
    skillFocus: sectionTitle || "Reading & Writing",
    explanation: language === "Hindi"
      ? `यह पाठ ${unitTitle} के बारे में है। इसमें आप बुनियादी साक्षरता कौशल सीखेंगे।`
      : language === "Kannada"
      ? `ಈ ಪಾಠವು ${unitTitle} ಬಗ್ಗೆ ಇದೆ. ಇಲ್ಲಿ ನೀವು ಮೂಲ ಸಾಕ್ಷರತಾ ಕೌಶಲ್ಯಗಳನ್ನು ಕಲಿಯುವಿರಿ.`
      : `This lesson covers ${unitTitle}. You will practice essential literacy skills related to ${sectionTitle}.`,
    examples: [
      { text: "Example 1: Read this sentence carefully.", translation: "" },
      { text: "Example 2: Write what you see.", translation: "" },
      { text: "Example 3: Listen and repeat.", translation: "" }
    ],
    mcqs: [
      { question: "Which of the following is a complete sentence?", options: ["cat run", "The cat runs.", "run cat the", "cat the run"], correctIndex: 1, explanation: "A complete sentence has a subject and verb." },
      { question: "What comes at the end of a sentence?", options: ["comma", "period", "apostrophe", "hyphen"], correctIndex: 1, explanation: "A period marks the end of a sentence." },
      { question: "Choose the correct spelling:", options: ["recieve", "receive", "recive", "receve"], correctIndex: 1, explanation: "'Receive' is the correct spelling." },
      { question: "Which word is a noun?", options: ["run", "quickly", "beautiful", "book"], correctIndex: 3, explanation: "A noun names a person, place, or thing." },
      { question: "Which sentence is correct?", options: ["She go to school.", "She goes to school.", "She going to school.", "She gone to school."], correctIndex: 1, explanation: "The verb must agree with the subject." }
    ],
    fillBlanks: [
      { sentence: "The ___ is reading a book.", answer: "child", hint: "A young person" },
      { sentence: "She ___ to the market every day.", answer: "goes", hint: "Verb for she/he/it" },
      { sentence: "Please ___ the door before you leave.", answer: "close", hint: "To shut" }
    ],
    readingPassage: "Ram goes to school everyday. He reads books and writes in his notebook. His teacher is very kind and helpful.",
    readingQuestion: "Where does Ram go every day?",
    readingAnswer: "Ram goes to school everyday.",
    imagePrompt: "Look at the picture. A girl is painting. One boy is sitting under a tree and reading a book. A girl is playing on a swing tied to that tree. A boy is looking through a telescope above the tree. Two boys are playing football.",
    writingActivity: "Write 2-3 sentences about the picture using simple words. Describe what the children are doing.",
    pronunciationWords: ["school", "teacher", "notebook", "reading", "writing"],
    pronunciationTip: "Speak each word clearly and slowly. Break it into syllables.",
    speakSentence: language === "Hindi" ? "राम हर दिन स्कूल जाता है।" : language === "Kannada" ? "ರಾಮ್ ಪ್ರತಿ ದಿನ ಶಾಲೆಗೆ ಹೋಗುತ್ತಾನೆ." : "Ram goes to school everyday.",
    meaningQuestion: {
      phrase: "Happy",
      options: ["Feeling good and cheerful", "Feeling sad and upset", "Feeling tired and sleepy", "Feeling hungry and thirsty"],
      correctIndex: 0
    },
    translationTask: {
      sentence: language === "Hindi" ? "मेरा नाम रवि है" : language === "Kannada" ? "ನನ್ನ ಹೆಸರು ರವಿ" : "My name is Ravi",
      prompt: "Arrange the words to form a sentence",
      englishTranslation: "My name is Ravi",
      tiles: ["My", "name", "is", "Ravi", "book", "red", "the"]
    },
    matchingPairs: [
      { left: "School", right: "A place where we learn" },
      { left: "Book", right: "We read it to gain knowledge" },
      { left: "Boy", right: "A young male child" },
      { left: "Water", right: "A clear liquid we drink" }
    ],
    listeningTask: {
      audioText: language === "Hindi" ? "वह जाता है" : language === "Kannada" ? "ಅವನು ಹೋಗುತ್ತಾನೆ" : "He goes",
      tiles: language === "Hindi" ? ["वह", "जाता", "है", "तुम", "हम"] : language === "Kannada" ? ["ಅವನು", "ಹೋಗುತ್ತಾನೆ", "ಬರುತ್ತಾನೆ", "ನಾವು"] : ["He", "goes", "comes", "we"]
    },
    unscramble: [
      { hint: "A place with plants and flowers", emoji: "🌳", answer: "GARDEN", tiles: ["G", "A", "R", "D", "E", "N", "B", "O"] },
      { hint: "A red fruit", emoji: "🍎", answer: "APPLE", tiles: ["P", "L", "A", "P", "E"] },
      { hint: "The bright star of the day", emoji: "🌞", answer: "SUN", tiles: ["N", "U", "S"] }
    ],
    imageChoice: [
      { word: "car", prompt: "Tap the picture that means car", options: ["🚗", "🏫", "🍎"], correctIndex: 0 },
      { word: "water", prompt: "Tap the picture that means water", options: ["🔥", "💧", "🌞"], correctIndex: 1 },
      { word: "apple", prompt: "Tap the picture that means apple", options: ["🍎", "🏫", "🌞"], correctIndex: 0 }
    ],
    tracing: [
      { kind: "playground", question: "Where do children play?", sound: "playground" },
      { kind: "playground", question: "Where do children play?", sound: "playground" },
      { kind: "playground", question: "Where do children play?", sound: "playground" }
    ],
    aiFeedbackPositive: "Excellent work! You are making great progress.",
    aiFeedbackNegative: "Good try! Review the lesson and attempt again. You can do it!"
  };
};

export const clearLessonCache = () => lessonCache.clear();

// Static Word of the Day used whenever AI is disabled (development mode OFF).
const getFallbackWordOfDay = (language = "English") => {
  if (language === "Hindi") {
    return {
      word: "Diligent",
      meaning: "मेहनती और लगनशील",
      example: "A diligent student practices reading a little every day."
    };
  } else if (language === "Kannada") {
    return {
      word: "Diligent",
      meaning: "ಕಷ್ಟಪಟ್ಟು ಕೆಲಸ ಮಾಡುವ ಮತ್ತು ಕಾಳಜಿ ತೋರುವ",
      example: "A diligent student practices reading a little every day."
    };
  } else if (language === "Telugu") {
    return {
      word: "Diligent",
      meaning: "కష్టపడి పనిచేసే మరియు శ్రద్ధ చూపించే",
      example: "A diligent student practices reading a little every day."
    };
  } else if (language === "Tamil") {
    return {
      word: "Diligent",
      meaning: "கடின உழைப்பு மற்றும் அக்கறை காட்டுதல்",
      example: "A diligent student practices reading a little every day."
    };
  }
  return {
    word: "Diligent",
    meaning: "Hardworking and showing care",
    example: "A diligent student practices reading a little every day."
  };
};

export const fetchWordOfDay = async (language = "English", context = {}, useFallback = false) => {
  // Development mode OFF: return the localized static fallback word directly.
  if (useFallback) {
    return getFallbackWordOfDay(language);
  }

  try {
    const { level = null, age = null, education = null } = context;
    const todayStr = new Date().toLocaleDateString("en-CA");
    const contextKey = `l${level ?? "na"}_a${age ?? "na"}_e${(education || "na").toString().replace(/[^a-z0-9]/gi, "").slice(0, 20)}`;
    const cacheKey = `lisa_word_of_day_${language}_${contextKey}_${todayStr}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsedCached = JSON.parse(cached);
        if (parsedCached && parsedCached.word && parsedCached.meaning && parsedCached.example) {
          return parsedCached;
        }
      } catch (e) {
        // Ignore cache parsing errors and proceed to fetch
      }
    }

    const learnerContext = `The learner is at literacy level ${level != null ? level : "unknown"} (scale 1 to 12), age ${age != null ? age : "unknown"}, with education background "${education || "unknown"}".`;
    const prompt = `You are a helpful literacy assistant. ${learnerContext} Suggest a unique, helpful English "Word of the Day" that is practical for learning and well-suited to this specific learner's literacy level, age, and education (not too easy, not too difficult). The word itself MUST be a common English word. The example sentence MUST be written in English showing how to use the word. The meaning (definition) MUST be translated into and written in ${language} so the learner can understand it in their own language.
    
    Return ONLY valid JSON with this exact structure (no markdown, no backticks):
    {
      "word": "English word",
      "meaning": "meaning written in ${language}",
      "example": "example sentence written in English"
    }`;

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
        max_tokens: 256,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      throw new Error("Failed to fetch from Gemini/OpenRouter API");
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content || "";
    const parsed = extractJSON(text);

    if (!parsed || !parsed.word || !parsed.meaning || !parsed.example) {
      throw new Error("Word of the day response missing required fields");
    }

    try {
      localStorage.setItem(cacheKey, JSON.stringify(parsed));
    } catch (e) {
      console.warn("Could not save word of the day to localStorage:", e);
    }

    return parsed;
  } catch (err) {
    console.error("Failed to fetch word of the day from Gemini/OpenRouter API, using fallback:", err);
    if (language === "Hindi") {
      return {
        word: "Diligent",
        meaning: "मेहनती और लगनशील",
        example: "A diligent student practices reading a little every day."
      };
    } else if (language === "Kannada") {
      return {
        word: "Diligent",
        meaning: "ಕಷ್ಟಪಟ್ಟು ಕೆಲಸ ಮಾಡುವ ಮತ್ತು ಕಾಳಜಿ ತೋರುವ",
        example: "A diligent student practices reading a little every day."
      };
    } else if (language === "Telugu") {
      return {
        word: "Diligent",
        meaning: "కష్టపడి పనిచేసే మరియు శ్రద్ధ చూపించే",
        example: "A diligent student practices reading a little every day."
      };
    } else if (language === "Tamil") {
      return {
        word: "Diligent",
        meaning: "கடின உழைப்பு மற்றும் அக்கறை காட்டுதல்",
        example: "A diligent student practices reading a little every day."
      };
    } else {
      return {
        word: "Diligent",
        meaning: "Hardworking and showing care",
        example: "A diligent student practices reading a little every day."
      };
    }
  }
};

const buildPracticePrompt = (params) => {
  const { practiceType, language, literacyLevel, literacyLevelName, mistakesList } = params;

  if (practiceType === "Perfect Pronunciation" || practiceType === "Speak Practice") {
    return `You are LISA, an expert AI literacy tutor. Generate exactly 10 speaking/pronunciation practice questions in ${language} suitable for a learner at Literacy Level ${literacyLevel} (${literacyLevelName}).
The questions must be a mix of two types:
1. Standard speak sentence:
   {
     "id": idx,
     "type": "speak",
     "sentence": "A simple sentence to read aloud in ${language}",
     "englishTranslation": "The English translation"
   }
2. "listeningTask": Choose the words you hear:
   {
     "id": idx,
     "type": "listeningTask",
     "audioText": "A simple sentence or phrase in ${language} for the user to hear",
     "tiles": ["Array of 6-8 words in ${language} containing all words from audioText plus 2-3 distractor words"]
   }

Return ONLY valid JSON with this exact structure:
{
  "questions": [
    ...
  ]
} (Make sure there are exactly 10 items in the array)`;
  }

  if (practiceType === "Read Practice") {
    return `You are LISA, an expert AI literacy tutor. Generate exactly 10 reading practice questions in ${language} suitable for a learner at Literacy Level ${literacyLevel} (${literacyLevelName}).
The questions must be a mix of the following reading/comprehension activity types:
1. "mcq": A multiple choice question in ${language} testing reading comprehension, grammar, or word usage.
2. "meaning": Select the correct English translation/meaning of a target language word or short phrase.
3. "passage": A short reading passage with a multiple-choice comprehension question:
   {
     "id": idx,
     "type": "passage",
     "passage": "A short reading passage of 2-4 simple sentences in ${language}",
     "question": "A comprehension question about the passage in ${language}",
     "options": ["A", "B", "C", "D"],
     "correctIndex": 0,
     "explanation": "Why this is correct"
   }
4. "matchingPairs": Make correct pairs of words:
   {
     "id": idx,
     "type": "matchingPairs",
     "pairs": [
       {"left": "word 1 in ${language}", "right": "its meaning/translation/definition in English"},
       {"left": "word 2 in ${language}", "right": "its meaning/translation/definition in English"},
       {"left": "word 3 in ${language}", "right": "its meaning/translation/definition in English"},
       {"left": "word 4 in ${language}", "right": "its meaning/translation/definition in English"}
     ]
   }
5. "imageChoice": Choose the correct picture:
   {
     "id": idx,
     "type": "imageChoice",
     "word": "target word in ${language}",
     "prompt": "instruction in ${language}, e.g. 'Tap the picture that means school'",
     "options": ["emoji1", "emoji2", "emoji3"],
     "correctIndex": 0
   }

Return ONLY valid JSON with this exact structure:
{
  "questions": [
    ...
  ]
} (Make sure there are exactly 10 items in the array, using a mix of these types)`;
  }

  if (practiceType === "Mistakes Practice") {
    const mistakesFormatted = mistakesList && mistakesList.length > 0
      ? mistakesList.map((m, idx) => `${idx + 1}. Type: ${m.type}, Prompt/Question: ${m.question || m.sentence || m.phrase || m.audioText}, Correct Answer: ${m.correctAnswer || m.answer || m.englishTranslation}`).join("\n")
      : "No specific mistake history yet.";

    return `You are LISA, an expert AI literacy tutor. The user wants to review and correct their past mistakes.
Here is the history of mistakes they made:
${mistakesFormatted}

Generate exactly 10 review questions in ${language} to help them practice and correct these mistakes (or general literacy review if no mistakes listed). Mix of multiple choice (mcq) and fill-in-the-blanks (fillBlank).
Keep them simple and helpful for Level ${literacyLevel} (${literacyLevelName}).

Return ONLY valid JSON with this exact structure:
{
  "questions": [
    {
      "id": 1,
      "type": "mcq",
      "question": "Multiple choice question in ${language} targeting a mistake or rule",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 0,
      "explanation": "Why this is correct"
    },
    {
      "id": 2,
      "type": "fillBlank",
      "sentence": "A sentence in ${language} with ___ for the blank",
      "answer": "correct word to fill",
      "hint": "helpful hint in ${language}"
    }
  ]
} (Make sure there are exactly 10 items in the array in total)`;
  }

  if (practiceType === "Words Practice") {
    return `You are LISA, an expert AI literacy tutor. Generate exactly 10 vocabulary/words practice questions in ${language} suitable for a learner at Literacy Level ${literacyLevel} (${literacyLevelName}).
Mix of two types:
1. "meaning": Select the correct English meaning/translation of a target language word.
2. "spelling": Fill in the blank to complete the spelling of a target language word in a sentence context.

Return ONLY valid JSON with this exact structure:
{
  "questions": [
    {
      "id": 1,
      "type": "meaning",
      "phrase": "Word or short phrase in ${language}",
      "options": ["Correct English translation", "incorrect distractor 1", "incorrect distractor 2"],
      "correctIndex": 0
    },
    {
      "id": 2,
      "type": "spelling",
      "sentence": "A simple sentence in ${language} with a word missing letters, e.g. 'I read a bo___.' or target language equivalent with ___",
      "answer": "The missing letters/word",
      "hint": "Hint in ${language}"
    }
  ]
} (Make sure there are exactly 10 items in the array)`;
  }

  if (practiceType === "Stories Practice") {
    return `You are LISA, an expert AI literacy tutor. Generate a short, interesting, age-appropriate story (about 50-80 words, 3-5 sentences) in ${language} suitable for a learner at Literacy Level ${literacyLevel} (${literacyLevelName}).
Make sure it is an engaging, structured story with characters or a narrative (e.g. beginning, middle, and end, or a simple fable/moral story) rather than just a simple informational paragraph.
Then generate exactly 10 reading comprehension/vocabulary questions about this story.

Return ONLY valid JSON with this exact structure:
{
  "story": "The complete story in ${language}",
  "questions": [
    {
      "id": 1,
      "question": "Comprehension question in ${language} about the story",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Explanation of correct answer in ${language}"
    }
  ]
} (Make sure there are exactly 10 questions in the array)`;
  }

  if (practiceType === "Write Practice") {
    return `You are LISA, an expert AI literacy tutor. Generate exactly 10 writing practice questions in ${language} suitable for a learner at Literacy Level ${literacyLevel} (${literacyLevelName}).
The questions must be a mix of the following writing activity types:
1. "fillBlank": A sentence in ${language} with a blank (___) for the learner to type the correct word.
2. "unscramble": Shuffled letter tiles in ${language} that the learner rearranges to form a word.
3. "writingActivity": A short writing prompt in ${language} for the learner to write a short response.
4. "tracing": A letter or simple word in ${language} to trace.
5. "translationTask": Arrange the words:
   {
     "id": idx,
     "type": "translationTask",
     "prompt": "Arrange the words to form a sentence translating the following: ...",
     "englishTranslation": "The correct translation sentence",
     "tiles": ["shuffled", "words", "containing", "correct", "ones", "plus", "distractors"]
   }

Return ONLY valid JSON with this exact structure:
{
  "questions": [
    ...
  ]
} (Make sure there are exactly 10 items in the array, using a mix of these types)`;
  }

  return "";
};

const getFallbackPractice = (params) => {
  const { practiceType, language } = params;
  
  if (practiceType === "Perfect Pronunciation" || practiceType === "Speak Practice") {
    const defaultQuestions = language === "Hindi" ? [
      { id: 1, type: "speak", sentence: "राम स्कूल जाता है।", englishTranslation: "Ram goes to school." },
      { id: 2, type: "speak", sentence: "वह किताब पढ़ता है।", englishTranslation: "He reads a book." },
      { id: 3, type: "speak", sentence: "सीता गाना गाती है।", englishTranslation: "Sita sings a song." },
      { id: 4, type: "speak", sentence: "आज मौसम अच्छा है।", englishTranslation: "Today the weather is good." },
      { id: 5, type: "speak", sentence: "मुझे फल खाना पसंद है।", englishTranslation: "I like to eat fruits." },
      { id: 6, type: "speak", sentence: "यह मेरी पुस्तक है।", englishTranslation: "This is my book." },
      { id: 7, type: "speak", sentence: "हम सब मिलकर खेलेंगे।", englishTranslation: "We will all play together." },
      { id: 8, type: "speak", sentence: "पानी बहुत ठंडा है।", englishTranslation: "The water is very cold." },
      { id: 9, type: "listeningTask", audioText: "पेड़ पर पक्षी हैं", tiles: ["पेड़", "पर", "पक्षी", "हैं", "पानी", "फूल", "आसमान"] },
      { id: 10, type: "listeningTask", audioText: "समय बहुत मूल्यवान है", tiles: ["समय", "बहुत", "मूल्यवान", "है", "काम", "आज", "कल"] }
    ] : language === "Kannada" ? [
      { id: 1, type: "speak", sentence: "ರಾಮ್ ಶಾಲೆಗೆ ಹೋಗುತ್ತಾನೆ.", englishTranslation: "Ram goes to school." },
      { id: 2, type: "speak", sentence: "ಅವನು ಪುಸ್ತಕ ಓದುತ್ತಾನೆ.", englishTranslation: "He reads a book." },
      { id: 3, type: "speak", sentence: "ಸೀತಾ ಹಾಡು ಹಾಡುತ್ತಾಳೆ.", englishTranslation: "Sita sings a song." },
      { id: 4, type: "speak", sentence: "ಇಂದು ಹವಾಮಾನ ಚೆನ್ನಾಗಿದೆ.", englishTranslation: "Today the weather is good." },
      { id: 5, type: "speak", sentence: "ನನಗೆ ಹಣ್ಣು ತಿನ್ನಲು ಇಷ್ಟ.", englishTranslation: "I like to eat fruits." },
      { id: 6, type: "speak", sentence: "ಇದು ನನ್ನ ಪುಸ್ತಕ.", englishTranslation: "This is my book." },
      { id: 7, type: "speak", sentence: "ನಾವೆಲ್ಲರೂ ಒಟ್ಟಿಗೆ ಆಡೋಣ.", englishTranslation: "Let's all play together." },
      { id: 8, type: "speak", sentence: "ನೀರು ತುಂಬಾ ತಣ್ಣಗಿದೆ.", englishTranslation: "The water is very cold." },
      { id: 9, type: "listeningTask", audioText: "ಮರದ ಮೇಲೆ ಹಕ್ಕಿಗಳಿವೆ", tiles: ["ಮರದ", "ಮೇಲೆ", "ಹಕ್ಕಿಗಳಿವೆ", "ನೀರು", "ಹಣ್ಣು", "ಕಾಡು"] },
      { id: 10, type: "listeningTask", audioText: "ಸಮಯ ತುಂಬಾ ಅಮೂಲ್ಯವಾಗಿದೆ", tiles: ["ಸಮಯ", "ತುಂಬಾ", "ಅಮೂಲ್ಯವಾಗಿದೆ", "ಕೆಲಸ", "ಇಂದು", "ಆಟ"] }
    ] : language === "Telugu" ? [
      { id: 1, type: "speak", sentence: "రాము బడికి వెళతాడు.", englishTranslation: "Ram goes to school." },
      { id: 2, type: "speak", sentence: "అతడు పుస్తకం చదువుతాడు.", englishTranslation: "He reads a book." },
      { id: 3, type: "speak", sentence: "సీత పాట పాడుతుంది.", englishTranslation: "Sita sings a song." },
      { id: 4, type: "speak", sentence: "ఈరోజు వాతావరణం బాగుంది.", englishTranslation: "Today the weather is good." },
      { id: 5, type: "speak", sentence: "నాకు పండ్లు తినడం ఇష్టం.", englishTranslation: "I like to eat fruits." },
      { id: 6, type: "speak", sentence: "ఇది నా పుస్తకం.", englishTranslation: "This is my book." },
      { id: 7, type: "speak", sentence: "మనమందరం కలిసి ఆడుకుందాం.", englishTranslation: "Let's all play together." },
      { id: 8, type: "speak", sentence: "నీరు చాలా చల్లగా ఉంది.", englishTranslation: "Water is very cold." },
      { id: 9, type: "listeningTask", audioText: "చెట్టు మీద పక్షులు ఉన్నాయి", tiles: ["చెట్టు", "మీద", "పక్షులు", "ఉన్నాయి", "నీరు", "ఆకాశం", "పండు"] },
      { id: 10, type: "listeningTask", audioText: "సమయం చాలా విలువైనది", tiles: ["సమయం", "చాలా", "విలువైనది", "పని", "ఈరోజు", "ఆట"] }
    ] : language === "Tamil" ? [
      { id: 1, type: "speak", sentence: "ராம் பள்ளிக்குச் செல்கிறான்.", englishTranslation: "Ram goes to school." },
      { id: 2, type: "speak", sentence: "அவன் புத்தகம் படிக்கிறான்.", englishTranslation: "He reads a book." },
      { id: 3, type: "speak", sentence: "சீதா பாட்டு பாடுகிறாள்.", englishTranslation: "Sita sings a song." },
      { id: 4, type: "speak", sentence: "இன்று வானிலை நன்றாக உள்ளது.", englishTranslation: "Today the weather is good." },
      { id: 5, type: "speak", sentence: "எனக்கு பழங்கள் சாப்பிட பிடிக்கும்.", englishTranslation: "I like to eat fruits." },
      { id: 6, type: "speak", sentence: "இது எனது புத்தகம்.", englishTranslation: "This is my book." },
      { id: 7, type: "speak", sentence: "நாம் அனைவரும் சேர்ந்து விளையாடுவோம்.", englishTranslation: "We will all play together." },
      { id: 8, type: "speak", sentence: "தண்ணீர் மிகவும் குளிராக இருக்கிறது.", englishTranslation: "Water is very cold." },
      { id: 9, type: "listeningTask", audioText: "மரத்தின் மேல் பறவைகள் இருக்கின்றன", tiles: ["மரத்தின்", "மேல்", "பறவைகள்", "இருக்கின்றன", "தண்ணீர்", "பழங்கள்", "காடு"] },
      { id: 10, type: "listeningTask", audioText: "நேரம் மிகவும் மதிப்புமிக்கது", tiles: ["நேரம்", "மிகவும்", "மதிப்புமிக்கது", "வேலை", "இன்று", "விளையாட்டு"] }
    ] : [
      { id: 1, type: "speak", sentence: "The sun shines bright.", englishTranslation: "The sun shines bright." },
      { id: 2, type: "speak", sentence: "I love reading books.", englishTranslation: "I love reading books." },
      { id: 3, type: "speak", sentence: "We go to school.", englishTranslation: "We go to school." },
      { id: 4, type: "speak", sentence: "Water is clean and fresh.", englishTranslation: "Water is clean and fresh." },
      { id: 5, type: "speak", sentence: "She speaks very kindly.", englishTranslation: "She speaks very kindly." },
      { id: 6, type: "speak", sentence: "This is my favorite story.", englishTranslation: "This is my favorite story." },
      { id: 7, type: "speak", sentence: "Let's play together today.", englishTranslation: "Let's play together today." },
      { id: 8, type: "speak", sentence: "The trees are green.", englishTranslation: "The trees are green." },
      { id: 9, type: "listeningTask", audioText: "Birds fly high in sky", tiles: ["Birds", "fly", "high", "in", "sky", "water", "green", "trees"] },
      { id: 10, type: "listeningTask", audioText: "Practice makes perfect", tiles: ["Practice", "makes", "perfect", "good", "student", "today"] }
    ];
    return { questions: defaultQuestions };
  }

  if (practiceType === "Read Practice") {
    const readingQuestions = language === "Hindi" ? [
      { id: 1, type: "mcq", question: "सूरज किस दिशा से उगता है?", options: ["पूर्व", "पश्चिम", "उत्तर", "दक्षिण"], correctIndex: 0, explanation: "सूरज पूर्व से उगता है।" },
      { id: 2, type: "meaning", phrase: "पुस्तकालय", options: ["A place with books to read or borrow", "A place where students study", "A place to buy things"], correctIndex: 0 },
      { id: 3, type: "passage", passage: "एक जंगल में एक शेर रहता था। वह बहुत शक्तिशाली था। सभी जानवर उससे डरते थे।", question: "शेर कहाँ रहता था?", options: ["जंगल में", "गुफा में", "चिड़ियाघर में", "पहाड़ पर"], correctIndex: 0, explanation: "पहली पंक्ति बताती है कि शेर जंगल में रहता था।" },
      { id: 4, type: "matchingPairs", pairs: [{ left: "विद्यालय", right: "School" }, { left: "बाज़ार", right: "Market" }, { left: "मित्र", right: "Friend" }, { left: "घर", right: "Home" }] },
      { id: 5, type: "imageChoice", word: "किताब", prompt: "किताब (Book) के लिए सही चित्र चुनें:", options: ["📚", "🍎", "🏫"], correctIndex: 0 },
      { id: 6, type: "mcq", question: "हमारा राष्ट्रीय पक्षी कौन सा है?", options: ["मोर", "तोता", "कबूतर", "चिड़िया"], correctIndex: 0, explanation: "भारत का राष्ट्रीय पक्षी मोर है।" },
      { id: 7, type: "meaning", phrase: "विद्यालय", options: ["A place where students learn and study", "An institution for higher learning", "A place where people work"], correctIndex: 0 },
      { id: 8, type: "passage", passage: "राजू के पास एक सुंदर कुत्ता है। उसका नाम शेरू है। राजू उसके साथ खेलता है।", question: "राजू के कुत्ते का नाम क्या है?", options: ["शेरू", "कालू", "मोती", "टॉमी"], correctIndex: 0, explanation: "राजू के कुत्ते का नाम शेरू है।" },
      { id: 9, type: "matchingPairs", pairs: [{ left: "जल", right: "Water" }, { left: "अग्नि", right: "Fire" }, { left: "वायु", right: "Air" }, { left: "आकाश", right: "Sky" }] },
      { id: 10, type: "imageChoice", word: "सूरज", prompt: "सूरज (Sun) के लिए सही चित्र चुनें:", options: ["🌞", "🌙", "⭐"], correctIndex: 0 }
    ] : language === "Kannada" ? [
      { id: 1, type: "mcq", question: "ಸೂರ್ಯನು ಯಾವ ದಿಕ್ಕಿನಲ್ಲಿ ಉದಯಿಸುತ್ತಾನೆ?", options: ["ಪೂರ್ವ", "ಪಶ್ಚಿಮ", "ಉತ್ತರ", "ದಕ್ಷಿಣ"], correctIndex: 0, explanation: "ಸೂರ್ಯನು ಪೂರ್ವದಲ್ಲಿ ಉದಯಿಸುತ್ತಾನೆ." },
      { id: 2, type: "meaning", phrase: "ಗ್ರಂಥಾಲಯ", options: ["A place with books to read or borrow", "A place where students study", "A place to buy things"], correctIndex: 0 },
      { id: 3, type: "passage", passage: "ಒಂದು ಕಾಡಿನಲ್ಲಿ ಸಿಂಹವಿತ್ತು. ಅದು ತುಂಬಾ ಬಲಶಾಲಿಯಾಗಿತ್ತು. ಎಲ್ಲಾ ಪ್ರಾಣಿಗಳು ಅದಕ್ಕೆ ಹೆದರುತ್ತಿದ್ದವು.", question: "ಸಿಂಹ ಎಲ್ಲ ಇತ್ತು?", options: ["ಕಾಡಿನಲ್ಲಿ", "ಗುಹೆಯಲ್ಲಿ", "ಮೃಗಾಲಯದಲ್ಲಿ", "ಬೆಟ್ಟದ ಮೇಲೆ"], correctIndex: 0, explanation: "ಸಿಂಹ ಕಾಡಿನಲ್ಲಿ ಇತ್ತು." },
      { id: 4, type: "matchingPairs", pairs: [{ left: "ಶಾಲೆ", right: "School" }, { left: "ಮಾರುಕಟ್ಟೆ", right: "Market" }, { left: "ಸ್ನೇಹಿತ", right: "Friend" }, { left: "ಮನೆ", right: "Home" }] },
      { id: 5, type: "imageChoice", word: "ಪುಸ್ತಕ", prompt: "ಪುಸ್ತಕ (Book) ಕ್ಕೆ ಸರಿಯಾದ ಚಿತ್ರವನ್ನು ಆರಿಸಿ:", options: ["📚", "🍎", "🏫"], correctIndex: 0 },
      { id: 6, type: "mcq", question: "ನಮ್ಮ ರಾಷ್ಟ್ರೀಯ ಪಕ್ಷಿ ಯಾವುದು?", options: ["ನವಿಲು", "ಗಿಳಿ", "ಪಾರಿವಾಳ", "ಗುಬ್ಬಚ್ಚಿ"], correctIndex: 0, explanation: "ನಮ್ಮ ರಾಷ್ಟ್ರೀಯ ಪಕ್ಷಿ ನವಿಲು." },
      { id: 7, type: "meaning", phrase: "ಶಾಲೆ", options: ["A place where students learn and study", "An institution for higher learning", "A place where people work"], correctIndex: 0 },
      { id: 8, type: "passage", passage: "ರಾಜು ಬಳಿ ಒಂದು ಸುಂದರ ನಾಯಿ ಇದೆ. ಅದರ ಹೆಸರು ಶೇರು. ರಾಜು ಅದರೊಂದಿಗೆ ಆಟವಾಡುತ್ತಾನೆ.", question: "ರಾಜು ನಾಯಿಯ ಹೆಸರೇನು?", options: ["ಶೇರು", "ಕಾಲು", "ಮೋತಿ", "ಟಾಮಿ"], correctIndex: 0, explanation: "ನಾಯಿಯ ಹೆಸರು ಶೇರು." },
      { id: 9, type: "matchingPairs", pairs: [{ left: "ನೀರು", right: "Water" }, { left: "ಬೆಂಕಿ", right: "Fire" }, { left: "ಗಾಳಿ", right: "Air" }, { left: "ಆಕಾಶ", right: "Sky" }] },
      { id: 10, type: "imageChoice", word: "ಸೂರ್ಯ", prompt: "ಸೂರ್ಯ (Sun) ನಿಗೆ ಸರಿಯಾದ ಚಿತ್ರವನ್ನು ಆರಿಸಿ:", options: ["🌞", "🌙", "⭐"], correctIndex: 0 }
    ] : language === "Telugu" ? [
      { id: 1, type: "mcq", question: "సూర్యుడు ఏ దిశలో ఉదయిస్తాడు?", options: ["తూర్పు", "పడమర", "ఉత్తరం", "దక్షిణం"], correctIndex: 0, explanation: "సూర్యుడు తూర్పున ఉదయిస్తాడు." },
      { id: 2, type: "meaning", phrase: "గ్రంథాలయం", options: ["A place with books to read or borrow", "A place where students study", "A place to buy things"], correctIndex: 0 },
      { id: 3, type: "passage", passage: "ఒక అడవిలో సింహం ఉండేది. అది చాలా శక్తివంతమైనది. జంతువులన్నీ దానికి భయపడేవి.", question: "సింహం ఎక్కడ ఉండేది?", options: ["అడవిలో", "గుహలో", "జూలో", "కొండపై"], correctIndex: 0, explanation: "సింహం అడవిలో ఉండేది." },
      { id: 4, type: "matchingPairs", pairs: [{ left: "పాఠశాల", right: "School" }, { left: "మార్కెట్", right: "Market" }, { left: "స్నేహితుడు", right: "Friend" }, { left: "ఇల్లు", right: "Home" }] },
      { id: 5, type: "imageChoice", word: "పుస్తకం", prompt: "పుస్తకం (Book) కొరకు సరైన చిత్రాన్ని ఎంచుకోండి:", options: ["📚", "🍎", "🏫"], correctIndex: 0 },
      { id: 6, type: "mcq", question: "మన జాతీయ పక్షి ఏది?", options: ["నెమలి", "చిలుక", "పావురం", "పిచ్చుక"], correctIndex: 0, explanation: "నెమలి మన జాతీయ పక్షి." },
      { id: 7, type: "meaning", phrase: "పాఠశాల", options: ["A place where students learn and study", "An institution for higher learning", "A place where people work"], correctIndex: 0 },
      { id: 8, type: "passage", passage: "రాజు దగ్గర ఒక అందమైన కుక్క ఉంది. దాని పేరు షేరు. రాజు దానితో ఆడుకుంటాడు.", question: "రాజు కుక్క పేరు ఏమిటి?", options: ["షేరు", "కాలు", "మోతీ", "టామీ"], correctIndex: 0, explanation: "రాజు కుక్క పేరు షేరు." },
      { id: 9, type: "matchingPairs", pairs: [{ left: "నీరు", right: "Water" }, { left: "నిప్పు", right: "Fire" }, { left: "గాలి", right: "Air" }, { left: "ఆకాశం", right: "Sky" }] },
      { id: 10, type: "imageChoice", word: "సూర్యుడు", prompt: "సూర్యుడు (Sun) కొరకు సరైన చిత్రాన్ని ఎంచుకోండి:", options: ["🌞", "🌙", "⭐"], correctIndex: 0 }
    ] : language === "Tamil" ? [
      { id: 1, type: "mcq", question: "சூரியன் எந்த திசையில் உதிக்கிறது?", options: ["கிழக்கு", "மேற்கு", "வடக்கு", "தெற்கு"], correctIndex: 0, explanation: "சூரியன் கிழக்கில் உதிக்கிறது." },
      { id: 2, type: "meaning", phrase: "நூலகம்", options: ["A place with books to read or borrow", "A place where students study", "A place to buy things"], correctIndex: 0 },
      { id: 3, type: "passage", passage: "ஒரு காட்டில் ஒரு சிங்கம் வாழ்ந்தது. அது மிகவும் பலசாலி. அனைத்து விலங்குகளும் அதைக் கண்டு அஞ்சின.", question: "சிங்கம் எங்கு வாழ்ந்தது?", options: ["காட்டில்", "குகையில்", "மிருகக்காட்சிசாலையில்", "மலையில்"], correctIndex: 0, explanation: "சிங்கம் காட்டில் வாழ்ந்தது." },
      { id: 4, type: "matchingPairs", pairs: [{ left: "பள்ளி", right: "School" }, { left: "சந்தை", right: "Market" }, { left: "நண்பன்", right: "Friend" }, { left: "வீடு", right: "Home" }] },
      { id: 5, type: "imageChoice", word: "புத்தகம்", prompt: "புத்தகம் (Book) க்கான சரியான படத்தை தேர்வு செய்யவும்:", options: ["📚", "🍎", "🏫"], correctIndex: 0 },
      { id: 6, type: "mcq", question: "நமது தேசிய பறவை எது?", options: ["மயில்", "கிளி", "புறா", "சிட்டுக்குருவி"], correctIndex: 0, explanation: "நமது தேசிய பறவை மயில்." },
      { id: 7, type: "meaning", phrase: "பள்ளி", options: ["A place where students learn and study", "An institution for higher learning", "A place where people work"], correctIndex: 0 },
      { id: 8, type: "passage", passage: "ராஜுவிடம் ஒரு அழகான நாய் உள்ளது. அதன் பெயர் ஷேரு. ராஜு அதனுடன் விளையாடுகிறான்.", question: "ராஜுவின் நாயின் பெயர் என்ன?", options: ["ஷேரு", "காலும்", "மோதி", "டாமி"], correctIndex: 0, explanation: "நாயின் பெயர் ஷேரு." },
      { id: 9, type: "matchingPairs", pairs: [{ left: "தண்ணீர்", right: "Water" }, { left: "நெருப்பு", right: "Fire" }, { left: "காற்று", right: "Air" }, { left: "வானம்", right: "Sky" }] },
      { id: 10, type: "imageChoice", word: "சூரியன்", prompt: "சூரியன் (Sun) க்கான சரியான படத்தை தேர்வு செய்யவும்:", options: ["🌞", "🌙", "⭐"], correctIndex: 0 }
    ] : [
      { id: 1, type: "mcq", question: "From which direction does the sun rise?", options: ["East", "West", "North", "South"], correctIndex: 0, explanation: "The sun rises in the east." },
      { id: 2, type: "meaning", phrase: "Library", options: ["A place with books to read or borrow", "A place where students study", "A place to buy things"], correctIndex: 0 },
      { id: 3, type: "passage", passage: "A lion lived in a forest. It was very strong. All animals were afraid of it.", question: "Where did the lion live?", options: ["In the forest", "In a cave", "In the zoo", "On the hill"], correctIndex: 0, explanation: "The lion lived in the forest." },
      { id: 4, type: "matchingPairs", pairs: [{ left: "School", right: "A place to learn" }, { left: "Market", right: "A place to buy things" }, { left: "Friend", right: "A person you like" }, { left: "Home", right: "Where you live" }] },
      { id: 5, type: "imageChoice", word: "Book", prompt: "Choose the correct picture for Book:", options: ["📚", "🍎", "🏫"], correctIndex: 0 },
      { id: 6, type: "mcq", question: "What is our national bird?", options: ["Peacock", "Parrot", "Pigeon", "Sparrow"], correctIndex: 0, explanation: "The national bird is the peacock." },
      { id: 7, type: "meaning", phrase: "School", options: ["A place where students learn and study", "An institution for higher learning", "A place where people work"], correctIndex: 0 },
      { id: 8, type: "passage", passage: "Raju has a beautiful dog. Its name is Sheru. Raju plays with it.", question: "What is Raju's dog name?", options: ["Sheru", "Kalu", "Moti", "Tommy"], correctIndex: 0, explanation: "The dog name is Sheru." },
      { id: 9, type: "matchingPairs", pairs: [{ left: "Water", right: "Liquid to drink" }, { left: "Fire", right: "Hot flame" }, { left: "Air", right: "Gas to breathe" }, { left: "Sky", right: "Blue space above" }] },
      { id: 10, type: "imageChoice", word: "Sun", prompt: "Choose the correct picture for Sun:", options: ["🌞", "🌙", "⭐"], correctIndex: 0 }
    ];
    return { questions: readingQuestions };
  }

  if (practiceType === "Mistakes Practice") {
    let list = (params.mistakesList && params.mistakesList.length > 0) ? [...params.mistakesList] : [];
    if (list.length === 0) {
      list = [
        { id: 1, type: "fillBlank", sentence: "The sun rises in the ___.", answer: "east", hint: "A direction", clue: "Opposite of west" },
        { id: 2, type: "unscramble", hint: "Where we study", emoji: "🏫", answer: "SCHOOL", tiles: ["L","O","C","S","H","O"], clue: "An educational institution" },
        { id: 3, type: "fillBlank", sentence: "We should drink clean ___ every day.", answer: "water", hint: "Essential liquid", clue: "H2O" },
        { id: 4, type: "unscramble", hint: "A sweet red fruit", emoji: "🍎", answer: "APPLE", tiles: ["P","L","A","P","E"], clue: "Keep the doctor away" }
      ];
    }
    const finalQuestions = [];
    for (let i = 0; i < 10; i++) {
      const original = list[i % list.length];
      
      let mappedType = original.type || "fillBlank";
      if (mappedType !== "fillBlank" && mappedType !== "unscramble") {
        mappedType = i % 2 === 0 ? "fillBlank" : "unscramble";
      }

      let sentence = original.sentence || original.text || "";
      let answer = original.answer || "";
      let tiles = original.tiles || [];
      let hint = original.hint || "";

      if (mappedType === "fillBlank") {
        if (!sentence.includes("___")) {
          if (answer && sentence.toLowerCase().includes(answer.toLowerCase())) {
            const regex = new RegExp(`\\b${answer}\\b`, 'i');
            sentence = sentence.replace(regex, "___");
          } else {
            const words = sentence.split(/\s+/).filter(Boolean);
            if (words.length > 0) {
              const targetIdx = Math.floor(words.length / 2);
              answer = words[targetIdx].replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "");
              words[targetIdx] = "___";
              sentence = words.join(" ");
            } else {
              sentence = "We should learn ___ every day.";
              answer = "words";
            }
          }
        }
      }

      if (mappedType === "unscramble") {
        if (!answer) {
          const words = sentence.split(/\s+/).filter(Boolean);
          answer = (words[0] || "LEARN").replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "");
        }
        if (!tiles || tiles.length === 0) {
          tiles = answer.toUpperCase().split("");
          for (let k = tiles.length - 1; k > 0; k--) {
            const j = Math.floor(Math.random() * (k + 1));
            [tiles[k], tiles[j]] = [tiles[j], tiles[k]];
          }
        }
      }

      finalQuestions.push({
        id: i + 1,
        type: mappedType,
        sentence: sentence,
        answer: answer,
        tiles: tiles,
        hint: hint || "Recent mistake review",
        clue: original.clue || original.hint || (answer ? `Starts with "${answer[0].toUpperCase()}"` : "Review your mistake")
      });
    }
    return { questions: finalQuestions };
  }

  if (practiceType === "Words Practice") {
    const list = language === "Hindi" ? [
      { id: 1, word: "किताब", emoji: "📚", translation: "Book", sentence: "यह एक अच्छी किताब है। (This is a good book.)" },
      { id: 2, word: "स्कूल", emoji: "🏫", translation: "School", sentence: "बच्चे स्कूल जा रहे हैं। (Children are going to school.)" },
      { id: 3, word: "सेब", emoji: "🍎", translation: "Apple", sentence: "सेब लाल और मीठा है। (The apple is red and sweet.)" },
      { id: 4, word: "पानी", emoji: "💧", translation: "Water", sentence: "साफ पानी पीना स्वास्थ्य के लिए अच्छा है। (Drinking clean water is good for health.)" },
      { id: 5, word: "सूरज", emoji: "☀️", translation: "Sun", sentence: "सूरज पूर्व से उगता है। (The sun rises in the east.)" },
      { id: 6, word: "दोस्त", emoji: "🧑‍🤝‍🧑", translation: "Friend", sentence: "वह मेरा सबसे अच्छा दोस्त है। (He is my best friend.)" },
      { id: 7, word: "घर", emoji: "🏠", translation: "House", sentence: "हमारा घर बहुत सुंदर है। (Our house is very beautiful.)" },
      { id: 8, word: "पेड़", emoji: "🌳", translation: "Tree", sentence: "पेड़ हमें छाया देता है। (The tree gives us shade.)" },
      { id: 9, word: "फल", emoji: "🍌", translation: "Fruit", sentence: "ताजे फल खाएं। (Eat fresh fruits.)" },
      { id: 10, word: "खुश", emoji: "😊", translation: "Happy", sentence: "वह आज बहुत खुश है। (He is very happy today.)" },
    ] : [
      { id: 1, word: "Book", emoji: "📚", translation: "किताब / ಪುಸ್ತಕ", sentence: "This is a good book." },
      { id: 2, word: "School", emoji: "🏫", translation: "स्कूल / ಶಾಲೆ", sentence: "Children are going to school." },
      { id: 3, word: "Apple", emoji: "🍎", translation: "सेब / ಸೇಬು", sentence: "The apple is red and sweet." },
      { id: 4, word: "Water", emoji: "💧", translation: "पानी / ನೀರು", sentence: "We should drink clean water." },
      { id: 5, word: "Sun", emoji: "☀️", translation: "सूरज / ಸೂರ್ಯ", sentence: "The sun is very bright today." },
      { id: 6, word: "Friend", emoji: "🧑‍🤝‍🧑", translation: "मित्र / ಸ್ನೇಹಿತ", sentence: "He is my best friend." },
      { id: 7, word: "House", emoji: "🏠", translation: "घर / ಮನೆ", sentence: "They live in a big house." },
      { id: 8, word: "Tree", emoji: "🌳", translation: "पेड़ / ಮರ", sentence: "The birds are on the tree." },
      { id: 9, word: "Fruit", emoji: "🍌", translation: "फल / ಹಣ್ಣು", sentence: "I love eating fresh fruit." },
      { id: 10, word: "Happy", emoji: "😊", translation: "खुश / ಸಂತೋಷ", sentence: "She has a happy family." },
    ];
    return { questions: list };
  }

  if (practiceType === "Stories Practice" || practiceType === "Stories") {
    const dialogue = language === "Hindi" ? [
      { speaker: "अना", text: "नमस्ते! मेरा नाम अना है।", audioText: "नमस्ते! मेरा नाम अना है।" },
      { speaker: "रवि", text: "नमस्ते अना! मैं रवि हूँ। हमारे गाँव में आपका स्वागत है।", audioText: "नमस्ते अना! मैं रवि हूँ। हमारे गाँव में आपका स्वागत है।" },
      { speaker: "अना", text: "यहाँ बहुत सुंदर है। मुझे एक किताब पढ़नी है।", audioText: "यहाँ बहुत सुंदर है। मुझे एक किताब पढ़नी है।" },
      {
        type: "question",
        question: "अना क्या चाहती है?",
        options: ["एक किताब (A book)", "पानी (Water)", "एक खिलौना (A toy)"],
        correctIndex: 0
      },
      { speaker: "रवि", text: "हमारे पास पास ही एक पुस्तकालय है। चलो वहाँ चलते हैं!", audioText: "हमारे पास पास ही एक पुस्तकालय है। चलो वहाँ चलते हैं!" },
      { speaker: "अना", text: "उस पेड़ को देखो! उस पर बड़े लाल सेब हैं।", audioText: "उस पेड़ को देखो! उस पर बड़े लाल सेब हैं।" },
      { speaker: "रवि", text: "हाँ, वे मीठे हैं। क्या तुम्हें एक चाहिए?", audioText: "हाँ, वे मीठे हैं। क्या तुम्हें एक चाहिए।" },
      {
        type: "question",
        question: "पेड़ पर कौन सा फल है?",
        options: ["आम (Mango)", "सेब (Apple)", "केला (Banana)"],
        correctIndex: 1
      },
      { speaker: "अना", text: "हाँ, कृपया! मुझे मीठे सेब बहुत पसंद हैं।", audioText: "हाँ, कृपया! मुझे मीठे सेब बहुत पसंद हैं।" },
      { speaker: "रवि", text: "यह लो। अब, चलो वह किताब ढूंढते हैं।", audioText: "यह लो। अब, चलो वह किताब ढूंढते हैं।" },
      { speaker: "अना", text: "धन्यवाद, रवि! तुम बहुत अच्छे दोस्त हो।", audioText: "धन्यवाद, रवि! तुम बहुत अच्छे दोस्त हो।" }
    ] : [
      { speaker: "Ana", text: "Hello! My name is Ana.", audioText: "Hello! My name is Ana." },
      { speaker: "Ravi", text: "Hi Ana! I am Ravi. Welcome to our village.", audioText: "Hi Ana! I am Ravi. Welcome to our village." },
      { speaker: "Ana", text: "It is very beautiful here. I want to read a book.", audioText: "It is very beautiful here. I want to read a book." },
      {
        type: "question",
        question: "What does Ana want?",
        options: ["A book", "Water", "A toy"],
        correctIndex: 0
      },
      { speaker: "Ravi", text: "We have a library nearby. Let's go there!", audioText: "We have a library nearby. Let's go there!" },
      { speaker: "Ana", text: "Look at that tree! It has big red apples.", audioText: "Look at that tree! It has big red apples." },
      { speaker: "Ravi", text: "Yes, they are sweet. Do you want one?", audioText: "Yes, they are sweet. Do you want one." },
      {
        type: "question",
        question: "What fruit is on the tree?",
        options: ["Mango", "Apple", "Banana"],
        correctIndex: 1
      },
      { speaker: "Ana", text: "Oh yes, please! I love sweet apples.", audioText: "Oh yes, please! I love sweet apples." },
      { speaker: "Ravi", text: "Here you go. Now, let's find that book.", audioText: "Here you go. Now, let's find that book." },
      { speaker: "Ana", text: "Thank you, Ravi! You are a great friend.", audioText: "Thank you, Ravi! You are a great friend." }
    ];
    return { story: "Ana and Ravi's Adventure", dialogue };
  }

  if (practiceType === "Write Practice") {
    const writingQuestions = language === "Hindi" ? [
      { id: 1, type: "fillBlank", sentence: "सूरज पूर्व से ___ है।", answer: "उगता", hint: "दिशा" },
      { id: 2, type: "unscramble", hint: "अध्ययन का स्थान", emoji: "🏫", answer: "स्कूल", tiles: ["कू", "स", "ल"] },
      { id: 3, type: "writingActivity", prompt: "अपने पसंदीदा भोजन के बारे में 2 पंक्तियाँ लिखें।" },
      { id: 4, type: "tracing", letter: "B", word: "Ball", info: "Trace the letter B", sound: "Ball" },
      { id: 5, type: "translationTask", prompt: "Arrange the words to form: 'हमारा स्कूल सुंदर है'", englishTranslation: "our school is beautiful", tiles: ["our", "school", "is", "beautiful", "good", "house"] },
      { id: 6, type: "fillBlank", sentence: "हमें हर दिन ___ पीना चाहिए।", answer: "पानी", hint: "पेय" },
      { id: 7, type: "unscramble", hint: "एक फल", emoji: "🍎", answer: "सेब", tiles: ["ब", "से"] },
      { id: 8, type: "writingActivity", prompt: "आप सप्ताहांत में क्या करते हैं?" },
      { id: 9, type: "tracing", letter: "C", word: "Cat", info: "Trace the letter C", sound: "Cat" },
      { id: 10, type: "translationTask", prompt: "Arrange the words to form: 'यह एक बिल्ली है'", englishTranslation: "this is a cat", tiles: ["this", "is", "a", "cat", "dog", "rat"] }
    ] : language === "Kannada" ? [
      { id: 1, type: "fillBlank", sentence: "ಸೂರ್ಯನು ಪೂರ್ವದಲ್ಲಿ ___.", answer: "ಉದಯಿಸುತ್ತಾನೆ", hint: "ದಿಕ್ಕು" },
      { id: 2, type: "unscramble", hint: "ಕಲಿಯುವ ಸ್ಥಳ", emoji: "🏫", answer: "ಶಾಲೆ", tiles: ["ಲೆ", "ಶಾ"] },
      { id: 3, type: "writingActivity", prompt: "ನಿಮ್ಮ ನೆಚ್ಚಿನ ಆಹಾರದ ಬಗ್ಗೆ 2 ಸಾಲುಗಳನ್ನು ಬರೆಯಿರಿ." },
      { id: 4, type: "tracing", letter: "B", word: "Ball", info: "Trace the letter B", sound: "Ball" },
      { id: 5, type: "translationTask", prompt: "Arrange the words to form: 'ನಮ್ಮ ಶಾಲೆ ಸುಂದರವಾಗಿದೆ'", englishTranslation: "our school is beautiful", tiles: ["our", "school", "is", "beautiful", "good", "house"] },
      { id: 6, type: "fillBlank", sentence: "ನಾವು ಪ್ರತಿದಿನ ___ ಕುಡಿಯಬೇಕು.", answer: "ನೀರು", hint: "ಪಾನೀಯ" },
      { id: 7, type: "unscramble", hint: "ಒಂದು ಹಣ್ಣು", emoji: "🍎", answer: "ಸೇಬು", tiles: ["ಬು", "ಸೇ"] },
      { id: 8, type: "writingActivity", prompt: "ನೀವು ವಾರಾಂತ್ಯದಲ್ಲಿ ಏನು ಮಾಡುತ್ತೀರಿ?" },
      { id: 9, type: "tracing", letter: "C", word: "Cat", info: "Trace the letter C", sound: "Cat" },
      { id: 10, type: "translationTask", prompt: "Arrange the words to form: 'ಇದು ಒಂದು ಬೆಕ್ಕು'", englishTranslation: "this is a cat", tiles: ["this", "is", "a", "cat", "dog", "rat"] }
    ] : language === "Telugu" ? [
      { id: 1, type: "fillBlank", sentence: "సూర్యుడు తూర్పున ___.", answer: "ఉదయిస్తాడు", hint: "దిశ" },
      { id: 2, type: "unscramble", hint: "మనం చదువుకునే చోటు", emoji: "🏫", answer: "బడి", tiles: ["డి", "బ"] },
      { id: 3, type: "writingActivity", prompt: "మీకు ఇష్టమైన ఆహారం గురించి 2 వాక్యాలు రాయండి." },
      { id: 4, type: "tracing", letter: "B", word: "Ball", info: "Trace the letter B", sound: "Ball" },
      { id: 5, type: "translationTask", prompt: "Arrange the words to form: 'మా బడి చాలా అందంగా ఉంటుంది'", englishTranslation: "our school is beautiful", tiles: ["our", "school", "is", "beautiful", "good", "house"] },
      { id: 6, type: "fillBlank", sentence: "మనం ప్రతిరోజూ శుభ్రమైన ___ తాగాలి.", answer: "నీరు", hint: "పానీయం" },
      { id: 7, type: "unscramble", hint: "ఒక పండు", emoji: "🍎", answer: "ఆపిల్", tiles: ["ల్", "పి", "ఆ"] },
      { id: 8, type: "writingActivity", prompt: "మీరు వారాంతాల్లో ఏమి చేస్తారు?" },
      { id: 9, type: "tracing", letter: "C", word: "Cat", info: "Trace the letter C", sound: "Cat" },
      { id: 10, type: "translationTask", prompt: "Arrange the words to form: 'ఇది ఒక పిల్లి'", englishTranslation: "this is a cat", tiles: ["this", "is", "a", "cat", "dog", "rat"] }
    ] : language === "Tamil" ? [
      { id: 1, type: "fillBlank", sentence: "சூரியன் கிழக்கில் ___.", answer: "உதிக்கிறது", hint: "திசை" },
      { id: 2, type: "unscramble", hint: "நாங்கள் படிக்கும் இடம்", emoji: "🏫", answer: "பள்ளி", tiles: ["ளி", "பல்"] },
      { id: 3, type: "writingActivity", prompt: "உங்களுக்கு பிடித்த உணவை பற்றி 2 வரிகள் எழுதவும்." },
      { id: 4, type: "tracing", letter: "B", word: "Ball", info: "Trace the letter B", sound: "Ball" },
      { id: 5, type: "translationTask", prompt: "Arrange the words to form: 'எங்கள் பள்ளி அழகாக இருக்கிறது'", englishTranslation: "our school is beautiful", tiles: ["our", "school", "is", "beautiful", "good", "house"] },
      { id: 6, type: "fillBlank", sentence: "நாம் தினமும் சுத்தமான ___ குடிக்க வேண்டும்.", answer: "தண்ணீர்", hint: "பானம்" },
      { id: 7, type: "unscramble", hint: "ஒரு பழம்", emoji: "🍎", answer: "ஆப்பிள்", tiles: ["ள்", "பி", "ஆப்"] },
      { id: 8, type: "writingActivity", prompt: "வார இறுதியில் நீங்கள் என்ன செய்கிறீர்கள்?" },
      { id: 9, type: "tracing", letter: "C", word: "Cat", info: "Trace the letter C", sound: "Cat" },
      { id: 10, type: "translationTask", prompt: "Arrange the words to form: 'இது ஒரு பூனை'", englishTranslation: "this is a cat", tiles: ["this", "is", "a", "cat", "dog", "rat"] }
    ] : [
      { id: 1, type: "fillBlank", sentence: "The sun rises in the ___.", answer: "east", hint: "A cardinal direction" },
      { id: 2, type: "unscramble", hint: "Where we study", emoji: "🏫", answer: "SCHOOL", tiles: ["L","O","C","S","H","O"] },
      { id: 3, type: "writingActivity", prompt: "Write 2 sentences about your favorite food." },
      { id: 4, type: "tracing", letter: "B", word: "Ball", info: "Trace the letter B", sound: "Ball" },
      { id: 5, type: "translationTask", prompt: "Arrange the words to form: 'our school is beautiful'", englishTranslation: "our school is beautiful", tiles: ["our", "school", "is", "beautiful", "good", "house"] },
      { id: 6, type: "fillBlank", sentence: "We should drink clean ___ every day.", answer: "water", hint: "Essential liquid" },
      { id: 7, type: "unscramble", hint: "A sweet red fruit", emoji: "🍎", answer: "APPLE", tiles: ["P","L","A","P","E"] },
      { id: 8, type: "writingActivity", prompt: "What do you do on weekends?" },
      { id: 9, type: "tracing", letter: "C", word: "Cat", info: "Trace the letter C", sound: "Cat" },
      { id: 10, type: "translationTask", prompt: "Arrange the words to form: 'this is a cat'", englishTranslation: "this is a cat", tiles: ["this", "is", "a", "cat", "dog", "rat"] }
    ];
    return { questions: writingQuestions };
  }

  return {
    story: language === "Hindi" 
      ? "एक गाँव में एक छोटा लड़का रहता था। उसका नाम राहुल था। राहुल को पढ़ना बहुत पसंद था। वह हर दिन पुस्तकालय जाता था और नई कहानियाँ पढ़ता था।"
      : language === "Kannada"
      ? "ಒಂದು ಹಳ್ಳಿಯಲ್ಲಿ ಒಬ್ಬ ಸಣ್ಣ ಹುಡುಗನಿದ್ದನು. ಅವನ ಹೆಸರು ರಾಹುಲ್. ರಾಹುಲ್ ಗೆ ಓದುವುದೆಂದರೆ ತುಂಬಾ ಇಷ್ಟ. ಅವನು ಪ್ರತಿದಿನ ಗ್ರಂಥಾಲಯಕ್ಕೆ ಹೋಗಿ ಹೊಸ ಕಥೆಗಳನ್ನು ಓದುತ್ತಿದ್ದನು."
      : language === "Telugu"
      ? "ఒక గ్రామంలో రాహుల్ అనే చిన్న బాలుడు ఉండేవాడు. రాహుల్‌కు పుస్తకాలు చదవడం చాలా ఇష్టం. అతను ప్రతిరోజూ కొత్త మరియు ఆసక్తికరమైన కథలను చదవడానికి స్థానిక గ్రంథాలయానికి వెళ్ళేవాడు."
      : language === "Tamil"
      ? "ஒரு கிராமத்தில் ராகுல் என்ற சிறுவன் வாழ்ந்து வந்தான். ராகுலுக்கு புத்தகங்கள் படிப்பது மிகவும் பிடிக்கும். அவன் ஒவ்வொரு நாளும் புதிய மற்றும் சுவாரஸ்யமான கதைகளைப் படிக்க உள்ளூர் நூலகத்திற்குச் சென்றான்."
      : "A little boy named Rahul lived in a green village. Rahul loved reading books very much. Every single day, he visited the local library to read new and exciting stories.",
    questions: language === "Hindi" ? [
      { id: 1, question: "लड़के का क्या नाम था?", options: ["राहुल", "रवि", "अमित", "विजय"], correctIndex: 0, explanation: "कहानी में कहा गया है कि लड़के का नाम राहुल था।" },
      { id: 2, question: "राहुल कहाँ रहता था?", options: ["एक हरे-भरे गाँव में", "एक शहर में", "एक जंगल में", "पहाड़ पर"], correctIndex: 0, explanation: "राहुल एक गाँव (हरे-भरे गाँव) में रहता था।" },
      { id: 3, question: "राहुल को क्या करना बहुत पसंद था?", options: ["किताबें पढ़ना", "क्रिकेट खेलना", "टीवी देखना", "तैरना"], correctIndex: 0, explanation: "राहुल को पढ़ना बहुत पसंद था।" },
      { id: 4, question: "राहुल कितनी बार पुस्तकालय जाता था?", options: ["हर दिन", "सप्ताह में एक बार", "केवल सप्ताहांत पर", "महीने में एक बार"], correctIndex: 0, explanation: "वह हर दिन पुस्तकालय जाता था।" },
      { id: 5, question: "राहुल नई कहानियाँ पढ़ने कहाँ जाता था?", options: ["स्थानीय पुस्तकालय", "अपने स्कूल", "पार्क", "दोस्त के घर"], correctIndex: 0, explanation: "वह हर दिन पुस्तकालय जाता था।" },
      { id: 6, question: "राहुल किस प्रकार की कहानियाँ पढ़ता था?", options: ["नई और रोमांचक कहानियाँ", "डरावनी कहानियाँ", "उबाऊ कहानियाँ", "गणित की पुस्तकें"], correctIndex: 0, explanation: "वह नई कहानियाँ पढ़ता था।" },
      { id: 7, question: "राहुल जिस गाँव में रहता था वह कैसा था?", options: ["हरा-भरा", "बड़ा", "व्यस्त", "सूखा"], correctIndex: 0, explanation: "वह एक हरे-भरे (green) गाँव में रहता था।" },
      { id: 8, question: "इस कहानी का मुख्य पात्र कौन है?", options: ["राहुल", "रवि", "अमित", "विजय"], correctIndex: 0, explanation: "मुख्य पात्र राहुल है।" },
      { id: 9, question: "राहुल का पसंदीदा शौक क्या था?", options: ["पढ़ना", "दौड़ना", "चित्र बनाना", "नाचना"], correctIndex: 0, explanation: "राहुल को किताबें पढ़ना बहुत पसंद था।" },
      { id: 10, question: "वाक्य पूरा करें: राहुल पढ़ने के लिए स्थानीय ___ जाता था।", options: ["पुस्तकालय", "स्कूल", "दुकान", "उद्यान"], correctIndex: 0, explanation: "वह स्थानीय पुस्तकालय जाता था।" }
    ] : language === "Kannada" ? [
      { id: 1, question: "ಹುಡುಗನ ಹೆಸರೇನು?", options: ["ರಾಹುಲ್", "ರವಿ", "ಅಮಿತ್", "ವಿಜಯ್"], correctIndex: 0, explanation: "ಹುಡುಗನ ಹೆಸರು ರಾಹುಲ್ ಎಂದು ಕಥೆಯಲ್ಲಿ ಹೇಳಲಾಗಿದೆ." },
      { id: 2, question: "ರಾಹುಲ್ ಎಲ್ಲಿ ವಾಸಿಸುತ್ತಿದ್ದನು?", options: ["ಹಸಿರು ಹಳ್ಳಿಯಲ್ಲಿ", "ನಗರಾಟದಲ್ಲಿ", "ಕಾಡಿನಲ್ಲಿ", "ಬೆಟ್ಟದ ಮೇಲೆ"], correctIndex: 0, explanation: "ರಾಹುಲ್ ಹಳ್ಳಿಯಲ್ಲಿ ವಾಸಿಸುತ್ತಿದ್ದನು." },
      { id: 3, question: "ರಾಹುಲ್ ಗೆ ಏನು ಮಾಡುವುದೆಂದರೆ ತುಂಬಾ ಇಷ್ಟ?", options: ["ಪುಸ್ತಕ ಓದುವುದು", "ಕ್ರಿಕೆಟ್ ಆಡುವುದು", "ಟಿವಿ ನೋಡುವುದು", "ಈಜುವುದು"], correctIndex: 0, explanation: "ರಾಹುಲ್ ಗೆ ಓದುವುದೆಂದರೆ ತುಂಬಾ ಇಷ್ಟ." },
      { id: 4, question: "ರಾಹುಲ್ ಎಷ್ಟು ಬಾರಿ ಗ್ರಂಥಾಲಯಕ್ಕೆ ಹೋಗುತ್ತಿದ್ದನು?", options: ["ಪ್ರತಿದಿನ", "ವಾರಕ್ಕೊಮ್ಮೆ", "ವಾರಾಂತ್ಯದಲ್ಲಿ ಮಾತ್ರ", "ತಿಂಗಳಿಗೊಮ್ಮೆ"], correctIndex: 0, explanation: "ಅವನು ಪ್ರತಿದಿನ ಗ್ರಂಥಾಲಯಕ್ಕೆ ಹೋಗುತ್ತಿದ್ದನು." },
      { id: 5, question: "ರಾಹುಲ್ ಹೊಸ ಕಥೆಗಳನ್ನು ಓದಲು ಎಲ್ಲಿಗೆ ಹೋಗುತ್ತಿದ್ದನು?", options: ["ಸ್ಥಾನಿಕ ಗ್ರಂಥಾಲಯಕ್ಕೆ", "ಶಾಲೆಗೆ", "ಪಾರ್ಕ್ ಗೆ", "ಸ್ನೇಹಿತನ ಮನೆಗೆ"], correctIndex: 0, explanation: "ಅವನು ಸ್ಥಾನಿಕ ಗ್ರಂಥಾಲಯಕ್ಕೆ ಹೋಗುತ್ತಿದ್ದನು." },
      { id: 6, question: "ರಾಹುಲ್ ಎಂತಹ ಕಥೆಗಳನ್ನು ಓದುತ್ತಿದ್ದನು?", options: ["ಹೊಸ ಮತ್ತು ರೋಮಾಂಚಕ ಕಥೆಗಳನ್ನು", "ಭಯಾನಕ ಕಥೆಗಳನ್ನು", "ಬೇಸರದ ಕಥೆಗಳನ್ನು", "ಗಣಿತ ಪುಸ್ತಕಗಳನ್ನು"], correctIndex: 0, explanation: "ಅವನು ಹೊಸ ಕಥೆಗಳನ್ನು ಓದುತ್ತಿದ್ದನು." },
      { id: 7, question: "ರಾಹುಲ್ ವಾಸಿಸುತ್ತಿದ್ದ ಹಳ್ಳಿ ಎಂತಹದ್ದಾಗಿತ್ತು?", options: ["ಹಸಿರು", "ದೊಡ್ಡದಾದ", "ಗಿಜಿಗುಡುವ", "ಒಣಗಿದ"], correctIndex: 0, explanation: "ಅವನು ಹಸಿರು ಹಳ್ಳಿಯಲ್ಲಿ ವಾಸಿಸುತ್ತಿದ್ದನು." },
      { id: 8, question: "ಈ ಕಥೆಯ ಮುಖ್ಯ ಪಾತ್ರ ಯಾರು?", options: ["ರಾಹುಲ್", "ರವಿ", "ಅಮಿತ್", "ವಿಜಯ್"], correctIndex: 0, explanation: "ಮುಖ್ಯ ಪಾತ್ರ ರಾಹುಲ್." },
      { id: 9, question: "ರಾಹುಲ್ ನ ನೆಚ್ಚಿನ ಹವ್ಯಾಸ ಯಾವುದು?", options: ["ಓದುವುದು", "ಓಡುವುದು", "ಚಿತ್ರ ಬಿಡಿಸುವುದು", "ನೃತ್ಯ"], correctIndex: 0, explanation: "ಅವನಿಗೆ ಓದುವುದೆಂದರೆ ತುಂಬಾ ಇಷ್ಟ." },
      { id: 10, question: "ವಾಕ್ಯ ಪೂರ್ಣಗೊಳಿಸಿ: ರಾಹುಲ್ ಓದಲು ಸ್ಥಾನಿಕ ___ ಕ್ಕೆ ಹೋಗುತ್ತಿದ್ದನು.", options: ["ಗ್ರಂಥಾಲಯಕ್ಕೆ", "ಶಾಲೆಗೆ", "ಅಂಗಡಿಗೆ", "ತೋಟಕ್ಕೆ"], correctIndex: 0, explanation: "ಅವನು ಸ್ಥಾನಿಕ ಗ್ರಂಥಾಲಯಕ್ಕೆ ಹೋಗುತ್ತಿದ್ದನು." }
    ] : language === "Telugu" ? [
      { id: 1, question: "బాలుడి పేరు ఏమిటి?", options: ["రాహుల్", "రవి", "అమిత్", "విజయ్"], correctIndex: 0, explanation: "బాలుడి పేరు రాహుల్ అని కథలో పేర్కొనబడింది." },
      { id: 2, question: "రాహుల్ ఎక్కడ నివసించేవాడు?", options: ["ఆకుపచ్చని గ్రామంలో", "నగరంలో", "అడవిలో", "కొండపై"], correctIndex: 0, explanation: "రాహుల్ ఒక పచ్చని గ్రామంలో నివసించేవాడు." },
      { id: 3, question: "రాహుల్‌కు ఏమి చేయడం చాలా ఇష్టం?", options: ["పుస్తకాలు చదవడం", "క్రికెట్ ఆడటం", "టీవీ చూడటం", "ఈదడం"], correctIndex: 0, explanation: "రాహుల్‌కు పుస్తకాలు చదవడం చాలా ఇష్టం." },
      { id: 4, question: "రాహుల్ ఎంత తరచుగా గ్రంథాలయానికి వెళ్ళేవాడు?", options: ["ప్రతిరోజూ", "వారానికి ఒకసారి", "వారాంతాల్లో మాత్రమే", "నెలకు ఒకసారి"], correctIndex: 0, explanation: "అతను ప్రతిరోజూ గ్రంథాలయానికి వెళ్ళేవాడు." },
      { id: 5, question: "రాహుల్ కొత్త కథలు చదవడానికి ఎక్కడికి వెళ్ళేవాడు?", options: ["స్థానిక గ్రంథాలయానికి", "పాఠశాలకు", "పార్కుకు", "స్నేహితుడి ఇంటికి"], correctIndex: 0, explanation: "స్థానిక గ్రంథాలయానికి వెళ్ళేవాడు." },
      { id: 6, question: "రాహుల్ ఎలాంటి కథలు చదివేవాడు?", options: ["కొత్త మరియు ఆసక్తికరమైన కథలు", "భయానక కథలు", "విసుగు పుట్టించే కథలు", "గణిత పుస్తకాలు"], correctIndex: 0, explanation: "కొత్త మరియు ఆసక్తికరమైన కథలను చదివేవాడు." },
      { id: 7, question: "రాహుల్ నివసించిన గ్రామం ఎటువంటిది?", options: ["ఆకుపచ్చనిది", "పెద్దది", "సందడిగా ఉండేది", "ఎండిపోయినది"], correctIndex: 0, explanation: "ఆకుపచ్చని గ్రామంలో నివసించేవాడు." },
      { id: 8, question: "ఈ కథలో ప్రధాన పాత్ర ఎవరు?", options: ["రాహుల్", "రవి", "అమిత్", "విజయ్"], correctIndex: 0, explanation: "ప్రధాన పాత్ర రాహుల్." },
      { id: 9, question: "రాహుల్ కి ఇష్టమైన వ్యాపకం ఏమిటి?", options: ["చదవడం", "పరుగెత్తడం", "చిత్రాలు గీయడం", "నాట్యం చేయడం"], correctIndex: 0, explanation: "పుస్తకాలు చదవడం చాలా ఇష్టం." },
      { id: 10, question: "వాక్యం పూర్తి చేయండి: రాహుల్ చదవడానికి స్థానిక ___ కి వెళ్ళేవాడు.", options: ["గ్రంథాలయానికి", "పాఠశాలకు", "దుకాణానికి", "తోటకి"], correctIndex: 0, explanation: "స్థానిక గ్రంథాలయానికి వెళ్ళేవాడు." }
    ] : language === "Tamil" ? [
      { id: 1, question: "சிறுவனின் பெயர் என்ன?", options: ["ராகுல்", "ரவி", "அமித்", "விஜய்"], correctIndex: 0, explanation: "சிறுவனின் பெயர் ராகுல் என்று கதையில் கூறப்பட்டுள்ளது." },
      { id: 2, question: "ராகுல் எங்கு வாழ்ந்து வந்தான்?", options: ["பசுமையான கிராமத்தில்", "நகரத்தில்", "காட்டில்", "மலையில்"], correctIndex: 0, explanation: "ராகுல் பசுமையான கிராமத்தில் வாழ்ந்து வந்தான்." },
      { id: 3, question: "ராகுலுக்கு என்ன செய்ய மிகவும் பிடிக்கும்?", options: ["புத்தகங்கள் படிப்பது", "கிரிக்கெட் விளையாடுவது", "டிவி பார்ப்பது", "நீந்துவது"], correctIndex: 0, explanation: "ராகுலுக்கு புத்தகங்கள் படிப்பது மிகவும் பிடிக்கும்." },
      { id: 4, question: "ராகுல் எவ்வளவு அடிக்கடி நூலகத்திற்குச் சென்றான்?", options: ["ஒவ்வொரு நாளும்", "வாரத்திற்கு ஒருமுறை", "வார இறுதியில் மட்டும்", "மாதத்திற்கு ஒருமுறை"], correctIndex: 0, explanation: "அவன் ஒவ்வொரு நாளும் நூலகத்திற்குச் சென்றான்." },
      { id: 5, question: "ராகுல் புதிய கதைகளைப் படிக்க எங்குச் சென்றான்?", options: ["உள்ளூர் நூலகத்திற்கு", "பள்ளிக்கு", "பூங்காவிற்கு", "நண்பன் வீட்டிற்கு"], correctIndex: 0, explanation: "உள்ளூர் நூலகத்திற்குச் சென்றான்." },
      { id: 6, question: "ராகுல் எத்தகைய கதைகளைப் படித்தான்?", options: ["புதிய மற்றும் சுவாரஸ்யமான கதைகளை", "பயமுறுத்தும் கதைகளை", "சலிப்பான கதைகளை", "கணக்கு புத்தகங்களை"], correctIndex: 0, explanation: "புதிய மற்றும் சுவாரஸ்யமான கதைகளைப் படித்தான்." },
      { id: 7, question: "ராகுல் வாழ்ந்த கிராமத்தின் தன்மை என்ன?", options: ["பசுமையான", "பெரிய", "பரபரப்பான", "வறண்ட"], correctIndex: 0, explanation: "பசுமையான கிராமத்தில் வாழ்ந்து வந்தான்." },
      { id: 8, question: "இந்த கதையின் முக்கிய கதாபாத்திரம் யார்?", options: ["ராகுல்", "ரவி", "அமித்", "விஜய்"], correctIndex: 0, explanation: "முக்கிய கதாபாத்திரம் ராகுல்." },
      { id: 9, question: "ராகுலின் விருப்பமான பொழுதுபோக்கு எது?", options: ["படிப்பது", "ஓடுவது", "வரைவது", "நடனமாடுவது"], correctIndex: 0, explanation: "புத்தகங்கள் படிப்பது அவனுக்கு மிகவும் பிடிக்கும்." },
      { id: 10, question: "வாக்கியத்தை நிரப்புக: ராகுல் படிக்க உள்ளூர் ___ க்குச் சென்றான்.", options: ["நூலகத்திற்கு", "பள்ளிக்கு", "கடைக்கு", "தோட்டத்திற்கு"], correctIndex: 0, explanation: "உள்ளூர் நூலகத்திற்குச் சென்றான்." }
    ] : [
      { id: 1, question: "What was the name of the boy?", options: ["Rahul", "Ravi", "Amit", "Vijay"], correctIndex: 0, explanation: "The story states the boy's name was Rahul." },
      { id: 2, question: "Where did Rahul live?", options: ["In a green village", "In a city", "In a forest", "On a hill"], correctIndex: 0, explanation: "Rahul lived in a green village." },
      { id: 3, question: "What did Rahul love doing?", options: ["Reading books", "Playing cricket", "Watching television", "Swimming"], correctIndex: 0, explanation: "Rahul loved reading books very much." },
      { id: 4, question: "How often did Rahul visit the library?", options: ["Every single day", "Once a week", "Only on weekends", "Once a month"], correctIndex: 0, explanation: "He visited the library every single day." },
      { id: 5, question: "Where did Rahul go to read new stories?", options: ["The local library", "His school", "A park", "A friend's house"], correctIndex: 0, explanation: "He visited the local library to read." },
      { id: 6, question: "What kind of stories did Rahul read?", options: ["New and exciting stories", "Scary stories", "Boring stories", "Math books"], correctIndex: 0, explanation: "He read new and exciting stories." },
      { id: 7, question: "What describes the village Rahul lived in?", options: ["Green", "Large", "Busy", "Dry"], correctIndex: 0, explanation: "He lived in a green village." },
      { id: 8, question: "Who is the main character of this story?", options: ["Rahul", "Ravi", "Amit", "Vijay"], correctIndex: 0, explanation: "Rahul is the main character." },
      { id: 9, question: "What was Rahul's favorite hobby?", options: ["Reading", "Running", "Drawing", "Dancing"], correctIndex: 0, explanation: "Rahul loved reading books." },
      { id: 10, question: "Complete the sentence: Rahul visited the local ___ to read.", options: ["Library", "School", "Shop", "Garden"], correctIndex: 0, explanation: "He visited the local library." }
    ]
  };
};;

export const generatePracticeContent = async (params) => {
  // Development mode OFF: skip the AI call and return the static fallback practice content.
  if (params.useFallback) {
    return getFallbackPractice(params);
  }

  const prompt = buildPracticePrompt(params);
  if (!prompt) return null;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 4096,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Gemini/OpenRouter Practice API error:", err);
      return getFallbackPractice(params);
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content || "";
    return extractJSON(text);
  } catch (err) {
    console.error("Failed to generate practice content:", err);
    return getFallbackPractice(params);
  }
};

const getHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
};

export const translateTextContent = async (text, targetLanguage) => {
  if (!targetLanguage || targetLanguage === "English") return text;
  
  const cacheKey = `lisa_trans_${targetLanguage}_${getHash(text)}`;
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) return cached;
  } catch (e) {
    console.warn("Could not read translation cache:", e);
  }

  try {
    const prompt = `You are a translation assistant. Translate the following text from English to ${targetLanguage}.
Return ONLY a JSON object with this exact structure:
{
  "translatedText": "translated text"
}

Input:
"${text}"`;

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 1024,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      throw new Error("Translation request failed");
    }

    const data = await response.json();
    const resultText = data?.choices?.[0]?.message?.content || "";
    const parsed = extractJSON(resultText);
    const translated = parsed?.translatedText || text;

    try {
      localStorage.setItem(cacheKey, translated);
    } catch (e) {
      console.warn("Could not save to translation cache:", e);
    }

    return translated;
  } catch (err) {
    console.error("Translation error for text:", text, err);
    return text;
  }
};

export const translateMCQContent = async (questionText, optionsArray, targetLanguage) => {
  if (!targetLanguage || targetLanguage === "English") {
    return { question: questionText, options: optionsArray };
  }

  const payloadStr = JSON.stringify({ questionText, optionsArray });
  const cacheKey = `lisa_trans_${targetLanguage}_${getHash(payloadStr)}`;
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch (e) {
    console.warn("Could not read translation cache:", e);
  }

  try {
    const prompt = `You are a translation assistant. Translate the following assessment question and its options from English to ${targetLanguage}.
Return ONLY a valid JSON object with the following structure:
{
  "question": "translated question text",
  "options": [
    "translated option 1",
    "translated option 2",
    "translated option 3",
    "translated option 4"
  ]
}

Input:
Question: "${questionText}"
Options: ${JSON.stringify(optionsArray)}`;

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 2048,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      throw new Error("Translation request failed");
    }

    const data = await response.json();
    const resultText = data?.choices?.[0]?.message?.content || "";
    const parsed = extractJSON(resultText);
    
    const result = {
      question: parsed?.question || questionText,
      options: parsed?.options || optionsArray
    };

    try {
      localStorage.setItem(cacheKey, JSON.stringify(result));
    } catch (e) {
      console.warn("Could not save to translation cache:", e);
    }

    return result;
  } catch (err) {
    console.error("Translation error for MCQ:", questionText, err);
    return { question: questionText, options: optionsArray };
  }
};
