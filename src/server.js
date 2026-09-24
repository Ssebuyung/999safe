require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 3000;

// Connect to MongoDB before starting server
connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    const os = require('os');
    const networkInterfaces = os.networkInterfaces();
    const addresses = [];
    
    Object.keys(networkInterfaces).forEach((interfaceName) => {
      networkInterfaces[interfaceName].forEach((iface) => {
        if (iface.family === 'IPv4' && !iface.internal) {
          addresses.push(iface.address);
        }
      });
    });
    
    console.log(`\n✅ Server running successfully!`);
    console.log(`\n📍 Access from this computer:`);
    console.log(`   http://localhost:${PORT}`);
    console.log(`\n📱 Access from your phone (same network):`);
    addresses.forEach((addr) => {
      console.log(`   http://${addr}:${PORT}`);
    });
    console.log(`\n`);
  });
}).catch((error) => {
  console.error('Failed to start server:', error.message);
  process.exit(1);
});
