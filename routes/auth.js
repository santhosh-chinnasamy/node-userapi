const express = require('express'),
    router = express.Router(),
    userController = require('../controllers/auth/userController');

router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.get('/user/:userId', userController.allowIfLoggedIn, userController.getUser);
router.get('/users', userController.allowIfLoggedIn, userController.grantAccess('readAny', 'profile'), userController.getUsers);
router.put('/users/:userId', userController.allowIfLoggedIn, userController.grantAccess('updateAny', 'profile'), userController.updateUser); // for admin
router.put('/user/:userId', userController.allowIfLoggedIn, userController.grantAccess('updateOwn', 'profile'), userController.updateUser); // for basic
router.delete('/user/:userId', userController.allowIfLoggedIn, userController.grantAccess('deleteAny', 'profile'), userController.deleteUser);


module.exports =router;