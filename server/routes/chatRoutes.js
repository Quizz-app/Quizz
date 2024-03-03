const express = require("express");
const dotenv = require("dotenv");
const OpenAI = require("openai");
const { json } = require("body-parser");

dotenv.config();

const router = express.Router();

const openai = new OpenAI(process.env.OPENAI_API_KEY);

router.post("/chat", async (req, res) => {

  const { prompt } = req.body;

//   console.log(prompt)
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: prompt,
         response_format: {
          type: "json_object",
         }
        },
      ],
      temperature: 1,
      max_tokens: 256,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    // console.log(response.choices[0].message.content);

    if (response.choices && response.choices.length > 0) {
      res.send(response.choices[0].message.content);
    } else {
      res.status(500).send("No choices returned from OpenAI API");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

module.exports = router;
