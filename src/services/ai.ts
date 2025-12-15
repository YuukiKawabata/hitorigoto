import { Soliloquy } from '@/db/schema';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { SQLiteDatabase } from 'expo-sqlite';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

export const generateStoryMock = async (db: SQLiteDatabase): Promise<boolean> => {
  try {
    console.log('[AI] generateStoryMock called');
    // 1. Fetch recent soliloquies (default: last 7 days)
    const days = 7;
    const now = Date.now();
    const pastDate = now - (days * 24 * 60 * 60 * 1000);

    const soliloquies = await db.getAllAsync<Soliloquy>(
      'SELECT * FROM soliloquies WHERE created_at >= ? ORDER BY created_at DESC',
      pastDate
    );
    console.log('[AI] Fetched soliloquies count:', soliloquies.length);

    if (soliloquies.length === 0) {
      console.log('[AI] No soliloquies found, returning false');
      return false;
    }

    // Calculate period
    // Since we fetched with DESC, the first item is the newest (end), last is oldest (start)
    const periodEnd = soliloquies[0].created_at;
    const periodStart = soliloquies[soliloquies.length - 1].created_at;

    // 2. Prepare the prompt
    const entriesText = soliloquies
      .reverse() // Oldest to newest for continuity
      .map(s => `- ${s.content} (${new Date(s.created_at).toLocaleDateString()} ${new Date(s.created_at).toLocaleTimeString()})`)
      .join('\n');

    const prompt = `
以下の「ひとりごと」の記録をもとに、ユーザーの心情や出来事を反映した、心温まる短い物語（ショートストーリー）を作成してください。
文体は小説風で、三人称視点、または「あなた」への語りかけでも構いません。
タイトルも付けてください。タイトルは一行目に書いてください。

--- ひとりごと記録 ---
${entriesText}
    `;

    console.log('[AI] Sending prompt to Gemini');
    // 3. Call Gemini API
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log('[AI] Received response from Gemini', text.substring(0, 50) + '...');

    // 4. Parse title and content
    // Assuming the first line is the title
    const lines = text.trim().split('\n');
    let title = lines[0].replace(/^#+\s*/, '').trim(); // Remove markdown headers if any
    let content = lines.slice(1).join('\n').trim();

    if (!content) {
      // Fallback if AI didn't separate title well
      content = title;
      title = '無題';
    }

    // 5. Save to database
    await db.runAsync(
      'INSERT INTO stories (title, content, period_start, period_end, created_at) VALUES (?, ?, ?, ?, ?)',
      title,
      content,
      periodStart,
      periodEnd,
      Date.now()
    );
    console.log('[AI] Saved story to database');

    return true;
  } catch (error) {
    console.error('AI Generation Error:', error);
    return false;
  }
};
