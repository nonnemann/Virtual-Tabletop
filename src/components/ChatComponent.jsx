import React, { useState, useRef, useEffect } from 'react';

function ChatComponent({ 
  messages, 
  peerId, 
  username, 
  connections, 
  onMessageSend 
}) {
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      onMessageSend(inputMessage);
      setInputMessage('');
    }
  };

  return (
    <div>
      {/* Chat-Bereich */}
      <div style={{
        border: '1px solid #ccc', 
        height: '300px', 
        overflowY: 'scroll',
        marginBottom: '10px',
        padding: '10px'
      }}>
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            style={{
              marginBottom: '5px',
              padding: '5px',
              backgroundColor: 
                msg.type === 'DICE_ROLL' ? '#e6f2ff' :
                msg.sender === peerId ? '#f0f0f0' : '#e6f2ff'
            }}
          >
            <small>{msg.timestamp}</small>
            <br />
            <strong>{msg.sender === peerId ? 'Du' : msg.senderName}: </strong>
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div style={{display: 'flex', marginBottom: '10px'}}>
        <input 
          type="text" 
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Nachricht eingeben"
          style={{flexGrow: 1, marginRight: '10px'}}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <button onClick={handleSendMessage}>Senden</button>
      </div>
    </div>
  );
}

export default ChatComponent;