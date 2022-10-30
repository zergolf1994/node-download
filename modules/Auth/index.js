const jwt = require("jsonwebtoken");
const User = require('../Mysql/Users');
const Auths = require('../Mysql/Auth');

const verifyToken = async (req, res, next) => {
    const token = req.body.token || req.query.token || req.headers["x-access-token"];
    try {
        if (!token) {
            return res.json({ status: false, msg: "A token is required for authentication." });
        } else {
            console.log(process.env.JWT_TOKEN_KEY)
            const data = jwt.verify(token, process.env.JWT_TOKEN_KEY);

            // check auths status
            const findAuths = await Auths.findOne({ where: { uid: data?.uid, token: data.token } });
            if (!findAuths) return res.json({ status: false, msg: "Login information not found." , e_code:401 });
            if (!findAuths?.active) return res.json({ status: false, msg: "Login Canale." , e_code:401 });
            // check user status
            const findUser = await User.findOne({ where: { id: data?.uid } });
            if (!findUser?.active) return res.json({ status: false, msg: "User has been banned." });
            req.user = {
                id:findUser?.id,
                active:findUser?.active,
                role:findUser?.role,
                email:findUser?.email,
                username:findUser?.username,
                createdAt:findUser?.createdAt,
                updatedAt:findUser?.updatedAt,
            }
        }
    } catch (err) {
        return res.json({ status: false, msg: "Invalid Token." });
    }
    return next();
};
module.exports = verifyToken;