import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CellState } from '../utils/gameLogic';

interface GridProps {
  guesses: string[];
  currentGuess: string;
  solution: string;
  evaluations: CellState[][];
  isRevealing?: boolean;
  invalidGuess?: boolean;
  theme?: 'light' | 'dark';
}

/**
 * Displays the game grid with guesses and evaluations.
 */
export const Grid = React.memo(
  ({ guesses, currentGuess, solution, evaluations, isRevealing, invalidGuess, theme }: GridProps) => {
    const rows = Array(6).fill(null);

    // Framer motion variants for animations
    const gridVariants = {
      hidden: { opacity: 0 },
      visible: { 
        opacity: 1,
        transition: { 
          staggerChildren: 0.1,
          delayChildren: 0.1
        }
      }
    };

    const rowVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: { 
          type: "spring", 
          stiffness: 100,
          damping: 15
        }
      }
    };

    return (
      <motion.div 
        className={`w-full flex flex-col items-center ${invalidGuess ? 'animate-shake' : ''}`}
        variants={gridVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="grid grid-rows-6 gap-3 sm:gap-4 p-1 sm:p-2 w-full max-w-[95%] sm:max-w-sm mx-auto">
          {rows.map((_, i) => {
            const isCurrentGuess = i === guesses.length;
            const guess = isCurrentGuess ? currentGuess : guesses[i];
            const evaluation = evaluations[i];

            return (
              <motion.div
                key={i}
                className="grid grid-cols-5 gap-3 sm:gap-3 md:gap-4"
                variants={rowVariants}
              >
                {Array(5).fill(null).map((_, j) => {
                  const letter = guess?.[j] ?? '';
                  let cellState: CellState = 'empty';
                  if (evaluation) {
                    cellState = evaluation[j];
                  }

                  const isRevealed = !isRevealing || i < guesses.length - 1;
                  const shouldReveal = isRevealing && i === guesses.length - 1;
                  const revealDelay = shouldReveal ? `${j * 50}ms` : '0ms';

                  // Enhanced styling based on design reference
                  const bgColor =
                    cellState === 'correct'
                      ? 'bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700'
                      : cellState === 'present'
                      ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 dark:from-yellow-500 dark:to-yellow-600'
                      : cellState === 'absent'
                      ? 'bg-gradient-to-br from-gray-500 to-gray-600 dark:from-gray-600 dark:to-gray-700'
                      : 'bg-white dark:bg-gray-800';
                  
                  const border = cellState === 'empty' 
                    ? 'border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-colors' 
                    : '';
                  
                  const textColor = cellState === 'empty' ? 'text-black dark:text-white' : 'text-white';
                  const shadow = cellState !== 'empty' ? 'shadow-md' : '';

                  const ariaLabel = letter
                    ? `الحرف ${letter} في الموضع ${j + 1} ${cellState === 'correct' ? 'صحيح' : cellState === 'present' ? 'موجود' : cellState === 'absent' ? 'غير موجود' : 'فارغ'}`
                    : `الموضع ${j + 1} فارغ`;

                  return (
                    <div
                      key={j}
                      style={{
                        transitionDelay: revealDelay,
                        animationDelay: revealDelay,
                      }}
                      className={`
                        ${bgColor} ${border} ${textColor} ${shadow}
                        aspect-square flex items-center justify-center
                        text-xl sm:text-2xl md:text-3xl font-bold rounded-xl
                        transition-all duration-300 ease-out
                        transform-gpu perspective-1000
                        ${letter && !shouldReveal ? 'animate-pop' : ''}
                        ${shouldReveal ? 'animate-flip' : ''}
                        relative overflow-hidden
                      `}
                      aria-label={ariaLabel}
                    >
                      {/* Character display */}
                      <span className="select-none filter drop-shadow-sm">{letter}</span>
                      
                      {/* Subtle glow effect for correct and present states */}
                      {(cellState === 'correct' || cellState === 'present') && (
                        <div className="absolute inset-0 opacity-30 bg-white rounded-xl blur-md"></div>
                      )}
                      
                      {/* Ripple effect on fill */}
                      {letter && !shouldReveal && (
                        <span className="absolute inset-0 bg-white dark:bg-gray-300 rounded-xl opacity-50 scale-0 animate-ripple"></span>
                      )}
                    </div>
                  );
                })}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    );
  }
);
