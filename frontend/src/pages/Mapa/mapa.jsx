import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import logoRainSafe from '../../assets/RainSafeLogo.svg';

const sensorIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const FATEC_ITAQUERA_COORDS = [-23.5450592, -46.4680615];

const RainSafeMap = () => {
  const [sensores, setSensors] = useState([
    {
      sensor_id: "FATEC_ITAQUERA_01",
      nome: "Sensor Principal - Fatec",
      lat: -23.5450592,
      lng: -46.4680615,
      temperatura: 24.5,
      umidade: 88.0,
      status_chuva: "Alta Probabilidade",
      timestamp: new Date().toISOString()
    },
    {
      sensor_id: "ITAQUERA_PRACA_02",
      nome: "Sensor Secundário - Praça",
      lat: -23.5420000,
      lng: -46.4650000,
      temperatura: 26.0,
      umidade: 55.0,
      status_chuva: "Céu Limpo",
      timestamp: new Date().toISOString()
    }
  ]);

  useEffect(() => {
    /* ==========================================================
       Integração Backend (MQTT ou API) entra aqui
    ========================================================== */
  }, []);

  // --- LÓGICA DE CORES DINÂMICAS ---
  const getHumidityColor = (umidade) => {
    if (umidade >= 80) return "text-red-600 font-bold";
    if (umidade >= 65) return "text-orange-500 font-semibold";
    return "text-green-600 font-medium";
  };

  const getStatusColor = (status) => {
    const s = status.toLowerCase();
    if (s.includes("alta") || s.includes("chuva") || s.includes("alagamento")) return "text-red-600 font-bold";
    if (s.includes("moderada") || s.includes("atenção")) return "text-orange-500 font-semibold";
    return "text-green-600 font-medium";
  };

  // --- LÓGICA DE ALERTA GLOBAL ---
  // Verifica se existe ALGUM sensor com umidade alta E status de chuva
  const isCriticalAlertActive = sensores.some(
    (s) => s.umidade >= 80 && (s.status_chuva.includes("Alta") || s.status_chuva.includes("Chuva"))
  );

  return (
    <div className="flex flex-col h-screen bg-[#f4f7f9] font-sans overflow-hidden">
      
      {/* HEADER */}
      <header className="bg-[#0a2f55] text-white p-4 shadow-lg z-20 flex justify-between items-center relative">
        <div className="flex items-center gap-3">
          <img 
            src={logoRainSafe} 
            alt="RainSafe Logo" 
            className="h-10 w-auto object-contain drop-shadow-md"
          />
          <div className="flex flex-col justify-center">
            <p className="text-xs text-blue-300 leading-tight uppercase tracking-widest">Monitoramento Pluvial</p>
          </div>
        </div>
        <div className={`px-4 py-2 rounded font-bold text-sm shadow-inner transition-colors duration-500 ${isCriticalAlertActive ? 'bg-red-600 text-white animate-pulse' : 'bg-green-500 text-white'}`}>
          {isCriticalAlertActive ? '⚠️ STATUS: ALERTA ATIVO' : '✅ STATUS: NORMAL'}
        </div>
      </header>

      {/* ÁREA DO MAPA */}
      <main className="flex-1 relative z-0">
        
        {/* BANNER DE AVISO DE CHUVA (Flutuante) */}
        {isCriticalAlertActive && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] w-[90%] md:w-[60%]">
            <div className="bg-red-600/90 backdrop-blur-sm text-white p-4 rounded-lg shadow-2xl border-l-8 border-red-900 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold uppercase tracking-wide flex items-center gap-2">
                  <span className="text-2xl">🚨</span> Alerta de Chuva Intensa
                </h2>
                <p className="text-sm mt-1 font-medium text-red-100">
                  Umidade crítica detectada na região. Risco elevado de alagamento nos status em vermelho.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* PAINEL DE RESUMO */}
        <div className="absolute bottom-6 left-6 z-[1000] bg-white/80 backdrop-blur-md p-4 rounded-xl shadow-xl border border-white/50 w-64 pointer-events-none hidden md:block">
          <h3 className="text-[#0a2f55] font-bold text-lg mb-2 border-b border-gray-300/50 pb-1">Visão Geral</h3>
          <div className="flex justify-between items-center text-sm text-gray-700 mb-1">
            <span>Sensores Ativos:</span>
            <span className="font-bold text-[#0a2f55]">{sensores.length}</span>
          </div>
          <div className="flex justify-between items-center text-sm text-gray-700">
            <span>Zonas de Risco:</span>
            <span className="font-bold text-red-600">{sensores.filter(s => s.umidade >= 80).length}</span>
          </div>
        </div>

        {/* MAPA */}
        <MapContainer 
          center={FATEC_ITAQUERA_COORDS} 
          zoom={14} 
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            className="map-tiles"
          />

          {sensores.map((sensor) => (
            <Marker 
              key={sensor.sensor_id} 
              position={[sensor.lat, sensor.lng]} 
              icon={sensorIcon}
            >
              <Popup className="custom-popup">
                <div className="p-2 min-w-[220px]">
                  <h3 className="font-extrabold text-[#0a2f55] border-b-2 border-[#0a2f55]/10 pb-2 mb-3 text-base flex justify-between items-center">
                    {sensor.nome}
                    {sensor.umidade >= 80 && <span className="animate-pulse text-xl" title="Alerta Crítico">⚠️</span>}
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm bg-gray-50/50 p-2 rounded-lg">
                    <div className="flex flex-col">
                      <span className="text-gray-500 text-xs uppercase font-bold tracking-wider">Temperatura</span>
                      <span className="font-semibold text-gray-800 text-base">{sensor.temperatura}°C</span>
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="text-gray-500 text-xs uppercase font-bold tracking-wider">Umidade</span>
                      <span className={`text-base ${getHumidityColor(sensor.umidade)}`}>
                        {sensor.umidade}%
                      </span>
                    </div>

                    <div className="flex flex-col col-span-2 mt-1 pt-2 border-t border-gray-200">
                      <span className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">Status Atual</span>
                      <span className={`text-sm px-2 py-1 rounded bg-white border shadow-sm inline-block w-fit ${getStatusColor(sensor.status_chuva)}`}>
                        {sensor.status_chuva}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-[10px] text-gray-400 mt-3 text-right">
                    ID: {sensor.sensor_id}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </main>
    </div>
  );
};

export default RainSafeMap;