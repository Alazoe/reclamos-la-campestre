// Estado de la aplicación
const appState = {
    eggType: '',
    lote: '',
    fechaVenc: '',
    lugarCompra: '',
    problemType: '',
    descripcion: '',
    foto: null,
    fotoBase64: '',
    nombre: '',
    email: '',
    telefono: '',
    comuna: ''
};

// URL de tu Google Apps Script (la configuraremos después)
const SCRIPT_URL = 'TU_URL_DE_GOOGLE_APPS_SCRIPT_AQUI';

// Navegación entre pantallas
function goToScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
    window.scrollTo(0, 0);
}

// Seleccionar tipo de huevo
function selectEggType(type) {
    appState.eggType = type;
    
    // Marcar visualmente
    document.querySelectorAll('.egg-card').forEach(card => {
        card.classList.remove('selected');
    });
    event.target.closest('.egg-card').classList.add('selected');
    
    // Avanzar automáticamente después de un momento
    setTimeout(() => {
        goToScreen('screen-product-info');
    }, 300);
}

// Seleccionar tipo de problema
function selectProblem(type) {
    appState.problemType = type;
    
    // Marcar visualmente
    document.querySelectorAll('.problem-card').forEach(card => {
        card.classList.remove('selected');
    });
    event.target.closest('.problem-card').classList.add('selected');
    
    // Avanzar automáticamente después de un momento
    setTimeout(() => {
        goToScreen('screen-details');
    }, 300);
}

// Preview de la foto
function previewPhoto(input) {
    const preview = document.getElementById('photo-preview');
    const uploadText = document.getElementById('upload-text');
    
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            appState.fotoBase64 = e.target.result;
            preview.innerHTML = `<img src="${e.target.result}" alt="Vista previa">`;
            uploadText.textContent = '✓ Foto cargada - Toca para cambiar';
        };
        
        reader.readAsDataURL(input.files[0]);
        appState.foto = input.files[0];
    }
}

// Validar email
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Enviar reclamo
async function submitComplaint() {
    // Capturar datos del formulario
    appState.lote = document.getElementById('lote').value;
    appState.fechaVenc = document.getElementById('fecha-venc').value;
    appState.lugarCompra = document.getElementById('lugar-compra').value;
    appState.descripcion = document.getElementById('descripcion').value;
    appState.nombre = document.getElementById('nombre').value;
    appState.email = document.getElementById('email').value;
    appState.telefono = document.getElementById('telefono').value;
    appState.comuna = document.getElementById('comuna').value;
    
    // Validaciones
    if (!appState.nombre || !appState.email || !appState.telefono || !appState.descripcion) {
        alert('Por favor completa todos los campos obligatorios (*)');
        return;
    }
    
    if (!isValidEmail(appState.email)) {
        alert('Por favor ingresa un email válido');
        return;
    }
    
    // Deshabilitar botón y mostrar loading
    const submitBtn = document.getElementById('btn-submit');
    const submitText = document.getElementById('submit-text');
    const submitLoading = document.getElementById('submit-loading');
    
    submitBtn.disabled = true;
    submitText.style.display = 'none';
    submitLoading.style.display = 'inline';
    
    try {
        // Generar número de reclamo
        const numeroReclamo = 'LC-' + Date.now().toString().slice(-8);
        
        // Preparar datos para enviar
        const data = {
            numeroReclamo: numeroReclamo,
            fecha: new Date().toLocaleString('es-CL'),
            eggType: appState.eggType,
            lote: appState.lote || 'No proporcionado',
            fechaVenc: appState.fechaVenc || 'No proporcionado',
            lugarCompra: appState.lugarCompra,
            problemType: appState.problemType,
            descripcion: appState.descripcion,
            fotoBase64: appState.fotoBase64,
            nombre: appState.nombre,
            email: appState.email,
            telefono: appState.telefono,
            comuna: appState.comuna || 'No proporcionado'
        };
        
        // Enviar a Google Apps Script
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        // Mostrar confirmación
        document.getElementById('numero-reclamo').textContent = numeroReclamo;
        goToScreen('screen-confirmation');
        
        // Limpiar estado
        resetApp();
        
    } catch (error) {
        console.error('Error al enviar:', error);
        alert('Hubo un error al enviar tu reclamo. Por favor intenta nuevamente.');
        
        // Rehabilitar botón
        submitBtn.disabled = false;
        submitText.style.display = 'inline';
        submitLoading.style.display = 'none';
    }
}

// Resetear la aplicación
function resetApp() {
    Object.keys(appState).forEach(key => {
        appState[key] = '';
    });
    appState.foto = null;
    
    // Limpiar formularios
    document.querySelectorAll('input, textarea, select').forEach(field => {
        field.value = '';
    });
    
    // Limpiar preview de foto
    document.getElementById('photo-preview').innerHTML = '';
    document.getElementById('upload-text').textContent = '📷 Tomar o seleccionar foto';
    
    // Quitar selecciones
    document.querySelectorAll('.selected').forEach(el => {
        el.classList.remove('selected');
    });
    
    // Rehabilitar botón
    const submitBtn = document.getElementById('btn-submit');
    const submitText = document.getElementById('submit-text');
    const submitLoading = document.getElementById('submit-loading');
    submitBtn.disabled = false;
    submitText.style.display = 'inline';
    submitLoading.style.display = 'none';
}

// Service Worker para funcionalidad offline (opcional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('Service Worker registrado'))
            .catch(err => console.log('Error al registrar Service Worker:', err));
    });
}
