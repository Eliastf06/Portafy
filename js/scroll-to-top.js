
document.addEventListener('DOMContentLoaded', () => {
    //Obtener el botón
    const btnVolverArriba = document.getElementById('btnVolverArriba');

    // mostrar/ocultar el botón
    const toggleBoton = () => {
        // mostrar el boton cuando el usuario baje 300px
        if (window.scrollY > 300) {
            btnVolverArriba.classList.add('mostrar');
        } else {
            btnVolverArriba.classList.remove('mostrar');
        }
    };

    // subir al inicio de la página suavemente
    const subirArriba = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth' // Esto es lo que permite la subida limpia
        });
    };

    window.addEventListener('scroll', toggleBoton);
    btnVolverArriba.addEventListener('click', subirArriba);

    // corregir el estado si la página se carga desplazada
    toggleBoton();
});