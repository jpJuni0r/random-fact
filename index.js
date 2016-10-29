import request from 'request';
import cheerio from 'cheerio';
import {exec} from 'child_process';
// Helpers

function replaceAll(str, find, replace) {
  return str.replace(new RegExp(find, 'g'), replace);
}

// Actual program

var getFact = new Promise(resolve => {
  request('http://wissen.woxikon.de/unglaubliches', (err, res) => {
    if (err) {
      console.error(err);
    }

    const $ = cheerio.load(res.body)

    const fact = $('form[action=""] > div:nth-child(2) > div:first-child').text();
    resolve(fact);
  });
});


var sendMessage = message => {
  return new Promise(resolve => {
    console.log(`Sending message ${message}`)

    let messageFormatted = message;
    messageFormatted = replaceAll(messageFormatted, '\'', '\\\'');
    messageFormatted = replaceAll(messageFormatted, '"', '');
    messageFormatted = replaceAll(messageFormatted, '%', ' Prozent');
    messageFormatted = replaceAll(messageFormatted, ' ', '%s');
    messageFormatted = replaceAll(messageFormatted, 'ä', 'ae');
    messageFormatted = replaceAll(messageFormatted, 'ö', 'oe');
    messageFormatted = replaceAll(messageFormatted, 'ü', 'ue');
    messageFormatted = replaceAll(messageFormatted, 'Ä', 'Ae');
    messageFormatted = replaceAll(messageFormatted, 'Ö', 'Oe');
    messageFormatted = replaceAll(messageFormatted, 'Ü', 'Ue');
    messageFormatted = replaceAll(messageFormatted, 'ß', 'ss');
    messageFormatted = replaceAll(messageFormatted, '-', ' ');

    console.log('Formatierte Nachricht', messageFormatted);

    exec(`adb shell input text "${messageFormatted}"`, (err, stdout) => {
      if (err) {
        console.error(err);
      }

      console.log('Out', stdout);

      exec('adb shell input keyevent 66', () => {
        resolve();
      });
    });
  });
}

getFact.then(fact => {
  sendMessage(fact);
})

