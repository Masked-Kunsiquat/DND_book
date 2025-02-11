// Define the valid location types
export type LocationType =
  | "Continent"
  | "Landmark"
  | "Locale"
  | "Plane"
  | "Province"
  | "Realm"
  | "Territory"
  | "default";

// Icon mapping object with strong typing
export const iconMap: Record<LocationType, string> = {
  Continent: "/assets/icons/locations/continent.png",
  Landmark: "/assets/icons/locations/landmark.png",
  Locale: "/assets/icons/locations/locale.png",
  Plane: "/assets/icons/locations/plane.png",
  Province: "/assets/icons/locations/province.png",
  Realm: "/assets/icons/locations/realm.png",
  Territory: "/assets/icons/locations/territory.png",
  default: "/assets/icons/locations/default.png",
};

export default iconMap;
