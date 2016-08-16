<?php
/**
 * @package Abricos
 * @subpackage Note
 * @copyright 2011-2015 Alexander Kuzmin
 * @license http://opensource.org/licenses/mit-license.php MIT License
 * @author Alexander Kuzmin <roosit@abricos.org>
 */

/**
 * Class NoteModule
 */
class NoteModule extends Ab_Module {

    private $_manager;

    function __construct(){
        $this->version = "0.1.4";
        $this->name = "note";

        $this->permission = new NotePermission($this);
    }

    /**
     * Получить менеджер
     *
     * @return NoteManager
     */
    public function GetManager(){
        if (is_null($this->_manager)){
            require_once 'includes/manager.php';
            $this->_manager = new NoteManager($this);
        }
        return $this->_manager;
    }

    /**
     * This module added menu item in BOS Panel
     *
     * @return bool
     */
    public function Bos_IsMenu(){
        return true;
    }
}

class NoteAction {
    const VIEW = 10;
    const WRITE = 30;
    const ADMIN = 50;
}

class NotePermission extends Ab_UserPermission {

    public function __construct(NoteModule $module){
        $defRoles = array(

            new Ab_UserRole(NoteAction::VIEW, Ab_UserGroup::REGISTERED),
            new Ab_UserRole(NoteAction::VIEW, Ab_UserGroup::ADMIN),

            new Ab_UserRole(NoteAction::WRITE, Ab_UserGroup::REGISTERED),
            new Ab_UserRole(NoteAction::WRITE, Ab_UserGroup::ADMIN),

            new Ab_UserRole(NoteAction::ADMIN, Ab_UserGroup::ADMIN)
        );
        parent::__construct($module, $defRoles);
    }

    public function GetRoles(){
        return array(
            NoteAction::VIEW => $this->CheckAction(NoteAction::VIEW),
            NoteAction::WRITE => $this->CheckAction(NoteAction::WRITE),
            NoteAction::ADMIN => $this->CheckAction(NoteAction::ADMIN)
        );
    }
}

Abricos::ModuleRegister(new NoteModule());
