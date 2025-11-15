// backend/models/sla.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Sla', {
    sla_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    ticket_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    due_time: {
      type: DataTypes.DATE,
      allowNull: false
    },
    alert_sent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'sla',
    timestamps: false
  });
};
