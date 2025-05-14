import { Routes, Route } from 'react-router-dom';
import GrandmasterList from './components/GrandmasterList';
import GrandmasterProfile from './components/GrandmasterProfile';

function App() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-[#22272e] via-[#2d333b] to-[#22272e] font-sans'>
      <header className='p-6'>
        <h1 className='text-center font-mono text-4xl font-extrabold tracking-tight text-blue-200 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]'>
          <span className='mr-2 inline-block align-middle text-blue-400'>
            ♛
          </span>
          Chess Grandmasters
        </h1>
      </header>
      <main>
        <Routes>
          <Route path='/' element={<GrandmasterList />} />
          <Route path='/player/:username' element={<GrandmasterProfile />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
