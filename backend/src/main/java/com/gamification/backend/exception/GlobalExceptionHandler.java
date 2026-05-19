package com.gamification.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationErrors(
            MethodArgumentNotValidException ex) {

        // Collect all field error messages
        String message = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining(". "));

        Map<String, Object> body = new HashMap<>();
        body.put("error", "Validation failed");
        body.put("message", message);

        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(AccountLockedException.class)
    public ResponseEntity<Map<String, Object>> handleAccountLocked(
            AccountLockedException ex) {

        Map<String, Object> body = new HashMap<>();
        body.put("error", "Account locked");
        body.put("message", ex.getMessage());
        body.put("remainingSeconds", ex.getRemainingLockoutSeconds());
        body.put("remainingMinutes", Math.ceil(ex.getRemainingLockoutSeconds() / 60.0));

        return new ResponseEntity<>(body, HttpStatus.FORBIDDEN);
    }
}