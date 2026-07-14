package com.dndbook.data.repo

import app.cash.sqldelight.coroutines.asFlow
import app.cash.sqldelight.coroutines.mapToList
import com.dndbook.db.DndBookDatabase
import com.dndbook.db.Locations
import com.dndbook.domain.model.EntityStatus
import com.dndbook.domain.model.Location
import com.dndbook.domain.model.LocationType
import com.dndbook.domain.model.Scope
import com.dndbook.domain.repository.LocationRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.withContext

class LocationRepositoryImpl(private val db: DndBookDatabase) : LocationRepository {

    override fun observeAll(): Flow<List<Location>> =
        db.locationsQueries.selectAllLocations()
            .asFlow()
            .mapToList(Dispatchers.IO)
            .map { list -> list.map { it.toDomain() } }

    override fun observeByContinuity(continuityId: String): Flow<List<Location>> =
        db.locationsQueries.selectLocationsByContinuity(continuityId)
            .asFlow()
            .mapToList(Dispatchers.IO)
            .map { list -> list.map { it.toDomain() } }

    override fun observeByParent(parentId: String): Flow<List<Location>> =
        db.locationsQueries.selectLocationsByParent(parentId)
            .asFlow()
            .mapToList(Dispatchers.IO)
            .map { list -> list.map { it.toDomain() } }

    override suspend fun getById(id: String): Location? =
        withContext(Dispatchers.IO) {
            db.locationsQueries.selectLocationById(id).executeAsOneOrNull()?.toDomain()
        }

    override suspend fun upsert(entity: Location): Unit = withContext(Dispatchers.IO) {
        db.locationsQueries.insertLocation(
            id = entity.id,
            name = entity.name,
            type = entity.type.toDbString(),
            description = entity.description,
            status = entity.status.toDbString(),
            parent_id = entity.parentId,
            map_hash = entity.mapHash,
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
        db.locationsQueries.deleteLocation(id)
    }

    override suspend fun linkToCampaign(locationId: String, campaignId: String): Unit = withContext(Dispatchers.IO) {
        db.joinsQueries.insertLocationCampaign(location_id = locationId, campaign_id = campaignId)
    }

    override suspend fun unlinkFromCampaign(locationId: String, campaignId: String): Unit = withContext(Dispatchers.IO) {
        db.joinsQueries.deleteLocationCampaign(location_id = locationId, campaign_id = campaignId)
    }

    override suspend fun linkToTag(locationId: String, tagId: String): Unit = withContext(Dispatchers.IO) {
        db.joinsQueries.insertLocationTag(location_id = locationId, tag_id = tagId)
    }

    override suspend fun unlinkFromTag(locationId: String, tagId: String): Unit = withContext(Dispatchers.IO) {
        db.joinsQueries.deleteLocationTag(location_id = locationId, tag_id = tagId)
    }

    private fun Locations.toDomain() = Location(
        id = id,
        name = name,
        type = LocationType.fromDbString(type),
        description = description,
        status = EntityStatus.fromDbString(status),
        parentId = parent_id,
        mapHash = map_hash,
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
