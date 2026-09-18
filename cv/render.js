// Génère le PDF et un aperçu PNG du CV à partir du HTML.
// Usage : NODE_PATH=$(npm root -g) node render.js
const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 794, height: 1123 }, deviceScaleFactor: 2 });
  await page.goto('file://' + path.resolve(__dirname, 'cv-vincent-monchecourt.html'), { waitUntil: 'load', timeout: 30000 });
  await page.evaluate(() => document.fonts.ready);

  const loaded = await page.evaluate(() => [...document.fonts].filter(f => f.status === 'loaded').map(f => `${f.family} ${f.weight}`).join(', '));
  console.log('fonts loaded:', loaded || 'NONE');

  // Vérifie que chaque colonne tient dans la page (bas du dernier élément vs bas de page).
  const fit = await page.evaluate(() => {
    const pageBottom = document.querySelector('.page').getBoundingClientRect().bottom;
    const last = sel => { const el = document.querySelector(sel); return el.lastElementChild.getBoundingClientRect().bottom; };
    return { pageBottom, asideBottom: last('aside'), mainBottom: last('main') };
  });
  console.log('fit px:', JSON.stringify(fit), fit.asideBottom <= fit.pageBottom && fit.mainBottom <= fit.pageBottom ? 'OK' : 'OVERFLOW');

  await page.pdf({ path: path.resolve(__dirname, 'CV_Vincent_Monchecourt_2026.pdf'), format: 'A4', printBackground: true, preferCSSPageSize: true });
  await page.screenshot({ path: path.resolve(__dirname, 'preview.png'), fullPage: true });
  await browser.close();
})().catch(e => { console.error('ERR', e); process.exit(1); });
