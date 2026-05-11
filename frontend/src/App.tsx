import { BrowserRouter, Navigate, Route, Routes } from "react-router";

function LoginPage() {
  return <main>Login</main>;
}

function RegisterPage() {
  return <main>Cadastro</main>;
}

function HomePage() {
  return <main>Home</main>;
}

function ActivitiesPage() {
  return <main>Atividades</main>;
}

function NewActivityPage() {
  return <main>Nova atividade</main>;
}

function ProfilePage() {
  return <main>Perfil</main>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<RegisterPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/atividades" element={<ActivitiesPage />} />
        <Route path="/atividades/nova" element={<NewActivityPage />} />
        <Route path="/perfil" element={<ProfilePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;