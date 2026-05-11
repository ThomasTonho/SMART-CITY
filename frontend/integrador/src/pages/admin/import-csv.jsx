import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./styles.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const MODEL_OPTIONS = [
  { label: "Usuarios", value: "usuario" },
  { label: "Locais", value: "local" },
  { label: "Responsaveis", value: "responsavel" },
  { label: "Ambientes", value: "ambiente" },
  { label: "Microcontroladores", value: "microcontrolador" },
  { label: "Sensores", value: "sensor" },
  { label: "Historicos", value: "historico" },
];

export default function AdminImportCsvPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [model, setModel] = useState("sensor");
  const [delimiter, setDelimiter] = useState(",");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setResult(null);

    if (!file) {
      setMessage("Selecione um arquivo CSV.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("model", model);
      formData.append("delimiter", delimiter);
      formData.append("file", file);

      const response = await axios.post(`${API_BASE_URL}/api/importacao/csv/`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResult(response.data);
      setMessage("Importacao executada com sucesso.");
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }
      setMessage(error.response?.data?.error?.message || "Falha ao importar CSV.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div>
          <h1>Importacao CSV</h1>
          <p>Envie um arquivo para importacao automatizada dos dados.</p>
        </div>
        <div className="admin-header-actions">
          <button type="button" className="filter-button" onClick={() => navigate("/admin")}>
            Voltar ao dashboard
          </button>
          <button type="button" className="logout-button" onClick={handleLogout}>
            Sair
          </button>
        </div>
      </header>

      <article className="admin-table-card">
        <h2>Arquivo de importacao</h2>
        <form className="measurement-form" onSubmit={handleSubmit}>
          <select value={model} onChange={(event) => setModel(event.target.value)} required>
            {MODEL_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={delimiter}
            maxLength={1}
            onChange={(event) => setDelimiter(event.target.value || ",")}
            placeholder="Delimitador"
            required
          />
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(event) => setFile(event.target.files?.[0] || null)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Importando..." : "Importar"}
          </button>
        </form>

        {message && <p className="admin-message">{message}</p>}

        {result && (
          <div className="import-result">
            <p>
              <strong>Modelo:</strong> {result.model}
            </p>
            <p>
              <strong>Criados:</strong> {result.created}
            </p>
            <p>
              <strong>Atualizados:</strong> {result.updated}
            </p>
            <p>
              <strong>Ignorados:</strong> {result.skipped}
            </p>
            <p>
              <strong>Erros:</strong> {result.errors}
            </p>
            {Array.isArray(result.errors_list) && result.errors_list.length > 0 && (
              <ul>
                {result.errors_list.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </article>
    </div>
  );
}
