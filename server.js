import express from "express";
import puppeteer from "puppeteer";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/api/ewg", async (req, res) => {
  const zip = req.query.zip;

  if (!zip) {
    return res.status(400).json({ error: "ZIP requerido" });
  }

  try {
    const browser = await puppeteer.launch({
      headless: "new",
      executablePath: "/usr/bin/google-chrome",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--disable-features=IsolateOrigins",
        "--disable-site-isolation-trials"
      ]
    });

    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36"
    );

    const url = `https://www.ewg.org/tapwater/ajax/search-contaminants.php?zip=${zip}`;

    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 60000
    });

    const text = await page.evaluate(() => document.body.innerText);

    await browser.close();

    const data = JSON.parse(text);

    res.json({
      zip,
      contaminantes: data.contaminants || []
    });

  } catch (err) {
    res.status(500).json({
      error: "Error al consultar EWG con Puppeteer",
      detalle: err.toString()
    });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor Puppeteer corriendo en puerto ${PORT}`);
});
