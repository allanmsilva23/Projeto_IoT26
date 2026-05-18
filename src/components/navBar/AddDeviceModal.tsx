import { useState } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (device: any) => void;
}

export const AddDeviceModal = ({ isOpen, onClose, onSave }: ModalProps) => {
  const [form, setForm] = useState({ id: '', nome: '', lat: '', lng: '' });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-[#0a2f55]/60 backdrop-blur-sm p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
        <h2 className="text-2xl font-bold text-[#0a2f55] mb-6">Cadastrar Dispositivo</h2>
        <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="space-y-4">
          <input required placeholder="ID do Sensor (Ex: ESP32_03)" className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-400" 
            onChange={e => setForm({...form, id: e.target.value})} />
          <input required placeholder="Nome Local (Ex: Entrada Sul)" className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-400"
            onChange={e => setForm({...form, nome: e.target.value})} />
          <div className="flex gap-3">
            <input required type="number" step="any" placeholder="Latitude" className="w-1/2 p-3 border rounded-xl"
              onChange={e => setForm({...form, lat: e.target.value})} />
            <input required type="number" step="any" placeholder="Longitude" className="w-1/2 p-3 border rounded-xl"
              onChange={e => setForm({...form, lng: e.target.value})} />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-all">CANCELAR</button>
            <button type="submit" className="flex-1 py-3 bg-[#0a2f55] text-white font-bold rounded-xl hover:bg-blue-900 shadow-lg transition-all">SALVAR</button>
          </div>
        </form>
      </div>
    </div>
  );
};