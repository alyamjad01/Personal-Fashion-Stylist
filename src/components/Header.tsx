import React from "react";

interface HeaderProps {
  hasReport: boolean;
  onStartConsultation: () => void;
}

export const Header: React.FC<HeaderProps> = ({ hasReport, onStartConsultation }) => {
  return (
    <header className="sticky top-0 z-30 bg-[#fbfbfa]/95 backdrop-blur-sm border-b border-[#141413]/10">
      <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between gap-8">
        <a
          href="#top"
          className="font-display text-2xl font-semibold tracking-tight text-[#141413] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6b1d2f]"
        >
          Khaas Atelier
        </a>

        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-[#575652]"
        >
          <a
            href="#consultation"
            className="hover:text-[#141413] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Consultation
          </a>
          {hasReport && (
            <a
              href="#styling-report"
              className="hover:text-[#141413] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Styling Report
            </a>
          )}
          <a
            href="#fit-by-picture"
            className="hover:text-[#141413] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Fit by Picture
          </a>
          <a
            href="#lookbook"
            className="hover:text-[#141413] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Lookbook
          </a>
          <a
            href="#sizing-craft"
            className="hover:text-[#141413] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Sizing Guide
          </a>
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onStartConsultation}
            className="px-4 py-2 text-xs font-medium bg-[#6b1d2f] text-white rounded-md hover:bg-[#581625] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6b1d2f]"
          >
            New Consultation
          </button>
        </div>
      </div>
    </header>
  );
};
