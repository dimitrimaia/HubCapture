import { CirclePlay } from 'lucide-react'

export function VideoEmbed({ youtubeId, title }: { youtubeId: string; title: string }) {
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
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0`}
        title={title}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        className="absolute inset-0 size-full"
      />
    </div>
  )
}
