package com.dndbook.data

import app.cash.sqldelight.driver.jdbc.sqlite.JdbcSqliteDriver
import com.dndbook.data.seed.OdysseySeedIds
import com.dndbook.data.seed.SeedDataLoader
import com.dndbook.db.DndBookDatabase
import com.dndbook.domain.mention.MentionParser
import kotlinx.coroutines.runBlocking
import kotlin.test.BeforeTest
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class SeedDataLoaderTest {

    private lateinit var db: DndBookDatabase
    private lateinit var loader: SeedDataLoader

    @BeforeTest
    fun setUp() {
        val driver = JdbcSqliteDriver(JdbcSqliteDriver.IN_MEMORY)
        DndBookDatabase.Schema.create(driver)
        driver.execute(null, "PRAGMA foreign_keys = ON", 0)
        db = DndBookDatabase(driver)
        loader = SeedDataLoader(db)
    }

    @Test
    fun `seed inserts all Odyssey entities`() = runBlocking {
        loader.seed()

        assertTrue(loader.isSeeded())
        assertEquals(1, db.continuitiesQueries.selectAllContinuities().executeAsList().size)
        assertEquals(1, db.campaignsQueries.selectAllCampaigns().executeAsList().size)
        assertEquals(10, db.tagsQueries.selectAllTags().executeAsList().size)
        assertEquals(12, db.locationsQueries.selectAllLocations().executeAsList().size)
        assertEquals(10, db.npcsQueries.selectAllNpcs().executeAsList().size)
        assertEquals(3, db.itemsQueries.selectAllItems().executeAsList().size)
        assertEquals(1, db.session_logsQueries.selectAllSessionLogs().executeAsList().size)
    }

    @Test
    fun `seed is idempotent`() = runBlocking {
        loader.seed()
        loader.seed()
        assertEquals(10, db.npcsQueries.selectAllNpcs().executeAsList().size)
        assertEquals(12, db.locationsQueries.selectAllLocations().executeAsList().size)
    }

    @Test
    fun `seed session content contains parseable mentions`() = runBlocking {
        loader.seed()
        val session = db.session_logsQueries
            .selectSessionLogById(OdysseySeedIds.SESSION_CYCLOPS_ENCOUNTER)
            .executeAsOne()
        val mentions = MentionParser.extract(session.content)
        assertTrue(mentions.isNotEmpty(), "seed session should contain mention tokens")
        val mentionedIds = mentions.map { it.entityId }.toSet()
        assertEquals(
            setOf(OdysseySeedIds.NPC_ODYSSEUS, OdysseySeedIds.NPC_POLYPHEMUS, OdysseySeedIds.NPC_POSEIDON),
            mentionedIds,
        )
    }

    @Test
    fun `seed links session to npcs locations and tags`() = runBlocking {
        loader.seed()
        val sessionId = OdysseySeedIds.SESSION_CYCLOPS_ENCOUNTER
        assertEquals(3, db.joinsQueries.selectNpcsBySession(sessionId).executeAsList().size)
        assertEquals(1, db.joinsQueries.selectLocationsBySession(sessionId).executeAsList().size)
        assertEquals(3, db.joinsQueries.selectTagsBySession(sessionId).executeAsList().size)
    }

    @Test
    fun `clear removes every seeded row via cascades`() = runBlocking {
        loader.seed()
        loader.clear()

        assertFalse(loader.isSeeded())
        assertEquals(0, db.campaignsQueries.selectAllCampaigns().executeAsList().size)
        assertEquals(0, db.tagsQueries.selectAllTags().executeAsList().size)
        assertEquals(0, db.locationsQueries.selectAllLocations().executeAsList().size)
        assertEquals(0, db.npcsQueries.selectAllNpcs().executeAsList().size)
        assertEquals(0, db.itemsQueries.selectAllItems().executeAsList().size)
        assertEquals(0, db.session_logsQueries.selectAllSessionLogs().executeAsList().size)
        // Join tables must be empty too
        assertEquals(0, db.joinsQueries.selectNpcsByCampaign(OdysseySeedIds.CAMPAIGN).executeAsList().size)
        assertEquals(0, db.joinsQueries.selectNpcsBySession(OdysseySeedIds.SESSION_CYCLOPS_ENCOUNTER).executeAsList().size)
        assertEquals(0, db.joinsQueries.selectTagsByNpc(OdysseySeedIds.NPC_ODYSSEUS).executeAsList().size)
    }
}
