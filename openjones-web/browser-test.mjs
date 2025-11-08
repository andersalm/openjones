import { chromium } from 'playwright';

async function test() {
  let browser;
  try {
    console.log('🚀 Launching browser...');
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const context = await browser.newContext();
    const page = await context.newPage();

    const errors = [];
    const consoleMessages = [];

    // Capture console messages
    page.on('console', msg => {
      const text = msg.text();
      consoleMessages.push({ type: msg.type(), text });
      if (msg.type() === 'error') {
        errors.push(`Console Error: ${text}`);
      }
    });

    // Capture page errors
    page.on('pageerror', error => {
      errors.push(`Page Error: ${error.message}\n${error.stack}`);
    });

    console.log('📍 Loading http://localhost:8080...');
    await page.goto('http://localhost:8080', {
      waitUntil: 'networkidle',
      timeout: 15000
    });

    console.log('✅ Page loaded\n');

    // Wait a bit for React to render
    await page.waitForTimeout(3000);

    // Check for errors
    if (errors.length > 0) {
      console.log('❌ ERRORS DETECTED:');
      errors.forEach(err => console.log(err));
      console.log('');
    }

    // Check console output
    console.log('📝 Console messages:');
    consoleMessages.slice(-10).forEach(msg => {
      console.log(`  [${msg.type}] ${msg.text}`);
    });
    console.log('');

    // Check if React rendered
    const rootHtml = await page.$eval('#root', el => el.innerHTML).catch(() => '');
    console.log(`📦 Root element: ${rootHtml.length} characters`);

    if (rootHtml.length < 100) {
      console.log('❌ React app may not have rendered!');
      console.log('Root content:', rootHtml.substring(0, 200));
    }

    // Get page text
    const bodyText = await page.textContent('body');
    console.log('\n📄 Page text preview:');
    console.log(bodyText.substring(0, 500));

    // Take screenshot
    await page.screenshot({ path: '/home/user/openjones/screenshot.png' });
    console.log('\n📸 Screenshot saved to /home/user/openjones/screenshot.png');

    await browser.close();

    if (errors.length > 0) {
      console.log('\n❌ Test failed with errors');
      process.exit(1);
    } else {
      console.log('\n✅ Test completed');
      process.exit(0);
    }

  } catch (error) {
    console.error('❌ Test crashed:', error.message);
    console.error(error.stack);
    if (browser) await browser.close();
    process.exit(1);
  }
}

test();
