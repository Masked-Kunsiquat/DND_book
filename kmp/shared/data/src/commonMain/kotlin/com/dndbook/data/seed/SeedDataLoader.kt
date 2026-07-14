package com.dndbook.data.seed

import com.dndbook.data.seed.OdysseySeedIds as Ids
import com.dndbook.db.DndBookDatabase
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/**
 * Loads the Odyssey demo continuity ("The Wine-Dark Sea") used by the
 * first-run experience and the onboarding tour (conversion plan §6.6).
 *
 * Fixed entity IDs match the Expo app so the tour can navigate to the
 * seed session deterministically. All rows carry the HLC "0.0.seed" so
 * any real edit (with a live HLC) wins during sync merges.
 *
 * Deletion relies entirely on FK cascades: removing the seed continuity
 * removes its campaigns, entities, session logs, and every join row.
 */
class SeedDataLoader(private val db: DndBookDatabase) {

    /** Insert the full Odyssey demo dataset in a single transaction. Idempotent. */
    suspend fun seed(): Unit = withContext(Dispatchers.IO) {
        db.transaction {
            insertContinuityAndCampaign()
            insertTags()
            insertLocations()
            insertNpcs()
            insertItems()
            insertSessionLog()
        }
    }

    /** Remove all seed data. FK cascades clean up every dependent row. */
    suspend fun clear(): Unit = withContext(Dispatchers.IO) {
        db.continuitiesQueries.deleteContinuity(Ids.CONTINUITY)
    }

    /** True if the seed continuity currently exists. */
    suspend fun isSeeded(): Boolean = withContext(Dispatchers.IO) {
        db.continuitiesQueries.selectContinuityById(Ids.CONTINUITY).executeAsOneOrNull() != null
    }

    // ─────────────────────────────────────────────────────────────────────────

    private fun insertContinuityAndCampaign() {
        db.continuitiesQueries.insertContinuity(
            id = Ids.CONTINUITY,
            name = "🏺 The Wine-Dark Sea (Demo)",
            description = "A demo continuity based on Homer's Odyssey. Explore this pre-built " +
                "campaign to learn how the app works, then clear it when you're ready to start " +
                "your own adventures.",
            hlc = HLC, created = TS, updated = TS,
        )
        db.campaignsQueries.insertCampaign(
            id = Ids.CAMPAIGN,
            name = "The Long Way Home",
            continuity_id = Ids.CONTINUITY,
            hlc = HLC, created = TS, updated = TS,
        )
    }

    private fun insertTags() {
        tag(Ids.TAG_HOSTILE, "Hostile", "#ef4444")
        tag(Ids.TAG_ALLY, "Ally", "#22c55e")
        tag(Ids.TAG_DIVINE, "Divine", "#a855f7")
        tag(Ids.TAG_MAGIC, "Magic", "#3b82f6")
        tag(Ids.TAG_BLINDED, "Blinded", "#6b7280")
        tag(Ids.TAG_GRUDGE, "Grudge", "#f97316")
        tag(Ids.TAG_ORACLE, "Oracle", "#06b6d4")
        tag(Ids.TAG_HOME, "Home", "#eab308")
        tag(Ids.TAG_CURSED, "Cursed", "#7c3aed")
        tag(Ids.TAG_ENDGAME, "Endgame", "#dc2626")
    }

    private fun insertLocations() {
        location(
            Ids.LOC_MORTAL_REALM, "Mortal Realm", "Plane",
            "The world of mortals, where gods meddle in human affairs and heroes carve their " +
                "legends into history.",
        )
        location(
            Ids.LOC_DIVINE_REALM, "Divine Realm", "Plane",
            "The realm of the gods, where immortals watch over mortals and occasionally " +
                "intervene in their fates.",
            tags = listOf(Ids.TAG_DIVINE),
        )
        location(
            Ids.LOC_AEGEAN_SEA, "The Aegean Sea", "Territory",
            "The wine-dark sea, home to countless islands and the treacherous waters Odysseus " +
                "must navigate to return home.",
            parentId = Ids.LOC_MORTAL_REALM,
        )
        location(
            Ids.LOC_ITHACA, "Ithaca", "Locale",
            "The rocky island kingdom of Odysseus. His faithful wife Penelope waits here, beset " +
                "by suitors who believe him dead. Home. The goal.",
            parentId = Ids.LOC_AEGEAN_SEA,
            tags = listOf(Ids.TAG_HOME, Ids.TAG_ENDGAME),
        )
        location(
            Ids.LOC_TROY, "Troy", "Locale",
            "The fallen city. After ten years of war, Troy lies in ruins. The Greeks have won, " +
                "but the journey home will prove just as perilous as the war itself.",
            parentId = Ids.LOC_AEGEAN_SEA,
        )
        location(
            Ids.LOC_CYCLOPS_ISLAND, "Cyclops Island", "Locale",
            "A wild island inhabited by the Cyclopes—giant one-eyed shepherds who know " +
                "nothing of laws, ships, or the sacred bonds of hospitality. Polyphemus dwells " +
                "here in his cave.",
            parentId = Ids.LOC_AEGEAN_SEA,
            tags = listOf(Ids.TAG_HOSTILE),
        )
        location(
            Ids.LOC_SIRENS_STRAIT, "Sirens' Strait", "Locale",
            "A narrow passage flanked by jagged rocks where the Sirens sing. Their voices are " +
                "irresistible—sailors who hear them steer toward the sound and wreck upon " +
                "the shore.",
            parentId = Ids.LOC_AEGEAN_SEA,
            tags = listOf(Ids.TAG_MAGIC, Ids.TAG_HOSTILE),
        )
        location(
            Ids.LOC_AEOLIA, "Aeolia", "Locale",
            "The floating island of Aeolus, keeper of the winds. Bronze walls surround this " +
                "impossible place where the wind god lives with his twelve children.",
            parentId = Ids.LOC_MORTAL_REALM,
            tags = listOf(Ids.TAG_DIVINE, Ids.TAG_ALLY),
        )
        location(
            Ids.LOC_AEAEA, "Aeaea", "Locale",
            "Circe's island, shrouded in mist. Wild wolves and lions roam the forests, tame as " +
                "dogs—former men transformed by the witch's magic. Her palace lies at the " +
                "island's heart.",
            parentId = Ids.LOC_MORTAL_REALM,
            tags = listOf(Ids.TAG_MAGIC),
        )
        location(
            Ids.LOC_OGYGIA, "Ogygia", "Locale",
            "Calypso's hidden island, a paradise at the edge of the world. The nymph keeps " +
                "Odysseus here for seven years, offering immortality if he will stay forever.",
            parentId = Ids.LOC_MORTAL_REALM,
            tags = listOf(Ids.TAG_DIVINE),
        )
        location(
            Ids.LOC_MOUNT_OLYMPUS, "Mount Olympus", "Locale",
            "The seat of the gods, rising above the clouds. Here Zeus holds court and the " +
                "Olympians debate the fates of mortals. Athena advocates for Odysseus from " +
                "these halls.",
            parentId = Ids.LOC_DIVINE_REALM,
            tags = listOf(Ids.TAG_DIVINE),
        )
        location(
            Ids.LOC_UNDERWORLD, "The Underworld", "Locale",
            "The realm of the dead, ruled by Hades. Odysseus must journey here to consult the " +
                "blind prophet Tiresias. The shades of the dead gather at the blood-offering, " +
                "desperate to speak.",
            parentId = Ids.LOC_DIVINE_REALM,
            tags = listOf(Ids.TAG_DIVINE, Ids.TAG_ORACLE),
        )
    }

    private fun insertNpcs() {
        npc(
            Ids.NPC_ODYSSEUS, "Odysseus", "Human", "King of Ithaca",
            "The cunning hero of Troy, architect of the wooden horse. Now he seeks only to " +
                "return home to his wife and son. But the gods have other plans, and his own " +
                "cleverness often makes things worse.",
            locations = listOf(Ids.LOC_ITHACA),
            tags = listOf(Ids.TAG_ALLY),
        )
        npc(
            Ids.NPC_EURYLOCHUS, "Eurylochus", "Human", "Second-in-Command",
            "Odysseus's brother-in-law and most trusted lieutenant. Cautious where Odysseus is " +
                "bold, he often counsels retreat—sometimes wisely, sometimes not. The crew " +
                "listens to him when the captain's judgment seems reckless.",
            tags = listOf(Ids.TAG_ALLY),
        )
        npc(
            Ids.NPC_PENELOPE, "Penelope", "Human", "Queen of Ithaca",
            "Faithful wife of Odysseus, waiting twenty years for his return. She holds off the " +
                "suitors with her own cunning—weaving a shroud by day, unraveling it by " +
                "night. As clever as her husband, in her own way.",
            locations = listOf(Ids.LOC_ITHACA),
            tags = listOf(Ids.TAG_ALLY, Ids.TAG_HOME),
        )
        npc(
            Ids.NPC_POLYPHEMUS, "Polyphemus", "Cyclops", "Son of Poseidon",
            "A one-eyed giant who tends sheep on his island. He has no regard for the laws of " +
                "hospitality—or for the lives of sailors who stumble into his cave. Now " +
                "blinded by Odysseus's cunning, he has called down his father's curse.",
            locations = listOf(Ids.LOC_CYCLOPS_ISLAND),
            tags = listOf(Ids.TAG_HOSTILE, Ids.TAG_BLINDED, Ids.TAG_DIVINE),
        )
        npc(
            Ids.NPC_POSEIDON, "Poseidon", "God", "God of the Sea",
            "Earth-Shaker, lord of the wine-dark sea. Father of Polyphemus. Since Odysseus " +
                "blinded his son, Poseidon has sworn that the hero will never reach home " +
                "easily. Every storm, every shipwreck, every delay—the sea god's wrath.",
            locations = listOf(Ids.LOC_DIVINE_REALM),
            tags = listOf(Ids.TAG_DIVINE, Ids.TAG_HOSTILE, Ids.TAG_GRUDGE),
        )
        npc(
            Ids.NPC_CIRCE, "Circe", "Nymph", "Witch of Aeaea",
            "A powerful sorceress who transforms men into swine. She first enchants half of " +
                "Odysseus's crew, but when he resists her magic (with Hermes's help), she " +
                "becomes an ally and lover. She guides him to the Underworld.",
            locations = listOf(Ids.LOC_AEAEA),
            tags = listOf(Ids.TAG_MAGIC, Ids.TAG_ALLY),
        )
        npc(
            Ids.NPC_CALYPSO, "Calypso", "Nymph", "Goddess of Ogygia",
            "A beautiful nymph who keeps Odysseus on her island for seven years, offering him " +
                "immortality if he will stay as her husband. She loves him truly, but he yearns " +
                "for home. When Zeus commands it, she reluctantly lets him go.",
            locations = listOf(Ids.LOC_OGYGIA),
            tags = listOf(Ids.TAG_DIVINE),
        )
        npc(
            Ids.NPC_ATHENA, "Athena", "God", "Goddess of Wisdom",
            "Grey-eyed Athena, goddess of wisdom and war. She favors Odysseus above all mortals " +
                "for his cunning mind. Throughout his journey, she advocates for him on Olympus " +
                "and aids him in disguise. His greatest divine ally.",
            locations = listOf(Ids.LOC_MOUNT_OLYMPUS),
            tags = listOf(Ids.TAG_DIVINE, Ids.TAG_ALLY),
        )
        npc(
            Ids.NPC_TIRESIAS, "Tiresias", "Shade", "Blind Prophet",
            "The legendary seer of Thebes, now a shade in the Underworld. Even in death, he " +
                "retains his prophetic gift. Odysseus must consult him to learn the way " +
                "home—and hear warnings about the trials yet to come.",
            locations = listOf(Ids.LOC_UNDERWORLD),
            tags = listOf(Ids.TAG_ORACLE, Ids.TAG_DIVINE),
        )
        npc(
            Ids.NPC_AEOLUS, "Aeolus", "Demigod", "Keeper of the Winds",
            "Master of the winds, appointed by Zeus to calm or unleash storms. He lives on the " +
                "floating island of Aeolia with his twelve children. He gifts Odysseus a bag " +
                "containing all contrary winds—a gift the crew foolishly opens.",
            locations = listOf(Ids.LOC_AEOLIA),
            tags = listOf(Ids.TAG_DIVINE, Ids.TAG_ALLY),
        )
    }

    private fun insertItems() {
        item(
            Ids.ITEM_BAG_OF_WINDS, "Bag of Winds",
            "A leather bag given by Aeolus, containing all the winds contrary to Odysseus's " +
                "course home. With only the West Wind free to blow, the ship could reach Ithaca " +
                "in days. But the crew, thinking it held treasure, opened it within sight of " +
                "home—and the escaping winds blew them back across the sea.",
            value = "Priceless (divine gift)",
            ownerId = Ids.NPC_AEOLUS,
            locationId = Ids.LOC_AEOLIA,
            tags = listOf(Ids.TAG_MAGIC, Ids.TAG_DIVINE, Ids.TAG_CURSED),
        )
        item(
            Ids.ITEM_MOLY_HERB, "Moly",
            "A magical herb with a black root and white flower, given to Odysseus by Hermes. " +
                "It protects against Circe's transformation magic, allowing him to resist her " +
                "enchantments and force her to restore his crew from their pig forms.",
            value = "Divine (gift from Hermes)",
            ownerId = Ids.NPC_ODYSSEUS,
            locationId = Ids.LOC_AEAEA,
            tags = listOf(Ids.TAG_MAGIC, Ids.TAG_DIVINE),
        )
        item(
            Ids.ITEM_BOW_OF_ODYSSEUS, "Bow of Odysseus",
            "The great bow of Odysseus, left behind in Ithaca when he sailed for Troy. No " +
                "suitor can string it. In the final contest, Odysseus—disguised as a " +
                "beggar—strings the bow with ease and uses it to slaughter the suitors " +
                "who have plagued his house.",
            value = "Heirloom (irreplaceable)",
            ownerId = Ids.NPC_ODYSSEUS,
            locationId = Ids.LOC_ITHACA,
            tags = listOf(Ids.TAG_ENDGAME, Ids.TAG_HOME),
        )
    }

    private fun insertSessionLog() {
        db.session_logsQueries.insertSessionLog(
            id = Ids.SESSION_CYCLOPS_ENCOUNTER,
            title = "Session 3: Nobody's Clever Plan",
            date = "2024-01-15",
            content = SESSION_CONTENT,
            mentions_json = "[]",
            summary = "The crew lands on Cyclops Island. Odysseus insists on meeting the " +
                "\"host,\" leading to imprisonment in Polyphemus's cave. Two men are eaten. " +
                "Using wine and cunning, Odysseus blinds the Cyclops and escapes under the " +
                "sheep. But his pride compels him to reveal his true name, bringing down " +
                "Poseidon's curse.",
            key_decisions = "• Waited in the cave instead of taking supplies and leaving\n" +
                "• Told Polyphemus his name was \"Nobody\"\n" +
                "• Revealed his true identity while escaping",
            outcomes = "• Polyphemus blinded (permanent consequence)\n" +
                "• Poseidon's curse invoked (campaign-long antagonist)\n" +
                "• Two crew members dead\n" +
                "• Escaped the island but lost the gods' favor",
            campaign_id = Ids.CAMPAIGN,
            hlc = HLC, created = TS, updated = TS,
        )
        db.joinsQueries.insertSessionLocation(Ids.SESSION_CYCLOPS_ENCOUNTER, Ids.LOC_CYCLOPS_ISLAND)
        db.joinsQueries.insertSessionNpc(Ids.SESSION_CYCLOPS_ENCOUNTER, Ids.NPC_ODYSSEUS)
        db.joinsQueries.insertSessionNpc(Ids.SESSION_CYCLOPS_ENCOUNTER, Ids.NPC_POLYPHEMUS)
        db.joinsQueries.insertSessionNpc(Ids.SESSION_CYCLOPS_ENCOUNTER, Ids.NPC_POSEIDON)
        db.joinsQueries.insertSessionTag(Ids.SESSION_CYCLOPS_ENCOUNTER, Ids.TAG_HOSTILE)
        db.joinsQueries.insertSessionTag(Ids.SESSION_CYCLOPS_ENCOUNTER, Ids.TAG_GRUDGE)
        db.joinsQueries.insertSessionTag(Ids.SESSION_CYCLOPS_ENCOUNTER, Ids.TAG_BLINDED)
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Row helpers
    // ─────────────────────────────────────────────────────────────────────────

    private fun tag(id: String, name: String, color: String) {
        db.tagsQueries.insertTag(
            id = id, name = name, color = color, scope = "continuity",
            continuity_id = Ids.CONTINUITY, campaign_id = null, origin_id = null,
            origin_continuity_id = null, forked_at = null, hlc = HLC, created = TS, updated = TS,
        )
    }

    private fun location(
        id: String,
        name: String,
        type: String,
        description: String,
        parentId: String? = null,
        tags: List<String> = emptyList(),
    ) {
        db.locationsQueries.insertLocation(
            id = id, name = name, type = type, description = description, status = "complete",
            parent_id = parentId, map_hash = null, scope = "continuity",
            continuity_id = Ids.CONTINUITY, origin_id = null, origin_continuity_id = null,
            forked_at = null, hlc = HLC, created = TS, updated = TS,
        )
        db.joinsQueries.insertLocationCampaign(location_id = id, campaign_id = Ids.CAMPAIGN)
        for (tagId in tags) db.joinsQueries.insertLocationTag(location_id = id, tag_id = tagId)
    }

    private fun npc(
        id: String,
        name: String,
        race: String,
        role: String,
        background: String,
        locations: List<String> = emptyList(),
        tags: List<String> = emptyList(),
    ) {
        db.npcsQueries.insertNpc(
            id = id, name = name, race = race, role = role, background = background,
            status = "complete", image_hash = null, scope = "continuity",
            continuity_id = Ids.CONTINUITY, origin_id = null, origin_continuity_id = null,
            forked_at = null, hlc = HLC, created = TS, updated = TS,
        )
        db.joinsQueries.insertNpcCampaign(npc_id = id, campaign_id = Ids.CAMPAIGN)
        for (locId in locations) db.joinsQueries.insertNpcLocation(npc_id = id, location_id = locId)
        for (tagId in tags) db.joinsQueries.insertNpcTag(npc_id = id, tag_id = tagId)
    }

    private fun item(
        id: String,
        name: String,
        description: String,
        value: String,
        ownerId: String?,
        locationId: String?,
        tags: List<String> = emptyList(),
    ) {
        db.itemsQueries.insertItem(
            id = id, name = name, description = description, value_ = value,
            status = "complete", scope = "continuity", continuity_id = Ids.CONTINUITY,
            owner_id = ownerId, owner_type = if (ownerId != null) "npc" else null,
            location_id = locationId, hlc = HLC, created = TS, updated = TS,
        )
        db.joinsQueries.insertItemCampaign(item_id = id, campaign_id = Ids.CAMPAIGN)
        for (tagId in tags) db.joinsQueries.insertItemTag(item_id = id, tag_id = tagId)
    }

    private companion object {
        const val TS = "2024-01-01T00:00:00.000Z"
        const val HLC = "0.0.seed"

        fun mention(trigger: String, label: String, entityId: String): String =
            "{$trigger}[$label]($entityId)"

        val ODYSSEUS get() = mention("@", "Odysseus", Ids.NPC_ODYSSEUS)
        val POLYPHEMUS get() = mention("@", "Polyphemus", Ids.NPC_POLYPHEMUS)
        val POSEIDON get() = mention("@", "Poseidon", Ids.NPC_POSEIDON)

        /** Session content written from the perspective of Eurylochus (parity with Expo). */
        val SESSION_CONTENT = """
We made landfall on an unknown island. Sheep everywhere—fat ones, well-tended. I said we should take what we needed and go. $ODYSSEUS wanted to wait. "Let's meet our host," he said. "Perhaps he'll give us gifts."

Our host was $POLYPHEMUS.

The cave was massive. Cheese wheels stacked to the ceiling, pens full of lambs. We could have taken plenty and been gone before dark. But $ODYSSEUS insisted we wait. Hospitality, he said. The sacred bond between guest and host.

The Cyclops returned at dusk, driving his flocks inside. Then he sealed the entrance with a boulder twenty men couldn't shift. Only then did he notice us.

"Strangers," he rumbled. "Who are you? Merchants? Pirates?"

$ODYSSEUS gave our best speech about Zeus protecting travelers. $POLYPHEMUS laughed. He snatched up Antiphus and Opheltes—dashed their brains out on the stones—and ate them raw. Then he slept.

We couldn't kill him in the night. Only $POLYPHEMUS could move the boulder.

The next evening, $ODYSSEUS offered him wine. Strong wine, unmixed with water. The giant drank deep. "What's your name, stranger?" he slurred. "I'll give you a guest-gift."

"My name is Nobody," said $ODYSSEUS. "Nobody is my name."

When $POLYPHEMUS passed out, we heated a stake in the fire and drove it into his eye.

His screams brought the other Cyclopes to the cave mouth. "Who's hurting you, brother?"

"Nobody!" he bellowed. "Nobody is killing me!"

They left, muttering about madness and the will of the gods.

At dawn, $POLYPHEMUS rolled back the boulder to let his sheep out, feeling each one's back to make sure we weren't riding them. We clung to their bellies instead.

We ran for the ship. We were rowing hard for open water when $ODYSSEUS couldn't resist.

"Cyclops! If anyone asks who blinded you, tell them it was $ODYSSEUS, sacker of cities, son of Laertes, king of Ithaca!"

$POLYPHEMUS hurled boulders at the sound of his voice. One nearly swamped us. Then he raised his arms to the sky.

"Father $POSEIDON, hear me! Grant that $ODYSSEUS never reaches home—or if he must, let him arrive late, alone, in a stranger's ship, to find trouble in his house!"

The sea churned. Storm clouds gathered on the horizon.

We have escaped the cave. But I fear we have made an enemy far worse than any Cyclops.
""".trimIndent()
    }
}
