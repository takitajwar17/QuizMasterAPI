const fs = require('fs');
const leaderboardFilePath = 'leaderboard.json';
const mistakesFilePath = 'mistakes.json';

// Load quizzes from JSON file
const loadQuizzes = () => {
    try {
        const data = fs.readFileSync('quiz.json', 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
};

// Save quizzes to JSON File
const saveQuizzes = (quizzes) => {
    fs.writeFileSync('quiz.json', JSON.stringify(quizzes, null, 2), 'utf8');
};

class Quiz {
    constructor(question, options, correctAnswers, questionID) {
        this.question = question;
        this.options = options;
        this.correctAnswers = correctAnswers; // Correct answers now an array
        this.questionID = questionID;
    }
}

const addQuiz = (question, options, correctAnswers) => {
    const quizzes = loadQuizzes();

    // Generate a unique questionID by adding 1 to the maximum existing questionID
    const maxQuestionID = Math.max(...quizzes.map(quiz => parseInt(quiz.questionID) || 0));
    const newQuestionID = (maxQuestionID + 1).toString();

    const quiz = new Quiz(question, options, correctAnswers, newQuestionID);
    quizzes.push(quiz);
    saveQuizzes(quizzes);
    return quiz;
};



const getAllQuizzes = () => {
    return loadQuizzes();
};

const takeQuiz = (userResponses) => {
    console.log("Received User Responses:", userResponses);
    const quizzes = loadQuizzes();
    let score = 0;
    let incorrectQuestions = [];
    userResponses.forEach(response => {
        const quiz = quizzes.find(q => q.questionID === response.questionID);
        if (quiz) {
            const isCorrect = quiz.correctAnswers.length === response.userAnswers.length &&
                response.userAnswers.every(answer => quiz.correctAnswers.includes(answer));
            if (!isCorrect) {
                incorrectQuestions.push(quiz.questionID);
            }
            if (isCorrect) {
                score++;
            }
        }
    });

    updateLeaderboard(userResponses.username, score);
    updateMistakes(userResponses.username, incorrectQuestions);
    return { score };
};


const loadLeaderboard = () => {
    try {
        const data = fs.readFileSync(leaderboardFilePath, 'utf8');

        return JSON.parse(data);
    } catch (err) {
        return [];
    }
};


const saveLeaderboard = (leaderboard) => {
    fs.writeFileSync(leaderboardFilePath, JSON.stringify(leaderboard, null, 2), 'utf8');
};

const updateLeaderboard = (username, score) => {
    console.log(`Updating leaderboard for ${username} with score ${score}`);

    const leaderboard = loadLeaderboard();
    const userEntryIndex = leaderboard.findIndex(entry => entry.username === username);

    if (userEntryIndex !== -1) {
        leaderboard[userEntryIndex].marks.push(score);
    } else {
        leaderboard.push({ username: username, marks: [score] });
    }

    saveLeaderboard(leaderboard);
};

// Load mistakes data from JSON file
const loadMistakes = () => {
    try {
        const data = fs.readFileSync(mistakesFilePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
};

// Save mistakes data to JSON file
const saveMistakes = (mistakes) => {
    fs.writeFileSync(mistakesFilePath, JSON.stringify(mistakes, null, 2), 'utf8');
};

// Function to add mistakes to the mistakes.json
const updateMistakes = (username, incorrectQuestions) => {
    const mistakes = loadMistakes();
    let userMistakes = mistakes.find(m => m.username === username);

    if (userMistakes) {
        // Add new mistakes ensuring no duplicates
        incorrectQuestions.forEach(questionID => {
            if (!userMistakes.mistakes.includes(questionID)) {
                userMistakes.mistakes.push(questionID);
            }
        });
    } else {
        // If user not found, create a new entry
        userMistakes = { username, mistakes: incorrectQuestions };
        mistakes.push(userMistakes);
    }

    saveMistakes(mistakes);
};





module.exports = {
    addQuiz,
    getAllQuizzes,
    takeQuiz,
    loadLeaderboard
};
