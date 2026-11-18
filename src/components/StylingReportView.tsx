import React, { useState } from "react";
import {
  Check,
  Copy,
  CheckCircle2,
  AlertTriangle,
  Info,
} from "lucide-react";
import type { StylingReport, StylistFormInput } from "../types/stylist.ts";

interface StylingReportViewProps {
  report: StylingReport;
  submittedDetails: StylistFormInput;
  submittedPhotoUrl: string;
}

function getConfidencePresentation(confidence: string) {
  const normalized = confidence.toLowerCase();
  if (normalized === "high") {
    return {
      label: "High Fit Confidence",
      textColor: "text-emerald-800",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      Icon: CheckCircle2,
    };
  }
  if (normalized === "low") {
    return {
      label: "Low Fit Confidence",
      textColor: "text-[#6b1d2f]",
      bgColor: "bg-[#6b1d2f]/8",
      borderColor: "border-[#6b1d2f]/25",
      Icon: AlertTriangle,
    };
  }
  return {
    label: "Medium Fit Confidence",
    textColor: "text-amber-900",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    Icon: Info,
  };
}

export const StylingReportView: React.FC<StylingReportViewProps> = ({
  report,
  submittedDetails,
  submittedPhotoUrl,
}) => {
  const [viewMode, setViewMode] = useState<"editorial" | "json">("editorial");
  const [selectedOutfitIdx, setSelectedOutfitIdx] = useState<number>(0);
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const toggleChecklistItem = (key: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const cleanCoreJson = {
    undertone: report.undertone,
    undertoneNote: report.undertoneNote,
    palette: report.palette,
    bodyShape: report.bodyShape,
    outfits: report.outfits.map((o) => ({
      name: o.name,
      description: o.description,
      pieces: o.pieces,
      colours: o.colours,
      size: o.size,
      fitConfidence: o.fitConfidence,
      fitReason: o.fitReason,
      priceEstimatePKR: o.priceEstimatePKR,
      whyItSuits: o.whyItSuits,
      checkBeforeBuying: o.checkBeforeBuying,
    })),
  };

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(cleanCoreJson, null, 2));
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2000);
    } catch {
      // Clipboard access denied
    }
  };

  const handleCopyHex = async (hex: string) => {
    try {
      await navigator.clipboard.writeText(hex);
      setCopiedHex(hex);
      setTimeout(() => setCopiedHex(null), 1600);
    } catch {
      // Clipboard access denied
    }
  };

  const activeOutfit = report.outfits[selectedOutfitIdx] || report.outfits[0];
  const activeHexes =
    activeOutfit?.overlayHexes && activeOutfit.overlayHexes.length > 0
      ? activeOutfit.overlayHexes
      : report.palette.slice(0, 3).map((p) => p.hex);

  return (
    <section
      id="styling-report"
      className="py-14 lg:py-20 bg-[#f3f2ef]/55 border-b border-[#141413]/10"
    >
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#141413]/10">
          <div>
            <p className="text-xs font-medium tracking-wide text-[#6b1d2f] mb-2">
              Personal Styling Dossier
            </p>
            <h2
              className="font-display text-3xl sm:text-4xl font-medium text-[#141413] tracking-tight"
              style={{ textWrap: "balance" }}
            >
              Curated Wardrobe & Colour Report
            </h2>
            <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs text-[#575652]">
              <span>Track: {submittedDetails.wardrobeTrack}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">Height: {submittedDetails.height}</span>
              <span aria-hidden="true">·</span>
              <span>Usual Size: {submittedDetails.usualSize}</span>
              <span aria-hidden="true">·</span>
              <span>{submittedDetails.occasion}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{submittedDetails.budget}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="inline-flex items-center p-1 bg-white border border-[#141413]/10 rounded-md">
              <button
                type="button"
                onClick={() => setViewMode("editorial")}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap ${
                  viewMode === "editorial"
                    ? "bg-[#141413] text-white"
                    : "text-[#575652] hover:text-[#141413]"
                }`}
              >
                Editorial View
              </button>
              <button
                type="button"
                onClick={() => setViewMode("json")}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap ${
                  viewMode === "json"
                    ? "bg-[#141413] text-white"
                    : "text-[#575652] hover:text-[#141413]"
                }`}
              >
                JSON Output
              </button>
            </div>

            <button
              type="button"
              onClick={handleCopyJson}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-white border border-[#141413]/15 text-[#141413] rounded-md hover:border-[#141413]/40 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              {copiedJson ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-700" aria-hidden="true" />
                  <span>Copied JSON</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Copy JSON</span>
                </>
              )}
            </button>
          </div>
        </div>

        {viewMode === "json" ? (
          <div className="mt-8 bg-[#141413] text-[#fbfbfa] rounded-lg border border-[#141413]/15 p-6 overflow-x-auto">
            <pre className="font-mono text-xs leading-relaxed whitespace-pre-wrap break-words">
              {JSON.stringify(cleanCoreJson, null, 2)}
            </pre>
          </div>
        ) : (
          <div className="mt-10 space-y-12">
            {submittedPhotoUrl && activeOutfit && (
              <div className="bg-white border border-[#141413]/10 rounded-lg p-6 sm:p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#141413]/10">
                  <div>
                    <p className="text-xs font-medium text-[#6b1d2f] mb-1">
                      On-Photo Outfit & Colour-Drape Preview
                    </p>
                    <h3 className="font-display text-2xl font-medium text-[#141413]">
                      Preview Recommended Ensembles on Your Portrait
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#f3f2ef] rounded-md border border-[#141413]/10">
                    {report.outfits.map((outfit, idx) => (
                      <button
                        key={`${outfit.name}-preview-${idx}`}
                        type="button"
                        onClick={() => setSelectedOutfitIdx(idx)}
                        className={`px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap ${
                          selectedOutfitIdx === idx
                            ? "bg-[#141413] text-white"
                            : "text-[#575652] hover:text-[#141413]"
                        }`}
                      >
                        0{idx + 1} · {outfit.forWhom || submittedDetails.wardrobeTrack}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                  <div className="lg:col-span-5">
                    <div
                      className="relative rounded-lg overflow-hidden border border-[#141413]/15 p-4 h-full min-h-[340px] flex flex-col justify-between transition-colors duration-200"
                      style={{
                        background: `linear-gradient(155deg, ${activeHexes[0] || "#6B1D2F"}18 0%, #f3f2ef 55%, ${activeHexes[1] || activeHexes[0] || "#141413"}22 100%)`,
                      }}
                    >
                      <div className="relative rounded-md overflow-hidden border border-[#141413]/10 bg-[#ebe9e4] flex-1 min-h-[260px]">
                        <img
                          src={submittedPhotoUrl}
                          alt="Client photo with selected outfit drape framing"
                          className="w-full h-full max-h-[360px] object-contain mx-auto"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/45 to-transparent p-4 text-white">
                          <div className="text-[11px] font-mono uppercase tracking-wider text-white/80 mb-0.5">
                            {activeOutfit.necklineCut || "Tailored Cut"} · Size {activeOutfit.size}
                          </div>
                          <div className="font-display text-lg font-medium leading-snug">
                            {activeOutfit.name}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#141413]/10 flex items-center justify-between gap-4">
                        <span className="text-[11px] font-medium text-[#575652]">
                          Fabric Drape Swatches
                        </span>
                        <div className="flex items-center gap-2">
                          {activeHexes.map((hex, i) => (
                            <span
                              key={`${hex}-${i}`}
                              title={hex}
                              className="w-6 h-6 rounded border border-[#141413]/15"
                              style={{ backgroundColor: hex }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-baseline justify-between gap-4">
                        <span className="text-xs font-mono tabular-nums text-[#6b1d2f]">
                          Selected Look 0{selectedOutfitIdx + 1} ({activeOutfit.forWhom || submittedDetails.wardrobeTrack})
                        </span>
                        <span className="text-xs font-mono tabular-nums font-medium text-[#141413]">
                          {activeOutfit.priceEstimatePKR}
                        </span>
                      </div>

                      <h4 className="font-display text-3xl font-medium text-[#141413]">
                        {activeOutfit.name}
                      </h4>

                      <p className="text-sm leading-relaxed text-[#575652]">
                        {activeOutfit.description}
                      </p>

                      {activeOutfit.drapeFocus && (
                        <div className="p-4 rounded-md bg-[#fbfbfa] border border-[#141413]/10">
                          <span className="block text-xs font-medium text-[#141413] mb-1">
                            How This Cut Frames Your Photo
                          </span>
                          <p className="text-xs leading-relaxed text-[#575652]">
                            {activeOutfit.drapeFocus}
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
                        <div>
                          <span className="block font-medium text-[#141413] mb-1">
                            Included Pieces
                          </span>
                          <p className="text-[#575652] leading-relaxed">
                            {activeOutfit.pieces.join(" · ")}
                          </p>
                        </div>
                        <div>
                          <span className="block font-medium text-[#141413] mb-1">
                            Shade Pairing
                          </span>
                          <p className="text-[#575652] leading-relaxed">
                            {activeOutfit.colours.join(" · ")}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#141413]/10 text-xs text-[#575652]">
                      Colour-drape swatches and proportion framing are calibrated by Gemini 4
                      Hydrogen to your uploaded portrait and undertone.
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              <div className="lg:col-span-7 bg-white border border-[#141413]/10 rounded-lg p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-medium text-[#575652] mb-1">
                    Skin Undertone & Five-Shade Palette
                  </div>
                  <h3 className="font-display text-2xl sm:text-3xl font-medium text-[#141413] mb-3">
                    {report.undertone}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#575652] mb-8">
                    {report.undertoneNote}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  {report.palette.map((color, idx) => (
                    <button
                      key={`${color.hex}-${idx}`}
                      type="button"
                      onClick={() => handleCopyHex(color.hex)}
                      title={`Copy ${color.hex}`}
                      className="text-left group cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6b1d2f]"
                    >
                      <div
                        className="h-20 w-full rounded-md border border-[#141413]/10 mb-2.5 transition-transform duration-150 group-hover:-translate-y-0.5"
                        style={{ backgroundColor: color.hex }}
                      />
                      <div className="text-xs font-medium text-[#141413] leading-snug">
                        {color.name}
                      </div>
                      <div className="text-[11px] font-mono tabular-nums text-[#575652] mt-0.5">
                        {copiedHex === color.hex ? "Copied" : color.hex}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-5 bg-white border border-[#141413]/10 rounded-lg p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-medium text-[#575652] mb-1">
                    Proportion & Silhouette Note
                  </div>
                  <h3 className="font-display text-2xl font-medium text-[#141413] mb-4">
                    Balanced Cut Guidance
                  </h3>
                  <p className="text-sm leading-relaxed text-[#575652]">
                    {report.bodyShape}
                  </p>
                </div>

                <div className="mt-6 pt-5 border-t border-[#141413]/10 grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="block text-[#575652] mb-0.5">Recorded Height</span>
                    <span className="font-mono tabular-nums font-medium text-[#141413]">
                      {submittedDetails.height}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[#575652] mb-0.5">Baseline Size</span>
                    <span className="font-mono tabular-nums font-medium text-[#141413]">
                      {submittedDetails.usualSize}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {report.pictureFitInsights && report.pictureFitInsights.length > 0 && (
              <div className="bg-white border border-[#141413]/10 rounded-lg p-6 sm:p-8">
                <p className="text-xs font-medium text-[#6b1d2f] mb-1">
                  Attached Reference Pictures
                </p>
                <h3 className="font-display text-2xl font-medium text-[#141413] mb-6">
                  Fit Verdict on Your Uploaded Outfit Pictures
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {report.pictureFitInsights.map((insight) => (
                    <div
                      key={`ref-insight-${insight.pictureNumber}`}
                      className="p-5 rounded-md bg-[#fbfbfa] border border-[#141413]/10 space-y-2.5"
                    >
                      <div className="text-xs font-mono tabular-nums text-[#6b1d2f]">
                        Picture 0{insight.pictureNumber}
                      </div>
                      <h4 className="font-display text-xl font-medium text-[#141413]">
                        {insight.garmentDetected}
                      </h4>
                      <p className="text-xs leading-relaxed text-[#141413]">
                        {insight.fitVerdict}
                      </p>
                      <p className="text-xs leading-relaxed text-[#575652] pt-2 border-t border-[#141413]/8">
                        {insight.adjustmentTip}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="mb-6">
                <p className="text-xs font-medium text-[#6b1d2f] mb-1">
                  Three Tailored Recommendations
                </p>
                <h3 className="font-display text-2xl sm:text-3xl font-medium text-[#141413]">
                  Outfits Selected for {submittedDetails.occasion}
                </h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
                {report.outfits.map((outfit, outfitIndex) => {
                  const confidence = getConfidencePresentation(outfit.fitConfidence);
                  const ConfidenceIcon = confidence.Icon;

                  return (
                    <article
                      key={`${outfit.name}-${outfitIndex}`}
                      className="bg-white border border-[#141413]/10 rounded-lg p-6 sm:p-7 flex flex-col justify-between"
                    >
                      <div className="space-y-5">
                        <div className="flex items-baseline justify-between gap-4 pb-4 border-b border-[#141413]/10">
                          <span className="text-xs font-mono tabular-nums text-[#6b1d2f]">
                            0{outfitIndex + 1} · {outfit.forWhom || submittedDetails.wardrobeTrack}
                          </span>
                          <span className="text-xs font-mono tabular-nums font-medium text-[#141413]">
                            {outfit.priceEstimatePKR}
                          </span>
                        </div>

                        <div>
                          <h4 className="font-display text-2xl font-medium text-[#141413] leading-snug mb-2">
                            {outfit.name}
                          </h4>
                          <p className="text-sm leading-relaxed text-[#575652]">
                            {outfit.description}
                          </p>
                        </div>

                        <div className="space-y-3 pt-1 text-xs">
                          <div>
                            <span className="block font-medium text-[#141413] mb-1">
                              Garment Pieces
                            </span>
                            <p className="text-[#575652] leading-relaxed">
                              {outfit.pieces.join(" · ")}
                            </p>
                          </div>
                          <div>
                            <span className="block font-medium text-[#141413] mb-1">
                              Recommended Colours
                            </span>
                            <p className="text-[#575652] leading-relaxed">
                              {outfit.colours.join(" · ")}
                            </p>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-[#141413]/10 space-y-2.5">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-xs font-medium text-[#575652]">
                              Recommended Size
                            </span>
                            <span className="text-sm font-mono tabular-nums font-medium text-[#141413]">
                              {outfit.size}
                            </span>
                          </div>

                          <div
                            className={`p-3 rounded-md border ${confidence.bgColor} ${confidence.borderColor}`}
                          >
                            <div
                              className={`flex items-center gap-1.5 text-xs font-medium ${confidence.textColor} mb-1`}
                            >
                              <ConfidenceIcon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                              <span>{confidence.label}</span>
                            </div>
                            <p className="text-xs leading-relaxed text-[#141413]/80">
                              {outfit.fitReason}
                            </p>
                          </div>
                        </div>

                        <div>
                          <span className="block text-xs font-medium text-[#141413] mb-1">
                            Why It Suits You
                          </span>
                          <p className="text-xs leading-relaxed text-[#575652]">
                            {outfit.whyItSuits}
                          </p>
                        </div>
                      </div>

                      <div className="mt-6 pt-5 border-t border-[#141413]/10">
                        <span className="block text-xs font-medium text-[#141413] mb-3">
                          Check Seller Size Chart Before Buying
                        </span>
                        <ul className="space-y-2.5">
                          {outfit.checkBeforeBuying.map((checkItem, checkIdx) => {
                            const key = `${outfitIndex}-${checkIdx}`;
                            const isChecked = !!checkedItems[key];
                            return (
                              <li key={key}>
                                <label className="flex items-start gap-2.5 text-xs text-[#575652] cursor-pointer select-none">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => toggleChecklistItem(key)}
                                    className="mt-0.5 h-3.5 w-3.5 rounded border-[#141413]/30 accent-[#6b1d2f] shrink-0 cursor-pointer"
                                  />
                                  <span
                                    className={`leading-relaxed ${
                                      isChecked ? "line-through opacity-60" : "text-[#141413]"
                                    }`}
                                  >
                                    {checkItem}
                                  </span>
                                </label>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
