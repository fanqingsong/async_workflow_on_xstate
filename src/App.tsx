import React, {Suspense} from 'react'
import './App.css';
import { useMachine } from '@xstate/react';
import { toggleMachine } from './toggle.machine';
import { fetchMachine } from './dog.machine';

function App() {
  const [state, send] = useMachine(toggleMachine);
  const active = state.matches('active');
  const { count } = state.context;

  const [dstate, dsend] = useMachine(fetchMachine);
  const { dog } = dstate.context;

  console.log("dog =", dog);

  let dog_url = dog? dog.message: null

  return (
    <div className="app">
      <h1>XState React Template</h1>
      <h2>Fork this template!</h2>

      <button onClick={()=> dsend("FETCH")}>
        load one dog
      </button>
      <div>dog = {dog_url}</div>

      {
        dog_url?
          <img src={dog_url} alt="display image" />
          :""
      }

      {/* <button onClick={() => send('TOGGLE')}>
        Click me ({active ? '✅' : '❌'})
      </button>{' '}
      <code>
        Toggled <strong>{count}</strong> times
      </code> */}
    </div>
  );
}

export default App;
