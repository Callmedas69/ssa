const { keccak256, toBytes } = require('viem');

console.log('Provider ID Calculations:');
console.log('=========================');
console.log('ETHOS:', keccak256(toBytes('ETHOS')));
console.log('NEYNAR:', keccak256(toBytes('NEYNAR')));
console.log('TALENTBUILDER:', keccak256(toBytes('TALENTBUILDER')));
console.log('TALENTCREATOR:', keccak256(toBytes('TALENTCREATOR')));
console.log('PASSPORT:', keccak256(toBytes('PASSPORT')));
console.log('QUOTIENT:', keccak256(toBytes('QUOTIENT')));
console.log('\nWith underscores:');
console.log('TALENT_BUILDER:', keccak256(toBytes('TALENT_BUILDER')));
console.log('TALENT_CREATOR:', keccak256(toBytes('TALENT_CREATOR')));
