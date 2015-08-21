var UserPasswordResetFinal = function(cnf) {
    this.email = cnf.email;
    this.newPassword = cnf.newPassword,
    this.newPasswordConfirm = cnf.newPasswordConfirm,
    this.passwordResetHash = cnf.passwordResetHash
};
module.exports = UserPasswordResetFinal;
