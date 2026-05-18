import type { SensorReadout } from "../../interfaces/SensorReadout";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  data: SensorReadout[];
}

export const SidebarHistory = ({ isOpen, onClose, data }: SidebarProps) => (
  <aside className={`fixed right-0 top-0 h-full bg-white shadow-2xl z-[2500] transition-transform duration-500 ease-in-out transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} w-full md:w-[450px] border-l border-gray-200`}>
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h2 className="text-2xl font-bold text-[#0a2f55]">Logs do Sistema</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold sticky top-0">
            <tr>
              <th className="p-2">Sensor</th>
              <th className="p-2">Temp</th>
              <th className="p-2">Umid</th>
              <th className="p-2">Hora</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((log, i) => (
              <tr key={i} className="hover:bg-blue-50/50 transition-colors">
                <td className="p-2 font-mono text-xs text-blue-700">{log.sensor_id}</td>
                <td className="p-2 font-medium">{log.temperatura}°C</td>
                <td className="p-2 font-medium">{log.umidade}%</td>
                <td className="p-2 text-gray-400 text-[10px]">{new Date(log.timestamp).toLocaleTimeString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </aside>
);