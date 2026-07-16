import React, { useState, useEffect, useRef, useCallback } from "react";

// ─── Word Sprint Game ──────────────────────────────────────────────────────────
const WORD_SPRINT_WORDS = [
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
];

function WordSprintGame({ onXpEarned, onClose }) {
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
  const inputRef = useRef(null);
  const timerRef = useRef(null);

  const startGame = () => {
    const shuffled = [...WORD_SPRINT_WORDS].sort(() => Math.random() - 0.5);
    setWords(shuffled);
    setCurrentIndex(0);
    setInput("");
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setSkipped(0);
    setTimeLeft(60);
    setPhase("playing");
    setTimeout(() => inputRef.current?.focus(), 100);
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

  const currentWord = words[currentIndex];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!currentWord) return;
    const trimmed = input.trim().toLowerCase();
    if (trimmed === currentWord.word.toLowerCase()) {
      const newCombo = combo + 1;
      setCombo(newCombo);
      setMaxCombo((m) => Math.max(m, newCombo));
      const points = newCombo >= 3 ? 3 : newCombo >= 2 ? 2 : 1;
      setScore((s) => s + points);
      setFeedback("correct");
      setTimeout(() => setFeedback(null), 400);
    } else {
      setCombo(0);
      setFeedback("wrong");
      setTimeout(() => setFeedback(null), 400);
    }
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
          Type the word shown as fast as you can! You have <strong>60 seconds</strong>.
          Build combos for bonus points!
        </p>
        <div className="flz-intro-rules">
          <div className="flz-rule">🎯 Each word = <strong>1 point</strong></div>
          <div className="flz-rule">🔥 3+ combo = <strong>3 points</strong> each</div>
          <div className="flz-rule">⭐ Max <strong>30 XP</strong> per round</div>
        </div>
        <button className="flz-start-btn" onClick={startGame}>
          Start Sprint!
        </button>
      </div>
    );
  }

  if (phase === "result") {
    return (
      <div className="flz-result">
        <div className="flz-result-emoji">🏆</div>
        <h2 className="flz-result-title">Sprint Complete!</h2>
        <div className="flz-result-stats">
          <div className="flz-stat-box">
            <div className="flz-stat-val">{score}</div>
            <div className="flz-stat-label">Score</div>
          </div>
          <div className="flz-stat-box flz-stat-xp">
            <div className="flz-stat-val">+{xpEarned}</div>
            <div className="flz-stat-label">XP Earned</div>
          </div>
          <div className="flz-stat-box">
            <div className="flz-stat-val">🔥{maxCombo}x</div>
            <div className="flz-stat-label">Best Combo</div>
          </div>
        </div>
        <div className="flz-result-actions">
          <button className="flz-start-btn" onClick={() => { onXpEarned(xpEarned); startGame(); }}>
            Play Again
          </button>
          <button className="flz-secondary-btn" onClick={() => { onXpEarned(xpEarned); onClose(); }}>
            Collect XP & Exit
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
        <div className="flz-score-chip">⭐ {score} pts</div>
        {combo >= 2 && (
          <div className="flz-combo-chip">🔥 x{combo} Combo!</div>
        )}
        <div className="flz-word-count">{currentIndex}/{words.length}</div>
      </div>
      {currentWord && (
        <div className={`flz-word-card ${feedback || ""}`}>
          <div className="flz-word-emoji">{currentWord.emoji}</div>
          <p className="flz-word-hint">{currentWord.hint}</p>
          {feedback === "correct" && <div className="flz-feedback correct">✓ Correct!</div>}
          {feedback === "wrong" && <div className="flz-feedback wrong">✗ Try Again</div>}
        </div>
      )}
      <form onSubmit={handleSubmit} className="flz-sprint-form">
        <input
          ref={inputRef}
          className="flz-sprint-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type the word..."
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />
        <button type="submit" className="flz-submit-btn">→</button>
      </form>
      <button className="flz-skip-btn" onClick={handleSkip}>Skip ⏭</button>
    </div>
  );
}

// ─── Word Scramble Game ───────────────────────────────────────────────────────
const SCRAMBLE_WORDS = [
  { word: "LEARN", category: "Education", emoji: "📚" },
  { word: "SPEAK", category: "Skills", emoji: "🗣️" },
  { word: "WRITE", category: "Skills", emoji: "✍️" },
  { word: "STORY", category: "Language", emoji: "📖" },
  { word: "BRAVE", category: "Traits", emoji: "🦁" },
  { word: "SMILE", category: "Emotions", emoji: "😊" },
  { word: "CLEAN", category: "Adjectives", emoji: "✨" },
  { word: "BREAD", category: "Food", emoji: "🍞" },
  { word: "PLANT", category: "Nature", emoji: "🌱" },
  { word: "GLOBE", category: "World", emoji: "🌍" },
  { word: "MUSIC", category: "Arts", emoji: "🎵" },
  { word: "LIGHT", category: "Science", emoji: "💡" },
  { word: "HAPPY", category: "Emotions", emoji: "😄" },
  { word: "RIVER", category: "Nature", emoji: "🏞️" },
  { word: "DREAM", category: "Concepts", emoji: "💭" },
];

function scrambleWord(word) {
  const arr = word.split("");
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  if (arr.join("") === word) return scrambleWord(word);
  return arr.join("");
}

function WordScrambleGame({ onXpEarned, onClose }) {
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
    const sc = scrambleWord(wordObj.word);
    setSelected([]);
    setRemaining(sc.split("").map((l, i) => ({ letter: l, id: i, used: false })));
    setFeedback(null);
    setTimeLeft(30);
  }, []);

  const startGame = () => {
    const shuffled = [...SCRAMBLE_WORDS].sort(() => Math.random() - 0.5).slice(0, 8);
    wordsRef.current = shuffled;
    setWords(shuffled);
    setWordIdx(0);
    setScore(0);
    setPhase("playing");
    loadWord(shuffled, 0);
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
    const newSel = [...selected, item.letter];
    const newRem = remaining.map((l) => l.id === item.id ? { ...l, used: true } : l);
    setSelected(newSel);
    setRemaining(newRem);
    const currentWord = wordsRef.current[wordIdx]?.word;
    if (newSel.length === currentWord?.length) {
      const formed = newSel.join("");
      if (formed === currentWord) {
        setFeedback("correct");
        setTimeout(() => goNext(true), 700);
      } else {
        setShake(true);
        setFeedback("wrong");
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
          Tap the letters in the correct order to form the word before time runs out!
        </p>
        <div className="flz-intro-rules">
          <div className="flz-rule">⏱ <strong>30 seconds</strong> per word</div>
          <div className="flz-rule">✅ Each correct word = <strong>5 XP</strong></div>
          <div className="flz-rule">⭐ Max <strong>40 XP</strong> per round</div>
        </div>
        <button className="flz-start-btn" onClick={startGame}>Unscramble!</button>
      </div>
    );
  }

  if (phase === "result") {
    return (
      <div className="flz-result">
        <div className="flz-result-emoji">🎉</div>
        <h2 className="flz-result-title">Scramble Done!</h2>
        <div className="flz-result-stats">
          <div className="flz-stat-box">
            <div className="flz-stat-val">{score}/{words.length}</div>
            <div className="flz-stat-label">Correct</div>
          </div>
          <div className="flz-stat-box flz-stat-xp">
            <div className="flz-stat-val">+{xpEarned}</div>
            <div className="flz-stat-label">XP Earned</div>
          </div>
        </div>
        <div className="flz-result-actions">
          <button className="flz-start-btn" onClick={() => { onXpEarned(xpEarned); startGame(); }}>
            Play Again
          </button>
          <button className="flz-secondary-btn" onClick={() => { onXpEarned(xpEarned); onClose(); }}>
            Collect XP & Exit
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
        {currentWordObj && Array.from({ length: currentWordObj.word.length }).map((_, i) => (
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
      <button className="flz-skip-btn" onClick={() => goNext(false)}>Skip ⏭</button>
    </div>
  );
}

// ─── Memory Match Game ─────────────────────────────────────────────────────────
const MEMORY_PAIRS = [
  { id: "apple", emoji: "🍎", word: "APPLE" },
  { id: "book", emoji: "📚", word: "BOOK" },
  { id: "cat", emoji: "🐱", word: "CAT" },
  { id: "door", emoji: "🚪", word: "DOOR" },
  { id: "eye", emoji: "👁️", word: "EYE" },
  { id: "fire", emoji: "🔥", word: "FIRE" },
  { id: "gift", emoji: "🎁", word: "GIFT" },
  { id: "heart", emoji: "❤️", word: "HEART" },
];

function MemoryMatchGame({ onXpEarned, onClose }) {
  const [phase, setPhase] = useState("intro");
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(90);
  const [canFlip, setCanFlip] = useState(true);
  const timerRef = useRef(null);

  const startGame = () => {
    const pairs = MEMORY_PAIRS.flatMap((p) => [
      { ...p, type: "emoji", cardId: `${p.id}-emoji` },
      { ...p, type: "word", cardId: `${p.id}-word` },
    ]);
    const shuffled = pairs.sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setTimeLeft(90);
    setCanFlip(true);
    setPhase("playing");
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
    if (matched.length === MEMORY_PAIRS.length && phase === "playing") {
      clearInterval(timerRef.current);
      setTimeout(() => setPhase("result"), 600);
    }
  }, [matched, phase]);

  const handleCardClick = (card) => {
    if (!canFlip) return;
    if (flipped.includes(card.cardId)) return;
    if (matched.includes(card.id)) return;
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
      } else {
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
          Flip cards to match each emoji with its English word. Train your memory and vocabulary!
        </p>
        <div className="flz-intro-rules">
          <div className="flz-rule">🃏 Match <strong>emoji ↔ word</strong> pairs</div>
          <div className="flz-rule">⏱ <strong>90 seconds</strong> to match all</div>
          <div className="flz-rule">⭐ Up to <strong>40 XP</strong> per game</div>
        </div>
        <button className="flz-start-btn" onClick={startGame}>Start Matching!</button>
      </div>
    );
  }

  if (phase === "result") {
    return (
      <div className="flz-result">
        <div className="flz-result-emoji">{matched.length === MEMORY_PAIRS.length ? "🏆" : "⏰"}</div>
        <h2 className="flz-result-title">
          {matched.length === MEMORY_PAIRS.length ? "Perfect Match!" : "Time's Up!"}
        </h2>
        <div className="flz-result-stats">
          <div className="flz-stat-box">
            <div className="flz-stat-val">{matched.length}/{MEMORY_PAIRS.length}</div>
            <div className="flz-stat-label">Matched</div>
          </div>
          <div className="flz-stat-box flz-stat-xp">
            <div className="flz-stat-val">+{xpEarned}</div>
            <div className="flz-stat-label">XP Earned</div>
          </div>
          <div className="flz-stat-box">
            <div className="flz-stat-val">{accuracy}%</div>
            <div className="flz-stat-label">Accuracy</div>
          </div>
        </div>
        <div className="flz-result-actions">
          <button className="flz-start-btn" onClick={() => { onXpEarned(xpEarned); startGame(); }}>
            Play Again
          </button>
          <button className="flz-secondary-btn" onClick={() => { onXpEarned(xpEarned); onClose(); }}>
            Collect XP & Exit
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
        <div className="flz-score-chip">🃏 {matched.length}/{MEMORY_PAIRS.length}</div>
        <div className="flz-word-count">🎯 {moves} moves</div>
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
export default function FunLearnZone({ onXpEarned }) {
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
      desc: "Type words as fast as you can in 60 seconds!",
      accent: "var(--flz-accent-1, #c65f2d)",
      xp: "Up to 30 XP",
      tag: "Speed",
    },
    {
      id: "scramble",
      icon: "🔀",
      title: "Word Scramble",
      desc: "Tap letters to unscramble the hidden word!",
      accent: "var(--flz-accent-2, #b5732a)",
      xp: "Up to 40 XP",
      tag: "Puzzle",
    },
    {
      id: "memory",
      icon: "🧠",
      title: "Memory Match",
      desc: "Match emojis with their English words!",
      accent: "var(--flz-accent-3, #a23b5c)",
      xp: "Up to 40 XP",
      tag: "Memory",
    },
  ];

  return (
    <div className="flz-zone">
      {xpToast && (
        <div className="flz-xp-toast">
          <span>⚡</span> {xpToast}
        </div>
      )}
      <div className="flz-zone-header">
        <div className="flz-zone-header-left">
          <div className="flz-zone-badge">🎮 Game For You</div>
          <h2 className="flz-zone-title">Fun &amp; Learn Zone</h2>
          <p className="flz-zone-subtitle">Play games, build vocabulary, earn XP!</p>
        </div>
        {activeGame && (
          <button className="flz-back-btn" onClick={() => setActiveGame(null)}>
            ← All Games
          </button>
        )}
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
              <div className="flz-game-card-tag">{g.tag}</div>
              <div className="flz-game-card-icon">{g.icon}</div>
              <h3 className="flz-game-card-title">{g.title}</h3>
              <p className="flz-game-card-desc">{g.desc}</p>
              <div className="flz-game-card-footer">
                <span className="flz-game-xp-badge" style={{ color: g.accent, borderColor: g.accent }}>
                  {g.xp}
                </span>
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
          {activeGame === "sprint" && (
            <WordSprintGame onXpEarned={handleXpEarned} onClose={() => setActiveGame(null)} />
          )}
          {activeGame === "scramble" && (
            <WordScrambleGame onXpEarned={handleXpEarned} onClose={() => setActiveGame(null)} />
          )}
          {activeGame === "memory" && (
            <MemoryMatchGame onXpEarned={handleXpEarned} onClose={() => setActiveGame(null)} />
          )}
        </div>
      )}
    </div>
  );
}
