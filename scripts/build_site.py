"""Build the complete static website. No packages or network access required."""
from html import escape as esc
from pathlib import Path
import json
import re

ROOT = Path(__file__).resolve().parents[1]
DATA = json.loads((ROOT/'data/site.json').read_text())
NAV = [('home','Home'),('research','Research'),('people','People'),('publication','Publications'),('opening','Openings'),('contact','Contact')]
ARROW = '<span aria-hidden="true">↗</span>'

def href(slug, prefix): return prefix + ('index.html' if slug == 'home' else slug+'/index.html')
def img(path, alt, cls='', eager=False):
    return f'<img src="{path}" alt="{esc(alt, quote=True)}" class="{cls}" loading="{"eager" if eager else "lazy"}" decoding="async">'
def textlink(url, label): return f'<a class="text-link" href="{url}">{label} {ARROW}</a>'
def read_content(path, prefix):
    body = (ROOT/path).read_text()
    return re.sub(r'href="(assets/[^\"]+)"', lambda m: 'href="'+prefix+m[1]+'"', body)

def page(slug, title, body, section=None, description=None):
    prefix = '' if slug == 'home' else '../'
    current = section or slug
    nav = ''.join(f'<a href="{href(k,prefix)}"'+(' aria-current="page"' if k == current else '')+f'>{label}</a>' for k,label in NAV)
    html = f'''<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="{esc(description or 'Neutrino and Dark Matter Group at The Chinese University of Hong Kong, Shenzhen. Research, people, publications and opportunities.',quote=True)}">
  <meta name="theme-color" content="#152d35">
  <title>{esc(title)} · Ye Group · CUHK-Shenzhen</title>
  <link rel="icon" href="{prefix}assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="{prefix}assets/styles.css">
  <script src="{prefix}assets/site.js" defer></script>
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header">
    <div class="container header-inner">
      <a class="brand" href="{href('home',prefix)}" aria-label="Ye Group home"><span class="brand-symbol" aria-hidden="true">y<span>e</span><i></i></span><span class="brand-text">YE GROUP<small>CUHK · SHENZHEN</small></span></a>
      <button class="menu-toggle" aria-controls="site-nav" aria-expanded="false">Menu <span aria-hidden="true">☰</span></button>
      <nav id="site-nav" aria-label="Main navigation">{nav}</nav>
    </div>
  </header>
  <main id="main">{body}</main>
  <footer class="site-footer">
    <div class="container footer-main"><div><a class="footer-title" href="{href('home',prefix)}">Neutrino and<br>Dark Matter Group<span class="accent">.</span></a><p>The Chinese University of Hong Kong, Shenzhen<br>School of Science and Engineering</p></div><div class="footer-links"><span class="eyebrow">EXPLORE</span><a href="{href('research',prefix)}">Our research</a><a href="{href('people',prefix)}">Meet the group</a><a href="{href('alumni',prefix)}">Alumni</a></div><div class="footer-links"><span class="eyebrow">GET IN TOUCH</span><a href="mailto:{DATA['email']}">{DATA['email']}</a><a href="{href('opening',prefix)}">Join our group {ARROW}</a><a href="{href('contact',prefix)}">Shenzhen, China {ARROW}</a></div></div>
    <div class="container footer-bottom"><span>© {2026} Ye Group · CUHK-Shenzhen</span><span>Exploring nature through experiment.</span></div>
  </footer>
</body>
</html>'''
    dest = ROOT/('index.html' if slug == 'home' else slug+'/index.html')
    dest.parent.mkdir(exist_ok=True)
    dest.write_text(html)

def intro(kicker, title, lead='', extra=''):
    return f'<section class="page-intro container"><p class="eyebrow">{kicker}</p><h1>{title}</h1>'+ (f'<p class="lead">{lead}</p>' if lead else '')+extra+'</section>'

def pub_rows(publications, full=False):
    rows = []
    for i,p in enumerate(publications):
        title = esc(p['title']).replace('Solar 8B', 'Solar <sup>8</sup>B').replace('in 124Xe', 'in <sup>124</sup>Xe')
        search = esc(' '.join([p['title'],p['authors'],p['venue']]).lower(),quote=True)
        rows.append(f'<li class="publication-row" data-publication data-year="{p["year"]}" data-search="{search}"><span class="publication-year">{p["year"]}</span><div><h3><a href="{esc(p["url"],quote=True)}">{title} {ARROW}</a></h3><p class="publication-authors">{esc(p["authors"])}</p><p class="publication-venue">{esc(p["venue"])}</p></div></li>')
    return '<ol class="publication-list">'+''.join(rows)+'</ol>'

def hero_carousel():
    figures = ''
    for i, slide in enumerate(DATA['hero_gallery']):
        active = ' is-active' if i == 0 else ''
        hidden = 'false' if i == 0 else 'true'
        alt = slide.get('alt') or 'Group photograph'
        caption = esc(slide.get('caption', ''))
        figures += f'<figure class="hero-photo hero-slide{active}" data-hero-slide aria-hidden="{hidden}">{img(slide["image"], alt, eager=(i == 0))}<figcaption><span>{caption}</span><span>FIG. 0{i+1} / GROUP</span></figcaption></figure>'
    return f'<div class="hero-carousel" data-hero-carousel aria-label="Group photographs">{figures}</div>'

def home():
    hero = hero_carousel()
    experiments = ''
    info = [('01','XENONnT','Dark matter, from deep underground.','Searching for dark matter and rare interactions with a liquid xenon detector at Gran Sasso, Italy.','logo/logo_standard.png','xenonnt'),('02','RELICS','A new window on neutrinos.','Exploring coherent elastic neutrino–nucleus scattering with reactor neutrinos and liquid xenon technology.','logo/relics_logo.jpg','relics')]
    for num,name,title,desc,logo,anchor in info:
        experiments += f'<a class="experiment-card" href="research/index.html#{anchor}"><div class="experiment-top"><span class="eyebrow">{num} / {name}</span><span class="circle-arrow">↗</span></div><div class="experiment-logo">{img("assets/images/"+logo,name+" experiment logo")}</div><h3>{title}</h3><p>{desc}</p><span class="experiment-location">{"LNGS · ITALY" if num=="01" else "SANMEN · CHINA"}</span></a>'
    gallery = ''.join(f'<figure class="gallery-item">{img(g["image"],g["caption"])}<figcaption>{esc(g["caption"])}</figcaption></figure>' for g in DATA['gallery'])
    body = f'''
<section class="hero container">
  <div class="hero-copy"><p class="eyebrow"><span class="status-dot"></span> EXPERIMENTAL PARTICLE PHYSICS</p><h1>Exploring the<br><em>invisible</em><br>universe<span class="accent">.</span></h1><p class="hero-description">Neutrinos. Dark matter. The fundamental nature of our universe.<br>We look for answers with noble liquid detectors.</p><a class="button button-dark" href="research/index.html">Discover our research <span aria-hidden="true">↗</span></a></div>
  <div class="hero-visual"><div class="photo-index"><span>NEUTRINO &amp; DARK MATTER GROUP</span><span>CUHK-SZ</span></div>{hero}<div class="hero-note"><span class="small-orbit" aria-hidden="true">ν</span><p>Small signals.<br><strong>Fundamental questions.</strong></p><span class="coordinate">SHENZHEN, CHINA<br>CUHK · SCHOOL OF SCIENCE &amp; ENGINEERING</span></div></div>
</section>
<div class="container topics-strip"><div><span>01</span> Dark matter</div><div><span>02</span> Neutrino physics</div><div><span>03</span> Detector technology</div></div>
<section class="section container about-section"><p class="eyebrow">THE QUESTIONS THAT DRIVE US</p><div><h2>Unseen particles.<br>Measurable possibilities.</h2><p class="body-large">Welcome to the Neutrino and Dark Matter Group at The Chinese University of Hong Kong, Shenzhen.</p><p>Led by Prof. Jingqiang Ye, we study dark matter, neutrinos and axions with noble liquid detectors, while developing technologies for the next generation of experiments.</p>{textlink('people/index.html','Meet the people behind the science')}</div></section>
<section class="research-band"><div class="container section"><div class="section-heading"><div><p class="eyebrow">OUR RESEARCH</p><h2>Two experiments.<br>A shared curiosity.</h2></div>{textlink('research/index.html','Explore our research')}</div><div class="experiment-grid">{experiments}</div></div></section>
<section class="section container"><div class="section-heading"><div><p class="eyebrow">SELECTED PUBLICATIONS</p><h2>Ideas, put to the test.</h2></div>{textlink('publication/index.html','All publications')}</div>{pub_rows(DATA['publications'][:3])}</section>
<section class="section container group-gallery"><div class="section-heading"><div><p class="eyebrow">FROM THE GROUP</p><h2>Science is a collective pursuit.</h2></div>{textlink('people/index.html','Our team')}</div><div class="gallery-grid">{gallery}</div></section>
<section class="join-section"><div class="container join-inner"><div><p class="eyebrow">OPEN POSITIONS</p><h2>Bring your curiosity.</h2><p>We welcome applications from PhD students and postdoctoral researchers.</p></div><a class="button button-light" href="opening/index.html">Join our group {ARROW}</a></div></section>'''
    page('home','Neutrino and Dark Matter Group',body)

def research():
    body = intro('WHAT WE STUDY','Searching for the<br><em>unseen.</em>','Dark matter, neutrinos and the technologies that help us detect their rare interactions.', '<div class="anchor-links"><a href="#xenonnt">01 / XENONnT ↓</a><a href="#relics">02 / RELICS ↓</a></div>')
    for i,r in enumerate(DATA['research']):
        body += f'<section id="{r["slug"]}" class="research-detail container section"><aside><span class="eyebrow">0{i+1} / {"DARK MATTER" if i==0 else "NEUTRINOS"}</span><div class="research-logo">{img("../"+r["image"],r["title"]+" logo")}</div><p class="eyebrow">{"GRAN SASSO, ITALY" if i==0 else "SANMEN, CHINA"}</p></aside><article class="prose"><h2>{esc(r["title"])}</h2>{read_content(r["body_file"],"../")}</article></section>'
    page('research','Research',body)

def member_card(m):
    return f'<article class="member-card"><a href="../{m["slug"]}/index.html" class="member-photo">{img("../"+m["image"],m["name"])}<span class="photo-arrow" aria-hidden="true">↗</span></a><p class="member-role">{esc(m["role"])}</p><h3><a href="../{m["slug"]}/index.html">{esc(m["name"])}</a></h3><p class="chinese-name" lang="zh">{esc(m["chinese"])}</p><a class="member-email" href="mailto:{m["email"]}">{m["email"]}</a>{f"<p class='member-office'>Office: {esc(m['office'])}</p>" if m['office'] else ""}</article>'

def people():
    pi = DATA['members'][0]
    body = intro('OUR PEOPLE','Curious minds.<br><em>Shared purpose.</em>','Meet the researchers and students behind our work.', '<div class="anchor-links"><a href="#team">Current members ↓</a><a href="../alumni/index.html">Our alumni ↗</a></div>')
    body += f'<section class="container pi-feature"><a class="pi-photo" href="../{pi["slug"]}/index.html">{img("../"+pi["image"],pi["name"])}</a><div class="pi-description"><p class="eyebrow">PRINCIPAL INVESTIGATOR</p><h2>Jingqiang Ye <span lang="zh">叶靖强</span></h2><p>Experimental particle physicist working on the direct detection of dark matter, neutrinos and axions using noble liquid detectors.</p><dl class="contact-facts"><div><dt>Email</dt><dd><a href="mailto:{pi["email"]}">{pi["email"]}</a></dd></div><div><dt>Office</dt><dd>{pi["office"]}</dd></div></dl>{textlink("../jingqiang-ye/index.html","Biography &amp; CV")}</div></section>'
    body += '<section id="team" class="container section"><div class="section-heading"><div><p class="eyebrow">WORKING TOGETHER</p><h2>The group.</h2></div><span class="section-note">Researchers · Students · Staff</span></div><div class="members-grid">'+''.join(member_card(m) for m in DATA['members'][1:])+'</div></section>'
    body += '<section class="container alumni-callout"><div><p class="eyebrow">BEYOND THE GROUP</p><h2>Where curiosity takes us.</h2><p>Meet our former members and see where their journeys continue.</p></div>'+textlink('../alumni/index.html','Meet our alumni')+'</section>'
    page('people','People',body)

def profiles():
    for m in DATA['members']:
        body = f'<section class="container profile-breadcrumb"><a class="text-link" href="../people/index.html">← All people</a></section><section class="container profile-layout"><aside>{img("../"+m["profile_image"],m["name"],"profile-photo",eager=True)}<p class="eyebrow">{esc(m["role"])}</p><a class="member-email" href="mailto:{m["email"]}">{m["email"]}</a>{f"<p>Office: {esc(m['office'])}</p>" if m['office'] else ""}</aside><article class="prose profile-bio"><p class="eyebrow">OUR PEOPLE</p><h1>{esc(m["name"])}</h1><p class="profile-chinese" lang="zh">{m["chinese"]}</p>{read_content(m["bio_file"],"../")}</article></section>'
        page(m['slug'],m['name'],body,section='people')

def publications():
    years = sorted({p['year'] for p in DATA['publications']},reverse=True)
    body = intro('OUR WORK IN PRINT','Publications<span class="accent">.</span>','Selected publications with substantial contribution from our group.')
    body += '<section class="container publications-section"><div class="publication-controls" hidden><div class="search-field"><label for="publication-search">Search publications</label><input id="publication-search" type="search" placeholder="Title, author or journal…" autocomplete="off"></div><div class="year-field"><label for="publication-year">Year</label><select id="publication-year"><option value="">All years</option>'+''.join(f'<option value="{y}">{y}</option>' for y in years)+'</select></div><p id="publication-count" role="status" aria-live="polite">15 publications</p></div>'
    body += pub_rows(DATA['publications'],True)+'<div id="no-results" class="no-results" hidden><h2>No matching publications.</h2><p>Try another title, author or year.</p><button class="button button-dark" id="clear-filters">Clear filters</button></div></section>'
    page('publication','Publications',body)

def alumni():
    body = intro('OUR COMMUNITY','Beyond the<br><em>group.</em>','Former members and the paths they continue to explore.',textlink('../people/index.html','Current members'))
    rows = ''
    for item in DATA['alumni']:
        match = re.match(r'^(.*?)\s*\((.*?)\):\s*(.*)$',item)
        if not match: raise ValueError(item)
        name,role,next_step = match.groups()
        rows += f'<li class="alumni-row"><h2>{esc(name)}</h2><p class="alumni-role">{esc(role)}</p><p>{esc(next_step)}</p></li>'
    body += '<section class="container alumni-section"><ul class="alumni-list">'+rows+'</ul></section>'
    page('alumni','Alumni',body,section='people')

def openings():
    body = intro('JOIN THE GROUP','Your next<br><em>discovery.</em>','We have open positions for PhD students and postdoctoral researchers.')
    source = read_content('data/opening.html','../')
    source = source.replace('yejingqiang@cuhk.edu.cn', '<a href="mailto:yejingqiang@cuhk.edu.cn">yejingqiang@cuhk.edu.cn</a>') if 'href="mailto:' not in source else source
    body += '<section class="container opening-layout"><aside><p class="eyebrow">RESEARCH WITH US</p><p>Dark matter<br>Neutrino physics<br>Noble liquid detectors</p><div class="opening-contact"><p class="eyebrow">CONTACT</p><p>Prof. Jingqiang Ye</p><a class="member-email" href="mailto:yejingqiang@cuhk.edu.cn">yejingqiang@cuhk.edu.cn</a></div></aside><article class="prose opening-prose">'+source+'</article></section>'
    page('opening','Openings',body)

def contact():
    body = intro('LET’S CONNECT','Good science starts<br>with a <em>conversation.</em>','Get in touch with the Neutrino and Dark Matter Group at CUHK-Shenzhen.')
    body += f'<section class="container contact-layout"><article class="contact-address"><span class="eyebrow">FIND US</span><h2>Shenzhen, China.</h2><address>'+ '<br>'.join(esc(a) for a in DATA['address'])+f'</address><a class="text-link" href="https://www.cuhk.edu.cn/en">University website {ARROW}</a></article><div class="contact-methods"><div><span class="eyebrow">01 / EMAIL</span><h2><a href="mailto:{DATA["email"]}">{DATA["email"]} {ARROW}</a></h2><p>Prof. Jingqiang Ye · Principal Investigator</p></div><div><span class="eyebrow">02 / TELEPHONE</span><h2><a href="tel:+8675523519735">{DATA["phone"]} {ARROW}</a></h2></div><div><span class="eyebrow">03 / OPPORTUNITIES</span><p>Interested in joining the group?</p>{textlink("../opening/index.html","See open positions")}</div></div></section>'
    page('contact','Contact',body)

if __name__ == '__main__':
    home(); research(); people(); profiles(); publications(); alumni(); openings(); contact()
    print('Built 16 standalone HTML pages.')
