const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const { userValidationRules, validate } = require('../middleware/validation');

const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');


router.get('/', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Server error fetching users" });
  }
});

router.post('/', userValidationRules, validate,  async(req, res) => {
      try {
    const { email, password, role } = req.body;

    // Check if user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // Return a conflict error if the user exists
      return res.status(409).json({ message: 'User with that email already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new User instance
    const newUser = new User({
      email,
      password: hashedPassword,
      role
    });

    // Save the new user to the database
    await newUser.save();

    // Respond with success
    res.status(201).json({ 
      message: 'User created successfully',
      user: {
        id: newUser._id,
        email: newUser.email,
        role: newUser.role
      }
    });

  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ error: "Server error creating user" });
  }
});

router.put('/:id', authMiddleware, userValidationRules, validate, async (req, res) => {
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
});


router.delete('/:id', authMiddleware, roleMiddleware('admin'), async (req, res) => {
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
});



module.exports = router;