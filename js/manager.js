/*
@version $Id$
@package Abricos
@copyright Copyright (C) 2008 Abricos All rights reserved.
@license http://www.gnu.org/copyleft/gpl.html GNU/GPL, see LICENSE.php
*/

var Component = new Brick.Component();
Component.requires = {
	yahoo: ['dom'],
	mod:[
		{name: 'sys', files: ['data.js', 'container.js']},
        {name: 'export', files: ['lib.js']},
        {name: 'note', files: ['roles.js']}
        
	]
};
Component.entryPoint = function(){
	
	var Dom = YAHOO.util.Dom,
		E = YAHOO.util.Event,
		L = YAHOO.lang;
	
	var NS = this.namespace, 
		TMG = this.template,
		API = NS.API;

	if (!NS.data){
		NS.data = new Brick.util.data.byid.DataSet('note');
	}
	
	Brick.util.CSS.update(Brick.util.CSS['note']['manager']);
	
	var buildTemplate = function(w, templates){
		var TM = TMG.build(templates), T = TM.data, TId = TM.idManager;
		w._TM = TM; w._T = T; w._TId = TId;
	};
	
	function printLinkHTML(page, prms){
		if (!Brick.objectExists('Brick.mod.export.PrintLink')){
			return "";
		}
		var pl = new Brick.mod['export'].PrintLink({
			'module': 'note',
			'page': page,
			'params': prms || []
		});
		return pl.getHTML();
	}
	
	function strip(html) {
	   var tmp = document.createElement("DIV");
	   tmp.innerHTML = html;
	   var txt = tmp.textContent||tmp.innerText;
	   if (!L.isString(txt)){ return html; }
	   txt = txt.replace(/\s+|&nbsp;|&#160;/g,' ');
	   return txt;
	}
	
	function isEmpty(html){
		var txt = strip(html);
		txt = txt.replace(/\s+|&nbsp;|&#160;/g,'');
		return txt.length == 0;
	}
	
	var RecordEditorWidget = function(container, record){
		this.init(container, record);
	};
	RecordEditorWidget.prototype = {
		init: function(container, record){
		
			this.container = container;
			this.record = record;
			
			buildTemplate(this, 'editor');
			
			var TM = this._TM, TId = this._TId, __self = this;
			container.innerHTML = this._TM.replace('editor');
			TM.getEl('editor.id').value = record['msg'];

			var Editor = Brick.widget.Editor;
			__self.editor = new Editor(TId['editor']['id'], {
				'mode': Editor.MODE_VISUAL,
				'toolbar': Editor.TOOLBAR_MINIMAL
			});
			__self.editor._buttons['tb_full'].hide();
			__self.editor._buttons['tb_standart'].hide();
			__self.editor._buttons['tb_minimal'].hide();
		},
		destroy: function(){
			this.editor.destroy();
			this.container.innerHTML = '';
		},
		onClick: function(el){
			var TId = this._TId, tp = TId['editor'];
			switch(el.id){
			case tp['bsave']: this.save(); return true;
			case tp['bcancel']: this.close(); return true;
			}
			if (el.id == TId['editor']['bappend']){
				this.appendNote();
				return true;
			}
			return false;
		},
		save: function(){},
		close: function(){
			this.destroy();
		},
		getContent: function(){
			return this.editor.getContent();
		}
	};
	
	var RecordWidget = function(container, record, owner){
		record = L.merge({
			'id': 0,
			'nid': 0,
			'msg': '',
			'dl': 0,
			'de': 0
		}, record || {});

		owner = owner || null;
		this.init(container, record, owner);
	};
	RecordWidget.prototype = {
		init: function(container, record, owner){
			this.record = record;
			this.owner = owner;
			this.lastMessage = record['msg'];
			
			buildTemplate(this, 'record');
			
			this.isExpand = false;
			this._activeEditor = null;
			this._removeMode = false;
			
			
			var div = document.createElement("DIV");
			div.innerHTML = this.getHTML();
			var el = div.childNodes[0];
			el.parentNode.removeChild(el);
			
			if (container.childNodes.length > 0){
				container.insertBefore(el, container.childNodes[0]);
			}else{
				container.appendChild(el);
			}
		},
		getNoteId: function(){
			return this.record['nid'];
		},
		getHTML: function(){
			var TM  = this._TM, nt = this.record;
			return TM.replace('record', {
				'id': nt.id,
				'print': printLinkHTML('rec', [nt.id]),
				'msg': strip(nt.msg),
				'tmdl': Brick.dateExt.convert(nt.dl),
				'tmde': Brick.dateExt.convert(nt.de)
			});
		},
		update: function(nt){
			this.record = nt;
			this._TM.getEl('record.print').innerHTML = printLinkHTML('rec', [nt.id]),
			this.updateMessage(nt.msg);
		},
		updateMessage: function(msg){
			var el = this._TM.getEl('record.message');
			el.innerHTML = !this.isExpand ? strip(msg) : msg;
		},
		onClick: function(el){
			if (!L.isNull(this._activeEditor) && this._activeEditor.onClick(el)){ return true; }
			
			var tp = this._TId['record'];
			switch (el.id){
			case tp['imgexp']: this.expcol(); return true;
			case tp['bedit']: this.showEditor(); return true;
			case tp['bedithide']: this.hideEditor(); return true;
			case tp['bremove']: this.showRemove(); return true;
			case tp['bremovecancel']: this.hideRemove(); return true;
			case tp['bremoveyes']: this.remove(); return true;
			}
			return false;
		},
		expcol: function(){
			var TM = this._TM,
				el = TM.getEl('record.message'),
				elImg = TM.getEl('record.imgexp'),
				nt = this.record;
			
			if (this.isExpand){
				Dom.replaceClass(el, 'exp', 'csp');
				elImg.src = "/modules/note/images/exp-plus.gif";
				el.innerHTML = strip(nt.msg);
			}else{
				Dom.replaceClass(el, 'csp', 'exp');
				elImg.src = "/modules/note/images/exp-minus.gif";
				el.innerHTML = nt.msg;
			}
			this.isExpand = !this.isExpand;
		},
		showEditor: function(){
			if (!L.isNull(this.owner) && L.isFunction(this.owner.onShowEditor)){
				this.owner.onShowEditor(this);
			}

			if (!L.isNull(this._activeEditor)){ return; }
			
			var TM = this._TM,
				__self = this;
			
			this.elDisplay('viewer', false);
			this.elDisplay('editor', true);
			
			this.elDisplay('bedit', false);
			this.elDisplay('bedithide', true);
			
			this._activeEditor = new RecordEditorWidget(TM.getEl('record.editor'), this.record);			
		},
		hideEditor: function(){
			if (L.isNull(this._activeEditor)){ return; }
			
			this.elDisplay('viewer', true);
			this.elDisplay('editor', false);

			this.elDisplay('bedit', true);
			this.elDisplay('bedithide', false);
			
			var msg = this._activeEditor.getContent();
			
			this.updateMessage(msg);
			this.save();
			
			this._activeEditor.close();
			this._activeEditor = null;
			if (!this.isExpand){
				this.expcol();
			}
		},
		save: function(){
			if (L.isNull(this._activeEditor)){ return; }

			var TM = this._TM, 
				message = this._activeEditor.getContent(),
				__self = this;
			
			if (this.lastMessage == message){ return; }
			
			var record = this.record,
				owner = this.owner;
			record['msg'] = message;
			
			owner.elDisplay('waitsave', true);
			Brick.ajax('note', {
				'data': { 
					'do': 'recordsave', 
					'record': record
				},
				'event': function(request){
					owner.elDisplay('waitsave', false);
					var nrec = request.data;
					var elError = TM.getEl('record.saveerror');
					if (L.isNull(elError)){ return; }
					elError.style.display = L.isNull(nrec) ? '' : 'none'; 
					if (L.isNull(nrec)){ return; }
					__self.lastMessage = message;
					__self.update(nrec);
				}
			});			
		},		
		destroy: function(){
			if (!L.isNull(this._activeEditor)){
				this.hideEditor();
			}
			var el = this._TM.getEl('record.id');
			el.parentNode.removeChild(el);
		},
		elDisplay: function(name, flag){
			this._TM.getEl('record.'+name).style.display = flag ? '' : 'none';
		},
		showRemove: function(){
			this.elDisplay('menubtns', false);
			this.elDisplay('dlgremovebtns', true);
		},
		hideRemove: function(){
			this.elDisplay('menubtns', true);
			this.elDisplay('dlgremovebtns', false);
		},
		remove: function(){
			this.elDisplay('dlgremovebtns', false);
			this.elDisplay('removewait', true);
			
			var owner = this.owner;
			owner.elDisplay('waitremove', true);
			Brick.ajax('note', {
				'data': { 'do': 'recordremove', 'recordid': this.record.id },
				'event': function(request){
					owner.elDisplay('waitremove', false);
					NS.data.get('records').clear();
					NS.data.request();
				}
			});
		},
		show: function(){
			this.elDisplay('id', true);
		},
		hide: function(){
			this.elDisplay('id', false);
		}
	};

	var _isLoadVisualEditor = false;
	
	var RecordListWidget = function(owner, container){
		this.init(owner, container);
	};
	RecordListWidget.prototype = {
		init: function(owner, container){
			this.owner = owner;
			buildTemplate(this, 'records');
			container.innerHTML = this._TM.replace('records', {
				'print': printLinkHTML('list')
			});
			
			this.records = {};
			
			this._genId = 1;
			
			this.tables = new Brick.mod.sys.TablesManager(NS.data, ['records'], {'owner': this});
			this._startThread();
		},
		elDisplay: function(name, flag){
			this._TM.getEl('records.'+name).style.display = flag ? '' : 'none';
		},
		destroy: function(){
			this._stopThread();
			this.save();
			NS.data.get('records').clear();
			this.tables.destroy();
		},
		onResize: function(rel){
			// var el = this._TM.getEl('records.table');
			// el.style.height = (rel.height - 30)+'px';
		},
		onDataLoadWait: function(tables){ },
		onDataLoadComplete: function(tables){
			if (_isLoadVisualEditor){
				this.renderList(tables);
				return;
			}
			var __self = this;
			
			Brick.Component.API.fireFunction('sys', 'editor', function(){
				Brick.widget.EditorManager.preloadVisualEditor(null, function(){
					_isLoadVisualEditor = true;
					__self.renderList(tables);
		    	});
			});
		},
		renderList: function(tables){
			var TM = this._TM, T = this._T, 
				elList = TM.getEl('records.list'),
				__self = this;
			
			if (!this._firstLoad){
				elList.innerHTML = "";
			}
			this._firstLoad = true;
			
			var checker = {};
			
			tables.get('records').getRows().foreach(function(row){
				var record = row.cell;
				__self.renderNote(record);
				checker[record.id] = true;
			});
			
			for (var id in this.records){
				if (!checker[id]){ // был удален
					this.records[id].destroy();
					delete this.records[id];
				}
			}
			this.onChangeNoteId();
		},
		onChangeNoteId: function(){
			var noteId = this.getNoteId()*1;
			for (var id in this.records){
				if (noteId != this.records[id].getNoteId()*1){
					this.records[id].hide();
				}else{
					this.records[id].show();
				}
			}
			this._TM.getEl('records.print').innerHTML = printLinkHTML('list', [this.getNoteId()]);
		},
		getNoteId: function(){
			return this.owner.notesWidget.selectedNoteId;
		},
		renderNote: function(record){
			record = L.merge({'id': 0, 'nid': this.getNoteId(), 'msg': ''}, record || {});
			
			var TM = this._TM, T = this._T, 
				elList = TM.getEl('records.list'),
				isNew = false;

			var nw;
			if (record.id*1 == 0){
				nw = new RecordWidget(elList, record, this);
				
				// в этом алгоритме глюк, его решение гораздо накладнее, чем вероятность возникновения этого глюка
				var genId = (this._genId++)*(-1);
				this.records[genId] = nw;
				isNew = true;
			} else if (!this.records[record.id]){
				nw = new RecordWidget(elList, record, this);
				this.records[record.id] = nw;
				isNew = true;
			}else{
				nw = this.records[record.id];
			}
			if (isNew){
				// elList.innerHTML = nw.getHTML()+ elList.innerHTML;
			}else{
				nw.update(record);
			}
			return nw;
		},
		onClick: function(el){
			var TId = this._TId;
			if (el.id == TId['records']['bappend']){
				this.appendNote();
				return true;
			}
			
			for (var id in this.records){
				if (this.records[id].onClick(el)){ return true; }
			}
			
			return false;
		},
		appendNote: function(){
			var nw = this.renderNote();
			nw.show();
			nw.showEditor();
		},
		save: function(){
			for (var id in this.records){
				this.records[id].save();
			}
		},
		onShowEditor: function(nw){
			for (var id in this.records){
				if (this.records[id] != nw){
					this.records[id].hideEditor();
				}
			}
		},
		
		_thread: null,
		_startThread: function(){
    		if (!L.isNull(this._thread)){ return;}
			var __self = this;
			this._thread = setInterval(function(){
				__self._run();
			}, 10*1000);
    	},
    	_stopThread: function(){
            clearInterval(this._thread);
    	},
    	_run: function(){
    		this.save();
    	}
	};
	NS.RecordListWidget = RecordListWidget;
	
	var NoteListWidget = function(owner, container){
		this.init(owner, container);
	};
	NoteListWidget.prototype = {
		init: function(owner, container){
			this.selectedNoteId = 0;
			this.owner = owner;
			
			buildTemplate(this, 'notes,notewait,notetable,noteitemdef,noterow,notetl,notetlsel');
			container.innerHTML = this._TM.replace('notes', {});
			this.tables = new Brick.mod.sys.TablesManager(NS.data, ['notes'], {'owner': this});
		},
		destroy: function(){
			this.tables.destroy();
		},
		onDataLoadWait: function(tables){ 
			var TM = this._TM;
			TM.getEl('notes.list').innerHTML = TM.replace('notewait'); 
		},
		onDataLoadComplete: function(tables){
			this.tables = tables;
			this.render();
		},
		render: function(){
			var TM = this._TM, lst = "",
				sNoteId = this.selectedNoteId;
			
			var brow = function(id, title, edit, remove){
				return TM.replace('noterow', {
					'tl': TM.replace('notetl'+(sNoteId*1 == id*1 ? 'sel' : ''), {'tl': title}),
					'ded': (edit ? '' : 'none'),
					'drem': (remove ? '' : 'none'),
					'id': id
				});
			};
			
			lst += brow(0, TM.replace('noteitemdef'), false, false);
			NS.data.get('notes').getRows().foreach(function(row){
				var di = row.cell;
				lst += brow(di['id'], di['tl'], true, true);
			});
			
			TM.getEl('notes.list').innerHTML = TM.replace('notetable', {'rows': lst});
		},
		onResize: function(rel){ },
		onClick: function(el){
			
			var TId = this._TId;
			if (el.id == TId['notes']['bappend']){
				this.editNote(0);
			}
			
			var prefix = el.id.replace(/([0-9]+$)/, '');
			var numid = el.id.replace(prefix, "");
			
			switch(prefix){
			case (TId['noterow']['bedit']+'-'): this.editNote(numid); return true;
			case (TId['noterow']['bremove']+'-'): this.removeNote(numid); return true;
			case (TId['notetl']['bsel']+'-'): this.selectNote(numid); return true;
			}
			
			return false;
		},
		selectNote: function(noteid){
			this.selectedNoteId = noteid;
			this.render();
			this.owner.recordsWidget.onChangeNoteId();
		},
		editNote: function(noteid){
			var table = NS.data.get('notes');
			var rows = table.getRows();
			var row = noteid == 0 ? table.newRow() : rows.getById(noteid);
			new NoteEditPanel(row, function(){
				if (row.isNew()){rows.add(row); }
				table.applyChanges();
				NS.data.request();
			});
		},
		removeNote: function(noteid){
			var table = NS.data.get('notes'),
				rows = table.getRows(),
				row = rows.getById(noteid),
				__self = this;
			new NoteRemovePanel(row, function(){
				row.remove();
				table.applyChanges();
				NS.data.request();
				__self.selectNote(0);
			});
		}
	};
	
	
	var NoteEditPanel = function(row, callback){
		this.row = row;
		this.callback = callback;
		
		NoteEditPanel.superclass.constructor.call(this, {
			fixedcenter: true,
			modal: true,
			overflow: false
		});
	};
	YAHOO.extend(NoteEditPanel, Brick.widget.Panel, {
		initTemplate: function(){
			buildTemplate(this, 'noteeditpanel');
			return this._TM.replace('noteeditpanel');
		},
		onLoad: function(){
			var TM = this._TM, row = this.row;
			TM.getEl('noteeditpanel.tl').value = row.cell['tl'];
			if (row.isNew()){
				TM.getEl('noteeditpanel.bsave').style.display = 'none';
			}else{
				TM.getEl('noteeditpanel.bappend').style.display = 'none';
			}
		},
		onClick: function(el){
			var tp = this._TId['noteeditpanel'];
			switch(el.id){
			case tp['bsave']: 
			case tp['bappend']: 
				this.save(); return true;
			case tp['bcancel']: this.close(); return true;
			}
			return false;
		},
		save: function(){
			var title = this._TM.getEl('noteeditpanel.tl').value;
			if (title.length == 0){ return; }
			this.row.update({'tl': title});
			this.callback();
			this.close();
		}
	});
	NS.NoteEditPanel = NoteEditPanel;
	
	var NoteRemovePanel = function(row, callback){
		this.row = row;
		this.callback = callback;
		NoteRemovePanel.superclass.constructor.call(this, {
			fixedcenter: true, modal: true, overflow: false
		});
	};
	YAHOO.extend(NoteRemovePanel, Brick.widget.Panel, {
		initTemplate: function(){
			buildTemplate(this, 'noteremovepanel');
			return this._TM.replace('noteremovepanel', {
				'tl': this.row.cell['tl']
			});
		},
		onClick: function(el){
			var tp = this._TId['noteremovepanel'];
			switch(el.id){
			case tp['bremove']: this.remove(); return true;
			case tp['bcancel']: this.close(); return true;
			}
			return false;
		},
		remove: function(){
			this.callback();
			this.close();
		}
	});
	NS.NoteRemovePanel = NoteRemovePanel;
	
	
	var NotepadWidget = function(container){
		this.init(container);
	};
	NotepadWidget.prototype = {
		init: function(container){
			buildTemplate(this, 'widget');
			var TM = this._TM;
			container.innerHTML = TM.replace('widget', {});
			
			this.notesWidget = new NoteListWidget(this, TM.getEl('widget.notes'));
			this.recordsWidget = new RecordListWidget(this, TM.getEl('widget.records'));
		},
		onResize: function(rel){
			this.notesWidget.onResize(rel);
			this.recordsWidget.onResize(rel);
		},
		onClick: function(el){
			if (this.notesWidget.onClick(el)){ return true; }
			if (this.recordsWidget.onClick(el)){ return true; }
			return false;
		},
		destroy: function(){
			this.notesWidget.destroy();
			this.recordsWidget.destroy();
		}
	};

	var NotepadPanel = function(){
		NotepadPanel.superclass.constructor.call(this, {
			fixedcenter: true, width: '800px', height: '450px',
			// controlbox: 1,
			overflow: false
		});
	};
	YAHOO.extend(NotepadPanel, Brick.widget.Panel, {
		initTemplate: function(){
			buildTemplate(this, 'panel');
			return this._TM.replace('panel');
		},
		onLoad: function(){
			this.widget = new NotepadWidget(this._TM.getEl('panel.widget'));
			NS.data.request();
		},
		onClick: function(el){
			if (this.widget.onClick(el)){ return true; }
			return false;
		},
		destroy: function(){
			this.widget.destroy();
			NotepadPanel.superclass.destroy.call(this);
		},
		onShow: function(){
			this.onResize();
		},
		onResize: function(){
			this.widget.onResize(Dom.getRegion(this.body));
		}
	});
	NS.NotepadPanel = NotepadPanel;
	
	API.showNotepadPanel = function(){
		NS.roles.load(function(){
			new NotepadPanel();
		});
	};
	
};