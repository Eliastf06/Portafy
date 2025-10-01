// js/scroll-to-top.js

document.addEventListener('DOMContentLoaded', () => {
    // 1. Obtener el botón
    const btnVolverArriba = document.getElementById('btnVolverArriba');

    // 2. Lógica para mostrar/ocultar el botón
    const toggleBoton = () => {
        // El botón se mostrará cuando el usuario haya bajado más de 300 píxeles
        if (window.scrollY > 300) {
            btnVolverArriba.classList.add('mostrar');
        } else {
            btnVolverArriba.classList.remove('mostrar');
        }
    };

    // 3. Lógica para subir al inicio de la página suavemente
    const subirArriba = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth' // Esto es lo que permite la subida suave y limpia
        });
    };

    // Eventos
    window.addEventListener('scroll', toggleBoton);
    btnVolverArriba.addEventListener('click', subirArriba);

    // Llamada inicial para corregir el estado si la página se carga desplazada
    toggleBoton();
});