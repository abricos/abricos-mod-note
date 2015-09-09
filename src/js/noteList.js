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

            this.get('boundingBox').on('keypress', function(e){
                if (e.keyCode === 13){
                    this.save();
                }
            }, this);
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
                    title: this.language.get('baseTitle'),
                    rowButtons: ''
                });

            noteList.each(function(note){
                lst += tp.replace('row', [
                    {rowButtons: tp.replace('rowButtons')},
                    note.toJSON()
                ]);
            }, this);

            tp.setHTML('list', tp.replace('list', {'rows': lst}));

            var selected = this.get('selected');
            this._selectedSetter(selected);
        },
        _selectedSetter: function(val){
            var appInstance = this.get('appInstance');
            if (!appInstance){
                return val;
            }
            var tp = this.template,
                noteid;

            tp.toggleClass('row.id-0', 'active', val === 0);

            appInstance.get('noteList').each(function(note){
                noteid = note.get('id');
                tp.toggleClass('row.id-' + noteid, 'active', noteid === val);
            }, this);

            return val;
        },
        showEditor: function(noteid){
            noteid = noteid | 0;

            this.closeEditor();

            var tp = this.template,
                editor,
                options = {
                    noteid: noteid,
                    CLICKS: {
                        save: {event: this.save, context: this},
                        cancel: {event: this.closeEditor, context: this}
                    }
                };

            if (noteid === 0){
                options.srcNode = tp.append('list.editor', '<div></div>');
                tp.toggleView(false, 'list.buttons', 'list.editor');
            } else {
                options.srcNode = tp.append('row.editor-' + noteid, '<div></div>');
                tp.toggleView(false, 'row.viewer-' + noteid, 'row.editor-' + noteid);
            }
            this._editor = new NS.NoteListWidget.EditorWidget(options);
        },
        showRemove: function(noteid){
            noteid = noteid | 0;

            this.closeEditor();

            var tp = this.template;

            tp.show('row.editor-' + noteid);

            this._editor = new NS.NoteListWidget.RemoveWidget({
                srcNode: tp.append('row.editor-' + noteid, '<div></div>'),
                noteid: noteid,
                CLICKS: {
                    remove: {event: this.remove, context: this},
                    cancel: {event: this.closeEditor, context: this}
                }
            });
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
            } else {
                tp.toggleView(true, 'row.viewer-' + noteid, 'row.editor-' + noteid);
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
                if (!err){
                    this.renderNoteList();
                    this.set('selected', result.noteSave.noteid);
                }
            }, this);
        },
        remove: function(){
            var editor = this._editor;
            if (!editor || this.get('waiting')){
                return;
            }
            this.set('waiting', true)
            editor.set('waiting', true);
            this.get('appInstance').noteRemove(editor.get('noteid'), function(err, result){
                this.set('waiting', false)
                this.closeEditor();
                if (!err){
                    this.renderNoteList();
                    this.set('selected', 0);
                }
            }, this);
        }
    }, {
        ATTRS: {
            component: {value: COMPONENT},
            templateBlockName: {value: 'widget,list,row,rowButtons,editor'},
            selected: {
                value: 0,
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
            },
            showRemove: {
                event: function(e){
                    var noteid = e.defineTarget.getData('id') | 0;
                    this.showRemove(noteid);
                }
            }
        }
    });

    NS.NoteListWidget.EditorWidget = Y.Base.create('noteEditorWidget', SYS.AppWidget, [], {
        onInitAppWidget: function(err, appInstance){
            var tp = this.template,
                noteid = this.get('noteid'),
                note = noteid > 0 ? appInstance.get('noteList').getById(noteid) : null,
                titleNode = tp.one('title');

            if (note){
                tp.setValue(note.toJSON());
            }

            titleNode.focus();
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

    NS.NoteListWidget.RemoveWidget = Y.Base.create('removeWidget', SYS.AppWidget, [], {}, {
        ATTRS: {
            component: {value: COMPONENT},
            templateBlockName: {value: 'remove'},
            noteid: {value: 0}
        }
    });

};