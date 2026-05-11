import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './styles.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    tipo: 'USER',
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      setMessage('Usuário é obrigatório.');
      return false;
    }
    if (!formData.email.trim()) {
      setMessage('Email é obrigatório.');
      return false;
    }
    if (!formData.password.trim()) {
      setMessage('Senha é obrigatória.');
      return false;
    }
    if (!formData.tipo) {
      setMessage('Tipo de usuário é obrigatório.');
      return false;
    }
    if (formData.password !== formData.password2) {
      setMessage('As senhas não coincidem.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${API_BASE_URL}/api/register/`, {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        tipo: formData.tipo,
      });

      setMessage('Cadastro realizado com sucesso! Redirecionando...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error('Erro no cadastro: ', error);
      
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.username) {
          setMessage(`Erro no usuário: ${errorData.username[0]}`);
        } else if (errorData.email) {
          setMessage(`Erro no email: ${errorData.email[0]}`);
        } else {
          setMessage('Erro ao cadastrar. Tente novamente.');
        }
      } else {
        setMessage('Erro de conexão com o servidor.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registerPage">
      <div className="registerCard">
        <div className="registerHeader">
          <h1 className="registerTitle">Criar Conta</h1>
          <p className="registerSubtitle">Preencha os dados para se cadastrar</p>
        </div>

        <form className="registerForm" onSubmit={handleSubmit}>
          <div className="field">
            <label className="label">Usuário</label>
            <input
              className="input"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Digite seu usuário"
              disabled={loading}
            />
          </div>

          <div className="field">
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Digite seu email"
              disabled={loading}
            />
          </div>

          <div className="field">
            <label className="label">Senha</label>
            <input
              className="input"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Crie uma senha"
              disabled={loading}
            />
          </div>

          <div className="field">
            <label className="label">Confirmar Senha</label>
            <input
              className="input"
              type="password"
              name="password2"
              value={formData.password2}
              onChange={handleChange}
              placeholder="Confirme a senha"
              disabled={loading}
            />
          </div>

          <div className="field">
            <label className="label">Tipo de usuário</label>
            <select
              className="input"
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="USER">Usuário</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </div>

          {message && <div className="alert">{message}</div>}

          <button className="btnPrimary" type="submit" disabled={loading}>
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </button>

          <div className="divider">
            <span>ou</span>
          </div>

          <div className="footerActions">
            <p className="footerText">
              Já tem conta?{' '}
              <Link className="link" to="/login">
                Acesse aqui
              </Link>
            </p>
          </div>
        </form>

        <div className="registerFooter">
          <p>
            © {new Date().getFullYear()} • Desenvolvido por{' '}
            <strong>Thomás Antonelli Veloso</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
