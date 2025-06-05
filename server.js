const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

app.post('/api/ask', async (req, res) => {
    try {
        const { question, context } = req.body;

        if (!question) {
            return res.status(400).json({ message: 'A pergunta é obrigatória' });
        }


        const chat = model.startChat({
            history: [
                {
                    role: 'user',
                    parts: [{
                        text: 'Você é um assistente especializado exclusivamente em agricultura sustentável. Se receber perguntas que não sejam sobre agricultura, práticas sustentáveis, cultivo, adubação, pragas, tecnologias agrícolas ou temas relacionados, responda educadamente: "Desculpe, só posso responder perguntas relacionadas à agricultura sustentável."Nunca responda perguntas fora desse contexto.'
                    }]
                },
                {
                    role: 'model',
                    parts: [{ text: 'Perfeito! Pode me perguntar sobre esse tema.' }]
                }
            ],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1024
            }
        });

        const result = await chat.sendMessage(question);
        const response = result.response;
        const answer = response.text();

        res.json({ answer });
    } catch (error) {
        console.error('Erro ao processar a pergunta:', error.message);
        res.status(500).json({ message: 'Erro ao processar a pergunta', error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
