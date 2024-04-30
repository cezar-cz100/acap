var _LunaLucru = {};

(function(){

/* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
 * 
 * - verificare daca prima luna de lucru este deja setata.
 *      - daca da, se afiseaza doar mesajul care indica luna aleasa
 *      - daca nu, se afiseaza formularul
 * - dupa salvarea lunii de lucru, formularul va fi inlocuit de mesajul care indica luna aleasa
 * 
 * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
 */ 
    
_LunaLucru.Module = _Components.Container.extend(
{
    _setup_: function()
    {
        
    },
    
    _setupResources_: function()
    {
        var paneOptions = {
            Module: this
        };
        
        this.Panes = new PanesConstructor( this.find( '>.panes-container' ), {
            paneConstructors: {
                'select-month': [ SelectMonthConstructor, paneOptions ],
                'view-month':   [ ViewMonthConstructor, paneOptions ]
            }
        });
    },
    
    _setMonth: function( monthYear )
    {
        DataResource.get( 'Configuration' ).setFirstMonth( monthYear );
        
        this.Panes.showPane( 'view-month', {
            monthYear: monthYear
        });
        
        this._trigger( 'continue' );
    },
    
    _getMonthLabel: function( monthYear )
    {
        var monthLabel = Date.getMonthName( monthYear.month, monthYear.year );
        
        return monthLabel;
    }
    
});

//------------------------------------------------------------------------------

var PanesConstructor = _Components.Panes.extend(
{
    _end_: function()
    {
        // decide what pane to show
        
        var paneId = DataResource.get( 'Configuration' ).getFirstMonth() ?
            'view-month' :
            'select-month';
    
        this.showPane( paneId );
    }
    
});

//------------------------------------------------------------------------------

var SelectMonthConstructor = _Components.RequestForm.extend(
{
    action: null,
    
    _setup_: function()
    {
        this.Module = this._options.Module;
    },
    
    _setupElements_: function()
    {
        this.$message = this.find( '.confirm-message' ).remove();
        this.$monthLabel = this.$message.find( '.month-label' );
        
        this.$selectMonth = this.getField( 'month' );
        this.$selectYear = this.getField( 'year' );
        
        this._populateDates();
    },
    
    _setupActions_: function()
    {
        var self = this;
        
        this.addHandler( 'beforeSubmit', function( event )
        {
            var formParams = event.getArguments()[ 0 ];
            
            event.abort();
            
            System.confirm( self._getConfirmMessage( formParams ), {
                yes: function()
                {
                    System.request({
                        action: 'set-first-month',
                        params: formParams,
                        onSuccess: function()
                        {
                            self.Module._setMonth( formParams );
                        }
                    });
                }
            });
        });
        
        this.$selectYear.on( 'change', function()
        {
            var selectedYear = $(this).val(),
                currentYear = Date.getCurrentYear();
            
            if( selectedYear == currentYear )
            {
                self._hideFutureMonths();
            }
            else
            {
                self._showAllMonths();
            }
        });
    },
    
    _getConfirmMessage: function( month )
    {
        var message;
        
        this.$monthLabel.text( this.Module._getMonthLabel( month ) );
        message = this.$message.html();
        
        return message;
    },
    
    _populateDates: function()
    {
        var self = this,
            $option = $( '<option>' ),
            currentMonth = Date.getCurrentMonth(),
            currentYear = Date.getCurrentYear();
        
        Object.each( Date.getMonths(), function( monthIndex, monthName )
        {
            var $opt = $option.clone();
            
            $opt.val( monthIndex );
            $opt.text( monthName );
            
            if( monthIndex == currentMonth )
            {
                $opt.prop( 'selected', true );
            }
            
            self.$selectMonth.append( $opt );
        });
        
        for( var year = currentYear; year >= currentYear - 3; year-- )
        {
            var $opt = $option.clone();
            
            $opt.val( year );
            $opt.text( year );
            
            if( year == currentYear )
            {
                $opt.prop( 'selected', true );
            }
            
            self.$selectYear.append( $opt );
        };
        
        this._hideFutureMonths();
    },
    
    _hideFutureMonths: function()
    {
        var currentMonth = Date.getCurrentMonth(),
            selectCurrentMonth = false;
        
        this.$selectMonth.children().filter( function() {
            var $option = $(this),
                month = $option.val();
                
            if( month - currentMonth > 0 )
            {
                $option.hide();
                
                if( $option.prop( 'selected' ) )
                {
                    $option.prop( 'selected', false );
                    selectCurrentMonth = true;
                }
            }
            else
            {
                $option.show();
            }
        });
        
        if( selectCurrentMonth )
        {
            this.$selectMonth.val( currentMonth );
        }
    },
    
    _showAllMonths: function()
    {
        this.$selectMonth.children().show();
    }
    
});

//------------------------------------------------------------------------------

var ViewMonthConstructor = _Components.Container.extend(
{
    _setup_: function()
    {
        this.Module = this._options.Module;
    },
    
    _setupElements_: function()
    {
        this.$monthLabel = this.find( '.month-label' );
    },
    
    _init_: function()
    {
        // populare nume luna
        this._populateMonthLabel( DataResource.get( 'Configuration' ).getFirstMonth() );
    },
    
    _parameters_: function( params )
    {
        if( params.monthYear )
        {
            this._populateMonthLabel( params.monthYear );
        }
    },
    
    _populateMonthLabel: function( monthYear )
    {
        if( !Object.isObject( monthYear ) ) return;
        
        var monthLabel = this.Module._getMonthLabel( monthYear );
        
        this.$monthLabel.text( monthLabel );

    }
});

})();
