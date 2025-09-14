import { useState, useEffect } from "react";

interface UseTypingAnimationProps {
  questions: string[];
  isActive: boolean;
  typingSpeed?: number;
  erasingSpeed?: number;
  pauseDuration?: number;
  mobileQuestions?: string[];
  tabletQuestions?: string[];
}

export function useTypingAnimation({
  questions,
  isActive,
  typingSpeed = 75,
  erasingSpeed = 30,
  pauseDuration = 2000,
  mobileQuestions,
  tabletQuestions
}: UseTypingAnimationProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [screenWidth, setScreenWidth] = useState(() => 
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  // Resize listener
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get responsive questions based on screen size
  const getResponsiveQuestions = () => {
    if (screenWidth < 640 && mobileQuestions) {
      return mobileQuestions;
    } else if (screenWidth < 768 && tabletQuestions) {
      return tabletQuestions;
    }
    return questions;
  };

  // Reset animation when screen size changes question set
  useEffect(() => {
    if (isActive) {
      setDisplayedText("");
      setIsTyping(true);
      setCurrentIndex(0);
    }
  }, [screenWidth, isActive]);

  useEffect(() => {
    const activeQuestions = getResponsiveQuestions();
    if (!isActive || activeQuestions.length === 0) {
      setDisplayedText("");
      return;
    }

    const currentQuestion = activeQuestions[currentIndex % activeQuestions.length];
    let timeoutId: NodeJS.Timeout;

    if (isTyping) {
      // Typing animation
      if (displayedText.length < currentQuestion.length) {
        timeoutId = setTimeout(() => {
          setDisplayedText(currentQuestion.slice(0, displayedText.length + 1));
        }, typingSpeed + Math.random() * 50); // Variable speed for natural feel
      } else {
        // Pause before erasing
        timeoutId = setTimeout(() => {
          setIsTyping(false);
        }, pauseDuration);
      }
    } else {
      // Erasing animation
      if (displayedText.length > 0) {
        timeoutId = setTimeout(() => {
          setDisplayedText(displayedText.slice(0, -1));
        }, erasingSpeed);
      } else {
        // Move to next question
        const activeQuestions = getResponsiveQuestions();
        setCurrentIndex((prev) => (prev + 1) % activeQuestions.length);
        setIsTyping(true);
      }
    }

    return () => clearTimeout(timeoutId);
  }, [displayedText, isTyping, currentIndex, isActive, questions, mobileQuestions, tabletQuestions, typingSpeed, erasingSpeed, pauseDuration]);

  // Reset when becoming active
  useEffect(() => {
    if (isActive) {
      setDisplayedText("");
      setIsTyping(true);
      setCurrentIndex(0);
    }
  }, [isActive]);

  return {
    displayedText,
    currentIndex,
    isTyping
  };
}