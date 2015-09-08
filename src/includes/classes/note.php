<?php
/**
 * @package Abricos
 * @subpackage Note
 * @copyright 2011-2015 Alexander Kuzmin
 * @license http://opensource.org/licenses/mit-license.php MIT License
 * @author Alexander Kuzmin <roosit@abricos.org>
 */

require_once 'models.php';

/**
 * Class Note
 *
 * @property NoteManager $manager
 */
class Note extends AbricosApplication {
    protected function GetClasses(){
        return array(
            'Note' => 'NoteItem',
            'NoteList' => 'NoteList',
            'Record' => 'NoteRecord',
            'RecordList' => 'NoteRecordList'
        );
    }

    protected function GetStructures(){
        return 'Note,Record';
    }

    public function ResponseToJSON($d){
        switch ($d->do){
            case 'recordList';
                return $this->RecordListToJSON();
            case 'noteList';
                return $this->NoteListToJSON();
            case 'noteSave';
                return $this->NoteSaveToJSON($d->note);
        }
    }

    protected $_cache = array();

    public function ClearCache(){
        $this->_cache = array();
    }

    public function NoteSaveToJSON($d){
        $res = $this->NoteSave($d);
        if (is_integer($res)){
            $ret = new stdClass();
            $ret->err = $res;
            return $ret;
        }
        $ret = $this->NoteListToJSON();
        $ret->noteSave = $res;
        return $ret;
    }

    public function NoteSave($d){
        if (!$this->manager->IsWriteRole()){
            return 403;
        }
        $parser = Abricos::TextParser(true);
        $d->id = intval($d->id);
        $d->title = $parser->Parser($d->title);

        if ($d->id === 0){
            $d->id = NoteQuery::NoteAppend($this->db, Abricos::$user->id, $d);
        } else {
            NoteQuery::NoteUpdate($this->db, Abricos::$user->id, $d);
        }
        $this->ClearCache();

        $ret = new stdClass();
        $ret->noteid = $d->id;
        return $ret;
    }

    public function NoteListToJSON(){
        $res = $this->NoteList();
        return $this->ResultToJSON('noteList', $res);
    }

    public function NoteList(){
        if (isset($this->_cache['NoteList'])){
            return $this->_cache['NoteList'];
        }
        if (!$this->manager->IsWriteRole()){
            return 403;
        }
        $rows = NoteQuery::NoteList($this->db, Abricos::$user->id);

        /** @var NoteList $list */
        $list = $this->models->InstanceClass('NoteList');
        while (($d = $this->db->fetch_array($rows))){
            $list->Add($this->models->InstanceClass('Note', $d));
        }

        return $this->_cache['NoteList'] = $list;
    }

    public function RecordListToJSON(){
        $res = $this->RecordList();
        return $this->ResultToJSON('recordList', $res);
    }

    public function RecordList(){
        if (isset($this->_cache['RecordList'])){
            return $this->_cache['RecordList'];
        }
        if (!$this->manager->IsWriteRole()){
            return 403;
        }
        $rows = NoteQuery::RecordList($this->db, Abricos::$user->id);

        /** @var NoteRecordList $list */
        $list = $this->models->InstanceClass('RecordList');
        while (($d = $this->db->fetch_array($rows))){
            $list->Add($this->models->InstanceClass('Record', $d));
        }

        return $this->_cache['RecordList'] = $list;
    }

}

?>