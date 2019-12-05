const Users = require('../../models/users/userModel'),
    jwt = require('jsonwebtoken'),
    bcrypt = require('bcrypt');
const { roles } = require('../../roles');


async function hashPassword(password) {
    return await bcrypt.hash(password, 10);
}

async function validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
}

// check role permissions
exports.grantAccess = function (action, resource) {
    return async (req, res, next) => {
        try {
            const permission = roles.can(req.user.role)[action](resource);
            if (!permission.granted) {
                return res.status(401).json({
                    error: "You don't have permission to access this route"
                });
            }
            next();
        } catch (error) {
            next(error);
        }
    }
}

// allow if logged in
exports.allowIfLoggedIn = async (req, res, next) => {
    try {
        const user = res.locals.loggedInUser;
        // console.log("user: "+user);

        if (!user)
            return res.status(401).json({
                error: "You must be logged in to access"
            });
        req.user = user;
        next();
    } catch (error) {
        next(error);
    }
}



// signup module
exports.signup = async (req, res, next) => {
    try {
        const { email, password, role } = req.body;
        // const email = req.body.email;
        const hashedPassword = await hashPassword(password);
        const newUser = new Users({ email, password: hashedPassword, role: role || 'basic' })
        const accessToken = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
            expiresIn: '1d'
        });
        newUser.accessToken = accessToken;
        await newUser.save();
        res.status(200).json({
            details: newUser
        })
    } catch (error) {
        next(error);
    }
}

// login module
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await Users.findOne({ email });
        if (!user)
            return res.json({
                status: 0,
                error: 'invalid credentials'
            });
        const validPassword = await validatePassword(password, user.password);
        if (!validPassword)
            return res.json({
                status: 0,
                error: 'invalid credentials'
            });
        const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1d'
        });

        await Users.findByIdAndUpdate(user._id, { accessToken })
        res.status(200).json({
            details: {
                id: user._id,
                email: user.email,
                role: user.role,
            },
            accessToken,
        });
    } catch (error) {
        next(error);
    }
}

// get all users
exports.getUsers = async (req, res, next) => {
    const users = await Users.find({});
    res.status(200).send({
        details: users
    });
}

// get single user
exports.getUser = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        const user = await Users.findById(userId);
        if (!user) return next(new Error('User not found'));
        // console.log(`param:${userId}, userID: ${user._id}`);

        res.status(200).send({
            details: {
                email: user.email,
                role: user.role,
                permission: user.permission
            }
        });
    } catch (error) {
        next(error);
        console.log(req);
    }
}

// update user
exports.updateUser = async (req, res, next) => {
    try {
        const data = req.body;
        const userId = req.params.userId;
        const db_details = await Users.findById(userId);
        const update = {
            email: data.email ? data.email : db_details.email,
            password: data.password ? await hashPassword(data.password) : db_details.password,
            role: data.role ? data.role : db_details.role
        };

        await Users.findByIdAndUpdate(userId, update);
        const user = await Users.findById(userId);
        res.status(200).send({
            details: user,
            message: "user updated successfully"
        });
    } catch (error) {
        if (error.code == 11000)
            res.json({
                error: "Email already exists"
            })
        else
            next(error);
    }
}

// delete user
exports.deleteUser = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        await Users.findByIdAndDelete(userId);
        res.status(200).json({
            details: null,
            message: 'user deleted successfully'
        });
    } catch (error) {
        next(error);
    }
}
