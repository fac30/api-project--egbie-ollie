import fetch from "node-fetch"; // for HTTP requests
import express from "express"; // for HTTP requests
import path from "path";
import { fileURLToPath } from 'url';

// Workaround for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the "static" directory
app.use(express.static(path.join(__dirname, "static")));

// Route to handle requests for jokes
app.get("/joke", async (req, res) => {
  try {
    // Request to JokeAPI
    const response = await fetch("https://v2.jokeapi.dev/joke/Any?contains=pint");
    const data = await response.json();
    const joke = data.contents.jokes[0].joke.text;

    // Send the joke back as JSON
    res.json({ joke });
  } catch (error) {
    console.error("Error fetching joke:", error);
    res.status(500).json({ error: "Failed to fetch joke" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});