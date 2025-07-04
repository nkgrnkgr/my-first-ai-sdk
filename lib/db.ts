import path from "node:path";
import Database from "better-sqlite3";

const dbPath = path.join(process.cwd(), "audio_uploads.db");
const db = new Database(dbPath);

// 音声ファイルテーブルの初期化
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS audio_files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      mime_type TEXT NOT NULL,
      transcription TEXT,
      transcription_status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // 既存のテーブルに新しいカラムを追加（もし存在しない場合）
  try {
    db.exec('ALTER TABLE audio_files ADD COLUMN transcription TEXT');
  } catch (e) {
    // カラムが既に存在する場合は無視
  }
  
  try {
    db.exec('ALTER TABLE audio_files ADD COLUMN transcription_status TEXT DEFAULT "pending"');
  } catch (e) {
    // カラムが既に存在する場合は無視
  }
  
  console.log("データベーステーブルを初期化しました");
} catch (error) {
  console.error("データベース初期化エラー:", error);
}

export interface AudioFile {
  id: number;
  filename: string;
  original_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  transcription?: string;
  transcription_status: 'pending' | 'completed' | 'failed';
  created_at: string;
}

export const audioFileQueries = {
  insert: db.prepare(`
    INSERT INTO audio_files (filename, original_name, file_path, file_size, mime_type)
    VALUES (?, ?, ?, ?, ?)
  `),

  getById: db.prepare(`
    SELECT * FROM audio_files WHERE id = ?
  `),

  getAll: db.prepare(`
    SELECT * FROM audio_files ORDER BY created_at DESC
  `),

  updateTranscription: db.prepare(`
    UPDATE audio_files 
    SET transcription = ?, transcription_status = ?
    WHERE id = ?
  `),

  getTranscriptionById: db.prepare(`
    SELECT id, transcription, transcription_status, created_at 
    FROM audio_files 
    WHERE id = ?
  `),

  deleteById: db.prepare(`
    DELETE FROM audio_files WHERE id = ?
  `),
};

export default db;
