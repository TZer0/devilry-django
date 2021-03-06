/**
 * Based on http://www.sencha.com/forum/showthread.php?134345-Ext.ux.form.field.DateTime
 */
Ext.define('devilry_extjsextras.form.DateTimeField', {
    extend:'Ext.form.FieldContainer',
    mixins:{    
        field:'Ext.form.field.Field'
    },
    alias: 'widget.devilry_extjsextras-datetimefield',
        
    //configurables
    
    combineErrors: true,
    msgTarget: 'under',    
    layout: 'hbox',
    readOnly: false,

    /**
     * @cfg {Object} dateConfig
     * Additional config options for the date field.
     */
    dateConfig:{},

    /**
     * @cfg {Object} timeConfig
     * Additional config options for the time field.
     */
    timeConfig:{},

    /**
     * @cfg {string} dateFieldEmptyText ``emptyText`` attribute for the date field.
     */
    dateFieldEmptyText: pgettext('extjs date emptytext', 'YYYY-MM-DD'),

    /**
     * @cfg {string} dateFieldEmptyText ``emptyText`` attribute for the time field.
     */
    timeFieldEmptyText: pgettext('extjs time emptytext', 'hh:mm'),
    
    // properties
    
    dateValue: null, // Holds the actual date
    /**
     * @property dateField
     * @type Ext.form.field.Date
     */
    dateField: null,
    /**
     * @property timeField
     * @type Ext.form.field.Time
     */
    timeField: null,

    initComponent: function(){
        var me = this
            ,i = 0
            ,key
            ,tab;
            
        me.items = me.items || [];
        
        this.childrenRendered = 0;
        me.dateField = Ext.create('devilry_extjsextras.form.DateField', Ext.apply({
            flex:1,
            isFormField:false, //exclude from field query's
            emptyText: this.dateFieldEmptyText,
            submitValue:false,
            listeners: {
                scope: this,
                render: this._onChildRender
            }
        }, me.dateConfig));
        me.items.push(me.dateField);
        
        me.timeField = Ext.create('devilry_extjsextras.form.TimeField', Ext.apply({
            flex:1,
            isFormField:false, //exclude from field query's
            emptyText: this.timeFieldEmptyText,
            submitValue:false,
            listeners: {
                scope: this,
                render: this._onChildRender
            }
        }, me.timeConfig));
        me.items.push(me.timeField);
        
        for (; i < me.items.length; i++) {
            me.items[i].on('focus', Ext.bind(me.onItemFocus, me));
            me.items[i].on('blur', Ext.bind(me.onItemBlur, me));
            //me.items[i].on('specialkey', function(field, event){
                //key = event.getKey();
                //tab = key == event.TAB;
                
                //if (tab && me.focussedItem == me.dateField) {
                    //event.stopEvent();
                    //me.timeField.focus();
                    //return;
                //}
                
                //me.fireEvent('specialkey', field, event);
            //});
        }

        me.callParent();
        
        // this dummy is necessary because Ext.Editor will not check whether an inputEl is present or not
        this.inputEl = {
            dom:{},
            swallowEvent:function(){}
        };
        
        me.initField();
    },

    _onChildRender: function() {
        this.childrenRendered ++;
        if(this.childrenRendered == 2) {
            this.fireEvent('allRendered', this);
        }
    },
    
    focus:function(){
        this.callParent();
        this.dateField.focus();
    },

    onItemFocus:function(item){
        if (this.blurTask){
            this.blurTask.cancel();
        }
        this.focussedItem = item;
    },
    
    onItemBlur:function(item){
        var me = this;
        if (item != me.focussedItem){ return; }
        // 100ms to focus a new item that belongs to us, otherwise we will assume the user left the field
        me.blurTask = new Ext.util.DelayedTask(function(){
            me.fireEvent('blur', me);
        });
        me.blurTask.delay(100);
    },
    
    getValue: function(){
        var value = null
            ,date = this.dateField.getSubmitValue()
            ,time = this.timeField.getSubmitValue()
            ,format;

        if (date){
            if (time){
                format = this.getFormat();
                value = Ext.Date.parse(date + ' ' + time, format);
            } else {   
                value = this.dateField.getValue();
            }
        }
        return value;
    },
    
    getSubmitValue: function(){   
        var me = this
            ,format = me.getFormat()
            ,value = me.getValue();
            
        return value ? Ext.Date.format(value, format) : null;        
    },
 
    setValue: function(value){    
        if (Ext.isString(value)){
            value = Ext.Date.parse(value, this.getFormat()); //this.dateTimeFormat
        }
        this.dateField.setValue(value);
        this.timeField.setValue(value);
    },
    
    getFormat: function(){
        return (this.dateField.submitFormat || this.dateField.format) + " " + (this.timeField.submitFormat || this.timeField.format);
    },
    
    // Bug? A field-mixin submits the data from getValue, not getSubmitValue
    getSubmitData: function(){
        var me = this
            ,data = null;
            
        if (!me.disabled && me.submitValue && !me.isFileUpload()) {
            data = {};
            data[me.getName()] = '' + me.getSubmitValue();
        }
        return data;
    },

    isValid: function() {
        return this.dateField.isValid() && this.timeField.isValid();
    }
});
