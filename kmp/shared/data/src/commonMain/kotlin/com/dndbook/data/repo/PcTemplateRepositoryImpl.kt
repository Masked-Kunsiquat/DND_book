package com.dndbook.data.repo

import app.cash.sqldelight.coroutines.asFlow
import app.cash.sqldelight.coroutines.mapToList
import com.dndbook.db.DndBookDatabase
import com.dndbook.db.Pc_templates
import com.dndbook.domain.model.PcTemplate
import com.dndbook.domain.repository.PcTemplateRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.withContext

class PcTemplateRepositoryImpl(private val db: DndBookDatabase) : PcTemplateRepository {

    override fun observeAll(): Flow<List<PcTemplate>> =
        db.pc_templatesQueries.selectAllPcTemplates()
            .asFlow()
            .mapToList(Dispatchers.IO)
            .map { list -> list.map { it.toDomain() } }

    override fun observeByContinuity(continuityId: String): Flow<List<PcTemplate>> =
        db.pc_templatesQueries.selectPcTemplatesByContinuity(continuityId)
            .asFlow()
            .mapToList(Dispatchers.IO)
            .map { list -> list.map { it.toDomain() } }

    override suspend fun getById(id: String): PcTemplate? =
        withContext(Dispatchers.IO) {
            db.pc_templatesQueries.selectPcTemplateById(id).executeAsOneOrNull()?.toDomain()
        }

    override suspend fun upsert(entity: PcTemplate): Unit = withContext(Dispatchers.IO) {
        db.pc_templatesQueries.insertPcTemplate(
            id = entity.id,
            name = entity.name,
            player = entity.player,
            race = entity.race,
            class_name = entity.className,
            background = entity.background,
            image_hash = entity.imageHash,
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
        db.pc_templatesQueries.deletePcTemplate(id)
    }

    private fun Pc_templates.toDomain() = PcTemplate(
        id = id,
        name = name,
        player = player,
        race = race,
        className = class_name,
        background = background,
        imageHash = image_hash,
        continuityId = continuity_id,
        originId = origin_id,
        originContinuityId = origin_continuity_id,
        forkedAt = forked_at,
        hlc = hlc,
        created = created,
        updated = updated,
    )
}
