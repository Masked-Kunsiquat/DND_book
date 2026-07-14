package com.dndbook.data.repo

import com.dndbook.data.blob.BlobFileStore
import com.dndbook.data.blob.Sha256
import com.dndbook.db.Blobs
import com.dndbook.db.DndBookDatabase
import com.dndbook.domain.model.Blob
import com.dndbook.domain.repository.BlobRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.datetime.Clock

/**
 * Content-addressed blob store (conversion plan §1 Q3).
 *
 * - `put` hashes the bytes (SHA-256), writes `<baseDir>/<hash>.<ext>`, and records
 *   the blob in the `blobs` table. Idempotent: re-putting identical bytes is a no-op.
 * - Referencing columns store the hash only; there are no FK constraints on them.
 * - `runGc` removes blobs (rows + files) that no column references anymore.
 */
class BlobRepositoryImpl(
    private val db: DndBookDatabase,
    private val fileStore: BlobFileStore,
) : BlobRepository {

    override suspend fun put(bytes: ByteArray, extension: String): String =
        withContext(Dispatchers.IO) {
            val hash = Sha256.hex(bytes)
            if (!fileStore.exists(hash, extension)) {
                fileStore.write(hash, extension, bytes)
            }
            val existing = db.blobsQueries.selectBlobByHash(hash).executeAsOneOrNull()
            if (existing == null) {
                db.blobsQueries.insertBlob(
                    hash = hash,
                    extension = extension,
                    size = bytes.size.toLong(),
                    created = Clock.System.now().toString(),
                )
            }
            hash
        }

    override suspend fun getBlob(hash: String): Blob? =
        withContext(Dispatchers.IO) {
            db.blobsQueries.selectBlobByHash(hash).executeAsOneOrNull()?.toDomain()
        }

    override suspend fun resolvePath(hash: String): String? =
        withContext(Dispatchers.IO) {
            db.blobsQueries.selectBlobByHash(hash).executeAsOneOrNull()
                ?.let { fileStore.pathFor(it.hash, it.extension) }
        }

    override suspend fun runGc(): Int = withContext(Dispatchers.IO) {
        val referencedHashes = buildSet {
            addAll(db.npcsQueries.selectAllImageHashes().executeAsList().filterNotNull())
            addAll(db.locationsQueries.selectAllMapHashes().executeAsList().filterNotNull())
            addAll(db.player_charactersQueries.selectAllImageHashes().executeAsList().filterNotNull())
            addAll(db.pc_templatesQueries.selectAllImageHashes().executeAsList().filterNotNull())
            addAll(db.joinsQueries.selectAllBlobHashes().executeAsList())
        }

        val orphans = db.blobsQueries.selectAllBlobs().executeAsList()
            .filter { it.hash !in referencedHashes }
        for (blob in orphans) {
            fileStore.delete(blob.hash, blob.extension)
            db.blobsQueries.deleteBlob(blob.hash)
        }
        orphans.size
    }

    private fun Blobs.toDomain() = Blob(
        hash = hash,
        extension = extension,
        size = size,
        created = created,
    )
}
