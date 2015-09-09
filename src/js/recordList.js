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

    NS.RecordListWidget = Y.Base.create('recordListWidget', SYS.AppWidget, [], {
        onInitAppWidget: function(err, appInstance){
            this._widgets = [];
            this.set('waiting', true);
            appInstance.recordList(this.renderRecordList, this);
        },
        destructor: function(){
            this.closeEditor();
        },
        renderRecordList: function(){
            this.set('waiting', false);
            var recordList = this.get('appInstance').get('recordList');
            if (!recordList){
                return;
            }
            recordList.each(this._renderRecord, this);
        },
        _renderRecord: function(record){
            var appInstance = this.get('appInstance'),
                tp = this.template,
                ws = this._widgets;

            if (!record){
                record = new NS.Record({
                    appInstance: appInstance
                });
            }

            var w = new NS.RecordListWidget.RowWidget({
                srcNode: tp.one('list').insert('<div></div>', 0),
                record: record
            });
            ws[ws.length] = w;
        },
        createRecord: function(){
            this._renderRecord();
        }
    }, {
        ATTRS: {
            component: {value: COMPONENT},
            templateBlockName: {value: 'widget'},
        },
        CLICKS: {
            createRecord: 'createRecord'
        }
    });

    NS.RecordListWidget.RowWidget = Y.Base.create('recordRowWidget', SYS.AppWidget, [], {
        onInitAppWidget: function(err, appInstance){
            if (this.get('record').get('id') === 0){
                this.showEditor();
            } else {
                this.renderRecord();
            }
        },
        destructor: function(){
        },
        renderRecord: function(){
            var tp = this.template,
                record = this.get('record'),
                dConvert = Brick.dateExt.convert;

            tp.setHTML({
                'message': record.get('message'),
                'upddate': dConvert(record.get('upddate'), 0, false),
                'dateline': dConvert(record.get('upddate'), 0, false)
            });
        },
        showEditor: function(){
            this.set('waiting');
            Brick.use('sys', 'editor', this._showEditor, this);
        },
        _showEditor: function(){
            this.set('waiting', false);

            var tp = this.template,
                record = this.get('record'),
                messageNode = tp.one('messageEditor');

            tp.toggleView(true, 'actionButtons,editorPanel', 'editorButtons,viewerPanel');

            tp.setHTML('messageEditor', record.get('message'));

            // hack tinymce width
            messageNode.set('offsetWidth', messageNode.get('offsetWidth'));

            var Editor = Brick.widget.Editor;
            this._visualEditor = new Editor(tp.gelid('messageEditor'), {
                'mode': Editor.MODE_VISUAL,
                'toolbar': Editor.TOOLBAR_MINIMAL,
                'toolbarExpert': false
            });
        },
        closeEditor: function(){
            if (!this._visualEditor){
                return;
            }
            this._visualEditor.destroy();
            var tp = this.template;
            tp.toggleView(false, 'actionButtons,editorPanel', 'editorButtons,viewerPanel');
        },
        save: function(){
            var editor = this._visualEditor;
            if (!editor || this.get('waiting')){
                return;
            }
            var appInstance = this.get('appInstance'),
                d = this.get('record').toJSON();
            d['message'] = editor.getContent();

            this.set('waiting', true)
            appInstance.recordSave(d, function(err, result){
                this.set('waiting', false)
                this.closeEditor();
                if (!err){
                    var record = appInstance.get('recordList').getById(result.recordSave.recordid);
                    this.set('record', record);
                    this.renderRecord();
                }
            }, this);
        }
    }, {
        ATTRS: {
            component: {value: COMPONENT},
            templateBlockName: {value: 'row'},
            record: {}
        },
        CLICKS: {
            showEditor: 'showEditor',
            showRemove: 'showRemove',
            save: 'save',
            cancel: 'closeEditor'
        }
    });


    NS.RecordListWidget.RemoveWidget = Y.Base.create('removeWidget', SYS.AppWidget, [], {}, {
        ATTRS: {
            component: {value: COMPONENT},
            templateBlockName: {value: 'remove'},
            recordid: {value: 0}
        }
    });

};