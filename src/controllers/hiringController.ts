import { Request, Response } from 'express';
import { HiringService, HiringRequestCreate } from '../services/hiringService';
import { logger } from '../services/loggerService';

export class HiringController {
  private hiringService: HiringService;

  constructor() {
    this.hiringService = new HiringService();
  }

  /**
   * Crear una nueva solicitud de contratación
   */
  createHiringRequest = async (req: Request, res: Response): Promise<void> => {
    try {
      logger.info('HiringController: Creando solicitud de contratación', {
        userId: req.user?.id,
        metadata: {
          context: 'hiring'
        }
      });

      const { eventId, musicianId, eventDetails, terms } = req.body;
      const eventCreatorId = req.user?.id;

      if (!eventCreatorId) {
        res.status(401).json({ 
          success: false, 
          message: 'Usuario no autenticado' 
        });
        return;
      }

      const hiringData: HiringRequestCreate = {
        eventId,
        eventCreatorId,
        musicianId,
        eventDetails,
        terms
      };

      const hiringRequest = await this.hiringService.createHiringRequest(hiringData);

      logger.info('HiringController: Solicitud de contratación creada exitosamente', {
        userId: req.user?.id,
        metadata: {
          requestId: hiringRequest.id,
          eventId,
          musicianId
        }
      });

      res.status(201).json({
        success: true,
        message: 'Solicitud de contratación creada exitosamente',
        data: hiringRequest
      });
    } catch (error) {
      logger.error('HiringController: Error al crear solicitud de contratación', error instanceof Error ? error : new Error('Error desconocido'), {
        userId: req.user?.id,
        metadata: {
          context: 'hiring'
        }
      });

      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error al crear solicitud de contratación'
      });
    }
  };

  /**
   * Obtener una solicitud de contratación por ID
   */
  getHiringRequestById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { requestId } = req.params;
      const userId = req.user?.id;

      logger.info('HiringController: Obteniendo solicitud de contratación', {
        userId,
        metadata: {
          requestId
        }
      });

      if (!userId) {
        res.status(401).json({ 
          success: false, 
          message: 'Usuario no autenticado' 
        });
        return;
      }

      const hiringRequest = await this.hiringService.getHiringRequestById(requestId);

      if (!hiringRequest) {
        res.status(404).json({
          success: false,
          message: 'Solicitud de contratación no encontrada'
        });
        return;
      }

      // Verificar que el usuario tiene acceso a esta solicitud
      if (hiringRequest.musicianId !== userId && hiringRequest.eventCreatorId !== userId) {
        res.status(403).json({
          success: false,
          message: 'No tienes permisos para ver esta solicitud'
        });
        return;
      }

      logger.info('HiringController: Solicitud de contratación obtenida exitosamente', {
        userId,
        metadata: {
          requestId
        }
      });

      res.status(200).json({
        success: true,
        data: hiringRequest
      });
    } catch (error) {
      logger.error('HiringController: Error al obtener solicitud de contratación', error instanceof Error ? error : new Error('Error desconocido'), {
        userId: req.user?.id,
        metadata: {
          requestId: req.params.requestId
        }
      });

      res.status(500).json({
        success: false,
        message: 'Error al obtener solicitud de contratación'
      });
    }
  };

  /**
   * Actualizar el estado de una solicitud de contratación
   */
  updateHiringRequestStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { requestId } = req.params;
      const { status } = req.body;
      const userId = req.user?.id;

      logger.info('HiringController: Actualizando estado de solicitud', {
        userId,
        metadata: {
          requestId,
          status
        }
      });

      if (!userId) {
        res.status(401).json({ 
          success: false, 
          message: 'Usuario no autenticado' 
        });
        return;
      }

      if (!status) {
        res.status(400).json({
          success: false,
          message: 'El estado es requerido'
        });
        return;
      }

      const updatedRequest = await this.hiringService.updateHiringRequestStatus(
        requestId,
        status,
        userId
      );

      logger.info('HiringController: Estado de solicitud actualizado exitosamente', {
        userId,
        metadata: {
          requestId,
          newStatus: status
        }
      });

      res.status(200).json({
        success: true,
        message: 'Estado de solicitud actualizado exitosamente',
        data: updatedRequest
      });
    } catch (error) {
      logger.error('HiringController: Error al actualizar estado de solicitud', error instanceof Error ? error : new Error('Error desconocido'), {
        userId: req.user?.id,
        metadata: {
          requestId: req.params.requestId,
          status: req.body.status
        }
      });

      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error al actualizar estado de solicitud'
      });
    }
  };

  /**
   * Obtener solicitudes de contratación del usuario
   */
  getHiringRequestsByUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.roll;
      const { status } = req.query;

      logger.info('HiringController: Obteniendo solicitudes por usuario', {
        userId,
        metadata: {
          userRole,
          status
        }
      });

      if (!userId) {
        res.status(401).json({ 
          success: false, 
          message: 'Usuario no autenticado' 
        });
        return;
      }

      if (userRole !== 'musico' && userRole !== 'eventCreator') {
        res.status(400).json({
          success: false,
          message: 'Rol de usuario inválido'
        });
        return;
      }

      const requests = await this.hiringService.getHiringRequestsByUser(
        userId,
        userRole,
        status as any
      );

      logger.info('HiringController: Solicitudes obtenidas exitosamente', {
        userId,
        metadata: {
          userRole,
          count: requests.length
        }
      });

      res.status(200).json({
        success: true,
        data: requests,
        count: requests.length
      });
    } catch (error) {
      logger.error('HiringController: Error al obtener solicitudes por usuario', error instanceof Error ? error : new Error('Error desconocido'), {
        userId: req.user?.id,
        metadata: {
          context: 'hiring'
        }
      });

      res.status(500).json({
        success: false,
        message: 'Error al obtener solicitudes de contratación'
      });
    }
  };

  /**
   * Agregar mensaje a una solicitud de contratación
   */
  addMessage = async (req: Request, res: Response): Promise<void> => {
    try {
      const { requestId } = req.params;
      const { content } = req.body;
      const userId = req.user?.id;
      const userRole = req.user?.roll;

      logger.info('HiringController: Agregando mensaje a solicitud', {
        userId,
        metadata: {
          requestId,
          userRole
        }
      });

      if (!userId) {
        res.status(401).json({ 
          success: false, 
          message: 'Usuario no autenticado' 
        });
        return;
      }

      if (!content || content.trim().length === 0) {
        res.status(400).json({
          success: false,
          message: 'El contenido del mensaje es requerido'
        });
        return;
      }

      if (userRole !== 'musico' && userRole !== 'eventCreator') {
        res.status(400).json({
          success: false,
          message: 'Rol de usuario inválido'
        });
        return;
      }

      const senderType = userRole === 'musico' ? 'musician' : 'eventCreator';
      const message = await this.hiringService.addMessage(
        requestId,
        userId,
        senderType,
        content.trim()
      );

      logger.info('HiringController: Mensaje agregado exitosamente', {
        userId,
        metadata: {
          requestId,
          messageId: message.id
        }
      });

      res.status(201).json({
        success: true,
        message: 'Mensaje enviado exitosamente',
        data: message
      });
    } catch (error) {
      logger.error('HiringController: Error al agregar mensaje', error instanceof Error ? error : new Error('Error desconocido'), {
        userId: req.user?.id,
        metadata: {
          requestId: req.params.requestId
        }
      });

      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error al enviar mensaje'
      });
    }
  };

  /**
   * Marcar mensajes como leídos
   */
  markMessagesAsRead = async (req: Request, res: Response): Promise<void> => {
    try {
      const { requestId } = req.params;
      const userId = req.user?.id;

      logger.info('HiringController: Marcando mensajes como leídos', {
        userId,
        metadata: {
          requestId
        }
      });

      if (!userId) {
        res.status(401).json({ 
          success: false, 
          message: 'Usuario no autenticado' 
        });
        return;
      }

      await this.hiringService.markMessagesAsRead(requestId, userId);

      logger.info('HiringController: Mensajes marcados como leídos exitosamente', {
        userId,
        metadata: {
          requestId
        }
      });

      res.status(200).json({
        success: true,
        message: 'Mensajes marcados como leídos exitosamente'
      });
    } catch (error) {
      logger.error('HiringController: Error al marcar mensajes como leídos', error instanceof Error ? error : new Error('Error desconocido'), {
        userId: req.user?.id,
        metadata: {
          requestId: req.params.requestId
        }
      });

      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error al marcar mensajes como leídos'
      });
    }
  };

  /**
   * Obtener estadísticas de contratación
   */
  getHiringStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.roll;

      logger.info('HiringController: Obteniendo estadísticas de contratación', {
        userId,
        metadata: {
          userRole
        }
      });

      if (!userId) {
        res.status(401).json({ 
          success: false, 
          message: 'Usuario no autenticado' 
        });
        return;
      }

      if (userRole !== 'musico' && userRole !== 'eventCreator') {
        res.status(400).json({
          success: false,
          message: 'Rol de usuario inválido'
        });
        return;
      }

      const stats = await this.hiringService.getHiringStats(userId, userRole);

      logger.info('HiringController: Estadísticas obtenidas exitosamente', {
        userId,
        metadata: {
          userRole,
          stats
        }
      });

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('HiringController: Error al obtener estadísticas', error instanceof Error ? error : new Error('Error desconocido'), {
        userId: req.user?.id,
        metadata: {
          context: 'hiring'
        }
      });

      res.status(500).json({
        success: false,
        message: 'Error al obtener estadísticas de contratación'
      });
    }
  };
} 