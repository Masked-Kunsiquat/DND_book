package com.dndbook.domain.util

import kotlinx.datetime.Clock
import kotlin.random.Random

/**
 * Simple ULID (Universally Unique Lexicographically Sortable Identifier) generator.
 *
 * A ULID is a 26-character Crockford Base32 string:
 * - 10 characters: 48-bit millisecond timestamp
 * - 16 characters: 80-bit random component
 *
 * ULIDs are sortable by creation time and collision-resistant.
 */
object Ulid {

    private const val ENCODING = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"
    private const val TIMESTAMP_LEN = 10
    private const val RANDOM_LEN = 16

    /** Generate a new ULID string. */
    fun generate(): String {
        val timestampMs = Clock.System.now().toEpochMilliseconds()
        return buildString(TIMESTAMP_LEN + RANDOM_LEN) {
            // Encode 48-bit timestamp as 10 Base32 characters
            var ts = timestampMs
            val tsChars = CharArray(TIMESTAMP_LEN)
            for (i in TIMESTAMP_LEN - 1 downTo 0) {
                tsChars[i] = ENCODING[(ts and 0x1F).toInt()]
                ts = ts shr 5
            }
            append(tsChars)

            // Encode 80-bit random as 16 Base32 characters
            repeat(RANDOM_LEN) {
                append(ENCODING[Random.nextInt(32)])
            }
        }
    }
}
