import React, { useState } from 'react';

function UsernameInput({ onUsernameSet }) {
  const [username, setUsername] = useState('');

  const handleSubmit = () => {
    if (username.trim()) {
      onUsernameSet(username);
    }
  };

  return (
    <div style={{
      display: 'flex', 
      flexDirection: 'column', 
      maxWidth: '400px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: 'Arial'
    }}>
      <h1>Virtual Tabletop</h1>
      <div style={{marginBottom: '20px'}}>
        <label htmlFor="username">Gib deinen Benutzernamen ein:</label>
        <input 
          id="username"
          type="text" 
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Benutzername"
          style={{width: '100%', padding: '10px', marginTop: '10px'}}
        />
      </div>
      <button 
        onClick={handleSubmit}
        disabled={!username.trim()}
        style={{padding: '10px', backgroundColor: username.trim() ? '#4CAF50' : '#cccccc'}}
      >
        Benutzernamen festlegen
      </button>
    </div>
  );
}

export default UsernameInput;