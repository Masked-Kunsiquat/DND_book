/**
* This file was @generated using pocketbase-typegen
*/

import type PocketBase from 'pocketbase'
import type { RecordService } from 'pocketbase'

export enum Collections {
	Authorigins = "_authOrigins",
	Externalauths = "_externalAuths",
	Mfas = "_mfas",
	Otps = "_otps",
	Superusers = "_superusers",
	CampaignCombined = "campaign_combined",
	CampaignLocations = "campaign_locations",
	CampaignNotes = "campaign_notes",
	CampaignNpc = "campaign_npc",
	CampaignSessions = "campaign_sessions",
	Campaigns = "campaigns",
	LocationView = "location_view",
	Locations = "locations",
	Notes = "notes",
	Npcs = "npcs",
	PlayerCharacters = "player_characters",
	SessionLogs = "session_logs",
	TaggedCombined = "tagged_combined",
	TaggedLocations = "tagged_locations",
	TaggedNotes = "tagged_notes",
	TaggedNpcs = "tagged_npcs",
	TaggedSessions = "tagged_sessions",
	Tags = "tags",
	Users = "users",
}

// Alias types for improved usability
export type IsoDateString = string
export type RecordIdString = string
export type HTMLString = string

// System fields
export type BaseSystemFields<T = never> = {
	id: RecordIdString
	collectionId: string
	collectionName: Collections
	expand?: T
}

export type AuthSystemFields<T = never> = {
	email: string
	emailVisibility: boolean
	username: string
	verified: boolean
} & BaseSystemFields<T>

// Record types for each collection

export type AuthoriginsRecord = {
	collectionRef: string
	created?: IsoDateString
	fingerprint: string
	id: string
	recordRef: string
	updated?: IsoDateString
}

export type ExternalauthsRecord = {
	collectionRef: string
	created?: IsoDateString
	id: string
	provider: string
	providerId: string
	recordRef: string
	updated?: IsoDateString
}

export type MfasRecord = {
	collectionRef: string
	created?: IsoDateString
	id: string
	method: string
	recordRef: string
	updated?: IsoDateString
}

export type OtpsRecord = {
	collectionRef: string
	created?: IsoDateString
	id: string
	password: string
	recordRef: string
	sentTo?: string
	updated?: IsoDateString
}

export type SuperusersRecord = {
	created?: IsoDateString
	email: string
	emailVisibility?: boolean
	id: string
	password: string
	tokenKey: string
	updated?: IsoDateString
	verified?: boolean
}

export type CampaignCombinedRecord<Tcampaign_ids = unknown, Trelated_id = unknown, Trelated_name = unknown, Trelated_type = unknown> = {
	campaign_ids?: null | Tcampaign_ids
	id: string
	related_id?: null | Trelated_id
	related_name?: null | Trelated_name
	related_type?: null | Trelated_type
}

export type CampaignLocationsRecord<Trelated_type = unknown> = {
	campaign_ids?: RecordIdString[]
	id: string
	related_id?: RecordIdString
	related_name: string
	related_type?: null | Trelated_type
}

export type CampaignNotesRecord<Trelated_type = unknown> = {
	campaign_ids?: RecordIdString
	id: string
	related_id?: RecordIdString
	related_name: string
	related_type?: null | Trelated_type
}

export type CampaignNpcRecord<Trelated_type = unknown> = {
	campaign_ids?: RecordIdString[]
	id: string
	related_id?: RecordIdString
	related_name: string
	related_type?: null | Trelated_type
}

export type CampaignSessionsRecord<Trelated_type = unknown> = {
	campaign_ids?: RecordIdString[]
	id: string
	related_id?: RecordIdString
	related_name: string
	related_type?: null | Trelated_type
}

export type CampaignsRecord = {
	created?: IsoDateString
	id: string
	name: string
	updated?: IsoDateString
	user?: RecordIdString
}

export enum LocationViewTypeOptions {
	"Plane" = "Plane",
	"Realm" = "Realm",
	"Continent" = "Continent",
	"Territory" = "Territory",
	"Province" = "Province",
	"Locale" = "Locale",
	"Landmark" = "Landmark",
}
export type LocationViewRecord = {
	description?: string
	grandparent_id?: RecordIdString
	id: string
	name: string
	parent_id?: RecordIdString
	parent_name: string
	type: LocationViewTypeOptions
}

export enum LocationsTypeOptions {
	"Plane" = "Plane",
	"Realm" = "Realm",
	"Continent" = "Continent",
	"Territory" = "Territory",
	"Province" = "Province",
	"Locale" = "Locale",
	"Landmark" = "Landmark",
}
export type LocationsRecord = {
	campaign?: RecordIdString[]
	created?: IsoDateString
	description?: string
	id: string
	images?: string[]
	map?: string
	name: string
	parent?: RecordIdString
	tags?: RecordIdString[]
	type: LocationsTypeOptions
	updated?: IsoDateString
	user: RecordIdString
}

export type NotesRecord = {
	campaign?: RecordIdString
	content: string
	created?: IsoDateString
	id: string
	locations?: RecordIdString[]
	tags?: RecordIdString[]
	title: string
	updated?: IsoDateString
	user: RecordIdString
}

export type NpcsRecord = {
	background?: string
	campaign?: RecordIdString[]
	created?: IsoDateString
	id: string
	image?: string
	locations?: RecordIdString[]
	name: string
	notes?: RecordIdString[]
	race?: string
	role?: string
	tags?: RecordIdString[]
	updated?: IsoDateString
	user: RecordIdString
}

export type PlayerCharactersRecord = {
	background?: string
	campaign?: RecordIdString[]
	class?: string
	created?: IsoDateString
	id: string
	name: string
	notes?: RecordIdString[]
	player?: string
	race?: string
	updated?: IsoDateString
	user: RecordIdString
}

export type SessionLogsRecord = {
	campaign?: RecordIdString[]
	created?: IsoDateString
	date: IsoDateString
	id: string
	key_decisions?: string
	locations?: RecordIdString[]
	notes?: RecordIdString[]
	npcs?: RecordIdString[]
	outcomes?: string
	player_characters?: RecordIdString[]
	summary: string
	tags?: RecordIdString[]
	title: string
	updated?: IsoDateString
	user: RecordIdString
}

export type TaggedCombinedRecord<Trelated_id = unknown, Trelated_name = unknown, Trelated_type = unknown, Ttag_ids = unknown> = {
	id: string
	related_id?: null | Trelated_id
	related_name?: null | Trelated_name
	related_type?: null | Trelated_type
	tag_ids?: null | Ttag_ids
}

export type TaggedLocationsRecord<Trelated_type = unknown> = {
	id: string
	related_id?: RecordIdString
	related_name: string
	related_type?: null | Trelated_type
	tag_ids?: RecordIdString[]
}

export type TaggedNotesRecord<Trelated_type = unknown> = {
	id: string
	related_id?: RecordIdString
	related_name: string
	related_type?: null | Trelated_type
	tag_ids?: RecordIdString[]
}

export type TaggedNpcsRecord<Trelated_type = unknown> = {
	id: string
	related_id?: RecordIdString
	related_name: string
	related_type?: null | Trelated_type
	tag_ids?: RecordIdString[]
}

export type TaggedSessionsRecord<Trelated_type = unknown> = {
	id: string
	related_id?: RecordIdString
	related_name: string
	related_type?: null | Trelated_type
	tag_ids?: RecordIdString[]
}

export type TagsRecord = {
	created?: IsoDateString
	id: string
	name: string
	updated?: IsoDateString
	user?: RecordIdString
}

export type UsersRecord = {
	avatar?: string
	created?: IsoDateString
	email: string
	emailVisibility?: boolean
	id: string
	name?: string
	password: string
	tokenKey: string
	updated?: IsoDateString
	verified?: boolean
}

// Response types include system fields and match responses from the PocketBase API
// 🛡️ AUTH-RELATED RESPONSE TYPES
export type SuperusersResponse<Texpand = unknown> = Required<SuperusersRecord> & AuthSystemFields<Texpand>;
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> & AuthSystemFields<Texpand>;
export type ExternalauthsResponse<Texpand = unknown> = Required<ExternalauthsRecord> & BaseSystemFields<Texpand>;
export type MfasResponse<Texpand = unknown> = Required<MfasRecord> & BaseSystemFields<Texpand>;
export type OtpsResponse<Texpand = unknown> = Required<OtpsRecord> & BaseSystemFields<Texpand>;
export type AuthoriginsResponse<Texpand = unknown> = Required<AuthoriginsRecord> & BaseSystemFields<Texpand>;

// 📌 CAMPAIGN-RELATED RESPONSE TYPES
export type CampaignsResponse<Texpand = unknown> = Required<CampaignsRecord> & BaseSystemFields<Texpand>;
export type CampaignLocationsResponse<Texpand = unknown> = Required<CampaignLocationsRecord<Texpand>> & BaseSystemFields<Texpand>;
export type CampaignNotesResponse<Texpand = unknown> = Required<CampaignNotesRecord<Texpand>> & BaseSystemFields<Texpand>;
export type CampaignNpcResponse<Texpand = unknown> = Required<CampaignNpcRecord<Texpand>> & BaseSystemFields<Texpand>;
export type CampaignSessionsResponse<Texpand = unknown> = Required<CampaignSessionsRecord<Texpand>> & BaseSystemFields<Texpand>;
export type CampaignCombinedResponse<Texpand = unknown> = Required<CampaignCombinedRecord<Texpand>> & BaseSystemFields<Texpand>;

// 🌍 LOCATION-RELATED RESPONSE TYPES
export type LocationsResponse<Texpand = unknown> = Required<LocationsRecord> & BaseSystemFields<Texpand>;
export type LocationViewResponse<Texpand = unknown> = Required<LocationViewRecord> & BaseSystemFields<Texpand>;
export type TaggedLocationsResponse<Texpand = unknown> = Required<TaggedLocationsRecord<Texpand>> & BaseSystemFields<Texpand>;

// 📝 NOTES-RELATED RESPONSE TYPES
export type NotesResponse<Texpand = { tags?: TagsResponse[] }> = Required<NotesRecord> & BaseSystemFields<Texpand>;
export type TaggedNotesResponse<Texpand = unknown> = Required<TaggedNotesRecord<Texpand>> & BaseSystemFields<Texpand>;

// 🎭 NPC-RELATED RESPONSE TYPES
export type NpcsResponse<Texpand = unknown> = Required<NpcsRecord> & BaseSystemFields<Texpand>;
export type TaggedNpcsResponse<Texpand = unknown> = Required<TaggedNpcsRecord<Texpand>> & BaseSystemFields<Texpand>;

// 🎮 PLAYER-RELATED RESPONSE TYPES
export type PlayerCharactersResponse<Texpand = unknown> = Required<PlayerCharactersRecord> & BaseSystemFields<Texpand>;
export type SessionLogsResponse<Texpand = unknown> = Required<SessionLogsRecord> & BaseSystemFields<Texpand>;
export type TaggedSessionsResponse<Texpand = unknown> = Required<TaggedSessionsRecord<Texpand>> & BaseSystemFields<Texpand>;

// 🏷️ TAG-RELATED RESPONSE TYPES
export type TagsResponse<Texpand = unknown> = Required<TagsRecord> & BaseSystemFields<Texpand>;
export type TaggedCombinedResponse<Texpand = unknown> = Required<TaggedCombinedRecord<Texpand>> & BaseSystemFields<Texpand>;

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	_authOrigins: AuthoriginsRecord
	_externalAuths: ExternalauthsRecord
	_mfas: MfasRecord
	_otps: OtpsRecord
	_superusers: SuperusersRecord
	campaign_combined: CampaignCombinedRecord
	campaign_locations: CampaignLocationsRecord
	campaign_notes: CampaignNotesRecord
	campaign_npc: CampaignNpcRecord
	campaign_sessions: CampaignSessionsRecord
	campaigns: CampaignsRecord
	location_view: LocationViewRecord
	locations: LocationsRecord
	notes: NotesRecord
	npcs: NpcsRecord
	player_characters: PlayerCharactersRecord
	session_logs: SessionLogsRecord
	tagged_combined: TaggedCombinedRecord
	tagged_locations: TaggedLocationsRecord
	tagged_notes: TaggedNotesRecord
	tagged_npcs: TaggedNpcsRecord
	tagged_sessions: TaggedSessionsRecord
	tags: TagsRecord
	users: UsersRecord
}

export type CollectionResponses = {
	_authOrigins: AuthoriginsResponse
	_externalAuths: ExternalauthsResponse
	_mfas: MfasResponse
	_otps: OtpsResponse
	_superusers: SuperusersResponse
	campaign_combined: CampaignCombinedResponse
	campaign_locations: CampaignLocationsResponse
	campaign_notes: CampaignNotesResponse
	campaign_npc: CampaignNpcResponse
	campaign_sessions: CampaignSessionsResponse
	campaigns: CampaignsResponse
	location_view: LocationViewResponse
	locations: LocationsResponse
	notes: NotesResponse
	npcs: NpcsResponse
	player_characters: PlayerCharactersResponse
	session_logs: SessionLogsResponse
	tagged_combined: TaggedCombinedResponse
	tagged_locations: TaggedLocationsResponse
	tagged_notes: TaggedNotesResponse
	tagged_npcs: TaggedNpcsResponse
	tagged_sessions: TaggedSessionsResponse
	tags: TagsResponse
	users: UsersResponse
}

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = PocketBase & {
	collection(idOrName: '_authOrigins'): RecordService<AuthoriginsResponse>
	collection(idOrName: '_externalAuths'): RecordService<ExternalauthsResponse>
	collection(idOrName: '_mfas'): RecordService<MfasResponse>
	collection(idOrName: '_otps'): RecordService<OtpsResponse>
	collection(idOrName: '_superusers'): RecordService<SuperusersResponse>
	collection(idOrName: 'campaign_combined'): RecordService<CampaignCombinedResponse>
	collection(idOrName: 'campaign_locations'): RecordService<CampaignLocationsResponse>
	collection(idOrName: 'campaign_notes'): RecordService<CampaignNotesResponse>
	collection(idOrName: 'campaign_npc'): RecordService<CampaignNpcResponse>
	collection(idOrName: 'campaign_sessions'): RecordService<CampaignSessionsResponse>
	collection(idOrName: 'campaigns'): RecordService<CampaignsResponse>
	collection(idOrName: 'location_view'): RecordService<LocationViewResponse>
	collection(idOrName: 'locations'): RecordService<LocationsResponse>
	collection(idOrName: 'notes'): RecordService<NotesResponse>
	collection(idOrName: 'npcs'): RecordService<NpcsResponse>
	collection(idOrName: 'player_characters'): RecordService<PlayerCharactersResponse>
	collection(idOrName: 'session_logs'): RecordService<SessionLogsResponse>
	collection(idOrName: 'tagged_combined'): RecordService<TaggedCombinedResponse>
	collection(idOrName: 'tagged_locations'): RecordService<TaggedLocationsResponse>
	collection(idOrName: 'tagged_notes'): RecordService<TaggedNotesResponse>
	collection(idOrName: 'tagged_npcs'): RecordService<TaggedNpcsResponse>
	collection(idOrName: 'tagged_sessions'): RecordService<TaggedSessionsResponse>
	collection(idOrName: 'tags'): RecordService<TagsResponse>
	collection(idOrName: 'users'): RecordService<UsersResponse>
}
