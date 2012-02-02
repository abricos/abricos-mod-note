<?php
/**
 * Схема таблиц данного модуля.
 * 
 * @version $Id$
 * @package Abricos
 * @subpackage Note
 * @copyright Copyright (C) 2008 Abricos. All rights reserved.
 * @license http://www.gnu.org/copyleft/gpl.html GNU/GPL, see LICENSE.php
 * @author 
 */

$charset = "CHARACTER SET 'utf8' COLLATE 'utf8_general_ci'";
$updateManager = Ab_UpdateManager::$current; 
$db = Abricos::$db;
$pfx = $db->prefix;

if ($updateManager->isInstall()){

	Abricos::GetModule('note')->permission->Install();
	
	/*
	$db->query_write("
		CREATE TABLE IF NOT EXISTS ".$pfx."nt_note (
		  `noteid` int(10) unsigned NOT NULL auto_increment COMMENT 'Идентификатор',
		  `userid` int(10) unsigned NOT NULL DEFAULT 0 COMMENT 'Идентификатор пользователя',
		  `message` TEXT NOT NULL COMMENT 'Сообщение',
		  `comment` TEXT NOT NULL COMMENT 'Комментарий',
		  `statusid` int(1) unsigned NOT NULL DEFAULT 0 COMMENT 'Статус: 0-без статуса, 1-низкий, ..., 5-высокий',
		  `owner` varchar(10) NOT NULL DEFAULT '' COMMENT 'Имя модуля основателя записи',
		  `dateline` int(10) unsigned NOT NULL DEFAULT 0 COMMENT 'Дата добавления записи',
		  `dateedit` int(10) unsigned NOT NULL DEFAULT '0' COMMENT 'Дата изменения записи',
		  `deldate` int(10) unsigned NOT NULL DEFAULT 0 COMMENT 'Дата удаления',
		  PRIMARY KEY  (`noteid`)
		)".$charset
	);
	/**/
}

if ($updateManager->isUpdate('0.1.0.1')){
	
	$db->query_write("
		CREATE TABLE IF NOT EXISTS ".$pfx."nt_record (
		  `recordid` int(10) unsigned NOT NULL auto_increment COMMENT 'Идентификатор',
		  `noteid` int(10) unsigned NOT NULL DEFAULT 0 COMMENT 'Идентификатор блокнота',
		  `userid` int(10) unsigned NOT NULL DEFAULT 0 COMMENT 'Идентификатор пользователя',
		  `message` TEXT NOT NULL COMMENT 'Сообщение',
		  `dateline` int(10) unsigned NOT NULL DEFAULT 0 COMMENT 'Дата добавления записи',
		  `dateedit` int(10) unsigned NOT NULL DEFAULT '0' COMMENT 'Дата изменения записи',
		  `deldate` int(10) unsigned NOT NULL DEFAULT 0 COMMENT 'Дата удаления',
		  PRIMARY KEY  (`recordid`)
		)".$charset
	);
	
}

if ($updateManager->isUpdate('0.1.0.1') && !$updateManager->isInstall()){
	
	$db->query_write("
		INSERT INTO ".$pfx."nt_record (userid, message, dateline, dateedit, deldate) 
		SELECT n.userid, n.message, n.dateline, n.dateedit, n.deldate
		FROM ".$pfx."nt_note n
	");
	
	$db->query_write("DROP TABLE ".$pfx."nt_note");
}

if ($updateManager->isUpdate('0.1.0.1')){

	$db->query_write("
		CREATE TABLE IF NOT EXISTS ".$pfx."nt_note (
		  `noteid` int(10) unsigned NOT NULL auto_increment COMMENT 'Идентификатор',
		  `parentnoteid` int(10) unsigned NOT NULL DEFAULT 0 COMMENT 'Идентификатор блокнота родителя',
		  `userid` int(10) unsigned NOT NULL DEFAULT 0 COMMENT 'Идентификатор пользователя',
		  `title` varchar(250) NOT NULL DEFAULT '' COMMENT 'Имя модуля основателя записи',
		  `dateline` int(10) unsigned NOT NULL DEFAULT 0 COMMENT 'Дата добавления записи',
		  `dateedit` int(10) unsigned NOT NULL DEFAULT '0' COMMENT 'Дата изменения записи',
		  `deldate` int(10) unsigned NOT NULL DEFAULT 0 COMMENT 'Дата удаления',
		  PRIMARY KEY  (`noteid`)
		)".$charset
	);
}

?>