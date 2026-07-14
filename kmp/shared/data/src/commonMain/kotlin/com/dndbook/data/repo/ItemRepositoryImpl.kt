package com.dndbook.data.repo

import app.cash.sqldelight.coroutines.asFlow
import app.cash.sqldelight.coroutines.mapToList
import com.dndbook.db.DndBookDatabase
import com.dndbook.db.Items
import com.dndbook.domain.model.EntityStatus
import com.dndbook.domain.model.Item
import com.dndbook.domain.model.Scope
import com.dndbook.domain.repository.ItemRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.withContext

class ItemRepositoryImpl(private val db: DndBookDatabase) : ItemRepository {

    override fun observeAll(): Flow<List<Item>> =
        db.itemsQueries.selectAllItems()
            .asFlow()
            .mapToList(Dispatchers.IO)
            .map { list -> list.map { it.toDomain() } }

    override fun observeByContinuity(continuityId: String): Flow<List<Item>> =
        db.itemsQueries.selectItemsByContinuity(continuityId)
            .asFlow()
            .mapToList(Dispatchers.IO)
            .map { list -> list.map { it.toDomain() } }

    override suspend fun getById(id: String): Item? =
        withContext(Dispatchers.IO) {
            db.itemsQueries.selectItemById(id).executeAsOneOrNull()?.toDomain()
        }

    override suspend fun upsert(entity: Item): Unit = withContext(Dispatchers.IO) {
        db.itemsQueries.insertItem(
            id = entity.id,
            name = entity.name,
            description = entity.description,
            value_ = entity.value,
            status = entity.status.toDbString(),
            scope = entity.scope.toDbString(),
            continuity_id = entity.continuityId,
            owner_id = entity.ownerId,
            owner_type = entity.ownerType,
            location_id = entity.locationId,
            hlc = entity.hlc,
            created = entity.created,
            updated = entity.updated,
        )
    }

    override suspend fun delete(id: String): Unit = withContext(Dispatchers.IO) {
        db.itemsQueries.deleteItem(id)
    }

    override suspend fun linkToCampaign(itemId: String, campaignId: String): Unit = withContext(Dispatchers.IO) {
        db.joinsQueries.insertItemCampaign(item_id = itemId, campaign_id = campaignId)
    }

    override suspend fun unlinkFromCampaign(itemId: String, campaignId: String): Unit = withContext(Dispatchers.IO) {
        db.joinsQueries.deleteItemCampaign(item_id = itemId, campaign_id = campaignId)
    }

    override suspend fun linkToTag(itemId: String, tagId: String): Unit = withContext(Dispatchers.IO) {
        db.joinsQueries.insertItemTag(item_id = itemId, tag_id = tagId)
    }

    override suspend fun unlinkFromTag(itemId: String, tagId: String): Unit = withContext(Dispatchers.IO) {
        db.joinsQueries.deleteItemTag(item_id = itemId, tag_id = tagId)
    }

    private fun Items.toDomain() = Item(
        id = id,
        name = name,
        description = description,
        value = value_,
        status = EntityStatus.fromDbString(status),
        scope = Scope.fromDbString(scope),
        continuityId = continuity_id,
        ownerId = owner_id,
        ownerType = owner_type,
        locationId = location_id,
        hlc = hlc,
        created = created,
        updated = updated,
    )
}
