"""Archive public source pages and media for the local rebuild (stdlib only)."""
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlparse, unquote
from urllib.request import urlopen
import hashlib
import json
import re

ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://yegroup.cuhk.edu.cn/'
VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'}

class Node:
    def __init__(self, tag='', attrs=(), parent=None):
        self.tag, self.attrs, self.parent, self.children = tag, dict(attrs), parent, []
    def find_all(self, predicate):
        out = [self] if predicate(self) else []
        for c in self.children:
            if isinstance(c, Node): out.extend(c.find_all(predicate))
        return out
    def text(self):
        return ''.join(c.text() if isinstance(c, Node) else c for c in self.children)

class Parser(HTMLParser):
    def __init__(self, source):
        super().__init__(convert_charrefs=True)
        self.root = self.current = Node()
        self.feed(source)
    def handle_starttag(self, tag, attrs):
        node = Node(tag, attrs, self.current)
        self.current.children.append(node)
        if tag not in VOID: self.current = node
    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID: self.handle_endtag(tag)
    def handle_endtag(self, tag):
        n = self.current
        while n.parent:
            if n.tag == tag:
                self.current = n.parent
                break
            n = n.parent
    def handle_data(self, data): self.current.children.append(data)

def fetch(url):
    with urlopen(url, timeout=45) as r: return r.read(), r.url

def source_url(url):
    parsed = urlparse(urljoin(BASE, url))
    return BASE.rstrip('/') + parsed.path + ('?' + parsed.query if parsed.query else '')

def key_for(url):
    parsed = urlparse(url)
    if parsed.query == 'page_id=109': return 'alumni'
    return parsed.path.strip('/') or 'home'

def main():
    archive = ROOT / 'reference' / 'original'
    archive.mkdir(parents=True, exist_ok=True)
    media = ROOT / 'assets' / 'images'
    media.mkdir(parents=True, exist_ok=True)
    queue = [BASE, BASE+'research/', BASE+'people/', BASE+'?page_id=109', BASE+'publication/', BASE+'opening/', BASE+'contact/']
    pages, assets = {}, {}
    while queue:
        url = queue.pop(0)
        key = key_for(url)
        if key in pages: continue
        raw, final = fetch(url)
        (archive / (key + '.html')).write_bytes(raw)
        tree = Parser(raw.decode()).root
        contents = tree.find_all(lambda n: 'entry-content' in n.attrs.get('class', '').split())
        if not contents: raise RuntimeError('No entry content: '+url)
        content = contents[0]
        images = [dict(n.attrs) for n in content.find_all(lambda n: n.tag == 'img')]
        links = [dict(href=n.attrs.get('href', ''), text=n.text().strip()) for n in content.find_all(lambda n: n.tag == 'a')]
        for item in images:
            asset_url = urljoin(url, item['src']).split('?')[0]
            assets[asset_url] = None
        for link in links:
            target = urljoin(url, link['href'])
            p = urlparse(target)
            if p.hostname in {'yegroup-cuhksz.org', 'yegroup.cuhk.edu.cn'}:
                if '/wp-content/' in p.path:
                    assets[target.split('?')[0]] = None
                elif p.path not in {'/', ''}: queue.append(source_url(target))
        pages[key] = dict(url=url, final_url=final, text=content.text().strip(), images=images, links=links)
        print('PAGE', key, len(raw), flush=True)

    def download(url):
        filename = re.sub(r'[^a-zA-Z0-9._-]+', '-', unquote(urlparse(url).path.split('/')[-1]))
        if not filename: filename = hashlib.sha256(url.encode()).hexdigest()[:12]
        dest = media / filename
        try:
            raw, _ = fetch(source_url(url) if urlparse(url).hostname == 'yegroup-cuhksz.org' else url)
            dest.write_bytes(raw)
            print('ASSET', filename, len(raw), flush=True)
            return url, str(dest.relative_to(ROOT))
        except Exception as exc:
            print('FAILED', url, str(exc), flush=True)
            return url, None
    with ThreadPoolExecutor(max_workers=6) as pool:
        assets = dict(pool.map(download, assets))
    snapshot = dict(captured_at=datetime.now(timezone.utc).isoformat(), pages=pages, assets=assets)
    (ROOT/'reference'/'source-inventory.json').write_text(json.dumps(snapshot, ensure_ascii=False, indent=2))
    print('TOTAL', len(pages), 'pages,', len(assets), 'assets')

if __name__ == '__main__': main()
