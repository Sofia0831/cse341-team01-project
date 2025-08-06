const User = require('../models/User');
const bcrypt = require('bcryptjs');



const getAllUsers = async (req, res) => {
  //#swagger.tags=["User"]
  //#swagger.summary="Get all users"
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Server error fetching users" });
  }
};

const getMe = async(req, res) => {
    //#swagger.tags=["User"]
    //#swagger.summary="Get user details of currently logged in user"
    try {
    const user = await User.findById(req.user.userId).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json(user);
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ error: 'Server error fetching user profile.' });
  }
};

const updateUser = async (req, res) => {
  //#swagger.tags=["User"]
  //#swagger.summary="Update a user by ID"
    try {
        const { id } = req.params;
        const { email, password, role } = req.body;

        // A user can only update their own account unless they are an admin.
        if (req.user.id !== id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden: You can only update your own account' });
        }


        // If a 'role' is provided in the body, only an admin is allowed to make this change.
        if (role && req.user.role !== 'admin') {
             return res.status(403).json({ message: 'Forbidden: Only admins can change a user\'s role' });
        }

        const updateFields = { email };

        // Hash the new password
        if (password) {
            const salt = await bcrypt.genSalt(10);
            updateFields.password = await bcrypt.hash(password, salt);
        }
        
        // Only allow a role update if the user is an admin and the role is provided
        if (role && req.user.role === 'admin') {
            updateFields.role = role;
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { $set: updateFields },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Respond with the updated user data
        res.status(200).json({
            message: 'User updated successfully',
            user: {
                id: updatedUser._id,
                email: updatedUser.email,
                role: updatedUser.role
            }
        });
    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).json({ error: 'Server error updating user' });
    }
};

const deleteUser = async (req, res) => {
  //#swagger.tags=["User"]
  //#swagger.summary="Delete a user by ID"
    try {
        const { id } = req.params;

        // Use findByIdAndDelete to find the user and remove them in one go
        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            // If deletedUser is null, it means no user with that ID was found
            return res.status(404).json({ message: 'User not found' });
        }

        // Respond with a success message
        res.status(200).json({
            message: 'User deleted successfully',
            user: {
                id: deletedUser._id,
                email: deletedUser.email
            }
        });

    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ error: 'Server error deleting user' });
    }
};

module.exports = {
    getAllUsers,
    getMe,
    updateUser,
    deleteUser
};