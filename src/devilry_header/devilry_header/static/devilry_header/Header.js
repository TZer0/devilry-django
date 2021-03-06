/**
 * Devilry page header.
 */
Ext.define('devilry_header.Header', {
    extend: 'Ext.container.Container',
    alias: 'widget.devilryheader',
    cls: 'devilryheader',
    margins: '0 0 0 0',
    height: 30,

    requires: [
        'devilry_header.FlatButton',
        'devilry_header.HoverMenu',
        'devilry_header.Roles',
        'devilry_authenticateduserinfo.UserInfo',
        'devilry_header.Breadcrumbs'
    ],


    navclass_to_rolename: {
        'no_role': gettext('Select role'),
        'student': gettext('Student'),
        'examiner': gettext('Examiner'),
        'administrator': gettext('Administrator'),
        'superuser': gettext('Superuser')
    },

    navclass_to_dashboard_url: {
        'student': DevilrySettings.DEVILRY_URLPATH_PREFIX + '/devilry_student/#',
        'examiner': DevilrySettings.DEVILRY_URLPATH_PREFIX + '/examiner/',
        'administrator': DevilrySettings.DEVILRY_URLPATH_PREFIX + '/administrator/',
        'superuser': DevilrySettings.DEVILRY_URLPATH_PREFIX + '/superuser/'
    },

    /**
     * @cfg {string} [navclass]
     * The css class to style the header buttons with.
     */

    /**
     * @cfg {Object} [breadcrumbs=devilry_header.Breadcrumbs]
     * The object to use for breadcrumbs. You can also set this after load with #setBreadcrumbComponent.
     * Defaults to an instance of devilry_header.Breadcrumbs.
     */

    constructor: function(config) {
        if(!this.navclass_to_rolename[config.navclass]) {
            throw "Invalid navclass: " + config.navclass;
        }
        devilry_authenticateduserinfo.UserInfo.load(); // Load the userinfo as soon as possible.
        this.callParent(arguments);
    },

    initComponent: function() {
        var breadcrumbareaItem;
        if(this.breadcrumbs) {
            breadcrumbareaItem = this.breadcrumbs;
        } else {
            var defaultBreadcrumbs = [{
                url: this.navclass_to_dashboard_url[this.navclass],
                text: gettext('Dashboard')
            }];
            breadcrumbareaItem = Ext.widget('breadcrumbs', {
                defaultBreadcrumbs: defaultBreadcrumbs
            });
        }
        Ext.apply(this, {
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            items: [{
                xtype: 'box',
                //width: 110,
                cls: 'devilrylogo',
                tpl: '<a class="logotext" href="{frontpageurl}">{text}</a>',
                data: {
                    text: 'Devilry',
                    frontpageurl: DevilrySettings.DEVILRY_URLPATH_PREFIX + '/'
                }
            }, {
                xtype: 'devilryheader_flatbutton',
                itemId: 'currentRoleButton',
                cls: 'flatbutton currentrolebutton',
                listeners: {
                    scope: this,
                    render: this._onRenderCurrentRoleButton,
                    click: this._onClickCurrentRoleButton
                }
            }, {
                xtype: 'container',
                itemId: 'breadcrumbarea',
                cls: 'breadcrumbarea',
                items: [breadcrumbareaItem],
                flex: 1
            }, {
                xtype: 'devilryheader_flatbutton',
                itemId: 'userButton',
                enableToggle: true,
                width: 100,
                listeners: {
                    scope: this,
                    render: this._onRenderUserButton,
                    toggle: this._onToggleUserButton
                }
            }, {
                // NOTE: This component is floating, so it is not really part of the layout
                xtype: 'devilryheader_hovermenu',
                listeners: {
                    scope: this,
                    show: this._onShowHovermenu,
                    hide: this._onHideHovermenu
                }
            }]
        });
        this.callParent(arguments);
    },

    _getCurrentRoleButton: function() {
        return this.down('#currentRoleButton');
    },
    _getHoverMenu: function() {
        return this.down('devilryheader_hovermenu');
    },
    _getUserButton: function() {
        return this.down('#userButton');
    },
    _getBreadcrumbArea: function() {
        return this.down('#breadcrumbarea');
    },

    setBreadcrumbComponent: function(config) {
        this._getBreadcrumbArea().removeAll();
        this._getBreadcrumbArea().add(config);
    },

    _onRenderCurrentRoleButton: function() {
        this._getCurrentRoleButton().setText(this.navclass_to_rolename[this.navclass]);
        this._getCurrentRoleButton().addExtraClass(this.navclass);
    },
    _onRenderUserButton: function() {
        devilry_authenticateduserinfo.UserInfo.load(function(userInfoRecord) {
            this._getHoverMenu().setUserInfoRecord(userInfoRecord);
            this._getUserButton().addExtraClass(this.navclass);
            this._getUserButton().setText(userInfoRecord.getDisplayName());
        }, this);
    },

    _onClickCurrentRoleButton: function() {
        this._getUserButton().toggle();
    },

    _onToggleUserButton: function(button) {
        var hovermenu = this._getHoverMenu();
        if(button.pressed) {
            hovermenu.show();
        } else {
            hovermenu.hide();
        }
    },

    _onShowHovermenu: function() {
        this._getCurrentRoleButton().setPressedCls();
        this._getUserButton().setPressedCls();
    },
    _onHideHovermenu: function() {
        this._getCurrentRoleButton().setNotPressedCls();
        this._getUserButton().setNotPressedCls();
    }
});
