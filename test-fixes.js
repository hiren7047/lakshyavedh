// Quick test script to verify fixes
const mysql = require('mysql2/promise');
require('dotenv').config();

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...');
  
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'u533366727_lakshyavedh'
  };

  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connection successful!');
    
    // Test if tables exist
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 Tables found:', tables.map(t => Object.values(t)[0]));
    
    await connection.end();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

async function testAPIEndpoint() {
  console.log('🔍 Testing API endpoint...');
  
  try {
    const response = await fetch('http://localhost:5000/api/health');
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API endpoint working:', data);
      return true;
    } else {
      console.error('❌ API endpoint failed:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ API endpoint error:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Testing Lakshyavedh fixes...\n');
  
  const dbTest = await testDatabaseConnection();
  console.log();
  
  const apiTest = await testAPIEndpoint();
  console.log();
  
  if (dbTest && apiTest) {
    console.log('🎉 All tests passed! Your fixes are working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please check the configuration.');
  }
}

main().catch(console.error);
