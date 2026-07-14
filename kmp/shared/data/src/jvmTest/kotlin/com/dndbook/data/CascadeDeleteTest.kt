package com.dndbook.data

import app.cash.sqldelight.driver.jdbc.sqlite.JdbcSqliteDriver
import com.dndbook.data.blob.BlobFileStore
import com.dndbook.data.repo.BlobRepositoryImpl
import com.dndbook.db.DndBookDatabase
import kotlinx.coroutines.runBlocking
import kotlin.io.path.createTempDirectory
import kotlin.test.BeforeTest
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNull

class CascadeDeleteTest {

    private lateinit var db: DndBookDatabase

    @BeforeTest
    fun setUp() {
        val driver = JdbcSqliteDriver(JdbcSqliteDriver.IN_MEMORY)
        DndBookDatabase.Schema.create(driver)
        driver.execute(null, "PRAGMA foreign_keys = ON", 0)
        db = DndBookDatabase(driver)
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Insert helpers
    // ─────────────────────────────────────────────────────────────────────────

    private fun insertContinuity(id: String = "cont1") {
        db.continuitiesQueries.insertContinuity(
            id = id, name = "Test Continuity", description = "",
            hlc = "0.0.node", created = "2024-01-01", updated = "2024-01-01",
        )
    }

    private fun insertCampaign(id: String = "camp1", continuityId: String = "cont1") {
        db.campaignsQueries.insertCampaign(
            id = id, name = "Test Campaign", continuity_id = continuityId,
            hlc = "0.0.node", created = "2024-01-01", updated = "2024-01-01",
        )
    }

    private fun insertNpc(id: String = "npc1", continuityId: String = "cont1") {
        db.npcsQueries.insertNpc(
            id = id, name = "Test NPC", race = "", role = "", background = "",
            status = "complete", image_hash = null, scope = "campaign",
            continuity_id = continuityId, origin_id = null, origin_continuity_id = null,
            forked_at = null, hlc = "0.0.node", created = "2024-01-01", updated = "2024-01-01",
        )
    }

    private fun insertLocation(
        id: String = "loc1",
        continuityId: String = "cont1",
        parentId: String? = null,
    ) {
        db.locationsQueries.insertLocation(
            id = id, name = "Test Location", type = "locale", description = "",
            status = "complete", parent_id = parentId, map_hash = null, scope = "campaign",
            continuity_id = continuityId, origin_id = null, origin_continuity_id = null,
            forked_at = null, hlc = "0.0.node", created = "2024-01-01", updated = "2024-01-01",
        )
    }

    private fun insertItem(id: String = "item1", continuityId: String = "cont1") {
        db.itemsQueries.insertItem(
            id = id, name = "Test Item", description = "", value_ = "", status = "complete",
            scope = "campaign", continuity_id = continuityId, owner_id = null,
            owner_type = null, location_id = null, hlc = "0.0.node",
            created = "2024-01-01", updated = "2024-01-01",
        )
    }

    private fun insertTag(
        id: String = "tag1",
        continuityId: String = "cont1",
        campaignId: String? = null,
    ) {
        db.tagsQueries.insertTag(
            id = id, name = "Test Tag", color = "#FF0000", scope = "campaign",
            continuity_id = continuityId, campaign_id = campaignId, origin_id = null,
            origin_continuity_id = null, forked_at = null, hlc = "0.0.node",
            created = "2024-01-01", updated = "2024-01-01",
        )
    }

    private fun insertSession(id: String = "sess1", campaignId: String = "camp1") {
        db.session_logsQueries.insertSessionLog(
            id = id, title = "Session 1", date = "2024-01-01", content = "",
            mentions_json = "[]", summary = "", key_decisions = "", outcomes = "",
            campaign_id = campaignId, hlc = "0.0.node", created = "2024-01-01", updated = "2024-01-01",
        )
    }

    private fun insertNote(id: String = "note1", continuityId: String = "cont1") {
        db.notesQueries.insertNote(
            id = id, title = "Test Note", content = "", scope = "campaign",
            continuity_id = continuityId, campaign_id = null, origin_id = null,
            origin_continuity_id = null, forked_at = null, hlc = "0.0.node",
            created = "2024-01-01", updated = "2024-01-01",
        )
    }

    private fun insertPlayerCharacter(id: String = "pc1") {
        db.player_charactersQueries.insertPlayerCharacter(
            id = id, name = "Test PC", player = "", race = "", class_name = "",
            background = "", image_hash = null, hlc = "0.0.node",
            created = "2024-01-01", updated = "2024-01-01",
        )
    }

    // ─────────────────────────────────────────────────────────────────────────
    // NPC cascade tests
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    fun `deleting NPC removes npc_campaigns rows`() {
        insertContinuity()
        insertCampaign()
        insertNpc()
        db.joinsQueries.insertNpcCampaign(npc_id = "npc1", campaign_id = "camp1")

        assertEquals(1, db.joinsQueries.selectCampaignsByNpc("npc1").executeAsList().size)

        db.npcsQueries.deleteNpc("npc1")

        assertEquals(0, db.joinsQueries.selectCampaignsByNpc("npc1").executeAsList().size)
    }

    @Test
    fun `deleting NPC removes npc_locations rows`() {
        insertContinuity()
        insertCampaign()
        insertNpc()
        insertLocation()
        db.joinsQueries.insertNpcLocation(npc_id = "npc1", location_id = "loc1")

        assertEquals(1, db.joinsQueries.selectLocationsByNpc("npc1").executeAsList().size)

        db.npcsQueries.deleteNpc("npc1")

        assertEquals(0, db.joinsQueries.selectLocationsByNpc("npc1").executeAsList().size)
    }

    @Test
    fun `deleting NPC removes npc_notes rows`() {
        insertContinuity()
        insertNpc()
        insertNote()
        db.joinsQueries.insertNpcNote(npc_id = "npc1", note_id = "note1")

        assertEquals(1, db.joinsQueries.selectNotesByNpc("npc1").executeAsList().size)

        db.npcsQueries.deleteNpc("npc1")

        assertEquals(0, db.joinsQueries.selectNotesByNpc("npc1").executeAsList().size)
    }

    @Test
    fun `deleting NPC removes npc_tags rows`() {
        insertContinuity()
        insertNpc()
        insertTag()
        db.joinsQueries.insertNpcTag(npc_id = "npc1", tag_id = "tag1")

        assertEquals(1, db.joinsQueries.selectTagsByNpc("npc1").executeAsList().size)

        db.npcsQueries.deleteNpc("npc1")

        assertEquals(0, db.joinsQueries.selectTagsByNpc("npc1").executeAsList().size)
    }

    @Test
    fun `deleting NPC removes session_npcs rows`() {
        insertContinuity()
        insertCampaign()
        insertNpc()
        insertSession()
        db.joinsQueries.insertSessionNpc(session_id = "sess1", npc_id = "npc1")

        assertEquals(1, db.joinsQueries.selectNpcsBySession("sess1").executeAsList().size)

        db.npcsQueries.deleteNpc("npc1")

        assertEquals(0, db.joinsQueries.selectNpcsBySession("sess1").executeAsList().size)
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Location cascade tests
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    fun `deleting location nulls children parent_id`() {
        insertContinuity()
        insertLocation(id = "loc1")
        insertLocation(id = "loc2", parentId = "loc1")

        // Verify child has parent set
        val childBefore = db.locationsQueries.selectLocationById("loc2").executeAsOne()
        assertEquals("loc1", childBefore.parent_id)

        db.locationsQueries.deleteLocation("loc1")

        // Child should still exist but parent_id should be null
        val childAfter = db.locationsQueries.selectLocationById("loc2").executeAsOneOrNull()
        assertNull(childAfter?.parent_id)
    }

    @Test
    fun `deleting location removes location_campaigns rows`() {
        insertContinuity()
        insertCampaign()
        insertLocation()
        db.joinsQueries.insertLocationCampaign(location_id = "loc1", campaign_id = "camp1")

        assertEquals(1, db.joinsQueries.selectCampaignsByLocation("loc1").executeAsList().size)

        db.locationsQueries.deleteLocation("loc1")

        assertEquals(0, db.joinsQueries.selectCampaignsByLocation("loc1").executeAsList().size)
    }

    @Test
    fun `deleting location removes location_tags rows`() {
        insertContinuity()
        insertLocation()
        insertTag()
        db.joinsQueries.insertLocationTag(location_id = "loc1", tag_id = "tag1")

        assertEquals(1, db.joinsQueries.selectTagsByLocation("loc1").executeAsList().size)

        db.locationsQueries.deleteLocation("loc1")

        assertEquals(0, db.joinsQueries.selectTagsByLocation("loc1").executeAsList().size)
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Campaign cascade tests
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    fun `deleting campaign removes session_logs`() {
        insertContinuity()
        insertCampaign()
        insertSession()

        assertEquals(1, db.session_logsQueries.selectSessionLogsByCampaign("camp1").executeAsList().size)

        db.campaignsQueries.deleteCampaign("camp1")

        assertEquals(0, db.session_logsQueries.selectSessionLogsByCampaign("camp1").executeAsList().size)
    }

    @Test
    fun `deleting campaign removes npc_campaigns join rows`() {
        insertContinuity()
        insertCampaign()
        insertNpc()
        db.joinsQueries.insertNpcCampaign(npc_id = "npc1", campaign_id = "camp1")

        assertEquals(1, db.joinsQueries.selectNpcsByCampaign("camp1").executeAsList().size)

        db.campaignsQueries.deleteCampaign("camp1")

        assertEquals(0, db.joinsQueries.selectNpcsByCampaign("camp1").executeAsList().size)
        // NPC should still exist
        val npc = db.npcsQueries.selectNpcById("npc1").executeAsOneOrNull()
        assertEquals("npc1", npc?.id)
    }

    @Test
    fun `deleting campaign removes item_campaigns join rows`() {
        insertContinuity()
        insertCampaign()
        insertItem()
        db.joinsQueries.insertItemCampaign(item_id = "item1", campaign_id = "camp1")

        assertEquals(1, db.joinsQueries.selectItemsByCampaign("camp1").executeAsList().size)

        db.campaignsQueries.deleteCampaign("camp1")

        assertEquals(0, db.joinsQueries.selectItemsByCampaign("camp1").executeAsList().size)
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Tag cascade tests
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    fun `deleting tag removes npc_tags rows`() {
        insertContinuity()
        insertNpc()
        insertTag()
        db.joinsQueries.insertNpcTag(npc_id = "npc1", tag_id = "tag1")

        assertEquals(1, db.joinsQueries.selectTagsByNpc("npc1").executeAsList().size)

        db.tagsQueries.deleteTag("tag1")

        assertEquals(0, db.joinsQueries.selectTagsByNpc("npc1").executeAsList().size)
    }

    @Test
    fun `deleting tag removes item_tags rows`() {
        insertContinuity()
        insertItem()
        insertTag()
        db.joinsQueries.insertItemTag(item_id = "item1", tag_id = "tag1")

        assertEquals(1, db.joinsQueries.selectTagsByItem("item1").executeAsList().size)

        db.tagsQueries.deleteTag("tag1")

        assertEquals(0, db.joinsQueries.selectTagsByItem("item1").executeAsList().size)
    }

    @Test
    fun `deleting tag removes location_tags rows`() {
        insertContinuity()
        insertLocation()
        insertTag()
        db.joinsQueries.insertLocationTag(location_id = "loc1", tag_id = "tag1")

        assertEquals(1, db.joinsQueries.selectTagsByLocation("loc1").executeAsList().size)

        db.tagsQueries.deleteTag("tag1")

        assertEquals(0, db.joinsQueries.selectTagsByLocation("loc1").executeAsList().size)
    }

    @Test
    fun `deleting tag removes session_tags rows`() {
        insertContinuity()
        insertCampaign()
        insertSession()
        insertTag()
        db.joinsQueries.insertSessionTag(session_id = "sess1", tag_id = "tag1")

        assertEquals(1, db.joinsQueries.selectTagsBySession("sess1").executeAsList().size)

        db.tagsQueries.deleteTag("tag1")

        assertEquals(0, db.joinsQueries.selectTagsBySession("sess1").executeAsList().size)
    }

    @Test
    fun `deleting tag removes note_tags rows`() {
        insertContinuity()
        insertNote()
        insertTag()
        db.joinsQueries.insertNoteTag(note_id = "note1", tag_id = "tag1")

        assertEquals(1, db.joinsQueries.selectTagsByNote("note1").executeAsList().size)

        db.tagsQueries.deleteTag("tag1")

        assertEquals(0, db.joinsQueries.selectTagsByNote("note1").executeAsList().size)
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Blob GC test
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    fun `blob GC deletes only unreferenced blobs`() = runBlocking {
        // Insert two blobs
        db.blobsQueries.insertBlob(
            hash = "hash_referenced", extension = "png", size = 100L, created = "2024-01-01",
        )
        db.blobsQueries.insertBlob(
            hash = "hash_orphan", extension = "jpg", size = 200L, created = "2024-01-01",
        )

        // Reference one blob via an NPC image_hash
        insertContinuity()
        db.npcsQueries.insertNpc(
            id = "npc_with_image", name = "NPC With Image", race = "", role = "", background = "",
            status = "complete", image_hash = "hash_referenced", scope = "campaign",
            continuity_id = "cont1", origin_id = null, origin_continuity_id = null,
            forked_at = null, hlc = "0.0.node", created = "2024-01-01", updated = "2024-01-01",
        )

        assertEquals(2, db.blobsQueries.selectAllHashes().executeAsList().size)

        // GC should delete only the orphan blob
        val tempDir = createTempDirectory("blob-gc-test").toString()
        val blobRepo = BlobRepositoryImpl(db, BlobFileStore(tempDir))
        val deleted = blobRepo.runGc()

        val allAfter = db.blobsQueries.selectAllHashes().executeAsList()
        assertEquals(1, deleted)
        assertEquals(1, allAfter.size)
        assertEquals("hash_referenced", allAfter[0])
    }

    @Test
    fun `blob GC keeps blobs referenced by location maps and gallery images`() = runBlocking {
        db.blobsQueries.insertBlob(
            hash = "hash_map", extension = "png", size = 10L, created = "2024-01-01",
        )
        db.blobsQueries.insertBlob(
            hash = "hash_gallery", extension = "png", size = 10L, created = "2024-01-01",
        )
        db.blobsQueries.insertBlob(
            hash = "hash_orphan", extension = "png", size = 10L, created = "2024-01-01",
        )

        insertContinuity()
        db.locationsQueries.insertLocation(
            id = "loc_map", name = "Mapped", type = "Locale", description = "",
            status = "complete", parent_id = null, map_hash = "hash_map", scope = "campaign",
            continuity_id = "cont1", origin_id = null, origin_continuity_id = null,
            forked_at = null, hlc = "0.0.node", created = "2024-01-01", updated = "2024-01-01",
        )
        db.joinsQueries.insertLocationImage(
            id = "img1", location_id = "loc_map", blob_hash = "hash_gallery", sort_order = 0,
        )

        val tempDir = createTempDirectory("blob-gc-test2").toString()
        val blobRepo = BlobRepositoryImpl(db, BlobFileStore(tempDir))
        val deleted = blobRepo.runGc()

        assertEquals(1, deleted)
        val remaining = db.blobsQueries.selectAllHashes().executeAsList().toSet()
        assertEquals(setOf("hash_map", "hash_gallery"), remaining)
    }
}
