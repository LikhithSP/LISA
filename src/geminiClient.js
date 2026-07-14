// LISA — Gemini AI Lesson Generator
// Uses Gemini 2.0 Flash REST API to generate personalized lesson content

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL_NAME = import.meta.env.VITE_OPENROUTER_MODEL || "google/gemma-4-31b-it:free";

const extractJSON = (text) => {
  if (!text) throw new Error("Empty text input for JSON parsing");
  const startIdx = text.indexOf("{");
  const endIdx = text.lastIndexOf("}");
  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    const jsonStr = text.substring(startIdx, endIdx + 1);
    try {
      return JSON.parse(jsonStr);
    } catch (e) {
      console.warn("Extracted substring is not valid JSON, trying raw cleaning:", e);
    }
  }
  const cleaned = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
  return JSON.parse(cleaned);
};

// Age group label for context adaptation
const getAgeContext = (age) => {
  const a = parseInt(age, 10) || 25;
  if (a <= 12) return { group: "child", contextName: "a child", contextExample: "Tom has a red ball." };
  if (a <= 17) return { group: "teen", contextName: "a teenager", contextExample: "Sara reads her school textbook." };
  if (a <= 59) return { group: "adult", contextName: "an adult", contextExample: "Ravi needs to submit a bank form." };
  return { group: "senior", contextName: "a senior citizen", contextExample: "Lakshmi visits the hospital for a check-up." };
};

const buildPrompt = (params) => {
  const {
    age, educationLevel, language, literacyLevel, literacyLevelName,
    weakAreas, sectionNum, sectionTitle, unitNum, unitTitle,
    lessonNum, lessonTitle, difficulty
  } = params;

  const ageCtx = getAgeContext(age);
  const weakList = (weakAreas || []).join(", ") || "general literacy";

  return `You are LISA, an expert AI literacy tutor. Generate a complete, structured lesson for a learner with the following profile:

LEARNER PROFILE:
- Age: ${age} (${ageCtx.contextName})
- Education Level: ${educationLevel}
- Preferred Language: ${language}
- Literacy Level: Level ${literacyLevel} — ${literacyLevelName}
- Weak Areas: ${weakList}

LESSON DETAILS:
- Section ${sectionNum}: ${sectionTitle}
- Unit ${unitNum}: ${unitTitle}
- Lesson ${lessonNum}: ${lessonTitle}
- Difficulty: ${difficulty}

IMPORTANT RULES:
1. ALL lesson content (explanation, examples, exercises) must be in ${language}.
2. Adapt ALL context examples to be age-appropriate. Example for this learner's age: "${ageCtx.contextExample}"
  3. Keep language simple and encouraging. Do not use jargon.
  4. The lesson must directly target the weak skill: ${weakList}.
  5. For "unscramble": "tiles" must be the individual letters of "answer" shuffled into a random order, written in the ${language} script.
  6. For "imageChoice": provide exactly 3 emoji options where "correctIndex" points to the emoji that matches "word".
  7. For "tracing": provide a letter/word to practice writing, a short "info" fact, and the "sound" text (spoken aloud to the learner).

Return ONLY valid JSON with this exact structure (no markdown, no backticks):
{
  "lessonTitle": "string",
  "skillFocus": "string",
  "explanation": "string (2-3 paragraphs explaining the concept clearly in ${language})",
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
    "phrase": "string (a sentence or phrase in ${language})",
    "options": ["correct English translation", "incorrect translation distractor 1", "incorrect translation distractor 2"],
    "correctIndex": 0
  },
  "translationTask": {
    "sentence": "string (a sentence in ${language})",
    "englishTranslation": "string (correct English translation)",
    "tiles": ["array of 6-8 English words containing all words from englishTranslation plus 2-3 distractor words"]
  },
  "matchingPairs": [
    {"left": "word or short phrase in ${language} 1", "right": "matching English word or phrase 1"},
    {"left": "word or short phrase in ${language} 2", "right": "matching English word or phrase 2"},
    {"left": "word or short phrase in ${language} 3", "right": "matching English word or phrase 3"},
    {"left": "word or short phrase in ${language} 4", "right": "matching English word or phrase 4"},
    {"left": "word or short phrase in ${language} 5", "right": "matching English word or phrase 5"}
  ],
  "listeningTask": {
    "audioText": "string (a simple sentence or phrase in ${language} for the user to listen to)",
    "tiles": ["array of 6-8 words in ${language} containing all words from audioText plus 2-3 distractor words"]
  },
  "unscramble": [
    {"hint": "string (a clue in ${language}, e.g. 'Where we study')", "emoji": "string (a single emoji hint, e.g. 🏫)", "answer": "SCHOOL", "tiles": ["L","S","O","C","H","O"]},
    {"hint": "string (another clue in ${language})", "emoji": "string (an emoji hint)", "answer": "APPLE", "tiles": ["P","L","A","P","E"]}
  ],
  "imageChoice": [
    {"word": "string (the target word in ${language})", "prompt": "string (instruction in ${language}, e.g. 'Tap the picture that means school')", "options": ["🏫","🍎","🚗"], "correctIndex": 0},
    {"word": "string (another target word in ${language})", "prompt": "string (instruction in ${language})", "options": ["🍎","🏫","🌞"], "correctIndex": 0}
  ],
  "tracing": [
    {"letter": "A", "word": "Apple", "info": "string (a short fact/info in ${language}, e.g. 'A is for Apple')", "sound": "Apple"},
    {"letter": "S", "word": "Sun", "info": "string (a short fact/info in ${language})", "sound": "Sun"}
  ],
  "aiFeedbackPositive": "string (encouraging message for correct answers in ${language})",
  "aiFeedbackNegative": "string (gentle corrective message in ${language})"
}`;
};

// Cache lesson content by lesson ID to avoid re-fetching
const lessonCache = new Map();

export const generateLessonContent = async (params) => {
  const cacheKey = `${params.sectionNum}_${params.unitNum}_${params.lessonNum}_${params.language}_${params.literacyLevel}`;
  
  if (lessonCache.has(cacheKey)) {
    return lessonCache.get(cacheKey);
  }

  const prompt = buildPrompt(params);

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`
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
      console.error("OpenRouter API error:", err);
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
    readingPassage: "Ram goes to school every day. He reads books and writes in his notebook. His teacher is very kind and helpful.",
    readingQuestion: "Where does Ram go every day?",
    readingAnswer: "Ram goes to school every day.",
    writingActivity: "Write 2-3 sentences about your daily routine using simple words.",
    pronunciationWords: ["school", "teacher", "notebook", "reading", "writing"],
    pronunciationTip: "Speak each word clearly and slowly. Break it into syllables.",
    speakSentence: language === "Hindi" ? "राम हर दिन स्कूल जाता है।" : language === "Kannada" ? "ರಾಮ್ ಪ್ರತಿ ದಿನ ಶಾಲೆಗೆ ಹೋಗುತ್ತಾನೆ." : "Ram goes to school every day.",
    meaningQuestion: {
      phrase: language === "Hindi" ? "नमस्ते" : language === "Kannada" ? "ನಮಸ್ಕಾರ" : "Namaskar",
      options: ["Hello", "Goodbye", "Thank you"],
      correctIndex: 0
    },
    translationTask: {
      sentence: language === "Hindi" ? "वह स्कूल जाता है" : language === "Kannada" ? "ಅವನು ಶಾಲೆಗೆ ಹೋಗುತ್ತಾನೆ" : "Avanu shalege hoguttane",
      englishTranslation: "He goes to school",
      tiles: ["He", "goes", "to", "school", "runs", "they", "market"]
    },
    matchingPairs: [
      { left: language === "Hindi" ? "स्कूल" : language === "Kannada" ? "ಶಾಲೆ" : "Shale", right: "School" },
      { left: language === "Hindi" ? "किताब" : language === "Kannada" ? "ಪುಸ್ತಕ" : "Pustaka", right: "Book" },
      { left: language === "Hindi" ? "लड़का" : language === "Kannada" ? "ಹುಡುಗ" : "Huduga", right: "Boy" },
      { left: language === "Hindi" ? "पानी" : language === "Kannada" ? "ನೀರು" : "Neeru", right: "Water" }
    ],
    listeningTask: {
      audioText: language === "Hindi" ? "वह जाता है" : language === "Kannada" ? "ಅವನು ಹೋಗುತ್ತಾನೆ" : "He goes",
      tiles: language === "Hindi" ? ["वह", "जाता", "है", "तुम", "हम"] : language === "Kannada" ? ["ಅವನು", "ಹೋಗುತ್ತಾನೆ", "ಬರುತ್ತಾನೆ", "ನಾವು"] : ["He", "goes", "comes", "we"]
    },
    unscramble: [
      { hint: "Where we study", emoji: "🏫", answer: "SCHOOL", tiles: ["L", "O", "C", "S", "H", "O"] },
      { hint: "A red fruit", emoji: "🍎", answer: "APPLE", tiles: ["P", "L", "A", "P", "E"] },
      { hint: "The bright star of the day", emoji: "🌞", answer: "SUN", tiles: ["N", "U", "S"] }
    ],
    imageChoice: [
      { word: "school", prompt: "Tap the picture that means school", options: ["🏫", "🍎", "🚗"], correctIndex: 0 },
      { word: "water", prompt: "Tap the picture that means water", options: ["🔥", "💧", "🌞"], correctIndex: 1 },
      { word: "apple", prompt: "Tap the picture that means apple", options: ["🍎", "🏫", "🌞"], correctIndex: 0 }
    ],
    tracing: [
      { letter: "A", word: "Apple", info: "A is for Apple", sound: "Apple" },
      { letter: "S", word: "Sun", info: "S is for Sun", sound: "Sun" },
      { letter: "B", word: "Ball", info: "B is for Ball", sound: "Ball" }
    ],
    aiFeedbackPositive: "Excellent work! You are making great progress.",
    aiFeedbackNegative: "Good try! Review the lesson and attempt again. You can do it!"
  };
};

export const clearLessonCache = () => lessonCache.clear();

export const fetchWordOfDay = async (language = "English", context = {}) => {
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
    const prompt = `You are a helpful literacy assistant. ${learnerContext} Suggest a unique, helpful "Word of the Day" in ${language} that is practical for learning and well-suited to this specific learner's literacy level, age, and education (not too easy, not too difficult). Also provide a simple, clear meaning (definition) of the word, and a simple, clear, age-appropriate example sentence showing how to use it.
    
    Return ONLY valid JSON with this exact structure (no markdown, no backticks):
    {
      "word": "string",
      "meaning": "string",
      "example": "string"
    }`;

    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`
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
      throw new Error("Failed to fetch from OpenRouter");
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
    console.error("Failed to fetch word of the day from OpenRouter, using fallback:", err);
    return {
      word: language === "Hindi" ? "परिश्रमी" : "Diligent",
      meaning: language === "Hindi" ? "मेहनती और लगनशील" : "Hardworking and showing care",
      example: language === "Hindi" 
        ? "एक परिश्रमी छात्र हर दिन थोड़ा पढ़ता है।" 
        : "A diligent student practices reading a little every day."
    };
  }
};

const buildPracticePrompt = (params) => {
  const { practiceType, language, literacyLevel, literacyLevelName, mistakesList } = params;

  if (practiceType === "Perfect Pronunciation" || practiceType === "Speak Practice") {
    return `You are LISA, an expert AI literacy tutor. Generate exactly 10 speaking/pronunciation practice questions in ${language} suitable for a learner at Literacy Level ${literacyLevel} (${literacyLevelName}).
Each question must be a simple, practical, everyday sentence in ${language}.

Return ONLY valid JSON with this exact structure:
{
  "questions": [
    {
      "id": 1,
      "sentence": "A simple, encouraging sentence to read aloud in ${language}",
      "englishTranslation": "The English translation of the sentence"
    }
  ]
} (Make sure there are exactly 10 items in the array)`;
  }

  if (practiceType === "Listen Practice") {
    return `You are LISA, an expert AI literacy tutor. Generate exactly 10 listening practice questions in ${language} suitable for a learner at Literacy Level ${literacyLevel} (${literacyLevelName}).
Each question must be a simple, practical sentence in ${language}. Provide the sentence and an array of word tiles in ${language} that the user will tap to reconstruct the sentence (include all words of the sentence plus 2-3 distractor words).

Return ONLY valid JSON with this exact structure:
{
  "questions": [
    {
      "id": 1,
      "audioText": "The sentence in ${language} to listen to",
      "tiles": ["array of 6-8 words in ${language} containing all words from audioText plus 2-3 distractor words"]
    }
  ]
} (Make sure there are exactly 10 items in the array)`;
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

  return "";
};

const getFallbackPractice = (params) => {
  const { practiceType, language } = params;
  
  if (practiceType === "Perfect Pronunciation" || practiceType === "Speak Practice") {
    const sentences = language === "Hindi" ? [
      "राम स्कूल जाता है।", "वह किताब पढ़ता है।", "सीता गाना गाती है।", "आज मौसम अच्छा है।", "मुझे फल खाना पसंद है।",
      "यह मेरी पुस्तक है।", "हम सब मिलकर खेलेंगे।", "पानी बहुत ठंडा है।", "पेड़ पर पक्षी हैं।", "समय बहुत मूल्यवान है।"
    ] : language === "Kannada" ? [
      "ರಾಮ್ ಶಾಲೆಗೆ ಹೋಗುತ್ತಾನೆ.", "ಅವನು ಪುಸ್ತಕ ಓದುತ್ತಾನೆ.", "ಸೀತಾ ಹಾಡು ಹಾಡುತ್ತಾಳೆ.", "ಇಂದು ಹವಾಮಾನ ಚೆನ್ನಾಗಿದೆ.", "ನನಗೆ ಹಣ್ಣು ತಿನ್ನಲು ಇಷ್ಟ.",
      "ಇದು ನನ್ನ ಪುಸ್ತಕ.", "ನಾವೆಲ್ಲರೂ ಒಟ್ಟಿಗೆ ಆಡೋಣ.", "ನೀರು ತುಂಬಾ ತಣ್ಣಗಿದೆ.", "ಮರದ ಮೇಲೆ ಹಕ್ಕಿಗಳಿವೆ.", "ಸಮಯ ತುಂಬಾ ಅಮೂಲ್ಯವಾಗಿದೆ."
    ] : [
      "The sun shines bright.", "I love reading books.", "We go to school.", "Water is clean and fresh.", "She speaks very kindly.",
      "This is my favorite story.", "Let's play together today.", "The trees are green.", "Birds fly high in sky.", "Practice makes perfect."
    ];
    return {
      questions: sentences.map((s, idx) => ({
        id: idx + 1,
        sentence: s,
        englishTranslation: "Speak this sentence clearly."
      }))
    };
  }

  if (practiceType === "Listen Practice") {
    const sentences = language === "Hindi" ? [
      { audioText: "वह स्कूल जाता है", tiles: ["वह", "स्कूल", "जाता", "है", "घर", "खाता"] },
      { audioText: "राम किताब पढ़ता है", tiles: ["राम", "किताब", "पढ़ता", "है", "लिखता", "सीता"] },
      { audioText: "सीता गाना गाती है", tiles: ["सीता", "गाना", "गाती", "है", "नाचती", "गीत"] },
      { audioText: "आज मौसम बहुत अच्छा है", tiles: ["आज", "मौसम", "बहुत", "अच्छा", "है", "बुरा", "कल"] },
      { audioText: "मुझे फल खाना पसंद है", tiles: ["मुझे", "फल", "खाना", "पसंद", "है", "नापसंद", "पानी"] },
      { audioText: "यह मेरी नई पुस्तक है", tiles: ["यह", "मेरी", "नई", "पुस्तक", "है", "पुरानी", "कलम"] },
      { audioText: "हम सब मिलकर खेलेंगे", tiles: ["हम", "सब", "मिलकर", "खेलेंगे", "पढ़ेंगे", "आप"] },
      { audioText: "पानी बहुत ठंडा है", tiles: ["पानी", "बहुत", "ठंडा", "है", "गर्म", "चाय"] },
      { audioText: "पेड़ पर पक्षी बैठे हैं", tiles: ["पेड़", "पर", "पक्षी", "बैठे", "हैं", "बिल्ली", "नीचे"] },
      { audioText: "समय बहुत मूल्यवान होता है", tiles: ["समय", "बहुत", "मूल्यवान", "होता", "है", "बेकार", "सस्ता"] }
    ] : language === "Kannada" ? [
      { audioText: "ಅವನು ಶಾಲೆಗೆ ಹೋಗುತ್ತಾನೆ", tiles: ["ಅವನು", "ಶಾಲೆಗೆ", "ಹೋಗುತ್ತಾನೆ", "ಮನೆಗೆ", "ಬರುತ್ತಾನೆ"] },
      { audioText: "ರಾಮ್ ಪುಸ್ತಕ ಓದುತ್ತಾನೆ", tiles: ["ರಾಮ್", "ಪುಸ್ತಕ", "ಓದುತ್ತಾನೆ", "ಬರೆಯುತ್ತಾನೆ", "ಸೀತಾ"] },
      { audioText: "ಸೀತಾ ಹಾಡು ಹಾಡುತ್ತಾಳೆ", tiles: ["ಸೀತಾ", "ಹಾಡು", "ಹಾಡುತ್ತಾಳೆ", "ಕುಣಿಯುತ್ತಾಳೆ", "ಹಾಡುಗಾರ"] },
      { audioText: "ಇಂದು ಹವಾಮಾನ ಚೆನ್ನಾಗಿದೆ", tiles: ["ಇಂದು", "ಹವಾಮಾನ", "ಚೆನ್ನಾಗಿದೆ", "ಬಿಸಿಲಿದೆ", "ನಾಳೆ"] },
      { audioText: "ನನಗೆ ಹಣ್ಣು ತಿನ್ನಲು ಇಷ್ಟ", tiles: ["ನನಗೆ", "ಹಣ್ಣು", "ತಿನ್ನಲು", "ಇಷ್ಟ", "ತರಕಾರಿ", "ಕಷ್ಟ"] },
      { audioText: "ಇದು ನನ್ನ ಪುಸ್ತಕ", tiles: ["ಇದು", "ನನ್ನ", "ಪುಸ್ತಕ", "ಕಂಪ್ಯೂಟರ್", "ಅವಳ"] },
      { audioText: "ನಾವೆಲ್ಲರೂ ಒಟ್ಟಿಗೆ ಆಡೋಣ", tiles: ["ನಾವೆಲ್ಲರೂ", "ಒಟ್ಟಿಗೆ", "ಆಡೋಣ", "ಓದೋಣ", "ನೀವು"] },
      { audioText: "ನೀರು ತುಂಬಾ ತಣ್ಣಗಿದೆ", tiles: ["ನೀರು", "ತುಂಬಾ", "ತಣ್ಣಗಿದೆ", "ಬಿಸಿಯಾಗಿದೆ", "ಹಾಲು"] },
      { audioText: "ಮರದ ಮೇಲೆ ಹಕ್ಕಿಗಳಿವೆ", tiles: ["ಮರದ", "ಮೇಲೆ", "ಹಕ್ಕಿಗಳಿವೆ", "ಕೋತಿಗಳಿವೆ", "ಕೆಳಗೆ"] },
      { audioText: "ಸಮಯ ತುಂಬಾ ಅಮೂಲ್ಯವಾಗಿದೆ", tiles: ["ಸಮಯ", "ತುಂಬಾ", "ಅಮೂಲ್ಯವಾಗಿದೆ", "ವೇಸ್ಟ್", "ಹಣ"] }
    ] : [
      { audioText: "He goes to school", tiles: ["He", "goes", "to", "school", "runs", "they", "market"] },
      { audioText: "Ram reads a book", tiles: ["Ram", "reads", "a", "book", "writes", "paper", "she"] },
      { audioText: "Sita sings a song", tiles: ["Sita", "sings", "a", "song", "dances", "beautiful", "he"] },
      { audioText: "Today the weather is good", tiles: ["Today", "the", "weather", "is", "good", "bad", "hot"] },
      { audioText: "I like eating fresh fruits", tiles: ["I", "like", "eating", "fresh", "fruits", "vegetables", "dislike"] },
      { audioText: "This is my new notebook", tiles: ["This", "is", "my", "new", "notebook", "old", "pen"] },
      { audioText: "We will all play together", tiles: ["We", "will", "all", "play", "together", "study", "alone"] },
      { audioText: "The drinking water is cold", tiles: ["The", "drinking", "water", "is", "cold", "hot", "warm"] },
      { audioText: "Birds are sitting on trees", tiles: ["Birds", "are", "sitting", "on", "trees", "ground", "flying"] },
      { audioText: "Time is very valuable indeed", tiles: ["Time", "is", "very", "valuable", "indeed", "wasted", "money"] }
    ];
    return {
      questions: sentences.map((item, idx) => ({
        id: idx + 1,
        audioText: item.audioText,
        tiles: item.tiles
      }))
    };
  }

  if (practiceType === "Mistakes Practice") {
    return {
      questions: Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        type: i % 2 === 0 ? "mcq" : "fillBlank",
        question: `Review Question ${i + 1}: Select the grammatically correct option.`,
        options: ["He goes to school.", "He go to school.", "He going to school.", "He gone to school."],
        correctIndex: 0,
        explanation: "Subject-verb agreement requires 'goes' with 'He'.",
        sentence: `The children are playing with ___ toys.`,
        answer: "their",
        hint: "Possessive pronoun for they"
      }))
    };
  }

  if (practiceType === "Words Practice") {
    return {
      questions: Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        type: i % 2 === 0 ? "meaning" : "spelling",
        phrase: language === "Hindi" ? "पुस्तकालय" : language === "Kannada" ? "ಗ್ರಂಥಾಲಯ" : "Library",
        options: ["Library", "School", "Market"],
        correctIndex: 0,
        sentence: "Please open the do___ to let air in.",
        answer: "or",
        hint: "The entrance barrier"
      }))
    };
  }

  return {
    story: language === "Hindi" 
      ? "एक गाँव में एक छोटा लड़का रहता था। उसका नाम राहुल था। राहुल को पढ़ना बहुत पसंद था। वह हर दिन पुस्तकालय जाता था और नई कहानियाँ पढ़ता था।"
      : language === "Kannada"
      ? "ಒಂದು ಹಳ್ಳಿಯಲ್ಲಿ ಒಬ್ಬ ಸಣ್ಣ ಹುಡುಗನಿದ್ದನು. ಅವನ ಹೆಸರು ರಾಹುಲ್. ರಾಹುಲ್ ಗೆ ಓದುವುದೆಂದರೆ ತುಂಬಾ ಇಷ್ಟ. ಅವನು ಪ್ರತಿದಿನ ಗ್ರಂಥಾಲಯಕ್ಕೆ ಹೋಗಿ ಹೊಸ ಕಥೆಗಳನ್ನು ಓದುತ್ತಿದ್ದನು."
      : "A little boy named Rahul lived in a green village. Rahul loved reading books very much. Every single day, he visited the local library to read new and exciting stories.",
    questions: Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      question: language === "Hindi" 
        ? `कहानी प्रश्न ${i + 1}: मुख्य पात्र का क्या नाम था?` 
        : language === "Kannada" 
        ? `ಕಥೆಯ ಪ್ರಶ್ನೆ ${i + 1}: ಮುಖ್ಯ ಪಾತ್ರದ ಹೆಸರೇನು?` 
        : `Story Question ${i + 1}: What was the name of the main character?`,
      options: ["Rahul", "Ravi", "Amit", "Vijay"],
      correctIndex: 0,
      explanation: "The story states the boy's name was Rahul."
    }))
  };
};

export const generatePracticeContent = async (params) => {
  const prompt = buildPracticePrompt(params);
  if (!prompt) return null;

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`
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
      console.error("OpenRouter Practice API error:", err);
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

    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`
      },
      body: JSON.stringify({
        model: "cohere/north-mini-code:free",
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

    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`
      },
      body: JSON.stringify({
        model: "cohere/north-mini-code:free",
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
