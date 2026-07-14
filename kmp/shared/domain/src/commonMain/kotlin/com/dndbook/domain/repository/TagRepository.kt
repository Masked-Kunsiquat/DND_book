package com.dndbook.domain.repository

import com.dndbook.domain.model.Tag
import kotlinx.coroutines.flow.Flow

interface TagRepository {
    fun observeAll(): Flow<List<Tag>>
    fun observeByContinuity(continuityId: String): Flow<List<Tag>>
    fun observeByCampaign(campaignId: String): Flow<List<Tag>>
    suspend fun getById(id: String): Tag?
    suspend fun upsert(entity: Tag)
    suspend fun delete(id: String)
}
