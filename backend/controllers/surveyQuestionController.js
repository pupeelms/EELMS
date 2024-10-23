const SurveyQuestion = require('../models/SurveyQuestionModel');

exports.getSurveyQuestions = async (req, res) => {
  try {
    const questions = await SurveyQuestion.find();
    res.status(200).json(questions);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.createSurveyQuestion = async (req, res) => {
  try {
    const surveyQuestion = new SurveyQuestion(req.body);
    await surveyQuestion.save();
    res.status(201).json({ message: 'Survey question added', data: surveyQuestion });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};
