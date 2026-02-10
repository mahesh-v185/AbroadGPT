const express = require('express');
const { query } = require('../config/database');

const router = express.Router();

// Get system settings
router.get('/', async (req, res) => {
  try {
    const result = await query(
      'SELECT setting_key, setting_value, description FROM system_settings ORDER BY setting_key'
    );

    const settings = {};
    result.rows.forEach(row => {
      settings[row.setting_key] = row.setting_value;
    });

    res.json({
      data: settings
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get system settings'
      }
    });
  }
});

module.exports = router;
