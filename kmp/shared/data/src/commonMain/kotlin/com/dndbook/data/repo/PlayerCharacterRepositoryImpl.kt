package com.dndbook.data.repo

import app.cash.sqldelight.coroutines.asFlow
import app.cash.sqldelight.coroutines.mapToList
import com.dndbook.db.DndBookDatabase
import com.dndbook.db.Player_characters
import com.dndbook.domain.model.PlayerCharacter
import com.dndbook.domain.repository.PlayerCharacterRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.withContext

class PlayerCharacterRepositoryImpl(private val db: DndBookDatabase) : PlayerCharacterRepository {

    override fun observeAll(): Flow<List<PlayerCharacter>> =
        db.player_charactersQueries.selectAllPlayerCharacters()
            .asFlow()
            .mapToList(Dispatchers.IO)
            .map { list -> list.map { it.toDomain() } }

    override suspend fun getById(id: String): PlayerCharacter? =
        withContext(Dispatchers.IO) {
            db.player_charactersQueries.selectPlayerCharacterById(id).executeAsOneOrNull()?.toDomain()
        }

    override suspend fun upsert(entity: PlayerCharacter): Unit = withContext(Dispatchers.IO) {
        db.player_charactersQueries.insertPlayerCharacter(
            id = entity.id,
            name = entity.name,
            player = entity.player,
            race = entity.race,
            class_name = entity.className,
            background = entity.background,
            image_hash = entity.imageHash,
            hlc = entity.hlc,
            created = entity.created,
            updated = entity.updated,
        )
    }

    override suspend fun delete(id: String): Unit = withContext(Dispatchers.IO) {
        db.player_charactersQueries.deletePlayerCharacter(id)
    }

    override suspend fun linkToCampaign(pcId: String, campaignId: String): Unit = withContext(Dispatchers.IO) {
        db.joinsQueries.insertPcCampaign(player_character_id = pcId, campaign_id = campaignId)
    }

    override suspend fun unlinkFromCampaign(pcId: String, campaignId: String): Unit = withContext(Dispatchers.IO) {
        db.joinsQueries.deletePcCampaign(player_character_id = pcId, campaign_id = campaignId)
    }

    private fun Player_characters.toDomain() = PlayerCharacter(
        id = id,
        name = name,
        player = player,
        race = race,
        className = class_name,
        background = background,
        imageHash = image_hash,
        hlc = hlc,
        created = created,
        updated = updated,
    )
}
