import {
    DECONNEXION,
    SCORE_UP,
    NEW_TARGET,
    MOVE,
    NEW_PLAYER,
    LOAD_PLAYERS,
} from '../../shared/index.js'

const socket = io.connect(document.location.href);

export {
    DECONNEXION,
    SCORE_UP,
    NEW_TARGET,
    MOVE,
    NEW_PLAYER,
    LOAD_PLAYERS
}

export default socket;
