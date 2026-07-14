package com.dndbook.data.repo

import app.cash.sqldelight.coroutines.asFlow
import app.cash.sqldelight.coroutines.mapToList
import com.dndbook.db.Continuities
import com.dndbook.db.DndBookDatabase
import com.dndbook.domain.model.Continuity
import com.dndbook.domain.repository.ContinuityRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.withContext

class ContinuityRepositoryImpl(private val db: DndBookDatabase) : ContinuityRepository {

    override fun observeAll(): Flow<List<Continuity>> =
        db.continuitiesQueries.selectAllContinuities()
            .asFlow()
            .mapToList(Dispatchers.IO)
            .map { list -> list.map { it.toDomain() } }

    override suspend fun getById(id: String): Continuity? =
        withContext(Dispatchers.IO) {
            db.continuitiesQueries.selectContinuityById(id).executeAsOneOrNull()?.toDomain()
        }

    override suspend fun upsert(entity: Continuity): Unit = withContext(Dispatchers.IO) {
        db.continuitiesQueries.insertContinuity(
            id = entity.id,
            name = entity.name,
            description = entity.description,
            hlc = entity.hlc,
            created = entity.created,
            updated = entity.updated,
        )
    }

    override suspend fun delete(id: String): Unit = withContext(Dispatchers.IO) {
        db.continuitiesQueries.deleteContinuity(id)
    }

    private fun Continuities.toDomain() = Continuity(
        id = id,
        name = name,
        description = description,
        hlc = hlc,
        created = created,
        updated = updated,
    )
}
