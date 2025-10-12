document.addEventListener('DOMContentLoaded', () => {

    // Lógica para la sección de FAQ y la barra de búsqueda
    const faqSearchInput = document.getElementById('faq-search');
    const faqItems = document.querySelectorAll('.faq-item');
    const categoryFilters = document.querySelectorAll('.category-filter');
    const faqContainer = document.querySelector('.faq-container');

    const filterFAQs = (query, category) => {
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question').textContent.toLowerCase();
            const answer = item.querySelector('.faq-answer').textContent.toLowerCase();
            const matchesQuery = question.includes(query) || answer.includes(query);
            const matchesCategory = category === 'all' || item.dataset.category === category;

            if (matchesQuery && matchesCategory) {
                item.style.display = 'block';
                if (query.length > 0) {
                    item.querySelector('details').setAttribute('open', '');
                } else {
                    item.querySelector('details').removeAttribute('open');
                }
            } else {
                item.style.display = 'none';
            }
        });
    };

    let currentCategory = 'all';

    faqSearchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        filterFAQs(query, currentCategory);
    });

    categoryFilters.forEach(filter => {
        filter.addEventListener('click', (e) => {
            categoryFilters.forEach(f => f.classList.remove('active'));
            e.target.classList.add('active');
            currentCategory = e.target.dataset.dataset.category;
            const query = faqSearchInput.value.toLowerCase();
            filterFAQs(query, currentCategory);
        });
    });

    // Lógica para el Formulario de Contacto
    const contactForm = document.getElementById('contactForm');
    const formMessage = document.getElementById('form-message');

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault(); 

        const name = document.getElementById('contact-name').value.trim();
        const email = document.getElementById('contact-email').value.trim();
        const contactType = document.getElementById('contact-type').value;
        const message = document.getElementById('contact-message').value.trim();

        if (name === '' || email === '' || message === '') {
            formMessage.textContent = 'Por favor, completa todos los campos obligatorios.';
            formMessage.style.color = 'red';
            return;
        }

        const subject = `Consulta sobre Portafy - Tipo: ${contactType}`;
        const body = `Nombre: ${name}\nCorreo: ${email}\n\nMensaje:\n${message}`;

        const mailtoLink = `mailto:trabajomio2116@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        window.location.href = mailtoLink;

        formMessage.textContent = 'Tu cliente de correo se abrirá en breve.';
        formMessage.style.color = 'green';
    });
});