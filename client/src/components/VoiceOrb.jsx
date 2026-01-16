import React from 'react';
import { motion } from 'framer-motion';

export const VoiceOrb = ({ state }) => {
  // state: 'IDLE' | 'LISTENING' | 'THINKING' | 'SPEAKING'

  const variants = {
    IDLE: {
      scale: 1,
      opacity: 0.5,
      boxShadow: "0px 0px 20px 0px rgba(99, 102, 241, 0.3)",
      transition: { duration: 0.5 }
    },
    LISTENING: {
      scale: [1, 1.2, 1],
      opacity: 1,
      boxShadow: "0px 0px 40px 10px rgba(34, 197, 94, 0.6)", // Green glow
      transition: { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
    },
    THINKING: {
      scale: 1.1,
      rotate: 360,
      opacity: 1,
      boxShadow: "0px 0px 50px 15px rgba(168, 85, 247, 0.6)", // Purple glow
      borderRadius: ["50%", "40%", "50%"], // Slight morphing
      transition: { rotate: { repeat: Infinity, duration: 2, ease: "linear" }, borderRadius: { repeat: Infinity, duration: 1 } }
    },
    SPEAKING: {
      scale: [1, 1.1, 0.9, 1.15, 1],
      opacity: 1,
      boxShadow: "0px 0px 40px 10px rgba(59, 130, 246, 0.7)", // Blue glow
      transition: { repeat: Infinity, duration: 0.8, ease: "easeInOut" } // Faster vibration
    }
  };

  const colorMap = {
    IDLE: 'bg-indigo-400',
    LISTENING: 'bg-green-400',
    THINKING: 'bg-purple-500',
    SPEAKING: 'bg-blue-500'
  };

  return (
    <div className="relative flex justify-center items-center h-64 w-64">
      {/* Outer rings for decoration */}
      <motion.div 
        className="absolute w-full h-full rounded-full border border-white/10" 
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
      />
      <motion.div 
        className="absolute w-48 h-48 rounded-full border border-white/20 border-dashed" 
        animate={{ rotate: -360 }}
        transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
      />

      {/* Main Orb */}
      <motion.div
        className={`w-32 h-32 rounded-full ${colorMap[state] || 'bg-gray-400'} blur-sm cursor-pointer backdrop-blur-xl`}
        variants={variants}
        animate={state}
        initial="IDLE"
      />
      
      {/* Inner Core */}
      <div className="absolute w-24 h-24 rounded-full bg-white/20 backdrop-blur-md" />
    </div>
  );
};
