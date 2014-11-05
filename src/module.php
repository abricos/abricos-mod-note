<?php
/**
 * @version $Id$
 * @package Abricos
 * @subpackage Note
 * @license http://www.gnu.org/copyleft/gpl.html GNU/GPL, see LICENSE.php
 * @author Alexander Kuzmin <roosit@abricos.org>
 */


class NoteModule extends Ab_Module {
	
	private $_manager;
	
	function __construct(){
		$this->version = "0.1.3";
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
}

class NoteAction {
	const VIEW			= 10;
	const WRITE			= 30;
	const ADMIN			= 50;
}

class NotePermission extends Ab_UserPermission {
	
	public function NotePermission(NoteModule $module){
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
?>