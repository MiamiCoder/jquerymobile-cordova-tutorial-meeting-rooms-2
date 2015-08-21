var UserController = function (userModel) {

        var crypto = require('crypto'),
        uuid = require('node-uuid'),
        ApiResponse = require('../models/api-response.js'),
        ApiMessages = require('../models/api-messages.js'),
        UserProfile = require('../models/user-profile.js');

    // TODO: Implement login, logout and changePassword methods. 

    var readAllUsers = function (callback) {

        userModel.find(function (err, users) {

            if (err) {
                return callback(err, new ApiResponse({ success: false, extras: { msg: ApiMessages.DB_ERROR } }));
            } 

            var userProfileModels = [];

            users.forEach(function (user) {
                userProfileModel = new UserProfile({
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName
                });

                userProfileModels.push(userProfileModel);
            });

            return callback(err, new ApiResponse({ success: true, extras: { userProfileModels: userProfileModels } }));
        });
    };

    var readUser = function (id, callback) {
        
        userModel.findById(id, function (err, user) {

            if (err) {
                return callback(err, new ApiResponse({ success: false, extras: { msg: ApiMessages.DB_ERROR } }));
            }

            if (user) {

                return callback(err, new ApiResponse({
                    success: true, extras: {
                        userProfileModel: new UserProfile({
                            email: user.email,
                            firstName: user.firstName,
                            lastName: user.lastName
                        })
                    }
                }));
            } else {
                return callback(err, new ApiResponse({ success: false, extras: { msg: ApiMessages.NOT_FOUND } }));
            }
        });
    };

    var createUser = function (user, callback) {

        // TODO: Error if user already exists.
        // TODO: Hash Password.

        user.passwordSalt = uuid.v4();

        hashPassword(user.password, user.passwordSalt, function (err, passwordHash) {

            if (err) {
                return callback(err, new ApiResponse({ success: false, extras: { msg: ApiMessages.DB_ERROR } }));
            }

            user.passwordHash = passwordHash;
            user.save(function (err) {
                callback(err, user, numberAffected);
            });

        });        
    };

    var updateUser = function (userIn, callback) {

        userModel.update(
            // Condition
            {_id: userIn._id},
            // Update
            {username: userIn.username, firstName: userIn.firstName, lastName: userIn.lastName},
            // Options
            { multi: false },
            // Callback
            function (err, numberAffected, rawResponse) {
                callback(err, numberAffected)
            }
        );
    };

    var deleteUser = function (id, callback) {
        userModel.remove({ _id: id }, function (err, user) {
            callback(err, user);
        });
    };

    var userIsValid = function(email, password, callback) {

        userModel.findOne({ email: email }, function (err, user) {

            if (err) {
                callback(err, new ApiResponse({ success: false, extras: { msg: ApiMessages.DB_ERROR } }));
                return;
            }   // Error case.

            if (!user) callback(err, new ApiResponse({ success: false, extras: { msg: ApiMessages.EMAIL_NOT_FOUND } })); // User not found case

            // Compare user's password hash with provided password's hash.

            var userPasswordHash = user.passwordHash,
                userPasswordSalt = user.passwordSalt;

            hashPassword(password, userPasswordSalt, function (err, derivedPasswordHash) {

               if (err) {
                   return callback(err, new ApiResponse({ success: false, extras: { msg: ApiMessages.DB_ERROR } }));
               }    // Error case.

               if (derivedPasswordHash === userPasswordHash) {

                   // Valid credentials => return a UserProfile instance
                   return callback(err, new ApiResponse({
                       success: true, extras: {
                           userProfileModel: new UserProfile({
                               email: user.email,
                               firstName: user.firstName,
                               lastName: user.lastName
                           })
                       }
                   }));
               } else {
                   return callback(err, new ApiResponse({ success: false, extras: { msg: ApiMessages.INVALID_PWD } })); // Invalid password.
               }
           });
        });
    }

    var hashPassword = function (password, salt, callback) {        
        // we use pbkdf2 to hash and iterate 10k times by default 
        var iterations = 1000,
            keyLen = 64; // 64 bit.
        crypto.pbkdf2(password, salt, iterations, keyLen, callback);
    };

    return {
        readAllUsers: readAllUsers,
        readUser: readUser,
        createUser: createUser,
        updateUser: updateUser,
        deleteUser: deleteUser
    }
};

module.exports = UserController;