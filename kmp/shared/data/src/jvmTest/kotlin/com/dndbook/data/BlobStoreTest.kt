package com.dndbook.data

import app.cash.sqldelight.driver.jdbc.sqlite.JdbcSqliteDriver
import com.dndbook.data.blob.BlobFileStore
import com.dndbook.data.blob.Sha256
import com.dndbook.data.repo.BlobRepositoryImpl
import com.dndbook.db.DndBookDatabase
import kotlinx.coroutines.runBlocking
import java.io.File
import kotlin.io.path.createTempDirectory
import kotlin.test.BeforeTest
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNotNull
import kotlin.test.assertNull
import kotlin.test.assertTrue

class BlobStoreTest {

    private lateinit var db: DndBookDatabase
    private lateinit var tempDir: String
    private lateinit var repo: BlobRepositoryImpl

    @BeforeTest
    fun setUp() {
        val driver = JdbcSqliteDriver(JdbcSqliteDriver.IN_MEMORY)
        DndBookDatabase.Schema.create(driver)
        driver.execute(null, "PRAGMA foreign_keys = ON", 0)
        db = DndBookDatabase(driver)
        tempDir = createTempDirectory("blob-store-test").toString()
        repo = BlobRepositoryImpl(db, BlobFileStore(tempDir))
    }

    // FIPS 180-4 test vectors
    @Test
    fun `sha256 of empty input matches known vector`() {
        assertEquals(
            "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            Sha256.hex(ByteArray(0)),
        )
    }

    @Test
    fun `sha256 of abc matches known vector`() {
        assertEquals(
            "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
            Sha256.hex("abc".encodeToByteArray()),
        )
    }

    @Test
    fun `sha256 of 448-bit message matches known vector`() {
        assertEquals(
            "248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1",
            Sha256.hex("abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq".encodeToByteArray()),
        )
    }

    @Test
    fun `sha256 of exactly 64-byte input matches known value`() {
        // Boundary case: message + padding spans two blocks
        val input = "a".repeat(64).encodeToByteArray()
        assertEquals(
            "ffe054fe7ae0cb6dc65c3af9b61d5209f439851db43d0ba5997337df154668eb",
            Sha256.hex(input),
        )
    }

    @Test
    fun `put stores file and row and returns content hash`() = runBlocking {
        val bytes = "abc".encodeToByteArray()
        val hash = repo.put(bytes, "png")

        assertEquals("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad", hash)

        val blob = repo.getBlob(hash)
        assertNotNull(blob)
        assertEquals("png", blob.extension)
        assertEquals(3L, blob.size)

        val path = repo.resolvePath(hash)
        assertNotNull(path)
        assertTrue(File(path).exists(), "blob file should exist at resolved path")
        assertTrue(path.endsWith("$hash.png"))
    }

    @Test
    fun `put is idempotent for identical bytes`() = runBlocking {
        val bytes = "same content".encodeToByteArray()
        val hash1 = repo.put(bytes, "jpg")
        val hash2 = repo.put(bytes, "jpg")

        assertEquals(hash1, hash2)
        assertEquals(1, db.blobsQueries.selectAllHashes().executeAsList().size)
    }

    @Test
    fun `resolvePath returns null for unknown hash`() = runBlocking {
        assertNull(repo.resolvePath("does-not-exist"))
    }

    @Test
    fun `runGc deletes orphan blob file from disk`() = runBlocking {
        val bytes = "orphan bytes".encodeToByteArray()
        val hash = repo.put(bytes, "webp")
        val path = repo.resolvePath(hash)!!
        assertTrue(File(path).exists())

        // Nothing references this hash -> GC removes row and file
        val deleted = repo.runGc()
        assertEquals(1, deleted)
        assertNull(repo.getBlob(hash))
        assertFalse(File(path).exists(), "orphan blob file should be deleted by GC")
    }
}
