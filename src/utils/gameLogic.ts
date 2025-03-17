import { WORDS } from '../data/words';
import { WORDS as DAILY_WORDS } from '../data/words-main';

export type CellState = 'correct' | 'present' | 'absent' | 'empty';

export interface GameState {
  guesses: string[];
  currentGuess: string;
  gameWon: boolean;
  gameOver: boolean;
  solution: string;
  userId?: string;
  lastPlayed?: string;
}

export interface GameStats {
  totalPlayed: number;
  wins: number;
  currentStreak: number;
  maxStreak: number;
  distribution: number[];
  userId?: string;
  lastUpdated?: string;
}

/**
 * Normalizes an Arabic word by removing diacritics and non-Arabic characters.
 */
export function normalizeArabicWord(word: string): string {
  return word
    .replace(/[\u064B-\u065F]/g, '') // Remove Arabic diacritics/vowels
    .replace(/[^\u0621-\u064A]/g, ''); // Keep only Arabic characters
}

/**
 * Basic check to see if a string looks like a proper Arabic word.
 */
export function isLikelyArabicWord(word: string): boolean {
  // Check if all characters are Arabic
  const isAllArabic = /^[\u0621-\u064A]+$/.test(word);
  if (!isAllArabic) return false;
  
  // More strict linguistic patterns for Arabic words
  // Most real Arabic words follow certain patterns:
  
  // Must contain at least one of these essential letters (alif, waw, ya, meem, lam, noon)
  const hasEssentialLetters = /[\u0627\u0648\u064A\u0645\u0644\u0646]/u.test(word);
  if (!hasEssentialLetters) return false;
  
  // Check for typical Arabic word patterns (most words must have at least one vowel or specific combinations)
  const hasVowelPattern = /[\u0627\u0648\u064A\u0649\u0629\u0624\u0626]/u.test(word); // Vowel letters
  
  // Check for common patterns in Arabic word formations
  const hasValidStructure = (
    // Word has reasonable structure
    !/(\u0643\u0643|\u0633\u0633|\u0634\u0634|\u0641\u0641)/u.test(word) && // No consecutive identical consonants (with exceptions)
    !/^[\u0638\u0630\u062B\u063A]{2}/u.test(word) // Not starting with consecutive rare letters
  );
  
  // Require valid structure and either vowel pattern or essential letter combinations
  return hasValidStructure && hasVowelPattern;
}

/**
 * Saves the game state to localStorage if the solution matches today's word.
 * Now includes userId for multi-user support.
 */
export function saveGameState(state: GameState, evaluations: CellState[][]): void {
  const todaySolution = getWordOfTheDay();
  if (state.solution === todaySolution) {
    const saveData = {
      ...state,
      lastPlayed: new Date().toISOString(),
    };
    localStorage.setItem('gameState', JSON.stringify(saveData));
    localStorage.setItem('evaluations', JSON.stringify(evaluations));

    // Also save to user-specific storage if userId is provided
    if (state.userId) {
      localStorage.setItem(`gameState_${state.userId}`, JSON.stringify(saveData));
      localStorage.setItem(`evaluations_${state.userId}`, JSON.stringify(evaluations));
    }
  }
}

/**
 * Loads the game state from localStorage if it matches today's word.
 * Now supports loading by userId if provided.
 */
export function loadGameState(userId?: string): { state: GameState | null; evaluations: CellState[][] | null } {
  // Check user-specific storage first if userId is provided
  if (userId) {
    const userSavedState = localStorage.getItem(`gameState_${userId}`);
    const userSavedEvaluations = localStorage.getItem(`evaluations_${userId}`);
    
    if (userSavedState && userSavedEvaluations) {
      try {
        const state = JSON.parse(userSavedState);
        const evaluations = JSON.parse(userSavedEvaluations);
        
        const todaySolution = getWordOfTheDay();
        if (state.solution === todaySolution) {
          return { state, evaluations };
        }
      } catch (error) {
        console.error("Error parsing user-specific saved game state:", error);
      }
    }
  }
  
  // Fall back to general storage
  const savedState = localStorage.getItem('gameState');
  const savedEvaluations = localStorage.getItem('evaluations');

  if (!savedState || !savedEvaluations) {
    return { state: null, evaluations: null };
  }

  try {
    const state = JSON.parse(savedState);
    const evaluations = JSON.parse(savedEvaluations);

    const todaySolution = getWordOfTheDay();
    if (state.solution !== todaySolution) {
      return { state: null, evaluations: null };
    }

    return { state, evaluations };
  } catch (error) {
    console.error("Error parsing saved game state:", error);
    return { state: null, evaluations: null };
  }
}

/**
 * Saves game statistics to localStorage.
 * Now supports userId for multiple users.
 */
export function saveStats(gameWon: boolean, numGuesses: number, userId?: string): void {
  const statsKey = userId ? `statistics_${userId}` : 'statistics';
  const stats = loadStats(userId);

  stats.totalPlayed += 1;
  stats.lastUpdated = new Date().toISOString();
  
  if (userId) {
    stats.userId = userId;
  }

  if (gameWon) {
    stats.wins += 1;
    stats.currentStreak += 1;
    stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
    stats.distribution[numGuesses - 1] += 1;
  } else {
    stats.currentStreak = 0;
  }

  localStorage.setItem(statsKey, JSON.stringify(stats));
}

/**
 * Loads game statistics from localStorage.
 * Now supports loading by userId if provided.
 */
export function loadStats(userId?: string): GameStats {
  const statsKey = userId ? `statistics_${userId}` : 'statistics';
  const savedStats = localStorage.getItem(statsKey);

  if (!savedStats) {
    return {
      totalPlayed: 0,
      wins: 0,
      currentStreak: 0,
      maxStreak: 0,
      distribution: [0, 0, 0, 0, 0, 0],
      userId: userId,
      lastUpdated: new Date().toISOString()
    };
  }

  try {
    const stats = JSON.parse(savedStats);
    return {
      ...stats,
      userId: userId || stats.userId
    };
  } catch (error) {
    console.error("Error parsing statistics:", error);
    return {
      totalPlayed: 0,
      wins: 0,
      currentStreak: 0,
      maxStreak: 0,
      distribution: [0, 0, 0, 0, 0, 0],
      userId: userId,
      lastUpdated: new Date().toISOString()
    };
  }
}

/**
 * Clears a user's game state and statistics.
 * Useful for resetting or when a user wants to start fresh.
 */
export function clearUserData(userId: string): void {
  if (userId) {
    localStorage.removeItem(`gameState_${userId}`);
    localStorage.removeItem(`evaluations_${userId}`);
    localStorage.removeItem(`statistics_${userId}`);
  }
}

/**
 * Generates a shareable text representation of the game result.
 */
export function generateShareText(
  guesses: string[],
  evaluations: CellState[][],
  solution: string,
  gameWon: boolean
): string {
  const emojiGrid = evaluations
    .map((row) =>
      row
        .map((state) => {
          if (state === 'correct') return '🟩';
          if (state === 'present') return '🟨';
          return '⬛';
        })
        .join('')
    )
    .join('\n');

  const guessCount = gameWon ? guesses.length : 'X';

  return `كلمه ${guessCount}/${MAX_GUESSES}\n\n${emojiGrid}`;
}

export const WORD_LENGTH = 5;
export const MAX_GUESSES = 6;

/**
 * Gets the word of the day based on the current date from the daily words collection.
 */
export function getWordOfTheDay(): string {
  const now = new Date();
  const start = new Date(2024, 0, 1);
  const diff = now.getTime() - start.getTime();
  const day = Math.floor(diff / (1000 * 60 * 60 * 24));
  const index = day % DAILY_WORDS.length;
  return DAILY_WORDS[index];
}

/**
 * Evaluates a guess against the solution, returning cell states.
 */
export function evaluateGuess(guess: string, solution: string): CellState[] {
  const result: CellState[] = Array(WORD_LENGTH).fill('absent');
  const solutionChars = [...solution];
  const guessChars = [...guess];

  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guessChars[i] === solutionChars[i]) {
      result[i] = 'correct';
      solutionChars[i] = '*';
      guessChars[i] = '*';
    }
  }

  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guessChars[i] !== '*') {
      const index = solutionChars.indexOf(guessChars[i]);
      if (index !== -1) {
        result[i] = 'present';
        solutionChars[index] = '*';
      }
    }
  }

  return result;
}
