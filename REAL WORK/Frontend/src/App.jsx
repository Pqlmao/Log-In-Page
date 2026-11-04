import { useState } from "react";
import LoginPage from "./LoginPage";
import HomePage from "./HomePage";
import DetailPage from "./DetailPage";
import RankingPage from "./RankingPage";
import ProfilePage from "./ProfilePage";
import { login, logout } from "./api";

const isDemoLogin = import.meta.env.VITE_DEMO_LOGIN === "true";
const DEMO_EMAIL = "test@gmail.com";
const DEMO_PASSWORD = "1234";
const SESSION_KEY = "myplaylist-session";

function App() {
  const [session, setSession] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(SESSION_KEY)) || null;
    } catch {
      return null;
    }
  });
  const [currentPage, setCurrentPage] = useState(() =>
    sessionStorage.getItem(SESSION_KEY) ? "home" : "login",
  );
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function storeSession(nextSession) {
    setSession(nextSession);
    if (nextSession)
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
    else sessionStorage.removeItem(SESSION_KEY);
  }

  async function handleLogin(credentials) {
    setLoginError("");

    if (isDemoLogin) {
      if (
        credentials.email.trim().toLowerCase() !== DEMO_EMAIL ||
        credentials.password !== DEMO_PASSWORD
      ) {
        setLoginError("Email atau kata sandi simulasi salah.");
        return;
      }

      storeSession({
        demo: true,
        user: { display_name: "Larp", username: "Imustlarp" },
      });
      setCurrentPage("home");
      return;
    }

    setIsLoading(true);

    try {
      const authenticatedSession = await login(credentials);
      storeSession(authenticatedSession);
      setCurrentPage("home");
    } catch (error) {
      setLoginError(
        error instanceof TypeError
          ? "Tidak dapat terhubung ke server. Pastikan backend sedang berjalan."
          : error.message,
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleLogout() {
    if (session?.token) {
      try {
        await logout(session.token);
      } catch (error) {
        setLoginError(error.message);
        setCurrentPage("login");
        return;
      }
    }
    storeSession(null);
    setCurrentPage("login");
  }

  return (
    <>
      {(!session || currentPage === "login") && (
        <LoginPage
          onLogin={handleLogin}
          error={loginError}
          isLoading={isLoading}
        />
      )}

      {session && currentPage === "home" && (
        <HomePage
          onSelectDetail={() => setCurrentPage("detail")}
          onNavigate={setCurrentPage}
          token={session.token}
          demo={session.demo}
          onLogout={handleLogout}
        />
      )}
      {session && currentPage === "ranking" && (
        <RankingPage
          onNavigate={setCurrentPage}
          token={session.token}
          demo={session.demo}
          onLogout={handleLogout}
        />
      )}
      {session && currentPage === "profile" && (
        <ProfilePage
          onNavigate={setCurrentPage}
          token={session.token}
          demo={session.demo}
          onLogout={handleLogout}
        />
      )}
      {session && currentPage === "detail" && (
        <DetailPage
          onBack={() => setCurrentPage("home")}
          onNavigate={setCurrentPage}
          token={session.token}
          demo={session.demo}
          onLogout={handleLogout}
        />
      )}
    </>
  );
}

export default App;
