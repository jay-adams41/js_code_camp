const express = require('express');
const menuItemsRouter = express.Router({mergeParams: true});
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');


menuItemsRouter.param('menuItemId', (req, res, next, menuItemId) => { 
    const query = 'SELECT * FROM MenuItem WHERE MenuItem.id = $menuItemId';
    const values = { $menuItemId: req.params.menuItemId }
    db.get (query, values, (err, menuItem) => {
    if(err) {
        next(err);
    } else if (menuItem) {
        req.menuItem = menuItem;
        next();
    } else {
        res.sendStatus(404);
    }
   });
});

menuItemsRouter.get('/', (req, res, next) => { 
    const query = 'SELECT * FROM MenuItem WHERE MenuItem.menu_id = $menuId';
    const values = { $menuId: req.params.menuId };

    db.all(query, values, (err, menuItems) => { 
        if(err) {
            next(err);
        } else {
            res.status(200).json({menuItems: menuItems});
        }        
    });
});

menuItemsRouter.post('/', (req,res,next) => {
    const name = req.body.menuItem.name;
    const description = req.body.menuItem.description;
    const inventory = req.body.menuItem.inventory;
    const price = req.body.menuItem.price;
    const menuId = req.params.menuId;
    
    const menuSql = 'SELECT * FROM Menu WHERE Menu.id = $menuId';
    const menuValues = {$menuId: menuId};

    db.get(menuSql, menuValues, (err, artist) => { 
        if (err) {
            next(err);
        } else {
        if (!name || !inventory || !price || !menuId) {
            return res.sendStatus(400);
        }
            
        const query = 'INSERT INTO MenuItem (name, description, inventory, price, menu_id) ' +
            'VALUES ($name, $description, $inventory, $price, $menuId)';
            const values = {
                $name: name,
                $description: description,
                $inventory: inventory,
                $price: price,
                $menuId: menuId
            };

            db.run(query, values, function(err) {
                if (err) {
                    next(err);
                } else {
                    db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${this.lastID}`,
                    (err, menuItem) => {
                        res.status(201).json({menuItem: menuItem});
                    });
                }
            });
        }
    });
});

menuItemsRouter.put('/:menuItemId', (req, res, next) => {
    const name = req.body.menuItem.name;
    const description = req.body.menuItem.description;
    const inventory = req.body.menuItem.inventory;
    const price = req.body.menuItem.price;
    const menuId = req.params.menuId;

    const menuSql = 'SELECT * FROM Menu WHERE Menu.id = $menuId';
    const menuValues = {$menuId: menuId};
    db.get(menuSql, menuValues, (err, menu) => { 
        if (err) {
            next(err);
        } else {
            if (!name || !inventory || !price || !menu) {
                return res.sendStatus(400);
            }
            const query = 'UPDATE MenuItem SET name = $name, description = $description, ' +
                'inventory = $inventory, price = $price, menu_id = $menuId ' +
                'WHERE MenuItem.id = $menuItemId';
            const values = {
                $name: name,
                $description: description,
                $inventory: inventory,
                $price: price,
                $menuId: menuId,
                $menuItemId: req.params.menuItemId 
            };

            db.run(query, values, function(err) {
                if (err) {
                    next(err);
                } else {
                    db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${req.params.menuItemId}`,
                    (err, menuItem) => {
                        res.status(200).json({menuItem: menuItem});
                    });
                }
            });
        }
    });
});

menuItemsRouter.delete('/:menuItemId', (req, res, next) => {
    const query = 'DELETE FROM MenuItem WHERE MenuItem.id = $menuItemId';
    const values = {$menuItemId: req.params.menuItemId};

    db.run(query, values, (err) => { 
        if (err) {
            next(err);
        } else {
            res.sendStatus(204);
        }
    });

});

module.exports = menuItemsRouter ;