const User = require('../models/user');
const FriendShip = require('../models/friendship');

module.exports.toggleFriends = async function (req, res) {
    try {
        let friends;
        let unFriend = false;
        
        friends = await User.findById(req.query.id).populate('friendships');

        //Check if already friend
        let existFriend = await FriendShip.findOne({
            from_user: req.user._id,
            to_user: req.query.id,
        });

        //if a friend already exists then remove it
        if (existFriend) {
            friends.friendships.pull(existFriend._id);
            friends.save();

            existFriend.remove();
            unFriend = true;
        } else {
            // make a new Friend

            let newFriend = await FriendShip.create({
                from_user: req.user._id,
                to_user: req.query.id,
            });

            friends.friendships.push(newFriend._id);
            friends.save();
        }

        return res.json(200, {
            message: 'Request successful',
            data: {
                unFriend: unFriend
            }
        })
    } catch (err) {
        console.log(err);
        return res.json(500, {
            message: 'Internal server error',
        })
    }
}