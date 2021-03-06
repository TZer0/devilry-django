Ext.define('devilry_subjectadmin.view.DangerousActions', {
    extend: 'Ext.container.Container',
    alias: 'widget.dangerousactions',
    cls: 'devilry_subjectadmin_dangerousactions',

    requires: [
    ],

    title: gettext('Dangerous actions'),

    initComponent: function() {
        Ext.apply(this, {
            items: [{
                xtype: 'box',
                cls: 'bootstrap',
                //margin: '0 0 2 0',
                itemId: 'header',
                tpl: '<h2>{heading}</h2>',
                data: {
                    heading: this.title
                }
            }, {
                xtype: 'panel',
                bodyPadding: 10,
                layout: 'anchor',
                defaults: {
                    anchor: '100%',
                    margin: '10 0 0 0',
                    bodyTpl: '<p class="muted">{html}</p>'
                },
                items: this.items
            }]
        });
        this.callParent(arguments);
    }
});
