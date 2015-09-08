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
                lst = "";

            noteList.each(function(note){
                lst += tp.replace('row', note.toJSON());
            }, this);

            tp.setHTML('list', tp.replace('list', {'rows': lst}));
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
            selectedNoteId: {
                validator: Y.Lang.isBoolean,
                value: 0
            }
        },
        CLICKS: {
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