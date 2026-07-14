package com.dndbook.domain.model

import kotlinx.serialization.Serializable

@Serializable
data class SessionLog(
    val id: String,
    val title: String,
    val date: String,
    val content: String,
    val mentionsJson: String,
    val summary: String,
    val keyDecisions: String,
    val outcomes: String,
    val campaignId: String,
    val hlc: String,
    val created: String,
    val updated: String,
)
