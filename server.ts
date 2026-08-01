import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper for lazy Gemini AI init
function getGenAI(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({ apiKey: key });
}

// 1. Generate Newspaper Headline & Coach Evaluation after match
app.post('/api/ai/match-report', async (req, res) => {
  try {
    const {
      playerName,
      nationality,
      currentClub,
      matchType, // 'league' | 'cup' | 'national' | 'tournament'
      opponentName,
      goalsScored,
      assists,
      rating,
      result, // 'win' | 'draw' | 'loss'
      scoreLine
    } = req.body;

    const ai = getGenAI();
    if (!ai) {
      // High-quality Turkish fallback report if no API key
      const headline = goalsScored >= 2
        ? `${playerName.toUpperCase()} SAHADA DEVLEŞTİ! ${currentClub} ${opponentName}'İ ${scoreLine} İLE GEÇTİ!`
        : (result === 'win'
          ? `${currentClub}'DA YÜZLER GÜLÜYOR: ${playerName}'DEN KRİTİK KATKI!`
          : `${opponentName} KARŞISINDA ZORLU MÜCADELE: ${playerName} SAVAŞTI!`);

      const coachComment = goalsScored > 0
        ? `"${playerName} bugün taktiksel disiplinimize tam uydu. Şut ve frikik teknikleri harikaydı, onunla gurur duyuyoruz."`
        : `"Zor bir maçtı ancak ${playerName}'in sahadaki çabası ve pas dağıtımı gelecek maçlar için umut veriyor."`;

      const pressBody = `${nationality} asıllı genç yıldız ${playerName}, ${matchType === 'national' ? 'Milli Takım' : currentClub} formasıyla ${opponentName} karşısında sahadaydı. ${rating}/10 maç puanıyla oynayan oyuncu, taraftarlardan büyük alkış aldı.`;

      return res.json({
        headline,
        coachComment,
        pressBody,
        fanSentiment: rating >= 8 ? 'COŞKULU' : (rating >= 6 ? 'MEMNUN' : 'ELEŞTİREL')
      });
    }

    const prompt = `Sen Türkiye'de ve Avrupa'da ses getiren usta bir spor gazetecisi ve deneyimli teknik direktörsün.
Aşağıdaki futbol maçı performansına dayanarak, Türkçe olarak JSON formatında çarpıcı bir spor gazetesi manşeti (headline), teknik direktörün oyuncu hakkındaki değerlendirmesi (coachComment), haber metni (pressBody) ve taraftar coşkusu durumu ('COŞKULU' | 'MEMNUN' | 'ELEŞTİREL') üret:

Oyuncu Adı: ${playerName}
Ülke / Milli Takım: ${nationality}
Takım: ${currentClub}
Maç Türü: ${matchType}
Rakip: ${opponentName}
Skor: ${scoreLine}
Oyuncunun Attığı Gol: ${goalsScored}
Asist: ${assists}
Maç Puanı: ${rating} / 10
Sonuç: ${result}

Lütfen sadece şu JSON formatında dön (başka açıklama yazma):
{
  "headline": "büyük harflerle çarpıcı spor gazetesi manşeti",
  "coachComment": "Teknik direktörün tırnak içinde yorumu",
  "pressBody": "2-3 cümlelik heyecanlı maç özeti haberi",
  "fanSentiment": "COŞKULU"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text;
    const parsed = JSON.parse(text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.warn('AI match report quota/fallback used:', error?.message || error);
    const isGoal = req.body.goalsScored > 0 || req.body.result === 'win';
    return res.status(200).json({
      headline: isGoal
        ? `${req.body.playerName?.toUpperCase() || 'YILDIZ'} SAHADA ŞOV YAPTI! ${req.body.currentClub || 'TAKIM'} ZAFERE UÇTU!`
        : `${req.body.opponentName || 'RAKİP'} KARŞISINDA KIYASIYA MÜCADELE: ${req.body.playerName || 'YILDIZ'} PES ETMEDİ!`,
      coachComment: isGoal
        ? `"${req.body.playerName} bugün sahadaki klası ve kritik anlardaki soğukkanlılığıyla maça damga vurdu. Şut ve pas tercihleri muazzamdı."`
        : `"${req.body.playerName} çok çabaladı, rakip savunmayı yıprattı. Önümüzdeki maçlarda onun golleriyle kazanacağız."`,
      pressBody: `${req.body.nationality || 'Türk'} yıldız ${req.body.playerName}, ${req.body.matchType === 'national' ? 'Milli Takım' : req.body.currentClub} formasıyla sergilediği performansla tribünleri ayakta alkışlattı. ${req.body.rating || 8}/10 reyting aldı.`,
      fanSentiment: isGoal ? "COŞKULU" : "MEMNUN"
    });
  }
});

// 2. Generate Transfer Rumors and Scout Report
app.post('/api/ai/transfer-rumor', async (req, res) => {
  try {
    const { playerName, nationality, currentClub, marketValue, position, goals, assists } = req.body;
    const ai = getGenAI();

    if (!ai) {
      return res.json({
        rumorHeadline: `${playerName} İÇİN AVRUPA DEVLERİ SIRAYA GİRDİ!`,
        scoutReport: `${position} mevkiinde oynayan ${nationality} yıldız için İspanya ve İngiltere kulüpleri scout ekibi gönderdi. Güncel piyasa değeri ${marketValue} € seviyesinde.`,
        interestedLeague: "Premier League / La Liga"
      });
    }

    const prompt = `Sen küresel transfer pazarına hakim bir futbol yorumcusu ve scout liderisin.
Aşağıdaki oyuncunun kariyer verilerine bakarak Türkçe JSON formatında heyecan verici bir transfer söylentisi üret:

Oyuncu: ${playerName}
Mevki: ${position}
Ülke: ${nationality}
Mevcut Takım: ${currentClub}
Piyasa Değeri: ${marketValue}
Kariyer Gol/Asist: ${goals} Gol, ${assists} Asist

JSON formatı:
{
  "rumorHeadline": "Çarpıcı haber başlığı",
  "scoutReport": "Scout ekibinin oyuncu hakkındaki analiz notu",
  "interestedLeague": "Hangi ligden kulüplerin takip ettiği bilgisi"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    return res.json(JSON.parse(response.text || '{}'));
  } catch (error: any) {
    console.warn('AI transfer rumor quota/fallback used:', error?.message || error);
    return res.status(200).json({
      rumorHeadline: `${req.body.playerName || 'GENÇ YILDIZ'} İÇİN DEVLER LEAGUE ŞAMPİYONLARI SIRADA!`,
      scoutReport: "Sahadaki liderliği, pas isabeti ve kritik şut gücü Avrupa'nın önde gelen scout ekipleri tarafından yakından takip ediliyor.",
      interestedLeague: "Premier League & La Liga Devleri"
    });
  }
});

// API health endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'SCC STR Futbol Kariyer & Maç Simülasyonu' });
});

// Vite middleware setup
async function startServer() {
  try {
    if (process.env.NODE_ENV !== 'production') {
      const vite = await createViteServer({
        server: {
          middlewareMode: true,
          hmr: process.env.DISABLE_HMR === 'true' ? false : undefined,
        },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`SCC STR Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
  }
}

startServer();
