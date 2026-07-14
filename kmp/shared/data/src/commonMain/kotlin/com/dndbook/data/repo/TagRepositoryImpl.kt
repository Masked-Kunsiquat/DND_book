package com.dndbook.data.repo

import app.cash.sqldelight.coroutines.asFlow
import app.cash.sqldelight.coroutines.mapToList
import com.dndbook.db.DndBookDatabase
import com.dndbook.db.Tags
import com.dndbook.domain.model.Scope
import com.dndbook.domain.model.Tag
import com.dndbook.domain.repository.TagRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.withContext

class TagRepositoryImpl(private val db: DndBookDatabase) : TagRepository {

    override fun observeAll(): Flow<List<Tag>> =
        db.tagsQueries.selectAllTags()
            .asFlow()
            .mapToList(Dispatchers.IO)
            .map { list -> list.map { it.toDomain() } }

    override fun observeByContinuity(continuityId: String): Flow<List<Tag>> =
        db.tagsQueries.selectTagsByContinuity(continuityId)
            .asFlow()
            .mapToList(Dispatchers.IO)
            .map { list -> list.map { it.toDomain() } }

    override fun observeByCampaign(campaignId: String): Flow<List<Tag>> =
        db.tagsQueries.selectTagsByCampaign(campaignId)
            .asFlow()
            .mapToList(Dispatchers.IO)
            .map { list -> list.map { it.toDomain() } }

    override suspend fun getById(id: String): Tag? =
        withContext(Dispatchers.IO) {
            db.tagsQueries.selectTagById(id).executeAsOneOrNull()?.toDomain()
        }

    override suspend fun upsert(entity: Tag): Unit = withContext(Dispatchers.IO) {
        db.tagsQueries.insertTag(
            id = entity.id,
            name = entity.name,
            color = entity.color,
            scope = entity.scope.toDbString(),
            continuity_id = entity.continuityId,
            campaign_id = entity.campaignId,
            origin_id = entity.originId,
            origin_continuity_id = entity.originContinuityId,
            forked_at = entity.forkedAt,
            hlc = entity.hlc,
            created = entity.created,
            updated = entity.updated,
        )
    }

    override suspend fun delete(id: String): Unit = withContext(Dispatchers.IO) {
        db.tagsQueries.deleteTag(id)
    }

    private fun Tags.toDomain() = Tag(
        id = id,
        name = name,
        color = color,
        scope = Scope.fromDbString(scope),
        continuityId = continuity_id,
        campaignId = campaign_id,
        originId = origin_id,
        originContinuityId = origin_continuity_id,
        forkedAt = forked_at,
        hlc = hlc,
        created = created,
        updated = updated,
    )
}
