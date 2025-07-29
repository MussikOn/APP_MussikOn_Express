# 💬 Sistema de Chat en Tiempo Real - MussikOn

> **Sistema completo de chat y comunicación en tiempo real entre usuarios**

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Arquitectura](#-arquitectura)
- [Eventos de Socket.IO](#-eventos-de-socketio)
- [API Endpoints](#-api-endpoints)
- [Modelos de Datos](#-modelos-de-datos)
- [Integración Frontend](#-integración-frontend)
- [Casos de Uso](#-casos-de-uso)
- [Seguridad](#-seguridad)
- [Troubleshooting](#-troubleshooting)

## ✨ Características

### 🔄 Comunicación en Tiempo Real
- **Mensajes instantáneos** entre usuarios
- **Indicador de escritura** (typing indicator)
- **Estados de conexión** en vivo
- **Notificaciones push** para mensajes nuevos
- **Historial de conversaciones** persistente

### 💬 Funcionalidades de Chat
- **Conversaciones privadas** entre dos usuarios
- **Conversaciones grupales** para eventos
- **Múltiples tipos de mensaje**: texto, imagen, audio, archivo
- **Marcado de mensajes leídos**
- **Búsqueda en conversaciones**
- **Archivos adjuntos** con límites de tamaño

### 🔔 Sistema de Notificaciones
- **Notificaciones en tiempo real** para nuevos mensajes
- **Contador de mensajes no leídos**
- **Sonidos de notificación** configurables
- **Notificaciones push** para dispositivos móviles
- **Filtros de notificación** por tipo

## 🏗️ Arquitectura

### Componentes del Sistema

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Socket.IO     │    │   Database      │
│   (React/Vue)   │◄──►│   Server        │◄──►│   (Firebase)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐             │
         └──────────────►│   Chat API      │◄────────────┘
                        │   (REST)        │
                        └─────────────────┘
```

### Flujo de Comunicación

1. **Conexión**: Usuario se conecta al socket con autenticación
2. **Registro**: Usuario se registra en el sistema de chat
3. **Conversación**: Usuario se une a conversaciones específicas
4. **Mensaje**: Usuario envía mensaje que se guarda en DB y emite a participantes
5. **Notificación**: Participantes reciben notificación en tiempo real

## 🔌 Eventos de Socket.IO

### Eventos de Conexión

#### Registrar Usuario en Chat
```javascript
// Cliente emite
socket.emit('chat-register', {
  userEmail: 'usuario@example.com',
  userName: 'Juan Pérez'
});

// Servidor responde
socket.on('authenticated', {
  success: true,
  userEmail: 'usuario@example.com'
});
```

#### Autenticar Usuario
```javascript
// Cliente emite
socket.emit('authenticate', {
  userEmail: 'usuario@example.com',
  userId: 'user_123'
});

// Servidor responde
socket.on('authenticated', {
  success: true,
  userEmail: 'usuario@example.com'
});
```

### Eventos de Conversación

#### Unirse a Conversación
```javascript
// Cliente emite
socket.emit('join-conversation', 'conversation_123');

// Servidor confirma
console.log('Usuario se unió a la conversación: conversation_123');
```

#### Salir de Conversación
```javascript
// Cliente emite
socket.emit('leave-conversation', 'conversation_123');

// Servidor confirma
console.log('Usuario salió de la conversación: conversation_123');
```

### Eventos de Mensajes

#### Enviar Mensaje
```javascript
// Cliente emite
socket.emit('send-message', {
  conversationId: 'conversation_123',
  senderId: 'user_123',
  senderName: 'Juan Pérez',
  content: 'Hola, ¿cómo estás?',
  type: 'text' // 'text', 'image', 'audio', 'file'
});

// Servidor emite a todos los participantes
socket.on('new-message', {
  id: 'message_456',
  conversationId: 'conversation_123',
  senderId: 'user_123',
  senderName: 'Juan Pérez',
  content: 'Hola, ¿cómo estás?',
  type: 'text',
  status: 'sent',
  timestamp: '2024-01-15T12:00:00Z'
});
```

#### Marcar Mensaje como Leído
```javascript
// Cliente emite
socket.emit('mark-message-read', {
  messageId: 'message_456',
  conversationId: 'conversation_123'
});

// Servidor emite a la conversación
socket.on('message-read', {
  messageId: 'message_456'
});
```

#### Indicador de Escritura
```javascript
// Cliente emite cuando empieza a escribir
socket.emit('typing', {
  conversationId: 'conversation_123',
  userEmail: 'usuario@example.com',
  isTyping: true
});

// Cliente emite cuando deja de escribir
socket.emit('typing', {
  conversationId: 'conversation_123',
  userEmail: 'usuario@example.com',
  isTyping: false
});

// Otros participantes reciben
socket.on('user-typing', {
  conversationId: 'conversation_123',
  userEmail: 'usuario@example.com',
  isTyping: true
});
```

#### Estado de Conexión
```javascript
// Cliente emite cambio de estado
socket.emit('online-status', {
  userEmail: 'usuario@example.com',
  isOnline: true
});

// Todos los usuarios reciben
socket.on('user-status-changed', {
  userEmail: 'usuario@example.com',
  isOnline: true
});
```

### Eventos de Notificación

#### Notificación de Mensaje Nuevo
```javascript
// Servidor emite a usuarios no en la conversación
socket.on('message-notification', {
  conversationId: 'conversation_123',
  message: {
    id: 'message_456',
    senderName: 'Juan Pérez',
    content: 'Hola, ¿cómo estás?'
  },
  unreadCount: 3
});
```

#### Notificación Personalizada
```javascript
// Servidor emite notificación específica
socket.on('notification', {
  title: 'Nueva solicitud',
  message: 'Tienes una nueva solicitud de músico',
  type: 'info',
  timestamp: '2024-01-15T12:00:00Z'
});
```

## 📡 API Endpoints

### Conversaciones

#### Crear Conversación
```http
POST /chat/conversations
Authorization: Bearer <token>
Content-Type: application/json

{
  "participants": ["user1@example.com", "user2@example.com"],
  "title": "Conversación sobre evento",
  "type": "private" // "private" o "group"
}
```

**Response (201)**
```json
{
  "success": true,
  "conversation": {
    "id": "conversation_123",
    "participants": ["user1@example.com", "user2@example.com"],
    "title": "Conversación sobre evento",
    "type": "private",
    "createdAt": "2024-01-15T12:00:00Z",
    "lastMessage": null,
    "unreadCount": 0
  }
}
```

#### Obtener Conversaciones del Usuario
```http
GET /chat/conversations
Authorization: Bearer <token>
```

**Response (200)**
```json
{
  "success": true,
  "conversations": [
    {
      "id": "conversation_123",
      "participants": ["user1@example.com", "user2@example.com"],
      "title": "Conversación sobre evento",
      "type": "private",
      "lastMessage": {
        "content": "Hola, ¿cómo estás?",
        "senderName": "Juan Pérez",
        "timestamp": "2024-01-15T12:00:00Z"
      },
      "unreadCount": 2
    }
  ]
}
```

#### Obtener Conversación por ID
```http
GET /chat/conversations/:conversationId
Authorization: Bearer <token>
```

**Response (200)**
```json
{
  "success": true,
  "conversation": {
    "id": "conversation_123",
    "participants": ["user1@example.com", "user2@example.com"],
    "title": "Conversación sobre evento",
    "type": "private",
    "createdAt": "2024-01-15T12:00:00Z",
    "lastMessage": {
      "content": "Hola, ¿cómo estás?",
      "senderName": "Juan Pérez",
      "timestamp": "2024-01-15T12:00:00Z"
    },
    "unreadCount": 2
  }
}
```

### Mensajes

#### Obtener Mensajes de Conversación
```http
GET /chat/conversations/:conversationId/messages?limit=50&offset=0
Authorization: Bearer <token>
```

**Response (200)**
```json
{
  "success": true,
  "messages": [
    {
      "id": "message_456",
      "conversationId": "conversation_123",
      "senderId": "user_123",
      "senderName": "Juan Pérez",
      "content": "Hola, ¿cómo estás?",
      "type": "text",
      "status": "sent",
      "timestamp": "2024-01-15T12:00:00Z"
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

#### Marcar Mensajes como Leídos
```http
PUT /chat/conversations/:conversationId/messages/read
Authorization: Bearer <token>
Content-Type: application/json

{
  "messageIds": ["message_456", "message_789"]
}
```

**Response (200)**
```json
{
  "success": true,
  "message": "Mensajes marcados como leídos",
  "updatedCount": 2
}
```

## 📊 Modelos de Datos

### Conversación
```typescript
interface Conversation {
  id: string;
  participants: string[]; // Array de emails
  title: string;
  type: 'private' | 'group';
  createdAt: Date;
  updatedAt: Date;
  lastMessage?: Message;
  unreadCount: number;
}
```

### Mensaje
```typescript
interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  type: 'text' | 'image' | 'audio' | 'file';
  status: 'sent' | 'delivered' | 'read';
  timestamp: Date;
  metadata?: {
    fileSize?: number;
    fileName?: string;
    mimeType?: string;
    duration?: number; // Para audio
  };
}
```

### Usuario Conectado
```typescript
interface ConnectedUser {
  socketId: string;
  userEmail: string;
  userName: string;
  isOnline: boolean;
  lastSeen: Date;
}
```

## 🎨 Integración Frontend

### Configuración de Socket.IO

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

## 🎯 Casos de Uso

### 1. Chat entre Organizador y Músico

**Escenario**: Un organizador quiere comunicarse con un músico sobre detalles del evento.

```javascript
// 1. Organizador crea conversación
const conversation = await api.post('/chat/conversations', {
  participants: ['organizador@example.com', 'musico@example.com'],
  title: 'Detalles del evento - Boda de María y Juan',
  type: 'private'
});

// 2. Ambos usuarios se unen a la conversación
chatService.joinConversation(conversation.id);

// 3. Intercambio de mensajes
chatService.sendMessage({
  conversationId: conversation.id,
  senderId: 'organizador@example.com',
  senderName: 'María González',
  content: 'Hola, ¿podrías llegar 30 minutos antes?',
  type: 'text'
});
```

### 2. Notificaciones de Solicitudes

**Escenario**: Un músico recibe notificación cuando hay una nueva solicitud disponible.

```javascript
// El servidor emite automáticamente
socket.on('notification', {
  title: 'Nueva solicitud disponible',
  message: 'Hay una nueva solicitud de pianista para boda',
  type: 'info',
  action: {
    type: 'navigate',
    route: '/requests/request_123'
  }
});
```

### 3. Indicador de Escritura

**Escenario**: Mostrar cuando el otro usuario está escribiendo.

```javascript
// Usuario empieza a escribir
chatService.setTyping(conversationId, userEmail, true);

// Otro usuario recibe la notificación
socket.on('user-typing', (data) => {
  if (data.isTyping) {
    showTypingIndicator(data.userEmail);
  } else {
    hideTypingIndicator(data.userEmail);
  }
});
```

## 🔒 Seguridad

### Autenticación
- **JWT tokens** requeridos para todas las operaciones
- **Validación de participantes** en conversaciones
- **Verificación de permisos** antes de enviar mensajes

### Validación de Datos
- **Sanitización de contenido** para prevenir XSS
- **Límites de tamaño** para archivos adjuntos
- **Validación de tipos** de mensaje permitidos

### Rate Limiting
- **Límite de mensajes** por minuto por usuario
- **Límite de conexiones** simultáneas por usuario
- **Protección contra spam** y mensajes repetitivos

## 🔧 Troubleshooting

### Problemas Comunes

#### Conexión Perdida
```javascript
// Verificar estado de conexión
if (!chatService.isConnected) {
  chatService.connect(token);
  chatService.registerUser(userEmail, userName);
}
```

#### Mensajes No Recibidos
```javascript
// Verificar que el usuario está en la conversación
chatService.joinConversation(conversationId);

// Verificar permisos de participante
const isParticipant = conversation.participants.includes(userEmail);
if (!isParticipant) {
  console.error('Usuario no es participante de la conversación');
}
```

#### Notificaciones No Funcionan
```javascript
// Verificar que el usuario está registrado
chatService.registerUser(userEmail, userName);

// Verificar que el socket está conectado
if (chatService.socket && chatService.socket.connected) {
  console.log('Socket conectado correctamente');
}
```

### Logs de Debug

```javascript
// Habilitar logs detallados
socket.on('connect', () => {
  console.log('🔌 Conectado al servidor de chat');
});

socket.on('chat-register', (data) => {
  console.log('📝 Usuario registrado:', data);
});

socket.on('new-message', (message) => {
  console.log('💬 Nuevo mensaje recibido:', message);
});
```

---

## 📚 Referencias

- [Socket.IO Documentation](https://socket.io/docs/)
- [Firebase Firestore](https://firebase.google.com/docs/firestore)
- [JWT Authentication](https://jwt.io/)
- [WebSocket Protocol](https://tools.ietf.org/html/rfc6455) 