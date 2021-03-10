module.exports.validateRegisterInput = (username, email, password, confirmPassword) => {
  const errors = {};

  if (username.trim() === "") {
    errors.username = "Username must not be empty";
  } else if (username.trim().includes(" ")) {
    errors.username = "";
    errors.username = "Username may not contain spaces";
  }
  if (email.trim() === "") {
    errors.email = "Email must not be empty";
  } else {
    const regEx = /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/;
    if (!email.match(regEx)) {
      errors.email = "Email must be a valid email address";
    }
  }

  if (confirmPassword.trim() === "") {
    errors.confirmPassword = "Confirm password must not be empty.";
  }

  if (password.trim() === "") {
    errors.password = "Password must not be empty";
  } else if (password.trim() !== confirmPassword.trim()) {
    errors.confirmPassword = "Passwords must match";
  }
  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};

module.exports.validateLoginInput = (email, password) => {
  const errors = {};
  if (email.trim() === "") {
    errors.email = "Email must not be empty";
  }
  if (password.trim() === "") {
    errors.password = "Password must not be empty";
  }
  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};

module.exports.validateProfileFormInput = (mainPlatform, age, city, state, gender) => {
  const errors = {};
  if (mainPlatform.length === 0) {
    errors.mainPlatform = "Main Platform must not be empty";
  }
  if (age.trim() === "") {
    errors.age = "Age must not be empty";
  }
  if (city.trim() === "") {
    errors.city = "City must not be empty";
  }
  if (state.trim() === "") {
    errors.state = "State must not be empty";
  }
  if (gender.trim() === "") {
    errors.gender = "Gender must not be empty";
  }
  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};
