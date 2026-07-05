import { useState, useEffect } from 'react';
import { Search, MonitorPlay as YoutubeIcon, Loader2, Music, Video, Clock, Download, ThumbsUp, Calendar, Info, ChevronDown, ChevronUp, History, ClipboardPaste, ImageDown, Share2, Trash2, ShieldCheck, Zap, Globe, HelpCircle, ChevronRight, CheckCircle2, ShieldAlert } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [videoInfo, setVideoInfo] = useState(null);
  const [downloadingFormat, setDownloadingFormat] = useState(null);
  const [showDescription, setShowDescription] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('ytgear_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse history');
      }
    }
  }, []);

  const saveToHistory = (info) => {
    const newHistory = [info, ...history.filter(item => item.video_id !== info.video_id)].slice(0, 10);
    setHistory(newHistory);
    localStorage.setItem('ytgear_history', JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('ytgear_history');
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
    }
  };

  const downloadThumbnail = async () => {
    if (!videoInfo?.thumbnail) return;
    try {
      const response = await fetch(videoInfo.thumbnail);
      const blob = await response.blob();
      const objUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objUrl;
      a.download = `thumbnail_${videoInfo.video_id}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(objUrl);
    } catch (e) {
      console.error('Failed to download thumbnail', e);
    }
  };

  const shareVideo = async () => {
    if (navigator.share && url) {
      try {
        await navigator.share({
          title: videoInfo?.title || 'YouTube Video',
          url: url
        });
      } catch (err) {
        console.log('Share failed:', err);
      }
    } else {
      navigator.clipboard.writeText(url);
      alert('Link kopyalandı!');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr || dateStr.length !== 8) return '';
    return `${dateStr.substring(6,8)}.${dateStr.substring(4,6)}.${dateStr.substring(0,4)}`;
  };

  const handleSearch = async (e) => {
    if(e && e.preventDefault) e.preventDefault();
    if (!url) return;
    
    if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
      setError('Lütfen geçerli bir YouTube URL\'si girin.');
      return;
    }

    setLoading(true);
    setError('');
    setVideoInfo(null);

    try {
      const response = await axios.post(`${API_URL}/info`, { url });
      setVideoInfo(response.data);
      saveToHistory(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Video bilgileri alınırken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (quality) => {
    setDownloadingFormat(quality);
    
    const downloadUrl = `${API_URL}/download?url=${encodeURIComponent(url)}&quality=${encodeURIComponent(quality)}`;
    
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = true; 
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => {
      setDownloadingFormat(null);
    }, 3000);
  };

  return (
    <>
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>
      <div className="blob blob-3"></div>
      <div className="blob blob-4"></div>
      <div className="blob blob-5"></div>
      
      <div className="app-container-wide">
        <header className="header-left">
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
          >
            <h1>YTGear<span className="pro-badge">PRO</span></h1>
            <p>Gelişmiş YouTube İndirme ve Analiz İstasyonu</p>
          </motion.div>
        </header>

        <div className="dashboard-grid">
          {/* SOL KOLON */}
          <div className="dashboard-left">
            <form className="search-container-full" onSubmit={handleSearch}>
              <input 
                type="text" 
                className="search-input" 
                placeholder="YouTube linkini buraya yapıştırın..." 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={loading}
              />
              <button 
                type="button" 
                className="search-action-btn paste-btn"
                onClick={handlePaste}
                title="Panodan Yapıştır"
              >
                <ClipboardPaste size={20} />
              </button>
              <button type="submit" className="search-btn" disabled={loading || !url}>
                {loading ? <Loader2 className="spinner" size={20} /> : <Search size={20} />}
                <span>Analiz Et</span>
              </button>
            </form>

            <AnimatePresence>
              {error && (
                <motion.div 
                  className="error-message"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {!videoInfo && !loading && !error && (
              <motion.div 
                className="features-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="feature-card">
                  <div className="feature-icon"><Video size={28} /></div>
                  <h3>4K & 1080p Desteği</h3>
                  <p>Videoları en yüksek kalitede, kayıpsız olarak cihazınıza indirin.</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon"><Music size={28} /></div>
                  <h3>HQ MP3 Dönüştürücü</h3>
                  <p>Müzikleri ve podcastleri en yüksek bit hızında sese dönüştürün.</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon"><Zap size={28} /></div>
                  <h3>Ultra Hızlı İşlem</h3>
                  <p>Beklemek yok! Optimize edilmiş sunucularla videolar anında hazır.</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon"><ShieldCheck size={28} /></div>
                  <h3>%100 Güvenli</h3>
                  <p>Zararlı yazılım veya reklam yok. Tamamen temiz ve güvenli bir deneyim.</p>
                </div>
              </motion.div>
            )}

            {videoInfo && (
              <motion.div 
                className="video-card-extended"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <div className="video-player-section">
                  {videoInfo.video_id ? (
                    <iframe 
                      src={`https://www.youtube.com/embed/${videoInfo.video_id}?autoplay=1&mute=1`} 
                      title="YouTube video player" 
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                      className="video-iframe"
                    ></iframe>
                  ) : (
                    <div className="video-thumb-container-large">
                      <img src={videoInfo.thumbnail} alt={videoInfo.title} className="video-thumb" />
                      <div className="video-duration">
                        <Clock size={12} style={{ display: 'inline', marginRight: '4px' }} />
                        {Math.floor(videoInfo.duration / 60)}:{String(videoInfo.duration % 60).padStart(2, '0')}
                      </div>
                    </div>
                  )}
                </div>

                <div className="video-info-section">
                  <h2 className="video-title-large">{videoInfo.title}</h2>
                  
                  <div className="video-stats-row">
                    <div className="stat-badge highlight">
                      <YoutubeIcon size={16} />
                      <span>{videoInfo.channel || 'YouTube Video'}</span>
                    </div>
                    {videoInfo.view_count && (
                      <div className="stat-badge">
                        <Search size={16} />
                        <span>{videoInfo.view_count.toLocaleString()} izlenme</span>
                      </div>
                    )}
                    {videoInfo.like_count && (
                      <div className="stat-badge">
                        <ThumbsUp size={16} />
                        <span>{videoInfo.like_count.toLocaleString()} beğeni</span>
                      </div>
                    )}
                    {videoInfo.upload_date && (
                      <div className="stat-badge">
                        <Calendar size={16} />
                        <span>{formatDate(videoInfo.upload_date)}</span>
                      </div>
                    )}
                  </div>

                  <div className="advanced-actions">
                    <button className="action-badge" onClick={downloadThumbnail}>
                      <ImageDown size={16} />
                      <span>Kapak Fotoğrafını İndir</span>
                    </button>
                    <button className="action-badge" onClick={shareVideo}>
                      <Share2 size={16} />
                      <span>Paylaş</span>
                    </button>
                  </div>

                  {videoInfo.description && (
                    <div className="description-container">
                      <button 
                        className="description-toggle"
                        onClick={() => setShowDescription(!showDescription)}
                      >
                        <Info size={16} />
                        <span>Video Açıklamasını Oku</span>
                        {showDescription ? <ChevronUp size={16} style={{marginLeft: 'auto'}} /> : <ChevronDown size={16} style={{marginLeft: 'auto'}} />}
                      </button>
                      <AnimatePresence>
                        {showDescription && (
                          <motion.div 
                            className="description-content"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                          >
                            {videoInfo.description.split('\n').map((line, i) => (
                              <p key={i}>{line}</p>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* SAĞ KOLON */}
          <div className="dashboard-right">
            
            {videoInfo && (
              <motion.div 
                className="side-panel download-panel"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="panel-header">
                  <Download size={20} className="text-primary" />
                  <h3>İndirme Seçenekleri</h3>
                </div>
                <div className="format-list">
                  {videoInfo.qualities.map((qualityObj, index) => {
                    const quality = qualityObj.label;
                    const size = qualityObj.size;
                    const isAudio = quality.includes('Audio');
                    const isDownloading = downloadingFormat === quality;
                    
                    return (
                      <motion.button 
                        key={index}
                        className={`format-list-item ${isAudio ? 'audio-item' : 'video-item'}`}
                        whileHover={{ scale: 1.02, x: 5 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleDownload(quality)}
                        disabled={downloadingFormat !== null}
                      >
                        <div className="format-icon">
                          {isAudio ? <Music size={20} /> : <Video size={20} />}
                        </div>
                        <div className="format-details">
                          <span className="format-quality">{quality}</span>
                          <span className="format-size">{size}</span>
                        </div>
                        <div className="format-action">
                           {isDownloading ? <Loader2 className="spinner" size={20} color="var(--primary)" /> : <Download size={20} />}
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {!videoInfo && (
              <motion.div 
                className="side-panel info-panel"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="panel-header">
                  <Globe size={20} className="text-primary" />
                  <h3>Platform Bilgisi</h3>
                </div>
                <div className="panel-content text-sm text-muted">
                  <p>YTGear Pro, dünyanın en gelişmiş video indirme algoritmalarını kullanır.</p>
                  <ul className="info-list">
                    <li><ShieldCheck size={14}/> Uçtan uca şifreli veri aktarımı</li>
                    <li><Zap size={14}/> Sınırlandırılmamış indirme hızı</li>
                    <li><YoutubeIcon size={14}/> Tüm platformlarla tam uyumluluk</li>
                  </ul>
                </div>
              </motion.div>
            )}

            {history.length > 0 && (
              <motion.div 
                className="side-panel history-panel"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="panel-header">
                  <History size={20} className="text-primary" />
                  <h3>Son İndirilenler</h3>
                  <button className="clear-btn" onClick={clearHistory} title="Geçmişi Temizle">
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="history-list">
                  {history.map((item, idx) => (
                    <div key={idx} className="history-list-item" onClick={() => { setUrl(`https://youtube.com/watch?v=${item.video_id}`); handleSearch(); }}>
                      <img src={item.thumbnail} alt={item.title} />
                      <div className="history-item-info">
                        <h4>{item.title}</h4>
                        <span>{item.channel}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

          </div>
        </div>

        {/* EK İÇERİKLER (NASIL ÇALIŞIR & SSS) */}
        {!videoInfo && (
          <motion.div 
            className="marketing-sections"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="how-it-works">
              <h2 className="section-title">Nasıl Çalışır?</h2>
              <div className="steps-container">
                <div className="step-card">
                  <div className="step-number">1</div>
                  <h4>Link Kopyala</h4>
                  <p>YouTube'dan indirmek istediğiniz videonun linkini kopyalayın.</p>
                </div>
                <div className="step-arrow"><ChevronRight size={24} /></div>
                <div className="step-card">
                  <div className="step-number">2</div>
                  <h4>Yapıştır & Analiz Et</h4>
                  <p>Linki yukarıdaki arama kutusuna yapıştırıp Analiz butonuna tıklayın.</p>
                </div>
                <div className="step-arrow"><ChevronRight size={24} /></div>
                <div className="step-card">
                  <div className="step-number">3</div>
                  <h4>Format Seç & İndir</h4>
                  <p>İstediğiniz kaliteyi (Video/Ses) seçin ve indirmeyi başlatın.</p>
                </div>
              </div>
            </div>

            <div className="faq-section">
              <h2 className="section-title">Sıkça Sorulan Sorular</h2>
              <div className="faq-grid">
                <div className="faq-item">
                  <h4><HelpCircle size={18} className="text-primary"/> Tamamen ücretsiz mi?</h4>
                  <p>Evet, YTGear Pro kullanımı tamamen ücretsizdir ve herhangi bir sınırlama yoktur.</p>
                </div>
                <div className="faq-item">
                  <h4><ShieldAlert size={18} className="text-primary"/> İndirdiğim dosyalar güvenli mi?</h4>
                  <p>Kesinlikle. Dosyalar orijinal YouTube sunucularından doğrudan ve şifreli olarak çekilir.</p>
                </div>
                <div className="faq-item">
                  <h4><CheckCircle2 size={18} className="text-primary"/> Hangi cihazlarda çalışır?</h4>
                  <p>PC, Mac, iOS ve Android dahil olmak üzere tüm modern tarayıcılara sahip cihazlarda çalışır.</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

      </div>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <h2>YTGear<span>PRO</span></h2>
            <p>Yeni nesil video indirme platformu.</p>
          </div>
          <div className="footer-links">
            <a href="#">Hakkımızda</a>
            <a href="#">Gizlilik Politikası</a>
            <a href="#">Kullanım Koşulları</a>
            <a href="#">İletişim</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} YTGear Pro. Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </>
  );
}

export default App;
