// Easing functions for smooth animations

export const Easing = {
  /**
   * Linear easing - no acceleration or deceleration
   */
  linear: (t: number): number => t,

  /**
   * Quadratic ease-in - starts slow, accelerates
   */
  easeInQuad: (t: number): number => t * t,

  /**
   * Quadratic ease-out - starts fast, decelerates
   */
  easeOutQuad: (t: number): number => t * (2 - t),

  /**
   * Quadratic ease-in-out - slow start and end, fast middle
   */
  easeInOutQuad: (t: number): number =>
    t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,

  /**
   * Cubic ease-in - starts slow, accelerates more than quad
   */
  easeInCubic: (t: number): number => t * t * t,

  /**
   * Cubic ease-out - starts fast, decelerates more than quad
   */
  easeOutCubic: (t: number): number => {
    const t1 = t - 1;
    return t1 * t1 * t1 + 1;
  },

  /**
   * Cubic ease-in-out - slow start and end, fast middle
   */
  easeInOutCubic: (t: number): number =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
};
