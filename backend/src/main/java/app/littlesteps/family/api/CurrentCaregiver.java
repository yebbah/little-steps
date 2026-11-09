package app.littlesteps.family.api;

import java.util.UUID;

/**
 * The Caregiver a request runs as, and the Family of their active membership. The Family comes only
 * from that membership, never from a request value (AD-2).
 */
public record CurrentCaregiver(UUID caregiverId, String sub, UUID familyId) {
}
