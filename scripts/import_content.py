"""One-time conversion of the archived WordPress content into editable local data."""
from html import escape
import json
import re
from pathlib import Path
from urllib.parse import urlparse
from capture_source import Parser, Node

ROOT = Path(__file__).resolve().parents[1]
SNAPSHOT = json.loads((ROOT/'reference/source-inventory.json').read_text())
ASSETS = SNAPSHOT['assets']
OUT = ROOT/'data'

def content(key):
    tree = Parser((ROOT/'reference/original'/f'{key}.html').read_text()).root
    return tree.find_all(lambda n: 'entry-content' in n.attrs.get('class', '').split())[0]

def media(url):
    key = url.split('?')[0]
    if not ASSETS.get(key): raise ValueError('Missing asset: '+key)
    return ASSETS[key]

def render(node):
    if isinstance(node, str): return escape(node)
    if node.tag in {'script', 'style', 'iframe', 'img', 'figure', 'button'}: return ''
    body = ''.join(render(c) for c in node.children)
    if node.tag == 'a':
        href = node.attrs.get('href', '')
        if href.split('?')[0] in ASSETS: href = media(href)
        return f'<a href="{escape(href, quote=True)}">{body}</a>'
    if node.tag in {'p','h2','h3','h4','ul','ol','li','strong','em','sup','sub','b','i','br'}:
        if node.tag != 'br' and not node.text().strip(): return ''
        return '<br>' if node.tag == 'br' else f'<{node.tag}>{body}</{node.tag}>'
    return body

def main():
    OUT.mkdir(exist_ok=True)
    profiles = []
    people = content('people')
    for heading in people.find_all(lambda n: n.tag in {'h2','h3'}):
        container = heading.parent
        image = container.find_all(lambda n: n.tag == 'img')[0]
        link = heading.find_all(lambda n: n.tag == 'a')[0]
        key = urlparse(link.attrs['href']).path.strip('/')
        paragraphs = [n.text().strip() for n in container.find_all(lambda n: n.tag == 'p') if n.text().strip()]
        profile = content(key)
        name = re.sub(r'^(Prof\.|Dr\.)\s*', '', heading.text().strip())
        english, chinese = name.split(' (')
        bio = ''.join(render(n) for n in profile.children if not isinstance(n, Node) or n.tag not in {'h2','figure'})
        (OUT/f'{key}.html').write_text(bio.strip())
        profiles.append(dict(slug=key, name=english, chinese=chinese.rstrip(')'), role=paragraphs[0], email=next(p.removeprefix('Email:').strip() for p in paragraphs if p.startswith('Email:')), office=next((p.removeprefix('Office:').strip() for p in paragraphs if p.startswith('Office:')), ''), image=media(image.attrs['src']), profile_image=media(SNAPSHOT['pages'][key]['images'][0]['src']), bio_file=f'data/{key}.html'))

    publications = []
    for li in content('publication').find_all(lambda n: n.tag == 'li'):
        a = li.find_all(lambda n: n.tag == 'a')[0]
        text = re.sub(r'\s+', ' ', li.text()).strip()
        before = text[:text.index(a.text())].rstrip(' ,')
        match = re.match(r'^(.*?(?:\),|et al\.,|K\. Ni,))\s*(.*)$', before)
        if not match: raise ValueError(before)
        authors, title = match.groups()
        year = re.search(r'\((\d{4})\)', a.text()).group(1)
        publications.append(dict(title=title, authors=authors.rstrip(','), year=year, venue=a.text(), url=a.attrs['href']))

    research = content('research')
    sections = []
    current = None
    for n in research.children:
        if not isinstance(n, Node): continue
        if n.tag == 'h2':
            current = dict(title=n.text(), body='', image='', slug='xenonnt' if not sections else 'relics')
            sections.append(current)
        elif current:
            imgs = n.find_all(lambda x: x.tag == 'img')
            if imgs: current['image'] = media(imgs[0].attrs['src'])
            else: current['body'] += render(n)
    for s in sections:
        filename = f'research-{s["slug"]}.html'
        (OUT/filename).write_text(s.pop('body'))
        s['body_file'] = f'data/{filename}'

    opening = content('opening')
    (OUT/'opening.html').write_text(''.join(render(n) for n in opening.children if not isinstance(n, Node) or n.tag != 'h1'))
    alumni = [n.text().strip() for n in content('alumni').find_all(lambda n: n.tag == 'p') if n.text().strip()]
    home = content('home')
    gallery = []
    for figure in home.find_all(lambda n: n.tag == 'figure'):
        imgs = figure.find_all(lambda n: n.tag == 'img')
        caps = figure.find_all(lambda n: n.tag == 'figcaption')
        if imgs:
            gallery.append(dict(image=media(imgs[0].attrs['src']), caption=caps[0].text() if caps else imgs[0].attrs.get('alt', '')))
    data = dict(name='Neutrino and Dark Matter Group', institution='The Chinese University of Hong Kong, Shenzhen', members=profiles, publications=publications, research=sections, alumni=alumni, gallery=gallery, email='yejingqiang@cuhk.edu.cn', phone='+86 0755-23519735', address=['School of Science and Engineering', 'The Chinese University of Hong Kong, Shenzhen', 'No. 2001 Longxiang Blvd., Longgang Dist.', 'Shenzhen 518172, China'])
    (OUT/'site.json').write_text(json.dumps(data, ensure_ascii=False, indent=2))
    print(f'Imported {len(profiles)} members, {len(publications)} publications, {len(gallery)} gallery items.')

if __name__ == '__main__': main()
