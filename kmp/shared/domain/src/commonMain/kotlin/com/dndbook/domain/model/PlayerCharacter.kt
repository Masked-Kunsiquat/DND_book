package com.dndbook.domain.model

import kotlinx.serialization.Serializable

@Serializable
data class PlayerCharacter(
    val id: String,
    val name: String,
    val player: String,
    val race: String,
    val className: String,
    val background: String,
    val imageHash: String?,
    val hlc: String,
    val created: String,
    val updated: String,
)
