import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, TextInput, KeyboardAvoidingView, Platform, Dimensions, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db } from './firebase';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import Svg, { Path, Circle, G } from 'react-native-svg';
import Calendar from './components/Calendar';
import { format } from 'date-fns';
import { kk } from 'date-fns/locale';
import { Linking } from 'react-native';
import {
  doc, setDoc, getDoc, updateDoc,
  collection, query, where, getDocs,
  arrayUnion, arrayRemove,
  onSnapshot, addDoc, deleteDoc
} from 'firebase/firestore';
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const { height: screenHeight } = Dimensions.get('window');
// Данные метрик.
const metrics = [
  { title: 'Шаги', value: 0, unit: 'шагов', target: 10000 },
  { title: 'Сон', value: '0ч 0м', unit: '', target: 8 },
  { title: 'Активность', value: '0', unit: '', target: 100 },
];
const SadEmoji = ({ size = 32, color = "#a2b4d7" }) => (
  <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <G>
      <Path
        d="M32,61A29,29,0,1,1,61,32,29,29,0,0,1,32,61ZM32,5A27,27,0,1,0,59,32,27,27,0,0,0,32,5ZM42,28a6,6,0,1,1,6-6A6,6,0,0,1,42,28Zm0-10a4,4,0,1,0,4,4A4,4,0,0,0,42,18ZM22,28a6,6,0,1,1,6-6A6,6,0,0,1,22,28Zm0-10a4,4,0,1,0,4,4A4,4,0,0,0,22,18ZM40,42a8,8,0,0,0-16,0,1,1,0,0,0,2,0,6,6,0,0,1,12,0,1,1,0,0,0,2,0Z"
        fill={color}
      />
    </G>
  </Svg>
);
const HappyEmoji = ({ size = 32, color = "#a2b4d7" }) => (
  <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <G>
      <Path
        d="M42,28a6,6,0,1,1,6-6A6,6,0,0,1,42,28Zm0-10a4,4,0,1,0,4,4A4,4,0,0,0,42,18ZM22,28a6,6,0,1,1,6-6A6,6,0,0,1,22,28Zm0-10a4,4,0,1,0,4,4A4,4,0,0,0,22,18ZM48.14,36.22l.53-.47a1,1,0,0,0-1.34-1.5l-.53.49C44.21,37.08,39.88,41,32,41s-12.21-3.92-14.8-6.26l-.53-.49a1,1,0,1,0-1.34,1.5l.53.47C18.66,38.75,23.35,43,32,43S45.34,38.75,48.14,36.22ZM32,61A29,29,0,1,1,61,32,29,29,0,0,1,32,61ZM32,5A27,27,0,1,0,59,32,27,27,0,0,0,32,5Z"
        fill={color}
      />
    </G>
  </Svg>
);

const NeutralEmoji = ({ size = 32, color = "#a2b4d7" }) => (
  <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <G>
      <Path
        d="M32,61A29,29,0,1,1,61,32,29,29,0,0,1,32,61ZM32,5A27,27,0,1,0,59,32,27,27,0,0,0,32,5ZM42,28a6,6,0,1,1,6-6A6,6,0,0,1,42,28Zm0-10a4,4,0,1,0,4,4A4,4,0,0,0,42,18ZM22,28a6,6,0,1,1,6-6A6,6,0,0,1,22,28Zm0-10a4,4,0,1,0,4,4A4,4,0,0,0,22,18ZM43,37a1,1,0,0,0-1-1H22a1,1,0,0,0,0,2H42A1,1,0,0,0,43,37Z"
        fill={color}
      />
    </G>
  </Svg>
);

// Аффирмации
const affirmations = [
  "Ты молодец! Продолжай в том же духе 💪",
  "Отдыхай и улыбайся 😊",
  "Маленький шаг сегодня — большой успех завтра 🌟",
  "Ты справишься, как всегда 💪",
  "Каждый день — новый шанс ✨",
  "Ты делаешь больше, чем кажется 🌿",
  "Главное — не останавливаться 🚀",
  "Всё получится, просто верь 💫",
  "Сегодня — отличный день начать 🌞",
  "Ты достоин(а) самого лучшего 🌸",
  "Шаг за шагом — и ты на вершине 🏔️",
  "Спокойствие — твоя сила 🌙",
  "Слушай себя и действуй ❤️",
  "Ты уже на правильном пути 🌟",
  "Каждый день делает тебя сильнее 💪",
  "Не спеши — всё идёт, как нужно 🍃",
  "Ты — источник света и вдохновения ✨",
  "Мир улыбается тебе 😊",
  "Ошибки — это шаги к успеху 🚶‍♀️",
  "Ты заслуживаешь всего, о чём мечтаешь 💭",
  "Сохраняй спокойствие и веру 🌙",
  "Ты умеешь больше, чем думаешь 💫",
  "Пусть сегодня будет добрым днём ☀️",
  "Ты растёшь и развиваешься каждый день 🌱",
  "Любовь к себе — начало всего ❤️",
  "Доверься жизни, она на твоей стороне 🌈",
  "Ты — сила, которую невозможно остановить ⚡",
  "Твоё время приходит 🌅",
  "Ты излучаешь доброту и уверенность 🌼",
  "Вселенная поддерживает твои шаги 💫",
  "Главное — быть собой 💖",
  "Всё, что тебе нужно, уже внутри тебя 🌸",
  "Ты способен(на) на чудеса 🌠",
];
const moodOptions = [
  { emoji: 'happy', component: HappyEmoji, label: 'Радостно' },
  { emoji: 'neutral', component: NeutralEmoji, label: 'Нормально' },
  { emoji: 'sad', component: SadEmoji, label: 'Грустно' },
];
export default function App() {
  const openTelegramBot = () => {
    const telegramBotUrl = 'https://t.me/trackertech_bot';

    Linking.openURL(telegramBotUrl).catch(err => {
      console.error('Ошибка открытия Telegram:', err);
      alert('Не удалось открыть Telegram. Убедитесь, что приложение установлено.');
    });
  };

  const MoodCarousel = ({ onMarkComplete }) => {
    const [selectedIndex, setSelectedIndex] = useState(1);
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [isMarked, setIsMarked] = useState(false);
    const [currentMoodLabel, setCurrentMoodLabel] = useState(moodOptions[1].label);
    const itemWidth = 80;
    const spacing = 35;
    const totalWidth = itemWidth + spacing;

    const [currentPositions, setCurrentPositions] = useState([-totalWidth, 0, totalWidth]);

    const translateAnims = moodOptions.map((_, i) =>
      useRef(new Animated.Value(currentPositions[i])).current
    );

    // Анимации для скрытия карусели
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const translateYAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    // Загружаем данные из Firebase
    useEffect(() => {
      const loadMoodDataFromFirebase = async () => {
        try {
          const docSnap = await getDoc(doc(db, 'users', currentUserId));
          if (docSnap.exists()) {
            const data = docSnap.data();

            let loadedIndex = 1;

            if (data.selectedMoodIndex !== undefined) {
              loadedIndex = data.selectedMoodIndex;
            } else if (data.mood && data.mood.emoji) {
              const savedMoodIndex = moodOptions.findIndex(option => option.emoji === data.mood.emoji);
              if (savedMoodIndex !== -1) {
                loadedIndex = savedMoodIndex;
              }
            }

            if (data.moodPositions && data.moodPositions.length === 3) {
              Animated.parallel(
                moodOptions.map((_, i) =>
                  Animated.spring(translateAnims[i], {
                    toValue: data.moodPositions[i],
                    tension: 30,
                    friction: 15,
                    useNativeDriver: true,
                  })
                )
              ).start(() => {
                setCurrentPositions(data.moodPositions);
              });
            }

            setSelectedIndex(loadedIndex);
            setCurrentMood(moodOptions[loadedIndex]);
          }
        } catch (error) {
          console.error('❌ Ошибка загрузки настроения:', error);
        } finally {
          setIsDataLoaded(true);
        }
      };

      loadMoodDataFromFirebase();
    }, [currentUserId]);

    const savePositionsToFirebase = async (positions, selectedIdx) => {
      try {
        await updateDoc(doc(db, 'users', currentUserId), {
          moodPositions: positions,
          selectedMoodIndex: selectedIdx,
          lastUpdated: new Date()
        });
      } catch (error) {
        console.error('❌ Ошибка сохранения позиций:', error);
      }
    };

    const handleMoodSelect = (mood, index) => {
      if (!isDataLoaded || isMarked) return;

      const direction = index - selectedIndex;

      const newPositions = moodOptions.map((_, i) => {
        if (direction > 0) {
          if (i === index) return 0;
          if (i === selectedIndex) return -totalWidth;
          return totalWidth;
        } else if (direction < 0) {
          if (i === index) return 0;
          if (i === selectedIndex) return totalWidth;
          return -totalWidth;
        }
        return currentPositions[i];
      });

      setSelectedIndex(index);
      setCurrentMoodLabel(mood.label);

      Animated.parallel(
        moodOptions.map((_, i) =>
          Animated.spring(translateAnims[i], {
            toValue: newPositions[i],
            tension: 30,
            friction: 15,
            useNativeDriver: true,
          })
        )
      ).start(() => {
        setCurrentPositions(newPositions);
        savePositionsToFirebase(newPositions, index);
      });
    };

    // Функция для отметки настроения
    const handleMarkMood = () => {
      if (!isDataLoaded || isMarked) return;

      console.log('🚀 Запускаем анимацию скрытия...');

      // Запускаем анимацию
      Animated.parallel([
        Animated.timing(translateYAnim, {
          toValue: -200,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.7,
          duration: 600,
          useNativeDriver: true,
        })
      ]).start(({ finished }) => {
        if (finished) {
          console.log('✅ Анимация завершена, скрываем карусель');
          setIsMarked(true);
          // Вызываем колбэк для анимации нижней части
          if (onMarkComplete) {
            onMarkComplete();
          }
        }
      });
    };

    // Если настроение отмечено, не показываем карусель
    if (isMarked) {
      return null;
    }

    return (
      <Animated.View
        style={[
          styles.moodContent,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim }
            ]
          }
        ]}
      >
        <Text style={styles.greeting}>Привет!</Text>
        <Text style={styles.moodQuestion}>Как ваше самочувствие?</Text>

        <View style={styles.moodCarouselWrapper}>
          {moodOptions.map((mood, index) => {
            const EmojiComponent = mood.component;
            const isSelected = index === selectedIndex;

            return (
              <Animated.View
                key={index}
                style={[
                  styles.moodItem,
                  isSelected && styles.moodItemSelected,
                  {
                    transform: [{ translateX: translateAnims[index] }]
                  }
                ]}
              >
                <TouchableOpacity
                  onPress={() => handleMoodSelect(mood, index)}
                  style={styles.moodTouchable}
                  disabled={!isDataLoaded}
                >
                  <EmojiComponent
                    size={isSelected ? 50 : 50}
                    color={isSelected ? '#a2b4d7' : '#a2b4d7'} />
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
        <View style={styles.moodLabelContainer}>
          <Text style={styles.moodLabelText}>{currentMoodLabel}</Text>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.psychologistButton}
            onPress={handleMarkMood}
            disabled={!isDataLoaded}
          >
            <Text style={styles.psychologistButtonText}>отметить</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.psychologistMainButton}
            onPress={openTelegramBot}
          >
            <Text style={styles.psychologistMainButtonText}>психолог</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };
  // Состояния трекера
  const [meals, setMeals] = useState({ breakfast: false, lunch: false, dinner: false });
  const [water, setWater] = useState(0);
  const [affirmation, setAffirmation] = useState(affirmations[0]);
  const [steps, setSteps] = useState(0);
  const [activeTab, setActiveTab] = useState('home');
  const [currentUserId, setCurrentUserId] = useState('user123');
  const [showUserSwitch, setShowUserSwitch] = useState(false);
  const [showTopSection, setShowTopSection] = useState(true);
  const [friends, setFriends] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [friendRequests, setFriendRequests] = useState({
    incoming: [],
    outgoing: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [searchUsername, setSearchUsername] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [meetings, setMeetings] = useState([]);
  const [showCreateMeeting, setShowCreateMeeting] = useState(false);
  const [allUsersData, setAllUsersData] = useState({});
  const [currentMood, setCurrentMood] = useState(moodOptions[1]);
  const [showMoodQuestion, setShowMoodQuestion] = useState(true);
  const [selectedMood, setSelectedMood] = useState(null);
  const [showMoodCarousel, setShowMoodCarousel] = useState(true);
  const [stepGoal, setStepGoal] = useState(10000);
  const [waterGoal, setWaterGoal] = useState(2);
  const [showStepGoalModal, setShowStepGoalModal] = useState(false);
  const [showWaterGoalModal, setShowWaterGoalModal] = useState(false);
  const [tempStepGoal, setTempStepGoal] = useState(stepGoal);
  const [tempWaterGoal, setTempWaterGoal] = useState(waterGoal);
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    friends: []
  });
  const [fontsLoaded] = useFonts({
    'Gilroy-Regular': Inter_400Regular,
    'Gilroy-SemiBold': Inter_600SemiBold,
    'Gilroy-Bold': Inter_700Bold,
  });
  const loadAllUsersData = async () => {
    try {
      const usersRef = collection(db, 'users');
      const querySnapshot = await getDocs(usersRef);

      const usersData = {};
      querySnapshot.forEach(doc => {
        usersData[doc.id] = doc.data();
      });

      setAllUsersData(usersData);
      console.log('✅ Загружены данные всех пользователей:', Object.keys(usersData));
    } catch (error) {
      console.error('❌ Ошибка загрузки данных пользователей:', error);
    }
  };

  const deleteFriend = async (friendId) => {
    try {
      const chatId = [friendId, currentUserId].sort().join('_');

      // Удаляем у текущего пользователя
      await updateDoc(doc(db, 'users', currentUserId), {
        friends: arrayRemove(friendId)
      });

      // Удаляем у друга
      await updateDoc(doc(db, 'users', friendId), {
        friends: arrayRemove(currentUserId)
      });
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      const messagesSnapshot = await getDocs(messagesRef);
      const deletePromises = messagesSnapshot.docs.map(messageDoc =>
        deleteDoc(doc(db, 'chats', chatId, 'messages', messageDoc.id))
      );
      await Promise.all(deletePromises);
      const chatDocRef = doc(db, 'chats', chatId);
      const chatDoc = await getDoc(chatDocRef);
      if (chatDoc.exists()) {
        await deleteDoc(chatDocRef);
      }
      const meetingsRef = collection(db, 'meetings');
      const meetingsQuery = query(
        meetingsRef,
        where('participants', 'array-contains', currentUserId)
      );
      const meetingsSnapshot = await getDocs(meetingsQuery);

      const meetingDeletePromises = meetingsSnapshot.docs
        .filter(meetingDoc => {
          const meetingData = meetingDoc.data();
          // Удаляем встречи где оба участника - текущий пользователь и удаляемый друг
          return meetingData.participants.includes(friendId);
        })
        .map(meetingDoc => deleteDoc(doc(db, 'meetings', meetingDoc.id)));
      await Promise.all(meetingDeletePromises);
      await Promise.all(meetingDeletePromises);
      // Обновляем локальные данные
      setFriends(friends.filter(friend => friend !== friendId));
      setMessages([]);
      setActiveChat(null);
      setMeetings(prevMeetings =>
        prevMeetings.filter(meeting =>
          !meeting.participants.includes(friendId)
        )
      );

      // Возвращаемся к списку друзей
      setActiveTab('friends');
      setSelectedFriend(null);

      console.log('✅ Друг удален');
    } catch (error) {
      console.error('❌ Ошибка удаления друга:', error);
    }
  };
  const updateTime = () => {
    setLastUpdated(new Date());
  };
  const saveAllData = async () => {
    try {
      console.log('🔄 Пытаюсь сохранить данные...');
      await setDoc(doc(db, 'users', currentUserId), {
        username: currentUserId,
        steps: steps,
        water: water,
        meals: meals,
        affirmation: affirmation,
        friends: friends,
        friendRequests: friendRequests,
        lastUpdated: new Date()

      });
      console.log('✅ Данные УСПЕШНО сохранены в Firebase');
      updateTime();
    } catch (error) {
      console.error('❌ Ошибка сохранения:', error);
    }
  };
  const handleMarkComplete = () => {
    // Просто скрываем верхнюю секцию
    setShowMoodCarousel(false);
  };
  const renderChatScreen = () => (
    <KeyboardAvoidingView
      style={styles.chatScreen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      {/* Шапка чата */}
      <View style={styles.chatHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            setActiveTab('friends');
            setSelectedFriend(null);
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
          <Text style={styles.backText}>Назад</Text>
        </TouchableOpacity>
        <Text style={styles.chatFriendName}>
          Чат с {getUserName(selectedFriend)}
        </Text>
        <TouchableOpacity
          style={styles.deleteFriendButton}
          onPress={() => deleteFriend(selectedFriend)}
        >
          <Ionicons name="trash-outline" size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>

      {/* Сообщения */}
      <ScrollView style={styles.chatMessages}>
        <View style={styles.systemMessage}>
          <Text style={styles.systemMessageText}>
            Здравствуйте, меня зовут {getUserName(selectedFriend)}, я ваш друг. Давайте общаться!
          </Text>
        </View>

        {messages.map(message => (
          <View key={message.id} style={[
            styles.messageBubble,
            message.sender === currentUserId ? styles.myMessage : styles.friendMessage
          ]}>
            <Text style={[
              styles.messageText,
              message.sender === currentUserId && styles.myMessageText
            ]}>
              {message.text}
            </Text>
            <Text style={styles.messageTime}>
              {new Date(message.timestamp?.toDate()).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Ввод сообщения */}
      <View style={styles.chatInputContainer}>
        <TextInput
          style={styles.chatInput}
          placeholder="Напишите сообщение..."
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView >
  );
  const loadFriendsData = async () => {
    try {
      console.log('🔄 Загружаю данные друзей для:', currentUserId);
      const docSnap = await getDoc(doc(db, 'users', currentUserId));

      if (docSnap.exists()) {
        const data = docSnap.data();
        setFriends(data.friends || []);
        setFriendRequests(data.friendRequests || { incoming: [], outgoing: [] });
        console.log('✅ Данные друзей загружены:', {
          friends: data.friends,
          requests: data.friendRequests
        });
      } else {
        console.log('📝 Пользователь не найден, создаем структуру друзей');
        setFriends([]);
        setFriendRequests({ incoming: [], outgoing: [] });
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки данных друзей:', error);
    }
  };
  const searchUsers = async () => {
    if (!searchUsername.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const usersRef = collection(db, 'users');
      const querySnapshot = await getDocs(usersRef);

      const results = [];
      querySnapshot.forEach(doc => {
        const userData = doc.data();
        if (doc.id !== currentUserId &&
          !friends?.includes(doc.id) &&
          userData.username?.toLowerCase().includes(searchUsername.toLowerCase())) {
          results.push({
            id: doc.id,
            username: userData.username,
            name: userData.name,
            steps: userData.steps || 0,
            water: userData.water || 0
          });
        }
      });

      setSearchResults(results);
    } catch (error) {
      console.error('Ошибка поиска:', error);
    }
  };

  const sendFriendRequest = async (userId) => {
    try {
      console.log('📤 Отправляем заявку пользователю:', userId);

      // Добавляем в исходящие заявки
      await updateDoc(doc(db, 'users', currentUserId), {
        friendRequests: {
          outgoing: arrayUnion(userId),
          incoming: friendRequests.incoming || []
        }
      });

      // Добавляем пользователю входящую заявку
      await updateDoc(doc(db, 'users', userId), {
        friendRequests: {
          incoming: arrayUnion(currentUserId),
          outgoing: friendRequests.outgoing || []
        }
      });

      // ОБНОВЛЯЕМ ЛОКАЛЬНЫЕ ДАННЫЕ
      setFriendRequests(prevRequests => ({
        ...prevRequests,
        outgoing: [...prevRequests.outgoing, userId]
      }));

      console.log('✅ Запрос в друзья отправлен!');
    } catch (error) {
      console.error('❌ Ошибка отправки запроса:', error);
    }
  };

  const acceptFriendRequest = async (userId) => {
    if (friends?.includes(userId)) {
      console.log('⚠️ Этот пользователь уже в друзьях');
      return;
    }
    try {
      console.log('✅ Принимаем заявку от:', userId);

      // Добавляем в друзья текущему пользователю
      await updateDoc(doc(db, 'users', currentUserId), {
        friends: arrayUnion(userId),
        'friendRequests.incoming': arrayRemove(userId)
      });

      // Добавляем текущего пользователя в друзья тому, кто отправил заявку
      await updateDoc(doc(db, 'users', userId), {
        friends: arrayUnion(currentUserId),
        'friendRequests.outgoing': arrayRemove(currentUserId)
      });

      // ОБНОВЛЯЕМ ЛОКАЛЬНЫЕ ДАННЫЕ
      setFriends(prevFriends => [...prevFriends, userId]);
      setFriendRequests(prevRequests => ({
        ...prevRequests,
        incoming: prevRequests.incoming.filter(id => id !== userId)
      }));

      console.log('✅ Запрос принят! Друг добавлен.');
    } catch (error) {
      console.error('❌ Ошибка принятия запроса:', error);
    }
  };
  const declineFriendRequest = async (userId) => {
    try {
      console.log('❌ Отклоняем заявку от:', userId);

      // Удаляем входящую заявку у текущего пользователя
      await updateDoc(doc(db, 'users', currentUserId), {
        'friendRequests.incoming': arrayRemove(userId)
      });

      // Удаляем исходящую заявку у пользователя, который отправил
      await updateDoc(doc(db, 'users', userId), {
        'friendRequests.outgoing': arrayRemove(currentUserId)
      });

      // ОБНОВЛЯЕМ ЛОКАЛЬНЫЕ ДАННЫЕ
      setFriendRequests(prevRequests => ({
        ...prevRequests,
        incoming: prevRequests.incoming.filter(id => id !== userId)
      }));

      console.log('✅ Запрос отклонен!');
    } catch (error) {
      console.error('❌ Ошибка отклонения запроса:', error);
    }
  };
  const openChat = async (friendId) => {
    try {
      // Создаем или находим ID чата
      const chatId = [friendId, currentUserId].sort().join('_');
      setActiveChat(chatId);

      // Подписываемся на сообщения чата
      const unsubscribe = onSnapshot(
        collection(db, 'chats', chatId, 'messages'),
        (snapshot) => {
          const chatMessages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })).sort((a, b) => a.timestamp - b.timestamp);
          setMessages(chatMessages);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('Ошибка открытия чата:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeChat) return;

    try {
      await addDoc(collection(db, 'chats', activeChat, 'messages'), {
        text: newMessage,
        sender: currentUserId,
        timestamp: new Date(),
        read: false
      });
      setNewMessage('');
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
    }
  };
  const createMeeting = async () => {
    try {
      const dateString = `${newMeeting.date}T${newMeeting.time}:00`;
      const meetingDate = new Date(dateString);

      // Проверка даты
      if (isNaN(meetingDate.getTime())) {
        console.error('Неверная дата или время');
        return;
      }
      const meetingData = {
        title: newMeeting.title,
        description: newMeeting.description,
        date: meetingDate,
        creator: currentUserId,
        participants: [currentUserId, ...newMeeting.friends],
        status: 'planned',
        createdAt: new Date()
      };
      await addDoc(collection(db, 'meetings'), meetingData);
      await loadMeetings();
      setShowCreateMeeting(false);
      setNewMeeting({ title: '', description: '', date: '', time: '', friends: [] });
      console.log('Встреча создана!');
    } catch (error) {
      console.error('Ошибка создания встречи:', error);
    }
  };
  const deleteMeeting = async (meetingId) => {
    try {
      await deleteDoc(doc(db, 'meetings', meetingId));
      setMeetings(meetings.filter(meeting => meeting.id !== meetingId));
      console.log('✅ Встреча удалена');
    } catch (error) {
      console.error('❌ Ошибка удаления встречи:', error);
    }
  };

  const loadMeetings = async () => {
    try {
      const meetingsRef = collection(db, 'meetings');
      const q = query(meetingsRef, where('participants', 'array-contains', currentUserId));
      const querySnapshot = await getDocs(q);

      const meetingsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMeetings(meetingsList);
    } catch (error) {
      console.error('Ошибка загрузки встреч:', error);
    }
  };
  const BalanceDashboard = () => {
    const [selectedPeriod, setSelectedPeriod] = useState('week');
    const [weeklyData, setWeeklyData] = useState([
      { day: 'ПН', balance: 85, status: 'excellent' },
      { day: 'ВТ', balance: 72, status: 'good' },
      { day: 'СР', balance: 90, status: 'excellent' },
      { day: 'ЧТ', balance: 45, status: 'poor' },
      { day: 'ПТ', balance: 78, status: 'good' },
      { day: 'СБ', balance: 95, status: 'excellent' },
      { day: 'ВС', balance: 68, status: 'good' }
    ]);

    const getStatusEmoji = (status) => {
      switch (status) {
        case 'excellent': return '🟢';
        case 'good': return '🟡';
        case 'poor': return '🔴';
        default: return '⚪';
      }
    };

    const getProgressWidth = (value) => {
      return `${Math.max(10, value)}%`;
    };

    const metrics = {
      overallBalance: 78,
      activeDays: '6/7',
      completedGoals: '24/30',
      water: { value: 75, current: 6, target: 8 },
      meals: { value: 67, current: 2, target: 3 },
      activity: { value: 85, current: 8.5, target: 10 },
      mood: { value: 84, current: 4.2, target: 5 }
    };

    return (
      <View style={styles.dashboardContainer}>
        {/* Заголовок */}
        <View style={styles.dashboardHeader}>
          <Text style={styles.dashboardTitle}>Таблица прогресса</Text>
          <View style={styles.headerInfo}>
            <View style={styles.periodSelector}>
              <TouchableOpacity
                style={[styles.periodButton, selectedPeriod === 'week' && styles.periodButtonActive]}
                onPress={() => setSelectedPeriod('week')}
              >
                <Text style={[styles.periodText, selectedPeriod === 'week' && styles.periodTextActive]}>
                  Неделя
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.periodButton, selectedPeriod === 'month' && styles.periodButtonActive]}
                onPress={() => setSelectedPeriod('month')}
              >
                <Text style={[styles.periodText, selectedPeriod === 'month' && styles.periodTextActive]}>
                  Месяц
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.updateTime}>
              Обновлено: {lastUpdated.toLocaleDateString('ru-RU', {
                month: 'long',
                day: 'numeric'
              })} {lastUpdated.toLocaleTimeString('kk-KZ', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </View>
        </View>

        {/* Основные метрики */}
        <View style={styles.overviewSection}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="stats-chart" size={18} color='#7585cdff' /> ОСНОВНЫЕ МЕТРИКИ:
          </Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>Баланс:</Text>
              <Text style={styles.metricLabel}>{metrics.overallBalance}%</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>Актив:</Text>
              <Text style={styles.metricLabel}>{metrics.activeDays} дней</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>Завер:</Text>
              <Text style={styles.metricLabel}>{metrics.completedGoals} целей</Text>
            </View>
          </View>
        </View>

        {/* Heatmap недели */}
        <View style={styles.heatmapSection}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="calendar" size={18} color='#7585cdff' /> ТЕПЛОВАЯ КАРТА НЕДЕЛИ:
          </Text>
          <View style={styles.heatmap}>
            <View style={styles.heatmapDays}>
              {weeklyData.map((day, index) => (
                <Text key={index} style={styles.heatmapDayLabel}>{day.day}</Text>
              ))}
            </View>
            <View style={styles.heatmapStatus}>
              {weeklyData.map((day, index) => (
                <Text key={index} style={styles.heatmapEmoji}>
                  {getStatusEmoji(day.status)}
                </Text>
              ))}
            </View>
          </View>
        </View>

        {/* Прогресс метрики */}
        <View style={styles.progressSection}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="trending-up" size={18} color='#7585cdff' /> МЕТРИКИ ПРОГРЕССА:
          </Text>
          <View style={styles.progressGrid}>
            <View style={styles.progressCard}>
              <Text style={styles.progressIcon}>
                <Ionicons name="water" size={20} color='#7585cdff' />
              </Text>
              <Text style={styles.progressValue}>{metrics.water.value}%</Text>
              <Text style={styles.progressDetail}>
                {metrics.water.current}/{metrics.water.target} ст
              </Text>
            </View>
            <View style={styles.progressCard}>
              <Text style={styles.progressIcon}>
                <Ionicons name="restaurant" size={20} color='#7585cdff' />
              </Text>
              <Text style={styles.progressValue}>{metrics.meals.value}%</Text>
              <Text style={styles.progressDetail}>
                {metrics.meals.current}/{metrics.meals.target} приём
              </Text>
            </View>
            <View style={styles.progressCard}>
              <Text style={styles.progressIcon}>
                <Ionicons name="walk" size={20} color='#7585cdff' />
              </Text>
              <Text style={styles.progressValue}>{metrics.activity.value}%</Text>
              <Text style={styles.progressDetail}>
                {metrics.activity.current}к шаг
              </Text>
            </View>
            <View style={styles.progressCard}>
              <Text style={styles.progressIcon}>
                <Ionicons name="accessibility" size={20} color='#7585cdff' />
              </Text>
              <Text style={styles.progressValue}>{metrics.mood.value}%</Text>
              <Text style={styles.progressDetail}>
                {metrics.mood.current}/{metrics.mood.target}
              </Text>
            </View>
          </View>
        </View>

        {/* График тренда */}
        <View style={styles.trendSection}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="pulse" size={18} color='#7585cdff' /> ТРЕНД НЕДЕЛИ:
          </Text>
          <View style={styles.trendChart}>
            <View style={styles.trendYAxis}>
              <Text style={styles.trendLabel}>100% ┤</Text>
              <Text style={styles.trendLabel}>80% ┤</Text>
              <Text style={styles.trendLabel}>60% ┤</Text>
              <Text style={styles.trendLabel}>40% ┤</Text>
              <Text style={styles.trendLabel}>20% ┤</Text>
            </View>
            <View style={styles.trendLine}>
              <View style={[styles.trendPoint, { left: '0%' }]} />
              <View style={[styles.trendPoint, { left: '16%' }]} />
              <View style={[styles.trendPoint, { left: '33%' }]} />
              <View style={[styles.trendPoint, { left: '50%' }]} />
              <View style={[styles.trendPoint, { left: '66%' }]} />
              <View style={[styles.trendPoint, { left: '83%' }]} />
              <View style={[styles.trendPoint, { left: '100%' }]} />
            </View>
            <View style={styles.trendXAxis}>
              <Text style={styles.trendDay}>ПН</Text>
              <Text style={styles.trendDay}>ВТ</Text>
              <Text style={styles.trendDay}>СР</Text>
              <Text style={styles.trendDay}>ЧТ</Text>
              <Text style={styles.trendDay}>ПТ</Text>
              <Text style={styles.trendDay}>СБ</Text>
              <Text style={styles.trendDay}>ВС</Text>
            </View>
          </View>
        </View>

        {/* Инсайты */}
        <View style={styles.insightsSection}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="bulb" size={18} color='#7585cdff' /> ИНСАЙТЫ НЕДЕЛИ:
          </Text>
          <View style={styles.insightsList}>
            <Text style={styles.insightItem}>• Лучший день: Суббота (95% завершения)</Text>
            <Text style={styles.insightItem}>• Сложности: Четверг (только 35%)</Text>
            <Text style={styles.insightItem}>• Улучшение: Активность +15% vs прошлая неделя</Text>
            <Text style={styles.insightItem}>• Внимание: Потребление воды (-1.5 стакана)</Text>
          </View>
        </View>
      </View>
    );
  };
  // Загрузка данных
  useEffect(() => {
    if (activeTab !== 'friends') { setSearchResults([]); }
    const loadData = async () => {
      try {
        setIsLoading(true);
        const docSnap = await getDoc(doc(db, 'users', currentUserId));
        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log('📥 Данные загружены из Firebase:', data);
          setSteps(data.steps || 0);
          setWater(data.water || 0);
          setMeals(data.meals || { breakfast: false, lunch: false, dinner: false });
          setAffirmation(data.affirmation || affirmations[0]);
          setCurrentMood(data.mood || null);
          setFriends(data.friends || []);
          setFriendRequests(data.friendRequests || { incoming: [], outgoing: [] });
          if (data.mood && data.mood.emoji) {
            const savedMood = moodOptions.find(option => option.emoji === data.mood.emoji);
            setCurrentMood(savedMood || moodOptions[1]);
          }
        }

        else {
          setCurrentMood(moodOptions[1]);
          console.log('📝 Документ не найден, создаем новый');
          saveAllData();
        }
        loadMeetings();
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        console.error('❌ Ошибка загрузки:', error);
      }
    };
    loadData();
    loadAllUsersData();
  }, [currentUserId]);
  const getUserName = (userId) => {
    const users = {
      'user123': 'Мария',
      'user456': 'Анна',
      'user789': 'Максим'
    };
    return users[userId] || userId;
  };
  const [isMoodMarked, setIsMoodMarked] = useState(false);
  const handleMarkMood = () => {
    if (!isDataLoaded || isMarked) return;

    console.log('🚀 Запускаем анимацию скрытия...');

    // Запускаем анимацию скрытия карусели
    Animated.parallel([
      Animated.timing(translateYAnim, {
        toValue: -200,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.7,
        duration: 600,
        useNativeDriver: true,
      })
    ]).start(({ finished }) => {
      if (finished) {
        console.log('✅ Анимация завершена, скрываем карусель');
        setIsMarked(true);
        // Убираем верхнюю секцию полностью
        if (onMarkComplete) {
          onMarkComplete();
        }
      }
    });
  };
  useEffect(() => {
    // Изначально скрываем нижнюю часть
  }, []);
  // Автосохранение при изменении данных
  useEffect(() => {
    {
      saveAllData();
    }
  }, [steps, water, meals, affirmation, friends, friendRequests, currentMood]);
  // Считаем прогресс (максимум 4 задачи: 3 еды + вода)
  const progress = (Object.values(meals).filter(Boolean).length + Math.min(water, 4)) / 4;
  // Функция для добавления шагов
  const addSteps = () => {
    setSteps(steps + 1000);
  };
  const renderMoodSection = () => (
    <MoodCarousel onMarkComplete={handleMarkComplete} />
  );
  const renderContent = () => {
    if (activeTab === 'chat' && selectedFriend) {
      return (
        <View style={styles.fullScreenChat}>
          {renderChatScreen()}
        </View>
      );
    }
    switch (activeTab) {
      case 'home':
        return (
          <View style={styles.homeContainer}>
            {showMoodCarousel ? (
              <LinearGradient
                colors={['#BFD4FF', '#7585cdff']}
                style={styles.topSection}
              >
                {renderMoodSection()}
              </LinearGradient>
            ) : null}
            <ScrollView
              style={styles.bottomScrollView}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.horizontalMetrics}>
                <View style={styles.stepsContainer}>
                  <Text style={styles.stepsTitle}>Шагомер</Text>
                  <Text style={styles.stepsCount}>{steps}</Text>
                  <View style={styles.stepsProgress}>
                    <View style={[styles.stepsGoal, { width: `${(steps / stepGoal) * 100}%` }]} />
                  </View>
                  <Text style={styles.stepsGoaltext}>Цель: </Text>
                  <Text style={styles.stepsGoal}>{stepGoal} шагов</Text>
                </View>
                <View style={styles.stepsCircle}>
                  <Text style={styles.stepsCount}>{steps}</Text>
                  <Text style={styles.stepsLabel}>шагов</Text>
                </View>
                <View style={styles.stepsActions}>
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => {
                      setSteps(steps + 1000);
                      updateTime();
                    }}
                  >
                    <Ionicons name="add" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
                <View style={styles.headerWithCircle}>
                  <TouchableOpacity
                    style={styles.circleButtonFirst}
                    onPress={() => setShowStepGoalModal(true)}
                  >
                    <Ionicons name="pencil-outline" size={18} color='#fefeffff' />
                  </TouchableOpacity>
                </View>

                {/* Вода справа */}
                <View style={styles.waterTracker}>
                  <View style={styles.headerWithCircle}>
                    <Text style={styles.waterTitle}>Вода</Text>
                  </View>
                  <Text style={styles.waterAmount}>{Math.floor(water)} л</Text>
                  <View style={styles.waterActions}>
                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={() => {
                        setWater(Number((water + 0.25).toFixed(2)));
                        updateTime();
                      }}                    >
                      <Ionicons name="add" size={20} color="#fff" />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.waterProgress}>
                    <View style={[styles.waterProgressFill, { width: `${(water / waterGoal) * 100}%` }]} />
                  </View>
                  <Text style={styles.waterGoal}>Цель: </Text>
                  <Text style={styles.waterGoaltext}>{waterGoal} л</Text>
                </View>
                <View style={styles.waterFooter}>
                  <Ionicons name="wine-outline" size={120} color='#7585cdff' />
                </View>
                <TouchableOpacity
                  style={styles.circleButtonSecond}
                  onPress={() => setShowWaterGoalModal(true)}
                >
                  <Ionicons name="pencil-outline" size={18} color='#f8f8f8ff' />
                </TouchableOpacity>
              </View>
              {/* Аффирмация */}
              <View style={styles.section}>
                <View style={styles.affirmationCard}>
                  <Text style={styles.affirmationText}>{affirmation}</Text>
                  <TouchableOpacity
                    style={styles.newAffirmationButton}
                    onPress={() => {
                      let newAffirmation;
                      do {
                        newAffirmation = affirmations[Math.floor(Math.random() * affirmations.length)];
                      } while (newAffirmation === affirmation && affirmations.length > 1);
                      setAffirmation(newAffirmation);
                    }}
                  >
                    <Text style={styles.newAffirmationText}>Новая аффирмация</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.section}>
                <BalanceDashboard />
              </View>
            </ScrollView>
            {/* Модалка для изменения цели воды */}
            {showWaterGoalModal && (
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Изменить цель воды</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={String(tempWaterGoal)}
                    onChangeText={(text) => setTempWaterGoal(Number(text))}
                    placeholder="Введите цель в литрах"
                  />
                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => {
                        setShowWaterGoalModal(false);
                        setTempWaterGoal(waterGoal); // Сбрасываем на текущее значение
                      }}
                    >
                      <Text style={styles.cancelButtonText}>Отмена</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.createButton}
                      onPress={() => {
                        if (tempWaterGoal > 0) {
                          setWaterGoal(tempWaterGoal);
                          setShowWaterGoalModal(false);
                        } else {
                          alert('Пожалуйста, введите корректное значение');
                        }
                      }}
                    >
                      <Text style={styles.createButtonText}>Сохранить</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
            {/* Модалка для изменения цели шагов */}
            {showStepGoalModal && (
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Изменить цель шагов</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={String(tempStepGoal)}
                    onChangeText={(text) => setTempStepGoal(Number(text))}
                    placeholder="Введите цель шагов"
                  />
                  <View style={styles.modalButtons}>
                    <TouchableOpacity style={styles.cancelButton} onPress={() => setShowStepGoalModal(false)}>
                      <Text style={styles.cancelButtonText}>Отмена</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.createButton} onPress={() => {
                      setStepGoal(tempStepGoal);
                      setShowStepGoalModal(false);
                    }}>
                      <Text style={styles.createButtonText}>Сохранить</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          </View >

        );
      case 'friends':
        return (
          <ScrollView style={styles.friendsContainer} showsVerticalScrollIndicator={false}>
            {/* ЗАГОЛОВОК С ГРАДИЕНТОМ */}
            <LinearGradient
              colors={['#BFD4FF', '#7585cdff']}
              style={styles.friendsHeader}
            >
              <Text style={styles.friendsMainTitle}>Друзья</Text>
              <Text style={styles.friendsSubtitle}>Общайтесь и отслеживайте прогресс вместе</Text>

              {/* СТАТИСТИКА ДРУЗЕЙ */}
              <View style={styles.friendsStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{friends?.length || 0}</Text>
                  <Text style={styles.statLabel}>друзей</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{friendRequests?.incoming?.length || 0}</Text>
                  <Text style={styles.statLabel}>заявки</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{meetings?.length || 0}</Text>
                  <Text style={styles.statLabel}>встречи</Text>
                </View>
              </View>
            </LinearGradient>
            {/* ПОИСК ДРУЗЕЙ */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Найти друзей</Text>
              <View style={styles.searchContainer}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Введите никнейм..."
                  value={searchUsername}
                  onChangeText={setSearchUsername}
                />
                <TouchableOpacity style={styles.searchButton} onPress={searchUsers}>
                  <Text style={styles.searchButtonText}>Поиск</Text>
                </TouchableOpacity>
              </View>
              {/* РЕЗУЛЬТАТЫ ПОИСКА */}
              {searchResults.map(user => (
                <View key={user.id} style={styles.userCard}>
                  <Text style={styles.userName}>@{user.username}</Text>
                  <Text style={styles.userSteps}>Шаги: {user.steps}</Text>
                  <TouchableOpacity
                    style={styles.addFriendButton}
                    onPress={() => sendFriendRequest(user.id)}
                  >
                    <Text style={styles.addFriendButtonText}>Добавить в друзья</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* ВХОДЯЩИЕ ЗАПРОСЫ */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Запросы в друзья</Text>
              {friendRequests.incoming?.map((request, index) => (
                <View key={`request-${request}-${index}`} style={styles.requestCard}>
                  <Text style={styles.requestText}>Запрос от: {request}</Text>
                  <View style={styles.requestButtons}>
                    <TouchableOpacity
                      style={styles.acceptButton}
                      onPress={() => acceptFriendRequest(request)}
                    >
                      <Text style={styles.acceptButtonText}>Принять</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.declineButton}
                      onPress={() => declineFriendRequest(request)}
                    >
                      <Text style={styles.declineButtonText}>Отклонить</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
              {/* Если заявок нет */}
              {(!friendRequests.incoming || friendRequests.incoming.length === 0) && (
                <Text style={styles.noRequestsText}>Нет входящих заявок</Text>
              )}
            </View>

            {/* СПИСОК ДРУЗЕЙ */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Мои друзья</Text>
              {friends?.map((friend, index) => (
                <TouchableOpacity
                  key={`friend-${friend}-${index}`}
                  style={styles.friendCard}
                  onPress={() => {
                    setSelectedFriend(friend);
                    setActiveTab('chat');
                    openChat(friend);
                  }}
                >
                  <Text style={styles.friendName}>{friend}</Text>
                  <Text style={styles.friendStatus}>В сети</Text>
                </TouchableOpacity>
              ))}
              {(!friends || friends.length === 0) && (
                <Text style={styles.noFriendsText}>У вас пока нет друзей</Text>
              )}
            </View>
            {/* ВСТРЕЧИ С ДРУЗЬЯМИ */}
            <View style={styles.section}>
              <View style={styles.meetingsHeader}>
                <Text style={styles.sectionTitle}>Мои встречи</Text>
                <TouchableOpacity
                  style={styles.addMeetingButton}
                  onPress={() => setShowCreateMeeting(true)}
                >
                  <Text style={styles.addMeetingButtonText}>+ Создать встречу</Text>
                </TouchableOpacity>
              </View>

              {meetings.map(meeting => (
                <View key={meeting.id} style={styles.meetingCard}>
                  <Text style={styles.meetingTitle}>{meeting.title}</Text>
                  <Text style={styles.meetingDescription}>{meeting.description}</Text>
                  <Text style={styles.meetingDate}>
                    {new Date(meeting.date?.toDate()).toLocaleString()}
                  </Text>
                  <Text style={styles.meetingParticipants}>
                    Участники: {meeting.participants.join(', ')}
                  </Text>
                  <TouchableOpacity
                    style={styles.deleteMeetingButton}
                    onPress={() => deleteMeeting(meeting.id)}
                  >
                    <Text style={styles.deleteMeetingText}>Удалить встречу</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* МОДАЛКА СОЗДАНИЯ ВСТРЕЧИ */}
            {showCreateMeeting && (
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Создать встречу</Text>

                  <TextInput
                    style={styles.input}
                    placeholder="Название встречи"
                    value={newMeeting.title}
                    onChangeText={text => setNewMeeting({ ...newMeeting, title: text })}
                  />

                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Описание встречи"
                    value={newMeeting.description}
                    onChangeText={text => setNewMeeting({ ...newMeeting, description: text })}
                    multiline
                  />

                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Text style={styles.dateButtonText}>
                      {newMeeting.date || 'Выберите дату'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowTimePicker(true)}
                  >
                    <Text style={styles.dateButtonText}>
                      {newMeeting.time || 'Выберите время'}
                    </Text>
                  </TouchableOpacity>

                  {/* ДАТАПИКЕРЫ */}
                  {showDatePicker && (
                    <DateTimePicker
                      value={selectedDate}
                      mode="date"
                      display="default"
                      onChange={(event, date) => {
                        setShowDatePicker(false);
                        if (date) {
                          setSelectedDate(date);
                          setNewMeeting({
                            ...newMeeting,
                            date: date.toISOString().split('T')[0]
                          });
                        }
                      }}
                    />
                  )}

                  {showTimePicker && (
                    <DateTimePicker
                      value={selectedTime}
                      mode="time"
                      display="default"
                      onChange={(event, time) => {
                        setShowTimePicker(false);
                        if (time) {
                          setSelectedTime(time);
                          setNewMeeting({
                            ...newMeeting,
                            time: time.toTimeString().split(' ')[0].slice(0, 5)
                          });
                        }
                      }}
                    />
                  )}

                  <Text style={styles.friendsLabel}>Выберите друзей:</Text>
                  {friends.map(friend => (
                    <TouchableOpacity
                      key={friend}
                      style={styles.friendCheckbox}
                      onPress={() => {
                        const updatedFriends = newMeeting.friends.includes(friend)
                          ? newMeeting.friends.filter(f => f !== friend)
                          : [...newMeeting.friends, friend];
                        setNewMeeting({ ...newMeeting, friends: updatedFriends });
                      }}
                    >
                      <Text style={styles.friendCheckboxText}>
                        {newMeeting.friends.includes(friend) ? '✓ ' : '○ '}{friend}
                      </Text>
                    </TouchableOpacity>
                  ))}

                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => setShowCreateMeeting(false)}
                    >
                      <Text style={styles.cancelButtonText}>Отмена</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.createButton}
                      onPress={createMeeting}
                    >
                      <Text style={styles.createButtonText}>Создать</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>

        );
      case 'chat':
        if (selectedFriend) {
          return renderChatScreen();
        } else {
          // Если нет выбранного друга, возвращаемся к друзьям
          setActiveTab('friends');
          return null;
        }
      case 'calendar':
        return (
          <View style={styles.calendarTab}>
            <Calendar />
          </View>
        );
      case 'settings':
        return (
          <ScrollView style={styles.settingsContainer} showsVerticalScrollIndicator={false}>

            {/* ПЕРЕКЛЮЧАТЕЛЬ ПОЛЬЗОВАТЕЛЕЙ */}
            <LinearGradient
              colors={['#BFD4FF', '#7585cdff']}
              style={styles.settingsSection}
            >
              <Text style={styles.settingsTitle}>
                <Ionicons name="person-circle" size={20} color="#fafbfeff" />  Переключение пользователей
              </Text>
              <Text style={styles.settingsDescription}>
                Текущий пользователь: {getUserName(currentUserId)}
              </Text>
              <View style={styles.userOptions}>
                {Object.entries(allUsersData).map(([userId, userData]) => (
                  <TouchableOpacity
                    key={userId}
                    style={[styles.userButton, currentUserId === userId && styles.activeUserButton]}
                    onPress={() => {
                      setCurrentUserId(userId);
                      setSearchUsername('');
                      setSearchResults([]);
                    }}
                  >
                    <View style={styles.userInfo}>
                      <Ionicons name="person-outline" size={24} color="#374151" />
                      <View style={styles.userDetails}>
                        <Text style={styles.userName}>
                          {userData.username || userId}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.userButtonSubtext}>
                      Шаги: {userData.steps || 0} | Вода: {Math.floor(userData.water || 0)} л
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </LinearGradient>
            {/* ИНФОРМАЦИЯ О ПРИЛОЖЕНИИ */}

            <View style={styles.settingsSection}>
              <Text style={styles.settingsTitle}>
                <Ionicons name="information-circle-outline" size={20} color='#fafafaff' /> О приложении
              </Text>
              <Text style={styles.appInfo}>
                Daily Dose - Трекер здоровья v1.0
              </Text>
            </View>
          </ScrollView>
        );
      default:
        return null;
    }
  }
  return (
    <View style={styles.container}>

      {/* Основной контент */}
      {renderContent()}

      {/* Нижняя панель вкладок */}
      {activeTab !== 'chat' && (
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'home' && styles.activeTab]}
            onPress={() => setActiveTab('home')}
          >
            <Ionicons name="home-outline" size={18} color="#000" />
            <Text style={[styles.tabText, activeTab === 'home' && styles.activeTabText]}>
              Главная
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'friends' && styles.activeTab]}
            onPress={() => setActiveTab('friends')}
          >
            <Ionicons name="people-outline" size={18} color="#000" />
            <Text style={[styles.tabText, activeTab === 'friends' && styles.activeTabText]}>
              Друзья
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'calendar' && styles.activeTab]}
            onPress={() => setActiveTab('calendar')}
          >
            <Ionicons name="calendar-outline" size={18} color="#000" />
            <Text style={[styles.tabText, activeTab === 'calendar' && styles.activeTabText]}>
              Календарь
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'settings' && styles.activeTab]}
            onPress={() => setActiveTab('settings')}
          >
            <Ionicons name="settings-outline" size={18} color="#000" />
            <Text style={[styles.tabText, activeTab === 'settings' && styles.activeTabText]}>
              Настройки
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}
const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  homeContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingBottom: 80,
    backgroundColor: '#000000',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffffff',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingVertical: 5,
    position: 'absolute',
    bottom: 15,
    left: 0,
    right: 0,
  },
  bottomSpacer: {
    height: 100,
  },
  scrollView: {
    flex: 1,
    paddingTop: 50,
    paddingBottom: 100,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 7,
  },
  activeTab: {
    borderTopWidth: 2,
    borderTopColor: '#7585cdff',
  },
  tabText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    fontFamily: 'Gilroy-Bold',
    letterSpacing: -1,
  },
  activeTabText: {
    color: '#6366F1',
    fontFamily: 'Gilroy-Bold',
    letterSpacing: -1,
  },
  tabContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  tabTitle: {
    fontSize: 24,
    fontFamily: 'Gilroy-Bold',
    color: '#374151',
    marginBottom: 20,
  },
  topSection: {
    zIndex: 10,
    position: 'absolute',
    height: screenHeight * 0.5,
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    justifyContent: 'space-between',
  },
  header: {
    fontSize: 20,
    fontFamily: 'Gilroy-Bold',
    marginBottom: 20,
    color: '#ffffffea',
    textAlign: 'center',
  },
  headerSection: {
    padding: 20,
    backgroundColor: '#ffffffff',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 15,
    gap: 15,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#ffffffff',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    alignItems: 'center',
  },
  metricIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  metricTitle: {
    fontSize: 15,
    color: '#fff',
    marginBottom: 5,
    fontFamily: 'Gilroy-SemiBold',
  },
  metricValue: {
    fontSize: 28,
    fontFamily: 'Gilroy-Bold',
    color: '#1E293B',
    marginBottom: 5,
  },
  metricUnit: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  metricLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 5,
    fontFamily: 'Gilroy-Regular',
  },
  greeting: {
    fontSize: 30,
    fontFamily: 'Gilroy-SemiBold',
    color: '#ffffffff',
    marginBottom: 20,
  },
  metricSubtext: {
    fontSize: 12,
    color: '#94A3B8',
    fontFamily: 'Gilroy-Regular',
  },
  moodSection: {
    marginTop: 10,
  },
  moodQuestion: {
    fontSize: 15,
    fontFamily: 'Gilroy-SemiBold',
    color: '#fffffffe',
    marginBottom: 30,
  },
  moodOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moodOption: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    minWidth: 70,
  },
  moodOptionSelected: {
    backgroundColor: '#E0E7FF',
    borderColor: '#6366F1',
    borderWidth: 2,
  },

  section: {
    paddingHorizontal: 10,
    marginBottom: 15,
  },

  bottomScrollView: {
    flex: 1,
    backgroundColor: '#000000ff', // Добавляем фон чтобы контент был виден
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 20,
  },
  bottomSection: {
    flex: 1,
    paddingBottom: 80,
  },
  // Стили для шагомера
  stepsContainer: {
    top: 10,
    marginRight: -45,
    backgroundColor: '#fff',
    padding: 20,
    width: 200,
    height: 230,
    right: -10,
    borderRadius: 35,
    marginHorizontal: -55,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  stepsTitle: {
    fontSize: 14,
    fontFamily: 'Gilroy-SemiBold',
    color: '#7585cdff',
    marginBottom: 8,
    letterSpacing: -1,
    textTransform: 'uppercase',
    left: -10,
    top: -10,
  },
  stepsCircle: {
    left: -130,
    top: 120,
    width: 100,
    height: 100,
    borderRadius: 100,
    backgroundColor: '#7585cdff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepsCount: {
    fontSize: 20,
    fontFamily: 'Gilroy-Bold',
    color: '#fff',
  },
  stepsActions: {
    position: 'absolute',
    left: 140,
    top: 70,
  },
  stepsLabel: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.9,
    fontFamily: 'Gilroy-Bold  ',
  },
  stepsInfo: {
    alignItems: 'center',
    flex: 1,
    marginLeft: -35,
  },
  stepsGoal: {
    letterSpacing: -1,
    top: -55,
    fontSize: 15,
    fontFamily: 'Gilroy-Bold',
    color: '#7585cdff',
    marginBottom: 1,
    left: -10,
  },
  stepsProgress: {
    fontSize: 14,
    color: '#b6b7b8ff',
    fontWeight: 'bold',
  },
  stepsGoaltext: {
    letterSpacing: -1,
    top: -50,
    fontSize: 15,
    fontFamily: 'Gilroy-SemiBold',
    color: '#7585cdff',
    marginBottom: 1,
    left: -10,
  },
  // Стили для еды
  mealsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  mealCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  mealCardDone: {
    backgroundColor: '#F0FDF4',
    borderColor: '#10B981',
    borderWidth: 2,
  },
  mealIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  mealName: {
    fontSize: 14,
    fontFamily: 'Gilroy-SemiBold',
    color: '#475569',
    marginBottom: 10,
  },
  mealCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mealCheckDone: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  checkmark: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Gilroy-Bold',
  },
  psychologistCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  psychologistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  psychologistTitle: {
    fontSize: 18,
    fontFamily: 'Gilroy-Bold',
    color: '#1E293B',
  },
  psychologistButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  psychologistButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Gilroy-SemiBold',
  },
  nextAppointment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appointmentText: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'Gilroy-Regular',
  },
  // Стили для воды
  waterTracker: {
    top: 10,
    left: -5,
    backgroundColor: '#fff',
    padding: 60,
    height: 230,
    width: 200,
    borderRadius: 35,
    marginHorizontal: -70,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  waterTitle: {
    fontSize: 14,
    left: -50,
    top: -50,
    fontFamily: 'Gilroy-SemiBold',
    color: '#7585cdff',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: -1,
  },
  waterActions: {
    position: 'absolute',
    right: 18,
    top: 62,
  },
  waterAmount: {
    fontSize: 28,
    fontFamily: 'Gilroy-Bold',
    color: '#7585cdff',
    marginBottom: 20,
    left: -50,
    top: -60,
  },
  waterProgress: {
    height: 10,
    top: -110,
    left: 45,
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    overflow: 'hidden',
  },
  waterProgressFill: {
    height: '100%',
    backgroundColor: '#7585cdff',
    borderRadius: 6,
  },
  waterGoal: {
    fontFamily: 'Gilroy-Bold',
    color: '#7585cdff',
    top: -150,
    left: 45,
  },
  waterGoaltext: {
    fontFamily: 'Gilroy-Bold',
    color: '#7585cdff',
    top: -130,
    left: 45,
  },
  addButton: {
    width: 38,
    height: 38,
    borderRadius: 20,
    backgroundColor: '#7585cdff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
    top: 70,
    left: 5,
  },

  // Стили для социальной активности
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  socialCard: {
    flex: 1,
    alignItems: 'center',
    padding: 15,
    marginHorizontal: 5,
    borderRadius: 15,
    backgroundColor: 'rgba(254, 243, 199, 0.7)',
    borderWidth: 2,
    borderColor: '#f59e0b',
  },
  socialIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  socialText: {
    fontSize: 14,
    fontFamily: 'Gilroy-SemiBold',
    color: '#92400e',
    marginBottom: 5,
    textAlign: 'center',
  },
  socialCount: {
    fontSize: 12,
    color: '#b45309',
    fontFamily: 'Gilroy-Regular',
  },
  // Стили для аффирмаций
  affirmationCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 35,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  affirmationText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#7585cdff',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 22,
    fontFamily: 'Gilroy-SemiBold',
    letterSpacing: -0.5,
  },
  newAffirmationButton: {
    backgroundColor: '#7585cdff',
    padding: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  newAffirmationText: {
    color: '#ffffffff',
    fontFamily: 'Gilroy-Bold',
    fontSize: 14,
    letterSpacing: -1,
  },
  // Стили для прогресса
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  progressTitle: {
    fontSize: 18,
    fontFamily: 'Gilroy-Bold',
    color: '#1E293B',
  },
  newTasks: {
    fontSize: 14,
    color: '#6366F1',
    fontFamily: 'Gilroy-SemiBold',
  },
  progressContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    fontFamily: 'Gilroy-Regular',
  },
  settingsContainer: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  settingsSection: {
    backgroundColor: '#7585cdff',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
  },
  settingsTitle: {
    fontSize: 16,
    fontFamily: 'Gilroy-SemiBold',
    color: '#ffffffff',
    marginBottom: 10,
    letterSpacing: -1,
    alignItems: 'center',
  },
  settingsDescription: {
    fontSize: 14,
    color: '#fbfbfbff',
    marginBottom: 15,
    fontFamily: 'Gilroy-Bold',
    letterSpacing: -0.5,
  },
  userOptions: {
    marginBottom: 15,
  },
  userButton: {
    backgroundColor: '#f3f4f6c3',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeUserButton: {
    backgroundColor: '#52b94bef',
    borderColor: '#52b94bef',
  },
  userButtonText: {
    fontSize: 16,
    fontFamily: 'Gilroy-SemiBold',
    color: '#374151',
  },
  userButtonSubtext: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    fontFamily: 'Gilroy-Regular',
  },
  createUsersButton: {
    backgroundColor: '#FF6B6B',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  createUsersButtonText: {
    color: '#fff',
    fontFamily: 'Gilroy-Bold',
    fontSize: 16,
  },
  appInfo: {
    fontSize: 14,
    color: '#BFD4FF',
    lineHeight: 20,
    fontFamily: 'Gilroy-Bold',
    letterSpacing: -1,
  },
  friendsContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  declineButton: {
    backgroundColor: '#7585cdff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 15,
    alignItems: 'center',
  },
  declineButtonText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Gilroy-Bold',
    letterSpacing: -1,
  },
  noRequestsText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 20,
    fontFamily: 'Gilroy-Regular',
  },
  noFriendsText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 20,
    fontFamily: 'Gilroy-Regular',
  },
  messagesContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#000000',
  },
  requestText: {
    fontSize: 13,
    fontFamily: 'Gilroy-Bold',
    color: '#7585cdff',
    marginBottom: 1,
  },
  requestButtons: {
    flexDirection: 'row',
    marginTop: 15,
    gap: 10,
  },
  acceptButton: {
    backgroundColor: '#7585cdff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 15,
    alignItems: 'center',
    flex: 1,
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Gilroy-Bold',
    letterSpacing: -1,
  },
  searchPlaceholder: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginTop: 40,
    fontStyle: 'italic',
    fontFamily: 'Gilroy-Regular',
  },
  searchButton: {
    backgroundColor: '#7585cdff',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontFamily: 'Gilroy-Bold',
    fontSize: 14,
    letterSpacing: -1,
  },
  deleteMeetingButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 15,
  },
  deleteMeetingText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Gilroy-Bold',
    letterSpacing: -1,
  },
  meetingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  addMeetingButton: {
    backgroundColor: '#7585cdff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  addMeetingButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Gilroy-Bold',
    letterSpacing: -1,
  },
  meetingCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 20,
    borderRadius: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  meetingTitle: {
    fontSize: 18,
    fontFamily: 'Gilroy-Bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  meetingDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 12,
    fontFamily: 'Gilroy-Regular',
  },
  meetingDate: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 8,
    fontFamily: 'Gilroy-Regular',
  },
  meetingParticipants: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 15,
    fontFamily: 'Gilroy-Regular',
  },
  // Стили для модалки встречи
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    padding: 25,
    borderRadius: 25,
    width: '90%',
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: {
    color: '#7585cdff',
    fontSize: 22,
    fontFamily: 'Gilroy-Bold',
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: -1,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    fontSize: 16,
    fontFamily: 'Gilroy-Regular',
    color: '#ffffff',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  dateButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    fontFamily: 'Gilroy-Regular',
  },
  friendsLabel: {
    fontSize: 16,
    fontFamily: 'Gilroy-SemiBold',
    marginBottom: 15,
    color: '#ffffff',
  },
  friendCheckbox: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  friendCheckboxText: {
    fontSize: 14,
    color: '#ffffff',
    fontFamily: 'Gilroy-Regular',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 15,
  },
  cancelButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 15,
    borderRadius: 15,
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  cancelButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Gilroy-Bold',
    letterSpacing: -1,
  },
  createButton: {
    backgroundColor: '#7585cdff',
    padding: 15,
    borderRadius: 15,
    flex: 1,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Gilroy-Bold',
    letterSpacing: -1,
  },
  chatScreen: {
    flex: 1,
    backgroundColor: '#000000',
    marginVertical: 20,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  searchInput: {
    flex: 1,
    padding: 10,
    fontSize: 16,
    fontFamily: 'Gilroy-Regular',
    color: '#ffffff',
    backgroundColor: 'rgba(251, 251, 251, 0.55)',
    borderRadius: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: '#7585cdff',
    padding: 5,
    marginBottom: 20,
    alignItems: 'center',
  },
  userCard: {
    backgroundColor: '#7585cdff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#7585cdff',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 12,
    fontFamily: 'Gilroy-Bold',
    color: '#ffffff',
  },
  userSteps: {
    fontSize: 12,
    fontFamily: 'Gilroy-Regular',
    color: 'rgba(255,255,255,0.7)',
  },
  addFriendButton: {
    backgroundColor: '#52b94bef',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  addFriendButtonText: {
    color: '#ffffff',
    fontFamily: 'Gilroy-Bold',
    fontSize: 12,
    letterSpacing: -1,
  },
  friendsHeader: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 25,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  friendsMainTitle: {
    fontSize: 32,
    fontFamily: 'Gilroy-Bold',
    color: '#ffffff',
    marginBottom: 8,
    letterSpacing: -1,
  },
  friendsSubtitle: {
    fontSize: 16,
    fontFamily: 'Gilroy-Regular',
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: -0.5,
    marginBottom: 25,
  },
  friendsStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 30,
    padding: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontFamily: 'Gilroy-Bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Gilroy-Regular',
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: -0.5,
  },
  backText: {
    fontSize: 16,
    marginLeft: 8,
    color: '#7585cdff',
    fontFamily: 'Gilroy-SemiBold',
  },
  friendCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  friendStatus: {
    fontSize: 12,
    fontFamily: 'Gilroy-Bold',
    color: '#7585cdff',
    letterSpacing: -0.5,
  },
  friendName: {
    fontSize: 13,
    fontFamily: 'Gilroy-Bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  chatFriendName: {
    fontSize: 18,
    fontFamily: 'Gilroy-Bold',
    flex: 1,
    color: '#ffffff',
    textAlign: 'center',
  },
  chatMessages: {
    flex: 1,
    padding: 20,
    marginTop: 30,
  },
  systemMessage: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 15,
    borderRadius: 20,
    marginBottom: 20,
    maxWidth: '80%',
  },
  systemMessageText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'Gilroy-Regular',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 15,
    borderRadius: 20,
    marginBottom: 15,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#7585cdff',
  },
  friendMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  messageText: {
    fontSize: 15,
    color: '#ffffff',
    fontFamily: 'Gilroy-Regular',
  },
  myMessageText: {
    color: '#ffffff',
  },
  messageTime: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 5,
    textAlign: 'right',
    fontFamily: 'Gilroy-Regular',
  },
  chatInputContainer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  chatInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 15,
    fontSize: 16,
    fontFamily: 'Gilroy-Regular',
    color: '#ffffff',
  },
  sendButton: {
    backgroundColor: '#7585cdff',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenChat: {
    flex: 1,
    backgroundColor: '#000000',
  },
  moodScrollContainer: {
    marginVertical: 20,
    height: 120,
  },
  moodScrollContent: {
    alignItems: 'center',
    paddingHorizontal: (SCREEN_WIDTH - 1000),
  },
  moodItem: {
    marginTop: 0,
    alignItems: 'center',
    padding: 15,
    marginHorizontal: -45,
    borderRadius: 35,
    backgroundColor: 'rgba(240, 239, 239, 0.67)',
    minWidth: 50,
    minHeight: 65,
    borderWidth: 2,
    borderColor: 'transparent',
    justifyContent: 'center',
    position: 'absolute',
  },
  moodItemSelected: {
    minHeight: 80,
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    transform: [{ scale: 1.2 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 1,
  },
  moodContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
    height: screenHeight * 0.5,
  },
  selectedMoodText: {
    fontSize: 16,
    fontFamily: 'Gilroy-SemiBold',
    color: '#ffffffff',
    textTransform: 'capitalize',
    marginLeft: 10,
  },
  psychologistButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Gilroy-SemiBold',
  },
  psychologistMainButtonText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'Gilroy-Bold',
  },
  nextAppointment: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  appointmentText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Gilroy-Regular',
    marginLeft: 8,
  },
  appointmentDate: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Gilroy-SemiBold',
    marginTop: 5,
    textAlign: 'center',
  },
  animatedMoodContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 120,
    paddingHorizontal: 20,
  },

  psychologistButton: {
    backgroundColor: 'rgba(255, 255, 255, 1)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 80,
    borderWidth: 1,
    borderColor: '#fff',
    flex: 1,
    marginRight: -10,
    marginLeft: -10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  psychologistButtonText: {
    color: '#7585cdde',
    fontSize: 15,
    fontFamily: 'Gilroy-SemiBold',
  },

  psychologistMainButton: {
    backgroundColor: '#7585cdd9',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#52b94b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  moodLabelText: {
    fontSize: 14,
    fontFamily: 'Gilroy-SemiBold',
    color: '#ffffff',
    textAlign: 'center',
    left: -2,
    bottom: -85,
  },
  moodLabelContainer: {
    alignItems: 'center',
  },
  horizontalMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 45,
    marginBottom: 15,
  },
  headerWithCircle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  circleButtonFirst: {
    width: 36,
    height: 36,
    left: -100,
    top: 90,
    borderRadius: 18,
    backgroundColor: '#7585cdff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#7585cdff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  circleButtonSecond: {
    width: 36,
    height: 36,
    left: -105,
    top: 190,
    borderRadius: 18,
    backgroundColor: '#7585cdff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#7585cdff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  circleEmoji: {
    fontSize: 16,
  },
  waterFooter: {
    left: -150,
    top: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  dashboardContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  dashboardHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 15,
    marginBottom: 15,
  },
  dashboardTitle: {
    fontSize: 18,
    fontFamily: 'Gilroy-SemiBold',
    color: '#7585cdff',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -1,
  },
  headerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    padding: 4,
  },
  periodButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  periodButtonActive: {
    backgroundColor: '#7585cdff',
  },
  periodText: {
    fontSize: 12,
    fontFamily: 'Gilroy-SemiBold',
    color: '#7585cdff',
    letterSpacing: -1,
  },
  periodTextActive: {
    color: '#fff',
  },
  updateTime: {
    fontSize: 10,
    color: '#9CA3AF',
    fontFamily: 'Gilroy-Regular',
    letterSpacing: -1,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Gilroy-Bold',
    color: '#7585cdff',
    marginBottom: 20,
  },
  overviewSection: {
    marginBottom: 20,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricCard: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 15,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 6,
  },
  metricValue: {
    fontSize: 13,
    fontFamily: 'Gilroy-Bold',
    color: '#7585cdff',
    marginBottom: 4,
    letterSpacing: -1,
  },
  metricLabel: {
    fontSize: 10,
    color: '#6B7280',
    fontFamily: 'Gilroy-Regular',
    textAlign: 'center',
  },
  heatmapSection: {
    marginBottom: 20,
  },
  heatmap: {
    backgroundColor: '#F8FAFC',
    padding: 15,
    borderRadius: 12,
  },
  heatmapDays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  heatmapDayLabel: {
    fontSize: 12,
    fontFamily: 'Gilroy-SemiBold',
    color: '#374151',
    width: 30,
    textAlign: 'center',
  },
  heatmapStatus: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  heatmapEmoji: {
    fontSize: 20,
    width: 30,
    textAlign: 'center',
  },
  progressSection: {
    marginBottom: 20,
  },
  progressGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  progressCard: {
    width: '48%',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  progressIcon: {
    fontSize: 20,
    marginBottom: 6,
  },
  progressValue: {
    fontSize: 14,
    fontFamily: 'Gilroy-Bold',
    color: '#7585cdff',
    marginBottom: 2,
  },
  progressDetail: {
    fontSize: 10,
    color: '#6B7280',
    fontFamily: 'Gilroy-Regular',
    textAlign: 'center',
  },
  trendSection: {
    marginBottom: 20,
  },
  trendChart: {
    backgroundColor: '#F8FAFC',
    padding: 15,
    borderRadius: 12,
  },
  trendYAxis: {
    position: 'absolute',
    left: 10,
    top: 15,
    bottom: 30,
    justifyContent: 'space-between',
  },
  trendLabel: {
    fontSize: 10,
    color: '#6B7280',
    fontFamily: 'Gilroy-Regular',
  },
  trendLine: {
    height: 100,
    marginLeft: 40,
    marginRight: 10,
    marginBottom: 20,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#D1D5DB',
    position: 'relative',
  },
  trendPoint: {
    position: 'absolute',
    width: 8,
    height: 8,
    backgroundColor: '#7585cdff',
    borderRadius: 4,
    top: '50%',
    marginTop: -4,
  },
  trendXAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: 40,
    marginRight: 10,
  },
  trendDay: {
    fontSize: 10,
    color: '#6B7280',
    fontFamily: 'Gilroy-Regular',
    width: 30,
    textAlign: 'center',
  },
  insightsSection: {
    marginBottom: 10,
  },
  insightsList: {
    backgroundColor: '#F8FAFC',
    padding: 15,
    borderRadius: 12,
  },
  insightItem: {
    fontSize: 12,
    color: '#374151',
    fontFamily: 'Gilroy-Regular',
    marginBottom: 6,
    lineHeight: 16,
  },
  calendarTab: {
    flex: 1,
    backgroundColor: '#000000',
  },

});
