import request from 'supertest';
import { app } from '../../index';
import { db } from '../utils/firebase';
import { logger } from '../services/loggerService';

// Mock Firebase
jest.mock('../utils/firebase', () => ({
  db: {
    collection: jest.fn(),
  },
}));

// Mock logger
jest.mock('../services/loggerService', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

describe('PushNotificationController', () => {
  let mockCollection: jest.Mocked<any>;
  let mockDoc: jest.Mocked<any>;
  let mockQuery: jest.Mocked<any>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockDoc = {
      id: 'test-id',
      data: jest.fn(),
      set: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      get: jest.fn(),
    };

    mockQuery = {
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      get: jest.fn(),
      doc: jest.fn().mockReturnValue(mockDoc),
    };

    mockCollection = {
      doc: jest.fn().mockReturnValue(mockDoc),
      add: jest.fn(),
      where: jest.fn().mockReturnValue(mockQuery),
      orderBy: jest.fn().mockReturnValue(mockQuery),
      limit: jest.fn().mockReturnValue(mockQuery),
      get: jest.fn(),
    };

    (db.collection as jest.Mock).mockReturnValue(mockCollection);
  });

  describe('POST /notifications/send', () => {
    it('should send notification successfully', async () => {
      const notificationData = {
        title: 'Test Notification',
        body: 'This is a test notification',
        userId: 'user123',
        data: {
          type: 'event_reminder',
          eventId: 'event123',
        },
      };

      const response = await request(app)
        .post('/notifications/send')
        .set('Authorization', 'Bearer valid-token')
        .send(notificationData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });

    it('should send bulk notification successfully', async () => {
      const bulkNotificationData = {
        title: 'Bulk Notification',
        body: 'This is a bulk notification',
        userIds: ['user1', 'user2', 'user3'],
        data: {
          type: 'system_update',
        },
      };

      const response = await request(app)
        .post('/notifications/send-bulk')
        .set('Authorization', 'Bearer valid-token')
        .send(bulkNotificationData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/notifications/send')
        .set('Authorization', 'Bearer valid-token')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should validate title length', async () => {
      const response = await request(app)
        .post('/notifications/send')
        .set('Authorization', 'Bearer valid-token')
        .send({
          title: 'a'.repeat(1000), // Too long
          body: 'Test body',
          userId: 'user123',
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /notifications/history', () => {
    it('should return notification history for user', async () => {
      const mockNotifications = [
        {
          id: '1',
          data: () => ({
            title: 'Notification 1',
            body: 'Body 1',
            sentAt: new Date(),
            read: false,
          }),
        },
        {
          id: '2',
          data: () => ({
            title: 'Notification 2',
            body: 'Body 2',
            sentAt: new Date(),
            read: true,
          }),
        },
      ];

      mockQuery.get.mockResolvedValue({
        size: 2,
        docs: mockNotifications,
      });

      const response = await request(app)
        .get('/notifications/history')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveLength(2);
    });

    it('should handle pagination', async () => {
      mockQuery.get.mockResolvedValue({
        size: 10,
        docs: [],
      });

      const response = await request(app)
        .get('/notifications/history?page=2&limit=10')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should filter by read status', async () => {
      const response = await request(app)
        .get('/notifications/history?read=false')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('PUT /notifications/:notificationId/read', () => {
    it('should mark notification as read', async () => {
      mockDoc.get.mockResolvedValue({
        exists: true,
        data: () => ({
          title: 'Test Notification',
          read: false,
        }),
      });

      const response = await request(app)
        .put('/notifications/test-notification-id/read')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(mockDoc.update).toHaveBeenCalledWith({ read: true, readAt: expect.any(Date) });
    });

    it('should return 404 when notification not found', async () => {
      mockDoc.get.mockResolvedValue({
        exists: false,
      });

      const response = await request(app)
        .put('/notifications/non-existent-id/read')
        .set('Authorization', 'Bearer valid-token')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('PUT /notifications/read-all', () => {
    it('should mark all notifications as read', async () => {
      const mockNotifications = [
        { id: '1', data: () => ({ read: false }) },
        { id: '2', data: () => ({ read: false }) },
      ];

      mockQuery.get.mockResolvedValue({
        size: 2,
        docs: mockNotifications,
      });

      const response = await request(app)
        .put('/notifications/read-all')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('updatedCount', 2);
    });
  });

  describe('DELETE /notifications/:notificationId', () => {
    it('should delete notification successfully', async () => {
      mockDoc.get.mockResolvedValue({
        exists: true,
        data: () => ({
          title: 'Test Notification',
        }),
      });

      const response = await request(app)
        .delete('/notifications/test-notification-id')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(mockDoc.delete).toHaveBeenCalled();
    });

    it('should return 404 when notification not found', async () => {
      mockDoc.get.mockResolvedValue({
        exists: false,
      });

      const response = await request(app)
        .delete('/notifications/non-existent-id')
        .set('Authorization', 'Bearer valid-token')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /notifications/unread-count', () => {
    it('should return unread notification count', async () => {
      const mockNotifications = [
        { id: '1', data: () => ({ read: false }) },
        { id: '2', data: () => ({ read: false }) },
        { id: '3', data: () => ({ read: true }) },
      ];

      mockQuery.get.mockResolvedValue({
        size: 3,
        docs: mockNotifications,
      });

      const response = await request(app)
        .get('/notifications/unread-count')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('count', 2);
    });
  });

  describe('POST /notifications/token', () => {
    it('should save device token successfully', async () => {
      const tokenData = {
        token: 'device_token_123',
        platform: 'ios',
        deviceId: 'device_123',
      };

      const response = await request(app)
        .post('/notifications/token')
        .set('Authorization', 'Bearer valid-token')
        .send(tokenData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should validate token format', async () => {
      const response = await request(app)
        .post('/notifications/token')
        .set('Authorization', 'Bearer valid-token')
        .send({
          token: '',
          platform: 'ios',
          deviceId: 'device_123',
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should validate platform', async () => {
      const response = await request(app)
        .post('/notifications/token')
        .set('Authorization', 'Bearer valid-token')
        .send({
          token: 'device_token_123',
          platform: 'invalid_platform',
          deviceId: 'device_123',
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('DELETE /notifications/token/:token', () => {
    it('should delete device token successfully', async () => {
      const response = await request(app)
        .delete('/notifications/token/device_token_123')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('GET /notifications/settings', () => {
    it('should return notification settings', async () => {
      const mockSettings = {
        pushEnabled: true,
        emailEnabled: false,
        eventReminders: true,
        systemUpdates: true,
        marketing: false,
      };

      mockDoc.get.mockResolvedValue({
        exists: true,
        data: () => mockSettings,
      });

      const response = await request(app)
        .get('/notifications/settings')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('pushEnabled', true);
    });

    it('should return default settings when not found', async () => {
      mockDoc.get.mockResolvedValue({
        exists: false,
      });

      const response = await request(app)
        .get('/notifications/settings')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('pushEnabled');
    });
  });

  describe('PUT /notifications/settings', () => {
    it('should update notification settings', async () => {
      const settingsData = {
        pushEnabled: false,
        emailEnabled: true,
        eventReminders: false,
        systemUpdates: true,
        marketing: false,
      };

      const response = await request(app)
        .put('/notifications/settings')
        .set('Authorization', 'Bearer valid-token')
        .send(settingsData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should validate settings data', async () => {
      const response = await request(app)
        .put('/notifications/settings')
        .set('Authorization', 'Bearer valid-token')
        .send({
          pushEnabled: 'invalid_value',
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /notifications/schedule', () => {
    it('should schedule notification successfully', async () => {
      const scheduleData = {
        title: 'Scheduled Notification',
        body: 'This is a scheduled notification',
        userId: 'user123',
        scheduledAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
        data: {
          type: 'scheduled_reminder',
        },
      };

      const response = await request(app)
        .post('/notifications/schedule')
        .set('Authorization', 'Bearer valid-token')
        .send(scheduleData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });

    it('should validate scheduled time is in future', async () => {
      const response = await request(app)
        .post('/notifications/schedule')
        .set('Authorization', 'Bearer valid-token')
        .send({
          title: 'Scheduled Notification',
          body: 'This is a scheduled notification',
          userId: 'user123',
          scheduledAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /notifications/scheduled', () => {
    it('should return scheduled notifications', async () => {
      const mockScheduled = [
        {
          id: '1',
          data: () => ({
            title: 'Scheduled 1',
            scheduledAt: new Date(Date.now() + 3600000),
          }),
        },
      ];

      mockQuery.get.mockResolvedValue({
        size: 1,
        docs: mockScheduled,
      });

      const response = await request(app)
        .get('/notifications/scheduled')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });
  });

  describe('DELETE /notifications/scheduled/:notificationId', () => {
    it('should cancel scheduled notification', async () => {
      mockDoc.get.mockResolvedValue({
        exists: true,
        data: () => ({
          title: 'Scheduled Notification',
          scheduledAt: new Date(Date.now() + 3600000),
        }),
      });

      const response = await request(app)
        .delete('/notifications/scheduled/test-notification-id')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('Error handling', () => {
    it('should handle database errors gracefully', async () => {
      mockQuery.get.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/notifications/history')
        .set('Authorization', 'Bearer valid-token')
        .expect(500);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
    });

    it('should handle notification service errors', async () => {
      const response = await request(app)
        .post('/notifications/send')
        .set('Authorization', 'Bearer valid-token')
        .send({
          title: 'Test',
          body: 'Test',
          userId: 'invalid_user',
        })
        .expect(500);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should handle authentication errors', async () => {
      const response = await request(app)
        .get('/notifications/history')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('Validation', () => {
    it('should validate notification title length', async () => {
      const response = await request(app)
        .post('/notifications/send')
        .set('Authorization', 'Bearer valid-token')
        .send({
          title: 'a'.repeat(1000), // Too long
          body: 'Test body',
          userId: 'user123',
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should validate notification body length', async () => {
      const response = await request(app)
        .post('/notifications/send')
        .set('Authorization', 'Bearer valid-token')
        .send({
          title: 'Test title',
          body: 'a'.repeat(5000), // Too long
          userId: 'user123',
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should validate user ID format', async () => {
      const response = await request(app)
        .post('/notifications/send')
        .set('Authorization', 'Bearer valid-token')
        .send({
          title: 'Test title',
          body: 'Test body',
          userId: '', // Empty
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });
}); 