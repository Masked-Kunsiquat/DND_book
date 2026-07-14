package com.dndbook.domain.mention

import com.dndbook.domain.model.MentionToken

/**
 * Parses mention tokens of the form `{trigger}[Label](entityId)` stored verbatim
 * in content strings (parity with the Expo app; conversion plan §6.3).
 *
 * Rendering (AnnotatedString styling) lives in :shared:ui; this object only
 * handles extraction, which the data layer needs to populate join tables and
 * the session_logs.mentions_json cache.
 */
object MentionParser {

    private val TOKEN_REGEX = Regex("""\{([^}]+)}\[([^\]]*?)]\(([^)]*?)\)""")

    /**
     * Extract all mention tokens from [content], in document order.
     * `position` is the character offset of the opening `{`.
     */
    fun extract(content: String): List<MentionToken> =
        TOKEN_REGEX.findAll(content).map { match ->
            MentionToken(
                trigger = match.groupValues[1],
                label = match.groupValues[2],
                entityId = match.groupValues[3],
                position = match.range.first,
            )
        }.toList()
}
