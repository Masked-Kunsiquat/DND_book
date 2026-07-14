package com.dndbook.domain.repository

import com.dndbook.domain.model.Npc
import kotlinx.coroutines.flow.Flow

interface NpcRepository {
    fun observeAll(): Flow<List<Npc>>
    fun observeByContinuity(continuityId: String): Flow<List<Npc>>
    suspend fun getById(id: String): Npc?
    suspend fun upsert(entity: Npc)
    suspend fun delete(id: String)
    suspend fun linkToCampaign(npcId: String, campaignId: String)
    suspend fun unlinkFromCampaign(npcId: String, campaignId: String)
    suspend fun linkToLocation(npcId: String, locationId: String)
    suspend fun unlinkFromLocation(npcId: String, locationId: String)
    suspend fun linkToTag(npcId: String, tagId: String)
    suspend fun unlinkFromTag(npcId: String, tagId: String)
}
