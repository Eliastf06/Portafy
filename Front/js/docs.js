/* js/docs.js */
document.addEventListener('DOMContentLoaded', () => {
    // Código para el desplazamiento suave del índice
    const indexLinks = document.querySelectorAll('.docs-index a');

    indexLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault(); // Evita el salto instantáneo

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});