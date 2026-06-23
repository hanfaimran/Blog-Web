import { createContext, useReducer, useContext, useEffect, useState } from 'react';
import API from '../utils/axios';

// ── Action Types ───────────────────────────────────────────────────────
const AUTH_ACTIONS = {
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  SET_USER: 'SET_USER',
  SET_LOADING: 'SET_LOADING',
};

// ── Reducer ────────────────────────────────────────────────────────────
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
      };
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
      };
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    default:
      return state;
  }
};

// ── Initial State ──────────────────────────────────────────────────────
const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true, // Start as loading to check auth on mount
};

// ── Context ────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

// ── Provider ───────────────────────────────────────────────────────────
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  // Check if user is authenticated on mount (via /auth/me)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await API.get('/auth/me');
        dispatch({ type: AUTH_ACTIONS.SET_USER, payload: res.data.data.user });
      } catch {
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
      } finally {
        setInitialCheckDone(true);
      }
    };

    checkAuth();
  }, []);

  // ── Auth actions ────────────────────────────────────────────────────
  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: res.data.data.user });
    return res.data;
  };

  const register = async (name, email, password) => {
    const res = await API.post('/auth/register', { name, email, password });
    dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: res.data.data.user });
    return res.data;
  };

  const logout = async () => {
    try {
      await API.post('/auth/logout');
    } catch {
      // Logout even if the API call fails
    }
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  const value = {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    loading: state.loading,
    initialCheckDone,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ── Custom Hook ────────────────────────────────────────────────────────
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
