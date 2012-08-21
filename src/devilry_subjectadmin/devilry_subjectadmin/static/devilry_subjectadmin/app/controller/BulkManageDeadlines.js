Ext.define('devilry_subjectadmin.controller.BulkManageDeadlines', {
    extend: 'Ext.app.Controller',

    mixins: [
        'devilry_subjectadmin.utils.DjangoRestframeworkLoadFailureMixin'
    ],

    views: [
        'bulkmanagedeadlines.BulkManageDeadlinesPanel',
        'bulkmanagedeadlines.DeadlinePanel'
    ],

    models: [
        //'DeadlineBulk'
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
    }],

    init: function() {
        this.control({
            'viewport bulkmanagedeadlinespanel #globalAlertmessagelist': {
                render: this._onRender
            }
        });
    },

    _onRender: function() {
        this.getBulkManageDeadlinesPanel().setLoading();
        var assignment_id = this.getBulkManageDeadlinesPanel().assignment_id;
        var store = this.getDeadlinesBulkStore();
        store.proxy.setUrl(assignment_id);
        store.load({
            scope: this,
            callback: function(records, operation) {
                this.getBulkManageDeadlinesPanel().setLoading(false);
                if(operation.success) {
                    this._onLoadSuccess(records, operation);
                } else {
                    this.onLoadFailure(operation);
                }
            }
        });
    },

    _onLoadSuccess: function(deadlineRecords, operation) {
        console.log('Loaded', deadlineRecords);
        this._populateDeadlinesContainer(deadlineRecords);
    },

    _populateDeadlinesContainer: function(deadlineRecords) {
        var deadlinepanels_rendered = 0;
        Ext.Array.each(deadlineRecords, function(deadlineRecord) {
            this.getDeadlinesContainer().add({
                xtype: 'bulkmanagedeadlines_deadline',
                deadlineRecord: deadlineRecord,
                listeners: {
                    scope: this,
                    single: true,
                    render: function(panel, eOpts) {
                        deadlinepanels_rendered ++;
                        if(deadlinepanels_rendered == deadlineRecords.length) {
                            this._onAllDeadlinePanelsRendered();
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
        }
    },

    _expandDeadlineById: function(id) {
        var itemid = Ext.String.format('#deadline-{0}', id);
        var deadlinePanel = this.getDeadlinesContainer().down(itemid);
        deadlinePanel.expand();
        deadlinePanel.el.scrollIntoView(this.getBulkManageDeadlinesPanel().body, false, true);
    }
});
