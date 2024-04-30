(function(){

var __FormFrameClass = _Components.StaticForm.extend(
{
    __interface: [ 'getValidator', 'populateContent' ],

    _setup_: function()
    {
        this.Validator = null;
    },
    
    _setupResources_: function()
    {
        new TooltipsClass( this );
    },
    
    getValidator: function()
    {
        return this.Validator;
    }
    
});

//------------------------------------------------------------------------------

var __FormValidatorClass = _Components.DataValidator.extend(
{
    
});

//==============================================================================

var __FormSectionClass = _Components.Container.extend(
{
    _setup_: function()
    {
        this.active = false;
    },

    isActive: function()
    {
        return this.active;
    },
    
    _show_: function()
    {
        this.active = true;
    },
    
    _hide_: function()
    {
        this.active = false;
    }
    
});

//==============================================================================

var FonduriRendererClass = _Components.SelectMenu.extend(
{
    __interface: [ 'getFond', 'setFond' ],
    
    _setup_: function()
    {
        this.FonduriData = DataResource.get( 'Fonduri' );
    },
    
    getFond: function()
    {
        return this.getValue();
    },
    
    setFond: function( fondId )
    {
        this.selectItem( fondId );
    },
    
    getFonduriData: function()
    {
        var data = this.FonduriData.getFonduri();
        
        return data;
    },
    
    generateContent: function()
    {
        var data = this.getFonduriData(),
            iterator = function( fond ){
                return {
                    value:  fond.id,
                    label:  fond.denumire
                };
            };
        
        return [ data, iterator ];
    }
    
});

//== CHELTUIELI GOSPODARESTI ===================================================

var CheltuieliGospodarestiFormFrameClass = __FormFrameClass.extend(
{
    _setup_: function()
    {
        this.FonduriData = DataResource.get( 'Fonduri' );
    },

    _setupElements_: function()
    {
        this.$fondRow                       = this.find( '.fond-section' );
        this.$repartizareProprietari        = this.find( '.repartizare-proprietari-section' );
        this.$repartizareProprietariButton  = this.find( '.repartizare-proprietari-checkbox' );
        this.$coloana                       = this.find( '.coloana-section' );
        this.$coloanaValue                  = this.$coloana.find( '.field-container' );
    },
    
    _setupResources_: function()
    {
        this.DataField          = new DataCheltuialaClass( this.getField( 'data' ) );
        this.FonduriRenderer    = new FonduriRendererClass( this.getField( 'fond' ) );
        this.RepartizareSection = new RepartizareAsociatieSectionClass( this.find( '.repartizare-section' ), { parametruSpatii: 'suprafata' } );
        
        this.Validator          = new CheltuieliGospodarestiValidatorClass( this );
    },
    
    _setupActions_: function()
    {
        this.setupChangeFondEvent();
        this.setupCheckRepartizareProprietariEvent();
    },
    
    _init_: function()
    {
        this.displayFondDependencies();
    },
    
    _reset_: function()
    {
        this.FonduriRenderer.reset();
        this.$repartizareProprietariButton.prop( 'checked', false );
        this.RepartizareSection.reset();
        this.displayFondDependencies();
    },
    
    getValidator: function()
    {
        return this.Validator;
    },
        
    populateContent: function( cheltuialaData )
    {
        var parametri = cheltuialaData.parametri;
        
        this.reset();
        
        this.getField( 'descriere' ).val( parametri.descriere );
        this.getField( 'furnizor' ).val( parametri.furnizor );
        this.getField( 'act' ).val( parametri.act );
        this.getField( 'valoare' ).val( Number.formatNumber( parametri.valoare ) );
        
        this.DataField.setValue( parametri.data );
        
        this.FonduriRenderer.setFond( parametri.fond );
        
        var repartizareExists = ( parametri.repartizare !== undefined );
        
        this.$repartizareProprietariButton.prop( 'checked', repartizareExists );
        
        this.displayFondDependencies();
        
        if( repartizareExists )
        {
            this.RepartizareSection.setRepartizare( parametri.repartizare );
        }
    },
    
    setupChangeFondEvent: function()
    {
        var self = this;
        
        this.FonduriRenderer.addHandler( 'select', function()
        {
            self.displayFondDependencies();
            
            self._triggerDOM( 'scrollToMe', self.$fondRow );
        });
    },
    
    displayFondDependencies: function()
    {
        var fondId = this.FonduriRenderer.getFond();
        
        if( this.FonduriData.isRepartizareMandatory( fondId ) )
        {
            this.$repartizareProprietari.hide();
            
            this.$coloana.show();
            this.$coloanaValue.text( this.FonduriData.isIntretinere( fondId ) ? 'Cheltuieli gospodăreşti' : this.FonduriData.getDenumireFond( fondId ) );
            
            this.displayRepartizareSection();
        }
        else if( this.FonduriData.isRepartizareOptional( fondId ) )
        {
            this.$repartizareProprietari.show();
            
            if( this.isRepartizareProprietariChecked() )
            {
                this.$coloana.show();
                this.$coloanaValue.text( this.FonduriData.isIntretinere( fondId ) ? 'Cheltuieli gospodăreşti' : this.FonduriData.getDenumireFond( fondId ) );
                
                this.displayRepartizareSection();
            }
            else
            {
                this.$coloana.hide();
                
                this.hideRepartizareSection();
            }
        }
        else
        {
            this.$repartizareProprietari.hide();
            this.$coloana.hide();
            this.hideRepartizareSection();
        }
    },
    
    isRepartizareProprietariChecked: function()
    {
        var checked = this.$repartizareProprietariButton.prop( 'checked' );
        
        return checked;
    },
    
    displayRepartizareSection: function()
    {
        this.RepartizareSection.show();
    },
    
    hideRepartizareSection: function()
    {
        this.RepartizareSection.hide();
    },
    
    setupCheckRepartizareProprietariEvent: function()
    {
        var self = this;
        
        this.$repartizareProprietariButton.on( 'change', function()
        {
            self.displayFondDependencies();
            self._triggerDOM( 'scrollToMe', self.$repartizareProprietari );
        });
    }
    
});

CheltuieliGospodarestiFormFrameClass.TIP_CHELTUIALA_ID = 'cheltuieli_gospodaresti';

//------------------------------------------------------------------------------

var CheltuieliGospodarestiValidatorClass = __FormValidatorClass.extend(
{
    _validate: function()
    {
        var formValues = this.Context.getValues();
        
        formValues.data = this.Context.DataField.getValue();
        formValues.fond = this.Context.FonduriRenderer.getFond();
        
        Object.isBlank( formValues.descriere ) && this._addError( 'Completaţi descrierea cheltuielii.' );
        Object.isBlank( formValues.furnizor ) && this._addError( 'Completaţi denumirea furnizorului.' );
        Object.isBlank( formValues.act ) && this._addError( 'Completaţi documentul justificativ.' );
        Object.isEmpty( formValues.data ) && this._addError( 'Completaţi data cheltuielii.' );
        Object.isBlank( formValues.valoare ) && this._addError( 'Completaţi valoarea cheltuielii.' );
        Object.isEmpty( formValues.fond ) && this._addError( 'Selectaţi fondul din care se achită cheltuiala.' );
        
        if( this.Context.RepartizareSection.isVisible() )
        {
            formValues.repartizare = this.Context.RepartizareSection.getRepartizare();
            
            if( Object.isEmpty( formValues.repartizare ) )
            {
                this._addError( 'Specificaţi apartamentele la care se repartizează cheltuiala.' );
            }
        }
        
        var data = {
            tip_id: CheltuieliGospodarestiFormFrameClass.TIP_CHELTUIALA_ID,
            parametri: formValues
        };
        
        return data;
    }
    
});

//== SALARII ===================================================================

var SalariiFormFrameClass = __FormFrameClass.extend(
{
    _setup_: function()
    {
        this.FonduriData = DataResource.get( 'Fonduri' );
    },

    _setupElements_: function()
    {
        this.$fondRow                       = this.find( '.fond-section' );
        this.$repartizareProprietari        = this.find( '.repartizare-proprietari-section' );
        this.$repartizareProprietariButton  = this.find( '.repartizare-proprietari-checkbox' );
        this.$coloana                       = this.find( '.coloana-section' );
        this.$coloanaValue                  = this.$coloana.find( '.field-container' );
    },
    
    _setupResources_: function()
    {
        this.FonduriRenderer    = new FonduriRendererClass( this.getField( 'fond' ) );
        this.RepartizareSection = new RepartizareAsociatieSectionClass( this.find( '.repartizare-section' ), { parametruSpatii: 'suprafata' } );
        
        this.Validator          = new SalariiValidatorClass( this );
    },
    
    _setupActions_: function()
    {
        this.setupChangeFondEvent();
        this.setupCheckRepartizareProprietariEvent();
    },
    
    _init_: function()
    {
        this.displayFondDependencies();
    },
    
    _reset_: function()
    {
        this.FonduriRenderer.reset();
        this.$repartizareProprietariButton.prop( 'checked', false );
        this.RepartizareSection.reset();
        this.displayFondDependencies();
    },
    
    getValidator: function()
    {
        return this.Validator;
    },
        
    populateContent: function( cheltuialaData )
    {
        var parametri = cheltuialaData.parametri;
        
        this.reset();
        
        this.getField( 'descriere' ).val( parametri.descriere );
        this.getField( 'beneficiar' ).val( parametri.beneficiar );
        this.getField( 'valoare' ).val( Number.formatNumber( parametri.valoare ) );
        this.getField( 'taxe' ).val( Number.formatNumber( parametri.taxe ) );
        
        this.FonduriRenderer.setFond( parametri.fond );
        
        var repartizareExists = ( parametri.repartizare !== undefined );
        
        this.$repartizareProprietariButton.prop( 'checked', repartizareExists );
        
        this.displayFondDependencies();
        
        if( repartizareExists )
        {
            this.RepartizareSection.setRepartizare( parametri.repartizare );
        }
    },
    
    setupChangeFondEvent: function()
    {
        var self = this;
        
        this.FonduriRenderer.addHandler( 'select', function()
        {
            self.displayFondDependencies();
            
            self._triggerDOM( 'scrollToMe', self.$fondRow );
        });
    },
    
    displayFondDependencies: function()
    {
        var fondId = this.FonduriRenderer.getFond();
        
        if( this.FonduriData.isRepartizareMandatory( fondId ) )
        {
            this.$repartizareProprietari.hide();
            
            this.$coloana.show();
            this.$coloanaValue.text( this.FonduriData.isIntretinere( fondId ) ? 'Salarii' : this.FonduriData.getDenumireFond( fondId ) );
            
            this.displayRepartizareSection();
        }
        else if( this.FonduriData.isRepartizareOptional( fondId ) )
        {
            this.$repartizareProprietari.show();
            
            if( this.isRepartizareProprietariChecked() )
            {
                this.$coloana.show();
                this.$coloanaValue.text( this.FonduriData.isIntretinere( fondId ) ? 'Salarii' : this.FonduriData.getDenumireFond( fondId ) );
                
                this.displayRepartizareSection();
            }
            else
            {
                this.$coloana.hide();
                
                this.hideRepartizareSection();
            }
        }
        else
        {
            this.$repartizareProprietari.hide();
            this.$coloana.hide();
            this.hideRepartizareSection();
        }
    },
    
    isRepartizareProprietariChecked: function()
    {
        var checked = this.$repartizareProprietariButton.prop( 'checked' );
        
        return checked;
    },
    
    displayRepartizareSection: function()
    {
        this.RepartizareSection.show();
    },
    
    hideRepartizareSection: function()
    {
        this.RepartizareSection.hide();
    },
    
    setupCheckRepartizareProprietariEvent: function()
    {
        var self = this;
        
        this.$repartizareProprietariButton.on( 'change', function()
        {
            self.displayFondDependencies();
            self._triggerDOM( 'scrollToMe', self.$repartizareProprietari );
        });
    }
    
});

SalariiFormFrameClass.TIP_CHELTUIALA_ID = 'salarii';

//------------------------------------------------------------------------------

var SalariiValidatorClass = __FormValidatorClass.extend(
{
    _validate: function()
    {
        var formValues = this.Context.getValues();
        
        formValues.fond = this.Context.FonduriRenderer.getFond();
        
        Object.isBlank( formValues.descriere ) && this._addError( 'Completaţi descrierea cheltuielii.' );
        Object.isBlank( formValues.beneficiar ) && this._addError( 'Completaţi numele beneficiarului.' );
        Object.isBlank( formValues.valoare ) && this._addError( 'Completaţi valoarea cheltuielii.' );
        Object.isEmpty( formValues.fond ) && this._addError( 'Selectaţi fondul din care se achită cheltuiala.' );
        
        if( this.Context.RepartizareSection.isVisible() )
        {
            formValues.repartizare = this.Context.RepartizareSection.getRepartizare();
            
            if( Object.isEmpty( formValues.repartizare ) )
            {
                this._addError( 'Specificaţi apartamentele la care se repartizează cheltuiala.' );
            }
        }
        
        var data = {
            tip_id: SalariiFormFrameClass.TIP_CHELTUIALA_ID,
            parametri: formValues
        };
        
        return data;
    }
    
});

//== ENERGIE ELECTRICA =========================================================

var EnergieElectricaFormFrameClass = __FormFrameClass.extend(
{
    _setupResources_: function()
    {
        this.DataEmiteriiField      = new DataCheltuialaClass( this.getField( 'data' ) );
        this.ScadentaField          = new ScadentaCheltuialaClass( this.getField( 'scadenta' ), { Link: this.DataEmiteriiField } );
        this.ContoareRenderer       = new EnergieElectricaContoareRendererClass( this.getField( 'contor' ) );
        this.RepartizareSection     = new EnergieElectricaRepartizareSectionClass( this.find( '.repartizare-section' ) );
        
        this.Validator              = new EnergieElectricaValidatorClass( this );
    },
    
    _setupActions_: function()
    {
        this.setupSelectContorAction();
        this.bindGotoConfigAction();
    },
    
    _init_: function()
    {
        this.RepartizareSection.hide();
    },
    
    _reset_: function()
    {
        this.ContoareRenderer.reset();
        this.RepartizareSection.hide();
    },
    
    getValidator: function()
    {
        return this.Validator;
    },
        
    setupSelectContorAction: function()
    {
        var self = this;
        
        this.ContoareRenderer.addHandler( 'select', function( event, contorId )
        {
            if( contorId )
            {
                self.RepartizareSection.show();
                self.RepartizareSection.setContor( contorId );
                self._triggerDOM( 'scrollToMe', self.RepartizareSection.getContainer() );
            }
            else
            {
                self.RepartizareSection.hide();
            }
        });
    },
    
    populateContent: function( cheltuialaData )
    {
        var parametri = cheltuialaData.parametri;
        
        this.reset();
        
        this.getField( 'descriere' ).val( parametri.descriere );
        this.getField( 'furnizor' ).val( parametri.furnizor );
        this.getField( 'act' ).val( parametri.act );
        this.getField( 'valoare' ).val( Number.formatNumber( parametri.valoare ) );
        
        this.DataEmiteriiField.setValue( parametri.data, true );
        this.ScadentaField.setValue( parametri.scadenta, true );
        
        this.ContoareRenderer.setContor( parametri.contor );
        
        this.RepartizareSection.show();
        this.RepartizareSection.setContor( parametri.contor );
        
        this.RepartizareSection.setRepartizare( parametri.repartizare );
    },
    
    bindGotoConfigAction: function()
    {
        this.find( '.goto-config' ).on( 'click', function()
        {
            Application.command( 'open-page', 'configurare', { page: 'energie_electrica' } );
        });
    }
    
});

EnergieElectricaFormFrameClass.TIP_CHELTUIALA_ID = 'energie_electrica';

//------------------------------------------------------------------------------

var EnergieElectricaContoareRendererClass = _Components.SelectMenu.extend(
{
    __interface: [ 'setContor', 'getContor' ],
    
    _setup_: function()
    {
        this.StructuraData = DataResource.get( 'Structura' );
        this.EnergieElectricaData = DataResource.get( 'Configuration' ).getConfiguration( 'energie_electrica' );
    },
    
    _setupActions_: function()
    {
        this.setupResourceEvents();
    },
    
    generateContent: function()
    {
        var self = this,
            data = this.EnergieElectricaData.getContoare();
            iterator = function( contor ){
                var denumire = contor.denumire,
                    scari = contor.scari
                                .map( function( scaraId ){
                                    return self.StructuraData.getDenumireScara( scaraId );
                                })
                                .join( '; ' ),
                    denumireCompleta = [ denumire, scari ];

                return {
                    value: contor.id,
                    label: denumireCompleta,
                    selectText: contor.denumire
                };
            };
        
        return [ data, iterator ];
    },
    
    setContor: function( contorId )
    {
        this.selectItem( contorId );
    },
    
    getContor: function()
    {
        return this.getValue();
    },
    
    setupResourceEvents: function()
    {
        var self = this;
        
        this.EnergieElectricaData.registerObserver({
            'addContor editContor removeContor': function()
            {
                self.regenerate();
            }
        });
    }
    
    
});

//------------------------------------------------------------------------------

var EnergieElectricaRepartizareSectionClass = _Components.Container.extend(
{
    __interface: [ 'setContor', 'getRepartizare', 'setRepartizare' ],
    
    _setup_: function()
    {
        this.EnergieElectricaData = DataResource.get( 'Configuration' ).getConfiguration( 'energie_electrica' );
        this.RepartizareScari = {};
    },
    
    _setupElements_: function()
    {
        this.$scariContainer    = this.find( '.scari-container' );
        this.$scutiriContainer  = this.find( '.scutiri-container' );
    },
    
    _init_: function()
    {
        
    },
    
    setContor: function( contorId )
    {
        this.generateScariContent( contorId );
        this.generateScutiriContent( contorId );
    },
    
    generateScariContent: function( contorId )
    {
        var self = this,
            contor = this.EnergieElectricaData.getContor( contorId ),
            scariContor = contor.scari;
        
        this.$scariContainer.empty();
        this.RepartizareScari = {};
        
        Object.each( scariContor, function( i, scaraId )
        {
            var $scaraTemplate = self._getTemplate( 'repartizare-scara' );
            
            self.RepartizareScari[ scaraId ] = new _Cheltuieli.RepartizareScara( $scaraTemplate, {
                    scaraId:        scaraId,
                    shortSummary:   true,
                    parametru:      'persoane'
            });
            
            $scaraTemplate.appendTo( self.$scariContainer );
        });
    },
    
    generateScutiriContent: function( contorId )
    {
        var self = this,
            scutiriText = this.EnergieElectricaData.getContorScutiriText( contorId );
        
        this.$scutiriContainer.empty();
        
        if( !Object.isEmpty( scutiriText ) )
        {
            Object.each( scutiriText, function( i, scutireText )
            {
                var $instalatieTemplate = self._getTemplate( 'instalatie' );

                $instalatieTemplate.text( scutireText );
                
                $instalatieTemplate.appendTo( self.$scutiriContainer );
            });
            
            this.$scutiriContainer.show();
        }
        else
        {
            this.$scutiriContainer.hide();
        }
    },
    
    getRepartizare: function()
    {
        var repartizare = {};
        
        Object.each( this.RepartizareScari, function( scaraId, Repartizare )
        {
            var repartizareScara = Repartizare.getRepartizare();
            
            if( repartizareScara === '*' )
            {
                if( repartizare.scari === undefined )
                {
                    repartizare.scari = [];
                }
                
                repartizare.scari.add( scaraId );
            }
            else if( Object.isArray( repartizareScara ) && Object.size( repartizareScara ) )
            {
                if( repartizare.spatii === undefined )
                {
                    repartizare.spatii = [];
                }
                
                repartizare.spatii.add( repartizareScara );
            }
        });
        
        return repartizare;
    },
    
    setRepartizare: function( repartizare )
    {
        Object.each( this.RepartizareScari, function( scaraId, RepartizareScara )
        {
            if( repartizare.scari && repartizare.scari.contains( scaraId ) )
            {
                RepartizareScara.setRepartizare( '*' );
            }
            else
            {
                RepartizareScara.setRepartizare( repartizare.spatii );
            }
        });
    }
    
});

//------------------------------------------------------------------------------

var EnergieElectricaValidatorClass = __FormValidatorClass.extend(
{
    _validate: function()
    {
        var formValues = this.Context.getValues();
        
        formValues.data         = this.Context.DataEmiteriiField.getValue();
        formValues.scadenta     = this.Context.ScadentaField.getValue();
        formValues.contor       = this.Context.ContoareRenderer.getContor();
        formValues.repartizare  = this.Context.RepartizareSection.getRepartizare();
        
        Object.isBlank( formValues.descriere ) && this._addError( 'Completaţi descrierea facturii.' );
        Object.isBlank( formValues.furnizor ) && this._addError( 'Completaţi denumirea furnizorului.' );
        Object.isBlank( formValues.act ) && this._addError( 'Completaţi seria şi numărul facturii.' );
        Object.isBlank( formValues.valoare ) && this._addError( 'Completaţi valoarea facturată.' );
        
        Object.isEmpty( formValues.data ) && this._addError( 'Completaţi data emiterii facturii.' );
        Object.isEmpty( formValues.scadenta ) && this._addError( 'Completaţi scadenţa facturii.' );

        Object.isEmpty( formValues.contor ) && this._addError( 'Selectaţi contorul de energie electrică.' );
        Object.isEmpty( formValues.repartizare ) && this._addError( 'Specificaţi apartamentele la care se repartizează factura.' );
        
        var data = {
            tip_id:     EnergieElectricaFormFrameClass.TIP_CHELTUIALA_ID,
            parametri:  formValues
        };
        
        return data;
    }
    
});

//== CHELTUIELI ASCENSOARE =====================================================

var AscensoareFormFrameClass = __FormFrameClass.extend(
{
    _setup_: function()
    {
        this.AscensoareData = DataResource.get( 'Configuration' ).getConfiguration( 'ascensoare' );
        this.FonduriData = DataResource.get( 'Fonduri' );
    },
    
    _setupElements_: function()
    {
        this.$fondRow                       = this.find( '.fond-row' );
        this.$repartizareProprietari        = this.find( '.repartizare-proprietari-row' );
        this.$repartizareProprietariButton  = this.find( '.repartizare-proprietari-checkbox' );
        this.$coloana                       = this.find( '.coloana-row' );
        this.$coloanaValue                  = this.$coloana.find( '.field-container' );
    },
    
    _setupResources_: function()
    {
        this.DataEmiteriiField      = new DataCheltuialaClass( this.getField( 'data' ) );
        this.ScadentaField          = new ScadentaCheltuialaClass( this.getField( 'scadenta' ), { Link: this.DataEmiteriiField } );
        this.FonduriRenderer        = new FonduriRendererClass( this.getField( 'fond' ) );
        
        this.AscensoareListRenderer = new AscensoareListRendererClass( this );
        
        this.Validator              = new AscensoareFormValidatorClass( this );
    },
    
    _setupActions_: function()
    {
        this.bindGotoConfigAction();
        this.setupChangeFondEvent();
        this.setupCheckRepartizareProprietariEvent();
    },
    
    _reset_: function()
    {
        this.AscensoareListRenderer.reset();
        this.FonduriRenderer.reset();
        this.$repartizareProprietariButton.prop( 'checked', false );
        this.displayFondDependencies();
    },
    
    _init_: function()
    {
        this.displayFondDependencies();
    },
    
    populateContent: function( cheltuialaData )
    {
        var parametri = cheltuialaData.parametri,
            repartizareExists = false;
    
        Object.each( parametri.ascensoare, function(i, ascensorValue )
        {
            if( !Object.isEmpty( ascensorValue.repartizare ) )
            {
                repartizareExists = true;
                
                return false;
            }
        });
        
        this.reset();
        
        this.getField( 'descriere' ).val( parametri.descriere );
        this.getField( 'furnizor' ).val( parametri.furnizor );
        this.getField( 'act' ).val( parametri.act );
        
        this.DataEmiteriiField.setValue( parametri.data, true );
        this.ScadentaField.setValue( parametri.scadenta, true );
        
        this.FonduriRenderer.setFond( parametri.fond );
        this.$repartizareProprietariButton.prop( 'checked', repartizareExists );
        this.displayFondDependencies();
        
        this.AscensoareListRenderer.setValues( parametri.ascensoare );
    },
    
    bindGotoConfigAction: function()
    {
        this.find( '.goto-config' ).on( 'click', function()
        {
            Application.command( 'open-page', 'configurare', { page: 'ascensoare' } );
        });
    },
    
    displayFondDependencies: function()
    {
        var fondId = this.FonduriRenderer.getFond();
        
        if( this.FonduriData.isRepartizareMandatory( fondId ) )
        {
            this.$repartizareProprietari.hide();
            
            this.$coloana.show();
            this.$coloanaValue.text( this.FonduriData.isIntretinere( fondId ) ? 'Ascensor' : this.FonduriData.getDenumireFond( fondId ) );
            
            this.displayRepartizareSections();
        }
        else if( this.FonduriData.isRepartizareOptional( fondId ) )
        {
            this.$repartizareProprietari.show();
            this.$coloana.hide();
            this.checkRepartizareVisibility();
        }
        else
        {
            this.$repartizareProprietari.hide();
            this.$coloana.hide();
            this.hideRepartizareSections();
        }
    },
    
    checkRepartizareVisibility: function()
    {
        var checked = this.isRepartizareProprietariChecked();

        if( checked )
        {
            this.displayRepartizareSections();
        }
        else
        {
            this.hideRepartizareSections();
        }
    },
    
    isRepartizareProprietariChecked: function()
    {
        var checked = this.$repartizareProprietariButton.prop( 'checked' );
        
        return checked;
    },
    
    displayRepartizareSections: function()
    {
        this.AscensoareListRenderer.displayRepartizare();
    },
    
    hideRepartizareSections: function()
    {
        this.AscensoareListRenderer.hideRepartizare();
    },
    
    setupChangeFondEvent: function()
    {
        var self = this;
        
        this.FonduriRenderer.addHandler( 'select', function()
        {
            self.displayFondDependencies();
            
            self._triggerDOM( 'scrollToMe', self.$fondRow );
        });
    },
    
    setupCheckRepartizareProprietariEvent: function()
    {
        var self = this;
        
        this.$repartizareProprietariButton.on( 'change', function()
        {
            self.checkRepartizareVisibility();
            self._triggerDOM( 'scrollToMe', self.$repartizareProprietari );
        });
    }
    
});

AscensoareFormFrameClass.TIP_CHELTUIALA_ID = 'intretinere_ascensor';

//------------------------------------------------------------------------------

var AscensoareListRendererClass = _Components.Container.extend(
{
    __interface: [ 'getValidator', 'setValues',
                   'displayRepartizare', 'hideRepartizare' ],
    
    _setup_: function()
    {
        this.AscensoareData = DataResource.get( 'Configuration' ).getConfiguration( 'ascensoare' );
        this.StructuraData = DataResource.get( 'Structura' );
        
        this.items = [];
        this.valoriItems = {};
    },
    
    _setupElements_: function()
    {
        this.$valoareRow = this.find( '.cheltuiala-form tr.valoare' );
        
        this.$valoareValue = this.$valoareRow.find( '.valoare-value' );
        this.$valoarePlaceholder = this.$valoareRow.find( '.valoare-placeholder' );
        
        this.$tableForm = this.find( '.cheltuiala-form >table' );
    },
    
    _setupActions_: function()
    {
        this.setupResourceEvents();
    },
    
    _setupResources_: function()
    {
        this.Validator = new AscensoareListRendererValidatorClass( this );
    },
    
    _init_: function()
    {
        this.generateContent();
    },
    
    _reset_: function()
    {
        this.valoriItems = {};
        this.clearAscensoareValues();
        this.setValoareFacturata( null );
    },
    
    getValidator: function()
    {
        return this.Validator;
    },
    
    setValues: function( ascensoareValues )
    {
        var self = this;
        
        this.reset();
        
        Object.each( ascensoareValues, function( ascensorId, ascensorValues )
        {
            self.populateItem( ascensorId, ascensorValues );
        });
        
        this.updateValoareFacturata();
    },
    
    generateContent: function()
    {
        var self = this,
            ascensoare = this.AscensoareData.getAscensoare();
        
        this.$valoareRow.siblings( '.ascensoare-scara' ).remove();
        this.items = {};
        
        Object.each( ascensoare, function( i, ascensor )
        {
            var Item = self.generateItem( ascensor );
            
            Item.getContainer().appendTo( self.$tableForm );
            self.items[ ascensor.id ] = Item;
        });
    },
    
    generateItem: function( ascensor )
    {
        var self = this,
            $item = this._getTemplate( 'ascensoare-scara' ),
            Item = new AscensoareScaraItem( $item, {
                data: ascensor,
                onChangeValoare: function( event, valoare )
                {
                    self.updateValoareItem( ascensor.id, valoare );
                }
            });
        
        return Item;
    },
    
    populateItem: function( ascensorId, ascensorValues )
    {
        this.items[ ascensorId ].setValues( ascensorValues );
        
        this.valoriItems[ ascensorId ] = ascensorValues.valoare;
    },
    
    setupResourceEvents: function()
    {
        var self = this;
        
        this.AscensoareData.registerObserver({
            updateAscensoare: function()
            {
                self.generateContent();
            }
        });
    },

    updateValoareItem: function( ascensorId, valoare )
    {
        this.valoriItems[ ascensorId ] = valoare;
        
        this.updateValoareFacturata();
    },
    
    updateValoareFacturata: function()
    {
        var totalValoare = 0;

        Object.each( this.valoriItems, function( ascensorId, valoare )
        {
            if( !Number.isNaN( valoare ) )
            {
                totalValoare += valoare;
            }
            else
            {
                totalValoare = NaN;

                return false;
            }
        });
        
        this.setValoareFacturata( totalValoare );
    },
    
    setValoareFacturata: function( valoare )
    {
        if( valoare === null )
        {
            this.$valoareValue.hide();
            this.$valoarePlaceholder.show();
        }
        else
        {
            this.$valoarePlaceholder.hide();
            this.$valoareValue.show();
            
            var valoareText = Number.isNaN( valoare ) ?
                    '-' :
                    Number.formatCurrency( valoare );
                    
                    
            this.$valoareValue.html( valoareText );
        }
    },
    
    clearAscensoareValues: function()
    {
        Object.each( this.items, function( i, Item )
        {
            Item.reset();
        });
    },
    
    displayRepartizare: function()
    {
        Object.each( this.items, function( i, Item )
        {
            Item.displayRepartizare();
        });
    },
    
    hideRepartizare: function()
    {
        Object.each( this.items, function( i, Item )
        {
            Item.hideRepartizare();
        });
    }
    
});

//------------------------------------------------------------------------------

var AscensoareScaraItem = _Components.Container.extend(
{
    __interface: [ 'setValues', 'getValidator',
                   'displayRepartizare', 'hideRepartizare' ],
    
    _setup_: function()
    {
        this._setRequiredOptions([ 'data' ]);
        
        this.data = this.getOption( 'data' );
        this.ascensorId = this.data.id;
        
        this.FonduriData = DataResource.get( 'Fonduri' );
        this.StructuraData = DataResource.get( 'Structura' );
    },
    
    _setupElements_: function()
    {
        this.$denumireScara = this.find( '.denumire-scara' );
        
        this.$valoare       = this.find( '.valoare-container' );
        this.$repartizare   = this.find( '.repartizare-container' );
    },
    
    _setupResources_: function()
    {
        this.Valoare        = new AscensoareScaraItemValoare( this.$valoare );
        this.Repartizare    = new AscensoareScaraItemRepartizare( this.$repartizare, { ascensorId: this.ascensorId } );
        
        this.Validator      = new AscensoareItemValidatorClass( this );
    },
    
    _setupActions_: function()
    {
        this.setupChangeValoareEvent();
    },
    
    _init_: function()
    {
        this.populateContent();
    },
    
    _reset_: function()
    {
        this.clearValues();
    },
    
    populateContent: function()
    {
        var scaraId = this.data.scara_id,
            denumireScara = this.StructuraData.getDenumireScara( scaraId );
        
        this.$denumireScara.text( denumireScara );
    },
    
    setValues: function( ascensorValues )
    {
        this.Valoare.setValoare( ascensorValues.valoare );
        
        ascensorValues.repartizare !== undefined && this.Repartizare.setRepartizare( ascensorValues.repartizare );
    },
    
    setupChangeValoareEvent: function()
    {
        var self = this;
        
        this.Valoare.addHandler( 'change', function( event, valoare )
        {
            self._trigger( 'changeValoare', valoare );
        });
    },
    
    getValidator: function()
    {
        return this.Validator;
    },
    
    clearValues: function()
    {
        this.Valoare.reset();
        this.Repartizare.reset();
    },
    
    displayRepartizare: function()
    {
        this.Repartizare.show();
    },
    
    hideRepartizare: function()
    {
        this.Repartizare.hide();
    }
    
});

//------------------------------------------------------------------------------

var AscensoareScaraItemValoare = _Components.Container.extend(
{
    __interface: [ 'getValoare' ],

    _setup_: function()
    {
        this.lastValue = null;
    },

    _setupElements_: function()    
    {
        this.$input = this.find( 'input.valoare-serviciu-input' );
    },
    
    _setupActions_: function()
    {
        this.defineChangeEventHandler();
    },
    
    _reset_: function()
    {
        this.$input.val( '' );
        this.lastValue = null;
    },
    
    defineChangeEventHandler: function()
    {
        var self = this,
            timeout;
        
        this.$input.on( 'keyup paste change', function()
        {
            var numericValue = self.getValoare();
                
            if( numericValue != self.lastValue )
            {
                clearTimeout( timeout );
                timeout = setTimeout( function()
                    {
                        if( Number.isNaN( numericValue ) )
                        {
                            self.$input.addClass( 'error' );
                        }
                        else
                        {
                            self.$input.removeClass( 'error' );
                        }
                        
                        self.lastValue = numericValue;
                        self._trigger( 'change', numericValue );
                    }, 
                    300 );
            }
        });
    },
    
    getValoare: function()
    {
        var inputValue = this.$input.val().trim(),
            numericValue = Number.valueFromCurrency( inputValue );
            
        return numericValue;
    },
    
    setValoare: function( valoare )
    {
        var text = Number.formatNumber( valoare );
        
        this.$input.val( text );
    }
    
});

//------------------------------------------------------------------------------

var AscensoareScaraItemRepartizare = _Components.Container.extend(
{
    __interface: [ 'getRepartizare', 'setRepartizare' ],
    
    _setup_: function()
    {
        this._setRequiredOptions([ 'ascensorId' ]);
        
        this.AscensoareData = DataResource.get( 'Configuration' ).getConfiguration( 'ascensoare' );
        this.ascensorId = this.getOption( 'ascensorId' );
    },
    
    _setupResources_: function()
    {
        var ascensor = this.AscensoareData.getAscensor( this.ascensorId ),
            scaraId = ascensor.scara_id;
                
        this.RepartizareScara = new _Cheltuieli.RepartizareScara( this.find( '.repartizare-scara-component' ), {
            parametru:      'suprafata',
            scaraId:        scaraId,
            shortSummary:   false,
            scaraSuffix:    false
        });
    },
    
    _reset_: function()
    {
        this.RepartizareScara.reset();
    },
    
    getRepartizare: function()
    {
        return this.RepartizareScara.getRepartizare();
    },
    
    setRepartizare: function( repartizare )
    {
        return this.RepartizareScara.setRepartizare( repartizare );
    }
    
});

//------------------------------------------------------------------------------

var AscensoareItemValidatorClass = _Components.DataValidator.extend(
{
    _validate: function()
    {
        var data = {},
            valoare = this.Context.Valoare.getValoare();
        
        if( Number.isNaN( valoare ) )
        {
            this._addError( 'Valoarea completată este incorectă.' );
        }
        else if( valoare != 0 )
        {
            data = {
                valoare: valoare
            };

            if( this.Context.Repartizare.isVisible() )
            {
                var repartizare = this.Context.Repartizare.getRepartizare();

                if( Object.isEmpty( repartizare ) )
                {
                    this._addError( 'Specificaţi apartamentele la care se repartizează factura.' );
                }
                else
                {
                    data.repartizare = repartizare;
                }
            }
        }
        
        return data;
    }
});

//------------------------------------------------------------------------------

var AscensoareListRendererValidatorClass = _Components.DataValidator.extend(
{
    _validate: function()
    {
        var self = this,
            ascensoareValues = {},
            emptyValues = true;
        
        Object.each( this.Context.items, function( ascensorId, Item )
        {
            var ItemValidator = Item.getValidator(),
                ascensorValues;
                
            if( ItemValidator.isValid() )
            {
                ascensorValues = ItemValidator.getData();
                
                if( ascensorValues.valoare )
                {
                    ascensoareValues[ ascensorId ] = ascensorValues;
                    
                    emptyValues = false;
                }
            }
            else
            {
                self._setError( ItemValidator.getError() );
                
                return false;
            }
        });
        
        if( emptyValues )
        {
            this._setError( 'Completaţi valoarea serviciului pentru cel puţin o scară.' );
        }
        
        return ascensoareValues;
    }
    
});

//------------------------------------------------------------------------------

var AscensoareFormValidatorClass = __FormValidatorClass.extend(
{
    _validate: function()
    {
        var formValues = this.Context.getValues(),
            ValoriValidator = this.Context.AscensoareListRenderer.getValidator();
        
        formValues.data = this.Context.DataEmiteriiField.getValue();
        formValues.scadenta = this.Context.ScadentaField.getValue();
        formValues.fond = this.Context.FonduriRenderer.getFond();
        
        Object.isBlank( formValues.descriere ) && this._addError( 'Completaţi descrierea facturii.' );
        Object.isBlank( formValues.furnizor ) && this._addError( 'Completaţi denumirea furnizorului.' );
        Object.isBlank( formValues.act ) && this._addError( 'Completaţi seria şi numărul facturii.' );
        
        Object.isEmpty( formValues.data ) && this._addError( 'Completaţi data emiterii facturii.' );
        Object.isEmpty( formValues.scadenta ) && this._addError( 'Completaţi scadenţa facturii.' );
        
        Object.isEmpty( formValues.fond ) && this._addError( 'Selectaţi fondul din care se achită factura.' );

        if( ValoriValidator.isValid() )
        {
            formValues.ascensoare = ValoriValidator.getData();
        }
        else
        {
            this._addError( ValoriValidator.getError() );
        }

        return { parametri: formValues };
    }
    
});

//== SALUBRIZARE ===============================================================

var SalubrizareFormFrameClass = __FormFrameClass.extend(
{
    _setupElements_: function()
    {
        this.$repartizareSection = this.find( '.repartizare-section' );
    },
    
    _setupResources_: function()
    {
        this.DataEmiteriiField      = new DataCheltuialaClass( this.getField( 'data' ) );
        this.ScadentaField          = new ScadentaCheltuialaClass( this.getField( 'scadenta' ), { Link: this.DataEmiteriiField } );
        this.RepartizareSection     = new RepartizareAsociatieSectionClass( this.$repartizareSection.find( '.repartizare-spatii-component' ), { parametruSpatii: 'persoane' } );
        this.ReducereSection        = new SalubrizareReducereSectionClass( this.find( '.reducere-section' ) );
        
        this.Validator              = new SalubrizareValidatorClass( this );
    },
    
    _setupActions_: function()
    {
        this.setupRepartizareChangeEvent();
    },
    
    _init_: function()
    {
        this.ReducereSection.setRepartizare( this.RepartizareSection.getRepartizare() );
    },
    
    _reset_: function()
    {
        this.RepartizareSection.reset();
        this.ReducereSection.reset();
        this.ReducereSection.setRepartizare( this.RepartizareSection.getRepartizare() );
    },
    
    getValidator: function()
    {
        return this.Validator;
    },
        
    setupRepartizareChangeEvent: function()
    {
        var self = this;
        
        this.RepartizareSection.addHandler( 'change', function( event, repartizare )
        {
            self.ReducereSection.setRepartizare( repartizare );
        });
    },
    
    populateContent: function( cheltuialaData )
    {
        var parametri = cheltuialaData.parametri;
        
        this.reset();
        
        this.getField( 'descriere' ).val( parametri.descriere );
        this.getField( 'furnizor' ).val( parametri.furnizor );
        this.getField( 'act' ).val( parametri.act );
        this.getField( 'valoare' ).val( Number.formatNumber( parametri.valoare ) );
        
        this.DataEmiteriiField.setValue( parametri.data, true );
        this.ScadentaField.setValue( parametri.scadenta, true );
        
        this.RepartizareSection.setRepartizare( parametri.repartizare );
        
        this.ReducereSection.setRepartizare( parametri.repartizare );
        this.ReducereSection.setSelection( parametri.reducere );
    }
    
});

SalubrizareFormFrameClass.TIP_CHELTUIALA_ID = 'salubrizare';

//------------------------------------------------------------------------------

var SalubrizareReducereSectionClass = _Components.Container.extend(
{
    __interface: [ 'getSelection', 'setSelection', 'setRepartizare', 'hasAnswer' ],
    
    _setup_: function()
    {
        this.answer     = false;
        this.enabled    = false;
        
        this.spatii         = null;
        this.repartizare    = null;
    },
    
    _setupElements_: function()
    {
        this.$choice        = this.find( '.question :checkbox' );
        this.$answer        = this.find( '.answer' );
        this.$placeholder   = this.find( '.placeholder' );
        this.$procent       = this.find( '.procent' );
        this.$selectSpatii  = this.find( '.select-spatii' );
        this.$viewSpatii    = this.find( '.view-spatii' );
        this.$viewSpatiiButton = this.$viewSpatii.find( '.select-button' );
    },
    
    _setupActions_: function()
    {
        this.bindSelectAnswerAction();
        this.bindSelectSpatiiAction();
    },
    
    _setupResources_: function()
    {
        this.SpatiiSelectionDialog  = _Cheltuieli.SelectSpatiiDialog.getInstance();
    },
    
    _init_: function()
    {
        this.disable();
    },
    
    _reset_: function()
    {
        this.disable();
    },
    
    bindSelectAnswerAction: function()
    {
        var self = this;
        
        this.$choice.on( 'change', function()
        {
            if( self.$choice.prop( 'checked' ) )
            {
                self.showAnswer();
                self._triggerDOM( 'scrollToMe', self.getContainer() );
            }
            else
            {
                self.hideAnswer();
            }
        });
    },
    
    bindSelectSpatiiAction: function()
    {
        var self = this;
        
        this.bind( 'click', '.select-button', function()
        {
            self.openSelectSpatiiDialog();
        });
    },
    
    disable: function()
    {
        this.unhighlightChoice();
        this.disableChoice();
        
        this.showPlaceholder();
        
        this.enabled = false;
    },
    
    enable: function()
    {
        this.enableChoice();
        this.hidePlaceholder();
        
        this.enabled = true;
    },
    
    hasAnswer: function()
    {
        return this.enabled && this.answer;
    },
    
    setRepartizare: function( repartizare )
    {
        this.repartizare = repartizare;
        
        if( Object.isEmpty( repartizare ) )
        {
            this.disable();
        }
        else
        {
            this.enable();
            this.setSpatii( null );
        }
    },
    
    getRepartizare: function()
    {
        return this.repartizare;
    },
    
    setSelection: function( selection )
    {
        if( Object.isEmpty( selection ) )
        {
            this.hideAnswer();
            this.unhighlightChoice();
        }
        else
        {
            this.showAnswer();
            this.highlightChoice();
            this.setAnswer( selection );
        }
    },
    
    getSelection: function()
    {
        var selection = null;
        
        if( this.hasAnswer() )
        {
            selection = this.getAnswer();
        }
        
        return selection;
    },
    
    hideAnswer: function()
    {
        this.$answer.css( 'visibility', 'hidden' );
        
        this.answer = false;
    },
    
    showAnswer: function()
    {
        this.$answer.css( 'visibility', 'visible' );
        this.hidePlaceholder();
        
        this.resetAnswer();
        
        this.answer = true;
    },
    
    showPlaceholder: function()
    {
        this.$placeholder.show();
        this.hideAnswer();
    },
    
    hidePlaceholder: function()
    {
        this.$placeholder.hide();
    },
    
    resetAnswer: function()
    {
        this.setProcent( null );
        this.setSpatii( null );
    },
    
    getAnswer: function()
    {
        var procent   = this.getProcent(),
            spatii      = this.getSpatii();
    
        var answer = {
            procent:    procent,
            spatii:     spatii
        };
        
        return answer;
    },
    
    setAnswer: function( answer )
    {
        this.setProcent( answer.procent );
        this.setSpatii( answer.spatii );
    },
    
    getProcent: function()
    {
        var procent = this.$procent.val().trim();
        
        return procent;
    },
    
    getSpatii: function()
    {
        return this.spatii;
    },
    
    setProcent: function( procent )
    {
        this.$procent.val( procent );
    },
    
    setSpatii: function( spatii )
    {
        var persoaneCount = 0,
            filteredSpatii = {};
        
        Object.each( spatii, function( spatiuId, persoane )
        {
            var numericValue = persoane.toNumber();
            
            if( Number.isInteger( numericValue ) )
            {
                persoaneCount += numericValue;
                
                filteredSpatii[ spatiuId ] = numericValue;
            }
        });
        
        if( persoaneCount )
        {
            this.spatii = filteredSpatii;
            
            this.showViewSpatiiButton();
        }
        else
        {
            this.spatii = null;
            
            this.showSelectSpatiiButton();
        }
    },
    
    highlightChoice: function()
    {
        this.$choice.prop( 'checked', true );
    },
    
    unhighlightChoice: function()
    {
        this.$choice.prop( 'checked', false );
    },
    
    disableChoice: function()
    {
        this.$choice.prop( 'disabled', true );
    },
    
    enableChoice: function()
    {
        this.$choice.prop( 'disabled', false );
    },
    
    showSelectSpatiiButton: function()
    {
        this.$selectSpatii.show();
        this.$viewSpatii.hide();
    },
    
    showViewSpatiiButton: function()
    {
        var persoaneCount = Object.sum( this.spatii );
        
        this.$selectSpatii.hide();
        this.$viewSpatii.show();

        this.$viewSpatiiButton.text( String.pluralize( persoaneCount, 'persoană', 'persoane' ) );
    },
    
    openSelectSpatiiDialog: function()
    {
        var self = this,
            dialogOptions = {
                selection:  this.getSpatii(),
                spatii:     this.getRepartizare(),
                viewAll:    true,
                parametru:  'persoane',
                operation:  'input',
                inputCellHeader: 'Nr. pers. reducere',
                returnSpatiiList: true,
                onSelect:   function( spatii )
                {
                    self.setSpatii( spatii );
                }
            };
            
        this.SpatiiSelectionDialog.open( dialogOptions );
    }
    
});

//------------------------------------------------------------------------------

var SalubrizareValidatorClass = __FormValidatorClass.extend(
{
    _validate: function()
    {
        var formValues = this.Context.getValues();
        
        formValues.data         = this.Context.DataEmiteriiField.getValue();
        formValues.scadenta     = this.Context.ScadentaField.getValue();
        formValues.repartizare  = this.Context.RepartizareSection.getRepartizare();
        formValues.reducere     = this.Context.ReducereSection.getSelection();
        
        Object.isBlank( formValues.descriere ) && this._addError( 'Completaţi descrierea facturii.' );
        Object.isBlank( formValues.furnizor ) && this._addError( 'Completaţi denumirea furnizorului.' );
        Object.isBlank( formValues.act ) && this._addError( 'Completaţi seria şi numărul facturii.' );
        Object.isBlank( formValues.valoare ) && this._addError( 'Completaţi valoarea facturată.' );
        
        Object.isEmpty( formValues.data ) && this._addError( 'Completaţi data emiterii facturii.' );
        Object.isEmpty( formValues.scadenta ) && this._addError( 'Completaţi scadenţa facturii.' );

        if( Object.isEmpty( formValues.repartizare ) )
        {
            this._addError( 'Specificaţi apartamentele la care se repartizează factura.' );
        }
        
        if( !Object.isEmpty( formValues.reducere ) )
        {
            if( Object.isBlank( formValues.reducere.procent ) )
            {
                this._addError( 'Specificaţi reducerea procentuală.' );
            }
            
            if( Object.isEmpty( formValues.reducere.spatii ) )
            {
                this._addError( 'Specificaţi persoanele care beneficiază de reducere.' );
            }
        }
        
        var data = {
            tip_id:     SalubrizareFormFrameClass.TIP_CHELTUIALA_ID,
            parametri:  formValues
        };
        
        return data;
    }
    
});

//== GAZE NATURALE =============================================================

var GazeNaturaleFormFrameClass = __FormFrameClass.extend(
{
    _setup_: function()
    {
        this.GazeNaturaleData = DataResource.get( 'Configuration' ).getConfiguration( 'gaze_naturale' );
    },
    
    _setupResources_: function()
    {
        this.DataEmiteriiField      = new DataCheltuialaClass( this.getField( 'data' ) );
        this.ScadentaField          = new ScadentaCheltuialaClass( this.getField( 'scadenta' ), { Link: this.DataEmiteriiField } );
        this.BransamenteRenderer    = new GazeNaturaleBransamenteRendererClass( this.getField( 'bransament' ) );
        this.RepartizareSection     = new GazeNaturaleRepartizareSectionClass( this.find( '.repartizare-section' ) );
        
        this.Validator              = new GazeNaturaleValidatorClass( this );
    },
    
    _setupActions_: function()
    {
        this.setupSelectBransamentAction();
        this.bindGotoConfigAction();
    },
    
    _init_: function()
    {
        this.RepartizareSection.hide();
    },
    
    _reset_: function()
    {
        this.BransamenteRenderer.reset();
        this.RepartizareSection.hide();
    },
    
    setupSelectBransamentAction: function()
    {
        var self = this;
        
        this.BransamenteRenderer.addHandler( 'select', function( event, bransamentId )
        {
            self.autocompleteRepartizare( bransamentId );
            self._triggerDOM( 'scrollToMe', self.RepartizareSection.getContainer() );
        });
    },
    
    autocompleteRepartizare: function( bransamentId )
    {
        var bransamentData = this.GazeNaturaleData.getBransament( bransamentId );
        
        this.RepartizareSection.show();
        this.RepartizareSection.setScara( bransamentData.scara_id );
    },
    
    populateContent: function( cheltuialaData )
    {
        var parametri = cheltuialaData.parametri,
            bransamentScaraId = this.GazeNaturaleData.getBransament( parametri.bransament ).scara_id;
        
        this.reset();
        
        this.getField( 'descriere' ).val( parametri.descriere );
        this.getField( 'furnizor' ).val( parametri.furnizor );
        this.getField( 'act' ).val( parametri.act );
        this.getField( 'valoare' ).val( Number.formatNumber( parametri.valoare ) );
        
        this.DataEmiteriiField.setValue( parametri.data, true );
        this.ScadentaField.setValue( parametri.scadenta, true );
        
        this.BransamenteRenderer.setBransament( parametri.bransament );
        
        this.RepartizareSection.show();
        this.RepartizareSection.setScara( bransamentScaraId );
        this.RepartizareSection.setRepartizare( parametri.repartizare );
    },
    
    bindGotoConfigAction: function()
    {
        this.find( '.goto-config' ).on( 'click', function()
        {
            Application.command( 'open-page', 'configurare', { page: 'gaze_naturale' } );
        });
    }
    
});

GazeNaturaleFormFrameClass.TIP_CHELTUIALA_ID = 'gaze_naturale';

//------------------------------------------------------------------------------

var GazeNaturaleBransamenteRendererClass = _Components.SelectMenu.extend(
{
    __interface: [ 'setBransament', 'getBransament' ],
    
    _setup_: function()
    {
        this.GazeNaturaleData = DataResource.get( 'Configuration' ).getConfiguration( 'gaze_naturale' );
    },
    
    _setupActions_: function()
    {
        this.setupResourceEvents();
    },
    
    generateContent: function()
    {
        var self = this,
            bransamente = this.GazeNaturaleData.getBransamente(),
            iterator = function( bransament ) 
            {
                var bransamentId = bransament.id,
                    denumire = self.GazeNaturaleData.getDenumireBransament( bransamentId );
            
                return {
                    value:  bransamentId,
                    label:  denumire
                };
            };
            
        return [ bransamente, iterator ];
    },
    
    setupResourceEvents: function()
    {
        var self = this;
        
        this.GazeNaturaleData.registerObserver(
        {
            updateBransamente: function()
            {
                self.regenerate();
            }
        });
    },
    
    setBransament: function( bransamentId )
    {
        this.setValue( bransamentId );
    },
    
    getBransament: function()
    {
        return this.getValue();
    }
    
});

//------------------------------------------------------------------------------

var GazeNaturaleRepartizareSectionClass = __FormSectionClass.extend(
{
    __interface: [ 'setScara', 'setRepartizare', 'getRepartizare' ],
    
    _setupResources_: function()
    {
        this.RepartizareScara = new _Cheltuieli.RepartizareScara( this.find( '.repartizare-scara-component' ), {
            parametru: 'persoane'
        });
    },
    
    setScara: function( scaraId )
    {
        this.RepartizareScara.setScara( scaraId );
    },
    
    setRepartizare: function( repartizare )
    {
        this.RepartizareScara.setRepartizare( repartizare );
    },
    
    getRepartizare: function()
    {
        return this.RepartizareScara.getRepartizare();
    }
    
});

//------------------------------------------------------------------------------

var GazeNaturaleValidatorClass = __FormValidatorClass.extend(
{
    _validate: function()
    {
        var formValues = this.Context.getValues();
        
        formValues.data = this.Context.DataEmiteriiField.getValue();
        formValues.scadenta = this.Context.ScadentaField.getValue();
        formValues.bransament = this.Context.BransamenteRenderer.getBransament();
        
        Object.isBlank( formValues.descriere ) && this._addError( 'Completaţi descrierea facturii.' );
        Object.isBlank( formValues.furnizor ) && this._addError( 'Completaţi denumirea furnizorului.' );
        Object.isBlank( formValues.act ) && this._addError( 'Completaţi seria şi numărul facturii.' );
        Object.isBlank( formValues.valoare ) && this._addError( 'Completaţi valoarea facturată.' );
        Object.isBlank( formValues.bransament ) && this._addError( 'Selectaţi branşamentul.' );
        
        Object.isEmpty( formValues.data ) && this._addError( 'Completaţi data emiterii facturii.' );
        Object.isEmpty( formValues.scadenta ) && this._addError( 'Completaţi scadenţa facturii.' );

        if( this.Context.RepartizareSection.isActive() )
        {
            formValues.repartizare = this.Context.RepartizareSection.getRepartizare();
            
            if( Object.isEmpty( formValues.repartizare ) )
            {
                this._addError( 'Specificaţi apartamentele la care se repartizează factura.' );
            }
        }
        
        var data = {
            tip_id:     GazeNaturaleFormFrameClass.TIP_CHELTUIALA_ID,
            parametri:  formValues
        };
        
        return data;
    }
    
});

//==============================================================================

var RepartizareAsociatieSectionClass = _Cheltuieli.RepartizareAsociatie.extend(
{
    
});

//==============================================================================

var TooltipsClass = _Components.Container.extend(
{
    _init_: function()
    {
        this.getContainer().tooltip({
            tooltipClass:   'descriere-parametru-cheltuiala-tooltip',
            position:       { my: 'right top', at: 'left top' },
            show:           false,
            hide:           false
        });
    }
});

//==============================================================================

var __DataCalendarClass = _Components.Container.extend(
{
    __interface: [ 'setValue', 'getValue' ],
    
    _setup_: function()
    {
        this.datepickerOptions = null;
    },
    
    _setupResources_: function()
    {
        this.generateDatepicker();
    },
    
    generateDatepicker: function()
    {
        if( Object.isEmpty( this.datepickerOptions ) )
        {
            System.exception( ExceptionCodes.UNDEFINED_PARAMETER, { parameter: 'datepickerOptions' } );
        }
        
        var self = this,
            options = {
                onSelect: function( dateString, instance )
                {
                    self._trigger( 'select', new Date( instance.selectedYear, instance.selectedMonth, instance.selectedDay ) );
                },
                dateFormat: Date.DATE_WEEKDAY                
            };
        
        Object.extend( options, this.datepickerOptions );
        
        this.getContainer()
                .prop( 'readonly', true )
                .datepicker( options );
    },
    
    getRawValue: function()
    {
        return this.getContainer().datepicker( 'getDate' );
    },
    
    getValue: function()
    {
        var rawValue = this.getRawValue(),
            value = null;
            
        if( rawValue instanceof Date )
        {
            value = rawValue.formatISO();
        }
        
        return value;
    },
    
    setValue: function( value, triggerSelectEvent )
    {
        var dateValue = null;
        
        if( Object.isEmpty( value ) )
        {
            this.getContainer().val( '' );
        }
        else
        {
            dateValue = Date.create( value );
            this.getContainer().datepicker( 'setDate', dateValue );
        }
        
        if( triggerSelectEvent )
        {
            this._trigger( 'select', dateValue );
        }
    },
    
    setMaxDate: function( date )
    {
        this.getContainer().datepicker( 'option', 'maxDate', date );
    },
    
    setMinDate: function( date )
    {
        this.getContainer().datepicker( 'option', 'minDate', date );
    }
    
});

var DataCheltuialaClass = __DataCalendarClass.extend(
{
    _setup_: function()
    {
        this.datepickerOptions = {
            maxDate:    0,
            minDate:    '-1y'
        };
    }
});

var ScadentaCheltuialaClass = __DataCalendarClass.extend(
{
    _setup_: function()
    {
        this._setRequiredOptions( [ 'Link' ] );
        
        this.Link = this.getOption( 'Link' );
        
        this.datepickerOptions = {
            maxDate:    '+2m',
            minDate:    '-1y'
        };
    },
    
    _setupActions_: function()
    {
        var self = this;
        
        this.Link.addHandler( 'select', function( event, date )
        {
            if( date > self.getRawValue() )
            {
                self.setValue( null );
            }
            
            self.setMinDate( date );
        });
        
        this.addHandler( 'select', function( event, date )
        {
            self.Link.setMaxDate( new Date( Math.min( date, new Date() ) ) );
        });
    },
    
    _init_: function()
    {
        var linkDate = this.Link.getRawValue();
        
        if( linkDate )
        {
            this.setMinDate( linkDate );
        }
    }
});

//== REPARATII =================================================================

var ReparatiiFormFrameClass = __FormFrameClass.extend(
{
    _setup_: function()
    {
        this.FonduriData = DataResource.get( 'Fonduri' );
    },

    _setupElements_: function()
    {
        this.$fondRow                       = this.find( '.fond-section' );
        this.$repartizareProprietari        = this.find( '.repartizare-proprietari-section' );
        this.$repartizareProprietariButton  = this.find( '.repartizare-proprietari-checkbox' );
        this.$coloana                       = this.find( '.coloana-section' );
        this.$coloanaValue                  = this.$coloana.find( '.field-container' );
    },
    
    _setupResources_: function()
    {
        this.DataField          = new DataCheltuialaClass( this.getField( 'data' ) );
        this.FonduriRenderer    = new ReparatiiFonduriRendererClass( this.getField( 'fond' ) );
        this.RepartizareSection = new RepartizareAsociatieSectionClass( this.find( '.repartizare-section' ), { parametruSpatii: 'suprafata' } );
        
        this.Validator          = new ReparatiiValidatorClass( this );
    },
    
    _setupActions_: function()
    {
        this.setupChangeFondEvent();
        this.setupCheckRepartizareProprietariEvent();
    },
    
    _init_: function()
    {
        this.displayFondDependencies();
    },
    
    _reset_: function()
    {
        this.FonduriRenderer.reset();
        this.$repartizareProprietariButton.prop( 'checked', false );
        this.RepartizareSection.reset();
        this.displayFondDependencies();
    },
    
    getValidator: function()
    {
        return this.Validator;
    },
        
    populateContent: function( cheltuialaData )
    {
        var parametri = cheltuialaData.parametri;
        
        this.reset();
        
        this.getField( 'descriere' ).val( parametri.descriere );
        this.getField( 'furnizor' ).val( parametri.furnizor );
        this.getField( 'act' ).val( parametri.act );
        this.getField( 'valoare' ).val( Number.formatNumber( parametri.valoare ) );
        
        this.DataField.setValue( parametri.data );
        
        this.FonduriRenderer.setFond( parametri.fond );
        
        var repartizareExists = ( parametri.repartizare !== undefined );
        
        this.$repartizareProprietariButton.prop( 'checked', repartizareExists );
        
        this.displayFondDependencies();
        
        if( repartizareExists )
        {
            this.RepartizareSection.setRepartizare( parametri.repartizare );
        }
    },
    
    setupChangeFondEvent: function()
    {
        var self = this;
        
        this.FonduriRenderer.addHandler( 'select', function()
        {
            self.displayFondDependencies();
            
            self._triggerDOM( 'scrollToMe', self.$fondRow );
        });
    },
    
    displayFondDependencies: function()
    {
        var fondId = this.FonduriRenderer.getFond();
        
        if( Object.isEmpty( fondId ) )
        {
            this.hideFondDependencies();
        }
        else if( this.FonduriData.isRepartizareMandatory( fondId ) )
        {
            this.$repartizareProprietari.hide();
            
            this.$coloana.show();
            this.$coloanaValue.text( this.FonduriData.getDenumireFond( fondId ) );
            
            this.displayRepartizareSection();
        }
        else if( this.FonduriData.isRepartizareOptional( fondId ) )
        {
            this.$repartizareProprietari.show();
            
            if( this.isRepartizareProprietariChecked() )
            {
                this.$coloana.show();
                this.$coloanaValue.text( this.FonduriData.getDenumireFond( fondId ) );
                
                this.displayRepartizareSection();
            }
            else
            {
                this.$coloana.hide();
                
                this.hideRepartizareSection();
            }
        }
        else
        {
            this.hideFondDependencies();
        }
    },
    
    hideFondDependencies: function()
    {
        this.$repartizareProprietari.hide();
        this.$coloana.hide();
        this.hideRepartizareSection();
    },
    
    isRepartizareProprietariChecked: function()
    {
        var checked = this.$repartizareProprietariButton.prop( 'checked' );
        
        return checked;
    },
    
    displayRepartizareSection: function()
    {
        this.RepartizareSection.show();
    },
    
    hideRepartizareSection: function()
    {
        this.RepartizareSection.hide();
    },
    
    setupCheckRepartizareProprietariEvent: function()
    {
        var self = this;
        
        this.$repartizareProprietariButton.on( 'change', function()
        {
            self.displayFondDependencies();
            self._triggerDOM( 'scrollToMe', self.$repartizareProprietari );
        });
    }
    
});

ReparatiiFormFrameClass.TIP_CHELTUIALA_ID = 'reparatie';

//------------------------------------------------------------------------------

var ReparatiiFonduriRendererClass = FonduriRendererClass.extend(
{
    getFonduriData: function()
    {
        var self = this,
            fonduri = this._super(),
            data = [];
    
        Object.each( fonduri, function( i, fondData )
        {
            if( !self.FonduriData.isIntretinere( fondData.id ) )
            {
                data.push( fondData );
            }
        });
        
        return data;
    }
});

//------------------------------------------------------------------------------

var ReparatiiValidatorClass = __FormValidatorClass.extend(
{
    _validate: function()
    {
        var formValues = this.Context.getValues();
        
        formValues.data = this.Context.DataField.getValue();
        formValues.fond = this.Context.FonduriRenderer.getFond();
        
        Object.isBlank( formValues.descriere ) && this._addError( 'Completaţi descrierea cheltuielii.' );
        Object.isBlank( formValues.furnizor ) && this._addError( 'Completaţi denumirea furnizorului.' );
        Object.isBlank( formValues.act ) && this._addError( 'Completaţi documentul justificativ.' );
        Object.isEmpty( formValues.data ) && this._addError( 'Completaţi data cheltuielii.' );
        Object.isBlank( formValues.valoare ) && this._addError( 'Completaţi valoarea cheltuielii.' );
        Object.isEmpty( formValues.fond ) && this._addError( 'Selectaţi fondul din care se achită cheltuiala.' );
        
        if( this.Context.RepartizareSection.isVisible() )
        {
            formValues.repartizare = this.Context.RepartizareSection.getRepartizare();
            
            if( Object.isEmpty( formValues.repartizare ) )
            {
                this._addError( 'Specificaţi apartamentele la care se repartizează cheltuiala.' );
            }
        }
        
        var data = {
            tip_id:     ReparatiiFormFrameClass.TIP_CHELTUIALA_ID,
            parametri:  formValues
        };
        
        return data;
    }
    
});

//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

_Cheltuieli.__TipCheltuialaForm     = __FormFrameClass;

_Cheltuieli.CheltuieliGospodarestiForm = CheltuieliGospodarestiFormFrameClass;
_Cheltuieli.SalariiForm             = SalariiFormFrameClass;
_Cheltuieli.EnergieElectricaForm    = EnergieElectricaFormFrameClass;
_Cheltuieli.AscensoareForm          = AscensoareFormFrameClass;
_Cheltuieli.SalubrizareForm         = SalubrizareFormFrameClass;
_Cheltuieli.GazeNaturaleForm        = GazeNaturaleFormFrameClass;
_Cheltuieli.ReparatiiForm           = ReparatiiFormFrameClass;

})();
