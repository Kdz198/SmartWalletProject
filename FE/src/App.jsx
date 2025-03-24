import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import AppRoutes from "./routes/AppRoutes";

// This context would normally be implemented with actual authentication
// Replace with real auth when backend is ready
export const AuthContext = React.createContext({
  isAuthenticated: false,
  user: null,
  login: () => {},
  logout: () => {},
  loading: false,
});

function App() {
  // Mock auth state that would be replaced with real auth later
  const [authState, setAuthState] = React.useState({
    isAuthenticated: false,
    user: null,
    loading: false,
  });

  const login = (userData) => {
    setAuthState({
      isAuthenticated: true,
      user: userData,
      loading: false,
    });
  };

  const logout = () => {
    setAuthState({
      isAuthenticated: false,
      user: null,
      loading: false,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
      }}
    >
      <Router>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow bg-gray-50">
            <AppRoutes />
          </main>
          <Footer />
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
