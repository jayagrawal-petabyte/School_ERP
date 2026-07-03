export const COLORS = {
  // Primary colors from Dribbble design
  primary: '#344054',     // Dark Slate Blue / Gray (used for buttons, headers, accents)
  primaryLight: '#F2F4F7',// Light gray-blue for active tabs or secondary fills
  primaryDark: '#1D2939', // Darker slate
  
  // Secondary Colors
  secondary: '#475467',   // Muted slate
  accent: '#667085',      // Accent gray
  
  // Dribbble Mockup Status Colors
  present: '#12B76A',     // Green
  presentLight: '#ECFDF3',
  absent: '#F04438',      // Red
  absentLight: '#FEF3F2',
  late: '#F79009',        // Yellow / Orange
  lateLight: '#FFFAEB',
  earlyOff: '#FD853A',    // Orange
  earlyOffLight: '#FFF6ED',
  festival: '#2E90FA',    // Blue
  festivalLight: '#EFF8FF',
  
  // Layout Colors
  background: '#F8FAFC',  // Main app background
  surface: '#FFFFFF',     // Card / container backgrounds
  card: '#FFFFFF',
  
  // Text Colors
  textPrimary: '#1D2939',   // Dark Gray (slate)
  textSecondary: '#475467', // Medium Gray
  textMuted: '#98A2B3',     // Muted Gray
  textLight: '#FFFFFF',     // White
  
  // Borders
  border: '#E4E7EC',        // Light gray border from design
  borderLight: '#F2F4F7',   // Very light separator
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const FONT_SIZE = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 30,
};

export const FONT_WEIGHT = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
};
