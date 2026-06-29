const AppError = require('../errors/AppError');

const validateMarks = (req, res, next) => {
    const { marks } = req.body;

    if (req.method === 'POST' && (marks === undefined || marks === null || marks === '')) {
        return next(new AppError('Marks are required', 400));
    }

    if (marks !== undefined && marks !== null && marks !== '') {
        const marksNum = Number(marks);

        if (isNaN(marksNum) || typeof marks === 'boolean') {
            return next(new AppError('Marks must be a number', 400));
        }

        if (marksNum < 0 || marksNum > 100) {
            return next(new AppError('Marks must be between 0 and 100 inclusive', 400));
        }

        req.body.marks = marksNum;
    }

    next();
};

module.exports = { validateMarks };
