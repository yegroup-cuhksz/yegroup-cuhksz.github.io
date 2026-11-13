"""Check migration completeness and every local page, asset and fragment link."""
from pathlib import Path
from urllib.parse import unquote, urlparse
import json
import re
from capture_source import Parser

ROOT = Path(__file__).resolve().parents[1]
DATA = json.loads((ROOT/'data/site.json').read_text())
SNAPSHOT = json.loads((ROOT/'reference/source-inventory.json').read_text())
PAGES = [ROOT/'index.html'] + sorted(ROOT.glob('*/index.html'))

def normalized(text): return re.sub(r'\s+', ' ', text).strip()
def text(html): return normalized(Parser(html).root.text())

def main():
    errors = []
    trees = {p:Parser(p.read_text()).root for p in PAGES}
    links = 0
    for path, tree in trees.items():
        headings = tree.find_all(lambda n:n.tag=='h1')
        if len(headings) != 1: errors.append(f'{path}: expected one H1')
        for node in tree.find_all(lambda n:n.tag in {'img','a','script','link'}):
            ref = node.attrs.get('href',node.attrs.get('src',''))
            if not ref: errors.append(f'{path}: empty link or asset'); continue
            parsed = urlparse(ref)
            if parsed.scheme or parsed.netloc:
                if node.tag in {'img','script','link'}: errors.append(f'{path}: external dependency {ref}')
                if parsed.hostname in {'yegroup-cuhksz.org','yegroup.cuhk.edu.cn'}: errors.append(f'{path}: unmigrated internal URL {ref}')
                continue
            target = (path.parent/unquote(parsed.path)).resolve() if parsed.path else path
            links += 1
            if not target.is_file(): errors.append(f'{path.relative_to(ROOT)}: missing {ref}')
            elif parsed.fragment and target.suffix == '.html':
                target_tree = trees.get(target) or Parser(target.read_text()).root
                if not target_tree.find_all(lambda n:n.attrs.get('id')==unquote(parsed.fragment)):
                    errors.append(f'{path.relative_to(ROOT)}: missing anchor {ref}')
            if node.tag == 'img' and not node.attrs.get('alt'): errors.append(f'{path}: missing image description')

    for m in DATA['members']:
        source_tree = Parser((ROOT/'reference/original'/f'{m["slug"]}.html').read_text()).root
        source = source_tree.find_all(lambda n:'entry-content' in n.attrs.get('class','').split())[0]
        heading = source.find_all(lambda n:n.tag=='h2')[0]
        expected = normalized(source.text()).replace(normalized(heading.text()),'',1).strip()
        actual = text((ROOT/m['bio_file']).read_text())
        if expected != actual: errors.append(f'Profile content mismatch: {m["slug"]}')
    research_text = text(' '.join((ROOT/r['body_file']).read_text() for r in DATA['research']))
    research_source = normalized(SNAPSHOT['pages']['research']['text'])
    for heading in ['Research']+[r['title'] for r in DATA['research']]:
        research_source = research_source.replace(heading,'',1)
    if normalized(research_source) != research_text: errors.append('Research content mismatch')
    opening_source = normalized(SNAPSHOT['pages']['opening']['text']).removeprefix('Opening').strip()
    if opening_source != text((ROOT/'data/opening.html').read_text()): errors.append('Opening content mismatch')
    original_pubs = SNAPSHOT['pages']['publication']['links']
    if [p['url'] for p in DATA['publications']] != [p['href'] for p in original_pubs]: errors.append('Publication URL mismatch')
    for p in DATA['publications']:
        if p['title'] not in normalized(SNAPSHOT['pages']['publication']['text']): errors.append('Publication title mismatch: '+p['title'])
    if len(PAGES)!=16 or len(DATA['members'])!=9 or len(DATA['publications'])!=15 or len(DATA['alumni'])!=7: errors.append('Unexpected migration counts')
    if any(value is None for value in SNAPSHOT['assets'].values()): errors.append('Missing source assets')
    if errors:
        raise SystemExit('\n'.join(errors))
    print(f'PASS: {len(PAGES)} pages; {links} local links/assets/anchors; 9 complete profiles; 15 publication URLs; 7 alumni; research and opening text retained.')

if __name__=='__main__': main()
