import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = async (email, password) => {
    try {
      // Gửi yêu cầu POST tới /login của Spring Security
      const loginResponse = await fetch("http://localhost:8080/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          username: email, // Spring Security mặc định dùng "username"
          password: password,
        }),
        credentials: "include", // Gửi cookie/session
      });

      if (!loginResponse.ok) {
        throw new Error("Invalid email or password");
      }

      // Gọi /api/account/user để lấy thông tin người dùng
      const userResponse = await fetch("http://localhost:8080/api/account/user", {
        method: "GET",
        credentials: "include",
      });

      if (!userResponse.ok) {
        throw new Error("Failed to fetch user data");
      }

      const userData = await userResponse.json();
      setUser(userData); // Lưu thông tin người dùng
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    fetch("http://localhost:8080/logout", {
      method: "POST",
      credentials: "include",
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);