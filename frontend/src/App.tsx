import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { lazy, Suspense, type ComponentType, type LazyExoticComponent } from "react";

import { ErrorBoundary } from "@/components/ui/error-boundary";

import { ProtectedRoute } from "./routes/protected-route";

function lazyNamed<TModule, TKey extends keyof TModule>(
  loader: () => Promise<TModule>,
  exportName: TKey,
) {
  return lazy(async () => {
    const module = await loader();

    return {
      default: module[exportName] as ComponentType,
    };
  });
}

const ActivityDetailsPage = lazyNamed(
  () => import("./features/activities/activity-details-page"),
  "ActivityDetailsPage",
);
const ActivityEditPage = lazyNamed(
  () => import("./features/activities/activity-edit-page"),
  "ActivityEditPage",
);
const ActivityTypePage = lazyNamed(
  () => import("./features/activities/activity-type-page"),
  "ActivityTypePage",
);
const NewActivityPage = lazyNamed(
  () => import("./features/activities/new-activity-page"),
  "NewActivityPage",
);
const LoginPage = lazyNamed(() => import("./features/auth/login-page"), "LoginPage");
const RegisterPage = lazyNamed(() => import("./features/auth/register-page"), "RegisterPage");
const HomePage = lazyNamed(() => import("./features/home/home-page"), "HomePage");
const PreferencesPage = lazyNamed(
  () => import("./features/preferences/preferences-page"),
  "PreferencesPage",
);
const EditProfilePage = lazyNamed(
  () => import("./features/profile/edit-profile-page"),
  "EditProfilePage",
) as LazyExoticComponent<ComponentType<{ showDeactivateDialog?: boolean }>>;
const ProfilePage = lazyNamed(() => import("./features/profile/profile-page"), "ProfilePage");

function RouteFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white">
      <p className="text-body text-[var(--color-text)]">Carregando...</p>
    </main>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<RouteFallback />}>
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
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
