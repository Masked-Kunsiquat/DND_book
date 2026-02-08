/**
 * Image asset paths for Odyssey seed data.
 * Uses require() for bundled assets and resolves to URIs.
 */

import { Image } from 'react-native';

type ImageSource = ReturnType<typeof require>;

/**
 * Resolves a require()'d image asset to a URI string.
 * Works in both development and production.
 */
function resolveAssetUri(source: ImageSource): string {
  const resolved = Image.resolveAssetSource(source);
  return resolved?.uri || '';
}

// NPC portraits (raw asset IDs)
const NPC_ASSETS = {
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

// Location images (raw asset IDs)
const LOCATION_ASSETS = {
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

// Item images (raw asset IDs)
const ITEM_ASSETS = {
  bagOfWinds: require('../../../assets/seed-data/items/bag-of-winds.png'),
  molyHerb: require('../../../assets/seed-data/items/moly-herb.png'),
  bowOfOdysseus: require('../../../assets/seed-data/items/bow-of-odysseus.png'),
} as const;

// Legacy exports (raw asset IDs) - for direct use with Image component
export const NPC_IMAGES = NPC_ASSETS;
export const LOCATION_IMAGES = LOCATION_ASSETS;
export const ITEM_IMAGES = ITEM_ASSETS;

/**
 * Get resolved URI strings for NPC images.
 * Call this at runtime to get URIs for database storage.
 */
export function getNpcImageUris(): Record<keyof typeof NPC_ASSETS, string> {
  return {
    odysseus: resolveAssetUri(NPC_ASSETS.odysseus),
    eurylochus: resolveAssetUri(NPC_ASSETS.eurylochus),
    polyphemus: resolveAssetUri(NPC_ASSETS.polyphemus),
    circe: resolveAssetUri(NPC_ASSETS.circe),
    calypso: resolveAssetUri(NPC_ASSETS.calypso),
    tiresias: resolveAssetUri(NPC_ASSETS.tiresias),
    aeolus: resolveAssetUri(NPC_ASSETS.aeolus),
    poseidon: resolveAssetUri(NPC_ASSETS.poseidon),
    athena: resolveAssetUri(NPC_ASSETS.athena),
    penelope: resolveAssetUri(NPC_ASSETS.penelope),
  };
}

/**
 * Get resolved URI strings for location images.
 * Call this at runtime to get URIs for database storage.
 */
export function getLocationImageUris(): Record<keyof typeof LOCATION_ASSETS, string> {
  return {
    aegeanSea: resolveAssetUri(LOCATION_ASSETS.aegeanSea),
    ithaca: resolveAssetUri(LOCATION_ASSETS.ithaca),
    troy: resolveAssetUri(LOCATION_ASSETS.troy),
    cyclopsIsland: resolveAssetUri(LOCATION_ASSETS.cyclopsIsland),
    sirensStrait: resolveAssetUri(LOCATION_ASSETS.sirensStrait),
    aeolia: resolveAssetUri(LOCATION_ASSETS.aeolia),
    aeaea: resolveAssetUri(LOCATION_ASSETS.aeaea),
    ogygia: resolveAssetUri(LOCATION_ASSETS.ogygia),
    mountOlympus: resolveAssetUri(LOCATION_ASSETS.mountOlympus),
    underworld: resolveAssetUri(LOCATION_ASSETS.underworld),
  };
}

/**
 * Get resolved URI strings for item images.
 * Call this at runtime to get URIs for database storage.
 */
export function getItemImageUris(): Record<keyof typeof ITEM_ASSETS, string> {
  return {
    bagOfWinds: resolveAssetUri(ITEM_ASSETS.bagOfWinds),
    molyHerb: resolveAssetUri(ITEM_ASSETS.molyHerb),
    bowOfOdysseus: resolveAssetUri(ITEM_ASSETS.bowOfOdysseus),
  };
}
