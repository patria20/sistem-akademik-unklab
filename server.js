
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";


dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: { timeout: 60000 },
    })
  : null;

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    geminiConfigured: Boolean(ai),
  });
});

app.post("/api/assistant", async (req, res) => {
  try {
    if (!ai) {
      return res.status(500).json({
        error: "API Key Gemini belum dikonfigurasi.",
      });
    }

    const { prompt, academicContext } = req.body;

    if (typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({
        error: "Pertanyaan tidak boleh kosong.",
      });
    }

    if (!academicContext || !academicContext.student) {
      return res.status(400).json({
        error: "Konteks akademik mahasiswa tidak tersedia.",
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: `
Kamu adalah AI Academic Assistant untuk SIAM-UNKLAB.

TUGAS:
Membantu mahasiswa memahami informasi akademik dan merencanakan studi berdasarkan data yang diberikan.

ATURAN WAJIB:
1. Jawab dalam bahasa Indonesia yang jelas, sopan, dan terstruktur.
2. Gunakan hanya data akademik dalam konteks yang diberikan.
3. Jangan mengarang nilai, mata kuliah, prasyarat, atau kebijakan UNKLAB.
4. Jika informasi tidak tersedia, nyatakan bahwa data tersebut belum tersedia.
5. Gunakan letterGrade dan isPassed untuk menjelaskan riwayat nilai.
6. Jika mahasiswa mengulang mata kuliah, gunakan percobaan terakhir berdasarkan tahun akademik dan semester untuk menjelaskan status terbarunya.
7. Jangan menyatakan mahasiswa memenuhi prasyarat jika data tidak membuktikannya.
8. Jangan menyatakan suatu mata kuliah dapat dikontrak hanya berdasarkan rekomendasi AI.
9. Batas SKS dan prasyarat harus mengikuti data serta validasi sistem.
10. Jangan mengubah data akademik mahasiswa.
11. Bedakan informasi faktual, rekomendasi, dan hal yang perlu dikonfirmasi.
12. Keputusan resmi tetap mengikuti aturan akademik UNKLAB.

FORMAT JAWABAN:
- Berikan jawaban langsung terhadap pertanyaan.
- Gunakan poin-poin jika menjelaskan beberapa hal.
- Hindari jawaban terlalu panjang.
- Jangan mengulang seluruh data mahasiswa jika tidak diperlukan.

DATA AKADEMIK MAHASISWA:
${JSON.stringify(academicContext)}

PERTANYAAN MAHASISWA:
${prompt}
      `,
      config: {
        temperature: 0.2,
        maxOutputTokens: 700,
      },
    });

    res.json({
      text: response.text || "Gemini belum menghasilkan jawaban.",
    });
  } catch (error) {
    console.error("Gemini error:", error);

    res.status(500).json({
      error: "Gemini gagal merespons. Silakan coba kembali.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend SIAM berjalan di http://localhost:${PORT}`);
});
