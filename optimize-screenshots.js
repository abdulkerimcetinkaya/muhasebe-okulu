const playwright = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await playwright.chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  const pages = [
    { url: 'http://localhost:8080/index.html', name: 'homepage' },
    { url: 'http://localhost:8080/dashboard.html', name: 'dashboard-light' },
    { url: 'http://localhost:8080/problems.html', name: 'problem-solving' },
    { url: 'http://localhost:8080/quizzes.html', name: 'quiz' },
    { url: 'http://localhost:8080/study.html', name: 'study-cards' }
  ];

  for (const p of pages) {
    await page.goto(p.url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ 
      path: `screenshots/${p.name}.jpg`, 
      type: 'jpeg',
      quality: 50,
      fullPage: true 
    });
    console.log(`✓ ${p.name}.jpg`);
  }

  await browser.close();
})();
