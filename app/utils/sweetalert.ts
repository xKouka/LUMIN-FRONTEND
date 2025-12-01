import Swal from 'sweetalert2';

// Configuración global de SweetAlert2 con la paleta Healing Greens
const defaultConfig = {
    confirmButtonColor: '#4B9B6E', // brand-500
    cancelButtonColor: '#dc3545',
    customClass: {
        confirmButton: 'swal-confirm-btn',
        cancelButton: 'swal-cancel-btn',
    },
};

// Alerta de éxito
export const showSuccess = (title: string, text?: string) => {
    return Swal.fire({
        icon: 'success',
        title,
        text,
        ...defaultConfig,
    });
};

// Alerta de error
export const showError = (title: string, text?: string) => {
    return Swal.fire({
        icon: 'error',
        title,
        text,
        ...defaultConfig,
    });
};

// Alerta de advertencia
export const showWarning = (title: string, text?: string) => {
    return Swal.fire({
        icon: 'warning',
        title,
        text,
        ...defaultConfig,
    });
};

// Alerta de información
export const showInfo = (title: string, text?: string) => {
    return Swal.fire({
        icon: 'info',
        title,
        text,
        ...defaultConfig,
    });
};

// Confirmación con botones Sí/No
export const showConfirm = (
    title: string,
    text?: string,
    confirmButtonText: string = 'Sí',
    cancelButtonText: string = 'No'
) => {
    return Swal.fire({
        icon: 'question',
        title,
        text,
        showCancelButton: true,
        confirmButtonText,
        cancelButtonText,
        ...defaultConfig,
    });
};

// Toast (notificación pequeña)
export const showToast = (
    icon: 'success' | 'error' | 'warning' | 'info',
    title: string
) => {
    return Swal.fire({
        toast: true,
        position: 'top-end',
        icon,
        title,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
    });
};
