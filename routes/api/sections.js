const express = require('express');
const router = express.Router();
const sectionsController = require('../../controllers/sectionsController');
const ROLES_LIST = require('../../config/roles_list');
const verifyRoles = require('../../middleware/verifyRoles');
const verifyJWT = require('../../middleware/verifyJWT');

router.route('/:id')
    .get(sectionsController.getSectionsByReviewId)
    .delete(verifyJWT,
        verifyRoles(ROLES_LIST.Admin),
        sectionsController.deleteSection)
    .put(verifyJWT,
        verifyRoles(ROLES_LIST.Admin),
        sectionsController.updateSection)

module.exports = router;