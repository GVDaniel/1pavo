import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const enabled = Platform.OS !== 'web';

export const hapticSelect = () => {
  if (enabled) Haptics.selectionAsync().catch(() => {});
};
export const hapticImpact = () => {
  if (enabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
};
export const hapticSuccess = () => {
  if (enabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
};
export const hapticError = () => {
  if (enabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
};
