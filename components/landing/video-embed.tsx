'use client'

import { CirclePlay } from 'lucide-react'
import { useState } from 'react'

type VideoEmbedProps = { title: string; youtubeId?: string; videoUrl?: string }

/**
 * YouTube: mostra só a miniatura; o player (youtube-nocookie) carrega apenas no clique,
 * então a página continua leve mesmo com vários vídeos.
 * videoUrl: MP4 próprio (ex.: Vercel Blob), sem anúncios; preload="none" não baixa nada antes do play.
 */
export function VideoEmbed({ title, youtubeId, videoUrl }: VideoEmbedProps) {
  const [playing, setPlaying] = useState(false)

  if (videoUrl) {
    return (
      <video
        src={videoUrl}
        title={title}
        controls
        playsInline
        preload="none"
        className="aspect-video w-full rounded-2xl border border-border bg-black"
      />
    )
  }

  if (!youtubeId) {
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-background/50 text-muted-foreground">
        <CirclePlay className="size-10 text-primary/60" aria-hidden="true" />
        <span className="text-sm">Vídeo em breve</span>
      </div>
    )
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border bg-black">
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="absolute inset-0 size-full"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`Assistir: ${title}`}
          className="group absolute inset-0 size-full outline-none focus-visible:ring-3 focus-visible:ring-ring"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`}
            alt=""
            loading="lazy"
            className="absolute inset-0 size-full object-cover opacity-80 transition-opacity group-hover:opacity-100"
          />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground glow transition-transform group-hover:scale-110">
              <CirclePlay className="size-8" aria-hidden="true" />
            </span>
          </span>
        </button>
      )}
    </div>
  )
}
