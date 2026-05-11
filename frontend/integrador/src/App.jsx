import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/login/login";
import RegisterPage from "./pages/register/register";
import UserHomePage from "./pages/user/home";
import AdminPage from "./pages/admin/admin";
import AdminImportCsvPage from "./pages/admin/import-csv";
import "./App.css";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/user/home"
        element={
          <ProtectedRoute>
            <UserHomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/importacao"
        element={
          <ProtectedRoute>
            <AdminImportCsvPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
