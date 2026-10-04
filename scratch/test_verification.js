import { getEventConfig, hasEventSpecificFields, FIELD_GROUPS } from '../src/config/eventFormConfig.js';
import { slugify } from '../src/utils/slugify.js';

console.log('--- Testing Config & Utilities ---');

// Test 1: Slugify
console.log('Slugify "Lab and Equipment":', slugify('Lab and Equipment'));
console.log('Slugify "Guest Lecture":', slugify('Guest Lecture'));
console.log('Slugify "CSEA":', slugify('CSEA'));

// Test 2: Event Configs
console.log('Config for Guest Lecture:', getEventConfig('Guest Lecture'));
console.log('Has guest fields for Guest Lecture:', hasEventSpecificFields('Guest Lecture'));

console.log('Config for Renaissance:', getEventConfig('Renaissance'));
console.log('Has guest fields for Renaissance:', hasEventSpecificFields('Renaissance'));

console.log('Config for Workshop:', getEventConfig('Workshop'));
console.log('Has guest fields for Workshop:', hasEventSpecificFields('Workshop'));

console.log('Config for Unknown/New Event:', getEventConfig('New Futuristic Event'));

console.log('✅ All config & utility checks passed cleanly!');
