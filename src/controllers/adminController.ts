import { Request, Response, NextFunction } from 'express';
import { db } from '../utils/firebase';

// --- Usuarios ---
export function adminUsersGetAll(req: Request, res: Response, next: NextFunction): void {
  db.collection('users').get()
    .then(snapshot => {
      const users: any[] = [];
      snapshot.forEach(doc => users.push({ _id: doc.id, ...doc.data() }));
      res.status(200).json(users);
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
  res.status(200).json([]); return;
}
export function adminMusicianRequestsGetById(req: Request, res: Response, next: NextFunction): void {
  res.status(200).json({}); return;
}
export function adminMusicianRequestsRemove(req: Request, res: Response, next: NextFunction): void {
  res.status(200).json({ message: 'Solicitud eliminada' }); return;
} 