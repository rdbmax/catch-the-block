import {
    DECONNEXION,
    SCORE_UP,
    NEW_TARGET,
    MOVE,
    NEW_PLAYER,
    LOAD_PLAYERS,
} from '../../shared/index.js'
import store from '../store'

const socket = io.connect(document.location.href)

socket.on(LOAD_PLAYERS, (payload) => {
    store.dispatch({
        type: 'PLAYERS_LOADED',
        payload: {
            target: payload.target,
            players: payload.balls
        }
    })
})

socket.on(NEW_PLAYER, (payload) => {
    store.dispatch({
        type: 'NEW_PLAYER',
        payload,
    })
})

socket.on(MOVE, payload => {
    store.dispatch({
        type: 'MOVE',
        payload,
    })
})

socket.on(NEW_TARGET, (payload) => {
    store.dispatch({
        type: 'NEW_TARGET',
        payload,
    })
})

socket.on(SCORE_UP, (payload) => {
    store.dispatch({
        type: 'SCORE_UP',
        payload,
    })
})

socket.on(DECONNEXION, (payload) => {
    store.dispatch({
        type: DECONNEXION,
        payload,
    })
})

export {
    DECONNEXION,
    SCORE_UP,
    NEW_TARGET,
    MOVE,
    NEW_PLAYER,
    LOAD_PLAYERS
}

export default socket
