import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || vercelUrl || 'https://carboncompass.example.com';
  
  return [
    { url: `${baseUrl}/`, lastModified: new Date() },
    { url: `${baseUrl}/onboarding`, lastModified: new Date() },
    { url: `${baseUrl}/calculator`, lastModified: new Date() },
    { url: `${baseUrl}/dashboard`, lastModified: new Date() },
    { url: `${baseUrl}/assistant`, lastModified: new Date() },
    { url: `${baseUrl}/actions`, lastModified: new Date() },
    { url: `${baseUrl}/log`, lastModified: new Date() },
    { url: `${baseUrl}/report`, lastModified: new Date() },
  ];
}
