package com.dndbook.domain.repository

import com.dndbook.domain.model.PlayerCharacter
import kotlinx.coroutines.flow.Flow

interface PlayerCharacterRepository {
    fun observeAll(): Flow<List<PlayerCharacter>>
    suspend fun getById(id: String): PlayerCharacter?
    suspend fun upsert(entity: PlayerCharacter)
    suspend fun delete(id: String)
    suspend fun linkToCampaign(pcId: String, campaignId: String)
    suspend fun unlinkFromCampaign(pcId: String, campaignId: String)
}
