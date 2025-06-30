#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

class TestRunner {
  constructor() {
    this.testSuites = [
      {
        name: 'Basic API Tests',
        file: 'test_api.js',
        description: 'Tests core API functionality and authentication',
        enabled: true
      },
      {
        name: 'File Upload Tests',
        file: 'test_file_upload.js',
        description: 'Tests file upload scenarios and validation',
        enabled: true
      },
      {
        name: 'Performance Tests',
        file: 'test_performance.js',
        description: 'Tests system performance and load handling',
        enabled: true
      }
    ];
    
    this.results = {};
  }

  async runAllTests() {
    console.log('🚀 Document Verification System - Automated Test Suite');
    console.log('=' .repeat(60));
    
    // Check if services are running
    await this.checkServices();
    
    console.log('\n📋 Available Test Suites:');
    this.testSuites.forEach((suite, index) => {
      const status = suite.enabled ? '✅ Enabled' : '❌ Disabled';
      console.log(`  ${index + 1}. ${suite.name} - ${status}`);
      console.log(`     ${suite.description}`);
    });
    
    console.log('\n🧪 Running Test Suites...\n');
    
    for (const suite of this.testSuites) {
      if (suite.enabled) {
        await this.runTestSuite(suite);
      }
    }
    
    this.generateTestReport();
  }

  async checkServices() {
    console.log('🔍 Checking service availability...');
    
    const services = [
      { name: 'Frontend', url: 'http://localhost:3000', required: false },
      { name: 'Backend', url: 'http://localhost:5000/api/health', required: true },
      { name: 'AI/ML Service', url: 'http://localhost:8000/', required: true }
    ];
    
    for (const service of services) {
      try {
        const axios = require('axios');
        await axios.get(service.url, { timeout: 5000 });
        console.log(`  ✅ ${service.name}: Running`);
      } catch (error) {
        const status = service.required ? '❌ REQUIRED' : '⚠️  Optional';
        console.log(`  ${status} ${service.name}: Not available`);
        
        if (service.required) {
          console.log(`\n🚨 Error: ${service.name} is required but not running!`);
          console.log('Please start all required services before running tests.');
          process.exit(1);
        }
      }
    }
  }

  async runTestSuite(suite) {
    console.log(`\n🧪 Running: ${suite.name}`);
    console.log('-' .repeat(40));
    
    return new Promise((resolve) => {
      const testProcess = spawn('node', [suite.file], {
        stdio: 'inherit',
        cwd: __dirname
      });
      
      testProcess.on('close', (code) => {
        const success = code === 0;
        this.results[suite.name] = {
          success: success,
          exitCode: code,
          description: suite.description
        };
        
        console.log(`\n${success ? '✅' : '❌'} ${suite.name} completed with exit code: ${code}`);
        resolve();
      });
      
      testProcess.on('error', (error) => {
        console.log(`❌ Failed to run ${suite.name}: ${error.message}`);
        this.results[suite.name] = {
          success: false,
          error: error.message,
          description: suite.description
        };
        resolve();
      });
    });
  }

  generateTestReport() {
    console.log('\n📊 Test Execution Summary');
    console.log('=' .repeat(60));
    
    const successful = Object.values(this.results).filter(r => r.success).length;
    const total = Object.keys(this.results).length;
    
    console.log(`\n🎯 Overall Results: ${successful}/${total} test suites passed\n`);
    
    Object.entries(this.results).forEach(([suiteName, result]) => {
      const icon = result.success ? '✅' : '❌';
      console.log(`${icon} ${suiteName}`);
      console.log(`   ${result.description}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
      console.log();
    });
    
    // Generate HTML report
    this.generateHTMLReport();
    
    // Generate JSON report
    this.generateJSONReport();
    
    console.log('📄 Reports generated:');
    console.log('   - test_report.html (detailed HTML report)');
    console.log('   - test_report.json (machine-readable results)');
    
    if (successful === total) {
      console.log('\n🎉 All tests passed successfully!');
      process.exit(0);
    } else {
      console.log('\n⚠️  Some tests failed. Please review the results.');
      process.exit(1);
    }
  }

  generateHTMLReport() {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document Verification System - Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1000px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { background: #e8f5e8; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .test-suite { margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
        .passed { border-left: 5px solid #28a745; background-color: #d4edda; }
        .failed { border-left: 5px solid #dc3545; background-color: #f8d7da; }
        .suite-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
        .suite-description { color: #666; margin-bottom: 10px; }
        .timestamp { text-align: center; color: #666; margin-top: 30px; }
        .stats { display: flex; justify-content: space-around; margin-bottom: 20px; }
        .stat { text-align: center; }
        .stat-number { font-size: 24px; font-weight: bold; }
        .stat-label { color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 Document Verification System</h1>
            <h2>Automated Test Report</h2>
        </div>
        
        <div class="summary">
            <div class="stats">
                <div class="stat">
                    <div class="stat-number">${Object.keys(this.results).length}</div>
                    <div class="stat-label">Total Suites</div>
                </div>
                <div class="stat">
                    <div class="stat-number" style="color: #28a745;">${Object.values(this.results).filter(r => r.success).length}</div>
                    <div class="stat-label">Passed</div>
                </div>
                <div class="stat">
                    <div class="stat-number" style="color: #dc3545;">${Object.values(this.results).filter(r => !r.success).length}</div>
                    <div class="stat-label">Failed</div>
                </div>
            </div>
        </div>
        
        <h3>📋 Test Suite Details</h3>
        ${Object.entries(this.results).map(([name, result]) => `
            <div class="test-suite ${result.success ? 'passed' : 'failed'}">
                <div class="suite-title">
                    ${result.success ? '✅' : '❌'} ${name}
                </div>
                <div class="suite-description">${result.description}</div>
                ${result.error ? `<div style="color: #dc3545; font-weight: bold;">Error: ${result.error}</div>` : ''}
                <div style="font-size: 12px; color: #666;">
                    Exit Code: ${result.exitCode || 'N/A'}
                </div>
            </div>
        `).join('')}
        
        <div class="timestamp">
            Report generated on: ${new Date().toLocaleString()}
        </div>
    </div>
</body>
</html>`;
    
    fs.writeFileSync('test_report.html', html);
  }

  generateJSONReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: Object.keys(this.results).length,
        passed: Object.values(this.results).filter(r => r.success).length,
        failed: Object.values(this.results).filter(r => !r.success).length
      },
      results: this.results
    };
    
    fs.writeFileSync('test_report.json', JSON.stringify(report, null, 2));
  }

  // Interactive test selection
  async runInteractive() {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    console.log('🎯 Interactive Test Runner');
    console.log('Select which test suites to run:\n');
    
    this.testSuites.forEach((suite, index) => {
      console.log(`${index + 1}. ${suite.name} - ${suite.description}`);
    });
    
    console.log('\nOptions:');
    console.log('- Enter numbers separated by commas (e.g., 1,2,3)');
    console.log('- Enter "all" to run all tests');
    console.log('- Enter "none" to exit');
    
    return new Promise((resolve) => {
      rl.question('\nYour selection: ', (answer) => {
        rl.close();
        
        if (answer.toLowerCase() === 'none') {
          console.log('👋 Exiting...');
          process.exit(0);
        }
        
        if (answer.toLowerCase() === 'all') {
          this.runAllTests();
          return;
        }
        
        const selections = answer.split(',').map(n => parseInt(n.trim()) - 1);
        const validSelections = selections.filter(n => n >= 0 && n < this.testSuites.length);
        
        if (validSelections.length === 0) {
          console.log('❌ No valid selections made. Exiting...');
          process.exit(1);
        }
        
        // Disable unselected suites
        this.testSuites.forEach((suite, index) => {
          suite.enabled = validSelections.includes(index);
        });
        
        this.runAllTests();
      });
    });
  }
}

// CLI argument parsing
function parseArgs() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🧪 Document Verification System Test Runner

Usage: node run_tests.js [options]

Options:
  --all          Run all test suites (default)
  --interactive  Interactive test selection
  --api          Run only API tests
  --upload       Run only file upload tests
  --performance  Run only performance tests
  --help, -h     Show this help message

Examples:
  node run_tests.js --all
  node run_tests.js --interactive
  node run_tests.js --api --upload
`);
    process.exit(0);
  }
  
  return {
    interactive: args.includes('--interactive'),
    api: args.includes('--api'),
    upload: args.includes('--upload'),
    performance: args.includes('--performance'),
    all: args.includes('--all') || args.length === 0
  };
}

// Main execution
async function main() {
  const runner = new TestRunner();
  const options = parseArgs();
  
  if (options.interactive) {
    await runner.runInteractive();
    return;
  }
  
  // Configure test suites based on options
  if (!options.all) {
    runner.testSuites.forEach(suite => {
      suite.enabled = false;
      if (options.api && suite.file === 'test_api.js') suite.enabled = true;
      if (options.upload && suite.file === 'test_file_upload.js') suite.enabled = true;
      if (options.performance && suite.file === 'test_performance.js') suite.enabled = true;
    });
  }
  
  await runner.runAllTests();
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { TestRunner };
