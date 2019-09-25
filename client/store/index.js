import { createStore } from 'redux'

const initialState = {
    players: {}
};

function gameState(state = initialState, action) {
  switch (action.type) {
    default:
      return state
  }
}

// Create a Redux store holding the state of your app.
// Its API is { subscribe, dispatch, getState }.
let store = createStore(
    gameState,
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
)

export default store;
