#!/usr/bin/env node
/**
 * Accessibility Testing Script for s2-docs
 *
 * This script opens each documentation page in Playwright and checks for Axe accessibility errors.
 *
 * Usage:
 *   node scripts/testAccessibility.mjs [options]
 *
 * Options:
 *   --library <s2|react-aria|all>  Which docs to test (default: all)
 *   --base-url <url>               Base URL for the docs server (default: http://localhost:1234)
 *   --headless <true|false>        Run in headless mode (default: true)
 *   --no-html-ext                  Don't add .html extension to URLs (for CloudFront deployments)
 *   --strip-prefix                 Strip the s2/ or react-aria/ prefix from URLs
 *
 * Examples:
 *   node scripts/testAccessibility.mjs
 *   node scripts/testAccessibility.mjs --library s2
 *   node scripts/testAccessibility.mjs --base-url https://cloudfront.net/pr/xyz --no-html-ext --strip-prefix
 */

import {chromium} from 'playwright';
import fastGlob from 'fast-glob';
import {fileURLToPath} from 'url';
import {getAxeResults, injectAxe} from 'axe-playwright';
import path from 'path';

const {glob} = fastGlob;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pagesDir = path.resolve(__dirname, '../pages');

/**
 * Known false positives in React Spectrum components.
 * These are documented accessibility tool issues that don't represent actual a11y problems.
 * See: https://react-spectrum.adobe.com/react-spectrum/accessibility.html
 *
 * Format: { pagePattern: [ruleIds to ignore] }
 * - pagePattern can be a string (exact match) or regex pattern
 * - ruleIds are axe-core rule identifiers
 */
const KNOWN_FALSE_POSITIVES = {
  // ListBox: WAI-ARIA 1.2 supports groups in listbox, but axe-core hasn't caught up
  // https://github.com/dequelabs/axe-core/issues/3152
  'ListBox': ['aria-required-children', 'aria-required-parent'],

  // Picker: HiddenSelect with aria-hidden contains focusable element that auto-shifts focus
  // Elements are labeled with data-a11y-ignore="aria-hidden-focus"
  'Picker': ['aria-hidden-focus'],
  'Select': ['aria-hidden-focus'],

  // Menu/ActionMenu/Overlays: aria-hidden applied to elements outside overlay
  // https://github.com/adobe/react-spectrum/blob/main/packages/@react-aria/overlays/src/ariaHideOutside.ts
  'Menu': ['aria-hidden-focus'],
  'ActionMenu': ['aria-hidden-focus'],
  'Popover': ['aria-hidden-focus'],
  'Dialog': ['aria-hidden-focus'],
  'Modal': ['aria-hidden-focus'],
  'ComboBox': ['aria-hidden-focus'],

  // TableView: body div has tabIndex={-1} for Firefox, triggers false positive
  // Also: scrollable region is inside table, focus moves appropriately on interaction
  // https://github.com/adobe/react-spectrum/pull/3520
  'TableView': ['aria-required-children', 'scrollable-region-focusable'],
  'Table': ['aria-required-children', 'scrollable-region-focusable'],

  // Meter: axe-core bug with aria-value* attributes
  // https://github.com/dequelabs/axe-core/issues/3768
  'Meter': ['aria-allowed-attr']
};

/**
 * Get the list of rule IDs to ignore for a given page path.
 */
function getIgnoredRulesForPage(mdxPath) {
  const ignoredRules = new Set();

  // Extract the component name from the path (e.g., "s2/ListBox.mdx" -> "ListBox")
  const fileName = path.basename(mdxPath, '.mdx');

  // Check if this component has known false positives
  for (const [pattern, rules] of Object.entries(KNOWN_FALSE_POSITIVES)) {
    if (fileName === pattern || fileName.startsWith(pattern + '/')) {
      rules.forEach(rule => ignoredRules.add(rule));
    }
  }

  return ignoredRules;
}

/**
 * Filter out known false positive violations from axe results.
 */
function filterFalsePositives(violations, ignoredRules) {
  if (ignoredRules.size === 0) {
    return violations;
  }

  return violations.filter(v => !ignoredRules.has(v.id));
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    library: 'all',
    baseUrl: 'http://localhost:1234',
    headless: true,
    htmlExt: true,
    stripPrefix: false
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--library':
        options.library = args[++i];
        break;
      case '--base-url':
        options.baseUrl = args[++i].replace(/\/$/, ''); // Remove trailing slash
        break;
      case '--headless':
        options.headless = args[++i] !== 'false';
        break;
      case '--no-html-ext':
        options.htmlExt = false;
        break;
      case '--strip-prefix':
        options.stripPrefix = true;
        break;
    }
  }

  return options;
}

// Get all MDX page paths
async function getPagePaths(library) {
  const patterns = [];

  if (library === 'all' || library === 's2') {
    patterns.push('s2/**/*.mdx');
  }
  if (library === 'all' || library === 'react-aria') {
    patterns.push('react-aria/**/*.mdx');
  }

  const files = await glob(patterns, {cwd: pagesDir});
  return files;
}

// Convert MDX file path to URL path
function mdxToUrl(mdxPath, options) {
  // Remove .mdx extension
  let urlPath = mdxPath.replace(/\.mdx$/, '');

  // Handle index pages
  if (urlPath.endsWith('/index')) {
    urlPath = urlPath.slice(0, -6);
  }

  // Optionally strip the s2/ or react-aria/ prefix
  if (options.stripPrefix) {
    urlPath = urlPath.replace(/^(s2|react-aria)\//, '');
  }

  // Optionally add .html extension
  if (options.htmlExt) {
    urlPath = urlPath + '.html';
  }

  return `${options.baseUrl}/${urlPath}`;
}

// Format Axe results for display
function formatAxeResults(results, url, ignoredRules = new Set()) {
  let violations = results.violations;

  // Filter out known false positives
  violations = filterFalsePositives(violations, ignoredRules);

  if (violations.length === 0) {
    return null;
  }

  return {
    url,
    violations: violations.map(v => ({
      id: v.id,
      impact: v.impact,
      description: v.description,
      help: v.help,
      helpUrl: v.helpUrl,
      nodes: v.nodes.map(n => ({
        html: n.html.slice(0, 200),
        target: n.target,
        failureSummary: n.failureSummary
      }))
    }))
  };
}

// Main test function
async function testAccessibility() {
  const options = parseArgs();
  let browser;
  const allResults = [];
  const pageResults = [];
  let totalPages = 0;
  let pagesWithViolations = 0;
  let totalViolations = 0;

  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║        S2-DOCS ACCESSIBILITY TESTING WITH AXE                  ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log(`\nLibrary: ${options.library}`);
  console.log(`Base URL: ${options.baseUrl}`);
  console.log(`Headless: ${options.headless}`);
  console.log(`HTML extension: ${options.htmlExt}`);
  console.log(`Strip prefix: ${options.stripPrefix}\n`);

  try {
    // Get all pages to test
    const mdxFiles = await getPagePaths(options.library);
    console.log(`Found ${mdxFiles.length} pages to test\n`);

    if (mdxFiles.length === 0) {
      console.log('No pages found to test.');
      return 0;
    }

    // Launch browser
    browser = await chromium.launch({headless: options.headless});
    const context = await browser.newContext({
      viewport: {width: 1280, height: 720}
    });

    // Test connectivity with the first page
    const firstMdxFile = mdxFiles[0];
    const firstUrl = mdxToUrl(firstMdxFile, options);
    console.log('Checking server connectivity...');
    console.log(`Testing URL: ${firstUrl}`);

    const testPage = await context.newPage();
    try {
      const response = await testPage.goto(firstUrl, {
        waitUntil: 'networkidle',
        timeout: 15000
      });

      if (!response || !response.ok()) {
        console.error('\n❌ Failed to connect to server');
        console.error(`   URL: ${firstUrl}`);
        console.error(`   Status: ${response ? response.status() : 'No response'}`);
        console.error('\nPossible causes:');
        console.error('  - The base URL path structure may not match the deployment');
        console.error('  - The documentation server may not be running');
        console.error('\nFor local development, start with: yarn start:s2-docs');
        return 1;
      }
      console.log('✓ Server is reachable\n');
    } catch (error) {
      console.error('\n❌ Failed to connect to server');
      console.error(`   URL: ${firstUrl}`);
      console.error(`   Error: ${error.message}`);
      console.error('\nPossible causes:');
      console.error('  - The base URL path structure may not match the deployment');
      console.error('  - The documentation server may not be running');
      console.error('\nFor local development, start with: yarn start:s2-docs');
      await testPage.close();
      return 1;
    }
    await testPage.close();

    // Test each page
    for (let i = 0; i < mdxFiles.length; i++) {
      const mdxFile = mdxFiles[i];
      const url = mdxToUrl(mdxFile, options);
      totalPages++;

      process.stdout.write(`[${i + 1}/${mdxFiles.length}] Testing: ${mdxFile}... `);

      const page = await context.newPage();

      try {
        await page.goto(url, {
          waitUntil: 'networkidle',
          timeout: 30000
        });

        // Wait a bit for any JS to settle
        await page.waitForTimeout(500);

        // Inject axe-core into the page
        await injectAxe(page);

        // Run Axe accessibility tests
        const axeResults = await getAxeResults(page, null, {
          runOnly: {
            type: 'tag',
            values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
          }
        });

        // Get ignored rules for this page (known false positives)
        const ignoredRules = getIgnoredRulesForPage(mdxFile);
        const formattedResults = formatAxeResults(axeResults, url, ignoredRules);

        if (formattedResults) {
          pagesWithViolations++;
          totalViolations += formattedResults.violations.length;
          allResults.push(formattedResults);
          pageResults.push({
            page: mdxFile,
            url,
            status: 'violations',
            violationCount: formattedResults.violations.length,
            violations: formattedResults.violations.map(v => `${v.id} (${v.impact})`)
          });
          console.log(`❌ ${formattedResults.violations.length} violation(s)`);
        } else {
          pageResults.push({
            page: mdxFile,
            url,
            status: 'pass',
            violationCount: 0
          });
          console.log('✓ Pass');
        }
      } catch (error) {
        pageResults.push({
          page: mdxFile,
          url,
          status: 'error',
          error: error.message
        });
        console.log(`⚠ Error: ${error.message.slice(0, 50)}...`);
      } finally {
        await page.close();
      }
    }

    // Print summary
    console.log('\n');
    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║                        TEST SUMMARY                            ║');
    console.log('╚════════════════════════════════════════════════════════════════╝');
    console.log(`\nTotal pages tested: ${totalPages}`);
    console.log(`Pages with violations: ${pagesWithViolations}`);
    console.log(`Pages passing: ${totalPages - pagesWithViolations}`);
    console.log(`Total violations: ${totalViolations}`);

    // Print detailed violations
    if (allResults.length > 0) {
      console.log('\n');
      console.log('╔════════════════════════════════════════════════════════════════╗');
      console.log('║                    DETAILED VIOLATIONS                         ║');
      console.log('╚════════════════════════════════════════════════════════════════╝');

      for (const result of allResults) {
        console.log(`\n📄 ${result.url}`);
        console.log('─'.repeat(70));

        for (const violation of result.violations) {
          console.log(`\n  🔴 ${violation.id} [${violation.impact?.toUpperCase()}]`);
          console.log(`     ${violation.description}`);
          console.log(`     Help: ${violation.help}`);
          console.log(`     More info: ${violation.helpUrl}`);

          // eslint-disable-next-line max-depth
          for (const node of violation.nodes.slice(0, 3)) {
            console.log(`\n     Element: ${node.html}`);
            // eslint-disable-next-line max-depth
            if (node.target.length > 0) {
              console.log(`     Selector: ${node.target.join(' > ')}`);
            }
            // eslint-disable-next-line max-depth
            if (node.failureSummary) {
              console.log(`     Issue: ${node.failureSummary}`);
            }
          }

          // eslint-disable-next-line max-depth
          if (violation.nodes.length > 3) {
            console.log(`\n     ... and ${violation.nodes.length - 3} more element(s)`);
          }
        }
      }
    }

    // Print pages with errors
    const errorPages = pageResults.filter(p => p.status === 'error');
    if (errorPages.length > 0) {
      console.log('\n');
      console.log('╔════════════════════════════════════════════════════════════════╗');
      console.log('║                    PAGES WITH ERRORS                           ║');
      console.log('╚════════════════════════════════════════════════════════════════╝');

      for (const page of errorPages) {
        console.log(`\n⚠ ${page.page}`);
        console.log(`  Error: ${page.error}`);
      }
    }

    // Final status
    console.log('\n');
    if (pagesWithViolations === 0 && errorPages.length === 0) {
      console.log('🎉 All pages passed accessibility testing!');
    } else {
      console.log(`⚠ Found accessibility issues in ${pagesWithViolations} page(s)`);
      if (errorPages.length > 0) {
        console.log(`⚠ ${errorPages.length} page(s) had errors during testing`);
      }
    }

    // Exit with appropriate code
    return pagesWithViolations > 0 || errorPages.length > 0 ? 1 : 0;

  } catch (error) {
    console.error('\n❌ Fatal error during testing:', error);
    return 1;
  } finally {
    // Cleanup
    if (browser) {
      await browser.close();
    }
  }
}

// Run the tests
testAccessibility().then(exitCode => {
  process.exit(exitCode);
});
