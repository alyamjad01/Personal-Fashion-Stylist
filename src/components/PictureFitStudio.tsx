import React, { useRef, useState } from "react";
import { Upload, X, Loader2, AlertCircle } from "lucide-react";
import type {
  PictureFitResponse,
  UploadedImageItem,
  WardrobeTrack,
} from "../types/stylist.ts";
import { readAndNormalizeImage } from "../utils/image.ts";

const TRACK_OPTIONS: WardrobeTrack[] = ["Female", "Male", "Both"];

export const PictureFitStudio: React.FC = () => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [pictures, setPictures] = useState<UploadedImageItem[]>([]);
  const [wardrobeTrack, setWardrobeTrack] = useState<WardrobeTrack>("Both");
  const [height, setHeight] = useState<string>("");
  const [usualSize, setUsualSize] = useState<string>("");
  const [occasion, setOccasion] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PictureFitResponse | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);
    const remaining = 3 - pictures.length;
    if (remaining <= 0) {
      setError("You can analyze up to 3 outfit pictures at a time.");
      return;
    }

    const picked = Array.from(files).slice(0, remaining);
    try {
      const processed = await Promise.all(picked.map((f) => readAndNormalizeImage(f)));
      setPictures((prev) => [...prev, ...processed].slice(0, 3));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load selected garment picture."
      );
    } finally {
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const removePicture = (id: string) => {
    setPictures((prev) => prev.filter((p) => p.id !== id));
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (pictures.length === 0) {
      setError("Upload at least 1 outfit or garment picture to get fit suggestions.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/suggest-fits-from-pictures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pictures: pictures.map((p) => ({
            base64: p.base64,
            mimeType: p.mimeType,
          })),
          wardrobeTrack,
          height: height.trim() || undefined,
          usualSize: usualSize.trim() || undefined,
          occasion: occasion.trim() || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Unable to analyze uploaded pictures.");
      }

      setResult(data as PictureFitResponse);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Network error while analyzing pictures."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="fit-by-picture" className="py-14 lg:py-20 border-b border-[#141413]/10">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <p className="text-xs font-medium tracking-wide text-[#6b1d2f] mb-2">
              Visual Garment & Fit Analyzer
            </p>
            <h2
              className="font-display text-3xl sm:text-4xl font-medium text-[#141413] tracking-tight mb-3"
              style={{ textWrap: "balance" }}
            >
              Suggest fits directly from outfit pictures
            </h2>
            <p className="text-sm leading-relaxed text-[#575652]">
              Upload 1 to 3 pictures of kurtas, sherwanis, sarees, lehngas, or Western
              tailoring. Gemini inspects the garment cut, drape, and shades to suggest the
              best fit adjustments and size-chart checks.
            </p>
          </div>

          <div
            role="group"
            aria-label="Picture fit wardrobe filter"
            className="inline-flex p-1 bg-[#f3f2ef] border border-[#141413]/10 rounded-md shrink-0 self-start lg:self-auto"
          >
            {TRACK_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setWardrobeTrack(option)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap ${
                  wardrobeTrack === option
                    ? "bg-[#141413] text-white"
                    : "text-[#575652] hover:text-[#141413]"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <form
          onSubmit={handleAnalyze}
          className="bg-white border border-[#141413]/10 rounded-lg p-6 sm:p-8 space-y-6"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#141413]">
                  Outfit Pictures ({pictures.length}/3)
                </span>
                {pictures.length < 3 && (
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#fbfbfa] border border-[#141413]/20 text-[#141413] rounded-md hover:border-[#141413] transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Upload Pictures</span>
                  </button>
                )}
              </div>

              {pictures.length === 0 ? (
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="w-full min-h-[180px] rounded-lg border border-dashed border-[#141413]/25 bg-[#f3f2ef]/60 hover:border-[#141413]/45 transition-colors flex flex-col items-center justify-center p-6 text-center cursor-pointer"
                >
                  <Upload className="w-5 h-5 text-[#6b1d2f] mb-2.5" aria-hidden="true" />
                  <span className="text-sm font-medium text-[#141413] mb-1">
                    Select up to 3 garment or lookbook photos
                  </span>
                  <span className="text-xs text-[#575652]">
                    Supports JPG, PNG, and WebP
                  </span>
                </button>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {pictures.map((pic, idx) => (
                    <div
                      key={pic.id}
                      className="relative aspect-[3/4] rounded-md overflow-hidden border border-[#141413]/10 bg-[#f3f2ef]"
                    >
                      <img
                        src={pic.previewUrl}
                        alt={`Uploaded outfit picture ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removePicture(pic.id)}
                        aria-label={`Remove picture ${idx + 1}`}
                        className="absolute top-2 right-2 p-1.5 rounded bg-white/95 text-[#141413] border border-[#141413]/15 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={(e) => {
                  void handleFiles(e.target.files);
                }}
                className="sr-only"
              />
            </div>

            <div className="lg:col-span-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="pic-height"
                    className="block text-xs font-medium text-[#141413] mb-1.5"
                  >
                    Height (Optional)
                  </label>
                  <input
                    id="pic-height"
                    type="text"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder={`e.g. 5'8" or 173 cm`}
                    className="w-full px-3.5 py-2 text-sm bg-[#fbfbfa] border border-[#141413]/15 rounded-md text-[#141413] placeholder:text-[#575652]/60 focus:outline-none focus:border-[#6b1d2f]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="pic-size"
                    className="block text-xs font-medium text-[#141413] mb-1.5"
                  >
                    Usual Size (Optional)
                  </label>
                  <input
                    id="pic-size"
                    type="text"
                    value={usualSize}
                    onChange={(e) => setUsualSize(e.target.value)}
                    placeholder="e.g. M, L, Chest 40"
                    className="w-full px-3.5 py-2 text-sm bg-[#fbfbfa] border border-[#141413]/15 rounded-md text-[#141413] placeholder:text-[#575652]/60 focus:outline-none focus:border-[#6b1d2f]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="pic-occasion"
                  className="block text-xs font-medium text-[#141413] mb-1.5"
                >
                  Target Occasion (Optional)
                </label>
                <input
                  id="pic-occasion"
                  type="text"
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  placeholder="e.g. Walima, Eid, Formal Office"
                  className="w-full px-3.5 py-2 text-sm bg-[#fbfbfa] border border-[#141413]/15 rounded-md text-[#141413] placeholder:text-[#575652]/60 focus:outline-none focus:border-[#6b1d2f]"
                />
              </div>

              {error && (
                <div
                  role="alert"
                  className="p-3 rounded-md bg-[#6b1d2f]/8 border border-[#6b1d2f]/25 flex items-start gap-2 text-xs text-[#6b1d2f]"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{error}</span>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-medium bg-[#141413] text-white rounded-md hover:bg-[#2b2a28] disabled:opacity-60 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                      <span>Evaluating Fit…</span>
                    </>
                  ) : (
                    <span>Suggest Fits from Pictures</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>

        {result && (
          <div className="mt-8 space-y-6">
            {result.summary && (
              <div className="bg-[#f3f2ef] border border-[#141413]/10 rounded-lg p-5">
                <span className="block text-xs font-medium text-[#6b1d2f] mb-1">
                  Stylist Picture Assessment
                </span>
                <p className="text-sm leading-relaxed text-[#141413]">{result.summary}</p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {result.fits.map((fit, idx) => {
                const matchedPicture = pictures[fit.pictureNumber - 1] || pictures[idx];
                return (
                  <article
                    key={`${fit.garmentName}-${idx}`}
                    className="bg-white border border-[#141413]/10 rounded-lg p-6 space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#141413]/10 text-xs">
                        <span className="font-mono tabular-nums text-[#6b1d2f]">
                          Picture 0{fit.pictureNumber} · {fit.wardrobeSection}
                        </span>
                        <span className="text-[#575652]">{fit.silhouetteCut}</span>
                      </div>

                      {matchedPicture && (
                        <div className="aspect-[4/3] rounded-md overflow-hidden border border-[#141413]/10 bg-[#f3f2ef]">
                          <img
                            src={matchedPicture.previewUrl}
                            alt={fit.garmentName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      <div>
                        <h3 className="font-display text-2xl font-medium text-[#141413] mb-1">
                          {fit.garmentName}
                        </h3>
                        <p className="text-xs leading-relaxed text-[#575652]">
                          {fit.recommendedFor}
                        </p>
                      </div>

                      {fit.colourPalette.length > 0 && (
                        <div className="flex items-center gap-2 pt-1">
                          {fit.colourPalette.map((c, cIdx) => (
                            <div key={`${c.hex}-${cIdx}`} className="flex items-center gap-1.5">
                              <span
                                className="w-4 h-4 rounded-sm border border-[#141413]/15 inline-block"
                                style={{ backgroundColor: c.hex }}
                                title={`${c.name} (${c.hex})`}
                              />
                            </div>
                          ))}
                          <span className="text-[11px] text-[#575652] truncate">
                            {fit.colourPalette.map((c) => c.name).join(" · ")}
                          </span>
                        </div>
                      )}

                      <div>
                        <span className="block text-xs font-medium text-[#141413] mb-1">
                          Sizing & Tailoring Advice
                        </span>
                        <p className="text-xs leading-relaxed text-[#575652]">
                          {fit.sizingAdvice}
                        </p>
                      </div>

                      <div>
                        <span className="block text-xs font-medium text-[#141413] mb-1.5">
                          Fit Suggestions
                        </span>
                        <ul className="space-y-1.5 text-xs text-[#575652]">
                          {fit.fitSuggestions.map((s) => (
                            <li key={s} className="leading-relaxed">
                              · {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#141413]/10">
                      <span className="block text-xs font-medium text-[#141413] mb-1.5">
                        Size-Chart Checks
                      </span>
                      <ul className="space-y-1 text-xs text-[#575652]">
                        {fit.checkBeforeBuying.map((c) => (
                          <li key={c} className="leading-relaxed">
                            · {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
