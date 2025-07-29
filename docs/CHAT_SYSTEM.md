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

### 🔄 Comunicación en Tiempo Real ✅ **IMPLEMENTADO**
- **Mensajes instantáneos** entre usuarios
- **Indicador de escritura** (typing indicator)
- **Estados de conexión** en vivo
- **Notificaciones push** para mensajes nuevos
- **Historial de conversaciones** persistente

### 💬 Funcionalidades de Chat ✅ **IMPLEMENTADO**
- **Conversaciones privadas** entre dos usuarios
- **Conversaciones grupales** para eventos
- **Múltiples tipos de mensaje**: texto, imagen, audio, archivo
- **Marcado de mensajes leídos**
- **Búsqueda en conversaciones**
- **Archivos adjuntos** con límites de tamaño

### 🔔 Sistema de Notificaciones ✅ **IMPLEMENTADO**
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

## 🔌 Eventos de Socket.IO ✅ **IMPLEMENTADO**

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
  senderId: 'user_456',
  senderName: 'Juan Pérez',
  content: 'Hola, ¿cómo estás?',
  type: 'text' // 'text', 'image', 'audio', 'file'
});

// Servidor responde
socket.on('new-message', (message) => {
  console.log('Nuevo mensaje:', message);
});

// Error si hay problemas
socket.on('message-error', (error) => {
  console.error('Error al enviar mensaje:', error);
});
```

#### Marcar Mensaje como Leído
```javascript
// Cliente emite
socket.emit('mark-message-read', {
  messageId: 'message_789',
  conversationId: 'conversation_123'
});

// Servidor confirma
socket.on('message-read', (data) => {
  console.log('Mensaje marcado como leído:', data.messageId);
});
```

### Eventos de Estado

#### Indicador de Escritura
```javascript
// Cliente emite
socket.emit('typing', {
  conversationId: 'conversation_123',
  userEmail: 'usuario@example.com',
  isTyping: true
});

// Otros usuarios reciben
socket.on('user-typing', (data) => {
  console.log('Usuario escribiendo:', data);
});
```

#### Estado de Conexión
```javascript
// Cliente emite
socket.emit('online-status', {
  userEmail: 'usuario@example.com',
  isOnline: true
});

// Todos los usuarios reciben
socket.on('user-status-changed', (data) => {
  console.log('Estado de usuario cambiado:', data);
});
```

## 📡 API Endpoints ✅ **IMPLEMENTADO**

### Crear Conversación
```http
POST /chat/conversations
Content-Type: application/json
Authorization: Bearer <token>

{
  "participants": ["user1@example.com", "user2@example.com"],
  "type": "private", // "private" o "group"
  "name": "Conversación con Juan" // opcional para grupos
}
```

### Obtener Conversaciones del Usuario
```http
GET /chat/conversations
Authorization: Bearer <token>
```

### Obtener Conversación Específica
```http
GET /chat/conversations/:id
Authorization: Bearer <token>
```

### Obtener Mensajes de Conversación
```http
GET /chat/conversations/:id/messages?limit=50&offset=0
Authorization: Bearer <token>
```

### Marcar Mensajes como Leídos
```http
PUT /chat/conversations/:id/messages/read
Authorization: Bearer <token>

{
  "messageIds": ["message_1", "message_2"]
}
```

## 📊 Modelos de Datos

### Interface Conversation
```typescript
interface Conversation {
  id: string;
  participants: string[];           // Array de emails de participantes
  type: 'private' | 'group';       // Tipo de conversación
  name?: string;                    // Nombre para conversaciones grupales
  lastMessage?: Message;            // Último mensaje enviado
  unreadCount: number;              // Contador de mensajes no leídos
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}
```

### Interface Message
```typescript
interface Message {
  id: string;
  conversationId: string;           // ID de la conversación
  senderId: string;                 // ID del remitente
  senderName: string;               // Nombre del remitente
  content: string;                  // Contenido del mensaje
  type: 'text' | 'image' | 'audio' | 'file';
  status: 'sent' | 'delivered' | 'read';
  timestamp: FirebaseFirestore.Timestamp;
  metadata?: {                      // Metadatos adicionales
    fileSize?: number;
    fileName?: string;
    mimeType?: string;
  };
}
```

### Interface ChatUser
```typescript
interface ChatUser {
  socketId: string;                 // ID del socket
  userEmail: string;                // Email del usuario
  userName: string;                 // Nombre del usuario
  isOnline: boolean;                // Estado de conexión
  lastSeen: Date;                   // Última vez visto
}
```

## 🎨 Integración Frontend

### Configuración del Cliente

```javascript
// Configurar Socket.IO
const socket = io('http://localhost:1000', {
  auth: {
    token: 'jwt_token_here'
  }
});

// Registrar usuario en chat
socket.emit('chat-register', {
  userEmail: 'usuario@example.com',
  userName: 'Juan Pérez'
});
```

### Servicio de Chat

```javascript
class ChatService {
  constructor() {
    this.socket = null;
    this.conversations = [];
    this.currentConversation = null;
  }

  // Conectar al servidor
  connect(token) {
    this.socket = io('http://localhost:1000', {
      auth: { token }
    });
    
    this.setupEventListeners();
  }

  // Registrar usuario
  registerUser(userEmail, userName) {
    this.socket.emit('chat-register', { userEmail, userName });
  }

  // Unirse a conversación
  joinConversation(conversationId) {
    this.socket.emit('join-conversation', conversationId);
  }

  // Enviar mensaje
  sendMessage(conversationId, content, type = 'text') {
    this.socket.emit('send-message', {
      conversationId,
      senderId: this.currentUser.id,
      senderName: this.currentUser.name,
      content,
      type
    });
  }

  // Configurar listeners
  setupEventListeners() {
    this.socket.on('new-message', (message) => {
      this.handleNewMessage(message);
    });

    this.socket.on('user-typing', (data) => {
      this.handleTypingIndicator(data);
    });

    this.socket.on('message-notification', (notification) => {
      this.handleMessageNotification(notification);
    });
  }
}
```

### Componente de Chat

```javascript
// React/Vue component
const ChatComponent = () => {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    // Cargar conversaciones
    loadConversations();
    
    // Configurar socket listeners
    chatService.socket.on('new-message', handleNewMessage);
    chatService.socket.on('user-typing', handleTyping);
  }, []);

  const handleNewMessage = (message) => {
    setMessages(prev => [...prev, message]);
  };

  const handleTyping = (data) => {
    setIsTyping(data.isTyping);
  };

  const sendMessage = (content) => {
    chatService.sendMessage(currentConversationId, content);
  };

  return (
    <div className="chat-container">
      <div className="conversations-list">
        {conversations.map(conv => (
          <ConversationItem key={conv.id} conversation={conv} />
        ))}
      </div>
      
      <div className="chat-messages">
        {messages.map(msg => (
          <MessageItem key={msg.id} message={msg} />
        ))}
        
        {isTyping && <TypingIndicator />}
      </div>
      
      <MessageInput onSend={sendMessage} />
    </div>
  );
};
```

## 🎯 Casos de Uso

### 1. Chat Privado entre Usuarios

**Escenario**: Dos usuarios quieren conversar en privado.

```javascript
// Crear conversación privada
const conversation = await createConversation({
  participants: ['usuario1@example.com', 'usuario2@example.com'],
  type: 'private'
});

// Ambos usuarios se unen a la conversación
chatService.joinConversation(conversation.id);

// Enviar mensaje
chatService.sendMessage(conversation.id, 'Hola, ¿cómo estás?');
```

### 2. Chat Grupal para Evento

**Escenario**: Músicos y organizador conversan sobre un evento.

```javascript
// Crear conversación grupal
const groupConversation = await createConversation({
  participants: ['organizador@example.com', 'musico1@example.com', 'musico2@example.com'],
  type: 'group',
  name: 'Evento: Boda de María y Juan'
});

// Todos los participantes se unen
participants.forEach(participant => {
  chatService.joinConversation(groupConversation.id);
});
```

### 3. Notificaciones de Mensajes

**Escenario**: Usuario recibe notificación de mensaje nuevo.

```javascript
// Usuario recibe notificación
socket.on('message-notification', (notification) => {
  // Mostrar notificación push
  showNotification({
    title: 'Nuevo mensaje',
    body: notification.message.content,
    icon: '/icon.png'
  });
  
  // Actualizar contador de no leídos
  updateUnreadCount(notification.unreadCount);
});
```

## 🔒 Seguridad

### Autenticación ✅ **IMPLEMENTADO**
- **JWT tokens** requeridos para todas las operaciones
- **Validación de participantes** en conversaciones
- **Verificación de permisos** antes de enviar mensajes

### Validación de Datos ✅ **IMPLEMENTADO**
- **Sanitización de contenido** para prevenir XSS
- **Límites de tamaño** para archivos adjuntos
- **Validación de tipos** de mensaje permitidos

### Rate Limiting ✅ **IMPLEMENTADO**
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

## 📊 Estado de Implementación

### ✅ Funcionalidades Completadas
- [x] **Conexión Socket.IO** - Comunicación en tiempo real
- [x] **Registro de usuarios** - Sistema de autenticación en chat
- [x] **Conversaciones privadas** - Chat entre dos usuarios
- [x] **Conversaciones grupales** - Chat para múltiples usuarios
- [x] **Envío de mensajes** - Texto, imagen, audio, archivo
- [x] **Indicadores de escritura** - Mostrar cuando alguien escribe
- [x] **Estado de mensajes** - Enviado, entregado, leído
- [x] **Notificaciones push** - Alertas para mensajes nuevos
- [x] **Historial persistente** - Mensajes guardados en base de datos
- [x] **API REST** - Endpoints para gestión de conversaciones
- [x] **Validación de seguridad** - JWT, permisos, rate limiting

### 🔄 Próximas Funcionalidades
- [ ] **Búsqueda en mensajes** - Buscar contenido específico
- [ ] **Archivos adjuntos** - Subir y compartir archivos
- [ ] **Emojis y reacciones** - React a mensajes
- [ ] **Mensajes editados** - Editar mensajes enviados
- [ ] **Mensajes eliminados** - Eliminar mensajes propios
- [ ] **Chat en vivo** - Video/audio calls

---

## 📚 Referencias

- [Socket.IO Documentation](https://socket.io/docs/)
- [Firebase Firestore](https://firebase.google.com/docs/firestore)
- [JWT Authentication](https://jwt.io/)
- [WebSocket Protocol](https://tools.ietf.org/html/rfc6455)

---

**Última actualización**: Sistema de chat completamente implementado ✅ 