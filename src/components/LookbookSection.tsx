import React, { useState } from "react";
import { EditorialImage } from "./EditorialImage.tsx";
import type { WardrobeTrack } from "../types/stylist.ts";

interface LookbookItem {
  id: string;
  track: WardrobeTrack;
  title: string;
  subtitle: string;
  garments: string;
  src: string;
  alt: string;
  aspectClass: string;
}

const LOOKBOOK_ITEMS: LookbookItem[] = [
  {
    id: "female-kurta",
    track: "Female",
    title: "Raw Silk Kurta & Organza Dupatta",
    subtitle: "Womenswear · Festive Heritage",
    garments: "Ivory embroidered kurta · emerald trouser · sheer zari dupatta",
    src: "/src/assets/images/lookbook_festive_kurta_1794980783812.jpg",
    alt: "Ivory and deep emerald raw silk kurta with embroidered neckline and sheer organza dupatta",
    aspectClass: "aspect-[3/4]",
  },
  {
    id: "female-saree",
    track: "Female",
    title: "Midnight Plum Silk-Chiffon Saree",
    subtitle: "Womenswear · Evening Drape",
    garments: "Fluid chiffon drape · woven zari pallu · tailored blouse",
    src: "/src/assets/images/lookbook_modern_saree_1794980785251.jpg",
    alt: "Midnight plum silk-chiffon saree with antique woven zari pallu in sunlit studio",
    aspectClass: "aspect-[3/4]",
  },
  {
    id: "male-sherwani",
    track: "Male",
    title: "Midnight Navy Raw Silk Sherwani",
    subtitle: "Menswear · Formal Ceremony",
    garments: "Bandhgala raw silk sherwani · embroidered collar kurta · churidar",
    src: "/src/assets/images/lookbook_mens_sherwani_1794981613461.jpg",
    alt: "Midnight navy raw silk sherwani paired with ivory embroidered collar kurta on travertine pedestal",
    aspectClass: "aspect-[3/4]",
  },
  {
    id: "both-coordination",
    track: "Both",
    title: "Sage Waistcoat & Champagne Organza Peshwas",
    subtitle: "Coordinated Pair · His & Hers",
    garments: "Sage wool-silk waistcoat + ivory kurta · champagne zari peshwas",
    src: "/src/assets/images/lookbook_couple_coordination_1794981614252.jpg",
    alt: "Coordinated male sage waistcoat with ivory kurta beside female champagne organza peshwas",
    aspectClass: "aspect-[4/3]",
  },
];

const SIZING_GUIDE = [
  {
    garment: "Womenswear: Kurta, Gharara & Lehnga",
    checks: [
      "Compare flat-lay chest width (armhole to armhole) rather than tag letters—prêt cuts vary by 1.5–2 inches across houses.",
      "Verify kameez or lehnga outseam length against your exact height and planned heel elevation.",
      "Check choli dart placement and organza sleeve bicep circumference, as structured linings have zero stretch.",
    ],
  },
  {
    garment: "Menswear: Sherwani, Kurta & Waistcoat",
    checks: [
      "Prioritize shoulder seam-to-seam width; structured sherwani and prince-coat shoulders cannot be widened easily.",
      "Verify band-collar (ban) circumference with 0.5 inch breathing ease for formal wear.",
      "Confirm kurta chest ease (typically +4 inches over bare chest) and shalwar/trouser outseam.",
    ],
  },
  {
    garment: "Coordinated Both: Dual Wardrobe Balance",
    checks: [
      "Anchor one shared undertone metallic (antique gold, brushed silver, or matte brass) across waistcoat buttons and zari.",
      "Contrast fabric weights thoughtfully—pair structured wool-silk or raw silk suiting with fluid organza or chiffon drapes.",
      "Verify both partners' garment lengths and collar/neckline proportions separately on each designer's chart.",
    ],
  },
];

export const LookbookSection: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<"All" | WardrobeTrack>("All");

  const visibleItems =
    activeFilter === "All"
      ? LOOKBOOK_ITEMS
      : LOOKBOOK_ITEMS.filter((item) => item.track === activeFilter);

  return (
    <>
      <section id="lookbook" className="py-14 lg:py-20 border-b border-[#141413]/10">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div className="max-w-xl space-y-3">
              <p className="text-xs font-medium tracking-wide text-[#6b1d2f]">
                Atelier Reference
              </p>
              <h2
                className="font-display text-3xl sm:text-4xl font-medium text-[#141413] tracking-tight"
                style={{ textWrap: "balance" }}
              >
                Womenswear, menswear & coordinated dual wardrobes
              </h2>
              <p className="text-sm leading-relaxed text-[#575652]">
                Explore signature silhouettes across Female, Male, and Both ensembles crafted
                from hand-loomed raw silk, banarasi tissue, wool-silk, and woven zari.
              </p>
            </div>

            <div
              role="group"
              aria-label="Filter lookbook by wardrobe"
              className="inline-flex p-1 bg-[#f3f2ef] border border-[#141413]/10 rounded-md shrink-0 self-start md:self-auto"
            >
              {(["All", "Female", "Male", "Both"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveFilter(tab)}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap ${
                    activeFilter === tab
                      ? "bg-[#141413] text-white"
                      : "text-[#575652] hover:text-[#141413]"
                  }`}
                >
                  {tab === "Both" ? "Both (Pair)" : tab}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {visibleItems.map((item) => (
              <figure
                key={item.id}
                className={`space-y-3 ${
                  item.track === "Both" && activeFilter === "All"
                    ? "md:col-span-2 lg:col-span-3"
                    : ""
                }`}
              >
                <div
                  className={`${
                    item.track === "Both" && activeFilter === "All"
                      ? "aspect-[16/9] lg:aspect-[21/9]"
                      : "aspect-[3/4]"
                  } overflow-hidden rounded-lg border border-[#141413]/10 bg-[#f3f2ef]`}
                >
                  <EditorialImage
                    src={item.src}
                    alt={item.alt}
                    className="w-full h-full object-cover"
                    aspectClass={item.aspectClass}
                    fallbackTitle={item.title}
                  />
                </div>
                <figcaption className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 text-xs">
                  <div>
                    <span className="font-medium text-[#141413] block sm:inline">
                      {item.title}
                    </span>
                    <span className="hidden sm:inline mx-2 text-[#575652]" aria-hidden="true">
                      ·
                    </span>
                    <span className="text-[#575652]">{item.garments}</span>
                  </div>
                  <span className="text-[#6b1d2f] font-medium shrink-0">
                    {item.subtitle}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section id="sizing-craft" className="py-14 lg:py-20 border-b border-[#141413]/10">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="max-w-2xl mb-10">
            <p className="text-xs font-medium tracking-wide text-[#6b1d2f] mb-2">
              Return Prevention
            </p>
            <h2
              className="font-display text-3xl sm:text-4xl font-medium text-[#141413] tracking-tight mb-3"
              style={{ textWrap: "balance" }}
            >
              What to verify across Female, Male & Dual size charts
            </h2>
            <p className="text-sm leading-relaxed text-[#575652]">
              Different designers grade S, M, and L differently across unstitched, prêt, and
              bespoke tailoring. Your styling report pairs every outfit with exact checks
              before checkout.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {SIZING_GUIDE.map((item, idx) => (
              <div
                key={item.garment}
                className="bg-white border border-[#141413]/10 rounded-lg p-6 space-y-4"
              >
                <div className="text-xs font-mono tabular-nums text-[#6b1d2f]">
                  0{idx + 1}
                </div>
                <h3 className="font-display text-xl font-semibold text-[#141413]">
                  {item.garment}
                </h3>
                <ul className="space-y-2.5 text-xs leading-relaxed text-[#575652]">
                  {item.checks.map((check) => (
                    <li
                      key={check}
                      className="pt-2.5 border-t border-[#141413]/8 first:pt-0 first:border-t-0"
                    >
                      {check}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};
