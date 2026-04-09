#!/usr/bin/env node
import { chromium } from 'playwright';

async function main() {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: '/tmp/demo-videos/', size: { width: 1280, height: 720 } },
  });
  const page = await context.newPage();

  console.log('Navigating to simulator...');
  await page.goto('http://localhost:3000/sim', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Use the quick-start button "Open a cafe in Bali" which triggers generateFlow (API)
  // OR use keyboard shortcut approach
  // Best approach: click the suggestion button which calls loadTemplate if fuzzy match >= 3

  // Actually - these suggestion buttons call generateFlow which needs API.
  // Let's try clicking Templates in topbar, then use page.evaluate to find and click items
  console.log('Opening Templates dropdown...');
  await page.locator('text=Templates').first().click();
  await page.waitForTimeout(1000);

  // Get all text content to understand the dropdown structure
  const allText = await page.evaluate(() => {
    const dropdown = document.querySelector('[class*="TemplateSelector"], [class*="template-selector"], [class*="dropdown"]');
    if (dropdown) return dropdown.innerHTML.substring(0, 2000);
    // Try finding any floating/portal element
    const portals = document.querySelectorAll('[class*="modal"], [class*="overlay"], [class*="popover"], [class*="dropdown"], [class*="panel"]');
    return Array.from(portals).map(p => p.className + ': ' + p.textContent?.substring(0, 100)).join('\n');
  });
  console.log('Dropdown content:', allText?.substring(0, 500));

  // Try clicking by evaluating DOM directly
  const clicked = await page.evaluate(() => {
    // Find all elements containing template-like text
    const all = document.querySelectorAll('*');
    for (const el of all) {
      if (el.textContent?.trim() === 'Buy an Existing Business' && el.childElementCount === 0) {
        el.click();
        return 'clicked: ' + el.tagName + '.' + el.className;
      }
    }
    // Try any element with "Startup"
    for (const el of all) {
      const text = el.textContent?.trim() || '';
      if (text.includes('Startup') && text.length < 50 && el.childElementCount < 3) {
        el.click();
        return 'clicked: ' + el.tagName + ' - ' + text;
      }
    }
    return 'nothing found';
  });
  console.log('Click result:', clicked);
  await page.waitForTimeout(3000);

  // Check if nodes loaded
  const hasNodes = await page.locator('.sim-node--card').isVisible({ timeout: 10000 }).catch(() => false);
  if (!hasNodes) {
    await page.screenshot({ path: '/tmp/demo-debug-final.png' });
    console.log('No nodes loaded. Saved debug screenshot.');
    await context.close();
    await browser.close();
    return;
  }

  console.log('Template loaded! Recording...');
  await page.waitForTimeout(2000);

  // Focus canvas and start sim
  await page.locator('.react-flow').first().click({ position: { x: 640, y: 360 } });
  await page.waitForTimeout(300);
  await page.keyboard.press('Space');
  await page.waitForTimeout(1500);

  // Skip pruning
  const skipBtn = page.locator('button:has-text("Skip")');
  if (await skipBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await skipBtn.click();
  }

  console.log('Recording simulation (20s)...');
  await page.waitForTimeout(20000);

  console.log('Capturing results (4s)...');
  await page.waitForTimeout(4000);

  const videoPath = await page.video()?.path();
  await context.close();
  await browser.close();

  if (videoPath) {
    console.log(`Raw: ${videoPath}`);
    const { execSync } = await import('child_process');

    const mp4 = '/tmp/simulator-demo.mp4';
    execSync(`ffmpeg -y -i "${videoPath}" -c:v libx264 -preset slow -crf 23 -vf "fps=30" -an -movflags +faststart "${mp4}"`, { stdio: 'inherit' });

    const webm = '/tmp/simulator-demo.webm';
    execSync(`ffmpeg -y -i "${videoPath}" -c:v libvpx-vp9 -crf 35 -b:v 0 -vf "fps=24" -an "${webm}"`, { stdio: 'inherit' });

    const { statSync } = await import('fs');
    console.log(`MP4: ${(statSync(mp4).size / 1024 / 1024).toFixed(1)}MB`);
    console.log(`WebM: ${(statSync(webm).size / 1024 / 1024).toFixed(1)}MB`);
    console.log('Done!');
  }
}

main().catch(e => { console.error(e); process.exit(1); });
