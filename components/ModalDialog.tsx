// components/ModalDialog.tsx
// Unified modal component for alerts and confirmations

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeColor } from "@/hooks/use-theme-color";
import React from "react";
import { Modal, Platform, Pressable, StyleSheet } from "react-native";

interface ModalDialogProps {
  visible: boolean;
  onDismiss: () => void;
  title: string;
  message: string;
  // Alert mode (single button)
  buttonText?: string;
  buttonStyle?: "default" | "danger" | "success";
  // Confirmation mode (two buttons)
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmStyle?: "default" | "danger" | "success";
}

export function ModalDialog({
  visible,
  onDismiss,
  title,
  message,
  // Alert props
  buttonText,
  buttonStyle = "default",
  // Confirmation props
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmStyle = "default",
}: ModalDialogProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const cardColor = useThemeColor({}, "cardBackground");
  const tintColor = useThemeColor({}, "tint");
  const dangerColor = useThemeColor({}, "error");
  const successColor = useThemeColor({}, "success");
  const borderColor = useThemeColor({}, "border");
  const highlightedText = useThemeColor({}, "highlightedText");
  const overlayColor = useThemeColor({}, "overlay");
  
  // Theme-aware shadow color (black with opacity that adapts to theme)
  const shadowOpacity = colorScheme === 'dark' ? 0.5 : 0.25;
  const shadowColor = `rgba(0, 0, 0, ${shadowOpacity})`;

  // Determine if this is confirmation mode (has onConfirm)
  const isConfirmation = !!onConfirm;

  // Determine button colors
  let primaryButtonBgColor = tintColor;
  let primaryButtonBorderColor = tintColor;

  if (isConfirmation) {
    // Confirmation mode: use confirmStyle
    if (confirmStyle === "danger") {
      primaryButtonBgColor = dangerColor;
      primaryButtonBorderColor = dangerColor;
    } else if (confirmStyle === "success") {
      primaryButtonBgColor = successColor;
      primaryButtonBorderColor = successColor;
    }
  } else {
    // Alert mode: use buttonStyle
    if (buttonStyle === "danger") {
      primaryButtonBgColor = dangerColor;
      primaryButtonBorderColor = dangerColor;
    } else if (buttonStyle === "success") {
      primaryButtonBgColor = successColor;
      primaryButtonBorderColor = successColor;
    }
  }

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      onDismiss();
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onDismiss}
    >
      <ThemedView style={[styles.overlay, { backgroundColor: overlayColor }]}>
        <ThemedView style={[styles.card, { backgroundColor: cardColor, boxShadow: Platform.OS === 'web' ? `0 2px 4px ${shadowColor}` : undefined }]}>
          <ThemedText type="subtitle" style={styles.title}>
            {title}
          </ThemedText>
          <ThemedText style={styles.message}>{message}</ThemedText>

          {isConfirmation ? (
            <ThemedView style={styles.buttonRow}>
              <Pressable
                onPress={onDismiss}
                style={[
                  styles.button,
                  styles.cancelButton,
                  { borderColor, backgroundColor: 'transparent' },
                ]}
              >
                <ThemedText type="defaultSemiBold">{cancelText}</ThemedText>
              </Pressable>

              <Pressable
                onPress={handleConfirm}
                style={[
                  styles.button,
                  styles.confirmButton,
                  { backgroundColor: primaryButtonBgColor, borderColor: primaryButtonBorderColor },
                ]}
              >
                <ThemedText type="defaultSemiBold" style={{ color: highlightedText }}>
                  {confirmText}
                </ThemedText>
              </Pressable>
            </ThemedView>
          ) : (
            <Pressable
              onPress={onDismiss}
              style={[
                styles.button,
                { backgroundColor: primaryButtonBgColor, borderColor: primaryButtonBorderColor },
              ]}
            >
              <ThemedText type="defaultSemiBold" style={{ color: highlightedText }}>
                {buttonText || "OK"}
              </ThemedText>
            </Pressable>
          )}
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
    // backgroundColor will be set dynamically from theme
  },
  card: {
    width: "80%",
    maxWidth: 350,
    borderRadius: 12,
    padding: Spacing.xl,
    // boxShadow will be set dynamically from theme
    ...(Platform.OS !== 'web' && {
      elevation: 5,
    }),
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

