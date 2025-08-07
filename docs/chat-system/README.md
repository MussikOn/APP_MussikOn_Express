# 💬 Sistema de Chat - MussikOn API

## 📋 Índice

- [Descripción General](#descripción-general)
- [Arquitectura del Sistema](#arquitectura-del-sistema)
- [Tipos de Conversaciones](#tipos-de-conversaciones)
- [Mensajería en Tiempo Real](#mensajería-en-tiempo-real)
- [Notificaciones Push](#notificaciones-push)
- [Gestión de Archivos](#gestión-de-archivos)
- [Moderación](#moderación)

## 🎯 Descripción General

El Sistema de Chat de MussikOn proporciona comunicación en tiempo real entre músicos y organizadores, facilitando la coordinación de eventos y la gestión de contrataciones.

### Características Principales

- **Chat en Tiempo Real**: Comunicación instantánea con Socket.IO
- **Notificaciones Push**: Alertas inmediatas para mensajes nuevos
- **Compartir Archivos**: Envío de imágenes, documentos y audio
- **Historial de Conversaciones**: Almacenamiento persistente de mensajes
- **Moderación Automática**: Filtros de contenido inapropiado

## 🏗️ Arquitectura del Sistema

### Componentes Principales

```
src/
├── controllers/
│   └── chatController.ts              # Controlador de chat
├── services/
│   ├── chatService.ts                 # Servicio de chat
│   └── notificationService.ts         # Servicio de notificaciones
├── sockets/
│   └── chatSocket.ts                  # Manejo de WebSockets
├── routes/
│   └── chatRoutes.ts                  # Rutas de chat
└── types/
    └── chatTypes.ts                   # Tipos de chat
```

## 💭 Tipos de Conversaciones

### Estructura de Conversación

```typescript
interface Conversation {
  id: string;
  participants: string[]; // IDs de usuarios
  type: ConversationType;
  eventId?: string; // Para conversaciones relacionadas con eventos
  
  // Metadatos
  lastMessage?: Message;
  unreadCount: { [userId: string]: number };
  
  // Configuración
  settings: {
    notifications: boolean;
    autoDelete: boolean;
    retentionDays: number;
  };
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  
  // Contenido
  content: string;
  type: MessageType;
  attachments?: Attachment[];
  
  // Estados
  status: MessageStatus;
  readBy: string[];
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

enum ConversationType {
  DIRECT = 'direct',           // Chat privado entre dos usuarios
  EVENT = 'event',             // Chat relacionado con un evento
  GROUP = 'group'              // Chat grupal
}

enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  AUDIO = 'audio',
  DOCUMENT = 'document',
  SYSTEM = 'system'            // Mensajes del sistema
}
```

## ⚡ Mensajería en Tiempo Real

### Servicio de Chat

```typescript
// services/chatService.ts
export class ChatService {
  async sendMessage(
    senderId: string,
    conversationId: string,
    messageData: CreateMessageDto
  ): Promise<Message> {
    try {
      // 1. Validar permisos de envío
      await this.validateMessagePermissions(senderId, conversationId);
      
      // 2. Procesar contenido (moderación, archivos)
      const processedContent = await this.processMessageContent(messageData);
      
      // 3. Crear mensaje
      const message = await this.createMessage({
        conversationId,
        senderId,
        content: processedContent.content,
        type: processedContent.type,
        attachments: processedContent.attachments
      });
      
      // 4. Emitir evento en tiempo real
      await this.emitMessageToParticipants(message);
      
      // 5. Enviar notificaciones push
      await this.sendPushNotifications(message);
      
      return message;
    } catch (error) {
      logger.error('Error sending message:', error);
      throw new Error('Error al enviar mensaje');
    }
  }
  
  async getConversation(
    userId: string,
    conversationId: string,
    options: ConversationOptions
  ): Promise<ConversationWithMessages> {
    try {
      // 1. Verificar acceso a la conversación
      await this.validateConversationAccess(userId, conversationId);
      
      // 2. Obtener conversación y mensajes
      const [conversation, messages] = await Promise.all([
        this.getConversationById(conversationId),
        this.getMessages(conversationId, options)
      ]);
      
      // 3. Marcar mensajes como leídos
      await this.markMessagesAsRead(userId, conversationId);
      
      return {
        conversation,
        messages,
        participants: await this.getParticipantsInfo(conversation.participants)
      };
    } catch (error) {
      logger.error('Error getting conversation:', error);
      throw new Error('Error al obtener conversación');
    }
  }
}
```

### WebSocket Handler

```typescript
// sockets/chatSocket.ts
export class ChatSocketHandler {
  constructor(private io: Server) {}
  
  handleConnection(socket: Socket): void {
    const userId = socket.handshake.auth.userId;
    
    // Unir al usuario a sus conversaciones
    this.joinUserConversations(socket, userId);
    
    // Manejar eventos de chat
    socket.on('send_message', (data) => this.handleSendMessage(socket, data));
    socket.on('typing', (data) => this.handleTyping(socket, data));
    socket.on('read_messages', (data) => this.handleReadMessages(socket, data));
    socket.on('disconnect', () => this.handleDisconnect(socket));
  }
  
  private async handleSendMessage(socket: Socket, data: SendMessageData): Promise<void> {
    try {
      const message = await this.chatService.sendMessage(
        socket.handshake.auth.userId,
        data.conversationId,
        data.messageData
      );
      
      // Emitir a todos los participantes
      const conversation = await this.chatService.getConversationById(data.conversationId);
      conversation.participants.forEach(participantId => {
        this.io.to(`user_${participantId}`).emit('new_message', message);
      });
    } catch (error) {
      socket.emit('message_error', { error: error.message });
    }
  }
  
  private handleTyping(socket: Socket, data: TypingData): void {
    const conversation = this.getConversationById(data.conversationId);
    conversation.participants.forEach(participantId => {
      if (participantId !== socket.handshake.auth.userId) {
        this.io.to(`user_${participantId}`).emit('user_typing', {
          conversationId: data.conversationId,
          userId: socket.handshake.auth.userId
        });
      }
    });
  }
}
```

## 🔔 Notificaciones Push

### Servicio de Notificaciones

```typescript
// services/notificationService.ts
export class PushNotificationService {
  async sendChatNotification(message: Message): Promise<void> {
    try {
      const conversation = await this.getConversationById(message.conversationId);
      const sender = await this.getUserById(message.senderId);
      
      // Obtener destinatarios
      const recipients = conversation.participants.filter(id => id !== message.senderId);
      
      for (const recipientId of recipients) {
        const user = await this.getUserById(recipientId);
        
        // Verificar preferencias de notificación
        if (user.notificationSettings.chat) {
          await this.sendPushNotification(recipientId, {
            title: sender.name,
            body: this.truncateMessage(message.content),
            data: {
              type: 'chat_message',
              conversationId: message.conversationId,
              messageId: message.id
            },
            badge: await this.getUnreadCount(recipientId)
          });
        }
      }
    } catch (error) {
      logger.error('Error sending chat notification:', error);
    }
  }
  
  private truncateMessage(content: string): string {
    return content.length > 100 ? content.substring(0, 100) + '...' : content;
  }
}
```

## 📎 Gestión de Archivos

### Subida de Archivos

```typescript
// services/chatService.ts
async uploadAttachment(
  userId: string,
  conversationId: string,
  file: Express.Multer.File
): Promise<Attachment> {
  try {
    // 1. Validar archivo
    await this.validateFile(file);
    
    // 2. Procesar y optimizar archivo
    const processedFile = await this.processFile(file);
    
    // 3. Subir a almacenamiento
    const uploadResult = await this.uploadToStorage(processedFile);
    
    // 4. Crear registro de adjunto
    const attachment = await this.createAttachment({
      conversationId,
      uploadedBy: userId,
      originalName: file.originalname,
      fileName: uploadResult.fileName,
      fileUrl: uploadResult.url,
      fileSize: file.size,
      mimeType: file.mimetype
    });
    
    return attachment;
  } catch (error) {
    logger.error('Error uploading attachment:', error);
    throw new Error('Error al subir archivo');
  }
}

private async validateFile(file: Express.Multer.File): Promise<void> {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/png', 'audio/mpeg', 'application/pdf'];
  
  if (file.size > maxSize) {
    throw new Error('Archivo demasiado grande');
  }
  
  if (!allowedTypes.includes(file.mimetype)) {
    throw new Error('Tipo de archivo no permitido');
  }
}
```

## 🛡️ Moderación

### Filtros de Contenido

```typescript
// services/moderationService.ts
export class ChatModerationService {
  async moderateMessage(content: string): Promise<ModerationResult> {
    try {
      // 1. Verificar palabras prohibidas
      const profanityCheck = await this.checkProfanity(content);
      
      // 2. Verificar spam
      const spamCheck = await this.checkSpam(content);
      
      // 3. Verificar contenido inapropiado
      const inappropriateCheck = await this.checkInappropriateContent(content);
      
      const isApproved = profanityCheck.isClean && 
                        spamCheck.isClean && 
                        inappropriateCheck.isClean;
      
      return {
        isApproved,
        flags: [
          ...profanityCheck.flags,
          ...spamCheck.flags,
          ...inappropriateCheck.flags
        ],
        moderatedContent: isApproved ? content : this.sanitizeContent(content)
      };
    } catch (error) {
      logger.error('Error moderating message:', error);
      return { isApproved: false, flags: ['moderation_error'] };
    }
  }
  
  private sanitizeContent(content: string): string {
    // Reemplazar contenido inapropiado con asteriscos
    return content.replace(/\b(spam|profanity)\b/gi, '***');
  }
}
```

---

**Anterior**: [Gestión de Eventos](../event-management/README.md)  
**Siguiente**: [Sistema de Imágenes](../image-system/README.md) 