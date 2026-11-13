"""Independent acceptance of Activities using disposable content-only fixtures."""
import argparse
import copy
from contextlib import contextmanager
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
from audit_static import Parser, norm


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('project', type=Path)
    args = parser.parse_args()
    project = args.project.resolve()
    reports = []
    with tempfile.TemporaryDirectory(prefix='group-activities-qa-') as directory:
        target = Path(directory)
        shutil.copytree(project, target, dirs_exist_ok=True, ignore=shutil.ignore_patterns(
            '.git', 'node_modules', 'dist', '.astro', 'media', '__pycache__', 'qa'))
        for ancestor in [project, *project.parents]:
            dependencies = ancestor / 'node_modules'
            if (dependencies / 'sharp/package.json').is_file() and (dependencies / 'js-yaml/package.json').is_file():
                (target / 'node_modules').symlink_to(dependencies, target_is_directory=True)
                break
        else:
            raise SystemExit('Run npm ci before this acceptance probe.')

        @contextmanager
        def edit(*names):
            old = {name: (target / name).read_bytes() if (target / name).exists() else None for name in names}
            try:
                yield
            finally:
                for name, value in old.items():
                    file = target / name
                    if value is None:
                        file.unlink(missing_ok=True)
                    else:
                        file.write_bytes(value)

        def save(name, value):
            (target / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

        def html(name):
            return (target / 'dist' / name).read_text()

        def insist(condition, message):
            if not condition:
                raise AssertionError(message)

        def run(name, build=False, expected=True, verify=None):
            result = subprocess.run(['npm', 'run', 'build' if build else 'check'], cwd=target,
                                    capture_output=True, text=True,
                                    env={**os.environ, 'ASTRO_TELEMETRY_DISABLED': '1'})
            passed = (result.returncode == 0) == expected
            if not expected:
                passed = passed and 'Content validation failed' in result.stdout + result.stderr
            detail = ''
            if passed and verify:
                try:
                    verify()
                except Exception as error:
                    passed = False
                    detail = str(error)
            report = dict(name=name, status='PASS' if passed else 'FAIL',
                          exit_code=result.returncode, expected_success=expected,
                          detail=detail, output_tail=(result.stdout + result.stderr)[-1800:])
            reports.append(report)
            print(json.dumps({k: v for k, v in report.items() if k != 'output_tail'}), flush=True)

        def verify_baseline():
            home = html('index.html')
            ids = ['home-title', 'about-title', 'latest-news-title', 'research-overview-title',
                   'activities-preview-title', 'featured-publications-title', 'gallery-preview-title']
            positions = [home.index('id="' + value + '"') for value in ids]
            insist(positions == sorted(positions), 'Homepage sections are out of the requested order')
            insist('openings-cta-title' not in home, 'Extra Join Us band follows Gallery')
            insist('href="/activities/"' in home, 'Homepage Activities link missing')
            index = html('activities/index.html')
            for label in ['seminar', 'external talk', 'undergraduate lecture']:
                insist(label in norm(Parser(index).root.text()).lower(), 'Activity type not explained: ' + label)
            insist('https://yegroup.cuhk.edu.cn/activities/' in html('sitemap.xml'), 'Activities index missing from sitemap')
            for name in ['index.html', 'activities/index.html', 'news/index.html', 'people/index.html']:
                tree = Parser(html(name)).root
                nav = tree.find(lambda n: n.tag == 'nav' and n.attrs.get('aria-label') == 'Primary navigation')
                insist(len(nav) == 1 and len(nav[0].find(lambda n: n.tag == 'a')) == 8,
                       'Expected eight global navigation links: ' + name)
            for name in ['activities/index.html']:
                tree = Parser(html(name)).root
                insist(bool(tree.find(lambda n: n.tag == 'a' and n.attrs.get('href') == '/activities/'
                                      and n.attrs.get('aria-current') == 'page')), 'Active Activities navigation missing')

        run('empty-activities-visible-and-homepage-order', build=True, verify=verify_baseline)
        fixture = [
            dict(slug='qa-undated-activity', title='QA Undated Activity', category='Seminar',
                 summary='Disposable undated fixture.', status='published'),
            dict(slug='qa-external-talk', title='QA External Talk', category='External Talk',
                 summary='Disposable external talk.', status='published', date='2026-09-05'),
            dict(slug='qa-hidden-activity', title='QA Hidden Activity Draft', category='Seminar',
                 summary='Disposable draft.', status='draft', date='2026-12-01'),
            dict(slug='qa-latest-seminar', title='QA Latest Seminar', category='Seminar',
                 summary='Disposable full seminar.', status='published', date='2026-11-10',
                 time='14:00–15:00 (UTC+8)', speaker='QA Speaker', affiliation='QA Institution',
                 host='QA Host', venue='QA Room', body='First paragraph.\n\n<script id="qa-injected">bad()</script>',
                 image='/assets/images/logo/logo_standard.png', image_alt='QA poster fixture.',
                 source_url='https://example.org/qa-event', source_label='QA Event Website',
                 related_albums=['group-photo-2025-01-10']),
            dict(slug='qa-undergraduate-lecture', title='QA Undergraduate Lecture',
                 category='Undergraduate Lecture', summary='Disposable undergraduate lecture.',
                 status='published', date='2026-10-15'),
        ]
        data = 'src/data/activities.json'
        with edit(data):
            save(data, fixture)

            def verify_records():
                home = html('index.html')
                index = html('activities/index.html')
                sitemap = html('sitemap.xml')
                titles = ['QA Latest Seminar', 'QA Undergraduate Lecture', 'QA External Talk']
                insist([home.index(title) for title in titles] == sorted(home.index(title) for title in titles),
                       'Homepage activity preview is not newest first')
                insist('QA Undated Activity' not in home, 'Homepage exceeds default activity preview limit')
                for item in fixture:
                    route = target / 'dist/activities' / item['slug'] / 'index.html'
                    if item['status'] == 'draft':
                        insist(item['title'] not in home + index + sitemap and not route.exists(), 'Activity draft leaked')
                    else:
                        insist(item['title'] in index and route.is_file(), 'Content-only activity missing: ' + item['slug'])
                        insist('/activities/' + item['slug'] + '/' in sitemap, 'Activity detail missing from sitemap')
                body = html('activities/qa-latest-seminar/index.html')
                for text in ['QA Speaker', 'QA Institution', 'QA Host', 'QA Room', '14:00', 'QA Event Website']:
                    insist(text in body, 'Optional activity metadata missing: ' + text)
                insist('href="/gallery/group-photo-2025-01-10/"' in body, 'Related album link missing')
                insist('<script id="qa-injected">' not in body and '&lt;script' in body, 'Activity body is not escaped')
                undated = Parser(html('activities/qa-undated-activity/index.html')).root
                main = undated.find(lambda n: n.tag == 'main')[0]
                insist(not main.find(lambda n: n.tag == 'time'), 'Unknown date invented')
                insist('undefined' not in main.text() and 'null' not in main.text(), 'Absent optional field leaked')
                insist(not main.find(lambda n: n.tag in {'h2', 'h3'} and not norm(n.text())), 'Empty optional heading')

            run('content-only-additions-sort-limit-drafts-metadata-and-escaping', build=True, verify=verify_records)
            with edit('src/data/settings.json'):
                settings = json.loads((target / 'src/data/settings.json').read_text())
                settings['homepage']['activityPreviewLimit'] = 2
                save('src/data/settings.json', settings)
                run('configurable-activity-preview-limit', build=True, verify=lambda: insist(
                    'QA Latest Seminar' in html('index.html') and 'QA Undergraduate Lecture' in html('index.html')
                    and 'QA External Talk' not in html('index.html'), 'Activity limit is ignored'))

        with edit(data):
            save(data, [fixture[2]])
            run('draft-only-activities-still-have-visible-homepage-entry', build=True, verify=lambda: insist(
                'activities-preview-title' in html('index.html') and 'QA Hidden Activity Draft' not in
                html('index.html') + html('activities/index.html') + html('sitemap.xml'), 'Draft-only empty state failed'))

        invalid = [
            ('reject-null-activities-root', None),
            ('reject-false-activities-root', False),
            ('reject-zero-activities-root', 0),
            ('reject-empty-string-activities-root', ''),
            ('reject-object-activities-root', {}),
            ('reject-duplicate-activity-slugs', [fixture[0], fixture[0]]),
            ('reject-impossible-activity-date', [{**fixture[0], 'date': '2026-02-30'}]),
            ('reject-unknown-activity-category', [{**fixture[0], 'category': 'Outing'}]),
            ('reject-invalid-activity-status', [{**fixture[0], 'status': 'scheduled'}]),
            ('reject-activity-missing-title', [{k: v for k, v in fixture[0].items() if k != 'title'}]),
            ('reject-activity-wrong-optional-type', [{**fixture[0], 'speaker': 123}]),
            ('reject-missing-activity-image', [{**fixture[0], 'image': '/assets/images/qa-missing.jpg', 'image_alt': 'QA'}]),
            ('reject-unlabelled-activity-image', [{**fixture[0], 'image': '/assets/images/logo/logo_standard.png'}]),
            ('reject-orphan-activity-album', [{**fixture[0], 'related_albums': ['qa-missing-album']}]),
            ('reject-unsafe-activity-source-url', [{**fixture[0], 'source_url': 'javascript:alert(1)', 'source_label': 'QA'}]),
            ('reject-unknown-activity-field', [{**fixture[0], 'invented_field': 'QA'}]),
        ]
        for name, value in invalid:
            with edit(data):
                save(data, value)
                run(name, expected=False)
        for limit in [0, 6]:
            with edit('src/data/settings.json'):
                settings = json.loads((target / 'src/data/settings.json').read_text())
                settings['homepage']['activityPreviewLimit'] = limit
                save('src/data/settings.json', settings)
                run('reject-activity-preview-limit-' + str(limit), expected=False)
        member = 'src/content/members/activities.md'
        with edit(member):
            (target / member).write_text('---\nslug: activities\nname: QA Collision\nrole: Visitor\ngroup: Visitors\ngroup_order: 99\nsort_order: 1\n---\nQA only.\n')
            run('reject-member-route-collision-with-activities', expected=False)

    results = Path(__file__).resolve().parent / 'results'
    results.mkdir(exist_ok=True)
    (results / 'activities-fixtures.json').write_text(json.dumps(reports, ensure_ascii=False, indent=2) + '\n')
    failed = [report['name'] for report in reports if report['status'] == 'FAIL']
    print(json.dumps(dict(cases=len(reports), failed=failed), indent=2))
    if failed:
        raise SystemExit(1)


if __name__ == '__main__':
    main()
