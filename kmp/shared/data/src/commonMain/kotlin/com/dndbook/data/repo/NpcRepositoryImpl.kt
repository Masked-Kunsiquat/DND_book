package com.dndbook.data.repo

import app.cash.sqldelight.coroutines.asFlow
import app.cash.sqldelight.coroutines.mapToList
import com.dndbook.db.DndBookDatabase
import com.dndbook.db.Npcs
import com.dndbook.domain.model.EntityStatus
import com.dndbook.domain.model.Npc
import com.dndbook.domain.model.Scope
import com.dndbook.domain.repository.NpcRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.withContext

class NpcRepositoryImpl(private val db: DndBookDatabase) : NpcRepository {

    override fun observeAll(): Flow<List<Npc>> =
        db.npcsQueries.selectAllNpcs()
            .asFlow()
            .mapToList(Dispatchers.IO)
            .map { list -> list.map { it.toDomain() } }

    override fun observeByContinuity(continuityId: String): Flow<List<Npc>> =
        db.npcsQueries.selectNpcsByContinuity(continuityId)
            .asFlow()
            .mapToList(Dispatchers.IO)
            .map { list -> list.map { it.toDomain() } }

    override suspend fun getById(id: String): Npc? =
        withContext(Dispatchers.IO) {
            db.npcsQueries.selectNpcById(id).executeAsOneOrNull()?.toDomain()
        }

    override suspend fun upsert(entity: Npc): Unit = withContext(Dispatchers.IO) {
        db.npcsQueries.insertNpc(
            id = entity.id,
            name = entity.name,
            race = entity.race,
            role = entity.role,
            background = entity.background,
            status = entity.status.toDbString(),
            image_hash = entity.imageHash,
            scope = entity.scope.toDbString(),
            continuity_id = entity.continuityId,
            origin_id = entity.originId,
            origin_continuity_id = entity.originContinuityId,
            forked_at = entity.forkedAt,
            hlc = entity.hlc,
            created = entity.created,
            updated = entity.updated,
        )
    }

    override suspend fun delete(id: String): Unit = withContext(Dispatchers.IO) {
        db.npcsQueries.deleteNpc(id)
    }

    override suspend fun linkToCampaign(npcId: String, campaignId: String): Unit = withContext(Dispatchers.IO) {
        db.joinsQueries.insertNpcCampaign(npc_id = npcId, campaign_id = campaignId)
    }

    override suspend fun unlinkFromCampaign(npcId: String, campaignId: String): Unit = withContext(Dispatchers.IO) {
        db.joinsQueries.deleteNpcCampaign(npc_id = npcId, campaign_id = campaignId)
    }

    override suspend fun linkToLocation(npcId: String, locationId: String): Unit = withContext(Dispatchers.IO) {
        db.joinsQueries.insertNpcLocation(npc_id = npcId, location_id = locationId)
    }

    override suspend fun unlinkFromLocation(npcId: String, locationId: String): Unit = withContext(Dispatchers.IO) {
        db.joinsQueries.deleteNpcLocation(npc_id = npcId, location_id = locationId)
    }

    override suspend fun linkToTag(npcId: String, tagId: String): Unit = withContext(Dispatchers.IO) {
        db.joinsQueries.insertNpcTag(npc_id = npcId, tag_id = tagId)
    }

    override suspend fun unlinkFromTag(npcId: String, tagId: String): Unit = withContext(Dispatchers.IO) {
        db.joinsQueries.deleteNpcTag(npc_id = npcId, tag_id = tagId)
    }

    private fun Npcs.toDomain() = Npc(
        id = id,
        name = name,
        race = race,
        role = role,
        background = background,
        status = EntityStatus.fromDbString(status),
        imageHash = image_hash,
        scope = Scope.fromDbString(scope),
        continuityId = continuity_id,
        originId = origin_id,
        originContinuityId = origin_continuity_id,
        forkedAt = forked_at,
        hlc = hlc,
        created = created,
        updated = updated,
    )
}
