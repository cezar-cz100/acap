ApplicationConstructor = _Components.Application.extend(
{
    __interface: [ 'openPage', 'closeOperatingDialogs' ],
    
    _loadData_: function( callback )
    {
        var self = this,
            resources = [ 'Configuration', 'Structura', 'Cheltuieli', 'Fonduri' ];
        
        DataResource.load( resources , callback, {
            onErrors: function()
            {
                self._stopLoading();
            }
        });
    },

    _setupElements_: function()    
    {
        this.$workingMonth = this.find( '.working-month' );
    },
    
    _setupResources_: function()
    {
        this.CommandManager = new _Application.Commands( this );
        this.Pages = new _Application.Pages( $( '#application-pages-container' ) );
    },
    
    _setupActions_: function()
    {
        var self = this;
        
        this.find( '.logout-button' ).on( 'click', function(){
            self.command( 'logout' );
        });
        
//        DataResource.get( 'Configuration' ).registerObserver(
//        {
//            firstMonth: function( monthYear )
//            {
//                self._populateWorkingMonth( monthYear );
//            }
//        });
    },
    
    _init_: function()
    {
        //this._populateWorkingMonth( DataResource.get( 'Configuration' ).getWorkingMonth() );
    },
    
    _end_: function()
    {
        
    },
    
    
//    _populateWorkingMonth: function( monthYear )
//    {
//        if( !Object.isObject( monthYear ) ) return;
//        
//        var monthLabel = Date.getMonthName( monthYear.month, monthYear.year );
//        
//        this.$workingMonth.text( monthLabel );
//    }
    
    openPage: function( page, pageOptions )
    {
        this.Pages.open( page, pageOptions );
    },
    
    closeOperatingDialogs: function()
    {
        _Application.OperatingDialog.closeAll();
    }
    
});
