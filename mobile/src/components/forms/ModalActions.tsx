/**
 * Standard action buttons for form modals.
 *
 * Provides a consistent Cancel/Confirm button pattern used across create and edit modals.
 */

import React from 'react';
import { Button } from 'react-native-paper';

export interface ModalActionsProps {
  /** Handler for the cancel action */
  onCancel: () => void;
  /** Handler for the confirm action */
  onConfirm: () => void;
  /** Label for the confirm button */
  confirmLabel?: string;
  /** Label for the cancel button */
  cancelLabel?: string;
  /** Show loading spinner on confirm button */
  loading?: boolean;
  /** Disable both buttons */
  disabled?: boolean;
}

/**
 * Renders a Cancel and Confirm button pair for modal forms.
 *
 * @example
 * ```tsx
 * <FormModal
 *   title="New Note"
 *   visible={isOpen}
 *   onDismiss={handleClose}
 *   actions={
 *     <ModalActions
 *       onCancel={handleClose}
 *       onConfirm={handleCreate}
 *       confirmLabel="Create"
 *       loading={isCreating}
 *       disabled={isCreating}
 *     />
 *   }
 * >
 *   ...
 * </FormModal>
 * ```
 */
export function ModalActions({
  onCancel,
  onConfirm,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  loading = false,
  disabled = false,
}: ModalActionsProps) {
  return (
    <>
      <Button mode="text" onPress={onCancel} disabled={disabled}>
        {cancelLabel}
      </Button>
      <Button mode="contained" onPress={onConfirm} loading={loading} disabled={disabled}>
        {confirmLabel}
      </Button>
    </>
  );
}
