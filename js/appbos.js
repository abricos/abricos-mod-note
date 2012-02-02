/*
@version $Id$
@copyright Copyright (C) 2011 Abricos All rights reserved.
@license http://www.gnu.org/copyleft/gpl.html GNU/GPL, see LICENSE.php
*/

var Component = new Brick.Component();
Component.entryPoint = function(){
	
	if (Brick.Permission.check('note', '30') != 1){ return; }
	
	var os = Brick.mod.bos;
	
	var app = new os.Application(this.moduleName);
	app.icon = '/modules/note/images/app_icon.gif';
	app.entryComponent = 'manager';
	app.entryPoint = 'showNotepadPanel';
	
	os.ApplicationManager.register(app);
	
};
