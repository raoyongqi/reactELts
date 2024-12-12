import React, { useState } from 'react';

const App: React.FC = () => {
  // 状态管理：文件内容、加载状态、错误信息、播放列表和歌词
  const [fileContent, setFileContent] = useState<string>('');
  const [trackName, setTrackName] = useState<string>(''); // 保存第一首歌的名字
  const [trackLyrics, setTrackLyrics] = useState<string>(''); // 保存第一首歌的歌词
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 解析歌词文本中的时间戳
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

      // 调用主进程方法来获取播放列表数据
      const track= await window.electronAPI.fetchPlaylistTracks(listId, cookie);
      console.log(track)
      if (track && track.name && track.lyric) {
        setTrackName(track.name.name);
        setTrackLyrics(track.lyric);
      } else {
        setError('No lyrics available');
      }     // 如果 track 是 Track 类型，设置名字和歌词
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
      <h2>First Track Info</h2>
      <button onClick={handleFetchTracks}>Fetch First Track</button>

      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}

      {/* 显示第一首歌的名字和歌词 */}
      {trackName && <h3>{trackName}</h3>}
      {trackLyrics && <div>{parseLyrics(trackLyrics)}</div>}
    </div>
  );
};

export default App;
