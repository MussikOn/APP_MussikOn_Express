import { Request, Response, NextFunction } from 'express';
import { db } from '../utils/firebase';

// --- Usuarios ---
export function adminUsersGetAll(req: Request, res: Response, next: NextFunction): void {
  db.collection('users').get()
    .then(snapshot => {
      let users: any[] = [];
      snapshot.forEach(doc => users.push({ _id: doc.id, ...doc.data() }));

      // Aplicar filtros
      const { status, roll, search, email } = req.query;
      if (status) { users = users.filter(user => user.status === status); }
      if (roll) { users = users.filter(user => user.roll === roll); }
      if (search) { 
        users = users.filter(user => 
          user.name?.toLowerCase().includes(search.toString().toLowerCase()) || 
          user.lastName?.toLowerCase().includes(search.toString().toLowerCase()) ||
          user.userEmail?.toLowerCase().includes(search.toString().toLowerCase())
        ); 
      }
      if (email) { users = users.filter(user => user.userEmail === email); }

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
        totalPages
      });
    })
    .catch(next);
}

export function adminUsersGetById(req: Request, res: Response, next: NextFunction): void {
  db.collection('users').doc(req.params.id).get()
    .then(doc => {
      if (!doc.exists) {
        res.status(404).json({ message: 'Usuario no encontrado' });
        return;
      }
      res.status(200).json({ _id: doc.id, ...doc.data() });
    })
    .catch(next);
}

export function adminUsersCreate(req: Request, res: Response, next: NextFunction): void {
  const data = req.body;
  db.collection('users').add(data)
    .then(ref => { res.status(201).json({ _id: ref.id, ...data }); })
    .catch(next);
}

export function adminUsersUpdate(req: Request, res: Response, next: NextFunction): void {
  const data = req.body;
  db.collection('users').doc(req.params.id).update(data)
    .then(() => { res.status(200).json({ message: 'Usuario actualizado' }); })
    .catch(next);
}

export function adminUsersRemove(req: Request, res: Response, next: NextFunction): void {
  db.collection('users').doc(req.params.id).delete()
    .then(() => { res.status(200).json({ message: 'Usuario eliminado' }); })
    .catch(next);
}

export function adminUsersStats(req: Request, res: Response, next: NextFunction): void {
  db.collection('users').get()
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
        usersByMonth: getUsersByMonth(users)
      };

      res.status(200).json({ stats });
    })
    .catch(next);
}

// --- Eventos ---
export function adminEventsGetAll(req: Request, res: Response, next: NextFunction): void {
  db.collection('events').get()
    .then(snapshot => {
      const events: any[] = [];
      snapshot.forEach(doc => events.push({ _id: doc.id, ...doc.data() }));
      res.status(200).json(events);
    })
    .catch(next);
}

export function adminEventsGetById(req: Request, res: Response, next: NextFunction): void {
  db.collection('events').doc(req.params.id).get()
    .then(doc => {
      if (!doc.exists) {
        res.status(404).json({ message: 'Evento no encontrado' });
        return;
      }
      res.status(200).json({ _id: doc.id, ...doc.data() });
    })
    .catch(next);
}

export function adminEventsCreate(req: Request, res: Response, next: NextFunction): void {
  const data = req.body;
  db.collection('events').add(data)
    .then(ref => { res.status(201).json({ _id: ref.id, ...data }); })
    .catch(next);
}

export function adminEventsUpdate(req: Request, res: Response, next: NextFunction): void {
  const data = req.body;
  db.collection('events').doc(req.params.id).update(data)
    .then(() => { res.status(200).json({ message: 'Evento actualizado' }); })
    .catch(next);
}

export function adminEventsRemove(req: Request, res: Response, next: NextFunction): void {
  db.collection('events').doc(req.params.id).delete()
    .then(() => { res.status(200).json({ message: 'Evento eliminado' }); })
    .catch(next);
}

// --- Músicos ---
export function adminMusiciansGetAll(req: Request, res: Response, next: NextFunction): void {
  res.status(200).json([]); return;
}
export function adminMusiciansGetById(req: Request, res: Response, next: NextFunction): void {
  res.status(200).json({}); return;
}
export function adminMusiciansUpdate(req: Request, res: Response, next: NextFunction): void {
  res.status(200).json({ message: 'Músico actualizado' }); return;
}
export function adminMusiciansRemove(req: Request, res: Response, next: NextFunction): void {
  res.status(200).json({ message: 'Músico eliminado' }); return;
}

// --- Imágenes ---
export function adminImagesGetAll(req: Request, res: Response, next: NextFunction): void {
  res.status(200).json([]); return;
}
export function adminImagesGetById(req: Request, res: Response, next: NextFunction): void {
  res.status(200).json({}); return;
}
export function adminImagesRemove(req: Request, res: Response, next: NextFunction): void {
  res.status(200).json({ message: 'Imagen eliminada' }); return;
}

// --- Solicitudes de Músico ---
export function adminMusicianRequestsGetAll(req: Request, res: Response, next: NextFunction): void {
  db.collection('musicianRequests').get()
    .then(snapshot => {
      let requests: any[] = [];
      snapshot.forEach(doc => requests.push({ _id: doc.id, ...doc.data() }));
      
      // Aplicar filtros
      const { status, instrument, location, search, eventId, musicianId } = req.query;
      
      if (status) {
        requests = requests.filter(req => req.status === status);
      }
      
      if (instrument) {
        requests = requests.filter(req => req.instrument === instrument);
      }
      
      if (location) {
        requests = requests.filter(req => req.location?.toLowerCase().includes(location.toString().toLowerCase()));
      }
      
      if (search) {
        requests = requests.filter(req => 
          req.eventType?.toLowerCase().includes(search.toString().toLowerCase()) ||
          req.description?.toLowerCase().includes(search.toString().toLowerCase()) ||
          req.location?.toLowerCase().includes(search.toString().toLowerCase())
        );
      }
      
      if (eventId) {
        requests = requests.filter(req => req.eventId === eventId);
      }
      
      if (musicianId) {
        requests = requests.filter(req => req.assignedMusicianId === musicianId);
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
        totalPages
      });
    })
    .catch(next);
}

export function adminMusicianRequestsCreate(req: Request, res: Response, next: NextFunction): void {
  const data = req.body;
  db.collection('musicianRequests').add(data)
    .then(ref => { res.status(201).json({ _id: ref.id, ...data }); })
    .catch(next);
}

export function adminMusicianRequestsGetById(req: Request, res: Response, next: NextFunction): void {
  db.collection('musicianRequests').doc(req.params.id).get()
    .then(doc => {
      if (!doc.exists) {
        res.status(404).json({ message: 'Solicitud no encontrada' });
        return;
      }
      res.status(200).json({ _id: doc.id, ...doc.data() });
    })
    .catch(next);
}

export function adminMusicianRequestsUpdate(req: Request, res: Response, next: NextFunction): void {
  const data = req.body;
  db.collection('musicianRequests').doc(req.params.id).update(data)
    .then(() => { res.status(200).json({ message: 'Solicitud actualizada' }); })
    .catch(next);
}

export function adminMusicianRequestsRemove(req: Request, res: Response, next: NextFunction): void {
  db.collection('musicianRequests').doc(req.params.id).delete()
    .then(() => { res.status(200).json({ message: 'Solicitud eliminada' }); })
    .catch(next);
}

// Endpoint para estadísticas de solicitudes
export function adminMusicianRequestsStats(req: Request, res: Response, next: NextFunction): void {
  db.collection('musicianRequests').get()
    .then(snapshot => {
      const requests: any[] = [];
      snapshot.forEach(doc => requests.push({ _id: doc.id, ...doc.data() }));
      
      const stats = {
        totalRequests: requests.length,
        pendingRequests: requests.filter(req => req.status === 'pendiente').length,
        assignedRequests: requests.filter(req => req.status === 'asignada').length,
        completedRequests: requests.filter(req => req.status === 'completada').length,
        cancelledRequests: requests.filter(req => req.status === 'cancelada').length,
        unassignedRequests: requests.filter(req => req.status === 'no_asignada').length,
        averageResponseTime: 0, // TODO: Implementar cálculo de tiempo de respuesta
        topInstruments: getTopInstruments(requests),
        topLocations: getTopLocations(requests),
        requestsByMonth: getRequestsByMonth(requests)
      };
      
      res.status(200).json({ stats });
    })
    .catch(next);
}

// Función auxiliar para obtener instrumentos más populares
function getTopInstruments(requests: any[]): Array<{ instrument: string; count: number }> {
  const instrumentCounts: { [key: string]: number } = {};
  
  requests.forEach(req => {
    if (req.instrument) {
      instrumentCounts[req.instrument] = (instrumentCounts[req.instrument] || 0) + 1;
    }
  });
  
  return Object.entries(instrumentCounts)
    .map(([instrument, count]) => ({ instrument, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

// Función auxiliar para obtener ubicaciones más populares
function getTopLocations(requests: any[]): Array<{ location: string; count: number }> {
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
function getRequestsByMonth(requests: any[]): Array<{ month: string; count: number }> {
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
function getTopUserLocations(users: any[]): Array<{ location: string; count: number }> {
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
function getUsersByMonth(users: any[]): Array<{ month: string; count: number }> {
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