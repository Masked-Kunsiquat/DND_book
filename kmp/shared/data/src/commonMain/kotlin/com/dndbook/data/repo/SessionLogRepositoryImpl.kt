package com.dndbook.data.repo

import app.cash.sqldelight.coroutines.asFlow
import app.cash.sqldelight.coroutines.mapToList
import com.dndbook.db.DndBookDatabase
import com.dndbook.db.Session_logs
import com.dndbook.domain.model.SessionLog
import com.dndbook.domain.repository.SessionLogRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.withContext

class SessionLogRepositoryImpl(private val db: DndBookDatabase) : SessionLogRepository {

    override fun observeAll(): Flow<List<SessionLog>> =
        db.session_logsQueries.selectAllSessionLogs()
            .asFlow()
            .mapToList(Dispatchers.IO)
            .map { list -> list.map { it.toDomain() } }

    override fun observeByCampaign(campaignId: String): Flow<List<SessionLog>> =
        db.session_logsQueries.selectSessionLogsByCampaign(campaignId)
            .asFlow()
            .mapToList(Dispatchers.IO)
            .map { list -> list.map { it.toDomain() } }

    override suspend fun getById(id: String): SessionLog? =
        withContext(Dispatchers.IO) {
            db.session_logsQueries.selectSessionLogById(id).executeAsOneOrNull()?.toDomain()
        }

    override suspend fun upsert(entity: SessionLog): Unit = withContext(Dispatchers.IO) {
        db.session_logsQueries.insertSessionLog(
            id = entity.id,
            title = entity.title,
            date = entity.date,
            content = entity.content,
            mentions_json = entity.mentionsJson,
            summary = entity.summary,
            key_decisions = entity.keyDecisions,
            outcomes = entity.outcomes,
            campaign_id = entity.campaignId,
            hlc = entity.hlc,
            created = entity.created,
            updated = entity.updated,
        )
    }

    override suspend fun delete(id: String): Unit = withContext(Dispatchers.IO) {
        db.session_logsQueries.deleteSessionLog(id)
    }

    override suspend fun linkToNpc(sessionId: String, npcId: String): Unit = withContext(Dispatchers.IO) {
        db.joinsQueries.insertSessionNpc(session_id = sessionId, npc_id = npcId)
    }

    override suspend fun unlinkFromNpc(sessionId: String, npcId: String): Unit = withContext(Dispatchers.IO) {
        db.joinsQueries.deleteSessionNpc(session_id = sessionId, npc_id = npcId)
    }

    override suspend fun linkToLocation(sessionId: String, locationId: String): Unit = withContext(Dispatchers.IO) {
        db.joinsQueries.insertSessionLocation(session_id = sessionId, location_id = locationId)
    }

    override suspend fun unlinkFromLocation(sessionId: String, locationId: String): Unit = withContext(Dispatchers.IO) {
        db.joinsQueries.deleteSessionLocation(session_id = sessionId, location_id = locationId)
    }

    override suspend fun linkToTag(sessionId: String, tagId: String): Unit = withContext(Dispatchers.IO) {
        db.joinsQueries.insertSessionTag(session_id = sessionId, tag_id = tagId)
    }

    override suspend fun unlinkFromTag(sessionId: String, tagId: String): Unit = withContext(Dispatchers.IO) {
        db.joinsQueries.deleteSessionTag(session_id = sessionId, tag_id = tagId)
    }

    private fun Session_logs.toDomain() = SessionLog(
        id = id,
        title = title,
        date = date,
        content = content,
        mentionsJson = mentions_json,
        summary = summary,
        keyDecisions = key_decisions,
        outcomes = outcomes,
        campaignId = campaign_id,
        hlc = hlc,
        created = created,
        updated = updated,
    )
}
