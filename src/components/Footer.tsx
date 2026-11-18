import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#fbfbfa] py-10">
      <div className="max-w-[1200px] mx-auto px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#575652]">
        <div className="flex items-center gap-3">
          <span className="font-display text-base font-semibold text-[#141413]">
            Khaas Atelier
          </span>
          <span aria-hidden="true">·</span>
          <span>South Asian & Global Personal Styling</span>
        </div>

        <div className="flex items-center gap-6">
          <a href="#consultation" className="hover:text-[#141413] transition-colors">
            Consultation
          </a>
          <a href="#fit-by-picture" className="hover:text-[#141413] transition-colors">
            Fit by Picture
          </a>
          <a href="#lookbook" className="hover:text-[#141413] transition-colors">
            Lookbook
          </a>
          <a href="#sizing-craft" className="hover:text-[#141413] transition-colors">
            Sizing Guide
          </a>
        </div>
      </div>
    </footer>
  );
};
