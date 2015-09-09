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

    NS.stripHTML = function(html){
        var tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        var txt = tmp.textContent || tmp.innerText;
        if (!Y.Lang.isString(txt)){
            return html;
        }
        txt = txt.replace(/\s+|&nbsp;|&#160;/g, ' ');
        return txt;
    };

    NS.RecordListWidget = Y.Base.create('recordListWidget', SYS.AppWidget, [], {
        onInitAppWidget: function(err, appInstance){
            this._widgets = [];
            this.set('waiting', true);
            appInstance.recordList(this.renderRecordList, this);

            this.after('noteidChange', this.renderRecordList, this);
        },
        destructor: function(){
            this.closeEditor();
            this._destroyList();
        },
        _destroyList: function(){
            var ws = this._widgets;
            for (var i = 0; i < ws.length; i++){
                ws[i].destroy();
            }
            this._widgets = [];
        },
        renderRecordList: function(){
            this.set('waiting', false);
            var recordList = this.get('appInstance').get('recordList');
            if (!recordList){
                return;
            }
            this._destroyList();
            recordList.each(this._renderRecord, this);
        },
        _renderRecord: function(record){
            var appInstance = this.get('appInstance'),
                tp = this.template,
                ws = this._widgets,
                noteid = this.get('noteid');

            if (!record){
                record = new NS.Record({
                    appInstance: appInstance,
                    noteid: noteid
                });
            } else if (record.get('noteid') !== this.get('noteid')){
                return;
            }

            var div = Y.Node.create('<div></div>');
            tp.one('list').insert(div, 0)

            var w = new NS.RecordListWidget.RowWidget({
                srcNode: div,
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
            noteid: {value: 0}
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
            this.closeEditor();
        },
        renderRecord: function(){
            var tp = this.template,
                record = this.get('record'),
                dConvert = Brick.dateExt.convert,
                message = record.get('message'),
                isExpand = this.get('isExpand');

            tp.toggleClass('id', 'expandedMode', isExpand);

            tp.setHTML({
                'message': isExpand ? message : NS.stripHTML(message),
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

            tp.setValue('messageEditor', record.get('message'));

            // hack tinymce width
            messageNode.set('offsetWidth', messageNode.get('offsetWidth'));

            var Editor = Brick.widget.Editor;
            this._visualEditor = new Editor(tp.gelid('messageEditor'), {
                'mode': Editor.MODE_VISUAL,
                'toolbar': Editor.TOOLBAR_MINIMAL,
                'toolbarExpert': false
            });
        },
        showRemove: function(){
            this.collapse();

            var tp = this.template;

            this._actionWidget = new NS.RecordListWidget.RemoveWidget({
                srcNode: tp.append('action', '<div></div>'),
                CLICKS: {
                    remove: {event: this.remove, context: this},
                    cancel: {event: this.closeEditor, context: this}
                }
            });
        },
        closeEditor: function(){
            if (this._actionWidget){
                this._actionWidget.destroy();
                delete this._actionWidget;
            }
            if (this._visualEditor){
                this._visualEditor.destroy();
                delete this._visualEditor;
                var tp = this.template;
                tp.toggleView(false, 'actionButtons,editorPanel', 'editorButtons,viewerPanel');
            }
        },
        expand: function(){
            this.set('isExpand', true);
            this.renderRecord();
        },
        collapse: function(){
            this.set('isExpand', false);
            this.renderRecord();
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
        },
        remove: function(){
            if (this.get('waiting')){
                return;
            }
            var record = this.get('record');

            this.set('waiting', true)
            this.get('appInstance').recordRemove(record.get('id'), function(err, result){
                this.set('waiting', false)
                this.closeEditor();
                if (!err){
                    this.destroy();
                }
            }, this);
        }
    }, {
        ATTRS: {
            component: {value: COMPONENT},
            templateBlockName: {value: 'row'},
            record: {},
            isExpand: {value: false}
        },
        CLICKS: {
            showEditor: 'showEditor',
            showRemove: 'showRemove',
            save: 'save',
            cancel: 'closeEditor',
            expand: 'expand',
            collapse: 'collapse'
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