const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const User = require('./user')(sequelize);
const Role = require('./role')(sequelize);
const Ticket = require('./ticket')(sequelize);
const Comment = require('./comment')(sequelize);
const Sla = require('./sla')(sequelize);
const Notification = require('./notification')(sequelize, Sequelize.DataTypes);

// Associations

// Role - User
Role.hasMany(User, { foreignKey: 'role_id' });
User.belongsTo(Role, { foreignKey: 'role_id' });

// User - Ticket (creator)
User.hasMany(Ticket, { foreignKey: 'user_id' });
Ticket.belongsTo(User, { as: 'creator', foreignKey: 'user_id' });

// User - Comment
User.hasMany(Comment, { foreignKey: 'user_id' });
Comment.belongsTo(User, { foreignKey: 'user_id' });

// Ticket - Comment
Ticket.hasMany(Comment, { foreignKey: 'ticket_id' });
Comment.belongsTo(Ticket, { foreignKey: 'ticket_id' });

// Ticket - Sla
Ticket.hasOne(Sla, { foreignKey: 'ticket_id' });

// Ticket - Assignee
Ticket.belongsTo(User, { foreignKey: 'assigned_to', as: 'assignee' });

// Export ทุก model ออกไปพร้อมกัน
module.exports = { sequelize, User, Role, Ticket, Comment, Sla, Notification };
