/**
 * List of periods within a subject.
 */
Ext.define('devilry_subjectadmin.view.subject.ListOfPeriods', {
    extend: 'Ext.view.View',
    alias: 'widget.listofperiods',
    cls: 'devilry_listofperiods bootstrap',
    store: 'Periods',

    tpl: [
        '<ul>',
            '<tpl for=".">',
                '<li class="devilry_period">',
                    '<a href="#/period/{id}/">{long_name}</a>',
                '</li>',
            '</tpl>',
        '<ul>'
    ],
    itemSelector: 'li.period'
});
