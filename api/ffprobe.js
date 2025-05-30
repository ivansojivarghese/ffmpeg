import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body || {};

  if (!url) {
    return res.status(400).json({ error: 'Missing YouTube URL' });
  }

  try {
    // Point to the local yt-dlp binary
    const ytDlpPath = path.join(process.cwd(), 'bin', 'yt-dlp');
    const pythonPath = process.env.PYTHON_BIN || 'python3';  // Use environment variable for Python path

    // Use `python3` as a prefix to the yt-dlp command to run it with Python
    const { stdout } = await execAsync(`${pythonPath} ${ytDlpPath} -F "${url}" --print-json`);
    const data = JSON.parse(stdout);

    const formats = data.formats.map(f => ({
      format_id: f.format_id,
      ext: f.ext,
      acodec: f.acodec,
      vcodec: f.vcodec,
      format_note: f.format_note,
      resolution: f.resolution,
    }));

    res.status(200).json({ title: data.title, formats });
  } catch (err) {
    res.status(500).json({
      error: 'Failed to fetch codec details',
      details: err.message,
    });
  }
}



/*
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Ensure that the body is parsed correctly and provide fallback if needed
  const { url } = req.body || {}; // Safely destructure body

  if (!url) {
    return res.status(400).json({ error: 'Missing YouTube URL' });
  }

  try {
    const { stdout } = await execAsync(`yt-dlp -F "${url}" --print-json`);
    const data = JSON.parse(stdout);

    const formats = data.formats.map(f => ({
      format_id: f.format_id,
      ext: f.ext,
      acodec: f.acodec,
      vcodec: f.vcodec,
      format_note: f.format_note,
      resolution: f.resolution,
    }));

    res.status(200).json({ title: data.title, formats });
  } catch (err) {
    res.status(500).json({
      error: 'Failed to fetch codec details',
      details: err.message,
    });
  }
}
*/

/*
import ytdl from 'ytdl-core';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body || {};

  if (!url) {
    return res.status(400).json({ error: 'Missing YouTube URL' });
  }

  try {
    // Fetch video info using ytdl-core
    const info = await ytdl.getInfo(url);

    // Extract relevant format details
    const formats = info.formats.map(f => ({
      format_id: f.itag,
      ext: f.extension,
      acodec: f.audioCodec,
      vcodec: f.videoCodec,
      format_note: f.formatNote,
      resolution: f.resolution,
    }));

    res.status(200).json({ title: info.title, formats });
  } catch (err) {
    res.status(500).json({
      error: 'Failed to fetch codec details',
      details: err.message,
    });
  }
}
*/