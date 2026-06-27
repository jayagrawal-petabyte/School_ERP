export const COLORS = {
  // Brand Colors
  primary: '#4F46E5',     // Elegant Indigo
  primaryLight: '#EEF2FF',
  primaryDark: '#3730A3',
  
  // Secondary / Accent Colors
  secondary: '#06B6D4',   // Cyber Teal
  accent: '#F59E0B',      // Amber
  
  // Status Colors (Critical for Attendance)
  present: '#10B981',     // Vibrant Emerald Green
  presentLight: '#ECFDF5',
  absent: '#EF4444',      // Vibrant Rose Red
  absentLight: '#FEF2F2',
  late: '#F59E0B',        // Vibrant Amber Orange
  lateLight: '#FEF3C7',
  excused: '#3B82F6',     // Cool Blue
  excusedLight: '#EFF6FF',
  
  // Neutral Colors (Backgrounds, Cards, Text)
  background: '#F9FAFB',  // Soft white / light gray
  surface: '#FFFFFF',     // Pure White
  card: '#FFFFFF',
  
  // Text Colors
  textPrimary: '#111827',   // Dark Gray / Black
  textSecondary: '#4B5563', // Slate Gray
  textMuted: '#9CA3AF',     // Muted Gray
  textLight: '#FFFFFF',     // White text
  
  // Borders
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
};
