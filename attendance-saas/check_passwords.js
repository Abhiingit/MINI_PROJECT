
const bcrypt = require('bcryptjs');

const hashes = {
  'admin@comp1.com':       '$2b$10$QV1N1FHk1wmYheQ6HD72/OQj2srFZ7eHTPosnkT3B7i.Mg5.wwK/.',
  'student@example.com':   '$2b$10$BPmeQeS23AcWgP0QYNsn3ek7ln6juHVuNVj0Ja/mJJnpavxC/SzYG',
  'yash@test.com':         '$2b$10$bk41CV9tyKUaieQNCVnd2.SMJPO6fNi.sHFJAUejy7QQgLqlPaoBm',
  'alice@school.com':      '$2b$10$aO4PZbqcMpIa52P98zNMdeTSgE61RbK26ojrkCcVbniSc6tgSnQ42'
};

const guesses = [
  'password', 'admin', 'admin123', 'student', 'student123',
  'test123', 'pass123', 'password123', '123456', 'test',
  'comp1', 'yash', 'alice', 'Admin123', 'Password1',
  'password1', '123456789', 'qwerty', 'abc123', 'letmein',
  'welcome', 'monkey', 'login', 'pass', 'master', 'hello',
  'dragon', 'shadow', 'superman', 'michael', 'football'
];

for (const [email, hash] of Object.entries(hashes)) {
  let found = false;
  for (const guess of guesses) {
    if (bcrypt.compareSync(guess, hash)) {
      console.log(email + '  =>  ' + guess);
      found = true;
      break;
    }
  }
  if (!found) console.log(email + '  =>  (password not in guess list)');
}
