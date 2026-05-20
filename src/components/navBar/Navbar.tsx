import logoRainSafe from '../../assets/RainSafeLogo.svg';

interface NavbarProps {
  onOpenModal: () => void;
  onToggleHistory: () => void;
  isHistoryOpen: boolean;
  isCritical: boolean;
}

export const Navbar = ({ onOpenModal, onToggleHistory, isHistoryOpen, isCritical }: NavbarProps) => (
  <nav className="bg-[#0a2f55] text-white px-3 py-4 md:px-4 shadow-xl z-30 flex justify-between items-center gap-2 w-full">
    
    <div className="flex items-center flex-shrink-0">
      <img src={logoRainSafe} alt="Logo" className="h-10 md:h-12 w-auto" />
    </div>
    
    <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
      <button 
        onClick={onToggleHistory}
        className={`px-2.5 py-2 md:px-4 rounded-lg text-sm font-semibold transition-all border whitespace-nowrap ${isHistoryOpen ? 'bg-white text-[#0a2f55]' : 'bg-white/10 border-white/10 hover:bg-white/20'}`}
      >
        {isHistoryOpen ? '✕ FECHAR LOGS' : '📜 VER HISTÓRICO'}
      </button>
      
      <button 
        onClick={onOpenModal}
        className="bg-blue-500 hover:bg-blue-600 px-2.5 py-2 md:px-4 rounded-lg text-sm font-bold shadow-lg transition-all whitespace-nowrap"
      >
        + NOVO DISPOSITIVO
      </button>
      
      <div className={`hidden md:block px-4 py-2 rounded font-bold text-xs whitespace-nowrap ${isCritical ? 'bg-red-600 animate-pulse' : 'bg-green-500'}`}>
        {isCritical ? '⚠️ ALERTA' : '✅ NORMAL'}
      </div>
    </div>
  </nav>
);