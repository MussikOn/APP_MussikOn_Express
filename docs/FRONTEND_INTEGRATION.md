# 📱 Integración Frontend - MusikOn API

## 📋 Tabla de Contenidos

- [Configuración Base](#configuración-base)
- [Autenticación](#autenticación)
- [Gestión de Eventos](#gestión-de-eventos)
- [Solicitudes Directas](#solicitudes-directas)
- [Notificaciones en Tiempo Real](#notificaciones-en-tiempo-real)
- [Gestión de Imágenes](#gestión-de-imágenes)
- [Manejo de Errores](#manejo-de-errores)
- [Ejemplos de Código](#ejemplos-de-código)
- [Mejores Prácticas](#mejores-prácticas)

---

## 🔧 Configuración Base

### Configuración de la API

```javascript
// config/api.js
const API_BASE_URL = 'http://localhost:1000';

export const apiConfig = {
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
};

// Interceptor para agregar token automáticamente
export const setupApiInterceptors = (axios) => {
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Token expirado o inválido
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
};
```

### Configuración de Socket.IO

```javascript
// config/socket.js
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:1000';

export class SocketManager {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect(token) {
    this.socket = io(SOCKET_URL, {
      auth: {
        token
      }
    });

    this.socket.on('connect', () => {
      console.log('Conectado al servidor');
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('Desconectado del servidor');
      this.isConnected = false;
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  getSocket() {
    return this.socket;
  }
}

export const socketManager = new SocketManager();
```

---

## 🔐 Autenticación

### Servicio de Autenticación

```javascript
// services/authService.js
import axios from 'axios';
import { apiConfig } from '../config/api';

class AuthService {
  constructor() {
    this.api = axios.create(apiConfig);
  }

  async register(userData) {
    try {
      const response = await this.api.post('/auth/Register', userData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async login(credentials) {
    try {
      const response = await this.api.post('/auth/login', credentials);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async verifyToken() {
    try {
      const response = await this.api.get('/auth/verToken');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateUser(userEmail, userData) {
    try {
      const response = await this.api.put(`/auth/update/${userEmail}`, userData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async sendVerificationEmail(email) {
    try {
      const response = await this.api.post('/auth/authEmail', { userEmail: email });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async verifyEmail(code, validationNumber) {
    try {
      const response = await this.api.post(`/auth/validEmail/${code}`, {
        vaildNumber: validationNumber
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    socketManager.disconnect();
  }

  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  isAuthenticated() {
    return !!localStorage.getItem('token');
  }

  handleError(error) {
    const message = error.response?.data?.msg || 'Error de conexión';
    return new Error(message);
  }
}

export const authService = new AuthService();
```

### Hook de Autenticación (React)

```javascript
// hooks/useAuth.js
import { useState, useEffect, createContext, useContext } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          const userData = authService.getCurrentUser();
          setUser(userData);
        } catch (error) {
          authService.logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    const result = await authService.login(credentials);
    setUser(result.user);
    return result;
  };

  const register = async (userData) => {
    const result = await authService.register(userData);
    setUser(result.user);
    return result;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};
```

---

## 🎭 Gestión de Eventos

### Servicio de Eventos

```javascript
// services/eventService.js
import axios from 'axios';
import { apiConfig } from '../config/api';

class EventService {
  constructor() {
    this.api = axios.create(apiConfig);
  }

  async createEventRequest(eventData) {
    try {
      const response = await this.api.post('/events/request-musician', eventData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getMyPendingEvents() {
    try {
      const response = await this.api.get('/events/my-pending');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getMyAssignedEvents() {
    try {
      const response = await this.api.get('/events/my-assigned');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getMyCompletedEvents() {
    try {
      const response = await this.api.get('/events/my-completed');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getAvailableRequests() {
    try {
      const response = await this.api.get('/events/available-requests');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async acceptEvent(eventId) {
    try {
      const response = await this.api.post(`/events/${eventId}/accept`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getMyScheduledEvents() {
    try {
      const response = await this.api.get('/events/my-scheduled');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getMyPastPerformances() {
    try {
      const response = await this.api.get('/events/my-past-performances');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getMyEvents() {
    try {
      const response = await this.api.get('/events/my-events');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  handleError(error) {
    const message = error.response?.data?.msg || 'Error de conexión';
    return new Error(message);
  }
}

export const eventService = new EventService();
```

### Hook de Eventos (React)

```javascript
// hooks/useEvents.js
import { useState, useEffect } from 'react';
import { eventService } from '../services/eventService';
import { useAuth } from './useAuth';

export const useEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const fetchEvents = async (fetchFunction) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchFunction();
      setEvents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createEventRequest = async (eventData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await eventService.createEventRequest(eventData);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const acceptEvent = async (eventId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await eventService.acceptEvent(eventId);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    events,
    loading,
    error,
    fetchEvents,
    createEventRequest,
    acceptEvent,
    eventService
  };
};
```

---

## 🎵 Solicitudes Directas

### Servicio de Solicitudes

```javascript
// services/musicianRequestService.js
import axios from 'axios';
import { apiConfig } from '../config/api';

class MusicianRequestService {
  constructor() {
    this.api = axios.create(apiConfig);
  }

  async createRequest(requestData) {
    try {
      const response = await this.api.post('/musician-requests/', requestData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async acceptRequest(requestId, musicianId) {
    try {
      const response = await this.api.post('/musician-requests/accept', {
        requestId,
        musicianId
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async cancelRequest(requestId) {
    try {
      const response = await this.api.post('/musician-requests/cancel', {
        requestId
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getRequestStatus(requestId) {
    try {
      const response = await this.api.get(`/musician-requests/${requestId}/status`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  handleError(error) {
    const message = error.response?.data?.msg || 'Error de conexión';
    return new Error(message);
  }
}

export const musicianRequestService = new MusicianRequestService();
```

---

## 📡 Notificaciones en Tiempo Real

### Servicio de Notificaciones

```javascript
// services/notificationService.js
import { socketManager } from '../config/socket';

class NotificationService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect(token) {
    this.socket = socketManager.connect(token);
    this.setupEventListeners();
  }

  disconnect() {
    socketManager.disconnect();
    this.socket = null;
  }

  setupEventListeners() {
    if (!this.socket) return;

    // Nueva solicitud de evento
    this.socket.on('new_event_request', (data) => {
      this.notifyListeners('new_event_request', data);
    });

    // Músico aceptó solicitud
    this.socket.on('musician_accepted', (data) => {
      this.notifyListeners('musician_accepted', data);
    });

    // Solicitud tomada
    this.socket.on('musician_request_taken', (data) => {
      this.notifyListeners('musician_request_taken', data);
    });

    // Solicitud cancelada
    this.socket.on('request_cancelled', (data) => {
      this.notifyListeners('request_cancelled', data);
    });

    // Notificación personalizada
    this.socket.on('notification', (data) => {
      this.notifyListeners('notification', data);
    });
  }

  addListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  removeListener(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  notifyListeners(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error en listener de notificación:', error);
        }
      });
    }
  }

  sendNotification(toUserId, data) {
    if (this.socket) {
      this.socket.emit('send-notification', { toUserId, data });
    }
  }
}

export const notificationService = new NotificationService();
```

### Hook de Notificaciones (React)

```javascript
// hooks/useNotifications.js
import { useEffect, useCallback } from 'react';
import { notificationService } from '../services/notificationService';
import { useAuth } from './useAuth';

export const useNotifications = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (user && user.token) {
      notificationService.connect(user.token);
    }

    return () => {
      notificationService.disconnect();
    };
  }, [user]);

  const onNewEventRequest = useCallback((data) => {
    console.log('Nueva solicitud de evento:', data);
    // Mostrar notificación al usuario
    showNotification('Nueva solicitud', 'Hay una nueva solicitud de músico disponible');
  }, []);

  const onMusicianAccepted = useCallback((data) => {
    console.log('Músico aceptó solicitud:', data);
    showNotification('Solicitud aceptada', 'Un músico ha aceptado tu solicitud');
  }, []);

  const onRequestCancelled = useCallback((data) => {
    console.log('Solicitud cancelada:', data);
    showNotification('Solicitud cancelada', 'Una solicitud ha sido cancelada');
  }, []);

  useEffect(() => {
    notificationService.addListener('new_event_request', onNewEventRequest);
    notificationService.addListener('musician_accepted', onMusicianAccepted);
    notificationService.addListener('request_cancelled', onRequestCancelled);

    return () => {
      notificationService.removeListener('new_event_request', onNewEventRequest);
      notificationService.removeListener('musician_accepted', onMusicianAccepted);
      notificationService.removeListener('request_cancelled', onRequestCancelled);
    };
  }, [onNewEventRequest, onMusicianAccepted, onRequestCancelled]);

  const showNotification = (title, message) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body: message });
    }
  };

  return {
    sendNotification: notificationService.sendNotification.bind(notificationService)
  };
};
```

---

## 🖼️ Gestión de Imágenes

### Servicio de Imágenes

```javascript
// services/imageService.js
import axios from 'axios';
import { apiConfig } from '../config/api';

class ImageService {
  constructor() {
    this.api = axios.create(apiConfig);
  }

  async getAllImages() {
    try {
      const response = await this.api.get('/imgs/getAllImg');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getImageUrl(key) {
    try {
      const response = await this.api.get(`/imgs/getUrl/${key}`);
      return response.data.url;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async uploadImage(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await this.api.post('/imgs/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async uploadProfileImage(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await this.api.post('/media/saveImage', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteImage(key) {
    try {
      const response = await this.api.delete(`/imgs/delete/${key}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateImageMetadata(key, metadata) {
    try {
      const response = await this.api.put(`/imgs/update-metadata/${key}`, metadata);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  handleError(error) {
    const message = error.response?.data?.msg || 'Error de conexión';
    return new Error(message);
  }
}

export const imageService = new ImageService();
```

### Componente de Subida de Imágenes (React)

```javascript
// components/ImageUpload.jsx
import React, { useState } from 'react';
import { imageService } from '../services/imageService';

const ImageUpload = ({ onUpload, type = 'general' }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Solo se permiten archivos JPG, PNG y WebP');
      return;
    }

    // Validar tamaño (5MB máximo)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('El archivo no puede ser mayor a 5MB');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      let result;
      if (type === 'profile') {
        result = await imageService.uploadProfileImage(file);
      } else {
        result = await imageService.uploadImage(file);
      }

      onUpload(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="image-upload">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
        className="file-input"
      />
      {uploading && <div className="uploading">Subiendo imagen...</div>}
      {error && <div className="error">{error}</div>}
    </div>
  );
};

export default ImageUpload;
```

---

## ⚠️ Manejo de Errores

### Clase de Manejo de Errores

```javascript
// utils/errorHandler.js
export class ApiError extends Error {
  constructor(message, status, code) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export const handleApiError = (error) => {
  if (error.response) {
    // Error de respuesta del servidor
    const { status, data } = error.response;
    throw new ApiError(data.msg || 'Error del servidor', status, data.code);
  } else if (error.request) {
    // Error de red
    throw new ApiError('Error de conexión', 0, 'NETWORK_ERROR');
  } else {
    // Error de configuración
    throw new ApiError('Error de configuración', 0, 'CONFIG_ERROR');
  }
};

export const showErrorNotification = (error) => {
  const message = error.message || 'Ha ocurrido un error';
  
  // Mostrar notificación al usuario
  if (typeof window !== 'undefined' && window.toast) {
    window.toast.error(message);
  } else {
    alert(message);
  }
};
```

### Hook de Manejo de Errores (React)

```javascript
// hooks/useErrorHandler.js
import { useState, useCallback } from 'react';
import { handleApiError, showErrorNotification } from '../utils/errorHandler';

export const useErrorHandler = () => {
  const [error, setError] = useState(null);

  const handleError = useCallback((error) => {
    const apiError = handleApiError(error);
    setError(apiError);
    showErrorNotification(apiError);
    return apiError;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    clearError
  };
};
```

---

## 💡 Ejemplos de Código

### Componente de Login (React)

```javascript
// components/Login.jsx
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useErrorHandler } from '../hooks/useErrorHandler';

const Login = () => {
  const [credentials, setCredentials] = useState({
    userEmail: '',
    userPassword: ''
  });
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const { handleError, error, clearError } = useErrorHandler();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearError();

    try {
      await login(credentials);
      // Redirigir al dashboard
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Email"
        value={credentials.userEmail}
        onChange={(e) => setCredentials({
          ...credentials,
          userEmail: e.target.value
        })}
        required
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={credentials.userPassword}
        onChange={(e) => setCredentials({
          ...credentials,
          userPassword: e.target.value
        })}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
      </button>
      {error && <div className="error">{error.message}</div>}
    </form>
  );
};

export default Login;
```

### Componente de Lista de Eventos (React)

```javascript
// components/EventList.jsx
import React, { useEffect, useState } from 'react';
import { useEvents } from '../hooks/useEvents';
import { useAuth } from '../hooks/useAuth';

const EventList = ({ type = 'available' }) => {
  const { user } = useAuth();
  const { events, loading, error, fetchEvents, eventService } = useEvents();
  const [filteredEvents, setFilteredEvents] = useState([]);

  useEffect(() => {
    const loadEvents = async () => {
      switch (type) {
        case 'pending':
          await fetchEvents(eventService.getMyPendingEvents);
          break;
        case 'assigned':
          await fetchEvents(eventService.getMyAssignedEvents);
          break;
        case 'completed':
          await fetchEvents(eventService.getMyCompletedEvents);
          break;
        case 'available':
          await fetchEvents(eventService.getAvailableRequests);
          break;
        case 'scheduled':
          await fetchEvents(eventService.getMyScheduledEvents);
          break;
        default:
          await fetchEvents(eventService.getMyEvents);
      }
    };

    loadEvents();
  }, [type, fetchEvents, eventService]);

  const handleAcceptEvent = async (eventId) => {
    try {
      await eventService.acceptEvent(eventId);
      // Recargar eventos
      await fetchEvents(eventService.getAvailableRequests);
    } catch (error) {
      console.error('Error al aceptar evento:', error);
    }
  };

  if (loading) return <div>Cargando eventos...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="event-list">
      {events.map((event) => (
        <div key={event.id} className="event-card">
          <h3>{event.eventName}</h3>
          <p>Fecha: {event.date}</p>
          <p>Hora: {event.time}</p>
          <p>Ubicación: {event.location}</p>
          <p>Instrumento: {event.instrument}</p>
          <p>Presupuesto: {event.budget}</p>
          {type === 'available' && user?.roll === 'musico' && (
            <button onClick={() => handleAcceptEvent(event.id)}>
              Aceptar Evento
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default EventList;
```

---

## ✅ Mejores Prácticas

### 1. Gestión de Estado

- Usa Context API o Redux para estado global
- Mantén estado local en componentes simples
- Implementa cache para datos frecuentemente accedidos

### 2. Manejo de Errores

- Implementa manejo de errores consistente
- Muestra mensajes de error amigables al usuario
- Registra errores para debugging

### 3. Optimización de Rendimiento

- Implementa lazy loading para componentes pesados
- Usa React.memo para componentes que no cambian frecuentemente
- Optimiza re-renders con useMemo y useCallback

### 4. Seguridad

- Nunca almacenes tokens en localStorage sin encriptar
- Valida datos en el frontend antes de enviar al backend
- Implementa logout automático en tokens expirados

### 5. UX/UI

- Muestra estados de loading apropiados
- Implementa feedback visual para acciones del usuario
- Usa notificaciones toast para mensajes importantes

### 6. Testing

- Escribe tests unitarios para servicios
- Implementa tests de integración para flujos completos
- Usa mocks para APIs externas

---

## 📚 Recursos Adicionales

- [Documentación de la API](http://localhost:1000/api-docs)
- [Guía de Swagger](https://swagger.io/docs/)
- [Documentación de Socket.IO](https://socket.io/docs/)
- [React Hooks](https://reactjs.org/docs/hooks-intro.html)
- [Axios](https://axios-http.com/docs/intro)

---

> **Nota:** Esta documentación asume que estás usando React, pero los conceptos son aplicables a cualquier framework frontend (Vue, Angular, etc.). 