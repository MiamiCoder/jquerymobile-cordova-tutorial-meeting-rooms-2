var UserRegistration = function(cnf) {
    this.email = cnf.email,
    this.firstName = cnf.firstName,
    this.lastName = cnf.lastName,
    this.password = cnf.password,
    this.passwordConfirm = cnf.passwordConfirm
};
module.exports = UserRegistration;
