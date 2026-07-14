package com.dndbook.domain.model

import kotlinx.datetime.Clock
import kotlinx.serialization.Serializable

/**
 * Hybrid Logical Clock (HLC) for causally-consistent timestamps.
 *
 * Format: "$physicalMs.$counter.$nodeId"
 *
 * Rules:
 * - physicalMs = max(wallClock, lastKnown.physicalMs)
 * - if physicalMs == lastKnown.physicalMs then counter = lastKnown.counter + 1 else counter = 0
 */
@Serializable
data class Hlc(
    val physicalMs: Long,
    val counter: Int,
    val nodeId: String,
) : Comparable<Hlc> {

    fun serialize(): String = "$physicalMs.$counter.$nodeId"

    override fun compareTo(other: Hlc): Int {
        val cmpMs = physicalMs.compareTo(other.physicalMs)
        if (cmpMs != 0) return cmpMs
        val cmpCounter = counter.compareTo(other.counter)
        if (cmpCounter != 0) return cmpCounter
        return nodeId.compareTo(other.nodeId)
    }

    companion object {
        /**
         * Generate a new HLC timestamp.
         *
         * @param nodeId  Unique identifier for this node/device.
         * @param lastKnown  The last HLC value observed by this node (null on first run).
         */
        fun now(nodeId: String, lastKnown: Hlc? = null): Hlc {
            val wallMs = Clock.System.now().toEpochMilliseconds()
            return if (lastKnown == null) {
                Hlc(physicalMs = wallMs, counter = 0, nodeId = nodeId)
            } else {
                val physicalMs = maxOf(wallMs, lastKnown.physicalMs)
                val counter = if (physicalMs == lastKnown.physicalMs) {
                    lastKnown.counter + 1
                } else {
                    0
                }
                Hlc(physicalMs = physicalMs, counter = counter, nodeId = nodeId)
            }
        }

        /**
         * Parse an HLC from its serialized form "$physicalMs.$counter.$nodeId".
         * The nodeId may itself contain dots, so we only split on the first two dots.
         */
        fun parse(value: String): Hlc {
            val firstDot = value.indexOf('.')
            val secondDot = value.indexOf('.', firstDot + 1)
            return Hlc(
                physicalMs = value.substring(0, firstDot).toLong(),
                counter = value.substring(firstDot + 1, secondDot).toInt(),
                nodeId = value.substring(secondDot + 1),
            )
        }
    }
}
