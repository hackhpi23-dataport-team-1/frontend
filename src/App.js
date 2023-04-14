import ForceGraph2D from 'react-force-graph-2d';
import './sass/index.scss';
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import Dock from './components/Dock';
import List from './components/List';
import Info from './components/Info';
import Graph from './components/Graph';
import CaseUpload from './components/Upload';

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

function App() {

  const [vertex, setVertex] = useState(null);

  const myData = {
    nodes: [{ id: 'a', score: 30 }, { id: 'b', score: 50 }, { id: 'c', score: 20 }, { id: 'a', score: 100 }, { id: 'b', score: 20 }, { id: 'c', score: 80 }],
    links: [
      { source: 'a', target: 'b' },
      { source: 'c', target: 'a' }
    ]
  };

  const router = createBrowserRouter([
    {
      path: "/case/:id",
      element: (
        <div className="App">
          <header className="App-header">
            <Dock />
            <Graph setVertex={setVertex} />
            {/*<List items={myData.nodes} />*/}
            <Info vertex={vertex}/>
          </header>
        </div>
      ),
    },
    {
      path: "/",
      element: (
        <div className="App">
          <header className="App-header">
            <Dock />
            <CaseUpload />
          </header>
        </div>
      ),
    }
  ]);

  return (
    <RouterProvider router={router}></RouterProvider>
  );
}

export default App;
