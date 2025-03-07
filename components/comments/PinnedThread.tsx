'use client';

import styles from './Pinned.module.css';
import {
  PointerEvent,
  PointerEventHandler,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import { IUserInfo, ThreadData } from '@liveblocks/client';
import { Thread } from '@liveblocks/react-ui';
import { useNearEdge } from '@/lib/useNearEdge';
import Image from 'next/image';

type Props = {
  thread: ThreadData;
  onPointerDown: PointerEventHandler<HTMLDivElement>;
  onPointerMove: PointerEventHandler<HTMLDivElement>;
  onPointerUp: PointerEventHandler<HTMLDivElement>;
  onFocus: () => void;
};

export function PinnedThread({
  thread,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onFocus,
  ...props
}: Props) {
  // Open pinned threads that have just been created
  const startMinimized = useMemo(() => {
    return Number(new Date()) - Number(new Date(thread.createdAt)) > 100;
  }, [thread]);

  const [minimized, setMinimized] = useState(startMinimized);
  const dragStart = useRef({ x: 0, y: 0 });

  // Flip pinnedContent away from edge of screen
  const ref = useRef(null);
  const { nearRightEdge, nearBottomEdge } = useNearEdge(ref);

  // Record starting click position
  const handlePointerDown = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      dragStart.current = { x: e.clientX, y: e.clientY };
      onPointerDown(e);
    },
    [onPointerDown]
  );

  // If cursor moved, toggle minimized
  const handlePointerUp = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      onPointerUp(e);
      if (
        e.clientX === dragStart.current.x &&
        e.clientY === dragStart.current.y
      ) {
        setMinimized((min) => !min);
      }
    },
    [onPointerUp]
  );

  // If cursor moved, toggle minimized
  const handlePointerMove = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      onPointerMove(e);
    },
    [onPointerMove]
  );

  return (
    <div ref={ref} className={styles.pinned} {...props} onClick={onFocus}>
      <div
        className={styles.avatarPin}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        data-draggable={true}
      >
        <Image
          src={`https://liveblocks.io/avatars/avatar-${Math.floor(
            Math.random() * 30
          )}.png`}
          alt="someone"
          width={28}
          height={28}
          className="rounded-full"
        />
      </div>
      {!minimized ? (
        <div
          className={styles.pinnedContent}
          data-flip-vertical={nearBottomEdge || undefined}
          data-flip-horizontal={nearRightEdge || undefined}
        >
          <Thread
            thread={thread}
            indentCommentContent={false}
            onFocus={onFocus}
          />
        </div>
      ) : null}
    </div>
  );
}
