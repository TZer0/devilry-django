/**
 * Assignment overview (overview of an assignment).
 */
Ext.define('devilry_subjectadmin.view.assignment.Overview' ,{
    extend: 'Ext.panel.Panel',
    alias: 'widget.assignmentoverview',
    cls: 'devilry_subjectadmin_assignmentoverview',
    requires: [
        'Ext.layout.container.Column',
        'devilry_subjectadmin.utils.UrlLookup',
        'devilry_extjsextras.EditableSidebarBox',
        'devilry_extjsextras.AlertMessageList',
        'devilry_subjectadmin.view.assignment.EditPublishingTimeWidget',
        'devilry_subjectadmin.view.assignment.EditAnonymousWidget',
        'devilry_subjectadmin.view.ActionList',
        'devilry_subjectadmin.view.DangerousActions'
    ],

    /**
     * @cfg {String} assignment_id (required)
     */

    initComponent: function() {
        Ext.apply(this, {
            frame: false,
            border: 0,
            bodyPadding: 40,
            autoScroll: true,

            items: [{
                xtype: 'alertmessagelist'
            }, {
                xtype: 'container',
                layout: 'column',
                items: [{
                    xtype: 'container',
                    columnWidth: 1,
                    items: [{
                        xtype: 'box',
                        cls: 'bootstrap',
                        margin: '0 0 20 0',
                        itemId: 'header',
                        tpl: '<h1>{heading}</h1>',
                        data: {
                            heading: gettext('Loading') + ' ...'
                        }
                    }, {
                        xtype: 'actionlist',
                        links: [{
                            url: devilry_subjectadmin.utils.UrlLookup.manageStudents(this.assignment_id),
                            text: gettext('Manage students')
                        }, {
                            url: devilry_subjectadmin.utils.UrlLookup.bulkManageDeadlines(this.assignment_id),
                            text: gettext('Manage deadlines')
                        }]
                    //}, {
                        //xtype: 'panel',
                        //ui: 'transparentpanel-overflowvisible',
                        //margin: '40 0 0 0',
                        //layout: 'column',
                        //items: [{
                            //xtype: 'panel',
                            //ui: 'inset-header-panel',
                            //margin: '0 20 0 0',
                            //columnWidth: .5,
                            //title: gettext('Upcoming deadlines'),
                            //html: 'TODO. See this <a href="http://heim.ifi.uio.no/espeak/devilry-figures/assignmentadmin.png" target="_blank">mockup image</a>.'
                        //}, {
                            //xtype: 'panel',
                            //ui: 'inset-header-panel',
                            //title: gettext('Waiting for feedback'),
                            //columnWidth: .5,
                            //margin: '0 0 0 20',
                            //html: 'TODO. See this <a href="http://heim.ifi.uio.no/espeak/devilry-figures/assignmentadmin.png" target="_blank">mockup image</a>.'
                        //}]
                    }, {
                        xtype: 'dangerousactions',
                        margin: '20 0 0 0',
                        items: [{
                            xtype: 'singleactionbox',
                            margin: 0,
                            itemId: 'renameButton',
                            id: 'assignmentRenameButton',
                            titleText: gettext('Loading ...'),
                            bodyHtml: gettext('Renaming an assignment should not done without a certain amount of consideration. The name of an assignment, especially the short name, is often used as an identifier when integrating other systems with Devilry.'),
                            buttonText: gettext('Rename') + ' ...'
                        }, {
                            xtype: 'singleactionbox',
                            itemId: 'deleteButton',
                            id: 'assignmentDeleteButton',
                            titleText: gettext('Loading ...'),
                            bodyHtml: gettext('Once you delete an assignment, there is no going back. Only superusers can delete an assignment with deliveries.'),
                            buttonText: gettext('Delete') + ' ...'
                        }]
                    }]
                }, {
                    xtype: 'container',
                    border: false,
                    width: 250,
                    margin: '0 0 0 40',
                    defaults: {
                        margin: '10 0 0 0'
                    },
                    items: [{
                        xtype: 'editablesidebarbox',
                        itemId: 'gradeeditor',
                        margin: 0,
                        title: gettext('Grade editor')
                    }, {
                        xtype: 'editpublishingtime-widget',
                        disabled: true
                    }, {
                        xtype: 'editanonymous-widget',
                        disabled: true
                    }]
                }]
            }]
        });
        this.callParent(arguments);
    }
});
