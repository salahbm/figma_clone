'use client';
import {
  FormEvent,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import * as Portal from '@radix-ui/react-portal';
import { useCreateThread } from '@liveblocks/react/suspense';
import { ComposerSubmitComment } from '@liveblocks/react-ui/primitives';
import styles from './new-thread.module.css';
import { getCoordsFromPointerEvent } from '@/lib/coords';
import { Slot } from '@radix-ui/react-slot';
import { PinnedComposer } from '@/components/comments/PinnedComposer';
import { useMaxZIndex } from '@/lib/useMaxZIndex';
import NewThreadCursor from './NewThreadCursor';

type ComposerCoords = null | { x: number; y: number };

type Props = {
  children: ReactNode;
};

export function NewThread({ children }: Props) {
  const [creatingCommentState, setCreatingCommentState] = useState<
    'placing' | 'placed' | 'complete'
  >('complete');
  const createThread = useCreateThread();
  const maxZIndex = useMaxZIndex();

  const composerRef = useRef<HTMLDivElement>(null);
  const [composerCoords, setComposerCoords] = useState<ComposerCoords>(null);

  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const dragStart = useRef({ x: 0, y: 0 });

  const lastPointerEvent = useRef<PointerEvent>();
  const [allowUseComposer, setAllowUseComposer] = useState(false);
  const allowComposerRef = useRef(allowUseComposer);
  allowComposerRef.current = allowUseComposer;

  const [moving, setMoving] = useState(false);

  useEffect(() => {
    if (creatingCommentState === 'complete') {
      return;
    }

    // Place a composer on the screen
    function newComment(e: MouseEvent) {
      if (dragging.current) {
        return;
      }

      e.preventDefault();

      // If already placed, click outside to close composer
      if (creatingCommentState === 'placed') {
        setCreatingCommentState('complete');
        setAllowUseComposer(false);
        setMoving(false);
        dragOffset.current = { x: 0, y: 0 };
        return;
      }

      // First click sets composer down
      setCreatingCommentState('placed');
      setComposerCoords({
        x: e.clientX + window.scrollX,
        y: e.clientY + window.scrollY,
      });
    }

    document.documentElement.addEventListener('click', newComment);

    return () => {
      document.documentElement.removeEventListener('click', newComment);
    };
  }, [creatingCommentState]);

  useEffect(() => {
    // If dragging composer, update position
    function handlePointerMove(e: PointerEvent) {
      if (!dragging.current) {
        return;
      }
      setMoving(true);

      // Prevents issue with composedPath getting removed
      (e as any)._savedComposedPath = e.composedPath();
      lastPointerEvent.current = e;

      const { x, y } = dragOffset.current;
      setComposerCoords({
        x: e.pageX - x,
        y: e.pageY - y,
      });
    }

    // Stop dragging, timeout to avoid `newComment` running
    function handlePointerUp() {
      if (!dragging.current) {
        return;
      }
      setMoving(false);

      setTimeout(() => {
        dragging.current = false;
      });
    }

    document.documentElement.addEventListener('pointermove', handlePointerMove);
    document.documentElement.addEventListener('pointerup', handlePointerUp);

    return () => {
      document.documentElement.removeEventListener(
        'pointermove',
        handlePointerMove
      );

      document.documentElement.removeEventListener(
        'pointerup',
        handlePointerUp
      );
    };
  }, []);

  // Set pointer event from last click on body for use later
  useEffect(() => {
    if (creatingCommentState !== 'placing') {
      return;
    }

    function handlePointerDown(e: PointerEvent) {
      if (allowComposerRef.current) {
        return;
      }

      // Prevents issue with composedPath getting removed
      (e as any)._savedComposedPath = e.composedPath();
      lastPointerEvent.current = e;
      setAllowUseComposer(true);
    }

    // Right click to cancel placing
    function handleContextMenu(e: Event) {
      if (creatingCommentState === 'placing') {
        e.preventDefault();
        setCreatingCommentState('complete');
        setAllowUseComposer(false);
        setMoving(false);
        dragOffset.current = { x: 0, y: 0 };
      }
    }

    document.documentElement.addEventListener('pointerdown', handlePointerDown);
    document.documentElement.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.documentElement.removeEventListener(
        'pointerdown',
        handlePointerDown
      );
      document.documentElement.removeEventListener(
        'contextmenu',
        handleContextMenu
      );
    };
  }, [creatingCommentState]);

  // Enabling dragging the avatar
  const handlePointerDownOverlay = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!composerRef.current) {
        return;
      }

      const rect = composerRef.current.getBoundingClientRect();
      dragOffset.current = {
        x: e.pageX - rect.left - window.scrollX,
        y: e.pageY - rect.top - window.scrollY,
      };
      dragStart.current = {
        x: e.pageX,
        y: e.pageY,
      };
      dragging.current = true;
    },
    []
  );

  // On composer submit, create thread and reset state
  const handleComposerSubmit = useCallback(
    ({ body }: ComposerSubmitComment, event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!composerCoords || !lastPointerEvent.current) {
        return;
      }

      const {
        cursorSelectors = [],
        cursorX = -10000,
        cursorY = -10000,
      } = getCoordsFromPointerEvent(lastPointerEvent.current, {
        x: dragOffset.current.x,
        y: dragOffset.current.y,
      }) || {};

      createThread({
        body,
        metadata: {
          cursorSelectors: cursorSelectors.join(','),
          cursorX,
          cursorY,
          zIndex: maxZIndex + 1,
        },
      });

      setComposerCoords(null);
      setCreatingCommentState('complete');
      setAllowUseComposer(false);
      setMoving(false);
      setTimeout(() => (dragOffset.current = { x: 0, y: 0 }));
    },
    [createThread, composerCoords, maxZIndex]
  );

  return (
    <>
      <Slot
        onClick={() =>
          setCreatingCommentState(
            creatingCommentState !== 'complete' ? 'complete' : 'placing'
          )
        }
        style={{ opacity: creatingCommentState !== 'complete' ? 0.7 : 1 }}
      >
        {children}
      </Slot>
      {composerCoords && creatingCommentState === 'placed' ? (
        <Portal.Root
          className={styles.composerWrapper}
          style={{
            pointerEvents: allowUseComposer && !moving ? 'initial' : 'none',
            transform: `translate(${composerCoords.x}px, ${composerCoords.y}px)`,
          }}
          ref={composerRef}
          data-hide-cursors
        >
          <PinnedComposer
            onPointerDown={handlePointerDownOverlay}
            onComposerSubmit={handleComposerSubmit}
            onPointerUp={() => {}}
            onPointerMove={() => {}}
          />
        </Portal.Root>
      ) : null}
      <NewThreadCursor display={creatingCommentState === 'placing'} />
    </>
  );
}
