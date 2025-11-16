const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  return sequelize.define('User', {
    user_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(100), allowNull: false },
    password_hash: { type: DataTypes.STRING(255), allowNull: false },
    role_id: { type: DataTypes.INTEGER, allowNull: false },
    status: { 
      type: DataTypes.ENUM('Active', 'Suspended'), 
      allowNull: false,
      defaultValue: 'Active'
    },
    created_at: { 
      type: DataTypes.DATE, 
      allowNull: true,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'users',
    timestamps: false // handle created_at 
  });
};
