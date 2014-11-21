<?php
/**
 * @version $Id$
 * @package Abricos
 * @subpackage Note
 * @copyright Copyright (C) 2008 Abricos. All rights reserved.
 * @license http://www.gnu.org/copyleft/gpl.html GNU/GPL, see LICENSE.php
 * @author Alexander Kuzmin (roosit@abricos.org)
 */

require_once 'dbquery.php';

class NoteManager extends Ab_ModuleManager {
	
	/**
	 * 
	 * @var NoteModule
	 */
	public $module = null;
	
	public function __construct(NoteModule $module){
		parent::__construct($module);
	}
	
	public function IsAdminRole(){
		return $this->IsRoleEnable(NoteAction::ADMIN);
	}
	
	public function IsWriteRole(){
		return $this->IsRoleEnable(NoteAction::WRITE);
	}
	
	public function DSProcess($name, $rows){
		switch ($name){
			case 'notes':
				foreach ($rows->r as $r){
					if ($r->f == 'a'){ $this->NoteAppend($r->d); }
					if ($r->f == 'u'){ $this->NoteUpdate($r->d); }
					if ($r->f == 'd'){ $this->NoteRemove($r->d->id); }
				}
				return;
		}
	}
	
	public function DSGetData($name, $rows){
		switch ($name){
			case 'notes': return $this->NoteList();
			case 'records': return $this->RecordList();
		}
	}
	
	public function AJAX($d){
		switch($d->do){
			case "recordsave": return $this->RecordSave($d->record);
			case "recordremove": return $this->RecordRemove($d->recordid);
		}
		return null;
	}
	
	public function NoteList(){
		if (!$this->IsWriteRole()){ return; }
		return NoteQuery::NoteList($this->db, $this->userid);
	}
	
	public function NoteAppend($d){
		if (!$this->IsWriteRole()){ return; }
		return NoteQuery::NoteAppend($this->db, $this->userid, $d);
	}
	
	public function NoteUpdate($d){
		if (!$this->IsWriteRole()){ return; }
		NoteQuery::NoteUpdate($this->db, $this->userid, $d);
	}
	
	public function NoteRemove($noteid){
		if (!$this->IsWriteRole()){ return; }
		NoteQuery::NoteRemove($this->db, $this->userid, $noteid);
	}
	
	public function RecordList($forPrint = false, $recordid = 0, $noteid = 0){
		if (!$this->IsWriteRole()){ return; }
		return NoteQuery::RecordList($this->db, $this->userid, $forPrint, $recordid, $noteid);
	}
	
	public function Record($recordid){
		if (!$this->IsWriteRole()){ return; }
		return NoteQuery::Record($this->db, $this->userid, $recordid, true);
	}
	
	public function RecordSave($note){
		if (!$this->IsWriteRole()){ return; }
		$note->id = intval($note->id);
		if ($note->id > 0){
			$this->RecordUpdate($note);
		}else{
			$note->id = $this->RecordAppend($note);
		}
		return $this->Record($note->id);
	}
	
	private function RecordTextClear($note){
		$utmanager = Abricos::TextParser();
		$note->msg = $utmanager->Parser($note->msg);
	}
	
	public function RecordAppend($note){
		if (!$this->IsWriteRole()){ return; }
		$this->RecordTextClear($note);
		$recordid = intval($note->nid);
		if ($recordid > 0){
			$row = NoteQuery::Note($this->db, $this->userid, $recordid, true);
			if (empty($row)){
				// блокнот не пренадлежит этому пользователю 
				return; 
			}
		}
		return NoteQuery::RecordAppend($this->db, $this->userid, $recordid, $note->msg);
	}
	
	public function RecordUpdate($note){
		if (!$this->IsWriteRole()){ return; }
		$this->RecordTextClear($note);
		NoteQuery::RecordUpdate($this->db, $this->userid, $note->id, $note->msg);
	}
	
	public function RecordRemove($recordid){
		if (!$this->IsWriteRole()){ return; }
		NoteQuery::RecordRemove($this->db, $this->userid, $recordid);
	}

	public function ExportToPrinter($page, $params){
		if ($page != "list" && $page != "rec"){ return ""; }

		$noteid = $page == "list" ? bkint($params[0]) : 0;
		$recordid = $page=="rec" ? bkint($params[0]) : 0;
		
		$brick = Brick::$builder->LoadBrickS('note', 'printlist', null, null);
		
		$maxDE = 0;
		$list = "";
		$rows = $this->RecordList(true, $recordid, $noteid);
		while (($row = $this->db->fetch_array($rows))){
			$maxDE = max($maxDE, intval($row['de']));
			$list .= Brick::ReplaceVarByData($brick->param->var['note'], array(
				"msg" => $row['msg']
			));
		}
		$sde = "";
		if ($maxDE > 0){
			$sde = date("d.m.Y H:i", $maxDE);
		}
		
		return Brick::ReplaceVarByData($brick->param->var['page'], array(
			"date" => $sde,
			"list" => $list
		)); 
	}

    public function Bos_MenuData() {
        $i18n = $this->module->GetI18n();
        return array(
            array(
                "name" => "note",
                "title" => $i18n['title'],
                "role" => NoteAction::WRITE,
                "icon" => "/modules/note/images/note-24.png",
                "url" => "note/manager/showNotepadPanel"
            )
        );
    }
}

?>