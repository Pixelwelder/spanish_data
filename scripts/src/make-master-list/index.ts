import csv from 'csv-parser';
import fs from 'fs';

const makeMasterList = () => {
  const filename = 'frequency.csv';
  const path = '..';
  const columnName = 'spanish';
  const md = '';
  const mdPath = '../../Words - Master.md';
  
  const values: string[] = [];
  
  let count = 1;
  fs.createReadStream(`${path}/${filename}`)
    .pipe(csv())
    .on('data', (row) => {
      if (row[columnName]) {
        values.push(`${count}. ${row[columnName]}`);
        count++;
      }
    })
    .on('end', () => {
      const content = md + values.join('\n');
      fs.writeFileSync(mdPath, content);
      console.log('Master list created successfully!');
    });
};

makeMasterList();
