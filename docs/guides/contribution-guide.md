# 🤝 Guía de Contribución - MussikOn API

## 📋 Descripción General

Esta guía te ayudará a contribuir al desarrollo del backend de MussikOn API. El proyecto está 100% funcional y mantenemos altos estándares de calidad.

**Estado Actual**: ✅ **100% LISTO PARA PRODUCCIÓN**
- **Tests**: 13/13 suites pasando (100%)
- **Cobertura**: 172/172 tests individuales (100%)
- **Calidad**: Código limpio y documentado

---

## 🎯 Cómo Contribuir

### **1. Fork del Repositorio**
```bash
# 1. Ve a https://github.com/MussikOn/APP_MussikOn_Express
# 2. Haz clic en "Fork" en la esquina superior derecha
# 3. Clona tu fork localmente
git clone https://github.com/TU_USUARIO/APP_MussikOn_Express.git
cd APP_MussikOn_Express

# 4. Agrega el repositorio original como upstream
git remote add upstream https://github.com/MussikOn/APP_MussikOn_Express.git
```

### **2. Configurar Entorno de Desarrollo**
```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp ENV_example.ts ENV.ts
# Editar ENV.ts con tus credenciales

# Verificar que todo funciona
npm test
```

### **3. Crear una Rama para tu Feature**
```bash
# Crear y cambiar a una nueva rama
git checkout -b feature/nueva-funcionalidad

# O para correcciones
git checkout -b fix/correccion-bug
```

---

## 📝 Estándares de Código

### **TypeScript**
- ✅ **Tipado Estricto**: Usar tipos explícitos siempre
- ✅ **Interfaces**: Definir interfaces para objetos complejos
- ✅ **Enums**: Usar enums para valores constantes
- ✅ **Generics**: Usar cuando sea apropiado

```typescript
// ✅ Bueno
interface User {
  id: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}

enum UserRole {
  USER = 'user',
  MUSICIAN = 'musician',
  ADMIN = 'admin'
}

// ❌ Evitar
const user: any = { id: '123', email: 'test@test.com' };
```

### **Naming Conventions**
- ✅ **Variables**: camelCase
- ✅ **Funciones**: camelCase
- ✅ **Clases**: PascalCase
- ✅ **Interfaces**: PascalCase con prefijo I (opcional)
- ✅ **Constantes**: UPPER_SNAKE_CASE
- ✅ **Archivos**: kebab-case

```typescript
// ✅ Bueno
const userName = 'John';
const getUserById = (id: string) => { /* ... */ };
class UserService { /* ... */ }
interface IUserData { /* ... */ }
const MAX_RETRY_ATTEMPTS = 3;

// ❌ Evitar
const user_name = 'John';
const GetUserById = (id: string) => { /* ... */ };
class userService { /* ... */ }
```

### **Estructura de Archivos**
```
src/
├── controllers/          # Controladores de la API
├── middleware/           # Middleware personalizado
├── models/              # Modelos de datos
├── routes/              # Definición de rutas
├── services/            # Lógica de negocio
├── utils/               # Utilidades y helpers
├── types/               # Definiciones de tipos TypeScript
└── __tests__/           # Tests unitarios y de integración
```

---

## 🧪 Testing

### **Escribir Tests para Nuevas Funcionalidades**
```typescript
// src/__tests__/miNuevoTest.test.ts
import { Request, Response } from 'express';
import { miControlador } from '../controllers/miControlador';

describe('MiControlador', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    
    mockResponse = {
      status: mockStatus,
      json: mockJson
    };

    jest.clearAllMocks();
  });

  describe('miMetodo', () => {
    it('should return success when valid data is provided', async () => {
      // Arrange
      mockRequest = {
        body: { data: 'test' }
      };

      // Act
      await miControlador.miMetodo(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object)
      });
    });
  });
});
```

### **Verificar Tests**
```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests específicos
npm test -- --testPathPattern="miNuevoTest"

# Verificar cobertura
npm run test:coverage
```

---

## 🔧 Linting y Formateo

### **Verificar Linting**
```bash
# Verificar linting
npm run lint

# Corregir errores automáticamente
npm run lint:fix
```

### **Formatear Código**
```bash
# Formatear con Prettier
npm run format
```

### **Verificar TypeScript**
```bash
# Verificar tipos sin compilar
npx tsc --noEmit
```

---

## 📝 Documentación

### **Comentarios en Código**
```typescript
/**
 * Crea un nuevo usuario en el sistema
 * @param userData - Datos del usuario a crear
 * @returns Promise<User> - Usuario creado
 * @throws {ValidationError} - Si los datos son inválidos
 */
async function createUser(userData: CreateUserDTO): Promise<User> {
  // Validar datos de entrada
  const validatedData = await validateUserData(userData);
  
  // Crear usuario en la base de datos
  const user = await userModel.create(validatedData);
  
  return user;
}
```

### **Documentación de APIs**
```typescript
/**
 * @route POST /api/users
 * @desc Crear un nuevo usuario
 * @access Public
 * @body {string} email - Email del usuario
 * @body {string} password - Contraseña del usuario
 * @body {string} name - Nombre del usuario
 * @returns {object} 201 - Usuario creado exitosamente
 * @returns {object} 400 - Datos inválidos
 * @returns {object} 409 - Usuario ya existe
 */
export const createUser = async (req: Request, res: Response) => {
  // Implementación...
};
```

---

## 🔄 Flujo de Trabajo

### **1. Desarrollo Local**
```bash
# 1. Crear rama para tu feature
git checkout -b feature/mi-nueva-funcionalidad

# 2. Hacer cambios en el código
# 3. Escribir tests para los cambios
# 4. Verificar que todo funciona
npm test
npm run lint
npm run format

# 5. Commit de cambios
git add .
git commit -m "feat: agregar nueva funcionalidad de búsqueda avanzada

- Implementar búsqueda por filtros múltiples
- Agregar validación de parámetros
- Incluir tests unitarios completos
- Documentar nuevos endpoints"
```

### **2. Commit Messages**
```bash
# Formato: <tipo>(<alcance>): <descripción>

# Tipos válidos:
# feat: nueva funcionalidad
# fix: corrección de bug
# docs: cambios en documentación
# style: cambios de formato (no afectan funcionalidad)
# refactor: refactorización de código
# test: agregar o modificar tests
# chore: cambios en build, configuraciones, etc.

# Ejemplos:
git commit -m "feat(auth): agregar autenticación con Google OAuth"
git commit -m "fix(search): corregir búsqueda por ubicación"
git commit -m "docs(api): actualizar documentación de endpoints"
git commit -m "test(events): agregar tests para creación de eventos"
```

### **3. Pull Request**
```bash
# 1. Push de tu rama
git push origin feature/mi-nueva-funcionalidad

# 2. Crear Pull Request en GitHub
# 3. Llenar template de PR
# 4. Esperar review
```

---

## 📋 Template de Pull Request

### **Título**
```
feat: agregar sistema de notificaciones push
```

### **Descripción**
```markdown
## 📝 Descripción
Agregar sistema completo de notificaciones push para eventos en tiempo real.

## 🎯 Cambios Realizados
- [x] Implementar servicio de notificaciones push
- [x] Agregar controlador para gestión de notificaciones
- [x] Crear rutas para envío de notificaciones
- [x] Implementar tests unitarios
- [x] Actualizar documentación

## 🧪 Tests
- [x] Tests unitarios para servicio de notificaciones
- [x] Tests de integración para endpoints
- [x] Tests de validación de datos
- [x] Cobertura de tests: 95%

## 📚 Documentación
- [x] Actualizar README.md
- [x] Documentar nuevos endpoints
- [x] Agregar ejemplos de uso

## 🔍 Checklist
- [x] Código sigue los estándares del proyecto
- [x] Tests pasan al 100%
- [x] Linting sin errores
- [x] TypeScript sin errores
- [x] Documentación actualizada

## 🐛 Problemas Relacionados
Closes #123
```

---

## 🚫 Qué NO Hacer

### **Código**
- ❌ **No usar `any`**: Siempre usar tipos específicos
- ❌ **No dejar console.log**: Usar logger service
- ❌ **No hardcodear valores**: Usar variables de entorno
- ❌ **No ignorar errores**: Manejar todos los casos de error
- ❌ **No duplicar código**: Crear funciones reutilizables

### **Commits**
- ❌ **No hacer commits grandes**: Dividir en commits pequeños
- ❌ **No usar mensajes genéricos**: Ser específico
- ❌ **No mezclar cambios**: Un commit = un cambio
- ❌ **No commitear código roto**: Siempre verificar tests

### **Pull Requests**
- ❌ **No crear PRs sin tests**: Siempre incluir tests
- ❌ **No ignorar feedback**: Responder a todos los comentarios
- ❌ **No mergear sin review**: Esperar aprobación
- ❌ **No romper funcionalidad existente**: Mantener compatibilidad

---

## 🎯 Áreas de Contribución

### **Prioridad Alta**
- 🔥 **Optimización de Performance**: Mejorar velocidad de APIs
- 🔥 **Seguridad**: Implementar medidas de seguridad adicionales
- 🔥 **Testing**: Aumentar cobertura de tests
- 🔥 **Documentación**: Mejorar documentación existente

### **Prioridad Media**
- 📊 **Analytics**: Mejorar sistema de métricas
- 🔍 **Búsqueda**: Optimizar algoritmos de búsqueda
- 💰 **Pagos**: Agregar nuevos gateways de pago
- 📱 **Mobile**: Optimizar APIs para aplicaciones móviles

### **Prioridad Baja**
- 🎨 **UI/UX**: Mejorar interfaces de usuario
- 🌐 **Internacionalización**: Soporte multiidioma
- 🔧 **DevOps**: Mejorar pipeline de CI/CD
- 📈 **Monitoreo**: Agregar herramientas de monitoreo

---

## 🏆 Reconocimiento

### **Contribuidores Destacados**
- 🥇 **Top Contributors**: Reconocimiento en README
- 🏅 **Bug Hunters**: Identificación de bugs críticos
- 📚 **Documentation Heroes**: Mejoras en documentación
- 🧪 **Test Champions**: Aumento de cobertura de tests

### **Proceso de Reconocimiento**
1. **Contribuciones regulares**: Reconocimiento automático
2. **Contribuciones significativas**: Review manual
3. **Impacto en el proyecto**: Evaluación del equipo
4. **Comunidad**: Votación de la comunidad

---

## 📞 Soporte

### **Recursos de Ayuda**
- **[Documentación del Proyecto](docs/)** - Guías completas
- **[API Documentation](docs/api/)** - Documentación de endpoints
- **[Testing Guide](docs/guides/testing-guide.md)** - Guía de testing
- **[Troubleshooting](docs/troubleshooting.md)** - Solución de problemas

### **Comunicación**
- **GitHub Issues**: [Reportar problemas](https://github.com/MussikOn/APP_MussikOn_Express/issues)
- **GitHub Discussions**: [Discutir ideas](https://github.com/MussikOn/APP_MussikOn_Express/discussions)
- **Email**: contribuciones@mussikon.com

### **Código de Conducta**
- **Respeto**: Tratar a todos con respeto
- **Inclusión**: Ser inclusivo con todos los contribuidores
- **Colaboración**: Trabajar en equipo
- **Aprendizaje**: Ayudar a otros a aprender

---

## 🎉 ¡Gracias por Contribuir!

**Tu contribución es valiosa para el proyecto MussikOn API**. Cada línea de código, cada test, cada documentación mejora la plataforma para todos los usuarios.

**Juntos construimos el futuro de la conectividad musical.** 🎵

---

**Fecha de Actualización**: 3 de Agosto, 2025  
**Versión**: 2.0.0  
**Estado**: ✅ **LISTO PARA CONTRIBUCIONES** 