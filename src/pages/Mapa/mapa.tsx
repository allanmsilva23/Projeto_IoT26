// import React from 'react' 
import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
// import logoRainSafe from '../../assets/RainSafeLogo.svg';

import { type Sensor } from '../../interfaces/SensorReadout';
// import { type SensorReadout } from '../../interfaces/SensorReadout';
import { SensorService } from '../../services/SensorService';
import { AddDeviceModal } from '../../components/navBar/AddDeviceModal';
import { SidebarHistory } from '../../components/navBar/SidebarHistory';
import type{ SensorReadout } from '../../interfaces/SensorReadout';
import { Navbar } from '../../components/navBar/Navbar';


const sensorIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const FATEC_ITAQUERA_COORDS: [number, number] = [-23.5450592, -46.4680615];


// const SENSOR_REGISTRY = [
//   { sensor_id: "ESP32_WOKWI_AUTO", nome: "Sensor Principal - Fatec Itaquera", lat: -23.5450592, lng: -46.4680615 },
//   { sensor_id: "ESP32_WOKWI_2", nome: "Sensor Secundário - Praça", lat: -23.5420000, lng: -46.4650000 },
//   { sensor_id: "ESP32_WOKWI_3", nome: "Sensor Terciário - Entrada", lat: -23.5470000, lng: -46.4690000 }
// ];


const RainSafeMap = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  
  const [historico, setHistorico] = useState<SensorReadout[]>([]);

  // const [registry, setRegistry] = useState();
  const [registry, setRegistry] = useState<any[]>([])
  const [sensores, setSensors] = useState<Sensor[]>([]);

  const sensorService = useMemo(() => new SensorService(), []);


  // useEffect(() => {
  //   const carregarDadosIndividuais = async () => {
  //     try {
  //       const promessas = registry.map(s => sensorService.getLatest(s.sensor_id));
  //       const resultados = await Promise.all(promessas);
        
  //       console.log("📡 Leituras unitárias recebidas:", resultados);

  //       const novosDados = registry.map((reg, index) => {
  //         const leitura = resultados[index];
  //         return {
  //           ...reg,
  //           temperatura: leitura?.temperatura || 0,
  //           umidade: leitura?.umidade || 0,
  //           status_chuva: leitura?.status_chuva || "Sem sinal",
  //           timestamp: leitura ? new Date(leitura.timestamp) : new Date()
  //         } as Sensor;
  //       });

  //       setSensors(novosDados);

  //       const hasCritical = resultados.some(
  //         (r: any) => r && r.umidade >= 80 && (r.status_chuva.includes("Alta") || r.status_chuva.includes("Chuva"))
  //       );

  //       if (!hasCritical) {
  //         setBannerDismissed(false);
  //       }
  //     } catch (error) {
  //       console.error("Erro na atualização paralela:", error);
  //     }
  //   };

  //   carregarDadosIndividuais();
  //   const interval = setInterval(carregarDadosIndividuais, 10000); 
  //   return () => clearInterval(interval);
  // }, [sensorService, registry]);


  useEffect(() => {
    const carregarInventario = async () => {
      try {
        const dispositivos = await sensorService.getDevices();
        setRegistry(dispositivos);
      } catch (err) {
        console.error("Erro ao carregar lista de dispositivos:", err);
      }
    };
    carregarInventario();
  }, [sensorService]);


  useEffect(() => {
    const carregarDadosIndividuais = async () => {
      if (registry.length === 0) return;

      try {
        // Dispara requisições paralelas para cada ID no registry
        const promessas = registry.map(s => sensorService.getLatest(s.sensor_id));
        const resultados = await Promise.all(promessas);
        
        console.log("📡 Leituras unitárias recebidas:", resultados);

        // Mescla os metadados do registro com a telemetria recebida
        const novosDados = registry.map((reg, index) => {
          const leitura = resultados[index];
          return {
            ...reg,
            temperatura: leitura?.temperatura || 0,
            umidade: leitura?.umidade || 0,
            status_chuva: leitura?.status_chuva || "Sem sinal",
            timestamp: leitura ? new Date(leitura.timestamp) : new Date()
          } as Sensor;
        });

        setSensors(novosDados);

        // Lógica do Banner de Alerta
        const hasCritical = resultados.some(
          (r: any) => r && r.umidade >= 80 && (r.status_chuva.includes("Alta") || r.status_chuva.includes("Chuva"))
        );

        if (!hasCritical) {
          setBannerDismissed(false);
        }
      } catch (error) {
        console.error("Erro na atualização paralela:", error);
      }
    };

    carregarDadosIndividuais();
    const interval = setInterval(carregarDadosIndividuais, 10000); 
    return () => clearInterval(interval);
  }, [sensorService, registry]);



  const handleAddDevice = async (formData: any) => {
    try {
      const novoDispositivo = {
        sensor_id: formData.id,
        nome: formData.nome,
        lat: parseFloat(formData.lat),
        lng: parseFloat(formData.lng)
      };

      await sensorService.createDevice(novoDispositivo);

      setRegistry(prev => [...prev, novoDispositivo]);
      setIsModalOpen(false);
      
      console.log("🚀 Dispositivo cadastrado com sucesso!");
    } catch (err) {
      alert("Erro ao salvar dispositivo. Verifique o console.");
    }
  };

  const loadHistory = async () => {
    try {
      const data = await sensorService.getHistory();
      setHistorico(data);
      setIsHistoryOpen(true);
    } catch (err) {
      console.error("Erro ao carregar histórico:", err);
    }
  };


  const getHumidityColor = (u: number) => u >= 80 ? "text-red-600 font-bold" : u >= 65 ? "text-orange-500 font-semibold" : "text-green-600 font-medium";
  
  const getStatusColor = (s: string) => {
    const st = s.toLowerCase();
    if (st.includes("alta") || st.includes("chuva")) return "text-red-600 font-bold";
    return "text-green-600 font-medium";
  };

  const isCriticalAlertActive = sensores.some(
    (s) => s.umidade >= 80 && (s.status_chuva.includes("Alta") || s.status_chuva.includes("Chuva"))
  );

  return (
    <div className="flex flex-col h-[100dvh] bg-[#f4f7f9] font-sans overflow-hidden">
      
      <Navbar 
        onOpenModal={() => setIsModalOpen(true)}
        onToggleHistory={isHistoryOpen ? () => setIsHistoryOpen(false) : loadHistory}
        isHistoryOpen={isHistoryOpen}
        isCritical={isCriticalAlertActive}
      />

      <main className="flex-1 relative z-0">

{isCriticalAlertActive && !bannerDismissed && (
  <div className="absolute top-2 md:top-4 left-1/2 transform -translate-x-1/2 z-[1000] w-[95%] sm:w-[90%] md:w-[60%]">
    <div className="bg-red-600/90 backdrop-blur-sm text-white p-3 md:p-4 rounded-lg shadow-2xl border-l-4 md:border-l-8 border-red-900 flex items-center justify-between gap-3">
      <div className="flex-1">
        <h2 className="text-sm md:text-xl font-bold uppercase tracking-wide flex items-center gap-1 md:gap-2">
          <span className="text-lg md:text-2xl animate-bounce">🚨</span> Alerta de Chuva
        </h2>
        <p className="text-xs md:text-sm mt-1 font-medium text-red-100 leading-tight">
          Umidade crítica na região. Risco de alagamento.
        </p>
      </div>
      <button 
        onClick={() => setBannerDismissed(true)}
        className="p-1 md:p-2 hover:bg-white/20 rounded-full transition-colors flex-shrink-0"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>
)}

<div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 md:translate-x-0 md:left-6 md:bottom-6 z-[1000] bg-white/90 md:bg-white/80 backdrop-blur-md p-2 md:p-4 rounded-xl shadow-xl border border-white/50 w-[90%] md:w-64 pointer-events-none flex justify-around md:flex-col items-center md:items-stretch">
  <h3 className="text-[#0a2f55] font-bold text-lg mb-2 border-b border-gray-300/50 pb-1 hidden md:block">Visão Geral</h3>
  
  <div className="flex justify-between items-center text-xs md:text-sm text-gray-700 md:mb-1 gap-2">
    <span className="hidden md:inline">Sensores Ativos:</span>
    <span className="md:hidden">Ativos:</span>
    <span className="font-bold text-[#0a2f55]">{sensores.length}</span>
  </div>

  <div className="w-px h-4 bg-gray-300 md:hidden"></div>

  <div className="flex justify-between items-center text-xs md:text-sm text-gray-700 gap-2">
    <span className="hidden md:inline">Zonas de Risco:</span>
    <span className="md:hidden">Risco:</span>
    <span className="font-bold text-red-600">{sensores.filter(s => s.umidade >= 80).length}</span>
  </div>
</div>

        <MapContainer 
          center={FATEC_ITAQUERA_COORDS} 
          zoom={14} 
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {sensores.map((sensor) => (
            <Marker 
              key={sensor.sensor_id} 
              position={[sensor.lat, sensor.lng]} 
              icon={sensorIcon}
            >
              <Popup className="custom-popup">
                <div className="p-2 min-w-[180px] sm:min-w-[220px] max-w-[260px] sm:max-w-none">
                  <h3 className="font-extrabold text-[#0a2f55] border-b-2 border-[#0a2f55]/10 pb-2 mb-3 text-base flex justify-between items-center">
                    {sensor.nome}
                    {sensor.umidade >= 80 && <span className="animate-pulse text-xl">⚠️</span>}
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm bg-gray-50/50 p-2 rounded-lg">
                    <div className="flex flex-col">
                      <span className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Temperatura</span>
                      <span className="font-semibold text-gray-800 text-base">{sensor.temperatura}°C</span>
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Umidade</span>
                      <span className={`text-base ${getHumidityColor(sensor.umidade)}`}>
                        {sensor.umidade}%
                      </span>
                    </div>

                    <div className="flex flex-col col-span-2 mt-1 pt-2 border-t border-gray-200">
                      <span className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-1">Status Atual</span>
                      <span className={`text-sm px-2 py-1 rounded bg-white border shadow-sm inline-block w-fit ${getStatusColor(sensor.status_chuva)}`}>
                        {sensor.status_chuva}
                      </span>
                      <div className="text-[9px] text-gray-400 mt-2 flex justify-between">
                        <span>ID: {sensor.sensor_id}</span>
                        <span>{sensor.timestamp.toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        <SidebarHistory 
          isOpen={isHistoryOpen} 
          onClose={() => setIsHistoryOpen(false)} 
          data={historico} 
        />

        <AddDeviceModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSave={handleAddDevice} 
        />

      </main>
    </div>
  );
};

export default RainSafeMap;

// const RainSafeMap = () => {
  

//   const [bannerDismissed, setBannerDismissed] = useState(false);
//   // const [sensores, setSensors] = useState([
//   //   {
//   //     sensor_id: "FATEC_ITAQUERA_01",
//   //     nome: "Sensor Principal - Fatec",
//   //     lat: -23.5450592,
//   //     lng: -46.4680615,
//   //     temperatura: 24.5,
//   //     umidade: 88.0,
//   //     status_chuva: "Alta Probabilidade",
//   //     timestamp: new Date().toISOString()
//   //   },
//   //   {
//   //     sensor_id: "ITAQUERA_PRACA_02",
//   //     nome: "Sensor Secundário - Praça",
//   //     lat: -23.5420000,
//   //     lng: -46.4650000,
//   //     temperatura: 26.0,
//   //     umidade: 55.0,
//   //     status_chuva: "Céu Limpo",
//   //     timestamp: new Date().toISOString()
//   //   }
//   // ]);
//   const sensorService = useMemo(() => new SensorService(), []);
  
//   // const [sensores, setSensors] = useState<SensorReadout[]>([]);
//   const [sensores, setSensors] = useState<Sensor[]>(SENSOR_REGISTRY.map(s => ({
//     ...s,
//     temperatura: 0,
//     umidade: 0,
//     status_chuva: "Carregando...",
//     timestamp: new Date()
//   })));
//   // console.log(sensores)
  
//   // useEffect(() => {
//   //   const carregarDados = async () => {
//   //     try {
//   //       const historico = await sensorService.getHistory();
//   //       console.log("⭐ Dados recebidos do Backend:", historico);
//   //       setSensors(prev => prev.map(sensorFixo => {
//   //         const log = historico.find(l => l.sensor_id === sensorFixo.sensor_id);
          
//   //         if (log) {
//   //           return { 
//   //             ...sensorFixo, 
//   //             ...log,
//   //             timestamp: new Date(log.timestamp) 
//   //           };
//   //         }
//   //         // console.log(log)
//   //         return sensorFixo;
//   //       }));
//   //       const currentlyCritical = historico.some(
//   //         (s) => s.umidade >= 80 && (s.status_chuva.includes("Alta") || s.status_chuva.includes("Chuva"))
//   //       );

//   //       if (!currentlyCritical) {
//   //         setBannerDismissed(false);
//   //       }
//   //     } catch (error) {
//   //       console.error("Erro na comunicação com a API RainSafe:", error);
//   //     }
//   //   };

//   //   carregarDados();
//   //   const interval = setInterval(carregarDados, 10000);    
//   //   return () => clearInterval(interval);
//   // }, [sensorService]);

//   useEffect(() => {
//     const carregarDadosIndividuais = async () => {
//       try {
//         // Criamos uma lista de promessas baseada no seu SENSOR_REGISTRY
//         const promessas = sensores.map(s => sensorService.getLatest(s.sensor_id));
        
//         // Aguarda todas as respostas voltarem
//         const resultados = await Promise.all(promessas);
        
//         console.log("📡 Leituras unitárias recebidas:", resultados);

//         setSensors(prev => prev.map((sensorFixo, index) => {
//           const leituraRecente = resultados[index];
          
//           if (leituraRecente) {
//             return { 
//               ...sensorFixo, 
//               ...leituraRecente,
//               timestamp: new Date(leituraRecente.timestamp) 
//             };
//           }
//           return sensorFixo;
//         }));

//         // Verifica se algum dos resultados atuais é crítico para o banner
//         const hasCritical = resultados.some(
//           (r:any) => r && r.umidade >= 80 && (r.status_chuva.includes("Alta") || r.status_chuva.includes("Chuva"))
//         );

//         if (!hasCritical) {
//           setBannerDismissed(false);
//         }
//       } catch (error) {
//         console.error("Erro na atualização paralela:", error);
//       }
//     };

//     carregarDadosIndividuais();
//     const interval = setInterval(carregarDadosIndividuais, 10000); 
    
//     return () => clearInterval(interval);
//   }, [sensorService, sensores.length]);

//   const getHumidityColor = (umidade:number) => {
//     if (umidade >= 80) return "text-red-600 font-bold";
//     if (umidade >= 65) return "text-orange-500 font-semibold";
//     return "text-green-600 font-medium";
//   };

//   const getStatusColor = (status:string) => {
//     const s = status.toLowerCase();
//     if (s.includes("alta") || s.includes("chuva") || s.includes("alagamento")) return "text-red-600 font-bold";
//     if (s.includes("moderada") || s.includes("atenção")) return "text-orange-500 font-semibold";
//     return "text-green-600 font-medium";
//   };

//   const isCriticalAlertActive = sensores.some(
//     (s) => s.umidade >= 80 && (s.status_chuva.includes("Alta") || s.status_chuva.includes("Chuva"))
//   );

//   return (
//     <div className="flex flex-col h-screen bg-[#f4f7f9] font-sans overflow-hidden">
      
//       <header className="bg-[#0a2f55] text-white p-4 shadow-lg z-20 flex justify-between items-center relative">
//         <div className="flex items-center gap-3">
//           <img 
//             src={logoRainSafe} 
//             alt="RainSafe Logo" 
//             className="h-10 w-auto object-contain drop-shadow-md"
//           />
//           <div className="flex flex-col justify-center">
//             <p className="text-xs text-blue-300 leading-tight uppercase tracking-widest">Monitoramento Pluvial</p>
//           </div>
//         </div>
//         <div className={`px-4 py-2 rounded font-bold text-sm shadow-inner transition-colors duration-500 ${isCriticalAlertActive ? 'bg-red-600 text-white animate-pulse' : 'bg-green-500 text-white'}`}>
//           {isCriticalAlertActive ? '⚠️ STATUS: ALERTA ATIVO' : '✅ STATUS: NORMAL'}
//         </div>
//       </header>

//       <main className="flex-1 relative z-0">
        
//         {isCriticalAlertActive && !bannerDismissed &&(
//           <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] w-[90%] md:w-[60%]">
//             <div className="bg-red-600/90 backdrop-blur-sm text-white p-4 rounded-lg shadow-2xl border-l-8 border-red-900 flex items-center justify-between">
//               <div>
//                 <h2 className="text-xl font-bold uppercase tracking-wide flex items-center gap-2">
//                   <span className="text-2xl">🚨</span> Alerta de Chuva Intensa
//                 </h2>
//                 <p className="text-sm mt-1 font-medium text-red-100">
//                   Umidade crítica detectada na região. Risco elevado de alagamento nos status em vermelho.
//                 </p>
//               </div>
//               <button 
//                 onClick={() => setBannerDismissed(true)}
//                 className="ml-4 p-2 hover:bg-white/20 rounded-full transition-colors"
//                 title="Fechar Alerta"
//               >
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                 </svg>
//               </button>
//             </div>
//           </div>
//         )}

//         <div className="absolute bottom-6 left-6 z-[1000] bg-white/80 backdrop-blur-md p-4 rounded-xl shadow-xl border border-white/50 w-64 pointer-events-none hidden md:block">
//           <h3 className="text-[#0a2f55] font-bold text-lg mb-2 border-b border-gray-300/50 pb-1">Visão Geral</h3>
//           <div className="flex justify-between items-center text-sm text-gray-700 mb-1">
//             <span>Sensores Ativos:</span>
//             <span className="font-bold text-[#0a2f55]">{sensores.length}</span>
//           </div>
//           <div className="flex justify-between items-center text-sm text-gray-700">
//             <span>Zonas de Risco:</span>
//             <span className="font-bold text-red-600">{sensores.filter(s => s.umidade >= 80).length}</span>
//           </div>
//         </div>

//         <MapContainer 
//           center={FATEC_ITAQUERA_COORDS} 
//           zoom={14} 
//           style={{ height: "100%", width: "100%" }}
//           zoomControl={false}
//         >
//           <TileLayer
//             attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
//             url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//             className="map-tiles"
//           />

//           {sensores.map((sensor) => (
//             <Marker 
//               key={sensor.sensor_id} 
//               position={[sensor.lat, sensor.lng]} 
//               icon={sensorIcon}
//             >
//               <Popup className="custom-popup">
//                 <div className="p-2 min-w-[220px]">
//                   <h3 className="font-extrabold text-[#0a2f55] border-b-2 border-[#0a2f55]/10 pb-2 mb-3 text-base flex justify-between items-center">
//                     {sensor.nome}
//                     {sensor.umidade >= 80 && <span className="animate-pulse text-xl" title="Alerta Crítico">⚠️</span>}
//                   </h3>
                  
//                   <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm bg-gray-50/50 p-2 rounded-lg">
//                     <div className="flex flex-col">
//                       <span className="text-gray-500 text-xs uppercase font-bold tracking-wider">Temperatura</span>
//                       <span className="font-semibold text-gray-800 text-base">{sensor.temperatura}°C</span>
//                     </div>
                    
//                     <div className="flex flex-col">
//                       <span className="text-gray-500 text-xs uppercase font-bold tracking-wider">Umidade</span>
//                       <span className={`text-base ${getHumidityColor(sensor.umidade)}`}>
//                         {sensor.umidade}%
//                       </span>
//                     </div>

//                     <div className="flex flex-col col-span-2 mt-1 pt-2 border-t border-gray-200">
//                       <span className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">Status Atual</span>
//                       <span className={`text-sm px-2 py-1 rounded bg-white border shadow-sm inline-block w-fit ${getStatusColor(sensor.status_chuva)}`}>
//                         {sensor.status_chuva}
//                       </span>
//                       <p className="text-[10px] text-gray-400 mt-3 flex justify-between">
//                         <span>ID: {sensor.sensor_id}</span>
//                         <span>Atualizado: {sensor.timestamp.toLocaleTimeString()}</span>
//                       </p>
//                     </div>
//                   </div>
                  
//                   <p className="text-[10px] text-gray-400 mt-3 text-right">
//                     ID: {sensor.sensor_id}
//                   </p>
//                 </div>
//                 <div>Total de sensores: {sensores.length}</div>
//               </Popup>
//             </Marker>
//           ))}
//         </MapContainer>
//       </main>
//     </div>
//   );
// };

// export default RainSafeMap;