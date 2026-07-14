package com.dndbook.domain.model

import kotlinx.serialization.Serializable

/**
 * Hierarchical location type from cosmic to local scale.
 */
@Serializable
enum class LocationType {
    PLANE,
    REALM,
    CONTINENT,
    TERRITORY,
    PROVINCE,
    LOCALE,
    LANDMARK;

    /** Stored Title-case for parity with Expo data: 'Plane', 'Realm', … (plan §4). */
    fun toDbString(): String = name.lowercase().replaceFirstChar { it.uppercaseChar() }

    companion object {
        /** Hierarchy order, outermost first (plan §6.4). */
        val HIERARCHY = listOf(PLANE, REALM, CONTINENT, TERRITORY, PROVINCE, LOCALE, LANDMARK)

        fun fromDbString(value: String): LocationType =
            entries.firstOrNull { it.name.equals(value, ignoreCase = true) }
                ?: LOCALE
    }
}

@Serializable
data class Location(
    val id: String,
    val name: String,
    val type: LocationType,
    val description: String,
    val status: EntityStatus,
    val parentId: String?,
    val mapHash: String?,
    val scope: Scope,
    val continuityId: String,
    val originId: String?,
    val originContinuityId: String?,
    val forkedAt: String?,
    val hlc: String,
    val created: String,
    val updated: String,
)
