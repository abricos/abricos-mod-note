<?php
/**
 * @package Abricos
 * @subpackage Note
 * @copyright 2011-2015 Alexander Kuzmin
 * @license http://opensource.org/licenses/mit-license.php MIT License
 * @author Alexander Kuzmin <roosit@abricos.org>
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

    private $_note = null;

    /**
     * @return Note
     */
    public function GetNote(){
        if (!is_null($this->_note)){
            return $this->_note;
        }
        require_once 'classes/note.php';
        $this->_note = new Note($this);
        return $this->_note;
    }

    public function AJAX($d){
        return $this->GetNote()->AJAX($d);
    }

    public function ExportToPrinter($page, $params){
        if ($page != "list" && $page != "rec"){
            return "";
        }

        $noteid = $page == "list" ? bkint($params[0]) : 0;
        $recordid = $page == "rec" ? bkint($params[0]) : 0;

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

    public function Bos_MenuData(){
        if (!$this->IsWriteRole()){
            return null;
        }
        $i18n = $this->module->I18n();
        return array(
            array(
                "name" => "note",
                "title" => $i18n->Translate('title'),
                "icon" => "/modules/note/images/note-24.png",
                "url" => "note/wspace/ws"
            )
        );
    }
}

?>