// LISA — Gemini AI Lesson Generator
// Uses Gemini 2.0 Flash REST API to generate personalized lesson content

const GEMINI_API_KEY = "AIzaSyAb8RN6JLYhDaJ2JY6qIeJ9tnkgeTxByd9d56msTZh_QfXYQOhQ";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

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
    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Gemini API error:", err);
      return getFallbackLesson(params);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Parse JSON (strip markdown fences if present)
    const cleaned = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
    const lesson = JSON.parse(cleaned);

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
    guidedPractice: "Read the examples above, then try the practice questions below.",
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
    aiFeedbackPositive: "Excellent work! You are making great progress.",
    aiFeedbackNegative: "Good try! Review the lesson and attempt again. You can do it!"
  };
};

export const clearLessonCache = () => lessonCache.clear();

export const fetchWordOfDay = async (language = "English") => {
  try {
    const prompt = `You are a helpful literacy assistant. Suggest a unique, helpful "Word of the Day" in ${language} that is practical for learning. Also generate a simple, clear, age-appropriate example sentence showing how to use it.
    
    Return ONLY valid JSON with this exact structure (no markdown, no backticks):
    {
      "word": "string",
      "example": "string"
    }`;

    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 256,
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      throw new Error("Failed to fetch from Gemini");
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const cleaned = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("Failed to fetch word of the day from Gemini, using fallback:", err);
    return {
      word: language === "Hindi" ? "परिश्रमी" : "Diligent",
      example: language === "Hindi" 
        ? "एक परिश्रमी छात्र हर दिन थोड़ा पढ़ता है।" 
        : "A diligent student practices reading a little every day."
    };
  }
};
