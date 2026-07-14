package com.dndbook.domain.repository

import com.dndbook.domain.model.Blob

interface BlobRepository {
    /** Store bytes in the content-addressed store and return the SHA-256 hash. */
    suspend fun put(bytes: ByteArray, extension: String): String

    /** Retrieve blob metadata by hash. */
    suspend fun getBlob(hash: String): Blob?

    /**
     * Resolve a hash to the absolute filesystem path of the blob file,
     * or null if the hash is unknown.
     */
    suspend fun resolvePath(hash: String): String?

    /**
     * Garbage-collect blobs no longer referenced by any table column
     * (npcs.image_hash, locations.map_hash, player_characters.image_hash,
     * pc_templates.image_hash, location_images.blob_hash).
     * Deletes both the database rows and the underlying files.
     * Returns the count of blobs deleted.
     */
    suspend fun runGc(): Int
}
