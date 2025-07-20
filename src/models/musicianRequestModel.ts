import { db } from "../utils/firebase";
import { MusicianRequest, MusicianRequestResponse, MusicianProfile, EVENT_TYPES, PRICING_RULES } from "../utils/DataTypes";
import * as admin from "firebase-admin";

// Función para calcular el precio basado en la duración y tipo de evento
export const calculateEventPrice = (startTime: string, endTime: string, eventType: keyof typeof EVENT_TYPES): number => {
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  let startMinutes = startHour * 60 + startMinute;
  let endMinutes = endHour * 60 + endMinute;
  
  // Si el evento pasa de medianoche
  if (endMinutes < startMinutes) {
    endMinutes += 24 * 60;
  }
  
  const totalMinutes = endMinutes - startMinutes;
  const totalHours = totalMinutes / 60;
  
  const rules = PRICING_RULES[eventType as keyof typeof PRICING_RULES];
  const baseHours = 2;
  const basePrice = rules.basePrice;
  
  if (totalHours <= baseHours) {
    return basePrice;
  }
  
  const additionalHours = totalHours - baseHours;
  const additionalMinutes = (additionalHours - Math.floor(additionalHours)) * 60;
  
  let additionalPrice = 0;
  
  if (additionalMinutes > rules.gracePeriodMinutes) {
    // Cobrar hora completa
    additionalPrice = Math.ceil(additionalHours) * rules.additionalHourPrice;
  } else if (additionalMinutes > rules.minimumChargeMinutes) {
    // Cobrar media hora
    additionalPrice = Math.floor(additionalHours) * rules.additionalHourPrice + 
                     (rules.additionalHourPrice / 2);
  } else {
    // Solo cobrar las horas completas
    additionalPrice = Math.floor(additionalHours) * rules.additionalHourPrice;
  }
  
  return basePrice + additionalPrice;
};

// Crear nueva solicitud de músico
export const createMusicianRequestModel = async (requestData: Omit<MusicianRequest, 'id' | 'status' | 'assignedMusicianId' | 'interestedMusicians' | 'createdAt' | 'updatedAt' | 'searchExpiryTime' | 'calculatedPrice'>) => {
  const now = new Date();
  const expiryTime = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutos
  
  const calculatedPrice = calculateEventPrice(
    requestData.startTime, 
    requestData.endTime, 
    requestData.eventType as keyof typeof EVENT_TYPES
  );
  
  const requestRef = db.collection("musicianRequests").doc();
  const request: MusicianRequest = {
    ...requestData,
    id: requestRef.id,
    status: 'searching_musician',
    assignedMusicianId: undefined,
    interestedMusicians: [],
    calculatedPrice,
    searchExpiryTime: expiryTime.toISOString(),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
  
  await requestRef.set(request);
  
  // Programar expiración automática
  setTimeout(async () => {
    await expireMusicianRequest(requestRef.id);
  }, 30 * 60 * 1000);
  
  return request;
};

// Obtener solicitudes disponibles para músicos
export const getAvailableMusicianRequests = async (instrumentType?: string) => {
  let query = db.collection("musicianRequests")
    .where("status", "==", "searching_musician")
    .where("searchExpiryTime", ">", new Date().toISOString());
  
  if (instrumentType) {
    query = query.where("instrumentType", "==", instrumentType);
  }
  
  const snapshot = await query.get();
  return snapshot.docs.map(doc => doc.data() as MusicianRequest);
};

// Músico responde a una solicitud
export const respondToMusicianRequest = async (requestId: string, musicianId: string, musicianName: string, message?: string, proposedPrice?: number) => {
  const responseRef = db.collection("musicianRequestResponses").doc();
  const response: MusicianRequestResponse = {
    id: responseRef.id,
    requestId,
    musicianId,
    musicianName,
    status: 'pending',
    message,
    proposedPrice,
    createdAt: new Date().toISOString(),
  };
  
  await responseRef.set(response);
  
  // Agregar músico a la lista de interesados
  const requestRef = db.collection("musicianRequests").doc(requestId);
  await requestRef.update({
    interestedMusicians: admin.firestore.FieldValue.arrayUnion(musicianId),
    updatedAt: new Date().toISOString(),
  });
  
  return response;
};

// Organizador acepta músico
export const acceptMusicianResponse = async (requestId: string, musicianId: string) => {
  const requestRef = db.collection("musicianRequests").doc(requestId);
  const responseRef = db.collection("musicianRequestResponses")
    .where("requestId", "==", requestId)
    .where("musicianId", "==", musicianId);
  
  const requestSnap = await requestRef.get();
  const responseSnap = await responseRef.get();
  
  if (!requestSnap.exists || responseSnap.empty) return null;
  
  const request = requestSnap.data() as MusicianRequest;
  const response = responseSnap.docs[0].data() as MusicianRequestResponse;
  
  if (request.status !== 'searching_musician') return null;
  
  // Actualizar solicitud
  await requestRef.update({
    status: 'musician_found',
    assignedMusicianId: musicianId,
    updatedAt: new Date().toISOString(),
  });
  
  // Actualizar respuesta
  await responseSnap.docs[0].ref.update({
    status: 'accepted',
  });
  
  return { request, response };
};

// Expirar solicitud automáticamente
export const expireMusicianRequest = async (requestId: string) => {
  const requestRef = db.collection("musicianRequests").doc(requestId);
  const requestSnap = await requestRef.get();
  
  if (!requestSnap.exists) return;
  
  const request = requestSnap.data() as MusicianRequest;
  if (request.status === 'searching_musician') {
    await requestRef.update({
      status: 'expired',
      updatedAt: new Date().toISOString(),
    });
  }
};

// Obtener solicitudes de un organizador
export const getOrganizerRequests = async (organizerId: string) => {
  const snapshot = await db.collection("musicianRequests")
    .where("organizerId", "==", organizerId)
    .orderBy("createdAt", "desc")
    .get();
  
  return snapshot.docs.map(doc => doc.data() as MusicianRequest);
};

// Cancelar solicitud
export const cancelMusicianRequest = async (requestId: string, organizerId: string) => {
  const requestRef = db.collection("musicianRequests").doc(requestId);
  const requestSnap = await requestRef.get();
  
  if (!requestSnap.exists) return null;
  
  const request = requestSnap.data() as MusicianRequest;
  if (request.organizerId !== organizerId) return null;
  
  await requestRef.update({
    status: 'cancelled',
    updatedAt: new Date().toISOString(),
  });
  
  return { ...request, status: 'cancelled' };
};

// Renviar solicitud expirada
export const resendExpiredRequest = async (requestId: string, organizerId: string) => {
  const requestRef = db.collection("musicianRequests").doc(requestId);
  const requestSnap = await requestRef.get();
  
  if (!requestSnap.exists) return null;
  
  const request = requestSnap.data() as MusicianRequest;
  if (request.organizerId !== organizerId || request.status !== 'expired') return null;
  
  const now = new Date();
  const expiryTime = new Date(now.getTime() + 30 * 60 * 1000);
  
  await requestRef.update({
    status: 'searching_musician',
    searchExpiryTime: expiryTime.toISOString(),
    interestedMusicians: [],
    assignedMusicianId: undefined,
    updatedAt: now.toISOString(),
  });
  
  // Programar nueva expiración
  setTimeout(async () => {
    await expireMusicianRequest(requestId);
  }, 30 * 60 * 1000);
  
  return { ...request, status: 'searching_musician' };
}; 