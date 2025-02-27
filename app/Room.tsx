'use client';

import Loader from '@/components/Loader';
import { LiveMap } from '@liveblocks/client';
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from '@liveblocks/react/suspense';
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
const API_KEY = process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY!;
const Room = ({ children }: { children: React.ReactNode }) => {
  const roomId = useExampleRoomId(
    'liveblocks:examples:nextjs-comments-overlay'
  );

  return (
    <LiveblocksProvider publicApiKey={API_KEY}>
      <RoomProvider
        id={roomId}
        /**
         * initialPresence is used to initialize the presence of the current
         * user in the room.
         *
         * initialPresence: https://liveblocks.io/docs/api-reference/liveblocks-react#RoomProvider
         */
        initialPresence={{ cursor: null, cursorColor: null, editingText: null }}
        /**
         * initialStorage is used to initialize the storage of the room.
         *
         * initialStorage: https://liveblocks.io/docs/api-reference/liveblocks-react#RoomProvider
         */
        initialStorage={{
          /**
           * We're using a LiveMap to store the canvas objects
           *
           * LiveMap: https://liveblocks.io/docs/api-reference/liveblocks-client#LiveMap
           */
          canvasObjects: new LiveMap(),
        }}
      >
        <ClientSideSuspense fallback={<Loader />}>
          {() => children}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
};

export default Room;

export const metadata = {
  title: 'Figma Clone',
  description:
    'A minimalist Figma clone using fabric.js and Liveblocks for realtime collaboration',
};

/**
 * This function is used when deploying an example on liveblocks.io.
 * You can ignore it completely if you run the example locally.
 */
function useExampleRoomId(roomId: string) {
  const params = useSearchParams();
  const exampleId = params?.get('exampleId');

  const exampleRoomId = useMemo(() => {
    return exampleId ? `${roomId}-${exampleId}` : roomId;
  }, [roomId, exampleId]);

  return exampleRoomId;
}
