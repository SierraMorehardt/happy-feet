export default {
  testEnvironment: 'node',
  transform: {},
  moduleFileExtensions: ['mjs', 'js', 'json'],
  transformIgnorePatterns: [
    'node_modules/(?!(bcrypt|jsonwebtoken|express-validator)/)'
  ],
  testMatch: ['**/test/**/*.test.mjs']
};
