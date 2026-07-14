package com.dndbook.data.repo

import app.cash.sqldelight.coroutines.asFlow
import app.cash.sqldelight.coroutines.mapToList
import com.dndbook.db.Campaigns
import com.dndbook.db.DndBookDatabase
import com.dndbook.domain.model.Campaign
import com.dndbook.domain.repository.CampaignRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.withContext

class CampaignRepositoryImpl(private val db: DndBookDatabase) : CampaignRepository {

    override fun observeAll(): Flow<List<Campaign>> =
        db.campaignsQueries.selectAllCampaigns()
            .asFlow()
            .mapToList(Dispatchers.IO)
            .map { list -> list.map { it.toDomain() } }

    override fun observeByContinuity(continuityId: String): Flow<List<Campaign>> =
        db.campaignsQueries.selectCampaignsByContinuity(continuityId)
            .asFlow()
            .mapToList(Dispatchers.IO)
            .map { list -> list.map { it.toDomain() } }

    override suspend fun getById(id: String): Campaign? =
        withContext(Dispatchers.IO) {
            db.campaignsQueries.selectCampaignById(id).executeAsOneOrNull()?.toDomain()
        }

    override suspend fun upsert(entity: Campaign): Unit = withContext(Dispatchers.IO) {
        db.campaignsQueries.insertCampaign(
            id = entity.id,
            name = entity.name,
            continuity_id = entity.continuityId,
            hlc = entity.hlc,
            created = entity.created,
            updated = entity.updated,
        )
    }

    override suspend fun delete(id: String): Unit = withContext(Dispatchers.IO) {
        db.campaignsQueries.deleteCampaign(id)
    }

    private fun Campaigns.toDomain() = Campaign(
        id = id,
        name = name,
        continuityId = continuity_id,
        hlc = hlc,
        created = created,
        updated = updated,
    )
}
