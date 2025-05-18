const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');

const pool = new Pool({
  user: 'testcase_user',
  host: 'localhost',
  database: 'testcase_configs',
  password: '12345',
  port: 5432
});

async function uploadConfigs() {
  const configDir = '/home/player3vsgpt/Documents/dut_configurations';
  const pythiaPath = '/home/player3vsgpt/Documents/pythia.conf';

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