// Rendering type definitions for the OpenJones browser port

// ============================================================================
// Animation Engine Types (Worker 1 - Task D4)
// ============================================================================

export interface AnimationFrame {
  spriteId: string;
  duration: number; // milliseconds
  x: number;
  y: number;
  scale?: number;
  opacity?: number;
  rotation?: number;
}

export interface Animation {
  id: string;
  frames: AnimationFrame[];
  loop: boolean;
  onComplete?: () => void;
}

export interface Tween {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  duration: number; // milliseconds
  elapsed: number;
  easing: EasingFunction;
  onUpdate?: (x: number, y: number) => void;
  onComplete?: () => void;
}

export type EasingFunction = (t: number) => number;

export interface AnimationState {
  currentFrame: number;
  elapsed: number;
  playing: boolean;
}

// ============================================================================
// Effects Renderer Types (Worker 2 - Task D5)
// ============================================================================

export interface Particle {
  id: string;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  lifetime: number; // milliseconds
  elapsed: number;
  color: string;
  size: number;
  opacity: number;
  text?: string; // For text particles like "$100"
}

export interface Effect {
  id: string;
  type: EffectType;
  x: number;
  y: number;
  duration: number;
  elapsed: number;
  data?: any; // Effect-specific data
}

export enum EffectType {
  MONEY_GAIN = 'MONEY_GAIN',
  MONEY_LOSS = 'MONEY_LOSS',
  HEALTH_CHANGE = 'HEALTH_CHANGE',
  HAPPINESS_CHANGE = 'HAPPINESS_CHANGE',
  SPARKLE = 'SPARKLE',
  GLOW = 'GLOW',
  PULSE = 'PULSE',
}

export interface HighlightConfig {
  color: string;
  width: number;
  opacity: number;
  animated: boolean;
}
