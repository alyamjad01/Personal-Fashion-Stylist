import React, { useState } from "react";

interface EditorialImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectClass?: string;
  fallbackTitle?: string;
}

export const EditorialImage: React.FC<EditorialImageProps> = ({
  src,
  alt,
  className = "",
  aspectClass = "aspect-[4/3]",
  fallbackTitle = "Khaas Atelier",
}) => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`${aspectClass} ${className} bg-[#f3f2ef] border border-[#141413]/10 flex flex-col items-center justify-center p-6 text-center`}
        role="img"
        aria-label={alt}
      >
        <svg
          width="36"
          height="36"
          viewBox="0 0 36 36"
          fill="none"
          aria-hidden="true"
          className="text-[#6b1d2f] mb-3"
        >
          <path
            d="M18 4L28 14L18 32L8 14L18 4Z"
            stroke="currentColor"
            strokeWidth="1.25"
          />
          <path d="M8 14H28" stroke="currentColor" strokeWidth="1.25" />
        </svg>
        <span className="font-display text-lg text-[#141413]">{fallbackTitle}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
};
