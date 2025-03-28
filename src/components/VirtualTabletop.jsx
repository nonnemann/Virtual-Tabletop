import React, { useState } from 'react';
import Peer from 'peerjs';
import { v4 as uuidv4 } from 'uuid';
import Whiteboard from './Whiteboard';
import DiceRoller from './DiceRoller';
import UsernameInput from './UsernameInput';
import LinkSharing from './LinkSharing';
import ChatComponent from './ChatComponent';

function VirtualTabletop() {
  const [peerId, setPeerId] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [username, setUsername] = useState('');
  const [isUsernameSet, setIsUsernameSet] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Bereit');
  const [peer, setPeer] = useState(null);
  const [connections, setConnections] = useState([]);
  const [messages, setMessages] = useState([]);

  const generateShareableLink = () => {
    if (!peerId || !roomId) return null;
    return `${window.location.origin}?room=${roomId}&host=${peerId}`;
  };

  const createRoom = () => {
    const newRoomId = uuidv4();
    setRoomId(newRoomId);
    initializePeer();
  };

  const initializePeer = () => {
    const newPeer = new Peer(undefined, {
      host: 'localhost',
      port: 9000,
      debug: 3
    });

    newPeer.on('open', (id) => {
      console.log(`Peer-ID generiert: ${id}`);
      setPeerId(id);
      setPeer(newPeer);
    });

    newPeer.on('connection', (conn) => {
      setConnectionStatus(`Verbunden mit ${conn.peer}`);
      setConnections(prev => [...prev, conn]);
      
      conn.on('data', (data) => {
        processPeerMessage(data);
      });

      conn.on('close', () => {
        setConnectionStatus('Verbindung getrennt');
        setConnections(prev => prev.filter(c => c.peer !== conn.peer));
      });
    });

    return newPeer;
  };

  const sendMessage = (conn, message) => {
    if (conn && message.trim()) {
      const messageObj = {
        id: uuidv4(),
        text: message,
        sender: peerId,
        senderName: username,
        timestamp: new Date().toLocaleTimeString()
      };
      
      conn.send(messageObj);
      setMessages(prev => [...prev, messageObj]);
    }
  };

  const handleSendMessage = (message) => {
    connections.forEach(conn => {
      sendMessage(conn, message);
    });
  };

  const processPeerMessage = (data) => {
    switch(data.type) {
      case 'SYSTEM_MESSAGE':
      case 'DICE_ROLL':
      case 'TOKEN_MOVE':
      case 'BACKGROUND_UPDATE':
        setMessages(prev => [...prev, data]);
        break;
      default:
        if (data.text) {
          setMessages(prev => [...prev, data]);
        }
    }
  };

  const handleDiceRollResult = (rollResult) => {
    const diceRollMessage = {
      id: uuidv4(),
      type: 'DICE_ROLL',
      text: `${username} rolled a ${rollResult.diceType}: ${rollResult.result}`,
      sender: peerId,
      senderName: username,
      timestamp: rollResult.timestamp
    };

    connections.forEach(conn => {
      conn.send(diceRollMessage);
    });
    setMessages(prev => [...prev, diceRollMessage]);
  };

  const handleUsernameSet = (chosenUsername) => {
    setUsername(chosenUsername);
    setIsUsernameSet(true);
  };

  if (!isUsernameSet) {
    return <UsernameInput onUsernameSet={handleUsernameSet} />;
  }

  return (
    <div style={{
      display: 'flex', 
      flexDirection: 'column', 
      maxWidth: '1400px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: 'Arial',
      height: '100vh'
    }}>
      <h1>Virtual Tabletop</h1>
      
      {!roomId && (
        <button onClick={createRoom}>Neuen Raum erstellen</button>
      )}
      
      {roomId && (
        <div style={{ 
          display: 'flex', 
          gap: '20px', 
          height: 'calc(100% - 60px)', 
          overflow: 'hidden' 
        }}>
          {/* Linke Spalte: Chat und Würfel */}
          <div style={{ 
            flex: '0 0 300px', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '20px' 
          }}>
            <div>
              <p>Verbindungsstatus: {connectionStatus}</p>
              <p>Dein Benutzername: {username}</p>
              
              <LinkSharing generateShareableLink={generateShareableLink} />

              <ChatComponent 
                messages={messages}
                peerId={peerId}
                username={username}
                connections={connections}
                onMessageSend={handleSendMessage}
              />

              <DiceRoller 
                connections={connections}
                peerId={peerId}
                username={username}
                onRollResult={handleDiceRollResult}
              />
            </div>
          </div>

          {/* Rechte Spalte: Whiteboard mit Scrollbereich */}
          <div style={{ 
            flex: '1', 
            overflowY: 'auto', 
            border: '1px solid #ccc',
            padding: '10px'
          }}>
            <Whiteboard 
              peerId={peerId} 
              isHost={roomId && peerId} 
              connections={connections}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default VirtualTabletop;