package com.dndbook.domain.model

import kotlinx.serialization.Serializable

@Serializable
data class Note(
    val id: String,
    val title: String,
    val content: String,
    val scope: Scope,
    val continuityId: String,
    val campaignId: String?,
    val originId: String?,
    val originContinuityId: String?,
    val forkedAt: String?,
    val hlc: String,
    val created: String,
    val updated: String,
)
