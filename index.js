app.post('/app', (req, res) => {
  const { sessionId, phoneNumber, text } = req.body;
  const input = text.split('*');

  db.get(`SELECT * FROM Sessions WHERE sessionID = ?`, [sessionId], (err, session) => {
    if (err) return res.send('END System error. Try again.');

    let response = '';

    if (!session) {
      db.run(`INSERT INTO Sessions (sessionID, phoneNumber, userInput) VALUES (?, ?, ?)`, [sessionId, phoneNumber, text]);
      return res.send(
        `CON Welcome / Murakaza neza\nSelect Language / Hitamo ururimi:\n1. English\n2. Kinyarwanda`
      );
    }

    const lang = session.language;

    // If only 1 input: language selection
    if (input.length === 1) {
      const choice = input[0];
      if (choice === '1') {
        db.run(`UPDATE Sessions SET language = 'EN' WHERE sessionID = ?`, [sessionId]);
        response = `CON Main Menu:\n1. View Cars\n2. Buy Car\n0. Go Back`;
      } else if (choice === '2') {
        db.run(`UPDATE Sessions SET language = 'RW' WHERE sessionID = ?`, [sessionId]);
        response = `CON Menyu Nyamukuru:\n1. Reba Imodoka\n2. Gura Imodoka\n0. Subira Inyuma`;
      } else {
        response = 'END Invalid choice.';
      }
    }

    // If 2 inputs: main menu selected
    else if (input.length === 2) {
      const option = input[1];

      if (option === '0') {
        // Go back to language selection
        response = `CON Welcome / Murakaza neza\nSelect Language / Hitamo ururimi:\n1. English\n2. Kinyarwanda`;
      } else if (option === '1') {
        response = lang === 'EN'
          ? `CON Choose a Car to View:\n1. Toyota\n2. BMW\n3. Mercedes\n4. Nissan\n5. Audi\n0. Go Back`
          : `CON Hitamo Imodoka yo Kureba:\n1. Toyota\n2. BMW\n3. Mercedes\n4. Nissan\n5. Audi\n0. Subira Inyuma`;
      } else if (option === '2') {
        response = lang === 'EN'
          ? `CON Choose a Car to Buy:\n1. Toyota\n2. BMW\n3. Mercedes\n4. Nissan\n5. Audi\n0. Go Back`
          : `CON Hitamo Imodoka yo Kugura:\n1. Toyota\n2. BMW\n3. Mercedes\n4. Nissan\n5. Audi\n0. Subira Inyuma`;
      } else {
        response = 'END Invalid option.';
      }
    }

    // If 3 inputs: car selected
    else if (input.length === 3) {
      const mainOption = input[1];
      const carChoice = input[2];

      if (carChoice === '0') {
        // Go back to main menu
        response = lang === 'EN'
          ? `CON Main Menu:\n1. View Cars\n2. Buy Car\n0. Go Back`
          : `CON Menyu Nyamukuru:\n1. Reba Imodoka\n2. Gura Imodoka\n0. Subira Inyuma`;
      } else {
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

        response = lang === 'EN'
          ? (mainOption === '1' ? `END You viewed ${selectedCar}.` : `END You bought ${selectedCar}. Thank you!`)
          : (mainOption === '1' ? `END Wabonye ${selectedCar}.` : `END Waguze ${selectedCar}. Murakoze!`);
      }
    }

    else {
      response = 'END Invalid input.';
    }

    res.set('Content-Type', 'text/plain');
    res.send(response);
  });
});
