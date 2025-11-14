/**
 * Error Handling Utilities
 *
 * Reusable error collection and formatting patterns for action classes.
 * Reduces code duplication and improves maintainability.
 *
 * @example
 * ```typescript
 * const error = collectAndFormatErrors([
 *   { isValid: player.job !== null, message: "You don't have a job" },
 *   { isValid: game.timeUnitsRemaining >= 60, message: "Not enough time" }
 * ]);
 * if (error) {
 *   return ActionResponse.failure(error);
 * }
 * ```
 */

export interface ErrorCheck {
  /** Whether the check passes (true = no error) */
  isValid: boolean;
  /** Error message to show if check fails */
  message: string;
}

/**
 * Collects errors from multiple validation checks
 *
 * @param checks Array of error checks to evaluate
 * @returns Array of error messages for failed checks
 */
export function collectErrors(checks: ErrorCheck[]): string[] {
  return checks
    .filter(check => !check.isValid)
    .map(check => check.message);
}

/**
 * Formats multiple errors into a single error message string
 *
 * @param errors Array of error messages
 * @param separator String to join errors with (default: '; ')
 * @returns Single formatted error string, or empty string if no errors
 */
export function formatErrors(errors: string[], separator: string = '; '): string {
  return errors.join(separator);
}

/**
 * Combined error collection and formatting
 *
 * @param checks Array of error checks
 * @param separator String to join errors with (default: '; ')
 * @returns Formatted error string, or empty string if no errors
 */
export function collectAndFormatErrors(
  checks: ErrorCheck[],
  separator: string = '; '
): string {
  const errors = collectErrors(checks);
  return formatErrors(errors, separator);
}
