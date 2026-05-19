import { useState } from "react";
import type { ImgHTMLAttributes } from "react";

type ImageWithFallbackProps = ImgHTMLAttributes<HTMLImageElement> & {
  fallbackSrc: string;
};

function ImageWithFallback({
  src,
  fallbackSrc,
  onError,
  ...props
}: ImageWithFallbackProps) {
  const normalizedSrc = src && src.trim() ? src : fallbackSrc;
  const [failedSources, setFailedSources] = useState<string[]>([]);
  const currentSrc = failedSources.includes(normalizedSrc) ? fallbackSrc : normalizedSrc;

  return (
    <img
      {...props}
      src={currentSrc}
      onError={(event) => {
        if (normalizedSrc !== fallbackSrc && !failedSources.includes(normalizedSrc)) {
          setFailedSources((current) => [...current, normalizedSrc]);
        }

        onError?.(event);
      }}
    />
  );
}

export { ImageWithFallback };
