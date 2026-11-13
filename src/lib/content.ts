import fs from 'node:fs';
import path from 'node:path';
import settingsJson from '../data/settings.json';
import publicationsJson from '../data/publications.json';
import alumniJson from '../data/alumni.json';
import albumsJson from '../data/albums.json';
import newsJson from '../data/news.json';
import activitiesJson from '../data/activities.json';

export interface HomepageSettings {
  newsLimit: number;
  featuredLimit: number;
  galleryPreviewLimit: number;
  activityPreviewLimit: number;
}

export interface HeroSlide {
  image: string;
  alt: string;
  caption?: string;
}

export interface Settings {
  name: string;
  fullName: string;
  institution: string;
  institutionShort: string;
  school: string;
  domain: string;
  description: string;
  email: string;
  phone: string;
  address: string[];
  universityUrl: string;
  homepage: HomepageSettings;
  hero: {
    slides: HeroSlide[];
  };
  socialImage: string;
}

export interface Publication {
  id: string;
  title: string;
  authors: string;
  year: number;
  venue: string;
  url: string;
  order: number;
  featured: boolean;
  featured_order?: number;
}

export interface Alumnus {
  name: string;
  role: string;
  period?: string;
  destination?: string;
  sort_order: number;
}

export interface AlbumPhoto {
  image: string;
  alt: string;
  caption?: string;
  credit?: string;
}

export type AlbumDatePrecision = 'day' | 'month' | 'year';

export interface Album {
  slug: string;
  title: string;
  category: string;
  date?: string;
  date_precision?: AlbumDatePrecision;
  location?: string;
  description?: string;
  cover: string;
  photos: AlbumPhoto[];
}

export type NewsStatus = 'draft' | 'published';

export interface NewsItem {
  slug: string;
  title: string;
  date: string;
  event_date?: string;
  category: string;
  summary: string;
  status: NewsStatus;
  editorial_preview?: boolean;
  preview_note?: string;
  body?: string;
  image?: string;
  image_alt?: string;
  related_publications?: string[];
  related_members?: string[];
  related_albums?: string[];
  source_url?: string;
  source_label?: string;
}

export const activityCategories = ['Seminar', 'External Talk', 'Undergraduate Lecture'] as const;
export type ActivityCategory = (typeof activityCategories)[number];
export type ActivityStatus = 'draft' | 'published';

export interface ActivityPhoto {
  image: string;
  alt: string;
  caption?: string;
}

export interface Activity {
  slug: string;
  title: string;
  category: ActivityCategory;
  summary: string;
  status: ActivityStatus;
  date?: string;
  time?: string;
  speaker?: string;
  affiliation?: string;
  host?: string;
  venue?: string;
  body?: string;
  image?: string;
  image_alt?: string;
  photos?: ActivityPhoto[];
  source_url?: string;
  source_label?: string;
  related_albums?: string[];
}

export interface MediaVariant {
  width: number;
  height: number;
  src: string;
  bytes: number;
}

export interface MediaImage {
  source: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  variants: MediaVariant[];
}

interface MediaManifest {
  generated_by: string;
  widths: number[];
  images: Record<string, MediaImage>;
}

const errors: string[] = [];

function record(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function expectString(
  value: unknown,
  label: string,
  options: { optional?: boolean; pattern?: RegExp; url?: boolean } = {},
): value is string {
  if (value === undefined || value === null) {
    if (!options.optional) errors.push(`${label}: required string is missing`);
    return false;
  }
  if (typeof value !== 'string' || !value.trim()) {
    errors.push(`${label}: must be a non-empty string`);
    return false;
  }
  if (options.pattern && !options.pattern.test(value)) {
    errors.push(`${label}: value "${value}" does not match ${options.pattern}`);
    return false;
  }
  if (options.url) {
    try {
      const url = new URL(value);
      if (!['https:', 'http:'].includes(url.protocol)) throw new Error('protocol');
    } catch {
      errors.push(`${label}: "${value}" must be an absolute http(s) URL`);
      return false;
    }
  }
  return true;
}

function expectNumber(
  value: unknown,
  label: string,
  options: { integer?: boolean; min?: number; max?: number; optional?: boolean } = {},
): value is number {
  if (value === undefined || value === null) {
    if (!options.optional) errors.push(`${label}: required number is missing`);
    return false;
  }
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    errors.push(`${label}: must be a finite number`);
    return false;
  }
  if (options.integer && !Number.isInteger(value)) {
    errors.push(`${label}: must be an integer`);
    return false;
  }
  if (options.min !== undefined && value < options.min) {
    errors.push(`${label}: must be at least ${options.min}`);
    return false;
  }
  if (options.max !== undefined && value > options.max) {
    errors.push(`${label}: must be at most ${options.max}`);
    return false;
  }
  return true;
}

const localImagePattern = /^\/assets\/images\/(?:[A-Za-z0-9_-][A-Za-z0-9._-]*\/)*[A-Za-z0-9_-][A-Za-z0-9._-]*\.(?:jpe?g|png|webp|svg)$/i;
const localPdfPattern = /^\/assets\/[A-Za-z0-9/._-]+\.pdf$/i;
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const isoDatePattern = /^(\d{4})-(\d{2})-(\d{2})$/;
const isoMonthPattern = /^(\d{4})-(\d{2})$/;
const isoYearPattern = /^(\d{4})$/;

function isRealYear(year: number): boolean {
  return Number.isInteger(year) && year >= 1 && year <= 9999;
}

function daysInMonth(year: number, month: number): number {
  if (month === 2) {
    const leap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    return leap ? 29 : 28;
  }
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

export function isValidIsoDate(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const match = isoDatePattern.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  return (
    isRealYear(year) &&
    month >= 1 &&
    month <= 12 &&
    day >= 1 &&
    day <= daysInMonth(year, month)
  );
}

export function albumDateProblem(value: unknown, precision: unknown): string | undefined {
  if (typeof precision !== 'string' || !['day', 'month', 'year'].includes(precision)) {
    return 'date_precision must be one of day, month or year';
  }
  if (typeof value !== 'string') return 'date must be a string';
  if (precision === 'year') {
    const match = isoYearPattern.exec(value);
    if (!match) return 'date must use YYYY when date_precision is year';
    if (!isRealYear(Number(match[1]))) return 'date must contain a real calendar year';
    return undefined;
  }
  if (precision === 'month') {
    const match = isoMonthPattern.exec(value);
    if (!match) return 'date must use YYYY-MM when date_precision is month';
    if (!isRealYear(Number(match[1]))) return 'date must contain a real calendar year';
    const month = Number(match[2]);
    if (month < 1 || month > 12) return 'date must contain a real calendar month';
    return undefined;
  }
  if (!isoDatePattern.test(value)) return 'date must use YYYY-MM-DD when date_precision is day';
  if (!isValidIsoDate(value)) return 'date must be a real calendar date';
  return undefined;
}

export function isValidAlbumDate(value: unknown, precision: unknown): value is string {
  return albumDateProblem(value, precision) === undefined;
}

export function formatPhoneDial(value: string): string {
  const compact = value.replace(/[^\d+]/g, '');
  const dial = compact.replace(/^\+86(?:0)+/, '+86');
  if (!/^\+[1-9]\d{6,14}$/.test(dial)) {
    throw new Error(`Cannot derive a valid international dial URI from phone number "${value}".`);
  }
  return dial;
}

function expectStringArray(value: unknown, label: string, optional = true): string[] {
  if (value === undefined || value === null) {
    if (!optional) errors.push(`${label}: required array is missing`);
    return [];
  }
  if (!Array.isArray(value) || value.length === 0 || value.some((item) => typeof item !== 'string' || !item.trim())) {
    errors.push(`${label}: must be a non-empty array of non-empty strings`);
    return [];
  }
  return value as string[];
}

function validateSettings(value: unknown): value is Settings {
  const item = record(value);
  if (!item) {
    errors.push('settings.json: root must be an object');
    return false;
  }
  for (const key of [
    'name',
    'fullName',
    'institution',
    'institutionShort',
    'school',
    'domain',
    'description',
    'email',
    'phone',
    'universityUrl',
    'socialImage',
  ]) {
    expectString(item[key], `settings.json: ${key}`, {
      url: key === 'domain' || key === 'universityUrl',
    });
  }
  if (expectString(item.email, 'settings.json: email') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item.email as string)) {
    errors.push('settings.json: email is not a valid email address');
  }
  if (typeof item.phone === 'string' && item.phone.trim()) {
    try {
      formatPhoneDial(item.phone);
    } catch (error) {
      errors.push(`settings.json: phone: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  if (!Array.isArray(item.address) || item.address.length === 0 || item.address.some((line) => typeof line !== 'string' || !line.trim())) {
    errors.push('settings.json: address must be a non-empty array of strings');
  }
  if (item.socialImage !== undefined) {
    expectString(item.socialImage, 'settings.json: socialImage', { pattern: localImagePattern });
  }
  const homepage = record(item.homepage);
  if (!homepage) {
    errors.push('settings.json: homepage must be an object');
  } else {
    expectNumber(homepage.newsLimit, 'settings.json: homepage.newsLimit', { integer: true, min: 1, max: 3 });
    expectNumber(homepage.featuredLimit, 'settings.json: homepage.featuredLimit', { integer: true, min: 1, max: 5 });
    expectNumber(homepage.galleryPreviewLimit, 'settings.json: homepage.galleryPreviewLimit', {
      integer: true,
      min: 1,
    });
    expectNumber(homepage.activityPreviewLimit, 'settings.json: homepage.activityPreviewLimit', {
      integer: true,
      min: 1,
      max: 3,
    });
  }
  const hero = record(item.hero);
  if (!hero) {
    errors.push('settings.json: hero must be an object');
  } else if (!Array.isArray(hero.slides) || hero.slides.length === 0) {
    errors.push('settings.json: hero.slides must be a non-empty array');
  } else {
    hero.slides.forEach((rawSlide, index) => {
      const label = `settings.json: hero.slides[${index}]`;
      const slide = record(rawSlide);
      if (!slide) {
        errors.push(`${label}: must be an object`);
        return;
      }
      expectString(slide.image, `${label}.image`, { pattern: localImagePattern });
      expectString(slide.alt, `${label}.alt`);
      if (slide.caption !== undefined && typeof slide.caption !== 'string') {
        errors.push(`${label}.caption: must be a string`);
      }
    });
  }
  return errors.length === 0;
}

function validatePublications(value: unknown): value is Publication[] {
  if (!Array.isArray(value)) {
    errors.push('publications.json: root must be an array');
    return false;
  }
  const ids = new Set<string>();
  const yearOrders = new Set<string>();
  value.forEach((raw, index) => {
    const item = record(raw);
    const label = `publications.json[${index}]`;
    if (!item) {
      errors.push(`${label}: must be an object`);
      return;
    }
    const id = item.id;
    if (expectString(id, `${label}.id`, { pattern: slugPattern })) {
      if (ids.has(id)) errors.push(`${label}.id: duplicate publication id "${id}"`);
      ids.add(id);
    }
    expectString(item.title, `${label}.title`);
    expectString(item.authors, `${label}.authors`);
    expectNumber(item.year, `${label}.year`, { integer: true, min: 1900, max: 2100 });
    expectString(item.venue, `${label}.venue`);
    expectString(item.url, `${label}.url`, { url: true });
    expectNumber(item.order, `${label}.order`, { integer: true, min: 0 });
    if (typeof item.year === 'number' && typeof item.order === 'number') {
      const key = `${item.year}:${item.order}`;
      if (yearOrders.has(key)) {
        errors.push(`${label}: duplicate secondary order ${item.order} within year ${item.year}`);
      }
      yearOrders.add(key);
    }
    if (typeof item.featured !== 'boolean') {
      errors.push(`${label}.featured: must be true or false`);
    } else if (item.featured) {
      expectNumber(item.featured_order, `${label}.featured_order`, { integer: true, min: 1 });
    } else if (item.featured_order !== undefined) {
      errors.push(`${label}: featured_order is only valid when featured is true`);
    }
  });
  return errors.length === 0;
}

function validateAlumni(value: unknown): value is Alumnus[] {
  if (!Array.isArray(value)) {
    errors.push('alumni.json: root must be an array');
    return false;
  }
  value.forEach((raw, index) => {
    const item = record(raw);
    const label = `alumni.json[${index}]`;
    if (!item) {
      errors.push(`${label}: must be an object`);
      return;
    }
    expectString(item.name, `${label}.name`);
    expectString(item.role, `${label}.role`);
    if (item.period !== undefined) expectString(item.period, `${label}.period`);
    if (item.destination !== undefined) expectString(item.destination, `${label}.destination`);
    expectNumber(item.sort_order, `${label}.sort_order`, { integer: true, min: 0 });
  });
  return errors.length === 0;
}

function validateAlbums(value: unknown): value is Album[] {
  if (!Array.isArray(value)) {
    errors.push('albums.json: root must be an array');
    return false;
  }
  const slugs = new Set<string>();
  value.forEach((raw, index) => {
    const item = record(raw);
    const label = `albums.json[${index}]`;
    if (!item) {
      errors.push(`${label}: must be an object`);
      return;
    }
    if (expectString(item.slug, `${label}.slug`, { pattern: slugPattern })) {
      if (slugs.has(item.slug)) errors.push(`${label}.slug: duplicate album slug "${item.slug}"`);
      slugs.add(item.slug);
    }
    expectString(item.title, `${label}.title`);
    expectString(item.category, `${label}.category`);
    if (
      typeof item.category === 'string' &&
      !['Conference', 'Workshop', 'Group Life', 'Outing'].includes(item.category)
    ) {
      errors.push(`${label}.category: must be Conference, Workshop, Group Life or Outing`);
    }
    if (item.date === undefined && item.date_precision === undefined) {
      // Unknown date: both fields are intentionally absent.
    } else if (item.date === undefined) {
      errors.push(`${label}.date: required when date_precision is set`);
    } else if (item.date_precision === undefined) {
      errors.push(`${label}.date_precision: required when date is set (day, month or year)`);
    } else {
      const problem = albumDateProblem(item.date, item.date_precision);
      if (problem) errors.push(`${label}.date: ${problem}`);
    }
    if (item.location !== undefined) expectString(item.location, `${label}.location`);
    if (item.description !== undefined) expectString(item.description, `${label}.description`);
    expectString(item.cover, `${label}.cover`, { pattern: localImagePattern });
    if (!Array.isArray(item.photos) || item.photos.length === 0) {
      errors.push(`${label}.photos: must contain at least one photo`);
      return;
    }
    item.photos.forEach((rawPhoto, photoIndex) => {
      const photo = record(rawPhoto);
      const photoLabel = `${label}.photos[${photoIndex}]`;
      if (!photo) {
        errors.push(`${photoLabel}: must be an object`);
        return;
      }
      expectString(photo.image, `${photoLabel}.image`, { pattern: localImagePattern });
      expectString(photo.alt, `${photoLabel}.alt`);
      if (photo.caption !== undefined) expectString(photo.caption, `${photoLabel}.caption`);
      if (photo.credit !== undefined) expectString(photo.credit, `${photoLabel}.credit`);
    });
    if (
      typeof item.cover === 'string' &&
      Array.isArray(item.photos) &&
      !item.photos.some((photo) => record(photo)?.image === item.cover)
    ) {
      errors.push(`${label}.cover: must match one of the album photos`);
    }
  });
  return errors.length === 0;
}

function validateNews(value: unknown): value is NewsItem[] {
  if (!Array.isArray(value)) {
    errors.push('news.json: root must be an array');
    return false;
  }
  const slugs = new Set<string>();
  value.forEach((raw, index) => {
    const item = record(raw);
    const label = `news.json[${index}]`;
    if (!item) {
      errors.push(`${label}: must be an object`);
      return;
    }
    if (expectString(item.slug, `${label}.slug`, { pattern: slugPattern })) {
      if (slugs.has(item.slug)) errors.push(`${label}.slug: duplicate news slug "${item.slug}"`);
      slugs.add(item.slug);
    }
    expectString(item.title, `${label}.title`);
    if (!isValidIsoDate(item.date)) errors.push(`${label}.date: must be a real announcement date (YYYY-MM-DD)`);
    if (item.event_date !== undefined && !isValidIsoDate(item.event_date)) {
      errors.push(`${label}.event_date: must be a real event date (YYYY-MM-DD)`);
    }
    expectString(item.category, `${label}.category`);
    expectString(item.summary, `${label}.summary`);
    if (!['draft', 'published'].includes(String(item.status))) {
      errors.push(`${label}.status: must be "draft" or "published"`);
    }
    if (item.body !== undefined) expectString(item.body, `${label}.body`);
    if (item.image !== undefined) {
      expectString(item.image, `${label}.image`, { pattern: localImagePattern });
      if (item.image_alt === undefined) errors.push(`${label}.image_alt: required when image is set`);
    } else if (item.image_alt !== undefined) {
      errors.push(`${label}.image_alt: must be omitted when image is omitted`);
    }
    for (const key of ['related_publications', 'related_members', 'related_albums']) {
      if (item[key] !== undefined) expectStringArray(item[key], `${label}.${key}`);
    }
    if (item.source_url !== undefined) {
      expectString(item.source_url, `${label}.source_url`, { url: true });
      if (item.source_label === undefined) errors.push(`${label}.source_label: required when source_url is set`);
    } else if (item.source_label !== undefined) {
      errors.push(`${label}.source_label: must be omitted when source_url is omitted`);
    }
  });
  return errors.length === 0;
}

function rejectUnknownFields(item: Record<string, unknown>, allowed: readonly string[], label: string): void {
  for (const key of Object.keys(item)) {
    if (!allowed.includes(key)) errors.push(`${label}: unknown field "${key}"`);
  }
}

function expectOptionalString(value: unknown, label: string): value is string | undefined {
  if (value === undefined) return true;
  if (typeof value !== 'string' || !value.trim()) {
    errors.push(`${label}: must be a non-empty string when provided`);
    return false;
  }
  return true;
}

const activityFields = [
  'slug',
  'title',
  'category',
  'summary',
  'status',
  'date',
  'time',
  'speaker',
  'affiliation',
  'host',
  'venue',
  'body',
  'image',
  'image_alt',
  'photos',
  'source_url',
  'source_label',
  'related_albums',
] as const;

function validateActivities(value: unknown): value is Activity[] {
  if (!Array.isArray(value)) {
    errors.push('activities.json: root must be an array');
    return false;
  }
  const slugs = new Set<string>();
  const albumSlugs = new Set(
    Array.isArray(albumsJson)
      ? (albumsJson as Album[]).map((album) => album.slug).filter((slug): slug is string => typeof slug === 'string')
      : [],
  );
  value.forEach((raw, index) => {
    const item = record(raw);
    const label = `activities.json[${index}]`;
    if (!item) {
      errors.push(`${label}: must be an object`);
      return;
    }
    rejectUnknownFields(item, activityFields, label);
    if (expectString(item.slug, `${label}.slug`, { pattern: slugPattern })) {
      if (slugs.has(item.slug)) errors.push(`${label}.slug: duplicate activity slug "${item.slug}"`);
      slugs.add(item.slug);
    }
    expectString(item.title, `${label}.title`);
    if (
      typeof item.category !== 'string' ||
      !activityCategories.includes(item.category as ActivityCategory)
    ) {
      errors.push(`${label}.category: must be Seminar, External Talk or Undergraduate Lecture`);
    }
    expectString(item.summary, `${label}.summary`);
    if (typeof item.status !== 'string' || !['draft', 'published'].includes(item.status)) {
      errors.push(`${label}.status: must be "draft" or "published"`);
    }
    if (item.date !== undefined && !isValidIsoDate(item.date)) {
      errors.push(`${label}.date: must be a real event date (YYYY-MM-DD)`);
    }
    for (const key of ['time', 'speaker', 'affiliation', 'host', 'venue', 'body'] as const) {
      expectOptionalString(item[key], `${label}.${key}`);
    }
    if (item.image !== undefined) {
      const image = item.image;
      if (expectString(image, `${label}.image`, { pattern: localImagePattern }) && !localAssetExists(image)) {
        errors.push(`${label}.image: local image is missing at public${image}`);
      }
      expectString(item.image_alt, `${label}.image_alt`);
    } else if (item.image_alt !== undefined) {
      errors.push(`${label}.image_alt: must be omitted when image is omitted`);
    }
    if (item.photos !== undefined) {
      if (!Array.isArray(item.photos) || item.photos.length === 0) {
        errors.push(`${label}.photos: must be a non-empty array`);
      } else {
        item.photos.forEach((rawPhoto, photoIndex) => {
          const photoLabel = `${label}.photos[${photoIndex}]`;
          const photo = record(rawPhoto);
          if (!photo) {
            errors.push(`${photoLabel}: must be an object`);
            return;
          }
          rejectUnknownFields(photo, ['image', 'alt', 'caption'], photoLabel);
          if (
            expectString(photo.image, `${photoLabel}.image`, { pattern: localImagePattern }) &&
            !localAssetExists(photo.image)
          ) {
            errors.push(`${photoLabel}.image: local image is missing at public${photo.image}`);
          }
          expectString(photo.alt, `${photoLabel}.alt`);
          if (photo.caption !== undefined) expectString(photo.caption, `${photoLabel}.caption`);
        });
      }
    }
    if (item.source_url !== undefined) {
      expectString(item.source_url, `${label}.source_url`, { url: true });
      if (!expectOptionalString(item.source_label, `${label}.source_label`)) {
        // The helper has already reported the problem.
      } else if (item.source_label === undefined) {
        errors.push(`${label}.source_label: required when source_url is set`);
      }
    } else if (item.source_label !== undefined) {
      errors.push(`${label}.source_label: must be omitted when source_url is omitted`);
    }
    if (item.related_albums !== undefined) {
      if (!Array.isArray(item.related_albums) || item.related_albums.length === 0) {
        errors.push(`${label}.related_albums: must be a non-empty array of non-empty strings`);
      } else {
        item.related_albums.forEach((slug, albumIndex) => {
          if (typeof slug !== 'string' || !slug.trim()) {
            errors.push(`${label}.related_albums[${albumIndex}]: must be a non-empty string`);
          } else if (!slugPattern.test(slug)) {
            errors.push(`${label}.related_albums: "${slug}" must be a lowercase album slug`);
          } else if (!albumSlugs.has(slug)) {
            errors.push(`${label}.related_albums: unknown album slug "${slug}"`);
          }
        });
      }
    }
  });
  return errors.length === 0;
}

validateSettings(settingsJson);
validatePublications(publicationsJson);
validateAlumni(alumniJson);
validateAlbums(albumsJson);
validateNews(newsJson);
validateActivities(activitiesJson);

if (errors.length) {
  throw new Error(`Content validation failed:\n- ${errors.join('\n- ')}`);
}

export const settings = settingsJson as Settings;
export const phoneDial = formatPhoneDial(settings.phone);
export const publications = [...(publicationsJson as Publication[])].sort(
  (a, b) => b.year - a.year || a.order - b.order || a.id.localeCompare(b.id),
);
export const alumni = [...(alumniJson as Alumnus[])].sort(
  (a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name),
);
export const albums = [...(albumsJson as Album[])].sort(
  (a, b) => (b.date ?? '').localeCompare(a.date ?? '') || a.title.localeCompare(b.title),
);
export const news = newsJson as NewsItem[];
export const publishedNews = [...news]
  .filter((item) => item.status === 'published')
  .sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
export const activities = activitiesJson as Activity[];
export const publishedActivities = [...activities]
  .filter((item) => item.status === 'published')
  .sort((a, b) => {
    if (a.date && b.date) {
      return b.date.localeCompare(a.date) || a.title.localeCompare(b.title) || a.slug.localeCompare(b.slug);
    }
    if (a.date) return -1;
    if (b.date) return 1;
    return a.title.localeCompare(b.title) || a.slug.localeCompare(b.slug);
  });

export const featuredPublications = publications
  .filter((item) => item.featured)
  .sort((a, b) => (a.featured_order ?? 99) - (b.featured_order ?? 99));

const featuredErrors: string[] = [];
if (featuredPublications.length !== settings.homepage.featuredLimit) {
  featuredErrors.push(
    `expected ${settings.homepage.featuredLimit} featured publications, found ${featuredPublications.length}`,
  );
}
const featuredOrders = featuredPublications.map((item) => item.featured_order ?? 0);
if (new Set(featuredOrders).size !== featuredOrders.length) {
  featuredErrors.push('featured_order values must be unique');
}
const sortedOrders = [...featuredOrders].sort((a, b) => a - b);
if (sortedOrders.some((value, index) => value !== index + 1)) {
  featuredErrors.push('featured_order values must be contiguous starting at 1');
}
if (featuredErrors.length) {
  throw new Error(`Featured publication validation failed:\n- ${featuredErrors.join('\n- ')}`);
}

export const publicationYears = [...new Set(publications.map((item) => item.year))].sort(
  (a, b) => b - a,
);

export const publicationById = new Map(publications.map((item) => [item.id, item]));
export const albumBySlug = new Map(albums.map((item) => [item.slug, item]));
export const newsBySlug = new Map(news.map((item) => [item.slug, item]));

export function assertNewsReferences(
  items: NewsItem[],
  references: { memberSlugs: string[]; publicationIds?: string[]; albumSlugs?: string[] },
): void {
  const members = new Set(references.memberSlugs);
  const pubs = new Set(references.publicationIds ?? publications.map((item) => item.id));
  const albumSlugs = new Set(references.albumSlugs ?? albums.map((item) => item.slug));
  const referenceErrors: string[] = [];
  for (const item of items) {
    for (const id of item.related_publications ?? []) {
      if (!pubs.has(id)) referenceErrors.push(`news "${item.slug}" references unknown publication "${id}"`);
    }
    for (const slug of item.related_members ?? []) {
      if (!members.has(slug)) referenceErrors.push(`news "${item.slug}" references unknown member "${slug}"`);
    }
    for (const slug of item.related_albums ?? []) {
      if (!albumSlugs.has(slug)) referenceErrors.push(`news "${item.slug}" references unknown album "${slug}"`);
    }
  }
  if (referenceErrors.length) {
    throw new Error(`News reference validation failed:\n- ${referenceErrors.join('\n- ')}`);
  }
}

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function formatIsoDate(value: string, precision: 'day' | 'month' | 'year' = 'day'): string {
  if (!isValidIsoDate(value)) throw new Error(`Invalid ISO date: ${value}`);
  const [year, month, day] = value.split('-').map(Number);
  if (precision === 'year') return String(year);
  if (precision === 'month') return `${monthNames[month - 1]} ${year}`;
  return `${day} ${monthNames[month - 1]} ${year}`;
}

export function formatAlbumDate(album: Album): string {
  if (!album.date) return '';
  const precision = album.date_precision;
  if (!precision || !isValidAlbumDate(album.date, precision)) {
    throw new Error(
      `Album "${album.slug}" has an invalid date/date_precision combination: ${String(album.date)}/${String(precision)}`,
    );
  }
  const [year, month, day] = album.date.split('-').map(Number);
  if (precision === 'year') return String(year);
  if (precision === 'month') return `${monthNames[month - 1]} ${year}`;
  return `${day} ${monthNames[month - 1]} ${year}`;
}

export function formatAlbumDateTime(album: Album): string | undefined {
  if (!album.date) return undefined;
  const precision = album.date_precision;
  if (!precision || !isValidAlbumDate(album.date, precision)) {
    throw new Error(
      `Album "${album.slug}" has an invalid date/date_precision combination: ${String(album.date)}/${String(precision)}`,
    );
  }
  return album.date;
}

export function formatNewsDate(item: NewsItem): string {
  return formatIsoDate(item.date);
}

let manifestCache: MediaManifest | null | undefined;

function readMediaManifest(): MediaManifest | null {
  if (manifestCache !== undefined) return manifestCache;
  const manifestPath = path.join(process.cwd(), 'public', 'media', 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    manifestCache = null;
    return null;
  }
  try {
    manifestCache = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as MediaManifest;
  } catch (error) {
    throw new Error(`Could not read generated media manifest at ${manifestPath}: ${String(error)}`);
  }
  return manifestCache;
}

function normalizeAssetKey(value: string): string {
  return value.replace(/^\/+/, '').split('?')[0];
}

export function getMediaImage(source: string): MediaImage {
  const manifest = readMediaManifest();
  if (!manifest) {
    throw new Error(
      `Generated media manifest is missing for "${source}". Run "npm run media" or "npm run build" first.`,
    );
  }
  const key = normalizeAssetKey(source);
  const image = manifest.images[key];
  if (!image) {
    throw new Error(
      `No generated media found for "${source}". Put the file in public/assets/images/ and run "npm run media".`,
    );
  }
  return image;
}

export function localAssetExists(publicPath: string): boolean {
  if (!publicPath.startsWith('/')) return false;
  return fs.existsSync(path.join(process.cwd(), 'public', normalizeAssetKey(publicPath)));
}
