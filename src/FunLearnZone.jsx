import React, { useState, useEffect, useRef, useCallback } from "react";
import { generatePracticeContent } from "./geminiClient";


const playChime = (type) => {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    if (type === "correct") {
      const now = ctx.currentTime;
      const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(f, now + idx * 0.08);
        gain.gain.setValueAtTime(0.12, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.4);
      });
    } else if (type === "incorrect") {
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc1.type = "sawtooth";
      osc1.frequency.setValueAtTime(180, now);
      osc1.frequency.linearRampToValueAtTime(110, now + 0.35);
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(182, now);
      osc2.frequency.linearRampToValueAtTime(112, now + 0.35);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.45);
      osc2.stop(now + 0.45);
    } else if (type === "click") {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, now);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    }
  } catch (e) {
    console.warn("Chime playback failed:", e);
  }
};


// ─── Word Sprint Game ──────────────────────────────────────────────────────────
// ─── Word Sprint Game ──────────────────────────────────────────────────────────
const WORD_SPRINT_WORDS_BY_LANG = {
  English: [
    { word: "apple", emoji: "🍎", hint: "A red or green fruit" },
    { word: "bridge", emoji: "🌉", hint: "You cross water on it" },
    { word: "cloud", emoji: "☁️", hint: "Found in the sky" },
    { word: "dream", emoji: "💭", hint: "What you see when sleeping" },
    { word: "earth", emoji: "🌍", hint: "Our home planet" },
    { word: "fire", emoji: "🔥", hint: "Hot and bright" },
    { word: "garden", emoji: "🌷", hint: "Where flowers grow" },
    { word: "happy", emoji: "😊", hint: "A joyful feeling" },
    { word: "island", emoji: "🏝️", hint: "Land surrounded by water" },
    { word: "jungle", emoji: "🌿", hint: "A dense tropical forest" },
    { word: "kite", emoji: "🪁", hint: "Flies in the wind" },
    { word: "light", emoji: "💡", hint: "Helps you see in the dark" },
    { word: "moon", emoji: "🌙", hint: "Glows at night" },
    { word: "nest", emoji: "🪺", hint: "A bird's home" },
    { word: "ocean", emoji: "🌊", hint: "A vast body of water" },
    { word: "pencil", emoji: "✏️", hint: "Used for writing" },
    { word: "queen", emoji: "👑", hint: "A royal ruler" },
    { word: "river", emoji: "🏞️", hint: "Flows to the sea" },
    { word: "smile", emoji: "😄", hint: "Show it when happy" },
    { word: "train", emoji: "🚂", hint: "Travels on rails" },
  ],
  Hindi: [
    { word: "सेब", emoji: "🍎", hint: "एक लाल या हरा फल" },
    { word: "पुल", emoji: "🌉", hint: "आप इससे पानी पार करते हैं" },
    { word: "बादल", emoji: "☁️", hint: "आसमान में पाया जाता है" },
    { word: "सपना", emoji: "💭", hint: "सोते समय जो आप देखते हैं" },
    { word: "पृथ्वी", emoji: "🌍", hint: "हमारा गृह ग्रह" },
    { word: "आग", emoji: "🔥", hint: "गर्म और चमकदार" },
    { word: "बगीचा", emoji: "🌷", hint: "जहाँ फूल उगते हैं" },
    { word: "खुश", emoji: "😊", hint: "एक आनंदमय भावना" },
    { word: "द्वीप", emoji: "🏝️", hint: "पानी से घिरी भूमि" },
    { word: "जंगल", emoji: "🌿", hint: "एक घना उष्णकटिबंधीय वन" },
    { word: "पतंग", emoji: "🪁", hint: "हवा में उड़ती है" },
    { word: "रोशनी", emoji: "💡", hint: "अंधेरे में देखने में मदद करती है" },
    { word: "चाँद", emoji: "🌙", hint: "रात को चमकता है" },
    { word: "घोंसला", emoji: "🪺", hint: "एक पक्षी का घर" },
    { word: "महासागर", emoji: "🌊", hint: "पानी का एक विशाल निकाय" },
    { word: "पेंसिल", emoji: "✏️", hint: "लिखने के लिए इस्तेमाल की जाती है" },
    { word: "रानी", emoji: "👑", hint: "एक शाही शासक" },
    { word: "नदी", emoji: "🏞️", hint: "समुद्र की ओर बहती है" },
    { word: "मुस्कान", emoji: "😄", hint: "खुश होने पर दिखाएं" },
    { word: "ट्रेन", emoji: "🚂", hint: "पटरी पर चलती है" },
  ],
  Kannada: [
    { word: "ಸೇಬು", emoji: "🍎", hint: "ಒಂದು ಕೆಂಪು ಅಥವಾ ಹಸಿರು ಹಣ್ಣು" },
    { word: "ಸೇತುವೆ", emoji: "🌉", hint: "ನೀವು ಇದರ ಮೇಲೆ ನೀರನ್ನು ದಾಟುತ್ತೀರಿ" },
    { word: "ಮೋಡ", emoji: "☁️", hint: "ಆಕಾಶದಲ್ಲಿ ಕಂಡುಬರುತ್ತದೆ" },
    { word: "ಕನಸು", emoji: "💭", hint: "ನಿದ್ರಿಸುವಾಗ ನೀವು ಕಾಣುವ ದೃಶ್ಯ" },
    { word: "ಭೂಮಿ", emoji: "🌍", hint: "ನಮ್ಮ ವಾಸಸ್ಥಾನ ಗ್ರಹ" },
    { word: "ಬೆಂಕಿ", emoji: "🔥", hint: "ಬಿಸಿ ಮತ್ತು ಪ್ರಕಾಶಮಾನ" },
    { word: "ತೋಟ", emoji: "🌷", hint: "ಹೂವುಗಳು ಬೆಳೆಯುವ ಸ್ಥಳ" },
    { word: "ಸಂತೋಷ", emoji: "😊", hint: "ಆನಂದದಾಯಕ ಭಾವನೆ" },
    { word: "ದ್ವೀಪ", emoji: "🏝️", hint: "ನೀರಿನಿಂದ ಆವೃತವಾದ ಭೂಮಿ" },
    { word: "ಅರಣ್ಯ", emoji: "🌿", hint: "ದಟ್ಟವಾದ ಉಷ್ಣವಲಯದ ಕಾಡು" },
    { word: "ಗಾಳಿಪಟ", emoji: "🪁", hint: "ಗಾಳಿಯಲ್ಲಿ ಹಾರುತ್ತದೆ" },
    { word: "ಬೆಳಕು", emoji: "💡", hint: "ಕತ್ತಲಲ್ಲಿ ನೋಡಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ" },
    { word: "ಚಂದ್ರ", emoji: "🌙", hint: "ರಾತ್ರಿಯಲ್ಲಿ ಹೊಳೆಯುತ್ತದೆ" },
    { word: "ಗೂಡು", emoji: "🪺", hint: "ಹಕ್ಕಿಯ ಮನೆ" },
    { word: "ಸಾಗರ", emoji: "🌊", hint: "ಬೃಹತ್ ಜಲರಾಶಿ" },
    { word: "ಪೆನ್ಸಿಲ್", emoji: "✏️", hint: "ಬರೆಯಲು ಬಳಸಲಾಗುತ್ತದೆ" },
    { word: "ರಾಣಿ", emoji: "👑", hint: "ರಾಜಮನೆತನದ ಆಡಳಿತಗಾರ್ತಿ" },
    { word: "ನದಿ", emoji: "🏞️", hint: "ಸಮುದ್ರಕ್ಕೆ ಹರಿಯುತ್ತದೆ" },
    { word: "ನಗು", emoji: "😄", hint: "ಖುಷಿಯಾದಾಗ ತೋರಿಸಿ" },
    { word: "ರೈಲು", emoji: "🚂", hint: "ಹಳಿಗಳ ಮೇಲೆ ಚಲಿಸುತ್ತದೆ" },
  ],
  Telugu: [
    { word: "ఆపిల్", emoji: "🍎", hint: "ఒక ఎరుపు లేదా ఆకుపచ్చ పండు" },
    { word: "వంతెన", emoji: "🌉", hint: "దీనిపై నీటిని దాటుతాము" },
    { word: "మేఘం", emoji: "☁️", hint: "ఆకాశంలో కనిపిస్తుంది" },
    { word: "కల", emoji: "💭", hint: "నిద్రపోతున్నప్పుడు వచ్చేది" },
    { word: "భూమి", emoji: "🌍", hint: "మన నివాస గ్రహం" },
    { word: "నిప్పు", emoji: "🔥", hint: "వేడిగా మరియు ప్రకాశవంతంగా ఉంటుంది" },
    { word: "తోట", emoji: "🌷", hint: "పువ్వులు పెరిగే స్థలం" },
    { word: "సంతోషం", emoji: "😊", hint: "ఒక ఆనందకరమైన అనుభూతి" },
    { word: "ద్వీపం", emoji: "🏝️", hint: "నీటితో చుట్టబడిన భూమి" },
    { word: "అడవి", emoji: "🌿", hint: "దట్టమైన ఉష్ణమండల అరణ్యం" },
    { word: "గాలిపటం", emoji: "🪁", hint: "గాలిలో ఎగురుతుంది" },
    { word: "వెలుగు", emoji: "💡", hint: "చీకటిలో చూడటానికి సహాయపడుతుంది" },
    { word: "చంద్రుడు", emoji: "🌙", hint: "రాత్రి వేళ ప్రకాశిస్తాడు" },
    { word: "గూడు", emoji: "🪺", hint: "పక్షి నివాసం" },
    { word: "సముద్రం", emoji: "🌊", hint: "భారీ జలరాశి" },
    { word: "పెన్సిల్", emoji: "✏️", hint: "రాయడానికి ఉపయోగిస్తాము" },
    { word: "రాణి", emoji: "👑", hint: "ఒక రాజ కుటుంబ పాలకురాలు" },
    { word: "నది", emoji: "🏞️", hint: "సముద్రం వైపు ప్రవహిస్తుంది" },
    { word: "నవ్వు", emoji: "😄", hint: "ఆనందంగా ఉన్నప్పుడు చూపించేది" },
    { word: "రైలు", emoji: "🚂", hint: "పట్టాలపై నడుస్తుంది" },
  ],
  Tamil: [
    { word: "ஆப்பிள்", emoji: "🍎", hint: "ஒரு சிவப்பு அல்லது பச்சை பழம்" },
    { word: "பாலம்", emoji: "🌉", hint: "இதன் மூலம் நீங்கள் நீரை கடக்கலாம்" },
    { word: "மேகம்", emoji: "☁️", hint: "வானத்தில் காணப்படும்" },
    { word: "கனவு", emoji: "💭", hint: "தூங்கும் போது நீங்கள் காண்பது" },
    { word: "பூமி", emoji: "🌍", hint: "நமது தாய் கிரகம்" },
    { word: "நெருப்பு", emoji: "🔥", hint: "வெப்பமான மற்றும் பிரகாசமானது" },
    { word: "தோட்டம்", emoji: "🌷", hint: "பூக்கள் வளரும் இடம்" },
    { word: "மகிழ்ச்சி", emoji: "😊", hint: "ஒரு மகிழ்ச்சியான உணர்வு" },
    { word: "தீவு", emoji: "🏝️", hint: "நீரால் சூழப்பட்ட நிலப்பகுதி" },
    { word: "காடு", emoji: "🌿", hint: "அடர்ந்த வெப்பமண்டல காடு" },
    { word: "பட்டம்", emoji: "🪁", hint: "காற்றில் பறக்கும்" },
    { word: "வெளிச்சம்", emoji: "💡", hint: "இருட்டில் பார்க்க உதவும்" },
    { word: "நிலா", emoji: "🌙", hint: "இரவில் ஒளிரும்" },
    { word: "கூடு", emoji: "🪺", hint: "ஒரு பறவையின் இல்லம்" },
    { word: "பெருங்கடல்", emoji: "🌊", hint: "ஒரு பரந்த நீர்நிலை" },
    { word: "பென்சில்", emoji: "✏️", hint: "எழுதுவதற்குப் பயன்படும்" },
    { word: "ராணி", emoji: "👑", hint: "ஒரு அரச ஆட்சியாளர்" },
    { word: "ஆறு", emoji: "🏞️", hint: "கடலை நோக்கி பாய்கிறது" },
    { word: "புன்னகை", emoji: "😄", hint: "மகிழ்ச்சியாக இருக்கும்போது காட்டுங்கள்" },
    { word: "ரயில்", emoji: "🚂", hint: "தண்டவாளத்தில் செல்லும்" },
  ]
};

function WordSprintGame({ t = (key) => key, learningLanguage = "English", interfaceLanguage = "English", speakText, onXpEarned, onClose, aiEnabled = true }) {
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [words, setWords] = useState([]);
  const [skipped, setSkipped] = useState(0);
  const [currentOptions, setCurrentOptions] = useState([]);
  const inputRef = useRef(null);
  const timerRef = useRef(null);

  const currentWord = words[currentIndex];

  const startGame = () => {
    setLoading(true);
    generatePracticeContent({
      practiceType: "Word Sprint",
      language: learningLanguage || "English",
      learningLanguage: learningLanguage || "English",
      literacyLevel: 5,
      literacyLevelName: "Intermediate",
      interfaceLanguage: interfaceLanguage || "English",
      useFallback: !aiEnabled
    }).then(res => {
      let list = [];
      if (res && res.questions && res.questions.length > 0) {
        list = res.questions;
      } else {
        list = WORD_SPRINT_WORDS_BY_LANG[learningLanguage] || WORD_SPRINT_WORDS_BY_LANG["English"];
      }
      const shuffled = [...list].sort(() => Math.random() - 0.5).slice(0, 10);
      setWords(shuffled);
      setCurrentIndex(0);
      setInput("");
      setScore(0);
      setCombo(0);
      setMaxCombo(0);
      setSkipped(0);
      setTimeLeft(60);
      setPhase("playing");
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }).catch(e => {
      console.warn("Failed to load Word Sprint from AI, using fallbacks:", e);
      const list = WORD_SPRINT_WORDS_BY_LANG[learningLanguage] || WORD_SPRINT_WORDS_BY_LANG["English"];
      const shuffled = [...list].sort(() => Math.random() - 0.5).slice(0, 10);
      setWords(shuffled);
      setCurrentIndex(0);
      setInput("");
      setScore(0);
      setCombo(0);
      setMaxCombo(0);
      setSkipped(0);
      setTimeLeft(60);
      setPhase("playing");
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    });
  };

  useEffect(() => {
    if (phase !== "playing") return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setPhase("result");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  // Generate 3 blocks of options for non-English target languages
  useEffect(() => {
    if (phase === "playing" && currentWord && learningLanguage !== "English") {
      const correct = currentWord.word;
      const otherWords = words.filter(w => w.word !== correct).map(w => w.word);
      const shuffledOthers = [...otherWords].sort(() => Math.random() - 0.5);
      const options = [correct, shuffledOthers[0], shuffledOthers[1]].filter(Boolean);
      const shuffledOptions = options.sort(() => Math.random() - 0.5);
      setCurrentOptions(shuffledOptions);
    }
  }, [currentIndex, words, phase, learningLanguage, currentWord]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!currentWord || feedback) return;
    const trimmed = input.trim().toLowerCase();
    if (trimmed === currentWord.word.toLowerCase()) {
      const newCombo = combo + 1;
      setCombo(newCombo);
      setMaxCombo((m) => Math.max(m, newCombo));
      const points = newCombo >= 3 ? 3 : newCombo >= 2 ? 2 : 1;
      setScore((s) => s + points);
      setFeedback("correct");
      playChime("correct");
    } else {
      setCombo(0);
      setFeedback("wrong");
      playChime("incorrect");
    }
    setInput("");
    setTimeout(() => {
      setFeedback(null);
      setCurrentIndex((i) => {
        if (i + 1 >= words.length) {
          clearInterval(timerRef.current);
          setPhase("result");
          return i;
        }
        return i + 1;
      });
      inputRef.current?.focus();
    }, 500);
  };

  const handleOptionSelect = (selectedWord) => {
    if (!currentWord || feedback) return;
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (selectedWord === currentWord.word) {
      const newCombo = combo + 1;
      setCombo(newCombo);
      setMaxCombo((m) => Math.max(m, newCombo));
      const points = newCombo >= 3 ? 3 : newCombo >= 2 ? 2 : 1;
      setScore((s) => s + points);
      setFeedback("correct");
      playChime("correct");
    } else {
      setCombo(0);
      setFeedback("wrong");
      playChime("incorrect");
    }
    setTimeout(() => {
      setFeedback(null);
      setCurrentIndex((i) => {
        if (i + 1 >= words.length) {
          clearInterval(timerRef.current);
          setPhase("result");
          return i;
        }
        return i + 1;
      });
    }, 500);
  };

  const handleSkip = () => {
    setCombo(0);
    setSkipped((s) => s + 1);
    setInput("");
    setCurrentIndex((i) => {
      if (i + 1 >= words.length) {
        clearInterval(timerRef.current);
        setPhase("result");
        return i;
      }
      return i + 1;
    });
    inputRef.current?.focus();
  };

  const xpEarned = Math.min(score * 2, 30);
  const timerPct = (timeLeft / 60) * 100;
  const timerColor = timeLeft > 20 ? "var(--flz-ok)" : timeLeft > 10 ? "var(--flz-warn)" : "var(--flz-bad)";

  if (phase === "intro") {
    return (
      <div className="flz-game-intro">
        <div className="flz-intro-icon">⚡</div>
        <h2 className="flz-intro-title">Word Sprint</h2>
        <p className="flz-intro-desc">
          {t("wordSprintIntroDesc").replace("{time}", 60)}
        </p>
        <div className="flz-intro-rules">
          <div className="flz-rule">{t("wordSprintRule1")}</div>
          <div className="flz-rule">{t("wordSprintRule2")}</div>
          <div className="flz-rule">{t("wordSprintRule3")}</div>
        </div>
        <button className="flz-start-btn" onClick={startGame} disabled={loading}>
          {loading ? "Loading..." : t("startSprintBtn")}
        </button>
      </div>
    );
  }

  if (phase === "result") {
    return (
      <div className="flz-result">
        <div className="flz-result-emoji">🏆</div>
        <h2 className="flz-result-title">{t("sprintCompleteTitle")}</h2>
        <div className="flz-result-stats">
          <div className="flz-stat-box">
            <div className="flz-stat-val">{score}</div>
            <div className="flz-stat-label">{t("scoreLabel")}</div>
          </div>
          <div className="flz-stat-box flz-stat-xp">
            <div className="flz-stat-val">+{xpEarned}</div>
            <div className="flz-stat-label">{t("xpEarnedLabel")}</div>
          </div>
          <div className="flz-stat-box">
            <div className="flz-stat-val">🔥{maxCombo}x</div>
            <div className="flz-stat-label">{t("bestComboLabel")}</div>
          </div>
        </div>
        <div className="flz-result-actions">
          <button className="flz-start-btn" onClick={() => { onXpEarned(xpEarned); startGame(); }}>
            {t("playAgainBtn")}
          </button>
          <button className="flz-secondary-btn" onClick={() => { onXpEarned(xpEarned); onClose(); }}>
            {t("collectXpExitBtn")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flz-sprint-game">
      <div className="flz-timer-row">
        <div className="flz-timer-track">
          <div className="flz-timer-fill" style={{ width: `${timerPct}%`, background: timerColor }} />
        </div>
        <span className="flz-timer-num" style={{ color: timerColor }}>{timeLeft}s</span>
      </div>
      <div className="flz-sprint-top">
        <div className="flz-score-chip">⭐ {score} {t("scoreLabel")}</div>
        {combo >= 2 && (
          <div className="flz-combo-chip">🔥 x{combo} Combo!</div>
        )}
        <div className="flz-word-count">{currentIndex + 1}/{words.length}</div>
      </div>
      {currentWord && (
        <div className={`flz-word-card ${feedback || ""}`}>
          <div className="flz-word-emoji">{currentWord.emoji}</div>
          <p className="flz-word-hint">{currentWord.hint}</p>
          {feedback === "correct" && <div className="flz-feedback correct">{t("correctFeedback")}</div>}
          {feedback === "wrong" && <div className="flz-feedback wrong">{t("tryAgainFeedback")}</div>}
        </div>
      )}

      {learningLanguage === "English" ? (
        <form onSubmit={handleSubmit} className="flz-sprint-form">
          <input
            ref={inputRef}
            className="flz-sprint-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("typeWordPlaceholder")}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />
          <button type="submit" className="flz-submit-btn">→</button>
        </form>
      ) : (
        <div className="flz-sprint-options">
          {currentOptions.map((opt) => (
            <button
              key={opt}
              className="flz-sprint-option-btn"
              onClick={() => handleOptionSelect(opt)}
              onMouseEnter={() => {
                if (speakText && opt && !feedback) {
                  speakText(opt, 0.9, learningLanguage);
                }
              }}
              disabled={feedback !== null}
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      <button className="flz-skip-btn" onClick={handleSkip}>{t("skipBtn")}</button>
    </div>
  );
}

// ─── Word Scramble Game ───────────────────────────────────────────────────────
const SCRAMBLE_WORDS_BY_LANG = {
  English: [
    { word: "LEARN", tiles: ["L", "E", "A", "R", "N"], category: "Education", emoji: "📚" },
    { word: "SPEAK", tiles: ["S", "P", "E", "A", "K"], category: "Skills", emoji: "🗣️" },
    { word: "WRITE", tiles: ["W", "R", "I", "T", "E"], category: "Skills", emoji: "✍️" },
    { word: "STORY", tiles: ["S", "T", "O", "R", "Y"], category: "Language", emoji: "📖" },
    { word: "BRAVE", tiles: ["B", "R", "A", "V", "E"], category: "Traits", emoji: "🦁" },
    { word: "SMILE", tiles: ["S", "M", "I", "L", "E"], category: "Emotions", emoji: "😊" },
    { word: "CLEAN", tiles: ["C", "L", "E", "A", "N"], category: "Adjectives", emoji: "✨" },
    { word: "BREAD", tiles: ["B", "R", "E", "A", "D"], category: "Food", emoji: "🍞" },
    { word: "PLANT", tiles: ["P", "L", "A", "N", "T"], category: "Nature", emoji: "🌱" },
    { word: "GLOBE", tiles: ["G", "L", "O", "B", "E"], category: "World", emoji: "🌍" },
    { word: "MUSIC", tiles: ["M", "U", "S", "I", "C"], category: "Arts", emoji: "🎵" },
    { word: "LIGHT", tiles: ["L", "I", "G", "H", "T"], category: "Science", emoji: "💡" },
    { word: "HAPPY", tiles: ["H", "A", "P", "P", "Y"], category: "Emotions", emoji: "😄" },
    { word: "RIVER", tiles: ["R", "I", "V", "E", "R"], category: "Nature", emoji: "🏞️" },
    { word: "DREAM", tiles: ["D", "R", "E", "A", "M"], category: "Concepts", emoji: "💭" },
  ],
  Hindi: [
    { word: "मुस्कान", tiles: ["मु", "स्का", "न"], category: "Emotions", emoji: "😊" },
    { word: "साफ़", tiles: ["सा", "फ़"], category: "Adjectives", emoji: "✨" },
    { word: "रोटी", tiles: ["रो", "टी"], category: "Food", emoji: "🍞" },
    { word: "पौधा", tiles: ["पौ", "धा"], category: "Nature", emoji: "🌱" },
    { word: "ग्लोब", tiles: ["ग्लो", "ब"], category: "World", emoji: "🌍" },
    { word: "संगीत", tiles: ["सं", "गी", "त"], category: "Arts", emoji: "🎵" },
    { word: "प्रकाश", tiles: ["प्र", "का", "श"], category: "Science", emoji: "💡" },
    { word: "खुश", tiles: ["खु", "श"], category: "Emotions", emoji: "😄" },
    { word: "नदी", tiles: ["न", "दी"], category: "Nature", emoji: "🏞️" },
    { word: "सपना", tiles: ["स", "प", "ना"], category: "Concepts", emoji: "💭" },
  ],
  Kannada: [
    { word: "ನಗು", tiles: ["ನ", "ಗು"], category: "Emotions", emoji: "😊" },
    { word: "ಸ್ವಚ್ಛ", tiles: ["ಸ್ವ", "ಚ್ಛ"], category: "Adjectives", emoji: "✨" },
    { word: "ರೊಟ್ಟಿ", tiles: ["ರೊ", "ಟ್ಟಿ"], category: "Food", emoji: "🍞" },
    { word: "ಗಿಡ", tiles: ["ಗಿ", "ಡ"], category: "Nature", emoji: "🌱" },
    { word: "ಭೂಗೋಳ", tiles: ["ಭೂ", "ಗೋ", "ಳ"], category: "World", emoji: "🌍" },
    { word: "ಸಂಗೀತ", tiles: ["ಸಂ", "ಗೀ", "ತ"], category: "Arts", emoji: "🎵" },
    { word: "ಬೆಳಕು", tiles: ["ಬೆ", "ಳ", "ಕು"], category: "Science", emoji: "💡" },
    { word: "ಖುಷಿ", tiles: ["ಖು", "ಷಿ"], category: "Emotions", emoji: "😄" },
    { word: "ನದಿ", tiles: ["ನ", "ದಿ"], category: "Nature", emoji: "🏞️" },
    { word: "ಕನಸು", tiles: ["ಕ", "ನ", "ಸು"], category: "Concepts", emoji: "💭" },
  ],
  Telugu: [
    { word: "నవ్వు", tiles: ["న", "వ్వు"], category: "Emotions", emoji: "😊" },
    { word: "శుభ్రం", tiles: ["శు", "భ్రం"], category: "Adjectives", emoji: "✨" },
    { word: "రొట్టె", tiles: ["రొ", "ట్టె"], category: "Food", emoji: "🍞" },
    { word: "మొక్క", tiles: ["మొ", "క్క"], category: "Nature", emoji: "🌱" },
    { word: "గ్లోబ్", tiles: ["గ్లో", "బ్"], category: "World", emoji: "🌍" },
    { word: "సంగీతం", tiles: ["సం", "గీ", "తం"], category: "Arts", emoji: "🎵" },
    { word: "వెలుగు", tiles: ["వె", "లు", "గు"], category: "Science", emoji: "💡" },
    { word: "సంతోషం", tiles: ["సం", "తో", "షం"], category: "Emotions", emoji: "😄" },
    { word: "నది", tiles: ["న", "ది"], category: "Nature", emoji: "🏞️" },
    { word: "కల", tiles: ["క", "ల"], category: "Concepts", emoji: "💭" },
  ],
  Tamil: [
    { word: "புன்னகை", tiles: ["புன்", "ன", "கை"], category: "Emotions", emoji: "😊" },
    { word: "சுத்தம்", tiles: ["சுத்", "த", "ம்"], category: "Adjectives", emoji: "✨" },
    { word: "ரொட்டி", tiles: ["ரொ", "ட்டி"], category: "Food", emoji: "🍞" },
    { word: "செடி", tiles: ["செ", "டி"], category: "Nature", emoji: "🌱" },
    { word: "உலகம்", tiles: ["உ", "ல", "க", "ம்"], category: "World", emoji: "🌍" },
    { word: "இசை", tiles: ["இ", "சை"], category: "Arts", emoji: "🎵" },
    { word: "ஒளி", tiles: ["ஒ", "ளி"], category: "Science", emoji: "💡" },
    { word: "மகிழ்ச்சி", tiles: ["ம", "கிழ்", "ச்சி"], category: "Emotions", emoji: "😄" },
    { word: "ஆறு", tiles: ["ஆ", "று"], category: "Nature", emoji: "🏞️" },
    { word: "கனவு", tiles: ["க", "ன", "வு"], category: "Concepts", emoji: "💭" },
  ]
};

function scrambleTiles(tiles) {
  const arr = [...tiles];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  let isIdentical = true;
  for (let i = 0; i < tiles.length; i++) {
    if (tiles[i] !== arr[i]) {
      isIdentical = false;
      break;
    }
  }
  if (isIdentical && tiles.length > 1) {
    const allSame = tiles.every(t => t === tiles[0]);
    if (allSame) return arr;
    return scrambleTiles(tiles);
  }
  return arr;
}

function WordScrambleGame({ t = (key) => key, learningLanguage = "English", interfaceLanguage = "English", speakText, onXpEarned, onClose, aiEnabled = true }) {
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState("intro");
  const [wordIdx, setWordIdx] = useState(0);
  const [words, setWords] = useState([]);
  const [selected, setSelected] = useState([]);
  const [remaining, setRemaining] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [feedback, setFeedback] = useState(null);
  const [shake, setShake] = useState(false);
  const timerRef = useRef(null);
  const wordsRef = useRef([]);

  const loadWord = useCallback((wordList, idx) => {
    const wordObj = wordList[idx];
    if (!wordObj) return;
    if (!wordObj.tiles || !Array.isArray(wordObj.tiles)) {
      wordObj.tiles = wordObj.word.split("");
    }

    // Pick 2 random extra tiles from other words in the list to confuse the user
    const otherWords = wordList.filter(w => w.word !== wordObj.word);
    const allOtherTiles = otherWords.flatMap(w => w.tiles);
    const extraTiles = [];
    let attempts = 0;
    while (extraTiles.length < 2 && allOtherTiles.length > 0 && attempts < 100) {
      attempts++;
      const randTile = allOtherTiles[Math.floor(Math.random() * allOtherTiles.length)];
      if (!wordObj.tiles.includes(randTile) && !extraTiles.includes(randTile)) {
        extraTiles.push(randTile);
      }
      // Safeguard / fallback if no distinct other tiles exist
      if (extraTiles.length < 2 && allOtherTiles.every(t => wordObj.tiles.includes(t) || extraTiles.includes(t))) {
        const fallbackList = learningLanguage === "English" ? ["A", "E", "I", "O", "U", "S", "T"] : ["अ", "क", "म", "न", "ರ", "ಕ", "త", "న", "ப", "ம"];
        const randFallback = fallbackList[Math.floor(Math.random() * fallbackList.length)];
        if (!extraTiles.includes(randFallback)) {
          extraTiles.push(randFallback);
        }
      }
    }

    const combinedTiles = [...wordObj.tiles, ...extraTiles];
    const scTiles = scrambleTiles(combinedTiles);

    setSelected([]);
    setRemaining(scTiles.map((tile, i) => ({ letter: tile, id: i, used: false })));
    setFeedback(null);
    setTimeLeft(30);
  }, [learningLanguage]);

  const startGame = () => {
    setLoading(true);
    generatePracticeContent({
      practiceType: "Word Scramble",
      language: learningLanguage || "English",
      literacyLevel: 5,
      literacyLevelName: "Intermediate",
      interfaceLanguage: interfaceLanguage || "English",
      useFallback: !aiEnabled
    }).then(res => {
      let list = [];
      if (res && res.questions) {
        list = res.questions;
      } else {
        list = SCRAMBLE_WORDS_BY_LANG[learningLanguage] || SCRAMBLE_WORDS_BY_LANG["English"];
      }
      const shuffled = [...list].sort(() => Math.random() - 0.5).slice(0, 10);
      wordsRef.current = shuffled;
      setWords(shuffled);
      setWordIdx(0);
      setScore(0);
      setPhase("playing");
      setLoading(false);
      loadWord(shuffled, 0);
    }).catch(e => {
      console.warn("Failed to load Word Scramble from AI, using fallbacks:", e);
      const list = SCRAMBLE_WORDS_BY_LANG[learningLanguage] || SCRAMBLE_WORDS_BY_LANG["English"];
      const shuffled = [...list].sort(() => Math.random() - 0.5).slice(0, 10);
      wordsRef.current = shuffled;
      setWords(shuffled);
      setWordIdx(0);
      setScore(0);
      setPhase("playing");
      setLoading(false);
      loadWord(shuffled, 0);
    });
  };

  const goNext = useCallback((correct) => {
    clearInterval(timerRef.current);
    if (correct) setScore((s) => s + 1);
    setWordIdx((idx) => {
      const nextIdx = idx + 1;
      const list = wordsRef.current;
      if (nextIdx >= list.length) {
        setPhase("result");
        return idx;
      }
      setTimeout(() => loadWord(list, nextIdx), 600);
      return nextIdx;
    });
  }, [loadWord]);

  useEffect(() => {
    if (phase !== "playing") return;
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          goNext(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, wordIdx, goNext]);

  const handleSelect = (item) => {
    if (item.used) return;
    if (speakText && item.letter) {
      speakText(item.letter, 0.9, learningLanguage);
    }
    const newSel = [...selected, item.letter];
    const newRem = remaining.map((l) => l.id === item.id ? { ...l, used: true } : l);
    setSelected(newSel);
    setRemaining(newRem);
    const currentWordObj = wordsRef.current[wordIdx];
    const correctTiles = currentWordObj?.tiles || [];
    if (newSel.length === correctTiles.length) {
      const isCorrect = newSel.every((val, i) => val === correctTiles[i]);
      if (isCorrect) {
        setFeedback("correct");
        playChime("correct");
        setTimeout(() => goNext(true), 700);
      } else {
        setShake(true);
        setFeedback("wrong");
        playChime("incorrect");
        setTimeout(() => {
          setShake(false);
          loadWord(wordsRef.current, wordIdx);
        }, 700);
      }
    }
  };

  const handleDeselect = (idx) => {
    const letter = selected[idx];
    const newSel = selected.filter((_, i) => i !== idx);
    setSelected(newSel);
    const firstUsed = remaining.find((l) => l.letter === letter && l.used);
    if (firstUsed) {
      setRemaining(remaining.map((l) => l.id === firstUsed.id ? { ...l, used: false } : l));
    }
  };

  const xpEarned = Math.min(score * 5, 40);
  const timerPct = (timeLeft / 30) * 100;
  const timerColor = timeLeft > 15 ? "var(--flz-ok)" : timeLeft > 8 ? "var(--flz-warn)" : "var(--flz-bad)";
  const currentWordObj = words[wordIdx];

  if (phase === "intro") {
    return (
      <div className="flz-game-intro">
        <div className="flz-intro-icon">🔀</div>
        <h2 className="flz-intro-title">Word Scramble</h2>
        <p className="flz-intro-desc">
          {t("wordScrambleIntroDesc")}
        </p>
        <div className="flz-intro-rules">
          <div className="flz-rule">{t("wordScrambleRule1")}</div>
          <div className="flz-rule">{t("wordScrambleRule2")}</div>
          <div className="flz-rule">{t("wordScrambleRule3")}</div>
        </div>
        <button className="flz-start-btn" onClick={startGame}>{t("unscrambleBtn")}</button>
      </div>
    );
  }

  if (phase === "result") {
    return (
      <div className="flz-result">
        <div className="flz-result-emoji">🎉</div>
        <h2 className="flz-result-title">{t("scrambleDoneTitle")}</h2>
        <div className="flz-result-stats">
          <div className="flz-stat-box">
            <div className="flz-stat-val">{score}/{words.length}</div>
            <div className="flz-stat-label">{t("correctLabel")}</div>
          </div>
          <div className="flz-stat-box flz-stat-xp">
            <div className="flz-stat-val">+{xpEarned}</div>
            <div className="flz-stat-label">{t("xpEarnedLabel")}</div>
          </div>
        </div>
        <div className="flz-result-actions">
          <button className="flz-start-btn" onClick={() => { onXpEarned(xpEarned); startGame(); }}>
            {t("playAgainBtn")}
          </button>
          <button className="flz-secondary-btn" onClick={() => { onXpEarned(xpEarned); onClose(); }}>
            {t("collectXpExitBtn")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flz-scramble-game">
      <div className="flz-timer-row">
        <div className="flz-timer-track">
          <div className="flz-timer-fill" style={{ width: `${timerPct}%`, background: timerColor }} />
        </div>
        <span className="flz-timer-num" style={{ color: timerColor }}>{timeLeft}s</span>
      </div>
      <div className="flz-sprint-top">
        <div className="flz-score-chip">✅ {score}/{words.length}</div>
        <div className="flz-word-count">⭐ {score * 5} XP</div>
      </div>
      {currentWordObj && (
        <div className="flz-scramble-info">
          <span className="flz-scramble-emoji">{currentWordObj.emoji}</span>
          <span className="flz-scramble-cat">{currentWordObj.category}</span>
        </div>
      )}
      <div className={`flz-answer-slots ${shake ? "flz-shake" : ""} ${feedback === "correct" ? "flz-correct-anim" : ""}`}>
        {currentWordObj && Array.from({ length: currentWordObj.tiles?.length || currentWordObj.word.length }).map((_, i) => (
          <div
            key={i}
            className={`flz-slot ${selected[i] ? "filled" : "empty"} ${feedback === "correct" ? "correct" : feedback === "wrong" ? "wrong" : ""}`}
            onClick={() => selected[i] && handleDeselect(i)}
          >
            {selected[i] || ""}
          </div>
        ))}
      </div>
      <div className="flz-letter-tiles">
        {remaining.map((item) => (
          <button
            key={item.id}
            className={`flz-letter-tile ${item.used ? "used" : ""}`}
            onClick={() => handleSelect(item)}
            disabled={item.used}
          >
            {item.letter}
          </button>
        ))}
      </div>
      <button className="flz-skip-btn" onClick={() => goNext(false)}>{t("skipBtn")}</button>
    </div>
  );
}

// ─── Memory Match Game ─────────────────────────────────────────────────────────
const MEMORY_PAIRS_BY_LANG = {
  English: [
    { id: "apple", emoji: "🍎", word: "APPLE" },
    { id: "book", emoji: "📚", word: "BOOK" },
    { id: "cat", emoji: "🐱", word: "CAT" },
    { id: "door", emoji: "🚪", word: "DOOR" },
    { id: "eye", emoji: "👁️", word: "EYE" },
    { id: "fire", emoji: "🔥", word: "FIRE" },
    { id: "gift", emoji: "🎁", word: "GIFT" },
    { id: "heart", emoji: "❤️", word: "HEART" },
  ],
  Hindi: [
    { id: "apple", emoji: "🍎", word: "सेब" },
    { id: "book", emoji: "📚", word: "किताब" },
    { id: "cat", emoji: "🐱", word: "बिल्ली" },
    { id: "door", emoji: "🚪", word: "दरवाजा" },
    { id: "eye", emoji: "👁️", word: "आँख" },
    { id: "fire", emoji: "🔥", word: "आग" },
    { id: "gift", emoji: "🎁", word: "उपहार" },
    { id: "heart", emoji: "❤️", word: "दिल" },
  ],
  Kannada: [
    { id: "apple", emoji: "🍎", word: "ಸೇಬು" },
    { id: "book", emoji: "📚", word: "ಪುಸ್ತಕ" },
    { id: "cat", emoji: "🐱", word: "ಬೆಕ್ಕು" },
    { id: "door", emoji: "🚪", word: "ಬಾಗಿಲು" },
    { id: "eye", emoji: "👁️", word: "ಕಣ್ಣು" },
    { id: "fire", emoji: "🔥", word: "ಬೆಂಕಿ" },
    { id: "gift", emoji: "🎁", word: "ಉಡುಗೊರೆ" },
    { id: "heart", emoji: "❤️", word: "ಹೃದಯ" },
  ],
  Telugu: [
    { id: "apple", emoji: "🍎", word: "ఆపిల్" },
    { id: "book", emoji: "📚", word: "పుస్తకం" },
    { id: "cat", emoji: "🐱", word: "పిల్లి" },
    { id: "door", emoji: "🚪", word: "తలుపు" },
    { id: "eye", emoji: "👁️", word: "కన్ను" },
    { id: "fire", emoji: "🔥", word: "నిప్పు" },
    { id: "gift", emoji: "🎁", word: "బహుమతి" },
    { id: "heart", emoji: "❤️", word: "గుండె" },
  ],
  Tamil: [
    { id: "apple", emoji: "🍎", word: "ஆப்பிள்" },
    { id: "book", emoji: "📚", word: "புத்தகம்" },
    { id: "cat", emoji: "🐱", word: "பூனை" },
    { id: "door", emoji: "🚪", word: "கதவு" },
    { id: "eye", emoji: "👁️", word: "கண்" },
    { id: "fire", emoji: "🔥", word: "நெருப்பு" },
    { id: "gift", emoji: "🎁", word: "பரிசு" },
    { id: "heart", emoji: "❤️", word: "இதயம்" },
  ]
};

function MemoryMatchGame({ t = (key) => key, learningLanguage = "English", speakText, onXpEarned, onClose, aiEnabled = true }) {
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState("intro");
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(90);
  const [canFlip, setCanFlip] = useState(true);
  const timerRef = useRef(null);

  const list = MEMORY_PAIRS_BY_LANG[learningLanguage] || MEMORY_PAIRS_BY_LANG["English"];

  const startGame = () => {
    setLoading(true);
    generatePracticeContent({
      practiceType: "Memory Match",
      language: learningLanguage || "English",
      learningLanguage: learningLanguage || "English",
      literacyLevel: 5,
      literacyLevelName: "Intermediate",
      interfaceLanguage: "English",
      useFallback: !aiEnabled
    }).then(res => {
      let listData = [];
      if (res && res.questions && res.questions.length > 0) {
        listData = res.questions;
      } else {
        listData = list;
      }
      const pairs = listData.flatMap((p) => [
        { ...p, type: "emoji", cardId: p.id + "-emoji" },
        { ...p, type: "word", cardId: p.id + "-word" },
      ]);
      const shuffled = pairs.sort(() => Math.random() - 0.5);
      setCards(shuffled);
      setFlipped([]);
      setMatched([]);
      setMoves(0);
      setTimeLeft(90);
      setCanFlip(true);
      setPhase("playing");
      setLoading(false);
    }).catch(e => {
      console.warn("Failed to load Memory Match from AI, using fallbacks:", e);
      const pairs = list.flatMap((p) => [
        { ...p, type: "emoji", cardId: p.id + "-emoji" },
        { ...p, type: "word", cardId: p.id + "-word" },
      ]);
      const shuffled = pairs.sort(() => Math.random() - 0.5);
      setCards(shuffled);
      setFlipped([]);
      setMatched([]);
      setMoves(0);
      setTimeLeft(90);
      setCanFlip(true);
      setPhase("playing");
      setLoading(false);
    });
  };

  useEffect(() => {
    if (phase !== "playing") return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setPhase("result");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  useEffect(() => {
    if (matched.length === list.length && phase === "playing") {
      clearInterval(timerRef.current);
      setTimeout(() => setPhase("result"), 600);
    }
  }, [matched, phase, list.length]);

  const handleCardClick = (card) => {
    if (!canFlip) return;
    if (flipped.includes(card.cardId)) return;
    if (matched.includes(card.id)) return;

    // Check if this card flip creates a match with the first flipped card
    const firstCardId = flipped[0];
    const firstCard = firstCardId ? cards.find((c) => c.cardId === firstCardId) : null;
    const isMatch = flipped.length === 1 && firstCard && firstCard.id === card.id && firstCard.type !== card.type;

    // Speak card's word unless it's a matching second card (prevent duplicate speech on match)
    if (!isMatch && speakText && card.word) {
      speakText(card.word, 0.9, learningLanguage);
    }

    playChime("click");
    const newFlipped = [...flipped, card.cardId];
    setFlipped(newFlipped);
    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      setCanFlip(false);
      const [c1Id, c2Id] = newFlipped;
      const c1 = cards.find((c) => c.cardId === c1Id);
      const c2 = cards.find((c) => c.cardId === c2Id);
      if (c1 && c2 && c1.id === c2.id && c1.type !== c2.type) {
        setMatched((m) => [...m, c1.id]);
        setFlipped([]);
        setCanFlip(true);
        playChime("correct");
      } else {
        playChime("incorrect");
        setTimeout(() => {
          setFlipped([]);
          setCanFlip(true);
        }, 1000);
      }
    }
  };

  const isFlipped = (card) => flipped.includes(card.cardId) || matched.includes(card.id);
  const isMatched = (card) => matched.includes(card.id);
  const accuracy = moves > 0 ? Math.round((matched.length / moves) * 100) : 0;
  const xpEarned = Math.min(matched.length * 4 + (timeLeft > 30 ? 10 : 0), 40);
  const timerPct = (timeLeft / 90) * 100;
  const timerColor = timeLeft > 40 ? "var(--flz-ok)" : timeLeft > 20 ? "var(--flz-warn)" : "var(--flz-bad)";

  if (phase === "intro") {
    return (
      <div className="flz-game-intro">
        <div className="flz-intro-icon">🧠</div>
        <h2 className="flz-intro-title">Memory Match</h2>
        <p className="flz-intro-desc">
          {t("memoryMatchIntroDesc")}
        </p>
        <div className="flz-intro-rules">
          <div className="flz-rule">{t("memoryMatchRule1")}</div>
          <div className="flz-rule">{t("memoryMatchRule2")}</div>
          <div className="flz-rule">{t("memoryMatchRule3")}</div>
        </div>
        <button className="flz-start-btn" onClick={startGame} disabled={loading}>{loading ? "Loading..." : t("startMatchingBtn")}</button>
      </div>
    );
  }

  if (phase === "result") {
    return (
      <div className="flz-result">
        <div className="flz-result-emoji">{matched.length === list.length ? "🏆" : "⏰"}</div>
        <h2 className="flz-result-title">
          {matched.length === list.length ? t("perfectMatchTitle") : t("timesUpTitle")}
        </h2>
        <div className="flz-result-stats">
          <div className="flz-stat-box">
            <div className="flz-stat-val">{matched.length}/{list.length}</div>
            <div className="flz-stat-label">{t("matchedLabel")}</div>
          </div>
          <div className="flz-stat-box flz-stat-xp">
            <div className="flz-stat-val">+{xpEarned}</div>
            <div className="flz-stat-label">{t("xpEarnedLabel")}</div>
          </div>
          <div className="flz-stat-box">
            <div className="flz-stat-val">{accuracy}%</div>
            <div className="flz-stat-label">{t("accuracyLabel")}</div>
          </div>
        </div>
        <div className="flz-result-actions">
          <button className="flz-start-btn" onClick={() => { onXpEarned(xpEarned); startGame(); }}>
            {t("playAgainBtn")}
          </button>
          <button className="flz-secondary-btn" onClick={() => { onXpEarned(xpEarned); onClose(); }}>
            {t("collectXpExitBtn")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flz-memory-game">
      <div className="flz-timer-row">
        <div className="flz-timer-track">
          <div className="flz-timer-fill" style={{ width: `${timerPct}%`, background: timerColor }} />
        </div>
        <span className="flz-timer-num" style={{ color: timerColor }}>{timeLeft}s</span>
      </div>
      <div className="flz-sprint-top">
        <div className="flz-score-chip">🃏 {matched.length}/{list.length}</div>
        <div className="flz-word-count">🎯 {moves} {t("movesLabel")}</div>
      </div>
      <div className="flz-memory-grid">
        {cards.map((card) => {
          const flippedState = isFlipped(card);
          const matchedState = isMatched(card);
          return (
            <div
              key={card.cardId}
              className={`flz-memory-card ${flippedState ? "flipped" : ""} ${matchedState ? "matched" : ""}`}
              onClick={() => handleCardClick(card)}
            >
              <div className="flz-card-inner">
                <div className="flz-card-back">?</div>
                <div className="flz-card-front">
                  {card.type === "emoji" ? (
                    <span className="flz-card-emoji">{card.emoji}</span>
                  ) : (
                    <span className="flz-card-word">{card.word}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Fun & Learn Zone Shell ────────────────────────────────────────────────────
export default function FunLearnZone({ t = (key) => key, learningLanguage = "English", interfaceLanguage = "English", speakText, onXpEarned, aiEnabled = true }) {
  const [activeGame, setActiveGame] = useState(null);
  const [xpToast, setXpToast] = useState(null);

  const handleXpEarned = (amount) => {
    if (amount > 0) {
      onXpEarned?.(amount);
      setXpToast(`+${amount} XP Earned!`);
      setTimeout(() => setXpToast(null), 3000);
    }
  };

  const games = [
    {
      id: "sprint",
      icon: "⚡",
      title: "Word Sprint",
      desc: t("wordSprintMenuDesc"),
      accent: "var(--flz-accent-1, #c65f2d)",
      xp: t("upTo30Xp"),
      tag: t("speedTag"),
    },
    {
      id: "scramble",
      icon: "🔀",
      title: "Word Scramble",
      desc: t("wordScrambleMenuDesc"),
      accent: "var(--flz-accent-2, #b5732a)",
      xp: t("upTo40Xp"),
      tag: t("puzzleTag"),
    },
    {
      id: "memory",
      icon: "🧠",
      title: "Memory Match",
      desc: t("memoryMatchMenuDesc"),
      accent: "var(--flz-accent-3, #a23b5c)",
      xp: t("upTo40Xp"),
      tag: t("memoryTag"),
    },
  ];

  useEffect(() => {
    if (activeGame) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [activeGame]);

  return (
    <div className="flz-zone">
      {xpToast && (
        <div className="flz-xp-toast">
          <span>⚡</span> {xpToast}
        </div>
      )}
      <div className="flz-zone-header">
        <div className="flz-zone-header-left">
          <h2 className="flz-zone-title">{t("funLearnZoneTitle")}</h2>
          <p className="flz-zone-subtitle">{t("funLearnZoneSubtitle")}</p>
        </div>
      </div>

      {!activeGame && (
        <div className="flz-game-hub">
          {games.map((g) => (
            <div
              key={g.id}
              className="flz-game-card"
              style={{ "--game-accent": g.accent }}
              onClick={() => setActiveGame(g.id)}
            >
              <div className="flz-game-card-top-right">
                <span className="flz-game-xp-badge" style={{ color: g.accent, borderColor: g.accent }}>
                  {g.xp}
                </span>
              </div>
              <div className="flz-game-card-icon">{g.icon}</div>
              <h3 className="flz-game-card-title">{g.title}</h3>
              <p className="flz-game-card-desc">{g.desc}</p>
              <div className="flz-game-card-footer">
                <button className="flz-play-btn" style={{ background: g.accent }}>
                  Play Now →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeGame && (
        <div className="flz-active-game-panel">
          <div className="flz-full-page-nav">
            <button className="flz-full-page-back-btn" onClick={() => setActiveGame(null)}>
              ← {t("backToPractice") !== "backToPractice" ? t("backToPractice") : (t("allGamesBtn") !== "allGamesBtn" ? t("allGamesBtn") : "Back to Practice")}
            </button>
            <div className="flz-full-page-game-title">
              {activeGame === "sprint" && "⚡ Word Sprint"}
              {activeGame === "scramble" && "🔀 Word Scramble"}
              {activeGame === "memory" && "🧠 Memory Match"}
            </div>
          </div>
          <div className="flz-full-page-game-content">
            {activeGame === "sprint" && (
              <WordSprintGame t={t} learningLanguage={learningLanguage} interfaceLanguage={interfaceLanguage} speakText={speakText} onXpEarned={handleXpEarned} onClose={() => setActiveGame(null)} aiEnabled={aiEnabled} />
            )}
            {activeGame === "scramble" && (
              <WordScrambleGame t={t} learningLanguage={learningLanguage} interfaceLanguage={interfaceLanguage} speakText={speakText} onXpEarned={handleXpEarned} onClose={() => setActiveGame(null)} aiEnabled={aiEnabled} />
            )}
            {activeGame === "memory" && (
              <MemoryMatchGame t={t} learningLanguage={learningLanguage} speakText={speakText} onXpEarned={handleXpEarned} onClose={() => setActiveGame(null)} aiEnabled={aiEnabled} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
