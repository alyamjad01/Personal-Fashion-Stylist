import React, { useRef, useState } from "react";
import { Upload, X, AlertCircle, Loader2, Plus } from "lucide-react";
import type {
  StylistFormInput,
  UploadedImageItem,
  WardrobeTrack,
} from "../types/stylist.ts";
import { readAndNormalizeImage } from "../utils/image.ts";

interface ConsultationFormProps {
  onSubmit: (payload: {
    imageBase64: string;
    mimeType: string;
    previewUrl: string;
    referenceImages: Array<{ base64: string; mimeType: string }>;
    details: StylistFormInput;
  }) => Promise<void>;
  isLoading: boolean;
  errorMessage: string | null;
}

const WARDROBE_TRACKS: Array<{ value: WardrobeTrack; label: string; hint: string }> = [
  { value: "Female", label: "Female", hint: "Kurta, gharara, lehnga, saree & tailoring" },
  { value: "Male", label: "Male", hint: "Sherwani, kurta pajama, prince coat & suiting" },
  { value: "Both", label: "Both (His & Hers)", hint: "Coordinated ensembles across both wardrobes" },
];

const SIZE_PRESETS = ["XS", "S", "M", "L", "XL", "XXL"];

const BUDGET_PRESETS = [
  "PKR 10,000 – 20,000",
  "PKR 20,000 – 40,000",
  "PKR 40,000 – 80,000",
  "PKR 80,000 – 150,000",
];

const OCCASION_BY_TRACK: Record<WardrobeTrack, string[]> = {
  Female: [
    "Mehndi / Sangeet",
    "Walima / Reception",
    "Eid Festive",
    "Baraat / Wedding Guest",
    "Formal Dinner",
    "Smart Casual / Office",
  ],
  Male: [
    "Nikah / Baraat",
    "Walima / Reception",
    "Eid Festive",
    "Mehndi / Qawali Night",
    "Formal Dinner",
    "Smart Casual / Office",
  ],
  Both: [
    "Couple Wedding Guest",
    "Walima Reception Pair",
    "Eid Coordinated",
    "Mehndi & Sangeet Pair",
    "Engagement / Nikah",
    "Festive Dinner",
  ],
};

const STYLE_PRESETS = [
  "Classic Heritage",
  "Contemporary Minimalist",
  "Statement Festive",
  "Indo-Western Fusion",
];

export const ConsultationForm: React.FC<ConsultationFormProps> = ({
  onSubmit,
  isLoading,
  errorMessage,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const refInputRef = useRef<HTMLInputElement | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const [clientPhoto, setClientPhoto] = useState<UploadedImageItem | null>(null);
  const [referenceImages, setReferenceImages] = useState<UploadedImageItem[]>([]);

  const [wardrobeTrack, setWardrobeTrack] = useState<WardrobeTrack>("Female");
  const [height, setHeight] = useState<string>("");
  const [usualSize, setUsualSize] = useState<string>("M");
  const [partnerHeight, setPartnerHeight] = useState<string>("");
  const [partnerUsualSize, setPartnerUsualSize] = useState<string>("L");
  const [budget, setBudget] = useState<string>("PKR 20,000 – 40,000");
  const [occasion, setOccasion] = useState<string>("Eid Festive");
  const [style, setStyle] = useState<string>("Contemporary Minimalist");
  const [notes, setNotes] = useState<string>("");

  const handleTrackChange = (track: WardrobeTrack) => {
    setWardrobeTrack(track);
    const trackOccasions = OCCASION_BY_TRACK[track];
    if (!trackOccasions.includes(occasion)) {
      setOccasion(trackOccasions[0]);
    }
  };

  const handlePrimaryFile = async (file: File | undefined) => {
    if (!file) return;
    setLocalError(null);
    try {
      const processed = await readAndNormalizeImage(file);
      setClientPhoto(processed);
    } catch (err) {
      setLocalError(
        err instanceof Error ? err.message : "Could not process the selected image."
      );
    }
  };

  const handleReferenceFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setLocalError(null);
    const remainingSlots = 3 - referenceImages.length;
    if (remainingSlots <= 0) {
      setLocalError("You can attach up to 3 reference outfit pictures.");
      return;
    }

    const selected = Array.from(files).slice(0, remainingSlots);
    try {
      const processed = await Promise.all(selected.map((f) => readAndNormalizeImage(f)));
      setReferenceImages((prev) => [...prev, ...processed].slice(0, 3));
    } catch (err) {
      setLocalError(
        err instanceof Error ? err.message : "Could not process one of the reference pictures."
      );
    } finally {
      if (refInputRef.current) {
        refInputRef.current.value = "";
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    void handlePrimaryFile(file);
  };

  const clearPrimaryImage = () => {
    setClientPhoto(null);
    setLocalError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeReferenceImage = (id: string) => {
    setReferenceImages((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!clientPhoto) {
      setLocalError("Please upload your photograph so your stylist can assess undertone and fit.");
      return;
    }
    if (!height.trim()) {
      setLocalError("Please enter height (e.g., 5'5\" or 165 cm).");
      return;
    }
    if (!usualSize.trim()) {
      setLocalError("Please enter usual size (e.g., M or UK 10).");
      return;
    }
    if (!budget.trim() || !occasion.trim() || !style.trim()) {
      setLocalError("Please complete budget, occasion, and style preferences.");
      return;
    }

    await onSubmit({
      imageBase64: clientPhoto.base64,
      mimeType: clientPhoto.mimeType,
      previewUrl: clientPhoto.previewUrl,
      referenceImages: referenceImages.map((img) => ({
        base64: img.base64,
        mimeType: img.mimeType,
      })),
      details: {
        wardrobeTrack,
        height: height.trim(),
        usualSize: usualSize.trim(),
        partnerHeight: wardrobeTrack === "Both" ? partnerHeight.trim() : undefined,
        partnerUsualSize: wardrobeTrack === "Both" ? partnerUsualSize.trim() : undefined,
        budget: budget.trim(),
        occasion: occasion.trim(),
        style: style.trim(),
        notes: notes.trim(),
      },
    });
  };

  const activeError = localError || errorMessage;
  const occasionPresets = OCCASION_BY_TRACK[wardrobeTrack];

  return (
    <section id="consultation" className="py-14 lg:py-20 border-b border-[#141413]/10">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <p className="text-xs font-medium tracking-wide text-[#6b1d2f] mb-2">
              Private Styling Studio
            </p>
            <h2
              className="font-display text-3xl sm:text-4xl font-medium text-[#141413] tracking-tight mb-3"
              style={{ textWrap: "balance" }}
            >
              Choose your wardrobe track and share your details
            </h2>
            <p className="text-sm leading-relaxed text-[#575652]">
              Style strictly for Female, Male, or Both together. Your stylist relies only on the
              height and size numbers you enter—and optionally evaluates reference garment
              pictures you attach.
            </p>
          </div>

          <div
            role="group"
            aria-label="Wardrobe section"
            className="inline-flex p-1 bg-[#f3f2ef] border border-[#141413]/10 rounded-md shrink-0 self-start lg:self-auto"
          >
            {WARDROBE_TRACKS.map((track) => {
              const active = wardrobeTrack === track.value;
              return (
                <button
                  key={track.value}
                  type="button"
                  onClick={() => handleTrackChange(track.value)}
                  className={`px-4 py-2 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap ${
                    active
                      ? "bg-[#141413] text-white"
                      : "text-[#575652] hover:text-[#141413]"
                  }`}
                >
                  {track.label}
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5 space-y-6">
            <div>
              <label className="block text-xs font-medium text-[#141413] mb-2.5">
                Client Photograph
              </label>

              {!clientPhoto ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`min-h-[320px] rounded-lg border border-dashed transition-colors flex flex-col items-center justify-center p-8 text-center ${
                    isDragging
                      ? "border-[#6b1d2f] bg-[#6b1d2f]/5"
                      : "border-[#141413]/25 bg-[#f3f2ef]/70 hover:border-[#141413]/40"
                  }`}
                >
                  <div className="w-11 h-11 rounded-full bg-white border border-[#141413]/10 flex items-center justify-center mb-4">
                    <Upload className="w-5 h-5 text-[#6b1d2f]" aria-hidden="true" />
                  </div>
                  <p className="font-display text-xl font-medium text-[#141413] mb-1">
                    Drop your photo here
                  </p>
                  <p className="text-xs text-[#575652] max-w-xs leading-relaxed mb-5">
                    Natural daylight yields the clearest undertone and on-photo drape preview.
                    JPG, PNG, or WebP.
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 text-xs font-medium bg-white border border-[#141413]/20 text-[#141413] rounded-md hover:border-[#141413] transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Choose Photo
                  </button>
                </div>
              ) : (
                <div className="rounded-lg border border-[#141413]/15 bg-[#f3f2ef] overflow-hidden flex flex-col">
                  <div className="relative min-h-[260px] bg-[#ebe9e4]">
                    <img
                      src={clientPhoto.previewUrl}
                      alt="Uploaded client reference"
                      className="w-full h-full max-h-[380px] object-contain mx-auto"
                    />
                    <button
                      type="button"
                      onClick={clearPrimaryImage}
                      aria-label="Remove uploaded photo"
                      className="absolute top-3 right-3 p-2 rounded-md bg-white/95 text-[#141413] border border-[#141413]/15 hover:bg-white transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                  <div className="px-4 py-3 bg-white border-t border-[#141413]/10 flex items-center justify-between gap-4">
                    <span className="text-xs text-[#575652] truncate">
                      {clientPhoto.fileName}
                    </span>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs font-medium text-[#6b1d2f] hover:underline underline-offset-4 whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Replace Photo
                    </button>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => {
                  void handlePrimaryFile(e.target.files?.[0]);
                }}
                className="sr-only"
              />
            </div>

            <div className="bg-white border border-[#141413]/10 rounded-lg p-5 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <span className="block text-xs font-medium text-[#141413]">
                    Optional Outfit / Fit Pictures (Up to 3)
                  </span>
                  <span className="text-[11px] text-[#575652]">
                    Attach garment photos for Gemini to evaluate against your frame
                  </span>
                </div>
                {referenceImages.length < 3 && (
                  <button
                    type="button"
                    onClick={() => refInputRef.current?.click()}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-[#fbfbfa] border border-[#141413]/20 text-[#141413] rounded-md hover:border-[#141413] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Add Picture</span>
                  </button>
                )}
              </div>

              {referenceImages.length > 0 && (
                <div className="grid grid-cols-3 gap-3 pt-1">
                  {referenceImages.map((img, idx) => (
                    <div
                      key={img.id}
                      className="relative aspect-[3/4] rounded-md overflow-hidden border border-[#141413]/10 bg-[#f3f2ef]"
                    >
                      <img
                        src={img.previewUrl}
                        alt={`Reference outfit ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeReferenceImage(img.id)}
                        aria-label={`Remove reference outfit ${idx + 1}`}
                        className="absolute top-1.5 right-1.5 p-1 rounded bg-white/95 text-[#141413] border border-[#141413]/15 cursor-pointer"
                      >
                        <X className="w-3 h-3" aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <input
                ref={refInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={(e) => {
                  void handleReferenceFiles(e.target.files);
                }}
                className="sr-only"
              />
            </div>
          </div>

          <div className="lg:col-span-7 bg-white border border-[#141413]/10 rounded-lg p-6 sm:p-8 space-y-6">
            <div className="pb-4 border-b border-[#141413]/10 flex items-center justify-between gap-4">
              <div>
                <span className="text-xs font-medium text-[#6b1d2f] block">
                  {wardrobeTrack} Wardrobe Consultation
                </span>
                <span className="text-xs text-[#575652]">
                  {WARDROBE_TRACKS.find((t) => t.value === wardrobeTrack)?.hint}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="stylist-height"
                  className="block text-xs font-medium text-[#141413] mb-2"
                >
                  {wardrobeTrack === "Both" ? "Person 1 Height (Female / Primary)" : "Height"}
                </label>
                <input
                  id="stylist-height"
                  type="text"
                  required
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder={`e.g. 5'5" or 165 cm`}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#fbfbfa] border border-[#141413]/15 rounded-md text-[#141413] placeholder:text-[#575652]/60 focus:outline-none focus:border-[#6b1d2f]"
                />
              </div>

              <div>
                <label
                  htmlFor="stylist-size"
                  className="block text-xs font-medium text-[#141413] mb-2"
                >
                  {wardrobeTrack === "Both" ? "Person 1 Usual Size" : "Usual Size"}
                </label>
                <input
                  id="stylist-size"
                  type="text"
                  required
                  value={usualSize}
                  onChange={(e) => setUsualSize(e.target.value)}
                  placeholder="e.g. M, UK 10, Chest 40"
                  className="w-full px-3.5 py-2.5 text-sm bg-[#fbfbfa] border border-[#141413]/15 rounded-md text-[#141413] placeholder:text-[#575652]/60 focus:outline-none focus:border-[#6b1d2f]"
                />
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {SIZE_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setUsualSize(preset)}
                      className={`px-2.5 py-1 text-xs font-medium rounded border transition-colors cursor-pointer whitespace-nowrap ${
                        usualSize === preset
                          ? "bg-[#141413] text-white border-[#141413]"
                          : "bg-[#fbfbfa] text-[#575652] border-[#141413]/15 hover:border-[#141413]/40"
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {wardrobeTrack === "Both" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-md bg-[#f3f2ef]/70 border border-[#141413]/10">
                <div>
                  <label
                    htmlFor="partner-height"
                    className="block text-xs font-medium text-[#141413] mb-2"
                  >
                    Person 2 Height (Male / Partner)
                  </label>
                  <input
                    id="partner-height"
                    type="text"
                    value={partnerHeight}
                    onChange={(e) => setPartnerHeight(e.target.value)}
                    placeholder={`e.g. 5'10" or 178 cm`}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-[#141413]/15 rounded-md text-[#141413] placeholder:text-[#575652]/60 focus:outline-none focus:border-[#6b1d2f]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="partner-size"
                    className="block text-xs font-medium text-[#141413] mb-2"
                  >
                    Person 2 Usual Size
                  </label>
                  <input
                    id="partner-size"
                    type="text"
                    value={partnerUsualSize}
                    onChange={(e) => setPartnerUsualSize(e.target.value)}
                    placeholder="e.g. L, Chest 42, Collar 16"
                    className="w-full px-3.5 py-2 text-sm bg-white border border-[#141413]/15 rounded-md text-[#141413] placeholder:text-[#575652]/60 focus:outline-none focus:border-[#6b1d2f]"
                  />
                </div>
              </div>
            )}

            <div>
              <label
                htmlFor="stylist-budget"
                className="block text-xs font-medium text-[#141413] mb-2"
              >
                Budget (PKR)
              </label>
              <input
                id="stylist-budget"
                type="text"
                required
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="e.g. PKR 25,000 – 45,000"
                className="w-full px-3.5 py-2.5 text-sm bg-[#fbfbfa] border border-[#141413]/15 rounded-md text-[#141413] placeholder:text-[#575652]/60 focus:outline-none focus:border-[#6b1d2f]"
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {BUDGET_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setBudget(preset)}
                    className={`px-2.5 py-1 text-xs font-medium rounded border transition-colors cursor-pointer whitespace-nowrap ${
                      budget === preset
                        ? "bg-[#141413] text-white border-[#141413]"
                        : "bg-[#fbfbfa] text-[#575652] border-[#141413]/15 hover:border-[#141413]/40"
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="stylist-occasion"
                className="block text-xs font-medium text-[#141413] mb-2"
              >
                Occasion
              </label>
              <input
                id="stylist-occasion"
                type="text"
                required
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                placeholder="e.g. Mehndi, Walima, Eid, Office Dinner"
                className="w-full px-3.5 py-2.5 text-sm bg-[#fbfbfa] border border-[#141413]/15 rounded-md text-[#141413] placeholder:text-[#575652]/60 focus:outline-none focus:border-[#6b1d2f]"
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {occasionPresets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setOccasion(preset)}
                    className={`px-2.5 py-1 text-xs font-medium rounded border transition-colors cursor-pointer whitespace-nowrap ${
                      occasion === preset
                        ? "bg-[#141413] text-white border-[#141413]"
                        : "bg-[#fbfbfa] text-[#575652] border-[#141413]/15 hover:border-[#141413]/40"
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="stylist-style"
                className="block text-xs font-medium text-[#141413] mb-2"
              >
                Style Direction
              </label>
              <input
                id="stylist-style"
                type="text"
                required
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                placeholder="e.g. Classic Heritage, Contemporary Minimalist"
                className="w-full px-3.5 py-2.5 text-sm bg-[#fbfbfa] border border-[#141413]/15 rounded-md text-[#141413] placeholder:text-[#575652]/60 focus:outline-none focus:border-[#6b1d2f]"
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {STYLE_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setStyle(preset)}
                    className={`px-2.5 py-1 text-xs font-medium rounded border transition-colors cursor-pointer whitespace-nowrap ${
                      style === preset
                        ? "bg-[#141413] text-white border-[#141413]"
                        : "bg-[#fbfbfa] text-[#575652] border-[#141413]/15 hover:border-[#141413]/40"
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="stylist-notes"
                className="block text-xs font-medium text-[#141413] mb-2"
              >
                Optional Fit or Fabric Notes
              </label>
              <textarea
                id="stylist-notes"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Prefer breathable cotton-silk, modest neckline, wearing 2-inch block heels"
                className="w-full px-3.5 py-2.5 text-sm bg-[#fbfbfa] border border-[#141413]/15 rounded-md text-[#141413] placeholder:text-[#575652]/60 focus:outline-none focus:border-[#6b1d2f] resize-none"
              />
            </div>

            {activeError && (
              <div
                role="alert"
                className="p-3.5 rounded-md bg-[#6b1d2f]/8 border border-[#6b1d2f]/25 flex items-start gap-2.5 text-xs text-[#6b1d2f]"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{activeError}</span>
              </div>
            )}

            <div className="pt-2 flex items-center justify-between gap-4 border-t border-[#141413]/10">
              <span className="text-xs text-[#575652]">
                Generates palette, silhouette note, on-photo preview & 3 outfits
              </span>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium bg-[#6b1d2f] text-white rounded-md hover:bg-[#581625] disabled:opacity-60 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6b1d2f]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    <span>Analyzing Silhouette…</span>
                  </>
                ) : (
                  <span>Create Styling Report</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
};
