import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Loader2 } from 'lucide-react';

export function AnalysisLoading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center h-full min-h-[60vh] gap-8">
      <div className="relative">
        {/* Outer Ripple */}
        <motion.div
          animate={{
            scale: [1, 1.5, 2],
            opacity: [0.5, 0.2, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut",
          }}
          className="absolute inset-0 bg-blue-100 rounded-full"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1.5],
            opacity: [0.5, 0.3, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut",
            delay: 0.5,
          }}
          className="absolute inset-0 bg-blue-200 rounded-full"
        />
        
        {/* Central Icon */}
        <div className="relative w-24 h-24 bg-white rounded-full shadow-xl flex items-center justify-center border border-gray-100 z-10">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
             <Loader2 className="w-10 h-10 text-blue-600" />
          </motion.div>
          <div className="absolute inset-0 flex items-center justify-center">
             <Sparkles className="w-5 h-5 text-orange-400 absolute -top-1 -right-1 animate-bounce" />
          </div>
        </div>
      </div>

      <div className="text-center space-y-2 z-10">
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-gray-900"
        >
          인사이트 분석 중...
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-gray-500 text-sm"
        >
          리소스를 읽고 핵심 신호를 찾는 중입니다.
        </motion.p>
      </div>
    </div>
  );
}
