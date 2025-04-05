"use client";
import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { FaAws, FaGoogle, FaMicrosoft } from 'react-icons/fa';
import { SiVercel } from 'react-icons/si';

const LoadingClouds = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [progress, setProgress] = useState(0);
  const controls = useAnimation();

  useEffect(() => {
    setIsMounted(true);
    controls.start("visible");

    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress(prev => Math.min(prev + Math.random() * 10, 100));
    }, 300);

    return () => clearInterval(interval);
  }, [controls]);

  const clouds = [
    {
      icon: <FaAws className="text-orange-500 text-5xl" />,
      gradient: "bg-gradient-to-br from-orange-400 to-orange-600",
      provider: "AWS",
      position: "left-[-25%] top-[-15%]",
      delay: 0.2,
      rotate: -15
    },
    {
      icon: <FaMicrosoft className="text-blue-500 text-5xl" />,
      gradient: "bg-gradient-to-br from-blue-400 to-blue-600",
      provider: "Azure",
      position: "right-[-25%] top-[-15%]",
      delay: 0.4,
      rotate: 15
    },
    {
      icon: <FaGoogle className="text-blue-400 text-5xl" />,
      gradient: "bg-gradient-to-br from-blue-300 to-blue-500",
      provider: "GCP",
      position: "left-[-25%] bottom-[-15%]",
      delay: 0.6,
      rotate: -10
    },
    {
      icon: <SiVercel className="text-black text-5xl" />,
      gradient: "bg-gradient-to-br from-gray-700 to-gray-900",
      provider: "Vercel",
      position: "right-[-25%] bottom-[-15%]",
      delay: 0.8,
      rotate: 10
    }
  ];

  if (!isMounted) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 to-gray-950 z-50 flex items-center justify-center overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              width: Math.random() * 10 + 2,
              height: Math.random() * 10 + 2,
              opacity: 0
            }}
            animate={{
              opacity: [0, 0.2, 0],
              transition: {
                duration: Math.random() * 10 + 5,
                repeat: Infinity,
                repeatType: "reverse"
              }
            }}
          />
        ))}
      </div>

      {/* Main container */}
      <div className="relative w-full h-full max-w-4xl max-h-4xl">
        {/* Animated clouds */}
        {clouds.map((cloud, i) => (
          <motion.div
            key={i}
            className={`absolute ${cloud.position} w-64 h-48`}
            initial={{ 
              opacity: 0,
              x: cloud.position.includes('left') ? '-100vw' : '100vw',
              y: cloud.position.includes('top') ? '-100vh' : '100vh',
              rotate: cloud.rotate,
              scale: 0.5
            }}
            animate={{ 
              opacity: 1,
              x: 0,
              y: 0,
              rotate: 0,
              scale: 1,
              transition: {
                delay: cloud.delay,
                duration: 1.5,
                type: "spring",
                stiffness: 80,
                damping: 12
              }
            }}
            whileHover={{ scale: 1.05 }}
          >
            {/* Cloud shape */}
            <div className={`absolute inset-0 ${cloud.gradient} opacity-90 rounded-[50%]`}>
              <div className={`absolute w-32 h-32 ${cloud.gradient} rounded-full -top-8 -left-6 opacity-90`} />
              <div className={`absolute w-28 h-28 ${cloud.gradient} rounded-full -top-10 right-6 opacity-90`} />
              <div className={`absolute w-24 h-24 ${cloud.gradient} rounded-full bottom-4 left-8 opacity-90`} />
              <div className={`absolute w-20 h-20 ${cloud.gradient} rounded-full bottom-2 right-10 opacity-90`} />
            </div>
            
            {/* Cloud icon */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ 
                scale: 1,
                transition: { 
                  delay: cloud.delay + 0.5,
                  type: "spring",
                  stiffness: 300,
                  damping: 15
                }
              }}
              whileHover={{ scale: 1.1 }}
            >
              {cloud.icon}
            </motion.div>
          </motion.div>
        ))}

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
              transition: {
                delay: 1.5,
                type: "spring",
                stiffness: 200,
                damping: 15
              }
            }}
            className="relative"
          >
            <motion.div
              className="text-7xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent"
              animate={{
                scale: [1, 1.05, 1],
                transition: {
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut"
                }
              }}
            >
              DEPLOYX
            </motion.div>
            <motion.div
              className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 rounded-full"
              initial={{ scaleX: 0 }}
              animate={{
                scaleX: 1,
                transition: {
                  delay: 1.7,
                  duration: 0.8,
                  ease: "easeOut"
                }
              }}
            />
          </motion.div>

          {/* Progress bar */}
          <motion.div
            className="relative w-1/2 h-3 mt-12 bg-gray-800 rounded-full overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              transition: { delay: 1.9 }
            }}
          >
            <motion.div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-400 to-blue-400"
              initial={{ width: 0 }}
              animate={{
                width: `${progress}%`,
                transition: { duration: 0.3 }
              }}
            />
            <motion.div
              className="absolute top-0 left-0 h-full bg-white opacity-20"
              initial={{ width: 0 }}
              animate={{
                width: "100%",
                transition: {
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }
              }}
            />
          </motion.div>

          {/* Status text */}
          <motion.div
            className="mt-6 text-gray-300 text-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: 1,
              y: 0,
              transition: { delay: 2.1 }
            }}
          >
            {progress < 30 && "Connecting to cloud providers..."}
            {progress >= 30 && progress < 70 && "Configuring deployment..."}
            {progress >= 70 && "Finalizing setup..."}
          </motion.div>

          {/* Percentage indicator */}
          <motion.div
            className="mt-4 text-2xl font-mono text-white"
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              transition: { delay: 2.3 }
            }}
          >
            {Math.round(progress)}%
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LoadingClouds;