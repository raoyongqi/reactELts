import React from 'react';
import FileOperations from './components/FileOperations';
import TrackInfo from './components/TrackInfo';

const App: React.FC = () => {
  return (
    <div>
      <h1>Music App</h1>
      <FileOperations />
      <TrackInfo />
    </div>
  );
};

export default App;
