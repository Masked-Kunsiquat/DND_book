/**
 * Themed confirmation dialog for destructive or blocking actions.
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import { Button, Dialog, Portal, Text } from 'react-native-paper';
import { useTheme } from '../../theme/ThemeProvider';
import { layout, spacing } from '../../theme';

export interface ConfirmDialogProps {
  /** Dialog visibility */
  visible: boolean;
  /** Dialog title */
  title: string;
  /** Optional description */
  description?: string;
  /** Confirm button label */
  confirmLabel?: string;
  /** Cancel button label */
  cancelLabel?: string;
  /** Cancel handler */
  onCancel: () => void;
  /** Confirm handler */
  onConfirm: () => void;
  /** Disable the confirm button */
  confirmDisabled?: boolean;
  /** Show loading state on confirm */
  confirmLoading?: boolean;
  /** Use destructive styling for confirm */
  destructive?: boolean;
}

export function ConfirmDialog({
  visible,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onCancel,
  onConfirm,
  confirmDisabled,
  confirmLoading,
  destructive,
}: ConfirmDialogProps) {
  const { theme } = useTheme();
  const isBusy = Boolean(confirmLoading);
  const confirmColor = destructive ? theme.colors.error : theme.colors.primary;
  const confirmTextColor = destructive ? theme.colors.onError : theme.colors.onPrimary;

  return (
    <Portal>
      <Dialog
        visible={visible}
        onDismiss={onCancel}
        dismissable={!isBusy}
        style={[styles.dialog, { backgroundColor: theme.colors.surface }]}
      >
        <Dialog.Title style={{ color: theme.colors.onSurface }}>{title}</Dialog.Title>
        {description ? (
          <Dialog.Content>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
              {description}
            </Text>
          </Dialog.Content>
        ) : null}
        <Dialog.Actions style={styles.actions}>
          <Button mode="text" onPress={onCancel} disabled={isBusy}>
            {cancelLabel}
          </Button>
          <Button
            mode="contained"
            onPress={onConfirm}
            loading={isBusy}
            disabled={isBusy || confirmDisabled}
            buttonColor={confirmColor}
            textColor={confirmTextColor}
          >
            {confirmLabel}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  dialog: {
    marginHorizontal: spacing[4],
    borderRadius: layout.cardBorderRadius,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 520,
  },
  actions: {
    justifyContent: 'flex-end',
    gap: spacing[2],
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[3],
  },
});
