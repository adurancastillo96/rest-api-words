// app.js
const express = require("express");
const morgan = require("morgan");
const path = require("path");
const _ = require("lodash");
const fs = require("fs").promises;

const app = express();
const PORT = process.env.PORT || 3000;

// Cargar palabras desde archivo
const words = require("./data/words.json");

// Definimos idiomas soportados
const LANGUAGES = ["en", "es", "it", "fr", "de", "hi", "hi-la", "gu", "zh", "pt-br"];

// Middleware
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));

// Endpoints

// Iteración 1 y 2
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

// Iteración 3
app.get('/api/v2/languages', (req, res) => {
  res.status(200).json({
    languages: LANGUAGES
  });
});

// Iteración 4 + Bonus: Proxy a API externa con Persistencia de Datos
app.get('/api/v2/words', async (req, res) => {
  const { length, lang } = req.query;
  const wordLength = Number(length) || 5;
  const language = lang || "es";

  if (!LANGUAGES.includes(language)) {
    return res.status(400).end('Idioma no soportado" ');
  }

  // const apiUrl = `https://random-words-api.kushcreates.com/api?language=${language}&length=${wordLength}&words=1`;
  const apiUrl = new URL('https://random-words-api.kushcreates.com/api');
  apiUrl.searchParams.append('words', '1');
  if (language) apiUrl.searchParams.append('language', language);
  if (length) apiUrl.searchParams.append('length', wordLength.toString());

  try {
    const response = await fetch(apiUrl.toString());

    if (!response.ok) {
      res.status(404).end('Error en la API externa');
      return;
    }

    const data = await response.json();

    // Verificación y respuesta
    if (Array.isArray(data) && data.length > 0) {
      const receivedWord = data[0].word;

      // --- PERSISTENCIA
      const wordExists = words.some(w => w.toLowerCase() === receivedWord.toLowerCase());
      if (!wordExists) {
        words.push(receivedWord);
        console.log(`¡Palabra nueva detectada! Guardando: ${receivedWord}`);
        const filePath = path.join(__dirname, 'data', 'words.json');
        await fs.writeFile(filePath, JSON.stringify(words, null, 2), 'utf-8');
      }
      // ---

      res.status(200).json({ word: receivedWord });
    } else {
      res.status(404).end('No se encontró palabra');
    }
  } catch (error) {
    res.status(500).end('Error al obtener la palabra externa');
  }
});

// Bonus 2: Obtener todas las palabras
app.get('/api/v1/words/all', (req, res) => {
  res.status(200).json({
    words: words,
    total: words.length
  });
});

// 404 para rutas no existentes
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
