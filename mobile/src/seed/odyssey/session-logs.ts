/**
 * Odyssey demo session log seed data.
 * This session demonstrates the mention system, key decisions, and consequence tracking.
 */

import type { SessionLogRow } from '../../types/schema';
import { LOCATION_IDS, NPC_IDS, SEED_CAMPAIGN_ID, SESSION_IDS, TAG_IDS } from '../types';

const SEED_TIMESTAMP = '2024-01-01T00:00:00.000Z';

const campaignIds = JSON.stringify([SEED_CAMPAIGN_ID]);

/**
 * Helper to create a mention token in react-native-controlled-mentions format.
 * Format: {trigger}[label](entityId)
 */
function mention(trigger: string, label: string, entityId: string): string {
  return `{${trigger}}[${label}](${entityId})`;
}

// Shorthand for NPC mentions
const odysseus = () => mention('@', 'Odysseus', NPC_IDS.odysseus);
const polyphemus = () => mention('@', 'Polyphemus', NPC_IDS.polyphemus);
const poseidon = () => mention('@', 'Poseidon', NPC_IDS.poseidon);

/**
 * Session log content written from the perspective of Eurylochus.
 * Uses react-native-controlled-mentions format: {trigger}[label](id)
 */
const sessionContent = `We made landfall on an unknown island. Sheep everywhere—fat ones, well-tended. I said we should take what we needed and go. ${odysseus()} wanted to wait. "Let's meet our host," he said. "Perhaps he'll give us gifts."

Our host was ${polyphemus()}.

The cave was massive. Cheese wheels stacked to the ceiling, pens full of lambs. We could have taken plenty and been gone before dark. But ${odysseus()} insisted we wait. Hospitality, he said. The sacred bond between guest and host.

The Cyclops returned at dusk, driving his flocks inside. Then he sealed the entrance with a boulder twenty men couldn't shift. Only then did he notice us.

"Strangers," he rumbled. "Who are you? Merchants? Pirates?"

${odysseus()} gave our best speech about Zeus protecting travelers. ${polyphemus()} laughed. He snatched up Antiphus and Opheltes—dashed their brains out on the stones—and ate them raw. Then he slept.

We couldn't kill him in the night. Only ${polyphemus()} could move the boulder.

The next evening, ${odysseus()} offered him wine. Strong wine, unmixed with water. The giant drank deep. "What's your name, stranger?" he slurred. "I'll give you a guest-gift."

"My name is Nobody," said ${odysseus()}. "Nobody is my name."

When ${polyphemus()} passed out, we heated a stake in the fire and drove it into his eye.

His screams brought the other Cyclopes to the cave mouth. "Who's hurting you, brother?"

"Nobody!" he bellowed. "Nobody is killing me!"

They left, muttering about madness and the will of the gods.

At dawn, ${polyphemus()} rolled back the boulder to let his sheep out, feeling each one's back to make sure we weren't riding them. We clung to their bellies instead.

We ran for the ship. We were rowing hard for open water when ${odysseus()} couldn't resist.

"Cyclops! If anyone asks who blinded you, tell them it was ${odysseus()}, sacker of cities, son of Laertes, king of Ithaca!"

${polyphemus()} hurled boulders at the sound of his voice. One nearly swamped us. Then he raised his arms to the sky.

"Father ${poseidon()}, hear me! Grant that ${odysseus()} never reaches home—or if he must, let him arrive late, alone, in a stranger's ship, to find trouble in his house!"

The sea churned. Storm clouds gathered on the horizon.

We have escaped the cave. But I fear we have made an enemy far worse than any Cyclops.`;

export const seedSessionLogs: SessionLogRow[] = [
  {
    id: SESSION_IDS.cyclopsEncounter,
    title: "Session 3: Nobody's Clever Plan",
    date: '2024-01-15',
    content: sessionContent,
    mentions: '[]', // Mentions are encoded inline in content using {trigger}[label](id) format
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
