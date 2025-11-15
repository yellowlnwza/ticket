const express = require('express');
const app = require('./app');
const { sequelize } = require('./models'); // ✅ เพิ่มบรรทัดนี้
require('dotenv').config();

const PORT = process.env.PORT || 4000;

// ✅ sync database ก่อนเริ่มรันเซิร์ฟเวอร์
sequelize.sync({ alter: true })
  .then(() => {
    console.log('✅ Database synced successfully.');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ Error syncing database:', err);
  });
