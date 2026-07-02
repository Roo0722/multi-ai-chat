import React, { useState } from 'react';
import { Wand2, Share2, AlertCircle, Loader, ImageOff, Trash2 } from 'lucide-react';
import { Share } from '@capacitor/share';
import { generateImage } from './api.js';

export default function ImageTab({ imageState, setImageState }) {
  const { prompt, imageUrl, error } = imageState;
  const [loading, setLoading] = useState(false);

  function setPrompt(val) { setImageState((s) => ({ ...s, prompt: val })); }
  function setImageUrl(val) { setImageState((s) => ({ ...s, imageUrl: val })); }
  function setError(val) { setImageState((s) => ({ ...s, error: val })); }
  function handleClear() { setImageState({ prompt: '', imageUrl: '', error: '' }); }

  async function handleGenerate() {
    if (!prompt.trim() || loading) return;
    setError('');
    setImageUrl('');
    setLoading(true);
    try {
      const url = await generateImage(prompt);
      setImageUrl(url);
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
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
            disabled={!prompt.trim() || loading}
          >
            {loading
              ? <><Loader size={16} strokeWidth={2} className="spin" /> Generating...</>
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

      {loading && !imageUrl && (
        <div className="image-placeholder">
          <Loader size={32} strokeWidth={1.5} className="spin" style={{ color: '#4f8cff' }} />
          <p>Generating your image with Flux...</p>
          <p className="note">This usually takes 5 to 15 seconds.</p>
        </div>
      )}

      {imageUrl && !loading && (
        <div className="image-result">
          <img
            src={imageUrl}
            alt={prompt}
            className="generated-image"
            onError={() => setError('Image failed to load. Try generating again.')}
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
