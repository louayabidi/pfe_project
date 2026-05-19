package com.gamification.backend.validation;

import com.gamification.backend.util.PasswordValidator;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class StrongPasswordValidator implements ConstraintValidator<StrongPassword, String> {
    
    @Override
    public void initialize(StrongPassword annotation) {
        // No initialization needed
    }
    
    @Override
    public boolean isValid(String password, ConstraintValidatorContext context) {
        if (password == null) {
            return false;
        }
        return PasswordValidator.isStrong(password);
    }
}