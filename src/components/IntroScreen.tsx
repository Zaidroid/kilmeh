import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { translations } from '../data/translations';
import { Logo } from './ThemeContext';

interface IntroScreenProps {
  handleStart: () => void;
}

/**
 * Introduction screen for first-time users explaining the game.
 */
export function IntroScreen({ handleStart }: IntroScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 3;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    },
    exit: { opacity: 0, transition: { duration: 0.3 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        damping: 25, 
        stiffness: 200 
      }
    }
  };

  const stepVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 200
      }
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 200
      }
    })
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        delay: 0.6,
        type: "spring", 
        damping: 20, 
        stiffness: 300 
      }
    },
    hover: { 
      scale: 1.05,
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
      transition: { 
        duration: 0.2 
      }
    },
    tap: { 
      scale: 0.95,
      boxShadow: "0 5px 15px -5px rgba(0, 0, 0, 0.1)",
      transition: { 
        duration: 0.1 
      }
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Change direction based on whether we're moving forward or backward
  const [direction, setDirection] = useState(1);
  
  const handleNext = () => {
    setDirection(1);
    nextStep();
  };
  
  const handlePrev = () => {
    setDirection(-1);
    prevStep();
  };

  return (
    <motion.div 
      className="fixed inset-0 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 z-50 flex flex-col items-center justify-start p-4 sm:p-6 overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Logo and Title - Always visible */}
      <motion.div 
        className="flex flex-col items-center mb-6 mt-6"
        variants={itemVariants}
      >
        <Logo className="mb-2" />
      </motion.div>

      {/* Step indicators */}
      <motion.div 
        className="flex gap-2 mb-5"
        variants={itemVariants}
      >
        {Array.from({length: totalSteps + 1}).map((_, i) => (
          <div 
            key={i} 
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              i === currentStep 
                ? 'bg-gradient-to-r from-indigo-600 to-teal-500 scale-125' 
                : 'bg-gray-300 dark:bg-gray-600'
            }`}
          />
        ))}
      </motion.div>

      {/* Main content area with steps */}
      <div className="w-full max-w-md h-[450px] overflow-hidden relative mb-5">
        <AnimatePresence initial={false} custom={direction}>
          {/* Step 0: Welcome Screen */}
          {currentStep === 0 && (
            <motion.div
              key="step0"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-0 flex flex-col items-center"
            >
              <motion.div 
                className="card w-full h-full px-6 py-8 flex flex-col items-center justify-center bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 rounded-2xl"
                variants={itemVariants}
              >
                <h2 className="text-2xl font-bold mb-5 text-gradient text-center">مرحباً بك في كلمه!</h2>
                <p className="text-lg mb-8 text-gray-800 dark:text-gray-200 text-center max-w-sm">
                  لعبة الكلمات العربية التي تختبر مهاراتك اللغوية وتحديك في تخمين الكلمة اليومية
                </p>
                
                <motion.div 
                  className="mt-2 w-40 h-40 relative"
                  animate={{
                    rotate: [0, 1, 0, -1, 0],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    repeatType: "loop",
                    ease: "easeInOut"
                  }}
                >
                  <motion.div 
                    className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-600/30 to-teal-500/30 dark:from-cyan-400/20 dark:to-teal-400/20 blur-md"
                    animate={{
                      scale: [1, 1.05, 1.02, 1.07, 1],
                      opacity: [0.8, 0.9, 0.85, 0.95, 0.8],
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      repeatType: "loop",
                      ease: "easeInOut"
                    }}
                  />
                  <motion.div 
                    className="absolute inset-2 rounded-xl flex items-center justify-center bg-white/90 dark:bg-gray-800/90 shadow-xl border border-gray-200 dark:border-gray-700"
                    animate={{
                      y: [0, -3, 0, -2, 0],
                      boxShadow: [
                        "0 10px 25px rgba(0, 0, 0, 0.08)",
                        "0 12px 28px rgba(0, 0, 0, 0.12)",
                        "0 10px 25px rgba(0, 0, 0, 0.08)",
                        "0 11px 26px rgba(0, 0, 0, 0.1)",
                        "0 10px 25px rgba(0, 0, 0, 0.08)"
                      ]
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      repeatType: "loop",
                      ease: "easeInOut"
                    }}
                  >
                    <motion.div
                      animate={{
                        scale: [1, 1.02, 0.99, 1.01, 1],
                      }}
                      transition={{
                        duration: 10,
                        repeat: Infinity,
                        repeatType: "loop",
                        ease: "easeInOut"
                      }}
                    >
                      <Logo className="scale-150" />
                    </motion.div>
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.div>
          )}

          {/* Step 1: How to Play */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-0 flex flex-col items-center"
            >
              <motion.div 
                className="card w-full h-full px-6 py-8 flex flex-col bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 rounded-2xl"
                variants={itemVariants}
              >
                <h2 className="text-xl font-bold mb-6 text-center text-gradient">
                  كيفية اللعب
                </h2>
                
                <div className="flex-1 flex flex-col justify-center">
                  <ul className="space-y-6 text-gray-800 dark:text-gray-200 text-right">
                    <motion.li 
                      className="flex items-start gap-3"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-indigo-600 to-teal-500 flex items-center justify-center text-white font-bold shadow-md">١</div>
                      <span>خمن الكلمة المكونة من ٥ أحرف في ٦ محاولات أو أقل.</span>
                    </motion.li>
                    
                    <motion.li 
                      className="flex items-start gap-3"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-indigo-600 to-teal-500 flex items-center justify-center text-white font-bold shadow-md">٢</div>
                      <span>كل تخمين يجب أن يكون كلمة عربية صحيحة من ٥ أحرف.</span>
                    </motion.li>
                    
                    <motion.li 
                      className="flex items-start gap-3"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9 }}
                    >
                      <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-indigo-600 to-teal-500 flex items-center justify-center text-white font-bold shadow-md">٣</div>
                      <span>بعد كل تخمين، ستتغير ألوان المربعات لإظهار مدى قرب تخمينك من الكلمة الصحيحة.</span>
                    </motion.li>
                  </ul>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Step 2: Examples */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-0 flex flex-col items-center"
            >
              <motion.div 
                className="card w-full h-full px-6 py-8 flex flex-col bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 rounded-2xl"
                variants={itemVariants}
              >
                <h2 className="text-xl font-bold mb-5 text-center text-gradient">
                  أمثلة على التلميحات
                </h2>
                
                <div className="flex-1 flex flex-col justify-center space-y-5 mb-2 px-1 rtl">
                  {/* Example 1: Correct */}
                  <motion.div 
                    className="flex flex-col items-start gap-1.5"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <p className="text-gray-800 dark:text-gray-200 text-right mb-1 text-sm font-semibold w-full">
                      <span className="text-green-500 font-bold">المربع الأخضر</span> يعني أن الحرف موجود في المكان الصحيح
                    </p>
                    <div className="flex gap-1 w-full">
                      <div className="w-10 h-10 flex items-center justify-center rounded-md bg-green-500 text-white text-xl font-bold shadow-md">ك</div>
                      <div className="w-10 h-10 flex items-center justify-center rounded-md border-2 border-gray-300 dark:border-gray-600 text-xl">ت</div>
                      <div className="w-10 h-10 flex items-center justify-center rounded-md border-2 border-gray-300 dark:border-gray-600 text-xl">ا</div>
                      <div className="w-10 h-10 flex items-center justify-center rounded-md border-2 border-gray-300 dark:border-gray-600 text-xl">ب</div>
                      <div className="w-10 h-10 flex items-center justify-center rounded-md border-2 border-gray-300 dark:border-gray-600 text-xl">ة</div>
                    </div>
                  </motion.div>
                  
                  {/* Example 2: Present */}
                  <motion.div 
                    className="flex flex-col items-start gap-1.5"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <p className="text-gray-800 dark:text-gray-200 text-right mb-1 text-sm font-semibold w-full">
                      <span className="text-yellow-500 font-bold">المربع الأصفر</span> يعني أن الحرف موجود لكن في مكان خاطئ
                    </p>
                    <div className="flex gap-1 w-full">
                      <div className="w-10 h-10 flex items-center justify-center rounded-md border-2 border-gray-300 dark:border-gray-600 text-xl">ش</div>
                      <div className="w-10 h-10 flex items-center justify-center rounded-md bg-yellow-500 text-white text-xl font-bold shadow-md">م</div>
                      <div className="w-10 h-10 flex items-center justify-center rounded-md border-2 border-gray-300 dark:border-gray-600 text-xl">س</div>
                      <div className="w-10 h-10 flex items-center justify-center rounded-md border-2 border-gray-300 dark:border-gray-600 text-xl">ي</div>
                      <div className="w-10 h-10 flex items-center justify-center rounded-md border-2 border-gray-300 dark:border-gray-600 text-xl">ة</div>
                    </div>
                  </motion.div>
                  
                  {/* Example 3: Absent */}
                  <motion.div 
                    className="flex flex-col items-start gap-1.5"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <p className="text-gray-800 dark:text-gray-200 text-right mb-1 text-sm font-semibold w-full">
                      <span className="text-gray-500 font-bold">المربع الرمادي</span> يعني أن الحرف غير موجود في الكلمة
                    </p>
                    <div className="flex gap-1 w-full">
                      <div className="w-10 h-10 flex items-center justify-center rounded-md border-2 border-gray-300 dark:border-gray-600 text-xl">ع</div>
                      <div className="w-10 h-10 flex items-center justify-center rounded-md border-2 border-gray-300 dark:border-gray-600 text-xl">ص</div>
                      <div className="w-10 h-10 flex items-center justify-center rounded-md bg-gray-500 text-white text-xl font-bold shadow-md">ف</div>
                      <div className="w-10 h-10 flex items-center justify-center rounded-md border-2 border-gray-300 dark:border-gray-600 text-xl">و</div>
                      <div className="w-10 h-10 flex items-center justify-center rounded-md border-2 border-gray-300 dark:border-gray-600 text-xl">ر</div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Step 3: Ready to play */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-0 flex flex-col items-center"
            >
              <motion.div 
                className="card w-full h-full px-6 py-8 flex flex-col items-center justify-center bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 rounded-2xl"
                variants={itemVariants}
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ 
                    scale: 1, 
                    opacity: 1,
                    transition: { 
                      type: "spring", 
                      damping: 20, 
                      delay: 0.3 
                    }
                  }}
                  className="flex flex-col items-center"
                >
                  <h2 className="text-2xl font-bold mb-5 text-gradient">
                    أنت جاهز للعب!
                  </h2>
                  
                  <p className="text-gray-800 dark:text-gray-200 mb-8 text-center">
                    كل يوم هناك كلمة جديدة لتخمينها. حظاً موفقاً!
                  </p>
                  
                  <motion.div 
                    className="w-40 h-40 relative"
                    animate={{
                      y: [0, -10, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  >
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-br from-indigo-600/30 to-teal-500/30 dark:from-cyan-400/20 dark:to-teal-400/20 rounded-full blur-md"
                      animate={{
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }}
                    />
                    <svg className="relative w-full h-full" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 14V20L4 12L10 4V10H18V14H10Z" fill="url(#paint0_linear)" stroke="url(#paint1_linear)" strokeWidth="2" strokeLinejoin="round"/>
                      <defs>
                        <linearGradient id="paint0_linear" x1="18" y1="20" x2="4" y2="4" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#6366F1" stopOpacity="0.6"/>
                          <stop offset="1" stopColor="#14B8A6" stopOpacity="0.6"/>
                        </linearGradient>
                        <linearGradient id="paint1_linear" x1="18" y1="20" x2="4" y2="4" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#6366F1"/>
                          <stop offset="1" stopColor="#14B8A6"/>
                        </linearGradient>
                      </defs>
                    </svg>
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between w-full max-w-md px-4 mb-8">
        {currentStep > 0 ? (
          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            className="bg-gray-200 dark:bg-gray-700 px-6 py-3 rounded-full text-gray-800 dark:text-gray-200 font-medium shadow-sm"
            onClick={handlePrev}
          >
            السابق
          </motion.button>
        ) : (
          <div></div> // Empty div to maintain flex spacing
        )}

        {currentStep < totalSteps ? (
          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            className="bg-gradient-to-r from-indigo-600 to-teal-500 px-6 py-3 rounded-full text-white font-medium shadow-md"
            onClick={handleNext}
          >
            التالي
          </motion.button>
        ) : (
          <motion.button
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            className="btn-primary px-8 py-3 text-lg"
            onClick={handleStart}
          >
            ابدأ اللعب!
          </motion.button>
        )}
      </div>

      {/* Decorative Elements */}
      <motion.div 
        className="absolute top-20 left-[10%] w-[40vw] max-w-[200px] h-[40vw] max-h-[200px] rounded-full 
                  bg-gradient-to-r from-indigo-600/10 to-teal-500/10 dark:from-cyan-400/5 dark:to-teal-400/5
                  blur-3xl opacity-70 dark:opacity-30 -z-10"
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
        className="absolute bottom-20 right-[15%] w-[35vw] max-w-[150px] h-[35vw] max-h-[150px] rounded-full 
                  bg-gradient-to-r from-teal-500/10 to-indigo-600/10 dark:from-teal-400/5 dark:to-cyan-400/5 
                  blur-3xl opacity-70 dark:opacity-30 -z-10"
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
    </motion.div>
  );
} 
