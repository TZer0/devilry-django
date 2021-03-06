Ext.application({
    name: 'devilry_subjectadmin',
    appFolder: DevilrySettings.DEVILRY_STATIC_URL + '/devilry_subjectadmin/app',
    paths: {
        'devilry': DevilrySettings.DEVILRY_STATIC_URL + '/extjs_classes',
        'devilry_extjsextras': DevilrySettings.DEVILRY_STATIC_URL + '/devilry_extjsextras',
        'devilry_theme': DevilrySettings.DEVILRY_STATIC_URL + '/devilry_theme',
        'devilry_i18n': DevilrySettings.DEVILRY_STATIC_URL + '/devilry_i18n',
        'devilry_usersearch': DevilrySettings.DEVILRY_STATIC_URL + '/devilry_usersearch',
        'devilry_header': DevilrySettings.DEVILRY_STATIC_URL + '/devilry_header',
        'devilry_authenticateduserinfo': DevilrySettings.DEVILRY_STATIC_URL + '/devilry_authenticateduserinfo'
    },

    requires: [
        'Ext.container.Viewport',
        'devilry_extjsextras.Router',
        'devilry_extjsextras.RouteNotFound',
        'devilry_extjsextras.AlertMessage',
        'devilry_header.Header',
        'devilry_header.Breadcrumbs',
        'devilry_subjectadmin.utils.UrlLookup'
    ],

    controllers: [
        'Shortcuts',
        'Dashboard',
        'CreateNewAssignment',
        'subject.ListAll',
        'subject.Overview',
        'period.Overview',
        'assignment.Overview',
        'assignment.EditPublishingTime',
        'assignment.EditAnonymous',
        'managestudents.Overview',
        'managestudents.Select',
        'managestudents.NoGroupSelectedViewPlugin',
        'managestudents.SingleGroupSelectedViewPlugin',
        'managestudents.MultipleGroupsSelectedViewPlugin',
        'AddGroups',
        'AllWhereIsAdmin',
        'BulkManageDeadlines'
    ],

    constructor: function() {
        this.addEvents(
           /**
             * @event
             * Fired when an assignment is successfully loaded by the assignment.Overview.
             * @param {devilry_subjectadmin.model.Assignment} assignmentRecord
             */
            'assignmentSuccessfullyLoaded',

            /**
             * @event
             * Fired when the students manager on an assigmment is successfully loaded.
             * @param {devilry_subjectadmin.controller.managestudents.Overview} manageStudentsController
             */
            'managestudentsSuccessfullyLoaded',

            /**
             * @event
             * Fired when no groups are selected in the students manager on an
             * assignment. This happens when the manager is loaded, and
             * whenever all groups are deselected.
             * @param {devilry_subjectadmin.controller.managestudents.Overview} manageStudentsController
             */
            'managestudentsNoGroupSelected',

            /**
             * @event
             * Fired when a single group is selected in the students manager on
             * an assignment.
             * @param {devilry_subjectadmin.controller.managestudents.Overview} manageStudentsController
             * @param {devilry_subjectadmin.model.Group} groupRecord
             */
            'managestudentsSingleGroupSelected',

            /**
             * @event
             * Fired when multiple groups are selected in the students manager
             * on an assignment.
             * @param {devilry_subjectadmin.controller.managestudents.Overview} manageStudentsController
             * @param {[devilry_subjectadmin.model.Group]} groupRecords
             */
            'managestudentsMultipleGroupsSelected',

            /**
             * @event
             * Fired when the sorter for the Groups list is changed.
             * @param {String} [sorter]
             */
            'managestudentsGroupSorterChanged'
        );
        this.callParent(arguments);
    },

    launch: function() {
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
                navclass: 'administrator',
                breadcrumbs: this.breadcrumbs
            }, {
                xtype: 'container',
                region: 'center',
                layout: 'fit',
                items: [this.primaryContentContainer]
            }]
        });
    },

    setPrimaryContent: function(component) {
        this.primaryContentContainer.removeAll();
        this.primaryContentContainer.add(component);
    },

    /** Called after something has been deleted.
     * @param short_description A short description of the item that was deleted.
     * */
    onAfterDelete: function(short_description) {
        this.route.navigate('');
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
        this.route.add("/allsubjects/", 'allSubjects');
        this.route.add("/", 'allWhereIsAdmin');
        this.route.add("/subject/:subject_id/", 'showSubject');
        this.route.add("/period/:period_id/", 'showPeriod');
        this.route.add("/period/:period_id/@@create-new-assignment/", 'createNewAssignment');
        this.route.add("/assignment/:assignment_id/", 'showAssignment');
        this.route.add("/assignment/:assignment_id/@@manage-students/", 'manageStudents');
        this.route.add("/assignment/:assignment_id/@@manage-students/@@select/:group_ids", 'manageGroupsSelectGroups');
        this.route.add("/assignment/:assignment_id/@@manage-students/@@add-students", 'manageGroupsAddStudents');
        this.route.add("/assignment/:assignment_id/@@bulk-manage-deadlines/", 'bulkManageDeadlines');
        this.route.add("/assignment/:assignment_id/@@bulk-manage-deadlines/@@edit/:bulkdeadline_id", 'bulkEditDeadlines');
        this.route.add("/assignment/:assignment_id/@@bulk-manage-deadlines/@@add", 'bulkAddDeadlines');
        this.route.add("/assignment/:assignment_id/@@bulk-manage-deadlines/:bulkdeadline_id", 'bulkManageDeadlines');
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

    allSubjects: function(routeInfo) {
        this.breadcrumbs.set([], gettext("All subjects"));
        this.setPrimaryContent({
            xtype: 'subjectlistall'
        });
    },

    showSubject: function(routeInfo, subject_id) {
        this.setPrimaryContent({
            xtype: 'subjectoverview',
            subject_id: subject_id
        });
    },

    showPeriod: function(routeInfo, period_id) {
        this.setPrimaryContent({
            xtype: 'periodoverview',
            period_id: period_id
        });
    },

    createNewAssignment: function(routeInfo, period_id) {
        this.setPrimaryContent({
            xtype: 'createnewassignment',
            period_id: period_id
        });
    },

    showAssignment: function(routeInfo, assignment_id) {
        this.setPrimaryContent({
            xtype: 'assignmentoverview',
            url: routeInfo.url,
            assignment_id: assignment_id
        });
    },

    manageStudents: function(routeInfo, assignment_id) {
        this.setPrimaryContent({
            xtype: 'managestudentsoverview',
            assignment_id: assignment_id
        });
    },

    manageGroups: function(routeInfo, assignment_id) {
        this.setPrimaryContent({
            xtype: 'managestudentsoverview',
            assignment_id: assignment_id
        });
    },
    manageGroupsSelectGroups: function(routeInfo, assignment_id, group_ids) {
        this.setPrimaryContent({
            xtype: 'managestudentsoverview',
            assignment_id: assignment_id,
            select_groupids_on_load: group_ids
        });
    },
    manageGroupsAddStudents: function(routeInfo, assignment_id) {
        this.setPrimaryContent({
            xtype: 'addgroupsoverview',
            assignment_id: assignment_id,
            on_save_success_url: devilry_subjectadmin.utils.UrlLookup.manageStudents(assignment_id),
            breadcrumbtype: 'managestudents'
        });
    },

    bulkManageDeadlines: function(routeInfo, assignment_id, bulkdeadline_id, edit_deadline, add_deadline) {
        this.setPrimaryContent({
            xtype: 'bulkmanagedeadlinespanel',
            assignment_id: assignment_id,
            bulkdeadline_id: bulkdeadline_id,
            edit_deadline: edit_deadline,
            add_deadline: add_deadline
        });
    },
    bulkEditDeadlines: function(routeInfo, assignment_id, bulkdeadline_id) {
        this.bulkManageDeadlines(routeInfo, assignment_id, bulkdeadline_id, true);
    },
    bulkAddDeadlines: function(routeInfo, assignment_id) {
        this.bulkManageDeadlines(routeInfo, assignment_id, undefined, false, true);
    },

    allWhereIsAdmin: function() {
        this.setPrimaryContent({
            xtype: 'allwhereisadminpanel'
        });
    }
});
