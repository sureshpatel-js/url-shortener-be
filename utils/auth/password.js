const bcrypt = require("bcrypt");
const getRndInteger = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}



exports.checkPassword = async (obj) => {
  const { hashedPassword, password } = obj;
  const validatePassword = await bcrypt.compare(password, hashedPassword);
  if (!validatePassword) {
    return {
      status: false,
      message: "Please enter valid password.",
    };
  }
  return {
    status: true,
  };
};

exports.generateRandomPassword = () => {
  return getRndInteger(108964, 987620);
}
