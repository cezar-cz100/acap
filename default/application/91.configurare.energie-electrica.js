(function(){
    
var EnergieElectricaPageClass = _Components.Container.extend(
{
    _setupResources_: function()
    {
        this.ContoareSection = new ContoareSectionClass( this.find( '>.contoare-section' ) );
    }
    
});

//==============================================================================

var ContoareSectionClass = _Components.Container.extend(
{
    _setup_: function()
    {
        this.EnergieElectricaData = DataResource.get( 'Configuration' ).getConfiguration( 'energie_electrica' );
    },
    
    _setupResources_: function()
    {
        this.ContoareListRenderer   = new ContoareListRendererClass( this.find( '.contoare-list-frame' ) );
        this.AddContorDialog        = AddContorDialogClass.getInstance();
    },
    
    _setupElements_: function()
    {
        this.$counterText   = this.find( '.counter-text' );
        this.$addButton     = this.find( '.add-contor-button' );
    },
    
    _setupActions_: function()
    {
        this.setupResourceEvents();
    },
    
    _init_: function()
    {
        this.setupCountText();
        this.bindAddButtonAction();
    },
    
    setupCountText: function()
    {
        var contoareCount = this.EnergieElectricaData.getContoareCount(),
            text;
        
        if( contoareCount )
        {
            text = 'Există {count} de energie electrică.'.assign( { count: String.pluralize( contoareCount, 'contor', 'contoare' ) } );
            this.$counterText.removeClass( 'alert-text' );
        }
        else
        {
            text = 'Nu există niciun contor de energie electrică. Puteţi înregistra facturi pentru energia electrică doar dacă există cel puţin un contor.';
            this.$counterText.addClass( 'alert-text' );
        }
        
        this.$counterText.text( text );
    },
    
    bindAddButtonAction: function()
    {
        var self = this;
        
        this.$addButton.on( 'click', function()
        {
            self.addContor();
        });
    },
    
    addContor: function()
    {
        this.AddContorDialog.open();
    },
    
    setupResourceEvents: function()
    {
        var self = this;
        
        this.EnergieElectricaData.registerObserver({
            'addContor removeContor': function()
            {
                self.setupCountText();
            }
        });
    }
    
});

//------------------------------------------------------------------------------

var ContoareListRendererClass = _Components.Container.extend(
{
    _setup_: function()
    {
        this.EnergieElectricaData = DataResource.get( 'Configuration' ).getConfiguration( 'energie_electrica' );
        this.contorItemsCount = 0;
        this.contorItems = {};
    },
    
    _setupElements_: function()
    {
        this.$listContainer = this.find( '.list-content' );
    },
    
    _setupActions_: function()
    {
        this.setupResourceEvents();
    },
    
    _init_: function()
    {
        this.generateContent();
    },
    
    generateContent: function()
    {
        var self = this,
            contoare = this.EnergieElectricaData.getContoare();
        
        this.$listContainer.empty();
        
        if( Object.size( contoare ) )
        {
            this.show();
            
            Object.each( contoare, function( i, contor )
            {
                self.addContorItem( contor );
            });
        }
        else
        {
            this.hide();
        }
    },
    
    addContorItem: function( contor )
    {
        if( this.contorItems[ contor.id ] ) return;
            
        var $template = this._getTemplate( 'contor' ),
            Contor = new ContorItemClass( $template, {
                data: contor
            });

        Contor.getContainer().appendTo( this.$listContainer );
        this.contorItems[ contor.id ] = Contor;
        
        if( this.contorItemsCount == 0 )
        {
            this.show();
        }
        
        this.contorItemsCount++;
    },
    
    removeContorItem: function( contorId )
    {
        if( !this.contorItems[ contorId ] ) return;
        
        var ContorItem = this.contorItems[ contorId ];
        ContorItem.getContainer().remove();
        delete this.contorItems[ contorId ];
        
        this.contorItemsCount--;
        
        if( this.contorItemsCount == 0 )
        {
            this.hide();
        }
    },
    
    setupResourceEvents: function()
    {
        var self = this;
        
        this.EnergieElectricaData.registerObserver({
            addContor: function( contorData )
            {
                self.addContorItem( contorData );
            },
            removeContor: function( contorId )
            {
                self.removeContorItem( contorId );
            }
        });
    }
    
});

//------------------------------------------------------------------------------

var ContorItemClass = _Components.Container.extend(
{
    _setup_: function()
    {
        this._setRequiredOptions( [ 'data' ] );
        
        this.contorId = null;
        
        this.StructuraData = DataResource.get( 'Structura' );
        this.EnergieElectricaData = DataResource.get( 'Configuration' ).getConfiguration( 'energie_electrica' );
    },
    
    _setupElements_: function()
    {
        this.$editButton = this.find( '.edit-button' );
    },
    
    _setupActions_: function()
    {
        this.setupEnergieElectricaDataEvents();
        this.bindEditButtonAction();
    },
    
    _setupResources_: function()
    {
        this.EditContorDialog = EditContorDialogClass.getInstance();
    },
    
    _init_: function()
    {
        this.populateContent( this.getOption( 'data' ) );
    },
    
    populateContent: function( contorData )
    {
        this.contorData = contorData;
        
        var $denumireLine = this.find( '.denumire-line' ),
            $denumire = $denumireLine.find( '.denumire' ),
            $scari = $denumireLine.find( '.scari-deservite' ),
            scariDeservite = this.generateScariDeserviteText( contorData );
        
        this.contorId = contorData.id;
        
        $denumire.text( contorData.denumire.upperCaseFirst() );
        $scari.text( scariDeservite );
        
        this.populateScutiri( contorData );
    },

    generateScariDeserviteText: function( contor )
    {
        var self = this,
            denumiriScari,
            text = '';
        
        denumiriScari = contor.scari.map( function( scaraId )
        {
            return self.StructuraData.getDenumireScara( scaraId );
        });
        
        text = denumiriScari.join( '; ' );
        
        return text;
    },
    
    populateScutiri: function( contorData )
    {
        var self = this,
            $scutiri = this.find( '.scutiri' ),
            scutiri = contorData.scutiri;
        
        $scutiri.empty();
        
        Object.each( scutiri, function( i, instalatie )
        {
            var $template = self._getTemplate( 'instalatie' );

            self.populateInstalatie( $template, instalatie );
            
            $template.appendTo( $scutiri );
        });
    },
    
    populateInstalatie: function( $instalatie, instalatie )
    {
        var text = this.EnergieElectricaData.generateContorScutireText( instalatie );
        
        $instalatie.text( text );
    },
    
    setupEnergieElectricaDataEvents: function()
    {
        var self = this;
        
        this.EnergieElectricaData.registerObserver({
            editContor: function ( contor )
            {
                if ( self.contorId == contor.id )
                {
                    self.doEditContor( contor );
                }
            }
        });
    },
    
    bindEditButtonAction: function()
    {
        var self = this;
        
        this.$editButton.on( 'click', function()
        {
            self.editContor();
        });
    },
    
    editContor: function()
    {
        this.EditContorDialog.open({
            contorData: this.contorData
        });
    },
    
    doEditContor: function( contorData )
    {
        this.populateContent( contorData );
    }
        
});

//==============================================================================

var AddContorDialogClass = _Application.OperatingDialog.extend(
{
    _setupResources_: function()
    {
        this.ContorForm = new ContorFormClass( this.find( '.contor-energie_electrica-form' ) );
    },
    
    _reset_: function()
    {
        this.ContorForm.reset();
    },
    
    _doAction: function()
    {
        var Validator = this.ContorForm.getValidator();
        
        if( Validator.isValid() )
        {
            this.submitData( Validator.getData() );
        }
        else
        {
            this.showError( Validator.getError() );
        }
    },
    
    submitData: function( contorData )
    {
        var self = this;
        
        DataResource.get( 'Configuration' ).getConfiguration( 'energie_electrica' ).addContor( contorData, {
            onSuccess: function()
            {
                self.reset();
            }
        });
    }
    
});

_Components.Class.Singleton( AddContorDialogClass, function() {
    return [ $( '#add-contor-energie_electrica-dialog' ) ];
});

//==============================================================================

var ContorFormClass = _Components.Container.extend(
{
    __interface: [ 'getValidator', 'populate' ],
    
    _setup_: function()
    {
        this.selectScariMessage = this.find( '.select-scari-message' ).text();
    },
    
    _setupElements_: function()
    {
        this.$denumire = this.find( 'input.denumire-contor' );
    },
    
    _setupResources_: function()
    {
        this.ScariListRenderer      = new ContorFormScariListRendererClass( this.find( '.form-element.scari .scari-list' ) );
        this.ScutiriSection         = new ContorFormScutiriSectionClass( this.find( '.form-element.scutire' ), {
                selectScariMessage: this.selectScariMessage
        });
        
        this.Validator              = new ContorFormValidatorClass( this );
    },
    
    _setupActions_: function()
    {
        this.setupSelectScariEventHandler();
    },
    
    _reset_: function()
    {
        this.clearDenumire();
        this.ScariListRenderer.reset();
        this.ScutiriSection.reset();
    },
    
    setupSelectScariEventHandler: function()
    {
        var self = this;
        
        this.ScariListRenderer.addHandler( 'select', function( event, scari )
        {
            self.ScutiriSection.setScari( scari );
        });
    },
    
    clearDenumire: function()
    {
        this.$denumire.val( '' );
    },
    
    setDenumire: function( denumire )
    {
        this.$denumire.val( denumire );
    },
    
    getValidator: function()
    {
        return this.Validator;
    },
    
    populate: function( values )
    {
        this.setDenumire( values.denumire );
        this.setScari( values.scari );
        this.setScutiri( values.scutiri );
    },
    
    setScari: function( scari )
    {
        this.ScariListRenderer.setScari( scari );
        this.ScutiriSection.setScari( scari );
    },
    
    setScutiri: function( scutiri )
    {
        this.ScutiriSection.setScutiri( scutiri );
    }
    
});

//------------------------------------------------------------------------------

var ContorFormScariListRendererClass = _Components.Container.extend(
{
    __interface: [ 'setScari' ],
    
    _setup_: function()
    {
        this.StructuraData = DataResource.get( 'Structura' );
        this.scari = {};
    },
    
    _setupActions_: function()
    {
        this.setupSelectScaraEventHandler();
        this.setupResourceEvents();
    },
    
    _init_: function()
    {
        this.render();
    },
    
    _reset_: function()
    {
        this.clearSelection();
    },
    
    render: function()
    {
        var self = this,
            scariIds = this.StructuraData.getScariIds(),
            scariIdsReorderedIndexes = [],
            columns = 2,
            width = ( 100 / columns ).floor() + '%',
            step = ( scariIds.length / columns ).ceil();
        
        for( var i = 0; i < step; i++ )
        {
            for( var j = 0; j < columns; j++ )
            {
                var k = i + j * step;
                
                if( scariIds[ k ] === undefined )
                {
                    break;
                }
                else
                {
                    scariIdsReorderedIndexes.push( k );
                }
            }
        }
        
        this.getContainer().empty();
        
        Object.each( scariIdsReorderedIndexes, function( i, index )
        {
            var scaraId = scariIds[ index ],
                $template = self._getTemplate( 'scara' ),
                denumireScara = self.StructuraData.getDenumireScara( scaraId );
            
            $template.find( 'input.select-scara' ).val( scaraId );
            $template.find( '.denumire-scara' ).text( denumireScara );
            $template.width( width );
                    
            $template.appendTo( self.getContainer() );
        });
    },

    setupResourceEvents: function()
    {
        var self = this;
        
        this.StructuraData.registerObserver(
        {
            'addBloc editBloc removeBloc addScara editScara removeScara': function()
            {
                self.render();
            }
        });
    },
    
    setupSelectScaraEventHandler: function()
    {
        var self = this;
        
        this.bind( 'change', 'input.select-scara', function()
        {
            var $input = $(this),
                scaraId = $input.val();
                
            if( $input.prop( 'checked' ) )
            {
                self.scari[ scaraId ] = scaraId;
            }
            else
            {
                self.scari[ scaraId ] && delete self.scari[ scaraId ];
            }
            
            var selectedScari = Object.values( self.scari );
            
            self._trigger( 'select', selectedScari );
        });
        
    },
    
    getCheckboxes: function()
    {
        var $checkboxes = this.find( 'input.select-scara' );
        
        return $checkboxes;
    },
    
    clearSelection: function()
    {
        this.scari = {};
        this.getCheckboxes().prop( 'checked', false );
    },
    
    setScari: function( scari )
    {
        var self = this,
            $checkboxes = this.getCheckboxes();
        
        $checkboxes.each( function()
        {
            var $checkbox = $(this),
                scaraId = $checkbox.val();
            
            if( scari.contains( scaraId ) )
            {
                $checkbox.prop( 'checked', true );
                self.scari[ scaraId ] = scaraId;
            }
            else
            {
                $checkbox.prop( 'checked', false );
                self.scari[ scaraId ] && delete self.scari[ scaraId ];
            }
        });
    }
    
});

//------------------------------------------------------------------------------

var ContorFormScutiriSectionClass = _Components.Container.extend(
{
    __interface: [ 'setScari', 'getValidator', 'setScutiri' ],
    
    _setup_: function()
    {
        this.instalatiiCount = 0;
        this.maxInstalatiiCount = 5;
        
        this.selectedScari = [];
        this.Instalatii = [];
        
        this.selectScariMessage = this.getOption( 'selectScariMessage' );
    },
    
    _setupElements_: function()
    {
        this.$answer        = this.find( '.scutire-check' );
        this.$answerData    = this.find( '.scutire-data' );
        this.$addInstalatie = this.find( '.add-instalatie' );
        this.$addInstalatieWrapper = this.find( '.add-instalatie-wrapper' );
        this.$instalatiiList = this.find( '.instalatii-list' );
    },
    
    _setupActions_: function()
    {
        this.bindCheckAnswerAction();
        this.bindAddInstalatieAction();
    },
    
    _setupResources_: function()
    {
        this.Validator = new ContorFormScutireValidatorClass( this );
    },
    
    _init_: function()
    {
        this.hideAnswerData();
        this.addInstalatie();
    },
    
    _reset_: function()
    {
        this.hideAnswerData();
        this.removeAllInstalatii();
        this.addInstalatie();
    },
    
    hideAnswerData: function()
    {
        this.$answerData.hide();
        this.$answer.filter( '[value=0]' ).prop( 'checked', true );
    },
    
    showAnswerData: function()
    {
        this.$answerData.show();
        this.$answer.filter( '[value=1]' ).prop( 'checked', true );
    },
    
    bindCheckAnswerAction: function()
    {
        var self = this;
        
        this.$answer.on( 'change', function()
        {
            if( $(this).val() - 0 )
            {
                self.showAnswerData();
            }
            else
            {
                self.hideAnswerData();
            }
        });
    },
    
    bindAddInstalatieAction: function()
    {
        var self = this;
        
        this.$addInstalatie.on( 'click', function()
        {
            self.addInstalatie();
        });
    },
    
    addInstalatie: function( instalatieData )
    {
        if( this.instalatiiCount >= this.maxInstalatiiCount )
        {
            return;
        }
        else
        {
            var self = this,
                $template = this._getTemplate( 'instalatie-form' ),
                InstalatieForm = new ContorFormInstalatieFormClass( $template, {
                        selectScariMessage: this.selectScariMessage,
                        selectedScari:      this.selectedScari,
                        instalatieData:     instalatieData,
                        onRemove: function()
                        {
                            self.removeInstalatie( this );
                        }
                });
            
            this.Instalatii.push( InstalatieForm );
            $template.appendTo( this.$instalatiiList );
            
            this.instalatiiCount++;
            
            if( this.instalatiiCount == 1 )
            {
                this.disableInstalatiiRemove();
            }
            else
            {
                this.enableInstalatiiRemove();
            }
            
            if( this.instalatiiCount >= this.maxInstalatiiCount )
            {
                this.hideAddInstalatieButton();
            }
            
        }
    },
    
    removeInstalatie: function( Instalatie )
    {
        this.Instalatii.remove( Instalatie );
        Instalatie.getContainer().remove();
        
        this.instalatiiCount--;
        
        if( this.instalatiiCount == 1 )
        {
            this.disableInstalatiiRemove();
        }
        else
        {
            this.enableInstalatiiRemove();
        }

        if( this.instalatiiCount < this.maxInstalatiiCount )
        {
            this.showAddInstalatieButton();
        }
    },
    
    removeAllInstalatii: function()
    {
        var self = this;
        
        Object.each( Object.clone( this.Instalatii ), function( i, Instalatie )
        {
            self.removeInstalatie( Instalatie );
        });
    },
    
    hideAddInstalatieButton: function()
    {
        this.$addInstalatieWrapper.hide();
    },
    
    showAddInstalatieButton: function()
    {
        this.$addInstalatieWrapper.show();
    },
    
    setScari: function( scari )
    {
        this.selectedScari = scari;
        
        Object.each( this.Instalatii, function( i, Instalatie )
        {
            Instalatie.setScari( scari );
        });
    },
    
    getValidator: function()
    {
        return this.Validator;
    },
    
    disableInstalatiiRemove: function()
    {
        Object.each( this.Instalatii, function( i, Instalatie )
        {
            Instalatie.disableRemove();
        });
    },
    
    enableInstalatiiRemove: function()
    {
        Object.each( this.Instalatii, function( i, Instalatie )
        {
            Instalatie.enableRemove();
        });
    },
    
    setScutiri: function( scutiri )
    {
        if( Object.isEmpty( scutiri ) )
        {
            this.reset();
        }
        else
        {
            var self = this;
            
            this.showAnswerData();
            this.removeAllInstalatii();
            
            Object.each( scutiri, function( i, instalatie )
            {
                self.addInstalatie( instalatie );
            });
        }
    }
    
});

//------------------------------------------------------------------------------

var ContorFormScutireValidatorClass = _Components.DataValidator.extend(
{
    _validate: function()
    {
        var self = this;
        
        if( this.scutiriExist() )
        {
            var scutiriData = [],
                index = 0,
                totalProcent = 0,
                denumiri = [];
            
            Object.each( this.Context.Instalatii, function( i, Instalatie )
            {
                index++;
                
                var Validator = Instalatie.getValidator();
                
                if( Validator.isValid() )
                {
                    var instalatieData = Validator.getData(),
                        denumireInstalatie = instalatieData.denumire.trim().toLowerCase();

                    if( denumiri.contains( denumireInstalatie ) )
                    {
                        var message = 'Denumirea completată este deja folosită (pentru {ordinal} instalaţie)'.assign( { ordinal: String.ordinal( index, true ) } );

                        self._setError( message );
                    }

                    scutiriData.push( instalatieData );

                    denumiri.push( denumireInstalatie );
                    totalProcent += Number.toNumber( instalatieData.procent );
                }
                else
                {
                    var error = Validator.getError();
                    
                    message = error + 
                            ( Object.size( self.Context.Instalatii ) > 1 ? 
                                    ' (pentru {ordinal} instalaţie)'.assign( { ordinal: String.ordinal( index, true ) } ) :
                                    '' );
                    
                    self._setError( message );
                }
            });
            
            if( Object.isEmpty( scutiriData ) )
            {
                this._setError( 'Completaţi datele pentru cel puţin o instalaţie.' );
            }
            else if( totalProcent > 100 )
            {
                this._setError( 'Suma valorilor procentuale estimate este de {total}%, însă aceasta nu trebuie să depăşească valoarea de 100%.'.assign( { total: totalProcent } ) );
            }
            else
            {
                this._setData( scutiriData );
            }
        }
        else
        {
            this._setData( null );
        }
    },
    
    scutiriExist: function()
    {
        var exist = Object.toBoolean( this.Context.$answer.filter( ':checked' ).val().toNumber() );
        
        return exist;
    }
    
});

//------------------------------------------------------------------------------

var ContorFormInstalatieFormClass = _Components.Container.extend(
{
    __interface: [ 'setScari', 'getValidator', 'getSpatii', 'getDenumire', 'getProcent', 'enableRemove', 'disableRemove', 'populate' ],
    
    _setup_: function()
    {
        this.scariContor = this.getOption( 'selectedScari', [] );
        this.spatii = [];
    },
    
    _setupElements_: function()
    {
        this.$selectSpatii = this.find( '.select-spatii' );
        
        this.$selectSpatiiText = this.$selectSpatii.find( '.select-text' );
        this.$selectSpatiiSummary = this.$selectSpatii.find( '.select-summary' );
        
        this.$removeButtonWrapper = this.find( '.remove-button-wrapper' );
        this.$removeButton = this.find( '.remove-instalatie-button' );
        
        this.$denumire = this.find( 'input.denumire-instalatie' );
        this.$procent = this.find( 'input.valoare-estimata-instalatie' );
    },
    
    _setupActions_: function()
    {
        this.bindSelectSpatiiAction();
        this.bindRemoveInstalatieAction();
    },
    
    _setupResources_: function()
    {
        this.SpatiiSelection = new _Cheltuieli.SelectSpatiiDialog.getInstance();
        this.Validator = new ContorFormInstalatieFormValidatorClass( this );
        
        new _Components.Tooltip( this );
    },
    
    _init_: function()
    {
        this.showSelectSpatiiText();
    },
    
    _parameters_: function( params )
    {
        if( params.instalatieData !== undefined )
        {
            this.populate( params.instalatieData );
        }
    },
    
    bindSelectSpatiiAction: function()
    {
        var self = this;
        
        this.$selectSpatii.on( 'click', function()
        {
            self.selectSpatii();
        });
    },
    
    selectSpatii: function()
    {
        var self = this,
            scari = this.getScari(),
            spatii = this.getSpatii(),
            repartizareScari;
    
        if( Object.isEmpty( scari ) )
        {
            System.alert( this.getSelectScariMessage() );
        }
        else
        {
            repartizareScari = { scari: scari };

            this.SpatiiSelection.open({
                selection:  spatii,
                spatii:     repartizareScari,
                viewAll:    true,
                parametru:  'persoane',
                operation:  'select',
                returnSpatiiList: true,
                onSelect:   function( spatii )
                {
                    self.setSpatii( spatii );
                }
            });
        }
    },
    
    getSelectScariMessage: function()
    {
        var message = this.getOption( 'selectScariMessage' );
        
        if( Object.isBlank( message ) )
        {
            System.exception( ExceptionCodes.UNDEFINED_PARAMETER, { parameter: 'selectScariMessage' } );
        }
        
        return message;
    },
    
    getScari: function()
    {
        return this.scariContor;
    },
    
    setSpatii: function( spatii )
    {
        this.spatii = spatii;
        
        if( Object.isEmpty( spatii ) )
        {
            this.showSelectSpatiiText();
        }
        else
        {
            var spatiiCount = Object.size( spatii ),
                persoaneCount = DataResource.get( 'Structura' ).getPersoaneCount( spatii ),
                summaryText = '{persoane} {spatii} {predicat} de la plata consumului'.assign({
                    persoane:   String.pluralize( persoaneCount, 'persoană', 'persoane' ),
                    spatii:     spatiiCount == 1 ? 'dintr-un apartament' : ( 'din ' + String.pluralize( spatiiCount, 'apartament', 'apartamente' ) ),
                    predicat:   persoaneCount == 1 ? 'este scutită' : 'sunt scutite'
            });
            
            this.showSelectSpatiiSummary( summaryText );
        }
    },
    
    getSpatii: function()
    {
        return this.spatii;
    },
    
    showSelectSpatiiText: function()
    {
        this.$selectSpatiiText.show();
        this.$selectSpatiiSummary.hide();
    },
    
    showSelectSpatiiSummary: function( summaryText )
    {
        this.$selectSpatiiText.hide();
        
        this.$selectSpatiiSummary
                .show()
                .text( summaryText );
    },
    
    setScari: function( scari )
    {
        this.scariContor = scari;
        this.setSpatii( null );
    },
    
    getDenumire: function()
    {
        var denumire = this.$denumire.val();
        
        return denumire;
    },
    
    setDenumire: function( denumire )
    {
        this.$denumire.val( denumire );
    },
    
    getProcent: function()
    {
        var procent = this.find( 'input.valoare-estimata-instalatie' ).val();
        
        return procent;
    },
    
    setProcent: function( procent )
    {
        this.$procent.val( procent );
    },
    
    getValidator: function()
    {
        return this.Validator;
    },
    
    bindRemoveInstalatieAction: function()
    {
        var self = this;
        
        this.$removeButton.on( 'click', function()
        {
            self.removeInstalatie();
        });
    },
    
    removeInstalatie: function()
    {
        this.getContainer().remove();
        
        this._trigger( 'remove' );
    },
    
    disableRemove: function()
    {
        this.$removeButtonWrapper.hide();
    },
    
    enableRemove: function()
    {
        this.$removeButtonWrapper.show();
    },
    
    populate: function( data )
    {
        this.setDenumire( data.denumire );
        this.setProcent( data.procent );
        this.setSpatii( data.spatii );
    }
    
});

//------------------------------------------------------------------------------

var ContorFormInstalatieFormValidatorClass = _Components.DataValidator.extend(
{
    _validate: function()
    {
        var denumire = this.Context.getDenumire(),
            procent = this.Context.getProcent(),
            spatii = this.Context.getSpatii();
    
        var data = {};

            if( Object.isBlank( denumire ) )
        {
            this._setError( 'Specificaţi denumirea instalaţiei' );
        }
        else
        {
            data.denumire = denumire;
        }

            if( Object.isBlank( procent ) )
        {
            this._setError( 'Specificaţi valoarea estimată a consumului instalaţiei' );
        }
        else
        {
            var numericValue = Number.toNumber( procent );

            if( !numericValue || numericValue <= 0 || numericValue >= 100 || !Number.isInteger( numericValue ) )
            {
                this._setError( 'Valoarea estimată a consumului trebuie să fie un număr întreg între 1 şi 99' );
            }
            else
            {
                data.procent = numericValue;
            }
        }

            if( Object.isEmpty( spatii ) )
        {
            this._setError( this.Context.$selectSpatiiText.text() );
        }
        else
        {
            data.spatii = spatii;
        }

        this._setData( data );
    }
});

//------------------------------------------------------------------------------

var ContorFormValidatorClass = _Components.DataValidator.extend(
{
    _validate: function()
    {
        var contorData = {},
            $denumireContor = this.Context.find( 'input.denumire-contor' ),
            denumireContor,
            $scari = this.Context.find( 'input.select-scara' ),
            scariValues;
        
        // denumire contor
        
        denumireContor = $denumireContor.val();
        
        if( Object.isBlank( denumireContor ) )
        {
            this._setError( 'Specificaţi denumirea contorului.' );
            
            return;
        }
        
        contorData.denumire = denumireContor;
        
        // scari selectate
        
        scariValues = $scari.filter( ':checked' ).map( function(){
                return $(this).val();
        }).get();

        if( Object.isEmpty( scariValues ) )
        {
            this._setError( 'Specificaţi scara sau scările deservite.' );
            
            return;
        }        
        
        contorData.scari = scariValues;
        
        // scutiri
        
        var ScutiriValidator = this.Context.ScutiriSection.getValidator();
        
        if( ScutiriValidator.isValid() )
        {
            var scutireData = ScutiriValidator.getData();
            
            if( !Object.isEmpty( scutireData ) )
            {
                contorData.scutiri = scutireData;
            }
        }
        else
        {
            this._setError( ScutiriValidator.getError() );
            
            return;
        }
        
        // -end-
        this._setData( contorData );
    }
    
});

//==============================================================================

var EditContorDialogClass = _Application.OperatingDialog.extend(
{
    _setup_: function()
    {
        this.contorId = null;
        
        this.contorData = null;
    },
    
    _setupResources_: function()
    {
        this.ContorForm = new ContorFormClass( this.find( '.contor-energie_electrica-form' ) );
    },
    
    _setupElements_: function()
    {
        this.$removeButton = this.find( '.delete-button' );
    },
    
    _setupActions_: function()
    {
        this.setupRemoveContorAction();
    },
    
    _open_: function( options )
    {
        if( options.contorData === undefined )
        {
            System.exception( ExceptionCodes.UNDEFINED_PARAMETER, { parameter: 'data' } );
        }
        
        this.ContorForm.populate( options.contorData );
        
        this.ContorForm.getValidator().isValid() && ( this.contorData = this.ContorForm.getValidator().getData() );
        
        this.contorId = options.contorData.id;
    },
    
    _doAction: function()
    {
        var Validator = this.ContorForm.getValidator();
        
        if( Validator.isValid() )
        {
            var contorData = Validator.getData(),
                contorDataCopy = Object.clone( contorData );
            
            if( !Object.equal( contorData, this.contorData ) )
            {
                this.doSaveAction( contorData, function(){
                    this.contorData = contorDataCopy;
                });
            }
            else
            {
                this.close();
            }
        }
        else
        {
            this.showError( Validator.getError() );
        }
    },
    
    doSaveAction: function( contorData, onSuccess )
    {
        var self = this;
        
        contorData.id = this.contorId;

        DataResource.get( 'Configuration' ).getConfiguration( 'energie_electrica' ).editContor( contorData, {
            onSuccess: function()
            {
                Object.isFunction( onSuccess ) && onSuccess.call( self );
                self.close();
            }
        });
    },
    
    setupRemoveContorAction: function()
    {
        var self = this;
        
        this.$removeButton.on( 'click', function()
        {
            self.removeContor();
        });
    },
    
    removeContor: function()
    {
        var self = this;
        
        System.confirm( 'Doriţi să eliminaţi acest contor?', {
            yes: function()
            {
                self.doRemoveContor( function()
                {
                    self.close();
                });
            }
        });
    },
    
    doRemoveContor: function( onSuccess )
    {
        var self = this;
        
        DataResource.get( 'Configuration' ).getConfiguration( 'energie_electrica' ).removeContor( this.getContorId(), {
            onSuccess: function()
            {
                Object.isFunction( onSuccess ) && onSuccess.call( self );
                self.close();
            }
        });
        
    },
    
    getContorId: function()
    {
        return this.contorId;
    }
    
});

_Components.Class.Singleton( EditContorDialogClass, function() {
    return [ $( '#edit-contor-energie_electrica-dialog' ) ];
});

//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

_Configurare.EnergieElectrica = EnergieElectricaPageClass;

})();