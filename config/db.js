const mongoose = require('mongoose');

// Connect to the MongoDB database
url = process.env.MONGODB_URL+"/"+process.env.DATABASE_NAME
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => {
  console.log('Mongodb connected');
})
.catch((error) => {
  console.error('Mongodb failed:', error.message);
});