import { createMachine, interpret, assign } from 'xstate';


const fetchDogBreed = async (context, event) => {
  const data = await fetch('https://dog.ceo/api/breeds/list/all');

  console.log("dog breed data = ", data);

  return await data.json();
}

const getBreeds = (context, event) => {
  console.log("event.data.message =", event.data.message)

  return event.data.message;
}

const showBreed = async (context, event) => {
  console.log("showBreed promise is called.");

  let dogBreeds = context.dogBreeds;
  let dogPointer = context.dogPointer;

  console.log("dog breeds:", dogBreeds, typeof(dogBreeds));
  let dogBreedKeys = [];
  for(let oneBreed in dogBreeds){
    dogBreedKeys.push(oneBreed);
  }
  console.log("dog breed keys:", dogBreedKeys);

  if (dogPointer >= dogBreedKeys.length) {
    console.log('No more dog breed.')
    // reject('No more dog breed.');
    return;
  }

  let dogBreed = dogBreedKeys[dogPointer];

  console.log("before call api.");

  let api = `https://dog.ceo/api/breed/${dogBreed}/images/random`;

  let data = await fetch(api);

  console.log("dog breed data = ", data);

  return await data.json();
};


export const fetchMachine = createMachine({
  id: 'Dog API',
  initial: 'idle',
  context: {
    dog: null,
    dogBreeds: null,
    dogPointer: null
  },
  states: {
    idle: {
      on: {
        FETCH: 'breedLoading'
      }
    },
    breedLoading:{
      invoke: {
        id: 'fetchDogBreed',
        src: fetchDogBreed,
        onDone: {
          target: 'breedShowing',
          actions: assign({
            dogBreeds: getBreeds,
            dogPointer: 0
          })
        },
        onError: 'failure'
      },
      on: {
        CANCEL: 'idle'
      }
    },
    breedShowing:{
      invoke: {
        id: 'showBreed',
        src: showBreed,
        onDone: {
          target: 'waiting',
          actions: assign({
            dog: (context, event) => {
                console.log("event.data.message =", event.data.message)

                return event.data.message
            }
          })
        },
        onError: 'success'
      },
      on: {
        CANCEL: 'idle'
      }
    },
    waiting: {
      invoke: {
        id: 'wait',
        src: (context, event) => (callback, onReceive) => {
          // This will send the 'TIMEOUT' event to the parent every second
          const id = setInterval(() => callback('TIMEOUT'), 10000);
    
          // Perform cleanup
          return () => clearInterval(id);
        }
      },
      on: {
        TIMEOUT: { 
          target: 'breedShowing',
          actions: assign({ dogPointer: context => context.dogPointer + 1 }) 
        }
      }
    },
    success: {
      type: 'final'
    },
    failure: {
      on: {
        FETCH: 'breedLoading'
      }
    }
  }
});

// const dogService = interpret(fetchMachine)
//   .onTransition((state) => console.log(state.value))
//   .start();

// dogService.send('FETCH');
