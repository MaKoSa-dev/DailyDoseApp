import React, { useState, useEffect } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  format,
  startOfWeek,
  addDays,
  startOfMonth,
  endOfMonth,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths
} from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { db } from '../../firebase';
const Calendar = () => {
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventToEdit, setEventToEdit] = useState(null);
  const [showEventsPopup, setShowEventsPopup] = useState(false);
  const [selectedDayEvents, setSelectedDayEvents] = useState([]);
  const [selectedDayDate, setSelectedDayDate] = useState(new Date());
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    time: '',
    date: new Date()
  });

  const [currentUserId, setCurrentUserId] = useState('user123');
  // Загрузка событий из Firebase/localStorage
  useEffect(() => {
    loadEvents();
  }, [currentUserId]);
  const saveEventToFirebase = async (eventData) => {
    try {
      if (eventData.id) {
        // Обновление существующего события
        await updateDoc(doc(db, 'calendarEvents', eventData.id), {
          title: eventData.title,
          description: eventData.description,
          time: eventData.time,
          date: eventData.date,
          done: eventData.done,
          lastUpdated: new Date()
        });
        return eventData.id;
      } else {
        // Создание нового события
        const docRef = await addDoc(collection(db, 'calendarEvents'), {
          title: eventData.title,
          description: eventData.description,
          time: eventData.time,
          date: eventData.date,
          done: eventData.done,
          userId: currentUserId,
          createdAt: new Date(),
          lastUpdated: new Date()
        });
        return docRef.id;
      }
    } catch (error) {
      console.error('❌ Ошибка сохранения события:', error);
      throw error;
    }
  };
  const loadEvents = async () => {
    try {
      const eventsRef = collection(db, 'calendarEvents');
      const q = query(eventsRef, where('userId', '==', currentUserId));
      const querySnapshot = await getDocs(q);

      const eventsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate() // конвертируем Timestamp в Date
      }));

      setEvents(eventsList);
      console.log('✅ События загружены из Firebase');
    } catch (error) {
      console.error('❌ Ошибка загрузки событий:', error);
    }
  };
 
  const saveEvents = async (updatedEvents) => {
    try {
      if (eventData.id) {
        // Обновление существующего события
        await updateDoc(doc(db, 'calendarEvents', eventData.id), {
          ...eventData,
          date: eventData.date,
          lastUpdated: new Date()
        });
      } else {
        // Создание нового события
        await addDoc(collection(db, 'calendarEvents'), {
          ...eventData,
          userId: currentUserId,
          createdAt: new Date(),
          lastUpdated: new Date()
        });
      }
      console.log('✅ Событие сохранено в Firebase');
    } catch (error) {
      console.error('❌ Ошибка сохранения события:', error);
    }
  };
  const deleteEventFromFirebase = async (eventId) => {
    try {
      if (!eventId) {
        console.error('❌ eventId is undefined или пустой');
        return;
      }

      await deleteDoc(doc(db, 'calendarEvents', eventId));
      console.log('✅ Событие удалено из Firebase');
    } catch (error) {
      console.error('❌ Ошибка удаления события:', error);
    }
  };

  const renderHeader = () => {
    const month = format(currentMonth, 'LLLL', { locale: ru });
    const year = format(currentMonth, 'yyyy');

    return (
      <View style={styles.header}>
        <TouchableOpacity onPress={prevMonth} style={styles.headerButton}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerMonth}>{month}</Text>
          <Text style={styles.headerYear}>{year}</Text>
        </View>

        <TouchableOpacity onPress={nextMonth} style={styles.headerButton}>
          <Ionicons name="chevron-forward" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderDays = () => {
    const days = ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'];

    return (
      <View style={styles.daysRow}>
        {days.map((day, index) => (
          <View key={index} style={styles.dayHeader}>
            <Text style={styles.dayHeaderText}>{day}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, 'd');
        const cloneDay = new Date(day);
        const dayEvents = events.filter(event =>
          isSameDay(cloneDay, new Date(event.date))
        );

        days.push(
          <TouchableOpacity
            key={day.toString()}
            style={[
              styles.cell,
              !isSameMonth(day, monthStart) && styles.disabledCell,
              isSameDay(day, selectedDate) && styles.selectedCell,
              isSameDay(day, new Date()) && styles.todayCell
            ]}
            onPress={() => onDayPress(cloneDay)}
            onLongPress={() => onDayLongPress(cloneDay)}
            disabled={!isSameMonth(day, monthStart)}
          >
            <Text style={[
              styles.cellNumber,
              !isSameMonth(day, monthStart) && styles.disabledText,
              isSameDay(day, new Date()) && styles.todayText
            ]}>
              {formattedDate}
            </Text>

            {isSameMonth(day, monthStart) && (
              <View style={styles.eventsContainer}>

                {dayEvents
                  .sort((a, b) => (a.time > b.time ? 1 : -1))
                  .slice(0, 2)
                  .map((event, index) => (
                    <TouchableOpacity
                      key={event.id || `event-${index}-${event.date.getTime()}`}
                      style={[
                        styles.eventItem,
                        event.done && styles.completedEvent
                      ]}
                      onPress={() => editEvent(event)}
                      onLongPress={() => toggleEventCompletion(event.id)}
                    >
                      <Text style={styles.eventText} numberOfLines={1}>
                        {event.time} - {event.title}
                        {event.done && ' ✓'}
                      </Text>
                    </TouchableOpacity>
                  ))}

                {dayEvents.length > 2 && (
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedDayEvents(dayEvents);
                      setShowEventsPopup(true);
                    }}
                  >
                    <Text style={styles.moreEventsText}>
                      +{dayEvents.length - 2} ещё
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            <TouchableOpacity
              style={styles.addButton}
              onPress={() => onAddEventClick(cloneDay)}
            >
              <Ionicons name="add" size={16} color="#7585cdff" />
            </TouchableOpacity>
          </TouchableOpacity>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <View key={`row-${day.getTime()}`} style={styles.row}>
          {days}
        </View>
      );
      days = [];
    }

    return <View style={styles.calendarBody}>{rows}</View>;
  };

  const onDayPress = (day) => {
    setSelectedDate(day);
  };
  const onDayLongPress = (day) => {
    const dayEvents = events.filter(event => isSameDay(day, new Date(event.date)));
    if (dayEvents.length > 0) {
      setSelectedDayEvents(dayEvents);
      setSelectedDayDate(day);
      setShowEventsPopup(true);
    }
  };
  const onAddEventClick = (date) => {
    setSelectedDate(date);
    setNewEvent({
      title: '',
      description: '',
      time: '',
      date: date
    });
    setShowEventModal(true);
  };

  const editEvent = (event) => {
    setEventToEdit(event);
    setNewEvent({
      title: event.title,
      description: event.description,
      time: event.time,
      date: new Date(event.date)
    });
    setShowEventModal(true);
  };

  const handleSaveEvent = async () => {
    if (!newEvent.title.trim() || !newEvent.time.trim()) {
      alert('Пожалуйста, заполните название и время события');
      return;
    }

    try {
      const eventData = {
        title: newEvent.title,
        description: newEvent.description,
        time: newEvent.time,
        date: selectedDate,
        done: false
      };

      if (eventToEdit) {
        // Обновление существующего события
        eventData.id = eventToEdit.id;
        await saveEventToFirebase(eventData);

        // Обновляем локальное состояние
        setEvents(prev => prev.map(event =>
          event.id === eventToEdit.id ? { ...eventToEdit, ...eventData } : event
        ));
      } else {
        // Добавление нового события
        const docRef = await saveEventToFirebase(eventData);

        // Обновляем локальное состояние
        const newEventWithId = {
          ...eventData,
          id: docRef.id
        };
        setEvents(prev => [...prev, newEventWithId]);
      }

      setShowEventModal(false);
      setEventToEdit(null);
      setNewEvent({ title: '', description: '', time: '', date: new Date() });

    } catch (error) {
      console.error('❌ Ошибка сохранения события:', error);
    }
  };
  const loadCalendarEvents = async () => {
    try {
      const calendarEventsRef = collection(db, 'users', currentUserId, 'calendarEvents');
      const querySnapshot = await getDocs(calendarEventsRef);

      const events = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate()
      }));

      // Здесь можно объединить с обычными событиями календаря
      console.log('📅 События календаря загружены:', events);

    } catch (error) {
      console.error('❌ Ошибка загрузки событий календаря:', error);
    }
  };

  const deleteEvent = async (eventId) => {
    try {
      await deleteEventFromFirebase(eventId);
      setEvents(prev => prev.filter(event => event.id !== eventId));
      setShowEventModal(false);
      setEventToEdit(null);
    } catch (error) {
      console.error('❌ Ошибка удаления события:', error);
    }
  };
  const toggleEventCompletion = async (eventId) => {
    try {
      const event = events.find(e => e.id === eventId);
      const updatedEvent = { ...event, done: !event.done };

      await saveEventToFirebase(updatedEvent);
      setEvents(prev => prev.map(e => e.id === eventId ? updatedEvent : e));
      setSelectedDayEvents(prev => prev.map(e => e.id === eventId ? updatedEvent : e));

    } catch (error) {
      console.error('❌ Ошибка обновления статуса:', error);
    }
  };
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  return (
    <View style={styles.container}>
      <Modal
        visible={showEventModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => {
          setShowEventModal(false);
          setEventToEdit(null);
        }}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {eventToEdit ? 'Редактировать событие' : 'Добавить событие'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Название события"
              value={newEvent.title}
              onChangeText={(text) => setNewEvent(prev => ({ ...prev, title: text }))}
            />

            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={newEvent.time ? styles.timeText : styles.placeholderText}>
                {newEvent.time || 'Выберите время'}
              </Text>
            </TouchableOpacity>

            {showTimePicker && (
              <DateTimePicker
                value={new Date()}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedTime) => {
                  setShowTimePicker(false);
                  if (selectedTime) {
                    const timeString = format(selectedTime, 'HH:mm');
                    setNewEvent(prev => ({ ...prev, time: timeString }));
                  }
                }}
              />
            )}

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Описание (необязательно)"
              value={newEvent.description}
              onChangeText={(text) => setNewEvent(prev => ({ ...prev, description: text }))}
              multiline
              numberOfLines={3}
            />

            <Text style={styles.selectedDateText}>
              Дата: {format(selectedDate, 'dd.MM.yyyy', { locale: ru })}
            </Text>

            <View style={styles.modalButtons}>
              {eventToEdit && (
                <TouchableOpacity
                  style={[styles.modalButton, styles.deleteButton]}
                  onPress={() => deleteEvent(eventToEdit.id)}
                >
                  <Text style={styles.deleteButtonText}>Удалить</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowEventModal(false);
                  setEventToEdit(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Отмена</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveEvent}
              >
                <Text style={styles.saveButtonText}>Сохранить</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      <Modal
        visible={showEventsPopup}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowEventsPopup(false)}
      >
        <View style={styles.popupOverlay}>
          <View style={styles.popupContent}>
            <Text style={styles.popupTitle}>
              События на {format(selectedDayDate, 'dd.MM.yyyy', { locale: ru })}
            </Text>

            <ScrollView style={styles.popupEventsList}>
              {selectedDayEvents
                .sort((a, b) => (a.time > b.time ? 1 : -1))
                .map((event) => (
                  <TouchableOpacity
                    key={event.id}
                    style={[styles.popupEventItem, event.done && styles.completedEvent]}
                    onPress={() => {
                      editEvent(event);
                      setShowEventsPopup(false);
                    }}
                    onLongPress={() => toggleEventCompletion(event.id)}
                  >
                    <Text style={styles.popupEventTime}>{event.time}</Text>
                    <Text style={styles.popupEventTitle}>{event.title}</Text>
                    {event.done && <Text style={styles.checkmark}> ✓</Text>}
                  </TouchableOpacity>
                ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.popupCloseButton}
              onPress={() => setShowEventsPopup(false)}
            >
              <Text style={styles.popupCloseText}>Закрыть</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {renderHeader()}
      {renderDays()}
      <ScrollView style={styles.calendarContainer}>
        {renderCells()}
      </ScrollView>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#7585cdff',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  headerButton: {
    padding: 8,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerMonth: {
    fontSize: 20,
    fontFamily: 'Gilroy-Bold',
    color: '#fff',
    textTransform: 'capitalize',
  },
  headerYear: {
    fontSize: 14,
    fontFamily: 'Gilroy-Regular',
    color: 'rgba(255,255,255,0.8)',
  },
  daysRow: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  dayHeader: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  dayHeaderText: {
    fontSize: 12,
    fontFamily: 'Gilroy-SemiBold',
    color: '#6c757d',
    textTransform: 'uppercase',
  },
  calendarContainer: {
    flex: 1,
  },
  calendarBody: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  cell: {
    flex: 1,
    minHeight: 100,
    padding: 8,
    borderRightWidth: 0,
    borderRightColor: '#e9ecef',
    backgroundColor: '#fff',
  },
  disabledCell: {
    backgroundColor: '#f8f9fa',
  },
  selectedCell: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
    borderWidth: 2,
  },
  todayCell: {
    backgroundColor: '#fff3e0',
  },
  cellNumber: {
    fontSize: 14,
    fontFamily: 'Gilroy-Bold',
    color: '#374151',
    marginBottom: 4,
  },
  disabledText: {
    color: '#9ca3af',
  },
  todayText: {
    color: '#ff9800',
  },
  eventsContainer: {
    flex: 1,
  },
  eventItem: {
    backgroundColor: '#7585cdff',
    padding: 4,
    borderRadius: 4,
    marginBottom: 2,
  },
  eventText: {
    fontSize: 10,
    fontFamily: 'Gilroy-Regular',
    color: '#fff',
  },
  moreEventsText: {
    fontSize: 9,
    color: '#6b7280',
    fontFamily: 'Gilroy-Regular',
    marginTop: 2,
  },
  addButton: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Gilroy-Bold',
    color: '#7585cdff',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    fontFamily: 'Gilroy-Regular',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  selectedDateText: {
    fontSize: 14,
    color: '#6b7280',
    fontFamily: 'Gilroy-Regular',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: '#7585cdff',
  },
  saveButton: {
    backgroundColor: '#7585cdff',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
  },
  cancelButtonText: {
    color: '#fff',
    fontFamily: 'Gilroy-Bold',
    letterSpacing: -1,
  },
  saveButtonText: {
    color: '#fff',
    fontFamily: 'Gilroy-Bold',
    letterSpacing: -1,
    marginHorizontal: -6,

  },
  deleteButtonText: {
    color: '#fff',
    fontFamily: 'Gilroy-Bold',
    letterSpacing: -1,
  },
  completedEvent: {
    backgroundColor: '#10B981',
    opacity: 0.8,
  },
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    width: 60,
    textAlign: 'center',
    fontSize: 16,
  },
  timeSeparator: {
    fontSize: 16,
    marginHorizontal: 8,
  },
  timeConfirmButton: {
    backgroundColor: '#7585cdff',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeConfirmText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  timeText: {
    fontSize: 16,
    color: '#000',
  },
  placeholderText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  popupOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  popupContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  popupTitle: {
    fontSize: 18,
    fontFamily: 'Gilroy-Bold',
    color: '#7585cdff',
    marginBottom: 15,
    textAlign: 'center',
  },
  popupEventsList: {
    maxHeight: 300,
  },
  popupEventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  popupEventTime: {
    fontSize: 14,
    fontFamily: 'Gilroy-SemiBold',
    color: '#7585cdff',
    width: 60,
  },
  popupEventTitle: {
    fontSize: 14,
    fontFamily: 'Gilroy-Regular',
    color: '#374151',
    flex: 1,
  },
  checkmark: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: 'bold',
  },
  popupCloseButton: {
    backgroundColor: '#7585cdff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  popupCloseText: {
    color: '#fff',
    fontFamily: 'Gilroy-SemiBold',
    fontSize: 16,
  },
});
export default Calendar;