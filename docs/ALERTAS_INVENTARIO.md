# 📋 Inventario de Alertas SweetAlert2

Este documento lista todas las alertas de SweetAlert2 implementadas en el proyecto.

## 📍 Ubicaciones de Alertas

### 1️⃣ **Gestión de Clientes** 
**Archivo:** [`app/dashboard/cliente/page.tsx`](file:///c:/Users/oagui/Documents/GitHub/ClinicaBlancaTrinidad/blancatrinidad/app/dashboard/cliente/page.tsx)

| Línea | Tipo | Función | Mensaje |
|-------|------|---------|---------|
| 35 | Confirmación | `showConfirm()` | "¿Eliminar cliente?" |
| 48 | Éxito | `showSuccess()` | "Cliente eliminado" |
| 50 | Error | `showError()` | "Error al eliminar" |

**Contexto:** Eliminación de clientes con confirmación y notificaciones de resultado.

---

### 2️⃣ **Gestión de Pacientes**
**Archivo:** [`app/dashboard/admin/pacientes/page.tsx`](file:///c:/Users/oagui/Documents/GitHub/ClinicaBlancaTrinidad/blancatrinidad/app/dashboard/admin/pacientes/page.tsx)

| Línea | Tipo | Función | Mensaje |
|-------|------|---------|---------|
| 82 | Confirmación | `showConfirm()` | "¿Eliminar paciente?" |
| 95 | Éxito | `showSuccess()` | "Paciente eliminado" |
| 97 | Error | `showError()` | "Error al eliminar" |

**Contexto:** Eliminación de pacientes con confirmación y notificaciones de resultado.

---

### 3️⃣ **Gestión de Inventario**
**Archivo:** [`app/dashboard/admin/inventario/page.tsx`](file:///c:/Users/oagui/Documents/GitHub/ClinicaBlancaTrinidad/blancatrinidad/app/dashboard/admin/inventario/page.tsx)

| Línea | Tipo | Función | Mensaje |
|-------|------|---------|---------|
| 74 | Confirmación | `showConfirm()` | "¿Eliminar producto?" |
| 87 | Éxito | `showSuccess()` | "Producto eliminado" |
| 89 | Error | `showError()` | "Error al eliminar" |

**Contexto:** Eliminación de productos de inventario con confirmación y notificaciones.

---

### 4️⃣ **Gestión de Muestras (Lista)**
**Archivo:** [`app/dashboard/admin/muestras/page.tsx`](file:///c:/Users/oagui/Documents/GitHub/ClinicaBlancaTrinidad/blancatrinidad/app/dashboard/admin/muestras/page.tsx)

| Línea | Tipo | Función | Mensaje |
|-------|------|---------|---------|
| 76 | Confirmación | `showConfirm()` | "¿Eliminar muestra?" |
| 89 | Éxito | `showSuccess()` | "Muestra eliminada" |
| 91 | Error | `showError()` | "Error al eliminar" |

**Contexto:** Eliminación de muestras con confirmación y notificaciones de resultado.

---

### 5️⃣ **Detalles de Muestra (PDF)**
**Archivo:** [`app/dashboard/admin/muestras/[id]/page.tsx`](file:///c:/Users/oagui/Documents/GitHub/ClinicaBlancaTrinidad/blancatrinidad/app/dashboard/admin/muestras/%5Bid%5D/page.tsx)

| Línea | Tipo | Función | Mensaje |
|-------|------|---------|---------|
| 61 | Error | `showError()` | "Error al generar PDF" |

**Contexto:** Error al descargar PDF de muestra.

---

## 📊 Resumen Estadístico

| Tipo de Alerta | Cantidad | Archivos |
|----------------|----------|----------|
| **Confirmaciones** (`showConfirm`) | 4 | 4 archivos |
| **Éxito** (`showSuccess`) | 4 | 4 archivos |
| **Error** (`showError`) | 5 | 5 archivos |
| **Advertencia** (`showWarning`) | 0 | - |
| **Info** (`showInfo`) | 0 | - |
| **Toast** (`showToast`) | 0 | - |
| **TOTAL** | **13 alertas** | **5 archivos** |

---

## 🎯 Patrones de Uso

### Patrón 1: Eliminación con Confirmación
**Usado en:** Clientes, Pacientes, Inventario, Muestras

```typescript
const result = await showConfirm(
  '¿Eliminar [recurso]?',
  '¿Estás seguro de que deseas eliminar este [recurso]? Esta acción no se puede deshacer.',
  'Sí, eliminar',
  'Cancelar'
);

if (!result.isConfirmed) return;

try {
  await api.delete(`/[endpoint]/${id}`);
  showSuccess('[Recurso] eliminado', 'El [recurso] ha sido eliminado correctamente');
} catch (err: any) {
  showError('Error al eliminar', err.response?.data?.error || 'No se pudo eliminar el [recurso]');
}
```

### Patrón 2: Error en Operación
**Usado en:** Descarga de PDF

```typescript
try {
  // operación
} catch (err: any) {
  showError('Error al generar PDF', err.response?.data?.error || 'No se pudo generar el archivo PDF');
}
```

---

## 🔧 Utilidades Disponibles (No Usadas Aún)

Las siguientes funciones están disponibles pero no se usan actualmente:

- ✅ `showWarning()` - Para advertencias
- ✅ `showInfo()` - Para información
- ✅ `showToast()` - Para notificaciones rápidas

### Sugerencias de Uso Futuro:

**showWarning:**
```typescript
// Validación de formularios
showWarning('Formulario incompleto', 'Por favor completa todos los campos requeridos');
```

**showInfo:**
```typescript
// Información general
showInfo('Actualización programada', 'El sistema se actualizará en 5 minutos');
```

**showToast:**
```typescript
// Guardado rápido
showToast('success', 'Guardado correctamente');
```

---

## 📁 Archivo de Utilidades

**Ubicación:** [`app/utils/sweetalert.ts`](file:///c:/Users/oagui/Documents/GitHub/ClinicaBlancaTrinidad/blancatrinidad/app/utils/sweetalert.ts)

Este archivo contiene todas las funciones de SweetAlert2 configuradas con la paleta **Healing Greens** del proyecto.

---

## 🎨 Configuración de Colores

- **Botón Confirmar:** `#4B9B6E` (brand-500)
- **Botón Cancelar:** `#dc3545` (rojo)

---

## 📖 Documentación

Para más información sobre cómo usar SweetAlert2 en este proyecto, consulta:
- [`docs/SWEETALERT2.md`](file:///c:/Users/oagui/Documents/GitHub/ClinicaBlancaTrinidad/blancatrinidad/docs/SWEETALERT2.md)
