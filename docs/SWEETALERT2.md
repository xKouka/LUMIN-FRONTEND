# SweetAlert2 - Guía de Uso

Este proyecto utiliza **SweetAlert2** para mostrar alertas y notificaciones elegantes en lugar de las alertas nativas del navegador.

## 📦 Instalación

La librería ya está instalada en el proyecto:

```bash
npm install sweetalert2
```

## 🎨 Utilidades Disponibles

Todas las funciones de SweetAlert2 están centralizadas en `app/utils/sweetalert.ts` con la paleta de colores **Healing Greens** del proyecto.

### Importar las utilidades

```typescript
import { showSuccess, showError, showWarning, showInfo, showConfirm, showToast } from '@/app/utils/sweetalert';
```

## 📚 Funciones Disponibles

### 1. **showSuccess** - Alerta de Éxito

```typescript
showSuccess('¡Operación exitosa!', 'Los datos se guardaron correctamente');
```

### 2. **showError** - Alerta de Error

```typescript
showError('Error al guardar', 'No se pudo completar la operación');
```

### 3. **showWarning** - Alerta de Advertencia

```typescript
showWarning('Atención', 'Esta acción requiere confirmación');
```

### 4. **showInfo** - Alerta de Información

```typescript
showInfo('Información', 'Los datos se actualizarán en 5 minutos');
```

### 5. **showConfirm** - Confirmación con Sí/No

```typescript
const result = await showConfirm(
  '¿Eliminar registro?',
  '¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer.',
  'Sí, eliminar',
  'Cancelar'
);

if (result.isConfirmed) {
  // Usuario confirmó
  await eliminarRegistro();
}
```

### 6. **showToast** - Notificación Toast (pequeña)

```typescript
showToast('success', 'Guardado correctamente');
showToast('error', 'Error al guardar');
showToast('warning', 'Advertencia');
showToast('info', 'Información');
```

## 🎯 Ejemplos de Uso Real

### Ejemplo 1: Eliminar con confirmación

```typescript
const handleEliminar = async (id: number) => {
  const result = await showConfirm(
    '¿Eliminar paciente?',
    '¿Estás seguro de que deseas eliminar este paciente? Esta acción no se puede deshacer.',
    'Sí, eliminar',
    'Cancelar'
  );

  if (!result.isConfirmed) return;

  try {
    await api.delete(`/pacientes/${id}`);
    showSuccess('Paciente eliminado', 'El paciente ha sido eliminado correctamente');
  } catch (err: any) {
    showError('Error al eliminar', err.response?.data?.error || 'No se pudo eliminar el paciente');
  }
};
```

### Ejemplo 2: Guardar con notificación

```typescript
const handleGuardar = async (datos: any) => {
  try {
    await api.post('/pacientes', datos);
    showToast('success', 'Paciente guardado correctamente');
  } catch (err: any) {
    showError('Error al guardar', err.response?.data?.error || 'No se pudo guardar el paciente');
  }
};
```

### Ejemplo 3: Validación con advertencia

```typescript
const handleSubmit = async () => {
  if (!formularioValido) {
    showWarning('Formulario incompleto', 'Por favor completa todos los campos requeridos');
    return;
  }
  
  // Continuar con el envío
};
```

## 🎨 Personalización

Los colores están configurados en `app/utils/sweetalert.ts`:

- **Botón Confirmar**: `#4B9B6E` (brand-500 - Healing Greens)
- **Botón Cancelar**: `#dc3545` (rojo)

Si necesitas cambiar los colores, edita el archivo `app/utils/sweetalert.ts`.

## 📖 Documentación Oficial

Para más opciones y personalizaciones avanzadas, consulta la [documentación oficial de SweetAlert2](https://sweetalert2.github.io/).

## ✅ Archivos Actualizados

Los siguientes archivos ya están usando SweetAlert2:

- ✅ `app/dashboard/admin/muestras/page.tsx`
- ✅ `app/dashboard/admin/muestras/[id]/page.tsx`
- ✅ `app/dashboard/admin/pacientes/page.tsx`
- ✅ `app/dashboard/admin/inventario/page.tsx`
- ✅ `app/dashboard/cliente/page.tsx`

## 🚀 Migración de Alertas Nativas

Para migrar alertas nativas a SweetAlert2:

**Antes:**
```typescript
alert('Error al guardar');
```

**Después:**
```typescript
showError('Error al guardar', 'Descripción del error');
```

**Antes:**
```typescript
if (confirm('¿Estás seguro?')) {
  // acción
}
```

**Después:**
```typescript
const result = await showConfirm('¿Estás seguro?', 'Descripción');
if (result.isConfirmed) {
  // acción
}
```
