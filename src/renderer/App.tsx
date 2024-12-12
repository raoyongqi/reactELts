import React, { useState } from 'react';

const App: React.FC = () => {
  const [fileContent, setFileContent] = useState<string>('');
  const [trackName, setTrackName] = useState<string>(''); // 保存第一首歌的名字
  const [trackLyrics, setTrackLyrics] = useState<string>(''); // 保存第一首歌的歌词
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseLyrics = (lyric: string) => {
    const lyricLines = lyric.split('\n');
    return lyricLines.map((line, index) => {
      const match = line.match(/\[(\d{2}):(\d{2}\.\d{2})\](.*)/);
      if (match) {
        return (
          <div key={index} style={{ margin: '5px 0' }}>
            <span style={{ color: 'gray' }}>
              {match[1]}:{match[2]} -{' '}
            </span>
            <span>{match[3]}</span>
          </div>
        );
      }
      return null;
    });
  };

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
  
  const handleFetchTracks = async () => {
    setLoading(true);
    setError(null);

    try {
      const listId = '501419209'; // 替换为实际的 playlistId
      const cookie = await window.electronAPI.readFile(); // 替换为实际的 cookie

      const track = await window.electronAPI.fetchPlaylistTracks(listId, cookie);
      console.log(track);
      if (track && track.name && track.lyric) {
        setTrackName(track.name.name);
        setTrackLyrics(track.lyric);
      } else {
        setError('No lyrics available');
      }
    } catch (err) {
      setError('Failed to fetch playlist tracks.');
    } finally {
      setLoading(false);
    }
  };

  // 调用主进程保存文件的函数
  const handleDownloadTrackInfo = async () => {
    if (!trackName || !trackLyrics) {
      alert('No track name or lyrics available to save.');
      return;
    }
  
    try {
      // Call the main process to save the file
      const filePath = await window.electronAPI.saveTrackInfo(trackName, trackLyrics);
      alert(`File saved successfully at ${filePath}`);
    } catch (error) {
      console.error('Error saving track info:', error);
      alert('Failed to save track info.');
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

      <h2>First Track Info</h2>
      <button onClick={handleFetchTracks}>Fetch First Track</button>

      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}

      {trackName && <h3>{trackName}</h3>}
      {trackLyrics && <div>{parseLyrics(trackLyrics)}</div>}

      {trackName && trackLyrics && (
        <button onClick={handleDownloadTrackInfo}>Download Track Info</button>
      )}
    </div>
  );
};

export default App;
