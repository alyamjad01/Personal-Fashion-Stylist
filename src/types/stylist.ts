export type WardrobeTrack = "Female" | "Male" | "Both";

export interface PaletteColor {
  name: string;
  hex: string;
}

export interface OutfitRecommendation {
  name: string;
  forWhom?: string;
  description: string;
  pieces: string[];
  colours: string[];
  size: string;
  fitConfidence: string;
  fitReason: string;
  priceEstimatePKR: string;
  whyItSuits: string;
  checkBeforeBuying: string[];
  overlayHexes?: string[];
  necklineCut?: string;
  drapeFocus?: string;
}

export interface PictureFitInsight {
  pictureNumber: number;
  garmentDetected: string;
  fitVerdict: string;
  adjustmentTip: string;
}

export interface StylingReport {
  wardrobeTrack?: WardrobeTrack;
  undertone: string;
  undertoneNote: string;
  palette: PaletteColor[];
  bodyShape: string;
  outfits: OutfitRecommendation[];
  pictureFitInsights?: PictureFitInsight[];
}

export interface StylistFormInput {
  wardrobeTrack: WardrobeTrack;
  height: string;
  usualSize: string;
  partnerHeight?: string;
  partnerUsualSize?: string;
  budget: string;
  occasion: string;
  style: string;
  notes?: string;
}

export interface UploadedImageItem {
  id: string;
  base64: string;
  mimeType: string;
  previewUrl: string;
  fileName: string;
}

export interface PictureSuggestedFit {
  pictureNumber: number;
  garmentName: string;
  wardrobeSection: string;
  silhouetteCut: string;
  colourPalette: PaletteColor[];
  recommendedFor: string;
  sizingAdvice: string;
  fitSuggestions: string[];
  checkBeforeBuying: string[];
}

export interface PictureFitResponse {
  summary: string;
  fits: PictureSuggestedFit[];
}
