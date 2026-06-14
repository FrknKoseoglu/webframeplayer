'use client';

import { useState } from 'react';
import { Sparkles, ArrowLeft, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlayerStore } from '@/store/usePlayerStore';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function MagicCodeCreatorPage() {
  const { language } = usePlayerStore();
  const [linkType, setLinkType] = useState<'m3u' | 'xtream'>('m3u');
  const [m3uUrl, setM3uUrl] = useState('');
  const [xtreamHost, setXtreamHost] = useState('');
  const [xtreamUser, setXtreamUser] = useState('');
  const [xtreamPassword, setXtreamPassword] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [supportUrl, setSupportUrl] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);

  const generateLink = () => {
    // Helper function for UTF-8 safe Base64 encoding
    const utf8ToBase64 = (str: string) => {
      return btoa(unescape(encodeURIComponent(str)));
    };
    
    // Build data object
    const data: Record<string, string> = {};
    
    if (linkType === 'm3u') {
      if (!m3uUrl) return;
      data.importUrl = m3uUrl;
    } else {
      if (!xtreamHost || !xtreamUser || !xtreamPassword) return;
      data.importXtream = '1';
      data.host = xtreamHost;
      data.user = xtreamUser;
      data.password = xtreamPassword;
    }
    
    if (serviceName) {
      data.serviceName = serviceName;
    }
    
    if (customMessage) {
      data.message = utf8ToBase64(customMessage);
    }
    
    if (supportUrl) {
      data.supportUrl = supportUrl;
    }
    
    if (logoUrl) {
      data.logoUrl = logoUrl;
    }
    
    const jsonData = JSON.stringify(data);
    const encoded = utf8ToBase64(jsonData);
    const code = `frame-${encoded}`;
    
    setGeneratedLink(code);
  };

  const copyToClipboard = async () => {
    if (generatedLink) {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--frame-background)] text-white">
      {/* Ambient Background Effect */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[var(--frame-primary)]/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-white/60 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                Magic Code
              </h1>
              <p className="text-white/50 text-sm">
                {language === 'tr' ? 'Kullanıcılarınızla paylaşmak için Magic Code oluşturun' : 'Create Magic Codes to share with your users'}
              </p>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-[var(--frame-surface)]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8">
          {/* Link Type Selector */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setLinkType('m3u')}
              className={cn(
                'flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all',
                linkType === 'm3u'
                  ? 'bg-[var(--frame-primary)] text-white shadow-lg shadow-[var(--frame-primary)]/20'
                  : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
              )}
            >
              M3U Playlist
            </button>
            <button
              onClick={() => setLinkType('xtream')}
              className={cn(
                'flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all',
                linkType === 'xtream'
                  ? 'bg-[var(--frame-primary)] text-white shadow-lg shadow-[var(--frame-primary)]/20'
                  : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
              )}
            >
              Xtream Codes
            </button>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {linkType === 'm3u' ? (
              <div>
                <label className="text-sm text-white/70 mb-2 block font-medium">
                  {language === 'tr' ? 'M3U Playlist URL' : 'M3U Playlist URL'}
                </label>
                <input
                  type="url"
                  value={m3uUrl}
                  onChange={(e) => setM3uUrl(e.target.value)}
                  placeholder="https://example.com/playlist.m3u"
                  className="w-full px-4 py-3 rounded-xl bg-[var(--frame-input-bg)] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[var(--frame-primary)] transition-colors"
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="text-sm text-white/70 mb-2 block font-medium">
                    {language === 'tr' ? 'Sunucu Adresi' : 'Server Host'}
                  </label>
                  <input
                    type="url"
                    value={xtreamHost}
                    onChange={(e) => setXtreamHost(e.target.value)}
                    placeholder="http://server.com:8080"
                    className="w-full px-4 py-3 rounded-xl bg-[var(--frame-input-bg)] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[var(--frame-primary)] transition-colors"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-white/70 mb-2 block font-medium">
                      {language === 'tr' ? 'Kullanıcı Adı' : 'Username'}
                    </label>
                    <input
                      type="text"
                      value={xtreamUser}
                      onChange={(e) => setXtreamUser(e.target.value)}
                      placeholder="username"
                      className="w-full px-4 py-3 rounded-xl bg-[var(--frame-input-bg)] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[var(--frame-primary)] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-white/70 mb-2 block font-medium">
                      {language === 'tr' ? 'Şifre' : 'Password'}
                    </label>
                    <input
                      type="text"
                      value={xtreamPassword}
                      onChange={(e) => setXtreamPassword(e.target.value)}
                      placeholder="password"
                      className="w-full px-4 py-3 rounded-xl bg-[var(--frame-input-bg)] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[var(--frame-primary)] transition-colors"
                    />
                  </div>
                </div>
              </>
            )}
            
            <div className="pt-4 border-t border-white/5">
              <label className="text-sm text-white/70 mb-2 block font-medium">
                {language === 'tr' ? 'Hizmet Adı (Opsiyonel)' : 'Service Name (Optional)'}
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-white/40 select-none">Frame - </span>
                <input
                  type="text"
                  value={serviceName.replace(/^Frame - /, '')}
                  onChange={(e) => setServiceName(`Frame - ${e.target.value}`)}
                  placeholder={language === 'tr' ? 'Yayın' : 'Yayın'}
                  className="w-full pl-[4.5rem] pr-4 py-3 rounded-xl bg-[var(--frame-input-bg)] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[var(--frame-primary)] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={generateLink}
            className="w-full mt-6 bg-[var(--frame-primary)] hover:bg-[var(--frame-primary-dark)] text-white font-bold text-lg py-6 rounded-xl shadow-lg shadow-[var(--frame-primary)]/20"
          >
            {language === 'tr' ? 'Magic Code Oluştur' : 'Generate Magic Code'}
          </Button>

          {/* Generated Link */}
          {generatedLink && (
            <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-white/70 font-medium">
                  {language === 'tr' ? 'Oluşturulan Magic Code:' : 'Generated Magic Code:'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 px-4 py-3 rounded-lg bg-black/30 border border-white/10 overflow-hidden">
                  <p className="text-sm text-white truncate font-mono">{generatedLink}</p>
                </div>
                <Button
                  onClick={copyToClipboard}
                  className={cn(
                    'shrink-0 px-6',
                    copied ? 'bg-green-500 hover:bg-green-600' : 'bg-[var(--frame-primary)] hover:bg-[var(--frame-primary-dark)]'
                  )}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      {language === 'tr' ? 'Kopyalandı' : 'Copied'}
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      {language === 'tr' ? 'Kopyala' : 'Copy'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Info Card */}
        <div className="mt-6 p-4 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
          <h3 className="text-cyan-400 font-semibold mb-2">
            {language === 'tr' ? 'Nasıl Çalışır?' : 'How It Works?'}
          </h3>
          <ul className="text-white/60 text-sm space-y-1">
            <li>• {language === 'tr' ? 'Oluşturulan kodu kullanıcınıza gönderin.' : 'Send the generated code to your user.'}</li>
            <li>• {language === 'tr' ? 'Kullanıcı bu kodu uygulamaya girdiğinde hizmet otomatik yüklenir.' : 'When the user inputs this code into the app, the service auto-loads.'}</li>
            <li>• {language === 'tr' ? 'Magic Code ile tüm bilgileriniz güvenli bir şekilde aktarılır.' : 'All details are securely transmitted via Magic Code.'}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
