/**
 * The grid that shows examiners on a single group.
 */
Ext.define('devilry_subjectadmin.view.managestudents.ExaminersInGroupGrid', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.examinersingroupgrid',
    cls: 'examinersingroupgrid',
    hideHeaders: true,
    disableSelection: true,
    requires: [
        'Ext.XTemplate',
        'devilry_theme.Icons'
    ],

    rowTpl: [
        '<tpl if="user.full_name">',
            '{user.full_name} <small>({user.username})</small>',
        '</tpl>',
        '<tpl if="!user.full_name">',
            '{user.username}',
        '</tpl>'
    ],

    initComponent: function() {
        var me = this;
        Ext.apply(this, {
            title: gettext('Examiners'),
            tools: [{
                xtype: 'splitbutton',
                icon: devilry_theme.Icons.ADD_SMALL,
                itemId: 'addExaminer',
                menu: [{
                    text: gettext('Remove all'),
                    itemId: 'removeAllExaminers',
                    icon: devilry_theme.Icons.DELETE_SMALL
                }]
            }],
            columns: [{
                header: 'Name',
                flex: 1,
                dataIndex: 'id',
                renderer: function(unused1, unused2, examinerRecord) {
                    return Ext.create('Ext.XTemplate', this.rowTpl).apply(examinerRecord.data);
                }
            }, {
                xtype: 'actioncolumn',
                width: 20,
                items: [{
                    icon: devilry_theme.Icons.DELETE_SMALL,
                    tooltip: gettext('Remove examiner'),
                    handler: function(grid, rowIndex, colIndex) {
                        me._onRemove(rowIndex, colIndex);
                    }
                }]
            }]
        });
        this.callParent(arguments);
    },

    _onRemove: function(rowIndex, colIndex) {
        var record = this.getStore().getAt(rowIndex);
        this.fireEvent('removeExaminer', record);
    }
});
