Ext.define('devilry_subjectadmin.view.bulkmanagedeadlines.BulkManageDeadlinesPanel' ,{
    extend: 'Ext.panel.Panel',
    alias: 'widget.bulkmanagedeadlinespanel', // Define the widget xtype as allwhereisadminpanel
    cls: 'devilry_subjectadmin_bulkmanagedeadlinespanel',

    requires: [
        'devilry_extjsextras.AlertMessageList'
    ],

    /**
     * @cfg {int} [assignment_id]
     * The ID of the assignment to load deadlines for.
     */

    /**
     * @cfg {string} [bulkdeadline_id=undefined]
     * The deadline to open on load.
     */

    /**
     * @cfg {bool} [edit_deadline=false]
     * Edit the deadline specified by ``bulkdeadline_id`` on load?
     */

    frame: false,
    border: 0,
    bodyPadding: 40,
    autoScroll: true, // Autoscroll on overflow

    items: [{
        xtype: 'alertmessagelist',
        itemId: 'globalAlertmessagelist'
    }, {
        xtype: 'box',
        itemId: 'header'
    }, {
        xtype: 'panel',
        autoScroll: true,
        itemId: 'deadlinesContainer',
        cls: 'devilry_discussionview_container'
    }]
});