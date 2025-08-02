import { db } from '../utils/firebase';
import { logger } from '../services/loggerService';

// Interfaces para el sistema de contratación
export interface HiringRequest {
  id: string;
  eventId: string;
  eventCreatorId: string;
  musicianId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed';
  eventDetails?: string;
  terms?: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  senderId: string;
  senderType: 'musician' | 'eventCreator';
  content: string;
  timestamp: Date;
  isRead: boolean;
}

export interface HiringRequestCreate {
  eventId: string;
  eventCreatorId: string;
  musicianId: string;
  eventDetails?: string;
  terms?: string;
}

export interface HiringRequestUpdate {
  status?: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed';
  eventDetails?: string;
  terms?: string;
}

export interface HiringStats {
  totalRequests: number;
  pendingRequests: number;
  acceptedRequests: number;
  rejectedRequests: number;
  completedRequests: number;
  averageResponseTime: number;
}

export class HiringService {
  private collection = 'hiring_requests';

  /**
   * Crear una nueva solicitud de contratación
   */
  async createHiringRequest(data: HiringRequestCreate): Promise<HiringRequest> {
    try {
      logger.info('HiringService: Creando nueva solicitud de contratación', {
        metadata: {
          eventId: data.eventId,
          musicianId: data.musicianId
        }
      });

      // Verificar que el evento existe
      const eventDoc = await db.collection('events').doc(data.eventId).get();
      if (!eventDoc.exists) {
        throw new Error('Evento no encontrado');
      }

      // Verificar que el músico existe
      const musicianDoc = await db.collection('users').doc(data.musicianId).get();
      if (!musicianDoc.exists) {
        throw new Error('Músico no encontrado');
      }

      // Verificar que no existe una solicitud activa para este evento y músico
      const existingRequest = await db.collection(this.collection)
        .where('eventId', '==', data.eventId)
        .where('musicianId', '==', data.musicianId)
        .where('status', 'in', ['pending', 'accepted'])
        .get();

      if (!existingRequest.empty) {
        throw new Error('Ya existe una solicitud activa para este evento y músico');
      }

      const hiringRequest: Omit<HiringRequest, 'id'> = {
        eventId: data.eventId,
        eventCreatorId: data.eventCreatorId,
        musicianId: data.musicianId,
        status: 'pending',
        eventDetails: data.eventDetails || '',
        terms: data.terms || '',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await db.collection(this.collection).add(hiringRequest);
      const result = await this.getHiringRequestById(docRef.id);

      if (!result) {
        throw new Error('Error al crear la solicitud de contratación');
      }

      return result;
    } catch (error) {
      logger.error('HiringService: Error al crear solicitud de contratación', error instanceof Error ? error : new Error('Error desconocido'), {
        metadata: {
          eventId: data.eventId,
          musicianId: data.musicianId
        }
      });
      throw error;
    }
  }

  /**
   * Obtener una solicitud de contratación por ID
   */
  async getHiringRequestById(requestId: string): Promise<HiringRequest | null> {
    try {
      logger.info('HiringService: Obteniendo solicitud de contratación', {
        metadata: { requestId }
      });

      const doc = await db.collection(this.collection).doc(requestId).get();

      if (!doc.exists) {
        return null;
      }

      return {
        id: doc.id,
        ...doc.data()
      } as HiringRequest;
    } catch (error) {
      logger.error('HiringService: Error al obtener solicitud de contratación', error instanceof Error ? error : new Error('Error desconocido'), {
        metadata: {
          requestId
        }
      });
      throw error;
    }
  }

  /**
   * Actualizar el estado de una solicitud de contratación
   */
  async updateHiringRequestStatus(
    requestId: string,
    status: HiringRequest['status'],
    userId: string
  ): Promise<HiringRequest> {
    try {
      logger.info('HiringService: Actualizando estado de solicitud', {
        metadata: {
          requestId,
          status,
          userId
        }
      });

      const request = await this.getHiringRequestById(requestId);
      if (!request) {
        throw new Error('Solicitud de contratación no encontrada');
      }

      // Verificar permisos
      if (request.musicianId !== userId && request.eventCreatorId !== userId) {
        throw new Error('No tienes permisos para actualizar esta solicitud');
      }

      // Verificar transiciones válidas
      const validTransitions = this.getValidStatusTransitions(request.status, userId === request.musicianId);
      if (!validTransitions.includes(status)) {
        throw new Error(`Transición de estado inválida: ${request.status} -> ${status}`);
      }

      const updateData: Partial<HiringRequest> = {
        status,
        updatedAt: new Date()
      };

      await db.collection(this.collection).doc(requestId).update(updateData);

      const updatedRequest = await this.getHiringRequestById(requestId);
      if (!updatedRequest) {
        throw new Error('Error al obtener la solicitud actualizada');
      }

      logger.info('HiringService: Estado de solicitud actualizado exitosamente', {
        metadata: {
          requestId,
          newStatus: status
        }
      });

      return updatedRequest;
    } catch (error) {
      logger.error('HiringService: Error al actualizar estado de solicitud', error instanceof Error ? error : new Error('Error desconocido'), {
        metadata: {
          requestId,
          status
        }
      });
      throw error;
    }
  }

  /**
   * Obtener solicitudes de contratación por usuario
   */
  async getHiringRequestsByUser(
    userId: string,
    userRole: 'musico' | 'eventCreator',
    status?: HiringRequest['status']
  ): Promise<HiringRequest[]> {
    try {
      logger.info('HiringService: Obteniendo solicitudes por usuario', {
        metadata: {
          userId,
          userRole,
          status
        }
      });

      let query = db.collection(this.collection);

      if (userRole === 'musico') {
        query = query.where('musicianId', '==', userId) as any;
      } else {
        query = query.where('eventCreatorId', '==', userId) as any;
      }

      if (status) {
        query = query.where('status', '==', status) as any;
      }

      query = query.orderBy('createdAt', 'desc') as any;

      const snapshot = await query.get();
      
      return snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      })) as HiringRequest[];
    } catch (error) {
      logger.error('HiringService: Error al obtener solicitudes por usuario', error instanceof Error ? error : new Error('Error desconocido'), {
        metadata: {
          userId,
          userRole
        }
      });
      throw error;
    }
  }

  /**
   * Agregar mensaje a una solicitud de contratación
   */
  async addMessage(
    requestId: string,
    senderId: string,
    senderType: 'musician' | 'eventCreator',
    content: string
  ): Promise<Message> {
    try {
      logger.info('HiringService: Agregando mensaje a solicitud', {
        metadata: {
          requestId,
          senderId,
          senderType
        }
      });

      const request = await this.getHiringRequestById(requestId);
      if (!request) {
        throw new Error('Solicitud de contratación no encontrada');
      }

      // Verificar que el remitente tiene acceso a esta solicitud
      if (senderType === 'musician' && request.musicianId !== senderId) {
        throw new Error('No tienes permisos para enviar mensajes en esta solicitud');
      }
      if (senderType === 'eventCreator' && request.eventCreatorId !== senderId) {
        throw new Error('No tienes permisos para enviar mensajes en esta solicitud');
      }

      const message: Message = {
        id: Date.now().toString(),
        senderId,
        senderType,
        content,
        timestamp: new Date(),
        isRead: false
      };

      const updatedMessages = [...request.messages, message];

      await db.collection(this.collection).doc(requestId).update({
        messages: updatedMessages,
        updatedAt: new Date()
      });

      logger.info('HiringService: Mensaje agregado exitosamente', {
        metadata: {
          requestId,
          messageId: message.id
        }
      });

      return message;
    } catch (error) {
      logger.error('HiringService: Error al agregar mensaje', error instanceof Error ? error : new Error('Error desconocido'), {
        metadata: {
          requestId,
          senderId
        }
      });
      throw error;
    }
  }

  /**
   * Marcar mensajes como leídos
   */
  async markMessagesAsRead(requestId: string, userId: string): Promise<void> {
    try {
      logger.info('HiringService: Marcando mensajes como leídos', {
        metadata: {
          requestId,
          userId
        }
      });

      const request = await this.getHiringRequestById(requestId);
      if (!request) {
        throw new Error('Solicitud de contratación no encontrada');
      }

      // Verificar que el usuario tiene acceso a esta solicitud
      if (request.musicianId !== userId && request.eventCreatorId !== userId) {
        throw new Error('No tienes permisos para acceder a esta solicitud');
      }

      const updatedMessages = request.messages.map(message => ({
        ...message,
        isRead: true
      }));

      await db.collection(this.collection).doc(requestId).update({
        messages: updatedMessages,
        updatedAt: new Date()
      });

      logger.info('HiringService: Mensajes marcados como leídos exitosamente', {
        metadata: {
          requestId,
          userId
        }
      });
    } catch (error) {
      logger.error('HiringService: Error al marcar mensajes como leídos', error instanceof Error ? error : new Error('Error desconocido'), {
        metadata: {
          requestId,
          userId
        }
      });
      throw error;
    }
  }

  /**
   * Obtener estadísticas de contratación
   */
  async getHiringStats(userId: string, userRole: 'musico' | 'eventCreator'): Promise<HiringStats> {
    try {
      logger.info('HiringService: Obteniendo estadísticas de contratación', {
        metadata: {
          userId,
          userRole
        }
      });

      const requests = await this.getHiringRequestsByUser(userId, userRole);

      const stats: HiringStats = {
        totalRequests: requests.length,
        pendingRequests: requests.filter(r => r.status === 'pending').length,
        acceptedRequests: requests.filter(r => r.status === 'accepted').length,
        rejectedRequests: requests.filter(r => r.status === 'rejected').length,
        completedRequests: requests.filter(r => r.status === 'completed').length,
        averageResponseTime: this.calculateAverageResponseTime(requests)
      };

      logger.info('HiringService: Estadísticas calculadas exitosamente', {
        metadata: {
          userId,
          userRole,
          stats
        }
      });

      return stats;
    } catch (error) {
      logger.error('HiringService: Error al obtener estadísticas', error instanceof Error ? error : new Error('Error desconocido'), {
        metadata: {
          userId,
          userRole
        }
      });
      throw error;
    }
  }

  /**
   * Obtener transiciones de estado válidas
   */
  private getValidStatusTransitions(
    currentStatus: HiringRequest['status'],
    isMusician: boolean
  ): HiringRequest['status'][] {
    const transitions: Record<HiringRequest['status'], HiringRequest['status'][]> = {
      pending: isMusician ? ['accepted', 'rejected'] : ['cancelled'],
      accepted: ['completed', 'cancelled'],
      rejected: [],
      cancelled: [],
      completed: []
    };

    return transitions[currentStatus] || [];
  }

  /**
   * Calcular tiempo promedio de respuesta
   */
  private calculateAverageResponseTime(requests: HiringRequest[]): number {
    const responseTimes = requests
      .filter(r => r.status === 'accepted' || r.status === 'rejected')
      .map(r => {
        const firstMessage = r.messages.find(m => m.senderType === 'musician');
        if (firstMessage) {
          return firstMessage.timestamp.getTime() - r.createdAt.getTime();
        }
        return 0;
      })
      .filter(time => time > 0);

    if (responseTimes.length === 0) {
      return 0;
    }

    return responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
  }
} 