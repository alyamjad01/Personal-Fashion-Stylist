import React from "react";
import { ArrowDownRight } from "lucide-react";
import { EditorialImage } from "./EditorialImage.tsx";

interface HeroSectionProps {
  onBeginClick: () => void;
}

const PILLARS = [
  {
    index: "01",
    title: "Undertone & 5-Shade Palette",
    detail: "Calibrated colour matching with exact hex references for fabrics and zari.",
  },
  {
    index: "02",
    title: "Neutral Silhouette Notes",
    detail: "Kind, affirming proportion guidance grounded strictly in your measurements.",
  },
  {
    index: "03",
    title: "Three Curated Ensembles",
    detail: "Real South Asian and global garments tailored to occasion, style, and PKR budget.",
  },
  {
    index: "04",
    title: "Return-Proof Size Checks",
    detail: "Fit Confidence ratings paired with 2–3 exact seller size-chart measurements.",
  },
];

export const HeroSection: React.FC<HeroSectionProps> = ({ onBeginClick }) => {
  return (
    <section id="top" className="border-b border-[#141413]/10">
      <div className="max-w-[1200px] mx-auto px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-between py-2">
            <div>
              <p className="text-xs font-medium tracking-wide text-[#6b1d2f] mb-4">
                South Asian & Global Personal Styling
              </p>
              <h1
                className="font-display font-medium text-[#141413] tracking-tight leading-[1.06] mb-6"
                style={{
                  fontSize: "clamp(2.4rem, 4.1vw, 3.65rem)",
                  textWrap: "balance",
                }}
              >
                Tailored wardrobes built around your undertone, cut, and size chart.
              </h1>
              <p className="text-[15px] leading-relaxed text-[#575652] max-w-xl mb-8">
                Share a clear photograph alongside your height, usual size, and PKR budget.
                Receive a considered five-colour palette, kind silhouette guidance, and three
                complete South Asian or global outfits with seller size-chart checks designed to
                prevent returns.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-2">
              <button
                type="button"
                onClick={onBeginClick}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium bg-[#141413] text-white rounded-md hover:bg-[#2b2a28] transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6b1d2f]"
              >
                <span>Begin Consultation</span>
                <ArrowDownRight className="w-4 h-4" aria-hidden="true" />
              </button>
              <a
                href="#lookbook"
                className="text-sm font-medium text-[#141413] hover:text-[#6b1d2f] underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
              >
                View Atelier Lookbook
              </a>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="h-full min-h-[320px] lg:min-h-[430px] overflow-hidden rounded-lg border border-[#141413]/10 bg-[#f3f2ef]">
              <EditorialImage
                src="/src/assets/images/hero_atelier_drape_1794980783039.jpg"
                alt="Handwoven silk, organza, and cotton textiles in burgundy, ivory, and sage with antique zari borders"
                className="w-full h-full object-cover"
                aspectClass="aspect-[4/3]"
                fallbackTitle="Atelier Textile Study"
              />
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[#141413]/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {PILLARS.map((pillar) => (
            <div key={pillar.index} className="space-y-1.5">
              <div className="text-xs font-mono tabular-nums text-[#6b1d2f]">{pillar.index}</div>
              <h2 className="font-display text-xl font-semibold text-[#141413]">
                {pillar.title}
              </h2>
              <p className="text-xs leading-relaxed text-[#575652]">{pillar.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
