import { useRef } from "react";
import introJs from "intro.js";
import "intro.js/introjs.css";

// Type definitions for steps and hints
export interface IntroJsStep {
  element?: string;
  intro: string;
  position?: string;
  [key: string]: any;
}

export interface IntroJsHint {
  element: string;
  hint: string;
  hintPosition?: string;
  [key: string]: any;
}

export interface UseIntroJsOptions {
  steps?: IntroJsStep[];
  hints?: IntroJsHint[];
  [key: string]: any;
}

interface UseIntroJsReturn {
  start: () => void;
  exit: () => void;
  introRef: React.MutableRefObject<any>;
}

export function useIntroJs({ steps = [], hints = [], ...options }: UseIntroJsOptions = {}): UseIntroJsReturn {
  const introRef = useRef<any>(null);

  const start = () => {
    // Show tour steps if provided
    if (steps && steps.length > 0) {
      introRef.current = introJs.tour();
      introRef.current.setOptions({
        steps,
        ...options,
      });
      introRef.current.start();
    }
    // Show hints if provided
    if (hints && hints.length > 0) {
      introRef.current = introJs.hint();
      introRef.current.setOptions({
        hints,
        ...options,
      });
      introRef.current.addHints();
    }
  };

  const exit = () => {
    introRef.current?.exit?.();
  };

  return { start, exit, introRef };
}