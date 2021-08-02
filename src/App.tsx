import React, {Suspense} from 'react'

// import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import { useMachine } from '@xstate/react';
import { fetchMachine } from './dog.machine';

import { 
  Button,
  Container,
  Row,
  Col,
  Alert,
  Image,
  Pagination,
} from 'react-bootstrap';

function App() {
  const [dstate, dsend] = useMachine(fetchMachine);
  const { dogURL, dogBreeds, dogPointer } = dstate.context;

  console.log("dogURL =", dogURL);

  let paginationItems = [];
  if (dogBreeds) {
    let active = dogPointer;
    let dogBreedNum = dogBreeds.length;
    let paddingNum = 5;

    let leftIndex = dogPointer - paddingNum;
    leftIndex = leftIndex>=0?leftIndex:0;
    let leftHidden = leftIndex > 0;

    let rightIndex = dogPointer + paddingNum;
    rightIndex = rightIndex<dogBreedNum?rightIndex:dogBreedNum-1;
    let rightHidden = rightIndex < dogBreedNum - 1;

    if (leftHidden) {
      paginationItems.push(
        <Pagination.Ellipsis />
      )
    }

    for (let number = leftIndex; number <= rightIndex; number++) {
      paginationItems.push(
        <Pagination.Item key={number} active={number === dogPointer}>
          {dogBreeds[number]}
        </Pagination.Item>,
      );
    }

    if (rightHidden) {
      paginationItems.push(
        <Pagination.Ellipsis />
      )
    }
  }

  return (
    <div className="app">
      <Container fluid>
        <Row>
          <Col fluid>
            <Alert variant="primary">
              <h1>
                Dog Gallery
              </h1>
            </Alert>

            <Button variant="primary" onClick={()=> dsend("FETCH")}>
              Start browsing all breed.
            </Button>

            <br/>
          </Col>
        </Row>
        <Row>
          <Col fluid>
            {
              dogBreeds?
                <div>
                    <Pagination fluid>
                      {paginationItems}
                    </Pagination>
                    <div>{dogPointer+1}/{dogBreeds.length}</div>
                </div>
              : ""
            }
          </Col>
        </Row>
        <Row>
          <Col fluid>
            {
              dogURL?
                <div>
                  <div>
                    <a href={dogURL}>
                      <Button variant="link">{dogURL}</Button>
                    </a>
                  </div>
                  <Image src={dogURL} fluid />
                </div>
                :""
            }
          </Col>
        </Row>
      </Container>


    </div>
  );
}

export default App;
