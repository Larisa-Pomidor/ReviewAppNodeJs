const express = require('express');
const router = express.Router();
const sectionsController = require('../../controllers/sectionsController');
const ROLES_LIST = require('../../config/roles_list');
const verifyRoles = require('../../middleware/verifyRoles');

router.route('/:id')
    .get(sectionsController.getSectionsByReviewId)
    .delete(sectionsController.deleteSection)
    .put(sectionsController.updateSection)

module.exports = router;