import React, { useState } from 'react';

const App: React.FC = () => {
  // 状态管理：文件内容、加载状态、错误信息、播放列表
  const [fileContent, setFileContent] = useState<string>('');
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 读取文件的函数
  const handleReadFile = async () => {
    try {
      const content = await window.electronAPI.readFile();
      setFileContent(content);
    } catch (error) {
      console.error('Error reading file:', error);
      alert('Failed to read file. Please check the console for more details.');
    }
  };

  // 保存文件的函数
  const handleSaveFile = async () => {
    try {
      await window.electronAPI.saveFile(fileContent);
      alert('File saved successfully!');
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error saving file:', error);
        alert(`Failed to save file: ${error.message}`);
      } else {
        console.error('Unknown error:', error);
        alert(`Failed to save file: ${String(error)}`);
      }
    }
  };

  // 获取播放列表的函数
  const handleFetchTracks = async () => {
    setLoading(true);
    setError(null);

    try {
      const listId = '501419209';  // 替换为实际的 playlistId
      const cookie = await window.electronAPI.readFile();  // 替换为实际的 cookie

      // 调用主进程方法来获取数据
      const fetchedTracks = await window.electronAPI.fetchPlaylistTracks(listId, cookie);
      setTracks(fetchedTracks);
    } catch (err) {
      setError('Failed to fetch playlist tracks.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* 文件操作区域 */}
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

      {/* 播放列表获取区域 */}
      <h2>Playlist Tracks</h2>
      <button onClick={handleFetchTracks}>Fetch Playlist Tracks</button>

      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}

      <ul>
        {tracks.map((track: any) => (
          <li key={track.id}>{track.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default App;
