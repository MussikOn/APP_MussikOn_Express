# Integración Frontend - Backend MusikOn

## Descripción

Esta documentación proporciona ejemplos específicos para integrar el frontend React Native con el backend de solicitudes de músicos.

## Configuración del Frontend

### 1. Configurar API Base URL

En tu archivo de configuración (`src/config/environment.ts` o similar):

```typescript
export const API_CONFIG = {
  BASE_URL: 'http://localhost:1000',
  MUSICIAN_REQUESTS_URL: 'http://localhost:1000/musician-requests',
  AUTH_URL: 'http://localhost:1000/auth',
  TIMEOUT: 10000,
};
```

### 2. Servicio API para Solicitudes de Músicos

Crear `src/services/musicianRequestService.ts`:

```typescript
import { API_CONFIG } from '../config/environment';
import { MusicianRequest, MusicianRequestResponse } from '../appTypes/DatasTypes';

class MusicianRequestService {
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const token = await this.getAuthToken(); // Implementar según tu sistema de auth
    
    const defaultOptions: RequestInit = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(`${API_CONFIG.MUSICIAN_REQUESTS_URL}${endpoint}`, defaultOptions);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error en la petición');
    }

    return response.json();
  }

  // Crear nueva solicitud
  async createRequest(requestData: {
    organizerId: string;
    organizerName: string;
    eventName: string;
    eventType: 'culto' | 'campana_dentro_templo' | 'otro';
    eventDate: string;
    startTime: string;
    endTime: string;
    location: string;
    locationCoordinates?: { latitude: number; longitude: number };
    instrumentType: string;
    eventDescription: string;
    flyerImage?: string;
  }): Promise<{ request: MusicianRequest; calculatedPrice: number }> {
    const formData = new FormData();
    
    // Agregar campos de texto
    Object.entries(requestData).forEach(([key, value]) => {
      if (key !== 'flyerImage' && value !== undefined) {
        if (key === 'locationCoordinates') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    // Agregar imagen si existe
    if (requestData.flyerImage) {
      const imageUri = requestData.flyerImage;
      const filename = imageUri.split('/').pop() || 'image.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      
      formData.append('flyer', {
        uri: imageUri,
        name: filename,
        type,
      } as any);
    }

    const response = await fetch(`${API_CONFIG.MUSICIAN_REQUESTS_URL}/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${await this.getAuthToken()}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al crear solicitud');
    }

    return response.json();
  }

  // Obtener solicitudes disponibles
  async getAvailableRequests(instrumentType?: string): Promise<MusicianRequest[]> {
    const params = instrumentType ? `?instrumentType=${encodeURIComponent(instrumentType)}` : '';
    const response = await this.makeRequest(`/available${params}`);
    return response.data;
  }

  // Responder a una solicitud
  async respondToRequest(requestId: string, responseData: {
    musicianId: string;
    musicianName: string;
    message?: string;
    proposedPrice?: number;
  }): Promise<MusicianRequestResponse> {
    const response = await this.makeRequest(`/respond/${requestId}`, {
      method: 'POST',
      body: JSON.stringify(responseData),
    });
    return response.data;
  }

  // Aceptar músico
  async acceptMusician(requestId: string, musicianId: string): Promise<any> {
    const response = await this.makeRequest(`/accept/${requestId}/${musicianId}`, {
      method: 'POST',
    });
    return response.data;
  }

  // Obtener solicitudes del organizador
  async getOrganizerRequests(organizerId: string): Promise<MusicianRequest[]> {
    const response = await this.makeRequest(`/organizer/${organizerId}`);
    return response.data;
  }

  // Cancelar solicitud
  async cancelRequest(requestId: string, organizerId: string): Promise<MusicianRequest> {
    const response = await this.makeRequest(`/cancel/${requestId}`, {
      method: 'POST',
      body: JSON.stringify({ organizerId }),
    });
    return response.data;
  }

  // Renviar solicitud expirada
  async resendRequest(requestId: string, organizerId: string): Promise<MusicianRequest> {
    const response = await this.makeRequest(`/resend/${requestId}`, {
      method: 'POST',
      body: JSON.stringify({ organizerId }),
    });
    return response.data;
  }

  private async getAuthToken(): Promise<string> {
    // Implementar según tu sistema de autenticación
    // Ejemplo: return AsyncStorage.getItem('authToken');
    throw new Error('Implementar getAuthToken');
  }
}

export const musicianRequestService = new MusicianRequestService();
```

### 3. Hook Personalizado para Solicitudes

Crear `src/hooks/useMusicianRequests.ts`:

```typescript
import { useState, useEffect } from 'react';
import { musicianRequestService } from '../services/musicianRequestService';
import { MusicianRequest, MusicianRequestResponse } from '../appTypes/DatasTypes';

export const useMusicianRequests = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createRequest = async (requestData: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await musicianRequestService.createRequest(requestData);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getAvailableRequests = async (instrumentType?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const requests = await musicianRequestService.getAvailableRequests(instrumentType);
      return requests;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const respondToRequest = async (requestId: string, responseData: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await musicianRequestService.respondToRequest(requestId, responseData);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createRequest,
    getAvailableRequests,
    respondToRequest,
  };
};
```

### 4. Ejemplo de Uso en Componente

```typescript
import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { useMusicianRequests } from '../hooks/useMusicianRequests';
import MusicianRequestForm from '../components/forms/MusicianRequestForm';

const CreateRequestScreen: React.FC = () => {
  const { loading, error, createRequest } = useMusicianRequests();
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (values: any, calculatedPrice: number) => {
    try {
      const result = await createRequest({
        ...values,
        organizerId: 'user@email.com', // Obtener del contexto de usuario
        organizerName: 'Juan Pérez', // Obtener del contexto de usuario
      });

      setSuccess(true);
      Alert.alert(
        'Éxito',
        `Solicitud creada exitosamente. Precio calculado: RD$ ${calculatedPrice}`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Error al crear solicitud');
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <MusicianRequestForm onSubmit={handleSubmit} isLoading={loading} />
      {error && <Text style={{ color: 'red', padding: 10 }}>{error}</Text>}
    </View>
  );
};

export default CreateRequestScreen;
```

### 5. Componente para Listar Solicitudes

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useMusicianRequests } from '../hooks/useMusicianRequests';
import { MusicianRequest } from '../appTypes/DatasTypes';

const AvailableRequestsScreen: React.FC = () => {
  const [requests, setRequests] = useState<MusicianRequest[]>([]);
  const { loading, error, getAvailableRequests } = useMusicianRequests();

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const availableRequests = await getAvailableRequests();
      setRequests(availableRequests);
    } catch (err) {
      console.error('Error loading requests:', err);
    }
  };

  const renderRequest = ({ item }: { item: MusicianRequest }) => (
    <View style={styles.requestCard}>
      <Text style={styles.eventName}>{item.eventName}</Text>
      <Text style={styles.organizer}>Organizador: {item.organizerName}</Text>
      <Text style={styles.details}>
        {item.eventDate} • {item.startTime} - {item.endTime}
      </Text>
      <Text style={styles.location}>{item.location}</Text>
      <Text style={styles.instrument}>Instrumento: {item.instrumentType}</Text>
      <Text style={styles.price}>RD$ {item.calculatedPrice}</Text>
      <TouchableOpacity style={styles.respondButton}>
        <Text style={styles.buttonText}>Responder</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={requests}
        renderItem={renderRequest}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={loadRequests}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  requestCard: {
    backgroundColor: 'white',
    margin: 10,
    padding: 15,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  eventName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  organizer: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  details: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  instrument: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 10,
  },
  respondButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default AvailableRequestsScreen;
```

## Manejo de Errores

### Tipos de Errores Comunes

1. **Errores de Validación (400)**
```typescript
try {
  await createRequest(data);
} catch (error) {
  if (error.message.includes('Datos de entrada inválidos')) {
    // Mostrar errores de validación específicos
    const errorData = JSON.parse(error.message);
    errorData.errors.forEach((err: string) => {
      Alert.alert('Error de validación', err);
    });
  }
}
```

2. **Errores de Autenticación (401)**
```typescript
if (error.message.includes('Token inválido')) {
  // Redirigir al login
  navigation.navigate('Login');
}
```

3. **Errores de Red**
```typescript
if (error.message.includes('Network request failed')) {
  Alert.alert('Error de conexión', 'Verifica tu conexión a internet');
}
```

## Configuración de Desarrollo

### Para Desarrollo Local

1. **Backend**: Asegúrate de que el servidor esté corriendo en `http://localhost:1000`

2. **Frontend**: Si usas un emulador Android, cambia la URL a:
```typescript
export const API_CONFIG = {
  BASE_URL: 'http://10.0.2.2:1000', // Para emulador Android
  // BASE_URL: 'http://localhost:1000', // Para iOS o dispositivo físico
};
```

3. **CORS**: El backend ya tiene CORS configurado para desarrollo.

### Para Producción

1. Cambia las URLs a tu servidor de producción
2. Implementa manejo de errores más robusto
3. Agrega retry logic para peticiones fallidas
4. Implementa cache para mejorar el rendimiento

## Próximos Pasos

1. Implementar el sistema de autenticación
2. Crear pantallas para gestionar solicitudes
3. Agregar notificaciones en tiempo real
4. Implementar funcionalidades de mapa
5. Agregar tests unitarios 