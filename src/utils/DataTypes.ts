import { PhoneIdentifier } from "firebase-admin/lib/auth/identifier";

export interface authUserRegister {
  id?: number;
  name: string;
  roll: string;
  lastName: string;
  userEmail: string;
  userPassword: string;
  create_at: string;
  update_at: string;
  delete_at: string;
  status: boolean;
}
export interface User {
  name: string;
  lastName: string;
  userEmail: string;
  userPassword: string;
  roll: string;
  create_at?: string;
  update_at?: string;
  delete_at?: string;
  status?: boolean;
}

export interface UpdateUser {
  name?: string;
  lastName?: string;
  userEmail?: string;
  userPassword?: string;
  phone: PhoneIdentifier;
  roll?: string;
  create_at?: string;
  update_at?: string;
  delete_at?: string;
  status?: boolean;
}

export interface eventData {
  organizerId: string;
  title: string;
  description: string;
  location: string;
  startTime: Date;
  endTime: Date;
  musicianPreferences: string[];
  budget: number;
}

export type EventAlert = {
  id: string; // ID único de la alerta
  eventId: string; // ID del evento relacionado
  title: string; // Título del evento
  description?: string; // Descripción opcional
  location: string; // Lugar del evento
  startDateTime: string; // Fecha/hora inicio (ISO string)
  endDateTime: string; // Fecha/hora fin (ISO string)
  organizerId: string; // UID del organizador
  musicianId: string; // UID del músico que recibe la alerta
  createdAt: string; // Fecha de creación de la alerta
  status: "pending" | "accepted" | "declined"; // Estado
  calendarEventId?: string; // ID del evento en Google Calendar (si se agregó)
};

export interface Event {
  id: string; // ID de Firestore
  user: string; // Email del organizador
  eventName: string;
  eventType: string;
  date: string;
  time: string;
  location: string;
  duration: string;
  instrument: string;
  bringInstrument: boolean;
  comment: string;
  budget: string;
  flyerUrl?: string;
  songs: string[];
  recommendations: string[];
  mapsLink: string;
  status: 'pending_musician' | 'musician_assigned' | 'completed' | 'cancelled';
  assignedMusicianId?: string;
  interestedMusicians?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface FileMetadata {
  key: string;
  url: string;
  size: number;
  mimetype: string;
  originalName: string;
}

// Nuevas interfaces para el sistema de solicitudes de músicos
export interface MusicianRequest {
  id: string;
  organizerId: string; // Email del organizador
  organizerName: string; // Nombre del organizador
  eventName: string;
  eventType: 'culto' | 'campana_dentro_templo' | 'otro';
  eventDate: string; // ISO date string
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  location: string;
  locationCoordinates?: {
    latitude: number;
    longitude: number;
  };
  instrumentType: string; // Tipo de instrumento requerido
  eventDescription: string;
  flyerUrl?: string;
  calculatedPrice: number; // Precio calculado automáticamente
  status: 'searching_musician' | 'musician_found' | 'completed' | 'expired' | 'cancelled';
  assignedMusicianId?: string;
  interestedMusicians: string[];
  searchExpiryTime: string; // 30 minutos después de creación
  createdAt: string;
  updatedAt: string;
}

export interface MusicianProfile {
  id: string;
  musicianId: string; // Email del músico
  name: string;
  lastName: string;
  instruments: string[]; // Instrumentos que toca
  experience: string;
  hourlyRate: number;
  availability: {
    days: string[]; // ['monday', 'tuesday', etc.]
    timeSlots: string[]; // ['09:00-12:00', '14:00-18:00']
  };
  rating: number;
  totalEvents: number;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MusicianRequestResponse {
  id: string;
  requestId: string;
  musicianId: string;
  musicianName: string;
  status: 'pending' | 'accepted' | 'declined';
  message?: string;
  proposedPrice?: number;
  createdAt: string;
}

// Tipos de eventos y tarifas
export const EVENT_TYPES = {
  CULTO: 'culto',
  CAMPANA_DENTRO_TEMPLO: 'campana_dentro_templo',
  OTRO: 'otro'
} as const;

export const PRICING_RULES = {
  [EVENT_TYPES.CULTO]: {
    basePrice: 800, // RD$ 800 por 2 horas
    additionalHourPrice: 650, // RD$ 650 por hora adicional
    gracePeriodMinutes: 30, // 30 minutos de gracia
    minimumChargeMinutes: 10 // 10 minutos mínimo para cobrar
  },
  [EVENT_TYPES.CAMPANA_DENTRO_TEMPLO]: {
    basePrice: 1200, // RD$ 1,200 por 2 horas
    additionalHourPrice: 850, // RD$ 850 por hora adicional
    gracePeriodMinutes: 30,
    minimumChargeMinutes: 10
  }
} as const;
