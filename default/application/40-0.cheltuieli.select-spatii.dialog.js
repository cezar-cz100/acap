(function(){
    
var SelectSpatiiDialogClass = _Application.OperatingDialog.extend(
{
    _setup_: function()
    {
        this.onSelectCallback = null;
        this.returnType = null;
    },
    
    _setupResources_: function()
    {
        this.SpatiiPanel = new _Spatii.SpatiiPanel( this.find( '.spatii-panel-component' ) );
    },
    
    /**
     * @option scaraId - scara pentru care se afiseaza spatiile
     * @option viewAll - se afiseaza toate scarile, una dupa alta
     * @option spatii - doar unele spatii pot fi afisate
     * @option parametru - parametrul spatiilor
     * @option operation - modul de operare
     * @option selection - se pot selecta unele spatii, scari sau blocuri
     * @option onSelect - actiunea care are loc in momentul inchiderii dialogului
     */
    _open_: function( options )
    {
        var spatiiPanelParameters = {};
        
        if( options.parametru === undefined )
        {
            System.exception( ExceptionCodes.UNDEFINED_PARAMETER, { parameter: 'parametru' }, 7 );
        }
        
        if( options.onSelect === undefined )
        {
            System.exception( ExceptionCodes.UNDEFINED_PARAMETER, { parameter: 'onSelect' }, 7 );
        }
        
        if( options.scaraId )
        {
            var viewMode = 'scara',
                viewParams = { scaraId: options.scaraId };
        
            options.returnSpatiiList = true;
        }
        else if( options.viewAll )
        {
            viewMode = 'all';
            viewParams = null;
        }
        else
        {
            System.exception( ExceptionCodes.UNDEFINED_PARAMETER, { parameter: 'scaraId OR viewAll' }, 7 );
        }
        
        this.onSelectCallback = options.onSelect;
        
        this.returnType = options.returnSpatiiList ?
                _Spatii.SpatiiPanel.RETURN_SPATII_LIST :
                null;
        
        var operatingParams = {};
        
        if( options.selection !== undefined )
        {
            operatingParams.selection = options.selection;
        }
        
        if( options.inputCellHeader !== undefined )
        {
            operatingParams.headerTitle = options.inputCellHeader;
        }
        
        spatiiPanelParameters = {
            parametruSpatii:    options.parametru,
            showSpatii:         options.spatii,
            operatingMode:      options.operation || 'select',
            operatingParams:    operatingParams,
            viewMode:           viewMode,
            viewParams:         viewParams
        };
        
        this.SpatiiPanel.render( spatiiPanelParameters );
    },
    
    _reset_: function()
    {
        this.onSelectCallback = null;
        this.SpatiiPanel.reset();
    },
    
    _doAction: function()
    {
        var selection = this.getSelection();
        
        if( Object.isFunction( this.onSelectCallback ) )
        {
            this.onSelectCallback.call( this, selection );
        }
        
        this.close();
    },
    
    getSelection: function()
    {
        return this.SpatiiPanel.getSelection( this.returnType );
    }
    
});

_Components.Class.Singleton( SelectSpatiiDialogClass, function(){ return [ $( '#spatii-selection-dialog' ) ]; } );

//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

_Cheltuieli.SelectSpatiiDialog = SelectSpatiiDialogClass;

})();