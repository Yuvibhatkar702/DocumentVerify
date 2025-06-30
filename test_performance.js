const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// API endpoints
const BACKEND_URL = 'http://localhost:5000';
const AI_ML_URL = 'http://localhost:8000';

class PerformanceTester {
  constructor() {
    this.metrics = {
      responseTime: [],
      throughput: [],
      errorRate: [],
      concurrency: []
    };
  }

  // Performance test for API endpoints
  async testAPIPerformance() {
    console.log('⚡ Starting API Performance Tests\n');
    
    const tests = [
      {
        name: 'Health Check Performance',
        url: `${AI_ML_URL}/`,
        method: 'GET',
        iterations: 50
      },
      {
        name: 'Text Extraction Performance',
        url: `${AI_ML_URL}/extract-text`,
        method: 'POST',
        data: { text: 'Performance test document with sample content for processing' },
        iterations: 20
      },
      {
        name: 'Document Classification Performance',
        url: `${AI_ML_URL}/classify-document`,
        method: 'POST',
        data: { 
          document_type: 'passport',
          text_content: 'Passport United States of America John Doe P123456789'
        },
        iterations: 20
      }
    ];

    for (const test of tests) {
      await this.runPerformanceTest(test);
    }

    this.printPerformanceResults();
  }

  async runPerformanceTest(testConfig) {
    console.log(`🏁 Running: ${testConfig.name}`);
    
    const times = [];
    let errors = 0;
    
    const startTime = Date.now();
    
    // Sequential requests
    for (let i = 0; i < testConfig.iterations; i++) {
      const requestStart = Date.now();
      
      try {
        const response = await axios({
          method: testConfig.method,
          url: testConfig.url,
          data: testConfig.data,
          timeout: 10000
        });
        
        const requestTime = Date.now() - requestStart;
        times.push(requestTime);
        
        if (i % 10 === 0) {
          process.stdout.write('.');
        }
        
      } catch (error) {
        errors++;
        times.push(Date.now() - requestStart);
      }
    }
    
    const totalTime = Date.now() - startTime;
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const throughput = (testConfig.iterations / totalTime) * 1000; // requests per second
    const errorRate = (errors / testConfig.iterations) * 100;
    
    console.log(`\n  📊 Results for ${testConfig.name}:`);
    console.log(`     Average Response Time: ${avgTime.toFixed(2)}ms`);
    console.log(`     Min Response Time: ${minTime}ms`);
    console.log(`     Max Response Time: ${maxTime}ms`);
    console.log(`     Throughput: ${throughput.toFixed(2)} requests/sec`);
    console.log(`     Error Rate: ${errorRate.toFixed(2)}%`);
    console.log(`     Total Time: ${totalTime}ms\n`);
    
    // Store metrics
    this.metrics.responseTime.push({
      test: testConfig.name,
      avg: avgTime,
      min: minTime,
      max: maxTime
    });
    
    this.metrics.throughput.push({
      test: testConfig.name,
      value: throughput
    });
    
    this.metrics.errorRate.push({
      test: testConfig.name,
      value: errorRate
    });
  }

  // Concurrent request testing
  async testConcurrency() {
    console.log('🚀 Testing Concurrent Request Handling\n');
    
    const concurrencyLevels = [1, 5, 10, 20];
    
    for (const level of concurrencyLevels) {
      await this.testConcurrentRequests(level);
    }
  }

  async testConcurrentRequests(concurrency) {
    console.log(`🔄 Testing ${concurrency} concurrent requests...`);
    
    const startTime = Date.now();
    const promises = [];
    
    for (let i = 0; i < concurrency; i++) {
      const promise = axios.post(`${AI_ML_URL}/extract-text`, {
        text: `Concurrent test request #${i + 1} with sample document content`
      }, { timeout: 15000 });
      
      promises.push(promise);
    }
    
    try {
      const results = await Promise.allSettled(promises);
      const totalTime = Date.now() - startTime;
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      console.log(`  ✅ Concurrent Level ${concurrency}:`);
      console.log(`     Successful: ${successful}/${concurrency}`);
      console.log(`     Failed: ${failed}/${concurrency}`);
      console.log(`     Total Time: ${totalTime}ms`);
      console.log(`     Avg Time per Request: ${(totalTime / concurrency).toFixed(2)}ms\n`);
      
      this.metrics.concurrency.push({
        level: concurrency,
        successful: successful,
        failed: failed,
        totalTime: totalTime,
        avgTime: totalTime / concurrency
      });
      
    } catch (error) {
      console.log(`  ❌ Concurrency test failed: ${error.message}\n`);
    }
  }

  // Memory and resource usage simulation
  async testResourceUsage() {
    console.log('💾 Testing Resource Usage\n');
    
    // Test with progressively larger payloads
    const payloadSizes = [
      { name: 'Small', size: 100 },
      { name: 'Medium', size: 1000 },
      { name: 'Large', size: 10000 },
      { name: 'Extra Large', size: 50000 }
    ];
    
    for (const payload of payloadSizes) {
      await this.testPayloadSize(payload);
    }
  }

  async testPayloadSize(payloadConfig) {
    console.log(`📦 Testing ${payloadConfig.name} payload (${payloadConfig.size} chars)...`);
    
    const largeText = 'A'.repeat(payloadConfig.size);
    
    const startTime = Date.now();
    const startMemory = process.memoryUsage();
    
    try {
      const response = await axios.post(`${AI_ML_URL}/extract-text`, {
        text: largeText
      }, { timeout: 20000 });
      
      const endTime = Date.now();
      const endMemory = process.memoryUsage();
      
      console.log(`  ✅ ${payloadConfig.name} payload processed in ${endTime - startTime}ms`);
      console.log(`     Memory delta: ${((endMemory.heapUsed - startMemory.heapUsed) / 1024 / 1024).toFixed(2)}MB\n`);
      
    } catch (error) {
      console.log(`  ❌ ${payloadConfig.name} payload failed: ${error.message}\n`);
    }
  }

  printPerformanceResults() {
    console.log('📈 Performance Test Summary');
    console.log('=' .repeat(60));
    
    // Response Time Summary
    console.log('\n⏱️  Response Time Analysis:');
    this.metrics.responseTime.forEach(metric => {
      console.log(`   ${metric.test}:`);
      console.log(`     Avg: ${metric.avg.toFixed(2)}ms | Min: ${metric.min}ms | Max: ${metric.max}ms`);
    });
    
    // Throughput Summary
    console.log('\n🚀 Throughput Analysis:');
    this.metrics.throughput.forEach(metric => {
      console.log(`   ${metric.test}: ${metric.value.toFixed(2)} req/sec`);
    });
    
    // Error Rate Summary
    console.log('\n🎯 Error Rate Analysis:');
    this.metrics.errorRate.forEach(metric => {
      console.log(`   ${metric.test}: ${metric.value.toFixed(2)}%`);
    });
    
    // Concurrency Summary
    console.log('\n🔄 Concurrency Analysis:');
    this.metrics.concurrency.forEach(metric => {
      const successRate = ((metric.successful / (metric.successful + metric.failed)) * 100).toFixed(2);
      console.log(`   Level ${metric.level}: ${successRate}% success, ${metric.avgTime.toFixed(2)}ms avg`);
    });
    
    console.log('\n' + '=' .repeat(60));
  }
}

// Stress Testing
class StressTester {
  constructor() {
    this.stressResults = [];
  }

  async runStressTest() {
    console.log('💪 Starting Stress Tests\n');
    
    const stressScenarios = [
      {
        name: 'Rapid Fire Requests',
        requests: 100,
        delay: 10 // ms between requests
      },
      {
        name: 'Sustained Load',
        requests: 50,
        delay: 100
      },
      {
        name: 'Burst Load',
        requests: 200,
        delay: 5
      }
    ];
    
    for (const scenario of stressScenarios) {
      await this.runStressScenario(scenario);
    }
    
    this.printStressResults();
  }

  async runStressScenario(scenario) {
    console.log(`💥 Running: ${scenario.name}`);
    console.log(`   Requests: ${scenario.requests}, Delay: ${scenario.delay}ms`);
    
    let successful = 0;
    let failed = 0;
    const times = [];
    
    const startTime = Date.now();
    
    for (let i = 0; i < scenario.requests; i++) {
      const requestStart = Date.now();
      
      try {
        await axios.post(`${AI_ML_URL}/extract-text`, {
          text: `Stress test request ${i + 1}`
        }, { timeout: 5000 });
        
        successful++;
        times.push(Date.now() - requestStart);
        
      } catch (error) {
        failed++;
      }
      
      // Add delay between requests
      if (scenario.delay > 0) {
        await new Promise(resolve => setTimeout(resolve, scenario.delay));
      }
      
      // Progress indicator
      if (i % 20 === 0) {
        process.stdout.write('.');
      }
    }
    
    const totalTime = Date.now() - startTime;
    const avgResponseTime = times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
    const successRate = (successful / scenario.requests) * 100;
    
    console.log(`\n  📊 ${scenario.name} Results:`);
    console.log(`     Success Rate: ${successRate.toFixed(2)}% (${successful}/${scenario.requests})`);
    console.log(`     Avg Response Time: ${avgResponseTime.toFixed(2)}ms`);
    console.log(`     Total Duration: ${totalTime}ms`);
    console.log(`     Requests/sec: ${((scenario.requests / totalTime) * 1000).toFixed(2)}\n`);
    
    this.stressResults.push({
      name: scenario.name,
      successRate: successRate,
      avgResponseTime: avgResponseTime,
      totalTime: totalTime,
      throughput: (scenario.requests / totalTime) * 1000
    });
  }

  printStressResults() {
    console.log('💪 Stress Test Summary');
    console.log('=' .repeat(50));
    
    this.stressResults.forEach(result => {
      console.log(`\n${result.name}:`);
      console.log(`  Success Rate: ${result.successRate.toFixed(2)}%`);
      console.log(`  Avg Response: ${result.avgResponseTime.toFixed(2)}ms`);
      console.log(`  Throughput: ${result.throughput.toFixed(2)} req/sec`);
    });
    
    console.log('\n' + '=' .repeat(50));
  }
}

// Main execution function
async function runPerformanceTests() {
  console.log('🎯 Document Verification System - Performance Testing Suite\n');
  
  const performanceTester = new PerformanceTester();
  const stressTester = new StressTester();
  
  try {
    // Run performance tests
    await performanceTester.testAPIPerformance();
    await performanceTester.testConcurrency();
    await performanceTester.testResourceUsage();
    
    // Run stress tests
    await stressTester.runStressTest();
    
    console.log('🎉 All performance tests completed!');
    
  } catch (error) {
    console.error('🚨 Performance testing failed:', error);
  }
}

module.exports = { PerformanceTester, StressTester, runPerformanceTests };

// Run if called directly
if (require.main === module) {
  runPerformanceTests();
}
