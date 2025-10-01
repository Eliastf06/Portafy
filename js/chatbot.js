// js/chatbot.js

document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('chatbot-toggle');
    const closeButton = document.getElementById('chatbot-close');
    const chatbotWindow = document.getElementById('chatbot-window');
    const messagesContainer = document.getElementById('chatbot-messages');
    const inputField = document.getElementById('chatbot-input');
    const sendButton = document.getElementById('chatbot-send');

    // Estado inicial de la ventana del chatbot
    chatbotWindow.classList.add('hidden');

    // --- Funciones del DOM ---

    // Toggle para abrir/cerrar el chatbot
    toggleButton.addEventListener('click', () => {
        chatbotWindow.classList.toggle('hidden');
        if (!chatbotWindow.classList.contains('hidden')) {
            // Mostrar mensaje de bienvenida al abrir
            if (messagesContainer.children.length === 0) {
                appendMessage('bot', '¡Hola! Soy tu asistente de Portafy. ¿En qué puedo ayudarte hoy? Tengo respuestas sobre la navegación, documentación, temas de color y más.');
            }
            // Enfocar el input
            inputField.focus();
        }
    });

    // Cerrar el chatbot
    closeButton.addEventListener('click', () => {
        chatbotWindow.classList.add('hidden');
    });

    // Añadir mensaje al contenedor
    function appendMessage(sender, text) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);
        messageDiv.textContent = text;
        messagesContainer.appendChild(messageDiv);
        // Desplazamiento automático al final
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // --- Lógica del Chatbot: Base de Conocimiento (Incluye manejo de Insultos) ---

    const knowledgeBase = [
        // 0. MANEJO DE INSULTOS Y LENGUAJE INAPROPIADO (NUEVO)
        { 
            keywords: ['tonto', 'estupido', 'idiota', 'mierda', 'puto', 'imbecil', 'cabron', 'joder', 'coño', 'gilipollas', 'pendejo', 'chinga', 'groseria', 'obscena', 'maldito', 'feo'], 
            response: 'Agradezco que mantengas un lenguaje profesional. Estoy aquí para ayudarte con preguntas sobre Portafy, no para responder a ofensas. Por favor, reformula tu pregunta de manera respetuosa.' 
        },

        // 1. Saludos y Cierres
        { 
            keywords: ['hola', 'saludo', 'buenos dias', 'que tal'], 
            response: '¡Hola! Soy tu Asistente Portafy. ¿En qué puedo ayudarte hoy?' 
        },
        { 
            keywords: ['gracias', 'adios', 'chao', 'hasta luego'], 
            response: '¡De nada! Me alegra haberte ayudado. ¡Que tengas un gran día creando tu portafolio!' 
        },
        // 2. Core: Creación de Portafolio
        { 
            keywords: ['portafolio', 'crear', 'hacer uno', 'mi portafolio', 'empezar'], 
            response: 'Para **crear tu portafolio**, ve a la página principal (`main.html`) y busca el botón de creación. Es un proceso guiado y muy simple.' 
        },
        // 3. Páginas de Navegación
        { 
            keywords: ['documentacion', 'docs', 'ayuda tecnica', 'ver manual'], 
            response: 'La **Documentación** está en `docs.html`. Ahí encontrarás guías detalladas, estructuras de archivos y detalles técnicos del proyecto.' 
        },
        { 
            keywords: ['ayuda', 'soporte', 'contacto', 'problema', 'emergencia', 'reportar'], 
            response: 'Si necesitas ayuda, visita la página de **Ayuda** (`help.html`) o contacta a soporte a través de los enlaces en el pie de página.' 
        },
        { 
            keywords: ['perfil', 'mi cuenta', 'editar perfil', 'ajustes', 'informacion'], 
            response: 'Puedes acceder y gestionar tu información, foto y ajustes en la página de **Perfil** (`profile.html`).' 
        },
        { 
            keywords: ['descubrir', 'proyectos', 'ver otros', 'explorar', 'inspiracion'], 
            response: 'Para explorar portafolios de otros usuarios e inspirarte, visita la página **Descubre Portafolios** (`index.html`).' 
        },
        { 
            keywords: ['main.html', 'inicio', 'casa', 'dashboard'], 
            response: 'La página principal es `main.html`. Es el *dashboard* o centro de inicio donde gestionas tu portafolio.' 
        },
        // 4. Tema y Diseño
        { 
            keywords: ['tema', 'color', 'oscuro', 'claro', 'modo', 'neón', 'luna', 'sol'], 
            response: 'Portafy soporta **Modo Claro** y **Modo Oscuro** (Temática Neón). Usa el interruptor de luna/sol en el encabezado para cambiar el tema.' 
        },
        { 
            keywords: ['diseño', 'estilo', 'aspecto', 'se ve'], 
            response: 'Nuestro diseño se basa en una temática **Neón**, con colores vibrantes que dan un toque moderno, especialmente en el Modo Oscuro.' 
        },
        { 
            keywords: ['responsivo', 'movil', 'tablet', 'responsive', 'celular', 'adaptable'], 
            response: '¡Sí! Todas las páginas son **responsivas** (adaptables) para asegurar una experiencia suave y progresiva en dispositivos móviles y de escritorio.' 
        },
        { 
            keywords: ['acento', 'accent color', 'amarillo', 'brillo'], 
            response: 'El color de acento principal es un llamativo amarillo neón, definido por `--clr-light-accent` (claro) y `--clr-dark-accent` (oscuro) en los archivos CSS.' 
        },
        // 5. Estructura y Desarrollo
        { 
            keywords: ['estructura archivos', 'carpetas', 'donde estan', 'organizacion'], 
            response: 'La estructura de archivos es: HTML en la carpeta principal; **CSS** en `css/`; y **JavaScript** en `js/`.' 
        },
        { 
            keywords: [':root', 'variables', 'colores', 'cambiar colores', 'personalizar'], 
            response: 'La personalización de colores se hace fácilmente modificando las variables CSS dentro del bloque **`:root`** en los archivos `.css`, como `style.css`.' 
        },
        { 
            keywords: ['lenguaje programacion', 'tecnologias', 'stack', 'framework'], 
            response: 'La plataforma está construida con tecnologías web estándar: **HTML**, **CSS** (con variables) y **JavaScript** puro.' 
        },
        { 
            keywords: ['descargar', 'codigo', 'repositorio', 'archivos'], 
            response: 'El código fuente, una vez descargado, debe ser manipulado respetando la estructura de carpetas `css/` y `js/`.' 
        },
        // 6. Funcionalidad
        { 
            keywords: ['como editar', 'cambiar info', 'formulario', 'actualizar'], 
            response: 'La edición de tu perfil o portafolio se gestiona con los botones y formularios de **"Editar"** que encontrarás en `profile.html` o `main.html`.' 
        },
        { 
            keywords: ['loading', 'carga', 'spinner', 'pantalla de carga', 'lentitud'], 
            response: 'El *spinner* (`loading-overlay`) solo aparece en páginas como `index.html` para una mejor experiencia mientras cargan los proyectos.' 
        },
        { 
            keywords: ['que es un portafolio', 'definicion', 'concepto'], 
            response: 'Un portafolio en Portafy es tu espacio digital para mostrar de manera profesional y estética tus proyectos, habilidades y experiencia.' 
        },
        // 7. Información Corporativa / Legal
        { 
            keywords: ['que es portafy', 'nombre', 'significado', 'plataforma', 'empresa'], 
            response: '**Portafy** es una plataforma para crear y gestionar tu portafolio profesional de forma simple, enfocada en un diseño estético y moderno.' 
        },
        { 
            keywords: ['mision', 'objetivo', 'proposito'], 
            response: 'Nuestro objetivo es simplificar la creación de portafolios, ofreciendo herramientas sencillas y un diseño estético y moderno de temática Neón.' 
        },
        { 
            keywords: ['version', 'año', 'copyright', 'derechos'], 
            response: 'El copyright actual de Portafy es **© 2025**. Todos los derechos están reservados según lo indicado en el pie de página.' 
        },
        { 
            keywords: ['cookies', 'privacidad', 'legal', 'terminos'], 
            response: 'No tengo la política legal completa. Por favor, revisa los enlaces de **Política de Privacidad** y **Términos de Servicio** en el pie de página para detalles legales.' 
        },
        // 8. Componentes de la Web
        { 
            keywords: ['header', 'encabezado', 'barra superior'], 
            response: 'El encabezado (`main-header`) contiene el logo, el botón de cambio de tema y la navegación principal (Principal, Descubrir, Documentación, Ayuda).' 
        },
        { 
            keywords: ['footer', 'pie de pagina', 'fondo'], 
            response: 'El pie de página (`footer`) incluye enlaces de navegación, nuestros perfiles de redes sociales y el aviso de copyright.' 
        },
        { 
            keywords: ['sociales', 'redes', 'facebook', 'twitter', 'x.com', 'instagram', 'linkedin'], 
            response: 'Puedes seguirnos en todas las redes: Facebook, X (Twitter), Instagram y LinkedIn. Los enlaces están disponibles en el **pie de página**.' 
        },
        { 
            keywords: ['icono', 'logo', 'imagen', 'multimedia'], 
            response: 'El logo de Portafy está en `multimedia/logo.png`. Los iconos utilizados son de la librería **Font Awesome 6**.' 
        },
        // 9. Misc
        { 
            keywords: ['es gratis', 'costo', 'pago', 'cuanto cuesta'], 
            response: 'Asumo que la plataforma es de acceso libre para la creación de portafolios básicos. Revisa la documentación (`docs.html`) para detalles sobre licencias o planes de pago.' 
        },
        { 
            keywords: ['usuario', 'login', 'registro', 'sesion'], 
            response: 'Si tienes problemas de *login* o registro, visita la sección de ayuda para una guía de solución de problemas.' 
        },
        { 
            keywords: ['tutorial', 'guia', 'pasos', 'como se hace'], 
            response: 'En la sección de **Ayuda** (`help.html`) y **Documentación** (`docs.html`) encontrarás guías paso a paso para la mayoría de las funcionalidades.' 
        },
        { 
            keywords: ['como contribuir', 'colaborar', 'trabajar'], 
            response: 'Por el momento, Portafy es un proyecto cerrado. No tenemos un sistema de contribución o colaboración de código abierto.' 
        },
        { 
            keywords: ['error', 'bug', 'falla'], 
            response: 'Si encuentras un error o fallo, por favor repórtalo en la página de **Ayuda** (`help.html`) para que podamos solucionarlo rápidamente.' 
        },
        {
            keywords: ['responsividad suave', 'transicion'],
            response: 'La responsividad es **suave y progresiva**, lo que significa que el diseño se adapta de forma fluida a cualquier tamaño de pantalla (desktop, tablet, móvil) sin saltos bruscos.'
        },
        {
            keywords: ['copiar', 'reemplazar', 'codigo completo'],
            response: 'Siempre proporcionamos los códigos **completos** de los archivos para que puedas copiar y reemplazar el contenido existente de forma sencilla, manteniendo la estructura de carpetas.'
        }
    ];

    // Función principal para obtener la respuesta del bot
    function getBotResponse(userInput) {
        const cleanedInput = userInput.toLowerCase().trim();

        // Buscar en la base de conocimiento
        for (const item of knowledgeBase) {
            for (const keyword of item.keywords) {
                if (cleanedInput.includes(keyword)) {
                    return item.response;
                }
            }
        }

        // Respuesta por defecto si no se encuentra nada
        return "Disculpa, no entendí tu pregunta. Soy un asistente básico con respuestas predefinidas. Intenta reformular tu pregunta usando palabras clave sobre la **Documentación**, tu **Perfil**, el **Diseño** (neón, oscuro), o **Ayuda**.";
    }

    // Función para manejar el envío de mensajes
    function handleSendMessage() {
        const userInput = inputField.value.trim();

        if (userInput === '') {
            return; // No enviar mensajes vacíos
        }

        // 1. Mostrar mensaje del usuario
        appendMessage('user', userInput);

        // 2. Obtener y mostrar respuesta del bot (con un pequeño retraso para simular "pensar")
        const botResponse = getBotResponse(userInput);
        
        setTimeout(() => {
            appendMessage('bot', botResponse);
        }, 500); // Retraso de 0.5 segundos

        // 3. Limpiar el input
        inputField.value = '';
    }

    // Eventos de envío de mensaje
    sendButton.addEventListener('click', handleSendMessage);
    inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    });

    // Observador para cambios de tema (depende del script de tema principal)
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class' && mutation.target === document.body) {
                // El CSS maneja la transición de colores del chatbot gracias a las variables CSS.
            }
        });
    });

    // Observar cambios en el atributo 'class' del body
    observer.observe(document.body, { attributes: true });
});