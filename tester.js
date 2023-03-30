// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const jp = require('jsonpath');

// console.log(jp.parse('$.bob_er'));

const doc = fs.readFileSync('./example-doc.yaml', {
  encoding: 'utf-8',
});

const body = {
  key: 'global-admins',
  yaml: doc,
};

console.log(JSON.stringify(body, null, '  '));
