import Button from './Button';
import { toast } from 'react-toastify';
import interactImg from '../../../assets/interact.svg';
import { useConvexAuth, useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { SignInButton } from '@clerk/clerk-react';
import { ConvexError } from 'convex/values';

export default function InteractButton() {
  const { isAuthenticated } = useConvexAuth();
  const worldStatus = useQuery(api.world.defaultWorldStatus);
  const worldId = worldStatus?.worldId;
  const humanTokenIdentifier = useQuery(api.world.userStatus, worldId ? { worldId } : 'skip');
  const gameState = useQuery(api.world.gameState, worldId ? { worldId } : 'skip');
  const userPlayerId = gameState?.world.players.find((p) => p.human === humanTokenIdentifier)?.id;
  const join = useMutation(api.world.joinWorld);
  const leave = useMutation(api.world.leaveWorld);
  const isPlaying = !!userPlayerId;

  const joinOrLeaveGame = () => {
    if (!worldId || !isAuthenticated || userPlayerId === undefined) {
      return;
    }
    if (isPlaying) {
      console.log(`Leaving game for player ${userPlayerId}`);
      void leave({ worldId });
    } else {
      console.log(`Joining game`);
      join({ worldId }).catch((error) => {
        if (error instanceof ConvexError) {
          toast.error(error.data);
        }
      });
    }
  };
  if (!isAuthenticated || userPlayerId === undefined) {
    return (
      <SignInButton>
        <button className="button text-white shadow-solid text-2xl pointer-events-auto">
          <div className="inline-block bg-clay-700">
            <div className="inline-flex h-full items-center gap-4">
              <img className="w-[30px] h-[30px]" src={interactImg} />
              Interact
            </div>
          </div>
        </button>
      </SignInButton>
    );
  }
  return (
    <Button imgUrl={interactImg} onClick={joinOrLeaveGame}>
      {isPlaying ? 'Leave' : 'Interact'}
    </Button>
  );
}
