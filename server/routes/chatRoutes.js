const express = require("express");
const dotenv = require("dotenv");
const OpenAI = require("openai");

dotenv.config();

const router = express.Router();
// console.log(router);

const openai = new OpenAI(process.env.OPENAI_API_KEY);
// console.log(openai);

router.post("/chat", async (req, res) => {
  const { prompt } = req.body;
  console.log(prompt);

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: `Generate ten multiple-choice questions about ${prompt}.
          I want the answers to be formed like this: "A programming language" not like this: "A) A programming language".
          Organize the results as a JSON array as follows:
          {
            questions: [
              {
                "content": "...",
                "answers": [...],
                "correctAnswers": [index, index, ...],
                "points": number  
             },
              {...},  
            ]
          }
        `,
        },
      ],
      response_format: { type: "json_object" },
    });

    if (response.choices && response.choices.length > 0) {
      res.json({ message: response.choices[0].message.content });
    } else {
      res.status(500).json({ error: "No choices returned from OpenAI API" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.toString() });
  }
});

module.exports = router;

//I want the answers to be formed like this: "A programming language" not like this: "A) A programming language" 