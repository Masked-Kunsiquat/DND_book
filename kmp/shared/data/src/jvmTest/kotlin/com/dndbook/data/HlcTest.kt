package com.dndbook.data

import com.dndbook.domain.model.Hlc
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class HlcTest {

    @Test
    fun `parse and serialize are inverse operations`() {
        val original = Hlc(physicalMs = 1700000000000L, counter = 5, nodeId = "device-abc")
        val serialized = original.serialize()
        val parsed = Hlc.parse(serialized)
        assertEquals(original, parsed)
    }

    @Test
    fun `serialize format is physicalMs dot counter dot nodeId`() {
        val hlc = Hlc(physicalMs = 123L, counter = 42, nodeId = "node1")
        assertEquals("123.42.node1", hlc.serialize())
    }

    @Test
    fun `nodeId with dots is preserved`() {
        val hlc = Hlc(physicalMs = 1000L, counter = 0, nodeId = "device.uuid.v4")
        val parsed = Hlc.parse(hlc.serialize())
        assertEquals("device.uuid.v4", parsed.nodeId)
        assertEquals(1000L, parsed.physicalMs)
        assertEquals(0, parsed.counter)
    }

    @Test
    fun `now without lastKnown returns counter zero`() {
        val hlc = Hlc.now("node1", lastKnown = null)
        assertEquals(0, hlc.counter)
        assertEquals("node1", hlc.nodeId)
        assertTrue(hlc.physicalMs > 0)
    }

    @Test
    fun `now with same physicalMs increments counter`() {
        // Force same physical ms by using a lastKnown far in the future
        val futureMs = System.currentTimeMillis() + 1_000_000L
        val lastKnown = Hlc(physicalMs = futureMs, counter = 7, nodeId = "node1")
        val hlc = Hlc.now("node1", lastKnown = lastKnown)
        assertEquals(futureMs, hlc.physicalMs)
        assertEquals(8, hlc.counter)
    }

    @Test
    fun `now with different physicalMs resets counter to zero`() {
        val pastMs = 1L // Very old timestamp — wall clock will be much higher
        val lastKnown = Hlc(physicalMs = pastMs, counter = 99, nodeId = "node1")
        val hlc = Hlc.now("node1", lastKnown = lastKnown)
        assertTrue(hlc.physicalMs > pastMs)
        assertEquals(0, hlc.counter)
    }

    @Test
    fun `now monotonically increases when called repeatedly`() {
        var last: Hlc? = null
        repeat(100) {
            val current = Hlc.now("node1", last)
            if (last != null) {
                assertTrue(current >= last!!, "HLC should be monotonically non-decreasing")
            }
            last = current
        }
    }

    @Test
    fun `comparison orders by physicalMs first`() {
        val earlier = Hlc(physicalMs = 100L, counter = 99, nodeId = "z")
        val later = Hlc(physicalMs = 101L, counter = 0, nodeId = "a")
        assertTrue(earlier < later)
    }

    @Test
    fun `comparison orders by counter when physicalMs equal`() {
        val low = Hlc(physicalMs = 100L, counter = 0, nodeId = "z")
        val high = Hlc(physicalMs = 100L, counter = 1, nodeId = "a")
        assertTrue(low < high)
    }

    @Test
    fun `comparison orders by nodeId when physicalMs and counter equal`() {
        val a = Hlc(physicalMs = 100L, counter = 0, nodeId = "a")
        val z = Hlc(physicalMs = 100L, counter = 0, nodeId = "z")
        assertTrue(a < z)
    }

    @Test
    fun `equal HLCs compare as zero`() {
        val a = Hlc(physicalMs = 100L, counter = 5, nodeId = "node")
        val b = Hlc(physicalMs = 100L, counter = 5, nodeId = "node")
        assertEquals(0, a.compareTo(b))
    }

    @Test
    fun `parse round-trips large physicalMs`() {
        val hlc = Hlc(physicalMs = Long.MAX_VALUE, counter = Int.MAX_VALUE, nodeId = "test")
        val parsed = Hlc.parse(hlc.serialize())
        assertEquals(hlc, parsed)
    }
}
