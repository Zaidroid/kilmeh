import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { translations } from '../data/translations';

interface InstructionsProps {
  handleClose: () => void;
}

/**
 * Displays the game instructions in a modal with animations.
 */
export function Instructions({ handleClose }: InstructionsProps) {
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
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    },
    exit: { opacity: 0, y: 30, scale: 0.95, transition: { duration: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", damping: 25, stiffness: 200 } }
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
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-lg w-full h-auto max-h-[85vh] overflow-y-auto shadow-xl"
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
              {translations.ar.howToPlay}
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

          <motion.div variants={itemVariants} className="space-y-4 text-gray-800 dark:text-gray-200">
            <p className="text-lg">خمس الكلمة في 6 محاولات.</p>
            <p>يجب أن يكون كل تخمين كلمة صالحة مكونة من 5 أحرف. اضغط على زر الإدخال للتحقق.</p>
            <p>بعد كل تخمين، سيتغير لون المربعات لإظهار مدى قرب تخمينك من الكلمة.</p>

            <div className="border-t border-b border-gray-300 dark:border-gray-700 py-5 my-5 space-y-5">
              <p className="font-medium mb-3 text-xl text-gradient">أمثلة:</p>
              
              <motion.div 
                className="space-y-2"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.1
                    }
                  }
                }}
              >
                <motion.div 
                  className="flex items-center mb-2 gap-2" 
                  variants={itemVariants}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md relative">
                    م
                    <div className="absolute inset-0 opacity-30 bg-white rounded-xl blur-sm"></div>
                  </div>
                  <div className="w-12 h-12 border-2 border-gray-300 dark:border-gray-600 rounded-xl flex items-center justify-center text-xl">
                    د
                  </div>
                  <div className="w-12 h-12 border-2 border-gray-300 dark:border-gray-600 rounded-xl flex items-center justify-center text-xl">
                    ر
                  </div>
                  <div className="w-12 h-12 border-2 border-gray-300 dark:border-gray-600 rounded-xl flex items-center justify-center text-xl">
                    س
                  </div>
                  <div className="w-12 h-12 border-2 border-gray-300 dark:border-gray-600 rounded-xl flex items-center justify-center text-xl">
                    ة
                  </div>
                </motion.div>
                <motion.p variants={itemVariants} className="font-medium">
                  الحرف م في المكان الصحيح.
                </motion.p>

                <motion.div 
                  className="flex items-center mb-2 mt-5 gap-2" 
                  variants={itemVariants}
                >
                  <div className="w-12 h-12 border-2 border-gray-300 dark:border-gray-600 rounded-xl flex items-center justify-center text-xl">
                    م
                  </div>
                  <div className="w-12 h-12 border-2 border-gray-300 dark:border-gray-600 rounded-xl flex items-center justify-center text-xl">
                    ك
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 dark:from-yellow-500 dark:to-yellow-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md relative">
                    ت
                    <div className="absolute inset-0 opacity-30 bg-white rounded-xl blur-sm"></div>
                  </div>
                  <div className="w-12 h-12 border-2 border-gray-300 dark:border-gray-600 rounded-xl flex items-center justify-center text-xl">
                    ب
                  </div>
                  <div className="w-12 h-12 border-2 border-gray-300 dark:border-gray-600 rounded-xl flex items-center justify-center text-xl">
                    ة
                  </div>
                </motion.div>
                <motion.p variants={itemVariants} className="font-medium">
                  الحرف ت موجود في الكلمة ولكن في مكان خاطئ.
                </motion.p>

                <motion.div 
                  className="flex items-center mb-2 mt-5 gap-2" 
                  variants={itemVariants}
                >
                  <div className="w-12 h-12 border-2 border-gray-300 dark:border-gray-600 rounded-xl flex items-center justify-center text-xl">
                    س
                  </div>
                  <div className="w-12 h-12 border-2 border-gray-300 dark:border-gray-600 rounded-xl flex items-center justify-center text-xl">
                    ي
                  </div>
                  <div className="w-12 h-12 border-2 border-gray-300 dark:border-gray-600 rounded-xl flex items-center justify-center text-xl">
                    ا
                  </div>
                  <div className="w-12 h-12 border-2 border-gray-300 dark:border-gray-600 rounded-xl flex items-center justify-center text-xl">
                    ر
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 dark:from-gray-600 dark:to-gray-700 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md relative">
                    ة
                    <div className="absolute inset-0 opacity-30 bg-white rounded-xl blur-sm"></div>
                  </div>
                </motion.div>
                <motion.p variants={itemVariants} className="font-medium">
                  الحرف ة غير موجود في الكلمة.
                </motion.p>
              </motion.div>
            </div>

            <motion.p 
              variants={itemVariants} 
              className="text-lg font-semibold text-gradient text-center"
            >
              هناك كلمة جديدة كل يوم!
            </motion.p>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
