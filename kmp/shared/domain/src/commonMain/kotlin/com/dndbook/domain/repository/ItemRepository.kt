package com.dndbook.domain.repository

import com.dndbook.domain.model.Item
import kotlinx.coroutines.flow.Flow

interface ItemRepository {
    fun observeAll(): Flow<List<Item>>
    fun observeByContinuity(continuityId: String): Flow<List<Item>>
    suspend fun getById(id: String): Item?
    suspend fun upsert(entity: Item)
    suspend fun delete(id: String)
    suspend fun linkToCampaign(itemId: String, campaignId: String)
    suspend fun unlinkFromCampaign(itemId: String, campaignId: String)
    suspend fun linkToTag(itemId: String, tagId: String)
    suspend fun unlinkFromTag(itemId: String, tagId: String)
}
