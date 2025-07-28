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

// Chat Types
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  type: 'text' | 'image' | 'audio' | 'file';
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
  isActive: boolean;
  createdAt: string;
}

export interface ChatFilters {
  search?: string;
  unreadOnly?: boolean;
  dateFrom?: string;
  dateTo?: string;
}
