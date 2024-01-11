const express = require('express');
const employeeRouter = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');
const timesheetsRouter = require('./timesheets.js');

employeeRouter.param('employeeId', (req, res, next, employeeId) => { 
    const query = 'SELECT * FROM Employee WHERE Employee.id = $employeeId';
    const values = { $employeeId: employeeId }
    db.get (query, values, (err, employee) => {
    if(err) {
        next(err);
    } else if (employee) {
        req.employee = employee;
        next();
    } else {
        res.sendStatus(404);
    }
   });
});

employeeRouter.use('/:employeeId/timesheets', timesheetsRouter);

employeeRouter.get('/', (req, res, next) => { 
    db.all('SELECT * FROM Employee WHERE Employee.is_current_employee = 1', (err, employees) => { 
        if(err) {
            next(err);
        } else {
            res.status(200).json({employees: employees});
        }        
    });
});

employeeRouter.get('/:employeeId', (req, res, next ) => { 
    res.status(200).json({employee: req.employee});
});

employeeRouter.post('/', (req, res, next) => {
    const name = req.body.employee.name;
    const position = req.body.employee.position;
    const wage = req.body.employee.wage;

    if(!name || !position || !wage) {
            return res.sendStatus(400);
    }
    const query = 'INSERT INTO employee (name, position, wage) ' +
        'VALUES ($name, $position, $wage)';
    const values = {
        $name: name, 
        $position: position, 
        $wage: wage 
    }
      db.run(query, values, function (err) {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Employee WHERE Employee.id = ${this.lastID}`, 
            (err, employee) => {
                if (err) {
                    next(err);
                } else {
                    res.status(201).json({employee: employee});
                }
             })
        }
    })
});

employeeRouter.put('/:employeeId', (req, res, next) => {
    const name = req.body.employee.name;
    const position = req.body.employee.position;
    const wage = req.body.employee.wage;

    if(!name || !position || !wage) {
            return res.sendStatus(400);
    }
    const query = 'UPDATE Employee SET name = $name, position = $position, wage = $wage ' +
        'WHERE Employee.id = $employeeId';
    const values = {
        $name: name, 
        $position: position, 
        $wage: wage,
        $employeeId: req.params.employeeId 
    };
    db.run(query, values, (err) => {
        if(err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Employee WHERE Employee.id = ${req.params.employeeId}`, 
            (err, employee) => {
                 res.status(200).json({employee: employee});
             })
        }
    });

});

employeeRouter.delete('/:employeeId', (req, res, next) => {
    const query = 'UPDATE Employee SET is_current_employee = 0 ' +
        'WHERE Employee.id = $employeeId';
    const values = {
        $employeeId: req.params.employeeId
    };
    db.run(query, values, (err) => {
        if(err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Employee WHERE Employee.id = ${req.params.employeeId}`, 
            (err, employee) => {
                 res.status(200).json({employee: employee});
             })
        }
    });
});

module.exports = employeeRouter;