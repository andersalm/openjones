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
