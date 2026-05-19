package com.gamification.backend.util;

import java.util.regex.Pattern;

/**
 * Utility class for password validation and strength checking
 */
public class PasswordValidator {
    
    // Patterns for password requirements
    private static final Pattern UPPERCASE_PATTERN = Pattern.compile("[A-Z]");
    private static final Pattern NUMBER_PATTERN = Pattern.compile("[0-9]");
    private static final Pattern SPECIAL_CHAR_PATTERN = Pattern.compile("[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>?/~`]");
    
    private static final int MIN_LENGTH = 8;
    
    /**
     * Validate password strength
     * Requirements:
     * - Minimum 8 characters
     * - At least one uppercase letter
     * - At least one number
     * - At least one special character
     * 
     * @param password the password to validate
     * @return PasswordValidationResult with detailed feedback
     */
    public static PasswordValidationResult validate(String password) {
        if (password == null || password.isEmpty()) {
            return new PasswordValidationResult(
                false,
                "Password cannot be empty"
            );
        }
        
        if (password.length() < MIN_LENGTH) {
            return new PasswordValidationResult(
                false,
                "Password must be at least " + MIN_LENGTH + " characters long"
            );
        }
        
        if (!UPPERCASE_PATTERN.matcher(password).find()) {
            return new PasswordValidationResult(
                false,
                "Password must contain at least one uppercase letter (A-Z)"
            );
        }
        
        if (!NUMBER_PATTERN.matcher(password).find()) {
            return new PasswordValidationResult(
                false,
                "Password must contain at least one number (0-9)"
            );
        }
        
        if (!SPECIAL_CHAR_PATTERN.matcher(password).find()) {
            return new PasswordValidationResult(
                false,
                "Password must contain at least one special character (!@#$%^&*)"
            );
        }
        
        return new PasswordValidationResult(
            true,
            "Password is strong"
        );
    }
    
    /**
     * Check if password meets minimum requirements
     */
    public static boolean isStrong(String password) {
        return validate(password).isValid();
    }
    
    /**
     * Get password strength level (0-5)
     * Used for visual feedback on strength meter
     */
    public static int getStrengthLevel(String password) {
        if (password == null || password.isEmpty()) {
            return 0;
        }
        
        int score = 0;
        
        // Length scoring
        if (password.length() >= 8) score++;
        if (password.length() >= 12) score++;
        
        // Character variety scoring
        if (UPPERCASE_PATTERN.matcher(password).find()) score++;
        if (NUMBER_PATTERN.matcher(password).find()) score++;
        if (SPECIAL_CHAR_PATTERN.matcher(password).find()) score++;
        
        return Math.min(score, 5);
    }
    
    /**
     * Get strength label for UI display
     */
    public static String getStrengthLabel(String password) {
        int level = getStrengthLevel(password);
        return switch (level) {
            case 0 -> "Very Weak";
            case 1 -> "Weak";
            case 2 -> "Fair";
            case 3 -> "Good";
            case 4 -> "Strong";
            case 5 -> "Very Strong";
            default -> "Unknown";
        };
    }
    
    /**
     * Result object for password validation
     */
    public static class PasswordValidationResult {
        private final boolean valid;
        private final String message;
        
        public PasswordValidationResult(boolean valid, String message) {
            this.valid = valid;
            this.message = message;
        }
        
        public boolean isValid() {
            return valid;
        }
        
        public String getMessage() {
            return message;
        }
    }
}