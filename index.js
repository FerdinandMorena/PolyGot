import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_AI_API_KEY,
  baseURL: import.meta.env.VITE_AI_API_URL,
  dangerouslyAllowBrowser: true,
});

const headingOne = document.getElementById("text-to-translate");
const headingTwo = document.getElementById("select-lang");
const inputText = document.getElementById("your-text");

const form = document.getElementById("form");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const button = form.querySelector("button");

  if (button.textContent === "Start Over") {
    inputText.value = "";
    const resultsDiv = document.querySelector(".results");
    const radioContainer = document.getElementById("radio-container");

    resultsDiv.style.display = "none";
    resultsDiv.textContent = "";
    radioContainer.style.display = "block";

    button.disabled = false;
    button.textContent = "Translate";
    return;
  }

  button.disabled = true;
  button.textContent = "Translating...";

  const data = new FormData(form);
  const textToTranslate = data.get("your-text");
  const selectedLanguage = data.get("language");

  if (!textToTranslate.trim()) {
    alert("Please enter text to translate");
    button.disabled = false;
    button.textContent = "Translate";
    return;
  }
  console.log(textToTranslate, selectedLanguage);

  const messages = [
    {
      role: "system",
      content: `
You are an expert multilingual translator and language specialist.

Your task is to accurately translate text into the requested language while preserving:
- Meaning
- Tone
- Context
- Cultural nuances

Rules:
- Return only the translated text.
- Do not add explanations, notes, or commentary.
- Maintain formatting, punctuation, and paragraph structure.
- If the input contains names, brands, or technical terms that should not be translated, preserve them appropriately.
- Ensure the translation sounds natural and fluent to native speakers.
    `,
    },
  ];

  const prompt = `Translate the following text to ${selectedLanguage}: ${textToTranslate}`;
  const userMessage = {
    role: "user",
    content: prompt,
  };

  messages.push(userMessage);
  try {
    console.log("Contacting AI...");
    const response = await openai.chat.completions.create({
      model: import.meta.env.VITE_AI_MODEL,
      messages: messages,
      temperature: 0.3,
    });
    console.log("done");

    const translation = response.choices[0].message.content;
    console.log(`${textToTranslate} in ${selectedLanguage} is: ${translation}`);

    const resultsDiv = document.querySelector(".results");
    const radioContainer = document.getElementById("radio-container");

    resultsDiv.textContent = translation;
    resultsDiv.style.display = "block";
    radioContainer.style.display = "none";

    // Reset button after success
    button.disabled = false;
    button.textContent = "Start Over";
  } catch (error) {
    console.error("Error during translation:", error);
    button.disabled = false;
    button.textContent = "Translate";
  }
});
