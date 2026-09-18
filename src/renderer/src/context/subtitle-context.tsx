import {
  createContext, useState, useMemo, useContext, memo, useRef, useEffect, useCallback,
} from 'react';

/**
 * Subtitle context state interface
 * @interface SubtitleState
 */
interface SubtitleState {
  /** Current subtitle text (full text) */
  subtitleText: string

  /** Set subtitle text directly (no animation) */
  setSubtitleText: (text: string) => void

  /** Type subtitle text with animation effect */
  typeSubtitleText: (text: string, speed?: number) => void

  /** Stop current typing animation */
  stopTyping: () => void

  /** Whether to show subtitle */
  showSubtitle: boolean

  /** Toggle subtitle visibility */
  setShowSubtitle: (show: boolean) => void
}

/**
 * Default values and constants
 */
const DEFAULT_SUBTITLE = {
  text: "Hi, I'm some random AI VTuber. Who the hell are ya? "
        + 'Ahh, you must be amazed by my awesomeness, right? right?',
};

/**
 * Create the subtitle context
 */
export const SubtitleContext = createContext<SubtitleState | null>(null);

/**
 * Subtitle Provider Component
 * Manages the subtitle display text state
 *
 * @param {Object} props - Provider props
 * @param {React.ReactNode} props.children - Child components
 */
export const SubtitleProvider = memo(({ children }: { children: React.ReactNode }) => {
  // State management
  const [subtitleText, setSubtitleText] = useState<string>(DEFAULT_SUBTITLE.text);
  const [showSubtitle, setShowSubtitle] = useState<boolean>(true);

  // Typing animation state
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef<boolean>(false);
  const currentTextRef = useRef<string>('');
  const currentIndexRef = useRef<number>(0);

  // Stop typing animation
  const stopTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    isTypingRef.current = false;
  }, []);

  // Type subtitle text with animation
  const typeSubtitleText = useCallback((text: string, speed: number = 30) => {
    // Stop any existing typing animation
    stopTyping();

    // Reset state
    currentTextRef.current = text;
    currentIndexRef.current = 0;
    isTypingRef.current = true;

    // Start with empty text
    setSubtitleText('');

    const typeNextChar = () => {
      if (!isTypingRef.current || currentIndexRef.current >= currentTextRef.current.length) {
        isTypingRef.current = false;
        return;
      }

      // Get the next character to add
      const nextChar = currentTextRef.current[currentIndexRef.current];
      currentIndexRef.current++;

      // Update the displayed text
      setSubtitleText(currentTextRef.current.substring(0, currentIndexRef.current));

      // Schedule next character
      // Use shorter delay for punctuation to make it feel more natural
      let delay = speed;
      if (nextChar === '.' || nextChar === '!' || nextChar === '?') {
        delay = speed * 8; // Pause longer at end of sentences
      } else if (nextChar === ',' || nextChar === ';' || nextChar === ':') {
        delay = speed * 4; // Medium pause at commas
      } else if (nextChar === '\n') {
        delay = speed * 6; // Pause at newlines
      }

      typingTimeoutRef.current = setTimeout(typeNextChar, delay);
    };

    // Start typing
    typingTimeoutRef.current = setTimeout(typeNextChar, speed);
  }, [stopTyping]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Memoized context value
  const contextValue = useMemo(
    () => ({
      subtitleText,
      setSubtitleText,
      typeSubtitleText,
      stopTyping,
      showSubtitle,
      setShowSubtitle,
    }),
    [subtitleText, showSubtitle, typeSubtitleText, stopTyping],
  );

  return (
    <SubtitleContext.Provider value={contextValue}>
      {children}
    </SubtitleContext.Provider>
  );
});

/**
 * Custom hook to use the subtitle context
 * @throws {Error} If used outside of SubtitleProvider
 */
export function useSubtitle() {
  const context = useContext(SubtitleContext);

  if (!context) {
    throw new Error('useSubtitle must be used within a SubtitleProvider');
  }

  return context;
}
