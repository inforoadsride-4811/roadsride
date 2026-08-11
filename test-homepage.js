const { getHomepageSections } = require('./src/actions/admin-homepage.js');
getHomepageSections().then(console.log).catch(console.error);
