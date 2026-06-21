import { useEffect, useRef } from 'react';

export interface FocusTrapOptions {
  initialFocusRef?: React.RefObject<HTMLElement | null>;
}

export function useFocusTrap(isOpen: boolean, onClose: () => void, containerRef: React.RefObject<HTMLElement | null>, options?: FocusTrapOptions) {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
        previousFocusRef.current = null;
      }
      return;
    }

    previousFocusRef.current = document.activeElement as HTMLElement;

    const timer = setTimeout(() => {
      if (!containerRef.current) return;
      
      if (options?.initialFocusRef?.current) {
        options.initialFocusRef.current.focus();
        return;
      }

      const active = document.activeElement;
      
      // If something inside is already focused, don't override
      if (!containerRef.current.contains(active)) {
        const focusableElements = containerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length > 0) {
          focusableElements[0].focus();
        } else {
          containerRef.current.focus();
        }
      }
    }, 10);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        if (!containerRef.current) return;
        const focusableElements = Array.from(
          containerRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
        ).filter(el => !el.hasAttribute('disabled'));

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement || document.activeElement === containerRef.current) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, containerRef]);
}
