import { Request, Response, NextFunction } from 'express';
import { db } from '../utils/firebase';
import { asyncHandler } from '../middleware/errorHandler';
import { OperationalError } from '../middleware/errorHandler';
import { logger } from '../services/loggerService';

// --- Usuarios ---
export function adminUsersGetAll(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  db.collection('users')
    .get()
    .then(snapshot => {
      let users: any[] = [];
      snapshot.forEach(doc => users.push({ _id: doc.id, ...doc.data() }));

      // Aplicar filtros
      const { status, roll, search, email } = req.query;
      if (status) {
        users = users.filter(user => user.status === status);
      }
      if (roll) {
        users = users.filter(user => user.roll === roll);
      }
      if (search) {
        users = users.filter(
          user =>
            user.name
              ?.toLowerCase()
              .includes(search.toString().toLowerCase()) ||
            user.lastName
              ?.toLowerCase()
              .includes(search.toString().toLowerCase()) ||
            user.userEmail
              ?.toLowerCase()
              .includes(search.toString().toLowerCase())
        );
      }
      if (email) {
        users = users.filter(user => user.userEmail === email);
      }

      // Obtener parámetros de paginación
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const total = users.length;
      const totalPages = Math.ceil(total / limit);

      // Aplicar paginación
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedUsers = users.slice(startIndex, endIndex);

      res.status(200).json({
        users: paginatedUsers,
        total,
        page,
        limit,
        totalPages,
      });
    })
    .catch(next);
}

export function adminUsersGetById(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  db.collection('users')
    .doc(req.params.id)
    .get()
    .then(doc => {
      if (!doc.exists) {
        res.status(404).json({ message: 'Usuario no encontrado' });
        return;
      }
      res.status(200).json({ _id: doc.id, ...doc.data() });
    })
    .catch(next);
}

export function adminUsersCreate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const data = req.body;
  db.collection('users')
    .add(data)
    .then(ref => {
      res.status(201).json({ _id: ref.id, ...data });
    })
    .catch(next);
}

export function adminUsersUpdate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const data = req.body;
  db.collection('users')
    .doc(req.params.id)
    .update(data)
    .then(() => {
      res.status(200).json({ message: 'Usuario actualizado' });
    })
    .catch(next);
}

export function adminUsersRemove(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  db.collection('users')
    .doc(req.params.id)
    .delete()
    .then(() => {
      res.status(200).json({ message: 'Usuario eliminado' });
    })
    .catch(next);
}

export function adminUsersStats(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  db.collection('users')
    .get()
    .then(snapshot => {
      const users: any[] = [];
      snapshot.forEach(doc => users.push({ _id: doc.id, ...doc.data() }));

      const stats = {
        totalUsers: users.length,
        activeUsers: users.filter(user => user.status === 'active').length,
        blockedUsers: users.filter(user => user.status === 'blocked').length,
        pendingUsers: users.filter(user => user.status === 'pending').length,
        inactiveUsers: users.filter(user => user.status === 'inactive').length,
        organizers: users.filter(user => user.roll === 'organizer').length,
        musicians: users.filter(user => user.roll === 'musician').length,
        averageRating: 0, // TODO: Implement calculation
        topLocations: getTopUserLocations(users),
        usersByMonth: getUsersByMonth(users),
      };

      res.status(200).json({ stats });
    })
    .catch(next);
}

// --- Eventos ---
export function adminEventsGetAll(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  db.collection('events')
    .get()
    .then(snapshot => {
      const events: any[] = [];
      snapshot.forEach(doc => events.push({ _id: doc.id, ...doc.data() }));
      res.status(200).json(events);
    })
    .catch(next);
}

export function adminEventsGetById(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  db.collection('events')
    .doc(req.params.id)
    .get()
    .then(doc => {
      if (!doc.exists) {
        res.status(404).json({ message: 'Evento no encontrado' });
        return;
      }
      res.status(200).json({ _id: doc.id, ...doc.data() });
    })
    .catch(next);
}

export function adminEventsCreate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const data = req.body;
  db.collection('events')
    .add(data)
    .then(ref => {
      res.status(201).json({ _id: ref.id, ...data });
    })
    .catch(next);
}

export function adminEventsUpdate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const data = req.body;
  db.collection('events')
    .doc(req.params.id)
    .update(data)
    .then(() => {
      res.status(200).json({ message: 'Evento actualizado' });
    })
    .catch(next);
}

export function adminEventsRemove(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  db.collection('events')
    .doc(req.params.id)
    .delete()
    .then(() => {
      res.status(200).json({ message: 'Evento eliminado' });
    })
    .catch(next);
}

// --- Músicos ---
export function adminMusiciansGetAll(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  res.status(200).json([]);
  return;
}
export function adminMusiciansGetById(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  res.status(200).json({});
  return;
}
export function adminMusiciansUpdate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  res.status(200).json({ message: 'Músico actualizado' });
  return;
}
export function adminMusiciansRemove(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  res.status(200).json({ message: 'Músico eliminado' });
  return;
}

// --- Imágenes ---
export function adminImagesGetAll(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  res.status(200).json([]);
  return;
}
export function adminImagesGetById(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  res.status(200).json({});
  return;
}
export function adminImagesRemove(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  res.status(200).json({ message: 'Imagen eliminada' });
  return;
}

// --- Solicitudes de Músico ---
export function adminMusicianRequestsGetAll(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  db.collection('musicianRequests')
    .get()
    .then(snapshot => {
      let requests: any[] = [];
      snapshot.forEach(doc => requests.push({ _id: doc.id, ...doc.data() }));

      // Aplicar filtros
      const { status, instrument, location, search, eventId, musicianId } =
        req.query;

      if (status) {
        requests = requests.filter(req => req.status === status);
      }

      if (instrument) {
        requests = requests.filter(req => req.instrument === instrument);
      }

      if (location) {
        requests = requests.filter(req =>
          req.location
            ?.toLowerCase()
            .includes(location.toString().toLowerCase())
        );
      }

      if (search) {
        requests = requests.filter(
          req =>
            req.eventType
              ?.toLowerCase()
              .includes(search.toString().toLowerCase()) ||
            req.description
              ?.toLowerCase()
              .includes(search.toString().toLowerCase()) ||
            req.location
              ?.toLowerCase()
              .includes(search.toString().toLowerCase())
        );
      }

      if (eventId) {
        requests = requests.filter(req => req.eventId === eventId);
      }

      if (musicianId) {
        requests = requests.filter(
          req => req.assignedMusicianId === musicianId
        );
      }

      // Obtener parámetros de paginación
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const total = requests.length;
      const totalPages = Math.ceil(total / limit);

      // Aplicar paginación
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedRequests = requests.slice(startIndex, endIndex);

      res.status(200).json({
        requests: paginatedRequests,
        total,
        page,
        limit,
        totalPages,
      });
    })
    .catch(next);
}

export function adminMusicianRequestsCreate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const data = req.body;
  db.collection('musicianRequests')
    .add(data)
    .then(ref => {
      res.status(201).json({ _id: ref.id, ...data });
    })
    .catch(next);
}

export function adminMusicianRequestsGetById(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  db.collection('musicianRequests')
    .doc(req.params.id)
    .get()
    .then(doc => {
      if (!doc.exists) {
        res.status(404).json({ message: 'Solicitud no encontrada' });
        return;
      }
      res.status(200).json({ _id: doc.id, ...doc.data() });
    })
    .catch(next);
}

export function adminMusicianRequestsUpdate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const data = req.body;
  db.collection('musicianRequests')
    .doc(req.params.id)
    .update(data)
    .then(() => {
      res.status(200).json({ message: 'Solicitud actualizada' });
    })
    .catch(next);
}

export function adminMusicianRequestsRemove(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  db.collection('musicianRequests')
    .doc(req.params.id)
    .delete()
    .then(() => {
      res.status(200).json({ message: 'Solicitud eliminada' });
    })
    .catch(next);
}

// Endpoint para estadísticas de solicitudes
export function adminMusicianRequestsStats(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  db.collection('musicianRequests')
    .get()
    .then(snapshot => {
      const requests: any[] = [];
      snapshot.forEach(doc => requests.push({ _id: doc.id, ...doc.data() }));

      const stats = {
        totalRequests: requests.length,
        pendingRequests: requests.filter(req => req.status === 'pendiente')
          .length,
        assignedRequests: requests.filter(req => req.status === 'asignada')
          .length,
        completedRequests: requests.filter(req => req.status === 'completada')
          .length,
        cancelledRequests: requests.filter(req => req.status === 'cancelada')
          .length,
        unassignedRequests: requests.filter(req => req.status === 'no_asignada')
          .length,
        averageResponseTime: 0, // TODO: Implementar cálculo de tiempo de respuesta
        topInstruments: getTopInstruments(requests),
        topLocations: getTopLocations(requests),
        requestsByMonth: getRequestsByMonth(requests),
      };

      res.status(200).json({ stats });
    })
    .catch(next);
}

// Función auxiliar para obtener instrumentos más populares
function getTopInstruments(
  requests: any[]
): Array<{ instrument: string; count: number }> {
  const instrumentCounts: { [key: string]: number } = {};

  requests.forEach(req => {
    if (req.instrument) {
      instrumentCounts[req.instrument] =
        (instrumentCounts[req.instrument] || 0) + 1;
    }
  });

  return Object.entries(instrumentCounts)
    .map(([instrument, count]) => ({ instrument, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

// Función auxiliar para obtener ubicaciones más populares
function getTopLocations(
  requests: any[]
): Array<{ location: string; count: number }> {
  const locationCounts: { [key: string]: number } = {};

  requests.forEach(req => {
    if (req.location) {
      locationCounts[req.location] = (locationCounts[req.location] || 0) + 1;
    }
  });

  return Object.entries(locationCounts)
    .map(([location, count]) => ({ location, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

// Función auxiliar para obtener solicitudes por mes
function getRequestsByMonth(
  requests: any[]
): Array<{ month: string; count: number }> {
  const monthCounts: { [key: string]: number } = {};

  requests.forEach(req => {
    if (req.createdAt) {
      const date = new Date(req.createdAt);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthCounts[month] = (monthCounts[month] || 0) + 1;
    }
  });

  return Object.entries(monthCounts)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

// Función auxiliar para obtener ubicaciones más populares de usuarios
function getTopUserLocations(
  users: any[]
): Array<{ location: string; count: number }> {
  const locationCounts: { [key: string]: number } = {};

  users.forEach(user => {
    if (user.location) {
      locationCounts[user.location] = (locationCounts[user.location] || 0) + 1;
    }
  });

  return Object.entries(locationCounts)
    .map(([location, count]) => ({ location, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

// Función auxiliar para obtener usuarios por mes
function getUsersByMonth(
  users: any[]
): Array<{ month: string; count: number }> {
  const monthCounts: { [key: string]: number } = {};

  users.forEach(user => {
    if (user.createdAt) {
      const date = new Date(user.createdAt);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthCounts[month] = (monthCounts[month] || 0) + 1;
    }
  });

  return Object.entries(monthCounts)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

// ===== NUEVOS CONTROLADORES PARA ADMIN SYSTEM =====

/**
 * Búsqueda global en toda la plataforma
 */
export const adminGlobalSearch = asyncHandler(
  async (req: Request, res: Response) => {
    const { query, types, page = 1, limit = 20 } = req.query;
    const { userId } = req.user!;

    logger.info('Búsqueda global iniciada', {
      userId,
      metadata: { query, types },
    });

    if (!query || typeof query !== 'string') {
      throw new OperationalError('Query de búsqueda requerida', 400);
    }

    const searchTypes = types
      ? (types as string).split(',')
      : ['users', 'events', 'requests'];
    const results: any = {};

    // Búsqueda en usuarios
    if (searchTypes.includes('users')) {
      const users = await db
        .collection('users')
        .where('name', '>=', query)
        .where('name', '<=', query + '\uf8ff')
        .limit(parseInt(limit as string))
        .get();

      results.users = users.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    // Búsqueda en eventos
    if (searchTypes.includes('events')) {
      const events = await db
        .collection('events')
        .where('name', '>=', query)
        .where('name', '<=', query + '\uf8ff')
        .limit(parseInt(limit as string))
        .get();

      results.events = events.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    // Búsqueda en solicitudes
    if (searchTypes.includes('requests')) {
      const requests = await db
        .collection('musicianRequests')
        .where('description', '>=', query)
        .where('description', '<=', query + '\uf8ff')
        .limit(parseInt(limit as string))
        .get();

      results.requests = requests.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    }

    logger.info('Búsqueda global completada', {
      userId,
      metadata: { resultsCount: Object.keys(results).length },
    });

    res.status(200).json({
      success: true,
      data: results,
      message: 'Búsqueda global completada',
    });
  }
);

/**
 * Analytics del dashboard
 */
export const adminDashboardAnalytics = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.user!;

    logger.info('Obteniendo analytics del dashboard', { userId });

    // Estadísticas de usuarios
    const usersSnapshot = await db.collection('users').get();
    const totalUsers = usersSnapshot.size;
    const activeUsers = usersSnapshot.docs.filter(
      doc => doc.data().status === true
    ).length;

    // Estadísticas de eventos
    const eventsSnapshot = await db.collection('events').get();
    const totalEvents = eventsSnapshot.size;
    const activeEvents = eventsSnapshot.docs.filter(
      doc => doc.data().status === 'active'
    ).length;

    // Estadísticas de solicitudes
    const requestsSnapshot = await db.collection('musicianRequests').get();
    const totalRequests = requestsSnapshot.size;
    const pendingRequests = requestsSnapshot.docs.filter(
      doc => doc.data().status === 'pending'
    ).length;

    // Estadísticas de imágenes
    const imagesSnapshot = await db.collection('images').get();
    const totalImages = imagesSnapshot.size;

    // Cálculo de crecimiento (últimos 30 días)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentUsers = usersSnapshot.docs.filter(doc => {
      const createdAt =
        doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt);
      return createdAt >= thirtyDaysAgo;
    }).length;

    const recentEvents = eventsSnapshot.docs.filter(doc => {
      const createdAt =
        doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt);
      return createdAt >= thirtyDaysAgo;
    }).length;

    const analytics = {
      users: {
        total: totalUsers,
        active: activeUsers,
        recent: recentUsers,
        growth:
          recentUsers > 0 ? ((recentUsers / totalUsers) * 100).toFixed(1) : '0',
      },
      events: {
        total: totalEvents,
        active: activeEvents,
        recent: recentEvents,
        growth:
          recentEvents > 0
            ? ((recentEvents / totalEvents) * 100).toFixed(1)
            : '0',
      },
      requests: {
        total: totalRequests,
        pending: pendingRequests,
        completionRate:
          totalRequests > 0
            ? (
                ((totalRequests - pendingRequests) / totalRequests) *
                100
              ).toFixed(1)
            : '0',
      },
      images: {
        total: totalImages,
      },
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString(),
      },
    };

    logger.info('Analytics del dashboard obtenidos', {
      userId,
      metadata: { analytics },
    });

    res.status(200).json({
      success: true,
      data: analytics,
      message: 'Analytics del dashboard obtenidos',
    });
  }
);

/**
 * Analytics de usuarios
 */
export const adminUserAnalytics = asyncHandler(
  async (req: Request, res: Response) => {
    const { period = 'week', groupBy = 'role' } = req.query;
    const { userId } = req.user!;

    logger.info('Obteniendo analytics de usuarios', {
      userId,
      metadata: { period, groupBy },
    });

    const usersSnapshot = await db.collection('users').get();
    const users = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    let analytics: any = {};

    if (groupBy === 'role') {
      const roleStats = users.reduce((acc: any, user: any) => {
        const role = user.roll || 'user';
        acc[role] = (acc[role] || 0) + 1;
        return acc;
      }, {});

      analytics = {
        byRole: roleStats,
        total: users.length,
        active: users.filter((u: any) => u.status === true).length,
        inactive: users.filter((u: any) => u.status === false).length,
      };
    } else if (groupBy === 'status') {
      analytics = {
        active: users.filter((u: any) => u.status === true).length,
        inactive: users.filter((u: any) => u.status === false).length,
        total: users.length,
      };
    }

    // Datos por período
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const recentUsers = users.filter((user: any) => {
      const createdAt = user.createdAt?.toDate?.() || new Date(user.createdAt);
      return createdAt >= startDate;
    });

    analytics.recent = recentUsers.length;
    analytics.period = period;

    logger.info('Analytics de usuarios obtenidos', {
      userId,
      metadata: { analytics },
    });

    res.status(200).json({
      success: true,
      data: analytics,
      message: 'Analytics de usuarios obtenidos',
    });
  }
);

/**
 * Analytics de eventos
 */
export const adminEventAnalytics = asyncHandler(
  async (req: Request, res: Response) => {
    const { period = 'month', groupBy = 'status' } = req.query;
    const { userId } = req.user!;

    logger.info('Obteniendo analytics de eventos', {
      userId,
      metadata: { period, groupBy },
    });

    const eventsSnapshot = await db.collection('events').get();
    const events = eventsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    let analytics: any = {};

    if (groupBy === 'status') {
      const statusStats = events.reduce((acc: any, event: any) => {
        const status = event.status || 'draft';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      analytics = {
        byStatus: statusStats,
        total: events.length,
        active: events.filter((e: any) => e.status === 'active').length,
        completed: events.filter((e: any) => e.status === 'completed').length,
        cancelled: events.filter((e: any) => e.status === 'cancelled').length,
      };
    } else if (groupBy === 'category') {
      const categoryStats = events.reduce((acc: any, event: any) => {
        const category = event.category || 'other';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {});

      analytics = {
        byCategory: categoryStats,
        total: events.length,
      };
    }

    // Datos por período
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'quarter':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const recentEvents = events.filter((event: any) => {
      const createdAt =
        event.createdAt?.toDate?.() || new Date(event.createdAt);
      return createdAt >= startDate;
    });

    analytics.recent = recentEvents.length;
    analytics.period = period;

    logger.info('Analytics de eventos obtenidos', {
      userId,
      metadata: { analytics },
    });

    res.status(200).json({
      success: true,
      data: analytics,
      message: 'Analytics de eventos obtenidos',
    });
  }
);

/**
 * Analytics de solicitudes
 */
export const adminRequestAnalytics = asyncHandler(
  async (req: Request, res: Response) => {
    const { period = 'quarter', groupBy = 'instrument' } = req.query;
    const { userId } = req.user!;

    logger.info('Obteniendo analytics de solicitudes', {
      userId,
      metadata: { period, groupBy },
    });

    const requestsSnapshot = await db.collection('musicianRequests').get();
    const requests = requestsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    let analytics: any = {};

    if (groupBy === 'instrument') {
      const instrumentStats = requests.reduce((acc: any, request: any) => {
        const instrument = request.instrument || 'other';
        acc[instrument] = (acc[instrument] || 0) + 1;
        return acc;
      }, {});

      analytics = {
        byInstrument: instrumentStats,
        total: requests.length,
        pending: requests.filter((r: any) => r.status === 'pending').length,
        assigned: requests.filter((r: any) => r.status === 'assigned').length,
        completed: requests.filter((r: any) => r.status === 'completed').length,
        cancelled: requests.filter((r: any) => r.status === 'cancelled').length,
      };
    } else if (groupBy === 'status') {
      analytics = {
        pending: requests.filter((r: any) => r.status === 'pending').length,
        assigned: requests.filter((r: any) => r.status === 'assigned').length,
        completed: requests.filter((r: any) => r.status === 'completed').length,
        cancelled: requests.filter((r: any) => r.status === 'cancelled').length,
        total: requests.length,
      };
    }

    // Datos por período
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'quarter':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    }

    const recentRequests = requests.filter((request: any) => {
      const createdAt =
        request.createdAt?.toDate?.() || new Date(request.createdAt);
      return createdAt >= startDate;
    });

    analytics.recent = recentRequests.length;
    analytics.period = period;

    // Tasa de completitud
    const completedRequests = requests.filter(
      (r: any) => r.status === 'completed'
    ).length;
    analytics.completionRate =
      requests.length > 0
        ? ((completedRequests / requests.length) * 100).toFixed(1)
        : '0';

    logger.info('Analytics de solicitudes obtenidos', {
      userId,
      metadata: { analytics },
    });

    res.status(200).json({
      success: true,
      data: analytics,
      message: 'Analytics de solicitudes obtenidos',
    });
  }
);

/**
 * Exportar reportes
 */
export const adminExportReport = asyncHandler(
  async (req: Request, res: Response) => {
    const { type, filters, format = 'csv' } = req.query;
    const { userId } = req.user!;

    logger.info('Exportando reporte', { userId, metadata: { type, format } });

    let data: any[] = [];

    switch (type) {
      case 'users':
        const usersSnapshot = await db.collection('users').get();
        data = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        break;
      case 'events':
        const eventsSnapshot = await db.collection('events').get();
        data = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        break;
      case 'requests':
        const requestsSnapshot = await db.collection('musicianRequests').get();
        data = requestsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        break;
      default:
        throw new OperationalError('Tipo de reporte no válido', 400);
    }

    // Aplicar filtros si se proporcionan
    if (filters) {
      const filterObj = JSON.parse(filters as string);
      data = data.filter(item => {
        return Object.keys(filterObj).every(key => {
          return item[key] === filterObj[key];
        });
      });
    }

    let reportContent: string;

    if (format === 'csv') {
      // Convertir a CSV
      const headers = Object.keys(data[0] || {});
      const csvRows = [headers.join(',')];

      data.forEach(item => {
        const values = headers.map(header => {
          const value = item[header];
          return typeof value === 'string' ? `"${value}"` : value;
        });
        csvRows.push(values.join(','));
      });

      reportContent = csvRows.join('\n');
    } else {
      // JSON por defecto
      reportContent = JSON.stringify(data, null, 2);
    }

    logger.info('Reporte exportado exitosamente', {
      userId,
      metadata: { dataCount: data.length },
    });

    res.setHeader(
      'Content-Type',
      format === 'csv' ? 'text/csv' : 'application/json'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${type}_report.${format}"`
    );
    res.status(200).send(reportContent);
  }
);
