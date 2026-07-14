package com.dndbook.data.blob

import kotlinx.cinterop.ExperimentalForeignApi
import kotlinx.cinterop.addressOf
import kotlinx.cinterop.usePinned
import platform.Foundation.NSData
import platform.Foundation.NSFileManager
import platform.Foundation.create
import platform.Foundation.dataWithContentsOfFile
import platform.Foundation.writeToFile
import platform.posix.memcpy

@OptIn(ExperimentalForeignApi::class)
actual class BlobFileStore actual constructor(private val baseDir: String) {

    actual fun pathFor(hash: String, extension: String): String =
        "$baseDir/$hash.$extension"

    actual fun write(hash: String, extension: String, bytes: ByteArray) {
        NSFileManager.defaultManager.createDirectoryAtPath(
            path = baseDir,
            withIntermediateDirectories = true,
            attributes = null,
            error = null,
        )
        val data = if (bytes.isEmpty()) {
            NSData.create(bytes = null, length = 0u)
        } else {
            bytes.usePinned { pinned ->
                NSData.create(bytes = pinned.addressOf(0), length = bytes.size.toULong())
            }
        }
        data.writeToFile(pathFor(hash, extension), atomically = true)
    }

    actual fun read(hash: String, extension: String): ByteArray? {
        val data = NSData.dataWithContentsOfFile(pathFor(hash, extension)) ?: return null
        val length = data.length.toInt()
        if (length == 0) return ByteArray(0)
        val result = ByteArray(length)
        result.usePinned { pinned ->
            memcpy(pinned.addressOf(0), data.bytes, data.length)
        }
        return result
    }

    actual fun delete(hash: String, extension: String) {
        NSFileManager.defaultManager.removeItemAtPath(pathFor(hash, extension), error = null)
    }

    actual fun exists(hash: String, extension: String): Boolean =
        NSFileManager.defaultManager.fileExistsAtPath(pathFor(hash, extension))
}
