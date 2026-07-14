package com.dndbook.data.repo

import app.cash.sqldelight.coroutines.asFlow
import app.cash.sqldelight.coroutines.mapToList
import com.dndbook.db.DndBookDatabase
import com.dndbook.db.Notes
import com.dndbook.domain.model.Note
import com.dndbook.domain.model.Scope
import com.dndbook.domain.repository.NoteRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.withContext

class NoteRepositoryImpl(private val db: DndBookDatabase) : NoteRepository {

    override fun observeAll(): Flow<List<Note>> =
        db.notesQueries.selectAllNotes()
            .asFlow()
            .mapToList(Dispatchers.IO)
            .map { list -> list.map { it.toDomain() } }

    override fun observeByContinuity(continuityId: String): Flow<List<Note>> =
        db.notesQueries.selectNotesByContinuity(continuityId)
            .asFlow()
            .mapToList(Dispatchers.IO)
            .map { list -> list.map { it.toDomain() } }

    override fun observeByCampaign(campaignId: String): Flow<List<Note>> =
        db.notesQueries.selectNotesByCampaign(campaignId)
            .asFlow()
            .mapToList(Dispatchers.IO)
            .map { list -> list.map { it.toDomain() } }

    override suspend fun getById(id: String): Note? =
        withContext(Dispatchers.IO) {
            db.notesQueries.selectNoteById(id).executeAsOneOrNull()?.toDomain()
        }

    override suspend fun upsert(entity: Note): Unit = withContext(Dispatchers.IO) {
        db.notesQueries.insertNote(
            id = entity.id,
            title = entity.title,
            content = entity.content,
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
        db.notesQueries.deleteNote(id)
    }

    override suspend fun linkToCampaign(noteId: String, campaignId: String): Unit = withContext(Dispatchers.IO) {
        db.joinsQueries.insertNoteCampaign(note_id = noteId, campaign_id = campaignId)
    }

    override suspend fun unlinkFromCampaign(noteId: String, campaignId: String): Unit = withContext(Dispatchers.IO) {
        db.joinsQueries.deleteNoteCampaign(note_id = noteId, campaign_id = campaignId)
    }

    override suspend fun linkToTag(noteId: String, tagId: String): Unit = withContext(Dispatchers.IO) {
        db.joinsQueries.insertNoteTag(note_id = noteId, tag_id = tagId)
    }

    override suspend fun unlinkFromTag(noteId: String, tagId: String): Unit = withContext(Dispatchers.IO) {
        db.joinsQueries.deleteNoteTag(note_id = noteId, tag_id = tagId)
    }

    private fun Notes.toDomain() = Note(
        id = id,
        title = title,
        content = content,
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
