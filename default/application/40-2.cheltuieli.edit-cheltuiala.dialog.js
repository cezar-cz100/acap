(function(){

_Cheltuieli.EditCheltuialaDialog = _Application.OperatingDialog.extend(
{
    cheltuieliTitles: {
        cheltuieli_gospodaresti: 'cheltuiala gospodărească',
        salarii:                'salariul',
        energie_electrica:      'factura de energie electrică',
        intretinere_ascensor:   'factura pentru înteţinerea ascensoarelor',
        autorizatie_ascensor:   'factura pentru autorizarea ascensoarelor',
        lucrari_ascensor:       'factura pentru lucrări la ascensoare',
        salubrizare:            'factura pentru salubrizare',
        gaze_naturale:          'factura pentru gaze naturale',
        reparatie:              'cheltuiala pentru reparaţii sau renovări'
    },
    
    _setup_: function()
    {
        this.titleTemplate = this.getContainer().attr( 'title' );
        this.cheltuialaId = null;
        this.CheltuieliData = DataResource.get( 'Cheltuieli' );
    },
    
    _setupResources_: function()
    {
        this.TipuriPanes    = new TipuriPanesClass( this.find( '.tipuri-cheltuieli-panes-wrapper' ) );
    },
    
    _init_: function()
    {
        this._hideCloseButton();
    },
    
    /**
     * @param cheltuialaId
     */
    open: function( options )
    {
        options = Object.makeObject( options );
        
        if( options.cheltuialaId === undefined )
        {
            System.exception( ExceptionCodes.UNDEFINED_PARAMETER, { parameter: 'cheltuialaId' } );
        }
        
        this.cheltuialaId = options.cheltuialaId;
        
        this.updateTitle();
        
        this._super.apply( this, arguments );
    },
    
    _parameters_: function( params )
    {
        if( params.cheltuialaId !== undefined )
        {
            this.setCheltuialaId( params.cheltuialaId );
        }
    },
    
    setCheltuialaId: function( cheltuialaId )
    {
        var cheltuialaData = this.CheltuieliData.getCheltuialaData( cheltuialaId );
        
        this.TipuriPanes.displayContent( cheltuialaData );
    },
    
    getCheltuialaId: function()
    {
        return this.cheltuialaId;
    },
    
    _doAction: function()
    {
        var DataValidator = this.getDataValidator();
        
        if( DataValidator.isValid() )
        {
            var cheltuialaData = DataValidator.getData(),
                parametriCheltuiala = cheltuialaData.parametri;
            
            this.submitData( parametriCheltuiala );
        }
        else
        {
            this.showError( DataValidator.getError() );
        }
    },
    
    getDataValidator: function()
    {
        return this.TipuriPanes.getValidator();
    },
    
    submitData: function( parametriCheltuiala )
    {
        var self = this,
            cheltuialaId = this.getCheltuialaId();
        
        var requestOptions = 
        {
            action: 'edit-cheltuiala',
            params: {
                id:         cheltuialaId,
                parametri:  parametriCheltuiala
            },
            onSuccess: function( cheltuialaData )
            {
                self.CheltuieliData.editCheltuiala( cheltuialaData );
                self.close();
                
                System.info( 'Cheltuiala a fost corectată.' );
            }
        };
        
        System.request( requestOptions );
    },
    
    showError: function( error )
    {
        System.alert( error );
    },
    
    updateTitle: function()
    {
        var tipCheltuiala = this.CheltuieliData.getCheltuialaData( this.cheltuialaId ).tip_id,
            cheltuialaTitle = this.cheltuieliTitles[ tipCheltuiala ];
        
        this.setTitle( this.titleTemplate.assign( { titlu: cheltuialaTitle } ) );
    }
    
});

_Components.Class.Singleton( _Cheltuieli.EditCheltuialaDialog, function() {
    return [ $( '#edit-cheltuiala-dialog' ) ];
});

//==============================================================================

var TipuriPanesClass = _Components.Panes.extend(
{
    __interface: [ 'displayContent', 'getValidator' ],
    
    _setup_: function()
    {
        this._options.paneConstructorClass = __FormPaneClass;
        
        this._options.paneConstructors = {
            cheltuieli_gospodaresti: CheltuieliGospodarestiPaneClass,
            salarii:                SalariiPaneClass,
            energie_electrica:      EnergieElectricaPaneClass,
            intretinere_ascensor:   IntretinereAscensorPaneClass,
            autorizatie_ascensor:   AutorizatieAscensorPaneClass,
            lucrari_ascensor:       LucrariAscensorPaneClass,
            salubrizare:            SalubrizarePaneClass,
            gaze_naturale:          GazeNaturalePaneClass,
            reparatie:              ReparatiiPaneClass
        };
    },
    
    displayContent: function( cheltuialaData )
    {
        this.showPane( cheltuialaData.tip_id, { cheltuialaData: cheltuialaData } );        
    },
    
    getValidator: function()
    {
        var Pane = this.getCurrentPaneObject();
        
        return Pane.getValidator();
    }
    
});

//------------------------------------------------------------------------------

/**
 * @abstract
 */
var __FormPaneClass = _Components.Container.extend(
{
    __interface: [ 'getValidator' ],
    __abstract: [ 'populateContent' ],
    
    _setup_: function()
    {
        this.cheltuialaData = null;
        this.Form = null;
    },
    
    _init_: function()
    {
        if( this.Form === null )
        {
            System.exception( ExceptionCodes.UNDEFINED_PARAMETER, { parameter: 'Form' } );
        }
    },
    
    _parameters_: function( params )
    {
        if( params.cheltuialaData !== undefined )
        {
            this.populateContent( params.cheltuialaData );
        }
    },
    
    getValidator: function()
    {
        return this.Form.getValidator();
    },
    
    populateContent: function( cheltuialaData )
    {
        this.Form.populateContent( cheltuialaData );
    }
    
});

//==============================================================================

var CheltuieliGospodarestiPaneClass = __FormPaneClass.extend(
{
    _setupResources_: function()
    {
        this.Form = new _Cheltuieli.CheltuieliGospodarestiForm( this.find( '.tip-cheltuiala-form-frame' ) );
    }
    
});

//==============================================================================

var SalariiPaneClass = __FormPaneClass.extend(
{
    _setupResources_: function()
    {
        this.Form = new _Cheltuieli.SalariiForm( this.find( '.tip-cheltuiala-form-frame' ) );
    }
    
});

//==============================================================================

var ReparatiiPaneClass = __FormPaneClass.extend(
{
    _setupResources_: function()
    {
        this.Form = new _Cheltuieli.ReparatiiForm( this.find( '.tip-cheltuiala-form-frame' ) );
    }
    
});

//==============================================================================

var EnergieElectricaPaneClass = __FormPaneClass.extend(
{
    _setupResources_: function()
    {
        this.Form = new _Cheltuieli.EnergieElectricaForm( this.find( '.tip-cheltuiala-form-frame' ) );
    }
    
});

//==============================================================================

var IntretinereAscensorPaneClass = __FormPaneClass.extend(
{
    _setupResources_: function()
    {
        this.Form = new _Cheltuieli.AscensoareForm( this.find( '.tip-cheltuiala-form-frame' ) );
    }
    
});

//==============================================================================

var AutorizatieAscensorPaneClass = __FormPaneClass.extend(
{
    _setupResources_: function()
    {
        this.Form = new _Cheltuieli.AscensoareForm( this.find( '.tip-cheltuiala-form-frame' ) );
    }
    
});

//==============================================================================

var LucrariAscensorPaneClass = __FormPaneClass.extend(
{
    _setupResources_: function()
    {
        this.Form = new _Cheltuieli.AscensoareForm( this.find( '.tip-cheltuiala-form-frame' ) );
    }
    
});

//==============================================================================

var SalubrizarePaneClass = __FormPaneClass.extend(
{
    _setupResources_: function()
    {
        this.Form = new _Cheltuieli.SalubrizareForm( this.find( '.tip-cheltuiala-form-frame' ) );
    }
    
});

//==============================================================================

var GazeNaturalePaneClass = __FormPaneClass.extend(
{
    _setupResources_: function()
    {
        this.Form = new _Cheltuieli.GazeNaturaleForm( this.find( '.tip-cheltuiala-form-frame' ) );
    }
    
});

//==============================================================================

})();
