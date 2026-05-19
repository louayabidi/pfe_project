/**
 * Password strength validation and scoring utility
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one number
 * - At least one special character
 */

export interface PasswordStrength {
  isValid: boolean;
  score: number; // 0-5
  label: string;
  errors: string[];
  requirements: PasswordRequirement[];
}

export interface PasswordRequirement {
  name: string;
  met: boolean;
}

const UPPERCASE_REGEX = /[A-Z]/;
const NUMBER_REGEX = /[0-9]/;
const SPECIAL_CHAR_REGEX = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>?/~`]/;
const MIN_LENGTH = 8;

export class PasswordStrengthChecker {
  
  static validate(password: string): PasswordStrength {
    const errors: string[] = [];
    const requirements: PasswordRequirement[] = [];
    
    // Check length
    const lengthMet = password.length >= MIN_LENGTH;
    requirements.push({
      name: `At least ${MIN_LENGTH} characters`,
      met: lengthMet
    });
    if (!lengthMet) {
      errors.push(`Password must be at least ${MIN_LENGTH} characters (current: ${password.length})`);
    }
    
    // Check uppercase
    const uppercaseMet = UPPERCASE_REGEX.test(password);
    requirements.push({
      name: 'At least one uppercase letter (A-Z)',
      met: uppercaseMet
    });
    if (!uppercaseMet) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    // Check number
    const numberMet = NUMBER_REGEX.test(password);
    requirements.push({
      name: 'At least one number (0-9)',
      met: numberMet
    });
    if (!numberMet) {
      errors.push('Password must contain at least one number');
    }
    
    // Check special character
    const specialCharMet = SPECIAL_CHAR_REGEX.test(password);
    requirements.push({
      name: 'At least one special character (!@#$%^&*)',
      met: specialCharMet
    });
    if (!specialCharMet) {
      errors.push('Password must contain at least one special character');
    }
    
    // Calculate score (0-5)
    let score = 0;
    if (lengthMet) score++;
    if (password.length >= 12) score++;
    if (uppercaseMet) score++;
    if (numberMet) score++;
    if (specialCharMet) score++;
    
    const isValid = errors.length === 0;
    const label = this.getStrengthLabel(score);
    
    return {
      isValid,
      score,
      label,
      errors,
      requirements
    };
  }
  
  private static getStrengthLabel(score: number): string {
    switch (score) {
      case 0:
        return 'Very Weak';
      case 1:
        return 'Weak';
      case 2:
        return 'Fair';
      case 3:
        return 'Good';
      case 4:
        return 'Strong';
      case 5:
        return 'Very Strong';
      default:
        return 'Unknown';
    }
  }
  
  static getStrengthColor(score: number): string {
    switch (score) {
      case 0:
      case 1:
        return '#ef4444'; // red
      case 2:
        return '#f97316'; // orange
      case 3:
        return '#eab308'; // yellow
      case 4:
        return '#84cc16'; // lime
      case 5:
        return '#22c55e'; // green
      default:
        return '#9ca3af'; // gray
    }
  }
}