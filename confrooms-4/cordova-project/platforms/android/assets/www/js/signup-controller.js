var BookIt = BookIt || {};

BookIt.SignUpController = function () {

    this.$signUpPage = null;
    this.$btnSubmit = null;
    this.$ctnErr = null;
    this.$txtFirstName = null;
    this.$txtLastName = null;
    this.$txtEmailAddress = null;
    this.$txtPassword = null;
    this.$txtPasswordConfirm = null;
};

BookIt.SignUpController.prototype.init = function () {
    this.$signUpPage = $("#page-signup");
    this.$btnSubmit = $("#btn-submit", this.$signUpPage);
    this.$ctnErr = $("#ctn-err", this.$signUpPage);
    this.$txtFirstName = $("#txt-first-name", this.$signUpPage);
    this.$txtLastName = $("#txt-last-name", this.$signUpPage);
    this.$txtEmailAddress = $("#txt-email-address", this.$signUpPage);
    this.$txtPassword = $("#txt-password", this.$signUpPage);
    this.$txtPasswordConfirm = $("#txt-password-confirm", this.$signUpPage);
};

BookIt.SignUpController.prototype.passwordsMatch = function (password, passwordConfirm) {
    return password === passwordConfirm;
};

BookIt.SignUpController.prototype.passwordIsComplex = function (password) {
    // TODO: implement complex password rules here.  There should be similar rule on the server side.
    return true;
};

BookIt.SignUpController.prototype.emailAddressIsValid = function (email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
};

BookIt.SignUpController.prototype.resetSignUpForm = function () {

    var invisibleStyle = "bi-invisible",
        invalidInputStyle = "bi-invalid-input";

    this.$ctnErr.html("");
    this.$ctnErr.removeClass().addClass(invisibleStyle);
    this.$txtFirstName.removeClass(invalidInputStyle);
    this.$txtLastName.removeClass(invalidInputStyle);
    this.$txtEmailAddress.removeClass(invalidInputStyle);
    this.$txtPassword.removeClass(invalidInputStyle);
    this.$txtPasswordConfirm.removeClass(invalidInputStyle);

    this.$txtFirstName.val("");
    this.$txtLastName.val("");
    this.$txtEmailAddress.val("");
    this.$txtPassword.val("");
    this.$txtPasswordConfirm.val("");

};

BookIt.SignUpController.prototype.onSignupCommand = function () {

    var firstName = this.$txtFirstName.val().trim(),
        lastName = this.$txtLastName.val().trim(),
        emailAddress = this.$txtEmailAddress.val().trim(),
        password = this.$txtPassword.val().trim(),
        passwordConfirm = this.$txtPasswordConfirm.val().trim(),
        invalidInput = false,
        invisibleStyle = "bi-invisible",
        invalidInputStyle = "bi-invalid-input";

    // Reset styles.
    this.$ctnErr.removeClass().addClass(invisibleStyle);
    this.$txtFirstName.removeClass(invalidInputStyle);
    this.$txtLastName.removeClass(invalidInputStyle);
    this.$txtEmailAddress.removeClass(invalidInputStyle);
    this.$txtPassword.removeClass(invalidInputStyle);
    this.$txtPasswordConfirm.removeClass(invalidInputStyle);

    // Flag each invalid field.
    if (firstName.length === 0) {
        this.$txtFirstName.addClass(invalidInputStyle);
        invalidInput = true;
    }
    if (lastName.length === 0) {
        this.$txtLastName.addClass(invalidInputStyle);
        invalidInput = true;
    }
    if (emailAddress.length === 0) {
        this.$txtEmailAddress.addClass(invalidInputStyle);
        invalidInput = true;
    }
    if (password.length === 0) {
        this.$txtPassword.addClass(invalidInputStyle);
        invalidInput = true;
    }
    if (passwordConfirm.length === 0) {
        this.$txtPasswordConfirm.addClass(invalidInputStyle);
        invalidInput = true;
    }

    // Make sure that all the required fields have values.
    if (invalidInput) {
        this.$ctnErr.html("<p>Please enter all the required fields.</p>");
        this.$ctnErr.addClass("bi-ctn-err").slideDown();
        return;
    }

    if (!this.emailAddressIsValid(emailAddress)) {
        this.$ctnErr.html("<p>Please enter a valid email address.</p>");
        this.$ctnErr.addClass("bi-ctn-err").slideDown();
        this.$txtEmailAddress.addClass(invalidInputStyle);
        return;
    }

    if (!this.passwordsMatch(password, passwordConfirm)) {
        this.$ctnErr.html("<p>Your passwords don't match.</p>");
        this.$ctnErr.addClass("bi-ctn-err").slideDown();
        this.$txtPassword.addClass(invalidInputStyle);
        this.$txtPasswordConfirm.addClass(invalidInputStyle);
        return;
    }

    if (!this.passwordIsComplex(password)) {
        // TODO: Use error message to explain password rules.
        this.$ctnErr.html("<p>Your password is very easy to guess.  Please try a more complex password.</p>");
        this.$ctnErr.addClass("bi-ctn-err").slideDown();
        this.$txtPassword.addClass(invalidInputStyle);
        this.$txtPasswordConfirm.addClass(invalidInputStyle);
        return;
    }

    $.ajax({
        type: 'POST',
        url: BookIt.Settings.signUpUrl,
        data: "email=" + emailAddress + "&firstName=" + firstName + "&lastName=" + lastName + "&password=" + password + "&passwordConfirm=" + passwordConfirm,
        success: function (resp) {

            if (resp.success === true) {
                $.mobile.navigate("#page-signup-succeeded");
                return;
            } else {
                if (resp.extras.msg) {
                    switch (resp.extras.msg) {
                        case BookIt.ApiMessages.DB_ERROR:
                        case BookIt.ApiMessages.COULD_NOT_CREATE_USER:
                            // TODO: Use a friendlier error message below.
                            this.$ctnErr.html("<p>Oops! BookIt had a problem and could not register you.  Please try again in a few minutes.</p>");
                            this.$ctnErr.addClass("bi-ctn-err").slideDown();
                            break;
                        case BookIt.ApiMessages.EMAIL_ALREADY_EXISTS:
                            this.$ctnErr.html("<p>The email address that you provided is already registered.</p>");
                            this.$ctnErr.addClass("bi-ctn-err").slideDown();
                            this.$txtEmailAddress.addClass(invalidInputStyle);
                            break;
                    }
                }
            }
        },
        error: function (e) {
            console.log(e.message);
            // TODO: Use a friendlier error message below.
            this.$ctnErr.html("<p>Oops! BookIt had a problem and could not register you.  Please try again in a few minutes.</p>");
            this.$ctnErr.addClass("bi-ctn-err").slideDown();
        }
    });
};