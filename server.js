import fetch from "node-fetch"; // for HTTP requests
import express from "express"; // for HTTP requests
import bodyParser from "body-parser";
import { fileURLToPath } from 'url';

// Workaround for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the "static" directory
app.use(bodyParser.urlencoded({extended: true }));
app.use(express.static("static"));
app.use(express.static("public"));

// Route to handle search submission
app.get("/search", async (req, res) => {
  const searchTerm = req.query.searchTerm; 
  console.log(`searchTerm: ${searchTerm}`)

  try {
    // Make a request to the JokeAPI with the search term
    const response = await fetch(`https://v2.jokeapi.dev/joke/Any?contains=${searchTerm}`);
    const data = await response.json();
    console.log(data); // Log response for debugging 

    // Check if response contains jokes
    if (!data.setup || !data.delivery) {
      throw new Error("Failed to fetch jokes");
    }

    // Send the jokes back to the client
    console.log({ setup: data.setup, delivery: data.delivery }); // Log before sending
    res.json({ type: data.type, setup: data.setup, delivery: data.delivery });
  } catch (error) {
    console.error("Error fetching jokes:", error);
    res.status(500).json({ error: "Failed to fetch jokes" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});