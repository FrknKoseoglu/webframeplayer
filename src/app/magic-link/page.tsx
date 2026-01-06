'use client';

import { useState } from 'react';
import { Link2, ArrowLeft, Copy, Check, Lock, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlayerStore } from '@/store/usePlayerStore';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function ImportLinkCreatorPage() {
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
  const [encryptLink, setEncryptLink] = useState(false); // Default: OFF for free users
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);

  const generateLink = () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    
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
    
    let link: string;
    
    if (encryptLink) {
      // Encode entire data as Base64
      const jsonData = JSON.stringify(data);
      const encoded = btoa(jsonData);
      link = `${baseUrl}/?d=${encoded}`;
    } else {
      // Plain URL params
      const params = new URLSearchParams();
      Object.entries(data).forEach(([key, value]) => {
        params.append(key, value);
      });
      link = `${baseUrl}/?${params.toString()}`;
    }
    
    setGeneratedLink(link);
  };

  const copyToClipboard = async () => {
    if (generatedLink) {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--iptv-background)] text-white">
      {/* Ambient Background Effect */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[var(--iptv-primary)]/10 blur-[120px] rounded-full" />
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
              <Link2 className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {language === 'tr' ? 'Import Link Oluşturucu' : 'Import Link Generator'}
              </h1>
              <p className="text-white/50 text-sm">
                {language === 'tr' ? 'Müşterilerinize paylaşmak için link oluşturun' : 'Create links to share with customers'}
              </p>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-[var(--iptv-surface)]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8">
          {/* Link Type Selector */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setLinkType('m3u')}
              className={cn(
                'flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all',
                linkType === 'm3u'
                  ? 'bg-[var(--iptv-primary)] text-white shadow-lg shadow-[var(--iptv-primary)]/20'
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
                  ? 'bg-[var(--iptv-primary)] text-white shadow-lg shadow-[var(--iptv-primary)]/20'
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
                  className="w-full px-4 py-3 rounded-xl bg-[var(--iptv-input-bg)] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[var(--iptv-primary)] transition-colors"
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
                    className="w-full px-4 py-3 rounded-xl bg-[var(--iptv-input-bg)] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[var(--iptv-primary)] transition-colors"
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
                      className="w-full px-4 py-3 rounded-xl bg-[var(--iptv-input-bg)] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[var(--iptv-primary)] transition-colors"
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
                      className="w-full px-4 py-3 rounded-xl bg-[var(--iptv-input-bg)] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[var(--iptv-primary)] transition-colors"
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
                  placeholder={language === 'tr' ? 'IPTV' : 'IPTV'}
                  className="w-full pl-[4.5rem] pr-4 py-3 rounded-xl bg-[var(--iptv-input-bg)] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[var(--iptv-primary)] transition-colors"
                />
              </div>
            </div>
            
            <div className="p-4 bg-orange-500/5 rounded-xl border border-orange-500/10 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-4 h-4 text-orange-400" />
                <span className="text-sm font-medium text-orange-400">
                  {language === 'tr' ? 'Premium Özellikler' : 'Premium Features'}
                </span>
              </div>

              <div className="opacity-60 pointer-events-none select-none space-y-4">
                <div>
                  <label className="text-sm text-white/70 mb-2 block font-medium">
                    {language === 'tr' ? 'Özel Mesaj' : 'Custom Message'}
                  </label>
                  <textarea
                    disabled
                    placeholder={language === 'tr' ? 'Sadece Premium üyelere özeldir' : 'Premium users only'}
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/30 resize-none"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                   <div>
                    <label className="text-sm text-white/70 mb-2 block font-medium">
                      {language === 'tr' ? 'Destek URL' : 'Support URL'}
                    </label>
                    <input disabled placeholder="Premium..." className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/30" />
                   </div>
                   <div>
                    <label className="text-sm text-white/70 mb-2 block font-medium">
                      {language === 'tr' ? 'Logo URL' : 'Logo URL'}
                    </label>
                    <input disabled placeholder="Premium..." className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/30" />
                   </div>
                </div>
              </div>

              <div className="text-center text-xs text-orange-300/80">
                <p>
                  {language === 'tr' ? 'Premium özellikler için ' : 'For premium features contact: '}
                  <a href="https://t.me/unfnamed" target="_blank" rel="noopener noreferrer" className="underline hover:text-orange-200 font-medium">
                    https://t.me/unfnamed
                  </a>
                </p>
              </div>
            </div>

            {/* Encrypt Toggle (Disabled) */}
            <div className="pt-4 border-t border-white/5 opacity-60">
              <button
                disabled
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-white/5 bg-white/5 cursor-not-allowed"
              >
                <div className="flex items-center gap-3">
                  <Unlock className="w-5 h-5 text-white/40" />
                  <div className="text-left">
                    <p className="font-medium text-white/40">
                      {language === 'tr' ? 'Linki Şifrele (Premium)' : 'Encrypt Link (Premium)'}
                    </p>
                    <p className="text-xs text-white/30">
                      {language === 'tr' ? 'Sadece Premium üyelere özeldir' : 'Premium users only'}
                    </p>
                  </div>
                </div>
                <div className="w-12 h-6 rounded-full bg-white/10 relative">
                  <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white/20" />
                </div>
              </button>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={generateLink}
            className="w-full mt-6 bg-[var(--iptv-primary)] hover:bg-[var(--iptv-primary-dark)] text-white font-bold text-lg py-6 rounded-xl shadow-lg shadow-[var(--iptv-primary)]/20"
          >
            {language === 'tr' ? 'Link Oluştur' : 'Generate Link'}
          </Button>

          {/* Generated Link */}
          {generatedLink && (
            <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-white/70 font-medium">
                  {language === 'tr' ? 'Oluşturulan Link:' : 'Generated Link:'}
                </p>
                {encryptLink && (
                  <span className="flex items-center gap-1 text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded">
                    <Lock className="w-3 h-3" />
                    {language === 'tr' ? 'Şifreli' : 'Encrypted'}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 px-4 py-3 rounded-lg bg-black/30 border border-white/10 overflow-hidden">
                  <p className="text-sm text-white truncate font-mono">{generatedLink}</p>
                </div>
                <Button
                  onClick={copyToClipboard}
                  className={cn(
                    'shrink-0 px-6',
                    copied ? 'bg-green-500 hover:bg-green-600' : 'bg-[var(--iptv-primary)] hover:bg-[var(--iptv-primary-dark)]'
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
            <li>• {language === 'tr' ? 'Oluşturulan linki müşterinize gönderin' : 'Send the generated link to your customer'}</li>
            <li>• {language === 'tr' ? 'Müşteri linke tıkladığında hizmet otomatik yüklenir' : 'When customer clicks, the service auto-imports'}</li>
            <li>• {language === 'tr' ? 'Şifreli link ile kullanıcı bilgileri URL\'de görünmez' : 'With encrypted link, credentials are hidden in URL'}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
