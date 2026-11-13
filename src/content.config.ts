import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const localImage = z
  .string()
  .regex(
    /^\/assets\/images\/(?:[A-Za-z0-9_-][A-Za-z0-9._-]*\/)*[A-Za-z0-9_-][A-Za-z0-9._-]*\.(?:jpe?g|png|webp|svg)$/i,
    'must be a local image path under /assets/images/',
  )
  .refine(
    (value) => !value.split('/').includes('..'),
    'must not traverse directories',
  );

const localDocument = z
  .string()
  .regex(
    /^\/assets\/[A-Za-z0-9/._-]+\.pdf$/i,
    'must be a local PDF path under /assets/',
  );

const link = z.object({
  label: z.string().min(1),
  url: z.string().url(),
});

const slug = z
  .string()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'must be a lowercase URL slug');

const fullIsoDatePattern = /^(\d{4})-(\d{2})-(\d{2})$/;

function isRealIsoDate(value: string): boolean {
  const match = fullIsoDatePattern.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1 || month < 1 || month > 12 || day < 1) return false;
  const leap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const monthLengths = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day <= monthLengths[month - 1];
}

const isoDateString = z
  .string({
    error:
      'must be a quoted ISO date string (YYYY-MM-DD); unquoted YAML dates are not accepted because they cannot be validated before coercion',
  })
  .regex(fullIsoDatePattern, 'must use YYYY-MM-DD')
  .refine(isRealIsoDate, 'must be a real calendar date');

const members = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/members' }),
  schema: z
    .object({
      slug,
      name: z.string().min(1),
      chinese: z.string().min(1).optional(),
      role: z.string().min(1),
      group: z.string().min(1),
      group_order: z.number().int().nonnegative(),
      sort_order: z.number().int().nonnegative(),
      email: z.string().email().optional(),
      office: z.string().min(1).optional(),
      portrait: localImage.optional(),
      portrait_alt: z.string().min(1).optional(),
      profile_portrait: localImage.optional(),
      profile_portrait_alt: z.string().min(1).optional(),
      cv: localDocument.optional(),
      links: z.array(link).optional(),
    })
    .strict()
    .superRefine((data, ctx) => {
      if (data.portrait && !data.portrait_alt) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['portrait_alt'],
          message: 'portrait_alt is required when portrait is set',
        });
      }
      if (data.profile_portrait && !data.profile_portrait_alt) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['profile_portrait_alt'],
          message: 'profile_portrait_alt is required when profile_portrait is set',
        });
      }
    }),
});

const research = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/research' }),
  schema: z
    .object({
      slug,
      title: z.string().min(1),
      image: localImage,
      image_alt: z.string().min(1),
      summary: z.string().min(1),
      location: z.string().min(1).optional(),
      order: z.number().int().nonnegative(),
      goals: z.array(z.string().min(1)).optional(),
      contributions: z.array(z.string().min(1)).optional(),
      links: z.array(link).optional(),
    })
    .strict(),
});

const openingRole = z
  .object({
    id: slug,
    title: z.string().min(1),
    kind: z.enum(['PhD', 'Postdoc', 'Other']),
    status: z.enum(['open', 'closed', 'general_inquiry']),
    instructions: z.string().min(1),
    subject_prefix: z.string().min(1).optional(),
    materials: z.array(z.string().min(1)).min(1).optional(),
    formal_application_note: z.string().min(1).optional(),
    formal_materials: z.array(z.string().min(1)).optional(),
    external_url: z.string().url().optional(),
  })
  .strict();

const openings = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/openings' }),
  schema: z
    .object({
      title: z.string().min(1),
      intro: z.string().min(1),
      last_reviewed: isoDateString,
      review_note: z.string().min(1),
      contact: z.object({
        name: z.string().min(1),
        email: z.string().email(),
      }),
      roles: z.array(openingRole).min(1),
    })
    .strict()
    .superRefine((data, ctx) => {
      data.roles.forEach((role, index) => {
        if (role.status !== 'closed' && (!role.materials || role.materials.length === 0)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['roles', index, 'materials'],
            message: 'materials are required unless the role is closed',
          });
        }
      });
    }),
});

export const collections = { members, research, openings };
