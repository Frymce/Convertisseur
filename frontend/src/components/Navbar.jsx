export default function Navbar({ activePage }) {
  return (
    <header className="bg-surface/80 backdrop-blur-md shadow-sm w-full top-0 sticky z-50" style={{ backgroundColor: 'rgba(248,249,255,0.8)' }}>
      <nav className="flex justify-between items-center h-16 px-6 max-w-[1280px] mx-auto">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#4648d4] text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>layers</span>
          <span className="text-2xl font-bold text-[#4648d4]">PixelShift</span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <a href="#" className={`text-base transition-colors duration-200 ${activePage === 'home' ? 'text-[#4648d4] border-b-2 border-[#4648d4] pb-1' : 'text-[#464554] hover:text-[#4648d4]'}`}>Features</a>
          <a href="#" className="text-[#464554] hover:text-[#4648d4] transition-colors duration-200 text-base">Pricing</a>
          <a href="#" className={`text-base transition-colors duration-200 ${activePage === 'results' ? 'text-[#4648d4] border-b-2 border-[#4648d4] pb-1' : 'text-[#464554] hover:text-[#4648d4]'}`}>My Gallery</a>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-[#4648d4] text-sm font-medium px-4 py-2 hover:bg-[#4648d4]/5 rounded-lg transition-colors">Sign In</button>
          <button className="bg-[#4648d4] text-white text-sm font-medium px-6 py-2 rounded-lg hover:shadow-lg active:scale-95 transition-all">Get Started</button>
        </div>
      </nav>
    </header>
  );
}
