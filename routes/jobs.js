const express = require('express');
const router = express.Router();
const {
  getAllJobs,
  postJob,
  getFormPostJob,
  getJobAndEdit,
  getJobAndUpdate,
  getJobAndDelete,
} = require('../controllers/jobs');

// GET /jobs (display all the job listings belonging to this user)
// POST /jobs (Add a new job listing)
router.route('/').post(postJob).get(getAllJobs);

// GET /jobs/new (Put up the form to create a new entry)
router.route('/new').get(getFormPostJob);

// GET /jobs/edit/:id (Get a particular entry and show it in the edit box)
router.route('/edit/:id').get(getJobAndEdit);

// POST /jobs/update/:id (Update a particular entry)
router.route('/update/:id').post(getJobAndUpdate);

// POST /jobs/delete/:id (Delete an entry)
router.route('/delete/:id').post(getJobAndDelete);

module.exports = router;
