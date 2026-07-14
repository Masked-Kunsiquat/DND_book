package com.dndbook.domain.repository

import com.dndbook.domain.model.PcTemplate
import kotlinx.coroutines.flow.Flow

interface PcTemplateRepository {
    fun observeAll(): Flow<List<PcTemplate>>
    fun observeByContinuity(continuityId: String): Flow<List<PcTemplate>>
    suspend fun getById(id: String): PcTemplate?
    suspend fun upsert(entity: PcTemplate)
    suspend fun delete(id: String)
}
