import {s1_to_s2} from './s1-to-s2/src';

async function runCodemod() {
  let codemod = process.argv[2];

  switch (codemod) {
    case 's1-to-s2':
      await s1_to_s2();
    default:
      console.log('No codemod found. Available codemods: s1-to-s2');
  }
}

runCodemod();
