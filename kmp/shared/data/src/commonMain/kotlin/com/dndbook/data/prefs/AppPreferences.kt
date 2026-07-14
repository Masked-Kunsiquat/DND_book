package com.dndbook.data.prefs

import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

/**
 * DataStore preference keys (conversion plan §4 "App settings").
 *
 * The three runtime-only TinyBase values (hasSeedData, seedDataContinuityId,
 * tourCompleted) are promoted to persisted preferences. THEME_MODE fixes the
 * Expo theme-persistence bug; LAST_SYNCED_AT is written by the sync engine
 * (Phase 5).
 */
object PrefKeys {
    val CURRENT_CAMPAIGN_ID = stringPreferencesKey("currentCampaignId")
    val DEVICE_ID = stringPreferencesKey("deviceId")
    val LAST_SYNCED_AT = stringPreferencesKey("lastSyncedAt")
    val MENTION_SETTINGS = stringPreferencesKey("mentionSettings") // JSON
    val TOUR_COMPLETED = booleanPreferencesKey("tourCompleted")
    val HAS_SEED_DATA = booleanPreferencesKey("hasSeedData")
    val SEED_CONTINUITY_ID = stringPreferencesKey("seedContinuityId")
    val THEME_MODE = stringPreferencesKey("themeMode") // "dark" | "light" | "system"
}

/**
 * Typed facade over the preferences DataStore. Platform construction of the
 * underlying DataStore (file path wiring) happens in the app modules / Koin
 * setup in later phases; the data layer only depends on the abstraction.
 */
class AppPreferences(private val dataStore: DataStore<Preferences>) {

    val currentCampaignId: Flow<String?> = dataStore.data.map { it[PrefKeys.CURRENT_CAMPAIGN_ID] }
    val deviceId: Flow<String?> = dataStore.data.map { it[PrefKeys.DEVICE_ID] }
    val lastSyncedAt: Flow<String?> = dataStore.data.map { it[PrefKeys.LAST_SYNCED_AT] }
    val mentionSettings: Flow<String?> = dataStore.data.map { it[PrefKeys.MENTION_SETTINGS] }
    val tourCompleted: Flow<Boolean> = dataStore.data.map { it[PrefKeys.TOUR_COMPLETED] ?: false }
    val hasSeedData: Flow<Boolean> = dataStore.data.map { it[PrefKeys.HAS_SEED_DATA] ?: false }
    val seedContinuityId: Flow<String?> = dataStore.data.map { it[PrefKeys.SEED_CONTINUITY_ID] }
    val themeMode: Flow<String> = dataStore.data.map { it[PrefKeys.THEME_MODE] ?: "dark" }

    suspend fun setCurrentCampaignId(value: String?) = setOrRemove(PrefKeys.CURRENT_CAMPAIGN_ID, value)
    suspend fun setDeviceId(value: String) = setOrRemove(PrefKeys.DEVICE_ID, value)
    suspend fun setLastSyncedAt(value: String) = setOrRemove(PrefKeys.LAST_SYNCED_AT, value)
    suspend fun setMentionSettings(json: String) = setOrRemove(PrefKeys.MENTION_SETTINGS, json)
    suspend fun setThemeMode(value: String) = setOrRemove(PrefKeys.THEME_MODE, value)

    suspend fun setTourCompleted(value: Boolean) {
        dataStore.edit { it[PrefKeys.TOUR_COMPLETED] = value }
    }

    suspend fun setSeedState(hasSeedData: Boolean, seedContinuityId: String?) {
        dataStore.edit { prefs ->
            prefs[PrefKeys.HAS_SEED_DATA] = hasSeedData
            if (seedContinuityId != null) {
                prefs[PrefKeys.SEED_CONTINUITY_ID] = seedContinuityId
            } else {
                prefs.remove(PrefKeys.SEED_CONTINUITY_ID)
            }
        }
    }

    /**
     * Atomically clears all seed-related state (fixes Expo audit finding D1:
     * clearSeedData must also reset tourCompleted).
     */
    suspend fun clearSeedState() {
        dataStore.edit { prefs ->
            prefs.remove(PrefKeys.HAS_SEED_DATA)
            prefs.remove(PrefKeys.SEED_CONTINUITY_ID)
            prefs.remove(PrefKeys.TOUR_COMPLETED)
        }
    }

    private suspend fun setOrRemove(key: Preferences.Key<String>, value: String?) {
        dataStore.edit { prefs ->
            if (value != null) prefs[key] = value else prefs.remove(key)
        }
    }
}
