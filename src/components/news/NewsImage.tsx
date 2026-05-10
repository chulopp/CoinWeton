/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";

const CRYPTO_PLACEHOLDER_URL =
  "https://images.unsplash.com/photo-1621761191319-c6fb62004040?q=80&w=1000&auto=format&fit=crop";

interface NewsImageProps {
  src: string | null | undefined;
  alt: string;
  className: string;
  loading?: "eager" | "lazy";
}

export default function NewsImage({
  src,
  alt,
  className,
  loading = "lazy",
}: NewsImageProps) {
  const validSrc =
    src && src !== "/news-placeholder.svg" ? src : CRYPTO_PLACEHOLDER_URL;
  const [imageSrc, setImageSrc] = useState(validSrc);

  return (
    <img
      src={imageSrc}
      alt={alt}
      loading={loading}
      decoding="async"
      className={className}
      onError={() => {
        if (imageSrc !== CRYPTO_PLACEHOLDER_URL) {
          setImageSrc(CRYPTO_PLACEHOLDER_URL);
        }
      }}
    />
  );
}

