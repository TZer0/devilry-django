Ext.application({
    name: 'devilry_student',
    appFolder: DevilrySettings.DEVILRY_STATIC_URL + '/devilry_student/app',
    paths: {
        'devilry': DevilrySettings.DEVILRY_STATIC_URL + '/extjs_classes',
        'devilry_extjsextras': DevilrySettings.DEVILRY_STATIC_URL + '/devilry_extjsextras',
        'devilry_header': DevilrySettings.DEVILRY_STATIC_URL + '/devilry_header',
        'devilry_authenticateduserinfo': DevilrySettings.DEVILRY_STATIC_URL + '/devilry_authenticateduserinfo',
        'devilry_i18n': DevilrySettings.DEVILRY_STATIC_URL + '/devilry_i18n',
        'devilry_theme': DevilrySettings.DEVILRY_STATIC_URL + '/devilry_theme'
    },

    requires: [
        'Ext.container.Viewport',
        'devilry_extjsextras.Router',
        'devilry_extjsextras.RouteNotFound',
        'devilry_header.Header',
        'devilry_header.Breadcrumbs',
    ],

    controllers: [
        'Dashboard',
        'BrowseHistory',
        'GroupInfo',
        'AddDelivery'
    ],

    launch: function() {
        this.dashboard_url = DevilrySettings.DEVILRY_URLPATH_PREFIX + '/devilry_student/';
        this._createViewport();
        this._setupRoutes();
    },

    _createViewport: function() {
        this.breadcrumbs = Ext.widget('breadcrumbs', {
            defaultBreadcrumbs: [{
                text: gettext("Dashboard"),
                url: '#'
            }]
        });

        this.primaryContentContainer = Ext.widget('container', {
            region: 'center',
            layout: 'fit'
        });
        this.viewport = Ext.create('Ext.container.Viewport', {
            xtype: 'container',
            layout: 'border',
            items: [{
                xtype: 'devilryheader',
                region: 'north',
                navclass: 'student',
                breadcrumbs: this.breadcrumbs
            }, {
                xtype: 'container',
                region: 'center',
                layout: 'border',
                items: [this.primaryContentContainer]
            }]
        });
    },

    setPrimaryContent: function(component) {
        this.primaryContentContainer.removeAll();
        this.primaryContentContainer.add(component);
    },

    /** Used by controllers to set the page title (the title-tag). */
    setTitle: function(title) {
        window.document.title = Ext.String.format('{0} - Devilry', title);
    },


    /*********************************************
     * Routing
     ********************************************/

    _setupRoutes: function() {
        this.route = Ext.create('devilry_extjsextras.Router', this);
        this.route.add("", 'dashboard');
        this.route.add("/browse/", 'browse');
        this.route.add("/browse/:period_id", 'browsePeriod');
        this.route.add("/group/:group_id/", 'groupinfo');
        this.route.add("/group/:group_id/@@add-delivery", 'groupinfoAddDelivery');
        this.route.add("/group/:group_id/:delivery_id", 'groupinfo');
        this.route.start();
    },
    
    routeNotFound: function(routeInfo) {
        this.breadcrumbs.set([], gettext('Route not found'));
        this.setPrimaryContent({
            xtype: 'routenotfound',
            route: routeInfo.token
        });
    },

    dashboard: function() {
        this.breadcrumbs.setHome();
        this.setPrimaryContent({
            xtype: 'dashboard'
        });
    },

    browse: function() {
        this.setPrimaryContent({
            xtype: 'browsehistory'
        });
    },

    browsePeriod: function(routeinfo, period_id) {
        this.setPrimaryContent({
            xtype: 'browsehistory',
            period_id: period_id
        });
    },

    groupinfo: function(routeinfo, group_id, delivery_id, add_delivery) {
        this.setPrimaryContent({
            xtype: 'groupinfo',
            group_id: group_id,
            delivery_id: delivery_id,
            add_delivery: add_delivery
        });
    },

    groupinfoAddDelivery: function(routeinfo, group_id) {
        this.groupinfo(routeinfo, group_id, undefined, true);
    }
});
