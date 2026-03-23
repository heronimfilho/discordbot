import { ICommand } from '../../types/Command';
import { MusicService } from '../../services/MusicService';
import { createTocarCommand } from './tocar';
import { createPararCommand } from './parar';
import { createPularCommand } from './pular';
import { createPausarCommand } from './pausar';
import { createRetomarCommand } from './retomar';
import { createVolumeCommand } from './volume';
import { createAgoraCommand } from './agora';
import { createFilaCommand } from './fila';
import { createLimparCommand } from './limpar';
import { createEmbaralharCommand } from './embaralhar';
import { createRepetirCommand } from './repetir';
import { createRemoverCommand } from './remover';

export function createAllMusicCommands(musicService: MusicService): ICommand[] {
  return [
    createTocarCommand(musicService),
    createPararCommand(musicService),
    createPularCommand(musicService),
    createPausarCommand(musicService),
    createRetomarCommand(musicService),
    createVolumeCommand(musicService),
    createAgoraCommand(musicService),
    createFilaCommand(musicService),
    createLimparCommand(musicService),
    createEmbaralharCommand(musicService),
    createRepetirCommand(musicService),
    createRemoverCommand(musicService),
  ];
}
