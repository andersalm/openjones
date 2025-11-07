import type { Animation, Tween, AnimationState, EasingFunction, AnimationFrame } from './types';
import { Easing } from './easing';

/**
 * AnimationEngine - Manages smooth, frame-based animations for the OpenJones browser port
 *
 * Features:
 * - Handles player movement animations, building entry/exit transitions, idle animations
 * - Smooth visual transitions using requestAnimationFrame
 * - Tween/easing functions for smooth transitions
 * - Animation state management and queue system
 */
export class AnimationEngine {
  private animations: Map<string, Animation> = new Map();
  private tweens: Map<string, Tween> = new Map();
  private animationStates: Map<string, AnimationState> = new Map();
  private running: boolean = false;
  private lastTimestamp: number = 0;
  private animationFrameId: number | null = null;

  constructor() {
    // Engine starts paused
  }

  /**
   * Start the animation loop
   */
  start(): void {
    if (this.running) return;

    this.running = true;
    this.lastTimestamp = performance.now();
    this.animationFrameId = requestAnimationFrame((timestamp) => this.loop(timestamp));
  }

  /**
   * Stop the animation loop
   */
  stop(): void {
    this.running = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Main animation loop
   */
  private loop(timestamp: number): void {
    if (!this.running) return;

    const deltaTime = timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;

    // Update all tweens
    this.updateTweens(deltaTime);

    // Update all animations
    this.updateAnimations(deltaTime);

    // Schedule next frame
    this.animationFrameId = requestAnimationFrame((ts) => this.loop(ts));
  }

  /**
   * Update all active tweens
   */
  private updateTweens(deltaTime: number): void {
    const completedTweens: string[] = [];

    this.tweens.forEach((tween, id) => {
      tween.elapsed += deltaTime;
      const progress = Math.min(tween.elapsed / tween.duration, 1);
      const easedProgress = tween.easing(progress);

      const currentX = tween.startX + (tween.endX - tween.startX) * easedProgress;
      const currentY = tween.startY + (tween.endY - tween.startY) * easedProgress;

      if (tween.onUpdate) {
        tween.onUpdate(currentX, currentY);
      }

      if (progress >= 1) {
        if (tween.onComplete) {
          tween.onComplete();
        }
        completedTweens.push(id);
      }
    });

    // Remove completed tweens
    completedTweens.forEach(id => this.tweens.delete(id));
  }

  /**
   * Update all active animations
   */
  private updateAnimations(deltaTime: number): void {
    const completedAnimations: string[] = [];

    this.animations.forEach((animation, id) => {
      const state = this.animationStates.get(id);
      if (!state || !state.playing) return;

      state.elapsed += deltaTime;

      const currentFrame = animation.frames[state.currentFrame];
      if (state.elapsed >= currentFrame.duration) {
        state.elapsed = 0;
        state.currentFrame++;

        if (state.currentFrame >= animation.frames.length) {
          if (animation.loop) {
            state.currentFrame = 0;
          } else {
            state.playing = false;
            if (animation.onComplete) {
              animation.onComplete();
            }
            completedAnimations.push(id);
          }
        }
      }
    });

    // Remove completed non-looping animations
    completedAnimations.forEach(id => {
      this.animations.delete(id);
      this.animationStates.delete(id);
    });
  }

  /**
   * Create a movement tween
   */
  createTween(
    id: string,
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    duration: number,
    easing: EasingFunction = Easing.easeInOutQuad,
    onUpdate?: (x: number, y: number) => void,
    onComplete?: () => void
  ): void {
    this.tweens.set(id, {
      id,
      startX,
      startY,
      endX,
      endY,
      duration,
      elapsed: 0,
      easing,
      onUpdate,
      onComplete,
    });
  }

  /**
   * Cancel a tween
   */
  cancelTween(id: string): void {
    this.tweens.delete(id);
  }

  /**
   * Add an animation
   */
  addAnimation(animation: Animation): void {
    this.animations.set(animation.id, animation);
    this.animationStates.set(animation.id, {
      currentFrame: 0,
      elapsed: 0,
      playing: true,
    });
  }

  /**
   * Remove an animation
   */
  removeAnimation(id: string): void {
    this.animations.delete(id);
    this.animationStates.delete(id);
  }

  /**
   * Pause an animation
   */
  pauseAnimation(id: string): void {
    const state = this.animationStates.get(id);
    if (state) {
      state.playing = false;
    }
  }

  /**
   * Resume an animation
   */
  resumeAnimation(id: string): void {
    const state = this.animationStates.get(id);
    if (state) {
      state.playing = true;
    }
  }

  /**
   * Get current animation frame
   */
  getCurrentFrame(animationId: string): AnimationFrame | null {
    const animation = this.animations.get(animationId);
    const state = this.animationStates.get(animationId);

    if (!animation || !state) return null;
    if (animation.frames.length === 0) return null;

    return animation.frames[state.currentFrame] || null;
  }

  /**
   * Check if tween is active
   */
  isTweening(id: string): boolean {
    return this.tweens.has(id);
  }

  /**
   * Check if animation is playing
   */
  isPlaying(id: string): boolean {
    const state = this.animationStates.get(id);
    return state ? state.playing : false;
  }

  /**
   * Clear all animations and tweens
   */
  clear(): void {
    this.animations.clear();
    this.tweens.clear();
    this.animationStates.clear();
  }

  /**
   * Get animation count (for debugging)
   */
  getAnimationCount(): number {
    return this.animations.size;
  }

  /**
   * Get tween count (for debugging)
   */
  getTweenCount(): number {
    return this.tweens.size;
  }
}
