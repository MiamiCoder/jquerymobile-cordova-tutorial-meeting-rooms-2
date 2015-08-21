var AccountController = require('../controllers/account.js'),
    mongoose = require('mongoose'),
    should = require('should'),
    uuid = require('node-uuid'),
    crypto = require('crypto'),
    User = require('../models/user.js'),
    UserMock = require('./user-mock.js'),
    UserRegistration = require('../models/user-registration.js'),
    MailerMock = require('./mailer-mock.js'),
    ApiMessages = require('../models/api-messages.js');



describe('AccountController', function () {

    var controller,
        seedUsersCount = 10,
        testUser,
        userModelMock,
        session = {},
        mailMock;

    beforeEach(function (done) {
        userModelMock = new UserMock();
        mailerMock = new MailerMock();
        controller = new AccountController(userModelMock, session, mailerMock);
        done();
    });

    afterEach(function (done) {
        userModelMock.setError(false);
        done();
    });

    

    describe('#logon', function () {

        it('Returns db error', function (done) {

            userModelMock.setError(true);
            userModelMock.seedUsers();
            var testUser = userModelMock.getTestUser(),
                testUserPassword = 'Password0';

            controller.logon(testUser.email, testUserPassword, function (err, apiResponse) {

                should(apiResponse.success).equal(false);
                should(apiResponse.extras.msg).equal(ApiMessages.DB_ERROR);
                done();
            });
        });

        it('Creates user session', function (done) {

            userModelMock.seedUsers();
            var testUser = userModelMock.getTestUser(),
                testUserPassword = 'Password0';            

            controller.logon(testUser.email, testUserPassword, function (err, apiResponse) {
                
                if (err) return done(err);
                should(apiResponse.success).equal(true);
                should.exist(apiResponse.extras.userProfileModel);
                should.exist(controller.getSession().userProfileModel);
                should.exist(controller.getSession().id);
                should.exist(apiResponse.extras.sessionId);
                should(apiResponse.extras.userProfileModel).equal(controller.getSession().userProfileModel);
                done();
            });
        });

        it('Returns "Email not found"', function (done) {

            userModelMock.seedUsers();
            var testUser = userModelMock.getTestUser(),
                testUserPassword = 'Password0',
                nonExistentEmailAddress = 'test';

            controller.logon(nonExistentEmailAddress, testUserPassword, function (err, apiResponse) {

                if (err) return done(err);
                should(apiResponse.success).equal(false);
                should(apiResponse.extras.msg).equal(ApiMessages.EMAIL_NOT_FOUND);
                done();
            });
        });

        it('Returns "Invalid password"', function (done) {

            userModelMock.seedUsers();
            var testUser = userModelMock.getTestUser(),
                invalidPassword = 'Password';

            controller.logon(testUser.email, invalidPassword, function (err, apiResponse) {

                if (err) return done(err);
                should(apiResponse.success).equal(false);
                should(apiResponse.extras.msg).equal(ApiMessages.INVALID_PWD);
                done();
            });
        });
    });

    describe('#logoff', function () {
        it('Destroys user session', function (done) {
            controller.logoff();
            should.not.exist(controller.getSession().userProfileModel);
            done();
        });
    });

    describe('#register', function () {

        it('Returns db error', function (done) {

            userModelMock.setError(true);
            userModelMock.seedUsers();
            var testUser = userModelMock.getTestUser();
            controller.register(testUser, function (err, apiResponse) {

                should(apiResponse.success).equal(false);
                should(apiResponse.extras.msg).equal(ApiMessages.DB_ERROR);
                done();
            });
        });

        it('Returns "Email already exists"', function (done) {
                        
            userModelMock.seedUsers();
            var testUser = userModelMock.getTestUser();
            controller.register(testUser, function (err, apiResponse) {

                should(apiResponse.success).equal(false);
                should(apiResponse.extras.msg).equal(ApiMessages.EMAIL_ALREADY_EXISTS);
                done();
            });
        });

        it('Returns "Could not create user"', function (done) {
            
            var testUser = new UserMock();
            testUser.setNumberAffected(0);

            controller.register(testUser, function (err, apiResponse) {

                if (err) return done(err);
                should(apiResponse.success).equal(false);
                should(apiResponse.extras.msg).equal(ApiMessages.COULD_NOT_CREATE_USER);
                done();
            });
        });

        it('Registers a user', function (done) {

            var testUser = new UserMock();
            testUser.setNumberAffected(1);

            controller.register(testUser, function (err, apiResponse) {

                if (err) return done(err);
                should(apiResponse.success).equal(true);
                done();
            });
        });
    });

    describe('#resetPassword', function () {

        it('Returns db error', function (done) {

            userModelMock.setError(true);
            userModelMock.seedUsers();
            var testUser = userModelMock.getTestUser();
            controller.resetPassword(testUser.email, function (err, apiResponse) {

                should(apiResponse.success).equal(false);
                should(apiResponse.extras.msg).equal(ApiMessages.DB_ERROR);
                done();
            });
        });


        it('Sets "passwordResetHash" session', function (done) {

            userModelMock.seedUsers();
            var testUser = userModelMock.getTestUser();

            controller.resetPassword(testUser.email, function (err, apiResponse) {

                if (err) return done(err);
                should(apiResponse.success).equal(true);
                should.exist(controller.getSession().passwordResetHash);
                should.exist(apiResponse.extras.passwordResetHash);
                should(controller.getSession().emailWhoRequestedPasswordReset).equal(testUser.email);
                should(controller.getSession().passwordResetHash).equal(apiResponse.extras.passwordResetHash);
                done();
            })
        });

        it('Returns "Email not found"', function (done) {

            userModelMock.seedUsers();
            var testUser = userModelMock.getTestUser(),
                nonExistentEmailAddress = 'dummy@email.com';

            controller.resetPassword(nonExistentEmailAddress, function (err, apiResponse) {

                if (err) return done(err);
                should(apiResponse.success).equal(false);
                should(apiResponse.extras.msg).equal(ApiMessages.EMAIL_NOT_FOUND);
                done();
            })
        });
    });

    describe('#resetPasswordFinal', function () {

        it('Returns "Password reset expired"', function (done) {

            var email = 'irrelevant to the test',
                newPassword = 'irrelevant to the test',
                newPasswordConfirm = 'irrelevant to the test',
                passwordResetHash = 'irrelevant to the test';
            controller.setSession({}); // Destroy session.passwordResetHash.
            controller.resetPasswordFinal(email, newPassword, newPasswordConfirm, passwordResetHash, function (err, apiResponse) {
                should(apiResponse.success).equal(false);
                should(apiResponse.extras.msg).equal(ApiMessages.PASSWORD_RESET_EXPIRED);
                done();
            });
        });

        it('Returns "Invalid password reset hash"', function (done) {
            
            var email = 'irrelevant to the test',
                newPassword = 'irrelevant to the test',
                newPasswordConfirm = 'irrelevant to the test',
                passwordResetHash = uuid.v4();
            controller.setSession({ passwordResetHash: uuid.v4() });
            controller.resetPasswordFinal(email, newPassword, newPasswordConfirm, passwordResetHash, function (err, apiResponse) {
                should(apiResponse.success).equal(false);
                should(apiResponse.extras.msg).equal(ApiMessages.PASSWORD_RESET_HASH_MISMATCH);
                done();
            });
        });

        it('Returns "Invalid password reset email"', function (done) {

            var email = 'test value',
                newPassword = 'irrelevant to the test',
                newPasswordConfirm = 'irrelevant to the test',
                emailWhoRequestedPasswordReset = 'a different test value',
                passwordResetHash = 'irrelevant to the test';

            controller.setSession({ passwordResetHash: passwordResetHash, emailWhoRequestedPasswordReset: emailWhoRequestedPasswordReset });
            controller.resetPasswordFinal(email, newPassword, newPasswordConfirm, passwordResetHash, function (err, apiResponse) {
                should(apiResponse.success).equal(false);
                should(apiResponse.extras.msg).equal(ApiMessages.PASSWORD_RESET_EMAIL_MISMATCH);
                done();
            });
        });

        it('Returns "Password confirm mismatch"', function (done) {

            userModelMock.seedUsers();
            var testUser = userModelMock.getTestUser(),
                passwordResetHash = uuid.v4(),
                newPassword = 'NewPassword',
                newPasswordConfirm = 'DifferentPassword';

            controller.setSession({ passwordResetHash: passwordResetHash, emailWhoRequestedPasswordReset: testUser.email });

            controller.resetPasswordFinal(testUser.email, newPassword, newPasswordConfirm, passwordResetHash, function (err, apiResponse) {

                should(apiResponse.success).equal(false);
                should(apiResponse.extras.msg).equal(ApiMessages.PASSWORD_CONFIRM_MISMATCH);
                done();
            })
        });

        it('Returns db error', function (done) {

            userModelMock.setError(true);
            userModelMock.seedUsers();
            var testUser = userModelMock.getTestUser(),
                passwordResetHash = uuid.v4(),
                newPassword = 'NewPassword',
                newPasswordConfirm = 'NewPassword';

            controller.setSession({ passwordResetHash: passwordResetHash, emailWhoRequestedPasswordReset: testUser.email });

            controller.resetPasswordFinal(testUser.email, newPassword, newPasswordConfirm, passwordResetHash, function (err, apiResponse) {

                should(apiResponse.success).equal(false);
                should(apiResponse.extras.msg).equal(ApiMessages.DB_ERROR);
                done();
            });
        });

        it('Returns "Could not reset password"', function (done) {

            userModelMock.setNumberAffected(0);
            userModelMock.seedUsers();
            var testUser = userModelMock.getTestUser(),
                passwordResetHash = uuid.v4(),
                newPassword = 'NewPassword',
                newPasswordConfirm = 'NewPassword';

            controller.setSession({ passwordResetHash: passwordResetHash, emailWhoRequestedPasswordReset: testUser.email });

            controller.resetPasswordFinal(testUser.email, newPassword, newPasswordConfirm, passwordResetHash, function (err, apiResponse) {

                should(apiResponse.success).equal(false);
                should(apiResponse.extras.msg).equal(ApiMessages.COULD_NOT_RESET_PASSWORD);
                done();
            });
        });

        it('Resets user\'s password', function (done) {

            userModelMock.setNumberAffected(1);
            userModelMock.seedUsers();
            var testUser = userModelMock.getTestUser(),
                passwordResetHash = uuid.v4(),
                newPassword = 'NewPassword',
                newPasswordConfirm = 'NewPassword';

            controller.setSession({ passwordResetHash: passwordResetHash, emailWhoRequestedPasswordReset: testUser.email });

            controller.resetPasswordFinal(testUser.email, newPassword, newPasswordConfirm, passwordResetHash, function (err, apiResponse) {

                if (err) return done(err);
                should(apiResponse.success).equal(true);
                done();
            })
        });
        
    });

    describe('#getUserFromUserRegistration', function () {
        it('Returns "Password confirm mismatch"', function (done) {
            var testUserRegistration = new UserRegistration({
                email: 'test@test.com',
                firstName: 'irrelevant',
                lastName: 'irrelevant',
                password: 'password1',
                passwordConfirm: 'password2'
            });
            var apiResponse = controller.getUserFromUserRegistration(testUserRegistration);
            should(apiResponse.success).equal(false);
            should(apiResponse.extras.msg).equal(ApiMessages.PASSWORD_CONFIRM_MISMATCH);
            done();
        });
        it('Returns User Model', function (done) {
            var testUserRegistration = new UserRegistration({
                email: 'test@test.com',
                firstName: 'irrelevant',
                lastName: 'irrelevant',
                password: 'password',
                passwordConfirm: 'password'
            });
            var apiResponse = controller.getUserFromUserRegistration(testUserRegistration);
            should(apiResponse.success).equal(true);
            should(apiResponse.extras.user).be.an.instanceof(User);
            done();
        });
    });
});