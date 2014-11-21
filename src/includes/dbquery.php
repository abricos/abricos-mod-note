<?php
/**
 * @version $Id$
 * @package Abricos
 * @subpackage Note
 * @copyright Copyright (C) 2008 Abricos. All rights reserved.
 * @license http://www.gnu.org/copyleft/gpl.html GNU/GPL, see LICENSE.php
 * @author Alexander Kuzmin (roosit@abricos.org)
 */

class NoteQuery {

	public static function NoteList(Ab_Database $db, $userid){
		$sql = "
			SELECT 
				noteid as id,
				title as tl
			FROM ".$db->prefix."nt_note
			WHERE userid=".bkint($userid)." AND deldate=0
		";
		return $db->query_read($sql);
	}
	
	public static function Note(Ab_Database $db, $userid, $noteid, $retarray = false){
		$sql = "
			SELECT 
				noteid as id,
				title as tl
			FROM ".$db->prefix."nt_note
			WHERE userid=".bkint($userid)." AND deldate=0 AND noteid=".bkint($noteid)."
		";
		return $retarray ? $db->query_first($sql) : $db->query_read($sql);
	}
	
	public static function NoteAppend(Ab_Database $db, $userid, $d){
		$sql = "
			INSERT INTO ".$db->prefix."nt_note (userid, title, dateline) VALUES (
				".bkint($userid).",
				'".bkstr($d->tl)."',
				".TIMENOW."
			)
		";
		$db->query_write($sql);
		return $db->insert_id();
	}
	
	public static function NoteUpdate(Ab_Database $db, $userid, $d){
		$sql = "
			UPDATE ".$db->prefix."nt_note
			SET title='".bkstr($d->tl)."'
			WHERE noteid=".bkint($d->id)." AND userid=".bkint($userid)."
		";
		$db->query_write($sql);
	}
	
	public static function NoteRemove(Ab_Database $db, $userid, $noteid){
		$sql = "
			UPDATE ".$db->prefix."nt_note
			SET deldate=".TIMENOW."
			WHERE noteid=".bkint($noteid)." AND userid=".bkint($userid)."
		";
		$db->query_write($sql);
	}
	
	public static function Record(Ab_Database $db, $userid, $recordid, $retarray = false){
		$sql = "
			SELECT 
				recordid as id,
				noteid as nid,
				userid as uid,
				message as msg,
				dateline as dl,
				dateedit as de
			FROM ".$db->prefix."nt_record
			WHERE userid=".bkint($userid)." AND recordid=".bkint($recordid)."
		";
		return $retarray ? $db->query_first($sql) :  $db->query_read($sql);
	}
	
	public static function RecordList(Ab_Database $db, $userid, $forPrint = false, $recordid = 0, $noteid = 0){
		$sql = "
			SELECT 
				recordid as id,
				noteid as nid,
				userid as uid,
				message as msg,
				dateline as dl,
				dateedit as de
			FROM ".$db->prefix."nt_record
			WHERE userid=".bkint($userid)." AND deldate=0 
				".($forPrint > 0 ? " AND noteid=".bkint($noteid)." " : "")."
				".($recordid > 0 ? " AND recordid=".bkint($recordid)." " : "")."
			ORDER BY ".($forPrint ? "dateline DESC" : "dateline")."
		";
		return $db->query_read($sql);
	}
	
	public static function RecordAppend(Ab_Database $db, $userid, $noteid, $message){
		
		$sql = "
			INSERT INTO ".$db->prefix."nt_record (userid, noteid, message, dateline, dateedit) VALUES (
				".bkint($userid).",
				".bkint($noteid).",
				'".bkstr($message)."',
				".TIMENOW.",
				".TIMENOW."
			)
		";
		$db->query_write($sql);
		return $db->insert_id();
	}
	
	public static function RecordUpdate(Ab_Database $db, $userid, $recordid, $message) {
		$sql = "
			UPDATE ".$db->prefix."nt_record
			SET message='".bkstr($message)."',
				dateedit=".TIMENOW."
			WHERE userid=".bkint($userid)." AND recordid=".bkint($recordid)." 
		";
		$db->query_write($sql);
	}
	
	public static function RecordRemove(Ab_Database $db, $userid, $recordid){
		$sql = "
			UPDATE ".$db->prefix."nt_record
			SET deldate=".TIMENOW."
			WHERE userid=".bkint($userid)." AND recordid=".bkint($recordid)." 
		";
		$db->query_write($sql);
	}
}

?>