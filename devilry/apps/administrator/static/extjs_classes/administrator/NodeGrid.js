Ext.define('devilry.administrator.NodeGrid', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.devilry-administrator-nodegrid',

    initComponent: function() {
        Ext.apply(this, {
            width: 600,
            //height: 150,
            frame: false,
            //title: false,
            hideHeaders: true,
            columns: [{
                header: 'Nodes', dataIndex: 'long_name', flex: 1,
                renderer: this.formatRow
            }]
        });
        this.callParent(arguments);
    },

    /**
     * Title renderer
     * @private
     */
    formatRow: function(value, p, record) {
        return Ext.String.format(
            '<div class="long_name">{0}</div><div class="short_name">{1}</div>',
            record.get('long_name'), record.get('short_name'));
    }
});
