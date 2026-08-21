'use client';

import React from 'react';
import { AnimatedSection } from '@/components/ui/AnimatedSection';

interface LazyAnimatedSectionProps {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  className?: string;
  stagger?: boolean;
}

/**
 * Re-export of AnimatedSection.
 * Previously used dynamic import to defer framer-motion,
 * but AnimatedSection now uses CSS animations, so this
 * is just a pass-through for backward compatibility.
 */
export function LazyAnimatedSection({
  children,
  delay,
  direction,
  className,
  stagger,
}: LazyAnimatedSectionProps) {
  return (
    <AnimatedSection delay={delay} direction={direction} className={className} stagger={stagger}>
      {children}
    </AnimatedSection>
  );
}
