import './sass/index.scss';
import { useState } from 'react';
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

  const router = createBrowserRouter([
    {
      path: "/case/:id",
      element: (
        <div className="App">
          <header className="App-header">
            <Dock />
            <Graph setVertex={setVertex} />
            {/*<List items={data.nodes} />*/}
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
