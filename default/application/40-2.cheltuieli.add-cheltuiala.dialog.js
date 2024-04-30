(function(){

var AddCheltuialaDialogClass = _Application.OperatingDialog.extend(
{
    _setup_: function()
    {
        this.categorie = null;
    },
    
    _setupResources_: function()
    {
        this.CategoriiChoices   = new CategoriiChoicesClass( this.find( '.categorii-cheltuieli-choices-wrapper' ) );
        this.CategoriiPanes     = new CategoriiPanesClass( this.find( '.categorii-cheltuieli-panes-wrapper' ) );
        this.DataValidator      = new DataValidatorClass( this );
        this.ConfirmDialog      = _Cheltuieli.ConfirmAddCheltuialaDialog.getInstance();
    },
    
    _setupActions_: function()
    {
        this.bindSelectCategorieAction();
        this.setupConfirmDialogEvents();
    },
    
    _reset_: function()
    {
        this.categorie = null;
        this.CategoriiChoices.reset();
        this.CategoriiPanes.reset();
    },
    
    bindSelectCategorieAction: function()
    {
        var self = this;
        
        this.CategoriiChoices.addHandler( 'select', function( event, categorie )
        {
            self.setCategorie( categorie, false );
        });
    },
    
    setupConfirmDialogEvents: function()
    {
        var self = this;
        
        this.ConfirmDialog.addHandler({
            save: function()
            {
                self.close();
            },
            edit: function()
            {
                // do nothing
            },
            discard: function()
            {
                self.reset();
            }
        });
    },
    
    setCategorie: function( categorie, updateView )
    {
        if( updateView === undefined )
        {
            updateView = true;
        }
        
        this.categorie = categorie;
        
        if( updateView )
        {
            this.CategoriiChoices.setCategorie( categorie );
        }
        
        this.CategoriiPanes.showPane( categorie );
    },
    
    getCategorie: function()
    {
        return this.categorie;
    },
    
    getCategorieValidator: function()
    {
        return this.CategoriiPanes.getValidator();
    },
    
    _doAction: function()
    {
        if( this.DataValidator.isValid() )
        {
            this.submitData( this.DataValidator.getData() );
        }
        else
        {
            this.showError( this.DataValidator.getError() );
        }
    },
    
    submitData: function( data )
    {
        var self = this;
        
        var requestOptions = 
        {
            action: 'add-cheltuiala',
            params: data,
            onSuccess: function( cheltuialaData )
            {
                self.confirmAdding( cheltuialaData );
            }
        };
        
        System.request( requestOptions );
    },
    
    confirmAdding: function( cheltuialaData )
    {
        this.ConfirmDialog.open( cheltuialaData );
    }
    
});

_Components.Class.Singleton( AddCheltuialaDialogClass, function() {
    return [ $( '#add-cheltuiala-dialog' ) ];
});

//==============================================================================

var DataValidatorClass = _Components.DataValidator.extend(
{
    _validate: function()
    {
        // se verifică dacă a fost selectată categoria cheltuielii
        var categorie = this.Context.getCategorie();
        
        if( !categorie )
        {
            this._setError( 'Alegeţi categoria cheltuielii' );
        }
        else
        {
            // se verifica daca datele completate sunt corecte
            var CategorieValidator = this.Context.getCategorieValidator();
        
            this._attachValidator( CategorieValidator );
        }
    }
});

//==============================================================================

var CategoriiChoicesClass = _Components.Container.extend(
{
    __interface: [ 'setCategorie' ],
    
    _setupElements_: function()
    {
        this.$choices = this.find( 'input[name=_categorie-cheltuiala]' );
    },
    
    _setupActions_: function()
    {
        this.bindSelectCategorieAction();
    },
    
    _reset_: function()
    {
        this.clearChoices();
    },
    
    bindSelectCategorieAction: function()
    {
        var self = this;
        
        this.$choices.on( 'change', function()
        {
            var categorie = $(this).val();
            
            self._trigger( 'select', categorie );
        });
    },
    
    clearChoices: function()
    {
        this.$choices.prop( 'checked', false );
    },
    
    getCategorie: function()
    {
        return this.$choices.filter( ':checked' ).val();
    },
    
    setCategorie: function( categorie )
    {
        this.$choices.filter( function(){ return $(this).val() == categorie; } ).prop( 'checked', true );
    }
    
});

//==============================================================================

var CategoriiPanesClass = _Components.Panes.extend(
{
    __interface: [ 'getValidator' ],
    
    _setup_: function()
    {
        this._options.paneConstructorClass = __CategoriePaneClass;
        
        this._options.paneConstructors = {
            administrativ:      CategorieAdministrativPaneClass,
            utilitate_publica:  CategorieUtilitatePublicaPaneClass,
            reparatie:          CategorieReparatiiPaneClass,
            ascensoare:         CategorieAscensoarePaneClass
        };
        
        this.addHandler( 'showPane', function( event, paneId, Pane )
        {
            Pane && Pane.reset();
        });
        
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
var __CategoriePaneClass = _Components.Container.extend(
{
    __interface: [ 'getValidator' ],
    
    __abstract: [ 'getValidator' ]
    
});

//==============================================================================

var __TipCheltuialaPaneClass = _Components.Container.extend(
{
    _setup_: function()
    {
        this.FormFrame = null;
        
        this.FormClass = null;
    },
    
    _setupResources_: function()
    {
        if( !_Components.Class.isExtendedFrom( this.FormClass, _Cheltuieli.__TipCheltuialaForm ) )
        {
            System.exception( ExceptionCodes.UNDEFINED_PARAMETER, { parameter: 'FormClass' } );
        }
        
        this.FormFrame = new this.FormClass( this.find( '.tip-cheltuiala-form-frame' ) );
    },
    
    _reset_: function()
    {
        this.FormFrame.reset();
    },
    
    getValidator: function()
    {
        return this.FormFrame.getValidator();
    }
    
});

//==============================================================================

var CategorieAdministrativPaneClass = __CategoriePaneClass.extend(
{
    __interface: [ 'getTipCheltuiala' ],
    
    _setup_: function()
    {
        this.tipCheltuiala = null;
    },
    
    _setupResources_: function()
    {
        this.TipCheltuialaChoices   = new CheltuieliAdministrativeChoicesClass( this.find( '.tipuri-cheltuieli-choices-section' ) );
        this.TipCheltuialaPanes     = new CheltuieliAdministrativePanesClass( this.find( '.tipuri-cheltuieli-wrapper' ) );
        
        this.Validator = new CheltuieliAdministrativeValidatorClass( this );
    },
    
    _setupActions_: function()
    {
        this.setupSelectTipCheltuialaAction();
    },
    
    _init_: function()
    {
        this.TipCheltuialaPanes.hide();
    },
    
    _reset_: function()
    {
        this.setTipCheltuiala( null );
    },
    
    getValidator: function()
    {
        return this.Validator;
    },
    
    setupSelectTipCheltuialaAction: function()
    {
        var self = this;
        
        this.TipCheltuialaChoices.addHandler( 'select', function( event, tipCheltuiala )
        {
            self.setTipCheltuiala( tipCheltuiala );
        });
    },
    
    setTipCheltuiala: function( tipCheltuiala )
    {
        if( Object.isEmpty( tipCheltuiala ) )
        {
            this.TipCheltuialaPanes.hide();
            this.TipCheltuialaChoices.clearChoices();
            
            this.tipCheltuiala = null;
        }
        else
        {
            this.TipCheltuialaPanes.show();
            this.TipCheltuialaPanes.showPane( tipCheltuiala );
            
            this.tipCheltuiala = tipCheltuiala;
        }
    },
    
    getTipCheltuiala: function()
    {
        return this.tipCheltuiala;
    }
    
});

//------------------------------------------------------------------------------

var CheltuieliAdministrativeChoicesClass = _Components.Container.extend(
{
    __interface: [ 'clearChoices' ],
    
    _setupElements_: function()
    {
        this.$choices = this.find( 'input[name=_tip-cheltuiala-administrativ]' );
    },
    
    _setupActions_: function()
    {
        this.bindSelectTipCheltuialaAction();
    },
    
    _reset_: function()
    {
        this.clearChoices();
    },
    
    bindSelectTipCheltuialaAction: function()
    {
        var self = this;
        
        this.$choices.on( 'change', function()
        {
            var tipCheltuiala = $(this).val();
            
            self._trigger( 'select', tipCheltuiala );
        });
    },
    
    clearChoices: function()
    {
        this.$choices.prop( 'checked', false );
    }
    
});

//------------------------------------------------------------------------------

var CheltuieliAdministrativePanesClass = _Components.Panes.extend(
{
    _setup_: function()
    {
        this._options.paneConstructorClass = __TipCheltuialaPaneClass;
        
        this._options.paneConstructors = {
            cheltuieli_gospodaresti:    CheltuieliGospodarestiPaneClass,
            salarii:                    CheltuialaSalariiPaneClass
        };
        
        this.addHandler( 'showPane', function( event, paneId, Pane )
        {
            Pane && Pane.reset();
        });
        
    },
    
    getValidator: function()
    {
        var Pane = this.getCurrentPaneObject(),
            Validator = Pane ?
                    Pane.getValidator() :
                    null;
        
        return Validator;
    }
    
});

//------------------------------------------------------------------------------

var CheltuieliAdministrativeValidatorClass = _Components.DataValidator.extend(
{
    _validate: function()
    {
        // se verifică dacă a fost selectat tipul cheltuielii
        var tipCheltuiala = this.Context.getTipCheltuiala();
        
        if( Object.isEmpty( tipCheltuiala ) )
        {
            this._setError( 'Alegeţi tipul cheltuielii' );
        }
        
        // se verifica daca datele completate sunt corecte
        var CheltuialaValidator = this.Context.TipCheltuialaPanes.getValidator();
        
        if( !CheltuialaValidator.isValid() )
        {
            this._setError( CheltuialaValidator.getError() );
        }
        
        return CheltuialaValidator.getData();
    }
    
});

//==============================================================================

var CheltuieliGospodarestiPaneClass = __TipCheltuialaPaneClass.extend(
{
    _setup_: function()
    {
        this.FormClass = _Cheltuieli.CheltuieliGospodarestiForm;
    }
    
});

//==============================================================================

var CheltuialaSalariiPaneClass = __TipCheltuialaPaneClass.extend(
{
    _setup_: function()
    {
        this.FormClass = _Cheltuieli.SalariiForm;
    }
    
});

//==============================================================================

var CategorieUtilitatePublicaPaneClass = __CategoriePaneClass.extend(
{
    __interface: [ 'getTipCheltuiala' ],
    
    _setup_: function()
    {
        this.tipCheltuiala = null;
    },
    
    _setupResources_: function()
    {
        this.TipCheltuialaChoices   = new UtilitatiPubliceChoicesClass( this.find( '.tipuri-cheltuieli-choices-section' ) );
        this.TipCheltuialaPanes     = new UtilitatiPublicePanesClass( this.find( '.tipuri-cheltuieli-wrapper' ) );
        
        this.Validator = new UtilitatePublicaValidatorClass( this );
    },
    
    _setupActions_: function()
    {
        this.bindSelectTipCheltuialaAction();
    },
    
    _init_: function()
    {
        this.TipCheltuialaPanes.hide();
    },
    
    _reset_: function()
    {
        this.tipCheltuiala = null;
        
        this.TipCheltuialaChoices.reset();
        this.TipCheltuialaPanes.hide();
        this.TipCheltuialaPanes.reset();
    },
    
    bindSelectTipCheltuialaAction: function()
    {
        var self = this;
        
        this.TipCheltuialaChoices.addHandler( 'select', function( event, tipCheltuiala )
        {
            self.setTipCheltuiala( tipCheltuiala, false );
        });
    },
    
    setTipCheltuiala: function( tipCheltuiala, updateView )
    {
        if( updateView === undefined )
        {
            updateView = true;
        }
        
        if( this.tipCheltuiala === null && tipCheltuiala !== null )
        {
            this.TipCheltuialaPanes.show();
        }
        else if( tipCheltuiala === null )
        {
            this.TipCheltuialaPanes.hide();
        }
        
        this.tipCheltuiala = tipCheltuiala;
        
        if( updateView )
        {
            this.TipCheltuialaChoices.setTipCheltuiala( tipCheltuiala );
        }
        
        this.TipCheltuialaPanes.showPane( tipCheltuiala );
    },
    
    getTipCheltuiala: function()
    {
        return this.tipCheltuiala;
    },
    
    getValidator: function()
    {
        return this.Validator;
    }
    
});

//------------------------------------------------------------------------------

var UtilitatiPubliceChoicesClass = _Components.Container.extend(
{
    __interface: [ 'setTipCheltuiala' ],
    
    _setupElements_: function()
    {
        this.$choices = this.find( 'input[name=_tip-cheltuiala-utilitati]' );
    },
    
    _setupActions_: function()
    {
        this.bindSelectTipCheltuialaAction();
    },
    
    _reset_: function()
    {
        this.clearChoices();
    },
    
    bindSelectTipCheltuialaAction: function()
    {
        var self = this;
        
        this.$choices.on( 'change', function()
        {
            var tipCheltuiala = $(this).val();
            
            self._trigger( 'select', tipCheltuiala );
        });
    },
    
    clearChoices: function()
    {
        this.$choices.prop( 'checked', false );
    },
    
    getTipCheltuiala: function()
    {
        return this.$choices.filter( ':checked' ).val();
    },
    
    setTipCheltuiala: function( tipCheltuiala )
    {
        this.$choices.filter( function(){ return $(this).val() == tipCheltuiala; } ).prop( 'checked', true );
    }
    
});

//------------------------------------------------------------------------------

var UtilitatiPublicePanesClass = _Components.Panes.extend(
{
    __interface: [ 'getValidator' ],
    
    _setup_: function()
    {
        this._options.paneConstructorClass = __TipCheltuialaPaneClass;
        
        this._options.paneConstructors = {
            energie_electrica:      CheltuialaEnergieElectricaPaneClass,
            salubrizare:            CheltuialaSalubrizarePaneClass,
            gaze_naturale:          CheltuialaGazeNaturalePaneClass
        };
        
        this.addHandler( 'showPane', function( event, paneId, Pane )
        {
            Pane && Pane.reset();
        });
        
    },
    
    _setupResources_: function()
    {
        this.Validator = new UtilitatiPanesValidatorClass( this );
    },
    
    getValidator: function()
    {
        return this.Validator;
    }
    
});

//------------------------------------------------------------------------------

var UtilitatePublicaValidatorClass = _Components.DataValidator.extend(
{
    _validate: function()
    {
        // se verifică dacă a fost selectat tipul cheltuielii
        var tipCheltuiala = this.Context.getTipCheltuiala();
        
        if( !tipCheltuiala )
        {
            this._setError( 'Alegeţi tipul utilităţii' );
        }
        
        // se verifica daca datele completate sunt corecte
        var UtilitateValidator = this.Context.TipCheltuialaPanes.getValidator();
        
        if( !UtilitateValidator.isValid() )
        {
            this._setError( UtilitateValidator.getError() );
        }
        
        return UtilitateValidator.getData();
    }
    
});

//------------------------------------------------------------------------------

var UtilitatiPanesValidatorClass = _Components.DataValidator.extend(
{
    _validate: function()
    {
        var Pane = this.Context.getCurrentPaneObject();
        
        if( Pane )
        {
            this._attachValidator( Pane.getValidator() );
        }
    }
});

//==============================================================================

var CheltuialaEnergieElectricaPaneClass = __TipCheltuialaPaneClass.extend(
{
    _setup_: function()
    {
        this.formVisible = null;

        this.FormClass = _Cheltuieli.EnergieElectricaForm;
        
        this.EnergieElectricaData = DataResource.get( 'Configuration' ).getConfiguration( 'energie_electrica' );
    },
    
    _setupResources_: function()
    {
        this.UnavailableFrame = new EnergieElectricaFormEmptyClass( this.find( '.cheltuiala-unavailable-frame' ) );
    },
    
    _init_: function()
    {
        this.checkContoarePresence();
    },

    _setupActions_: function()
    {
        this.setupResourceEvents();
    },
    
    checkContoarePresence: function()
    {
        if( this.EnergieElectricaData.getContoareCount() )
        {
            this.showFormFrame();
        }
        else
        {
            this.showUnavailableFrame();
        }
    },
    
    getValidator: function()
    {
        var Validator = this.isFormVisible() ?
                this.FormFrame.getValidator() :
                this.UnavailableFrame.getValidator();
        
        return Validator;
    },
    
    showFormFrame: function()
    {
        this.FormFrame.show();
        this.UnavailableFrame.hide();
        
        this.formVisible = true;
    },
    
    showUnavailableFrame: function()
    {
        this.FormFrame.hide();
        this.UnavailableFrame.show();
        
        this.formVisible = false;
    },

    setupResourceEvents: function()
    {
        var self = this;
        
        this.EnergieElectricaData.registerObserver({
            'addContor removeContor': function()
            {
                self.checkContoarePresence();
            }
        });
    },
    
    isFormVisible: function()
    {
        return this.formVisible;
    }
    
});

//------------------------------------------------------------------------------

var EnergieElectricaFormEmptyClass = _Components.Container.extend(
{
    __interface: [ 'getValidator' ],
    
    _setupResources_: function()
    {
        this.Validator = new EnergieElectricaValidatorEmptyClass( this );
    },
    
    _setupActions_: function()
    {
        this.bindGotoConfigAction();
    },
    
    getValidator: function()
    {
        return this.Validator;
    },
    
    bindGotoConfigAction: function()
    {
        this.find( '.goto-config' ).on( 'click', function()
        {
            Application.command( 'open-page', 'configurare', { page: 'energie_electrica' } );
        });
    }
});

//------------------------------------------------------------------------------

var EnergieElectricaValidatorEmptyClass = _Components.DataValidator.extend(
{
    _validate: function()
    {
        this._addError( 'Facturile se pot înregistra doar dacă există cel puțin un contor de energie electrică.' );
    }
});

//==============================================================================

var CategorieAscensoarePaneClass = __CategoriePaneClass.extend(
{
    _setup_: function()
    {
        this.formVisible = null;
        
        this.AscensoareData = DataResource.get( 'Configuration' ).getConfiguration( 'ascensoare' );
    },
    
    _setupResources_: function()
    {
        this.UnavailableFrame = new AscensoareFormEmptyClass( this.find( '.cheltuiala-unavailable-frame' ) );
        this.ContentFrame = new AscensoareFormContentClass( this.find( '.cheltuiala-content-frame' ) );
    },
    
    _init_: function()
    {
        this.checkAscensoarePresence();
    },

    _setupActions_: function()
    {
        this.setupResourceEvents();
    },
    
    _reset_: function()
    {
        if( this.isFormVisible() )
        {
            this.ContentFrame.reset();
        }
    },
    
    checkAscensoarePresence: function()
    {
        if( this.AscensoareData.getAscensoareCount() )
        {
            this.showFormContent();
        }
        else
        {
            this.showUnavailableFrame();
        }
    },
    
    getValidator: function()
    {
        var Validator = this.isFormVisible() ?
                this.ContentFrame.getValidator() :
                this.UnavailableFrame.getValidator();
        
        return Validator;
    },
    
    showFormContent: function()
    {
        this.ContentFrame.show();
        this.UnavailableFrame.hide();
        
        this.formVisible = true;
    },
    
    showUnavailableFrame: function()
    {
        this.ContentFrame.hide();
        this.UnavailableFrame.show();
        
        this.formVisible = false;
    },

    setupResourceEvents: function()
    {
        var self = this;
        
        this.AscensoareData.registerObserver({
            updateAscensoare: function()
            {
                self.checkAscensoarePresence();
            }
        });
    },
    
    isFormVisible: function()
    {
        return this.formVisible;
    }
    
});

//------------------------------------------------------------------------------

var AscensoareFormEmptyClass = _Components.Container.extend(
{
    __interface: [ 'getValidator' ],
    
    _setupResources_: function()
    {
        this.Validator = new AscensoareValidatorEmptyClass( this );
    },
    
    _setupActions_: function()
    {
        this.bindGotoConfigAction();
    },
    
    getValidator: function()
    {
        return this.Validator;
    },
    
    bindGotoConfigAction: function()
    {
        this.find( '.goto-config' ).on( 'click', function()
        {
            Application.command( 'open-page', 'configurare', { page: 'ascensoare' } );
        });
    }
});

//------------------------------------------------------------------------------

var AscensoareValidatorEmptyClass = _Components.DataValidator.extend(
{
    _validate: function()
    {
        this._addError( 'Facturile pentru ascensoare pot fi înregistrate doar dacă asociaţia deţine ascensoare.' );
    }
});

//------------------------------------------------------------------------------

var AscensoareFormContentClass = _Components.Container.extend(
{
    __interface: [ 'getValidator' ],
    
    _setup_: function()
    {
        this.tipCheltuiala = null;
    },
    
    _setupElements_: function()
    {
        this.$choices = this.find( 'input[name="_tip-cheltuiala-ascensoare"]' );
    },
    
    _setupResources_: function()
    {
        this.Form = new _Cheltuieli.AscensoareForm( this.find( '.tipuri-cheltuieli-wrapper' ) );
        this.Validator = new AscensoareValidatorContentClass( this );
    },
    
    _setupActions_: function()
    {
        this.defineChoicesChangeEventHandler();
    },
    
    _init_: function()
    {
        this.clearChoices();
        this.hideForm();
    },
    
    _reset_: function()
    {
        this.clearChoices();
        this.hideForm();
    },
    
    getValidator: function()
    {
        return this.Validator;
    },
    
    hideForm: function()
    {
        this.Form.hide();
    },
    
    showForm: function()
    {
        this.Form.show();
        this.Form.reset();
    },
    
    clearChoices: function()
    {
        this.$choices.prop( 'checked', false );
        this.tipCheltuiala = null;
    },
    
    defineChoicesChangeEventHandler: function()
    {
        var self = this;
        
        this.$choices.on( 'change', function()
        {
            var tipCheltuiala = $(this).val();
            
            if( tipCheltuiala && !self.tipCheltuiala )
            {
                self.showForm();
            }
            
            self.tipCheltuiala = tipCheltuiala;
        });
    }
    
});

//------------------------------------------------------------------------------

var AscensoareValidatorContentClass = _Components.DataValidator.extend(
{
    _validate: function()
    {
        var tipCheltuiala = this.Context.tipCheltuiala;
        
        if( !tipCheltuiala )
        {
            this._addError( 'Alegeţi tipul cheltuielii' );
        }
        else
        {
            var FormValidator = this.Context.Form.getValidator();
            
            if( FormValidator.isValid() )
            {
                var formData = FormValidator.getData(),
                    data = Object.join( { tip_id: tipCheltuiala }, formData );
                
                return data;
            }
            else
            {
                this._addError( FormValidator.getError() );
            }
        }
    }
});

//==============================================================================

var CategorieReparatiiPaneClass = __CategoriePaneClass.extend(
{
    _setupResources_: function()
    {
        this.ReparatiiForm = new _Cheltuieli.ReparatiiForm( this.find( '.tip-cheltuiala-form-frame' ) );
    },
    
    _reset_: function()
    {
        this.ReparatiiForm.reset();
    },
    
    getValidator: function()
    {
        return this.ReparatiiForm.getValidator();
    }
});

//==============================================================================

var CheltuialaSalubrizarePaneClass = __TipCheltuialaPaneClass.extend(
{
    _setup_: function()
    {
        this.FormClass = _Cheltuieli.SalubrizareForm;
    }
    
});

//==============================================================================

var CheltuialaGazeNaturalePaneClass = __TipCheltuialaPaneClass.extend(
{
    _setup_: function()
    {
        this.formVisible = null;
        
        this.FormClass = _Cheltuieli.GazeNaturaleForm;
        
        this.GazeNaturaleData = DataResource.get( 'Configuration' ).getConfiguration( 'gaze_naturale' );
    },
    
    _setupResources_: function()
    {
        this.UnavailableFrame = new GazeNaturaleFormEmptyClass( this.find( '.cheltuiala-unavailable-frame' ) );
    },
    
    _init_: function()
    {
        this.checkBransamentePresence();
    },

    _setupActions_: function()
    {
        this.setupResourceEvents();
    },
    
    checkBransamentePresence: function()
    {
        if( this.GazeNaturaleData.getBransamenteCount() )
        {
            this.showFormFrame();
        }
        else
        {
            this.showUnavailableFrame();
        }
    },
    
    getValidator: function()
    {
        var Validator = this.isFormVisible() ?
                this.FormFrame.getValidator() :
                this.UnavailableFrame.getValidator();
        
        return Validator;
    },
    
    showFormFrame: function()
    {
        this.FormFrame.show();
        this.UnavailableFrame.hide();
        
        this.formVisible = true;
    },
    
    showUnavailableFrame: function()
    {
        this.FormFrame.hide();
        this.UnavailableFrame.show();
        
        this.formVisible = false;
    },

    setupResourceEvents: function()
    {
        var self = this;
        
        this.GazeNaturaleData.registerObserver({
            updateBransamente: function()
            {
                self.checkBransamentePresence();
            }
        });
    },
    
    isFormVisible: function()
    {
        return this.formVisible;
    }
    
});

//------------------------------------------------------------------------------

var GazeNaturaleFormEmptyClass = _Components.Container.extend(
{
    __interface: [ 'getValidator' ],
    
    _setupResources_: function()
    {
        this.Validator = new GazeNaturaleValidatorEmptyClass( this );
    },
    
    _setupActions_: function()
    {
        this.bindGotoConfigAction();
    },
    
    getValidator: function()
    {
        return this.Validator;
    },
    
    bindGotoConfigAction: function()
    {
        this.find( '.goto-config' ).on( 'click', function()
        {
            Application.command( 'open-page', 'configurare', { page: 'gaze_naturale' } );
        });
    }
});

//------------------------------------------------------------------------------

var GazeNaturaleValidatorEmptyClass = _Components.DataValidator.extend(
{
    _validate: function()
    {
        this._addError( 'Facturile se pot înregistra doar dacă există cel puțin un branşament de gaze naturale.' );
    }
});

//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

_Cheltuieli.AddCheltuialaDialog = AddCheltuialaDialogClass;

})();
