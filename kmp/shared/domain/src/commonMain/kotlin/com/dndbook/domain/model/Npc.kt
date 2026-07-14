package com.dndbook.domain.model

import kotlinx.serialization.Serializable

@Serializable
data class Npc(
    val id: String,
    val name: String,
    val race: String,
    val role: String,
    val background: String,
    val status: EntityStatus,
    val imageHash: String?,
    val scope: Scope,
    val continuityId: String,
    val originId: String?,
    val originContinuityId: String?,
    val forkedAt: String?,
    val hlc: String,
    val created: String,
    val updated: String,
)
