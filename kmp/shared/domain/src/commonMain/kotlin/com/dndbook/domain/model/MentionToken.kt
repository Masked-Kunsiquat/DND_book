package com.dndbook.domain.model

import kotlinx.serialization.Serializable

/**
 * A single parsed mention token extracted from rich text.
 *
 * @param trigger   The trigger character: '@' (NPC), '$' (location), '!' (item), '#' (tag).
 * @param label     The display label of the mention.
 * @param entityId  The ID of the referenced entity.
 * @param position  Character offset of the trigger in the source text.
 */
@Serializable
data class MentionToken(
    val trigger: String,
    val label: String,
    val entityId: String,
    val position: Int,
)
