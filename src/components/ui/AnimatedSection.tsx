'use client';

import React, { useRef, useEffect, useState } from 'react';

interface AnimatedSectionProps {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  className?: string;
  stagger?: boolean;
}

/**
 * CSS-only animated section using Intersection Observer.
 * Replaces framer-motion to eliminate ~45kB from the bundle.
 */
export function AnimatedSection({
  children,
  delay = 0,
  direction = 'up',
  className = '',
}: AnimatedSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Apply delay
          setTimeout(() => setIsVisible(true), delay * 1000);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1, rootMargin: '0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  const getTransform = () => {
    if (isVisible) return 'translate(0, 0) scale(1)';
    switch (direction) {
      case 'up': return 'translate(0, 35px) scale(0.98)';
      case 'down': return 'translate(0, -35px) scale(0.98)';
      case 'left': return 'translate(-35px, 0) scale(0.98)';
      case 'right': return 'translate(35px, 0) scale(0.98)';
      case 'none': return 'scale(0.96)';
      default: return 'translate(0, 35px) scale(0.98)';
    }
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        transition: `opacity 0.55s cubic-bezier(0.22, 1, 0.36, 1), transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)`,
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </div>
  );
}

export function AnimatedItem({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}
