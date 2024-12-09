import { createContext, useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useLocalStorage } from './utils/useLocalStorage';
import { sendRequest } from './utils/request';

interface User {
  token: string,
  role: string
}

interface Credentials {
  username: string,
  password: string
}

interface AuthContextType {
  user: User | null,
  login: (creds: Credentials, cb: (error: string | null) => void) => Promise<void>,
  logout: (cb: () => void) => void,
}

const AuthContext = createContext<AuthContextType>(null!);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useLocalStorage<User | null>('user', null);

  const login = async (creds: Credentials, cb: (error: string | null) => void) => {
    try {
      const resp = await sendRequest('auth/login', creds)

      if (resp.status === 200) {
        const user = await resp.json();
        setUser(user);
        cb(null);
      } else {
        cb(resp.statusText);
      }
    } catch (err: any) {
      cb(err.toString());
    }
  };

  const logout = (cb: () => void) => {
    setUser(null);
    cb();
  };

  const data = { user, login, logout };

  return (
    <AuthContext.Provider value={data}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export const RequireAuth = ({ children }: { children: JSX.Element }) => {
  let auth = useAuth();
  let location = useLocation();

  if (!auth.user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}