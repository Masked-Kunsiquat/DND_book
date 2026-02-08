/**
 * Image asset paths for Odyssey seed data.
 * Uses require() for bundled assets.
 */

// NPC portraits
export const NPC_IMAGES = {
  odysseus: require('../../../assets/seed-data/NPC/odysseus.png'),
  eurylochus: require('../../../assets/seed-data/NPC/eurylochus.png'),
  polyphemus: require('../../../assets/seed-data/NPC/polyphemus.png'),
  circe: require('../../../assets/seed-data/NPC/circe.png'),
  calypso: require('../../../assets/seed-data/NPC/calypso.png'),
  tiresias: require('../../../assets/seed-data/NPC/tiresias.png'),
  aeolus: require('../../../assets/seed-data/NPC/aeolus.png'),
  poseidon: require('../../../assets/seed-data/NPC/poseidon.png'),
  athena: require('../../../assets/seed-data/NPC/athena.png'),
  penelope: require('../../../assets/seed-data/NPC/penelope.png'),
} as const;

// Location images
export const LOCATION_IMAGES = {
  aegeanSea: require('../../../assets/seed-data/location/aegean_sea.png'),
  ithaca: require('../../../assets/seed-data/location/ithica.png'),
  troy: require('../../../assets/seed-data/location/troy.png'),
  cyclopsIsland: require('../../../assets/seed-data/location/cyclops-island.png'),
  sirensStrait: require('../../../assets/seed-data/location/sirens-strait.png'),
  aeolia: require('../../../assets/seed-data/location/aeolia.png'),
  aeaea: require('../../../assets/seed-data/location/aeaea.png'),
  ogygia: require('../../../assets/seed-data/location/ogygia.png'),
  mountOlympus: require('../../../assets/seed-data/location/mount-olympus.png'),
  underworld: require('../../../assets/seed-data/location/underworld.png'),
} as const;

// Item images
export const ITEM_IMAGES = {
  bagOfWinds: require('../../../assets/seed-data/items/bag-of-winds.png'),
  molyHerb: require('../../../assets/seed-data/items/moly-herb.png'),
  bowOfOdysseus: require('../../../assets/seed-data/items/bow-of-odysseus.png'),
} as const;
