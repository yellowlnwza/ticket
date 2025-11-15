// backend/models/role.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Role', {
    role_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    role_name: {
  type: DataTypes.STRING(50),
  allowNull: false,
  unique: 'role_name_unique', // ตั้งชื่อ index เพื่อไม่ให้ Sequelize สร้างซ้ำ
}
  }, {
    tableName: 'roles',
    timestamps: false
  });
};
