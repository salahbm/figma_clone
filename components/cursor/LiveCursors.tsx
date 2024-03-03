import { LiveCursorProps } from '@/types/type';
import React from 'react';
import Cursor from './Cursor';
import { COLORS } from '@/constants';

const LiveCursors = ({ others }: any) => {
  return others.map((connectionId: number, presence: any) => {
    if (!presence?.cursor) return null;

    return (
      <Cursor
        key={connectionId.toString()} // Change the type of the key attribute to be a string
        color={COLORS[Number(connectionId) % COLORS.length]}
        x={presence.cursor.x}
        y={presence.cursor.y}
        message={presence.message}
      />
    );
  });
};

export default LiveCursors;
