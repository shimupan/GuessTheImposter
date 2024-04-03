import { Route, Routes } from 'react-router-dom';
import { Home } from './pages/Home';
import { Room } from './pages/Room';

function App() {
   return (
      <>
         <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/:roomId' element={<Room />} />
         </Routes>
      </>
   );
}

export default App;
