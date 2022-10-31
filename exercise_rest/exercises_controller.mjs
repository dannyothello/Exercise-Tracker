import 'dotenv/config';
import * as exercises from './exercises_model.mjs';
import express from 'express';
import { body, validationResult } from 'express-validator';

const PORT = process.env.PORT;

const app = express();

app.use(express.json());

/**
*
* @param {string} date
* Return true if the date format is MM-DD-YY where MM, DD and YY are 2 digit integers
*/
function isDateValid(date) {
    // Test using a regular expression. 
    const format = /^\d\d-\d\d-\d\d$/;
    return format.test(date);
}

/**
 * Create a new exercise with the title, year and language provided in the body
 */
app.post('/exercises', [
    body('name').isLength({ min: 1 }),
    body('reps').isInt({ gt: 0 }),
    body('weight').isInt({ gt: 0 }),
    body('unit').isIn(['lbs', 'kgs'])
], (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ Error: 'Invalid request' });
    }
    if (!isDateValid(req.body.date)) {
        return res.status(400).json({ Error: 'Invalid request' });
    }
    exercises.createExercise(req.body.name, req.body.reps, req.body.weight, req.body.unit, req.body.date)
        .then(exercise => {
            res.status(201).json(exercise);
        })
        .catch(error => {
            console.error(error);
            // In case of an error, send back status code 400 in case of an error.
            // A better approach will be to examine the error and send an
            // error status code corresponding to the error.
            res.status(400).json({ Error: 'Invalid request' });
        });
});


/**
 * Retrive the exercise corresponding to the ID provided in the URL.
 */
app.get('/exercises/:_id', (req, res) => {
    const exerciseId = req.params._id;
    exercises.findExerciseById(exerciseId)
        .then(exercise => {
            if (exercise !== null) {
                res.json(exercise);
            } else {
                res.status(404).json({ Error: 'Not found' });
            }
        })
        .catch(error => {
            res.status(400).json({ Error: 'Request failed' });
        });

});

/**
 * Retrieve exercises. 
 * If the query parameters include a year, then only the exercises for that year are returned.
 * Otherwise, all exercises are returned.
 */
app.get('/exercises', (req, res) => {
    let filter = {};
    exercises.findExercises(filter, '', 0)
        .then(exercises => {
            res.send(exercises);
        })
        .catch(error => {
            console.error(error);
            res.send({ Error: 'Request failed' });
        });

});

/**
 * Update the exercise whose id is provided in the path parameter and set
 * its title, year and language to the values provided in the body.
 */
app.put('/exercises/:_id', [
    body('name').isLength({ min: 1 }),
    body('reps').isInt({ gt: 0 }),
    body('weight').isInt({ gt: 0 }),
    body('unit').isIn(['lbs', 'kgs']),
    body('date').exists()
], (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ Error: 'Invalid request' });
    }
    if (!isDateValid(req.body.date)) {
        return res.status(400).json({ Error: 'Invalid request' });
    }
    exercises.replaceExercise(req.params._id, req.body.name, req.body.reps, req.body.weight, req.body.unit, req.body.date)
        .then(numUpdated => {
            if (numUpdated === 1) {
                res.json({ _id: req.params._id, name: req.body.name, reps: req.body.reps, weight: req.body.weight, unit: req.body.unit, date: req.body.date })
            } else {
                res.status(404).json({ Error: 'Not found' });
            }
        })
        .catch(error => {
            console.error(error);
            res.status(400).json({ Error: 'Invalid request' });
        });
});

/**
 * Delete the exercise whose id is provided in the query parameters
 */
app.delete('/exercises/:_id', (req, res) => {
    exercises.deleteById(req.params._id)
        .then(deletedCount => {
            if (deletedCount === 1) {
                res.status(204).send();
            } else {
                res.status(404).json({ Error: 'Not found' });
            }
        })
        .catch(error => {
            console.error(error);
            res.send({ Error: 'Request failed' });
        });
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`);
});