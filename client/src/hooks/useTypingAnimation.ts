import { useState, useEffect } from "react";

interface UseTypingAnimationProps {
  questions: string[];
  isActive: boolean;
  typingSpeed?: number;
  erasingSpeed?: number;
  pauseDuration?: number;
}

export function useTypingAnimation({
  questions,
  isActive,
  typingSpeed = 75,
  erasingSpeed = 30,
  pauseDuration = 2000
}: UseTypingAnimationProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    if (!isActive || questions.length === 0) {
      setDisplayedText("");
      return;
    }

    const currentQuestion = questions[currentIndex];
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
        setCurrentIndex((prev) => (prev + 1) % questions.length);
        setIsTyping(true);
      }
    }

    return () => clearTimeout(timeoutId);
  }, [displayedText, isTyping, currentIndex, isActive, questions, typingSpeed, erasingSpeed, pauseDuration]);

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