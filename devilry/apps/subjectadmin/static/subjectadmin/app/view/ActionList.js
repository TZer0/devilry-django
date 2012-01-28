Ext.define('subjectadmin.view.ActionList', {
    extend: 'Ext.Component',
    alias: 'widget.actionlist',
    cls: 'actionlist box',

    tpl: [
        '<h2 class="boxtitle">{title}</h2>',
        '<ul class="boxbody">',
        '    <tpl for="links">',
        '       <li>',
        '           <a href="{url}" class="btn large primary">{text}</a>',
        '       </li>',
        '    </tpl>',
        '<ul>'
    ]
});