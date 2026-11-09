import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../primitives/Text';

interface DatePickerFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  compact?: boolean;
  disabled?: boolean;
  onPressIn?: () => void;
  onClose?: () => void;
}

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function dateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function parseDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return date;
}

export function DatePickerField({
  label,
  value,
  onChange,
  compact = false,
  disabled = false,
  onPressIn,
  onClose,
}: DatePickerFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(value);
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const selected = parseDate(selectedDate);
  const today = new Date();
  const todayKey = dateKey(today.getFullYear(), today.getMonth(), today.getDate());
  const monthLabel = visibleMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const firstDayOffset = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const calendarDays = Array.from({ length: 42 }, (_, index) => {
    const day = index - firstDayOffset + 1;
    return day > 0 && day <= daysInMonth ? day : null;
  });
  const formattedValue = parseDate(value)?.toLocaleDateString() ?? '';

  const openPicker = () => {
    const initialDate = parseDate(value) ?? new Date();
    setVisibleMonth(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));
    setSelectedDate(value);
    setIsOpen(true);
  };

  const closePicker = () => {
    setIsOpen(false);
    onClose?.();
  };

  const confirmSelection = () => {
    onChange(selectedDate);
    closePicker();
  };

  const clearSelection = () => {
    onChange('');
    setSelectedDate('');
    closePicker();
  };

  return (
    <View style={compact ? styles.compactField : styles.field}>
      {!compact ? <Text size="sm" weight="medium">{label}</Text> : null}
      <Pressable
        style={[styles.dateButton, compact && styles.compactDateButton, disabled && styles.disabled]}
        onPressIn={onPressIn}
        onPress={openPicker}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={formattedValue ? `${label}: ${formattedValue}` : `Set ${label.toLowerCase()}`}
      >
        {!compact ? (
          <Text color={formattedValue ? '#17312B' : '#69756F'}>
            {formattedValue || 'Select a date'}
          </Text>
        ) : <Text size="sm" color={formattedValue ? '#176B5B' : '#69756F'}>{formattedValue || 'Due date'}</Text>}
        <Ionicons name="calendar-outline" size={20} color="#176B5B" />
      </Pressable>

      <Modal visible={isOpen} transparent animationType="fade" onRequestClose={closePicker}>
        <Pressable style={styles.backdrop} onPress={closePicker}>
          <Pressable style={styles.dialog} onPress={(event) => event.stopPropagation()}>
            <View style={styles.dialogHeader}>
              <View style={styles.titleContainer}>
                <Text size="lg" weight="bold">{label}</Text>
                <Text size="sm" color="#69756F">Choose a date</Text>
              </View>
              <Pressable onPress={closePicker} accessibilityRole="button" accessibilityLabel="Close date picker">
                <Ionicons name="close" size={24} color="#52606D" />
              </Pressable>
            </View>

            <View style={styles.monthNavigation}>
              <Pressable
                style={styles.monthButton}
                onPress={() => setVisibleMonth(new Date(year, month - 1, 1))}
                accessibilityRole="button"
                accessibilityLabel="Previous month"
              >
                <Ionicons name="chevron-back" size={20} color="#17312B" />
              </Pressable>
              <Text weight="bold">{monthLabel}</Text>
              <Pressable
                style={styles.monthButton}
                onPress={() => setVisibleMonth(new Date(year, month + 1, 1))}
                accessibilityRole="button"
                accessibilityLabel="Next month"
              >
                <Ionicons name="chevron-forward" size={20} color="#17312B" />
              </Pressable>
            </View>

            <View style={styles.weekRow}>
              {weekDays.map((day) => <Text key={day} size="sm" color="#69756F" style={styles.weekDay}>{day}</Text>)}
            </View>
            <View style={styles.calendar}>
              {Array.from({ length: 6 }, (_, weekIndex) => (
                <View key={`week-${weekIndex}`} style={styles.weekRow}>
                  {calendarDays.slice(weekIndex * 7, weekIndex * 7 + 7).map((day, dayIndex) => {
                    if (day === null) return <View key={`empty-${weekIndex}-${dayIndex}`} style={styles.dayCell} />;
                    const key = dateKey(year, month, day);
                    const isSelected = selectedDate === key;
                    const isToday = todayKey === key;
                    return (
                      <Pressable
                        key={key}
                        style={[
                          styles.dayCell,
                          isToday && styles.today,
                          isSelected && styles.selectedDay,
                        ]}
                        onPress={() => setSelectedDate(key)}
                        accessibilityRole="button"
                        accessibilityLabel={new Date(year, month, day).toLocaleDateString()}
                        accessibilityState={{ selected: isSelected }}
                      >
                        <Text size="sm" weight={isSelected ? 'bold' : 'normal'} color={isSelected ? '#FFFFFF' : '#17312B'}>
                          {day}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              ))}
            </View>

            <View style={styles.footer}>
              <Pressable onPress={clearSelection} accessibilityRole="button">
                <Text weight="medium" color="#176B5B">Clear</Text>
              </Pressable>
              <View style={styles.footerActions}>
                <Pressable style={styles.cancelButton} onPress={closePicker} accessibilityRole="button">
                  <Text weight="medium" color="#52606D">Cancel</Text>
                </Pressable>
                <Pressable
                  style={[styles.confirmButton, !selected && styles.disabledButton]}
                  onPress={confirmSelection}
                  disabled={!selected}
                  accessibilityRole="button"
                >
                  <Text weight="bold" color="#FFFFFF">Done</Text>
                </Pressable>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 6 },
  compactField: { alignSelf: 'flex-start' },
  dateButton: { minHeight: 48, borderWidth: 1, borderColor: '#D5DED9', borderRadius: 9, paddingHorizontal: 14, paddingVertical: 11, backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  compactDateButton: { minHeight: 40, alignSelf: 'flex-start', borderWidth: 0, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 6, backgroundColor: '#F3F7F5', gap: 6 },
  disabled: { opacity: 0.6 },
  backdrop: { flex: 1, backgroundColor: 'rgba(24, 39, 34, 0.42)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  dialog: { width: '100%', maxWidth: 390, padding: 22, gap: 18, borderRadius: 14, backgroundColor: '#FFFFFF', elevation: 8, shadowColor: '#182722', shadowOpacity: 0.12, shadowRadius: 18, shadowOffset: { width: 0, height: 6 } },
  dialogHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  titleContainer: { gap: 2 },
  monthNavigation: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  monthButton: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3F7F5' },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 4 },
  weekDay: { flex: 1, textAlign: 'center' },
  calendar: { gap: 4 },
  dayCell: { flex: 1, aspectRatio: 1, minHeight: 36, maxHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  today: { borderWidth: 1, borderColor: '#176B5B' },
  selectedDay: { backgroundColor: '#176B5B', borderColor: '#176B5B' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  footerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cancelButton: { minHeight: 42, justifyContent: 'center', paddingHorizontal: 12 },
  confirmButton: { minHeight: 42, justifyContent: 'center', paddingHorizontal: 18, borderRadius: 10, backgroundColor: '#176B5B' },
  disabledButton: { opacity: 0.45 },
});
