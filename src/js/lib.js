var Component = new Brick.Component();
Component.requires = {
    mod: [
        {name: 'sys', files: ['application.js']},
        {name: '{C#MODNAME}', files: ['model.js']}
    ]
};
Component.entryPoint = function(NS){

    var COMPONENT = this,
        SYS = Brick.mod.sys;

    NS.roles = new Brick.AppRoles('{C#MODNAME}', {
        isAdmin: 50,
        isWrite: 30
    });

    SYS.Application.build(COMPONENT, {}, {
        initializer: function(){
            this.initCallbackFire();
        }
    }, [], {
        ATTRS: {
            isLoadAppStructure: {value: true},
            Note: {value: NS.Note},
            NoteList: {value: NS.NoteList},
            Record: {value: NS.Record},
            RecordList: {value: NS.RecordList}
        },
        REQS: {
            noteList: {
                attach: 'recordList',
                attribute: true,
                type: 'modelList:NoteList'
            },
            noteSave: {args: ['note']},
            noteRemove: {args: ['noteid']},
            recordList: {
                attribute: true,
                type: 'modelList:RecordList'
            },
            recordSave: {args: ['record']},
            recordRemove: {args: ['recordid']},
        },
        URLS: {
            ws: "#app={C#MODNAMEURI}/wspace/ws/",
            note: {
                list: function(){
                    return this.getURL('ws') + 'noteList/NoteListWidget/'
                }
            }
        }
    });
};