/*
 * NTwitBot - index.js
 * Copyright (C) 2016 Jordan Sne
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/* jshint esversion:6, node: true */

const twitterModule  = require('twitter'),
      fs             = require('fs'),
      action         = require('./lib/action.js'),
      data           = require('./lib/data.js'),
      event          = require('./lib/event.js');

const secretData = JSON.parse(fs.readFileSync('./config/secret.json')),
      twitterPkg = new twitterModule(secretData);

const actionHandler = new action(twitterPkg),
      dataHandler   = new data(twitterPkg),
      eventHandler  = new event(twitterPkg, actionHandler, dataHandler);