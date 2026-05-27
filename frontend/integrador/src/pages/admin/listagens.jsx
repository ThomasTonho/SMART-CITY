import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./styles.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const LIST_SECTIONS = [
  {
    key: "locais",
    label: "Locais",
    endpoint: "/api/locais/",
    columns: [
      { key: "id", label: "ID" },
      { key: "nome", label: "Nome" },
    ],
  },
  {
    key: "responsaveis",
    label: "Responsaveis",
    endpoint: "/api/responsaveis/",
    columns: [
      { key: "id", label: "ID" },
      { key: "nome", label: "Nome" },
    ],
  },
  {
    key: "ambientes",
    label: "Ambientes",
    endpoint: "/api/ambientes/",
    columns: [
      { key: "id", label: "ID" },
      { key: "local", label: "Local ID" },
      { key: "responsavel", label: "Responsavel ID" },
      { key: "descricao", label: "Descricao" },
    ],
  },
  {
    key: "microcontroladores",
    label: "Microcontroladores",
    endpoint: "/api/microcontroladores/",
    columns: [
      { key: "id", label: "ID" },
      { key: "modelo", label: "Modelo" },
      { key: "mac_address", label: "MAC" },
      { key: "latitude", label: "Latitude" },
      { key: "longitude", label: "Longitude" },
      { key: "status", label: "Status" },
      { key: "ambiente", label: "Ambiente ID" },
    ],
  },
  {
    key: "sensores",
    label: "Sensores",
    endpoint: "/api/sensores/",
    columns: [
      { key: "id", label: "ID" },
      { key: "tipo_sensor", label: "Tipo" },
      { key: "unidade_medida", label: "Unidade" },
      { key: "status", label: "Status" },
      { key: "mic", label: "Microcontrolador ID" },
    ],
  },
  {
    key: "historicos",
    label: "Historicos",
    endpoint: "/api/historicos/",
    columns: [
      { key: "id", label: "ID" },
      { key: "sensor", label: "Sensor ID" },
      { key: "valor", label: "Valor" },
      { key: "timestamp", label: "Timestamp" },
    ],
  },
];

function renderValue(value) {
  if (typeof value === "boolean") {
    return value ? "Ativo" : "Inativo";
  }
  if (value === null || value === undefined || value === "") {
    return "-";
  }
  return String(value);
}

export default function AdminListagensPage() {
  const navigate = useNavigate();
  const [selectedSection, setSelectedSection] = useState("locais");
  const [datasets, setDatasets] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    navigate("/login");
  };

  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      return null;
    }

    const response = await axios.post(`${API_BASE_URL}/api/refresh`, {
      refresh: refreshToken,
    });
    const newAccess = response.data?.access;
    if (!newAccess) {
      return null;
    }

    localStorage.setItem("token", newAccess);
    return newAccess;
  };

  useEffect(() => {
    const loadData = async (allowRefresh = true) => {
      setLoading(true);
      setMessage("");

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const meResponse = await axios.get(`${API_BASE_URL}/api/usuarios/me/`, config);
        if (!meResponse.data?.is_staff && !meResponse.data?.is_superuser) {
          navigate("/user/home");
          return;
        }

        const responses = await Promise.all(
          LIST_SECTIONS.map((section) => axios.get(`${API_BASE_URL}${section.endpoint}`, config)),
        );

        const nextData = {};
        LIST_SECTIONS.forEach((section, index) => {
          nextData[section.key] = responses[index].data;
        });
        setDatasets(nextData);
      } catch (error) {
        if (error.response?.status === 401 && allowRefresh) {
          try {
            const newToken = await refreshAccessToken();
            if (newToken) {
              await loadData(false);
              return;
            }
          } catch {
            // continua para o fluxo de logout abaixo
          }
        }
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          navigate("/login");
          return;
        }
        setMessage("Falha ao carregar as listagens.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  const activeSection =
    LIST_SECTIONS.find((section) => section.key === selectedSection) || LIST_SECTIONS[0];
  const rows = datasets[activeSection.key] || [];

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div>
          <h1>Listagens gerais</h1>
          <p>Visualize todos os cadastros importados no sistema.</p>
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

      <section className="admin-kpis">
        {LIST_SECTIONS.map((section) => (
          <article key={section.key} className="kpi-card">
            <span>{section.label}</span>
            <strong>{datasets[section.key]?.length || 0}</strong>
          </article>
        ))}
      </section>

      <section className="sensor-filter-group">
        {LIST_SECTIONS.map((section) => (
          <button
            key={section.key}
            type="button"
            className={`filter-button ${selectedSection === section.key ? "active" : ""}`}
            onClick={() => setSelectedSection(section.key)}
          >
            {section.label}
          </button>
        ))}
      </section>

      {message && <p className="admin-message">{message}</p>}

      <article className="admin-table-card">
        <div className="listagens-header">
          <h2>{activeSection.label}</h2>
          {loading && <span>Carregando...</span>}
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                {activeSection.columns.map((column) => (
                  <th key={column.key}>{column.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!loading && rows.length === 0 ? (
                <tr>
                  <td colSpan={activeSection.columns.length}>
                    Nenhum registro encontrado para {activeSection.label.toLowerCase()}.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id}>
                    {activeSection.columns.map((column) => (
                      <td key={column.key}>{renderValue(row[column.key])}</td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </article>
    </div>
  );
}
