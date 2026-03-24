
const themeColors = {
  red: {
    primary: '4 84% 57%',
    primaryForeground: '0 0% 100%',
    accent: '4 84% 97%',
    accentForeground: '4 84% 57%'
  },
  blue: {
    primary: '217 91% 60%',
    primaryForeground: '0 0% 100%',
    accent: '217 91% 97%',
    accentForeground: '217 91% 60%'
  },
  green: {
    primary: '142 71% 45%',
    primaryForeground: '0 0% 100%',
    accent: '142 71% 97%',
    accentForeground: '142 71% 45%'
  },
  dark: {
    primary: '240 6% 25%',
    primaryForeground: '0 0% 100%',
    accent: '240 6% 15%',
    accentForeground: '0 0% 100%'
  },
  black: {
    primary: '0 0% 9%',
    primaryForeground: '0 0% 100%',
    accent: '0 0% 15%',
    accentForeground: '0 0% 100%'
  }
};

export const applyTheme = (color = 'red', darkMode = false) => {
  const root = document.documentElement;
  
  if (darkMode) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  
  const theme = themeColors[color] || themeColors.red;
  
  root.style.setProperty('--primary', theme.primary);
  root.style.setProperty('--primary-foreground', theme.primaryForeground);
  root.style.setProperty('--accent', theme.accent);
  root.style.setProperty('--accent-foreground', theme.accentForeground);
};

export const getThemeColor = (color = 'red') => {
  return themeColors[color] || themeColors.red;
};

export const saveThemePreference = (color, darkMode) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('focusflow-theme-color', color);
    localStorage.setItem('focusflow-dark-mode', darkMode.toString());
  }
};

export const loadThemePreference = () => {
  if (typeof window !== 'undefined') {
    const color = localStorage.getItem('focusflow-theme-color') || 'red';
    const darkMode = localStorage.getItem('focusflow-dark-mode') === 'true';
    return { color, darkMode };
  }
  return { color: 'red', darkMode: false };
};
