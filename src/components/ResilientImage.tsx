import React, { useState, useEffect } from "react";
import { resolveTokenImage, getDeterministicGradient } from "../utils/imageFallback";

interface ResilientImageProps {
  symbol: string;
  mintAddress?: string;
  providedImageUrl?: string;
  className?: string;
  fallbackIcon?: React.ReactNode;
}

export default function ResilientImage({
  symbol,
  mintAddress,
  providedImageUrl,
  className = "w-10 h-10",
  fallbackIcon,
}: ResilientImageProps) {
  const [resolvedPath, setResolvedPath] = useState<string | null>(null);
  const [isFailed, setIsFailed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setIsFailed(false);
    setIsLoading(true);

    async function computeImage() {
      const path = await resolveTokenImage(symbol, mintAddress, providedImageUrl);
      if (!active) return;
      
      if (path.startsWith("PLACEHOLDER:")) {
        setIsFailed(true);
        setIsLoading(false);
      } else {
        setResolvedPath(path);
      }
    }

    computeImage();
    return () => {
      active = false;
    };
  }, [symbol, mintAddress, providedImageUrl]);

  // Handle on-screen runtime image download failures
  const handleImgError = () => {
    setIsFailed(true);
    setIsLoading(false);
  };

  const handleImgLoad = () => {
    setIsLoading(false);
  };

  // Safe first letter rendering
  const charLabel = symbol ? symbol.charAt(0).toUpperCase() : "?";
  
  if (isFailed) {
    const { from, to } = getDeterministicGradient(symbol || "TRASH");
    return (
      <div
        className={`${className} flex items-center justify-center font-mono font-bold text-white relative select-none border border-white/10 shrink-0 [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]`}
        style={{
          background: `linear-gradient(135deg, ${from}, ${to})`,
        }}
      >
        <span>{fallbackIcon || charLabel}</span>
      </div>
    );
  }

  return (
    <div className={`${className} bg-black/40 border border-white/10 shrink-0 relative overflow-hidden flex items-center justify-center`}>
      {isLoading && (
        <div className="absolute inset-0 bg-zinc-950 animate-pulse flex items-center justify-center">
          <span className="text-[9px] font-mono text-zinc-600">...</span>
        </div>
      )}
      
      {resolvedPath && (
        <img
          src={resolvedPath}
          alt={symbol}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={handleImgError}
          onLoad={handleImgLoad}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoading ? "opacity-0" : "opacity-100"
          }`}
        />
      )}
    </div>
  );
}
