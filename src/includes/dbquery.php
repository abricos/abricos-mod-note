<?php
/**
 * @package Abricos
 * @subpackage Note
 * @copyright 2011-2015 Alexander Kuzmin
 * @license http://opensource.org/licenses/mit-license.php MIT License
 * @author Alexander Kuzmin <roosit@abricos.org>
 */

/**
 * Class NoteQuery
 */
class NoteQuery {

    public static function NoteList(Ab_Database $db, $userid){
        $sql = "
			SELECT n.noteid as id, n.*
			FROM ".$db->prefix."nt_note n
			WHERE userid=".bkint($userid)." AND deldate=0
		";
        return $db->query_read($sql);
    }

    public static function NoteAppend(Ab_Database $db, $userid, $d){
        $sql = "
			INSERT INTO ".$db->prefix."nt_note (userid, title, dateline) VALUES (
				".bkint($userid).",
				'".bkstr($d->title)."',
				".TIMENOW."
			)
		";
        $db->query_write($sql);
        return $db->insert_id();
    }

    public static function NoteUpdate(Ab_Database $db, $userid, $d){
        $sql = "
			UPDATE ".$db->prefix."nt_note
			SET title='".bkstr($d->title)."'
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

    public static function RecordList(Ab_Database $db, $userid, $forPrint = false, $recordid = 0, $noteid = 0){
        $sql = "
			SELECT 
				r.recordid as id,
				r.noteid,
				r.userid,
				r.message,
				r.dateline,
				r.dateedit as upddate
			FROM ".$db->prefix."nt_record r
			WHERE userid=".bkint($userid)." AND deldate=0 
				".($forPrint > 0 ? " AND noteid=".bkint($noteid)." " : "")."
				".($recordid > 0 ? " AND recordid=".bkint($recordid)." " : "")."
			ORDER BY ".($forPrint ? "dateline DESC" : "dateline")."
		";
        return $db->query_read($sql);
    }

    public static function RecordAppend(Ab_Database $db, $userid, $noteid, $message){
        $sql = "
			INSERT INTO ".$db->prefix."nt_record
				(userid, noteid, message, dateline, dateedit)
			VALUES (
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

    public static function RecordUpdate(Ab_Database $db, $userid, $recordid, $message){
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

    public static function RecordRemoveByNoteId(Ab_Database $db, $userid, $noteid){
        $sql = "
			UPDATE ".$db->prefix."nt_record
			SET deldate=".TIMENOW."
			WHERE userid=".bkint($userid)." AND noteid=".bkint($noteid)."
		";
        $db->query_write($sql);
    }

}
