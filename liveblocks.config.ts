import { createClient, LiveMap } from '@liveblocks/client';
import { createRoomContext } from '@liveblocks/react';

const API_KEY = process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY!;

const client = createClient({
  publicApiKey: API_KEY,

  throttle: 16,
  preventUnsavedChanges: true,
  // Disconnect users after 15 minutes of inactivity
  backgroundKeepAliveTimeout: 15 * 60 * 1000,
  resolveUsers: async (userIds) => {
    return userIds.userIds.map((userId) => {
      return {
        id: userId ?? '',
        name: 'Anonymous',
      };
    });
  },
});

export type AccurateCursorPositions = {
  cursorSelectors: string[];
  cursorX: number;
  cursorY: number;
};

export type DragOffset = {
  x: number;
  y: number;
};

// Presence represents the properties that exist on every user in the Room
// and that will automatically be kept in sync. Accessible through the
// `user.presence` property. Must be JSON-serializable.
type Presence = {
  // cursor: { x: number, y: number } | null,
  // ...
};

// Optionally, Storage represents the shared document that persists in the
// Room, even after all users leave. Fields under Storage typically are
// LiveList, LiveMap, LiveObject instances, for which updates are
// automatically persisted and synced to all connected clients.
type Storage = {
  // author: LiveObject<{ firstName: string, lastName: string }>,
  // ...
  canvasObjects: LiveMap<string, any>;
};

// Optionally, UserMeta represents static/readonly metadata on each user, as
// provided by your own custom auth back end (if used). Useful for data that
// will not change during a session, like a user's name or avatar.
type UserMeta = {
  // id?: string,  // Accessible through `user.id`
  // info?: Json,  // Accessible through `user.info`
};

// Optionally, the type of custom events broadcast and listened to in this
// room. Use a union for multiple events. Must be JSON-serializable.
type RoomEvent = {
  // type: "NOTIFICATION",
  // ...
};

// Optionally, when using Comments, ThreadMetadata represents metadata on
// each thread. Can only contain booleans, strings, and numbers.
export type ThreadMetadata = {
  resolved: boolean;
  zIndex: number;
  time?: number;
  x: number;
  y: number;
};

export const {
  suspense: {
    RoomProvider,
    useRoom,
    useMyPresence,
    useUpdateMyPresence,
    useSelf,
    useOthers,
    useOthersMapped,
    useOthersConnectionIds,
    useOther,
    useBroadcastEvent,
    useEventListener,
    useErrorListener,
    useStorage,
    useHistory,
    useUndo,
    useRedo,
    useCanUndo,
    useCanRedo,
    useMutation,
    useStatus,
    useLostConnectionListener,
    useThreads,
    useUser,
    useCreateThread,
    useEditThreadMetadata,
    useCreateComment,
    useEditComment,
    useDeleteComment,
    useAddReaction,
    useRemoveReaction,
  },
} = createRoomContext<Presence, Storage, UserMeta, RoomEvent, ThreadMetadata>(
  client
);
