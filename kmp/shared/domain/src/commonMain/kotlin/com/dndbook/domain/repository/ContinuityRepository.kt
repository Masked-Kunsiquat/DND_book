package com.dndbook.domain.repository

import com.dndbook.domain.model.Continuity
import kotlinx.coroutines.flow.Flow

interface ContinuityRepository {
    fun observeAll(): Flow<List<Continuity>>
    suspend fun getById(id: String): Continuity?
    suspend fun upsert(entity: Continuity)
    suspend fun delete(id: String)
}
