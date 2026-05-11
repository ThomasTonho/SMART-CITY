import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import "./styles.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const SENSOR_TYPES = [
  { label: "Temperatura", value: "TEMPERATURA" },
  { label: "Umidade", value: "UMIDADE" },
  { label: "Luminosidade", value: "LUMINOSIDADE" },
  { label: "Contador", value: "CONTADOR" },
];
const CHART_COLORS = ["#0284c7", "#0ea5e9", "#22d3ee", "#38bdf8"];

export default function AdminPage() {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState("TEMPERATURA");
  const [stats, setStats] = useState({
    sensoresTotal: 0,
    sensoresAtivos: 0,
    ambientes: 0,
    locais: 0,
    responsaveis: 0,
    medicoes24h: 0,
  });
  const [sensores, setSensores] = useState([]);
  const [historicos, setHistoricos] = useState([]);
  const [formData, setFormData] = useState({ sensor: "", valor: "" });
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    const loadData = async () => {
      setMessage("");
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const meResponse = await axios.get(`${API_BASE_URL}/api/usuarios/me/`, config);
        if (!meResponse.data?.is_staff && !meResponse.data?.is_superuser) {
          navigate("/user/home");
          return;
        }

        const sensoresResponse = await axios.get(
          `${API_BASE_URL}/api/sensores/?tipo_sensor=${selectedType}`,
          config,
        );
        setSensores(sensoresResponse.data);

        const [
          sensoresTotalResponse,
          ambientesResponse,
          locaisResponse,
          responsaveisResponse,
        ] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/sensores/`, config),
          axios.get(`${API_BASE_URL}/api/ambientes/`, config),
          axios.get(`${API_BASE_URL}/api/locais/`, config),
          axios.get(`${API_BASE_URL}/api/responsaveis/`, config),
        ]);

        const historicosResponse = await axios.get(
          `${API_BASE_URL}/api/historicos/recentes/`,
          config,
        );
        setHistoricos(historicosResponse.data);
        setStats({
          sensoresTotal: sensoresTotalResponse.data.length,
          sensoresAtivos: sensoresTotalResponse.data.filter((item) => item.status).length,
          ambientes: ambientesResponse.data.length,
          locais: locaisResponse.data.length,
          responsaveis: responsaveisResponse.data.length,
          medicoes24h: historicosResponse.data.length,
        });
      } catch (error) {
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }
        setMessage("Falha ao carregar dados dos sensores.");
      }
    };

    loadData();
  }, [navigate, selectedType, token]);

  const submitMedicao = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post(
        `${API_BASE_URL}/api/historicos/`,
        {
          sensor: Number(formData.sensor),
          valor: Number(formData.valor),
        },
        config,
      );
      setFormData({ sensor: "", valor: "" });
      setMessage("Medicao registrada com sucesso.");
      const historicosResponse = await axios.get(
        `${API_BASE_URL}/api/historicos/recentes/`,
        config,
      );
      setHistoricos(historicosResponse.data);
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }
      if (error.response?.data?.sensor?.[0]) {
        setMessage(error.response.data.sensor[0]);
        return;
      }
      setMessage("Falha ao registrar medicao.");
    }
  };

  const sensoresInativos = stats.sensoresTotal - stats.sensoresAtivos;
  const taxaAtivos = stats.sensoresTotal
    ? Math.round((stats.sensoresAtivos / stats.sensoresTotal) * 100)
    : 0;
  const sensoresPorTipo = SENSOR_TYPES.map((item) => ({
    ...item,
    total: sensores.filter((sensor) => sensor.tipo_sensor === item.value).length,
  }));
  const statusChartData = [
    { name: "Ativos", value: stats.sensoresAtivos },
    { name: "Inativos", value: Math.max(sensoresInativos, 0) },
  ];
  const historicoPorHora = [...historicos]
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    .reduce((acc, item) => {
      const date = new Date(item.timestamp);
      const key = `${date.getHours().toString().padStart(2, "0")}:00`;
      const existing = acc.find((entry) => entry.hora === key);
      if (existing) {
        existing.total += 1;
      } else {
        acc.push({ hora: key, total: 1 });
      }
      return acc;
    }, []);

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div>
          <h1>Dashboard Administrativo</h1>
          <p>Visao geral da operacao e acompanhamento das medicoes.</p>
        </div>
        <div className="admin-header-actions">
          <button
            type="button"
            className="filter-button"
            onClick={() => navigate("/admin/importacao")}
          >
            Importar CSV
          </button>
          <button type="button" className="logout-button" onClick={handleLogout}>
            Sair
          </button>
        </div>
      </header>

      <section className="admin-kpis">
        <article className="kpi-card">
          <span>Sensores cadastrados</span>
          <strong>{stats.sensoresTotal}</strong>
        </article>
        <article className="kpi-card">
          <span>Sensores ativos</span>
          <strong>{stats.sensoresAtivos}</strong>
        </article>
        <article className="kpi-card">
          <span>Ambientes</span>
          <strong>{stats.ambientes}</strong>
        </article>
        <article className="kpi-card">
          <span>Locais</span>
          <strong>{stats.locais}</strong>
        </article>
        <article className="kpi-card">
          <span>Responsaveis</span>
          <strong>{stats.responsaveis}</strong>
        </article>
        <article className="kpi-card">
          <span>Medicoes em 24h</span>
          <strong>{stats.medicoes24h}</strong>
        </article>
      </section>

      <section className="admin-widgets">
        <article className="widget-card">
          <h2>Status dos sensores</h2>
          <p className="widget-highlight">{taxaAtivos}% ativos</p>
          <div className="progress-track">
            <span style={{ width: `${taxaAtivos}%` }} />
          </div>
          <div className="widget-inline-stats">
            <div>
              <strong>{stats.sensoresAtivos}</strong>
              <span>Ativos</span>
            </div>
            <div>
              <strong>{sensoresInativos}</strong>
              <span>Inativos</span>
            </div>
          </div>
        </article>

        <article className="widget-card">
          <h2>Distribuicao por tipo</h2>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={sensoresPorTipo}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" stroke="#475569" />
                <YAxis allowDecimals={false} stroke="#475569" />
                <Tooltip />
                <Bar dataKey="total" radius={[8, 8, 0, 0]}>
                  {sensoresPorTipo.map((item, index) => (
                    <Cell key={item.value} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <ul className="type-distribution">
            {sensoresPorTipo.map((item) => (
              <li key={item.value}>
                <span>{item.label}</span>
                <strong>{item.total}</strong>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="admin-widgets">
        <article className="widget-card">
          <h2>Status geral (pizza)</h2>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusChartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={58}
                  outerRadius={88}
                  paddingAngle={4}
                >
                  <Cell fill="#16a34a" />
                  <Cell fill="#ef4444" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="widget-card">
          <h2>Volume de medicoes por hora</h2>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={historicoPorHora}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="hora" stroke="#475569" />
                <YAxis allowDecimals={false} stroke="#475569" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#0284c7"
                  strokeWidth={3}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      <section className="admin-section">
        <h2>Filtros de monitoramento</h2>
        <p>Selecione um tipo de sensor e acompanhe as medicoes.</p>
      </section>
      <div className="sensor-filter-group">
        {SENSOR_TYPES.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setSelectedType(item.value)}
            className={`filter-button ${selectedType === item.value ? "active" : ""}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {message && <p className="admin-message">{message}</p>}

      <section className="admin-content-grid">
        <article className="admin-table-card">
          <h2>Sensores ({selectedType})</h2>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tipo</th>
                  <th>Unidade</th>
                  <th>Status</th>
                  <th>Microcontrolador</th>
                </tr>
              </thead>
              <tbody>
                {sensores.length === 0 ? (
                  <tr>
                    <td colSpan="5">Nenhum sensor encontrado.</td>
                  </tr>
                ) : (
                  sensores.map((sensor) => (
                    <tr key={sensor.id}>
                      <td>{sensor.id}</td>
                      <td>{sensor.tipo_sensor}</td>
                      <td>{sensor.unidade_medida}</td>
                      <td>{sensor.status ? "Ativo" : "Inativo"}</td>
                      <td>{sensor.mic}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </article>

        <article className="admin-table-card">
          <h2>Nova medicao</h2>
          <form onSubmit={submitMedicao} className="measurement-form">
            <input
              type="number"
              placeholder="ID do sensor"
              value={formData.sensor}
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, sensor: event.target.value }))
              }
              required
            />
            <input
              type="number"
              step="0.01"
              placeholder="Valor"
              value={formData.valor}
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, valor: event.target.value }))
              }
              required
            />
            <button type="submit">Registrar</button>
          </form>
          <h2>Medicoes recentes (24h)</h2>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Sensor</th>
                  <th>Valor</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {historicos.length === 0 ? (
                  <tr>
                    <td colSpan="4">Sem medicoes nas ultimas 24h.</td>
                  </tr>
                ) : (
                  historicos.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.sensor}</td>
                      <td>{item.valor}</td>
                      <td>{new Date(item.timestamp).toLocaleString("pt-BR")}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </div>
  );
}
