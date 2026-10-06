import React from 'react';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';

type MapProps = {
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

/**
 * Sustituto web de react-native-maps. El modulo nativo no se puede empaquetar en web.
 */
export function MapView({ style, children }: MapProps) {
  return (
    <View style={[{ backgroundColor: '#D7E3D2', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }, style]}>
      <Text style={{ color: '#1C2430', fontSize: 14 }}>Mapa disponible en la app movil</Text>
      {children}
    </View>
  );
}

export function Marker(_props: { children?: React.ReactNode }) {
  return null;
}

export function Polyline() {
  return null;
}

export default MapView;
