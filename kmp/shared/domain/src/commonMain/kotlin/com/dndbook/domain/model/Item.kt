package com.dndbook.domain.model

import kotlinx.serialization.Serializable

@Serializable
data class Item(
    val id: String,
    val name: String,
    val description: String,
    val value: String,
    val status: EntityStatus,
    val scope: Scope,
    val continuityId: String,
    val ownerId: String?,
    val ownerType: String?,
    val locationId: String?,
    val hlc: String,
    val created: String,
    val updated: String,
)
