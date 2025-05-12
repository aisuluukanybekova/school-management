const { OpenAI } = require('openai');
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.askTutor = async (req, res) => {
  const { question } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: question }],
    });

    const answer = completion.choices[0].message.content;
    res.json({ answer });
  } catch (err) {
    console.error('🛑 OpenAI ERROR:', err.response?.data || err.message || err);
    res.status(500).json({ error: 'Ошибка AI: ' + err.message });
  }
};
