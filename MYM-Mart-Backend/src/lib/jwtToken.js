// create jwtToken and save cookies
const jwtToken = (user, status, message, res) => {
  const token = user.getJWTToken();

  // options for cookie
  const options = {
    expires: new Date(Date.now() + process.env.JWT_TOKEN_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  res.status(status).cookie("X-JWT-TOKEN", token, options).json({
    statusCode: status,
    message: message,
    "X-JWT-TOKEN": token,
    data: user,
  });
};

module.exports = jwtToken;