
import { useEffect, useState } from 'react';
import './App.css';

const API_URL = 'http://localhost:8888/externalapi/photos';

function App() {
  // State for popup user details
  const [popupUser, setPopupUser] = useState(null);
  // States for filters and pagination
  const [title, setTitle] = useState('');
  const [albumTitle, setAlbumTitle] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [limit, setLimit] = useState(25);
  const [offset, setOffset] = useState(0);
  const [photos, setPhotos] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Build the API URL with filters and pagination
  function buildUrl() {
    const params = new URLSearchParams();
    if (title) params.append('title', title);
    if (albumTitle) params.append('album.title', albumTitle);
    if (userEmail) params.append('album.user.email', userEmail);
    params.append('limit', limit);
    params.append('offset', offset);
    return `${API_URL}?${params.toString()}`;
  }

  // Fetch data from API
  useEffect(() => {
    setLoading(true);
    setError('');
    fetch(buildUrl())
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch data');
        return res.json();
      })
      .then(data => {
        setPhotos(data.data);
        setTotal(data.total);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line
  }, [title, albumTitle, userEmail, limit, offset]);

  // Handlers for filters and pagination
  const handleFilter = (e) => {
    e.preventDefault();
    setOffset(0); // Reset pagination when filtering
  };

  // When limit changes, reset offset to 0
  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    setOffset(0);
  };

  const handlePageChange = (newOffset) => {
    // If the new offset is greater than total, go to the last valid page
    if (newOffset >= total) {
      setOffset(Math.max(0, (Math.ceil(total / limit) - 1) * limit));
    } else {
      setOffset(newOffset);
    }
  };

  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  return (
    <div className="container">
      <h1>MetaPhoto - Photo Gallery</h1>
      <form className="filters" onSubmit={handleFilter}>
        <input
          type="text"
          placeholder="Filter by photo title"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <input
          type="text"
          placeholder="Filter by album title"
          value={albumTitle}
          onChange={e => setAlbumTitle(e.target.value)}
        />
        <input
          type="text"
          placeholder="Filter by user email"
          value={userEmail}
          onChange={e => setUserEmail(e.target.value)}
        />
        <button type="submit">Filter</button>
      </form>
      <div className="pagination-controls">
        <label>
          Page size:
          <select value={limit} onChange={handleLimitChange}>
            {[10, 25, 50].map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </label>
        <button onClick={() => handlePageChange(Math.max(0, offset - limit))} disabled={offset === 0}>
          Previous
        </button>
        <span>Page {currentPage} of {totalPages || 1}</span>
        <button onClick={() => handlePageChange(offset + limit)} disabled={offset + limit >= total}>
          Next
        </button>
      </div>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div className="photos-grid">
        {photos.map(photo => (
          <div key={photo.id} className="photo-card">
            <img src={photo.thumbnailUrl} alt={photo.title} />
            <h3>{photo.title}</h3>
            <p><b>Album:</b> {photo.album.title}</p>
            <p><b>User:</b> {photo.album.user.name} ({photo.album.user.email})</p>
            <button onClick={() => setPopupUser(photo)}>User Details</button>
          </div>
        ))}
      </div>
      {popupUser && (
        <div className="popup-overlay" style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}}>
          <div className="popup-content" style={{background:'#2d323c',color:'#fff',padding:'2rem',borderRadius:'8px',maxWidth:'400px',width:'90%',position:'relative',boxShadow:'0 2px 16px rgba(0,0,0,0.25)'}}>
            <button style={{position:'absolute',top:10,right:10,background:'#444',color:'#fff',border:'none',padding:'0.5rem 1rem',borderRadius:'4px',cursor:'pointer',fontWeight:'bold'}} onClick={() => setPopupUser(null)}>Close</button>
            <h2 style={{color:'#fff'}}>User Details</h2>
            <ul style={{color:'#fff',fontSize:'1rem',lineHeight:'1.6'}}>
              <li><b>Photo ID:</b> {popupUser.id}</li>
              <li><b>Album ID:</b> {popupUser.album.id}</li>
              <li><b>Username:</b> {popupUser.album.user.username}</li>
              <li><b>Email:</b> {popupUser.album.user.email}</li>
              <li><b>Phone:</b> {popupUser.album.user.phone}</li>
              <li><b>Website:</b> {popupUser.album.user.website}</li>
              <li><b>Company:</b> {popupUser.album.user.company.name}</li>
              <li><b>Address:</b> {popupUser.album.user.address.street}, {popupUser.album.user.address.city}</li>
            </ul>
          </div>
        </div>
      )}
      {photos.length === 0 && !loading && <p>No results found.</p>}
    </div>
  );
}

export default App;
