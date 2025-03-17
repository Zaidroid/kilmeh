import React from 'react';
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
 * Displays game statistics in a modal.
 */
export function Statistics({ stats, solution, gameWon, handleClose }: StatsProps) {
  const winPercentage =
    stats.totalPlayed > 0 ? Math.round((stats.wins / stats.totalPlayed) * 100) : 0;
  const maxDistribution = Math.max(...stats.distribution, 1);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {translations.ar.stats}
          </h2>
          <button
            onClick={handleClose}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleClose()}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalPlayed}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">لعبت</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{winPercentage}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">% فوز</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.currentStreak}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">السلسلة الحالية</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.maxStreak}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">أقصى سلسلة</p>
          </div>
        </div>

        <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-gray-100">توزيع التخمينات</h3>
        <div className="space-y-2">
          {stats.distribution.map((count, i) => (
            <div key={i} className="flex items-center">
              <div className="w-4 text-right text-gray-700 dark:text-gray-300 text-sm">{i + 1}</div>
              <div className="flex-1 mx-2">
                <div
                  className={`h-5 ${
                    gameWon && stats.distribution[i] > 0
                      ? 'bg-green-500 dark:bg-green-600'
                      : 'bg-gray-300 dark:bg-gray-600'
                  } rounded`}
                  style={{ width: `${(count / maxDistribution) * 100}%`, minWidth: count > 0 ? '10%' : '0%' }}
                >
                  <span className="px-1 text-white font-medium text-sm">{count > 0 ? count : ''}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-700 dark:text-gray-300 mb-2">
            {gameWon ? '🎉 أحسنت! 🎉' : `${translations.ar.solutionMessage} ${solution}`}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            لعبة جديدة
          </button>
        </div>
      </div>
    </div>
  );
}
