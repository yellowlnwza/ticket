const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  return sequelize.define('Ticket', {
    ticket_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING(200), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    priority: { type: DataTypes.ENUM('Low','Medium','High'), defaultValue: 'Medium' },
    status: { type: DataTypes.ENUM('Open','In Progress','Resolved','Closed'), defaultValue: 'Open' },
    assigned_to: { type: DataTypes.INTEGER, allowNull: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, 
  {
    tableName: 'tickets',
    timestamps: false
  });
};

