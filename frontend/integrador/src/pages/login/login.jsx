// src/pages/login/login.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./styles.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function Login() {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const validateForm = () => {
    if (!user.trim()) {
      setMessage("Usuário é obrigatório.");
      return false;
    }
    if (!password.trim()) {
      setMessage("Senha é obrigatória.");
      return false;
    }
    return true;
  };

  const logar = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // 1) Login e pega o token JWT
      const response = await axios.post(`${API_BASE_URL}/api/token`, {
        username: user,
        password: password,
      });

      const access = response.data.access;

      // Salva o token
      localStorage.setItem("token", access);

      // 2) Busca os dados do usuário logado
      const me = await axios.get(`${API_BASE_URL}/api/usuarios/me/`, {
        headers: { Authorization: `Bearer ${access}` },
      });

      const { is_superuser, is_staff, is_active } = me.data;

      // 3) Se usuário estiver inativo, bloqueia
      if (!is_active) {
        localStorage.removeItem("token");
        setMessage("Usuário inativo. Contate o administrador.");
        setLoading(false);
        return;
      }

      // 4) Redirecionamento por perfil
      if (is_superuser || is_staff) {
        navigate("/admin");
      } else {
        navigate("/user/home");
      }
    } catch (error) {
      console.error("Erro no login: ", error);
      localStorage.removeItem("token");
      
      if (error.response?.status === 401) {
        setMessage("Usuário ou senha inválidos.");
      } else if (error.response) {
        setMessage(`Erro: ${error.response.statusText}`);
      } else {
        setMessage("Erro de conexão com o servidor.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="loginPage">
      <div className="loginCard">
        <div className="loginHeader">
          <h1 className="loginTitle">Acessar sistema</h1>
          <p className="loginSubtitle">Entre com suas credenciais para continuar</p>
        </div>

        <form className="loginForm" onSubmit={logar}>
          <div className="field">
            <label className="label">Usuário</label>
            <input
              className="input"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              placeholder="Digite seu usuário"
              autoComplete="username"
              disabled={loading}
            />
          </div>

          <div className="field">
            <label className="label">Senha</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          {message && <div className="alert">{message}</div>}

          <button className="btnPrimary" type="submit" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>

          <div className="divider">
            <span>ou</span>
          </div>

          <div className="footerActions">
            <p className="footerText">
              Ainda não tem conta?{" "}
              <Link className="link" to="/register">
                Cadastre-se
              </Link>
            </p>
          </div>
        </form>

        <div className="loginFooter">
          <p>
            © {new Date().getFullYear()} • Desenvolvido por{" "}
            <strong>Thomás Antonelli Veloso</strong>
          </p>
        </div>
      </div>
    </div>
  );
}