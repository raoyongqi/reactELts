import React, { useState } from 'react';

const FileOperations: React.FC = () => {
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
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error saving file:', error);
        alert(`Failed to save file: ${error.message}`);
      } else {
        console.error('Unknown error:', error);
        alert(`Failed to save file: ${String(error)}`);
      }
    }
  };

  return (
    <div>
      <h2>File Operations</h2>
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

export default FileOperations;
