/**
 * js/smooth-reveal.js
 * * Script para implementar el efecto "Smooth Reveal" (aparición suave del contenido)
 * usando Intersection Observer para un rendimiento óptimo.
 */

document.addEventListener('DOMContentLoaded', () => {

    // ====================================================================
    // 1. Smooth Reveal (Aparición suave del contenido) usando Intersection Observer
    // ====================================================================

    // Elementos a observar. Usamos la clase 'scroll-reveal'
    const revealElements = document.querySelectorAll('.scroll-reveal');

    // Opciones del observador
    const observerOptions = {
        // La animación se dispara cuando el 10% del elemento es visible.
        // El rootMargin negativo (-10%) hace que la animación se vea más natural
        // justo antes de que el elemento entre completamente en la vista.
        root: null, // viewport
        rootMargin: '0px 0px -10% 0px', 
        threshold: 0.1
    };

    // Callback que se ejecuta cuando la visibilidad de un elemento cambia
    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Si el elemento es visible, añade la clase 'revealed' para disparar la animación CSS.
                entry.target.classList.add('revealed');
                // Deja de observar una vez revelado para optimizar el rendimiento.
                observer.unobserve(entry.target);
            }
        });
    };

    // Crear y activar el Intersection Observer
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(observerCallback, observerOptions);

        revealElements.forEach(element => {
            // Inicialmente, añade la clase 'reveal-hidden' para asegurar el estado inicial (oculto)
            element.classList.add('reveal-hidden');
            observer.observe(element);
        });
    } else {
        // Fallback simple para navegadores sin soporte: muestra todos los elementos inmediatamente.
        revealElements.forEach(element => {
            element.classList.add('revealed');
        });
    }

    // ====================================================================
    // 2. Smooth Scroll (Desplazamiento suave para enlaces ancla)
    // ====================================================================
    // Nota: La propiedad 'scroll-behavior: smooth' en CSS cubre la mayoría de los casos,
    // pero este script añade un soporte más robusto, especialmente para la manipulación del historial.

    document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            if (this.hash) {
                e.preventDefault();

                const targetElement = document.querySelector(this.hash);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth' // Desplazamiento nativo suave
                    });

                    // Actualiza la URL para reflejar la posición (sin recarga)
                    if (history.pushState) {
                        history.pushState(null, null, this.hash);
                    } else {
                        window.location.hash = this.hash;
                    }
                }
            }
        });
    });
});