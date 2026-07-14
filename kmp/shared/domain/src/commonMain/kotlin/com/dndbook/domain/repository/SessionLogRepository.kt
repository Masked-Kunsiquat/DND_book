package com.dndbook.domain.repository

import com.dndbook.domain.model.SessionLog
import kotlinx.coroutines.flow.Flow

interface SessionLogRepository {
    fun observeAll(): Flow<List<SessionLog>>
    fun observeByCampaign(campaignId: String): Flow<List<SessionLog>>
    suspend fun getById(id: String): SessionLog?
    suspend fun upsert(entity: SessionLog)
    suspend fun delete(id: String)
    suspend fun linkToNpc(sessionId: String, npcId: String)
    suspend fun unlinkFromNpc(sessionId: String, npcId: String)
    suspend fun linkToLocation(sessionId: String, locationId: String)
    suspend fun unlinkFromLocation(sessionId: String, locationId: String)
    suspend fun linkToTag(sessionId: String, tagId: String)
    suspend fun unlinkFromTag(sessionId: String, tagId: String)
}
