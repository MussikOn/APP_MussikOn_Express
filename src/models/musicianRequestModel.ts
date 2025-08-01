// Modelo de datos para Firestore (solo tipado, no esquema)
export interface MusicianRequest {
  id?: string; // Firestore autogenerado
  userId: string;
  eventType: string;
  date: string;
  time: string;
  location: string;
  instrument: string;
  budget: number;
  comments?: string;
  status: 'pendiente' | 'asignada' | 'no_asignada' | 'cancelada' | 'completada';
  assignedMusicianId?: string;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}
