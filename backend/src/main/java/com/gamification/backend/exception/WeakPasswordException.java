package com.gamification.backend.exception;


public class WeakPasswordException extends RuntimeException {
    
    private final String requirement;
    
    public WeakPasswordException(String requirement) {
        super("Password does not meet security requirements: " + requirement);
        this.requirement = requirement;
    }
    
    public String getRequirement() {
        return requirement;
    }
}