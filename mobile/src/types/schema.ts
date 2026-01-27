/**
 * TypeScript types for TinyBase store schema.
 * Derived from PocketBase collections but simplified for local-first usage.
 */

// Base types
export type IsoDateString = string;
export type RecordId = string;

export type EntityScope = 'campaign' | 'continuity';

// Location hierarchy types
export type LocationType =
  | 'Plane'
  | 'Realm'
  | 'Continent'
  | 'Territory'
  | 'Province'
  | 'Locale'
  | 'Landmark';

// Core entity types (what we store in TinyBase)

export interface Campaign {
  id: RecordId;
  name: string;
  continuityId: RecordId;
  created: IsoDateString;
  updated: IsoDateString;
}

export interface Note {
  id: RecordId;
  title: string;
  content: string;
  scope: EntityScope;
  continuityId: RecordId;
  campaignId: RecordId;
  originId: RecordId;
  originContinuityId: RecordId;
  forkedAt: IsoDateString;
  locationIds: RecordId[]; // stored as JSON string in TinyBase
  tagIds: RecordId[];
  created: IsoDateString;
  updated: IsoDateString;
}

export interface Npc {
  id: RecordId;
  name: string;
  race: string;
  role: string;
  background: string;
  image: string; // local file path
  scope: EntityScope;
  continuityId: RecordId;
  originId: RecordId;
  originContinuityId: RecordId;
  forkedAt: IsoDateString;
  campaignIds: RecordId[];
  locationIds: RecordId[];
  noteIds: RecordId[];
  tagIds: RecordId[];
  created: IsoDateString;
  updated: IsoDateString;
}

export interface Location {
  id: RecordId;
  name: string;
  type: LocationType;
  description: string;
  parentId: RecordId; // for hierarchy
  scope: EntityScope;
  continuityId: RecordId;
  originId: RecordId;
  originContinuityId: RecordId;
  forkedAt: IsoDateString;
  campaignIds: RecordId[];
  tagIds: RecordId[];
  map: string; // local file path
  images: string[]; // local file paths
  created: IsoDateString;
  updated: IsoDateString;
}

export interface Continuity {
  id: RecordId;
  name: string;
  description: string;
  created: IsoDateString;
  updated: IsoDateString;
}

export interface Tag {
  id: RecordId;
  name: string;
  color: string;
  scope: EntityScope;
  continuityId: RecordId;
  campaignId: RecordId;
  originId: RecordId;
  originContinuityId: RecordId;
  forkedAt: IsoDateString;
  created: IsoDateString;
  updated: IsoDateString;
}

export interface SessionLog {
  id: RecordId;
  title: string;
  date: IsoDateString;
  summary: string;
  keyDecisions: string;
  outcomes: string;
  campaignIds: RecordId[];
  locationIds: RecordId[];
  npcIds: RecordId[];
  noteIds: RecordId[];
  playerCharacterIds: RecordId[];
  tagIds: RecordId[];
  created: IsoDateString;
  updated: IsoDateString;
}

export interface PlayerCharacter {
  id: RecordId;
  name: string;
  player: string;
  race: string;
  class: string;
  background: string;
  image: string;
  campaignIds: RecordId[];
  noteIds: RecordId[];
  created: IsoDateString;
  updated: IsoDateString;
}

export interface PlayerCharacterTemplate {
  id: RecordId;
  name: string;
  player: string;
  race: string;
  class: string;
  background: string;
  image: string;
  continuityId: RecordId;
  originId: RecordId;
  originContinuityId: RecordId;
  forkedAt: IsoDateString;
  created: IsoDateString;
  updated: IsoDateString;
}

// TinyBase row types (all values are strings - arrays stored as JSON)
export interface CampaignRow {
  id: string;
  name: string;
  continuityId: string;
  created: string;
  updated: string;
}

export interface NoteRow {
  id: string;
  title: string;
  content: string;
  scope: string;
  continuityId: string;
  campaignId: string;
  originId: string;
  originContinuityId: string;
  forkedAt: string;
  locationIds: string; // JSON array
  tagIds: string; // JSON array
  created: string;
  updated: string;
}

export interface NpcRow {
  id: string;
  name: string;
  race: string;
  role: string;
  background: string;
  image: string;
  scope: string;
  continuityId: string;
  originId: string;
  originContinuityId: string;
  forkedAt: string;
  campaignIds: string; // JSON array
  locationIds: string;
  noteIds: string;
  tagIds: string;
  created: string;
  updated: string;
}

export interface LocationRow {
  id: string;
  name: string;
  type: string;
  description: string;
  parentId: string;
  scope: string;
  continuityId: string;
  originId: string;
  originContinuityId: string;
  forkedAt: string;
  campaignIds: string; // JSON array
  tagIds: string;
  map: string;
  images: string; // JSON array
  created: string;
  updated: string;
}

export interface ContinuityRow {
  id: string;
  name: string;
  description: string;
  created: string;
  updated: string;
}

export interface TagRow {
  id: string;
  name: string;
  color: string;
  scope: string;
  continuityId: string;
  campaignId: string;
  originId: string;
  originContinuityId: string;
  forkedAt: string;
  created: string;
  updated: string;
}

export interface SessionLogRow {
  id: string;
  title: string;
  date: string;
  summary: string;
  keyDecisions: string;
  outcomes: string;
  campaignIds: string; // JSON array
  locationIds: string;
  npcIds: string;
  noteIds: string;
  playerCharacterIds: string;
  tagIds: string;
  created: string;
  updated: string;
}

export interface PlayerCharacterRow {
  id: string;
  name: string;
  player: string;
  race: string;
  class: string;
  background: string;
  image: string;
  campaignIds: string; // JSON array
  noteIds: string;
  created: string;
  updated: string;
}

export interface PlayerCharacterTemplateRow {
  id: string;
  name: string;
  player: string;
  race: string;
  class: string;
  background: string;
  image: string;
  continuityId: string;
  originId: string;
  originContinuityId: string;
  forkedAt: string;
  created: string;
  updated: string;
}

// Table names as const for type safety
export const Tables = {
  continuities: 'continuities',
  campaigns: 'campaigns',
  notes: 'notes',
  npcs: 'npcs',
  locations: 'locations',
  tags: 'tags',
  sessionLogs: 'sessionLogs',
  playerCharacters: 'playerCharacters',
} as const;

export type TableName = (typeof Tables)[keyof typeof Tables];
