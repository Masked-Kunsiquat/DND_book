package com.dndbook.data

import app.cash.sqldelight.driver.jdbc.sqlite.JdbcSqliteDriver
import com.dndbook.data.repo.CampaignRepositoryImpl
import com.dndbook.data.repo.ContinuityRepositoryImpl
import com.dndbook.data.repo.ItemRepositoryImpl
import com.dndbook.data.repo.LocationRepositoryImpl
import com.dndbook.data.repo.NoteRepositoryImpl
import com.dndbook.data.repo.NpcRepositoryImpl
import com.dndbook.data.repo.PcTemplateRepositoryImpl
import com.dndbook.data.repo.PlayerCharacterRepositoryImpl
import com.dndbook.data.repo.SessionLogRepositoryImpl
import com.dndbook.data.repo.TagRepositoryImpl
import com.dndbook.db.DndBookDatabase
import com.dndbook.domain.model.Campaign
import com.dndbook.domain.model.Continuity
import com.dndbook.domain.model.EntityStatus
import com.dndbook.domain.model.Item
import com.dndbook.domain.model.Location
import com.dndbook.domain.model.LocationType
import com.dndbook.domain.model.Note
import com.dndbook.domain.model.Npc
import com.dndbook.domain.model.PcTemplate
import com.dndbook.domain.model.PlayerCharacter
import com.dndbook.domain.model.Scope
import com.dndbook.domain.model.SessionLog
import com.dndbook.domain.util.Ulid
import kotlinx.coroutines.runBlocking
import kotlin.test.BeforeTest
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNull
import kotlin.test.assertTrue
import com.dndbook.domain.model.Tag as DomainTag

/**
 * Round-trip CRUD tests for every repository implementation:
 * upsert -> getById -> update (upsert) -> delete, with enum/nullable mapping checks.
 */
class RepositoryCrudTest {

    private lateinit var db: DndBookDatabase

    private companion object {
        const val TS = "2024-01-01T00:00:00.000Z"
        const val HLC = "1.0.test-node"
    }

    @BeforeTest
    fun setUp() {
        val driver = JdbcSqliteDriver(JdbcSqliteDriver.IN_MEMORY)
        DndBookDatabase.Schema.create(driver)
        driver.execute(null, "PRAGMA foreign_keys = ON", 0)
        db = DndBookDatabase(driver)
        // Base rows for FK targets
        db.continuitiesQueries.insertContinuity("cont1", "Base", "", HLC, TS, TS)
        db.campaignsQueries.insertCampaign("camp1", "Base Campaign", "cont1", HLC, TS, TS)
    }

    @Test
    fun `continuity crud round-trip`() = runBlocking {
        val repo = ContinuityRepositoryImpl(db)
        val entity = Continuity("c-new", "Universe", "desc", HLC, TS, TS)
        repo.upsert(entity)
        assertEquals(entity, repo.getById("c-new"))

        repo.upsert(entity.copy(name = "Renamed"))
        assertEquals("Renamed", repo.getById("c-new")?.name)

        repo.delete("c-new")
        assertNull(repo.getById("c-new"))
    }

    @Test
    fun `campaign crud round-trip`() = runBlocking {
        val repo = CampaignRepositoryImpl(db)
        val entity = Campaign("camp-new", "Adventure", "cont1", HLC, TS, TS)
        repo.upsert(entity)
        assertEquals(entity, repo.getById("camp-new"))

        repo.upsert(entity.copy(name = "Renamed"))
        assertEquals("Renamed", repo.getById("camp-new")?.name)

        repo.delete("camp-new")
        assertNull(repo.getById("camp-new"))
    }

    @Test
    fun `note crud round-trip with nullable fields`() = runBlocking {
        val repo = NoteRepositoryImpl(db)
        val entity = Note(
            id = "note-new", title = "Title", content = "Body {@}[X](npc-x)",
            scope = Scope.CAMPAIGN, continuityId = "cont1", campaignId = "camp1",
            originId = "orig-1", originContinuityId = "orig-cont-1", forkedAt = TS,
            hlc = HLC, created = TS, updated = TS,
        )
        repo.upsert(entity)
        assertEquals(entity, repo.getById("note-new"))

        repo.upsert(entity.copy(campaignId = null, scope = Scope.CONTINUITY))
        val updated = repo.getById("note-new")
        assertNull(updated?.campaignId)
        assertEquals(Scope.CONTINUITY, updated?.scope)

        repo.delete("note-new")
        assertNull(repo.getById("note-new"))
    }

    @Test
    fun `npc crud round-trip with enums and provenance`() = runBlocking {
        val repo = NpcRepositoryImpl(db)
        val entity = Npc(
            id = "npc-new", name = "Hero", race = "Human", role = "King",
            background = "bg", status = EntityStatus.SHADOW, imageHash = "abc123",
            scope = Scope.CONTINUITY, continuityId = "cont1",
            originId = null, originContinuityId = null, forkedAt = null,
            hlc = HLC, created = TS, updated = TS,
        )
        repo.upsert(entity)
        assertEquals(entity, repo.getById("npc-new"))

        repo.upsert(entity.copy(status = EntityStatus.COMPLETE))
        assertEquals(EntityStatus.COMPLETE, repo.getById("npc-new")?.status)

        repo.delete("npc-new")
        assertNull(repo.getById("npc-new"))
    }

    @Test
    fun `location crud round-trip with type and parent`() = runBlocking {
        val repo = LocationRepositoryImpl(db)
        val parent = Location(
            id = "loc-parent", name = "Realm", type = LocationType.PLANE, description = "",
            status = EntityStatus.COMPLETE, parentId = null, mapHash = null,
            scope = Scope.CONTINUITY, continuityId = "cont1",
            originId = null, originContinuityId = null, forkedAt = null,
            hlc = HLC, created = TS, updated = TS,
        )
        val child = parent.copy(id = "loc-child", name = "Child", type = LocationType.REALM, parentId = "loc-parent")
        repo.upsert(parent)
        repo.upsert(child)

        assertEquals(parent, repo.getById("loc-parent"))
        assertEquals(child, repo.getById("loc-child"))
        assertEquals(LocationType.REALM, repo.getById("loc-child")?.type)

        repo.delete("loc-child")
        assertNull(repo.getById("loc-child"))
    }

    @Test
    fun `item crud round-trip with owner fields`() = runBlocking {
        val repo = ItemRepositoryImpl(db)
        val entity = Item(
            id = "item-new", name = "Sword", description = "sharp", value = "100gp",
            status = EntityStatus.COMPLETE, scope = Scope.CAMPAIGN, continuityId = "cont1",
            ownerId = "npc-owner", ownerType = "npc", locationId = null,
            hlc = HLC, created = TS, updated = TS,
        )
        repo.upsert(entity)
        assertEquals(entity, repo.getById("item-new"))
        assertEquals("npc", repo.getById("item-new")?.ownerType)

        repo.upsert(entity.copy(ownerId = null, ownerType = null))
        assertNull(repo.getById("item-new")?.ownerId)

        repo.delete("item-new")
        assertNull(repo.getById("item-new"))
    }

    @Test
    fun `tag crud round-trip`() = runBlocking {
        val repo = TagRepositoryImpl(db)
        val entity = DomainTag(
            id = "tag-new", name = "Villain", color = "#ff0000",
            scope = Scope.CAMPAIGN, continuityId = "cont1", campaignId = "camp1",
            originId = null, originContinuityId = null, forkedAt = null,
            hlc = HLC, created = TS, updated = TS,
        )
        repo.upsert(entity)
        assertEquals(entity, repo.getById("tag-new"))

        repo.upsert(entity.copy(color = "#00ff00"))
        assertEquals("#00ff00", repo.getById("tag-new")?.color)

        repo.delete("tag-new")
        assertNull(repo.getById("tag-new"))
    }

    @Test
    fun `session log crud round-trip`() = runBlocking {
        val repo = SessionLogRepositoryImpl(db)
        val entity = SessionLog(
            id = "sess-new", title = "Session 1", date = "2024-02-01",
            content = "We fought {@}[Dragon](npc-dragon)", mentionsJson = "[]",
            summary = "sum", keyDecisions = "kd", outcomes = "out",
            campaignId = "camp1", hlc = HLC, created = TS, updated = TS,
        )
        repo.upsert(entity)
        assertEquals(entity, repo.getById("sess-new"))

        repo.upsert(entity.copy(summary = "updated"))
        assertEquals("updated", repo.getById("sess-new")?.summary)

        repo.delete("sess-new")
        assertNull(repo.getById("sess-new"))
    }

    @Test
    fun `player character crud round-trip`() = runBlocking {
        val repo = PlayerCharacterRepositoryImpl(db)
        val entity = PlayerCharacter(
            id = "pc-new", name = "Fighter", player = "Alice", race = "Dwarf",
            className = "Barbarian", background = "Outlander", imageHash = null,
            hlc = HLC, created = TS, updated = TS,
        )
        repo.upsert(entity)
        assertEquals(entity, repo.getById("pc-new"))

        repo.upsert(entity.copy(className = "Paladin"))
        assertEquals("Paladin", repo.getById("pc-new")?.className)

        repo.delete("pc-new")
        assertNull(repo.getById("pc-new"))
    }

    @Test
    fun `pc template crud round-trip`() = runBlocking {
        val repo = PcTemplateRepositoryImpl(db)
        val entity = PcTemplate(
            id = "tpl-new", name = "Template", player = "Bob", race = "Elf",
            className = "Wizard", background = "Sage", imageHash = null,
            continuityId = "cont1", originId = null, originContinuityId = null,
            forkedAt = null, hlc = HLC, created = TS, updated = TS,
        )
        repo.upsert(entity)
        assertEquals(entity, repo.getById("tpl-new"))

        repo.upsert(entity.copy(race = "Half-Elf"))
        assertEquals("Half-Elf", repo.getById("tpl-new")?.race)

        repo.delete("tpl-new")
        assertNull(repo.getById("tpl-new"))
    }

    @Test
    fun `npc link and unlink round-trip`() = runBlocking {
        val repo = NpcRepositoryImpl(db)
        val entity = Npc(
            id = "npc-link", name = "Linked", race = "", role = "", background = "",
            status = EntityStatus.COMPLETE, imageHash = null, scope = Scope.CAMPAIGN,
            continuityId = "cont1", originId = null, originContinuityId = null,
            forkedAt = null, hlc = HLC, created = TS, updated = TS,
        )
        repo.upsert(entity)
        repo.linkToCampaign("npc-link", "camp1")
        assertEquals(1, db.joinsQueries.selectCampaignsByNpc("npc-link").executeAsList().size)

        repo.unlinkFromCampaign("npc-link", "camp1")
        assertEquals(0, db.joinsQueries.selectCampaignsByNpc("npc-link").executeAsList().size)
    }

    @Test
    fun `ulid generation is 26 chars sortable and unique`() {
        val ids = List(1000) { Ulid.generate() }
        assertTrue(ids.all { it.length == 26 })
        assertTrue(ids.all { id -> id.all { it in "0123456789ABCDEFGHJKMNPQRSTVWXYZ" } })
        assertEquals(1000, ids.toSet().size, "ULIDs must be unique")
    }
}
