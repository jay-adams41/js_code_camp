const express = require('express');
const apiRouter = express.Router();
const menuRouter = require('./menu.js');
const employeeRouter = require('./employee.js');

apiRouter.use('/menus', menuRouter);
apiRouter.use('/employees', employeeRouter);


module.exports = apiRouter ;