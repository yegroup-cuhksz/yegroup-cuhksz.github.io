"""Supervisor-owned, independent validation of the generated static release."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse, unquote
import argparse
import json
import re
import xml.etree.ElementTree as ET

class Node:
    def __init__(self, tag='', attrs=(), parent=None):
        self.tag, self.attrs, self.parent, self.children = tag, dict(attrs), parent, []
    def find(self, fn):
        out = [self] if fn(self) else []
        for child in self.children:
            if isinstance(child, Node): out.extend(child.find(fn))
        return out
    def text(self):
        if self.tag in {'script','style'}: return ''
        return ''.join(c.text() if isinstance(c,Node) else c for c in self.children)

class Parser(HTMLParser):
    def __init__(self, html):
        super().__init__(convert_charrefs=True)
        self.root = self.current = Node()
        self.feed(html)
    def handle_starttag(self, tag, attrs):
        child=Node(tag,attrs,self.current); self.current.children.append(child)
        if tag not in {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}: self.current=child
    def handle_endtag(self, tag):
        node=self.current
        while node.parent:
            if node.tag==tag: self.current=node.parent; break
            node=node.parent
    def handle_data(self, value): self.current.children.append(value)

def norm(s): return re.sub(r'\s+',' ',s).strip()

def main():
    p=argparse.ArgumentParser();p.add_argument('release',type=Path);p.add_argument('--baseline',type=Path,default=Path(__file__).resolve().parent.parent/'data/site.json' if Path(__file__).resolve().parent.name=='qa' else Path('/Users/liuhaoyun/Desktop/PhD/Group_page/data/site.json'));args=p.parse_args()
    release=args.release.resolve(); old=json.loads(args.baseline.read_text());errors=[];checks=0
    paths=sorted(release.rglob('*.html'));trees={path:Parser(path.read_text()).root for path in paths}
    def require(condition,message):
        nonlocal checks
        checks+=1
        if not condition:errors.append(message)
    expected=['index.html','research/index.html','people/index.html','alumni/index.html','publication/index.html','opening/index.html','contact/index.html','gallery/index.html','news/index.html','activities/index.html','404.html']+[m['slug']+'/index.html' for m in old['members']]
    for path in expected:require((release/path).is_file(),'Missing expected route: '+path)
    for path,tree in trees.items():
        label=str(path.relative_to(release))
        require(len(tree.find(lambda n:n.tag=='h1'))==1,label+': expected one H1')
        require(len(tree.find(lambda n:n.tag=='title'))==1,label+': title missing')
        require(bool(tree.find(lambda n:n.tag=='meta' and n.attrs.get('name')=='description' and n.attrs.get('content'))),label+': description missing')
        canons=tree.find(lambda n:n.tag=='link' and n.attrs.get('rel')=='canonical')
        require(len(canons)==1 and canons[0].attrs.get('href','').startswith('https://yegroup.cuhk.edu.cn/'),label+': canonical invalid')
        telephone=tree.find(lambda n:n.tag=='a' and n.attrs.get('href','').startswith('tel:'))
        require(bool(telephone) and all(n.attrs['href']=='tel:+8675523519735' for n in telephone),label+': incorrect international telephone link')
        for node in tree.find(lambda n:n.tag in {'a','img','link','script','source'}):
            for source in node.attrs.get('srcset','').split(','):
                source=source.strip().split(' ')[0]
                if source.startswith('/'):
                    require((release/source.lstrip('/')).is_file(),label+': missing responsive variant '+source)
            value=node.attrs.get('href',node.attrs.get('src',''))
            if not value: continue
            parsed=urlparse(value)
            if parsed.scheme or parsed.netloc:
                if node.tag in {'img','script'}:require(parsed.scheme=='data',label+': remote runtime resource '+value)
                continue
            target=release/unquote(parsed.path).lstrip('/') if parsed.path.startswith('/') else path.parent/unquote(parsed.path)
            if not parsed.path:target=path
            if target.is_dir():target=target/'index.html'
            require(target.is_file(),label+': unresolved local resource '+value)
            if target.is_file() and parsed.fragment and target.suffix=='.html':
                dest=trees.get(target) or Parser(target.read_text()).root
                require(bool(dest.find(lambda n:n.attrs.get('id')==unquote(parsed.fragment))),label+': unresolved fragment '+value)
            if node.tag=='img':
                require('alt' in node.attrs,label+': missing image alt')
                require(bool(node.attrs.get('width')) and bool(node.attrs.get('height')),label+': image dimensions missing '+value)
    for m in old['members']:
        file=release/m['slug']/'index.html'
        if not file.is_file():continue
        main=trees[file].find(lambda n:n.tag=='main')
        body=norm(main[0].text() if main else trees[file].text())
        require(m['name'] in body,m['slug']+': member name lost')
        require(m['chinese'] in body,m['slug']+': Chinese name lost')
        require(m['email'] in body,m['slug']+': email lost')
        bio=Parser((args.baseline.parent.parent/m['bio_file']).read_text()).root
        for item in bio.find(lambda n:n.tag=='li'):
            require(norm(item.text()) in body,m['slug']+': education or appointment lost: '+norm(item.text()))
    pubs=release/'publication/index.html'
    if pubs in trees:
        publication_text=norm(trees[pubs].text())
        require('First Indication of Solar' in publication_text,'Solar paper title incorrect')
        require('Search for New Physics in Electronic Recoil Data from XENONnT' in publication_text,'Electronic recoil paper title incorrect')
        anchors=trees[pubs].find(lambda n:n.tag=='a');urls={a.attrs.get('href') for a in anchors}
        for pub in old['publications']:require(pub['url'] in urls,'Publication URL lost: '+pub['url'])
    people=release/'people/index.html'
    if people in trees:
        text=norm(trees[people].text())
        for m in old['members']:require(m['name'] in text,'People index missing '+m['name'])
    alumni=release/'alumni/index.html'
    if alumni in trees:
        text=norm(trees[alumni].text())
        for item in old['alumni']:require(item.split(' (')[0] in text,'Alumni lost: '+item)
    require((release/'sitemap.xml').is_file(),'Missing sitemap.xml')
    if (release/'sitemap.xml').is_file():
        root=ET.fromstring((release/'sitemap.xml').read_text())
        locations=[e.text for e in root.iter() if e.tag.split('}')[-1]=='loc']
        require(all(v and v.startswith('https://yegroup.cuhk.edu.cn/') for v in locations),'Nonproduction sitemap URL')
        require(not any('404' in v for v in locations),'404 included in sitemap')
    require((release/'robots.txt').is_file(),'Missing robots.txt')
    for name in ['reference','scripts','src','data','plan.md','node_modules']:
        require(not (release/name).exists(),'Source/development content deployed: '+name)
    report={'pages':len(paths),'checks':checks,'errors':errors,'status':'PASS' if not errors else 'FAIL'}
    print(json.dumps(report,ensure_ascii=False,indent=2))
    if errors:raise SystemExit(1)

if __name__=='__main__':main()
