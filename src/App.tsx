import { Routes, Route } from 'react-router-dom';
import GrandmasterList from './components/GrandmasterList';
import GrandmasterProfile from './components/GrandmasterProfile';

function App() {
  return (
    <Routes>
      <Route path='/' element={<GrandmasterList />} />
      <Route path='/player/:username' element={<GrandmasterProfile />} />
    </Routes>
  );
}

export default App;
