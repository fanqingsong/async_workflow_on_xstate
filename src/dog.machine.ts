import { createMachine, interpret, assign } from 'xstate';


const fetchDogBreed = async (context, event) => {
  const data = await fetch('https://dog.ceo/api/breeds/list/all');

  console.log("dog breed data = ", data);

  return await data.json();
}

const getBreeds = (context, event) => {
  console.log("event.data.message =", event.data.message)

  let rawDogBreeds = event.data.message;

  console.log("raw dog breeds:", rawDogBreeds, typeof(rawDogBreeds));
  let dogBreeds = [];

  for(let oneBreed in rawDogBreeds){
    let oneBreedChildren = rawDogBreeds[oneBreed];
    // only get this breed without sub breed.
    if (oneBreedChildren.length == 0){
      dogBreeds.push(oneBreed);
    }
  }
  console.log("dog breeds filtered:", dogBreeds);

  return dogBreeds;
}

const checkPointer = (context, event) => (callback, onReceive) => {
  console.log("checkPointer is called.");

  let dogBreeds = context.dogBreeds;
  let dogPointer = context.dogPointer;

  console.log("dog breeds:", dogBreeds);
  console.log("dog pointer:", dogPointer);

  if (dogPointer >= dogBreeds.length) {
    console.log('No more dog breed.')
    callback("TO_THE_END");
  } else {
    callback("PASSED")
  }

  // Perform cleanup
  return () => {};
}

const getDogURL = async (context, event) => {
  console.log("getDogURL promise is called.");

  let dogBreeds = context.dogBreeds;
  let dogPointer = context.dogPointer;

  console.log("dog breeds:", dogBreeds);
  console.log("dog pointer:", dogPointer);

  let dogBreed = dogBreeds[dogPointer];

  console.log("before call api.");

  let api = `https://dog.ceo/api/breed/${dogBreed}/images/random`;

  let data = await fetch(api);

  console.log("dog breed data = ", data);

  return await data.json();
};

const increasePointer = (context, event) => (callback, onReceive) => {
  console.log("increasePointer is called.");

  let dogPointer = context.dogPointer;

  console.log("dog pointer:", dogPointer);

  callback("OK")

  // Perform cleanup
  return () => {};
}

export const fetchMachine = createMachine({
  id: 'Dog API',
  initial: 'idle',
  context: {
    dogURL: null,
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
    pointerChecking: {
      invoke: {
        id: 'checkPointer',
        src: checkPointer
      },
      on: {
        PASSED: { 
          target: 'breedShowing',
        },
        TO_THE_END: {
          target: 'success'
        }
      }
    },
    breedShowing:{
      invoke: {
        id: 'getDogURL',
        src: getDogURL,
        onDone: {
          target: 'waiting',
          actions: assign({
            dogURL: (context, event) => {
                console.log("event.data.message =", event.data.message)

                return event.data.message
            },
          })
        },
        onError: 'failure'
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
          target: 'pointerIncreasing'
        }
      }
    },
    pointerIncreasing: {
      invoke: {
        id: 'increasePointer',
        src: increasePointer
      },
      on: {
        OK: { 
          target: 'breedShowing',
          actions: assign({
            dogPointer: context => context.dogPointer + 1
          })
        },
      }
    },
    success: {
      type: 'final'
    },
    failure: {
      on: {
        RETRY: 'idle'
      }
    }
  }
});

// const dogService = interpret(fetchMachine)
//   .onTransition((state) => console.log(state.value))
//   .start();

// dogService.send('FETCH');
