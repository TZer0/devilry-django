Ext.define('devilry_subjectadmin.controller.BulkManageDeadlines', {
    extend: 'Ext.app.Controller',

    mixins: [
        'devilry_subjectadmin.utils.DjangoRestframeworkLoadFailureMixin',
        'devilry_subjectadmin.utils.LoadAssignmentMixin',
        'devilry_subjectadmin.utils.BasenodeBreadcrumbMixin',
        'devilry_subjectadmin.utils.DjangoRestframeworkProxyErrorMixin'
    ],

    requires: [
        'devilry_subjectadmin.utils.UrlLookup',
        'devilry_extjsextras.DjangoRestframeworkProxyErrorHandler',
        'devilry_extjsextras.form.ErrorUtils',
        'devilry_extjsextras.ConfirmDeleteDialog'
    ],

    views: [
        'bulkmanagedeadlines.BulkManageDeadlinesPanel',
        'bulkmanagedeadlines.DeadlinePanel'
    ],

    models: [
        'Assignment'
    ],

    stores: [
        'DeadlinesBulk'
    ],

    refs: [{
        ref: 'bulkManageDeadlinesPanel',
        selector: 'bulkmanagedeadlinespanel'
    }, {
        ref: 'deadlinesContainer',
        selector: 'bulkmanagedeadlinespanel #deadlinesContainer'
    }, {
        ref: 'globalAlertmessagelist',
        selector: 'bulkmanagedeadlinespanel #globalAlertmessagelist'
    }, {
        ref: 'normalBodyContainer',
        selector: 'bulkmanagedeadlinespanel #normalBodyContainer'
    }, {
        ref: 'addDeadlineBodyContainer',
        selector: 'bulkmanagedeadlinespanel #addDeadlineBodyContainer'
    }],

    init: function() {
        this.control({
            'viewport bulkmanagedeadlinespanel #globalAlertmessagelist': {
                render: this._onRender
            },
            'viewport bulkmanagedeadlinespanel bulkmanagedeadlines_deadline header': {
                click: this._onDeadlineHeaderClick
            },
            'viewport bulkmanagedeadlinespanel bulkmanagedeadlines_deadline': {
                editDeadline: this._onEditDeadline,
                deleteDeadline: this._onDeleteDeadline
            },
            'viewport bulkmanagedeadlinespanel #addDeadlineButton': {
                click: this._onAddDeadline
            },
            'viewport bulkmanagedeadlinespanel bulkmanagedeadlines_deadline bulkmanagedeadlines_deadlineform': {
                saveDeadline: this._onSaveExistingDeadline,
                cancel: this._onCancelEditExistingDeadline
            },
            'viewport bulkmanagedeadlinespanel bulkmanagedeadlines_deadlineform#addDeadlineForm': {
                saveDeadline: this._onSaveNewDeadline,
                cancel: this._onCancelAddNewDeadline
            }
        });
        
        this.mon(this.getDeadlinesBulkStore().proxy, {
            scope: this,
            exception: this._onDeadlinesBulkStoreProxyError
        });
    },

    _onRender: function() {
        this.setLoadingBreadcrumb();
        this.getBulkManageDeadlinesPanel().setLoading();
        this.assignment_id = this.getBulkManageDeadlinesPanel().assignment_id;
        this.loadAssignment(this.assignment_id);
        var store = this.getDeadlinesBulkStore();
        store.proxy.setUrl(this.assignment_id);
        store.load({
            scope: this,
            callback: function(records, operation) {
                this.getBulkManageDeadlinesPanel().setLoading(false);
                if(operation.success) {
                    this._onLoadSuccess(records, operation);
                } else {
                    // NOTE: Failure is handled in _onDeadlinesBulkStoreProxyError()
                }
            }
        });
    },

    _setBreadcrumb: function(subviewtext) {
        var title = interpolate(gettext('Manage %(deadlines_term)s'), {
            deadlines_term: gettext('deadlines')
        }, true);
        this.setSubviewBreadcrumb(this.assignmentRecord, 'Assignment', [], title);
    },
    onLoadAssignmentSuccess: function(record) {
        this.assignmentRecord = record;
        this._setBreadcrumb();
    },
    onLoadAssignmentFailure: function(operation) {
        this.onLoadFailure(operation);
    },

    _onLoadSuccess: function(deadlineRecords, operation) {
        this._populateDeadlinesContainer(deadlineRecords);
    },

    _populateDeadlinesContainer: function(deadlineRecords) {
        var deadlinepanels_rendered = 0;
        Ext.Array.each(deadlineRecords, function(deadlineRecord) {
            this.getDeadlinesContainer().add({
                xtype: 'bulkmanagedeadlines_deadline',
                deadlineRecord: deadlineRecord,
                assignment_id: this.assignment_id,
                listeners: {
                    scope: this,
                    single: true,
                    render: function(panel, eOpts) {
                        deadlinepanels_rendered ++;
                        if(deadlinepanels_rendered == deadlineRecords.length) {
                            Ext.defer(function() {
                                this._onAllDeadlinePanelsRendered();
                            }, 200, this);
                        }
                    }
                }
            });
        }, this);
    },

    _onAllDeadlinePanelsRendered: function() {
        var bulkdeadline_id = this.getBulkManageDeadlinesPanel().bulkdeadline_id;
        if(typeof bulkdeadline_id !== 'undefined') {
            this._expandDeadlineById(bulkdeadline_id);
        } else {
            var add_deadline = this.getBulkManageDeadlinesPanel().add_deadline;
            if(add_deadline) {
                this._onAddDeadline();
            }
        }
    },

    _expandDeadlineById: function(id) {
        var itemid = Ext.String.format('#deadline-{0}', id);
        var deadlinePanel = this.getDeadlinesContainer().down(itemid);
        if(deadlinePanel) {
            this._expandDeadlinePanel(deadlinePanel);
            var edit_deadline = this.getBulkManageDeadlinesPanel().edit_deadline;
            if(edit_deadline) {
                this._onEditDeadline(deadlinePanel, deadlinePanel.deadlineRecord);
            }
        }
    },

    _scrollTo: function(component) {
        component.el.scrollIntoView(this.getBulkManageDeadlinesPanel().body, false, true);
    },

    _onDeadlineHeaderClick: function(header) {
        var deadlinePanel = header.up('bulkmanagedeadlines_deadline');
        var isCollapsed = deadlinePanel.getCollapsed();
        if(isCollapsed) {
            var deadlineRecord = deadlinePanel.deadlineRecord;
            var hash = devilry_subjectadmin.utils.UrlLookup.bulkManageSpecificDeadline(this.assignment_id, deadlineRecord.get('bulkdeadline_id'));
            this.application.route.setHashWithoutEvent(hash);
            this._expandDeadlinePanel(deadlinePanel);
        } else {
            deadlinePanel.collapse();
            this._setNoDeadlineSelectedHash();
        }
    },

    _setNoDeadlineSelectedHash: function() {
        var hash = devilry_subjectadmin.utils.UrlLookup.bulkManageDeadlines(this.assignment_id);
        this.application.route.setHashWithoutEvent(hash);
    },

    _expandDeadlinePanel: function(deadlinePanel) {
        deadlinePanel.expand();
        Ext.defer(function() {
            this._scrollTo(deadlinePanel);
        }, 300, this);
    },


    _onEditDeadline: function(deadlinePanel, deadlineRecord) {
        var formpanel = deadlinePanel.down('bulkmanagedeadlines_deadlineform');
        formpanel.down('alertmessagelist').removeAll(); // NOTE: Remove any error lingering from pressing cancel previously.
        var hash = devilry_subjectadmin.utils.UrlLookup.bulkEditSpecificDeadline(this.assignment_id, deadlineRecord.get('bulkdeadline_id'));
        this.application.route.setHashWithoutEvent(hash);
        this._setActiveDeadlineFormPanel(formpanel);

        deadlinePanel.down('#deadlineButtonContainer').hide();
        formpanel.show();
        this._scrollTo(formpanel);
        var form = formpanel.getForm();
        form.setValues({
            deadline: deadlineRecord.get('deadline'),
            text: deadlineRecord.get('text')
        });
    },

    _onCancelEditExistingDeadline: function(formpanel) {
        formpanel.hide();
        this._unsetActiveDeadlineFormPanel();
        var deadlinePanel = formpanel.up('bulkmanagedeadlines_deadline');
        var deadlineRecord = deadlinePanel.deadlineRecord;
        var hash = devilry_subjectadmin.utils.UrlLookup.bulkManageSpecificDeadline(this.assignment_id, deadlineRecord.get('bulkdeadline_id'));
        deadlinePanel.down('#deadlineButtonContainer').show();
        this.application.route.setHashWithoutEvent(hash);
        this._scrollTo(deadlinePanel);
    },

    _onSaveExistingDeadline: function(formpanel) {
        formpanel.setLoading(gettext('Saving') + ' ...');
        var deadlinePanel = formpanel.up('bulkmanagedeadlines_deadline');
        var deadlineRecord = deadlinePanel.deadlineRecord;
        var form = formpanel.getForm();
        var values = form.getFieldValues();
        deadlineRecord.set('deadline', values.deadline);
        deadlineRecord.set('text', values.text);
        deadlineRecord.save({
            scope: this,
            callback: function(updatedDeadlineRecord, operation) {
                formpanel.setLoading(false);
                if(operation.success) {
                    updatedDeadlineRecord.updateBulkDeadlineIdFromOperation(operation);
                    var hash = devilry_subjectadmin.utils.UrlLookup.bulkManageSpecificDeadline(
                        this.assignment_id, updatedDeadlineRecord.get('bulkdeadline_id'));
                    this.application.route.setHashWithoutEvent(hash);
                    window.location.reload();
                } else {
                    // NOTE: Failure is handled in _onDeadlinesBulkStoreProxyError()
                }
            }
        });
    },


    //
    //
    // Handle proxy errors
    //
    //

    _setShowNextProxyErrorInWindow: function() {
        this.showNextProxyErrorInWindow = true;
    },
    _unsetShowNextProxyErrorInWindow: function() {
        this.showNextProxyErrorInWindow = false;
    },

    _setActiveDeadlineFormPanel: function(formpanel) {
        this.activeDeadlineFormPanel = formpanel;
    },
    _unsetActiveDeadlineFormPanel: function() {
        this.activeDeadlineFormPanel = undefined;
    },

    _onDeadlinesBulkStoreProxyError: function(proxy, response, operation) {
        if(this.activeDeadlineFormPanel) {
            var alertmessagelist = this.activeDeadlineFormPanel.down('alertmessagelist');
            alertmessagelist.removeAll();
            this.handleProxyError(alertmessagelist, this.activeDeadlineFormPanel, response, operation);
            this._scrollTo(alertmessagelist);
        } else {
            // NOTE: This should only trigger on load and DELETE error, since saves are
            //       done with _setActiveDeadlineFormPanel()
            var alertmessagelist = this.getGlobalAlertmessagelist();
            alertmessagelist.removeAll();
            if(this.showNextProxyErrorInWindow) {
                this._unsetShowNextProxyErrorInWindow();
                this.handleProxyUsingHtmlErrorDialog(response, operation);
            } else {
                this.handleProxyErrorNoForm(alertmessagelist, response, operation);
            }
        }
    },



    //
    //
    // Delete deadline
    //
    //
    
    _onDeleteDeadline: function(deadlinePanel, deadlineRecord) {
        Ext.create('devilry_extjsextras.ConfirmDeleteDialog', {
            short_description: Ext.String.format('<strong>{0}</strong>', deadlineRecord.formatDeadline()),
            listeners: {
                scope: this,
                deleteConfirmed: function(deleteDialog) {
                    this._onConfirmDeleteDeadline(deleteDialog, deadlineRecord);
                }
            }
        }).show();
    },

    _onConfirmDeleteDeadline: function(deleteDialog, deadlineRecord) {
        this.getBulkManageDeadlinesPanel().setLoading(gettext('Saving') + ' ...');
        deleteDialog.close();
        this._setShowNextProxyErrorInWindow();
        deadlineRecord.destroy({
            scope: this,
            failure: function() {
                this.getBulkManageDeadlinesPanel().setLoading(false);
                // NOTE: showing the error message is handled in _onDeadlinesBulkStoreProxyError
            },
            success: function() {
                this._unsetShowNextProxyErrorInWindow();
                this._setNoDeadlineSelectedHash();
                deleteDialog.close();
                window.location.reload();
            }
        });
    },


    //
    //
    // Add deadline
    //
    //

    _onAddDeadline: function() {
        this.getNormalBodyContainer().hide();
        this.getAddDeadlineBodyContainer().down('alertmessagelist').removeAll(); // NOTE: We clear the error list, but we keep any values, which makes clicking cancel by mistake less bad.
        this.getAddDeadlineBodyContainer().show();
        this.getAddDeadlineBodyContainer().down('#deadlineField').focus();
        this.getAddDeadlineBodyContainer().down('#createmodeContainer').show();
        var hash = devilry_subjectadmin.utils.UrlLookup.bulkManageAddDeadlines(this.assignment_id);
        this.application.route.setHashWithoutEvent(hash);
    },

    _onCancelAddNewDeadline: function(formpanel) {
        this._unsetActiveDeadlineFormPanel();
        this.getAddDeadlineBodyContainer().hide();
        this.getNormalBodyContainer().show();
        this._setNoDeadlineSelectedHash();
    },

    _onSaveNewDeadline: function(formpanel) {
        this._setActiveDeadlineFormPanel(formpanel);
        formpanel.setLoading(gettext('Saving') + ' ...');
        var form = formpanel.getForm();
        var values = form.getFieldValues();
        var deadlineRecord = Ext.create('devilry_subjectadmin.model.DeadlineBulk');
        deadlineRecord.set('deadline', values.deadline);
        deadlineRecord.set('text', values.text);
        deadlineRecord.set('createmode', values.createmode);
        deadlineRecord.save({
            scope: this,
            callback: function(updatedDeadlineRecord, operation) {
                formpanel.setLoading(false);
                if(operation.success) {
                    updatedDeadlineRecord.updateBulkDeadlineIdFromOperation(operation);
                    var hash = devilry_subjectadmin.utils.UrlLookup.bulkManageSpecificDeadline(
                        this.assignment_id, updatedDeadlineRecord.get('bulkdeadline_id'));
                    this.application.route.setHashWithoutEvent(hash);
                    window.location.reload();
                } else {
                    // NOTE: Failure is handled in _onDeadlinesBulkStoreProxyError()
                }
            }
        });
    }
});
