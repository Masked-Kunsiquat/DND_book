package com.dndbook.domain.repository

import com.dndbook.domain.model.Note
import kotlinx.coroutines.flow.Flow

interface NoteRepository {
    fun observeAll(): Flow<List<Note>>
    fun observeByContinuity(continuityId: String): Flow<List<Note>>
    fun observeByCampaign(campaignId: String): Flow<List<Note>>
    suspend fun getById(id: String): Note?
    suspend fun upsert(entity: Note)
    suspend fun delete(id: String)
    suspend fun linkToCampaign(noteId: String, campaignId: String)
    suspend fun unlinkFromCampaign(noteId: String, campaignId: String)
    suspend fun linkToTag(noteId: String, tagId: String)
    suspend fun unlinkFromTag(noteId: String, tagId: String)
}
