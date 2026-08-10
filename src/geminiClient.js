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
  if (localStorage.getItem("lisa_ai_enabled") === "false") {
    console.log("AI is disabled in dev control. Skipping fetchAI call.");
    return null;
  }
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

// ─── Curriculum-driven content guidance ──────────────────────────────────────
// Maps Section titles to specific content generation instructions.
// This tells the AI *what kind of content* is appropriate per section.
// Use __LANG__ as a placeholder for the learning language (replaced at build time).
const SECTION_CONTENT_GUIDANCE = {
  "Letter Recognition": `
    Focus ONLY on individual letters of the __LANG__ alphabet.
    - MCQs test: identifying a letter in a word, matching letter shapes, or naming the letter sound.
    - Fill blanks: a word with a missing letter (not missing words).
    - Matching pairs: letter ↔ the sound it makes or a word starting with that letter.
    - Unscramble: letter tiles to form a 2-3 letter word.
    - Tracing: a single letter (1 character only).
    - Listening: identify a spoken letter or a word starting with a specific letter.
    - Do NOT generate grammar questions or sentence comprehension.`,

  "Word Building": `
    Focus ONLY on short __LANG__ words (2-5 letters) relevant to the specific lesson title.
    - If lesson is "Three-Letter Words", every word used must be exactly 3 letters.
    - MCQs: choose the correct spelling of a word, or pick which word matches a picture.
    - Fill blanks: fill in a missing letter inside a word, not a missing word in a sentence.
    - Matching: word ↔ picture emoji or word ↔ English meaning.
    - Unscramble: rearrange letter tiles to form the target word.
    - Tracing: practice writing one of the lesson's words.
    - Do NOT generate reading passages or advanced grammar.`,

  "Vocabulary Development": `
    Focus ONLY on vocabulary words from the specific unit topic (e.g. Family, School, Community).
    - Use 4-6 vocabulary words that all belong to the lesson topic category.
    - MCQs: "What is the word for ___ in __LANG__?" with 4 options.
    - Fill blanks: a simple sentence with a key vocabulary word blanked out.
    - Matching pairs: __LANG__ vocabulary word ↔ English meaning or emoji.
    - Image choice: match a __LANG__ word to its emoji picture.
    - Listening: hear a vocabulary word, select the correct word from options.
    - All vocabulary must be relevant to the lesson title only.`,

  "Reading Words": `
    Focus ONLY on reading and recognizing __LANG__ words from the specific lesson category.
    - Sight words lesson: use high-frequency common words only.
    - Action words lesson: use only verbs.
    - Describing words lesson: use only adjectives.
    - MCQs: identify the word that matches a picture or meaning.
    - Fill blanks: a simple sentence with the target word type blanked out.
    - Reading passage: 2-3 sentences using only lesson-relevant word types.
    - Matching: word ↔ picture or word ↔ definition.`,

  "Reading Sentences": `
    Focus ONLY on reading and understanding simple __LANG__ sentences.
    - Keep sentences short (5-8 words) and directly relevant to the lesson topic.
    - Reading passage: 3-4 sentences covering the lesson topic scenario.
    - MCQs: comprehension questions about who, what, where in the sentences.
    - Fill blanks: complete a sentence by choosing the correct word.
    - Speaking: practice saying one key sentence from the lesson topic.
    - Chat complete: a simple 2-line dialogue relevant to the lesson (greetings, requests, etc.).`,

  "Reading Comprehension": `
    Focus ONLY on reading comprehension at the paragraph level.
    - Reading passage: 4-6 sentences forming a coherent short text relevant to the lesson title.
    - Questions must test comprehension of the passage (main idea, key details, sequence).
    - MCQs: inference or direct-retrieval questions from the passage.
    - Listening passage: read a 2-3 sentence excerpt, answer a comprehension question.
    - Do NOT test vocabulary in isolation — all content must link back to the reading passage.`,

  "Writing Fundamentals": `
    Focus ONLY on writing practice for __LANG__.
    - Tracing: a letter or short word (1-4 chars) relevant to the lesson title.
    - Unscramble: arrange letter tiles to form a word from the lesson.
    - Fill blanks: complete a word with a missing letter or syllable.
    - Writing task (writeThisTask): a simple word or phrase to write out.
    - Do NOT generate advanced reading comprehension.`,

  "Grammar Foundations": `
    Focus ONLY on the specific grammar concept in the lesson title (e.g. Nouns, Verbs, Subject).
    - Every example, question, and sentence must demonstrate the grammar concept.
    - MCQs: identify the noun/verb/subject in a sentence.
    - Fill blanks: choose the grammatically correct word for a blank.
    - Arrange words (translationTask): rearrange tiles into a grammatically correct sentence.
    - All sentences used must be simple and directly illustrate the grammar point.`,

  "Listening & Pronunciation": `
    Focus ONLY on listening and speaking activities.
    - listenWordMCQ: the user hears a word and selects which word they heard.
    - listenPassageMCQ: the user hears 2-3 sentences and answers a comprehension question.
    - Speaking (speakSentence): one natural sentence for the learner to practice aloud.
    - Pronunciation focus: words or sentences matching the lesson title (e.g. Difficult Sounds).
    - MCQs should test auditory recognition, not reading comprehension.`,

  "Greetings & Introductions": `
    Focus ONLY on conversational phrases for greetings and introductions.
    - All content must be practical phrases used in real greetings or introductions.
    - Chat complete: a 2-line conversational exchange using greeting/introduction phrases.
    - Scenario: a real-world situation where the learner must greet or introduce themselves.
    - MCQs: choose the correct greeting or response for a given situation.
    - Speaking: practice saying a greeting or introduction aloud.`
};

// ─── Prompt builder ───────────────────────────────────────────────────────────
const buildPrompt = (params) => {
  const {
    age, educationLevel, language, learningLanguage: paramLearningLang,
    interfaceLanguage: paramInterfaceLang, preferredLanguage: paramPrefLang, literacyLevel, literacyLevelName,
    weakAreas, sectionNum, sectionTitle, unitNum, unitTitle,
    lessonNum, lessonTitle, difficulty
  } = params;

  const learningLanguage = paramLearningLang || language || "English";
  const interfaceLanguage = paramInterfaceLang || paramPrefLang || language || "English";
  const ageCtx = getAgeContext(age);

  // Get curriculum-specific content guidance and replace __LANG__ placeholder
  const rawGuidance = SECTION_CONTENT_GUIDANCE[sectionTitle] || `
    Focus ONLY on the topic: "${lessonTitle}" within "${unitTitle}".
    Every question, word, sentence, and example must be directly related to this specific topic.`;
  const sectionGuidance = rawGuidance.replace(/__LANG__/g, learningLanguage);

  return `You are LISA, an AI literacy tutor. Your job is to generate a lesson that STRICTLY follows the curriculum hierarchy below.

══════════════════════════════════════════
CURRICULUM — SOURCE OF TRUTH
══════════════════════════════════════════
Section ${sectionNum}: ${sectionTitle}
Unit ${unitNum}: ${unitTitle}
Lesson ${lessonNum}: ${lessonTitle}

This lesson is EXCLUSIVELY about: "${lessonTitle}"
under the unit "${unitTitle}" in the section "${sectionTitle}".

══════════════════════════════════════════
LEARNER PROFILE
══════════════════════════════════════════
- Learning Language (content language): ${learningLanguage}
- Interface Language (instructions/UI language): ${interfaceLanguage}
- Age: ${age} (${ageCtx.contextName})
- Education Level: ${educationLevel}
- Literacy Level: Level ${literacyLevel} — ${literacyLevelName}

══════════════════════════════════════════
SECTION-SPECIFIC CONTENT RULES
══════════════════════════════════════════
${sectionGuidance}

══════════════════════════════════════════
STRICT RULES — FOLLOW EXACTLY
══════════════════════════════════════════
1. ALL learning content (words, sentences, passages, options) MUST be about "${lessonTitle}" only.
   Do NOT generate content about unrelated topics.
2. Target content (words, letters, sentences, passages) MUST be written in ${learningLanguage}.
3. All instructions, question prompts, hints, and explanations MUST be in ${interfaceLanguage}.
4. Every example, MCQ, fill-blank, matching pair, and listening task must directly test the "${lessonTitle}" concept.
5. Do NOT generate questions about grammar topics not in this lesson, do NOT use unrelated vocabulary.
6. Age-appropriate example for context: "${ageCtx.contextExample}"
7. For "unscramble": tiles must be individual letters of the answer word, shuffled so they do NOT spell the answer in order.
8. For "imageChoice": exactly 3 emoji options; correctIndex points to the emoji matching the word.
9. For "tracing": provide a single short word or letter (1-4 chars max) from the lesson topic.
10. For "translationTask" tiles: shuffled English words must NOT form any other grammatically correct sentence.
11. The lessonTitle field in the JSON MUST be: "${lessonTitle}"
12. The skillFocus field in the JSON must reflect the specific skill being practiced in this exact lesson.

══════════════════════════════════════════
OUTPUT FORMAT
══════════════════════════════════════════
Return ONLY valid JSON — no markdown fences, no backticks, no explanatory text before or after:
{
  "lessonTitle": "${lessonTitle}",
  "skillFocus": "string describing the exact skill practiced in this lesson",
  "explanation": "string (2-3 paragraphs in ${interfaceLanguage} explaining the '${lessonTitle}' concept with examples from ${learningLanguage})",
  "examples": [
    {"text": "string in ${learningLanguage} directly about ${lessonTitle}", "translation": "string (${interfaceLanguage} meaning)"},
    {"text": "string in ${learningLanguage} directly about ${lessonTitle}", "translation": "string"},
    {"text": "string in ${learningLanguage} directly about ${lessonTitle}", "translation": "string"}
  ],
  "guidedPractice": "string (step-by-step exercise in ${interfaceLanguage} about ${lessonTitle})",
  "mcqs": [
    {"question": "string in ${interfaceLanguage} testing ${lessonTitle}", "options": ["A in ${learningLanguage}", "B", "C", "D"], "correctIndex": 0, "explanation": "string in ${interfaceLanguage}"},
    {"question": "string in ${interfaceLanguage} testing ${lessonTitle}", "options": ["A in ${learningLanguage}", "B", "C", "D"], "correctIndex": 0, "explanation": "string in ${interfaceLanguage}"}
  ],
  "fillBlanks": [
    {"sentence": "string with ___ for blank in ${learningLanguage}, related to ${lessonTitle}", "answer": "string in ${learningLanguage}", "hint": "string in ${interfaceLanguage}", "options": ["correct_answer", "distractor 1", "distractor 2", "distractor 3"]}
  ],
  "readingPassage": "string (3-5 sentences in ${learningLanguage} about ${lessonTitle} topic)",
  "readingQuestion": "string (comprehension question in ${interfaceLanguage} about the passage)",
  "readingAnswer": "string (correct answer in ${learningLanguage})",
  "readingOptions": ["correct answer in ${learningLanguage}", "wrong option 2", "wrong option 3", "wrong option 4"],
  "speakSentence": "string (a natural sentence in ${learningLanguage} related to ${lessonTitle})",
  "speakSentenceEmoji": "string (a single emoji matching the speakSentence topic)",
  "meaningQuestion": {
    "phrase": "string (a ${learningLanguage} word from the ${lessonTitle} topic)",
    "options": ["correct meaning in ${interfaceLanguage}", "wrong meaning 1", "wrong meaning 2", "wrong meaning 3"],
    "correctIndex": 0
  },
  "translationTask": {
    "sentence": "string (a sentence in ${learningLanguage} relevant to ${lessonTitle})",
    "prompt": "string (instruction in ${interfaceLanguage}, e.g. 'Arrange the words to form a sentence')",
    "englishTranslation": "string (correct English translation)",
    "tiles": ["array of 6-8 English words: all words from englishTranslation plus 2-3 distractor words, shuffled so they do NOT form the sentence in order"]
  },
  "matchingPairs": [
    {"left": "${learningLanguage} word from ${lessonTitle}", "right": "meaning/translation in ${interfaceLanguage}"},
    {"left": "${learningLanguage} word from ${lessonTitle}", "right": "meaning/translation in ${interfaceLanguage}"},
    {"left": "${learningLanguage} word from ${lessonTitle}", "right": "meaning/translation in ${interfaceLanguage}"},
    {"left": "${learningLanguage} word from ${lessonTitle}", "right": "meaning/translation in ${interfaceLanguage}"}
  ],
  "listeningTask": {
    "audioText": "string (a sentence/phrase in ${learningLanguage} about ${lessonTitle})",
    "tiles": ["array of 6-8 words in ${learningLanguage}: all words from audioText plus 2-3 distractor words"]
  },
  "unscramble": [
    {"hint": "string clue in ${interfaceLanguage} about ${lessonTitle}", "emoji": "string (single emoji hint)", "answer": "WORD_IN_${learningLanguage.toUpperCase()}", "tiles": ["individual letter tiles for answer word, shuffled"]}
  ],
  "imageChoice": [
    {"word": "string (${learningLanguage} word from ${lessonTitle})", "prompt": "string (instruction in ${interfaceLanguage})", "options": ["emoji1","emoji2","emoji3"], "correctIndex": 0}
  ],
  "tracing": [
    {"kind": "short word or letter in ${learningLanguage} from ${lessonTitle} (1-4 chars max)", "question": "string (prompt in ${interfaceLanguage})", "sound": "pronunciation in ${learningLanguage}"}
  ],
  "listenWordMCQ": {
    "audioText": "string (a single ${learningLanguage} word from ${lessonTitle})",
    "question": "string (e.g. 'Which word did you hear?' in ${interfaceLanguage})",
    "options": ["correct word in ${learningLanguage}", "distractor 1", "distractor 2", "distractor 3"],
    "correctIndex": 0
  },
  "listenPassageMCQ": {
    "audioText": "string (2-3 sentences in ${learningLanguage} about ${lessonTitle})",
    "question": "string (comprehension question in ${interfaceLanguage})",
    "options": ["correct answer", "distractor 1", "distractor 2", "distractor 3"],
    "correctIndex": 0
  },
  "chatComplete": {
    "scenario": "string (a short 2-line dialogue in ${learningLanguage} relevant to ${lessonTitle}, with B: ___)",
    "question": "string (prompt in ${interfaceLanguage}, e.g. 'Complete the conversation:')",
    "options": ["correct response in ${learningLanguage}", "wrong option 1", "wrong option 2", "wrong option 3"],
    "correctIndex": 0
  },
  "scenario": {
    "scenario": "string (a real-world situation in ${learningLanguage} related to ${lessonTitle})",
    "question": "string (question/prompt in ${interfaceLanguage})",
    "options": ["correct action in ${learningLanguage}", "wrong option 1", "wrong option 2", "wrong option 3"],
    "correctIndex": 0
  },
  "aiFeedbackPositive": "string (encouraging message in ${interfaceLanguage})",
  "aiFeedbackNegative": "string (gentle corrective message in ${interfaceLanguage})"
}`;
};

// Cache lesson content by lesson ID to avoid re-fetching
const lessonCache = new Map();

const getCommonDistractors = (lang) => {
  if (lang === "Kannada") {
    return ["ಹುಡುಗ", "ನೀರು", "ಶಾಲೆಗೆ", "ಮನೆಗೆ", "ಪುಸ್ತಕ", "ಬರೆಯುತ್ತಾನೆ", "ಸೇಬು", "ಹಣ್ಣು", "ನಾಯಿ", "ಬೆಕ್ಕು"];
  }
  if (lang === "Hindi") {
    return ["लड़का", "पानी", "स्कूल", "घर", "किताब", "लिखता", "सेब", "फल", "कुत्ता", "बिल्ली"];
  }
  if (lang === "Telugu") {
    return ["అబ్బాయి", "నీరు", "బడికి", "ఇంటికి", "పుస్తకం", "రాస్తాడు", "ఆపిల్", "పండు", "కుక్క", "పిల్లి"];
  }
  if (lang === "Tamil") {
    return ["பையன்", "தண்ணீர்", "பள்ளிக்கு", "வீட்டிற்கு", "புத்தகம்", "எழுதுகிறான்", "ஆப்பிள்", "பழம்", "நாய்", "பூனை"];
  }
  return ["boy", "water", "school", "home", "book", "writes", "apple", "fruit", "dog", "cat"];
};

const convertToUnifiedQuestions = (lesson, params) => {
  const questions = [];
  const language = params?.learningLanguage || params?.language || "English";

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
      ...getCommonDistractors(language)
    ].filter((v, i, a) => a.indexOf(v) === i).slice(0, 8);
    questions.push({
      type: "translateToLearning",
      englishSentence: lesson.translationTask.englishTranslation,
      targetSentence: lesson.translationTask.sentence,
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

  // 8. Translation Task (Exactly 1) - English -> Learning Language!
  if (lesson.translationTask) {
    const targetWordList = (lesson.translationTask.sentence || "").split(/\s+/).filter(Boolean);
    const targetTiles = [
      ...targetWordList,
      ...(lesson.translationTask.targetTiles || []),
      ...getCommonDistractors(language)
    ].filter((v, i, a) => a.indexOf(v) === i).slice(0, 8);

    questions.push({
      type: "translationTask",
      targetSentence: lesson.translationTask.sentence,
      prompt: lesson.translationTask.prompt || (
        language === "Hindi" ? "एक वाक्य बनाने के लिए शब्दों को व्यवस्थित करें।" :
        language === "Kannada" ? "ಒಂದು ವಾಕ್ಯವನ್ನು ರೂಪಿಸಲು ಪದಗಳನ್ನು ಜೋಡಿಸಿ." :
        language === "Telugu" ? "ఒక వాక్యాన్ని రూపొందించడానికి పదాలను అమర్చండి." :
        language === "Tamil" ? "ஒரு வாக்கியத்தை உருவாக்க வார்த்தைகளை ஒழுங்கமைக்கவும்." :
        "Arrange the words to form a sentence."
      ),
      englishTranslation: lesson.translationTask.englishTranslation,
      tiles: targetTiles
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
  const lessonTitleKey = (params.lessonTitle || "").replace(/\s+/g, "_").toLowerCase();
  const cacheKey = `lesson_${params.sectionNum}_${params.unitNum}_${params.lessonNum}_${params.learningLanguage || params.language}_${params.interfaceLanguage || params.preferredLanguage || "en"}_${lessonTitleKey}`;

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

  const rawLesson = (() => {
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
  })();

  const interfaceLang = params.preferredLanguage || params.interfaceLanguage || "English";
  const learningLang = params.learningLanguage || params.language || "English";
  return translateFallback(rawLesson, interfaceLang, learningLang);
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
  const { practiceType, language, literacyLevel, literacyLevelName, mistakesList, interfaceLanguage, preferredLanguage } = params;
  const targetLang = language || "English";
  const uiLang = interfaceLanguage || preferredLanguage || "English";

  if (practiceType === "Perfect Pronunciation") {
    return `You are LISA, an expert AI literacy tutor. Generate exactly 10 speaking/pronunciation practice questions in ${targetLang} suitable for a learner at Literacy Level ${literacyLevel} (${literacyLevelName}).
The user's preferred interface language is ${uiLang}. Provide translation descriptions in ${uiLang}.
The questions must be standard speak sentences:
{
  "id": idx,
  "type": "speak",
  "sentence": "A simple sentence to read aloud in ${targetLang}",
  "translation": "The translation in ${uiLang}"
}

Return ONLY valid JSON with this exact structure:
{
  "questions": [
    ...
  ]
} (Make sure there are exactly 10 items in the array)`;
  }

  if (practiceType === "Speak Practice" || practiceType === "Speak") {
    return `You are LISA, an expert AI literacy tutor. Generate exactly 10 speaking practice questions in ${targetLang} suitable for a learner at Literacy Level ${literacyLevel} (${literacyLevelName}).
The user's preferred interface language is ${uiLang}.
Generate exactly 10 questions utilizing a mix of these three types:
1. "listenRepeat": Listen to a sentence in ${targetLang} and repeat it:
   {
     "id": idx,
     "type": "listenRepeat",
     "sentence": "A simple sentence in ${targetLang} to read or repeat",
     "translation": "The translation in ${uiLang}"
   }
2. "speakReply": Respond to a character's prompt:
   {
     "id": idx,
     "type": "speakReply",
     "promptText": "A dialog prompt from character in ${targetLang} e.g. 'Hello, how are you?' or 'What is your name?'",
     "replyText": "The response for user to speak in ${targetLang} e.g. 'I am doing well, thank you' or 'My name is LISA'",
     "translation": "Translation of the replyText in ${uiLang}"
   }
3. "translateSpeak": Translate and speak:
   {
     "id": idx,
     "type": "translateSpeak",
     "promptText": "A simple sentence written in ${uiLang} for the user to translate",
     "targetSentence": "The correct translation in ${targetLang} for the user to speak aloud",
     "hint": "A helpful grammar or vocabulary hint in ${uiLang} e.g. 'Use present tense'"
   }

Return ONLY valid JSON with this exact structure:
{
  "questions": [
    ...
  ]
} (Make sure there are exactly 10 items in the array in total)`;
  }

  if (practiceType === "Read Practice") {
    return `You are LISA, an expert AI literacy tutor. Generate exactly 10 reading practice questions in ${targetLang} suitable for a learner at Literacy Level ${literacyLevel} (${literacyLevelName}).
The user's preferred interface language is ${uiLang}. All options, instructions, prompts, and explanations must be translated to or explained in ${uiLang} wherever applicable.
The questions must be a mix of the following reading/comprehension activity types:
1. "mcq": A multiple choice question in ${targetLang} testing reading comprehension, grammar, or word usage. Explanation in ${uiLang}.
2. "fillBlank": A sentence in ${targetLang} with a blank (___) for the learner to select or type the correct word, with a hint in ${uiLang}.
3. "meaning": Select the correct translation/meaning of a target language word in ${uiLang}.
4. "passage": A short reading passage with a multiple-choice comprehension question:
   {
     "id": idx,
     "type": "passage",
     "passage": "A short reading passage of 2-4 simple sentences in ${targetLang}",
     "question": "A comprehension question about the passage in ${targetLang} or ${uiLang}",
     "options": ["A", "B", "C", "D"],
     "correctIndex": 0,
     "explanation": "Why this is correct, written in ${uiLang}"
   }
5. "matchingPairs": Make correct pairs of words:
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
6. "imageChoice": Choose the correct picture:
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
    return `You are LISA, an expert AI literacy tutor. Generate exactly 10 vocabulary/words practice items in ${targetLang} suitable for a learner at Literacy Level ${literacyLevel} (${literacyLevelName}).
The user's interface language is ${uiLang}.

Each item must be structured as follows:
{
  "word": "The word in ${targetLang}",
  "translation": "The translation of the word in ${uiLang}",
  "emoji": "An emoji representing the word",
  "sentence": "A simple sentence in ${targetLang} using the word"
}

Return ONLY valid JSON with this exact structure:
{
  "questions": [
    ...
  ]
}`;
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
The questions must be a mix of the following writing activity types ONLY:
1. "unscramble": Shuffled letter tiles of a word in ${targetLang} (learning language) that the learner rearranges to form the target word. The question prompt/hint must be in ${uiLang} (interface language), e.g.:
   {
     "id": idx,
     "type": "unscramble",
     "hint": "Prompt/hint description of the word in ${uiLang}",
     "emoji": "An emoji representing the word",
     "answer": "TARGET_WORD_IN_${targetLang}",
     "tiles": ["Individual", "letter", "tiles", "of", "the", "word", "in", "${targetLang}"]
   }
2. "tracing": A letter or simple word in ${targetLang} to trace.
3. "translationTask": Arrange the words to form a sentence:
   {
     "id": idx,
     "type": "translationTask",
     "prompt": "Arrange the words to form a sentence translating: [Sentence in ${uiLang}]",
     "englishTranslation": "The correct target sentence in ${targetLang}",
     "tiles": ["shuffled", "words", "in", "${targetLang}"]
   }

Return ONLY valid JSON with this exact structure:
{
  "questions": [
    ...
  ]
} (Make sure there are exactly 10 items in the array, using a mix of these 3 types. Do NOT include fillBlank or writingActivity questions)`;
  }

  if (practiceType === "Word Sprint") {
    return `You are LISA, an expert AI literacy tutor. Generate exactly 10 vocabulary/speed word practice items in ${targetLang} suitable for a learner at Literacy Level ${literacyLevel} (${literacyLevelName}).
The user's preferred interface language is ${uiLang}.
Each item must be structured as follows:
{
  "word": "The word in ${targetLang}",
  "emoji": "An emoji representing the word",
  "hint": "A simple description/hint of the word written in ${uiLang}"
}

Return ONLY valid JSON with this exact structure:
{
  "questions": [
    ...
  ]
} (Make sure there are exactly 10 items in the array)`;
  }

  if (practiceType === "Word Scramble") {
    return `You are LISA, an expert AI literacy tutor. Generate exactly 10 vocabulary/puzzle scramble word items in ${targetLang} suitable for a learner at Literacy Level ${literacyLevel} (${literacyLevelName}).
The user's preferred interface language is ${uiLang}.
Each item must be structured as follows:
{
  "word": "The word in ${targetLang} in ALL CAPS",
  "tiles": ["The", "individual", "letters/characters", "of", "the", "word", "in", "the", "correct", "order"],
  "category": "A simple category name for the word written in ${uiLang}",
  "emoji": "An emoji representing the word"
}

Return ONLY valid JSON with this exact structure:
{
  "questions": [
    ...
  ]
} (Make sure there are exactly 10 items in the array)`;
  }

  if (practiceType === "Memory Match") {
    return `You are LISA, an expert AI literacy tutor. Generate exactly 8 memory matching pairs in ${targetLang} suitable for a learner at Literacy Level ${literacyLevel} (${literacyLevelName}).
The user's preferred interface language is ${uiLang}.
Each item must be structured as follows:
{
  "id": "A unique English key for the pair, e.g. 'apple' or 'school'",
  "emoji": "An emoji representing the item",
  "word": "The word in ${targetLang}"
}

Return ONLY valid JSON with this exact structure:
{
  "questions": [
    ...
  ]
} (Make sure there are exactly 8 items in the array)`;
  }

  return "";
};;

const UNSCRAMBLE_HINTS = {
  school: {
    English: "Place of study and learning",
    Hindi: "अध्ययन का स्थान",
    Kannada: "ಕಲಿಯುವ ಸ್ಥಳ",
    Telugu: "మనం చదువుకునే చోటు",
    Tamil: "நாங்கள் படிக்கும் இடம்"
  },
  apple: {
    English: "A sweet red fruit",
    Hindi: "एक लाल या हरा फल",
    Kannada: "ಒಂದು ಸಿಹಿ ಕೆಂಪು ಹಣ್ಣು",
    Telugu: "ఒక తియ్యటి ఎర్రని పండు",
    Tamil: "ஒரு இனிப்பான சிவப்பு பழம்"
  },
  book: {
    English: "Book to read and learn",
    Hindi: "पढ़ने की पुस्तक",
    Kannada: "ಓದುವ ಪುಸ್ತಕ",
    Telugu: "చదువుకునే పుస్తకం",
    Tamil: "படிக்க உதவும் புத்தகம்"
  },
  sun: {
    English: "Bright star in the sky",
    Hindi: "आसमान में चमकता तारा",
    Kannada: "ಆಕಾಶದಲ್ಲಿ ಪ್ರಕಾಶಿಸುವ ಸೂರ್ಯ",
    Telugu: "ఆకాశంలో ప్రకాశించే సూర్యుడు",
    Tamil: "வானத்தில் பிரகாசிக்கும் சூரியன்"
  }
};

const TRACING_INFOS = {
  English: (char) => `Trace the letter ${char}`,
  Hindi: (char) => `अक्षर '${char}' को ट्रेस करें`,
  Kannada: (char) => `ಅಕ್ಷರ '${char}' ಅನ್ನು ಟ್ರೇಸ್ ಮಾಡಿ`,
  Telugu: (char) => `అక్షరం '${char}' ను ట్రేస్ చేయండి`,
  Tamil: (char) => `எழுத்து '${char}' ஐ டிரேஸ் செய்யவும்`
};

const TRANSLATION_PROMPTS = {
  school: {
    English: "Arrange the words to form: 'our school is beautiful'",
    Hindi: "Arrange the words to form: 'हमारा स्कूल सुंदर है'",
    Kannada: "Arrange the words to form: 'ನಮ್ಮ ಶಾಲೆ ಸುಂದರವಾಗಿದೆ'",
    Telugu: "Arrange the words to form: 'మా బడి చాలా అందంగా ఉంటుంది'",
    Tamil: "Arrange the words to form: 'எங்கள் பள்ளி அழகாக இருக்கிறது'"
  },
  cat: {
    English: "Arrange the words to form: 'this is a cat'",
    Hindi: "Arrange the words to form: 'यह एक बिल्ली है'",
    Kannada: "Arrange the words to form: 'ಇದು ಒಂದು ಬೆಕ್ಕು'",
    Telugu: "Arrange the words to form: 'ఇది ఒక పిల్లి'",
    Tamil: "Arrange the words to form: 'இது ஒரு பூனை'"
  },
  sun: {
    English: "Arrange the words to form: 'the sun rises in the east'",
    Hindi: "Arrange the words to form: 'सूरज पूर्व से उगता है'",
    Kannada: "Arrange the words to form: 'ಸೂರ್ಯನು ಪೂರ್ವದಲ್ಲಿ ಉದಯಿಸುತ್ತಾನೆ'",
    Telugu: "Arrange the words to form: 'సూర్యుడు తూర్పున ఉదయిస్తాడు'",
    Tamil: "Arrange the words to form: 'சூரியன் கிழக்கில் உதிக்கிறது'"
  }
};
const WORD_SPRINT_HINTS = {
  apple: { English: "A red or green fruit", Hindi: "एक लाल या हरा फल", Kannada: "ಒಂದು ಕೆಂಪು ಅಥವಾ ಹಸಿರು ಹಣ್ಣು", Telugu: "ఒక ఎరుపు లేదా ఆకుపచ్చ పండు", Tamil: "ஒரு சிவப்பு அல்லது பச்சை பழம்" },
  bridge: { English: "You cross water on it", Hindi: "आप इससे पानी पार करते हैं", Kannada: "ನೀವು ಇದರ ಮೇಲೆ ನೀರನ್ನು ದಾಟುತ್ತೀರಿ", Telugu: "దీనిపై నీటిని దాటుతాము", Tamil: "இதன் மூலம் நீங்கள் நீரை கடக்கலாம்" },
  cloud: { English: "Found in the sky", Hindi: "आसमान में पाया जाता है", Kannada: "ಆಕಾಶದಲ್ಲಿ ಕಂಡುಬರುತ್ತದೆ", Telugu: "ఆకాశంలో కనిపిస్తుంది", Tamil: "வானத்தில் காணப்படும்" },
  dream: { English: "What you see when sleeping", Hindi: "सोते समय जो आप देखते हैं", Kannada: "ನಿದ್ರಿಸುವಾಗ ನೀವು ಕಾಣುವ ದೃಶ್ಯ", Telugu: "నిద్రపోతున్నప్పుడు వచ్చేది", Tamil: "தூங்கும் போது நீங்கள் காண்பது" },
  earth: { English: "Our home planet", Hindi: "हमारा गृह ग्रह", Kannada: "ನಮ್ಮ ವಾಸಸ್ಥಾನ ಗ್ರಹ", Telugu: "మన నివాస గ్రహం", Tamil: "நமது தாய் கிரகம்" },
  fire: { English: "Hot and bright", Hindi: "गर्म और चमकदार", Kannada: "ಬಿಸಿ ಮತ್ತು ಪ್ರಕಾಶಮಾನ", Telugu: "వేడిగా మరియు ప్రకాశవంతంగా ఉంటుంది", Tamil: "வெப்பமான மற்றும் பிரகாசமானது" },
  garden: { English: "Where flowers grow", Hindi: "जहाँ फूल उगते हैं", Kannada: "ಹೂವುಗಳು ಬೆಳೆಯುವ ಸ್ಥಳ", Telugu: "పువ్వులు పెరిగే స్థలం", Tamil: "பூக்கள் வளரும் இடம்" },
  happy: { English: "A joyful feeling", Hindi: "एक आनंदमय भावना", Kannada: "ಆನಂದದಾಯಕ ಭಾವನೆ", Telugu: "ఒక ఆనందకరమైన అనుభೂति", Tamil: "ஒரு மகிழ்ச்சியான உணர்வு" },
  island: { English: "Land surrounded by water", Hindi: "पानी से घिरी भूमि", Kannada: "ನೀರಿನಿಂದ ಆವೃತವಾದ ಭೂಮಿ", Telugu: "నీటితో చుట్టబడిన భూమి", Tamil: "நீரால் சூழப்பட்ட நிலப்பகுதி" },
  jungle: { English: "A dense tropical forest", Hindi: "एक घना उष्णकटिबंधीय वन", Kannada: "ದಟ್ಟವಾದ ಉಷ್ಣವಲಯದ ಕಾಡು", Telugu: "దట్టమైన ఉష్ణమండల అరణ్యం", Tamil: "அடர்ந்த வெப்பமண்டல காடு" }
};

const CATEGORIES_BY_LANG = {
  Emotions: { English: "Emotions", Hindi: "भावनाएँ", Kannada: "ಭಾವನೆಗಳು", Telugu: "భావోద్వేగాలు", Tamil: "உணர்ச்சிகள்" },
  Adjectives: { English: "Adjectives", Hindi: "विशेषण", Kannada: "ಗುಣವಾಚಕಗಳು", Telugu: "విశేషణాలు", Tamil: "உரிச்சொற்கள்" },
  Food: { English: "Food", Hindi: "भोजन", Kannada: "ಆಹಾರ", Telugu: "ఆహారం", Tamil: "உணவு" },
  Nature: { English: "Nature", Hindi: "प्रकृति", Kannada: "ಪ್ರಕೃತಿ", Telugu: "ప్రకృతి", Tamil: "இயற்கை" },
  World: { English: "World", Hindi: "दुनिया", Kannada: "ಪ್ರಪಂಚ", Telugu: "ప్రపంచం", Tamil: "உலகம்" },
  Arts: { English: "Arts", Hindi: "कला", Kannada: "ಕಲೆಗಳು", Telugu: "కళలు", Tamil: "கலைகள்" },
  Science: { English: "Science", Hindi: "विज्ञान", Kannada: "ವಿಜ್ಞಾನ", Telugu: "విజ్ఞానం", Tamil: "அறிவியல்" },
  Concepts: { English: "Concepts", Hindi: "अवधारणाएँ", Kannada: "ಪರಿಕಲ್ಪನೆಗಳು", Telugu: "భావనలు", Tamil: "கருத்துக்கள்" },
  Education: { English: "Education", Hindi: "शिक्षा", Kannada: "ಶಿಕ್ಷಣ", Telugu: "విద్య", Tamil: "கல்வி" },
  Skills: { English: "Skills", Hindi: "कौशल", Kannada: "ಕೌಶಲ್ಯಗಳು", Telugu: "నైపుణ్యాలు", Tamil: "திறன்கள்" },
  Language: { English: "Language", Hindi: "भाषा", Kannada: "ಭಾಷೆ", Telugu: "భాష", Tamil: "மொழி" },
  Traits: { English: "Traits", Hindi: "गुण", Kannada: "ಗುಣಲಕ್ಷಣಗಳು", Telugu: "లక్షణాలు", Tamil: "பண்புகள்" }
};

const READ_QUESTIONS = {
  sun_mcq: {
    English: { q: "From which direction does the sun rise?", opt: ["East", "West", "North", "South"], exp: "The sun rises in the east." },
    Hindi: { q: "सूरज किस दिशा से उगता है?", opt: ["पूर्व", "पश्चिम", "उत्तर", "दक्षिण"], exp: "सूरज पूर्व से उगता है।" },
    Kannada: { q: "ಸೂರ್ಯನು ಯಾವ ದಿಕ್ಕಿನಲ್ಲಿ ಉದಯಿಸುತ್ತಾನೆ?", opt: ["ಪೂರ್ವ", "ಪಶ್ಚಿಮ", "ಉತ್ತರ", "ದಕ್ಷಿಣ"], exp: "ಸೂರ್ಯನು ಪೂರ್ವದಲ್ಲಿ ಉದಯಿಸುತ್ತಾನೆ." },
    Telugu: { q: "సూర్యుడు ఏ దిశలో ఉదయిస్తాడు?", opt: ["తూర్పు", "పడమర", "ఉత్తరం", "దక్షిణం"], exp: "సూర్యుడు తూర్పున ఉదయిస్తాడు." },
    Tamil: { q: "சூரியன் எந்த திசையில் உதிக்கிறது?", opt: ["கிழக்கு", "மேற்கு", "வடக்கு", "தெற்கு"], exp: "சூரியன் கிழக்கில் உதிக்கிறது." }
  },
  lion_passage: {
    English: { q: "Where did the lion live?", opt: ["In the forest", "In a cave", "In the zoo", "On the hill"], exp: "The lion lived in the forest." },
    Hindi: { q: "शेर कहाँ रहता था?", opt: ["जंगल में", "गुफा में", "चिड़ियाघर में", "पहाड़ पर"], exp: "शेर जंगल में रहता था।" },
    Kannada: { q: "ಸಿಂಹ ಎಲ್ಲಿ ವಾಸಿಸುತ್ತಿತ್ತು?", opt: ["ಕಾಡಿನಲ್ಲಿ", "ಗುಹೆಯಲ್ಲಿ", "ಮೃಗಾಲಯದಲ್ಲಿ", "ಬೆಟ್ಟದ ಮೇಲೆ"], exp: "ಸಿಂಹ ಕಾಡಿನಲ್ಲಿ ಇತ್ತು." },
    Telugu: { q: "సింహం ఎక్కడ ఉండేది?", opt: ["అడవిలో", "గుహలో", "జూలో", "కొండపై"], exp: "సింహం అడవిలో ఉండేది." },
    Tamil: { q: "சிங்கம் எங்கு வாழ்ந்தது?", opt: ["காட்டில்", "குகையில்", "மிருகக்காட்சிசாலையில்", "மலையில்"], exp: "சிங்கம் காட்டில் வாழ்ந்தது." }
  },
  dog_passage: {
    English: { q: "What is Raju's dog name?", opt: ["Sheru", "Kalu", "Moti", "Tommy"], exp: "The dog name is Sheru." },
    Hindi: { q: "राजू के कुत्ते का नाम क्या है?", opt: ["शेरू", "कालू", "मोती", "टॉमी"], exp: "राजू के कुत्ते का नाम शेरू है।" },
    Kannada: { q: "ರಾಜು ನಾಯಿಯ ಹೆಸರೇನು?", opt: ["ಶೇರು", "ಕಾಲು", "ಮೋತಿ", "ಟಾಮಿ"], exp: "ನಾಯಿಯ ಹೆಸರು ಶೇರು." },
    Telugu: { q: "రాజు కుక్క పేరు ఏమిటి?", opt: ["షేరు", "కాలు", "మోతీ", "టామీ"], exp: "రాజు కుక్క పేరు షేరు." },
    Tamil: { q: "ராஜுவின் நாயின் பெயர் என்ன?", opt: ["ஷேரு", "காலும்", "மோதி", "டாமி"], exp: "நாயின் பெயர் ஷேரு." }
  },
  book_img: {
    English: "Choose the correct picture for Book:",
    Hindi: "किताब (Book) के लिए सही चित्र चुनें:",
    Kannada: "ಪುಸ್ತಕ (Book) ಕ್ಕೆ ಸರಿಯಾದ ಚಿತ್ರವನ್ನು ಆರಿಸಿ:",
    Telugu: "పుస్తకం (Book) కొరకు సరైన చిత్రాన్ని ఎంచుకోండి:",
    Tamil: "புத்தகம் (Book) க்கான சரியான படத்தை தேர்வு செய்யவும்:"
  },
  sun_img: {
    English: "Choose the correct picture for Sun:",
    Hindi: "सूरज (Sun) के लिए सही चित्र चुनें:",
    Kannada: "ಸೂರ್ಯ (Sun) ನಿಗೆ ಸರಿಯಾದ ಚಿತ್ರವನ್ನು ಆರಿಸಿ:",
    Telugu: "సూర్యుడు (Sun) కొరకు సరైన చిత్రాన్ని ఎంచుకోండి:",
    Tamil: "சூரியன் (Sun) க்கான சரியான படத்தை தேர்வு செய்யவும்:"
  }
};

const getFallbackPractice = (params) => {
  const { practiceType, language, learningLanguage, interfaceLanguage, preferredLanguage } = params;
  const targetLang = learningLanguage || language || "English";
  const uiLang = interfaceLanguage || preferredLanguage || "English";
  
  if (practiceType === "Perfect Pronunciation") {
    const defaultQuestions = targetLang === "Hindi" ? [
      { id: 1, type: "speak", sentence: "राम स्कूल जाता है।", englishTranslation: "Ram goes to school." },
      { id: 2, type: "speak", sentence: "वह किताब पढ़ता है।", englishTranslation: "He reads a book." },
      { id: 3, type: "speak", sentence: "सीता गाना गाती है।", englishTranslation: "Sita sings a song." },
      { id: 4, type: "speak", sentence: "आज मौसम अच्छा है।", englishTranslation: "Today the weather is good." },
      { id: 5, type: "speak", sentence: "मुझे फल खाना पसंद है।", englishTranslation: "I like to eat fruits." },
      { id: 6, type: "speak", sentence: "यह मेरी पुस्तक है।", englishTranslation: "This is my book." },
      { id: 7, type: "speak", sentence: "हम सब मिलकर खेलेंगे।", englishTranslation: "We will all play together." },
      { id: 8, type: "speak", sentence: "पानी बहुत ठंडा है।", englishTranslation: "The water is very cold." },
      { id: 9, type: "speak", sentence: "पेड़ पर पक्षी हैं।", englishTranslation: "Birds are on the tree." },
      { id: 10, type: "speak", sentence: "समय बहुत मूल्यवान है।", englishTranslation: "Time is very valuable." }
    ] : targetLang === "Kannada" ? [
      { id: 1, type: "speak", sentence: "ರಾಮ್ ಶಾಲೆಗೆ ಹೋಗುತ್ತಾನೆ.", englishTranslation: "Ram goes to school." },
      { id: 2, type: "speak", sentence: "ಅವನು ಪುಸ್ತಕ ಓದುತ್ತಾನೆ.", englishTranslation: "He reads a book." },
      { id: 3, type: "speak", sentence: "ಸೀತಾ ಹಾಡು ಹಾಡುತ್ತಾಳೆ.", englishTranslation: "Sita sings a song." },
      { id: 4, type: "speak", sentence: "ಇಂದು ಹವಾಮಾನ ಚೆನ್ನಾಗಿದೆ.", englishTranslation: "Today the weather is good." },
      { id: 5, type: "speak", sentence: "ನನಗೆ ಹಣ್ಣು ತಿನ್ನಲು ಇಷ್ಟ.", englishTranslation: "I like to eat fruits." },
      { id: 6, type: "speak", sentence: "ಇದು ನನ್ನ ಪುಸ್ತಕ.", englishTranslation: "This is my book." },
      { id: 7, type: "speak", sentence: "ನಾವೆಲ್ಲರೂ ಒಟ್ಟಿಗೆ ಆಡೋಣ.", englishTranslation: "Let's all play together." },
      { id: 8, type: "speak", sentence: "ನೀರು ತುಂಬಾ ತಣ್ಣಗಿದೆ.", englishTranslation: "The water is very cold." },
      { id: 9, type: "speak", sentence: "ಮರದ ಮೇಲೆ ಹಕ್ಕಿಗಳಿವೆ.", englishTranslation: "Birds are on the tree." },
      { id: 10, type: "speak", sentence: "ಸಮಯ ತುಂಬಾ ಅಮೂಲ್ಯವಾಗಿದೆ.", englishTranslation: "Time is very precious." }
    ] : targetLang === "Telugu" ? [
      { id: 1, type: "speak", sentence: "రాము బడికి వెళతాడు.", englishTranslation: "Ram goes to school." },
      { id: 2, type: "speak", sentence: "అతడు పుస్తకం చదువుతాడు.", englishTranslation: "He reads a book." },
      { id: 3, type: "speak", sentence: "సీత పాట పాడుతుంది.", englishTranslation: "Sita sings a song." },
      { id: 4, type: "speak", sentence: "ఈరోజు వాతావరణం బాగుంది.", englishTranslation: "Today the weather is good." },
      { id: 5, type: "speak", sentence: "నాకు పండ్లు తినడం ఇష్టం.", englishTranslation: "I like to eat fruits." },
      { id: 6, type: "speak", sentence: "ఇది నా పుస్తకం.", englishTranslation: "This is my book." },
      { id: 7, type: "speak", sentence: "మనమందరం కలిసి ఆడుకుందాం.", englishTranslation: "Let's all play together." },
      { id: 8, type: "speak", sentence: "నీరు చాలా చల్లగా ఉంది.", englishTranslation: "Water is very cold." },
      { id: 9, type: "speak", sentence: "చెట్టు మీద పక్షులు ఉన్నాయి.", englishTranslation: "Birds are on the tree." },
      { id: 10, type: "speak", sentence: "సమయం చాలా విలువైనది.", englishTranslation: "Time is very precious." }
    ] : targetLang === "Tamil" ? [
      { id: 1, type: "speak", sentence: "ராம் பள்ளிக்குச் செல்கிறான்.", englishTranslation: "Ram goes to school." },
      { id: 2, type: "speak", sentence: "அவன் புத்தகம் படிக்கிறான்.", englishTranslation: "He reads a book." },
      { id: 3, type: "speak", sentence: "சீதா பாட்டு பாடுகிறாள்.", englishTranslation: "Sita sings a song." },
      { id: 4, type: "speak", sentence: "இன்று வானிலை நன்றாக உள்ளது.", englishTranslation: "Today the weather is good." },
      { id: 5, type: "speak", sentence: "எனக்கு பழங்கள் சாப்பிட பிடிக்கும்.", englishTranslation: "I like to eat fruits." },
      { id: 6, type: "speak", sentence: "இது எனது புத்தகம்.", englishTranslation: "This is my book." },
      { id: 7, type: "speak", sentence: "நாம் அனைவரும் சேர்ந்து விளையாடுவோம்.", englishTranslation: "We will all play together." },
      { id: 8, type: "speak", sentence: "தண்ணீர் மிகவும் குளிராக இருக்கிறது.", englishTranslation: "Water is very cold." },
      { id: 9, type: "speak", sentence: "மரத்தின் மேல் பறவைகள் இருக்கின்றன.", englishTranslation: "Birds are on the tree." },
      { id: 10, type: "speak", sentence: "நேரம் மிகவும் மதிப்புமிக்கது.", englishTranslation: "Time is very valuable." }
    ] : [
      { id: 1, type: "speak", sentence: "The sun shines bright.", englishTranslation: "The sun shines bright." },
      { id: 2, type: "speak", sentence: "I love reading books.", englishTranslation: "I love reading books." },
      { id: 3, type: "speak", sentence: "We go to school.", englishTranslation: "We go to school." },
      { id: 4, type: "speak", sentence: "Water is clean and fresh.", englishTranslation: "Water is clean and fresh." },
      { id: 5, type: "speak", sentence: "She speaks very kindly.", englishTranslation: "She speaks very kindly." },
      { id: 6, type: "speak", sentence: "This is my favorite story.", englishTranslation: "This is my favorite story." },
      { id: 7, type: "speak", sentence: "Let's play together today.", englishTranslation: "Let's play together today." },
      { id: 8, type: "speak", sentence: "The trees are green.", englishTranslation: "The trees are green." },
      { id: 9, type: "speak", sentence: "Birds fly high in the sky.", englishTranslation: "Birds fly high in the sky." },
      { id: 10, type: "speak", sentence: "Practice makes perfect.", englishTranslation: "Practice makes perfect." }
    ];
    return { questions: defaultQuestions };
  }

  if (practiceType === "Speak Practice" || practiceType === "Speak") {
    const speakQuestions = targetLang === "Hindi" ? [
      { id: 1, type: "listenRepeat", sentence: "राम स्कूल जाता है।", englishTranslation: "Ram goes to school." },
      { id: 2, type: "listenRepeat", sentence: "वह किताब पढ़ता है।", englishTranslation: "He reads a book." },
      { id: 3, type: "listenRepeat", sentence: "सीता गाना गाती है।", englishTranslation: "Sita sings a song." },
      { id: 4, type: "listenRepeat", sentence: "पानी बहुत ठंडा है।", englishTranslation: "The water is very cold." },
      { id: 5, type: "speakReply", promptText: "नमस्ते! आप कैसे हैं?", replyText: "मैं ठीक हूँ, धन्यवाद।", translation: "I am fine, thank you." },
      { id: 6, type: "speakReply", promptText: "आपका नाम क्या है?", replyText: "मेरा नाम राहुल है।", translation: "My name is Rahul." },
      { id: 7, type: "speakReply", promptText: "आप कहाँ जा रहे हैं?", replyText: "मैं स्कूल जा रहा हूँ।", translation: "I am going to school." },
      { id: 8, type: "translateSpeak", promptText: "She sings a song.", targetSentence: "वह गाना गाती है।", hint: "Translate to Hindi" },
      { id: 9, type: "translateSpeak", promptText: "Today the weather is good.", targetSentence: "आज मौसम अच्छा है।", hint: "Translate to Hindi" },
      { id: 10, type: "translateSpeak", promptText: "I like to eat fruits.", targetSentence: "मुझे फल खाना पसंद है।", hint: "Translate to Hindi" }
    ] : targetLang === "Kannada" ? [
      { id: 1, type: "listenRepeat", sentence: "ರಾಮ್ ಶಾಲೆಗೆ ಹೋಗುತ್ತಾನೆ.", englishTranslation: "Ram goes to school." },
      { id: 2, type: "listenRepeat", sentence: "ಅವನು ಪುಸ್ತಕ ಓದುತ್ತಾನೆ.", englishTranslation: "He reads a book." },
      { id: 3, type: "listenRepeat", sentence: "ಸೀತಾ ಹಾಡು ಹಾಡುತ್ತಾಳೆ.", englishTranslation: "Sita sings a song." },
      { id: 4, type: "listenRepeat", sentence: "ನೀರು ತುಂಬಾ ತಣ್ಣಗಿದೆ.", englishTranslation: "The water is very cold." },
      { id: 5, type: "speakReply", promptText: "ನಮಸ್ಕಾರ! ನೀವು ಹೇಗಿದ್ದೀರಿ?", replyText: "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ, ಧನ್ಯವಾದಗಳು.", translation: "I am fine, thank you." },
      { id: 6, type: "speakReply", promptText: "ನಿಮ್ಮ ಹೆಸರೇನು?", replyText: "ನನ್ನ ಹೆಸರು ರಾಹುಲ್.", translation: "My name is Rahul." },
      { id: 7, type: "speakReply", promptText: "ನೀವು ಎಲ್ಲಿಗೆ ಹೋಗುತ್ತಿದ್ದೀರಿ?", replyText: "ನಾನು ಶಾಲೆಗೆ ಹೋಗುತ್ತಿದ್ದೇನೆ.", translation: "I am going to school." },
      { id: 8, type: "translateSpeak", promptText: "She sings a song.", targetSentence: "ಸೀತಾ ಹಾಡು ಹಾಡುತ್ತಾಳೆ.", hint: "Translate to Kannada" },
      { id: 9, type: "translateSpeak", promptText: "Today the weather is good.", targetSentence: "ಇಂದು ಹವಾಮಾನ ಚೆನ್ನಾಗಿದೆ.", hint: "Translate to Kannada" },
      { id: 10, type: "translateSpeak", promptText: "I like to eat fruits.", targetSentence: "ನನಗೆ ಹಣ್ಣು ತಿನ್ನಲು ಇಷ್ಟ.", hint: "Translate to Kannada" }
    ] : targetLang === "Telugu" ? [
      { id: 1, type: "listenRepeat", sentence: "రాము బడికి వెళతాడు.", englishTranslation: "Ram goes to school." },
      { id: 2, type: "listenRepeat", sentence: "అతడు పుస్తకం చదువుతాడు.", englishTranslation: "He reads a book." },
      { id: 3, type: "listenRepeat", sentence: "సీత పాట పాడుతుంది.", englishTranslation: "Sita sings a song." },
      { id: 4, type: "listenRepeat", sentence: "ನೀರು చాలా చల్లగా ఉంది.", englishTranslation: "Water is very cold." },
      { id: 5, type: "speakReply", promptText: "నమస్తే! మీరు ఎలా ఉన్నారు?", replyText: "నేను బాగున్నాను, ధన్యవాదాలు.", translation: "I am fine, thank you." },
      { id: 6, type: "speakReply", promptText: "మీ పేరు ఏమిటి?", replyText: "నా పేరు రాహుల్.", translation: "My name is Rahul." },
      { id: 7, type: "speakReply", promptText: "మీరు ఎక్కడికి వెళ్తున్నారు?", replyText: "నేను బడికి వెళ్తున్నాను.", translation: "I am going to school." },
      { id: 8, type: "translateSpeak", promptText: "She sings a song.", targetSentence: "సీత పాట పాడుతుంది.", hint: "Translate to Telugu" },
      { id: 9, type: "translateSpeak", promptText: "Today the weather is good.", targetSentence: "ఈరోజు వాతావరణం బాగుంది.", hint: "Translate to Telugu" },
      { id: 10, type: "translateSpeak", promptText: "I like to eat fruits.", targetSentence: "నాకు పండ్లు తినడం ఇష్టం.", hint: "Translate to Telugu" }
    ] : targetLang === "Tamil" ? [
      { id: 1, type: "listenRepeat", sentence: "ராம் பள்ளிக்குச் செல்கிறான்.", englishTranslation: "Ram goes to school." },
      { id: 2, type: "listenRepeat", sentence: "அவன் புத்தகம் படிக்கிறான்.", englishTranslation: "He reads a book." },
      { id: 3, type: "listenRepeat", sentence: "சீதா பாட்டு பாடுகிறாள்.", englishTranslation: "Sita sings a song." },
      { id: 4, type: "listenRepeat", sentence: "தண்ணீர் மிகவும் குளிராக இருக்கிறது.", englishTranslation: "Water is very cold." },
      { id: 5, type: "speakReply", promptText: "வணக்கம்! நீங்கள் எப்படி இருக்கிறீர்கள்?", replyText: "நான் நன்றாக இருக்கிறேன், நன்றி.", translation: "I am fine, thank you." },
      { id: 6, type: "speakReply", promptText: "உங்கள் பெயர் என்ன?", replyText: "என் பெயர் ராகுல்.", translation: "My name is Rahul." },
      { id: 7, type: "speakReply", promptText: "நீங்கள் எங்கே செல்கிறீர்கள்?", replyText: "நான் பள்ளிக்குச் செல்கிறேன்.", translation: "I am going to school." },
      { id: 8, type: "translateSpeak", promptText: "She sings a song.", targetSentence: "சீதா பாட்டு பாடுகிறாள்.", hint: "Translate to Tamil" },
      { id: 9, type: "translateSpeak", promptText: "Today the weather is good.", targetSentence: "இன்று வானிலை நன்றாக உள்ளது.", hint: "Translate to Tamil" },
      { id: 10, type: "translateSpeak", promptText: "I like to eat fruits.", targetSentence: "எனக்கு பழங்கள் சாப்பிட பிடிக்கும்.", hint: "Translate to Tamil" }
    ] : [
      { id: 1, type: "listenRepeat", sentence: "The sun shines bright.", translation: "The sun shines bright." },
      { id: 2, type: "listenRepeat", sentence: "I love reading books.", translation: "I love reading books." },
      { id: 3, type: "listenRepeat", sentence: "Water is clean and fresh.", translation: "Water is clean and fresh." },
      { id: 4, type: "listenRepeat", sentence: "Practice makes perfect.", translation: "Practice makes perfect." },
      { id: 5, type: "speakReply", promptText: "Hello! How are you doing?", replyText: "I am doing well, thank you.", translation: "I am doing well, thank you." },
      { id: 6, type: "speakReply", promptText: "What is your favorite subject?", replyText: "I really enjoy learning languages.", translation: "I really enjoy learning languages." },
      { id: 7, type: "speakReply", promptText: "Would you like to read now?", replyText: "Yes, let us read a story together.", translation: "Yes, let us read a story together." },
      { id: 8, type: "translateSpeak", promptText: "वह स्कूल जाता है।", targetSentence: "He goes to school.", hint: "Translate to English" },
      { id: 9, type: "translateSpeak", promptText: "आज मौसम अच्छा है।", targetSentence: "Today the weather is good.", hint: "Translate to English" },
      { id: 10, type: "translateSpeak", promptText: "मुझे फल खाना पसंद है।", targetSentence: "I like to eat fruits.", hint: "Translate to English" }
    ];
    return { questions: speakQuestions };
  }

  if (practiceType === "Read Practice") {
    const sunMcq = READ_QUESTIONS.sun_mcq[uiLang] || READ_QUESTIONS.sun_mcq.English;
    const lionPass = READ_QUESTIONS.lion_passage[uiLang] || READ_QUESTIONS.lion_passage.English;
    const dogPass = READ_QUESTIONS.dog_passage[uiLang] || READ_QUESTIONS.dog_passage.English;
    const bookPrompt = READ_QUESTIONS.book_img[uiLang] || READ_QUESTIONS.book_img.English;
    const sunPrompt = READ_QUESTIONS.sun_img[uiLang] || READ_QUESTIONS.sun_img.English;
    const fillBlankDirHint = uiLang === "Hindi" ? "दिशा से संबंधित" : uiLang === "Kannada" ? "ದಿಕ್ಕಿನ ಸೂಚನೆ" : uiLang === "Telugu" ? "దిశకు సంబంధించి" : uiLang === "Tamil" ? "திசை பற்றிய குறிப்பு" : "A cardinal direction";
    const fillBlankWaterHint = uiLang === "Hindi" ? "पेय पदार्थ" : uiLang === "Kannada" ? "ಪಾನೀಯ" : uiLang === "Telugu" ? "పానీయం" : uiLang === "Tamil" ? "பானம்" : "Essential liquid";

    const readingQuestions = targetLang === "Hindi" ? [
      { id: 1, type: "mcq", question: sunMcq.q, options: ["पूर्व", "पश्चिम", "उत्तर", "दक्षिण"], correctIndex: 0, explanation: sunMcq.exp },
      { id: 2, type: "fillBlank", sentence: "सूरज पूर्व से ___ है।", answer: "उगता", hint: fillBlankDirHint },
      { id: 3, type: "passage", passage: "एक जंगल में एक शेर रहता था। वह बहुत शक्तिशाली था। सभी जानवर उससे डरते थे।", question: lionPass.q, options: lionPass.opt, correctIndex: 0, explanation: lionPass.exp },
      { id: 4, type: "matchingPairs", pairs: [{ left: "विद्यालय", right: "School" }, { left: "बाज़ार", right: "Market" }, { left: "मित्र", right: "Friend" }, { left: "घर", right: "Home" }] },
      { id: 5, type: "imageChoice", word: "किताब", prompt: bookPrompt, options: ["📚", "🍎", "🏫"], correctIndex: 0 },
      { id: 6, type: "fillBlank", sentence: "हमें हर दिन स्वच्छ ___ पीना चाहिए।", answer: "पानी", hint: fillBlankWaterHint },
      { id: 7, type: "meaning", phrase: "पुस्तकालय", options: ["A place with books to read or borrow", "A place where students study", "A place to buy things"], correctIndex: 0 },
      { id: 8, type: "passage", passage: "राजू के पास एक सुंदर कुत्ता है। उसका नाम शेरू है। राजू उसके साथ खेलता है।", question: dogPass.q, options: dogPass.opt, correctIndex: 0, explanation: dogPass.exp },
      { id: 9, type: "matchingPairs", pairs: [{ left: "जल", right: "Water" }, { left: "अग्नि", right: "Fire" }, { left: "वायु", right: "Air" }, { left: "आकाश", right: "Sky" }] },
      { id: 10, type: "imageChoice", word: "सूरज", prompt: sunPrompt, options: ["🌞", "🌙", "⭐"], correctIndex: 0 }
    ] : targetLang === "Kannada" ? [
      { id: 1, type: "mcq", question: sunMcq.q, options: ["ಪೂರ್ವ", "ಪಶ್ಚಿಮ", "ಉತ್ತರ", "ದಕ್ಷಿಣ"], correctIndex: 0, explanation: sunMcq.exp },
      { id: 2, type: "fillBlank", sentence: "ಸೂರ್ಯನು ಪೂರ್ವದಲ್ಲಿ ___.", answer: "ಉದಯಿಸುತ್ತಾನೆ", hint: fillBlankDirHint },
      { id: 3, type: "passage", passage: "ಒಂದು ಕಾಡಿನಲ್ಲಿ ಸಿಂಹವಿತ್ತು. ಅದು ತುಂಬಾ ಬಲಶಾಲಿಯಾಗಿತ್ತು. ಎಲ್ಲಾ ಪ್ರಾಣಿಗಳು ಅದಕ್ಕೆ ಹೆದರುತ್ತಿದ್ದವು.", question: lionPass.q, options: lionPass.opt, correctIndex: 0, explanation: lionPass.exp },
      { id: 4, type: "matchingPairs", pairs: [{ left: "ಶಾಲೆ", right: "School" }, { left: "ಮಾರುಕಟ್ಟೆ", right: "Market" }, { left: "ಸ್ನೇಹಿತ", right: "Friend" }, { left: "ಮನೆ", right: "Home" }] },
      { id: 5, type: "imageChoice", word: "ಪುಸ್ತಕ", prompt: bookPrompt, options: ["📚", "🍎", "🏫"], correctIndex: 0 },
      { id: 6, type: "fillBlank", sentence: "ನಾವು ಪ್ರತಿದಿನ ___ ಕುಡಿಯಬೇಕು.", answer: "ನೀರು", hint: fillBlankWaterHint },
      { id: 7, type: "meaning", phrase: "ಗ್ರಂಥಾಲಯ", options: ["A place with books to read or borrow", "A place where students study", "A place to buy things"], correctIndex: 0 },
      { id: 8, type: "passage", passage: "ರಾಜು ಬಳಿ ಒಂದು ಸುಂದರ ನಾಯಿ ಇದೆ. ಅದರ ಹೆಸರು ಶೇರು. ರಾಜು ಅದರೊಂದಿಗೆ ಆಟವಾಡುತ್ತಾನೆ.", question: dogPass.q, options: dogPass.opt, correctIndex: 0, explanation: dogPass.exp },
      { id: 9, type: "matchingPairs", pairs: [{ left: "ನೀರು", right: "Water" }, { left: "ಬೆಂಕಿ", right: "Fire" }, { left: "ಗಾಳಿ", right: "Air" }, { left: "ಆಕಾಶ", right: "Sky" }] },
      { id: 10, type: "imageChoice", word: "ಸೂರ್ಯ", prompt: sunPrompt, options: ["🌞", "🌙", "⭐"], correctIndex: 0 }
    ] : targetLang === "Telugu" ? [
      { id: 1, type: "mcq", question: sunMcq.q, options: ["తూర్పు", "పడమర", "ఉత్తరం", "దక్షిణం"], correctIndex: 0, explanation: sunMcq.exp },
      { id: 2, type: "fillBlank", sentence: "సూర్యుడు తూర్పున ___.", answer: "ఉదయిస్తాడు", hint: fillBlankDirHint },
      { id: 3, type: "passage", passage: "ఒక అడవిలో సింహం ఉండేది. అది చాలా శక్తివంతమైనది. జంతువులన్నీ దానికి భయపడేవి.", question: lionPass.q, options: lionPass.opt, correctIndex: 0, explanation: lionPass.exp },
      { id: 4, type: "matchingPairs", pairs: [{ left: "పాఠశాల", right: "School" }, { left: "మార్కెట్", right: "Market" }, { left: "స్నేహితుడు", right: "Friend" }, { left: "ఇల్లు", right: "Home" }] },
      { id: 5, type: "imageChoice", word: "పుస్తకం", prompt: bookPrompt, options: ["📚", "🍎", "🏫"], correctIndex: 0 },
      { id: 6, type: "fillBlank", sentence: "మనం ప్రతిరోజూ శుభ్రమైన ___ తాగాలి.", answer: "నీరు", hint: fillBlankWaterHint },
      { id: 7, type: "meaning", phrase: "గ్రంథాలయం", options: ["A place with books to read or borrow", "A place where students study", "A place to buy things"], correctIndex: 0 },
      { id: 8, type: "passage", passage: "రాజు దగ్గర ఒక అందమైన కుక్క ఉంది. దాని పేరు షేరు. రాజు దానితో ఆడుకుంటాడు.", question: dogPass.q, options: dogPass.opt, correctIndex: 0, explanation: dogPass.exp },
      { id: 9, type: "matchingPairs", pairs: [{ left: "నీరు", right: "Water" }, { left: "నిప్పు", right: "Fire" }, { left: "గాలి", right: "Air" }, { left: "ఆకాశం", right: "Sky" }] },
      { id: 10, type: "imageChoice", word: "సూర్యుడు", prompt: sunPrompt, options: ["🌞", "🌙", "⭐"], correctIndex: 0 }
    ] : targetLang === "Tamil" ? [
      { id: 1, type: "mcq", question: sunMcq.q, options: ["கிழக்கு", "மேற்கு", "வடக்கு", "தெற்கு"], correctIndex: 0, explanation: sunMcq.exp },
      { id: 2, type: "fillBlank", sentence: "சூரியன் கிழக்கில் ___.", answer: "உதிக்கிறது", hint: fillBlankDirHint },
      { id: 3, type: "passage", passage: "ஒரு காட்டில் ஒரு சிங்கம் வாழ்ந்தது. அது மிகவும் பலசாலி. அனைத்து விலங்குகளும் அதைக் கண்டு அஞ்சின.", question: lionPass.q, options: lionPass.opt, correctIndex: 0, explanation: lionPass.exp },
      { id: 4, type: "matchingPairs", pairs: [{ left: "பள்ளி", right: "School" }, { left: "சந்தை", right: "Market" }, { left: "நண்பன்", right: "Friend" }, { left: "வீடு", right: "Home" }] },
      { id: 5, type: "imageChoice", word: "புத்தகம்", prompt: bookPrompt, options: ["📚", "🍎", "🏫"], correctIndex: 0 },
      { id: 6, type: "fillBlank", sentence: "நாம் தினமும் சுத்தமான ___ குடிக்க வேண்டும்.", answer: "தண்ணீர்", hint: fillBlankWaterHint },
      { id: 7, type: "meaning", phrase: "நூலகம்", options: ["A place with books to read or borrow", "A place where students study", "A place to buy things"], correctIndex: 0 },
      { id: 8, type: "passage", passage: "ராஜுவிடம் ஒரு அழகான நாய் உள்ளது. அதன் பெயர் ஷேரு. ராஜு அதனுடன் விளையாடுகிறான்.", question: dogPass.q, options: dogPass.opt, correctIndex: 0, explanation: dogPass.exp },
      { id: 9, type: "matchingPairs", pairs: [{ left: "தண்ணீர்", right: "Water" }, { left: "நெருப்பு", right: "Fire" }, { left: "காற்று", right: "Air" }, { left: "வானம்", right: "Sky" }] },
      { id: 10, type: "imageChoice", word: "சூரியன்", prompt: sunPrompt, options: ["🌞", "🌙", "⭐"], correctIndex: 0 }
    ] : [
      { id: 1, type: "mcq", question: sunMcq.q, options: ["East", "West", "North", "South"], correctIndex: 0, explanation: sunMcq.exp },
      { id: 2, type: "fillBlank", sentence: "The sun rises in the ___.", answer: "east", hint: fillBlankDirHint },
      { id: 3, type: "passage", passage: "A lion lived in a forest. It was very strong. All animals were afraid of it.", question: lionPass.q, options: lionPass.opt, correctIndex: 0, explanation: lionPass.exp },
      { id: 4, type: "matchingPairs", pairs: [{ left: "School", right: "A place to learn" }, { left: "Market", right: "A place to buy things" }, { left: "Friend", right: "A person you like" }, { left: "Home", right: "Where you live" }] },
      { id: 5, type: "imageChoice", word: "Book", prompt: bookPrompt, options: ["📚", "🍎", "🏫"], correctIndex: 0 },
      { id: 6, type: "fillBlank", sentence: "We should drink clean ___ every day.", answer: "water", hint: fillBlankWaterHint },
      { id: 7, type: "meaning", phrase: "Library", options: ["A place with books to read or borrow", "A place where students study", "A place to buy things"], correctIndex: 0 },
      { id: 8, type: "passage", passage: "Raju has a beautiful dog. Its name is Sheru. Raju plays with it.", question: dogPass.q, options: dogPass.opt, correctIndex: 0, explanation: dogPass.exp },
      { id: 9, type: "matchingPairs", pairs: [{ left: "Water", right: "Liquid to drink" }, { left: "Fire", right: "Hot flame" }, { left: "Air", right: "Gas to breathe" }, { left: "Sky", right: "Blue space above" }] },
      { id: 10, type: "imageChoice", word: "Sun", prompt: sunPrompt, options: ["🌞", "🌙", "⭐"], correctIndex: 0 }
    ];
    return { questions: readingQuestions };
  }

  if (practiceType === "Write Practice") {
    const getHint = (key) => UNSCRAMBLE_HINTS[key]?.[uiLang] || UNSCRAMBLE_HINTS[key]?.English;
    const getTracingInfo = (char) => (TRACING_INFOS[uiLang] || TRACING_INFOS.English)(char);
    const getTransPrompt = (key) => TRANSLATION_PROMPTS[key]?.[uiLang] || TRANSLATION_PROMPTS[key]?.English;

    const getWordTracingInfo = (word) => {
      if (uiLang === "Hindi") return `शब्द '${word}' लिखें`;
      if (uiLang === "Kannada") return `${word} ಪದವನ್ನು ಬರೆಯಿರಿ`;
      if (uiLang === "Telugu") return `${word} పదాన్ని రాయండి`;
      if (uiLang === "Tamil") return `${word} வார்த்தையை எழுதவும்`;
      return `Write the word '${word}'`;
    };

    const writingQuestions = targetLang === "Hindi" ? [
      // 4 Tracing Questions (2 Letter, 2 Word)
      { id: 1, type: "tracing", letter: "क", word: "कमल", emoji: "🪷", englishWord: "Lotus", info: getTracingInfo("क"), sound: "क" },
      { id: 2, type: "tracing", letter: "म", word: "मोर", emoji: "🦚", englishWord: "Peacock", info: getTracingInfo("म"), sound: "म" },
      { id: 3, type: "tracing", word: "पानी", emoji: "💧", englishWord: "Water", info: getWordTracingInfo("पानी"), sound: "पानी" },
      { id: 4, type: "tracing", word: "सूरज", emoji: "☀️", englishWord: "Sun", info: getWordTracingInfo("सूरज"), sound: "सूरज" },
      // 3 Unscramble Questions
      { id: 5, type: "unscramble", hint: getHint("school"), emoji: "🏫", answer: "स्कूल", tiles: ["स्", "कू", "ल"] },
      { id: 6, type: "unscramble", hint: getHint("apple"), emoji: "🍎", answer: "सेब", tiles: ["से", "ब"] },
      { id: 7, type: "unscramble", hint: getHint("book"), emoji: "📚", answer: "किताब", tiles: ["कि", "ता", "ब"] },
      // 3 Arrange / Translation Questions
      { id: 8, type: "translationTask", prompt: getTransPrompt("school"), englishTranslation: "our school is beautiful", targetSentence: "हमारा स्कूल सुंदर है", tiles: ["हमारा", "स्कूल", "सुंदर", "है", "घर", "बड़ा"] },
      { id: 9, type: "translationTask", prompt: getTransPrompt("cat"), englishTranslation: "this is a cat", targetSentence: "यह एक बिल्ली है", tiles: ["यह", "एक", "बिल्ली", "है", "कुत्ता", "छोटा"] },
      { id: 10, type: "translationTask", prompt: getTransPrompt("sun"), englishTranslation: "the sun rises in the east", targetSentence: "सूरज पूर्व से उगता है", tiles: ["सूरज", "पूर्व", "से", "उगता", "है", "पश्चिम"] }
    ] : targetLang === "Kannada" ? [
      // 4 Tracing Questions (2 Letter, 2 Word)
      { id: 1, type: "tracing", letter: "ಕ", word: "ಕಮಲ", emoji: "🪷", englishWord: "Lotus", info: getTracingInfo("ಕ"), sound: "ಕ" },
      { id: 2, type: "tracing", letter: "ಮ", word: "ಮನೆ", emoji: "🏠", englishWord: "House", info: getTracingInfo("ಮ"), sound: "ಮ" },
      { id: 3, type: "tracing", word: "ನೀರು", emoji: "💧", englishWord: "Water", info: getWordTracingInfo("ನೀರು"), sound: "ನೀರು" },
      { id: 4, type: "tracing", word: "ಸೂರ್ಯ", emoji: "☀️", englishWord: "Sun", info: getWordTracingInfo("ಸೂರ್ಯ"), sound: "ಸೂರ್ಯ" },
      // 3 Unscramble Questions
      { id: 5, type: "unscramble", hint: getHint("school"), emoji: "🏫", answer: "ಶಾಲೆ", tiles: ["ಶಾ", "ಲೆ"] },
      { id: 6, type: "unscramble", hint: getHint("apple"), emoji: "🍎", answer: "ಸೇಬು", tiles: ["ಸೇ", "ಬು"] },
      { id: 7, type: "unscramble", hint: getHint("book"), emoji: "📚", answer: "ಪುಸ್ತಕ", tiles: ["ಪು", "ಸ್ತ", "ಕ"] },
      // 3 Arrange / Translation Questions
      { id: 8, type: "translationTask", prompt: getTransPrompt("school"), englishTranslation: "our school is beautiful", targetSentence: "ನಮ್ಮ ಶಾಲೆ ಸುಂದರವಾಗಿದೆ", tiles: ["ನಮ್ಮ", "ಶಾಲೆ", "ಸುಂದರವಾಗಿದೆ", "ಮನೆ", "ಒಳ್ಳೆಯ", "ದೊಡ್ಡ"] },
      { id: 9, type: "translationTask", prompt: getTransPrompt("cat"), englishTranslation: "this is a cat", targetSentence: "ಇದು ಒಂದು ಬೆಕ್ಕು", tiles: ["ಇದು", "ಒಂದು", "ಬೆಕ್ಕು", "ನಾಯಿ", "ಚಿಕ್ಕ", "ಹಾಲು"] },
      { id: 10, type: "translationTask", prompt: getTransPrompt("sun"), englishTranslation: "the sun rises in the east", targetSentence: "ಸೂರ್ಯನು ಪೂರ್ವದಲ್ಲಿ ಉದಯಿಸುತ್ತಾನೆ", tiles: ["ಸೂರ್ಯನು", "ಪೂರ್ವದಲ್ಲಿ", "ಉದಯಿಸುತ್ತಾನೆ", "ಪಶ್ಚಿಮದಲ್ಲಿ", "ರಾತ್ರಿ", "ಚಂದ್ರ"] }
    ] : targetLang === "Telugu" ? [
      // 4 Tracing Questions (2 Letter, 2 Word)
      { id: 1, type: "tracing", letter: "క", word: "కమలం", emoji: "🪷", englishWord: "Lotus", info: getTracingInfo("క"), sound: "క" },
      { id: 2, type: "tracing", letter: "మ", word: "ఇల్లు", emoji: "🏠", englishWord: "House", info: getTracingInfo("మ"), sound: "మ" },
      { id: 3, type: "tracing", word: "నీరు", emoji: "💧", englishWord: "Water", info: getWordTracingInfo("నీరు"), sound: "నీరు" },
      { id: 4, type: "tracing", word: "సూర్యుడు", emoji: "☀️", englishWord: "Sun", info: getWordTracingInfo("సూర్యుడు"), sound: "సూర్యుడు" },
      // 3 Unscramble Questions
      { id: 5, type: "unscramble", hint: getHint("school"), emoji: "🏫", answer: "బడి", tiles: ["బ", "డి"] },
      { id: 6, type: "unscramble", hint: getHint("apple"), emoji: "🍎", answer: "ఆపిల్", tiles: ["ఆ", "పి", "ల్"] },
      { id: 7, type: "unscramble", hint: getHint("book"), emoji: "📚", answer: "పుస్తకం", tiles: ["పు", "స్త", "కం"] },
      // 3 Arrange / Translation Questions
      { id: 8, type: "translationTask", prompt: getTransPrompt("school"), englishTranslation: "our school is beautiful", targetSentence: "మా బడి చాలా అందంగా ఉంటుంది", tiles: ["మా", "బడి", "చాలా", "అందంగా", "ఉంటుంది", "ఇల్లు"] },
      { id: 9, type: "translationTask", prompt: getTransPrompt("cat"), englishTranslation: "this is a cat", targetSentence: "ఇది ఒక పిల్లి", tiles: ["ఇది", "ఒక", "పిల్లి", "కుక్క", "చిన్న"] },
      { id: 10, type: "translationTask", prompt: getTransPrompt("sun"), englishTranslation: "the sun rises in the east", targetSentence: "సూర్యుడు తూర్పున ఉదయిస్తాడు", tiles: ["సూర్యుడు", "తూర్పున", "ఉదయిస్తాడు", "పశ్చిమాన", "రాత్రి"] }
    ] : targetLang === "Tamil" ? [
      // 4 Tracing Questions (2 Letter, 2 Word)
      { id: 1, type: "tracing", letter: "க", word: "கமலம்", emoji: "🪷", englishWord: "Lotus", info: getTracingInfo("க"), sound: "க" },
      { id: 2, type: "tracing", letter: "ம", word: "மரம்", emoji: "🌳", englishWord: "Tree", info: getTracingInfo("ம"), sound: "ம" },
      { id: 3, type: "tracing", word: "நீர்", emoji: "💧", englishWord: "Water", info: getWordTracingInfo("நீர்"), sound: "நீர்" },
      { id: 4, type: "tracing", word: "சூரியன்", emoji: "☀️", englishWord: "Sun", info: getWordTracingInfo("சூரியன்"), sound: "சூரியன்" },
      // 3 Unscramble Questions
      { id: 5, type: "unscramble", hint: getHint("school"), emoji: "🏫", answer: "பள்ளி", tiles: ["பள்", "ளி"] },
      { id: 6, type: "unscramble", hint: getHint("apple"), emoji: "🍎", answer: "ஆப்பிள்", tiles: ["ஆப்", "பி", "ள்"] },
      { id: 7, type: "unscramble", hint: getHint("book"), emoji: "📚", answer: "புத்தகம்", tiles: ["புத்", "த", "கம்"] },
      // 3 Arrange / Translation Questions
      { id: 8, type: "translationTask", prompt: getTransPrompt("school"), englishTranslation: "our school is beautiful", targetSentence: "எங்கள் பள்ளி அழகாக இருக்கிறது", tiles: ["எங்கள்", "பள்ளி", "அழகாக", "இருக்கிறது", "வீடு"] },
      { id: 9, type: "translationTask", prompt: getTransPrompt("cat"), englishTranslation: "this is a cat", targetSentence: "இது ஒரு பூனை", tiles: ["இது", "ஒரு", "பூனை", "நாய்", "சின்ன"] },
      { id: 10, type: "translationTask", prompt: getTransPrompt("sun"), englishTranslation: "the sun rises in the east", targetSentence: "சூரியன் கிழக்கில் உதிக்கிறது", tiles: ["சூரியன்", "கிழக்கில்", "உதிக்கிறது", "மேற்கில்", "இரவு"] }
    ] : [
      // 4 Tracing Questions (2 Letter, 2 Word)
      { id: 1, type: "tracing", letter: "B", word: "Ball", emoji: "⚽", englishWord: "Ball", info: getTracingInfo("B"), sound: "B" },
      { id: 2, type: "tracing", letter: "C", word: "Cat", emoji: "🐱", englishWord: "Cat", info: getTracingInfo("C"), sound: "C" },
      { id: 3, type: "tracing", word: "Water", emoji: "💧", englishWord: "Water", info: getWordTracingInfo("Water"), sound: "Water" },
      { id: 4, type: "tracing", word: "Sun", emoji: "☀️", englishWord: "Sun", info: getWordTracingInfo("Sun"), sound: "Sun" },
      // 3 Unscramble Questions
      { id: 5, type: "unscramble", hint: getHint("school"), emoji: "🏫", answer: "SCHOOL", tiles: ["L", "O", "C", "S", "H", "O"] },
      { id: 6, type: "unscramble", hint: getHint("apple"), emoji: "🍎", answer: "APPLE", tiles: ["P", "L", "A", "P", "E"] },
      { id: 7, type: "unscramble", hint: getHint("book"), emoji: "📚", answer: "BOOK", tiles: ["K", "O", "B", "O"] },
      // 3 Arrange / Translation Questions
      { id: 8, type: "translationTask", prompt: getTransPrompt("school"), englishTranslation: "our school is beautiful", targetSentence: "our school is beautiful", tiles: ["our", "school", "is", "beautiful", "good", "house"] },
      { id: 9, type: "translationTask", prompt: getTransPrompt("cat"), englishTranslation: "this is a cat", targetSentence: "this is a cat", tiles: ["this", "is", "a", "cat", "dog", "rat"] },
      { id: 10, type: "translationTask", prompt: getTransPrompt("sun"), englishTranslation: "the sun rises in the east", targetSentence: "the sun rises in the east", tiles: ["the", "sun", "rises", "in", "the", "east", "west"] }
    ];
    return { questions: writingQuestions };
  }

  if (practiceType === "Word Sprint") {
    const getSprintHint = (key) => WORD_SPRINT_HINTS[key]?.[uiLang] || WORD_SPRINT_HINTS[key]?.English;
    const list = targetLang === "Hindi" ? [
      { word: "सेब", emoji: "🍎", hint: getSprintHint("apple") },
      { word: "पुल", emoji: "🌉", hint: getSprintHint("bridge") },
      { word: "बादल", emoji: "☁️", hint: getSprintHint("cloud") },
      { word: "सपना", emoji: "💭", hint: getSprintHint("dream") },
      { word: "पृथ्वी", emoji: "🌍", hint: getSprintHint("earth") },
      { word: "आग", emoji: "🔥", hint: getSprintHint("fire") },
      { word: "बगीचा", emoji: "🌷", hint: getSprintHint("garden") },
      { word: "खुश", emoji: "😊", hint: getSprintHint("happy") },
      { word: "द्वीप", emoji: "🏝️", hint: getSprintHint("island") },
      { word: "जंगल", emoji: "🌿", hint: getSprintHint("jungle") }
    ] : targetLang === "Kannada" ? [
      { word: "ಸೇಬು", emoji: "🍎", hint: getSprintHint("apple") },
      { word: "ಸೇತುವೆ", emoji: "🌉", hint: getSprintHint("bridge") },
      { word: "ಮೋಡ", emoji: "☁️", hint: getSprintHint("cloud") },
      { word: "ಕನಸು", emoji: "💭", hint: getSprintHint("dream") },
      { word: "ಭೂಮಿ", emoji: "🌍", hint: getSprintHint("earth") },
      { word: "ಬೆಂಕಿ", emoji: "🔥", hint: getSprintHint("fire") },
      { word: "ತೋಟ", emoji: "🌷", hint: getSprintHint("garden") },
      { word: "ಸಂತೋಷ", emoji: "😊", hint: getSprintHint("happy") },
      { word: "ದ್ವೀಪ", emoji: "🏝️", hint: getSprintHint("island") },
      { word: "ಅರಣ್ಯ", emoji: "🌿", hint: getSprintHint("jungle") }
    ] : targetLang === "Telugu" ? [
      { word: "ఆపిల్", emoji: "🍎", hint: getSprintHint("apple") },
      { word: "వంతెన", emoji: "🌉", hint: getSprintHint("bridge") },
      { word: "మేఘం", emoji: "☁️", hint: getSprintHint("cloud") },
      { word: "కల", emoji: "💭", hint: getSprintHint("dream") },
      { word: "భూమి", emoji: "🌍", hint: getSprintHint("earth") },
      { word: "నిప్పు", emoji: "🔥", hint: getSprintHint("fire") },
      { word: "తోట", emoji: "🌷", hint: getSprintHint("garden") },
      { word: "సంతోషం", emoji: "😊", hint: getSprintHint("happy") },
      { word: "ద్వీపం", emoji: "🏝️", hint: getSprintHint("island") },
      { word: "అడవి", emoji: "🌿", hint: getSprintHint("jungle") }
    ] : targetLang === "Tamil" ? [
      { word: "ஆப்பிள்", emoji: "🍎", hint: getSprintHint("apple") },
      { word: "பாலம்", emoji: "🌉", hint: getSprintHint("bridge") },
      { word: "மேகம்", emoji: "☁️", hint: getSprintHint("cloud") },
      { word: "கனவு", emoji: "💭", hint: getSprintHint("dream") },
      { word: "பூமி", emoji: "🌍", hint: getSprintHint("earth") },
      { word: "நெருப்பு", emoji: "🔥", hint: getSprintHint("fire") },
      { word: "தோட்டம்", emoji: "🌷", hint: getSprintHint("garden") },
      { word: "மகிழ்ச்சி", emoji: "😊", hint: getSprintHint("happy") },
      { word: "தீவு", emoji: "🏝️", hint: getSprintHint("island") },
      { word: "காடு", emoji: "🌿", hint: getSprintHint("jungle") }
    ] : [
      { word: "apple", emoji: "🍎", hint: getSprintHint("apple") },
      { word: "bridge", emoji: "🌉", hint: getSprintHint("bridge") },
      { word: "cloud", emoji: "☁️", hint: getSprintHint("cloud") },
      { word: "dream", emoji: "💭", hint: getSprintHint("dream") },
      { word: "earth", emoji: "🌍", hint: getSprintHint("earth") },
      { word: "fire", emoji: "🔥", hint: getSprintHint("fire") },
      { word: "garden", emoji: "🌷", hint: getSprintHint("garden") },
      { word: "happy", emoji: "😊", hint: getSprintHint("happy") },
      { word: "island", emoji: "🏝️", hint: getSprintHint("island") },
      { word: "jungle", emoji: "🌿", hint: getSprintHint("jungle") }
    ];
    return { questions: list };
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
    ] : language === "Kannada" ? [
      { id: 1, word: "ಪುಸ್ತಕ", emoji: "📚", translation: "Book", sentence: "ಇದು ಒಂದು ಒಳ್ಳೆಯ ಪುಸ್ತಕ. (This is a good book.)" },
      { id: 2, word: "ಶಾಲೆ", emoji: "🏫", translation: "School", sentence: "ಮಕ್ಕಳು ಶಾಲೆಗೆ ಹೋಗುತ್ತಿದ್ದಾರೆ. (Children are going to school.)" },
      { id: 3, word: "ಸೇಬು", emoji: "🍎", translation: "Apple", sentence: "ಸೇಬು ಕೆಂಪು ಮತ್ತು ಸಿಹಿಯಾಗಿದೆ. (The apple is red and sweet.)" },
      { id: 4, word: "ನೀರು", emoji: "💧", translation: "Water", sentence: "ನಾವು ಶುದ್ಧ ನೀರನ್ನು ಕುಡಿಯಬೇಕು. (We should drink clean water.)" },
      { id: 5, word: "ಸೂರ್ಯ", emoji: "☀️", translation: "Sun", sentence: "ಇಂದು ಸೂರ್ಯ ತುಂಬಾ ಪ್ರಕಾಶಮಾನವಾಗಿದ್ದಾನೆ. (The sun is very bright today.)" },
      { id: 6, word: "ಸ್ನೇಹಿತ", emoji: "🧑‍🤝‍🧑", translation: "Friend", sentence: "ಅವನು ನನ್ನ ಉತ್ತಮ ಸ್ನೇಹಿತ. (He is my best friend.)" },
      { id: 7, word: "ಮನೆ", emoji: "🏠", translation: "House", sentence: "ಅವರು ದೊಡ್ಡ ಮನೆಯಲ್ಲಿ ವಾಸಿಸುತ್ತಿದ್ದಾರೆ. (They live in a big house.)" },
      { id: 8, word: "ಮರ", emoji: "🌳", translation: "Tree", sentence: "ಹಕ್ಕಿಗಳು ಮರದ ಮೇಲಿವೆ. (The birds are on the tree.)" },
      { id: 9, word: "ಹಣ್ಣು", emoji: "🍌", translation: "Fruit", sentence: "ನಮಗೆ ತಾಜಾ ಹಣ್ಣುಗಳನ್ನು ತಿನ್ನುವುದು ಇಷ್ಟ. (I love eating fresh fruit.)" },
      { id: 10, word: "ಸಂತೋಷ", emoji: "😊", translation: "Happy", sentence: "ಅವಳ ಕುಟುಂಬ ಸಂತೋಷವಾಗಿದೆ. (She has a happy family.)" }
    ] : language === "Telugu" ? [
      { id: 1, word: "పుస్తకం", emoji: "📚", translation: "Book", sentence: "ఇది ఒక మంచి పుస్తకం. (This is a good book.)" },
      { id: 2, word: "బడి", emoji: "🏫", translation: "School", sentence: "పిల్లలు బడికి వెళ్తున్నారు. (Children are going to school.)" },
      { id: 3, word: "ఆపిల్", emoji: "🍎", translation: "Apple", sentence: "ఆపిల్ ఎర్రగా మరియు తీపిగా ఉంటుంది. (The apple is red and sweet.)" },
      { id: 4, word: "నీరు", emoji: "💧", translation: "Water", sentence: "మనం శుభ్రమైన నీరు త్రాగాలి. (We should drink clean water.)" },
      { id: 5, word: "సూర్యుడు", emoji: "☀️", translation: "Sun", sentence: "ఈరోజు సూర్యుడు చాలా ప్రకాశవంతంగా ఉన్నాడు. (The sun is very bright today.)" },
      { id: 6, word: "స్నేహితుడు", emoji: "🧑‍🤝‍🧑", translation: "Friend", sentence: "అతడు నా బెస్ట్ ఫ్రెండ్. (He is my best friend.)" },
      { id: 7, word: "ఇల్లు", emoji: "🏠", translation: "House", sentence: "వారు పెద్ద ఇంట్లో నివసిస్తున్నారు. (They live in a big house.)" },
      { id: 8, word: "చెట్టు", emoji: "🌳", translation: "Tree", sentence: "పక్షులు చెట్టు మీద ఉన్నాయి. (The birds are on the tree.)" },
      { id: 9, word: "పండు", emoji: "🍌", translation: "Fruit", sentence: "నాకు తాజా పండ్లు తినడం ఇష్టం. (I love eating fresh fruit.)" },
      { id: 10, word: "సంతోషం", emoji: "😊", translation: "Happy", sentence: "ఆమెది సంతోషకరమైన కుటుంబం. (She has a happy family.)" }
    ] : language === "Tamil" ? [
      { id: 1, word: "புத்தகம்", emoji: "📚", translation: "Book", sentence: "இது ஒரு நல்ல புத்தகம். (This is a good book.)" },
      { id: 2, word: "பள்ளி", emoji: "🏫", translation: "School", sentence: "குழந்தைகள் பள்ளிக்குச் செல்கிறார்கள். (Children are going to school.)" },
      { id: 3, word: "ஆப்பிள்", emoji: "🍎", translation: "Apple", sentence: "ஆப்பிள் சிவப்பு மற்றும் இனிமையானது. (The apple is red and sweet.)" },
      { id: 4, word: "தண்ணீர்", emoji: "💧", translation: "Water", sentence: "நாம் சுத்தமான தண்ணீர் குடிக்க வேண்டும். (We should drink clean water.)" },
      { id: 5, word: "சூரியன்", emoji: "☀️", translation: "Sun", sentence: "இன்று சூரியன் மிகவும் பிரகாசமாக இருக்கிறது. (The sun is very bright today.)" },
      { id: 6, word: "நண்பன்", emoji: "🧑‍🤝‍🧑", translation: "Friend", sentence: "அவன் எனது சிறந்த நண்பன். (He is my best friend.)" },
      { id: 7, word: "வீடு", emoji: "🏠", translation: "House", sentence: "அவர்கள் ஒரு பெரிய வீட்டில் வாழ்கிறார்கள். (They live in a big house.)" },
      { id: 8, word: "மரம்", emoji: "🌳", translation: "Tree", sentence: "பறவைகள் மரத்தின் மேல் இருக்கின்றன. (The birds are on the tree.)" },
      { id: 9, word: "பழம்", emoji: "🍌", translation: "Fruit", sentence: "எனக்கு புதிய பழங்களை சாப்பிட பிடிக்கும். (I love eating fresh fruit.)" },
      { id: 10, word: "மகிழ்ச்சி", emoji: "😊", translation: "Happy", sentence: "அவளுக்கு ஒரு மகிழ்ச்சியான குடும்பம் உள்ளது. (She has a happy family.)" }
    ] : [
      { id: 1, word: "Book", emoji: "📚", translation: "Book", sentence: "This is a good book." },
      { id: 2, word: "School", emoji: "🏫", translation: "School", sentence: "Children are going to school." },
      { id: 3, word: "Apple", emoji: "🍎", translation: "Apple", sentence: "The apple is red and sweet." },
      { id: 4, word: "Water", emoji: "💧", translation: "Water", sentence: "We should drink clean water." },
      { id: 5, word: "Sun", emoji: "☀️", translation: "Sun", sentence: "The sun is very bright today." },
      { id: 6, word: "Friend", emoji: "🧑‍🤝‍🧑", translation: "Friend", sentence: "He is my best friend." },
      { id: 7, word: "House", emoji: "🏠", translation: "House", sentence: "They live in a big house." },
      { id: 8, word: "Tree", emoji: "🌳", translation: "Tree", sentence: "The birds are on the tree." },
      { id: 9, word: "Fruit", emoji: "🍌", translation: "Fruit", sentence: "I love eating fresh fruit." },
      { id: 10, word: "Happy", emoji: "😊", translation: "Happy", sentence: "She has a happy family." }
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
        options: ["एक किताब", "पानी", "एक खिलौना"],
        correctIndex: 0
      },
      { speaker: "रवि", text: "हमारे पास पास ही एक पुस्तकालय है। चलो वहाँ चलते हैं!", audioText: "हमारे पास पास ही एक पुस्तकालय है। चलो वहाँ चलते हैं!" },
      { speaker: "अना", text: "उस पेड़ को देखो! उस पर बड़े लाल सेब हैं।", audioText: "उस पेड़ को देखो! उस पर बड़े लाल सेब हैं।" },
      { speaker: "रवि", text: "हाँ, वे मीठे हैं। क्या तुम्हें एक चाहिए?", audioText: "हाँ, वे मीठे हैं। क्या तुम्हें एक चाहिए।" },
      {
        type: "question",
        question: "पेड़ पर कौन सा फल है?",
        options: ["आम", "सेब", "केला"],
        correctIndex: 1
      },
      { speaker: "अना", text: "हाँ, कृपया! मुझे मीठे सेब बहुत पसंद हैं।", audioText: "हाँ, कृपया! मुझे मीठे सेब बहुत पसंद हैं।" },
      { speaker: "रवि", text: "यह लो। अब, चलो वह किताब ढूंढते हैं।", audioText: "यह लो। अब, चलो वह किताब ढूंढते हैं।" },
      { speaker: "अना", text: "धन्यवाद, रवि! तुम बहुत अच्छे दोस्त हो।", audioText: "धन्यवाद, रवि! तुम बहुत अच्छे दोस्त हो।" }
    ] : language === "Kannada" ? [
      { speaker: "ಅನಾ", text: "ನಮಸ್ಕಾರ! ನನ್ನ ಹೆಸರು ಅನಾ.", audioText: "ನಮಸ್ಕಾರ! ನನ್ನ ಹೆಸರು ಅನಾ." },
      { speaker: "ರವಿ", text: "ನಮಸ್ಕಾರ ಅನಾ! ನಾನು ರವಿ. ನಮ್ಮ ಹಳ್ಳಿಗೆ ನಿಮಗೆ ಸ್ವಾಗತ.", audioText: "ನಮಸ್ಕಾರ ಅನಾ! ನಾನು ರವಿ. ನಮ್ಮ ಹಳ್ಳಿಗೆ ನಿಮಗೆ ಸ್ವಾಗತ." },
      { speaker: "ಅನಾ", text: "ಇಲ್ಲಿ ತುಂಬಾ ಸುಂದರವಾಗಿದೆ. ನನಗೆ ಒಂದು ಪುಸ್ತಕವನ್ನು ಓದಬೇಕು.", audioText: "ಇಲ್ಲಿ ತುಂಬಾ ಸುಂದರವಾಗಿದೆ. ನನಗೆ ಒಂದು ಪುಸ್ತಕವನ್ನು ಓದಬೇಕು." },
      {
        type: "question",
        question: "ಅನಾ ಏನು ಬಯಸುತ್ತಾಳೆ?",
        options: ["ಒಂದು ಪುಸ್ತಕ", "ನೀರು", "ಒಂದು ಆಟಿಕೆ"],
        correctIndex: 0
      },
      { speaker: "ರವಿ", text: "ನಮ್ಮ ಹತ್ತಿರವೇ ಒಂದು ಗ್ರಂಥಾಲಯವಿದೆ. ಬನ್ನಿ ಅಲ್ಲಿಗೆ ಹೋಗೋಣ!", audioText: "ನಮ್ಮ ಹತ್ತಿರವೇ ಒಂದು ಗ್ರಂಥಾಲಯವಿದೆ. ಬನ್ನಿ ಅಲ್ಲಿಗೆ ಹೋಗೋಣ!" },
      { speaker: "ಅನಾ", text: "ಆ ಮರವನ್ನು ನೋಡಿ! ಅದರ ಮೇಲೆ ದೊಡ್ಡ ಕೆಂಪು ಸೇಬುಗಳಿವೆ.", audioText: "ಆ ಮರವನ್ನು ನೋಡಿ! ಅದರ ಮೇಲೆ ದೊಡ್ಡ ಕೆಂಪು ಸೇಬುಗಳಿವೆ." },
      { speaker: "ರವಿ", text: "ಹೌದು, ಅವು ತುಂಬಾ ಸಿಹಿಯಾಗಿವೆ. ನಿಮಗೆ ಒಂದು ಬೇಕೇ?", audioText: "ಹೌದು, ಅವು ತುಂಬಾ ಸಿಹಿಯಾಗಿವೆ. ನಿಮಗೆ ಒಂದು ಬೇಕೇ?" },
      {
        type: "question",
        question: "ಮರದ ಮೇಲೆ ಯಾವ ಹಣ್ಣು ಇದೆ?",
        options: ["ಮಾವು", "ಸೇಬು", "ಬಾಳೆಹಣ್ಣು"],
        correctIndex: 1
      },
      { speaker: "ಅನಾ", text: "ಹೌದು, ದಯವಿಟ್ಟು! ನನಗೆ ಸಿಹಿ ಸೇಬುಗಳು ತುಂಬಾ ಇಷ್ಟ.", audioText: "ಹೌದು, ದಯವಿಟ್ಟು! ನನಗೆ ಸಿಹಿ ಸೇಬುಗಳು ತುಂಬಾ ಇಷ್ಟ." },
      { speaker: "ರವಿ", text: "ಇದು ತಗೊಳ್ಳಿ. ಈಗ, ಆ ಪುಸ್ತಕವನ್ನು ಹುಡುಕೋಣ.", audioText: "ಇದು ತಗೊಳ್ಳಿ. ಈಗ, ಆ ಪುಸ್ತಕವನ್ನು ಹುಡುಕೋಣ." },
      { speaker: "ಅನಾ", text: "ಧನ್ಯವಾದಗಳು, ರವಿ! ನೀವು ತುಂಬಾ ಒಳ್ಳೆಯ ಸ್ನೇಹಿತ.", audioText: "ಧನ್ಯವಾದಗಳು, ರವಿ! ನೀವು ತುಂಬಾ ಒಳ್ಳೆಯ ಸ್ನೇಹಿತ." }
    ] : language === "Telugu" ? [
      { speaker: "అనా", text: "నమస్కారం! నా పేరు అనా.", audioText: "నమస్కారం! నా పేరు అనా." },
      { speaker: "రవి", text: "నమస్కారం అనా! నేను రవి. మా ఊరికి మీకు స్వాగతం.", audioText: "నమస్కారం అనా! నేను రవి. మా ఊరికి మీకు స్వాగతం." },
      { speaker: "అనా", text: "ఇక్కడ చాలా అందంగా ఉంది. నేను ఒక పుస్తకం చదవాలనుకుంటున్నాను.", audioText: "ఇక్కడ చాలా అందంగా ఉంది. నేను ఒక పుస్తకం చదవాలనుకుంటున్నాను." },
      {
        type: "question",
        question: "అనా ఏమి కోరుకుంటుంది?",
        options: ["ఒక పుస్తకం", "నీరు", "ఒక బొమ్మ"],
        correctIndex: 0
      },
      { speaker: "రవి", text: "మాకు దగ్గరలోనే ఒక గ్రంథాలయం ఉంది. పదండి అక్కడికి వెళ్దాం!", audioText: "మాకు దగ్గరలోనే ఒక గ్రంథాలయం ఉంది. పదండి అక్కడికి వెళ్దాం!" },
      { speaker: "అనా", text: "ఆ చెట్టును చూడండి! దానిపై పెద్ద ఎర్రటి ఆపిల్స్ ఉన్నాయి.", audioText: "ఆ చెట్టును చూడండి! దానిపై పెద్ద ఎర్రటి ఆపిల్స్ ఉన్నాయి." },
      { speaker: "రవి", text: "అవును, అవి చాలా తీపిగా ఉంటాయి. మీకు ఒకటి కావాలా?", audioText: "అవును, అవి చాలా తీపిగా ఉంటాయి. మీకు ఒకటి కావాలా?" },
      {
        type: "question",
        question: "చెట్టు మీద ఏ పండు ఉంది?",
        options: ["మామిడి", "ఆపిల్", "అరటిపండు"],
        correctIndex: 1
      },
      { speaker: "అనా", text: "అవును, దయచేసి! నాకు తీపి ఆపిల్స్ అంటే చాలా ఇష్టం.", audioText: "అవును, దయచేసి! నాకు తీపి ఆపిల్స్ అంటే చాలా ఇష్టం." },
      { speaker: "రవి", text: "ఇదిగో తీసుకోండి. ఇప్పుడు, ఆ పుస్తకాన్ని వెతుకుదాం.", audioText: "ఇదిగో తీసుకోండి. ఇప్పుడు, ఆ పుస్తకాన్ని వెతుకుదాం." },
      { speaker: "అనా", text: "ధన్యవాదాలు, రవి! నువ్వు చాలా మంచి స్నేహితుడివి.", audioText: "ధన్యవాదాలు, రవి! నువ్వు చాలా మంచి స్నేహితుడివి." }
    ] : language === "Tamil" ? [
      { speaker: "அனா", text: "வணக்கம்! என் பெயர் அனா.", audioText: "வணக்கம்! என் பெயர் அனா." },
      { speaker: "ரவி", text: "வணக்கம் அனா! நான் ரவி. எங்கள் கிராமத்திற்கு உங்களை வரவேற்கிறேன்.", audioText: "வணக்கம் அனா! நான் ரவி. எங்கள் கிராமத்திற்கு உங்களை வரவேற்கிறேன்." },
      { speaker: "அனா", text: "இடம் மிகவும் அழகாக இருக்கிறது. நான் ஒரு புத்தகம் படிக்க விரும்புகிறேன்.", audioText: "இடம் மிகவும் அழகாக இருக்கிறது. நான் ஒரு புத்தகம் படிக்க விரும்புகிறேன்." },
      {
        type: "question",
        question: "அனா என்ன விரும்புகிறாள்?",
        options: ["ஒரு புத்தகம்", "தண்ணீர்", "ஒரு பொம்மை"],
        correctIndex: 0
      },
      { speaker: "ரவி", text: "அருகிலேயே ஒரு நூலகம் உள்ளது. வாருங்கள் அங்கே செல்வோம்!", audioText: "அருகிலேயே ஒரு நூலகம் உள்ளது. வாருங்கள் அங்கே செல்வோம்!" },
      { speaker: "அனா", text: "அந்த மரத்தைப் பாருங்கள்! அதில் பெரிய சிவப்பு ஆப்பிள்கள் உள்ளன.", audioText: "அந்த மரத்தைப் பாருங்கள்! அதில் பெரிய சிவப்பு ஆப்பிள்கள் உள்ளன." },
      { speaker: "ரவி", text: "ஆமாம், அவை மிகவும் இனிமையானவை. உங்களுக்கு ஒன்று வேண்டுமா?", audioText: "ஆமாம், அவை மிகவும் இனிமையானவை. உங்களுக்கு ஒன்று வேண்டுமா?" },
      {
        type: "question",
        question: "மரத்தில் என்ன பழம் இருக்கிறது?",
        options: ["மாம்பழம்", "ஆப்பிள்", "வாழைப்பழம்"],
        correctIndex: 1
      },
      { speaker: "அனா", text: "ஆமாம், தயவுசெய்து! எனக்கு இனிப்பான ஆப்பிள்கள் மிகவும் பிடிக்கும்.", audioText: "ஆமாம், தயவுசெய்து! எனக்கு இனிப்பான ஆப்பிள்கள் மிகவும் பிடிக்கும்." },
      { speaker: "ரவி", text: "இந்தாருங்கள். இப்போது, அந்தப் புத்தகத்தைக் கண்டுபிடிப்போம்.", audioText: "இந்தாருங்கள். இப்போது, அந்தப் புத்தகத்தைக் கண்டுபிடிப்போம்." },
      { speaker: "அனா", text: "நன்றி, ரவி! நீ ஒரு சிறந்த நண்பன்.", audioText: "நன்றி, ரவி! நீ ஒரு சிறந்த நண்பன்." }
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
    const getHint = (key) => UNSCRAMBLE_HINTS[key]?.[uiLang] || UNSCRAMBLE_HINTS[key]?.English;
    const getTracingInfo = (char) => (TRACING_INFOS[uiLang] || TRACING_INFOS.English)(char);
    const getTransPrompt = (key) => TRANSLATION_PROMPTS[key]?.[uiLang] || TRANSLATION_PROMPTS[key]?.English;

    const writingQuestions = targetLang === "Hindi" ? [
      { id: 1, type: "unscramble", hint: getHint("school"), emoji: "<ctrl42>", answer: "स्कूल", tiles: ["स्", "कू", "ल"] },
      { id: 2, type: "tracing", letter: "क", word: "कमल", info: getTracingInfo("क"), sound: "Kamal" },
      { id: 3, type: "translationTask", prompt: getTransPrompt("school"), englishTranslation: "our school is beautiful", targetSentence: "हमारा स्कूल सुंदर है", tiles: ["हमारा", "स्कूल", "सुंदर", "है", "घर", "बड़ा"] },
      { id: 4, type: "unscramble", hint: getHint("apple"), emoji: "🍎", answer: "सेब", tiles: ["से", "ब"] },
      { id: 5, type: "tracing", letter: "म", word: "मोर", info: getTracingInfo("म"), sound: "Mor" },
      { id: 6, type: "translationTask", prompt: getTransPrompt("cat"), englishTranslation: "this is a cat", targetSentence: "यह एक बिल्ली है", tiles: ["यह", "एक", "बिल्ली", "है", "कुत्ता", "छोटा"] },
      { id: 7, type: "unscramble", hint: getHint("book"), emoji: "📚", answer: "किताब", tiles: ["कि", "ता", "ब"] },
      { id: 8, type: "tracing", letter: "प", word: "पानी", info: getTracingInfo("प"), sound: "Paani" },
      { id: 9, type: "unscramble", hint: getHint("sun"), emoji: "🌞", answer: "सूरज", tiles: ["सू", "र", "ज"] },
      { id: 10, type: "translationTask", prompt: getTransPrompt("sun"), englishTranslation: "the sun rises in the east", targetSentence: "सूरज पूर्व से उगता है", tiles: ["सूरज", "पूर्व", "से", "उगता", "है", "पश्चिम"] }
    ] : targetLang === "Kannada" ? [
      { id: 1, type: "unscramble", hint: getHint("school"), emoji: "🏫", answer: "ಶಾಲೆ", tiles: ["ಶಾ", "ಲೆ"] },
      { id: 2, type: "tracing", letter: "ಕ", word: "ಕಮಲ", info: getTracingInfo("ಕ"), sound: "Kamala" },
      { id: 3, type: "translationTask", prompt: getTransPrompt("school"), englishTranslation: "our school is beautiful", targetSentence: "ನಮ್ಮ ಶಾಲೆ ಸುಂದರವಾಗಿದೆ", tiles: ["ನಮ್ಮ", "ಶಾಲೆ", "ಸುಂದರವಾಗಿದೆ", "ಮನೆ", "ಒಳ್ಳೆಯ", "ದೊಡ್ಡ"] },
      { id: 4, type: "unscramble", hint: getHint("apple"), emoji: "🍎", answer: "ಸೇಬು", tiles: ["ಸೇ", "ಬು"] },
      { id: 5, type: "tracing", letter: "ಮ", word: "ಮನೆ", info: getTracingInfo("ಮ"), sound: "Mane" },
      { id: 6, type: "translationTask", prompt: getTransPrompt("cat"), englishTranslation: "this is a cat", targetSentence: "ಇದು ಒಂದು ಬೆಕ್ಕು", tiles: ["ಇದು", "ಒಂದು", "ಬೆಕ್ಕು", "ನಾಯಿ", "ಚಿಕ್ಕ", "ಹಾಲು"] },
      { id: 7, type: "unscramble", hint: getHint("book"), emoji: "📚", answer: "ಪುಸ್ತಕ", tiles: ["ಪು", "ಸ್ತ", "ಕ"] },
      { id: 8, type: "tracing", letter: "ನ", word: "ನೀರು", info: getTracingInfo("ನ"), sound: "Neeru" },
      { id: 9, type: "unscramble", hint: getHint("sun"), emoji: "🌞", answer: "ಸೂರ್ಯ", tiles: ["ಸೂ", "ರ್ಯ"] },
      { id: 10, type: "translationTask", prompt: getTransPrompt("sun"), englishTranslation: "the sun rises in the east", targetSentence: "ಸೂರ್ಯನು ಪೂರ್ವದಲ್ಲಿ ಉದಯಿಸುತ್ತಾನೆ", tiles: ["ಸೂರ್ಯನು", "ಪೂರ್ವದಲ್ಲಿ", "ಉದಯಿಸುತ್ತಾನೆ", "ಪಶ್ಚಿಮದಲ್ಲಿ", "ರಾತ್ರಿ", "ಚಂದ್ರ"] }
    ] : targetLang === "Telugu" ? [
      { id: 1, type: "unscramble", hint: getHint("school"), emoji: "🏫", answer: "బడి", tiles: ["బ", "డి"] },
      { id: 2, type: "tracing", letter: "క", word: "కమలం", info: getTracingInfo("క"), sound: "Kamalam" },
      { id: 3, type: "translationTask", prompt: getTransPrompt("school"), englishTranslation: "our school is beautiful", targetSentence: "మా బడి చాలా అందంగా ఉంటుంది", tiles: ["మా", "బడి", "చాలా", "అందంగా", "ఉంటుంది", "ఇల్లు"] },
      { id: 4, type: "unscramble", hint: getHint("apple"), emoji: "🍎", answer: "ఆపిల్", tiles: ["ఆ", "పి", "ల్"] },
      { id: 5, type: "tracing", letter: "మ", word: "ఇల్లు", info: getTracingInfo("ఇ"), sound: "Illu" },
      { id: 6, type: "translationTask", prompt: getTransPrompt("cat"), englishTranslation: "this is a cat", targetSentence: "ఇది ఒక పిల్లి", tiles: ["ఇది", "ఒక", "పిల్లి", "కుక్క", "చిన్న"] },
      { id: 7, type: "unscramble", hint: getHint("book"), emoji: "📚", answer: "పుస్తకం", tiles: ["పు", "స్త", "కం"] },
      { id: 8, type: "tracing", letter: "న", word: "నీరు", info: getTracingInfo("న"), sound: "Neeru" },
      { id: 9, type: "unscramble", hint: getHint("sun"), emoji: "🌞", answer: "సూర్యుడు", tiles: ["సూ", "ర్యు", "డు"] },
      { id: 10, type: "translationTask", prompt: getTransPrompt("sun"), englishTranslation: "the sun rises in the east", targetSentence: "సూర్యుడు తూర్పున ఉదయిస్తాడు", tiles: ["సూర్యుడు", "తూర్పున", "ఉదయిస్తాడు", "పశ్చిమాన", "రాత్రి"] }
    ] : targetLang === "Tamil" ? [
      { id: 1, type: "unscramble", hint: getHint("school"), emoji: "🏫", answer: "பள்ளி", tiles: ["பள்", "ளி"] },
      { id: 2, type: "tracing", letter: "க", word: "கமலம்", info: getTracingInfo("க"), sound: "Kamalam" },
      { id: 3, type: "translationTask", prompt: getTransPrompt("school"), englishTranslation: "our school is beautiful", targetSentence: "எங்கள் பள்ளி அழகாக இருக்கிறது", tiles: ["எங்கள்", "பள்ளி", "அழகாக", "இருக்கிறது", "வீடு"] },
      { id: 4, type: "unscramble", hint: getHint("apple"), emoji: "🍎", answer: "ஆப்பிள்", tiles: ["ஆப்", "பி", "ள்"] },
      { id: 5, type: "tracing", letter: "ம", word: "மரம்", info: getTracingInfo("ம"), sound: "Maram" },
      { id: 6, type: "translationTask", prompt: getTransPrompt("cat"), englishTranslation: "this is a cat", targetSentence: "இது ஒரு பூனை", tiles: ["இது", "ஒரு", "பூனை", "நாய்", "சின்ன"] },
      { id: 7, type: "unscramble", hint: getHint("book"), emoji: "📚", answer: "புத்தகம்", tiles: ["புத்", "த", "கம்"] },
      { id: 8, type: "tracing", letter: "ந", word: "நீர்", info: getTracingInfo("ந"), sound: "Neer" },
      { id: 9, type: "unscramble", hint: getHint("sun"), emoji: "🌞", answer: "சூரியன்", tiles: ["சூ", "ரி", "யன்"] },
      { id: 10, type: "translationTask", prompt: getTransPrompt("sun"), englishTranslation: "the sun rises in the east", targetSentence: "சூரியன் கிழக்கில் உதிக்கிறது", tiles: ["சூரியன்", "கிழக்கில்", "உதிக்கிறது", "மேற்கில்", "இரவு"] }
    ] : [
      { id: 1, type: "unscramble", hint: getHint("school"), emoji: "🏫", answer: "SCHOOL", tiles: ["L", "O", "C", "S", "H", "O"] },
      { id: 2, type: "tracing", letter: "B", word: "Ball", info: getTracingInfo("B"), sound: "Ball" },
      { id: 3, type: "translationTask", prompt: getTransPrompt("school"), englishTranslation: "our school is beautiful", targetSentence: "our school is beautiful", tiles: ["our", "school", "is", "beautiful", "good", "house"] },
      { id: 4, type: "unscramble", hint: getHint("apple"), emoji: "🍎", answer: "APPLE", tiles: ["P", "L", "A", "P", "E"] },
      { id: 5, type: "tracing", letter: "C", word: "Cat", info: getTracingInfo("C"), sound: "Cat" },
      { id: 6, type: "translationTask", prompt: getTransPrompt("cat"), englishTranslation: "this is a cat", targetSentence: "this is a cat", tiles: ["this", "is", "a", "cat", "dog", "rat"] },
      { id: 7, type: "unscramble", hint: getHint("book"), emoji: "📚", answer: "BOOK", tiles: ["K", "O", "B", "O"] },
      { id: 8, type: "tracing", letter: "D", word: "Dog", info: getTracingInfo("D"), sound: "Dog" },
      { id: 9, type: "unscramble", hint: getHint("sun"), emoji: "🌞", answer: "SUN", tiles: ["N", "S", "U"] },
      { id: 10, type: "translationTask", prompt: getTransPrompt("sun"), englishTranslation: "the sun rises in the east", targetSentence: "the sun rises in the east", tiles: ["the", "sun", "rises", "in", "the", "east", "west"] }
    ];
    return { questions: writingQuestions };
  }

  if (practiceType === "Word Sprint") {
    const list = language === "Hindi" ? [
      { word: "सेब", emoji: "🍎", hint: "एक लाल या हरा फल" },
      { word: "पुल", emoji: "🌉", hint: "आप इससे पानी पार करते हैं" },
      { word: "बादल", emoji: "☁️", hint: "आसमान में पाया जाता है" },
      { word: "सपना", emoji: "💭", hint: "सोते समय जो आप देखते हैं" },
      { word: "पृथ्वी", emoji: "🌍", hint: "हमारा गृह ग्रह" },
      { word: "आग", emoji: "🔥", hint: "गर्म और चमकदार" },
      { word: "बगीचा", emoji: "🌷", hint: "जहाँ फूल उगते हैं" },
      { word: "खुश", emoji: "😊", hint: "एक आनंदमय भावना" },
      { word: "द्वीप", emoji: "🏝️", hint: "पानी से घिरी भूमि" },
      { word: "जंगल", emoji: "🌿", hint: "एक घना उष्णकटिबंधीय वन" }
    ] : language === "Kannada" ? [
      { word: "ಸೇಬು", emoji: "🍎", hint: "ಒಂದು ಕೆಂಪು ಅಥವಾ ಹಸಿರು ಹಣ್ಣು" },
      { word: "ಸೇತುವೆ", emoji: "🌉", hint: "ನೀವು ಇದರ ಮೇಲೆ ನೀರನ್ನು ದಾಟುತ್ತೀರಿ" },
      { word: "ಮೋಡ", emoji: "☁️", hint: "ಆಕಾಶದಲ್ಲಿ ಕಂಡುಬರುತ್ತದೆ" },
      { word: "ಕನಸು", emoji: "💭", hint: "ನಿದ್ರಿಸುವಾಗ ನೀವು ಕಾಣುವ ದೃಶ್ಯ" },
      { word: "ಭೂಮಿ", emoji: "🌍", hint: "ನಮ್ಮ ವಾಸಸ್ಥಾನ ಗ್ರಹ" },
      { word: "ಬೆಂಕಿ", emoji: "🔥", hint: "ಬಿಸಿ ಮತ್ತು ಪ್ರಕಾಶಮಾನ" },
      { word: "ತೋಟ", emoji: "🌷", hint: "ಹೂವುಗಳು ಬೆಳೆಯುವ ಸ್ಥಳ" },
      { word: "ಸಂತೋಷ", emoji: "😊", hint: "ಆನಂದದಾಯಕ ಭಾವನೆ" },
      { word: "ದ್ವೀಪ", emoji: "🏝️", hint: "ನೀರಿನಿಂದ ಆவೃತವಾದ ಭೂಮಿ" },
      { word: "ಅರಣ್ಯ", emoji: "🌿", hint: "ದಟ್ಟವಾದ ಉಷ್ಣವಲಯದ ಕಾಡು" }
    ] : language === "Telugu" ? [
      { word: "ఆపిల్", emoji: "🍎", hint: "ఒక ఎరుపు లేదా ఆకుపచ్చ పండు" },
      { word: "వంతెన", emoji: "🌉", hint: "దీనిపై నీటిని దాటుతాము" },
      { word: "మేఘం", emoji: "☁️", hint: "ఆకాశంలో కనిపిస్తుంది" },
      { word: "కల", emoji: "💭", hint: "నిద్రపోతున్నప్పుడు వచ్చేది" },
      { word: "భూమి", emoji: "🌍", hint: "మన నివాస గ్రహం" },
      { word: "నిప్పు", emoji: "🔥", hint: "వేడిగా మరియు ప్రకాశవంతంగా ఉంటుంది" },
      { word: "తోట", emoji: "🌷", hint: "పువ్వులు పెరిగే స్థలం" },
      { word: "సంతోషం", emoji: "😊", hint: "ఒక ఆనందకరమైన అనుభూతి" },
      { word: "ద్వీపం", emoji: "🏝️", hint: "నీటితో చుట్టబడిన భూమి" },
      { word: "అడవి", emoji: "🌿", hint: "దట్టమైన ఉష్ణమండల అరణ్యం" }
    ] : language === "Tamil" ? [
      { word: "ஆப்பிள்", emoji: "🍎", hint: "ஒரு சிவப்பு அல்லது பச்சை பழம்" },
      { word: "பாலம்", emoji: "🌉", hint: "இதன் மூலம் நீங்கள் நீரை கடக்கலாம்" },
      { word: "மேகம்", emoji: "☁️", hint: "வானத்தில் காணப்படும்" },
      { word: "கனவு", emoji: "💭", hint: "தூங்கும் போது நீங்கள் காண்பது" },
      { word: "பூமி", emoji: "🌍", hint: "நமது தாய் கிரகம்" },
      { word: "நெருப்பு", emoji: "🔥", hint: "வெப்பமான மற்றும் பிரகாசமானது" },
      { word: "தோட்டம்", emoji: "🌷", hint: "பூக்கள் வளரும் இடம்" },
      { word: "மகிழ்ச்சி", emoji: "😊", hint: "ஒரு மகிழ்ச்சியான உணர்வு" },
      { word: "தீவு", emoji: "🏝️", hint: "நீரால் சூழப்பட்ட நிலப்பகுதி" },
      { word: "காடு", emoji: "🌿", hint: "அடர்ந்த வெப்பமண்டல காடு" }
    ] : [
      { word: "apple", emoji: "🍎", hint: "A red or green fruit" },
      { word: "bridge", emoji: "🌉", hint: "You cross water on it" },
      { word: "cloud", emoji: "☁️", hint: "Found in the sky" },
      { word: "dream", emoji: "💭", hint: "What you see when sleeping" },
      { word: "earth", emoji: "🌍", hint: "Our home planet" },
      { word: "fire", emoji: "🔥", hint: "Hot and bright" },
      { word: "garden", emoji: "🌷", hint: "Where flowers grow" },
      { word: "happy", emoji: "😊", hint: "A joyful feeling" },
      { word: "island", emoji: "🏝️", hint: "Land surrounded by water" },
      { word: "jungle", emoji: "🌿", hint: "A dense tropical forest" }
    ];
    return { questions: list };
  }

  if (practiceType === "Word Scramble") {
    const list = targetLang === "Hindi" ? [
      { word: "मुस्कान", tiles: ["मु", "स्का", "न"], category: "Emotions", emoji: "😊" },
      { word: "साफ़", tiles: ["सा", "फ़"], category: "Adjectives", emoji: "✨" },
      { word: "रोटी", tiles: ["रो", "टी"], category: "Food", emoji: "🍞" },
      { word: "पौधा", tiles: ["पौ", "धा"], category: "Nature", emoji: "🌱" },
      { word: "ग्लोब", tiles: ["ग्लो", "ब"], category: "World", emoji: "🌍" },
      { word: "संगीत", tiles: ["सं", "गी", "त"], category: "Arts", emoji: "🎵" },
      { word: "प्रकाश", tiles: ["प्र", "का", "श"], category: "Science", emoji: "💡" },
      { word: "खुश", tiles: ["खु", "श"], category: "Emotions", emoji: "😄" },
      { word: "नदी", tiles: ["न", "दी"], category: "Nature", emoji: "🏞️" },
      { word: "सपना", tiles: ["स", "प", "ना"], category: "Concepts", emoji: "💭" }
    ] : targetLang === "Kannada" ? [
      { word: "ನಗು", tiles: ["ನ", "ಗು"], category: "Emotions", emoji: "😊" },
      { word: "ಸ್ವಚ್ಛ", tiles: ["ಸ್ವ", "ಚ್ಛ"], category: "Adjectives", emoji: "✨" },
      { word: "ರೊಟ್ಟಿ", tiles: ["ರೊ", "ಟ್ಟಿ"], category: "Food", emoji: "🍞" },
      { word: "ಗಿಡ", tiles: ["ಗಿ", "ಡ"], category: "Nature", emoji: "🌱" },
      { word: "ಭೂಗೋಳ", tiles: ["ಭೂ", "ಗೋ", "ಳ"], category: "World", emoji: "🌍" },
      { word: "ಸಂಗೀತ", tiles: ["ಸಂ", "ಗೀ", "ತ"], category: "Arts", emoji: "🎵" },
      { word: "ಬೆಳಕು", tiles: ["ಬೆ", "ಳ", "ಕು"], category: "Science", emoji: "💡" },
      { word: "ಖುಷಿ", tiles: ["ಖು", "ಷಿ"], category: "Emotions", emoji: "😄" },
      { word: "ನದಿ", tiles: ["ನ", "ದಿ"], category: "Nature", emoji: "🏞️" },
      { word: "ಕನಸು", tiles: ["ಕ", "ನ", "ಸು"], category: "Concepts", emoji: "💭" }
    ] : targetLang === "Telugu" ? [
      { word: "నవ్వు", tiles: ["న", "వ్వు"], category: "Emotions", emoji: "😊" },
      { word: "శుభ్రం", tiles: ["శు", "భ్రం"], category: "Adjectives", emoji: "✨" },
      { word: "రొట్టె", tiles: ["రొ", "ట్టె"], category: "Food", emoji: "🍞" },
      { word: "మొక్క", tiles: ["మొ", "క్క"], category: "Nature", emoji: "🌱" },
      { word: "గ్లోబ్", tiles: ["గ్లో", "బ్"], category: "World", emoji: "🌍" },
      { word: "సంగీతం", tiles: ["సం", "గీ", "తం"], category: "Arts", emoji: "🎵" },
      { word: "వెలుగు", tiles: ["వె", "లు", "గు"], category: "Science", emoji: "💡" },
      { word: "సంతోషం", tiles: ["సం", "తో", "షం"], category: "Emotions", emoji: "😄" },
      { word: "నది", tiles: ["న", "ది"], category: "Nature", emoji: "🏞️" },
      { word: "కల", tiles: ["క", "ల"], category: "Concepts", emoji: "💭" }
    ] : targetLang === "Tamil" ? [
      { word: "நகை", tiles: ["ந", "கை"], category: "Emotions", emoji: "😊" },
      { word: "சுத்தம்", tiles: ["சுத்", "தம்"], category: "Adjectives", emoji: "✨" },
      { word: "ரொட்டி", tiles: ["ரொத்", "தி"], category: "Food", emoji: "🍞" },
      { word: "செடி", tiles: ["செ", "டி"], category: "Nature", emoji: "🌱" },
      { word: "உலகம்", tiles: ["உ", "ல", "கம்"], category: "World", emoji: "🌍" },
      { word: "இசை", tiles: ["இ", "சை"], category: "Arts", emoji: "🎵" },
      { word: "ஒளி", tiles: ["ஒ", "ளி"], category: "Science", emoji: "💡" },
      { word: "மகிழ்ச்சி", tiles: ["ம", "கிழ்", "ச்சி"], category: "Emotions", emoji: "😄" },
      { word: "ஆறு", tiles: ["ஆ", "று"], category: "Nature", emoji: "🏞️" },
      { word: "கனவு", tiles: ["க", "ன", "வு"], category: "Concepts", emoji: "💭" }
    ] : [
      { word: "LEARN", tiles: ["L", "E", "A", "R", "N"], category: "Education", emoji: "📚" },
      { word: "SPEAK", tiles: ["S", "P", "E", "A", "K"], category: "Skills", emoji: "🗣️" },
      { word: "WRITE", tiles: ["W", "R", "I", "T", "E"], category: "Skills", emoji: "✍️" },
      { word: "STORY", tiles: ["S", "T", "O", "R", "Y"], category: "Language", emoji: "📖" },
      { word: "BRAVE", tiles: ["B", "R", "A", "V", "E"], category: "Traits", emoji: "🦁" },
      { word: "SMILE", tiles: ["S", "M", "I", "L", "E"], category: "Emotions", emoji: "😊" },
      { word: "CLEAN", tiles: ["C", "L", "E", "A", "N"], category: "Adjectives", emoji: "✨" },
      { word: "BREAD", tiles: ["B", "R", "E", "A", "D"], category: "Food", emoji: "🍞" },
      { word: "PLANT", tiles: ["P", "L", "A", "N", "T"], category: "Nature", emoji: "🌱" },
      { word: "GLOBE", tiles: ["G", "L", "O", "B", "E"], category: "World", emoji: "🌍" }
    ];
    return { questions: list };
  }

  if (practiceType === "Memory Match") {
    const list = targetLang === "Hindi" ? [
      { id: "apple", emoji: "🍎", word: "सेब" },
      { id: "book", emoji: "📚", word: "किताब" },
      { id: "cat", emoji: "🐱", word: "बिल्ली" },
      { id: "door", emoji: "🚪", word: "दरवाजा" },
      { id: "eye", emoji: "👁️", word: "आँख" },
      { id: "fire", emoji: "🔥", word: "आग" },
      { id: "gift", emoji: "🎁", word: "उपहार" },
      { id: "heart", emoji: "❤️", word: "दिल" }
    ] : targetLang === "Kannada" ? [
      { id: "apple", emoji: "🍎", word: "ಸೇಬು" },
      { id: "book", emoji: "📚", word: "ಪುಸ್ತಕ" },
      { id: "cat", emoji: "🐱", word: "ಬೆಕ್ಕು" },
      { id: "door", emoji: "🚪", word: "ಬಾಗಿಲು" },
      { id: "eye", emoji: "👁️", word: "ಕಣ್ಣು" },
      { id: "fire", emoji: "🔥", word: "ಬೆಂಕಿ" },
      { id: "gift", emoji: "🎁", word: "ಉಡುಗೊರೆ" },
      { id: "heart", emoji: "❤️", word: "ಹೃದಯ" }
    ] : targetLang === "Telugu" ? [
      { id: "apple", emoji: "🍎", word: "ఆపిల్" },
      { id: "book", emoji: "📚", word: "పుస్తకం" },
      { id: "cat", emoji: "🐱", word: "పిల్లి" },
      { id: "door", emoji: "🚪", word: "తలుపు" },
      { id: "eye", emoji: "👁️", word: "కన్ను" },
      { id: "fire", emoji: "🔥", word: "నిప్పు" },
      { id: "gift", emoji: "🎁", word: "బహుమతి" },
      { id: "heart", emoji: "❤️", word: "గుండె" }
    ] : targetLang === "Tamil" ? [
      { id: "apple", emoji: "🍎", word: "ஆப்பிள்" },
      { id: "book", emoji: "📚", word: "புத்தகம்" },
      { id: "cat", emoji: "🐱", word: "பூனை" },
      { id: "door", emoji: "🚪", word: "கதவு" },
      { id: "eye", emoji: "👁️", word: "கண்" },
      { id: "fire", emoji: "🔥", word: "நெருப்பு" },
      { id: "gift", emoji: "🎁", word: "பரிசு" },
      { id: "heart", emoji: "❤️", word: "இதயம்" }
    ] : [
      { id: "apple", emoji: "🍎", word: "APPLE" },
      { id: "book", emoji: "📚", word: "BOOK" },
      { id: "cat", emoji: "🐱", word: "CAT" },
      { id: "door", emoji: "🚪", word: "DOOR" },
      { id: "eye", emoji: "👁️", word: "EYE" },
      { id: "fire", emoji: "🔥", word: "FIRE" },
      { id: "gift", emoji: "🎁", word: "GIFT" },
      { id: "heart", emoji: "❤️", word: "HEART" }
    ];
    return { questions: list };
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

  return rawPractice;
};

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
  if (localStorage.getItem("lisa_ai_enabled") === "false") return text;
  
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
  if (localStorage.getItem("lisa_ai_enabled") === "false") {
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

const FALLBACK_TRANSLATIONS = {
  "English": {
    "noun_question": "Which of these is a noun?",
    "noun_exp": "Book is the name of an object, so it is a noun.",
    "verb_question": "He _____ to school.",
    "verb_exp": "With masculine singular subject, 'goes' (ಹೋಗುತ್ತಾನೆ / जाता है) is used.",
    "fill_blank_hint": "A game played with a ball",
    "reading_question_ram": "Where does Ram go every morning?",
    "meaning_phrase_santosha": "Happiness",
    "meaning_options_santosha": ["Feeling good and cheerful", "Being sad", "Being tired", "Being hungry"],
    "unscramble_hint_apple": "A red color fruit",
    "image_choice_car": "Tap the picture of the car",
    "complete_chat_q": "Choose the correct response to complete the conversation",
    "scenario_text": "You are buying a book at a local shop. The shopkeeper smiles and hands you the book.",
    "scenario_q": "What should you say to the shopkeeper?",
    "match_school": "The place where we learn",
    "match_book": "We read it for knowledge",
    "match_boy": "A young male child",
    "match_water": "A clear liquid we drink",
    "tracing_q": "Write the word 'home'",
    "listen_word_q": "Which word did you hear?",
    "listen_passage_q": "What does Ram like to do at school?",
    "explanation_kannada": "This lesson is about basics. Here you will learn basic literacy skills.",
    "explanation_hindi": "This lesson is about basics. Here you will learn basic literacy skills.",
    "explanation_telugu": "This lesson is about basics. Here you will learn basic literacy skills.",
    "explanation_tamil": "This lesson is about basics. Here you will learn basic literacy skills.",
    "translate_prompt": "Arrange the words to form a sentence.",
    "meaning_phrase_library": "Library",
    "meaning_phrase_school": "School"
  },
  "Hindi": {
    "noun_question": "इनमें से कौन सा एक संज्ञा (Noun) है?",
    "noun_exp": "किताब एक वस्तु का नाम है, इसलिए यह संज्ञा है।",
    "verb_question": "वह स्कूल _____ है।",
    "verb_exp": "पुल्लिंग एकवचन कर्ता के साथ 'जाता है' का प्रयोग होता है।",
    "fill_blank_hint": "गेंद के साथ खेला जाने वाला खेल",
    "reading_question_ram": "राम हर सुबह कहाँ जाता है?",
    "meaning_phrase_santosha": "खुशी / संतोष",
    "meaning_options_santosha": ["अच्छा और प्रसन्न महसूस करना", "उदास होना", "थका हुआ होना", "भूखा होना"],
    "unscramble_hint_apple": "एक लाल रंग का फल",
    "image_choice_car": "कार वाले चित्र पर टैप करें",
    "complete_chat_q": "बातचीत पूरी करने के लिए सही प्रतिक्रिया चुनें",
    "scenario_text": "आप एक स्थानीय दुकान पर एक किताब खरीद रहे हैं। दुकानदार मुस्कुराता है और आपको किताब देता है।",
    "scenario_q": "आपको दुकानदार से क्या कहना चाहिए?",
    "match_school": "वह स्थान जहाँ हम सीखते हैं",
    "match_book": "हम इसे ज्ञान के लिए पढ़ते हैं",
    "match_boy": "एक युवा लड़का",
    "match_water": "एक साफ तरल जिसे हम पीते हैं",
    "tracing_q": "शब्द 'घर' लिखें",
    "listen_word_q": "आपने कौन सा शब्द सुना?",
    "listen_passage_q": "राम स्कूल में क्या करना पसंद करता है?",
    "explanation_kannada": "यह पाठ बुनियादी साक्षरता कौशल के बारे में है। यहाँ आप बुनियादी बातें सीखेंगे।",
    "explanation_hindi": "यह पाठ बुनियादी साक्षरता कौशल के बारे में है। यहाँ आप बुनियादी बातें सीखेंगे।",
    "explanation_telugu": "यह पाठ बुनियादी साक्षरता कौशल के बारे में है। यहाँ आप बुनियादी बातें सीखेंगे।",
    "explanation_tamil": "यह पाठ बुनियादी साक्षरता कौशल के बारे में है। यहाँ आप बुनियादी बातें सीखेंगे।",
    "translate_prompt": "एक वाक्य बनाने के लिए शब्दों को व्यवस्थित करें।",
    "meaning_phrase_library": "पुस्तकालय",
    "meaning_phrase_school": "विद्यालय"
  },
  "Kannada": {
    "noun_question": "ಇವುಗಳಲ್ಲಿ ಯಾವುದು ನಾಮಪದ (Noun)?",
    "noun_exp": "ಪುಸ್ತಕ ಒಂದು ವಸ್ತುವಿನ ಹೆಸರು, ಆದ್ದರಿಂದ ಇದು ನಾಮಪದ.",
    "verb_question": "ಅವನು ಶಾಲೆಗೆ _____.",
    "verb_exp": "ಪುಲ್ಲಿಂಗ ಏಕವಚನ ಕರ್ತೃವಿನೊಂದಿಗೆ 'ಹೋಗುತ್ತಾನೆ' ಬಳಸಲಾಗುತ್ತದೆ.",
    "fill_blank_hint": "ಚೆಂಡಿನ ಆಟ",
    "reading_question_ram": "ರಾಮ್ ಪ್ರತಿದಿನ ಬೆಳಿಗ್ಗೆ ಎಲ್ಲಿಗೆ ಹೋಗುತ್ತಾನೆ?",
    "meaning_phrase_santosha": "ಸಂತೋಷ",
    "meaning_options_santosha": ["ಉತ್ತಮ ಮತ್ತು ಪ್ರಸನ್ನವಾಗಿರುವುದು", "ದುಃಖವಾಗಿರುವುದು", "ಸುಸ್ತಾಗಿರುವುದು", "ಹಸಿದಿರುವುದು"],
    "unscramble_hint_apple": "ಒಂದು ಕೆಂಪು ಹಣ್ಣು",
    "image_choice_car": "ಕಾರು ಇರುವ ಚಿತ್ರವನ್ನು ಟ್ಯಾಪ್ ಮಾಡಿ",
    "complete_chat_q": "ಸಂಭಾಷಣೆಯನ್ನು ಪೂರ್ಣಗೊಳಿಸಲು ಸರಿಯಾದ ಉತ್ತರವನ್ನು ಆರಿಸಿ",
    "scenario_text": "ನೀವು ಸ್ಥಳೀಯ ಅಂಗಡಿಯೊಂದರಲ್ಲಿ ಪುಸ್ತಕವನ್ನು ಖರೀದಿಸುತ್ತಿದ್ದೀರಿ. ಅಂಗಡಿಯವನು ಮುಗುಳ್ನಕ್ಕು ನಿಮಗೆ ಪುಸ್ತಕವನ್ನು ನೀಡುತ್ತಾನೆ.",
    "scenario_q": "ನೀವು ಅಂಗಡಿಯವನಿಗೆ ಏನು ಹೇಳಬೇಕು?",
    "match_school": "ನಾವು ಕಲಿಯುವ ಸ್ಥಳ",
    "match_book": "ನಾವು ಜ್ಞಾನಕ್ಕಾಗಿ ಓದುತ್ತೇವೆ",
    "match_boy": "ಕಿರಿಯ ಗಂಡು ಮಗು",
    "match_water": "ನಾವು ಕುಡಿಯುವ ದ್ರವ",
    "tracing_q": "ಮನೆ ಪದವನ್ನು ಬರೆಯಿರಿ",
    "listen_word_q": "ನೀವು ಯಾವ ಪದವನ್ನು ಕೇಳಿದ್ದೀರಿ?",
    "listen_passage_q": "ರಾಮ್ ಶಾಲೆಯಲ್ಲಿ ಏನು ಮಾಡಲು ಇಷ್ಟಪಡುತ್ತಾನೆ?",
    "explanation_kannada": "ಈ ಪಾಠವು ಮೂಲಭೂತ ಸಂಗತಿಗಳು ಬಗ್ಗೆ ಇದೆ. ಇಲ್ಲಿ ನೀವು ಮೂಲ ಸಾಕ್ಷರತಾ ಕೌಶಲ್ಯಗಳನ್ನು ಕಲಿಯುವಿರಿ.",
    "explanation_hindi": "ಈ ಪಾಠವು ಮೂಲಭೂತ ಸಂಗತಿಗಳು ಬಗ್ಗೆ ಇದೆ. ಇಲ್ಲಿ ನೀವು ಮೂಲ ಸಾಕ್ಷರತಾ ಕೌಶಲ್ಯಗಳನ್ನು ಕಲಿಯುವಿರಿ.",
    "explanation_telugu": "ಈ ಪಾಠವು ಮೂಲಭೂತ ಸಂಗತಿಗಳು ಬಗ್ಗೆ ಇದೆ. ಇಲ್ಲಿ ನೀವು ಮೂಲ ಸಾಕ್ಷರತಾ ಕೌಶಲ್ಯಗಳನ್ನು ಕಲಿಯುವಿರಿ.",
    "explanation_tamil": "ಈ ಪಾಠವು ಮೂಲಭೂತ ಸಂಗತಿಗಳು ಬಗ್ಗೆ ಇದೆ. ಇಲ್ಲಿ ನೀವು ಮೂಲ ಸಾಕ್ಷರತಾ ಕೌಶಲ್ಯಗಳನ್ನು ಕಲಿಯುವಿರಿ.",
    "translate_prompt": "ಒಂದು ವಾಕ್ಯವನ್ನು ರೂಪಿಸಲು ಪದಗಳನ್ನು ಜೋಡಿಸಿ.",
    "meaning_phrase_library": "ಗ್ರಂಥಾಲಯ",
    "meaning_phrase_school": "ಶಾಲೆ"
  },
  "Tamil": {
    "noun_question": "இவற்றில் எது பெயர்ச்சொல் (Noun)?",
    "noun_exp": "புத்தகம் ஒரு பொருளின் பெயர், எனவே இது பெயர்ச்சொல்.",
    "verb_question": "அவன் பள்ளிக்கு _____.",
    "verb_exp": "ஆண்பால் ஒருமை எழுவாயுடன் 'செல்கிறான்' பயன்படுத்தப்படுகிறது.",
    "fill_blank_hint": "பந்து விளையாட்டு",
    "reading_question_ram": "ராம் தினமும் காலையில் எங்கே செல்கிறான்?",
    "meaning_phrase_santosha": "மகிழ்ச்சி",
    "meaning_options_santosha": ["நன்றாகவும் மகிழ்ச்சியாகவும் உணர்வது", "சோகமாக இருப்பது", "சோர்வாக இருப்பது", "பசியாக இருப்பது"],
    "unscramble_hint_apple": "ஒரு சிவப்பு பழம்",
    "image_choice_car": "கார் இருக்கும் படத்தை தட்டவும்",
    "complete_chat_q": "உரையாடலை முடிக்க சரியான பதிலைத் தேர்ந்தெடுக்கவும்",
    "scenario_text": "நீங்கள் ஒரு உள்ளூர் கடையில் புத்தகம் வாங்குகிறீர்கள். கடைக்காரர் புன்னகைத்து உங்களுக்கு புத்தகத்தை தருகிறார்.",
    "scenario_q": "நீங்கள் கடைக்காரரிடம் என்ன சொல்ல வேண்டும்?",
    "match_school": "நாங்கள் படிக்கும் இடம்",
    "match_book": "நாங்கள் அறிவுக்காகப் படிக்கிறோம்",
    "match_boy": "ஒரு இளம் ஆண் குழந்தை",
    "match_water": "நாங்கள் குடிக்கும் திரவம்",
    "tracing_q": "வீடு வார்த்தையை எழுதவும்",
    "listen_word_q": "நீங்கள் எந்த வார்த்தையைக் கேட்டீர்கள்?",
    "listen_passage_q": "ராம் பள்ளியில் என்ன செய்ய விரும்புகிறான்?",
    "explanation_kannada": "இந்த பாடம் அடிப்படை திறன்களைப் பற்றியது. இங்கே நீங்கள் அடிப்படைகளைக் கற்றுக்கொள்வீர்கள்.",
    "explanation_hindi": "இந்த பாடம் அடிப்படை திறன்களைப் பற்றியது. இங்கே நீங்கள் அடிப்படைகளைக் கற்றுக்கொள்வீர்கள்.",
    "explanation_telugu": "இந்த பாடம் அடிப்படை திறன்களைப் பற்றியது. இங்கே நீங்கள் அடிப்படைகளைக் கற்றுக்கொள்வீர்கள்.",
    "explanation_tamil": "இந்த பாடம் அடிப்படை திறன்களைப் பற்றியது. இங்கே நீங்கள் அடிப்படைகளைக் கற்றுக்கொள்வீர்கள்.",
    "translate_prompt": "ஒரு வாக்கியத்தை உருவாக்க வார்த்தைகளை ஒழுங்கமைக்கவும்.",
    "meaning_phrase_library": "நூலகம்",
    "meaning_phrase_school": "பள்ளி"
  },
  "Telugu": {
    "noun_question": "వీటిలో నామవాచకం (Noun) ఏది?",
    "noun_exp": "పుస్తకం అనేది ఒక వస్తువు పేరు, కాబట్టి ఇది నామవాచకం.",
    "verb_question": "అతడు బడికి _____.",
    "verb_exp": "పుంలింగ ఏకవచన కర్తతో 'వెళతాడు' ఉపయోగించబడుతుంది.",
    "fill_blank_hint": "బంతితో ఆడే ఆట",
    "reading_question_ram": "రాము ప్రతిరోజు ఉదయం ఎక్కడికి వెళతాడు?",
    "meaning_phrase_santosha": "సంతోషం",
    "meaning_options_santosha": ["మంచిగా మరియు ఆనందంగా ఉండటం", "బాధగా ఉండటం", "అలసిపోవడం", "ఆకలిగా ఉండటం"],
    "unscramble_hint_apple": "ఒక ఎర్రని పండు",
    "image_choice_car": "కారు ఉన్న చిత్రాన్ని నొక్కండి",
    "complete_chat_q": "సంభాషణను పూర్తి చేయడానికి సరైన సమాధానాన్ని ఎంచుకోండి",
    "scenario_text": "మీరు ఒక స్థానిక దుకాణంలో పుస్తకాన్ని కొనుగోలు చేస్తున్నారు. దుకాణదారుడు నవ్వుతూ మీకు పుస్తకాన్ని ఇస్తాడు.",
    "scenario_q": "మీరు దుకాణదారునికి ఏమి చెప్పాలి?",
    "match_school": "మనం నేర్చుకునే స్థలం",
    "match_book": "మనం జ్ఞానం కోసం చదువుతాము",
    "match_boy": "ఒక చిన్న మగ बच्चा",
    "match_water": "మనం త్రాగే ద్రవం",
    "tracing_q": "ఇల్లు పదాన్ని రాయండి",
    "listen_word_q": "మీరు ఏ పదాన్ని విన్నారు?",
    "listen_passage_q": "రాము బడిలో ఏమి చేయడానికి ఇష్టపడతాడు?",
    "explanation_kannada": "ఈ పాఠం ప్రాథమిక అక్షరాస్యత నైపుణ్యాల గురించి. ఇక్కడ మీరు ప్రాథమిక విషయాలు నేర్చుకుంటారు.",
    "explanation_hindi": "ఈ పాఠం ప్రాథమిక అక్షరాస్యత నైపుణ్యాల గురించి. ఇక్కడ మీరు ప్రాథమిక విషయాలు నేర్చుకుంటారు.",
    "explanation_telugu": "ఈ పాఠం ప్రాథమిక అక్షరాస్యత నైపుణ్యాల గురించి. ఇక్కడ మీరు ప్రాథమిక విషయాలు నేర్చుకుంటారు.",
    "explanation_tamil": "ఈ పాఠం ప్రాథమిక అక్షరాస్యత నైపుణ్యాల గురించి. ఇక్కడ మీరు ప్రాథమిక విషయాలు నేర్చుకుంటారు.",
    "translate_prompt": "ఒక వాక్యాన్ని రూపొందించడానికి పదాలను అమర్చండి.",
    "meaning_phrase_library": "గ్రంథాలయం",
    "meaning_phrase_school": "పాఠశాల"
  }
};

const translateFallback = (lesson, interfaceLang, learningLang) => {
  if (!lesson || interfaceLang === learningLang) return lesson;
  
  const translations = FALLBACK_TRANSLATIONS[interfaceLang];
  if (!translations) return lesson;
  
  // Override explanation
  if (lesson.explanation && lesson.explanation.includes("ಈ ಪಾಠವು")) {
    lesson.explanation = translations.explanation_kannada || lesson.explanation;
  } else if (lesson.explanation && lesson.explanation.includes("यह पाठ")) {
    lesson.explanation = translations.explanation_hindi || lesson.explanation;
  } else if (lesson.explanation && lesson.explanation.includes("ఈ పాఠం")) {
    lesson.explanation = translations.explanation_telugu || lesson.explanation;
  } else if (lesson.explanation && lesson.explanation.includes("இந்த பாடம்")) {
    lesson.explanation = translations.explanation_tamil || lesson.explanation;
  }
  
  // Override MCQs
  if (Array.isArray(lesson.mcqs)) {
    lesson.mcqs.forEach(m => {
      if (m.question === "ಇವುಗಳಲ್ಲಿ ಯಾವುದು ನಾಮಪದ (Noun)?" || m.question === "इनमें से कौन सा एक संज्ञा (Noun) है?" || m.question === "వీటిలో నామవాచకం (Noun) ఏది?" || m.question === "இவற்றில் எது பெயர்ச்சொல் (Noun)?") {
        m.question = translations.noun_question;
        m.explanation = translations.noun_exp;
      } else if (m.question === "ಅವನು ಶಾಲೆಗೆ _____." || m.question === "वह स्कूल _____ है।" || m.question === "అతడు బడికి _____." || m.question === "அவன் பள்ளிக்கு _____.") {
        m.explanation = translations.verb_exp;
      }
    });
  }
  
  // Override Fill Blanks
  if (Array.isArray(lesson.fillBlanks)) {
    lesson.fillBlanks.forEach(f => {
      if (f.hint === "ಚೆಂಡಿನ ಆಟ" || f.hint === "एक गोल आकार की गेंद वाला खेल" || f.hint === "బంతితో ఆడే ఆట" || f.hint === "பந்து விளையாட்டு") {
        f.hint = translations.fill_blank_hint;
      }
    });
  }
  
  // Override Reading Passage Question
  if (lesson.readingQuestion === "ರಾಮ್ ಪ್ರತಿದಿನ ಬೆಳಿಗ್ಗೆ ಎಲ್ಲಿಗೆ ಹೋಗುತ್ತಾನೆ?" || lesson.readingQuestion === "राम हर सुबह कहाँ जाता है?" || lesson.readingQuestion === "రాము ప్రతిరోజు ఉదయం ఎక్కడికి వెళతాడు?" || lesson.readingQuestion === "ராம் தினமும் காலையில் எங்கே செல்கிறான்?") {
    lesson.readingQuestion = translations.reading_question_ram;
  }
  
  // Override Meaning Question
  if (lesson.meaningQuestion) {
    if (lesson.meaningQuestion.phrase === "ಸಂತೋಷ" || lesson.meaningQuestion.phrase === "खुश" || lesson.meaningQuestion.phrase === "ಸಂತೋಷಂ" || lesson.meaningQuestion.phrase === "மகிழ்ச்சಿ") {
      lesson.meaningQuestion.options = translations.meaning_options_santosha;
    }
  }
  
  // Override Translation Task Prompt
  if (lesson.translationTask) {
    if (lesson.translationTask.prompt === "ಒಂದು ವಾಕ್ಯವನ್ನು ರೂಪಿಸಲು ಪದಗಳನ್ನು ಜೋಡಿಸಿ." || lesson.translationTask.prompt === "एक वाक्य बनाने के लिए शब्दों को व्यवस्थित करें।" || lesson.translationTask.prompt === "ఒక వాక్యాన్ని రూపొందించడానికి పదాలను అమర్చండి." || lesson.translationTask.prompt === "ஒரு వాக்கியத்தை உருவாக்க வார்த்தைகளை ஒழுங்கமைக்கவும்.") {
      lesson.translationTask.prompt = translations.translate_prompt;
    }
  }
  
  // Override Matching Pairs
  if (Array.isArray(lesson.matchingPairs)) {
    lesson.matchingPairs.forEach(p => {
      if (p.right === "ನಾವು ಕಲಿಯುವ ಸ್ಥಳ" || p.right === "वह स्थान जहाँ हम सीखते हैं" || p.right === "మనం నేర్చుకునే స్థలం" || p.right === "நாங்கள் படிக்கும் இடம்") {
        p.right = translations.match_school;
      } else if (p.right === "ನಾವು ಜ್ಞಾನಕ್ಕಾಗಿ ಓದುತ್ತೇವೆ" || p.right === "हम इसे ज्ञान के लिए पढ़ते हैं" || p.right === "మనం జ్ఞానం కోసం చదువుతాము" || p.right === "நாங்கள் அறிவுக்காகப் படிக்கிறோம்") {
        p.right = translations.match_book;
      } else if (p.right === "ಕಿರಿಯ ಗಂಡು ಮಗು" || p.right === "एक युवा पुरुष बच्चा" || p.right === "ఒక చిన్న మగ बच्चा" || p.right === "ஒரு இளம் ஆண் குழந்தை") {
        p.right = translations.match_boy;
      } else if (p.right === "ನಾವು ಕುಡಿಯುವ ದ್ರವ" || p.right === "एक साफ तरल जिसे हम पीते हैं" || p.right === "మనం త్రాగే ద్రవం" || p.right === "நாங்கள் குடிக்கும் திரவம்") {
        p.right = translations.match_water;
      }
    });
  }
  
  // Override Unscramble Hint
  if (Array.isArray(lesson.unscramble)) {
    lesson.unscramble.forEach(u => {
      if (u.hint === "ಒಂದು ಕೆಂಪು ಹಣ್ಣು" || u.hint === "एक लाल फल" || u.hint === "ఒక ఎర్రని పండు" || u.hint === "ஒரு சிவப்பு பழம்") {
        u.hint = translations.unscramble_hint_apple;
      }
    });
  }
  
  // Override Image Choice Prompt
  if (Array.isArray(lesson.imageChoice)) {
    lesson.imageChoice.forEach(i => {
      if (i.prompt === "ಕಾರು ಇರುವ ಚಿತ್ರವನ್ನು ಟ್ಯಾಪ್ ಮಾಡಿ" || i.prompt === "गाड़ी वाले चित्र पर टैप करें" || i.prompt === "కారు ఉన్న చిత్రాన్ని నొక్కండి" || i.prompt === "கார் இருக்கும் படத்தை தட்டவும்") {
        i.prompt = translations.image_choice_car;
      }
    });
  }
  
  // Override Tracing Question
  if (Array.isArray(lesson.tracing)) {
    lesson.tracing.forEach(t => {
      if (t.question === "ಮನೆ ಪದವನ್ನು ಬರೆಯಿರಿ" || t.question === "घर शब्द को ट्रेस करें" || t.question === "ఇల్లు పదాన్ని రాయండి" || t.question === "வீடு வார்த்தையை எழுதவும்") {
        t.question = translations.tracing_q;
      }
    });
  }
  
  // Override Listen Word MCQ
  if (lesson.listenWordMCQ) {
    if (lesson.listenWordMCQ.question === "ನೀವು ಯಾವ ಪದವನ್ನು ಕೇಳಿದ್ದೀರಿ?" || lesson.listenWordMCQ.question === "आपने कौन सा शब्द सुना?" || lesson.listenWordMCQ.question === "మీరు ఏ పదాన్ని విన్నారు?" || lesson.listenWordMCQ.question === "நீங்கள் எந்த வார்த்தையைக் கேட்டீர்கள்?") {
      lesson.listenWordMCQ.question = translations.listen_word_q;
    }
  }
  
  // Override Listen Passage MCQ
  if (lesson.listenPassageMCQ) {
    if (lesson.listenPassageMCQ.question === "ರಾಮ್ ಶಾಲೆಯಲ್ಲಿ ಏನು ಮಾಡಲು ಇಷ್ಟಪಡುತ್ತಾನೆ?" || lesson.listenPassageMCQ.question === "राम स्कूल में क्या करना पसंद करता है?" || lesson.listenPassageMCQ.question === "రాము బడిలో ఏమి చేయడానికి ఇష్టపడతాడు?" || lesson.listenPassageMCQ.question === "ராம் பள்ளியில் என்ன செய்ய விரும்புகிறான்?") {
      lesson.listenPassageMCQ.question = translations.listen_passage_q;
    }
  }
  
  // Override Chat Complete
  if (lesson.chatComplete) {
    if (lesson.chatComplete.question === "ಸಂಭಾಷಣೆಯನ್ನು ಪೂರ್ಣಗೊಳಿಸಲು ಸರಿಯಾದ ಉತ್ತರವನ್ನು ಆರಿಸಿ" || lesson.chatComplete.question === "बातचीत पूरी करने के लिए सही प्रतिक्रिया चुनें" || lesson.chatComplete.question === "సంభాషణను పూర్తి చేయడానికి సరైన సమాధానాన్ని ఎంచుకోండి" || lesson.chatComplete.question === "உரையாடலை முடிக்க சரியான பதிலைத் தேர்ந்தெடுக்கவும்") {
      lesson.chatComplete.question = translations.complete_chat_q;
    }
  }
  
  // Override Scenario
  if (lesson.scenario) {
    if (lesson.scenario.scenario === "ನೀವು ಸ್ಥಳೀಯ ಅಂಗಡಿಯೊಂದರಲ್ಲಿ ಪುಸ್ತಕವನ್ನು ಖರೀದಿಸುತ್ತಿದ್ದೀರಿ. ಅಂಗಡಿಯವನು ಮುಗುಳ್ನಕ್ಕು ನಿಮಗೆ ಪುಸ್ತಕವನ್ನು ನೀಡುತ್ತಾನೆ." ||
        lesson.scenario.scenario === "आप एक स्थानीय दुकान पर एक किताब खरीद रहे हैं। दुकानदार मुस्कुराता है और आपको किताब देता है।" ||
        lesson.scenario.scenario === "మీరు ఒక స్థానిక దుకాణంలో పుస్తకాన్ని కొనుగోలు చేస్తున్నారు. దుకాణదారుడు నవ్వుతూ మీకు పుస్తకాన్ని ఇస్తాడు." ||
        lesson.scenario.scenario === "நீங்கள் ஒரு உள்ளூர் கடையில் புத்தகம் வாங்குகிறீர்கள். கடைக்காரர் புன்னகைத்து உங்களுக்கு புத்தகத்தை தருகிறார்.") {
      lesson.scenario.scenario = translations.scenario_text;
    }
    if (lesson.scenario.question === "ನೀವು ಅಂಗಡಿಯವನಿಗೆ ಏನು ಹೇಳಬೇಕು?" || lesson.scenario.question === "आपको दुकानदार से क्या कहना चाहिए?" || lesson.scenario.question === "మీరు దుకాణదారునికి ఏమి చెప్పాలి?" || lesson.scenario.question === "நீங்கள் கடைக்காரரிடம் என்ன சொல்ல வேண்டும்?") {
      lesson.scenario.question = translations.scenario_q;
    }
  }
  
  return lesson;
};

const translateFallbackPractice = (practice, interfaceLang, learningLang) => {
  if (!practice || !practice.questions || interfaceLang === learningLang) return practice;
  
  const translations = FALLBACK_TRANSLATIONS[interfaceLang];
  if (!translations) return practice;
  
  practice.questions.forEach(q => {
    // Translate Unscramble hints dynamically based on interfaceLang
    if (q.type === "unscramble") {
      if (q.hint === "अध्ययन का स्थान" || q.hint === "ಕಲಿಯುವ ಸ್ಥಳ" || q.hint === "మనం చదువుకునే చోటు" || q.hint === "நாங்கள் படிக்கும் இடம்" || q.hint === "Place of study and learning" || q.hint === "Where we study" || q.answer === "SCHOOL" || q.answer === "स्कूल" || q.answer === "ಶಾಲೆ" || q.answer === "బడి" || q.answer === "பள்ளி") {
        q.hint = interfaceLang === "Hindi" ? "अध्ययन का स्थान" :
                 interfaceLang === "Kannada" ? "ಕಲಿಯುವ ಸ್ಥಳ" :
                 interfaceLang === "Telugu" ? "మనం చదువుకునే చోటు" :
                 interfaceLang === "Tamil" ? "நாங்கள் படிக்கும் இடம்" : "Place of study and learning";
      }
      else if (q.hint === "एक लाल या हरा फल" || q.hint === "ಒಂದು ಸಿಹಿ ಕೆಂಪು ಹಣ್ಣು" || q.hint === "ఒక తియ్యటి ఎర్రని పండు" || q.hint === "ஒரு இனிப்பான சிவப்பு பழம்" || q.hint === "A sweet red fruit" || q.hint === "एक फल" || q.hint === "ಒಂದು ಹಣ್ಣು" || q.hint === "ఒక పండు" || q.hint === "ஒரு பழம்" || q.answer === "APPLE" || q.answer === "सेब" || q.answer === "ಸೇಬು" || q.answer === "ఆపిల్" || q.answer === "ஆப்பிள்") {
        q.hint = interfaceLang === "Hindi" ? "एक लाल या हरा फल" :
                 interfaceLang === "Kannada" ? "ಒಂದು ಸಿಹಿ ಕೆಂಪು ಹಣ್ಣು" :
                 interfaceLang === "Telugu" ? "ఒక తియ్యటి ఎర్రని పండు" :
                 interfaceLang === "Tamil" ? "ஒரு இனிப்பான சிவப்பு பழம்" : "A sweet red fruit";
      }
      else if (q.hint === "पढ़ने की पुस्तक" || q.hint === "ಓದುವ ಪುಸ್ತಕ" || q.hint === "చదువుకునే పుస్తకం" || q.hint === "படிக்க உதவும் புத்தகம்" || q.hint === "Book to read and learn" || q.answer === "BOOK" || q.answer === "किताब" || q.answer === "ಪುಸ್ತಕ" || q.answer === "పుస్తకం" || q.answer === "புத்தகம்") {
        q.hint = interfaceLang === "Hindi" ? "पढ़ने की पुस्तक" :
                 interfaceLang === "Kannada" ? "ಓದುವ ಪುಸ್ತಕ" :
                 interfaceLang === "Telugu" ? "చదువుకునే పుస్తకం" :
                 interfaceLang === "Tamil" ? "படிக்க உதவும் புத்தகம்" : "Book to read and learn";
      }
      else if (q.hint === "आसमान में चमकता तारा" || q.hint === "ಆಕಾಶದಲ್ಲಿ ಪ್ರಕಾಶಿಸುವ ಸೂರ್ಯ" || q.hint === "ఆకాశంలో ప్రకాశించే సూర్యుడు" || q.hint === "வானத்தில் பிரகாசிக்கும் சூரியன்" || q.hint === "Bright star in the sky" || q.answer === "SUN" || q.answer === "सूरज" || q.answer === "ಸೂರ್ಯ" || q.answer === "సూర్యుడు" || q.answer === "சூரியன்") {
        q.hint = interfaceLang === "Hindi" ? "आसमान में चमकता तारा" :
                 interfaceLang === "Kannada" ? "ಆಕಾಶದಲ್ಲಿ ಪ್ರಕಾಶಿಸುವ ಸೂರ್ಯ" :
                 interfaceLang === "Telugu" ? "ఆకాశంలో ప్రకాశించే సూర్యుడు" :
                 interfaceLang === "Tamil" ? "வானத்தில் பிரகாசிக்கும் சூரியன்" : "Bright star in the sky";
      }
    }

    // Translate fillBlank hints dynamically based on interfaceLang
    if (q.type === "fillBlank" && q.hint) {
      if (q.hint === "दिशा से संबंधित क्रिया" || q.hint === "दिशा" || q.hint === "ದಿಕ್ಕು" || q.hint === "దిశ" || q.hint === "திசை" || q.hint === "A cardinal direction") {
        q.hint = interfaceLang === "Hindi" ? "दिशा से संबंधित" :
                 interfaceLang === "Kannada" ? "ದಿಕ್ಕಿನ ಸೂಚನೆ" :
                 interfaceLang === "Telugu" ? "దిశకు సంబంధించి" :
                 interfaceLang === "Tamil" ? "திசை பற்றிய குறிப்பு" : "A cardinal direction";
      }
      else if (q.hint === "पेय पदार्थ" || q.hint === "पेय" || q.hint === "ಪಾನೀಯ" || q.hint === "పానీయం" || q.hint === "பானம்" || q.hint === "Essential liquid") {
        q.hint = interfaceLang === "Hindi" ? "पेय पदार्थ" :
                 interfaceLang === "Kannada" ? "ಪಾನೀಯ" :
                 interfaceLang === "Telugu" ? "పానీయం" :
                 interfaceLang === "Tamil" ? "பானம்" : "Essential liquid";
      }
    }

    // Translate tracing info dynamically based on interfaceLang
    if (q.type === "tracing" && q.info) {
      q.info = interfaceLang === "Hindi" ? `अक्षर '${q.letter || q.word}' को ट्रेस करें` :
               interfaceLang === "Kannada" ? `ಅಕ್ಷರ '${q.letter || q.word}' ಅನ್ನು ಟ್ರೇಸ್ ಮಾಡಿ` :
               interfaceLang === "Telugu" ? `అక్షరం '${q.letter || q.word}' ను ట్రేస్ చేయండి` :
               interfaceLang === "Tamil" ? `எழுத்து '${q.letter || q.word}' ஐ டிரேஸ் செய்யவும்` : `Trace the letter ${q.letter || q.word}`;
    }

    // Translate translationTask prompt dynamically based on interfaceLang
    if (q.type === "translationTask" && q.prompt) {
      if (q.englishTranslation === "our school is beautiful" || q.prompt.includes("school") || q.prompt.includes("स्कूल") || q.prompt.includes("ಶಾಲೆ") || q.prompt.includes("బడి") || q.prompt.includes("பள்ளி")) {
        q.prompt = interfaceLang === "Hindi" ? "Arrange the words to form: 'हमारा स्कूल सुंदर है'" :
                   interfaceLang === "Kannada" ? "Arrange the words to form: 'ನಮ್ಮ ಶಾಲೆ ಸುಂದರವಾಗಿದೆ'" :
                   interfaceLang === "Telugu" ? "Arrange the words to form: 'మా బడి చాలా అందంగా ఉంటుంది'" :
                   interfaceLang === "Tamil" ? "Arrange the words to form: 'எங்கள் பள்ளி அழகாக இருக்கிறது'" : "Arrange the words to form: 'our school is beautiful'";
      }
      else if (q.englishTranslation === "this is a cat" || q.prompt.includes("cat") || q.prompt.includes("बिल्ली") || q.prompt.includes("ಬೆಕ್ಕು") || q.prompt.includes("పిల్లి") || q.prompt.includes("பூனை")) {
        q.prompt = interfaceLang === "Hindi" ? "Arrange the words to form: 'यह एक बिल्ली है'" :
                   interfaceLang === "Kannada" ? "Arrange the words to form: 'ಇದು ಒಂದು ಬೆಕ್ಕು'" :
                   interfaceLang === "Telugu" ? "Arrange the words to form: 'ఇది ఒక పిల్లి'" :
                   interfaceLang === "Tamil" ? "Arrange the words to form: 'இது ஒரு பூனை'" : "Arrange the words to form: 'this is a cat'";
      }
      else if (q.englishTranslation === "the sun rises in the east" || q.prompt.includes("sun") || q.prompt.includes("सूरज") || q.prompt.includes("ಸೂರ್ಯ") || q.prompt.includes("సూర్యుడు") || q.prompt.includes("சூரியன்")) {
        q.prompt = interfaceLang === "Hindi" ? "Arrange the words to form: 'सूरज पूर्व से उगता है'" :
                   interfaceLang === "Kannada" ? "Arrange the words to form: 'ಸೂರ್ಯನು ಪೂರ್ವದಲ್ಲಿ ಉದಯಿಸುತ್ತಾನೆ'" :
                   interfaceLang === "Telugu" ? "Arrange the words to form: 'సూర్యుడు తూర్పున ఉదయిస్తాడు'" :
                   interfaceLang === "Tamil" ? "Arrange the words to form: 'சூரியன் கிழக்கில் உதிக்கிறது'" : "Arrange the words to form: 'the sun rises in the east'";
      }
    }

    // Translate Word Sprint hints dynamically based on interfaceLang
    if (q.word && q.hint && !q.tiles && !q.sentence) {
      if (q.hint.toLowerCase().includes("red or green fruit") || q.word === "apple" || q.word === "सेब" || q.word === "ಸೇಬು" || q.word === "ఆపిల్" || q.word === "ஆப்பிள்") {
        q.hint = interfaceLang === "Hindi" ? "एक लाल या हरा फल" :
                 interfaceLang === "Kannada" ? "ಒಂದು ಕೆಂಪು ಅಥವಾ ಹಸಿರು ಹಣ್ಣು" :
                 interfaceLang === "Telugu" ? "ఒక ఎరుపు లేదా ఆకుపచ్చ పండు" :
                 interfaceLang === "Tamil" ? "ஒரு சிவப்பு அல்லது பச்சை பழம்" : "A red or green fruit";
      }
      else if (q.hint.toLowerCase().includes("cross water") || q.word === "bridge" || q.word === "पुल" || q.word === "ಸೇತುವೆ" || q.word === "వంతెన" || q.word === "பாலம்") {
        q.hint = interfaceLang === "Hindi" ? "आप इससे पानी पार करते हैं" :
                 interfaceLang === "Kannada" ? "ನೀವು ಇದರ ಮೇಲೆ ನೀರನ್ನು ದಾಟುತ್ತೀರಿ" :
                 interfaceLang === "Telugu" ? "దీనిపై నీటిని దాటుతాము" :
                 interfaceLang === "Tamil" ? "இதன் மூலம் நீங்கள் நீரை கடக்கலாம்" : "You cross water on it";
      }
      else if (q.hint.toLowerCase().includes("sky") || q.word === "cloud" || q.word === "बादल" || q.word === "ಮೋಡ" || q.word === "మేఘం" || q.word === "மேகம்") {
        q.hint = interfaceLang === "Hindi" ? "आसमान में पाया जाता है" :
                 interfaceLang === "Kannada" ? "ಆಕಾಶದಲ್ಲಿ ಕಂಡುಬರುತ್ತದೆ" :
                 interfaceLang === "Telugu" ? "ఆకాశంలో కనిపిస్తుంది" :
                 interfaceLang === "Tamil" ? "வானத்தில் காணப்படும்" : "Found in the sky";
      }
      else if (q.hint.toLowerCase().includes("sleeping") || q.word === "dream" || q.word === "सपना" || q.word === "ಕನಸು" || q.word === "కల" || q.word === "கனவு") {
        q.hint = interfaceLang === "Hindi" ? "सोते समय जो आप देखते हैं" :
                 interfaceLang === "Kannada" ? "ನಿದ್ರಿಸುವಾಗ ನೀವು ಕಾಣುವ ದೃಶ್ಯ" :
                 interfaceLang === "Telugu" ? "నిద్రపోతున్నప్పుడు వచ్చేది" :
                 interfaceLang === "Tamil" ? "தூங்கும் போது நீங்கள் காண்பது" : "What you see when sleeping";
      }
      else if (q.hint.toLowerCase().includes("home planet") || q.word === "earth" || q.word === "पृथ्वी" || q.word === "ಭೂಮಿ" || q.word === "భూమి" || q.word === "பூமி") {
        q.hint = interfaceLang === "Hindi" ? "हमारा गृह ग्रह" :
                 interfaceLang === "Kannada" ? "ನಮ್ಮ ವಾಸಸ್ಥಾನ ಗ್ರಹ" :
                 interfaceLang === "Telugu" ? "మన నివాస గ్రహం" :
                 interfaceLang === "Tamil" ? "நமது தாய் கிரகம்" : "Our home planet";
      }
      else if (q.hint.toLowerCase().includes("hot and bright") || q.word === "fire" || q.word === "आग" || q.word === "ಬೆಂಕಿ" || q.word === "నిప్పు" || q.word === "நெருப்பு") {
        q.hint = interfaceLang === "Hindi" ? "गर्म और चमकदार" :
                 interfaceLang === "Kannada" ? "ಬಿಸಿ ಮತ್ತು ప్రకాశమాన" :
                 interfaceLang === "Telugu" ? "వేడిగా మరియు ప్రకాశవంతంగా ఉంటుంది" :
                 interfaceLang === "Tamil" ? "வெப்பமான மற்றும் பிரகாசமானது" : "Hot and bright";
      }
      else if (q.hint.toLowerCase().includes("flowers grow") || q.word === "garden" || q.word === "बगीचा" || q.word === "ತೋಟ" || q.word === "తోట" || q.word === "தோட்டம்") {
        q.hint = interfaceLang === "Hindi" ? "जहाँ फूल उगते हैं" :
                 interfaceLang === "Kannada" ? "ಹೂವುಗಳು ಬೆಳೆಯುವ ಸ್ಥಳ" :
                 interfaceLang === "Telugu" ? "పువ్వులు పెరిగే స్థలం" :
                 interfaceLang === "Tamil" ? "பூக்கள் வளரும் இடம்" : "Where flowers grow";
      }
      else if (q.hint.toLowerCase().includes("joyful") || q.word === "happy" || q.word === "खुश" || q.word === "ಸಂತೋಷ" || q.word === "సంతోషం" || q.word === "மகிழ்ச்சி") {
        q.hint = interfaceLang === "Hindi" ? "एक आनंदमय भावना" :
                 interfaceLang === "Kannada" ? "ಆನಂದದಾಯಕ ಭಾವನೆ" :
                 interfaceLang === "Telugu" ? "ఒక ఆనందకరమైన అనుభూతి" :
                 interfaceLang === "Tamil" ? "ஒரு மகிழ்ச்சியான உணர்வு" : "A joyful feeling";
      }
      else if (q.hint.toLowerCase().includes("land surrounded") || q.word === "island" || q.word === "द्वीप" || q.word === "ದ್ವೀಪ" || q.word === "ద్వీపం" || q.word === "தீவு") {
        q.hint = interfaceLang === "Hindi" ? "पानी से घिरी भूमि" :
                 interfaceLang === "Kannada" ? "ನೀರಿನಿಂದ ಆವೃತವಾದ ಭೂಮಿ" :
                 interfaceLang === "Telugu" ? "నీటితో చుట్టబడిన భూమి" :
                 interfaceLang === "Tamil" ? "நீரால் சூழப்பட்ட நிலப்பகுதி" : "Land surrounded by water";
      }
      else if (q.hint.toLowerCase().includes("dense tropical") || q.word === "jungle" || q.word === "जंगल" || q.word === "ಅರಣ್ಯ" || q.word === "అడవి" || q.word === "காடு") {
        q.hint = interfaceLang === "Hindi" ? "एक घना उष्णकटिबंधीय वन" :
                 interfaceLang === "Kannada" ? "ದಟ್ಟವಾದ ಉಷ್ಣವಲಯದ ಕಾಡು" :
                 interfaceLang === "Telugu" ? "దట్టమైన ఉష్ణమండల అరణ్యం" :
                 interfaceLang === "Tamil" ? "அடர்ந்த வெப்பமண்டல காடு" : "A dense tropical forest";
      }
    }

    // Translate Word Scramble categories dynamically based on interfaceLang
    if (q.word && q.category && q.tiles) {
      if (q.category === "Education") {
        q.category = interfaceLang === "Hindi" ? "शिक्षा" :
                     interfaceLang === "Kannada" ? "ಶಿಕ್ಷಣ" :
                     interfaceLang === "Telugu" ? "విద్య" :
                     interfaceLang === "Tamil" ? "கல்வி" : "Education";
      }
      else if (q.category === "Skills") {
        q.category = interfaceLang === "Hindi" ? "कौशल" :
                     interfaceLang === "Kannada" ? "ಕೌಶಲ್ಯಗಳು" :
                     interfaceLang === "Telugu" ? "నైపుణ్యాలు" :
                     interfaceLang === "Tamil" ? "திறன்கள்" : "Skills";
      }
      else if (q.category === "Language") {
        q.category = interfaceLang === "Hindi" ? "भाषा" :
                     interfaceLang === "Kannada" ? "ಭಾಷೆ" :
                     interfaceLang === "Telugu" ? "భాష" :
                     interfaceLang === "Tamil" ? "மொழி" : "Language";
      }
      else if (q.category === "Traits") {
        q.category = interfaceLang === "Hindi" ? "गुण" :
                     interfaceLang === "Kannada" ? "ಗುಣಲಕ್ಷಣಗಳು" :
                     interfaceLang === "Telugu" ? "లక్షణాలు" :
                     interfaceLang === "Tamil" ? "பண்புகள்" : "Traits";
      }
      else if (q.category === "Emotions") {
        q.category = interfaceLang === "Hindi" ? "भावनाएँ" :
                     interfaceLang === "Kannada" ? "ಭಾವನೆಗಳು" :
                     interfaceLang === "Telugu" ? "భావోద్వేగాలు" :
                     interfaceLang === "Tamil" ? "உணர்ச்சிகள்" : "Emotions";
      }
      else if (q.category === "Adjectives") {
        q.category = interfaceLang === "Hindi" ? "विशेषण" :
                     interfaceLang === "Kannada" ? "ಗುಣವಾಚಕಗಳು" :
                     interfaceLang === "Telugu" ? "విశేషణాలు" :
                     interfaceLang === "Tamil" ? "உரிச்சொற்கள்" : "Adjectives";
      }
      else if (q.category === "Food") {
        q.category = interfaceLang === "Hindi" ? "भोजन" :
                     interfaceLang === "Kannada" ? "ಆಹಾರ" :
                     interfaceLang === "Telugu" ? "ఆహారం" :
                     interfaceLang === "Tamil" ? "உணவு" : "Food";
      }
      else if (q.category === "Nature") {
        q.category = interfaceLang === "Hindi" ? "प्रकृति" :
                     interfaceLang === "Kannada" ? "ಪ್ರಕೃತಿ" :
                     interfaceLang === "Telugu" ? "ప్రకృతి" :
                     interfaceLang === "Tamil" ? "இயற்கை" : "Nature";
      }
      else if (q.category === "World") {
        q.category = interfaceLang === "Hindi" ? "दुनिया" :
                     interfaceLang === "Kannada" ? "ಪ್ರಪಂಚ" :
                     interfaceLang === "Telugu" ? "ప్రపంచం" :
                     interfaceLang === "Tamil" ? "உலகம்" : "World";
      }
      else if (q.category === "Arts") {
        q.category = interfaceLang === "Hindi" ? "कला" :
                     interfaceLang === "Kannada" ? "ಕಲೆಗಳು" :
                     interfaceLang === "Telugu" ? "కళలు" :
                     interfaceLang === "Tamil" ? "கலைகள்" : "Arts";
      }
      else if (q.category === "Science") {
        q.category = interfaceLang === "Hindi" ? "विज्ञान" :
                     interfaceLang === "Kannada" ? "ವಿಜ್ಞಾನ" :
                     interfaceLang === "Telugu" ? "ವಿజ్ఞానం" :
                     interfaceLang === "Tamil" ? "அறிவியல்" : "Science";
      }
      else if (q.category === "Concepts") {
        q.category = interfaceLang === "Hindi" ? "अवधारणाएँ" :
                     interfaceLang === "Kannada" ? "ಪರಿಕಲ್ಪನೆಗಳು" :
                     interfaceLang === "Telugu" ? "భావనలు" :
                     interfaceLang === "Tamil" ? "கருத்துக்கள்" : "Concepts";
      }
    }
  
    if (q.question === "ಸೂರ್ಯನು ಯಾವ ದಿಕ್ಕಿನಲ್ಲಿ ಉದಯಿಸುತ್ತಾನೆ?" || q.question === "सूरज किस दिशा से उगता है?" || q.question === "సూర్యుడు ఏ దిశలో ఉదయిస్తాడు?" || q.question === "சூரியன் எந்த திசையில் உதிக்கிறது?") {
      q.question = interfaceLang === "English" ? "From which direction does the sun rise?" : (translations.sun_direction_q || q.question);
      q.explanation = interfaceLang === "English" ? "The sun rises in the east." : q.explanation;
    }
    if (q.question === "ನಮ್ಮ ರಾಷ್ಟ್ರೀಯ ಪಕ್ಷಿ ಯಾವುದು?" || q.question === "हमारा राष्ट्रीय पक्षी कौन सा है?" || q.question === "మన జాతీయ పక్షి ఏది?" || q.question === "நமது தேசிய பறவை எது?") {
      q.question = interfaceLang === "English" ? "What is our national bird?" : q.question;
      q.explanation = interfaceLang === "English" ? "The national bird is the peacock." : q.explanation;
    }
    if (q.passage && (q.passage.includes("ಸಿಂಹವಿತ್ತು") || q.passage.includes("शेर") || q.passage.includes("సింహం") || q.passage.includes("சிங்கம்"))) {
      q.question = interfaceLang === "English" ? "Where did the lion live?" : q.question;
      q.explanation = interfaceLang === "English" ? "The lion lived in the forest." : q.explanation;
    }
    if (q.passage && (q.passage.includes("ನಾಯಿ") || q.passage.includes("कुत्ता") || q.passage.includes("కుక్క") || q.passage.includes("நாய்"))) {
      q.question = interfaceLang === "English" ? "What is Raju's dog name?" : q.question;
      q.explanation = interfaceLang === "English" ? "The dog name is Sheru." : q.explanation;
    }
    if (q.prompt && (q.prompt.includes("ಪುಸ್ತಕ") || q.prompt.includes("किताब") || q.prompt.includes("పుస్తకం") || q.prompt.includes("புத்தகம்"))) {
      q.prompt = interfaceLang === "English" ? "Choose the correct picture for Book:" : q.prompt;
    }
    if (q.prompt && (q.prompt.includes("ಸೂರ್ಯ") || q.prompt.includes("सूरज") || q.prompt.includes("సూర్యుడు") || q.prompt.includes("சூரியன்"))) {
      q.prompt = interfaceLang === "English" ? "Choose the correct picture for Sun:" : q.prompt;
    }
    if (q.type === "meaning") {
      if (q.phrase === "ಗ್ರಂಥಾಲಯ" || q.phrase === "पुस्तकालय" || q.phrase === "గ్రంథాలయం" || q.phrase === "நூலகம்") {
        q.phrase = translations.meaning_phrase_library || q.phrase;
        q.options = ["A place with books to read or borrow", "A place where students study", "A place to buy things"];
      }
      if (q.phrase === "ಶಾಲೆ" || q.phrase === "विद्यालय" || q.phrase === "పాఠశాల" || q.phrase === "பள்ளி") {
        q.phrase = translations.meaning_phrase_school || q.phrase;
        q.options = ["A place where students learn and study", "An institution for higher learning", "A place where people work"];
      }
    }

    // Translate Speak Practice new types
    if (q.type === "translateSpeak") {
      if (q.targetSentence === "He goes to school." || q.targetSentence === "He goes to school") {
        q.promptText = interfaceLang === "Hindi" ? "वह स्कूल जाता है।" :
                       interfaceLang === "Kannada" ? "ಅವನು ಶಾಲೆಗೆ ಹೋಗುತ್ತಾನೆ." :
                       interfaceLang === "Telugu" ? "అతడు బడికి వెళతాడు." :
                       interfaceLang === "Tamil" ? "அவன் பள்ளிக்குச் செல்கிறான்." : "He goes to school.";
        q.hint = interfaceLang === "Hindi" ? "साधारण वर्तमान काल" :
                 interfaceLang === "Kannada" ? "ಸರಳ ವರ್ತಮಾನ ಕಾಲ" :
                 interfaceLang === "Telugu" ? "సాధారణ వర్తమాన కాలం" :
                 interfaceLang === "Tamil" ? "எளிய நிகழ்காலம்" : "Use simple present tense";
      }
      if (q.targetSentence === "Today the weather is good." || q.targetSentence === "Today the weather is good") {
        q.promptText = interfaceLang === "Hindi" ? "आज मौसम अच्छा है।" :
                       interfaceLang === "Kannada" ? "ಇಂದು ಹವಾಮಾನ ಚೆನ್ನಾಗಿದೆ." :
                       interfaceLang === "Telugu" ? "ఈరోజు వాతావరణం బాగుంది." :
                       interfaceLang === "Tamil" ? "இன்று வானிலை நன்றாக உள்ளது." : "Today the weather is good.";
        q.hint = interfaceLang === "Hindi" ? "अनुवाद करें" :
                 interfaceLang === "Kannada" ? "ಅನುವಾದಿಸಿ" :
                 interfaceLang === "Telugu" ? "అనువదించండి" :
                 interfaceLang === "Tamil" ? "மொழிபெயர்க்கவும்" : "Translate to learning language";
      }
      if (q.targetSentence === "I like to eat fruits." || q.targetSentence === "I like to eat fruits") {
        q.promptText = interfaceLang === "Hindi" ? "मुझे फल खाना पसंद है।" :
                       interfaceLang === "Kannada" ? "ನನಗೆ ಹಣ್ಣು ತಿನ್ನಲು ಇಷ್ಟ." :
                       interfaceLang === "Telugu" ? "నాకు పండ్లు తినడం ఇష్టం." :
                       interfaceLang === "Tamil" ? "எனக்கு பழங்கள் சாப்பிட பிடிக்கும்." : "I like to eat fruits.";
        q.hint = interfaceLang === "Hindi" ? "पसंद (like) का प्रयोग करें" :
                 interfaceLang === "Kannada" ? "ಇಷ್ಟ (like) ಬಳಸಿ" :
                 interfaceLang === "Telugu" ? "ఇష్టం (like) ఉపయోగించండి" :
                 interfaceLang === "Tamil" ? "விருப்பம் (like) பயன்படுத்தவும்" : "Translate and speak";
      }
      if (q.targetSentence === "वह गाना गाती है।" || q.targetSentence === "ಸೀತಾ ಹಾಡು ಹಾಡುತ್ತಾಳೆ." || q.targetSentence === "సీత పాట పాడుతుంది." || q.targetSentence === "சீதா பாட்டு பாடுகிறாள்.") {
        q.promptText = interfaceLang === "English" ? "She sings a song." : q.promptText;
        q.hint = interfaceLang === "English" ? "Translate to target language" : q.hint;
      }
      if (q.targetSentence === "आज मौसम अच्छा है।" || q.targetSentence === "ಇಂದು ಹವಾಮಾನ ಚೆನ್ನಾಗಿದೆ." || q.targetSentence === "ఈరోజు వాతావరణం బాగుంది." || q.targetSentence === "இன்று வானிலை நன்றாக உள்ளது.") {
        q.promptText = interfaceLang === "English" ? "Today the weather is good." : q.promptText;
        q.hint = interfaceLang === "English" ? "Translate to target language" : q.hint;
      }
      if (q.targetSentence === "मुझे फल खाना पसंद है।" || q.targetSentence === "ನನಗೆ ಹಣ್ಣು ತಿನ್ನಲು ಇಷ್ಟ." || q.targetSentence === "నాకు పండ్లు తినడం ఇష్టం." || q.targetSentence === "எனக்கு பழங்கள் சாப்பிட பிடிக்கும்.") {
        q.promptText = interfaceLang === "English" ? "I like to eat fruits." : q.promptText;
        q.hint = interfaceLang === "English" ? "Translate to target language" : q.hint;
      }
    }
    if (q.type === "speakReply") {
      if (q.replyText === "I am doing well, thank you." || q.replyText === "I am doing well, thank you") {
        q.translation = interfaceLang === "Hindi" ? "मैं ठीक हूँ, धन्यवाद।" :
                        interfaceLang === "Kannada" ? "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ, ಧನ್ಯವಾದಗಳು." :
                        interfaceLang === "Telugu" ? "నేను బాగున్నాను, ధన్యవాదాలు." :
                        interfaceLang === "Tamil" ? "நான் நன்றாக இருக்கிறேன், நன்றி." : "I am doing well, thank you.";
      }
      if (q.replyText === "I really enjoy learning languages." || q.replyText === "I really enjoy learning languages") {
        q.translation = interfaceLang === "Hindi" ? "मुझे भाषाएं सीखना बहुत पसंद है।" :
                        interfaceLang === "Kannada" ? "ನನಗೆ ಭಾಷೆಗಳನ್ನು ಕಲಿಯುವುದು ನಿಜವಾಗಿಯೂ ಇಷ್ಟ." :
                        interfaceLang === "Telugu" ? "నేను భాషలు నేర్చుకోవడాన్ని నిజంగా ఆనందిస్తాను." :
                        interfaceLang === "Tamil" ? "நான் மொழிகளைக் கற்றுக்கொள்வதை மிகவும் ರசிக்கிறேன்." : "I really enjoy learning languages.";
      }
      if (q.replyText === "Yes, let us read a story together." || q.replyText === "Yes, let us read a story together") {
        q.translation = interfaceLang === "Hindi" ? "हाँ, चलिए मिलकर एक कहानी पढ़ते हैं।" :
                        interfaceLang === "Kannada" ? "ಹೌದು, ನಾವು ಒಟ್ಟಿಗೆ ಒಂದು ಕಥೆಯನ್ನು ಓದೋಣ." :
                        interfaceLang === "Telugu" ? "అవును, మనం కలిసి ఒక కథ చదువుదాం." :
                        interfaceLang === "Tamil" ? "ஆம், நாம் சேர்ந்து ஒரு கதையைப் படிப்போம்." : "Yes, let us read a story together.";
      }
    }
  });
  
  return practice;
};
