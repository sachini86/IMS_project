module.exports = {
  validUser: {
    username: process.env.VALID_USERNAME,
    password: process.env.VALID_PASSWORD,
  },
  invalidPassword: {
    username: process.env.VALID_USERNAME,
    password: '123456',
  },
  invalidUsername: {
    username: 'nonexistentuser',
    password: process.env.VALID_PASSWORD,
  },
  emptyFields: {
    username: '',
    password: '',
  }
 
};