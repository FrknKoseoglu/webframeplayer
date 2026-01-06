import { db } from '@/lib/db';
import { redirect } from 'next/navigation';

export default async function MagicLinkPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  const magicLink = await db.magicLink.findUnique({
    where: { shortCode: code },
  });

  if (!magicLink) {
    redirect('/');
  }

  // Check if expired
  if (magicLink.validUntil && new Date(magicLink.validUntil) < new Date()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--iptv-background)]">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-2">Link Süresi Dolmuş</h1>
          <p className="text-gray-300">Bu magic linkin geçerlilik süresi dolmuştur.</p>
        </div>
      </div>
    );
  }

  // Increment clicks
  await db.magicLink.update({
    where: { id: magicLink.id },
    data: { clicks: magicLink.clicks + 1 },
  });

  // Build redirect URL based on link type
  const baseUrl = '/';
  const data: Record<string, string> = {};

  if (magicLink.linkType === 'M3U' && magicLink.m3uUrl) {
    data.importUrl = magicLink.m3uUrl;
  } else if (magicLink.linkType === 'XTREAM' && magicLink.xtreamHost && magicLink.xtreamUser && magicLink.xtreamPassword) {
    data.importXtream = '1';
    data.host = magicLink.xtreamHost;
    data.user = magicLink.xtreamUser;
    data.password = magicLink.xtreamPassword;
  }

  if (magicLink.serviceName) {
    data.serviceName = magicLink.serviceName;
  }

  if (magicLink.message) {
    // Base64 encode message for safe URL transmission
    data.message = Buffer.from(magicLink.message).toString('base64');
  }

  if (magicLink.supportUrl) {
    data.supportUrl = magicLink.supportUrl;
  }

  if (magicLink.logoUrl) {
    data.logoUrl = magicLink.logoUrl;
  }

  // Add hidden ad-free flag for provider magic links
  data.xrkad = '1';

  // Encode data as base64 for encrypted URL
  const jsonData = JSON.stringify(data);
  const encoded = Buffer.from(jsonData).toString('base64');
  const redirectUrl = `${baseUrl}?d=${encoded}`;

  redirect(redirectUrl);
}
