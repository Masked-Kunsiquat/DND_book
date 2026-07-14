package com.dndbook.data

import com.dndbook.domain.mention.MentionParser
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class MentionParserTest {

    @Test
    fun `extracts single npc mention`() {
        val tokens = MentionParser.extract("Met {@}[Odysseus](npc-odysseus) at the docks.")
        assertEquals(1, tokens.size)
        assertEquals("@", tokens[0].trigger)
        assertEquals("Odysseus", tokens[0].label)
        assertEquals("npc-odysseus", tokens[0].entityId)
        assertEquals(4, tokens[0].position)
    }

    @Test
    fun `extracts multiple mentions with mixed triggers in document order`() {
        val content = "{@}[Circe](npc-circe) lives on {\$}[Aeaea](loc-aeaea) with {!}[Moly](item-moly) {#}[Magic](tag-magic)"
        val tokens = MentionParser.extract(content)
        assertEquals(4, tokens.size)
        assertEquals(listOf("@", "$", "!", "#"), tokens.map { it.trigger })
        assertEquals(listOf("npc-circe", "loc-aeaea", "item-moly", "tag-magic"), tokens.map { it.entityId })
        assertTrue(tokens.zipWithNext().all { (a, b) -> a.position < b.position })
    }

    @Test
    fun `returns empty list for content without mentions`() {
        assertTrue(MentionParser.extract("Plain text with [brackets] and (parens) but no tokens").isEmpty())
    }

    @Test
    fun `handles empty label and empty id`() {
        val tokens = MentionParser.extract("{@}[]()")
        assertEquals(1, tokens.size)
        assertEquals("", tokens[0].label)
        assertEquals("", tokens[0].entityId)
    }

    @Test
    fun `extracts repeated mentions of the same entity`() {
        val mention = "{@}[Polyphemus](npc-polyphemus)"
        val tokens = MentionParser.extract("$mention shouted. Then $mention slept.")
        assertEquals(2, tokens.size)
        assertEquals(tokens[0].entityId, tokens[1].entityId)
    }

    @Test
    fun `labels may contain spaces and punctuation`() {
        val tokens = MentionParser.extract("{\$}[The Wine-Dark Sea](loc-sea)")
        assertEquals("The Wine-Dark Sea", tokens[0].label)
    }
}
