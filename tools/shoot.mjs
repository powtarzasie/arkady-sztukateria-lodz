/** Screenshot helper: node tools/shoot.mjs <url> <outPrefix> <width> <height> */
import puppeteer from 'puppeteer-core';

const [,, url = 'http://localhost:4321', prefix = 'shot', width = '1440', height = '900'] = process.argv;
const OUT = 'C:/Users/CEOMAR~1/AppData/Local/Temp/claude/C--Claude-NEW-new-SZTUKATERIA/f77ce0f4-999e-49c7-b65b-05dcf354cbf8/scratchpad/shots';

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
});
const page = await browser.newPage();
await page.setViewport({ width: +width, height: +height, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: 'networkidle0', timeout: 45000 });
await new Promise(r => setTimeout(r, 800));
// force all reveals in for the capture
await page.evaluate(() => {
  document.querySelectorAll('.reveal, .profile-divider').forEach(el => el.classList.add('is-in'));
  window.scrollTo(0, document.body.scrollHeight); // trigger lazy images
});
await new Promise(r => setTimeout(r, 1500));
await page.evaluate(() => window.scrollTo(0, 0));
await new Promise(r => setTimeout(r, 400));
await page.screenshot({ path: `${OUT}/${prefix}-full.png`, fullPage: true });
console.log('saved', `${prefix}-full.png`);
await browser.close();
