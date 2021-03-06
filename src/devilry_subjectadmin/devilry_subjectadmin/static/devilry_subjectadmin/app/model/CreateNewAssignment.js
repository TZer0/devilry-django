/** Assignment model. */
Ext.define('devilry_subjectadmin.model.CreateNewAssignment', {
    extend: 'Ext.data.Model',
    idProperty: 'id',
    fields: [
        // Properties that are set directly on the assignment
        {name: 'id',  type: 'int'},
        {name: 'period_id',  type: 'int'},
        {name: 'short_name',  type: 'string'},
        {name: 'long_name',  type: 'string'},
        {name: 'publishing_time',  type: 'date'},
        {name: 'delivery_types',  type: 'string'},
        {name: 'anonymous',  type: 'boolean'},

        // Properties that affect automatically created groups
        {name: 'add_all_relatedstudents',  type: 'boolean'},
        {name: 'first_deadline',  type: 'date'},
        {name: 'autosetup_examiners',  type: 'boolean'}
    ],

    proxy: {
        type: 'rest',
        url: DevilrySettings.DEVILRY_URLPATH_PREFIX + '/devilry_subjectadmin/rest/createnewassignment/',
        extraParams: {
            format: 'json'
        },
        reader: {
            type: 'json'
        }
    }
});
