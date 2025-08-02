import { HiringService } from '../services/hiringService';
import { db } from '../utils/firebase';

// Mock de Firebase
jest.mock('../utils/firebase', () => ({
  db: {
    collection: jest.fn()
  }
}));

describe('HiringService', () => {
  let hiringService: HiringService;
  let mockCollection: jest.Mocked<any>;

  beforeEach(() => {
    hiringService = new HiringService();
    mockCollection = db.collection as jest.Mocked<any>;
    jest.clearAllMocks();
  });

  describe('createHiringRequest', () => {
    const mockHiringData = {
      eventId: 'event123',
      eventCreatorId: 'creator123',
      musicianId: 'musician123',
      eventDetails: 'Evento de música en vivo',
      terms: 'Pago por adelantado'
    };

    const mockHiringRequest = {
      id: 'hiring123',
      eventId: 'event123',
      eventCreatorId: 'creator123',
      musicianId: 'musician123',
      status: 'pending' as const,
      eventDetails: 'Evento de música en vivo',
      terms: 'Pago por adelantado',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    it('should create a hiring request successfully', async () => {
      // Mock de las colecciones
      const mockEventDoc = {
        exists: true,
        data: () => ({ title: 'Evento Test' })
      };

      const mockMusicianDoc = {
        exists: true,
        data: () => ({ name: 'Juan', lastName: 'Pérez', roll: 'musico' })
      };

      const mockExistingRequest = {
        empty: true
      };

      const mockDocRef = {
        id: 'hiring123'
      };

      mockCollection
        .mockReturnValueOnce({
          doc: jest.fn().mockReturnValue({
            get: jest.fn().mockResolvedValue(mockEventDoc)
          })
        })
        .mockReturnValueOnce({
          doc: jest.fn().mockReturnValue({
            get: jest.fn().mockResolvedValue(mockMusicianDoc)
          })
        })
        .mockReturnValueOnce({
          where: jest.fn().mockReturnThis(),
          get: jest.fn().mockResolvedValue(mockExistingRequest)
        })
        .mockReturnValueOnce({
          add: jest.fn().mockResolvedValue(mockDocRef)
        })
        .mockReturnValueOnce({
          doc: jest.fn().mockReturnValue({
            get: jest.fn().mockResolvedValue({
              exists: true,
              id: 'hiring123',
              data: () => mockHiringRequest
            })
          })
        });

      const result = await hiringService.createHiringRequest(mockHiringData);

      expect(result).toEqual({
        ...mockHiringRequest,
        id: 'hiring123'
      });
    });

    it('should throw error when event not found', async () => {
      const mockEventDoc = {
        exists: false
      };

      mockCollection.mockReturnValueOnce({
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue(mockEventDoc)
        })
      });

      await expect(hiringService.createHiringRequest(mockHiringData))
        .rejects.toThrow('Evento no encontrado');
    });

    it('should throw error when musician not found', async () => {
      const mockEventDoc = {
        exists: true,
        data: () => ({ title: 'Evento Test' })
      };

      const mockMusicianDoc = {
        exists: false
      };

      mockCollection
        .mockReturnValueOnce({
          doc: jest.fn().mockReturnValue({
            get: jest.fn().mockResolvedValue(mockEventDoc)
          })
        })
        .mockReturnValueOnce({
          doc: jest.fn().mockReturnValue({
            get: jest.fn().mockResolvedValue(mockMusicianDoc)
          })
        });

      await expect(hiringService.createHiringRequest(mockHiringData))
        .rejects.toThrow('Músico no encontrado');
    });

    it('should throw error when active request already exists', async () => {
      const mockEventDoc = {
        exists: true,
        data: () => ({ title: 'Evento Test' })
      };

      const mockMusicianDoc = {
        exists: true,
        data: () => ({ name: 'Juan', lastName: 'Pérez', roll: 'musico' })
      };

      const mockExistingRequest = {
        empty: false
      };

      mockCollection
        .mockReturnValueOnce({
          doc: jest.fn().mockReturnValue({
            get: jest.fn().mockResolvedValue(mockEventDoc)
          })
        })
        .mockReturnValueOnce({
          doc: jest.fn().mockReturnValue({
            get: jest.fn().mockResolvedValue(mockMusicianDoc)
          })
        })
        .mockReturnValueOnce({
          where: jest.fn().mockReturnThis(),
          get: jest.fn().mockResolvedValue(mockExistingRequest)
        });

      await expect(hiringService.createHiringRequest(mockHiringData))
        .rejects.toThrow('Ya existe una solicitud activa para este evento y músico');
    });
  });

  describe('getHiringRequestById', () => {
    it('should return hiring request when found', async () => {
      const mockDoc = {
        exists: true,
        id: 'hiring123',
        data: () => ({
          eventId: 'event123',
          eventCreatorId: 'creator123',
          musicianId: 'musician123',
          status: 'pending',
          eventDetails: 'Evento de música',
          terms: 'Pago por adelantado',
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date()
        })
      };

      mockCollection.mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue(mockDoc)
        })
      });

      const result = await hiringService.getHiringRequestById('hiring123');

      expect(result).toEqual(
        expect.objectContaining({
          ...mockDoc.data(),
          id: 'hiring123'
        })
      );
    });

    it('should return null when hiring request not found', async () => {
      const mockDoc = {
        exists: false
      };

      mockCollection.mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue(mockDoc)
        })
      });

      const result = await hiringService.getHiringRequestById('hiring123');

      expect(result).toBeNull();
    });
  });

  describe('updateHiringRequestStatus', () => {
    const mockHiringRequest = {
      id: 'hiring123',
      eventId: 'event123',
      eventCreatorId: 'creator123',
      musicianId: 'musician123',
      status: 'pending' as const,
      eventDetails: 'Evento de música',
      terms: 'Pago por adelantado',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    it('should update hiring request status successfully', async () => {
      const mockDoc = {
        exists: true,
        id: 'hiring123',
        data: () => mockHiringRequest
      };

      mockCollection
        .mockReturnValueOnce({
          doc: jest.fn().mockReturnValue({
            get: jest.fn().mockResolvedValue(mockDoc)
          })
        })
        .mockReturnValueOnce({
          doc: jest.fn().mockReturnValue({
            update: jest.fn().mockResolvedValue(undefined)
          })
        })
        .mockReturnValueOnce({
          doc: jest.fn().mockReturnValue({
            get: jest.fn().mockResolvedValue({
              exists: true,
              id: 'hiring123',
              data: () => ({ ...mockHiringRequest, status: 'accepted' })
            })
          })
        });

      const result = await hiringService.updateHiringRequestStatus(
        'hiring123',
        'accepted',
        'musician123'
      );

      expect(result.status).toBe('accepted');
    });

    it('should throw error when hiring request not found', async () => {
      mockCollection.mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue({ exists: false })
        })
      });

      await expect(
        hiringService.updateHiringRequestStatus('hiring123', 'accepted', 'musician123')
      ).rejects.toThrow('Solicitud de contratación no encontrada');
    });

    it('should throw error when user has no permissions', async () => {
      const mockDoc = {
        exists: true,
        id: 'hiring123',
        data: () => mockHiringRequest
      };

      mockCollection.mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue(mockDoc)
        })
      });

      await expect(
        hiringService.updateHiringRequestStatus('hiring123', 'accepted', 'other123')
      ).rejects.toThrow('No tienes permisos para actualizar esta solicitud');
    });

    it('should throw error for invalid status transition', async () => {
      const mockDoc = {
        exists: true,
        id: 'hiring123',
        data: () => ({ ...mockHiringRequest, status: 'completed' })
      };

      mockCollection.mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue(mockDoc)
        })
      });

      await expect(
        hiringService.updateHiringRequestStatus('hiring123', 'accepted', 'musician123')
      ).rejects.toThrow('Transición de estado inválida');
    });
  });

  describe('getHiringRequestsByUser', () => {
    const mockRequests = [
      {
        id: 'hiring1',
        eventId: 'event1',
        eventCreatorId: 'creator1',
        musicianId: 'musician123',
        status: 'pending',
        eventDetails: 'Evento 1',
        terms: 'Términos 1',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'hiring2',
        eventId: 'event2',
        eventCreatorId: 'creator2',
        musicianId: 'musician123',
        status: 'accepted',
        eventDetails: 'Evento 2',
        terms: 'Términos 2',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    it('should return hiring requests for musician', async () => {
      const mockSnapshot = {
        docs: mockRequests.map(req => ({
          id: req.id,
          data: () => req
        }))
      };

      mockCollection.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue(mockSnapshot)
      });

      const result = await hiringService.getHiringRequestsByUser('musician123', 'musico');

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('hiring1');
      expect(result[1].id).toBe('hiring2');
    });

    it('should return hiring requests for event creator', async () => {
      const mockSnapshot = {
        docs: mockRequests.map(req => ({
          id: req.id,
          data: () => req
        }))
      };

      mockCollection.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue(mockSnapshot)
      });

      const result = await hiringService.getHiringRequestsByUser('creator1', 'eventCreator');

      expect(result).toHaveLength(2);
    });

    it('should filter by status when provided', async () => {
      const mockSnapshot = {
        docs: [mockRequests[0]].map(req => ({
          id: req.id,
          data: () => req
        }))
      };

      mockCollection.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue(mockSnapshot)
      });

      const result = await hiringService.getHiringRequestsByUser('musician123', 'musico', 'pending');

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('pending');
    });
  });

  describe('addMessage', () => {
    const mockHiringRequest = {
      id: 'hiring123',
      eventId: 'event123',
      eventCreatorId: 'creator123',
      musicianId: 'musician123',
      status: 'pending',
      eventDetails: 'Evento de música',
      terms: 'Pago por adelantado',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    it('should add message successfully', async () => {
      const mockDoc = {
        exists: true,
        id: 'hiring123',
        data: () => mockHiringRequest
      };

      mockCollection.mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue(mockDoc),
          update: jest.fn().mockResolvedValue(undefined)
        })
      });

      const result = await hiringService.addMessage(
        'hiring123',
        'musician123',
        'musician',
        'Hola, estoy interesado en el evento'
      );

      expect(result.senderId).toBe('musician123');
      expect(result.senderType).toBe('musician');
      expect(result.content).toBe('Hola, estoy interesado en el evento');
      expect(result.isRead).toBe(false);
    });

    it('should throw error when hiring request not found', async () => {
      mockCollection.mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue({ exists: false })
        })
      });

      await expect(
        hiringService.addMessage('hiring123', 'musician123', 'musician', 'Hola')
      ).rejects.toThrow('Solicitud de contratación no encontrada');
    });

    it('should throw error when user has no permissions', async () => {
      const mockDoc = {
        exists: true,
        id: 'hiring123',
        data: () => mockHiringRequest
      };

      mockCollection.mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue(mockDoc)
        })
      });

      await expect(
        hiringService.addMessage('hiring123', 'other123', 'musician', 'Hola')
      ).rejects.toThrow('No tienes permisos para enviar mensajes en esta solicitud');
    });
  });

  describe('markMessagesAsRead', () => {
    const mockHiringRequest = {
      id: 'hiring123',
      eventId: 'event123',
      eventCreatorId: 'creator123',
      musicianId: 'musician123',
      status: 'pending',
      eventDetails: 'Evento de música',
      terms: 'Pago por adelantado',
      messages: [
        {
          id: 'msg1',
          senderId: 'musician123',
          senderType: 'musician' as const,
          content: 'Hola',
          timestamp: new Date(),
          isRead: false
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    it('should mark messages as read successfully', async () => {
      const mockDoc = {
        exists: true,
        id: 'hiring123',
        data: () => mockHiringRequest
      };

      mockCollection.mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue(mockDoc),
          update: jest.fn().mockResolvedValue(undefined)
        })
      });

      await expect(
        hiringService.markMessagesAsRead('hiring123', 'creator123')
      ).resolves.toBeUndefined();
    });

    it('should throw error when hiring request not found', async () => {
      mockCollection.mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue({ exists: false })
        })
      });

      await expect(
        hiringService.markMessagesAsRead('hiring123', 'creator123')
      ).rejects.toThrow('Solicitud de contratación no encontrada');
    });
  });

  describe('getHiringStats', () => {
    const mockRequests = [
      {
        id: 'hiring1',
        eventId: 'event1',
        eventCreatorId: 'creator1',
        musicianId: 'musician123',
        status: 'pending',
        eventDetails: 'Evento 1',
        terms: 'Términos 1',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'hiring2',
        eventId: 'event2',
        eventCreatorId: 'creator2',
        musicianId: 'musician123',
        status: 'accepted',
        eventDetails: 'Evento 2',
        terms: 'Términos 2',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'hiring3',
        eventId: 'event3',
        eventCreatorId: 'creator3',
        musicianId: 'musician123',
        status: 'rejected',
        eventDetails: 'Evento 3',
        terms: 'Términos 3',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'hiring4',
        eventId: 'event4',
        eventCreatorId: 'creator4',
        musicianId: 'musician123',
        status: 'completed',
        eventDetails: 'Evento 4',
        terms: 'Términos 4',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'hiring5',
        eventId: 'event5',
        eventCreatorId: 'creator5',
        musicianId: 'musician123',
        status: 'cancelled',
        eventDetails: 'Evento 5',
        terms: 'Términos 5',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    it('should return correct statistics', async () => {
      const mockSnapshot = {
        docs: mockRequests.map(req => ({
          id: req.id,
          data: () => req
        }))
      };

      mockCollection.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue(mockSnapshot)
      });

      const stats = await hiringService.getHiringStats('musician123', 'musico');

      expect(stats.totalRequests).toBe(5);
      expect(stats.pendingRequests).toBe(1);
      expect(stats.acceptedRequests).toBe(1);
      expect(stats.rejectedRequests).toBe(1);
      expect(stats.completedRequests).toBe(1);
      expect(stats.averageResponseTime).toBe(0); // Sin mensajes de músicos
    });
  });
}); 