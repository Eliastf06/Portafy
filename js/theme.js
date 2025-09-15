document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const lightModeIcon = document.querySelector('.light-mode-icon');
    const darkModeIcon = document.querySelector('.dark-mode-icon');
    const appLogoLink = document.querySelector('.app-logo-link');

    const applyTheme = (theme) => {
        if (theme === 'dark') {
            body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
            if (lightModeIcon && darkModeIcon) {
                lightModeIcon.style.display = 'none';
                darkModeIcon.style.display = 'inline-block';
            }
            if (appLogoLink) {
                appLogoLink.style.color = 'var(--text-color-light)';
            }
        } else {
            body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
            if (lightModeIcon && darkModeIcon) {
                lightModeIcon.style.display = 'inline-block';
                darkModeIcon.style.display = 'none';
            }
            if (appLogoLink) {
                appLogoLink.style.color = 'var(--text-color-dark)';
            }
        }
    };

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        applyTheme(savedTheme);
    } else {
        applyTheme('light');
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            if (body.classList.contains('dark-mode')) {
                applyTheme('light');
            } else {
                applyTheme('dark');
            }
        });
    }
});