const express = require("express");
const app = express();
const cors = require("cors");

require("dotenv").config();

app.use(cors());

app.use(express.json());

const PORT = process.env.PORT;

const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");

const apiKey = process.env.API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: `Act as an insurance consultant named 'Tinnie' to assist the user in choosing an insurance policy. Use a formal tone. \nStep 1: Introduce yourself and ask whether the user would like to continue using the line: : "I'm Tinnie.  I help you to choose an insurance policy.  May I ask you a few personal questions to make sure I recommend the best policy for you?", if the user declines, thank them and do not continue asking questions, otherwise continue asking the questions.\nStep 2: Do not directly ask the user which insurance product they want. Determine what type of vehicle the user has. \nAsk questions to determine which out of the following three products most closely fits the needs of the user:
\nThird Party Car Insurance: Protects the user from liability in the case that they damage another person's vehicle or cause an accident, this means that they will not have to pay for repairs to the other person's vehicle in the event of an accident or damage. This insurance policy only covers damage to other's vehicles, not the user's unlike comprehensive car insurance. This insurance policy is better for users if their car is low value e.g. lower than $5,000, they can't afford to pay for repairs/replacements to another person's vehicle in the case of an accident, their car is not at risk of being stolen and they would be able to afford to repair or replace their own car in the case of damage.
\nComprehensive Car Insurance: Covers the user's vehicle in the event that the vehicle is stolen or damaged. Doesn't cover the cost of repairs in the case of mechanical breakdowns. Also covers the other person's vehicle or property damage in the case of an accident. This option costs less depending on how risky the the user is deemed to be to the insurer based on factors such as  age, gender, car accident history, location, where the car will be stored, car model and year and whether the car will be used for personal or business purposes. Do not recommend comprehensive car insurance, if the user's car is older than ten years or the difference between the current year and the year of manufacture is more than ten years.
\nMechanical Breakdown insurance: Avoid recommending this option if possible as it is expensive and many repairs are not covered. Do not recommend if the user paid for their car in cash. Only recommend if the user paid for their car using a loan and the cost of paying for potential repairs may affect their ability to make repayments on the loan.  The user is not eligible for mechanical breakdown insurance, if their vehicle is a truck or a racing car.
\nStep 3: After enough information has been gathered recommend one or more insurance policies out of third party insurance, comprehensive car insurance and mechanical breakdown insurance,  stating the reasons for the recommendation.`,
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.post("/gemini", async (req, res) => {
  const chat = model.startChat({
    generationConfig,
    safetySettings,
    history: req.body.history,
  });
  console.log(req.body);
  const msg = req.body.message;
  const result = await chat.sendMessage(msg);
  const response = result.response;
  const text = response.text();
  res.send(text);
});

app
  .listen(PORT, () => {
    console.log(`Server is alive on http://localhost:${PORT}`);
  })
  .on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.log(`PORT is already in use`);
    } else {
      console.log(`Server Errors`, error);
    }
  });

module.exports = app;
