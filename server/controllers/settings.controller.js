const asyncHandler = require('express-async-handler');
const { Settings } = require('../models/System');
const ApiResponse = require('../utils/ApiResponse');

// @route  GET /api/settings — public-ish, needed by any authenticated role (working hours, holidays, etc.)
const getSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) settings = await Settings.create({}); // create with schema defaults on first run

  res.status(200).json(new ApiResponse(200, 'Settings fetched', settings));
});

// @route  PUT /api/settings — Super Admin only
const updateSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create(req.body);
  } else {
    Object.assign(settings, req.body);
    await settings.save();
  }

  res.status(200).json(new ApiResponse(200, 'Settings updated successfully', settings));
});

module.exports = { getSettings, updateSettings };
