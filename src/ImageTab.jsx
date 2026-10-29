import React, { useState, useEffect } from 'react';
import { Wand2, Share2, AlertCircle, Loader, ImageOff, Trash2 } from 'lucide-react';
import { Share } from '@capacitor/share';
import { generateImage, getImageCooldownLeft } from './api.js';

export default function ImageTab({ imageState, setImageState }) {
  const { prompt, imageUrl, error } = imageState;
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(getImageCooldownLeft());

  // Free Pollinations tier allows ~1 image per 45s: tick the countdown while it runs.
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown(getImageCooldownLeft()), 500);
    return () => clearInterval(t);
  }, [cooldown > 0]);

  function setPrompt(val) { setImageState((s) => ({ ...s, prompt: val })); }
  function setImageUrl(val) { setImageState((s) => ({ ...s, imageUrl: val })); }
  function setError(val) { setImageState((s) => ({ ...s, error: val })); }
  function handleClear() { setImageState({ prompt: '', imageUrl: '', error: '' }); }

  // Safety net: stop the spinner if the image never loads.
  useEffect(() => {
    if (!loading) return;
    const t = setTimeout(() => {
      setLoading(false);
      setImageState((s) => ({ ...s, imageUrl: '', error: 'Image timed out. Try again.' }));
    }, 90000);
    return () => clearTimeout(t);
  }, [loading, setImageState]);

  function handleGenerate() {
    if (!prompt.trim() || loading || getImageCooldownLeft() > 0) return;
    setError('');
    setImageUrl('');
    setLoading(true);
    // The <img> below loads the URL; loading stays true until its onLoad/onError fires.
    setImageUrl(generateImage(prompt));
    setCooldown(getImageCooldownLeft());
  }

  async function handleShare() {
    if (!imageUrl) return;
    try {
      await Share.share({
        title: 'Nexus Generated Image',
        text: `AI image: ${prompt}`,
        url: imageUrl,
        dialogTitle: 'Share or save image'
      });
    } catch (e) {
      if (e && e.message && !e.message.toLowerCase().includes('cancel')) {
        setError('Share failed: ' + e.message);
      }
    }
  }

  return (
    <div className="image-tab">
      <div className="image-prompt-area">
        <textarea
          className="image-prompt-input"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the image you want to generate..."
          rows={3}
          disabled={loading}
        />
        <div className="image-btn-row">
          <button
            className="generate-btn"
            onClick={handleGenerate}
            disabled={!prompt.trim() || loading || cooldown > 0}
          >
            {loading
              ? <><Loader size={16} strokeWidth={2} className="spin" /> Generating...</>
              : cooldown > 0
                ? <>Wait {Math.ceil(cooldown / 1000)}s</>
                : <><Wand2 size={16} strokeWidth={2} /> Generate</>}
          </button>
          {(imageUrl || prompt || error) && (
            <button className="clear-btn" onClick={handleClear} disabled={loading}>
              <Trash2 size={15} strokeWidth={2} />
              Clear
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="error-row" style={{ marginTop: 12 }}>
          <AlertCircle size={16} strokeWidth={2} />
          <span>{error}</span>
        </div>
      )}

      {loading && (
        <div className="image-placeholder">
          <Loader size={32} strokeWidth={1.5} className="spin" style={{ color: '#4f8cff' }} />
          <p>Generating your image with Flux...</p>
          <p className="note">This usually takes 5 to 15 seconds.</p>
        </div>
      )}

      {imageUrl && (
        <div className="image-result" style={loading ? { display: 'none' } : undefined}>
          <img
            src={imageUrl}
            alt={prompt}
            className="generated-image"
            onLoad={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setImageState((s) => ({ ...s, imageUrl: '', error: 'Image failed to load. The free service may be rate-limiting (about 1 image per 45s). Wait and try again.' }));
            }}
          />
          <div className="image-actions">
            <p className="image-prompt-label">"{prompt}"</p>
            <button className="msg-action-btn" onClick={handleShare}>
              <Share2 size={14} strokeWidth={2} />
              Share / Save
            </button>
          </div>
        </div>
      )}

      {!imageUrl && !loading && !error && (
        <div className="image-placeholder">
          <ImageOff size={32} strokeWidth={1.5} style={{ color: '#333', marginBottom: 8 }} />
          <p>Your generated image will appear here.</p>
          <p className="note">Powered by Pollinations.ai Flux -- free, no account needed.</p>
        </div>
      )}
    </div>
  );
}
