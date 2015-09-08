<?php
/**
 * @package Abricos
 * @subpackage Note
 * @copyright 2011-2015 Alexander Kuzmin
 * @license http://opensource.org/licenses/mit-license.php MIT License
 * @author Alexander Kuzmin <roosit@abricos.org>
 */

$charset = "CHARACTER SET 'utf8' COLLATE 'utf8_general_ci'";
$updateManager = Ab_UpdateManager::$current;
$db = Abricos::$db;
$pfx = $db->prefix;

if ($updateManager->isInstall()){
    Abricos::GetModule('note')->permission->Install();
}

if ($updateManager->isUpdate('0.1.0.1')){

    $db->query_write("
		CREATE TABLE IF NOT EXISTS ".$pfx."nt_record (
		  recordid int(10) unsigned NOT NULL auto_increment COMMENT 'Идентификатор',
		  noteid int(10) unsigned NOT NULL DEFAULT 0 COMMENT 'Идентификатор блокнота',
		  userid int(10) unsigned NOT NULL DEFAULT 0 COMMENT 'Идентификатор пользователя',
		  message TEXT NOT NULL COMMENT 'Сообщение',
		  dateline int(10) unsigned NOT NULL DEFAULT 0 COMMENT 'Дата добавления записи',
		  dateedit int(10) unsigned NOT NULL DEFAULT '0' COMMENT 'Дата изменения записи',
		  deldate int(10) unsigned NOT NULL DEFAULT 0 COMMENT 'Дата удаления',
		  PRIMARY KEY  (recordid)
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
		  noteid int(10) unsigned NOT NULL auto_increment COMMENT 'Идентификатор',
		  parentnoteid int(10) unsigned NOT NULL DEFAULT 0 COMMENT 'Идентификатор блокнота родителя',
		  userid int(10) unsigned NOT NULL DEFAULT 0 COMMENT 'Идентификатор пользователя',
		  title varchar(250) NOT NULL DEFAULT '' COMMENT 'Имя модуля основателя записи',
		  dateline int(10) unsigned NOT NULL DEFAULT 0 COMMENT 'Дата добавления записи',
		  dateedit int(10) unsigned NOT NULL DEFAULT '0' COMMENT 'Дата изменения записи',
		  deldate int(10) unsigned NOT NULL DEFAULT 0 COMMENT 'Дата удаления',
		  PRIMARY KEY  (noteid)
		)".$charset
    );
}

?>