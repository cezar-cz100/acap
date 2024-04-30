/* global ExceptionCodes, System, DataResource, _Components, _Cheltuieli */

(function(){

var ConfirmAddCheltuialaDialogClass = _Application.OperatingDialog.extend(
{
    _setup_: function()
    {
        this.cheltuialaData = null;
    },
    
    _setupElements_: function()
    {
        this.$editButton = this.find( '.edit-button' );
    },
    
    _setupResources_: function()
    {
        this.TipuriPanes = new DetailsPanesClass( this.find( '.tipuri-cheltuieli-panes-wrapper' ) );
    },
    
    _setupActions_: function()
    {
        this.bindEditAction();
    },
    
    _init_: function()
    {
        this._hideCloseButton();
    },
    
    _reset_: function()
    {
        
    },
    
    _open_: function( cheltuialaData )
    {
        var tipCheltuiala = cheltuialaData.tip_id,
            idCheltuiala = cheltuialaData.id,
            parametriCheltuiala = cheltuialaData.parametri;
        
        if( tipCheltuiala === undefined )
        {
            System.exception( ExceptionCodes.UNDEFINED_PARAMETER, { parameter: 'cheltuialaData.tip_id' } );
        }
        
        if( idCheltuiala === undefined )
        {
            System.exception( ExceptionCodes.UNDEFINED_PARAMETER, { parameter: 'cheltuialaData.id' } );
        }
        
        if( parametriCheltuiala === undefined )
        {
            System.exception( ExceptionCodes.UNDEFINED_PARAMETER, { parameter: 'cheltuialaData.parametri' } );
        }
        
        this.setCheltuialaData( cheltuialaData );
    },
    
    bindEditAction: function()
    {
        var self = this;
        
        this.$editButton.on( 'click', function()
        {
            self.editCheltuiala();
        });
    },
    
    _doAction: function()
    {
        this.saveCheltuiala();
    },
    
    _doCancel: function()
    {
        this._super();
        
        this.discardCheltuiala();
    },
    
    editCheltuiala: function()
    {
        this.close();
        this._trigger( 'edit' );
    },
    
    saveCheltuiala: function()
    {
        var self = this;
        
        var requestOptions = 
        {
            action: 'confirm-cheltuiala',
            params: {
                id: self.getCheltuialaData().id
            },
            onSuccess: function()
            {
                var cheltuialaData = self.getCheltuialaData();
                
                DataResource.get( 'Cheltuieli' ).addCheltuiala( cheltuialaData );
                self._trigger( 'save' );
                self.close();

                System.info( 'Cheltuiala "{descriere}" în valoare de {valoare} lei a fost înregistrată cu succes.'.assign({
                    descriere:  cheltuialaData.parametri.descriere.escapeHTML(),
                    valoare:    Number.formatCurrency( cheltuialaData.parametri.valoare )
                }));
            }
        };
        
        System.request( requestOptions );
    },
    
    discardCheltuiala: function()
    {
        this._trigger( 'discard' );
        this.close();
    },
    
    setCheltuialaData: function( cheltuialaData )
    {
        this.cheltuialaData = cheltuialaData;
        
        this.displayConfirmation( cheltuialaData );
    },
    
    getCheltuialaData: function()
    {
        return this.cheltuialaData;
    },
    
    displayConfirmation: function( cheltuialaData )
    {
        this.TipuriPanes.showPane( cheltuialaData.tip_id, { cheltuialaData: cheltuialaData } );
    }
    
});

_Components.Class.Singleton( ConfirmAddCheltuialaDialogClass, function() {
    return [ $( '#confirm-cheltuiala-dialog' ) ];
});

//==============================================================================

var DetailsPanesClass = _Components.Panes.extend(
{
    _setup_: function()
    {
        this._options.paneConstructorClass = __DetailsPaneClass;
        
        var paneClasses = {
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
        
        this._options.paneConstructors = paneClasses;
    }
    
});

//------------------------------------------------------------------------------

var __DetailsPaneClass = _Components.Container.extend(
{
    _setup_: function()
    {
        this.cheltuialaData = null;
        this.DetailsFrame = null;
    },
    
    _init_: function()
    {
        if( this.DetailsFrame === null )
        {
            System.exception( ExceptionCodes.UNDEFINED_PARAMETER, { parameter: 'DetailsFrame' } );
        }
    },
    
    _parameters_: function( params )
    {
        if( params.cheltuialaData !== undefined )
        {
            this.setCheltuialaData( params.cheltuialaData );
        }
    },
    
    setCheltuialaData: function( cheltuialaData )
    {
        this.cheltuialaData = cheltuialaData;
        
        this.DetailsFrame.setCheltuialaData( cheltuialaData );
    }
    
});

//==============================================================================

var CheltuieliGospodarestiPaneClass = __DetailsPaneClass.extend(
{
    _setupResources_: function()
    {
        this.DetailsFrame = new _Cheltuieli.CheltuieliGospodarestiDetails( this.find( '.tip-cheltuiala-details-frame' ) );
    }
});

//==============================================================================

var SalariiPaneClass = __DetailsPaneClass.extend(
{
    _setupResources_: function()
    {
        this.DetailsFrame = new _Cheltuieli.SalariiDetails( this.find( '.tip-cheltuiala-details-frame' ) );
    }
});

//==============================================================================

var ReparatiiPaneClass = __DetailsPaneClass.extend(
{
    _setupResources_: function()
    {
        this.DetailsFrame = new _Cheltuieli.ReparatiiDetails( this.find( '.tip-cheltuiala-details-frame' ) );
    }
});

//==============================================================================

var EnergieElectricaPaneClass = __DetailsPaneClass.extend(
{
    _setupResources_: function()
    {
        this.DetailsFrame = new _Cheltuieli.EnergieElectricaDetails( this.find( '.tip-cheltuiala-details-frame' ) );
    }
});

//==============================================================================

var IntretinereAscensorPaneClass = __DetailsPaneClass.extend(
{
    _setupResources_: function()
    {
        this.DetailsFrame = new _Cheltuieli.IntretinereAscensorDetails( this.find( '.tip-cheltuiala-details-frame' ) );
    }
});

//==============================================================================

var AutorizatieAscensorPaneClass = __DetailsPaneClass.extend(
{
    _setupResources_: function()
    {
        this.DetailsFrame = new _Cheltuieli.AutorizatieAscensorDetails( this.find( '.tip-cheltuiala-details-frame' ) );
    }
});

//==============================================================================

var LucrariAscensorPaneClass = __DetailsPaneClass.extend(
{
    _setupResources_: function()
    {
        this.DetailsFrame = new _Cheltuieli.LucrariAscensorDetails( this.find( '.tip-cheltuiala-details-frame' ) );
    }
});

//==============================================================================

var SalubrizarePaneClass = __DetailsPaneClass.extend(
{
    _setupResources_: function()
    {
        this.DetailsFrame = new _Cheltuieli.SalubrizareDetails( this.find( '.tip-cheltuiala-details-frame' ) );
    }
});

//==============================================================================

var GazeNaturalePaneClass = __DetailsPaneClass.extend(
{
    _setupResources_: function()
    {
        this.DetailsFrame = new _Cheltuieli.GazeNaturaleDetails( this.find( '.tip-cheltuiala-details-frame' ) );
    }
});

//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

_Cheltuieli.ConfirmAddCheltuialaDialog = ConfirmAddCheltuialaDialogClass;

})();
