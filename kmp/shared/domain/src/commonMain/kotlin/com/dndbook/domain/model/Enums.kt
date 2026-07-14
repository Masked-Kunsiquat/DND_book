package com.dndbook.domain.model

import kotlinx.serialization.Serializable

/**
 * Scope determines whether an entity belongs to a single campaign or is shared
 * across all campaigns in a continuity (the "library").
 *
 * Stored as TEXT in SQLite: "campaign" | "continuity"
 */
@Serializable
enum class Scope {
    CAMPAIGN,
    CONTINUITY;

    fun toDbString(): String = name.lowercase()

    companion object {
        fun fromDbString(value: String): Scope =
            entries.firstOrNull { it.name.equals(value, ignoreCase = true) }
                ?: CAMPAIGN
    }
}

/**
 * EntityStatus distinguishes fully-populated entities from auto-created placeholder
 * (shadow) entities that were created by the mention parser when the user typed a
 * mention referencing an unknown entity.
 *
 * Stored as TEXT in SQLite: "complete" | "shadow"
 */
@Serializable
enum class EntityStatus {
    COMPLETE,
    SHADOW;

    fun toDbString(): String = name.lowercase()

    companion object {
        fun fromDbString(value: String): EntityStatus =
            entries.firstOrNull { it.name.equals(value, ignoreCase = true) }
                ?: COMPLETE
    }
}
