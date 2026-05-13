import { BrowserRouter, Navigate, Route, Routes } from "react-router";

import { LoginPage } from "./features/auth/login-page";
import { RegisterPage } from "./features/auth/register-page";
import { PreferencesPage } from "./features/preferences/preferences-page";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<RegisterPage />} />
        <Route path="/home" element={<PreferencesPage />} />
        <Route path="/preferencias" element={<PreferencesPage />} />
        <Route path="/atividades" element={<PreferencesPage />} />
        <Route path="/atividades/nova" element={<PreferencesPage />} />
        <Route path="/perfil" element={<PreferencesPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
