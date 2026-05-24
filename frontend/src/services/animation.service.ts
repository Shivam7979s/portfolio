/*
  animation.service.ts
  Temporary stub for animation utilities.
  Replace with real animation logic when ready.
*/

export interface AnimationService {
  // Generic helper for staggering animations
  stagger<T>(items: T[], delay: number): T[];
  // Helper for simple fade-in motion
  fadeIn(duration?: number, ease?: string): { opacity: number; transition: { duration: number; ease: string } };
  // Add more utility signatures as needed
}

export const useScrollAnimation = (direction: 'up' | 'down' | 'left' | 'right' = 'up') => {
  // No actual animation; just return items unchanged
  return null;
}

class AnimationServiceStub implements AnimationService {
  stagger<T>(items: T[], delay: number): T[] {
    // No actual animation; just return items unchanged
    return items;
  }

  fadeIn(duration = 0.5, ease = 'easeOut') {
    return {
      opacity: 1,
      transition: { duration, ease },
    };
  }
}

export const animationService: AnimationService = new AnimationServiceStub();
