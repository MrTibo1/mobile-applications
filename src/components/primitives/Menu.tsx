import { View, Pressable, StyleSheet } from 'react-native';
import { Text } from './Text';

interface MenuItem {
  label: string;
  onPress: () => void;
}

interface MenuProps {
  items: MenuItem[];
  visible: boolean;
  onClose: () => void;
}

export function Menu({ items, visible, onClose }: MenuProps) {
  if (!visible) return null;

  return (
    <>
      <Pressable onPress={onClose} style={styles.overlay} />
      <View style={styles.menu}>
        {items.map((item) => (
          <Pressable
            key={item.label}
            onPress={() => {
              item.onPress();
              onClose();
            }}
            style={styles.menuItem}
          >
            <Text size="md">{item.label}</Text>
          </Pressable>
        ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 },
  menu: { position: 'absolute', top: 0, right: 0, zIndex: 2, minWidth: 200, paddingVertical: 4, borderRadius: 10, backgroundColor: '#FFFFFF', elevation: 4, shadowColor: '#182722', shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
  menuItem: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 14 },
});
