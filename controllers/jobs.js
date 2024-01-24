const express = require('express');
const Job = require('../models/Job');

const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ createdBy: req.user._id });
    res.render('jobs', { jobs });
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send('There was an Internal Server Error');
  }
};

const postJob = async (req, res) => {
  const job = await Job.create({ createdBy: req.user._id });
  res.render('job', { job: null });
};

const getFormPostJob = async (req, res) => {
  res.render('job', { job: null });
};

const getJobAndEdit = async (req, res) => {
  const {
    params: { id: jobID },
    user: { _id: jobOwnerID },
  } = req;
  const job = await Job.findOne({ _id: jobID, createdBy: jobOwnerID });
  res.render('job', { job });
};

const getJobAndUpdate = async (req, res) => {
  const {
    params: { id: jobID },
    user: { _id: jobOwnerID },
    body: { status, position, company },
  } = req;
  await Job.updateOne(
    { _id: jobID, createdBy: jobOwnerID },
    { status, position, company }
  );
  res.redirect('/jobs');
};

const getJobAndDelete = async (req, res) => {
  const {
    params: { id: jobID },
    user: { _id: jobOwnerID },
  } = req;
  const job = await Job.findOneAndDelete({
    _id: jobID,
    createdBy: jobOwnerID,
  });
  if (!job) {
    res.send(`No job with id ${jobID}`);
  }
  res.redirect('/jobs');
};

module.exports = {
  getAllJobs,
  postJob,
  getFormPostJob,
  getJobAndEdit,
  getJobAndUpdate,
  getJobAndDelete,
};

// GET /jobs (display all the job listings belonging to this user)
// POST /jobs (Add a new job listing)
// GET /jobs/new (Put up the form to create a new entry)
// GET /jobs/edit/:id (Get a particular entry and show it in the edit box)
// POST /jobs/update/:id (Update a particular entry)
// POST /jobs/delete/:id (Delete an entry)
