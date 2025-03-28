import React, { useState, useRef } from 'react';

const DiceRoller = ({ connections, peerId, username, onRollResult }) => {
  const [diceType, setDiceType] = useState('d20');
  const animationRef = useRef(null);

  const DICE_TYPES = {
    'd4': { sides: 4 },
    'd6': { sides: 6 },
    'd8': { sides: 8 },
    'd10': { sides: 10 },
    'd12': { sides: 12 },
    'd20': { sides: 20 }
  };

  const rollDice = () => {
    const { sides } = DICE_TYPES[diceType];
    const result = Math.floor(Math.random() * sides) + 1;

    // Würfelergebnis im Chat teilen
    connections.forEach(conn => {
      conn.send({
        type: 'DICE_ROLL',
        result,
        diceType,
        sender: peerId,
        senderName: username
      });
    });

    // Callback für übergeordnete Komponente
    onRollResult({
      result,
      diceType,
      timestamp: new Date().toLocaleTimeString()
    });

    // Animationsreferenz für zukünftige 3D-Implementierung
    animateDiceRoll(result);
  };

  const animateDiceRoll = (result) => {
    // Placeholder for future 3D dice animation
    // Currently just a simple visual indication
    if (animationRef.current) {
      animationRef.current.textContent = `Rolled ${diceType}: ${result}`;
      animationRef.current.style.animation = 'shake 0.5s';
      
      setTimeout(() => {
        if (animationRef.current) {
          animationRef.current.style.animation = '';
        }
      }, 500);
    }
  };

  return (
    <div style={{ 
      textAlign: 'center', 
      padding: '20px',
      backgroundColor: '#f0f0f0',
      borderRadius: '8px'
    }}>
      <div style={{ marginBottom: '15px' }}>
        <select 
          value={diceType} 
          onChange={(e) => setDiceType(e.target.value)}
          style={{
            padding: '5px',
            marginRight: '10px',
            borderRadius: '4px'
          }}
        >
          {Object.keys(DICE_TYPES).map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <button 
          onClick={rollDice}
          style={{
            padding: '5px 15px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Würfeln
        </button>
      </div>
      <div 
        ref={animationRef} 
        style={{ 
          height: '50px', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          fontWeight: 'bold'
        }}
      />
      <style jsx>{`
        @keyframes shake {
          0% { transform: translate(1px, 1px) rotate(0deg); }
          10% { transform: translate(-1px, -2px) rotate(-1deg); }
          20% { transform: translate(-3px, 0px) rotate(1deg); }
          30% { transform: translate(3px, 2px) rotate(0deg); }
          40% { transform: translate(1px, -1px) rotate(1deg); }
          50% { transform: translate(-1px, 2px) rotate(-1deg); }
          60% { transform: translate(-3px, 1px) rotate(0deg); }
          70% { transform: translate(3px, 1px) rotate(-1deg); }
          80% { transform: translate(-1px, -1px) rotate(1deg); }
          90% { transform: translate(1px, 2px) rotate(0deg); }
          100% { transform: translate(1px, -2px) rotate(-1deg); }
        }
      `}</style>
    </div>
  );
};

export default DiceRoller;