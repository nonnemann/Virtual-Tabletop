import React, { useState, useEffect, useRef } from 'react';

function Whiteboard({ peerId, isHost, connections }) {
  const [gridWidth, setGridWidth] = useState(10);
  const [gridHeight, setGridHeight] = useState(10);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [playerTokens, setPlayerTokens] = useState({});
  const [draggedToken, setDraggedToken] = useState(null);
  const gridRef = useRef(null);

  // Token-Management
  const createPlayerToken = (color) => {
    const newToken = {
      id: `token-${Date.now()}`,
      color: color,
      position: { x: 0, y: 0 }
    };
    setPlayerTokens(prev => ({
      ...prev, 
      [newToken.id]: newToken
    }));
    return newToken;
  };

  const moveToken = (tokenId, newPos) => {
    setPlayerTokens(prev => ({
      ...prev,
      [tokenId]: {
        ...prev[tokenId],
        position: newPos
      }
    }));

    // Synchronisiere Token-Bewegung mit anderen Peers
    connections.forEach(conn => {
      conn.send({
        type: 'TOKEN_MOVE',
        tokenId,
        position: newPos,
        sender: peerId
      });
    });
  };

  // Hintergrundkarten-Funktion
  const handleBackgroundUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setBackgroundImage(e.target.result);
        
        // Teile Hintergrundkarte mit anderen Peers
        connections.forEach(conn => {
          conn.send({
            type: 'BACKGROUND_UPDATE',
            image: e.target.result,
            sender: peerId
          });
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Drag and Drop Funktionen
  const handleTokenMouseDown = (e, token) => {
    const gridRect = gridRef.current.getBoundingClientRect();
    const offsetX = e.clientX - gridRect.left;
    const offsetY = e.clientY - gridRect.top;
    
    setDraggedToken({
      ...token,
      offsetX,
      offsetY
    });
  };

  const handleMouseMove = (e) => {
    if (!draggedToken) return;

    const gridRect = gridRef.current.getBoundingClientRect();
    const cellWidth = gridRect.width / gridWidth;
    const cellHeight = gridRect.height / gridHeight;

    const x = Math.floor((e.clientX - gridRect.left) / cellWidth);
    const y = Math.floor((e.clientY - gridRect.top) / cellHeight);

    // Stelle sicher, dass die Koordinaten innerhalb des Grids liegen
    const clampedX = Math.max(0, Math.min(x, gridWidth - 1));
    const clampedY = Math.max(0, Math.min(y, gridHeight - 1));

    moveToken(draggedToken.id, { x: clampedX, y: clampedY });
  };

  const handleMouseUp = () => {
    setDraggedToken(null);
  };

  useEffect(() => {
    if (draggedToken) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggedToken]);

  // Grid-Rendering
  const renderGrid = () => {
    const grid = [];
    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < gridWidth; x++) {
        const tokens = Object.values(playerTokens).filter(
          token => token.position.x === x && token.position.y === y
        );

        grid.push(
          <div 
            key={`cell-${x}-${y}`}
            style={{
              width: '50px', 
              height: '50px', 
              border: '1px solid rgba(204, 204, 204, 0.5)',
              position: 'relative',
              backgroundColor: 'transparent'
            }}
          >
            {tokens.map(token => (
              <div 
                key={token.id}
                style={{
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '50%', 
                  backgroundColor: token.color,
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  cursor: 'grab'
                }}
                onMouseDown={(e) => handleTokenMouseDown(e, token)}
              />
            ))}
          </div>
        );
      }
    }
    return grid;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {isHost && (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'row', 
          marginBottom: '20px',
          gap: '10px'
        }}>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleBackgroundUpload} 
          />
          <div>
            <label>
              Grid Breite:
              <input 
                type="number" 
                value={gridWidth}
                onChange={(e) => setGridWidth(Number(e.target.value))}
                min="1"
                max="50"
              />
            </label>
          </div>
          <div>
            <label>
              Grid Höhe:
              <input 
                type="number" 
                value={gridHeight}
                onChange={(e) => setGridHeight(Number(e.target.value))}
                min="1"
                max="50"
              />
            </label>
          </div>
        </div>
      )}

      <div 
        ref={gridRef}
        style={{
          display: 'grid', 
          gridTemplateColumns: `repeat(${gridWidth}, 50px)`,
          gridTemplateRows: `repeat(${gridHeight}, 50px)`,
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          border: '1px solid #000'
        }}
      >
        {renderGrid()}
      </div>

      <div style={{marginTop: '20px'}}>
        <button onClick={() => createPlayerToken('#' + Math.floor(Math.random()*16777215).toString(16))}>
          Neuer Token
        </button>
      </div>
    </div>
  );
}

export default Whiteboard;