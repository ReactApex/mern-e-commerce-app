const fs = require('fs');
const appRoot = require('app-root-path');
const { errorResponse, successResponse } = require('../configs/app.response');
const User = require('../models/user.model');
const logger = require('../middleware/winston.logger');
const MyQueryHelper = require('../configs/api.feature');

// TODO: Controller for get user info
exports.getUser = async (req, res) => {
  try {
    const { user } = req;

    if (!user) {
      return res.status(404).json(errorResponse(
        4,
        'UNKNOWN ACCESS',
        'User does not exist'
      ));
    }

    res.status(200).json(successResponse(
      0,
      'SUCCESS',
      'User information get successful',
      {
        userName: user.userName,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        avatar: process.env.APP_BASE_URL + user.avatar,
        gender: user.gender,
        role: user.role,
        verified: user.verified,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    ));
  } catch (error) {
    res.status(500).json(errorResponse(
      2,
      'SERVER SIDE ERROR',
      error
    ));
  }
};

// TODO: Controller for get user info using id by admin
exports.getUserById = async (req, res) => {
  try {
    // check if user exists
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json(errorResponse(
        4,
        'UNKNOWN ACCESS',
        'User does not exist'
      ));
    }

    res.status(200).json(successResponse(
      0,
      'SUCCESS',
      'User information get successful',
      {
        id: user._id,
        userName: user.userName,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        avatar: process.env.APP_BASE_URL + user.avatar,
        gender: user.gender,
        role: user.role,
        verified: user.verified,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    ));
  } catch (error) {
    res.status(500).json(errorResponse(
      2,
      'SERVER SIDE ERROR',
      error
    ));
  }
};

// TODO: Controller for update user info
exports.updateUser = async (req, res) => {
  try {
    const { user } = req;
    const {
      fullName, phone, gender, address
    } = req.body;

    if (!user) {
      return res.status(404).json(errorResponse(
        4,
        'UNKNOWN ACCESS',
        'User does not exist'
      ));
    }

    if (fullName && phone && gender && address) {
      // update user info & save database
      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        {
          fullName, phone, gender, address
        },
        { runValidators: true, new: true }
      );

      res.status(200).json(successResponse(
        0,
        'SUCCESS',
        'User info updated successful',
        {
          userName: updatedUser.userName,
          fullName: updatedUser.fullName,
          email: updatedUser.email,
          phone: updatedUser.phone,
          avatar: process.env.APP_BASE_URL + updatedUser.avatar,
          gender: updatedUser.gender,
          address: updatedUser.address,
          role: updatedUser.role,
          verified: updatedUser.verified,
          status: updatedUser.status,
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt
        }
      ));
    } else {
      // check if fullName is empty
      if (!fullName) {
        return res.status(400).json(errorResponse(
          1,
          'FAILED',
          'User `fullName` field is required'
        ));
      }
      // check if phone is empty
      if (!phone) {
        return res.status(400).json(errorResponse(
          1,
          'FAILED',
          'User `phone` field is required'
        ));
      }
      // check if gender is empty
      if (!gender) {
        return res.status(400).json(errorResponse(
          1,
          'FAILED',
          'User `gender` field is required'
        ));
      }
      // check if address is empty
      if (!address) {
        return res.status(400).json(errorResponse(
          1,
          'FAILED',
          'User `address` field is required'
        ));
      }
    }
  } catch (error) {
    res.status(500).json(errorResponse(
      2,
      'SERVER SIDE ERROR',
      error
    ));
  }
};

// TODO: Controller for update user avatar/image
exports.avatarUpdate = async (req, res) => {
  try {
    const { user, file } = req;

    if (!user) {
      return res.status(404).json(errorResponse(
        4,
        'UNKNOWN ACCESS',
        'User does not exist'
      ));
    }

    if (file) {
      // if find to delete user old avatar
      if (user?.avatar?.includes('/uploads/users')) {
        fs.unlink(`${appRoot}/public/${user.avatar}`, (err) => {
          if (err) { logger.error(err); }
        });
      }

      // update user info & save database
      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        { avatar: `/uploads/users/${file.filename}` },
        { runValidators: true, new: true }
      );

      res.status(200).json(successResponse(
        0,
        'SUCCESS',
        'User avatar updated successful',
        {
          userName: updatedUser.userName,
          fullName: updatedUser.fullName,
          email: updatedUser.email,
          phone: updatedUser.phone,
          avatar: process.env.APP_BASE_URL + updatedUser.avatar,
          gender: updatedUser.gender,
          address: updatedUser.address,
          role: updatedUser.role,
          verified: updatedUser.verified,
          status: updatedUser.status,
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt
        }
      ));
    } else {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        'User `avatar` field is required'
      ));
    }
  } catch (error) {
    // if any error delete uploaded avatar image
    if (req?.file?.filename) {
      fs.unlink(`${appRoot}/public/uploads/users/${req.file.filename}`, (err) => {
        if (err) { logger.error(err); }
      });
    }

    res.status(500).json(errorResponse(
      2,
      'SERVER SIDE ERROR',
      error
    ));
  }
};

// TODO: Controller for delete user also database
exports.deleteUser = async (req, res) => {
  try {
    const { user } = req;

    if (!user) {
      return res.status(404).json(errorResponse(
        4,
        'UNKNOWN ACCESS',
        'User does not exist'
      ));
    }

    // delete user form database
    await User.findByIdAndDelete(user.id);

    // user avatar image delete if available
    if (user?.avatar) {
      const userAvatar = user.avatar.includes('/uploads/users');

      if (userAvatar) {
        fs.unlink(`${appRoot}/public${user.avatar}`, (err) => {
          if (err) {
            logger.error(err.message);
          }
        });
      }
    }

    res.status(200).json(successResponse(
      0,
      'SUCCESS',
      'User delete form database successful'
    ));
  } catch (error) {
    res.status(500).json(errorResponse(
      2,
      'SERVER SIDE ERROR',
      error
    ));
  }
};

// TODO: Controller for delete user using id by admin
exports.deleteUserById = async (req, res) => {
  try {
    // check if user exists
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json(errorResponse(
        4,
        'UNKNOWN ACCESS',
        'User does not exist'
      ));
    }

    // delete user form database
    await User.findByIdAndDelete(user.id);

    // user avatar image delete if available
    if (user?.avatar) {
      const userAvatar = user.avatar.includes('/uploads/users');

      if (userAvatar) {
        fs.unlink(`${appRoot}/public${user.avatar}`, (err) => {
          if (err) {
            logger.error(err.message);
          }
        });
      }
    }

    res.status(200).json(successResponse(
      0,
      'SUCCESS',
      'User delete form database successful'
    ));
  } catch (error) {
    res.status(500).json(errorResponse(
      2,
      'SERVER SIDE ERROR',
      error
    ));
  }
};

// TODO: Controller for get users list for admin
exports.getUsersList = async (req, res) => {
  try {
    const { user } = req;

    if (!user) {
      return res.status(404).json(errorResponse(
        4,
        'UNKNOWN ACCESS',
        'User does not exist'
      ));
    }

    // finding all users data from database
    const users = await User.find();

    if (!users) {
      return res.status(404).json(errorResponse(
        4,
        'UNKNOWN ACCESS',
        'Sorry! Any user does not found'
      ));
    }

    // filtering users based on different types query
    const userQuery = new MyQueryHelper(User.find(), req.query).search('fullName').sort().paginate();
    const findUsers = await userQuery.query;

    res.status(200).json(successResponse(
      0,
      'SUCCESS',
      'Users list data found successful',
      {
        rows: [
          ...findUsers?.map((findUser) => ({
            id: findUser._id,
            userName: findUser.userName,
            fullName: findUser.fullName,
            email: findUser.email,
            phone: findUser.phone,
            avatar: process.env.APP_BASE_URL + findUser.avatar,
            gender: findUser.gender,
            address: findUser.address,
            role: findUser.role,
            verified: findUser.verified,
            status: findUser.status,
            createdAt: findUser.createdAt,
            updatedAt: findUser.updatedAt
          }))
        ],
        total_rows: users.length,
        response_rows: findUsers.length,
        total_page: Math.ceil(users.length / req.query.limit) || 1,
        current_page: parseInt(req.query.page, 10) || 1
      }
    ));
  } catch (error) {
    res.status(500).json(errorResponse(
      2,
      'SERVER SIDE ERROR',
      error
    ));
  }
};

// TODO: Controller for blockedUser user by admin
exports.blockedUser = async (req, res) => {
  try {
    // check if user exists
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json(errorResponse(
        4,
        'UNKNOWN ACCESS',
        'User does not exist'
      ));
    }

    if (user.status === 'blocked') {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        'Ops! User already blocked'
      ));
    }

    // update user status & updateAt time
    const blockedUser = await User.findByIdAndUpdate(
      user._id,
      { status: 'blocked', updatedAt: Date.now() },
      { new: true }
    );

    res.status(200).json(successResponse(
      0,
      'SUCCESS',
      'User blocked successful',
      {
        userName: blockedUser.userName,
        fullName: blockedUser.fullName,
        email: blockedUser.email,
        phone: blockedUser.phone,
        avatar: process.env.APP_BASE_URL + blockedUser.avatar,
        gender: blockedUser.gender,
        address: blockedUser.address,
        role: blockedUser.role,
        verified: blockedUser.verified,
        status: blockedUser.status,
        createdAt: blockedUser.createdAt,
        updatedAt: blockedUser.updatedAt
      }
    ));
  } catch (error) {
    res.status(500).json(errorResponse(
      2,
      'SERVER SIDE ERROR',
      error
    ));
  }
};

// TODO: Controller for unblockedUser user by admin
exports.unblockedUser = async (req, res) => {
  try {
    // check if user exists
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json(errorResponse(
        4,
        'UNKNOWN ACCESS',
        'User does not exist'
      ));
    }

    if (user.status !== 'blocked') {
      return res.status(400).json(errorResponse(
        1,
        'FAILED',
        'Ops! User can´t blocked'
      ));
    }

    // update user status & updateAt time
    const unblockedUser = await User.findByIdAndUpdate(
      user._id,
      { status: 'logout', updatedAt: Date.now() },
      { new: true }
    );

    res.status(200).json(successResponse(
      0,
      'SUCCESS',
      'User unblocked successful',
      {
        userName: unblockedUser.userName,
        fullName: unblockedUser.fullName,
        email: unblockedUser.email,
        phone: unblockedUser.phone,
        avatar: process.env.APP_BASE_URL + unblockedUser.avatar,
        gender: unblockedUser.gender,
        address: unblockedUser.address,
        role: unblockedUser.role,
        verified: unblockedUser.verified,
        status: unblockedUser.status,
        createdAt: unblockedUser.createdAt,
        updatedAt: unblockedUser.updatedAt
      }
    ));
  } catch (error) {
    res.status(500).json(errorResponse(
      2,
      'SERVER SIDE ERROR',
      error
    ));
  }
};
