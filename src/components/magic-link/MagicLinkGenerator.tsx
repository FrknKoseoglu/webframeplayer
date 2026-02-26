'use client';

import { useState } from 'react';
import { Copy, Check, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { usePlayerStore } from '@/store/usePlayerStore';
import { buildMagicUrl, type MagicLinkData } from '@/lib/link-generator';
import { toast } from 'sonner';

export type GeneratedLinkData = {
  id: string;
  linkType: 'XTREAM' | 'M3U';
  serviceName: string;
  message: string;
  logoUrl: string;
  url: string;
  createdAt: Date;
};

interface MagicLinkGeneratorProps {
  isPremium?: boolean;
  defaultSettings?: {
    message?: string;
    logoUrl?: string;
    supportUrl?: string;
  };
  onGenerate?: (link: GeneratedLinkData) => void;
  className?: string;
  buttonClassName?: string;
  showGeneratedLinkUI?: boolean; // Whether the component itself should show the generated link box
}

export function MagicLinkGenerator({
  isPremium = false,
  defaultSettings,
  onGenerate,
  className,
  buttonClassName,
  showGeneratedLinkUI = true,
}: MagicLinkGeneratorProps) {
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
  const [validUntil, setValidUntil] = useState('');

  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);

  // Common input styles based on context
  const inputBg = isPremium ? 'bg-white/10' : 'bg-[var(--iptv-input-bg)]';
  const inputBorder = isPremium ? 'border-white/20' : 'border-white/10';
  const labelColor = isPremium ? 'text-gray-300' : 'text-white/70';

  const resetForm = () => {
    setM3uUrl('');
    setXtreamHost('');
    setXtreamUser('');
    setXtreamPassword('');
    setServiceName('');
    setCustomMessage('');
    setSupportUrl('');
    setLogoUrl('');
    setValidUntil('');
    setGeneratedLink('');
  };

  const handleGenerate = () => {
    const data: MagicLinkData = {};

    if (linkType === 'm3u') {
      if (!m3uUrl) {
        toast.error(language === 'tr' ? 'Lütfen M3U URL\'sini girin' : 'Please enter M3U URL');
        return;
      }
      data.m3uUrl = m3uUrl;
    } else {
      if (!xtreamHost || !xtreamUser || !xtreamPassword) {
        toast.error(language === 'tr' ? 'Lütfen tüm Xtream bilgilerini girin' : 'Please enter all Xtream details');
        return;
      }
      data.xtreamHost = xtreamHost;
      data.xtreamUser = xtreamUser;
      data.xtreamPassword = xtreamPassword;
    }

    if (serviceName) data.serviceName = serviceName;

    // Premium Features
    const msg = customMessage || defaultSettings?.message;
    const logo = logoUrl || defaultSettings?.logoUrl;
    const support = supportUrl || defaultSettings?.supportUrl;

    if (isPremium) {
      if (msg) data.message = msg;
      if (logo) data.logoUrl = logo;
      if (support) data.supportUrl = support;
      data.adFree = true;
      if (validUntil) {
        data.expireDate = Math.floor(new Date(validUntil).getTime() / 1000);
      }
    }

    const url = buildMagicUrl(data);
    setGeneratedLink(url);

    if (onGenerate) {
      onGenerate({
        id: crypto.randomUUID(),
        linkType: linkType === 'm3u' ? 'M3U' : 'XTREAM',
        serviceName: serviceName || (linkType === 'm3u' ? 'M3U Playlist' : 'Xtream Codes'),
        message: msg || '',
        logoUrl: logo || '',
        url,
        createdAt: new Date(),
      });
      // Don't reset if we are just showing it in place, but do reset if we are inside a modal
      if (!showGeneratedLinkUI) {
        resetForm();
      }
    }
  };

  const copyToClipboard = async () => {
    if (generatedLink) {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success(language === 'tr' ? 'Kopyalandı' : 'Copied');
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {/* Type Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setLinkType('m3u')}
          className={cn(
            'flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all',
            linkType === 'm3u'
              ? (isPremium ? 'bg-gradient-to-r from-rose-600 to-orange-600 text-white shadow-lg' : 'bg-[var(--iptv-primary)] text-white shadow-lg')
              : 'bg-white/5 text-white/50 hover:text-white hover:bg-white/10'
          )}
        >
          M3U Playlist
        </button>
        <button
          onClick={() => setLinkType('xtream')}
          className={cn(
            'flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all',
            linkType === 'xtream'
              ? (isPremium ? 'bg-gradient-to-r from-rose-600 to-orange-600 text-white shadow-lg' : 'bg-[var(--iptv-primary)] text-white shadow-lg')
              : 'bg-white/5 text-white/50 hover:text-white hover:bg-white/10'
          )}
        >
          Xtream Codes
        </button>
      </div>

      <div className="space-y-4">
        {/* Connection Fields */}
        {linkType === 'm3u' ? (
          <div>
            <Label className={cn("mb-2 block", labelColor)}>
              {language === 'tr' ? 'M3U Playlist URL' : 'M3U Playlist URL'}
            </Label>
            <Input
              type="url"
              value={m3uUrl}
              onChange={(e) => setM3uUrl(e.target.value)}
              placeholder="https://example.com/playlist.m3u"
              className={cn(inputBg, inputBorder, "text-white placeholder:text-white/30")}
            />
          </div>
        ) : (
          <>
            <div>
              <Label className={cn("mb-2 block", labelColor)}>
                {language === 'tr' ? 'Sunucu Adresi' : 'Server Host'}
              </Label>
              <Input
                type="url"
                value={xtreamHost}
                onChange={(e) => setXtreamHost(e.target.value)}
                placeholder="http://server.com:8080"
                className={cn(inputBg, inputBorder, "text-white placeholder:text-white/30")}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className={cn("mb-2 block", labelColor)}>
                  {language === 'tr' ? 'Kullanıcı Adı' : 'Username'}
                </Label>
                <Input
                  type="text"
                  value={xtreamUser}
                  onChange={(e) => setXtreamUser(e.target.value)}
                  placeholder="username"
                  className={cn(inputBg, inputBorder, "text-white placeholder:text-white/30")}
                />
              </div>
              <div>
                <Label className={cn("mb-2 block", labelColor)}>
                  {language === 'tr' ? 'Şifre' : 'Password'}
                </Label>
                <Input
                  type="text"
                  value={xtreamPassword}
                  onChange={(e) => setXtreamPassword(e.target.value)}
                  placeholder="password"
                  className={cn(inputBg, inputBorder, "text-white placeholder:text-white/30")}
                />
              </div>
            </div>
          </>
        )}

        {/* Optional Base Fields */}
        <div className="pt-4 border-t border-white/5">
          <Label className={cn("mb-2 block", labelColor)}>
            {language === 'tr' ? 'Hizmet Adı (Opsiyonel)' : 'Service Name (Optional)'}
          </Label>
          <div className="relative flex items-center">
            {/* If premium, they can write whatever. If not premium, force Frame - prefix */}
            {!isPremium && <span className="absolute left-4 text-white/40 select-none">Frame - </span>}
            <Input
              type="text"
              value={isPremium ? serviceName : serviceName.replace(/^Frame - /, '')}
              onChange={(e) => setServiceName(isPremium ? e.target.value : `Frame - ${e.target.value}`)}
              placeholder={language === 'tr' ? 'IPTV' : 'IPTV'}
              className={cn(inputBg, inputBorder, "text-white placeholder:text-white/30", !isPremium && "pl-[4.5rem]")}
            />
          </div>
        </div>

        {/* Premium Fields */}
        <div className="pt-4 border-t border-white/5">
          <div className="flex items-center justify-between mb-4">
            <h3 className={cn("font-medium", labelColor)}>Marka Bilgileri (Premium)</h3>
          </div>

          <div className={cn(
            "relative", 
            !isPremium && "border border-amber-500/30 p-4 rounded-2xl"
          )}>
            
            <div className={cn("space-y-4 transition-opacity", !isPremium && "opacity-60 pointer-events-none select-none")}>
              <div>
                <Label className={cn("mb-2 block text-xs", labelColor)}>
                  {language === 'tr' ? 'Özel Mesaj' : 'Custom Message'}
                </Label>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  disabled={!isPremium}
                  placeholder={defaultSettings?.message || (language === 'tr' ? 'Kullanıcıya gösterilecek mesaj...' : 'Message shown to user...')}
                  rows={2}
                  className={cn("w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 resize-none text-sm", 
                    inputBg, inputBorder, "text-white placeholder:text-white/30 focus:ring-[var(--iptv-primary)]"
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <Label className={cn("mb-2 block text-xs", labelColor)}>
                    {language === 'tr' ? 'Logo URL' : 'Logo URL'}
                  </Label>
                  <Input
                    type="url"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    disabled={!isPremium}
                    placeholder={defaultSettings?.logoUrl || "https://example.com/logo.png"}
                    className={cn(inputBg, inputBorder, "text-white placeholder:text-white/30 text-sm")}
                  />
                </div>
                <div>
                  <Label className={cn("mb-2 block text-xs", labelColor)}>
                    {language === 'tr' ? 'Destek URL' : 'Support URL'}
                  </Label>
                  <Input
                    type="url"
                    value={supportUrl}
                    onChange={(e) => setSupportUrl(e.target.value)}
                    disabled={!isPremium}
                    placeholder={defaultSettings?.supportUrl || "https://t.me/example"}
                    className={cn(inputBg, inputBorder, "text-white placeholder:text-white/30 text-sm")}
                  />
                </div>
              </div>

              {isPremium && (
                <div className="mt-4">
                  <Label className={cn("mb-2 block text-xs", labelColor)}>
                    Geçerlilik Tarihi (Opsiyonel)
                  </Label>
                  <Input
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className={cn(inputBg, inputBorder, "text-white text-sm")}
                  />
                </div>
              )}
            </div>

            {!isPremium && (
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-amber-500/10 rounded-xl p-4 border border-amber-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                    <Lock className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-amber-400 mb-0.5">
                      {language === 'tr' ? 'Premium Özellik' : 'Premium Feature'}
                    </h4>
                    <p className="text-xs text-amber-500/80">
                      {language === 'tr' 
                        ? 'Logonuz ve özel mesajınızla kendi markanızı oluşturmak için bizimle iletişime geçin.' 
                        : 'Contact us to customize links with your logo and unique message.'}
                    </p>
                  </div>
                </div>
                <a 
                  href="mailto:webframeplayer@gmail.com" 
                  className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg text-sm font-bold transition-all shrink-0 shadow-lg shadow-amber-500/20"
                >
                  {language === 'tr' ? 'İletişime Geç' : 'Contact Us'}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      <Button
        onClick={handleGenerate}
        className={cn("w-full font-bold py-6 rounded-xl shadow-lg mt-2", buttonClassName || (isPremium ? "bg-gradient-to-r from-rose-600 to-orange-600 hover:opacity-90 text-white" : "bg-[var(--iptv-primary)] hover:bg-[var(--iptv-primary-dark)] text-white shadow-[var(--iptv-primary)]/20"))}
      >
        {language === 'tr' ? 'Link Oluştur' : 'Generate Link'}
      </Button>

      {/* Generated Link Result */}
      {showGeneratedLinkUI && generatedLink && (
        <div className={cn("mt-4 p-4 rounded-xl border animate-fade-in-up", isPremium ? "bg-white/5 border-white/10" : "bg-white/5 border-white/10")}>
          <div className="flex items-center justify-between mb-3">
            <p className={cn("text-sm font-medium", isPremium ? "text-gray-300" : "text-white/70")}>
              {language === 'tr' ? 'Oluşturulan Link:' : 'Generated Link:'}
            </p>
            <span className="flex items-center gap-1 text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded">
              {language === 'tr' ? 'Sıkıştırılmış' : 'Compressed'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 px-4 py-3 rounded-lg bg-black/40 border border-white/10 overflow-hidden">
              <p className="text-sm text-white truncate font-mono">{generatedLink}</p>
            </div>
            <Button
              onClick={copyToClipboard}
              className={cn(
                'shrink-0 px-6',
                copied ? 'bg-green-500 hover:bg-green-600' : (isPremium ? 'bg-orange-500 hover:bg-orange-600' : 'bg-[var(--iptv-primary)] hover:bg-[var(--iptv-primary-dark)]')
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
  );
}
