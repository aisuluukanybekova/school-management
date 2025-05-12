import React, { useState } from 'react';
import axios from 'axios';
import {
  Box, TextField, Typography, IconButton, Paper,
  CircularProgress, Fade
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

const StudentTutorChat = () => {
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!question.trim()) return;

    const newUserMessage = { role: 'user', content: question };
    setChatHistory((prev) => [...prev, newUserMessage]);
    setQuestion('');
    setLoading(true);

    try {
      const res = await axios.post('/api/tutor/ask', { question });
      const newBotMessage = { role: 'bot', content: res.data.answer };
      setChatHistory((prev) => [...prev, newBotMessage]);
    } catch (err) {
      setChatHistory((prev) => [...prev, { role: 'bot', content: '❌ Ошибка при получении ответа от AI.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        🤖 AI Учебный Ассистент
      </Typography>

      <Paper sx={{ p: 2, mb: 2, height: 400, overflowY: 'auto', backgroundColor: '#f9f9f9' }}>
        {chatHistory.map((msg, index) => (
          <Box
            key={index}
            sx={{
              mb: 1,
              textAlign: msg.role === 'user' ? 'right' : 'left',
            }}
          >
            <Box
              sx={{
                display: 'inline-block',
                px: 2,
                py: 1,
                borderRadius: 2,
                backgroundColor: msg.role === 'user' ? '#1976d2' : '#e0e0e0',
                color: msg.role === 'user' ? '#fff' : '#000',
                maxWidth: '75%',
                wordWrap: 'break-word',
              }}
            >
              {msg.content}
            </Box>
          </Box>
        ))}
        {loading && (
          <Fade in={true}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
              <CircularProgress size={24} />
            </Box>
          </Fade>
        )}
      </Paper>

      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          multiline
          placeholder="Задай вопрос..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyPress}
          variant="outlined"
        />
        <IconButton color="primary" onClick={handleSend} disabled={loading}>
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default StudentTutorChat;
