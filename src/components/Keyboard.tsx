import React from 'react';
import { motion } from 'framer-motion';
import { CellState } from '../utils/gameLogic';

// Arabic keyboard layout following standard layout patterns
const KEYS = [
  ['ض', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح', 'ج', 'د'],
  ['ش', 'س', 'ي', 'ب', 'ل', 'ا', 'ت', 'ن', 'م', 'ك', 'ط'],
  ['ئ', 'ء', 'ؤ', 'ر', 'ل', 'ى', 'ة', 'و', 'ز', 'ظ', 'ذ'],
];

interface KeyboardProps {
  onKeyPress: (key: string) => void;
  usedKeys: Record<string, CellState>;
}

/**
 * Displays the virtual keyboard for entering guesses.
 */
export const Keyboard = React.memo(({ onKeyPress, usedKeys }: KeyboardProps) => {
  const handleKeyPress = (key: string) => {
    onKeyPress(key);
  };

  // Animation variants for keyboard
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        delay: 0.3,
        staggerChildren: 0.08
      }
    }
  };

  const rowVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.05 
      }
    }
  };

  const keyVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        type: "spring", 
        stiffness: 200, 
        damping: 20 
      }
    }
  };

  return (
    <motion.div 
      className="w-full max-w-xl mx-auto px-0.5 sm:px-1 pt-1 sm:pt-2"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {KEYS.map((row, i) => {
        // Calculate dynamic width based on row length
        const keyWidth = 100 / row.length;
        
        return (
          <motion.div 
            key={i} 
            className="flex justify-center gap-[2px] sm:gap-[3px] my-[2px] sm:my-[3px]"
            variants={rowVariants}
          >
            {row.map((key) => {
              const state = usedKeys[key];
              let bgColor = '';
              let textColor = 'text-gray-900 dark:text-white';
              let border = '';
              
              if (state === 'correct') {
                bgColor = 'bg-green-500 dark:bg-green-600';
                textColor = 'text-white';
              } else if (state === 'present') {
                bgColor = 'bg-yellow-500 dark:bg-yellow-600';
                textColor = 'text-white';
              } else if (state === 'absent') {
                bgColor = 'bg-gray-500 dark:bg-gray-600';
                textColor = 'text-white';
              } else {
                bgColor = 'bg-gray-200 dark:bg-gray-700';
                border = 'border border-gray-200 dark:border-gray-600';
              }

              return (
                <motion.button
                  key={key}
                  onClick={() => handleKeyPress(key)}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleKeyPress(key)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.92, opacity: 0.9 }}
                  variants={keyVariants}
                  className={`
                    ${bgColor} ${textColor} ${border}
                    text-base sm:text-lg font-bold rounded-md
                    h-[38px] sm:h-[45px] md:h-[52px]
                    flex items-center justify-center
                    transition-colors duration-200 ease-out
                    shadow-sm hover:shadow
                    touch-manipulation
                  `}
                  style={{ width: `${keyWidth}%` }}
                >
                  {key}
                </motion.button>
              );
            })}
          </motion.div>
        );
      })}
      <motion.div 
        className="flex justify-center gap-1.5 sm:gap-2 mt-2 sm:mt-3"
        variants={rowVariants}
      >
        <motion.button
          onClick={() => handleKeyPress('Backspace')}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleKeyPress('Backspace')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92, opacity: 0.9 }}
          variants={keyVariants}
          className="bg-rose-500 dark:bg-rose-600 text-white py-2 sm:py-3 rounded-md text-sm sm:text-base
                     font-semibold shadow-sm hover:shadow
                     transition-colors duration-200 ease-out w-1/4
                     touch-manipulation"
        >
          حذف
        </motion.button>
        
        <motion.button
          onClick={() => handleKeyPress('Enter')}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleKeyPress('Enter')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92, opacity: 0.9 }}
          variants={keyVariants}
          className="bg-indigo-600 dark:bg-blue-600 text-white py-2 sm:py-3 rounded-md text-sm sm:text-base
                     font-semibold shadow-sm hover:shadow
                     transition-colors duration-200 ease-out w-1/4
                     touch-manipulation"
        >
          إدخال
        </motion.button>
      </motion.div>
    </motion.div>
  );
});
