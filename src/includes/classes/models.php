<?php
/**
 * @package Abricos
 * @subpackage Note
 * @copyright 2011-2015 Alexander Kuzmin
 * @license http://opensource.org/licenses/mit-license.php MIT License
 * @author Alexander Kuzmin <roosit@abricos.org>
 */

/**
 * Class NoteItem
 */
class NoteItem extends AbricosModel {
    protected $_structModule = 'note';
    protected $_structName = 'Note';
}

/**
 * Class NoteList
 */
class NoteList extends AbricosModelList {
}

/**
 * Class NoteRecord
 */
class NoteRecord extends AbricosModel {
    protected $_structModule = 'note';
    protected $_structName = 'Record';
}

/**
 * Class NoteRecordList
 */
class NoteRecordList extends AbricosModelList {
}


?>