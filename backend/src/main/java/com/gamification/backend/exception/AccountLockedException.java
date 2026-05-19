package com.gamification.backend.exception;


public class AccountLockedException extends RuntimeException {
    
    private final long remainingLockoutSeconds;
    
    public AccountLockedException(long remainingLockoutSeconds) {
        super("Account is locked. Try again in " + remainingLockoutSeconds + " seconds.");
        this.remainingLockoutSeconds = remainingLockoutSeconds;
    }
    
    public long getRemainingLockoutSeconds() {
        return remainingLockoutSeconds;
    }
}