#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import yaml from 'js-yaml';

const root = process.cwd();
const errors = [];
const warnings = [];
const publicDir = path.join(root, 'public');
const contentDir = path.join(root, 'src', 'content');
const dataDir = path.join(root, 'src', 'data');
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const imagePattern = /^\/assets\/images\/(?:[A-Za-z0-9_-][A-Za-z0-9._-]*\/)*[A-Za-z0-9_-][A-Za-z0-9._-]*\.(?:jpe?g|png|webp|svg)$/i;
const pdfPattern = /^\/assets\/[A-Za-z0-9/._-]+\.pdf$/i;
const datePattern = /^(\d{4})-(\d{2})-(\d{2})$/;
const monthPattern = /^(\d{4})-(\d{2})$/;
const yearPattern = /^(\d{4})$/;
const reservedMemberSlugs = new Set([
  'research',
  'people',
  'alumni',
  'publication',
  'gallery',
  'opening',
  'contact',
  'news',
  'activities',
  'sitemap.xml',
  'robots.txt',
  '404',
]);

function fail(message) {
  errors.push(message);
}

function warn(message) {
  warnings.push(message);
}

function isObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readJson(filename) {
  const fullPath = path.join(dataDir, filename);
  try {
    return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  } catch (error) {
    fail(`${filename}: could not read or parse JSON (${error instanceof Error ? error.message : String(error)})`);
    return null;
  }
}

function isRealYear(year) {
  return Number.isInteger(year) && year >= 1 && year <= 9999;
}

function daysInMonth(year, month) {
  if (month === 2) {
    const leap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    return leap ? 29 : 28;
  }
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

function validDate(value) {
  if (typeof value !== 'string') return false;
  const match = datePattern.exec(value);
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

function albumDateProblem(value, precision) {
  if (typeof precision !== 'string' || !['day', 'month', 'year'].includes(precision)) {
    return 'date_precision must be one of day, month or year';
  }
  if (typeof value !== 'string') return 'date must be a string';
  if (precision === 'year') {
    const match = yearPattern.exec(value);
    if (!match) return 'date must use YYYY when date_precision is year';
    if (!isRealYear(Number(match[1]))) return 'date must contain a real calendar year';
    return '';
  }
  if (precision === 'month') {
    const match = monthPattern.exec(value);
    if (!match) return 'date must use YYYY-MM when date_precision is month';
    if (!isRealYear(Number(match[1]))) return 'date must contain a real calendar year';
    const month = Number(match[2]);
    if (month < 1 || month > 12) return 'date must contain a real calendar month';
    return '';
  }
  if (!datePattern.test(value)) return 'date must use YYYY-MM-DD when date_precision is day';
  if (!validDate(value)) return 'date must be a real calendar date';
  return '';
}

function phoneDial(value) {
  const compact = value.replace(/[^\d+]/g, '');
  const dial = compact.replace(/^\+86(?:0)+/, '+86');
  return /^\+[1-9]\d{6,14}$/.test(dial) ? dial : '';
}

function validUrl(value) {
  if (typeof value !== 'string') return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

function validEmail(value) {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function requireString(object, key, label, options = {}) {
  const value = object?.[key];
  if (value === undefined || value === null) {
    if (!options.optional) fail(`${label}.${key}: required value is missing`);
    return false;
  }
  if (typeof value !== 'string' || !value.trim()) {
    fail(`${label}.${key}: must be a non-empty string`);
    return false;
  }
  if (options.pattern && !options.pattern.test(value)) {
    fail(`${label}.${key}: value "${value}" has an invalid format`);
    return false;
  }
  if (options.url && !validUrl(value)) {
    fail(`${label}.${key}: must be an absolute http(s) URL`);
    return false;
  }
  return true;
}

function requireNumber(object, key, label, options = {}) {
  const value = object?.[key];
  if (value === undefined || value === null) {
    if (!options.optional) fail(`${label}.${key}: required number is missing`);
    return false;
  }
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    fail(`${label}.${key}: must be a finite number`);
    return false;
  }
  if (options.integer && !Number.isInteger(value)) {
    fail(`${label}.${key}: must be an integer`);
    return false;
  }
  if (options.min !== undefined && value < options.min) {
    fail(`${label}.${key}: must be at least ${options.min}`);
    return false;
  }
  if (options.max !== undefined && value > options.max) {
    fail(`${label}.${key}: must be at most ${options.max}`);
    return false;
  }
  return true;
}

function requireOptionalString(object, key, label) {
  const value = object?.[key];
  if (value === undefined) return false;
  if (typeof value !== 'string' || !value.trim()) {
    fail(`${label}.${key}: must be a non-empty string when provided`);
    return false;
  }
  return true;
}

function requireArray(object, key, label, options = {}) {
  const value = object?.[key];
  if (value === undefined || value === null) {
    if (!options.optional) fail(`${label}.${key}: required array is missing`);
    return false;
  }
  if (!Array.isArray(value) || value.length === 0) {
    fail(`${label}.${key}: must be a non-empty array`);
    return false;
  }
  if (value.some((item) => typeof item !== 'string' || !item.trim())) {
    fail(`${label}.${key}: every item must be a non-empty string`);
    return false;
  }
  return true;
}

function checkKeys(object, allowed, label) {
  if (!isObject(object)) return;
  for (const key of Object.keys(object)) {
    if (!allowed.includes(key)) fail(`${label}: unknown field "${key}"`);
  }
}

function localFileExists(publicPath, label) {
  if (typeof publicPath !== 'string' || !publicPath.startsWith('/')) {
    fail(`${label}: must be a root-relative public path`);
    return false;
  }
  const relative = publicPath.replace(/^\/+/, '');
  if (relative.split('/').includes('..')) {
    fail(`${label}: path must not traverse directories`);
    return false;
  }
  const fullPath = path.join(publicDir, relative);
  if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) {
    fail(`${label}: local file is missing at public${publicPath}`);
    return false;
  }
  return true;
}

function checkImage(publicPath, label, optional = false) {
  if (publicPath === undefined || publicPath === null) {
    if (!optional) fail(`${label}: required image is missing`);
    return false;
  }
  if (!imagePattern.test(publicPath)) {
    fail(`${label}: must be an image under /assets/images/ with a supported extension`);
    return false;
  }
  return localFileExists(publicPath, label);
}

function parseMarkdownFile(filename) {
  const fullPath = path.join(contentDir, filename);
  const text = fs.readFileSync(fullPath, 'utf8');
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(text);
  if (!match) {
    fail(`${filename}: missing YAML frontmatter`);
    return { data: {}, body: text };
  }
  let data;
  try {
    // CORE_SCHEMA does not resolve implicit YAML timestamps, so date strings
    // reach validation before any Date coercion can normalize impossible dates.
    data = yaml.load(match[1], { schema: yaml.CORE_SCHEMA });
  } catch (error) {
    fail(`${filename}: invalid YAML frontmatter (${error instanceof Error ? error.message : String(error)})`);
    data = {};
  }
  if (!isObject(data)) {
    fail(`${filename}: frontmatter must be a YAML mapping`);
    data = {};
  }
  if (/<script\b|wp-block|class=["'][^"']*wp-|style=["']/i.test(match[2])) {
    fail(`${filename}: body contains residual WordPress/editor markup`);
  }
  return { data, body: match[2] };
}

function listMarkdown(directory) {
  const fullPath = path.join(contentDir, directory);
  if (!fs.existsSync(fullPath)) return [];
  return fs
    .readdirSync(fullPath)
    .filter((filename) => filename.endsWith('.md'))
    .sort((a, b) => a.localeCompare(b));
}

const settings = readJson('settings.json');
const publications = readJson('publications.json');
const alumni = readJson('alumni.json');
const albums = readJson('albums.json');
const news = readJson('news.json');
const activities = readJson('activities.json');

if (settings) {
  checkKeys(
    settings,
    [
      'name',
      'fullName',
      'institution',
      'institutionShort',
      'school',
      'domain',
      'description',
      'email',
      'phone',
      'address',
      'universityUrl',
      'homepage',
      'hero',
      'socialImage',
    ],
    'settings.json',
  );
  for (const key of [
    'name',
    'fullName',
    'institution',
    'institutionShort',
    'school',
    'description',
    'phone',
  ]) {
    requireString(settings, key, 'settings.json');
  }
  requireString(settings, 'domain', 'settings.json', { url: true });
  requireString(settings, 'universityUrl', 'settings.json', { url: true });
  if (!validEmail(settings.email)) fail('settings.json.email: must be a valid email address');
  const dial = typeof settings.phone === 'string' ? phoneDial(settings.phone) : '';
  if (!dial) {
    fail('settings.json.phone: must produce a valid international tel: URI');
  } else if (dial.includes('+860')) {
    fail('settings.json.phone: domestic trunk zero must be removed after the +86 country code');
  }
  requireArray(settings, 'address', 'settings.json');
  if (!isObject(settings.homepage)) {
    fail('settings.json.homepage: must be an object');
  } else {
    requireNumber(settings.homepage, 'newsLimit', 'settings.json.homepage', { integer: true, min: 1, max: 3 });
    requireNumber(settings.homepage, 'featuredLimit', 'settings.json.homepage', {
      integer: true,
      min: 1,
      max: 5,
    });
    requireNumber(settings.homepage, 'galleryPreviewLimit', 'settings.json.homepage', {
      integer: true,
      min: 1,
    });
    requireNumber(settings.homepage, 'activityPreviewLimit', 'settings.json.homepage', {
      integer: true,
      min: 1,
      max: 3,
    });
  }
  if (!isObject(settings.hero)) {
    fail('settings.json.hero: must be an object');
  } else if (!Array.isArray(settings.hero.slides) || settings.hero.slides.length === 0) {
    fail('settings.json.hero.slides: must be a non-empty array');
  } else {
    settings.hero.slides.forEach((slide, index) => {
      const label = `settings.json.hero.slides[${index}]`;
      if (!isObject(slide)) {
        fail(`${label}: must be an object`);
        return;
      }
      checkImage(slide.image, `${label}.image`);
      requireString(slide, 'alt', label);
      if (slide.caption !== undefined && typeof slide.caption !== 'string') {
        fail(`${label}.caption: must be a string`);
      }
    });
  }
  checkImage(settings.socialImage, 'settings.json.socialImage');
}

const publicationIds = new Set();
const yearOrders = new Set();
let featured = [];
if (publications) {
  if (!Array.isArray(publications)) {
    fail('publications.json: root must be an array');
  } else {
    publications.forEach((item, index) => {
      const label = `publications.json[${index}]`;
      if (!isObject(item)) {
        fail(`${label}: must be an object`);
        return;
      }
      checkKeys(
        item,
        ['id', 'title', 'authors', 'year', 'venue', 'url', 'order', 'featured', 'featured_order'],
        label,
      );
      if (requireString(item, 'id', label, { pattern: slugPattern })) {
        if (publicationIds.has(item.id)) fail(`${label}.id: duplicate publication id "${item.id}"`);
        publicationIds.add(item.id);
      }
      requireString(item, 'title', label);
      requireString(item, 'authors', label);
      requireNumber(item, 'year', label, { integer: true, min: 1900, max: 2100 });
      requireString(item, 'venue', label);
      requireString(item, 'url', label, { url: true });
      requireNumber(item, 'order', label, { integer: true, min: 0 });
      if (typeof item.year === 'number' && typeof item.order === 'number') {
        const key = `${item.year}:${item.order}`;
        if (yearOrders.has(key)) {
          fail(`${label}: duplicate explicit secondary order ${item.order} within year ${item.year}`);
        }
        yearOrders.add(key);
      }
      if (typeof item.featured !== 'boolean') {
        fail(`${label}.featured: must be true or false`);
      } else if (item.featured) {
        featured.push(item);
        requireNumber(item, 'featured_order', label, { integer: true, min: 1 });
      } else if (item.featured_order !== undefined) {
        fail(`${label}.featured_order: must be omitted when featured is false`);
      }
    });
    if (settings?.homepage) {
      const expected = settings.homepage.featuredLimit;
      if (featured.length !== expected) {
        fail(`publications.json: expected ${expected} featured papers, found ${featured.length}`);
      }
      const orders = featured.map((item) => item.featured_order).sort((a, b) => a - b);
      if (new Set(orders).size !== orders.length) {
        fail('publications.json: featured_order values must be unique');
      }
      if (orders.some((value, index) => value !== index + 1)) {
        fail('publications.json: featured_order values must be contiguous starting at 1');
      }
    }
  }
}

if (alumni) {
  if (!Array.isArray(alumni)) {
    fail('alumni.json: root must be an array');
  } else {
    alumni.forEach((item, index) => {
      const label = `alumni.json[${index}]`;
      if (!isObject(item)) {
        fail(`${label}: must be an object`);
        return;
      }
      checkKeys(item, ['name', 'role', 'period', 'destination', 'sort_order'], label);
      requireString(item, 'name', label);
      requireString(item, 'role', label);
      if (item.period !== undefined) requireString(item, 'period', label);
      if (item.destination !== undefined) requireString(item, 'destination', label);
      requireNumber(item, 'sort_order', label, { integer: true, min: 0 });
    });
  }
}

const albumSlugs = new Set();
if (albums) {
  if (!Array.isArray(albums)) {
    fail('albums.json: root must be an array');
  } else {
    albums.forEach((album, index) => {
      const label = `albums.json[${index}]`;
      if (!isObject(album)) {
        fail(`${label}: must be an object`);
        return;
      }
      checkKeys(
        album,
        ['slug', 'title', 'category', 'date', 'date_precision', 'location', 'description', 'cover', 'photos'],
        label,
      );
      if (requireString(album, 'slug', label, { pattern: slugPattern })) {
        if (albumSlugs.has(album.slug)) fail(`${label}.slug: duplicate album slug "${album.slug}"`);
        albumSlugs.add(album.slug);
      }
      requireString(album, 'title', label);
      requireString(album, 'category', label);
      if (
        typeof album.category === 'string' &&
        !['Conference', 'Workshop', 'Group Life', 'Outing'].includes(album.category)
      ) {
        fail(`${label}.category: must be Conference, Workshop, Group Life or Outing`);
      }
      if (album.date === undefined && album.date_precision === undefined) {
        // Unknown date: both fields are intentionally absent.
      } else if (album.date === undefined) {
        fail(`${label}.date: required when date_precision is set`);
      } else if (album.date_precision === undefined) {
        fail(`${label}.date_precision: required when date is set (day, month or year)`);
      } else {
        const problem = albumDateProblem(album.date, album.date_precision);
        if (problem) fail(`${label}.date: ${problem}`);
      }
      checkImage(album.cover, `${label}.cover`);
      if (!Array.isArray(album.photos) || album.photos.length === 0) {
        fail(`${label}.photos: must have at least one photograph`);
      } else {
        album.photos.forEach((photo, photoIndex) => {
          const photoLabel = `${label}.photos[${photoIndex}]`;
          if (!isObject(photo)) {
            fail(`${photoLabel}: must be an object`);
            return;
          }
          checkKeys(photo, ['image', 'alt', 'caption', 'credit'], photoLabel);
          checkImage(photo.image, `${photoLabel}.image`);
          requireString(photo, 'alt', photoLabel);
          if (photo.caption !== undefined) requireString(photo, 'caption', photoLabel);
          if (photo.credit !== undefined) requireString(photo, 'credit', photoLabel);
        });
        if (!album.photos.some((photo) => photo.image === album.cover)) {
          fail(`${label}.cover: must match one of the album photographs`);
        }
      }
    });
  }
}

const memberSlugs = new Set();
const memberFiles = listMarkdown('members');
for (const filename of memberFiles) {
  const fileLabel = `src/content/members/${filename}`;
  const { data, body } = parseMarkdownFile(path.join('members', filename));
  checkKeys(
    data,
    [
      'slug',
      'name',
      'chinese',
      'role',
      'group',
      'group_order',
      'sort_order',
      'email',
      'office',
      'portrait',
      'portrait_alt',
      'profile_portrait',
      'profile_portrait_alt',
      'cv',
      'links',
    ],
    fileLabel,
  );
  if (requireString(data, 'slug', fileLabel, { pattern: slugPattern })) {
    if (memberSlugs.has(data.slug)) fail(`${fileLabel}: duplicate member slug "${data.slug}"`);
    if (reservedMemberSlugs.has(data.slug)) fail(`${fileLabel}: slug "${data.slug}" collides with a static route`);
    const expected = path.basename(filename, '.md');
    if (data.slug !== expected) fail(`${fileLabel}: slug "${data.slug}" must match filename "${expected}"`);
    memberSlugs.add(data.slug);
  }
  requireString(data, 'name', fileLabel);
  requireString(data, 'role', fileLabel);
  requireString(data, 'group', fileLabel);
  requireNumber(data, 'group_order', fileLabel, { integer: true, min: 0 });
  requireNumber(data, 'sort_order', fileLabel, { integer: true, min: 0 });
  if (data.email !== undefined && !validEmail(data.email)) fail(`${fileLabel}: email is invalid`);
  if (data.office !== undefined) requireString(data, 'office', fileLabel);
  if (data.portrait !== undefined) {
    checkImage(data.portrait, `${fileLabel}: portrait`);
    requireString(data, 'portrait_alt', fileLabel);
  } else if (data.portrait_alt !== undefined) {
    fail(`${fileLabel}: portrait_alt must be omitted when portrait is omitted`);
  }
  if (data.profile_portrait !== undefined) {
    checkImage(data.profile_portrait, `${fileLabel}: profile_portrait`);
    requireString(data, 'profile_portrait_alt', fileLabel);
  } else if (data.profile_portrait_alt !== undefined) {
    fail(`${fileLabel}: profile_portrait_alt must be omitted when profile_portrait is omitted`);
  }
  if (data.cv !== undefined) {
    if (!pdfPattern.test(data.cv)) fail(`${fileLabel}: cv must be a local PDF path`);
    else localFileExists(data.cv, `${fileLabel}: cv`);
  }
  if (data.links !== undefined) {
    if (!Array.isArray(data.links)) fail(`${fileLabel}: links must be an array`);
    else {
      data.links.forEach((link, index) => {
        if (!isObject(link) || !requireString(link, 'label', `${fileLabel}.links[${index}]`) ||
            !requireString(link, 'url', `${fileLabel}.links[${index}]`, { url: true })) {
          fail(`${fileLabel}.links[${index}]: must contain label and absolute URL`);
        }
      });
    }
  }
  if (!body.trim() && data.slug !== 'xiaoling-cheng') {
    warn(`${fileLabel}: body is empty`);
  }
}

const researchSlugs = new Set();
const researchOrders = new Set();
for (const filename of listMarkdown('research')) {
  const fileLabel = `src/content/research/${filename}`;
  const { data, body } = parseMarkdownFile(path.join('research', filename));
  checkKeys(
    data,
    ['slug', 'title', 'image', 'image_alt', 'summary', 'location', 'order', 'goals', 'contributions', 'links'],
    fileLabel,
  );
  if (requireString(data, 'slug', fileLabel, { pattern: slugPattern })) {
    if (researchSlugs.has(data.slug)) fail(`${fileLabel}: duplicate research slug "${data.slug}"`);
    researchSlugs.add(data.slug);
  }
  requireString(data, 'title', fileLabel);
  checkImage(data.image, `${fileLabel}: image`);
  requireString(data, 'image_alt', fileLabel);
  requireString(data, 'summary', fileLabel);
  requireNumber(data, 'order', fileLabel, { integer: true, min: 0 });
  if (typeof data.order === 'number') {
    if (researchOrders.has(data.order)) fail(`${fileLabel}: duplicate research order ${data.order}`);
    researchOrders.add(data.order);
  }
  if (data.location !== undefined) requireString(data, 'location', fileLabel);
  for (const key of ['goals', 'contributions']) {
    if (data[key] !== undefined) requireArray(data, key, fileLabel);
  }
  if (data.links !== undefined) {
    if (!Array.isArray(data.links)) fail(`${fileLabel}: links must be an array`);
    else {
      data.links.forEach((link, index) => {
        if (!isObject(link) || !requireString(link, 'label', `${fileLabel}.links[${index}]`) ||
            !requireString(link, 'url', `${fileLabel}.links[${index}]`, { url: true })) {
          fail(`${fileLabel}.links[${index}]: must contain label and absolute URL`);
        }
      });
    }
  }
  if (!body.trim()) fail(`${fileLabel}: research body is required`);
}

const openingFiles = listMarkdown('openings');
if (openingFiles.length === 0) fail('src/content/openings: positions.md is missing');
for (const filename of openingFiles) {
  const fileLabel = `src/content/openings/${filename}`;
  const { data, body } = parseMarkdownFile(path.join('openings', filename));
  checkKeys(data, ['title', 'intro', 'last_reviewed', 'review_note', 'contact', 'roles'], fileLabel);
  requireString(data, 'title', fileLabel);
  requireString(data, 'intro', fileLabel);
  requireString(data, 'review_note', fileLabel);
  if (typeof data.last_reviewed !== 'string') {
    fail(`${fileLabel}: last_reviewed must be a quoted ISO date string (YYYY-MM-DD)`);
  } else if (!validDate(data.last_reviewed)) {
    fail(`${fileLabel}: last_reviewed must be a real ISO date (YYYY-MM-DD), received "${data.last_reviewed}"`);
  }
  if (!isObject(data.contact)) {
    fail(`${fileLabel}: contact must be an object`);
  } else {
    requireString(data.contact, 'name', `${fileLabel}.contact`);
    if (!validEmail(data.contact.email)) fail(`${fileLabel}.contact.email: must be a valid email`);
  }
  if (!Array.isArray(data.roles) || data.roles.length === 0) {
    fail(`${fileLabel}: roles must be a non-empty array`);
  } else {
    const roleIds = new Set();
    data.roles.forEach((role, index) => {
      const roleLabel = `${fileLabel}.roles[${index}]`;
      if (!isObject(role)) {
        fail(`${roleLabel}: must be an object`);
        return;
      }
      checkKeys(
        role,
        [
          'id',
          'title',
          'kind',
          'status',
          'instructions',
          'subject_prefix',
          'materials',
          'formal_application_note',
          'formal_materials',
          'external_url',
        ],
        roleLabel,
      );
      if (requireString(role, 'id', roleLabel, { pattern: slugPattern })) {
        if (roleIds.has(role.id)) fail(`${roleLabel}.id: duplicate role id "${role.id}"`);
        roleIds.add(role.id);
      }
      requireString(role, 'title', roleLabel);
      if (!['PhD', 'Postdoc', 'Other'].includes(role.kind)) fail(`${roleLabel}.kind: invalid role kind`);
      if (!['open', 'closed', 'general_inquiry'].includes(role.status)) {
        fail(`${roleLabel}.status: must be open, closed or general_inquiry`);
      }
      requireString(role, 'instructions', roleLabel);
      if (role.materials !== undefined) {
        requireArray(role, 'materials', roleLabel);
      } else if (role.status !== 'closed') {
        fail(`${roleLabel}.materials: required unless status is closed`);
      }
      if (role.formal_application_note !== undefined) requireString(role, 'formal_application_note', roleLabel);
      if (role.formal_materials !== undefined) requireArray(role, 'formal_materials', roleLabel);
      if ((role.formal_application_note === undefined) !== (role.formal_materials === undefined)) {
        fail(`${roleLabel}: formal_application_note and formal_materials must be provided together`);
      }
      if (role.external_url !== undefined && !validUrl(role.external_url)) {
        fail(`${roleLabel}.external_url: must be an absolute http(s) URL`);
      }
    });
  }
  if (!body.trim()) warn(`${fileLabel}: body is empty`);
}

const newsSlugs = new Set();
if (news) {
  if (!Array.isArray(news)) {
    fail('news.json: root must be an array');
  } else {
    news.forEach((item, index) => {
      const label = `news.json[${index}]`;
      if (!isObject(item)) {
        fail(`${label}: must be an object`);
        return;
      }
      checkKeys(
        item,
        [
          'slug',
          'title',
          'date',
          'event_date',
          'category',
          'summary',
          'status',
          'editorial_preview',
          'preview_note',
          'body',
          'image',
          'image_alt',
          'related_publications',
          'related_members',
          'related_albums',
          'source_url',
          'source_label',
        ],
        label,
      );
      if (requireString(item, 'slug', label, { pattern: slugPattern })) {
        if (newsSlugs.has(item.slug)) fail(`${label}.slug: duplicate news slug "${item.slug}"`);
        newsSlugs.add(item.slug);
      }
      requireString(item, 'title', label);
      if (!validDate(item.date)) fail(`${label}.date: must be a real announcement date`);
      if (item.event_date !== undefined && !validDate(item.event_date)) {
        fail(`${label}.event_date: must be a real event date`);
      }
      requireString(item, 'category', label);
      requireString(item, 'summary', label);
      if (!['draft', 'published'].includes(item.status)) fail(`${label}.status: must be draft or published`);
      if (item.editorial_preview !== undefined && typeof item.editorial_preview !== 'boolean') {
        fail(`${label}.editorial_preview: must be a boolean`);
      }
      if (item.preview_note !== undefined) requireString(item, 'preview_note', label);
      if (item.editorial_preview && item.preview_note === undefined) {
        fail(`${label}.preview_note: required when editorial_preview is true`);
      }
      if (!item.editorial_preview && item.preview_note !== undefined) {
        fail(`${label}.preview_note: must be omitted unless editorial_preview is true`);
      }
      if (item.body !== undefined) requireString(item, 'body', label);
      if (item.image !== undefined) {
        checkImage(item.image, `${label}.image`);
        requireString(item, 'image_alt', label);
      } else if (item.image_alt !== undefined) {
        fail(`${label}.image_alt: must be omitted when image is omitted`);
      }
      for (const key of ['related_publications', 'related_members', 'related_albums']) {
        if (item[key] !== undefined) requireArray(item, key, label, { optional: true });
      }
      if (item.source_url !== undefined) {
        requireString(item, 'source_url', label, { url: true });
        requireString(item, 'source_label', label);
      } else if (item.source_label !== undefined) {
        fail(`${label}.source_label: must be omitted when source_url is omitted`);
      }
      for (const id of item.related_publications ?? []) {
        if (!publicationIds.has(id)) fail(`${label}.related_publications: unknown publication id "${id}"`);
      }
      for (const slug of item.related_members ?? []) {
        if (!memberSlugs.has(slug)) fail(`${label}.related_members: unknown member slug "${slug}"`);
      }
      for (const slug of item.related_albums ?? []) {
        if (!albumSlugs.has(slug)) fail(`${label}.related_albums: unknown album slug "${slug}"`);
      }
    });
  }
}

const activitySlugs = new Set();
const activityCategories = ['Seminar', 'External Talk', 'Undergraduate Lecture'];
if (!Array.isArray(activities)) {
  fail('activities.json: root must be an array');
} else {
  activities.forEach((item, index) => {
    const label = `activities.json[${index}]`;
    if (!isObject(item)) {
      fail(`${label}: must be an object`);
      return;
    }
    checkKeys(
      item,
      [
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
      ],
      label,
    );
    if (requireString(item, 'slug', label, { pattern: slugPattern })) {
      if (activitySlugs.has(item.slug)) fail(`${label}.slug: duplicate activity slug "${item.slug}"`);
      activitySlugs.add(item.slug);
    }
    requireString(item, 'title', label);
    if (typeof item.category !== 'string' || !activityCategories.includes(item.category)) {
      fail(`${label}.category: must be Seminar, External Talk or Undergraduate Lecture`);
    }
    requireString(item, 'summary', label);
    if (!['draft', 'published'].includes(item.status)) {
      fail(`${label}.status: must be draft or published`);
    }
    if (item.date !== undefined && !validDate(item.date)) {
      fail(`${label}.date: must be a real event date (YYYY-MM-DD)`);
    }
    for (const key of ['time', 'speaker', 'affiliation', 'host', 'venue', 'body']) {
      requireOptionalString(item, key, label);
    }
    if (item.image !== undefined) {
      checkImage(item.image, `${label}.image`);
      requireString(item, 'image_alt', label);
    } else if (item.image_alt !== undefined) {
      fail(`${label}.image_alt: must be omitted when image is omitted`);
    }
    if (item.photos !== undefined) {
      if (!Array.isArray(item.photos) || item.photos.length === 0) {
        fail(`${label}.photos: must be a non-empty array`);
      } else {
        item.photos.forEach((photo, photoIndex) => {
          const photoLabel = `${label}.photos[${photoIndex}]`;
          if (!isObject(photo)) {
            fail(`${photoLabel}: must be an object`);
            return;
          }
          checkKeys(photo, ['image', 'alt', 'caption'], photoLabel);
          checkImage(photo.image, `${photoLabel}.image`);
          requireString(photo, 'alt', photoLabel);
          requireOptionalString(photo, 'caption', photoLabel);
        });
      }
    }
    if (item.source_url !== undefined) {
      requireString(item, 'source_url', label, { url: true });
      requireString(item, 'source_label', label);
    } else if (item.source_label !== undefined) {
      fail(`${label}.source_label: must be omitted when source_url is omitted`);
    }
    if (item.related_albums !== undefined) {
      if (requireArray(item, 'related_albums', label)) {
        for (const slug of item.related_albums) {
          if (!slugPattern.test(slug)) {
            fail(`${label}.related_albums: "${slug}" must be a lowercase album slug`);
          } else if (!albumSlugs.has(slug)) {
            fail(`${label}.related_albums: unknown album slug "${slug}"`);
          }
        }
      }
    }
  });
}

if (warnings.length) {
  console.warn(`Content warnings:\n- ${warnings.join('\n- ')}`);
}

if (errors.length) {
  console.error(`Content validation failed with ${errors.length} error(s):\n- ${errors.join('\n- ')}`);
  process.exit(1);
}

console.log(
  [
    'Content validation passed.',
    `${memberFiles.length} members`,
    `${listMarkdown('research').length} research projects`,
    `${openingFiles.length} openings record(s)`,
    `${Array.isArray(alumni) ? alumni.length : 0} alumni`,
    `${Array.isArray(publications) ? publications.length : 0} publications (${featured.length} featured)`,
    `${Array.isArray(albums) ? albums.length : 0} gallery albums`,
    `${Array.isArray(news) ? news.length : 0} news items`,
    `${Array.isArray(activities) ? activities.length : 0} activities`,
  ].join(' '),
);
