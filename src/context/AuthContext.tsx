"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface User {
  _id: string;
  name: string;
  email: string;
}

// UPDATE: The context now provides the user, a loading state, and functions
interface AuthContextType {
  user: User | null;
  loading: boolean; // <-- ADD LOADING STATE
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

// We provide a default context value, but it will be overridden by the Provider.
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // <-- START IN A LOADING STATE

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage:", error);
      // Clear corrupted data
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
    } finally {
      // IMPORTANT: Set loading to false AFTER we've checked localStorage
      setLoading(false); 
    }
  }, []);

  // const login = async (email: string, password: string): Promise<boolean> => {
  //   // ... your login function remains the same
  //   try {
  //     const res = await fetch("http://localhost:5000/api/users/login", { /* ... */ });
  //     if (!res.ok) return false;
  //     const data = await res.json();
  //     localStorage.setItem("token", data.token);
  //     localStorage.setItem("user", JSON.stringify(data));
  //     setUser(data);
  //     return true;
  //   } catch (err) { return false; }
  // };
  const login = async (email: string, password: string): Promise<boolean> => {
  try {
    const res = await fetch("http://localhost:5000/api/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // optional, if your backend uses cookies
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) return false;

    const data = await res.json();
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data));
    setUser(data);
    return true;
  } catch (err) {
    console.error("Login error:", err);
    return false;
  }
};


  // const register = async (name: string, email: string, password: string): Promise<boolean> => {
  //   // ... your register function remains the same
  //   try {
  //     const res = await fetch("http://localhost:5000/api/users/register", { /* ... */ });
  //     if (!res.ok) return false;
  //     const data = await res.json();
  //     localStorage.setItem("token", data.token);
  //     localStorage.setItem("user", JSON.stringify(data));
  //     setUser(data);
  //     return true;
  //   } catch (err) { return false; }
  // };
  const register = async (name: string, email: string, password: string): Promise<boolean> => {
  try {
    const res = await fetch("http://localhost:5000/api/users/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ name, email, password }),
    });

    if (!res.ok) return false;

    const data = await res.json();
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data));
    setUser(data);
    return true;
  } catch (err) {
    console.error("Register error:", err);
    return false;
  }
};


  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    // Pass the new loading state in the value
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Update the useAuth hook to handle the undefined case
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};