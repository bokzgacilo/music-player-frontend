"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { api } from "@/lib/api";
import type { Song } from "@/lib/types";

type RepeatMode = "off" | "one" | "all";

type PlayerContextValue = {
  queue: Song[];
  current?: Song;
  playing: boolean;
  position: number;
  duration: number;
  volume: number;
  shuffle: boolean;
  repeat: RepeatMode;
  play: (song: Song, queue?: Song[]) => void;
  toggle: () => void;
  next: () => void;
  previous: () => void;
  seek: (seconds: number) => void;
  refreshCurrent: () => void;
  playQueueIndex: (index: number) => void;
  removeFromQueue: (songId: number) => void;
  moveQueueSong: (songId: number, direction: "up" | "down") => void;
  clearQueue: () => void;
  setVolume: (value: number) => void;
  setShuffle: (value: boolean) => void;
  setRepeat: (value: RepeatMode) => void;
};

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [queue, setQueue] = useState<Song[]>([]);
  const [current, setCurrent] = useState<Song | undefined>();
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<RepeatMode>("off");

  const ensureAudio = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    return audioRef.current;
  }, []);

  const play = useCallback((song: Song, nextQueue?: Song[]) => {
    const audio = ensureAudio();
    if (nextQueue) setQueue(nextQueue);
    setCurrent(song);
    setPosition(0);
    setDuration(song.duration ?? 0);
    audio.src = api.streamUrl(song.id);
    audio.play().then(() => {
      setPlaying(true);
      api.markPlayed(song.id).catch(() => undefined);
    }).catch(() => setPlaying(false));
  }, [ensureAudio]);

  const next = useCallback(() => {
    if (!current || queue.length === 0) return;
    if (shuffle) {
      const random = queue[Math.floor(Math.random() * queue.length)];
      if (random) play(random);
      return;
    }
    const index = queue.findIndex((song) => song.id === current.id);
    const nextSong = queue[index + 1] ?? (repeat === "all" ? queue[0] : undefined);
    if (nextSong) play(nextSong);
  }, [current, play, queue, repeat, shuffle]);

  const previous = useCallback(() => {
    if (!current || queue.length === 0) return;
    const index = queue.findIndex((song) => song.id === current.id);
    const previousSong = queue[index - 1] ?? (repeat === "all" ? queue[queue.length - 1] : undefined);
    if (previousSong) play(previousSong);
  }, [current, play, queue, repeat]);

  const seek = useCallback((seconds: number) => {
    const audio = ensureAudio();
    audio.currentTime = seconds;
    setPosition(seconds);
  }, [ensureAudio]);

  const refreshCurrent = useCallback(() => {
    if (!current) return;
    const audio = ensureAudio();
    const shouldResume = !audio.paused || playing;
    audio.src = `${api.streamUrl(current.id)}?refresh=${Date.now()}`;
    audio.load();
    if (shouldResume) {
      audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
  }, [current, ensureAudio, playing]);

  const playQueueIndex = useCallback((index: number) => {
    const song = queue[index];
    if (song) play(song);
  }, [play, queue]);

  const removeFromQueue = useCallback((songId: number) => {
    setQueue((currentQueue) => currentQueue.filter((song) => song.id !== songId));
  }, []);

  const moveQueueSong = useCallback((songId: number, direction: "up" | "down") => {
    setQueue((currentQueue) => {
      const index = currentQueue.findIndex((song) => song.id === songId);
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (index < 0 || targetIndex < 0 || targetIndex >= currentQueue.length) return currentQueue;
      const nextQueue = [...currentQueue];
      const [song] = nextQueue.splice(index, 1);
      nextQueue.splice(targetIndex, 0, song);
      return nextQueue;
    });
  }, []);

  const clearQueue = useCallback(() => {
    setQueue((currentQueue) => current ? currentQueue.filter((song) => song.id === current.id) : []);
  }, [current]);

  const toggle = useCallback(() => {
    const audio = ensureAudio();
    if (!current) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
  }, [current, ensureAudio, playing]);

  const setVolume = useCallback((value: number) => {
    const nextVolume = Math.max(0, Math.min(1, value));
    setVolumeState(nextVolume);
    ensureAudio().volume = nextVolume;
  }, [ensureAudio]);

  const value = useMemo(() => ({
    queue,
    current,
    playing,
    position,
    duration: duration || current?.duration || 0,
    volume,
    shuffle,
    repeat,
    play,
    toggle,
    next,
    previous,
    seek,
    refreshCurrent,
    playQueueIndex,
    removeFromQueue,
    moveQueueSong,
    clearQueue,
    setVolume,
    setShuffle,
    setRepeat
  }), [clearQueue, current, duration, moveQueueSong, next, play, playQueueIndex, playing, position, previous, queue, refreshCurrent, removeFromQueue, repeat, seek, setVolume, shuffle, toggle, volume]);

  useEffect(() => {
    const savedVolume = window.localStorage.getItem("musicplayer.volume");
    if (!savedVolume) return;
    const parsed = Number(savedVolume);
    if (Number.isFinite(parsed)) {
      setVolume(parsed);
    }
  }, [setVolume]);

  useEffect(() => {
    ensureAudio().volume = volume;
    window.localStorage.setItem("musicplayer.volume", String(volume));
  }, [ensureAudio, volume]);

  useEffect(() => {
    const audio = ensureAudio();
    const onTimeUpdate = () => setPosition(audio.currentTime || 0);
    const onDurationChange = () => {
      if (Number.isFinite(audio.duration)) setDuration(audio.duration);
    };
    const onEnded = () => {
      if (repeat === "one") {
        audio.play().catch(() => setPlaying(false));
      } else {
        next();
      }
    };
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("loadedmetadata", onDurationChange);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("loadedmetadata", onDurationChange);
      audio.removeEventListener("ended", onEnded);
    };
  }, [ensureAudio, next, repeat]);

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) throw new Error("usePlayer must be used inside PlayerProvider");
  return context;
}
