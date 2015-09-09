var Component = new Brick.Component();
Component.requires = {
    mod: [
        {name: '{C#MODNAME}', files: ['noteList.js', 'recordList.js']}
    ]
};
Component.entryPoint = function(NS){

    var Y = Brick.YUI,
        COMPONENT = this,
        SYS = Brick.mod.sys;

    NS.ManagerWidget = Y.Base.create('managerWidget', SYS.AppWidget, [], {
        onInitAppWidget: function(err, appInstance){
            this.set('waiting', true);
            appInstance.noteList(this.onLoadNoteList, this);
        },
        destructor: function(){
            if (this.noteListWidget){
                this.noteListWidget.destroy();
                this.recordListWidget.destroy();
            }
        },
        onLoadNoteList: function(){
            this.set('waiting', false);
            var noteList = this.get('appInstance').get('noteList');
            if (!noteList){
                return;
            }
            var tp = this.template;
            this.noteListWidget = new NS.NoteListWidget({
                srcNode: tp.gel('noteList')
            });
            this.recordListWidget = new NS.RecordListWidget({
                srcNode: tp.gel('recordList')
            });
        }
    }, {
        ATTRS: {
            component: {value: COMPONENT},
            templateBlockName: {value: 'widget'}
        }
    });
};