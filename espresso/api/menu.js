const express = require('express');
const menuRouter = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');
const menuItemsRouter = require('./menuitems.js');

menuRouter.param('menuId', (req, res, next, menuId) => { 
    const query = 'SELECT * FROM Menu WHERE Menu.id = $menuId';
    const values = { $menuId: menuId }
    db.get (query, values, (err, menu) => {
    if(err) {
        next(err);
    } else if (menu) {
        req.menu = menu;
        next();
    } else {
        res.sendStatus(404);
    }
   });
});

menuRouter.use('/:menuId/menu-items', menuItemsRouter);

menuRouter.get('/', (req, res, next) => { 
    db.all('SELECT * FROM Menu', (err, menus) => { 
        if(err) {
            next(err);
        } else {
            res.status(200).json({menus: menus});
        }        
    });
});

menuRouter.get('/:menuId', (req, res, next ) => { 
    res.status(200).json({menu: req.menu});
});

menuRouter.post('/', (req, res, next) => {
    const title = req.body.menu.title;
    if(!title) {
        return res.sendStatus(400);
    }
    const query = 'INSERT INTO Menu (title) VALUES ($title)';
    const values = {
        $title: req.body.menu.title
    }

    db.run(query, values, function (err) {
    if (err) {
        next(err);
    } else {
        db.get(`SELECT * FROM Menu WHERE Menu.id = ${this.lastID}`, 
        (err, menu) => {
            if (err) {
                next(err);
            } else {
                res.status(201).json({menu: menu});
            }
            })
    }
    })
});

menuRouter.put('/:menuId', (req, res, next) => {
    const title = req.body.menu.title;
    if(!title) {
        return res.sendStatus(400);
    }
    const query = 'UPDATE Menu SET title = $title WHERE Menu.id = $menuId';
    const values = {
        $title: title,
        $menuId: req.params.menuId
    }
      db.run(query, values, function (err) {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Menu WHERE Menu.id = ${req.params.menuId}`, 
            (err, menu) => {
                if (err) {
                    next(err);
                } else {
                    res.status(200).json({menu: menu});
                }
             })
        }
    })
});

menuRouter.delete('/:menuId', (req, res, next) => {
    const menuItemSql = 'SELECT * FROM MenuItem WHERE MenuItem.menu_id = $menuId'; 
    const menuItemValues = {$menuId: req.params.menuId};
    db.get(menuItemSql, menuItemValues, (err, menuItem) => {
        if (err) {
            next(err);
        } else if (menuItem) {
            return res.sendStatus(400);
        } else {
            const deleteSql = 'DELETE FROM Menu WHERE Menu.id = $menuId';
            const deleteValues = {$menuId: req.params.menuId};
            
            db.run(deleteSql, deleteValues, (err) => { 
                if (err) {
                    next(err);
                } else {
                    res.sendStatus(204);
                }
            });
        }
    });
}); 

module.exports = menuRouter;