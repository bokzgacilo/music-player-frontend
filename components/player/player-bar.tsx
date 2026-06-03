"use client";

import {
  ChevronDown,
  GripVertical,
  ListMusic,
  Maximize2,
  MoreVertical,
  Pause,
  Play,
  Repeat,
  RefreshCw,
  Shuffle,
  SkipBack,
  SkipForward,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  Volume2
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatDuration, cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { usePlayer } from "@/components/player/player-provider";

export function PlayerBar() {
  const player = usePlayer();
  const [open, setOpen] = useState(false);
  const currentIndex = player.queue.findIndex((song) => song.id === player.current?.id);
  const nextSong = currentIndex >= 0 ? player.queue[currentIndex + 1] : undefined;

  function stop(event: React.MouseEvent) {
    event.stopPropagation();
  }

  const safeDuration = player.duration || player.current?.duration || 0;
  const safePosition = Math.min(player.position, safeDuration || player.position);

  const seekSlider = (
    <div className="grid gap-1" onClick={stop}>
      <input
        aria-label="Seek playback"
        className="h-1 w-full cursor-pointer accent-primary"
        type="range"
        min={0}
        max={safeDuration || 1}
        step={1}
        value={safeDuration ? safePosition : 0}
        disabled={!player.current}
        onChange={(event) => player.seek(Number(event.target.value))}
      />
      <div className="flex justify-between text-[11px] text-white/55">
        <span>{formatDuration(safePosition)}</span>
        <span>{formatDuration(safeDuration)}</span>
      </div>
    </div>
  );

  return (
    <>
      {open ? (
        <div className="fixed inset-x-0 bottom-[88px] top-0 z-30 overflow-hidden bg-black text-white lg:left-64">
          <div className="h-full overflow-y-auto">
            <div className="grid min-h-full gap-8 px-5 py-8 xl:grid-cols-[minmax(340px,1fr)_minmax(420px,620px)] xl:px-12">
              <section className="flex min-h-[420px] items-center justify-center">
                <div className="relative aspect-square w-full max-w-[660px] overflow-hidden rounded-md bg-white/10">
                  {player.current ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={api.thumbnailUrl(player.current.id)}
                      alt=""
                      className="h-full w-full object-cover"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  ) : null}
                  <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-white/10 to-transparent">
                    <div className={cn("grid h-24 w-24 place-items-center rounded-full bg-black/55 text-white", player.current && "opacity-0")}>
                      <ListMusic size={42} />
                    </div>
                  </div>
                  <div className="absolute right-4 top-4 flex gap-2 text-white">
                    <button className="rounded-md bg-black/45 p-2" aria-label="Large artwork"><Maximize2 size={19} /></button>
                  </div>
                </div>
              </section>

              <section className="min-h-0">
                <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-5">
                  <div>
                    <p className="text-sm text-white/55">Playing from</p>
                    <h2 className="text-xl font-semibold">Your Queue</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button className="rounded-full bg-white px-5 text-black hover:bg-white/90" onClick={player.refreshCurrent} disabled={!player.current}>
                      <RefreshCw size={18} /> Refresh
                    </Button>
                    <Button variant="ghost" onClick={() => setOpen(false)} className="text-white hover:bg-white/10 hover:text-white">
                      <ChevronDown size={18} /> Collapse
                    </Button>
                  </div>
                </div>
                <h3 className="py-5 text-sm font-semibold uppercase tracking-wide text-white">Up Next</h3>
                {player.queue.length === 0 ? (
                  <p className="rounded-md border border-white/10 bg-white/5 p-4 text-sm text-white/60">Play a song from Library or a playlist to load a queue.</p>
                ) : (
                  <div className="divide-y divide-white/10">
                    {player.queue.map((song, index) => {
                      const isCurrent = song.id === player.current?.id;
                      const isPast = currentIndex >= 0 && index < currentIndex;
                      return (
                        <div key={`${song.id}-${index}`} className={cn("group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-3 py-3 transition hover:bg-white/10", isCurrent && "bg-white/15", isPast && "opacity-45")}>
                          <button className="relative h-12 w-12 overflow-hidden rounded bg-white/10" onClick={() => player.playQueueIndex(index)} aria-label={`Play ${song.title}`}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={api.thumbnailUrl(song.id)} alt="" className="h-full w-full object-cover" onError={(event) => { event.currentTarget.style.display = "none"; }} />
                            <span className="absolute inset-0 grid place-items-center bg-black/35"><Play size={18} fill="currentColor" /></span>
                          </button>
                          <button className="min-w-0 text-left" onClick={() => player.playQueueIndex(index)}>
                            <span className={cn("block truncate text-sm font-semibold", isCurrent && "text-white")}>{song.title}</span>
                            <span className="block truncate text-sm text-white/60">{song.artist}</span>
                          </button>
                          <div className="flex items-center gap-1 text-white/60">
                            <span className="hidden w-12 text-right text-sm sm:block">{formatDuration(song.duration)}</span>
                            <button className="rounded-md p-2 opacity-0 transition hover:bg-white/10 group-hover:opacity-100" onClick={() => player.moveQueueSong(song.id, "up")} disabled={index === 0} aria-label={`Move ${song.title} up`}>
                              <GripVertical size={16} />
                            </button>
                            <button className="rounded-md px-2 py-1 text-xs opacity-0 transition hover:bg-white/10 group-hover:opacity-100" onClick={() => player.moveQueueSong(song.id, "up")} disabled={index === 0}>Up</button>
                            <button className="rounded-md px-2 py-1 text-xs opacity-0 transition hover:bg-white/10 group-hover:opacity-100" onClick={() => player.moveQueueSong(song.id, "down")} disabled={index === player.queue.length - 1}>Down</button>
                            <button className="rounded-md p-2 opacity-0 transition hover:bg-white/10 group-hover:opacity-100" onClick={() => player.removeFromQueue(song.id)} disabled={isCurrent} aria-label={`Remove ${song.title}`}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
          </div>
        </div>
        </div>
      ) : null}
      <footer className="fixed bottom-0 left-0 right-0 z-40 cursor-pointer border-t border-white/10 bg-[#202020]/98 px-4 py-3 text-white shadow-2xl backdrop-blur transition hover:bg-[#252525] lg:left-64" onClick={() => setOpen((value) => !value)}>
        <div className="grid gap-2">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-center">
          <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
            <div className="h-12 w-12 overflow-hidden rounded bg-white/10">
              {player.current ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={api.thumbnailUrl(player.current.id)} alt="" className="h-full w-full object-cover" onError={(event) => { event.currentTarget.style.display = "none"; }} />
              ) : null}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{player.current?.title ?? "No song playing"}</p>
              <p className="truncate text-xs text-white/60">
                {player.current ? `${player.current.artist}${nextSong ? ` • Next: ${nextSong.title}` : ""}` : "Download a song, then play it from your library."}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2" onClick={stop}>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 hover:text-white" onClick={player.previous} aria-label="Previous"><SkipBack size={18} /></Button>
            <Button size="icon" onClick={player.toggle} disabled={!player.current} aria-label={player.playing ? "Pause" : "Play"}>
              {player.playing ? <Pause size={18} /> : <Play size={18} />}
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 hover:text-white" onClick={player.next} aria-label="Next"><SkipForward size={18} /></Button>
          </div>
          <div className="flex items-center justify-start gap-2 md:justify-end" onClick={stop}>
            <Button variant="ghost" size="icon" className="hidden text-white/75 hover:bg-white/10 hover:text-white sm:inline-flex" aria-label="Dislike"><ThumbsDown size={18} /></Button>
            <Button variant="ghost" size="icon" className="hidden text-white/75 hover:bg-white/10 hover:text-white sm:inline-flex" aria-label="Like"><ThumbsUp size={18} /></Button>
            <Button variant="ghost" size="icon" className="text-white/75 hover:bg-white/10 hover:text-white" aria-label="More"><MoreVertical size={18} /></Button>
            <Button variant="ghost" size="icon" className="hidden text-white/75 hover:bg-white/10 hover:text-white sm:inline-flex" aria-label="Volume"><Volume2 size={18} /></Button>
            <Button variant={player.shuffle ? "secondary" : "ghost"} size="icon" className="text-white/75 hover:bg-white/10 hover:text-white" onClick={() => player.setShuffle(!player.shuffle)} aria-label="Shuffle"><Shuffle size={18} /></Button>
            <Button
              variant={player.repeat !== "off" ? "secondary" : "ghost"}
              size="icon"
              className={cn("text-white/75 hover:bg-white/10 hover:text-white", player.repeat === "one" && "text-primary")}
              onClick={() => player.setRepeat(player.repeat === "off" ? "all" : player.repeat === "all" ? "one" : "off")}
              aria-label="Repeat"
            >
              <Repeat size={18} />
            </Button>
          </div>
        </div>
        {seekSlider}
        </div>
      </footer>
    </>
  );
}
