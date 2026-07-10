import { useEffect, useState, type ReactNode } from 'react';
import { fetchCountry, type CountryInfo } from '../../services/countries';

export function useCountryFlag(country: string | undefined): CountryInfo | null {
  const [info, setInfo] = useState<CountryInfo | null>(null);

  useEffect(() => {
    if (!country) return;
    let active = true;
    fetchCountry(country).then((c) => {
      if (active) setInfo(c);
    });
    return () => {
      active = false;
    };
  }, [country]);

  return info;
}

interface CountryFlagProps {
  country: string;
  emoji?: string;
  className?: string;
  fallback?: ReactNode;
}

export default function CountryFlag({
  country,
  emoji,
  className = 'w-6 h-6 rounded object-cover',
  fallback,
}: CountryFlagProps) {
  const info = useCountryFlag(country);
  const src = info?.flagPng || info?.flagSvg;

  if (src) {
    return (
      <img src={src} alt={country} className={className} loading="lazy" />
    );
  }

  if (fallback) return <>{fallback}</>;
  return <span className={className}>{emoji ?? '🏳️'}</span>;
}
