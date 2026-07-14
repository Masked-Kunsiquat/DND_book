package com.dndbook.domain.repository

import com.dndbook.domain.model.Location
import kotlinx.coroutines.flow.Flow

interface LocationRepository {
    fun observeAll(): Flow<List<Location>>
    fun observeByContinuity(continuityId: String): Flow<List<Location>>
    fun observeByParent(parentId: String): Flow<List<Location>>
    suspend fun getById(id: String): Location?
    suspend fun upsert(entity: Location)
    suspend fun delete(id: String)
    suspend fun linkToCampaign(locationId: String, campaignId: String)
    suspend fun unlinkFromCampaign(locationId: String, campaignId: String)
    suspend fun linkToTag(locationId: String, tagId: String)
    suspend fun unlinkFromTag(locationId: String, tagId: String)
}
