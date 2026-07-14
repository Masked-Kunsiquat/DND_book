package com.dndbook.domain.repository

import com.dndbook.domain.model.Campaign
import kotlinx.coroutines.flow.Flow

interface CampaignRepository {
    fun observeAll(): Flow<List<Campaign>>
    fun observeByContinuity(continuityId: String): Flow<List<Campaign>>
    suspend fun getById(id: String): Campaign?
    suspend fun upsert(entity: Campaign)
    suspend fun delete(id: String)
}
