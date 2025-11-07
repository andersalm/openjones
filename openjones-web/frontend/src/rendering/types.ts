// Animation type definitions for the OpenJones browser port

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
