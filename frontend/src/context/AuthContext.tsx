import {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import type { ReactNode } from "react";
import {
  login as apiLogin,
  logout as apiLogout,
  getCurrentUser,
  getStoredUser,
  clearAuthData,
} from "../api/authService";

type User = {
  role: string;
  isAuthenticated: boolean;
  email?: string;
  id?: string;
  name?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, role?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = getStoredUser();
      
      if (token) {
        try {
          // Try to get current user from backend
          const currentUser = await getCurrentUser();
          if (currentUser) {
            const normalizedRole =
              currentUser.role && currentUser.role !== 'authenticated'
                ? currentUser.role
                : storedUser?.role || currentUser.user_metadata?.role || 'admin';

            setUser({
              role: normalizedRole,
              isAuthenticated: true,
              email: currentUser.email,
              id: currentUser.id,
              name: currentUser.name || currentUser.email,
            });
            setLoading(false);
            return;
          }
        } catch (err) {
          // If API fails, fall back to stored user data
          console.warn('Failed to fetch current user from API, using stored data:', err);
        }
      }

      // Fallback to localStorage user data
      if (storedUser) {
        setUser({
          role: storedUser.role || storedUser.user_metadata?.role || 'admin',
          isAuthenticated: true,
          email: storedUser.email,
          id: storedUser.id,
        });
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string, role?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await apiLogin({ email, password, role });
      
      if (response.success && response.data) {
        const userData = response.data.user;
        const userRole = role || userData.role || userData.user_metadata?.role || 'admin';
        
        setUser({
          role: userRole,
          isAuthenticated: true,
          email: userData.email,
          id: userData.id,
          name: userData.name || userData.email,
        });
        
        return { success: true };
      }
      
      return { success: false, error: 'Invalid response from server' };
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Login failed';
      return { success: false, error: errorMsg };
    }
  };

  const logout = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await apiLogout();
      } catch (error) {
        console.error('API logout failed, clearing local data:', error);
      }
    }
    
    setUser(null);
    clearAuthData();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
