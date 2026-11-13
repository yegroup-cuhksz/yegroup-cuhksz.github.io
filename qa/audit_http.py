"""Verify generated static output over HTTP; this does not test Nginx or UI."""
from pathlib import Path
from urllib.request import urlopen
from urllib.error import HTTPError
import argparse
import json
from audit_static import Parser

def main():
    parser=argparse.ArgumentParser();parser.add_argument('release',type=Path);parser.add_argument('origin');args=parser.parse_args()
    targets={};errors=[]
    for file in args.release.rglob('*.html'):
        rel=file.relative_to(args.release).as_posix()
        route='/' if rel=='index.html' else '/'+rel.removesuffix('index.html')
        targets[route]=200  # direct error document is an ordinary file on this preview server
        tree=Parser(file.read_text()).root
        for node in tree.find(lambda n:n.tag in {'img','link','script','source','a'}):
            value=node.attrs.get('src',node.attrs.get('href',''))
            if value.startswith('/') and not value.startswith('//') and '#' not in value:
                targets.setdefault(value,200)
            for variant in node.attrs.get('srcset','').split(','):
                value=variant.strip().split(' ')[0]
                if value.startswith('/'):targets.setdefault(value,200)
    targets.update({'/sitemap.xml':200,'/robots.txt':200,'/qa-nonexistent-path/':404,'/reference/source-inventory.json':404,'/src/data/news.json':404})
    checks=0
    for route,expected in targets.items():
        try:
            with urlopen(args.origin.rstrip('/')+route,timeout=10) as response:code=response.status;body=response.read()
        except HTTPError as exc:code=exc.code;body=exc.read()
        checks+=1
        if code!=expected:errors.append(f'{route}: expected {expected}, received {code}')
        if expected==200 and not body:errors.append(f'{route}: empty response')
    for route in ['/haoyun-liu/','/gallery/group-photo-2025-01-10/']:
        with urlopen(args.origin.rstrip('/')+route,timeout=10) as response:
            checks+=1
            if response.status!=200:errors.append(route+': repeat request failed')
    print(json.dumps({'status':'FAIL' if errors else 'PASS','checks':checks,'errors':errors,'scope':'Loopback static HTTP; no Nginx or browser refresh verification'},indent=2))
    if errors:raise SystemExit(1)

if __name__=='__main__':main()
