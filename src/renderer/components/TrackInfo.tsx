import React, { useState } from 'react';

const TrackInfo: React.FC = () => {
const [trackID, setTrackID] = useState<string>('');

  const [trackName, setTrackName] = useState<string>('');
  const [trackLyrics, setTrackLyrics] = useState<string>('');
  const [trackUrl, setTrackUrl] = useState<string>('');
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

  const handleFetchTracks = async () => {
    setLoading(true);
    setError(null);

    try {
      const listId = '501419209'; // 替换为实际的 playlistId
      const cookie = await window.electronAPI.readFile(); // 替换为实际的 cookie

      const track = await window.electronAPI.fetchPlaylistTracks(listId, cookie);
      if (track && track.song && track.lyric) {
        setTrackName(track.song.name);
        setTrackID(track.song.id);
        setTrackLyrics(track.lyric);
        setTrackUrl(track.url);
      } else {
        setError('No lyrics available');
      }
    } catch (err) {
      setError('Failed to fetch playlist tracks.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTrackInfo = async () => {


    if (!trackUrl) {
      console.log('Download URL not found. Skipping download.');
      return;
    }

    try {
      const filePath = await window.electronAPI.saveTrackInfo(trackName, trackLyrics);

          // 调用主进程下载文件
    await window.electronAPI.downloadTrackFromUrl(trackName,trackUrl);
      alert(`File saved successfully at ${filePath}`);
    } catch (error) {
      console.error('Error saving track info:', error);
      alert('Failed to save track info.');
    }
  };

  return (
    <div>
      <h2>First Track Info</h2>
      <button onClick={handleFetchTracks}>Fetch First Track</button>

      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      {trackID && <h3>{trackID}</h3>}

      {trackName && <h3>{trackName}</h3>}

      {trackLyrics && <div>{parseLyrics(trackLyrics)}</div>}
      {trackUrl && <div>{trackUrl}</div>}

      {trackName && trackLyrics && (
        <button onClick={handleDownloadTrackInfo}>Download Track Info</button>
      )}
    </div>
  );
};

export default TrackInfo;
