/**
 * Odyssey demo session log seed data.
 * This session demonstrates the mention system, key decisions, and consequence tracking.
 */

import type { SessionLogRow } from '../../types/schema';
import type { Mention } from '../../types/schema';
import {
  LOCATION_IDS,
  NPC_IDS,
  SEED_CAMPAIGN_ID,
  SESSION_IDS,
  TAG_IDS,
} from '../types';

const SEED_TIMESTAMP = '2024-01-01T00:00:00.000Z';

const campaignIds = JSON.stringify([SEED_CAMPAIGN_ID]);

/**
 * Session log content written from the perspective of Eurylochus.
 * Demonstrates @mentions for NPCs and locations.
 */
const sessionContent = `We made landfall on an unknown island. Sheep everywhere—fat ones, well-tended. I said we should take what we needed and go. @Odysseus wanted to wait. "Let's meet our host," he said. "Perhaps he'll give us gifts."

Our host was @Polyphemus.

The cave was massive. Cheese wheels stacked to the ceiling, pens full of lambs. We could have taken plenty and been gone before dark. But @Odysseus insisted we wait. Hospitality, he said. The sacred bond between guest and host.

The Cyclops returned at dusk, driving his flocks inside. Then he sealed the entrance with a boulder twenty men couldn't shift. Only then did he notice us.

"Strangers," he rumbled. "Who are you? Merchants? Pirates?"

@Odysseus gave our best speech about Zeus protecting travelers. @Polyphemus laughed. He snatched up Antiphus and Opheltes—dashed their brains out on the stones—and ate them raw. Then he slept.

We couldn't kill him in the night. Only @Polyphemus could move the boulder.

The next evening, @Odysseus offered him wine. Strong wine, unmixed with water. The giant drank deep. "What's your name, stranger?" he slurred. "I'll give you a guest-gift."

"My name is Nobody," said @Odysseus. "Nobody is my name."

When @Polyphemus passed out, we heated a stake in the fire and drove it into his eye.

His screams brought the other Cyclopes to the cave mouth. "Who's hurting you, brother?"

"Nobody!" he bellowed. "Nobody is killing me!"

They left, muttering about madness and the will of the gods.

At dawn, @Polyphemus rolled back the boulder to let his sheep out, feeling each one's back to make sure we weren't riding them. We clung to their bellies instead.

We ran for the ship. We were rowing hard for open water when @Odysseus couldn't resist.

"Cyclops! If anyone asks who blinded you, tell them it was @Odysseus, sacker of cities, son of Laertes, king of Ithaca!"

@Polyphemus hurled boulders at the sound of his voice. One nearly swamped us. Then he raised his arms to the sky.

"Father @Poseidon, hear me! Grant that @Odysseus never reaches home—or if he must, let him arrive late, alone, in a stranger's ship, to find trouble in his house!"

The sea churned. Storm clouds gathered on the horizon.

We have escaped the cave. But I fear we have made an enemy far worse than any Cyclops.`;

/**
 * Mentions extracted from the session content.
 * These demonstrate the @mention system for NPCs.
 */
const mentions: Mention[] = [
  {
    id: 'mention-1',
    trigger: '@',
    entityType: 'npc',
    entityId: NPC_IDS.odysseus,
    displayLabel: 'Odysseus',
    position: { start: 123, end: 132 },
    status: 'resolved',
  },
  {
    id: 'mention-2',
    trigger: '@',
    entityType: 'npc',
    entityId: NPC_IDS.polyphemus,
    displayLabel: 'Polyphemus',
    position: { start: 213, end: 224 },
    status: 'resolved',
  },
  {
    id: 'mention-3',
    trigger: '@',
    entityType: 'npc',
    entityId: NPC_IDS.odysseus,
    displayLabel: 'Odysseus',
    position: { start: 378, end: 387 },
    status: 'resolved',
  },
  {
    id: 'mention-4',
    trigger: '@',
    entityType: 'npc',
    entityId: NPC_IDS.polyphemus,
    displayLabel: 'Polyphemus',
    position: { start: 580, end: 591 },
    status: 'resolved',
  },
  {
    id: 'mention-5',
    trigger: '@',
    entityType: 'npc',
    entityId: NPC_IDS.odysseus,
    displayLabel: 'Odysseus',
    position: { start: 652, end: 661 },
    status: 'resolved',
  },
  {
    id: 'mention-6',
    trigger: '@',
    entityType: 'npc',
    entityId: NPC_IDS.polyphemus,
    displayLabel: 'Polyphemus',
    position: { start: 892, end: 903 },
    status: 'resolved',
  },
  {
    id: 'mention-7',
    trigger: '@',
    entityType: 'npc',
    entityId: NPC_IDS.odysseus,
    displayLabel: 'Odysseus',
    position: { start: 1089, end: 1098 },
    status: 'resolved',
  },
  {
    id: 'mention-8',
    trigger: '@',
    entityType: 'npc',
    entityId: NPC_IDS.polyphemus,
    displayLabel: 'Polyphemus',
    position: { start: 1312, end: 1323 },
    status: 'resolved',
  },
  {
    id: 'mention-9',
    trigger: '@',
    entityType: 'npc',
    entityId: NPC_IDS.odysseus,
    displayLabel: 'Odysseus',
    position: { start: 1512, end: 1521 },
    status: 'resolved',
  },
  {
    id: 'mention-10',
    trigger: '@',
    entityType: 'npc',
    entityId: NPC_IDS.odysseus,
    displayLabel: 'Odysseus',
    position: { start: 1578, end: 1587 },
    status: 'resolved',
  },
  {
    id: 'mention-11',
    trigger: '@',
    entityType: 'npc',
    entityId: NPC_IDS.polyphemus,
    displayLabel: 'Polyphemus',
    position: { start: 1645, end: 1656 },
    status: 'resolved',
  },
  {
    id: 'mention-12',
    trigger: '@',
    entityType: 'npc',
    entityId: NPC_IDS.poseidon,
    displayLabel: 'Poseidon',
    position: { start: 1732, end: 1741 },
    status: 'resolved',
  },
  {
    id: 'mention-13',
    trigger: '@',
    entityType: 'npc',
    entityId: NPC_IDS.odysseus,
    displayLabel: 'Odysseus',
    position: { start: 1765, end: 1774 },
    status: 'resolved',
  },
];

export const seedSessionLogs: SessionLogRow[] = [
  {
    id: SESSION_IDS.cyclopsEncounter,
    title: "Session 3: Nobody's Clever Plan",
    date: '2024-01-15',
    content: sessionContent,
    mentions: JSON.stringify(mentions),
    summary:
      'The crew lands on Cyclops Island. Odysseus insists on meeting the "host," leading to imprisonment in Polyphemus\'s cave. Two men are eaten. Using wine and cunning, Odysseus blinds the Cyclops and escapes under the sheep. But his pride compels him to reveal his true name, bringing down Poseidon\'s curse.',
    keyDecisions:
      '• Waited in the cave instead of taking supplies and leaving\n• Told Polyphemus his name was "Nobody"\n• Revealed his true identity while escaping',
    outcomes:
      '• Polyphemus blinded (permanent consequence)\n• Poseidon\'s curse invoked (campaign-long antagonist)\n• Two crew members dead\n• Escaped the island but lost the gods\' favor',
    campaignIds,
    locationIds: JSON.stringify([LOCATION_IDS.cyclopsIsland]),
    npcIds: JSON.stringify([NPC_IDS.odysseus, NPC_IDS.polyphemus, NPC_IDS.poseidon]),
    noteIds: '[]',
    playerCharacterIds: '[]',
    itemIds: '[]',
    tagIds: JSON.stringify([TAG_IDS.hostile, TAG_IDS.grudge, TAG_IDS.blinded]),
    created: SEED_TIMESTAMP,
    updated: SEED_TIMESTAMP,
  },
];
