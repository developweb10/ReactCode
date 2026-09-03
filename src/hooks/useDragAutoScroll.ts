import { useEffect, useRef } from "react";

interface AutoScrollOptions {
  edgeThreshold?: number; // Distance from edge (in px) to start scrolling, default 120
  maxSpeed?: number;      // Maximum scroll speed in px per frame, default 25
  minSpeed?: number;      // Minimum scroll speed in px per frame, default 4
  enabled?: boolean;      // Enable auto scroll hook, default true
}

const getScrollableParent = (element: HTMLElement | null): HTMLElement | null => {
  let current: HTMLElement | null = element;
  while (current && current !== document.body && current !== document.documentElement) {
    const style = window.getComputedStyle(current);
    const overflowY = style.overflowY;
    const isScrollable =
      (overflowY === "auto" || overflowY === "scroll") &&
      current.scrollHeight > current.clientHeight;
    if (isScrollable) return current;
    current = current.parentElement;
  }
  return null;
};

export const useDragAutoScroll = (options: AutoScrollOptions = {}) => {
  const {
    edgeThreshold = 120,
    maxSpeed = 25,
    minSpeed = 4,
    enabled = true,
  } = options;

  const isDraggingRef = useRef(false);
  const mousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const stopScroll = () => {
      isDraggingRef.current = false;
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };

    const scrollLoop = () => {
      if (!isDraggingRef.current) return;

      const { x, y } = mousePosRef.current;
      const vHeight = window.innerHeight;
      const vWidth = window.innerWidth;

      let scrolledContainer = false;

      // Check if mouse is over a scrollable inner element
      if (x >= 0 && y >= 0 && x <= vWidth && y <= vHeight) {
        const elUnderCursor = document.elementFromPoint(x, y) as HTMLElement | null;
        const scrollableParent = getScrollableParent(elUnderCursor);

        if (scrollableParent) {
          const rect = scrollableParent.getBoundingClientRect();
          const containerThreshold = Math.min(60, rect.height / 4);

          const distTop = y - rect.top;
          const distBottom = rect.bottom - y;

          if (distTop > 0 && distTop < containerThreshold && scrollableParent.scrollTop > 0) {
            const intensity = (containerThreshold - distTop) / containerThreshold;
            const speed = Math.max(minSpeed, Math.round(intensity * (maxSpeed * 0.6)));
            scrollableParent.scrollTop -= speed;
            scrolledContainer = true;
          } else if (
            distBottom > 0 &&
            distBottom < containerThreshold &&
            scrollableParent.scrollTop < scrollableParent.scrollHeight - scrollableParent.clientHeight
          ) {
            const intensity = (containerThreshold - distBottom) / containerThreshold;
            const speed = Math.max(minSpeed, Math.round(intensity * (maxSpeed * 0.6)));
            scrollableParent.scrollTop += speed;
            scrolledContainer = true;
          }
        }
      }

      // Scroll main window if container didn't scroll or near window edge
      const windowDistTop = y;
      const windowDistBottom = vHeight - y;

      if (windowDistTop < edgeThreshold) {
        const intensity = (edgeThreshold - Math.max(0, windowDistTop)) / edgeThreshold;
        const speed = Math.max(minSpeed, Math.round(intensity * maxSpeed));
        window.scrollBy(0, -speed);
      } else if (windowDistBottom < edgeThreshold) {
        const intensity = (edgeThreshold - Math.max(0, windowDistBottom)) / edgeThreshold;
        const speed = Math.max(minSpeed, Math.round(intensity * maxSpeed));
        window.scrollBy(0, speed);
      }

      animFrameRef.current = requestAnimationFrame(scrollLoop);
    };

    const startScrollLoopIfNeeded = () => {
      if (!isDraggingRef.current) {
        isDraggingRef.current = true;
        if (animFrameRef.current === null) {
          animFrameRef.current = requestAnimationFrame(scrollLoop);
        }
      }
    };

    const handleDragStart = (e: DragEvent) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };
      startScrollLoopIfNeeded();
    };

    const handleDragOver = (e: DragEvent) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };
      startScrollLoopIfNeeded();
    };

    const handleDragEnd = () => {
      stopScroll();
    };

    const handleDrop = () => {
      stopScroll();
    };

    window.addEventListener("dragstart", handleDragStart, { capture: true });
    window.addEventListener("dragover", handleDragOver, { capture: true });
    window.addEventListener("dragend", handleDragEnd, { capture: true });
    window.addEventListener("drop", handleDrop, { capture: true });

    return () => {
      stopScroll();
      window.removeEventListener("dragstart", handleDragStart, { capture: true });
      window.removeEventListener("dragover", handleDragOver, { capture: true });
      window.removeEventListener("dragend", handleDragEnd, { capture: true });
      window.removeEventListener("drop", handleDrop, { capture: true });
    };
  }, [edgeThreshold, maxSpeed, minSpeed, enabled]);
};
