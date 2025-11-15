require('dotenv').config();

// use global fetch (Node 18+)
const jwt = require('jsonwebtoken');
const { User, Ticket, sequelize } = require('./models');

async function main() {
  try {
    await sequelize.authenticate();
    console.log('DB connected');

    const user = await User.findOne();
    if (!user) {
      console.error('No users found in DB. Create a user first.');
      process.exit(1);
    }

    let ticket = await Ticket.findOne({ where: { user_id: user.user_id } });
    if (!ticket) {
      ticket = await Ticket.create({
        title: 'Test ticket for comment',
        description: 'Auto-created for testing comments',
        priority: 'Low',
        status: 'Open',
        user_id: user.user_id
      });
      console.log('Created test ticket:', ticket.ticket_id);
    }

    const token = jwt.sign({ user_id: user.user_id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });

    const url = `http://localhost:${process.env.PORT || 4000}/api/tickets/${ticket.ticket_id}/comments`;
    console.log('POST', url);

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ text: 'Automated test comment' })
    });
    const data = await res.json();
    console.log('Status:', res.status);
    console.log('Data:', data);
    process.exit(0);
  } catch (err) {
    if (err && err.stack) {
      console.error('Error stack:', err.stack);
    } else if (err.response) {
      console.error('Response error:', err.response.status, err.response.data);
    } else {
      console.error('Error:', err && err.message ? err.message : err);
    }
    process.exit(2);
  }
}

main();
