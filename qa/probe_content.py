"""Independent supervisor probes using disposable content-only fixtures."""
from contextlib import contextmanager
from pathlib import Path
import argparse
import copy
import json
import os
import re
import shutil
import subprocess
import tempfile

ROOT=Path(__file__).resolve().parent

def main():
    parser=argparse.ArgumentParser();parser.add_argument('project',type=Path);args=parser.parse_args()
    target=Path(tempfile.mkdtemp(prefix='group-page-qa-'))
    shutil.copytree(args.project,target,dirs_exist_ok=True,ignore=shutil.ignore_patterns('.git','node_modules','dist','.astro','media','__pycache__'))
    for ancestor in [args.project.resolve(), *args.project.resolve().parents]:
        dependencies=ancestor/'node_modules'
        if dependencies.is_dir():
            (target/'node_modules').symlink_to(dependencies,target_is_directory=True)
            break
    else:raise SystemExit('Install project dependencies with npm ci before running content probes.')
    reports=[]
    def run(name,expect_success=True,build=False,verify=None):
        cmd=['npm','run','build' if build else 'check']
        result=subprocess.run(cmd,cwd=target,capture_output=True,text=True,env={**os.environ,'ASTRO_TELEMETRY_DISABLED':'1'})
        success=(result.returncode==0)==expect_success
        error=''
        if success and verify:
            try:verify()
            except Exception as exc: success=False;error=str(exc)
        report={'name':name,'status':'PASS' if success else 'FAIL','exit_code':result.returncode,'expected_success':expect_success,'detail':error,'output_tail':(result.stdout+result.stderr)[-1400:]}
        reports.append(report);print(json.dumps({k:v for k,v in report.items() if k!='output_tail'}),flush=True)
    @contextmanager
    def edit(files):
        old={name:(target/name).read_bytes() if (target/name).exists() else None for name in files}
        try:yield
        finally:
            for name,body in old.items():
                path=target/name
                if body is None:
                    if path.exists():path.unlink()
                else:path.write_bytes(body)
    def load(name):return json.loads((target/'src/data'/name).read_text())
    def save(name,value):(target/'src/data'/name).write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n')
    def html(name):return (target/'dist'/name).read_text()
    def insist(condition,message):
        if not condition:raise AssertionError(message)

    run('baseline-validation')
    with edit(['src/data/publications.json']):
        records=load('publications.json');records.append(copy.deepcopy(records[0]));save('publications.json',records)
        run('reject-duplicate-publication-id',False)
    with edit(['src/data/news.json']):
        save('news.json',[{'slug':'qa-invalid-date','title':'QA invalid','date':'2026-02-30','category':'Test','summary':'Test only.','status':'published'}])
        run('reject-impossible-news-date',False)
    with edit(['src/data/news.json']):
        save('news.json',[{'slug':'qa-orphan','title':'QA orphan','date':'2026-11-01','category':'Test','summary':'Test only.','status':'published','related_publications':['nonexistent-id']}])
        run('reject-orphan-news-reference',False)
    with edit(['src/data/settings.json']):
        settings=load('settings.json');settings['homepage']['newsLimit']=6;save('settings.json',settings)
        run('reject-homepage-news-limit-over-five',False)
    with edit(['src/data/albums.json']):
        albums=load('albums.json');albums[0]['photos'][0]['image']='/assets/images/does-not-exist.jpg';save('albums.json',albums)
        run('reject-missing-image',False)
    with edit(['src/content/members/qa-duplicate.md']):
        (target/'src/content/members/qa-duplicate.md').write_bytes((target/'src/content/members/haoyun-liu.md').read_bytes())
        run('reject-duplicate-member-slug',False)
    with edit(['src/content/openings/positions.md']):
        path=target/'src/content/openings/positions.md'
        path.write_text(re.sub(r'^last_reviewed:.*$', 'last_reviewed: 2026-02-30',path.read_text(),flags=re.M))
        run('reject-impossible-unquoted-frontmatter-date',False)
        run('build-rejects-impossible-unquoted-frontmatter-date',False,build=True)
    with edit(['src/content/openings/positions.md']):
        path=target/'src/content/openings/positions.md'
        path.write_text(re.sub(r'^last_reviewed:.*$', 'last_reviewed: \"2026-02-30\"',path.read_text(),flags=re.M))
        run('reject-impossible-quoted-frontmatter-date',False)
        run('build-rejects-impossible-quoted-frontmatter-date',False,build=True)
    with edit(['src/data/albums.json']):
        albums=load('albums.json');albums[0]['date']='2025-01';albums[0]['date_precision']='month';save('albums.json',albums)
        run('support-truthful-month-only-album-date',build=True,verify=lambda:insist('<time datetime=\"2025-01\">January 2025</time>' in html('gallery/index.html'),'Month precision lost'))
    with edit(['src/data/albums.json']):
        albums=load('albums.json');albums[0]['date']='2025';albums[0]['date_precision']='year';save('albums.json',albums)
        run('support-truthful-year-only-album-date',build=True,verify=lambda:insist('<time datetime=\"2025\">2025</time>' in html('gallery/index.html'),'Year precision lost'))
    with edit(['src/data/albums.json']):
        albums=load('albums.json');albums[0]['date']='2025-01';albums[0]['date_precision']='day';save('albums.json',albums)
        run('reject-mismatched-album-date-precision',False)
    with edit(['src/data/alumni.json']):
        records=load('alumni.json');records.append({'name':'QA Optional Alumnus','role':'Visitor','sort_order':99});save('alumni.json',records)
        run('alumni-without-period-or-destination',build=True,verify=lambda:insist('QA Optional Alumnus' in html('alumni/index.html'),'Optional alumnus missing'))

    with edit(['src/data/news.json']):
        news=[{'slug':f'qa-news-{i}','title':f'QA Published News {i}','date':f'2026-11-0{i}','category':'Test only','summary':'Disposable acceptance fixture.','status':'published'} for i in [1,4,2,3]]
        news.append({'slug':'qa-hidden-draft','title':'QA Hidden Draft','date':'2026-11-05','category':'Test only','summary':'Must never appear publicly.','status':'draft'})
        save('news.json',news)
        def verify_news():
            home=html('index.html');archive=html('news/index.html')
            for i in [4,3,2]:insist(f'QA Published News {i}' in home,'Recent news missing on home')
            insist('QA Published News 1' not in home,'Homepage exceeds configured three news entries')
            insist(home.index('QA Published News 4')<home.index('QA Published News 3')<home.index('QA Published News 2'),'Homepage news order incorrect')
            for i in range(1,5):insist(f'QA Published News {i}' in archive,'News archive entry missing')
            insist('QA Hidden Draft' not in home+archive+html('sitemap.xml'),'Draft leaked into public output')
            insist(not (target/'dist/news/qa-hidden-draft/index.html').exists(),'Draft route generated')
        run('published-news-order-limit-and-draft-exclusion',build=True,verify=verify_news)

    added=['src/content/members/qa-fixture-member.md','src/content/research/qa-fixture-project.md','src/data/publications.json','src/data/albums.json']
    with edit(added):
        (target/added[0]).write_text('---\nslug: qa-fixture-member\nname: QA Fixture Member\nrole: Visiting Student\ngroup: Visitors\ngroup_order: 99\nsort_order: 1\n---\nDisposable biography fixture.\n')
        (target/added[1]).write_text('---\nslug: qa-fixture-project\ntitle: QA Fixture Project\nimage: /assets/images/logo/logo_standard.png\nimage_alt: QA image\nsummary: Disposable project fixture.\norder: 99\n---\nDisposable scientific description fixture.\n')
        pubs=load('publications.json');entry=copy.deepcopy(pubs[0]);entry.update(id='qa-fixture-paper',title='QA Fixture Publication',order=9999,featured=False);entry.pop('featured_order',None);pubs.append(entry);save('publications.json',pubs)
        albums=load('albums.json');album=copy.deepcopy(albums[0]);album.update(slug='qa-fixture-album',title='QA Fixture Album');album.pop('date',None);album.pop('date_precision',None);albums.append(album);save('albums.json',albums)
        def verify_additions():
            insist('QA Fixture Member' in html('people/index.html'),'Added member missing from index')
            insist('QA Fixture Member' in html('qa-fixture-member/index.html'),'Added member route missing')
            insist('QA Fixture Project' in html('research/index.html'),'Added project missing from research')
            insist('QA Fixture Project' in html('index.html'),'Added project missing from home')
            insist('QA Fixture Publication' in html('publication/index.html'),'Added publication missing')
            insist('QA Fixture Album' in html('gallery/index.html'),'Added album missing')
            insist('QA Fixture Album' in html('gallery/qa-fixture-album/index.html'),'Added album route missing')
        run('content-only-additions-and-optional-fields',build=True,verify=verify_additions)

    with edit(['src/data/albums.json']):
        save('albums.json',[])
        run('empty-gallery-and-news-build',build=True,verify=lambda:insist('Latest News' not in html('index.html'),'Empty homepage news heading remains'))
    with edit(['src/data/albums.json']):
        save('albums.json',load('albums.json')[:1])
        run('single-album-build',build=True)
    with edit(['public/assets/images/qa-collision.jpg','public/assets/images/qa-collision.png']):
        image=(target/'public/assets/images/logo/logo_standard.png').read_bytes()
        for ext in ['jpg','png']:(target/f'public/assets/images/qa-collision.{ext}').write_bytes(image)
        def verify_variants():
            manifest=json.loads((target/'public/media/manifest.json').read_text())['images']
            a={v['src'] for v in manifest['assets/images/qa-collision.jpg']['variants']}
            b={v['src'] for v in manifest['assets/images/qa-collision.png']['variants']}
            insist(a.isdisjoint(b),'Same-stem originals overwrite derivatives')
        run('same-stem-image-derivatives-remain-distinct',build=True,verify=verify_variants)
    (ROOT/'results').mkdir(exist_ok=True)
    (ROOT/'results'/'content-fixtures.json').write_text(json.dumps(reports,ensure_ascii=False,indent=2))
    failed=[r['name'] for r in reports if r['status']=='FAIL']
    print(json.dumps({'probes':len(reports),'failed':failed},indent=2),flush=True)
    shutil.rmtree(target)
    if failed:raise SystemExit(1)

if __name__=='__main__':main()
