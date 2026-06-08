'use client'

import Link from 'next/link'

export interface HeroSlideData {
  id: string
  title: string
  subtitle: string
  combo: string
  priceLabel: string
  offerSlug: string
  images: string[]
  includes: string[]
}

interface HeroSlideProps {
  slide: HeroSlideData
  isActive: boolean
}

export default function HeroSlide({ slide, isActive }: HeroSlideProps) {
  return (
    <article
      className={`grid items-center gap-4 transition-all duration-400 md:grid-cols-2 ${
        isActive
          ? 'opacity-100 translate-x-0 relative pointer-events-auto'
          : 'opacity-0 translate-x-5 absolute inset-3 pointer-events-none'
      }`}
    >
      {/* Left column: text + mobile images + CTA */}
      <div className="flex flex-col justify-center min-h-[260px] md:min-h-0">
        <p className="text-xs uppercase tracking-wider m-0 text-accent">{slide.combo}</p>
        <h1
          className="m-2 text-[clamp(0.9rem,3vw,2.2rem)]"
          style={{ fontFamily: "'Press Start 2P', cursive" }}
        >
          {slide.title}
        </h1>
        <p className="text-base mb-4 text-muted">{slide.subtitle}</p>
        <p className="text-sm my-2 mb-4 text-muted">
          Incluye: {(slide.includes || []).join(', ')}.{' '}
          <strong>Stock limitado — ¡aprovecha el combo!</strong>
        </p>

        {/* Mobile images */}
        <div className="flex md:hidden justify-center gap-3 my-1.5">
          {(slide.images || []).map((src, idx) => (
            <img
              key={idx}
              src={src}
              alt={`${slide.title} ${idx + 1}`}
              className="w-2/5 max-w-[140px] h-auto max-h-[200px] object-contain drop-shadow-[0_12px_28px_rgba(0,0,0,0.2)]"
            />
          ))}
        </div>

        {/* Price + CTA */}
        <div className="flex items-center gap-4 mt-2">
          <span
            className="py-3 px-4 rounded-[14px] font-bold border-3 border-black"
            style={{ background: '#d83000', color: '#fff' }}
          >
            {slide.priceLabel}
          </span>
          <Link href={slide.offerSlug ? `/offer/${encodeURIComponent(slide.offerSlug)}` : '/'}>
            <button type="button" className="btn-primary">
              Comprar ahora
            </button>
          </Link>
        </div>
      </div>

      {/* Desktop images */}
      <div className="hidden md:flex items-center justify-center gap-1.5">
        {(slide.images || []).map((src, idx) => (
          <img
            key={idx}
            src={src}
            alt={`${slide.title} ${idx + 1}`}
            className="w-[48%] h-[380px] object-contain drop-shadow-[0_12px_28px_rgba(0,0,0,0.2)]"
          />
        ))}
      </div>
    </article>
  )
}
