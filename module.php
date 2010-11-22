<?php
/**
 * @version $Id$
 * @package Abricos
 * @subpackage Note
 * @copyright Copyright (C) 2008 Abricos. All rights reserved.
 * @license http://www.gnu.org/copyleft/gpl.html GNU/GPL, see LICENSE.php
 * @author Alexander Kuzmin (roosit@abricos.org)
 */

$mod = new NoteModule();
CMSRegistry::$instance->modules->Register($mod);

class NoteModule extends CMSModule {
	
	private $_manager;
	
	function __construct(){
		$this->version = "0.1.0.1";
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

class NotePermission extends AbricosPermission {
	
	public function NotePermission(NoteModule $module){
		$defRoles = array(

			new AbricosRole(NoteAction::WRITE, UserGroup::REGISTERED),
			new AbricosRole(NoteAction::WRITE, UserGroup::ADMIN),
			
			new AbricosRole(NoteAction::ADMIN, UserGroup::ADMIN)
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


?>