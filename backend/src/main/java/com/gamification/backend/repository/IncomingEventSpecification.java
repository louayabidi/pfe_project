package com.gamification.backend.repository;

import com.gamification.backend.model.IncomingEvent;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public final class IncomingEventSpecification {

    private IncomingEventSpecification() {}

    public static Specification<IncomingEvent> build(
            Long appId,
            String userId,
            String eventName,
            LocalDateTime from,
            LocalDateTime to) {

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.equal(root.get("app").get("id"), appId));

            if (userId != null && !userId.isBlank())
                predicates.add(cb.equal(root.get("userId"), userId));

            if (eventName != null && !eventName.isBlank())
                predicates.add(cb.equal(root.get("eventName"), eventName));

            if (from != null)
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), from));

            if (to != null)
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), to));

            query.orderBy(cb.desc(root.get("createdAt")));

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}