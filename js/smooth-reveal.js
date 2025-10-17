document.addEventListener('DOMContentLoaded', () => {
    // Usamos la clase 'scroll-reveal'
    const revealElements = document.querySelectorAll('.scroll-reveal');

    // Opciones del observador
    const observerOptions = {
        root: null,
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
    
    document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            if (this.hash) {
                e.preventDefault();

                const targetElement = document.querySelector(this.hash);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth'
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
