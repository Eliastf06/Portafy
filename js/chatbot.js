
document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('chatbot-toggle');
    const closeButton = document.getElementById('chatbot-close');
    const chatbotWindow = document.getElementById('chatbot-window');
    const messagesContainer = document.getElementById('chatbot-messages');
    const inputField = document.getElementById('chatbot-input');
    const sendButton = document.getElementById('chatbot-send');

    chatbotWindow.classList.add('hidden');

    // Toggle para abrir/cerrar el chatbot
    toggleButton.addEventListener('click', () => {
        chatbotWindow.classList.toggle('hidden');
        if (!chatbotWindow.classList.contains('hidden')) {
            if (messagesContainer.children.length === 0) {
                appendMessage('bot', '¡Hola! Soy tu asistente de Portafy. ¿En qué puedo ayudarte hoy? Tengo respuestas sobre la navegación, documentación, temas de color y más. Te agradeceria que no tengas errores de ortografia y no insultes, Gracias');
            }
            inputField.focus();
        }
    });

    closeButton.addEventListener('click', () => {
        chatbotWindow.classList.add('hidden');
    });

    function appendMessage(sender, text) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);

        // Procesar el texto para negritas
        const processedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // innerHTML para renderizar el <strong>, porque que es contenido controlado.
        messageDiv.innerHTML = processedText;
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    const knowledgeBase = [
        // MANEJO DE INSULTOS Y LENGUAJE INAPROPIADO
        { 
            keywords: ['salame', 'retardado', 'retardado', 'nigga', 'conchuda', 'conchudo', 'sexo', 'pitito', 'conchita', 'chota', 'choto', 'chotin', 'cogida', 'cogido', 'salamin', 'boludito', 'boludita', 'trolo', 'trola', 'gay', 'gey', 'lesbiana', 'homosexual', 'travesti', 'traba', 'esclavo', 'esclava', 'gordo', 'gorda', 'teton', 'tetona', 'lechon', 'vaca', 'trava', 'cojo', 'cojer', 'coger', 'garcho', 'garchar', 'violo', 'violador', 'violadora', 'violado', 'vialada', 'gordita', 'gordito', 'pelotudito', 'pelotudita', 'panflina', 'trolin', 'trolito', 'trolita', 'nabo', 'pelado', 'calvo', 'pelon', 'culon', 'negro', 'negra', 'culona', 'cancer', 'putito', 'putita', 'boludin', 'hermana', 'madre', 'vieja', 'mama', 'tia', 'lora', 'mono', 'naboleti', 'salamina', 'tontin', 'pete', 'inutil', 'panflin', 'pancho', 'gil', 'gila', 'pancha', 'orto', 'semen', 'leche', 'lechita', 'bolas', 'testiculos', 'mogolico', 'mogolica', 'down', 'autista', 'retrasado', 'retrasada', 'tarado', 'tarada', 'tonto', 'tonta', 'teta', 'culo', 'nalgas', 'pito', 'pene', 'vagina', 'concha', 'infeliz', 'estupido', 'estupida', 'idiota', 'mierda', 'puto', 'puta', 'imbecil', 'cabron', 'cabrona', 'joder', 'boludo', 'boluda', 'coño', 'gilipollas', 'pendejo', 'pendeja', 'chinga', 'groseria', 'obscena', 'maldito', 'maldita', 'feo', 'caca', 'pedo', 'pis'], 
            response: 'Agradeceria que mantengas un lenguaje profesional. Estoy aquí para ayudarte con preguntas sobre Portafy, no para responder a ofensas. Por favor, reformula tu pregunta de manera respetuosa.' 
        },

        //Saludos y Cierres
        { 
            keywords: ['hola', 'buenas', 'buen', 'buenas', 'hi', 'hello', 'helow', 'hey', 'holis', 'ola', 'oli', 'olis', 'holanda', 'olanda', 'saludo', 'buenos dias', 'onda', 'que tal'], 
            response: '¡Hola! Soy tu **Asistente Portafy**. ¿En qué puedo ayudarte hoy?' 
        },
        { 
            keywords: ['gracias', 'muy bien', 'adios', 'chao', 'hasta luego'], 
            response: '¡De nada! Me alegra haberte ayudado. ¡Que tengas un gran día creando/gestionando tu **portafolio**!' 
        },
        // Creación de Portafolio
        { 
            keywords: ['portafolio', 'crear', 'hacer uno', 'mi portafolio', 'empezar'], 
            response: 'Para **crear tu portafolio**, ve a la página principal y busca el botón de creación, o sino tambien en cualquier otra pagina le das al boton con la personita en la barra de navegacion o "iniciar sesion" en el menu lateral. Es un proceso muy simple.' 
        },
        // Páginas de Navegación
        { 
            keywords: ['documentacion', 'docs', 'ayuda tecnica', 'ver manual'], 
            response: 'La **Documentación** está en `docs.html`. Ahí encontrarás guías detalladas, estructuras de archivos y detalles técnicos del proyecto.' 
        },
        { 
            keywords: ['ayuda', 'soporte', 'contacto', 'problema', 'emergencia', 'duda', 'consulta', 'reportar'], 
            response: 'Si necesitas ayuda, visita la página de **Ayuda**, que deberia estar abajo de la pagina, o contacta a soporte a través de los enlaces en el pie de página.' 
        },
        { 
            keywords: ['perfil', 'mi cuenta', 'editar perfil', 'ajustes', 'informacion'], 
            response: 'Puedes acceder y gestionar tu información, foto y ajustes en la página de **Perfil** (`profile.html`).' 
        },
        { 
            keywords: ['descubrir', 'proyectos', 'ver otros', 'explorar', 'inspiracion'], 
            response: 'Para explorar portafolios de otros usuarios e inspirarte, visita la página **Descubre Portafolios** (`discover.html`).' 
        },
        { 
            keywords: ['main.html', 'inicio', 'casa', 'dashboard'], 
            response: 'La página principal es `main.html`. Es el **dashboard** o centro de inicio donde gestionas tu portafolio.' 
        },
        // Tema y Diseño
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
        // Estructura y Desarrollo
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
            response: 'La plataforma está construida con tecnologías web estándar: **HTML**, **CSS** (con variables) y **JavaScript** puro. Tambien utiliza postgres sql en **Supabase**.' 
        },
        { 
            keywords: ['descargar', 'codigo', 'repositorio', 'archivos'], 
            response: 'El código fuente, una vez descargado, debe ser manipulado respetando la estructura de carpetas `css/` y `js/`.' 
        },
        // Funcionalidad
        { 
            keywords: ['como editar', 'cambiar info', 'formulario', 'actualizar'], 
            response: 'La edición de tu perfil o portafolio se gestiona con los botones y formularios de **"Editar"** que encontrarás en en la pagina de **Perfil**.' 
        },
        { 
            keywords: ['loading', 'carga', 'spinner', 'pantalla de carga', 'lentitud'], 
            response: 'El **spinner** solo aparece en páginas como `discover.html` para una mejor experiencia mientras cargan los proyectos.' 
        },
        { 
            keywords: ['que es un portafolio', 'definicion', 'concepto'], 
            response: 'Un portafolio en Portafy es tu espacio digital para mostrar de manera profesional y estética tus proyectos, habilidades y experiencia.' 
        },
        // Información Corporativa / Legal
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
        // Componentes de la Web
        { 
            keywords: ['header', 'encabezado', 'barra superior'], 
            response: 'El encabezado contiene el logo, el botón de cambio de tema y la navegación principal.' 
        },
        { 
            keywords: ['footer', 'pie de pagina', 'fondo'], 
            response: 'El pie de página incluye enlaces de navegación, nuestros perfiles de redes sociales y el aviso de copyright.' 
        },
        { 
            keywords: ['sociales', 'redes', 'facebook', 'twitter', 'x.com', 'instagram', 'linkedin', 'ig'], 
            response: 'Puedes seguirnos en todas las redes: Facebook, X (Twitter), Instagram y LinkedIn. Los enlaces están disponibles en el **pie de página**.' 
        },
        { 
            keywords: ['icono', 'logo', 'imagen', 'multimedia'], 
            response: 'El logo de Portafy está en `multimedia/logo.png`. Los iconos utilizados son de la librería **Font Awesome 6**.' 
        },
        //  Misc
        { 
            keywords: ['es gratis', 'costo', 'pago', 'cuanto cuesta'], 
            response: 'Asumo que la plataforma es de acceso libre para la creación de portafolios básicos. Revisa la documentación para detalles sobre licencias o planes de pago.' 
        },
        { 
            keywords: ['usuario', 'login', 'registro', 'sesion'], 
            response: 'Si tienes problemas de **login** o **registro**, visita la sección de ayuda para una guía de solución de problemas.' 
        },
        { 
            keywords: ['tutorial', 'guia', 'pasos', 'como se hace'], 
            response: 'En la sección de **Ayuda** y **Documentación** encontrarás guías paso a paso para la mayoría de las funcionalidades.' 
        },
        { 
            keywords: ['como contribuir', 'colaborar', 'trabajar'], 
            response: 'Por el momento, Portafy es un proyecto cerrado. No tenemos un sistema de contribución o colaboración de código abierto.' 
        },
        { 
            keywords: ['error', 'bug', 'falla'], 
            response: 'Si encuentras un error o fallo, por favor repórtalo en la página de **Ayuda** para que podamos solucionarlo rápidamente.' 
        },
        { 
            keywords: ['borro', 'borrar', 'proyecto'], 
            response: 'Para borrar un proyecto puedes ir a tu **Perfil** y buscar el proyecto q desees eliminar, le das click al boton de editar, abajo de todo deberia aparecer un boton para eliminar proyecto, le das click, confirmas y el proyecto estara eliminado de forma permanente.' 
        }
    ];

    // Función principal para obtener la respuesta del bot
    function getBotResponse(userInput) {
        const cleanedInput = userInput.toLowerCase().trim();

        for (const item of knowledgeBase) {
            for (const keyword of item.keywords) {
                if (cleanedInput.includes(keyword)) {
                    return item.response;
                }
            }
        }

        return "Disculpa, no entendí tu pregunta. Soy un asistente básico con respuestas predefinidas. Intenta reformular tu pregunta usando palabras clave sobre la **Documentación**, tu **Perfil**, el **Diseño** (neón, oscuro), o **Ayuda**. Tambien trata de no tener errores ortograficos";
    }

    // Función para manejar el envío de mensajes
    function handleSendMessage() {
        const userInput = inputField.value.trim();

        if (userInput === '') {
            return; 
        }

        // Mostrar mensaje del usuario
        appendMessage('user', userInput);

        // Obtener y mostrar respuesta del bot
        const botResponse = getBotResponse(userInput);
        
        setTimeout(() => {
            appendMessage('bot', botResponse);
        }, 500);

      
        inputField.value = '';
    }

    sendButton.addEventListener('click', handleSendMessage);
    inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    });

    // Observador para cambios de tema
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class' && mutation.target === document.body) {
            }
        });
    });

    observer.observe(document.body, { attributes: true });
});