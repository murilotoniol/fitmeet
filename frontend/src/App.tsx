import { BrowserRouter, Navigate, Route, Routes } from "react-router";

import { ActivityDetailsPage } from "./features/activities/activity-details-page";
import { ActivityEditPage } from "./features/activities/activity-edit-page";
import { ActivityTypePage } from "./features/activities/activity-type-page";
import { NewActivityPage } from "./features/activities/new-activity-page";
import { LoginPage } from "./features/auth/login-page";
import { RegisterPage } from "./features/auth/register-page";
import { HomePage } from "./features/home/home-page";
import { PreferencesPage } from "./features/preferences/preferences-page";
import { EditProfilePage } from "./features/profile/edit-profile-page";
import { ProfilePage } from "./features/profile/profile-page";
import { ProtectedRoute } from "./routes/protected-route";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<RegisterPage />} />
        <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/preferencias" element={<ProtectedRoute><PreferencesPage /></ProtectedRoute>} />
        <Route path="/atividades" element={<ProtectedRoute><ActivityTypePage /></ProtectedRoute>} />
        <Route path="/atividades/detalhes/:activityId" element={<ProtectedRoute><ActivityDetailsPage /></ProtectedRoute>} />
        <Route path="/atividades/editar/:activityId" element={<ProtectedRoute><ActivityEditPage /></ProtectedRoute>} />
        <Route path="/atividades/nova" element={<ProtectedRoute><NewActivityPage /></ProtectedRoute>} />
        <Route path="/perfil" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/perfil/editar" element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />
        <Route
          path="/perfil/editar/desativar"
          element={<ProtectedRoute><EditProfilePage showDeactivateDialog /></ProtectedRoute>}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
