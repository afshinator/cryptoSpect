// components/ConfirmationModal.tsx
// Confirmation modal for delete/action confirmations

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import React from "react";
import { Modal, Pressable, StyleSheet } from "react-native";

interface ConfirmationModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmStyle?: "default" | "danger" | "success";
}

export function ConfirmationModal({
  visible,
  onConfirm,
  onCancel,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmStyle = "default",
}: ConfirmationModalProps) {
  const cardColor = useThemeColor({}, "backgroundSecondary");
  const tintColor = useThemeColor({}, "tint");
  const dangerColor = useThemeColor({}, "error");
  const successColor = useThemeColor({}, "success");
  const borderColor = useThemeColor({}, "border");

  let confirmBgColor = tintColor;
  let confirmBorderColor = tintColor;

  if (confirmStyle === "danger") {
    confirmBgColor = dangerColor;
    confirmBorderColor = dangerColor;
  } else if (confirmStyle === "success") {
    confirmBgColor = successColor;
    confirmBorderColor = successColor;
  }

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
    >
      <ThemedView style={styles.overlay}>
        <ThemedView style={[styles.card, { backgroundColor: cardColor }]}>
          <ThemedText type="subtitle" style={styles.title}>
            {title}
          </ThemedText>
          <ThemedText style={styles.message}>{message}</ThemedText>

          <ThemedView style={styles.buttonRow}>
            <Pressable
              onPress={onCancel}
              style={[
                styles.button,
                styles.cancelButton,
                { borderColor, backgroundColor: 'transparent' },
              ]}
            >
              <ThemedText type="defaultSemiBold">{cancelText}</ThemedText>
            </Pressable>

            <Pressable
              onPress={onConfirm}
              style={[
                styles.button,
                styles.confirmButton,
                { backgroundColor: confirmBgColor, borderColor: confirmBorderColor },
              ]}
            >
              <ThemedText type="defaultSemiBold" style={{ color: "#fff" }}>
                {confirmText}
              </ThemedText>
            </Pressable>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.85)",
  },
  card: {
    width: "80%",
    maxWidth: 350,
    borderRadius: 12,
    padding: Spacing.xl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    marginBottom: Spacing.md,
  },
  message: {
    marginBottom: Spacing.lg,
  },
  buttonRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  button: {
    flex: 1,
    padding: Spacing.sm,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
  },
  cancelButton: {
    // Styles applied via inline style
  },
  confirmButton: {
    // Styles applied via inline style
  },
});

