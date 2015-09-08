var Component = new Brick.Component();
Component.requires = {
    mod: [
        {name: '{C#MODNAME}', files: ['lib.js']}
    ]
};
Component.entryPoint = function(NS){

    var Y = Brick.YUI,
        COMPONENT = this,
        SYS = Brick.mod.sys;

    NS.NoteListWidget = Y.Base.create('noteListWidget', SYS.AppWidget, [], {
        onInitAppWidget: function(err, appInstance){
            this.set('waiting', true);
            appInstance.noteList(this.renderNoteList, this);
            this.set('selected', 0);
        },
        destructor: function(){
            this.closeEditor();
        },
        renderNoteList: function(){
            this.set('waiting', false);
            var noteList = this.get('appInstance').get('noteList');
            if (!noteList){
                return;
            }
            var tp = this.template,
                lst = tp.replace('row', {
                    id: 0,
                    title: this.language.get('baseTitle')
                });

            noteList.each(function(note){
                lst += tp.replace('row', note.toJSON());
            }, this);

            tp.setHTML('list', tp.replace('list', {'rows': lst}));
        },
        _getRowNode: function(elName, id){
            var tp = this.template,
                rowId = tp.gelid('row.' + elName),
                rowNode = Y.Node.one('#' + rowId + '-' + id);
            return rowNode;
        },
        _selectRow: function(id, isSelect){
            var rowNode = this._getRowNode('row', id);
            if (!rowNode){
                return;
            }
            if (isSelect){
                rowNode.addClass('active');
            } else {
                rowNode.removeClass('active');
            }
        },
        _selectedSetter: function(val){
            var appInstance = this.get('appInstance');
            if (!appInstance){
                return val;
            }

            this._selectRow(0, val === 0);

            appInstance.get('noteList').each(function(note){
                this._selectRow(note.get('id'), note.get('id') === val);
            }, this);

            return val;
        },
        showEditor: function(noteid){
            noteid = noteid | 0;

            this.closeEditor();

            var tp = this.template,
                editor,
                editorOptions = {
                    noteid: noteid,
                    CLICKS: {
                        save: {event: this.save, context: this},
                        cancel: {event: this.closeEditor, context: this}
                    }
                };

            if (noteid === 0){
                editorOptions.srcNode = tp.append('list.editor', '<div></div>');
                tp.toggleView(false, 'list.buttons', 'list.editor');
            }
            this._editor = new NS.NoteListWidget.Editor(editorOptions);

        },
        closeEditor: function(){
            var editor = this._editor;
            if (!editor){
                return;
            }
            var noteid = editor.get('noteid'),
                tp = this.template;

            if (noteid === 0){
                tp.toggleView(true, 'list.buttons', 'list.editor');
            }
            editor.destroy();
            this._editor = null;
        },
        save: function(){
            var editor = this._editor;
            if (!editor || this.get('waiting')){
                return;
            }
            this.set('waiting', true)
            editor.set('waiting', true);
            this.get('appInstance').noteSave(editor.toJSON(), function(err, result){
                this.set('waiting', false)
                this.closeEditor();
            }, this);
        }
    }, {
        ATTRS: {
            component: {value: COMPONENT},
            templateBlockName: {value: 'widget,list,row,editor'},
            selected: {
                validator: Y.Lang.isNumber,
                setter: '_selectedSetter'
            }
        },
        CLICKS: {
            select: {
                event: function(e){
                    var noteid = e.defineTarget.getData('id') | 0;
                    this.set('selected', noteid);
                }
            },
            showEditor: {
                event: function(e){
                    var noteid = e.defineTarget.getData('id') | 0;
                    this.showEditor(noteid);
                }
            }
        }
    });

    NS.NoteListWidget.Editor = Y.Base.create('noteEditorWidget', SYS.AppWidget, [], {
        onInitAppWidget: function(err, appInstance){
        },
        destructor: function(){
        },
        toJSON: function(){
            return {
                id: this.get('noteid'),
                title: this.template.getValue('title')
            };
        }
    }, {
        ATTRS: {
            component: {value: COMPONENT},
            templateBlockName: {value: 'editor'},
            noteid: {value: 0}
        }
    });
};