/**
 * Shared interface for MapModal.
 */
export interface MapModalType {
    isOpen: boolean;
    onClose: () => void;
    mapUrl?: string;
    locationName: string;
  }