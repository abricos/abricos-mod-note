var Component = new Brick.Component();
Component.requires = {
    mod: [
        {name: 'sys', files: ['appModel.js']},
    ]
};
Component.entryPoint = function(NS){

    var Y = Brick.YUI,
        SYS = Brick.mod.sys;

    NS.Note = Y.Base.create('note', SYS.AppModel, [], {
        structureName: 'Note'
    });

    NS.NoteList = Y.Base.create('noteList', SYS.AppModelList, [], {
        appItem: NS.Note
    });

    NS.Record = Y.Base.create('record', SYS.AppModel, [], {
        structureName: 'Record'
    });

    NS.RecordList = Y.Base.create('recordList', SYS.AppModelList, [], {
        appItem: NS.Record
    });

};