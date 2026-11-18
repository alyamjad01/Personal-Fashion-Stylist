/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Header } from "./components/Header.tsx";
import { HeroSection } from "./components/HeroSection.tsx";
import { ConsultationForm } from "./components/ConsultationForm.tsx";
import { StylingReportView } from "./components/StylingReportView.tsx";
import { PictureFitStudio } from "./components/PictureFitStudio.tsx";
import { LookbookSection } from "./components/LookbookSection.tsx";
import { Footer } from "./components/Footer.tsx";
import type { StylingReport, StylistFormInput } from "./types/stylist.ts";

export default function App() {
  const [report, setReport] = useState<StylingReport | null>(null);
  const [submittedDetails, setSubmittedDetails] = useState<StylistFormInput | null>(null);
  const [submittedPhotoUrl, setSubmittedPhotoUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const scrollToConsultation = () => {
    const el = document.getElementById("consultation");
    el?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmitConsultation = async (payload: {
    imageBase64: string;
    mimeType: string;
    previewUrl: string;
    referenceImages: Array<{ base64: string; mimeType: string }>;
    details: StylistFormInput;
  }) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/style-consultation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageBase64: payload.imageBase64,
          mimeType: payload.mimeType,
          referenceImages: payload.referenceImages,
          details: payload.details,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data?.error || "Unable to generate your styling report. Please try again."
        );
      }

      setReport(data as StylingReport);
      setSubmittedDetails(payload.details);
      setSubmittedPhotoUrl(payload.previewUrl);

      requestAnimationFrame(() => {
        const reportEl = document.getElementById("styling-report");
        reportEl?.scrollIntoView({ behavior: "smooth" });
      });
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Network error while contacting the styling studio."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfbfa] text-[#141413]">
      <Header hasReport={Boolean(report)} onStartConsultation={scrollToConsultation} />

      <main className="flex-1">
        <HeroSection onBeginClick={scrollToConsultation} />

        <ConsultationForm
          onSubmit={handleSubmitConsultation}
          isLoading={isLoading}
          errorMessage={errorMessage}
        />

        {report && submittedDetails && (
          <StylingReportView
            report={report}
            submittedDetails={submittedDetails}
            submittedPhotoUrl={submittedPhotoUrl}
          />
        )}

        <PictureFitStudio />

        <LookbookSection />
      </main>

      <Footer />
    </div>
  );
}
