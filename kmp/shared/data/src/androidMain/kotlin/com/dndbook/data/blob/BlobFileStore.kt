package com.dndbook.data.blob

import java.io.File

actual class BlobFileStore actual constructor(private val baseDir: String) {

    private fun file(hash: String, extension: String) = File(baseDir, "$hash.$extension")

    actual fun pathFor(hash: String, extension: String): String =
        file(hash, extension).absolutePath

    actual fun write(hash: String, extension: String, bytes: ByteArray) {
        File(baseDir).mkdirs()
        file(hash, extension).writeBytes(bytes)
    }

    actual fun read(hash: String, extension: String): ByteArray? =
        file(hash, extension).takeIf { it.exists() }?.readBytes()

    actual fun delete(hash: String, extension: String) {
        file(hash, extension).delete()
    }

    actual fun exists(hash: String, extension: String): Boolean =
        file(hash, extension).exists()
}
