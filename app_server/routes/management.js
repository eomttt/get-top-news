/***************************************************************
// Copyright 2017-2018 SavannaBoat Inc. All rights reserved.
  ___   ___   ___   _  _ _  _   _     ___  ___   _ _____
 / __| /_\ \ / /_\ | \| | \| | /_\   | _ )/ _ \ /_\_   _|
 \__ \/ _ \ V / _ \| .` | .` |/ _ \  | _ \ (_) / _ \| |
 |___/_/ \_\_/_/ \_\_|\_|_|\_/_/ \_\ |___/\___/_/ \_\_|

*****************************************************************/

var router = require('express').Router();

var managementController = require('../controllers/management.controller');

router.post('/getNewsData', managementController.getNewsData);

module.exports = router;