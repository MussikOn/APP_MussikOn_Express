# 📖 Documentación de Swagger - MussikOn API

## 📋 Índice

- [Descripción General](#descripción-general)
- [Configuración de Swagger](#configuración-de-swagger)
- [Estructura de Documentación](#estructura-de-documentación)
- [Ejemplos de Uso](#ejemplos-de-uso)
- [Configuración Avanzada](#configuración-avanzada)
- [Integración con Redoc](#integración-con-redoc)
- [Siguiente: Documentación de Deployment](#siguiente-documentación-de-deployment)

## Descripción General

Swagger es una herramienta de documentación interactiva que permite explorar y probar la API de MussikOn de manera visual. Esta documentación incluye la configuración, ejemplos y mejores prácticas para mantener la documentación actualizada.

### URLs de Acceso
```
Development: http://localhost:3000/api-docs
Staging: https://staging-api.mussikon.com/api-docs
Production: https://api.mussikon.com/api-docs

Redoc (Alternativa):
Development: http://localhost:3000/redoc
Staging: https://staging-api.mussikon.com/redoc
Production: https://api.mussikon.com/redoc
```

## Configuración de Swagger

### 1. Instalación de Dependencias

```bash
npm install swagger-jsdoc swagger-ui-express redoc-express
npm install --save-dev @types/swagger-jsdoc @types/swagger-ui-express
```

### 2. Configuración Básica

```typescript
// config/swagger.ts
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import redoc from 'redoc-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MussikOn API',
      version: '1.0.0',
      description: 'API para conectar músicos con organizadores de eventos',
      contact: {
        name: 'Soporte MussikOn',
        email: 'soporte@mussikon.com',
        url: 'https://mussikon.com/soporte'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Servidor de desarrollo'
      },
      {
        url: 'https://staging-api.mussikon.com/api/v1',
        description: 'Servidor de staging'
      },
      {
        url: 'https://api.mussikon.com/api/v1',
        description: 'Servidor de producción'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token de autenticación'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'object',
              properties: {
                code: {
                  type: 'string',
                  example: 'AUTH_001'
                },
                message: {
                  type: 'string',
                  example: 'Token inválido'
                },
                details: {
                  type: 'string',
                  example: 'El token proporcionado ha expirado'
                }
              }
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00Z'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              type: 'object',
              description: 'Datos de la respuesta'
            },
            message: {
              type: 'string',
              example: 'Operación exitosa'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00Z'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts',
    './src/types/*.ts'
  ]
};

const specs = swaggerJsdoc(options);

export { specs, swaggerUi, redoc };
```

### 3. Configuración en Express

```typescript
// src/index.ts
import express from 'express';
import { specs, swaggerUi, redoc } from '../config/swagger';

const app = express();

// Configurar Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'MussikOn API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    deepLinking: true
  }
}));

// Configurar Redoc
app.use('/redoc', redoc({
  title: 'MussikOn API Documentation',
  specUrl: '/api-docs/swagger.json',
  redocOptions: {
    theme: {
      colors: {
        primary: {
          main: '#1890ff'
        }
      }
    }
  }
}));

// Endpoint para obtener el JSON de Swagger
app.get('/api-docs/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(specs);
});
```

## Estructura de Documentación

### 1. Documentación de Rutas

```typescript
// src/routes/authRoutes.ts
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registra un nuevo usuario
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email del usuario
 *                 example: usuario@ejemplo.com
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 description: Contraseña del usuario
 *                 example: Contraseña123!
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 description: Nombre completo del usuario
 *                 example: Juan Pérez
 *               role:
 *                 type: string
 *                 enum: [musician, organizer, admin]
 *                 description: Rol del usuario
 *                 example: musician
 *               phone:
 *                 type: string
 *                 description: Número de teléfono
 *                 example: +1234567890
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *                         token:
 *                           type: string
 *                           description: JWT token
 *                           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Usuario ya existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
```

### 2. Esquemas de Datos

```typescript
// src/types/swagger.ts
/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID único del usuario
 *           example: user123
 *         email:
 *           type: string
 *           format: email
 *           description: Email del usuario
 *           example: usuario@ejemplo.com
 *         name:
 *           type: string
 *           description: Nombre completo del usuario
 *           example: Juan Pérez
 *         role:
 *           type: string
 *           enum: [musician, organizer, admin]
 *           description: Rol del usuario
 *           example: musician
 *         phone:
 *           type: string
 *           description: Número de teléfono
 *           example: +1234567890
 *         verified:
 *           type: boolean
 *           description: Si el usuario está verificado
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *           example: 2024-01-15T10:30:00Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 *           example: 2024-01-15T11:00:00Z
 *       required:
 *         - id
 *         - email
 *         - name
 *         - role
 *         - verified
 *         - createdAt
 *         - updatedAt
 *     
 *     Musician:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID único del músico
 *           example: musician123
 *         name:
 *           type: string
 *           description: Nombre del músico
 *           example: María García
 *         bio:
 *           type: string
 *           description: Biografía del músico
 *           example: Pianista profesional con 15 años de experiencia...
 *         genres:
 *           type: array
 *           items:
 *             type: string
 *           description: Géneros musicales
 *           example: ["jazz", "blues", "classical"]
 *         instruments:
 *           type: array
 *           items:
 *             type: string
 *           description: Instrumentos que toca
 *           example: ["piano", "saxophone"]
 *         rating:
 *           type: number
 *           format: float
 *           minimum: 0
 *           maximum: 5
 *           description: Rating promedio
 *           example: 4.8
 *         reviewCount:
 *           type: integer
 *           description: Número de reseñas
 *           example: 45
 *         hourlyRate:
 *           type: number
 *           description: Tarifa por hora
 *           example: 150
 *         location:
 *           $ref: '#/components/schemas/Location'
 *         verified:
 *           type: boolean
 *           description: Si el músico está verificado
 *           example: true
 *         available:
 *           type: boolean
 *           description: Si está disponible
 *           example: true
 *         profileImage:
 *           type: string
 *           format: uri
 *           description: URL de la imagen de perfil
 *           example: https://example.com/image.jpg
 *       required:
 *         - id
 *         - name
 *         - genres
 *         - instruments
 *         - rating
 *         - hourlyRate
 *         - location
 *         - verified
 *         - available
 *     
 *     Location:
 *       type: object
 *       properties:
 *         address:
 *           type: string
 *           description: Dirección completa
 *           example: Calle Mayor 123
 *         city:
 *           type: string
 *           description: Ciudad
 *           example: Madrid
 *         country:
 *           type: string
 *           description: País
 *           example: España
 *         coordinates:
 *           type: array
 *           items:
 *             type: number
 *           minItems: 2
 *           maxItems: 2
 *           description: Coordenadas [latitud, longitud]
 *           example: [40.4168, -3.7038]
 *       required:
 *         - city
 *         - country
 *     
 *     Event:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID único del evento
 *           example: event123
 *         title:
 *           type: string
 *           description: Título del evento
 *           example: Boda de Ana y Carlos
 *         description:
 *           type: string
 *           description: Descripción del evento
 *           example: Celebración de boda con música en vivo...
 *         type:
 *           type: string
 *           enum: [wedding, corporate, party, concert, other]
 *           description: Tipo de evento
 *           example: wedding
 *         date:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora del evento
 *           example: 2024-06-15T18:00:00Z
 *         duration:
 *           type: integer
 *           description: Duración en horas
 *           example: 4
 *         location:
 *           $ref: '#/components/schemas/Location'
 *         status:
 *           type: string
 *           enum: [draft, active, completed, cancelled]
 *           description: Estado del evento
 *           example: active
 *         budget:
 *           $ref: '#/components/schemas/Budget'
 *         organizer:
 *           $ref: '#/components/schemas/User'
 *         hiredMusicians:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/HiredMusician'
 *         requirements:
 *           type: array
 *           items:
 *             type: string
 *           description: Requisitos del evento
 *           example: ["Música romántica", "Repertorio clásico"]
 *       required:
 *         - id
 *         - title
 *         - type
 *         - date
 *         - location
 *         - status
 *         - organizer
 *     
 *     Budget:
 *       type: object
 *       properties:
 *         min:
 *           type: number
 *           description: Presupuesto mínimo
 *           example: 500
 *         max:
 *           type: number
 *           description: Presupuesto máximo
 *           example: 1000
 *         currency:
 *           type: string
 *           description: Moneda
 *           example: EUR
 *       required:
 *         - min
 *         - max
 *         - currency
 *     
 *     HiredMusician:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID del músico
 *           example: musician123
 *         name:
 *           type: string
 *           description: Nombre del músico
 *           example: María García
 *         instrument:
 *           type: string
 *           description: Instrumento principal
 *           example: piano
 *         hourlyRate:
 *           type: number
 *           description: Tarifa por hora
 *           example: 150
 *         status:
 *           type: string
 *           enum: [pending, confirmed, cancelled]
 *           description: Estado de la contratación
 *           example: confirmed
 *       required:
 *         - id
 *         - name
 *         - instrument
 *         - status
 */
```

### 3. Documentación de Controladores

```typescript
// src/controllers/authController.ts
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Inicia sesión de un usuario
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email del usuario
 *                 example: usuario@ejemplo.com
 *               password:
 *                 type: string
 *                 description: Contraseña del usuario
 *                 example: Contraseña123!
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *                         token:
 *                           type: string
 *                           description: JWT token
 *                           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       401:
 *         description: Credenciales inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Demasiados intentos de login
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const login = async (req: Request, res: Response) => {
  // Implementación del controlador
};
```

## Ejemplos de Uso

### 1. Documentación de Endpoints Complejos

```typescript
/**
 * @swagger
 * /musicians:
 *   get:
 *     summary: Obtiene lista de músicos con filtros
 *     tags: [Músicos]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Número de elementos por página
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *         description: Filtrar por género musical
 *         example: jazz
 *       - in: query
 *         name: instrument
 *         schema:
 *           type: string
 *         description: Filtrar por instrumento
 *         example: piano
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filtrar por ubicación
 *         example: Madrid
 *       - in: query
 *         name: minRating
 *         schema:
 *           type: number
 *           minimum: 0
 *           maximum: 5
 *         description: Rating mínimo
 *         example: 4.0
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Precio máximo por hora
 *         example: 200
 *       - in: query
 *         name: available
 *         schema:
 *           type: boolean
 *         description: Solo músicos disponibles
 *         example: true
 *       - in: query
 *         name: verified
 *         schema:
 *           type: boolean
 *         description: Solo músicos verificados
 *         example: true
 *     responses:
 *       200:
 *         description: Lista de músicos obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         musicians:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Musician'
 *                         pagination:
 *                           $ref: '#/components/schemas/Pagination'
 *       400:
 *         description: Parámetros de consulta inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
```

### 2. Documentación de Uploads

```typescript
/**
 * @swagger
 * /images/upload:
 *   post:
 *     summary: Sube una imagen
 *     tags: [Imágenes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - type
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Archivo de imagen
 *               type:
 *                 type: string
 *                 enum: [profile, event, voucher]
 *                 description: Tipo de imagen
 *                 example: profile
 *               metadata:
 *                 type: string
 *                 description: Metadatos adicionales en formato JSON
 *                 example: '{"userId": "user123"}'
 *     responses:
 *       201:
 *         description: Imagen subida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Image'
 *       400:
 *         description: Archivo inválido o tipo no soportado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       413:
 *         description: Archivo demasiado grande
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
```

### 3. Documentación de WebSockets

```typescript
/**
 * @swagger
 * components:
 *   schemas:
 *     WebSocketEvent:
 *       type: object
 *       properties:
 *         event:
 *           type: string
 *           description: Tipo de evento
 *           example: new_message
 *         data:
 *           type: object
 *           description: Datos del evento
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: Timestamp del evento
 *           example: 2024-01-15T14:30:00Z
 *   
 *   examples:
 *     NewMessage:
 *       summary: Nuevo mensaje recibido
 *       value:
 *         event: new_message
 *         data:
 *           id: msg123
 *           content: Hola, ¿cómo estás?
 *           sender: user123
 *           conversationId: conv123
 *           timestamp: 2024-01-15T14:30:00Z
 *         timestamp: 2024-01-15T14:30:00Z
 *     
 *     EventUpdate:
 *       summary: Actualización de evento
 *       value:
 *         event: event_update
 *         data:
 *           eventId: event123
 *           changes:
 *             title: Boda de Ana y Carlos - Actualizado
 *             date: 2024-06-15T19:00:00Z
 *         timestamp: 2024-01-15T14:30:00Z
 */
```

## Configuración Avanzada

### 1. Personalización de Swagger UI

```typescript
// config/swagger.ts
const swaggerOptions = {
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info .title { color: #1890ff }
    .swagger-ui .scheme-container { background: #f5f5f5 }
    .swagger-ui .opblock.opblock-get .opblock-summary-method { background: #61affe }
    .swagger-ui .opblock.opblock-post .opblock-summary-method { background: #49cc90 }
    .swagger-ui .opblock.opblock-put .opblock-summary-method { background: #fca130 }
    .swagger-ui .opblock.opblock-delete .opblock-summary-method { background: #f93e3e }
  `,
  customSiteTitle: 'MussikOn API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    deepLinking: true,
    docExpansion: 'list',
    defaultModelsExpandDepth: 1,
    defaultModelExpandDepth: 1,
    tryItOutEnabled: true,
    requestInterceptor: (req: any) => {
      // Agregar headers personalizados
      req.headers['X-API-Version'] = '1.0.0';
      return req;
    },
    responseInterceptor: (res: any) => {
      // Procesar respuestas
      return res;
    }
  }
};
```

### 2. Configuración de Redoc

```typescript
// config/redoc.ts
const redocOptions = {
  title: 'MussikOn API Documentation',
  specUrl: '/api-docs/swagger.json',
  redocOptions: {
    theme: {
      colors: {
        primary: {
          main: '#1890ff'
        },
        text: {
          primary: '#333333',
          secondary: '#666666'
        },
        gray: {
          50: '#fafafa',
          100: '#f5f5f5'
        }
      },
      typography: {
        fontSize: '14px',
        lineHeight: '1.5em',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        headings: {
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
          fontWeight: '600'
        }
      },
      sidebar: {
        backgroundColor: '#fafafa',
        textColor: '#333333'
      }
    },
    hideDownloadButton: false,
    hideHostname: false,
    hideLoading: false,
    nativeScrollbars: false,
    pathInMiddlePanel: true,
    requiredPropsFirst: true,
    scrollYOffset: 0,
    showExtensions: true,
    sortPropsAlphabetically: true,
    suppressWarnings: false,
    untrustedSpec: false
  }
};
```

### 3. Middleware de Validación

```typescript
// middleware/swaggerValidation.ts
import { Request, Response, NextFunction } from 'express';
import { validateRequest } from 'swagger-jsdoc';

export const swaggerValidation = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validar request contra esquema de Swagger
    const validation = validateRequest(req, specs);
    
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Datos de entrada inválidos',
          details: validation.errors
        }
      });
    }
    
    next();
  } catch (error) {
    console.error('Error en validación Swagger:', error);
    next();
  }
};
```

### 4. Generación Automática de Documentación

```typescript
// scripts/generateDocs.ts
import fs from 'fs';
import path from 'path';
import { specs } from '../config/swagger';

const generateDocs = () => {
  try {
    // Generar JSON de Swagger
    const swaggerJson = JSON.stringify(specs, null, 2);
    fs.writeFileSync(
      path.join(__dirname, '../public/swagger.json'),
      swaggerJson
    );
    
    // Generar HTML estático
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>MussikOn API Documentation</title>
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui.css" />
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-bundle.js"></script>
    <script>
        window.onload = function() {
            SwaggerUIBundle({
                url: './swagger.json',
                dom_id: '#swagger-ui',
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIStandalonePreset
                ],
                layout: "StandaloneLayout"
            });
        };
    </script>
</body>
</html>`;
    
    fs.writeFileSync(
      path.join(__dirname, '../public/api-docs.html'),
      html
    );
    
    console.log('✅ Documentación generada exitosamente');
  } catch (error) {
    console.error('❌ Error generando documentación:', error);
  }
};

generateDocs();
```

## Integración con Redoc

### 1. Configuración de Redoc

```typescript
// config/redoc.ts
import redoc from 'redoc-express';

export const redocOptions = {
  title: 'MussikOn API Documentation',
  specUrl: '/api-docs/swagger.json',
  redocOptions: {
    theme: {
      colors: {
        primary: {
          main: '#1890ff'
        }
      },
      typography: {
        fontSize: '14px',
        lineHeight: '1.5em',
        fontFamily: 'Inter, sans-serif'
      }
    },
    hideDownloadButton: false,
    hideHostname: false,
    pathInMiddlePanel: true,
    requiredPropsFirst: true,
    sortPropsAlphabetically: true
  }
};

// En Express
app.use('/redoc', redoc(redocOptions));
```

### 2. Página de Documentación Combinada

```typescript
// routes/docsRoutes.ts
import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  const html = `
<!DOCTYPE html>
<html>
<head>
    <title>MussikOn API Documentation</title>
    <style>
        body { margin: 0; font-family: Arial, sans-serif; }
        .header { background: #1890ff; color: white; padding: 20px; text-align: center; }
        .nav { background: #f5f5f5; padding: 10px; text-align: center; }
        .nav a { margin: 0 10px; padding: 10px 20px; text-decoration: none; color: #333; }
        .nav a:hover { background: #e6e6e6; }
        .content { padding: 20px; }
        iframe { width: 100%; height: 800px; border: none; }
    </style>
</head>
<body>
    <div class="header">
        <h1>MussikOn API Documentation</h1>
        <p>Documentación completa de la API REST</p>
    </div>
    <div class="nav">
        <a href="#" onclick="showSwagger()">Swagger UI</a>
        <a href="#" onclick="showRedoc()">Redoc</a>
        <a href="/api-docs/swagger.json" target="_blank">JSON</a>
    </div>
    <div class="content">
        <iframe id="docs-frame" src="/api-docs"></iframe>
    </div>
    <script>
        function showSwagger() {
            document.getElementById('docs-frame').src = '/api-docs';
        }
        function showRedoc() {
            document.getElementById('docs-frame').src = '/redoc';
        }
    </script>
</body>
</html>`;
  
  res.send(html);
});

export default router;
```

## Siguiente: Documentación de Deployment

Para continuar con la documentación, ve a [Documentación de Deployment](../deployment/README.md) donde encontrarás instrucciones detalladas para desplegar la API en diferentes entornos.

---

**Nota**: Esta documentación se actualiza regularmente. Para la versión más reciente, consulta la documentación interactiva en Swagger UI o Redoc. 