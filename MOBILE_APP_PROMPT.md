# Prompt para Generar una App Móvil en React Native (Expo) que Consuma la API MusikOn

## Descripción General
Quiero que generes una aplicación móvil usando **React Native con Expo** que consuma la API RESTful de MusikOn. Esta app debe permitir que dos tipos de usuarios (Organizadores y Músicos) gestionen eventos musicales, solicitudes y notificaciones en tiempo real.

---

## 1. Roles y Flujos Principales

### **Organizador de Eventos**
- Puede crear solicitudes de músicos para eventos (fiestas, bodas, conciertos, etc.).
- Puede ver el estado de sus eventos: pendientes, asignados, completados.
- Recibe notificaciones en tiempo real cuando un músico acepta su solicitud.

### **Músico**
- Puede ver todas las solicitudes de eventos disponibles.
- Puede aceptar una solicitud de evento.
- Puede ver sus eventos agendados y su historial de actuaciones.
- Recibe notificaciones en tiempo real cuando hay nuevas solicitudes de eventos.

---

## 2. Requisitos de la App

- **Tecnología:**
  - React Native con Expo (TypeScript recomendado)
  - Navegación: `@react-navigation/native`
  - Manejo de estado: Context API, Redux o Zustand (a elección)
  - HTTP: `fetch` o `axios`
  - Sockets: `socket.io-client`
  - Manejo de formularios: `formik` + `yup` (opcional)
  - Manejo de fechas: `date-fns` o `moment`

- **Pantalla de Login:**
  - Email y contraseña.
  - Obtiene y almacena el token JWT (en SecureStore o AsyncStorage).

- **Registro de Usuario:**
  - (Opcional, si la API lo permite)

- **Navegación basada en rol:**
  - Si el usuario es Organizador, muestra las pantallas de gestión de eventos.
  - Si es Músico, muestra las pantallas de solicitudes y agenda.

- **Pantalla para crear solicitud de músico (Organizador):**
  - Formulario con los siguientes campos:
    - Nombre del evento
    - Tipo de evento
    - Fecha y hora (usa `@react-native-community/datetimepicker`)
    - Ubicación (dirección y enlace a Google Maps)
    - Duración
    - Instrumento/tipo de músico
    - ¿Debe llevar instrumento?
    - Presupuesto
    - Comentario adicional
    - Lista de canciones/repertorio
  - Al enviar, llama a `POST /events/request-musician` con el token JWT.

- **Pantallas de listado de eventos (Organizador):**
  - Pendientes, asignados, completados.
  - Cada evento muestra detalles y estado.

- **Pantalla de solicitudes disponibles (Músico):**
  - Lista de eventos con estado `pending_musician`.
  - Permite filtrar por instrumento, ubicación, etc.
  - Botón para aceptar solicitud (llama a `POST /events/:eventId/accept`).

- **Pantalla de agenda e historial (Músico):**
  - Eventos agendados y actuaciones pasadas.

- **Notificaciones en tiempo real:**
  - Usa `socket.io-client` para:
    - Músicos: escuchar `new_event_request`.
    - Organizadores: escuchar `musician_accepted`.
  - Registrar el usuario en el socket tras login (`socket.emit('register', userEmail)`).

- **Gestión de sesión:**
  - Almacena el token JWT y el rol del usuario (en SecureStore o AsyncStorage).
  - Usa el token en el header `Authorization` para todas las llamadas protegidas.

- **Subida de imágenes (opcional):**
  - Usa `expo-image-picker` para seleccionar imágenes y súbelas a `/media/saveImage`.

---

## 3. Endpoints RESTful a Consumir

### **Autenticación**
- `POST /auth/login` — Login, devuelve token JWT.
- (Opcional) `POST /auth/Register` — Registro.

### **Organizador**
- `POST /events/request-musician` — Crear solicitud de músico.
- `GET /events/my-pending` — Ver eventos pendientes.
- `GET /events/my-assigned` — Ver eventos asignados.
- `GET /events/my-completed` — Ver eventos completados.

### **Músico**
- `GET /events/available-requests` — Ver solicitudes disponibles.
- `POST /events/:eventId/accept` — Aceptar una solicitud.
- `GET /events/my-scheduled` — Ver eventos agendados.
- `GET /events/my-past-performances` — Ver historial de actuaciones.

### **Imágenes (opcional)**
- `POST /media/saveImage` — Sube imagen de perfil de músico (form-data, campo `file`).
- `GET /media/getImage/:key` — Obtiene URL firmada de imagen.

---

## 4. Ejemplo de Consumo (React Native + Expo)

### **Login y almacenamiento de token**
```tsx
import AsyncStorage from '@react-native-async-storage/async-storage';

const login = async (email, password) => {
  const res = await fetch('http://localhost:1000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userEmail: email, userPassword: password }),
  });
  const data = await res.json();
  if (data.token) {
    await AsyncStorage.setItem('token', data.token);
  }
  return data.token;
};
```

### **Crear solicitud de músico**
```tsx
const createEventRequest = async (token, eventData) => {
  const res = await fetch('http://localhost:1000/events/request-musician', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(eventData),
  });
  return await res.json();
};
```

### **Sockets (Expo + socket.io-client)**
```tsx
import { io } from 'socket.io-client';
const socket = io('http://localhost:1000', { transports: ['websocket'] });

// Registrar usuario tras login
socket.emit('register', userEmail);

// Músico escucha nuevas solicitudes
socket.on('new_event_request', (eventData) => {
  // Mostrar notificación o actualizar lista
});

// Organizador escucha aceptación de músico
socket.on('musician_accepted', (eventData) => {
  // Mostrar notificación o actualizar estado del evento
});
```

### **Subida de imágenes (opcional)**
```tsx
import * as ImagePicker from 'expo-image-picker';

const pickAndUploadImage = async (token) => {
  const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });
  if (!result.cancelled) {
    const formData = new FormData();
    formData.append('file', {
      uri: result.uri,
      name: 'profile.jpg',
      type: 'image/jpeg',
    });
    const res = await fetch('http://localhost:1000/media/saveImage', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });
    return await res.json();
  }
};
```

---

## 5. Consideraciones Técnicas
- Cambia `localhost` por la IP del backend si pruebas en dispositivo físico (usa `expo start --tunnel` para facilitar).
- Usa el token JWT en el header `Authorization` para rutas protegidas.
- Implementa manejo de errores y feedback visual.
- La app debe ser responsiva y amigable para ambos roles.
- Usa `expo-secure-store` o `@react-native-async-storage/async-storage` para guardar el token.

---

## 6. Recursos
- [Swagger API Docs](http://localhost:1000/api-docs) — Para ver todos los endpoints y modelos.
- [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md) — Para entender la estructura y lógica del backend.

---

## 7. Objetivo
El objetivo es que la app móvil permita a organizadores y músicos interactuar de forma fluida, recibir notificaciones en tiempo real y gestionar eventos musicales de principio a fin, usando la API MusikOn. 


Toma como referencia para los colores estos, solo estos.

```typescript
export const appName = "MussikOn";
export const bg_dinamic_primary = "#62a4ff";
export const bg_dinamic_info = "#d5effd";

// Colors
export const color_primary = "#004aad";
export const color_primary_gradient = 'rgba(1, 74, 173, 100)';
export const color_secondary = "#73737a";
export const color_white = "#f1f1f1";
export const color_success = "#a2d6b0";
export const color_danger = "#ff8c8c";
export const color_info = "#5ebeee";
// Buttons colors.
export const iconSize = 25;
export const btn_primary = "#004aad";
export const btn_secondary = "#73737a";
export const btn_white = "#f1f1f1";
export const btn_success = "#01a652";
export const btn_danger = "#ff8c8c";
export const btn_info = "#5ebeee";

export const bg_primary = "#004aad";
export const bg_secondary = "#73737a";
export const bg_white = "#f1f1f1";
export const bg_dark = "#000";
export const bg_success = "#01a652";
export const bg_danger = "#ff8c8c";
export const bg_info = "#5ebeee";
// Borders colors
export const border_color_primary = "#004aad";
export const border_color_secondary = "#73737a";
export const border_color_white = "#f1f1f1";
export const border_color_success = "#01a652";
export const border_color_danger = "#ff8c8c";
export const border_color_info = "#5ebeee";

// Text colors.
export const text_primary = "#004aad";
export const text_secondary = "#73737a";
export const text_white = "#f1f1f1";
export const text_success = "#01a652";
export const text_danger = "#ff8c8c";
export const text_info = "#5ebeee";
```