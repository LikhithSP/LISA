// LISA — AI Lesson Generator (OpenRouter primary, Gemini fallback, Groq backup)

// ─── API Configuration ───────────────────────────────────────────────────────
// Always prefer OpenRouter for reliability; fall back to Gemini, then Groq.
const OPENROUTER_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const GEMINI_KEY     = import.meta.env.VITE_GEMINI_API_KEY;
const GROQ_KEY       = import.meta.env.VITE_GROQ_API_KEY;

const PRIMARY_URL    = "https://openrouter.ai/api/v1/chat/completions";
const FALLBACK_URL   = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
const GROQ_URL       = "https://api.groq.com/openai/v1/chat/completions";

const PRIMARY_KEY    = OPENROUTER_KEY;
const FALLBACK_KEY   = GEMINI_KEY;

// Use a capable free instruction model on OpenRouter
const PRIMARY_MODEL  = import.meta.env.VITE_OPENROUTER_MODEL || "mistralai/mistral-7b-instruct:free";
const FALLBACK_MODEL = import.meta.env.VITE_GEMINI_MODEL     || "gemini-2.0-flash";
const GROQ_MODEL     = import.meta.env.VITE_GROQ_MODEL       || "groq/compound";

// API Fetch Helper with Fallbacks
const fetchAI = async (prompt, maxTokens = 4096) => {
  if (PRIMARY_KEY) {
    try {
      console.log("Calling OpenRouter API...");
      const response = await fetch(PRIMARY_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${PRIMARY_KEY}`,
        },
        body: JSON.stringify({
          model: PRIMARY_MODEL,
          messages: [{ role: "user", content: prompt }],
          max_tokens: maxTokens,
          temperature: 0.1
        })
      });
      if (response.ok) {
        const data = await response.json();
        const text = data.choices?.[0]?.message?.content;
        if (text) return text;
      }
      console.warn("OpenRouter API returned error status:", response.status);
    } catch (e) {
      console.warn("OpenRouter fetch failed, trying Gemini...", e);
    }
  }

  if (FALLBACK_KEY) {
    try {
      console.log("Calling Gemini API...");
      const response = await fetch(FALLBACK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${FALLBACK_KEY}`
        },
        body: JSON.stringify({
          model: FALLBACK_MODEL,
          messages: [{ role: "user", content: prompt }],
          max_tokens: maxTokens,
          temperature: 0.1
        })
      });
      if (response.ok) {
        const data = await response.json();
        const text = data.choices?.[0]?.message?.content;
        if (text) return text;
      }
      console.warn("Gemini API returned error status:", response.status);
    } catch (e) {
      console.warn("Gemini fetch failed, trying Groq...", e);
    }
  }

  if (GROQ_KEY) {
    try {
      console.log("Calling Groq API...");
      const response = await fetch(GROQ_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GROQ_KEY}`
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [{ role: "user", content: prompt }],
          max_tokens: maxTokens,
          temperature: 0.1
        })
      });
      if (response.ok) {
        const data = await response.json();
        const text = data.choices?.[0]?.message?.content;
        if (text) return text;
      }
      console.warn("Groq API returned error status:", response.status);
    } catch (e) {
      console.error("Groq fetch failed:", e);
    }
  }

  throw new Error("All AI translation/content fetching providers failed or no keys configured.");
};

// ─── Tier Definitions (Duolingo cognitive-load tiers) ────────────────────────
// Tier 1 Receptive — tap/recognition only, zero typing
const RECEPTIVE_TYPES = ["mcq", "meaning", "matchPairs", "imageChoice", "listenWordMCQ", "listenPassageMCQ", "chatComplete", "scenario"];
// Tier 2 Productive — assembly using tiles
const PRODUCTIVE_TYPES = ["fillBlank", "arrangeWords", "listeningTask", "unscramble"];
// Tier 3 Expressive — free-form creation
const EXPRESSIVE_TYPES = ["passage", "writingActivity", "speak", "tracing"];

// Pick N items randomly from array (no repeats)
const pickRandom = (arr, n) => {
  const copy = [...arr];
  const result = [];
  for (let i = 0; i < n && copy.length > 0; i++) {
    const idx = Math.floor(Math.random() * copy.length);
    result.push(copy.splice(idx, 1)[0]);
  }
  return result;
};

// Build the ordered 8-step sequence: Intro, E, E, M, E, M, M, H
// For unit assessments (isAssessment=true) shift weighting toward harder types
const buildQuestionSequence = (isAssessment = false) => {
  const receptive  = pickRandom(RECEPTIVE_TYPES,  isAssessment ? 2 : 3);
  const productive = pickRandom(PRODUCTIVE_TYPES, isAssessment ? 3 : 3);
  const expressive = pickRandom(EXPRESSIVE_TYPES, 1);

  // Slot order: Intro, E, E, M, E, M, M, H
  return [
    "intro",
    receptive[0],
    receptive[1] || receptive[0],
    productive[0],
    receptive[2] || receptive[0],
    productive[1] || productive[0],
    productive[2] || productive[0],
    expressive[0]
  ];
};

// ─── Age context helper ───────────────────────────────────────────────────────
const getAgeContext = (age) => {
  const a = parseInt(age, 10) || 25;
  if (a <= 12) return { group: "child",  contextName: "a child",          contextExample: "Tom has a red ball." };
  if (a <= 18) return { group: "teen",   contextName: "a teenager",        contextExample: "Sara reads her school textbook." };
  if (a <= 59) return { group: "adult",  contextName: "an adult",          contextExample: "Ravi needs to submit a bank form." };
  return       { group: "senior", contextName: "a senior citizen", contextExample: "Lakshmi visits the hospital for a check-up." };
};

// ─── Prompt builder ───────────────────────────────────────────────────────────
const buildPrompt = (params) => {
  const {
    age, educationLevel, language, learningLanguage: paramLearningLang,
    interfaceLanguage: paramInterfaceLang, literacyLevel, literacyLevelName,
    weakAreas, sectionNum, sectionTitle, unitNum, unitTitle,
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
6. For "unscramble": "tiles" must be the individual letters of "answer" shuffled into a random order, written in the ${learningLanguage} script. The letters must NOT be adjacent in a way that spells the answer or starts with it.
7. For "imageChoice": provide exactly 3 emoji options where "correctIndex" points to the emoji that matches "word".
8. For "tracing": provide a short letter/word (3-4 characters max) to practice writing in ${learningLanguage}, a short "info" fact in ${interfaceLanguage}, and the "sound" text in ${learningLanguage}.
9. For "translationTask" and "arrangeWords": Shuffled tiles MUST NOT be able to form any other grammatically correct sentence other than the correct one.

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
  "guidedPractice": "string (step-by-step guided exercise description in ${interfaceLanguage})",
  "mcqs": [
    {"question": "string", "options": ["A", "B", "C", "D"], "correctIndex": 0, "explanation": "string"}
  ],
  "fillBlanks": [
    {"sentence": "string with ___ for blank in ${learningLanguage}", "answer": "string in ${learningLanguage}", "hint": "string in ${interfaceLanguage}", "options": ["correct_answer", "distractor 1", "distractor 2", "distractor 3"]}
  ],
  "readingPassage": "string (short reading text of 3-5 sentences in ${learningLanguage})",
  "readingQuestion": "string (one comprehension question about the passage in ${interfaceLanguage})",
  "readingAnswer": "string (correct answer in ${learningLanguage})",
  "speakSentence": "string (a full sentence in ${learningLanguage} for the user to practice speaking)",
  "speakSentenceEmoji": "string (a single emoji representing the speak sentence topic)",
  "meaningQuestion": {
    "phrase": "string (a simple common target language word in ${learningLanguage})",
    "options": ["correct meaning as a short sentence in ${interfaceLanguage}", "incorrect meaning sentence distractor 1", "incorrect meaning sentence distractor 2", "incorrect meaning sentence distractor 3"],
    "correctIndex": 0
  },
  "translationTask": {
    "sentence": "string (a sentence in ${learningLanguage})",
    "prompt": "string (a short instruction telling the learner to arrange the word tiles into a sentence, e.g. 'Arrange the words to form a sentence'. DO NOT reveal the answer or the exact sentence in the prompt)",
    "englishTranslation": "string (correct English translation)",
    "tiles": ["array of 6-8 English words containing all words from englishTranslation plus 2-3 distractor words, in any shuffled (non sentence) order. Shuffled tiles MUST NOT form any other meaningful sentence."]
  },
  "matchingPairs": [
    {"left": "a ${learningLanguage} word 1", "right": "its simple meaning/translation 1 in ${interfaceLanguage}"},
    {"left": "a ${learningLanguage} word 2", "right": "its simple meaning/translation 2 in ${interfaceLanguage}"},
    {"left": "a ${learningLanguage} word 3", "right": "its simple meaning/translation 3 in ${interfaceLanguage}"},
    {"left": "a ${learningLanguage} word 4", "right": "its simple meaning/translation 4 in ${interfaceLanguage}"}
  ],
  "listeningTask": {
    "audioText": "string (a simple sentence or phrase in ${learningLanguage} for the user to listen to)",
    "tiles": ["array of 6-8 words in ${learningLanguage} containing all words from audioText plus 2-3 distractor words"]
  },
  "unscramble": [
    {"hint": "string (a clue in ${interfaceLanguage})", "emoji": "string (a single emoji hint)", "answer": "WORD_IN_TARGET_LANG", "tiles": ["array of letter tiles for word in any shuffled order"]}
  ],
  "imageChoice": [
    {"word": "string (the target word in ${learningLanguage})", "prompt": "string (instruction in ${interfaceLanguage})", "options": ["emoji1","emoji2","emoji3"], "correctIndex": 0}
  ],
  "tracing": [
    {"kind": "target short word/letter in ${learningLanguage} (3-4 characters max)", "question": "string (a simple question/prompt in ${interfaceLanguage})", "sound": "pronunciation text in ${learningLanguage}"}
  ],
  "listenWordMCQ": {
    "audioText": "string (a single target word in ${learningLanguage})",
    "question": "string (question in ${interfaceLanguage}, e.g. 'Which word did you hear?')",
    "options": ["correct target word in ${learningLanguage}", "distractor 1", "distractor 2", "distractor 3"],
    "correctIndex": 0
  },
  "listenPassageMCQ": {
    "audioText": "string (2-3 simple sentences in ${learningLanguage})",
    "question": "string (question in ${interfaceLanguage} about the passage)",
    "options": ["correct option in ${learningLanguage}", "distractor 1", "distractor 2", "distractor 3"],
    "correctIndex": 0
  },
  "chatComplete": {
    "scenario": "string (a short chat dialogue snippet in ${learningLanguage} showing a previous speaker's message and a missing response represented by B: ___, e.g. 'A: Hello! How are you?\nB: ___')",
    "question": "string (prompt in ${interfaceLanguage}, e.g. 'Complete the conversation:')",
    "options": ["correct response in ${learningLanguage}", "wrong option 1", "wrong option 2", "wrong option 3"],
    "correctIndex": 0
  },
  "scenario": {
    "scenario": "string (a short real-world scenario description in ${learningLanguage})",
    "question": "string (question/prompt in ${interfaceLanguage})",
    "options": ["correct action in ${learningLanguage}", "wrong option 1", "wrong option 2", "wrong option 3"],
    "correctIndex": 0
  },
  "aiFeedbackPositive": "string (encouraging message for correct answers in ${interfaceLanguage})",
  "aiFeedbackNegative": "string (gentle corrective message in ${interfaceLanguage})"
}`;
};

// Cache lesson content by lesson ID to avoid re-fetching
const lessonCache = new Map();

const convertToUnifiedQuestions = (lesson, params) => {
  const questions = [];

  // 1. Intro step
  questions.push({
    type: "intro",
    lessonTitle: lesson.lessonTitle || params.lessonTitle || "Literacy Lesson",
    subtitle: lesson.lessonSubtitle || `Section ${params.sectionNum || 1} › Unit ${params.unitNum || 1}`,
    explanation: lesson.explanation || "",
    guidedTip: lesson.guidedPractice || ""
  });

  // 2. MCQ 1 (Exactly 1)
  if (Array.isArray(lesson.mcqs) && lesson.mcqs.length > 0) {
    const q = lesson.mcqs[0];
    questions.push({
      type: "mcq",
      question: q.question,
      options: q.options,
      correctIndex: q.correctIndex,
      explanation: q.explanation
    });
  }

  // 3. Fill in the Blank (Exactly 1)
  if (Array.isArray(lesson.fillBlanks) && lesson.fillBlanks.length > 0) {
    const fb = lesson.fillBlanks[0];
    questions.push({
      type: "fillBlank",
      sentence: fb.sentence,
      answer: fb.answer,
      hint: fb.hint,
      options: fb.options || [fb.answer, "option2", "option3", "option4"]
    });
  }

  // 4. Translate to Learning Language (Exactly 1) - Replaces spelling!
  if (lesson.writeThisTask) {
    questions.push({
      type: "translateToLearning",
      englishSentence: lesson.writeThisTask.englishTranslation,
      targetSentence: lesson.writeThisTask.sentence,
      tiles: lesson.writeThisTask.targetTiles
    });
  } else if (lesson.translationTask) {
    const targetWordList = (lesson.translationTask.sentence || "").split(/\s+/).filter(Boolean);
    const targetTiles = [
      ...targetWordList,
      "चाय", "केला", "ಹಣ್ಣು", "ನೀರು", "apple", "car"
    ];
    questions.push({
      type: "translateToLearning",
      englishSentence: "She reads a book",
      targetSentence: "She reads a book",
      tiles: targetTiles
    });
  }

  // 5. Reading Passage (Exactly 1)
  if (lesson.readingPassage) {
    questions.push({
      type: "passage",
      passage: lesson.readingPassage,
      question: lesson.readingQuestion || "Read the passage above.",
      options: lesson.readingOptions || [lesson.readingAnswer || "Yes", "No", "Maybe", "Not sure"],
      correctIndex: 0
    });
  }

  // 6. Speak Sentence (Exactly 1)
  if (lesson.speakSentence) {
    questions.push({
      type: "speak",
      sentence: lesson.speakSentence,
      emoji: lesson.speakSentenceEmoji || "🗣️"
    });
  }

  // 7. Meaning Question (Exactly 1)
  if (lesson.meaningQuestion) {
    questions.push({
      type: "meaning",
      phrase: lesson.meaningQuestion.phrase,
      options: lesson.meaningQuestion.options,
      correctIndex: lesson.meaningQuestion.correctIndex
    });
  }

  // 8. Translation Task (Exactly 1) - Target -> English
  if (lesson.translationTask) {
    questions.push({
      type: "translationTask",
      sentence: lesson.translationTask.sentence,
      prompt: lesson.translationTask.prompt,
      englishTranslation: lesson.translationTask.englishTranslation,
      tiles: lesson.translationTask.tiles
    });
  }

  // 9. MCQ 2 (Exactly 1) - Replaces the duplicate arrangeWords!
  if (Array.isArray(lesson.mcqs) && lesson.mcqs.length > 1) {
    const q = lesson.mcqs[1];
    questions.push({
      type: "mcq",
      question: q.question,
      options: q.options,
      correctIndex: q.correctIndex,
      explanation: q.explanation
    });
  } else {
    questions.push({
      type: "mcq",
      question: "Which of the following is an action verb?",
      options: ["run", "quickly", "beautiful", "book"],
      correctIndex: 0,
      explanation: "'Run' represents an action."
    });
  }

  // 10. Matching Pairs (Exactly 1)
  if (Array.isArray(lesson.matchingPairs) && lesson.matchingPairs.length > 0) {
    questions.push({
      type: "matchingPairs",
      pairs: lesson.matchingPairs
    });
  }

  // 11. Listening Task (Exactly 1)
  if (lesson.listeningTask) {
    questions.push({
      type: "listeningTask",
      audioText: lesson.listeningTask.audioText,
      tiles: lesson.listeningTask.tiles
    });
  }

  // 12. Unscramble (Exactly 1)
  if (Array.isArray(lesson.unscramble) && lesson.unscramble.length > 0) {
    const u = lesson.unscramble[0];
    questions.push({
      type: "unscramble",
      hint: u.hint,
      emoji: u.emoji,
      answer: u.answer,
      tiles: u.tiles
    });
  }

  // 13. Image Choice (Exactly 1)
  if (Array.isArray(lesson.imageChoice) && lesson.imageChoice.length > 0) {
    const ic = lesson.imageChoice[0];
    questions.push({
      type: "imageChoice",
      word: ic.word,
      prompt: ic.prompt,
      options: ic.options,
      correctIndex: ic.correctIndex
    });
  }

  // 14. Tracing (Exactly 1)
  if (Array.isArray(lesson.tracing) && lesson.tracing.length > 0) {
    const t = lesson.tracing[0];
    questions.push({
      type: "tracing",
      kind: t.kind,
      letter: t.kind,
      word: t.kind,
      question: t.question,
      sound: t.sound
    });
  }

  // 15. listenWordMCQ (Exactly 1)
  if (lesson.listenWordMCQ) {
    questions.push({
      type: "listenWordMCQ",
      audioText: lesson.listenWordMCQ.audioText,
      question: lesson.listenWordMCQ.question,
      options: lesson.listenWordMCQ.options,
      correctIndex: lesson.listenWordMCQ.correctIndex
    });
  }

  // 16. listenPassageMCQ (Exactly 1)
  if (lesson.listenPassageMCQ) {
    questions.push({
      type: "listenPassageMCQ",
      audioText: lesson.listenPassageMCQ.audioText,
      question: lesson.listenPassageMCQ.question,
      options: lesson.listenPassageMCQ.options,
      correctIndex: lesson.listenPassageMCQ.correctIndex
    });
  }

  // 17. chatComplete (Exactly 1)
  if (lesson.chatComplete) {
    questions.push({
      type: "chatComplete",
      scenario: lesson.chatComplete.scenario,
      question: lesson.chatComplete.question,
      options: lesson.chatComplete.options,
      correctIndex: lesson.chatComplete.correctIndex
    });
  }

  // 18. scenario (Exactly 1)
  if (lesson.scenario) {
    questions.push({
      type: "scenario",
      scenario: lesson.scenario.scenario,
      question: lesson.scenario.question,
      options: lesson.scenario.options,
      correctIndex: lesson.scenario.correctIndex
    });
  }

  // Randomize questions: 8 questions (1 intro + 7 exercises) for normal lessons, 12 questions (1 intro + 11 exercises) for final 5th lesson
  const allQuestions = [...questions];
  const introQuestion = allQuestions.shift(); // Keep intro step at index 0

  for (let i = allQuestions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allQuestions[i], allQuestions[j]] = [allQuestions[j], allQuestions[i]];
  }

  const lessonNum = parseInt(params.lessonNum) || 1;
  const isFinal = lessonNum === 5;
  const targetCount = isFinal ? 11 : 7;
  const selectedExercises = allQuestions.slice(0, targetCount);

  return {
    ...lesson,
    questions: [introQuestion, ...selectedExercises]
  };
};

export const generateLessonContent = async (params) => {
  const cacheKey = `lesson_${params.sectionNum}_${params.unitNum}_${params.lessonNum}_${params.learningLanguage || params.language}_${params.literacyLevel}`;

  if (params.useFallback) {
    return convertToUnifiedQuestions(getFallbackLesson(params), params);
  }

  if (lessonCache.has(cacheKey)) {
    return lessonCache.get(cacheKey);
  }

  const prompt = buildPrompt(params);

  try {
    const text = await fetchAI(prompt, 4096);
    if (!text) throw new Error("Empty AI response");
    const lesson = extractJSON(text);
    const unifiedLesson = convertToUnifiedQuestions(lesson, params);
    lessonCache.set(cacheKey, unifiedLesson);
    return unifiedLesson;
  } catch (err) {
    console.error("Failed to generate lesson content:", err);
    return convertToUnifiedQuestions(getFallbackLesson(params), params);
  }
};


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


const getFallbackLesson = (params) => {
  const { language, sectionTitle, unitTitle, lessonTitle } = params;

  if (language === "Hindi") {
    return {
      lessonTitle: lessonTitle || "साक्षरता पाठ",
      skillFocus: sectionTitle || "पढ़ना और लिखना",
      explanation: `यह पाठ ${unitTitle || "बुनियादी बातें"} के बारे में है। इसमें आप बुनियादी साक्षरता कौशल सीखेंगे।`,
      examples: [
        { text: "राम एक अच्छा लड़का है।", translation: "Ram is a good boy." },
        { text: "वह स्कूल जाता है।", translation: "He goes to school." }
      ],
      mcqs: [
        { question: "इनमें से कौन सा एक संज्ञा (Noun) है?", options: ["दौड़ना", "सुंदर", "किताब", "धीरे-धीरे"], correctIndex: 2, explanation: "किताब एक वस्तु का नाम है, इसलिए यह संज्ञा है।" },
        { question: "वह स्कूल _____ है।", options: ["जाता", "जाती", "जाते", "जाना"], correctIndex: 0, explanation: "पुल्लिंग एकవచన్ కర్తతో 'जाता' का प्रयोग होता है।" }
      ],
      fillBlanks: [
        { sentence: "लड़का मैदान में ___ खेल रहा है।", answer: "फ़ुटबॉल", hint: "एक गोल आकार की गेंद वाला खेल", options: ["फ़ुटबॉल", "पानी", "किताब", "बिल्ली"] }
      ],
      readingPassage: "राम सात साल का लड़का है। वह हर सुबह स्कूल जाता है। स्कूल में, राम को किताबें पढ़ना और अपनी कक्षा में सीखना बहुत पसंद है। उसके शिक्षक बहुत दयालु हैं।",
      readingQuestion: "राम हर सुबह कहाँ जाता है?",
      readingAnswer: "स्कूल",
      readingOptions: ["स्कूल", "पार्क", "दुकान", "बाजार"],
      speakSentence: "नई भाषा सीखना बहुत मजेदार है।",
      speakSentenceEmoji: "🗣️",
      meaningQuestion: {
        phrase: "खुश",
        options: ["अच्छा और प्रसन्न महसूस करना", "उदास होना", "थका हुआ होना", "भूखा होना"],
        correctIndex: 0
      },
      writeThisTask: {
        sentence: "वह किताब पढ़ती है",
        englishTranslation: "She reads a book",
        targetTiles: ["वह", "किताब", "पढ़ती", "है", "लड़का", "पानी", "सेब"]
      },
      translationTask: {
        sentence: "बच्चा खुश है",
        prompt: "एक वाक्य बनाने के लिए शब्दों को व्यवस्थित करें।",
        englishTranslation: "The child is happy",
        tiles: ["The", "child", "is", "happy", "banana", "black", "water"],
        targetTiles: ["वह", "किताब", "पढ़ती", "है", "लड़का", "पानी", "सेब"]
      },
      matchingPairs: [
        { left: "स्कूल", right: "वह स्थान जहाँ हम सीखते हैं" },
        { left: "किताब", right: "हम इसे ज्ञान के लिए पढ़ते हैं" },
        { left: "लड़का", right: "एक युवा पुरुष बच्चा" },
        { left: "पानी", right: "एक साफ तरल जिसे हम पीते हैं" }
      ],
      listeningTask: {
        audioText: "वह स्कूल जा रहा है",
        tiles: ["वह", "स्कूल", "जा", "रहा", "है", "घर", "खा", "रही"]
      },
      unscramble: [
        { hint: "एक लाल फल", emoji: "🍎", answer: "सेब", tiles: ["से", "ब", "के", "ला"] }
      ],
      imageChoice: [
        { word: "गाड़ी", prompt: "गाड़ी वाले चित्र पर टैप करें", options: ["🚗", "🏫", "🍎"], correctIndex: 0 }
      ],
      tracing: [
        { kind: "घर", question: "घर शब्द को ट्रेस करें", sound: "घर" }
      ],
      listenWordMCQ: {
        audioText: "स्कूल",
        question: "आपने कौन सा शब्द सुना?",
        options: ["स्कूल", "घर", "पानी", "फल"],
        correctIndex: 0
      },
      listenPassageMCQ: {
        audioText: "राम सात साल का लड़का है। वह हर सुबह स्कूल जाता है। स्कूल में, राम को किताबें पढ़ना और अपनी कक्षा में नई चीजें सीखना बहुत पसंद है।",
        question: "राम स्कूल में क्या करना पसंद करता है?",
        options: ["पढ़ना और सीखना", "खेलना", "सोना", "खाना"],
        correctIndex: 0
      },
      chatComplete: {
        scenario: "Anna: नमस्ते! आप कैसे हैं?\nYou: ___",
        question: "बातचीत पूरी करने के लिए सही प्रतिक्रिया चुनें",
        options: ["मैं ठीक हूँ, धन्यवाद।", "शुभ रात्रि।", "नमस्ते।", "अलविदा।"],
        correctIndex: 0
      },
      scenario: {
        scenario: "आप एक स्थानीय दुकान पर एक किताब खरीद रहे हैं। दुकानदार मुस्कुराता है और आपको किताब देता है।",
        question: "आपको दुकानदार से क्या कहना चाहिए?",
        options: ["धन्यवाद।", "माफ़ कीजिए।", "क्षमा करें।", "स्वागत है।"],
        correctIndex: 0
      },
      aiFeedbackPositive: "अद्भुत काम! आप बहुत अच्छी प्रगति कर रहे हैं।",
      aiFeedbackNegative: "अच्छा प्रयास! पाठ की समीक्षा करें और पुनः प्रयास करें।"
    };
  }

  if (language === "Kannada") {
    return {
      lessonTitle: lessonTitle || "ಸಾಕ್ಷರತಾ ಪಾಠ",
      skillFocus: sectionTitle || "ಓದುವುದು ಮತ್ತು ಬರೆಯುವುದು",
      explanation: `ಈ ಪಾಠವು ${unitTitle || "ಮೂಲಭೂತ ಸಂಗತಿಗಳು"} ಬಗ್ಗೆ ಇದೆ. ಇಲ್ಲಿ ನೀವು ಮೂಲ ಸಾಕ್ಷರತಾ ಕೌಶಲ್ಯಗಳನ್ನು ಕಲಿಯುವಿರಿ.`,
      examples: [
        { text: "ರಾಮ್ ಒಳ್ಳೆಯ ಹುಡುಗ.", translation: "Ram is a good boy." },
        { text: "ಅವನು ಶಾಲೆಗೆ ಹೋಗುತ್ತಾನೆ.", translation: "He goes to school." }
      ],
      mcqs: [
        { question: "ಇವುಗಳಲ್ಲಿ ಯಾವುದು ನಾಮಪದ (Noun)?", options: ["ಓಡು", "ಸುಂದರ", "ಪುಸ್ತಕ", "ಮೆಲ್ಲನೆ"], correctIndex: 2, explanation: "ಪುಸ್ತಕ ಒಂದು ವಸ್ತುವಿನ ಹೆಸರು, ಆದ್ದರಿಂದ ಇದು ನಾಮಪದ." },
        { question: "ಅವನು ಶಾಲೆಗೆ _____.", options: ["ಹೋಗುತ್ತಾನೆ", "ಹೋಗುತ್ತಾಳೆ", "ಹೋಗುತ್ತಾರೆ", "ಹೋಗು"], correctIndex: 0, explanation: "ಪುಲ್ಲಿಂಗ ಏಕವಚನ ಕರ್ತೃವಿನೊಂದಿಗೆ 'ಹೋಗುತ್ತಾನೆ' ಬಳಸಲಾಗುತ್ತದೆ." }
      ],
      fillBlanks: [
        { sentence: "ಹುಡುಗನು ಮೈದಾನದಲ್ಲಿ ___ ಆಡುತ್ತಿದ್ದಾನೆ.", answer: "ಫುಟ್ಬಾಲ್", hint: "ಚೆಂಡಿನ ಆಟ", options: ["ಫುಟ್ಬಾಲ್", "ನೀರು", "ಪುಸ್ತಕ", "ಬೆಕ್ಕು"] }
      ],
      readingPassage: "ರಾಮ್ ಏಳು ವರ್ಷದ ಹುಡುಗ. ಅವನು ಪ್ರತಿದಿನ ಬೆಳಿಗ್ಗೆ ಶಾಲೆಗೆ ಹೋಗುತ್ತಾನೆ. ಶಾಲೆಯಲ್ಲಿ, ರಾಮ್ ಪುಸ್ತಕಗಳನ್ನು ಓದುವುದನ್ನು ಮತ್ತು ತನ್ನ ತರಗತಿಯಲ್ಲಿ ಕಲಿಯುವುದನ್ನು ಇಷ್ಟಪಡುತ್ತಾನೆ.",
      readingQuestion: "ರಾಮ್ ಪ್ರತಿದಿನ ಬೆಳಿಗ್ಗೆ ಎಲ್ಲಿಗೆ ಹೋಗುತ್ತಾನೆ?",
      readingAnswer: "ಶಾಲೆಗೆ",
      readingOptions: ["ಶಾಲೆಗೆ", "ಉದ್ಯಾನವನಕ್ಕೆ", "ಅಂಗಡಿಗೆ", "ಮಾರುಕಟ್ಟೆಗೆ"],
      speakSentence: "ಹೊಸ ಭಾಷೆಯನ್ನು ಕಲಿಯುವುದು ತುಂಬಾ ತಮಾಷೆಯಾಗಿದೆ.",
      speakSentenceEmoji: "🗣️",
      meaningQuestion: {
        phrase: "ಸಂತೋಷ",
        options: ["ಉತ್ತಮ ಮತ್ತು ಪ್ರಸನ್ನವಾಗಿರುವುದು", "ದುಃಖವಾಗಿರುವುದು", "ಸುಸ್ತಾಗಿರುವುದು", "ಹಸಿದಿರುವುದು"],
        correctIndex: 0
      },
      writeThisTask: {
        sentence: "ಅವಳು ಪುಸ್ತಕ ಓದುತ್ತಾಳೆ",
        englishTranslation: "She reads a book",
        targetTiles: ["ಅವಳು", "ಪುಸ್ತಕ", "ಓದುತ್ತಾಳೆ", "ಹುಡುಗ", "ನೀರು", "ಸೇಬು"]
      },
      translationTask: {
        sentence: "ಮಗು ಸಂತೋಷವಾಗಿದೆ",
        prompt: "ಒಂದು ವಾಕ್ಯವನ್ನು ರೂಪಿಸಲು ಪದಗಳನ್ನು ಜೋಡಿಸಿ.",
        englishTranslation: "The child is happy",
        tiles: ["The", "child", "is", "happy", "banana", "black", "water"],
        targetTiles: ["ಅವಳು", "ಪುಸ್ತಕ", "ಓದುತ್ತಾಳೆ", "ಹುಡುಗ", "ನೀರು", "ಸೇಬು"]
      },
      matchingPairs: [
        { left: "ಶಾಲೆ", right: "ನಾವು ಕಲಿಯುವ ಸ್ಥಳ" },
        { left: "ಪುಸ್ತಕ", right: "ನಾವು ಜ್ಞಾನಕ್ಕಾಗಿ ಓದುತ್ತೇವೆ" },
        { left: "ಹುಡುಗ", right: "ಕಿರಿಯ ಗಂಡು ಮಗು" },
        { left: "ನೀರು", right: "ನಾವು ಕುಡಿಯುವ ದ್ರವ" }
      ],
      listeningTask: {
        audioText: "ಅವನು ಶಾಲೆಗೆ ಹೋಗುತ್ತಿದ್ದಾನೆ",
        tiles: ["ಅವನು", "ಶಾಲೆಗೆ", "ಹೋಗುತ್ತಿದ್ದಾನೆ", "ಮನೆಗೆ", "ಬರುತ್ತಿದ್ದಾನೆ", "ನೀರು"]
      },
      unscramble: [
        { hint: "ಒಂದು ಕೆಂಪು ಹಣ್ಣು", emoji: "🍎", answer: "ಸೇಬು", tiles: ["ಸೇ", "ಬು", "ಬಾ", "ಳೆ"] }
      ],
      imageChoice: [
        { word: "ಕಾರು", prompt: "ಕಾರು ಇರುವ ಚಿತ್ರವನ್ನು ಟ್ಯಾಪ್ ಮಾಡಿ", options: ["🚗", "🏫", "🍎"], correctIndex: 0 }
      ],
      tracing: [
        { kind: "ಮನೆ", question: "ಮನೆ ಪದವನ್ನು ಬರೆಯಿರಿ", sound: "ಮನೆ" }
      ],
      listenWordMCQ: {
        audioText: "ಶಾಲೆ",
        question: "ನೀವು ಯಾವ ಪದವನ್ನು ಕೇಳಿದ್ದೀರಿ?",
        options: ["ಶಾಲೆ", "ಮನೆ", "ನೀರು", "ಹಣ್ಣು"],
        correctIndex: 0
      },
      listenPassageMCQ: {
        audioText: "ರಾಮ್ ಏಳು ವರ್ಷದ ಹುಡುಗ. ಅವನು ಪ್ರತಿದಿನ ಬೆಳಿಗ್ಗೆ ಶಾಲೆಗೆ ಹೋಗುತ್ತಾನೆ. ಶಾಲೆಯಲ್ಲಿ, ರಾಮ್ ಪುಸ್ತಕಗಳನ್ನು ಓದುವುದನ್ನು ಮತ್ತು ಕಲಿಯುವುದನ್ನು ಇಷ್ಟಪಡುತ್ತಾನೆ.",
        question: "ರಾಮ್ ಶಾಲೆಯಲ್ಲಿ ಏನು ಮಾಡಲು ಇಷ್ಟಪಡುತ್ತಾನೆ?",
        options: ["ಓದುವುದು ಮತ್ತು ಕಲಿಯುವುದು", "ಆಟವಾಡುವುದು", "ಮಲಗುವುದು", "ಊಟ ಮಾಡುವುದು"],
        correctIndex: 0
      },
      chatComplete: {
        scenario: "Anna: ನಮಸ್ತೆ! ಹೇಗಿದ್ದೀರಾ?\nYou: ___",
        question: "ಸಂಭಾಷಣೆಯನ್ನು ಪೂರ್ಣಗೊಳಿಸಲು ಸರಿಯಾದ ಉತ್ತರವನ್ನು ಆರಿಸಿ",
        options: ["ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ, ಧನ್ಯವಾದಗಳು.", "ಶುಭ ರಾತ್ರಿ.", "ನಮಸ್ಕಾರ.", "ಹೋಗಿ ಬರುತ್ತೇನೆ."],
        correctIndex: 0
      },
      scenario: {
        scenario: "ನೀವು ಸ್ಥಳೀಯ ಅಂಗಡಿಯೊಂದರಲ್ಲಿ ಪುಸ್ತಕವನ್ನು ಖರೀದಿಸುತ್ತಿದ್ದೀರಿ. ಅಂಗಡಿಯವನು ಮುಗುಳ್ನಕ್ಕು ನಿಮಗೆ ಪುಸ್ತಕವನ್ನು ನೀಡುತ್ತಾನೆ.",
        question: "ನೀವು ಅಂಗಡಿಯವನಿಗೆ ಏನು ಹೇಳಬೇಕು?",
        options: ["ಧನ್ಯವಾದಗಳು.", "ಕ್ಷಮಿಸಿ.", "ದಾರಿ ಬಿಡಿ.", "ಸ್ವಾಗತ."],
        correctIndex: 0
      },
      aiFeedbackPositive: "ಅತ್ಯುತ್ತಮ ಕೆಲಸ! ನೀವು ಉತ್ತಮ ಪ್ರಗತಿಯನ್ನು ಸಾಧಿಸುತ್ತಿದ್ದೀರಿ.",
      aiFeedbackNegative: "ಉತ್ತಮ ಪ್ರಯತ್ನ! ಪಾಠವನ್ನು ಪುನರಾವರ್ತಿಸಿ ಮತ್ತು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ."
    };
  }

  if (language === "Telugu") {
    return {
      lessonTitle: lessonTitle || "అక్షరాస్యత పాఠం",
      skillFocus: sectionTitle || "చదవడం మరియు రాయడం",
      explanation: `ఈ పాఠం ${unitTitle || "ప్రతిపాదనలు"} గురించి. ఇందులో మీరు ప్రాథమిక అక్షరాస్యత నైపుణ్యాలను నేర్చుకుంటారు.`,
      examples: [
        { text: "రామ్ ఒక మంచి బాలుడు.", translation: "Ram is a good boy." },
        { text: "అతడు బడికి వెళతాడు.", translation: "He goes to school." }
      ],
      mcqs: [
        { question: "వీటిలో నామవాచకం (Noun) ఏది?", options: ["పరుగెత్తు", "అందమైన", "పుస్తకం", "మెల్లగా"], correctIndex: 2, explanation: "పుస్తకం ఒక వస్తువు పేరు కాబట్టి అది నామవాచకం." },
        { question: "అతడు బడికి _____.", options: ["వెళతాడు", "వెళుతుంది", "వెళతారు", "వెళ్ళు"], correctIndex: 0, explanation: "పురుష ఏకవచన కర్తతో 'వెళతాడు' ఉపయోగించబడుతుంది." }
      ],
      fillBlanks: [
        { sentence: "అబ్బాయి మైదానంలో ___ ఆడుతున్నాడు.", answer: "ఫుట్‌బాల్", hint: "బంతితో ఆడే ఆట", options: ["ఫుట్‌బాల్", "నీరు", "పుస్తకం", "పిల్లి"] }
      ],
      readingPassage: "రామ్ ఏడేళ్ల అబ్బాయి. అతడు ప్రతిరోజూ ఉదయం బడికి వెళతాడు. బడిలో రామ్ పుస్తకాలు చదవడం మరియు కొత్త విషయాలు నేర్చుకోవడం ఇష్టపడతాడు.",
      readingQuestion: "రామ్ ప్రతిరోజూ ఉదయం ఎక్కడికి వెళతాడు?",
      readingAnswer: "బడికి",
      readingOptions: ["ఆసుపత్రికి", "పార్కుకు", "దుకాణానికి", "బడికి"],
      speakSentence: "కొత్త భాష నేర్చుకోవడం చాలా సరదాగా ఉంటుంది.",
      speakSentenceEmoji: "🗣️",
      meaningQuestion: {
        phrase: "సంతోషం",
        options: ["బాగుండడం మరియు ఆనందంగా ఉండడం", "బాధపడడం", "అలసిపోవడం", "ఆకలి వేయడం"],
        correctIndex: 0
      },
      writeThisTask: {
        sentence: "ఆమె పుస్తకం చదువుతుంది",
        englishTranslation: "She reads a book",
        targetTiles: ["ఆమె", "పుస్తకం", "చదువుతుంది", "బాలుడు", "నీరు", "ఆపిల్"]
      },
      translationTask: {
        sentence: "పాప సంతోషంగా ఉంది",
        prompt: "ఒక వాక్యాన్ని రూపొందించడానికి పదాలను అమర్చండి.",
        englishTranslation: "The child is happy",
        tiles: ["The", "child", "is", "happy", "banana", "black", "water"],
        targetTiles: ["ఆమె", "పుస్తకం", "చదువుతుంది", "బాలుడు", "నీరు", "ఆపిల్"]
      },
      matchingPairs: [
        { left: "బడి", right: "మనం నేర్చుకునే స్థలం" },
        { left: "పుస్తకం", right: "మనం జ్ఞానం కోసం చదువుతాము" },
        { left: "బాలుడు", right: "ఒక చిన్న మగ పిల్లాడు" },
        { left: "నీరు", right: "మనం త్రాగే ద్రవం" }
      ],
      listeningTask: {
        audioText: "అతడు బడికి వెళుతున్నాడు",
        tiles: ["అతడు", "బడికి", "వెళుతున్నాడు", "ఇంటికి", "వస్తున్నాడు", "నీరు"]
      },
      unscramble: [
        { hint: "ఒక ఎరుపు పండు", emoji: "🍎", answer: "ఆపిల్", tiles: ["ఆ", "పి", "ల్", "న", "ర"] }
      ],
      imageChoice: [
        { word: "కారు", prompt: "కారు ఉన్న చిత్రాన్ని నొక్కండి", options: ["🚗", "🏫", "🍎"], correctIndex: 0 }
      ],
      tracing: [
        { kind: "ఇల్లు", question: "ఇల్లు పదాన్ని రాయండి", sound: "ఇల్లు" }
      ],
      listenWordMCQ: {
        audioText: "బడి",
        question: "మీరు ఏ పదాన్ని విన్నారు?",
        options: ["బడి", "ఇల్లు", "నీరు", "పండు"],
        correctIndex: 0
      },
      listenPassageMCQ: {
        audioText: "రామ్ ఏడేళ్ల అబ్బాయి. అతడు ప్రతిరోజూ ఉదయం బడికి వెళతాడు. బడిలో రామ్ పుస్తకాలు చదవడం మరియు కొత్త విషయాలు నేర్చుకోవడం ఇష్టపడతాడు.",
        question: "రామ్ బడిలో ఏమి చేయడానికి ఇష్టపడతాడు?",
        options: ["చదవడం మరియు నేర్చుకోవడం", "ఆడుకోవడం", "నిద్రపోవడం", "తినడం"],
        correctIndex: 0
      },
      chatComplete: {
        scenario: "Anna: నమస్తే! ఎలా ఉన్నారు?\nYou: ___",
        question: "సంభాషణను పూర్తి చేయడానికి సరైన సమాధానాన్ని ఎంచుకోండి",
        options: ["నేను బాగున్నాను, ధన్యవాదాలు.", "శుభ రాత్రి.", "నమస్కారం.", "వెళ్ళివస్తాను."],
        correctIndex: 0
      },
      scenario: {
        scenario: "మీరు ఒక స్థానిక దుకాణంలో పుస్తకాన్ని కొనుగోలు చేస్తున్నారు. దుకాణదారుడు చిరునవ్వుతో మీకు పుస్తకాన్ని ఇస్తాడు.",
        question: "మీరు దుకాణదారునికి ఏమి చెప్పాలి?",
        options: ["ధన్యవాదాలు.", "క్షమించండి.", "తప్పుకోండి.", "స్వాగతం."],
        correctIndex: 0
      },
      aiFeedbackPositive: "చాలా మంచి పని! మీరు మంచి పురోగతి సాధిస్తున్నారు.",
      aiFeedbackNegative: "మంచి ప్రయత్నం! పాఠాన్ని సమీక్షించి మళ్లీ ప్రయత్నించండి."
    };
  }

  if (language === "Tamil") {
    return {
      lessonTitle: lessonTitle || "எழுத்தறிவு பாடம்",
      skillFocus: sectionTitle || "படித்தல் மற்றும் எழுதுதல்",
      explanation: `இந்தப் பாடம் ${unitTitle || "அடிப்படைகள்"} பற்றியது. இதில் நீங்கள் அடிப்படை எழுத்தறிவு திறன்களைக் கற்றுக்கொள்வீர்கள்.`,
      examples: [
        { text: "ராம் ஒரு நல்ல பையன்.", translation: "Ram is a good boy." },
        { text: "அvan பள்ளிக்குச் செல்கிறான்.", translation: "He goes to school." }
      ],
      mcqs: [
        { question: "இவற்றில் எது பெயர்ச்சொல் (Noun)?", options: ["ஓடு", "அழகான", "புத்தகம்", "மெதுவாக"], correctIndex: 2, explanation: "புத்தகம் என்பது ஒரு பொருளின் பெயர், எனவே இது பெயர்ச்சொல்." },
        { question: "அவன் பள்ளிக்கு _____.", options: ["செல்கிறான்", "செல்கிறாள்", "செல்கிறார்கள்", "செல்"], correctIndex: 0, explanation: "ஆண்பால் ஒருமை எழுவாயுடன் 'செல்கிறான்' பயன்படுத்தப்படுகிறது." }
      ],
      fillBlanks: [
        { sentence: "சிறுவன் மைதானத்தில் ___ விளையாடுகிறான்.", answer: "கால்பந்து", hint: "பந்து விளையாட்டு", options: ["கால்பந்து", "தண்ணீர்", "புத்தகம்", "பூனை"] }
      ],
      readingPassage: "ராம் ஏழு வயது சிறுவன். அவன் தினமும் காலையில் பள்ளிக்குச் செல்கிறான். பள்ளியில், ராம் புத்தகங்களைப் படிக்கவும் தனது வகுப்பறையில் கற்கவும் விரும்புகிறான்.",
      readingQuestion: "ராம் தினமும் காலையில் எங்கே செல்கிறான்?",
      readingAnswer: "பள்ளிக்கு",
      readingOptions: ["பள்ளிக்கு", "பூங்காவிற்கு", "கடைக்கு", "சந்தைக்கு"],
      speakSentence: "ஒரு புதிய மொழியைக் கற்றுக்கொள்வது மிகவும் வேடிக்கையானது.",
      speakSentenceEmoji: "🗣️",
      meaningQuestion: {
        phrase: "மகிழ்ச்சி",
        options: ["நல்ல மற்றும் மகிழ்ச்சியாக உணர்தல்", "சோகமாக இருத்தல்", "சோர்வாக இருத்தல்", "பசியாக இருத்தல்"],
        correctIndex: 0
      },
      writeThisTask: {
        sentence: "அவள் புத்தகம் படிக்கிறாள்",
        englishTranslation: "She reads a book",
        targetTiles: ["அவள்", "புத்தகம்", "படிக்கிறாள்", "பையன்", "தண்ணீர்", "ஆப்பிள்"]
      },
      translationTask: {
        sentence: "குழந்தை மகிழ்ச்சியாக இருக்கிறது",
        prompt: "ஒரு வாக்கியத்தை உருவாக்க வார்த்தைகளை ஒழுங்கமைக்கவும்.",
        englishTranslation: "The child is happy",
        tiles: ["The", "child", "is", "happy", "banana", "black", "water"],
        targetTiles: ["அவள்", "புத்தகம்", "படிக்கிறாள்", "பையன்", "தண்ணீர்", "ஆப்பிள்"]
      },
      matchingPairs: [
        { left: "பள்ளி", right: "நாம் கற்கும் இடம்" },
        { left: "புத்தகம்", right: "அறிவிற்காக நாம் அதைப் படிக்கிறோம்" },
        { left: "பையன்", right: "ஒரு சிறுவன்" },
        { left: "தண்ணீர்", right: "நாம் குடிக்கும் தெளிவான திரவம்" }
      ],
      listeningTask: {
        audioText: "அவன் பள்ளிக்கு நடந்து செல்கிறான்",
        tiles: ["அவன்", "பள்ளிக்கு", "நடந்து", "செல்கிறான்", "வீட்டிற்கு", "ஓடுகிறான்", "நீர்"]
      },
      unscramble: [
        { hint: "ஒரு சிவப்பு பழம்", emoji: "🍎", answer: "ஆப்பிள்", tiles: ["ஆப்", "பிள்", "மா", "து"] }
      ],
      imageChoice: [
        { word: "கார்", prompt: "கார் உள்ள படத்தை தட்டவும்", options: ["🚗", "🏫", "🍎"], correctIndex: 0 }
      ],
      tracing: [
        { kind: "வீடு", question: "வீடு வார்த்தையை எழுதுங்கள்", sound: "வீடு" }
      ],
      listenWordMCQ: {
        audioText: "பள்ளி",
        question: "நீங்கள் என்ன வார்த்தை கேட்டீர்கள்?",
        options: ["பள்ளி", "வீடு", "தண்ணீர்", "பழம்"],
        correctIndex: 0
      },
      listenPassageMCQ: {
        audioText: "ராம் ஏழு வயது சிறுவன். அவன் தினமும் காலையில் பள்ளிக்குச் செல்கிறான். பள்ளியில், ராம் புத்தகங்களைப் படிக்கவும் புதிய விஷயங்களைக் கற்றுக்கொள்ளவும் விரும்புகிறான்.",
        question: "ராம் பள்ளியில் என்ன செய்ய விரும்புகிறான்?",
        options: ["படித்தல் மற்றும் கற்றல்", "விளையாடுதல்", "தூங்குதல்", "உண்ணுதல்"],
        correctIndex: 0
      },
      chatComplete: {
        scenario: "Anna: வணக்கம்! எப்படி இருக்கிறீர்கள்?\nYou: ___",
        question: "உரையாடலை முடிக்க சரியான பதிலைத் தேர்ந்தெடுக்கவும்",
        options: ["நான் நலம், நன்றி.", "போய் வருகிறேன்.", "வணக்கம்.", "நன்றி."],
        correctIndex: 0
      },
      scenario: {
        scenario: "நீங்கள் ஒரு உள்ளூர் கடையில் புத்தகம் வாங்குகிறீர்கள். கடைக்காரர் புன்னகைத்து உங்களுக்கு புத்தகத்தை தருகிறார்.",
        question: "கடைக்காரரிடம் நீங்கள் என்ன சொல்ல வேண்டும்?",
        options: ["நன்றி.", "மன்னிக்கவும்.", "விலகுங்கள்.", "வரவேற்கிறோம்."],
        correctIndex: 0
      },
      aiFeedbackPositive: "சிறந்த வேலை! நீங்கள் நல்ல முன்னேற்றம் கண்டு வருகிறீர்கள்.",
      aiFeedbackNegative: "நல்ல முயற்சி! பாடத்தை மறுபரிசீலனை செய்து மீண்டும் முயற்சிக்கவும்."
    };
  }

  return {
    lessonTitle: lessonTitle || "Literacy Lesson",
    skillFocus: sectionTitle || "Reading & Writing",
    explanation: `This lesson covers ${unitTitle || "Basics"}. You will practice essential literacy skills related to ${sectionTitle || "Reading & Writing"}.`,
    examples: [
      { text: "Ram is a good boy.", translation: "" },
      { text: "He goes to school.", translation: "" }
    ],
    mcqs: [
      { question: "Which of the following is a noun?", options: ["run", "beautiful", "book", "quickly"], correctIndex: 2, explanation: "Book is a name of a thing, so it is a noun." },
      { question: "He _____ to school every day.", options: ["goes", "go", "going", "gone"], correctIndex: 0, explanation: "Singular subject takes 'goes' in present tense." }
    ],
    fillBlanks: [
      { sentence: "The boy is playing ___ in the field.", answer: "football", hint: "A game played with a round ball", options: ["football", "water", "book", "cat"] }
    ],
    readingPassage: "Ram is a seven-year-old boy. He goes to school every morning. At school, Ram loves to read books and learn new things in his classroom.",
    readingQuestion: "Where does Ram go every morning?",
    readingAnswer: "To school",
    readingOptions: ["To school", "To the park", "To the shop", "To the market"],
    speakSentence: "Learning a new language is very fun.",
    speakSentenceEmoji: "🗣️",
    meaningQuestion: {
      phrase: "Happy",
      options: ["Feeling good and cheerful", "Feeling sad and upset", "Feeling tired and sleepy", "Feeling hungry and thirsty"],
      correctIndex: 0
    },
    writeThisTask: {
      sentence: "She reads a book",
      englishTranslation: "She reads a book",
      targetTiles: ["She", "reads", "a", "book", "car", "apple", "water"]
    },
    translationTask: {
      sentence: "The child is happy",
      prompt: "Arrange the words to form a sentence.",
      englishTranslation: "The child is happy",
      tiles: ["The", "child", "is", "happy", "car", "apple", "water"],
      targetTiles: ["She", "reads", "a", "book", "car", "apple", "water"]
    },
    matchingPairs: [
      { left: "School", right: "A place where we learn" },
      { left: "Book", right: "We read it to gain knowledge" },
      { left: "Boy", right: "A young male child" },
      { left: "Water", right: "A clear liquid we drink" }
    ],
    listeningTask: {
      audioText: "He is walking to school",
      tiles: ["He", "is", "walking", "to", "school", "running", "car", "home"]
    },
    unscramble: [
      { hint: "A red fruit", emoji: "🍎", answer: "APPLE", tiles: ["A", "P", "P", "L", "E", "B", "A", "N"] }
    ],
    imageChoice: [
      { word: "car", prompt: "Tap the picture that means car", options: ["🚗", "🏫", "🍎"], correctIndex: 0 }
    ],
    tracing: [
      { kind: "sun", question: "Trace the word sun", sound: "sun" }
    ],
    listenWordMCQ: {
      audioText: "school",
      question: "Which word did you hear?",
      options: ["school", "home", "water", "fruit"],
      correctIndex: 0
    },
    listenPassageMCQ: {
      audioText: "Ram is a seven-year-old boy. He goes to school every morning. At school, Ram loves to read books and learn new things in his classroom.",
      question: "What does Ram love to do at school?",
      options: ["Read and Learn", "Play", "Sleep", "Eat"],
      correctIndex: 0
    },
    chatComplete: {
      scenario: "Anna: Hello! How are you?\nYou: ___",
      question: "Choose the correct response to complete the conversation",
      options: ["I am fine, thank you.", "Goodbye.", "Good night.", "See you."],
      correctIndex: 0
    },
    scenario: {
      scenario: "You are buying a book at a local store. The shopkeeper smiles and hands you the book.",
      question: "What should you say to the shopkeeper?",
      options: ["Thank you.", "Excuse me.", "Sorry.", "Welcome."],
      correctIndex: 0
    },
    aiFeedbackPositive: "Excellent work! You are making great progress.",
    aiFeedbackNegative: "Good try! Review the lesson and attempt again. You can do it!"
  };
};
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

    const text = await fetchAI(prompt, 256);
    if (!text) throw new Error("Failed to fetch from OpenRouter/Gemini API");
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
  const { practiceType, language, literacyLevel, literacyLevelName, mistakesList, interfaceLanguage } = params;
  const targetLang = language || "English";
  const uiLang = interfaceLanguage || "English";

  if (practiceType === "Perfect Pronunciation" || practiceType === "Speak Practice") {
    return `You are LISA, an expert AI literacy tutor. Generate exactly 10 speaking/pronunciation practice questions in ${targetLang} suitable for a learner at Literacy Level ${literacyLevel} (${literacyLevelName}).
The user's preferred interface language is ${uiLang}. Provide translation descriptions in ${uiLang}.
The questions must be a mix of two types:
1. Standard speak sentence:
   {
     "id": idx,
     "type": "speak",
     "sentence": "A simple sentence to read aloud in ${targetLang}",
     "translation": "The translation in ${uiLang}"
   }
2. "listeningTask": Choose the words you hear:
   {
     "id": idx,
     "type": "listeningTask",
     "audioText": "A simple sentence or phrase in ${targetLang} for the user to hear",
     "tiles": ["Array of 6-8 words in ${targetLang} containing all words from audioText plus 2-3 distractor words"]
   }

Return ONLY valid JSON with this exact structure:
{
  "questions": [
    ...
  ]
} (Make sure there are exactly 10 items in the array)`;
  }

  if (practiceType === "Read Practice") {
    return `You are LISA, an expert AI literacy tutor. Generate exactly 10 reading practice questions in ${targetLang} suitable for a learner at Literacy Level ${literacyLevel} (${literacyLevelName}).
The user's preferred interface language is ${uiLang}. All options, instructions, prompts, and explanations must be translated to or explained in ${uiLang} wherever applicable.
The questions must be a mix of the following reading/comprehension activity types:
1. "mcq": A multiple choice question in ${targetLang} testing reading comprehension, grammar, or word usage. Explanation in ${uiLang}.
2. "meaning": Select the correct translation/meaning of a target language word in ${uiLang}.
3. "passage": A short reading passage with a multiple-choice comprehension question:
   {
     "id": idx,
     "type": "passage",
     "passage": "A short reading passage of 2-4 simple sentences in ${targetLang}",
     "question": "A comprehension question about the passage in ${targetLang} or ${uiLang}",
     "options": ["A", "B", "C", "D"],
     "correctIndex": 0,
     "explanation": "Why this is correct, written in ${uiLang}"
   }
4. "matchingPairs": Make correct pairs of words:
   {
     "id": idx,
     "type": "matchingPairs",
     "pairs": [
       {"left": "word 1 in ${targetLang}", "right": "its meaning/translation/definition in ${uiLang}"},
       {"left": "word 2 in ${targetLang}", "right": "its meaning/translation/definition in ${uiLang}"},
       {"left": "word 3 in ${targetLang}", "right": "its meaning/translation/definition in ${uiLang}"},
       {"left": "word 4 in ${targetLang}", "right": "its meaning/translation/definition in ${uiLang}"}
     ]
   }
5. "imageChoice": Choose the correct picture:
   {
     "id": idx,
     "type": "imageChoice",
     "word": "target word in ${targetLang}",
     "prompt": "instruction in ${uiLang}, e.g. 'Tap the picture that means school'",
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

Generate exactly 10 review questions in ${targetLang} to help them practice and correct these mistakes (or general literacy review if no mistakes listed). Mix of multiple choice (mcq) and fill-in-the-blanks (fillBlank).
Keep them simple and helpful for Level ${literacyLevel} (${literacyLevelName}). Interface language is ${uiLang}, so write instructions, hints, and explanations in ${uiLang}.

Return ONLY valid JSON with this exact structure:
{
  "questions": [
    {
      "id": 1,
      "type": "mcq",
      "question": "Multiple choice question in ${targetLang} targeting a mistake or rule",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 0,
      "explanation": "Why this is correct in ${uiLang}"
    },
    {
      "id": 2,
      "type": "fillBlank",
      "sentence": "A sentence in ${targetLang} with ___ for the blank",
      "answer": "correct word to fill",
      "hint": "helpful hint in ${uiLang}"
    }
  ]
} (Make sure there are exactly 10 items in the array in total)`;
  }

  if (practiceType === "Words Practice") {
    return `You are LISA, an expert AI literacy tutor. Generate exactly 10 vocabulary/words practice questions in ${targetLang} suitable for a learner at Literacy Level ${literacyLevel} (${literacyLevelName}).
The user's interface language is ${uiLang}.
Mix of two types:
1. "meaning": Select the correct translation of a target language word in ${uiLang}.
2. "spelling": Fill in the blank to complete the spelling of a target language word in a sentence context.

Return ONLY valid JSON with this exact structure:
{
  "questions": [
    {
      "id": 1,
      "type": "meaning",
      "phrase": "Word or short phrase in ${targetLang}",
      "options": ["Correct translation in ${uiLang}", "incorrect distractor 1", "incorrect distractor 2"],
      "correctIndex": 0
    },
    {
      "id": 2,
      "type": "spelling",
      "sentence": "A simple sentence in ${targetLang} with a word missing letters, e.g. target language equivalent with ___",
      "answer": "The missing letters/word",
      "hint": "Hint in ${uiLang}"
    }
  ]
} (Make sure there are exactly 10 items in the array)`;
  }

  if (practiceType === "Stories Practice") {
    return `You are LISA, an expert AI literacy tutor. Generate a short, interesting, age-appropriate story (about 50-80 words, 3-5 sentences) in ${targetLang} suitable for a learner at Literacy Level ${literacyLevel} (${literacyLevelName}).
Make sure it is an engaging, structured story with characters or a narrative.
Then generate exactly 10 reading comprehension/vocabulary questions about this story. Interface language is ${uiLang}, so write questions, options, and explanations in ${uiLang}.

Return ONLY valid JSON with this exact structure:
{
  "story": "The complete story in ${targetLang}",
  "questions": [
    {
      "id": 1,
      "question": "Comprehension question in ${uiLang} about the story",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Explanation of correct answer in ${uiLang}"
    }
  ]
} (Make sure there are exactly 10 questions in the array)`;
  }

  if (practiceType === "Write Practice") {
    return `You are LISA, an expert AI literacy tutor. Generate exactly 10 writing practice questions in ${targetLang} suitable for a learner at Literacy Level ${literacyLevel} (${literacyLevelName}).
The user's interface language is ${uiLang}. Write prompts, hints, and translation cues in ${uiLang}.
The questions must be a mix of the following writing activity types:
1. "fillBlank": A sentence in ${targetLang} with a blank (___) for the learner to type the correct word.
2. "unscramble": Shuffled letter tiles in ${targetLang} that the learner rearranges to form a word.
3. "writingActivity": A short writing prompt in ${uiLang} for the learner to write a short response in ${targetLang}.
4. "tracing": A letter or simple word in ${targetLang} to trace.
5. "translationTask": Arrange the words:
   {
     "id": idx,
     "type": "translationTask",
     "prompt": "Arrange the words to form a sentence translating: [English sentence translated to ${uiLang}]",
     "englishTranslation": "The correct target sentence in ${targetLang}",
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
};;

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
    const text = await fetchAI(prompt, 4096);
    if (!text) throw new Error("Empty AI response");
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

    const resultText = await fetchAI(prompt, 1024);
    if (!resultText) throw new Error("Translation request failed");
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

    const resultText = await fetchAI(prompt, 2048);
    if (!resultText) throw new Error("Translation request failed");
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
