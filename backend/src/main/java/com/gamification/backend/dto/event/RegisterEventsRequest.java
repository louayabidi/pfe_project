package com.gamification.backend.dto.event;

import lombok.Data;
import java.util.List;

@Data
public class RegisterEventsRequest {
    private List<String> events;
    // reçoit : ["completeLevel", "purchaseItem", "login"]
}