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

export interface FileMetadata {
  key: string;
  url: string;
  size: number;
  mimetype: string;
  originalName: string;
}
