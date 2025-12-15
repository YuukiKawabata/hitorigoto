import { Soliloquy, Story } from '@/db/schema';
import { db } from '@/db/db';

export const generateStoryMock = async (): Promise<Story | null> => {
  try {
    // 1. Fetch recent soliloquies (Top 10 new ones)
    const soliloquies = db.getAllSync<Soliloquy>('SELECT * FROM soliloquies ORDER BY created_at DESC LIMIT 10');
    
    if (soliloquies.length === 0) return null;

    // 2. Create mock story content
    const dateStr = new Date().toLocaleDateString('ja-JP');
    const title = `${dateStr}の物語`;
    const content = `これはAIによって生成された物語のサンプルです。\n\nあなたの言葉:\n` + 
                    soliloquies.map(s => `・${s.content}`).join("\n") + 
                    `\n\nここから、AIが美しい物語を紡ぎ出します。（実装予定）`;
    
    // 3. Save to DB
    const period_start = soliloquies[soliloquies.length - 1].created_at;
    const period_end = soliloquies[0].created_at;
    const created_at = Date.now();

    const result = db.runSync(
      'INSERT INTO stories (title, content, period_start, period_end, created_at) VALUES (?, ?, ?, ?, ?)',
      title, content, period_start, period_end, created_at
    );
    
    return {
      id: result.lastInsertRowId,
      title,
      content,
      period_start,
      period_end,
      created_at
    };
  } catch (e) {
    console.error(e);
    return null;
  }
};
