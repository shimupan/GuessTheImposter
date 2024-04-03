import { createContext, useState, ReactNode } from 'react';

type AuthContextType = {
   username: String;
   setUsername: React.Dispatch<React.SetStateAction<string>>;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
   const [username, setUsername] = useState('');
   return (
      <AuthContext.Provider value={{ username, setUsername }}>
         {children}
      </AuthContext.Provider>
   );
};
