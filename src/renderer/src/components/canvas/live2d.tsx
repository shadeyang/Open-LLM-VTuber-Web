/* eslint-disable no-shadow */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { memo, useRef, useEffect, useState } from "react";
import { useLive2DConfig } from "@/context/live2d-config-context";
import { useIpcHandlers } from "@/hooks/utils/use-ipc-handlers";
import { useInterrupt } from "@/hooks/utils/use-interrupt";
import { useAudioTask } from "@/hooks/utils/use-audio-task";
import { useLive2DModel } from "@/hooks/canvas/use-live2d-model";
import { useLive2DResize } from "@/hooks/canvas/use-live2d-resize";
import { useAiState, AiStateEnum } from "@/context/ai-state-context";
import { useLive2DExpression } from "@/hooks/canvas/use-live2d-expression";
import { useForceIgnoreMouse } from "@/hooks/utils/use-force-ignore-mouse";
import { useMode } from "@/context/mode-context";

interface Live2DProps {
  showSidebar?: boolean;
}

export const Live2D = memo(
  ({ showSidebar }: Live2DProps): JSX.Element => {
    const { forceIgnoreMouse } = useForceIgnoreMouse();
    const { modelInfo } = useLive2DConfig();
    const { mode } = useMode();
    const internalContainerRef = useRef<HTMLDivElement>(null);
    const { aiState } = useAiState();
    const { resetExpression } = useLive2DExpression();
    const isPet = mode === 'pet';
    const [renderKey, setRenderKey] = useState(0);

    // Force re-render when entering pet mode to ensure transform is applied
    useEffect(() => {
      if (isPet) {
        // Delay slightly to ensure DOM is ready
        const timer = setTimeout(() => {
          setRenderKey((k) => k + 1);
        }, 100);
        return () => clearTimeout(timer);
      }
    }, [isPet]);

    // Also force re-render after initial mount in pet mode
    useEffect(() => {
      if (isPet) {
        const timer = setTimeout(() => {
          setRenderKey((k) => k + 1);
        }, 500);
        return () => clearTimeout(timer);
      }
    }, []);

    // Get canvasRef from useLive2DResize
    const { canvasRef } = useLive2DResize({
      containerRef: internalContainerRef,
      modelInfo,
      showSidebar,
    });

    // Pass canvasRef to useLive2DModel
    const { isDragging, handlers } = useLive2DModel({
      modelInfo,
      canvasRef,
    });

    // Setup hooks
    useIpcHandlers();
    useInterrupt();
    useAudioTask();

    // Reset expression to default when AI state becomes idle
    useEffect(() => {
      if (aiState === AiStateEnum.IDLE) {
        const lappAdapter = (window as any).getLAppAdapter?.();
        if (lappAdapter) {
          resetExpression(lappAdapter, modelInfo);
        }
      }
    }, [aiState, modelInfo, resetExpression]);

    // Expose setExpression for console testing
    // useEffect(() => {
    //   const testSetExpression = (expressionValue: string | number) => {
    //     const lappAdapter = (window as any).getLAppAdapter?.();
    //     if (lappAdapter) {
    //       setExpression(expressionValue, lappAdapter, `[Console Test] Set expression to: ${expressionValue}`);
    //     } else {
    //       console.error('[Console Test] LAppAdapter not found.');
    //     }
    //   };

    //   // Expose the function to the window object
    //   (window as any).testSetExpression = testSetExpression;
    //   console.log('[Debug] testSetExpression function exposed to window.');

    //   // Cleanup function to remove the function from window when the component unmounts
    //   return () => {
    //     delete (window as any).testSetExpression;
    //     console.log('[Debug] testSetExpression function removed from window.');
    //   };
    // }, [setExpression]);

    const handlePointerDown = (e: React.PointerEvent) => {
      handlers.onMouseDown(e);
    };

    const handleContextMenu = (e: React.MouseEvent) => {
      e.preventDefault();
      console.log(
        "[ContextMenu] Right-click detected, requesting menu...",
      );
      window.api?.showContextMenu?.();
    };

    return (
      <div
        ref={internalContainerRef}
        id="live2d-internal-wrapper"
        style={{
          width: "100%",
          height: "100%",
          pointerEvents: isPet && forceIgnoreMouse ? "none" : "auto",
          overflow: "hidden",
          position: "relative",
          cursor: isDragging ? "grabbing" : "default",
          // Ensure Live2D area is never part of the drag region
          WebkitAppRegion: "no-drag",
        }}
        onPointerDown={handlePointerDown}
        onContextMenu={handleContextMenu}
        {...handlers}
      >
        <canvas
          key={`canvas-${renderKey}`}
          id="canvas"
          ref={canvasRef}
          style={{
            width: "100%",
            height: "100%",
            pointerEvents: isPet && forceIgnoreMouse ? "none" : "auto",
            display: "block",
            cursor: isDragging ? "grabbing" : "default",
            backgroundColor: "transparent",
          }}
        />
      </div>
    );
  },
);

Live2D.displayName = "Live2D";

export { useInterrupt, useAudioTask };
