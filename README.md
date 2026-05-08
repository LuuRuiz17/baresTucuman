# Bares Tucumán

Proyecto desarrollado como prueba técnica para automatizar la carga y administración de bares de Tucumán.

La aplicación está compuesta por dos partes principales:

* una API REST construida con Express y conectada a Supabase
* un script de sincronización automática que procesa un dataset mock y evita duplicados exactos antes de insertar registros

---

# Funcionalidades

* crear bares en Supabase
* listar únicamente bares activos
* editar registros existentes
* desactivar bares sin eliminarlos físicamente
* registrar historial de cambios
* sincronizar datos automáticamente desde `data/bares.json`
* detectar duplicados exactos mediante nombres normalizados
* informar posibles duplicados por similitud durante la sincronización

---

# Tecnologías utilizadas

* Node.js
* Express
* Supabase
* JavaScript

---

# Detección de duplicados

El sistema utiliza una normalización de nombres para mejorar la calidad de los datos y evitar registros repetidos.

Antes de comparar, los nombres:

* se convierten a minúsculas
* se eliminan acentos
* se eliminan caracteres especiales
* se normalizan espacios

Ejemplo:

```txt
"Café del Norte"
"cafe-del norte"
"CAFE DEL NORTE"
```

Todos terminan representándose de la misma forma normalizada.

Esto permite detectar duplicados exactos aunque el texto original tenga diferencias de formato.

Además, durante la sincronización se realiza una comparación por similitud para informar posibles coincidencias en consola. Estas coincidencias no bloquean la inserción automáticamente.

---

# Instalación

Instalar dependencias:

```bash
npm install
```

---

# Ejecutar la API

```bash
node src/server.js
```

Si todo funciona correctamente, se mostrará:

```bash
Servidor corriendo en http://localhost:3000
```

---

# Endpoints disponibles

## Obtener bares activos

```http
GET /bares
```

## Crear un bar

```http
POST /bares
```

## Actualizar un bar

```http
PUT /bares/:id
```

## Desactivar un bar

```http
DELETE /bares/:id
```

## Obtener historial de cambios

```http
GET /historial
```

---

# Sincronización automática

Para ejecutar la carga automática desde el dataset mock:

```bash
node src/sync.js
```

El script procesa los registros de `data/bares.json` y construye cada objeto con los siguientes campos:

* `nombre`
* `ubicacion`
* `categoria`
* `fuente`
* `fechaObtencion`
* `activo`

Antes de insertar un registro, el sistema:

* normaliza el nombre
* verifica duplicados dentro del mismo lote
* verifica duplicados existentes en Supabase
* evita insertar registros duplicados exactos
* registra trazabilidad en `historial_bares`

Durante el proceso también se muestran por consola posibles coincidencias por similitud entre nombres.

---

# Dataset

El proyecto utiliza actualmente un dataset mock ubicado en:

```txt
data/bares.json
```

Cada registro puede incluir:

* `categoria`
* `fuente`
* `fechaObtencion`

Si algún campo no está presente, el sistema completa valores por defecto.

---

# Estructura de tablas en Supabase

## Tabla: `baresTucuman`

| Campo          | Tipo      |
| -------------- | --------- |
| id             | integer   |
| nombre         | text      |
| ubicacion      | text      |
| categoria      | text      |
| fuente         | text      |
| fechaObtencion | timestamp |
| activo         | boolean   |

---

## Tabla: `historial_bares`

| Campo  | Tipo      |
| ------ | --------- |
| id     | integer   |
| bar_id | integer   |
| accion | text      |
| datos  | json/text |
| fecha  | timestamp |

---

# Consideraciones

* el proyecto utiliza Supabase con RLS habilitado
* las policies deben permitir `select`, `insert` y `update`
* las operaciones de alta y actualización validan duplicados exactos mediante nombre normalizado
* el dataset actual es mock, pero la estructura permite reemplazarlo más adelante por scraping o APIs reales

## 🔀 Flujo de colaboración y Pull Requests

Para simular un entorno de trabajo colaborativo, se agregué un colaborador al repositorio y realicé un flujo de Pull Request (PR) con revisión y aprobación antes del merge a la rama principal.

Esto permitió validar:

- Flujo de revisión de cambios
- Aprobación de PR
- Integración controlada de nuevas funcionalidades