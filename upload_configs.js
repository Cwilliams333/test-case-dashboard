const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'testcase_user',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'testcase_configs',
  password: process.env.DB_PASSWORD || '12345',
  port: process.env.DB_PORT || 5432
});

async function uploadConfigs() {
  const configDir = process.env.CONFIG_DIR || '/home/player2vscpu/Desktop/test-case-dashboard/Docs/dut_configurations';
  const pythiaPath = process.env.PYTHIA_CONFIG || '/home/player2vscpu/Desktop/test-case-dashboard/Docs/pythia.conf';
  
  console.log('Configuration paths:');
  console.log(`  CONFIG_DIR: ${configDir}`);
  console.log(`  PYTHIA_CONFIG: ${pythiaPath}`);

  try {
    // Upload device configs (.ini files)
    const files = await fs.readdir(configDir);
    for (const file of files) {
      if (file.endsWith('.ini')) {
        const filePath = path.join(configDir, file);
        const content = await fs.readFile(filePath, 'utf8');
        await pool.query(
          `INSERT INTO config_files (filename, content, type, file_path)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (filename)
           DO UPDATE SET content = EXCLUDED.content,
                        file_path = EXCLUDED.file_path,
                        updated_at = CURRENT_TIMESTAMP`,
          [file, content, 'device', filePath]
        );
        console.log(`Uploaded ${file}`);
      }
    }

    // Upload pythia.conf
    const pythiaContent = await fs.readFile(pythiaPath, 'utf8');
    await pool.query(
      `INSERT INTO config_files (filename, content, type, file_path)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (filename)
       DO UPDATE SET content = EXCLUDED.content,
                    file_path = EXCLUDED.file_path,
                    updated_at = CURRENT_TIMESTAMP`,
      ['pythia.conf', pythiaContent, 'pythia', pythiaPath]
    );
    console.log('Uploaded pythia.conf');
  } catch (error) {
    console.error('Error uploading configs:', error);
  } finally {
    await pool.end();
  }
}

uploadConfigs();