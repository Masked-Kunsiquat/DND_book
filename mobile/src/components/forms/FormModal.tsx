/**
 * Standard modal wrapper for form flows.
 */

import React from 'react';
import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Modal, Portal, Text } from 'react-native-paper';
import { useTheme } from '../../theme/ThemeProvider';
import { layout, spacing } from '../../theme';

export interface FormModalProps {
  /** Modal title */
  title: string;
  /** Visibility flag */
  visible: boolean;
  /** Dismiss handler */
  onDismiss: () => void;
  /** Form content */
  children: React.ReactNode;
  /** Optional actions row */
  actions?: React.ReactNode;
  /** Optional container style override */
  containerStyle?: object;
}

export function FormModal({
  title,
  visible,
  onDismiss,
  children,
  actions,
  containerStyle,
}: FormModalProps) {
  const { theme } = useTheme();
  const { height } = useWindowDimensions();
  const maxHeight = Math.min(height * 0.85, 720);
  const maxBodyHeight = Math.max(200, maxHeight - 200);

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[
          styles.modal,
          { backgroundColor: theme.colors.surface, maxHeight },
          containerStyle,
        ]}
      >
        <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
          {title}
        </Text>
        <ScrollView
          style={[styles.body, { maxHeight: maxBodyHeight }]}
          contentContainerStyle={styles.bodyContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
        {actions ? <View style={styles.actions}>{actions}</View> : null}
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: {
    margin: spacing[4],
    padding: spacing[4],
    borderRadius: layout.cardBorderRadius,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    gap: spacing[3],
  },
  body: {
    flexGrow: 0,
  },
  bodyContent: {
    gap: spacing[3],
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing[2],
  },
});
