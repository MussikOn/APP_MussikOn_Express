# Manejo de Errores en MusikOn API

## Middleware Global de Errores
- Todos los errores no capturados en los controladores son manejados por un middleware global implementado en `index.ts`.
- Las respuestas de error tienen la forma:
```json
{
  "msg": "Descripción del error",
  "error": {}
}
```
- Ejemplo de implementación:
```ts
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ msg: err.message || 'Error interno', error: err });
});
```
- Si ocurre un error no manejado en cualquier parte del backend, este middleware lo capturará y enviará una respuesta consistente al frontend.

## Buenas Prácticas
- No exponer detalles internos ni stack traces en producción.
- Usar mensajes claros y consistentes para el frontend.
- Documentar los posibles errores de cada endpoint en Swagger.

## Cómo agregar nuevos errores personalizados
- Lanza un error con `throw new Error('Mensaje')` o usa un objeto con `status` y `message`.
- El middleware global se encargará de la respuesta.

---

Consulta este archivo antes de modificar el manejo de errores para mantener la consistencia en toda la API. 