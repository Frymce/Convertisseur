export default function Footer() {
  return (
    <footer className="bg-[#eff4ff] w-full mt-12">
      <div className="flex flex-col md:flex-row justify-between items-center py-6 px-6 max-w-[1280px] mx-auto border-t border-[#c7c4d7]/30 gap-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#0b1c30]">layers</span>
          <span className="text-xl font-bold text-[#0b1c30]">PixelShift</span>
        </div>
        <div className="flex gap-6 flex-wrap justify-center">
          {['Terms of Service', 'Privacy Policy', 'Help Center', 'API Documentation'].map(link => (
            <a key={link} href="#" className="text-[#464554] hover:text-[#4648d4] underline text-xs font-semibold">{link}</a>
          ))}
        </div>
        <p className="text-[#464554] text-xs opacity-80">© 2024 PixelShift Pro. All rights reserved.</p>
      </div>
    </footer>
  );
}
