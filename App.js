import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, TextInput, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db } from './firebase';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import Svg, { Path, Circle, G } from 'react-native-svg';
import {
  doc, setDoc, getDoc, updateDoc,
  collection, query, where, getDocs,
  arrayUnion, arrayRemove,
  onSnapshot, addDoc, deleteDoc
} from 'firebase/firestore';
const { height: screenHeight } = Dimensions.get('window');
// Данные метрик.
// Данные метрик..
const metrics = [
  { title: 'Шаги', value: 0, unit: 'шагов', target: 10000 },
  { title: 'Сон', value: '0ч 0м', unit: '', target: 8 },
  { title: 'Активность', value: '0', unit: '', target: 100 },
];
const SadEmoji = ({ size = 32, color = "#000000" }) => (
  <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <G>
      <Path
        d="M32,61A29,29,0,1,1,61,32,29,29,0,0,1,32,61ZM32,5A27,27,0,1,0,59,32,27,27,0,0,0,32,5ZM42,28a6,6,0,1,1,6-6A6,6,0,0,1,42,28Zm0-10a4,4,0,1,0,4,4A4,4,0,0,0,42,18ZM22,28a6,6,0,1,1,6-6A6,6,0,0,1,22,28Zm0-10a4,4,0,1,0,4,4A4,4,0,0,0,22,18ZM40,42a8,8,0,0,0-16,0,1,1,0,0,0,2,0,6,6,0,0,1,12,0,1,1,0,0,0,2,0Z"
        fill={color}
      />
    </G>
  </Svg>
);
const HappyEmoji = ({ size = 32, color = "#000000" }) => (
  <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <G>
      <Path
        d="M42,28a6,6,0,1,1,6-6A6,6,0,0,1,42,28Zm0-10a4,4,0,1,0,4,4A4,4,0,0,0,42,18ZM22,28a6,6,0,1,1,6-6A6,6,0,0,1,22,28Zm0-10a4,4,0,1,0,4,4A4,4,0,0,0,22,18ZM48.14,36.22l.53-.47a1,1,0,0,0-1.34-1.5l-.53.49C44.21,37.08,39.88,41,32,41s-12.21-3.92-14.8-6.26l-.53-.49a1,1,0,1,0-1.34,1.5l.53.47C18.66,38.75,23.35,43,32,43S45.34,38.75,48.14,36.22ZM32,61A29,29,0,1,1,61,32,29,29,0,0,1,32,61ZM32,5A27,27,0,1,0,59,32,27,27,0,0,0,32,5Z"
        fill={color}
      />
    </G>
  </Svg>
);

const NeutralEmoji = ({ size = 32, color = "#000000" }) => (
  <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <G>
      <Path
        d="M32,61A29,29,0,1,1,61,32,29,29,0,0,1,32,61ZM32,5A27,27,0,1,0,59,32,27,27,0,0,0,32,5ZM42,28a6,6,0,1,1,6-6A6,6,0,0,1,42,28Zm0-10a4,4,0,1,0,4,4A4,4,0,0,0,42,18ZM22,28a6,6,0,1,1,6-6A6,6,0,0,1,22,28Zm0-10a4,4,0,1,0,4,4A4,4,0,0,0,22,18ZM43,37a1,1,0,0,0-1-1H22a1,1,0,0,0,0,2H42A1,1,0,0,0,43,37Z"
        fill={color}
      />
    </G>
  </Svg>
);

const TiredEmoji = ({ size = 32, color = "#000" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <Path d="M8 10C8 10 9 11 10 10" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M16 10C16 10 15 11 14 10" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M8 16C8 16 10 14 12 14C14 14 16 16 16 16" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const AngryEmoji = ({ size = 32, color = "#000" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <Path d="M8 9L10 11" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M16 9L14 11" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M8 16C8 16 10 18 12 18C14 18 16 16 16 16" stroke={color} strokeWidth="2" strokeLinecap="round" />
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
  // Состояния трекера
  const [meals, setMeals] = useState({ breakfast: false, lunch: false, dinner: false });
  const [water, setWater] = useState(0);
  const [affirmation, setAffirmation] = useState(affirmations[0]);
  const [steps, setSteps] = useState(0);
  const [activeTab, setActiveTab] = useState('home');
  const [currentUserId, setCurrentUserId] = useState('user123');
  const [showUserSwitch, setShowUserSwitch] = useState(false);
  const [friends, setFriends] = useState([]);
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
      // Удаляем у текущего пользователя
      await updateDoc(doc(db, 'users', currentUserId), {
        friends: arrayRemove(friendId)
      });

      // Удаляем у друга
      await updateDoc(doc(db, 'users', friendId), {
        friends: arrayRemove(currentUserId)
      });

      // Обновляем локальные данные
      setFriends(friends.filter(friend => friend !== friendId));

      // Возвращаемся к списку друзей
      setActiveTab('friends');
      setSelectedFriend(null);

      console.log('✅ Друг удален');
    } catch (error) {
      console.error('❌ Ошибка удаления друга:', error);
    }
  };
  const saveAllData = async () => {
    try {
      const moodData = currentMood ? {
        label: currentMood.label,
        emoji: currentMood.emoji
      } : {
        label: moodOptions[1].label, 
        emoji: moodOptions[1].emoji
      };
      console.log('🔄 Пытаюсь сохранить данные...');
      await setDoc(doc(db, 'users', currentUserId), {
        username: currentUserId,
        steps: steps,
        water: water,
        meals: meals,
        affirmation: affirmation,
        friends: friends,
        friendRequests: friendRequests,
        mood: moodData,
        lastUpdated: new Date()

      });
      console.log('✅ Данные УСПЕШНО сохранены в Firebase');
    } catch (error) {
      console.error('❌ Ошибка сохранения:', error);
    }
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
        <View style={styles.systemMessage}>3
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
          } else {
            setCurrentMood(moodOptions[1]);
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
    <View style={styles.moodContent}>
      <Text style={styles.greeting}>Привет!</Text>
      <Text style={styles.moodQuestion}>Как ваше самочувствие?</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.moodScrollContainer}
        contentContainerStyle={styles.moodScrollContent}
      >
        {moodOptions.map((mood, index) => {
          const EmojiComponent = mood.component;
          const isSelected = currentMood?.label === mood.label;

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.moodItem,
                isSelected && styles.moodItemSelected
              ]}
              onPress={() => setCurrentMood(mood)}
            >
              <EmojiComponent
                size={isSelected ? 36 : 32}
                color={isSelected ? '#929ee6dc' : '#9baaf695'}
              />
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {currentMood && (
        <View style={styles.selectedMood}>
          <Text style={styles.selectedMoodText}>{currentMood.label}</Text>
        </View>
      )}

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.psychologistButton}>
          <Text style={styles.psychologistButtonText}>отметить </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.psychologistMainButton}>
          <Text style={styles.psychologistMainButtonText}>психолог </Text>
        </TouchableOpacity>
      </View>
    </View>
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
            <LinearGradient
              colors={['#BFD4FF', '#7585cdff']}
              start={{ x: 0.74, y: 0.94 }}
              end={{ x: 0.26, y: 0.06 }}
              style={styles.topSection}
            >
              {renderMoodSection()}
            </LinearGradient>
            <ScrollView style={styles.bottomScrollView} showsVerticalScrollIndicator={false}>
              {/* Вода */}
              <View style={styles.section}>
                <View style={styles.waterTracker}>
                  <Text style={styles.waterTitle}>Вода</Text>
                  <Text style={styles.waterAmount}>12 л</Text>
                  <View style={styles.waterProgress}>
                    <View style={[styles.waterProgressFill, { width: '60%' }]} />
                  </View>
                </View>
              </View>

              {/* Прогресс и задачи */}
              <View style={styles.section}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressTitle}>Прогресс</Text>
                  <Text style={styles.newTasks}>новые задачи</Text>
                </View>
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: '45%' }]} />
                  </View>
                  <Text style={styles.progressText}>45% выполнено</Text>
                </View>
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
              {/* Трекер еды */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Питание</Text>
                <View style={styles.mealsContainer}>
                  {[
                    { key: 'breakfast', name: 'Завтрак', icon: '🍳' },
                    { key: 'lunch', name: 'Обед', icon: '🍲' },
                    { key: 'dinner', name: 'Ужин', icon: '🍽️' }
                  ].map((meal) => (
                    <TouchableOpacity
                      key={meal.key}
                      style={[styles.mealCard, meals[meal.key] && styles.mealCardDone]}
                      onPress={() => setMeals({ ...meals, [meal.key]: !meals[meal.key] })}
                    >
                      <Text style={styles.mealIcon}>{meal.icon}</Text>
                      <Text style={styles.mealName}>{meal.name}</Text>
                      <View style={[styles.mealCheck, meals[meal.key] && styles.mealCheckDone]}>
                        {meals[meal.key] && <Text style={styles.checkmark}>✓</Text>}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Психолог и встречи */}
              <View style={styles.section}>
                <View style={styles.psychologistCard}>
                  <View style={styles.psychologistHeader}>
                    <Text style={styles.psychologistTitle}>Психолог</Text>
                    <TouchableOpacity style={styles.psychologistButton}>
                      <Text style={styles.psychologistButtonText}>отметить</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.nextAppointment}>
                    <Ionicons name="calendar-outline" size={16} color="#666" />
                    <Text style={styles.appointmentText}>Следующая запись: завтра (5 августа)</Text>
                  </View>
                </View>
              </View>

              {/* Вода */}
              <View style={styles.section}>
                <View style={styles.waterTracker}>
                  <Text style={styles.waterTitle}>Вода</Text>
                  <Text style={styles.waterAmount}>12 л</Text>
                  <View style={styles.waterProgress}>
                    <View style={[styles.waterProgressFill, { width: `${(water / 8) * 100}%` }]} />
                  </View>
                </View>
              </View>

              {/* Прогресс и задачи */}
              <View style={styles.section}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressTitle}>Прогресс</Text>
                  <Text style={styles.newTasks}>новые задачи</Text>
                </View>
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
                  </View>
                  <Text style={styles.progressText}>{Math.round(progress * 100)}% выполнено</Text>
                </View>
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
            </ScrollView >
          </View>
        );
      case 'friends':
        return (
          <ScrollView style={styles.friendsContainer} showsVerticalScrollIndicator={false}>
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
                  <Text style={styles.userName}>{user.username}</Text>
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
          <View style={styles.tabContent}>
            <Text style={styles.tabTitle}>Календарь</Text>
            <Text>Здесь будет календарь</Text>
          </View>
        );
      case 'settings':
        return (
          <ScrollView style={styles.settingsContainer} showsVerticalScrollIndicator={false}>

            {/* ПЕРЕКЛЮЧАТЕЛЬ ПОЛЬЗОВАТЕЛЕЙ */}
            <View style={styles.settingsSection}>
              <Text style={styles.settingsTitle}>👤 Переключение пользователей</Text>
              <Text style={styles.settingsDescription}>
                Текущий пользователь: {getUserName(currentUserId)}
              </Text>

              <View style={styles.userOptions}>
                <TouchableOpacity
                  style={[styles.userButton, currentUserId === 'user123' && styles.activeUserButton]}
                  onPress={() => {
                    setCurrentUserId('user123')
                    setSearchUsername('');
                    setSearchResults([]);
                  }
                  }
                >
                  <Text style={styles.userButtonText}>👩 Мария (user123)</Text>
                  <Text style={styles.userButtonSubtext}>Основной аккаунт</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.userButton, currentUserId === 'user456' && styles.activeUserButton]}
                  onPress={() => {
                    setCurrentUserId('user456');
                    setSearchUsername('');
                    setSearchResults([]);
                  }
                  }
                >
                  <Text style={styles.userButtonText}>👱‍♀️ Анна (user456)</Text>
                  <Text style={styles.userButtonSubtext}>Шаги: {allUsersData['user456']?.steps || 0} | Вода: {allUsersData['user456']?.water || 0}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.userButton, currentUserId === 'user789' && styles.activeUserButton]}
                  onPress={() => {
                    setCurrentUserId('user789')
                    setSearchUsername('');
                    setSearchResults([]);
                  }
                  }
                >
                  <Text style={styles.userButtonText}>👨 Максим (user789)</Text>
                  <Text style={styles.userButtonSubtext}>Шаги: {allUsersData['user789']?.steps || 0} | Вода: {allUsersData['user789']?.water || 0}</Text>
                </TouchableOpacity>
              </View>

            </View>

            {/* ИНФОРМАЦИЯ О ПРИЛОЖЕНИИ */}
            <View style={styles.settingsSection}>
              <Text style={styles.settingsTitle}>ℹ️ О приложении</Text>
              <Text style={styles.appInfo}>
                Daily Dose - Трекер здоровья v1.0{"\n"}
                С шагами, водой, едой и друзьями
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
            <Ionicons name="home-outline" size={16} color="#000" />
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
    paddingVertical: 10,
    position: 'absolute',
    bottom: 0,
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
    paddingVertical: 8,
  },
  activeTab: {
    borderTopWidth: 2,
    borderTopColor: '#52b94bef',
  },
  tabText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    fontFamily: 'Gilroy-Regular',
  },
  activeTabText: {
    color: '#6366F1',
    fontFamily: 'Gilroy-SemiBold',
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
    fontSize: 25,
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
    left: 110,
    fontSize: 30,
    fontFamily: 'Gilroy-SemiBold',
    color: '#ffffffff',
    marginBottom: 25,
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
    left: 50,
    fontSize: 18,
    fontFamily: 'Gilroy-SemiBold',
    color: '#e5ebf3f8',
    marginBottom: 15,
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
  moodEmoji: {
    fontSize: 24,
    marginBottom: 5,
  },
  moodLabel: {
    fontSize: 12,
    color: '#475569',
    fontFamily: 'Gilroy-SemiBold',
  },
  currentMood: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  moodText: {
    fontSize: 16,
    color: '#065F46',
    fontFamily: 'Gilroy-SemiBold',
  },
  changeMoodText: {
    fontSize: 14,
    color: '#059669',
    fontFamily: 'Gilroy-SemiBold',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Gilroy-Bold',
    color: '#1E293B',
    marginBottom: 15,
  },
  bottomScrollView: {
    flex: 1,
    marginTop: screenHeight * 0.5, // Отступ равный высоте верхней части
    paddingBottom: 100, // Отступ для таббара
  },
  bottomSection: {
    flex: 1,
    paddingBottom: 80,
  },
  // Стили для шагомера
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepsCircle: {
    left: 10,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepsCount: {
    fontSize: 20,
    fontFamily: 'Gilroy-Bold',
    color: '#fff',
  },
  stepsLabel: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.9,
    fontFamily: 'Gilroy-Regular',
  },
  stepsInfo: {
    alignItems: 'center',
    flex: 1,
    marginLeft: 20,
  },
  stepsGoal: {
    fontSize: 16,
    fontFamily: 'Gilroy-SemiBold',
    color: '#eff0f3e5',
    marginBottom: 5,
  },
  stepsProgress: {
    fontSize: 14,
    color: '#b6b7b8ff',
    fontFamily: 'Gilroy-Bold',
  },
  addButton: {
    backgroundColor: 'rgba(19, 213, 148, 0.38)',
    padding: 12,
    borderRadius: 10,
    marginTop: 15,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontFamily: 'Gilroy-SemiBold',
    fontSize: 16,
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
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  waterTitle: {
    fontSize: 16,
    fontFamily: 'Gilroy-SemiBold',
    color: '#64748B',
    marginBottom: 5,
  },
  waterAmount: {
    fontSize: 24,
    fontFamily: 'Gilroy-Bold',
    color: '#1E293B',
    marginBottom: 15,
  },
  waterProgress: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  waterProgressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
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
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  affirmationText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#475569',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 22,
    fontFamily: 'Gilroy-Regular',
  },
  newAffirmationButton: {
    backgroundColor: '#F1F5F9',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  newAffirmationText: {
    color: '#475569',
    fontFamily: 'Gilroy-SemiBold',
    fontSize: 14,
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
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
  },
  settingsTitle: {
    fontSize: 18,
    fontFamily: 'Gilroy-Bold',
    color: '#374151',
    marginBottom: 10,
  },
  settingsDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 15,
    fontFamily: 'Gilroy-Regular',
  },
  userOptions: {
    marginBottom: 15,
  },
  userButton: {
    backgroundColor: '#f3f4f6',
    padding: 15,
    borderRadius: 10,
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
    color: '#6b7280',
    lineHeight: 20,
    fontFamily: 'Gilroy-Regular',
  },
  friendsContainer: {
    flex: 1,
    paddingTop: 50,
    paddingBottom: 35,
  },
  declineButton: {
    backgroundColor: '#ef4444',
    padding: 8,
    borderRadius: 8,
    marginLeft: 5,
    alignItems: 'center',
  },
  declineButtonText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Gilroy-SemiBold',
  },
  noRequestsText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 10,
    fontFamily: 'Gilroy-Regular',
  },
  noFriendsText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 10,
    fontFamily: 'Gilroy-Regular',
  },
  messagesContainer: {
    flex: 1,
    padding: 10,
  },
  requestButtons: {
    flexDirection: 'row',
    marginTop: 10,
  },
  acceptButton: {
    backgroundColor: '#10b981',
    padding: 8,
    borderRadius: 8,
    marginRight: 5,
    alignItems: 'center',
    minWidth: 80,
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Gilroy-SemiBold',
  },
  searchPlaceholder: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 5,
    fontStyle: 'italic',
    fontFamily: 'Gilroy-Regular',
  },
  searchButton: {
    backgroundColor: '#52b94bef',
    padding: 5,
    borderRadius: 10,
    marginLeft: 15,
    marginRight: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontFamily: 'Gilroy-SemiBold',
    fontSize: 14,
  },
  deleteMeetingButton: {
    backgroundColor: '#ef4444',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  deleteMeetingText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Gilroy-SemiBold',
  },
  meetingsHeader: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  addMeetingButton: {
    backgroundColor: '#52b94bef',
    padding: 10,
    borderRadius: 8,
    marginTop: -10,
    alignSelf: 'flex-start',
  },
  addMeetingButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Gilroy-SemiBold',
  },
  meetingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  meetingTitle: {
    fontSize: 18,
    fontFamily: 'Gilroy-Bold',
    color: '#374151bb',
    marginBottom: 5,
  },
  meetingDescription: {
    fontSize: 14,
    color: '#6b7280c1',
    marginBottom: 8,
    fontFamily: 'Gilroy-Regular',
  },
  meetingDate: {
    fontSize: 12,
    color: '#756d6ddb',
    marginBottom: 5,
    fontFamily: 'Gilroy-Regular',
  },
  meetingParticipants: {
    fontSize: 12,
    color: '#716292c5',
    marginBottom: 10,
    fontFamily: 'Gilroy-Regular',
  },
  deleteMeetingButton: {
    backgroundColor: '#ef4444',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  deleteMeetingText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Gilroy-SemiBold',
  },
  // Стили для модалки встречи
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Gilroy-Bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    fontSize: 16,
    fontFamily: 'Gilroy-Regular',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  dateButton: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    fontFamily: 'Gilroy-Regular',
  },
  friendsLabel: {
    fontSize: 16,
    fontFamily: 'Gilroy-SemiBold',
    marginBottom: 10,
    color: '#374151',
  },
  friendCheckbox: {
    padding: 8,
    borderRadius: 6,
    marginBottom: 5,
    backgroundColor: '#f9fafb',
  },
  friendCheckboxText: {
    fontSize: 14,
    color: '#374151',
    fontFamily: 'Gilroy-Regular',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  cancelButton: {
    backgroundColor: '#6b7280',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Gilroy-SemiBold',
  },
  createButton: {
    backgroundColor: '#10b981',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Gilroy-SemiBold',
  },
  chatScreen: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 30,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  backText: {
    fontSize: 16,
    marginLeft: 5,
    color: '#007bffff',
    fontFamily: 'Gilroy-Regular',
  },
  chatFriendName: {
    fontSize: 18,
    fontFamily: 'Gilroy-SemiBold',
    flex: 1,
    color: '#000',
    left: 20,
  },
  chatMessages: {
    flex: 1,
    padding: 15,
  },
  systemMessage: {
    alignSelf: 'center',
    backgroundColor: '#e9ecef',
    padding: 10,
    borderRadius: 15,
    marginBottom: 15,
  },
  systemMessageText: {
    color: '#6c757d',
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'Gilroy-Regular',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 15,
    marginBottom: 10,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007bffe2',
  },
  friendMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  messageText: {
    fontSize: 15,
    color: '#000',
    marginRight: 30,
    fontFamily: 'Gilroy-Regular',
  },
  myMessageText: {
    color: '#fff',
  },
  messageTime: {
    fontSize: 12,
    color: '#999',
    marginTop: -5,
    textAlign: 'right',
    left: 8,
    fontFamily: 'Gilroy-Regular',
  },
  chatInputContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'center',
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 16,
    fontFamily: 'Gilroy-Regular',
  },
  sendButton: {
    backgroundColor: '#007AFF',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenChat: {
    flex: 1,
  },
  moodScrollContainer: {
    marginVertical: 15,
    maxHeight: 100,
  },
  moodScrollContent: {
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  moodItem: {
    alignItems: 'center',
    padding: 15,
    marginHorizontal: 15,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    minWidth: 50,
    minHeight: 65,
    borderWidth: 2,
    borderColor: 'transparent',
    justifyContent: 'center',
  },
  moodItemSelected: {
    minHeight: 80,
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    transform: [{ scale: 1.2 }],
    margin: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 1,
  },
  // Убрали обычный moodLabel, так как подписи только у выбранного
  moodLabelSelected: {
    color: '#52b94bef',
    fontSize: 5,
    fontFamily: 'Gilroy-Bold',
    textAlign: 'center',
    marginTop: 5,
  },
  moodContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  greeting: {
    fontSize: 30,
    fontFamily: 'Gilroy-SemiBold',
    color: '#ffffffff',
    marginBottom: 25,
    textAlign: 'center',
  },
  moodQuestion: {
    fontSize: 18,
    fontFamily: 'Gilroy-SemiBold',
    color: '#e5ebf3f8',
    marginBottom: 15,
    textAlign: 'center',
  },
  selectedMoodText: {
    fontSize: 16,
    fontFamily: 'Gilroy-SemiBold',
    color: '#ffffffff',
    textTransform: 'capitalize',
    marginLeft: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 15,
  },
  psychologistButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#fff',
  },
  psychologistButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Gilroy-SemiBold',
  },
  psychologistMainButton: {
    backgroundColor: '#52b94bef',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 20,
  },
  psychologistMainButtonText: {
    color: '#fff',
    fontSize: 14,
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
});