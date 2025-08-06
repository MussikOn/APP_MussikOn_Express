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

describe('AdminController', () => {
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

  describe('GET /admin/dashboard', () => {
    it('should return admin dashboard data', async () => {
      const response = await request(app)
        .get('/admin/dashboard')
        .set('Authorization', 'Bearer valid-admin-token')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });

    it('should require admin authentication', async () => {
      const response = await request(app)
        .get('/admin/dashboard')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /admin/users', () => {
    it('should return users list', async () => {
      const mockUsers = [
        {
          id: '1',
          data: () => ({
            userEmail: 'user1@example.com',
            name: 'User 1',
            roll: 'user',
          }),
        },
        {
          id: '2',
          data: () => ({
            userEmail: 'user2@example.com',
            name: 'User 2',
            roll: 'musician',
          }),
        },
      ];

      mockQuery.get.mockResolvedValue({
        size: 2,
        docs: mockUsers,
      });

      const response = await request(app)
        .get('/admin/users')
        .set('Authorization', 'Bearer valid-admin-token')
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
        .get('/admin/users?page=2&limit=10')
        .set('Authorization', 'Bearer valid-admin-token')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('PUT /admin/users/:userId/role', () => {
    it('should update user role successfully', async () => {
      const mockUser = {
        userEmail: 'user@example.com',
        roll: 'user',
      };

      mockDoc.get.mockResolvedValue({
        exists: true,
        data: () => mockUser,
      });

      const response = await request(app)
        .put('/admin/users/user@example.com/role')
        .set('Authorization', 'Bearer valid-admin-token')
        .send({ role: 'musician' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(mockDoc.update).toHaveBeenCalledWith({ roll: 'musician' });
    });

    it('should return 404 when user not found', async () => {
      mockDoc.get.mockResolvedValue({
        exists: false,
      });

      const response = await request(app)
        .put('/admin/users/non-existent@example.com/role')
        .set('Authorization', 'Bearer valid-admin-token')
        .send({ role: 'musician' })
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should validate role', async () => {
      const response = await request(app)
        .put('/admin/users/user@example.com/role')
        .set('Authorization', 'Bearer valid-admin-token')
        .send({ role: 'invalid_role' })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('DELETE /admin/users/:userId', () => {
    it('should delete user successfully', async () => {
      mockDoc.get.mockResolvedValue({
        exists: true,
        data: () => ({
          userEmail: 'user@example.com',
        }),
      });

      const response = await request(app)
        .delete('/admin/users/user@example.com')
        .set('Authorization', 'Bearer valid-admin-token')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(mockDoc.delete).toHaveBeenCalled();
    });

    it('should return 404 when user not found', async () => {
      mockDoc.get.mockResolvedValue({
        exists: false,
      });

      const response = await request(app)
        .delete('/admin/users/non-existent@example.com')
        .set('Authorization', 'Bearer valid-admin-token')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /admin/events', () => {
    it('should return events list', async () => {
      const mockEvents = [
        {
          id: '1',
          data: () => ({
            eventName: 'Event 1',
            status: 'pending_musician',
            user: 'user1@example.com',
          }),
        },
        {
          id: '2',
          data: () => ({
            eventName: 'Event 2',
            status: 'completed',
            user: 'user2@example.com',
          }),
        },
      ];

      mockQuery.get.mockResolvedValue({
        size: 2,
        docs: mockEvents,
      });

      const response = await request(app)
        .get('/admin/events')
        .set('Authorization', 'Bearer valid-admin-token')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveLength(2);
    });

    it('should filter by status', async () => {
      const response = await request(app)
        .get('/admin/events?status=pending_musician')
        .set('Authorization', 'Bearer valid-admin-token')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('GET /admin/statistics', () => {
    it('should return admin statistics', async () => {
      const mockStats = {
        totalUsers: 100,
        totalEvents: 50,
        totalMusicians: 20,
        totalRevenue: 5000,
      };

      mockQuery.get.mockResolvedValue({
        size: 0,
        docs: [],
      });

      const response = await request(app)
        .get('/admin/statistics')
        .set('Authorization', 'Bearer valid-admin-token')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });
  });

  describe('Error handling', () => {
    it('should handle database errors gracefully', async () => {
      mockQuery.get.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/admin/users')
        .set('Authorization', 'Bearer valid-admin-token')
        .expect(500);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
    });

    it('should handle authentication errors', async () => {
      const response = await request(app)
        .get('/admin/users')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should handle authorization errors', async () => {
      const response = await request(app)
        .get('/admin/users')
        .set('Authorization', 'Bearer valid-user-token')
        .expect(403);

      expect(response.body).toHaveProperty('success', false);
    });
  });
}); 