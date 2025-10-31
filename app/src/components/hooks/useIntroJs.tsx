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
    introRef.current = introJs();
    introRef.current.setOptions({
        steps: options.steps || [],
        hints: options.hints || [],
        ...options,
    });
    introRef.current.start();
    if (options.hints && options.hints.length > 0) {
        introRef.current.hint.addHints();
    }
    };

  const exit = () => {
    introRef.current?.exit();
  };

  return { start, exit, introRef };
}