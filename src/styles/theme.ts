export const colors = {
  // Base colors
  background: {
    primary: '#1E1E1E',
    secondary: '#252526',
    tertiary: '#2D2D2D'
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#CCCCCC',
    disabled: '#888888'
  },
  border: {
    light: '#404040',
    medium: '#505050',
    dark: '#606060'
  },
  accent: {
    primary: '#0078D4',
    success: '#2EA043',
    warning: '#D29922',
    error: '#F85149',
    info: '#58A6FF'
  },
  node: {
    background: '#2D2D2D',
    selected: '#3D3D3D',
    hover: '#353535'
  }
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px'
};

export const sizes = {
  icon: {
    small: '16px',
    medium: '20px',
    large: '24px'
  },
  sidebar: {
    collapsed: '48px',
    expanded: '240px'
  },
  bottomPanel: {
    collapsed: '40px',
    expanded: '320px'
  }
};

export const zIndex = {
  sidebar: 100,
  modal: 200,
  tooltip: 300,
  dropdown: 400
};

export const transitions = {
  fast: '150ms ease',
  normal: '250ms ease',
  slow: '350ms ease'
};

export const shadows = {
  small: '0 2px 4px rgba(0, 0, 0, 0.1)',
  medium: '0 4px 8px rgba(0, 0, 0, 0.2)',
  large: '0 8px 16px rgba(0, 0, 0, 0.3)'
};

export default {
  colors,
  spacing,
  sizes,
  zIndex,
  transitions,
  shadows
}; 