import React, { useState } from 'react';

function LinkSharing({ generateShareableLink }) {
  const [copyStatus, setCopyStatus] = useState('Link kopieren');

  const copyLink = () => {
    const link = generateShareableLink();
    if (link) {
      navigator.clipboard.writeText(link).then(() => {
        setCopyStatus('Kopiert!');
        setTimeout(() => setCopyStatus('Link kopieren'), 2000);
      });
    }
  };

  return (
    <div style={{marginBottom: '10px'}}>
      <p>Teilbarer Link:</p>
      <input 
        type="text" 
        value={generateShareableLink() || 'Kein Link verfügbar'} 
        readOnly 
        style={{width: '100%', marginRight: '10px'}}
      />
      <button onClick={copyLink}>{copyStatus}</button>
    </div>
  );
}

export default LinkSharing;