/**
 * Controller for the period overview.
 */
Ext.define('devilry_subjectadmin.controller.period.Overview', {
    extend: 'Ext.app.Controller',

    mixins: {
        'setBreadcrumb': 'devilry_subjectadmin.utils.BasenodeBreadcrumbMixin',
        'onLoadFailure': 'devilry_subjectadmin.utils.DjangoRestframeworkLoadFailureMixin'
    },

    views: [
        'period.Overview',
        'period.ListOfAssignments'
    ],

    stores: ['Assignments', 'RelatedExaminers', 'RelatedStudents'],
    models: ['Period'],

    requires: [
        'devilry_subjectadmin.utils.UrlLookup'
    ],

    refs: [{
        ref: 'globalAlertmessagelist',
        selector: 'periodoverview>alertmessagelist'
    }, {
        ref: 'header',
        selector: 'periodoverview #header'
    }, {
        ref: 'periodOverview',
        selector: 'periodoverview'
    }, {
        ref: 'deleteButton',
        selector: 'periodoverview #deleteButton'
    }, {
        ref: 'renameButton',
        selector: 'periodoverview #renameButton'
    }, {
        ref: 'adminsbox',
        selector: 'periodoverview adminsbox'
    }, {
        ref: 'basenodehierlocation',
        selector: 'periodoverview basenodehierlocation'
    }, {
        ref: 'overviewofrelatedusers',
        selector: 'periodoverview overviewofrelatedusers'
    }, {
        ref: 'relatedstudentslist',
        selector: 'periodoverview overviewofrelatedusers #students'
    }, {
        ref: 'relatedexaminerslist',
        selector: 'periodoverview overviewofrelatedusers #examiners'
    }],

    init: function() {
        this.control({
            'viewport periodoverview': {
                render: this._onPeriodViewRender
            },
            'viewport periodoverview #deleteButton': {
                click: this._onDelete
            },
            'viewport periodoverview #renameButton': {
                click: this._onRename
            }
        });
    },

    _loadRelatedUsers: function(period_id) {
        this.getRelatedExaminersStore().loadInPeriod(period_id, {
            scope: this,
            callback: this._onLoadRelatedExaminers
        });
        this.getRelatedStudentsStore().loadInPeriod(period_id, {
            scope: this,
            callback: this._onLoadRelatedStudents
        });
    },

    _onLoadRelatedExaminers: function(records, operation) {
        if(operation.success) {
            this.getRelatedexaminerslist().setLoadedStore(this.getRelatedExaminersStore());
        } else {
            this.getRelatedexaminerslist().setFailedToLoad(operation);
        }
    },

    _onLoadRelatedStudents: function(records, operation) {
        if(operation.success) {
            this.getRelatedstudentslist().setLoadedStore(this.getRelatedStudentsStore());
        } else {
            this.getRelatedstudentslist().setFailedToLoad(operation);
        }
    },

    _getPath: function() {
        return this.getPathFromBreadcrumb(this.periodRecord);
    },

    _onPeriodViewRender: function() {
        this.setLoadingBreadcrumb();
        this.period_id = this.getPeriodOverview().period_id;
        this._loadPeriod(this.period_id);
        //this._loadRelatedUsers(this.period_id);
        this._loadAssignments(this.period_id);
    },

    _setMenuLabels: function() {
        var periodpath = this._getPath();
        var deleteLabel = Ext.create('Ext.XTemplate', gettext('Delete {something}')).apply({
            something: periodpath
        });
        var renameLabel = Ext.create('Ext.XTemplate', gettext('Rename {something}')).apply({
            something: periodpath
        });
        this.getDeleteButton().setTitleText(deleteLabel);
        this.getRenameButton().setTitleText(renameLabel);
    },

    _loadAssignments: function(period_id) {
        this.getAssignmentsStore().loadAssignmentsInPeriod(period_id, this._onLoadAssignments, this);
    },

    _onLoadAssignments: function(records, operation) {
        if(operation.success) {
        } else {
            this.onLoadFailure(operation);
        }
    },

    _loadPeriod: function(period_id) {
        this.getPeriodModel().load(period_id, {
            scope: this,
            callback: function(record, operation) {
                if(operation.success) {
                    this._onLoadPeriodSuccess(record);
                } else {
                    this._onLoadPeriodFailure(operation);
                }
            }
        });
    },
    _onLoadPeriodSuccess: function(record) {
        this.periodRecord = record;
        //this.application.fireEvent('periodSuccessfullyLoaded', record);
        this.application.setTitle(this._getPath());
        this.getHeader().update({
            heading: record.get('long_name')
        });
        this.setBreadcrumb(this.periodRecord);
        this._setMenuLabels();
        this.getAdminsbox().setBasenodeRecord(this.periodRecord);
        this.getBasenodehierlocation().setLocation(this.periodRecord);
    },
    _onLoadPeriodFailure: function(operation) {
        this.onLoadFailure(operation);
    },

    _onRename: function() {
        Ext.create('devilry_subjectadmin.view.RenameBasenodeWindow', {
            basenodeRecord: this.periodRecord
        }).show();
    },
    _onDelete: function() {
        var short_description = this._getPath();
        devilry_subjectadmin.view.DeleteDjangoRestframeworkRecordDialog.showIfCanDelete({
            basenodeRecord: this.periodRecord,
            short_description: short_description,
            listeners: {
                scope: this,
                deleteSuccess: function() {
                    this.application.onAfterDelete(short_description);
                }
            }
        });
    }
});
