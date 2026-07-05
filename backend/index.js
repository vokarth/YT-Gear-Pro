const express = require('express');
const cors = require('cors');
const ytDlp = require('yt-dlp-exec');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.post('/api/info', async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    console.log(`Fetching info for: ${url}`);
    const output = await ytDlp(url, {
      dumpJson: true,
      noWarnings: true,
      noCallHome: true,
      noCheckCertificates: true,
    });
    
    // Extract available resolutions and calculate sizes
    const audioFormats = output.formats.filter(f => f.vcodec === 'none' && f.acodec !== 'none');
    const bestAudio = audioFormats.length > 0 ? audioFormats[audioFormats.length - 1] : null;
    const audioSize = bestAudio ? (bestAudio.filesize || bestAudio.filesize_approx || 0) : 0;

    const getFormatSize = (height) => {
      const f = output.formats.filter(f => f.height === height && f.vcodec !== 'none').pop();
      if (f && (f.filesize || f.filesize_approx)) {
        const totalSize = (f.filesize || f.filesize_approx) + audioSize;
        return (totalSize / (1024 * 1024)).toFixed(1) + ' MB';
      }
      return 'Bilinmiyor';
    };

    const heights = [...new Set(output.formats.map(f => f.height).filter(h => h))].sort((a, b) => b - a);
    
    const availableQualities = [];
    if (heights.some(h => h >= 1080)) availableQualities.push({ label: '1080p', size: getFormatSize(1080) });
    if (heights.some(h => h >= 720)) availableQualities.push({ label: '720p', size: getFormatSize(720) });
    if (heights.some(h => h >= 480)) availableQualities.push({ label: '480p', size: getFormatSize(480) });
    if (heights.some(h => h >= 360)) availableQualities.push({ label: '360p', size: getFormatSize(360) });
    availableQualities.push({ label: '144p', size: getFormatSize(144) });
    
    availableQualities.push({ 
        label: 'Audio (MP3)', 
        size: audioSize ? (audioSize / (1024 * 1024)).toFixed(1) + ' MB' : 'Bilinmiyor' 
    });

    res.json({
      title: output.title,
      thumbnail: output.thumbnail,
      duration: output.duration,
      channel: output.channel,
      view_count: output.view_count,
      like_count: output.like_count,
      upload_date: output.upload_date,
      description: output.description,
      video_id: output.id,
      qualities: availableQualities
    });

  } catch (error) {
    console.error('Error fetching info:', error);
    // Hatanın tam ne olduğunu görmek için gerçek mesajı gönderiyoruz
    res.status(500).json({ error: 'DETAYLI HATA: ' + (error.message || 'Bilinmeyen Hata') });
  }
});

app.get('/api/download', async (req, res) => {
  const { url, quality } = req.query;
  
  if (!url) {
    return res.status(400).send('URL is required');
  }

  try {
    console.log(`Downloading ${url} at ${quality}`);
    
    let formatStr = 'best';
    let ext = 'mp4';

    if (quality === '1080p') formatStr = 'bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[height<=1080]';
    else if (quality === '720p') formatStr = 'bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720]';
    else if (quality === '480p') formatStr = 'bestvideo[height<=480][ext=mp4]+bestaudio[ext=m4a]/best[height<=480]';
    else if (quality === '360p') formatStr = 'bestvideo[height<=360][ext=mp4]+bestaudio[ext=m4a]/best[height<=360]';
    else if (quality === '144p') formatStr = 'bestvideo[height<=144][ext=mp4]+bestaudio[ext=m4a]/best[height<=144]';
    else if (quality === 'Audio (MP3)') {
        formatStr = 'bestaudio';
        ext = 'mp3';
    }

    res.header('Content-Disposition', `attachment; filename="video.${ext}"`);
    
    const args = [
        url,
        '-f', formatStr,
        '-o', '-', // Output to stdout
    ];

    if (quality === 'Audio (MP3)') {
        args.push('--extract-audio', '--audio-format', 'mp3');
    } else {
        // use merge output format just in case
        args.push('--merge-output-format', 'mp4');
    }

    const subprocess = ytDlp.exec(args);

    subprocess.stdout.pipe(res);

    subprocess.stderr.on('data', (data) => {
      // console.log(`yt-dlp stderr: ${data}`); // can be noisy
    });

    subprocess.on('close', (code) => {
        console.log(`Download finished with code ${code}`);
    })

  } catch (error) {
    console.error('Download failed:', error);
    if (!res.headersSent) {
        res.status(500).send('Download failed');
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
