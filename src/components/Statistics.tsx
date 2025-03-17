import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { translations } from '../data/translations';

interface GameStats {
  totalPlayed: number;
  wins: number;
  currentStreak: number;
  maxStreak: number;
  distribution: number[];
}

interface StatsProps {
  stats: GameStats;
  solution: string;
  gameWon: boolean;
  handleClose: () => void;
}

/**
 * Displays game statistics in a modal with animations.
 */
export function Statistics({ stats, solution, gameWon, handleClose }: StatsProps) {
  const winPercentage =
    stats.totalPlayed > 0 ? Math.round((stats.wins / stats.totalPlayed) * 100) : 0;
  const maxDistribution = Math.max(...stats.distribution, 1);

  // Animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
  };

  const modalVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300,
        duration: 0.3,
        staggerChildren: 0.07,
        delayChildren: 0.2
      }
    },
    exit: { opacity: 0, y: 30, scale: 0.95, transition: { duration: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", damping: 25, stiffness: 200 } }
  };

  const barVariants = {
    hidden: { width: "0%", opacity: 0 },
    visible: (custom: number) => ({
      width: `${(custom / maxDistribution) * 100}%`,
      opacity: 1,
      transition: { 
        duration: 0.5,
        delay: 0.3,
        ease: "easeOut"
      }
    })
  };

  // Close when Escape key is pressed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleClose]);

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={handleClose}
      >
        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-xl"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <motion.h2 
              variants={itemVariants}
              className="text-3xl font-bold text-gradient"
            >
              {translations.ar.stats}
            </motion.h2>
            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
              }}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleClose()}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors p-2 z-10"
              aria-label="إغلاق"
              type="button"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          </div>

          <motion.div variants={itemVariants} className="grid grid-cols-4 gap-3 mb-8">
            <div className="text-center bg-white/80 dark:bg-gray-800/80 rounded-xl p-3 shadow-md">
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalPlayed}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">لعبت</p>
            </div>
            <div className="text-center bg-white/80 dark:bg-gray-800/80 rounded-xl p-3 shadow-md">
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{winPercentage}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">% فوز</p>
            </div>
            <div className="text-center bg-white/80 dark:bg-gray-800/80 rounded-xl p-3 shadow-md">
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.currentStreak}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">السلسلة الحالية</p>
            </div>
            <div className="text-center bg-white/80 dark:bg-gray-800/80 rounded-xl p-3 shadow-md">
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.maxStreak}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">أقصى سلسلة</p>
            </div>
          </motion.div>

          <motion.h3 
            variants={itemVariants}
            className="text-lg font-bold mb-3 text-gray-900 dark:text-gray-100"
          >
            توزيع التخمينات
          </motion.h3>
          
          <motion.div variants={itemVariants} className="space-y-2 mb-6">
            {stats.distribution.map((count, i) => (
              <div key={i} className="flex items-center">
                <div className="w-5 text-right text-gray-700 dark:text-gray-300 text-sm font-medium">
                  {i + 1}
                </div>
                <div className="flex-1 mx-2 h-7 bg-gray-200 dark:bg-gray-700 rounded-md overflow-hidden">
                  <motion.div
                    custom={count}
                    variants={barVariants}
                    className={`h-full ${
                      gameWon && i === stats.distribution.findIndex(val => val > 0 && gameWon)
                        ? 'bg-gradient-to-r from-indigo-600 to-teal-500 dark:from-cyan-400 dark:to-teal-400'
                        : gameWon && count > 0
                        ? 'bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700'
                        : 'bg-gradient-to-r from-gray-400 to-gray-500 dark:from-gray-600 dark:to-gray-700'
                    } rounded-md flex items-center px-2`}
                    style={{ 
                      minWidth: count > 0 ? '2rem' : '0'
                    }}
                  >
                    {count > 0 && (
                      <span className="text-white font-medium text-sm">{count}</span>
                    )}
                  </motion.div>
                </div>
              </div>
            ))}
          </motion.div>

          <motion.div variants={itemVariants} className="mt-6 text-center">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {gameWon ? (
                <span className="text-lg font-bold text-gradient">🎉 أحسنت! 🎉</span>
              ) : (
                <span>
                  {translations.ar.solutionMessage}{' '}
                  <span className="font-bold text-gradient">{solution}</span>
                </span>
              )}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.reload()}
              className="btn-primary w-full"
            >
              لعبة جديدة
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
