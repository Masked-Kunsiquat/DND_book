package com.dndbook.domain.model

import kotlinx.serialization.Serializable

/**
 * Continuity — a campaign universe that can contain many campaigns.
 * Entities scoped to a continuity are shared across all campaigns within it
 * (the "library" concept).
 */
@Serializable
data class Continuity(
    val id: String,
    val name: String,
    val description: String = "",
    val hlc: String,
    val created: String,
    val updated: String,
)

/**
 * Campaign — a single game campaign, always belonging to one Continuity.
 * This is the primary context for all session-level data (session logs,
 * campaign-scoped NPCs, etc.).
 *
 * IDs are ULIDs (sortable, collision-resistant) stored as TEXT strings.
 * All timestamps are ISO-8601 strings for parity with the Expo data format.
 */
@Serializable
data class Campaign(
    val id: String,
    val name: String,
    val continuityId: String,
    val hlc: String,
    val created: String,
    val updated: String,
)
