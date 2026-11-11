export const imageLicenses = ['unsplash', 'pexels', 'pixabay', 'cc0', 'public-domain', 'cc-by', 'cc-by-sa', 'own', 'permission', 'ai-generated'] as const;
export type ImageLicense = typeof imageLicenses[number];

export type ImageRecord = {
  file: string;
  alt: string;
  creator: string;
  license: ImageLicense;
  licenseUrl: string;
  sourceUrl: string;
  status: 'placeholder' | 'cleared';
  legacyLicence?: string;
  prompt?: string;
  illustrative?: boolean;
  generator?: string;
};
export const imageOverrides: Record<string, Partial<ImageRecord>> = {};

export const localFiles = [
  'kerala/alleppey-backwaters.jpg', 'ladakh/pangong-tso-ladakh.jpg', 'meghalaya/cherrapunji-waterfall.jpg',
] as const;

const slug = (file: string) => file.replace(/\.[^.]+$/, '').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();

imageOverrides["ladakh-speedy-sandy-ijfpvylrv5i-unsplash"] = { creator: "speedy-sandy", license: "unsplash", licenseUrl: "https://unsplash.com/license", sourceUrl: "https://unsplash.com/photos/IJfpVYlRv5I", status: 'cleared' };
imageOverrides["kerala-alleppey-backwaters"] = { creator: "Mohsin Bin Latheef", license: "cc-by-sa", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/", sourceUrl: "https://commons.wikimedia.org/wiki/File:Alleppey_Backwaters.jpg", alt: "Alleppey backwaters", status: 'placeholder' };
imageOverrides["ladakh-pangong-tso-ladakh"] = { creator: "Puroja", license: "cc-by", licenseUrl: "https://creativecommons.org/licenses/by/4.0/", sourceUrl: "https://commons.wikimedia.org/wiki/File:The_Pangong_tso,_Ladakh.jpg", alt: "Pangong Tso in Ladakh", status: 'placeholder' };
imageOverrides["meghalaya-cherrapunji-waterfall"] = { creator: "Sai Avinash", license: "cc-by-sa", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/", sourceUrl: "https://commons.wikimedia.org/wiki/File:Waterfall_at_Cherrapunjee.jpg", alt: "Waterfall at Cherrapunji", status: 'placeholder' };

imageOverrides["kerala-alleppey-backwaters"] = { creator: "Mohsin Bin Latheef", license: "cc-by-sa", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/", sourceUrl: "https://commons.wikimedia.org/wiki/File:Alleppey_Backwaters.jpg", status: 'cleared' };

imageOverrides["ladakh-pangong-tso-ladakh"] = { creator: "Puroja", license: "cc-by", licenseUrl: "https://creativecommons.org/licenses/by/4.0/", sourceUrl: "https://commons.wikimedia.org/wiki/File:The_Pangong_tso,_Ladakh.jpg", status: 'cleared' };

imageOverrides["meghalaya-cherrapunji-waterfall"] = { creator: "Sai Avinash", license: "cc-by-sa", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/", sourceUrl: "https://commons.wikimedia.org/wiki/File:Waterfall_at_Cherrapunjee.jpg", status: 'cleared' };

export const images: Record<string, ImageRecord> = Object.fromEntries(localFiles.map((file) => [slug(file), {
  file: `/destination/${file}`,
  alt: `Unverified destination image: ${file.split('/')[0].replace(/-/g, ' ')}`,
  creator: '', license: 'permission', licenseUrl: '', sourceUrl: '', status: 'placeholder', ...imageOverrides[slug(file)],
}])) as Record<string, ImageRecord>;

export type ImageId = keyof typeof images;
export function getImage(id: ImageId): ImageRecord { return images[id]; }

