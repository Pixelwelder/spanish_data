import csv from 'csv-parser';
import fs from 'fs';

const makeMasterList = () => {
  const filename = 'frequency.csv';
  const path = '..';
  const columnName = 'spanish';
  const md = '# Master List\n\n';
  const mdPath = '../frequency.md';
  
  const values: string[] = [];
  
  fs.createReadStream(`${path}/${filename}`)
    .pipe(csv())
    .on('data', (row) => {
      if (row[columnName]) {
        values.push(`[[${row[columnName]}]]`);
      }
    })
    .on('end', () => {
      const content = md + values.join('\n');
      fs.writeFileSync(mdPath, content);
      console.log('Master list created successfully!');
    });
};

makeMasterList();
