import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const SENSOR_TYPES = [
  { label: "Temperatura", value: "TEMPERATURA" },
  { label: "Umidade", value: "UMIDADE" },
  { label: "Luminosidade", value: "LUMINOSIDADE" },
  { label: "Contador", value: "CONTADOR" },
];

export default function UserHomePage() {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState("TEMPERATURA");
  const [sensores, setSensores] = useState([]);
  const [historicos, setHistoricos] = useState([]);
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
        const sensoresResponse = await axios.get(
          `${API_BASE_URL}/api/sensores/?tipo_sensor=${selectedType}`,
          config,
        );
        setSensores(sensoresResponse.data);

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
        setMessage("Falha ao carregar dados dos sensores.");
      }
    };

    loadData();
  }, [navigate, selectedType, token]);

  return (
    <div style={{ padding: 20 }}>
      <h1>Home - Usuario</h1>
      <p>Selecione um tipo de sensor para visualizar os dados.</p>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {SENSOR_TYPES.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setSelectedType(item.value)}
            style={{
              padding: "8px 12px",
              border: "1px solid #ccc",
              backgroundColor: selectedType === item.value ? "#0369a1" : "#f8fafc",
              color: selectedType === item.value ? "#fff" : "#0f172a",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {message && <p style={{ color: "#dc2626" }}>{message}</p>}

      <h2>Sensores ({selectedType})</h2>
      <table border="1" cellPadding="8" cellSpacing="0" width="100%">
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

      <h2 style={{ marginTop: 20 }}>Medicoes recentes (24h)</h2>
      <table border="1" cellPadding="8" cellSpacing="0" width="100%">
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
                <td>{item.timestamp}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <button
        onClick={handleLogout}
        style={{
          marginTop: 20,
          padding: "10px 20px",
          backgroundColor: "#dc2626",
          color: "#fff",
          border: "none",
          borderRadius: 4,
          cursor: "pointer",
        }}
      >
        Sair
      </button>
    </div>
  );
}
