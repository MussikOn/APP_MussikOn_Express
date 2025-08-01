# 📱 Integración Frontend - MusikOn API

## 📋 Tabla de Contenidos

- [Configuración Base](#configuración-base)
- [Autenticación](#autenticación)
- [Gestión de Eventos](#gestión-de-eventos)
- [Solicitudes Directas](#solicitudes-directas)
- [Chat en Tiempo Real](#chat-en-tiempo-real)
- [Sistema de Imágenes CRUD](#sistema-de-imágenes-crud)
- [Notificaciones en Tiempo Real](#notificaciones-en-tiempo-real)
- [Manejo de Errores](#manejo-de-errores)
- [Ejemplos de Código](#ejemplos-de-código)
- [Mejores Prácticas](#mejores-prácticas)

---

## 🔧 Configuración Base

### Configuración de la API

```javascript
// config/api.js
const API_BASE_URL = 'http://localhost:1000';

export const apiConfig = {
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
};

// Interceptor para agregar token automáticamente
export const setupApiInterceptors = (axios) => {
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Token expirado o inválido
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
};
```

### Configuración de Socket.IO

```javascript
// config/socket.js
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:1000';

export class SocketManager {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect(token) {
    this.socket = io(SOCKET_URL, {
      auth: {
        token
      }
    });

    this.socket.on('connect', () => {
      console.log('Conectado al servidor');
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('Desconectado del servidor');
      this.isConnected = false;
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }
}
```

---

## 🔐 Autenticación

### Servicio de Autenticación

```javascript
// services/authService.js
import axios from 'axios';
import { apiConfig } from '../config/api';

class AuthService {
  constructor() {
    this.api = axios.create(apiConfig);
  }

  async register(userData) {
    try {
      const response = await this.api.post('/auth/Register', userData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async login(credentials) {
    try {
      const response = await this.api.post('/auth/login', credentials);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async verifyToken() {
    try {
      const response = await this.api.get('/auth/verToken');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateUser(userEmail, userData) {
    try {
      const response = await this.api.put(`/auth/update/${userEmail}`, userData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async sendVerificationEmail(email) {
    try {
      const response = await this.api.post('/auth/authEmail', { userEmail: email });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async verifyEmail(code, validationNumber) {
    try {
      const response = await this.api.post(`/auth/validEmail/${code}`, {
        vaildNumber: validationNumber
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    socketManager.disconnect();
  }

  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  isAuthenticated() {
    return !!localStorage.getItem('token');
  }

  handleError(error) {
    const message = error.response?.data?.msg || 'Error de conexión';
    return new Error(message);
  }
}

export const authService = new AuthService();
```

### Hook de Autenticación (React)

```javascript
// hooks/useAuth.js
import { useState, useEffect, createContext, useContext } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          const userData = authService.getCurrentUser();
          setUser(userData);
        } catch (error) {
          authService.logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    const result = await authService.login(credentials);
    setUser(result.user);
    return result;
  };

  const register = async (userData) => {
    const result = await authService.register(userData);
    setUser(result.user);
    return result;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};
```

---

## 🎭 Gestión de Eventos

### Servicio de Eventos

```javascript
// services/eventService.js
import axios from 'axios';
import { apiConfig } from '../config/api';

class EventService {
  constructor() {
    this.api = axios.create(apiConfig);
  }

  async createEventRequest(eventData) {
    try {
      const response = await this.api.post('/events/request-musician', eventData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getMyPendingEvents() {
    try {
      const response = await this.api.get('/events/my-pending');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getMyAssignedEvents() {
    try {
      const response = await this.api.get('/events/my-assigned');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getMyCompletedEvents() {
    try {
      const response = await this.api.get('/events/my-completed');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getAvailableRequests() {
    try {
      const response = await this.api.get('/events/available-requests');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async acceptEvent(eventId) {
    try {
      const response = await this.api.post(`/events/${eventId}/accept`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getMyScheduledEvents() {
    try {
      const response = await this.api.get('/events/my-scheduled');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getMyPastPerformances() {
    try {
      const response = await this.api.get('/events/my-past-performances');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getMyEvents() {
    try {
      const response = await this.api.get('/events/my-events');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  handleError(error) {
    const message = error.response?.data?.msg || 'Error de conexión';
    return new Error(message);
  }
}

export const eventService = new EventService();
```

### Hook de Eventos (React)

```javascript
// hooks/useEvents.js
import { useState, useEffect } from 'react';
import { eventService } from '../services/eventService';
import { useAuth } from './useAuth';

export const useEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const fetchEvents = async (fetchFunction) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchFunction();
      setEvents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createEventRequest = async (eventData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await eventService.createEventRequest(eventData);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const acceptEvent = async (eventId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await eventService.acceptEvent(eventId);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    events,
    loading,
    error,
    fetchEvents,
    createEventRequest,
    acceptEvent,
    eventService
  };
};
```

---

## 💬 Chat en Tiempo Real

### Servicio de Chat

```javascript
// services/chatService.js
import { io } from 'socket.io-client';

class ChatService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  connect(token) {
    this.socket = io('http://localhost:1000', {
      auth: { token }
    });

    this.setupEventListeners();
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  setupEventListeners() {
    this.socket.on('connect', () => {
      console.log('Conectado al chat');
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('Desconectado del chat');
      this.isConnected = false;
    });

    this.socket.on('new-message', (message) => {
      this.notifyListeners('new-message', message);
    });

    this.socket.on('message-notification', (notification) => {
      this.notifyListeners('message-notification', notification);
    });

    this.socket.on('user-typing', (data) => {
      this.notifyListeners('user-typing', data);
    });

    this.socket.on('user-status-changed', (data) => {
      this.notifyListeners('user-status-changed', data);
    });
  }

  registerUser(userEmail, userName) {
    if (this.socket) {
      this.socket.emit('chat-register', { userEmail, userName });
    }
  }

  joinConversation(conversationId) {
    if (this.socket) {
      this.socket.emit('join-conversation', conversationId);
    }
  }

  sendMessage(messageData) {
    if (this.socket) {
      this.socket.emit('send-message', messageData);
    }
  }

  markMessageRead(messageId, conversationId) {
    if (this.socket) {
      this.socket.emit('mark-message-read', { messageId, conversationId });
    }
  }

  setTyping(conversationId, userEmail, isTyping) {
    if (this.socket) {
      this.socket.emit('typing', { conversationId, userEmail, isTyping });
    }
  }

  addListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  removeListener(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  notifyListeners(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error en listener de chat:', error);
        }
      });
    }
  }
}

export const chatService = new ChatService();
```

### Hook de React para Chat

```javascript
// hooks/useChat.js
import { useEffect, useState, useCallback } from 'react';
import { chatService } from '../services/chatService';
import { useAuth } from './useAuth';

export const useChat = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);

  useEffect(() => {
    if (user && user.token) {
      chatService.connect(user.token);
      chatService.registerUser(user.userEmail, user.name);
    }

    return () => {
      chatService.disconnect();
    };
  }, [user]);

  useEffect(() => {
    const handleNewMessage = (message) => {
      setMessages(prev => [...prev, message]);
    };

    const handleTyping = (data) => {
      if (data.conversationId === activeConversation?.id) {
        setTypingUsers(prev => {
          const filtered = prev.filter(u => u.userEmail !== data.userEmail);
          if (data.isTyping) {
            return [...filtered, { userEmail: data.userEmail, isTyping: true }];
          }
          return filtered;
        });
      }
    };

    chatService.addListener('new-message', handleNewMessage);
    chatService.addListener('user-typing', handleTyping);

    return () => {
      chatService.removeListener('new-message', handleNewMessage);
      chatService.removeListener('user-typing', handleTyping);
    };
  }, [activeConversation]);

  const sendMessage = useCallback((content, type = 'text') => {
    if (!activeConversation) return;

    const messageData = {
      conversationId: activeConversation.id,
      senderId: user.userEmail,
      senderName: user.name,
      content,
      type
    };

    chatService.sendMessage(messageData);
  }, [activeConversation, user]);

  const joinConversation = useCallback((conversationId) => {
    chatService.joinConversation(conversationId);
    setActiveConversation(conversations.find(c => c.id === conversationId));
  }, [conversations]);

  const setTyping = useCallback((isTyping) => {
    if (!activeConversation) return;
    
    chatService.setTyping(activeConversation.id, user.userEmail, isTyping);
  }, [activeConversation, user]);

  return {
    conversations,
    activeConversation,
    messages,
    typingUsers,
    sendMessage,
    joinConversation,
    setTyping
  };
};
```

### Componente de Chat

```javascript
// components/Chat.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../hooks/useChat';

export const Chat = ({ conversationId }) => {
  const { messages, sendMessage, setTyping, typingUsers } = useChat();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      sendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleTyping = (e) => {
    setInputValue(e.target.value);
    setTyping(true);
    
    // Clear typing indicator after 2 seconds
    setTimeout(() => setTyping(false), 2000);
  };

  return (
    <div className="chat-container">
      <div className="messages-container">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.senderId === user.userEmail ? 'own' : 'other'}`}>
            <div className="message-header">
              <span className="sender-name">{message.senderName}</span>
              <span className="timestamp">{new Date(message.timestamp).toLocaleTimeString()}</span>
            </div>
            <div className="message-content">{message.content}</div>
          </div>
        ))}
        
        {typingUsers.length > 0 && (
          <div className="typing-indicator">
            {typingUsers.map(user => (
              <span key={user.userEmail}>{user.userEmail} está escribiendo...</span>
            ))}
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="message-input">
        <input
          type="text"
          value={inputValue}
          onChange={handleTyping}
          placeholder="Escribe un mensaje..."
          className="message-input-field"
        />
        <button type="submit" className="send-button">
          Enviar
        </button>
      </form>
    </div>
  );
};
```

---

## 🎵 Solicitudes Directas

### Servicio de Solicitudes

```javascript
// services/musicianRequestService.js
import axios from 'axios';
import { apiConfig } from '../config/api';

class MusicianRequestService {
  constructor() {
    this.api = axios.create(apiConfig);
  }

  async createRequest(requestData) {
    try {
      const response = await this.api.post('/musician-requests/', requestData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async acceptRequest(requestId, musicianId) {
    try {
      const response = await this.api.post('/musician-requests/accept', {
        requestId,
        musicianId
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async cancelRequest(requestId) {
    try {
      const response = await this.api.post('/musician-requests/cancel', {
        requestId
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getRequestStatus(requestId) {
    try {
      const response = await this.api.get(`/musician-requests/${requestId}/status`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  handleError(error) {
    const message = error.response?.data?.msg || 'Error de conexión';
    return new Error(message);
  }
}

export const musicianRequestService = new MusicianRequestService();
```

---

## 📡 Notificaciones en Tiempo Real

### Servicio de Notificaciones

```javascript
// services/notificationService.js
import { socketManager } from '../config/socket';

class NotificationService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect(token) {
    this.socket = socketManager.connect(token);
    this.setupEventListeners();
  }

  disconnect() {
    socketManager.disconnect();
    this.socket = null;
  }

  setupEventListeners() {
    if (!this.socket) return;

    // Nueva solicitud de evento
    this.socket.on('new_event_request', (data) => {
      this.notifyListeners('new_event_request', data);
    });

    // Músico aceptó solicitud
    this.socket.on('musician_accepted', (data) => {
      this.notifyListeners('musician_accepted', data);
    });

    // Solicitud tomada
    this.socket.on('musician_request_taken', (data) => {
      this.notifyListeners('musician_request_taken', data);
    });

    // Solicitud cancelada
    this.socket.on('request_cancelled', (data) => {
      this.notifyListeners('request_cancelled', data);
    });

    // Notificación personalizada
    this.socket.on('notification', (data) => {
      this.notifyListeners('notification', data);
    });
  }

  addListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  removeListener(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  notifyListeners(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error en listener de notificación:', error);
        }
      });
    }
  }

  sendNotification(toUserId, data) {
    if (this.socket) {
      this.socket.emit('send-notification', { toUserId, data });
    }
  }
}

export const notificationService = new NotificationService();
```

### Hook de Notificaciones (React)

```javascript
// hooks/useNotifications.js
import { useEffect, useCallback } from 'react';
import { notificationService } from '../services/notificationService';
import { useAuth } from './useAuth';

export const useNotifications = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (user && user.token) {
      notificationService.connect(user.token);
    }

    return () => {
      notificationService.disconnect();
    };
  }, [user]);

  const onNewEventRequest = useCallback((data) => {
    console.log('Nueva solicitud de evento:', data);
    // Mostrar notificación al usuario
    showNotification('Nueva solicitud', 'Hay una nueva solicitud de músico disponible');
  }, []);

  const onMusicianAccepted = useCallback((data) => {
    console.log('Músico aceptó solicitud:', data);
    showNotification('Solicitud aceptada', 'Un músico ha aceptado tu solicitud');
  }, []);

  const onRequestCancelled = useCallback((data) => {
    console.log('Solicitud cancelada:', data);
    showNotification('Solicitud cancelada', 'Una solicitud ha sido cancelada');
  }, []);

  useEffect(() => {
    notificationService.addListener('new_event_request', onNewEventRequest);
    notificationService.addListener('musician_accepted', onMusicianAccepted);
    notificationService.addListener('request_cancelled', onRequestCancelled);

    return () => {
      notificationService.removeListener('new_event_request', onNewEventRequest);
      notificationService.removeListener('musician_accepted', onMusicianAccepted);
      notificationService.removeListener('request_cancelled', onRequestCancelled);
    };
  }, [onNewEventRequest, onMusicianAccepted, onRequestCancelled]);

  const showNotification = (title, message) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body: message });
    }
  };

  return {
    sendNotification: notificationService.sendNotification.bind(notificationService)
  };
};
```

---

## 🖼️ Sistema de Imágenes CRUD

### Servicio de Imágenes Actualizado

```javascript
// services/imageService.js
import axios from 'axios';
import { apiConfig } from '../config/api';

class ImageService {
  constructor() {
    this.api = axios.create(apiConfig);
  }

  // Obtener todas las imágenes con filtros
  async getAllImages(filters = {}) {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value);
        }
      });
      
      const queryString = params.toString();
      const url = queryString ? `/images?${queryString}` : '/images';
      
      const response = await this.api.get(url);
      return response.data.images || [];
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Obtener imagen por ID
  async getImageById(imageId) {
    try {
      const response = await this.api.get(`/images/${imageId}`);
      return response.data.image;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Subir imagen con metadatos
  async uploadImage(file, category, metadata = {}) {
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('category', category);
      
      if (metadata.description) {
        formData.append('description', metadata.description);
      }
      if (metadata.tags) {
        formData.append('tags', JSON.stringify(metadata.tags));
      }
      if (metadata.isPublic !== undefined) {
        formData.append('isPublic', String(metadata.isPublic));
      }

      const response = await this.api.post('/images/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.image;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Actualizar metadatos de imagen
  async updateImage(imageId, updateData) {
    try {
      const response = await this.api.put(`/images/${imageId}`, updateData);
      return response.data.image;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Eliminar imagen
  async deleteImage(imageId) {
    try {
      const response = await this.api.delete(`/images/${imageId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Obtener estadísticas
  async getImageStats() {
    try {
      const response = await this.api.get('/images/stats');
      return response.data.stats;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Limpiar imágenes expiradas
  async cleanupExpiredImages() {
    try {
      const response = await this.api.post('/images/cleanup');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Obtener imágenes por categoría
  async getImagesByCategory(category, filters = {}) {
    return this.getAllImages({ ...filters, category });
  }

  // Obtener imágenes de perfil
  async getProfileImages(userId) {
    try {
      const response = await this.api.get(`/images/profile/${userId}`);
      return response.data.images || [];
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Obtener imágenes de posts
  async getPostImages(userId) {
    try {
      const response = await this.api.get(`/images/posts${userId ? `?userId=${userId}` : ''}`);
      return response.data.images || [];
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Obtener imágenes de eventos
  async getEventImages(eventId) {
    try {
      const response = await this.api.get(`/images/events${eventId ? `?eventId=${eventId}` : ''}`);
      return response.data.images || [];
    } catch (error) {
      throw this.handleError(error);
    }
  }

  handleError(error) {
    const message = error.response?.data?.message || 'Error de conexión';
    return new Error(message);
  }
}

export const imageService = new ImageService();
```

### Hook de Imágenes Actualizado (React)

```javascript
// hooks/useImages.js
import { useState, useEffect } from 'react';
import { imageService } from '../services/imageService';

export const useImages = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    loadImages();
    loadStats();
  }, [filters]);

  const loadImages = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await imageService.getAllImages(filters);
      setImages(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await imageService.getImageStats();
      setStats(data);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const uploadImage = async (file, category, metadata = {}) => {
    setLoading(true);
    setError(null);
    try {
      const result = await imageService.uploadImage(file, category, metadata);
      setImages(prev => [result, ...prev]);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateImage = async (imageId, updateData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await imageService.updateImage(imageId, updateData);
      setImages(prev => prev.map(img => img.id === imageId ? result : img));
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteImage = async (imageId) => {
    setLoading(true);
    setError(null);
    try {
      await imageService.deleteImage(imageId);
      setImages(prev => prev.filter(img => img.id !== imageId));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cleanupExpiredImages = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await imageService.cleanupExpiredImages();
      await loadImages(); // Recargar imágenes después de limpieza
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getImagesByCategory = async (category) => {
    setLoading(true);
    setError(null);
    try {
      const data = await imageService.getImagesByCategory(category);
      setImages(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getProfileImages = async (userId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await imageService.getProfileImages(userId);
      setImages(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getPostImages = async (userId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await imageService.getPostImages(userId);
      setImages(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getEventImages = async (eventId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await imageService.getEventImages(eventId);
      setImages(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    images,
    loading,
    error,
    stats,
    filters,
    setFilters,
    uploadImage,
    updateImage,
    deleteImage,
    cleanupExpiredImages,
    getImagesByCategory,
    getProfileImages,
    getPostImages,
    getEventImages,
    loadImages
  };
};
```

### Componente de Subida de Imágenes Mejorado (React + Material-UI)

```javascript
// components/ImageUpload.jsx
import React, { useState, useRef } from 'react';
import {
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Paper,
  CircularProgress
} from '@mui/material';
import { Add as AddIcon, Close as CloseIcon, CloudUpload as CloudUploadIcon } from '@mui/icons-material';

const ImageUpload = ({ onUpload, uploading = false }) => {
  const [showMetadataDialog, setShowMetadataDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [category, setCategory] = useState('admin');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      setError('Solo se permiten archivos de imagen (JPEG, PNG, GIF, WebP, SVG)');
      return false;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError('El archivo es demasiado grande. Máximo 10MB');
      return false;
    }

    setError(null);
    return true;
  };

  const handleFileSelect = (file) => {
    if (!validateFile(file)) return;
    setSelectedFile(file);
    setShowMetadataDialog(true);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      const metadata = {
        description: description.trim() || undefined,
        tags: tags.length > 0 ? tags : undefined,
        isPublic
      };

      await onUpload(selectedFile, category, metadata);
      
      // Limpiar estado
      setSelectedFile(null);
      setCategory('admin');
      setDescription('');
      setTags([]);
      setNewTag('');
      setIsPublic(true);
      setShowMetadataDialog(false);
    } catch (error) {
      setError('Error al subir la imagen. Inténtalo de nuevo.');
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <Box>
      {/* Área de subida */}
      <Paper
        elevation={2}
        sx={{
          border: '2px dashed',
          borderColor: 'grey.300',
          borderRadius: 2,
          p: 4,
          textAlign: 'center',
          cursor: uploading ? 'not-allowed' : 'pointer',
          '&:hover': {
            borderColor: 'primary.main',
            backgroundColor: 'primary.50',
          }
        }}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
          }}
          style={{ display: 'none' }}
        />
        
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          {uploading ? (
            <>
              <CircularProgress size={60} />
              <Typography variant="h6" color="primary">
                Subiendo imagen...
              </Typography>
            </>
          ) : (
            <>
              <CloudUploadIcon sx={{ fontSize: 60, color: 'primary.main' }} />
              <Typography variant="h5" component="h3" gutterBottom>
                Subir Imagen
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                Arrastra una imagen aquí o haz clic para seleccionar
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Formatos: JPEG, PNG, GIF, WebP, SVG
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Máximo: 10MB
                </Typography>
              </Box>
            </>
          )}
        </Box>
      </Paper>

      {/* Dialog para metadatos */}
      <Dialog 
        open={showMetadataDialog} 
        onClose={() => setShowMetadataDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Configurar Imagen
          <IconButton
            aria-label="close"
            onClick={() => setShowMetadataDialog(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {selectedFile && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Archivo: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </Typography>
            )}
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Categoría</InputLabel>
              <Select
                value={category}
                label="Categoría"
                onChange={(e) => setCategory(e.target.value)}
              >
                <MenuItem value="profile">Perfil</MenuItem>
                <MenuItem value="post">Post</MenuItem>
                <MenuItem value="event">Evento</MenuItem>
                <MenuItem value="gallery">Galería</MenuItem>
                <MenuItem value="admin">Administración</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Descripción (opcional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={3}
              sx={{ mb: 2 }}
            />

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Etiquetas
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField
                  size="small"
                  placeholder="Agregar etiqueta"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  sx={{ flexGrow: 1 }}
                />
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleAddTag}
                  startIcon={<AddIcon />}
                >
                  Agregar
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => handleRemoveTag(tag)}
                    size="small"
                  />
                ))}
              </Box>
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                />
              }
              label="Imagen pública"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowMetadataDialog(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleUpload} 
            variant="contained"
            disabled={uploading}
          >
            {uploading ? 'Subiendo...' : 'Subir Imagen'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ImageUpload;
```

---

## 🖼️ Sistema de Imágenes CRUD

### Servicio de Imágenes

```javascript
// services/imageService.js
import axios from 'axios';
import { apiConfig } from '../config/api';

class ImageService {
  constructor() {
    this.api = axios.create(apiConfig);
  }

  async getAllImages() {
    try {
      const response = await this.api.get('/imgs/getAllImg');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getImageUrl(key) {
    try {
      const response = await this.api.get(`/imgs/getUrl/${key}`);
      return response.data.url;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async uploadImage(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await this.api.post('/imgs/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async uploadProfileImage(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await this.api.post('/media/saveImage', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteImage(key) {
    try {
      const response = await this.api.delete(`/imgs/delete/${key}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateImageMetadata(key, metadata) {
    try {
      const response = await this.api.put(`/imgs/update-metadata/${key}`, metadata);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  handleError(error) {
    const message = error.response?.data?.msg || 'Error de conexión';
    return new Error(message);
  }
}

export const imageService = new ImageService();
```

### Hook de Imágenes (React)

```javascript
// hooks/useImages.js
import { useState, useEffect } from 'react';
import { imageService } from '../services/imageService';

export const useImages = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await imageService.getAllImages();
        setImages(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  const uploadImage = async (file) => {
    setLoading(true);
    setError(null);
    try {
      const result = await imageService.uploadImage(file);
      setImages(prev => [...prev, result]);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const uploadProfileImage = async (file) => {
    setLoading(true);
    setError(null);
    try {
      const result = await imageService.uploadProfileImage(file);
      setImages(prev => [...prev, result]);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteImage = async (key) => {
    setLoading(true);
    setError(null);
    try {
      await imageService.deleteImage(key);
      setImages(prev => prev.filter(img => img.key !== key));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateImageMetadata = async (key, metadata) => {
    setLoading(true);
    setError(null);
    try {
      const result = await imageService.updateImageMetadata(key, metadata);
      setImages(prev => prev.map(img => img.key === key ? { ...img, ...metadata } : img));
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    images,
    loading,
    error,
    uploadImage,
    uploadProfileImage,
    deleteImage,
    updateImageMetadata
  };
};
```

### Componente de Subida de Imágenes (React)

```javascript
// components/ImageUpload.jsx
import React, { useState } from 'react';
import { imageService } from '../services/imageService';

const ImageUpload = ({ onUpload, type = 'general' }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Solo se permiten archivos JPG, PNG y WebP');
      return;
    }

    // Validar tamaño (5MB máximo)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('El archivo no puede ser mayor a 5MB');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      let result;
      if (type === 'profile') {
        result = await imageService.uploadProfileImage(file);
      } else {
        result = await imageService.uploadImage(file);
      }

      onUpload(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="image-upload">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
        className="file-input"
      />
      {uploading && <div className="uploading">Subiendo imagen...</div>}
      {error && <div className="error">{error}</div>}
    </div>
  );
};

export default ImageUpload;
```

---

## ⚠️ Manejo de Errores

### Clase de Manejo de Errores

```javascript
// utils/errorHandler.js
export class ApiError extends Error {
  constructor(message, status, code) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export const handleApiError = (error) => {
  if (error.response) {
    // Error de respuesta del servidor
    const { status, data } = error.response;
    throw new ApiError(data.msg || 'Error del servidor', status, data.code);
  } else if (error.request) {
    // Error de red
    throw new ApiError('Error de conexión', 0, 'NETWORK_ERROR');
  } else {
    // Error de configuración
    throw new ApiError('Error de configuración', 0, 'CONFIG_ERROR');
  }
};

export const showErrorNotification = (error) => {
  const message = error.message || 'Ha ocurrido un error';
  
  // Mostrar notificación al usuario
  if (typeof window !== 'undefined' && window.toast) {
    window.toast.error(message);
  } else {
    alert(message);
  }
};
```

### Hook de Manejo de Errores (React)

```javascript
// hooks/useErrorHandler.js
import { useState, useCallback } from 'react';
import { handleApiError, showErrorNotification } from '../utils/errorHandler';

export const useErrorHandler = () => {
  const [error, setError] = useState(null);

  const handleError = useCallback((error) => {
    const apiError = handleApiError(error);
    setError(apiError);
    showErrorNotification(apiError);
    return apiError;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    clearError
  };
};
```

---

## 💡 Ejemplos de Código

### Componente de Login (React)

```javascript
// components/Login.jsx
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useErrorHandler } from '../hooks/useErrorHandler';

const Login = () => {
  const [credentials, setCredentials] = useState({
    userEmail: '',
    userPassword: ''
  });
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const { handleError, error, clearError } = useErrorHandler();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearError();

    try {
      await login(credentials);
      // Redirigir al dashboard
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Email"
        value={credentials.userEmail}
        onChange={(e) => setCredentials({
          ...credentials,
          userEmail: e.target.value
        })}
        required
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={credentials.userPassword}
        onChange={(e) => setCredentials({
          ...credentials,
          userPassword: e.target.value
        })}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
      </button>
      {error && <div className="error">{error.message}</div>}
    </form>
  );
};

export default Login;
```

### Componente de Lista de Eventos (React)

```javascript
// components/EventList.jsx
import React, { useEffect, useState } from 'react';
import { useEvents } from '../hooks/useEvents';
import { useAuth } from '../hooks/useAuth';

const EventList = ({ type = 'available' }) => {
  const { user } = useAuth();
  const { events, loading, error, fetchEvents, eventService } = useEvents();
  const [filteredEvents, setFilteredEvents] = useState([]);

  useEffect(() => {
    const loadEvents = async () => {
      switch (type) {
        case 'pending':
          await fetchEvents(eventService.getMyPendingEvents);
          break;
        case 'assigned':
          await fetchEvents(eventService.getMyAssignedEvents);
          break;
        case 'completed':
          await fetchEvents(eventService.getMyCompletedEvents);
          break;
        case 'available':
          await fetchEvents(eventService.getAvailableRequests);
          break;
        case 'scheduled':
          await fetchEvents(eventService.getMyScheduledEvents);
          break;
        default:
          await fetchEvents(eventService.getMyEvents);
      }
    };

    loadEvents();
  }, [type, fetchEvents, eventService]);

  const handleAcceptEvent = async (eventId) => {
    try {
      await eventService.acceptEvent(eventId);
      // Recargar eventos
      await fetchEvents(eventService.getAvailableRequests);
    } catch (error) {
      console.error('Error al aceptar evento:', error);
    }
  };

  if (loading) return <div>Cargando eventos...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="event-list">
      {events.map((event) => (
        <div key={event.id} className="event-card">
          <h3>{event.eventName}</h3>
          <p>Fecha: {event.date}</p>
          <p>Hora: {event.time}</p>
          <p>Ubicación: {event.location}</p>
          <p>Instrumento: {event.instrument}</p>
          <p>Presupuesto: {event.budget}</p>
          {type === 'available' && user?.roll === 'musico' && (
            <button onClick={() => handleAcceptEvent(event.id)}>
              Aceptar Evento
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default EventList;
```

---

## ✅ Mejores Prácticas

### 1. Gestión de Estado

- Usa Context API o Redux para estado global
- Mantén estado local en componentes simples
- Implementa cache para datos frecuentemente accedidos

### 2. Manejo de Errores

- Implementa manejo de errores consistente
- Muestra mensajes de error amigables al usuario
- Registra errores para debugging

### 3. Optimización de Rendimiento

- Implementa lazy loading para componentes pesados
- Usa React.memo para componentes que no cambian frecuentemente
- Optimiza re-renders con useMemo y useCallback

### 4. Seguridad

- Nunca almacenes tokens en localStorage sin encriptar
- Valida datos en el frontend antes de enviar al backend
- Implementa logout automático en tokens expirados

### 5. UX/UI

- Muestra estados de loading apropiados
- Implementa feedback visual para acciones del usuario
- Usa notificaciones toast para mensajes importantes

### 6. Testing

- Escribe tests unitarios para servicios
- Implementa tests de integración para flujos completos
- Usa mocks para APIs externas

---

## 📚 Recursos Adicionales

- [Documentación de la API](http://localhost:1000/api-docs)
- [Guía de Swagger](https://swagger.io/docs/)
- [Documentación de Socket.IO](https://socket.io/docs/)
- [React Hooks](https://reactjs.org/docs/hooks-intro.html)
- [Axios](https://axios-http.com/docs/intro)

---

> **Nota:** Esta documentación asume que estás usando React, pero los conceptos son aplicables a cualquier framework frontend (Vue, Angular, etc.). 