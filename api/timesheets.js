const express = require('express');
const timesheetsRouter = express.Router({mergeParams: true});
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

timesheetsRouter.param('timesheetId', (req, res, next, timesheetId) => { 
    const query = 'SELECT * FROM Timesheet WHERE Timesheet.id = $timesheetId';
    const values = { $timesheetId: timesheetId }
    db.get (query, values, (err, timesheet) => {
    if(err) {
        next(err);
    } else if (timesheet) {
        //req.timesheet = timesheet;
        next();
    } else {
        res.sendStatus(404);
    }
   });
});

timesheetsRouter.get('/', (req, res, next) => { 
    const query = 'SELECT * FROM Timesheet WHERE Timesheet.employee_id = $employeeId';
    const values = { $employeeId: req.params.employeeId };

    db.all(query, values, (err, timesheets) => { 
        if(err) {
            next(err);
        } else {
            res.status(200).json({timesheets: timesheets});
        }        
    });
});

timesheetsRouter.post('/', (req,res,next) => {
    const hours = req.body.timesheet.hours;
    const rate = req.body.timesheet.rate;
    const date = req.body.timesheet.date;
    const employeeId = req.params.employeeId;
    if (!hours || !rate || !date) {
        return res.sendStatus(400);
    }
    
    const query = 'INSERT INTO Timesheet (hours, rate, date, employee_id) ' +
    'VALUES ($hours, $rate, $date, $employeeId)';
    const values = {
        $hours: hours,
        $rate: rate,
        $date: date,
        $employeeId: req.params.employeeId
    };

    db.run(query, values, function(err) {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${this.lastID}`,
            (err, timesheet) => {
                res.status(201).json({timesheet: timesheet});
            });
        }
    });
});

timesheetsRouter.put('/:timesheetId', (req, res, next) => {
    const hours = req.body.timesheet.hours;
    const rate = req.body.timesheet.rate;
    const date = req.body.timesheet.date;
    const employeeId = req.params.employeeId;
    if (!hours || !rate || !date) {
        return res.sendStatus(400);
    }

    const query = 'UPDATE Timesheet SET hours = $hours, rate = $rate, ' +
        'date = $date, employee_id = $employeeId ' +
        'WHERE Timesheet.id = $timesheetId';
    const values = {
        $hours: hours,
        $rate: rate,
        $date: date,
        $employeeId: req.params.employeeId,
        $timesheetId: req.params.timesheetId
    };

    db.run(query, values, function(err) {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${req.params.timesheetId}`,
            (err, timesheet) => {
                res.status(200).json({timesheet: timesheet});
            });
        }
    });
});

timesheetsRouter.delete('/:timesheetId', (req, res, next) => {
    const query = 'DELETE FROM Timesheet WHERE Timesheet.id = $timesheetId';
    const values = {$timesheetId: req.params.timesheetId};

    db.run(query, values, (err) => { 
        if (err) {
            next(err);
        } else {
            res.sendStatus(204);
        }
    });

});

module.exports = timesheetsRouter ;