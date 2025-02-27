'use client';

import styles from './Pinned.module.css';
import { PointerEventHandler, useRef } from 'react';

import { Composer, ComposerProps } from '@liveblocks/react-ui';
import { useNearEdge } from '@/lib/useNearEdge';
import Image from 'next/image';
import { IUserInfo } from '@liveblocks/core';

type Props = {
  onPointerDown: PointerEventHandler<HTMLDivElement>;
  onPointerMove: PointerEventHandler<HTMLDivElement>;
  onPointerUp: PointerEventHandler<HTMLDivElement>;
  onComposerSubmit: ComposerProps['onComposerSubmit'];
};

export function PinnedComposer({
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onComposerSubmit,
  ...props
}: Props) {
  // Flip pinnedContent away from edge of screen
  const ref = useRef(null);
  const { nearRightEdge, nearBottomEdge } = useNearEdge(ref);

  return (
    <div ref={ref} className={styles.pinned} {...props}>
      <div
        className={styles.avatarPin}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
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
      <div
        className={styles.pinnedContent}
        data-flip-vertical={nearBottomEdge || undefined}
        data-flip-horizontal={nearRightEdge || undefined}
      >
        <Composer
          onComposerSubmit={onComposerSubmit}
          onClick={(e) => {
            // Don't send up a click event from emoji popout and close the composer
            e.stopPropagation();
          }}
          autoFocus={true}
        />
      </div>
    </div>
  );
}
