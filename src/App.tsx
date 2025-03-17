import React, { useState, useEffect, lazy, Suspense, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Grid } from './components/Grid';
import { Keyboard } from './components/Keyboard';
import { ThemeProvider, useTheme, Logo } from './components/ThemeContext';
import { ThemeToggle } from './components/ThemeToggle';
import { WORDS } from './data/words'; // For validation
import { WORDS as DAILY_WORDS } from './data/words-main'; // For daily word selection
import { DICT } from './data/dict';
import { translations } from './data/translations';
import { IntroScreen } from './components/IntroScreen';
import {
  CellState,
  GameState,
  WORD_LENGTH,
  MAX_GUESSES,
  getWordOfTheDay,
  evaluateGuess,
  saveStats,
  loadStats,
  generateShareText,
  loadGameState,
  saveGameState,
  normalizeArabicWord,
  isLikelyArabicWord,
} from './utils/gameLogic';

// Add a type for user profile
interface UserProfile {
  userId: string;
  createdAt: string;
  lastPlayed: string;
  nickname?: string;
}

const Statistics = lazy(() => import('./components/Statistics').then(module => ({ default: module.Statistics })));
const Instructions = lazy(() => import('./components/Instructions').then(module => ({ default: module.Instructions })));

// Dynamic background component with animated blobs
function AnimatedBackground() {
  const { theme } = useTheme();
  
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-500" />
      
      {/* Animated blobs */}
      <motion.div 
        className="absolute top-10 left-[20%] w-[40vw] h-[40vw] max-w-[400px] max-h-[400px] rounded-full 
                  bg-gradient-to-r from-indigo-600/15 to-teal-500/15 dark:from-cyan-400/10 dark:to-teal-400/10
                  blur-3xl opacity-70 dark:opacity-30"
        animate={{
          x: [0, 10, -5, 0],
          y: [0, -15, 5, 0],
          scale: [1, 1.05, 0.98, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />
      
      <motion.div 
        className="absolute bottom-20 right-[25%] w-[35vw] h-[35vw] max-w-[350px] max-h-[350px] rounded-full 
                  bg-gradient-to-r from-teal-500/15 to-indigo-600/15 dark:from-teal-400/10 dark:to-cyan-400/10 
                  blur-3xl opacity-70 dark:opacity-30"
        animate={{
          x: [0, -15, 10, 0],
          y: [0, 10, -10, 0],
          scale: [1, 0.95, 1.05, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAgIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMCwgMCwgMCwgMC4wMykiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] 
                 dark:bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAgIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC4wMikiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')]
                 opacity-70" 
      />
    </div>
  );
}

function GameContent() {
  const { theme } = useTheme();
  const notificationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [showIntro, setShowIntro] = useState(false);
  // User profile state
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Modified to use userProfile for loading game state
  const [gameState, setGameState] = useState<GameState>(() => {
    // Wait for userProfile to be loaded before trying to load game state with userId
    return {
      guesses: [],
      currentGuess: '',
      gameWon: false,
      gameOver: false,
      solution: getWordOfTheDay(),
    };
  });
  
  const [evaluations, setEvaluations] = useState<CellState[][]>([]);
  const [usedKeys, setUsedKeys] = useState<Record<string, CellState>>({});
  const [isRevealing, setIsRevealing] = useState(false);
  const [invalidGuess, setInvalidGuess] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isRandomMode, setIsRandomMode] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [localCache, setLocalCache] = useState<Set<string>>(new Set());
  const [dictionary, setDictionary] = useState<Set<string>>(new Set());
  const [isValidatingApi, setIsValidatingApi] = useState(false);
  const [feedbackVisible, setFeedbackVisible] = useState(false);

  // Function to create a new user ID
  const createUserId = () => {
    return 'user_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  // Function to retrieve or create user profile
  const getOrCreateUserProfile = useCallback(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile) as UserProfile;
        // Update last played date
        profile.lastPlayed = new Date().toISOString();
        localStorage.setItem('userProfile', JSON.stringify(profile));
        return profile;
      } catch (err) {
        console.error('Error parsing user profile:', err);
      }
    }
    
    // Create new profile if none exists
    const newProfile: UserProfile = {
      userId: createUserId(),
      createdAt: new Date().toISOString(),
      lastPlayed: new Date().toISOString()
    };
    localStorage.setItem('userProfile', JSON.stringify(newProfile));
    return newProfile;
  }, []);

  // Load user profile and game state
  useEffect(() => {
    const cachedWords = localStorage.getItem('validWordsCache');
    if (cachedWords) {
      setLocalCache(new Set(JSON.parse(cachedWords)));
    }

    const fiveLetterWords = DICT.filter((word) => word.length === WORD_LENGTH);
    setDictionary(new Set(fiveLetterWords));
    
    // Get or create user profile
    const profile = getOrCreateUserProfile();
    setUserProfile(profile);
    
    // Once we have the user profile, load their game state
    if (profile) {
      const { state, evaluations: savedEvals } = loadGameState(profile.userId);
      if (state) {
        setGameState(state);
        if (savedEvals) {
          setEvaluations(savedEvals);
          
          // Reconstruct used keys from saved evaluations and guesses
          const newUsedKeys: Record<string, CellState> = {};
          if (state.guesses && savedEvals) {
            state.guesses.forEach((guess, guessIndex) => {
              const evaluation = savedEvals[guessIndex];
              if (evaluation) {
                [...guess].forEach((letter, i) => {
                  const currentState = newUsedKeys[letter];
                  const newState = evaluation[i];
                  if (
                    newState === 'correct' ||
                    (newState === 'present' && currentState !== 'correct') ||
                    (!currentState && newState === 'absent')
                  ) {
                    newUsedKeys[letter] = newState;
                  }
                });
              }
            });
            setUsedKeys(newUsedKeys);
          }
        }
      }
    }
    
    // Show intro if this is a first-time user
    if (!localStorage.getItem('hasPlayedBefore')) {
      setShowIntro(true);
    }
  }, [getOrCreateUserProfile]);

  // Save a word to the local cache
  const saveToCache = (word: string) => {
    const newCache = new Set(localCache);
    newCache.add(word);
    setLocalCache(newCache);
    localStorage.setItem('validWordsCache', JSON.stringify(Array.from(newCache)));
  };

  // Show feedback toast with auto-dismissal
  const showFeedbackToast = (message: string, duration = 2000) => {
    setFeedback(message);
    setFeedbackVisible(true);
    
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    
    notificationTimeoutRef.current = setTimeout(() => {
      setFeedbackVisible(false);
      setTimeout(() => setFeedback(''), 300); // Clear after fade out
    }, duration);
  };

  // Improved word validation function replacing the API call
  const checkWordValidity = async (word: string): Promise<boolean> => {
    try {
      // Normalize the word first
      const normalizedWord = normalizeArabicWord(word);
      
      // Check if it's a proper 5-letter word
      if (normalizedWord.length !== WORD_LENGTH) {
        return false;
      }
      
      // Check if the word looks like a valid Arabic word using linguistic rules
      if (!isLikelyArabicWord(normalizedWord)) {
        return false;
      }
      
      // 1. If it's in our predefined word list, accept immediately
      if (WORDS.includes(normalizedWord)) {
        return true;
      }
      
      // 2. If it's in our dictionary, also accept it
      if (dictionary.has(normalizedWord)) {
        return true;
      }
      
      // 3. Check if the word contains common root patterns found in WORDS
      // This allows for morphological variations of known words
      let strongMatches = 0;
      
      const hasCommonRootWithKnownWord = WORDS.some((knownWord: string) => {
        // If word shares at least 3 characters with a known word, in the same order
        // This is a simple approximation of root sharing in Arabic
        let matchCount = 0;
        let lastMatchIndex = -1;
        
        for (const char of normalizedWord) {
          const nextIndex = knownWord.indexOf(char, lastMatchIndex + 1);
          if (nextIndex > lastMatchIndex) {
            matchCount++;
            lastMatchIndex = nextIndex;
            if (matchCount >= 4) {
              strongMatches++;
              break; // Early exit for efficiency
            }
          }
        }
        
        return matchCount >= 3;
      });
      
      // 4. Required confidence level: Word should have enough common features with known words
      // Only accept if it has a strong match with at least 2 words in our list
      return hasCommonRootWithKnownWord && strongMatches >= 2;
    } catch (error) {
      console.error('Word validation error:', error);
      return false; // Fail gracefully on errors
    }
  };

  const solution = isRandomMode
    ? DAILY_WORDS[Math.floor(Math.random() * DAILY_WORDS.length)]
    : getWordOfTheDay();
  useEffect(() => {
    setGameState((prev) => ({
      ...prev,
      guesses: [],
      currentGuess: '',
      gameWon: false,
      gameOver: false,
      solution,
    }));
    setEvaluations([]);
    setUsedKeys({});
  }, [isRandomMode, solution]);

  useEffect(() => {
    if (gameState.gameOver) {
      const timer = setTimeout(() => {
        setShowStats(true);
        if (userProfile) {
          saveStats(gameState.gameWon, gameState.guesses.length, userProfile.userId);
        }
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [gameState.gameOver, userProfile]);

  useEffect(() => {
    if (gameState.guesses.length > 0 && userProfile) {
      // Add userId to gameState before saving
      const stateWithUser = {
        ...gameState,
        userId: userProfile.userId
      };
      saveGameState(stateWithUser, evaluations);
    }
  }, [gameState, evaluations, userProfile]);

  const handleShare = () => {
    const shareText = generateShareText(
      gameState.guesses,
      evaluations,
      gameState.solution,
      gameState.gameWon
    );
    if (navigator.share) {
      navigator.share({
        title: translations.ar.shareTitle,
        text: shareText,
      }).catch((err) => {
        console.error('Share failed:', err);
        navigator.clipboard.writeText(shareText);
        showFeedbackToast(translations.ar.copiedToClipboard);
      });
    } else {
      navigator.clipboard.writeText(shareText);
      showFeedbackToast(translations.ar.copiedToClipboard);
    }
  };

  const handleKeyPress = (key: string) => {
    if (gameState.gameOver || isValidatingApi) return;

    if (key === 'Enter') {
      if (gameState.currentGuess.length !== WORD_LENGTH) {
        setInvalidGuess(true);
        showFeedbackToast(translations.ar.invalidGuessLength);
        setTimeout(() => {
          setInvalidGuess(false);
        }, 600);
        return;
      }

      const processGuess = () => {
        const evaluation = evaluateGuess(gameState.currentGuess, gameState.solution);
        const newEvaluations = [...evaluations, evaluation];
        const newGuesses = [...gameState.guesses, gameState.currentGuess];

        const newUsedKeys = { ...usedKeys };
        [...gameState.currentGuess].forEach((letter, i) => {
          const currentState = newUsedKeys[letter];
          const newState = evaluation[i];
          if (
            newState === 'correct' ||
            (newState === 'present' && currentState !== 'correct') ||
            (!currentState && newState === 'absent')
          ) {
            newUsedKeys[letter] = newState;
          }
        });

        setIsRevealing(true);
        setTimeout(() => setIsRevealing(false), 250 * WORD_LENGTH);

        setEvaluations(newEvaluations);
        setUsedKeys(newUsedKeys);

        setGameState((prev) => ({
          ...prev,
          guesses: newGuesses,
          currentGuess: '',
          gameWon: gameState.currentGuess === gameState.solution,
          gameOver:
            gameState.currentGuess === gameState.solution || newGuesses.length === MAX_GUESSES,
        }));
      };

      // Multi-tier validation
      if (WORDS.includes(gameState.currentGuess)) {
        processGuess();
      } else if (localCache.has(gameState.currentGuess)) {
        processGuess();
      } else if (dictionary.has(gameState.currentGuess)) {
        saveToCache(gameState.currentGuess);
        showFeedbackToast('تم قبول الكلمة الجديدة!');
        processGuess();
      } else {
        // Try our enhanced local validation
        setIsValidatingApi(true);
        showFeedbackToast('جارٍ التحقق من الكلمة...', 1000);
        checkWordValidity(gameState.currentGuess)
          .then((isValid) => {
            setIsValidatingApi(false);
            if (isValid) {
              saveToCache(gameState.currentGuess);
              showFeedbackToast('تم قبول الكلمة الجديدة!');
              processGuess();
            } else {
              setInvalidGuess(true);
              showFeedbackToast(translations.ar.invalidGuessNotInList);
              setTimeout(() => {
                setInvalidGuess(false);
              }, 600);
            }
          })
          .catch(() => {
            setIsValidatingApi(false);
            setInvalidGuess(true);
            showFeedbackToast('تعذر التحقق من الكلمة، ربما ليست صحيحة');
            setTimeout(() => {
              setInvalidGuess(false);
            }, 600);
          });
      }
    } else if (key === 'Backspace') {
      setGameState((prev) => ({
        ...prev,
        currentGuess: prev.currentGuess.slice(0, -1),
      }));
    } else if (gameState.currentGuess.length < WORD_LENGTH) {
      setGameState((prev) => ({
        ...prev,
        currentGuess: prev.currentGuess + key,
      }));
    }
  };

  // Animation variants
  const contentVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 100, 
        damping: 20 
      }
    }
  };

  // Handler for starting the game after intro
  const handleStartGame = () => {
    setShowIntro(false);
    localStorage.setItem('hasPlayedBefore', 'true');
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen flex flex-col items-center transition-colors duration-500"
    >
      <AnimatedBackground />
      
      <AnimatePresence>
        {showIntro ? (
          <IntroScreen handleStart={handleStartGame} />
        ) : (
          <>
            <header className="w-full sticky top-0 z-10 glass-effect shadow-md py-4 px-4 mb-6">
              <motion.div 
                className="flex items-center max-w-lg mx-auto relative"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                {/* Left side icons */}
                <div className="flex items-center gap-1 absolute right-0">
                  <motion.button
                    onClick={() => setShowInstructions(true)}
                    className="text-gray-700 dark:text-gray-300 p-2 rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label={translations.ar.howToPlay}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </motion.button>
                  
                  <motion.button
                    onClick={() => setShowStats(true)}
                    className="text-gray-700 dark:text-gray-300 p-2 rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label={translations.ar.stats}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </motion.button>
                </div>
                
                {/* Centered logo */}
                <div className="flex-1 flex justify-center">
                  <motion.div 
                    className="relative pt-1 pb-1"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ 
                      duration: 0.5, 
                      delay: 0.2,
                      type: "spring",
                      stiffness: 200
                    }}
                  >
                    <Logo />
                  </motion.div>
                </div>
                
                {/* Right side icons */}
                <div className="flex items-center gap-1 absolute left-0">
                  <motion.button
                    onClick={() => setIsRandomMode(!isRandomMode)}
                    className="text-gray-700 dark:text-gray-300 p-2 rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label={
                      isRandomMode ? translations.ar.dailyMode : translations.ar.randomMode
                    }
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d={isRandomMode 
                               ? "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                               : "M19.48 17.839a2 2 0 11-2.979 2.667 2 2 0 012.98-2.667zm-6.987 0a2 2 0 11-2.979 2.667 2 2 0 012.979-2.667zm-6.987 0a2 2 0 11-2.979 2.667 2 2 0 012.979-2.667zM19.48 11.952a2 2 0 11-2.979 2.667 2 2 0 012.98-2.667zm-6.987 0a2 2 0 11-2.979 2.667 2 2 0 012.979-2.667zm-6.987 0a2 2 0 11-2.979 2.667 2 2 0 012.979-2.667zM19.48 6.065a2 2 0 11-2.979 2.667 2 2 0 012.98-2.667zm-6.987 0a2 2 0 11-2.979 2.667 2 2 0 012.979-2.667zm-6.987 0a2 2 0 11-2.979 2.667 2 2 0 012.979-2.667z"} />
                    </svg>
                  </motion.button>
                  
                  <ThemeToggle />
                </div>
              </motion.div>
            </header>

            <main className="flex-1 w-full max-w-lg mx-auto flex flex-col items-center p-1 sm:p-4 pb-2">
              {/* Feedback Toast */}
              <AnimatePresence>
                {feedbackVisible && (
                  <motion.div 
                    className="mb-4 py-2 px-4 rounded-full bg-white/90 dark:bg-gray-800/90 shadow-md backdrop-blur-sm text-center text-red-600 dark:text-red-500 font-medium"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    {feedback}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Game Content */}
              <motion.div
                className="w-full flex flex-col items-center justify-between flex-1"
                variants={contentVariants}
                initial="hidden"
                animate="visible"
              >
                {/* Grid Component */}
                <div className="flex-grow flex items-center justify-center w-full mb-3 sm:mb-4">
                  <Grid
                    guesses={gameState.guesses}
                    currentGuess={gameState.currentGuess}
                    solution={gameState.solution}
                    evaluations={evaluations}
                    isRevealing={isRevealing}
                    invalidGuess={invalidGuess}
                    theme={theme}
                  />
                </div>

                {/* Game Result Message */}
                {gameState.gameOver && (
                  <motion.div 
                    className="mb-4 text-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ 
                      delay: 1.2,
                      duration: 0.4, 
                      type: "spring",
                      stiffness: 300,
                      damping: 25 
                    }}
                  >
                    {gameState.gameWon ? (
                      <motion.p 
                        className="text-2xl font-bold text-gradient"
                        animate={{ 
                          scale: [1, 1.1, 1],
                        }}
                        transition={{ 
                          duration: 1,
                          repeat: 2,
                          repeatType: "reverse" 
                        }}
                      >
                        {translations.ar.winMessage}
                      </motion.p>
                    ) : (
                      <div>
                        <p className="text-2xl font-bold text-red-600 dark:text-red-500">
                          {translations.ar.loseMessage}
                        </p>
                        <p className="mt-2 text-gray-800 dark:text-gray-300">
                          {translations.ar.solutionMessage}{' '}
                          <span className="font-bold text-gradient">{gameState.solution}</span>
                        </p>
                      </div>
                    )}
                    <motion.button
                      onClick={handleShare}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="mt-4 btn-primary"
                    >
                      {translations.ar.shareResult}
                    </motion.button>
                  </motion.div>
                )}

                <Keyboard onKeyPress={handleKeyPress} usedKeys={usedKeys} />
              </motion.div>

              <AnimatePresence>
                {showInstructions && (
                  <Suspense fallback={
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 flex items-center justify-center">
                        <div className="w-10 h-10 border-4 border-indigo-600 dark:border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                        <p className="mr-3 text-gray-700 dark:text-gray-300">جارٍ التحميل...</p>
                      </div>
                    </div>
                  }>
                    <Instructions handleClose={() => setShowInstructions(false)} />
                  </Suspense>
                )}
                {showStats && (
                  <Suspense fallback={
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 flex items-center justify-center">
                        <div className="w-10 h-10 border-4 border-indigo-600 dark:border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                        <p className="mr-3 text-gray-700 dark:text-gray-300">جارٍ التحميل...</p>
                      </div>
                    </div>
                  }>
                    <Statistics
                      stats={loadStats(userProfile?.userId)}
                      solution={gameState.solution}
                      gameWon={gameState.gameWon}
                      handleClose={() => setShowStats(false)}
                    />
                  </Suspense>
                )}
              </AnimatePresence>
            </main>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <GameContent />
    </ThemeProvider>
  );
}

export default App;

