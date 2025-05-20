const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// Connect to SQLite database
const db = new sqlite3.Database('./ussd.db');

// Create tables if not exist
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS Sessions (
    sessionID TEXT PRIMARY KEY,
    phoneNumber TEXT,
    userInput TEXT,
    language TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS Transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phoneNumber TEXT,
    action TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

app.post('/app', (req, res) => {
  const { sessionId, phoneNumber, text } = req.body;
  const input = text.split('*');

  db.get(`SELECT * FROM Sessions WHERE sessionID = ?`, [sessionId], (err, session) => {
    if (err) return res.send('END System error. Try again.');

    let response = '';

    if (!session) {
      // New session
      db.run(`INSERT INTO Sessions (sessionID, phoneNumber, userInput) VALUES (?, ?, ?)`, [sessionId, phoneNumber, text]);
      return res.send(
        `CON Welcome / Murakaza neza\nSelect Language / Hitamo ururimi:\n1. English\n2. Kinyarwanda\n3. Exit / Sohoka`
      );
    }

    if (input.length === 1) {
      const choice = input[0];
      if (choice === '1') {
        db.run(`UPDATE Sessions SET language = 'EN' WHERE sessionID = ?`, [sessionId]);
        response = `CON Main Menu:\n1. View Cars\n2. Buy Car\n3. Exit`;
      } else if (choice === '2') {
        db.run(`UPDATE Sessions SET language = 'RW' WHERE sessionID = ?`, [sessionId]);
        response = `CON Menyu Nyamukuru:\n1. Reba Imodoka\n2. Gura Imodoka\n3. Sohoka`;
      } else if (choice === '3') {
        response = 'END Thank you for using our service!';
      } else {
        response = 'END Invalid choice.';
      }
    }

    else if (input.length === 2) {
      const lang = session.language;
      const option = input[1];

      if (option === '3') {
        response = lang === 'EN' ? 'END Thank you. Goodbye!' : 'END Murakoze. Murabeho!';
      } else if (lang === 'EN') {
        if (option === '1') {
          response = `CON Choose a Car:\n1. Toyota\n2. BMW\n3. Exit`;
        } else if (option === '2') {
          response = 'END Purchase option coming soon.';
        } else {
          response = 'END Invalid option.';
        }
      } else if (lang === 'RW') {
        if (option === '1') {
          response = `CON Hitamo Imodoka:\n1. Toyota\n2. BMW\n3. Sohoka`;
        } else if (option === '2') {
          response = 'END Igikorwa cyo kugura kiraza vuba.';
        } else {
          response = 'END Icyo wahisemo si cyo.';
        }
      }
    }

    else if (input.length === 3) {
      const carChoice = input[2];
      const lang = session.language;

      if (carChoice === '3') {
        response = lang === 'EN' ? 'END Thank you. Goodbye!' : 'END Murakoze. Murabeho!';
        return res.send(response);
      }

      let car = '';
      if (carChoice === '1') car = 'Toyota';
      else if (carChoice === '2') car = 'BMW';
      else return res.send('END Invalid selection.');

      db.run(`INSERT INTO Transactions (phoneNumber, action) VALUES (?, ?)`, [phoneNumber, `Selected ${car}`]);

      if (lang === 'EN') response = `END You selected ${car}. Thank you!`;
      else response = `END Wahisemo ${car}. Murakoze!`;
    }

    else {
      response = 'END Invalid input.';
    }

    res.set('Content-Type', 'text/plain');
    res.send(response);
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`USSD app running on port ${PORT}`);
});
