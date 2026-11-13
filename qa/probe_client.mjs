// Supervisor checks of the shipped JavaScript in a minimal event harness.
// These checks exercise behavior, not browser rendering, focus order, or layout.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const root = path.resolve(process.argv[2] ?? '.');
const html = fs.readFileSync(path.join(root, 'dist/publication/index.html'), 'utf8');
const scripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const publications = JSON.parse(fs.readFileSync(path.join(root, 'src/data/publications.json')));
class Node {
  dataset = {}; attrs = {}; events = {}; hidden = false; value = ''; textContent = ''; focused = false;
  constructor() {
    const values = new Set();
    this.classList = {add: value => values.add(value), toggle: (value, on) => on ? values.add(value) : values.delete(value), contains: value => values.has(value)};
  }
  addEventListener(name, fn) { (this.events[name] ??= []).push(fn); }
  dispatch(name, event = {}) { for (const fn of this.events[name] ?? []) fn(event); }
  setAttribute(name, value) { this.attrs[name] = value; }
  getAttribute(name) { return this.attrs[name]; }
  focus() { this.focused = true; }
  closest(name) { return name === 'a' && this.anchor ? this : null; }
}
const keys = ['[data-menu-toggle]', '[data-site-nav]', '[data-publication-controls]', '[data-publication-search]', '[data-publication-year]', '[data-publication-reset]', '#publication-count', '#no-results'];
const nodes = Object.fromEntries(keys.map(key => [key, new Node()]));
const rows = publications.map(item => {
  const row = new Node();
  row.dataset = {year: String(item.year), search: `${item.title} ${item.authors} ${item.venue} ${item.year} ${item.id}`.toLowerCase()};
  return row;
});
const document = new Node();
document.documentElement = new Node(); document.body = new Node();
document.querySelector = key => nodes[key] ?? null;
document.querySelectorAll = key => key === '[data-publication]' ? rows : [];
const media = new Node();
const context = vm.createContext({document, Element: Node, window: {matchMedia: query => { media.query = query; return media; }}});
for (const script of scripts) vm.runInContext(script, context);
let checks = 0;
function check(condition, label) { assert.ok(condition, label); checks++; }
const menu = nodes[keys[0]], nav = nodes[keys[1]], search = nodes[keys[3]], year = nodes[keys[4]], reset = nodes[keys[5]], count = nodes[keys[6]], empty = nodes[keys[7]];
check(document.documentElement.classList.contains('js'), 'JS enhancement initialized');
check(nodes[keys[2]].hidden === false, 'Filter controls enabled');
menu.dispatch('click');
check(nav.dataset.open === 'true' && menu.getAttribute('aria-expanded') === 'true' && document.body.classList.contains('menu-open'), 'Menu opens and locks scroll');
document.dispatch('keydown', {key: 'Escape'});
check(nav.dataset.open === 'false' && menu.focused && !document.body.classList.contains('menu-open'), 'Escape closes menu and restores focus');
menu.dispatch('click'); const link = new Node(); link.anchor = true; nav.dispatch('click', {target: link});
check(nav.dataset.open === 'false', 'Navigation closes menu');
menu.dispatch('click'); media.dispatch('change', {matches: !media.query.includes('max-width')});
check(nav.dataset.open === 'false' && !document.body.classList.contains('menu-open'), 'Desktop resize releases scroll lock');
search.value = '  ReLiCs  '; search.dispatch('input');
check(rows.filter(row => !row.hidden).length === 1 && count.textContent === '1 publication', 'Case-insensitive search and count');
year.value = '2023'; year.dispatch('change');
check(rows.every(row => row.hidden) && !empty.hidden && count.textContent === '0 publications', 'Year and search combine with empty state');
reset.dispatch('click');
check(rows.every(row => !row.hidden) && empty.hidden && search.value === '' && year.value === '' && search.focused, 'Reset restores full list and search focus');
year.value = '2024'; year.dispatch('change');
check(rows.filter(row => !row.hidden).length === 2 && count.textContent === '2 publications', 'Year filter');
reset.dispatch('click'); search.value = 'xenonnt Aprile'; search.dispatch('input');
check(rows.filter(row => !row.hidden).length === 6, 'Multiple search terms match across title and authors');
// Pages without publication controls must still initialize navigation without error.
for (const key of keys.slice(2)) delete nodes[key];
for (const script of scripts) vm.runInContext(script, vm.createContext({document, Element: Node, window: {matchMedia: query => { media.query = query; return media; }}}));
check(true, 'Non-publication page initialization');
console.log(JSON.stringify({status: 'PASS', checks, method: 'Compiled JavaScript event harness; not browser QA'}, null, 2));
