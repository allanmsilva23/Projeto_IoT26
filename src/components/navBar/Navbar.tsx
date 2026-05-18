// import logoRainSafe from '../assets/RainSafeLogo.svg';
// const logoRainSafe = "../assets/RainSafeLogo.svg"
import logoRainSafe from '../../assets/RainSafeLogo.svg';
interface NavbarProps {
  onOpenModal: () => void;
  onToggleHistory: () => void;
  isHistoryOpen: boolean;
  isCritical: boolean;
}

export const Navbar = ({ onOpenModal, onToggleHistory, isHistoryOpen, isCritical }: NavbarProps) => (
  <nav className="bg-[#0a2f55] text-white p-4 shadow-xl z-30 flex justify-between items-center">
    <div className="flex items-center gap-3">
      <img src={logoRainSafe} alt="Logo" className="h-8" />
      <span className="font-bold tracking-tighter text-xl">RainSafe <span className="text-blue-400">Dash</span></span>
    </div>
    
    <div className="flex items-center gap-4">
      <button 
        onClick={onToggleHistory}
        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all border ${isHistoryOpen ? 'bg-white text-[#0a2f55]' : 'bg-white/10 border-white/10 hover:bg-white/20'}`}
      >
        {isHistoryOpen ? '✕ FECHAR LOGS' : '📜 VER HISTÓRICO'}
      </button>
      <button 
        onClick={onOpenModal}
        className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg text-sm font-bold shadow-lg transition-all"
      >
        + NOVO DISPOSITIVO
      </button>
      <div className={`hidden md:block px-4 py-2 rounded font-bold text-xs ${isCritical ? 'bg-red-600 animate-pulse' : 'bg-green-500'}`}>
        {isCritical ? '⚠️ ALERTA' : '✅ NORMAL'}
      </div>
    </div>
  </nav>
);