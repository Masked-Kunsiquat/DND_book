package com.dndbook.data.blob

/**
 * Platform file storage for the content-addressed blob store.
 *
 * Blobs live at `<baseDir>/<hash>.<extension>` per the conversion plan (§1 Q3):
 * the database stores only the SHA-256 hash; this store maps hash -> file.
 *
 * @param baseDir absolute path of the blob directory
 *                (e.g. `<filesDir>/images` on Android, Documents/images on iOS).
 */
expect class BlobFileStore(baseDir: String) {
    /** Absolute path where a blob with this hash/extension lives (whether or not it exists). */
    fun pathFor(hash: String, extension: String): String

    /** Write blob bytes, creating the base directory if needed. Idempotent for same content. */
    fun write(hash: String, extension: String, bytes: ByteArray)

    /** Read blob bytes, or null if the file does not exist. */
    fun read(hash: String, extension: String): ByteArray?

    /** Delete the blob file if it exists. */
    fun delete(hash: String, extension: String)

    /** True if the blob file exists on disk. */
    fun exists(hash: String, extension: String): Boolean
}
