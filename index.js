app.post('/app', (req, res) => {
  const { sessionId, phoneNumber, text } = req.body;
  const input = text.split('*');

  db.get(`SELECT * FROM Sessions WHERE sessionID = ?`, [sessionId], (err, session) => {
    if (err) return res.send('END System error. Try again.');

    let response = '';

    if (!session) {
      db.run(`INSERT INTO Sessions (sessionID, phoneNumber, userInput) VALUES (?, ?, ?)`, [sessionId, phoneNumber, text]);
      return res.send(
        `CON Welcome / Murakaza neza\nSelect Language / Hitamo ururimi:\n1. English\n2. Kinyarwanda\n3. Exit / Sohoka`
      );
    }

    const lang = session.language;

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
      const option = input[1];

      if (option === '3') {
        response = lang === 'EN' ? 'END Thank you. Goodbye!' : 'END Murakoze. Murabeho!';
      } else if (option === '1') {
        response = lang === 'EN'
          ? `CON Choose a Car to View:\n1. Toyota\n2. BMW\n3. Mercedes\n4. Nissan\n5. Audi\n6. Exit`
          : `CON Hitamo Imodoka yo Kureba:\n1. Toyota\n2. BMW\n3. Mercedes\n4. Nissan\n5. Audi\n6. Sohoka`;
      } else if (option === '2') {
        response = lang === 'EN'
          ? `CON Choose a Car to Buy:\n1. Toyota\n2. BMW\n3. Mercedes\n4. Nissan\n5. Audi\n6. Exit`
          : `CON Hitamo Imodoka yo Kugura:\n1. Toyota\n2. BMW\n3. Mercedes\n4. Nissan\n5. Audi\n6. Sohoka`;
      } else {
        response = 'END Invalid option.';
      }
    }

    else if (input.length === 3) {
      const mainOption = input[1];
      const carChoice = input[2];

      if (carChoice === '6') {
        response = lang === 'EN' ? 'END Thank you. Goodbye!' : 'END Murakoze. Murabeho!';
        return res.send(response);
      }

      const cars = {
        '1': 'Toyota',
        '2': 'BMW',
        '3': 'Mercedes',
        '4': 'Nissan',
        '5': 'Audi'
      };

      const selectedCar = cars[carChoice];

      if (!selectedCar) return res.send('END Invalid car selection.');

      const action = mainOption === '1' ? `Viewed ${selectedCar}` : `Bought ${selectedCar}`;

      db.run(`INSERT INTO Transactions (phoneNumber, action) VALUES (?, ?)`, [phoneNumber, action]);

      if (mainOption === '1') {
        response = lang === 'EN'
          ? `END You viewed ${selectedCar}.`
          : `END Wabonye ${selectedCar}.`;
      } else if (mainOption === '2') {
        response = lang === 'EN'
          ? `END You bought ${selectedCar}. Thank you!`
          : `END Waguze ${selectedCar}. Murakoze!`;
      } else {
        response = 'END Invalid selection.';
      }
    }

    else {
      response = 'END Invalid input.';
    }

    res.set('Content-Type', 'text/plain');
    res.send(response);
  });
});
