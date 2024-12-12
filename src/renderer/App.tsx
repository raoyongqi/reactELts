// src/App.tsx
import React, { useState } from 'react';

const App: React.FC = () => {
  const [fileContent, setFileContent] = useState<string>('');

  const handleReadFile = async () => {
    try {
      const content = await window.electronAPI.readFile();
      setFileContent(content);
    } catch (error) {
      console.error('Error reading file:', error);
      alert('Failed to read file. Please check the console for more details.');
    }
  };
  

  const handleSaveFile = async () => {
    try {
      await window.electronAPI.saveFile(fileContent);
      alert('File saved successfully!');
    } catch (error) {
      if (error instanceof Error) {
        // 如果错误是 Error 类型，获取其 message
        console.error('Error saving file:', error);
        console.log(typeof window.electronAPI.saveFile);

        alert(`Failed to save file: ${error.message}`);
      } else {
        // 如果错误不是 Error 类型，直接将其转为字符串
        console.error('Unknown error:', error);
        alert(`Failed to save file: ${String(error)}`);
      }
    }
  };
  return (
    <div>
      <h1>Hello, Vite + React Foo1 <br />Learn is endless</h1>
      <textarea
        value={fileContent}
        onChange={(e) => setFileContent(e.target.value)}
        placeholder="Edit your file content here"
        rows={10}
        cols={50}
      />
      <br />
      <button onClick={handleReadFile}>Read File</button>
      <button onClick={handleSaveFile}>Save File</button>
    </div>
  );
};

export default App;
