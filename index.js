// app.js
const express = require("express");
const morgan = require("morgan");
const path = require("path");
const _ = require("lodash");

const app = express();
const PORT = process.env.PORT || 3000;

// Cargar palabras desde archivo
const words = require("./data/words.json");

// Middleware
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));

// Endpoints

// Iteración 1
app.get('/api/v1/words', (req, res) => {
  const { length } = req.query;

  let wordList = words;

  if (length) {
    const lengthInt = parseInt(length);
    wordList = _.filter(words, (word) => word.length === lengthInt);
  }

  if (wordList.length === 0) {
    return res.status(404).end('Not Found');
  }

  const randomWord = _.sample(wordList);

  res.status(200).json({
    word: randomWord
  });
});

// Iteración 2


// Iteración 3

// Iteración 4


// 404 para rutas no existentes
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
