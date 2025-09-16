document.addEventListener('DOMContentLoaded', () => {
    const sideMenuOverlay = document.getElementById('side-menu-overlay');
    const mainContent = document.querySelector('main');
    
    const modals = [sideMenuOverlay];

    window.openModal = (modal) => {
        modals.forEach(m => m?.classList.remove('active'));
        if (modal) {
            modal.classList.add('active');
            document.body.classList.add('modal-open');
            if (mainContent) mainContent.setAttribute('aria-hidden', 'true');
        }
    };

    window.closeModal = (modal) => {
        if (modal) {
            modal.classList.remove('active');
        }
        if (!modals.some(m => m?.classList.contains('active'))) {
            document.body.classList.remove('modal-open');
            if (mainContent) mainContent.removeAttribute('aria-hidden');
        }
    };

    // Evento de apertura
    document.getElementById('menu-toggle-btn')?.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(sideMenuOverlay);
    });

    // Evento de cierre
    document.getElementById('menu-close-btn')?.addEventListener('click', () => closeModal(sideMenuOverlay));


});