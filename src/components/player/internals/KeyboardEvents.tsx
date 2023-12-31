import { useEffect, useRef, useState } from "react";

import { useCaptions } from "@/components/player/hooks/useCaptions";
import { useVolume } from "@/components/player/hooks/useVolume";
import { useOverlayRouter } from "@/hooks/useOverlayRouter";
import { usePlayerStore } from "@/stores/player/store";
import { useEmpheralVolumeStore } from "@/stores/volume";

export function KeyboardEvents() {
  const router = useOverlayRouter("");
  const display = usePlayerStore((s) => s.display);
  const mediaPlaying = usePlayerStore((s) => s.mediaPlaying);
  const time = usePlayerStore((s) => s.progress.time);
  const { setVolume, toggleMute } = useVolume();

  const { toggleLastUsed } = useCaptions();
  const setShowVolume = useEmpheralVolumeStore((s) => s.setShowVolume);

  const [isRolling, setIsRolling] = useState(false);
  const volumeDebounce = useRef<ReturnType<typeof setTimeout> | undefined>();

  const dataRef = useRef({
    setShowVolume,
    setVolume,
    toggleMute,
    setIsRolling,
    toggleLastUsed,
    display,
    mediaPlaying,
    isRolling,
    time,
    router,
  });
  useEffect(() => {
    dataRef.current = {
      setShowVolume,
      setVolume,
      toggleMute,
      setIsRolling,
      toggleLastUsed,
      display,
      mediaPlaying,
      isRolling,
      time,
      router,
    };
  }, [
    setShowVolume,
    setVolume,
    toggleMute,
    setIsRolling,
    toggleLastUsed,
    display,
    mediaPlaying,
    isRolling,
    time,
    router,
  ]);

  useEffect(() => {
    const keyEventHandler = (evt: KeyboardEvent) => {
      if (evt.target && (evt.target as HTMLInputElement).nodeName === "INPUT")
        return;

      const k = evt.key;

      // Volume
      if (["ArrowUp", "ArrowDown", "m"].includes(k)) {
        dataRef.current.setShowVolume(true);

        if (volumeDebounce.current) clearTimeout(volumeDebounce.current);
        volumeDebounce.current = setTimeout(() => {
          dataRef.current.setShowVolume(false);
        }, 3e3);
      }
      if (k === "ArrowUp")
        dataRef.current.setVolume(
          (dataRef.current.mediaPlaying?.volume || 0) + 0.15
        );
      if (k === "ArrowDown")
        dataRef.current.setVolume(
          (dataRef.current.mediaPlaying?.volume || 0) - 0.15
        );
      if (k === "m") dataRef.current.toggleMute();

      // Video progress
      if (k === "ArrowRight")
        dataRef.current.display?.setTime(dataRef.current.time + 5);
      if (k === "ArrowLeft")
        dataRef.current.display?.setTime(dataRef.current.time - 5);

      // Utils
      if (k === "f") dataRef.current.display?.toggleFullscreen();
      if (k === " ")
        dataRef.current.display?.[
          dataRef.current.mediaPlaying.isPaused ? "play" : "pause"
        ]();
      if (k === "Escape") dataRef.current.router.close();

      // captions
      if (k === "c") dataRef.current.toggleLastUsed().catch(() => {}); // ignore errors

      // Do a barrell roll!
      if (k === "r") {
        if (dataRef.current.isRolling || evt.ctrlKey || evt.metaKey) return;

        dataRef.current.setIsRolling(true);
        document.querySelector(".popout-location")?.classList.add("roll");
        document.body.setAttribute("data-no-scroll", "true");

        setTimeout(() => {
          document.querySelector(".popout-location")?.classList.remove("roll");
          document.body.removeAttribute("data-no-scroll");
          dataRef.current.setIsRolling(false);
        }, 1e3);
      }
    };
    window.addEventListener("keydown", keyEventHandler);

    return () => {
      window.removeEventListener("keydown", keyEventHandler);
    };
  }, []);

  return null;
}
